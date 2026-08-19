"use client";

import { PasturePolygon } from "@/components/ui/background-map/PasturePolygon";
import type { PasturePolygonsLayerProps } from "@/components/ui/background-map/background-map.types";

export function PasturePolygonsLayer({
  pastures,
  onPastureSelect,
}: PasturePolygonsLayerProps) {
  return pastures.map((pasture) => (
    <PasturePolygon
      key={pasture.id}
      pasture={pasture}
      onSelect={onPastureSelect}
    />
  ));
}
