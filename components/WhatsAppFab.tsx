"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppFabProps {
  href: string;
  /** Origem explícita para o rastreio (data-origem); sem ela, vale a da mensagem */
  origem?: string;
}

/*
  Aparece após 300px de rolagem (CLAUDE.md §5.3).
  Desktop: botão flutuante no canto inferior direito.
  Mobile: barra fixa no rodapé.
*/
export default function WhatsAppFab({ href, origem }: WhatsAppFabProps) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 300);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  if (!visivel) return null;

  return (
    <>
      {/* Desktop */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        data-origem={origem}
        className="fixed bottom-6 right-6 z-50 hidden size-14 items-center justify-center rounded-full bg-lime-400 text-ink transition-colors hover:bg-lime-500 md:flex"
      >
        <MessageCircle aria-hidden="true" className="size-6" />
      </a>

      {/* Mobile: barra fixa no rodapé */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink p-3 md:hidden">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-origem={origem}
          className="flex items-center justify-center gap-2 rounded-full bg-lime-400 py-3 text-[15px] font-semibold text-ink"
        >
          <MessageCircle aria-hidden="true" className="size-4.5" />
          Falar no WhatsApp
        </a>
      </div>
    </>
  );
}
