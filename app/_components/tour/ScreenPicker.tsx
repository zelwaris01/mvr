"use client";

import { useCallback, useEffect, useState } from "react";
import type { MpSdk } from "@matterport/sdk";
import type { Vec3 } from "@/app/_lib/tour-nav";

/** Short enough not to wrap in the panel's label column at 13ch. */
const CORNER_LABELS = ["haut gauche", "haut droit", "bas droit", "bas gauche"];
/** The comment written beside each coordinate in the generated snippet. */
const CORNER_KEYS = ["top-left", "top-right", "bottom-right", "bottom-left"];

/**
 * The authoring tool for wall screens. Opt-in with `?screen=1`.
 *
 * Matterport knows nothing about shopfront windows, so the four corners of one
 * have to be pointed at by a human. This is that: click four points in the
 * scene, in order, and it prints the block to paste into screens-data.ts.
 *
 * `Renderer.getWorldPositionData` is what makes it possible — it casts a ray
 * from a screen coordinate into the model and returns where it hit. That is
 * the only route from "the thing I can see" to "the coordinates it lives at",
 * and it is why placing a screen does not require opening Workshop.
 *
 * Deliberately opt-in and unstyled-ish: it is a workbench, not a feature. It
 * costs nothing on a normal visit because TourScreen only mounts it when the
 * query parameter is present.
 */
export function ScreenPicker({
  sdk,
  spaceId,
}: {
  sdk: MpSdk | null;
  spaceId: string;
}) {
  const [points, setPoints] = useState<Vec3[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const pick = useCallback(
    async (clientX: number, clientY: number) => {
      if (!sdk || busy) return;
      setBusy(true);
      setError(null);
      try {
        const data = await sdk.Renderer.getWorldPositionData({
          x: clientX,
          y: clientY,
        });
        if (!data?.position) {
          // The ray left the model — sky through a skylight, or a gap in the
          // mesh. Saying so beats silently recording nothing.
          setError("Rien touché à cet endroit — visez la surface elle-même.");
          return;
        }
        const p = data.position;
        setPoints((prev) =>
          prev.length >= 4 ? [p] : [...prev, { x: p.x, y: p.y, z: p.z }]
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [sdk, busy]
  );

  /**
   * Capture-phase, on the window.
   *
   * The click lands on the Matterport iframe, which is cross-origin — no
   * listener inside it is reachable, and the event never bubbles back out. But
   * a pointerdown on the *host* document still fires before the iframe
   * consumes it, and the coordinates are all this needs.
   */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      // Ignore presses on the panel itself, or it records its own buttons.
      if ((e.target as HTMLElement)?.closest?.("[data-screen-picker]")) return;
      void pick(e.clientX, e.clientY);
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, [pick]);

  const snippet =
    points.length === 4
      ? `{
  id: "screen-1",
  spaceId: ${JSON.stringify(spaceId)},
  corners: [
${points
  .map(
    (p, i) =>
      `    { x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}, z: ${p.z.toFixed(
        3
      )} },  // ${CORNER_KEYS[i]}`
  )
  .join("\n")}
  ],
  video: "https://your-cdn.example/loop.mp4",
  label: "Écran",
}`
      : null;

  const copy = async () => {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Presse-papiers refusé — sélectionnez le texte à la main.");
    }
  };

  return (
    <div
      data-screen-picker
      className="hud-on fixed left-4 top-4 z-[40] flex max-h-[92dvh] w-[min(420px,92vw)] flex-col gap-3 overflow-y-auto rounded-2xl border border-brass-line bg-[rgba(11,10,9,.94)] p-4 text-ink"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[9.5px] uppercase tracking-[0.18em] text-brass">
            Screen picker
          </span>
          <span className="text-[11px] leading-snug text-ink-2">
            Cliquez les 4 coins dans l&apos;ordre, vus de face.
          </span>
        </div>
        <button
          onClick={() => {
            setPoints([]);
            setError(null);
          }}
          className="flex-shrink-0 rounded-full border border-line px-3 py-1.5 text-[10.5px] text-ink-2 transition-colors hover:border-brass-line hover:text-brass"
        >
          Reset
        </button>
      </div>

      <ol className="flex flex-col gap-1">
        {CORNER_LABELS.map((label, i) => {
          const p = points[i];
          return (
            <li
              key={i}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[10.5px] tabular-nums ${
                p
                  ? "border-brass-line bg-brass-soft text-ink"
                  : i === points.length
                  ? "border-brass-line text-brass"
                  : "border-line text-ink-3"
              }`}
            >
              <span className="w-[3ch] flex-shrink-0 text-brass">{i + 1}</span>
              <span className="w-[11ch] flex-shrink-0 whitespace-nowrap">
                {label}
              </span>
              <span className="truncate">
                {p
                  ? `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`
                  : i === points.length
                  ? "← cliquez"
                  : "—"}
              </span>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="rounded-lg border border-clay/40 bg-clay-soft px-2.5 py-2 text-[10.5px] leading-snug text-ink-2">
          {error}
        </p>
      )}

      {snippet && (
        <>
          <pre className="max-h-[34dvh] overflow-auto rounded-lg border border-line bg-surface-1 p-2.5 text-[10px] leading-[1.5] text-ink-2">
            {snippet}
          </pre>
          <button onClick={copy} className="btn btn-fill">
            {copied ? "Copié" : "Copier pour screens-data.ts"}
          </button>
        </>
      )}

      <p className="text-[10px] leading-snug text-ink-3">
        L&apos;ordre décide de la face visible : dans le sens horaire vu de
        devant, sinon l&apos;écran est considéré comme tourné à l&apos;envers et
        reste masqué.
      </p>
    </div>
  );
}
