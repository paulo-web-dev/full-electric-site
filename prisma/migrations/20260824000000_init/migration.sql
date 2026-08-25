-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOVO', 'CONTATADO', 'TEST_DRIVE_AGENDADO', 'NEGOCIANDO', 'VENDIDO', 'PERDIDO');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "modeloInteresse" TEXT NOT NULL,
    "uso" TEXT NOT NULL,
    "horarioPreferido" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "proximoContatoEm" TIMESTAMP(3),
    "valorVenda" DECIMAL(10,2),
    "dataVenda" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_criadoEm_idx" ON "Lead"("criadoEm");

-- CreateIndex
CREATE INDEX "Lead_proximoContatoEm_idx" ON "Lead"("proximoContatoEm");

-- CreateIndex
CREATE INDEX "Nota_leadId_idx" ON "Nota"("leadId");

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
