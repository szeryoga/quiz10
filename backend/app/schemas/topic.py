from pydantic import BaseModel

from app.schemas.common import TimestampRead
from app.schemas.question import QuestionRead


class TopicCreate(BaseModel):
    title: str
    description: str | None = None
    is_active: bool = True
    sort_order: int = 0


class TopicUpdate(BaseModel):
    title: str
    description: str | None = None
    is_active: bool = True
    sort_order: int = 0


class TopicRead(TimestampRead):
    id: int
    title: str
    description: str | None
    is_active: bool
    sort_order: int


class TopicWithQuestionsRead(TopicRead):
    questions: list[QuestionRead]
