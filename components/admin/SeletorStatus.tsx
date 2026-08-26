"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { LeadStatus } from "@prisma/client";
import { STATUS_ORDEM, STATUS_ROTULO, STATUS_COR, statusExigeDados } from "@/lib/crm";
import { moverLead } from "@/app/admin/leads/actions";

interface SeletorStatusProps {
  id: string;
  status: LeadStatus;
  /** Para onde voltar depois de um movimento que pede dados (test drive, venda, perda) */
  voltar: string;
  compacto?: boolean;
}

/*
  Muda o status direto da linha. Destinos que exigem dados (test drive,
  venda, perda) levam para /admin/leads/[id]/mover — o status só muda lá,
  ao confirmar. Os demais salvam na hora.

  Visual: o pill é um <span>; o <select> nativo fica invisível por cima,
  ocupando a mesma área — assim o pill tem a largura do rótulo atual e o
  toque no celular abre o seletor nativo do sistema.
*/
export default function SeletorStatus({
  id,
  status,
  voltar,
  compacto = false,
}: SeletorStatusProps) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();

  function aoMudar(novo: string) {
    if (novo === status) return;
    const destino = novo as LeadStatus;

    if (statusExigeDados(destino)) {
      const params = new URLSearchParams({ para: destino, voltar });
      router.push(`/admin/leads/${id}/mover?${params.toString()}`);
      return;
    }

    const dados = new FormData();
    dados.set("id", id);
    dados.set("status", destino);
    startTransition(async () => {
      await moverLead(dados);
      router.refresh();
    });
  }

  const tamanho = compacto ? "py-1 pl-2.5 pr-2 text-[12px]" : "py-1.5 pl-3 pr-2.5 text-[13px]";

  return (
    <span className="relative inline-flex">
      <span
        aria-hidden="true"
        className={`inline-flex items-center gap-1 rounded-full font-semibold ${tamanho} ${STATUS_COR[status]} ${pendente ? "opacity-60" : ""}`}
      >
        {pendente ? "Salvando..." : STATUS_ROTULO[status]}
        <ChevronDown className="size-3.5" />
      </span>
      <select
        aria-label="Status do lead"
        value={status}
        disabled={pendente}
        onChange={(e) => aoMudar(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {STATUS_ORDEM.map((s) => (
          <option key={s} value={s}>
            {STATUS_ROTULO[s]}
          </option>
        ))}
      </select>
    </span>
  );
}
