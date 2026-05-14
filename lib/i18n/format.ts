import type { Locale } from "./config";

export function formatScore(score: number, locale: Locale, decimals = 1): string {
  const fixed = score.toFixed(decimals);
  return locale === "de" ? fixed.replace(".", ",") : fixed;
}
