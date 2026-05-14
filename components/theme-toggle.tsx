"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useDict } from "@/lib/i18n/use-t";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dict = useDict();

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      aria-label={dict.common.themeToggle}
      onClick={toggle}
      className="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{dict.common.themeToggle}</span>
    </button>
  );
}
