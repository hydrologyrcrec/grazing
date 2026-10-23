from pydantic import Field

from app.schemas.base import ApiModel


class GeocodeResult(ApiModel):
    lat: float = Field(ge=-90, le=90, allow_inf_nan=False)
    lng: float = Field(ge=-180, le=180, allow_inf_nan=False)
    label: str = Field(min_length=1)
    bounding_box: tuple[float, float, float, float] | None = None
