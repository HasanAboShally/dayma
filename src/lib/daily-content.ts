// ============================================================
// Ramadan Companion — Daily Islamic Content (30 Days)
// Curated Quranic verses & hadiths for each Ramadan day
// ============================================================

export interface DailyContent {
  day: number;
  verse: { ar: string; en: string; ref: string };
  hadith: { ar: string; en: string; ref: string };
}

/**
 * Get the daily content for a specific Ramadan day (1-30).
 * Returns a Quranic verse and a hadith for reflection.
 */
export function getDailyContent(day: number): DailyContent {
  const idx = Math.max(0, Math.min(29, day - 1));
  return DAILY_CONTENT[idx];
}

const DAILY_CONTENT: DailyContent[] = [
  // Day 1 – Mercy begins
  {
    day: 1,
    verse: {
      ar: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ",
      en: "The month of Ramadan in which the Quran was revealed, a guidance for mankind.",
      ref: "Al-Baqarah 2:185",
    },
    hadith: {
      ar: "إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ",
      en: "When Ramadan begins, the gates of Paradise are opened.",
      ref: "Sahih al-Bukhari 1899",
    },
  },
  // Day 2
  {
    day: 2,
    verse: {
      ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
      en: "And when My servants ask you about Me — indeed I am near.",
      ref: "Al-Baqarah 2:186",
    },
    hadith: {
      ar: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
      en: "Whoever fasts Ramadan out of faith and seeking reward, his past sins will be forgiven.",
      ref: "Sahih al-Bukhari 38",
    },
  },
  // Day 3
  {
    day: 3,
    verse: {
      ar: "ادْعُوا رَبَّكُمْ تَضَرُّعًا وَخُفْيَةً",
      en: "Call upon your Lord humbly and privately.",
      ref: "Al-A'raf 7:55",
    },
    hadith: {
      ar: "الصِّيَامُ جُنَّةٌ",
      en: "Fasting is a shield.",
      ref: "Sahih al-Bukhari 1894",
    },
  },
  // Day 4
  {
    day: 4,
    verse: {
      ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
      en: "Indeed, Allah is with the patient.",
      ref: "Al-Baqarah 2:153",
    },
    hadith: {
      ar: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      en: "The most beloved deeds to Allah are the most consistent, even if small.",
      ref: "Sahih al-Bukhari 6464",
    },
  },
  // Day 5
  {
    day: 5,
    verse: {
      ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلاةِ",
      en: "Seek help through patience and prayer.",
      ref: "Al-Baqarah 2:45",
    },
    hadith: {
      ar: "مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ",
      en: "Whoever does not give up false speech and acting upon it, Allah has no need of his giving up food and drink.",
      ref: "Sahih al-Bukhari 1903",
    },
  },
  // Day 6
  {
    day: 6,
    verse: {
      ar: "فَاذْكُرُونِي أَذْكُرْكُمْ",
      en: "So remember Me; I will remember you.",
      ref: "Al-Baqarah 2:152",
    },
    hadith: {
      ar: "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً",
      en: "Take the suhoor meal, for there is blessing in suhoor.",
      ref: "Sahih al-Bukhari 1923",
    },
  },
  // Day 7
  {
    day: 7,
    verse: {
      ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
      en: "And whoever puts their trust in Allah — He is sufficient for them.",
      ref: "At-Talaq 65:3",
    },
    hadith: {
      ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
      en: "The best among you are those who learn the Quran and teach it.",
      ref: "Sahih al-Bukhari 5027",
    },
  },
  // Day 8
  {
    day: 8,
    verse: {
      ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً",
      en: "Our Lord, give us good in this world and good in the Hereafter.",
      ref: "Al-Baqarah 2:201",
    },
    hadith: {
      ar: "مَنْ فَطَّرَ صَائِمًا كَانَ لَهُ مِثْلُ أَجْرِهِ",
      en: "Whoever provides a fasting person with iftar will have a reward like theirs.",
      ref: "Sunan at-Tirmidhi 807",
    },
  },
  // Day 9
  {
    day: 9,
    verse: {
      ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      en: "Indeed, with hardship comes ease.",
      ref: "Ash-Sharh 94:6",
    },
    hadith: {
      ar: "الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ وَرَمَضَانُ إِلَى رَمَضَانَ مُكَفِّرَاتٌ مَا بَيْنَهُنَّ",
      en: "The five daily prayers, Friday to Friday, and Ramadan to Ramadan are expiation for what is between them.",
      ref: "Sahih Muslim 233",
    },
  },
  // Day 10
  {
    day: 10,
    verse: {
      ar: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنفُسِهِمْ لا تَقْنَطُوا مِن رَحْمَةِ اللَّهِ",
      en: "Say: O My servants who have transgressed against yourselves, do not despair of the mercy of Allah.",
      ref: "Az-Zumar 39:53",
    },
    hadith: {
      ar: "كُلُّ عَمَلِ ابْنِ آدَمَ يُضَاعَفُ الْحَسَنَةُ عَشْرُ أَمْثَالِهَا إِلَى سَبْعِمِائَةِ ضِعْفٍ إِلَّا الصَّوْمَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ",
      en: "Every deed of the son of Adam is multiplied ten to seven hundred times, except fasting, for it is for Me and I will reward it.",
      ref: "Sahih Muslim 1151",
    },
  },
  // Day 11 – Forgiveness begins
  {
    day: 11,
    verse: {
      ar: "وَسَارِعُوا إِلَى مَغْفِرَةٍ مِّن رَّبِّكُمْ",
      en: "And hasten to forgiveness from your Lord.",
      ref: "Aal-Imran 3:133",
    },
    hadith: {
      ar: "إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ",
      en: "Allah extends His hand at night for the sinner of the day to repent.",
      ref: "Sahih Muslim 2759",
    },
  },
  // Day 12
  {
    day: 12,
    verse: {
      ar: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
      en: "Those who strive for Us — We will surely guide them to Our ways.",
      ref: "Al-Ankabut 29:69",
    },
    hadith: {
      ar: "إِنَّ الصَّدَقَةَ لَتُطْفِئُ غَضَبَ الرَّبِّ",
      en: "Charity extinguishes the Lord's anger.",
      ref: "Sunan at-Tirmidhi 664",
    },
  },
  // Day 13
  {
    day: 13,
    verse: {
      ar: "وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
      en: "And Allah loves those who do good.",
      ref: "Aal-Imran 3:134",
    },
    hadith: {
      ar: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
      en: "Your smile to your brother is an act of charity.",
      ref: "Sunan at-Tirmidhi 1956",
    },
  },
  // Day 14
  {
    day: 14,
    verse: {
      ar: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ",
      en: "We will certainly test you with something of fear and hunger.",
      ref: "Al-Baqarah 2:155",
    },
    hadith: {
      ar: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
      en: "Charity does not decrease wealth.",
      ref: "Sahih Muslim 2588",
    },
  },
  // Day 15
  {
    day: 15,
    verse: {
      ar: "وَلَذِكْرُ اللَّهِ أَكْبَرُ",
      en: "And the remembrance of Allah is greater.",
      ref: "Al-Ankabut 29:45",
    },
    hadith: {
      ar: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
      en: "Two words light on the tongue, heavy on the scale, beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil Azeem.",
      ref: "Sahih al-Bukhari 6406",
    },
  },
  // Day 16
  {
    day: 16,
    verse: {
      ar: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
      en: "My Lord, expand my chest and ease my task for me.",
      ref: "Ta-Ha 20:25-26",
    },
    hadith: {
      ar: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
      en: "Supplication is the essence of worship.",
      ref: "Sunan at-Tirmidhi 3371",
    },
  },
  // Day 17
  {
    day: 17,
    verse: {
      ar: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّى يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
      en: "Allah does not change the condition of a people until they change what is within themselves.",
      ref: "Ar-Ra'd 13:11",
    },
    hadith: {
      ar: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ",
      en: "The closest a servant is to his Lord is when he is in prostration.",
      ref: "Sahih Muslim 482",
    },
  },
  // Day 18
  {
    day: 18,
    verse: {
      ar: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ",
      en: "And turn to Allah in repentance, all of you, O believers, so that you may succeed.",
      ref: "An-Nur 24:31",
    },
    hadith: {
      ar: "خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ وَخَيْرُ مَا قُلْتُ أَنَا وَالنَّبِيُّونَ مِنْ قَبْلِي لَا إِلَهَ إِلَّا اللَّهُ",
      en: "The best supplication is on the Day of Arafah, and the best thing I and the prophets have said is La ilaha illallah.",
      ref: "Sunan at-Tirmidhi 3585",
    },
  },
  // Day 19
  {
    day: 19,
    verse: {
      ar: "وَاللَّهُ غَفُورٌ رَّحِيمٌ",
      en: "And Allah is Forgiving, Merciful.",
      ref: "Al-Baqarah 2:173",
    },
    hadith: {
      ar: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
      en: "Protect yourselves from the Fire even with half a date (in charity).",
      ref: "Sahih al-Bukhari 1417",
    },
  },
  // Day 20
  {
    day: 20,
    verse: {
      ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا",
      en: "O you who believe, persevere and endure and remain stationed.",
      ref: "Aal-Imran 3:200",
    },
    hadith: {
      ar: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      en: "O Allah, You are Pardoning, You love to pardon, so pardon me.",
      ref: "Sunan at-Tirmidhi 3513",
    },
  },
  // Day 21 – Freedom from Fire / Last 10 Nights
  {
    day: 21,
    verse: {
      ar: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ",
      en: "Indeed, We sent it down during the Night of Decree.",
      ref: "Al-Qadr 97:1",
    },
    hadith: {
      ar: "مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
      en: "Whoever stands (in prayer) on the Night of Qadr out of faith and seeking reward, his past sins will be forgiven.",
      ref: "Sahih al-Bukhari 1901",
    },
  },
  // Day 22
  {
    day: 22,
    verse: {
      ar: "لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
      en: "The Night of Decree is better than a thousand months.",
      ref: "Al-Qadr 97:3",
    },
    hadith: {
      ar: "كَانَ رَسُولُ اللَّهِ ﷺ إِذَا دَخَلَ الْعَشْرُ أَحْيَا اللَّيْلَ وَأَيْقَظَ أَهْلَهُ وَجَدَّ وَشَدَّ الْمِئْزَرَ",
      en: "When the last ten nights began, the Prophet ﷺ would stay up at night, wake his family, and strive harder.",
      ref: "Sahih al-Bukhari 2024",
    },
  },
  // Day 23
  {
    day: 23,
    verse: {
      ar: "تَنَزَّلُ الْمَلائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ",
      en: "The angels and the Spirit descend therein by permission of their Lord for every matter.",
      ref: "Al-Qadr 97:4",
    },
    hadith: {
      ar: "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْوِتْرِ مِنَ الْعَشْرِ الأَوَاخِرِ",
      en: "Seek the Night of Qadr in the odd nights of the last ten.",
      ref: "Sahih al-Bukhari 2017",
    },
  },
  // Day 24
  {
    day: 24,
    verse: {
      ar: "سَلامٌ هِيَ حَتَّى مَطْلَعِ الْفَجْرِ",
      en: "Peace it is until the emergence of dawn.",
      ref: "Al-Qadr 97:5",
    },
    hadith: {
      ar: "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
      en: "Whoever prays during Ramadan out of faith and seeking reward will have his past sins forgiven.",
      ref: "Sahih al-Bukhari 37",
    },
  },
  // Day 25
  {
    day: 25,
    verse: {
      ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
      en: "Whoever fears Allah — He will make a way out for them.",
      ref: "At-Talaq 65:2",
    },
    hadith: {
      ar: "إِنَّ لِلصَّائِمِ عِنْدَ فِطْرِهِ لَدَعْوَةً مَا تُرَدُّ",
      en: "The fasting person has a supplication at the time of breaking fast that is not rejected.",
      ref: "Sunan Ibn Majah 1753",
    },
  },
  // Day 26
  {
    day: 26,
    verse: {
      ar: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
      en: "My mercy encompasses all things.",
      ref: "Al-A'raf 7:156",
    },
    hadith: {
      ar: "لِلصَّائِمِ فَرْحَتَانِ فَرْحَةٌ عِنْدَ فِطْرِهِ وَفَرْحَةٌ عِنْدَ لِقَاءِ رَبِّهِ",
      en: "The fasting person has two joys: joy when breaking fast and joy when meeting his Lord.",
      ref: "Sahih al-Bukhari 1904",
    },
  },
  // Day 27
  {
    day: 27,
    verse: {
      ar: "إِنَّ اللَّهَ وَمَلائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ",
      en: "Indeed, Allah and His angels send blessings upon the Prophet.",
      ref: "Al-Ahzab 33:56",
    },
    hadith: {
      ar: "أَكْثِرُوا عَلَيَّ مِنَ الصَّلاةِ فِي يَوْمِ الْجُمُعَةِ",
      en: "Send more blessings upon me on Friday.",
      ref: "Sunan Abu Dawud 1047",
    },
  },
  // Day 28
  {
    day: 28,
    verse: {
      ar: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى",
      en: "And your Lord will give you so that you will be pleased.",
      ref: "Ad-Duha 93:5",
    },
    hadith: {
      ar: "عُمْرَةٌ فِي رَمَضَانَ تَعْدِلُ حَجَّةً",
      en: "An Umrah in Ramadan is equal to Hajj (in reward).",
      ref: "Sahih al-Bukhari 1863",
    },
  },
  // Day 29
  {
    day: 29,
    verse: {
      ar: "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
      en: "Whoever does an atom's weight of good will see it.",
      ref: "Az-Zalzalah 99:7",
    },
    hadith: {
      ar: "لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلِقٍ",
      en: "Do not belittle any good deed, even meeting your brother with a cheerful face.",
      ref: "Sahih Muslim 2626",
    },
  },
  // Day 30
  {
    day: 30,
    verse: {
      ar: "وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَى مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ",
      en: "Complete the number [of days] and glorify Allah for having guided you, so that you may be grateful.",
      ref: "Al-Baqarah 2:185",
    },
    hadith: {
      ar: "مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ",
      en: "Whoever fasts Ramadan then follows it with six days of Shawwal, it is as if they fasted the entire year.",
      ref: "Sahih Muslim 1164",
    },
  },
];
