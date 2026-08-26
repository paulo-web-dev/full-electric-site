import { getModelos } from "@/lib/content";

/*
  Opções compartilhadas entre o formulário público (LeadForm) e o cadastro
  manual do admin — a mesma lista nos dois lugares, para o CRM não ganhar
  grafias diferentes do mesmo modelo.
*/
export const MODELOS_OPCOES: string[] = [
  ...getModelos().map((m) => m.nome),
  "Ainda não sei",
];

export const USOS_OPCOES = ["Ir ao trabalho", "Delivery", "Uso pessoal"] as const;
export type UsoOpcao = (typeof USOS_OPCOES)[number];
