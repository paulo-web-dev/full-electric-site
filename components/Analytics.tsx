"use client";

import { useEffect } from "react";
import Script from "next/script";
import { origemDoLink } from "@/lib/whatsapp";
import { rastrear } from "@/lib/analytics";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/*
  Eventos da casa (além do PageView automático):
  - whatsapp_click { origem }  → todo clique em link wa.me, com a seção de origem
  - generate_lead / Lead       → envio do formulário (disparado no LeadForm)
  - scroll_75                  → visitante passou de 75% da página, uma vez
*/
export default function Analytics() {
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      const alvo = evento.target as Element | null;
      const link = alvo?.closest?.('a[href*="wa.me"]');
      const href = link?.getAttribute("href");
      if (href) rastrear("whatsapp_click", { origem: origemDoLink(href) });
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

    document.addEventListener("click", aoClicar, { capture: true });
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      document.removeEventListener("click", aoClicar, { capture: true });
      window.removeEventListener("scroll", aoRolar);
    };
  }, []);

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
              gtag('config', '${GA4_ID}');`}
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
            fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );
}
