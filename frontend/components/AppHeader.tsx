"use client";

import { HeaderActions, type AppHeaderProps } from "@/components/ui/header";

export default function AppHeader({
  onAdd,
  onLocationSelected,
}: AppHeaderProps) {
  return (
    <header className="relative z-100 flex h-17.5 flex-[0_0_70px] items-center justify-between bg-white px-4.5 pl-6 shadow-[0_2px_9px_rgba(18,32,55,0.10)] max-[720px]:h-15.5 max-[720px]:basis-15.5 max-[720px]:px-2.5">
      <HeaderActions onAdd={onAdd} onLocationSelected={onLocationSelected} />
    </header>
  );
}
