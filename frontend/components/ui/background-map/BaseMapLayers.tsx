"use client";

import { TileLayer } from "react-leaflet";
import { BASE_MAP_LAYERS } from "@/components/ui/background-map/map.constants";

export function BaseMapLayers() {
  return BASE_MAP_LAYERS.map((layer) => (
    <TileLayer
      key={layer.id}
      url={layer.url}
      maxNativeZoom={layer.maxNativeZoom}
      maxZoom={layer.maxZoom}
    />
  ));
}
