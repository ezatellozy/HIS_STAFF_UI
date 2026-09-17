import {
  ClinicalOrderItem,
  ClinicalRequestItem,
  ClinicalOrderSet,
  MedicationOrderDetails,
  LabOrderDetails,
  ImagingOrderDetails,
  ProcedureOrderDetails,
  CDSSMockAlert
} from '../types/clinicalOrdersRequests';

// =============================================================
// CATALOG ITEMS FOR TYPE-SPECIFIC COMPOSERS
// =============================================================

export interface MedicationCatalogItem {
  id: string;
  genericName: string;
  brandName: string;
  category: string;
  dosageForms: string[];
  strengths: string[];
  doseUnits: string[];
  suggestedDoses: number[];
  allowedRoutes: string[];
  allowedFrequencies: string[]; // Strictly Frequency / Timing: once, Q8H, Q12H, daily, etc. NOT STAT.
  allowedAdministrationPatterns?: ('standard_scheduled' | 'continuous_infusion' | 'titrated_infusion' | 'loading_and_maintenance')[];
  defaultPattern?: 'standard_scheduled' | 'continuous_infusion' | 'titrated_infusion' | 'loading_and_maintenance';
  isHighAlert?: boolean;
  requiresDualSignoff?: boolean;
  requiresRenalCheck?: boolean;
  blackBoxWarningAr?: string;
}

export const MEDICATION_CATALOG: MedicationCatalogItem[] = [
  {
    id: 'med-ntg-inf',
    genericName: 'Nitroglycerin',
    brandName: 'Tridil / Nitronal',
    category: 'Cardiovascular / Antianginal',
    dosageForms: ['محلول تسريب وريدي مستمر (IV Infusion)'],
    strengths: ['50 mg / 250 mL D5W (200 mcg/mL)'],
    doseUnits: ['mcg/min'],
    suggestedDoses: [5, 10, 15, 20, 30, 50],
    allowedRoutes: ['Continuous IV Infusion'],
    allowedFrequencies: ['مستمر مع المعايرة السريرية (Continuous / Titrated)'],
    allowedAdministrationPatterns: ['continuous_infusion', 'titrated_infusion'],
    defaultPattern: 'titrated_infusion',
    isHighAlert: true,
    requiresDualSignoff: true,
    blackBoxWarningAr: 'يتطلب معايرة مستمرة حسب قياس ضغط الدم كل 10 دقائق لتجنب هبوط الضغط الحاد.'
  },
  {
    id: 'med-enoxaparin',
    genericName: 'Enoxaparin Sodium',
    brandName: 'Clexane / Lovenox',
    category: 'Anticoagulant / LMWH',
    dosageForms: ['حقنة جاهزة معبأة مسبقاً (Prefilled Syringe)'],
    strengths: ['40 mg / 0.4 mL', '60 mg / 0.6 mL', '80 mg / 0.8 mL', '100 mg / 1.0 mL'],
    doseUnits: ['mg'],
    suggestedDoses: [40, 60, 80, 100],
    allowedRoutes: ['Subcutaneous (SC)'],
    allowedFrequencies: ['Q12H (كل 12 ساعة)', 'Q24H (كل 24 ساعة)'],
    allowedAdministrationPatterns: ['standard_scheduled'],
    defaultPattern: 'standard_scheduled',
    isHighAlert: true,
    requiresRenalCheck: true,
    blackBoxWarningAr: 'تعديل الجرعة إلزامي لمرضى الفشل الكلوي الحاد (CrCl < 30 mL/min) لتجنب تراكم الدواء.'
  },
  {
    id: 'med-aspirin',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    brandName: 'Aspocid / Bayer Aspirin',
    category: 'Antiplatelet',
    dosageForms: ['قرص مضغ (Chewable Tablet)', 'قرص مغلف معوياً (Enteric-Coated)'],
    strengths: ['81 mg', '100 mg', '300 mg'],
    doseUnits: ['mg'],
    suggestedDoses: [81, 100, 300],
    allowedRoutes: ['Oral (PO)'],
    allowedFrequencies: ['Once Daily (مرة واحدة يومياً)', 'Once only (جرعة وحيدة / Loading Dose)'],
    allowedAdministrationPatterns: ['standard_scheduled', 'loading_and_maintenance'],
    defaultPattern: 'standard_scheduled',
    isHighAlert: false
  },
  {
    id: 'med-metoprolol',
    genericName: 'Metoprolol Tartrate',
    brandName: 'Lopressor / Betaloc',
    category: 'Cardiovascular / Beta-Blocker',
    dosageForms: ['قرص فموي (Tablet)', 'أمبول حقن وريدي (IV Ampoule)'],
    strengths: ['25 mg', '50 mg', '5 mg / 5 mL IV'],
    doseUnits: ['mg'],
    suggestedDoses: [12.5, 25, 50],
    allowedRoutes: ['Oral (PO)', 'Slow IV Push'],
    allowedFrequencies: ['Q12H (مرتين يومياً)', 'Q8H (ثلاث مرات يومياً)', 'Once only (جرعة واحدة)'],
    allowedAdministrationPatterns: ['standard_scheduled'],
    defaultPattern: 'standard_scheduled',
    isHighAlert: false,
    blackBoxWarningAr: 'عدم الإعطاء إذا كان معدل النبض أقل من 55 bpm أو الضغط الانقباضي أقل من 100 mmHg.'
  },
  {
    id: 'med-vancomycin',
    genericName: 'Vancomycin Hydrochloride',
    brandName: 'Vancocin',
    category: 'Antibiotic / Glycopeptide',
    dosageForms: ['مسحوق محلول تسريب وريدي (Powder for IV Infusion)'],
    strengths: ['500 mg Vial', '1000 mg (1g) Vial'],
    doseUnits: ['mg', 'g'],
    suggestedDoses: [1000, 1250, 1500],
    allowedRoutes: ['IV Intermittent Infusion'],
    allowedFrequencies: ['Q12H', 'Q24H (بحسب وظائف الكلى)'],
    allowedAdministrationPatterns: ['standard_scheduled', 'loading_and_maintenance'],
    defaultPattern: 'standard_scheduled',
    isHighAlert: true,
    requiresRenalCheck: true,
    blackBoxWarningAr: 'يتطلب فحص مستوى التروي بالدم (Trough Level) قبل الجرعة الرابعة لتجنب التسمم الكلوي والسمعي.'
  },
  {
    id: 'med-ceftriaxone',
    genericName: 'Ceftriaxone Sodium',
    brandName: 'Rocephin',
    category: 'Antibiotic / 3rd Gen Cephalosporin',
    dosageForms: ['حقن وريدي / عضلي (IV / IM Vial)'],
    strengths: ['1 g Vial', '2 g Vial'],
    doseUnits: ['g'],
    suggestedDoses: [1, 2],
    allowedRoutes: ['IV Infusion', 'IV Slow Push', 'IM (مع ليدوكايين)'],
    allowedFrequencies: ['Q24H (مرة يومياً)', 'Q12H'],
    allowedAdministrationPatterns: ['standard_scheduled'],
    defaultPattern: 'standard_scheduled',
    isHighAlert: false
  },
  {
    id: 'med-insulin-sliding',
    genericName: 'Regular Insulin (Short-Acting)',
    brandName: 'Actrapid / Humulin R',
    category: 'Endocrine / Insulin',
    dosageForms: ['محلول حقن تحت الجلد / وريدي'],
    strengths: ['100 units / mL'],
    doseUnits: ['units'],
    suggestedDoses: [2, 4, 6, 8, 10],
    allowedRoutes: ['Subcutaneous (SC)', 'IV Bolus / Infusion'],
    allowedFrequencies: ['Sliding Scale AC (قبل الوجبات)', 'Q6H (كل 6 ساعات)', 'PRN (عند اللزوم حسب السكر)'],
    allowedAdministrationPatterns: ['standard_scheduled'],
    defaultPattern: 'standard_scheduled',
    isHighAlert: true,
    requiresDualSignoff: true
  }
];

export interface LabCatalogItem {
  id: string;
  testNameAr: string;
  testNameEn: string;
  category: string;
  specimenType: string;
  loincCode: string;
  defaultPriority: 'routine' | 'urgent' | 'stat';
  fastingRequired: boolean;
  specialHandling?: string;
  turnaroundTimeEstimated: string;
}

export const LAB_CATALOG: LabCatalogItem[] = [
  {
    id: 'lab-trop-hs',
    testNameAr: 'إنزيم التروبونين عالي الحساسية (Troponin I High Sensitivity)',
    testNameEn: 'Troponin I (High-Sensitivity) Serial Protocol',
    category: 'Biochemistry / Cardiac Biomarkers',
    specimenType: 'دم وريدي - مصل أنبوب أخضر (Lithium Heparin)',
    loincCode: '42757-5',
    defaultPriority: 'stat',
    fastingRequired: false,
    specialHandling: 'نقل فوري للمختبر خلال 15 دقيقة مع وضع علامة STAT',
    turnaroundTimeEstimated: '30 دقيقة'
  },
  {
    id: 'lab-cbc-diff',
    testNameAr: 'تعداد الدم الكامل مع التفريق (CBC with Differential)',
    testNameEn: 'Complete Blood Count (CBC) with Diff',
    category: 'Hematology',
    specimenType: 'دم كامل - أنبوب بنفسجي (K2-EDTA)',
    loincCode: '58410-2',
    defaultPriority: 'urgent',
    fastingRequired: false,
    turnaroundTimeEstimated: '45 دقيقة'
  },
  {
    id: 'lab-cmp',
    testNameAr: 'لوحة الأيض الشاملة ووظائف الكلى والكبد (CMP / Renal & Liver Profile)',
    testNameEn: 'Comprehensive Metabolic Panel (CMP)',
    category: 'Biochemistry',
    specimenType: 'مصل دم - أنبوب ذهبي مع هلام فاصل (SST)',
    loincCode: '24323-8',
    defaultPriority: 'urgent',
    fastingRequired: false,
    turnaroundTimeEstimated: '60 دقيقة'
  },
  {
    id: 'lab-blood-cultures',
    testNameAr: 'مزارع الدم للجرثوميات الهوائية واللاهوائية (Blood Cultures x 2 Sets)',
    testNameEn: 'Blood Culture (Aerobic & Anaerobic) - 2 Distinct Sets',
    category: 'Microbiology',
    specimenType: 'عينتا دم كامل من موضعين وريديين منفصلين (4 زجاجات)',
    loincCode: '600-7',
    defaultPriority: 'stat',
    fastingRequired: false,
    specialHandling: 'سحب العينات بتقنية تعقيم صارمة قبل بدء المضادات الحيوية',
    turnaroundTimeEstimated: 'تقرير أولي 24 ساعة'
  },
  {
    id: 'lab-coag',
    testNameAr: 'تحليل تخثر الدم وسيولته (Coagulation Profile: PT / INR / aPTT)',
    testNameEn: 'Coagulation Profile (PT, INR, PTT)',
    category: 'Hematology / Coagulation',
    specimenType: 'بلازما السيترات - أنبوب أزرق فاتح (Sodium Citrate 3.2%)',
    loincCode: '34714-6',
    defaultPriority: 'urgent',
    fastingRequired: false,
    specialHandling: 'ملء الأنبوب للعلامة الدقيقة 9:1 لتجنب نتائج التخثر الزائفة',
    turnaroundTimeEstimated: '45 دقيقة'
  }
];

export interface ImagingSafetyPolicyConfig {
  requiresPregnancyScreening?: boolean;
  requiresRenalAssessment?: boolean;
  requiresContrastAllergyCheck?: boolean;
  requiresMriSafetyZoneClearance?: boolean;
  requiresImplantDeviceScreening?: boolean;
  requiresSedationPrep?: boolean;
  otherSafetyRequirements?: string[];
  additionalSafetyNotesAr?: string;
}

export interface ImagingCatalogItem {
  id: string;
  studyNameAr: string;
  studyNameEn: string;
  modality: 'XR' | 'CT' | 'MRI' | 'US' | 'ECHO';
  bodyRegion: string;
  defaultContrast: 'none' | 'iv_contrast' | 'oral_only' | 'oral_and_iv';
  protocolOptions?: { id: string; nameAr: string; nameEn: string; defaultContrast: 'none' | 'iv_contrast' }[];
  requiresRenalSafetyCheck: boolean;
  requiresPregnancyScreen: boolean;
  safetyPolicyConfig: ImagingSafetyPolicyConfig;
  defaultPriority: 'routine' | 'urgent' | 'stat';
  patientPreparationAr?: string;
}

export const IMAGING_CATALOG: ImagingCatalogItem[] = [
  {
    id: 'img-ecg-stat',
    studyNameAr: 'تخطيط كهربائية القلب القياسي بـ 12 مسرى (12-Lead Electrocardiogram)',
    studyNameEn: '12-Lead Diagnostic Electrocardiogram (ECG)',
    modality: 'XR', // Functional bedside diagnostic
    bodyRegion: 'الصدر / القلب (Cardiothoracic)',
    defaultContrast: 'none',
    requiresRenalSafetyCheck: false,
    requiresPregnancyScreen: false,
    safetyPolicyConfig: {
      requiresPregnancyScreening: false,
      requiresRenalAssessment: false,
      requiresContrastAllergyCheck: false,
      requiresMriSafetyZoneClearance: false,
      requiresImplantDeviceScreening: false
    },
    defaultPriority: 'stat',
    patientPreparationAr: 'بجانب السرير فوراً - إرفاق القراءة الأوتوماتيكية فور انتهاء الفحص'
  },
  {
    id: 'img-cxr-portable',
    studyNameAr: 'أشعة الصدر السينية المتنقلة بجانب السرير (Portable Chest X-Ray AP)',
    studyNameEn: 'Portable Bedside Chest X-Ray (AP View)',
    modality: 'XR',
    bodyRegion: 'الصدر والرئتان (Chest / Lungs)',
    defaultContrast: 'none',
    requiresRenalSafetyCheck: false,
    requiresPregnancyScreen: true,
    safetyPolicyConfig: {
      requiresPregnancyScreening: true,
      requiresRenalAssessment: false,
      requiresContrastAllergyCheck: false,
      requiresMriSafetyZoneClearance: false,
      requiresImplantDeviceScreening: false,
      additionalSafetyNotesAr: 'تطبيق بروتوكول الأمان السريري وفحص الحمل وفق السياسة المعتمدة'
    },
    defaultPriority: 'urgent',
    patientPreparationAr: 'وضعية الجلوس قدر الإمكان، فحص الرئتين، موضع القساطر وظل القلب'
  },
  {
    id: 'img-cta-chest',
    studyNameAr: 'أشعة مقطعية لشرايين الصدر والرئتين بالصبغة الوريدية (CT Angio Chest / PE Protocol)',
    studyNameEn: 'Computed Tomography Angiography (CTA) Chest with IV Contrast',
    modality: 'CT',
    bodyRegion: 'الصدر والأوعية الكبرى (Cardiovascular / Thoracic)',
    defaultContrast: 'iv_contrast',
    requiresRenalSafetyCheck: true,
    requiresPregnancyScreen: true,
    safetyPolicyConfig: {
      requiresPregnancyScreening: true,
      requiresRenalAssessment: true,
      requiresContrastAllergyCheck: true,
      requiresMriSafetyZoneClearance: false,
      requiresImplantDeviceScreening: false,
      additionalSafetyNotesAr: 'تقييم وظائف الكلى للصبغة وسوابق التحسس لوسائط التباين وفحص الحمل وفق السياسة'
    },
    defaultPriority: 'stat',
    patientPreparationAr: 'صيام 4 ساعات، فحص وظائف الكلى (eGFR > 45 mL/min)، كانيولا وريدية 18G/20G'
  },
  {
    id: 'img-tte-echo',
    studyNameAr: 'تصوير صدى القلب بالموجات فوق الصوتية بجانب السرير (Bedside Transthoracic Echo)',
    studyNameEn: 'Transthoracic Echocardiogram (TTE) Bedside',
    modality: 'ECHO',
    bodyRegion: 'القلب والصمامات (Cardiac Chambers & Valves)',
    defaultContrast: 'none',
    requiresRenalSafetyCheck: false,
    requiresPregnancyScreen: false,
    safetyPolicyConfig: {
      requiresPregnancyScreening: false,
      requiresRenalAssessment: false,
      requiresContrastAllergyCheck: false,
      requiresMriSafetyZoneClearance: false,
      requiresImplantDeviceScreening: false
    },
    defaultPriority: 'urgent',
    patientPreparationAr: 'تقييم كفاءة البطين الأيسر (LVEF)، حركة الجدران، وسلامة الصمامات'
  },
  {
    id: 'img-mri-brain',
    studyNameAr: 'رنين مغناطيسي للدماغ (MRI Brain - Stroke & Neurological Protocol)',
    studyNameEn: 'Magnetic Resonance Imaging (MRI) Brain',
    modality: 'MRI',
    bodyRegion: 'الدماغ والجهاز العصبي (Brain / Head)',
    defaultContrast: 'none',
    protocolOptions: [
      { id: 'mri-stroke', nameAr: 'بروتوكول السكتة الدماغية العاجل (DWI/FLAIR)', nameEn: 'Stroke Protocol Non-Contrast', defaultContrast: 'none' },
      { id: 'mri-contrast', nameAr: 'بروتوكول الآفات مع صبغة الجادولينيوم (Gadolinium Enhanced)', nameEn: 'Tumor/Infection with Gadolinium', defaultContrast: 'iv_contrast' }
    ],
    requiresRenalSafetyCheck: false,
    requiresPregnancyScreen: false,
    safetyPolicyConfig: {
      requiresPregnancyScreening: false,
      requiresRenalAssessment: false,
      requiresContrastAllergyCheck: false,
      requiresMriSafetyZoneClearance: true,
      requiresImplantDeviceScreening: true,
      requiresSedationPrep: false,
      additionalSafetyNotesAr: 'استبعاد المعادن، التحقق من عدم وجود منظم ضربات قلب أو مشابك أم دم غير متوافقة مع الرنين'
    },
    defaultPriority: 'urgent',
    patientPreparationAr: 'إزالة كافة المعادن والملابس الخارجية، فحص استمارة أمان الرنين المغناطيسي Zone IV'
  }
];

export interface ProcedureRequirementsProfile {
  requiresConsent: boolean;
  requiresNpo: boolean;
  npoHoursRequired?: number;
  requiresSedationOrAnesthesia: boolean;
  requiresBloodCrossmatch: boolean;
  requiresCoagulationScreen: boolean;
}

export interface ProcedureCatalogItem {
  id: string;
  procedureNameAr: string;
  procedureNameEn: string;
  site: string;
  sedationType: 'none' | 'local' | 'moderate_conscious' | 'deep_sedation' | 'general';
  urgency: 'elective' | 'urgent' | 'emergent';
  requiredConsents: string[];
  requirementsProfile: ProcedureRequirementsProfile;
}

export const PROCEDURE_CATALOG: ProcedureCatalogItem[] = [
  {
    id: 'proc-cath-coronary',
    procedureNameAr: 'قسطرة الشرايين التاجية التشخيصية والتداخلية (Coronary Angiography & PCI)',
    procedureNameEn: 'Diagnostic Coronary Angiography +/- PCI',
    site: 'مختبر قسطرة القلب (Cardiac Cath Lab)',
    sedationType: 'moderate_conscious',
    urgency: 'urgent',
    requiredConsents: ['إقرار قسطرة وتوسيع الشرايين التاجية', 'إقرار الصبغة الظليلة والتخدير الواعي'],
    requirementsProfile: {
      requiresConsent: true,
      requiresNpo: true,
      npoHoursRequired: 6,
      requiresSedationOrAnesthesia: true,
      requiresBloodCrossmatch: true,
      requiresCoagulationScreen: true
    }
  },
  {
    id: 'proc-cvc-insert',
    procedureNameAr: 'تركيب قسطرة وريدية مركزية بتوجيه السونار (Ultrasound-Guided CVC Insertion)',
    procedureNameEn: 'US-Guided Central Venous Catheter Insertion',
    site: 'الوريد الوداجي الباطن الأيمن / الوريد تحت الترقوة',
    sedationType: 'local',
    urgency: 'urgent',
    requiredConsents: ['إقرار التدخل الوريدي الجراحي المصغر'],
    requirementsProfile: {
      requiresConsent: true,
      requiresNpo: false,
      requiresSedationOrAnesthesia: true,
      requiresBloodCrossmatch: false,
      requiresCoagulationScreen: true
    }
  },
  {
    id: 'proc-foley-catheter',
    procedureNameAr: 'تركيب قسطرة بولية مع تفريغ دقيق (Urinary Foley Catheter Insertion)',
    procedureNameEn: 'Bedside Indwelling Urinary Catheter',
    site: 'المثانة البولية (Urinary Bladder)',
    sedationType: 'none',
    urgency: 'urgent',
    requiredConsents: [],
    requirementsProfile: {
      requiresConsent: false, // Routine nursing bedside procedure, no formal surgery consent
      requiresNpo: false,
      requiresSedationOrAnesthesia: false,
      requiresBloodCrossmatch: false,
      requiresCoagulationScreen: false
    }
  },
  {
    id: 'proc-wound-debridement',
    procedureNameAr: 'تنظيف وتضميد الجروح المتقدم سريرياً (Bedside Wound Debridement & Dressing)',
    procedureNameEn: 'Advanced Bedside Wound Care & Debridement',
    site: 'موضع الجرح السريري',
    sedationType: 'local',
    urgency: 'elective',
    requiredConsents: [],
    requirementsProfile: {
      requiresConsent: false,
      requiresNpo: false,
      requiresSedationOrAnesthesia: false,
      requiresBloodCrossmatch: false,
      requiresCoagulationScreen: false
    }
  }
];

// =============================================================
// INITIAL MOCK DATA: CLINICAL ORDERS (Active / Completed / In-Progress)
// =============================================================

export const INITIAL_CLINICAL_ORDERS: ClinicalOrderItem[] = [
  {
    id: 'ORD-1091',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterLocation: 'قسم الطوارئ - سرير الإنعاش الحاد 02',
    category: 'laboratory',
    orderTitleAr: 'فحص التروبونين عالي الحساسية التسلسلي (Troponin I High-Sensitivity Serial)',
    orderTitleEn: 'Troponin I High-Sensitivity (Serial Protocol)',
    priority: 'stat',
    clinicalIndication: 'استبعاد أو تأكيد احتشاء عضلة القلب الحاد (Rule out NSTEMI / ACS)',
    orderedBy: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      specialty: 'طب الطوارئ'
    },
    orderedAt: '2026-09-12 10:30 ص',
    status: 'active',
    statusHistory: [
      {
        status: 'active',
        timestamp: '2026-09-12 10:30 ص',
        changedBy: 'د. طارق المنشاوي',
        reason: 'تم التوقيع والاعتماد الإلكتروني'
      }
    ],
    resultPipelineStage: 'processing',
    resultPipelineStatus: 'processing',
    resultReferenceId: 'RES-TROP-901',
    labDetails: {
      catalogId: 'lab-trop-hs',
      testNameAr: 'إنزيم التروبونين عالي الحساسية (Troponin I High Sensitivity)',
      testNameEn: 'Troponin I (High-Sensitivity)',
      loincCode: '42757-5',
      specimenType: 'دم وريدي - مصل أنبوب أخضر (Lithium Heparin)',
      collectionTiming: 'immediate',
      fastingStatus: 'not_required',
      collectionInstructions: 'سحب العينة الثانية الساعة 01:30 م لمقارنة المنحنى الزمني مع العينة الأولى.'
    }
  },
  {
    id: 'ORD-1092',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterLocation: 'قسم الطوارئ - سرير الإنعاش الحاد 02',
    category: 'imaging',
    orderTitleAr: 'تخطيط كهربائية القلب التشخيصي بـ 12 مسرى (12-Lead Diagnostic ECG)',
    orderTitleEn: '12-Lead Diagnostic ECG STAT',
    priority: 'stat',
    clinicalIndication: 'ألم صدري حاد مشتبه كمتلازمة إكليلية حادة (Chest Pain - Rule out STEMI/NSTEMI)',
    orderedBy: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      specialty: 'طب الطوارئ'
    },
    orderedAt: '2026-09-12 10:32 ص',
    status: 'completed',
    statusHistory: [
      {
        status: 'active',
        timestamp: '2026-09-12 10:32 ص',
        changedBy: 'د. طارق المنشاوي'
      },
      {
        status: 'completed',
        timestamp: '2026-09-12 10:38 ص',
        changedBy: 'أحمد صلاح، RN',
        reason: 'تم إجراء التخطيط بنجاح وإرفاق التقرير والمنحنى بالملف السريري'
      }
    ],
    resultPipelineStage: 'final_report',
    resultPipelineStatus: 'final_report',
    resultReferenceId: 'RES-ECG-102',
    imagingDetails: {
      catalogId: 'img-ecg-stat',
      studyNameAr: 'تخطيط كهربائية القلب القياسي بـ 12 مسرى',
      studyNameEn: '12-Lead Electrocardiogram',
      modality: 'XR',
      bodyRegion: 'الصدر / القلب',
      contrastType: 'none',
      clinicalQuestion: 'تقييم انحرافات القطعة ST، موجات T، واضطرابات النظم القلبي.'
    }
  },
  {
    id: 'ORD-1093',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterLocation: 'قسم الطوارئ - سرير الإنعاش الحاد 02',
    category: 'medication',
    orderTitleAr: 'إينوكسابارين صوديوم 60 ملغ حقن تحت الجلد كل 12 ساعة (Enoxaparin 60mg SC Q12H)',
    orderTitleEn: 'Enoxaparin Sodium 60 mg SC Q12H',
    priority: 'urgent',
    clinicalIndication: 'مضاد تخثر علاجي لمتلازمة الشريان التاجي الحادة NSTEMI',
    orderedBy: {
      id: 'DOC-902',
      name: 'د. خالد عبد العزيز',
      role: 'استشاري قسطرة وأمراض القلب',
      specialty: 'أمراض القلب التداخلية'
    },
    orderedAt: '2026-09-12 11:15 ص',
    status: 'active',
    statusHistory: [
      {
        status: 'active',
        timestamp: '2026-09-12 11:15 ص',
        changedBy: 'د. خالد عبد العزيز',
        reason: 'تم التوقيع والاعتماد وإرساله لـ eMAR والصيدلية'
      }
    ],
    medicationDetails: {
      catalogId: 'med-enoxaparin',
      genericName: 'Enoxaparin Sodium',
      brandName: 'Clexane',
      dosageForm: 'حقنة جاهزة معبأة مسبقاً (Prefilled Syringe)',
      strength: '60 mg / 0.6 mL',
      doseAmount: 60,
      doseUnit: 'mg',
      route: 'Subcutaneous (SC)',
      frequency: 'Q12H (كل 12 ساعة)',
      durationDays: 5,
      startDate: '2026-09-12',
      isPrn: false,
      isHighAlert: true,
      verificationPolicy: 'pharmacist_pre_review',
      specialInstructions: 'مراقبة علامات النزف وموقع الحقن والصفائح الدموية. إيقاف الجرعة قبل القسطرة بـ 12 ساعة.'
    },
    cdssAlerts: [
      {
        id: 'cdss-01',
        type: 'renal_hepatic_concern',
        severity: 'informational',
        titleAr: 'تنبيه وظائف الكلى التقديرية (Renal Clearance Monitoring)',
        titleEn: 'eGFR Status Alert',
        messageAr: 'معدل الترشيح الكبيبي للمريض الحالي 72 mL/min/1.73m² (ضمن النطاق الآمن لجرعة 1 mg/kg كاملة).',
        messageEn: 'Patient eGFR is within safe range for standard therapeutic dosing.',
        canOverride: true,
        isOverridden: true,
        overrideReason: 'الجرعة محسوبة ومطابقة للوزن ووظائف الكلى الحالية'
      }
    ]
  },
  {
    id: 'ORD-1094',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterLocation: 'قسم الطوارئ - سرير الإنعاش الحاد 02',
    category: 'medication',
    orderTitleAr: 'تسريب وريدي مستمر لمحلول نيتروجليسرين (Nitroglycerin IV Infusion Titration)',
    orderTitleEn: 'Nitroglycerin IV Infusion 10 mcg/min Titration',
    priority: 'stat',
    clinicalIndication: 'توسيع الشرايين الإكليلية وتخفيف ألم الصدر والسيطرة على الضغط',
    orderedBy: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      specialty: 'طب الطوارئ'
    },
    orderedAt: '2026-09-12 11:30 ص',
    status: 'on_hold',
    statusHistory: [
      {
        status: 'active',
        timestamp: '2026-09-12 11:30 ص',
        changedBy: 'د. طارق المنشاوي'
      },
      {
        status: 'on_hold',
        timestamp: '2026-09-12 12:20 م',
        changedBy: 'د. خالد عبد العزيز',
        reason: 'تم إيقاف التسريب مؤقتاً بعد هبوط الألم واستقرار ضغط الدم الانقباضي عند 118 mmHg'
      }
    ],
    medicationDetails: {
      catalogId: 'med-ntg-inf',
      genericName: 'Nitroglycerin',
      brandName: 'Nitronal',
      dosageForm: 'محلول تسريب وريدي مستمر (IV Infusion)',
      strength: '50 mg / 250 mL D5W',
      doseAmount: 10,
      doseUnit: 'mcg/min',
      route: 'Continuous IV Infusion',
      frequency: 'Continuous Titration',
      startDate: '2026-09-12',
      isPrn: false,
      isHighAlert: true,
      continuousRate: '10 mcg/min',
      specialInstructions: 'معايرة بمقدار 5 mcg/min كل 5-10 دقائق، خفض التسريب فوراً إذا قل الضغط الانقباضي عن 100 mmHg.'
    },
    cdssAlerts: [
      {
        id: 'cdss-02',
        type: 'contraindication',
        severity: 'high_severity_blocking',
        titleAr: 'تنبيه موانع الاستعمال المطلقة - مثبطات PDE-5',
        titleEn: 'Absolute Contraindication Check',
        messageAr: 'تم التحقق من عدم تعاطي المريض لأدوية السيلدينافيل أو التادالافيل خلال آخر 48 ساعة.',
        messageEn: 'Verified no PDE-5 inhibitor use in prior 48 hours.',
        canOverride: true,
        isOverridden: true,
        overrideReason: 'تم التأكد السريري المباشر من المريض بعدم تناول أي أدوية من هذه الفئة'
      }
    ],
    // Scenario B: Verbal order profile where read-back is REQUIRED
    orderSourceProfile: {
      profileId: 'PROF-VO-EMERGENCY-READBACK',
      profileNameAr: 'بروفايل الأوامر الشفوية الطارئة (إلزامية التأكيد الشفوي)',
      orderSource: 'emergency_verbal',
      orderSourceLabelAr: 'أمر شفوي طارئ (Emergency Verbal Order)',
      isPermittedInContext: true,
      permittedContextDescriptionAr: 'مسموح في حالات الإنعاش القلبي الحاد وغرف العناية',
      receiver: {
        id: 'RN-402',
        name: 'مها الزهراني (RN)',
        role: 'Charge Nurse'
      },
      authorizedReceiverRoles: ['Registered Nurse (RN)', 'Clinical Pharmacist'],
      receivedAt: '2026-09-12 11:30 ص',
      orderingPractitioner: {
        id: 'DOC-881',
        name: 'د. طارق المنشاوي',
        role: 'Emergency Consultant'
      },
      isReasonRequired: true,
      emergencyRationaleOrReason: 'حالة ألم صدري إكليلي حاد غير مستجيب تتطلب بدء المعايرة الوريدية فوراً',
      isReadBackRequired: true,
      readBackConfirmed: true,
      readBackStatus: 'completed',
      isAuthenticationRequired: true,
      authenticationStatus: 'pending_authentication',
      configuredAuthenticationTarget: {
        targetHours: 24,
        targetDescriptionAr: 'المصادقة الإلكترونية خلال 24 ساعة وفق سياسة القسم',
        policyGoverningBody: 'سياسة الاعتماد للأوامر الشفوية الطارئة',
        isOverdue: false,
        escalationBehavior: 'إرسال إشعار تذكيري للطبيب وتنبيه استشاري القسم عند التجاوز'
      },
      isMockPolicyExample: true
    }
  },
  {
    id: 'ORD-1095',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterLocation: 'قسم الطوارئ - سرير الإنعاش الحاد 02',
    category: 'monitoring',
    orderTitleAr: 'مراقبة نظم القلب والمؤشرات الحيوية المستمرة عن بعد (Continuous Telemetry & SpO2 Monitoring)',
    orderTitleEn: 'Continuous Telemetry Monitoring',
    priority: 'urgent',
    clinicalIndication: 'مراقبة اللانظميات القلبية واضطرابات التروية التاجية الحادة',
    orderedBy: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      specialty: 'طب الطوارئ'
    },
    orderedAt: '2026-09-12 10:40 ص',
    status: 'active',
    statusHistory: [
      {
        status: 'active',
        timestamp: '2026-09-12 10:40 ص',
        changedBy: 'د. طارق المنشاوي'
      }
    ],
    careDetails: {
      careType: 'monitoring',
      instructionsAr: 'توصيل أقطاب التيليميتري الخماسية، ضبط إنذار النبض (أقل من 50 أو أعلى من 115 bpm)، إبلاغ الطبيب الفوري عن أي نوبات VT أو AF.',
      instructionsEn: 'Continuous 5-lead telemetry ECG and continuous pulse oximetry.',
      frequency: 'مستمر على مدار 24 ساعة (Continuous)'
    }
  },
  {
    id: 'ORD-1096',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterLocation: 'قسم الطوارئ - سرير الإنعاش الحاد 02',
    category: 'procedure',
    orderTitleAr: 'قسطرة تشخيصية وعلاجية للشرايين التاجية (Coronary Angiography & PCI)',
    orderTitleEn: 'Coronary Angiography & Revascularization (Cath Lab)',
    priority: 'stat',
    clinicalIndication: 'احتشاء عضلة القلب NSTEMI مرتفع الخطورة مع تغيرات تخطيط ديناميكية',
    orderedBy: {
      id: 'DOC-902',
      name: 'د. خالد عبد العزيز',
      role: 'استشاري قسطرة وأمراض القلب',
      specialty: 'أمراض القلب التداخلية'
    },
    orderedAt: '2026-09-12 11:45 ص',
    status: 'active',
    statusHistory: [
      {
        status: 'active',
        timestamp: '2026-09-12 11:45 ص',
        changedBy: 'د. خالد عبد العزيز',
        reason: 'تم التوقيع واعتماد الحجز بمعمل القسطرة'
      }
    ],
    resultPipelineStage: 'scheduled_prepared',
    resultPipelineStatus: 'scheduled_prepared',
    procedureDetails: {
      catalogId: 'proc-cath-pci',
      procedureNameAr: 'قسطرة تشخيصية وعلاجية للشرايين التاجية',
      procedureNameEn: 'Coronary Angiography & PCI',
      anatomicalSite: 'الشريان الكعبري الأيمن (Right Radial Artery)',
      laterality: 'right',
      sedationType: 'moderate_conscious',
      urgency: 'emergent',
      consentStatus: 'signed_verified',
      requirementsProfile: {
        requiresConsent: true,
        requiresNpo: true,
        npoHoursRequired: 4,
        requiresSedationOrAnesthesia: true,
        requiresBloodCrossmatch: true,
        requiresCoagulationScreen: true
      }
    }
  },
  {
    id: 'ORD-1097',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterLocation: 'قسم الطوارئ - سرير الإنعاش الحاد 02',
    category: 'medication',
    orderTitleAr: 'ميتوبرولول ترترات 25 ملغ فموياً مرتين يومياً (Metoprolol Tartrate 25mg PO BID)',
    orderTitleEn: 'Metoprolol Tartrate 25 mg PO BID',
    priority: 'routine',
    clinicalIndication: 'السيطرة على معدل ضربات القلب بعد استقرار الحالة الحادة',
    orderedBy: {
      id: 'DOC-902',
      name: 'د. خالد عبد العزيز',
      role: 'استشاري قسطرة وأمراض القلب',
      specialty: 'أمراض القلب التداخلية'
    },
    orderedAt: '2026-09-12 12:45 م',
    status: 'active',
    statusHistory: [
      {
        status: 'active',
        timestamp: '2026-09-12 12:45 م',
        changedBy: 'د. خالد عبد العزيز',
        reason: 'تم الاعتماد عبر الهاتف وفق البروفايل الاستشاري'
      }
    ],
    medicationDetails: {
      catalogId: 'med-metoprolol-oral',
      genericName: 'Metoprolol Tartrate',
      brandName: 'Lopressor / Betaloc',
      dosageForm: 'أقراص فموية (Oral Tablet)',
      strength: '25 mg',
      doseAmount: 25,
      doseUnit: 'mg',
      route: 'Oral (PO)',
      frequency: 'BID (مرتين يومياً)',
      startDate: '2026-09-12',
      isPrn: false,
      isHighAlert: false,
      specialInstructions: 'حجب الجرعة إذا كان النبض أقل من 55 bpm أو الضغط الانقباضي أقل من 100 mmHg.'
    },
    // Scenario C: Telephone order profile where read-back is NOT required by configured policy
    orderSourceProfile: {
      profileId: 'PROF-TO-STANDARD-NOREADBACK',
      profileNameAr: 'بروفايل الأوامر الهاتفية الاستشارية (بدون إلزامية التأكيد الشفوي)',
      orderSource: 'telephone_order',
      orderSourceLabelAr: 'أمر هاتفي استشاري (Consultant Telephone Order)',
      isPermittedInContext: true,
      permittedContextDescriptionAr: 'مسموح للأدوية الفموية الروتينية غير عالية الخطورة',
      receiver: {
        id: 'RN-401',
        name: 'أحمد صلاح (RN)',
        role: 'Staff Nurse'
      },
      authorizedReceiverRoles: ['Registered Nurse (RN)'],
      receivedAt: '2026-09-12 12:45 م',
      orderingPractitioner: {
        id: 'DOC-902',
        name: 'د. خالد عبد العزيز',
        role: 'Attending Cardiologist'
      },
      isReasonRequired: false,
      isReadBackRequired: false,
      readBackConfirmed: false,
      readBackStatus: 'not_required',
      isAuthenticationRequired: true,
      authenticationStatus: 'authenticated',
      authenticatedBy: {
        id: 'DOC-902',
        name: 'د. خالد عبد العزيز',
        role: 'استشاري قسطرة وأمراض القلب'
      },
      authenticatedAt: '2026-09-12 01:10 م',
      configuredAuthenticationTarget: {
        targetHours: 48,
        targetDescriptionAr: 'المصادقة الإلكترونية خلال 48 ساعة حسب سياسة الأوامر الروتينية',
        policyGoverningBody: 'سياسة الأوامر الهاتفية غير الحرجة',
        isOverdue: false
      },
      isMockPolicyExample: true
    }
  }
];

// =============================================================
// INITIAL MOCK DATA: CLINICAL REQUESTS (Consultation / Admission / Surgery / Transfer)
// Note: Requests != Orders and Requests != Actual Clinical Events!
// =============================================================

export const INITIAL_CLINICAL_REQUESTS: ClinicalRequestItem[] = [
  {
    id: 'REQ-CONS-401',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    requestType: 'consultation_request',
    titleAr: 'طلب استشارة عاجلة لأمراض القلب التداخلية (Urgent Interventional Cardiology Consult)',
    titleEn: 'Interventional Cardiology Urgent Bedside Consult',
    priority: 'stat',
    requestedDepartment: 'مركز أمراض القلب والقسطرة التداخلية',
    requestedSpecialty: 'Interventional Cardiology',
    targetServiceOrUnit: 'فريق القسطرة القلبية التداخلية المناوب (On-Call Cath Team)',
    clinicalQuestionOrReason: 'تقييم حالة احتشاء حاد NSTEMI مرتفع الخطورة لتحديد مؤشر القسطرة الإسعافية وتوقيتها.',
    clinicalSummary: 'مريض 58 سنة، ألم صدري حاد مستمر، انخفاض ST في المساري V4-V6، تروبونين عالي الحساسية مرتفع 0.18 ng/mL. تم تحميل مضادات الصفيحات وبدء التمييع.',
    relevantDiagnoses: ['Acute NSTEMI', 'Essential Hypertension', 'Type 2 Diabetes'],
    relevantVitalsSnapshot: 'BP 148/92, HR 98, SpO2 96%, RR 20',
    relevantLabsSnapshot: 'Hs-Troponin I: 0.18 ng/mL (High), Serum Cr: 1.1 mg/dL',
    requestingClinician: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ',
      contactNumber: 'Ext. 2104'
    },
    requestedAt: '2026-09-12 11:10 ص',
    preferredTiming: 'خلال 30 دقيقة بجانب السرير (Bedside STAT)',
    requestStatus: 'completed_closed',
    fulfillmentStatus: 'completed',
    assignedToTeam: 'فريق القسطرة التداخلية المناوب',
    assignedToClinician: 'د. خالد عبد العزيز (استشاري قسطرة القلب)',
    claimedByClinician: 'د. خالد عبد العزيز',
    workStatusUpdatedAt: '2026-09-12 12:10 م',
    workNotes: 'تم فحص المريض بجانب السرير وإصدار توصية القسطرة العاجلة وتوثيق ملاحظة الاستشارة.',
    actualEventDisclaimerAr: 'طلب استشارة مكتمل وموثق. تم توثيق تقرير الاستشارة النهائي بشكل منفصل في سجل الملاحظات السريرية (Consultation Note).',
    actualEventOccurred: true,
    resultingEventReference: {
      type: 'consultation_note',
      referenceId: 'NOTE-2026-082',
      referenceLabelAr: 'تقرير وملاحظة استشارة أمراض القلب',
      timestamp: '2026-09-12 12:10 م'
    },
    consultationDetails: {
      specialtyRequired: 'أمراض القلب التداخلية (Interventional Cardiology)',
      urgencyLevel: 'bedside_stat_15m',
      focalQuestion: 'هل تستدعي الحالة إجراء قسطرة شرايين فورية أم تنويم بوحدة العناية القلبية المركزة للمراقبة؟'
    }
  },
  {
    id: 'REQ-ADMIT-702',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    requestType: 'admission_request',
    titleAr: 'طلب تنويم عاجل بوحدة العناية القلبية المركزة (Urgent CCU Admission Request)',
    titleEn: 'Cardiac Intensive Care (CCU) Inpatient Admission Request',
    priority: 'urgent',
    requestedDepartment: 'قسم العناية المركزة وأمراض القلب (CCU)',
    requestedSpecialty: 'Critical Care Cardiology',
    targetServiceOrUnit: 'وحدة العناية المركزة لأمراض القلب (CCU Bed)',
    clinicalQuestionOrReason: 'تنويم طبي عاجل لمتابعة متلازمة الشريان التاجي الحادة عالية الخطورة والتحضير لإجراء القسطرة.',
    clinicalSummary: 'المريض مستقر سريرياً بعد تخفيف الألم بالمسكنات والتمييع، بحاجة لسرير مراقبة حثيثة مجهز بأجهزة التيليميتري المتقدمة.',
    relevantDiagnoses: ['Acute NSTEMI', 'Coronary Artery Disease'],
    requestingClinician: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ',
      contactNumber: 'Ext. 2104'
    },
    requestedAt: '2026-09-12 11:50 ص',
    requestStatus: 'submitted_active',
    fulfillmentStatus: 'in_progress',
    assignedToTeam: 'مكتب تنسيق وتخصيص أسرة العناية المركزة (Bed Management / CCU)',
    workStatusUpdatedAt: '2026-09-12 12:30 م',
    workNotes: 'تم قبول الطلب طبياً، جاري تجهيز سرير CCU-04 بعد استكمال إجراءات التعقيم للسرير.',
    actualEventDisclaimerAr: 'تنبيه: قبول وتفعيل طلب التنويم لا يمثل دخولاً فعلياً للسرير حتى يتم انتقال المريض واستلامه رسمياً في جناح التنويم.',
    actualEventOccurred: false,
    admissionDetails: {
      targetLevelOfCare: 'CCU',
      primaryAdmittingDiagnosis: 'High-Risk Non-ST Elevation Myocardial Infarction',
      isolationRequired: 'none',
      telemetryRequired: true
    }
  },
  {
    id: 'REQ-SURG-205',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    requestType: 'surgery_or_request',
    titleAr: 'طلب حجز وتجهيز غرفة قسطرة القلب التداخلية (Cath Lab Slot Booking)',
    titleEn: 'Urgent Coronary Angiography Cath Suite Request',
    priority: 'urgent',
    requestedDepartment: 'مجمع العمليات وقسطرة القلب',
    requestedSpecialty: 'Interventional Cardiology Cath Lab',
    targetServiceOrUnit: 'غرفة القسطرة التداخلية رقم 1 (Cath Lab Suite 1)',
    clinicalQuestionOrReason: 'إجراء قسطرة تشخيصية وتوسيع علاجي للشرايين التاجية المتضيقة مع وضع دعامة دوائية.',
    clinicalSummary: 'المريض تم تجهيزه وفحص وظائف الكلى سليم، صائم NPO، الإقرار موقع.',
    relevantDiagnoses: ['Coronary Artery Disease', 'NSTEMI'],
    requestingClinician: {
      id: 'DOC-902',
      name: 'د. خالد عبد العزيز',
      role: 'استشاري قسطرة وأمراض القلب',
      department: 'مركز القلب',
      contactNumber: 'Ext. 3310'
    },
    requestedAt: '2026-09-12 12:15 م',
    preferredTiming: 'الساعة 02:00 م (Today Slot)',
    requestStatus: 'submitted_active',
    fulfillmentStatus: 'accepted',
    assignedToTeam: 'طاقم تمريض وفنيي غرفة القسطرة 1',
    workStatusUpdatedAt: '2026-09-12 12:40 م',
    workNotes: 'تم حجز الفترة الزمنية وتأكيد جاهزية جهاز القسطرة ومواد التباين.',
    actualEventDisclaimerAr: 'طلب حجز إجراء تداخلي/جراحي. لا يُسجل الإجراء كعملية منفذة إلا بعد توثيق تقرير الجراحة الفعلي في غرفة العمليات (Operative Note).',
    actualEventOccurred: false,
    surgeryRequestDetails: {
      proposedProcedure: 'Coronary Angiography +/- Drug-Eluting Stent Implantation',
      anesthesiaConsultDone: true,
      preferredOrSuite: 'Cath Lab 1',
      estimatedDurationMinutes: 75
    }
  },
  {
    id: 'REQ-TRANS-INT-301',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    requestType: 'transfer_request',
    titleAr: 'طلب نقل داخلي بين الأقسام: من الطوارئ إلى العناية القلبية (Internal Transfer: ER -> CCU)',
    titleEn: 'Internal Departmental Transfer: Emergency -> Cardiac ICU',
    priority: 'urgent',
    requestedDepartment: 'وحدة العناية المركزة لأمراض القلب (CCU)',
    targetServiceOrUnit: 'CCU Bed 04',
    clinicalQuestionOrReason: 'نقل سريري داخلي بعد استقرار المريض بالطوارئ لمتابعة الرعاية الحرجة وتيليمتري مستمر.',
    clinicalSummary: 'مريض NSTEMI عالي الخطورة، مستقر بعد التحميل الدوائي، متصل بمونيتور وتيليمتري، جاهز للنقل الداخلي برفقة ممرض.',
    relevantDiagnoses: ['Acute NSTEMI', 'Hypertension'],
    requestingClinician: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ',
      contactNumber: 'Ext. 2104'
    },
    requestedAt: '2026-09-12 12:50 م',
    requestStatus: 'submitted_active',
    fulfillmentStatus: 'in_progress',
    assignedToTeam: 'فريق النقل السريري الداخلي وممرض الاستلام في CCU',
    workNotes: 'تم التنسيق الهاتفي وتأكيد جاهزية السرير وجهاز الصدمات والمونيتور.',
    actualEventDisclaimerAr: 'طلب نقل سريري داخلي. لا يكتمل النقل السريري وتغيير موقع السرير في النظام إلا بعد استلام المريض رسمياً في الوحدة المستقبلة وتأكيد Handover.',
    actualEventOccurred: false,
    transferDetails: {
      transferType: 'internal_transfer',
      sourceLocationOrService: 'قسم الطوارئ - سرير الإنعاش 02',
      fromLocation: 'ER Resus Bed 02',
      requestedDestinationOrService: 'وحدة العناية القلبية المركزة (CCU)',
      toLocation: 'CCU Bed 04',
      clinicalAcuity: 'high_acuity',
      transportRequirements: 'نقالة مجهزة بمونيتور مراقبة ومضخات تسريب وريدي (Stretcher with Transport Monitor & Infusion Pumps)',
      transportEscort: 'nurse_only',
      monitoringRequirements: ['Continuous ECG Telemetry', 'NIBP every 15 min', 'Continuous SpO2'],
      sbarHandoverSummary: 'S: احتشاء NSTEMI حاد. B: سكري وارتفاع ضغط. A: مستقر على تسريب نيتروجليسرين 10 mcg/min. R: استمرار المراقبة وتجهيز القسطرة الساعة 02:00 م.',
      receivingTeamOrService: 'طاقم تمريض العناية القلبية CCU'
    }
  },
  {
    id: 'REQ-TRANS-EXT-302',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    requestType: 'transfer_request',
    titleAr: 'طلب إحالة ونقل خارجي: مركز الملك فهد لجراحة القلب (External Facility Transfer)',
    titleEn: 'Inter-Facility Transfer: Specialized Cardiac Surgery Center',
    priority: 'routine',
    requestedDepartment: 'التنسيق الطبي والإحالات الخارجية (Medical Coordination)',
    targetServiceOrUnit: 'مركز الملك فهد المتخصص لأمراض وجراحة القلب',
    clinicalQuestionOrReason: 'طلب تحويل خارجي للمتابعة الجراحية المتقدمة في حال الحاجة لجراحة مجازة الشرايين التاجية (CABG).',
    clinicalSummary: 'مريض محول لدراسة جراحة القلب التخصصية متقدمة.',
    requestingClinician: {
      id: 'DOC-902',
      name: 'د. خالد عبد العزيز',
      role: 'استشاري قسطرة وأمراض القلب',
      department: 'مركز القلب'
    },
    requestedAt: '2026-09-12 01:00 م',
    requestStatus: 'draft',
    fulfillmentStatus: 'unassigned',
    actualEventDisclaimerAr: 'مسودة طلب نقل خارجي - تتطلب موافقة إدارة التنسيق الطبي والمنشأة المستقبلة قبل إرسال المريض.',
    actualEventOccurred: false,
    transferDetails: {
      transferType: 'external_facility_transfer',
      sourceLocationOrService: 'مستشفى الرعاية المتقدمة',
      destinationFacility: 'مركز الملك فهد التخصصي لجراحة القلب',
      clinicalAcuity: 'intermediate_stable',
      transportRequirements: 'إسعاف متقدم عناية مركزة (ALS Mobile ICU Ambulance)',
      transportEscort: 'doctor_and_nurse',
      transferReason: 'تقييم جراحة قلب تخصصية ثلاثية الشرايين (Triple Vessel CAD Evaluation)',
      acceptingPhysicianName: 'د. عادل النجار (استشاري جراحة القلب بالمركز المستقبل)',
      acceptingPhysicianPhone: '011-464-7272 Ext. 4022'
    }
  }
];

// =============================================================
// CONFIGURABLE POLICIES & LEVELS OF CARE
// =============================================================

export const CONFIGURED_LEVELS_OF_CARE = [
  { id: 'icu', nameAr: 'عناية مركزة فائقة 1:1 (Intensive Care - ICU)', requiresVentilator: true },
  { id: 'ccu', nameAr: 'عناية قلبية مركزة حثيثة (Coronary Care - CCU)', requiresTelemetry: true },
  { id: 'telemetry_stepdown', nameAr: 'مراقبة قلبية تيليمتري متقدمة (Stepdown / Telemetry)', requiresTelemetry: true },
  { id: 'general_ward', nameAr: 'تنويم اعتيادي بالأجنحة العامة (General Inpatient Ward)', requiresTelemetry: false }
];

export const DEFAULT_ORDER_ACTION_POLICIES: Record<string, {
  action: 'discontinue' | 'hold' | 'resume' | 'cancel';
  isReasonRequired: boolean;
  isConfirmationRequired: boolean;
  additionalAuthorizationRequired: boolean;
  authorizedRoles: string[];
}> = {
  discontinue: {
    action: 'discontinue',
    isReasonRequired: true,
    isConfirmationRequired: true,
    additionalAuthorizationRequired: false,
    authorizedRoles: ['Authorized Clinician', 'Attending Physician', 'Clinical Pharmacist']
  },
  hold: {
    action: 'hold',
    isReasonRequired: true,
    isConfirmationRequired: true,
    additionalAuthorizationRequired: false,
    authorizedRoles: ['Authorized Clinician', 'Specialist Nurse', 'Clinical Pharmacist']
  },
  resume: {
    action: 'resume',
    isReasonRequired: false, // Optional per policy!
    isConfirmationRequired: true,
    additionalAuthorizationRequired: false,
    authorizedRoles: ['Authorized Clinician', 'Attending Physician']
  },
  cancel: {
    action: 'cancel',
    isReasonRequired: true,
    isConfirmationRequired: true,
    additionalAuthorizationRequired: true,
    authorizedRoles: ['Authorized Clinician', 'Department Head']
  }
};

// =============================================================
// CLINICAL ORDER SETS / BUNDLES
// =============================================================

export const MOCK_CLINICAL_ORDER_SETS: ClinicalOrderSet[] = [
  {
    id: 'bundle-acs-chest-pain',
    code: 'ACS-PROTOCOL-V3',
    nameAr: 'حزمة متلازمة الشريان التاجي الحادة وألم الصدر (ACS / Chest Pain Clinical Bundle)',
    nameEn: 'Acute Coronary Syndrome Initial Management Protocol',
    version: '3.2 (2026 AHA/ESC Aligned)',
    clinicalContextAr: 'بروتوكول معتمد للمرضى البالغين المصابين بألم صدري مشتبه لنقص التروية القلبية.',
    targetDepartment: ['emergency', 'inpatient_ward', 'inpatient_icu'],
    evidenceSource: 'Saudi Heart Association & ESC Guidelines 2026',
    items: [
      {
        id: 'acs-01',
        category: 'imaging',
        titleAr: 'تخطيط قلب فوري بـ 12 مسرى (12-Lead ECG STAT)',
        titleEn: '12-Lead ECG STAT',
        priority: 'stat',
        isPreselected: true,
        rationaleAr: 'إلزامي خلال 10 دقائق من الوصول للتفريق بين STEMI و NSTEMI.',
        orderPayload: {
          category: 'imaging',
          priority: 'stat',
          orderTitleAr: 'تخطيط كهربائية القلب بـ 12 مسرى فوراً',
          orderTitleEn: '12-Lead ECG STAT'
        }
      },
      {
        id: 'acs-02',
        category: 'laboratory',
        titleAr: 'إنزيم التروبونين عالي الحساسية تسلسلي (Troponin I Hs 0h & 3h)',
        titleEn: 'High-Sensitivity Troponin I Serial',
        priority: 'stat',
        isPreselected: true,
        rationaleAr: 'المعيار الذهبي لتشخيص تلف الخلايا العضلية القلبية ومقارنة المنحنى.',
        orderPayload: {
          category: 'laboratory',
          priority: 'stat',
          orderTitleAr: 'فحص التروبونين عالي الحساسية التسلسلي',
          orderTitleEn: 'Troponin I High Sensitivity Serial'
        }
      },
      {
        id: 'acs-03',
        category: 'medication',
        titleAr: 'أسبرين 300 ملغ مضغ فموي جرعة تحميل (Aspirin 300mg PO Chewable STAT)',
        titleEn: 'Aspirin 300mg Chewable Loading Dose',
        priority: 'stat',
        isPreselected: true,
        rationaleAr: 'تثبيط سريع للصفيحات الدموية لتقليل انتشار الخثرة التاجية.',
        orderPayload: {
          category: 'medication',
          priority: 'stat',
          orderTitleAr: 'أسبرين 300 ملغ مضغ فموي جرعة تحميل',
          orderTitleEn: 'Aspirin 300mg PO Loading Dose'
        }
      },
      {
        id: 'acs-04',
        category: 'medication',
        titleAr: 'إينوكسابارين 1 ملغ/كغ تحت الجلد كل 12 ساعة (Enoxaparin 1mg/kg SC Q12H)',
        titleEn: 'Enoxaparin Sodium Therapeutic Anticoagulation',
        priority: 'urgent',
        isPreselected: true,
        rationaleAr: 'مضاد تخثر أساسي وموصى به في حالات NSTEMI غير المعقدة بفشل كلوي.',
        orderPayload: {
          category: 'medication',
          priority: 'urgent',
          orderTitleAr: 'إينوكسابارين صوديوم حقن علاجي تحت الجلد',
          orderTitleEn: 'Enoxaparin SC Q12H'
        }
      },
      {
        id: 'acs-05',
        category: 'monitoring',
        titleAr: 'مراقبة التيليميتري ونبض القلب المستمر (Continuous Telemetry Monitoring)',
        titleEn: 'Continuous Telemetry Monitoring',
        priority: 'urgent',
        isPreselected: true,
        rationaleAr: 'الكشف الفوري عن خوارج الانقباض والتسارع البطيني والكتل القلبية.',
        orderPayload: {
          category: 'monitoring',
          priority: 'urgent',
          orderTitleAr: 'مراقبة تخطيط القلب المستمر عن بعد',
          orderTitleEn: 'Continuous Telemetry'
        }
      },
      {
        id: 'acs-06',
        category: 'imaging',
        titleAr: 'أشعة سينية للصدر بجانب السرير (Portable Chest X-Ray)',
        titleEn: 'Portable Chest X-Ray',
        priority: 'urgent',
        isPreselected: false,
        rationaleAr: 'استبعاد تسلخ الأبهر الصدري، الاسترواح الصدري، وتقييم احتقان الرئتين.',
        orderPayload: {
          category: 'imaging',
          priority: 'urgent',
          orderTitleAr: 'أشعة سينية متنقلة للصدر AP',
          orderTitleEn: 'Portable Chest X-Ray AP'
        }
      }
    ]
  },
  {
    id: 'bundle-sepsis-resuscitation',
    code: 'SEPSIS-BUNDLE-HOUR1',
    nameAr: 'حزمة التدخل السريع للإنتان والصدمة الإنتانية (Hour-1 Sepsis Resuscitation Bundle)',
    nameEn: 'Surviving Sepsis Campaign Hour-1 Bundle',
    version: '4.0 (2026 SSC International)',
    clinicalContextAr: 'يطبق فور الاشتباه بالإنتان الحاد أو ارتفاع سكور Early Warning Score مع بؤرة عدوى.',
    targetDepartment: ['emergency', 'inpatient_ward', 'inpatient_icu'],
    evidenceSource: 'Surviving Sepsis Campaign Guidelines',
    items: [
      {
        id: 'sep-01',
        category: 'laboratory',
        titleAr: 'مزارع دم مزدوجة هوائية ولاهوائية قبل المضاد (Blood Cultures x 2)',
        titleEn: 'Blood Cultures (2 Sets Prior to Antibiotics)',
        priority: 'stat',
        isPreselected: true,
        rationaleAr: 'تحديد الجرثوم المسبب قبل بدء العلاج التجريبي.',
        orderPayload: { category: 'laboratory', priority: 'stat', orderTitleAr: 'مزارع دم مزدوجة (موضعان منفصلان)', orderTitleEn: 'Blood Cultures x 2 Sets' }
      },
      {
        id: 'sep-02',
        category: 'laboratory',
        titleAr: 'فحص حمض اللاكتيك في الدم فوراً (Serum Lactate STAT)',
        titleEn: 'Serum Lactate STAT',
        priority: 'stat',
        isPreselected: true,
        rationaleAr: 'تقييم نقص التروية الخلوية (إذا كان اللاكتيك > 2 mmol/L يتم إعادة التقييم).',
        orderPayload: { category: 'laboratory', priority: 'stat', orderTitleAr: 'فحص حمض اللاكتيك في الدم', orderTitleEn: 'Serum Lactate STAT' }
      },
      {
        id: 'sep-03',
        category: 'medication',
        titleAr: 'مضاد حيوي واسع الطيف وريدي خلال 60 دقيقة (Broad-Spectrum IV Antibiotic)',
        titleEn: 'Empiric Broad-Spectrum IV Antibiotic within 1 Hour',
        priority: 'stat',
        isPreselected: true,
        rationaleAr: 'كل تأخير ساعة في إعطاء المضاد الحيوي يزيد من معدل الوفيات بنسبة 7%.',
        orderPayload: { category: 'medication', priority: 'stat', orderTitleAr: 'مضاد حيوي واسع الطيف وريدي', orderTitleEn: 'Broad-Spectrum IV Antibiotic' }
      },
      {
        id: 'sep-04',
        category: 'medication',
        titleAr: 'سوائل بلورية متوازنة وريدية 30 مل/كغ في حال هبوط الضغط (Balanced Crystalloid 30 mL/kg IV)',
        titleEn: 'IV Crystalloid Bolus 30 mL/kg for Hypotension or Lactate >= 4',
        priority: 'stat',
        isPreselected: false,
        rationaleAr: 'إنعاش حجم الدم الوريدي واستعادة التروية النسيجية.',
        orderPayload: { category: 'medication', priority: 'stat', orderTitleAr: 'محلول بلازما لايت / سالين وريدي سريع', orderTitleEn: 'Balanced Crystalloid Bolus' }
      }
    ]
  }
];
