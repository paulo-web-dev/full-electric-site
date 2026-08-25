/*
  Sessão do admin: token "exp.assinatura" em cookie httpOnly.
  Usa Web Crypto (crypto.subtle) porque precisa rodar tanto no middleware
  (edge runtime) quanto nas rotas Node.
*/

export const COOKIE_SESSAO = "fe_admin_sessao";
export const SESSAO_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const encoder = new TextEncoder();

async function chaveHmac(segredo: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function paraBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function criarToken(segredo: string): Promise<string> {
  const exp = String(Date.now() + SESSAO_TTL_MS);
  const assinatura = await crypto.subtle.sign(
    "HMAC",
    await chaveHmac(segredo),
    encoder.encode(exp)
  );
  return `${exp}.${paraBase64Url(assinatura)}`;
}

export async function tokenValido(
  token: string | undefined,
  segredo: string | undefined
): Promise<boolean> {
  if (!token || !segredo) return false;
  const [exp, assinatura] = token.split(".");
  if (!exp || !assinatura) return false;
  if (Number.isNaN(Number(exp)) || Date.now() > Number(exp)) return false;

  const esperada = await crypto.subtle.sign(
    "HMAC",
    await chaveHmac(segredo),
    encoder.encode(exp)
  );
  const esperadaB64 = paraBase64Url(esperada);

  // Comparação em tempo constante
  if (assinatura.length !== esperadaB64.length) return false;
  let diferenca = 0;
  for (let i = 0; i < assinatura.length; i++) {
    diferenca |= assinatura.charCodeAt(i) ^ esperadaB64.charCodeAt(i);
  }
  return diferenca === 0;
}
