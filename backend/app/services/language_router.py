"""Detect primary language / Hinglish blend from text (Sarvam can replace this with confidence scores)."""

from __future__ import annotations

import re

DEVANAGARI = re.compile(r"[\u0900-\u097F]")


def detect_language_signal(text: str) -> tuple[str, float]:
    """Return (code, confidence 0-1). Codes: en, hi, hinglish."""
    t = text.strip()
    if not t:
        return "unknown", 0.0
    dev_matches = len(DEVANAGARI.findall(t))
    latin_words = len(re.findall(r"[A-Za-z]+", t))
    if dev_matches > 2 and latin_words > 2:
        return "hinglish", 0.85
    if dev_matches > 2:
        return "hi", 0.9
    if latin_words > 0:
        return "en", 0.88
    return "unknown", 0.4


def should_use_sarvam(lang: str) -> bool:
    return lang in ("hi", "hinglish", "unknown")


def should_use_deepgram(lang: str) -> bool:
    return lang == "en"
