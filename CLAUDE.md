# CLAUDE.md — Full Electric Motos Elétricas

Este arquivo é a fonte de verdade do projeto. Leia antes de qualquer alteração.
Se algo aqui conflitar com um pedido do usuário, **pergunte antes de agir**.

---

## 1. O QUE É ESTE PROJETO

Site institucional e de conversão da **Full Electric — Motos Elétricas**, revenda
de scooters elétricas em **Curitiba/PR**, com pronta entrega.

**Objetivo único do site:** transformar visitante em conversa no WhatsApp ou em
test drive agendado. Não é e-commerce. Não há checkout, carrinho ou pagamento
online. Toda venda é fechada por WhatsApp ou presencialmente.

**Métrica que importa:** cliques em WhatsApp + envios de formulário.
Tudo no site existe para servir a esses dois eventos.

---

## 2. CONTEXTO DO NEGÓCIO

| Item | Valor |
|---|---|
| Marca | Full Electric — Motos Elétricas |
| Praça | Curitiba/PR e Região Metropolitana |
| Fornecedor | BOLIN Electric Motor (fábrica, atacado só p/ CNPJ) — https://bolinmotoseletricas.com.br |
| Grupo | Mesmo grupo da Unyflex Digital — https://digital.unyflex.com.br |
| WhatsApp | `5541988881253` — **⚠️ CONFIRMAR COM O CLIENTE (ver §9)** |
| Preço de entrada | A partir de R$ 8.499 |
| Parcelamento | Até 18x no cartão, **com juros** |
| Garantia | **6 meses** |
| Categoria legal | Equipamento de mobilidade individual autopropelido (Res. CONTRAN 996/2023) |

**Público-alvo (nesta ordem):**
1. Trabalhador urbano que gasta com ônibus ou combustível para ir trabalhar
2. Entregador de aplicativo (iFood, Rappi) sem CNH
3. Uso pessoal / segundo veículo da casa

**Concorrência local:** mercado saturado. Há ao menos 13 lojas em Curitiba,
6 delas no Centro, com nota Google entre 4,6 e 5,0. Preço já é commodity na
faixa R$ 7.400–8.600. **Não competimos por preço.** Competimos por
conformidade documentada, pós-venda e clareza. Ver `docs/05-referencias.md`.

---

## 3. REGRAS INEGOCIÁVEIS ⚠️

Estas regras protegem o cliente de responsabilização sob o Código de Defesa do
Consumidor. **Nunca as viole, nem que peçam.** Se receber um pedido que conflite,
sinalize e peça confirmação explícita.

### 3.1 Sobre "sem CNH"
- ✅ Pode dizer "sem CNH", "sem placa", "sem IPVA" — **desde que**, no mesmo bloco
  visual, apareça a fundamentação: *"Equipamento de mobilidade individual
  autopropelido — Resolução CONTRAN 996/2023"*.
- ❌ Nunca use "sem CNH" isolado, sem essa âncora na mesma seção.
- ❌ Nunca escreva que qualquer moto acima de 1.000 W ou 32 km/h dispensa CNH.
  Acima disso é **ciclomotor** e exige registro, placa e ACC/CNH-A.

### 3.2 Sobre autonomia
- ✅ Faixa realista: **40 a 55 km por carga**.
- ❌ Nunca "60 km", "65 km" ou número único sem faixa.
- Sempre acompanhar de: *"varia conforme peso, relevo e condução"*.

### 3.3 Sobre garantia
- É **6 meses**. Não escreva "1 ano" em lugar nenhum.

### 3.4 Sobre preço
- Sempre "**a partir de** R$ 8.499".
- Sempre com a nota: *"referente ao modelo de entrada, sujeito a alteração sem
  aviso prévio e à disponibilidade de estoque"*.
- Parcelamento **sempre** com asterisco e `*com juros` visível.

### 3.5 Sobre delivery/iFood
- ✅ "Aceito no cadastro do iFood na modalidade Bicicleta Elétrica".
- ❌ Nunca ofereça, mencione ou insinue "desbloqueio de velocidade". O iFood
  monitora velocidade máxima e pode bloquear a conta do entregador.
- Sempre informar que autopropelido circula preferencialmente em ciclovias e,
  na ausência delas, em vias de até 40 km/h.

### 3.6 Especificações
- Nunca invente número de ficha técnica. Se não estiver em `content/modelos.json`
  com `"confirmado": true`, escreva `[CONFIRMAR]` e liste em `docs/PENDENCIAS.md`.

### 3.7 LGPD — dados pessoais de leads
- O site coleta dados pessoais (formulário → banco do CRM). Isso cria obrigações:
  - **Consentimento**: o formulário só envia com o checkbox de consentimento
    marcado, com link para `/politica-de-privacidade`. Nunca remova o checkbox.
  - **Finalidade única**: dado de lead serve para atendimento comercial. Nunca
    adicione uso novo (remarketing, enriquecimento, venda de base) sem atualizar
    a política E recolher novo consentimento.
  - **Direito de eliminação**: a exclusão do lead na ficha (`/admin/leads/[id]`)
    é definitiva e em cascata (notas juntas). Nunca transforme em "soft delete".
  - **Minimização**: não adicione campos novos ao formulário/CRM sem necessidade
    real e sem refletir na política de privacidade.
  - **Retenção**: a política promete apagar após 12 meses do último contato.
  - `/politica-de-privacidade` deve ser mantida em sincronia com o que o código
    efetivamente coleta. Mudou a coleta → muda a política, na mesma tarefa.

---

## 4. IDENTIDADE VISUAL

Herdamos a **estrutura e os padrões de componente** do site da Unyflex Digital
(mesmo grupo), mas com a **paleta própria da Full Electric**, que vem do logo.

### 4.1 Tokens de cor

```css
/* Marca — extraída do logo */
--lime-400: #D2FC13;   /* verde vivo do logo — fundos, preenchimentos */
--lime-500: #B8E01A;   /* hover, bordas */
--lime-600: #8FB50D;   /* texto verde sobre fundo claro (só se necessário) */

/* Neutros */
--ink:      #0A0B0A;   /* preto da marca — fundo escuro e texto principal */
--surface:  #141613;   /* cards sobre fundo escuro */
--line:     #262925;   /* divisórias no escuro */
--paper:    #FFFFFF;
--muted:    #F4F6F3;   /* seções alternadas claras */
--text-2:   #5A5F58;   /* texto secundário no claro */
--text-3:   #9AA096;   /* texto terciário no escuro */

/* Grupo (uso restrito: selo "empresa do grupo" no rodapé) */
--unyflex-blue: #00A3FF;
```

### 4.2 Regra de contraste — CRÍTICA

O verde `--lime-400` tem contraste **péssimo** sobre branco.

- ✅ Lime como **fundo** com texto `--ink` por cima (botão primário)
- ✅ Lime como texto **sobre fundo escuro** (`--ink` / `--surface`)
- ❌ **Nunca** lime como texto sobre branco ou cinza claro
- Todo texto de corpo precisa de contraste ≥ 4.5:1. Verifique.

### 4.3 Tipografia

- **Fonte única:** Inter (via `next/font/google`), pesos 400 / 500 / 600 / 800.
- **Display (h1/h2):** peso 800, `letter-spacing: -0.03em`, caixa normal.
- **Eyebrow** (rótulo acima do título): 12px, peso 600, `uppercase`,
  `letter-spacing: 0.14em`, cor `--lime-500` no escuro / `--text-2` no claro.
- **Números grandes** (preço, estatística): peso 800, `tabular-nums`.
- Sem fonte itálica agressiva. O logo já carrega essa personalidade; o texto
  do site é limpo e legível.

### 4.4 Padrões de componente (herdados da Unyflex)

- **Raio:** `--r-sm: 8px`, `--r-md: 14px`, `--r-lg: 20px`, pílulas `999px`
- **Cards:** fundo `--surface` no escuro / borda `1px solid` no claro; sem
  sombra pesada. Elevação por contraste, não por blur.
- **Botão primário:** fundo lime, texto ink, pílula, peso 600
- **Botão WhatsApp:** secundário, com ícone, sempre visível
- **Chips de confiança:** linha de 3 itens curtos com ✓, logo abaixo do CTA do herói
- **Ritmo de seção:** alterna `--paper` → `--muted` → `--ink`. Nunca duas
  seções escuras seguidas fora do herói e do rodapé.
- **Espaçamento vertical de seção:** 96px desktop / 64px mobile

### 4.5 Fotografia

Todas as fotos de estúdio são em fundo branco/cinza claro. Sobre seções
escuras, aplique um halo radial sutil atrás da moto (as motos são pretas e
somem no fundo escuro) — o mesmo tratamento usado no verso do flyer em
`public/referencia/flyer-verso.png`.

⚠️ **As fotos atuais são 384×512 px.** Servem para cards e thumbnails, **não
para herói em desktop**. Ver `docs/PENDENCIAS.md`.

---

## 5. ARQUITETURA DO SITE

Espelha a estrutura da Unyflex Digital, adaptada para produto físico.

### 5.1 Páginas

| Rota | Objetivo | Prioridade |
|---|---|---|
| `/` | Home — conversão principal | P0 |
| `/modelos/[slug]` | Página de cada modelo (S60, E30) | P0 |
| `/contato` | Formulário + mapa + horários | P0 |
| `/precisa-de-cnh` | Conteúdo educativo sobre CONTRAN 996 (SEO) — **no ar** | P1 |
| `/para-entregadores` | LP para motoboy / iFood — **no ar** | P1 |
| `/politica-de-privacidade` | LGPD (obrigatório p/ rodar anúncios) — **no ar** | P0 |
| `/admin/*` | CRM de leads (ver §6.4) — protegido, noindex | P0 |

### 5.2 Seções da Home (nesta ordem)

1. **Herói** — eyebrow · h1 · subtítulo · CTA duplo (Test drive / WhatsApp) ·
   3 chips de confiança · foto da S60
2. **Barra de números** — modelos em estoque · potência · categoria legal · pronta entrega
3. **Modelos disponíveis** — grid de cards, um por modelo, com foto, specs
   resumidas, preço "a partir de" e CTA
4. **Economia** — comparativo ônibus × 125cc × elétrica, com a metodologia do
   cálculo em nota de rodapé
5. **"Você se identifica?"** — grid de 6 dores → solução (padrão Unyflex)
6. **É legal? Sim, e provamos** — bloco CONTRAN 996 com os 5 critérios e o
   Dossiê de Conformidade que acompanha a venda
7. **Como funciona** — 4 passos numerados (padrão Unyflex)
8. **Prova social** — avaliações Google + depoimentos
9. **Formulário** — captura de lead que também abre o WhatsApp preenchido
10. **FAQ** — accordion, mínimo 12 perguntas, com Schema.org FAQPage
11. **CTA final** + rodapé

### 5.3 Elementos persistentes

- **Botão flutuante de WhatsApp**, canto inferior direito, aparece após 300px
  de rolagem. Mobile: barra fixa no rodapé.
- **Header** com logo, navegação e botão "Test drive" à direita.

---

## 6. STACK E CONVENÇÕES

```
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4
Deploy: VPS compartilhada — Docker (output standalone) atrás do Traefik v2 já
        existente (rede n8n_default, TLS via resolver `le`). Sem porta publicada.
        `git pull → docker compose build → up -d`. Ver docs/DEPLOY.md.
Banco: Postgres via Prisma (Neon ou próprio) — SOMENTE para o CRM de leads (/admin).
Sem CMS. Todo o conteúdo do site público segue em JSON versionado.
```

### 6.1 Estrutura de pastas alvo

```
app/
  layout.tsx            fontes, metadata, Analytics (GA4 + Pixel)
  page.tsx              home
  modelos/[slug]/page.tsx
  contato/page.tsx
  precisa-de-cnh/page.tsx
  para-entregadores/page.tsx
  api/lead/route.ts     recebe o formulário
  api/health/route.ts   healthcheck do container (sem tocar no banco)
components/
  ui/                   Button, Card, Chip, Accordion, Section
  sections/             Hero, Modelos, Economia, Legal, Passos, FAQ, ...
  WhatsAppFab.tsx
lib/
  whatsapp.ts           gerador de link wa.me com mensagem por origem
  content.ts            leitura tipada de content/*.json
content/                site.json · modelos.json · faq.json
public/                 brand/ · modelos/ · referencia/
```

### 6.2 Regras de código

- **Server Components por padrão.** `"use client"` só onde há estado ou evento.
- **Sem `localStorage`/`sessionStorage`** em nenhum lugar.
- Todo texto visível vem de `content/*.json` ou de constantes em português.
  **Nada de string solta no meio do JSX.**
- Imagens sempre via `next/image`, com `alt` descritivo em português.
- Acessibilidade: navegação por teclado, `aria-label` em ícones, foco visível.
- Sem dependência nova sem justificar. Tailwind + lucide-react bastam
  (`sharp` está no package.json só porque o otimizador de imagem do Next
  precisa dele em servidor próprio — não importar no código).

### 6.3 Links de WhatsApp

Use sempre `lib/whatsapp.ts`. Cada origem tem mensagem própria — é assim que
o cliente sabe de onde veio o lead:

```ts
waLink("hero")      // "Olá! Vim pelo site e quero saber mais sobre as motos elétricas."
waLink("modelo", "S60")  // "Olá! Tenho interesse na Full Electric S60."
waLink("entregador")     // "Olá! Sou entregador e quero saber sobre a moto para trabalhar."
```

### 6.4 Módulo admin — CRM de leads

Gerenciador de leads em `/admin`, protegido por middleware (`middleware.ts`):
nenhuma rota `/admin` ou `/api/admin` responde sem sessão válida, e todas saem
com `X-Robots-Tag: noindex` (também bloqueadas no `robots.txt`).

- **Banco:** Postgres via Prisma (`prisma/schema.prisma`, client em
  `lib/db.ts`). `DATABASE_URL` para runtime, `DIRECT_URL` para migrations.
  Toda alteração de schema vira migration versionada (`npx prisma migrate dev
  --name ...`); o container aplica `migrate deploy` no entrypoint antes de
  subir e não sobe se falhar. Nunca `db push` em produção.
- **Auth:** senha única (`ADMIN_PASSWORD`) → cookie httpOnly assinado com HMAC
  (`SESSION_SECRET`, lógica em `lib/adminAuth.ts`), sessão de 7 dias. Sem
  multiusuário, sem `localStorage`.
- **Modelo de dados:** `Lead` (nome, telefone, email?, modeloInteresse, uso,
  horarioPreferido, origem, utmSource?, utmMedium?, utmCampaign?, status,
  proximoContatoEm?, valorVenda?, dataVenda?, criadoEm, atualizadoEm) e `Nota`
  (leadId, texto, criadoEm, cascade no delete). Status: NOVO → CONTATADO →
  TEST_DRIVE_AGENDADO → NEGOCIANDO → VENDIDO | PERDIDO (`lib/crm.ts`).
  `valorVenda`/`dataVenda` só são editáveis com status VENDIDO e alimentam o
  card "Vendas no mês" do painel (soma por `dataVenda` no mês corrente).
- **Telas:** `/admin/login` · `/admin` (painel: contagens, semana, conversão,
  follow-ups vencidos, vendas no mês) · `/admin/leads` (busca, filtros, CSV) ·
  `/admin/leads/[id]` (ficha, notas, status, próximo contato, venda, WhatsApp,
  exclusão LGPD).
- **Fora do escopo da v1 (não construir sem pedido):** múltiplos usuários,
  permissões, automação de e-mail, calendário, faturamento.
- **Env obrigatórias em produção:** `DATABASE_URL`, `DIRECT_URL`,
  `ADMIN_PASSWORD`, `SESSION_SECRET`, `TRUST_PROXY_HOPS` (=1 atrás do Traefik).
  Ver `.env.example`.
- **`NEXT_PUBLIC_*` são de build**, não de runtime: entram como `ARG` no
  Dockerfile e exigem rebuild da imagem para mudar (README).

### 6.5 Formulário

Segue o padrão que a BOLIN já usa no grupo: ao enviar, **grava o lead** (rota
`/api/lead`) **e abre o WhatsApp com a mensagem montada**. Campos:

`nome` · `whatsapp` · `e-mail (opcional)` · `modelo de interesse` ·
`uso pretendido` (trabalho / delivery / pessoal) · `melhor horário para test
drive` · checkbox de consentimento LGPD (obrigatório, com link para
`/politica-de-privacidade`)

E-mail nunca obrigatório. Validação com máscara de telefone BR. O envio também
captura, de forma invisível, a origem da seção e os UTMs da URL
(`utm_source/medium/campaign`) e grava tudo no CRM via `/api/lead`.

---

## 7. SEO

- `metadata` por página, em português, com foco local ("Curitiba").
- Palavras-chave alvo: *moto elétrica sem cnh curitiba*, *scooter elétrica
  curitiba*, *autopropelido curitiba*, *moto elétrica para ifood*.
- `LocalBusiness` + `Product` + `FAQPage` em JSON-LD.
- `sitemap.ts` e `robots.ts` gerados.
- LCP < 2,5s. Imagens em WebP/AVIF via `next/image`.

---

## 8. DEFINIÇÃO DE PRONTO

Antes de dizer que uma tarefa terminou, confira:

- [ ] `npm run build` passa sem erro e sem warning de tipo
- [ ] Testado em 375px de largura (mobile primeiro)
- [ ] Nenhum texto lime sobre fundo claro
- [ ] Nenhuma violação das regras da §3
- [ ] Todo CTA leva a WhatsApp, formulário ou test drive
- [ ] `alt` preenchido em todas as imagens
- [ ] Sem `console.log` sobrando

---

## 9. PENDÊNCIAS QUE BLOQUEIAM O LANÇAMENTO

Estão detalhadas em `docs/PENDENCIAS.md`. As críticas:

1. ~~Confirmar o WhatsApp.~~ **Confirmado em 24/08/2026: `5541988881253`.**
2. **Medir a largura e o entre-eixos de cada modelo.** O enquadramento como
   autopropelido exige largura ≤ 70 cm e entre-eixos ≤ 130 cm. Fichas técnicas
   públicas de citycoco mostram 75 cm de largura. Se estourar, **todo o discurso
   "sem CNH" cai** e o site precisa ser reescrito.
3. **Fotos em alta resolução.** As atuais são 384×512.

---

## 10. TOM DE VOZ

- Direto, adulto, sem exagero publicitário.
- Frases curtas. Evite "revolucionário", "incrível", "imperdível".
- Números sempre com contexto ("40 a 55 km", não "muita autonomia").
- Quando houver limitação, **diga antes que o cliente descubra**. É isso que
  separa a marca do resto da praça: honestidade verificável.
- Nunca use emoji na interface do site. (No WhatsApp, sim.)
