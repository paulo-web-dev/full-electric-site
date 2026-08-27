"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { origemDoLink, comEtiquetaUtm } from "@/lib/whatsapp";
import { rastrear, rastrearContato, EVENTO_ANALYTICS_PRONTO } from "@/lib/analytics";
import { guardarUtmsDaVisita, lerUtms, etiquetaUtm } from "@/lib/utm";
import { EVENTO_CONSENTIMENTO, lerConsentimento } from "@/lib/consent";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/*
  Eventos (além do PageView automático) — tabela de nomes em lib/analytics.ts:
  - whatsapp_click / Contact      → todo clique em link wa.me, com a seção de origem
                                    (data-origem no link, se houver; senão pela mensagem)
  - generate_lead / Lead          → formulário gravado (disparado no LeadForm)
  - view_item / ViewContent       → página de modelo (disparado em RastreioModelo)
  - scroll_75                     → visitante passou de 75% da página, uma vez

  Os scripts do GA4 e do Pixel só entram na página depois de "Aceitar" na
  faixa de cookies (lib/consent.ts). Sem aceite, o helper vira no-op — os
  eventos são disparados no vazio, sem erro. Cada script iniciado emite
  EVENTO_ANALYTICS_PRONTO, para quem disparou antes da hora (ViewContent).

  UTM até o WhatsApp: no clique, a etiqueta "[ref: source / medium / campaign]"
  é anexada à mensagem pré-preenchida — o lead chega identificável, com ou
  sem analytics ligado.
*/
export default function Analytics() {
  const [consentido, setConsentido] = useState(false);

  useEffect(() => {
    guardarUtmsDaVisita();

    setConsentido(lerConsentimento() === "aceito");
    function aoConsentir(evento: Event) {
      setConsentido((evento as CustomEvent<string>).detail === "aceito");
    }

    function aoClicar(evento: MouseEvent) {
      const alvo = evento.target as Element | null;
      const link = alvo?.closest?.('a[href*="wa.me"]') as HTMLAnchorElement | null;
      const href = link?.getAttribute("href");
      if (!link || !href) return;
      const utms = lerUtms();
      rastrearContato(link.dataset.origem ?? origemDoLink(href), utms);
      // Reescreve o href antes de o navegador seguir o link (fase de captura)
      link.href = comEtiquetaUtm(href, etiquetaUtm(utms));
    }

    let scrollDisparado = false;
    function aoRolar() {
      if (scrollDisparado) return;
      const altura = document.documentElement.scrollHeight - window.innerHeight;
      if (altura > 0 && window.scrollY / altura >= 0.75) {
        scrollDisparado = true;
        rastrear("scroll_75");
        window.removeEventListener("scroll", aoRolar);
      }
    }

    window.addEventListener(EVENTO_CONSENTIMENTO, aoConsentir);
    document.addEventListener("click", aoClicar, { capture: true });
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener(EVENTO_CONSENTIMENTO, aoConsentir);
      document.removeEventListener("click", aoClicar, { capture: true });
      window.removeEventListener("scroll", aoRolar);
    };
  }, []);

  if (!consentido) return null;

  return (
    <>
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA4_ID}');
              window.dispatchEvent(new Event('${EVENTO_ANALYTICS_PRONTO}'));`}
          </Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
            window.dispatchEvent(new Event('${EVENTO_ANALYTICS_PRONTO}'));`}
        </Script>
      )}
    </>
  );
}
