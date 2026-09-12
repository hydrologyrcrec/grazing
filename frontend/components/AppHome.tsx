"use client";

import SessionBootstrap from "./ui/auth/SessionBootstrap";
import dynamic from "next/dynamic";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import type { GeocodeResult } from "@/types/pasture";

const AppBackgroundMap = dynamic(
  () => import("@/components/AppBackgroundMap"),
  {
    ssr: false,
    loading: () => <div className="map-loading">Loading ranch map…</div>,
  },
);

export default function AppHome() {
  const [drawRequest, setDrawRequest] = useState(0);
  const [searchTarget, setSearchTarget] = useState<GeocodeResult | null>(null);

  const [selectedPastureId, setSelectedPastureId] = useState<string | null>(
    null,
  );

  return (
    <main className="app-shell">
      <SessionBootstrap />
      <AppSidebar
        selectedPastureId={selectedPastureId}
        onPastureSelect={setSelectedPastureId}
      />
      <div className="fixed top-0 right-2 z-1000">
        <AppHeader
          onAdd={() => setDrawRequest((value) => value + 1)}
          onLocationSelected={setSearchTarget}
        />
      </div>
      <div className="main-column">
        <AppBackgroundMap
          drawRequest={drawRequest}
          searchTarget={searchTarget}
          focusPastureId={selectedPastureId}
        />
      </div>
    </main>
  );
}
