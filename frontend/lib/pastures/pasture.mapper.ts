import type { Prisma } from "@prisma/client";
import { boundaryToLatLngCoordinates } from "@/lib/pastures/pasture.geometry";
import type {
  GeoJsonPolygon,
  PastureResponse,
} from "@/lib/pastures/pasture.types";
import type { PastureRecord } from "@/lib/pastures/pasture.repository";

function asGeoJsonPolygon(value: Prisma.JsonValue): GeoJsonPolygon {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    value.type !== "Polygon" ||
    !Array.isArray(value.coordinates)
  ) {
    throw new Error("Stored pasture boundary is not a GeoJSON Polygon.");
  }

  return value as unknown as GeoJsonPolygon;
}

export function toPastureResponse(record: PastureRecord): PastureResponse {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status,
    landUse: record.landUse,
    grassType: record.grassType,
    color: record.color,
    coordinates: boundaryToLatLngCoordinates(asGeoJsonPolygon(record.boundary)),
    centroid: [record.centroidLat.toNumber(), record.centroidLng.toNumber()],
    bounds: {
      north: record.boundingNorth.toNumber(),
      south: record.boundingSouth.toNumber(),
      east: record.boundingEast.toNumber(),
      west: record.boundingWest.toNumber(),
    },
    areaAcres: record.areaAcres.toNumber(),
    grazeableAreaAcres: record.grazeableAreaAcres.toNumber(),
    version: record.version,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
