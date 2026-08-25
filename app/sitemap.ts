import type { MetadataRoute } from "next";
import { getModelos } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const agora = new Date();

  return [
    { url: `${base}/`, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    ...getModelos().map((modelo) => ({
      url: `${base}/modelos/${modelo.slug}`,
      lastModified: agora,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    {
      url: `${base}/contato`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/politica-de-privacidade`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
