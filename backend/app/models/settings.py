from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin


class AppSettings(TimestampMixin, Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    app_title: Mapped[str] = mapped_column(String(255), default="10 вопросов")
    app_description: Mapped[str] = mapped_column(
        Text, default="Выберите психологическую тему и ответьте на 10 вопросов."
    )
    send_message_title: Mapped[str] = mapped_column(String(255), default="Посылка сообщения")
    send_message_text: Mapped[str] = mapped_column(
        Text, default="Отправь мне результаты твоего теста, я посмотрю их и свяжусь с тобой"
    )
    sent_message_title: Mapped[str] = mapped_column(String(255), default="Сообщение послано")
    sent_message_text: Mapped[str] = mapped_column(
        Text, default="Спасибо! Я получила твои ответы, скоро свяжусь с тобой"
    )
    final_title: Mapped[str] = mapped_column(String(255), default="Спасибо за ответы!")
    admin_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    admin_telegram_chat_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    thank_you_text: Mapped[str] = mapped_column(
        Text, default="Спасибо. Ваши ответы получены. Специалист свяжется с вами после проверки."
    )
    final_button_text: Mapped[str] = mapped_column(String(255), default="Пройти заново")
    user_daily_open_limit: Mapped[int] = mapped_column(Integer, default=100)
    global_daily_open_limit: Mapped[int] = mapped_column(Integer, default=100)
    xai_api_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    xai_model: Mapped[str] = mapped_column(String(120), default="grok-2-latest")
