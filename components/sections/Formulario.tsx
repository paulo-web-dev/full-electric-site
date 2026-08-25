import Section, { Eyebrow } from "@/components/ui/Section";
import LeadForm from "@/components/sections/LeadForm";

export default function Formulario() {
  return (
    <Section id="formulario" tone="paper">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Test drive gratuito</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          Agende seu test drive
        </h2>
        <p className="mt-3 text-text-2">
          Cinco campos, sem e-mail obrigatório. A gente responde no WhatsApp no
          horário comercial.
        </p>
        <div className="mt-8">
          <LeadForm origem="formulario" />
        </div>
      </div>
    </Section>
  );
}
