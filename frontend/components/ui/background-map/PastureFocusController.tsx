"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { PastureFocusControllerProps } from "@/components/ui/background-map/background-map.types";
import {
  MAP_MAX_ZOOM,
  PASTURE_FOCUS_PADDING,
} from "@/components/ui/background-map/map.constants";

export function PastureFocusController({
  pasture,
  animated,
}: PastureFocusControllerProps) {
  const map = useMap();
  const focusedPastureId = useRef<string | null>(null);

  useEffect(() => {
    if (!pasture || focusedPastureId.current === pasture.id) return;

    const bounds = L.latLngBounds(
      pasture.coordinates.map(([lat, lng]) => [lat, lng] as L.LatLngTuple),
    );

    if (!bounds.isValid()) return;

    map.fitBounds(bounds, {
      padding: PASTURE_FOCUS_PADDING,
      maxZoom: MAP_MAX_ZOOM,
      animate: animated,
      ...(animated ? { duration: 0.8 } : {}),
    });

    focusedPastureId.current = pasture.id;
  }, [animated, map, pasture]);

  return null;
}
