from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import AuditEvent, Call, CallStatus, Lead
from app.schemas import ActivityOut, DashboardMetricsOut, HotLeadRMRow
from app.util_time import relative_time

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics", response_model=DashboardMetricsOut)
def dashboard_metrics(db: Session = Depends(get_db)) -> DashboardMetricsOut:
    total = db.scalar(select(func.count()).select_from(Lead)) or 0
    hot = db.scalar(select(func.count()).select_from(Lead).where(Lead.status == "HOT")) or 0
    warm = db.scalar(select(func.count()).select_from(Lead).where(Lead.status == "WARM")) or 0
    cold = db.scalar(select(func.count()).select_from(Lead).where(Lead.status == "COLD")) or 0
    active_calls = (
        db.scalar(select(func.count()).select_from(Call).where(Call.status == CallStatus.ACTIVE.value))
        or 0
    )
    completed = (
        db.scalar(
            select(func.count()).select_from(Call).where(Call.status == CallStatus.COMPLETED.value)
        )
        or 0
    )
    conv = round((hot + warm) / total * 100, 1) if total else 0.0
    qualified = hot + warm
    funnel = [
        {"label": "Total Contacts", "value": str(total), "width": "100%"},
        {"label": "Engaged", "value": str(completed), "width": f"{min(100, int(completed / total * 100) if total else 0)}%"},
        {"label": "Qualified (SAATHI)", "value": str(qualified), "width": f"{min(100, int(qualified / total * 100) if total else 0)}%"},
        {"label": "RM Handoff", "value": str(hot), "width": f"{min(100, int(hot / total * 100) if total else 0)}%"},
    ]
    denom = total or 1
    sentiment = {
        "HOT": f"{int(hot / denom * 100)}%",
        "WARM": f"{int(warm / denom * 100)}%",
        "COLD": f"{int(cold / denom * 100)}%",
    }
    return DashboardMetricsOut(
        conversion_rate=f"{conv:.1f}%",
        active_calls=active_calls,
        hot_leads_today=hot,
        funnel=funnel,
        sentiment=sentiment,
    )


@router.get("/activities", response_model=list[ActivityOut])
def list_activities(db: Session = Depends(get_db)) -> list[ActivityOut]:
    rows = db.scalars(
        select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(40)
    ).all()
    return [
        ActivityOut(
            title=r.title,
            description=r.description,
            time=relative_time(r.created_at) or "",
            event_type=r.event_type,
        )
        for r in rows
    ]


@router.get("/rm/hot", response_model=list[HotLeadRMRow])
def rm_hot_queue(db: Session = Depends(get_db)) -> list[HotLeadRMRow]:
    leads = db.scalars(
        select(Lead).where(Lead.status == "HOT").order_by(Lead.last_interaction_at.desc().nulls_last())
    ).all()
    out = []
    for L in leads:
        nav = f"Score {L.score}"
        out.append(
            HotLeadRMRow(
                name=L.name,
                time=relative_time(L.last_interaction_at) or "—",
                source="SAATHI Voice",
                value=nav,
                lead_id=L.id,
            )
        )
    return out
