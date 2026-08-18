import { PastureStatus, Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { calculatePastureGeometry } from "@/lib/pastures/pasture.geometry";
import { toPastureResponse } from "@/lib/pastures/pasture.mapper";
import {
  archivePastureRecord,
  createPastureRecord,
  findActivePastureRecord,
  listActivePastureRecords,
  updatePastureRecord,
} from "@/lib/pastures/pasture.repository";
import {
  createPastureSchema,
  pastureIdSchema,
  updatePastureSchema,
} from "@/lib/pastures/pasture.validation";

const AREA_TOLERANCE_ACRES = 0.01;

function validateGrazeableArea(grazeableAreaAcres: number, areaAcres: number) {
  if (grazeableAreaAcres > areaAcres + AREA_TOLERANCE_ACRES) {
    throw new ApiError(
      400,
      "INVALID_GRAZEABLE_AREA",
      "Grazeable area cannot be greater than total pasture area.",
    );
  }
}

function translateWriteError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new ApiError(
      409,
      "PASTURE_NAME_EXISTS",
      "You already have a pasture with this name.",
    );
  }

  throw error;
}

export async function listPasturesForUser(userId: string) {
  const records = await listActivePastureRecords(userId);
  return records.map(toPastureResponse);
}

export async function getPastureForUser(userId: string, rawPastureId: string) {
  const pastureId = pastureIdSchema.parse(rawPastureId);
  const record = await findActivePastureRecord(pastureId, userId);

  if (!record) {
    throw new ApiError(404, "PASTURE_NOT_FOUND", "Pasture was not found.");
  }

  return toPastureResponse(record);
}

export async function createPastureForUser(userId: string, body: unknown) {
  const input = createPastureSchema.parse(body);
  const geometry = calculatePastureGeometry(input.coordinates);
  validateGrazeableArea(input.grazeableAreaAcres, geometry.areaAcres);

  try {
    const record = await createPastureRecord({
      createdById: userId,
      name: input.name,
      description: input.description,
      status: PastureStatus.ACTIVE,
      landUse: input.landUse,
      grassType: input.grassType,
      color: input.color,
      boundary: geometry.boundary as unknown as Prisma.InputJsonValue,
      centroidLat: geometry.centroidLat,
      centroidLng: geometry.centroidLng,
      boundingNorth: geometry.boundingNorth,
      boundingSouth: geometry.boundingSouth,
      boundingEast: geometry.boundingEast,
      boundingWest: geometry.boundingWest,
      areaAcres: geometry.areaAcres,
      grazeableAreaAcres: input.grazeableAreaAcres,
    });

    return toPastureResponse(record);
  } catch (error) {
    return translateWriteError(error);
  }
}

export async function updatePastureForUser(
  userId: string,
  rawPastureId: string,
  body: unknown,
) {
  const pastureId = pastureIdSchema.parse(rawPastureId);
  const input = updatePastureSchema.parse(body);
  const existing = await findActivePastureRecord(pastureId, userId);

  if (!existing) {
    throw new ApiError(404, "PASTURE_NOT_FOUND", "Pasture was not found.");
  }

  const geometry = input.coordinates
    ? calculatePastureGeometry(input.coordinates)
    : null;
  const totalAreaAcres = geometry?.areaAcres ?? existing.areaAcres.toNumber();
  const grazeableAreaAcres =
    input.grazeableAreaAcres ?? existing.grazeableAreaAcres.toNumber();

  validateGrazeableArea(grazeableAreaAcres, totalAreaAcres);

  const update: Prisma.PastureUpdateManyMutationInput = {
    version: { increment: 1 },
  };

  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.landUse !== undefined) update.landUse = input.landUse;
  if (input.grassType !== undefined) update.grassType = input.grassType;
  if (input.color !== undefined) update.color = input.color;
  if (input.grazeableAreaAcres !== undefined) {
    update.grazeableAreaAcres = input.grazeableAreaAcres;
  }

  if (geometry) {
    update.boundary = geometry.boundary as unknown as Prisma.InputJsonValue;
    update.areaAcres = geometry.areaAcres;
    update.centroidLat = geometry.centroidLat;
    update.centroidLng = geometry.centroidLng;
    update.boundingNorth = geometry.boundingNorth;
    update.boundingSouth = geometry.boundingSouth;
    update.boundingEast = geometry.boundingEast;
    update.boundingWest = geometry.boundingWest;
  }

  try {
    const record = await updatePastureRecord(
      pastureId,
      userId,
      input.version,
      update,
    );

    if (!record) {
      throw new ApiError(
        409,
        "PASTURE_VERSION_CONFLICT",
        "This pasture was modified elsewhere. Reload it and try again.",
      );
    }

    return toPastureResponse(record);
  } catch (error) {
    return translateWriteError(error);
  }
}

export async function archivePastureForUser(
  userId: string,
  rawPastureId: string,
) {
  const pastureId = pastureIdSchema.parse(rawPastureId);
  const archived = await archivePastureRecord(pastureId, userId);

  if (!archived) {
    throw new ApiError(404, "PASTURE_NOT_FOUND", "Pasture was not found.");
  }
}
