import { getFaq } from "@/lib/content";
import Section, { Eyebrow } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";

export default function Faq() {
  const faq = getFaq();

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.p,
      acceptedAnswer: { "@type": "Answer", text: item.r },
    })),
  };

  return (
    <Section id="faq" tone="muted">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-2xl">
        <Eyebrow>Perguntas frequentes</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          Dúvidas antes de comprar
        </h2>
      </div>
      <div className="mt-10 max-w-3xl">
        <Accordion
          itens={faq.map((item) => ({ titulo: item.p, conteudo: item.r }))}
        />
      </div>
    </Section>
  );
}
