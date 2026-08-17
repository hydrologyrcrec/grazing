import type { LatLngTuple } from "leaflet";

// Replace only these two values with the center/zoom from your current map.
export const DEFAULT_MAP_CENTER: LatLngTuple = [27.48, -81.92];
export const DEFAULT_MAP_ZOOM = 16;

export const STORAGE_KEYS = {
  deviceId: "grazing.device_id",
  activeSession: "grazing.active_session",
  pastureDraft: "grazing.pasture_draft",
  pastures: "grazing.pastures",
} as const;
