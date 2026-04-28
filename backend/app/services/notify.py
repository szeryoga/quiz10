import logging

import httpx

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
    return await send_telegram(settings_row, message)


async def send_telegram(settings_row: AppSettings, message: str) -> str:
    from app.core.config import get_settings

    settings = get_settings()
    if not settings_row.admin_telegram_chat_id or not settings.telegram_bot_token:
        raise RuntimeError("У администратора не настроен Telegram для получения сообщений")

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
                json={"chat_id": settings_row.admin_telegram_chat_id, "text": message},
            )
            response.raise_for_status()
        return settings_row.admin_telegram_chat_id
    except Exception as exc:  # noqa: BLE001
        logger.exception("Telegram notification failed: %s", exc)
        raise RuntimeError("Не удалось отправить сообщение в Telegram") from exc
