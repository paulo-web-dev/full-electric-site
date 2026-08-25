import Image from "next/image";
import { getSite, getModelos, specsConfirmadas, formatBRL } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/* Specs que aparecem no card (resumo). A ficha completa fica na página do modelo. */
const SPECS_DO_CARD = ["Motor", "Velocidade máxima", "Autonomia", "Bateria"];

export default function Modelos() {
  const site = getSite();
  const modelos = getModelos();

  return (
    <Section id="modelos" tone="muted">
      <div className="max-w-2xl">
        <Eyebrow>Pronta entrega</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          Modelos disponíveis
        </h2>
        <p className="mt-3 text-text-2">
          Duas opções em estoque em Curitiba, para retirar ou combinar a
          entrega pelo WhatsApp.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {modelos.map((modelo) => {
          const foto = modelo.fotos.find((f) => f.principal) ?? modelo.fotos[0];
          const specs = specsConfirmadas(modelo).filter((s) =>
            SPECS_DO_CARD.includes(s.label)
          );
          const nomeCurto = modelo.nome.replace("Full Electric ", "");

          return (
            <Card key={modelo.slug} className="flex flex-col p-0">
              <div className="flex items-center justify-center rounded-t-[20px] bg-muted p-6">
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  width={384}
                  height={512}
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="h-64 w-auto rounded-[14px] object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
                  {modelo.estilo}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em]">
                  {modelo.nome}
                </h3>
                <p className="mt-2 text-[15px] text-text-2">{modelo.resumo}</p>

                {specs.length > 0 && (
                  <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-[14px]">
                    {specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between gap-4">
                        <dt className="text-text-2">{spec.label}</dt>
                        <dd className="text-right font-medium">{spec.valor}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="mt-5 border-t border-ink/10 pt-4">
                  {modelo.preco.confirmado && modelo.preco.aPartirDe !== null ? (
                    <>
                      <p className="text-[13px] text-text-2">A partir de</p>
                      <p className="num-display text-3xl">
                        {formatBRL(modelo.preco.aPartirDe)}
                      </p>
                      <p className="text-[13px] text-text-2">
                        {site.comercial.parcelamentoTexto}
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold">
                      Consulte disponibilidade e preço no WhatsApp
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    href={waLink("modelo", nomeCurto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    Tenho interesse
                  </Button>
                  <Button
                    href={`/modelos/${modelo.slug}`}
                    variant="secondary"
                    className="flex-1"
                  >
                    Ver ficha completa
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-text-2">
        {site.comercial.precoNota} {site.comercial.parcelamentoNota}
      </p>
    </Section>
  );
}
