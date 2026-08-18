"use client";

import {
  SidebarBrand,
  SidebarNavigation,
  usePastures,
  type AppSidebarProps,
} from "@/components/ui/sidebar";

export default function AppSidebar({
  selectedPastureId,
  onPastureSelect,
}: AppSidebarProps) {
  const pastures = usePastures();

  return (
    <aside
      className="z-1002 flex h-full w-44 flex-[0_0_176px] flex-col bg-(--nav) text-white shadow-[2px_0_12px_rgba(0,0,0,0.13)] max-[720px]:w-14.5 max-[720px]:basis-14.5"
      aria-label="Primary navigation"
    >
      <SidebarBrand />

      <SidebarNavigation
        pastures={pastures}
        selectedPastureId={selectedPastureId}
        onPastureSelect={onPastureSelect}
      />
    </aside>
  );
}
