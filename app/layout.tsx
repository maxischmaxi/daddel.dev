import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import Footer from "@/components/footer";
import NavMinimal from "@/components/nav-minimal";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/lib/i18n/provider";
import { getDict, getLocale } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/seo";

import "./globals.css";

const cfAnalyticsToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      template: `%s · ${siteConfig.name}`,
      default: dict.meta.siteTitle,
    },
    description: dict.meta.siteDescription,
    applicationName: siteConfig.name,
    generator: "Next.js",
    keywords: [...dict.keywords],
    authors: [{ name: siteConfig.author, url: siteConfig.url }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    category: "games",
    referrer: "strict-origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
      locale: dict.ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.siteTitle,
      description: dict.meta.siteDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColorLight },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColorDark },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = await getDict();

  const websiteJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: "Browser Games",
    url: siteConfig.url,
    description: dict.meta.siteDescription,
    inLanguage: dict.langTag,
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
  });

  return (
    <html lang={dict.langTag} className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen min-h-dvh flex-col bg-background font-sans text-sm leading-normal text-foreground antialiased">
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavMinimal />
            <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-10">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </LocaleProvider>
        <script type="application/ld+json">{websiteJsonLd}</script>
        {cfAnalyticsToken ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cfAnalyticsToken })}
          />
        ) : null}
      </body>
    </html>
  );
}
