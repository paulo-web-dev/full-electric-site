import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getModelosCatalogo } from "@/lib/catalogo";
import {
  STATUS_ROTULO,
  STATUS_COR,
  MOTIVO_PERDA_ORDEM,
  MOTIVO_PERDA_ROTULO,
  ehStatusValido,
  statusExigeDados,
  hojeEmSaoPaulo,
  paraInputDateTime,
} from "@/lib/crm";
import { moverLead } from "@/app/admin/leads/actions";
import { CAMPO, ROTULO, BOTAO_LIME, BOTAO_BORDA, CARTAO } from "@/components/admin/estilos";

/*
  Um passo só: o status muda junto com os dados que ele exige.
  - TEST_DRIVE_AGENDADO → data e hora (vai para proximoContatoEm)
  - VENDIDO → valor, data e modelo vendido
  - PERDIDO → motivo (lista curta) + detalhe livre
  O select da lista/ficha só cai aqui para esses três; os demais salvam direto.
*/
export default async function MoverLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ para?: string; voltar?: string }>;
}) {
  const { id } = await params;
  const { para = "", voltar = "" } = await searchParams;

  if (!ehStatusValido(para) || !statusExigeDados(para)) {
    redirect(`/admin/leads/${id}`);
  }

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const destino = /^\/admin(\/|\?|$)/.test(voltar) ? voltar : `/admin/leads/${id}`;

  // Modelo vendido: pré-seleciona o de interesse; valor sugerido = preço de tabela
  const modelos = getModelosCatalogo();
  const modeloDeInteresse = modelos.find((m) => m.nome === lead.modeloInteresse);
  const precoSugerido = modeloDeInteresse?.precoBrl ?? null;

  return (
    <main className="mx-auto max-w-xl">
      <a href={destino} className="text-sm text-text-2 hover:text-ink">
        ← Voltar sem mudar
      </a>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-[-0.025em]">{lead.nome}</h1>
        <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${STATUS_COR[lead.status]}`}>
          {STATUS_ROTULO[lead.status]}
        </span>
        <span aria-hidden="true" className="text-text-2">→</span>
        <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${STATUS_COR[para]}`}>
          {STATUS_ROTULO[para]}
        </span>
      </div>
      <p className="mt-1 text-sm text-text-2">
        {lead.telefone} · {lead.modeloInteresse}
      </p>

      <form action={moverLead} className={`${CARTAO} mt-6 grid gap-4 p-5 md:p-6`}>
        <input type="hidden" name="id" value={lead.id} />
        <input type="hidden" name="status" value={para} />
        <input type="hidden" name="voltar" value={destino} />

        {para === "TEST_DRIVE_AGENDADO" && (
          <div>
            <label htmlFor="mover-quando" className={ROTULO}>
              Data e hora do test drive
            </label>
            <input
              id="mover-quando"
              type="datetime-local"
              name="proximoContato"
              required
              defaultValue={
                lead.proximoContatoEm ? paraInputDateTime(lead.proximoContatoEm) : ""
              }
              className={CAMPO}
            />
            <p className="mt-1.5 text-[13px] text-text-2">
              Vira o próximo contato do lead e aparece no painel da manhã.
            </p>
          </div>
        )}

        {para === "VENDIDO" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="mover-valor" className={ROTULO}>
                  Valor da venda (R$)
                </label>
                <input
                  id="mover-valor"
                  type="number"
                  name="valorVenda"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={precoSugerido ?? ""}
                  placeholder="8499"
                  className={CAMPO}
                />
              </div>
              <div>
                <label htmlFor="mover-data" className={ROTULO}>
                  Data da venda
                </label>
                <input
                  id="mover-data"
                  type="date"
                  name="dataVenda"
                  required
                  defaultValue={hojeEmSaoPaulo()}
                  className={CAMPO}
                />
              </div>
            </div>
            <div>
              <label htmlFor="mover-modelo" className={ROTULO}>
                Modelo vendido
              </label>
              <select
                id="mover-modelo"
                name="modeloVendido"
                required
                defaultValue={modeloDeInteresse?.nome ?? modelos[0]?.nome}
                className={CAMPO}
              >
                {modelos.map((m) => (
                  <option key={m.slug} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
                <option value="Outro">Outro</option>
              </select>
            </div>
            <p className="text-[13px] text-text-2">
              O valor entra na soma &quot;Vendas no mês&quot; do painel pela data informada.
            </p>
          </>
        )}

        {para === "PERDIDO" && (
          <>
            <fieldset>
              <legend className={ROTULO}>Por que perdemos?</legend>
              <div className="grid gap-2">
                {MOTIVO_PERDA_ORDEM.map((m, i) => (
                  <label
                    key={m}
                    className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-ink/15 px-3 py-2.5 text-[15px] has-[:checked]:border-ink has-[:checked]:bg-muted"
                  >
                    <input
                      type="radio"
                      name="motivoPerda"
                      value={m}
                      required
                      defaultChecked={i === 0}
                      className="size-4 accent-ink"
                    />
                    {MOTIVO_PERDA_ROTULO[m]}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="mover-detalhe" className={ROTULO}>
                Detalhe (opcional — obrigatório só se &quot;Outro&quot;)
              </label>
              <input
                id="mover-detalhe"
                type="text"
                name="motivoPerdaDetalhe"
                maxLength={300}
                placeholder="Ex.: achou a S60 larga demais para a garagem"
                className={CAMPO}
              />
            </div>
          </>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button type="submit" className={BOTAO_LIME}>
            Confirmar: {STATUS_ROTULO[para]}
          </button>
          <a href={destino} className={BOTAO_BORDA}>
            Cancelar
          </a>
        </div>
      </form>
    </main>
  );
}
