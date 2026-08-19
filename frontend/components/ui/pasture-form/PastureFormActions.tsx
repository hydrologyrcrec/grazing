"use client";

import type { PastureFormActionsProps } from "@/components/ui/pasture-form/pasture-form.types";

export function PastureFormActions({ onCancel }: PastureFormActionsProps) {
  return (
    <footer className="-mx-6.5 mt-1 flex justify-end gap-2.5 border-t border-[#e0e5ec] bg-[#fafbfc] px-6.5 py-4.25">
      <button
        type="button"
        onClick={onCancel}
        className="min-w-25 rounded-sm border border-[#bbc5d1] bg-white px-3.75 py-2.5 font-bold hover:bg-[#f3f5f8]"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="min-w-25 rounded-sm border border-[#2c9c5d] bg-(--green) px-3.75 py-2.5 font-bold text-white hover:brightness-95"
      >
        Save pasture
      </button>
    </footer>
  );
}
