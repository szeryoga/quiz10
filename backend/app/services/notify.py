import logging
import smtplib
from email.message import EmailMessage

import httpx

from app.core.config import get_settings
from app.models.settings import AppSettings
from app.models.submission import UserSubmission
from app.models.topic import Topic


logger = logging.getLogger(__name__)


def build_admin_message(submission: UserSubmission, topic: Topic) -> str:
    answers_block = "\n".join(
        f"{index}. {item['question_text']}\nОтвет: {item['answer']}"
        for index, item in enumerate(submission.answers, start=1)
    )
    user_label = " ".join(filter(None, [submission.first_name, submission.last_name])).strip() or "Без имени"
    return (
        f"Новая заявка Quiz10\n\n"
        f"Тема: {topic.title}\n"
        f"Submission ID: {submission.id}\n"
        f"Telegram ID: {submission.telegram_id or '-'}\n"
        f"Username: {submission.username or '-'}\n"
        f"Имя: {user_label}\n"
        f"Статус анализа: {submission.status.value}\n\n"
        f"Ответы:\n{answers_block}\n\n"
        f"Анализ ИИ:\n{submission.ai_response or 'Нет'}"
    )


async def send_notifications(settings_row: AppSettings, submission: UserSubmission, topic: Topic) -> None:
    message = build_admin_message(submission, topic)
    await send_telegram(settings_row, message)
    send_email(settings_row, message, f"Quiz10 submission #{submission.id}")


async def send_telegram(settings_row: AppSettings, message: str) -> None:
    settings = get_settings()
    if not settings_row.admin_telegram_chat_id or not settings.telegram_bot_token:
        return

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            await client.post(
                f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                json={"chat_id": settings_row.admin_telegram_chat_id, "text": message},
            )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Telegram notification failed: %s", exc)


def send_email(settings_row: AppSettings, message: str, subject: str) -> None:
    settings = get_settings()
    if not settings_row.admin_email:
        return
    if not settings.smtp_host or not settings.smtp_from:
        return

    email = EmailMessage()
    email["Subject"] = subject
    email["From"] = settings.smtp_from
    email["To"] = settings_row.admin_email
    email.set_content(message)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(email)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Email notification failed: %s", exc)
