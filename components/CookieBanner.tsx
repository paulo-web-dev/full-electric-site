"use client";

import { useEffect, useState } from "react";
import {
  EVENTO_ABRIR_COOKIES,
  gravarConsentimento,
  lerConsentimento,
  rastreamentoConfigurado,
} from "@/lib/consent";

/*
  Faixa de cookies — CLAUDE.md §3.7 e §5.3.
  Aparece só quando há GA4/Pixel configurados no build e ainda não há escolha
  (ou quando o link "Cookies" do rodapé pede para reabrir). No mobile fica
  acima da barra fixa do WhatsApp.
*/
export default function CookieBanner() {
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    if (!rastreamentoConfigurado()) return;
    if (lerConsentimento() === null) setAberta(true);
    const abrir = () => setAberta(true);
    window.addEventListener(EVENTO_ABRIR_COOKIES, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_COOKIES, abrir);
  }, []);

  if (!aberta) return null;

  function escolher(valor: "aceito" | "essenciais") {
    gravarConsentimento(valor);
    setAberta(false);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookies-titulo"
      className="fixed inset-x-3 bottom-[80px] z-[60] rounded-[14px] border border-line bg-surface p-4 text-paper shadow-none md:inset-x-auto md:bottom-6 md:left-6 md:max-w-sm"
    >
      <p id="cookies-titulo" className="text-sm font-semibold">
        Cookies de análise e de anúncios
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-3">
        Se você aceitar, usamos o Google Analytics para medir cliques no
        WhatsApp e envios do formulário, e o Meta Pixel para medir nossos
        anúncios. Os dados podem ser processados fora do Brasil pelo Google e
        pela Meta. Sem aceite, nada disso carrega — o site funciona igual.
        Cookies essenciais (sua escolha aqui e a origem da sua visita) não
        dependem de aceite.{" "}
        <a
          href="/politica-de-privacidade#cookies"
          className="font-medium text-paper underline underline-offset-2"
        >
          Saiba mais
        </a>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => escolher("aceito")}
          className="flex-1 rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-lime-500"
        >
          Aceitar
        </button>
        <button
          type="button"
          onClick={() => escolher("essenciais")}
          className="flex-1 rounded-full border border-line px-4 py-2 text-sm font-semibold text-paper transition-colors hover:border-text-3"
        >
          Só essenciais
        </button>
      </div>
    </div>
  );
}
