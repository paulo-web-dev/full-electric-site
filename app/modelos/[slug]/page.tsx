import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSite, getModelos, getModelo, formatBRL } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import RastreioModelo from "@/components/RastreioModelo";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

export function generateStaticParams() {
  return getModelos().map((modelo) => ({ slug: modelo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const modelo = getModelo(slug);
  if (!modelo) return {};
  return {
    title: `${modelo.nome} — ficha técnica e preço`,
    description: `${modelo.resumo} Scooter elétrica em Curitiba com pronta entrega, nota fiscal e 6 meses de garantia.`,
    alternates: { canonical: `${siteUrl()}/modelos/${modelo.slug}` },
  };
}

export default async function ModeloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modelo = getModelo(slug);
  if (!modelo) notFound();

  const site = getSite();
  const nomeCurto = modelo.nome.replace("Full Electric ", "");
  const fotoPrincipal =
    modelo.fotos.find((f) => f.principal) ?? modelo.fotos[0];
  const demaisFotos = modelo.fotos.filter((f) => f !== fotoPrincipal);
  const temPreco = modelo.preco.confirmado && modelo.preco.aPartirDe !== null;

  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: modelo.nome,
    description: modelo.resumo,
    image: modelo.fotos.map((f) => `${siteUrl()}${f.src}`),
    brand: { "@type": "Brand", name: "Full Electric" },
    url: `${siteUrl()}/modelos/${modelo.slug}`,
    ...(temPreco
      ? {
          offers: {
            "@type": "Offer",
            price: modelo.preco.aPartirDe,
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: `${siteUrl()}/modelos/${modelo.slug}`,
          },
        }
      : {}),
  };

  return (
    <>
      <Header />
      <main>
        <RastreioModelo
          nome={modelo.nome}
          preco={temPreco ? modelo.preco.aPartirDe : null}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }}
        />

        <Section tone="ink" className="pb-12 md:pb-16">
          <div className="grid items-start gap-10 md:grid-cols-[1fr_1.1fr]">
            <div className="relative mx-auto w-full max-w-sm">
              <div aria-hidden="true" className="photo-halo absolute -inset-8" />
              <Image
                src={fotoPrincipal.src}
                alt={fotoPrincipal.alt}
                width={384}
                height={512}
                priority
                sizes="(max-width: 768px) 90vw, 384px"
                className="relative w-full rounded-[20px] object-cover"
              />
            </div>

            <div>
              <Eyebrow on="dark">{modelo.estilo}</Eyebrow>
              <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
                {modelo.nome}
              </h1>
              <p className="mt-4 max-w-lg text-lg text-text-3">{modelo.resumo}</p>

              <div className="mt-6">
                {temPreco ? (
                  <>
                    <p className="text-[13px] text-text-3">A partir de</p>
                    <p className="num-display text-4xl text-lime-400">
                      {formatBRL(modelo.preco.aPartirDe!)}
                    </p>
                    <p className="mt-1 text-[14px] text-text-3">
                      {site.comercial.parcelamentoTexto}{" "}
                      <span className="text-text-3">
                        {site.comercial.parcelamentoNota}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold">
                    Consulte disponibilidade e preço no WhatsApp
                  </p>
                )}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  href={waLink("modelo", nomeCurto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  on="dark"
                >
                  Tenho interesse
                </Button>
                <Button
                  href={waLink("testdrive")}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  on="dark"
                >
                  Agendar test drive
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {modelo.prontaEntrega && (
                  <Chip on="dark">Pronta entrega em Curitiba</Chip>
                )}
                <Chip on="dark">{site.comercial.garantiaTexto}</Chip>
                <Chip on="dark">Nota fiscal em seu nome</Chip>
              </div>
            </div>
          </div>

          {demaisFotos.length > 0 && (
            <ul className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {demaisFotos.map((foto) => (
                <li key={foto.src}>
                  <Image
                    src={foto.src}
                    alt={foto.alt}
                    width={192}
                    height={256}
                    sizes="(max-width: 768px) 30vw, 160px"
                    className="w-full rounded-[14px] object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section tone="paper">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
                Ficha técnica
              </h2>
              <div className="mt-5 overflow-x-auto rounded-[14px] border border-ink/10">
                <table className="w-full text-left text-[15px]">
                  <caption className="sr-only">
                    Ficha técnica da {modelo.nome}
                  </caption>
                  <tbody className="divide-y divide-ink/10">
                    {modelo.specs.map((spec) => (
                      <tr key={spec.label}>
                        <th
                          scope="row"
                          className="w-2/5 px-5 py-3.5 font-medium"
                        >
                          {spec.label}
                        </th>
                        <td className="px-5 py-3.5">
                          {spec.confirmado ? (
                            spec.valor
                          ) : (
                            <span className="text-text-2">Sob consulta</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[13px] text-text-2">
                Itens &quot;sob consulta&quot; ainda estão em aferição ou
                confirmação com o fabricante — pergunte no WhatsApp que a gente
                responde na hora.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
                Itens de série
              </h2>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {modelo.itensDeSerie.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-lime-600">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Card className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
                  {site.legal.norma}
                </p>
                <h3 className="mt-2 font-semibold tracking-[-0.01em]">
                  Dispensa CNH, placa e IPVA
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-2">
                  {site.legal.textoCurto}. Toda venda acompanha o Dossiê de
                  Conformidade com a documentação do enquadramento.
                </p>
                <a
                  href="/precisa-de-cnh"
                  className="mt-3 inline-block text-[14px] font-medium underline underline-offset-2"
                >
                  Ver os critérios completos da lei
                </a>
              </Card>
            </div>
          </div>
        </Section>

        <Section tone="ink" className="text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.025em]">
            Quer ver a {nomeCurto} de perto?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-3">
            Test drive gratuito em Curitiba, sem compromisso, inclusive no
            sábado.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={waLink("modelo", nomeCurto)}
              target="_blank"
              rel="noopener noreferrer"
              on="dark"
            >
              Tenho interesse na {nomeCurto}
            </Button>
            <Button
              href={waLink("testdrive")}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              on="dark"
            >
              Agendar test drive
            </Button>
          </div>
        </Section>
      </main>
      <Footer />
      <WhatsAppFab href={waLink("flutuante")} />
    </>
  );
}
