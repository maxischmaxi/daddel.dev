export const LOCALES = ["de", "en", "uk"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";

export const COOKIE_NAME = "browser-games:locale";
export const STORAGE_KEY = "browser-games:locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function detectFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .map((p) => p.split(";")[0]);
  for (const p of parts) {
    if (p.startsWith("uk") || p.startsWith("ua")) return "uk";
    if (p.startsWith("en")) return "en";
    if (p.startsWith("de")) return "de";
  }
  return DEFAULT_LOCALE;
}
