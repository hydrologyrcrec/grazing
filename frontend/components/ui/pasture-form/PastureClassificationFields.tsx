"use client";

import { FormField } from "@/components/ui/pasture-form/FormField";
import { FormSelect } from "@/components/ui/pasture-form/FormSelect";
import {
  COLOR_OPTIONS,
  FORM_FIELD_IDS,
  GRASS_TYPE_OPTIONS,
  LAND_USE_OPTIONS,
} from "@/components/ui/pasture-form/pasture-form.constants";
import type { PastureClassificationFieldsProps } from "@/components/ui/pasture-form/pasture-form.types";

export function PastureClassificationFields({
  landUse,
  grassType,
  color,
  onFieldChange,
}: PastureClassificationFieldsProps) {
  return (
    <>
      <FormField id={FORM_FIELD_IDS.landUse} label="Land use" required>
        <FormSelect
          id={FORM_FIELD_IDS.landUse}
          value={landUse}
          options={LAND_USE_OPTIONS}
          required
          onChange={(value) => onFieldChange("landUse", value)}
        />
      </FormField>

      <FormField id={FORM_FIELD_IDS.grassType} label="Grass type" required>
        <FormSelect
          id={FORM_FIELD_IDS.grassType}
          value={grassType}
          options={GRASS_TYPE_OPTIONS}
          required
          onChange={(value) => onFieldChange("grassType", value)}
        />
      </FormField>

      <FormField id={FORM_FIELD_IDS.color} label="Color on map" required>
        <FormSelect
          id={FORM_FIELD_IDS.color}
          value={color}
          options={COLOR_OPTIONS}
          required
          onChange={(value) => onFieldChange("color", value)}
        />
      </FormField>
    </>
  );
}
