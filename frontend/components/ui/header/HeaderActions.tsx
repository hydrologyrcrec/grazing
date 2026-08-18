"use client";

import { AddPasture } from "@/components/ui/header/AddPasture";
import { AddressSearchBar } from "@/components/ui/header/AddressSearchBar";
import type { HeaderActionsProps } from "@/components/ui/header/header.types";

export function HeaderActions({
  onAdd,
  onLocationSelected,
}: HeaderActionsProps) {
  return (
    <div className="ml-auto flex items-center gap-3 max-[720px]:w-full max-[720px]:gap-1.75">
      <AddPasture onAdd={onAdd} />
      <AddressSearchBar onLocationSelected={onLocationSelected} />
    </div>
  );
}
