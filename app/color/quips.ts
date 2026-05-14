import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatScore } from "@/lib/i18n/format";

export function getRandomQuip(
  score: number,
  dict: Dictionary,
  locale: Locale,
): string {
  const clamped = Math.max(0, Math.min(10, score));
  const bucket = Math.floor(clamped);
  const list = dict.quips.color[bucket];
  if (!list || list.length === 0) return dict.quips.colorFallback;
  const template = list[Math.floor(Math.random() * list.length)];
  return template.replace("{score}", formatScore(score, locale, 1));
}
