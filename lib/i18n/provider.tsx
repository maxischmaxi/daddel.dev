"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  COOKIE_NAME,
  STORAGE_KEY,
  isLocale,
  type Locale,
} from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();

  const dict = useMemo(() => getDictionary(initialLocale), [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (!isLocale(next)) return;
      if (typeof document !== "undefined") {
        const oneYear = 60 * 60 * 24 * 365;
        document.cookie = `${COOKIE_NAME}=${next}; max-age=${oneYear}; path=/; SameSite=Lax`;
      }
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore quota / privacy mode */
        }
      }
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale: initialLocale, dict, setLocale }),
    [initialLocale, dict, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocaleContext must be used inside <LocaleProvider>");
  }
  return ctx;
}
