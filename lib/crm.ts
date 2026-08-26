import type { LeadStatus, MotivoPerda } from "@prisma/client";

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

/*
  Status que não podem ser aplicados "cegos": ao mover para um deles, a
  interface pede os dados do movimento (data do test drive, venda, motivo da
  perda) na tela /admin/leads/[id]/mover.
*/
export const STATUS_COM_DADOS: LeadStatus[] = [
  "TEST_DRIVE_AGENDADO",
  "VENDIDO",
  "PERDIDO",
];

export function statusExigeDados(status: LeadStatus): boolean {
  return STATUS_COM_DADOS.includes(status);
}

/* ---------- Origem ----------
   `Lead.origem` é texto livre: o site grava a seção de onde o formulário
   partiu (formulario, contato, entregadores...). Leads cadastrados à mão no
   admin usam estas constantes. Nos relatórios, "site" = qualquer origem que
   não seja manual. */
export const ORIGENS_MANUAIS = [
  "PRESENCIAL",
  "TELEFONE",
  "INDICACAO",
  "OUTRO",
] as const;
export type OrigemManual = (typeof ORIGENS_MANUAIS)[number];

const ORIGEM_ROTULO: Record<string, string> = {
  PRESENCIAL: "Presencial (loja)",
  TELEFONE: "Telefone",
  INDICACAO: "Indicação",
  OUTRO: "Outro",
  formulario: "Site — formulário da home",
  contato: "Site — página de contato",
  entregadores: "Site — página de entregadores",
};

export function ehOrigemManual(valor: string): valor is OrigemManual {
  return (ORIGENS_MANUAIS as readonly string[]).includes(valor);
}

export function rotuloOrigem(origem: string): string {
  return ORIGEM_ROTULO[origem] ?? `Site — ${origem}`;
}

/* ---------- Motivo da perda ---------- */
export const MOTIVO_PERDA_ORDEM: MotivoPerda[] = [
  "PRECO",
  "OUTRA_LOJA",
  "SUMIU",
  "SEM_MODELO",
  "OUTRO",
];

export const MOTIVO_PERDA_ROTULO: Record<MotivoPerda, string> = {
  PRECO: "Preço",
  OUTRA_LOJA: "Foi em outra loja",
  SUMIU: "Sumiu (parou de responder)",
  SEM_MODELO: "Não tinha o modelo",
  OUTRO: "Outro",
};

export function ehMotivoValido(valor: string): valor is MotivoPerda {
  return (MOTIVO_PERDA_ORDEM as string[]).includes(valor);
}

/* ---------- Datas e valores ---------- */
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

export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/* Data de hoje em São Paulo no formato de <input type="date"> ("2026-08-25") */
export function hojeEmSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/*
  Converte o valor de um <input type="datetime-local"> ("2026-08-30T14:00")
  tratando-o como horário de São Paulo (UTC-3, sem horário de verão hoje).
*/
export function dataDeSaoPaulo(valorInput: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(valorInput)) return null;
  const data = new Date(`${valorInput.slice(0, 16)}:00-03:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

/* <input type="date"> → meio-dia em São Paulo, para não escorregar de dia no fuso */
export function diaDeSaoPaulo(valorInput: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valorInput)) return null;
  const data = new Date(`${valorInput}T12:00:00-03:00`);
  return Number.isNaN(data.getTime()) ? null : data;
}

/* Formato aceito por <input type="datetime-local">, no fuso de São Paulo */
export function paraInputDateTime(data: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);
  const v = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`;
}

/* Início do mês corrente e do próximo, em São Paulo — para "vendas no mês" */
export function janelaDoMesCorrente(): { inicio: Date; fim: Date } {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const ano = Number(partes.find((p) => p.type === "year")?.value);
  const mes = Number(partes.find((p) => p.type === "month")?.value);
  const mm = (m: number) => String(m).padStart(2, "0");
  const inicio = new Date(`${ano}-${mm(mes)}-01T00:00:00-03:00`);
  const fim =
    mes === 12
      ? new Date(`${ano + 1}-01-01T00:00:00-03:00`)
      : new Date(`${ano}-${mm(mes + 1)}-01T00:00:00-03:00`);
  return { inicio, fim };
}

/* Máscara BR de telefone: (41) 98888-1253 */
export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
