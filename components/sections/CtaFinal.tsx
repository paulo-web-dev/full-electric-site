import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

const CHIPS = [
  "Test drive gratuito",
  "Pronta entrega em Curitiba",
  "Nota fiscal e 6 meses de garantia",
];

export default function CtaFinal() {
  const site = getSite();

  return (
    <Section tone="ink" className="text-center">
      <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
        Chame agora e agende seu <span className="text-lime-400">test drive</span>
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-text-3">
        A partir de {site.comercial.precoMinimoFormatado},{" "}
        {site.comercial.parcelamentoTexto}. Sem compromisso: você testa, a
        gente responde tudo, e a decisão é sua.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {CHIPS.map((chip) => (
          <Chip key={chip} on="dark">
            {chip}
          </Chip>
        ))}
      </div>

      <p className="mx-auto mt-5 max-w-md text-[13px] text-text-3">
        {site.comercial.parcelamentoNota}
      </p>
    </Section>
  );
}
