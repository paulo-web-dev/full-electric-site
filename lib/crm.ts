import type { LeadStatus } from "@prisma/client";

export const STATUS_ORDEM: LeadStatus[] = [
  "NOVO",
  "CONTATADO",
  "TEST_DRIVE_AGENDADO",
  "NEGOCIANDO",
  "VENDIDO",
  "PERDIDO",
];

export const STATUS_ROTULO: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  TEST_DRIVE_AGENDADO: "Test drive agendado",
  NEGOCIANDO: "Negociando",
  VENDIDO: "Vendido",
  PERDIDO: "Perdido",
};

/* Cores discretas, coerentes com a paleta (nada de lime como texto no claro) */
export const STATUS_COR: Record<LeadStatus, string> = {
  NOVO: "bg-lime-400 text-ink",
  CONTATADO: "bg-muted text-ink border border-ink/15",
  TEST_DRIVE_AGENDADO: "bg-ink text-paper",
  NEGOCIANDO: "bg-[#fff3c4] text-[#7a5c00]",
  VENDIDO: "bg-[#d9f2df] text-[#1d6b34]",
  PERDIDO: "bg-[#fbe4e0] text-[#8f2c1e]",
};

export function ehStatusValido(valor: string): valor is LeadStatus {
  return (STATUS_ORDEM as string[]).includes(valor);
}

const FUSO = "America/Sao_Paulo";

export function formatarData(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: FUSO });
}

export function formatarDataHora(data: Date): string {
  return data.toLocaleString("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
  Converte o valor de um <input type="datetime-local"> ("2026-08-30T14:00")
  tratando-o como horário de São Paulo (UTC-3, sem horário de verão hoje).
*/
/* Data de hoje em São Paulo no formato de <input type="date"> ("2026-08-25") */
export function hojeEmSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function dataDeSaoPaulo(valorInput: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(valorInput)) return null;
  const data = new Date(`${valorInput.slice(0, 16)}:00-03:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}
