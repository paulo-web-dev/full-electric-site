"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { COOKIE_SESSAO, tokenValido } from "@/lib/adminAuth";
import {
  ehStatusValido,
  ehMotivoValido,
  ehOrigemManual,
  ehComoConheceuValido,
  dataDeSaoPaulo,
  diaDeSaoPaulo,
  hojeEmSaoPaulo,
  formatarTelefone,
} from "@/lib/crm";

/* O middleware já barra sem sessão; este é o cinto e suspensório. */
async function exigirSessao(): Promise<void> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!(await tokenValido(token, process.env.SESSION_SECRET))) {
    redirect("/admin/login");
  }
}

/* Painel, lista e ficha mostram o mesmo lead — invalida os três */
function revalidar(id?: string): void {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  if (id) revalidatePath(`/admin/leads/${id}`);
}

function texto(valor: FormDataEntryValue | null, max: number): string {
  return String(valor ?? "")
    .trim()
    .slice(0, max);
}

/* Só aceita voltar para dentro do admin — nunca para URL externa */
function destinoSeguro(valor: FormDataEntryValue | null, padrao: string): string {
  const v = String(valor ?? "");
  return /^\/admin(\/|\?|$)/.test(v) ? v : padrao;
}

function valorMonetario(bruto: string): number | null {
  if (!bruto) return null;
  const n = Number(bruto.replace(/\./g, "").replace(",", "."));
  return Number.isNaN(n) || n < 0 ? null : n;
}

/* ---------- Cadastro manual (balcão, telefone, indicação) ---------- */
export async function criarLead(formData: FormData): Promise<void> {
  await exigirSessao();

  const nome = texto(formData.get("nome"), 120);
  const telefone = formatarTelefone(texto(formData.get("telefone"), 20));
  const email = texto(formData.get("email"), 160) || null;
  const modeloInteresse = texto(formData.get("modeloInteresse"), 60);
  const uso = texto(formData.get("uso"), 60);
  const origemBruta = texto(formData.get("origem"), 40);
  const comoConheceu = texto(formData.get("comoConheceu"), 30);
  const observacao = texto(formData.get("observacao"), 2000);

  if (!nome || telefone.replace(/\D/g, "").length < 10) return;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
  if (!modeloInteresse || !uso) return;

  const lead = await prisma.lead.create({
    data: {
      nome,
      telefone,
      email,
      modeloInteresse,
      uso,
      horarioPreferido: null,
      origem: ehOrigemManual(origemBruta) ? origemBruta : "OUTRO",
      comoConheceu: ehComoConheceuValido(comoConheceu) ? comoConheceu : null,
      notas: observacao ? { create: { texto: observacao } } : undefined,
    },
  });

  revalidar(lead.id);
  redirect(`/admin/leads/${lead.id}`);
}

/* ---------- Movimento de status (com os dados que o destino exige) ---------- */
export async function moverLead(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = texto(formData.get("id"), 40);
  const status = texto(formData.get("status"), 40);
  if (!id || !ehStatusValido(status)) return;

  const data: Prisma.LeadUpdateInput = { status };

  if (status === "TEST_DRIVE_AGENDADO") {
    const quando = dataDeSaoPaulo(texto(formData.get("proximoContato"), 20));
    if (!quando) return;
    data.proximoContatoEm = quando;
  }

  if (status === "VENDIDO") {
    const valor = valorMonetario(texto(formData.get("valorVenda"), 20));
    if (valor === null) return;
    const dia = texto(formData.get("dataVenda"), 10) || hojeEmSaoPaulo();
    const dataVenda = diaDeSaoPaulo(dia);
    if (!dataVenda) return;
    data.valorVenda = valor;
    data.dataVenda = dataVenda;
    data.modeloVendido = texto(formData.get("modeloVendido"), 60) || null;
    data.proximoContatoEm = null;
    data.motivoPerda = null;
    data.motivoPerdaDetalhe = null;
  }

  if (status === "PERDIDO") {
    const motivo = texto(formData.get("motivoPerda"), 20);
    if (!ehMotivoValido(motivo)) return;
    data.motivoPerda = motivo;
    data.motivoPerdaDetalhe = texto(formData.get("motivoPerdaDetalhe"), 300) || null;
    data.proximoContatoEm = null;
  }

  // Reabriu um lead perdido: o motivo antigo deixa de valer
  if (status !== "PERDIDO") {
    data.motivoPerda = null;
    data.motivoPerdaDetalhe = null;
  }

  await prisma.lead.update({ where: { id }, data });
  revalidar(id);

  const voltar = formData.get("voltar");
  if (voltar) redirect(destinoSeguro(voltar, `/admin/leads/${id}`));
}

/* ---------- Edições pontuais na ficha ---------- */
export async function definirProximoContato(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = texto(formData.get("id"), 40);
  const valor = texto(formData.get("proximoContato"), 20);
  if (!id) return;

  await prisma.lead.update({
    where: { id },
    data: { proximoContatoEm: valor ? dataDeSaoPaulo(valor) : null },
  });
  revalidar(id);
}

export async function adicionarNota(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = texto(formData.get("id"), 40);
  const conteudo = texto(formData.get("texto"), 2000);
  if (!id || !conteudo) return;

  await prisma.nota.create({ data: { leadId: id, texto: conteudo } });
  revalidar(id);
}

export async function salvarVenda(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = texto(formData.get("id"), 40);
  if (!id) return;

  const bruto = texto(formData.get("valorVenda"), 20);
  const valor = valorMonetario(bruto);
  if (bruto && valor === null) return;

  // Sem data mas com valor: assume hoje, senão a venda nunca entra na soma do mês.
  const dia = texto(formData.get("dataVenda"), 10);
  const dataVenda = dia
    ? diaDeSaoPaulo(dia)
    : valor !== null
      ? diaDeSaoPaulo(hojeEmSaoPaulo())
      : null;

  await prisma.lead.update({
    where: { id },
    data: {
      valorVenda: valor,
      dataVenda,
      modeloVendido: texto(formData.get("modeloVendido"), 60) || null,
    },
  });
  revalidar(id);
}

export async function salvarComoConheceu(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = texto(formData.get("id"), 40);
  const valor = texto(formData.get("comoConheceu"), 30);
  if (!id) return;

  await prisma.lead.update({
    where: { id },
    data: { comoConheceu: ehComoConheceuValido(valor) ? valor : null },
  });
  revalidar(id);
}

export async function salvarMotivoPerda(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = texto(formData.get("id"), 40);
  const motivo = texto(formData.get("motivoPerda"), 20);
  if (!id || !ehMotivoValido(motivo)) return;

  await prisma.lead.update({
    where: { id },
    data: {
      motivoPerda: motivo,
      motivoPerdaDetalhe: texto(formData.get("motivoPerdaDetalhe"), 300) || null,
    },
  });
  revalidar(id);
}

export async function excluirLead(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = texto(formData.get("id"), 40);
  if (!id) return;

  // Exclusão definitiva (direito de eliminação — LGPD art. 18). Notas caem em cascata.
  await prisma.lead.delete({ where: { id } });
  revalidar();
  redirect("/admin/leads");
}
