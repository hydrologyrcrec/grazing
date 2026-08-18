import type { Pasture } from "@/types/pasture";

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortPasturesByRecentUpdate(
  pastures: readonly Pasture[],
): Pasture[] {
  return [...pastures].sort(
    (pastureA, pastureB) =>
      toTimestamp(pastureB.updatedAt) - toTimestamp(pastureA.updatedAt),
  );
}
