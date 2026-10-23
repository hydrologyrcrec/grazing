from typing import cast
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.orm import Session

from app.core.security import utc_now
from app.models.auth_session import AuthSession


class SessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def by_id(self, session_id: UUID) -> AuthSession | None:
        return self.db.get(AuthSession, session_id)

    def by_hash(self, token_hash: str) -> AuthSession | None:
        return self.db.scalar(select(AuthSession).where(AuthSession.token_hash == token_hash))

    def add(self, session: AuthSession) -> AuthSession:
        self.db.add(session)
        self.db.flush()
        return session

    def rotate(self, session_id: UUID, old_hash: str, new_hash: str) -> bool:
        result = self.db.execute(
            update(AuthSession)
            .where(
                AuthSession.id == session_id,
                AuthSession.token_hash == old_hash,
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > utc_now(),
            )
            .values(token_hash=new_hash, last_used_at=utc_now())
            .execution_options(synchronize_session=False),
        )
        return cast(CursorResult, result).rowcount == 1

    def revoke(self, token_hash: str) -> None:
        self.db.execute(
            update(AuthSession)
            .where(AuthSession.token_hash == token_hash, AuthSession.revoked_at.is_(None))
            .values(revoked_at=utc_now())
        )
