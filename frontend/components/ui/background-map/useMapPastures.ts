"use client";

import { useEffect, useState } from "react";
import { listPastures } from "@/lib/pastures/pasture.client";
import type { Pasture } from "@/types/pasture";

export function useMapPastures(): readonly Pasture[] {
  const [pastures, setPastures] = useState<readonly Pasture[]>([]);

  useEffect(() => {
    let active = true;

    void listPastures()
      .then((nextPastures) => {
        if (active) setPastures(nextPastures);
      })
      .catch((error) => {
        console.error("Unable to load map pastures", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return pastures;
}
