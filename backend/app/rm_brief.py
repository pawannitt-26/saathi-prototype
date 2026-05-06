from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import AuditEvent, Call, Lead, RMBrief
from app.scoring import ScoreBreakdown


def build_rm_brief_payload(
    *,
    lead: Lead,
    call: Call,
    breakdown: ScoreBreakdown,
    objections: list[dict],
) -> dict:
    return {
        "lead_identity": {
            "name": lead.name,
            "phone": "[REDACTED]",
            "city": lead.location,
            "profession": lead.profession,
        },
        "call_summary": call.summary or "",
        "objections_raised": objections,
        "interest_score": {
            "total": breakdown.total(),
            "badge": lead.status,
            "breakdown": breakdown.to_dict(),
        },
        "network_size": (lead.lead_context_json or {}).get("network_size_hint"),
        "prior_calls_note": None,
    }


def persist_rm_brief(
    db: Session,
    *,
    call_id: UUID,
    lead_id: UUID,
    recommended_opener: str,
    payload: dict,
) -> RMBrief:
    brief = RMBrief(
        call_id=call_id,
        lead_id=lead_id,
        payload_json=payload,
        recommended_opener=recommended_opener,
    )
    db.add(brief)
    db.flush()
    return brief


def log_audit(
    db: Session,
    *,
    event_type: str,
    title: str,
    description: str = "",
    lead_id: UUID | None = None,
    call_id: UUID | None = None,
    meta: dict | None = None,
) -> None:
    db.add(
        AuditEvent(
            event_type=event_type,
            title=title,
            description=description,
            lead_id=lead_id,
            call_id=call_id,
            meta_json=meta,
            created_at=datetime.now(timezone.utc),
        )
    )
