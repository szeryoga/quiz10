from app.core.config import get_settings
from typing import Any

import httpx

from app.models.settings import AppSettings


PROMPT_TEMPLATE = """Ты психологический ассистент. Отвечай только на русском языке.
Будь бережным, профессиональным, не ставь медицинских диагнозов.

Структура ответа:
1. Краткое отражение запроса пользователя
2. Что видно по ответам
3. Возможные внутренние конфликты / потребности
4. Практические рекомендации
5. Мягкое приглашение к диалогу со специалистом

Тема:
{topic}

Ответы пользователя:
{answers}
"""


async def analyze_answers(settings: AppSettings, topic_title: str, answers: list[dict]) -> tuple[bool, str]:
    env_settings = get_settings()
    api_key = settings.xai_api_key or env_settings.xai_api_key
    if not api_key:
        return False, "xAI API key is not configured"

    prompt = PROMPT_TEMPLATE.format(
        topic=topic_title,
        answers="\n".join(f"- {item['question_text']}: {item['answer']}" for item in answers),
    )

    payload: dict[str, Any] = {
        "model": settings.xai_model or env_settings.xai_model or "grok-2-latest",
        "messages": [
            {
                "role": "system",
                "content": "Ты бережный психологический ассистент. Отвечай структурированно и по-русски.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
    }

    try:
        async with httpx.AsyncClient(base_url="https://api.x.ai/v1", timeout=60) as client:
            response = await client.post(
                "/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
    except Exception as exc:  # noqa: BLE001
        return False, f"xAI request failed: {exc}"

    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        return False, f"Unexpected xAI response format: {exc}"

    return True, str(content)
