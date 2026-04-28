from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import func, select

from app.api.deps import DBSession
from app.models.flow import ResultRange, StageOneQuestion, StageQuestionType, SurveySubmission
from app.models.open_event import AppOpenEvent
from app.schemas.flow import PublicFlowRead, SurveySubmissionCreate, SurveySubmissionResponse
from app.schemas.open_event import AppOpenRequest, AppOpenResponse
from app.services.flow_service import get_flow_config
from app.services.notify import send_notifications
from app.services.settings_service import get_or_create_settings


router = APIRouter(prefix="/public", tags=["public"])


def start_of_day_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)


def find_result_range(result_ranges: list[ResultRange], total_score: int) -> ResultRange:
    for result_range in result_ranges:
        if result_range.min_score <= total_score <= result_range.max_score:
            return result_range
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Для набранного количества баллов не найден диапазон результата",
    )


@router.get("/flow", response_model=PublicFlowRead)
def get_public_flow(db: DBSession) -> PublicFlowRead:
    settings, stage_one_questions, result_ranges = get_flow_config(db)
    return PublicFlowRead(settings=settings, stage_one_questions=stage_one_questions, result_ranges=result_ranges)


@router.post("/open", response_model=AppOpenResponse)
def register_open(payload: AppOpenRequest, request: Request, db: DBSession) -> AppOpenResponse:
    settings = get_or_create_settings(db)
    from_dt = start_of_day_utc()

    global_count = db.scalar(
        select(func.count(AppOpenEvent.id)).where(AppOpenEvent.created_at >= from_dt)
    ) or 0
    if global_count >= settings.global_daily_open_limit:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Дневной лимит открытий исчерпан")

    user_count = 0
    if payload.telegram_id:
        user_count = db.scalar(
            select(func.count(AppOpenEvent.id)).where(
                AppOpenEvent.telegram_id == payload.telegram_id,
                AppOpenEvent.created_at >= from_dt,
            )
        ) or 0
        if user_count >= settings.user_daily_open_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Для этого пользователя исчерпан дневной лимит открытий",
            )

    db.add(
        AppOpenEvent(
            telegram_id=payload.telegram_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    )
    db.commit()

    return AppOpenResponse(
        success=True,
        user_daily_remaining=max(settings.user_daily_open_limit - user_count - 1, 0),
        global_daily_remaining=max(settings.global_daily_open_limit - global_count - 1, 0),
    )


@router.post("/submit", response_model=SurveySubmissionResponse)
async def submit_answers(payload: SurveySubmissionCreate, db: DBSession) -> SurveySubmissionResponse:
    _, stage_one_questions, result_ranges = get_flow_config(db)
    questions_map = {question.id: question for question in stage_one_questions}

    if not stage_one_questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Этап 1 не настроен")

    if len(payload.stage_one_answers) != len(stage_one_questions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нужно ответить на все вопросы первого этапа",
        )

    total_score = 0
    stage_one_snapshot: list[dict] = []
    seen_questions: set[int] = set()

    for answer in payload.stage_one_answers:
        question = questions_map.get(answer.question_id)
        if not question:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный вопрос первого этапа")
        if answer.question_id in seen_questions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Вопрос первого этапа продублирован")
        seen_questions.add(answer.question_id)

        option_ids = answer.selected_option_ids
        if not option_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нужно выбрать хотя бы один вариант")
        if question.question_type == StageQuestionType.single_choice and len(option_ids) != 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Для этого вопроса можно выбрать только один вариант",
            )

        option_map = {option.id: option for option in question.options}
        selected_options = []
        for option_id in dict.fromkeys(option_ids):
            option = option_map.get(option_id)
            if not option:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный вариант ответа")
            total_score += option.score
            selected_options.append({"id": option.id, "text": option.text, "score": option.score})

        stage_one_snapshot.append(
            {
                "question_id": question.id,
                "question_text": question.text,
                "question_type": question.question_type,
                "selected_options": selected_options,
            }
        )

    result_range = find_result_range(result_ranges, total_score)

    submission = SurveySubmission(
        telegram_id=payload.telegram_id,
        username=payload.username,
        first_name=payload.first_name,
        last_name=payload.last_name,
        total_score=total_score,
        continued_to_stage_two=payload.request_help,
        result_range_id=result_range.id,
        result_title=result_range.title,
        result_summary=result_range.summary,
        key_task=result_range.key_task,
        stage_one_answers=stage_one_snapshot,
        stage_two_answers=[],
    )
    db.add(submission)
    db.commit()
    settings_row = get_or_create_settings(db)
    sent_to = ""
    if payload.request_help:
        try:
            sent_to = await send_notifications(settings_row, submission)
        except RuntimeError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return SurveySubmissionResponse(
        success=True,
        total_score=total_score,
        result_title=result_range.title,
        request_help=payload.request_help,
        sent_to=sent_to,
    )
