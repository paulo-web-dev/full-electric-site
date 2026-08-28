import type { Prisma } from "@prisma/client";
import { POLITICA_VERSAO } from "@/lib/politica";
import { ipDoCliente } from "@/lib/rateLimit";

/*
  Monta o registro de consentimento LGPD que acompanha toda gravação de lead
  (CLAUDE.md §3.7). Uso: `consentimentos: { create: novoConsentimento(...) }`.

  - `tipo`: formulario · verbal · whatsapp_automacao (rótulos em lib/crm.ts).
  - `origem`: de onde veio a manifestação (seção do site, campanha, PRESENCIAL).
  - `request`: só quando a própria pessoa enviou (formulário) — grava IP e
    navegador como prova de quem consentiu. Cadastro manual e automação não
    passam request: o IP seria o da equipe ou o do servidor da automação,
    não o da pessoa.
*/
export type TipoConsentimento = "formulario" | "verbal" | "whatsapp_automacao";

export function novoConsentimento(
  tipo: TipoConsentimento,
  origem: string,
  request?: Request
): Prisma.ConsentimentoCreateWithoutLeadInput {
  return {
    tipo,
    textoVersao: POLITICA_VERSAO,
    origem,
    ip: request ? ipDoCliente(request.headers) : null,
    userAgent: request ? request.headers.get("user-agent")?.slice(0, 300) ?? null : null,
  };
}
