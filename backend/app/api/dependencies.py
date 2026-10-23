from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.user import User
from app.services.auth import AuthService


def get_config(request: Request) -> Settings:
    return request.app.state.settings


def get_db(request: Request) -> Iterator[Session]:
    with request.app.state.database.session_factory() as db:
        try:
            yield db
        except Exception:
            db.rollback()
            raise


Config = Annotated[Settings, Depends(get_config)]
Db = Annotated[Session, Depends(get_db)]


def require_active_user(request: Request, db: Db, settings: Config) -> User:
    return AuthService(db, settings).authenticated_user(
        request.cookies.get(settings.cookie_name("access"))
    )


ActiveUser = Annotated[User, Depends(require_active_user)]
