import type { ReactNode } from "react";

interface CardProps {
  /** fundo da seção — no escuro o card usa --surface, no claro usa borda */
  on?: "dark" | "light";
  className?: string;
  children: ReactNode;
}

/* Elevação por contraste, não por sombra — CLAUDE.md §4.4 */
export default function Card({ on = "light", className = "", children }: CardProps) {
  const tone =
    on === "dark"
      ? "bg-surface border border-line"
      : "bg-paper border border-ink/10";
  return <div className={`rounded-[20px] p-6 ${tone} ${className}`}>{children}</div>;
}
