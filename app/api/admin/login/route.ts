import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { COOKIE_SESSAO, SESSAO_TTL_MS, criarToken } from "@/lib/adminAuth";

function senhasIguais(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const senhaCorreta = process.env.ADMIN_PASSWORD;
  const segredo = process.env.SESSION_SECRET;

  const form = await request.formData();
  const senha = String(form.get("senha") ?? "");

  if (!senhaCorreta || !segredo || !senhasIguais(senha, senhaCorreta)) {
    return NextResponse.redirect(new URL("/admin/login?erro=1", request.url), 303);
  }

  const resposta = NextResponse.redirect(new URL("/admin", request.url), 303);
  resposta.cookies.set(COOKIE_SESSAO, await criarToken(segredo), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSAO_TTL_MS / 1000,
  });
  return resposta;
}
