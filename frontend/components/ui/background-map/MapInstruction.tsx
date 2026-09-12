"use client"

import { useState } from "react";

export function MapInstruction() {
  const [instructionToggle, changeInstructionToggle] = useState(true);
  return (
    instructionToggle && (<div className="absolute top-5 left-1/2 z-800 -translate-x-1/2 whitespace-nowrap rounded-sm bg-white/95 px-3.25 py-2.25  shadow-[0_3px_14px_rgba(0,0,0,0.20)] max-[720px]:hidden">
      <span className="flex gap-6 items-center"><span className="text-[13px]">Click <strong>Add pasture</strong>, then click the map to draw its boundary</span>              <button onClick={() => changeInstructionToggle(false)}><p className="text-lg font-semibold">×</p></button></span>
    </div>)
  );
}
