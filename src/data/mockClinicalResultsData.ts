import {
  ResultDomainConfig,
  LabReportItem,
  ImagingReportItem,
  MicrobiologyReportItem,
  PathologyReportItem,
  CumulativeTrendSeries
} from '../types/clinicalResults';

// =============================================================
// CONFIGURED RESULT DOMAINS
// Configurable architecture — not hardcoded closed list
// =============================================================
export const MOCK_RESULT_DOMAINS: ResultDomainConfig[] = [
  {
    id: 'laboratory',
    nameAr: 'الفحوصات المخبرية',
    nameEn: 'Laboratory Results',
    iconName: 'FlaskConical',
    descriptionAr: 'تحاليل الكيمياء السريرية، الدمويات، المؤشرات الحيوية والشوارد'
  },
  {
    id: 'imaging',
    nameAr: 'تقارير الأشعة والتصوير',
    nameEn: 'Imaging & Radiology',
    iconName: 'Camera',
    descriptionAr: 'الأشعة السينية، الرنين، المقطعية، وتخطيط صدى القلب'
  },
  {
    id: 'microbiology',
    nameAr: 'علم الأحياء الدقيقة والمزارع',
    nameEn: 'Microbiology & Cultures',
    iconName: 'Bug',
    descriptionAr: 'مزارع الدم وسوائل الجسم، تحديد الكائنات الحية وفحوصات الحساسية للمضادات'
  },
  {
    id: 'pathology',
    nameAr: 'التشريح المرضي والأنسجة',
    nameEn: 'Anatomical Pathology',
    iconName: 'FileSearch',
    descriptionAr: 'الفحص النسيجي الميكروسكوبي، الخزعات، والدراسات المناعية'
  },
  {
    id: 'diagnostic_cardiology',
    nameAr: 'تشخيص القلب الكهربائي والتداخلي',
    nameEn: 'Diagnostic Cardiology / ECG',
    iconName: 'Activity',
    descriptionAr: 'تخطيط القلب الكهربائي 12 مسرى، القسطرة التشخيصية والمراقبة الهيموديناميكية'
  }
];

// =============================================================
// LABORATORY REPORTS (MOCK DATA)
// Supports: Serial tracking, Delta changes, Critical flags, Order links
// =============================================================
export const MOCK_LAB_REPORTS: LabReportItem[] = [
  {
    id: 'LAB-REP-2026-001',
    orderReferenceId: 'ORD-1091', // Linked to Axis 6 Order
    panelNameAr: 'إنزيمات ومؤشرات القلب الحيوية التسلسلية (Serial Cardiac Biomarkers STAT)',
    panelNameEn: 'Serial Cardiac Biomarkers High-Sensitivity Protocol',
    category: 'cardiac',
    specimen: 'دم وريدي - مصل أنبوب أخضر (Lithium Heparin)',
    collectedAt: 'اليوم، 13:30',
    receivedAt: 'اليوم، 13:42',
    resultedAt: 'اليوم، 14:15',
    performingLab: 'المختبر المركزي - وحدة الفحوصات الإسعافية الحادة (STAT Lab)',
    status: 'final',
    reviewStatus: 'acknowledged',
    requiresExplicitAcknowledgement: true,
    reviewedBy: 'د. طارق المنشاوي (MD - Consultant)',
    reviewedAt: 'اليوم، 14:20',
    criticalAlertId: 'CRIT-2026-001',
    observations: [
      {
        code: 'LOINC: 89579-7',
        name: 'Troponin I (High-Sensitivity)',
        nameAr: 'تروبونين القلب عالي الحساسية',
        value: '3.85',
        numericValue: 3.85,
        unit: 'ng/mL',
        referenceRange: '< 0.04',
        flag: 'critical_high',
        previousValue: '0.02 (العينة الأولى 10:30)',
        deltaChange: '+3.83 (+19,150% ارتفاع حاد مؤكد)',
        deltaCheck: {
          deltaFlag: 'rapid_change',
          previousValue: '0.02 ng/mL',
          delta: '+3.83 ng/mL',
          previousTimestamp: '10:30',
          configuredInterpretation: 'تجاوز حد التغير السريع الحرج لمؤشرات النخر القلبي وفق معايير LIS'
        },
        isCritical: true,
        notes: 'ارتفاع ديناميكي حاد ملحوظ يؤكد الإصابة القلبية الحادة NSTEMI، يستلزم تفعيل مسار القسطرة الفوري.'
      },
      {
        code: 'LOINC: 13969-1',
        name: 'CK-MB Mass',
        nameAr: 'الكسر العضلي لإنزيم الكرياتين كينيز',
        value: '42.6',
        numericValue: 42.6,
        unit: 'ng/mL',
        referenceRange: '0.0 - 5.0',
        flag: 'high',
        previousValue: '3.1',
        deltaChange: '+39.5 ng/mL',
        isCritical: false
      },
      {
        code: 'LOINC: 30934-4',
        name: 'BNP (B-type Natriuretic Peptide)',
        nameAr: 'الببتيد الأذيني المدر للصوديوم',
        value: '340',
        numericValue: 340,
        unit: 'pg/mL',
        referenceRange: '< 100',
        flag: 'high',
        deltaChange: 'مستوى مرتفع يشير إلى إجهاد جدار البطين الأيسر'
      },
      {
        code: 'LOINC: 26515-7',
        name: 'Total CPK',
        nameAr: 'إنزيم الكرياتين كينيز الكلي',
        value: '310',
        numericValue: 310,
        unit: 'U/L',
        referenceRange: '30 - 200',
        flag: 'high'
      }
    ]
  },
  {
    id: 'LAB-REP-2026-002',
    orderReferenceId: 'ORD-1091-B',
    panelNameAr: 'لوحة وظائف الكلى والشوارد الإسعافية (BMP & Critical Electrolytes)',
    panelNameEn: 'Basic Metabolic Panel & Critical Electrolytes STAT',
    category: 'chemistry',
    specimen: 'دم وريدي - مصل أنبوب ذهبي (SST)',
    collectedAt: 'اليوم، 12:45',
    receivedAt: 'اليوم، 12:55',
    resultedAt: 'اليوم، 13:10',
    performingLab: 'مختبر الكيمياء الحيوية المركزي',
    status: 'amended', // Amended example
    reviewStatus: 'acknowledged',
    requiresExplicitAcknowledgement: true,
    reviewedBy: 'د. طارق المنشاوي',
    reviewedAt: 'اليوم، 13:15',
    criticalAlertId: 'CRIT-2026-002',
    amendments: [
      {
        id: 'AMD-01',
        version: 2,
        amendedAt: 'اليوم، 13:25',
        amendedBy: 'رامي كمال (أخصائي كيمياء سريرية)',
        reason: 'إعادة فحص عينة البوتاسيوم بواسطة جهازين مستقلين للتأكد من خلوها من الانحلال الدموي (Hemolysis Check Verified).',
        previousReportSummary: 'Potassium Serum: 6.2 mmol/L (مبدئي)',
        amendedReportSummary: 'Potassium Serum: 6.4 mmol/L (قيمة حرجة مؤكدة بجهازين مع غياب الانحلال الدموي)',
        changedFields: [
          { fieldName: 'Potassium (K+)', oldValue: '6.2 mmol/L', newValue: '6.4 mmol/L' },
          { fieldName: 'Hemolysis Index', oldValue: 'Slight Hemolysis', newValue: 'Index 0 (Clear No Hemolysis)' }
        ]
      }
    ],
    observations: [
      {
        code: 'LOINC: 2823-3',
        name: 'Potassium Serum (K+)',
        nameAr: 'بوتاسيوم المصل',
        value: '6.4',
        numericValue: 6.4,
        unit: 'mmol/L',
        referenceRange: '3.5 - 5.1',
        flag: 'critical_high',
        previousValue: '4.4 (عند الدخول)',
        deltaChange: '+2.0 mmol/L (ارتفاع حاد حرج)',
        isCritical: true,
        notes: 'تم توثيق الاتصال الهاتفي الفوري وإجراء Read-back مع تمريض العناية المركزة وفق السياسة.'
      },
      {
        code: 'LOINC: 2951-2',
        name: 'Sodium Serum (Na+)',
        nameAr: 'صوديوم المصل',
        value: '139',
        numericValue: 139,
        unit: 'mmol/L',
        referenceRange: '136 - 145',
        flag: 'normal'
      },
      {
        code: 'LOINC: 2160-0',
        name: 'Serum Creatinine',
        nameAr: 'كرياتينين المصل',
        value: '1.05',
        numericValue: 1.05,
        unit: 'mg/dL',
        referenceRange: '0.70 - 1.30',
        flag: 'normal',
        notes: 'eGFR المقدر: 72 mL/min/1.73m² (وظائف كلوية كافية لحقن الصبغة عند اللزوم).'
      },
      {
        code: 'LOINC: 3094-0',
        name: 'Blood Urea Nitrogen (BUN)',
        nameAr: 'نيتروجين يوريا الدم',
        value: '18',
        numericValue: 18,
        unit: 'mg/dL',
        referenceRange: '7 - 20',
        flag: 'normal'
      },
      {
        code: 'LOINC: 2345-7',
        name: 'Random Blood Glucose',
        nameAr: 'سكر الدم العشوائي',
        value: '168',
        numericValue: 168,
        unit: 'mg/dL',
        referenceRange: '70 - 140',
        flag: 'high',
        notes: 'مريض سكري نوع 2 معروف، تم ضبط الإنسولين القاعدي.'
      }
    ]
  },
  {
    id: 'LAB-REP-2026-003',
    panelNameAr: 'صورة الدم الكاملة (Complete Blood Count - CBC)',
    panelNameEn: 'Complete Blood Count Automated Diff',
    category: 'hematology',
    specimen: 'دم وريدي - مصل أنبوب بنفسجي (EDTA K2)',
    collectedAt: 'اليوم، 10:35',
    resultedAt: 'اليوم، 11:05',
    performingLab: 'مختبر أمراض الدم المركزي',
    status: 'final',
    reviewStatus: 'reviewed',
    requiresExplicitAcknowledgement: false, // Routine result - explicit acknowledgement not mandatory
    reviewedBy: 'د. طارق المنشاوي',
    reviewedAt: 'اليوم، 11:15',
    observations: [
      {
        code: 'LOINC: 718-7',
        name: 'Hemoglobin (Hb)',
        nameAr: 'الهيموجلوبين',
        value: '14.2',
        numericValue: 14.2,
        unit: 'g/dL',
        referenceRange: '13.0 - 17.5',
        flag: 'normal'
      },
      {
        code: 'LOINC: 6690-2',
        name: 'White Blood Cells (WBC)',
        nameAr: 'كريات الدم البيضاء',
        value: '11.4',
        numericValue: 11.4,
        unit: 'x10^3/uL',
        referenceRange: '4.0 - 11.0',
        flag: 'high',
        notes: 'ارتفاع ارتكاسي طفيف متوافق مع الإجهاد الحاد والمتلازمة الإكليلية.'
      },
      {
        code: 'LOINC: 777-3',
        name: 'Platelet Count',
        nameAr: 'الصفائح الدموية',
        value: '245',
        numericValue: 245,
        unit: 'x10^3/uL',
        referenceRange: '150 - 450',
        flag: 'normal'
      },
      {
        code: 'LOINC: 4544-3',
        name: 'Hematocrit (Hct)',
        nameAr: 'الهيماتوكريت',
        value: '42.5',
        numericValue: 42.5,
        unit: '%',
        referenceRange: '40.0 - 52.0',
        flag: 'normal'
      }
    ]
  }
];

// =============================================================
// CUMULATIVE TREND SERIES (For Interactive Trend Visualizer)
// =============================================================
export const MOCK_CUMULATIVE_TRENDS: CumulativeTrendSeries[] = [
  {
    analyteCode: 'LOINC: 89579-7',
    analyteName: 'Troponin I (High-Sensitivity)',
    analyteNameAr: 'إنزيم التروبونين التسلسلي عالي الحساسية',
    unit: 'ng/mL',
    normalRangeLow: 0.0,
    normalRangeHigh: 0.04,
    criticalRangeHigh: 0.50,
    points: [
      { timestamp: '2026-09-12 10:30', timeLabel: '10:30 ص (دخول الطوارئ)', value: 0.02, displayValue: '0.02', flag: 'normal', status: 'final' },
      { timestamp: '2026-09-12 12:00', timeLabel: '12:00 م (تكرار الفحص 1)', value: 0.85, displayValue: '0.85', flag: 'critical_high', status: 'final' },
      { timestamp: '2026-09-12 13:30', timeLabel: '13:30 م (الذروة الحادة)', value: 3.85, displayValue: '3.85', flag: 'critical_high', orderRef: 'ORD-1091', status: 'final' },
      { timestamp: '2026-09-12 15:30', timeLabel: '15:30 م (بعد فتح الشريان)', value: 2.90, displayValue: '2.90', flag: 'critical_high', status: 'preliminary' }
    ]
  },
  {
    analyteCode: 'LOINC: 2823-3',
    analyteName: 'Potassium Serum (K+)',
    analyteNameAr: 'بوتاسيوم المصل',
    unit: 'mmol/L',
    normalRangeLow: 3.5,
    normalRangeHigh: 5.1,
    criticalRangeHigh: 6.0,
    criticalRangeLow: 2.8,
    points: [
      { timestamp: '2026-09-12 08:00', timeLabel: '08:00 ص', value: 4.2, displayValue: '4.2', flag: 'normal', status: 'final' },
      { timestamp: '2026-09-12 11:00', timeLabel: '11:00 ص', value: 5.1, displayValue: '5.1', flag: 'borderline', status: 'final' },
      { timestamp: '2026-09-12 13:00', timeLabel: '13:00 م (قيمة حرجة)', value: 6.4, displayValue: '6.4', flag: 'critical_high', status: 'amended' },
      { timestamp: '2026-09-12 14:30', timeLabel: '14:30 م (بعد العلاج)', value: 4.8, displayValue: '4.8', flag: 'normal', status: 'final' }
    ]
  },
  {
    analyteCode: 'LOINC: 718-7',
    analyteName: 'Hemoglobin (Hb)',
    analyteNameAr: 'مستوى الهيموجلوبين',
    unit: 'g/dL',
    normalRangeLow: 13.0,
    normalRangeHigh: 17.5,
    points: [
      { timestamp: '2026-09-10 09:00', timeLabel: 'قبل يومين', value: 14.5, displayValue: '14.5', flag: 'normal', status: 'final' },
      { timestamp: '2026-09-11 08:30', timeLabel: 'أمس', value: 14.2, displayValue: '14.2', flag: 'normal', status: 'final' },
      { timestamp: '2026-09-12 10:35', timeLabel: 'اليوم، 10:35 ص', value: 13.9, displayValue: '13.9', flag: 'normal', status: 'final' }
    ]
  },
  {
    analyteCode: 'LOINC: 2160-0',
    analyteName: 'Serum Creatinine',
    analyteNameAr: 'كرياتينين المصل ووظائف الكلى',
    unit: 'mg/dL',
    normalRangeLow: 0.70,
    normalRangeHigh: 1.30,
    points: [
      { timestamp: '2026-09-10 09:00', timeLabel: 'قبل يومين', value: 0.95, displayValue: '0.95', flag: 'normal', status: 'final' },
      { timestamp: '2026-09-11 08:30', timeLabel: 'أمس', value: 1.02, displayValue: '1.02', flag: 'normal', status: 'final' },
      { timestamp: '2026-09-12 12:45', timeLabel: 'اليوم، 12:45 م', value: 1.05, displayValue: '1.05', flag: 'normal', status: 'final' }
    ]
  }
];

// =============================================================
// IMAGING & RADIOLOGY REPORTS (MOCK DATA)
// Supports: DICOM mock viewer, Comparison with prior study, Critical findings
// =============================================================
export const MOCK_IMAGING_REPORTS: ImagingReportItem[] = [
  {
    id: 'RAD-REP-2026-101',
    orderReferenceId: 'ORD-1092', // Linked to Axis 6 Order
    studyTitleAr: 'تخطيط كهربائية القلب التشخيصي بـ 12 مسرى (12-Lead Diagnostic ECG)',
    studyTitleEn: '12-Lead Diagnostic Electrocardiogram STAT',
    modality: 'ECG',
    bodyRegion: 'القلب / الصدر',
    performedAt: 'اليوم، 10:38',
    reportedAt: 'اليوم، 10:45',
    radiologist: 'د. طارق المنشاوي',
    radiologistRole: 'استشاري طب الطوارئ والقلب',
    status: 'final',
    reviewStatus: 'acknowledged',
    reviewedBy: 'د. خالد عبد العزيز (استشاري قسطرة)',
    reviewedAt: 'اليوم، 10:50',
    clinicalIndication: 'ألم صدري ضاغط حاد مع تعرق وغثيان (Chest Pain - Rule out STEMI/NSTEMI)',
    technique: 'Standard 12-lead surface ECG recorded at 25 mm/s, 10 mm/mV calibration.',
    comparisonPriorStudy: 'مقارنة مع تخطيط العيادة الخارجية المؤرخ 15 أغسطس 2026 (كان طبيعياً بدون انحرافات ST).',
    findings: 'نظم جيبي منتظم بمعدل 98 نبضة/دقيقة. انحراف قطاع ST سلبي (ST Depression) بمقدار 1.5 - 2.0 mm في المساري V4، V5، V6 مترافق مع انقلاب موجات T (T-Wave Inversion) في I و aVL. فترات PR و QTc ضمن الحدود الطبيعية. لا توجد موجات Q نخرية مرضية.',
    impression: 'تغيرات إقفارية حادة تحت الشغاف في الجدار الأمامي الجانبي متوافقة تماماً مع متلازمة إكليلية حادة عالية الخطورة (Acute NSTEMI / High-Risk Ischemia). يوصى بإجراء قسطرة تداخلية عاجلة.',
    criticalOrSignificantFindings: 'Dynamic ST-segment depression in anterolateral leads (V4-V6).',
    hasCriticalFindings: true,
    mockDicomStudy: {
      accessionNumber: 'ACC-ECG-2026-991',
      seriesCount: 1,
      instanceCount: 3,
      keyImages: [
        { id: 'img-ecg-01', title: '12-Lead Standard Rhythm Strip', description: 'V1-V6 Anterolateral ST Depression (1.8mm)', view: 'Standard 12-Lead Grid', annotation: 'ST-Depression V4-V6 Marked' },
        { id: 'img-ecg-02', title: 'Lead II Continuous Rhythm Strip (10s)', description: 'Sinus rhythm 98 bpm without AV block', view: 'Lead II Rhythm Strip' }
      ]
    }
  },
  {
    id: 'RAD-REP-2026-102',
    studyTitleAr: 'تصوير الصدر بالأشعة السينية المتنقلة (Portable Chest X-Ray AP View)',
    studyTitleEn: 'Portable Digital Chest Radiograph AP View',
    modality: 'XR',
    bodyRegion: 'الصدر والقفص الصدري',
    performedAt: 'اليوم، 10:45',
    reportedAt: 'اليوم، 11:20',
    radiologist: 'د. منى الشريف',
    radiologistRole: 'استشاري الأشعة التشخيصية',
    status: 'final',
    reviewStatus: 'reviewed',
    reviewedBy: 'د. طارق المنشاوي',
    reviewedAt: 'اليوم، 11:30',
    clinicalIndication: 'تقييم الاحتقان الرئوي واستبعاد استرواح الصدر أو انصباب الجنب.',
    technique: 'Single erect AP mobile projection at bedside using digital flat-panel detector.',
    comparisonPriorStudy: 'لا توجد دراسات شعاعية سابقة مسجلة في هذا المركز.',
    findings: 'الرئتان متوسعتان بصورة مرضية. لا توجد ارتشاحات سنخية بؤرية أو انصبابات جنبية حادة صريحة. علامات احتقان شعري رئوي خفيف بالجهتين مع زيادة طفيفة في حجم الظل القلبي (Cardiothoracic ratio ~ 0.52). القصبة الهوائية في المنتصف والمنصف متناسق.',
    impression: 'Mild cardiomegaly with borderline vascular congestion, no acute pulmonary consolidation or pneumothorax.',
    criticalOrSignificantFindings: 'No tension pneumothorax or acute alveolar pulmonary edema.',
    hasCriticalFindings: false,
    mockDicomStudy: {
      accessionNumber: 'ACC-CXR-2026-440',
      seriesCount: 1,
      instanceCount: 1,
      keyImages: [
        { id: 'img-cxr-01', title: 'Chest AP Erect Bedside', description: 'Clear lung fields, mild cardiomegaly', view: 'AP Supine/Erect' }
      ]
    }
  },
  {
    id: 'RAD-REP-2026-103',
    studyTitleAr: 'تخطيط صدى القلب عبر الصدر بجانب السرير (Bedside Transthoracic Echo - TTE)',
    studyTitleEn: 'Focused Bedside Transthoracic Echocardiogram (TTE)',
    modality: 'Echo',
    bodyRegion: 'القلب والصمامات',
    performedAt: 'اليوم، 12:30',
    reportedAt: 'اليوم، 13:05',
    radiologist: 'د. أيمن فوده',
    radiologistRole: 'استشاري أمراض القلب وقسطرة القلب',
    status: 'final',
    reviewStatus: 'acknowledged',
    reviewedBy: 'د. خالد عبد العزيز',
    reviewedAt: 'اليوم، 13:10',
    clinicalIndication: 'تقييم الحركة الجدارية ووظيفة البطين الأيسر وحجم حجرات القلب.',
    technique: '2D, M-Mode, Color and Spectral Doppler transthoracic examination using cardiac phased-array probe.',
    findings: 'البطين الأيسر ذو أبعاد طبيعية في نهاية الانبساط. وجود نقص حركية واضح في الجدار الأمامي السفلي والقمي (Antero-inferior & apical hypokinesia). الكسر القذفي المقدر (LVEF) 46-48%. الصمامات: قصور تاجي خفيف (Mild MR)، لا يوجد انصباب تأموري.',
    impression: 'Regional wall motion abnormalities localized to LAD/RCA vascular territory. Moderate reduction in LV systolic function (EF ~48%). Consistent with evolving ACS.',
    criticalOrSignificantFindings: 'Regional hypokinesia confirming active coronary ischemia.',
    hasCriticalFindings: true,
    mockDicomStudy: {
      accessionNumber: 'ACC-TTE-2026-118',
      seriesCount: 3,
      instanceCount: 12,
      keyImages: [
        { id: 'img-tte-01', title: 'Parasternal Long Axis 2D', description: 'LV wall thickness and mitral valve leaflets', view: 'PLAX 2D' },
        { id: 'img-tte-02', title: 'Apical 4-Chamber View', description: 'Regional wall motion hypokinesia at apex', view: 'A4C View' },
        { id: 'img-tte-03', title: 'Color Doppler Mitral Valve', description: 'Mild eccentric mitral regurgitation jet', view: 'Color Doppler' }
      ]
    }
  }
];

// =============================================================
// MICROBIOLOGY REPORTS (MOCK DATA)
// Antimicrobial Susceptibility Interpretation Profile (EUCAST / CLSI / Configured)
// In EUCAST: 'I' = Susceptible, increased exposure (حساس عند زيادة التعرض)
// In CLSI: 'I' = Intermediate (متوسط الحساسية)
// =============================================================
export const MOCK_MICROBIOLOGY_REPORTS: MicrobiologyReportItem[] = [
  {
    id: 'MIC-REP-2026-301',
    orderReferenceId: 'ORD-1090-BC',
    titleAr: 'مزرعة الدم الهوائية واللاهوائية (Blood Culture x2 Sets STAT)',
    titleEn: 'Blood Culture & Susceptibility Automated System',
    specimenType: 'دم وريدي مسحوب من موضعين معقمين مختلفين (Peripheral Venipuncture x2)',
    collectionSite: 'الذراع الأيمن والذراع الأيسر (Dual Site Protocol)',
    collectedAt: 'أمس، 22:15',
    resultedAt: 'اليوم، 11:45',
    status: 'final',
    reviewStatus: 'acknowledged',
    reviewedBy: 'د. طارق المنشاوي',
    reviewedAt: 'اليوم، 12:00',
    performingLab: 'مختبر الأحياء الدقيقة السريرية والعدوى',
    gramStain: 'Gram-positive cocci in clusters (مكورات موجبة الجرام في عناقيد)',
    growthStatus: 'growth',
    organismIdentified: 'Staphylococcus aureus (Methicillin-Susceptible - MSSA)',
    colonyCount: 'Growth detected in bottle 1 & 2 at 11 hours incubation (> 10^5 CFU/mL)',
    clinicalSignificance: 'ميكروب ممرض مؤكد إيجابي في زجاجتين منفصلتين يتطلب علاجاً موجهاً واستبعاد التهاب الشغاف الجرثومي.',
    isCriticalAlert: true,
    labComments: 'تم التحقق من الحساسية الدوائية عبر ملف EUCAST المعتمد بالمستشفى. سلالة MSSA حساسة لـ Cefazolin و Oxacillin.',
    interpretationProfile: {
      profileId: 'PROF-EUCAST-2026',
      interpretationStandard: 'EUCAST',
      standardVersion: 'EUCAST v13.1 (2023 Breakpoints)',
      organism: 'Staphylococcus aureus',
      profileDescription: 'الملف التفسيري الأوروبي المعتمد لمقاومة مضادات الميكروبات (EUCAST Clinical Breakpoints Table)',
      codeDefinitions: {
        'S': {
          code: 'S',
          labelAr: 'حساس بالجرعة القياسية (Susceptible, standard dosing regimen)',
          labelEn: 'Susceptible, standard dose',
          descriptionAr: 'احتمالية نجاح علاجي عالية بالجرعات القياسية المعتمدة.',
          badgeColor: 'emerald'
        },
        'I': {
          code: 'I',
          labelAr: 'حساس مع زيادة التعرض (Susceptible, increased exposure)',
          labelEn: 'Susceptible, increased exposure',
          descriptionAr: 'احتمالية نجاح علاجي عند تعديل نظام الجرعات لزيادة التعرض الدوائي في موضع العدوى.',
          badgeColor: 'amber'
        },
        'R': {
          code: 'R',
          labelAr: 'مقاوم سريرياً (Resistant)',
          labelEn: 'Resistant',
          descriptionAr: 'احتمالية فشل علاجي عالية حتى مع الجرعات القصوى.',
          badgeColor: 'rose'
        }
      }
    },
    susceptibilities: [
      {
        antibiotic: 'Oxacillin',
        mic: '<= 0.5 mg/L',
        interpretationCode: 'S',
        humanReadableInterpretation: 'حساس بالجرعة القياسية (Susceptible, standard dose)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 Broth Microdilution'
      },
      {
        antibiotic: 'Cefazolin',
        mic: '<= 1.0 mg/L',
        interpretationCode: 'S',
        humanReadableInterpretation: 'حساس بالجرعة القياسية (Susceptible, standard dose)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 Broth Microdilution'
      },
      {
        antibiotic: 'Vancomycin',
        mic: '1.0 mg/L',
        interpretationCode: 'S',
        humanReadableInterpretation: 'حساس بالجرعة القياسية (Susceptible, standard dose)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'E-Test / Broth Dilution'
      },
      {
        antibiotic: 'Ciprofloxacin',
        mic: '1.0 mg/L',
        zoneDiameter: '21 mm',
        interpretationCode: 'I',
        humanReadableInterpretation: 'حساس مع زيادة التعرض (Susceptible, increased exposure - EUCAST)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 & Disk Diffusion',
        interpretationNotes: 'وفق EUCAST v13.1 يتطلب جرعة مرتفعة 750mg BID لتحقيق التركيز العلاجي المطلوب.'
      },
      {
        antibiotic: 'Gentamicin',
        mic: '<= 0.5 mg/L',
        interpretationCode: 'S',
        humanReadableInterpretation: 'حساس بالجرعة القياسية (Susceptible, standard dose)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 Broth Microdilution'
      },
      {
        antibiotic: 'Levofloxacin',
        mic: '1.0 mg/L',
        interpretationCode: 'I',
        humanReadableInterpretation: 'حساس مع زيادة التعرض (Susceptible, increased exposure - EUCAST)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 Broth Microdilution',
        interpretationNotes: 'وفق EUCAST: زيادة الجرعة مطلوبة لضمان الكفاءة السريرية في البكتيريا العنقودية.'
      },
      {
        antibiotic: 'Trimethoprim / Sulfamethoxazole',
        mic: '<= 2/38 mg/L',
        interpretationCode: 'S',
        humanReadableInterpretation: 'حساس بالجرعة القياسية (Susceptible, standard dose)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 Broth Microdilution'
      },
      {
        antibiotic: 'Linezolid',
        mic: '1.5 mg/L',
        interpretationCode: 'S',
        humanReadableInterpretation: 'حساس بالجرعة القياسية (Susceptible, standard dose)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 Broth Microdilution'
      },
      {
        antibiotic: 'Erythromycin',
        mic: '>= 8.0 mg/L',
        interpretationCode: 'R',
        humanReadableInterpretation: 'مقاوم سريرياً (Resistant)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'VITEK-2 Broth Microdilution'
      },
      {
        antibiotic: 'Clindamycin',
        mic: '>= 4.0 mg/L',
        zoneDiameter: '12 mm',
        interpretationCode: 'R',
        humanReadableInterpretation: 'مقاوم سريرياً (Resistant)',
        interpretationStandard: 'EUCAST',
        standardVersion: 'v13.1',
        testMethod: 'Inducible D-Zone Positive'
      }
    ]
  }
];

// =============================================================
// PATHOLOGY REPORTS (MOCK DATA)
// Structured long-form: Specimen, Gross, Microscopic, Diagnosis, Amendments
// =============================================================
export const MOCK_PATHOLOGY_REPORTS: PathologyReportItem[] = [
  {
    id: 'PATH-REP-2026-501',
    orderReferenceId: 'ORD-1088-BX',
    titleAr: 'فحص الأنسجة وخثرة الشريان التاجي (Coronary Thrombus & Plaque Histology)',
    titleEn: 'Coronary Thrombectomy & Atheromatous Material Histopathological Examination',
    specimenDescription: 'خثرة دموية وشظايا عصيدية مجلوبة بالقسطرة الشفاطة من الشريان التاجي الأيمن (RCA Aspirate).',
    procedureType: 'Percutaneous Mechanical Thrombus Aspiration during Emergency Primary PCI',
    collectedAt: 'اليوم، 13:45',
    receivedAt: 'اليوم، 14:05',
    reportedAt: 'اليوم، 15:20',
    status: 'amended', // Exemplifies Versioned Amendment
    reviewStatus: 'reviewed',
    requiresExplicitAcknowledgement: false,
    reportProfile: {
      profileType: 'general_histopathology',
      profileNameAr: 'علم الأمراض النسيجي للقلب والأوعية (Cardiovascular Histopathology)',
      profileNameEn: 'Cardiovascular Histopathology',
      hasMargins: false,
      hasTumorStaging: false,
      hasAncillaryStudies: true,
      hasSynopticReporting: false
    },
    reviewedBy: 'د. خالد عبد العزيز',
    reviewedAt: 'اليوم، 15:40',
    pathologist: 'أ. د. نادية الجوهري (استشاري علم الأمراض النسيجي للقلب والأوعية)',
    clinicalHistory: 'مريض 58 سنة، احتشاء حاد بعضلة القلب NSTEMI/STEMI، قسطرة عاجلة كشفت انسداد RCA خثاري حاد.',
    grossDescription: 'الوصف العياني: تم استلام عينة معلقة في محلول الفورمالين 10%، تتكون من عدة شظايا نسيجية حمراء رمادية متخثرة يبلغ مجموع أبعادها 0.8 × 0.5 × 0.3 سم. تم تقطيع العينة بالكامل وتضمينها في كاسيت واحد (Block A1).',
    microscopicDescription: 'الوصف المجهري: تُظهر المقاطع النسيجية خثرة حديثة من الفيبرين غنية بالصفائح الدموية والصفائح الشحمية (Platelet-rich fibrin thrombus) متداخلة مع بلورات الكوليسترول المتكسرة وشظايا من الغطاء الليفي العصيدي المتمزق (Ruptured fibrous atheromatous cap). ارتشاح التهابي موضعي معتدل من العدلات (Neutrophils) وخلايا رغوية بلعمية (Foamy macrophages). لا توجد أدلة على التهاب أوعية تنخري أو بكتيريا.',
    ancillaryStudies: 'صبغات خاصة: Masson Trichrome أظهرت ألياف الكولاجين للغطاء العصيدي المتمزق. صبغة Gram سلبية للكائنات الدقيقة.',
    pathologicDiagnosis: 'Acute coronary thrombus superimposed on a ruptured fibroatheromatous plaque, consistent with Acute Type 1 Myocardial Infarction.',
    summaryInterpretation: 'النتيجة النسيجية تثبت حدوث تمزق في لويحة عصيدية دهنية هشة تلاها تشكل خثرة انسدادية حادة، وهي الآلية الكلاسيكية للاحتشاء القلبي الحاد النوع الأول.',
    amendments: [
      {
        id: 'AMD-PATH-01',
        version: 2,
        amendedAt: 'اليوم، 15:45',
        amendedBy: 'أ. د. نادية الجوهري',
        reason: 'إضافة توثيق نتيجة صبغة الفون كوزا (Von Kossa Calcium Stain) لتحديد وجود التكلسات الدقيقة في الجدار العصيدي.',
        previousReportSummary: 'Pathology diagnosis without specific calcium micro-calcification note.',
        amendedReportSummary: 'Added ancillary finding: Focal microcalcification identified within the core of the necrotic lipid pool.',
        changedFields: [
          { fieldName: 'Ancillary Studies', oldValue: 'Masson Trichrome & Gram stain', newValue: 'Masson Trichrome, Gram stain, & Von Kossa (Focal microcalcification positive)' }
        ]
      }
    ]
  },
  {
    id: 'PATH-REP-2026-502',
    orderReferenceId: 'ORD-1099-ONC',
    titleAr: 'تقرير الأورام البروتوكولي التلخيصي (Synoptic Oncology Pathology Report)',
    titleEn: 'Right Colon Resection - Protocol Synoptic Cancer Checklist',
    specimenDescription: 'Right hemicolectomy specimen, ileocecal valve, and terminal ileum.',
    procedureType: 'Laparoscopic Right Hemicolectomy',
    collectedAt: '2026-09-08 10:15',
    receivedAt: '2026-09-08 11:30',
    reportedAt: '2026-09-10 14:00',
    status: 'final',
    reviewStatus: 'acknowledged',
    requiresExplicitAcknowledgement: true,
    reportProfile: {
      profileType: 'oncology_synoptic',
      profileNameAr: 'تقرير بروتوكول الأورام التلخيصي (Synoptic Cancer Protocol - CAP/AJCC)',
      profileNameEn: 'Synoptic Cancer Protocol (CAP/AJCC)',
      hasMargins: true,
      hasTumorStaging: true,
      hasAncillaryStudies: true,
      hasSynopticReporting: true
    },
    reviewedBy: 'د. طارق المنشاوي',
    reviewedAt: '2026-09-10 16:30',
    pathologist: 'د. سامي رضوان (استشاري علم أمراض الأورام والجهاز الهضمي)',
    clinicalHistory: 'Adenocarcinoma of the cecum identified on screening colonoscopy.',
    grossDescription: 'Exophytic ulcerated mass measuring 3.5 x 2.8 x 1.2 cm in the cecum. 18 regional lymph nodes harvested.',
    microscopicDescription: 'Invasive moderately differentiated adenocarcinoma invading into the muscularis propria but not extending into the subserosa.',
    ancillaryStudies: 'MMR Immunohistochemistry: Intact MLH1, PMS2, MSH2, MSH6 (Mismatch Repair Proficient / MSS).',
    surgicalMargins: {
      status: 'negative',
      statusLabelAr: 'حواف استئصال جراحية سليمة وسلبية (Clear Margins R0)',
      distanceToClosestMargin: 'أقرب حافة شعاعية تبعد 18 مم، الحواف القريبة والبعيدة > 5 سم',
      details: 'Proximal, distal, and mesenteric radial margins are all uninvolved by invasive carcinoma.'
    },
    tumorStaging: {
      system: 'AJCC TNM 8th Edition (Colon & Rectum)',
      primaryTumor_pT: 'pT2 (Tumor invades muscularis propria)',
      regionalNodes_pN: 'pN0 (0 of 18 regional lymph nodes involved)',
      distantMetastasis_pM: 'cM0 (No distant metastasis clinically)',
      overallStage: 'Stage I (pT2 pN0 cM0)',
      histologicGrade: 'G2 - Moderately Differentiated'
    },
    pathologicDiagnosis: 'Invasive Moderately Differentiated Adenocarcinoma of Cecum, pT2 pN0, Margins Negative (R0).',
    summaryInterpretation: 'استئصال كامل جذري مع حواف سليمة وغياب إصابة العقد اللمفاوية (مرحلة أولى منخفضة الخطورة). يوصى بالمتابعة الدورية.'
  }
];
