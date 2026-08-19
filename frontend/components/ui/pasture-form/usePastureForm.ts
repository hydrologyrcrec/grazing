"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import type {
  PastureFieldChangeHandler,
  PastureFormValues,
  UsePastureFormResult,
} from "@/components/ui/pasture-form/pasture-form.types";
import {
  buildPasture,
  createInitialFormValues,
  validatePastureForm,
} from "@/components/ui/pasture-form/pasture-form.utils";
import {
  clearDraft,
  getDeviceId,
  getPastures,
  savePastures,
} from "@/lib/storage";
import type { PastureDraft } from "@/types/pasture";

export function usePastureForm(draft: PastureDraft): UsePastureFormResult {
  const router = useRouter();
  const [values, setValues] = useState<PastureFormValues>(() =>
    createInitialFormValues(draft),
  );
  const [error, setError] = useState<string | null>(null);

  const updateField: PastureFieldChangeHandler = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
  }, []);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validation = validatePastureForm(draft, values);

      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      const pasture = buildPasture(
        draft,
        values,
        validation.grazeableAreaAcres,
        {
          id: crypto.randomUUID(),
          deviceId: getDeviceId(),
          updatedAt: new Date().toISOString(),
        },
      );

      savePastures([...getPastures(), pasture]);
      clearDraft();
      router.push("/home");
    },
    [draft, router, values],
  );

  const cancel = useCallback(() => {
    clearDraft();
    router.push("/home");
  }, [router]);

  return { values, error, updateField, submit, cancel };
}
