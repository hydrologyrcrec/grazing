"use client";

import type { AreaInputProps } from "@/components/ui/pasture-form/pasture-form.types";

export function AreaInput({
  id,
  value,
  readOnly = false,
  required = false,
  min,
  max,
  step,
  onChange,
}: AreaInputProps) {
  return (
    <div className="flex">
      <input
        id={id}
        type={readOnly ? "text" : "number"}
        value={value}
        readOnly={readOnly}
        required={required}
        min={min}
        max={max}
        step={step}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        className="min-w-0 flex-1 rounded-l-sm border border-[#cbd3de] bg-white px-2.75 py-2.5 outline-none focus:z-10 focus:border-[#248cc4] focus:ring-[3px] focus:ring-[#248cc4]/10 read-only:bg-[#f3f5f8] read-only:text-[#657184]"
      />
      <span
        className="grid w-12.5 place-items-center rounded-r-sm border border-l-0 border-[#cbd3de] bg-[#f4f6f8] font-normal text-[#657184]"
        aria-hidden="true"
      >
        ac
      </span>
    </div>
  );
}
