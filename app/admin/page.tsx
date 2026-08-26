import type { ReactNode } from "react";
import { prisma } from "@/lib/db";
import {
  STATUS_ORDEM,
  STATUS_ROTULO,
  STATUS_COR,
  rotuloOrigem,
  formatarData,
  formatarDataHora,
  formatarBRL,
  janelaDoMesCorrente,
} from "@/lib/crm";
import LinhaLead from "@/components/admin/LinhaLead";
import { BOTAO_LIME, CARTAO } from "@/components/admin/estilos";

const DIA_MS = 24 * 60 * 60 * 1000;
const LIMITE_POR_BLOCO = 15;

/*
  Tela de trabalho da manhã: o que fazer hoje, em quatro listas.
  Sem gráfico enquanto não houver volume — cada bloco tem estado vazio
  explicando o que ele mostraria.
*/
export default async function PainelPage() {
  const agora = new Date();
  const daquiSeteDias = new Date(agora.getTime() + 7 * DIA_MS);
  const mes = janelaDoMesCorrente();

  const [
    porStatus,
    novos,
    totalNovos,
    vencidos,
    totalVencidos,
    testDrives,
    testDrivesSemData,
    vendas,
    vendasSemValor,
  ] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.findMany({
      where: { status: "NOVO" },
      orderBy: { criadoEm: "asc" },
      take: LIMITE_POR_BLOCO,
    }),
    prisma.lead.count({ where: { status: "NOVO" } }),
    prisma.lead.findMany({
      where: {
        proximoContatoEm: { lte: agora },
        status: { notIn: ["VENDIDO", "PERDIDO"] },
      },
      orderBy: { proximoContatoEm: "asc" },
      take: LIMITE_POR_BLOCO,
    }),
    prisma.lead.count({
      where: {
        proximoContatoEm: { lte: agora },
        status: { notIn: ["VENDIDO", "PERDIDO"] },
      },
    }),
    prisma.lead.findMany({
      where: {
        status: "TEST_DRIVE_AGENDADO",
        proximoContatoEm: { gt: agora, lte: daquiSeteDias },
      },
      orderBy: { proximoContatoEm: "asc" },
      take: LIMITE_POR_BLOCO,
    }),
    prisma.lead.count({
      where: { status: "TEST_DRIVE_AGENDADO", proximoContatoEm: null },
    }),
    prisma.lead.findMany({
      where: { status: "VENDIDO", dataVenda: { gte: mes.inicio, lt: mes.fim } },
      orderBy: { dataVenda: "desc" },
    }),
    prisma.lead.count({ where: { status: "VENDIDO", valorVenda: null } }),
  ]);

  const contagem = new Map(porStatus.map((g) => [g.status, g._count._all]));
  const somaVendasMes = vendas.reduce((soma, v) => soma + Number(v.valorVenda ?? 0), 0);
  const nomeDoMes = agora.toLocaleDateString("pt-BR", {
    month: "long",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.025em]">Hoje</h1>
          <p className="mt-1 text-sm text-text-2">
            {agora.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "America/Sao_Paulo",
            })}
          </p>
        </div>
        <a href="/admin/leads/novo" className={BOTAO_LIME}>
          Novo lead
        </a>
      </div>

      {/* Faixa de status: atalho para a lista filtrada */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {STATUS_ORDEM.map((status) => (
          <li key={status}>
            <a
              href={`/admin/leads?status=${status}`}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ${STATUS_COR[status]}`}
            >
              {STATUS_ROTULO[status]}
              <span className="num-display text-[13px]">{contagem.get(status) ?? 0}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Bloco
          titulo="Novos sem contato"
          total={totalNovos}
          alerta={totalNovos > 0}
          vazio="Nenhum lead esperando o primeiro contato. Quando alguém enviar o formulário do site ou você cadastrar à mão, aparece aqui — o mais antigo primeiro."
          verTodos="/admin/leads?status=NOVO&ordem=asc"
        >
          {novos.map((lead) => (
            <LinhaLead
              key={lead.id}
              lead={lead}
              meta={`${rotuloOrigem(lead.origem)} · entrou ${formatarDataHora(lead.criadoEm)}`}
              voltar="/admin"
            />
          ))}
        </Bloco>

        <Bloco
          titulo="Follow-ups vencidos"
          total={totalVencidos}
          alerta={totalVencidos > 0}
          vazio="Tudo em dia. Um lead entra aqui quando a data de próximo contato (ou do test drive) já passou e ele ainda não foi vendido nem perdido."
        >
          {vencidos.map((lead) => (
            <LinhaLead
              key={lead.id}
              lead={lead}
              meta={`${STATUS_ROTULO[lead.status]} · combinado para ${formatarDataHora(lead.proximoContatoEm!)}`}
              voltar="/admin"
            />
          ))}
        </Bloco>

        <Bloco
          titulo="Test drives nos próximos 7 dias"
          total={testDrives.length}
          vazio="Nenhum test drive agendado para a próxima semana. Ao mover um lead para “Test drive agendado”, a data que você informar aparece aqui."
          rodape={
            testDrivesSemData > 0
              ? `${testDrivesSemData} lead${testDrivesSemData === 1 ? "" : "s"} com status “Test drive agendado” sem data — abra a ficha e defina o próximo contato.`
              : undefined
          }
        >
          {testDrives.map((lead) => (
            <LinhaLead
              key={lead.id}
              lead={lead}
              meta={`${formatarDataHora(lead.proximoContatoEm!)} · ${lead.uso}`}
              voltar="/admin"
            />
          ))}
        </Bloco>

        <Bloco
          titulo={`Vendas em ${nomeDoMes}`}
          total={vendas.length}
          destaque={vendas.length > 0 ? formatarBRL(somaVendasMes) : undefined}
          vazio="Nenhuma venda com data neste mês. Ao mover um lead para “Vendido”, valor, data e modelo entram aqui e somam no total."
          rodape={
            vendasSemValor > 0
              ? `${vendasSemValor} venda${vendasSemValor === 1 ? "" : "s"} sem valor registrado — não entra${vendasSemValor === 1 ? "" : "m"} na soma até você preencher na ficha.`
              : undefined
          }
        >
          {vendas.map((lead) => (
            <li key={lead.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <a
                  href={`/admin/leads/${lead.id}`}
                  className="font-semibold underline-offset-2 hover:underline"
                >
                  {lead.nome}
                </a>
                <p className="mt-0.5 text-[13px] text-text-2">
                  {lead.modeloVendido ?? lead.modeloInteresse} · {formatarData(lead.dataVenda!)} ·{" "}
                  {rotuloOrigem(lead.origem)}
                </p>
              </div>
              <span className="num-display shrink-0 text-lg">
                {lead.valorVenda !== null ? formatarBRL(Number(lead.valorVenda)) : "—"}
              </span>
            </li>
          ))}
        </Bloco>
      </div>
    </main>
  );
}

interface BlocoProps {
  titulo: string;
  total: number;
  alerta?: boolean;
  destaque?: string;
  vazio: string;
  rodape?: string;
  verTodos?: string;
  children: ReactNode;
}

function Bloco({ titulo, total, alerta, destaque, vazio, rodape, verTodos, children }: BlocoProps) {
  return (
    <section className={CARTAO}>
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
        <h2 className="flex items-center gap-2 font-semibold">
          {titulo}
          {total > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                alerta ? "bg-[#fbe4e0] text-[#8f2c1e]" : "bg-muted text-ink"
              }`}
            >
              {total}
            </span>
          )}
        </h2>
        {destaque && <span className="num-display text-xl">{destaque}</span>}
      </div>
      {total === 0 ? (
        <p className="px-4 py-6 text-sm text-text-2">{vazio}</p>
      ) : (
        <ul className="divide-y divide-ink/10">{children}</ul>
      )}
      {(rodape || (verTodos && total > LIMITE_POR_BLOCO)) && (
        <div className="border-t border-ink/10 px-4 py-3 text-[13px] text-text-2">
          {rodape && <p>{rodape}</p>}
          {verTodos && total > LIMITE_POR_BLOCO && (
            <a href={verTodos} className="font-medium underline underline-offset-2 hover:text-ink">
              Ver todos os {total}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
