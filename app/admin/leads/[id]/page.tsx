import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getModelosCatalogo } from "@/lib/catalogo";
import { waLinkParaLead } from "@/lib/whatsapp";
import {
  STATUS_ROTULO,
  MOTIVO_PERDA_ORDEM,
  MOTIVO_PERDA_ROTULO,
  COMO_CONHECEU_ORDEM,
  COMO_CONHECEU_ROTULO,
  rotuloOrigem,
  rotuloConsentimento,
  formatarData,
  formatarDataHora,
  paraInputDateTime,
} from "@/lib/crm";
import { MAX_FOLLOWUPS } from "@/lib/agente";
import {
  definirProximoContato,
  adicionarNota,
  salvarVenda,
  salvarMotivoPerda,
  salvarComoConheceu,
  marcarOptOut,
  desfazerOptOut,
  excluirLead,
} from "@/app/admin/leads/actions";
import SeletorStatus from "@/components/admin/SeletorStatus";
import { CAMPO, ROTULO, BOTAO_INK, BOTAO_LIME, CARTAO } from "@/components/admin/estilos";

export default async function FichaLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      notas: { orderBy: { criadoEm: "desc" } },
      consentimentos: { orderBy: { registradoEm: "desc" } },
    },
  });
  if (!lead) notFound();

  const modelos = getModelosCatalogo();
  const fichaUrl = `/admin/leads/${lead.id}`;

  const dados: { rotulo: string; valor: string }[] = [
    { rotulo: "Telefone", valor: lead.telefone },
    { rotulo: "E-mail", valor: lead.email ?? "—" },
    { rotulo: "Modelo de interesse", valor: lead.modeloInteresse || "—" },
    { rotulo: "Uso pretendido", valor: lead.uso || "—" },
    { rotulo: "Horário preferido", valor: lead.horarioPreferido ?? "—" },
    { rotulo: "Origem", valor: rotuloOrigem(lead.origem) },
    {
      rotulo: "Como conheceu a loja",
      valor: lead.comoConheceu ? COMO_CONHECEU_ROTULO[lead.comoConheceu] : "—",
    },
    {
      rotulo: "UTM (source / medium / campaign)",
      valor: [lead.utmSource ?? "—", lead.utmMedium ?? "—", lead.utmCampaign ?? "—"].join(" / "),
    },
    {
      rotulo: "Retomadas automáticas (WhatsApp)",
      valor:
        lead.followupCount > 0
          ? `${lead.followupCount} de ${MAX_FOLLOWUPS}${lead.ultimoFollowup ? ` · última em ${formatarDataHora(lead.ultimoFollowup)}` : ""}`
          : "Nenhuma",
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
        <h1 className="text-2xl font-extrabold tracking-[-0.025em]">{lead.nome}</h1>
        <SeletorStatus id={lead.id} status={lead.status} voltar={fichaUrl} />
        {lead.optOut && (
          <span className="rounded-full border border-[#8f2c1e]/40 bg-[#8f2c1e]/10 px-3 py-1 text-[12px] font-semibold text-[#8f2c1e]">
            Não contatar
          </span>
        )}
      </div>
      <p className="mt-1 text-[13px] text-text-2">
        Mudar para test drive, vendido ou perdido pede os dados do movimento
        antes de salvar.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-6">
          <section className={`${CARTAO} p-6`}>
            <h2 className="font-semibold">Dados do lead</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {dados.map((item) => (
                <div key={item.rotulo}>
                  <dt className="text-[13px] font-medium text-text-2">{item.rotulo}</dt>
                  <dd className="text-sm">{item.valor}</dd>
                </div>
              ))}
            </dl>
            <a
              href={waLinkParaLead(lead.telefone, lead.nome)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BOTAO_LIME} mt-5`}
            >
              Chamar no WhatsApp
            </a>
            {lead.optOut && (
              <p className="mt-2 text-[12px] font-medium text-[#8f2c1e]">
                Pediu para não ser contatado — use o WhatsApp só para responder
                quando a pessoa procurar.
              </p>
            )}
          </section>

          {lead.resumoAgente && (
            <section className={`${CARTAO} p-6`}>
              <h2 className="font-semibold">Resumo da conversa (gerado por IA)</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm">{lead.resumoAgente}</p>
              {lead.resumoAtualizado && (
                <p className="mt-2 text-[12px] text-text-2">
                  Atualizado em {formatarDataHora(lead.resumoAtualizado)}
                </p>
              )}
            </section>
          )}

          <section className={`${CARTAO} p-6`}>
            <h2 className="font-semibold">
              Notas <span className="font-normal text-text-2">({lead.notas.length})</span>
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
                maxLength={2000}
                placeholder="Registro da conversa, condição negociada, objeção..."
                className={`${CAMPO} resize-y`}
              />
              <div>
                <button type="submit" className={BOTAO_INK}>
                  Adicionar nota
                </button>
              </div>
            </form>
            {lead.notas.length > 0 && (
              <ul className="mt-5 grid gap-3">
                {lead.notas.map((nota) => (
                  <li key={nota.id} className="rounded-[8px] border border-ink/10 bg-muted p-4">
                    <p className="whitespace-pre-wrap text-sm">{nota.texto}</p>
                    <p className="mt-2 text-[12px] text-text-2">{formatarDataHora(nota.criadoEm)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className={`${CARTAO} p-6`}>
            <h2 className="font-semibold">
              Consentimento LGPD{" "}
              <span className="font-normal text-text-2">({lead.consentimentos.length})</span>
            </h2>
            {lead.consentimentos.length === 0 ? (
              <p className="mt-1 text-[13px] text-text-2">
                Nenhum registro. Lead cadastrado à mão antes de 28/08/2026: o
                consentimento foi verbal e não ficou gravado.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2.5">
                {lead.consentimentos.map((c) => (
                  <li key={c.id} className="rounded-[8px] border border-ink/10 bg-muted p-3 text-[13px]">
                    <p className="font-medium">{rotuloConsentimento(c.tipo)}</p>
                    <p className="mt-1 text-text-2">
                      {formatarDataHora(c.registradoEm)} · política {c.textoVersao} · via{" "}
                      {rotuloOrigem(c.origem)}
                      {c.ip ? ` · IP ${c.ip}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {lead.optOut ? (
            <section className="rounded-[14px] border border-[#8f2c1e]/30 bg-paper p-6">
              <h2 className="font-semibold text-[#8f2c1e]">Não contatar</h2>
              <p className="mt-1 text-[13px] text-text-2">
                Pediu para não receber mais contato. O assistente do WhatsApp
                não envia mais nada; a equipe só responde se a pessoa procurar.
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-text-2 underline-offset-2 hover:underline">
                  Desfazer — a pessoa voltou a autorizar
                </summary>
                <p className="mt-3 text-sm text-text-2">
                  Só desfaça se a própria pessoa pedir para voltar a receber
                  contato. Fica gravado um novo consentimento verbal e uma nota
                  com a data.
                </p>
                <form action={desfazerOptOut} className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={lead.id} />
                  <div>
                    <label htmlFor="origem-reautorizacao" className={ROTULO}>
                      Como ela autorizou
                    </label>
                    <select
                      id="origem-reautorizacao"
                      name="origem"
                      defaultValue="PRESENCIAL"
                      className={CAMPO}
                    >
                      <option value="PRESENCIAL">{rotuloOrigem("PRESENCIAL")}</option>
                      <option value="TELEFONE">{rotuloOrigem("TELEFONE")}</option>
                      <option value="OUTRO">{rotuloOrigem("OUTRO")}</option>
                    </select>
                  </div>
                  <div>
                    <button type="submit" className={BOTAO_INK}>
                      Desfazer revogação
                    </button>
                  </div>
                </form>
              </details>
            </section>
          ) : (
            <section className={`${CARTAO} p-6`}>
              <h2 className="font-semibold">Revogação de contato</h2>
              <p className="mt-1 text-[13px] text-text-2">
                A pessoa pediu — na loja, por telefone ou no WhatsApp — para
                não receber mais contato? Marque aqui: o assistente do WhatsApp
                para na hora e o pedido fica registrado nas notas.
              </p>
              <form action={marcarOptOut} className="mt-4">
                <input type="hidden" name="id" value={lead.id} />
                <button type="submit" className={BOTAO_INK}>
                  Marcar &quot;não contatar&quot;
                </button>
              </form>
            </section>
          )}

          {lead.status === "VENDIDO" && (
            <section className={`${CARTAO} p-6`}>
              <h2 className="font-semibold">Venda</h2>
              <p className="mt-1 text-[13px] text-text-2">
                {lead.valorVenda !== null
                  ? `Registrada: R$ ${Number(lead.valorVenda).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${lead.dataVenda ? ` em ${formatarData(lead.dataVenda)}` : ""}${lead.modeloVendido ? ` — ${lead.modeloVendido}` : ""}.`
                  : "Valor ainda não registrado — ao salvar, ele entra na soma do painel."}
              </p>
              <form action={salvarVenda} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={lead.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="valor-venda" className={ROTULO}>
                      Valor (R$)
                    </label>
                    <input
                      id="valor-venda"
                      type="number"
                      name="valorVenda"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      defaultValue={lead.valorVenda !== null ? Number(lead.valorVenda) : ""}
                      placeholder="8499.00"
                      className={CAMPO}
                    />
                  </div>
                  <div>
                    <label htmlFor="data-venda" className={ROTULO}>
                      Data da venda
                    </label>
                    <input
                      id="data-venda"
                      type="date"
                      name="dataVenda"
                      defaultValue={lead.dataVenda ? lead.dataVenda.toISOString().slice(0, 10) : ""}
                      className={CAMPO}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="modelo-vendido" className={ROTULO}>
                    Modelo vendido
                  </label>
                  <select
                    id="modelo-vendido"
                    name="modeloVendido"
                    defaultValue={lead.modeloVendido ?? ""}
                    className={CAMPO}
                  >
                    <option value="">— não informado —</option>
                    {modelos.map((m) => (
                      <option key={m.slug} value={m.nome}>
                        {m.nome}
                      </option>
                    ))}
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <button type="submit" className={BOTAO_INK}>
                    Salvar venda
                  </button>
                </div>
              </form>
            </section>
          )}

          {lead.status === "PERDIDO" && (
            <section className={`${CARTAO} p-6`}>
              <h2 className="font-semibold">Motivo da perda</h2>
              <p className="mt-1 text-[13px] text-text-2">
                {lead.motivoPerda
                  ? `${MOTIVO_PERDA_ROTULO[lead.motivoPerda]}${lead.motivoPerdaDetalhe ? ` — ${lead.motivoPerdaDetalhe}` : ""}.`
                  : "Sem motivo registrado."}
              </p>
              <form action={salvarMotivoPerda} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={lead.id} />
                <div>
                  <label htmlFor="motivo-perda" className={ROTULO}>
                    Motivo
                  </label>
                  <select
                    id="motivo-perda"
                    name="motivoPerda"
                    required
                    defaultValue={lead.motivoPerda ?? MOTIVO_PERDA_ORDEM[0]}
                    className={CAMPO}
                  >
                    {MOTIVO_PERDA_ORDEM.map((m) => (
                      <option key={m} value={m}>
                        {MOTIVO_PERDA_ROTULO[m]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="motivo-detalhe" className={ROTULO}>
                    Detalhe (opcional)
                  </label>
                  <input
                    id="motivo-detalhe"
                    type="text"
                    name="motivoPerdaDetalhe"
                    maxLength={300}
                    defaultValue={lead.motivoPerdaDetalhe ?? ""}
                    className={CAMPO}
                  />
                </div>
                <div>
                  <button type="submit" className={BOTAO_INK}>
                    Salvar motivo
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className={`${CARTAO} p-6`}>
            <h2 className="font-semibold">Como conheceu a loja</h2>
            <form action={salvarComoConheceu} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="como-conheceu" className="sr-only">
                Como conheceu a loja
              </label>
              <select
                id="como-conheceu"
                name="comoConheceu"
                defaultValue={lead.comoConheceu ?? ""}
                className={CAMPO}
              >
                <option value="">— não informado —</option>
                {COMO_CONHECEU_ORDEM.map((c) => (
                  <option key={c} value={c}>
                    {COMO_CONHECEU_ROTULO[c]}
                  </option>
                ))}
              </select>
              <div>
                <button type="submit" className={BOTAO_INK}>
                  Salvar
                </button>
              </div>
            </form>
          </section>

          <section className={`${CARTAO} p-6`}>
            <h2 className="font-semibold">
              {lead.status === "TEST_DRIVE_AGENDADO" ? "Data do test drive" : "Próximo contato"}
            </h2>
            <p className="mt-1 text-[13px] text-text-2">
              {lead.proximoContatoEm
                ? `Combinado para ${formatarDataHora(lead.proximoContatoEm)}.`
                : "Nenhuma data definida."}
            </p>
            <form action={definirProximoContato} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="proximo-contato" className="sr-only">
                Data e hora do próximo contato
              </label>
              <input
                id="proximo-contato"
                type="datetime-local"
                name="proximoContato"
                defaultValue={lead.proximoContatoEm ? paraInputDateTime(lead.proximoContatoEm) : ""}
                className={CAMPO}
              />
              <div>
                <button type="submit" className={BOTAO_INK}>
                  Salvar
                </button>
              </div>
            </form>
            <p className="mt-2 text-[12px] text-text-2">
              Deixe em branco e salve para limpar a data. Aparece no painel quando vence.
            </p>
          </section>

          <section className="rounded-[14px] border border-[#8f2c1e]/30 bg-paper p-6">
            <h2 className="font-semibold text-[#8f2c1e]">Excluir lead</h2>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-text-2 underline-offset-2 hover:underline">
                Excluir definitivamente (LGPD)
              </summary>
              <p className="mt-3 text-sm text-text-2">
                Apaga o lead e todas as notas, sem volta. Use para atender um pedido
                de eliminação de dados ou limpar registro de teste.
                {lead.status === "VENDIDO" && " Este lead tem venda registrada — ela sai da soma do painel."}
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
