import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings
from app.models.flow import SurveySubmission
from app.models.settings import AppSettings


logger = logging.getLogger(__name__)


def build_admin_message(submission: SurveySubmission) -> str:
    answers_block = "\n\n".join(
        (
            f"{index}. {item['question_text']}\n"
            f"Ответ пользователя: {', '.join(option['text'] for option in item['selected_options'])}"
        )
        for index, item in enumerate(submission.stage_one_answers, start=1)
    )
    user_label = " ".join(filter(None, [submission.first_name, submission.last_name])).strip() or "Без имени"
    return (
        f"Новый запрос из Quiz10\n\n"
        f"Пользователь просит помочь с решением ключевой задачи.\n\n"
        f"Submission ID: {submission.id}\n"
        f"Telegram ID: {submission.telegram_id or '-'}\n"
        f"Username: {submission.username or '-'}\n"
        f"Имя: {user_label}\n"
        f"Баллы: {submission.total_score}\n"
        f"Вывод: {submission.result_title}\n"
        f"Ключевая задача: {submission.key_task}\n\n"
        f"Вопросы и ответы:\n{answers_block}"
    )


async def send_notifications(settings_row: AppSettings, submission: SurveySubmission) -> str:
    message = build_admin_message(submission)
    return await send_email(settings_row, message)


async def send_email(settings_row: AppSettings, message: str) -> str:
    settings = get_settings()
    if not settings_row.admin_email:
        raise RuntimeError("У администратора не настроен email для получения сообщений")
    if not settings.smtp_host or not settings.smtp_from:
        raise RuntimeError("На сервере не настроена SMTP-отправка")

    try:
        email = EmailMessage()
        email["Subject"] = "Новый запрос из Quiz10"
        email["From"] = settings.smtp_from
        email["To"] = settings_row.admin_email
        email.set_content(message)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port or 587, timeout=20) as server:
            server.ehlo()
            try:
                server.starttls()
                server.ehlo()
            except smtplib.SMTPException:
                logger.info("SMTP server does not support STARTTLS, continuing without it")
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(email)

        return settings_row.admin_email
    except Exception as exc:  # noqa: BLE001
        logger.exception("Email notification failed: %s", exc)
        raise RuntimeError("Не удалось отправить сообщение по email") from exc
