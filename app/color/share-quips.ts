import type { Dictionary } from "@/lib/i18n/dictionaries";

function pick(list: readonly string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

export function getShareQuip(score: number, dict: Dictionary): string {
  const buckets = dict.shareQuips.color;
  let bucket: readonly string[];
  if (score >= 34) bucket = buckets.high;
  else if (score >= 17) bucket = buckets.mid;
  else bucket = buckets.low;
  return pick(bucket).replace("{score}", score.toFixed(3));
}

export function buildShareText(
  score: number,
  url: string,
  dict: Dictionary,
): string {
  return `${getShareQuip(score, dict)}\n${url}`;
}
