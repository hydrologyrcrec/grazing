"use client";

import SessionBootstrap from "./ui/auth/SessionBootstrap";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import type { GeocodeResult } from "@/types/pasture";
import { initializeDevice } from "@/lib/storage";

const AppBackgroundMap = dynamic(
  () => import("@/components/AppBackgroundMap"),
  {
    ssr: false,
    loading: () => <div className="map-loading">Loading ranch map…</div>,
  },
);

export default function HomeClient() {
  const [drawRequest, setDrawRequest] = useState(0);
  const [searchTarget, setSearchTarget] = useState<GeocodeResult | null>(null);

  const [selectedPastureId, setSelectedPastureId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    initializeDevice();
  }, []);

  return (
    <main className="app-shell">
      <SessionBootstrap />
      <AppSidebar
        selectedPastureId={selectedPastureId}
        onPastureSelect={setSelectedPastureId}
      />

      <section className="main-column">
        <AppHeader
          onAdd={() => setDrawRequest((value) => value + 1)}
          onLocationSelected={setSearchTarget}
        />

        <AppBackgroundMap
          drawRequest={drawRequest}
          searchTarget={searchTarget}
          focusPastureId={selectedPastureId}
        />
      </section>
    </main>
  );
}
