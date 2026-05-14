import type { Metadata } from "next";

import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.meta.impressumTitle,
    description: dict.meta.impressumDescription,
    alternates: { canonical: "/impressum" },
    openGraph: {
      type: "article",
      url: "/impressum",
      title: `${dict.meta.impressumTitle} · Daddel`,
      description: dict.meta.impressumOgDescription,
    },
    twitter: {
      card: "summary",
      title: `${dict.meta.impressumTitle} · Daddel`,
      description: dict.meta.impressumOgDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ImpressumPage() {
  const dict = await getDict();
  return (
    <article className="w-full max-w-prose space-y-8">
      <h1>{dict.impressum.title}</h1>

      <section className="space-y-2">
        <h2>{dict.impressum.angabenHeading}</h2>
        <p className="text-foreground">Maximilian Jeschek</p>
        <p className="text-foreground">Bürgerstraße 30</p>
        <p className="text-foreground">01127 Dresden</p>
        <p className="text-foreground">{dict.impressum.germany}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.impressum.contactHeading}</h2>
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
        <h2>{dict.impressum.mstvHeading}</h2>
        <p className="text-foreground">Maximilian Jeschek</p>
        <p className="text-foreground">Bürgerstraße 30</p>
        <p className="text-foreground">01127 Dresden</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.impressum.liabilityContentHeading}</h2>
        <p>{dict.impressum.liabilityContentBody}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.impressum.liabilityLinksHeading}</h2>
        <p>{dict.impressum.liabilityLinksBody}</p>
      </section>

      <section className="space-y-2">
        <h2>{dict.impressum.disputeHeading}</h2>
        <p>{dict.impressum.disputeBody}</p>
      </section>
    </article>
  );
}
