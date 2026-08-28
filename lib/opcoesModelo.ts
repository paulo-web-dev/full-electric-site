import { getModelos, getModelosCatalogo } from "@/lib/catalogo";
import { OPCAO_SEM_MODELO } from "@/lib/leadOpcoes";

/*
  Lista "Modelo de interesse" — calculada no servidor e passada como prop ao
  LeadForm, para o catálogo não ir ao bundle do navegador.
*/

/** Formulário público: só modelos publicados */
export function opcoesDeModelo(): string[] {
  return [...getModelos().map((m) => m.nome), OPCAO_SEM_MODELO];
}

/** Admin: o catálogo inteiro com nome — moto sem foto no site ainda vende no balcão */
export function opcoesDeModeloAdmin(): string[] {
  return [...getModelosCatalogo().map((m) => m.nome), OPCAO_SEM_MODELO];
}
