import { ShieldCheck } from "lucide-react";
import { getSite } from "@/lib/content";
import { type Modelo } from "@/lib/catalogo";

/*
  Selo "sem CNH / sem placa" de um modelo — CLAUDE.md §3.1.

  É um INTERRUPTOR ligado a `autopropelidoApto` no content/modelos.json:
  "SIM" renderiza o selo com a âncora legal no mesmo bloco; "PENDENTE" não
  renderiza nada (nem CNH, nem placa, nem emplacamento). Mediu, trocou para
  "SIM", o selo aparece sozinho — sem alteração de código.
*/
export default function SeloAutopropelido({
  modelo,
  on = "light",
  className = "",
}: {
  modelo: Modelo;
  on?: "dark" | "light";
  className?: string;
}) {
  if (modelo.autopropelidoApto !== "SIM") return null;

  const site = getSite();
  const texto = on === "dark" ? "text-text-3" : "text-text-2";
  const forte = on === "dark" ? "text-paper" : "text-ink";
  const icone = on === "dark" ? "text-lime-400" : "text-lime-600";

  return (
    <p className={`flex items-start gap-2 text-[13px] leading-relaxed ${texto} ${className}`}>
      <ShieldCheck aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${icone}`} />
      <span>
        <span className={`font-semibold ${forte}`}>Dispensa CNH, placa e IPVA</span>
        {" — "}
        {site.legal.textoCurto}
      </span>
    </p>
  );
}
