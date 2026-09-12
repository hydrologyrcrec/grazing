"use client";

import { MapContainer, ZoomControl } from "react-leaflet";

import { BaseMapLayers } from "@/components/ui/background-map/BaseMapLayers";
import type { BackgroundMapCanvasProps } from "@/components/ui/background-map/background-map.types";
import { PastureFocusController } from "@/components/ui/background-map/PastureFocusController";
import { PasturePolygonsLayer } from "@/components/ui/background-map/PasturePolygonsLayer";
import { PolygonDrawController } from "@/components/ui/background-map/PolygonDrawController";
import { SearchTargetController } from "@/components/ui/background-map/SearchTargetController";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";

export function BackgroundMapCanvas({
  drawRequest,
  searchTarget,
  pastures,
  lastSavedPasture,
  pastureToFocus,
  onPastureSelect,
}: BackgroundMapCanvasProps) {
  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      zoomControl={false}
      className="h-full w-full"
    >
      <ZoomControl position="bottomright" />

      <BaseMapLayers />
      <SearchTargetController searchTarget={searchTarget} />
      <PolygonDrawController drawRequest={drawRequest} />
      <PastureFocusController pasture={lastSavedPasture} animated={false} />
      <PastureFocusController pasture={pastureToFocus} animated />
      <PasturePolygonsLayer
        pastures={pastures}
        onPastureSelect={onPastureSelect}
      />
    </MapContainer>
  );
}