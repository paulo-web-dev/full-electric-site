# Pendências

## 🔴 Bloqueiam o lançamento

- [x] ~~Confirmar o WhatsApp.~~ **Confirmado em 24/08/2026: `5541988881253`
      / (41) 98888-1253.**
- [ ] **Razão social e CNPJ da loja** — a Política de Privacidade e o rodapé
      devem exibi-los; hoje a política identifica só o nome fantasia.
- [ ] **Obter do fornecedor**, por escrito: ficha técnica assinada, manual,
      número de identificação e declaração de enquadramento na Res. 996/2023.
- [ ] Endereço da loja, CEP e link do Google Maps.
- [x] ~~Política de Privacidade~~ **No ar em `/politica-de-privacidade`
      (24/08/2026). Falta só razão social/CNPJ (item acima).**

## 🟠 Catálogo de 27/08/2026 — o que libera cada modelo

Fonte: `docs/catalogo/`. Estado em `content/modelos.json` (`publicado`,
`autopropelidoApto`, `pendencias` de cada modelo). Trocar no JSON basta —
não há código por modelo.

**Publicados (4):** S60 (fundida com o Citycoco BOLIN em 28/08/2026 —
preto e vermelho, 13 fotos) · E30 · Citycoco King Pro X30 · Citycoco Slim.
X30 e Slim estão `PENDENTE` (sem selo "sem CNH").

**Aferição:** `npm run catalogo:ficha` → imprimir
`docs/catalogo/ficha-afericao.pdf` → medir → digitar em
`docs/catalogo/afericao.csv` → `npm run catalogo:aferir`.

**Aguardando (8):**

| Modelo | Falta para publicar | Falta para o selo "sem CNH" |
|---|---|---|
| Explorer II (Konnan) | Confirmar que a fat bike verde das fotos é ela (vínculo inferido pela cor) → `publicado: true` | Medir largura e entre-eixos |
| Cappuccino (New E-Bike) | Foto de estúdio (só há catálogo do fabricante em baixa) | Conferir com trena: 45 cm / 117 cm já constam da ficha |
| Scooter urbano lime | Nome comercial | Plaqueta + medição |
| Scooter urbano grafite | Nome comercial | Plaqueta + medição |
| Scooter urbano branco/vermelho | **Confirmar se é a E30** → `npm run catalogo -- fundir e30 scooter-urbano-branco-vermelho`; senão, nome comercial | Plaqueta + medição |
| Scooter urbano preto/amarelo | Nome comercial | Plaqueta + medição |
| B3 (New E-Bike) | Apontar qual foto é a B3 (pode ser um dos urbanos pretos) | Medição |
| Shark (New E-Bike) | Foto; preço para o CRM | Medição |

**Para os publicados sem selo:**
- [ ] Citycoco King Pro X30 e Citycoco Slim: ficha técnica inteira (tudo
      `null`) + plaqueta + medição.
- [ ] S60: a plaqueta do lote BOLIN lê "1.5?0W" (ilegível). A S60 está
      confirmada em 1.000 W; conferir na moto vermelha se é o mesmo motor.
      Capacidade de carga 200 kg veio da plaqueta — conferir no manual.
- [x] ~~S60 × Citycoco BOLIN~~ **Mesma moto, fundidas em 28/08/2026.**
- [ ] E30 × scooter urbano branco/vermelho: **aguardando confirmação**;
      comando pronto (tabela acima).
- [x] ~~Autonomia dos modelos novos~~ **Decisão de 28/08/2026: publicar sem
      autonomia.** O número do fabricante fica em `autonomiaDeclaradaKm` e
      não renderiza.

**Imagens:**
- [x] ~~Tratamento das fotos sobre seção escura~~ **Decisão de 28/08/2026:
      moldura clara (opção A).** Código pronto para PNG com alpha
      (`recortada`, marcado por `npm run catalogo:fotos`).
- [ ] Recortes (PNG com alpha) das fotos principais — o dono manda depois.
      As 7 principais do catálogo novo seguem em PNG (mesmo nome = troca
      direta); as 25 de galeria viraram JPEG q90 em 28/08/2026 (42 MB → 9 MB).
- [ ] Foto 3/4 frontal preta da S60 em alta (as novas 3/4 são vermelhas).
- [ ] Foto landscape para herói, ou aceitar o split atual.

## 🟡 Necessárias para qualidade

- [ ] **Fotos em alta resolução da S60 e da E30.** As atuais são 384×512 px —
      servem para card, não para herói em desktop. Pedir à BOLIN os originais.
- [ ] Ficha técnica completa da **E30** (motor, bateria, velocidade, autonomia,
      freios, preço).
- [ ] Capacidade de carga da S60, conforme o manual.
- [ ] Vida útil e valor de reposição da bateria (está no FAQ como [CONFIRMAR]).
- [ ] Foto da fachada da loja e do time.
- [ ] 3 depoimentos em vídeo de clientes reais.
- [ ] ID do GA4 (o site não usa GTM). Entra por `.env` (`NEXT_PUBLIC_GA4_ID`)
      + rebuild da imagem. **Meta Pixel já no `.env` do servidor
      (27/08/2026)** — falta só o rebuild para entrar no ar. Faixa de
      cookies, gate de consentimento e política prontos (26/08/2026).

## 🟢 Melhorias depois do lançamento

- [ ] Teste real de autonomia gravado em Curitiba (Centro → Boqueirão → Centro)
- [x] ~~Página `/precisa-de-cnh` para SEO~~ **No ar (26/08/2026).** Os
      fatos sobre a fiscalização no Paraná vêm de `docs/03-legal-contran.md`;
      se o cliente tiver fonte oficial (Detran-PR/BPTran), anexar ao doc.
- [x] ~~Página `/para-entregadores`~~ **No ar (26/08/2026).** Formulário
      grava com `origem: "entregadores"` e uso pré-selecionado "Delivery".
- [ ] Widget de avaliações do Google
- [ ] Blog com dicas de legislação
- [x] ~~Rotina de expurgo dos leads sem contato há 12 meses~~ **Pronta
      (26/08/2026):** `/api/admin/expurgo` com `CRON_SECRET`, dry-run por
      padrão, log em `ExpurgoLog`.
- [ ] **Agente do WhatsApp (campanha click-to-WhatsApp):** gerar
      `API_TOKEN` (≥ 32 caracteres) no `.env` da VPS
      (`docs/INTEGRACAO-WHATSAPP.md`), colar no n8n e fazer o roteiro do
      agente cumprir o passo LGPD (se identificar como automático, informar
      a finalidade e as mensagens de retomada, pedir concordância antes do
      POST; `optOut: true` ao primeiro "pare"). O deploy aplica as
      migrations `20260828120000_consentimento` (histórico + backfill) e
      `20260828150000_followup_optout` (contador, último follow-up, optOut,
      índice em telefone).
- [x] ~~`optOut` na ficha do admin~~ **Pronto (31/08/2026):** a ficha mostra
      o selo "Não contatar", marca a revogação (com nota) e desfaz quando a
      própria pessoa reautorizar — o desfazer grava novo `Consentimento`
      verbal com o canal (presencial/telefone). Sem migration: usa as colunas
      de 28/08/2026.
- [ ] **Agendar backup + expurgo na VPS:** `cd /srv/full-electric && git pull
      && scripts/cron.sh` (instalador idempotente, 28/08/2026). Antes, testar
      `scripts/expurgo.sh` em simulação. Não dá para fazer daqui: exige SSH.
