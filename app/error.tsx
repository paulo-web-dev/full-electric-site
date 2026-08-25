"use client";

import { waLink } from "@/lib/whatsapp";
import Button from "@/components/ui/Button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center bg-ink text-paper">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime-500">
          Algo deu errado
        </p>
        <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">
          A página falhou, <span className="text-lime-400">a loja não</span>.
        </h1>
        <p className="mt-4 max-w-md text-lg text-[#9AA096]">
          Tente de novo em instantes. Se preferir, o WhatsApp responde na hora
          — test drive, preço e estoque.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} on="dark">
            Tentar de novo
          </Button>
          <Button
            href={waLink("flutuante")}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            on="dark"
          >
            Falar no WhatsApp
          </Button>
        </div>
      </div>
    </main>
  );
}
