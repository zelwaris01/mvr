/**
 * Meridian section head — brass eyebrow, serif display title, optional
 * right-hand action slot, closed by a hairline rule.
 */
export function SectionTitle({
  children,
  eyebrow,
  action,
  className = "",
}: {
  children: React.ReactNode;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line pb-5 ${className}`}
    >
      <div className="flex flex-col gap-2.5">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="font-display text-ink text-[26px] md:text-[38px] leading-none">
          {children}
        </h2>
      </div>
      {action}
    </div>
  );
}
