"use client";

import { AreaInput } from "@/components/ui/pasture-form/AreaInput";
import { FormField } from "@/components/ui/pasture-form/FormField";
import { FORM_FIELD_IDS } from "@/components/ui/pasture-form/pasture-form.constants";
import type { PastureAreaFieldsProps } from "@/components/ui/pasture-form/pasture-form.types";

export function PastureAreaFields({
  draft,
  grazeableArea,
  onGrazeableAreaChange,
}: PastureAreaFieldsProps) {
  const formattedTotalArea = draft.areaAcres.toFixed(2);

  return (
    <>
      <FormField id={FORM_FIELD_IDS.totalArea} label="Total area" required>
        <AreaInput
          id={FORM_FIELD_IDS.totalArea}
          value={formattedTotalArea}
          readOnly
        />
      </FormField>

      <FormField
        id={FORM_FIELD_IDS.grazeableArea}
        label="Grazeable or arable area"
        required
      >
        <AreaInput
          id={FORM_FIELD_IDS.grazeableArea}
          value={grazeableArea}
          min="0.01"
          max={formattedTotalArea}
          step="0.01"
          required
          onChange={onGrazeableAreaChange}
        />
      </FormField>
    </>
  );
}
