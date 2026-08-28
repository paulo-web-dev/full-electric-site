import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatarTelefone, telefoneChave } from "@/lib/crm";

/*
  Regras e utilitários das rotas do agente do WhatsApp (/api/agent/*),
  compartilhados entre leads e followups. Contrato: docs/INTEGRACAO-WHATSAPP.md.
*/

export const ORIGEM_AGENTE = "whatsapp-automacao";
/* Lead criado antes de a pessoa dizer o nome — o agente atualiza depois */
export const NOME_DESCONHECIDO = "Sem nome";
export const MAX_FOLLOWUPS = 3;
export const INTERVALO_FOLLOWUP_MS = 24 * 60 * 60 * 1000;
export const NOTA_AGENTE = "[agente]";

/* Status que o agente pode gravar. VENDIDO e PERDIDO são de humano (403). */
export const STATUS_PELO_AGENTE: LeadStatus[] = [
  "NOVO",
  "CONTATADO",
  "TEST_DRIVE_AGENDADO",
  "NEGOCIANDO",
];

export function erroAgente(status: number, error: string, mensagem: string): NextResponse {
  return NextResponse.json({ error, mensagem }, { status });
}

/* Chave do rate limit de escrita: o token, não o IP. Só um resumo dele vai
   para o mapa em memória. */
export function chaveRateLimitDoToken(cabecalho: string | null): string {
  const token = (cabecalho ?? "").replace(/^Bearer\s+/i, "").trim();
  return `agente:${createHash("sha256").update(token).digest("hex").slice(0, 16)}`;
}

/* Telefone como o WhatsApp espera: 55 + DDD + número, só dígitos */
export function telefoneE164(telefone: string): string {
  const chave = telefoneChave(telefone);
  return chave ? `55${chave}` : "";
}

/* "Oi {{nome}}" — primeiro nome, ou "tudo bem" quando não se sabe o nome */
export function primeiroNome(nome: string): string {
  const primeiro = nome.trim().split(/\s+/)[0] ?? "";
  return primeiro && nome.trim() !== NOME_DESCONHECIDO ? primeiro : "tudo bem";
}

/* Telefone válido = 10 ou 11 dígitos nacionais depois de tirar +55 e máscara */
export function chaveDeTelefoneValida(chave: string): boolean {
  return chave.length === 10 || chave.length === 11;
}

/*
  Lead pelo telefone. Todo caminho de gravação usa a mesma máscara
  (formatarTelefone), então a busca é por igualdade — e usa o índice. A
  varredura pelos 4 últimos dígitos é só reserva para registro gravado de
  outro jeito. Devolve o mais recente se houver duplicata.
*/
export async function leadIdPorTelefone(chave: string): Promise<string | null> {
  const exato = await prisma.lead.findFirst({
    where: { telefone: formatarTelefone(chave) },
    orderBy: { criadoEm: "desc" },
    select: { id: true },
  });
  if (exato) return exato.id;

  const candidatos = await prisma.lead.findMany({
    where: { telefone: { contains: chave.slice(-4) } },
    orderBy: { criadoEm: "desc" },
    select: { id: true, telefone: true },
  });
  return candidatos.find((l) => telefoneChave(l.telefone) === chave)?.id ?? null;
}
