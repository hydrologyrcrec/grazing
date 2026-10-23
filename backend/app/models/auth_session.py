from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utc_now
from app.db.base import Base


class AuthSession(Base):
    __tablename__ = "AuthSession"
    __table_args__ = (
        Index("AuthSession_userId_idx", "userId"),
        Index("AuthSession_expiresAt_idx", "expiresAt"),
        Index("AuthSession_userId_revokedAt_idx", "userId", "revokedAt"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column("userId", ForeignKey("User.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column("tokenHash", String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column("expiresAt", DateTime(timezone=True))
    last_used_at: Mapped[datetime] = mapped_column(
        "lastUsedAt", DateTime(timezone=True), default=utc_now, server_default=func.now()
    )
    revoked_at: Mapped[datetime | None] = mapped_column("revokedAt", DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), default=utc_now, server_default=func.now()
    )
