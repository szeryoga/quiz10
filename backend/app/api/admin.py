from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps import DBSession, require_admin
from app.core.config import get_settings
from app.models.flow import SurveySubmission
from app.schemas.auth import AdminLoginRequest, AdminLoginResponse
from app.schemas.flow import FlowConfigRead, FlowConfigUpdate, SurveySubmissionRead
from app.services.auth import create_admin_token
from app.services.flow_service import get_flow_config, replace_flow_config


router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest) -> AdminLoginResponse:
    settings = get_settings()
    if payload.password != settings.admin_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный пароль")
    return AdminLoginResponse(access_token=create_admin_token())


@router.get("/flow", response_model=FlowConfigRead, dependencies=[Depends(require_admin)])
def get_admin_flow(db: DBSession) -> FlowConfigRead:
    settings, stage_one_questions, result_ranges = get_flow_config(db)
    return FlowConfigRead(settings=settings, stage_one_questions=stage_one_questions, result_ranges=result_ranges)


@router.put("/flow", response_model=FlowConfigRead, dependencies=[Depends(require_admin)])
def update_admin_flow(payload: FlowConfigUpdate, db: DBSession) -> FlowConfigRead:
    settings, stage_one_questions, result_ranges = replace_flow_config(db, payload)
    return FlowConfigRead(settings=settings, stage_one_questions=stage_one_questions, result_ranges=result_ranges)


@router.get("/submissions", response_model=list[SurveySubmissionRead], dependencies=[Depends(require_admin)])
def get_submissions(db: DBSession) -> list[SurveySubmission]:
    return list(db.scalars(select(SurveySubmission).order_by(SurveySubmission.created_at.desc())).all())


@router.get("/submissions/{submission_id}", response_model=SurveySubmissionRead, dependencies=[Depends(require_admin)])
def get_submission(submission_id: int, db: DBSession) -> SurveySubmission:
    submission = db.get(SurveySubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ответ не найден")
    return submission
