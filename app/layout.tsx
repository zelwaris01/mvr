import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { GameStateProvider } from "@/app/_components/GameStateProvider";

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
  title: "MVR World — Smart Mall",
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
      </head>
      {/* The visit fills the viewport and nothing scrolls the document —
          every surface is a floating overlay above the panorama. */}
      <body className="h-dvh overflow-hidden bg-bg text-ink">
        <GameStateProvider>{children}</GameStateProvider>
      </body>
    </html>
  );
}
