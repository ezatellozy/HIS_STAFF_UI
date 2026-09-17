import {
  ActiveMedicationItem,
  ContinuousInfusionRecord,
  MedicationReconciliationRecord,
  MedicationHistoryItem
} from '../types/clinicalMedicationsMar';

// =============================================================
// AXIS 8 — ACTIVE MEDICATIONS DATASET
// Explicitly separated from Medication Order Composer (Axis 6)
// =============================================================
export const MOCK_ACTIVE_MEDICATIONS: ActiveMedicationItem[] = [
  {
    id: 'MED-ACT-501',
    orderId: 'ORD-1093', // Linked to Axis 6 Order
    genericName: 'Enoxaparin Sodium',
    brandName: 'Clexane',
    dosageForm: 'حقنة جاهزة للاستخدام تحت الجلد (Prefilled Syringe SC)',
    strength: '60 mg / 0.6 mL',
    orderedDose: '60 mg',
    doseUnit: 'mg',
    route: 'Subcutaneous (SC)',
    frequency: 'Every 12 Hours (Q12H)',
    timingDescription: 'كل 12 ساعة (06:00 ص - 18:00 م)',
    startDate: '2026-09-12 06:00',
    plannedDuration: '5 أيام أو حتى استقرار الحالة والتسريح',
    indication: 'العلاج المضاد للتخثر في متلازمة الشريان التاجي الحادة (Therapeutic Anticoagulation for NSTEMI)',
    orderingClinician: {
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ / الرعاية القلبية'
    },
    orderStatus: 'active',
    isHighAlert: true,
    verificationPolicy: {
      policyType: 'single_clinician',
      policyName: 'سياسة التحقق من مضادات التخثر (High-Alert Anticoagulant Verification)',
      isHighAlert: true,
      requiresSecondClinician: false,
      authorizedVerifierRoles: ['Authorized Clinician', 'Registered Nurse (RN)', 'Clinical Pharmacist'],
      descriptionAr: 'يتطلب التحقق من مطابقة الجرعة والوزن ووظائف الكلى بواسطة ممارس مصرح.'
    },
    orderHoldParameters: [
      {
        parameterName: 'Platelet Count (تعداد الصفائح)',
        thresholdCondition: '< 50,000 /uL',
        action: 'hold',
        source: 'medication_order',
        sourceDescription: 'تعليمات أمر الطبيب: تعليق الجرعة وإخطار الطبيب إذا انخفضت الصفائح عن 50 ألف.'
      },
      {
        parameterName: 'Active Bleeding Signs (علامات نزف نشط)',
        thresholdCondition: 'Present',
        action: 'hold',
        source: 'administration_instructions',
        sourceDescription: 'تعليمات الإعطاء: فحص موقع الحقن وملاحظة أي كدمات أو بيلة دموية قبل الحقن.'
      }
    ],
    isPrn: false,
    isContinuousInfusion: false,
    dispensingStatus: 'floor_stock',
    cdssSafetyWarnings: [
      {
        type: 'renal',
        title: 'الجرعة متوافقة مع وظائف الكلى',
        message: 'وظائف الكلى الحالية eGFR = 72 mL/min ضمن النطاق الآمن للجرعة الكاملة 1 mg/kg.',
        severity: 'info'
      }
    ],
    scheduleSlots: [
      {
        slotId: 'SLOT-501-01',
        scheduledTime: '06:00',
        actualAdministrationTime: '06:05',
        recordedAt: '06:12',
        status: 'administered',
        administeredAt: '2026-09-12 06:05',
        administeredDose: '60 mg',
        administeredUnit: 'mg',
        administeredRoute: 'SC',
        administeredSite: 'جدار البطن السفلي الأيمن (Right Lower Abdomen)',
        administeredBy: 'سارة مصطفى',
        administeredByRole: 'Authorized Clinician (RN)',
        verifiedBy: 'أحمد جلال',
        verifiedByRole: 'Authorized Clinician (RN)'
      },
      {
        slotId: 'SLOT-501-02',
        scheduledTime: '18:00',
        status: 'due'
      }
    ]
  },
  {
    id: 'MED-ACT-502',
    orderId: 'ORD-1090-ASP',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    brandName: 'Aspocid / Protect',
    dosageForm: 'أقراص مغلفة معوياً قابلة للمضغ (Chewable / Enteric Tablet)',
    strength: '100 mg',
    orderedDose: '100 mg',
    doseUnit: 'mg',
    route: 'Oral (PO)',
    frequency: 'Once Daily (QD)',
    timingDescription: 'يومياً بعد وجبة الإفطار (10:00 ص)',
    startDate: '2026-09-12 10:00',
    indication: 'تثبيط تجمع الصفائح الدموية الثانوي لأمراض الشرايين التاجية (Antiplatelet)',
    orderingClinician: {
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ'
    },
    orderStatus: 'active',
    isHighAlert: false,
    verificationPolicy: {
      policyType: 'no_additional_verification',
      policyName: 'التحقق المعياري عبر مسح الباركود (Mock BCMA)',
      isHighAlert: false,
      requiresSecondClinician: false,
      authorizedVerifierRoles: ['Authorized Clinician', 'Registered Nurse (RN)'],
      descriptionAr: 'تحقق أحادي لممارس مصرح باستخدام محاكاة التحقق من الباركود (Mock BCMA).'
    },
    isPrn: false,
    isContinuousInfusion: false,
    dispensingStatus: 'dispensed',
    scheduleSlots: [
      {
        slotId: 'SLOT-502-01',
        scheduledTime: '10:00',
        actualAdministrationTime: '10:12',
        recordedAt: '10:14',
        status: 'administered',
        administeredAt: '2026-09-12 10:12',
        administeredDose: '100 mg',
        administeredUnit: 'mg',
        administeredRoute: 'PO',
        administeredBy: 'أحمد جلال',
        administeredByRole: 'Authorized Clinician (RN)'
      },
      {
        slotId: 'SLOT-502-02',
        scheduledTime: 'غداً 10:00',
        status: 'due'
      }
    ]
  },
  {
    id: 'MED-ACT-503',
    orderId: 'ORD-1090-TIC',
    genericName: 'Ticagrelor',
    brandName: 'Brilinta',
    dosageForm: 'أقراص فموية سريعة المفعول',
    strength: '90 mg',
    orderedDose: '90 mg',
    doseUnit: 'mg',
    route: 'Oral (PO)',
    frequency: 'Twice Daily (BID)',
    timingDescription: 'كل 12 ساعة (10:00 ص - 22:00 م)',
    startDate: '2026-09-12 10:00',
    indication: 'مضاد مستقبلات P2Y12 ضمن العلاج المزدوج DAPT بعد القسطرة',
    orderingClinician: {
      name: 'د. خالد عبد العزيز',
      role: 'استشاري قسطرة وأمراض القلب',
      department: 'مركز القلب والقسطرة'
    },
    orderStatus: 'active',
    isHighAlert: false,
    verificationPolicy: {
      policyType: 'no_additional_verification',
      policyName: 'سياسة الأدوية الفموية القياسية',
      isHighAlert: false,
      requiresSecondClinician: false,
      authorizedVerifierRoles: ['Authorized Clinician', 'Registered Nurse (RN)'],
      descriptionAr: 'لا تتطلب إجراءات تحقق إضافية بخلاف تحقق الممارس المصرح المنفذ.'
    },
    isPrn: false,
    isContinuousInfusion: false,
    dispensingStatus: 'dispensed',
    scheduleSlots: [
      {
        slotId: 'SLOT-503-01',
        scheduledTime: '10:00',
        actualAdministrationTime: '10:15',
        recordedAt: '10:18',
        status: 'administered',
        administeredAt: '2026-09-12 10:15',
        administeredDose: '180 mg (جرعة تحميل Loading Dose)',
        administeredUnit: 'mg',
        administeredRoute: 'PO',
        administeredBy: 'أحمد جلال',
        administeredByRole: 'Authorized Clinician (RN)'
      },
      {
        slotId: 'SLOT-503-02',
        scheduledTime: '22:00',
        status: 'due'
      }
    ]
  },
  {
    id: 'MED-ACT-504',
    orderId: 'ORD-1090-ATR',
    genericName: 'Atorvastatin Calcium',
    brandName: 'Lipitor',
    dosageForm: 'أقراص فموية',
    strength: '80 mg',
    orderedDose: '80 mg',
    doseUnit: 'mg',
    route: 'Oral (PO)',
    frequency: 'Once Daily at Bedtime (QHS)',
    timingDescription: 'يومياً قبل النوم (21:00 م)',
    startDate: '2026-09-12 21:00',
    indication: 'تثبيت اللويحات العصيدية وخفض الكوليسترول عالي الكثافة (High-intensity Statin)',
    orderingClinician: {
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ'
    },
    orderStatus: 'active',
    isHighAlert: false,
    verificationPolicy: {
      policyType: 'no_additional_verification',
      policyName: 'التحقق المعياري',
      isHighAlert: false,
      requiresSecondClinician: false,
      authorizedVerifierRoles: ['Authorized Clinician'],
      descriptionAr: 'تحقق قياسي قبل الإعطاء.'
    },
    isPrn: false,
    isContinuousInfusion: false,
    dispensingStatus: 'dispensed',
    scheduleSlots: [
      {
        slotId: 'SLOT-504-01',
        scheduledTime: '21:00',
        status: 'due'
      }
    ]
  },
  {
    id: 'MED-ACT-505',
    orderId: 'ORD-1090-NOR',
    genericName: 'Norepinephrine Bitartrate',
    brandName: 'Levophed Infusion',
    dosageForm: 'محلول تسريب وريدي مستمر عبر مضخة ذكية (Smart Infusion Pump)',
    strength: '4 mg / 250 mL D5W (16 mcg/mL)',
    orderedDose: '0.08',
    doseUnit: 'mcg/kg/min',
    route: 'Continuous IV Infusion (CVC)',
    frequency: 'Continuous Titration',
    timingDescription: 'تسريب مستمر مدار بواسطة مضخة ذكية مع خط شرياني مباشر',
    startDate: '2026-09-12 08:00',
    indication: 'دعم الدورة الدموية والحفاظ على ضغط الشرايين المتوسط MAP >= 65 mmHg',
    orderingClinician: {
      name: 'د. خالد عبد العزيز',
      role: 'استشاري أمراض القلب والعناية المركزة',
      department: 'وحدة الرعاية المركزة القلبية (CCU)'
    },
    orderStatus: 'active',
    isHighAlert: true,
    verificationPolicy: {
      policyType: 'dual_independent_verification',
      policyName: 'سياسة التحقق المزدوج المستقل للأدوية المقبضة الوعائية (Independent Double-Check Policy)',
      isHighAlert: true,
      requiresSecondClinician: true,
      authorizedVerifierRoles: ['Authorized Clinician (ICU RN)', 'Clinical Pharmacist', 'Attending Physician'],
      descriptionAr: 'إلزامية التحقق المزدوج المستقل بين اثنين من الممارسين المصرحين قبل بدء التسريب أو تعديل الجرعة والمعايرة.'
    },
    orderHoldParameters: [
      {
        parameterName: 'Mean Arterial Pressure (MAP)',
        thresholdCondition: '> 75 mmHg',
        action: 'adjust_rate',
        source: 'medication_order',
        sourceDescription: 'أمر الطبيب: خفض معدل التسريب تدريجياً (Titrate Down) إذا ارتفع MAP فوق 75.'
      },
      {
        parameterName: 'Peripheral Extravasation Signs',
        thresholdCondition: 'Detected',
        action: 'hold',
        source: 'configured_policy',
        sourceDescription: 'سياسة المنشأة: الإيقاف الفوري وتبديل المجرى عند أي شك في تسرب المحلول خارج الوريد.'
      }
    ],
    isPrn: false,
    isContinuousInfusion: true,
    dispensingStatus: 'floor_stock',
    scheduleSlots: [
      {
        slotId: 'SLOT-505-01',
        scheduledTime: '08:00',
        actualAdministrationTime: '08:02',
        recordedAt: '08:06',
        status: 'administered',
        administeredAt: '2026-09-12 08:00',
        administeredDose: '0.05 mcg/kg/min',
        administeredUnit: 'mcg/kg/min',
        administeredRoute: 'IV Central Line',
        administeredSite: 'القسطرة الوريدية المركزية - المجرى الأيمن CVC Lumen 1',
        administeredBy: 'سارة مصطفى',
        administeredByRole: 'Authorized Clinician (RN)',
        verifiedBy: 'أحمد جلال',
        verifiedByRole: 'Authorized Clinician (RN)',
        isDualVerified: true
      },
      {
        slotId: 'SLOT-505-02',
        scheduledTime: '08:30',
        actualAdministrationTime: '08:32',
        recordedAt: '08:35',
        status: 'administered',
        administeredAt: '2026-09-12 08:30',
        administeredDose: '0.08 mcg/kg/min (معايرة بالزيادة)',
        administeredUnit: 'mcg/kg/min',
        administeredRoute: 'IV Central Line',
        administeredSite: 'CVC Lumen 1',
        administeredBy: 'سارة مصطفى',
        administeredByRole: 'Authorized Clinician (RN)',
        verifiedBy: 'د. خالد عبد العزيز',
        verifiedByRole: 'Attending Physician',
        isDualVerified: true
      },
      {
        slotId: 'SLOT-505-03',
        scheduledTime: 'مستمر الآن',
        actualAdministrationTime: 'مستمر',
        recordedAt: '09:15',
        status: 'administered',
        administeredDose: '0.08 mcg/kg/min',
        administeredBy: 'سارة مصطفى',
        administeredByRole: 'Authorized Clinician (RN)',
        verifiedBy: 'أحمد جلال',
        verifiedByRole: 'Authorized Clinician (RN)'
      }
    ]
  },
  {
    id: 'MED-ACT-506',
    orderId: 'ORD-1094', // Linked to Axis 6 Order
    genericName: 'Nitroglycerin',
    brandName: 'Nitronal Infusion',
    dosageForm: 'محلول تسريب وريدي مستمر (IV Infusion)',
    strength: '50 mg / 250 mL D5W',
    orderedDose: '10',
    doseUnit: 'mcg/min',
    route: 'Continuous IV Infusion',
    frequency: 'Continuous Titration',
    timingDescription: 'معايرة حسب ألم الصدر وضغط الدم',
    startDate: '2026-09-12 11:30',
    indication: 'توسيع الشرايين الإكليلية وتخفيف ألم الصدر والسيطرة على الضغط',
    orderingClinician: {
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ'
    },
    orderStatus: 'on_hold',
    isHighAlert: true,
    verificationPolicy: {
      policyType: 'single_clinician',
      policyName: 'سياسة مراقبة موسعات الأوعية الوريدية',
      isHighAlert: true,
      requiresSecondClinician: false,
      authorizedVerifierRoles: ['Authorized Clinician', 'Attending Physician'],
      descriptionAr: 'مراقبة ضغط الدم والنبض كل 15 دقيقة أثناء المعايرة.'
    },
    orderHoldParameters: [
      {
        parameterName: 'Systolic Blood Pressure (SBP)',
        thresholdCondition: '< 100 mmHg',
        action: 'hold',
        source: 'medication_order',
        sourceDescription: 'أمر الطبيب: إيقاف التسريب فوراً إذا قل الضغط الانقباضي عن 100 mmHg.'
      },
      {
        parameterName: 'Heart Rate (HR)',
        thresholdCondition: '< 55 bpm أو > 110 bpm',
        action: 'hold',
        source: 'administration_instructions',
        sourceDescription: 'تعليمات الإعطاء السريرية: تعليق الجرعة عند بطء أو تسرع النبض واستشارة الطبيب.'
      }
    ],
    isPrn: false,
    isContinuousInfusion: true,
    dispensingStatus: 'floor_stock',
    scheduleSlots: [
      {
        slotId: 'SLOT-506-01',
        scheduledTime: '11:30',
        actualAdministrationTime: '11:35',
        recordedAt: '11:40',
        status: 'administered',
        administeredAt: '2026-09-12 11:35',
        administeredDose: '10 mcg/min',
        administeredBy: 'أحمد صلاح',
        administeredByRole: 'Authorized Clinician (RN)'
      },
      {
        slotId: 'SLOT-506-02',
        scheduledTime: '12:20',
        actualAdministrationTime: '12:20',
        recordedAt: '12:25',
        status: 'held',
        nonAdminReason: 'sbp_low',
        nonAdminComment: 'تم إيقاف التسريب مؤقتاً بعد استقرار الضغط الانقباضي عند 118 mmHg وزوال ألم الصدر التام عملاً بمعيار أمر الطبيب.',
        administeredBy: 'د. خالد عبد العزيز',
        administeredByRole: 'Attending Physician'
      }
    ]
  },
  {
    id: 'MED-ACT-507',
    orderId: 'ORD-1090-MOR',
    genericName: 'Morphine Sulfate',
    brandName: 'Morphine IV',
    dosageForm: 'محلول حقن وريدي نقي (Ampoule)',
    strength: '10 mg / 1 mL',
    orderedDose: '2 - 4 mg',
    doseUnit: 'mg',
    route: 'Intravenous (IV Push)',
    frequency: 'Every 3 Hours PRN',
    timingDescription: 'عند اللزوم كل 3 ساعات لألم الصدر الشديد المقاوم',
    startDate: '2026-09-12 10:45',
    indication: 'مسكن أفيوني قوي لألم الصدر الإقفاري الحاد المقاوم (Refractory Ischemic Chest Pain)',
    orderingClinician: {
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ'
    },
    orderStatus: 'active',
    isHighAlert: true,
    verificationPolicy: {
      policyType: 'dual_independent_verification',
      policyName: 'سياسة المواد المخدرة والأفيونيات الخاضعة للرقابة (Controlled Narcotics Double-Verification)',
      isHighAlert: true,
      requiresSecondClinician: true,
      authorizedVerifierRoles: ['Authorized Clinician', 'Registered Nurse (RN)', 'Clinical Pharmacist', 'Physician'],
      descriptionAr: 'إلزامية التحقق المزدوج المستقل وتوثيق الهدر والتلف للأدوية المخدرة المراقبة.'
    },
    orderHoldParameters: [
      {
        parameterName: 'Respiratory Rate (معدل التنفس)',
        thresholdCondition: '< 12 breaths/min',
        action: 'hold',
        source: 'medication_order',
        sourceDescription: 'أمر الطبيب: عدم إعطاء الجرعة وتجهيز Naloxone إذا كان التنفس أقل من 12.'
      },
      {
        parameterName: 'Sedation Level (مستوى التهدئة)',
        thresholdCondition: 'RASS <= -2 (Somnolent)',
        action: 'hold',
        source: 'administration_instructions',
        sourceDescription: 'تعليمات الإعطاء: تعليق الجرعة إذا كان المريض يغط في نوم عميق غير متجاوب.'
      }
    ],
    isPrn: true,
    prnDetails: {
      indication: 'ألم صدري إقفاري حاد شديد مقياس الألم >= 7/10',
      minIntervalHours: 3,
      lastAdministeredAt: '2026-09-12 11:15',
      nextAllowedAt: '2026-09-12 14:15',
      isCurrentlyAllowed: true,
      effectivenessRequired: true
    },
    isContinuousInfusion: false,
    dispensingStatus: 'dispensed',
    scheduleSlots: [
      {
        slotId: 'SLOT-507-01',
        scheduledTime: '11:15 (PRN)',
        actualAdministrationTime: '11:15',
        recordedAt: '11:22',
        status: 'administered',
        administeredAt: '2026-09-12 11:15',
        administeredDose: '3 mg',
        administeredUnit: 'mg',
        administeredRoute: 'IV Slow Push',
        administeredBy: 'سارة مصطفى',
        administeredByRole: 'Authorized Clinician (RN)',
        verifiedBy: 'أحمد جلال',
        verifiedByRole: 'Authorized Clinician (RN)',
        isDualVerified: true,
        responseAssessment: {
          painScorePre: 8,
          painScorePost: 2,
          sedationScore: 'يقظ ومنتبه (Alert / RASS 0)',
          evaluatedAt: '11:45',
          notes: 'انخفاض ممتاز في شدة الألم من 8/10 إلى 2/10 مع استقرار التنفس 18/min.'
        }
      }
    ]
  },
  {
    id: 'MED-ACT-508',
    orderId: 'ORD-1090-PAN',
    genericName: 'Pantoprazole Sodium',
    brandName: 'Controloc IV',
    dosageForm: 'فيال حقن وريدي (Vial for IV Infusion)',
    strength: '40 mg',
    orderedDose: '40 mg',
    doseUnit: 'mg',
    route: 'Intravenous (IV)',
    frequency: 'Once Daily (QD)',
    timingDescription: 'يومياً الساعة 08:00 ص',
    startDate: '2026-09-12 08:00',
    indication: 'وقاية من تقرحات ونزيف الجهاز الهضمي الناجم عن الإجهاد ومضادات التخثر (GI Bleed Prophylaxis)',
    orderingClinician: {
      name: 'د. طارق المنشاوي',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ'
    },
    orderStatus: 'active',
    isHighAlert: false,
    verificationPolicy: {
      policyType: 'no_additional_verification',
      policyName: 'التحقق المعياري',
      isHighAlert: false,
      requiresSecondClinician: false,
      authorizedVerifierRoles: ['Authorized Clinician'],
      descriptionAr: 'تحقق قياسي قبل الحقن.'
    },
    isPrn: false,
    isContinuousInfusion: false,
    dispensingStatus: 'floor_stock',
    scheduleSlots: [
      {
        slotId: 'SLOT-508-01',
        scheduledTime: '08:00',
        actualAdministrationTime: '08:10',
        recordedAt: '08:15',
        status: 'administered',
        administeredAt: '2026-09-12 08:10',
        administeredDose: '40 mg',
        administeredBy: 'سارة مصطفى',
        administeredByRole: 'Authorized Clinician (RN)'
      },
      {
        slotId: 'SLOT-508-02',
        scheduledTime: 'غداً 08:00',
        status: 'due'
      }
    ]
  }
];

// =============================================================
// CONTINUOUS INFUSIONS & TITRATION TIMELINE (ICU/CCU DOMAIN)
// Distinct from tablet MAR — supports rate changes, titration history
// =============================================================
export const MOCK_CONTINUOUS_INFUSIONS: ContinuousInfusionRecord[] = [
  {
    id: 'INF-REC-001',
    orderId: 'ORD-1090-NOR',
    medicationName: 'Norepinephrine (Levophed)',
    genericName: 'Norepinephrine Bitartrate',
    concentration: '4 mg / 250 mL D5W (16 mcg/mL)',
    lineLocation: 'القسطرة الوريدية المركزية بالوداجي الباطن الأيمن - المجرى البني (CVC Lumen 1)',
    baseRate: '0.05 mcg/kg/min',
    currentRate: '0.08 mcg/kg/min (معاير ومستقر)',
    rateUnit: 'mcg/kg/min',
    titrationGoal: 'الحفاظ على ضغط الدم الشرياني المتوسط MAP >= 65 mmHg مع مراقبة النبض والتروية المحيطية',
    infusionStatus: 'running',
    startedAt: 'اليوم، 08:00 ص',
    lastTitratedAt: 'اليوم، 08:30 ص',
    administeredBy: 'سارة مصطفى (RN)',
    verifiedBy: 'أحمد جلال (RN)',
    requiresDualVerification: true,
    titrationHistory: [
      {
        id: 'TITR-01',
        timestamp: 'اليوم، 08:00 ص',
        previousRate: '0.00 mcg/kg/min',
        newRate: '0.05 mcg/kg/min',
        rateUnit: 'mcg/kg/min',
        targetParameter: 'MAP >= 65 mmHg',
        patientResponseValue: 'MAP 58 mmHg (هبوط ضغط بعد النوبة الحادة)',
        reason: 'بدء التسريب المستمر الأولي بمضخة Alaris الذكية عبر CVC لدعم الضغط الشرياني.',
        changedBy: 'سارة مصطفى (RN)',
        verifiedBy: 'أحمد جلال (RN)'
      },
      {
        id: 'TITR-02',
        timestamp: 'اليوم، 08:30 ص',
        previousRate: '0.05 mcg/kg/min',
        newRate: '0.08 mcg/kg/min',
        rateUnit: 'mcg/kg/min',
        targetParameter: 'MAP >= 65 mmHg',
        patientResponseValue: 'MAP 62 mmHg (استجابة جزئية غير كافية)',
        reason: 'رفع معدل التسريب تدريجياً لتعزيز التروية التاجية وتحقيق الهدف الشرياني > 65 mmHg.',
        changedBy: 'سارة مصطفى (RN)',
        verifiedBy: 'د. خالد عبد العزيز'
      },
      {
        id: 'TITR-03',
        timestamp: 'اليوم، 09:15 ص',
        previousRate: '0.08 mcg/kg/min',
        newRate: '0.08 mcg/kg/min',
        rateUnit: 'mcg/kg/min',
        targetParameter: 'MAP >= 65 mmHg',
        patientResponseValue: 'MAP 68 mmHg (تحقيق الهدف المطلوب بنجاح)',
        reason: 'استقرار هيموديناميكي ممتاز، تثبيت الجرعة والمراقبة المستمرة عبر الخط الشرياني A-Line.',
        changedBy: 'سارة مصطفى (RN)'
      }
    ]
  },
  {
    id: 'INF-REC-002',
    orderId: 'ORD-1094',
    medicationName: 'Nitroglycerin (Nitronal)',
    genericName: 'Nitroglycerin IV',
    concentration: '50 mg / 250 mL D5W (200 mcg/mL)',
    lineLocation: 'القسطرة الوريدية الطرفية بالساعد الأيسر (Left Forearm Peripheral Line 18G)',
    baseRate: '10 mcg/min',
    currentRate: '0 mcg/min (موقوف مؤقتاً On-Hold)',
    rateUnit: 'mcg/min',
    titrationGoal: 'تخفيف الألم الصدري التاجي بشرط بقاء الضغط الانقباضي SBP > 100 mmHg',
    infusionStatus: 'paused',
    startedAt: 'اليوم، 11:30 ص',
    lastTitratedAt: 'اليوم، 12:20 م',
    administeredBy: 'أحمد صلاح (RN)',
    verifiedBy: 'د. طارق المنشاوي',
    requiresDualVerification: false,
    titrationHistory: [
      {
        id: 'TITR-NTG-01',
        timestamp: 'اليوم، 11:30 ص',
        previousRate: '0 mcg/min',
        newRate: '10 mcg/min',
        rateUnit: 'mcg/min',
        targetParameter: 'Chest Pain relief & SBP > 100 mmHg',
        patientResponseValue: 'BP 148/92 mmHg, Pain 8/10',
        reason: 'بدء التسريب لمعالجة ألم الصدر الحاد وخفض الحمل القلبي القبلي.',
        changedBy: 'أحمد صلاح (RN)'
      },
      {
        id: 'TITR-NTG-02',
        timestamp: 'اليوم، 12:20 م',
        previousRate: '10 mcg/min',
        newRate: '0 mcg/min (إيقاف مؤقت)',
        rateUnit: 'mcg/min',
        targetParameter: 'SBP Safety Threshold',
        patientResponseValue: 'BP 118/74 mmHg, Pain 0/10',
        reason: 'إيقاف مؤقت للتسريب وفق بروتوكول الأمان السريري بعد زوال الألم وانخفاض الضغط الانقباضي.',
        changedBy: 'د. خالد عبد العزيز'
      }
    ]
  }
];

// =============================================================
// RECONCILIATION POLICIES (Configured transition-specific policies)
// Supports Admission, Internal Transfer, Discharge with distinct role requirements
// =============================================================
export const MOCK_RECONCILIATION_POLICIES = {
  admission: {
    policyId: 'POL-MEDREC-ADM',
    policyName: 'سياسة التوفيق الدوائي عند التنويم / الدخول (Admission MedRec Policy)',
    transitionType: 'admission' as const,
    documentationRoles: ['Clinical Pharmacist', 'Physician', 'Authorized Clinician'],
    approvalModel: 'clinical_pharmacist_with_cosign' as const,
    approvalModelLabelAr: 'توثيق الصيدلي السريري مع اعتماد الطبيب المعالج المشرف',
    requiredApprovalRoles: ['Clinical Pharmacist (BCPS)', 'Attending Physician'],
    transitionSpecificChecklist: {
      checkHomeMedVerification: true,
      checkPostDischargeMedPlan: false,
      checkTransferOrderDiscontinuation: false,
      checkInteractionCheck: true
    },
    policyDescriptionAr: 'إلزامية مطابقة أدوية المنزل خلال 24 ساعة من التنويم، يقوم الصيدلي بالتوثيق ويعتمد الطبيب المشرف القرارات.'
  },
  internal_transfer: {
    policyId: 'POL-MEDREC-TRF',
    policyName: 'سياسة التوفيق الدوائي عند النقل الداخلي (ICU to Ward Transfer Policy)',
    transitionType: 'internal_transfer' as const,
    documentationRoles: ['Physician', 'Authorized Clinician'],
    approvalModel: 'single_authorized_clinician' as const,
    approvalModelLabelAr: 'اعتماد طبيب العناية أو الطبيب المعالج المنفرد',
    requiredApprovalRoles: ['Physician / ICU Fellow'],
    transitionSpecificChecklist: {
      checkHomeMedVerification: false,
      checkPostDischargeMedPlan: false,
      checkTransferOrderDiscontinuation: true,
      checkInteractionCheck: true
    },
    policyDescriptionAr: 'إعادة تقييم أدوية العناية الفائقة (رافعات الضغط، المسكنات الوريدية) ومراجعة إيقافها قبل الانتقال للقسم العام.'
  },
  discharge: {
    policyId: 'POL-MEDREC-DC',
    policyName: 'سياسة التوفيق الدوائي عند الخروج والتسريح (Discharge MedRec Policy)',
    transitionType: 'discharge' as const,
    documentationRoles: ['Physician', 'Clinical Pharmacist'],
    approvalModel: 'attending_physician_only' as const,
    approvalModelLabelAr: 'اعتماد الطبيب الاستشاري المعالج المشرف على الخروج',
    requiredApprovalRoles: ['Attending Physician'],
    transitionSpecificChecklist: {
      checkHomeMedVerification: true,
      checkPostDischargeMedPlan: true,
      checkTransferOrderDiscontinuation: true,
      checkInteractionCheck: true
    },
    policyDescriptionAr: 'مقارنة أدوية التنويم مع أدوية المنزل الأصلية وتوليد الوصفة الدوائية النهائية للخروج مع إرشادات المريض.'
  }
};

// =============================================================
// MEDICATION RECONCILIATION DATASET (DEDICATED TRANSITION SURFACE)
// Comparing Prior Home Medications vs Current Encounter Regimen
// =============================================================
export const MOCK_MEDICATION_RECONCILIATION: MedicationReconciliationRecord = {
  id: 'REC-ENC-2026-001',
  encounterId: 'ENC-2026-ER-091',
  transitionType: 'admission',
  policy: MOCK_RECONCILIATION_POLICIES.admission,
  policyName: MOCK_RECONCILIATION_POLICIES.admission.policyName,
  status: 'completed',
  documentedBy: 'د. شريف عبد الفتاح (صيدلي إكلينيكي أول - BCPS)',
  documentedAt: 'اليوم، 12:20 م',
  completedBy: 'د. خالد عبد العزيز (استشاري أمراض القلب المشرف)',
  completedAt: 'اليوم، 12:30 م',
  items: [
    {
      id: 'REC-ITEM-01',
      sourceMedicationName: 'Metformin Hydrochloride (Glucophage)',
      sourceDose: '1000 mg',
      sourceRoute: 'Oral (PO)',
      sourceFrequency: 'Twice Daily (BID) مع الأكل',
      sourceIndication: 'داء السكري من النوع الثاني (Type 2 Diabetes Mellitus)',
      sourceOrigin: 'patient_reported',
      decision: 'hold',
      encounterMedicationEquivalent: 'مخطط الإنسولين التصحيحي السريع (Sliding Scale Regular Insulin SC)',
      clinicalRationale: 'تم إيقاف الميتفورمين مؤقتاً لتفادي الحماض اللبني ونظراً لإجراء قسطرة قلبية بالصبغة الإشعاعية. استبداله بالإنسولين القصير.',
      reviewedBy: 'د. شريف عبد الفتاح (صيدلي سريري)',
      reviewedAt: 'اليوم، 12:15 م'
    },
    {
      id: 'REC-ITEM-02',
      sourceMedicationName: 'Lisinopril (Zestril)',
      sourceDose: '10 mg',
      sourceRoute: 'Oral (PO)',
      sourceFrequency: 'Once Daily (QD)',
      sourceIndication: 'ارتفاع ضغط الدم المزمن (Essential Hypertension)',
      sourceOrigin: 'pharmacy_dispense_history',
      decision: 'hold',
      clinicalRationale: 'تم تعليق مثبطات ACE مؤقتاً في المرحلة الحادة تجنباً لهبوط الضغط ولحين استقرار المؤشرات الهيموديناميكية وفطام رافعات الضغط.',
      reviewedBy: 'د. طارق المنشاوي (استشاري طوارئ)',
      reviewedAt: 'اليوم، 12:18 م'
    },
    {
      id: 'REC-ITEM-03',
      sourceMedicationName: 'Bisoprolol Fumarate (Concor)',
      sourceDose: '5 mg',
      sourceRoute: 'Oral (PO)',
      sourceFrequency: 'Once Daily (QD) صباحاً',
      sourceIndication: 'حاصرات بيتا لحماية عضلة القلب وتنظيم النبض',
      sourceOrigin: 'pharmacy_dispense_history',
      decision: 'continue',
      encounterMedicationEquivalent: 'Bisoprolol 2.5 mg PO QD (تم تعديل الجرعة للنصف في المرحلة الأولى)',
      clinicalRationale: 'الاستمرار في العلاج بحاصرات بيتا أمر حاسم في متلازمة الشريان التاجي مع مراقبة دقيقة للنبض (> 55 bpm).',
      reviewedBy: 'د. خالد عبد العزيز (استشاري قلب)',
      reviewedAt: 'اليوم، 12:20 م'
    },
    {
      id: 'REC-ITEM-04',
      sourceMedicationName: 'Rosuvastatin (Crestor)',
      sourceDose: '20 mg',
      sourceRoute: 'Oral (PO)',
      sourceFrequency: 'Once Daily at Bedtime (QHS)',
      sourceIndication: 'فرط شحميات الدم (Hyperlipidemia)',
      sourceOrigin: 'prior_discharge_summary',
      decision: 'modify',
      encounterMedicationEquivalent: 'Atorvastatin 80 mg PO QHS (Lipitor High-Intensity)',
      clinicalRationale: 'تم التعديل والترقية إلى أتورفاستاتين 80 ملغ عالي الشدة وفق بروتوكول جمعية القلب للاحتشاء الحاد (ACS High-Intensity Statin Protocol).',
      reviewedBy: 'د. شريف عبد الفتاح',
      reviewedAt: 'اليوم، 12:22 م'
    },
    {
      id: 'REC-ITEM-05',
      sourceMedicationName: 'Aspirin Protect',
      sourceDose: '81 mg',
      sourceRoute: 'Oral (PO)',
      sourceFrequency: 'Once Daily (QD)',
      sourceIndication: 'وقاية قلبية وعائية أولية',
      sourceOrigin: 'patient_reported',
      decision: 'continue',
      encounterMedicationEquivalent: 'Aspirin 100 mg PO QD + Ticagrelor 90 mg BID (DAPT Protocol)',
      clinicalRationale: 'الاستمرار في الأسبرين كجزء من العلاج المزدوج لمضادات الصفيحات بعد تركيب الدعامة التاجية.',
      reviewedBy: 'د. خالد عبد العزيز',
      reviewedAt: 'اليوم، 12:25 م'
    },
    {
      id: 'REC-ITEM-06',
      sourceMedicationName: 'Omeprazole',
      sourceDose: '20 mg',
      sourceRoute: 'Oral (PO)',
      sourceFrequency: 'Once Daily (QD) قبل الفطور',
      sourceIndication: 'ارتجاع المريء وحماية المعدة (GERD)',
      sourceOrigin: 'patient_reported',
      decision: 'modify',
      encounterMedicationEquivalent: 'Pantoprazole 40 mg IV QD (Controloc IV)',
      clinicalRationale: 'التحويل إلى بانتوبرازول وريدي أثناء التنويم في العناية لضمان الامتصاص وتجنب التداخل الدوائي مع مضادات الصفيحات.',
      reviewedBy: 'د. شريف عبد الفتاح',
      reviewedAt: 'اليوم، 12:28 م'
    }
  ]
};

// =============================================================
// LONGITUDINAL MEDICATION HISTORY
// =============================================================
export const MOCK_MEDICATION_HISTORY: MedicationHistoryItem[] = [
  {
    id: 'HIST-MED-01',
    medicationName: 'Amoxicillin / Clavulanate (Augmentin)',
    genericName: 'Amoxicillin + Clavulanic Acid',
    dose: '1 g PO Q12H',
    route: 'Oral (PO)',
    frequency: 'Every 12 Hours',
    status: 'completed',
    period: '2026-08-10 إلى 2026-08-17 (7 أيام)',
    indication: 'التهاب الشعب الهوائية الحاد (Acute Bronchitis)',
    prescribedBy: 'د. حسام غالي (عيادة الباطنة الخارجية)',
    sourceEncounter: 'ENC-OPD-2026-778'
  },
  {
    id: 'HIST-MED-02',
    medicationName: 'Ceftriaxone (Rocephin)',
    genericName: 'Ceftriaxone Sodium',
    dose: '1 g IV Q24H',
    route: 'Intravenous (IV)',
    frequency: 'Once Daily',
    status: 'completed',
    period: '2026-05-14 إلى 2026-05-17',
    indication: 'التهاب المسالك البولية الحاد (Acute Pyelonephritis)',
    prescribedBy: 'د. نورهان سعيد (قسم الطوارئ)',
    sourceEncounter: 'ENC-ER-2026-312'
  },
  {
    id: 'HIST-MED-03',
    medicationName: 'Ibuprofen (Brufen)',
    genericName: 'Ibuprofen',
    dose: '400 mg PO TID PRN',
    route: 'Oral (PO)',
    frequency: 'PRN',
    status: 'discontinued',
    period: '2026-04-01 إلى 2026-04-05',
    indication: 'ألم مفصلي عابر',
    prescribedBy: 'د. سامح رضوان',
    discontinueReason: 'تم إيقافه نهائياً لتعارضه مع سلامة الشرايين التاجية ووظائف الكلى (NSAID Contraindicated in CAD).',
    sourceEncounter: 'ENC-OPD-2026-119'
  }
];
