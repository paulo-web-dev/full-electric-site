import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  STATUS_ORDEM,
  STATUS_ROTULO,
  STATUS_COR,
  ehStatusValido,
  formatarDataHora,
} from "@/lib/crm";

interface Filtros {
  q?: string;
  status?: string;
  origem?: string;
  ordem?: string;
}

function montarWhere(filtros: Filtros): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  if (filtros.q) {
    where.OR = [
      { nome: { contains: filtros.q, mode: "insensitive" } },
      { telefone: { contains: filtros.q } },
    ];
  }
  if (filtros.status && ehStatusValido(filtros.status)) {
    where.status = filtros.status;
  }
  if (filtros.origem) {
    where.origem = filtros.origem;
  }
  return where;
}

const CAMPO =
  "rounded-[8px] border border-ink/20 bg-paper px-3 py-2 text-sm " +
  "focus:border-lime-600 focus:outline-none";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Filtros>;
}) {
  const filtros = await searchParams;
  const ordem = filtros.ordem === "asc" ? "asc" : "desc";

  const [leads, origens] = await Promise.all([
    prisma.lead.findMany({
      where: montarWhere(filtros),
      orderBy: { criadoEm: ordem },
      take: 200,
    }),
    prisma.lead.findMany({
      select: { origem: true },
      distinct: ["origem"],
      orderBy: { origem: "asc" },
    }),
  ]);

  const parametrosExport = new URLSearchParams();
  if (filtros.q) parametrosExport.set("q", filtros.q);
  if (filtros.status) parametrosExport.set("status", filtros.status);
  if (filtros.origem) parametrosExport.set("origem", filtros.origem);

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-[-0.025em]">Leads</h1>
        <a
          href={`/api/admin/leads/export?${parametrosExport.toString()}`}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold transition-colors hover:border-ink/50"
        >
          Exportar CSV
        </a>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="filtro-q" className="mb-1 block text-[13px] font-medium">
            Buscar
          </label>
          <input
            id="filtro-q"
            type="search"
            name="q"
            defaultValue={filtros.q ?? ""}
            placeholder="Nome ou telefone"
            className={CAMPO}
          />
        </div>
        <div>
          <label
            htmlFor="filtro-status"
            className="mb-1 block text-[13px] font-medium"
          >
            Status
          </label>
          <select
            id="filtro-status"
            name="status"
            defaultValue={filtros.status ?? ""}
            className={CAMPO}
          >
            <option value="">Todos</option>
            {STATUS_ORDEM.map((s) => (
              <option key={s} value={s}>
                {STATUS_ROTULO[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="filtro-origem"
            className="mb-1 block text-[13px] font-medium"
          >
            Origem
          </label>
          <select
            id="filtro-origem"
            name="origem"
            defaultValue={filtros.origem ?? ""}
            className={CAMPO}
          >
            <option value="">Todas</option>
            {origens.map((o) => (
              <option key={o.origem} value={o.origem}>
                {o.origem}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="filtro-ordem"
            className="mb-1 block text-[13px] font-medium"
          >
            Ordenar
          </label>
          <select
            id="filtro-ordem"
            name="ordem"
            defaultValue={ordem}
            className={CAMPO}
          >
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigos</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/80"
        >
          Filtrar
        </button>
      </form>

      <p className="mt-4 text-sm text-text-2">
        {leads.length === 200
          ? "Mostrando os 200 primeiros resultados — refine o filtro."
          : `${leads.length} lead${leads.length === 1 ? "" : "s"}.`}
      </p>

      {/* Desktop: tabela */}
      <div className="mt-4 hidden overflow-x-auto rounded-[14px] border border-ink/10 bg-paper md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Telefone</th>
              <th className="px-4 py-3 font-semibold">Modelo</th>
              <th className="px-4 py-3 font-semibold">Origem</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {leads.map((lead) => (
              <tr key={lead.id} className="transition-colors hover:bg-muted">
                <td className="px-4 py-3">
                  <a
                    href={`/admin/leads/${lead.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {lead.nome}
                  </a>
                </td>
                <td className="px-4 py-3">{lead.telefone}</td>
                <td className="px-4 py-3">{lead.modeloInteresse}</td>
                <td className="px-4 py-3">{lead.origem}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_COR[lead.status]}`}
                  >
                    {STATUS_ROTULO[lead.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-2">
                  {formatarDataHora(lead.criadoEm)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="mt-4 grid gap-3 md:hidden">
        {leads.map((lead) => (
          <li key={lead.id}>
            <a
              href={`/admin/leads/${lead.id}`}
              className="block rounded-[14px] border border-ink/10 bg-paper p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{lead.nome}</span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_COR[lead.status]}`}
                >
                  {STATUS_ROTULO[lead.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-2">
                {lead.telefone} · {lead.modeloInteresse}
              </p>
              <p className="mt-1 text-[13px] text-text-2">
                {lead.origem} · {formatarDataHora(lead.criadoEm)}
              </p>
            </a>
          </li>
        ))}
      </ul>

      {leads.length === 0 && (
        <p className="mt-6 text-sm text-text-2">
          Nenhum lead encontrado com esses filtros.
        </p>
      )}
    </main>
  );
}
