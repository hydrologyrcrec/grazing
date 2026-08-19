import type { Pasture } from "@/types/pasture";

function toTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function getMostRecentlyUpdatedPasture(
  pastures: readonly Pasture[],
): Pasture | null {
  return pastures.reduce<Pasture | null>((mostRecent, pasture) => {
    if (!mostRecent) return pasture;

    return toTimestamp(pasture.updatedAt) > toTimestamp(mostRecent.updatedAt)
      ? pasture
      : mostRecent;
  }, null);
}

export function findPastureById(
  pastures: readonly Pasture[],
  pastureId: string | null,
): Pasture | null {
  if (!pastureId) return null;
  return pastures.find((pasture) => pasture.id === pastureId) ?? null;
}
