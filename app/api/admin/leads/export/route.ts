import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  ehStatusValido,
  ehComoConheceuValido,
  COMO_CONHECEU_ROTULO,
  STATUS_ROTULO,
  MOTIVO_PERDA_ROTULO,
  ehOrigemManual,
  rotuloOrigem,
  formatarData,
  formatarDataHora,
} from "@/lib/crm";

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
  const comoConheceu = params.get("comoConheceu");
  if (comoConheceu && ehComoConheceuValido(comoConheceu)) {
    where.comoConheceu = comoConheceu;
  }
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
    "Canal",
    "Como conheceu",
    "UTM source",
    "UTM medium",
    "UTM campaign",
    "Status",
    "Próximo contato",
    "Modelo vendido",
    "Valor da venda",
    "Data da venda",
    "Motivo da perda",
    "Detalhe da perda",
    "Criado em",
  ];

  const linhas = leads.map((lead) =>
    [
      lead.nome,
      lead.telefone,
      lead.email ?? "",
      lead.modeloInteresse,
      lead.uso,
      lead.horarioPreferido ?? "",
      rotuloOrigem(lead.origem),
      ehOrigemManual(lead.origem) ? "Manual" : "Site",
      lead.comoConheceu ? COMO_CONHECEU_ROTULO[lead.comoConheceu] : "",
      lead.utmSource ?? "",
      lead.utmMedium ?? "",
      lead.utmCampaign ?? "",
      STATUS_ROTULO[lead.status],
      lead.proximoContatoEm ? formatarDataHora(lead.proximoContatoEm) : "",
      lead.modeloVendido ?? "",
      lead.valorVenda !== null ? Number(lead.valorVenda).toFixed(2).replace(".", ",") : "",
      lead.dataVenda ? formatarData(lead.dataVenda) : "",
      lead.motivoPerda ? MOTIVO_PERDA_ROTULO[lead.motivoPerda] : "",
      lead.motivoPerdaDetalhe ?? "",
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
