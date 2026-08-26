-- CreateEnum
CREATE TYPE "MotivoPerda" AS ENUM ('PRECO', 'OUTRA_LOJA', 'SUMIU', 'SEM_MODELO', 'OUTRO');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "modeloVendido" TEXT,
ADD COLUMN     "motivoPerda" "MotivoPerda",
ADD COLUMN     "motivoPerdaDetalhe" TEXT,
ALTER COLUMN "horarioPreferido" DROP NOT NULL;

