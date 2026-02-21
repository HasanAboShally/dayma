// ============================================================
// Ramadan Companion — Daily Reflection Prompts (30 Days)
// Rotating prompts that make reflection invitational, not blank
// ============================================================

export interface ReflectionPrompt {
  en: string;
  ar: string;
}

const PROMPTS: ReflectionPrompt[] = [
  // Day 1
  { en: "What intention are you setting for this Ramadan?", ar: "ما النية التي تضعها لرمضان هذا؟" },
  // Day 2
  { en: "What moment today brought you closest to Allah?", ar: "أي لحظة اليوم قربتك من الله أكثر؟" },
  // Day 3
  { en: "What small deed felt most meaningful today?", ar: "أي عمل صغير كان أكثر معنى لك اليوم؟" },
  // Day 4
  { en: "What are you grateful for today?", ar: "ما الشيء الذي تشكر الله عليه اليوم؟" },
  // Day 5
  { en: "Which prayer felt most connected today?", ar: "أي صلاة شعرت فيها بأكبر خشوع اليوم؟" },
  // Day 6
  { en: "What's one thing you want to improve tomorrow?", ar: "ما الشيء الذي تريد تحسينه غداً؟" },
  // Day 7
  { en: "What have you learned about yourself this first week?", ar: "ماذا تعلمت عن نفسك في هذا الأسبوع الأول؟" },
  // Day 8
  { en: "Who did you help or make smile today?", ar: "من ساعدت أو أسعدت اليوم؟" },
  // Day 9
  { en: "What verse or dua touched your heart today?", ar: "أي آية أو دعاء لامس قلبك اليوم؟" },
  // Day 10
  { en: "What habit are you proudest of maintaining?", ar: "ما العادة التي تفتخر بالمحافظة عليها؟" },
  // Day 11 — Entering Forgiveness
  { en: "As we enter the days of Forgiveness — who do you want to forgive?", ar: "مع دخولنا أيام المغفرة — من تريد أن تسامح؟" },
  // Day 12
  { en: "What dua are you making most often?", ar: "ما الدعاء الذي تكثر منه؟" },
  // Day 13
  { en: "How has fasting changed your perspective this week?", ar: "كيف غيّر الصيام نظرتك هذا الأسبوع؟" },
  // Day 14
  { en: "What blessing do you usually take for granted?", ar: "ما النعمة التي عادة ما تأخذها كأمر مسلّم؟" },
  // Day 15 — Halfway
  { en: "You're halfway through Ramadan. What's your biggest takeaway so far?", ar: "أنت في منتصف رمضان. ما أكبر درس تعلمته حتى الآن؟" },
  // Day 16
  { en: "What act of kindness can you do tomorrow?", ar: "ما العمل الطيب الذي يمكنك فعله غداً؟" },
  // Day 17
  { en: "How did you handle a difficult moment today with patience?", ar: "كيف تعاملت مع لحظة صعبة اليوم بصبر؟" },
  // Day 18
  { en: "What Quran passage stayed with you today?", ar: "أي مقطع من القرآن بقي في ذهنك اليوم؟" },
  // Day 19
  { en: "What would you tell someone starting Ramadan for the first time?", ar: "ماذا ستقول لشخص يصوم رمضان لأول مرة؟" },
  // Day 20
  { en: "How has your relationship with Quran changed this month?", ar: "كيف تغيرت علاقتك مع القرآن هذا الشهر؟" },
  // Day 21 — Entering Freedom from Fire
  { en: "The last 10 nights begin. What is your biggest dua?", ar: "تبدأ العشر الأواخر. ما أعظم دعاء لك؟" },
  // Day 22
  { en: "If tonight is Laylatul Qadr, what would you ask Allah for?", ar: "لو كانت الليلة ليلة القدر، ماذا ستسأل الله؟" },
  // Day 23
  { en: "What worship act gives you the most peace?", ar: "أي عبادة تمنحك أكثر سكينة؟" },
  // Day 24
  { en: "How has your patience grown this Ramadan?", ar: "كيف نما صبرك في رمضان هذا؟" },
  // Day 25
  { en: "What du'a are you making in every sujood?", ar: "ما الدعاء الذي تدعو به في كل سجود؟" },
  // Day 26
  { en: "Who are you praying for in these blessed nights?", ar: "من تدعو لهم في هذه الليالي المباركة؟" },
  // Day 27
  { en: "What habit from Ramadan do you want to keep forever?", ar: "ما العادة من رمضان التي تريد الحفاظ عليها للأبد؟" },
  // Day 28
  { en: "What moment made you feel closest to Allah this Ramadan?", ar: "ما اللحظة التي شعرت فيها بأقرب ما يكون من الله في رمضان؟" },
  // Day 29
  { en: "What would you tell your day-1 self?", ar: "ماذا ستقول لنفسك في اليوم الأول؟" },
  // Day 30
  { en: "As Ramadan ends — how have you changed?", ar: "مع نهاية رمضان — كيف تغيرت؟" },
];

/**
 * Get the reflection prompt for a specific Ramadan day (1-30).
 * Returns the localized prompt string.
 */
export function getReflectionPrompt(day: number, locale: "en" | "ar"): string {
  const idx = Math.max(0, Math.min(29, day - 1));
  return locale === "ar" ? PROMPTS[idx].ar : PROMPTS[idx].en;
}
