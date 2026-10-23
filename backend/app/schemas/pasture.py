from datetime import datetime
from typing import Annotated, Self
from uuid import UUID

from pydantic import Field, StrictFloat, field_validator, model_validator

from app.models.enums import LandUse, PastureStatus
from app.schemas.base import ApiModel

Latitude = Annotated[StrictFloat, Field(ge=-90, le=90, allow_inf_nan=False)]
Longitude = Annotated[StrictFloat, Field(ge=-180, le=180, allow_inf_nan=False)]
Coordinate = tuple[Latitude, Longitude]
Coordinates = Annotated[list[Coordinate], Field(min_length=3, max_length=5000)]
Name = Annotated[str, Field(min_length=1, max_length=255)]
GrassType = Annotated[str, Field(min_length=1, max_length=150)]
Color = Annotated[str, Field(pattern=r"^#[0-9a-fA-F]{6}$")]
PositiveArea = Annotated[StrictFloat, Field(gt=0, allow_inf_nan=False)]


class PastureCreate(ApiModel):
    name: Name
    description: str | None = Field(default=None, max_length=10000)
    land_use: LandUse = LandUse.GRAZING
    grass_type: GrassType
    color: Color = "#28A8CF"
    coordinates: Coordinates
    grazeable_area_acres: PositiveArea

    @field_validator("coordinates")
    @classmethod
    def unique_coordinates(cls, value: list[Coordinate]) -> list[Coordinate]:
        if len({(round(lat, 8), round(lng, 8)) for lat, lng in value}) < 3:
            raise ValueError("A pasture boundary requires at least three unique points.")
        return value


class PastureUpdate(ApiModel):
    version: int = Field(gt=0, strict=True)
    name: Name | None = None
    description: str | None = Field(default=None, max_length=10000)
    land_use: LandUse | None = None
    grass_type: GrassType | None = None
    color: Color | None = None
    coordinates: Coordinates | None = None
    grazeable_area_acres: PositiveArea | None = None

    @model_validator(mode="after")
    def at_least_one_change(self) -> Self:
        if not (self.model_fields_set - {"version"}):
            raise ValueError("At least one pasture field must be supplied.")
        for field in self.model_fields_set - {"version", "description"}:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null.")
        if self.coordinates is not None:
            PastureCreate.unique_coordinates(self.coordinates)
        return self


class PastureBounds(ApiModel):
    north: float
    south: float
    east: float
    west: float


class PastureResponse(ApiModel):
    id: UUID
    name: str
    description: str | None
    status: PastureStatus
    land_use: LandUse
    grass_type: str
    color: str
    coordinates: list[Coordinate]
    centroid: Coordinate
    bounds: PastureBounds
    area_acres: float
    grazeable_area_acres: float
    version: int
    created_at: datetime
    updated_at: datetime


class PastureEnvelope(ApiModel):
    pasture: PastureResponse


class PastureList(ApiModel):
    pastures: list[PastureResponse]
