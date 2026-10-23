from typing import cast
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.orm import Session

from app.core.security import utc_now
from app.models.enums import PastureStatus
from app.models.pasture import Pasture


class PastureRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_active(self, user_id: UUID) -> list[Pasture]:
        return list(
            self.db.scalars(
                select(Pasture)
                .where(
                    Pasture.created_by_id == user_id,
                    Pasture.status == PastureStatus.ACTIVE,
                )
                .order_by(Pasture.updated_at.desc(), Pasture.id.desc())
            )
        )

    def by_owner(self, pasture_id: UUID, user_id: UUID) -> Pasture | None:
        return self.db.scalar(
            select(Pasture).where(
                Pasture.id == pasture_id,
                Pasture.created_by_id == user_id,
                Pasture.status == PastureStatus.ACTIVE,
            )
        )

    def add(self, pasture: Pasture) -> Pasture:
        self.db.add(pasture)
        self.db.flush()
        return pasture

    def update_versioned(self, pasture_id: UUID, user_id: UUID, version: int, values: dict) -> bool:
        result = self.db.execute(
            update(Pasture)
            .where(
                Pasture.id == pasture_id,
                Pasture.created_by_id == user_id,
                Pasture.status == PastureStatus.ACTIVE,
                Pasture.version == version,
            )
            .values(**values, version=Pasture.version + 1, updated_at=utc_now())
            .execution_options(synchronize_session=False)
        )
        self.db.expire_all()
        return cast(CursorResult, result).rowcount == 1

    def archive(self, pasture_id: UUID, user_id: UUID) -> bool:
        result = self.db.execute(
            update(Pasture)
            .where(
                Pasture.id == pasture_id,
                Pasture.created_by_id == user_id,
                Pasture.status == PastureStatus.ACTIVE,
            )
            .values(
                status=PastureStatus.ARCHIVED,
                archived_at=utc_now(),
                updated_at=utc_now(),
                version=Pasture.version + 1,
            )
            .execution_options(synchronize_session=False)
        )
        return cast(CursorResult, result).rowcount == 1
