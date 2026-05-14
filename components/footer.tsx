import Link from "next/link";
import { Fragment } from "react";

import { DialedGgWordmark } from "@/components/dialed-gg-wordmark";

type FooterItem = {
  key: string;
  label: string;
  href: string;
};

const footerItems: FooterItem[] = [
  { key: "impressum", label: "Impressum", href: "/impressum" },
  { key: "datenschutz", label: "Datenschutz", href: "/datenschutz" },
];

export default function Footer() {
  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 py-4 font-mono text-xs text-muted-foreground sm:p-6">
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
        aria-label="Credits: inspired by dialed.gg"
        className="group inline-flex items-center gap-1.5 no-underline transition-colors duration-150 hover:text-foreground"
      >
        <span>inspired by</span>
        <DialedGgWordmark className="h-3 w-auto opacity-80 transition-opacity duration-150 group-hover:opacity-100" />
      </Link>
    </footer>
  );
}
