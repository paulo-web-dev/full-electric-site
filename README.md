# Full Electric — Site

Site de conversão da Full Electric Motos Elétricas (Curitiba/PR).

## Como começar

```bash
# 1. Abra o Claude Code nesta pasta
claude

# 2. Cole o prompt de PROMPT-INICIAL.md
```

O Claude Code lê o `CLAUDE.md` automaticamente. Ele contém as regras do
projeto, a identidade visual e as restrições legais que não podem ser violadas.

## O que já está pronto nesta pasta

```
CLAUDE.md              Regras do projeto — leitura obrigatória
PROMPT-INICIAL.md      O prompt para começar
docs/                  Marca, catálogo, legislação, copy, concorrência
content/               Conteúdo em JSON (site, modelos, FAQ)
public/brand/          Logo
public/modelos/        Fotos organizadas por modelo
public/referencia/     Flyer aprovado — referência de tom e tratamento visual
```

## Ainda não está pronto

O código. É isso que o Claude Code vai construir.

## Antes de publicar

Leia `docs/PENDENCIAS.md`. Há três itens em vermelho que bloqueiam o
lançamento — em especial a medição de largura e entre-eixos das motos, que
define se o discurso "sem CNH" do site se sustenta.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Deploy na Vercel.
Sem banco, sem CMS. Conteúdo em JSON versionado.
