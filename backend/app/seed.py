"""Seed demo leads if database is empty."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid5, NAMESPACE_URL

from sqlalchemy import func, select

from app.conversation.context import LeadConversationContext
from app.db import SessionLocal
from app.models import Lead


def _id(s: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"saathi:seed:{s}")


def seed() -> None:
    db = SessionLocal()
    try:
        n = db.scalar(select(func.count()).select_from(Lead)) or 0
        if n > 0:
            return
        now = datetime.now(timezone.utc)
        rows = [
            (_id("1"), "Rahul Sharma", "+91 98765 43210", "Mumbai", "MFD", 95, "HOT"),
            (_id("2"), "Priya Patel", "+91 91234 56789", "Ahmedabad", "Agent", 65, "WARM"),
            (_id("3"), "Amit Kumar", "+91 99887 76655", "Delhi", "Influencer", 30, "COLD"),
            (_id("4"), "Sneha Gupta", "+91 90000 11111", "Bangalore", "Agent", 88, "HOT"),
        ]
        for lid, name, phone, loc, prof, score, status in rows:
            ctx = LeadConversationContext()
            db.add(
                Lead(
                    id=lid,
                    name=name,
                    phone=phone,
                    location=loc,
                    profession=prof,
                    score=score,
                    status=status,
                    last_interaction_at=now,
                    lead_context_json=ctx.to_dict(),
                )
            )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
