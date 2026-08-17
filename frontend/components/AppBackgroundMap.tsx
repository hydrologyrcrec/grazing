"use client";

import area from "@turf/area";
import L, { LatLng, Polygon as LeafletPolygon } from "leaflet";
import "leaflet-draw";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { getPastures, saveDraft } from "@/lib/storage";
import type {
  GeocodeResult,
  Pasture,
  PolygonCoordinates,
} from "@/types/pasture";

type MapControllerProps = {
  drawRequest: number;
  searchTarget: GeocodeResult | null;
};

type Props = MapControllerProps & {
  focusPastureId: string | null;
};

function toAcres(coordinates: PolygonCoordinates): number {
  const ring = coordinates.map(([lat, lng]) => [lng, lat]);
  if (
    ring.length &&
    (ring[0][0] !== ring.at(-1)?.[0] || ring[0][1] !== ring.at(-1)?.[1])
  ) {
    ring.push([...ring[0]]);
  }
  const squareMeters = area({
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [ring] },
  });
  return squareMeters / 4046.8564224;
}

function MapController({ drawRequest, searchTarget }: MapControllerProps) {
  const map = useMap();
  const router = useRouter();
  const drawRef = useRef<L.Draw.Polygon | null>(null);

  useEffect(() => {
    if (!searchTarget) return;
    if (searchTarget.boundingBox?.length === 4) {
      const [south, north, west, east] = searchTarget.boundingBox;
      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { maxZoom: 18, padding: [30, 30] },
      );
    } else {
      map.flyTo([searchTarget.lat, searchTarget.lng], 18, { duration: 1.2 });
    }
  }, [map, searchTarget]);

  useEffect(() => {
    if (drawRequest === 0) return;
    drawRef.current?.disable();
    const draw = new L.Draw.Polygon(map, {
      allowIntersection: false,
      showArea: true,
      metric: true,
      shapeOptions: {
        color: "#f5a623",
        fillColor: "#f5a623",
        fillOpacity: 0.28,
        weight: 3,
      },
    });
    drawRef.current = draw;
    draw.enable();
    return () => draw.disable();
  }, [drawRequest, map]);

  useEffect(() => {
    const onCreated = (event: L.DrawEvents.Created) => {
      const layer = event.layer as LeafletPolygon;
      const firstRing = layer.getLatLngs()[0] as LatLng[];
      const coordinates = firstRing.map(
        ({ lat, lng }) => [lat, lng] as [number, number],
      );
      saveDraft({
        coordinates,
        areaAcres: toAcres(coordinates),
        createdAt: new Date().toISOString(),
      });
      router.push("/form");
    };
    map.on(L.Draw.Event.CREATED, onCreated);
    return () => map.off(L.Draw.Event.CREATED, onCreated);
  }, [map, router]);

  return null;
}

function FocusLastPasture({ pasture }: { pasture: Pasture | null }) {
  const map = useMap();
  const focusedPastureId = useRef<string | null>(null);

  useEffect(() => {
    if (!pasture || focusedPastureId.current === pasture.id) return;

    const bounds = L.latLngBounds(
      pasture.coordinates.map(([lat, lng]) => [lat, lng] as L.LatLngTuple),
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [70, 70],
        maxZoom: 18,
        animate: false,
      });

      focusedPastureId.current = pasture.id;
    }
  }, [map, pasture]);

  return null;
}

function FocusSelectedPasture({ pasture }: { pasture: Pasture | null }) {
  const map = useMap();
  const focusedPastureId = useRef<string | null>(null);

  useEffect(() => {
    if (!pasture) return;

    if (focusedPastureId.current === pasture.id) {
      return;
    }

    const bounds = L.latLngBounds(
      pasture.coordinates.map(([lat, lng]) => [lat, lng] as L.LatLngTuple),
    );

    if (!bounds.isValid()) return;

    map.fitBounds(bounds, {
      padding: [70, 70],
      maxZoom: 18,
      animate: true,
      duration: 0.8,
    });

    focusedPastureId.current = pasture.id;
  }, [map, pasture]);

  return null;
}

function SelectedPasturePanel({
  pasture,
  onClose,
}: {
  pasture: Pasture;
  onClose: () => void;
}) {
  return (
    <aside className="pasture-panel" aria-label={`${pasture.name} information`}>
      <button
        className="panel-close"
        type="button"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div className="panel-color" style={{ backgroundColor: pasture.color }} />
      <h2>{pasture.name}</h2>
      <dl>
        <div>
          <dt>Total area</dt>
          <dd>{pasture.areaAcres.toFixed(2)} ac</dd>
        </div>
        <div>
          <dt>Grazeable area</dt>
          <dd>{pasture.grazeableAreaAcres.toFixed(2)} ac</dd>
        </div>
        <div>
          <dt>Land use</dt>
          <dd>{pasture.landUse}</dd>
        </div>
        <div>
          <dt>Grass type</dt>
          <dd>{pasture.grassType}</dd>
        </div>
        {pasture.description && (
          <div>
            <dt>Description</dt>
            <dd>{pasture.description}</dd>
          </div>
        )}
        {pasture.fsaIds && (
          <div>
            <dt>FSA IDs</dt>
            <dd>{pasture.fsaIds}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
}

export default function AppBackgroundMap({
  drawRequest,
  searchTarget,
  focusPastureId,
}: Props) {
  const [pastures, setPastures] = useState<Pasture[]>([]);
  const [selected, setSelected] = useState<Pasture | null>(null);
  const lastSavedPasture = useMemo(() => {
    if (pastures.length === 0) return null;

    return [...pastures].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];
  }, [pastures]);

  const pastureToFocus = useMemo(() => {
    if (!focusPastureId) return null;

    return pastures.find((pasture) => pasture.id === focusPastureId) ?? null;
  }, [pastures, focusPastureId]);

  useEffect(() => setPastures(getPastures()), []);
  const mapCenter = useMemo(() => DEFAULT_MAP_CENTER, []);

  return (
    <div className="map-stage">
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_MAP_ZOOM}
        zoomControl
        className="ranch-map"
      >
        {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        /> */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
          maxNativeZoom={18}
          maxZoom={18}
        />
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}.png"
          maxNativeZoom={18}
          maxZoom={18}
        />

        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}.png"
          maxNativeZoom={18}
          maxZoom={18}
        />
        <MapController drawRequest={drawRequest} searchTarget={searchTarget} />

        <FocusLastPasture pasture={lastSavedPasture} />

        <FocusSelectedPasture pasture={pastureToFocus} />
        {pastures.map((pasture) => (
          <Polygon
            key={pasture.id}
            positions={pasture.coordinates}
            pathOptions={{
              color: pasture.color,
              fillColor: pasture.color,
              fillOpacity: 0.34,
              weight: 3,
            }}
            eventHandlers={{ click: () => setSelected(pasture) }}
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
        ))}
      </MapContainer>
      <div className="map-instruction">
        Click <strong>Add pasture</strong>, then click the map to draw its
        boundary.
      </div>
      {selected && (
        <SelectedPasturePanel
          pasture={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
