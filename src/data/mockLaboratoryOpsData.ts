// Mock Data for Laboratory, Microbiology & Pathology Operations UX
import {
  IncomingLabOrder,
  LabSpecimen,
  LabAccession,
  MicrobiologyCase,
  PathologyCase,
  SendOutShipment,
  InstrumentOperationalStatus,
  SpecimenRejectionPolicy,
  LaboratoryPersona
} from '../types/laboratoryOps';

export const MOCK_REJECTION_POLICIES: SpecimenRejectionPolicy[] = [
  {
    code: 'hemolyzed',
    labelAr: 'انحلال الدم الشديد (Severe Hemolysis)',
    labelEn: 'Severe Hemolysis (Interferes with K+, LDH, AST)',
    description: 'يؤثر سلباً على نتائج البوتاسيوم والإنزيمات الكبدية، تتطلب سياسة المنشأة إعادة السحب.',
    recollectionRecommended: true,
    requiresClinicianNotice: true
  },
  {
    code: 'clotted',
    labelAr: 'تخثر عينة الدم الكامل (Clotted Specimen in Anticoagulant)',
    labelEn: 'Clotted Blood Sample (EDTA/Citrate)',
    description: 'وجود خثرة في أنبوب مانع التخثر يبطل دقة تعداد الدم الكامل وتخثر الدم.',
    recollectionRecommended: true,
    requiresClinicianNotice: true
  },
  {
    code: 'wrong_container',
    labelAr: 'أنبوب / وعاء غير مطابق للتحليل (Incorrect Container Type)',
    labelEn: 'Incorrect Container / Tube Type',
    description: 'سحب العينة في أنبوب يحتوي على مادة مضافة غير مناسبة للفحص المخبري المطلوب.',
    recollectionRecommended: true,
    requiresClinicianNotice: true
  },
  {
    code: 'insufficient_volume',
    labelAr: 'كمية غير كافية للتحليل (QNS - Quantity Not Sufficient)',
    labelEn: 'Quantity Not Sufficient (QNS)',
    description: 'حجم العينة أقل من الحد الأدنى اللازم لتشغيل الأجهزة وتكرار الاختبارات.',
    recollectionRecommended: true,
    requiresClinicianNotice: true
  },
  {
    code: 'leaked',
    labelAr: 'تسريب العينة وتلف الحاوية (Leaked / Broken Container)',
    labelEn: 'Leaked / Compromised Container',
    description: 'تسرب العينة أثناء النقل مع خطر بيولوجي وعدم مطابقة الحجم والعقامة.',
    recollectionRecommended: true,
    requiresClinicianNotice: true
  },
  {
    code: 'unlabeled',
    labelAr: 'عينة غير معرّفة أو مجهولة (Unlabeled Specimen)',
    labelEn: 'Unlabeled Specimen (Safety Breach)',
    description: 'عدم وجود ملصق تعريفي؛ لا يجوز قبول العينة وفقاً لمعايير سلامة المرضى الدولية.',
    recollectionRecommended: true,
    requiresClinicianNotice: true
  },
  {
    code: 'delayed_transport',
    labelAr: 'تأخر النقل وتجاوز زمن الثباتية (Exceeded Transport Stability)',
    labelEn: 'Transport Time Limit Exceeded',
    description: 'تأخر وصول العينة للقسم متجاوزاً نافذة الصلاحية لغازات الدم أو الأمونيا أو التخثر.',
    recollectionRecommended: true,
    requiresClinicianNotice: true
  }
];

export const MOCK_LAB_PERSONAS: LaboratoryPersona[] = [
  {
    roleId: 'lab_technician',
    titleAr: 'أخصائي مختبرات سريرية (Medical Technologist)',
    titleEn: 'Medical Laboratory Technologist',
    descriptionAr: 'استقبال العينات، التحليل الآلي على البنش، التحقق الفني وإطلاق النتائج الأولية والنهائية.'
  },
  {
    roleId: 'phlebotomist',
    titleAr: 'أخصائي سحب العينات (Phlebotomist)',
    titleEn: 'Phlebotomist / Collection Nurse',
    descriptionAr: 'التحقق من هوية المريض، مطابقة الأنابيب، سحب العينات، وطباعة الملصقات التعريفية.'
  },
  {
    roleId: 'microbiologist',
    titleAr: 'أخصائي الأحياء الدقيقة (Microbiologist)',
    titleEn: 'Clinical Microbiologist',
    descriptionAr: 'زرع العينات، تقييم صبغة غرام الأولية، قراءة الأطباق، فحص الحساسية الدوائية (AST).'
  },
  {
    roleId: 'pathology_tech',
    titleAr: 'فني تشريح نسيجي (Histotechnologist)',
    titleEn: 'Histology Technologist',
    descriptionAr: 'فحص العينات العياني (Grossing)، التقطيع والشمع، إعداد البلوكات، وتلوين الشرائح المجهرية.'
  },
  {
    roleId: 'pathologist',
    titleAr: 'استشاري علم الأمراض (Pathologist)',
    titleEn: 'Consultant Pathologist',
    descriptionAr: 'مراجعة الشرائح المجهرية، صياغة التشخيص النهائي، كتابة التقارير المتزامنة وتوقيع الحالات.'
  },
  {
    roleId: 'lab_supervisor',
    titleAr: 'مشرف الجودة والعمليات (Laboratory Supervisor)',
    titleEn: 'Lab Supervisor / Operations Lead',
    descriptionAr: 'مراقبة زمن الاستجابة (TAT)، تتبع العينات المعلقة والاستثناءات، ومراجعة ضبط الجودة.'
  }
];

export const MOCK_INSTRUMENTS: InstrumentOperationalStatus[] = [
  {
    id: 'inst-chem-1',
    name: 'Roche Cobas 8000 (Chemistry Unit 01)',
    section: 'chemistry',
    status: 'operational',
    statusMessage: 'يعمل بكفاءة - تم ضبط المعايرة الصباحية',
    queueCount: 14,
    qcStatus: 'acceptable',
    lastMaintenanceDate: '2026-09-12'
  },
  {
    id: 'inst-chem-2',
    name: 'Roche Cobas 8000 (Chemistry Unit 02)',
    section: 'chemistry',
    status: 'processing',
    statusMessage: 'جاري تشغيل باقة وظائف كبد وكلى مستعجلة',
    queueCount: 8,
    qcStatus: 'acceptable',
    lastMaintenanceDate: '2026-09-10'
  },
  {
    id: 'inst-hem-1',
    name: 'Sysmex XN-9000 (Hematology Line)',
    section: 'hematology',
    status: 'operational',
    statusMessage: 'يعمل بكفاءة - صبغة الشرائح الآلية مفعلة',
    queueCount: 19,
    qcStatus: 'acceptable',
    lastMaintenanceDate: '2026-09-11'
  },
  {
    id: 'inst-coag-1',
    name: 'Stago STA R Max (Coagulation Analyzer)',
    section: 'coagulation',
    status: 'operational',
    statusMessage: 'يعمل بكفاءة - كواشف التخثر مكتملة',
    queueCount: 6,
    qcStatus: 'acceptable',
    lastMaintenanceDate: '2026-09-08'
  },
  {
    id: 'inst-micro-1',
    name: 'BD BACTEC FX (Blood Culture Incubator)',
    section: 'microbiology',
    status: 'operational',
    statusMessage: '4 أجهزة حضانة إيجابية بانتظار صبغة غرام',
    queueCount: 42,
    qcStatus: 'acceptable',
    lastMaintenanceDate: '2026-09-01'
  },
  {
    id: 'inst-micro-2',
    name: 'Bruker MALDI-TOF (Microbial ID Platform)',
    section: 'microbiology',
    status: 'operational',
    statusMessage: 'جاهز للتحليل الطيفي السريع للكتلة',
    queueCount: 5,
    qcStatus: 'acceptable',
    lastMaintenanceDate: '2026-09-05'
  },
  {
    id: 'inst-path-1',
    name: 'Leica ASP300 S (Tissue Processor)',
    section: 'pathology',
    status: 'processing',
    statusMessage: 'دورة سحب الماء والتثبيت بالشمع - متبقي ساعتان',
    queueCount: 28,
    qcStatus: 'acceptable',
    lastMaintenanceDate: '2026-09-12'
  },
  {
    id: 'inst-chem-backup',
    name: 'Abbott Architect i2000SR (Backup Immunoassay)',
    section: 'chemistry',
    status: 'maintenance',
    statusMessage: 'صيانة وقائية دورية مجدولة (Maintenance In Progress)',
    queueCount: 0,
    qcStatus: 'review_required',
    lastMaintenanceDate: '2026-09-13'
  }
];

export const MOCK_INCOMING_ORDERS: IncomingLabOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-LAB-2026-0913-01',
    patientId: 'p-1',
    patientName: 'محمد أحمد علي السعيد',
    mrn: 'MRN-2026-0419',
    encounterId: 'enc-er-901',
    encounterDepartment: 'er',
    bedLocation: 'ER - Acute Bed 03',
    orderingDoctor: 'د. يوسف المنصور',
    orderingService: 'Emergency Medicine',
    clinicalIndication: 'ألم حاد بالصدر مع تعرق - اشتباه متلازمة الشريان التاجي الحادة (ACS)',
    orderDateTime: '2026-09-13 10:15',
    priority: 'stat',
    targetSection: 'chemistry',
    testPanelsRequested: [
      'High-Sensitivity Troponin I (hs-cTnI)',
      'Comprehensive Metabolic Panel (CMP)',
      'Complete Blood Count (CBC)'
    ],
    collectionRequirements: 'دم وريدي: 1 أنبوب جل SST (غطاء ذهبي) + 1 أنبوب EDTA (غطاء بنفسجي)',
    status: 'collection_pending',
    specimenIds: ['spec-001', 'spec-002']
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-LAB-2026-0913-02',
    patientId: 'p-2',
    patientName: 'فاطمة خالد الحربي',
    mrn: 'MRN-2026-1182',
    encounterId: 'enc-icu-302',
    encounterDepartment: 'icu',
    bedLocation: 'ICU - Bed 01',
    orderingDoctor: 'د. سارة العتيبي',
    orderingService: 'Critical Care / ICU',
    clinicalIndication: 'صدمة إنتانية واشتباه تجرثم دم حاد بعد استئصال المرارة',
    orderDateTime: '2026-09-13 09:30',
    priority: 'urgent',
    targetSection: 'microbiology',
    testPanelsRequested: [
      'Blood Culture & Sensitivity (Aerobic + Anaerobic x 2 sets)',
      'Procalcitonin (PCT)'
    ],
    collectionRequirements: 'سحب دم معقم من موقعين مختلفين (4 زجاجات حضانة BACTEC)',
    status: 'in_process',
    specimenIds: ['spec-003', 'spec-004']
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-LAB-2026-0913-03',
    patientId: 'p-3',
    patientName: 'سلطان عبدالعزيز الشمري',
    mrn: 'MRN-2026-3840',
    encounterId: 'enc-or-711',
    encounterDepartment: 'ipd',
    bedLocation: 'OR - Theatre 02',
    orderingDoctor: 'د. طارق الهاشمي',
    orderingService: 'Endocrine Surgery',
    clinicalIndication: 'كتلة درقية يمنى مشبوهة (Bethesda V) - استئصال الفص الأيمن والغدد الليمفاوية',
    orderDateTime: '2026-09-13 08:45',
    priority: 'routine',
    targetSection: 'pathology',
    testPanelsRequested: [
      'Surgical Pathology Examination (Gross & Microscopic)',
      'IHC Reflex Protocol if Carcinoma Confirmed'
    ],
    collectionRequirements: 'حاويتان مغلقتان في 10% فورمالين معقم مع تعليم الخيوط الجراحية',
    status: 'in_process',
    specimenIds: ['spec-005', 'spec-006']
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-LAB-2026-0913-04',
    patientId: 'p-4',
    patientName: 'نورة سعد الدوسري',
    mrn: 'MRN-2026-2914',
    encounterId: 'enc-opd-440',
    encounterDepartment: 'opd',
    orderingDoctor: 'د. ريم الغامدي',
    orderingService: 'Outpatient Hematology',
    clinicalIndication: 'اشتباه متلازمة خلل التنسج النخاعي (MDS) - فحص وراثي مرجعي متقدم',
    orderDateTime: '2026-09-13 08:15',
    priority: 'routine',
    targetSection: 'send_out',
    testPanelsRequested: [
      'Next-Gen Sequencing (NGS) Myeloid Mutation Panel (External Reference)'
    ],
    collectionRequirements: '2 أنبوب EDTA دم كامل 10mL مع شحن مبرد فورياً',
    status: 'in_process',
    specimenIds: ['spec-007']
  }
];

export const MOCK_SPECIMENS: LabSpecimen[] = [
  {
    id: 'spec-001',
    specimenBarcode: 'SPEC-8821940',
    orderId: 'ord-101',
    patientId: 'p-1',
    patientName: 'محمد أحمد علي السعيد',
    mrn: 'MRN-2026-0419',
    encounterId: 'enc-er-901',
    specimenType: 'دم وريدي (Venous Blood)',
    containerType: 'SST Gel Tube (Gold Top)',
    containerColorHex: '#EAB308',
    collectionLocation: 'ER - Acute Bed 03',
    collectionPriority: 'stat',
    scheduledCollectionTime: '2026-09-13 10:20',
    collectedDateTime: '2026-09-13 10:25',
    collectorName: 'ممرض الطوارئ: رائد الفهد',
    receivedDateTime: '2026-09-13 10:32',
    receiverName: 'فني الاستقبال: مروان الشريف',
    transportCondition: 'ambient',
    temperatureAtReceipt: '22.4°C',
    status: 'accepted',
    specialInstructions: 'حالة قلبية حرجة STAT - فصل المصل فورياً'
  },
  {
    id: 'spec-002',
    specimenBarcode: 'SPEC-8821941',
    orderId: 'ord-101',
    patientId: 'p-1',
    patientName: 'محمد أحمد علي السعيد',
    mrn: 'MRN-2026-0419',
    encounterId: 'enc-er-901',
    specimenType: 'دم كامل (Whole Blood)',
    containerType: 'K2-EDTA (Lavender Top)',
    containerColorHex: '#8B5CF6',
    collectionLocation: 'ER - Acute Bed 03',
    collectionPriority: 'stat',
    scheduledCollectionTime: '2026-09-13 10:20',
    collectedDateTime: '2026-09-13 10:25',
    collectorName: 'ممرض الطوارئ: رائد الفهد',
    receivedDateTime: '2026-09-13 10:32',
    receiverName: 'فني الاستقبال: مروان الشريف',
    transportCondition: 'ambient',
    temperatureAtReceipt: '22.4°C',
    status: 'accepted',
    specialInstructions: 'تحريك الأنبوب بلطف 8 مرات لمنع التخثر'
  },
  {
    id: 'spec-rejection-demo',
    specimenBarcode: 'SPEC-8821989',
    orderId: 'ord-101',
    patientId: 'p-1',
    patientName: 'محمد أحمد علي السعيد',
    mrn: 'MRN-2026-0419',
    encounterId: 'enc-er-901',
    specimenType: 'مصل دم (Serum)',
    containerType: 'SST Gel Tube (Gold Top)',
    containerColorHex: '#EAB308',
    collectionLocation: 'ER - Acute Bed 03',
    collectionPriority: 'stat',
    scheduledCollectionTime: '2026-09-13 09:40',
    collectedDateTime: '2026-09-13 09:48',
    collectorName: 'ممرض الطوارئ: رائد الفهد',
    receivedDateTime: '2026-09-13 09:55',
    receiverName: 'فني الاستقبال: مروان الشريف',
    transportCondition: 'ambient',
    temperatureAtReceipt: '23.1°C',
    status: 'rejected',
    rejectionInfo: {
      rejectedAt: '2026-09-13 09:58',
      rejectedBy: 'أخصائي الكيمياء: م. عاصم النجار',
      reasonCode: 'hemolyzed',
      reasonDescription: 'مصل دم منحل بشدة (Gross Hemolysis Index = ++++) يبطل دقة قياس البوتاسيوم والتروبونين.',
      actionTaken: 'recollection_requested'
    },
    recollectionLinkedId: 'spec-001',
    specialInstructions: 'عينة مرفوضة - تم طلب إعادة السحب تلقائياً مع إشعار القسم'
  },
  {
    id: 'spec-003',
    specimenBarcode: 'SPEC-7730112',
    orderId: 'ord-102',
    patientId: 'p-2',
    patientName: 'فاطمة خالد الحربي',
    mrn: 'MRN-2026-1182',
    encounterId: 'enc-icu-302',
    specimenType: 'مزرعة دم هوائية ولياهوائية (Blood Culture Bottles)',
    containerType: 'BD BACTEC Plus Aerobic/F (Silver/Blue)',
    containerColorHex: '#0284C7',
    collectionLocation: 'ICU - Bed 01 (Right Arm)',
    collectionPriority: 'urgent',
    scheduledCollectionTime: '2026-09-13 09:35',
    collectedDateTime: '2026-09-13 09:40',
    collectorName: 'تمريض العناية: أمل الشريف',
    receivedDateTime: '2026-09-13 09:50',
    receiverName: 'فني المايكرو: هناء القحطاني',
    transportCondition: 'ambient',
    temperatureAtReceipt: '24.0°C',
    status: 'accepted',
    specialInstructions: 'حضانة فورية في جهاز BACTEC بدرجة 35°C'
  },
  {
    id: 'spec-005',
    specimenBarcode: 'SPEC-6620980',
    orderId: 'ord-103',
    patientId: 'p-3',
    patientName: 'سلطان عبدالعزيز الشمري',
    mrn: 'MRN-2026-3840',
    encounterId: 'enc-or-711',
    specimenType: 'عينة جراحية مستأصلة (Surgical Resection Tissue)',
    containerType: 'Pathology Specimen Bucket (10% NBF)',
    containerColorHex: '#10B981',
    collectionLocation: 'OR - Theatre 02',
    collectionPriority: 'routine',
    scheduledCollectionTime: '2026-09-13 08:50',
    collectedDateTime: '2026-09-13 09:10',
    collectorName: 'ممرض العمليات: ناصر الشهري',
    receivedDateTime: '2026-09-13 09:30',
    receiverName: 'فني الباثولوجي: وليد الدوسري',
    transportCondition: 'ambient',
    temperatureAtReceipt: '21.5°C',
    status: 'accepted',
    specialInstructions: 'حاوية أ: فص الغدة الدرقية الأيمن مع خيط علوي طويل'
  }
];

export const MOCK_CORE_LAB_ACCESSIONS: LabAccession[] = [
  {
    id: 'acc-chem-01',
    accessionNumber: 'ACC-2026-0913-0042',
    orderId: 'ord-101',
    patientId: 'p-1',
    patientName: 'محمد أحمد علي السعيد',
    mrn: 'MRN-2026-0419',
    encounterId: 'enc-er-901',
    encounterType: 'er',
    orderingDoctor: 'د. يوسف المنصور',
    orderingService: 'Emergency Medicine',
    clinicalDiagnosis: 'Acute Coronary Syndrome (ACS) Rule-out',
    priority: 'stat',
    section: 'chemistry',
    specimenIds: ['spec-001'],
    testPanelName: 'Comprehensive Metabolic Panel (CMP) + Cardiac Troponin',
    receivedDateTime: '2026-09-13 10:32',
    accessionedDateTime: '2026-09-13 10:34',
    tatTargetMinutes: 45,
    status: 'awaiting_tech_val',
    instrumentContext: {
      analyzerId: 'inst-chem-1',
      analyzerName: 'Roche Cobas 8000 (Unit 01)',
      qcStatus: 'acceptable',
      isMaintenance: false
    },
    criticalCommunication: {
      isCritical: true,
      requiredPolicy: 'read_back_required',
      identifiedAt: '2026-09-13 10:48',
      communicatedTo: 'ممرض الطوارئ: رائد الفهد',
      communicatedToRole: 'Staff Nurse (ER Care Team)',
      communicatedAt: '2026-09-13 10:52',
      callerStaffName: 'أخصائي الكيمياء: م. عاصم النجار',
      readBackConfirmed: true,
      acknowledgementStatus: 'acknowledged',
      communicationNote: 'تم إبلاغ الطوارئ هاتفياً بنتيجة البوتاسيوم الحرجة (6.8 mmol/L) مع تأكيد القراءة المتبادلة (Read-Back Confirmed) وجاري تكرار العينة للتأكيد.'
    },
    tests: [
      {
        id: 't-potassium',
        testCode: 'K',
        testNameAr: 'البوتاسيوم في المصل (Potassium)',
        testNameEn: 'Potassium, Serum',
        numericValue: 6.8,
        unit: 'mmol/L',
        referenceRangeText: '3.5 - 5.1 mmol/L',
        referenceLow: 3.5,
        referenceHigh: 5.1,
        criticalLow: 2.8,
        criticalHigh: 6.2,
        flag: 'critical_high',
        previousValue: '4.4 mmol/L (أمس)',
        previousDelta: '+ 2.4 mmol/L (Delta Alert)',
        instrumentName: 'Roche Cobas 8000 (Unit 01)',
        instrumentFlag: 'Repeat Confirmed on Channel B (6.81)',
        status: 'technically_verified',
        technicallyVerifiedBy: 'م. عاصم النجار',
        technicallyVerifiedAt: '2026-09-13 10:50',
        version: 1,
        versionHistory: []
      },
      {
        id: 't-troponin',
        testCode: 'hs-cTnI',
        testNameAr: 'تروبونين عالي الحساسية (hs-Troponin I)',
        testNameEn: 'High-Sensitivity Troponin I',
        numericValue: 142.5,
        unit: 'ng/L',
        referenceRangeText: '< 14.0 ng/L (99th percentile)',
        referenceLow: 0,
        referenceHigh: 14.0,
        criticalLow: undefined,
        criticalHigh: 50.0,
        flag: 'critical_high',
        previousValue: '6.2 ng/L (قبل شهر)',
        instrumentName: 'Roche Cobas 8000 (Unit 01)',
        instrumentFlag: 'High Positivity Flag',
        status: 'technically_verified',
        technicallyVerifiedBy: 'م. عاصم النجار',
        technicallyVerifiedAt: '2026-09-13 10:50',
        version: 1,
        versionHistory: []
      },
      {
        id: 't-sodium',
        testCode: 'NA',
        testNameAr: 'الصوديوم في المصل (Sodium)',
        testNameEn: 'Sodium, Serum',
        numericValue: 139,
        unit: 'mmol/L',
        referenceRangeText: '136 - 145 mmol/L',
        referenceLow: 136,
        referenceHigh: 145,
        criticalLow: 120,
        criticalHigh: 160,
        flag: 'normal',
        previousValue: '141 mmol/L',
        instrumentName: 'Roche Cobas 8000 (Unit 01)',
        status: 'technically_verified',
        version: 1
      },
      {
        id: 't-creatinine',
        testCode: 'CREAT',
        testNameAr: 'الكرياتينين (Creatinine)',
        testNameEn: 'Creatinine, Serum',
        numericValue: 1.45,
        unit: 'mg/dL',
        referenceRangeText: '0.70 - 1.20 mg/dL',
        referenceLow: 0.70,
        referenceHigh: 1.20,
        criticalHigh: 4.0,
        flag: 'abnormal_high',
        previousValue: '1.10 mg/dL',
        instrumentName: 'Roche Cobas 8000 (Unit 01)',
        status: 'technically_verified',
        version: 1
      },
      {
        id: 't-glucose',
        testCode: 'GLU',
        testNameAr: 'السكر العشوائي (Random Blood Glucose)',
        testNameEn: 'Glucose, Random',
        numericValue: 198,
        unit: 'mg/dL',
        referenceRangeText: '70 - 140 mg/dL',
        referenceLow: 70,
        referenceHigh: 140,
        criticalLow: 45,
        criticalHigh: 450,
        flag: 'abnormal_high',
        previousValue: '165 mg/dL',
        instrumentName: 'Roche Cobas 8000 (Unit 01)',
        status: 'technically_verified',
        version: 1
      }
    ]
  },
  {
    id: 'acc-hem-01',
    accessionNumber: 'ACC-2026-0913-0043',
    orderId: 'ord-101',
    patientId: 'p-1',
    patientName: 'محمد أحمد علي السعيد',
    mrn: 'MRN-2026-0419',
    encounterId: 'enc-er-901',
    encounterType: 'er',
    orderingDoctor: 'د. يوسف المنصور',
    orderingService: 'Emergency Medicine',
    clinicalDiagnosis: 'Acute Coronary Syndrome Rule-out',
    priority: 'stat',
    section: 'hematology',
    specimenIds: ['spec-002'],
    testPanelName: 'Complete Blood Count (CBC with Differential)',
    receivedDateTime: '2026-09-13 10:32',
    accessionedDateTime: '2026-09-13 10:35',
    tatTargetMinutes: 30,
    status: 'released',
    instrumentContext: {
      analyzerId: 'inst-hem-1',
      analyzerName: 'Sysmex XN-9000 (Hematology Line)',
      qcStatus: 'acceptable',
      isMaintenance: false
    },
    tests: [
      {
        id: 't-wbc',
        testCode: 'WBC',
        testNameAr: 'كريات الدم البيضاء (White Blood Cells)',
        testNameEn: 'White Blood Cell Count',
        numericValue: 11.8,
        unit: '10^9/L',
        referenceRangeText: '4.0 - 11.0 10^9/L',
        referenceLow: 4.0,
        referenceHigh: 11.0,
        criticalLow: 1.5,
        criticalHigh: 30.0,
        flag: 'abnormal_high',
        previousValue: '7.8 10^9/L',
        instrumentName: 'Sysmex XN-9000',
        status: 'final',
        technicallyVerifiedBy: 'أ. داليا العمري',
        technicallyVerifiedAt: '2026-09-13 10:42',
        version: 1
      },
      {
        id: 't-hgb',
        testCode: 'HGB',
        testNameAr: 'الهيموجلوبين (Hemoglobin)',
        testNameEn: 'Hemoglobin',
        numericValue: 14.1,
        unit: 'g/dL',
        referenceRangeText: '13.5 - 17.5 g/dL',
        referenceLow: 13.5,
        referenceHigh: 17.5,
        criticalLow: 7.0,
        criticalHigh: 20.0,
        flag: 'normal',
        previousValue: '14.5 g/dL',
        instrumentName: 'Sysmex XN-9000',
        status: 'final',
        technicallyVerifiedBy: 'أ. داليا العمري',
        technicallyVerifiedAt: '2026-09-13 10:42',
        version: 1
      },
      {
        id: 't-plt',
        testCode: 'PLT',
        testNameAr: 'الصفائح الدموية (Platelets)',
        testNameEn: 'Platelet Count',
        numericValue: 245,
        unit: '10^9/L',
        referenceRangeText: '150 - 450 10^9/L',
        referenceLow: 150,
        referenceHigh: 450,
        criticalLow: 30,
        criticalHigh: 1000,
        flag: 'normal',
        previousValue: '260 10^9/L',
        instrumentName: 'Sysmex XN-9000',
        status: 'final',
        technicallyVerifiedBy: 'أ. داليا العمري',
        technicallyVerifiedAt: '2026-09-13 10:42',
        version: 1
      }
    ]
  }
];

export const MOCK_MICROBIOLOGY_CASES: MicrobiologyCase[] = [
  {
    id: 'micro-case-01',
    accessionNumber: 'MIC-2026-0913-0018',
    orderId: 'ord-102',
    patientId: 'p-2',
    patientName: 'فاطمة خالد الحربي',
    mrn: 'MRN-2026-1182',
    encounterId: 'enc-icu-302',
    encounterType: 'icu',
    bedLocation: 'ICU - Bed 01',
    specimenId: 'spec-003',
    specimenType: 'مزرعة دم (Blood Culture - Peripheral)',
    anatomicalSite: 'الذراع الأيمن (Right Antecubital Fossa)',
    collectionDateTime: '2026-09-13 09:40',
    receivedDateTime: '2026-09-13 09:50',
    cultureType: 'Blood Culture Routine (Aerobic + Anaerobic)',
    incubationStartedAt: '2026-09-13 10:00',
    incubationDurationHours: 18,
    incubationTargetHours: 120, // 5 days standard incubation
    isExtendedIncubation: false,
    status: 'organism_identified',
    criticalFlag: true,
    gramStainPreliminary: {
      reportedAt: '2026-09-13 14:15',
      reportedBy: 'أخصائية الأحياء الدقيقة: سناء السبيعي',
      findings: 'Gram-positive cocci in clusters (Staphylococcus morphology)',
      wbcObserved: 'Moderate polymorphonuclear leukocytes observed',
      status: 'preliminary_released',
      comments: 'تم إبلاغ طبيب العناية المركزة فورياً عبر الهاتف بالنتيجة الأولية لصبغة غرام.'
    },
    organisms: [
      {
        id: 'org-1',
        organismName: 'Staphylococcus aureus (MSSA/MRSA rule-out)',
        snomedCode: '3092008',
        colonyCount: 'Growth in 1 of 2 bottles at 14 hours',
        clinicalSignificance: 'significant',
        astRows: [
          {
            id: 'ast-1',
            antimicrobial: 'Oxacillin',
            method: 'automated_mic',
            measuredValue: '<= 0.5 mcg/mL',
            interpretation: 'S',
            interpretationMeaning: 'Susceptible (Sensitive)',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'S <= 2 mg/L, R > 2 mg/L'
          },
          {
            id: 'ast-2',
            antimicrobial: 'Vancomycin',
            method: 'automated_mic',
            measuredValue: '1.0 mcg/mL',
            interpretation: 'S',
            interpretationMeaning: 'Susceptible',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'S <= 2 mg/L, R > 2 mg/L'
          },
          {
            id: 'ast-3',
            antimicrobial: 'Ciprofloxacin',
            method: 'automated_mic',
            measuredValue: '1.0 mcg/mL',
            interpretation: 'I',
            // CRITICAL INVARIANT: In EUCAST, 'I' = Susceptible, increased exposure.
            interpretationMeaning: 'Susceptible, increased exposure (EUCAST: يتطلب جرعة أعلى أو تركيزاً نسيجياً مكثفاً)',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'S <= 0.001 mg/L, R > 1 mg/L',
            comments: 'في تصنيف EUCAST يرمز "I" إلى الحساسية عند التعرض المكثف (Increased exposure) وليس متوسط المقاومة'
          },
          {
            id: 'ast-4',
            antimicrobial: 'Gentamicin',
            method: 'automated_mic',
            measuredValue: '<= 1.0 mcg/mL',
            interpretation: 'S',
            interpretationMeaning: 'Susceptible',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'S <= 1 mg/L, R > 1 mg/L'
          },
          {
            id: 'ast-5',
            antimicrobial: 'Linezolid',
            method: 'automated_mic',
            measuredValue: '2.0 mcg/mL',
            interpretation: 'S',
            interpretationMeaning: 'Susceptible',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'S <= 4 mg/L, R > 4 mg/L'
          },
          {
            id: 'ast-6',
            antimicrobial: 'Penicillin G',
            method: 'automated_mic',
            measuredValue: '>= 8.0 mcg/mL',
            interpretation: 'R',
            interpretationMeaning: 'Resistant (مقاوم)',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'S <= 0.12 mg/L, R > 0.12 mg/L'
          },
          {
            id: 'ast-7',
            antimicrobial: 'Piperacillin-Tazobactam',
            method: 'automated_mic',
            measuredValue: '16.0 mcg/mL',
            interpretation: 'I',
            technicalUncertainty: true,
            interpretationMeaning: 'Area of Technical Uncertainty (ATU: عدم يقين فني - يوصى بإعادة الفحص أو اختيار بديل)',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'ATU 8 - 16 mg/L',
            comments: 'يقع التركيز ضمن نطاق عدم اليقين الفني (ATU) في EUCAST؛ يجب عدم اعتباره مقاوماً تلقائياً.'
          },
          {
            id: 'ast-8',
            antimicrobial: 'Tigecycline',
            method: 'automated_mic',
            measuredValue: '0.25 mcg/mL',
            interpretation: 'NO_BREAKPOINT',
            noBreakpoint: true,
            interpretationMeaning: 'لا يوجد حد سريري معتمد (No Clinical Breakpoint - Report raw MIC only)',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'No Breakpoint Established',
            comments: 'لا تتوفر حدود سريرية معتمدة من اللجنة؛ يعرض تركيز MIC فقط دون تصنيف S/I/R قسري.'
          },
          {
            id: 'ast-9',
            antimicrobial: 'Daptomycin (Reserve Agent)',
            method: 'automated_mic',
            measuredValue: '0.5 mcg/mL',
            interpretation: 'S',
            selectiveReportingSuppressed: true,
            interpretationMeaning: 'حساس (مضاد احتياطي محجوب سريرياً وفق سياسة ترشيد المضادات AMS)',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'S <= 1 mg/L, R > 1 mg/L',
            comments: 'مضاد حيوي خط احتياطي (Restricted Reserve Agent). لا ينشر في تقرير الطبيب العام إلا بطلب استشاري الأمراض المعدية.'
          },
          {
            id: 'ast-10',
            antimicrobial: 'Aztreonam',
            method: 'automated_mic',
            measuredValue: '> 32 mcg/mL',
            interpretation: 'R',
            intrinsicResistance: true,
            interpretationMeaning: 'مقاومة فطرية طبيعية (Intrinsic Resistance for Gram-positive cocci)',
            standardUsed: 'eucast',
            standardVersion: 'EUCAST v14.0 (2026)',
            breakpointRange: 'Intrinsic Resistance',
            comments: 'مقاومة طبيعية معروفة لجميع المكورات العنقودية؛ تم تطبيق قاعدة الخبراء (Expert Rule Override).'
          }
        ]
      }
    ],
    preliminaryNote: 'نمو بكتيري إيجابي لـ Staphylococcus aureus حساس للميثيسيلين (MSSA). بانتظار استكمال لوحة الحساسية الكاملة والتقرير النهائي.',
    verifierName: 'د. خالد الزهراني (استشاري أحياء دقيقة)',
    verifiedAt: '2026-09-13 16:30'
  },
  {
    id: 'micro-case-02',
    accessionNumber: 'MIC-2026-0912-0089',
    orderId: 'ord-urine-99',
    patientId: 'p-5',
    patientName: 'سارة إبراهيم المنصور',
    mrn: 'MRN-2026-5501',
    encounterId: 'enc-opd-209',
    encounterType: 'opd',
    specimenId: 'spec-urine-01',
    specimenType: 'بول نقي منتصف التبول (Clean-Catch Midstream Urine)',
    anatomicalSite: 'مجاري بولية (Urinary Tract)',
    collectionDateTime: '2026-09-12 11:00',
    receivedDateTime: '2026-09-12 11:30',
    cultureType: 'Urine Quantitative Culture',
    incubationStartedAt: '2026-09-12 12:00',
    incubationDurationHours: 24,
    incubationTargetHours: 48,
    isExtendedIncubation: false,
    status: 'no_growth_to_date',
    organisms: [],
    preliminaryNote: 'لا يوجد نمو بكتيري حتى الآن بعد 24 ساعة من التحضين (No growth to date at 24 hours).'
  }
];

export const MOCK_PATHOLOGY_CASES: PathologyCase[] = [
  {
    id: 'path-case-01',
    caseNumber: 'SURG-2026-0913-0012',
    domain: 'surgical_pathology',
    orderId: 'ord-103',
    patientId: 'p-3',
    patientName: 'سلطان عبدالعزيز الشمري',
    mrn: 'MRN-2026-3840',
    encounterId: 'enc-or-711',
    orderingClinician: 'د. طارق الهاشمي',
    clinicalDepartment: 'Endocrine Surgery',
    procedureName: 'Right Hemithyroidectomy + Level VI Lymph Node Dissection',
    specimenDescription: 'Right thyroid lobe and isthmus, suture marked, plus separate Delphian node',
    clinicalHistory: 'A 42-year-old male with solitary right thyroid nodule 2.8 cm, Bethesda V on FNA.',
    lateralitySite: 'الغدة الدرقية - الفص الأيمن (Right Thyroid)',
    containerCount: 2,
    containers: [
      {
        containerNumber: 1,
        containerLabel: 'Right Thyroid Lobe with Isthmus',
        fixative: '10% Neutral Buffered Formalin (NBF)',
        tissueSource: 'Right Thyroid Lobe'
      },
      {
        containerNumber: 2,
        containerLabel: 'Delphian Lymph Node (Level VI)',
        fixative: '10% Neutral Buffered Formalin (NBF)',
        tissueSource: 'Pre-laryngeal soft tissue'
      }
    ],
    procedureDateTime: '2026-09-13 09:10',
    receivedDateTime: '2026-09-13 09:30',
    priority: 'routine',
    status: 'under_pathologist_review',
    assignedPathologist: 'د. نادية عبدالحميد (استشاري باثولوجي الأنسجة)',
    grossExamination: {
      performedBy: 'أخصائي الباثولوجي: د. وليد الدوسري',
      performedAt: '2026-09-13 11:30',
      specimenOrientation: 'خيط جراحي طويل يحدد القطب العلوي، وخيط قصير يحدد الحافة الإنسية.',
      dimensions: '5.2 × 3.8 × 2.1 سم',
      weightGrams: 28.5,
      inkColorsUsed: [
        { color: 'Black Ink (حبر أسود)', marginSite: 'الحافة الجراحية الخلفية (Posterior Surgical Margin)' },
        { color: 'Blue Ink (حبر أزرق)', marginSite: 'الحافة الأمامية الكبسولية (Anterior Capsular Margin)' }
      ],
      grossDescription:
        'فص درقي أيمن مستأصل يزن 28.5 جم، بالتقطيع التسلسلي يظهر ورم عقيدي صلب مائل للبياض قطره 2.5 سم يبعد 0.2 سم عن الحافة الخلفية.',
      imagesMockCount: 3,
      blocks: [
        {
          blockId: 'A1',
          cassetteColor: 'Yellow',
          tissueDescription: 'Tumor with closest posterior inked margin (Black)',
          numberOfPieces: 1,
          slidesCount: 1,
          status: 'slide_ready'
        },
        {
          blockId: 'A2',
          cassetteColor: 'Yellow',
          tissueDescription: 'Tumor with capsule and adjacent thyroid parenchyma',
          numberOfPieces: 2,
          slidesCount: 1,
          status: 'slide_ready'
        },
        {
          blockId: 'A3',
          cassetteColor: 'Yellow',
          tissueDescription: 'Superior pole thyroid tissue uninvolved',
          numberOfPieces: 1,
          slidesCount: 1,
          status: 'slide_ready'
        },
        {
          blockId: 'B1',
          cassetteColor: 'Blue',
          tissueDescription: 'Delphian lymph node (Level VI), submitted entirely',
          numberOfPieces: 2,
          slidesCount: 1,
          status: 'slide_ready'
        }
      ]
    },
    report: {
      signoutPathologist: 'د. نادية عبدالحميد (Fellow of the Royal College of Pathologists)',
      reportingProfile: 'cap_synoptic',
      finalDiagnosis:
        'RIGHT THYROID LOBE, HEMITHYROIDECTOMY:\n- PAPILLARY THYROID CARCINOMA, CLASSIC CONVENTIONAL VARIANT (2.4 cm).\n- CONFINED TO THYROID WITH NEGATIVE SURGICAL RESECTION MARGINS.\n- DELPHIAN LYMPH NODE: NEGATIVE FOR METASTATIC CARCINOMA (0/1).',
      microscopicDescription:
        'Sections show an unencapsulated infiltrative epithelial neoplasm arranged in well-formed papillae with fibrovascular cores. The cells exhibit classic nuclear features including ground-glass optically clear nuclei (Orphan Annie eyes), prominent nuclear grooving, and pseudoinclusions. Inked posterior margin is negative (clearance 2 mm).',
      grossDescriptionRef: 'Ref: Gross Exam on 2026-09-13 by Dr. Walid Al-Dossari (5.2 x 3.8 x 2.1 cm)',
      synopticChecklist: {
        histologicType: 'Papillary Thyroid Carcinoma, classic type',
        histologicGrade: 'Not applicable / Well-differentiated',
        tumorSize: 'Greatest dimension: 2.4 cm',
        marginsStatus: 'All margins negative (Closest margin: posterior at 2.0 mm)',
        lymphovascularInvasion: 'Not identified (Absent)',
        pathologicStaging: 'pT2 pN0 (0/1) cM0 (AJCC 8th Edition)'
      },
      ancillaryStudies: [
        {
          id: 'anc-1',
          testName: 'IHC: BRAF V600E (VE1 Clone)',
          orderedAt: '2026-09-13 14:00',
          orderedBy: 'د. نادية عبدالحميد',
          status: 'evaluated',
          resultSummary: 'Positive (Diffuse strong cytoplasmic staining, confirms BRAF V600E mutation)'
        },
        {
          id: 'anc-2',
          testName: 'IHC: Ki-67 Proliferation Index',
          orderedAt: '2026-09-13 14:00',
          orderedBy: 'د. نادية عبدالحميد',
          status: 'evaluated',
          resultSummary: 'Low proliferation index (< 3%)'
        }
      ],
      pathologistComments:
        'The morphological and immunohistochemical findings are consistent with primary classic papillary thyroid carcinoma. Prognostic stage pT2N0 carries excellent long-term disease-free survival.',
      addenda: [
        {
          id: 'add-1',
          author: 'د. نادية عبدالحميد',
          timestamp: '2026-09-13 17:00',
          note: 'ملحق توضيحي (Addendum): تم تأكيد إيجابية فحص BRAF V600E عبر تقنية الـ IHC لدعم القرار العلاجي في عيادة الغدد الصماء المشتركة.'
        }
      ]
    }
  },
  {
    id: 'path-case-02',
    caseNumber: 'SURG-2026-0913-0014',
    domain: 'surgical_pathology',
    orderId: 'ord-104',
    patientId: 'p-4',
    patientName: 'عائشة ناصر العتيبي',
    mrn: 'MRN-2026-9041',
    encounterId: 'enc-or-715',
    orderingClinician: 'د. سلمان الحربي',
    clinicalDepartment: 'General & Minimally Invasive Surgery',
    procedureName: 'Laparoscopic Cholecystectomy (استئصال المرارة بالمنظار)',
    specimenDescription: 'Gallbladder intact with multiple dark pigmented calculi',
    clinicalHistory: 'A 38-year-old female with symptomatic cholelithiasis and recurrent biliary colic.',
    lateralitySite: 'المرارة والقناة المرارية (Gallbladder)',
    containerCount: 1,
    containers: [
      {
        containerNumber: 1,
        containerLabel: 'Gallbladder Specimen in Formalin',
        fixative: '10% Neutral Buffered Formalin (NBF)',
        tissueSource: 'Gallbladder'
      }
    ],
    procedureDateTime: '2026-09-13 10:15',
    receivedDateTime: '2026-09-13 10:45',
    priority: 'routine',
    status: 'signed_out',
    assignedPathologist: 'د. نادية عبدالحميد (استشاري باثولوجي الأنسجة)',
    grossExamination: {
      performedBy: 'أخصائي الباثولوجي: د. وليد الدوسري',
      performedAt: '2026-09-13 12:00',
      specimenOrientation: 'كيس مراري بطول 7.5 سم وقطر 3.0 سم، السطح المصلي رمادي محتقن، السطح الكبدي أملس.',
      dimensions: '7.5 × 3.0 × 2.5 سم',
      weightGrams: 35.0,
      inkColorsUsed: [
        { color: 'Black Ink', marginSite: 'Cystic Duct Margin (حافة القناة المرارية)' }
      ],
      grossDescription:
        'عينة مرارة مستأصلة تفتح لتظهر مخاطية مخملية خضراء مصفرة مع وجود حصوات متعددة داكنة متفاوتة الأحجام (أكبرها 1.1 سم). سماكة الجدار 0.3 سم دون كتل صلبة.',
      imagesMockCount: 1,
      blocks: [
        {
          blockId: 'A1',
          cassetteColor: 'Yellow',
          tissueDescription: 'Cystic duct resection margin, shaved en face',
          numberOfPieces: 1,
          slidesCount: 1,
          status: 'slide_ready'
        },
        {
          blockId: 'A2',
          cassetteColor: 'Yellow',
          tissueDescription: 'Gallbladder neck and representative body wall',
          numberOfPieces: 2,
          slidesCount: 1,
          status: 'slide_ready'
        }
      ]
    },
    report: {
      signoutPathologist: 'د. نادية عبدالحميد (استشاري باثولوجي)',
      signedOutAt: '2026-09-13 15:45',
      reportingProfile: 'narrative_benign',
      finalDiagnosis:
        'GALLBLADDER, CHOLECYSTECTOMY:\n- CHRONIC CALCULOUS CHOLECYSTITIS WITH ROCHITANSKY-ASCHOFF SINUSES.\n- CHOLELITHIASIS (MULTIPLE PIGMENTED CALCULI).\n- CYSTIC DUCT RESECTION MARGIN: UNREMARKABLE.\n- NEGATIVE FOR DYSPLASIA OR MALIGNANCY.',
      microscopicDescription:
        'Sections demonstrate gallbladder wall showing mild mucosal chronic inflammatory cell infiltrates composed of lymphocytes and plasma cells. Hypertrophied muscularis with Rokitansky-Aschoff sinuses extending into muscular layer. No intestinal metaplasia, dysplasia, or neoplasia identified.',
      grossDescriptionRef: 'Ref: Gross Exam on 2026-09-13 by Dr. Walid Al-Dossari',
      synopticChecklist: {
        isCancerCase: false,
        histologicType: 'Chronic Calculous Cholecystitis (Benign Inflammatory Condition)',
        marginsStatus: 'Cystic duct margin benign and widely negative',
        pathologicStaging: 'Not Applicable (Non-neoplastic/Benign Pathology)'
      },
      ancillaryStudies: [],
      pathologistComments: 'Benign histology. Routine surgical case closed without need for oncological synoptic staging.'
    }
  },
  {
    id: 'path-case-03',
    caseNumber: 'CYTO-2026-0913-0005',
    domain: 'cytopathology',
    orderId: 'ord-105',
    patientId: 'p-6',
    patientName: 'مها عبدالعزيز الخالدي',
    mrn: 'MRN-2026-4412',
    encounterId: 'enc-opd-210',
    orderingClinician: 'د. أريج الراجحي',
    clinicalDepartment: 'Endocrinology Outpatient Clinic',
    procedureName: 'Fine Needle Aspiration Cytology (FNAC) - Left Thyroid Nodule',
    specimenDescription: '4 direct smears (2 alcohol-fixed, 2 air-dried) plus CytoLyt rinse needle wash',
    clinicalHistory: 'A 49-year-old female presenting with asymptomatic EU-TIRADS 3 left thyroid nodule (1.6 cm).',
    lateralitySite: 'الغدة الدرقية - الفص الأيسر (Left Thyroid Nodule)',
    containerCount: 2,
    containers: [
      {
        containerNumber: 1,
        containerLabel: 'Thyroid FNA Direct Smears (Slides 1-4)',
        fixative: '95% Ethanol & Air Dried',
        tissueSource: 'Left Thyroid Nodule FNA'
      },
      {
        containerNumber: 2,
        containerLabel: 'Needle Wash Cell Block Fluid',
        fixative: 'CytoLyt Fixative',
        tissueSource: 'Needle rinse fluid'
      }
    ],
    procedureDateTime: '2026-09-13 11:30',
    receivedDateTime: '2026-09-13 11:55',
    priority: 'routine',
    status: 'signed_out',
    assignedPathologist: 'د. نادية عبدالحميد (استشاري باثولوجي نسيجي وخلوي)',
    cytologyData: {
      adequacyStatus: 'satisfactory',
      adequacyComment: 'Satisfactory for evaluation (contains > 6 well-preserved clusters of benign follicular cells on each of 2 slides).',
      screeningFindings: 'Abundant colloid in thick and thin background films with cohesive flat monolayer sheets (honeycomb) of bland follicular epithelial cells without nuclear enlargement, inclusions, or grooves.',
      classificationSystem: 'The Bethesda System for Reporting Thyroid Cytopathology (TBSRTC 3rd Ed, 2023)',
      bethesdaCategory: 'Category II: Benign (Consistent with Benign Follicular / Colloid Nodule)',
      riskOfMalignancy: '< 3% (Standard clinical follow-up recommended)'
    },
    report: {
      signoutPathologist: 'د. نادية عبدالحميد (Fellow, International Academy of Cytology)',
      signedOutAt: '2026-09-13 16:15',
      reportingProfile: 'cytology_adequacy',
      finalDiagnosis:
        'LEFT THYROID NODULE, FINE NEEDLE ASPIRATION (FNA):\n- BETHESDA CATEGORY II: BENIGN THYROID NODULE (COLLOID NODULE).\n- ABUNDANT COLLOID WITH BENIGN FOLLICULAR CELLS.\n- NO CYTOLOGICAL EVIDENCE OF MALIGNANCY.',
      microscopicDescription:
        'Smears and cell block preparations reveal abundant watery and dense colloid with macrophages and regular monolayered sheets of uniform follicular cells. Nuclei are round with smooth contours and even chromatin. No papillary clusters or nuclear pseudoinclusions seen.',
      synopticChecklist: {
        isCancerCase: false,
        histologicType: 'Benign Thyroid Follicular / Colloid Nodule',
        pathologicStaging: 'Not Applicable (Cytology FNA Specimen)'
      },
      ancillaryStudies: [],
      pathologistComments: 'Cytological findings are benign. Routine clinical and ultrasonographic follow-up as indicated.'
    }
  }
];

export const MOCK_SEND_OUT_SHIPMENTS: SendOutShipment[] = [
  {
    id: 'ship-001',
    shipmentNumber: 'SHIP-REF-2026-041',
    referenceLabName: 'مختبر الرياض المرجعي الوطني (National Reference Lab - Riyadh)',
    specimenId: 'spec-007',
    accessionNumber: 'REF-2026-0913-09',
    patientName: 'نورة سعد الدوسري',
    mrn: 'MRN-2026-2914',
    testName: 'Next-Gen Sequencing (NGS) 54-Gene Myeloid Malignancy Panel',
    preparedAt: '2026-09-13 09:15',
    dispatchedAt: '2026-09-13 10:30',
    courierTrackingNumber: 'MED-COURIER-SA-992144',
    receivedByRefLabAt: '2026-09-13 13:45',
    status: 'processing',
    returnedResultSummary: 'قيد التسلسل الجيني في المختبر المرجعي - المتوقع خلال 7 أيام عمل'
  },
  {
    id: 'ship-002',
    shipmentNumber: 'SHIP-REF-2026-038',
    referenceLabName: 'مختبر مايو كلينك المرجعي (Mayo Medical Laboratories)',
    specimenId: 'spec-008',
    accessionNumber: 'REF-2026-0910-02',
    patientName: 'عبدالرحمن مسعود القحطاني',
    mrn: 'MRN-2026-7731',
    testName: 'Anti-NMDA Receptor Antibody Panel (Serum + CSF)',
    preparedAt: '2026-09-10 11:00',
    dispatchedAt: '2026-09-10 14:00',
    courierTrackingNumber: 'DHL-MEDICAL-7840192',
    receivedByRefLabAt: '2026-09-11 16:20',
    status: 'result_returned',
    returnedResultSummary: 'Negative for Anti-NMDAR antibodies (< 1:10 titer). Validated and released.',
    returnedResultDateTime: '2026-09-13 08:30'
  }
];
