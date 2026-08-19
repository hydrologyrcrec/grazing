"use client";

import { FormField } from "@/components/ui/pasture-form/FormField";
import { PastureAreaFields } from "@/components/ui/pasture-form/PastureAreaFields";
import { PastureClassificationFields } from "@/components/ui/pasture-form/PastureClassificationFields";
import { PastureNotesFields } from "@/components/ui/pasture-form/PastureNotesFields";
import { FORM_FIELD_IDS } from "@/components/ui/pasture-form/pasture-form.constants";
import type { PastureFormFieldsProps } from "@/components/ui/pasture-form/pasture-form.types";

export function PastureFormFields({
  draft,
  values,
  onFieldChange,
}: PastureFormFieldsProps) {
  return (
    <>
      <FormField id={FORM_FIELD_IDS.name} label="Pasture name" required>
        <input
          id={FORM_FIELD_IDS.name}
          value={values.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          placeholder="e.g. North pasture"
          required
          autoFocus
          className="w-full rounded-sm border border-[#cbd3de] bg-white px-2.75 py-2.5 outline-none placeholder:text-[#7a8696] focus:border-[#248cc4] focus:ring-[3px] focus:ring-[#248cc4]/10"
        />
      </FormField>

      <PastureAreaFields
        draft={draft}
        grazeableArea={values.grazeableArea}
        onGrazeableAreaChange={(value) => onFieldChange("grazeableArea", value)}
      />

      <PastureClassificationFields
        landUse={values.landUse}
        grassType={values.grassType}
        color={values.color}
        onFieldChange={onFieldChange}
      />

      <PastureNotesFields
        description={values.description}
        fsaIds={values.fsaIds}
        onFieldChange={onFieldChange}
      />
    </>
  );
}
