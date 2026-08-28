# Catálogo — modelos

Dados estruturados em `content/modelos.json` (formato tipado, regras em
`CLAUDE.md §3.6`). Este documento explica o contexto; o JSON é a verdade.

Fonte do catálogo de 27/08/2026: `docs/catalogo/catalogo-modelos.2026-08-27.json`
(dados do fornecedor + copys) e `docs/catalogo/catalogo-fotos.2026-08-27.csv`
(mapa arquivo original → arquivo renomeado, ângulo e uso de cada foto).
Fotos em `public/images/modelos/<slug>/`.

## Como o site lê o JSON

| Campo | Efeito |
|---|---|
| `publicado` | `true` = card, `/modelos/[slug]`, `/lp/[slug]`, sitemap, select do formulário. Exige `nome` e foto (o build falha sem). |
| `nome` | Nome comercial. `null` = ainda sem nome → não publica. |
| `categoria` | Agrupa o grid: `citycoco` · `scooter-urbano` · `scooter-retro` · `fat-bike`. |
| `destaque` | Um só: herói da home, OG image da home, tabela legal da home. |
| `autopropelidoApto` | `"SIM"` liga o selo "sem CNH/placa"; `"PENDENTE"` esconde tudo sobre CNH. Interruptor: trocou, apareceu. |
| `specs.*` | Cada campo com valor vira linha da ficha; `null` some. |
| `specs.autonomiaKm` | Faixa `{min, max}` — única autonomia que renderiza. `autonomiaDeclaradaKm` é só referência. |
| `medidas.*` | Privado. Valida o `"SIM"` no build; o site mostra só "Dentro do limite legal". |
| `precoBrl` | Privado. Sugestão de valor no CRM. |
| `fotos[]` | `src`, `alt`, `largura`, `altura`; `principal: true` no card/herói; `uso: "compliance"` (plaqueta visível) ou `"hero"` (landscape). |
| `pendencias[]` | Anotações do dono; não renderiza. |

## Estado em 27/08/2026

### Publicados

| Slug | Nome | Categoria | Selo | Observação |
|---|---|---|---|---|
| `s60` | Full Electric S60 | citycoco | SIM | Carro-chefe (`destaque`). BOLIN. 1.000 W, 60V 21Ah, 32 km/h, 40–55 km. Medida em 27/08. **Fundida com o "Citycoco BOLIN" em 28/08** (preto e vermelho, 13 fotos). |
| `e30` | Full Electric E30 | scooter-urbano | SIM | BOLIN, branca. Medida em 27/08; ficha técnica ainda vazia. |
| `citycoco-king-pro-x30` | Citycoco King Pro X30 | citycoco | PENDENTE | Azul Union Jack. Sem spec nenhuma. |
| `citycoco-slim` | Citycoco Slim (baú lateral) | citycoco | PENDENTE | Laranja, azul, verde-oliva. Sem spec nenhuma. |

### Aguardando (no JSON com `publicado: false`)

| Slug | Nome | Falta |
|---|---|---|
| `konnan-explorer-ii` | Explorer II (Konnan) | Confirmar que a fat bike verde das fotos é ela. Specs já vieram (750 W, 48V 18,2Ah, 32 km/h). |
| `new-ebike-cappuccino` | Cappuccino (New E-Bike) | Foto de estúdio. Ficha completa e medidas 45 × 117 cm (conferir com trena → `"SIM"`). |
| `scooter-urbano-lime` | — | Nome comercial. Melhor candidata visual (combina com a paleta). Tem a única foto landscape. |
| `scooter-urbano-grafite` | — | Nome comercial. |
| `scooter-urbano-branco-vermelho` | — | **Confirmar se é a E30** (então `fundir e30 scooter-urbano-branco-vermelho`); senão, nome comercial. |
| `scooter-urbano-preto-amarelo` | — | Nome comercial. |
| `b3-grafeno` | B3 (New E-Bike) | Apontar a foto (talvez um dos urbanos pretos). Specs e preço já vieram. |
| `shark-72v` | Shark (New E-Bike) | Foto e preço. Specs já vieram. |

## Aferição na loja (selo "sem CNH")

1. `npm run catalogo:ficha` — gera `docs/catalogo/ficha-afericao.pdf`, uma
   página por modelo `PENDENTE` (nome, foto, campos de largura, entre-eixos,
   potência da plaqueta, velocidade, checklist de equipamentos, data e
   assinatura), e o modelo `docs/catalogo/afericao.csv` (se ainda não existir).
2. Imprimir, medir com trena, ler a plaqueta.
3. Digitar os números no CSV (separador `;`, decimal com vírgula aceito;
   equipamentos `sim`/`nao`).
4. `npm run catalogo:aferir` — grava `medidas`, `specs.potenciaW`,
   `specs.velocidadeMaxKmh`, `specs.equipamentos` e liga `"SIM"` só em quem
   passa nos 4 limites (70 cm · 130 cm · 1.000 W · 32 km/h) e nos 5
   equipamentos; os outros ficam `PENDENTE` com o motivo em `pendencias`.
   Linha incompleta não altera o modelo.
5. `npm run build` valida e publica.

Registros duplicados (mesma moto com dois slugs):
`npm run catalogo -- fundir <destino> <origem>` — fotos, cores e campos
vazios vão para o destino, que nunca perde nada; a origem some do JSON.

## Para publicar um modelo

1. Preencher `nome` e garantir ao menos uma foto em `fotos[]` (com
   `largura`/`altura` reais — `sharp` ou as propriedades do arquivo).
2. `publicado: true`. Rodar `npm run build` — ele valida.
3. Selo "sem CNH": só depois de ler a plaqueta e medir com trena, trocar
   `autopropelidoApto` para `"SIM"` e anotar as medidas em `medidas`.

## Fornecedores

- BOLIN Electric Motor — https://bolinmotoseletricas.com.br (fábrica, venda só
  para CNPJ). S60, E30 e o Citycoco BOLIN.
- New E-Bike — Cappuccino, B3, Shark e (provavelmente) os scooters urbanos.
- Konnan — Explorer II.

Fotos de showroom mostram a marca do importador (AIWA Imports) e **não são
publicadas**; ficaram fora do repositório.

## Nomenclatura no site

Os modelos BOLIN de entrada seguem como **"Full Electric S60"** e **"Full
Electric E30"**; os demais usam o nome comercial do catálogo. A marca que o
cliente final compra é a Full Electric.
