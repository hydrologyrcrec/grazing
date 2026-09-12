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
      className="z-1002 flex h-full w-50 flex-col justify-center bg-white text-black max-[720px]:basis-14.5"
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
