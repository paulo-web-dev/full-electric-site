import { NextResponse } from "next/server";
import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirApiToken } from "@/lib/apiToken";
import { novoConsentimento } from "@/lib/consentimento";
import { permitido, LIMITE_EXTERNO_POR_TOKEN, JANELA_EXTERNO_MS } from "@/lib/rateLimit";
import { STATUS_ORDEM, STATUS_ROTULO, ehStatusValido, formatarTelefone, telefoneChave } from "@/lib/crm";
import {
  ORIGEM_AGENTE,
  NOME_DESCONHECIDO,
  NOTA_AGENTE,
  STATUS_PELO_AGENTE,
  erroAgente,
  chaveRateLimitDoToken,
  chaveDeTelefoneValida,
  leadIdPorTelefone,
  telefoneE164,
} from "@/lib/agente";

/*
  Leitura e gravação de leads pelo agente de IA que atende o WhatsApp (n8n).
  Campanha click-to-WhatsApp não passa pelo site nem carrega UTM — sem isto o
  lead ficava só no WhatsApp. Contrato, exemplos e roteiro LGPD:
  docs/INTEGRACAO-WHATSAPP.md.

  - Token fixo API_TOKEN (lib/apiToken.ts), nunca sessão.
  - GET por telefone: "não achou" é 200 { encontrado: false } — contato novo
    é fluxo normal, não erro.
  - POST é upsert por telefone: só os campos enviados mudam; um POST com só o
    nome não apaga o modelo que já estava salvo. Telefone gravado com a
    máscara do CRM; devolvido também em E.164 para o agente mandar mensagem.
  - VENDIDO e PERDIDO → 403: venda e perda são registradas por uma pessoa no
    painel (venda com valor, perda com motivo). Revogação de contato é
    `optOut: true` — nunca `false` pela API.
  - Lead novo nasce com Consentimento "whatsapp_automacao" (CLAUDE.md §3.7):
    o agente só chama aqui depois de a pessoa concordar.
  - Escrita divide o rate limit por token com /api/agent/followups.
*/

export const dynamic = "force-dynamic";

const NOTAS_NA_RESPOSTA = 10;

interface Corpo {
  telefone: string; // chave: só dígitos, DDD + número
  nome?: string;
  modeloInteresse?: string;
  uso?: string;
  origem?: string;
  status?: LeadStatus;
  proximoContatoEm?: Date;
  observacao?: string;
  optOut?: true;
}

function texto(valor: unknown, max: number): string | undefined {
  if (typeof valor !== "string") return undefined;
  const t = valor.trim().slice(0, max);
  return t || undefined;
}

const leadComNotas = {
  notas: { orderBy: { criadoEm: "desc" as const }, take: NOTAS_NA_RESPOSTA },
};

type LeadComNotas = Prisma.LeadGetPayload<{ include: typeof leadComNotas }>;

function serializar(lead: LeadComNotas) {
  return {
    id: lead.id,
    nome: lead.nome,
    telefone: lead.telefone,
    telefoneE164: telefoneE164(lead.telefone),
    status: lead.status,
    modeloInteresse: lead.modeloInteresse,
    uso: lead.uso,
    origem: lead.origem,
    optOut: lead.optOut,
    followupsEnviados: lead.followupCount,
    ultimoFollowup: lead.ultimoFollowup,
    proximoContatoEm: lead.proximoContatoEm,
    criadoEm: lead.criadoEm,
    atualizadoEm: lead.atualizadoEm,
    notas: lead.notas.map((n) => ({ texto: n.texto, criadoEm: n.criadoEm })),
  };
}

/* ------------------------------------------------------------------- GET */

export async function GET(request: Request) {
  const bloqueio = exigirApiToken(request);
  if (bloqueio) return bloqueio;

  const chave = telefoneChave(new URL(request.url).searchParams.get("telefone") ?? "");
  if (!chaveDeTelefoneValida(chave)) {
    return erroAgente(400, "telefone_invalido", "Informe ?telefone= com DDD + número (10 ou 11 dígitos, com ou sem +55).");
  }

  try {
    const id = await leadIdPorTelefone(chave);
    const lead = id ? await prisma.lead.findUnique({ where: { id }, include: leadComNotas }) : null;
    if (!lead) {
      return NextResponse.json({
        encontrado: false,
        telefone: formatarTelefone(chave),
        telefoneE164: `55${chave}`,
      });
    }
    return NextResponse.json({ encontrado: true, lead: serializar(lead) });
  } catch {
    return erroAgente(503, "banco_indisponivel", "Banco de dados indisponível. Tente de novo em instantes.");
  }
}

/* ------------------------------------------------------------------ POST */

function validar(corpo: unknown): { entrada: Corpo } | { resposta: NextResponse } {
  if (typeof corpo !== "object" || corpo === null) {
    return { resposta: erroAgente(400, "json_invalido", "O corpo precisa ser um objeto JSON.") };
  }
  const c = corpo as Record<string, unknown>;

  const telefone = telefoneChave(texto(c.telefone, 20) ?? "");
  if (!chaveDeTelefoneValida(telefone)) {
    return { resposta: erroAgente(400, "telefone_invalido", "telefone precisa ter DDD + número (10 ou 11 dígitos, com ou sem +55).") };
  }

  let status: LeadStatus | undefined;
  const statusBruto = texto(c.status, 30)?.toUpperCase();
  if (statusBruto) {
    if (statusBruto === "VENDIDO") {
      return {
        resposta: erroAgente(
          403,
          "status_reservado_ao_humano",
          "VENDIDO só é registrado por uma pessoa no painel, com valor e data. Não tente de novo. Se o cliente disse que fechou, escreva isso em observacao e deixe o status como está."
        ),
      };
    }
    if (statusBruto === "PERDIDO") {
      return {
        resposta: erroAgente(
          403,
          "status_reservado_ao_humano",
          "PERDIDO exige motivo e é registrado por humano. Se a pessoa pediu para não ser mais contatada, envie optOut: true (isso é revogação, não perda). Se ela só parou de responder, não mude o status — o follow-up automático cuida disso."
        ),
      };
    }
    if (!ehStatusValido(statusBruto) || !STATUS_PELO_AGENTE.includes(statusBruto)) {
      return {
        resposta: erroAgente(
          400,
          "status_invalido",
          `Status aceitos pelo agente: ${STATUS_PELO_AGENTE.join(", ")}. Todos os status do CRM: ${STATUS_ORDEM.join(", ")}.`
        ),
      };
    }
    status = statusBruto;
  }

  let proximoContatoEm: Date | undefined;
  const quandoBruto = texto(c.proximoContatoEm, 40);
  if (quandoBruto) {
    const d = new Date(quandoBruto);
    if (Number.isNaN(d.getTime())) {
      return { resposta: erroAgente(400, "data_invalida", "proximoContatoEm precisa ser ISO 8601, ex.: 2026-08-30T14:00:00-03:00.") };
    }
    proximoContatoEm = d;
  }
  if (status === "TEST_DRIVE_AGENDADO" && !proximoContatoEm) {
    return {
      resposta: erroAgente(
        400,
        "data_obrigatoria",
        "TEST_DRIVE_AGENDADO exige proximoContatoEm (data e hora combinadas, ISO 8601, ex.: 2026-08-30T14:00:00-03:00)."
      ),
    };
  }

  let optOut: true | undefined;
  if (c.optOut !== undefined) {
    if (c.optOut !== true) {
      return {
        resposta: erroAgente(
          400,
          "optout_invalido",
          "optOut só aceita true. A revogação não se desfaz pela API — só a equipe, pelo painel."
        ),
      };
    }
    optOut = true;
  }

  return {
    entrada: {
      telefone,
      nome: texto(c.nome, 120),
      modeloInteresse: texto(c.modeloInteresse, 120),
      uso: texto(c.uso, 60),
      origem: texto(c.origem, 40),
      status,
      proximoContatoEm,
      observacao: texto(c.observacao, 2000),
      optOut,
    },
  };
}

export async function POST(request: Request) {
  const bloqueio = exigirApiToken(request);
  if (bloqueio) return bloqueio;

  const chaveLimite = chaveRateLimitDoToken(request.headers.get("authorization"));
  if (!permitido(chaveLimite, LIMITE_EXTERNO_POR_TOKEN, JANELA_EXTERNO_MS)) {
    return NextResponse.json(
      { error: "rate_limited", mensagem: `Limite de ${LIMITE_EXTERNO_POR_TOKEN} gravações por hora atingido. Espere e tente de novo.` },
      { status: 429, headers: { "Retry-After": String(JANELA_EXTERNO_MS / 1000) } }
    );
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return erroAgente(400, "json_invalido", "Corpo não é JSON válido.");
  }
  const validacao = validar(corpo);
  if ("resposta" in validacao) return validacao.resposta;
  const e = validacao.entrada;

  try {
    const id = await leadIdPorTelefone(e.telefone);

    if (id) {
      const atual = await prisma.lead.findUnique({ where: { id }, select: { status: true } });
      if (!atual) throw new Error("lead sumiu entre a busca e a atualização");

      const notas: Prisma.NotaCreateWithoutLeadInput[] = [];
      const data: Prisma.LeadUpdateInput = {};
      if (e.nome) data.nome = e.nome;
      if (e.modeloInteresse) data.modeloInteresse = e.modeloInteresse;
      if (e.uso) data.uso = e.uso;
      if (e.optOut) data.optOut = true;
      if (e.proximoContatoEm) data.proximoContatoEm = e.proximoContatoEm;
      if (e.status && e.status !== atual.status) {
        data.status = e.status;
        notas.push({ texto: `${NOTA_AGENTE} Status: ${STATUS_ROTULO[atual.status]} → ${STATUS_ROTULO[e.status]}` });
      }
      if (e.observacao) notas.push({ texto: `${NOTA_AGENTE} ${e.observacao}` });
      if (notas.length) data.notas = { create: notas };

      const lead = await prisma.lead.update({ where: { id }, data, select: { id: true, status: true } });
      return NextResponse.json({ ok: true, leadId: lead.id, status: lead.status, criado: false });
    }

    const origem = e.origem ?? ORIGEM_AGENTE;
    const lead = await prisma.lead.create({
      data: {
        nome: e.nome ?? NOME_DESCONHECIDO,
        telefone: formatarTelefone(e.telefone),
        modeloInteresse: e.modeloInteresse ?? "",
        uso: e.uso ?? "",
        horarioPreferido: null,
        origem,
        status: e.status ?? "NOVO",
        proximoContatoEm: e.proximoContatoEm ?? null,
        optOut: e.optOut ?? false,
        consentimentos: { create: novoConsentimento("whatsapp_automacao", origem) },
        notas: e.observacao ? { create: { texto: `${NOTA_AGENTE} ${e.observacao}` } } : undefined,
      },
      select: { id: true, status: true },
    });
    return NextResponse.json({ ok: true, leadId: lead.id, status: lead.status, criado: true }, { status: 201 });
  } catch {
    return erroAgente(503, "banco_indisponivel", "Banco de dados indisponível. Tente de novo em instantes.");
  }
}
