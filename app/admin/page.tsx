import { prisma } from "@/lib/db";
import {
  STATUS_ORDEM,
  STATUS_ROTULO,
  STATUS_COR,
  formatarDataHora,
} from "@/lib/crm";

export default async function PainelPage() {
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Mês corrente no fuso de São Paulo
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(agora);
  const ano = Number(partes.find((p) => p.type === "year")?.value);
  const mes = Number(partes.find((p) => p.type === "month")?.value);
  const inicioDoMes = new Date(
    `${ano}-${String(mes).padStart(2, "0")}-01T00:00:00-03:00`
  );
  const inicioDoProximoMes = new Date(
    mes === 12
      ? `${ano + 1}-01-01T00:00:00-03:00`
      : `${ano}-${String(mes + 1).padStart(2, "0")}-01T00:00:00-03:00`
  );

  const [porStatus, total, daSemana, followUpsVencidos, vendasDoMes] =
    await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { criadoEm: { gte: seteDiasAtras } } }),
    prisma.lead.findMany({
      where: {
        proximoContatoEm: { lte: agora },
        status: { notIn: ["VENDIDO", "PERDIDO"] },
      },
      orderBy: { proximoContatoEm: "asc" },
      take: 20,
    }),
    prisma.lead.aggregate({
      _sum: { valorVenda: true },
      _count: { _all: true },
      where: {
        status: "VENDIDO",
        dataVenda: { gte: inicioDoMes, lt: inicioDoProximoMes },
      },
    }),
  ]);

  const contagem = new Map(porStatus.map((g) => [g.status, g._count._all]));
  const vendidos = contagem.get("VENDIDO") ?? 0;
  const conversao = total > 0 ? Math.round((vendidos / total) * 100) : 0;
  const somaVendasMes = Number(vendasDoMes._sum.valorVenda ?? 0);

  return (
    <main>
      <h1 className="text-2xl font-extrabold tracking-[-0.025em]">Painel</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-[14px] border border-ink/10 bg-paper p-5">
          <p className="text-[13px] font-medium text-text-2">Leads no total</p>
          <p className="num-display mt-1 text-3xl">{total}</p>
        </div>
        <div className="rounded-[14px] border border-ink/10 bg-paper p-5">
          <p className="text-[13px] font-medium text-text-2">Últimos 7 dias</p>
          <p className="num-display mt-1 text-3xl">{daSemana}</p>
        </div>
        <div className="rounded-[14px] border border-ink/10 bg-paper p-5">
          <p className="text-[13px] font-medium text-text-2">
            Conversão lead → vendido
          </p>
          <p className="num-display mt-1 text-3xl">{conversao}%</p>
        </div>
        <div className="rounded-[14px] border border-ink/10 bg-paper p-5">
          <p className="text-[13px] font-medium text-text-2">
            Follow-ups vencidos
          </p>
          <p className="num-display mt-1 text-3xl">{followUpsVencidos.length}</p>
        </div>
        <div className="rounded-[14px] border border-ink/10 bg-paper p-5">
          <p className="text-[13px] font-medium text-text-2">Vendas no mês</p>
          <p className="num-display mt-1 text-3xl">
            {somaVendasMes.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="mt-1 text-[12px] text-text-2">
            {vendasDoMes._count._all} venda
            {vendasDoMes._count._all === 1 ? "" : "s"} com data no mês
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Por status</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
        {STATUS_ORDEM.map((status) => (
          <a
            key={status}
            href={`/admin/leads?status=${status}`}
            className="rounded-[14px] border border-ink/10 bg-paper p-4 transition-colors hover:border-ink/30"
          >
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_COR[status]}`}
            >
              {STATUS_ROTULO[status]}
            </span>
            <p className="num-display mt-2 text-2xl">
              {contagem.get(status) ?? 0}
            </p>
          </a>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">
        Follow-ups vencidos{" "}
        {followUpsVencidos.length > 0 && (
          <span className="ml-1 rounded-full bg-[#fbe4e0] px-2.5 py-0.5 text-[13px] font-semibold text-[#8f2c1e]">
            atenção
          </span>
        )}
      </h2>
      {followUpsVencidos.length === 0 ? (
        <p className="mt-3 text-sm text-text-2">
          Nenhum follow-up vencido. Tudo em dia.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10 rounded-[14px] border border-ink/10 bg-paper">
          {followUpsVencidos.map((lead) => (
            <li key={lead.id}>
              <a
                href={`/admin/leads/${lead.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">
                  {lead.nome}{" "}
                  <span className="text-text-2">— {lead.telefone}</span>
                </span>
                <span className="text-sm font-medium text-[#8f2c1e]">
                  combinado para{" "}
                  {lead.proximoContatoEm
                    ? formatarDataHora(lead.proximoContatoEm)
                    : "—"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
