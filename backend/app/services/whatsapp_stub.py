"""WhatsApp / Interakt — stub with structured log; swap for real HTTP when template approved."""

from __future__ import annotations

import logging
from uuid import UUID

import httpx

from app.config import get_settings

log = logging.getLogger(__name__)


async def send_warm_followup(*, to_phone: str, name: str, signup_link: str) -> dict:
    settings = get_settings()
    body = {
        "to": to_phone,
        "template_name": "saathi_warm_followup",
        "params": {"name": name, "link": signup_link},
    }
    if settings.whatsapp_provider == "stub" or not settings.interakt_api_key:
        log.info("whatsapp_stub_send name=%s", name)
        return {"ok": True, "mode": "stub", "body": body}

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            "https://api.interakt.ai/v1/public/message/",
            headers={"Authorization": f"Basic {settings.interakt_api_key}"},
            json=body,
        )
        return {"ok": r.status_code < 400, "status": r.status_code}


async def mark_link_opened_placeholder(lead_id: UUID) -> None:
    log.info("link_opened_webhook lead_id=%s", str(lead_id))
