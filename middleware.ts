import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSAO, tokenValido } from "@/lib/adminAuth";

/*
  Protege /admin e /api/admin: sem sessão válida, página redireciona para o
  login e API responde 401. Tudo sob /admin e /api/admin sai com noindex.
*/
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ehLogin =
    pathname === "/admin/login" || pathname === "/api/admin/login";
  // Chamada pelo cron, sem sessão: a própria rota valida o CRON_SECRET
  const ehCron = pathname === "/api/admin/expurgo";

  const token = request.cookies.get(COOKIE_SESSAO)?.value;
  const autenticado = await tokenValido(token, process.env.SESSION_SECRET);

  let resposta: NextResponse;

  if (ehLogin) {
    // Já logado, não faz sentido ver o login de novo
    resposta =
      autenticado && pathname === "/admin/login"
        ? NextResponse.redirect(new URL("/admin", request.url))
        : NextResponse.next();
  } else if (autenticado || ehCron) {
    resposta = NextResponse.next();
  } else if (pathname.startsWith("/api/admin")) {
    resposta = NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  } else {
    resposta = NextResponse.redirect(new URL("/admin/login", request.url));
  }

  resposta.headers.set("X-Robots-Tag", "noindex, nofollow");
  return resposta;
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"],
};
