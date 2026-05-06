from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Call, Lead, RMBrief, TranscriptTurn
from app.schemas import LeadDetailOut, LeadOut, TranscriptRow
from app.util_time import relative_time

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=list[LeadOut])
def list_leads(db: Session = Depends(get_db)) -> list[LeadOut]:
    leads = db.scalars(
        select(Lead).order_by(Lead.last_interaction_at.desc().nulls_last())
    ).all()
    out = []
    for L in leads:
        out.append(
            LeadOut(
                id=L.id,
                name=L.name,
                phone=L.phone,
                location=L.location,
                profession=L.profession,
                score=L.score,
                status=L.status,
                last_interaction=relative_time(L.last_interaction_at),
            )
        )
    return out


@router.get("/{lead_id}", response_model=LeadDetailOut)
def get_lead(lead_id: UUID, db: Session = Depends(get_db)) -> LeadDetailOut:
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "lead not found")
    last_call = db.scalars(
        select(Call)
        .where(Call.lead_id == lead_id)
        .order_by(Call.started_at.desc())
        .limit(1)
    ).first()
    summary = None
    opener = None
    objections: list[dict] = []
    transcript_rows: list[TranscriptRow] = []
    if last_call:
        summary = last_call.summary
        brief = db.scalars(
            select(RMBrief).where(RMBrief.call_id == last_call.id).limit(1)
        ).first()
        if brief:
            opener = brief.recommended_opener
            objections = list(brief.payload_json.get("objections_raised") or [])
        turns = db.scalars(
            select(TranscriptTurn)
            .where(TranscriptTurn.call_id == last_call.id)
            .order_by(TranscriptTurn.created_at)
        ).all()
        for t in turns:
            tm = t.created_at.strftime("%M:%S") if t.created_at else "--:--"
            typ = "status" if t.speaker == "system" else ("ai" if t.speaker == "ai" else "user")
            speaker_l = "Saathi AI" if t.speaker == "ai" else ("Lead" if t.speaker == "user" else t.speaker)
            transcript_rows.append(
                TranscriptRow(speaker=speaker_l, time=tm, text=t.text, type=typ)
            )
    return LeadDetailOut(
        lead=LeadOut(
            id=lead.id,
            name=lead.name,
            phone=lead.phone,
            location=lead.location,
            profession=lead.profession,
            score=lead.score,
            status=lead.status,
            last_interaction=relative_time(lead.last_interaction_at),
        ),
        summary=summary,
        recommended_opener=opener,
        objections=objections,
        transcript=transcript_rows,
    )
