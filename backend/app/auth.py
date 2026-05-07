from __future__ import annotations

from dataclasses import dataclass
import secrets
from typing import Any

import httpx
from fastapi import Depends, Header, HTTPException, WebSocket, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthUser:
    sub: str
    email: str | None
    role: str | None


def _issuer(settings: Settings) -> str:
    return f"{settings.supabase_url.rstrip('/')}/auth/v1"


def _fetch_supabase_user(token: str, settings: Settings) -> dict[str, Any]:
    if not settings.supabase_url.strip():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase auth is not configured on the backend.",
        )
    user_url = f"{_issuer(settings)}/user"
    headers = {"Authorization": f"Bearer {token}"}
    if settings.supabase_publishable_key.strip():
        # Supabase Auth user endpoint expects project API key alongside bearer token.
        headers["apikey"] = settings.supabase_publishable_key.strip()
    with httpx.Client(timeout=8.0) as client:
        res = client.get(user_url, headers=headers)
    if res.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )
    payload = res.json()
    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user payload from auth provider.",
        )
    return payload


def decode_supabase_token(token: str, settings: Settings) -> dict[str, Any]:
    try:
        return _fetch_supabase_user(token, settings)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )


def _token_to_user(payload: dict[str, Any]) -> AuthUser:
    sub = str(payload.get("sub") or payload.get("id") or "").strip()
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim.",
        )
    return AuthUser(
        sub=sub,
        email=payload.get("email"),
        role=payload.get("role"),
    )


def require_http_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> AuthUser:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
        )
    payload = decode_supabase_token(credentials.credentials, settings)
    return _token_to_user(payload)


def get_websocket_user(websocket: WebSocket, settings: Settings) -> AuthUser:
    token = (websocket.query_params.get("access_token") or "").strip()
    if not token:
        auth_header = (websocket.headers.get("authorization") or "").strip()
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing websocket access token.",
        )
    payload = decode_supabase_token(token, settings)
    return _token_to_user(payload)


def require_webhook_secret(
    x_webhook_secret: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    expected = settings.webhook_secret.strip()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Webhook secret is not configured.",
        )
    incoming = (x_webhook_secret or "").strip()
    if not incoming or not secrets.compare_digest(incoming, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret.",
        )
