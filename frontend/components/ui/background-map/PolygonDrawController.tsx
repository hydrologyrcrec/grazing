"use client";

import L from "leaflet";
import "leaflet-draw";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import {
  getPolygonCoordinates,
  toAcres,
} from "@/components/ui/background-map/area.utils";
import type { PolygonDrawControllerProps } from "@/components/ui/background-map/background-map.types";
import { DRAW_PATH_OPTIONS } from "@/components/ui/background-map/map.constants";
import { saveDraft } from "@/lib/storage";

function isCreatedEvent(event: L.LeafletEvent): event is L.DrawEvents.Created {
  const candidate = event as Partial<L.DrawEvents.Created>;

  return (
    candidate.layer !== undefined && typeof candidate.layerType === "string"
  );
}

export function PolygonDrawController({
  drawRequest,
}: PolygonDrawControllerProps) {
  const map = useMap();
  const router = useRouter();
  const activeDraw = useRef<L.Draw.Polygon | null>(null);

  useEffect(() => {
    if (drawRequest === 0) return;

    activeDraw.current?.disable();

    /*
     * React Leaflet returns L.Map, but Leaflet Draw's declaration expects
     * L.DrawMap. Leaflet Draw augments the same map object at runtime.
     */
    const drawMap = map as L.DrawMap;

    const draw = new L.Draw.Polygon(drawMap, {
      allowIntersection: false,
      showArea: true,
      metric: true,
      shapeOptions: DRAW_PATH_OPTIONS,
    });

    activeDraw.current = draw;
    draw.enable();

    return () => {
      draw.disable();

      if (activeDraw.current === draw) {
        activeDraw.current = null;
      }
    };
  }, [drawRequest, map]);

  useEffect(() => {
    function handleCreated(event: L.LeafletEvent) {
      if (!isCreatedEvent(event)) return;
      if (event.layerType !== "polygon") return;
      if (!(event.layer instanceof L.Polygon)) return;

      const coordinates = getPolygonCoordinates(event.layer);

      if (coordinates.length < 3) return;

      saveDraft({
        coordinates,
        areaAcres: toAcres(coordinates),
        createdAt: new Date().toISOString(),
      });

      router.push("/form");
    }

    map.on(L.Draw.Event.CREATED, handleCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
    };
  }, [map, router]);

  return null;
}
