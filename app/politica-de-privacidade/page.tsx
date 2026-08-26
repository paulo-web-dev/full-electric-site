import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Full Electric — Motos Elétricas coleta, usa e protege os dados enviados pelo formulário do site, conforme a LGPD (Lei 13.709/2018).",
};

const ATUALIZADA_EM = "24 de agosto de 2026";

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
                  campanha (utm_source, utm_medium, utm_campaign);
                </li>
                <li>Data e hora do envio ou do contato;</li>
                <li>
                  Registros do atendimento: anotações da conversa, agendamento
                  do test drive, modelo e valor da compra e, se a negociação
                  não avançar, o motivo.
                </li>
              </ul>
              <p className="mt-3">
                O site público não usa cookies de rastreamento nem coleta dados
                de navegação. Se um dia ativarmos ferramentas de análise de
                audiência, esta política será atualizada antes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                3. Para que usamos os dados
              </h2>
              <p className="mt-3">
                Exclusivamente para <strong>atendimento comercial</strong>:
                responder ao seu contato, agendar e confirmar o test drive,
                acompanhar a negociação e prestar suporte pós-venda. Não
                vendemos nem alugamos seus dados, não enviamos spam e não
                usamos os dados para nenhuma outra finalidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                4. Base legal
              </h2>
              <p className="mt-3">
                Tratamos os dados com base no seu{" "}
                <strong>consentimento</strong> (art. 7º, I, da LGPD), dado no
                próprio formulário ou verbalmente no atendimento, e na execução de{" "}
                <strong>
                  procedimentos preliminares ao contrato de compra
                </strong>{" "}
                a seu pedido (art. 7º, V).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                5. Por quanto tempo guardamos
              </h2>
              <p className="mt-3">
                Mantemos os dados por até <strong>12 meses após o último
                contato</strong>. Depois disso, ou a qualquer momento se você
                pedir a exclusão, os dados são apagados definitivamente. Dados
                ligados a uma venda concluída podem ser mantidos pelo prazo
                exigido por obrigações fiscais e de garantia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                6. Com quem os dados são compartilhados
              </h2>
              <p className="mt-3">
                Com ninguém para fins comerciais. Os dados ficam armazenados em
                provedores de infraestrutura que atuam como operadores em nosso
                nome (hospedagem do site e banco de dados), sujeitos a contrato
                e a esta política.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                7. Seus direitos
              </h2>
              <p className="mt-3">
                A LGPD (art. 18) garante a você, a qualquer momento e de graça:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>Confirmar se tratamos seus dados e acessá-los;</li>
                <li>Corrigir dados incompletos ou desatualizados;</li>
                <li>Pedir a exclusão definitiva;</li>
                <li>Revogar o consentimento;</li>
                <li>Pedir informação sobre compartilhamentos.</li>
              </ul>
              <p className="mt-3">
                Para exercer qualquer um desses direitos, chame no WhatsApp{" "}
                {whatsapp}. Respondemos em até 15 dias.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.01em]">
                8. Segurança
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
                9. Contato
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
