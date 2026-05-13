import type { Metadata } from "next";

import ColorGame from "./color/color-game";

const description =
  "Triff die Zielfarbe mit RGB-Reglern – solo, im Team oder gegen die globale Bestenliste. Reaktion und Wahrnehmung direkt im Browser, ohne Login.";

export const metadata: Metadata = {
  title: "Color",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Color · Daddel",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Color · Daddel",
    description,
  },
};

const gameJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Color",
  url: "https://daddel.dev/",
  description,
  applicationCategory: "Game",
  genre: ["Reaction", "Perception", "Casual"],
  gamePlatform: "Web Browser",
  inLanguage: "de",
  operatingSystem: "Any",
  playMode: ["SinglePlayer", "MultiPlayer"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
});

export default function HomePage() {
  return (
    <>
      <ColorGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
