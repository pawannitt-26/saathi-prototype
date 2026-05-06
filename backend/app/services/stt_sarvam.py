"""Sarvam AI STT placeholder — wire to official Sarvam speech API when keys available."""

from __future__ import annotations

import httpx

from app.config import get_settings


async def transcribe_audio_bytes(audio: bytes, content_type: str = "audio/webm") -> tuple[str, float]:
    settings = get_settings()
    if not settings.sarvam_api_key or settings.mock_ai:
        return "", 0.0
    # Sarvam endpoints vary by product; this is a structured placeholder.
    url = f"{settings.sarvam_api_base.rstrip('/')}/speech-to-text"
    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            r = await client.post(
                url,
                headers={"Authorization": f"Bearer {settings.sarvam_api_key}"},
                files={"file": ("audio", audio, content_type)},
            )
            if r.status_code >= 400:
                return "", 0.0
            data = r.json()
        text = str(data.get("text") or data.get("transcript") or "")
        conf = float(data.get("confidence", 0.75))
        return text, conf
    except Exception:
        return "", 0.0
