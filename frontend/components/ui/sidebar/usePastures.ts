"use client";

import { useEffect, useState } from "react";
import { listPastures } from "@/lib/pastures/pasture.client";
import type { Pasture } from "@/types/pasture";
import { sortPasturesByRecentUpdate } from "@/components/ui/sidebar/pasture.utils";

export function usePastures(): readonly Pasture[] {
  const [pastures, setPastures] = useState<readonly Pasture[]>([]);

  useEffect(() => {
    let active = true;

    void listPastures()
      .then((nextPastures) => {
        if (active) {
          setPastures(sortPasturesByRecentUpdate(nextPastures));
        }
      })
      .catch((error) => {
        console.error("Unable to load sidebar pastures", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return pastures;
}
