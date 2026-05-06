"""TRAI/DPDP-oriented scheduling checks (stubs with clear interfaces)."""

from __future__ import annotations

from datetime import datetime, timezone

from app.config import get_settings


def within_calling_hours(when: datetime | None = None) -> bool:
    dt = when or datetime.now(timezone.utc)
    settings = get_settings()
    # Interpreting as local business hour stub — production should use Asia/Kolkata.
    h = dt.hour
    return settings.calling_hour_start <= h < settings.calling_hour_end


def may_call_phone(dnd_flag: bool) -> bool:
    if dnd_flag:
        return False
    return within_calling_hours()
