import Link from "next/link";
import { Fragment } from "react";

import { DialedGgWordmark } from "@/components/dialed-gg-wordmark";
import LocaleSwitcher from "@/components/locale-switcher";
import { getDict } from "@/lib/i18n/server";

export default async function Footer() {
  const dict = await getDict();

  const footerItems = [
    { key: "impressum", label: dict.footer.impressum, href: "/impressum" },
    { key: "datenschutz", label: dict.footer.datenschutz, href: "/datenschutz" },
  ];

  return (
    <footer className="flex shrink-0 flex-col items-center gap-2 px-4 py-4 font-mono text-xs text-muted-foreground sm:gap-2.5 sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        {footerItems.map((item, i) => (
          <Fragment key={item.key}>
            {i > 0 && <span className="select-none text-border">·</span>}
            <Link
              href={item.href}
              className="no-underline transition-colors duration-150 hover:text-foreground"
            >
              {item.label.toLowerCase()}
            </Link>
          </Fragment>
        ))}
        <span className="select-none text-border">·</span>
        <Link
          href="/credits"
          aria-label={dict.footer.creditsAriaLabel}
          className="group inline-flex items-center gap-1.5 no-underline transition-colors duration-150 hover:text-foreground"
        >
          <span>{dict.footer.inspiredBy}</span>
          <DialedGgWordmark className="h-3 w-auto opacity-80 transition-opacity duration-150 group-hover:opacity-100" />
        </Link>
      </div>
      <LocaleSwitcher />
    </footer>
  );
}
