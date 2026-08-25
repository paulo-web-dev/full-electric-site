import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ehStatusValido, STATUS_ROTULO, formatarDataHora } from "@/lib/crm";

/* Mesmos filtros da tela /admin/leads */
function montarWhere(params: URLSearchParams): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  const q = params.get("q");
  const status = params.get("status");
  const origem = params.get("origem");

  if (q) {
    where.OR = [
      { nome: { contains: q, mode: "insensitive" } },
      { telefone: { contains: q } },
    ];
  }
  if (status && ehStatusValido(status)) where.status = status;
  if (origem) where.origem = origem;
  return where;
}

/* CSV para Excel pt-BR: separador ";" e BOM UTF-8 */
function celula(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const leads = await prisma.lead.findMany({
    where: montarWhere(params),
    orderBy: { criadoEm: "desc" },
  });

  const cabecalho = [
    "Nome",
    "Telefone",
    "E-mail",
    "Modelo",
    "Uso",
    "Horário preferido",
    "Origem",
    "UTM source",
    "UTM medium",
    "UTM campaign",
    "Status",
    "Próximo contato",
    "Criado em",
  ];

  const linhas = leads.map((lead) =>
    [
      lead.nome,
      lead.telefone,
      lead.email ?? "",
      lead.modeloInteresse,
      lead.uso,
      lead.horarioPreferido,
      lead.origem,
      lead.utmSource ?? "",
      lead.utmMedium ?? "",
      lead.utmCampaign ?? "",
      STATUS_ROTULO[lead.status],
      lead.proximoContatoEm ? formatarDataHora(lead.proximoContatoEm) : "",
      formatarDataHora(lead.criadoEm),
    ]
      .map(celula)
      .join(";")
  );

  const csv =
    "﻿" + [cabecalho.map(celula).join(";"), ...linhas].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads-full-electric.csv"',
    },
  });
}
