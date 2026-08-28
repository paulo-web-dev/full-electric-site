# Integração — agente do WhatsApp (n8n) ↔ CRM

Campanha click-to-WhatsApp no Meta abre a conversa direto no WhatsApp: não
passa por página do site, não carrega UTM e o formulário nunca é preenchido.
Sem isto, o lead fica só no WhatsApp. O agente de IA que atende a conversa
(no n8n) lê e grava leads no CRM pelas rotas abaixo, e toca a fila de
follow-up automático.

Regras do projeto que valem aqui: CLAUDE.md §3.7 (LGPD) e §6.4 (CRM).

## Autenticação

Todas as rotas `/api/agent/*` exigem:

```
Authorization: Bearer <API_TOKEN>
```

Token fixo, não sessão. Respostas de erro têm sempre `error` (código estável)
e `mensagem` (texto em português dirigido ao agente — é um modelo de
linguagem decidindo o que fazer em seguida; leia a mensagem).

| Status | `error` | Quando |
|---|---|---|
| `401` | `unauthorized` | token ausente ou errado |
| `500` | `server_misconfigured` | `API_TOKEN` ausente no servidor ou com menos de 32 caracteres (fica logado) — avise a equipe, não repita |
| `429` | `rate_limited` | escrita acima de 60/h com o token (`Retry-After` em segundos) — espere e repita |
| `503` | `banco_indisponivel` | banco fora do ar — repita com intervalo |

## `GET /api/agent/leads?telefone=...`

Chamado a cada mensagem recebida: "quem é esta pessoa?". O telefone aceita
`+55`, máscara ou só dígitos — contam os 10–11 dígitos nacionais.

Não achou → **200**, não 404 (contato novo é fluxo normal):

```json
{ "encontrado": false, "telefone": "(41) 98888-1253", "telefoneE164": "5541988881253" }
```

Achou:

```json
{
  "encontrado": true,
  "lead": {
    "id": "cmf1x9k2c0000abcd1234efgh",
    "nome": "Maria Souza",
    "telefone": "(41) 98888-1253",
    "telefoneE164": "5541988881253",
    "status": "CONTATADO",
    "modeloInteresse": "S60",
    "uso": "Ir ao trabalho",
    "origem": "meta-whatsapp",
    "optOut": false,
    "followupsEnviados": 1,
    "ultimoFollowup": "2026-08-27T13:00:00.000Z",
    "proximoContatoEm": null,
    "criadoEm": "2026-08-26T18:12:40.000Z",
    "atualizadoEm": "2026-08-27T13:00:00.000Z",
    "notas": [{ "texto": "[follow-up 1] Oi Maria, ...", "criadoEm": "2026-08-27T13:00:00.000Z" }]
  }
}
```

`notas` traz as 10 mais recentes. **`optOut: true` significa que a pessoa
revogou o contato: não insista em agendar nem em vender — responda o que ela
perguntar e encerre.** `telefone` é como o CRM grava (máscara); `telefoneE164`
é como o WhatsApp espera.

## `POST /api/agent/leads` — upsert por telefone

```json
{
  "telefone": "+55 41 98888-1253",
  "nome": "Maria Souza",
  "modeloInteresse": "S60",
  "uso": "Ir ao trabalho",
  "origem": "meta-whatsapp",
  "status": "CONTATADO",
  "proximoContatoEm": "2026-08-30T14:00:00-03:00",
  "observacao": "Gasta R$ 300/mês de ônibus, quer test drive no sábado.",
  "optOut": true
}
```

| Campo | Obrigatório | Regra |
|---|---|---|
| `telefone` | sim | chave do upsert; 10–11 dígitos nacionais, com ou sem +55; inválido → `400 telefone_invalido` |
| `nome` | não | até 120. Lead criado sem nome fica como "Sem nome" até o agente descobrir |
| `modeloInteresse` | não | até 120; nome comercial como no site (S60, E30…) ou "Ainda não sei" |
| `uso` | não | até 60; o CRM usa `Ir ao trabalho`, `Delivery`, `Uso pessoal` |
| `origem` | não | até 40, livre (`meta-whatsapp`, `meta-c1`…), padrão `whatsapp-automacao`. **Só na criação**: lead existente mantém a origem original |
| `status` | não | `NOVO`, `CONTATADO`, `NEGOCIANDO`, `TEST_DRIVE_AGENDADO` (este exige `proximoContatoEm`). Outro valor → `400 status_invalido` |
| `proximoContatoEm` | só com test drive | ISO 8601 com fuso, ex. `2026-08-30T14:00:00-03:00` |
| `observacao` | não | até 2000; vira nota `[agente] …` |
| `optOut` | não | **só `true`**: a pessoa pediu para não ser mais contatada. `false` → `400 optout_invalido`; revogação não se desfaz pela API |

**Só os campos enviados mudam.** Um POST com só `nome` não apaga o
`modeloInteresse` já salvo. Mudança de status gera nota
`[agente] Status: X → Y`; outras mudanças não geram nota.

**`VENDIDO` e `PERDIDO` → `403 status_reservado_ao_humano`**, de propósito:
venda tem valor e data, perda tem motivo, e ambas são registradas por uma
pessoa no painel. Uma alucinação do modelo não pode sujar o faturamento nem
o relatório de perdas. A `mensagem` do 403 diz o que fazer no lugar (escrever
em `observacao`; ou `optOut: true` se foi revogação).

Resposta: `201 { ok, leadId, status, criado: true }` ao criar; `200 { …,
criado: false }` ao atualizar. Guardar o `leadId` é conveniência — o próximo
POST com o mesmo telefone cai no mesmo lead.

Lead novo nasce com registro de consentimento `whatsapp_automacao` (data,
hora e versão da política). Ver "LGPD" abaixo: o agente só pode criar o lead
depois da concordância.

## `GET /api/agent/followups` — fila de retomada

Devolve quem está elegível a receber uma mensagem automática de retomada.
Qual mensagem mandar (etapa 1d / 3d / 10d) é decisão do n8n; aqui só a parte
que depende do banco:

- `optOut = false`;
- menos de **3** follow-ups enviados;
- status fora de `VENDIDO` e `PERDIDO`;
- nenhum follow-up nas últimas **24 h**.

Ordenado por `atualizadoEm` crescente (quem está parado há mais tempo
primeiro), no máximo 200.

```json
{
  "total": 2,
  "fila": [
    {
      "leadId": "cmf1x9k2c0000abcd1234efgh",
      "nome": "Maria",
      "telefone": "(41) 98888-1253",
      "telefoneE164": "5541988881253",
      "status": "CONTATADO",
      "modeloInteresse": "S60",
      "diasSemContato": 3,
      "followupsEnviados": 1
    }
  ]
}
```

`nome` é só o primeiro nome, ou `"tudo bem"` quando não se sabe (para
`Oi {{nome}}`). `diasSemContato` conta a partir de `ultimoFollowup` se
houver, senão de `atualizadoEm` — o próprio follow-up não zera a contagem
como se fosse resposta da pessoa.

## `POST /api/agent/followups` — marcar como enviado

Depois de mandar a mensagem:

```json
{ "leadId": "cmf1x9k2c0000abcd1234efgh", "etapa": 1, "mensagem": "Oi Maria, tudo bem? ..." }
```

Incrementa o contador, grava a hora e cria a nota `[follow-up 1] …`.
Resposta `{ ok: true, followupsEnviados: 2 }`; `404 lead_nao_encontrado` se o
`leadId` não existe. Se o lead já estava com `optOut`, a resposta vem com
`aviso` — a mensagem fica registrada, mas o agente deve parar.

## Rate limit: 60 gravações por hora, por token

Vale para os dois `POST`, num balde só; `GET` não tem limite (é consultado a
cada mensagem e só lê). O limite é **por token**, não por IP
(`LIMITE_EXTERNO_POR_TOKEN` em `lib/rateLimit.ts`): o agente sai de um IP
só, então um limite por IP seria o teto da campanha inteira. O número:

- **Volume real**: uma loja local com campanha click-to-WhatsApp gera dezenas
  de conversas por dia, não centenas por hora. Um pico forte (anúncio recém
  publicado, sábado de manhã) fica na casa de 10–20 conversas/hora, cada uma
  com 1–3 gravações. 60/h dá folga de várias vezes sobre isso.
- **Dano contido**: se o token vazar, o pior caso é ~1.400 gravações por dia,
  todas com a mesma `origem`, apagáveis pelo filtro de `/admin/leads`. Não é
  defesa contra vazamento (isso é trocar o token), é o que segura o estrago
  até a troca.
- **Sem estado externo**: o contador vive na memória do container (um só),
  como o do formulário. Reiniciar o container zera — inofensivo.

Se a campanha crescer a ponto de bater no limite, é um número só para subir.

## Gerar e instalar o token

Na VPS, em `/srv/full-electric`:

```bash
openssl rand -hex 32                       # copie o resultado (64 caracteres)
nano .env                                  # API_TOKEN=<resultado>
docker compose up -d                       # variável de runtime: só recriar o container
```

Cole o mesmo valor no n8n (credencial do tipo Header Auth, ou
`{{ $env.API_TOKEN }}`). Use um token **diferente** do `CRON_SECRET`.

Trocar o token: gere outro, atualize o `.env`, `docker compose up -d`, atualize
o n8n. Entre um passo e outro o agente recebe `401` — faça fora do horário da
campanha ou aceite a perda de alguns minutos.

## LGPD — o que o agente precisa fazer

A rota grava um registro de consentimento `whatsapp_automacao` ao criar o
lead, com data, hora e versão da política. Isso só é verdade se, **na
conversa, antes de pedir os dados**, o agente:

1. se identificar como atendimento automatizado;
2. dizer para que os dados servem: retorno comercial da Full Electric sobre
   as motos (nada além disso) e, se a conversa ficar em aberto, até 3
   mensagens de retomada;
3. apontar a política: `https://fulleletric.unysystens.com.br/politica-de-privacidade`;
4. só chamar o `POST /api/agent/leads` depois de a pessoa concordar (um
   "pode sim" basta — registre a frase na `observacao`).

Sem concordância, a conversa segue no WhatsApp e **nada** é gravado. Pedido
para parar ("não me chame mais", "pare") → `POST` com `optOut: true` na
hora; pedido de exclusão dos dados → encaminhar à equipe, que exclui na
ficha (art. 18). Não mande na `observacao` nada além do necessário: sem
documentos, sem endereço completo, sem dados de pagamento.

## Testes com `curl`

Com `export API_TOKEN=...` e `URL=https://fulleletric.unysystens.com.br`:

```bash
# 1. Buscar por telefone (contato novo → 200 encontrado:false)
curl -sS "$URL/api/agent/leads?telefone=%2B5541988881253" \
  -H "Authorization: Bearer $API_TOKEN"

# 2. Criar/atualizar lead (201 na primeira vez, 200 depois)
curl -sS -X POST "$URL/api/agent/leads" \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"telefone":"+55 41 98888-1253","nome":"Maria Souza","modeloInteresse":"S60","uso":"Ir ao trabalho","origem":"meta-whatsapp","status":"CONTATADO","observacao":"Concordou em ser contatada. Quer test drive no sábado."}'

# 2b. VENDIDO → 403 status_reservado_ao_humano
curl -sS -X POST "$URL/api/agent/leads" \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"telefone":"+55 41 98888-1253","status":"VENDIDO"}'

# 3. Fila de follow-up
curl -sS "$URL/api/agent/followups" -H "Authorization: Bearer $API_TOKEN"

# 4. Marcar follow-up enviado (leadId da resposta do passo 2 ou 3)
curl -sS -X POST "$URL/api/agent/followups" \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"leadId":"<leadId>","etapa":1,"mensagem":"Oi Maria, tudo bem? Ficou alguma dúvida sobre a S60?"}'
```

Depois do teste, exclua o lead de teste na ficha (`/admin/leads/<leadId>`).

## No admin

- `/admin/leads` — filtro "Origem" lista `meta-whatsapp`, `meta-c1`… tal
  como enviados.
- `/admin/leads/<id>` — notas `[agente] …` e `[follow-up n] …`; cartão
  "Consentimento LGPD" com o histórico. `optOut` ainda não aparece na ficha
  (pendência): hoje só a API marca.
