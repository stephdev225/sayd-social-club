import type { MetadataRoute } from "next";
import { getStore } from "@/lib/data";
import { listPublicEvents } from "@/lib/data/catalog";
import { PUBLIC_PATHS, siteUrl } from "@/lib/seo";

export const revalidate = 3600;

function entry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  const base = siteUrl();
  return {
    url: `${base}/fr${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    alternates: { languages: { "fr-CA": `${base}/fr${path}`, "en-CA": `${base}/en${path}` } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = PUBLIC_PATHS.map((p) => entry(p));
  try {
    const { upcoming, past } = await listPublicEvents(getStore());
    return [...pages, ...[...upcoming, ...past].map((e) => entry(`/evenements/${e.slug}`, e.updatedAt))];
  } catch {
    return pages;
  }
}
