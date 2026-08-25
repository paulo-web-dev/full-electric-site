/*
  URL canônica do site — sitemap, robots e JSON-LD dependem dela.
  NEXT_PUBLIC_SITE_URL é fixada NO BUILD (arg do Docker, ver README); mudar o
  domínio exige rebuild da imagem.
*/
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
