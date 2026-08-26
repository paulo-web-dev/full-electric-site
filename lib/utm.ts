/*
  UTMs da visita — só no navegador.

  Lidas da URL da página atual; se a pessoa navegou para outra página do site
  e a URL perdeu os parâmetros, vêm do cookie de sessão `fe_utm`, gravado na
  chegada (primeira página com utm_*). É cookie de sessão, 1ª parte, sem
  expiração fixa — some ao fechar o navegador. Está descrito na política de
  privacidade. Sem localStorage/sessionStorage (CLAUDE.md §6.2).
*/

export interface Utms {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

const COOKIE = "fe_utm";
const MAX = 80;

function limpar(valor: string | null): string | undefined {
  const v = (valor ?? "").trim().slice(0, MAX);
  return v || undefined;
}

function daUrl(): Utms {
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: limpar(p.get("utm_source")),
    utmMedium: limpar(p.get("utm_medium")),
    utmCampaign: limpar(p.get("utm_campaign")),
  };
}

function temAlguma(u: Utms): boolean {
  return Boolean(u.utmSource || u.utmMedium || u.utmCampaign);
}

function doCookie(): Utms {
  const par = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!par) return {};
  try {
    const dados = JSON.parse(decodeURIComponent(par.slice(COOKIE.length + 1)));
    return {
      utmSource: limpar(dados.s ?? null),
      utmMedium: limpar(dados.m ?? null),
      utmCampaign: limpar(dados.c ?? null),
    };
  } catch {
    return {};
  }
}

/** Chamada uma vez por página: se a URL trouxe UTM, guarda para as próximas páginas */
export function guardarUtmsDaVisita(): void {
  if (typeof window === "undefined") return;
  const u = daUrl();
  if (!temAlguma(u)) return;
  const valor = encodeURIComponent(
    JSON.stringify({ s: u.utmSource, m: u.utmMedium, c: u.utmCampaign })
  );
  document.cookie = `${COOKIE}=${valor}; path=/; SameSite=Lax`;
}

/** UTMs válidas para esta visita: URL primeiro, cookie de sessão depois */
export function lerUtms(): Utms {
  if (typeof window === "undefined") return {};
  const u = daUrl();
  return temAlguma(u) ? u : doCookie();
}

/*
  Etiqueta que vai no fim da mensagem do WhatsApp para o lojista saber de onde
  o lead veio: "[ref: google / cpc / lancamento]". Vazia sem UTM.
*/
export function etiquetaUtm(u: Utms): string {
  if (!temAlguma(u)) return "";
  const partes = [u.utmSource, u.utmMedium, u.utmCampaign].map((v) =>
    (v ?? "-").replace(/[\[\]]/g, "")
  );
  return `[ref: ${partes.join(" / ")}]`;
}
