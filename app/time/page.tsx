import type { Metadata } from "next";

import TimeGame from "./time-game";

const description =
  "Schätze eine gehörte und gesehene Zeitspanne – halte die Card danach genauso lange gedrückt. Zeitgefühl direkt im Browser, ohne Login.";

export const metadata: Metadata = {
  title: "Time",
  description,
  alternates: { canonical: "/time" },
  openGraph: {
    type: "website",
    url: "/time",
    title: "Time · Daddel",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Time · Daddel",
    description,
  },
};

const gameJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Time",
  url: "https://daddel.dev/time",
  description,
  applicationCategory: "Game",
  genre: ["Timing", "Perception", "Casual"],
  gamePlatform: "Web Browser",
  inLanguage: "de",
  operatingSystem: "Any",
  playMode: ["SinglePlayer"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
});

export default function TimePage() {
  return (
    <>
      <TimeGame />
      <script type="application/ld+json">{gameJsonLd}</script>
    </>
  );
}
