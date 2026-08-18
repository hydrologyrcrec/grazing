import { PastureListItem } from "@/components/ui/sidebar/PastureListItem";
import type { PastureListProps } from "@/components/ui/sidebar/sidebar.types";

export function PastureList({
  id,
  pastures,
  selectedPastureId,
  onPastureSelect,
}: PastureListProps) {
  if (pastures.length === 0) {
    return (
      <div id={id} className="px-2 pb-2.5 pl-4.5 pt-1">
        <p className="m-0 p-2.5 text-xs text-[#9da9b9] max-[720px]:hidden">
          No pastures added
        </p>
      </div>
    );
  }

  return (
    <ul
      id={id}
      className="m-0 list-none px-2 pb-2.5 pl-4.5 pt-1 max-[720px]:px-1"
    >
      {pastures.map((pasture) => (
        <li key={pasture.id}>
          <PastureListItem
            pasture={pasture}
            isSelected={selectedPastureId === pasture.id}
            onSelect={onPastureSelect}
          />
        </li>
      ))}
    </ul>
  );
}
