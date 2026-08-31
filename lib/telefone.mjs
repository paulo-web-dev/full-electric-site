/*
  Normalização de telefone BR — fonte única, em .mjs de propósito: é usada
  tanto pelo código TypeScript do site (via reexport em lib/crm.ts) quanto
  por scripts/enriquecer-leads.mjs, que roda com `node` puro e não importa
  TypeScript. Os tipos vêm do JSDoc (allowJs no tsconfig).
*/

/**
 * Chave de comparação: só dígitos, sem o +55 (10 ou 11 dígitos nacionais).
 * @param {string} valor
 * @returns {string}
 */
export function telefoneChave(valor) {
  const digitos = valor.replace(/\D/g, "");
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    return digitos.slice(2);
  }
  return digitos;
}

/**
 * Máscara BR de telefone: (41) 98888-1253
 * @param {string} valor
 * @returns {string}
 */
export function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
