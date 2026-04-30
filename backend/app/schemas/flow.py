from datetime import datetime

from pydantic import BaseModel

from app.models.flow import StageQuestionType
from app.schemas.common import ORMModel
from app.schemas.settings import AppSettingsRead, AppSettingsUpdate, PublicSettingsRead


class StageOneOptionRead(ORMModel):
    id: int
    text: str
    score: int
    sort_order: int


class StageOneQuestionRead(ORMModel):
    id: int
    text: str
    question_type: StageQuestionType
    sort_order: int
    options: list[StageOneOptionRead]


class ResultOpenQuestionRead(ORMModel):
    id: int
    text: str
    sort_order: int


class ResultRangeRead(ORMModel):
    id: int
    title: str
    summary: str
    key_task: str
    min_score: int
    max_score: int
    sort_order: int
    open_questions: list[ResultOpenQuestionRead]


class PublicFlowRead(BaseModel):
    settings: PublicSettingsRead
    stage_one_questions: list[StageOneQuestionRead]
    result_ranges: list[ResultRangeRead]


class PublicBootstrapRead(PublicFlowRead):
    user_daily_remaining: int
    global_daily_remaining: int


class StageOneOptionInput(BaseModel):
    text: str
    score: int
    sort_order: int = 0


class StageOneQuestionInput(BaseModel):
    text: str
    question_type: StageQuestionType
    sort_order: int = 0
    options: list[StageOneOptionInput]


class ResultOpenQuestionInput(BaseModel):
    text: str
    sort_order: int = 0


class ResultRangeInput(BaseModel):
    title: str
    summary: str
    key_task: str
    min_score: int
    max_score: int
    sort_order: int = 0
    open_questions: list[ResultOpenQuestionInput] = []


class FlowConfigRead(BaseModel):
    settings: AppSettingsRead
    stage_one_questions: list[StageOneQuestionRead]
    result_ranges: list[ResultRangeRead]


class FlowConfigUpdate(BaseModel):
    settings: AppSettingsUpdate
    stage_one_questions: list[StageOneQuestionInput]
    result_ranges: list[ResultRangeInput]


class StageOneSubmissionAnswerInput(BaseModel):
    question_id: int
    selected_option_ids: list[int]


class StageTwoSubmissionAnswerInput(BaseModel):
    question_id: int
    answer: str


class SurveySubmissionCreate(BaseModel):
    telegram_id: str | None = None
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    request_help: bool = True
    stage_one_answers: list[StageOneSubmissionAnswerInput]


class SurveySubmissionResponse(BaseModel):
    success: bool
    total_score: int
    result_title: str
    request_help: bool
    sent_to: str


class SurveySubmissionRead(ORMModel):
    id: int
    telegram_id: str | None
    username: str | None
    first_name: str | None
    last_name: str | None
    total_score: int
    continued_to_stage_two: bool
    result_title: str
    result_summary: str
    key_task: str
    stage_one_answers: list[dict]
    stage_two_answers: list[dict]
    created_at: datetime
    updated_at: datetime
