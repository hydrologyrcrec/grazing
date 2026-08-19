"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { getPastures } from "@/lib/storage";
import type { Pasture } from "@/types/pasture";

const EMPTY_PASTURES: readonly Pasture[] = [];

let cachedStorageValue: string | null | undefined;
let cachedPastures: readonly Pasture[] = EMPTY_PASTURES;

function getClientSnapshot(): readonly Pasture[] {
  const storageValue = window.localStorage.getItem(STORAGE_KEYS.pastures);

  if (storageValue === cachedStorageValue) return cachedPastures;

  cachedStorageValue = storageValue;
  cachedPastures = getPastures();
  return cachedPastures;
}

function getServerSnapshot(): readonly Pasture[] {
  return EMPTY_PASTURES;
}

function subscribe(onStoreChange: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (
      event.storageArea === window.localStorage &&
      (event.key === STORAGE_KEYS.pastures || event.key === null)
    ) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function useMapPastures(): readonly Pasture[] {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
