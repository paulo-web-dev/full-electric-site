import { getSite } from "@/lib/content";

/**
 * Gerador de links wa.me — CLAUDE.md §6.3.
 * Cada origem tem mensagem própria (docs/04-copy.md): é assim que o cliente
 * sabe de onde veio o lead.
 */
export type OrigemWhatsApp =
  | "hero"
  | "modelo"
  | "valor"
  | "lp"
  | "preco"
  | "testdrive"
  | "entregador"
  | "legal"
  | "dores"
  | "ctafinal"
  | "flutuante";

const MENSAGENS: Record<OrigemWhatsApp, string> = {
  hero: "Olá! Vim pelo site e quero saber mais sobre as motos elétricas.",
  modelo: "Olá! Tenho interesse na Full Electric {MODELO}.",
  valor: "Olá! Quero saber o valor da Full Electric {MODELO}.",
  lp: "Olá! Vi o anúncio da Full Electric {MODELO} e quero saber mais.",
  preco: "Olá! Quero simular o parcelamento da Full Electric.",
  testdrive: "Olá! Quero agendar um test drive.",
  entregador: "Olá! Sou entregador e quero saber sobre a moto para trabalhar.",
  legal: "Olá! Quero entender a parte legal (CNH, placa) antes de comprar.",
  dores: "Olá! Me identifiquei com o que vi no site e quero saber mais.",
  ctafinal: "Olá! Li o site inteiro e quero conversar sobre as motos.",
  flutuante: "Olá! Vim pelo site da Full Electric.",
};

/* Etiqueta de UTM anexada no clique (lib/utm.ts) — ignorada ao identificar a origem */
const SUFIXO_UTM = /\s*\[ref:[^\]]*\]\s*$/;

/**
 * Devolve o mesmo link wa.me com a etiqueta de UTM no fim da mensagem.
 * Chamado no navegador, no momento do clique (components/Analytics.tsx).
 */
export function comEtiquetaUtm(href: string, etiqueta: string): string {
  if (!etiqueta) return href;
  try {
    const url = new URL(href);
    const texto = (url.searchParams.get("text") ?? "").replace(SUFIXO_UTM, "");
    url.searchParams.set("text", `${texto}\n\n${etiqueta}`);
    return url.toString();
  } catch {
    return href;
  }
}

function montarLink(mensagem: string): string {
  const numero = getSite().contato.whatsapp;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/* Origens cuja mensagem leva o nome do modelo */
const COM_MODELO: OrigemWhatsApp[] = ["modelo", "valor", "lp"];

export function waLink(origem: OrigemWhatsApp, modelo?: string): string {
  let mensagem = MENSAGENS[origem];
  if (COM_MODELO.includes(origem)) {
    mensagem = mensagem.replace("{MODELO}", modelo ?? "");
  }
  return montarLink(mensagem);
}

export interface DadosFormulario {
  nome: string;
  modelo: string;
  uso: string;
  horario: string;
}

/**
 * Descobre a origem de um link wa.me gerado por waLink, a partir da mensagem
 * codificada na URL. Usado pelo rastreio de cliques — assim nenhum call site
 * precisa carregar atributo extra.
 */
export function origemDoLink(href: string): string {
  let mensagem: string;
  try {
    mensagem = (new URL(href).searchParams.get("text") ?? "").replace(SUFIXO_UTM, "");
  } catch {
    return "desconhecida";
  }
  for (const [origem, texto] of Object.entries(MENSAGENS)) {
    if (COM_MODELO.includes(origem as OrigemWhatsApp)) {
      const prefixo = texto.split("{MODELO}")[0];
      if (mensagem.startsWith(prefixo)) return origem;
    } else if (mensagem === texto) {
      return origem;
    }
  }
  if (mensagem.startsWith("Olá! Me chamo")) return "formulario";
  return "desconhecida";
}

/**
 * Link para O LOJISTA chamar UM LEAD (usado no admin) — o destino é o
 * telefone do cliente, não o da loja.
 */
export function waLinkParaLead(telefone: string, nome: string): string {
  let digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`;
  const mensagem =
    `Olá, ${nome}! Aqui é da Full Electric Motos Elétricas, de Curitiba. ` +
    `Recebemos seu interesse pelo site — podemos conversar?`;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensagem)}`;
}

export function waLinkFormulario(dados: DadosFormulario): string {
  const mensagem =
    `Olá! Me chamo ${dados.nome}. Tenho interesse na ${dados.modelo} ` +
    `para ${dados.uso}. Melhor horário para test drive: ${dados.horario}.`;
  return montarLink(mensagem);
}
