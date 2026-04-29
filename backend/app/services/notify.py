import logging
import socket
from contextlib import contextmanager

import httpx

from app.models.flow import SurveySubmission
from app.models.settings import AppSettings


logger = logging.getLogger(__name__)


@contextmanager
def force_ipv4_for_host(hostname: str):
    original_getaddrinfo = socket.getaddrinfo

    def ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        results = original_getaddrinfo(host, port, family, type, proto, flags)
        if host != hostname:
            return results

        ipv4_results = [item for item in results if item[0] == socket.AF_INET]
        return ipv4_results or results

    socket.getaddrinfo = ipv4_only_getaddrinfo
    try:
        yield
    finally:
        socket.getaddrinfo = original_getaddrinfo


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
        with force_ipv4_for_host("api.telegram.org"):
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
