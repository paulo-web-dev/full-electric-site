import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bearerValido } from "@/lib/apiToken";

/*
  Expurgo LGPD — cumpre a retenção de 12 meses prometida em
  /politica-de-privacidade (CLAUDE.md §3.7).

  Critério: lead cujo último sinal de vida (a data mais recente entre
  `atualizadoEm` e a última nota) tem mais de 12 meses. VENDIDO nunca é
  apagado — é registro comercial, com prazo fiscal e de garantia próprio.
  Notas caem em cascata (FK onDelete: Cascade).

  Autenticação: header `Authorization: Bearer <CRON_SECRET>` — o middleware
  libera esta rota da sessão de admin justamente para o cron chamar.

  Dry-run por padrão: só apaga com `?confirmar=true`. Toda execução (real ou
  simulada) grava uma linha em ExpurgoLog — é a prova de que a rotina roda.
  Agendamento semanal na VPS: docs/DEPLOY.md §9.
*/

const MESES_DE_RETENCAO = 12;

function dataLimite(): Date {
  const limite = new Date();
  limite.setUTCMonth(limite.getUTCMonth() - MESES_DE_RETENCAO);
  return limite;
}

export async function GET(request: Request) {
  if (!bearerValido(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const confirmar = new URL(request.url).searchParams.get("confirmar") === "true";
  const limite = dataLimite();

  // "Sem contato há 12 meses": atualizadoEm antigo E nenhuma nota recente.
  // (Adicionar nota não toca atualizadoEm do lead, por isso a checagem dupla.)
  const candidatos = await prisma.lead.findMany({
    where: {
      status: { not: "VENDIDO" },
      atualizadoEm: { lt: limite },
      notas: { none: { criadoEm: { gte: limite } } },
    },
    select: { id: true, status: true, atualizadoEm: true },
    orderBy: { atualizadoEm: "asc" },
  });

  let apagados = 0;
  if (confirmar && candidatos.length > 0) {
    const resultado = await prisma.lead.deleteMany({
      where: { id: { in: candidatos.map((c) => c.id) } },
    });
    apagados = resultado.count;
  }

  const log = await prisma.expurgoLog.create({
    data: {
      simulacao: !confirmar,
      limite,
      candidatos: candidatos.length,
      apagados,
    },
  });

  return NextResponse.json({
    simulacao: !confirmar,
    executadoEm: log.executadoEm,
    limite,
    candidatos: candidatos.length,
    apagados,
    porStatus: candidatos.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {}),
    ...(confirmar
      ? {}
      : { aviso: "Simulação — nada foi apagado. Use ?confirmar=true para apagar." }),
  });
}
