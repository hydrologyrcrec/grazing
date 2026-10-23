import pytest

from app.core.errors import ApiError
from app.services.geometry import calculate_geometry
from tests.test_pastures import COORDINATES


def test_spherical_area_matches_turf_reference():
    # Turf @turf/area uses spherical geodesy rather than projected planar area.
    result = calculate_geometry([tuple(point) for point in COORDINATES])
    assert result.area_acres == pytest.approx(2.7106, abs=0.001)
    assert result.boundary["coordinates"][0][0] == [-81.92, 27.48]
    assert result.boundary["coordinates"][0][0] == result.boundary["coordinates"][0][-1]
    assert (
        calculate_geometry(list(reversed([tuple(point) for point in COORDINATES]))).area_acres
        == result.area_acres
    )


def test_antimeridian_rejected():
    with pytest.raises(ApiError):
        calculate_geometry([(1, 179), (2, -179), (3, 179)])
