import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Servidor próprio via Docker: gera .next/standalone com só o necessário
  // para rodar (ver Dockerfile e docs/DEPLOY.md).
  output: "standalone",
  images: {
    // AVIF primeiro: ~30% menor que WebP nas fotos de estúdio
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
