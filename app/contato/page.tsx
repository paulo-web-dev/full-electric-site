import type { Metadata } from "next";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { opcoesDeModelo } from "@/lib/opcoesModelo";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = {
  title: "Contato e test drive",
  description:
    "Fale com a Full Electric em Curitiba: WhatsApp (41) 98888-1253, test drive gratuito de segunda a sábado. Scooters elétricas com pronta entrega.",
  alternates: { canonical: `${siteUrl()}/contato` },
};

function confirmado(valor: string): boolean {
  return valor.trim() !== "" && !valor.includes("[CONFIRMAR]");
}

export default function ContatoPage() {
  const site = getSite();
  const { endereco, horarios, whatsappFormatado } = site.contato;

  return (
    <>
      <Header />
      <main>
        <Section tone="ink" className="pb-12 md:pb-16">
          <Eyebrow on="dark">Fale com a gente</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            Contato e test drive
          </h1>
          <p className="mt-4 max-w-lg text-lg text-text-3">
            O caminho mais rápido é o WhatsApp — respondemos no horário
            comercial. Se preferir, deixe seus dados no formulário que a gente
            chama você.
          </p>
          <div className="mt-7">
            <Button
              href={waLink("flutuante")}
              target="_blank"
              rel="noopener noreferrer"
              on="dark"
            >
              Chamar no WhatsApp agora
            </Button>
          </div>
        </Section>

        <Section tone="paper">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
                Agende seu test drive
              </h2>
              <p className="mt-2 text-text-2">
                Gratuito e sem compromisso, inclusive no sábado.
              </p>
              <div className="mt-6">
                <LeadForm origem="contato" opcoesModelo={opcoesDeModelo()} />
              </div>
            </div>

            <div className="grid content-start gap-4">
              <Card>
                <MessageCircle
                  aria-hidden="true"
                  className="size-5 text-lime-600"
                />
                <h3 className="mt-3 font-semibold">WhatsApp</h3>
                <p className="mt-1 text-[15px] text-text-2">
                  {whatsappFormatado}
                </p>
                <a
                  href={waLink("flutuante")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[14px] font-medium underline underline-offset-2"
                >
                  Abrir conversa
                </a>
              </Card>

              <Card>
                <Clock aria-hidden="true" className="size-5 text-lime-600" />
                <h3 className="mt-3 font-semibold">Horários</h3>
                <ul className="mt-1 space-y-1 text-[15px] text-text-2">
                  {horarios.map((h) => (
                    <li key={h.dias}>
                      {h.dias}: {h.horario}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <MapPin aria-hidden="true" className="size-5 text-lime-600" />
                <h3 className="mt-3 font-semibold">Onde estamos</h3>
                <p className="mt-1 text-[15px] text-text-2">
                  {endereco.cidade}, {endereco.uf}
                </p>
                {confirmado(endereco.mapsUrl) ? (
                  <a
                    href={endereco.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[14px] font-medium underline underline-offset-2"
                  >
                    Ver no Google Maps
                  </a>
                ) : (
                  <p className="mt-2 text-[13px] text-text-2">
                    Endereço completo em breve — combine a visita pelo
                    WhatsApp.
                  </p>
                )}
              </Card>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
      <WhatsAppFab href={waLink("flutuante")} />
    </>
  );
}
