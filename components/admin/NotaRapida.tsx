import { adicionarNota } from "@/app/admin/leads/actions";
import { CAMPO, BOTAO_INK } from "@/components/admin/estilos";

interface NotaRapidaProps {
  leadId: string;
}

/*
  Nota sem abrir a ficha: <details> nativo, sem JavaScript no cliente.
  Usa a mesma action da ficha — é a mesma nota, só um atalho.
*/
export default function NotaRapida({ leadId }: NotaRapidaProps) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-[13px] font-medium text-text-2 underline-offset-2 hover:text-ink hover:underline [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">+ nota</span>
        <span className="hidden group-open:inline">fechar</span>
      </summary>
      <form action={adicionarNota} className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="id" value={leadId} />
        <label htmlFor={`nota-${leadId}`} className="sr-only">
          Nova nota
        </label>
        <input
          id={`nota-${leadId}`}
          name="texto"
          type="text"
          required
          maxLength={2000}
          placeholder="Ex.: ligou, quer vir sábado"
          className={`${CAMPO} py-2 text-sm`}
        />
        <button type="submit" className={`${BOTAO_INK} shrink-0 py-2`}>
          Salvar
        </button>
      </form>
    </details>
  );
}
