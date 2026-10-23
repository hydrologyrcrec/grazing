from dataclasses import dataclass
from datetime import datetime

from fastapi import Response

from app.core.config import Settings
from app.core.security import utc_now


@dataclass(frozen=True)
class SessionTokens:
    access_token: str
    refresh_token: str
    refresh_expires_at: datetime


def set_auth_cookies(response: Response, tokens: SessionTokens, settings: Settings) -> None:
    response.set_cookie(
        settings.cookie_name("access"),
        tokens.access_token,
        max_age=settings.access_token_ttl_seconds,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        settings.cookie_name("refresh"),
        tokens.refresh_token,
        max_age=max(0, int((tokens.refresh_expires_at - utc_now()).total_seconds())),
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )


def clear_auth_cookies(response: Response, settings: Settings) -> None:
    for purpose in ("access", "refresh"):
        response.delete_cookie(
            settings.cookie_name(purpose),
            path="/",
            httponly=True,
            secure=settings.secure_cookies,
            samesite="lax",
        )
