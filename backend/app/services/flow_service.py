from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.flow import ResultOpenQuestion, ResultRange, StageOneOption, StageOneQuestion
from app.models.settings import AppSettings
from app.schemas.flow import FlowConfigUpdate
from app.services.settings_service import get_or_create_settings


def get_flow_config(db: Session) -> tuple[AppSettings, list[StageOneQuestion], list[ResultRange]]:
    settings = get_or_create_settings(db)
    stage_one_questions = list(
        db.scalars(
            select(StageOneQuestion)
            .options(selectinload(StageOneQuestion.options))
            .order_by(StageOneQuestion.sort_order.asc(), StageOneQuestion.id.asc())
        ).all()
    )
    result_ranges = list(
        db.scalars(
            select(ResultRange)
            .options(selectinload(ResultRange.open_questions))
            .order_by(ResultRange.sort_order.asc(), ResultRange.id.asc())
        ).all()
    )
    return settings, stage_one_questions, result_ranges


def replace_flow_config(db: Session, payload: FlowConfigUpdate) -> tuple[AppSettings, list[StageOneQuestion], list[ResultRange]]:
    settings = get_or_create_settings(db)
    for field, value in payload.settings.model_dump().items():
        if field in {"id", "created_at", "updated_at"}:
            continue
        setattr(settings, field, value)

    db.execute(delete(StageOneOption))
    db.execute(delete(StageOneQuestion))
    db.execute(delete(ResultOpenQuestion))
    db.execute(delete(ResultRange))
    db.flush()

    for question_payload in payload.stage_one_questions:
        question = StageOneQuestion(
            text=question_payload.text,
            question_type=question_payload.question_type,
            sort_order=question_payload.sort_order,
        )
        db.add(question)
        db.flush()
        for option_payload in question_payload.options:
            db.add(
                StageOneOption(
                    question_id=question.id,
                    text=option_payload.text,
                    score=option_payload.score,
                    sort_order=option_payload.sort_order,
                )
            )

    for range_payload in payload.result_ranges:
        result_range = ResultRange(
            title=range_payload.title,
            summary=range_payload.summary,
            key_task=range_payload.key_task,
            min_score=range_payload.min_score,
            max_score=range_payload.max_score,
            sort_order=range_payload.sort_order,
        )
        db.add(result_range)
        db.flush()
        for question_payload in range_payload.open_questions:
            db.add(
                ResultOpenQuestion(
                    result_range_id=result_range.id,
                    text=question_payload.text,
                    sort_order=question_payload.sort_order,
                )
            )

    db.commit()
    return get_flow_config(db)
