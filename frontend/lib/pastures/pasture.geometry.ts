import area from "@turf/area";
import centroid from "@turf/centroid";
import { polygon } from "@turf/helpers";
import { ApiError } from "@/lib/api/errors";
import type {
  GeoJsonPolygon,
  GeoJsonPosition,
  LatLngCoordinate,
} from "@/lib/pastures/pasture.types";

const SQUARE_METERS_PER_ACRE = 4046.8564224;

function samePosition(a: GeoJsonPosition, b: GeoJsonPosition) {
  return a[0] === b[0] && a[1] === b[1];
}

function closeRing(coordinates: LatLngCoordinate[]): GeoJsonPosition[] {
  const ring = coordinates.map(
    ([latitude, longitude]) => [longitude, latitude] as GeoJsonPosition,
  );

  if (!samePosition(ring[0], ring[ring.length - 1])) {
    ring.push([...ring[0]] as GeoJsonPosition);
  }

  return ring;
}

function round(value: number, decimalPlaces: number) {
  const multiplier = 10 ** decimalPlaces;
  return Math.round(value * multiplier) / multiplier;
}

export function calculatePastureGeometry(coordinates: LatLngCoordinate[]) {
  const outerRing = closeRing(coordinates);
  const feature = polygon([outerRing]);
  const areaAcres = area(feature) / SQUARE_METERS_PER_ACRE;

  if (!Number.isFinite(areaAcres) || areaAcres <= 0.0001) {
    throw new ApiError(
      400,
      "INVALID_BOUNDARY",
      "The pasture boundary must enclose a measurable area.",
    );
  }

  const [centroidLng, centroidLat] = centroid(feature).geometry.coordinates;
  const longitudes = outerRing.map(([longitude]) => longitude);
  const latitudes = outerRing.map(([, latitude]) => latitude);

  return {
    boundary: feature.geometry as GeoJsonPolygon,
    areaAcres: round(areaAcres, 4),
    centroidLat: round(centroidLat, 6),
    centroidLng: round(centroidLng, 6),
    boundingNorth: round(Math.max(...latitudes), 6),
    boundingSouth: round(Math.min(...latitudes), 6),
    boundingEast: round(Math.max(...longitudes), 6),
    boundingWest: round(Math.min(...longitudes), 6),
  };
}

export function boundaryToLatLngCoordinates(
  boundary: GeoJsonPolygon,
): LatLngCoordinate[] {
  const outerRing = boundary.coordinates[0] ?? [];
  const withoutClosingPoint =
    outerRing.length > 1 && samePosition(outerRing[0], outerRing[outerRing.length - 1])
      ? outerRing.slice(0, -1)
      : outerRing;

  return withoutClosingPoint.map(
    ([longitude, latitude]) => [latitude, longitude] as LatLngCoordinate,
  );
}
