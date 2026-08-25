import { FileText, ShieldCheck, Wrench, MessageCircle } from "lucide-react";
import { getSite } from "@/lib/content";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";

/*
  Substitui a seção de prova social enquanto não há avaliações reais —
  não inventamos depoimento. Quando tivermos as primeiras avaliações do
  Google, a seção de prova social (estrelas + citação + avatar com iniciais,
  padrão Unyflex) entra AQUI, antes ou no lugar deste bloco.
*/

const COMPROMISSOS = [
  {
    icone: FileText,
    titulo: "Nota fiscal em seu nome",
    texto: "Toda venda com nota. É ela que garante seus direitos de consumidor.",
  },
  {
    icone: ShieldCheck,
    titulo: "6 meses de garantia",
    texto: "Atendida aqui em Curitiba, direto com quem vendeu.",
  },
  {
    icone: Wrench,
    titulo: "Revisão de 30 dias",
    texto: "Você volta, a gente confere freios, aperto e bateria. Sem custo.",
  },
  {
    icone: MessageCircle,
    titulo: "Suporte direto no WhatsApp",
    texto: "Depois da compra, você fala com a loja — não com um robô.",
  },
];

export default function PorEscrito() {
  const site = getSite();

  return (
    <Section tone="muted">
      <div className="max-w-2xl">
        <Eyebrow>Compromissos, não promessas</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          O que você leva por escrito
        </h2>
        <p className="mt-3 text-text-2">
          Nada de promessa de balcão. O que está aqui sai no papel, junto com a
          moto.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h3 className="font-semibold tracking-[-0.01em]">
            Dossiê de Conformidade
          </h3>
          <p className="mt-1.5 text-[14px] text-text-2">
            Os documentos que comprovam o enquadramento na{" "}
            {site.legal.norma}:
          </p>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {site.legal.dossie.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden="true" className="text-lime-600">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {COMPROMISSOS.map((item) => (
            <Card key={item.titulo}>
              <item.icone aria-hidden="true" className="size-5 text-lime-600" />
              <h3 className="mt-3 font-semibold tracking-[-0.01em]">
                {item.titulo}
              </h3>
              <p className="mt-1.5 text-[14px] text-text-2">{item.texto}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
