import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import {
  getModelo,
  getModelos,
  fotoPrincipal,
  nomeCategoria,
} from "@/lib/catalogo";

/* Preview de compartilhamento por modelo — foto do próprio modelo, sem preço */
export const alt = "Ficha do modelo — Full Electric Motos Elétricas, Curitiba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getModelos().map((modelo) => ({ slug: modelo.slug }));
}

const MIME: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

async function comoDataUri(relativo: string): Promise<string> {
  const bytes = await readFile(path.join(process.cwd(), "public", relativo));
  const mime = MIME[path.extname(relativo).toLowerCase()] ?? "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modelo = getModelo(slug);
  const foto = modelo ? fotoPrincipal(modelo) : undefined;
  const apto = modelo?.autopropelidoApto === "SIM";

  const [logo, fotoUri] = await Promise.all([
    comoDataUri("brand/logo-full-electric.jpg"),
    foto ? comoDataUri(foto.src.slice(1)) : Promise.resolve(""),
  ]);

  /* Foto 4:5 ou 3:4 dentro de uma moldura clara fixa (fotos de estúdio têm fundo branco) */
  const molduraLargura = 400;
  const molduraAltura = 518;
  const proporcao = foto ? foto.largura / foto.altura : 3 / 4;
  const fotoAltura = 453;
  const fotoLargura = Math.round(fotoAltura * proporcao);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0A0B0A",
          color: "#FFFFFF",
          padding: "56px 64px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "620px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt=""
              width={88}
              height={88}
              style={{ borderRadius: "999px" }}
            />
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "2px",
              }}
            >
              FULL ELECTRIC
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "44px",
              fontSize: "30px",
              color: "#9AA096",
              textTransform: "uppercase",
              letterSpacing: "4px",
            }}
          >
            {modelo ? nomeCategoria(modelo.categoria) : "Moto elétrica"}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "10px",
              fontSize: modelo && modelo.nome.length > 18 ? "56px" : "72px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            {modelo?.nome ?? "Full Electric"}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "36px",
            }}
          >
            {/* Sem preço no site público — CLAUDE.md §3.4 */}
            <div
              style={{
                display: "flex",
                fontSize: "34px",
                fontWeight: 700,
                color: "#D2FC13",
              }}
            >
              Consulte o valor no WhatsApp
            </div>
            {/* "Sem CNH" só com o interruptor ligado — CLAUDE.md §3.1 */}
            <div
              style={{
                display: "flex",
                marginTop: "18px",
                fontSize: "26px",
                color: "#9AA096",
              }}
            >
              {apto
                ? "Pronta entrega em Curitiba · Sem CNH — Res. CONTRAN 996/2023"
                : "Pronta entrega em Curitiba · 100% elétrica"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${molduraLargura}px`,
            height: `${molduraAltura}px`,
            borderRadius: "24px",
            background:
              "radial-gradient(circle at 50% 45%, rgba(210,252,19,0.22), rgba(210,252,19,0.05) 60%, #141613 85%)",
          }}
        >
          {fotoUri && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={fotoUri}
              alt=""
              width={fotoLargura}
              height={fotoAltura}
              style={{ borderRadius: foto?.recortada ? "0" : "18px", objectFit: "cover" }}
            />
          )}
        </div>
      </div>
    ),
    size
  );
}
