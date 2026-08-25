import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Hero from "@/components/sections/Hero";
import BarraNumeros from "@/components/sections/BarraNumeros";
import Modelos from "@/components/sections/Modelos";
import Economia from "@/components/sections/Economia";
import Dores from "@/components/sections/Dores";
import Legal from "@/components/sections/Legal";
import Passos from "@/components/sections/Passos";
import PorEscrito from "@/components/sections/PorEscrito";
import Formulario from "@/components/sections/Formulario";
import Faq from "@/components/sections/Faq";
import CtaFinal from "@/components/sections/CtaFinal";

export default function Home() {
  const site = getSite();

  /* Horários espelham content/site.json → contato.horarios */
  const schemaLocalBusiness = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: site.marca.nomeCompleto,
    description: site.marca.tagline,
    url: siteUrl(),
    image: `${siteUrl()}${site.marca.logo}`,
    telephone: `+${site.contato.whatsapp}`,
    priceRange: `a partir de ${site.comercial.precoMinimoFormatado}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.contato.endereco.cidade,
      addressRegion: site.contato.endereco.uf,
      addressCountry: "BR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
  };

  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaLocalBusiness),
          }}
        />
        <Hero />
        <BarraNumeros />
        <Modelos />
        <Economia />
        <Dores />
        <Legal />
        <Passos />
        <PorEscrito />
        <Formulario />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
      <WhatsAppFab href={waLink("flutuante")} />
    </>
  );
}
