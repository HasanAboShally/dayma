// ============================================================
// Ramadan Companion — Gallery & Basics Data
// Two-layer model: Daily Habits + Monthly Goals (numeric targets)
// ============================================================

import type {
  BasicAction,
  DailyHabit,
  MonthlyGoal,
  WorshipCategory,
} from "./app-types";
import type { IconName } from "./icons";

// ── Date Helpers ─────────────────────────────────────────────

export function getDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d); // Local midnight
  date.setDate(date.getDate() + days);
  return getDateString(date);
}

/** Get the Ramadan day number (1-30) for a given date string */
export function getRamadanDay(dateStr: string, startDate: string): number {
  const d = new Date(dateStr);
  const s = new Date(startDate);
  return Math.floor((d.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ── Layer 1a: BASICS (5 prayers + fasting) ───────────────────

export const BASICS: BasicAction[] = [
  {
    id: "fajr",
    titleKey: "basics.fajr",
    titleAr: "صلاة الفجر",
    iconName: "sunrise",
    category: "prayer",
  },
  {
    id: "dhuhr",
    titleKey: "basics.dhuhr",
    titleAr: "صلاة الظهر",
    iconName: "sun",
    category: "prayer",
  },
  {
    id: "asr",
    titleKey: "basics.asr",
    titleAr: "صلاة العصر",
    iconName: "cloud-sun",
    category: "prayer",
  },
  {
    id: "maghrib",
    titleKey: "basics.maghrib",
    titleAr: "صلاة المغرب",
    iconName: "sunset",
    category: "prayer",
  },
  {
    id: "isha",
    titleKey: "basics.isha",
    titleAr: "صلاة العشاء",
    iconName: "moon",
    category: "prayer",
  },
  {
    id: "fasting",
    titleKey: "basics.fasting",
    titleAr: "الصيام",
    iconName: "utensils-crossed",
    category: "fasting",
  },
];

export const ALL_BASIC_IDS = BASICS.map((b) => b.id);

// ── Layer 2: Monthly Goals Gallery ───────────────────────────

export interface MonthlyGoalGalleryItem {
  id: string;
  titleKey: string;
  titleAr: string;
  descriptionKey: string;
  descriptionAr: string;
  iconName: IconName;
  category: WorshipCategory;
  defaultTarget: number;
}

export const MONTHLY_GOALS_GALLERY: MonthlyGoalGalleryItem[] = [
  {
    id: "monthly-charity",
    titleKey: "monthly.charity",
    titleAr: "صدقة كبيرة",
    descriptionKey: "monthly.charity_desc",
    descriptionAr: "تبرع بمبلغ كبير أو كفالة يتيم أو إطعام عائلات",
    iconName: "heart-handshake",
    category: "charity",
    defaultTarget: 4,
  },
  {
    id: "monthly-quran-khatm",
    titleKey: "monthly.quran_khatm",
    titleAr: "ختم القرآن",
    descriptionKey: "monthly.quran_khatm_desc",
    descriptionAr: "إتمام ختمة كاملة للقرآن خلال رمضان",
    iconName: "book-open",
    category: "quran",
    defaultTarget: 1,
  },
  {
    id: "monthly-family-iftar",
    titleKey: "monthly.family_iftar",
    titleAr: "إفطارات عائلية",
    descriptionKey: "monthly.family_iftar_desc",
    descriptionAr: "دعوة العائلة أو الجيران لإفطار",
    iconName: "users",
    category: "charity",
    defaultTarget: 4,
  },
  {
    id: "monthly-lecture",
    titleKey: "monthly.lecture",
    titleAr: "حضور دروس علمية",
    descriptionKey: "monthly.lecture_desc",
    descriptionAr: "حضور دروس ومحاضرات في المسجد أو عبر الإنترنت",
    iconName: "graduation-cap",
    category: "learning",
    defaultTarget: 8,
  },
  {
    id: "monthly-visit-sick",
    titleKey: "monthly.visit_sick",
    titleAr: "زيارة المرضى",
    descriptionKey: "monthly.visit_sick_desc",
    descriptionAr: "زيارة المرضى أو الاتصال بهم للاطمئنان",
    iconName: "heart",
    category: "charity",
    defaultTarget: 3,
  },
  {
    id: "monthly-itikaf",
    titleKey: "monthly.itikaf",
    titleAr: "اعتكاف",
    descriptionKey: "monthly.itikaf_desc",
    descriptionAr: "اعتكاف بين الفجر والشروق أو في العشر الأواخر",
    iconName: "flag",
    category: "prayer",
    defaultTarget: 10,
  },
  {
    id: "monthly-feed-fasting",
    titleKey: "monthly.feed_fasting",
    titleAr: "إفطار صائمين",
    descriptionKey: "monthly.feed_fasting_desc",
    descriptionAr: "تفطير صائمين ولو بتمر وماء",
    iconName: "utensils",
    category: "charity",
    defaultTarget: 10,
  },
  {
    id: "monthly-night-prayer",
    titleKey: "monthly.night_prayer",
    titleAr: "قيام الليل",
    descriptionKey: "monthly.night_prayer_desc",
    descriptionAr: "قيام الليل في الثلث الأخير",
    iconName: "star",
    category: "prayer",
    defaultTarget: 15,
  },
];

// ── Categories ───────────────────────────────────────────────

export const CATEGORIES: { id: WorshipCategory; labelKey: string }[] = [
  { id: "prayer", labelKey: "categories.prayer" },
  { id: "quran", labelKey: "categories.quran" },
  { id: "dhikr", labelKey: "categories.dhikr" },
  { id: "charity", labelKey: "categories.charity" },
  { id: "dua", labelKey: "categories.dua" },
  { id: "fasting", labelKey: "categories.fasting" },
  { id: "learning", labelKey: "categories.learning" },
];

// ── Layer 1b: Gallery Actions (Daily Habits) ─────────────────

export interface GalleryAction {
  id: string;
  titleKey: string;
  titleAr: string;
  descriptionKey: string;
  descriptionAr: string;
  category: WorshipCategory;
  iconName: IconName;
  defaultTarget?: number;
  unitKey?: string;
  tags: string[];
}

export const ACTION_GALLERY: GalleryAction[] = [
  // ── Prayer ──
  {
    id: "taraweeh",
    titleKey: "gallery.taraweeh.title",
    titleAr: "صلاة التراويح",
    descriptionKey: "gallery.taraweeh.desc",
    descriptionAr: "صلاة التراويح في المسجد أو البيت",
    category: "prayer",
    iconName: "moon-star",
    tags: ["prayer", "night", "ramadan"],
  },
  {
    id: "tahajjud",
    titleKey: "gallery.tahajjud.title",
    titleAr: "صلاة التهجد",
    descriptionKey: "gallery.tahajjud.desc",
    descriptionAr: "صلاة الليل قبل الفجر",
    category: "prayer",
    iconName: "star",
    tags: ["prayer", "night", "tahajjud"],
  },
  {
    id: "duha-prayer",
    titleKey: "gallery.duha_prayer.title",
    titleAr: "صلاة الضحى",
    descriptionKey: "gallery.duha_prayer.desc",
    descriptionAr: "صلاة الضحى بعد شروق الشمس",
    category: "prayer",
    iconName: "sun",
    tags: ["prayer", "morning", "duha"],
  },
  {
    id: "witr-prayer",
    titleKey: "gallery.witr_prayer.title",
    titleAr: "صلاة الوتر",
    descriptionKey: "gallery.witr_prayer.desc",
    descriptionAr: "صلاة الوتر قبل النوم أو آخر الليل",
    category: "prayer",
    iconName: "sparkles",
    tags: ["prayer", "night", "witr"],
  },
  {
    id: "sunnah-rawatib",
    titleKey: "gallery.sunnah_rawatib.title",
    titleAr: "السنن الرواتب",
    descriptionKey: "gallery.sunnah_rawatib.desc",
    descriptionAr: "المحافظة على السنن الرواتب مع الفرائض",
    category: "prayer",
    iconName: "check-circle",
    defaultTarget: 12,
    unitKey: "units.rakaat",
    tags: ["prayer", "sunnah"],
  },
  // ── Quran ──
  {
    id: "quran-read",
    titleKey: "gallery.quran_read.title",
    titleAr: "قراءة القرآن",
    descriptionKey: "gallery.quran_read.desc",
    descriptionAr: "تلاوة القرآن الكريم يومياً",
    category: "quran",
    iconName: "book-open",
    defaultTarget: 5,
    unitKey: "units.pages",
    tags: ["quran", "recitation"],
  },
  {
    id: "quran-memorize",
    titleKey: "gallery.quran_memorize.title",
    titleAr: "حفظ القرآن",
    descriptionKey: "gallery.quran_memorize.desc",
    descriptionAr: "حفظ آيات جديدة من القرآن",
    category: "quran",
    iconName: "brain",
    tags: ["quran", "memorization"],
  },
  {
    id: "quran-tafsir",
    titleKey: "gallery.quran_tafsir.title",
    titleAr: "تدبر التفسير",
    descriptionKey: "gallery.quran_tafsir.desc",
    descriptionAr: "قراءة التفسير والتأمل",
    category: "quran",
    iconName: "search",
    tags: ["quran", "tafsir", "reflection"],
  },
  // ── Dhikr ──
  {
    id: "morning-adhkar",
    titleKey: "gallery.morning_adhkar.title",
    titleAr: "أذكار الصباح",
    descriptionKey: "gallery.morning_adhkar.desc",
    descriptionAr: "قراءة أذكار الصباح بعد الفجر",
    category: "dhikr",
    iconName: "sunrise",
    tags: ["dhikr", "morning"],
  },
  {
    id: "evening-adhkar",
    titleKey: "gallery.evening_adhkar.title",
    titleAr: "أذكار المساء",
    descriptionKey: "gallery.evening_adhkar.desc",
    descriptionAr: "قراءة أذكار المساء بعد العصر",
    category: "dhikr",
    iconName: "sunset",
    tags: ["dhikr", "evening"],
  },
  {
    id: "istighfar",
    titleKey: "gallery.istighfar.title",
    titleAr: "الاستغفار ١٠٠ مرة",
    descriptionKey: "gallery.istighfar.desc",
    descriptionAr: "الاستغفار ١٠٠ مرة في اليوم",
    category: "dhikr",
    iconName: "refresh-cw",
    defaultTarget: 100,
    tags: ["dhikr", "istighfar"],
  },
  {
    id: "salawat",
    titleKey: "gallery.salawat.title",
    titleAr: "الصلاة على النبي ﷺ",
    descriptionKey: "gallery.salawat.desc",
    descriptionAr: "الإكثار من الصلاة على النبي محمد ﷺ",
    category: "dhikr",
    iconName: "heart",
    tags: ["dhikr", "salawat", "prophet"],
  },
  {
    id: "post-prayer-dhikr",
    titleKey: "gallery.post_prayer_dhikr.title",
    titleAr: "أذكار بعد الصلاة",
    descriptionKey: "gallery.post_prayer_dhikr.desc",
    descriptionAr: "التسبيح والتحميد والتكبير بعد كل صلاة",
    category: "dhikr",
    iconName: "repeat",
    tags: ["dhikr", "post-prayer"],
  },
  // ── Charity ──
  {
    id: "daily-charity",
    titleKey: "gallery.daily_charity.title",
    titleAr: "صدقة يومية",
    descriptionKey: "gallery.daily_charity.desc",
    descriptionAr: "تصدّق كل يوم ولو بالقليل",
    category: "charity",
    iconName: "heart-handshake",
    tags: ["charity", "sadaqah"],
  },
  {
    id: "smile-kindness",
    titleKey: "gallery.smile_kindness.title",
    titleAr: "الابتسامة والمعروف",
    descriptionKey: "gallery.smile_kindness.desc",
    descriptionAr: "تبسّمك في وجه أخيك صدقة",
    category: "charity",
    iconName: "smile",
    tags: ["charity", "kindness"],
  },
  // ── Dua ──
  {
    id: "dua-iftar",
    titleKey: "gallery.dua_iftar.title",
    titleAr: "دعاء عند الإفطار",
    descriptionKey: "gallery.dua_iftar.desc",
    descriptionAr: "الدعاء عند وقت الإفطار",
    category: "dua",
    iconName: "hand",
    tags: ["dua", "iftar"],
  },
  {
    id: "dua-list",
    titleKey: "gallery.dua_list.title",
    titleAr: "قائمة الدعاء",
    descriptionKey: "gallery.dua_list.desc",
    descriptionAr: "ادعُ بأدعيتك المهمة",
    category: "dua",
    iconName: "scroll",
    tags: ["dua", "personal"],
  },
  {
    id: "dua-parents",
    titleKey: "gallery.dua_parents.title",
    titleAr: "الدعاء للوالدين",
    descriptionKey: "gallery.dua_parents.desc",
    descriptionAr: "ربِّ ارحمهما كما ربياني صغيراً",
    category: "dua",
    iconName: "users",
    tags: ["dua", "parents", "family"],
  },
  // ── Fasting ──
  {
    id: "suhoor-sunnah",
    titleKey: "gallery.suhoor_sunnah.title",
    titleAr: "تأخير السحور",
    descriptionKey: "gallery.suhoor_sunnah.desc",
    descriptionAr: "تأخير السحور لآخر وقت قبل الفجر",
    category: "fasting",
    iconName: "alarm-clock",
    tags: ["fasting", "suhoor"],
  },
  {
    id: "iftar-hasten",
    titleKey: "gallery.iftar_hasten.title",
    titleAr: "تعجيل الإفطار",
    descriptionKey: "gallery.iftar_hasten.desc",
    descriptionAr: "الإفطار بمجرد أذان المغرب",
    category: "fasting",
    iconName: "clock",
    tags: ["fasting", "iftar"],
  },
  {
    id: "lower-gaze",
    titleKey: "gallery.lower_gaze.title",
    titleAr: "غض البصر",
    descriptionKey: "gallery.lower_gaze.desc",
    descriptionAr: "حفظ البصر والابتعاد عما يضر الصيام",
    category: "fasting",
    iconName: "eye-off",
    tags: ["fasting", "discipline"],
  },
  // ── Learning ──
  {
    id: "hadith-daily",
    titleKey: "gallery.hadith_daily.title",
    titleAr: "حديث يومي",
    descriptionKey: "gallery.hadith_daily.desc",
    descriptionAr: "اقرأ حديثاً واعمل به",
    category: "learning",
    iconName: "book-open-check",
    tags: ["learning", "hadith"],
  },
  {
    id: "attend-lecture",
    titleKey: "gallery.attend_lecture.title",
    titleAr: "حضور درس",
    descriptionKey: "gallery.attend_lecture.desc",
    descriptionAr: "احضر درساً في المسجد أو عبر الإنترنت",
    category: "learning",
    iconName: "graduation-cap",
    tags: ["learning", "lecture"],
  },
];

// ── Starter Packs ────────────────────────────────────────────

export interface StarterPack {
  id: string;
  nameKey: string;
  descriptionKey: string;
  iconName: IconName;
  actionIds: string[];
  monthlyGoalIds: string[];
}

export const STARTER_PACKS: StarterPack[] = [
  {
    id: "beginner",
    nameKey: "packs.beginner.name",
    descriptionKey: "packs.beginner.description",
    iconName: "gentle",
    actionIds: [
      "taraweeh",
      "quran-read",
      "morning-adhkar",
      "dua-iftar",
      "daily-charity",
    ],
    monthlyGoalIds: ["monthly-charity"],
  },
  {
    id: "balanced",
    nameKey: "packs.balanced.name",
    descriptionKey: "packs.balanced.description",
    iconName: "steady",
    actionIds: [
      "taraweeh",
      "witr-prayer",
      "quran-read",
      "morning-adhkar",
      "evening-adhkar",
      "istighfar",
      "dua-iftar",
      "daily-charity",
    ],
    monthlyGoalIds: ["monthly-charity", "monthly-quran-khatm"],
  },
  {
    id: "devoted",
    nameKey: "packs.devoted.name",
    descriptionKey: "packs.devoted.description",
    iconName: "devoted",
    actionIds: [
      "taraweeh",
      "tahajjud",
      "witr-prayer",
      "duha-prayer",
      "sunnah-rawatib",
      "quran-read",
      "quran-memorize",
      "morning-adhkar",
      "evening-adhkar",
      "istighfar",
      "salawat",
      "dua-iftar",
      "dua-list",
      "daily-charity",
    ],
    monthlyGoalIds: [
      "monthly-charity",
      "monthly-quran-khatm",
      "monthly-lecture",
      "monthly-itikaf",
    ],
  },
];

// ── Conversion Helpers ───────────────────────────────────────

/** Convert a GalleryAction to a DailyHabit */
export function galleryToHabit(g: GalleryAction): DailyHabit {
  return {
    id: g.id,
    titleKey: g.titleKey,
    descriptionKey: g.descriptionKey,
    category: g.category,
    iconName: g.iconName,
    target: g.defaultTarget,
    unitKey: g.unitKey,
    source: "gallery",
    enabled: true,
    addedAt: new Date().toISOString(),
  };
}

/** Create a fully custom DailyHabit */
export function createCustomHabit(fields: {
  title: string;
  description: string;
  category: WorshipCategory;
  target?: number;
  unit?: string;
  iconName?: IconName;
}): DailyHabit {
  return {
    id: `custom-${Date.now()}`,
    titleKey: fields.title,
    descriptionKey: fields.description,
    category: fields.category,
    iconName: fields.iconName,
    target: fields.target,
    unitKey: fields.unit,
    source: "custom",
    enabled: true,
    addedAt: new Date().toISOString(),
  };
}

/** Convert a MonthlyGoalGalleryItem to a MonthlyGoal with custom target */
export function galleryToMonthlyGoal(
  g: MonthlyGoalGalleryItem,
  target?: number,
): MonthlyGoal {
  return {
    id: g.id,
    titleKey: g.titleKey,
    titleAr: g.titleAr,
    descriptionKey: g.descriptionKey,
    descriptionAr: g.descriptionAr,
    iconName: g.iconName,
    category: g.category,
    target: target ?? g.defaultTarget,
    source: "gallery",
  };
}

/** Create a fully custom MonthlyGoal */
export function createCustomMonthlyGoal(fields: {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  target: number;
  iconName?: IconName;
  category?: WorshipCategory;
}): MonthlyGoal {
  return {
    id: `custom-goal-${Date.now()}`,
    titleKey: fields.title,
    titleAr: fields.titleAr,
    descriptionKey: fields.description,
    descriptionAr: fields.descriptionAr,
    iconName: fields.iconName ?? "target",
    category: fields.category ?? "prayer",
    target: fields.target,
    source: "custom",
  };
}

/** Find a gallery action by ID */
export function findGalleryAction(id: string): GalleryAction | undefined {
  return ACTION_GALLERY.find((a) => a.id === id);
}

/** Find a monthly goal gallery item by ID */
export function findMonthlyGoalGallery(
  id: string,
): MonthlyGoalGalleryItem | undefined {
  return MONTHLY_GOALS_GALLERY.find((g) => g.id === id);
}

// ── Nudge Messages ───────────────────────────────────────────

export function getNudgeMessage(count: number): string | null {
  if (count >= 10) return "gallery.nudge_hard";
  if (count >= 7) return "gallery.nudge_soft";
  return null;
}
