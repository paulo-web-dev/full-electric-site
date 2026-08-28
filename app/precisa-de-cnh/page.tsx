import type { Metadata } from "next";
import { AlertTriangle, FileCheck, ShieldCheck, XCircle } from "lucide-react";
import { getSite, getFaqPor } from "@/lib/content";
import { getModeloDestaque, valorCriterio } from "@/lib/catalogo";
import { waLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Accordion from "@/components/ui/Accordion";

/*
  Página educativa (SEO) sobre a Res. CONTRAN 996/2023 — CLAUDE.md §5.1.
  Regra §3.1: "sem CNH" só aparece junto da fundamentação legal, no mesmo
  bloco visual. Todos os fatos legais vêm de docs/03-legal-contran.md.
*/

const TITULO =
  "Precisa de CNH para moto elétrica? Entenda a Resolução CONTRAN 996/2023";
const DESCRICAO =
  "Moto elétrica sem CNH em Curitiba: quando é permitido pela Resolução CONTRAN 996/2023, os 5 critérios do autopropelido, a diferença para ciclomotor e como a fiscalização funciona no Paraná.";

export const metadata: Metadata = {
  title: "Precisa de CNH para moto elétrica? Entenda a Resolução CONTRAN 996",
  description: DESCRICAO,
  alternates: { canonical: `${siteUrl()}/precisa-de-cnh` },
};

/* Ciclomotor: o que passa a ser exigido quando o veículo estoura os limites */
const EXIGENCIAS_CICLOMOTOR = [
  "Registro no Detran e Renavam",
  "Placa e emplacamento",
  "Licenciamento anual",
  "ACC ou CNH categoria A",
];

/* Fatos do Paraná — docs/03-legal-contran.md, "O agravante do Paraná" */
const FISCALIZACAO_PR = [
  {
    titulo: "Detran-PR regulamentou primeiro",
    texto:
      "Foi o primeiro Detran do país a regulamentar o registro de ciclomotores. Na vistoria, verifica potência, velocidade e distância entre eixos.",
  },
  {
    titulo: "BPTran fiscaliza desde 2021",
    texto:
      "Desde dezembro de 2021 o Batalhão de Trânsito recolhe ao pátio o veículo que não se enquadra na categoria declarada.",
  },
  {
    titulo: "Desde 1º de janeiro de 2026",
    texto:
      "Ciclomotor sem registro é autuado e removido. Comprar um veículo vendido como “sem CNH” sem a documentação do enquadramento é assumir esse risco.",
  },
];

const REGRAS_CIRCULACAO = [
  "Preferencialmente em ciclovias e ciclofaixas.",
  "Onde não houver, em vias urbanas com velocidade regulamentada de até 40 km/h.",
  "Proibido em calçadas e em vias de trânsito rápido.",
  "Capacete com selo Inmetro e elementos retrorrefletivos, para condutor e passageiro.",
];

const PERGUNTAS_LEGAIS = [
  "Precisa de CNH para andar nessas motos?",
  "Precisa emplacar? Paga IPVA?",
  "Onde posso circular em Curitiba?",
  "Capacete é obrigatório?",
];

export default function PrecisaDeCnhPage() {
  const site = getSite();
  const destaque = getModeloDestaque();
  const { norma, enquadramento, textoCurto, criterios, dispensa, dossie } =
    site.legal;
  const faq = getFaqPor(PERGUNTAS_LEGAIS);

  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITULO,
    description: DESCRICAO,
    inLanguage: "pt-BR",
    url: `${siteUrl()}/precisa-de-cnh`,
    about: norma,
    author: { "@type": "Organization", name: site.marca.nomeCompleto },
    publisher: {
      "@type": "Organization",
      name: site.marca.nomeCompleto,
      logo: { "@type": "ImageObject", url: `${siteUrl()}${site.marca.logo}` },
    },
  };

  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }}
        />

        <Section tone="ink" className="pb-12 md:pb-16">
          <div className="max-w-3xl">
            <Eyebrow on="dark">{norma}</Eyebrow>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
              Precisa de CNH para moto elétrica?
            </h1>
            <p className="mt-4 text-lg text-text-3">
              Depende do veículo. Se ele se enquadra como{" "}
              {enquadramento.toLowerCase()} pela {norma}, não precisa de CNH,
              placa nem IPVA. Se passar de qualquer um dos limites da lei, é
              ciclomotor — e aí precisa de tudo isso. Esta página explica a
              diferença sem rodeio.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/#modelos" on="dark">
                Ver os modelos enquadrados
              </Button>
              <Button
                href={waLink("legal")}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                on="dark"
              >
                Tirar dúvida no WhatsApp
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Chip on="dark">Dossiê de Conformidade em toda venda</Chip>
              <Chip on="dark">Nota fiscal em seu nome</Chip>
              <Chip on="dark">{site.comercial.garantiaTexto}</Chip>
            </div>
          </div>
        </Section>

        <Section tone="paper">
          <div className="max-w-2xl">
            <Eyebrow>Resposta curta</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              Duas categorias, duas regras
            </h2>
            <p className="mt-3 text-text-2">
              O Código de Trânsito não trata “moto elétrica” como uma coisa só.
              O que define a regra é a potência, a velocidade e as medidas do
              veículo.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <div className="flex items-center gap-2.5">
                <ShieldCheck aria-hidden="true" className="size-5 text-lime-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
                  Não precisa de CNH
                </p>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.01em]">
                {enquadramento}
              </h3>
              <p className="mt-2 text-[15px] text-text-2">
                Até 1.000 W, até 32 km/h de fábrica, dentro dos limites de
                largura e entre-eixos, com os equipamentos obrigatórios. É o
                caso dos nossos modelos.
              </p>
              <p className="mt-4 text-[13px] font-medium text-text-2">
                Dispensa:
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {dispensa.map((item) => (
                  <li key={item}>
                    <Chip>{item}</Chip>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center gap-2.5">
                <XCircle aria-hidden="true" className="size-5 text-text-2" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
                  Precisa de CNH
                </p>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.01em]">
                Ciclomotor
              </h3>
              <p className="mt-2 text-[15px] text-text-2">
                Acima de 1.000 W ou de 32 km/h, ou fora das medidas da lei. É o
                caso de muita “moto elétrica” de 2.000 W ou 3.000 W vendida por
                aí como se não precisasse de nada.
              </p>
              <p className="mt-4 text-[13px] font-medium text-text-2">
                Exige:
              </p>
              <ul className="mt-2 space-y-1.5 text-[15px]">
                {EXIGENCIAS_CICLOMOTOR.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-text-2">
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        <Section tone="muted">
          <div className="max-w-2xl">
            <Eyebrow>Os critérios da lei</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              Os 5 critérios do autopropelido
            </h2>
            <p className="mt-3 text-text-2">
              O veículo precisa cumprir <strong>todos</strong> ao mesmo tempo.
              Basta um fora para virar ciclomotor. Ao lado de cada limite, o
              valor da nossa moto de entrada.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-[14px] border border-ink/10 bg-paper">
            <table className="w-full min-w-[480px] text-left text-[15px]">
              <caption className="sr-only">
                Critérios da {norma} comparados com a moto de entrada da Full
                Electric
              </caption>
              <thead>
                <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
                  <th scope="col" className="px-5 py-4 font-semibold">
                    Critério
                  </th>
                  <th scope="col" className="px-5 py-4 font-semibold">
                    Limite legal
                  </th>
                  <th scope="col" className="px-5 py-4 font-semibold">
                    Nossa moto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {criterios.map((criterio) => {
                  const valor = destaque ? valorCriterio(destaque, criterio.item) : null;
                  return (
                    <tr key={criterio.item}>
                      <th scope="row" className="px-5 py-4 font-medium">
                        {criterio.item}
                      </th>
                      <td className="px-5 py-4 text-text-2">{criterio.limite}</td>
                      <td className="px-5 py-4">
                        {valor ? (
                          <span className="font-medium">{valor}</span>
                        ) : (
                          <span className="text-text-2">Aguardando aferição</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-6 flex max-w-2xl items-start gap-2.5 text-[14px] leading-relaxed text-text-2">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4.5 shrink-0 text-lime-600"
            />
            Cuidado com quem promete 3.000 W sem CNH. Potência acima de 1.000 W
            ou velocidade acima de 32 km/h já tira o veículo desta categoria,
            por mais que o vendedor diga o contrário.
          </p>
        </Section>

        <Section tone="paper">
          <div className="max-w-2xl">
            <Eyebrow>Curitiba e Paraná</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              Aqui a fiscalização é real
            </h2>
            <p className="mt-3 text-text-2">
              Em outras praças o assunto ainda é teoria. No Paraná, não. Por
              isso medimos, documentamos e entregamos tudo por escrito.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {FISCALIZACAO_PR.map((item) => (
              <Card key={item.titulo}>
                <h3 className="font-semibold tracking-[-0.01em]">{item.titulo}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-2">
                  {item.texto}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section tone="muted">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>Na rua</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em]">
                Onde pode circular e o que é obrigatório
              </h2>
              <p className="mt-3 text-text-2">
                Não precisar de CNH não significa poder rodar em qualquer
                lugar. As regras de circulação do autopropelido são estas:
              </p>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {REGRAS_CIRCULACAO.map((regra) => (
                  <li key={regra} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-lime-600">
                      ✓
                    </span>
                    {regra}
                  </li>
                ))}
              </ul>
            </div>

            <Card>
              <div className="flex items-center gap-2.5">
                <FileCheck aria-hidden="true" className="size-5 text-lime-600" />
                <h2 className="font-semibold tracking-[-0.01em]">
                  Dossiê de Conformidade — acompanha toda venda
                </h2>
              </div>
              <p className="mt-3 text-[15px] text-text-2">
                É o que você mostra numa abordagem. Nenhum concorrente da praça
                entrega isso.
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {dossie.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden="true" className="text-lime-600">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[13px] leading-relaxed text-text-2">
                {textoCurto}.
              </p>
            </Card>
          </div>
        </Section>

        {faq.length > 0 && (
          <Section tone="paper">
            <div className="max-w-2xl">
              <Eyebrow>Perguntas frequentes</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em]">
                Dúvidas sobre a parte legal
              </h2>
            </div>
            <div className="mt-10 max-w-3xl">
              <Accordion
                itens={faq.map((item) => ({ titulo: item.p, conteudo: item.r }))}
              />
            </div>
            <p className="mt-6 text-[15px] text-text-2">
              Mais perguntas respondidas na{" "}
              <a
                href="/#faq"
                className="font-medium underline underline-offset-2 hover:text-ink"
              >
                seção de dúvidas da página inicial
              </a>
              .
            </p>
          </Section>
        )}

        <Section tone="ink" className="text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.025em]">
            Quer ver a documentação antes de decidir?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-3">
            Mostramos a ficha técnica e a declaração de enquadramento no test
            drive. Gratuito, em Curitiba, inclusive no sábado.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={waLink("testdrive")}
              target="_blank"
              rel="noopener noreferrer"
              on="dark"
            >
              Agendar test drive gratuito
            </Button>
            <Button
              href={waLink("legal")}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              on="dark"
            >
              Tirar dúvida legal no WhatsApp
            </Button>
          </div>
        </Section>
      </main>
      <Footer />
      <WhatsAppFab href={waLink("flutuante")} />
    </>
  );
}
