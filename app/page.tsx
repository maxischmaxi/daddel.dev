import type { Metadata } from "next";

import { getDict } from "@/lib/i18n/server";

import ColorGame from "./color/color-game";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  const description = dict.meta.colorDescription;
  return {
    title: dict.meta.colorTitle,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      title: `${dict.meta.colorTitle} · Daddel`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.colorTitle} · Daddel`,
      description,
    },
  };
}

export default async function HomePage() {
  const dict = await getDict();

  const gameJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Color",
    url: "https://daddel.dev/",
    description: dict.meta.colorDescription,
    applicationCategory: "Game",
    genre: ["Reaction", "Perception", "Casual"],
    gamePlatform: "Web Browser",
    inLanguage: dict.langTag,
    operatingSystem: "Any",
    playMode: ["SinglePlayer", "MultiPlayer"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  });

  return (
    <>
      <ColorGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
