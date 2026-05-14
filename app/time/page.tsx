import type { Metadata } from "next";

import { getDict } from "@/lib/i18n/server";

import TimeGame from "./time-game";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  const description = dict.meta.timeDescription;
  return {
    title: dict.meta.timeTitle,
    description,
    alternates: { canonical: "/time" },
    openGraph: {
      type: "website",
      url: "/time",
      title: `${dict.meta.timeTitle} · Daddel`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.timeTitle} · Daddel`,
      description,
    },
  };
}

export default async function TimePage() {
  const dict = await getDict();

  const gameJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Time",
    url: "https://daddel.dev/time",
    description: dict.meta.timeDescription,
    applicationCategory: "Game",
    genre: ["Timing", "Perception", "Casual"],
    gamePlatform: "Web Browser",
    inLanguage: dict.langTag,
    operatingSystem: "Any",
    playMode: ["SinglePlayer"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  });

  return (
    <>
      <TimeGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
