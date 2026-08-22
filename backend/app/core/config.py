import os
from functools import lru_cache
from typing import Optional
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Supabase — new publishable/secret API key standard (sb_publishable_ / sb_secret_)
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = Field(
        default="",
        validation_alias=AliasChoices(
            "SUPABASE_PUBLISHABLE_KEY",
            "supabase_publishable_key",
            "SUPABASE_ANON_KEY",
        ),
    )
    SUPABASE_SECRET_KEY: str = Field(
        default="",
        validation_alias=AliasChoices(
            "SUPABASE_SECRET_KEY",
            "supabase_db_secret",
            "SUPABASE_SERVICE_ROLE_KEY",
        ),
    )

    # Still required to verify Supabase Auth user JWTs (access tokens from sign-in)
    SUPABASE_JWT_SECRET: str = Field(
        default="",
        validation_alias=AliasChoices("SUPABASE_JWT_SECRET", "supabase_jwt_secret"),
    )

    # Firebase / FCM Settings
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None

    # SMTP Settings
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(
            ".env",
            os.path.join("..", "secrets_example", ".env"),
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
