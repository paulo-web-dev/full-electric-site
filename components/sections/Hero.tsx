import Image from "next/image";
import { getSite } from "@/lib/content";
import { getModeloDestaque, fotoPrincipal, classesFotoNoEscuro } from "@/lib/catalogo";
import { waLink } from "@/lib/whatsapp";
import Section, { Eyebrow } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

/* Curto de propósito: cabe em uma linha a 375px (CTA dentro da dobra de 667px) */
const EYEBROW = "Motos elétricas em Curitiba";

const CHIPS = [
  "Sem CNH",
  "Pronta entrega em Curitiba",
  "Nota fiscal e 6 meses de garantia",
];

/*
  Primeira dobra (conversão):
  - Mobile: título → FOTO (a moto aparece antes de qualquer botão) → CTAs.
    Desktop: foto na coluna da direita, ocupando as duas linhas do grid.
    É uma única <Image>; só a posição muda por CSS.
  - Um CTA primário (formulário, #formulario) e um secundário (WhatsApp) —
    dois destinos diferentes de verdade, não dois botões para o mesmo lugar.
*/
export default function Hero() {
  const site = getSite();
  const destaque = getModeloDestaque();
  const foto = destaque ? fotoPrincipal(destaque) : undefined;

  return (
    <Section tone="ink" className="pt-10 pb-12 md:pt-24 md:pb-16">
      <div className="grid items-center gap-x-10 gap-y-4 md:gap-y-6 md:grid-cols-[1.2fr_1fr] md:grid-rows-[auto_auto]">
        <div>
          <Eyebrow on="dark">{EYEBROW}</Eyebrow>

          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Sem CNH.
            <br />
            <span className="text-lime-400">100% elétrica.</span>
            <br />
            Pronta entrega.
          </h1>
        </div>

        {foto && (
          <div className="relative mx-auto w-fit md:col-start-2 md:row-span-2 md:row-start-1 md:w-full md:max-w-sm">
            {/* Halo radial: as motos são pretas e somem no fundo escuro — CLAUDE.md §4.5 */}
            <div aria-hidden="true" className="photo-halo absolute -inset-6 md:-inset-8" />
            <Image
              src={foto.src}
              alt={foto.alt}
              width={foto.largura}
              height={foto.altura}
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 165px, 384px"
              className={`relative h-[220px] w-auto object-contain md:h-auto md:w-full ${classesFotoNoEscuro(foto, "rounded-[14px] md:rounded-[20px]")}`}
            />
          </div>
        )}

        <div className="md:col-start-1">
          <p className="max-w-md text-lg text-text-3">
            Sem placa, sem IPVA, sem posto de gasolina. Carrega em casa e roda
            o mês por menos de R$ 25.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-7">
            <Button href="#formulario" on="dark">
              Agendar test drive gratuito
            </Button>
            <Button
              href={waLink("hero")}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              on="dark"
            >
              Falar no WhatsApp
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <Chip key={chip} on="dark">
                {chip}
              </Chip>
            ))}
          </div>

          {/* Âncora legal obrigatória no mesmo bloco de "Sem CNH" — CLAUDE.md §3.1 */}
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-text-3">
            {site.legal.textoCurto}. Dispensa CNH, placa e emplacamento.
          </p>
        </div>
      </div>
    </Section>
  );
}
