import type { MetadataRoute } from "next";

import { getDict, getLocale } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const dict = await getDict();
  const locale = await getLocale();
  return {
    name: `${siteConfig.name} · Browser Games`,
    short_name: siteConfig.shortName,
    description: dict.meta.siteDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: locale,
    background_color: siteConfig.themeColorDark,
    theme_color: siteConfig.themeColorDark,
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
