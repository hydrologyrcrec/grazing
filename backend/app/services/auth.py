from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.cookies import SessionTokens
from app.core.errors import ApiError
from app.core.security import (
    DUMMY_PASSWORD_HASH,
    create_access_token,
    hash_password,
    hash_refresh_token,
    new_refresh_token,
    utc_now,
    verify_access_token,
    verify_password,
)
from app.db.errors import is_unique_violation
from app.models.auth_session import AuthSession
from app.models.enums import UserStatus
from app.models.user import User
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository
from app.schemas.auth import LoginRequest, PublicUser, SignupRequest


def aware(value: datetime) -> datetime:
    # SQLite tests return naive timestamps; PostgreSQL returns timezone-aware values.
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


class AuthService:
    def __init__(self, db: Session, settings: Settings) -> None:
        self.db = db
        self.settings = settings
        self.users = UserRepository(db)
        self.sessions = SessionRepository(db)

    def _session(self, user: User) -> tuple[PublicUser, SessionTokens]:
        token = new_refresh_token()
        expires = utc_now() + timedelta(seconds=self.settings.refresh_token_ttl_seconds)
        session = self.sessions.add(
            AuthSession(user_id=user.id, token_hash=hash_refresh_token(token), expires_at=expires)
        )
        access = create_access_token(user.id, user.email, session.id, self.settings)
        self.db.commit()
        return PublicUser.model_validate(user), SessionTokens(access, token, expires)

    def signup(self, payload: SignupRequest) -> tuple[PublicUser, SessionTokens]:
        try:
            user = self.users.add(
                User(
                    email=str(payload.email),
                    password_hash=hash_password(payload.password),
                    first_name=payload.first_name,
                    last_name=payload.last_name,
                )
            )
            return self._session(user)
        except IntegrityError as error:
            self.db.rollback()
            if not is_unique_violation(error):
                raise
            raise ApiError(
                409, "EMAIL_ALREADY_REGISTERED", "An account already exists for this email."
            ) from error

    def login(self, payload: LoginRequest) -> tuple[PublicUser, SessionTokens]:
        user = self.users.by_email(str(payload.email))
        valid = verify_password(
            user.password_hash if user else DUMMY_PASSWORD_HASH, payload.password
        )
        if not user or not valid:
            raise ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.")
        if user.status != UserStatus.ACTIVE:
            raise ApiError(403, "ACCOUNT_UNAVAILABLE", "This account is not available.")
        user.last_login_at = utc_now()
        return self._session(user)

    def authenticated_user(self, token: str | None) -> User:
        if not token:
            raise ApiError(401, "ACCESS_MISSING", "Authentication is required.")
        claims = verify_access_token(token, self.settings)
        user = self.users.by_id(UUID(str(claims["sub"])))
        session = self.sessions.by_id(UUID(str(claims["sid"])))
        if (
            not user
            or user.status != UserStatus.ACTIVE
            or not session
            or session.user_id != user.id
            or session.revoked_at
            or aware(session.expires_at) <= utc_now()
        ):
            raise ApiError(401, "SESSION_INVALID", "Your session is no longer valid.")
        return user

    def refresh(self, token: str | None) -> tuple[PublicUser, SessionTokens]:
        invalid = ApiError(
            401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again."
        )
        if not token or len(token) > 128:
            raise invalid
        old_hash = hash_refresh_token(token)
        session = self.sessions.by_hash(old_hash)
        if not session or session.revoked_at or aware(session.expires_at) <= utc_now():
            raise invalid
        user = self.users.by_id(session.user_id)
        if not user or user.status != UserStatus.ACTIVE:
            raise invalid
        next_token = new_refresh_token()
        if not self.sessions.rotate(session.id, old_hash, hash_refresh_token(next_token)):
            raise invalid
        access = create_access_token(user.id, user.email, session.id, self.settings)
        expires = aware(session.expires_at)  # Original absolute 48-hour expiry is preserved.
        self.db.commit()
        return PublicUser.model_validate(user), SessionTokens(access, next_token, expires)

    def logout(self, token: str | None) -> None:
        if token:
            self.sessions.revoke(hash_refresh_token(token))
        self.db.commit()
