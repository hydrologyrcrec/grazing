import {
  COLOR_OPTIONS,
  GRASS_TYPE_OPTIONS,
  LAND_USE_OPTIONS,
} from "@/components/ui/pasture-form/pasture-form.constants";
import type {
  PastureFormValidationResult,
  PastureFormValues,
} from "@/components/ui/pasture-form/pasture-form.types";
import type { CreatePastureRequest } from "@/lib/pastures/pasture.client";
import type { PastureBoundarySelection } from "@/types/pasture";

export function createInitialFormValues(
  boundary: PastureBoundarySelection,
): PastureFormValues {
  return {
    name: "",
    grazeableArea: boundary.areaAcres.toFixed(2),
    landUse: LAND_USE_OPTIONS[0].value,
    grassType: GRASS_TYPE_OPTIONS[0].value,
    color: COLOR_OPTIONS[0].value,
    description: "",
  };
}

export function validatePastureForm(
  boundary: PastureBoundarySelection,
  values: PastureFormValues,
): PastureFormValidationResult {
  if (!values.name.trim()) {
    return { valid: false, error: "Pasture name is required." };
  }

  const grazeableAreaAcres = Number(values.grazeableArea);

  if (
    !Number.isFinite(grazeableAreaAcres) ||
    grazeableAreaAcres <= 0 ||
    grazeableAreaAcres > boundary.areaAcres + 0.01
  ) {
    return {
      valid: false,
      error:
        "Grazeable area must be greater than 0 and no larger than total area.",
    };
  }

  return { valid: true, grazeableAreaAcres };
}

export function buildCreatePastureRequest(
  boundary: PastureBoundarySelection,
  values: PastureFormValues,
  grazeableAreaAcres: number,
): CreatePastureRequest {
  return {
    name: values.name.trim(),
    grazeableAreaAcres,
    landUse: values.landUse,
    grassType: values.grassType,
    color: values.color,
    description: values.description.trim(),
    coordinates: boundary.coordinates,
  };
}
