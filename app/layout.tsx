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
  title: "Meridian — Anfa Place",
  description:
    "Explorez le mall en visite 360°, repérez les boutiques et répondez à leurs quiz pour gagner des récompenses.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Dark is the default theme; useTheme re-points this meta on a switch.
  themeColor: "#0b0a09",
};

const themeScript = `(function(){try{var t=localStorage.getItem('smartmall_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* The visit fills the viewport and nothing scrolls the document —
          every surface is a floating overlay above the panorama. */}
      <body className="h-dvh overflow-hidden bg-bg text-ink">
        <GameStateProvider>{children}</GameStateProvider>
      </body>
    </html>
  );
}
