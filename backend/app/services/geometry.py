import math
from dataclasses import dataclass

from shapely.geometry import Polygon
from shapely.validation import explain_validity

from app.core.errors import ApiError
from app.schemas.pasture import Coordinate

SQUARE_METERS_PER_ACRE = 4046.8564224
EARTH_RADIUS_METERS = 6371008.8  # Same spherical radius used by Turf.js.


@dataclass(frozen=True)
class PastureGeometry:
    boundary: dict
    area_acres: float
    centroid_lat: float
    centroid_lng: float
    bounding_north: float
    bounding_south: float
    bounding_east: float
    bounding_west: float


def calculate_geometry(coordinates: list[Coordinate]) -> PastureGeometry:
    points = list(coordinates)
    if len(points) > 1 and points[0] == points[-1]:
        points = points[:-1]
    ring = [(lng, lat) for lat, lng in points]
    polygon = Polygon(ring)
    if not polygon.is_valid or polygon.is_empty or len(set(ring)) < 3:
        raise ApiError(
            400, "INVALID_BOUNDARY", f"Invalid pasture boundary: {explain_validity(polygon)}"
        )
    # Pastures are local. Reject antimeridian-spanning rings instead of silently miscomputing area.
    if max(lng for lng, _ in ring) - min(lng for lng, _ in ring) > 180:
        raise ApiError(400, "INVALID_BOUNDARY", "Boundary must not cross the antimeridian.")
    radians = [(math.radians(lng), math.radians(lat)) for lng, lat in ring]
    total = 0.0
    for index in range(len(radians)):
        lower = radians[index]
        middle = radians[(index + 1) % len(radians)]
        upper = radians[(index + 2) % len(radians)]
        total += (upper[0] - lower[0]) * math.sin(middle[1])
    area = abs(total * EARTH_RADIUS_METERS**2 / 2) / SQUARE_METERS_PER_ACRE
    if not math.isfinite(area) or area <= 0.0001:
        raise ApiError(400, "INVALID_BOUNDARY", "The boundary must enclose a measurable area.")
    return PastureGeometry(
        boundary={"type": "Polygon", "coordinates": [[list(point) for point in ring + [ring[0]]]]},
        area_acres=round(area, 4),
        centroid_lat=round(sum(lat for _, lat in ring) / len(ring), 6),
        centroid_lng=round(sum(lng for lng, _ in ring) / len(ring), 6),
        bounding_north=round(max(lat for _, lat in ring), 6),
        bounding_south=round(min(lat for _, lat in ring), 6),
        bounding_east=round(max(lng for lng, _ in ring), 6),
        bounding_west=round(min(lng for lng, _ in ring), 6),
    )
