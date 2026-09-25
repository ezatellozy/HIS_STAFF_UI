// ============================================================================
// BLOOD BANK & TRANSFUSION MEDICINE OPERATIONS UX - MOCK DATA
// Exercises Scenarios A through H with strict adherence to the conceptual model
// ============================================================================

import {
  BloodProductRequest,
  PreTransfusionSample,
  BloodGroupTestResult,
  AntibodyScreenResult,
  CompatibilityRecord,
  BloodProductUnit,
  ProductAllocationRecord,
  ProductIssueRecord,
  ProductReturnRecord,
  TransfusionReactionCase,
  ProductTraceabilityEvent,
  BloodBankMetrics,
  MassiveTransfusionProtocolSession,
  BloodBankDemoScenario,
  BloodBankOperationalMetrics,
  BloodBankBranch,
  ProductReturnPolicy,
  UnitDestructionRecord,
  LookbackInvestigationRecord,
  RetrospectiveTestingRecord,
  MtpProtocolProfile
} from '../types/bloodBankOps';

// ----------------------------------------------------------------------------
// 1. MOCK BLOOD PRODUCT REQUESTS (Exercises Scenarios A through H)
// ----------------------------------------------------------------------------
export const INITIAL_BLOOD_REQUESTS: BloodProductRequest[] = [
  // Scenario A: Routine RBC (Inpatient Ward - Elective/Medical anemia)
  {
    id: 'BPR-2026-801',
    axis6OrderId: 'ORD-BB-801',
    patientId: 'p1',
    patientName: 'سارة خالد المنصوري',
    patientNameEn: 'Sara Khaled Al-Mansoor',
    mrn: 'MRN-88421',
    encounterId: 'ENC-2026-104',
    encounterType: 'inpatient',
    locationWardBed: 'جناح الباطنة 4A - سرير 12',
    patientAge: 42,
    patientGender: 'female',
    patientWeightKg: 64,
    patientPrimaryDiagnosis: 'فقر دم حاد متفاقم (Symptomatic Anemia) مع هبوط الهيموجلوبين',
    patientHistoricalBloodGroup: {
      abo: 'A',
      rh: 'positive',
      displayAr: 'A موجب (+)',
      displayEn: 'A Positive (A+)'
    },
    transfusionHistorySummary: 'نقل دم سابق قبل سنتين (2024) - دون أي مضاعفات مسجلة',
    requestedComponent: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (PRBCs)',
    componentNameEn: 'Packed Red Blood Cells',
    requestedQuantity: 2,
    quantityUnit: 'أكياس (Units)',
    clinicalIndication: 'هبوط حاد في نسبة الهيموجلوبين إلى 6.8 g/dL مع دوخة وخفقان مستمر',
    hemoglobinBaseline: '6.8 g/dL',
    priority: 'routine',
    requiredByTime: 'خلال 4 ساعات',
    specialRequirements: ['leukocyte_reduced'],
    requestingClinician: 'د. طارق العريان',
    requestingRole: 'أخصائي أول أمراض صدرية وباطنة',
    requestingDepartment: 'قسم الباطنة العامة',
    requestedAt: 'منذ ساعتين',
    linkedSampleId: 'SMP-BT-9041',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'compatible',
    allocatedUnitIds: ['DIN-W2026-0941-RBC', 'DIN-W2026-0942-RBC'],
    issuedUnitIds: ['DIN-W2026-0941-RBC'],
    requestStatus: 'partially_issued'
  },

  // Scenario B: Positive Antibody Screen (Oncology patient with Anti-Kell)
  {
    id: 'BPR-2026-802',
    axis6OrderId: 'ORD-BB-802',
    patientId: 'p2',
    patientName: 'عبد الله بن فيصل الزهراني',
    patientNameEn: 'Abdullah Faisal Al-Zahrani',
    mrn: 'MRN-88422',
    encounterId: 'ENC-2026-105',
    encounterType: 'inpatient',
    locationWardBed: 'جناح الأورام وأمراض الدم 3B - سرير 04',
    patientAge: 68,
    patientGender: 'male',
    patientWeightKg: 78,
    patientPrimaryDiagnosis: 'خلل التنسج النقوي (MDS) - نقل دم متكرر',
    patientHistoricalBloodGroup: {
      abo: 'O',
      rh: 'positive',
      displayAr: 'O موجب (+)',
      displayEn: 'O Positive (O+)'
    },
    patientKnownAntibodies: ['Anti-Kell (K)'],
    transfusionHistorySummary: 'نقل دم متعدد متكرر (أكثر من 8 مرات)؛ تكونت أجسام مضادة غير متوقعة',
    requestedComponent: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (PRBCs)',
    componentNameEn: 'Packed Red Blood Cells',
    requestedQuantity: 2,
    quantityUnit: 'أكياس (Units)',
    clinicalIndication: 'فقر دم مزمن شديد (Hb 7.1 g/dL) مع أعراض إجهاد ونقص تروية',
    hemoglobinBaseline: '7.1 g/dL',
    priority: 'urgent',
    requiredByTime: 'خلال ساعتين ونصف',
    specialRequirements: ['leukocyte_reduced', 'antigen_negative', 'phenotype_matched'],
    specialInstructions: 'مطلوب وحدات دم سالبة لمستضد Kell (K-negative) مع مطابقة توافق AHG',
    requestingClinician: 'د. منيرة القحطاني',
    requestingRole: 'استشارية أمراض دم وأورام',
    requestingDepartment: 'مركز الأورام وأمراض الدم',
    requestedAt: 'منذ 3 ساعات',
    linkedSampleId: 'SMP-BT-9042',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'compatible',
    allocatedUnitIds: ['DIN-W2026-0943-RBC', 'DIN-W2026-0944-RBC'],
    issuedUnitIds: [],
    requestStatus: 'fully_allocated'
  },

  // Scenario C: Emergency Uncrossmatched Release (Trauma ER Shock Room)
  {
    id: 'BPR-2026-803',
    axis6OrderId: 'ORD-BB-803',
    patientId: 'p3',
    patientName: 'مجهول الهوية #12 (مصاب حادث سيارة)',
    patientNameEn: 'Trauma Unknown #12 (MVA)',
    mrn: 'MRN-99103',
    encounterId: 'ENC-2026-909',
    encounterType: 'emergency',
    locationWardBed: 'طوارئ الحوادث ER - غرفة الإنعاش Resus-1',
    patientAge: 28,
    patientGender: 'male',
    patientWeightKg: 75,
    patientPrimaryDiagnosis: 'صدمة نزفية حادة ونزيف داخلي متعدد جراء حادث مروري مروع',
    transfusionHistorySummary: 'مريض طارئ مجهول الهوية - لا يوجد سجل سابق لنقل الدم',
    requestedComponent: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء (O-Negative Emergency)',
    componentNameEn: 'PRBCs O-Negative Universal',
    requestedQuantity: 2,
    quantityUnit: 'أكياس (Units)',
    clinicalIndication: 'نزيف حاد نشط مع ضغط 70/40 ومعدل نبض 140 bpm - صدمة نزفية مرحلة 4',
    hemoglobinBaseline: '5.2 g/dL',
    priority: 'stat_emergency',
    requiredByTime: 'فوري جداً (خلال 10 دقائق)',
    specialRequirements: ['leukocyte_reduced'],
    specialInstructions: 'صرف طارئ غير متوافق (Emergency Uncrossmatched O-Neg) بأمر استشاري الطوارئ',
    requestingClinician: 'د. فيصل الشمري',
    requestingRole: 'استشاري طب الطوارئ والحوادث',
    requestingDepartment: 'قسم الطوارئ والحوادث',
    requestedAt: 'منذ 15 دقيقة',
    linkedSampleId: 'SMP-BT-9043',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'emergency_released',
    allocatedUnitIds: ['DIN-W2026-0945-RBC', 'DIN-W2026-0946-RBC'],
    issuedUnitIds: ['DIN-W2026-0945-RBC', 'DIN-W2026-0946-RBC'],
    requestStatus: 'completed',
    isEmergencyReleaseRequested: true,
    emergencyAuthorizationReason: 'نزيف مهدد للحياة في غرفة الإنعاش - استدعاء وحدات O-Salb قبل اكتمال التطابق'
  },

  // Scenario D: Platelet Request (Hematology / Thrombocytopenia)
  {
    id: 'BPR-2026-804',
    axis6OrderId: 'ORD-BB-804',
    patientId: 'p4',
    patientName: 'فاطمة أحمد السالم',
    patientNameEn: 'Fatima Ahmad Al-Salem',
    mrn: 'MRN-88424',
    encounterId: 'ENC-2026-107',
    encounterType: 'inpatient',
    locationWardBed: 'جناح الباطنة 4B - سرير 08',
    patientAge: 55,
    patientGender: 'female',
    patientWeightKg: 60,
    patientPrimaryDiagnosis: 'نقص صفائح مناعي شديد (ITP) ونزيف مخاطي نشط',
    patientHistoricalBloodGroup: {
      abo: 'B',
      rh: 'positive',
      displayAr: 'B موجب (+)',
      displayEn: 'B Positive (B+)'
    },
    transfusionHistorySummary: 'نقل صفائح دم سابقة قبل أسبوعين',
    requestedComponent: 'platelets_apheresis',
    componentNameAr: 'صفائح دموية بالفصادة (Single Donor Apheresis Platelets)',
    componentNameEn: 'Platelets Apheresis',
    requestedQuantity: 1,
    quantityUnit: 'وحدة فصادة (Apheresis Unit)',
    clinicalIndication: 'نزيف لثوي ورعاف مع هبوط الصفائح إلى 12,000 /uL',
    plateletBaseline: '12,000 /uL',
    priority: 'urgent',
    requiredByTime: 'خلال ساعة ونصف',
    specialRequirements: ['leukocyte_reduced', 'irradiated'],
    requestingClinician: 'د. عادل العمري',
    requestingRole: 'أخصائي أمراض دم',
    requestingDepartment: 'قسم أمراض الدم',
    requestedAt: 'منذ 45 دقيقة',
    linkedSampleId: 'SMP-BT-9044',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'compatible',
    allocatedUnitIds: ['DIN-W2026-0951-PLT'],
    issuedUnitIds: [],
    requestStatus: 'fully_allocated'
  },

  // Scenario E: Returned Unit Pending Disposition (OR Delayed Surgery)
  {
    id: 'BPR-2026-805',
    axis6OrderId: 'ORD-BB-805',
    patientId: 'p5',
    patientName: 'ماجد عبد العزيز الخالدي',
    patientNameEn: 'Majid Abdulaziz Al-Khalidi',
    mrn: 'MRN-88425',
    encounterId: 'ENC-2026-108',
    encounterType: 'or',
    locationWardBed: 'العمليات الكبرى OR - غرفة العمليات 3',
    patientAge: 51,
    patientGender: 'male',
    patientWeightKg: 82,
    patientPrimaryDiagnosis: 'جراحة استئصال ورم قولوني (Elective Colectomy)',
    patientHistoricalBloodGroup: {
      abo: 'AB',
      rh: 'positive',
      displayAr: 'AB موجب (+)',
      displayEn: 'AB Positive (AB+)'
    },
    transfusionHistorySummary: 'لا يوجد نقل دم سابق',
    requestedComponent: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (PRBCs)',
    componentNameEn: 'Packed Red Blood Cells',
    requestedQuantity: 2,
    quantityUnit: 'أكياس (Units)',
    clinicalIndication: 'تأمين دم احتياطي قبل الشروع في جراحة استئصال ورم القولون',
    priority: 'elective_surgery',
    requiredByTime: 'جاهز بالعمليات',
    specialRequirements: ['leukocyte_reduced'],
    requestingClinician: 'د. ريم البسام',
    requestingRole: 'استشارية تخدير وجراحة',
    requestingDepartment: 'قسم التخدير والعمليات',
    requestedAt: 'منذ 4 ساعات',
    linkedSampleId: 'SMP-BT-9045',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'compatible',
    allocatedUnitIds: ['DIN-W2026-0947-RBC', 'DIN-W2026-0948-RBC'],
    issuedUnitIds: ['DIN-W2026-0947-RBC'],
    requestStatus: 'partially_issued'
  },

  // Scenario F: Transfusion Reaction Investigation (ICU Active Patient)
  {
    id: 'BPR-2026-806',
    axis6OrderId: 'ORD-BB-806',
    patientId: 'p6',
    patientName: 'نورة سليمان الدوسري',
    patientNameEn: 'Noura Sulaiman Al-Dossari',
    mrn: 'MRN-88426',
    encounterId: 'ENC-2026-109',
    encounterType: 'icu',
    locationWardBed: 'العناية المركزة الجراحية SICU - سرير 02',
    patientAge: 38,
    patientGender: 'female',
    patientWeightKg: 58,
    patientPrimaryDiagnosis: 'إنتان جراحي بعد استئصال الطحال ونقص كريات الدم',
    patientHistoricalBloodGroup: {
      abo: 'B',
      rh: 'positive',
      displayAr: 'B موجب (+)',
      displayEn: 'B Positive (B+)'
    },
    transfusionHistorySummary: 'نقل دم أثناء العملية الجراحية الأولى قبل 3 أيام',
    requestedComponent: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (PRBCs)',
    componentNameEn: 'Packed Red Blood Cells',
    requestedQuantity: 1,
    quantityUnit: 'أكياس (Units)',
    clinicalIndication: 'علاج هبوط الهيموجلوبين ونقص الأكسجة النسيجية في العناية',
    hemoglobinBaseline: '7.4 g/dL',
    priority: 'urgent',
    requiredByTime: 'مكتمل الصرف',
    specialRequirements: ['leukocyte_reduced', 'irradiated'],
    requestingClinician: 'د. حسام السعيد',
    requestingRole: 'أخصائي أول عناية مركزة',
    requestingDepartment: 'قسم العناية المركزة',
    requestedAt: 'منذ 5 ساعات',
    linkedSampleId: 'SMP-BT-9046',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'compatible',
    allocatedUnitIds: ['DIN-W2026-0949-RBC'],
    issuedUnitIds: ['DIN-W2026-0949-RBC'],
    requestStatus: 'completed'
  },

  // Scenario G: Product Unavailable / Clinical Strategy Coordination
  {
    id: 'BPR-2026-807',
    axis6OrderId: 'ORD-BB-807',
    patientId: 'p7',
    patientName: 'خالد عمر الحازمي',
    patientNameEn: 'Khaled Omar Al-Hazmi',
    mrn: 'MRN-88427',
    encounterId: 'ENC-2026-110',
    encounterType: 'inpatient',
    locationWardBed: 'جناح زراعة النخاع 5A - سرير 01',
    patientAge: 19,
    patientGender: 'male',
    patientWeightKg: 62,
    patientPrimaryDiagnosis: 'فشل نخاع عظمي - زراعة نخاع عظمي خيفية (BMT Status Post)',
    patientHistoricalBloodGroup: {
      abo: 'A',
      rh: 'negative',
      displayAr: 'A سالب (-)',
      displayEn: 'A Negative (A-)'
    },
    transfusionHistorySummary: 'نقل دم وصفائح مشععة دورياً',
    requestedComponent: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مشععة وسالبة لفيروس CMV (Irradiated CMV-Neg A-)',
    componentNameEn: 'Irradiated CMV-Negative A-Neg PRBCs',
    requestedQuantity: 2,
    quantityUnit: 'أكياس (Units)',
    clinicalIndication: 'فقر دم متقدم لمريض زراعة نخاع في فترة كبت المناعة الحاد',
    hemoglobinBaseline: '6.5 g/dL',
    priority: 'urgent',
    requiredByTime: 'خلال 3 ساعات',
    specialRequirements: ['irradiated', 'leukocyte_reduced', 'cmv_negative', 'washed'],
    specialInstructions: 'مطلوب حصراً وحدات مغسولة ومشععة خالية من CMV لمريض كبت مناعة شديد',
    requestingClinician: 'د. سامي الرشيد',
    requestingRole: 'استشاري زراعة النخاع والخلايا الجذعية',
    requestingDepartment: 'وحدة زراعة النخاع BMT',
    requestedAt: 'منذ ساعة ونصف',
    linkedSampleId: 'SMP-BT-9047',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'not_started',
    allocatedUnitIds: [],
    issuedUnitIds: [],
    requestStatus: 'received'
  },

  // Scenario H: Massive Transfusion Protocol (MTP Trauma Round)
  {
    id: 'BPR-2026-808',
    axis6OrderId: 'ORD-BB-808',
    patientId: 'p8',
    patientName: 'أحمد صالح الغامدي',
    patientNameEn: 'Ahmad Saleh Al-Ghamdi',
    mrn: 'MRN-88428',
    encounterId: 'ENC-2026-111',
    encounterType: 'emergency',
    locationWardBed: 'طوارئ الحوادث ER - غرفة الرضوح الحادة Trauma-A',
    patientAge: 34,
    patientGender: 'male',
    patientWeightKg: 85,
    patientPrimaryDiagnosis: 'تمزق الأبهر والنزيف الحوضي الكارثي نتيجة حادث قطار/مركبة',
    transfusionHistorySummary: 'تفعيل بروتوكول النقل الهائل للدم (MTP Active)',
    requestedComponent: 'packed_red_blood_cells',
    componentNameAr: 'حزمة بروتوكول النقل الهائل للدم (MTP Pack 1: 4 RBC + 4 FFP + 1 PLT)',
    componentNameEn: 'MTP Round 1 Pack',
    requestedQuantity: 4,
    quantityUnit: 'أكياس كريات دم + بلازما + صفائح',
    clinicalIndication: 'صدمة نزفية غير مستجيبة مع هبوط الضغط وخلل التخثر الاستهلاكي (TIC)',
    hemoglobinBaseline: '4.8 g/dL',
    inrBaseline: '2.8',
    priority: 'stat_emergency',
    requiredByTime: 'فوري (بروتوكول MTP نشط)',
    specialRequirements: ['leukocyte_reduced'],
    requestingClinician: 'د. يوسف التميمي',
    requestingRole: 'استشاري جراحة الحوادث وقائد فريق الرضوح',
    requestingDepartment: 'فريق الحوادث المتقدم Trauma Team',
    requestedAt: 'منذ 25 دقيقة',
    linkedSampleId: 'SMP-BT-9048',
    sampleStatus: 'received_valid',
    compatibilityStatus: 'emergency_released',
    allocatedUnitIds: ['DIN-W2026-0961-RBC', 'DIN-W2026-0962-RBC', 'DIN-W2026-0971-FFP', 'DIN-W2026-0972-FFP'],
    issuedUnitIds: ['DIN-W2026-0961-RBC', 'DIN-W2026-0962-RBC'],
    requestStatus: 'partially_issued',
    isEmergencyReleaseRequested: true,
    isMassiveTransfusionProtocol: true,
    mtpRoundNumber: 1
  }
];

// ----------------------------------------------------------------------------
// 2. MOCK PRE-TRANSFUSION SAMPLES
// ----------------------------------------------------------------------------
export const INITIAL_PRETRANSFUSION_SAMPLES: PreTransfusionSample[] = [
  {
    id: 'SMP-BT-9041',
    barcode: '9041-88421-B',
    patientId: 'p1',
    patientName: 'سارة خالد المنصوري',
    patientNameEn: 'Sara Khaled Al-Mansoor',
    mrn: 'MRN-88421',
    encounterId: 'ENC-2026-104',
    collectionLocation: 'جناح الباطنة 4A - سرير 12',
    collectedAt: 'اليوم 08:30 ص',
    collectorName: 'ممرضة ندى الحربي',
    collectorRole: 'تمريض جناح الباطنة',
    receivedAt: 'اليوم 08:50 ص',
    receiverTechnologist: 'أخصائي مختبر بدر العتيبي',
    tubeType: 'EDTA Pink Top (6 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 68 ساعة (3 أيام)',
    validityPolicyDescription: 'صالحة لمدة 72 ساعة لمرضى التنويم المنقول لهم دم حديثاً',
    historicalGroupContext: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    identificationVerificationDone: true,
    identificationMethod: 'Two Identifiers Verified (Name + MRN) + Barcode Scan at Bedside'
  },
  {
    id: 'SMP-BT-9042',
    barcode: '9042-88422-B',
    patientId: 'p2',
    patientName: 'عبد الله بن فيصل الزهراني',
    patientNameEn: 'Abdullah Faisal Al-Zahrani',
    mrn: 'MRN-88422',
    encounterId: 'ENC-2026-105',
    collectionLocation: 'جناح الأورام 3B',
    collectedAt: 'اليوم 07:45 ص',
    collectorName: 'ممرض كمال فؤاد',
    collectorRole: 'تمريض مركز الأورام',
    receivedAt: 'اليوم 08:10 ص',
    receiverTechnologist: 'أخصائي مختبر بدر العتيبي',
    tubeType: 'EDTA Pink Top (6 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 70 ساعة',
    validityPolicyDescription: 'عينة صالحة لمدة 72 ساعة حسب بروتوكول الأورام ونقل الدم المتكرر',
    historicalGroupContext: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    previousAntibodiesContext: ['Anti-Kell (K)'],
    identificationVerificationDone: true,
    identificationMethod: 'Two Identifiers Verified + Wristband Scan'
  },
  {
    id: 'SMP-BT-9043',
    barcode: '9043-99103-B',
    patientId: 'p3',
    patientName: 'مجهول الهوية #12 (مصاب حادث سيارة)',
    patientNameEn: 'Trauma Unknown #12 (MVA)',
    mrn: 'MRN-99103',
    encounterId: 'ENC-2026-909',
    collectionLocation: 'طوارئ الحوادث ER - Resus-1',
    collectedAt: 'اليوم 10:15 ص',
    collectorName: 'ممرض فهد الشهري',
    collectorRole: 'تمريض طوارئ الحوادث',
    receivedAt: 'اليوم 10:22 ص',
    receiverTechnologist: 'أخصائية مختبر لمياء الدخيل',
    tubeType: 'EDTA Pink Top (6 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 71 ساعة',
    validityPolicyDescription: 'عينة طارئة سريعة التحليل لغرفة الرضوح',
    identificationVerificationDone: true,
    identificationMethod: 'Emergency Trauma Wristband + Two Witnesses Verified'
  },
  {
    id: 'SMP-BT-9044',
    barcode: '9044-88424-B',
    patientId: 'p4',
    patientName: 'فاطمة أحمد السالم',
    patientNameEn: 'Fatima Ahmad Al-Salem',
    mrn: 'MRN-88424',
    encounterId: 'ENC-2026-107',
    collectionLocation: 'جناح الباطنة 4B',
    collectedAt: 'اليوم 09:10 ص',
    collectorName: 'ممرضة منى الشريف',
    collectorRole: 'تمريض أجنحة',
    receivedAt: 'اليوم 09:30 ص',
    receiverTechnologist: 'أخصائية مختبر لمياء الدخيل',
    tubeType: 'EDTA Lavender Top (4 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 71 ساعة',
    validityPolicyDescription: 'عينة صالحة لنقل الصفائح ومطابقة الفصيلة',
    historicalGroupContext: { abo: 'B', rh: 'positive', displayAr: 'B موجب (+)', displayEn: 'B Positive' },
    identificationVerificationDone: true,
    identificationMethod: 'Two Identifiers Verified + Barcode Scan'
  },
  {
    id: 'SMP-BT-9045',
    barcode: '9045-88425-B',
    patientId: 'p5',
    patientName: 'ماجد عبد العزيز الخالدي',
    patientNameEn: 'Majid Abdulaziz Al-Khalidi',
    mrn: 'MRN-88425',
    encounterId: 'ENC-2026-108',
    collectionLocation: 'عيادة التقييم قبل الجراحة PAC',
    collectedAt: 'أمس 11:00 ص',
    collectorName: 'فني سحب دم طلال مكي',
    collectorRole: 'فني سحب عينات خارجي',
    receivedAt: 'أمس 11:40 ص',
    receiverTechnologist: 'أخصائي مختبر بدر العتيبي',
    tubeType: 'EDTA Pink Top (6 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 48 ساعة',
    validityPolicyDescription: 'صالحة قبل الجراحة بحد أقصى 72 ساعة لعدم وجود نقل دم حديث',
    historicalGroupContext: { abo: 'AB', rh: 'positive', displayAr: 'AB موجب (+)', displayEn: 'AB Positive' },
    identificationVerificationDone: true,
    identificationMethod: 'Two Identifiers Verified (PAC Clinic Protocol)'
  },
  {
    id: 'SMP-BT-9046',
    barcode: '9046-88426-B',
    patientId: 'p6',
    patientName: 'نورة سليمان الدوسري',
    patientNameEn: 'Noura Sulaiman Al-Dossari',
    mrn: 'MRN-88426',
    encounterId: 'ENC-2026-109',
    collectionLocation: 'العناية المركزة الجراحية SICU',
    collectedAt: 'اليوم 06:30 ص',
    collectorName: 'ممرضة سحر الملا',
    collectorRole: 'تمريض عناية مركزة',
    receivedAt: 'اليوم 06:55 ص',
    receiverTechnologist: 'أخصائية مختبر لمياء الدخيل',
    tubeType: 'EDTA Pink Top (6 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 66 ساعة',
    validityPolicyDescription: 'عينة ما قبل النقل مسجلة بالعناية',
    historicalGroupContext: { abo: 'B', rh: 'positive', displayAr: 'B موجب (+)', displayEn: 'B Positive' },
    identificationVerificationDone: true,
    identificationMethod: 'Two Identifiers Verified + ICU Patient Monitor Tag'
  },
  {
    id: 'SMP-BT-9047',
    barcode: '9047-88427-B',
    patientId: 'p7',
    patientName: 'خالد عمر الحازمي',
    patientNameEn: 'Khaled Omar Al-Hazmi',
    mrn: 'MRN-88427',
    encounterId: 'ENC-2026-110',
    collectionLocation: 'جناح زراعة النخاع 5A',
    collectedAt: 'اليوم 09:00 ص',
    collectorName: 'ممرض زياد العبدلي',
    collectorRole: 'تمريض زراعة نخاع العظم',
    receivedAt: 'اليوم 09:25 ص',
    receiverTechnologist: 'أخصائي مختبر بدر العتيبي',
    tubeType: 'EDTA Pink Top (6 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 71 ساعة',
    validityPolicyDescription: 'صالحة 72 ساعة لمرضى زراعة النخاع الخاضعين لكبت المناعة',
    historicalGroupContext: { abo: 'A', rh: 'negative', displayAr: 'A سالب (-)', displayEn: 'A Negative' },
    identificationVerificationDone: true,
    identificationMethod: 'Two Identifiers Verified + BMT Isolation Room Protocol'
  },
  {
    id: 'SMP-BT-9048',
    barcode: '9048-88428-B',
    patientId: 'p8',
    patientName: 'أحمد صالح الغامدي',
    patientNameEn: 'Ahmad Saleh Al-Ghamdi',
    mrn: 'MRN-88428',
    encounterId: 'ENC-2026-111',
    collectionLocation: 'طوارئ الحوادث ER - Trauma-A',
    collectedAt: 'اليوم 10:30 ص',
    collectorName: 'ممرض ياسر الغامدي',
    collectorRole: 'تمريض رضوح حادة',
    receivedAt: 'اليوم 10:35 ص',
    receiverTechnologist: 'أخصائية مختبر لمياء الدخيل',
    tubeType: 'EDTA Pink Top (6 mL)',
    validityStatus: 'valid',
    validUntil: 'بعد 71 ساعة',
    validityPolicyDescription: 'عينة MTP فورية مسحوبة مع بداية تشغيل بروتوكول النقل الهائل',
    identificationVerificationDone: true,
    identificationMethod: 'ER Trauma Protocol + Witness Verification'
  }
];

// ----------------------------------------------------------------------------
// 3. MOCK BLOOD GROUP / TYPE TESTING RESULTS
// ----------------------------------------------------------------------------
export const INITIAL_BLOOD_GROUP_TESTS: BloodGroupTestResult[] = [
  {
    id: 'GRP-TEST-9041',
    sampleId: 'SMP-BT-9041',
    patientId: 'p1',
    patientMrn: 'MRN-88421',
    testDate: 'اليوم 09:05 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    verifierName: 'د. سامية المهيدب (استشارية طب نقل الدم)',
    antiA: '4+',
    antiB: '0',
    antiAB: '4+',
    antiD: '4+',
    rhControl: '0',
    a1Cells: '0',
    bCells: '4+',
    interpretedAbo: 'A',
    interpretedRh: 'positive',
    historicalAbo: 'A',
    historicalRh: 'positive',
    discrepancyStatus: 'none_matched',
    technicalVerificationStatus: 'verified'
  },
  {
    id: 'GRP-TEST-9042',
    sampleId: 'SMP-BT-9042',
    patientId: 'p2',
    patientMrn: 'MRN-88422',
    testDate: 'اليوم 08:25 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    verifierName: 'د. سامية المهيدب',
    antiA: '0',
    antiB: '0',
    antiAB: '0',
    antiD: '4+',
    rhControl: '0',
    a1Cells: '4+',
    bCells: '4+',
    interpretedAbo: 'O',
    interpretedRh: 'positive',
    historicalAbo: 'O',
    historicalRh: 'positive',
    discrepancyStatus: 'none_matched',
    technicalVerificationStatus: 'verified'
  },
  {
    id: 'GRP-TEST-9043',
    sampleId: 'SMP-BT-9043',
    patientId: 'p3',
    patientMrn: 'MRN-99103',
    testDate: 'اليوم 10:35 ص',
    technologistName: 'أخصائية مختبر لمياء الدخيل',
    verifierName: 'أخصائي مختبر بدر العتيبي',
    antiA: '4+',
    antiB: '0',
    antiAB: '4+',
    antiD: '4+',
    rhControl: '0',
    a1Cells: '0',
    bCells: '4+',
    interpretedAbo: 'A',
    interpretedRh: 'positive',
    discrepancyStatus: 'first_time_type',
    discrepancyNote: 'أول فحص مسجل بالمستشفى - تم إصدار O سالب طارئ مسبقاً وتأكيد فصيلة المريض A موجب لاحقاً',
    technicalVerificationStatus: 'requires_second_sample'
  },
  {
    id: 'GRP-TEST-9044',
    sampleId: 'SMP-BT-9044',
    patientId: 'p4',
    patientMrn: 'MRN-88424',
    testDate: 'اليوم 09:45 ص',
    technologistName: 'أخصائية مختبر لمياء الدخيل',
    antiA: '0',
    antiB: '4+',
    antiAB: '4+',
    antiD: '4+',
    rhControl: '0',
    a1Cells: '4+',
    bCells: '0',
    interpretedAbo: 'B',
    interpretedRh: 'positive',
    historicalAbo: 'B',
    historicalRh: 'positive',
    discrepancyStatus: 'none_matched',
    technicalVerificationStatus: 'verified'
  },
  {
    id: 'GRP-TEST-9045',
    sampleId: 'SMP-BT-9045',
    patientId: 'p5',
    patientMrn: 'MRN-88425',
    testDate: 'أمس 12:15 م',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    verifierName: 'د. سامية المهيدب',
    antiA: '4+',
    antiB: '4+',
    antiAB: '4+',
    antiD: '4+',
    rhControl: '0',
    a1Cells: '0',
    bCells: '0',
    interpretedAbo: 'AB',
    interpretedRh: 'positive',
    historicalAbo: 'AB',
    historicalRh: 'positive',
    discrepancyStatus: 'none_matched',
    technicalVerificationStatus: 'verified'
  },
  {
    id: 'GRP-TEST-9047',
    sampleId: 'SMP-BT-9047',
    patientId: 'p7',
    patientMrn: 'MRN-88427',
    testDate: 'اليوم 09:40 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    antiA: '4+',
    antiB: '0',
    antiAB: '4+',
    antiD: '0',
    rhControl: '0',
    a1Cells: '0',
    bCells: '4+',
    interpretedAbo: 'A',
    interpretedRh: 'negative',
    historicalAbo: 'A',
    historicalRh: 'negative',
    discrepancyStatus: 'none_matched',
    technicalVerificationStatus: 'verified'
  }
];

// ----------------------------------------------------------------------------
// 4. MOCK ANTIBODY SCREEN RESULTS
// ----------------------------------------------------------------------------
export const INITIAL_ANTIBODY_SCREENS: AntibodyScreenResult[] = [
  // Scenario A: Negative Screen
  {
    id: 'ABS-9041',
    sampleId: 'SMP-BT-9041',
    patientId: 'p1',
    patientMrn: 'MRN-88421',
    testedAt: 'اليوم 09:15 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    screenMethod: 'Column Agglutination (Gel Card)',
    screen1Cell: 'Negative',
    screen2Cell: 'Negative',
    screen3Cell: 'Negative',
    overallScreenResult: 'negative',
    investigationRequired: false,
    identifiedAntibodies: [],
    antigenNegativeSearchNeeded: false
  },

  // Scenario B: Positive Screen (Anti-Kell Identified)
  {
    id: 'ABS-9042',
    sampleId: 'SMP-BT-9042',
    patientId: 'p2',
    patientMrn: 'MRN-88422',
    testedAt: 'اليوم 08:40 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    screenMethod: 'Column Agglutination (Gel Card)',
    screen1Cell: 'Negative',
    screen2Cell: '3+',
    screen3Cell: '3+',
    overallScreenResult: 'positive',
    investigationRequired: true,
    identifiedAntibodies: [
      {
        specificity: 'Anti-Kell (K)',
        clinicalSignificance: 'clinically_significant',
        transfusionRequirement: 'يتطلب وحدات دم سالبة لمستضد Kell (K-negative) واختبار توافق AHG',
        historicalDate: 'مسجل مسبقاً منذ 8 أشهر'
      }
    ],
    antigenNegativeSearchNeeded: true,
    searchCriteria: 'ABO O / Rh Positive or Negative + K-negative phenotype confirmed'
  },

  // Scenario E: Negative Screen
  {
    id: 'ABS-9045',
    sampleId: 'SMP-BT-9045',
    patientId: 'p5',
    patientMrn: 'MRN-88425',
    testedAt: 'أمس 12:45 م',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    screenMethod: 'Column Agglutination (Gel Card)',
    screen1Cell: 'Negative',
    screen2Cell: 'Negative',
    screen3Cell: 'Negative',
    overallScreenResult: 'negative',
    investigationRequired: false,
    identifiedAntibodies: [],
    antigenNegativeSearchNeeded: false
  },

  // Scenario G: Negative Screen for BMT
  {
    id: 'ABS-9047',
    sampleId: 'SMP-BT-9047',
    patientId: 'p7',
    patientMrn: 'MRN-88427',
    testedAt: 'اليوم 10:00 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    screenMethod: 'Column Agglutination (Gel Card)',
    screen1Cell: 'Negative',
    screen2Cell: 'Negative',
    screen3Cell: 'Negative',
    overallScreenResult: 'negative',
    investigationRequired: false,
    identifiedAntibodies: [],
    antigenNegativeSearchNeeded: false
  }
];

// ----------------------------------------------------------------------------
// 5. MOCK PRODUCT INVENTORY UNITS
// ----------------------------------------------------------------------------
export const INITIAL_PRODUCT_UNITS: BloodProductUnit[] = [
  // Units for Scenario A (A+ PRBCs)
  {
    id: 'DIN-W2026-0941-RBC',
    unitNumber: '=W0422 26 10941 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة',
    componentNameEn: 'Packed Red Blood Cells',
    bloodGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    volumeMl: 285,
    collectionDate: '2026-08-20',
    expiryDate: '2026-10-01',
    isNearExpiry: false,
    storageLocation: 'ثلاجة بنك الدم 1 - الرف A1',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'issued',
    allocatedToRequestId: 'BPR-2026-801',
    allocatedToPatientName: 'سارة خالد المنصوري',
    allocatedToPatientMrn: 'MRN-88421',
    allocatedAt: 'اليوم 09:30 ص',
    issuedAt: 'اليوم 10:15 ص',
    issuedToLocation: 'جناح الباطنة 4A - سرير 12'
  },
  {
    id: 'DIN-W2026-0942-RBC',
    unitNumber: '=W0422 26 10942 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة',
    componentNameEn: 'Packed Red Blood Cells',
    bloodGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    volumeMl: 290,
    collectionDate: '2026-08-22',
    expiryDate: '2026-10-03',
    isNearExpiry: false,
    storageLocation: 'ثلاجة الصرف الجاهز - الرف B1',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'ready_for_issue',
    allocatedToRequestId: 'BPR-2026-801',
    allocatedToPatientName: 'سارة خالد المنصوري',
    allocatedToPatientMrn: 'MRN-88421',
    allocatedAt: 'اليوم 09:30 ص'
  },

  // Units for Scenario B (O+ PRBCs with K-negative phenotype)
  {
    id: 'DIN-W2026-0943-RBC',
    unitNumber: '=W0422 26 10943 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (K-negative)',
    componentNameEn: 'PRBCs Kell-Negative Phenotyped',
    bloodGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    volumeMl: 310,
    collectionDate: '2026-08-25',
    expiryDate: '2026-10-06',
    isNearExpiry: false,
    storageLocation: 'ثلاجة الوحدات المخصصة - الرف C1',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced', 'antigen_negative', 'phenotype_matched'],
    antigenProfile: ['K-', 'E-', 'c+'],
    status: 'allocated',
    allocatedToRequestId: 'BPR-2026-802',
    allocatedToPatientName: 'عبد الله بن فيصل الزهراني',
    allocatedToPatientMrn: 'MRN-88422',
    allocatedAt: 'اليوم 09:10 ص'
  },
  {
    id: 'DIN-W2026-0944-RBC',
    unitNumber: '=W0422 26 10944 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (K-negative)',
    componentNameEn: 'PRBCs Kell-Negative Phenotyped',
    bloodGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    volumeMl: 300,
    collectionDate: '2026-08-26',
    expiryDate: '2026-10-07',
    isNearExpiry: false,
    storageLocation: 'ثلاجة الوحدات المخصصة - الرف C2',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced', 'antigen_negative', 'phenotype_matched'],
    antigenProfile: ['K-', 'E-', 'c+'],
    status: 'allocated',
    allocatedToRequestId: 'BPR-2026-802',
    allocatedToPatientName: 'عبد الله بن فيصل الزهراني',
    allocatedToPatientMrn: 'MRN-88422',
    allocatedAt: 'اليوم 09:10 ص'
  },

  // Units for Scenario C (O- Emergency Universal PRBCs)
  {
    id: 'DIN-W2026-0945-RBC',
    unitNumber: '=W0422 26 10945 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء طوارئ (O-Negative Emergency)',
    componentNameEn: 'O-Negative Universal Emergency PRBCs',
    bloodGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (-)', displayEn: 'O Negative' },
    volumeMl: 295,
    collectionDate: '2026-08-28',
    expiryDate: '2026-10-09',
    originalExpiryDate: '2026-10-09',
    isNearExpiry: false,
    branchId: 'trauma_center_east',
    branchNameAr: 'مركز الإصابات والحوادث (شرق)',
    storageLocation: 'ثلاجة الطوارئ الفورية - الرف E1',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'issued',
    allocatedToRequestId: 'BPR-2026-803',
    allocatedToPatientName: 'مجهول الهوية #12 (مصاب حادث سيارة)',
    allocatedToPatientMrn: 'MRN-99103',
    allocatedAt: 'اليوم 10:20 ص',
    issuedAt: 'اليوم 10:25 ص',
    issuedToLocation: 'طوارئ الحوادث ER - Resus-1'
  },
  {
    id: 'DIN-W2026-0946-RBC',
    unitNumber: '=W0422 26 10946 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء طوارئ (O-Negative Emergency)',
    componentNameEn: 'O-Negative Universal Emergency PRBCs',
    bloodGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (-)', displayEn: 'O Negative' },
    volumeMl: 305,
    collectionDate: '2026-08-28',
    expiryDate: '2026-10-09',
    originalExpiryDate: '2026-10-09',
    isNearExpiry: false,
    branchId: 'trauma_center_east',
    branchNameAr: 'مركز الإصابات والحوادث (شرق)',
    storageLocation: 'ثلاجة الطوارئ الفورية - الرف E2',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'issued',
    allocatedToRequestId: 'BPR-2026-803',
    allocatedToPatientName: 'مجهول الهوية #12 (مصاب حادث سيارة)',
    allocatedToPatientMrn: 'MRN-99103',
    allocatedAt: 'اليوم 10:20 ص',
    issuedAt: 'اليوم 10:25 ص',
    issuedToLocation: 'طوارئ الحوادث ER - Resus-1'
  },

  // Unit for Scenario D (Apheresis Platelets)
  {
    id: 'DIN-W2026-0951-PLT',
    unitNumber: '=W0422 26 20951 00',
    componentType: 'platelets_apheresis',
    componentNameAr: 'صفائح دموية بالفصادة (Single Donor Apheresis Platelets)',
    componentNameEn: 'Apheresis Platelets',
    bloodGroup: { abo: 'B', rh: 'positive', displayAr: 'B موجب (+)', displayEn: 'B Positive' },
    volumeMl: 260,
    collectionDate: '2026-09-12',
    expiryDate: '2026-09-17',
    isNearExpiry: true,
    storageLocation: 'حاضنة الصفائح مع الهزاز 1 - الرف 2',
    storageTemperatureC: '20°C - 24°C',
    specialAttributes: ['leukocyte_reduced', 'irradiated'],
    status: 'ready_for_issue',
    allocatedToRequestId: 'BPR-2026-804',
    allocatedToPatientName: 'فاطمة أحمد السالم',
    allocatedToPatientMrn: 'MRN-88424',
    allocatedAt: 'اليوم 09:50 ص',
    preparationState: { isIrradiated: true }
  },

  // Units for Scenario E (Returned from OR)
  {
    id: 'DIN-W2026-0947-RBC',
    unitNumber: '=W0422 26 10947 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (Returned Unit)',
    componentNameEn: 'PRBCs AB-Positive',
    bloodGroup: { abo: 'AB', rh: 'positive', displayAr: 'AB موجب (+)', displayEn: 'AB Positive' },
    volumeMl: 290,
    collectionDate: '2026-08-30',
    expiryDate: '2026-10-11',
    isNearExpiry: false,
    storageLocation: 'منطقة استلام العائدات والفحص المؤقت',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'returned_in_inspection',
    allocatedToRequestId: 'BPR-2026-805',
    allocatedToPatientName: 'ماجد عبد العزيز الخالدي',
    allocatedToPatientMrn: 'MRN-88425',
    allocatedAt: 'أمس 01:00 م',
    issuedAt: 'أمس 02:30 م'
  },
  {
    id: 'DIN-W2026-0948-RBC',
    unitNumber: '=W0422 26 10948 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (Reserved for OR)',
    componentNameEn: 'PRBCs AB-Positive',
    bloodGroup: { abo: 'AB', rh: 'positive', displayAr: 'AB موجب (+)', displayEn: 'AB Positive' },
    volumeMl: 295,
    collectionDate: '2026-08-30',
    expiryDate: '2026-10-11',
    isNearExpiry: false,
    storageLocation: 'ثلاجة العمليات الجراحية - الرف D1',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'allocated',
    allocatedToRequestId: 'BPR-2026-805',
    allocatedToPatientName: 'ماجد عبد العزيز الخالدي',
    allocatedToPatientMrn: 'MRN-88425',
    allocatedAt: 'أمس 01:00 م'
  },

  // Unit for Scenario F (Reaction Investigation)
  {
    id: 'DIN-W2026-0949-RBC',
    unitNumber: '=W0422 26 10949 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (Investigation Unit)',
    componentNameEn: 'PRBCs B-Positive',
    bloodGroup: { abo: 'B', rh: 'positive', displayAr: 'B موجب (+)', displayEn: 'B Positive' },
    volumeMl: 280,
    collectionDate: '2026-08-18',
    expiryDate: '2026-09-29',
    isNearExpiry: false,
    storageLocation: 'غرفة التحقيق في تفاعلات نقل الدم - ثلاجة العزل',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced', 'irradiated'],
    status: 'quarantined',
    allocatedToRequestId: 'BPR-2026-806',
    allocatedToPatientName: 'نورة سليمان الدوسري',
    allocatedToPatientMrn: 'MRN-88426',
    allocatedAt: 'اليوم 07:15 ص',
    issuedAt: 'اليوم 07:45 ص'
  },

  // Units for Scenario H (MTP Pack 1)
  {
    id: 'DIN-W2026-0961-RBC',
    unitNumber: '=W0422 26 10961 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء (MTP Round 1)',
    componentNameEn: 'PRBCs O-Negative MTP',
    bloodGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (-)', displayEn: 'O Negative' },
    volumeMl: 300,
    collectionDate: '2026-09-01',
    expiryDate: '2026-10-13',
    isNearExpiry: false,
    storageLocation: 'صندوق نقل MTP المبرد #01',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'issued',
    allocatedToRequestId: 'BPR-2026-808',
    allocatedToPatientName: 'أحمد صالح الغامدي',
    allocatedToPatientMrn: 'MRN-88428',
    issuedAt: 'اليوم 10:45 ص'
  },
  {
    id: 'DIN-W2026-0962-RBC',
    unitNumber: '=W0422 26 10962 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء (MTP Round 1)',
    componentNameEn: 'PRBCs O-Negative MTP',
    bloodGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (-)', displayEn: 'O Negative' },
    volumeMl: 310,
    collectionDate: '2026-09-01',
    expiryDate: '2026-10-13',
    isNearExpiry: false,
    storageLocation: 'صندوق نقل MTP المبرد #01',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'issued',
    allocatedToRequestId: 'BPR-2026-808',
    allocatedToPatientName: 'أحمد صالح الغامدي',
    allocatedToPatientMrn: 'MRN-88428',
    issuedAt: 'اليوم 10:45 ص'
  },
  {
    id: 'DIN-W2026-0971-FFP',
    unitNumber: '=W0422 26 30971 00',
    componentType: 'fresh_frozen_plasma',
    componentNameAr: 'بلازما طازجة مجمدة بعد الإذابة (Thawed FFP)',
    componentNameEn: 'Fresh Frozen Plasma (Thawed)',
    bloodGroup: { abo: 'AB', rh: 'positive', displayAr: 'AB عام للبلازما', displayEn: 'AB Universal Plasma' },
    volumeMl: 250,
    collectionDate: '2026-07-10',
    expiryDate: '2026-09-21 10:40',
    originalExpiryDate: '2027-07-10',
    postProcessingVerifiedExpiry: '2026-09-21 10:40',
    expiryVerificationStatus: 'verified',
    isNearExpiry: false,
    branchId: 'trauma_center_east',
    branchNameAr: 'مركز الإصابات والحوادث (شرق)',
    storageLocation: 'حمام إذابة البلازما / ثلاجة الصرف المؤقت',
    storageTemperatureC: '2°C - 6°C (بعد الإذابة)',
    specialAttributes: ['leukocyte_reduced'],
    status: 'ready_for_issue',
    allocatedToRequestId: 'BPR-2026-808',
    allocatedToPatientName: 'أحمد صالح الغامدي',
    allocatedToPatientMrn: 'MRN-88428',
    preparationState: {
      isThawed: true,
      thawedAt: 'اليوم 10:40 ص',
      thawExpiry: 'بروتوكول النزف الحاد MTP - صلاحية محددة وفق سياسة الإذابة المؤسسية (2°C-6°C)'
    }
  },
  {
    id: 'DIN-W2026-0972-FFP',
    unitNumber: '=W0422 26 30972 00',
    componentType: 'fresh_frozen_plasma',
    componentNameAr: 'بلازما طازجة مجمدة بعد الإذابة (Thawed FFP)',
    componentNameEn: 'Fresh Frozen Plasma (Thawed)',
    bloodGroup: { abo: 'AB', rh: 'positive', displayAr: 'AB عام للبلازما', displayEn: 'AB Universal Plasma' },
    volumeMl: 245,
    collectionDate: '2026-07-12',
    expiryDate: '2026-09-21 10:40',
    originalExpiryDate: '2027-07-12',
    postProcessingVerifiedExpiry: '2026-09-21 10:40',
    expiryVerificationStatus: 'verified',
    isNearExpiry: false,
    branchId: 'trauma_center_east',
    branchNameAr: 'مركز الإصابات والحوادث (شرق)',
    storageLocation: 'حمام إذابة البلازما / ثلاجة الصرف المؤقت',
    storageTemperatureC: '2°C - 6°C (بعد الإذابة)',
    specialAttributes: ['leukocyte_reduced'],
    status: 'ready_for_issue',
    allocatedToRequestId: 'BPR-2026-808',
    allocatedToPatientName: 'أحمد صالح الغامدي',
    allocatedToPatientMrn: 'MRN-88428',
    preparationState: {
      isThawed: true,
      thawedAt: 'اليوم 10:40 ص',
      thawExpiry: 'بروتوكول النزف الحاد MTP - صلاحية محددة وفق سياسة الإذابة المؤسسية (2°C-6°C)'
    }
  },

  // Additional Available Units in Blood Bank Inventory
  {
    id: 'DIN-W2026-1001-RBC',
    unitNumber: '=W0422 26 11001 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة',
    componentNameEn: 'Packed Red Blood Cells',
    bloodGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    volumeMl: 300,
    collectionDate: '2026-08-15',
    expiryDate: '2026-09-26',
    originalExpiryDate: '2026-09-26',
    isNearExpiry: false,
    branchId: 'main_hospital',
    branchNameAr: 'المستشفى الرئيسي المركزي',
    storageLocation: 'ثلاجة بنك الدم 2 - الرف A2',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'available'
  },
  {
    id: 'DIN-W2026-1002-RBC',
    unitNumber: '=W0422 26 11002 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة',
    componentNameEn: 'Packed Red Blood Cells',
    bloodGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    volumeMl: 295,
    collectionDate: '2026-08-19',
    expiryDate: '2026-09-30',
    originalExpiryDate: '2026-09-30',
    isNearExpiry: false,
    branchId: 'main_hospital',
    branchNameAr: 'المستشفى الرئيسي المركزي',
    storageLocation: 'ثلاجة بنك الدم 1 - الرف A3',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'available'
  },
  {
    id: 'DIN-W2026-1003-RBC',
    unitNumber: '=W0422 26 11003 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (جراحة اليوم الواحد)',
    componentNameEn: 'Packed Red Blood Cells',
    bloodGroup: { abo: 'B', rh: 'positive', displayAr: 'B موجب (+)', displayEn: 'B Positive' },
    volumeMl: 285,
    collectionDate: '2026-08-21',
    expiryDate: '2026-10-02',
    originalExpiryDate: '2026-10-02',
    isNearExpiry: false,
    branchId: 'satellite_clinic_north',
    branchNameAr: 'مركز جراحة اليوم الواحد (شمال)',
    storageLocation: 'ثلاجة بنك الدم 2 - الرف B2',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'available'
  },
  {
    id: 'DIN-W2026-1004-RBC',
    unitNumber: '=W0422 26 11004 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء مكدسة (طوارئ الحوادث)',
    componentNameEn: 'Packed Red Blood Cells',
    bloodGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (-)', displayEn: 'O Negative' },
    volumeMl: 310,
    collectionDate: '2026-08-25',
    expiryDate: '2026-10-06',
    originalExpiryDate: '2026-10-06',
    isNearExpiry: false,
    branchId: 'trauma_center_east',
    branchNameAr: 'مركز الإصابات والحوادث (شرق)',
    storageLocation: 'ثلاجة الطوارئ 1 - الرف E3',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'available'
  },
  {
    id: 'DIN-W2026-1005-CRYO',
    unitNumber: '=W0422 26 41005 00',
    componentType: 'cryoprecipitate',
    componentNameAr: 'راسب برودي مجمع (Cryoprecipitate Pooled)',
    componentNameEn: 'Cryoprecipitate Pooled',
    bloodGroup: { abo: 'AB', rh: 'positive', displayAr: 'AB عام', displayEn: 'AB Universal' },
    volumeMl: 120,
    collectionDate: '2026-06-01',
    expiryDate: '2027-06-01',
    isNearExpiry: false,
    storageLocation: 'فريزر التجميد الفائق -40°C - الرف F1',
    storageTemperatureC: '-30°C أو أقل',
    specialAttributes: ['leukocyte_reduced'],
    status: 'available'
  },
  {
    id: 'DIN-W2026-1006-PLT',
    unitNumber: '=W0422 26 21006 00',
    componentType: 'platelets_pooled',
    componentNameAr: 'صفائح دموية مجمعة (Pooled Platelets)',
    componentNameEn: 'Pooled Platelets',
    bloodGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    volumeMl: 250,
    collectionDate: '2026-09-13',
    expiryDate: '2026-09-18',
    isNearExpiry: true,
    nearExpiryThresholdHours: 48,
    expiryVerificationStatus: 'verified',
    storageLocation: 'حاضنة الصفائح مع الهزاز 1 - الرف 1',
    storageTemperatureC: '20°C - 24°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'available'
  },
  // Unit demonstrating Missing Expiry (Must NOT become a future date; quarantined)
  {
    id: 'DIN-W2026-1007-RBC',
    unitNumber: '=W0422 26 11007 00',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'كريات دم حمراء (تاريخ الصلاحية غير محدد - معزولة)',
    componentNameEn: 'PRBCs - Missing Expiry Date',
    bloodGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    volumeMl: 280,
    collectionDate: '2026-08-20',
    expiryDate: '', // Deliberately missing from supplier record
    expiryVerificationStatus: 'unverified_missing_date',
    isNearExpiry: false,
    storageLocation: 'ثلاجة الحجر والعزل B3',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced'],
    status: 'quarantined',
    notes: 'تم حظر الوحدة وعزلها لعدم وضوح تاريخ الصلاحية على الملصق المورد؛ يتطلب التواصل مع بنك الدم المورد ومطابقة رقم التبرع.'
  },
  // Pooled Cryoprecipitate Unit demonstrating multi-contributor tracking (JPAC Section 7.5.4)
  {
    id: 'DIN-W2026-1008-POOL',
    unitNumber: '=W0422 26 41008 00',
    componentType: 'cryoprecipitate',
    componentNameAr: 'راسب برودي مدمج (Pooled Cryoprecipitate - 5 Units)',
    componentNameEn: 'Cryoprecipitate Pool (5 units)',
    bloodGroup: { abo: 'AB', rh: 'positive', displayAr: 'AB عام للبلازما والراسب', displayEn: 'AB Universal' },
    volumeMl: 175,
    collectionDate: '2026-07-01',
    expiryDate: '2027-07-01',
    expiryVerificationStatus: 'verified',
    isNearExpiry: false,
    storageLocation: 'محطة تجهيز المشتقات / فريزر -40°C',
    storageTemperatureC: '-30°C أو أقل (قبل الإذابة)',
    specialAttributes: ['leukocyte_reduced', 'pooled'],
    status: 'in_preparation',
    poolIdentifier: 'POOL-CRYO-2026-081',
    contributingUnitIds: ['DIN-CRYO-01', 'DIN-CRYO-02', 'DIN-CRYO-03', 'DIN-CRYO-04', 'DIN-CRYO-05'],
    isEligibleForNextStep: false, // NOT automatically available
    processingHistory: [
      {
        id: 'PROC-2026-401',
        sourceUnitIds: ['DIN-CRYO-01', 'DIN-CRYO-02', 'DIN-CRYO-03', 'DIN-CRYO-04', 'DIN-CRYO-05'],
        sourceProductIdentity: '5 وحدات راسب برودي فردية فصيلة AB',
        processingMethod: 'cryo_pooling',
        processingMethodAr: 'دمج الراسب البرودي (Cryo Pooling)',
        status: 'quality_verification_pending',
        requestedAt: 'اليوم 09:30 ص',
        startedAt: 'اليوم 09:40 ص',
        completedAt: 'اليوم 10:05 ص',
        responsibleSimulatedActor: 'أخصائي مختبر بدر العتيبي',
        deviceIdentifier: 'محطة الدمج المعقمة POOL-ST-01',
        resultingProductIdentity: 'Cryoprecipitate Pooled (5 units)',
        resultingVolumeMl: 175,
        poolIdentifier: 'POOL-CRYO-2026-081',
        contributingUnits: [
          { unitId: 'DIN-CRYO-01', unitNumber: '=W0422 26 40001 00', bloodGroup: 'AB+', originalVolumeMl: 35 },
          { unitId: 'DIN-CRYO-02', unitNumber: '=W0422 26 40002 00', bloodGroup: 'AB+', originalVolumeMl: 35 },
          { unitId: 'DIN-CRYO-03', unitNumber: '=W0422 26 40003 00', bloodGroup: 'AB+', originalVolumeMl: 35 },
          { unitId: 'DIN-CRYO-04', unitNumber: '=W0422 26 40004 00', bloodGroup: 'AB+', originalVolumeMl: 35 },
          { unitId: 'DIN-CRYO-05', unitNumber: '=W0422 26 40005 00', bloodGroup: 'AB+', originalVolumeMl: 35 }
        ],
        expirySource: 'JPAC Red Book Section 7.5.4 v8 (Cryoprecipitate Pooled)',
        expiryVerificationStatus: 'pending_verification',
        notes: 'الدمج بنظام مغلق معقم. الصلاحية بعد الإذابة 4 ساعات عند 20-24°C فور اكتمال التحقق.',
        isOptionalHospitalCapability: true
      }
    ]
  },
  // Pediatric Split Aliquot demonstrating parent-to-child tracking
  {
    id: 'DIN-W2026-1009-P1',
    unitNumber: '=W0422 26 11009 01',
    componentType: 'packed_red_blood_cells',
    componentNameAr: 'حصة أطفال مجزأة (Pediatric RBC Aliquot 1 of 3)',
    componentNameEn: 'Pediatric Split PRBCs Part 1',
    bloodGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (-)', displayEn: 'O Negative' },
    volumeMl: 70,
    collectionDate: '2026-09-05',
    expiryDate: '2026-10-17',
    expiryVerificationStatus: 'verified',
    isNearExpiry: false,
    storageLocation: 'ثلاجة دم الأطفال وحديثي الولادة - الرف P1',
    storageTemperatureC: '2°C - 6°C',
    specialAttributes: ['leukocyte_reduced', 'pediatric_split', 'cmv_negative'],
    status: 'in_preparation',
    parentUnitId: 'DIN-W2026-1009-RBC',
    isEligibleForNextStep: false, // Must be verified before issue
    processingHistory: [
      {
        id: 'PROC-2026-402',
        sourceUnitIds: ['DIN-W2026-1009-RBC'],
        sourceProductIdentity: 'وحدة كريات دم حمراء كاملة 290 mL O-',
        processingMethod: 'pediatric_splitting',
        processingMethodAr: 'تجزئة وحدات الأطفال المعقمة (Sterile Splitting)',
        status: 'processing_recorded',
        requestedAt: 'اليوم 08:00 ص',
        startedAt: 'اليوم 08:15 ص',
        completedAt: 'اليوم 08:35 ص',
        responsibleSimulatedActor: 'أخصائية مختبر لمياء الدخيل',
        deviceIdentifier: 'جهاز الربط المعقم TSCD-II (Sterile Tubing Welder)',
        resultingProductIdentity: 'PRBC Pediatric Aliquot P1 (70 mL)',
        resultingVolumeMl: 70,
        expirySource: 'AABB Standards 35th Ed / JPAC Section 7.3.1 (Closed System Maintains Original Expiry)',
        expiryVerificationStatus: 'pending_verification',
        notes: 'تم الربط الأنبوبي المعقم بنجاح؛ تحافظ الحصص على تاريخ صلاحية الوحدة الأم طالما لم يُفتح النظام.',
        isOptionalHospitalCapability: true
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 6. MOCK COMPATIBILITY RECORDS
// ----------------------------------------------------------------------------
export const INITIAL_COMPATIBILITY_RECORDS: CompatibilityRecord[] = [
  // Scenario A: Routine Crossmatch
  {
    id: 'CMP-2026-701',
    requestId: 'BPR-2026-801',
    sampleId: 'SMP-BT-9041',
    patientId: 'p1',
    patientMrn: 'MRN-88421',
    patientName: 'سارة خالد المنصوري',
    patientGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    unitId: 'DIN-W2026-0941-RBC',
    unitNumber: '=W0422 26 10941 00',
    unitGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    componentType: 'packed_red_blood_cells',
    method: 'serologic_immediate_spin',
    methodDisplayAr: 'تطابق مصلي فوري (Immediate Spin Crossmatch)',
    result: 'compatible',
    testedAt: 'اليوم 09:25 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    verifierName: 'د. سامية المهيدب',
    isSpecialRequirementSatisfied: true,
    satisfiedRequirementsList: ['مطابقة فصيلة A+', 'فلترة الكريات البيضاء (Leukoreduced)']
  },
  {
    id: 'CMP-2026-702',
    requestId: 'BPR-2026-801',
    sampleId: 'SMP-BT-9041',
    patientId: 'p1',
    patientMrn: 'MRN-88421',
    patientName: 'سارة خالد المنصوري',
    patientGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    unitId: 'DIN-W2026-0942-RBC',
    unitNumber: '=W0422 26 10942 00',
    unitGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (+)', displayEn: 'A Positive' },
    componentType: 'packed_red_blood_cells',
    method: 'serologic_immediate_spin',
    methodDisplayAr: 'تطابق مصلي فوري (Immediate Spin Crossmatch)',
    result: 'compatible',
    testedAt: 'اليوم 09:28 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    verifierName: 'د. سامية المهيدب',
    isSpecialRequirementSatisfied: true,
    satisfiedRequirementsList: ['مطابقة فصيلة A+', 'فلترة الكريات البيضاء (Leukoreduced)']
  },

  // Scenario B: AHG Crossmatch with Anti-Kell
  {
    id: 'CMP-2026-703',
    requestId: 'BPR-2026-802',
    sampleId: 'SMP-BT-9042',
    patientId: 'p2',
    patientMrn: 'MRN-88422',
    patientName: 'عبد الله بن فيصل الزهراني',
    patientGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    unitId: 'DIN-W2026-0943-RBC',
    unitNumber: '=W0422 26 10943 00',
    unitGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    componentType: 'packed_red_blood_cells',
    method: 'antiglobulin_crossmatch_ahg',
    methodDisplayAr: 'تطابق بأضداد الجلوبيولين البشري (AHG / Coombs Crossmatch)',
    result: 'compatible',
    testedAt: 'اليوم 09:05 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    verifierName: 'د. سامية المهيدب',
    isSpecialRequirementSatisfied: true,
    satisfiedRequirementsList: [
      'تطابق كامل في طور AHG (سلبي بدون تراص)',
      'سالب لمستضد Kell (K-negative confirmed)',
      'مطابقة فينوتيبية مخصصة'
    ]
  },
  {
    id: 'CMP-2026-704',
    requestId: 'BPR-2026-802',
    sampleId: 'SMP-BT-9042',
    patientId: 'p2',
    patientMrn: 'MRN-88422',
    patientName: 'عبد الله بن فيصل الزهراني',
    patientGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    unitId: 'DIN-W2026-0944-RBC',
    unitNumber: '=W0422 26 10944 00',
    unitGroup: { abo: 'O', rh: 'positive', displayAr: 'O موجب (+)', displayEn: 'O Positive' },
    componentType: 'packed_red_blood_cells',
    method: 'antiglobulin_crossmatch_ahg',
    methodDisplayAr: 'تطابق بأضداد الجلوبيولين البشري (AHG / Coombs Crossmatch)',
    result: 'compatible',
    testedAt: 'اليوم 09:08 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    verifierName: 'د. سامية المهيدب',
    isSpecialRequirementSatisfied: true,
    satisfiedRequirementsList: [
      'تطابق كامل في طور AHG (سلبي بدون تراص)',
      'سالب لمستضد Kell (K-negative confirmed)',
      'مطابقة فينوتيبية مخصصة'
    ]
  },

  // Scenario C: Emergency Uncrossmatched
  {
    id: 'CMP-2026-705',
    requestId: 'BPR-2026-803',
    sampleId: 'SMP-BT-9043',
    patientId: 'p3',
    patientMrn: 'MRN-99103',
    patientName: 'مجهول الهوية #12 (مصاب حادث سيارة)',
    patientGroup: { abo: 'A', rh: 'positive', displayAr: 'A موجب (تم التأكيد لاحقاً)', displayEn: 'A Positive (Confirmed Later)' },
    unitId: 'DIN-W2026-0945-RBC',
    unitNumber: '=W0422 26 10945 00',
    unitGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (-)', displayEn: 'O Negative' },
    componentType: 'packed_red_blood_cells',
    method: 'emergency_uncrossmatched',
    methodDisplayAr: 'صرف طارئ غير متوافق بتفويض استشاري (Emergency Uncrossmatched)',
    result: 'emergency_uncrossmatched_released',
    testedAt: 'اليوم 10:22 ص',
    technologistName: 'أخصائية مختبر لمياء الدخيل',
    verifierName: 'د. فيصل الشمري (طلب وتفويض استشاري الطوارئ)',
    isSpecialRequirementSatisfied: false,
    satisfiedRequirementsList: ['صرف طارئ لوحدة O سالب منقذة للحياة قبل اكتمال التطابق المصلي'],
    notes: 'تم أخذ عينة دم قبل الصرف وبدء الفحوصات التأكيدية والتوافق اللاحق بالتوازي'
  }
];

// ----------------------------------------------------------------------------
// 7. MOCK ISSUE RECORDS
// ----------------------------------------------------------------------------
export const INITIAL_ISSUE_RECORDS: ProductIssueRecord[] = [
  {
    id: 'ISS-2026-501',
    requestId: 'BPR-2026-801',
    unitId: 'DIN-W2026-0941-RBC',
    unitNumber: '=W0422 26 10941 00',
    patientId: 'p1',
    patientName: 'سارة خالد المنصوري',
    patientMrn: 'MRN-88421',
    destinationLocation: 'جناح الباطنة 4A - سرير 12',
    issuedAt: 'اليوم 10:15 ص',
    issuingTechnologist: 'أخصائي مختبر بدر العتيبي',
    receivingStaffName: 'ممرضة ندى الحربي',
    receivingStaffRole: 'تمريض جناح الباطنة',
    handoffMethod: 'clinical_nurse_pickup',
    transportCarrierId: 'صندوق نقل عازل ومبرد #T02',
    coldChainIndicatorConfirmed: true,
    returnWindowNotice: 'يجب بدء نقل الدم خلال 30 دقيقة أو إعادة الوحدة فوراً إذا تأجل الإعطاء',
    issueStatus: 'acknowledged_at_unit'
  },
  {
    id: 'ISS-2026-502',
    requestId: 'BPR-2026-803',
    unitId: 'DIN-W2026-0945-RBC',
    unitNumber: '=W0422 26 10945 00',
    patientId: 'p3',
    patientName: 'مجهول الهوية #12 (مصاب حادث سيارة)',
    patientMrn: 'MRN-99103',
    destinationLocation: 'طوارئ الحوادث ER - Resus-1',
    issuedAt: 'اليوم 10:25 ص',
    issuingTechnologist: 'أخصائية مختبر لمياء الدخيل',
    receivingStaffName: 'ممرض فهد الشهري',
    receivingStaffRole: 'تمريض طوارئ الحوادث',
    handoffMethod: 'emergency_transfusion_runner',
    transportCarrierId: 'حقيبة الطوارئ المعزولة الفورية #EM-01',
    coldChainIndicatorConfirmed: true,
    returnWindowNotice: 'استخدام فوري بغرفة الإنعاش',
    issueStatus: 'issued_in_transit'
  }
];

// ----------------------------------------------------------------------------
// 8. MOCK PRODUCT RETURNS & DISPOSITION RECORDS
// ----------------------------------------------------------------------------
export const INITIAL_PRODUCT_RETURNS: ProductReturnRecord[] = [
  // Scenario E: Unit returned from OR delayed surgery
  {
    id: 'RET-2026-301',
    unitId: 'DIN-W2026-0947-RBC',
    unitNumber: '=W0422 26 10947 00',
    patientId: 'p5',
    patientMrn: 'MRN-88425',
    issuedAt: 'أمس 02:30 م',
    returnedAt: 'أمس 02:52 م',
    elapsedMinutesOutsideFridge: 22,
    returnedByStaff: 'ممرض العمليات تركي الدوسري',
    receivedByTechnologist: 'أخصائي مختبر بدر العتيبي',
    reason: 'transfusion_delayed_procedure',
    bagIntegrityChecked: true,
    portNotPunctured: true,
    temperatureIndicatorOk: true,
    dispositionOutcome: 'returned_to_available_inventory',
    dispositionNotes: 'تم فحص مؤشر سلسلة التبريد وسالمة التغليف؛ الوحدة لم تفتح والحرارة أقل من 6°C؛ صالحة لإعادة التخصيص والمخزون وفق سياسة الـ 30 دقيقة.',
    dispositionAuthorizer: 'د. سامية المهيدب (استشارية بنك الدم)'
  }
];

// ----------------------------------------------------------------------------
// 9. MOCK TRANSFUSION REACTION INVESTIGATION CASES
// ----------------------------------------------------------------------------
export const INITIAL_REACTION_CASES: TransfusionReactionCase[] = [
  // Scenario F: Suspected Acute Febrile / Hemolytic Reaction in ICU
  {
    id: 'RXN-2026-012',
    patientId: 'p6',
    patientName: 'نورة سليمان الدوسري',
    patientNameEn: 'Noura Sulaiman Al-Dossari',
    patientMrn: 'MRN-88426',
    locationWardBed: 'العناية المركزة الجراحية SICU - سرير 02',
    transfusionEventRef: 'TX-EVENT-2026-9049',
    unitId: 'DIN-W2026-0949-RBC',
    unitNumber: '=W0422 26 10949 00',
    componentType: 'packed_red_blood_cells',
    reportedAt: 'اليوم 08:30 ص',
    reportedByClinician: 'د. حسام السعيد',
    reportedRole: 'أخصائي أول عناية مركزة',
    severity: 'severe_life_threatening',
    suspectedType: 'acute_hemolytic',
    clinicalSymptoms: [
      'ارتفاع مفاجئ في الحرارة من 37.1°C إلى 39.2°C خلال 20 دقيقة من بدء النقل',
      'قشعريرة شديدة وهبوط في ضغط الدم إلى 82/50 mmHg',
      'تغير لون البول عبر القسطرة إلى لون داكن يشبه الشاي (اشتباه بيلة هيموجلوبينية)',
      'تسارع نبض القلب 125 bpm'
    ],
    transfusionActionTaken: 'transfusion_stopped_immediately',
    investigationStatus: 'testing_underway',

    // Blood Bank Checks
    clericalCheckConfirmed: true,
    clericalCheckNotes: 'فحص التطابق الكتابي مكتمل: اسم المريض، الرقم الطبي، كود الوحدة، والفصيلة متطابقة تماماً مع سجلات الصرف وملف العناية',
    postReactionSampleReceived: true,
    postReactionSampleId: 'SMP-RXN-9049-POST',
    returnedUnitBagReceived: true,

    // Testing Findings
    repeatPatientGroupMatch: true,
    repeatUnitGroupMatch: true,
    directAntiglobulinTestDAT: 'positive_igg',
    freeHemoglobinInSerumUrine: 'present_hemolysis',
    bloodCultureFromUnit: 'pending',

    conclusionSummary: 'اشتباه قوي بتفاعل انحلالي مناعي حاد؛ تم إيقاف النقل فوراً والبدء في بروتوكول حماية الكلى، جاري استكمال زرع الدم وتحديد الأضداد الخفية مع استشاري طب نقل الدم.',
    specialistConsultant: 'د. سامية المهيدب'
  }
];

// ----------------------------------------------------------------------------
// 10. MOCK PRODUCT TRACEABILITY TIMELINES
// ----------------------------------------------------------------------------
export const INITIAL_PRODUCT_TRACEABILITY: Record<string, ProductTraceabilityEvent[]> = {
  'DIN-W2026-0941-RBC': [
    {
      id: 'TRC-101',
      unitId: 'DIN-W2026-0941-RBC',
      timestamp: '2026-08-20 14:00',
      eventType: 'received_into_inventory',
      eventTitleAr: 'استلام الوحدة من بنك الدم المركزي',
      eventTitleEn: 'Received into Blood Bank Inventory',
      actorName: 'فني الاستلام عادل الصالح',
      actorRole: 'فني بنك دم',
      location: 'صيدلية ومشتقات الدم المركزية',
      details: 'تم استلام كيس الكريات المكدسة بحالة تبريد مطابقة والتأكد من الباركود ISBT-128'
    },
    {
      id: 'TRC-102',
      unitId: 'DIN-W2026-0941-RBC',
      timestamp: '2026-08-20 14:15',
      eventType: 'placed_in_storage',
      eventTitleAr: 'إيداع الوحدة في ثلاجة الحفظ',
      eventTitleEn: 'Stored in Monitored Fridge',
      actorName: 'فني الاستلام عادل الصالح',
      actorRole: 'فني بنك دم',
      location: 'ثلاجة بنك الدم 1 - الرف A1',
      details: 'درجة حرارة الثلاجة مضبوطة ومراقبة مستمرة عند 3.5°C'
    },
    {
      id: 'TRC-103',
      unitId: 'DIN-W2026-0941-RBC',
      timestamp: 'اليوم 09:25 ص',
      eventType: 'compatibility_verified',
      eventTitleAr: 'إجراء فحص التوافق والمطابقة المصلية',
      eventTitleEn: 'Serologic Crossmatch Verified',
      actorName: 'أخصائي مختبر بدر العتيبي',
      actorRole: 'أخصائي طب نقل الدم',
      location: 'مختبر فحص التوافق',
      details: 'توافق كامل دون تراص مع مصل المريضة سارة المنصوري (MRN-88421)'
    },
    {
      id: 'TRC-104',
      unitId: 'DIN-W2026-0941-RBC',
      timestamp: 'اليوم 09:30 ص',
      eventType: 'allocated_to_patient',
      eventTitleAr: 'تخصيص الوحدة للطلب الطبي',
      eventTitleEn: 'Allocated to Patient Request',
      actorName: 'أخصائي مختبر بدر العتيبي',
      actorRole: 'أخصائي طب نقل الدم',
      location: 'ثلاجة الوحدات المحجوزة',
      details: 'تم ربط الوحدة مع الطلب BPR-2026-801 وطباعة بطاقة المطابقة'
    },
    {
      id: 'TRC-105',
      unitId: 'DIN-W2026-0941-RBC',
      timestamp: 'اليوم 10:15 ص',
      eventType: 'issued_to_clinical_ward',
      eventTitleAr: 'صرف الوحدة وتسليمها لتمريض الجناح',
      eventTitleEn: 'Issued and Released to Ward Staff',
      actorName: 'أخصائي مختبر بدر العتيبي',
      actorRole: 'أخصائي طب نقل الدم',
      location: 'نافذة تسليم مشتقات الدم',
      details: 'تسليم الوحدة للممرضة ندى الحربي داخل صندوق مبرد #T02 لجناح الباطنة 4A'
    }
  ]
};

// ----------------------------------------------------------------------------
// 11. INITIAL METRICS
// ----------------------------------------------------------------------------
export const INITIAL_BLOOD_BANK_METRICS: BloodBankMetrics = {
  incomingRequestsCount: 8,
  statEmergencyRequestsCount: 2,
  pendingTestingCount: 2,
  crossmatchCompletedCount: 5,
  readyForIssueCount: 3,
  activeAllocationsCount: 6,
  activeEmergencyReleasesCount: 2,
  activeReactionInvestigationsCount: 1,
  returnedUnitsPendingDispositionCount: 1,
  unitsNearExpiryCount: 2,
  totalAvailableRbcUnits: 28,
  totalAvailablePlateletUnits: 6,
  totalAvailableFfpUnits: 24,
  totalAvailableCryoUnits: 14
};

// ----------------------------------------------------------------------------
// 12. EXPORTED ALIASES & COMPATIBILITY ARRAYS FOR SHELL & WORKSPACES
// ----------------------------------------------------------------------------
export const mockBloodProductRequests = INITIAL_BLOOD_REQUESTS;
export const mockPreTransfusionSamples = INITIAL_PRETRANSFUSION_SAMPLES;
export const mockBloodGroupTypingResults = INITIAL_BLOOD_GROUP_TESTS;
export const mockAntibodyScreenResults = INITIAL_ANTIBODY_SCREENS;
export const mockCompatibilityRecords = INITIAL_COMPATIBILITY_RECORDS;
export const mockBloodProductUnits = INITIAL_PRODUCT_UNITS;
export const mockProductReturnRecords = INITIAL_PRODUCT_RETURNS;
export const mockTransfusionReactionCases = INITIAL_REACTION_CASES;
export const mockProductIssueRecords = INITIAL_ISSUE_RECORDS;
export const mockTraceabilityEvents = INITIAL_PRODUCT_TRACEABILITY;

export const mockBloodBankOperationalMetrics: BloodBankOperationalMetrics = {
  pendingRequestsCount: 8,
  statRequestsCount: 2,
  pendingSamplesCount: 2,
  crossmatchInProgressCount: 3,
  readyForIssueCount: 4,
  availableUnitsCount: 48,
  activeReactionsUnderInvestigation: 1
};

export const mockMtpSessions: MassiveTransfusionProtocolSession[] = [
  {
    id: 'MTP-2026-001',
    patientId: 'p8',
    patientName: 'أحمد صالح الغامدي',
    patientMrn: 'MRN-88428',
    location: 'طوارئ الحوادث ER - غرفة الرضوح الحادة Trauma-A',
    activatedAt: 'اليوم 10:45 ص',
    activatedByClinician: 'د. يوسف التميمي (استشاري جراحة الحوادث)',
    clinicalIndication: 'صدمة نزفية غير مستجيبة مع هبوط الضغط وخلل التخثر الاستهلاكي (TIC) إثر حادث سير مروع',
    currentPackNumber: 1,
    status: 'active',
    prbcUnitsIssued: 4,
    ffpUnitsIssued: 2,
    plateletUnitsIssued: 1,
    cryoUnitsIssued: 0
  }
];

export const mockBloodBankScenarios: BloodBankDemoScenario[] = [
  {
    id: 'scenario_a',
    scenarioCode: 'scenario_a',
    titleAr: 'السيناريو A: طلب روتيني لكريات دم حمراء (Routine RBC Transfusion)',
    titleEn: 'Scenario A: Routine RBC Transfusion',
    patientMrn: 'MRN-88421',
    patientName: 'سارة خالد المنصوري',
    clinicalContext: 'مريضة باطنة تعاني من فقر دم حاد (Hb 6.8 g/dL) مع دوخة وخفقان؛ طلب روتيني لوحدتين كريات حمر.',
    bloodBankCategory: 'Inpatient Ward',
    keyEducationalConcept: 'فصل الطلب الطبي عن العينة وعن التوافق وعن التخصيص والصرف',
    recommendedTab: 'requests',
    targetRequestId: 'BPR-2026-801',
    targetSampleId: 'SMP-BT-9041',
    targetUnitId: 'DIN-W2026-0941-RBC'
  },
  {
    id: 'scenario_b',
    scenarioCode: 'scenario_b',
    titleAr: 'السيناريو B: مسح أضداد إيجابي وتحديد جسم مضاد (Positive Antibody Screen - Anti-Kell)',
    titleEn: 'Scenario B: Positive Antibody Screen (Anti-Kell)',
    patientMrn: 'MRN-88422',
    patientName: 'عبد الله بن فيصل الزهراني',
    clinicalContext: 'مريض أورام منقول له دم متكرر؛ نتيجة مسح الأضداد إيجابية 3+ وتم تحديد Anti-Kell واختيار وحدات سالبة للمستضد.',
    bloodBankCategory: 'Immunohematology',
    keyEducationalConcept: 'الأجسام المضادة غير المتوقعة تتطلب بحث مستضدي ومطابقة AHG كاملة',
    recommendedTab: 'antibody',
    targetRequestId: 'BPR-2026-802',
    targetSampleId: 'SMP-BT-9042',
    targetUnitId: 'DIN-W2026-0943-RBC'
  },
  {
    id: 'scenario_c',
    scenarioCode: 'scenario_c',
    titleAr: 'السيناريو C: صرف طارئ غير متوافق لإنقاذ حياة (Emergency Uncrossmatched Release)',
    titleEn: 'Scenario C: Emergency Uncrossmatched Release',
    patientMrn: 'MRN-88423',
    patientName: 'مجهول الهوية #402 (صدمة نزفية - ER)',
    clinicalContext: 'مصاب حادث مروري في غرفة الإنعاش بصدمة نزفية حادة مهددة للحياة؛ صرف طارئ لوحدات O سالب بتفويض استشاري الطوارئ.',
    bloodBankCategory: 'Trauma & Resuscitation',
    keyEducationalConcept: 'الصرف الطارئ يتطلب تفويضاً صريحاً وسحب عينة بالتوازي دون انتظار اكتمال التوافق',
    recommendedTab: 'crossmatch',
    targetRequestId: 'BPR-2026-803',
    targetSampleId: 'SMP-BT-9043',
    targetUnitId: 'DIN-W2026-0951-RBC'
  },
  {
    id: 'scenario_d',
    scenarioCode: 'scenario_d',
    titleAr: 'السيناريو D: طلب صفائح دموية بالفصادة (Apheresis Platelets Request)',
    titleEn: 'Scenario D: Apheresis Platelets Request',
    patientMrn: 'MRN-88424',
    patientName: 'فاطمة عمر القحطاني',
    clinicalContext: 'مريضة نقص صفائح مناعي (ITP) بنزيف مخاطي نشط (صفائح 12k)؛ طلب وحدة صفائح مشععة بالفصادة مع فحص المطابقة المناسب.',
    bloodBankCategory: 'Platelet Therapy',
    keyEducationalConcept: 'الصفائح الدموية لا تتطلب مطابقة مصلية مثل كريات الدم ولكن تراعى شروط الحفظ والتبريد والإشعاع',
    recommendedTab: 'issue_queue',
    targetRequestId: 'BPR-2026-804',
    targetSampleId: 'SMP-BT-9044',
    targetUnitId: 'DIN-W2026-0952-PLT'
  },
  {
    id: 'scenario_e',
    scenarioCode: 'scenario_e',
    titleAr: 'السيناريو E: إرجاع وحدة دم من العمليات وتقرير المصير (Returned Unit & Disposition)',
    titleEn: 'Scenario E: Returned Unit & Disposition',
    patientMrn: 'MRN-88425',
    patientName: 'محمد ناصر الدوسري',
    clinicalContext: 'تأجلت جراحة القولون ولم يُفتح كيس الدم؛ إرجاع الوحدة لبنك الدم والتأكد من سلسلة التبريد (أقل من 30 دقيقة) وإعادتها للمخزون.',
    bloodBankCategory: 'Cold Chain & Returns',
    keyEducationalConcept: 'الوحدة المرتجعة لا تعود للمخزون تلقائياً دون تفتيش فني وتأكيد عدم انتهاك سلسلة التبريد',
    recommendedTab: 'returns',
    targetRequestId: 'BPR-2026-805',
    targetSampleId: 'SMP-BT-9045',
    targetUnitId: 'DIN-W2026-0953-RBC'
  },
  {
    id: 'scenario_f',
    scenarioCode: 'scenario_f',
    titleAr: 'السيناريو F: بلاغ اشتباه تفاعل نقل دم وتحقيق بنك الدم (Transfusion Reaction Investigation)',
    titleEn: 'Scenario F: Transfusion Reaction Investigation',
    patientMrn: 'MRN-88426',
    patientName: 'ريم عبد العزيز الشمري',
    clinicalContext: 'مريضة بالعناية أوقفت ممرضة العناية النقل فوراً لارتفاع الحرارة إلى 39.2°C وهبوط الضغط؛ إجراء التدقيق الكتابي وفحص DAT والتحقيق المخبري.',
    bloodBankCategory: 'Hemovigilance & Safety',
    keyEducationalConcept: 'إيقاف النقل فوراً، التحقق الكتابي العاجل، فحص عينة ما بعد النقل والكيس المرتجع واستشارة طبيب نقل الدم',
    recommendedTab: 'reactions',
    targetRequestId: 'BPR-2026-806',
    targetSampleId: 'SMP-RXN-9049-POST',
    targetUnitId: 'DIN-W2026-0954-RBC'
  },
  {
    id: 'scenario_g',
    scenarioCode: 'scenario_g',
    titleAr: 'السيناريو G: عدم توفر مشتق بمواصفات نادرة وتنسيق سريري (Product Unavailable Coordination)',
    titleEn: 'Scenario G: Product Unavailable & Clinical Strategy Coordination',
    patientMrn: 'MRN-88427',
    patientName: 'خالد مروان السبيعي',
    clinicalContext: 'مريض زراعة نخاع عظمي يحتاج وحدات مغسولة ومشععة خالية من CMV لفصيلة A سالب غير متوفرة محلياً؛ التواصل والتنسيق مع الطبيب وبنك الدم المركزي.',
    bloodBankCategory: 'Inventory Shortage',
    keyEducationalConcept: 'النظام لا يفرض استبدالاً آلياً بل يدعم التنسيق السريري الموثق واختيار البدائل السريرية المعتمدة',
    recommendedTab: 'inventory',
    targetRequestId: 'BPR-2026-807',
    targetSampleId: 'SMP-BT-9047'
  },
  {
    id: 'scenario_h',
    scenarioCode: 'scenario_h',
    titleAr: 'السيناريو H: بروتوكول النقل الهائل للدم في الحوادث (Massive Transfusion Protocol - MTP)',
    titleEn: 'Scenario H: Massive Transfusion Protocol (MTP)',
    patientMrn: 'MRN-88428',
    patientName: 'أحمد صالح الغامدي',
    clinicalContext: 'تفعيل بروتوكول MTP لمريض رضوح حادة مهددة للحياة؛ تجهيز وصرف الجولة الأولى بنسبة 1:1:1 (كريات حمر + بلازما بعد الإذابة + صفائح).',
    bloodBankCategory: 'MTP Trauma Rounds',
    keyEducationalConcept: 'بروتوكول النقل الهائل يعتمد على دفعات منتظمة متوازنة ومحاسبة دقيقة للوحدات المصروفة والمهدرة',
    recommendedTab: 'overview',
    targetRequestId: 'BPR-2026-808',
    targetSampleId: 'SMP-BT-9048',
    targetUnitId: 'DIN-W2026-0961-RBC'
  }
];

// ----------------------------------------------------------------------------
// 12. MULTI-BRANCH INVENTORY DIRECTORY
// ----------------------------------------------------------------------------
export const MOCK_BRANCHES: BloodBankBranch[] = [
  {
    id: 'main_hospital',
    nameAr: 'بنك الدم المركزي - المستشفى الرئيسي',
    nameEn: 'Main Hospital Central Blood Bank Hub',
    code: 'HUB-01',
    isCentralHub: true
  },
  {
    id: 'satellite_clinic_north',
    nameAr: 'بنك دم فرعي - مجمع الشمال الجراحي',
    nameEn: 'North Surgical Complex Satellite Depot',
    code: 'SAT-N02',
    isCentralHub: false
  },
  {
    id: 'trauma_center_east',
    nameAr: 'مستودع طوارئ الرضوح - مركز الشرق',
    nameEn: 'East Trauma Emergency Depot',
    code: 'DEP-E03',
    isCentralHub: false
  }
];

// ----------------------------------------------------------------------------
// 13. PRODUCT RETURN POLICIES
// ----------------------------------------------------------------------------
export const MOCK_PRODUCT_RETURN_POLICIES: ProductReturnPolicy[] = [
  {
    componentType: 'packed_red_blood_cells',
    maxMinutesOutsideControlledStorage: 30,
    acceptableTempRange: '1°C - 10°C (أثناء النقل)',
    storageConditionRequired: 'ثلاجة دم معتمدة 2°C - 6°C',
    policyReference: 'AABB 35th Ed. / Saudi MoH Blood Return SOP v3'
  },
  {
    componentType: 'platelets_apheresis',
    maxMinutesOutsideControlledStorage: 15,
    acceptableTempRange: '20°C - 24°C مع التحريك المستمر',
    storageConditionRequired: 'حاضنة صفائح مع رجاج ميكانيكي',
    policyReference: 'ISBT Platelet Storage Standards'
  },
  {
    componentType: 'fresh_frozen_plasma',
    maxMinutesOutsideControlledStorage: 20,
    acceptableTempRange: '2°C - 6°C بعد الإذابة الكاملة',
    storageConditionRequired: 'صالحة لمدة 24 ساعة فقط بعد الإذابة',
    policyReference: 'WHO Clinical Transfusion Guidelines'
  },
  {
    componentType: 'cryoprecipitate',
    maxMinutesOutsideControlledStorage: 15,
    acceptableTempRange: '20°C - 24°C فور التجميع والإذابة',
    storageConditionRequired: 'صالحة لمدة 4 إلى 6 ساعات فقط',
    policyReference: 'AABB Technical Manual Ch. 15'
  }
];

// ----------------------------------------------------------------------------
// 14. MTP PROTOCOL PROFILES
// ----------------------------------------------------------------------------
export const MOCK_MTP_PROTOCOL_PROFILES: MtpProtocolProfile[] = [
  {
    id: 'adult_trauma_balanced',
    nameAr: 'بروتوكول رضوح البالغين المتوازن (1:1:1 Balanced Trauma)',
    nameEn: 'Adult Trauma Balanced Protocol',
    packRatioDescription: '4 كريات دم حمراء (PRBC) : 4 بلازما مجمدة (FFP) : 1 صفائح دموية فصادة (Platelet)',
    prbcPackRatio: 4,
    ffpPackRatio: 4,
    pltPackRatio: 1,
    cryoRequirement: 'إضافة 10 وحدات Cryo تلقائياً بدءاً من الحزمة رقم 3 إذا كان الفيبرينوجين < 1.5 g/L'
  },
  {
    id: 'obstetric_hemorrhage',
    nameAr: 'بروتوكول النزيف التوليدي الحاد (Postpartum Hemorrhage - PPH)',
    nameEn: 'Major Obstetric Hemorrhage Protocol',
    packRatioDescription: '4 كريات دم حمراء O-Salb/A-Salb + 4 بلازما طازجة + إضافة فورية للراسب البرودي (Cryo)',
    prbcPackRatio: 4,
    ffpPackRatio: 4,
    pltPackRatio: 1,
    cryoRequirement: 'إعطاء مبكر لـ 10-20 وحدة كرايو لتعويض الفيبرينوجين بسرعة فائقة'
  },
  {
    id: 'pediatric_massive',
    nameAr: 'بروتوكول النقل الهائل للأطفال (Pediatric Massive Transfusion)',
    nameEn: 'Pediatric Massive Transfusion Protocol',
    packRatioDescription: 'وحدات مفلترة ومشععة بحجم 10-20 mL/kg متناسبة طردياً مع وزن الطفل',
    prbcPackRatio: 2,
    ffpPackRatio: 2,
    pltPackRatio: 1,
    cryoRequirement: '5-10 mL/kg كرايو حسب مؤشرات التخثر'
  }
];

// ----------------------------------------------------------------------------
// 15. RETROSPECTIVE TESTING QUEUE (GAP-02)
// ----------------------------------------------------------------------------
export const MOCK_RETROSPECTIVE_TESTING_QUEUE: RetrospectiveTestingRecord[] = [
  {
    id: 'RETRO-2026-001',
    emergencyReleaseId: 'EMG-REL-803',
    requestId: 'BPR-2026-803',
    patientId: 'p3',
    patientMrn: 'MRN-99103',
    patientName: 'مجهول الهوية #12 (مصاب حادث سيارة)',
    releasedUnitIds: ['DIN-W2026-0945-RBC', 'DIN-W2026-0946-RBC'],
    status: 'pending',
    startedAt: 'اليوم 10:25 ص',
    technologistName: 'أخصائية مختبر لمياء الدخيل',
    urgentAlertBroadcasted: false
  },
  {
    id: 'RETRO-2026-002',
    emergencyReleaseId: 'EMG-REL-808',
    requestId: 'BPR-2026-808',
    patientId: 'p8',
    patientMrn: 'MRN-88428',
    patientName: 'أحمد صالح الغامدي (MTP)',
    releasedUnitIds: ['DIN-W2026-0961-RBC', 'DIN-W2026-0962-RBC'],
    status: 'pending',
    startedAt: 'اليوم 10:48 ص',
    technologistName: 'أخصائي مختبر بدر العتيبي',
    urgentAlertBroadcasted: false
  }
];

// ----------------------------------------------------------------------------
// 16. LOOKBACK & RECALL INVESTIGATIONS (GAP-07)
// ----------------------------------------------------------------------------
export const MOCK_LOOKBACK_INVESTIGATIONS: LookbackInvestigationRecord[] = [
  {
    id: 'LK-2026-001',
    donationId: 'W0422 25 881920',
    triggerSource: 'regional_blood_center_notification',
    triggerDate: '2026-09-18',
    donorTestFinding: 'تأكيد إيجابية HCV-RNA في تبرع لاحق للمتبرع من بنك الدم الإقليمي',
    affectedUnitIds: ['DIN-W2026-0811-RBC', 'DIN-W2026-0812-FFP', 'DIN-W2026-0813-PLT'],
    investigationOwner: 'د. فيصل الشمري (استشاري نقل الدم ورئيس لجنة السلامة)',
    status: 'recipients_traced',
    recipientsIdentifiedCount: 2,
    unitsInStorageQuarantinedCount: 1,
    unitsAlreadyTransfusedCount: 2,
    notificationsAttemptedCount: 2,
    notificationsDeliveredCount: 2,
    notes: 'تم عزل كيس البلازما المتبقي في الحجر التحقيقي فوراً. تم إشعار الأطباء المعالجين للمريضين المنقول لهما كريات الدم والصفائح لمتابعة الفحص المصلي وتقديم المشورة الطبية.'
  },
  {
    id: 'LK-2026-002',
    donationId: 'W0422 26 104200',
    triggerSource: 'post_donation_illness_report',
    triggerDate: '2026-09-19',
    donorTestFinding: 'إبلاغ المتبرع عن ظهور أعراض حمى وضنك بعد يومين من التبرع',
    affectedUnitIds: ['DIN-W2026-0991-RBC', 'DIN-W2026-0992-FFP'],
    investigationOwner: 'أخصائي أول جودة بنك الدم خالد العريان',
    status: 'units_located',
    recipientsIdentifiedCount: 0,
    unitsInStorageQuarantinedCount: 2,
    unitsAlreadyTransfusedCount: 0,
    notificationsAttemptedCount: 0,
    notificationsDeliveredCount: 0,
    notes: 'تم حجز كافة المشتقات المصنوعة من هذا التبرع في ثلاجة العزل الوقائي قبل الصرف السريري، وتم منع تسليمها.'
  }
];

// ----------------------------------------------------------------------------
// 17. BIOHAZARD DESTRUCTION & WASTE RECORDS (GAP-04)
// ----------------------------------------------------------------------------
export const MOCK_DESTRUCTION_RECORDS: UnitDestructionRecord[] = [
  {
    id: 'DST-2026-041',
    unitId: 'DIN-W2026-0710-RBC',
    unitNumber: '=W0422 26 07100 00',
    componentType: 'packed_red_blood_cells',
    bloodGroupDisplay: 'B سالب (-)',
    reason: 'expired',
    reasonDetails: 'انتهاء فترة الصلاحية النظامية (42 يوماً مع مانع التخثر SAGM) دون طلب مطابق',
    productCondition: 'سليم وغير مثقوب لكن انتهت صلاحيته البيولوجية',
    authorizedBy: 'د. فيصل الشمري (استشاري نقل الدم)',
    witnessName: 'ممرضة عواطف السعدون',
    witnessRole: 'مشرفة التمريض السريري',
    destroyedAt: '2026-09-19 09:15 ص',
    methodOfDisposal: 'biohazard_incineration'
  },
  {
    id: 'DST-2026-042',
    unitId: 'DIN-W2026-0822-PLT',
    unitNumber: '=W0422 26 08220 00',
    componentType: 'platelets_apheresis',
    bloodGroupDisplay: 'O موجب (+)',
    reason: 'severe_cold_chain_excursion',
    reasonDetails: 'تعرض لحرارة منخفضة جداً بالخطأ تسببت بتخثر وتلف الصفائح أثناء النقل الخارجي',
    productCondition: 'تكتل ميكانيكي ملحوظ وترسب غير طبيعي',
    authorizedBy: 'أخصائي مختبر بدر العتيبي',
    witnessName: 'فني مختبر حمود الصالح',
    witnessRole: 'فني بنك الدم المساعد',
    destroyedAt: '2026-09-18 04:30 م',
    methodOfDisposal: 'autoclave_waste'
  }
];

// ----------------------------------------------------------------------------
// 18. CONSOLIDATED B01 - B30 AUDIT SCENARIO DEFINITIONS
// ----------------------------------------------------------------------------
export const SCENARIOS_B01_B30 = [
  { id: 'B01', code: 'B01', titleAr: 'طلب روتيني لكريات دم حمراء وتوافق متبادل كامل', category: 'Routine RBC', tab: 'incoming_requests' },
  { id: 'B02', code: 'B02', titleAr: 'صرف طارئ غير متوافق لإنقاذ حياة ومتابعة الفحص الرجعي', category: 'Emergency Release', tab: 'compatibility' },
  { id: 'B03', code: 'B03', titleAr: 'اشتباه عدم تطابق هوية المريض وإيقاف الصرف الفوري', category: 'Patient Safety', tab: 'samples' },
  { id: 'B04', code: 'B04', titleAr: 'عينة دم للمريض الخطأ (WBIT) وإجراءات إعادة السحب', category: 'Specimen Integrity', tab: 'samples' },
  { id: 'B05', code: 'B05', titleAr: 'عينة غير مطابقة للشروط أو بدون ملصق كامل', category: 'Rejection Workflow', tab: 'samples' },
  { id: 'B06', code: 'B06', titleAr: 'عينة مرفوضة لتحللها مع إصدار طلب إعادة سحب عاجل', category: 'Sample Rejection', tab: 'samples' },
  { id: 'B07', code: 'B07', titleAr: 'تناقض بين الفحص الأمامي والعكسي لفصائل الدم ABO', category: 'Typing Discrepancy', tab: 'grouping_typing' },
  { id: 'B08', code: 'B08', titleAr: 'تناقض الفصيلة الحالية مع السجل التاريخي للمريض', category: 'Historical Mismatch', tab: 'grouping_typing' },
  { id: 'B09', code: 'B09', titleAr: 'مسح أضداد إيجابي يتطلب إجراءات تشخيصية ممتدة', category: 'Antibody Screen', tab: 'antibody_screen' },
  { id: 'B10', code: 'B10', titleAr: 'تحديد الجسم المضاد غير المتوقع (Anti-Kell)', category: 'Immunohematology', tab: 'antibody_screen' },
  { id: 'B11', code: 'B11', titleAr: 'اختيار وحدات سالبة للمستضد المعني ومطابقتها', category: 'Antigen Matching', tab: 'compatibility' },
  { id: 'B12', code: 'B12', titleAr: 'تقييم أهلية التوافق الإلكتروني وفق المعايير الدولية', category: 'Electronic Crossmatch', tab: 'compatibility' },
  { id: 'B13', code: 'B13', titleAr: 'توافق سريع بالطرد المركزي الفوري (Immediate Spin)', category: 'Crossmatch Method', tab: 'compatibility' },
  { id: 'B14', code: 'B14', titleAr: 'توافق متبادل كامل بأضداد الجلوبيولين البشري (AHG Crossmatch)', category: 'AHG Testing', tab: 'compatibility' },
  { id: 'B15', code: 'B15', titleAr: 'عدم توافق متبادل وحظر الوحدة والتنسيق مع الطبيب', category: 'Incompatibility', tab: 'compatibility' },
  { id: 'B16', code: 'B16', titleAr: 'انحراف سلسلة التبريد وحجر المشتق الفوري (Cold-chain excursion and quarantine)', category: 'Cold Chain Excursion', tab: 'returns_disposition' },
  { id: 'B17', code: 'B17', titleAr: 'وحدة دم منتهية الصلاحية أو تالفة وإجراءات العزل والإتلاف (Expired or damaged blood unit)', category: 'Damaged/Expired Unit', tab: 'inventory_context' },
  { id: 'B18', code: 'B18', titleAr: 'وحدة دم غير مطابقة عند التحقق بسرير المريض مع إيقاف/إرجاع (Wrong blood unit at bedside verification)', category: 'Bedside Verification', tab: 'returns_disposition' },
  { id: 'B19', code: 'B19', titleAr: 'بدء نقل الدم وتوقفه بسبب إشكالية سريرية وإشعار بنك الدم (Transfusion started and interrupted)', category: 'Interrupted Transfusion', tab: 'reactions_investigation' },
  { id: 'B20', code: 'B20', titleAr: 'اشتباه تفاعل نقل دم وبدء التحقيق وحجر البقايا (Suspected transfusion reaction)', category: 'Suspected Reaction', tab: 'reactions_investigation' },
  { id: 'B21', code: 'B21', titleAr: 'التحقق الثنائي عند تسليم وصرف مشتق الدم للقسم', category: 'Issue & Handoff', tab: 'ready_issue' },
  { id: 'B22', code: 'B22', titleAr: 'إرجاع وحدة دم سليمة ضمن نافذة 30 دقيقة وقبولها بالمخزون', category: 'Product Returns', tab: 'returns_disposition' },
  { id: 'B23', code: 'B23', titleAr: 'عزل وحدة مرتجعة تجاوزت وقت الأمان أو شك بحرارتها', category: 'Quarantine Action', tab: 'returns_disposition' },
  { id: 'B24', code: 'B24', titleAr: 'تفعيل بروتوكول النقل الهائل للدم (MTP) لرضوح حادة', category: 'MTP Activation', tab: 'operational_home' },
  { id: 'B25', code: 'B25', titleAr: 'صرف الحزمة الثانية المتوازنة لمتابعة إنعاش النزيف', category: 'MTP Replenishment', tab: 'operational_home' },
  { id: 'B26', code: 'B26', titleAr: 'إيقاف وإنهاء بروتوكول MTP واستعادة الوحدات غير المستخدمة', category: 'MTP Deactivation', tab: 'operational_home' },
  { id: 'B27', code: 'B27', titleAr: 'التحقيق في اشتباه تفاعل انحلال دموي حاد ودرجة السببية', category: 'Hemovigilance', tab: 'reactions_investigation' },
  { id: 'B28', code: 'B28', titleAr: 'تفاعل حموي غير انحلالي وتوثيق سجل التواصل السريري', category: 'Adverse Event', tab: 'reactions_investigation' },
  { id: 'B29', code: 'B29', titleAr: 'تتبع استعادي وسحب المشتقات المصابة (Lookback & Recall)', category: 'Traceability', tab: 'inventory_context' },
  { id: 'B30', code: 'B30', titleAr: 'إتلاف نفايات حيوية لوحدة تالفة مع توثيق الشاهد', category: 'Waste Tracking', tab: 'inventory_context' }
];
