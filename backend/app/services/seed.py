from app.core.config import get_settings
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.question import Question
from app.models.settings import AppSettings
from app.models.topic import Topic


SEED_TOPICS: list[tuple[str, str | None, list[str]]] = [
    (
        "Почему я все время тревожусь",
        "Исследование триггеров тревоги и привычных реакций.",
        [
            "Когда вы чаще всего чувствуете тревогу?",
            "Что обычно запускает это состояние?",
            "Как тревога ощущается в теле?",
            "Какие мысли приходят вам в такие моменты?",
            "Что вы обычно делаете, чтобы справиться?",
            "Чего вы больше всего боитесь, когда тревожитесь?",
            "Бывает ли, что тревога мешает спать или отдыхать?",
            "Есть ли ситуации, где тревога особенно сильна?",
            "Что помогает вам почувствовать хоть немного опоры?",
            "Какой результат вы хотели бы получить от работы с этой темой?",
        ],
    ),
    (
        "Какая работа будет радовать меня",
        "Поиск более живого и подходящего профессионального направления.",
        [
            "Что в работе дает вам ощущение смысла?",
            "Какие задачи вас обычно оживляют?",
            "Что вы терпите, но вам это давно не подходит?",
            "В каком ритме вам комфортно работать?",
            "Какие ваши сильные стороны вы чувствуете особенно ясно?",
            "Что для вас важнее: стабильность, свобода, признание или творчество?",
            "Какая рабочая среда вас поддерживает?",
            "Что вас быстрее всего истощает в работе?",
            "Какие мечты о работе вы давно откладываете?",
            "Какой формат работы был бы для вас сейчас наиболее желанным?",
        ],
    ),
    (
        "Какой партнер мне подходит лучше всего",
        "Про отношения, границы, близость и личные потребности.",
        [
            "Что для вас самое важное в близких отношениях?",
            "Какие качества в партнере вы особенно цените?",
            "Какие сценарии в отношениях вам уже не подходят?",
            "Как вы обычно реагируете на дистанцию или холодность?",
            "Что помогает вам чувствовать себя в безопасности рядом с человеком?",
            "Какие ваши границы особенно важно уважать?",
            "Как вы понимаете, что рядом 'ваш' человек?",
            "Какие конфликты в отношениях для вас самые болезненные?",
            "Какую поддержку вы хотите получать от партнера?",
            "Какие отношения вы хотите построить в ближайшем будущем?",
        ],
    ),
]


def seed_initial_data(db: Session) -> None:
    settings_env = get_settings()
    if not db.scalar(select(AppSettings).where(AppSettings.id == 1)):
        db.add(
            AppSettings(
                id=1,
                thank_you_text="Спасибо за доверие. Мы получили ваши ответы и скоро внимательно их изучим.",
                user_daily_open_limit=3,
                global_daily_open_limit=100,
                xai_api_key=settings_env.xai_api_key or None,
                xai_model=settings_env.xai_model or "grok-2-latest",
            )
        )
        db.commit()

    existing_topics = db.scalars(select(Topic)).all()
    if existing_topics:
        return

    for topic_index, (title, description, questions) in enumerate(SEED_TOPICS, start=1):
        topic = Topic(title=title, description=description, is_active=True, sort_order=topic_index)
        db.add(topic)
        db.flush()
        for question_index, question_text in enumerate(questions, start=1):
            db.add(
                Question(
                    topic_id=topic.id,
                    text=question_text,
                    sort_order=question_index,
                )
            )

    db.commit()
