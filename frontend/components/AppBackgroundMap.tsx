"use client";

import { useMemo, useState } from "react";
import {
  BackgroundMapCanvas,
  findPastureById,
  getMostRecentlyUpdatedPasture,
  MapInstruction,
  SelectedPasturePanel,
  useMapPastures,
  type AppBackgroundMapProps,
} from "@/components/ui/background-map";
import type { Pasture } from "@/types/pasture";

export default function AppBackgroundMap({
  drawRequest,
  searchTarget,
  focusPastureId,
}: AppBackgroundMapProps) {
  const pastures = useMapPastures();
  const [selectedPasture, setSelectedPasture] = useState<Pasture | null>(null);

  const lastSavedPasture = useMemo(
    () => getMostRecentlyUpdatedPasture(pastures),
    [pastures],
  );

  const pastureToFocus = useMemo(
    () => findPastureById(pastures, focusPastureId),
    [focusPastureId, pastures],
  );

  return (
    <div className="relative z-0 min-h-0 flex-1">
      <BackgroundMapCanvas
        drawRequest={drawRequest}
        searchTarget={searchTarget}
        pastures={pastures}
        lastSavedPasture={lastSavedPasture}
        pastureToFocus={pastureToFocus}
        onPastureSelect={setSelectedPasture}
      />

      <MapInstruction />

      {selectedPasture && (
        <SelectedPasturePanel
          pasture={selectedPasture}
          onClose={() => setSelectedPasture(null)}
        />
      )}
    </div>
  );
}
