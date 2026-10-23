from fastapi import APIRouter
from sqlalchemy import text

from app.api.dependencies import Db
from app.core.errors import ApiError

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/live")
def live() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def ready(db: Db) -> dict[str, str]:
    try:
        db.execute(text('SELECT 1 FROM "User" LIMIT 1'))
        return {"status": "ready"}
    except Exception as error:
        raise ApiError(
            503, "NOT_READY", "Database is unavailable or migrations are missing."
        ) from error
