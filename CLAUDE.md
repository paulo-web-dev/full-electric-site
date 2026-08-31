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
| Preço | **Não aparece no site público** (desde 27/08/2026). Fica só em `content/modelos.json` e no CRM |
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
- **Por modelo, quem manda é o interruptor `autopropelidoApto`** em
  `content/modelos.json`:
  - `"SIM"` → o selo aparece (`components/SeloAutopropelido.tsx`, o card
    legal em `/modelos/[slug]`, o bloco legal, o chip e o FAQ de CNH na LP,
    a linha "Sem CNH" no OG image).
  - `"PENDENTE"` → **nada** sobre CNH, placa ou emplacamento naquele modelo.
    A moto vende como "100% elétrica, pronta entrega".
  - É um **interruptor, não um bloqueio permanente**: mediu com trena, leu a
    plaqueta, trocou para `"SIM"` no JSON → o selo aparece sozinho, sem
    alteração de código. Nunca ligue o selo por código, nem crie um terceiro
    estado.
  - O build **falha** se um modelo `"SIM"` tiver `potenciaW` > 1.000,
    `velocidadeMaxKmh` > 32, `medidas.larguraCm` > 70 ou
    `medidas.entreEixosCm` > 130 (`validarCatalogo` em `lib/catalogo.ts`).

### 3.2 Sobre autonomia
- ✅ Faixa realista: **40 a 55 km por carga**.
- ❌ Nunca "60 km", "65 km" ou número único sem faixa.
- Sempre acompanhar de: *"varia conforme peso, relevo e condução"*.

### 3.3 Sobre garantia
- É **6 meses**. Não escreva "1 ano" em lugar nenhum.

### 3.4 Sobre preço
- **Nenhum valor de moto aparece no site público** (decisão de 27/08/2026):
  nem "a partir de", nem faixa, nem em JSON-LD (`Product` sem `offers`,
  `Store` sem `priceRange`), nem em OG image, nem como `value` de evento de
  Pixel/GA4. No lugar, o CTA de consulta: **"Consulte o valor no WhatsApp"**
  (`site.comercial.consulteValor`, origem `valor` em `lib/whatsapp.ts`).
- O preço continua em `content/modelos.json` (`precoBrl`) **só para o
  CRM**: sugestão de valor no cadastro de venda (`/admin/leads/[id]/mover`).
  Nunca leia esse campo em componente público. O catálogo não vai ao bundle
  do navegador: o `LeadForm` recebe a lista de modelos por prop
  (`lib/opcoesModelo.ts`), nunca importa `lib/catalogo.ts`. Componente de
  cliente só pode importar `lib/content.ts` (site.json e FAQ).
- Parcelamento pode aparecer ("em até 18x no cartão*") — parcelamento sem
  valor não é oferta de preço — **sempre** com asterisco e `*com juros`
  visível.
- Custos de uso (energia por mês, comparativo com ônibus/125cc) não são
  preço da moto e continuam permitidos.

### 3.5 Sobre delivery/iFood
- ✅ "Aceito no cadastro do iFood na modalidade Bicicleta Elétrica".
- ❌ Nunca ofereça, mencione ou insinue "desbloqueio de velocidade". O iFood
  monitora velocidade máxima e pode bloquear a conta do entregador.
- Sempre informar que autopropelido circula preferencialmente em ciclovias e,
  na ausência delas, em vias de até 40 km/h.

### 3.6 Especificações e catálogo orientado a dados
- Nunca invente número de ficha técnica. `content/modelos.json` usa **campos
  tipados** (`specs.potenciaW`, `specs.velocidadeMaxKmh`, `specs.bateria`…):
  valor preenchido = confirmado; **`null` = não confirmado e a linha some**
  (sem placeholder, sem "consulte-nos", sem "sob consulta"). Dúvida vai em
  `pendencias` do modelo (não renderiza) e em `docs/PENDENCIAS.md`.
- **Modelo novo entra só pelo JSON.** Card, `/modelos`, `/modelos/[slug]`,
  `/lp/[slug]`, OG image, sitemap e o select do formulário são gerados de
  `getModelos()`. Não crie página por modelo à mão.
- **Publicação**: `publicado: true` exige `nome` e ao menos uma foto — o
  build falha sem isso. Modelo sem nome comercial ou sem foto fica
  `publicado: false`: fora do grid, sem rota (404), fora do sitemap e do
  formulário. O admin ainda o vê no "modelo vendido" (`getModelosCatalogo`).
- **Autonomia** renderiza só de `specs.autonomiaKm: {min, max}` (faixa
  realista, §3.2). O número solto do fabricante fica em
  `autonomiaDeclaradaKm` e **não renderiza**.
- **Medidas** (`medidas.larguraCm`, `entreEixosCm`, `comprimentoCm`,
  `alturaCm`) são privadas: validam o `"SIM"` no build e nunca vão ao site.
  No site aparece só "Dentro do limite legal" (decisão do cliente, §9).
- **Preço** (`precoBrl`) é só CRM (§3.4).
- **Aferição na loja**: `npm run catalogo:ficha` gera
  `docs/catalogo/ficha-afericao.pdf` (uma página por modelo PENDENTE, para
  imprimir) e `docs/catalogo/afericao.csv`; preenchido o CSV,
  `npm run catalogo:aferir` grava medidas/potência/velocidade/equipamentos e
  liga `"SIM"` só em quem passa nos 4 limites e nos 5 equipamentos. Fusão de
  registros duplicados: `npm run catalogo -- fundir <destino> <origem>`.
- Categorias (`categorias` no JSON, ordem do grid): `citycoco`,
  `scooter-urbano`, `scooter-retro`, `fat-bike`. Categoria sem modelo
  publicado não aparece.

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
    Cumprida por `/api/admin/expurgo` (token `CRON_SECRET`, dry-run por
    padrão, `?confirmar=true` apaga; VENDIDO nunca é apagado; cada execução
    grava em `ExpurgoLog`). Cron semanal na VPS: `docs/DEPLOY.md §9`.
  - `/politica-de-privacidade` deve ser mantida em sincronia com o que o código
    efetivamente coleta. Mudou a coleta → muda a política, na mesma tarefa.
  - **Histórico de consentimento**: tabela `Consentimento` (um registro por
    manifestação, nunca sobrescrito, cascade com o lead). Todo lead novo
    nasce com um: `formulario` (checkbox; grava IP e navegador como prova),
    `verbal` (cadastro manual no admin) ou `whatsapp_automacao`
    (`POST /api/agent/leads`, token `API_TOKEN`, usado pelo agente de IA
    das campanhas click-to-WhatsApp; contrato em
    `docs/INTEGRACAO-WHATSAPP.md`). `textoVersao` = `POLITICA_VERSAO`
    (`lib/politica.ts`, data ISO da política): **mudou a política → mude a
    constante**, é ela que a página exibe e que diz com que texto a pessoa
    concordou. Monte o registro sempre por `novoConsentimento()`
    (`lib/consentimento.ts`); nunca crie caminho de gravação de lead sem
    ele. A automação só pode chamar a rota depois de se identificar como
    automática, informar a finalidade e a pessoa concordar — a política
    descreve exatamente isso (seções 2 e 4). A ficha mostra o histórico
    completo.
  - **Retomada automática e revogação**: o agente manda no máximo 3
    mensagens de retomada por lead, uma a cada 24 h (`/api/agent/followups`,
    `Lead.followupCount`/`ultimoFollowup`) — a política declara isso e diz
    como parar. `Lead.optOut` é a revogação: só vira `true` (pela API ou
    pela equipe, na ficha) e **nunca volta a `false` por máquina**; lead com
    `optOut` sai da fila e o agente não insiste. Desfazer é só na ficha,
    quando a própria pessoa reautorizar — grava novo `Consentimento` verbal
    e nota. Mudou o número de mensagens ou o intervalo → muda a política.
  - **Cookies**: GA4 e Meta Pixel só carregam após "Aceitar" na faixa de
    cookies (consentimento, art. 7º I). Essenciais, sem consentimento:
    `fe_consent` (a escolha, 6 meses), `fe_utm` (UTMs da visita, sessão) e
    `fe_admin_sessao` (equipe). Nunca carregue script de terceiro fora desse
    gate. Toda UTM vai na mensagem do WhatsApp como `[ref: ...]` (`lib/utm.ts`).
    Eventos só por `lib/analytics.ts` (que relê o consentimento a cada
    disparo): Meta `Contact` (clique em wa.me), `Lead` (formulário gravado,
    **sem `value`** — preço de entrada não é valor de lead) e `ViewContent`
    (página de modelo, `value` só com preço confirmado). Um único carregador
    de Pixel: `components/Analytics.tsx`.

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

Fotos em `public/images/modelos/<slug>/`, referenciadas em
`content/modelos.json` com `largura`/`altura` reais (o `next/image`
converte para AVIF/WebP e redimensiona sob demanda — não é preciso converter
à mão).

- **S60 e E30:** JPG 384×512 px. Servem para card, não para herói em desktop.
- **Catálogo de 27/08/2026:** 1122×1402 (4:5), **fundo branco, sem alpha**.
  Decisão de 28/08/2026: sobre seção escura ficam em **moldura clara
  arredondada** (`classesFotoNoEscuro` em `lib/catalogo.ts`).
- **Formato no repositório:** a foto `principal` de cada modelo fica em
  **PNG** (≈ 0,7 MB, recomprimido sem perda) para receber o recorte com alpha
  no mesmo nome; as demais são **JPEG q90** (≈ 100–230 KB). Chegou lote novo
  em PNG → `npm run catalogo:comprimir` faz essa separação sozinho e reescreve
  os `src` no JSON. Nunca converta a principal para JPEG à mão.
- **Recortes (PNG com alpha):** basta trocar o arquivo e rodar
  `npm run catalogo:fotos` — ele marca `recortada: true` lendo o canal
  alpha, e a foto passa a ficar solta sobre o escuro, com halo e sem moldura.
  Nenhuma mudança de código. (`comprimir` também preserva PNG com alpha.)
- Não use as fotos de showroom (marca do fornecedor); a colagem do lime foi
  removida do repositório.

---

## 5. ARQUITETURA DO SITE

Espelha a estrutura da Unyflex Digital, adaptada para produto físico.

### 5.1 Páginas

| Rota | Objetivo | Prioridade |
|---|---|---|
| `/` | Home — conversão principal | P0 |
| `/modelos` | Catálogo completo por categoria, gerado do JSON — **no ar** | P0 |
| `/modelos/[slug]` | Página de cada modelo publicado, gerada do JSON | P0 |
| `/contato` | Formulário + mapa + horários | P0 |
| `/precisa-de-cnh` | Conteúdo educativo sobre CONTRAN 996 (SEO) — **no ar** | P1 |
| `/para-entregadores` | LP para motoboy / iFood — **no ar** | P1 |
| `/lp/[slug]` | LP de campanha por modelo (tráfego pago): sem header/navegação, **noindex**, fora do sitemap; gerada de `modelos.json` — **no ar** | P1 |
| `/politica-de-privacidade` | LGPD (obrigatório p/ rodar anúncios) — **no ar** | P0 |
| `/admin/*` | CRM de leads (ver §6.4) — protegido, noindex | P0 |

### 5.2 Seções da Home (nesta ordem)

Ordem revista em 26/08/2026 para conversão: o formulário vem logo depois dos
modelos (ponto de decisão), não no fim da página. Mesma ordem no mobile e
no desktop.

1. **Herói** — eyebrow curto · h1 · **foto da S60 antes dos CTAs no mobile**
   (~220 px, com halo) · subtítulo · CTA primário → `#formulario` · CTA
   secundário → WhatsApp · 3 chips de confiança · âncora legal. O CTA
   primário precisa caber na dobra de uma tela de 667 px.
2. **Barra de números** — modelos em estoque · potência · categoria legal · pronta entrega
3. **Modelos disponíveis** — grid de cards, um por modelo, com foto, specs
   resumidas, parcelamento e CTA "Consulte o valor no WhatsApp" (sem preço)
4. **Formulário** — captura de lead que também abre o WhatsApp preenchido
5. **Economia** — comparativo ônibus × 125cc × elétrica, com a metodologia do
   cálculo em nota de rodapé
6. **É legal? Sim, e provamos** — bloco CONTRAN 996 com os 5 critérios e o
   Dossiê de Conformidade que acompanha a venda
7. **"Você se identifica?"** — grid de 6 dores → solução (padrão Unyflex)
8. **O que você leva por escrito** — compromissos + Dossiê (no lugar da prova
   social até haver avaliações reais; quando houver, entra aqui)
9. **Como funciona** — 4 passos numerados (padrão Unyflex)
10. **FAQ** — accordion, mínimo 12 perguntas, com Schema.org FAQPage (tom `paper`)
11. **CTA final** + rodapé

### 5.3 Elementos persistentes

- **Botão flutuante de WhatsApp**, canto inferior direito, aparece após 300px
  de rolagem. Mobile: barra fixa no rodapé.
- **Header** com logo, navegação e botão "Test drive" à direita.
- **Faixa de cookies** (`components/CookieBanner.tsx`): só aparece quando há
  ID de GA4 ou Pixel no build e ainda não há escolha. "Aceitar" grava
  `fe_consent=aceito` (6 meses) e só então os scripts carregam; "Só
  essenciais" ou nenhuma resposta = não carrega. Link "Cookies" no rodapé
  reabre a faixa.

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
  api/agent/leads/route.ts      agente do WhatsApp: busca e upsert por telefone (API_TOKEN)
  api/agent/followups/route.ts  agente do WhatsApp: fila de retomada e marcação de envio
  api/health/route.ts   healthcheck do container (sem tocar no banco)
components/
  ui/                   Button, Card, Chip, Accordion, Section
  sections/             Hero, Modelos, Economia, Legal, Passos, FAQ, ...
  WhatsAppFab.tsx
lib/
  whatsapp.ts           gerador de link wa.me com mensagem por origem
  content.ts            site.json e faq.json (seguro no cliente)
  catalogo.ts           modelos.json tipado + validação de build (só servidor)
  opcoesModelo.ts       lista "Modelo de interesse" para o formulário e o admin
content/                site.json · modelos.json (catálogo tipado, §3.6) · faq.json
public/                 brand/ · images/modelos/<slug>/ · referencia/
docs/catalogo/          fonte do catálogo de 27/08/2026 (JSON + CSV de fotos)
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
waLink("valor", "S60")   // "Olá! Quero saber o valor da Full Electric S60."  (CTA de consulta)
waLink("lp", "S60")      // "Olá! Vi o anúncio da Full Electric S60 e quero saber mais."  (LP)
```

O rastreio descobre a origem pela mensagem; um link pode forçar outra com
`data-origem` (as LPs usam `lp-{slug}` em todos os botões e no FAB).

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
  horarioPreferido?, origem, utmSource?, utmMedium?, utmCampaign?, status,
  proximoContatoEm?, valorVenda?, dataVenda?, modeloVendido?, motivoPerda?,
  motivoPerdaDetalhe?, comoConheceu?, followupCount, ultimoFollowup?,
  optOut, criadoEm, atualizadoEm), `Nota` (leadId,
  texto, criadoEm, cascade no delete), `Consentimento` (leadId, tipo,
  textoVersao, registradoEm, origem, ip?, userAgent?, cascade no delete —
  §3.7) e `ExpurgoLog` (executadoEm, simulacao, limite, candidatos, apagados). Status: NOVO → CONTATADO →
  TEST_DRIVE_AGENDADO → NEGOCIANDO → VENDIDO | PERDIDO (`lib/crm.ts`).
  `MotivoPerda`: PRECO · OUTRA_LOJA · SUMIU · SEM_MODELO · OUTRO.
  `ComoConheceu` (só cadastro manual e ficha — lead do site já traz UTMs):
  PANFLETO · GOOGLE · INSTAGRAM · INDICACAO · PASSOU_NA_FRENTE · OUTRO.
- **Origem é texto livre**, não enum: o site grava a seção do formulário
  (`formulario`, `contato`, `entregadores`, `lp-{slug}`); a automação do
  WhatsApp manda o nome da campanha (`meta-whatsapp`, `meta-c1`…, padrão
  `whatsapp-automacao`); leads manuais usam `ORIGENS_MANUAIS`
  (`PRESENCIAL`, `TELEFONE`, `INDICACAO`, `OUTRO`) de `lib/crm.ts`.
- **Agente do WhatsApp (`/api/agent/leads`, `/api/agent/followups`)**:
  token fixo `API_TOKEN` com mínimo de 32 caracteres (`exigirApiToken` em
  `lib/apiToken.ts`; ausente → 500 e log, errado → 401), regras em
  `lib/agente.ts`. GET por telefone devolve 200 `encontrado: false` para
  contato novo. POST é upsert por telefone (`telefoneChave`; gravado com a
  máscara de `formatarTelefone`, devolvido também em E.164): **só os campos
  enviados mudam**; `origem` só na criação; mudança de status gera nota
  `[agente]`. **`VENDIDO` e `PERDIDO` → 403** (`status_reservado_ao_humano`):
  são registrados por pessoa, com valor/motivo. `TEST_DRIVE_AGENDADO` exige
  `proximoContatoEm`. Erros trazem `error` (código) e `mensagem` (texto
  para o modelo). Escrita divide um balde de rate limit por token
  (`LIMITE_EXTERNO_POR_TOKEN`, 60/h, 429 explícito); GET sem limite.
  Contrato e `curl` em `docs/INTEGRACAO-WHATSAPP.md`.
- **Movimento de status com dados (`moverLead`):** TEST_DRIVE_AGENDADO exige
  data/hora (grava em `proximoContatoEm` — o próximo contato *é* o test
  drive); VENDIDO exige valor, data e modelo vendido; PERDIDO exige motivo.
  Os demais status salvam direto do select da linha (`SeletorStatus`). A
  tela `/admin/leads/[id]/mover?para=STATUS` pede esses dados; o status só
  muda ao confirmar.
- **Telas:** `/admin/login` · `/admin` (tela de trabalho: novos sem contato,
  follow-ups vencidos, test drives nos próximos 7 dias, vendas do mês — cada
  bloco com estado vazio explicativo; sem gráficos até haver volume) ·
  `/admin/leads` (busca, filtros, CSV, status e nota rápida na linha, "Novo
  lead") · `/admin/leads/novo` (cadastro manual: balcão/telefone/indicação;
  observação inicial vira a primeira nota) · `/admin/leads/[id]` (ficha,
  notas, status, próximo contato, venda com modelo, motivo da perda,
  WhatsApp, revogação de contato/optOut, exclusão LGPD) ·
  `/admin/leads/[id]/mover`.
- **Sem analytics de tráfego no admin** — isso é do Google Analytics.
- **Fora do escopo da v1 (não construir sem pedido):** múltiplos usuários,
  permissões, automação de e-mail, calendário, faturamento.
- **Env obrigatórias em produção:** `DATABASE_URL`, `DIRECT_URL`,
  `ADMIN_PASSWORD`, `SESSION_SECRET`, `TRUST_PROXY_HOPS` (=1 atrás do Traefik),
  `CRON_SECRET` (expurgo LGPD), `API_TOKEN` (automação do WhatsApp).
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
2. ~~Medir a largura e o entre-eixos de cada modelo.~~ **Medidos em
   27/08/2026: S60 e E30 dentro dos limites (≤ 70 cm e ≤ 130 cm), equipamentos
   obrigatórios atendidos.** Por decisão do cliente, o site mostra só
   "Dentro do limite legal", sem os números — não publique as medidas.
3. **Fotos.** S60/E30 seguem em 384×512. O catálogo novo (27/08/2026) tem
   fotos 1122×1402 em fundo branco: falta decidir o tratamento sobre fundo
   escuro. 8 modelos aguardam nome, foto ou confirmação — ver
   `docs/PENDENCIAS.md`.

---

## 10. TOM DE VOZ

- Direto, adulto, sem exagero publicitário.
- Frases curtas. Evite "revolucionário", "incrível", "imperdível".
- Números sempre com contexto ("40 a 55 km", não "muita autonomia").
- Quando houver limitação, **diga antes que o cliente descubra**. É isso que
  separa a marca do resto da praça: honestidade verificável.
- Nunca use emoji na interface do site. (No WhatsApp, sim.)
