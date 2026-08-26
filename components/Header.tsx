import Image from "next/image";
import { getSite } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import Button from "@/components/ui/Button";

const NAV = [
  { href: "/#modelos", label: "Modelos" },
  { href: "/#economia", label: "Economia" },
  { href: "/#legal", label: "É legal?" },
  { href: "/para-entregadores", label: "Entregadores" },
  { href: "/#faq", label: "Dúvidas" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const site = getSite();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Full Electric — início">
          <Image
            src={site.marca.logo}
            alt="Logo da Full Electric Motos Elétricas"
            width={40}
            height={40}
            className="size-10 rounded-full"
          />
          <span className="text-sm font-extrabold uppercase tracking-wide text-paper">
            Full <span className="text-lime-400">Electric</span>
          </span>
        </a>

        <nav aria-label="Navegação principal" className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-3 transition-colors hover:text-paper"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button
          href={waLink("testdrive")}
          target="_blank"
          rel="noopener noreferrer"
          on="dark"
          className="px-4 py-2 text-sm"
        >
          Test drive
        </Button>
      </div>
    </header>
  );
}
