import type { PastureListItemProps } from "@/components/ui/sidebar/sidebar.types";

export function PastureListItem({
  pasture,
  isSelected,
  onSelect,
}: PastureListItemProps) {
  const selectedClassName = isSelected
    ? "[border-left-color:var(--orange)] bg-[#ffffff1c] text-black"
    : "border-l-transparent bg-transparent text-[#dce4ef] hover:bg-[#ffffff12] hover:text-black";

  return (
    <button
      type="button"
      className={`flex min-h-9.5 w-full items-center gap-2.25 rounded border-0 border-l-3 px-2.25 py-1.75 text-left ${selectedClassName} max-[720px]:justify-center max-[720px]:px-0`}
      onClick={() => onSelect(pasture.id)}
      aria-pressed={isSelected}
      title={pasture.name}
    >
      <span
        className="h-2.25 w-2.25 shrink-0 rounded-full border border-white/500"
        style={{ backgroundColor: pasture.color }}
        aria-hidden="true"
      />
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-black text-[13px] max-[720px]:hidden">
        {pasture.name}
      </span>
    </button>
  );
}
