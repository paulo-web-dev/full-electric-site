import Image from "next/image";
import { getSite } from "@/lib/content";
import {
  fotoPrincipal,
  linhasDoCard,
  nomeCategoria,
  nomeCurto,
  type ModeloPublicado,
} from "@/lib/catalogo";
import { waLink } from "@/lib/whatsapp";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SeloAutopropelido from "@/components/SeloAutopropelido";

/*
  Card de um modelo no grid (home e /modelos). Tudo vem do JSON: campo null
  não vira linha. Sem preço (CLAUDE.md §3.4) — CTA "Consulte o valor".
  A foto fica numa moldura clara (as fotos de estúdio têm fundo branco).
*/
export default function CardModelo({ modelo }: { modelo: ModeloPublicado }) {
  const site = getSite();
  const foto = fotoPrincipal(modelo);
  const linhas = linhasDoCard(modelo);

  return (
    <Card className="flex flex-col p-0">
      <div className="flex items-center justify-center rounded-t-[20px] bg-muted p-6">
        <Image
          src={foto.src}
          alt={foto.alt}
          width={foto.largura}
          height={foto.altura}
          sizes="(max-width: 768px) 60vw, 240px"
          className="h-64 w-auto rounded-[14px] object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-2">
          {nomeCategoria(modelo.categoria)}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em]">{modelo.nome}</h3>
        {modelo.resumo && <p className="mt-2 text-[15px] text-text-2">{modelo.resumo}</p>}
        {modelo.cores.length > 0 && (
          <p className="mt-2 text-[13px] text-text-2">
            Cores em estoque: {modelo.cores.join(", ")}
          </p>
        )}

        {linhas.length > 0 && (
          <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-[14px]">
            {linhas.map((linha) => (
              <div key={linha.chave} className="flex justify-between gap-4">
                <dt className="text-text-2">{linha.label}</dt>
                <dd className="text-right font-medium">{linha.valor}</dd>
              </div>
            ))}
          </dl>
        )}

        <SeloAutopropelido modelo={modelo} className="mt-4" />

        <div className="mt-auto pt-5">
          {/* Sem preço no site público — CTA de consulta (CLAUDE.md §3.4) */}
          <p className="border-t border-ink/10 pt-4 text-[13px] text-text-2">
            {site.comercial.parcelamentoTexto}
          </p>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <Button
              href={waLink("valor", nomeCurto(modelo))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              {site.comercial.consulteValor}
            </Button>
            <Button href={`/modelos/${modelo.slug}`} variant="secondary" className="flex-1">
              Ver ficha completa
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
