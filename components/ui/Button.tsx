import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { MessageCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "whatsapp";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 " +
  "text-[15px] font-semibold transition-colors";

/*
  Contraste (CLAUDE.md §4.2): lime só como FUNDO com texto ink por cima.
  A variante secondary muda conforme o fundo da seção (tone).
*/
const VARIANTS: Record<Variant, { dark: string; light: string }> = {
  primary: {
    dark: "bg-lime-400 text-ink hover:bg-lime-500",
    light: "bg-lime-400 text-ink hover:bg-lime-500",
  },
  secondary: {
    dark: "border border-line text-paper hover:border-text-3",
    light: "border border-ink/20 text-ink hover:border-ink/50",
  },
  whatsapp: {
    dark: "border border-line text-paper hover:border-lime-500",
    light: "border border-ink/20 text-ink hover:border-lime-600",
  },
};

interface CommonProps {
  variant?: Variant;
  /** fundo da seção onde o botão está — ajusta borda e cor do texto */
  on?: "dark" | "light";
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type ButtonProps = ButtonAsLink | ButtonAsButton;

export default function Button({
  variant = "primary",
  on = "light",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant][on]} ${className}`;
  const icon =
    variant === "whatsapp" ? (
      <MessageCircle aria-hidden="true" className="size-4.5" />
    ) : null;

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {icon}
      {children}
    </button>
  );
}
