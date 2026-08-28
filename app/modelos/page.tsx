import type { Metadata } from "next";
import { getModelos, getModelosPorCategoria } from "@/lib/catalogo";
import { waLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import GridModelos from "@/components/GridModelos";
import Formulario from "@/components/sections/Formulario";
import Section, { Eyebrow } from "@/components/ui/Section";
import Button from "@/components/ui/Button";

/*
  Catálogo completo, por categoria — gerado de content/modelos.json.
  Modelo novo no JSON (publicado, com nome e foto) entra aqui sozinho.
*/
export const metadata: Metadata = {
  title: "Modelos de moto elétrica em Curitiba — catálogo com pronta entrega",
  description:
    "Citycocos, scooters urbanos e mais, em estoque em Curitiba. Ficha técnica de cada modelo, parcelamento em até 18x e test drive gratuito.",
  alternates: { canonical: `${siteUrl()}/modelos` },
};

export default function ModelosPage() {
  const total = getModelos().length;
  const categorias = getModelosPorCategoria();

  return (
    <>
      <Header />
      <main>
        <Section tone="ink" className="pb-12 md:pb-16">
          <Eyebrow on="dark">Catálogo</Eyebrow>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
            Motos elétricas em pronta entrega
          </h1>
          <p className="mt-4 max-w-xl text-lg text-text-3">
            {total === 1 ? "Um modelo" : `${total} modelos`} em{" "}
            {categorias.length === 1 ? "uma categoria" : `${categorias.length} categorias`},
            todos em estoque em Curitiba. Cada ficha mostra só o que já está
            confirmado com o fabricante.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="#formulario" on="dark">
              Agendar test drive gratuito
            </Button>
            <Button
              href={waLink("hero")}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              on="dark"
            >
              Falar no WhatsApp
            </Button>
          </div>
        </Section>

        <Section tone="muted">
          <GridModelos tituloCategoria="h2" />
        </Section>

        <Formulario />
      </main>
      <Footer />
      <WhatsAppFab href={waLink("flutuante")} />
    </>
  );
}
