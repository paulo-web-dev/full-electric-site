import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirApiToken } from "@/lib/apiToken";
import { permitido, LIMITE_EXTERNO_POR_TOKEN, JANELA_EXTERNO_MS } from "@/lib/rateLimit";
import { formatarTelefone, telefoneChave } from "@/lib/crm";
import { erroAgente, chaveRateLimitDoToken, chaveDeTelefoneValida } from "@/lib/agente";

/*
  Estado da conversa do agente do WhatsApp (n8n). A memória do n8n não
  persiste entre execuções — sem isto o assistente se apresenta de novo a
  cada mensagem — e não havia como pausá-lo quando um humano assume a
  conversa pelo celular. Contrato: docs/INTEGRACAO-WHATSAPP.md.

  - GET a cada mensagem recebida: sem rate limit, como o GET de leads.
    Conversa inexistente é 200 com histórico vazio — contato novo é fluxo
    normal, não erro.
  - POST é upsert por telefone (mesma máscara do Lead, via formatarTelefone).
    `historico` SUBSTITUI o array inteiro (o agente manda a versão podada);
    aqui ainda se corta nos 16 itens mais recentes, defesa contra um array
    grande por engano. Divide o balde de escrita com as outras rotas.
  - `pausado` é calculado aqui (pausadoAte > agora) — o n8n não compara data.
  - Retenção: 90 dias sem mensagem → apagada pelo expurgo (/api/admin/expurgo),
    como descrito na política de privacidade (seção 2).
*/

export const dynamic = "force-dynamic";

const MAX_ITENS_HISTORICO = 16;
const MAX_BYTES_HISTORICO = 100 * 1024;
const MIN_PAUSA_MINUTOS = 1;
const MAX_PAUSA_MINUTOS = 1440; // 24 h

const ROLES_VALIDOS = ["user", "assistant"] as const;

/* `type` (não `interface`): ganha a index signature implícita que o
   Prisma.InputJsonValue exige */
type ItemHistorico = {
  role: (typeof ROLES_VALIDOS)[number];
  content: string;
};

/* O n8n não deve precisar comparar datas: o servidor decide se está pausado */
function pausaAtiva(pausadoAte: Date | null): boolean {
  return pausadoAte !== null && pausadoAte.getTime() > Date.now();
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
    const conversa = await prisma.conversaAgente.findUnique({
      where: { telefone: formatarTelefone(chave) },
    });
    if (!conversa) {
      return NextResponse.json({ historico: [], pausado: false, pausadoAte: null });
    }
    return NextResponse.json({
      historico: conversa.historico,
      pausado: pausaAtiva(conversa.pausadoAte),
      pausadoAte: conversa.pausadoAte,
    });
  } catch {
    return erroAgente(503, "banco_indisponivel", "Banco de dados indisponível. Tente de novo em instantes.");
  }
}

/* ------------------------------------------------------------------ POST */

interface Entrada {
  telefone: string;
  historico?: ItemHistorico[];
  pausarMinutos?: number;
  despausar?: true;
}

function validar(corpo: unknown): { entrada: Entrada } | { resposta: NextResponse } {
  if (typeof corpo !== "object" || corpo === null) {
    return { resposta: erroAgente(400, "json_invalido", "O corpo precisa ser um objeto JSON.") };
  }
  const c = corpo as Record<string, unknown>;

  const telefone = telefoneChave(typeof c.telefone === "string" ? c.telefone.slice(0, 20) : "");
  if (!chaveDeTelefoneValida(telefone)) {
    return { resposta: erroAgente(400, "telefone_invalido", "telefone precisa ter DDD + número (10 ou 11 dígitos, com ou sem +55).") };
  }

  let historico: ItemHistorico[] | undefined;
  if (c.historico !== undefined) {
    if (!Array.isArray(c.historico)) {
      return { resposta: erroAgente(400, "historico_invalido", "historico precisa ser um array de {role, content}.") };
    }
    for (const item of c.historico) {
      const i = item as Record<string, unknown>;
      if (
        typeof item !== "object" ||
        item === null ||
        !ROLES_VALIDOS.includes(i.role as ItemHistorico["role"]) ||
        typeof i.content !== "string"
      ) {
        return {
          resposta: erroAgente(400, "historico_invalido", 'Cada item do historico precisa ter role "user" ou "assistant" e content string.'),
        };
      }
    }
    if (Buffer.byteLength(JSON.stringify(c.historico), "utf8") > MAX_BYTES_HISTORICO) {
      return {
        resposta: erroAgente(400, "historico_grande", `historico passou de ${MAX_BYTES_HISTORICO / 1024} KB. Pode o array antes de enviar — só as mensagens recentes importam.`),
      };
    }
    // Poda: defesa contra um array grande por engano — a linha não cresce sem limite
    historico = (c.historico as ItemHistorico[])
      .slice(-MAX_ITENS_HISTORICO)
      .map((i) => ({ role: i.role, content: i.content }));
  }

  let pausarMinutos: number | undefined;
  if (c.pausarMinutos !== undefined) {
    const n = c.pausarMinutos;
    if (typeof n !== "number" || !Number.isFinite(n) || n < MIN_PAUSA_MINUTOS || n > MAX_PAUSA_MINUTOS) {
      return {
        resposta: erroAgente(400, "pausa_invalida", `pausarMinutos precisa ser um número entre ${MIN_PAUSA_MINUTOS} e ${MAX_PAUSA_MINUTOS} (24 h).`),
      };
    }
    pausarMinutos = n;
  }

  let despausar: true | undefined;
  if (c.despausar !== undefined) {
    if (c.despausar !== true) {
      return { resposta: erroAgente(400, "despausar_invalido", "despausar só aceita true. Para pausar, use pausarMinutos.") };
    }
    despausar = true;
  }

  if (pausarMinutos !== undefined && despausar) {
    return { resposta: erroAgente(400, "pausa_conflitante", "Envie pausarMinutos OU despausar, não os dois.") };
  }
  if (historico === undefined && pausarMinutos === undefined && despausar === undefined) {
    return { resposta: erroAgente(400, "campos_ausentes", "Nada a gravar: envie historico, pausarMinutos ou despausar.") };
  }

  return { entrada: { telefone, historico, pausarMinutos, despausar } };
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

  const data: { historico?: Prisma.InputJsonValue; pausadoAte?: Date | null } = {};
  if (e.historico !== undefined) data.historico = e.historico;
  if (e.pausarMinutos !== undefined) data.pausadoAte = new Date(Date.now() + e.pausarMinutos * 60_000);
  if (e.despausar) data.pausadoAte = null;

  try {
    const conversa = await prisma.conversaAgente.upsert({
      where: { telefone: formatarTelefone(e.telefone) },
      update: data,
      create: {
        telefone: formatarTelefone(e.telefone),
        historico: e.historico ?? [],
        pausadoAte: data.pausadoAte ?? null,
      },
    });
    return NextResponse.json({
      ok: true,
      pausado: pausaAtiva(conversa.pausadoAte),
      pausadoAte: conversa.pausadoAte,
    });
  } catch {
    return erroAgente(503, "banco_indisponivel", "Banco de dados indisponível. Tente de novo em instantes.");
  }
}
