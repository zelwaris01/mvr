"use client";

import Link from "next/link";
import { MATTERPORT_URL } from "@/app/_lib/constants";

export function HeroTour() {
  return (
    <section className="relative w-full rounded-2xl overflow-hidden border border-line">
      <div className="relative w-full aspect-[16/10] md:aspect-[2.2/1]">
        {/* The 360° tour IS the hero */}
        <iframe
          src={MATTERPORT_URL}
          width="100%"
          height="100%"
          frameBorder={0}
          allow="fullscreen; xr-spatial-tracking"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          title="Visite virtuelle du mall"
        />

        {/* Minimal bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Single CTA — bottom center, high prominence */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
          <p className="text-white/70 text-xs hidden md:block">
            Anfa Place · Casablanca
          </p>
          <Link
            href="/tour"
            className="pointer-events-auto inline-flex items-center gap-2 bg-brass hover:bg-brass/90 text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors"
          >
            Commencer la visite
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
