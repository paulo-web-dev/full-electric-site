import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { permitido, ipDoCliente } from "@/lib/rateLimit";

/*
  Anti-spam em três camadas, todas com BLOQUEIO SILENCIOSO (o bot recebe o
  mesmo 200 {ok:true} de um envio real, sem pista de que foi filtrado):
  1. honeypot: campo "website" invisível — humano não preenche;
  2. tempo mínimo de preenchimento: menos de 3s do carregamento ao envio = bot;
  3. rate limit por IP: 5 envios por hora (IP lido atrás do proxy, ver
     TRUST_PROXY_HOPS em lib/rateLimit.ts).
*/
const TEMPO_MINIMO_MS = 3000;
const LIMITE_POR_IP = 5;
const JANELA_MS = 60 * 60 * 1000;

const RESPOSTA_OK = { ok: true };

interface LeadEntrada {
  nome: string;
  whatsapp: string;
  email?: string;
  modelo: string;
  uso: string;
  horario: string;
  consentimento: boolean;
  origem?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

function textoOpcional(valor: unknown, max: number): string | undefined {
  const t = texto(valor, max);
  return t || undefined;
}

function validar(corpo: unknown): LeadEntrada | null {
  if (typeof corpo !== "object" || corpo === null) return null;
  const c = corpo as Record<string, unknown>;

  const nome = texto(c.nome, 120);
  const whatsapp = texto(c.whatsapp, 20);
  const email = textoOpcional(c.email, 160);

  if (!nome) return null;
  if (whatsapp.replace(/\D/g, "").length < 10) return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  if (c.consentimento !== true) return null;

  return {
    nome,
    whatsapp,
    email,
    modelo: texto(c.modelo, 60),
    uso: texto(c.uso, 60),
    horario: texto(c.horario, 60),
    consentimento: true,
    origem: textoOpcional(c.origem, 40),
    utmSource: textoOpcional(c.utmSource, 80),
    utmMedium: textoOpcional(c.utmMedium, 80),
    utmCampaign: textoOpcional(c.utmCampaign, 120),
  };
}

export async function POST(request: Request) {
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  // Filtros anti-spam — sempre 200, nunca 429/403 (bloqueio silencioso)
  const c = (corpo ?? {}) as Record<string, unknown>;
  const honeypotPreenchido =
    typeof c.website === "string" && c.website.trim() !== "";
  const rapidoDemais =
    typeof c.tempoMs !== "number" || c.tempoMs < TEMPO_MINIMO_MS;
  const estourouLimite = !permitido(
    `lead:${ipDoCliente(request.headers)}`,
    LIMITE_POR_IP,
    JANELA_MS
  );

  if (honeypotPreenchido || rapidoDemais || estourouLimite) {
    return NextResponse.json(RESPOSTA_OK);
  }

  const lead = validar(corpo);
  if (!lead) {
    return NextResponse.json(
      { erro: "Campos obrigatórios ausentes ou inválidos" },
      { status: 400 }
    );
  }

  // Registro principal: banco (Postgres). Falha aqui não pode travar a conversão —
  // o cliente já está sendo levado ao WhatsApp.
  try {
    await prisma.lead.create({
      data: {
        nome: lead.nome,
        telefone: lead.whatsapp,
        email: lead.email,
        modeloInteresse: lead.modelo,
        uso: lead.uso,
        horarioPreferido: lead.horario,
        origem: lead.origem ?? "formulario",
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
      },
    });
  } catch {
    // Sem DATABASE_URL (ou banco fora do ar): segue para os destinos reserva.
  }

  // Destinos opcionais de notificação (ver .env.example)
  const webhook = process.env.LEAD_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const emailPara = process.env.LEAD_EMAIL_TO;

  try {
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, data: new Date().toISOString() }),
      });
    } else if (resendKey && emailPara) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Site Full Electric <onboarding@resend.dev>",
          to: [emailPara],
          subject: `Lead do site: ${lead.nome} — ${lead.modelo}`,
          text:
            `Nome: ${lead.nome}\nWhatsApp: ${lead.whatsapp}\n` +
            `E-mail: ${lead.email ?? "—"}\nModelo: ${lead.modelo}\n` +
            `Uso: ${lead.uso}\nHorário para test drive: ${lead.horario}\n` +
            `Origem: ${lead.origem ?? "formulario"}\n` +
            `UTM: ${lead.utmSource ?? "—"} / ${lead.utmMedium ?? "—"} / ${lead.utmCampaign ?? "—"}`,
        }),
      });
    }
  } catch {
    // Notificação é conveniência; o lead já está no banco.
  }

  return NextResponse.json({ ok: true });
}
