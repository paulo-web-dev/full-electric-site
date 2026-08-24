import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  titulo: string;
  conteudo: string;
}

interface AccordionProps {
  itens: AccordionItem[];
}

/*
  Accordion com <details>/<summary> nativos: acessível por teclado e sem
  JavaScript no cliente (Server Component, CLAUDE.md §6.2).
*/
export default function Accordion({ itens }: AccordionProps) {
  return (
    <div className="divide-y divide-ink/10 rounded-[14px] border border-ink/10 bg-paper">
      {itens.map((item) => (
        <details key={item.titulo} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold [&::-webkit-details-marker]:hidden">
            {item.titulo}
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-text-2 transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="px-5 pb-5 text-[15px] leading-relaxed text-text-2">
            {item.conteudo}
          </p>
        </details>
      ))}
    </div>
  );
}
