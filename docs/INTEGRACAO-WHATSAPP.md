# Integração — automação do WhatsApp → CRM

Campanha click-to-WhatsApp no Meta abre a conversa direto no WhatsApp: não
passa por página do site, não carrega UTM e o formulário nunca é preenchido.
Sem isto, o lead fica só no WhatsApp. A automação de IA que atende a conversa
grava o lead no CRM chamando a rota abaixo.

Regras do projeto que valem aqui: CLAUDE.md §3.7 (LGPD) e §6.4 (CRM).

## O endpoint

```
POST https://fulleletric.unysystens.com.br/api/lead/externo
Authorization: Bearer <API_TOKEN>
Content-Type: application/json
```

Autenticação por token fixo, não por sessão. Sem token ou com token errado:
`401`.

### Corpo

| Campo | Obrigatório | Tipo / limite | Observação |
|---|---|---|---|
| `nome` | sim | texto, 120 | |
| `telefone` | sim | texto, 20 | DDD + número, 10 ou 11 dígitos. Aceita `+55`, máscara, espaços — só os dígitos contam. É a **chave de idempotência**. |
| `email` | não | texto, 160 | Validado; inválido → `400`. |
| `modeloInteresse` | não | texto, 60 | Use o nome comercial como está no site (S60, E30…) ou "Ainda não sei". |
| `uso` | não | texto, 60 | O CRM usa `Ir ao trabalho`, `Delivery`, `Uso pessoal`. |
| `comoConheceu` | não | enum | `PANFLETO`, `GOOGLE`, `INSTAGRAM`, `INDICACAO`, `PASSOU_NA_FRENTE`, `OUTRO` (maiúsculas ou minúsculas). Outro valor → `400`. |
| `origem` | não | texto, 40 | Livre: `meta-whatsapp`, `meta-c1`… Padrão: `whatsapp-automacao`. Aparece como filtro em `/admin/leads`. |
| `observacao` | não | texto, 2000 | Resumo da conversa. Vira **nota** na ficha, prefixada com `[origem]`. |

### Idempotência por telefone

- Telefone **novo** → cria o lead (status `NOVO`), grava a observação como
  primeira nota. Resposta `201`.
- Telefone **já existente** (em qualquer máscara) → **não duplica**. Acrescenta
  a observação como nota nova (sem observação, registra uma nota "Novo
  contato pelo atendimento automatizado"), e preenche só o que estava vazio
  no lead: `email`, `modeloInteresse`, `uso`, `comoConheceu`, consentimento.
  Nome, origem e tudo que já tinha valor **não mudam**. Resposta `200`.

Toda chamada gera uma nota, de propósito: é o registro do contato, e é o que
renova a retenção de 12 meses do expurgo LGPD (houve contato de verdade).

**Consentimento:** cada chamada grava um registro no histórico de
consentimento do lead (`tipo: whatsapp_automacao`, versão da política, data,
origem), **exceto** se já houver um da automação nas últimas 24 h — assim,
complementar a mesma conversa não duplica o registro, mas um contato novo
semanas depois registra a nova manifestação. Lead que já existia (formulário
ou balcão) ganha o registro novo ao lado dos antigos: nada é sobrescrito.

Se houver duas chamadas simultâneas para um telefone ainda inexistente, pode
sair duplicata (não há trava de unicidade no banco); na prática a automação
manda uma chamada por conversa, e a ficha permite excluir a sobra.

### Resposta

```json
{ "ok": true, "id": "cmf1x9k2c0000abcd1234efgh", "criado": true }
```

`id` é o do lead no CRM (`/admin/leads/<id>`). Guarde-o se a automação for
complementar a conversa depois — mas a segunda chamada com o **mesmo telefone**
já cai no mesmo lead, então o `id` é conveniência, não requisito.

| Status | Quando | O que fazer |
|---|---|---|
| `201` | lead criado | — |
| `200` | lead já existia; nota adicionada e vazios preenchidos | — |
| `400` | JSON inválido ou campo inválido (`erro` explica) | corrigir, não repetir |
| `401` | token ausente/errado | conferir `API_TOKEN` |
| `429` | mais de 60 chamadas por hora com o token (`Retry-After` em segundos) | esperar e repetir |
| `503` | banco indisponível | repetir com intervalo |

### Rate limit: 60 por hora, por token

O limite é **por token**, não por IP (`LIMITE_EXTERNO_POR_TOKEN` em
`lib/rateLimit.ts`): a automação sai de um IP só, então um limite por IP seria
o teto da campanha inteira; e trocar de IP não muda nada para quem tem o
token. O número:

- **Volume real**: uma loja local com campanha click-to-WhatsApp gera dezenas
  de conversas por dia, não centenas por hora. Um pico forte (anúncio recém
  publicado, sábado de manhã) fica na casa de 10–20 conversas/hora. 60/h dá
  3 a 6 vezes de folga sobre esse pico — inclusive contando as chamadas
  repetidas do mesmo telefone, que também consomem cota.
- **Dano contido**: se o token vazar, o pior caso é ~1.400 leads falsos por
  dia, todos com a mesma `origem`, apagáveis pelo filtro de `/admin/leads`.
  Sem limite, seria um banco inutilizável em minutos. Não é defesa contra
  vazamento (isso é trocar o token), é o que segura o estrago até a troca.
- **Sem estado externo**: o contador vive na memória do container (um só) —
  a mesma implementação do formulário. Reiniciar o container zera o contador,
  o que é inofensivo.

Se a campanha crescer a ponto de bater no limite, é um número só para subir.
A automação deve tratar `429` com nova tentativa depois do `Retry-After`.

## Exemplo de chamada

```bash
curl -sS -X POST https://fulleletric.unysystens.com.br/api/lead/externo \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Souza",
    "telefone": "+55 41 98888-1253",
    "modeloInteresse": "S60",
    "uso": "Ir ao trabalho",
    "comoConheceu": "INSTAGRAM",
    "origem": "meta-whatsapp",
    "observacao": "Gasta R$ 300/mês de ônibus, quer test drive no sábado de manhã."
  }'
```

Em n8n / Make: nó HTTP Request, método POST, "Send Headers" com
`Authorization: Bearer {{ $env.API_TOKEN }}`, corpo JSON com os campos acima.
Trate `429` e `503` com nova tentativa (ex.: 3 tentativas, 1 min entre elas).

## Gerar e instalar o token

Na VPS, em `/srv/full-electric`:

```bash
openssl rand -hex 32                       # copie o resultado
nano .env                                  # API_TOKEN=<resultado>
docker compose up -d                       # variável de runtime: só recriar o container
```

Depois, cole o mesmo valor na automação. Use um token **diferente** do
`CRON_SECRET`: são sistemas distintos com permissões distintas, e trocar um
não deve derrubar o outro.

Teste sem gravar nada de verdade: mande um lead com seu próprio telefone e
depois exclua-o na ficha (`/admin/leads/<id>` → "Excluir definitivamente").

Trocar o token: gere outro, atualize o `.env`, `docker compose up -d`, atualize
a automação. Entre um passo e outro a automação recebe `401` — faça fora do
horário da campanha ou aceite a perda de alguns minutos.

## O que a automação precisa fazer antes de chamar (LGPD)

A rota grava um registro de consentimento `whatsapp_automacao`, com data,
hora e a versão da política vigente. Isso só é verdade se, **na conversa,
antes de pedir os dados**, a automação:

1. se identificar como atendimento automatizado;
2. dizer para que os dados servem: retorno comercial da Full Electric sobre
   as motos (nada além disso);
3. apontar a política: `https://fulleletric.unysystens.com.br/politica-de-privacidade`;
4. só chamar a rota depois de a pessoa concordar (um "pode sim" basta —
   registre a frase na `observacao`).

Se a pessoa não concordar, a conversa segue no WhatsApp e **nada** é enviado
ao CRM. Pedido de exclusão feito na conversa: a automação encaminha à equipe,
que exclui na ficha (direito de eliminação — art. 18).

Não mande na `observacao` nada além do necessário para o atendimento: sem
documentos, sem endereço completo, sem dados de pagamento (a política promete
minimização, CLAUDE.md §3.7).

## No admin

- `/admin/leads` — filtro "Origem" lista `meta-whatsapp`, `meta-c1`… tal como
  enviados.
- `/admin/leads/<id>` — o cartão "Consentimento LGPD" lista o histórico
  completo (tipo, data/hora, versão da política, origem); a observação
  aparece nas notas com o prefixo `[origem]`.
- Lead que já existia (veio do formulário ou do balcão) mantém a origem
  original; o contato novo fica registrado na nota.
