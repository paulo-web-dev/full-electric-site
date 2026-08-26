import type { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_SESSAO, tokenValido } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/* Todas as páginas do admin dependem de sessão e banco — nunca pré-renderizar */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  const autenticado = await tokenValido(token, process.env.SESSION_SECRET);

  return (
    <div className="min-h-screen bg-muted text-ink">
      {autenticado && (
        <header className="border-b border-ink/10 bg-paper">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 md:px-8">
            <nav aria-label="Navegação do admin" className="flex items-center gap-4 md:gap-5">
              <span className="text-sm font-extrabold uppercase tracking-wide">
                FE <span className="text-lime-600">Admin</span>
              </span>
              <a href="/admin" className="text-sm font-medium text-text-2 hover:text-ink">
                Painel
              </a>
              <a
                href="/admin/leads"
                className="text-sm font-medium text-text-2 hover:text-ink"
              >
                Leads
              </a>
              <a
                href="/admin/leads/novo"
                className="hidden whitespace-nowrap rounded-full bg-lime-400 px-3 py-1 text-sm font-semibold text-ink transition-colors hover:bg-lime-500 sm:inline-flex"
              >
                Novo lead
              </a>
            </nav>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="text-sm font-medium text-text-2 hover:text-ink"
              >
                Sair
              </button>
            </form>
          </div>
        </header>
      )}
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}
