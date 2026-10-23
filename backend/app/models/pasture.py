from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import CHAR, JSON, DateTime, Enum, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.security import utc_now
from app.db.base import Base
from app.models.enums import LandUse, PastureStatus


class Pasture(Base):
    __tablename__ = "Pasture"
    __table_args__ = (
        Index("Pasture_createdById_name_key", "createdById", "name", unique=True),
        Index("Pasture_createdById_status_idx", "createdById", "status"),
        Index("Pasture_createdById_updatedAt_idx", "createdById", "updatedAt"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    created_by_id: Mapped[UUID] = mapped_column(
        "createdById", ForeignKey("User.id", ondelete="RESTRICT")
    )
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[PastureStatus] = mapped_column(
        Enum(PastureStatus, name="PastureStatus"),
        default=PastureStatus.ACTIVE,
        server_default="ACTIVE",
    )
    land_use: Mapped[LandUse] = mapped_column(
        "landUse", Enum(LandUse, name="LandUse"), default=LandUse.GRAZING, server_default="GRAZING"
    )
    grass_type: Mapped[str] = mapped_column("grassType", String(150))
    color: Mapped[str] = mapped_column(CHAR(7), default="#28A8CF", server_default="#28A8CF")
    boundary: Mapped[dict] = mapped_column(JSON().with_variant(JSONB, "postgresql"))
    centroid_lat: Mapped[Decimal] = mapped_column("centroidLat", Numeric(9, 6))
    centroid_lng: Mapped[Decimal] = mapped_column("centroidLng", Numeric(9, 6))
    bounding_north: Mapped[Decimal] = mapped_column("boundingNorth", Numeric(9, 6))
    bounding_south: Mapped[Decimal] = mapped_column("boundingSouth", Numeric(9, 6))
    bounding_east: Mapped[Decimal] = mapped_column("boundingEast", Numeric(9, 6))
    bounding_west: Mapped[Decimal] = mapped_column("boundingWest", Numeric(9, 6))
    area_acres: Mapped[Decimal] = mapped_column("areaAcres", Numeric(12, 4))
    grazeable_area_acres: Mapped[Decimal] = mapped_column("grazeableAreaAcres", Numeric(12, 4))
    version: Mapped[int] = mapped_column(default=1, server_default="1")
    created_at: Mapped[datetime] = mapped_column(
        "createdAt", DateTime(timezone=True), default=utc_now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt", DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )
    archived_at: Mapped[datetime | None] = mapped_column("archivedAt", DateTime(timezone=True))
