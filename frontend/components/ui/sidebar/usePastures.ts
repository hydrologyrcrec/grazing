"use client";

import { useEffect, useState } from "react";
import { getPastures } from "@/lib/storage";
import type { Pasture } from "@/types/pasture";
import { sortPasturesByRecentUpdate } from "@/components/ui/sidebar/pasture.utils";

export function usePastures(): readonly Pasture[] {
  const [pastures, setPastures] = useState<readonly Pasture[]>([]);

  useEffect(() => {
    setPastures(sortPasturesByRecentUpdate(getPastures()));
  }, []);

  return pastures;
}
