"use client";

import { useSyncExternalStore } from "react";
import type { AppPastureFormDraft } from "@/components/ui/pasture-form/pasture-form.types";
import { STORAGE_KEYS } from "@/lib/constants";
import { getDraft } from "@/lib/storage";
import type { PastureDraft } from "@/types/pasture";

let cachedStorageValue: string | null | undefined;
let cachedDraft: PastureDraft | null = null;

function getClientSnapshot(): AppPastureFormDraft {
  const storageValue = window.sessionStorage.getItem(STORAGE_KEYS.pastureDraft);

  if (storageValue === cachedStorageValue) return cachedDraft;

  cachedStorageValue = storageValue;
  cachedDraft = getDraft();
  return cachedDraft;
}

function getServerSnapshot(): AppPastureFormDraft {
  return undefined;
}

function subscribe(onStoreChange: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (
      event.storageArea === window.sessionStorage &&
      (event.key === STORAGE_KEYS.pastureDraft || event.key === null)
    ) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function usePastureDraft(): AppPastureFormDraft {
  return useSyncExternalStore<AppPastureFormDraft>(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}
