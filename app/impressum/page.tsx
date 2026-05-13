import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Anbieterkennzeichnung und Kontakt­informationen gemäß §5 TMG für daddel.dev.",
  alternates: { canonical: "/impressum" },
  openGraph: {
    type: "article",
    url: "/impressum",
    title: "Impressum · Daddel",
    description: "Anbieterkennzeichnung gemäß §5 TMG für daddel.dev.",
  },
  twitter: {
    card: "summary",
    title: "Impressum · Daddel",
    description: "Anbieterkennzeichnung gemäß §5 TMG für daddel.dev.",
  },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <article className="w-full max-w-prose space-y-8">
      <h1>Impressum</h1>

      <section className="space-y-2">
        <h2>Angaben gemäß §5 TMG</h2>
        <p className="text-foreground">Maximilian Jeschek</p>
        <p className="text-foreground">Bürgerstraße 30</p>
        <p className="text-foreground">01127 Dresden</p>
        <p className="text-foreground">Deutschland</p>
      </section>

      <section className="space-y-2">
        <h2>Kontakt</h2>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:max@jeschek.dev"
            className="text-foreground underline-offset-2 hover:underline"
          >
            max@jeschek.dev
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2>Verantwortlich für den Inhalt nach §18 Abs. 2 MStV</h2>
        <p className="text-foreground">Maximilian Jeschek</p>
        <p className="text-foreground">Bürgerstraße 30</p>
        <p className="text-foreground">01127 Dresden</p>
      </section>

      <section className="space-y-2">
        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter bin ich gemäß §7 Abs. 1 TMG für eigene Inhalte auf
          diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§8
          bis 10 TMG bin ich als Diensteanbieter jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen
          oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
          hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung
          von Informationen nach den allgemeinen Gesetzen bleiben hiervon
          unberührt.
        </p>
      </section>

      <section className="space-y-2">
        <h2>Haftung für Links</h2>
        <p>
          Diese Seite enthält keine externen Links. Sollten in Zukunft Links zu
          externen Webseiten Dritter eingebunden werden, übernehme ich für
          deren Inhalte keine Haftung. Für die Inhalte der verlinkten Seiten
          ist stets der jeweilige Anbieter oder Betreiber der Seiten
          verantwortlich.
        </p>
      </section>

      <section className="space-y-2">
        <h2>Streitschlichtung</h2>
        <p>
          Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
          vor einer Verbraucherschlichtungsstelle gemäß §36 VSBG teilzunehmen.
        </p>
      </section>
    </article>
  );
}
