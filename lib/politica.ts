/*
  Versão vigente da Política de Privacidade — a data ISO da última alteração.
  Fonte única: a página /politica-de-privacidade exibe esta data, e todo
  registro de consentimento (Consentimento.textoVersao) grava esta string,
  para se saber com que texto a pessoa concordou. Mudou a política → mude
  aqui, na mesma tarefa (CLAUDE.md §3.7).
*/
export const POLITICA_VERSAO = "2026-08-28";

/* "28 de agosto de 2026", para a página */
export function politicaVersaoPorExtenso(): string {
  return new Date(`${POLITICA_VERSAO}T12:00:00-03:00`).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
