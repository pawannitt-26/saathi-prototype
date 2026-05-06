import json
from typing import Any
from uuid import UUID

import redis

from app.config import get_settings


def get_redis() -> redis.Redis:
    return redis.from_url(get_settings().redis_url, decode_responses=True)


def session_key(call_id: UUID) -> str:
    return f"call:{call_id}:session"


def save_session(redis_client: redis.Redis, call_id: UUID, blob: dict[str, Any]) -> None:
    redis_client.set(session_key(call_id), json.dumps(blob), ex=86400)


def load_session(redis_client: redis.Redis, call_id: UUID) -> dict[str, Any] | None:
    raw = redis_client.get(session_key(call_id))
    if not raw:
        return None
    return json.loads(raw)
