import siteJson from "@/content/site.json";
import modelosJson from "@/content/modelos.json";
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
    precoMinimo: number;
    precoMinimoFormatado: string;
    parcelas: number;
    parcelamentoTexto: string;
    parcelamentoNota: string;
    precoNota: string;
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

export interface Spec {
  label: string;
  valor: string;
  confirmado: boolean;
}

export interface FotoModelo {
  src: string;
  alt: string;
  principal?: boolean;
}

export interface Modelo {
  slug: string;
  nome: string;
  fabricante: string;
  estilo: string;
  cor: string;
  destaque: boolean;
  prontaEntrega: boolean;
  resumo: string;
  publico: string[];
  preco: { aPartirDe: number | null; confirmado: boolean };
  specs: Spec[];
  itensDeSerie: string[];
  fotos: FotoModelo[];
}

export interface FaqItem {
  p: string;
  r: string;
}

export function getSite(): SiteContent {
  return siteJson as SiteContent;
}

export function getModelos(): Modelo[] {
  return (modelosJson as { modelos: Modelo[] }).modelos;
}

export function getModelo(slug: string): Modelo | undefined {
  return getModelos().find((m) => m.slug === slug);
}

/** Só specs confirmadas podem virar fato no site — CLAUDE.md §3.6 */
export function specsConfirmadas(modelo: Modelo): Spec[] {
  return modelo.specs.filter((s) => s.confirmado);
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
