import Section, { Eyebrow } from "@/components/ui/Section";

/* 4 passos aprovados em docs/04-copy.md */
const PASSOS = [
  {
    titulo: "Chame no WhatsApp",
    texto: "Responda três perguntas rápidas sobre o seu uso.",
  },
  {
    titulo: "Faça o test drive",
    texto: "Gratuito, sem compromisso, inclusive no sábado.",
  },
  {
    titulo: "Leve no mesmo dia",
    texto: "Pronta entrega, com nota fiscal em seu nome.",
  },
  {
    titulo: "Conte com a gente depois",
    texto: "Revisão de 30 dias e suporte direto no WhatsApp.",
  },
];

export default function Passos() {
  return (
    <Section tone="paper">
      <div className="max-w-2xl">
        <Eyebrow>Do primeiro contato à rua</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          Como funciona
        </h2>
      </div>

      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map((passo, i) => (
          <li key={passo.titulo}>
            <span className="num-display flex size-11 items-center justify-center rounded-full bg-lime-400 text-lg text-ink">
              {i + 1}
            </span>
            <h3 className="mt-4 font-semibold tracking-[-0.01em]">
              {passo.titulo}
            </h3>
            <p className="mt-1.5 text-[15px] text-text-2">{passo.texto}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
