import area from "@turf/area";
import type { LatLng, Polygon as LeafletPolygon } from "leaflet";
import type { PolygonCoordinates } from "@/types/pasture";

const SQUARE_METERS_PER_ACRE = 4046.8564224;

function isLatLng(value: unknown): value is LatLng {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<LatLng>;
  return (
    typeof candidate.lat === "number" && typeof candidate.lng === "number"
  );
}

function findFirstRing(value: unknown): LatLng[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (value.every(isLatLng)) return value;

  for (const child of value) {
    const ring = findFirstRing(child);
    if (ring) return ring;
  }

  return null;
}

export function getPolygonCoordinates(
  polygon: LeafletPolygon,
): PolygonCoordinates {
  const firstRing = findFirstRing(polygon.getLatLngs());

  return (
    firstRing?.map(({ lat, lng }) => [lat, lng] as [number, number]) ?? []
  );
}

export function toAcres(coordinates: PolygonCoordinates): number {
  if (coordinates.length < 3) return 0;

  const ring = coordinates.map(([lat, lng]) => [lng, lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first]);
  }

  const squareMeters = area({
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  });

  return squareMeters / SQUARE_METERS_PER_ACRE;
}
