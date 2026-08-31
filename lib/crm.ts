import type { LeadStatus, MotivoPerda, ComoConheceu } from "@prisma/client";

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
   partiu (formulario, contato, entregadores, lp-{slug}); a automação do
   WhatsApp manda o nome da campanha (meta-whatsapp, meta-c1...); leads
   cadastrados à mão no admin usam estas constantes. */
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
  if (ORIGEM_ROTULO[origem]) return ORIGEM_ROTULO[origem];
  if (origem.startsWith("lp-")) return `Site — LP ${origem.slice(3)}`;
  return origem;
}

/* ---------- Consentimento LGPD ----------
   `Consentimento.tipo` diz como cada manifestação foi obtida (histórico
   completo por lead, lib/consentimento.ts). Texto livre, como origem. */
export const CONSENTIMENTO_ROTULO: Record<string, string> = {
  formulario: "Checkbox do formulário do site",
  verbal: "Verbal, no atendimento",
  whatsapp_automacao: "Na conversa com o atendimento automatizado do WhatsApp",
};

export function rotuloConsentimento(tipo: string): string {
  return CONSENTIMENTO_ROTULO[tipo] ?? tipo;
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

/* ---------- Como conheceu a loja ----------
   Só no cadastro manual e na ficha — lead do site já traz UTMs. */
export const COMO_CONHECEU_ORDEM: ComoConheceu[] = [
  "PANFLETO",
  "GOOGLE",
  "INSTAGRAM",
  "INDICACAO",
  "PASSOU_NA_FRENTE",
  "OUTRO",
];

export const COMO_CONHECEU_ROTULO: Record<ComoConheceu, string> = {
  PANFLETO: "Panfleto",
  GOOGLE: "Google",
  INSTAGRAM: "Instagram",
  INDICACAO: "Indicação",
  PASSOU_NA_FRENTE: "Passou na frente",
  OUTRO: "Outro",
};

export function ehComoConheceuValido(valor: string): valor is ComoConheceu {
  return (COMO_CONHECEU_ORDEM as string[]).includes(valor);
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

/* Normalização de telefone: fonte única em lib/telefone.mjs (também usada
   por scripts/enriquecer-leads.mjs, que roda com node puro). Reexportadas
   aqui para os importadores TypeScript continuarem usando "@/lib/crm". */
export { telefoneChave, formatarTelefone } from "./telefone.mjs";
