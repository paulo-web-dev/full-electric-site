import { AlertTriangle, FileCheck } from "lucide-react";
import { getSite, getModelos } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Section, { Eyebrow } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/*
  Liga cada critério da Res. 996/2023 ao spec correspondente em
  content/modelos.json. Quando você medir largura/entre-eixos (ou confirmar os
  equipamentos), basta editar o JSON — marcar "confirmado": true com o valor —
  e a tabela passa a exibir o número sozinha.
*/
const CRITERIO_PARA_SPEC: Record<string, string> = {
  "Potência nominal máxima": "Motor",
  "Velocidade máxima de fabricação": "Velocidade máxima",
  "Largura máxima": "Largura",
  "Distância entre eixos": "Entre-eixos",
  Equipamentos: "Equipamentos",
};

function valorDaNossaMoto(criterioItem: string): string | null {
  const s60 = getModelos().find((m) => m.destaque);
  const spec = s60?.specs.find(
    (s) => s.label === CRITERIO_PARA_SPEC[criterioItem]
  );
  return spec && spec.confirmado ? spec.valor : null;
}

export default function Legal() {
  const site = getSite();
  const { criterios, dossie, norma } = site.legal;

  return (
    <Section id="legal" tone="ink">
      <div className="max-w-2xl">
        <Eyebrow on="dark">{norma}</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] md:text-4xl">
          É legal? Sim — e nós provamos.
        </h2>
        <p className="mt-3 text-text-3">
          Para dispensar CNH, placa e emplacamento, o veículo precisa cumprir
          todos os critérios da {norma}. Compare, item a item, o limite da lei
          com a nossa moto de entrada.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full min-w-[480px] text-left text-[15px]">
            <caption className="sr-only">
              Critérios da Resolução CONTRAN 996/2023 comparados com a Full
              Electric S60
            </caption>
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.14em] text-text-3">
                <th scope="col" className="px-5 py-4 font-semibold">
                  Critério
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  Limite legal
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  Nossa moto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {criterios.map((criterio) => {
                const valor = valorDaNossaMoto(criterio.item);
                return (
                  <tr key={criterio.item}>
                    <th scope="row" className="px-5 py-4 font-medium text-paper">
                      {criterio.item}
                    </th>
                    <td className="px-5 py-4 text-text-3">{criterio.limite}</td>
                    <td className="px-5 py-4">
                      {valor ? (
                        <span className="font-medium text-lime-400">{valor}</span>
                      ) : (
                        <span className="text-text-3">Aguardando aferição</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Card on="dark">
          <div className="flex items-center gap-2.5">
            <FileCheck aria-hidden="true" className="size-5 text-lime-400" />
            <h3 className="font-semibold text-paper">
              Dossiê de Conformidade — acompanha toda venda
            </h3>
          </div>
          <ul className="mt-4 space-y-2.5 text-[15px] text-text-3">
            {dossie.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden="true" className="text-lime-400">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="flex max-w-xl items-start gap-2.5 text-[14px] leading-relaxed text-text-3">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4.5 shrink-0 text-lime-400"
          />
          Cuidado com quem promete 3.000 W sem CNH. Acima de 1.000 W ou 32 km/h
          o veículo é ciclomotor e exige registro, placa e ACC ou CNH categoria
          A.
        </p>
        <Button
          href={waLink("legal")}
          target="_blank"
          rel="noopener noreferrer"
          variant="whatsapp"
          on="dark"
          className="shrink-0"
        >
          Tirar dúvida legal no WhatsApp
        </Button>
      </div>
    </Section>
  );
}
