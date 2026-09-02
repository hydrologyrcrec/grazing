"use client"

import type { PasturesToggleProps } from "@/components/ui/sidebar/sidebar.types";

export function PasturesToggle({
  isOpen,
  controlsId,
  onToggle,
}: PasturesToggleProps) {
  return (
    <button
      type="button"
      className={"flex w-full items-center gap-2.5 border-0 border-l-[3px] border-l-transparent px-4.5 py-3.5 text-left text-sm font-bold text-[#dce4ef] max-[720px]:justify-center max-[720px]:border-l-2 max-[720px]:px-0 max-[720px]:py-4 hover:bg-(--nav-active)" + (isOpen && " bg-(--nav-active)")}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={controlsId}
    >
      <span aria-hidden="true">▱</span>
      <span className="max-[720px]:hidden">Pastures</span>
      <span
        className={`ml-auto text-xs transition-transform duration-200 max-[720px]:hidden ${
          isOpen ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      >
        ▾
      </span>
    </button>
  );
}
