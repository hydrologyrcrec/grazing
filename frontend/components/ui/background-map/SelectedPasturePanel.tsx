"use client";

import { PastureDetailRow } from "@/components/ui/background-map/PastureDetailRow";
import type { SelectedPasturePanelProps } from "@/components/ui/background-map/background-map.types";

export function SelectedPasturePanel({
  pasture,
  onClose,
}: SelectedPasturePanelProps) {
  return (
    <aside
      className="absolute top-20 right-5 z-1000 max-h-[calc(100%-32px)] w-[min(360px,calc(100%-32px))] overflow-auto rounded-lg bg-white p-6 shadow-[0_10px_36px_rgba(0,0,0,0.33)]"
      aria-label={`${pasture.name} information`}
    >
      <button
        className="absolute top-2 right-2.5 border-0 bg-transparent text-[26px] leading-none text-[#657184]"
        type="button"
        onClick={onClose}
        aria-label="Close pasture information"
      >
        ×
      </button>

      <div
        className="h-1.5 w-9.5 rounded-full"
        style={{ backgroundColor: pasture.color }}
        aria-hidden="true"
      />

      <h2 className="mt-2.5 mb-4.5 text-2xl font-bold">{pasture.name}</h2>

      <dl className="m-0">
        <PastureDetailRow
          label="Total area"
          value={`${pasture.areaAcres.toFixed(2)} ac`}
        />
        <PastureDetailRow
          label="Grazeable area"
          value={`${pasture.grazeableAreaAcres.toFixed(2)} ac`}
        />
        <PastureDetailRow label="Land use" value={pasture.landUse} />
        <PastureDetailRow label="Grass type" value={pasture.grassType} />

        {pasture.description && (
          <PastureDetailRow label="Description" value={pasture.description} />
        )}
      </dl>
    </aside>
  );
}
