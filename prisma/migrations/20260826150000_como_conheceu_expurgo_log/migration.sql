-- CreateEnum
CREATE TYPE "ComoConheceu" AS ENUM ('PANFLETO', 'GOOGLE', 'INSTAGRAM', 'INDICACAO', 'PASSOU_NA_FRENTE', 'OUTRO');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "comoConheceu" "ComoConheceu";

-- CreateTable
CREATE TABLE "ExpurgoLog" (
    "id" TEXT NOT NULL,
    "executadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "simulacao" BOOLEAN NOT NULL,
    "limite" TIMESTAMP(3) NOT NULL,
    "candidatos" INTEGER NOT NULL,
    "apagados" INTEGER NOT NULL,

    CONSTRAINT "ExpurgoLog_pkey" PRIMARY KEY ("id")
);

