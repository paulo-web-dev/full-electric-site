-- CreateTable
CREATE TABLE "Consentimento" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "textoVersao" TEXT NOT NULL,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origem" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Consentimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consentimento_leadId_idx" ON "Consentimento"("leadId");

-- AddForeignKey
ALTER TABLE "Consentimento" ADD CONSTRAINT "Consentimento_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: todo lead que veio do site (qualquer origem que não seja um dos
-- valores manuais do admin) passou pelo checkbox obrigatório do formulário.
-- Lead de cadastro manual não ganha registro — consentimento não se inventa.
INSERT INTO "Consentimento" ("id", "leadId", "tipo", "textoVersao", "registradoEm", "origem")
SELECT gen_random_uuid()::text, "id", 'formulario', 'anterior-a-2026-08-28', "criadoEm", "origem"
FROM "Lead"
WHERE "origem" NOT IN ('PRESENCIAL', 'TELEFONE', 'INDICACAO', 'OUTRO');
