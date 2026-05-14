import type { Metadata } from "next";

import { getDict } from "@/lib/i18n/server";

import AngleGame from "./angle-game";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  const description = dict.meta.angleDescription;
  return {
    title: dict.meta.angleTitle,
    description,
    alternates: { canonical: "/angle" },
    openGraph: {
      type: "website",
      url: "/angle",
      title: `${dict.meta.angleTitle} · Daddel`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.angleTitle} · Daddel`,
      description,
    },
  };
}

export default async function AnglePage() {
  const dict = await getDict();

  const gameJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Angle",
    url: "https://daddel.dev/angle",
    description: dict.meta.angleDescription,
    applicationCategory: "Game",
    genre: ["Perception", "Spatial", "Casual"],
    gamePlatform: "Web Browser",
    inLanguage: dict.langTag,
    operatingSystem: "Any",
    playMode: ["SinglePlayer", "MultiPlayer"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  });

  return (
    <>
      <AngleGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
