import { linhasFicha, NOTA_AUTONOMIA, type ModeloPublicado } from "@/lib/catalogo";

/*
  Tabela de ficha técnica de um modelo — página de catálogo (/modelos/[slug])
  e LP de campanha (/lp/[slug]). Só renderiza o que está preenchido em
  content/modelos.json: campo null não vira linha, sem placeholder
  (CLAUDE.md §3.6). Sem linha nenhuma, não renderiza nada.
*/
export default function FichaTecnica({ modelo }: { modelo: ModeloPublicado }) {
  const linhas = linhasFicha(modelo);
  if (linhas.length === 0) return null;

  const temAutonomia = linhas.some((l) => l.chave === "autonomiaKm");

  return (
    <>
      <h2 className="text-2xl font-extrabold tracking-[-0.025em]">Ficha técnica</h2>
      <div className="mt-5 overflow-x-auto rounded-[14px] border border-ink/10">
        <table className="w-full text-left text-[15px]">
          <caption className="sr-only">Ficha técnica da {modelo.nome}</caption>
          <tbody className="divide-y divide-ink/10">
            {linhas.map((linha) => (
              <tr key={linha.chave}>
                <th scope="row" className="w-2/5 px-5 py-3.5 font-medium">
                  {linha.label}
                </th>
                <td className="px-5 py-3.5">{linha.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {temAutonomia && (
        <p className="mt-3 text-[13px] text-text-2">{NOTA_AUTONOMIA}</p>
      )}
    </>
  );
}
