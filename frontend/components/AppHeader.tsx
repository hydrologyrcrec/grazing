"use client";

import { HeaderActions, type AppHeaderProps } from "@/components/ui/header";

export default function AppHeader({
  onAdd,
  onLocationSelected,
}: AppHeaderProps) {
  return (
    <HeaderActions onAdd={onAdd} onLocationSelected={onLocationSelected} />
  );
}
