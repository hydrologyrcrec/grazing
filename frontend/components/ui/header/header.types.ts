import type { ReactNode } from "react";
import type { GeocodeResult } from "@/types/pasture";

export type LocationSelectionHandler = (result: GeocodeResult) => void;

export type AppHeaderProps = Readonly<{
  onAdd: () => void;
  onLocationSelected: LocationSelectionHandler;
}>;

export type HeaderTitleProps = Readonly<{
  children: ReactNode;
}>;

export type HeaderActionsProps = AppHeaderProps;

export type AddPastureProps = Readonly<{
  onAdd: () => void;
  disabled?: boolean;
}>;

export type AddressSearchBarProps = Readonly<{
  onLocationSelected: LocationSelectionHandler;
}>;

export type AddressSearchResultsProps = Readonly<{
  id: string;
  results: readonly GeocodeResult[];
  onSelect: LocationSelectionHandler;
}>;
