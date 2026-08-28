import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/*
  Autenticação por token fixo para rotas chamadas por máquina, fora da sessão
  do admin: o cron do expurgo (CRON_SECRET) e o agente do WhatsApp
  (API_TOKEN, rotas /api/agent/*). Header `Authorization: Bearer <segredo>`.
  Comparação em tempo constante; segredo vazio nunca autoriza.
*/
export function bearerValido(
  cabecalho: string | null,
  segredo: string | undefined
): boolean {
  if (!segredo || !cabecalho) return false;
  const token = cabecalho.replace(/^Bearer\s+/i, "").trim();
  const a = Buffer.from(token);
  const b = Buffer.from(segredo);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const TAMANHO_MINIMO_API_TOKEN = 32;

/*
  Guarda das rotas /api/agent/*. Retorna null quando autorizado, ou a
  resposta de erro: 500 se API_TOKEN está ausente ou curto demais (e loga —
  nunca deixa passar sem token), 401 se o token não bate. O corpo tem
  `error` (código) e `mensagem` (texto): quem lê é o agente, um modelo de
  linguagem decidindo o que fazer em seguida.
*/
export function exigirApiToken(request: Request): NextResponse | null {
  const segredo = process.env.API_TOKEN;
  if (!segredo || segredo.length < TAMANHO_MINIMO_API_TOKEN) {
    console.error(
      `API_TOKEN ausente ou com menos de ${TAMANHO_MINIMO_API_TOKEN} caracteres — rotas /api/agent bloqueadas (gerar: openssl rand -hex 32)`
    );
    return NextResponse.json(
      { error: "server_misconfigured", mensagem: "API_TOKEN não configurado no servidor. Avise a equipe; não tente de novo." },
      { status: 500 }
    );
  }
  if (!bearerValido(request.headers.get("authorization"), segredo)) {
    return NextResponse.json(
      { error: "unauthorized", mensagem: "Token inválido ou ausente no header Authorization: Bearer." },
      { status: 401 }
    );
  }
  return null;
}
