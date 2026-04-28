from pydantic import BaseModel


class AppOpenRequest(BaseModel):
    telegram_id: str | None = None


class AppOpenResponse(BaseModel):
    success: bool
    user_daily_remaining: int
    global_daily_remaining: int
