/**
 * Meridian initial plate.
 *
 * The bundled /public/stores/*.svg files are dark-on-gold Arial placeholders
 * that fight the palette in light mode, so the kit sets a boutique's mark as
 * its initial in Instrument Serif on the inverted fill instead — the same
 * plate the design uses on store cards and boutique heroes.
 */
const INITIALS: Record<string, string> = {
  zara: "Z",
  flo: "FL",
  guess: "G",
  birkenstock: "B",
  mango: "M",
  sephora: "S",
  nike: "N",
  paul: "P",
};

export function StoreLogo({
  slug,
  name,
  size = 40,
  variant = "fill",
  className = "",
}: {
  slug: string;
  name: string;
  size?: number;
  /** "fill" = ivory/ink plate, "outline" = hairline plate on the page ground */
  variant?: "fill" | "outline";
  className?: string;
}) {
  const initials = INITIALS[slug] || name.charAt(0).toUpperCase();

  return (
    <div
      aria-hidden
      className={`grid place-items-center flex-shrink-0 overflow-hidden ${
        variant === "fill"
          ? "bg-fill text-on-fill"
          : "bg-surface-2 border border-line text-brass"
      } ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(6, Math.round(size * 0.16)),
      }}
    >
      <span
        className="font-display leading-none select-none"
        style={{ fontSize: Math.round(size * 0.42) }}
      >
        {initials}
      </span>
    </div>
  );
}
