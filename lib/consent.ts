/*
  Consentimento de cookies — só no navegador.

  GA4 e Meta Pixel carregam SOMENTE depois de "Aceitar" na faixa de cookies
  (CLAUDE.md §3.7). Recusa ("Só essenciais") e ausência de resposta valem o
  mesmo: nada carrega. A escolha fica no cookie `fe_consent` por 6 meses.
  Sem localStorage/sessionStorage (§6.2).
*/

export const COOKIE_CONSENTIMENTO = "fe_consent";
export type Consentimento = "aceito" | "essenciais";

/** Disparado no window quando a pessoa escolhe (Analytics.tsx escuta) */
export const EVENTO_CONSENTIMENTO = "fe:consentimento";
/** Disparado pelo link "Cookies" do rodapé para reabrir a faixa */
export const EVENTO_ABRIR_COOKIES = "fe:abrir-cookies";

const SEIS_MESES_S = 180 * 24 * 60 * 60;

/* Há algo a consentir? Sem IDs no build, não há script de terceiro e a faixa nem aparece. */
export function rastreamentoConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_GA4_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID
  );
}

export function lerConsentimento(): Consentimento | null {
  if (typeof document === "undefined") return null;
  const par = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_CONSENTIMENTO}=`));
  const valor = par?.slice(COOKIE_CONSENTIMENTO.length + 1);
  return valor === "aceito" || valor === "essenciais" ? valor : null;
}

export function gravarConsentimento(valor: Consentimento): void {
  document.cookie = `${COOKIE_CONSENTIMENTO}=${valor}; Max-Age=${SEIS_MESES_S}; path=/; SameSite=Lax`;
  if (valor === "essenciais") apagarCookiesDeTerceiros();
  window.dispatchEvent(new CustomEvent(EVENTO_CONSENTIMENTO, { detail: valor }));
}

/*
  Ao retirar o consentimento, apaga os cookies que GA4 e Pixel já tenham
  gravado (melhor esforço: eles ficam no domínio raiz). Os scripts em memória
  só somem na próxima página — por isso a política diz "vale a partir da
  próxima página".
*/
function apagarCookiesDeTerceiros(): void {
  const dominio = window.location.hostname.replace(/^www\./, "");
  const nomes = document.cookie
    .split("; ")
    .map((c) => c.split("=")[0])
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n === "_fbp" || n === "_fbc");
  for (const nome of nomes) {
    for (const d of [dominio, `.${dominio}`, ""]) {
      document.cookie = `${nome}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}
