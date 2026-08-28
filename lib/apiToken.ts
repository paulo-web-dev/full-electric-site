import { timingSafeEqual } from "node:crypto";

/*
  Autenticação por token fixo para rotas chamadas por máquina, fora da sessão
  do admin: o cron do expurgo (CRON_SECRET) e a automação do WhatsApp
  (API_TOKEN). Header `Authorization: Bearer <segredo>`. Comparação em tempo
  constante; segredo vazio nunca autoriza.
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
