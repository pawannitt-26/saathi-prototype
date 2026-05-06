"""WebSocket call session: STT → Claude → TTS with FSM + scoring."""

from __future__ import annotations

import base64
import logging
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.conversation.context import LeadConversationContext, phase_instruction
from app.conversation.fsm import apply_heuristic_context_update, infer_transition
from app.db import SessionLocal
from app.models import Call, CallPhase, CallStatus, Lead, TranscriptTurn
from app.prompts.appendix_a import build_system_prompt
from app.rm_brief import build_rm_brief_payload, log_audit, persist_rm_brief
from app.scoring import compute_final_score
from app.services.anthropic_llm import stream_reply, summarize_call_transcript
from app.services.language_router import detect_language_signal, should_use_sarvam
from app.services import tts as tts_mod
from app.services.redis_client import get_redis, save_session
from app.services.stt_deepgram import transcribe_audio_bytes as dg_stt
from app.services.stt_sarvam import transcribe_audio_bytes as sv_stt
from app.services.whatsapp_stub import send_warm_followup

log = logging.getLogger(__name__)


async def handle_call_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    db = SessionLocal()
    call: Call | None = None
    lead: Lead | None = None
    ctx = LeadConversationContext()
    llm_messages: list[dict[str, Any]] = []
    turn_index = 0
    user_blob = ""
    prior_completed_calls = 0
    redis_ok = False
    try:
        get_redis().ping()
        redis_ok = True
    except Exception:
        pass

    async def send_evt(payload: dict[str, Any]) -> None:
        await websocket.send_json(payload)

    async def process_user_text(user_text: str) -> None:
        nonlocal turn_index, user_blob, call, lead, ctx, llm_messages
        assert call and lead
        user_text = user_text.strip()
        if not user_text:
            return
        user_blob += " " + user_text
        lang, conf = detect_language_signal(user_text)
        if conf >= 0.75:
            call.language = lang
        apply_heuristic_context_update(user_text, ctx)
        transition = infer_transition(call.phase, user_text, ctx, turn_index)

        if transition and transition.new_phase == CallPhase.OBJECTION.value:
            ctx.objections_raised.append(
                {
                    "label": "user_concern",
                    "text": user_text[:240],
                    "status": "UNRESOLVED",
                }
            )
        if (
            transition
            and transition.new_phase == CallPhase.QUALIFICATION.value
            and ctx.objections_raised
        ):
            ctx.objections_raised[-1]["status"] = "RESOLVED"
            ctx.resolution_accepted.append("objection_cycle")

        if transition:
            call.phase = transition.new_phase
            await send_evt(
                {"type": "phase", "phase": call.phase, "reason": transition.reason}
            )

        ut = TranscriptTurn(
            call_id=call.id,
            speaker="user",
            text=user_text,
            phase=call.phase,
        )
        db.add(ut)
        db.commit()

        llm_messages.append({"role": "user", "content": user_text})
        system = (
            build_system_prompt()
            + "\nCurrent phase: "
            + call.phase
            + "\nPhase instruction: "
            + phase_instruction(call.phase)
            + "\nLead context JSON: "
            + ctx.to_prompt_block()
        )
        if prior_completed_calls and turn_index == 0:
            system += (
                "\nThis lead has prior completed calls — acknowledge continuity naturally.\n"
            )

        ai_parts: list[str] = []
        async for chunk in stream_reply(system=system, messages=llm_messages):
            ai_parts.append(chunk)
            await send_evt({"type": "ai_token", "text": chunk})
        ai_text = "".join(ai_parts).strip() or "Kya main ek point repeat kar doon?"
        llm_messages.append({"role": "assistant", "content": ai_text})

        at = TranscriptTurn(
            call_id=call.id,
            speaker="ai",
            text=ai_text,
            phase=call.phase,
        )
        db.add(at)
        db.commit()

        await send_evt(
            {
                "type": "transcript",
                "speaker": "ai",
                "text": ai_text,
                "phase": call.phase,
            }
        )

        duration = int((datetime.now(timezone.utc) - call.started_at).total_seconds())
        total, breakdown, _label = compute_final_score(
            transcript_user_blob=user_blob,
            ctx=ctx,
            duration_seconds=duration,
            has_prior_calls=prior_completed_calls > 0,
        )
        await send_evt({"type": "score_partial", "total": total, "breakdown": breakdown.to_dict()})

        if should_use_sarvam(call.language):
            audio = await tts_mod.sarvam_tts(ai_text)
        else:
            audio = await tts_mod.elevenlabs_tts(ai_text)
        if audio:
            await send_evt(
                {
                    "type": "tts",
                    "mime": "audio/mpeg",
                    "base64": base64.b64encode(audio).decode("ascii"),
                }
            )

        turn_index += 1
        blob = {
            "phase": call.phase,
            "language": call.language,
            "turn_index": turn_index,
            "ctx": ctx.to_dict(),
        }
        if redis_ok:
            try:
                save_session(get_redis(), call.id, blob)
            except Exception as e:
                log.warning("redis_save_failed %s", e)

        db.refresh(call)

    try:
        while True:
            raw = await websocket.receive_json()
            msg_type = raw.get("type")

            if msg_type == "start":
                lead_id = UUID(raw["lead_id"])
                lead = db.get(Lead, lead_id)
                if not lead:
                    await send_evt({"type": "error", "message": "lead not found"})
                    continue
                prior_completed_calls = db.scalar(
                    select(func.count())
                    .select_from(Call)
                    .where(
                        Call.lead_id == lead_id,
                        Call.status == CallStatus.COMPLETED.value,
                    )
                ) or 0
                ctx = LeadConversationContext.from_dict(lead.lead_context_json)
                call = Call(
                    lead_id=lead_id,
                    phase=CallPhase.OPENER.value,
                    language="unknown",
                    consent_recording=bool(raw.get("consent_recording", True)),
                    consent_at=datetime.now(timezone.utc)
                    if raw.get("consent_recording", True)
                    else None,
                )
                db.add(call)
                db.commit()
                db.refresh(call)
                opening = (
                    "Namaste, hello—main Rupeezy ka AI assistant Saathi hoon. "
                    "Yeh call quality ke liye record ho sakti hai. "
                    "Kya aapke paas partner program ke liye 2 minute hain?"
                )
                llm_messages = [{"role": "assistant", "content": opening}]
                db.add(
                    TranscriptTurn(
                        call_id=call.id,
                        speaker="ai",
                        text=opening,
                        phase=CallPhase.OPENER.value,
                    )
                )
                db.commit()
                turn_index = 0
                user_blob = ""
                await send_evt({"type": "call_started", "call_id": str(call.id)})
                await send_evt(
                    {
                        "type": "transcript",
                        "speaker": "ai",
                        "text": opening,
                        "phase": CallPhase.OPENER.value,
                    }
                )

            elif msg_type == "text":
                if not call or not lead:
                    await send_evt({"type": "error", "message": "start call first"})
                    continue
                await process_user_text(str(raw.get("text", "")))

            elif msg_type == "audio":
                if not call or not lead:
                    await send_evt({"type": "error", "message": "start call first"})
                    continue
                try:
                    data = base64.b64decode(raw.get("base64", ""))
                except Exception:
                    await send_evt({"type": "error", "message": "invalid base64"})
                    continue
                mime = str(raw.get("mime", "audio/webm"))
                lang_code = call.language or "unknown"
                text, conf = "", 0.0
                if should_use_sarvam(lang_code) or lang_code == "unknown":
                    text, conf = await sv_stt(data, mime)
                if (not text or conf < 0.5) and lang_code in ("en", "unknown", "hinglish"):
                    text2, c2 = await dg_stt(data, mime)
                    if len(text2) > len(text):
                        text, conf = text2, c2
                if not text:
                    await send_evt(
                        {"type": "stt_empty", "message": "could not transcribe — try again"}
                    )
                    continue
                await send_evt({"type": "user_text_final", "text": text})
                await process_user_text(text)

            elif msg_type == "end_call":
                if not call or not lead:
                    await send_evt({"type": "error", "message": "no active call"})
                    continue
                await finalize_call(db, call, lead, ctx, user_blob, prior_completed_calls, websocket)
                call = None
                lead = None
                llm_messages = []

            else:
                await send_evt({"type": "error", "message": "unknown message type"})

    except WebSocketDisconnect:
        log.info("websocket_disconnect")
        if call and lead:
            try:
                await finalize_call(
                    db, call, lead, ctx, user_blob, prior_completed_calls, websocket
                )
            except Exception as e:
                log.warning("finalize_on_disconnect %s", e)
    finally:
        db.close()


async def finalize_call(
    db: Session,
    call: Call,
    lead: Lead,
    ctx: LeadConversationContext,
    user_blob: str,
    prior_completed_calls: int,
    websocket: WebSocket,
) -> None:
    call.ended_at = datetime.now(timezone.utc)
    duration = int((call.ended_at - call.started_at).total_seconds())
    call.duration_seconds = duration
    full_transcript = ""
    turn_stmt = (
        select(TranscriptTurn)
        .where(TranscriptTurn.call_id == call.id)
        .order_by(TranscriptTurn.created_at)
    )
    for row in db.scalars(turn_stmt):
        full_transcript += f"{row.speaker.upper()}: {row.text}\n"
    summary = await summarize_call_transcript(full_transcript)
    call.summary = summary
    total, breakdown, label = compute_final_score(
        transcript_user_blob=user_blob,
        ctx=ctx,
        duration_seconds=duration,
        has_prior_calls=prior_completed_calls > 0,
    )
    call.score_final = total
    call.score_breakdown_json = breakdown.to_dict()
    call.status = CallStatus.COMPLETED.value
    lead.score = total
    lead.status = label
    lead.last_interaction_at = call.ended_at
    lead.lead_context_json = ctx.to_dict()
    db.commit()

    if prior_completed_calls:
        opener = (
            f"Namaste {lead.name}, last call ke baad aapne sochne bola tha—"
            f"aaj kya decide kiya aapne?"
        )
    else:
        opener = (
            f"Namaste {lead.name}, main Saathi bol raha hoon—Rupeezy AP program par "
            f"aapka interest confirm karte hue aage badhna chahenge?"
        )
    objections = list(ctx.objections_raised)
    payload = build_rm_brief_payload(
        lead=lead,
        call=call,
        breakdown=breakdown,
        objections=objections,
    )
    payload["lead_identity"]["phone"] = lead.phone
    persist_rm_brief(
        db,
        call_id=call.id,
        lead_id=lead.id,
        recommended_opener=opener,
        payload=payload,
    )
    log_audit(
        db,
        event_type="call_completed",
        title=f"Call completed — {lead.name}",
        description=f"Score {total} ({label})",
        lead_id=lead.id,
        call_id=call.id,
    )
    if label == "HOT":
        log_audit(
            db,
            event_type="rm_handoff",
            title=f"RM handoff queued — {lead.name}",
            description="Hot lead brief generated",
            lead_id=lead.id,
            call_id=call.id,
        )
    if label == "WARM":
        await send_warm_followup(
            to_phone=lead.phone,
            name=lead.name,
            signup_link="https://rupeezy.in/partners?utm=saathi",
        )
        log_audit(
            db,
            event_type="whatsapp_sent",
            title=f"WhatsApp follow-up — {lead.name}",
            description="Warm path template",
            lead_id=lead.id,
            call_id=call.id,
        )
    db.commit()
    try:
        await websocket.send_json(
            {
                "type": "call_end",
                "summary": summary,
                "score": total,
                "status": label,
                "breakdown": breakdown.to_dict(),
                "recommended_opener": opener,
            }
        )
    except Exception:
        log.warning("call_end_message_not_delivered")
