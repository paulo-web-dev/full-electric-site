import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FileCheck } from "lucide-react";
import {
  getSite,
  getModelos,
  getModelo,
  getFaqPor,
  type Modelo,
} from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import WhatsAppFab from "@/components/WhatsAppFab";
import RastreioModelo from "@/components/RastreioModelo";
import FichaTecnica from "@/components/FichaTecnica";
import CookiesLink from "@/components/CookiesLink";
import LeadForm from "@/components/sections/LeadForm";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Accordion from "@/components/ui/Accordion";

/*
  LP de campanha, uma por modelo, gerada de content/modelos.json — destino de
  anúncio, sem saída: sem header, sem navegação, sem link para outras páginas
  (só a Política de Privacidade, obrigatória). Nova moto no JSON = nova LP,
  sem tocar em código.

  Difere de /modelos/[slug] (catálogo, indexável): aqui é noindex e fora do
  sitemap, para não competir no Google. Sem preço (CLAUDE.md §3.4).
  Origem do lead no CRM e nos eventos: "lp-{slug}".
*/

/* Headline aprovada (docs/04-copy.md) */
const CHIPS = [
  "Sem CNH",
  "Pronta entrega em Curitiba",
  "Nota fiscal e 6 meses de garantia",
];

/*
  FAQ curto: 5 perguntas, na ordem. "Qual a autonomia real?" cita a faixa da
  S60 — só entra quando a autonomia do modelo está confirmada no JSON.
*/
const FAQ_CANDIDATAS = [
  "Precisa de CNH para andar nessas motos?",
  "Qual a autonomia real?",
  "Aceita cartão? Dá para parcelar?",
  "Como funciona a garantia?",
  "Posso fazer um test drive?",
  "Onde posso circular em Curitiba?",
];
const FAQ_TAMANHO = 5;

function faqDoModelo(modelo: Modelo) {
  const autonomiaConfirmada = modelo.specs.some(
    (s) => s.label === "Autonomia" && s.confirmado
  );
  const perguntas = FAQ_CANDIDATAS.filter(
    (p) => autonomiaConfirmada || p !== "Qual a autonomia real?"
  ).slice(0, FAQ_TAMANHO);
  return getFaqPor(perguntas);
}

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
    title: `${modelo.nome} — sem CNH, pronta entrega em Curitiba`,
    description: `${modelo.resumo} Equipamento de mobilidade individual autopropelido (Res. CONTRAN 996/2023). Test drive gratuito em Curitiba.`,
    /* LP de anúncio: não indexa, não compete com /modelos/[slug] */
    robots: { index: false, follow: false },
  };
}

export default async function LpModeloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modelo = getModelo(slug);
  if (!modelo) notFound();

  const site = getSite();
  const nomeCurto = modelo.nome.replace("Full Electric ", "");
  const origem = `lp-${modelo.slug}`;
  const linkWhatsApp = waLink("lp", nomeCurto);
  const fotoPrincipal =
    modelo.fotos.find((f) => f.principal) ?? modelo.fotos[0];
  const faq = faqDoModelo(modelo);

  return (
    <>
      {/* Barra mínima: só a marca, sem link — a LP não tem saída */}
      <div className="border-b border-line bg-ink">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-5 md:px-8">
          <Image
            src={site.marca.logo}
            alt="Logo da Full Electric Motos Elétricas"
            width={36}
            height={36}
            className="size-9 rounded-full"
          />
          <span className="text-sm font-extrabold uppercase tracking-wide text-paper">
            Full <span className="text-lime-400">Electric</span>
          </span>
          <span className="ml-auto text-[13px] text-text-3">Curitiba/PR</span>
        </div>
      </div>

      <main>
        <RastreioModelo nome={modelo.nome} />

        {/* Herói — mesma dobra da home: título → foto → CTAs (CLAUDE.md §5.2) */}
        <Section tone="ink" className="pt-8 pb-12 md:pt-20 md:pb-16">
          <div className="grid items-center gap-x-10 gap-y-4 md:gap-y-6 md:grid-cols-[1.2fr_1fr] md:grid-rows-[auto_auto]">
            <div>
              <Eyebrow on="dark">{modelo.estilo}</Eyebrow>
              <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
                {modelo.nome}
              </h1>
              <p className="mt-3 text-xl font-semibold leading-snug tracking-[-0.01em] md:text-2xl">
                Sem CNH. <span className="text-lime-400">100% elétrica.</span>{" "}
                Pronta entrega.
              </p>
            </div>

            <div className="relative mx-auto w-fit md:col-start-2 md:row-span-2 md:row-start-1 md:w-full md:max-w-sm">
              <div aria-hidden="true" className="photo-halo absolute -inset-6 md:-inset-8" />
              <Image
                src={fotoPrincipal.src}
                alt={fotoPrincipal.alt}
                width={384}
                height={512}
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 165px, 384px"
                className="relative h-[220px] w-auto rounded-[14px] object-cover md:h-auto md:w-full md:rounded-[20px]"
              />
            </div>

            <div className="md:col-start-1">
              <p className="max-w-md text-lg text-text-3">{modelo.resumo}</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-7">
                <Button href="#formulario" on="dark">
                  Agendar test drive gratuito
                </Button>
                <Button
                  href={linkWhatsApp}
                  data-origem={origem}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  on="dark"
                >
                  Falar no WhatsApp
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {CHIPS.map((chip) => (
                  <Chip key={chip} on="dark">
                    {chip}
                  </Chip>
                ))}
              </div>

              {/* Âncora legal obrigatória no mesmo bloco de "Sem CNH" — CLAUDE.md §3.1 */}
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-text-3">
                {site.legal.textoCurto}. Dispensa CNH, placa e emplacamento.
              </p>
            </div>
          </div>
        </Section>

        {/* Galeria */}
        <Section tone="paper" className="py-12 md:py-20">
          <div className="max-w-2xl">
            <Eyebrow>Galeria</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              A {nomeCurto} de perto
            </h2>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {modelo.fotos.map((foto) => (
              <li key={foto.src} className="rounded-[14px] bg-muted p-3">
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  width={384}
                  height={512}
                  sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 260px"
                  className="w-full rounded-[8px] object-cover"
                />
              </li>
            ))}
          </ul>
        </Section>

        {/* Ficha técnica */}
        <Section tone="muted" className="py-12 md:py-20">
          <div className="max-w-3xl">
            <FichaTecnica modelo={modelo} />
          </div>
          {modelo.itensDeSerie.length > 0 && (
            <div className="mt-8 max-w-3xl">
              <h3 className="font-semibold">Itens de série</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {modelo.itensDeSerie.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* Bloco legal resumido — âncora obrigatória (CLAUDE.md §3.1) */}
        <Section tone="ink" className="py-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-start">
            <div>
              <Eyebrow on="dark">{site.legal.norma}</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
                Sem CNH, sem placa, sem IPVA — e provamos.
              </h2>
              <p className="mt-4 max-w-xl text-text-3">
                {site.legal.textoCurto}. Para dispensar CNH, placa e
                emplacamento, o veículo precisa respeitar todos os limites da
                norma:
              </p>
              <ul className="mt-4 max-w-xl space-y-2 text-[15px]">
                {site.legal.criterios.map((c) => (
                  <li key={c.item} className="flex justify-between gap-4 border-b border-line pb-2">
                    <span className="text-text-3">{c.item}</span>
                    <span className="text-right font-medium">{c.limite}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-text-3">
                {site.legal.avisoCirculacao}
              </p>
            </div>

            <Card on="dark">
              <div className="flex items-center gap-2.5">
                <FileCheck aria-hidden="true" className="size-5 text-lime-400" />
                <h3 className="font-semibold text-paper">
                  Dossiê de Conformidade — acompanha toda venda
                </h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-[15px] text-text-3">
                {site.legal.dossie.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-lime-400">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* Formulário — origem lp-{slug}, modelo pré-selecionado */}
        <Section id="formulario" tone="paper">
          <div className="mx-auto max-w-2xl">
            <Eyebrow>Test drive gratuito</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              Agende seu test drive na {nomeCurto}
            </h2>
            <p className="mt-3 text-text-2">
              Sem e-mail obrigatório. A gente responde no WhatsApp no horário
              comercial.
            </p>
            <div className="mt-8">
              <LeadForm origem={origem} modeloPadrao={modelo.nome} />
            </div>
          </div>
        </Section>

        {/* FAQ curto */}
        <Section tone="muted" className="py-12 md:py-20">
          <div className="max-w-2xl">
            <Eyebrow>Perguntas frequentes</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              Dúvidas antes de comprar
            </h2>
          </div>
          <div className="mt-8 max-w-3xl">
            <Accordion
              itens={faq.map((item) => ({ titulo: item.p, conteudo: item.r }))}
            />
          </div>
        </Section>

        {/* CTA final — sem preço, parcelamento com asterisco (CLAUDE.md §3.4) */}
        <Section tone="ink" className="text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
            Quer ver a {nomeCurto} de perto?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-3">
            {site.comercial.consulteValor}, {site.comercial.parcelamentoTexto}.
            Test drive gratuito em Curitiba, sem compromisso.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="#formulario" on="dark">
              Agendar test drive gratuito
            </Button>
            <Button
              href={linkWhatsApp}
              data-origem={origem}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              on="dark"
            >
              Falar no WhatsApp
            </Button>
          </div>
          <p className="mx-auto mt-5 max-w-md text-[13px] text-text-3">
            {site.comercial.parcelamentoNota}
          </p>
        </Section>
      </main>

      {/* Rodapé mínimo: marca, WhatsApp, política e cookies */}
      <footer className="border-t border-line bg-ink pb-28 pt-10 text-paper md:pb-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <Image
              src={site.marca.logo}
              alt="Logo da Full Electric Motos Elétricas"
              width={36}
              height={36}
              className="size-9 rounded-full"
            />
            <span className="text-sm font-extrabold uppercase tracking-wide">
              Full <span className="text-lime-400">Electric</span>
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
            <li>
              <a
                href={linkWhatsApp}
                data-origem={origem}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-paper transition-colors hover:text-lime-400"
              >
                WhatsApp: {site.contato.whatsappFormatado}
              </a>
            </li>
            <li>
              <a
                href="/politica-de-privacidade"
                className="text-text-3 transition-colors hover:text-paper"
              >
                Política de Privacidade
              </a>
            </li>
            <li>
              <CookiesLink />
            </li>
          </ul>
        </div>
        <div className="mx-auto mt-8 w-full max-w-6xl border-t border-line px-5 pt-6 md:px-8">
          <p className="text-[13px] leading-relaxed text-text-3">
            {site.legal.textoCurto}. {site.legal.avisoCirculacao}
          </p>
          <p className="mt-4 text-[13px] text-text-3">
            © {new Date().getFullYear()} {site.marca.nomeCompleto} — Curitiba/PR
          </p>
        </div>
      </footer>

      <WhatsAppFab href={linkWhatsApp} origem={origem} />
    </>
  );
}
