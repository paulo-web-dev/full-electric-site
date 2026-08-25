/*
  Rate limit por IP com janela deslizante, em memória do processo.
  O site roda em um único container, então o mapa é global de fato. Se um dia
  houver mais de uma réplica, cada uma terá seu próprio teto — trocar por Redis
  nesse caso.
*/

const janelas = new Map<string, number[]>();

export function permitido(
  chave: string,
  limite: number,
  janelaMs: number
): boolean {
  const agora = Date.now();
  const recentes = (janelas.get(chave) ?? []).filter(
    (t) => agora - t < janelaMs
  );

  if (recentes.length >= limite) {
    janelas.set(chave, recentes);
    return false;
  }

  recentes.push(agora);
  janelas.set(chave, recentes);

  // Limpeza para o mapa não crescer sem limite
  if (janelas.size > 5000) {
    for (const [k, tempos] of janelas) {
      if (tempos.every((t) => agora - t >= janelaMs)) janelas.delete(k);
    }
  }
  return true;
}

/*
  IP do cliente a partir de X-Forwarded-For.

  Cada proxy confiável acrescenta ao FIM da lista o IP de quem falou com ele;
  tudo o que vem antes foi enviado pelo cliente e pode ser forjado. Com N
  proxies confiáveis na frente (TRUST_PROXY_HOPS=N), o IP real é o N-ésimo a
  contar do fim.

  Em produção o site está atrás do Traefik da VPS, e só dele: N=1. Detalhe
  que confunde: o Traefik NÃO acrescenta o próprio IP à lista — ele acrescenta
  o IP de quem falou com ele, que é o visitante. Na configuração padrão
  (forwardedHeaders sem trustedIPs) ele ainda descarta qualquer X-Forwarded-For
  vindo de fora e entrega a lista com um único item, o IP real. Nos dois casos
  o último item é o visitante, e N=1 lê exatamente esse. Só vira 2 se entrar
  outro proxy na frente do Traefik (ex.: Cloudflare) E o Traefik for
  configurado para confiar nele (docs/DEPLOY.md, seção "IP real").

  Sem a variável (ou com valor inválido / menor que 1) mantém o comportamento
  original: o primeiro IP da lista. Atrás de proxy isso é perigoso — todo mundo
  pode cair na mesma chave e o limite bloqueia o site inteiro.
*/
export function ipDoCliente(headers: Headers): string {
  const lista = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((parte) => parte.trim())
    .filter(Boolean);
  if (lista.length === 0) return "desconhecido";

  const hops = Number.parseInt(process.env.TRUST_PROXY_HOPS ?? "", 10);
  if (!Number.isInteger(hops) || hops < 1) return lista[0];

  return lista[Math.max(0, lista.length - hops)];
}
