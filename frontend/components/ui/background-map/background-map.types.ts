import type { GeocodeResult, Pasture } from "@/types/pasture";

export type AppBackgroundMapProps = Readonly<{
  drawRequest: number;
  searchTarget: GeocodeResult | null;
  focusPastureId: string | null;
}>;

export type BackgroundMapCanvasProps = Readonly<{
  drawRequest: number;
  searchTarget: GeocodeResult | null;
  pastures: readonly Pasture[];
  lastSavedPasture: Pasture | null;
  pastureToFocus: Pasture | null;
  onPastureSelect: (pasture: Pasture) => void;
}>;

export type SearchTargetControllerProps = Readonly<{
  searchTarget: GeocodeResult | null;
}>;

export type PolygonDrawControllerProps = Readonly<{
  drawRequest: number;
}>;

export type PastureFocusControllerProps = Readonly<{
  pasture: Pasture | null;
  animated: boolean;
}>;

export type PasturePolygonsLayerProps = Readonly<{
  pastures: readonly Pasture[];
  onPastureSelect: (pasture: Pasture) => void;
}>;

export type PasturePolygonProps = Readonly<{
  pasture: Pasture;
  onSelect: (pasture: Pasture) => void;
}>;

export type SelectedPasturePanelProps = Readonly<{
  pasture: Pasture;
  onClose: () => void;
}>;

export type PastureDetailRowProps = Readonly<{
  label: string;
  value: string;
}>;
