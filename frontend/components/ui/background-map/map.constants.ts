import type { PathOptions } from "leaflet";

type BaseMapLayer = Readonly<{
  id: string;
  url: string;
  maxNativeZoom: number;
  maxZoom: number;
}>;

export const MAP_MAX_ZOOM = 18;

export const SEARCH_RESULT_PADDING: [number, number] = [30, 30];
export const PASTURE_FOCUS_PADDING: [number, number] = [70, 70];

export const DRAW_PATH_OPTIONS = {
  color: "#f5a623",
  fillColor: "#f5a623",
  fillOpacity: 0.28,
  weight: 3,
} satisfies PathOptions;

export const BASE_MAP_LAYERS = [
  {
    id: "world-imagery",
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png",
    maxNativeZoom: MAP_MAX_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
  },
  {
    id: "world-transportation",
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}.png",
    maxNativeZoom: MAP_MAX_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
  },
  {
    id: "world-boundaries-and-places",
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}.png",
    maxNativeZoom: MAP_MAX_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
  },
] satisfies readonly BaseMapLayer[];
