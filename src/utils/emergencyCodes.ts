export type HospitalEmergencyCode =
  | 'CODE_BLUE'
  | 'CODE_RED'
  | 'CODE_YELLOW'
  | 'CODE_PINK'
  | 'CODE_SILVER'
  | 'CODE_ORANGE';

export interface EmergencyCodeConfig {
  code: HospitalEmergencyCode;
  nameAr: string;
  nameEn: string;
  shortLabel: string;
  categoryAr: string;
  colorName: string;
  colorHex: string;
  bgBannerClass: string;
  btnClass: string;
  badgeClass: string;
  borderClass: string;
  descriptionAr: string;
  locationDefault: string;
  spokenArabic: string;
  spokenEnglish: string;
}

export const EMERGENCY_CODES: Record<HospitalEmergencyCode, EmergencyCodeConfig> = {
  CODE_BLUE: {
    code: 'CODE_BLUE',
    nameAr: 'كود أزرق (Code Blue)',
    nameEn: 'Code Blue',
    shortLabel: 'كود بلو',
    categoryAr: 'إنعاش قلبي رئوي وحالة حرجة',
    colorName: 'أزرق',
    colorHex: '#2563eb',
    bgBannerClass: 'bg-blue-600',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    borderClass: 'border-blue-500',
    descriptionAr: 'حالة إنعاش قلبي رئوي وتوقف مفاجئ في الدورة الدموية أو التنفس (Cardiac / Respiratory Arrest)',
    locationDefault: 'مبنى العيادات الخارجية - الدور الثاني',
    spokenArabic: 'انتباه من فضلكم. كود أزرق. كود أزرق. إنعاش قلبي رئوي في مبنى العيادات الدور الثاني.',
    spokenEnglish: 'Attention please. Code Blue. Code Blue. Cardiac arrest, Clinic building second floor.'
  },
  CODE_RED: {
    code: 'CODE_RED',
    nameAr: 'كود أحمر (Code Red)',
    nameEn: 'Code Red',
    shortLabel: 'كود أحمر',
    categoryAr: 'حريق أو دخان وإخلاء',
    colorName: 'أحمر',
    colorHex: '#dc2626',
    bgBannerClass: 'bg-red-600',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    borderClass: 'border-red-500',
    descriptionAr: 'إنذار حريق أو رصد دخان وإخلاء فوري للمنطقة (Fire / Smoke / Evacuation)',
    locationDefault: 'الجناح الشرقي - قسم العمليات',
    spokenArabic: 'انتباه من فضلكم. كود أحمر. كود أحمر. إنذار حريق وإخلاء في الجناح الشرقي.',
    spokenEnglish: 'Attention please. Code Red. Code Red. Fire alert and evacuation in East Wing.'
  },
  CODE_YELLOW: {
    code: 'CODE_YELLOW',
    nameAr: 'كود أصفر (Code Yellow)',
    nameEn: 'Code Yellow',
    shortLabel: 'كود أصفر',
    categoryAr: 'طوارئ داخلية وكوارث',
    colorName: 'أصفر',
    colorHex: '#d97706',
    bgBannerClass: 'bg-amber-600',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    borderClass: 'border-amber-500',
    descriptionAr: 'طوارئ داخلية، عطل في شبكة الغازات أو الكهرباء، أو استقبال جماعي لمصابين (Internal Disaster / Mass Casualty)',
    locationDefault: 'قسم الطوارئ والاستقبال العام',
    spokenArabic: 'انتباه من فضلكم. كود أصفر. كود أصفر. إعلان حالة طوارئ داخلية.',
    spokenEnglish: 'Attention please. Code Yellow. Code Yellow. Internal disaster protocol activated.'
  },
  CODE_PINK: {
    code: 'CODE_PINK',
    nameAr: 'كود بينك (Code Pink)',
    nameEn: 'Code Pink',
    shortLabel: 'كود بينك',
    categoryAr: 'طوارئ أطفال واختطاف رضيع',
    colorName: 'وردي',
    colorHex: '#db2777',
    bgBannerClass: 'bg-pink-600',
    btnClass: 'bg-pink-600 hover:bg-pink-700 text-white',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
    borderClass: 'border-pink-500',
    descriptionAr: 'اشتباه اختطاف رضيع أو طفل أو طوارئ حرجة بحضانة الأطفال (Infant / Pediatric Emergency or Abduction)',
    locationDefault: 'جناح النساء والولادة والحضانة',
    spokenArabic: 'انتباه من فضلكم. كود بينك. كود بينك. إغلاق المنافذ، طوارئ أطفال.',
    spokenEnglish: 'Attention please. Code Pink. Code Pink. Pediatric security alert.'
  },
  CODE_SILVER: {
    code: 'CODE_SILVER',
    nameAr: 'كود سيلفر (Code Silver)',
    nameEn: 'Code Silver',
    shortLabel: 'كود سيلفر',
    categoryAr: 'تهديد أمني وسلاح',
    colorName: 'فضي',
    colorHex: '#475569',
    bgBannerClass: 'bg-slate-700',
    btnClass: 'bg-slate-700 hover:bg-slate-800 text-white',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    borderClass: 'border-slate-500',
    descriptionAr: 'شخص مسلح أو تهديد أمني مباشر وحصار أمني (Security Threat / Armed Intruder)',
    locationDefault: 'البوابة الرئيسية وصالة الاستقبال',
    spokenArabic: 'انتباه من فضلكم. كود سيلفر. كود سيلفر. إجراءات أمنية مشددة، الاحتماء الفوري.',
    spokenEnglish: 'Attention please. Code Silver. Code Silver. Security lockdown protocol.'
  },
  CODE_ORANGE: {
    code: 'CODE_ORANGE',
    nameAr: 'كود برتقالي (Code Orange)',
    nameEn: 'Code Orange',
    shortLabel: 'كود برتقالي',
    categoryAr: 'تسرب مواد خطرة كيميائية',
    colorName: 'برتقالي',
    colorHex: '#ea580c',
    bgBannerClass: 'bg-orange-600',
    btnClass: 'bg-orange-600 hover:bg-orange-700 text-white',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    borderClass: 'border-orange-500',
    descriptionAr: 'تسرب مواد كيميائية أو إشعاعية أو بيولوجية خطرة (Hazardous Material HazMat Spill)',
    locationDefault: 'مبنى المختبر المركزي وبنك الدم',
    spokenArabic: 'انتباه من فضلكم. كود أورانج. كود أورانج. تسرب مواد خطرة، عزل المنطقة.',
    spokenEnglish: 'Attention please. Code Orange. Code Orange. Hazmat spill, isolate area.'
  }
};

export const EMERGENCY_CODE_LIST = Object.values(EMERGENCY_CODES);
