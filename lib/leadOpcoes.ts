/*
  Opções compartilhadas entre o formulário público (LeadForm) e o cadastro
  manual do admin — a mesma lista nos dois lugares, para o CRM não ganhar
  grafias diferentes do mesmo modelo.

  Este arquivo é importado por componente de cliente: NÃO importe o catálogo
  aqui (content/modelos.json iria inteiro para o bundle, com preço e medidas).
  A lista de modelos vem do servidor por `opcoesDeModelo()` (lib/opcoesModelo.ts).
*/
export const OPCAO_SEM_MODELO = "Ainda não sei";

export const USOS_OPCOES = ["Ir ao trabalho", "Delivery", "Uso pessoal"] as const;
export type UsoOpcao = (typeof USOS_OPCOES)[number];
