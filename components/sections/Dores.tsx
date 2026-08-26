import { waLink } from "@/lib/whatsapp";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/* 6 dores → solução, aprovadas em docs/04-copy.md */
const DORES = [
  {
    dor: "Gasta demais com transporte",
    solucao: "Roda o mês inteiro por menos de R$ 25 de energia.",
  },
  {
    dor: "Não tem CNH",
    solucao: "Autopropelido dispensa CNH, placa e emplacamento.",
  },
  {
    dor: "Tem medo de tomar multa",
    solucao: "Toda venda sai com o Dossiê de Conformidade.",
  },
  {
    dor: "Precisa trabalhar com entrega",
    solucao: "Aceita no cadastro do iFood, modalidade Bicicleta Elétrica.",
  },
  {
    dor: "Mora em apartamento",
    solucao: "Bateria removível, carrega em tomada comum.",
  },
  {
    dor: "Já se decepcionou com autonomia",
    solucao: "Falamos a faixa real: 40 a 55 km.",
  },
];

export default function Dores() {
  return (
    <Section tone="paper">
      <div className="max-w-2xl">
        <Eyebrow>Para quem é</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          Você se identifica?
        </h2>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DORES.map((item) => (
          <Card key={item.dor}>
            <h3 className="font-semibold tracking-[-0.01em]">{item.dor}</h3>
            <p className="mt-2 text-[15px] text-text-2">{item.solucao}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button
          href={waLink("dores")}
          target="_blank"
          rel="noopener noreferrer"
          variant="whatsapp"
        >
          Falar no WhatsApp
        </Button>
      </div>
    </Section>
  );
}
