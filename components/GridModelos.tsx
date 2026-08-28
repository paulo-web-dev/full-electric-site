import { getSite } from "@/lib/content";
import { getModelosPorCategoria, NOTA_AUTONOMIA, type ModeloPublicado } from "@/lib/catalogo";
import CardModelo from "@/components/CardModelo";

/*
  Grid de modelos publicados agrupado por categoria (citycoco, scooter urbano,
  scooter retrô, fat bike), na ordem de content/modelos.json → categorias.
  Categoria sem modelo publicado não aparece. Usado na home e em /modelos.
*/
export default function GridModelos({
  modelos,
  tituloCategoria: Titulo = "h3",
}: {
  modelos?: ModeloPublicado[];
  /** Nível do título da categoria: h3 abaixo de um h2 (home), h2 abaixo do h1 (/modelos) */
  tituloCategoria?: "h2" | "h3";
}) {
  const site = getSite();
  const grupos = getModelosPorCategoria(modelos);
  const mostraAutonomia = grupos.some((g) =>
    g.modelos.some((m) => m.specs.autonomiaKm !== null)
  );

  return (
    <>
      <div className="space-y-12">
        {grupos.map(({ categoria, modelos: doGrupo }) => (
          <section key={categoria.id} aria-labelledby={`categoria-${categoria.id}`}>
            <Titulo
              id={`categoria-${categoria.id}`}
              className="text-xl font-semibold tracking-[-0.01em]"
            >
              {categoria.nome}
              <span className="ml-2 text-[14px] font-medium text-text-2">
                {doGrupo.length === 1 ? "1 modelo" : `${doGrupo.length} modelos`}
              </span>
            </Titulo>
            <p className="mt-1 max-w-2xl text-[15px] text-text-2">{categoria.descricao}</p>
            <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {doGrupo.map((modelo) => (
                <CardModelo key={modelo.slug} modelo={modelo} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-[13px] leading-relaxed text-text-2">
        {site.comercial.parcelamentoNota}
        {mostraAutonomia && ` ${NOTA_AUTONOMIA}`}
      </p>
    </>
  );
}
