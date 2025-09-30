-- AlterTable
ALTER TABLE "public"."Ticket" ADD COLUMN     "cteRepresentative" TEXT,
ADD COLUMN     "hasToll" BOOLEAN,
ADD COLUMN     "manifestRepresentative" TEXT;
