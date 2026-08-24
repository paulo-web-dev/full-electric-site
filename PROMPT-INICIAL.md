# Prompt inicial para o Claude Code

Abra o terminal nesta pasta, rode `claude` e cole o texto abaixo.

---

```
Leia CLAUDE.md, docs/ e content/ antes de escrever qualquer código. Eles são a
fonte de verdade deste projeto.

Contexto: sou dono da Full Electric, revenda de motos elétricas em Curitiba.
Preciso de um site que transforme visitante em conversa no WhatsApp ou em test
drive agendado. Não é e-commerce — não existe carrinho nem pagamento online.

Sua tarefa nesta primeira sessão:

1. Inicialize um projeto Next.js 15 com App Router, TypeScript e Tailwind CSS v4
   aqui nesta pasta, preservando content/, docs/ e public/ como estão.

2. Implemente o design system descrito na seção 4 do CLAUDE.md:
   - tokens de cor como CSS variables em app/globals.css
   - fonte Inter via next/font/google
   - componentes base em components/ui/: Button (variantes primary, secondary,
     whatsapp), Card, Chip, Section, Accordion
   - ATENÇÃO à regra de contraste: o verde #D2FC13 nunca pode ser texto sobre
     fundo claro. Só como fundo com texto preto, ou como texto sobre preto.

3. Crie lib/content.ts para ler content/*.json com tipos TypeScript, e
   lib/whatsapp.ts com a função waLink(origem, modelo?) que monta o link wa.me
   com a mensagem correta de cada origem (a tabela está em docs/04-copy.md).

4. Monte a home (app/page.tsx) com as 11 seções na ordem da seção 5.2 do
   CLAUDE.md, usando os textos aprovados de docs/04-copy.md. Comece pelas
   quatro primeiras: Herói, Barra de números, Modelos e Economia. Me mostre
   essas quatro antes de seguir para o resto.

5. Adicione o botão flutuante de WhatsApp e o header.

Regras que não podem ser violadas — estão detalhadas na seção 3 do CLAUDE.md,
mas as principais:
- "sem CNH" só aparece se a Resolução CONTRAN 996/2023 estiver citada no mesmo
  bloco visual
- autonomia é sempre a faixa "40 a 55 km", nunca um número único
- garantia é de 6 meses, nunca 1 ano
- preço é sempre "a partir de R$ 8.499", com a nota de rodapé
- parcelamento em 18x sempre com asterisco e "*com juros" visível
- nada de localStorage ou sessionStorage

Trabalhe mobile-first: desenhe para 375px e depois expanda. A maior parte do
tráfego vem de celular.

Quando terminar os passos 1 a 5, rode npm run build, me diga o que ficou
pronto, e liste o que você precisa de mim para continuar.
```

---

## Prompts para as sessões seguintes

**Sessão 2 — completar a home**
```
Continue a home a partir da seção 5 (Você se identifica?) até a 11 (rodapé),
seguindo docs/04-copy.md. O bloco legal (seção 6) é o mais importante do site:
mostre os 5 critérios da Res. 996/2023 lado a lado com os números da nossa
moto, e a caixa com os 5 itens do Dossiê de Conformidade.
```

**Sessão 3 — páginas de modelo**
```
Crie app/modelos/[slug]/page.tsx com galeria de fotos, ficha técnica em
tabela, itens de série, bloco legal e CTA. Gere as rotas estáticas a partir de
content/modelos.json. Campos com "confirmado": false não podem ser exibidos
como fato — omita a linha ou mostre "consulte".
```

**Sessão 4 — formulário e leads**
```
Implemente o formulário de contato com 5 campos (nome, whatsapp, modelo, uso,
horário para test drive), máscara de telefone brasileiro e validação. Ao
enviar: grava o lead via /api/lead e abre o WhatsApp com a mensagem montada,
igual ao padrão que a BOLIN usa. Crie também a página /contato.
```

**Sessão 5 — SEO e performance**
```
Adicione metadata por página, JSON-LD (LocalBusiness, Product, FAQPage),
sitemap.ts, robots.ts e a página de política de privacidade. Depois otimize:
quero LCP abaixo de 2,5s no 4G. Me mostre o resultado do build com os tamanhos.
```

**Sessão 6 — landing pages de campanha**
```
Crie /precisa-de-cnh (conteúdo educativo sobre a Res. 996/2023, mirando busca
orgânica) e /para-entregadores (LP para motoboy, com o passo a passo do
cadastro no iFood na modalidade Bicicleta Elétrica). Use docs/03-legal-contran.md
como base. Cuidado: nunca mencionar desbloqueio de velocidade.
```
