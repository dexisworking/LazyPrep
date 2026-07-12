/**
 * Client-side app-icon preference. Lets users pick which home-screen icon
 * LazyPrep uses when they (re)add / reinstall to their home screen.
 *
 * Platform reality: there is NO web API to repaint an ALREADY-installed PWA /
 * home-screen icon on iOS or Android. So this only governs the icon captured at
 * add-to-home-screen / install time — we persist the choice (localStorage +
 * cookie), swap the served <link rel="apple-touch-icon"> (iOS), and the
 * cookie-aware manifest reflects it for Android installs.
 */

export const ICON_VARIANTS = [
  { key: "gradient", label: "Gradient" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "mono", label: "Mono Blue" },
] as const;

export type IconVariant = (typeof ICON_VARIANTS)[number]["key"];

export const DEFAULT_ICON: IconVariant = "gradient";
const STORAGE_KEY = "lazyprep-icon";

function isVariant(v: string | null | undefined): v is IconVariant {
  return !!v && ICON_VARIANTS.some((x) => x.key === v);
}

/** Preview PNG for a variant (the full squircle tile). */
export function iconPreviewSrc(v: IconVariant): string {
  return `/icons/${v}-512.png`;
}

/** The user's saved choice (defaults to gradient). Browser-only. */
export function getStoredIcon(): IconVariant {
  if (typeof window === "undefined") return DEFAULT_ICON;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return isVariant(v) ? v : DEFAULT_ICON;
}

/**
 * Persist the choice and apply it live. No-op on the server.
 *
 * - Browser-tab favicon: swapped immediately so the choice is VISIBLE now (this
 *   is the feedback users expect — previously only the invisible add-to-home-
 *   screen icon changed, so the picker felt like it did nothing).
 * - apple-touch-icon + cookie-aware manifest: govern the icon captured at
 *   add-to-home-screen / install time (no web API can repaint an already-
 *   installed home-screen icon).
 */
export function applyAppIcon(variant: IconVariant): void {
  if (typeof document === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, variant);
  document.cookie = `${STORAGE_KEY}=${variant}; path=/; max-age=31536000; samesite=lax`;

  // Live browser-tab favicon. Replace every existing icon link (Next injects
  // icon.svg + icon.png, and SVG favicons win by default) with a single PNG for
  // the chosen variant so the swap actually takes effect.
  document.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = `/icons/${variant}-192.png`;
  document.head.appendChild(favicon);

  // iOS add-to-home-screen icon.
  let apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = `/icons/${variant}-apple-180.png`;
}
