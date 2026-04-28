from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession, require_admin
from app.core.config import get_settings
from app.models.question import Question
from app.models.submission import UserSubmission
from app.models.topic import Topic
from app.schemas.auth import AdminLoginRequest, AdminLoginResponse
from app.schemas.question import QuestionCreate, QuestionRead, QuestionUpdate
from app.schemas.settings import AppSettingsRead, AppSettingsUpdate
from app.schemas.submission import SubmissionRead
from app.schemas.topic import TopicCreate, TopicRead, TopicUpdate, TopicWithQuestionsRead
from app.services.auth import create_admin_token
from app.services.settings_service import get_or_create_settings


router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest) -> AdminLoginResponse:
    settings = get_settings()
    if payload.password != settings.admin_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    return AdminLoginResponse(access_token=create_admin_token())


@router.get("/settings", response_model=AppSettingsRead, dependencies=[Depends(require_admin)])
def get_settings_admin(db: DBSession) -> AppSettingsRead:
    return get_or_create_settings(db)


@router.put("/settings", response_model=AppSettingsRead, dependencies=[Depends(require_admin)])
def update_settings(payload: AppSettingsUpdate, db: DBSession) -> AppSettingsRead:
    settings_row = get_or_create_settings(db)
    for field, value in payload.model_dump().items():
        setattr(settings_row, field, value)
    db.commit()
    db.refresh(settings_row)
    return settings_row


@router.get("/topics", response_model=list[TopicWithQuestionsRead], dependencies=[Depends(require_admin)])
def get_topics(db: DBSession) -> list[Topic]:
    statement = select(Topic).options(selectinload(Topic.questions)).order_by(Topic.sort_order.asc(), Topic.id.asc())
    return list(db.scalars(statement).all())


@router.post("/topics", response_model=TopicRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_topic(payload: TopicCreate, db: DBSession) -> Topic:
    topic = Topic(**payload.model_dump())
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.get("/topics/{topic_id}", response_model=TopicWithQuestionsRead, dependencies=[Depends(require_admin)])
def get_topic(topic_id: int, db: DBSession) -> Topic:
    topic = db.scalar(select(Topic).where(Topic.id == topic_id).options(selectinload(Topic.questions)))
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    return topic


@router.put("/topics/{topic_id}", response_model=TopicRead, dependencies=[Depends(require_admin)])
def update_topic(topic_id: int, payload: TopicUpdate, db: DBSession) -> Topic:
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    for field, value in payload.model_dump().items():
        setattr(topic, field, value)
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_topic(topic_id: int, db: DBSession) -> None:
    topic = db.get(Topic, topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    db.delete(topic)
    db.commit()


@router.post("/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_question(payload: QuestionCreate, db: DBSession) -> Question:
    topic = db.get(Topic, payload.topic_id)
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")
    question = Question(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.put("/questions/{question_id}", response_model=QuestionRead, dependencies=[Depends(require_admin)])
def update_question(question_id: int, payload: QuestionUpdate, db: DBSession) -> Question:
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    for field, value in payload.model_dump().items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_question(question_id: int, db: DBSession) -> None:
    question = db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    db.delete(question)
    db.commit()


@router.get("/submissions", response_model=list[SubmissionRead], dependencies=[Depends(require_admin)])
def get_submissions(db: DBSession) -> list[SubmissionRead]:
    submissions = db.scalars(select(UserSubmission).order_by(UserSubmission.created_at.desc())).all()
    topics = {topic.id: topic.title for topic in db.scalars(select(Topic)).all()}
    return [
        SubmissionRead(
            id=item.id,
            topic_id=item.topic_id,
            topic_title=topics.get(item.topic_id, "Unknown"),
            telegram_id=item.telegram_id,
            username=item.username,
            first_name=item.first_name,
            last_name=item.last_name,
            answers=item.answers,
            ai_response=item.ai_response,
            status=item.status,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in submissions
    ]


@router.get("/submissions/{submission_id}", response_model=SubmissionRead, dependencies=[Depends(require_admin)])
def get_submission(submission_id: int, db: DBSession) -> SubmissionRead:
    submission = db.get(UserSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    topic = db.get(Topic, submission.topic_id)
    return SubmissionRead(
        id=submission.id,
        topic_id=submission.topic_id,
        topic_title=topic.title if topic else "Unknown",
        telegram_id=submission.telegram_id,
        username=submission.username,
        first_name=submission.first_name,
        last_name=submission.last_name,
        answers=submission.answers,
        ai_response=submission.ai_response,
        status=submission.status,
        created_at=submission.created_at,
        updated_at=submission.updated_at,
    )
