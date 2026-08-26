import Image from "next/image";
import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";

const NAV = [
  { href: "/#modelos", label: "Modelos" },
  { href: "/#economia", label: "Economia" },
  { href: "/#legal", label: "É legal?" },
  { href: "/precisa-de-cnh", label: "Precisa de CNH?" },
  { href: "/para-entregadores", label: "Para entregadores" },
  { href: "/#formulario", label: "Agendar test drive" },
  { href: "/#faq", label: "Dúvidas" },
  { href: "/contato", label: "Contato" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade" },
];

/* Campos [CONFIRMAR] do content/site.json não são renderizados */
function confirmado(valor: string): boolean {
  return valor.trim() !== "" && !valor.includes("[CONFIRMAR]");
}

export default function Footer() {
  const site = getSite();
  const { endereco, horarios, whatsappFormatado } = site.contato;

  const linhaEndereco = [endereco.logradouro, endereco.bairro]
    .filter(confirmado)
    .join(", ");

  return (
    <footer className="border-t border-line bg-ink pb-28 pt-14 text-paper md:pb-14">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 md:grid-cols-3 md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={site.marca.logo}
              alt="Logo da Full Electric Motos Elétricas"
              width={40}
              height={40}
              className="size-10 rounded-full"
            />
            <span className="text-sm font-extrabold uppercase tracking-wide">
              Full <span className="text-lime-400">Electric</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-[14px] text-text-3">
            {site.marca.tagline}
          </p>
          {/* Selo do grupo — único uso permitido do azul Unyflex (CLAUDE.md §4.1) */}
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-text-3">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-unyflex-blue"
            />
            {site.marca.grupo}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-3">
            Contato
          </h2>
          <ul className="mt-4 space-y-2 text-[14px] text-text-3">
            <li>
              <a
                href={waLink("flutuante")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-paper transition-colors hover:text-lime-400"
              >
                WhatsApp: {whatsappFormatado}
              </a>
            </li>
            {linhaEndereco && <li>{linhaEndereco}</li>}
            <li>
              {endereco.cidade}, {endereco.uf}
            </li>
            {horarios.map((h) => (
              <li key={h.dias}>
                {h.dias}: {h.horario}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-3">
            Navegação
          </h2>
          <ul className="mt-4 space-y-2 text-[14px]">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-text-3 transition-colors hover:text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-line px-5 pt-6 md:px-8">
        <p className="text-[13px] leading-relaxed text-text-3">
          {site.legal.textoCurto}. {site.legal.avisoCirculacao}
        </p>
        <p className="mt-4 text-[13px] text-text-3">
          © {new Date().getFullYear()} {site.marca.nomeCompleto} — Curitiba/PR
        </p>
      </div>
    </footer>
  );
}
