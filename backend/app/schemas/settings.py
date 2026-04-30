from pydantic import BaseModel, EmailStr

from app.schemas.common import ORMModel, TimestampRead


class AppSettingsRead(TimestampRead):
    id: int
    app_title: str
    app_description: str
    brand_eyebrow: str
    brand_name: str
    intro_feature_one_title: str
    intro_feature_one_text: str
    intro_feature_two_title: str
    intro_feature_two_text: str
    intro_feature_three_title: str
    intro_feature_three_text: str
    send_message_title: str
    send_message_text: str
    sent_message_title: str
    sent_message_text: str
    final_title: str
    admin_email: EmailStr | None
    thank_you_text: str
    final_button_text: str
    user_daily_open_limit: int
    global_daily_open_limit: int


class AppSettingsUpdate(BaseModel):
    app_title: str = "10 вопросов"
    app_description: str = "Выберите психологическую тему и ответьте на 10 вопросов."
    brand_eyebrow: str = "Щербинина Евгения"
    brand_name: str = "психолог и арт-терапевт"
    intro_feature_one_title: str = "Бережно"
    intro_feature_one_text: str = "Без правильных и неправильных ответов"
    intro_feature_two_title: str = "Точно"
    intro_feature_two_text: str = "Твое текущее состояние"
    intro_feature_three_title: str = "Спокойно"
    intro_feature_three_text: str = "Загляни вглубь себя"
    send_message_title: str = "Посылка сообщения"
    send_message_text: str = "Отправь мне результаты твоего теста, я посмотрю их и свяжусь с тобой"
    sent_message_title: str = "Сообщение послано"
    sent_message_text: str = "Спасибо! Я получила твои ответы, скоро свяжусь с тобой"
    final_title: str = "Спасибо за ответы!"
    admin_email: EmailStr | None = None
    thank_you_text: str
    final_button_text: str = "Пройти заново"
    user_daily_open_limit: int = 100
    global_daily_open_limit: int = 100


class PublicSettingsRead(ORMModel):
    app_title: str
    app_description: str
    brand_eyebrow: str
    brand_name: str
    intro_feature_one_title: str
    intro_feature_one_text: str
    intro_feature_two_title: str
    intro_feature_two_text: str
    intro_feature_three_title: str
    intro_feature_three_text: str
    send_message_title: str
    send_message_text: str
    sent_message_title: str
    sent_message_text: str
    final_title: str
    thank_you_text: str
    final_button_text: str
