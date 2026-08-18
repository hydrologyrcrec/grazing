import { PastureStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const pastureSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  landUse: true,
  grassType: true,
  color: true,
  boundary: true,
  centroidLat: true,
  centroidLng: true,
  boundingNorth: true,
  boundingSouth: true,
  boundingEast: true,
  boundingWest: true,
  areaAcres: true,
  grazeableAreaAcres: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PastureSelect;

export type PastureRecord = Prisma.PastureGetPayload<{
  select: typeof pastureSelect;
}>;

export function listActivePastureRecords(createdById: string) {
  return prisma.pasture.findMany({
    where: { createdById, status: PastureStatus.ACTIVE },
    select: pastureSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
}

export function findActivePastureRecord(id: string, createdById: string) {
  return prisma.pasture.findFirst({
    where: { id, createdById, status: PastureStatus.ACTIVE },
    select: pastureSelect,
  });
}

export function createPastureRecord(data: Prisma.PastureUncheckedCreateInput) {
  return prisma.pasture.create({ data, select: pastureSelect });
}

export function updatePastureRecord(
  id: string,
  createdById: string,
  expectedVersion: number,
  data: Prisma.PastureUpdateManyMutationInput,
) {
  return prisma.$transaction(async (transaction) => {
    const result = await transaction.pasture.updateMany({
      where: {
        id,
        createdById,
        status: PastureStatus.ACTIVE,
        version: expectedVersion,
      },
      data,
    });

    if (result.count !== 1) return null;

    return transaction.pasture.findFirst({
      where: { id, createdById, status: PastureStatus.ACTIVE },
      select: pastureSelect,
    });
  });
}

export async function archivePastureRecord(id: string, createdById: string) {
  const result = await prisma.pasture.updateMany({
    where: { id, createdById, status: PastureStatus.ACTIVE },
    data: {
      status: PastureStatus.ARCHIVED,
      archivedAt: new Date(),
      version: { increment: 1 },
    },
  });

  return result.count === 1;
}
