"use client";

import type { AddPastureProps } from "@/components/ui/header/header.types";

export function AddPasture({ onAdd, disabled = false }: AddPastureProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[5px] border-0 bg-(--green) px-4 font-bold text-white transition-colors hover:bg-[#268f56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#187a46] disabled:cursor-not-allowed disabled:opacity-60 max-[720px]:px-2.5 max-[720px]:text-xs"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ＋
      </span>
      <span>Add pasture</span>
    </button>
  );
}
