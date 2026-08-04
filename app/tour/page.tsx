"use client";

import Link from "next/link";
import { MATTERPORT_URL } from "@/app/_lib/constants";

export default function TourPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <Link
          href="/"
          className="text-ink-3 hover:text-brass text-xs transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Accueil
        </Link>

        <div className="flex items-center gap-2 bg-surface-1 border border-line rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-jade animate-pulse" />
          <h1 className="text-[10px] font-bold text-brass uppercase tracking-[0.2em]">
            Visite Virtuelle 360°
          </h1>
        </div>

        <div className="w-16" />
      </div>

      {/* Full Matterport iframe */}
      <div className="flex-1 mx-4 md:mx-6 mb-4 rounded-2xl overflow-hidden border border-line relative">
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
      </div>
    </div>
  );
}
