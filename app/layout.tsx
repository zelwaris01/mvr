import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { GameStateProvider } from "@/app/_components/GameStateProvider";
import { LocaleProvider } from "@/app/_lib/i18n";
import { MATTERPORT_SDK_KEY, SDK_BOOTSTRAP_URL } from "@/app/_lib/constants";

const archivo = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Mall Experience — By MVR World",
  description:
    "Explorez le mall en visite 360°, repérez les boutiques et répondez à leurs quiz pour gagner des récompenses.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${instrumentSerif.variable} antialiased`}
      suppressHydrationWarning
    >
      {/* The tour cannot start until four separate origins have been resolved,
          connected and TLS-negotiated, and none of them is touched until React
          has mounted and the iframe exists. Warming the connections during
          HTML parse takes those round trips off the critical path — on a phone
          on mobile data that is the difference between one and two seconds
          before Matterport even begins downloading the model. */}
      <head>
        <link rel="preconnect" href="https://my.matterport.com" />
        <link rel="preconnect" href="https://static.matterport.com" />
        <link rel="preconnect" href="https://cdn-2.matterport.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* For browsers that ignore preconnect but honour this. */}
        <link rel="dns-prefetch" href="https://my.matterport.com" />
        <link rel="dns-prefetch" href="https://static.matterport.com" />
        <link rel="dns-prefetch" href="https://cdn-2.matterport.com" />
        {/* The SDK bootstrap was previously requested only once React had
            hydrated and the tour had mounted — seconds in, and in direct
            competition with the model download. Fetching it during HTML parse
            means `connect()` finds it already in cache.
            crossOrigin: module imports are always CORS requests, so the
            preload has to be one too or the browser refuses to reuse it. */}
        {MATTERPORT_SDK_KEY && (
          <link
            rel="modulepreload"
            href={SDK_BOOTSTRAP_URL}
            crossOrigin="anonymous"
          />
        )}
      </head>
      {/* The visit fills the viewport and nothing scrolls the document —
          every surface is a floating overlay above the panorama. */}
      {/* lang="fr" above is the server's answer and the one React hydrates
          against; LocaleProvider rewrites it on the live document once it has
          read the visitor's stored choice. */}
      <body className="h-dvh overflow-hidden bg-bg text-ink">
        <LocaleProvider>
          <GameStateProvider>{children}</GameStateProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
