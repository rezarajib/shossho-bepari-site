export const CROP_OPTIONS = [
  "সরিষা",
  "তিল",
  "ধান",
  "গম",
  "ভুট্টা",
  "পাট",
  "কালোজিরা",
  "মাষকলাই",
  "খেসারি",
];

export const SEASON_OPTIONS = [
  { id: "all", label: "সব মৌসুম" },
  { id: "rabi", label: "❄️ রবি মৌসুম (সরিষা, গম, ভুট্টা, কালোজিরা, খেসারি)" },
  { id: "kharif1", label: "☀️ খরিফ-১ মৌসুম (পাট, তিল, ধান)" },
  { id: "kharif2", label: "🌧️ খরিফ-২ মৌসুম (আমন ধান, মাষকলাই)" },
];

export const CROP_STATUS_OPTIONS = [
  { id: "growing", label: "চারা বৃদ্ধি চলছে" },
  { id: "ripening", label: "ফসল পাকছে" },
  { id: "harvesting", label: "কাটা শুরু হয়েছে / সংগ্রহ চলছে" },
  { id: "stock", label: "কৃষকের গোলায় মজুত আছে" },
];

export const CROP_STATUS_FILTERS = [
  { id: "all", label: "সব অবস্থা" },
  { id: "stock", label: "গোলায় মজুত আছে" },
  { id: "harvesting", label: "এখন কাটা হচ্ছে" },
  { id: "soon", label: "আসছে শীঘ্রই" },
];

export const getSeasonLabel = (season) =>
  SEASON_OPTIONS.find((option) => option.id === season)?.label ?? "মৌসুম উল্লেখ নেই";

export const getCropStatus = (status) =>
  CROP_STATUS_OPTIONS.find((option) => option.id === status) ?? CROP_STATUS_OPTIONS[0];
