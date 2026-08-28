import { getModelos } from "@/lib/catalogo";
import Section from "@/components/ui/Section";

/* Números aprovados em docs/04-copy.md; a contagem de modelos vem do catálogo */
export default function BarraNumeros() {
  const NUMEROS = [
    { valor: String(getModelos().length), rotulo: "Modelos em pronta entrega" },
    { valor: "1.000 W", rotulo: "Potência do motor" },
    { valor: "32 km/h", rotulo: "Velocidade, dentro da lei" },
    { valor: "R$ 24", rotulo: "Custo médio de energia por mês" },
  ];

  return (
    <Section tone="paper" className="border-b border-ink/10 !py-10 md:!py-14">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {NUMEROS.map((n) => (
          <div key={n.rotulo} className="text-center">
            <dd className="num-display text-3xl md:text-4xl">{n.valor}</dd>
            <dt className="mt-1.5 text-[13px] font-medium text-text-2">
              {n.rotulo}
            </dt>
          </div>
        ))}
      </dl>
    </Section>
  );
}
