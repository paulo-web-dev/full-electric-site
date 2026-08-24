import type { ReactNode } from "react";
import { Check } from "lucide-react";

interface ChipProps {
  on?: "dark" | "light";
  children: ReactNode;
}

/* Chip de confiança com ✓ — CLAUDE.md §4.4 */
export default function Chip({ on = "light", children }: ChipProps) {
  const tone =
    on === "dark"
      ? "border-line text-text-3"
      : "border-ink/15 text-text-2";
  const check = on === "dark" ? "text-lime-400" : "text-lime-600";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium ${tone}`}
    >
      <Check aria-hidden="true" className={`size-3.5 ${check}`} />
      {children}
    </span>
  );
}
