import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { DialedGgWordmark } from "@/components/dialed-gg-wordmark";

export const metadata: Metadata = {
  title: "Credits",
  description:
    "Daddel.dev ist eine Hommage an dialed.gg von Geoff und Sam — props und Dank an die beiden für das Original.",
  alternates: { canonical: "/credits" },
  openGraph: {
    type: "article",
    url: "/credits",
    title: "Credits · Daddel",
    description:
      "Daddel.dev ist eine Hommage an dialed.gg von Geoff und Sam.",
  },
  twitter: {
    card: "summary",
    title: "Credits · Daddel",
    description:
      "Daddel.dev ist eine Hommage an dialed.gg von Geoff und Sam.",
  },
  robots: { index: true, follow: true },
};

const AURORA_GRADIENT =
  "conic-gradient(from var(--aurora-angle), hsl(0,100%,60%), hsl(60,100%,60%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,65%), hsl(300,100%,60%), hsl(360,100%,60%))";

export default function CreditsPage() {
  return (
    <article className="w-full max-w-prose space-y-10">
      <header className="relative flex flex-col items-start gap-3 pt-4">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-6 -top-2 size-32 rounded-full opacity-20 blur-3xl motion-safe:animate-aurora-spin sm:size-40"
          style={{ background: AURORA_GRADIENT }}
        />
        <p className="relative font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Eine Hommage an
        </p>
        <a
          href="https://dialed.gg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="dialed.gg in neuem Tab öffnen"
          className="relative inline-block rounded-sm text-foreground transition-opacity duration-150 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <DialedGgWordmark className="h-10 w-auto sm:h-14" />
        </a>
      </header>

      <section className="space-y-4">
        <p className="text-foreground">
          Daddel.dev ist eine deutsche Hommage an{" "}
          <a
            href="https://dialed.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            dialed.gg
          </a>{" "}
          — die Originalseite von <strong>Geoff</strong> und{" "}
          <strong>Sam</strong>.
        </p>
        <p>
          Praktisch alles auf dieser Seite — die Spielmechaniken, das
          minimalistische Designsystem, die Aurora-Buttons, die kleinen
          Soundeffekte, die Idee selbst — stammt aus ihrem Original. Ich
          habe es nachgebaut, weil ich beeindruckt war von dem, was sie
          geschaffen haben, und es unbedingt selbst verstehen wollte.
        </p>
        <p>
          Wenn dir gefällt, was du hier siehst: schau bei{" "}
          <a
            href="https://dialed.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            dialed.gg
          </a>{" "}
          vorbei. Das ist die echte Sache. Das hier ist nur meine Nachbildung.
        </p>
      </section>

      <section>
        <a
          href="https://dialed.gg"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground no-underline transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>Original auf dialed.gg ansehen</span>
          <ArrowUpRight
            aria-hidden="true"
            strokeWidth={2.25}
            className="size-4 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <h2>Props</h2>
        <p>
          Großer Dank an Geoff und Sam für die Inspiration und die
          wunderschöne Arbeit, die sie an dialed.gg geleistet haben. Die
          Aufmerksamkeit fürs Detail, die Sound-Logik, die Aurora-Hovers —
          all das macht das Original aus. Hier auf daddel.dev habe ich
          versucht, möglichst nahe dran zu bleiben.
        </p>
      </section>
    </article>
  );
}
