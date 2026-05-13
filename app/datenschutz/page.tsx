import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
};

export default function DatenschutzPage() {
  return (
    <article className="w-full max-w-prose space-y-8">
      <h1>Datenschutzerklärung</h1>

      <section className="space-y-2">
        <p>
          Diese Datenschutzerklärung informiert über Art, Umfang und Zweck der
          Verarbeitung personenbezogener Daten auf dieser Website (im Folgenden
          „Browser Games") gemäß Art. 13 DSGVO.
        </p>
      </section>

      <section className="space-y-2">
        <h2>1. Verantwortlicher</h2>
        <p className="text-foreground">Maximilian Jeschek</p>
        <p className="text-foreground">Bürgerstraße 30</p>
        <p className="text-foreground">01127 Dresden</p>
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
        <h2>2. Hosting bei Cloudflare</h2>
        <p>
          Diese Website wird auf der Infrastruktur der Cloudflare Inc. (101
          Townsend Street, San Francisco, CA 94107, USA) betrieben. Beim Aufruf
          der Seite verarbeitet Cloudflare technisch erforderliche Daten (IP-
          Adresse, User-Agent, Zeitstempel, aufgerufene URL) zur Auslieferung
          der Inhalte und zur Abwehr von Angriffen.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
          Interesse am sicheren und stabilen Betrieb der Website). Beim
          Drittlandtransfer in die USA stützt sich Cloudflare auf
          Standardvertragsklauseln (SCCs) und ist nach dem EU-US Data Privacy
          Framework zertifiziert.
        </p>
      </section>

      <section className="space-y-2">
        <h2>3. Cloudflare Web Analytics</h2>
        <p>
          Zur Reichweitenmessung wird Cloudflare Web Analytics eingesetzt. Es
          werden anonymisiert Seitenaufrufe, Referrer, Browser-Typ und Land
          erfasst. Es werden{" "}
          <strong className="text-foreground">keine Cookies</strong> gesetzt,
          es findet kein Fingerprinting statt, und IP-Adressen werden lediglich
          kurzzeitig im Arbeitsspeicher zur Bot-Erkennung verarbeitet und nicht
          dauerhaft gespeichert.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an Reichweitenmessung). Weitere Informationen:{" "}
          <a
            href="https://www.cloudflare.com/web-analytics/"
            className="text-foreground underline-offset-2 hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            cloudflare.com/web-analytics
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2>4. Cloudflare Workers Analytics Engine</h2>
        <p>
          Für interne Statistiken über die Nutzung der Spiele werden
          anonymisierte Ereignisse erfasst (gestartete Spiele, beendete Spiele,
          fehlgeschlagene Score-Übermittlungen). Erfasst werden jeweils
          Spielname (Color/Sound), Spielmodus, Gesamtpunktzahl sowie ein
          Zeitstempel. Es werden{" "}
          <strong className="text-foreground">
            keine Nutzerkennungen, IP-Adressen oder Namen
          </strong>{" "}
          an die Analytics Engine übermittelt.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an Produktverbesserung und Stabilitätsanalyse).
        </p>
      </section>

      <section className="space-y-2">
        <h2>5. Speicherung von Spielständen</h2>
        <p>
          Wenn Sie an einer globalen Rangliste oder einem Team-Spiel
          teilnehmen, werden Ihr selbstgewählter Anzeigename, eine zufällig
          erzeugte Client-Kennung (UUID, pseudonym) sowie Ihre erzielten
          Spielergebnisse in einer Datenbank (Cloudflare D1) gespeichert, um
          die Ranglisten- und Team-Funktion bereitzustellen.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an der Bereitstellung der Spielfunktionen). Die Client-Kennung lässt
          ohne Ihre Mitwirkung keinen Rückschluss auf Ihre Person zu. Eine
          Löschung Ihrer gespeicherten Spielstände ist jederzeit per E-Mail an
          die oben genannte Adresse möglich.
        </p>
      </section>

      <section className="space-y-2">
        <h2>6. Lokale Speicherung im Browser</h2>
        <p>
          Damit Sie unter dem gleichen Namen weiterspielen können, werden Ihr
          gewählter Anzeigename sowie eine zufällige Client-Kennung in Ihrem
          Browser im Local Storage abgelegt
          (Schlüssel:{" "}
          <code className="text-foreground">browser-games:player-name</code>
          {" "}und{" "}
          <code className="text-foreground">browser-games:client-id</code>).
          Diese Speicherung ist technisch erforderlich für die Spielfunktion
          und damit nach §25 Abs. 2 Nr. 2 TTDSG zulässig.{" "}
          <strong className="text-foreground">Ein Cookie-Banner ist nicht erforderlich</strong>,
          da kein Tracking-Cookie gesetzt wird.
        </p>
      </section>

      <section className="space-y-2">
        <h2>7. Ihre Rechte</h2>
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul className="space-y-1">
          <li className="text-foreground">— Auskunft (Art. 15 DSGVO)</li>
          <li className="text-foreground">— Berichtigung (Art. 16 DSGVO)</li>
          <li className="text-foreground">— Löschung (Art. 17 DSGVO)</li>
          <li className="text-foreground">
            — Einschränkung der Verarbeitung (Art. 18 DSGVO)
          </li>
          <li className="text-foreground">
            — Datenübertragbarkeit (Art. 20 DSGVO)
          </li>
          <li className="text-foreground">— Widerspruch (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte genügt eine formlose Mitteilung an{" "}
          <a
            href="mailto:max@jeschek.dev"
            className="text-foreground underline-offset-2 hover:underline"
          >
            max@jeschek.dev
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2>8. Beschwerderecht</h2>
        <p>
          Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde zu
          beschweren. Zuständig ist der Sächsische Datenschutzbeauftragte
          (Devrientstraße 5, 01067 Dresden).
        </p>
      </section>

      <section className="space-y-2">
        <h2>9. Stand</h2>
        <p>Stand dieser Datenschutzerklärung: Mai 2026.</p>
      </section>
    </article>
  );
}
