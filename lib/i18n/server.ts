import { cookies, headers } from "next/headers";

import {
  COOKIE_NAME,
  DEFAULT_LOCALE,
  detectFromAcceptLanguage,
  isLocale,
  type Locale,
} from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get(COOKIE_NAME)?.value;
    if (isLocale(fromCookie)) return fromCookie;
  } catch {
    /* ignore — cookies() may throw outside a request context */
  }
  try {
    const h = await headers();
    return detectFromAcceptLanguage(h.get("accept-language"));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function getDict(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}
