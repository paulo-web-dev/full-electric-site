import type { Metadata } from "next";
import { waLink } from "@/lib/whatsapp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center bg-ink text-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-24 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime-500">
            Erro 404
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            Essa página não existe — mas as motos existem, e estão em{" "}
            <span className="text-lime-400">pronta entrega</span>.
          </h1>
          <p className="mt-4 max-w-md text-lg text-text-3">
            O endereço pode ter mudado ou sido digitado errado. Volte para o
            início ou fale direto com a gente.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/" on="dark">
              Ver os modelos
            </Button>
            <Button
              href={waLink("flutuante")}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              on="dark"
            >
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
