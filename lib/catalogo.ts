import modelosJson from "@/content/modelos.json";

/* ------------------------------------------------------------------------ */
/*  Catálogo — content/modelos.json                                          */
/*                                                                           */
/*  Formato tipado: cada spec é um campo com unidade conhecida. `null` nunca */
/*  renderiza — a linha some, sem placeholder (CLAUDE.md §3.6). Modelo novo  */
/*  entra só pelo JSON; o site gera card, /modelos/[slug] e /lp/[slug].      */
/* ------------------------------------------------------------------------ */

export type CategoriaId = "citycoco" | "scooter-urbano" | "scooter-retro" | "fat-bike";

export interface Categoria {
  id: CategoriaId;
  nome: string;
  descricao: string;
}

/**
 * Interruptor do selo "sem CNH / sem placa" (CLAUDE.md §3.1):
 * "SIM" = medido e dentro da Res. CONTRAN 996/2023 → o selo aparece;
 * "PENDENTE" = nada sobre CNH, placa ou emplacamento naquele modelo.
 */
export type AutopropelidoApto = "SIM" | "PENDENTE";

export interface Faixa {
  min: number;
  max: number;
}

export interface Specs {
  /** Descrição livre do motor ("1.000 W brushless traseiro"); se null, a ficha formata `potenciaW` */
  motor: string | null;
  potenciaW: number | null;
  bateria: string | null;
  velocidadeMaxKmh: number | null;
  /** Faixa realista por carga (CLAUDE.md §3.2) — única forma de autonomia que renderiza */
  autonomiaKm: Faixa | null;
  /** Número do fabricante, guardado para referência. NUNCA renderiza. */
  autonomiaDeclaradaKm: string | null;
  recarga: string | null;
  recargaHoras: string | null;
  freios: string | null;
  suspensao: string | null;
  pneus: string | null;
  pesoKg: number | null;
  cargaMaxKg: number | null;
  /** Equipamentos obrigatórios da Res. 996 (velocímetro, campainha, sinalização) */
  equipamentos: string | null;
}

/** Medidas do enquadramento legal. Privadas: validam o "SIM" no build, nunca vão ao site. */
export interface Medidas {
  larguraCm: number | null;
  entreEixosCm: number | null;
  comprimentoCm: number | null;
  alturaCm: number | null;
}

export interface FotoModelo {
  src: string;
  alt: string;
  largura: number;
  altura: number;
  principal?: boolean;
  /** "compliance" = plaqueta visível; "hero" = única landscape. Sem valor = galeria. */
  uso?: "compliance" | "hero";
  /**
   * PNG com fundo transparente (recorte). Sobre seção escura a moto fica
   * solta com o halo, sem moldura. `npm run catalogo:fotos` marca sozinho
   * lendo o canal alpha do arquivo.
   */
  recortada?: boolean;
}

export interface Modelo {
  slug: string;
  /** null = ainda sem nome comercial → não publica */
  nome: string | null;
  marca: string | null;
  categoria: CategoriaId;
  cores: string[];
  destaque: boolean;
  publicado: boolean;
  prontaEntrega: boolean;
  resumo: string | null;
  /** Rótulos de público ("Delivery" liga o card em /para-entregadores) */
  publico: string[];
  autopropelidoApto: AutopropelidoApto;
  /** Só para o CRM (sugestão no cadastro de venda). Nunca em componente público. */
  precoBrl: number | null;
  specs: Specs;
  medidas: Medidas;
  itensDeSerie: string[];
  fotos: FotoModelo[];
  /** Anotações do dono. Não renderizam. */
  pendencias: string[];
}

/** Modelo publicado: nome garantido e ao menos uma foto (validado no build) */
export interface ModeloPublicado extends Modelo {
  nome: string;
  publicado: true;
}

interface CatalogoJson {
  categorias: Categoria[];
  modelos: Modelo[];
}

/* Limites da Res. CONTRAN 996/2023 — espelham content/site.json → legal.criterios */
const LIMITE_996 = { potenciaW: 1000, velocidadeMaxKmh: 32, larguraCm: 70, entreEixosCm: 130 };

const CATEGORIAS_VALIDAS: CategoriaId[] = ["citycoco", "scooter-urbano", "scooter-retro", "fat-bike"];

/*
  Roda uma vez, no primeiro import (build). JSON inconsistente derruba o build
  com mensagem clara — melhor do que publicar um card sem foto ou um selo
  "sem CNH" em moto de 1.500 W.
*/
function validarCatalogo(catalogo: CatalogoJson): CatalogoJson {
  const erros: string[] = [];
  const slugs = new Set<string>();

  for (const m of catalogo.modelos) {
    const id = `modelos.json → "${m.slug}"`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.slug)) erros.push(`${id}: slug inválido`);
    if (slugs.has(m.slug)) erros.push(`${id}: slug repetido`);
    slugs.add(m.slug);

    if (!CATEGORIAS_VALIDAS.includes(m.categoria)) {
      erros.push(`${id}: categoria "${m.categoria}" não existe (${CATEGORIAS_VALIDAS.join(", ")})`);
    }
    if (m.autopropelidoApto !== "SIM" && m.autopropelidoApto !== "PENDENTE") {
      erros.push(`${id}: autopropelidoApto precisa ser "SIM" ou "PENDENTE"`);
    }
    if (m.publicado) {
      if (!m.nome) erros.push(`${id}: publicado sem nome comercial`);
      if (m.fotos.length === 0) erros.push(`${id}: publicado sem foto`);
    }
    const { autonomiaKm } = m.specs;
    if (autonomiaKm && !(autonomiaKm.min < autonomiaKm.max)) {
      erros.push(`${id}: autonomiaKm precisa ser uma faixa {min < max}`);
    }
    if (m.autopropelidoApto === "SIM") {
      const { potenciaW, velocidadeMaxKmh } = m.specs;
      const { larguraCm, entreEixosCm } = m.medidas;
      if (potenciaW !== null && potenciaW > LIMITE_996.potenciaW)
        erros.push(`${id}: "SIM" com ${potenciaW} W (limite ${LIMITE_996.potenciaW} W)`);
      if (velocidadeMaxKmh !== null && velocidadeMaxKmh > LIMITE_996.velocidadeMaxKmh)
        erros.push(`${id}: "SIM" com ${velocidadeMaxKmh} km/h (limite ${LIMITE_996.velocidadeMaxKmh})`);
      if (larguraCm !== null && larguraCm > LIMITE_996.larguraCm)
        erros.push(`${id}: "SIM" com ${larguraCm} cm de largura (limite ${LIMITE_996.larguraCm})`);
      if (entreEixosCm !== null && entreEixosCm > LIMITE_996.entreEixosCm)
        erros.push(`${id}: "SIM" com ${entreEixosCm} cm entre eixos (limite ${LIMITE_996.entreEixosCm})`);
    }
  }

  if (erros.length > 0) {
    throw new Error(`Catálogo inválido:\n- ${erros.join("\n- ")}`);
  }
  return catalogo;
}

const catalogo = validarCatalogo(modelosJson as unknown as CatalogoJson);

export function getCategorias(): Categoria[] {
  return catalogo.categorias;
}

/** Modelos publicados — o único conjunto que o site público conhece */
export function getModelos(): ModeloPublicado[] {
  return catalogo.modelos.filter(
    (m): m is ModeloPublicado => m.publicado && m.nome !== null && m.fotos.length > 0
  );
}

export function getModelo(slug: string): ModeloPublicado | undefined {
  return getModelos().find((m) => m.slug === slug);
}

/** Modelo em destaque da home (herói, OG, tabela legal) */
export function getModeloDestaque(): ModeloPublicado | undefined {
  return getModelos().find((m) => m.destaque) ?? getModelos()[0];
}

/**
 * Catálogo inteiro com nome, publicado ou não — SÓ para o admin (uma moto sem
 * foto no site ainda pode ser vendida no balcão).
 */
export function getModelosCatalogo(): (Modelo & { nome: string })[] {
  return catalogo.modelos.filter((m): m is Modelo & { nome: string } => m.nome !== null);
}

/** Modelos publicados agrupados por categoria, na ordem de `categorias`; categoria vazia some */
export function getModelosPorCategoria(
  modelos: ModeloPublicado[] = getModelos()
): { categoria: Categoria; modelos: ModeloPublicado[] }[] {
  return getCategorias()
    .map((categoria) => ({
      categoria,
      modelos: modelos.filter((m) => m.categoria === categoria.id),
    }))
    .filter((grupo) => grupo.modelos.length > 0);
}

export function nomeCategoria(id: CategoriaId): string {
  return getCategorias().find((c) => c.id === id)?.nome ?? id;
}

export function fotoPrincipal(modelo: Modelo): FotoModelo {
  return modelo.fotos.find((f) => f.principal) ?? modelo.fotos[0];
}

/**
 * Classes da foto sobre fundo escuro: foto de estúdio (fundo branco) vira
 * moldura clara arredondada; recortada (alpha) fica solta, sem moldura.
 */
export function classesFotoNoEscuro(foto: FotoModelo, raio = "rounded-[20px]"): string {
  return foto.recortada ? "drop-shadow-[0_24px_40px_rgba(0,0,0,0.6)]" : raio;
}

/** "Full Electric S60" → "S60"; outros nomes ficam como estão */
export function nomeCurto(modelo: ModeloPublicado): string {
  return modelo.nome.replace(/^Full Electric\s+/, "");
}

/* ---------- Formatação da ficha técnica ---------- */

const numeroBR = new Intl.NumberFormat("pt-BR");

export function formatPotencia(w: number): string {
  return `${numeroBR.format(w)} W`;
}

export function formatAutonomia(faixa: Faixa): string {
  return `${faixa.min} a ${faixa.max} km por carga`;
}

export interface LinhaFicha {
  chave: keyof Specs;
  label: string;
  valor: string;
}

/**
 * Linhas da ficha técnica, só com o que existe — `null` não vira linha.
 * Mesma ordem em todo lugar (card, página, LP).
 */
export function linhasFicha(modelo: Modelo): LinhaFicha[] {
  const s = modelo.specs;
  const linhas: (LinhaFicha | null)[] = [
    s.motor
      ? { chave: "motor", label: "Motor", valor: s.motor }
      : s.potenciaW !== null
        ? { chave: "potenciaW", label: "Motor", valor: formatPotencia(s.potenciaW) }
        : null,
    s.bateria ? { chave: "bateria", label: "Bateria", valor: s.bateria } : null,
    s.velocidadeMaxKmh !== null
      ? { chave: "velocidadeMaxKmh", label: "Velocidade máxima", valor: `${s.velocidadeMaxKmh} km/h` }
      : null,
    s.autonomiaKm
      ? { chave: "autonomiaKm", label: "Autonomia", valor: formatAutonomia(s.autonomiaKm) }
      : null,
    s.recarga ? { chave: "recarga", label: "Recarga", valor: s.recarga } : null,
    s.recargaHoras
      ? { chave: "recargaHoras", label: "Tempo de recarga", valor: `${s.recargaHoras} horas` }
      : null,
    s.freios ? { chave: "freios", label: "Freios", valor: s.freios } : null,
    s.suspensao ? { chave: "suspensao", label: "Suspensão", valor: s.suspensao } : null,
    s.pneus ? { chave: "pneus", label: "Pneus", valor: s.pneus } : null,
    s.pesoKg !== null ? { chave: "pesoKg", label: "Peso", valor: `${s.pesoKg} kg` } : null,
    s.cargaMaxKg !== null
      ? { chave: "cargaMaxKg", label: "Capacidade de carga", valor: `${s.cargaMaxKg} kg` }
      : null,
    s.equipamentos
      ? { chave: "equipamentos", label: "Equipamentos", valor: s.equipamentos }
      : null,
  ];
  return linhas.filter((l): l is LinhaFicha => l !== null);
}

/** Resumo para o card: até 4 linhas, na ordem da ficha */
const CHAVES_DO_CARD: (keyof Specs)[] = ["motor", "potenciaW", "velocidadeMaxKmh", "autonomiaKm", "bateria"];

export function linhasDoCard(modelo: Modelo): LinhaFicha[] {
  return linhasFicha(modelo).filter((l) => CHAVES_DO_CARD.includes(l.chave)).slice(0, 4);
}

/** Nota obrigatória sempre que uma autonomia aparece (CLAUDE.md §3.2) */
export const NOTA_AUTONOMIA =
  "Autonomia varia conforme peso, relevo e condução.";

/* ---------- Enquadramento legal (Res. CONTRAN 996/2023) ---------- */

export const TEXTO_DENTRO_DO_LIMITE = "Dentro do limite legal";

/*
  Liga cada critério de content/site.json → legal.criterios ao valor do
  modelo. Largura, entre-eixos e equipamentos aparecem como "Dentro do limite
  legal" quando o modelo está apto — por decisão do cliente, sem os números.
  Modelo PENDENTE cai no fallback "Aguardando aferição" do componente.
*/
export function valorCriterio(modelo: Modelo, criterioItem: string): string | null {
  const apto = modelo.autopropelidoApto === "SIM";
  const s = modelo.specs;
  switch (criterioItem) {
    case "Potência nominal máxima":
      return s.motor ?? (s.potenciaW !== null ? formatPotencia(s.potenciaW) : null);
    case "Velocidade máxima de fabricação":
      return s.velocidadeMaxKmh !== null ? `${s.velocidadeMaxKmh} km/h` : null;
    case "Largura máxima":
    case "Distância entre eixos":
      return apto ? TEXTO_DENTRO_DO_LIMITE : null;
    case "Equipamentos":
      return s.equipamentos ?? (apto ? TEXTO_DENTRO_DO_LIMITE : null);
    default:
      return null;
  }
}

