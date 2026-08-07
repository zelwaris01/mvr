"use client";

import Link from "next/link";
import Image from "next/image";
import { STORES } from "@/app/_lib/stores-data";
import { REWARDS } from "@/app/_lib/rewards-data";
import { MATTERPORT_URL, TOTAL_QUESTIONS, TOTAL_STORES } from "@/app/_lib/constants";
import { useGame } from "@/app/_components/GameStateProvider";
import { StoreCard } from "@/app/_components/StoreCard";
import { SectionTitle } from "@/app/_components/SectionTitle";
import { ProgressRing } from "@/app/_components/ProgressRing";

/** Six pieces pulled across the mall — the "trending" editorial rail. */
const TRENDING = STORES.flatMap((store) =>
  store.products.slice(0, 1).map((product) => ({ store, product }))
).slice(0, 6);

const DESTINATIONS = [
  {
    href: "/tour",
    eyebrow: "Niveau 0 — 2",
    name: "La visite 360°",
    meta: "Parcourez le mall pièce par pièce",
  },
  {
    href: "/quiz",
    eyebrow: "12 questions",
    name: "Les défis",
    meta: "50 XP par bonne réponse",
  },
  {
    href: "/rewards",
    eyebrow: "6 badges",
    name: "Votre profil",
    meta: "Badges, niveaux et bons de réduction",
  },
];

export default function HomePage() {
  const { isHydrated, progress, level, nextLevel, levelProgress } = useGame();

  const answered = Object.keys(progress.answeredQuestions).length;
  const correct = Object.values(progress.answeredQuestions).filter(
    (a) => a.isCorrect
  ).length;
  const explored = progress.exploredStores.length;
  const nextReward = REWARDS.find((r) => progress.totalXp < r.requiredXp);

  return (
    <div className="animate-fade-up">
      {/* ════════════════════════════════════════
          HERO — the atrium
          ════════════════════════════════════════ */}
      <section className="on-dark relative h-[calc(100vh-4rem)] min-h-[560px] md:min-h-[680px] overflow-hidden">
        <iframe
          src={MATTERPORT_URL}
          width="100%"
          height="100%"
          frameBorder={0}
          allow="fullscreen; xr-spatial-tracking"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          title="Visite virtuelle du mall"
        />

        {/* Scrims — always dark, they sit over live imagery in both themes */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(90%_60%_at_50%_40%,rgba(176,141,87,.16),transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-gradient-to-b from-black/70 to-transparent" />

        {/* ── Left rail: level ── */}
        {isHydrated && (
          <div className="hidden lg:flex absolute left-[34px] top-1/2 -translate-y-1/2 flex-col items-center gap-3.5 px-3 py-5 rounded-full glass">
            <ProgressRing pct={levelProgress} size={44} label={`${level.level}`} />
            <div className="w-px h-5 bg-line" />
            <span className="text-[11px] font-semibold text-ink [writing-mode:vertical-rl] tracking-[0.1em]">
              {level.label}
            </span>
            <span className="text-[11px] font-medium text-ink-3 [writing-mode:vertical-rl] tracking-[0.1em] tabular-nums">
              {progress.totalXp} XP
            </span>
          </div>
        )}

        {/* ── Right: progress panel ── */}
        {isHydrated && (
          <Link
            href="/rewards"
            className="hidden md:flex absolute right-[34px] top-6 w-[250px] flex-col gap-3.5 p-[18px] rounded-xl glass hover:border-brass-line transition-colors"
          >
            <span className="eyebrow">Votre progression</span>
            {[
              { label: "Boutiques visitées", value: `${explored}/${TOTAL_STORES}` },
              { label: "Questions", value: `${answered}/${TOTAL_QUESTIONS}` },
              { label: "Bonnes réponses", value: `${correct}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-[11.5px] text-ink-2 leading-none">{row.label}</span>
                <span className="text-[11.5px] font-semibold text-ink leading-none tabular-nums">
                  {row.value}
                </span>
              </div>
            ))}
            <div className="h-px bg-line" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11.5px] font-semibold text-ink leading-none">
                Total
              </span>
              <span className="text-[11.5px] font-semibold text-brass leading-none tabular-nums">
                {progress.totalXp} XP
              </span>
            </div>
          </Link>
        )}

        {/* ── Bottom: title, actions, brand rail ── */}
        <div className="absolute inset-x-0 bottom-0 pt-16 pb-7 px-5 md:px-[34px] flex flex-col gap-5 pointer-events-none bg-gradient-to-t from-[rgba(6,5,5,.94)] via-[rgba(6,5,5,.7)] to-transparent">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Anfa Place · Casablanca</span>
              <h1 className="font-display text-ink text-[34px] md:text-[46px] leading-[1.02] max-w-xl">
                Explorez le mall
                <br />
                comme si vous y étiez
              </h1>
            </div>
            <div className="flex gap-2.5 pointer-events-auto">
              <Link href="/tour" className="btn btn-fill">
                Entrer dans la visite
              </Link>
              <Link href="/quiz" className="btn btn-ghost">
                Défis · +50 XP
              </Link>
            </div>
          </div>

          {/* Brand rail */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="rail flex gap-3 flex-1 overflow-x-auto hide-scrollbar rail-mask pb-0.5">
              {STORES.map((store) => (
                <Link
                  key={store.slug}
                  href={`/stores/${store.slug}`}
                  className="min-w-[168px] flex items-center gap-2.5 p-2.5 rounded-[10px] bg-card border border-line hover:border-brass-line transition-colors"
                >
                  <div className="relative w-[38px] h-[38px] rounded-md overflow-hidden bg-surface-2 flex-shrink-0">
                    {store.products[0] && (
                      <Image
                        src={store.products[0].image}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="38px"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[12px] font-semibold text-ink leading-none truncate">
                      {store.name}
                    </span>
                    <span className="text-[10px] text-ink-3 leading-none">
                      {store.products.length} pièces
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/stores"
              aria-label="Toutes les boutiques"
              className="hidden sm:grid w-9 h-9 rounded-full border border-line-strong place-items-center text-ink text-[13px] hover:border-brass hover:text-brass transition-colors flex-shrink-0"
            >
              →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BODY
          ════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-[34px] pt-14 md:pt-[76px] flex flex-col gap-16 md:gap-[86px]">
        {/* ── Directory ── */}
        <section className="reveal flex flex-col gap-6 md:gap-[26px]">
          <SectionTitle
            eyebrow="Anfa Place · Niveau 1 & 2"
            action={
              <div className="flex gap-1.5">
                <span className="pill pill-on">Tout {TOTAL_STORES}</span>
                <Link href="/stores" className="pill pill-off">
                  Filtrer par catégorie
                </Link>
              </div>
            }
          >
            Les boutiques du mall
          </SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {STORES.map((store) => (
              <StoreCard key={store.slug} store={store} />
            ))}
          </div>
        </section>

        {/* ── Trending ── */}
        <section className="reveal flex flex-col gap-6 md:gap-[26px]">
          <SectionTitle
            eyebrow="En rayon aujourd'hui"
            action={
              <Link
                href="/stores"
                className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3 hover:text-brass transition-colors"
              >
                Parcourir les {STORES.reduce((n, s) => n + s.products.length, 0)} produits →
              </Link>
            }
          >
            Les pièces du moment
          </SectionTitle>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRENDING.map(({ store, product }, i) => (
              <Link
                key={product.id}
                href={`/stores/${store.slug}`}
                className="group flex flex-col gap-3"
              >
                <div className="plate relative aspect-[4/5] rounded-xl border border-line group-hover:border-brass-line transition-colors">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                  <div className="brass-glow" />
                  <span className="absolute left-2.5 top-2.5 tag">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute inset-x-2.5 bottom-2.5 py-1.5 px-2.5 rounded-full glass text-[10px] font-medium text-ink-2 text-center truncate">
                    {store.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-semibold text-ink leading-[1.25]">
                    {product.name}
                  </span>
                  <span className="text-[11.5px] text-ink-3 leading-none tabular-nums">
                    {product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Editorial split: quiz feature + membership ── */}
        <section className="reveal grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-[22px]">
          {/* Feature panel */}
          <div className="relative min-h-[320px] rounded-2xl overflow-hidden border border-line bg-[linear-gradient(125deg,var(--surface-2),var(--bg)_62%,var(--surface-1))]">
            <div className="absolute inset-0 bg-[radial-gradient(65%_85%_at_78%_28%,var(--glow),transparent_68%)]" />
            <div className="relative h-full p-7 md:p-9 flex flex-col justify-between gap-10 max-w-[520px]">
              <span className="eyebrow">Le parcours du mois · Août</span>
              <div className="flex flex-col gap-3.5">
                <h2 className="font-display text-ink text-[30px] md:text-[40px] leading-[1.06]">
                  Douze questions pour connaître le mall par cœur
                </h2>
                <p className="text-[12.5px] leading-[1.7] text-ink-2 text-pretty">
                  Un quiz par boutique, écrit avec les équipes du centre. Chaque
                  bonne réponse vaut 50 XP et rapproche vos bons de réduction.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-1.5">
                  <Link href="/quiz" className="btn btn-fill">
                    {answered > 0 ? "Reprendre le parcours" : "Commencer le parcours"}
                  </Link>
                  <Link href="/stores" className="btn btn-ghost">
                    Voir les boutiques
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-4">
            <Link
              href="/rewards"
              className="card card-link flex-1 p-6 flex flex-col gap-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="eyebrow">Vos récompenses</span>
                <span className="text-[11px] text-ink-3 leading-none">
                  {REWARDS.length} paliers
                </span>
              </div>
              {REWARDS.map((reward) => {
                const unlocked = isHydrated && progress.totalXp >= reward.requiredXp;
                return (
                  <div key={reward.id} className="flex items-center gap-3.5">
                    <span
                      className={`font-display text-[15px] leading-none w-9 ${
                        unlocked ? "text-brass" : "text-ink-3"
                      }`}
                    >
                      {reward.discount}
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <span className="text-[12px] font-semibold text-ink leading-none truncate">
                        {reward.title}
                      </span>
                      <span className="text-[10px] text-ink-3 leading-none truncate">
                        {reward.storeName}
                      </span>
                    </div>
                    <span
                      className={`text-[11.5px] font-semibold leading-none tabular-nums ${
                        unlocked ? "text-jade" : "text-ink-3"
                      }`}
                    >
                      {unlocked ? "Obtenue" : `${reward.requiredXp} XP`}
                    </span>
                  </div>
                );
              })}
            </Link>

            <Link
              href="/rewards"
              className="p-[22px] rounded-2xl border border-brass-line bg-[linear-gradient(150deg,var(--brass-soft),transparent)] flex items-center gap-[18px] hover:border-brass transition-colors"
            >
              <ProgressRing pct={isHydrated ? levelProgress : 0} size={56} thickness={6} />
              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="font-display text-[20px] leading-[1.1] text-ink">
                  {!isHydrated
                    ? "Votre niveau"
                    : nextReward
                    ? `${nextReward.requiredXp - progress.totalXp} XP jusqu'à ${nextReward.discount}`
                    : "Toutes les récompenses obtenues"}
                </span>
                <span className="text-[11px] leading-[1.4] text-ink-3">
                  {isHydrated && nextLevel
                    ? `Niveau ${level.level} · ${level.label} — prochain palier à ${nextLevel.minXp} XP`
                    : `Niveau ${level.level} · ${level.label}`}
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Continue ── */}
        <section className="reveal flex flex-col gap-6 md:gap-[26px]">
          <SectionTitle eyebrow="Continuer votre visite">
            Ailleurs dans le mall
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group relative h-[200px] rounded-[14px] overflow-hidden border border-line hover:border-brass-line bg-[linear-gradient(160deg,var(--surface-2),var(--bg))] transition-colors"
              >
                <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_40%_30%,var(--glow),transparent_70%)]" />
                <div className="absolute left-[22px] bottom-5 flex flex-col gap-2">
                  <span className="eyebrow">{d.eyebrow}</span>
                  <span className="font-display text-[26px] leading-none text-ink">
                    {d.name}
                  </span>
                  <span className="text-[11px] text-ink-3 leading-none">{d.meta}</span>
                </div>
                <div className="absolute right-5 top-5 w-[34px] h-[34px] rounded-full border border-line-strong grid place-items-center text-[13px] text-ink group-hover:border-brass group-hover:text-brass transition-colors">
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="flex flex-wrap items-center justify-between gap-6 pt-8 pb-12 border-t border-line">
          <div className="flex flex-col gap-2">
            <span className="font-display text-2xl leading-none text-ink tracking-[0.04em]">
              Meridian
            </span>
            <span className="text-[11px] text-ink-3 leading-none">
              Anfa Place · Casablanca — ouvert tous les jours 10:00 — 22:00
            </span>
          </div>
          <nav className="flex gap-6 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3">
            <Link href="/tour" className="hover:text-brass transition-colors">
              Visite
            </Link>
            <Link href="/stores" className="hover:text-brass transition-colors">
              Boutiques
            </Link>
            <Link href="/quiz" className="hover:text-brass transition-colors">
              Défis
            </Link>
            <Link href="/rewards" className="hover:text-brass transition-colors">
              Profil
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
