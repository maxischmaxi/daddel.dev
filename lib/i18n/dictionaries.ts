import de from "@/messages/de";
import en from "@/messages/en";
import uk from "@/messages/uk";

import type { Dictionary } from "@/messages/schema";
import type { Locale } from "./config";

const ALL: Record<Locale, Dictionary> = { de, en, uk };

export function getDictionary(locale: Locale): Dictionary {
  return ALL[locale];
}

export type { Dictionary };
