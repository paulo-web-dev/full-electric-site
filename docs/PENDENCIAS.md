# Pendências

## 🔴 Bloqueiam o lançamento

- [x] ~~Confirmar o WhatsApp.~~ **Confirmado em 24/08/2026: `5541988881253`
      / (41) 98888-1253.**
- [ ] **Razão social e CNPJ da loja** — a Política de Privacidade e o rodapé
      devem exibi-los; hoje a política identifica só o nome fantasia.
- [ ] **Medir largura e entre-eixos da S60 e da E30.** Limites legais: 70 cm e
      130 cm. Citycoco costuma ter 75 cm de largura. Se estourar, o veículo é
      ciclomotor e todo o discurso "sem CNH" do site precisa ser reescrito.
- [ ] **Obter do fornecedor**, por escrito: ficha técnica assinada, manual,
      número de identificação e declaração de enquadramento na Res. 996/2023.
- [ ] Endereço da loja, CEP e link do Google Maps.
- [x] ~~Política de Privacidade~~ **No ar em `/politica-de-privacidade`
      (24/08/2026). Falta só razão social/CNPJ (item acima).**

## 🟡 Necessárias para qualidade

- [ ] **Fotos em alta resolução.** As atuais são 384×512 px — servem para card,
      não para herói em desktop. Pedir à BOLIN os originais do catálogo.
- [ ] Ficha técnica completa da **E30** (motor, bateria, velocidade, autonomia,
      freios, preço).
- [ ] Capacidade de carga da S60, conforme o manual.
- [ ] Vida útil e valor de reposição da bateria (está no FAQ como [CONFIRMAR]).
- [ ] Foto da fachada da loja e do time.
- [ ] 3 depoimentos em vídeo de clientes reais.
- [ ] IDs de GA4 e Meta Pixel (o site não usa GTM). Entram por `.env`
      (`NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID`) + rebuild da imagem.
      Faixa de cookies, gate de consentimento e política já prontos
      (26/08/2026) — com os IDs vazios a faixa nem aparece.

## 🟢 Melhorias depois do lançamento

- [ ] Teste real de autonomia gravado em Curitiba (Centro → Boqueirão → Centro)
- [x] ~~Página `/precisa-de-cnh` para SEO~~ **No ar (26/08/2026).** Os
      fatos sobre a fiscalização no Paraná vêm de `docs/03-legal-contran.md`;
      se o cliente tiver fonte oficial (Detran-PR/BPTran), anexar ao doc.
- [x] ~~Página `/para-entregadores`~~ **No ar (26/08/2026).** Formulário
      grava com `origem: "entregadores"` e uso pré-selecionado "Delivery".
- [ ] Widget de avaliações do Google
- [ ] Blog com dicas de legislação
- [ ] Rotina de expurgo dos leads sem contato há 12 meses (a política de
      privacidade promete isso; hoje a exclusão é só manual na ficha)
