"""Anthropic Claude streaming for Saathi."""

from __future__ import annotations

from collections.abc import AsyncIterator

from anthropic import AsyncAnthropic

from app.config import get_settings


async def stream_reply(
    *,
    system: str,
    messages: list[dict],
    model: str | None = None,
) -> AsyncIterator[str]:
    settings = get_settings()
    use_model = model or settings.anthropic_model
    if settings.mock_ai or not settings.anthropic_api_key:
        yield _mock_response(messages)
        return

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    async with client.messages.stream(
        model=use_model,
        max_tokens=800,
        system=system,
        messages=messages,  # type: ignore[arg-type]
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def summarize_call_transcript(transcript: str) -> str:
    settings = get_settings()
    if settings.mock_ai or not settings.anthropic_api_key:
        return (transcript[:400] + "…") if len(transcript) > 400 else transcript

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    msg = await client.messages.create(
        model=settings.anthropic_model,
        max_tokens=300,
        system="Write 2-3 plain sentences for a relationship manager: what was discussed and intent.",
        messages=[{"role": "user", "content": transcript[:12000]}],
    )
    for block in msg.content:
        if block.type == "text":
            return block.text
    return ""


def _mock_response(messages: list[dict]) -> str:
    last = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last = str(m.get("content", ""))
            break
    low = last.lower()
    if any(x in low for x in ("broker", "dusre", "pehle")):
        return (
            "Main Saathi hoon, Rupeezy ka AI assistant. Bahut acchi baat hai—"
            "aap business samajhte hain. Ek seedha sawaal: kya aapko abhi 100% brokerage share "
            "mil raha hai aur payouts daily hain? Rupeezy par zero joining fee bhi hai."
        )
    if any(x in low for x in ("hello", "namaste", "haan", "yes")):
        return (
            "Namaste! Main Rupeezy ka AI assistant Saathi hoon. "
            "Aaj main AP partner program ke baare mein short mein bata sakta hoon—"
            "zero joining fee, 100% brokerage share, aur daily payouts. Kya aapke paas 2 minute hain?"
        )
    return (
        "Thanks Shukriya—Rupeezy AP program teen cheeze highlight karta hai: "
        "zero joining fee, 100% brokerage share, aur RISE portal se daily payouts. "
        "Kya yeh clear hua?"
    )
