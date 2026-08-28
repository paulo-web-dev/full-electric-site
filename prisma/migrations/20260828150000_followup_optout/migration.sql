-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "followupCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "optOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ultimoFollowup" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Lead_telefone_idx" ON "Lead"("telefone");
