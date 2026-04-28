from pydantic import BaseModel, EmailStr

from app.schemas.common import TimestampRead


class AppSettingsRead(TimestampRead):
    id: int
    admin_email: EmailStr | None
    admin_telegram_chat_id: str | None
    thank_you_text: str
    user_daily_open_limit: int
    global_daily_open_limit: int
    xai_api_key: str | None
    xai_model: str


class AppSettingsUpdate(BaseModel):
    admin_email: EmailStr | None = None
    admin_telegram_chat_id: str | None = None
    thank_you_text: str
    user_daily_open_limit: int = 3
    global_daily_open_limit: int = 100
    xai_api_key: str | None = None
    xai_model: str = "grok-2-latest"


class PublicSettingsRead(BaseModel):
    thank_you_text: str
