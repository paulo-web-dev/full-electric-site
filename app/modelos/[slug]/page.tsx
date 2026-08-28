import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/content";
import {
  getModelos,
  getModelo,
  fotoPrincipal,
  linhasFicha,
  nomeCategoria,
  nomeCurto,
  classesFotoNoEscuro,
} from "@/lib/catalogo";
import { waLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import RastreioModelo from "@/components/RastreioModelo";
import FichaTecnica from "@/components/FichaTecnica";
import SeloAutopropelido from "@/components/SeloAutopropelido";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

/*
  Página de catálogo de um modelo, gerada de content/modelos.json para todo
  modelo publicado. Modelo não publicado não tem rota (404).
  - campo null não renderiza (sem placeholder);
  - tudo sobre CNH/placa passa pelo interruptor `autopropelidoApto`
    (SeloAutopropelido e o card legal abaixo) — CLAUDE.md §3.1;
  - sem preço (CLAUDE.md §3.4).
*/

export function generateStaticParams() {
  return getModelos().map((modelo) => ({ slug: modelo.slug }));
}

function descricaoMeta(nome: string, resumo: string | null, categoria: string): string {
  const base = resumo ?? `${nome}, ${categoria.toLowerCase()} elétrica.`;
  return `${base} Em Curitiba com pronta entrega, nota fiscal e 6 meses de garantia.`;
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
    title: `${modelo.nome} — ficha técnica e pronta entrega em Curitiba`,
    description: descricaoMeta(modelo.nome, modelo.resumo, nomeCategoria(modelo.categoria)),
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
  const curto = nomeCurto(modelo);
  const categoria = nomeCategoria(modelo.categoria);
  const principal = fotoPrincipal(modelo);
  const demaisFotos = modelo.fotos.filter((f) => f !== principal);
  const apto = modelo.autopropelidoApto === "SIM";
  const temFicha = linhasFicha(modelo).length > 0;
  const temItens = modelo.itensDeSerie.length > 0;

  /* Sem `offers`: preço não aparece no site público (CLAUDE.md §3.4) e
     marcação de preço sem preço visível viola a política do Google. */
  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: modelo.nome,
    description: descricaoMeta(modelo.nome, modelo.resumo, categoria),
    image: modelo.fotos.map((f) => `${siteUrl()}${f.src}`),
    brand: { "@type": "Brand", name: "Full Electric" },
    category: categoria,
    url: `${siteUrl()}/modelos/${modelo.slug}`,
  };

  return (
    <>
      <Header />
      <main>
        <RastreioModelo nome={modelo.nome} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }}
        />

        <Section tone="ink" className="pb-12 md:pb-16">
          <div className="grid items-start gap-10 md:grid-cols-[1fr_1.1fr]">
            <div className="relative mx-auto w-full max-w-sm">
              <div aria-hidden="true" className="photo-halo absolute -inset-8" />
              <Image
                src={principal.src}
                alt={principal.alt}
                width={principal.largura}
                height={principal.altura}
                priority
                sizes="(max-width: 768px) 90vw, 384px"
                className={`relative w-full object-contain ${classesFotoNoEscuro(principal)}`}
              />
            </div>

            <div>
              <Eyebrow on="dark">{categoria}</Eyebrow>
              <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
                {modelo.nome}
              </h1>
              {modelo.resumo && (
                <p className="mt-4 max-w-lg text-lg text-text-3">{modelo.resumo}</p>
              )}
              {modelo.cores.length > 0 && (
                <p className="mt-3 text-[14px] text-text-3">
                  Cores em estoque: {modelo.cores.join(", ")}
                </p>
              )}

              {/* Sem preço no site público — CTA de consulta (CLAUDE.md §3.4) */}
              <p className="mt-6 text-[14px] text-text-3">
                {site.comercial.parcelamentoTexto} {site.comercial.parcelamentoNota}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  href={waLink("valor", curto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  on="dark"
                >
                  {site.comercial.consulteValor}
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
                {modelo.prontaEntrega && <Chip on="dark">Pronta entrega em Curitiba</Chip>}
                <Chip on="dark">{site.comercial.garantiaTexto}</Chip>
                <Chip on="dark">Nota fiscal em seu nome</Chip>
              </div>

              <SeloAutopropelido modelo={modelo} on="dark" className="mt-5 max-w-lg" />
            </div>
          </div>

          {demaisFotos.length > 0 && (
            <ul className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {demaisFotos.map((foto) => (
                <li key={foto.src} className={foto.recortada ? "" : "rounded-[14px] bg-surface p-2"}>
                  <Image
                    src={foto.src}
                    alt={foto.alt}
                    width={foto.largura}
                    height={foto.altura}
                    sizes="(max-width: 768px) 30vw, 160px"
                    className={`w-full object-contain ${foto.recortada ? "" : "rounded-[10px]"}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        {(temFicha || temItens || apto) && (
          <Section tone="paper">
            <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
              <div>
                <FichaTecnica modelo={modelo} />
              </div>

              <div>
                {temItens && (
                  <>
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
                  </>
                )}

                {/* Só com o interruptor ligado — nada sobre CNH/placa em modelo PENDENTE */}
                {apto && (
                  <Card className={temItens ? "mt-8" : ""}>
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
                )}
              </div>
            </div>
          </Section>
        )}

        <Section tone="ink" className="text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.025em]">
            Quer ver a {curto} de perto?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-3">
            Test drive gratuito em Curitiba, sem compromisso, inclusive no
            sábado.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={waLink("modelo", curto)}
              target="_blank"
              rel="noopener noreferrer"
              on="dark"
            >
              Tenho interesse na {curto}
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
          <p className="mt-6 text-[14px]">
            <a href="/modelos" className="text-text-3 underline underline-offset-2 hover:text-paper">
              Ver todos os modelos
            </a>
          </p>
        </Section>
      </main>
      <Footer />
      <WhatsAppFab href={waLink("flutuante")} />
    </>
  );
}
