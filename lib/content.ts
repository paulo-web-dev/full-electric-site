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

/*
  Liga cada critério da Res. 996/2023 (content/site.json → legal.criterios) ao
  spec correspondente do modelo em destaque. Largura, entre-eixos e
  equipamentos foram medidos/confirmados em 27/08/2026 e aparecem como "Dentro
  do limite legal" — por decisão do cliente, sem os números. Modelo novo sem
  medição cai no fallback "Aguardando aferição" dos componentes.
*/
const CRITERIO_PARA_SPEC: Record<string, string> = {
  "Potência nominal máxima": "Motor",
  "Velocidade máxima de fabricação": "Velocidade máxima",
  "Largura máxima": "Largura",
  "Distância entre eixos": "Entre-eixos",
  Equipamentos: "Equipamentos",
};

/** Valor confirmado do modelo em destaque para um critério legal, ou null */
export function valorCriterioNaMotoDestaque(criterioItem: string): string | null {
  const destaque = getModelos().find((m) => m.destaque);
  const spec = destaque?.specs.find(
    (s) => s.label === CRITERIO_PARA_SPEC[criterioItem]
  );
  return spec && spec.confirmado ? spec.valor : null;
}

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
