"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import AudioToggle from "@/components/audio-toggle";
import ThemeToggle from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type NavItem = {
  key: string;
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { key: "color", label: "Color", href: "/" },
  { key: "sound", label: "Sound", href: "/sound" },
  { key: "time", label: "Time", href: "/time" },
  { key: "angle", label: "Angle", href: "/angle" },
];

const keyForPath = (path: string): string => {
  if (path === "/") return "color";
  const segment = path.split("/")[1] ?? "";
  return segment || "color";
};

export default function NavMinimal() {
  const pathname = usePathname();
  const current = keyForPath(pathname);

  return (
    <nav className="relative flex shrink-0 items-center justify-center gap-2.5 px-4 py-4 font-mono text-xs text-muted-foreground sm:p-6">
      {navItems.map((item, i) => (
        <Fragment key={item.key}>
          {i > 0 && <span className="select-none text-border">·</span>}
          <Link
            href={item.href}
            className={cn(
              "no-underline transition-colors duration-150 hover:text-foreground",
              item.key === current
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {item.label.toLowerCase()}
          </Link>
        </Fragment>
      ))}
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:right-6">
        <ThemeToggle />
        <AudioToggle />
      </div>
    </nav>
  );
}
