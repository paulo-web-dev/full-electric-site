-- Campos de venda no Lead (24/08/2026).
-- Aplicar no Neon (SQL Editor) OU rodar `npx prisma db push` com o .env preenchido.
ALTER TABLE "Lead" ADD COLUMN     "dataVenda" TIMESTAMP(3),
ADD COLUMN     "valorVenda" DECIMAL(10,2);
