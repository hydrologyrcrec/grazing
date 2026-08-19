"use client";

import { FormField } from "@/components/ui/pasture-form/FormField";
import { FORM_FIELD_IDS } from "@/components/ui/pasture-form/pasture-form.constants";
import type { PastureNotesFieldsProps } from "@/components/ui/pasture-form/pasture-form.types";

export function PastureNotesFields({
  description,
  fsaIds,
  onFieldChange,
}: PastureNotesFieldsProps) {
  return (
    <>
      <FormField id={FORM_FIELD_IDS.description} label="Description">
        <textarea
          id={FORM_FIELD_IDS.description}
          rows={4}
          value={description}
          onChange={(event) => onFieldChange("description", event.target.value)}
          placeholder="Optional pasture notes"
          className="w-full resize-y rounded-sm border border-[#cbd3de] bg-white px-2.75 py-2.5 outline-none placeholder:text-[#7a8696] focus:border-[#248cc4] focus:ring-[3px] focus:ring-[#248cc4]/10"
        />
      </FormField>

      <FormField id={FORM_FIELD_IDS.fsaIds} label="Farm Service Agency IDs">
        <input
          id={FORM_FIELD_IDS.fsaIds}
          value={fsaIds}
          onChange={(event) => onFieldChange("fsaIds", event.target.value)}
          placeholder="Optional farm and tract IDs"
          className="w-full rounded-sm border border-[#cbd3de] bg-white px-2.75 py-2.5 outline-none placeholder:text-[#7a8696] focus:border-[#248cc4] focus:ring-[3px] focus:ring-[#248cc4]/10"
        />
      </FormField>
    </>
  );
}
