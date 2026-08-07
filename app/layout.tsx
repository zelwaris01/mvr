import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { GameStateProvider } from "@/app/_components/GameStateProvider";
import { Header } from "@/app/_components/Header";
import { BottomNav } from "@/app/_components/BottomNav";

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
  title: "Smart Mall — Digital Experience",
  description:
    "Explorez le mall virtuel, découvrez les boutiques, répondez aux quiz et gagnez des récompenses !",
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
      className={`${archivo.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <GameStateProvider>
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <BottomNav />
        </GameStateProvider>
      </body>
    </html>
  );
}
