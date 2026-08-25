import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { waLinkParaLead } from "@/lib/whatsapp";
import {
  STATUS_ORDEM,
  STATUS_ROTULO,
  STATUS_COR,
  formatarData,
  formatarDataHora,
} from "@/lib/crm";
import {
  atualizarStatus,
  definirProximoContato,
  adicionarNota,
  salvarVenda,
  excluirLead,
} from "./actions";

const CAMPO =
  "rounded-[8px] border border-ink/20 bg-paper px-3 py-2 text-sm " +
  "focus:border-lime-600 focus:outline-none";

/* Formato aceito por <input type="datetime-local">, no fuso de São Paulo */
function paraInputDateTime(data: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);
  const v = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`;
}

export default async function FichaLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { notas: { orderBy: { criadoEm: "desc" } } },
  });
  if (!lead) notFound();

  const dados: { rotulo: string; valor: string }[] = [
    { rotulo: "Telefone", valor: lead.telefone },
    { rotulo: "E-mail", valor: lead.email ?? "—" },
    { rotulo: "Modelo de interesse", valor: lead.modeloInteresse },
    { rotulo: "Uso pretendido", valor: lead.uso },
    { rotulo: "Horário preferido", valor: lead.horarioPreferido },
    { rotulo: "Origem", valor: lead.origem },
    {
      rotulo: "UTM (source / medium / campaign)",
      valor: [lead.utmSource ?? "—", lead.utmMedium ?? "—", lead.utmCampaign ?? "—"].join(" / "),
    },
    { rotulo: "Criado em", valor: formatarDataHora(lead.criadoEm) },
    { rotulo: "Atualizado em", valor: formatarDataHora(lead.atualizadoEm) },
  ];

  return (
    <main>
      <a href="/admin/leads" className="text-sm text-text-2 hover:text-ink">
        ← Voltar para a lista
      </a>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-[-0.025em]">
          {lead.nome}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-[13px] font-semibold ${STATUS_COR[lead.status]}`}
        >
          {STATUS_ROTULO[lead.status]}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-6">
          <section className="rounded-[14px] border border-ink/10 bg-paper p-6">
            <h2 className="font-semibold">Dados do lead</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {dados.map((item) => (
                <div key={item.rotulo}>
                  <dt className="text-[13px] font-medium text-text-2">
                    {item.rotulo}
                  </dt>
                  <dd className="text-sm">{item.valor}</dd>
                </div>
              ))}
            </dl>
            <a
              href={waLinkParaLead(lead.telefone, lead.nome)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-500"
            >
              Chamar no WhatsApp
            </a>
          </section>

          <section className="rounded-[14px] border border-ink/10 bg-paper p-6">
            <h2 className="font-semibold">
              Notas{" "}
              <span className="font-normal text-text-2">
                ({lead.notas.length})
              </span>
            </h2>
            <form action={adicionarNota} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="nova-nota" className="sr-only">
                Nova nota
              </label>
              <textarea
                id="nova-nota"
                name="texto"
                required
                rows={3}
                placeholder="Registro da conversa, condição negociada, objeção..."
                className={`${CAMPO} w-full resize-y`}
              />
              <div>
                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/80"
                >
                  Adicionar nota
                </button>
              </div>
            </form>
            {lead.notas.length > 0 && (
              <ul className="mt-5 grid gap-3">
                {lead.notas.map((nota) => (
                  <li
                    key={nota.id}
                    className="rounded-[8px] border border-ink/10 bg-muted p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm">{nota.texto}</p>
                    <p className="mt-2 text-[12px] text-text-2">
                      {formatarDataHora(nota.criadoEm)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className="rounded-[14px] border border-ink/10 bg-paper p-6">
            <h2 className="font-semibold">Mudar status</h2>
            <form action={atualizarStatus} className="mt-4 flex flex-wrap gap-3">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="novo-status" className="sr-only">
                Novo status
              </label>
              <select
                id="novo-status"
                name="status"
                defaultValue={lead.status}
                className={CAMPO}
              >
                {STATUS_ORDEM.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_ROTULO[s]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/80"
              >
                Salvar
              </button>
            </form>
          </section>

          {lead.status === "VENDIDO" && (
            <section className="rounded-[14px] border border-ink/10 bg-paper p-6">
              <h2 className="font-semibold">Venda</h2>
              <p className="mt-1 text-[13px] text-text-2">
                {lead.valorVenda !== null
                  ? `Registrada: R$ ${Number(lead.valorVenda).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${lead.dataVenda ? ` em ${formatarData(lead.dataVenda)}` : ""}.`
                  : "Valor ainda não registrado — ao salvar, ele entra na soma do painel."}
              </p>
              <form action={salvarVenda} className="mt-4 flex flex-wrap gap-3">
                <input type="hidden" name="id" value={lead.id} />
                <div>
                  <label
                    htmlFor="valor-venda"
                    className="mb-1 block text-[13px] font-medium"
                  >
                    Valor (R$)
                  </label>
                  <input
                    id="valor-venda"
                    type="number"
                    name="valorVenda"
                    min="0"
                    step="0.01"
                    defaultValue={
                      lead.valorVenda !== null ? Number(lead.valorVenda) : ""
                    }
                    placeholder="8499.00"
                    className={CAMPO}
                  />
                </div>
                <div>
                  <label
                    htmlFor="data-venda"
                    className="mb-1 block text-[13px] font-medium"
                  >
                    Data da venda
                  </label>
                  <input
                    id="data-venda"
                    type="date"
                    name="dataVenda"
                    defaultValue={
                      lead.dataVenda
                        ? lead.dataVenda.toISOString().slice(0, 10)
                        : ""
                    }
                    className={CAMPO}
                  />
                </div>
                <button
                  type="submit"
                  className="self-end rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/80"
                >
                  Salvar
                </button>
              </form>
            </section>
          )}

          <section className="rounded-[14px] border border-ink/10 bg-paper p-6">
            <h2 className="font-semibold">Próximo contato</h2>
            <p className="mt-1 text-[13px] text-text-2">
              {lead.proximoContatoEm
                ? `Combinado para ${formatarDataHora(lead.proximoContatoEm)}.`
                : "Nenhuma data definida."}
            </p>
            <form
              action={definirProximoContato}
              className="mt-4 flex flex-wrap gap-3"
            >
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="proximo-contato" className="sr-only">
                Data e hora do próximo contato
              </label>
              <input
                id="proximo-contato"
                type="datetime-local"
                name="proximoContato"
                defaultValue={
                  lead.proximoContatoEm
                    ? paraInputDateTime(lead.proximoContatoEm)
                    : ""
                }
                className={CAMPO}
              />
              <button
                type="submit"
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/80"
              >
                Salvar
              </button>
            </form>
            <p className="mt-2 text-[12px] text-text-2">
              Deixe em branco e salve para limpar a data.
            </p>
          </section>

          <section className="rounded-[14px] border border-[#8f2c1e]/30 bg-paper p-6">
            <h2 className="font-semibold text-[#8f2c1e]">Excluir lead</h2>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-text-2 underline-offset-2 hover:underline">
                Excluir definitivamente (LGPD)
              </summary>
              <p className="mt-3 text-sm text-text-2">
                Apaga o lead e todas as notas, sem volta. Use para atender um
                pedido de eliminação de dados ou limpar registro de teste.
              </p>
              <form action={excluirLead} className="mt-3">
                <input type="hidden" name="id" value={lead.id} />
                <button
                  type="submit"
                  className="rounded-full bg-[#8f2c1e] px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-[#7a2418]"
                >
                  Confirmar exclusão
                </button>
              </form>
            </details>
          </section>
        </div>
      </div>
    </main>
  );
}
