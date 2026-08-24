# Identidade visual — Full Electric

## Origem
A paleta vem do logo (`public/brand/logo-full-electric.jpg`): círculo preto,
verde-limão vivo, tipografia branca. Os **padrões de layout e componente** vêm
do site da Unyflex Digital (mesmo grupo).

Ou seja: **estrutura da Unyflex + cor da Full Electric.**

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `--lime-400` | `#D2FC13` | Botão primário (fundo), ícones, destaques sobre escuro |
| `--lime-500` | `#B8E01A` | Hover, bordas, eyebrow sobre escuro |
| `--lime-600` | `#8FB50D` | Único verde aceitável como texto sobre fundo claro |
| `--ink` | `#0A0B0A` | Fundo escuro, texto principal no claro |
| `--surface` | `#141613` | Cards sobre fundo escuro |
| `--line` | `#262925` | Divisórias no escuro |
| `--paper` | `#FFFFFF` | Fundo claro |
| `--muted` | `#F4F6F3` | Seção clara alternada |
| `--text-2` | `#5A5F58` | Texto secundário no claro |
| `--text-3` | `#9AA096` | Texto secundário no escuro |
| `--unyflex-blue` | `#00A3FF` | Só no selo "empresa do grupo" |

### A regra que mais se erra
`#D2FC13` sobre branco dá contraste ~1.3:1. É ilegível e reprova em qualquer
auditoria de acessibilidade.

- ✅ Verde de fundo, texto preto em cima
- ✅ Verde de texto sobre preto
- ❌ Verde de texto sobre branco

## Tipografia
Inter, via `next/font/google`. Pesos 400 / 500 / 600 / 800.

| Papel | Tamanho | Peso | Tracking |
|---|---|---|---|
| H1 | 44–60px | 800 | -0.03em |
| H2 | 32–40px | 800 | -0.025em |
| H3 | 20–24px | 600 | -0.01em |
| Corpo | 16–18px | 400 | 0 |
| Eyebrow | 12px | 600 | 0.14em, uppercase |
| Botão | 15px | 600 | 0 |

## Componentes herdados da Unyflex

1. **Herói:** badge de credibilidade → h1 com trecho destacado → parágrafo →
   dois CTAs lado a lado (primário + WhatsApp) → linha de 3 chips com ✓
2. **Grid de produtos:** cards com imagem, rótulo de categoria, título, specs
   curtas, preço e dois botões (detalhes + adicionar/falar)
3. **Barra de números:** 4 métricas grandes em linha
4. **"Você se identifica?":** grid 3×2 de dor → solução
5. **"Como funciona":** 4 passos numerados
6. **Prova social:** estrelas + citação + avatar com iniciais
7. **FAQ:** accordion
8. **CTA final** com chips de garantia
9. **Rodapé:** 3–4 colunas + selo institucional

## Fotografia
Fundo de estúdio branco. Em seções escuras, aplicar halo radial suave atrás do
veículo — as motos são pretas e desaparecem no fundo escuro. Referência do
tratamento: `public/referencia/flyer-verso.png`.
