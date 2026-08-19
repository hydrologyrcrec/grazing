"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PastureBoundarySelection } from "@/types/pasture";

type PastureCreationContextValue = Readonly<{
  boundary: PastureBoundarySelection | null;
  selectBoundary: (boundary: PastureBoundarySelection) => void;
  clearBoundary: () => void;
}>;

const PastureCreationContext =
  createContext<PastureCreationContextValue | null>(null);

export function PastureCreationProvider({ children }: { children: ReactNode }) {
  const [boundary, setBoundary] = useState<PastureBoundarySelection | null>(
    null,
  );

  const value = useMemo<PastureCreationContextValue>(
    () => ({
      boundary,
      selectBoundary: setBoundary,
      clearBoundary: () => setBoundary(null),
    }),
    [boundary],
  );

  return (
    <PastureCreationContext.Provider value={value}>
      {children}
    </PastureCreationContext.Provider>
  );
}

export function usePastureCreation(): PastureCreationContextValue {
  const context = useContext(PastureCreationContext);

  if (!context) {
    throw new Error(
      "usePastureCreation must be used within PastureCreationProvider.",
    );
  }

  return context;
}
