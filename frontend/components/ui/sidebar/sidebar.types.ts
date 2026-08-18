import type { Pasture } from "@/types/pasture";

export type PastureId = Pasture["id"];
export type PastureSelectionHandler = (pastureId: PastureId) => void;

export type AppSidebarProps = Readonly<{
  selectedPastureId: PastureId | null;
  onPastureSelect: PastureSelectionHandler;
}>;

export type SidebarNavigationProps = AppSidebarProps &
  Readonly<{
    pastures: readonly Pasture[];
  }>;

export type PasturesMenuProps = SidebarNavigationProps;

export type PasturesToggleProps = Readonly<{
  isOpen: boolean;
  controlsId: string;
  onToggle: () => void;
}>;

export type PastureListProps = SidebarNavigationProps &
  Readonly<{
    id: string;
  }>;

export type PastureListItemProps = Readonly<{
  pasture: Pasture;
  isSelected: boolean;
  onSelect: PastureSelectionHandler;
}>;
