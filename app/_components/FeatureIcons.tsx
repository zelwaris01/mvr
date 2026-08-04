"use client";

const FEATURES = [
  { label: "Points d'Info", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> },
  { label: "Lieu d'Achat", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
  { label: "Photos & Produits", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg> },
  { label: "Offres & Promos", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
  { label: "Expérience Immersive", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> },
  { label: "Parcours Gamifié", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
];

export function FeatureIcons() {
  return (
    <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1">
      {FEATURES.map((feat) => (
        <div
          key={feat.label}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-1 border border-line flex items-center justify-center text-ink-3 group-hover:text-brass group-hover:border-brass/30 transition-colors">
            {feat.icon}
          </div>
          <span className="text-[8px] text-ink-3 text-center leading-tight max-w-[70px] group-hover:text-ink-2 transition-colors">
            {feat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
