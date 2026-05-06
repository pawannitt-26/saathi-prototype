"""TTS providers: ElevenLabs (EN), Sarvam (HI/Hinglish)."""

from __future__ import annotations

import httpx

from app.config import get_settings


async def elevenlabs_tts(text: str) -> bytes | None:
    settings = get_settings()
    if not settings.elevenlabs_api_key or settings.mock_ai:
        return None
    voice = settings.elevenlabs_voice_id or "21m00Tcm4TlvDq8ikWAM"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/stream"
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(
            url,
            headers={
                "xi-api-key": settings.elevenlabs_api_key,
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
            },
            json={
                "text": text,
                "model_id": "eleven_turbo_v2_5",
            },
        )
        if r.status_code >= 400:
            return None
        return r.content


async def sarvam_tts(text: str) -> bytes | None:
    settings = get_settings()
    if not settings.sarvam_api_key or settings.mock_ai:
        return None
    url = f"{settings.sarvam_api_base.rstrip('/')}/text-to-speech"
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {settings.sarvam_api_key}",
                    "Content-Type": "application/json",
                },
                json={"text": text},
            )
            if r.status_code >= 400:
                return None
            return r.content
    except Exception:
        return None
