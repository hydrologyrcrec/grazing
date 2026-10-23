from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utc_now
from app.db.base import Base
from app.models.enums import UserStatus


class User(Base):
    __tablename__ = "User"
    __table_args__ = (Index("User_status_idx", "status"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column("passwordHash", String(255))
    first_name: Mapped[str | None] = mapped_column("firstName", String(100))
    last_name: Mapped[str | None] = mapped_column("lastName", String(100))
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, name="UserStatus"), default=UserStatus.ACTIVE, server_default="ACTIVE"
    )
    email_verified_at: Mapped[datetime | None] = mapped_column(
        "emailVerifiedAt", DateTime(timezone=True)
    )
    last_login_at: Mapped[datetime | None] = mapped_column("lastLoginAt", DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), default=utc_now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )
