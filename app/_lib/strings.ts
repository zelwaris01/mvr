/**
 * Every string the app itself says, in both languages.
 *
 * Content — shop blurbs, quiz questions, badge names, reward titles — is NOT
 * here. That belongs with its data (`stores-data`, `questions-data`,
 * `rewards-data`) and its English is in `content-en.ts`, resolved before it
 * reaches a component. This file is only the chrome.
 *
 * `{name}` placeholders are filled by `t(key, params)`. Keep them named rather
 * than positional: "{left} of {total}" survives a translator reordering it,
 * "%s of %s" does not.
 */
type Dict = { fr: string; en: string };

export const UI = {
  // ── Brand ──
  brandTitle: { fr: "Smart Mall Experience", en: "Smart Mall Experience" },
  brandBy: { fr: "By MVR World", en: "By MVR World" },

  // ── Loading veil ──
  // The promise of the visit, one word at a time while the model downloads.
  // Same four beats as the poster, in the same order.
  veilExplore: { fr: "Explorez", en: "Explore" },
  veilDiscover: { fr: "Découvrez", en: "Discover" },
  veilPlay: { fr: "Jouez", en: "Play" },
  veilWin: { fr: "Gagnez", en: "Win" },

  loadConnecting: { fr: "Connexion à la visite", en: "Connecting to the tour" },
  loadLoading: { fr: "Chargement du mall", en: "Loading the mall" },
  loadStarting: { fr: "Préparation de la vue", en: "Preparing the view" },
  loadReady: { fr: "Bienvenue", en: "Welcome" },

  // ── Status notes ──
  statusConnecting: { fr: "Connexion à la visite…", en: "Connecting to the tour…" },
  statusDisabled: {
    fr: "Visite non interactive — aucune clé SDK configurée.",
    en: "Tour is not interactive — no SDK key configured.",
  },
  statusError: {
    fr: "La visite est chargée mais non instrumentée. Vérifiez la clé SDK et son allowlist de domaines.",
    en: "The tour loaded but is not instrumented. Check the SDK key and its domain allowlist.",
  },
  statusNoStores: {
    fr: "Aucune boutique balisée dans ce modèle.",
    en: "No shops tagged in this model.",
  },

  // ── Top bar ──
  openRewards: { fr: "Voir mes récompenses", en: "See my rewards" },
  myRewards: { fr: "Mes récompenses", en: "My rewards" },
  openMenu: { fr: "Ouvrir le menu", en: "Open the menu" },
  language: { fr: "Langues", en: "Language" },
  switchToFrench: { fr: "Passer en français", en: "Switch to French" },
  switchToEnglish: { fr: "Passer en anglais", en: "Switch to English" },

  // ── Side rail ──
  // Rail labels sit in a 72px column at 8.5px — "BOUTIQUES" at 9 characters is
  // the widest any of them may be. Anything longer needs the column widened,
  // not the label truncated.
  railShops: { fr: "Boutiques", en: "Shops" },
  railShopsTitle: { fr: "Toutes les boutiques", en: "All shops" },
  railBadge: { fr: "Badges", en: "Badges" },
  railOffers: { fr: "Offres", en: "Offers" },
  // Short forms for the rail. "Partager la visite" is 18 characters and runs
  // ~130px at 8.5px — the full labels belong on the phone tools page, which
  // has room for a sentence.
  railShare: { fr: "Partager", en: "Share" },
  railShareCopied: { fr: "Copié", en: "Copied" },
  railOffersTitle: { fr: "Offres et récompenses", en: "Offers and rewards" },
  railCollapse: { fr: "Réduire les outils", en: "Collapse the tools" },
  railExpand: { fr: "Afficher les outils", en: "Show the tools" },
  goToLevel: { fr: "Aller au {level}", en: "Go to the {level}" },

  // ── Overflow menu ──
  moreOptions: { fr: "Plus d'options", en: "More options" },
  shareTour: { fr: "Partager la visite", en: "Share the tour" },
  shareCopied: { fr: "Lien copié", en: "Link copied" },
  shareHint: { fr: "Envoyer ce lien à quelqu'un", en: "Send this link to someone" },

  // ── Tools page (phones) ──
  menu: { fr: "Menu", en: "Menu" },
  closeMenu: { fr: "Fermer le menu", en: "Close the menu" },
  resumeTour: { fr: "Reprendre la visite", en: "Back to the tour" },
  toolsShops: { fr: "Boutiques", en: "Shops" },
  toolsShopsCount: {
    fr: "{count} enseignes — s'y rendre",
    en: "{count} shops — travel to one",
  },
  toolsShopsCountOne: { fr: "{count} enseigne — s'y rendre", en: "{count} shop — travel to it" },
  toolsShopsEmpty: {
    fr: "Toutes les enseignes du niveau",
    en: "Every shop on this level",
  },
  toolsBadges: { fr: "Mes badges", en: "My badges" },
  toolsBadgesHint: {
    fr: "Progression et récompenses débloquées",
    en: "Progress and unlocked rewards",
  },
  toolsOffers: { fr: "Offres du moment", en: "Current offers" },
  toolsOffersHint: {
    fr: "Promotions et boutiques du mall",
    en: "Promotions and shops in the mall",
  },
  toolsLevelHint: { fr: "Niveau {short}", en: "Level {short}" },
  toolsLanguageHint: {
    fr: "Français ou anglais",
    en: "French or English",
  },

  // ── Shop directory ──
  shopsTitle: { fr: "Boutiques", en: "Shops" },
  shopsRegion: { fr: "Boutiques du mall", en: "Shops in the mall" },
  shopsClose: { fr: "Fermer les boutiques", en: "Close the shop list" },
  shopsLoading: { fr: "Chargement du mall…", en: "Loading the mall…" },
  shopsSubtitle: {
    fr: "{count} enseignes · touchez pour vous y rendre",
    en: "{count} shops · tap to travel there",
  },
  shopsSubtitleOne: {
    fr: "{count} enseigne · touchez pour vous y rendre",
    en: "{count} shop · tap to travel there",
  },
  shopsEnRoute: { fr: "En route…", en: "On the way…" },
  shopApproximate: { fr: "Position approximative", en: "Approximate position" },

  // ── Checkpoints ──
  cpDone: { fr: "quiz terminé", en: "quiz complete" },
  cpToEarn: { fr: "{xp} XP à gagner", en: "{xp} XP to earn" },
  done: { fr: "Terminé", en: "Complete" },

  // ── Quiz drawer ──
  drawerRegion: { fr: "{store} — boutique et quiz", en: "{store} — shop and quiz" },
  close: { fr: "Fermer", en: "Close" },
  tabStore: { fr: "La boutique", en: "The shop" },
  tabQuiz: { fr: "Quiz", en: "Quiz" },
  tourStaysLive: {
    fr: "La visite reste active — déplacez-vous pendant le quiz.",
    en: "The tour stays live — keep moving during the quiz.",
  },
  enlarge: { fr: "Agrandir", en: "Enlarge" },
  storeInfo: { fr: "Infos boutique", en: "Shop details" },
  storeVideos: { fr: "Vidéos", en: "Videos" },
  storeFromModel: {
    fr: "Fiche reprise du modèle Matterport. Pas encore de quiz pour cette enseigne.",
    en: "Details taken from the Matterport model. No quiz for this shop yet.",
  },
  imageAlt: { fr: "{store} — visuel {n}", en: "{store} — image {n}" },

  quizSoon: { fr: "Quiz bientôt disponible", en: "Quiz coming soon" },
  quizSoonBody: {
    fr: "Cette boutique vient d'être ajoutée à la visite. Ses questions arrivent prochainement — la visiter compte déjà dans votre progression.",
    en: "This shop has just been added to the tour. Its questions are on the way — visiting it already counts towards your progress.",
  },
  quizXp: { fr: "+{xp} XP", en: "+{xp} XP" },
  quizRight: { fr: "Bonne réponse · +{xp} XP", en: "Correct · +{xp} XP" },
  quizWrong: { fr: "Mauvaise réponse", en: "Wrong answer" },
  quizFinished: { fr: "Quiz terminé", en: "Quiz complete" },
  quizScore: {
    fr: "{correct} / {total} bonnes réponses",
    en: "{correct} / {total} correct",
  },

  retryAgain: { fr: "Recommencer le quiz", en: "Retake the quiz" },
  retryExhausted: { fr: "Essais épuisés", en: "No retries left" },
  retryExhaustedBody: {
    fr: "Vous avez utilisé vos {limit} essais. Vous ne pourrez recommencer aucun quiz, dans aucune boutique,",
    en: "You have used all {limit} retries. You cannot retake any quiz, in any shop,",
  },
  retryNoQuizzes: { fr: "aucun quiz", en: "any quiz" },
  retryBefore: { fr: "avant {wait} (vers {clock}).", en: "for another {wait} (around {clock})." },
  retryForNow: { fr: "pour le moment.", en: "for now." },
  retryLast: {
    fr: "Dernier essai — après celui-ci, plus aucune tentative dans aucune boutique pendant {hours} h.",
    en: "Last retry — after this one, no attempts in any shop for {hours} h.",
  },
  retryLeft: {
    fr: "{left} essais restants sur {limit}, toutes boutiques confondues — les XP de ce quiz sont repris puis rejoués.",
    en: "{left} of {limit} retries left across all shops — this quiz's XP is taken back and played again.",
  },
  waitMinutes: { fr: "{n} min", en: "{n} min" },
  waitHours: { fr: "{n} h", en: "{n} h" },

  // ── Badges sheet ──
  badgesRegion: { fr: "Vos badges", en: "Your badges" },
  badgesEyebrow: { fr: "Votre collection", en: "Your collection" },
  badgesTitle: { fr: "Badges", en: "Badges" },
  badgesCount: { fr: "{n} / {total} débloqués", en: "{n} / {total} unlocked" },
  badgesClose: { fr: "Fermer les badges", en: "Close the badges" },
  badgesFootnote: {
    fr: "Certains badges visent la totalité du mall — ils se débloqueront à mesure que de nouvelles boutiques seront balisées dans la visite.",
    en: "Some badges cover the whole mall — they unlock as more shops are tagged in the tour.",
  },

  // ── Profile page ──
  profileRegion: { fr: "Mon profil", en: "My profile" },
  profileTitle: { fr: "Mon profil", en: "My profile" },
  level: { fr: "Niveau", en: "Level" },
  nextLevel: { fr: "prochain : {xp} XP", en: "next: {xp} XP" },
  maxLevel: { fr: "niveau maximum", en: "top level" },
  statVisited: { fr: "Boutiques visitées", en: "Shops visited" },
  statAnswered: { fr: "Questions répondues", en: "Questions answered" },
  statCorrect: { fr: "Bonnes réponses", en: "Correct answers" },
  yourBadges: { fr: "Vos badges", en: "Your badges" },
  yourRewards: { fr: "Vos récompenses", en: "Your rewards" },
  rewardUnlocked: { fr: "Débloquée", en: "Unlocked" },
  rewardRemaining: { fr: "{xp} XP restants", en: "{xp} XP to go" },
  shopOffers: { fr: "Offres des boutiques", en: "Shop offers" },
  quizPerfectNeeded: {
    fr: "Quiz à terminer sans faute",
    en: "Finish the quiz with no mistakes",
  },

  // ── Offers page ──
  offersRegion: { fr: "Offres du mall", en: "Mall offers" },
  offersTitle: { fr: "Offres du moment", en: "Current offers" },
  advertisement: { fr: "Publicité", en: "Advertisement" },
  hideAd: { fr: "Masquer cette publicité", en: "Hide this ad" },
  closeAd: { fr: "Fermer la publicité", en: "Close the ad" },
  tapElsewhere: { fr: "Touchez ailleurs pour fermer", en: "Tap anywhere to close" },

  // ── Rewards CTA ──
  ctaTitle: { fr: "Débloquer mes récompenses", en: "Unlock my rewards" },
  ctaBody: {
    fr: "Voir toutes les boutiques et leurs offres",
    en: "See every shop and its offers",
  },

  // ── Lightbox ──
  lightboxRegion: { fr: "Image agrandie", en: "Enlarged image" },
  lightboxClose: { fr: "Fermer l'image", en: "Close the image" },
  lightboxPrev: { fr: "Image précédente", en: "Previous image" },
  lightboxNext: { fr: "Image suivante", en: "Next image" },

  // ── Tour frame ──
  tourFrameTitle: { fr: "Visite virtuelle du mall", en: "Virtual tour of the mall" },

  // ── Admin ──
  adminTitle: { fr: "Tableau de bord", en: "Dashboard" },
  adminSubtitle: {
    fr: "Indicateurs de la visite Smart Mall",
    en: "Smart Mall tour indicators",
  },
  adminDeviceOnly: {
    fr: "Cet appareil uniquement — les compteurs sont lus dans le stockage local de ce navigateur, pas sur un serveur.",
    en: "This device only — the counters are read from this browser's local storage, not from a server.",
  },
  adminBackToTour: { fr: "Retour à la visite", en: "Back to the tour" },
  adminReset: { fr: "Réinitialiser les compteurs", en: "Reset the counters" },
  adminResetConfirm: {
    fr: "Effacer les compteurs et la progression de cet appareil ?",
    en: "Erase this device's counters and progress?",
  },
  adminEmpty: {
    fr: "Aucune donnée pour l'instant. Faites une visite, puis revenez.",
    en: "Nothing recorded yet. Take a tour, then come back.",
  },
  adminSince: { fr: "Depuis le {date}", en: "Since {date}" },

  kpiTimeSpent: { fr: "Temps passé", en: "Time spent" },
  kpiTimeSpentHint: {
    fr: "Cumul des sessions, onglet au premier plan",
    en: "Across all sessions, tab in the foreground",
  },
  kpiStoreClicks: { fr: "Clics par boutique", en: "Clicks per shop" },
  kpiStoreClicksHint: {
    fr: "Ouvertures depuis un marqueur ou la liste",
    en: "Opened from a marker or from the list",
  },
  kpiQuizParticipants: { fr: "Participants quiz", en: "Quiz participants" },
  kpiQuizParticipantsHint: {
    fr: "Sessions ayant répondu à au moins une question",
    en: "Sessions that answered at least one question",
  },
  kpiBadges: { fr: "Badges débloqués", en: "Badges unlocked" },
  kpiBadgesHint: { fr: "Sur {total} disponibles", en: "Out of {total} available" },
  kpiPromos: { fr: "Promotions débloquées", en: "Promotions unlocked" },
  kpiPromosHint: { fr: "Paliers de XP atteints", en: "XP tiers reached" },

  adminSessions: { fr: "{n} sessions", en: "{n} sessions" },
  adminSessionsOne: { fr: "{n} session", en: "{n} session" },
  adminNoClicks: { fr: "Aucune boutique ouverte pour l'instant.", en: "No shop opened yet." },
  adminAnswers: {
    fr: "{answered} réponses · {correct} justes",
    en: "{answered} answers · {correct} correct",
  },
  adminAvgSession: { fr: "Moyenne par session", en: "Average per session" },
  adminClicks: { fr: "{n} clics", en: "{n} clicks" },
  adminClicksOne: { fr: "{n} clic", en: "{n} click" },
} satisfies Record<string, Dict>;

export type UiKey = keyof typeof UI;
