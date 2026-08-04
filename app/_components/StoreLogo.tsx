"use client";

import Image from "next/image";
import { useState } from "react";

const INITIALS: Record<string, string> = {
  zara: "Z",
  flo: "FL",
  guess: "G",
  birkenstock: "BK",
  mango: "M",
  sephora: "S",
  nike: "N",
  paul: "P",
};

export function StoreLogo({
  slug,
  name,
  size = 40,
  className = "",
}: {
  slug: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = `/brands/${slug}.svg`;
  const initials = INITIALS[slug] || name.charAt(0).toUpperCase();

  return (
    <div
      className={`bg-surface-1 border border-line rounded-xl flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size, padding: size * 0.14 }}
    >
      {failed ? (
        <span
          className="text-brass font-bold select-none leading-none"
          style={{ fontSize: size * 0.35 }}
        >
          {initials}
        </span>
      ) : (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-contain w-full h-full"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
