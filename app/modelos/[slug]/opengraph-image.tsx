import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getModelo, getModelos } from "@/lib/content";

/* Preview de compartilhamento por modelo — foto e preço do próprio modelo */
export const alt = "Ficha do modelo — Full Electric Motos Elétricas, Curitiba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getModelos().map((modelo) => ({ slug: modelo.slug }));
}

async function comoDataUri(relativo: string): Promise<string> {
  const bytes = await readFile(path.join(process.cwd(), "public", relativo));
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modelo = getModelo(slug);
  const fotoModelo =
    modelo?.fotos.find((f) => f.principal) ?? modelo?.fotos[0];

  const [logo, foto] = await Promise.all([
    comoDataUri("brand/logo-full-electric.jpg"),
    comoDataUri((fotoModelo?.src ?? "/modelos/s60/s60-01-frente-34.jpg").slice(1)),
  ]);

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
            {modelo?.estilo ?? "Scooter elétrica"}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "10px",
              fontSize: "72px",
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
            <div
              style={{
                display: "flex",
                marginTop: "18px",
                fontSize: "26px",
                color: "#9AA096",
              }}
            >
              Pronta entrega em Curitiba · Sem CNH — Res. CONTRAN 996/2023
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "400px",
            height: "518px",
            borderRadius: "24px",
            background:
              "radial-gradient(circle at 50% 45%, rgba(210,252,19,0.22), rgba(210,252,19,0.05) 60%, #141613 85%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto}
            alt=""
            width={340}
            height={453}
            style={{ borderRadius: "18px", objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    size
  );
}
