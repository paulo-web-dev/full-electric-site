#!/usr/bin/env node
/*
  Ferramentas do catálogo (content/modelos.json). Sem dependência nova:
  só Node e o `sharp` que o Next já exige.

    npm run catalogo:ficha            gera docs/catalogo/ficha-afericao.pdf
                                      (uma página por modelo PENDENTE) e o
                                      modelo docs/catalogo/afericao.csv
    npm run catalogo:aferir           lê docs/catalogo/afericao.csv preenchido
                                      e atualiza o JSON: "SIM" só em quem passa
                                      nos 4 critérios + equipamentos
    npm run catalogo:fotos            relê largura/altura/alpha de cada foto
    npm run catalogo -- fundir A B    funde o modelo B no modelo A (fotos,
                                      cores, campos vazios) e remove B

  Regras: CLAUDE.md §3.1 e §3.6.
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = path.join(RAIZ, "content", "modelos.json");
const PUBLIC = path.join(RAIZ, "public");
const DOCS = path.join(RAIZ, "docs", "catalogo");
const PDF_PATH = path.join(DOCS, "ficha-afericao.pdf");
const CSV_PATH = path.join(DOCS, "afericao.csv");

/* Limites da Res. CONTRAN 996/2023 — espelham content/site.json → legal.criterios */
const LIMITE = { larguraCm: 70, entreEixosCm: 130, potenciaW: 1000, velocidadeMaxKmh: 32 };
const EQUIPAMENTOS = [
  ["velocimetro", "Velocímetro"],
  ["campainha", "Campainha"],
  ["sinal_dianteira", "Sinalização noturna dianteira"],
  ["sinal_traseira", "Sinalização noturna traseira"],
  ["sinal_lateral", "Sinalização noturna lateral"],
];
const TEXTO_EQUIPAMENTOS =
  "Velocímetro, campainha e sinalização noturna dianteira, traseira e lateral";

const COLUNAS_CSV = [
  "slug", "modelo", "largura_cm", "entre_eixos_cm", "potencia_w", "velocidade_kmh",
  ...EQUIPAMENTOS.map(([k]) => k), "data", "obs",
];

function lerCatalogo() {
  return JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
}
function gravarCatalogo(catalogo) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(catalogo, null, 2) + "\n");
}
function hoje() {
  return new Date().toISOString().slice(0, 10);
}
function falhar(msg) {
  console.error(`Erro: ${msg}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ fotos */

async function sincronizarFotos(catalogo) {
  let n = 0;
  for (const m of catalogo.modelos) {
    for (const f of m.fotos) {
      const abs = path.join(PUBLIC, f.src);
      if (!fs.existsSync(abs)) falhar(`${m.slug}: foto não encontrada — ${f.src}`);
      const meta = await sharp(abs).metadata();
      f.largura = meta.width;
      f.altura = meta.height;
      if (meta.hasAlpha) f.recortada = true;
      else delete f.recortada;
      n++;
    }
  }
  return n;
}

async function cmdFotos() {
  const catalogo = lerCatalogo();
  const n = await sincronizarFotos(catalogo);
  gravarCatalogo(catalogo);
  console.log(`${n} fotos sincronizadas (largura, altura, recortada).`);
}

/* ----------------------------------------------------------------- fundir */

async function cmdFundir(destinoSlug, origemSlug) {
  if (!destinoSlug || !origemSlug) falhar("uso: catalogo fundir <destino> <origem>");
  const catalogo = lerCatalogo();
  const destino = catalogo.modelos.find((m) => m.slug === destinoSlug);
  const origem = catalogo.modelos.find((m) => m.slug === origemSlug);
  if (!destino) falhar(`modelo "${destinoSlug}" não existe`);
  if (!origem) falhar(`modelo "${origemSlug}" não existe`);

  // Campos vazios do destino recebem os da origem; o destino nunca perde nada
  for (const grupo of ["specs", "medidas"]) {
    for (const [k, v] of Object.entries(origem[grupo] ?? {})) {
      if (destino[grupo][k] === null && v !== null) destino[grupo][k] = v;
    }
  }
  for (const k of ["marca", "resumo", "precoBrl"]) {
    if (destino[k] === null && origem[k] !== null) destino[k] = origem[k];
  }
  destino.cores = [...new Set([...destino.cores, ...origem.cores])];
  destino.publico = [...new Set([...destino.publico, ...origem.publico])];
  destino.itensDeSerie = [...new Set([...destino.itensDeSerie, ...origem.itensDeSerie])];

  // Fotos: arquivos vão para a pasta do destino; alt troca o nome
  const pastaDestino = path.join(PUBLIC, "images", "modelos", destinoSlug);
  fs.mkdirSync(pastaDestino, { recursive: true });
  for (const f of origem.fotos) {
    const de = path.join(PUBLIC, f.src);
    const para = path.join(pastaDestino, path.basename(f.src));
    if (fs.existsSync(de) && de !== para) fs.renameSync(de, para);
    f.src = `/images/modelos/${destinoSlug}/${path.basename(f.src)}`;
    if (origem.nome && destino.nome) f.alt = f.alt.replace(origem.nome, destino.nome);
    delete f.principal; // a principal continua sendo a do destino
    destino.fotos.push(f);
  }
  const pastaOrigem = path.join(PUBLIC, "images", "modelos", origemSlug);
  if (fs.existsSync(pastaOrigem) && fs.readdirSync(pastaOrigem).length === 0) {
    fs.rmdirSync(pastaOrigem);
  }

  destino.pendencias = [
    ...destino.pendencias,
    `Fundido com "${origem.nome ?? origemSlug}" em ${hoje()}`,
    ...origem.pendencias.map((p) => `[${origemSlug}] ${p}`),
  ];

  catalogo.modelos = catalogo.modelos.filter((m) => m !== origem);
  await sincronizarFotos(catalogo);
  gravarCatalogo(catalogo);
  console.log(
    `"${origemSlug}" fundido em "${destinoSlug}": ${destino.fotos.length} fotos, cores: ${destino.cores.join(", ")}.`
  );
  console.log("Revise `pendencias` e `cores` do destino e rode npm run build.");
}

/* ------------------------------------------------------------------ aferir */

function lerCsv(texto) {
  const linhas = texto.replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "");
  if (linhas.length === 0) falhar("CSV vazio");
  const sep = (linhas[0].match(/;/g) ?? []).length >= (linhas[0].match(/,/g) ?? []).length ? ";" : ",";
  const cab = linhas[0].split(sep).map((c) => c.trim());
  return linhas.slice(1).map((l) => {
    const cels = l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(cab.map((c, i) => [c, cels[i] ?? ""]));
  });
}
function numero(v) {
  if (v === undefined || v === "") return null;
  const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function sim(v) {
  return /^(s|sim|x|1|ok|true)$/i.test(String(v).trim());
}

function cmdAferir(csvPath = CSV_PATH) {
  if (!fs.existsSync(csvPath)) falhar(`não achei ${csvPath} — rode npm run catalogo:ficha primeiro`);
  const catalogo = lerCatalogo();
  const linhas = lerCsv(fs.readFileSync(csvPath, "utf8"));
  const resumo = [];

  for (const linha of linhas) {
    const m = catalogo.modelos.find((x) => x.slug === linha.slug);
    if (!m) {
      resumo.push([linha.slug, "?", "slug não existe no JSON"]);
      continue;
    }
    const largura = numero(linha.largura_cm);
    const entreEixos = numero(linha.entre_eixos_cm);
    const potencia = numero(linha.potencia_w);
    const velocidade = numero(linha.velocidade_kmh);
    if ([largura, entreEixos, potencia, velocidade].some((v) => v === null)) {
      resumo.push([m.slug, m.autopropelidoApto, "linha incompleta — não alterado"]);
      continue;
    }
    const equipamentosOk = EQUIPAMENTOS.every(([k]) => sim(linha[k]));
    const fora = [];
    if (largura > LIMITE.larguraCm) fora.push(`largura ${largura} > ${LIMITE.larguraCm} cm`);
    if (entreEixos > LIMITE.entreEixosCm) fora.push(`entre-eixos ${entreEixos} > ${LIMITE.entreEixosCm} cm`);
    if (potencia > LIMITE.potenciaW) fora.push(`potência ${potencia} > ${LIMITE.potenciaW} W`);
    if (velocidade > LIMITE.velocidadeMaxKmh) fora.push(`velocidade ${velocidade} > ${LIMITE.velocidadeMaxKmh} km/h`);
    if (!equipamentosOk) {
      const faltam = EQUIPAMENTOS.filter(([k]) => !sim(linha[k])).map(([, r]) => r.toLowerCase());
      fora.push(`equipamentos: ${faltam.join(", ")}`);
    }

    m.medidas.larguraCm = largura;
    m.medidas.entreEixosCm = entreEixos;
    m.specs.potenciaW = potencia;
    m.specs.velocidadeMaxKmh = velocidade;
    m.specs.equipamentos = equipamentosOk ? TEXTO_EQUIPAMENTOS : null;
    m.autopropelidoApto = fora.length === 0 ? "SIM" : "PENDENTE";

    const data = linha.data || hoje();
    const nota =
      `Aferido em ${data}: ${largura} cm de largura, ${entreEixos} cm entre eixos, ` +
      `${potencia} W, ${velocidade} km/h — ${m.autopropelidoApto}` +
      (fora.length ? ` (${fora.join("; ")})` : "") +
      (linha.obs ? `. Obs.: ${linha.obs}` : "");
    m.pendencias = [...m.pendencias.filter((p) => !p.startsWith("Aferido em ")), nota];
    resumo.push([m.slug, m.autopropelidoApto, fora.length ? fora.join("; ") : "dentro dos 4 limites + equipamentos"]);
  }

  gravarCatalogo(catalogo);
  const larg = Math.max(...resumo.map((r) => r[0].length));
  for (const [slug, apto, obs] of resumo) console.log(`${slug.padEnd(larg)}  ${apto.padEnd(8)}  ${obs}`);
  console.log("\nJSON atualizado. Rode npm run build para validar e publicar.");
}

/* ------------------------------------------------------------- ficha (PDF) */

/* Escritor de PDF mínimo: Helvetica (WinAnsi), retângulos, linhas e JPEG. */
const CP1252 = { "€": 0x80, "…": 0x85, "–": 0x96, "—": 0x97, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95 };
function winAnsi(texto) {
  const bytes = [];
  for (const ch of texto) {
    const c = ch.codePointAt(0);
    if (c < 0x80 || (c >= 0xa0 && c <= 0xff)) bytes.push(c);
    else if (CP1252[ch] !== undefined) bytes.push(CP1252[ch]);
    else bytes.push(0x3f);
  }
  return Buffer.from(bytes);
}
function pdfString(texto) {
  const b = winAnsi(texto);
  let s = "";
  for (const byte of b) {
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) s += "\\" + String.fromCharCode(byte);
    else if (byte < 0x20 || byte > 0x7e) s += "\\" + byte.toString(8).padStart(3, "0");
    else s += String.fromCharCode(byte);
  }
  return `(${s})`;
}
/* Larguras aproximadas de Helvetica (por 1000 em) para alinhar à direita e quebrar linha */
function larguraTexto(texto, tamanho, bold = false) {
  let w = 0;
  for (const ch of texto) {
    if (/[ilj.,:;'|!]/.test(ch)) w += 278;
    else if (/[mwMW]/.test(ch)) w += bold ? 889 : 833;
    else if (/[A-Z]/.test(ch)) w += bold ? 722 : 667;
    else if (/[0-9]/.test(ch)) w += 556;
    else if (ch === " ") w += 278;
    else w += bold ? 574 : 540;
  }
  return (w * tamanho) / 1000;
}
function quebrar(texto, tamanho, maxLargura) {
  const linhas = [];
  let atual = "";
  for (const palavra of texto.split(" ")) {
    const tent = atual ? `${atual} ${palavra}` : palavra;
    if (larguraTexto(tent, tamanho) > maxLargura && atual) {
      linhas.push(atual);
      atual = palavra;
    } else atual = tent;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

class Pagina {
  constructor() {
    this.ops = [];
    this.imagem = null; // { nome, buffer, largura, altura }
  }
  texto(x, y, s, { tamanho = 11, bold = false, cor = "0 0 0", alinhar = "esq" } = {}) {
    let px = x;
    if (alinhar === "dir") px = x - larguraTexto(s, tamanho, bold);
    if (alinhar === "centro") px = x - larguraTexto(s, tamanho, bold) / 2;
    this.ops.push(`BT ${cor} rg /${bold ? "F2" : "F1"} ${tamanho} Tf ${px.toFixed(2)} ${y.toFixed(2)} Td ${pdfString(s)} Tj ET`);
  }
  paragrafo(x, y, s, largura, { tamanho = 10, bold = false, cor = "0 0 0", entrelinha = 1.35 } = {}) {
    let yy = y;
    for (const l of quebrar(s, tamanho, largura)) {
      this.texto(x, yy, l, { tamanho, bold, cor });
      yy -= tamanho * entrelinha;
    }
    return yy;
  }
  retangulo(x, y, w, h, { espessura = 0.8, cor = "0 0 0", preencher = null } = {}) {
    if (preencher) this.ops.push(`${preencher} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
    this.ops.push(`${espessura} w ${cor} RG ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
  }
  linha(x1, y1, x2, y2, { espessura = 0.6, cor = "0 0 0" } = {}) {
    this.ops.push(`${espessura} w ${cor} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }
  caixa(x, y, lado = 11) {
    this.retangulo(x, y, lado, lado, { espessura: 0.9 });
  }
  jpeg(buffer, largura, altura, x, y, w, h) {
    this.imagem = { buffer, largura, altura };
    this.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im1 Do Q`);
  }
}

function montarPdf(paginas) {
  const objetos = []; // Buffers, índice+1 = número do objeto
  const add = (buf) => {
    objetos.push(Buffer.isBuffer(buf) ? buf : Buffer.from(buf, "latin1"));
    return objetos.length;
  };
  const fonteReg = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fonteBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pagesId = objetos.length + 1;
  objetos.push(null); // reservado para /Pages
  const idsPaginas = [];
  for (const p of paginas) {
    let imId = null;
    if (p.imagem) {
      const { buffer, largura, altura } = p.imagem;
      const cab = `<< /Type /XObject /Subtype /Image /Width ${largura} /Height ${altura} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${buffer.length} >>\nstream\n`;
      imId = add(Buffer.concat([Buffer.from(cab, "latin1"), buffer, Buffer.from("\nendstream", "latin1")]));
    }
    const conteudo = Buffer.from(p.ops.join("\n"), "latin1");
    const contId = add(Buffer.concat([Buffer.from(`<< /Length ${conteudo.length} >>\nstream\n`, "latin1"), conteudo, Buffer.from("\nendstream", "latin1")]));
    const recursos = `/Resources << /Font << /F1 ${fonteReg} 0 R /F2 ${fonteBold} 0 R >>${imId ? ` /XObject << /Im1 ${imId} 0 R >>` : ""} >>`;
    idsPaginas.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] ${recursos} /Contents ${contId} 0 R >>`));
  }
  objetos[pagesId - 1] = Buffer.from(`<< /Type /Pages /Kids [${idsPaginas.map((i) => `${i} 0 R`).join(" ")}] /Count ${idsPaginas.length} >>`, "latin1");
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  const partes = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1")];
  const offsets = [];
  let pos = partes[0].length;
  objetos.forEach((obj, i) => {
    offsets.push(pos);
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, "latin1"), obj, Buffer.from("\nendobj\n", "latin1")]);
    partes.push(b);
    pos += b.length;
  });
  const xrefPos = pos;
  let xref = `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) xref += `${String(o).padStart(10, "0")} 00000 n \n`;
  xref += `trailer\n<< /Size ${objetos.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  partes.push(Buffer.from(xref, "latin1"));
  return Buffer.concat(partes);
}

const A4 = { w: 595.28, h: 841.89 };
const MARGEM = 48;
const LIME = "0.82 0.99 0.07";
const CINZA = "0.35 0.37 0.35";
const CINZA_CLARO = "0.93 0.94 0.92";

async function paginaDoModelo(m, indice, total) {
  const p = new Pagina();
  const nome = m.nome ?? `(sem nome) ${m.slug}`;
  let y = A4.h - MARGEM;

  // Cabeçalho
  p.retangulo(MARGEM, y - 6, A4.w - 2 * MARGEM, 3, { espessura: 0, preencher: LIME });
  p.texto(MARGEM, y - 26, "FICHA DE AFERIÇÃO — Res. CONTRAN 996/2023", { tamanho: 10, bold: true, cor: CINZA });
  p.texto(A4.w - MARGEM, y - 26, `Full Electric · ${indice}/${total}`, { tamanho: 10, cor: CINZA, alinhar: "dir" });
  y -= 56;

  // Nome + foto
  const fotoW = 150;
  const fotoH = 188;
  const fotoX = A4.w - MARGEM - fotoW;
  const fotoY = y - fotoH + 14;
  const principal = m.fotos.find((f) => f.principal) ?? m.fotos[0];
  if (principal) {
    const abs = path.join(PUBLIC, principal.src);
    const jpg = await sharp(abs).flatten({ background: "#ffffff" }).resize({ width: 600, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    const meta = await sharp(jpg).metadata();
    const prop = meta.width / meta.height;
    let w = fotoW, h = fotoW / prop;
    if (h > fotoH) { h = fotoH; w = fotoH * prop; }
    p.retangulo(fotoX, fotoY, fotoW, fotoH, { espessura: 0.6, cor: CINZA, preencher: CINZA_CLARO });
    p.jpeg(jpg, meta.width, meta.height, fotoX + (fotoW - w) / 2, fotoY + (fotoH - h) / 2, w, h);
  } else {
    p.retangulo(fotoX, fotoY, fotoW, fotoH, { espessura: 0.6, cor: CINZA, preencher: CINZA_CLARO });
    p.texto(fotoX + fotoW / 2, fotoY + fotoH / 2 - 4, "sem foto", { tamanho: 10, cor: CINZA, alinhar: "centro" });
  }

  const colW = fotoX - MARGEM - 24;
  const nomeTam = larguraTexto(nome, 24, true) > colW ? 18 : 24;
  p.texto(MARGEM, y, nome, { tamanho: nomeTam, bold: true });
  y -= 18;
  p.texto(MARGEM, y, `slug: ${m.slug}`, { tamanho: 9, cor: CINZA });
  y -= 16;
  const detalhes = [];
  if (m.marca) detalhes.push(`Marca: ${m.marca}`);
  if (m.cores.length) detalhes.push(`Cores: ${m.cores.join(", ")}`);
  detalhes.push(`Estado atual: ${m.autopropelidoApto}${m.publicado ? " · publicado" : " · não publicado"}`);
  for (const d of detalhes) {
    y = p.paragrafo(MARGEM, y, d, colW, { tamanho: 10 });
  }
  const jaSabe = [];
  if (m.specs.potenciaW !== null) jaSabe.push(`potência ${m.specs.potenciaW} W`);
  if (m.specs.velocidadeMaxKmh !== null) jaSabe.push(`${m.specs.velocidadeMaxKmh} km/h`);
  if (m.medidas.larguraCm !== null) jaSabe.push(`largura ${m.medidas.larguraCm} cm`);
  if (m.medidas.entreEixosCm !== null) jaSabe.push(`entre-eixos ${m.medidas.entreEixosCm} cm`);
  if (jaSabe.length) {
    y -= 4;
    y = p.paragrafo(MARGEM, y, `Catálogo diz: ${jaSabe.join(" · ")} — confira na moto mesmo assim.`, colW, { tamanho: 9, cor: CINZA });
  }
  y = Math.min(y, fotoY) - 26;

  // Medidas
  p.texto(MARGEM, y, "1. Medidas e plaqueta", { tamanho: 13, bold: true });
  y -= 10;
  const linhas = [
    ["Largura (ponto mais largo, guidão incluído)", `limite ${LIMITE.larguraCm} cm`, "cm"],
    ["Entre-eixos (centro a centro das rodas)", `limite ${LIMITE.entreEixosCm} cm`, "cm"],
    ["Potência nominal (plaqueta do motor)", `limite ${LIMITE.potenciaW} W`, "W"],
    ["Velocidade máxima (plaqueta ou manual)", `limite ${LIMITE.velocidadeMaxKmh} km/h`, "km/h"],
  ];
  const altLinha = 40;
  const campoX = A4.w - MARGEM - 150;
  for (const [rotulo, limite, unidade] of linhas) {
    y -= altLinha;
    p.retangulo(MARGEM, y, A4.w - 2 * MARGEM, altLinha, { espessura: 0.5, cor: "0.7 0.7 0.7" });
    p.texto(MARGEM + 10, y + 22, rotulo, { tamanho: 10.5 });
    p.texto(MARGEM + 10, y + 9, limite, { tamanho: 9, cor: CINZA });
    p.retangulo(campoX, y + 8, 90, 24, { espessura: 0.9 });
    p.texto(campoX + 96, y + 15, unidade, { tamanho: 10 });
    p.caixa(campoX + 122, y + 14);
    p.texto(campoX + 136, y + 15, "OK", { tamanho: 8, cor: CINZA });
  }
  y -= 30;

  // Equipamentos
  p.texto(MARGEM, y, "2. Equipamentos obrigatórios (marque só o que a moto tem)", { tamanho: 13, bold: true });
  y -= 22;
  for (const [, rotulo] of EQUIPAMENTOS) {
    p.caixa(MARGEM + 2, y - 2, 12);
    p.texto(MARGEM + 22, y, rotulo, { tamanho: 10.5 });
    y -= 20;
  }
  y -= 10;

  // Observações
  p.texto(MARGEM, y, "3. Observações (cor, série, dúvida na plaqueta, foto tirada?)", { tamanho: 13, bold: true });
  y -= 22;
  for (let i = 0; i < 3; i++) {
    p.linha(MARGEM, y, A4.w - MARGEM, y, { espessura: 0.5, cor: "0.6 0.6 0.6" });
    y -= 20;
  }
  y -= 14;

  // Data e assinatura
  const meio = A4.w / 2;
  p.linha(MARGEM, y, meio - 20, y);
  p.texto(MARGEM, y - 12, "Data", { tamanho: 9, cor: CINZA });
  p.linha(meio + 20, y, A4.w - MARGEM, y);
  p.texto(meio + 20, y - 12, "Assinatura de quem mediu", { tamanho: 9, cor: CINZA });

  // Rodapé
  const rodape =
    "Depois: digite os números na linha deste modelo em docs/catalogo/afericao.csv e rode " +
    "npm run catalogo:aferir. O selo “sem CNH” só liga se os 4 limites e os 5 equipamentos passarem.";
  p.paragrafo(MARGEM, MARGEM + 12, rodape, A4.w - 2 * MARGEM, { tamanho: 8, cor: CINZA });
  return p;
}

async function cmdFicha() {
  const catalogo = lerCatalogo();
  const pendentes = catalogo.modelos.filter((m) => m.autopropelidoApto !== "SIM");
  if (pendentes.length === 0) falhar("nenhum modelo PENDENTE — nada a aferir");
  fs.mkdirSync(DOCS, { recursive: true });

  const paginas = [];
  for (const [i, m] of pendentes.entries()) paginas.push(await paginaDoModelo(m, i + 1, pendentes.length));
  fs.writeFileSync(PDF_PATH, montarPdf(paginas));

  if (!fs.existsSync(CSV_PATH)) {
    const linhas = [COLUNAS_CSV.join(";")];
    for (const m of pendentes) {
      linhas.push([m.slug, m.nome ?? "", "", "", "", "", "", "", "", "", "", "", ""].join(";"));
    }
    fs.writeFileSync(CSV_PATH, linhas.join("\n") + "\n");
    console.log(`Modelo do CSV criado: ${path.relative(RAIZ, CSV_PATH)}`);
  } else {
    console.log(`CSV já existe, mantido: ${path.relative(RAIZ, CSV_PATH)}`);
  }
  console.log(`PDF com ${pendentes.length} página(s): ${path.relative(RAIZ, PDF_PATH)}`);
  for (const m of pendentes) console.log(`  - ${m.nome ?? "(sem nome)"} [${m.slug}]`);
}

/* -------------------------------------------------------------------- main */

const [comando, ...args] = process.argv.slice(2);
switch (comando) {
  case "ficha":
    await cmdFicha();
    break;
  case "aferir":
    cmdAferir(args[0] ? path.resolve(args[0]) : undefined);
    break;
  case "fotos":
    await cmdFotos();
    break;
  case "fundir":
    await cmdFundir(args[0], args[1]);
    break;
  default:
    console.log("uso: node scripts/catalogo.mjs <ficha|aferir [csv]|fotos|fundir <destino> <origem>>");
    process.exit(comando ? 1 : 0);
}
