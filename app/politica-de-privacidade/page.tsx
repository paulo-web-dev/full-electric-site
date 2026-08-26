import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Full Electric — Motos Elétricas coleta, usa e protege os dados do formulário, do atendimento e dos cookies do site, conforme a LGPD (Lei 13.709/2018).",
};

const ATUALIZADA_EM = "26 de agosto de 2026";

/*
  Mantida em sincronia com o que o código coleta — CLAUDE.md §3.7.
  Cookies: lib/consent.ts (fe_consent), lib/utm.ts (fe_utm),
  lib/adminAuth.ts (fe_admin_sessao), components/Analytics.tsx (GA4, Pixel).
*/
const COOKIES_ESSENCIAIS = [
  {
    nome: "fe_consent",
    para: "Guardar sua escolha na faixa de cookies, para não perguntar de novo.",
    dura: "6 meses",
  },
  {
    nome: "fe_utm",
    para: "Guardar de qual campanha ou anúncio você veio (utm_source, utm_medium, utm_campaign), para a loja saber de onde chegou o contato. Vai junto na mensagem do WhatsApp e no formulário.",
    dura: "Até fechar o navegador",
  },
  {
    nome: "fe_admin_sessao",
    para: "Sessão da área administrativa. Só existe no navegador da equipe da loja; nunca é gravado para visitantes.",
    dura: "7 dias",
  },
];

const COOKIES_OPCIONAIS = [
  {
    nome: "Google Analytics 4 (_ga, _ga_*)",
    quem: "Google",
    para: "Medir quantas pessoas visitam o site, de onde vêm e quantas clicam no WhatsApp ou enviam o formulário. Não sabemos quem é você — só contagens.",
    dura: "Até 2 anos",
  },
  {
    nome: "Meta Pixel (_fbp, _fbc)",
    quem: "Meta (Facebook e Instagram)",
    para: "Medir se os nossos anúncios no Facebook e no Instagram geraram contatos, e mostrar anúncios da loja a quem visitou o site.",
    dura: "Até 3 meses",
  },
];

export default function PoliticaDePrivacidadePage() {
  const site = getSite();
  const whatsapp = site.contato.whatsappFormatado;

  return (
    <>
      <Header />
      <main className="bg-paper text-ink">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
            LGPD — Lei 13.709/2018
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-3 text-sm text-text-2">
            Última atualização: {ATUALIZADA_EM}
          </p>

          <div className="mt-10 space-y-10 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                1. Quem é o controlador
              </h2>
              <p className="mt-3">
                O controlador dos dados é a{" "}
                <strong>{site.marca.nomeCompleto}</strong> (&quot;Full
                Electric&quot;), com atendimento em Curitiba/PR. Para qualquer
                assunto desta política, fale com a gente pelo WhatsApp{" "}
                {whatsapp}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                2. Quais dados coletamos e de onde eles vêm
              </h2>
              <p className="mt-3">
                Os dados pessoais que tratamos vêm de você mesmo, de duas
                formas:{" "}
                <strong>
                  o formulário de test drive que você preenche no site
                </strong>{" "}
                ou{" "}
                <strong>
                  o contato que você faz com a loja pessoalmente, por telefone
                  ou por indicação
                </strong>
                , quando registramos seus dados para retornar. São eles:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>Nome;</li>
                <li>Número de WhatsApp;</li>
                <li>E-mail (somente se você optar por informar);</li>
                <li>
                  Modelo de interesse, uso pretendido e melhor horário para o
                  test drive;
                </li>
                <li>
                  Origem do contato: de qual seção do site o formulário foi
                  enviado e, se você chegou por um anúncio, os parâmetros da
                  campanha (utm_source, utm_medium, utm_campaign) — que também
                  vão, em texto, no fim da mensagem pré-preenchida quando você
                  clica em um botão de WhatsApp;
                </li>
                <li>Data e hora do envio ou do contato;</li>
                <li>
                  Registros do atendimento: anotações da conversa, agendamento
                  do test drive, modelo e valor da compra e, se a negociação
                  não avançar, o motivo.
                </li>
              </ul>
              <p className="mt-3">
                Além disso, o site usa cookies — alguns essenciais, outros só
                com o seu aceite. Estão descritos na{" "}
                <a href="#cookies" className="font-medium underline underline-offset-2">
                  seção 5
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                3. Para que usamos os dados
              </h2>
              <p className="mt-3">
                Os dados de contato, exclusivamente para{" "}
                <strong>atendimento comercial</strong>: responder ao seu
                contato, agendar e confirmar o test drive, acompanhar a
                negociação e prestar suporte pós-venda. Os cookies opcionais,
                se você aceitar, para{" "}
                <strong>medir o site e os anúncios</strong> (seção 5). Não
                vendemos nem alugamos seus dados, não enviamos spam e não
                usamos os dados para nenhuma outra finalidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                4. Base legal
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>
                  Dados do formulário e do atendimento: seu{" "}
                  <strong>consentimento</strong> (art. 7º, I), dado no próprio
                  formulário ou verbalmente no atendimento, e a execução de{" "}
                  <strong>
                    procedimentos preliminares ao contrato de compra
                  </strong>{" "}
                  a seu pedido (art. 7º, V).
                </li>
                <li>
                  Cookies essenciais: <strong>legítimo interesse</strong> (art.
                  7º, IX) em fazer o site funcionar e saber de qual campanha
                  veio o contato — sem identificar você para terceiros.
                </li>
                <li>
                  Cookies de análise e de anúncios (Google Analytics e Meta
                  Pixel): <strong>consentimento</strong> (art. 7º, I), dado na
                  faixa de cookies. Sem aceite, eles não são instalados.
                </li>
              </ul>
            </section>

            <section id="cookies">
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                5. Cookies e ferramentas de medição
              </h2>
              <p className="mt-3">
                Cookie é um pequeno arquivo que o site grava no seu navegador.
                Usamos dois tipos.
              </p>

              <h3 className="mt-5 font-semibold">
                Essenciais — não dependem de aceite
              </h3>
              <p className="mt-2">
                Servem à própria operação do site e não identificam você para
                terceiros:
              </p>
              <ul className="mt-3 space-y-2.5">
                {COOKIES_ESSENCIAIS.map((c) => (
                  <li key={c.nome} className="rounded-[8px] border border-ink/10 p-3">
                    <p className="font-medium">
                      <code className="text-[14px]">{c.nome}</code>{" "}
                      <span className="text-text-2">· {c.dura}</span>
                    </p>
                    <p className="mt-1 text-[14px] text-text-2">{c.para}</p>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 font-semibold">
                De análise e de anúncios — só se você aceitar
              </h3>
              <p className="mt-2">
                Na sua primeira visita aparece uma faixa com duas opções:{" "}
                <strong>&quot;Aceitar&quot;</strong> ou{" "}
                <strong>&quot;Só essenciais&quot;</strong>. Esses cookies só
                são instalados se você clicar em &quot;Aceitar&quot;. Fechar a
                página sem responder vale o mesmo que recusar: nada é
                instalado e o site funciona igual.
              </p>
              <ul className="mt-3 space-y-2.5">
                {COOKIES_OPCIONAIS.map((c) => (
                  <li key={c.nome} className="rounded-[8px] border border-ink/10 p-3">
                    <p className="font-medium">
                      {c.nome}{" "}
                      <span className="text-text-2">
                        · {c.quem} · {c.dura}
                      </span>
                    </p>
                    <p className="mt-1 text-[14px] text-text-2">{c.para}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Quando aceitos, Google e Meta recebem dados de navegação
                (páginas vistas, cliques nos botões de WhatsApp e envio do
                formulário, identificador do cookie, endereço IP) e podem
                processá-los em servidores fora do Brasil, conforme as
                políticas de privacidade deles. Nunca enviamos a eles seu nome,
                telefone ou e-mail.
              </p>

              <h3 className="mt-6 font-semibold">Como mudar de ideia</h3>
              <p className="mt-2">
                A qualquer momento, clique em{" "}
                <strong>&quot;Cookies&quot;</strong> no rodapé de qualquer
                página: a faixa reabre e você escolhe de novo. Ao trocar para
                &quot;Só essenciais&quot;, apagamos os cookies do Google e da
                Meta que estiverem no seu navegador; a medição para de valer a
                partir da próxima página que você abrir. Você também pode
                bloquear ou apagar cookies nas configurações do navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                6. Por quanto tempo guardamos
              </h2>
              <p className="mt-3">
                Mantemos os dados de contato por até{" "}
                <strong>12 meses após o último contato</strong>. Depois disso,
                ou a qualquer momento se você pedir a exclusão, os dados são
                apagados definitivamente — há uma rotina semanal que faz isso.
                Dados ligados a uma venda concluída podem ser mantidos pelo
                prazo exigido por obrigações fiscais e de garantia. Cookies
                duram o prazo indicado na seção 5.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                7. Com quem os dados são compartilhados
              </h2>
              <p className="mt-3">
                Com ninguém para fins comerciais. Os dados de contato ficam em
                provedores de infraestrutura que atuam como operadores em nosso
                nome (hospedagem do site e banco de dados), sujeitos a contrato
                e a esta política. Google e Meta recebem apenas os dados de
                navegação descritos na seção 5, e somente se você aceitar os
                cookies de medição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                8. Seus direitos
              </h2>
              <p className="mt-3">
                A LGPD (art. 18) garante a você, a qualquer momento e de graça:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>Confirmar se tratamos seus dados e acessá-los;</li>
                <li>Corrigir dados incompletos ou desatualizados;</li>
                <li>Pedir a exclusão definitiva;</li>
                <li>Revogar o consentimento (inclusive o dos cookies);</li>
                <li>Pedir informação sobre compartilhamentos.</li>
              </ul>
              <p className="mt-3">
                Para exercer qualquer um desses direitos, chame no WhatsApp{" "}
                {whatsapp}. Respondemos em até 15 dias.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                9. Segurança
              </h2>
              <p className="mt-3">
                Os dados trafegam criptografados (HTTPS) e ficam em banco de
                dados com acesso restrito à equipe da loja, protegido por
                senha. Nenhum dado de pagamento passa pelo site — não há
                checkout nem pagamento online.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                10. Contato
              </h2>
              <p className="mt-3">
                Dúvidas sobre esta política ou sobre seus dados:{" "}
                <a
                  href={waLink("flutuante")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2"
                >
                  WhatsApp {whatsapp}
                </a>
                , de segunda a sexta das 9h às 18h e sábado das 9h às 13h.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
