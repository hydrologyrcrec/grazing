"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { SearchTargetControllerProps } from "@/components/ui/background-map/background-map.types";
import {
  MAP_MAX_ZOOM,
  SEARCH_RESULT_PADDING,
} from "@/components/ui/background-map/map.constants";

function isBoundingBox(
  value: number[] | undefined,
): value is [number, number, number, number] {
  return value?.length === 4 && value.every(Number.isFinite);
}

export function SearchTargetController({
  searchTarget,
}: SearchTargetControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!searchTarget) return;

    if (isBoundingBox(searchTarget.boundingBox)) {
      const [south, north, west, east] = searchTarget.boundingBox;

      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { maxZoom: MAP_MAX_ZOOM, padding: SEARCH_RESULT_PADDING },
      );
      return;
    }

    map.flyTo([searchTarget.lat, searchTarget.lng], MAP_MAX_ZOOM, {
      duration: 1.2,
    });
  }, [map, searchTarget]);

  return null;
}
