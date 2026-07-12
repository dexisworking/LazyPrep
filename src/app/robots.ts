import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/courses",
        "/practice",
        "/flashcards",
        "/profile",
        "/settings",
        "/offline",
      ],
    },
    sitemap: "https://lazyprep.iamdex.codes/sitemap.xml",
  };
}
