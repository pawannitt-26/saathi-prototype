from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = ""
    redis_url: str = "redis://localhost:6379/0"
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    supabase_jwt_audience: str = "authenticated"
    webhook_secret: str = ""

    anthropic_api_key: str = ""
    deepgram_api_key: str = ""
    sarvam_api_key: str = ""
    sarvam_api_base: str = "https://api.sarvam.ai/v1"
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = ""

    whatsapp_provider: str = "stub"
    interakt_api_key: str = ""

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    mock_ai: bool = False
    anthropic_model: str = "claude-3-5-sonnet-20241022"
    log_level: str = "INFO"

    retention_transcript_days: int = 365
    retention_recording_days: int = 90

    calling_hour_start: int = 9
    calling_hour_end: int = 21

    @field_validator("database_url")
    @classmethod
    def require_database_url(cls, v: str) -> str:
        if not (v or "").strip():
            raise ValueError(
                "DATABASE_URL is required (Supabase or other Postgres). See backend/.env.example."
            )
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
