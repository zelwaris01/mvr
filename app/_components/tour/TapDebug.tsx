"use client";

import { useEffect, useState } from "react";

/**
 * On-screen readout of the raw touch sequence. Opt-in with `?tap=1`.
 *
 * A phone has no console, and every round of guessing at this bug has cost a
 * deploy. This shows, on the device, exactly which events arrive and what the
 * browser thinks is under the finger — enough to tell "the event never fires"
 * apart from "the event fires on the wrong element".
 *
 * `pointer-events: none` throughout: the readout must not become part of the
 * thing it is measuring.
 */
export function TapDebug() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const push = (line: string) =>
      setLines((prev) => [...prev.slice(-9), line]);

    const describe = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return "nothing";
      const cls =
        typeof el.className === "string" ? el.className.slice(0, 28) : "";
      const tappable = el.closest("button, a") ? "✓btn" : "✗";
      return `${el.tagName.toLowerCase()}.${cls || "—"} ${tappable}`;
    };

    const log = (name: string) => (e: Event) => {
      if (e instanceof PointerEvent) {
        push(
          `${name}/${e.pointerType} ${Math.round(e.clientX)},${Math.round(
            e.clientY
          )} → ${describe(e.clientX, e.clientY)}`
        );
      } else if (e instanceof TouchEvent) {
        const t = e.changedTouches[0];
        if (!t) return push(`${name} (no touch)`);
        push(
          `${name} ${Math.round(t.clientX)},${Math.round(t.clientY)} → ${describe(
            t.clientX,
            t.clientY
          )}`
        );
      } else {
        push(name);
      }
    };

    const names = [
      "pointerdown",
      "pointerup",
      "pointercancel",
      "touchstart",
      "touchend",
      "touchcancel",
      "click",
    ];
    const handlers = names.map((n) => {
      const h = log(n);
      document.addEventListener(n, h, true);
      return [n, h] as const;
    });
    return () =>
      handlers.forEach(([n, h]) => document.removeEventListener(n, h, true));
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: 6,
        bottom: 6,
        zIndex: 2147483647,
        pointerEvents: "none",
        maxWidth: "94vw",
        padding: "6px 8px",
        borderRadius: 8,
        background: "rgba(0,0,0,.82)",
        color: "#9ef",
        font: "500 9.5px/1.45 ui-monospace, monospace",
        whiteSpace: "pre-wrap",
      }}
    >
      {`vw=${typeof window === "undefined" ? "?" : window.innerWidth}\n`}
      {lines.join("\n") || "tap something…"}
    </div>
  );
}
