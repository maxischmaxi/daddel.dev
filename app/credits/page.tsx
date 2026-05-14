import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { DialedGgWordmark } from "@/components/dialed-gg-wordmark";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.meta.creditsTitle,
    description: dict.meta.creditsDescription,
    alternates: { canonical: "/credits" },
    openGraph: {
      type: "article",
      url: "/credits",
      title: `${dict.meta.creditsTitle} · Daddel`,
      description: dict.meta.creditsOgDescription,
    },
    twitter: {
      card: "summary",
      title: `${dict.meta.creditsTitle} · Daddel`,
      description: dict.meta.creditsOgDescription,
    },
    robots: { index: true, follow: true },
  };
}

const AURORA_GRADIENT =
  "conic-gradient(from var(--aurora-angle), hsl(0,100%,60%), hsl(60,100%,60%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,65%), hsl(300,100%,60%), hsl(360,100%,60%))";

export default async function CreditsPage() {
  const dict = await getDict();
  return (
    <article className="w-full max-w-prose space-y-10">
      <header className="relative flex flex-col items-start gap-3 pt-4">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-6 -top-2 size-32 rounded-full opacity-20 blur-3xl motion-safe:animate-aurora-spin sm:size-40"
          style={{ background: AURORA_GRADIENT }}
        />
        <p className="relative font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {dict.credits.aTributeTo}
        </p>
        <a
          href="https://dialed.gg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={dict.credits.openOriginal}
          className="relative inline-block rounded-sm text-foreground transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <DialedGgWordmark className="h-10 w-auto sm:h-14" />
        </a>
      </header>

      <section className="space-y-4">
        <p className="text-foreground">
          {dict.credits.intro1Lead}{" "}
          <a
            href="https://dialed.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            dialed.gg
          </a>{" "}
          {dict.credits.intro1Mid} <strong>Geoff</strong>{" "}
          {dict.credits.intro1Tail} <strong>Sam</strong>.
        </p>
        <p>{dict.credits.paragraph2}</p>
        <p>
          {dict.credits.intro3Lead}{" "}
          <a
            href="https://dialed.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            dialed.gg
          </a>
          {dict.credits.intro3Tail}
        </p>
      </section>

      <section>
        <a
          href="https://dialed.gg"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground no-underline transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>{dict.credits.ctaButton}</span>
          <ArrowUpRight
            aria-hidden="true"
            strokeWidth={2.25}
            className="size-4 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <h2>{dict.credits.propsHeading}</h2>
        <p>{dict.credits.propsBody}</p>
      </section>
    </article>
  );
}
