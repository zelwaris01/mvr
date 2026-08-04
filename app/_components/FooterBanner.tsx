export function FooterBanner() {
  return (
    <div className="bg-[var(--brass)] py-4 px-6">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <p className="text-white font-bold text-xs md:text-sm tracking-[0.1em] uppercase">
          Explorez · Découvrez · Répondez · Gagnez
        </p>
        <span className="hidden md:block text-white/60 text-[10px] font-medium tracking-wider">
          Smart Mall Experience
        </span>
      </div>
    </div>
  );
}
