import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  STATUS_ORDEM,
  STATUS_ROTULO,
  ehStatusValido,
  rotuloOrigem,
  formatarDataHora,
} from "@/lib/crm";
import { waLinkParaLead } from "@/lib/whatsapp";
import SeletorStatus from "@/components/admin/SeletorStatus";
import NotaRapida from "@/components/admin/NotaRapida";
import LinhaLead from "@/components/admin/LinhaLead";
import { CAMPO, ROTULO, BOTAO_INK, BOTAO_LIME, BOTAO_BORDA, CARTAO } from "@/components/admin/estilos";

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

  const parametros = new URLSearchParams();
  if (filtros.q) parametros.set("q", filtros.q);
  if (filtros.status) parametros.set("status", filtros.status);
  if (filtros.origem) parametros.set("origem", filtros.origem);
  if (filtros.ordem) parametros.set("ordem", filtros.ordem);
  const query = parametros.toString();
  /* Depois de um movimento com dados, volta para esta mesma lista filtrada */
  const voltar = query ? `/admin/leads?${query}` : "/admin/leads";

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-[-0.025em]">Leads</h1>
        <div className="flex gap-2">
          <a href={`/api/admin/leads/export?${query}`} className={BOTAO_BORDA}>
            Exportar CSV
          </a>
          <a href="/admin/leads/novo" className={BOTAO_LIME}>
            Novo lead
          </a>
        </div>
      </div>

      <form method="get" className="mt-6 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
        <div>
          <label htmlFor="filtro-q" className={ROTULO}>
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
          <label htmlFor="filtro-status" className={ROTULO}>
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
          <label htmlFor="filtro-origem" className={ROTULO}>
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
                {rotuloOrigem(o.origem)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-ordem" className={ROTULO}>
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
        <button type="submit" className={`${BOTAO_INK} sm:col-span-2 lg:col-auto`}>
          Filtrar
        </button>
      </form>

      <p className="mt-4 text-sm text-text-2">
        {leads.length === 200
          ? "Mostrando os 200 primeiros resultados — refine o filtro."
          : `${leads.length} lead${leads.length === 1 ? "" : "s"}.`}
      </p>

      {/* Desktop: tabela com status editável e nota rápida na linha */}
      <div className={`${CARTAO} mt-4 hidden overflow-x-auto md:block`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Telefone</th>
              <th className="px-4 py-3 font-semibold">Modelo</th>
              <th className="px-4 py-3 font-semibold">Origem</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Criado em</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {leads.map((lead) => (
              <tr key={lead.id} className="align-top transition-colors hover:bg-muted">
                <td className="px-4 py-3">
                  <a
                    href={`/admin/leads/${lead.id}`}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {lead.nome}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={waLinkParaLead(lead.telefone, lead.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    {lead.telefone}
                  </a>
                </td>
                <td className="px-4 py-3">{lead.modeloInteresse}</td>
                <td className="px-4 py-3 text-text-2">{rotuloOrigem(lead.origem)}</td>
                <td className="px-4 py-3">
                  <SeletorStatus id={lead.id} status={lead.status} voltar={voltar} compacto />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-2">
                  {formatarDataHora(lead.criadoEm)}
                </td>
                <td className="px-4 py-3">
                  <NotaRapida leadId={lead.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular: cards com as mesmas ações */}
      <ul className={`${CARTAO} mt-4 divide-y divide-ink/10 md:hidden`}>
        {leads.map((lead) => (
          <LinhaLead
            key={lead.id}
            lead={lead}
            meta={`${rotuloOrigem(lead.origem)} · ${formatarDataHora(lead.criadoEm)}`}
            voltar={voltar}
          />
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
