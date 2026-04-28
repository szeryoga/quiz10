from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Quiz10 API"
    api_prefix: str = "/api"
    debug: bool = False

    database_url: str = Field(default="postgresql+psycopg://quiz10:quiz10@postgres:5432/quiz10")
    cors_origins: str = Field(default="http://127.0.0.1:3004,http://127.0.0.1:3005")
    admin_password: str = Field(default="change_me")
    jwt_secret: str = Field(default="change_me_too")
    jwt_expire_hours: int = Field(default=24)

    xai_api_key: str = Field(default="")
    xai_model: str = Field(default="grok-2-latest")
    telegram_bot_token: str = Field(default="")

    smtp_host: str = Field(default="")
    smtp_port: int = Field(default=587)
    smtp_user: str = Field(default="")
    smtp_password: str = Field(default="")
    smtp_from: str = Field(default="")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
