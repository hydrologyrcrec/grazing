"use client";

import type { PastureFormHeaderProps } from "@/components/ui/pasture-form/pasture-form.types";

export function PastureFormHeader({ onClose }: PastureFormHeaderProps) {
  return (
    <header className="flex items-center justify-between border-t-[7px] border-t-(--orange) border-b border-b-[#e0e5ec] px-6.5 py-5">
      <div>
        <p className="mb-1 text-xs text-[#7a8696]">Ranch map</p>
        <h1 className="m-0 text-2xl font-bold">Add pasture</h1>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close pasture form"
        className="border-0 bg-transparent text-[28px] leading-none text-[#8290a2] hover:text-[#354154]"
      >
        ×
      </button>
    </header>
  );
}
