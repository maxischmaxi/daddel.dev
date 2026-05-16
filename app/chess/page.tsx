import type { Metadata } from "next";

import { getDict } from "@/lib/i18n/server";

import ChessGame from "./chess-game";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  const description = dict.meta.chessDescription;
  return {
    title: dict.meta.chessTitle,
    description,
    alternates: { canonical: "/chess" },
    openGraph: {
      type: "website",
      url: "/chess",
      title: `${dict.meta.chessTitle} · Daddel`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.meta.chessTitle} · Daddel`,
      description,
    },
  };
}

export default async function ChessPage() {
  const dict = await getDict();

  const gameJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Chess",
    url: "https://daddel.dev/chess",
    description: dict.meta.chessDescription,
    applicationCategory: "Game",
    genre: ["Chess", "Strategy", "Board Game"],
    gamePlatform: "Web Browser",
    inLanguage: dict.langTag,
    operatingSystem: "Any",
    playMode: ["SinglePlayer"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  });

  return (
    <>
      <ChessGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
