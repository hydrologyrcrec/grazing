from dataclasses import asdict
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.db.errors import is_unique_violation
from app.models.pasture import Pasture
from app.repositories.pastures import PastureRepository
from app.schemas.pasture import PastureBounds, PastureCreate, PastureResponse, PastureUpdate
from app.services.auth import aware
from app.services.geometry import calculate_geometry


def map_pasture(record: Pasture) -> PastureResponse:
    ring = record.boundary["coordinates"][0]
    if ring[0] == ring[-1]:
        ring = ring[:-1]
    return PastureResponse(
        id=record.id,
        name=record.name,
        description=record.description,
        status=record.status,
        land_use=record.land_use,
        grass_type=record.grass_type,
        color=record.color,
        coordinates=[(lat, lng) for lng, lat in ring],
        centroid=(float(record.centroid_lat), float(record.centroid_lng)),
        bounds=PastureBounds(
            north=float(record.bounding_north),
            south=float(record.bounding_south),
            east=float(record.bounding_east),
            west=float(record.bounding_west),
        ),
        area_acres=float(record.area_acres),
        grazeable_area_acres=float(record.grazeable_area_acres),
        version=record.version,
        created_at=aware(record.created_at),
        updated_at=aware(record.updated_at),
    )


def validate_area(grazeable: float, total: float) -> None:
    if grazeable > total + 0.01:
        raise ApiError(
            400, "INVALID_GRAZEABLE_AREA", "Grazeable area cannot exceed total pasture area."
        )


class PastureService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = PastureRepository(db)

    def list(self, user_id: UUID) -> list[PastureResponse]:
        return [map_pasture(record) for record in self.repository.list_active(user_id)]

    def _record(self, user_id: UUID, pasture_id: UUID) -> Pasture:
        record = self.repository.by_owner(pasture_id, user_id)
        if not record:
            raise ApiError(404, "PASTURE_NOT_FOUND", "Pasture was not found.")
        return record

    def get(self, user_id: UUID, pasture_id: UUID) -> PastureResponse:
        return map_pasture(self._record(user_id, pasture_id))

    def create(self, user_id: UUID, payload: PastureCreate) -> PastureResponse:
        geometry = calculate_geometry(payload.coordinates)
        validate_area(payload.grazeable_area_acres, geometry.area_acres)
        values = payload.model_dump(exclude={"coordinates"})
        try:
            record = self.repository.add(
                Pasture(created_by_id=user_id, **values, **asdict(geometry))
            )
            self.db.commit()
            return map_pasture(record)
        except IntegrityError as error:
            self.db.rollback()
            if not is_unique_violation(error):
                raise
            raise ApiError(
                409, "PASTURE_NAME_EXISTS", "You already have a pasture with this name."
            ) from error

    def update(self, user_id: UUID, pasture_id: UUID, payload: PastureUpdate) -> PastureResponse:
        existing = self._record(user_id, pasture_id)
        geometry = (
            calculate_geometry(payload.coordinates) if payload.coordinates is not None else None
        )
        total = geometry.area_acres if geometry else float(existing.area_acres)
        grazeable = (
            payload.grazeable_area_acres
            if payload.grazeable_area_acres is not None
            else float(existing.grazeable_area_acres)
        )
        validate_area(grazeable, total)
        values = payload.model_dump(exclude={"version", "coordinates"}, exclude_unset=True)
        if geometry:
            values.update(asdict(geometry))
        try:
            if not self.repository.update_versioned(pasture_id, user_id, payload.version, values):
                raise ApiError(
                    409,
                    "PASTURE_VERSION_CONFLICT",
                    "This pasture was modified elsewhere. Reload it and try again.",
                )
            response = self.get(user_id, pasture_id)
            self.db.commit()
            return response
        except IntegrityError as error:
            self.db.rollback()
            if not is_unique_violation(error):
                raise
            raise ApiError(
                409, "PASTURE_NAME_EXISTS", "You already have a pasture with this name."
            ) from error

    def archive(self, user_id: UUID, pasture_id: UUID) -> None:
        if not self.repository.archive(pasture_id, user_id):
            raise ApiError(404, "PASTURE_NOT_FOUND", "Pasture was not found.")
        self.db.commit()
