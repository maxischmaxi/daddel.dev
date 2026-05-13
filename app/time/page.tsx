import type { Metadata } from "next";

const description =
  "Das Time-Spiel ist in Arbeit – bald kannst du dein Zeitgefühl auf die Probe stellen.";

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

export default function TimePage() {
  return (
    <>
      <h1>Time</h1>
      <p>Hier kommt das Time-Spiel hin.</p>
    </>
  );
}
