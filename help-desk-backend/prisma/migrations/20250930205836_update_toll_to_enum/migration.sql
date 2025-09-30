/*
  Warnings:

  - The `hasToll` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."TollType" AS ENUM ('COM_PEDAGIO', 'SEM_PEDAGIO', 'CLIENTE_PAGA_PEDAGIO');

-- AlterTable
ALTER TABLE "public"."Ticket" DROP COLUMN "hasToll",
ADD COLUMN     "hasToll" "public"."TollType";
