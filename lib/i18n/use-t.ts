"use client";

import { useLocaleContext } from "./provider";
import type { Dictionary } from "./dictionaries";
import type { Locale } from "./config";

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}

export function useDict(): Dictionary {
  return useLocaleContext().dict;
}
