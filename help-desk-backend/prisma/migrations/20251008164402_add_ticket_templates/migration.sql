-- CreateTable
CREATE TABLE "public"."TicketTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TicketTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketTemplate_userId_idx" ON "public"."TicketTemplate"("userId");

-- AddForeignKey
ALTER TABLE "public"."TicketTemplate" ADD CONSTRAINT "TicketTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
