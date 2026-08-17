import { STORAGE_KEYS } from "@/lib/constants";
import type { Pasture, PastureDraft } from "@/types/pasture";

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function initializeDevice(): string {
  let deviceId = localStorage.getItem(STORAGE_KEYS.deviceId);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.deviceId, deviceId);
  }

  sessionStorage.setItem(
    STORAGE_KEYS.activeSession,
    JSON.stringify({ deviceId, openedAt: new Date().toISOString() }),
  );
  return deviceId;
}

export function getDeviceId(): string {
  return localStorage.getItem(STORAGE_KEYS.deviceId) ?? initializeDevice();
}

export function getPastures(): Pasture[] {
  return parseJson<Pasture[]>(localStorage.getItem(STORAGE_KEYS.pastures), []);
}

export function savePastures(pastures: Pasture[]) {
  localStorage.setItem(STORAGE_KEYS.pastures, JSON.stringify(pastures));
}

export function saveDraft(draft: PastureDraft) {
  sessionStorage.setItem(STORAGE_KEYS.pastureDraft, JSON.stringify(draft));
}

export function getDraft(): PastureDraft | null {
  return parseJson<PastureDraft | null>(
    sessionStorage.getItem(STORAGE_KEYS.pastureDraft),
    null,
  );
}

export function clearDraft() {
  sessionStorage.removeItem(STORAGE_KEYS.pastureDraft);
}
