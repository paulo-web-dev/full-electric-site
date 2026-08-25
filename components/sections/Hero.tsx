import Image from "next/image";
import { getSite, getModelos } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Section, { Eyebrow } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

const CHIPS = [
  "Sem CNH",
  "Pronta entrega em Curitiba",
  "Nota fiscal e 6 meses de garantia",
];

export default function Hero() {
  const site = getSite();
  const s60 = getModelos().find((m) => m.destaque);
  const foto = s60?.fotos.find((f) => f.principal) ?? s60?.fotos[0];

  return (
    <Section tone="ink" className="pb-12 md:pb-16">
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Eyebrow on="dark">{site.marca.tagline}</Eyebrow>

          <h1 className="mt-4 text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Sem CNH.
            <br />
            <span className="text-lime-400">100% elétrica.</span>
            <br />
            Pronta entrega.
          </h1>

          <p className="mt-5 max-w-md text-lg text-text-3">
            Sem placa, sem IPVA, sem posto de gasolina. Carrega em casa e roda
            o mês por menos de R$ 25.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              href={waLink("testdrive")}
              target="_blank"
              rel="noopener noreferrer"
              on="dark"
            >
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

        {foto && s60 && (
          <div className="relative mx-auto w-full max-w-xs md:max-w-sm">
            {/* Halo radial: as motos são pretas e somem no fundo escuro — CLAUDE.md §4.5 */}
            <div aria-hidden="true" className="photo-halo absolute -inset-8" />
            <Image
              src={foto.src}
              alt={foto.alt}
              width={384}
              height={512}
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 80vw, 384px"
              className="relative w-full rounded-[20px] object-cover"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
