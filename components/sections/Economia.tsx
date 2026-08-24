import { getSite, formatBRL } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Economia() {
  const site = getSite();
  const { comparativo, metodologia } = site.economia;

  return (
    <Section id="economia" tone="ink">
      <div className="max-w-2xl">
        <Eyebrow on="dark">Economia</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          Quanto você gasta hoje para ir trabalhar?
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {comparativo.map((item) => {
          const destaque = item.modal === "Full Electric";
          return (
            <Card
              key={item.modal}
              on="dark"
              className={destaque ? "border-lime-500" : ""}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                  destaque ? "text-lime-400" : "text-text-3"
                }`}
              >
                {item.modal}
              </p>
              <p
                className={`num-display mt-3 text-4xl ${
                  destaque ? "text-lime-400" : "text-paper"
                }`}
              >
                {formatBRL(item.custoMes)}
                <span className="text-base font-semibold text-text-3">
                  {" "}
                  /mês
                </span>
              </p>
              <p className="mt-2 text-[14px] text-text-3">{item.detalhe}</p>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 max-w-2xl text-lg text-paper">
        A Full Electric se paga em cerca de 26 meses comparada ao ônibus — e
        continua sua depois disso.
      </p>

      <div className="mt-6">
        <Button
          href={waLink("preco")}
          target="_blank"
          rel="noopener noreferrer"
          on="dark"
        >
          Simular parcelamento no WhatsApp
        </Button>
      </div>

      {/* Metodologia obrigatória — docs/04-copy.md */}
      <p className="mt-8 max-w-3xl border-t border-line pt-5 text-[13px] leading-relaxed text-text-3">
        {metodologia}
      </p>
    </Section>
  );
}
