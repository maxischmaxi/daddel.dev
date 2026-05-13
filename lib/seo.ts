export const siteConfig = {
  url: "https://daddel.dev",
  name: "Daddel",
  shortName: "Daddel",
  title: "Daddel · Browser Games",
  description:
    "Kleine Reaktions- und Wahrnehmungsspiele direkt im Browser. Solo, im Team oder gegen die globale Bestenliste. Ohne Login, ohne Cookies, ohne Installation.",
  locale: "de_DE",
  language: "de",
  author: "Maximilian Jeschek",
  email: "max@jeschek.dev",
  themeColorLight: "#ffffff",
  themeColorDark: "#1f2022",
  keywords: [
    "Browser Games",
    "Browser Spiele",
    "Mini Games",
    "Reaktionsspiele",
    "Wahrnehmungsspiele",
    "Online Spiele",
    "kostenlos",
    "ohne Login",
    "ohne Cookies",
    "Color Game",
    "Sound Game",
    "Daddel",
  ],
} as const;

export type SitePath = "/" | "/sound" | "/time" | "/impressum" | "/datenschutz";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized === "/" ? "" : normalized}`;
}
