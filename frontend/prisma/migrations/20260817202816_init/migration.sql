-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PastureStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LandUse" AS ENUM ('GRAZING', 'HAY', 'MIXED', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "lastLoginAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pasture" (
    "id" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "PastureStatus" NOT NULL DEFAULT 'ACTIVE',
    "landUse" "LandUse" NOT NULL DEFAULT 'GRAZING',
    "grassType" VARCHAR(150) NOT NULL,
    "color" CHAR(7) NOT NULL DEFAULT '#28A8CF',
    "boundary" JSONB NOT NULL,
    "centroidLat" DECIMAL(9,6) NOT NULL,
    "centroidLng" DECIMAL(9,6) NOT NULL,
    "boundingNorth" DECIMAL(9,6) NOT NULL,
    "boundingSouth" DECIMAL(9,6) NOT NULL,
    "boundingEast" DECIMAL(9,6) NOT NULL,
    "boundingWest" DECIMAL(9,6) NOT NULL,
    "areaAcres" DECIMAL(12,4) NOT NULL,
    "grazeableAreaAcres" DECIMAL(12,4) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "archivedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Pasture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Pasture_createdById_status_idx" ON "Pasture"("createdById", "status");

-- CreateIndex
CREATE INDEX "Pasture_createdById_updatedAt_idx" ON "Pasture"("createdById", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pasture_createdById_name_key" ON "Pasture"("createdById", "name");

-- AddForeignKey
ALTER TABLE "Pasture" ADD CONSTRAINT "Pasture_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
