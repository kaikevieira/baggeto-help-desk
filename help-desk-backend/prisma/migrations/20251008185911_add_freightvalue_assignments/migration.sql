-- AlterTable
ALTER TABLE "public"."Ticket" ADD COLUMN     "freightValue" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "public"."TicketAssignment" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketAssignment_userId_idx" ON "public"."TicketAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketAssignment_ticketId_userId_key" ON "public"."TicketAssignment"("ticketId", "userId");

-- AddForeignKey
ALTER TABLE "public"."TicketAssignment" ADD CONSTRAINT "TicketAssignment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TicketAssignment" ADD CONSTRAINT "TicketAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
