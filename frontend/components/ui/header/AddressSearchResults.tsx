"use client";

import type { AddressSearchResultsProps } from "@/components/ui/header/header.types";

function resultKey(latitude: number, longitude: number, label: string) {
  return `${latitude}:${longitude}:${label}`;
}

export function AddressSearchResults({
  id,
  results,
  onSelect,
}: AddressSearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <ul
      id={id}
      aria-label="Address search results"
      className="absolute right-0 left-0 top-11 z-2000 m-0 max-h-67.5 list-none overflow-y-auto rounded-[5px] border border-(--line) bg-white p-1.25 shadow-[0_9px_24px_rgba(0,0,0,0.20)]"
    >
      {results.map((result) => (
        <li key={resultKey(result.lat, result.lng, result.label)}>
          <button
            type="button"
            onClick={() => onSelect(result)}
            className="w-full rounded-[3px] border-0 bg-white p-2.5 text-left leading-[1.35] text-[#182230] hover:bg-[#eef6ff] focus-visible:bg-[#eef6ff] focus-visible:outline-2 focus-visible:outline-[#248cc4]"
          >
            {result.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
