/*
  Disparo de eventos para GA4 e Meta Pixel. Os IDs vêm do .env
  (NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_META_PIXEL_ID); com eles vazios os
  scripts nem carregam e estas funções viram no-op — nada quebra.
*/

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function rastrear(
  evento: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", evento, params);
  window.fbq?.("trackCustom", evento, params);
}

/* Lead usa os nomes padrão das duas plataformas (custo por lead nos relatórios) */
export function rastrearLead(params: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "generate_lead", params);
  window.fbq?.("track", "Lead", params);
}
