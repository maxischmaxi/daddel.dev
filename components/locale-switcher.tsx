"use client";

import { Fragment } from "react";

import { LOCALES } from "@/lib/i18n/config";
import { useDict, useLocale } from "@/lib/i18n/use-t";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const dict = useDict();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-mono text-xs">
      {LOCALES.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && <span className="select-none text-border">·</span>}
          <button
            type="button"
            onClick={() => setLocale(l)}
            className={cn(
              "rounded-sm bg-transparent p-0 no-underline transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              l === locale
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
            aria-current={l === locale ? "true" : undefined}
            aria-label={interpolate(dict.footer.languageAriaLabelTemplate, {
              code: l.toUpperCase(),
            })}
          >
            {l}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
