"use client";

import { z } from "zod";
import { apiFetch } from "@/lib/auth/api-fetch";
import type {
  Pasture,
  PastureLandUse,
  PolygonCoordinates,
} from "@/types/pasture";

const coordinateSchema = z.tuple([z.number(), z.number()]);

const pastureSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  landUse: z.enum(["GRAZING", "HAY", "MIXED", "OTHER"]),
  grassType: z.string(),
  color: z.string(),
  coordinates: z.array(coordinateSchema),
  areaAcres: z.number(),
  grazeableAreaAcres: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const pastureEnvelopeSchema = z.object({ pasture: pastureSchema });
const pastureListEnvelopeSchema = z.object({
  pastures: z.array(pastureSchema),
});

const LAND_USE_FROM_API = {
  GRAZING: "Grazing",
  HAY: "Hay",
  MIXED: "Mixed",
  OTHER: "Other",
} as const satisfies Record<
  z.infer<typeof pastureSchema>["landUse"],
  PastureLandUse
>;

const LAND_USE_TO_API = {
  Grazing: "GRAZING",
  Hay: "HAY",
  Mixed: "MIXED",
  Other: "OTHER",
} as const satisfies Record<
  PastureLandUse,
  z.infer<typeof pastureSchema>["landUse"]
>;

export type CreatePastureRequest = Readonly<{
  name: string;
  description: string;
  landUse: PastureLandUse;
  grassType: string;
  color: string;
  coordinates: PolygonCoordinates;
  grazeableAreaAcres: number;
}>;

function toPasture(value: z.infer<typeof pastureSchema>): Pasture {
  return {
    id: value.id,
    name: value.name,
    description: value.description ?? "",
    landUse: LAND_USE_FROM_API[value.landUse],
    grassType: value.grassType,
    color: value.color,
    coordinates: value.coordinates,
    areaAcres: value.areaAcres,
    grazeableAreaAcres: value.grazeableAreaAcres,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

async function readResponseBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return fallback;
}

async function requestJson<T>(
  url: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await apiFetch(url, init);
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, "The pasture request failed."));
  }

  return schema.parse(body);
}

export async function listPastures(): Promise<Pasture[]> {
  const { pastures } = await requestJson(
    "/api/pastures",
    pastureListEnvelopeSchema,
    { method: "GET", cache: "no-store" },
  );

  return pastures.map(toPasture);
}

export async function createPasture(
  input: CreatePastureRequest,
): Promise<Pasture> {
  const { pasture } = await requestJson(
    "/api/pastures",
    pastureEnvelopeSchema,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        description: input.description || null,
        landUse: LAND_USE_TO_API[input.landUse],
      }),
    },
  );

  return toPasture(pasture);
}
