from pydantic import BaseModel

from app.schemas.common import TimestampRead


class QuestionCreate(BaseModel):
    topic_id: int
    text: str
    sort_order: int = 0


class QuestionUpdate(BaseModel):
    text: str
    sort_order: int = 0


class QuestionRead(TimestampRead):
    id: int
    topic_id: int
    text: str
    sort_order: int
