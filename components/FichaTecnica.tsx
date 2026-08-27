import type { Modelo } from "@/lib/content";

/*
  Tabela de ficha técnica de um modelo — usada na página de catálogo
  (/modelos/[slug]) e na LP de campanha (/lp/[slug]). Spec não confirmada em
  content/modelos.json aparece como "Sob consulta", nunca como fato
  (CLAUDE.md §3.6).
*/
export default function FichaTecnica({ modelo }: { modelo: Modelo }) {
  return (
    <>
      <h2 className="text-2xl font-extrabold tracking-[-0.025em]">
        Ficha técnica
      </h2>
      <div className="mt-5 overflow-x-auto rounded-[14px] border border-ink/10">
        <table className="w-full text-left text-[15px]">
          <caption className="sr-only">Ficha técnica da {modelo.nome}</caption>
          <tbody className="divide-y divide-ink/10">
            {modelo.specs.map((spec) => (
              <tr key={spec.label}>
                <th scope="row" className="w-2/5 px-5 py-3.5 font-medium">
                  {spec.label}
                </th>
                <td className="px-5 py-3.5">
                  {spec.confirmado ? (
                    spec.valor
                  ) : (
                    <span className="text-text-2">Sob consulta</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-text-2">
        Itens &quot;sob consulta&quot; ainda estão em aferição ou confirmação
        com o fabricante — pergunte no WhatsApp que a gente responde na hora.
      </p>
    </>
  );
}
