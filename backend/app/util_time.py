from datetime import datetime, timezone


def relative_time(dt: datetime | None) -> str | None:
    if not dt:
        return None
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    sec = int((now - dt).total_seconds())
    if sec < 60:
        return "Just now"
    if sec < 3600:
        return f"{sec // 60}m ago"
    if sec < 86400:
        return f"{sec // 3600}h ago"
    return f"{sec // 86400}d ago"
