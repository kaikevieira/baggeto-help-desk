-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('DARK', 'LIGHT', 'LIGHT_PINK');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "theme" "public"."Theme" NOT NULL DEFAULT 'DARK';
