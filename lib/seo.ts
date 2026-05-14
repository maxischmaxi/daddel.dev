export const siteConfig = {
  url: "https://daddel.dev",
  name: "Daddel",
  shortName: "Daddel",
  author: "Maximilian Jeschek",
  email: "max@jeschek.dev",
  themeColorLight: "#ffffff",
  themeColorDark: "#1f2022",
} as const;

export type SitePath = "/" | "/sound" | "/time" | "/impressum" | "/datenschutz";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized === "/" ? "" : normalized}`;
}
