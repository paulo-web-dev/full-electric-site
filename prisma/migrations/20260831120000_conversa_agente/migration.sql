-- CreateTable
CREATE TABLE "ConversaAgente" (
    "id" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "historico" JSONB NOT NULL DEFAULT '[]',
    "pausadoAte" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversaAgente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversaAgente_telefone_key" ON "ConversaAgente"("telefone");
