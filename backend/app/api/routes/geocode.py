from fastapi import APIRouter, Query, Request

from app.api.dependencies import ActiveUser
from app.core.errors import ApiError
from app.schemas.geocode import GeocodeResult

router = APIRouter(tags=["Geocoding"])


@router.get("/geocode", response_model=list[GeocodeResult], response_model_exclude_none=True)
def geocode(
    request: Request, user: ActiveUser, q: str = Query(min_length=3, max_length=256)
) -> list[GeocodeResult]:
    query = q.strip()
    if len(query) < 3 or ";" in query:
        raise ApiError(400, "INVALID_QUERY", "Enter a valid address of at least 3 characters.")
    return request.app.state.geocoding.search(query)
