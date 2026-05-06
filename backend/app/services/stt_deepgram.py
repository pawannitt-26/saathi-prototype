"""Deepgram Nova-2 prerecorded transcription (English path)."""

from __future__ import annotations

import httpx

from app.config import get_settings


async def transcribe_audio_bytes(audio: bytes, content_type: str = "audio/webm") -> tuple[str, float]:
    """Return (transcript, confidence proxy)."""
    settings = get_settings()
    if not settings.deepgram_api_key or settings.mock_ai:
        return "", 0.0
    headers = {
        "Authorization": f"Token {settings.deepgram_api_key}",
        "Content-Type": content_type,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
            headers=headers,
            content=audio,
        )
        r.raise_for_status()
        data = r.json()
    try:
        alt = data["results"]["channels"][0]["alternatives"][0]
        text = alt.get("transcript", "") or ""
        conf = float(alt.get("confidence") or 0.8)
        return text, conf
    except (KeyError, IndexError, TypeError):
        return "", 0.0
