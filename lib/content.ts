import siteJson from "@/content/site.json";
import faqJson from "@/content/faq.json";

export interface Horario {
  dias: string;
  horario: string;
}

export interface SiteContent {
  marca: {
    nome: string;
    nomeCompleto: string;
    tagline: string;
    logo: string;
    grupo: string;
  };
  contato: {
    whatsapp: string;
    whatsappFormatado: string;
    email: string;
    endereco: {
      logradouro: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
      mapsUrl: string;
    };
    horarios: Horario[];
  };
  comercial: {
    parcelas: number;
    parcelamentoTexto: string;
    parcelamentoNota: string;
    /** Preço não aparece no site público (CLAUDE.md §3.4) — só em modelos.json/CRM */
    consulteValor: string;
    garantiaMeses: number;
    garantiaTexto: string;
    prontaEntrega: boolean;
  };
  legal: {
    enquadramento: string;
    norma: string;
    textoCurto: string;
    dispensa: string[];
    criterios: { item: string; limite: string }[];
    dossie: string[];
    avisoCirculacao: string;
  };
  economia: {
    metodologia: string;
    comparativo: { modal: string; detalhe: string; custoMes: number }[];
  };
}

export interface FaqItem {
  p: string;
  r: string;
}

export function getSite(): SiteContent {
  return siteJson as SiteContent;
}

/* ---------- FAQ ---------- */

/** Perguntas do FAQ cujo enunciado está na lista, na ordem da lista */
export function getFaqPor(perguntas: string[]): FaqItem[] {
  const faq = getFaq();
  return perguntas
    .map((p) => faq.find((item) => item.p === p))
    .filter((item): item is FaqItem => item !== undefined);
}

/** FAQ sem respostas pendentes de confirmação */
export function getFaq(): FaqItem[] {
  return (faqJson as { faq: FaqItem[] }).faq.filter(
    (item) => !item.r.includes("[CONFIRMAR")
  );
}

export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
