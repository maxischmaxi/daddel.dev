import type { Metadata } from "next";

import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.meta.datenschutzTitle,
    description: dict.meta.datenschutzDescription,
    alternates: { canonical: "/datenschutz" },
    openGraph: {
      type: "article",
      url: "/datenschutz",
      title: `${dict.meta.datenschutzTitle} · Daddel`,
      description: dict.meta.datenschutzOgDescription,
    },
    twitter: {
      card: "summary",
      title: `${dict.meta.datenschutzTitle} · Daddel`,
      description: dict.meta.datenschutzOgDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function DatenschutzPage() {
  const dict = await getDict();
  return (
    <article className="w-full max-w-prose space-y-8">
      <h1>{dict.datenschutz.title}</h1>

      <section className="space-y-2">
        <p>{dict.datenschutz.intro}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section1Heading}</h2>
        <p className="text-foreground">Maximilian Jeschek</p>
        <p className="text-foreground">Bürgerstraße 30</p>
        <p className="text-foreground">01127 Dresden</p>
        <p>
          {dict.datenschutz.emailLabel}{" "}
          <a
            href="mailto:max@jeschek.dev"
            className="text-foreground underline-offset-2 hover:underline"
          >
            max@jeschek.dev
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section2Heading}</h2>
        <p>{dict.datenschutz.section2Para1}</p>
        <p>{dict.datenschutz.section2Para2}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section3Heading}</h2>
        <p>
          {dict.datenschutz.section3Para1Lead}{" "}
          <strong className="text-foreground">
            {dict.datenschutz.section3Para1Bold}
          </strong>{" "}
          {dict.datenschutz.section3Para1Tail}
        </p>
        <p>
          {dict.datenschutz.section3Para2Lead}{" "}
          <a
            href="https://www.cloudflare.com/web-analytics/"
            className="text-foreground underline-offset-2 hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            {dict.datenschutz.section3Para2Link}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section4Heading}</h2>
        <p>
          {dict.datenschutz.section4Para1Lead}{" "}
          <strong className="text-foreground">
            {dict.datenschutz.section4Para1Bold}
          </strong>{" "}
          {dict.datenschutz.section4Para1Tail}
        </p>
        <p>{dict.datenschutz.section4Para2}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section5Heading}</h2>
        <p>{dict.datenschutz.section5Para1}</p>
        <p>{dict.datenschutz.section5Para2}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section6Heading}</h2>
        <p>
          {dict.datenschutz.section6Para1Lead}{" "}
          <code className="text-foreground">
            {dict.datenschutz.section6Para1Mid}
          </code>
          ,{" "}
          <code className="text-foreground">
            {dict.datenschutz.section6Para1And}
          </code>
          ,{" "}
          <code className="text-foreground">
            {dict.datenschutz.section6Para1ThirdKey}
          </code>
          {dict.datenschutz.section6Para1AfterKeys}{" "}
          <strong className="text-foreground">
            {dict.datenschutz.section6Para1Bold}
          </strong>
          {dict.datenschutz.section6Para1FinalDot}
        </p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section7Heading}</h2>
        <p>{dict.datenschutz.section7Intro}</p>
        <ul className="space-y-1">
          <li className="text-foreground">{dict.datenschutz.rightInfo}</li>
          <li className="text-foreground">{dict.datenschutz.rightCorrection}</li>
          <li className="text-foreground">{dict.datenschutz.rightDeletion}</li>
          <li className="text-foreground">{dict.datenschutz.rightRestriction}</li>
          <li className="text-foreground">{dict.datenschutz.rightPortability}</li>
          <li className="text-foreground">{dict.datenschutz.rightObjection}</li>
        </ul>
        <p>
          {dict.datenschutz.section7Outro}{" "}
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
        <h2>{dict.datenschutz.section8Heading}</h2>
        <p>{dict.datenschutz.section8Body}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.datenschutz.section9Heading}</h2>
        <p>{dict.datenschutz.section9Body}</p>
      </section>
    </article>
  );
}
