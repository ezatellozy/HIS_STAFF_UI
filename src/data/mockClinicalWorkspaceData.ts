import {
  CareTransitionRequest,
  ClinicalTask,
  ClinicalFormDefinition,
  ActiveCareTeam,
  TriageAcuityAssessment,
  EarlyWarningDeteriorationScore,
  CriticalResultAlert,
  CoreVitalsRecord,
  HemodynamicsRecord,
  VentilatorObservationRecord,
  NeuroObservationRecord,
  FluidBalanceHourlySlot,
  ObservationValueState,
  ObservationTrend,
  ClinicalDiagnosisEntry,
  MedicationVerificationPolicy,
  AnthropometricRecord,
  ObservationAbsenceContext,
  CodeStatusProvenance
} from '../types/clinicalWorkspace';

export const INITIAL_CARE_TRANSITIONS: CareTransitionRequest[] = [
  {
    id: 'TRANS-2026-001',
    patientId: 'pat-1',
    patientName: 'محمد السيد عبد الرحمن',
    mrn: 'MRN-88421',
    fromLocation: 'ER - سرير 02 (طوارئ القلب الحاد)',
    toLocation: 'ICU - العناية المركزة للقلب CCU',
    reason: 'احتشاء عضلة القلب الحاد STEMI بعد قسطرة أولية ناجحة وحاجة لمراقبة ضغط دم شرياني مستمر',
    priority: 'stat',
    requestedBy: 'د. طارق المنشاوي (طوارئ/قلب)',
    requestedAt: '14:25',
    status: 'bed_assigned',
    receivingPhysician: 'د. خالد عبد العزيز (استشاري العناية الحثيثة)',
    assignedBedNumber: 'ICU-Bed-01',
    sbarHandoff: {
      situation: 'مريض 58 سنة قادم بـ STEMI سفلي مع انخفاض ضغط الدم',
      background: 'تاريخ مرضي لداء السكري وارتفاع ضغط دم مزمن وتدخين شره',
      assessment: 'تم فتح الشريان التاجي الأيمن بتركيب دعامة دوائية، يحتاج تسريب نورأدرينالين مستمر',
      recommendation: 'نقل سريع للعناية ومراقبة التخطيط المستمر وتحليل Troponin كل 6 ساعات'
    },
    transportStaff: 'فريق الإسعاف والنقل الداخلي - طوارئ',
    updatedAt: '14:38'
  },
  {
    id: 'TRANS-2026-002',
    patientId: 'pat-4',
    patientName: 'زياد محمود الخولي',
    mrn: 'MRN-91045',
    fromLocation: 'ER - سرير الإنعاش Resus 1',
    toLocation: 'OR - غرفة عمليات الطوارئ OR-3',
    reason: 'نزيف داخلي نشط في البطن مع استرواح صدري وتثبيت عاجل للحوض (Polytrauma)',
    priority: 'stat',
    requestedBy: 'د. وليد الصاوي (جراحة طوارئ)',
    requestedAt: '14:40',
    status: 'accepted',
    receivingPhysician: 'د. يوسف إبراهيم (استشاري جراحة الحوادث)',
    assignedBedNumber: 'OR-3 مسرح جراحة الحوادث',
    sbarHandoff: {
      situation: 'شاب 19 سنة، حادث دراجة نارية، صدمة نزفية غير مستقرة',
      background: 'بدون تاريخ مرضي معروف، فصيلة الدم O سالب تم بدء 2 وحدة دم عاجلة',
      assessment: 'نزيف بريتوني FAST إيجابي، كسر حوض مفتوح الدرجة الثانية',
      recommendation: 'استكشاف جراحي عاجل Laparotomy وتثبيت الحوض الخارجي'
    },
    updatedAt: '14:45'
  },
  {
    id: 'TRANS-2026-003',
    patientId: 'pat-2',
    patientName: 'فاطمة الزهراء علي',
    mrn: 'MRN-72319',
    fromLocation: 'جناح الباطنة 3A - غرفة 302-A',
    toLocation: 'خروج للمنزل (Discharge Home)',
    reason: 'تحسن الالتهاب الرئوي واستقرار نسبة الأكسجين وإنهاء كورس المضاد الحيوي الوريدي',
    priority: 'routine',
    requestedBy: 'د. سمر النجار (أخصائي أمراض باطنة)',
    requestedAt: '11:15',
    status: 'pending_review',
    receivingPhysician: 'د. أحمد شاكر (طبيب الاستشارة والعيادة الخارجية)',
    sbarHandoff: {
      situation: 'مريضة 64 سنة منومة لـ 4 أيام بسبب Community-Acquired Pneumonia',
      background: 'ربو شعبي وارتفاع ضغط دم',
      assessment: 'حرارة طبيعية 36.9، أكسجين 98% على هواء الغرفة، فحص الصدر صافٍ',
      recommendation: 'خروج مع تحويل المضاد إلى أقراص فموية لـ 5 أيام ومراجعة العيادة بعد أسبوع'
    },
    updatedAt: '12:00'
  }
];

export const INITIAL_CLINICAL_TASKS: ClinicalTask[] = [
  {
    id: 'TASK-001',
    patientId: 'pat-1',
    patientName: 'محمد السيد عبد الرحمن',
    mrn: 'MRN-88421',
    careArea: 'er',
    locationLabel: 'ER - سرير 02',
    title: 'اعتماد نتيجة تحاليل حرجة: إنزيمات القلب Troponin I (High Alert)',
    description: 'نتيجة Troponin I مرتفعة (3.85 ng/mL - القيمة الطبيعية < 0.04). تتطلب توقيع وقرار سريري فوري.',
    taskType: 'review_result',
    severity: 'critical',
    assignedRole: 'doctor',
    dueDate: 'فوري (STAT)',
    isOverdue: true,
    status: 'pending',
    actionTargetActivity: 'results'
  },
  {
    id: 'TASK-002',
    patientId: 'pat-4',
    patientName: 'زياد محمود الخولي',
    mrn: 'MRN-91045',
    careArea: 'er',
    locationLabel: 'ER - سرير الإنعاش 1',
    title: 'توقيع إقرار جراحي عاجل لاستكشاف البطن (Surgical Consent)',
    description: 'إقرار العمليات الجراحية والتخدير لحالة الطوارئ الحادة قبل دخول غرفة العمليات OR-3.',
    taskType: 'sign_note',
    severity: 'critical',
    assignedRole: 'doctor',
    dueDate: 'خلال 10 دقائق',
    isOverdue: false,
    status: 'pending',
    actionTargetActivity: 'notes'
  },
  {
    id: 'TASK-003',
    patientId: 'pat-3',
    patientName: 'إبراهيم خليل النجار',
    mrn: 'MRN-65490',
    careArea: 'icu',
    locationLabel: 'ICU - سرير 02',
    title: 'مراجعة جرعة مضخة النورأدرينالين (Vasopressor Titration)',
    description: 'ضغط الدم الشرياني MAP = 62 mmHg أقل من المستهدف (65 mmHg)، يلزم معايرة معدل التسريب.',
    taskType: 'pending_order',
    severity: 'high',
    assignedRole: 'doctor',
    dueDate: 'خلال 30 دقيقة',
    isOverdue: false,
    status: 'pending',
    actionTargetActivity: 'vitals'
  },
  {
    id: 'TASK-004',
    patientId: 'pat-2',
    patientName: 'فاطمة الزهراء علي',
    mrn: 'MRN-72319',
    careArea: 'ipd',
    locationLabel: 'جناح 3A - سرير 302-A',
    title: 'توقيع تقرير ملخص الخروج الطبي (Discharge Summary)',
    description: 'المريضة مهيأة للخروج الطبي، يتطلب استكمال وتوقيع تقرير الخروج وخطة الأدوية المنزلية.',
    taskType: 'sign_note',
    severity: 'moderate',
    assignedRole: 'doctor',
    dueDate: 'اليوم قبل 16:00',
    isOverdue: false,
    status: 'pending',
    actionTargetActivity: 'notes'
  },
  {
    id: 'TASK-005',
    patientId: 'pat-1',
    patientName: 'محمد السيد عبد الرحمن',
    mrn: 'MRN-88421',
    careArea: 'er',
    locationLabel: 'ER - سرير 02',
    title: 'إعطاء حقنة Clexane 60mg تحت الجلد ومراقبة النزف',
    description: 'جرعة مميع دم مجدولة مع تحقق التمريض المزدوج (Dual Nurse Check).',
    taskType: 'med_due',
    severity: 'high',
    assignedRole: 'nurse',
    dueDate: 'الآن (مستحقة)',
    isOverdue: false,
    status: 'pending',
    actionTargetActivity: 'medications'
  },
  {
    id: 'TASK-006',
    patientId: 'pat-6',
    patientName: 'عبد الله خالد المطيري',
    mrn: 'MRN-33819',
    careArea: 'opd',
    locationLabel: 'عيادة القلب 101',
    title: 'طلب استشارة سريرية واردة من قسم الباطنة',
    description: 'مريض يعاني من خفقان ونوبات هبوط ضغط، مطلوب فحص الإيكو وتخطيط هولتر 24 ساعة.',
    taskType: 'consultation',
    severity: 'moderate',
    assignedRole: 'doctor',
    dueDate: 'خلال اليوم',
    isOverdue: false,
    status: 'pending',
    actionTargetActivity: 'notes'
  }
];

export const CLINICAL_FORMS_CATALOG: ClinicalFormDefinition[] = [
  {
    id: 'form-icu-admission',
    titleAr: 'نموذج تقييم الدخول للعناية المركزة (ICU Admission Assessment)',
    titleEn: 'Comprehensive ICU Admission & Organ Dysfunction Evaluation',
    category: 'admission',
    specialty: 'العناية المركزة والرعاية الحثيثة',
    suggestedContexts: ['icu', 'er'],
    isCustom: false,
    descriptionAr: 'تقييم شامل للأجهزة الحيوية، حساب درجات APACHE II و SOFA، تقييم مجرى الهواء وخطوط القسطرة الشريانية والوريدية.',
    lastUpdated: '10 سبتمبر 2026'
  },
  {
    id: 'form-daily-progress',
    titleAr: 'ملاحظة المرور اليومي للطبيب المعالج (Daily Progress Rounding Note)',
    titleEn: 'Multi-System Inpatient Daily Progress Note',
    category: 'progress',
    specialty: 'الطب الباطني والجراحة العامة',
    suggestedContexts: ['ipd', 'icu'],
    isCustom: false,
    descriptionAr: 'هيكل متطور للمرور اليومي يغطي: الحالة الذاتية، فحص الأجهزة (CNS, CVS, Resp, GI, Renal, Heme)، وخطة الـ 24 ساعة القادمة.',
    lastUpdated: '10 سبتمبر 2026'
  },
  {
    id: 'form-morse-fall',
    titleAr: 'مقياس مورس لتقييم خطر سقوط المرضى (Morse Fall Scale)',
    titleEn: 'Morse Fall Risk Assessment & Prevention Protocol',
    category: 'risk_assessment',
    specialty: 'التمريض وسلامة المرضى (CBAHI / JCI)',
    suggestedContexts: ['ipd', 'er', 'icu'],
    isCustom: false,
    descriptionAr: 'فحص إلزامي لمعايير الاعتماد لتقييم تاريخ السقوط، التشخيص الثانوي، المساعدة في المشي، العلاج الوريدي، وطريقة المشي والوعي.',
    lastUpdated: '10 سبتمبر 2026'
  },
  {
    id: 'form-braden-ulcer',
    titleAr: 'مقياس برادن لخطر قرح الفراش (Braden Pressure Ulcer Scale)',
    titleEn: 'Braden Scale for Predicting Pressure Sore Risk',
    category: 'risk_assessment',
    specialty: 'العناية التمريضية الفائقة',
    suggestedContexts: ['icu', 'ipd'],
    isCustom: false,
    descriptionAr: 'تقييم الإدراك الحسي، الرطوبة، النشاط، الحركة، التغذية، وقوى الاحتكاك والقص لوضع بروتوكول التقليب الهوائي.',
    lastUpdated: '10 سبتمبر 2026'
  },
  {
    id: 'form-surgical-consent',
    titleAr: 'إقرار الموافقة على العمليات الجراحية والتخدير (Surgical & Anesthesia Consent)',
    titleEn: 'Informed Surgical, Anesthetic, and Blood Transfusion Consent',
    category: 'consent',
    specialty: 'غرف العمليات وجراحة اليوم الواحد',
    suggestedContexts: ['or', 'er', 'ipd'],
    isCustom: false,
    descriptionAr: 'توثيق موافقة المريض أو الولي المستنيرة، شرح المضاعفات المحتملة، ونوع التخدير، وبدائل نقل الدم وفق الأنظمة الصحية.',
    lastUpdated: '10 سبتمبر 2026'
  },
  {
    id: 'form-sbar-handoff',
    titleAr: 'نموذج تسليم الحالة السريرية بين الأقسام (SBAR Clinical Handoff Form)',
    titleEn: 'Standardized Inter-Departmental SBAR Communication Record',
    category: 'transition',
    specialty: 'التنقلات السريرية والانتقال بين الأقسام',
    suggestedContexts: ['er', 'icu', 'ipd', 'or'],
    isCustom: false,
    descriptionAr: 'توثيق انتقال المريض بين الأقسام (Situation, Background, Assessment, Recommendation) مع توقيع الطبيب والممرض المُسلّم والمُستلِم.',
    lastUpdated: '10 سبتمبر 2026'
  },
  {
    id: 'form-discharge-summary',
    titleAr: 'ملخص الخروج الطبي وتعليمات المتابعة (Comprehensive Discharge Summary)',
    titleEn: 'Inpatient Hospital Discharge Summary & Home Care Plan',
    category: 'transition',
    specialty: 'جميع الأقسام والتنويم',
    suggestedContexts: ['ipd', 'icu', 'er'],
    isCustom: false,
    descriptionAr: 'ملخص مسار التنويم، العمليات المجراة، نتائج التحاليل، قائمة الأدوية المستمرة والموقوفة، وموعد مراجعة العيادة الخارجية.',
    lastUpdated: '10 سبتمبر 2026'
  }
];

// -------------------------------------------------------------
// AXIS 1: MOCK ACTIVE CARE TEAMS
// -------------------------------------------------------------

export const MOCK_ACTIVE_CARE_TEAMS: Record<string, ActiveCareTeam> = {
  'pat-1': {
    shiftLabel: 'وردية الصباح (Day Shift 07:00 - 19:00)',
    lastUpdated: 'اليوم 08:00',
    members: [
      {
        id: 'tm-1',
        name: 'د. طارق المنشاوي',
        role: 'attending_physician',
        roleLabelAr: 'استشاري أمراض القلب والقسطرة التداخلية',
        roleLabelEn: 'Attending Interventional Cardiologist',
        department: 'قسم أمراض القلب وطوارئ الشرايين التاجية',
        contactExtension: '4421',
        isPrimaryContact: true
      },
      {
        id: 'tm-2',
        name: 'سارة مصطفى (RN, BSN)',
        role: 'primary_nurse',
        roleLabelAr: 'ممرض الرعاية الأولية المباشر',
        roleLabelEn: 'Primary Cardiac Critical Care RN',
        department: 'وحدة الرعاية القلبية الفائقة CCU',
        contactExtension: '4425'
      },
      {
        id: 'tm-3',
        name: 'د. ياسمين الشريف (PharmD)',
        role: 'clinical_pharmacist',
        roleLabelAr: 'صيدلي سريري (فريق دعم القرارات الدوائية)',
        roleLabelEn: 'Cardiovascular Clinical Pharmacist',
        department: 'الصيدلة السريرية'
      },
      {
        id: 'tm-4',
        name: 'د. ماجد السبيعي',
        role: 'consultant',
        roleLabelAr: 'استشاري استشاري العناية الحرجة (CCM)',
        roleLabelEn: 'Consulting Intensivist',
        department: 'العناية المركزة'
      }
    ]
  },
  'pat-2': {
    shiftLabel: 'وردية الصباح (Day Shift 07:00 - 19:00)',
    lastUpdated: 'اليوم 07:30',
    members: [
      {
        id: 'tm-5',
        name: 'د. سمر النجار',
        role: 'attending_physician',
        roleLabelAr: 'استشاري الأمراض الباطنية والجهاز التنفسي',
        roleLabelEn: 'Attending Pulmonologist / Internist',
        department: 'أجنحة التنويم الباطني 3A',
        contactExtension: '3201',
        isPrimaryContact: true
      },
      {
        id: 'tm-6',
        name: 'مروة الشربيني (RN)',
        role: 'primary_nurse',
        roleLabelAr: 'ممرض الجناح المسؤول',
        roleLabelEn: 'Primary Staff Nurse',
        department: 'جناح 3A',
        contactExtension: '3205'
      },
      {
        id: 'tm-7',
        name: 'هدى الزهراني',
        role: 'case_manager',
        roleLabelAr: 'منسق إدارة الحالة وجاهزية الخروج',
        roleLabelEn: 'Care Coordinator & Discharge Planner',
        department: 'مكتب تنسيق الرعاية'
      }
    ]
  },
  'pat-3': {
    shiftLabel: 'وردية المراقبة الحثيثة (ICU Continuous Shift)',
    lastUpdated: 'اليوم 08:30',
    members: [
      {
        id: 'tm-8',
        name: 'د. خالد عبد العزيز',
        role: 'attending_physician',
        roleLabelAr: 'استشاري أول العناية المركزة والرعاية الحثيثة',
        roleLabelEn: 'Attending Intensivist (CCM)',
        department: 'وحدة العناية المركزة ICU',
        contactExtension: '5501',
        isPrimaryContact: true
      },
      {
        id: 'tm-9',
        name: 'أحمد جلال (Critical Care RN)',
        role: 'primary_nurse',
        roleLabelAr: 'أخصائي تمريض العناية الحرجة (1:1 Ratio)',
        roleLabelEn: '1:1 Dedicated Critical Care RN',
        department: 'ICU Bedside Care',
        contactExtension: '5512'
      },
      {
        id: 'tm-10',
        name: 'فيصل العتيبي (RRT)',
        role: 'consultant',
        roleLabelAr: 'أخصائي علاج تنفسي ودعم ميكانيكي',
        roleLabelEn: 'Registered Respiratory Therapist',
        department: 'قسم الرعاية التنفسية'
      }
    ]
  },
  'pat-4': {
    shiftLabel: 'فريق جراحة الحوادث والإنعاش الفوري (Trauma Code Team)',
    lastUpdated: 'الآن (مباشر)',
    members: [
      {
        id: 'tm-11',
        name: 'د. وليد الصاوي',
        role: 'surgeon',
        roleLabelAr: 'استشاري جراحة الحوادث والإنعاش التداخلي',
        roleLabelEn: 'Lead Trauma Surgeon',
        department: 'جراحة الحوادث والطوارئ OR-3',
        contactExtension: '9110',
        isPrimaryContact: true
      },
      {
        id: 'tm-12',
        name: 'د. رامي القاضي',
        role: 'anesthesiologist',
        roleLabelAr: 'استشاري التخدير وعلاج الألم الحاد',
        roleLabelEn: 'Staff Anesthesiologist',
        department: 'مسرح العمليات الجراحية'
      },
      {
        id: 'tm-13',
        name: 'نوف القحطاني (Trauma RN)',
        role: 'primary_nurse',
        roleLabelAr: 'ممرض إنعاش الحوادث الرئيسي',
        roleLabelEn: 'Trauma Resuscitation Nurse',
        department: 'ER Resus Bay 1'
      }
    ]
  }
};

// -------------------------------------------------------------
// AXIS 1: MOCK TRIAGE ACUITY ASSESSMENTS (CONFIGURABLE PROFILE)
// -------------------------------------------------------------

export const MOCK_TRIAGE_ASSESSMENTS: Record<string, TriageAcuityAssessment> = {
  'pat-1': {
    acuityLevel: 2,
    acuityLabelAr: 'المستوى 2: طارئ حاد مهدد للأعضاء (Emergent / High Risk)',
    acuityLabelEn: 'Level 2 - Emergent (High Risk Chest Pain)',
    triageProfile: 'Standard 5-Tier Acuity Profile (Adaptable to CTAS / ESI / MTS / ATS / Local)',
    colorCode: 'red',
    chiefComplaint: 'ألم صدري ضاغط حاد مشع للذراع الأيسر وضيق تنفس وصدمة مبكرة',
    onset: 'منذ ساعتين قبل الوصول',
    arrivalTime: '13:45',
    timeToDoctorMinutes: 4,
    triageNurse: 'عفاف المهدي (Triage Certified RN)',
    dispositionStatus: 'admit_icu'
  },
  'pat-4': {
    acuityLevel: 1,
    acuityLabelAr: 'المستوى 1: إنعاش فوري مهدد للحياة (Immediate Resuscitation)',
    acuityLabelEn: 'Level 1 - Immediate Resuscitation / Unstable Trauma',
    triageProfile: 'Standard 5-Tier Acuity Profile (Adaptable to CTAS / ESI / MTS / ATS / Local)',
    colorCode: 'red',
    chiefComplaint: 'حادث دراجة نارية عالي السرعة، نزيف بريتوني نشط وصدمة نزفية غير مستقرة',
    onset: 'وصول مباشر بالإسعاف 14:10',
    arrivalTime: '14:10',
    timeToDoctorMinutes: 0,
    triageNurse: 'سلطان الدوسري (Senior Triage Officer)',
    dispositionStatus: 'transfer_or'
  },
  'pat-6': {
    acuityLevel: 4,
    acuityLabelAr: 'المستوى 4: أقل إلحاحاً - حالة مستقرة (Less Urgent / Stable)',
    acuityLabelEn: 'Level 4 - Less Urgent / Clinic Walk-in',
    triageProfile: 'Standard 5-Tier Acuity Profile (Adaptable to CTAS / ESI / MTS / ATS / Local)',
    colorCode: 'green',
    chiefComplaint: 'خفقان دوري خفيف ومتابعة قياس ضغط الدم الشرياني',
    onset: 'متقطع منذ 3 أسابيع',
    arrivalTime: '09:15',
    timeToDoctorMinutes: 20,
    triageNurse: 'حنان عبد الله (OPD Screening RN)',
    dispositionStatus: 'observe'
  }
};

// -------------------------------------------------------------
// AXIS 1: MOCK DETERIORATION / EARLY WARNING SCORES
// (Generic Early Warning Architecture - Profile: NEWS2 in mock)
// -------------------------------------------------------------

export const MOCK_DETERIORATION_SCORES: Record<string, EarlyWarningDeteriorationScore> = {
  'pat-1': {
    scoreSystemName: 'نظام الإنذار المبكر والتدهور السريري (Early Warning / Deterioration Score)',
    activeProfile: 'الملف المعتمد: NEWS2 Profile (قابل للتهيئة: MEWS / PEWS / Local Score)',
    scoreValue: 5,
    maxScore: 20,
    riskCategory: 'medium',
    riskLabelAr: 'درجة خطورة متوسطة (Medium Risk) - استجابة سريرية عاجلة',
    riskLabelEn: 'Medium Deterioration Risk (Urgent Clinical Response)',
    actionRecommendationAr: 'يتطلب إبلاغ الطبيب المقيم وأخصائي القلب فوراً، وإعادة القياس كل ساعة ومراقبة الشاشات الحيوية المستمرة.',
    lastCalculatedAt: 'منذ 18 دقيقة',
    calculatedBy: 'محرك القياسات الآلي (Automated Clinical Rules Engine)',
    calculationMethod: 'Auto-Derived from Clinical Observations'
  },
  'pat-3': {
    scoreSystemName: 'نظام الإنذار المبكر والتدهور السريري (Early Warning / Deterioration Score)',
    activeProfile: 'الملف المعتمد: Critical Care SOFA Profile (Dynamic ICU Score)',
    scoreValue: 8,
    maxScore: 24,
    riskCategory: 'high',
    riskLabelAr: 'درجة خطورة مرتفعة (High Risk) - خلل متعدد في وظائف الأعضاء',
    riskLabelEn: 'High Risk (Multi-Organ Dysfunction)',
    actionRecommendationAr: 'متابعة معايرة رافعات الضغط الوريدية للحفاظ على MAP ≥ 65 mmHg، وفحص غازات الدم الشرياني كل 4 ساعات.',
    lastCalculatedAt: 'منذ 10 دقائق',
    calculatedBy: 'نظام مراقبة السرير الذكي ICU Bedside Sync',
    calculationMethod: 'Auto-Derived from Clinical Observations'
  },
  'pat-2': {
    scoreSystemName: 'نظام الإنذار المبكر والتدهور السريري (Early Warning / Deterioration Score)',
    activeProfile: 'الملف المعتمد: General Ward MEWS Profile',
    scoreValue: 1,
    maxScore: 20,
    riskCategory: 'low',
    riskLabelAr: 'درجة خطورة منخفضة (Low Risk) - استقرار سريري ملحوظ',
    riskLabelEn: 'Low Deterioration Risk (Stable)',
    actionRecommendationAr: 'استمرار الملاحظة الروتينية للعلامات كل 6-8 ساعات، المريضة في طريقها للاستعداد للخروج الطبي.',
    lastCalculatedAt: 'اليوم 08:00',
    calculatedBy: 'مروة الشربيني (RN)',
    calculationMethod: 'Clinician Bedside Assessment'
  }
};

// -------------------------------------------------------------
// AXIS 1: CLINICAL TERMINOLOGY & CLASSIFICATION PROFILES
// (Configured Terminology e.g. SNOMED CT + Configured Classification e.g. ICD-10 / ICD-11 Ready)
// -------------------------------------------------------------

export const MOCK_PATIENT_DIAGNOSES: ClinicalDiagnosisEntry[] = [
  {
    id: 'dx-01',
    conditionName: 'Acute Inferior ST-Elevation Myocardial Infarction (STEMI)',
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT)',
      code: '401303003',
      display: 'Acute inferior myocardial infarction (disorder)'
    },
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10 Profile / ICD-11 Ready)',
      code: 'I21.1',
      category: 'ST elevation (STEMI) myocardial infarction of inferior wall'
    },
    diagnosisType: 'encounter_principal',
    verificationStatus: 'confirmed',
    notes: 'تم التدخل بالقسطرة الأولية وتركيب دعامة دوائية Onyx للشريان التاجي الأيمن RCA بنجاح TIMI-3.'
  },
  {
    id: 'dx-02',
    conditionName: 'Type 2 Diabetes Mellitus with Microvascular Complications',
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT)',
      code: '44054006',
      display: 'Type 2 diabetes mellitus'
    },
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10 Profile / ICD-11 Ready)',
      code: 'E11.9',
      category: 'Type 2 diabetes mellitus without complications'
    },
    diagnosisType: 'longitudinal_chronic',
    verificationStatus: 'confirmed',
    notes: 'متابع بانتظام في عيادة السكري والغدد الصماء، تحت بروتوكول الأنسولين القاعدي المتزامن.'
  },
  {
    id: 'dx-03',
    conditionName: 'Essential (Primary) Systemic Hypertension',
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT)',
      code: '59621000',
      display: 'Essential hypertension'
    },
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10 Profile / ICD-11 Ready)',
      code: 'I10',
      category: 'Essential (primary) hypertension'
    },
    diagnosisType: 'longitudinal_chronic',
    verificationStatus: 'confirmed',
    notes: 'تحت السيطرة العلاجية مع مثبطات مستقبلات الأنجيوتنسين.'
  }
];

// -------------------------------------------------------------
// AXIS 1: MEDICATION VERIFICATION POLICIES
// (Configurable by Medication Safety Policy, not hardcoded global rule)
// -------------------------------------------------------------

export const MOCK_MEDICATION_VERIFICATION_POLICIES: Record<string, MedicationVerificationPolicy> = {
  'norepinephrine': {
    policyType: 'dual_independent_verification',
    policyLabelAr: 'فحص سريري مزدوج مستقل (Dual Independent Verification)',
    policyLabelEn: 'Dual Independent Nurse Check Required',
    requiresDualSignOff: true,
    requiresWitnessForWaste: false,
    governingPolicy: 'Hospital Medication Verification Policy (#POL-MED-04: High-Alert Vasoactive Infusions)'
  },
  'morphine': {
    policyType: 'co_sign_required',
    policyLabelAr: 'توقيع مشترك عند تعديل الجرعة أو الإعطاء (Co-sign Required)',
    policyLabelEn: 'Co-Sign Required on Dose Titration / Administration',
    requiresDualSignOff: true,
    requiresWitnessForWaste: true,
    governingPolicy: 'Controlled Substances & Opioid Administration Policy (#POL-MED-07)'
  },
  'enoxaparin': {
    policyType: 'single_clinician_verification',
    policyLabelAr: 'تحقق سريري معتمد أحادي (Single Clinician Verification with Barcode Scan)',
    policyLabelEn: 'Single Clinician BCMA Verification',
    requiresDualSignOff: false,
    requiresWitnessForWaste: false,
    governingPolicy: 'Anticoagulation Standard Safety Verification Policy (#POL-MED-12)'
  },
  'paracetamol': {
    policyType: 'no_additional_verification',
    policyLabelAr: 'لا يتطلب تحققاً إضافياً (No Additional Verification Required)',
    policyLabelEn: 'Standard Bedside Administration - No Additional Verification',
    requiresDualSignOff: false,
    requiresWitnessForWaste: false,
    governingPolicy: 'General Non-High-Alert Formulary Policy (#POL-MED-01)'
  },
  'ticagrelor': {
    policyType: 'single_clinician_verification',
    policyLabelAr: 'تحقق سريري معتمد أحادي بجانب السرير (Single Verification)',
    policyLabelEn: 'Single Clinician Verification with Barcode Scan',
    requiresDualSignOff: false,
    requiresWitnessForWaste: false,
    governingPolicy: 'Oral Antiplatelet Medication Safety Policy (#POL-MED-02)'
  }
};

// -------------------------------------------------------------
// AXIS 1: MOCK CRITICAL RESULTS & COMMUNICATION WORKFLOWS
// (Flexible Critical Result Communication / Acknowledgement)
// -------------------------------------------------------------

export const MOCK_CRITICAL_RESULTS: CriticalResultAlert[] = [
  {
    id: 'CRIT-2026-001',
    testName: 'Cardiac Troponin I (High Sensitivity)',
    testTechnicalCode: 'LOINC: 89579-7',
    category: 'lab',
    value: '3.85',
    unit: 'ng/mL',
    referenceRange: '< 0.04 ng/mL',
    state: 'awaiting_acknowledgement',
    escalationSlaPolicy: {
      targetMinutes: 30, // Mock Configured Policy Example
      policyLabel: 'سياسة إبلاغ وتوثيق النتائج الحرجة لإنزيمات القلب (Critical Cardiac Biomarker SLA - مثال سياسة معدة)',
      isMockConfiguredExample: true
    },
    communicationPolicy: {
      policyName: 'سياسة المختبر للقيم الحرجة (تتطلب توثيق الإبلاغ والتأكيد الشفهي/الإلكتروني)',
      qualifyingCriteria: 'تروبونين عالي الحساسية > 0.04 ng/mL مع اشتباه متلازمة شريان تاجي حادة',
      responsibleSenderRole: 'فني مختبر الطوارئ المناوب',
      responsibleRecipientRole: 'طبيب العناية القلبية المناوب (CCU Fellow / Attending)',
      reportingTargetMinutes: 30,
      reportingTargetLabel: 'مثال سياسة سريرية معدّة: 30 دقيقة (Mock Configured Policy Example)',
      escalationTargetMinutes: 45,
      escalationTargetRole: 'استشاري أمراض القلب المناوب On-Call (جهة تصعيد معدة - ليست بالضرورة رئيس القسم)',
      allowedMethods: ['telephone', 'secure_messaging', 'in_person', 'ehr_critical_alert'],
      requiresAcknowledgement: true,
      requiresReadBack: true,
      escalationBehavior: 'في حال تعذر الوصول للطبيب المسؤول خلال 15 دقيقة بعد المهلة، يتم إشعار طبيب القلب المناوب On-Call عبر النداء الآلي المشفر'
    },
    reportedAt: '14:15',
    reportedBy: 'أ. د. سمير شرف',
    reporterRole: 'Lab Technologist - Emergency Hematology',
    primaryResponsibleRecipient: 'د. طارق المنشاوي (CCU Attending)',
    alternateResponsibleRecipient: 'استشاري أمراض القلب المناوب (On-Call Cardiology Consultant)',
    alternateCommunicationMethod: 'secure_messaging',
    escalationState: 'normal'
  },
  {
    id: 'CRIT-2026-002',
    testName: 'Potassium Serum (K+ Panic Value)',
    testTechnicalCode: 'LOINC: 2823-3',
    category: 'lab',
    value: '6.4',
    unit: 'mmol/L',
    referenceRange: '3.5 - 5.1 mmol/L',
    state: 'read_back_documented',
    escalationSlaPolicy: {
      targetMinutes: 15, // Different configured target (Scenario B vs Scenario A)
      policyLabel: 'سياسة المختبر للكهارل الحرجة الشديدة (Critical Electrolyte SLA - مثال سياسة معدة 15 دقيقة)',
      isMockConfiguredExample: true
    },
    communicationPolicy: {
      policyName: 'سياسة المختبر للقيم شديدة الخطورة (Verbal/Electronic Read-Back Mandatory)',
      qualifyingCriteria: 'بوتاسيوم مصل > 6.0 mmol/L مهدد لاضطراب نظم القلب القاتل',
      responsibleSenderRole: 'أخصائي الكيمياء الحيوية المناوب',
      responsibleRecipientRole: 'طبيب العناية المركزة / ممرض الحالة المسؤول',
      reportingTargetMinutes: 15,
      reportingTargetLabel: 'مثال سياسة سريرية معدّة: 15 دقيقة (Mock Configured Policy Example)',
      escalationTargetMinutes: 25,
      escalationTargetRole: 'أخصائي أمراض الكلى المناوب On-Call',
      allowedMethods: ['telephone', 'in_person', 'secure_messaging'],
      requiresAcknowledgement: true,
      requiresReadBack: true,
      escalationBehavior: 'تصعيد مباشر للفريق السريري البديل حال عدم الرد خلال 10 دقائق من الإبلاغ الأولي'
    },
    reportedAt: '13:00',
    reportedBy: 'رامي كمال',
    reporterRole: 'Central Biochemistry Specialist',
    acknowledgedBy: 'د. طارق المنشاوي (MD - Consultant)',
    acknowledgedAt: '13:12',
    communicationMethod: 'telephone',
    recipientName: 'سارة مصطفى',
    recipientRole: 'RN - Critical Care Specialist',
    readBackConfirmed: true,
    communicationTimestamp: '13:14',
    communicationNotes: 'تمت قراءة النتيجة وتأكيدها بدقة. تم إعطاء Calcium Gluconate ومحلول جلوكوز وأنسولين لتعديل البوتاسيوم.',
    primaryResponsibleRecipient: 'سارة مصطفى (RN - Critical Care Specialist)',
    alternateResponsibleRecipient: 'أخصائي أمراض الكلى المناوب On-Call (Nephrology Specialist)',
    alternateCommunicationMethod: 'telephone',
    escalationState: 'normal'
  },
  {
    id: 'CRIT-2026-003',
    testName: 'CT Angiography Chest (Pulmonary Embolism Protocol)',
    testTechnicalCode: 'LOINC: 24725-4',
    category: 'radiology',
    value: 'Positive for Segmental Pulmonary Embolism in Right Lower Lobe',
    unit: 'Qualitative',
    referenceRange: 'Negative / No filling defect',
    state: 'communication_documented',
    escalationSlaPolicy: {
      targetMinutes: 45,
      policyLabel: 'سياسة تبليغ الطوارئ للأشعة المقطعية الحرجة (Critical Radiology Finding Policy - مثال سياسة معدة 45 دقيقة)',
      isMockConfiguredExample: true
    },
    communicationPolicy: {
      policyName: 'سياسة تبليغ نتائج الأشعة الحرجة (Communication Documented Required, Read-Back Optional)',
      qualifyingCriteria: 'انصمام رئوي شرياني حاد مشخص بالأشعة المقطعية',
      responsibleSenderRole: 'استشاري الأشعة المناوب',
      responsibleRecipientRole: 'الطبيب المعالج أو طبيب الرئة المناوب',
      reportingTargetMinutes: 45,
      reportingTargetLabel: 'مثال سياسة سريرية معدّة: 45 دقيقة (Mock Configured Policy Example)',
      escalationTargetMinutes: 60,
      escalationTargetRole: 'أخصائي الأمراض الصدرية المناوب On-Call (Pulmonology On-Call)',
      allowedMethods: ['secure_messaging', 'ehr_critical_alert', 'in_person', 'telephone'],
      requiresAcknowledgement: true,
      requiresReadBack: false, // Configured policy: Read-back NOT mandatory for radiology text report
      escalationBehavior: 'إشعار الطبيب البديل عبر التراسل المشفر وإرسال تنبيه عاجل للملف الإلكتروني'
    },
    reportedAt: '12:30',
    reportedBy: 'د. نادية فوزي',
    reporterRole: 'Consultant Radiologist',
    acknowledgedBy: 'د. طارق المنشاوي',
    acknowledgedAt: '12:44',
    communicationMethod: 'secure_messaging',
    recipientName: 'د. طارق المنشاوي',
    recipientRole: 'Attending Physician',
    readBackConfirmed: false,
    communicationTimestamp: '12:45',
    communicationNotes: 'تم استلام التقرير عبر التراسل السريري المشفر، وبدء مضادات التخثر العلاجية فوراً.',
    primaryResponsibleRecipient: 'د. طارق المنشاوي (Attending Physician)',
    alternateResponsibleRecipient: 'أخصائي الأمراض الصدرية المناوب (Pulmonology On-Call)',
    alternateCommunicationMethod: 'secure_messaging',
    escalationState: 'normal'
  }
];

// -------------------------------------------------------------
// CODE STATUS / RESUSCITATION STATUS PROVENANCE (Item 5: Source-Neutral Provenance)
// -------------------------------------------------------------
export const MOCK_CODE_STATUS_PROVENANCE: Record<string, CodeStatusProvenance> = {
  'pat-1': {
    patientId: 'pat-1',
    resuscitationStatus: 'Full Code (إنعاش قلبي رئوي كامل)',
    resuscitationCodeKey: 'FULL_CODE',
    sourceType: 'clinical_physician_order',
    sourceTypeLabelAr: 'أمر طبي سريري سارٍ (Clinical / Physician Order)',
    sourceTypeLabelEn: 'Clinical Physician Order',
    sourceReferenceId: 'ORD-RESUS-2026-004',
    orderingOrDocumentingClinician: 'د. طارق المنشاوي (MD - Consultant)',
    clinicianRole: 'Attending Cardiologist',
    documentedAt: 'اليوم، 08:30',
    clinicalDiscussionNotes: 'تمت مناقشة خطة الإنعاش مع المريض وأسرته، وتأكيد الرغبة في الإنعاش القلبي الرئوي الكامل واستخدام مزيل الرجفان والتهوية الميكانيكية عند اللزوم.',
    reviewDate: 'خلال 48 ساعة أو عند تغير الحالة السريرية',
    governingPolicyLabel: 'السياسة المؤسسية لتوثيق رغبات الإنعاش (Resuscitation / Goals of Care Policy)',
    isMockOperationalProvenance: true
  },
  'pat-2': {
    patientId: 'pat-2',
    resuscitationStatus: 'DNR (عدم الإنعاش القلبي الرئوي)',
    resuscitationCodeKey: 'DNR',
    sourceType: 'advance_directive_living_will',
    sourceTypeLabelAr: 'وثيقة توجيه مسبق / وصية معيشية (Advance Directive / Living Will)',
    sourceTypeLabelEn: 'Advance Directive / Living Will',
    sourceReferenceId: 'ADV-DIR-2025-882',
    orderingOrDocumentingClinician: 'د. مريم الصاوي',
    clinicianRole: 'Palliative Care Consultant',
    documentedAt: '12-01-2026',
    clinicalDiscussionNotes: 'وثيقة معتمدة وموقعة وفق السياسات والأطر القانونية بطلب المريضة والوكيل القانوني، تشمل الرعاية التلطيفية وعدم الإنعاش القلبي الرئوي الصدري.',
    governingPolicyLabel: 'سياسة التوجيهات الطبية المسبقة والرعاية التلطيفية',
    isMockOperationalProvenance: true
  },
  'pat-3': {
    patientId: 'pat-3',
    resuscitationStatus: 'Full Code (السياسة المؤسسية الافتراضية)',
    resuscitationCodeKey: 'FULL_CODE',
    sourceType: 'institutional_default_policy',
    sourceTypeLabelAr: 'السياسة المؤسسية الافتراضية لسلامة المرضى (Institutional Default / Policy)',
    sourceTypeLabelEn: 'Institutional Default Policy',
    clinicalDiscussionNotes: 'لم يتم تسجيل قرار سريري مخصص أو وثيقة مسبقة؛ يطبق معيار الإنعاش الكامل الافتراضي حمايةً لسلامة المريض حتى مراجعة الفريق المعالج.',
    governingPolicyLabel: 'السياسة الافتراضية لسلامة المرضى في غياب وثيقة صريحة',
    isMockOperationalProvenance: true
  }
};

// -------------------------------------------------------------
// AXIS 2: ANTHROPOMETRICS (Height, Weight, BMI, BSA)
// (Displayed with distinct, context-appropriate cadences)
// -------------------------------------------------------------

export const MOCK_ANTHROPOMETRICS: Record<string, AnthropometricRecord> = {
  'pat-1': {
    heightCm: 174,
    weightKg: 82,
    bmi: 27.1,
    bsaM2: 1.98,
    measuredAt: 'اليوم 08:15 (عند التنويم)',
    measuredBy: 'د. طارق المنشاوي',
    measuredByRole: 'Attending Physician',
    provenanceSource: 'Measured at Encounter Baseline'
  },
  'pat-2': {
    heightCm: 162,
    weightKg: 68,
    bmi: 25.9,
    bsaM2: 1.73,
    measuredAt: 'أمس 10:00 (عند القبول)',
    measuredBy: 'مروة الشربيني',
    measuredByRole: 'RN',
    provenanceSource: 'Bedside Electronic Scale'
  },
  'pat-3': {
    heightCm: 180,
    weightKg: 95,
    bmi: 29.3,
    bsaM2: 2.15,
    measuredAt: 'اليوم 06:30 (وزن السرير ICU)',
    measuredBy: 'أحمد جلال',
    measuredByRole: 'Staff Nurse',
    provenanceSource: 'Bedside Electronic Scale'
  }
};

// -------------------------------------------------------------
// AXIS 2: MOCK TIME SLOTS & DETAILED OBSERVATION FLOWSHEET
// -------------------------------------------------------------

export const MOCK_FLOWSHEET_TIME_SLOTS = [
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  'الآن (مباشر 16:30)'
];

export interface DetailedObservationRow {
  group: 'core' | 'anthropometrics' | 'hemodynamics' | 'ventilation' | 'neuro' | 'scores' | 'fluids';
  groupLabelAr: string;
  groupLabelEn: string;
  parameterName: string;
  unit: string;
  normalRange: string;
  technicalMetadata?: {
    loincCode?: string;
    ucumUnit?: string;
    calculationFormula?: string;
  };
  values: {
    slotIndex: number;
    value: number | string;
    state: ObservationValueState;
    trend?: ObservationTrend;
    recordedAt: string;
    recordedBy: string;
    recordedByRole: string;
    measuredBy?: string;
    measuredByRole?: string;
    verifiedBy?: string;
    verifiedByRole?: string;
    method?: string;
    derivationType?: 'measured' | 'calculated_derived' | 'device_synced';
    provenanceDetails?: string;
    amendedReason?: string;
    priorValue?: number | string;
    // Missing-data semantics (Section 3: Missing != 0, Missing != Normal)
    absenceContext?: ObservationAbsenceContext;
  }[];
}

export const MOCK_DETAILED_OBSERVATION_ROWS: DetailedObservationRow[] = [
  // A. CORE VITALS
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'ضغط الدم الانقباضي (Systolic BP)',
    unit: 'mmHg',
    normalRange: '90 - 130 mmHg',
    technicalMetadata: {
      loincCode: '8480-6',
      ucumUnit: 'mm[Hg]'
    },
    values: [
      { slotIndex: 0, value: 145, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'NIBP Right Arm', derivationType: 'measured' },
      { slotIndex: 1, value: 140, state: 'abnormal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'NIBP Right Arm', derivationType: 'measured' },
      { slotIndex: 2, value: 135, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'د. وليد الصاوي', recordedByRole: 'MD - Fellow', method: 'Arterial Line', derivationType: 'measured' },
      { slotIndex: 3, value: 125, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Arterial Line', derivationType: 'measured' },
      { slotIndex: 4, value: 122, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Arterial Line', derivationType: 'measured' },
      { slotIndex: 5, value: 120, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'جهاز المراقبة التلقائي', recordedByRole: 'Telemetry Sync', method: 'Radial Arterial Line', derivationType: 'device_synced' }
    ]
  },
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'ضغط الدم الانبساطي (Diastolic BP)',
    unit: 'mmHg',
    normalRange: '60 - 85 mmHg',
    technicalMetadata: {
      loincCode: '8462-4',
      ucumUnit: 'mm[Hg]'
    },
    values: [
      { slotIndex: 0, value: 92, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'NIBP', derivationType: 'measured' },
      { slotIndex: 1, value: 88, state: 'normal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'NIBP', derivationType: 'measured' },
      { slotIndex: 2, value: 85, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'د. وليد الصاوي', recordedByRole: 'MD - Fellow', method: 'Arterial Line', derivationType: 'measured' },
      { slotIndex: 3, value: 82, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Arterial Line', derivationType: 'measured' },
      { slotIndex: 4, value: 80, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Arterial Line', derivationType: 'measured' },
      { slotIndex: 5, value: 78, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'جهاز المراقبة التلقائي', recordedByRole: 'Telemetry Sync', method: 'Arterial Line', derivationType: 'device_synced' }
    ]
  },
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'معدل نبضات القلب (Heart Rate)',
    unit: 'bpm',
    normalRange: '60 - 100 bpm',
    technicalMetadata: {
      loincCode: '8867-4',
      ucumUnit: '/min'
    },
    values: [
      { slotIndex: 0, value: 106, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'ECG Monitor', derivationType: 'measured' },
      { slotIndex: 1, value: 98, state: 'normal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'ECG Monitor', derivationType: 'measured' },
      { slotIndex: 2, value: 92, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'ECG Monitor', derivationType: 'measured' },
      { slotIndex: 3, value: 82, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'ECG Monitor', derivationType: 'measured' },
      { slotIndex: 4, value: 78, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'ECG Monitor', derivationType: 'measured' },
      { slotIndex: 5, value: 76, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'جهاز المراقبة التلقائي', recordedByRole: 'Telemetry Sync', method: 'Lead II Continuous', derivationType: 'device_synced' }
    ]
  },
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'تشبع الأكسجين الشرياني (SpO2)',
    unit: '%',
    normalRange: '95 - 100 %',
    technicalMetadata: {
      loincCode: '59408-5',
      ucumUnit: '%'
    },
    values: [
      { slotIndex: 0, value: 93, state: 'abnormal', trend: 'down', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Pulse Oximeter - Room Air', derivationType: 'measured' },
      { slotIndex: 1, value: 95, state: 'normal', trend: 'up', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Pulse Oximeter', derivationType: 'measured' },
      { slotIndex: 2, value: 96, state: 'normal', trend: 'up', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Pulse Oximeter', derivationType: 'measured' },
      { slotIndex: 3, value: 98, state: 'normal', trend: 'up', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Pulse Oximeter', derivationType: 'measured' },
      { slotIndex: 4, value: 98, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Pulse Oximeter', derivationType: 'measured' },
      { slotIndex: 5, value: 99, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'جهاز المراقبة التلقائي', recordedByRole: 'Telemetry Sync', method: 'Pulse Oximeter Continuous', derivationType: 'device_synced' }
    ]
  },
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'درجة حرارة الجسم (Body Temperature)',
    unit: '°C',
    normalRange: '36.5 - 37.5 °C',
    technicalMetadata: {
      loincCode: '8310-5',
      ucumUnit: 'Cel'
    },
    values: [
      { slotIndex: 0, value: 37.8, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Tympanic', derivationType: 'measured' },
      { slotIndex: 1, value: 37.4, state: 'normal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Tympanic', derivationType: 'measured' },
      { slotIndex: 2, value: 37.1, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Tympanic', derivationType: 'measured' },
      { slotIndex: 3, value: 36.9, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Tympanic', derivationType: 'measured' },
      { slotIndex: 4, value: 36.8, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Tympanic', derivationType: 'measured' },
      { slotIndex: 5, value: 36.8, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Axillary Probe', derivationType: 'measured' }
    ]
  },
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'معدل التنفس (Respiratory Rate)',
    unit: 'breaths/min',
    normalRange: '12 - 20 breaths/min',
    technicalMetadata: {
      loincCode: '9279-1',
      ucumUnit: '/min'
    },
    values: [
      { slotIndex: 0, value: 24, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Manual 60s Count', derivationType: 'measured' },
      { slotIndex: 1, value: 22, state: 'abnormal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Manual 60s Count', derivationType: 'measured' },
      { slotIndex: 2, value: 20, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Manual Count', derivationType: 'measured' },
      { slotIndex: 3, value: 18, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Manual Count', derivationType: 'measured' },
      { slotIndex: 4, value: 16, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Monitor Impedance', derivationType: 'measured' },
      { slotIndex: 5, value: 16, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'جهاز المراقبة التلقائي', recordedByRole: 'Telemetry Sync', method: 'Capnography & Impedance', derivationType: 'device_synced' }
    ]
  },
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'شدة الألم (Pain Scale)',
    unit: '/10',
    normalRange: '0 - 3 (Mild)',
    technicalMetadata: {
      loincCode: '72514-3'
    },
    values: [
      { slotIndex: 0, value: 7, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'NRS 0-10 Scale', derivationType: 'measured' },
      { slotIndex: 1, value: 5, state: 'abnormal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'NRS 0-10 Scale', derivationType: 'measured' },
      { slotIndex: 2, value: 4, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'NRS 0-10 Scale', derivationType: 'measured' },
      { slotIndex: 3, value: 2, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'NRS 0-10 Scale', derivationType: 'measured' },
      {
        slotIndex: 4,
        value: '—',
        state: 'normal',
        trend: 'stable',
        recordedAt: '16:00',
        recordedBy: 'سارة مصطفى',
        recordedByRole: 'RN',
        method: 'غير مسجل لعدم تواجد المريض',
        derivationType: 'measured',
        absenceContext: {
          isAbsent: true,
          reasonCode: 'patient_unavailable',
          reasonLabelAr: 'المريض غير متاح مؤقتاً (فحص الأشعة المقطعية)',
          reasonLabelEn: 'Patient Temporarily Unavailable (CT Angiography Procedure)',
          documentationNote: 'تم نقل المريض لوحدة الأشعة التداخلية، لم يتمكن التمريض من إجراء التقييم في هذا التوقيت. القيمة غير متوفرة وليست صفراً.'
        }
      },
      { slotIndex: 5, value: 1, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'NRS 0-10 Scale', derivationType: 'measured' }
    ]
  },
  {
    group: 'core',
    groupLabelAr: 'العلامات الحيوية الأساسية (Core Vitals)',
    groupLabelEn: 'Core Vitals',
    parameterName: 'سكر الدم السريري السريع (Bedside Glucose POC)',
    unit: 'mg/dL',
    normalRange: '70 - 140 mg/dL',
    technicalMetadata: {
      loincCode: '2339-0',
      ucumUnit: 'mg/dL'
    },
    values: [
      { slotIndex: 0, value: 178, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Fingerstick POC (Fasting)', derivationType: 'measured' },
      { slotIndex: 1, value: 165, state: 'abnormal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Fingerstick POC', derivationType: 'measured' },
      { slotIndex: 2, value: 142, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Fingerstick POC (Pre-meal)', derivationType: 'measured' },
      { slotIndex: 3, value: 138, state: 'normal', trend: 'stable', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Fingerstick POC', derivationType: 'measured' },
      { slotIndex: 4, value: 130, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Fingerstick POC', derivationType: 'measured' },
      { slotIndex: 5, value: 128, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Accu-Chek POC', derivationType: 'measured' }
    ]
  },

  // B. ANTHROPOMETRICS (Height, Weight, BMI)
  {
    group: 'anthropometrics',
    groupLabelAr: 'القياسات الجسمانية (Anthropometrics)',
    groupLabelEn: 'Anthropometrics',
    parameterName: 'الوزن (Body Weight)',
    unit: 'kg',
    normalRange: 'Patient Specific',
    technicalMetadata: {
      loincCode: '29463-7',
      ucumUnit: 'kg'
    },
    values: [
      { slotIndex: 0, value: 82.0, state: 'normal', recordedAt: '08:15', recordedBy: 'د. طارق المنشاوي', recordedByRole: 'Attending Physician', method: 'Bedside Electronic Scale', derivationType: 'measured', provenanceDetails: 'تم قياسه عند تنويم المريض' },
      { slotIndex: 1, value: 82.0, state: 'normal', recordedAt: '10:00', recordedBy: 'د. طارق المنشاوي', recordedByRole: 'Attending Physician', method: 'Previous Recorded Weight', derivationType: 'measured' },
      { slotIndex: 2, value: 82.0, state: 'normal', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Previous Recorded Weight', derivationType: 'measured' },
      { slotIndex: 3, value: 82.0, state: 'normal', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Previous Recorded Weight', derivationType: 'measured' },
      { slotIndex: 4, value: 82.0, state: 'normal', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Previous Recorded Weight', derivationType: 'measured' },
      { slotIndex: 5, value: 82.0, state: 'normal', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Bedside Scale Calibration', derivationType: 'measured' }
    ]
  },
  {
    group: 'anthropometrics',
    groupLabelAr: 'القياسات الجسمانية (Anthropometrics)',
    groupLabelEn: 'Anthropometrics',
    parameterName: 'مؤشر كتلة الجسم (Body Mass Index - BMI)',
    unit: 'kg/m²',
    normalRange: '18.5 - 24.9 kg/m²',
    technicalMetadata: {
      loincCode: '39156-5',
      ucumUnit: 'kg/m2',
      calculationFormula: 'Weight (kg) / [Height (m)]²'
    },
    values: [
      { slotIndex: 0, value: 27.1, state: 'abnormal', recordedAt: '08:15', recordedBy: 'د. طارق المنشاوي', recordedByRole: 'Attending Physician', method: 'Auto-Derived: Wt/(Ht)^2', derivationType: 'calculated_derived', provenanceDetails: 'مشتق حسابياً من الطول 174 سم والوزن 82 كجم (Overweight Range)' },
      { slotIndex: 1, value: 27.1, state: 'abnormal', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Derived', derivationType: 'calculated_derived' },
      { slotIndex: 2, value: 27.1, state: 'abnormal', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Derived', derivationType: 'calculated_derived' },
      { slotIndex: 3, value: 27.1, state: 'abnormal', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Derived', derivationType: 'calculated_derived' },
      { slotIndex: 4, value: 27.1, state: 'abnormal', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Derived', derivationType: 'calculated_derived' },
      { slotIndex: 5, value: 27.1, state: 'abnormal', recordedAt: '16:30', recordedBy: 'نظام السجل الطبي', recordedByRole: 'System Calc', method: 'Calculated from Baseline', derivationType: 'calculated_derived' }
    ]
  },

  // C. HEMODYNAMICS (ICU & Critical Care)
  {
    group: 'hemodynamics',
    groupLabelAr: 'المؤشرات الديناميكية الدموية (Hemodynamics)',
    groupLabelEn: 'Hemodynamics',
    parameterName: 'متوسط الضغط الشرياني (Mean Arterial Pressure - MAP)',
    unit: 'mmHg',
    normalRange: '≥ 65 mmHg',
    technicalMetadata: {
      loincCode: '8478-0',
      ucumUnit: 'mm[Hg]',
      calculationFormula: 'MAP = Diastolic + 1/3 (Systolic - Diastolic) [عند استخدام NIBP]'
    },
    values: [
      { slotIndex: 0, value: 109, state: 'normal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Calculated / Derived from NIBP', derivationType: 'calculated_derived', provenanceDetails: 'مشتق حسابياً: 1/3 (145 - 92) + 92 = 109 mmHg' },
      { slotIndex: 1, value: 105, state: 'normal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Calculated / Derived from NIBP', derivationType: 'calculated_derived', provenanceDetails: 'مشتق حسابياً من NIBP' },
      { slotIndex: 2, value: 101, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'د. وليد الصاوي', recordedByRole: 'MD - Fellow', method: 'Arterial Line Transducer', derivationType: 'measured', provenanceDetails: 'قياس مباشر عبر محول القسطرة الشريانية Direct Measured' },
      { slotIndex: 3, value: 96, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Arterial Line Transducer', derivationType: 'measured', provenanceDetails: 'قياس شرياني مباشر Direct Art-Line' },
      { slotIndex: 4, value: 94, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Arterial Line Transducer', derivationType: 'measured', provenanceDetails: 'قياس شرياني مباشر Direct Art-Line' },
      { slotIndex: 5, value: 92, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'جهاز المراقبة التلقائي', recordedByRole: 'Telemetry Sync', method: 'Continuous Art-Line Transducer', derivationType: 'device_synced', provenanceDetails: 'مزامنة حية من الشاشة الشريانية' }
    ]
  },
  {
    group: 'hemodynamics',
    groupLabelAr: 'المؤشرات الديناميكية الدموية (Hemodynamics)',
    groupLabelEn: 'Hemodynamics',
    parameterName: 'الضغط الوريدي المركزي (Central Venous Pressure - CVP)',
    unit: 'cmH2O',
    normalRange: '4 - 10 cmH2O',
    technicalMetadata: {
      loincCode: '8464-0',
      ucumUnit: 'cm[H2O]'
    },
    values: [
      { slotIndex: 0, value: 14, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Internal Jugular Line', derivationType: 'measured' },
      { slotIndex: 1, value: 12, state: 'normal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'CVC Transducer', derivationType: 'measured' },
      { slotIndex: 2, value: 10, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'د. وليد الصاوي', recordedByRole: 'MD - Fellow', method: 'CVC Transducer', derivationType: 'measured' },
      { slotIndex: 3, value: 9, state: 'normal', trend: 'stable', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'CVC Transducer', derivationType: 'measured' },
      { slotIndex: 4, value: 8, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'CVC Transducer', derivationType: 'measured' },
      { slotIndex: 5, value: 8, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'جهاز المراقبة التلقائي', recordedByRole: 'Telemetry Sync', method: 'CVC Continuous', derivationType: 'device_synced' }
    ]
  },
  {
    group: 'hemodynamics',
    groupLabelAr: 'المؤشرات الديناميكية الدموية (Hemodynamics)',
    groupLabelEn: 'Hemodynamics',
    parameterName: 'حمض اللاكتيك في الدم (Serum Blood Lactate)',
    unit: 'mmol/L',
    normalRange: '0.5 - 2.0 mmol/L',
    technicalMetadata: {
      loincCode: '2524-7',
      ucumUnit: 'mmol/L'
    },
    values: [
      { slotIndex: 0, value: 3.4, state: 'abnormal', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Arterial Blood Gas POC', derivationType: 'measured' },
      { slotIndex: 1, value: 2.8, state: 'abnormal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'ABG POC', derivationType: 'measured' },
      { slotIndex: 2, value: 2.1, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'ABG POC', derivationType: 'measured' },
      { slotIndex: 3, value: 1.8, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'ABG POC', derivationType: 'measured' },
      { slotIndex: 4, value: 1.5, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'ABG POC', derivationType: 'measured' },
      { slotIndex: 5, value: 1.4, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'مختبر الغازات الشريانية', recordedByRole: 'Lab Sync', method: 'Central Lab Blood Gas', derivationType: 'device_synced' }
    ]
  },

  // D. RESPIRATORY & OXYGEN SUPPORT (Moved Oxygen Delivery here!)
  {
    group: 'ventilation',
    groupLabelAr: 'الجهاز التنفسي والدعم بالأكسجين (Respiratory & Oxygen Support)',
    groupLabelEn: 'Respiratory & Oxygen Support',
    parameterName: 'طريقة إمداد الأكسجين (Oxygen Delivery Method & Flow)',
    unit: 'device / L/min',
    normalRange: 'Patient Specific',
    technicalMetadata: {
      loincCode: '59407-7'
    },
    values: [
      { slotIndex: 0, value: 'Room Air (هواء الغرفة)', state: 'normal', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Bedside Observation', derivationType: 'measured' },
      { slotIndex: 1, value: 'Nasal Cannula 2 L/min', state: 'normal', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Wall Oxygen Flowmeter', derivationType: 'measured' },
      { slotIndex: 2, value: 'Nasal Cannula 2 L/min', state: 'normal', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Wall Oxygen Flowmeter', derivationType: 'measured' },
      { slotIndex: 3, value: 'Nasal Cannula 2 L/min', state: 'normal', recordedAt: '14:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT - Resp Therapist', method: 'Oxygen Titration Protocol', derivationType: 'measured' },
      { slotIndex: 4, value: 'Nasal Cannula 2 L/min', state: 'normal', recordedAt: '16:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Flowmeter Check', derivationType: 'measured' },
      { slotIndex: 5, value: 'Nasal Cannula 2 L/min', state: 'normal', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Bedside Delivery Check', derivationType: 'measured' }
    ]
  },
  {
    group: 'ventilation',
    groupLabelAr: 'الجهاز التنفسي والدعم بالأكسجين (Respiratory & Oxygen Support)',
    groupLabelEn: 'Respiratory & Oxygen Support',
    parameterName: 'نسبة الأكسجين المستنشق (FiO2 Fraction)',
    unit: '%',
    normalRange: '21 - 40 % (Target ≤ 40%)',
    technicalMetadata: {
      loincCode: '19996-8',
      ucumUnit: '%'
    },
    values: [
      { slotIndex: 0, value: 21, state: 'normal', trend: 'stable', recordedAt: '08:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Room Air FiO2', derivationType: 'measured' },
      { slotIndex: 1, value: 28, state: 'normal', trend: 'up', recordedAt: '10:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Estimated from 2L NC', derivationType: 'calculated_derived' },
      { slotIndex: 2, value: 28, state: 'normal', trend: 'stable', recordedAt: '12:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Estimated from 2L NC', derivationType: 'calculated_derived' },
      { slotIndex: 3, value: 28, state: 'normal', trend: 'stable', recordedAt: '14:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Estimated from 2L NC', derivationType: 'calculated_derived' },
      { slotIndex: 4, value: 28, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Estimated from 2L NC', derivationType: 'calculated_derived' },
      { slotIndex: 5, value: 28, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Estimated from 2L NC', derivationType: 'calculated_derived' }
    ]
  },
  {
    group: 'ventilation',
    groupLabelAr: 'الجهاز التنفسي والدعم بالأكسجين (Respiratory & Oxygen Support)',
    groupLabelEn: 'Respiratory & Oxygen Support',
    parameterName: 'نمط التنفس الميكانيكي (Ventilator Mode)',
    unit: 'mode',
    normalRange: 'Patient Specific',
    values: [
      { slotIndex: 0, value: 'Spontaneous Breathing', state: 'normal', recordedAt: '08:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Clinical Assessment', derivationType: 'measured' },
      { slotIndex: 1, value: 'Spontaneous (NC)', state: 'normal', recordedAt: '10:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Clinical Assessment', derivationType: 'measured' },
      { slotIndex: 2, value: 'Spontaneous (NC)', state: 'normal', recordedAt: '12:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Clinical Assessment', derivationType: 'measured' },
      { slotIndex: 3, value: 'Spontaneous (NC)', state: 'normal', recordedAt: '14:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Clinical Assessment', derivationType: 'measured' },
      { slotIndex: 4, value: 'Spontaneous (NC)', state: 'normal', recordedAt: '16:00', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Clinical Assessment', derivationType: 'measured' },
      { slotIndex: 5, value: 'Spontaneous (NC)', state: 'normal', recordedAt: '16:30', recordedBy: 'فيصل العتيبي', recordedByRole: 'RRT', method: 'Clinical Assessment', derivationType: 'measured' }
    ]
  },

  // E. NEUROLOGICAL OBSERVATIONS
  {
    group: 'neuro',
    groupLabelAr: 'الملاحظات العصبية والوعي (Neurological & GCS)',
    groupLabelEn: 'Neurological',
    parameterName: 'مقياس غلاسكو للوعي الكلي (Glasgow Coma Scale - GCS)',
    unit: '/15',
    normalRange: '15 / 15',
    technicalMetadata: {
      loincCode: '9269-2'
    },
    values: [
      { slotIndex: 0, value: '14 (E4 V4 M6)', state: 'normal', trend: 'stable', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Standard Assessment', derivationType: 'measured' },
      { slotIndex: 1, value: '14 (E4 V4 M6)', state: 'normal', trend: 'stable', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Standard Assessment', derivationType: 'measured' },
      { slotIndex: 2, value: '15 (E4 V5 M6)', state: 'normal', trend: 'up', recordedAt: '12:00', recordedBy: 'د. وليد الصاوي', recordedByRole: 'MD - Fellow', method: 'Neurological Examination', derivationType: 'measured' },
      { slotIndex: 3, value: '15 (E4 V5 M6)', state: 'normal', trend: 'stable', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Standard Assessment', derivationType: 'measured' },
      { slotIndex: 4, value: '15 (E4 V5 M6)', state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Standard Assessment', derivationType: 'measured' },
      { slotIndex: 5, value: '15 (E4 V5 M6)', state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Bedside Neuro Check', derivationType: 'measured' }
    ]
  },
  {
    group: 'neuro',
    groupLabelAr: 'الملاحظات العصبية والوعي (Neurological & GCS)',
    groupLabelEn: 'Neurological',
    parameterName: 'حجم الحدقتين والتفاعل للضوء (Pupil Size & Reactivity)',
    unit: 'mm / reaction',
    normalRange: '2 - 4 mm Brisk',
    values: [
      { slotIndex: 0, value: 'R 3mm Brisk / L 3mm Brisk', state: 'normal', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Penlight Test', derivationType: 'measured' },
      { slotIndex: 1, value: 'R 3mm Brisk / L 3mm Brisk', state: 'normal', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Penlight Test', derivationType: 'measured' },
      { slotIndex: 2, value: 'R 3mm Brisk / L 3mm Brisk', state: 'normal', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Penlight Test', derivationType: 'measured' },
      { slotIndex: 3, value: 'R 3mm Brisk / L 3mm Brisk', state: 'normal', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Penlight Test', derivationType: 'measured' },
      { slotIndex: 4, value: 'R 3mm Brisk / L 3mm Brisk', state: 'normal', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Penlight Test', derivationType: 'measured' },
      { slotIndex: 5, value: 'R 3mm Brisk / L 3mm Brisk', state: 'normal', recordedAt: '16:30', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Penlight Pupillometer', derivationType: 'measured' }
    ]
  },

  // F. SCORES & DETERIORATION ASSESSMENTS
  // (Generic Early Warning Architecture - Configured Profile: NEWS2)
  {
    group: 'scores',
    groupLabelAr: 'درجات الإنذار المبكر والتدهور (Early Warning Scores)',
    groupLabelEn: 'Early Warning Scores',
    parameterName: 'درجة الإنذار المبكر والتدهور السريري (Early Warning Score - NEWS2 Profile)',
    unit: 'score /20',
    normalRange: '0 - 2 (Low Risk)',
    technicalMetadata: {
      loincCode: '96514-5'
    },
    values: [
      { slotIndex: 0, value: 6, state: 'critical', trend: 'up', recordedAt: '08:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Auto-Derived from Vitals', derivationType: 'calculated_derived', provenanceDetails: 'حساب آلي عبر محرك القواعد السريرية' },
      { slotIndex: 1, value: 4, state: 'abnormal', trend: 'down', recordedAt: '10:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Auto-Derived from Vitals', derivationType: 'calculated_derived' },
      { slotIndex: 2, value: 3, state: 'normal', trend: 'down', recordedAt: '12:00', recordedBy: 'أحمد جلال', recordedByRole: 'RN', method: 'Auto-Derived from Vitals', derivationType: 'calculated_derived' },
      { slotIndex: 3, value: 2, state: 'normal', trend: 'down', recordedAt: '14:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Auto-Derived from Vitals', derivationType: 'calculated_derived' },
      { slotIndex: 4, value: 1, state: 'normal', trend: 'stable', recordedAt: '16:00', recordedBy: 'سارة مصطفى', recordedByRole: 'RN', method: 'Auto-Derived from Vitals', derivationType: 'calculated_derived' },
      { slotIndex: 5, value: 1, state: 'normal', trend: 'stable', recordedAt: '16:30', recordedBy: 'نظام الرصد الذكي', recordedByRole: 'Clinical Rules Engine', method: 'Continuous Dynamic Score Calculation', derivationType: 'calculated_derived' }
    ]
  }
];

// -------------------------------------------------------------
// AXIS 2: MOCK HOURLY FLUID BALANCE & INTAKE/OUTPUT
// -------------------------------------------------------------

export const MOCK_FLUID_BALANCE_SLOTS: FluidBalanceHourlySlot[] = [
  {
    slotTime: '08:00',
    intakes: [
      { type: 'محاليل وريدية IV 0.9% Normal Saline', volumeMl: 500 },
      { type: 'أدوية ومضادات حيوية وريدية', volumeMl: 50 }
    ],
    outputs: [
      { type: 'إدرار البول (Urinary Catheter)', volumeMl: 120 },
      { type: 'إفرازات المعدة (NG Suction)', volumeMl: 50 }
    ],
    totalIntakeMl: 550,
    totalOutputMl: 170,
    slotNetBalanceMl: 380,
    running24hBalanceMl: 380,
    urineMlPerKgPerHour: 1.5
  },
  {
    slotTime: '10:00',
    intakes: [
      { type: 'تسريب وريدي IV Ringer Lactate', volumeMl: 250 },
      { type: 'تسريب تسكين الألم وريدي (PCA)', volumeMl: 20 }
    ],
    outputs: [
      { type: 'إدرار البول (Urinary Catheter)', volumeMl: 150 },
      { type: 'درنقة جراحية (Surgical Drain #1)', volumeMl: 20 }
    ],
    totalIntakeMl: 270,
    totalOutputMl: 170,
    slotNetBalanceMl: 100,
    running24hBalanceMl: 480,
    urineMlPerKgPerHour: 1.8
  },
  {
    slotTime: '12:00',
    intakes: [
      { type: 'تسريب وريدي مستمر IV Normal Saline', volumeMl: 250 },
      { type: 'تغذية أنبوبية معوية (Enteral Feeding)', volumeMl: 50 }
    ],
    outputs: [
      { type: 'إدرار البول (Urinary Catheter)', volumeMl: 180 },
      { type: 'درنقة جراحية (Surgical Drain #1)', volumeMl: 15 }
    ],
    totalIntakeMl: 300,
    totalOutputMl: 195,
    slotNetBalanceMl: 105,
    running24hBalanceMl: 585,
    urineMlPerKgPerHour: 2.2
  },
  {
    slotTime: '14:00',
    intakes: [
      { type: 'تسريب وريدي صيانة IV Maintenance', volumeMl: 150 },
      { type: 'تغذية أنبوبية معوية (Enteral Feeding)', volumeMl: 100 }
    ],
    outputs: [
      { type: 'إدرار البول (Urinary Catheter)', volumeMl: 160 },
      { type: 'درنقة جراحية (Surgical Drain #1)', volumeMl: 10 }
    ],
    totalIntakeMl: 250,
    totalOutputMl: 170,
    slotNetBalanceMl: 80,
    running24hBalanceMl: 665,
    urineMlPerKgPerHour: 2.0
  },
  {
    slotTime: '16:00',
    intakes: [
      { type: 'تسريب وريدي صيانة IV Maintenance', volumeMl: 100 },
      { type: 'تغذية فموية وسوائل رشف (Sips of Water)', volumeMl: 150 }
    ],
    outputs: [
      { type: 'إدرار البول (Urinary Catheter)', volumeMl: 140 },
      { type: 'درنقة جراحية (Surgical Drain #1)', volumeMl: 5 }
    ],
    totalIntakeMl: 250,
    totalOutputMl: 145,
    slotNetBalanceMl: 105,
    running24hBalanceMl: 770,
    urineMlPerKgPerHour: 1.7
  },
  {
    slotTime: '16:30 (الآن)',
    intakes: [
      { type: 'تسريب وريدي صيانة IV Maintenance', volumeMl: 50 },
      { type: 'سوائل فموية', volumeMl: 100 }
    ],
    outputs: [
      { type: 'إدرار البول (Urinary Catheter)', volumeMl: 70 }
    ],
    totalIntakeMl: 150,
    totalOutputMl: 70,
    slotNetBalanceMl: 80,
    running24hBalanceMl: 850,
    urineMlPerKgPerHour: 1.7
  }
];

