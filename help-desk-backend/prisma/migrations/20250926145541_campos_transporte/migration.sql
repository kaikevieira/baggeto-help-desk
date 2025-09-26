-- CreateEnum
CREATE TYPE "public"."FreightBasis" AS ENUM ('FULL', 'TON');

-- CreateEnum
CREATE TYPE "public"."Incoterm" AS ENUM ('CIF', 'FOB');

-- CreateEnum
CREATE TYPE "public"."FleetType" AS ENUM ('FROTA', 'TERCEIRO');

-- AlterTable
ALTER TABLE "public"."Ticket" ADD COLUMN     "billingCompany" TEXT,
ADD COLUMN     "cargoWeight" DECIMAL(10,3),
ADD COLUMN     "destinationCity" TEXT,
ADD COLUMN     "destinationIBGEId" INTEGER,
ADD COLUMN     "destinationUF" VARCHAR(2),
ADD COLUMN     "fleetType" "public"."FleetType" NOT NULL DEFAULT 'FROTA',
ADD COLUMN     "freightBasis" "public"."FreightBasis" NOT NULL DEFAULT 'FULL',
ADD COLUMN     "incoterm" "public"."Incoterm" NOT NULL DEFAULT 'CIF',
ADD COLUMN     "originCity" TEXT,
ADD COLUMN     "originIBGEId" INTEGER,
ADD COLUMN     "originUF" VARCHAR(2),
ADD COLUMN     "paymentTerm" TEXT,
ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "plateCarreta1" TEXT,
ADD COLUMN     "plateCarreta2" TEXT,
ADD COLUMN     "plateCarreta3" TEXT,
ADD COLUMN     "plateCavalo" TEXT,
ADD COLUMN     "serviceTaker" TEXT,
ADD COLUMN     "thirdPartyPayment" DECIMAL(10,2);
