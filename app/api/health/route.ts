import { NextResponse } from "next/server";

/*
  Healthcheck do container (docker-compose.yml). Deliberadamente não consulta
  o banco: as páginas públicas funcionam sem ele, e reiniciar o site porque o
  Postgres oscilou só derrubaria a conversão junto.
*/
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { ok: true, uptime: Math.round(process.uptime()) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
