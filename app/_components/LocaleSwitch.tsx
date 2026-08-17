"use client";

import { useLocale, type Locale } from "@/app/_lib/i18n";
import { usePress } from "@/app/_lib/usePress";

/**
 * FR | EN, as a two-state segmented control.
 *
 * A segmented control rather than a dropdown or a single toggle: with exactly
 * two languages, both should be visible and one press away. A toggle labelled
 * with the *other* language is the classic ambiguity here — nobody agrees
 * whether "EN" means "you are reading English" or "switch to English" — and
 * showing both with one marked current removes the question.
 *
 * `size="sm"` is the version that sits in the tour's top bar beside the XP
 * pill, where vertical space is the constraint.
 */
export function LocaleSwitch({ size = "md" }: { size?: "sm" | "md" }) {
  const { locale } = useLocale();
  const small = size === "sm";

  return (
    <div
      className={`hud-on flex items-center rounded-full pane p-[3px] ${
        small ? "gap-[2px]" : "gap-[3px]"
      }`}
      role="group"
      aria-label="Langues / Language"
    >
      <LocaleButton target="fr" current={locale} small={small} />
      <LocaleButton target="en" current={locale} small={small} />
    </div>
  );
}

const LABEL: Record<Locale, string> = { fr: "FR", en: "EN" };

function LocaleButton({
  target,
  current,
  small,
}: {
  target: Locale;
  current: Locale;
  small: boolean;
}) {
  const { setLocale, t } = useLocale();
  const active = current === target;
  // usePress, not onClick: every control that has to work on touch over the
  // Matterport iframe goes through it — see the note in usePress.
  const press = usePress(() => setLocale(target));

  return (
    <button
      {...press}
      // aria-pressed rather than a radio group: this is a pair of toggles over
      // one setting, and a screen reader announcing "pressed" on the current
      // language is exactly the state worth hearing.
      aria-pressed={active}
      aria-label={t(target === "fr" ? "switchToFrench" : "switchToEnglish")}
      className={`rounded-full font-semibold uppercase tracking-[0.1em] transition-colors ${
        small ? "px-2 py-1 text-[9.5px]" : "px-2.5 py-1.5 text-[10.5px]"
      } ${
        active
          ? "bg-brass text-on-brass"
          : "text-ink-3 hover:text-brass"
      }`}
    >
      {LABEL[target]}
    </button>
  );
}
