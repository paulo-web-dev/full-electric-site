import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Header from "@/components/Header";
import WhatsAppFab from "@/components/WhatsAppFab";
import Hero from "@/components/sections/Hero";
import BarraNumeros from "@/components/sections/BarraNumeros";
import Modelos from "@/components/sections/Modelos";
import Economia from "@/components/sections/Economia";

export default function Home() {
  const site = getSite();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <BarraNumeros />
        <Modelos />
        <Economia />
        {/*
          Próximas seções (CLAUDE.md §5.2, aguardando aprovação das 4 primeiras):
          Você se identifica? · É legal? · Como funciona · Prova social ·
          Formulário · FAQ · CTA final
        */}
      </main>

      {/* Rodapé provisório — versão completa entra com as seções restantes */}
      <footer className="border-t border-line bg-ink pb-24 pt-10 text-paper md:pb-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide">
              Full <span className="text-lime-400">Electric</span>
            </p>
            <p className="mt-1 text-[13px] text-text-3">{site.marca.tagline}</p>
          </div>
          <div className="text-[13px] text-text-3">
            <p>WhatsApp: {site.contato.whatsappFormatado}</p>
            {site.contato.horarios.map((h) => (
              <p key={h.dias}>
                {h.dias}: {h.horario}
              </p>
            ))}
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-text-3">
            {site.legal.textoCurto}
          </p>
        </div>
      </footer>

      <WhatsAppFab href={waLink("flutuante")} />
    </>
  );
}
