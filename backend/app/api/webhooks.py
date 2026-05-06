from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.rm_brief import log_audit
from app.services.whatsapp_stub import mark_link_opened_placeholder

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/whatsapp/link-opened")
async def whatsapp_link_opened(lead_id: UUID, db: Session = Depends(get_db)) -> dict:
    await mark_link_opened_placeholder(lead_id)
    log_audit(
        db,
        event_type="whatsapp_link_opened",
        title="Tracked link opened",
        description=str(lead_id),
        lead_id=lead_id,
    )
    db.commit()
    return {"ok": True}
