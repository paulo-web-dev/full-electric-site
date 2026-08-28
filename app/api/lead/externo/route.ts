import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { ComoConheceu, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { bearerValido } from "@/lib/apiToken";
import { novoConsentimento } from "@/lib/consentimento";
import { permitido, LIMITE_EXTERNO_POR_TOKEN, JANELA_EXTERNO_MS } from "@/lib/rateLimit";
import {
  COMO_CONHECEU_ORDEM,
  ehComoConheceuValido,
  formatarTelefone,
  telefoneChave,
} from "@/lib/crm";

/*
  Entrada de leads que não passam pelo site — hoje, a automação de IA que
  atende o WhatsApp das campanhas click-to-WhatsApp do Meta. O clique no
  anúncio abre o WhatsApp direto, sem UTM e sem página nossa no caminho, então
  sem esta rota o lead nunca chegaria ao CRM. Contrato, exemplo de chamada e
  geração do token: docs/INTEGRACAO-WHATSAPP.md.

  - Autenticação por token fixo (`Authorization: Bearer <API_TOKEN>`), não
    por sessão.
  - Rate limit por token (LIMITE_EXTERNO_POR_TOKEN), com 429 explícito — a
    automação é cliente autenticado e precisa saber que deve tentar de novo;
    o bloqueio silencioso é para bot no formulário público.
  - Idempotente por telefone: mesmo número = mesmo lead. A observação vira
    nota nova; campos vazios são preenchidos; nada gravado é sobrescrito.
  - LGPD (CLAUDE.md §3.7): grava um Consentimento "whatsapp_automacao". A
    automação só chama aqui depois de se identificar como automática, dizer
    para que os dados servem e a pessoa concordar (política, seções 2 e 4).
    Chamadas repetidas na mesma conversa (até 24 h) não duplicam o registro;
    um contato novo depois disso registra a nova manifestação.
*/

const CONSENTIMENTO = "whatsapp_automacao";
const ORIGEM_PADRAO = "whatsapp-automacao";
const MESMA_CONVERSA_MS = 24 * 60 * 60 * 1000;

interface Entrada {
  nome: string;
  telefone: string; // só dígitos, DDD + número
  email?: string;
  modeloInteresse?: string;
  uso?: string;
  comoConheceu?: ComoConheceu;
  origem: string;
  observacao?: string;
}

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

function textoOpcional(valor: unknown, max: number): string | undefined {
  const t = texto(valor, max);
  return t || undefined;
}

function validar(corpo: unknown): { entrada: Entrada } | { erro: string } {
  if (typeof corpo !== "object" || corpo === null) {
    return { erro: "Corpo deve ser um objeto JSON" };
  }
  const c = corpo as Record<string, unknown>;

  const nome = texto(c.nome, 120);
  if (!nome) return { erro: "nome é obrigatório" };

  const telefone = telefoneChave(texto(c.telefone, 20));
  if (telefone.length < 10 || telefone.length > 11) {
    return { erro: "telefone inválido — use DDD + número (10 ou 11 dígitos, com ou sem +55)" };
  }

  const email = textoOpcional(c.email, 160);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { erro: "email inválido" };
  }

  let comoConheceu: ComoConheceu | undefined;
  const comoConheceuBruto = texto(c.comoConheceu, 30).toUpperCase();
  if (comoConheceuBruto) {
    if (!ehComoConheceuValido(comoConheceuBruto)) {
      return { erro: `comoConheceu inválido — aceitos: ${COMO_CONHECEU_ORDEM.join(", ")}` };
    }
    comoConheceu = comoConheceuBruto;
  }

  return {
    entrada: {
      nome,
      telefone,
      email,
      modeloInteresse: textoOpcional(c.modeloInteresse, 60),
      uso: textoOpcional(c.uso, 60),
      comoConheceu,
      origem: texto(c.origem, 40) || ORIGEM_PADRAO,
      observacao: textoOpcional(c.observacao, 2000),
    },
  };
}

/* Chave do rate limit: o token, não o IP. Só um resumo dele vai para o mapa. */
function chaveDoToken(cabecalho: string | null): string {
  const token = (cabecalho ?? "").replace(/^Bearer\s+/i, "").trim();
  return `externo:${createHash("sha256").update(token).digest("hex").slice(0, 16)}`;
}

/* Lead já cadastrado com este telefone, em qualquer máscara. O `contains`
   nos 4 últimos dígitos só reduz a busca; a igualdade real é pela chave. */
async function buscarPorTelefone(chave: string) {
  const candidatos = await prisma.lead.findMany({
    where: { telefone: { contains: chave.slice(-4) } },
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      telefone: true,
      email: true,
      modeloInteresse: true,
      uso: true,
      comoConheceu: true,
    },
  });
  return candidatos.find((l) => telefoneChave(l.telefone) === chave) ?? null;
}

export async function POST(request: Request) {
  const autorizacao = request.headers.get("authorization");
  if (!bearerValido(autorizacao, process.env.API_TOKEN)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  if (!permitido(chaveDoToken(autorizacao), LIMITE_EXTERNO_POR_TOKEN, JANELA_EXTERNO_MS)) {
    return NextResponse.json(
      { erro: `Limite de ${LIMITE_EXTERNO_POR_TOKEN} leads por hora atingido — tente de novo mais tarde` },
      { status: 429, headers: { "Retry-After": String(JANELA_EXTERNO_MS / 1000) } }
    );
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const validacao = validar(corpo);
  if ("erro" in validacao) {
    return NextResponse.json({ erro: validacao.erro }, { status: 400 });
  }
  const e = validacao.entrada;
  const consentimento = novoConsentimento(CONSENTIMENTO, e.origem);

  try {
    const existente = await buscarPorTelefone(e.telefone);

    if (existente) {
      const mesmaConversa = await prisma.consentimento.count({
        where: {
          leadId: existente.id,
          tipo: CONSENTIMENTO,
          registradoEm: { gte: new Date(Date.now() - MESMA_CONVERSA_MS) },
        },
      });
      const data: Prisma.LeadUpdateInput = {
        // Toda chamada registra o contato como nota — também renova a
        // retenção de 12 meses, porque houve contato de verdade.
        notas: {
          create: {
            texto: e.observacao
              ? `[${e.origem}] ${e.observacao}`
              : `[${e.origem}] Novo contato pelo atendimento automatizado do WhatsApp.`,
          },
        },
        consentimentos: mesmaConversa > 0 ? undefined : { create: consentimento },
      };
      if (!existente.email && e.email) data.email = e.email;
      if (!existente.modeloInteresse && e.modeloInteresse) data.modeloInteresse = e.modeloInteresse;
      if (!existente.uso && e.uso) data.uso = e.uso;
      if (!existente.comoConheceu && e.comoConheceu) data.comoConheceu = e.comoConheceu;
      await prisma.lead.update({ where: { id: existente.id }, data });
      return NextResponse.json({ ok: true, id: existente.id, criado: false });
    }

    const lead = await prisma.lead.create({
      data: {
        nome: e.nome,
        telefone: formatarTelefone(e.telefone),
        email: e.email ?? null,
        modeloInteresse: e.modeloInteresse ?? "",
        uso: e.uso ?? "",
        horarioPreferido: null,
        origem: e.origem,
        comoConheceu: e.comoConheceu ?? null,
        consentimentos: { create: consentimento },
        notas: e.observacao ? { create: { texto: `[${e.origem}] ${e.observacao}` } } : undefined,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: lead.id, criado: true }, { status: 201 });
  } catch {
    // Banco fora do ar: diferente do formulário, aqui não há conversão a
    // proteger — a automação precisa saber que falhou para tentar de novo.
    return NextResponse.json({ erro: "Banco de dados indisponível — tente de novo" }, { status: 503 });
  }
}
