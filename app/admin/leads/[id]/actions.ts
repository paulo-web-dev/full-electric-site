"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { COOKIE_SESSAO, tokenValido } from "@/lib/adminAuth";
import { ehStatusValido, dataDeSaoPaulo, hojeEmSaoPaulo } from "@/lib/crm";

/* O middleware já barra sem sessão; este é o cinto e suspensório. */
async function exigirSessao(): Promise<void> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!(await tokenValido(token, process.env.SESSION_SECRET))) {
    redirect("/admin/login");
  }
}

export async function atualizarStatus(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !ehStatusValido(status)) return;

  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/leads/${id}`);
}

export async function definirProximoContato(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  const valor = String(formData.get("proximoContato") ?? "");
  if (!id) return;

  const data = valor ? dataDeSaoPaulo(valor) : null;
  await prisma.lead.update({
    where: { id },
    data: { proximoContatoEm: data },
  });
  revalidatePath(`/admin/leads/${id}`);
}

export async function adicionarNota(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  const texto = String(formData.get("texto") ?? "")
    .trim()
    .slice(0, 2000);
  if (!id || !texto) return;

  await prisma.nota.create({ data: { leadId: id, texto } });
  revalidatePath(`/admin/leads/${id}`);
}

export async function salvarVenda(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const valorBruto = String(formData.get("valorVenda") ?? "").replace(",", ".");
  const dataBruta = String(formData.get("dataVenda") ?? "");

  const valor = valorBruto ? Number(valorBruto) : null;
  if (valor !== null && (Number.isNaN(valor) || valor < 0)) return;

  // <input type="date"> → meio-dia em São Paulo, para não escorregar de dia no fuso.
  // Sem data mas com valor: assume hoje, senão a venda nunca entra na soma do mês.
  const dataInformada = /^\d{4}-\d{2}-\d{2}$/.test(dataBruta)
    ? dataBruta
    : valor !== null
      ? hojeEmSaoPaulo()
      : null;
  const data = dataInformada
    ? new Date(`${dataInformada}T12:00:00-03:00`)
    : null;

  await prisma.lead.update({
    where: { id },
    data: { valorVenda: valor, dataVenda: data },
  });
  revalidatePath(`/admin/leads/${id}`);
}

export async function excluirLead(formData: FormData): Promise<void> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Exclusão definitiva (direito de eliminação — LGPD art. 18). Notas caem em cascata.
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}
