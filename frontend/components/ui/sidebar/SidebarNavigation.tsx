import { PasturesMenu } from "@/components/ui/sidebar/PasturesMenu";
import { RanchMapNavItem } from "@/components/ui/sidebar/RanchMapNavItem";
import { SidebarAccountActions } from "@/components/ui/sidebar/SidebarAccountActions";
import type { SidebarNavigationProps } from "@/components/ui/sidebar/sidebar.types";

export function SidebarNavigation({
  pastures,
  selectedPastureId,
  onPastureSelect,
}: SidebarNavigationProps) {
  return (
    <nav
      className="flex min-h-0 flex-1 flex-col"
      aria-label="Ranch navigation"
    >
      {/* <RanchMapNavItem /> */}
      <PasturesMenu
        pastures={pastures}
        selectedPastureId={selectedPastureId}
        onPastureSelect={onPastureSelect}
      />
      <SidebarAccountActions />
    </nav>
  );
}
