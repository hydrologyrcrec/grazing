"use client";

import { PastureFormActions } from "@/components/ui/pasture-form/PastureFormActions";
import { PastureFormError } from "@/components/ui/pasture-form/PastureFormError";
import { PastureFormFields } from "@/components/ui/pasture-form/PastureFormFields";
import { PastureFormHeader } from "@/components/ui/pasture-form/PastureFormHeader";
import type { PastureFormCardProps } from "@/components/ui/pasture-form/pasture-form.types";
import { usePastureForm } from "@/components/ui/pasture-form/usePastureForm";

export function PastureFormCard({ draft }: PastureFormCardProps) {
  const { values, error, updateField, submit, cancel } = usePastureForm(draft);

  return (
    <section className="mx-auto w-full max-w-155 overflow-hidden rounded-lg bg-white shadow-[0_14px_44px_rgba(19,32,57,0.15)]">
      <PastureFormHeader onClose={cancel} />

      <form onSubmit={submit} className="grid gap-4.25 px-6.5 pt-6">
        {error && <PastureFormError message={error} />}

        <PastureFormFields
          draft={draft}
          values={values}
          onFieldChange={updateField}
        />

        <PastureFormActions onCancel={cancel} />
      </form>
    </section>
  );
}
