from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Lead
from app.schemas import AnalyticsOut

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsOut)
def analytics_summary(db: Session = Depends(get_db)) -> AnalyticsOut:
    total = db.scalar(select(func.count()).select_from(Lead)) or 1
    hot = db.scalar(select(func.count()).select_from(Lead).where(Lead.status == "HOT")) or 0
    warm = db.scalar(select(func.count()).select_from(Lead).where(Lead.status == "WARM")) or 0
    cold = db.scalar(select(func.count()).select_from(Lead).where(Lead.status == "COLD")) or 0
    qualified = hot + warm
    pct = lambda n: f"{int(n / total * 100)}%"  # noqa: E731

    funnel_steps = [
        {"id": "01", "label": "Total Leads", "value": str(total), "percentage": "100%", "width": "100%"},
        {
            "id": "02",
            "label": "Qualified (Hot/Warm)",
            "value": str(qualified),
            "percentage": pct(qualified),
            "width": f"{min(100, int(qualified / total * 100))}%",
        },
        {
            "id": "03",
            "label": "Hot (RM Hand-off)",
            "value": str(hot),
            "percentage": pct(hot),
            "width": f"{min(100, int(hot / total * 100))}%",
        },
        {
            "id": "04",
            "label": "Warm (Nurture)",
            "value": str(warm),
            "percentage": pct(warm),
            "width": f"{min(100, int(warm / total * 100))}%",
        },
        {
            "id": "05",
            "label": "Cold",
            "value": str(cold),
            "percentage": pct(cold),
            "width": f"{min(100, int(cold / total * 100))}%",
            "solid": True,
        },
    ]
    attrition = [
        {"label": "Cold after contact", "loss": pct(cold), "desc": "Disengaged or hard reject"},
        {"label": "Warm nurture", "loss": pct(warm), "desc": "Timing / follow-up path"},
        {"label": "Hot RM queue", "loss": pct(hot), "desc": "Immediate human follow-up"},
    ]
    objections = [
        {"label": "Other broker", "value": "35%", "width": "35%"},
        {"label": "Trust / SEBI", "value": "22%", "width": "22%"},
        {"label": "Network size", "value": "18%", "width": "18%"},
        {"label": "Support / ops", "value": "12%", "width": "12%"},
    ]
    language_split = [
        {"label": "English", "value": "40%", "color": "bg-slate-900"},
        {"label": "Hindi", "value": "30%", "color": "bg-indigo-600"},
        {"label": "Hinglish", "value": "25%", "color": "bg-indigo-400"},
        {"label": "Regional", "value": "5%", "color": "bg-indigo-200"},
    ]
    return AnalyticsOut(
        funnel_steps=funnel_steps,
        attrition=attrition,
        objections=objections,
        language_split=language_split,
    )
