from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.settings import AppSettings


def get_or_create_settings(db: Session) -> AppSettings:
    settings = db.scalar(select(AppSettings).where(AppSettings.id == 1))
    if settings:
        return settings

    settings = AppSettings(id=1)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings
