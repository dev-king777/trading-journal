import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return ["", "/login", "/signup"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
