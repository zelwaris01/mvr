/**
 * Meridian initial plate.
 *
 * A shop's mark is its initials in Instrument Serif on the inverted fill —
 * the same plate the design uses on store cards and boutique heroes.
 *
 * There is no logo file to load. The pins do carry the brands' real logos
 * (usually the first photo in the gallery) and the cards show them; this plate
 * is what stands in wherever a small, uniform mark is wanted, and for the two
 * pins that carry no photo at all. The /public/stores/*.svg placeholders this
 * once described belonged to the eight invented brands and are deleted.
 */
const INITIALS: Record<string, string> = {
  electroplanet: "EP",
  razana: "RZ",
  springfield: "SF",
  lnko: "LN",
  "duo-zou-lu": "DZ",
  "planet-sport": "PS",
  womensecret: "WS",
  faces: "FA",
  rosabella: "RB",
  carrousel: "CA",
  chocorico: "CH",
  "maki-mac": "MM",
  sogno: "SO",
  alti: "AL",
  "summer-market": "SM",
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
