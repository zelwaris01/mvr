/**
 * Meridian progress ring — a conic brass sweep with the page background
 * punched out of the middle. Used for level, quiz and tier progress.
 */
export function ProgressRing({
  pct,
  size = 44,
  thickness = 5,
  label,
  children,
  className = "",
}: {
  pct: number;
  size?: number;
  thickness?: number;
  label?: string;
  /** Replaces the default numeric label — for larger, typeset rings. */
  children?: React.ReactNode;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const inner = size - thickness * 2;

  return (
    <div
      className={`relative grid place-items-center rounded-full flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--brass) 0 ${clamped}%, var(--line) ${clamped}% 100%)`,
      }}
    >
      <div
        className="grid place-items-center rounded-full bg-bg"
        style={{ width: inner, height: inner }}
      >
        {children ?? (
          <span
            className="text-brass font-semibold tabular-nums leading-none"
            style={{ fontSize: Math.max(9, Math.round(size * 0.21)) }}
          >
            {label ?? `${Math.round(clamped)}%`}
          </span>
        )}
      </div>
    </div>
  );
}
