import type { Lead } from "@prisma/client";
import { MessageCircle } from "lucide-react";
import { waLinkParaLead } from "@/lib/whatsapp";
import SeletorStatus from "@/components/admin/SeletorStatus";
import NotaRapida from "@/components/admin/NotaRapida";

interface LinhaLeadProps {
  lead: Pick<Lead, "id" | "nome" | "telefone" | "modeloInteresse" | "status">;
  /** Linha de contexto abaixo do nome (origem, data, próximo contato...) */
  meta: string;
  /** URL para voltar depois de um movimento que pede dados */
  voltar: string;
}

/*
  Card de lead usado no painel e na lista (celular): nome, contexto, WhatsApp,
  status editável e nota rápida — tudo sem abrir a ficha.
*/
export default function LinhaLead({ lead, meta, voltar }: LinhaLeadProps) {
  return (
    <li className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={`/admin/leads/${lead.id}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {lead.nome}
          </a>
          <p className="mt-0.5 text-sm text-text-2">
            {lead.telefone} · {lead.modeloInteresse}
          </p>
          <p className="mt-0.5 text-[13px] text-text-2">{meta}</p>
        </div>
        <a
          href={waLinkParaLead(lead.telefone, lead.nome)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chamar ${lead.nome} no WhatsApp`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink transition-colors hover:bg-lime-500"
        >
          <MessageCircle aria-hidden="true" className="size-4.5" />
        </a>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <SeletorStatus id={lead.id} status={lead.status} voltar={voltar} />
        <NotaRapida leadId={lead.id} />
      </div>
    </li>
  );
}
