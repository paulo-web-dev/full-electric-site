import { PrismaClient } from "@prisma/client";

/* Singleton para não abrir uma conexão nova a cada hot reload em dev */
const globalComPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalComPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalComPrisma.prisma = prisma;
}
