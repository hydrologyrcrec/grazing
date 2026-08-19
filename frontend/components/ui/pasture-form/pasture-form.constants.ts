import type { Pasture } from "@/types/pasture";

export const LAND_USE_OPTIONS = [
  { label: "Grazing", value: "Grazing" },
  { label: "Hay", value: "Hay" },
] as const satisfies readonly Readonly<{
  label: string;
  value: Pasture["landUse"];
}>[];

export const GRASS_TYPE_OPTIONS = [
  { label: "Natural grasses", value: "Natural grasses" },
  { label: "Bahiagrass", value: "Bahiagrass" },
  { label: "Bermudagrass", value: "Bermudagrass" },
  { label: "Ryegrass", value: "Ryegrass" },
  { label: "Other", value: "Other" },
] as const;

export const COLOR_OPTIONS = [
  { label: "Sky blue", value: "#28a8cf" },
  { label: "Pasture green", value: "#36a269" },
  { label: "Sunflower", value: "#f5a623" },
  { label: "Violet", value: "#7b61a8" },
] as const;

export const FORM_FIELD_IDS = {
  name: "pasture-name",
  totalArea: "pasture-total-area",
  grazeableArea: "pasture-grazeable-area",
  landUse: "pasture-land-use",
  grassType: "pasture-grass-type",
  color: "pasture-map-color",
  description: "pasture-description",
  fsaIds: "pasture-fsa-ids",
} as const;
