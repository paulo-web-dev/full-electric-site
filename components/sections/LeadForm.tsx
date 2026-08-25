"use client";

import { useState, type FormEvent } from "react";
import { waLinkFormulario } from "@/lib/whatsapp";
import { rastrearLead } from "@/lib/analytics";
import Button from "@/components/ui/Button";

const MODELOS = ["Full Electric S60", "Full Electric E30", "Ainda não sei"];
const USOS = ["Ir ao trabalho", "Delivery", "Uso pessoal"];
const HORARIOS = [
  "Segunda a sexta, de manhã",
  "Segunda a sexta, à tarde",
  "Sábado de manhã",
];

interface LeadFormProps {
  /** Identifica no CRM de qual seção do site o lead veio */
  origem?: string;
}

/* Máscara BR: (41) 98888-1253 */
function mascaraTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* Lidos da URL no envio — sem localStorage (CLAUDE.md §6.2) */
function utmsDaUrl(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
  };
}

const CAMPO =
  "w-full rounded-[8px] border border-ink/20 bg-paper px-4 py-3 text-[15px] " +
  "placeholder:text-text-2/70 focus:border-lime-600 focus:outline-none";

export default function LeadForm({ origem = "formulario" }: LeadFormProps) {
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  /* Marca o carregamento do formulário — anti-spam por tempo de preenchimento */
  const [inicio] = useState(() => Date.now());

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);

    const form = evento.currentTarget;
    const dados = new FormData(form);
    const email = String(dados.get("email") ?? "").trim();
    const lead = {
      nome: String(dados.get("nome") ?? "").trim(),
      whatsapp: String(dados.get("whatsapp") ?? "").trim(),
      email: email || undefined,
      modelo: String(dados.get("modelo") ?? ""),
      uso: String(dados.get("uso") ?? ""),
      horario: String(dados.get("horario") ?? ""),
      consentimento: dados.get("consentimento") === "on",
      origem,
      website: String(dados.get("website") ?? ""),
      tempoMs: Date.now() - inicio,
      ...utmsDaUrl(),
    };

    if (lead.whatsapp.replace(/\D/g, "").length < 10) {
      setErro("Confira o número de WhatsApp — precisa ter DDD e 8 ou 9 dígitos.");
      return;
    }
    if (email && !emailValido(email)) {
      setErro("O e-mail informado parece inválido. Corrija ou deixe em branco.");
      return;
    }
    if (!lead.consentimento) {
      setErro("Para enviar, é preciso autorizar o uso dos dados para contato.");
      return;
    }

    setEnviando(true);
    try {
      // Grava o lead; se a rota falhar, o WhatsApp abre mesmo assim —
      // a conversa é a conversão, o registro é secundário (CLAUDE.md §6.4).
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }).catch(() => null);
    } finally {
      setEnviando(false);
    }

    rastrearLead({ origem, modelo: lead.modelo, uso: lead.uso });

    window.open(
      waLinkFormulario({
        nome: lead.nome,
        modelo: lead.modelo,
        uso: lead.uso.toLowerCase(),
        horario: lead.horario.toLowerCase(),
      }),
      "_blank",
      "noopener,noreferrer"
    );
    form.reset();
    setTelefone("");
  }

  return (
    <form onSubmit={aoEnviar} className="grid gap-4">
      {/* Honeypot anti-spam: invisível para humanos, bots preenchem */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="lead-website">Não preencha este campo</label>
        <input
          id="lead-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-nome" className="mb-1.5 block text-sm font-medium">
            Nome
          </label>
          <input
            id="lead-nome"
            name="nome"
            type="text"
            required
            autoComplete="name"
            placeholder="Seu nome"
            className={CAMPO}
          />
        </div>
        <div>
          <label
            htmlFor="lead-whatsapp"
            className="mb-1.5 block text-sm font-medium"
          >
            WhatsApp
          </label>
          <input
            id="lead-whatsapp"
            name="whatsapp"
            type="tel"
            required
            autoComplete="tel-national"
            inputMode="numeric"
            placeholder="(41) 90000-0000"
            value={telefone}
            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
            className={CAMPO}
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium">
          E-mail (opcional)
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com.br"
          className={CAMPO}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="lead-modelo" className="mb-1.5 block text-sm font-medium">
            Modelo de interesse
          </label>
          <select id="lead-modelo" name="modelo" required className={CAMPO}>
            {MODELOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-uso" className="mb-1.5 block text-sm font-medium">
            Uso pretendido
          </label>
          <select id="lead-uso" name="uso" required className={CAMPO}>
            {USOS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-horario" className="mb-1.5 block text-sm font-medium">
            Melhor horário para test drive
          </label>
          <select id="lead-horario" name="horario" required className={CAMPO}>
            {HORARIOS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-[14px] text-text-2">
        <input
          type="checkbox"
          name="consentimento"
          required
          className="mt-0.5 size-4 shrink-0 accent-lime-600"
        />
        <span>
          Autorizo o uso dos meus dados para contato comercial da Full
          Electric, conforme a{" "}
          <a
            href="/politica-de-privacidade"
            className="font-medium underline underline-offset-2 hover:text-ink"
          >
            Política de Privacidade
          </a>
          .
        </span>
      </label>

      {erro && (
        <p role="alert" className="text-sm font-medium text-[#b42318]">
          {erro}
        </p>
      )}

      <div>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar e abrir o WhatsApp"}
        </Button>
      </div>
      <p className="text-[13px] text-text-2">
        Ao enviar, seu WhatsApp abre com a mensagem pronta — é só apertar
        enviar lá. Não mandamos spam.
      </p>
    </form>
  );
}
