from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.flow import ResultOpenQuestion, ResultRange, StageOneOption, StageOneQuestion, StageQuestionType
from app.models.settings import AppSettings


STAGE_ONE_SEED = [
    {
        "text": "Как ты сейчас чувствуешь своё состояние?",
        "question_type": StageQuestionType.single_choice,
        "options": [
            ("Я чётко понимаю, что со мной", 100),
            ("Примерно понимаю", 70),
            ("Скорее запутан(а)", 30),
            ("Вообще не понимаю", 0),
        ],
    },
    {
        "text": "Где ты больше всего ощущаешь своё состояние?",
        "question_type": StageQuestionType.single_choice,
        "options": [
            ("В теле (напряжение, дыхание)", 100),
            ("В мыслях", 60),
            ("В эмоциях", 70),
            ("Нигде не ощущаю", 10),
        ],
    },
    {
        "text": "Что ты обычно делаешь, когда становится тревожно/неприятно?",
        "question_type": StageQuestionType.multi_choice,
        "options": [
            ("Пытаюсь отвлечься", 30),
            ("Анализирую", 50),
            ("Дышу / замедляюсь", 90),
            ("Иду в действие (что-то делаю)", 70),
            ("Игнорирую", 10),
            ("Обращаюсь к телу (движение, прикосновения)", 100),
        ],
    },
    {
        "text": "Насколько тебе легко выражать себя (эмоции, мысли)?",
        "question_type": StageQuestionType.single_choice,
        "options": [
            ("Очень легко", 100),
            ("Скорее легко", 70),
            ("Скорее сложно", 40),
            ("Очень сложно", 10),
        ],
    },
    {
        "text": "Когда ты в новой или стрессовой ситуации, ты чаще…",
        "question_type": StageQuestionType.single_choice,
        "options": [
            ("Импровизирую и подстраиваюсь", 100),
            ("Частично адаптируюсь", 70),
            ("Теряюсь", 30),
            ("Закрываюсь", 10),
        ],
    },
    {
        "text": "Что из этого тебе откликается?",
        "question_type": StageQuestionType.multi_choice,
        "options": [
            ("Мне сложно замедлиться", 40),
            ("Я часто “в голове”", 30),
            ("Я теряю контакт с телом", 20),
            ("Мне трудно проявляться", 30),
            ("Я чувствую себя достаточно устойчиво", 100),
        ],
    },
]


RESULT_RANGE_SEED = [
    {
        "title": "Ты сейчас в слабом контакте с собой",
        "summary": (
            "Ты, скорее всего, либо перегружен(а), либо отрезаешь часть ощущений.\n"
            "Много напряжения уходит в голову или игнорируется телом."
        ),
        "key_task": "Вернуть базовый контакт с телом и состоянием.",
        "min_score": 0,
        "max_score": 180,
        "open_questions": [
            "Опиши ситуацию за последние 2 дня, когда тебе было неприятно или тревожно. Что именно происходило?",
            "Что ты в этот момент чувствовал(а) в теле (если можешь вспомнить)?",
            "Что ты сделал(а) в этой ситуации — и помогло ли это?",
            "Если бы ты мог(ла) остановиться в тот момент, что бы ты попробовал(а) сделать по-другому?",
        ],
    },
    {
        "title": "У тебя частичный контакт с собой",
        "summary": (
            "Ты уже замечаешь свои состояния, но не всегда умеешь с ними работать.\n"
            "В стрессе можешь “выпадать” или застревать в мыслях."
        ),
        "key_task": "Научиться переключаться и проживать состояние.",
        "min_score": 181,
        "max_score": 350,
        "open_questions": [
            "В какой ситуации тебе сложнее всего сохранять контакт с собой? Опиши её.",
            "Что обычно “сбивает” тебя сильнее — мысли, эмоции или реакции других людей?",
            "Есть ли у тебя способ вернуть себе устойчивость? Как ты это делаешь?",
            "Что мешает тебе делать это чаще?",
        ],
    },
    {
        "title": "У тебя хороший контакт с собой",
        "summary": (
            "Ты умеешь замечать и регулировать состояние,\n"
            "но, возможно, не всегда используешь это как ресурс."
        ),
        "key_task": "Углубить контакт и начать выражаться свободнее.",
        "min_score": 351,
        "max_score": 500,
        "open_questions": [
            "В какой ситуации ты в последнее время чувствовал(а) себя максимально “живым(ой)” и в контакте с собой?",
            "Что именно ты делал(а) в этот момент (действия, поведение, состояние)?",
            "Есть ли сфера, где тебе всё ещё сложно проявляться? Какая?",
            "Если представить, что ты выражаешь себя свободно — что изменится в твоей жизни?",
        ],
    },
]


def seed_initial_data(db: Session) -> None:
    settings_row = db.scalar(select(AppSettings).where(AppSettings.id == 1))
    if not settings_row:
        db.add(
            AppSettings(
                id=1,
                app_title="Насколько ты сейчас в контакте с собой (и своим состоянием)?",
                app_description="Ответь на несколько вопросов. В конце ты увидишь вывод, ключевую задачу и сможешь продолжить исследование глубже.",
                brand_eyebrow="Щербинина Евгения",
                brand_name="психолог и арт-терапевт",
                intro_feature_one_title="Бережно",
                intro_feature_one_text="Без правильных и неправильных ответов",
                intro_feature_two_title="Точно",
                intro_feature_two_text="Твое текущее состояние",
                intro_feature_three_title="Спокойно",
                intro_feature_three_text="Загляни вглубь себя",
                send_message_title="Посылка сообщения",
                send_message_text="Отправь мне результаты твоего теста, я посмотрю их и свяжусь с тобой",
                sent_message_title="Сообщение послано",
                sent_message_text="Спасибо! Я получила твои ответы, скоро свяжусь с тобой",
                final_title="Спасибо за ответы!",
                thank_you_text="Спасибо за ответы! Ты сделал(а) важный шаг к лучшему пониманию своего состояния.",
                final_button_text="Пройти заново",
                user_daily_open_limit=100,
                global_daily_open_limit=100,
            )
        )
        db.commit()
    else:
        changed = False
        if settings_row.app_title == "10 вопросов":
            settings_row.app_title = "Насколько ты сейчас в контакте с собой (и своим состоянием)?"
            changed = True
        if settings_row.app_description in {
            "Выберите тему и ответьте на 10 вопросов.",
            "Выберите психологическую тему и ответьте на 10 вопросов.",
        }:
            settings_row.app_description = (
                "Ответь на несколько вопросов. В конце ты увидишь вывод, ключевую задачу "
                "и сможешь продолжить исследование глубже."
            )
            changed = True
        if not getattr(settings_row, "brand_eyebrow", None):
            settings_row.brand_eyebrow = "Щербинина Евгения"
            changed = True
        if not getattr(settings_row, "brand_name", None):
            settings_row.brand_name = "психолог и арт-терапевт"
            changed = True
        if not getattr(settings_row, "intro_feature_one_title", None):
            settings_row.intro_feature_one_title = "Бережно"
            changed = True
        if not getattr(settings_row, "intro_feature_one_text", None):
            settings_row.intro_feature_one_text = "Без правильных и неправильных ответов"
            changed = True
        if not getattr(settings_row, "intro_feature_two_title", None):
            settings_row.intro_feature_two_title = "Точно"
            changed = True
        if not getattr(settings_row, "intro_feature_two_text", None):
            settings_row.intro_feature_two_text = "Твое текущее состояние"
            changed = True
        if not getattr(settings_row, "intro_feature_three_title", None):
            settings_row.intro_feature_three_title = "Спокойно"
            changed = True
        if not getattr(settings_row, "intro_feature_three_text", None):
            settings_row.intro_feature_three_text = "Загляни вглубь себя"
            changed = True
        if settings_row.thank_you_text == "Спасибо за доверие. Мы получили ваши ответы и скоро внимательно их изучим.":
            settings_row.thank_you_text = (
                "Спасибо за ответы! Ты сделал(а) важный шаг к лучшему пониманию своего состояния."
            )
            changed = True
        if not getattr(settings_row, "send_message_title", None):
            settings_row.send_message_title = "Посылка сообщения"
            changed = True
        if not getattr(settings_row, "send_message_text", None):
            settings_row.send_message_text = "Отправь мне результаты твоего теста, я посмотрю их и свяжусь с тобой"
            changed = True
        if not getattr(settings_row, "sent_message_title", None):
            settings_row.sent_message_title = "Сообщение послано"
            changed = True
        if not getattr(settings_row, "sent_message_text", None):
            settings_row.sent_message_text = "Спасибо! Я получила твои ответы, скоро свяжусь с тобой"
            changed = True
        if not getattr(settings_row, "final_title", None):
            settings_row.final_title = "Спасибо за ответы!"
            changed = True
        if not getattr(settings_row, "final_button_text", None):
            settings_row.final_button_text = "Пройти заново"
            changed = True
        if settings_row.user_daily_open_limit == 3:
            settings_row.user_daily_open_limit = 100
            changed = True
        if changed:
            db.commit()

    has_stage_one = db.scalar(select(StageOneQuestion.id).limit(1))
    if not has_stage_one:
        for question_index, question_data in enumerate(STAGE_ONE_SEED, start=1):
            question = StageOneQuestion(
                text=question_data["text"],
                question_type=question_data["question_type"],
                sort_order=question_index,
            )
            db.add(question)
            db.flush()
            for option_index, (text, score) in enumerate(question_data["options"], start=1):
                db.add(
                    StageOneOption(
                        question_id=question.id,
                        text=text,
                        score=score,
                        sort_order=option_index,
                    )
                )

    has_ranges = db.scalar(select(ResultRange.id).limit(1))
    if not has_ranges:
        for range_index, range_data in enumerate(RESULT_RANGE_SEED, start=1):
            result_range = ResultRange(
                title=range_data["title"],
                summary=range_data["summary"],
                key_task=range_data["key_task"],
                min_score=range_data["min_score"],
                max_score=range_data["max_score"],
                sort_order=range_index,
            )
            db.add(result_range)
            db.flush()
            for question_index, question_text in enumerate(range_data["open_questions"], start=1):
                db.add(
                    ResultOpenQuestion(
                        result_range_id=result_range.id,
                        text=question_text,
                        sort_order=question_index,
                    )
                )

    db.commit()
