"use client";

import { Polygon, Tooltip } from "react-leaflet";
import type { PasturePolygonProps } from "@/components/ui/background-map/background-map.types";

export function PasturePolygon({ pasture, onSelect }: PasturePolygonProps) {
  return (
    <Polygon
      positions={pasture.coordinates}
      pathOptions={{
        color: pasture.color,
        fillColor: pasture.color,
        fillOpacity: 0.34,
        weight: 3,
      }}
      eventHandlers={{ click: () => onSelect(pasture) }}
    >
      <Tooltip
        permanent
        direction="top"
        offset={[0, -8]}
        className="pasture-label"
      >
        {pasture.name}
      </Tooltip>
    </Polygon>
  );
}
