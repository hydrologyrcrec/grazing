import type { GeocodeResult } from "@/types/pasture";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBoundingBox(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every(isFiniteNumber)
  );
}

export function isGeocodeResult(value: unknown): value is GeocodeResult {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.lat) &&
    isFiniteNumber(value.lng) &&
    typeof value.label === "string" &&
    value.label.trim().length > 0 &&
    (value.boundingBox === undefined || isBoundingBox(value.boundingBox))
  );
}

export function parseGeocodeResults(value: unknown): GeocodeResult[] {
  if (!Array.isArray(value) || !value.every(isGeocodeResult)) {
    throw new Error("Address service returned an invalid response.");
  }

  return value;
}

export function getApiErrorMessage(value: unknown, fallback: string) {
  if (!isRecord(value)) return fallback;

  if (typeof value.message === "string" && value.message.trim()) {
    return value.message;
  }

  if (typeof value.error === "string" && value.error.trim()) {
    return value.error;
  }

  return fallback;
}
