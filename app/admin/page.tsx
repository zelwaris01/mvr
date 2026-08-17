import type { Metadata } from "next";
import { AdminDashboard } from "./AdminDashboard";
import { AdminGate } from "./AdminGate";

/**
 * The operator's view of the visit.
 *
 * `noindex` as well as the sign-in: the gate is a client-side check, so it
 * keeps the page out of a wanderer's hands but not out of a determined one's —
 * see the note in AdminGate for why that is enough for a dashboard whose only
 * data source is the viewer's own browser. Keeping the URL out of search
 * results is the other half of the same modest protection.
 */
export const metadata: Metadata = {
  title: "Smart Mall Experience — Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}
