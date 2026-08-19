import {
  COLOR_OPTIONS,
  GRASS_TYPE_OPTIONS,
  LAND_USE_OPTIONS,
} from "@/components/ui/pasture-form/pasture-form.constants";
import type {
  BuildPastureContext,
  PastureFormValidationResult,
  PastureFormValues,
} from "@/components/ui/pasture-form/pasture-form.types";
import type { Pasture, PastureDraft } from "@/types/pasture";

export function createInitialFormValues(
  draft: PastureDraft,
): PastureFormValues {
  return {
    name: "",
    grazeableArea: draft.areaAcres.toFixed(2),
    landUse: LAND_USE_OPTIONS[0].value,
    grassType: GRASS_TYPE_OPTIONS[0].value,
    color: COLOR_OPTIONS[0].value,
    description: "",
    fsaIds: "",
  };
}

export function validatePastureForm(
  draft: PastureDraft,
  values: PastureFormValues,
): PastureFormValidationResult {
  if (!values.name.trim()) {
    return { valid: false, error: "Pasture name is required." };
  }

  const grazeableAreaAcres = Number(values.grazeableArea);

  if (
    !Number.isFinite(grazeableAreaAcres) ||
    grazeableAreaAcres <= 0 ||
    grazeableAreaAcres > draft.areaAcres + 0.01
  ) {
    return {
      valid: false,
      error:
        "Grazeable area must be greater than 0 and no larger than total area.",
    };
  }

  return { valid: true, grazeableAreaAcres };
}

export function buildPasture(
  draft: PastureDraft,
  values: PastureFormValues,
  grazeableAreaAcres: number,
  context: BuildPastureContext,
): Pasture {
  return {
    ...draft,
    id: context.id,
    deviceId: context.deviceId,
    name: values.name.trim(),
    grazeableAreaAcres,
    landUse: values.landUse,
    grassType: values.grassType,
    color: values.color,
    description: values.description.trim(),
    fsaIds: values.fsaIds.trim(),
    updatedAt: context.updatedAt,
  };
}
