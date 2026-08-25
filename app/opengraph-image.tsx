import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/*
  Preview de compartilhamento (WhatsApp/redes) — 1200×630.
  Paleta e mensagem do herói; a âncora legal aparece na linha de apoio.
*/
export const alt =
  "Full Electric — Motos elétricas em Curitiba. Sem CNH. 100% elétrica. Pronta entrega.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function comoDataUri(relativo: string): Promise<string> {
  const bytes = await readFile(path.join(process.cwd(), "public", relativo));
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

export default async function Image() {
  const [logo, foto] = await Promise.all([
    comoDataUri("brand/logo-full-electric.jpg"),
    comoDataUri("modelos/s60/s60-01-frente-34.jpg"),
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
              flexDirection: "column",
              marginTop: "48px",
              fontSize: "76px",
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: "-2px",
            }}
          >
            <div style={{ display: "flex" }}>Sem CNH.</div>
            <div style={{ display: "flex", color: "#D2FC13" }}>
              100% elétrica.
            </div>
            <div style={{ display: "flex" }}>Pronta entrega.</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "36px",
              fontSize: "26px",
              color: "#9AA096",
            }}
          >
            Curitiba/PR · Autopropelido — Res. CONTRAN 996/2023
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
