import enum

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class StageQuestionType(str, enum.Enum):
    single_choice = "single_choice"
    multi_choice = "multi_choice"


class StageOneQuestion(TimestampMixin, Base):
    __tablename__ = "stage_one_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    text: Mapped[str] = mapped_column(Text)
    question_type: Mapped[StageQuestionType] = mapped_column(String(32), default=StageQuestionType.single_choice)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    options: Mapped[list["StageOneOption"]] = relationship(
        "StageOneOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="StageOneOption.sort_order",
    )


class StageOneOption(TimestampMixin, Base):
    __tablename__ = "stage_one_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("stage_one_questions.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    score: Mapped[int] = mapped_column(Integer, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped[StageOneQuestion] = relationship("StageOneQuestion", back_populates="options")


class ResultRange(TimestampMixin, Base):
    __tablename__ = "result_ranges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text)
    key_task: Mapped[str] = mapped_column(Text)
    min_score: Mapped[int] = mapped_column(Integer)
    max_score: Mapped[int] = mapped_column(Integer)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    open_questions: Mapped[list["ResultOpenQuestion"]] = relationship(
        "ResultOpenQuestion",
        back_populates="result_range",
        cascade="all, delete-orphan",
        order_by="ResultOpenQuestion.sort_order",
    )


class ResultOpenQuestion(TimestampMixin, Base):
    __tablename__ = "result_open_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    result_range_id: Mapped[int] = mapped_column(ForeignKey("result_ranges.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    result_range: Mapped[ResultRange] = relationship("ResultRange", back_populates="open_questions")


class SurveySubmission(TimestampMixin, Base):
    __tablename__ = "survey_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    telegram_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    total_score: Mapped[int] = mapped_column(Integer, default=0)
    continued_to_stage_two: Mapped[bool] = mapped_column(Boolean, default=False)
    result_range_id: Mapped[int | None] = mapped_column(
        ForeignKey("result_ranges.id", ondelete="SET NULL"), nullable=True, index=True
    )
    result_title: Mapped[str] = mapped_column(String(255))
    result_summary: Mapped[str] = mapped_column(Text)
    key_task: Mapped[str] = mapped_column(Text)
    stage_one_answers: Mapped[list[dict]] = mapped_column(JSONB)
    stage_two_answers: Mapped[list[dict]] = mapped_column(JSONB, default=list)

    result_range: Mapped[ResultRange | None] = relationship("ResultRange")
