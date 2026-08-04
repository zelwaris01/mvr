export function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-2 ${className}`}
    >
      <div className="w-1 h-4 rounded-full bg-brass" />
      {children}
    </h2>
  );
}
