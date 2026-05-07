import pytest
from fastapi import HTTPException

from app.auth import _token_to_user, decode_supabase_token, require_webhook_secret
from app.config import Settings


def _settings(**overrides: str) -> Settings:
    base = {
        "database_url": "postgresql://user:pass@localhost:5432/postgres",
        "supabase_url": "https://demo.supabase.co",
        "supabase_jwt_audience": "authenticated",
        "webhook_secret": "top-secret",
    }
    base.update(overrides)
    return Settings(**base)


def test_decode_supabase_token_ok(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "app.auth._fetch_supabase_user",
        lambda token, settings: {"sub": "user-1", "email": "rm@example.com", "role": "authenticated"},
    )
    payload = decode_supabase_token("abc", _settings())
    assert payload["sub"] == "user-1"


def test_decode_supabase_token_invalid(monkeypatch: pytest.MonkeyPatch):
    def _boom(token: str, settings: Settings):
        raise ValueError("bad token")

    monkeypatch.setattr("app.auth._fetch_supabase_user", _boom)
    with pytest.raises(HTTPException) as exc:
        decode_supabase_token("abc", _settings())
    assert exc.value.status_code == 401


def test_token_to_user_requires_sub():
    with pytest.raises(HTTPException) as exc:
        _token_to_user({"email": "x@example.com"})
    assert exc.value.status_code == 401


def test_webhook_secret_validation():
    require_webhook_secret("top-secret", _settings())
    with pytest.raises(HTTPException) as exc:
        require_webhook_secret("wrong", _settings())
    assert exc.value.status_code == 401
