import { getModelos } from "@/lib/catalogo";
import Section, { Eyebrow } from "@/components/ui/Section";
import GridModelos from "@/components/GridModelos";

export default function Modelos() {
  const total = getModelos().length;

  return (
    <Section id="modelos" tone="muted">
      <div className="max-w-2xl">
        <Eyebrow>Pronta entrega</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          Modelos disponíveis
        </h2>
        <p className="mt-3 text-text-2">
          {total === 1 ? "Um modelo" : `${total} modelos`} em estoque em Curitiba,
          para retirar ou combinar a entrega pelo WhatsApp.
        </p>
      </div>

      <div className="mt-10">
        <GridModelos />
      </div>
    </Section>
  );
}
