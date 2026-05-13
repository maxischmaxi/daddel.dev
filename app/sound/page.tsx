import type { Metadata } from "next";

import SoundGame from "./sound-game";

const description =
  "Triff die Zielfrequenz nach Gehör – solo, im Team oder gegen die globale Bestenliste. Gehörtraining direkt im Browser, ohne Login.";

export const metadata: Metadata = {
  title: "Sound",
  description,
  alternates: { canonical: "/sound" },
  openGraph: {
    type: "website",
    url: "/sound",
    title: "Sound · Daddel",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sound · Daddel",
    description,
  },
};

const gameJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Sound",
  url: "https://daddel.dev/sound",
  description,
  applicationCategory: "Game",
  genre: ["Audio", "Ear Training", "Casual"],
  gamePlatform: "Web Browser",
  inLanguage: "de",
  operatingSystem: "Any",
  playMode: ["SinglePlayer", "MultiPlayer"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
});

export default function SoundPage() {
  return (
    <>
      <SoundGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
