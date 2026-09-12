"use client";

import { AddPasture } from "@/components/ui/header/AddPasture";
import { AddressSearchBar } from "@/components/ui/header/AddressSearchBar";
import type { HeaderActionsProps } from "@/components/ui/header/header.types";

export function HeaderActions({
  onAdd,
  onLocationSelected,
}: HeaderActionsProps) {
  return (
    <div className="flex justify-end gap-3 my-5 px-3 bg-transparent">
      <AddPasture onAdd={onAdd} />
      <AddressSearchBar onLocationSelected={onLocationSelected} />
    </div>
  );
}
