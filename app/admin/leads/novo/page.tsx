import { ORIGENS_MANUAIS, rotuloOrigem } from "@/lib/crm";
import { MODELOS_OPCOES, USOS_OPCOES } from "@/lib/leadOpcoes";
import { criarLead } from "@/app/admin/leads/actions";
import { CAMPO, ROTULO, BOTAO_LIME, CARTAO } from "@/components/admin/estilos";

/*
  Cadastro manual — cliente que chegou na loja, ligou ou veio por indicação.
  Mesmas opções de modelo e uso do formulário público (lib/leadOpcoes.ts).
  A observação inicial vira a primeira nota do lead.
*/
export default function NovoLeadPage() {
  return (
    <main className="mx-auto max-w-2xl">
      <a href="/admin/leads" className="text-sm text-text-2 hover:text-ink">
        ← Voltar para a lista
      </a>
      <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.025em]">
        Novo lead
      </h1>
      <p className="mt-1 text-sm text-text-2">
        Para quem chegou na loja, ligou ou foi indicado. Leads do site entram
        sozinhos.
      </p>

      <form action={criarLead} className={`${CARTAO} mt-6 grid gap-4 p-5 md:p-6`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="novo-nome" className={ROTULO}>
              Nome
            </label>
            <input
              id="novo-nome"
              name="nome"
              type="text"
              required
              autoComplete="off"
              autoFocus
              className={CAMPO}
            />
          </div>
          <div>
            <label htmlFor="novo-telefone" className={ROTULO}>
              Telefone / WhatsApp
            </label>
            <input
              id="novo-telefone"
              name="telefone"
              type="tel"
              required
              inputMode="numeric"
              placeholder="(41) 90000-0000"
              className={CAMPO}
            />
          </div>
        </div>

        <div>
          <label htmlFor="novo-email" className={ROTULO}>
            E-mail (opcional)
          </label>
          <input id="novo-email" name="email" type="email" className={CAMPO} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="novo-modelo" className={ROTULO}>
              Modelo de interesse
            </label>
            <select id="novo-modelo" name="modeloInteresse" required className={CAMPO}>
              {MODELOS_OPCOES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="novo-uso" className={ROTULO}>
              Uso pretendido
            </label>
            <select id="novo-uso" name="uso" required className={CAMPO}>
              {USOS_OPCOES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="novo-origem" className={ROTULO}>
              Origem
            </label>
            <select id="novo-origem" name="origem" required className={CAMPO}>
              {ORIGENS_MANUAIS.map((o) => (
                <option key={o} value={o}>
                  {rotuloOrigem(o)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="novo-observacao" className={ROTULO}>
            Observação inicial (opcional)
          </label>
          <textarea
            id="novo-observacao"
            name="observacao"
            rows={3}
            maxLength={2000}
            placeholder="O que a pessoa perguntou, quando quer vir, condição de pagamento..."
            className={`${CAMPO} resize-y`}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className={BOTAO_LIME}>
            Cadastrar lead
          </button>
          <p className="text-[13px] text-text-2">
            Entra como &quot;Novo&quot;; abre a ficha em seguida.
          </p>
        </div>
      </form>
    </main>
  );
}
