/*
  Disparo de eventos para GA4 e Meta Pixel. Os IDs vêm do .env
  (NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_META_PIXEL_ID); com eles vazios os
  scripts nem carregam e estas funções viram no-op — nada quebra.

  Consentimento (CLAUDE.md §3.7): nada dispara sem `fe_consent=aceito`. O
  cookie é lido a cada disparo, não só na carga — quem troca para "Só
  essenciais" no link do rodapé ainda tem o script em memória até a
  próxima página, e mesmo assim não pode receber evento.

  Eventos e nomes em cada plataforma:
  | Ação                          | GA4            | Meta (padrão)  |
  |-------------------------------|----------------|----------------|
  | clique em link wa.me          | whatsapp_click | Contact        |
  | envio do formulário gravado   | generate_lead  | Lead           |
  | página de modelo aberta       | view_item      | ViewContent    |
  | 75% da página rolada          | scroll_75      | (custom)       |
*/

import { lerConsentimento } from "@/lib/consent";
import type { Utms } from "@/lib/utm";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Analytics.tsx emite no window assim que cada script de medição é iniciado */
export const EVENTO_ANALYTICS_PRONTO = "fe:analytics-pronto";

const MOEDA = "BRL";

function podeRastrear(): boolean {
  return typeof window !== "undefined" && lerConsentimento() === "aceito";
}

/* Os scripts configurados no build já foram iniciados nesta página? */
function analyticsPronto(): boolean {
  return (
    typeof window !== "undefined" &&
    (!GA4_ID || Boolean(window.gtag)) &&
    (!PIXEL_ID || Boolean(window.fbq))
  );
}

/*
  Evento de página (ViewContent): pode ser chamado antes de os scripts
  existirem — o componente monta antes do Analytics.tsx, e a pessoa pode
  aceitar a faixa de cookies depois de a página abrir. Fica esperando o
  sinal de "pronto" e dispara uma única vez. Retorna a função de cancelar.
*/
function quandoPronto(disparo: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (analyticsPronto()) {
    disparo();
    return () => {};
  }
  function aoFicarPronto() {
    if (!analyticsPronto()) return;
    window.removeEventListener(EVENTO_ANALYTICS_PRONTO, aoFicarPronto);
    disparo();
  }
  window.addEventListener(EVENTO_ANALYTICS_PRONTO, aoFicarPronto);
  return () => window.removeEventListener(EVENTO_ANALYTICS_PRONTO, aoFicarPronto);
}

/** Evento da casa, com o mesmo nome nas duas plataformas (custom no Meta) */
export function rastrear(
  evento: string,
  params?: Record<string, unknown>
): void {
  if (!podeRastrear()) return;
  window.gtag?.("event", evento, params);
  window.fbq?.("trackCustom", evento, params);
}

/** Clique em link wa.me → GA4 whatsapp_click · Meta Contact */
export function rastrearContato(origem: string, utms: Utms): void {
  if (!podeRastrear()) return;
  window.gtag?.("event", "whatsapp_click", { origem, ...utms });
  window.fbq?.("track", "Contact", {
    content_name: origem,
    content_category: "whatsapp",
  });
}

/**
  Formulário gravado com sucesso → GA4 generate_lead · Meta Lead.
  Sem `value` de propósito: o preço de entrada não é o valor do lead e
  inflaria o ROAS reportado pelo Meta.
*/
export function rastrearLead(dados: {
  origem: string;
  modelo: string;
  uso: string;
}): void {
  if (!podeRastrear()) return;
  window.gtag?.("event", "generate_lead", { ...dados, currency: MOEDA });
  window.fbq?.("track", "Lead", {
    content_name: dados.modelo,
    content_category: dados.origem,
    currency: MOEDA,
  });
}

/**
  Página de modelo (catálogo ou LP) aberta → GA4 view_item · Meta ViewContent.
  Sem `value`: o preço não aparece no site público (CLAUDE.md §3.4), e
  evento com valor de produto que o visitante não viu distorce o relatório.
*/
export function rastrearVisualizacaoDeModelo(modelo: { nome: string }): () => void {
  return quandoPronto(() => {
    if (!podeRastrear()) return;
    window.gtag?.("event", "view_item", {
      currency: MOEDA,
      items: [{ item_name: modelo.nome }],
    });
    window.fbq?.("track", "ViewContent", {
      content_name: modelo.nome,
      content_type: "product",
      currency: MOEDA,
    });
  });
}
