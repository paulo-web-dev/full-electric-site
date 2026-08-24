import type { ReactNode } from "react";

export type SectionTone = "paper" | "muted" | "ink";

interface SectionProps {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}

const TONES: Record<SectionTone, string> = {
  paper: "bg-paper text-ink",
  muted: "bg-muted text-ink",
  ink: "bg-ink text-paper",
};

/* Ritmo de seção paper → muted → ink; 96px desktop / 64px mobile — CLAUDE.md §4.4 */
export default function Section({ id, tone = "paper", className = "", children }: SectionProps) {
  return (
    <section id={id} className={`${TONES[tone]} py-16 md:py-24 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">{children}</div>
    </section>
  );
}

interface EyebrowProps {
  on?: "dark" | "light";
  children: ReactNode;
}

/* Eyebrow: 12px, 600, uppercase, tracking 0.14em — CLAUDE.md §4.3 */
export function Eyebrow({ on = "light", children }: EyebrowProps) {
  const tone = on === "dark" ? "text-lime-500" : "text-text-2";
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {children}
    </p>
  );
}
