import type { Metadata } from "next";

import { getDict } from "@/lib/i18n/server";

import SoundGame from "./sound-game";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  const description = dict.meta.soundDescription;
  return {
    title: dict.meta.soundTitle,
    description,
    alternates: { canonical: "/sound" },
    openGraph: {
      type: "website",
      url: "/sound",
      title: `${dict.meta.soundTitle} · Daddel`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.soundTitle} · Daddel`,
      description,
    },
  };
}

export default async function SoundPage() {
  const dict = await getDict();

  const gameJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Sound",
    url: "https://daddel.dev/sound",
    description: dict.meta.soundDescription,
    applicationCategory: "Game",
    genre: ["Audio", "Ear Training", "Casual"],
    gamePlatform: "Web Browser",
    inLanguage: dict.langTag,
    operatingSystem: "Any",
    playMode: ["SinglePlayer", "MultiPlayer"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  });

  return (
    <>
      <SoundGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
