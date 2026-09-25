// ============================================================================
// HIS — HEALTH INFORMATION MANAGEMENT (HIM) (MOCK DATA FIXTURES)
// Standards: HL7 FHIR R5, Saudi CBAHI Medical Records, Saudi PDPL Health Safeguards,
// WHO ICD-11 & NPHIES Financial Classification Profile (ICD-10-AM)
// Synthetic Operations Preview — UI/UX Only
// ============================================================================

import {
  HimOpsState,
  ClassificationProfileReference,
  MedicalRecordCase,
  RecordDocumentReference,
  DocumentationDeficiency,
  CodingCase,
  CodingQuery,
  ReleaseOfInformationRequest,
  DisclosureLogEntry,
  RetentionPolicyReference,
  LegalHoldRecord,
  RecordIntegrityException,
  ScannedExternalDocument,
  CodingReviewRecord,
  HimPersona,
  HospitalConfigurableCompletionPolicy
} from '../types/himOps';

export const INITIAL_CLASSIFICATION_PROFILES: ClassificationProfileReference[] = [
  {
    profileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
    nameAr: 'ملف التصنيف والترميز المالي لمنصة نفيس (NPHIES ICD-10-AM)',
    nameEn: 'Saudi NPHIES Financial Claim Classification Profile (ICD-10-AM)',
    codeSystem: 'ICD-10-AM',
    versionRelease: '10th Edition / NPHIES 2024.1',
    jurisdiction: 'SAUDI_NPHIES',
    purpose: 'financial_claim_profile',
    effectivePeriod: '2023-01-01 to Present',
    status: 'active',
    isPayerMandated: true
  },
  {
    profileId: 'WHO_ICD11_MMS',
    nameAr: 'نظام التصنيف الدولي للأمراض - الإصدار الحادي عشر (WHO ICD-11)',
    nameEn: 'WHO International Classification of Diseases 11th Revision (MMS)',
    codeSystem: 'ICD-11-MMS',
    versionRelease: 'v2024-01 Release',
    jurisdiction: 'WHO_GLOBAL',
    purpose: 'clinical_statistics',
    effectivePeriod: '2022-02-01 to Present',
    status: 'active',
    isPayerMandated: false
  },
  {
    profileId: 'ICD10_WHO_2019',
    nameAr: 'التصنيف الدولي للأمراض - الإصدار العاشر لمنظمة الصحة العالمية',
    nameEn: 'WHO International Classification of Diseases 10th Revision (2019)',
    codeSystem: 'ICD-10-WHO',
    versionRelease: '2019 Standard',
    jurisdiction: 'WHO_GLOBAL',
    purpose: 'mortality_reporting',
    effectivePeriod: '2019-01-01 to Present',
    status: 'active',
    isPayerMandated: false
  },
  {
    profileId: 'ACHI_SAUDI_PROCEDURES',
    nameAr: 'التصنيف الأسترالي للتدخلات الصحية (ACHI Procedures)',
    nameEn: 'Australian Classification of Health Interventions (ACHI)',
    codeSystem: 'ACHI',
    versionRelease: '10th Edition',
    jurisdiction: 'SAUDI_NPHIES',
    purpose: 'financial_claim_profile',
    effectivePeriod: '2023-01-01 to Present',
    status: 'active',
    isPayerMandated: true
  }
];

export const INITIAL_RECORD_DOCUMENTS: RecordDocumentReference[] = [
  {
    id: 'DOC-REC-01',
    encounterId: 'ENC-2026-ER-091',
    patientId: 'P-101',
    patientName: 'عبد الله بن سعيد الشهري',
    mrn: 'MRN-789012',
    documentType: 'Emergency Cardiology Assessment',
    titleAr: 'ملاحظة تقييم متلازمة الشريان التاجي الحادة (ACS)',
    titleEn: 'Emergency Cardiology Assessment Note',
    authorName: 'د. طارق المنشاوي',
    authorRole: 'استشاري طب الطوارئ',
    authorDepartment: 'قسم الطوارئ والحوادث',
    clinicalDate: '2026-09-12',
    createdDate: '2026-09-12 10:15',
    finalizedDate: '2026-09-12 10:40',
    lifecycleState: 'signed',
    referenceState: 'current',
    currentVersionNumber: 1,
    versions: [
      {
        versionNumber: 1,
        savedAt: '2026-09-12 10:40',
        savedBy: 'د. طارق المنشاوي',
        savedByRole: 'Consultant Emergency Medicine',
        title: 'ملاحظة تقييم متلازمة الشريان التاجي الحادة (ACS)',
        contentSnippet: 'تقييم سريري: NSTEMI High Risk. ضغط 148/92، تروبونين 0.18 ng/mL. تم إعطاء الأسبرين والكلوبيدوغريل وتحويل المريض لقسطرة القلب.',
        lifecycleState: 'signed',
        changeType: 'original_created',
        relationshipToPrior: 'النسخة الأصلية المعتمدة والموقعة إلكترونياً'
      }
    ],
    isOriginalPreserved: true,
    isQuarantined: false,
    confidentialityLevel: 'normal',
    contentSnippet: 'تقييم سريري: NSTEMI High Risk. ضغط 148/92، تروبونين 0.18 ng/mL. تم إعطاء الأسبرين والكلوبيدوغريل وتحويل المريض لقسطرة القلب.'
  },
  {
    id: 'DOC-REC-02',
    encounterId: 'ENC-2026-IPD-441',
    patientId: 'P-102',
    patientName: 'مريم بنت عبد الرحمن الغامدي',
    mrn: 'MRN-883921',
    documentType: 'Operative Procedure Note',
    titleAr: 'تقرير العملية الجراحية: استئصال المرارة بالمنظار',
    titleEn: 'Operative Report: Laparoscopic Cholecystectomy',
    authorName: 'د. فيصل السبيعي',
    authorRole: 'أخصائي أول جراحة عامة',
    authorDepartment: 'العمليات الجراحية (OR)',
    clinicalDate: '2026-09-20',
    createdDate: '2026-09-20 14:30',
    finalizedDate: '2026-09-20 15:10',
    lifecycleState: 'preliminary', // Needs attending co-signature!
    referenceState: 'current',
    currentVersionNumber: 1,
    versions: [
      {
        versionNumber: 1,
        savedAt: '2026-09-20 15:10',
        savedBy: 'د. فيصل السبيعي',
        savedByRole: 'Senior Specialist General Surgery',
        title: 'تقرير العملية الجراحية: استئصال المرارة بالمنظار',
        contentSnippet: 'تم إجراء استئصال مرارة بالمنظار لمريضة تعاني من حصوات مرارية مع التهاب مرارة حاد، وصعوبة تشريحية في مثلث كالو مع نزف شعيري تم السيطرة عليه.',
        lifecycleState: 'preliminary',
        changeType: 'original_created',
        relationshipToPrior: 'نسخة أولية بانتظار توقيع الاستشاري المشرف (Co-Signature Required)'
      }
    ],
    isOriginalPreserved: true,
    isQuarantined: false,
    confidentialityLevel: 'normal',
    contentSnippet: 'تم إجراء استئصال مرارة بالمنظار لمريضة تعاني من حصوات مرارية مع التهاب مرارة حاد، وصعوبة تشريحية في مثلث كالو مع نزف شعيري تم السيطرة عليه.'
  },
  {
    id: 'DOC-REC-03',
    encounterId: 'ENC-2026-DS-331',
    patientId: 'P-105',
    patientName: 'فاطمة بنت ناصر الدوسري',
    mrn: 'MRN-552190',
    documentType: 'Operative Report (Amended)',
    titleAr: 'تقرير عملية سحب الساد وزراعة العدسة (معدل)',
    titleEn: 'Phacoemulsification & IOL Implantation Note (Amended)',
    authorName: 'د. هناء العتيبي',
    authorRole: 'استشارية طب وجراحة العيون',
    authorDepartment: 'جراحة اليوم الواحد (Day Surgery)',
    clinicalDate: '2026-09-18',
    createdDate: '2026-09-18 09:00',
    finalizedDate: '2026-09-18 11:30',
    lifecycleState: 'amended',
    referenceState: 'current',
    currentVersionNumber: 2,
    versions: [
      {
        versionNumber: 2,
        savedAt: '2026-09-18 11:30',
        savedBy: 'د. هناء العتيبي',
        savedByRole: 'Consultant Ophthalmologist',
        title: 'تقرير عملية سحب الساد وزراعة العدسة (نسخة معدلة 2)',
        contentSnippet: 'تعديل توثيقي استكمالي: تمت إضافة الرقم التسلسلي الدقيق للعدسة المطوية المزروعة (+21.5 D, Alcon AcrySof SN60WF, S/N: 981120).',
        lifecycleState: 'amended',
        changeType: 'amendment',
        changeReason: 'استكمال بيانات وتفاصيل زرع العدسة المطوية بالعين اليمنى',
        relationshipToPrior: 'تعديل استكمالي للنسخة 1 دون المساس بنص التقرير الأصلي'
      },
      {
        versionNumber: 1,
        savedAt: '2026-09-18 09:45',
        savedBy: 'د. هناء العتيبي',
        savedByRole: 'Consultant Ophthalmologist',
        title: 'تقرير عملية سحب الساد وزراعة العدسة',
        contentSnippet: 'تم إجراء عملية الفاكو بالعين اليمنى بنجاح تحت التخدير الموضعي، وتم زرع عدسة مطوية داخل المحفظة الخلفية دون مضاعفات.',
        lifecycleState: 'signed',
        changeType: 'original_created',
        relationshipToPrior: 'النسخة الأصلية الأولى الموقعة'
      }
    ],
    isOriginalPreserved: true,
    isQuarantined: false,
    confidentialityLevel: 'normal',
    contentSnippet: 'تعديل توثيقي استكمالي: تمت إضافة الرقم التسلسلي الدقيق للعدسة المطوية المزروعة (+21.5 D, Alcon AcrySof SN60WF, S/N: 981120).'
  },
  {
    id: 'DOC-REC-04',
    encounterId: 'ENC-2026-IPD-109',
    patientId: 'P-106',
    patientName: 'سلطان بن إبراهيم الحازمي',
    mrn: 'MRN-334188',
    documentType: 'Clinical Medication Reconciliation',
    titleAr: 'كشف مطابقة أدوية (أدخل خطأً - معزول)',
    titleEn: 'Medication Reconciliation Record (Entered in Error)',
    authorName: 'صيدلي. نورة السديري',
    authorRole: 'صيدلانية سريرية',
    authorDepartment: 'الصيدلة السريرية',
    clinicalDate: '2026-09-15',
    createdDate: '2026-09-15 08:30',
    finalizedDate: '2026-09-15 09:10',
    lifecycleState: 'entered_in_error',
    referenceState: 'entered_in_error',
    currentVersionNumber: 2,
    versions: [
      {
        versionNumber: 2,
        savedAt: '2026-09-15 09:10',
        savedBy: 'صيدلي. نورة السديري',
        savedByRole: 'Clinical Pharmacist',
        title: 'كشف مطابقة أدوية [أدخل خطأً - ملغى]',
        contentSnippet: '[تم إلغاء الوثيقة واعتبارها غير صالحة سريرياً: تم فتح الملف بالخطأ وسجلت أدوية تعود لمريض مجاور بالقسم.]',
        lifecycleState: 'entered_in_error',
        changeType: 'entered_in_error',
        changeReason: 'تم فتح ملف المريض بالخطأ وقيدت أدوية تخص مريضاً آخر في الغرفة المجاورة',
        relationshipToPrior: 'حجب الوثيقة بالكامل وعزلها عن الاستخدام السريري'
      },
      {
        versionNumber: 1,
        savedAt: '2026-09-15 08:30',
        savedBy: 'صيدلي. نورة السديري',
        savedByRole: 'Clinical Pharmacist',
        title: 'كشف مطابقة أدوية تنويم',
        contentSnippet: 'مطابقة أدوية: ديجوكسين 0.25 ملغ، وارفارين 5 ملغ مساءً، فيوروسيميد 40 ملغ.',
        lifecycleState: 'signed',
        changeType: 'original_created',
        relationshipToPrior: 'النسخة الأصلية التي سجلت بالخطأ'
      }
    ],
    isOriginalPreserved: true,
    isQuarantined: true,
    integrityExceptionRef: 'EXC-2026-099',
    confidentialityLevel: 'sensitive',
    contentSnippet: '[تم إلغاء الوثيقة واعتبارها غير صالحة سريرياً: تم فتح الملف بالخطأ وسجلت أدوية تعود لمريض مجاور بالقسم.]'
  },
  {
    id: 'DOC-REC-05',
    encounterId: 'ENC-2026-ICU-882',
    patientId: 'P-104',
    patientName: 'خالد بن ناصر المطيري',
    mrn: 'MRN-994102',
    documentType: 'ICU Critical Care Note',
    titleAr: 'ملاحظة العناية المركزة اليومية: الصدمة الإنتانية',
    titleEn: 'Daily Critical Care Note: Septic Shock & Polytrauma',
    authorName: 'د. أحمد كمال الدين',
    authorRole: 'استشاري العناية الحرجة',
    authorDepartment: 'العناية المركزة (ICU)',
    clinicalDate: '2026-09-21',
    createdDate: '2026-09-21 07:00',
    finalizedDate: '2026-09-21 08:15',
    lifecycleState: 'signed',
    referenceState: 'current',
    currentVersionNumber: 1,
    versions: [
      {
        versionNumber: 1,
        savedAt: '2026-09-21 08:15',
        savedBy: 'د. أحمد كمال الدين',
        savedByRole: 'Consultant Critical Care',
        title: 'ملاحظة العناية المركزة اليومية: الصدمة الإنتانية',
        contentSnippet: 'مريض مصاب برضوض متعددة إثر حادث مروري ومصاب بصدمة إنتانية وبكتيريا الدم، موضوع على التنفس الاصطناعي وداعمات الضغط (Noradrenaline 0.25 mcg/kg/min).',
        lifecycleState: 'signed',
        changeType: 'original_created',
        relationshipToPrior: 'النسخة الأصلية الموقعة'
      }
    ],
    isOriginalPreserved: true,
    isQuarantined: false,
    confidentialityLevel: 'highly_restricted',
    contentSnippet: 'مريض مصاب برضوض متعددة إثر حادث مروري ومصاب بصدمة إنتانية وبكتيريا الدم، موضوع على التنفس الاصطناعي وداعمات الضغط (Noradrenaline 0.25 mcg/kg/min).'
  }
];

export const INITIAL_DEFICIENCIES: DocumentationDeficiency[] = [
  {
    id: 'DEF-2026-001',
    encounterId: 'ENC-2026-ER-091',
    patientId: 'P-101',
    patientName: 'عبد الله بن سعيد الشهري',
    mrn: 'MRN-789012',
    careSetting: 'emergency',
    departmentId: 'er',
    departmentName: 'قسم الطوارئ والحوادث',
    documentId: 'DOC-REC-01',
    documentTitle: 'تقرير تحويل المريض لقسم القسطرة (Handover Record)',
    category: 'missing_discharge_summary',
    descriptionAr: 'غياب محضر التحويل ونقل المسؤولية الطبية إلى قسم القسطرة بعد انتهاء مرحلة الطوارئ.',
    descriptionEn: 'Missing inter-departmental handover transfer summary to Cath Lab.',
    responsibleAuthorId: 'DOC-881',
    responsibleAuthorName: 'د. طارق المنشاوي',
    responsibleAuthorRole: 'استشاري طب الطوارئ',
    detectedDate: '2026-09-12',
    targetCompletionDate: '2026-09-14',
    daysOutstanding: 12,
    severity: 'blocking_completion',
    status: 'assigned_to_provider',
    blockingEffect: true,
    escalationLevel: 'reminder_2'
  },
  {
    id: 'DEF-2026-002',
    encounterId: 'ENC-2026-IPD-441',
    patientId: 'P-102',
    patientName: 'مريم بنت عبد الرحمن الغامدي',
    mrn: 'MRN-883921',
    careSetting: 'inpatient',
    departmentId: 'or',
    departmentName: 'العمليات الجراحية (OR)',
    documentId: 'DOC-REC-02',
    documentTitle: 'تقرير العملية الجراحية: استئصال المرارة بالمنظار',
    category: 'missing_cosignature',
    descriptionAr: 'يلزم توقيع الاستشاري المشرف (Co-Signature) لاعتماد تقرير العملية الجراحية المحرر من الأخصائي.',
    descriptionEn: 'Attending consultant co-signature required for operative report.',
    responsibleAuthorId: 'DOC-SURG-902',
    responsibleAuthorName: 'د. إبراهيم الزهراني',
    responsibleAuthorRole: 'استشاري جراحة عامة ومناظير',
    detectedDate: '2026-09-20',
    targetCompletionDate: '2026-09-22',
    daysOutstanding: 4,
    severity: 'blocking_completion',
    status: 'open',
    blockingEffect: true,
    escalationLevel: 'reminder_1'
  },
  {
    id: 'DEF-2026-003',
    encounterId: 'ENC-2026-IPD-441',
    patientId: 'P-102',
    patientName: 'مريم بنت عبد الرحمن الغامدي',
    mrn: 'MRN-883921',
    careSetting: 'inpatient',
    departmentId: 'ipd',
    departmentName: 'جناح الجراحة العامة - رجال',
    documentTitle: 'ملخص الخروج الطبي المعتمد (Formal Discharge Summary)',
    category: 'missing_discharge_summary',
    descriptionAr: 'لم يتم تحرير ملخص الخروج السريري رغم مغادرة المريضة المستشفى.',
    descriptionEn: 'Missing formal clinical discharge summary following inpatient discharge.',
    responsibleAuthorId: 'DOC-SURG-902',
    responsibleAuthorName: 'د. إبراهيم الزهراني',
    responsibleAuthorRole: 'استشاري جراحة عامة',
    detectedDate: '2026-09-22',
    targetCompletionDate: '2026-09-24',
    daysOutstanding: 2,
    severity: 'blocking_completion',
    status: 'open',
    blockingEffect: true,
    escalationLevel: 'none'
  },
  {
    id: 'DEF-2026-004',
    encounterId: 'ENC-2026-ICU-882',
    patientId: 'P-104',
    patientName: 'خالد بن ناصر المطيري',
    mrn: 'MRN-994102',
    careSetting: 'icu',
    departmentId: 'icu',
    departmentName: 'العناية المركزة (ICU)',
    documentId: 'DOC-REC-05',
    documentTitle: 'إقرار موافقة التدخل الجراحي الطارئ لقسطرة الشريان الأورطي',
    category: 'missing_signature',
    descriptionAr: 'غياب توقيع الشاهد الثاني في إقرار الموافقة الطارئة لإنقاذ الحياة.',
    descriptionEn: 'Missing second witness signature on emergency procedure consent.',
    responsibleAuthorId: 'DOC-ICU-102',
    responsibleAuthorName: 'د. أحمد كمال الدين',
    responsibleAuthorRole: 'استشاري العناية الحرجة',
    detectedDate: '2026-09-21',
    targetCompletionDate: '2026-09-23',
    daysOutstanding: 3,
    severity: 'urgent_clinical',
    status: 'open',
    blockingEffect: true,
    escalationLevel: 'reminder_1'
  }
];

export const INITIAL_CODING_CASES: CodingCase[] = [
  {
    id: 'COD-CASE-01',
    encounterId: 'ENC-2026-ER-091',
    patientId: 'P-101',
    patientName: 'عبد الله بن سعيد الشهري',
    mrn: 'MRN-789012',
    careSetting: 'emergency',
    admissionDate: '2026-09-12 09:30',
    dischargeDate: '2026-09-12 14:00',
    documentationReadiness: 'deficiencies_pending',
    codingReadiness: 'blocked_by_documentation',
    status: 'query_pending',
    assignedCoder: 'أ. سارة الحربي (مرمز سريري معتمد)',
    priority: 'claim_cutoff_priority',
    activeProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
    principalDiagnosisCandidate: {
      rawDiagnosis: 'Acute Non-ST Elevation Myocardial Infarction (NSTEMI)',
      proposedCode: 'I21.4',
      selectionRationale: 'السبب المباشر الذي استدعى التنويم والتدخل التداخلي في الطوارئ.'
    },
    codingEntries: [
      {
        id: 'code-01',
        type: 'principal_diagnosis',
        code: 'I21.4',
        descriptionAr: 'احتشاء عضلة القلب الحاد تحت الشغاف (NSTEMI)',
        descriptionEn: 'Acute subendocardial myocardial infarction',
        classificationProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
        sourceDiagnosisText: 'High-Risk Non-ST Elevation Myocardial Infarction',
        documentedInNoteId: 'DOC-REC-01',
        assignedByCoder: 'أ. سارة الحربي',
        assignedAt: '2026-09-13 11:00',
        isReviewed: true
      },
      {
        id: 'code-02',
        type: 'secondary_diagnosis',
        code: 'I10',
        descriptionAr: 'ارتفاع ضغط الدم الأولي الأساسي',
        descriptionEn: 'Essential (primary) hypertension',
        classificationProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
        sourceDiagnosisText: 'History of Essential Hypertension',
        documentedInNoteId: 'DOC-REC-01',
        assignedByCoder: 'أ. سارة الحربي',
        assignedAt: '2026-09-13 11:05',
        isReviewed: true
      }
    ],
    openQueriesCount: 1,
    codingQualityStatus: 'not_audited',
    billingHandoffStatus: 'coding_in_progress'
  },
  {
    id: 'COD-CASE-02',
    encounterId: 'ENC-2026-IPD-441',
    patientId: 'P-102',
    patientName: 'مريم بنت عبد الرحمن الغامدي',
    mrn: 'MRN-883921',
    careSetting: 'inpatient',
    admissionDate: '2026-09-19 11:00',
    dischargeDate: '2026-09-22 10:30',
    documentationReadiness: 'deficiencies_pending',
    codingReadiness: 'blocked_by_documentation',
    status: 'assigned',
    assignedCoder: 'أ. ماجد العريفي',
    priority: 'urgent_high_value',
    activeProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
    principalDiagnosisCandidate: {
      rawDiagnosis: 'Acute Cholecystitis with Cholelithiasis',
      proposedCode: 'K80.00',
      selectionRationale: 'الحالة الرئيسية المؤكدة بالفحوصات الجراحية والمخبرية أثناء التنويم.'
    },
    codingEntries: [],
    openQueriesCount: 0,
    codingQualityStatus: 'not_audited',
    billingHandoffStatus: 'coding_not_ready'
  },
  {
    id: 'COD-CASE-03',
    encounterId: 'ENC-2026-OPD-772',
    patientId: 'P-103',
    patientName: 'سعد بن محمد القحطاني',
    mrn: 'MRN-441209',
    careSetting: 'outpatient',
    admissionDate: '2026-09-23 09:15',
    dischargeDate: '2026-09-23 10:00',
    documentationReadiness: 'documentation_complete',
    codingReadiness: 'coded',
    status: 'complete',
    assignedCoder: 'أ. سارة الحربي',
    priority: 'routine',
    activeProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
    principalDiagnosisCandidate: {
      rawDiagnosis: 'Type 2 Diabetes Mellitus with Diabetic Nephropathy',
      proposedCode: 'E11.21',
      selectionRationale: 'سبب مراجعة عيادة أمراض الكلى ومتابعة وظائف الكلى التراكمية.'
    },
    codingEntries: [
      {
        id: 'code-03',
        type: 'principal_diagnosis',
        code: 'E11.21',
        descriptionAr: 'داء السكري من النوع الثاني مع اعتلال كلوي سكري',
        descriptionEn: 'Type 2 diabetes mellitus with established diabetic nephropathy',
        classificationProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
        sourceDiagnosisText: 'Type 2 DM with Nephropathy',
        documentedInNoteId: 'DOC-REC-OPD-01',
        assignedByCoder: 'أ. سارة الحربي',
        assignedAt: '2026-09-23 11:30',
        isReviewed: true
      },
      {
        id: 'code-04',
        type: 'secondary_diagnosis',
        code: 'N18.3',
        descriptionAr: 'مرض الكلى المزمن، المرحلة الثالثة',
        descriptionEn: 'Chronic kidney disease, stage 3',
        classificationProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
        sourceDiagnosisText: 'CKD Stage 3a (eGFR 52 mL/min)',
        documentedInNoteId: 'DOC-REC-OPD-01',
        assignedByCoder: 'أ. سارة الحربي',
        assignedAt: '2026-09-23 11:35',
        isReviewed: true
      }
    ],
    openQueriesCount: 0,
    codingQualityStatus: 'audit_passed',
    billingHandoffStatus: 'handed_off_in_simulation',
    billingHandoffTimestamp: '2026-09-23 13:00',
    handoffReferenceCode: 'HIM-FIN-REF-441209'
  }
];

export const INITIAL_CODING_QUERIES: CodingQuery[] = [
  {
    id: 'CQ-2026-001',
    queryNumber: 'CQ-2026-1082',
    caseId: 'COD-CASE-01',
    encounterId: 'ENC-2026-ER-091',
    patientId: 'P-101',
    patientName: 'عبد الله بن سعيد الشهري',
    mrn: 'MRN-789012',
    topic: 'missing_specificity',
    coderId: 'CODER-04',
    coderName: 'أ. سارة الحربي (مرمز سريري معتمد)',
    targetProviderId: 'DOC-881',
    targetProviderName: 'د. طارق المنشاوي',
    targetProviderDepartment: 'قسم الطوارئ والحوادث',
    referencedDocumentId: 'DOC-REC-01',
    referencedDocumentTitle: 'ملاحظة تقييم متلازمة الشريان التاجي الحادة (ACS)',
    documentedClinicalSnippet: 'تخطيط القلب أظهر انخفاض ST في V4-V6 مع ارتفاع تروبونين 0.18 ng/mL، دون تحديد الشريان المصاب أو ما إذا كان الاحتشاء جدارياً سفلياً أم أمامياً.',
    queryInquiryText: 'بناءً على نتائج تخطيط القلب والتروبونين، نرجو التكرم بتوضيح الموقع التشريحي النوعي لاحتشاء عضلة القلب (Site of Myocardial Infarction) لغايات الترميز السريري الدقيق وفق المراجع الطبية المعتمدة.',
    neutralOptionsProvided: [
      'احتشاء العضلة القلبية تحت الشغاف غير محدد الموقع (Subendocardial NSTEMI)',
      'احتشاء أمامي وحشي حاد (Acute Anterolateral Infarction)',
      'احتشاء سفلي حاد (Acute Inferior Infarction)',
      'حالة أخرى غير محددة سريرياً'
    ],
    providerResponseText: '[إجابة د. طارق المنشاوي]: بناءً على مراجعة قسطرة القلب لاحقاً، تبيّن وجود تضيق بنسبة 90% في الشريان التاجي الأيسر النازل LAD مع احتشاء أمامي وحشي حاد.',
    providerRespondedAt: '2026-09-13 14:20',
    status: 'answered',
    createdAt: '2026-09-13 09:15',
    updatedAt: '2026-09-13 14:20',
    isNonLeadingVerified: true
  }
];

export const INITIAL_ROI_REQUESTS: ReleaseOfInformationRequest[] = [
  {
    id: 'ROI-2026-001',
    requestNumber: 'ROI-2026-081',
    patientId: 'P-101',
    patientName: 'عبد الله بن سعيد الشهري',
    mrn: 'MRN-789012',
    requesterType: 'patient',
    requesterName: 'عبد الله بن سعيد الشهري (شخصياً)',
    requesterIdNumber: '1099234581',
    requesterContact: '+966-50-123-4567',
    isRequesterIdentityVerified: true,
    purpose: 'personal_record',
    legalBasis: 'patient_consent',
    isLegalBasisVerified: true,
    requestedDate: '2026-09-20',
    requestedScope: 'minimum_necessary_encounter',
    requestedCategories: ['discharge_summary', 'operative_report', 'diagnostic_cardiology'],
    status: 'ready_for_release',
    sensitiveDataFlags: {
      containsPsychiatricNotes: false,
      containsSubstanceUseHistory: false,
      containsInfectiousDiseaseDisclosures: false,
      requiresSpecialLegalAuthorization: false
    },
    activeLegalHoldPresent: false,
    assignedRoiSpecialist: 'أ. نورة القحطاني (أخصائية إفراج معلومات)',
    disclosureItems: [
      {
        documentId: 'DOC-REC-01',
        documentTitle: 'ملاحظة تقييم متلازمة الشريان التاجي الحادة (ACS)',
        documentDate: '2026-09-12',
        encounterId: 'ENC-2026-ER-091',
        authorName: 'د. طارق المنشاوي',
        confidentialityLevel: 'normal',
        inclusionStatus: 'included'
      }
    ]
  },
  {
    id: 'ROI-2026-002',
    requestNumber: 'ROI-2026-082',
    patientId: 'P-104',
    patientName: 'خالد بن ناصر المطيري',
    mrn: 'MRN-994102',
    requesterType: 'insurer',
    requesterName: 'شركة التعاونية للتأمين الطبي (قسم المطالبات)',
    requesterIdNumber: 'CR-1010008892',
    requesterContact: 'claims-dispute@tawuniya.com.sa',
    isRequesterIdentityVerified: true,
    purpose: 'insurance_claim_dispute',
    legalBasis: 'patient_consent',
    isLegalBasisVerified: true,
    requestedDate: '2026-09-22',
    requestedScope: 'entire_chart_exception', // Requested entire chart!
    requestedCategories: ['all_notes', 'all_orders', 'all_billing'],
    status: 'legal_hold_review', // Blocked by active legal hold and scope restriction!
    sensitiveDataFlags: {
      containsPsychiatricNotes: false,
      containsSubstanceUseHistory: false,
      containsInfectiousDiseaseDisclosures: false,
      requiresSpecialLegalAuthorization: true
    },
    activeLegalHoldPresent: true,
    legalHoldReferenceId: 'LH-2026-MOJ-01',
    assignedRoiSpecialist: 'أ. نورة القحطاني',
    disclosureItems: [],
    denialOrRestrictionReason: 'الملف خاضع لحجز قضائي صادر من المحكمة العامة (LH-2026-MOJ-01)؛ يمنع إفراج أي مستند دون أمر قضائي مباشر.'
  }
];

export const INITIAL_LEGAL_HOLDS: LegalHoldRecord[] = [
  {
    id: 'LH-2026-MOJ-01',
    holdReferenceNumber: 'LH-MOJ-2026-4491',
    titleAr: 'حجز قضائي نظامي صادر من المحكمة العامة بالرياض',
    titleEn: 'Judicial Hold Order - Riyadh General Court',
    reason: 'دعوى قضائية منظورة بشأن حادث تصادم مروري جنائي والتحقيق في الإصابات الجسدية.',
    authorizedSource: 'كتاب المحكمة العامة بالرياض رقم 4491-ق-2026',
    startDate: '2026-09-18',
    reviewDate: '2027-03-18',
    status: 'active',
    affectedPatientIds: ['P-104'],
    affectedEncounterIds: ['ENC-2026-ICU-882'],
    scopeDescription: 'يشمل كامل الملف الطبي للمريض بجميع تقاريره السريرية والفحوصات المخبرية والإشعاعية.',
    authorizedBy: 'المستشار القانوني للمستشفى'
  }
];

export const INITIAL_COMPLETION_POLICIES: HospitalConfigurableCompletionPolicy[] = [
  {
    policyId: 'COMP-POL-IPD-01',
    careSetting: 'inpatient',
    internalTargetDays: 14,
    reminderThresholdDays: 7,
    escalationThresholdDays: 14,
    regulatoryCompletionBoundaryDays: 30, // Verified CBAHI requirement for discharged patients
    policySource: 'ILLUSTRATIVE_LOCAL_POLICY',
    effectiveDate: '2026-01-01',
    notesAr: 'الهدف التشغيلي الداخلي للمستشفى (ILLUSTRATIVE_LOCAL_POLICY): 14 يوماً. الحد النظامي النهائي المعتمد لسباهي (CBAHI): 30 يوماً من تاريخ خروج المريض المنوم.',
    notesEn: 'Hospital internal operational target (ILLUSTRATIVE_LOCAL_POLICY): 14 days. CBAHI regulatory boundary: 30 days post-discharge.'
  },
  {
    policyId: 'COMP-POL-OPD-01',
    careSetting: 'outpatient',
    internalTargetDays: 1,
    reminderThresholdDays: 2,
    escalationThresholdDays: 3,
    regulatoryCompletionBoundaryDays: 7,
    policySource: 'ILLUSTRATIVE_LOCAL_POLICY',
    effectiveDate: '2026-01-01',
    notesAr: 'عيادات اليوم الواحد والخارجية: استكمال التوثيق فور انتهاء العيادة ولا يطبق عليها تلقائياً مهلة خروج المنومين.',
    notesEn: 'Outpatient clinics: Documentation completion on encounter day; does not inherit inpatient discharge timers.'
  },
  {
    policyId: 'COMP-POL-ED-01',
    careSetting: 'emergency',
    internalTargetDays: 1,
    reminderThresholdDays: 1,
    escalationThresholdDays: 2,
    regulatoryCompletionBoundaryDays: 3,
    policySource: 'ILLUSTRATIVE_LOCAL_POLICY',
    effectiveDate: '2026-01-01',
    notesAr: 'قسم الطوارئ: استكمال تقرير المعاينة والقرار الطبي خلال 24 ساعة من إنهاء الحالة.',
    notesEn: 'Emergency Department: Clinical encounter notes completion within 24 hours of disposition.'
  }
];

export const INITIAL_RETENTION_POLICIES: RetentionPolicyReference[] = [
  {
    policyId: 'RET-POL-ADULT-IPD',
    category: 'adult_inpatient',
    recordCategory: 'adult_inpatient',
    policyTitleAr: 'ملف توضيحي لحفظ سجلات المرضى المنومين البالغين',
    policyTitleEn: 'Illustrative Retention Profile: Adult Inpatient Records',
    retentionTrigger: 'discharge_date',
    retentionDurationYears: 10,
    durationRule: 10,
    jurisdiction: 'LOCAL_HOSPITAL',
    sourceAuthority: 'سياسة المستشفى التوضيحية (غير منسوبة لوزارة الصحة لغياب سند قطعي)',
    sourceReference: 'HOSPITAL_LOCAL_POLICY_MANUAL_REF_2024_02',
    effectiveFrom: '2024-01-01',
    status: 'active',
    verificationState: 'illustrative_configuration',
    ruleStatus: 'VERIFIED',
    notes: 'إعداد توضيحي داخلي (ILLUSTRATIVE_CONFIGURATION) بمدة 10 سنوات بعد خروج المنوم، دون زعم بوجود تشريع وزاري ملزم منشور.'
  },
  {
    policyId: 'RET-POL-PEDIATRIC',
    category: 'pediatric_record',
    recordCategory: 'pediatric_record',
    policyTitleAr: 'ملف توضيحي لحفظ ملفات الأطفال وحديثي الولادة',
    policyTitleEn: 'Illustrative Retention Profile: Pediatric & Neonatal Records',
    retentionTrigger: 'age_of_majority',
    retentionDurationYears: 21,
    durationRule: 21,
    jurisdiction: 'LOCAL_HOSPITAL',
    sourceAuthority: 'سياسة المستشفى التوضيحية للأطفال',
    sourceReference: 'HOSPITAL_PEDIATRIC_POLICY_REF_2023',
    effectiveFrom: '2023-01-01',
    status: 'active',
    verificationState: 'illustrative_configuration',
    ruleStatus: 'VERIFIED',
    notes: 'إعداد توضيحي داخلي (ILLUSTRATIVE_CONFIGURATION) حتى سن 21 سنة دون نسبة لوزارة الصحة.'
  },
  {
    policyId: 'RET-POL-VITAL-OPERATIVE',
    category: 'operative_records',
    recordCategory: 'operative_records',
    policyTitleAr: 'ملف توضيحي لحفظ تقارير العمليات الجراحية الكبرى',
    policyTitleEn: 'Illustrative Retention Profile: Major Operative Records',
    retentionTrigger: 'last_encounter',
    retentionDurationYears: 25,
    durationRule: 25,
    jurisdiction: 'LOCAL_HOSPITAL',
    sourceAuthority: 'سياسة المستشفى التوضيحية للسجلات الجراحية',
    sourceReference: 'SURGICAL_RECORDS_LOCAL_GUIDELINE_2025',
    effectiveFrom: '2025-01-01',
    status: 'active',
    verificationState: 'illustrative_configuration',
    ruleStatus: 'VERIFIED',
    notes: 'إعداد توضيحي داخلي (ILLUSTRATIVE_CONFIGURATION) لمدة 25 سنة، ولا يعد تشريعاً وطنياً.'
  },
  {
    policyId: 'RET-POL-UNVERIFIED-RESEARCH',
    category: 'vital_records',
    recordCategory: 'vital_records',
    policyTitleAr: 'سجلات الأبحاث السريرية غير المقننة',
    policyTitleEn: 'Unverified Clinical Research Records',
    retentionTrigger: 'last_encounter',
    retentionDurationYears: undefined,
    durationRule: undefined,
    jurisdiction: 'UNSPECIFIED',
    sourceAuthority: 'غير محدد - بانتظار تشريع معتمد',
    sourceReference: 'RETENTION_RULE_NOT_VERIFIED',
    effectiveFrom: '2026-01-01',
    status: 'under_review',
    verificationState: 'not_verified',
    ruleStatus: 'RETENTION_RULE_NOT_VERIFIED',
    notes: 'RETENTION_RULE_NOT_VERIFIED: لم يصدر تشريع نهائي محدد بمدة الحفظ؛ يمنع منعاً باتاً افتراض مدة صفر أو إتلاف أي سجل في هذه الفئة.'
  }
];

export const INITIAL_INTEGRITY_EXCEPTIONS: RecordIntegrityException[] = [
  {
    id: 'EXC-2026-099',
    type: 'document_entered_in_error',
    patientId: 'P-106',
    mrn: 'MRN-334188',
    patientName: 'سلطان بن إبراهيم الحازمي',
    documentId: 'DOC-REC-04',
    documentTitle: 'كشف مطابقة أدوية (أدخل خطأً)',
    encounterId: 'ENC-2026-IPD-109',
    detectedAt: '2026-09-15 09:12',
    detectedBy: 'صيدلي. نورة السديري',
    severity: 'critical_patient_safety',
    status: 'quarantine_from_routine_use',
    descriptionAr: 'تم رصد إدخال وثيقة دوائية تخص مريضاً آخر بالخطأ. تم عزل الوثيقة فوراً ووسمها "أدخلت خطأً".',
    descriptionEn: 'Document entered on wrong patient chart, immediately quarantined from clinical visibility.',
    investigationNotes: 'تم التأكد من عدم صرف أي من الأدوية الخاطئة، وسحب الوثيقة من السجل الجاري دون محوها من سجل التدقيق التاريخي.'
  },
  {
    id: 'EXC-2026-101',
    type: 'unreadable_attachment',
    patientId: 'P-107',
    mrn: 'MRN-110294',
    patientName: 'عمر بن خالد الدوسري',
    documentTitle: 'تقرير أشعة خارجية ممسوح ضوئياً',
    detectedAt: '2026-09-23 16:00',
    detectedBy: 'موظف السجلات. فهد الشمري',
    severity: 'medium',
    status: 'record_integrity_review',
    descriptionAr: 'المرفق الخارجي الممسوح ضوئياً غير مقروء بدقة بسبب انخفاض دقة المسح وظهور بقع حبر على النص الطبي.',
    descriptionEn: 'Scanned external radiology report is blurry and unreadable; quality review required.',
    investigationNotes: 'تم طلب إعادة سحب الوثيقة بجودة 300 DPI من مستودع الأصول الخارجية.'
  }
];

export const INITIAL_SCANNED_DOCUMENTS: ScannedExternalDocument[] = [
  {
    id: 'SCAN-2026-001',
    batchNumber: 'BATCH-2026-W38-09',
    patientId: 'P-107',
    mrn: 'MRN-110294',
    patientName: 'عمر بن خالد الدوسري',
    encounterId: 'ENC-2026-ER-602',
    documentType: 'External MRI Report (Outside Hospital)',
    sourceOrganization: 'مستشفى الدكتور سليمان الحبيب',
    serviceDate: '2026-09-20',
    receivedDate: '2026-09-23',
    pageCount: 3,
    confidentialityCategory: 'normal',
    indexingStatus: 'pending_indexing',
    qualityReadability: 'unreadable_quality_review',
    duplicateCheckStatus: 'passed_unique',
    scannedFileName: 'MRI_Knee_Dousari_20260920.pdf'
  },
  {
    id: 'SCAN-2026-002',
    batchNumber: 'BATCH-2026-W38-10',
    patientId: 'P-103',
    mrn: 'MRN-441209',
    patientName: 'سعد بن محمد القحطاني',
    documentType: 'Transfer Letter & Laboratory Chart',
    sourceOrganization: 'مركز الرعاية الصحية الأولية بالدرعية',
    serviceDate: '2026-09-18',
    receivedDate: '2026-09-22',
    pageCount: 2,
    confidentialityCategory: 'normal',
    indexingStatus: 'indexed_verified',
    qualityReadability: 'good_readable',
    duplicateCheckStatus: 'passed_unique',
    scannedFileName: 'PHC_Transfer_Ref_441209.pdf',
    indexedBy: 'موظف السجلات. فهد الشمري',
    indexedAt: '2026-09-22 14:30'
  }
];

export const INITIAL_MEDICAL_RECORD_CASES: MedicalRecordCase[] = [
  {
    id: 'REC-CASE-01',
    encounterId: 'ENC-2026-ER-091',
    patientId: 'P-101',
    patientName: 'عبد الله بن سعيد الشهري',
    mrn: 'MRN-789012',
    careSetting: 'emergency',
    admissionDate: '2026-09-12 09:30',
    dischargeDate: '2026-09-12 14:00',
    attendingPhysicianName: 'د. طارق المنشاوي',
    departmentName: 'قسم الطوارئ والحوادث',
    completionStatus: 'deficient',
    documentIds: ['DOC-REC-01'],
    deficiencyIds: ['DEF-2026-001'],
    codingCaseId: 'COD-CASE-01',
    retentionPolicyId: 'RET-POL-ADULT-IPD',
    retentionCalculatedExpiryDate: '2036-09-12',
    retentionStatus: 'active_retention',
    dispositionStatus: 'not_eligible'
  },
  {
    id: 'REC-CASE-02',
    encounterId: 'ENC-2026-IPD-441',
    patientId: 'P-102',
    patientName: 'مريم بنت عبد الرحمن الغامدي',
    mrn: 'MRN-883921',
    careSetting: 'inpatient',
    admissionDate: '2026-09-19 11:00',
    dischargeDate: '2026-09-22 10:30',
    attendingPhysicianName: 'د. إبراهيم الزهراني',
    departmentName: 'جناح الجراحة العامة - رجال',
    completionStatus: 'deficient',
    documentIds: ['DOC-REC-02'],
    deficiencyIds: ['DEF-2026-002', 'DEF-2026-003'],
    codingCaseId: 'COD-CASE-02',
    retentionPolicyId: 'RET-POL-ADULT-IPD',
    retentionCalculatedExpiryDate: '2036-09-22',
    retentionStatus: 'active_retention',
    dispositionStatus: 'not_eligible'
  },
  {
    id: 'REC-CASE-03',
    encounterId: 'ENC-2026-OPD-772',
    patientId: 'P-103',
    patientName: 'سعد بن محمد القحطاني',
    mrn: 'MRN-441209',
    careSetting: 'outpatient',
    admissionDate: '2026-09-23 09:15',
    dischargeDate: '2026-09-23 10:00',
    attendingPhysicianName: 'د. سامي الجابري',
    departmentName: 'عيادة الباطنة والسكري (OPD)',
    completionStatus: 'record_complete',
    completionReviewDate: '2026-09-23 13:00',
    completionReviewedBy: 'أ. نورة القحطاني',
    documentIds: ['DOC-REC-OPD-01'],
    deficiencyIds: [],
    codingCaseId: 'COD-CASE-03',
    retentionPolicyId: 'RET-POL-ADULT-IPD',
    retentionCalculatedExpiryDate: '2036-09-23',
    retentionStatus: 'active_retention',
    dispositionStatus: 'not_eligible'
  },
  {
    id: 'REC-CASE-04',
    encounterId: 'ENC-2026-ICU-882',
    patientId: 'P-104',
    patientName: 'خالد بن ناصر المطيري',
    mrn: 'MRN-994102',
    careSetting: 'icu',
    admissionDate: '2026-09-21 02:00',
    dischargeDate: undefined, // Still inpatient in ICU!
    attendingPhysicianName: 'د. أحمد كمال الدين',
    departmentName: 'العناية المركزة (ICU)',
    completionStatus: 'open',
    documentIds: ['DOC-REC-05'],
    deficiencyIds: ['DEF-2026-004'],
    activeLegalHoldId: 'LH-2026-MOJ-01',
    retentionPolicyId: 'RET-POL-ADULT-IPD',
    retentionStatus: 'hold_active',
    dispositionStatus: 'hold_active'
  }
];

export const INITIAL_HIM_OPS_STATE: HimOpsState = {
  recordCases: INITIAL_MEDICAL_RECORD_CASES,
  documents: INITIAL_RECORD_DOCUMENTS,
  deficiencies: INITIAL_DEFICIENCIES,
  codingCases: INITIAL_CODING_CASES,
  classificationProfiles: INITIAL_CLASSIFICATION_PROFILES,
  codingQueries: INITIAL_CODING_QUERIES,
  codingReviews: [],
  roiRequests: INITIAL_ROI_REQUESTS,
  disclosureLogs: [],
  retentionPolicies: INITIAL_RETENTION_POLICIES,
  completionPolicies: INITIAL_COMPLETION_POLICIES,
  legalHolds: INITIAL_LEGAL_HOLDS,
  integrityExceptions: INITIAL_INTEGRITY_EXCEPTIONS,
  scannedDocuments: INITIAL_SCANNED_DOCUMENTS,
  auditLogs: [
    {
      id: 'AUD-001',
      timestamp: '2026-09-24 09:00',
      actor: 'أ. نورة القحطاني',
      persona: 'him_officer',
      action: 'DEFICIENCY_AUDIT_CYCLE',
      targetId: 'DEF-2026-001',
      targetType: 'deficiency',
      descriptionAr: 'تنفيذ دورة التدقيق الصباحية لنواقص التوثيق السريري وتصعيد التنبيهات للأطباء.'
    }
  ],
  activePersona: 'him_officer'
};

export interface HimPersonaProfile {
  id: HimPersona;
  name: string;
  roleTitle: string;
}

export const HIM_PERSONA_PROFILES: HimPersonaProfile[] = [
  { id: 'him_officer', name: 'أ. عبد الرحمن الشهري', roleTitle: 'مسؤول السجلات الطبية' },
  { id: 'clinical_coder', name: 'أ. سارة الحربي', roleTitle: 'أخصائي أول ترميز سريري' },
  { id: 'senior_coding_reviewer', name: 'د. خالد المنصور', roleTitle: 'مدقق ومراجع ترميز معتمد' },
  { id: 'roi_specialist', name: 'أ. منى العتيبي', roleTitle: 'أخصائية إفراج المعلومات والخصوصية' },
  { id: 'medical_records_clerk', name: 'أ. فهد الدوسري', roleTitle: 'مدقق استكمال وتدقيق النواقص' },
  { id: 'him_supervisor', name: 'د. ناصر القحطاني', roleTitle: 'مدير إدارة السجلات والمعلومات الصحية' }
];

export const HIM_PERSONAS = HIM_PERSONA_PROFILES;

export const getPersonaProfile = (id: HimPersona): HimPersonaProfile => {
  return HIM_PERSONA_PROFILES.find(p => p.id === id) || HIM_PERSONA_PROFILES[0];
};

