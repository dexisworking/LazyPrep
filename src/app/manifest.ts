import type { MetadataRoute } from "next";
import { cookies } from "next/headers";

const VALID = new Set(["gradient", "light", "dark", "mono"]);

/**
 * Dynamic manifest: the icon set reflects the user's `lazyprep-icon` cookie so
 * a chosen variant is used when they install to the home screen. Defaults to
 * the gradient tile. (Android can't change an already-installed icon; this
 * governs install time.)
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const store = await cookies();
  const picked = store.get("lazyprep-icon")?.value;
  const v = picked && VALID.has(picked) ? picked : "gradient";

  return {
    name: "LazyPrep — The Preparation OS",
    short_name: "LazyPrep",
    description:
      "Your complete preparation operating system for certifications, competitive exams, and professional training.",
    id: "/",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    categories: ["education", "productivity"],
    icons: [
      { src: `/icons/${v}-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `/icons/${v}-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `/icons/${v}-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/monochrome-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
    ],
  };
}
