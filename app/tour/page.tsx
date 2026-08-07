"use client";

import Link from "next/link";
import { MATTERPORT_URL } from "@/app/_lib/constants";

export default function TourPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-5 md:px-[34px] pt-8 md:pt-10 pb-8 flex flex-col gap-5 h-[calc(100vh-4rem)] min-h-[560px]">
      {/* ── Head ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 flex-shrink-0">
        <div className="flex flex-col gap-2.5">
          <Link href="/" className="backlink">
            ← Accueil
          </Link>
          <h1 className="font-display text-ink text-[28px] md:text-[38px] leading-none">
            La visite 360°
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-line text-[11px] font-medium uppercase tracking-[0.12em] text-ink-2">
            <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
            En direct · Anfa Place
          </span>
          <Link href="/stores" className="btn btn-ghost">
            Le répertoire
          </Link>
        </div>
      </div>

      {/* ── Panorama ── */}
      <div className="relative flex-1 min-h-0 rounded-[14px] overflow-hidden border border-line">
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

        <div className="on-dark absolute left-5 bottom-5 flex flex-col gap-1.5 px-4 py-3 rounded-xl glass pointer-events-none max-w-[280px]">
          <span className="eyebrow">Déplacez-vous librement</span>
          <span className="text-[11px] leading-[1.5] text-ink-2">
            Cliquez au sol pour avancer, faites glisser pour regarder autour de
            vous.
          </span>
        </div>
      </div>
    </div>
  );
}
