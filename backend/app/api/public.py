from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession
from app.models.open_event import AppOpenEvent
from app.models.submission import SubmissionStatus, UserSubmission
from app.models.topic import Topic
from app.schemas.open_event import AppOpenRequest, AppOpenResponse
from app.schemas.settings import PublicSettingsRead
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.schemas.topic import TopicWithQuestionsRead
from app.services.ai import analyze_answers
from app.services.notify import send_notifications
from app.services.settings_service import get_or_create_settings


router = APIRouter(prefix="/public", tags=["public"])


def start_of_day_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)


@router.get("/topics", response_model=list[TopicWithQuestionsRead])
def get_public_topics(db: DBSession) -> list[Topic]:
    statement = (
        select(Topic)
        .where(Topic.is_active.is_(True))
        .options(selectinload(Topic.questions))
        .order_by(Topic.sort_order.asc(), Topic.id.asc())
    )
    return list(db.scalars(statement).all())


@router.get("/settings", response_model=PublicSettingsRead)
def get_public_settings(db: DBSession) -> PublicSettingsRead:
    settings = get_or_create_settings(db)
    return PublicSettingsRead(
        app_title=settings.app_title,
        app_description=settings.app_description,
        thank_you_text=settings.thank_you_text,
    )


@router.post("/open", response_model=AppOpenResponse)
def register_open(payload: AppOpenRequest, request: Request, db: DBSession) -> AppOpenResponse:
    settings = get_or_create_settings(db)
    from_dt = start_of_day_utc()

    global_count = db.scalar(
        select(func.count(AppOpenEvent.id)).where(AppOpenEvent.created_at >= from_dt)
    ) or 0
    if global_count >= settings.global_daily_open_limit:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Global daily limit reached")

    user_count = 0
    if payload.telegram_id:
        user_count = db.scalar(
            select(func.count(AppOpenEvent.id)).where(
                AppOpenEvent.telegram_id == payload.telegram_id,
                AppOpenEvent.created_at >= from_dt,
            )
        ) or 0
        if user_count >= settings.user_daily_open_limit:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="User daily limit reached")

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


@router.post("/submit", response_model=SubmissionResponse)
async def submit_answers(payload: SubmissionCreate, db: DBSession) -> SubmissionResponse:
    topic = db.scalar(
        select(Topic).where(Topic.id == payload.topic_id).options(selectinload(Topic.questions))
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    if not payload.answers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Answers are required")
    if any(not item.answer.strip() for item in payload.answers):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Answers must be non-empty")

    submission = UserSubmission(
        topic_id=payload.topic_id,
        telegram_id=payload.telegram_id,
        username=payload.username,
        first_name=payload.first_name,
        last_name=payload.last_name,
        answers=[item.model_dump() for item in payload.answers],
        status=SubmissionStatus.pending,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    settings = get_or_create_settings(db)
    ok, analysis = await analyze_answers(settings, topic.title, submission.answers)
    submission.ai_response = analysis
    submission.status = SubmissionStatus.analyzed if ok else SubmissionStatus.failed
    db.commit()
    db.refresh(submission)

    await send_notifications(settings, submission, topic)

    return SubmissionResponse(success=True, status=submission.status)
