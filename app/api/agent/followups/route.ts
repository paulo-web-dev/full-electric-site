import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exigirApiToken } from "@/lib/apiToken";
import { permitido, LIMITE_EXTERNO_POR_TOKEN, JANELA_EXTERNO_MS } from "@/lib/rateLimit";
import {
  MAX_FOLLOWUPS,
  INTERVALO_FOLLOWUP_MS,
  erroAgente,
  chaveRateLimitDoToken,
  primeiroNome,
  telefoneE164,
} from "@/lib/agente";

/*
  Fila de follow-up automático do agente do WhatsApp (n8n decide a mensagem;
  aqui só a parte que depende do banco). Contrato: docs/INTEGRACAO-WHATSAPP.md.

  Elegível: optOut = false, menos de MAX_FOLLOWUPS enviados, status fora de
  VENDIDO/PERDIDO, e nenhum follow-up nas últimas 24 h. `diasSemContato`
  conta a partir de (ultimoFollowup ?? atualizadoEm): é a referência que a
  cascata 1d / 3d / 10d espera — o próprio follow-up não zera a contagem
  como se fosse resposta da pessoa.

  A política de privacidade descreve as mensagens de retomada (até 3) e
  como parar; `optOut: true` em /api/agent/leads encerra a fila para o lead.
*/

export const dynamic = "force-dynamic";

const TAMANHO_FILA = 200;
const DIA_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const bloqueio = exigirApiToken(request);
  if (bloqueio) return bloqueio;

  const agora = Date.now();
  const limiteUltimo = new Date(agora - INTERVALO_FOLLOWUP_MS);

  try {
    const leads = await prisma.lead.findMany({
      where: {
        optOut: false,
        followupCount: { lt: MAX_FOLLOWUPS },
        status: { notIn: ["VENDIDO", "PERDIDO"] },
        OR: [{ ultimoFollowup: null }, { ultimoFollowup: { lt: limiteUltimo } }],
      },
      orderBy: { atualizadoEm: "asc" },
      take: TAMANHO_FILA,
      select: {
        id: true,
        nome: true,
        telefone: true,
        status: true,
        modeloInteresse: true,
        followupCount: true,
        ultimoFollowup: true,
        atualizadoEm: true,
      },
    });

    const fila = leads.map((l) => {
      const referencia = l.ultimoFollowup ?? l.atualizadoEm;
      return {
        leadId: l.id,
        nome: primeiroNome(l.nome),
        telefone: l.telefone,
        telefoneE164: telefoneE164(l.telefone),
        status: l.status,
        modeloInteresse: l.modeloInteresse,
        diasSemContato: Math.max(0, Math.floor((agora - referencia.getTime()) / DIA_MS)),
        followupsEnviados: l.followupCount,
      };
    });
    return NextResponse.json({ total: fila.length, fila });
  } catch {
    return erroAgente(503, "banco_indisponivel", "Banco de dados indisponível. Tente de novo em instantes.");
  }
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
  const c = (typeof corpo === "object" && corpo !== null ? corpo : {}) as Record<string, unknown>;
  const leadId = typeof c.leadId === "string" ? c.leadId.trim().slice(0, 40) : "";
  const etapa = typeof c.etapa === "string" || typeof c.etapa === "number" ? String(c.etapa).trim().slice(0, 40) : "";
  const mensagem = typeof c.mensagem === "string" ? c.mensagem.trim().slice(0, 2000) : "";
  if (!leadId || !etapa || !mensagem) {
    return erroAgente(400, "campos_obrigatorios", "Envie leadId, etapa e mensagem (a mensagem que foi enviada).");
  }

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, optOut: true } });
    if (!lead) {
      return erroAgente(404, "lead_nao_encontrado", "Nenhum lead com esse leadId. Use o leadId devolvido por /api/agent/followups ou /api/agent/leads.");
    }

    const atualizado = await prisma.lead.update({
      where: { id: leadId },
      data: {
        followupCount: { increment: 1 },
        ultimoFollowup: new Date(),
        notas: { create: { texto: `[follow-up ${etapa}] ${mensagem}` } },
      },
      select: { followupCount: true },
    });

    return NextResponse.json({
      ok: true,
      followupsEnviados: atualizado.followupCount,
      // Se chegou aqui com optOut, a mensagem já saiu — fica registrada, mas
      // o agente precisa parar: a pessoa pediu para não ser contatada.
      ...(lead.optOut ? { aviso: "Este lead pediu para não ser mais contatado (optOut). Não envie mais nada." } : {}),
    });
  } catch {
    return erroAgente(503, "banco_indisponivel", "Banco de dados indisponível. Tente de novo em instantes.");
  }
}
