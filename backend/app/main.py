from contextlib import asynccontextmanager
import fcntl

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.admin import router as admin_router
from app.api.public import router as public_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import flow, open_event, question, settings, submission, topic  # noqa: F401
from app.services.seed import seed_initial_data


settings_obj = get_settings()


def ensure_schema_compatibility() -> None:
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                ALTER TABLE app_settings
                ADD COLUMN IF NOT EXISTS app_title VARCHAR(255) DEFAULT '10 вопросов'
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE app_settings
                ADD COLUMN IF NOT EXISTS app_description TEXT
                DEFAULT 'Выберите психологическую тему и ответьте на 10 вопросов.'
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE app_settings
                ADD COLUMN IF NOT EXISTS final_title VARCHAR(255) DEFAULT 'Спасибо за ответы!'
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE app_settings
                ADD COLUMN IF NOT EXISTS final_button_text VARCHAR(255) DEFAULT 'Пройти заново'
                """
            )
        )
        connection.execute(
            text(
                """
                UPDATE app_settings
                SET app_title = COALESCE(NULLIF(app_title, ''), '10 вопросов'),
                    app_description = COALESCE(
                        NULLIF(app_description, ''),
                        'Выберите психологическую тему и ответьте на 10 вопросов.'
                    ),
                    final_title = COALESCE(NULLIF(final_title, ''), 'Спасибо за ответы!'),
                    final_button_text = COALESCE(NULLIF(final_button_text, ''), 'Пройти заново')
                """
            )
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    with open("/tmp/quiz10-startup.lock", "w", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file, fcntl.LOCK_EX)
        Base.metadata.create_all(bind=engine)
        ensure_schema_compatibility()
        db = SessionLocal()
        try:
            seed_initial_data(db)
        finally:
            db.close()
            fcntl.flock(lock_file, fcntl.LOCK_UN)
    yield


app = FastAPI(title=settings_obj.app_name, debug=settings_obj.debug, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings_obj.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router, prefix=settings_obj.api_prefix)
app.include_router(admin_router, prefix=settings_obj.api_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    finally:
        db.close()
    return {"status": "ok"}
