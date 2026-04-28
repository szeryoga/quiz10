from datetime import datetime

from pydantic import BaseModel

from app.models.submission import SubmissionStatus


class SubmissionAnswerInput(BaseModel):
    question_id: int
    question_text: str
    answer: str


class SubmissionCreate(BaseModel):
    topic_id: int
    telegram_id: str | None = None
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    answers: list[SubmissionAnswerInput]


class SubmissionResponse(BaseModel):
    success: bool
    status: SubmissionStatus


class SubmissionRead(BaseModel):
    id: int
    topic_id: int
    topic_title: str
    telegram_id: str | None
    username: str | None
    first_name: str | None
    last_name: str | None
    answers: list[dict]
    ai_response: str | None
    status: SubmissionStatus
    created_at: datetime
    updated_at: datetime
