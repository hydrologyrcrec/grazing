"use client";

import { HeaderActions, type AppHeaderProps } from "@/components/ui/header";

export default function AppHeader({
  onAdd,
  onLocationSelected,
}: AppHeaderProps) {
  return (
    <header className="relative z-2000 flex h-17.5 shrink-0 items-center overflow-visible bg-white px-4.5 shadow-[0_2px_9px_rgba(18,32,55,0.10)] max-[720px]:h-15.5">
      <HeaderActions onAdd={onAdd} onLocationSelected={onLocationSelected} />
    </header>
  );
}
