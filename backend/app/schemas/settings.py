from pydantic import BaseModel, EmailStr

from app.schemas.common import TimestampRead


class AppSettingsRead(TimestampRead):
    id: int
    app_title: str
    app_description: str
    send_message_title: str
    send_message_text: str
    sent_message_title: str
    sent_message_text: str
    final_title: str
    admin_email: EmailStr | None
    admin_telegram_chat_id: str | None
    thank_you_text: str
    final_button_text: str
    user_daily_open_limit: int
    global_daily_open_limit: int
    xai_api_key: str | None
    xai_model: str


class AppSettingsUpdate(BaseModel):
    app_title: str = "10 вопросов"
    app_description: str = "Выберите психологическую тему и ответьте на 10 вопросов."
    send_message_title: str = "Посылка сообщения"
    send_message_text: str = "Отправь мне результаты твоего теста, я посмотрю их и свяжусь с тобой"
    sent_message_title: str = "Сообщение послано"
    sent_message_text: str = "Спасибо! Я получила твои ответы, скоро свяжусь с тобой"
    final_title: str = "Спасибо за ответы!"
    admin_email: EmailStr | None = None
    admin_telegram_chat_id: str | None = None
    thank_you_text: str
    final_button_text: str = "Пройти заново"
    user_daily_open_limit: int = 100
    global_daily_open_limit: int = 100
    xai_api_key: str | None = None
    xai_model: str = "grok-2-latest"


class PublicSettingsRead(BaseModel):
    app_title: str
    app_description: str
    send_message_title: str
    send_message_text: str
    sent_message_title: str
    sent_message_text: str
    final_title: str
    thank_you_text: str
    final_button_text: str
