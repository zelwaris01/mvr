/**
 * Share the visit.
 *
 * Two callers want this — the desktop overflow menu and the phone tools page —
 * and both need to know which of the two things happened, because "Lien copié"
 * is worth saying and "the OS share sheet opened" is not.
 */
export type ShareResult = "shared" | "copied" | "failed";

export async function shareTour(): Promise<ShareResult> {
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: "MVR World — Smart Mall", url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    // Cancelled share or denied clipboard — nothing to report.
    return "failed";
  }
}
