const CAMPO =
  "w-full rounded-[8px] border border-ink/20 bg-paper px-4 py-3 text-[15px] " +
  "focus:border-lime-600 focus:outline-none";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="mx-auto mt-16 max-w-sm">
      <h1 className="text-2xl font-extrabold tracking-[-0.025em]">
        Acesso restrito
      </h1>
      <p className="mt-2 text-sm text-text-2">
        Gerenciador de leads da Full Electric.
      </p>

      <form
        action="/api/admin/login"
        method="post"
        className="mt-8 grid gap-4 rounded-[14px] border border-ink/10 bg-paper p-6"
      >
        <div>
          <label htmlFor="senha" className="mb-1.5 block text-sm font-medium">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            className={CAMPO}
          />
        </div>
        {erro && (
          <p role="alert" className="text-sm font-medium text-[#b42318]">
            Senha incorreta.
          </p>
        )}
        <button
          type="submit"
          className="rounded-full bg-lime-400 px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-lime-500"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
