import Link from "next/link";
import { Fragment } from "react";

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
    <footer className="flex items-center justify-center gap-2.5 p-6 font-mono text-xs text-muted-foreground">
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
    </footer>
  );
}
