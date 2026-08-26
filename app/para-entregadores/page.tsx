import type { Metadata } from "next";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import {
  getSite,
  getModelos,
  getFaqPor,
  specsConfirmadas,
  formatBRL,
} from "@/lib/content";
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
import LeadForm from "@/components/sections/LeadForm";

/*
  LP para entregador de aplicativo — CLAUDE.md §5.1 e §3.5.
  - "sem CNH" sempre com a fundamentação legal no mesmo bloco (§3.1);
  - nunca mencionar desbloqueio de velocidade, exceto para dizer que não
    fazemos (§3.5);
  - autonomia sempre em faixa, com a ressalva de variação (§3.2).
*/

export const metadata: Metadata = {
  title: "Moto elétrica para iFood e delivery em Curitiba, sem CNH",
  description:
    "Moto elétrica para entregador em Curitiba: aceita no cadastro do iFood como Bicicleta Elétrica, dispensa CNH e placa (Res. CONTRAN 996/2023), roda o mês por cerca de R$ 24 de energia. Pronta entrega e test drive gratuito.",
  alternates: { canonical: `${siteUrl()}/para-entregadores` },
};

const SPECS_DO_CARD = ["Autonomia", "Velocidade máxima", "Bateria"];

/* O que o entregador precisa saber antes de comprar — sem surpresa depois */
const AVISOS = [
  {
    titulo: "Velocidade: 32 km/h de fábrica",
    texto:
      "É o limite da lei para não precisar de CNH. O iFood monitora a velocidade máxima do veículo cadastrado: não fazemos nem recomendamos nenhum tipo de alteração, porque isso pode restringir ou bloquear a conta do entregador.",
  },
  {
    titulo: "Autonomia: 40 a 55 km por carga",
    texto:
      "Varia conforme peso, relevo e condução — Curitiba tem ladeira. A bateria é removível e carrega em tomada comum, então dá para recarregar em casa entre um turno e outro.",
  },
  {
    titulo: "Cadastro no iFood: Bicicleta Elétrica",
    texto:
      "É a modalidade aceita para autopropelido. O veículo precisa bater com o que está no cadastro. A gente orienta o passo a passo na entrega.",
  },
  {
    titulo: "Onde pode rodar",
    texto:
      "Preferencialmente em ciclovias e ciclofaixas. Onde não houver, em vias urbanas com velocidade regulamentada de até 40 km/h. Nada de calçada nem via rápida.",
  },
  {
    titulo: "Capacete é obrigatório",
    texto:
      "Com selo Inmetro e elementos retrorrefletivos. Vendemos o modelo adequado junto com a moto, se você quiser sair rodando.",
  },
  {
    titulo: "Baú de série",
    texto:
      "Os dois modelos saem com baú traseiro. A mochila de entrega vai nas costas ou presa ao baú — no test drive você testa com a sua.",
  },
];

const PASSOS = [
  {
    titulo: "Chame no WhatsApp",
    texto: "Diga que é entregador e por quais regiões costuma rodar.",
  },
  {
    titulo: "Faça o test drive com a mochila",
    texto: "Gratuito, sem compromisso, inclusive no sábado. Suba uma ladeira de verdade.",
  },
  {
    titulo: "Leve no mesmo dia",
    texto: "Pronta entrega, com nota fiscal em seu nome e o Dossiê de Conformidade.",
  },
  {
    titulo: "Cadastre no aplicativo",
    texto: "Modalidade Bicicleta Elétrica. A gente orienta o passo a passo.",
  },
];

const PERGUNTAS_ENTREGADOR = [
  "Serve para trabalhar com delivery?",
  "Qual a autonomia real?",
  "Quanto custa carregar por mês?",
  "Onde eu carrego a bateria?",
  "Sobe ladeira?",
  "Aceita cartão? Dá para parcelar?",
];

export default function ParaEntregadoresPage() {
  const site = getSite();
  const { textoCurto } = site.legal;
  const { comparativo, metodologia } = site.economia;
  const modelos = getModelos().filter((m) => m.publico.includes("Delivery"));
  const faq = getFaqPor(PERGUNTAS_ENTREGADOR);

  const eletrica = comparativo.find((c) => c.modal === "Full Electric");
  const combustao = comparativo.find((c) => c.modal === "Moto 125cc");
  const diferencaMes =
    eletrica && combustao ? combustao.custoMes - eletrica.custoMes : null;

  return (
    <>
      <Header />
      <main>
        <Section tone="ink" className="pb-12 md:pb-16">
          <div className="max-w-3xl">
            <Eyebrow on="dark">Para entregadores de aplicativo</Eyebrow>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
              Moto elétrica para trabalhar com entrega, sem CNH
            </h1>
            <p className="mt-4 text-lg text-text-3">
              Aceita no cadastro do iFood na modalidade Bicicleta Elétrica.{" "}
              {textoCurto}: dispensa CNH, placa e IPVA. Roda o mês por cerca de
              R$ 24 de energia, com pronta entrega em Curitiba.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                href={waLink("entregador")}
                target="_blank"
                rel="noopener noreferrer"
                on="dark"
              >
                Quero saber mais para trabalhar
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
              <Chip on="dark">Sem CNH — {site.legal.norma}</Chip>
              <Chip on="dark">Pronta entrega em Curitiba</Chip>
              <Chip on="dark">Nota fiscal e {site.comercial.garantiaTexto}</Chip>
            </div>
          </div>
        </Section>

        <Section tone="paper">
          <div className="max-w-2xl">
            <Eyebrow>A conta do entregador</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              O que sobra no fim do mês
            </h2>
            <p className="mt-3 text-text-2">
              Quem trabalha com entrega paga o transporte todo dia. Compare o
              custo mensal de cada opção para 22 dias úteis.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {comparativo.map((item) => {
              const destaque = item.modal === "Full Electric";
              return (
                <Card
                  key={item.modal}
                  className={destaque ? "border-lime-500 bg-muted" : ""}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
                    {item.modal}
                  </p>
                  <p className="num-display mt-3 text-4xl">
                    {formatBRL(item.custoMes)}
                    <span className="text-base font-medium text-text-2"> /mês</span>
                  </p>
                  <p className="mt-2 text-[14px] text-text-2">{item.detalhe}</p>
                </Card>
              );
            })}
          </div>

          {diferencaMes !== null && (
            <p className="mt-6 max-w-2xl text-lg font-semibold tracking-[-0.01em]">
              São cerca de {formatBRL(diferencaMes)} por mês a menos do que uma
              125cc, só em combustível e manutenção.
            </p>
          )}
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-text-2">
            {metodologia}
          </p>
        </Section>

        <Section tone="muted">
          <div className="max-w-2xl">
            <Eyebrow>Antes de comprar</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              O que você precisa saber
            </h2>
            <p className="mt-3 text-text-2">
              Preferimos falar as limitações agora do que você descobrir na
              rua. Nenhuma delas é segredo — mas quase ninguém conta.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AVISOS.map((item) => (
              <Card key={item.titulo}>
                <h3 className="font-semibold tracking-[-0.01em]">{item.titulo}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-2">
                  {item.texto}
                </p>
              </Card>
            ))}
          </div>

          <p className="mt-8 flex max-w-2xl items-start gap-2.5 text-[14px] leading-relaxed text-text-2">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4.5 shrink-0 text-lime-600"
            />
            Desconfie de quem oferece “moto mais forte sem CNH” para entrega.
            Acima de 1.000 W ou 32 km/h o veículo é ciclomotor: exige placa e
            habilitação, e não entra no cadastro como Bicicleta Elétrica.
          </p>
        </Section>

        <Section tone="paper">
          <div className="max-w-2xl">
            <Eyebrow>Pronta entrega</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
              Modelos para trabalhar
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {modelos.map((modelo) => {
              const foto =
                modelo.fotos.find((f) => f.principal) ?? modelo.fotos[0];
              const specs = specsConfirmadas(modelo).filter((s) =>
                SPECS_DO_CARD.includes(s.label)
              );
              const nomeCurto = modelo.nome.replace("Full Electric ", "");
              const temPreco =
                modelo.preco.confirmado && modelo.preco.aPartirDe !== null;

              return (
                <Card key={modelo.slug} className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex shrink-0 items-center justify-center rounded-[14px] bg-muted p-4 sm:w-40">
                    <Image
                      src={foto.src}
                      alt={foto.alt}
                      width={384}
                      height={512}
                      sizes="(max-width: 640px) 60vw, 160px"
                      className="h-48 w-auto rounded-[8px] object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="text-xl font-semibold tracking-[-0.01em]">
                      {modelo.nome}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-text-2">{modelo.resumo}</p>
                    {specs.length > 0 && (
                      <dl className="mt-3 space-y-1 text-[14px]">
                        {specs.map((spec) => (
                          <div key={spec.label} className="flex justify-between gap-4">
                            <dt className="text-text-2">{spec.label}</dt>
                            <dd className="text-right font-medium">{spec.valor}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <p className="mt-4 font-semibold">
                      {temPreco
                        ? `A partir de ${formatBRL(modelo.preco.aPartirDe!)} ${site.comercial.parcelamentoTexto}`
                        : "Consulte preço no WhatsApp"}
                    </p>
                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                      <Button
                        href={waLink("modelo", nomeCurto)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4"
                      >
                        Tenho interesse
                      </Button>
                      <Button
                        href={`/modelos/${modelo.slug}`}
                        variant="secondary"
                        className="flex-1 px-4"
                      >
                        Ver ficha
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

        <Section tone="muted">
          <div className="max-w-2xl">
            <Eyebrow>Do primeiro contato à primeira entrega</Eyebrow>
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

        <Section id="formulario" tone="paper">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <Eyebrow>Test drive</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em]">
                Agende e venha com a mochila
              </h2>
              <p className="mt-2 text-text-2">
                Ao enviar, seu WhatsApp abre com a mensagem pronta e a gente
                combina o horário.
              </p>
              <div className="mt-6">
                <LeadForm origem="entregadores" usoPadrao="Delivery" />
              </div>
            </div>
            <Card className="content-start">
              <h3 className="font-semibold tracking-[-0.01em]">
                Prefere falar direto?
              </h3>
              <p className="mt-2 text-[15px] text-text-2">
                Chame no WhatsApp e diga que é entregador. Respondemos no
                horário comercial.
              </p>
              <div className="mt-4">
                <Button
                  href={waLink("entregador")}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                >
                  Falar no WhatsApp
                </Button>
              </div>
            </Card>
          </div>
        </Section>

        {faq.length > 0 && (
          <Section tone="muted">
            <div className="max-w-2xl">
              <Eyebrow>Perguntas frequentes</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em]">
                Dúvidas de quem trabalha com entrega
              </h2>
            </div>
            <div className="mt-10 max-w-3xl">
              <Accordion
                itens={faq.map((item) => ({ titulo: item.p, conteudo: item.r }))}
              />
            </div>
            <p className="mt-6 text-[15px] text-text-2">
              Sobre CNH, placa e fiscalização, veja{" "}
              <a
                href="/precisa-de-cnh"
                className="font-medium underline underline-offset-2 hover:text-ink"
              >
                a página completa sobre a lei
              </a>
              .
            </p>
          </Section>
        )}

        <Section tone="ink" className="text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-[-0.025em]">
            Pare de pagar combustível para trabalhar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-3">
            Test drive gratuito em Curitiba, inclusive no sábado. Leve no mesmo
            dia, com nota fiscal em seu nome.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={waLink("entregador")}
              target="_blank"
              rel="noopener noreferrer"
              on="dark"
            >
              Falar no WhatsApp agora
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
      <WhatsAppFab href={waLink("entregador")} />
    </>
  );
}
