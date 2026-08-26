"use client";

import { EVENTO_ABRIR_COOKIES, rastreamentoConfigurado } from "@/lib/consent";

/* Link do rodapé que reabre a faixa de cookies para rever a escolha */
export default function CookiesLink() {
  if (!rastreamentoConfigurado()) return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR_COOKIES))}
      className="text-text-3 transition-colors hover:text-paper"
    >
      Cookies
    </button>
  );
}
