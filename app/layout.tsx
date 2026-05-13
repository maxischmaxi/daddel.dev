import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Footer from "@/components/footer";
import NavMinimal from "@/components/nav-minimal";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const cfAnalyticsToken = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s · Browser Games",
    default: "Browser Games",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans text-sm leading-normal text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavMinimal />
          <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
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
