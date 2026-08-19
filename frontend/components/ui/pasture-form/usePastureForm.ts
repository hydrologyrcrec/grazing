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
  buildCreatePastureRequest,
  createInitialFormValues,
  validatePastureForm,
} from "@/components/ui/pasture-form/pasture-form.utils";
import { createPasture } from "@/lib/pastures/pasture.client";
import { usePastureCreation } from "@/components/ui/pasture-form/PastureCreationContext";
import type { PastureBoundarySelection } from "@/types/pasture";

export function usePastureForm(
  boundary: PastureBoundarySelection,
): UsePastureFormResult {
  const router = useRouter();
  const { clearBoundary } = usePastureCreation();
  const [values, setValues] = useState<PastureFormValues>(() =>
    createInitialFormValues(boundary),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField: PastureFieldChangeHandler = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError(null);
  }, []);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      const validation = validatePastureForm(boundary, values);

      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        await createPasture(
          buildCreatePastureRequest(
            boundary,
            values,
            validation.grazeableAreaAcres,
          ),
        );

        clearBoundary();
        router.push("/home");
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to save the pasture.",
        );
        setSubmitting(false);
      }
    },
    [boundary, clearBoundary, router, submitting, values],
  );

  const cancel = useCallback(() => {
    if (submitting) return;

    clearBoundary();
    router.push("/home");
  }, [clearBoundary, router, submitting]);

  return { values, error, submitting, updateField, submit, cancel };
}
