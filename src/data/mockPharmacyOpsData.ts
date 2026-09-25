import {
  MedicationOrderContext,
  PharmacyIntervention,
  SubstitutionOption,
  CompoundingWorksheet,
  DispenseRecord,
  OutpatientPrescriptionContext,
  DischargeMedicationSupply,
  MedicationReturnContext,
  CancelledAfterPreparationContext,
  PharmacyOperationalMetrics,
  EmergencyExceptionRecord,
  PharmacyReceivingRecord,
  MedicationRecallRecord,
  PharmacyOrgContext
} from '../types/pharmacyOps';

// ============================================================================
// MOCK MEDICATION ORDERS WORKLIST
// Designed to exercise Scenarios A → H and real-world pharmacy operations
// ============================================================================
export const INITIAL_PHARMACY_ORDERS: MedicationOrderContext[] = [
  // 1. Scenario A: Routine Inpatient Antibiotic (Ready for verification & prep)
  {
    id: 'RX-2026-9041',
    axis6OrderId: 'ORD-MED-9041',
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
    patientAllergies: ['بنسلين (Penicillin - طفح جلدي حاد)'],
    patientPrimaryDiagnosis: 'التهاب رئوي حاد مكتسب من المجتمع (CAP)',
    patientRenalStatus: 'eGFR 82 mL/min (طبيعي)',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-LEVO-750',
    brandName: 'تافانيك (Tavanic)',
    genericName: 'Levofloxacin',
    dosageForm: 'محلول تسريب وريدي (IV Infusion Bag)',
    strength: '750 mg / 150 mL',
    orderedDose: '750 mg',
    doseUnit: 'mg',
    route: 'تسريب وريدي IV',
    frequency: 'كل 24 ساعة (Once Daily)',
    scheduleDetails: '10:00 صباحاً يومياً',
    durationDays: 7,
    totalQuantityOrdered: 7,
    quantityUnit: 'أكياس تسريب (Bags)',

    isPrn: false,
    clinicalIndication: 'علاج التهاب رئوي حاد لمريضة تعاني من حساسية البنسلين',
    prescriberName: 'د. طارق العريان',
    prescriberRole: 'أخصائي أول أمراض صدرية',
    prescriberDepartment: 'قسم الصدرية والباطنة العامة',
    prescribedAt: 'منذ 35 دقيقة',
    priority: 'routine',
    isHighAlert: false,
    isAntimicrobial: true,
    isControlledRestricted: false,

    orderStatus: 'under_verification',
    verificationStatus: 'pending',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 42,
      packageUnit: 'Bags',
      defaultLocation: 'صيدلية التنويم المركزية - رف المضادات D2',
      batchLot: 'LT-LV-2026-09',
      expiryDate: '11/2027'
    },

    targetCompletionMinutes: 60,
    elapsedMinutes: 35,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9041-1',
        category: 'antimicrobial_stewardship',
        severity: 'information',
        titleAr: 'مضاد حيوي من مجموعة الفلوروكينولون (Fluoroquinolone Policy)',
        titleEn: 'Fluoroquinolone Stewardship Guidance',
        detailAr: 'المريض موثق لديه حساسية مؤكدة من البنسلين؛ اختيار الليفوفلوكساسين متوافق مع بروتوكول الصدرية للمنشأة.',
        detailEn: 'Penicillin allergy documented; choice conforms to hospital respiratory guidelines.',
        isBlockingPolicy: false
      }
    ]
  },

  // 2. Scenario B: Clinical Clarification Needed (Renal dose adjustment for Vancomycin)
  {
    id: 'RX-2026-9042',
    axis6OrderId: 'ORD-MED-9042',
    patientId: 'p2',
    patientName: 'عبد الله بن فيصل الزهراني',
    patientNameEn: 'Abdullah Faisal Al-Zahrani',
    mrn: 'MRN-88422',
    encounterId: 'ENC-2026-105',
    encounterType: 'inpatient',
    locationWardBed: 'جناح الجراحة 2B - سرير 04',
    patientAge: 68,
    patientGender: 'male',
    patientWeightKg: 82,
    patientAllergies: ['لا توجد حساسية دوائية مسجلة (NKDA)'],
    patientPrimaryDiagnosis: 'التهاب الأنسجة الرخوة بعد الجراحة + اعتلال كلوي مزمن مرحلة 3',
    patientRenalStatus: 'eGFR 34 mL/min (اعتلال كلوي متوسط)',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-VANCO-1G',
    brandName: 'فانكوسين (Vancocin)',
    genericName: 'Vancomycin HCl',
    dosageForm: 'فيال مجفف للحقن الوريدي (Lyophilized Vial)',
    strength: '1 g / Vial',
    orderedDose: '1000 mg',
    doseUnit: 'mg',
    route: 'تسريب وريدي IV Infusion over 2 hrs',
    frequency: 'كل 12 ساعة (Q12H)',
    scheduleDetails: '08:00 - 20:00',
    durationDays: 5,
    totalQuantityOrdered: 10,
    quantityUnit: 'Vials',

    isPrn: false,
    clinicalIndication: 'إنتان جراحي حاد - اشتباه بكتيريا موجبة الجرام مقاومة (MRSA)',
    prescriberName: 'د. فهد المريسي',
    prescriberRole: 'طبيب مقيم جراحة عامة',
    prescriberDepartment: 'جراحة اليوم الواحد والجراحة العامة',
    prescribedAt: 'منذ 55 دقيقة',
    priority: 'urgent',
    isHighAlert: true,
    isAntimicrobial: true,
    isControlledRestricted: false,

    orderStatus: 'clarification_needed',
    verificationStatus: 'clarification',
    verificationNote: 'تم تعليق الصرف مؤقتاً لطلب تعديل الجرعة بما يناسب وظائف الكلى (eGFR 34 mL/min) لتجنب التسمم الكلوي.',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 88,
      packageUnit: 'Vials',
      defaultLocation: 'صيدلية التنويم - ثلاجة المضادات الحيوية C1',
      batchLot: 'VN-2026-44',
      expiryDate: '08/2027'
    },

    targetCompletionMinutes: 45,
    elapsedMinutes: 55,
    isDelayed: true,

    alerts: [
      {
        id: 'ALT-9042-1',
        category: 'renal_dose_adjustment',
        severity: 'high_attention',
        titleAr: 'تنبيه سريري: تعديل جرعة الفانكومايسين لوظائف الكلى المنخفضة',
        titleEn: 'Vancomycin Renal Dose Adjustment Needed',
        detailAr: 'المريض لديه eGFR 34 mL/min؛ وفق سياسة الصيدلية الإكلينيكية، الجرعة المقترحة هي 1000 mg كل 24-36 ساعة بدلاً من كل 12 ساعة مع مراقبة مستوى القاع (Trough level).',
        detailEn: 'Estimated GFR is 34 mL/min. Standard institutional protocol recommends Q24H or Q36H with trough monitoring.',
        isBlockingPolicy: true
      },
      {
        id: 'ALT-9042-2',
        category: 'monitoring_required',
        severity: 'warning',
        titleAr: 'مراقبة مستوى التروية القاعي مطلوبة (Trough Level Monitoring)',
        titleEn: 'Serum Vancomycin Trough Required',
        detailAr: 'ينبغي قياس مستوى القاع قبل الجرعة الثالثة أو الرابعة.',
        detailEn: 'Trough level should be drawn 30 mins prior to the 3rd or 4th dose.',
        isBlockingPolicy: false
      }
    ]
  },

  // 3. Scenario C: High-Alert Medication (Heparin Infusion with Co-Sign Policy)
  {
    id: 'RX-2026-9043',
    axis6OrderId: 'ORD-MED-9043',
    patientId: 'p3',
    patientName: 'محمد سالم الدوسري',
    patientNameEn: 'Mohammed Salem Al-Dosari',
    mrn: 'MRN-88423',
    encounterId: 'ENC-2026-106',
    encounterType: 'inpatient',
    locationWardBed: 'العناية القلبية المركزة CCU - سرير 02',
    patientAge: 59,
    patientGender: 'male',
    patientWeightKg: 88,
    patientAllergies: ['لا توجد'],
    patientPrimaryDiagnosis: 'احتشاء عضلة القلب الحاد غير المرتفع ST (NSTEMI) + خثار وريدي',
    patientRenalStatus: 'طبيعي',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-HEP-25K',
    brandName: 'هيبارين الصوديوم (Heparin Sodium)',
    genericName: 'Heparin Sodium',
    dosageForm: 'كيس تسريب وريدي مستمر (IV Infusion Bag)',
    strength: '25,000 Units / 250 mL D5W (100 Units/mL)',
    orderedDose: '18 Units/kg/hr (معايرة حسب aPTT)',
    doseUnit: 'Units/kg/hr',
    route: 'تسريب وريدي مستمر عبر مضخة ضخ ذكية',
    frequency: 'مستمر مستهدف aPTT 60-80 ثانية',
    scheduleDetails: 'تسريب مستمر 24 ساعة',
    durationDays: 3,
    totalQuantityOrdered: 3,
    quantityUnit: 'Infusion Bags',

    isPrn: false,
    clinicalIndication: 'مضاد تخثر وريدي لمتلازمة الشريان التاجي الحادة والخثار',
    prescriberName: 'د. هشام طلعت',
    prescriberRole: 'استشاري أمراض القلب والقسطرة',
    prescriberDepartment: 'مركز القلب والعناية القلبية',
    prescribedAt: 'منذ 15 دقيقة',
    priority: 'stat',
    isHighAlert: true,
    isAntimicrobial: false,
    isControlledRestricted: false,

    orderStatus: 'verified',
    verificationStatus: 'verified',
    verifiedBy: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
    verifiedAt: 'منذ 10 دقائق',
    verificationNote: 'تم التدقيق المستقل للوزن (88 كجم) ومعدل الجرعة المبدئية ومؤشرات التخثر الأساسية.',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 18,
      packageUnit: 'Bags',
      defaultLocation: 'صيدلية العناية المركزة - ثلاجة الأدوية عالية الخطورة R1',
      batchLot: 'HEP-2026-08',
      expiryDate: '10/2026'
    },

    targetCompletionMinutes: 20,
    elapsedMinutes: 15,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9043-1',
        category: 'high_alert_medication',
        severity: 'high_attention',
        titleAr: 'دواء عالي الخطورة (High-Alert Anticoagulant)',
        titleEn: 'High-Alert Anticoagulant Policy',
        detailAr: 'سياسة المنشأة تتطلب تدقيقاً مزدوجاً مستقلاً (Independent Double Check) بين فني التحضير والصيدلي قبل الصرف.',
        detailEn: 'Mandatory independent double verification required before release to CCU cart.',
        isBlockingPolicy: true
      }
    ]
  },

  // 4. Scenario D: Stock Unavailable & Substitution (Meropenem 1g shortage -> suggested alternative)
  {
    id: 'RX-2026-9044',
    axis6OrderId: 'ORD-MED-9044',
    patientId: 'p4',
    patientName: 'فاطمة أحمد العتيبي',
    patientNameEn: 'Fatima Ahmed Al-Otaibi',
    mrn: 'MRN-88424',
    encounterId: 'ENC-2026-107',
    encounterType: 'inpatient',
    locationWardBed: 'العناية المركزة الجراحية SICU - سرير 05',
    patientAge: 51,
    patientGender: 'female',
    patientWeightKg: 70,
    patientAllergies: ['لا توجد حساسية بنسلين'],
    patientPrimaryDiagnosis: 'التهاب بريتوني حاد بعد جراحة معقدة (Intra-abdominal Sepsis)',
    patientRenalStatus: 'eGFR 65 mL/min',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-MERO-1G',
    brandName: 'ميرونيم (Meronem)',
    genericName: 'Meropenem',
    dosageForm: 'فيال حقن وريدي (IV Vial)',
    strength: '1 g / Vial',
    orderedDose: '1000 mg',
    doseUnit: 'mg',
    route: 'تسريب وريدي IV على مدى 3 ساعات',
    frequency: 'كل 8 ساعات (Q8H)',
    scheduleDetails: '06:00 - 14:00 - 22:00',
    durationDays: 7,
    totalQuantityOrdered: 21,
    quantityUnit: 'Vials',

    isPrn: false,
    clinicalIndication: 'إنتان بطني حاد متعدد الميكروبات',
    prescriberName: 'د. كمال الشناوي',
    prescriberRole: 'استشاري العناية المركزة',
    prescriberDepartment: 'العناية المركزة الجراحية',
    prescribedAt: 'منذ 40 دقيقة',
    priority: 'urgent',
    isHighAlert: false,
    isAntimicrobial: true,
    isControlledRestricted: false,

    orderStatus: 'verified',
    verificationStatus: 'verified',
    verifiedBy: 'د. سامي الجوهر (صيدلي أول)',
    verifiedAt: 'منذ 25 دقيقة',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'out_of_stock',
      availableQuantity: 0,
      packageUnit: 'Vials',
      defaultLocation: 'صيدلية المستشفى الرئيسية - درج الكاربابينيم',
      batchLot: 'MR-OUT',
      isRestrictedStock: true
    },

    targetCompletionMinutes: 45,
    elapsedMinutes: 40,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9044-1',
        category: 'monitoring_required',
        severity: 'high_attention',
        titleAr: 'تنبيه نقص المخزون: ميروبينيم 1 جم غير متوفر مؤقتاً',
        titleEn: 'Stock Shortage: Meropenem 1g Currently Unavailable',
        detailAr: 'المستحضر نفد من صيدلية المستشفى الرئيسية؛ يتوفر البديل العلاجي إيرتابينيم (Ertapenem 1g) أو سيفيبيم + ميترونيدازول بحسب السياسة المعتمدة.',
        detailEn: 'Meropenem stock is depleted. Therapeutic alternatives available: Ertapenem 1g or Cefepime + Metronidazole pending prescriber approval.',
        isBlockingPolicy: false
      }
    ]
  },

  // 5. Scenario E: Sterile IV Compounding (Piperacillin-Tazobactam Infusion in Cleanroom)
  {
    id: 'RX-2026-9045',
    axis6OrderId: 'ORD-MED-9045',
    patientId: 'p5',
    patientName: 'خالد عبد الرحمن السبيعي',
    patientNameEn: 'Khaled Abdulrahman Al-Subaie',
    mrn: 'MRN-88425',
    encounterId: 'ENC-2026-108',
    encounterType: 'inpatient',
    locationWardBed: 'جناح العظام 3A - سرير 18',
    patientAge: 35,
    patientGender: 'male',
    patientWeightKg: 78,
    patientAllergies: ['NKDA'],
    patientPrimaryDiagnosis: 'كسر مفتوح متهتك في عظم الفخذ مع اشتباه تلوث بكتيري',
    patientRenalStatus: 'طبيعي',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-PIPTAZ-4.5',
    brandName: 'تازوسين (Tazocin)',
    genericName: 'Piperacillin / Tazobactam',
    dosageForm: 'كيس تسريب وريدي معقم (Sterile Admixture Bag)',
    strength: '4.5 g in 100 mL 0.9% NaCl',
    orderedDose: '4.5 g',
    doseUnit: 'g',
    route: 'تسريب وريدي ممتد على 4 ساعات (Extended Infusion)',
    frequency: 'كل 6 ساعات (Q6H)',
    scheduleDetails: '06:00 - 12:00 - 18:00 - 24:00',
    durationDays: 5,
    totalQuantityOrdered: 20,
    quantityUnit: 'Admixture Bags',

    isPrn: false,
    clinicalIndication: 'مضاد حيوي واسع المجال لكسر عظام مفتوح مصحوب بإنتان موضعي',
    prescriberName: 'د. ماجد القحطاني',
    prescriberRole: 'استشاري جراحة العظام والعمود الفقري',
    prescriberDepartment: 'جراحة العظام',
    prescribedAt: 'منذ 20 دقيقة',
    priority: 'routine',
    isHighAlert: false,
    isAntimicrobial: true,
    isControlledRestricted: false,

    orderStatus: 'preparing',
    verificationStatus: 'verified',
    verifiedBy: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
    verifiedAt: 'منذ 15 دقيقة',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 56,
      packageUnit: 'Vials',
      defaultLocation: 'غرفة التحضير المعقم (Cleanroom Laminar Flow Hood 02)',
      batchLot: 'TZ-2026-11',
      expiryDate: '01/2028'
    },

    targetCompletionMinutes: 60,
    elapsedMinutes: 20,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9045-1',
        category: 'route_form_mismatch',
        severity: 'information',
        titleAr: 'تحضير معقم لغرفة المحاليل النظيفة (Sterile Compounding Required)',
        titleEn: 'Sterile Compounding Required',
        detailAr: 'يتطلب حل الفيال في 100 مل سالين معقم داخل كابينة التدفق الصفحي مع صلاحية بعد التحضير 24 ساعة تبريد.',
        detailEn: 'Requires cleanroom reconstitution in 100mL NS under laminar flow hood; BUD 24h refrigerated.',
        isBlockingPolicy: false
      }
    ]
  },

  // 6. Scenario F: Discharge Medication & Counseling (Apixaban 5mg + Ramipril)
  {
    id: 'RX-2026-9046',
    axis6OrderId: 'ORD-MED-9046',
    patientId: 'p6',
    patientName: 'عائشة ناصر الشمري',
    patientNameEn: 'Aisha Nasser Al-Shammari',
    mrn: 'MRN-88426',
    encounterId: 'ENC-2026-109',
    encounterType: 'inpatient',
    locationWardBed: 'جناح القلب 1A - سرير 08 (جاهزة للخروج)',
    patientAge: 62,
    patientGender: 'female',
    patientWeightKg: 68,
    patientAllergies: ['أسبرين (Aspirin - تشنج قصبي حاد)'],
    patientPrimaryDiagnosis: 'رجفان أذيني غير صمامي (Non-valvular Atrial Fibrillation) + ارتفاع ضغط الدم',
    patientRenalStatus: 'eGFR 58 mL/min (مستقر)',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-ELIQ-5MG',
    brandName: 'إيليكويس (Eliquis)',
    genericName: 'Apixaban',
    dosageForm: 'أقراص فموية مغلفة (Film-coated Tablets)',
    strength: '5 mg',
    orderedDose: '5 mg',
    doseUnit: 'mg',
    route: 'فموي Oral',
    frequency: 'مرتين يومياً (BID)',
    scheduleDetails: '09:00 صباحاً و 09:00 مساءً',
    durationDays: 30,
    totalQuantityOrdered: 60,
    quantityUnit: 'Tablets (2 Packs of 30)',

    isPrn: false,
    clinicalIndication: 'وقاية طويلة الأمد من الجلطات والسكتة الدماغية في مرضى الرجفان الأذيني',
    prescriberName: 'د. حازم البشير',
    prescriberRole: 'استشاري أمراض القلب والأوعية الدموية',
    prescriberDepartment: 'مركز القلب المتخصص',
    prescribedAt: 'منذ 50 دقيقة',
    priority: 'routine',
    isHighAlert: true,
    isAntimicrobial: false,
    isControlledRestricted: false,

    orderStatus: 'prepared',
    verificationStatus: 'verified',
    verifiedBy: 'د. منى الرويلي (صيدلي العيادات الخارجية والتخريج)',
    verifiedAt: 'منذ 30 دقيقة',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 120,
      packageUnit: 'Boxes',
      defaultLocation: 'صيدلية التخريج - رف الأدوية القلبية E3',
      batchLot: 'APX-2026-301',
      expiryDate: '04/2028'
    },

    targetCompletionMinutes: 90,
    elapsedMinutes: 50,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9046-1',
        category: 'high_alert_medication',
        severity: 'high_attention',
        titleAr: 'تثقيف وإرشاد المريض إلزامي (Patient Counseling Required)',
        titleEn: 'Oral Anticoagulant Discharge Counseling Required',
        detailAr: 'مضاد تخثر فموي حديث عالي الخطورة؛ يلزم إجراء جلسة إرشاد وتثقيف صيدلاني عن علامات النزيف والتداخلات الدوائية قبل تسليم الدواء.',
        detailEn: 'Mandatory discharge counseling on bleeding signs, compliance, and OTC drug interactions.',
        isBlockingPolicy: false
      }
    ]
  },

  // 7. Scenario G: Order Cancelled After Preparation (Ceftriaxone reconstituted, prescriber cancelled)
  {
    id: 'RX-2026-9047',
    axis6OrderId: 'ORD-MED-9047',
    patientId: 'p7',
    patientName: 'ياسر فهد المطيري',
    patientNameEn: 'Yasser Fahad Al-Mutairi',
    mrn: 'MRN-88427',
    encounterId: 'ENC-2026-110',
    encounterType: 'inpatient',
    locationWardBed: 'طوارئ الحوادث - سرير الملاحظة 07',
    patientAge: 29,
    patientGender: 'male',
    patientWeightKg: 75,
    patientAllergies: ['NKDA'],
    patientPrimaryDiagnosis: 'اشتباه حمى مجهولة المصدر تم نفيها بعد ظهور الفحوصات',
    patientRenalStatus: 'طبيعي',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-CEFTR-2G',
    brandName: 'روسيفين (Rocephin)',
    genericName: 'Ceftriaxone Sodium',
    dosageForm: 'محلول تسريب وريدي معاد حله (Reconstituted IV Bag)',
    strength: '2 g in 100 mL Normal Saline',
    orderedDose: '2000 mg',
    doseUnit: 'mg',
    route: 'تسريب وريدي IV',
    frequency: 'جرعة واحدة الآن (STAT Once)',
    scheduleDetails: 'STAT',
    durationDays: 1,
    totalQuantityOrdered: 1,
    quantityUnit: 'Infusion Bag',

    isPrn: false,
    clinicalIndication: 'تغطية مبدئية لاشتباه عدوى سحائية',
    prescriberName: 'د. طلال السديري',
    prescriberRole: 'أخصائي طب الطوارئ',
    prescriberDepartment: 'قسم الطوارئ والإصابات',
    prescribedAt: 'منذ ساعتين',
    priority: 'stat',
    isHighAlert: false,
    isAntimicrobial: true,
    isControlledRestricted: false,

    orderStatus: 'cancelled_by_source',
    verificationStatus: 'verified',
    verifiedBy: 'د. سامي الجوهر',
    verifiedAt: 'منذ 100 دقيقة',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'quarantined',
      availableQuantity: 0,
      packageUnit: 'Bags',
      defaultLocation: 'ثلاجة الحجر المؤقت بالصيدلية - رف الإلغاءات',
      batchLot: 'CF-STAT-09',
      expiryDate: 'صلاحية بعد الحل: 24 ساعة تبريد'
    },

    targetCompletionMinutes: 30,
    elapsedMinutes: 120,
    isDelayed: false,

    isSourceChanged: true,
    sourceChangeReason: 'تم إلغاء الطلب من قبل الطبيب المعالج بعد استبعاد التشخيص عبر البزل القطني، والمستحضر كان قد جُهز بالفعل.',

    alerts: [
      {
        id: 'ALT-9047-1',
        category: 'monitoring_required',
        severity: 'high_attention',
        titleAr: 'تنبيه: أُلغي الطلب بعد اكتمال التحضير (Cancelled After Preparation)',
        titleEn: 'Order Cancelled After Preparation',
        detailAr: 'المستحضر معقم وجاهز لكن تم إلغاء الطلب من الطبيب؛ يلزم توثيق التخلص الطبي أو إعادته لمريض آخر إن طابقت السياسة وفترة الصلاحية.',
        detailEn: 'Product prepared in sterile hood then discontinued. Document product disposition (waste vs reassign according to policy).',
        isBlockingPolicy: false
      }
    ]
  },

  // 8. Scenario H: Partial Dispense (Enoxaparin 40mg - 10 ordered, only 4 available in stock)
  {
    id: 'RX-2026-9048',
    axis6OrderId: 'ORD-MED-9048',
    patientId: 'p8',
    patientName: 'هند إبراهيم الغامدي',
    patientNameEn: 'Hind Ibrahim Al-Ghamdi',
    mrn: 'MRN-88428',
    encounterId: 'ENC-2026-111',
    encounterType: 'inpatient',
    locationWardBed: 'جناح النساء والولادة 3B - سرير 02',
    patientAge: 33,
    patientGender: 'female',
    patientWeightKg: 72,
    patientAllergies: ['NKDA'],
    patientPrimaryDiagnosis: 'وقاية بعد ولادة قيصرية معتدلة الخطورة لخثار الأوردة',
    patientRenalStatus: 'طبيعي',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-CLEX-40',
    brandName: 'كليكسان (Clexane)',
    genericName: 'Enoxaparin Sodium',
    dosageForm: 'حقنة جاهزة للحقن تحت الجلد (Pre-filled Syringe)',
    strength: '40 mg / 0.4 mL',
    orderedDose: '40 mg',
    doseUnit: 'mg',
    route: 'تحت الجلد SC',
    frequency: 'كل 24 ساعة (Once Daily)',
    scheduleDetails: '20:00 مساءً يومياً',
    durationDays: 10,
    totalQuantityOrdered: 10,
    quantityUnit: 'Pre-filled Syringes',

    isPrn: false,
    clinicalIndication: 'وقاية من الانصمام الخثاري الوريدي بعد الولادة القيصرية',
    prescriberName: 'د. نجلاء عبد العظيم',
    prescriberRole: 'أخصائية التوليد وأمراض النساء',
    prescriberDepartment: 'قسم النساء والولادة',
    prescribedAt: 'منذ 25 دقيقة',
    priority: 'routine',
    isHighAlert: true,
    isAntimicrobial: false,
    isControlledRestricted: false,

    orderStatus: 'partially_dispensed',
    verificationStatus: 'verified',
    verifiedBy: 'د. ليلى عبد الحميد',
    verifiedAt: 'منذ 15 دقيقة',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'low_stock',
      availableQuantity: 4,
      packageUnit: 'Syringes',
      defaultLocation: 'صيدلية النساء والولادة - درج مضادات التخثر B2',
      batchLot: 'CLX-2026-99',
      expiryDate: '06/2027'
    },

    targetCompletionMinutes: 60,
    elapsedMinutes: 25,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9048-1',
        category: 'monitoring_required',
        severity: 'warning',
        titleAr: 'صرف جزئي للمستحضر (Partial Dispense Context)',
        titleEn: 'Partial Supply Issued',
        detailAr: 'المتوفر حالياً في جناح الصيدلية 4 حقن تكفي لمدة 4 أيام؛ تم تفعيل طلب استكمال الإمداد للكمية المتبقية (6 حقن) قبل موعد الجرعة الخامسة.',
        detailEn: 'Dispensed 4 syringes (4 days supply); remaining 6 syringes queued for replenishment before day 5.',
        isBlockingPolicy: false
      }
    ]
  },

  // 9. Outpatient Prescription (Ambulatory Clinic)
  {
    id: 'RX-2026-9049',
    axis6OrderId: 'ORD-MED-9049',
    patientId: 'p9',
    patientName: 'صالح عبد الله العيسى',
    patientNameEn: 'Saleh Abdullah Al-Essa',
    mrn: 'MRN-88429',
    encounterId: 'ENC-2026-112',
    encounterType: 'outpatient',
    locationWardBed: 'عيادة الغدد الصماء والسكري 03',
    patientAge: 56,
    patientGender: 'male',
    patientWeightKg: 85,
    patientAllergies: ['سلفا (Sulfonamides - طفح جلدي)'],
    patientPrimaryDiagnosis: 'السكري من النوع الثاني غير المنضبط + اعتلال الأعصاب الطرفية',
    patientRenalStatus: 'eGFR 70 mL/min',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-JANUMET-50-1000',
    brandName: 'جانوميت (Janumet)',
    genericName: 'Sitagliptin / Metformin HCl',
    dosageForm: 'أقراص فموية (Tablets)',
    strength: '50 mg / 1000 mg',
    orderedDose: '1 Tablet',
    doseUnit: 'Tablet',
    route: 'فموي مع الطعام Oral with meals',
    frequency: 'مرتين يومياً (BID)',
    scheduleDetails: 'مع الإفطار والعشاء',
    durationDays: 30,
    totalQuantityOrdered: 60,
    quantityUnit: 'Tablets',

    isPrn: false,
    clinicalIndication: 'علاج السكري من النوع الثاني خافض للسكر',
    prescriberName: 'د. أحمد الهاشمي',
    prescriberRole: 'استشاري الغدد الصماء والسكري',
    prescriberDepartment: 'العيادات الخارجية التخصصية',
    prescribedAt: 'منذ 15 دقيقة',
    priority: 'routine',
    isHighAlert: false,
    isAntimicrobial: false,
    isControlledRestricted: false,

    orderStatus: 'ready_for_dispense',
    verificationStatus: 'verified',
    verifiedBy: 'د. منى الرويلي',
    verifiedAt: 'منذ 8 دقائق',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 240,
      packageUnit: 'Packs',
      defaultLocation: 'صيدلية العيادات الخارجية - رف السكري A1',
      batchLot: 'JN-2026-104',
      expiryDate: '12/2027'
    },

    targetCompletionMinutes: 30,
    elapsedMinutes: 15,
    isDelayed: false,

    alerts: []
  },

  // 10. Scenario P10: ISMP Tall-Man Lettering LASA Pair (predniSONE vs prednisoLONE)
  {
    id: 'RX-2026-9050',
    axis6OrderId: 'ORD-MED-9050',
    patientId: 'p10',
    patientName: 'منيرة عبد العزيز الدوسري',
    patientNameEn: 'Munira Abdulaziz Al-Dosari',
    mrn: 'MRN-88430',
    encounterId: 'ENC-2026-113',
    encounterType: 'inpatient',
    locationWardBed: 'جناح الروماتيزم والمناعة 4B - سرير 09',
    patientAge: 48,
    patientGender: 'female',
    patientWeightKg: 62,
    patientAllergies: ['NKDA'],
    patientPrimaryDiagnosis: 'هجمة حادة للذئبة الحمامية الجهازية (SLE Flare)',
    patientRenalStatus: 'طبيعي',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-PREDNISONE-20',
    brandName: 'دلتازون (Deltasone)',
    genericName: 'predniSONE',
    isTallMan: true,
    tallManName: 'predniSONE',
    dosageForm: 'أقراص فموية (Oral Tablets)',
    strength: '20 mg',
    orderedDose: '20 mg',
    doseUnit: 'mg',
    route: 'فموي Oral مع وجبة الإفطار',
    frequency: 'مرة واحدة يومياً (Once Daily)',
    scheduleDetails: '08:00 صباحاً',
    durationDays: 14,
    totalQuantityOrdered: 14,
    quantityUnit: 'Tablets',

    isPrn: false,
    clinicalIndication: 'تثبيط مناعي لعلاج هجمة الذئبة الحمامية الحادة',
    prescriberName: 'د. حصة الرشيدي',
    prescriberRole: 'استشارية الأمراض الروماتيزمية والمناعة',
    prescriberDepartment: 'قسم الباطنة التخصصية',
    prescribedAt: 'منذ 20 دقيقة',
    priority: 'routine',
    isHighAlert: false,
    isAntimicrobial: false,
    isControlledRestricted: false,

    sourceOrderVersion: 'v1.0',
    orderStatus: 'under_verification',
    verificationStatus: 'pending',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 180,
      packageUnit: 'Tablets',
      defaultLocation: 'صيدلية التنويم المركزية - رف الكورتيزون C3',
      batchLot: 'PRD-2026-02',
      expiryDate: '09/2027'
    },

    targetCompletionMinutes: 60,
    elapsedMinutes: 20,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9050-1',
        category: 'lasa_soundalike',
        severity: 'warning',
        titleAr: 'تنبيه دواء شبيه اللفظ والرسم (ISMP Tall-Man: predniSONE)',
        titleEn: 'ISMP Tall-Man LASA Warning: predniSONE vs prednisoLONE',
        detailAr: 'المستحضر المطلوب هو predniSONE (أقراص فموية)؛ تأكد من عدم الخلط مع prednisoLONE (شراب أو أقراص نشطة كبدياً).',
        detailEn: 'Dispensing predniSONE. Confirm not confused with prednisoLONE. Apply Tall-Man typography on packaging label.',
        isBlockingPolicy: false
      }
    ]
  },

  // 11. Scenario P02 / P10: High-Alert Inotropic with ISMP Tall-Man (DOBUTamine vs DOPamine)
  {
    id: 'RX-2026-9051',
    axis6OrderId: 'ORD-MED-9051',
    patientId: 'p11',
    patientName: 'فهد إبراهيم السالم',
    patientNameEn: 'Fahad Ibrahim Al-Salem',
    mrn: 'MRN-88431',
    encounterId: 'ENC-2026-114',
    encounterType: 'inpatient',
    locationWardBed: 'العناية القلبية المركزة CCU - سرير 05',
    patientAge: 71,
    patientGender: 'male',
    patientWeightKg: 76,
    patientAllergies: ['NKDA'],
    patientPrimaryDiagnosis: 'صدمة قلبية وقصور حاد في البطين الأيسر (Cardiogenic Shock)',
    patientRenalStatus: 'eGFR 45 mL/min',
    patientHepaticStatus: 'طبيعي',

    medicationCode: 'MED-DOBUTAMINE-250',
    brandName: 'دوبوتريكس (Dobutrex)',
    genericName: 'DOBUTamine HCl',
    isTallMan: true,
    tallManName: 'DOBUTamine',
    dosageForm: 'محلول تسريب وريدي مركز (IV Infusion Solution)',
    strength: '250 mg / 20 mL',
    orderedDose: '5 mcg/kg/min (معايرة حسب استجابة الضغط والتروية)',
    doseUnit: 'mcg/kg/min',
    route: 'تسريب وريدي مستمر عبر قسطرة وريدية مركزية',
    frequency: 'تسريب مستمر مستهدف ضغط شرياني > 65 mmHg',
    scheduleDetails: '24 ساعة تسريب عبر مضخة ضخ ذكية',
    durationDays: 2,
    totalQuantityOrdered: 2,
    quantityUnit: 'Infusion Bags (250mg in 250mL D5W)',

    isPrn: false,
    clinicalIndication: 'دعم انقباض القلب في الصدمة القلبية',
    prescriberName: 'د. هشام طلعت',
    prescriberRole: 'استشاري أمراض القلب والعناية الحرجة',
    prescriberDepartment: 'مركز القلب CCU',
    prescribedAt: 'منذ 10 دقائق',
    priority: 'stat',
    isHighAlert: true,
    isAntimicrobial: false,
    isControlledRestricted: false,

    sourceOrderVersion: 'v1.0',
    orderStatus: 'under_verification',
    verificationStatus: 'pending',

    formularyStatus: 'formulary',
    stockContext: {
      availability: 'available',
      availableQuantity: 24,
      packageUnit: 'Vials',
      defaultLocation: 'صيدلية العناية المركزة - ثلاجة الأدوية الإسعافية R2',
      batchLot: 'DOB-2026-19',
      expiryDate: '05/2027'
    },

    targetCompletionMinutes: 15,
    elapsedMinutes: 10,
    isDelayed: false,

    alerts: [
      {
        id: 'ALT-9051-1',
        category: 'lasa_soundalike',
        severity: 'high_attention',
        titleAr: 'تنبيه دواء عالي الخطورة وشبيه اللفظ (ISMP Tall-Man: DOBUTamine)',
        titleEn: 'High-Alert LASA Warning: DOBUTamine vs DOPamine',
        detailAr: 'تحذير عالي الخطورة: DOBUTamine مقوٍ لعضلة القلب وموسع وعائي، بينما DOPamine مقبض وعائي بجرعاته العالية. الخطأ في التبديل قد يسبب انهيار الدورة الدموية. يتطلب تدقيقاً مزدوجاً مستقلاً.',
        detailEn: 'Critical inotrope/vasopressor LASA pair. Independent double check required before compounding and release to CCU.',
        isBlockingPolicy: true
      },
      {
        id: 'ALT-9051-2',
        category: 'high_alert_medication',
        severity: 'high_attention',
        titleAr: 'سياسة التدقيق المستقل المزدوج (Independent Double Check)',
        titleEn: 'Independent Double Verification Required',
        detailAr: 'يتطلب مراجعة مستقلة للحسابات والتركيز والوزن ومعدل الضخ قبل الاعتماد.',
        detailEn: 'Mandatory independent secondary verification.',
        isBlockingPolicy: true
      }
    ]
  }
];

// ============================================================================
// MOCK PHARMACY INTERVENTIONS
// ============================================================================
export const INITIAL_PHARMACY_INTERVENTIONS: PharmacyIntervention[] = [
  {
    id: 'INT-2026-301',
    orderId: 'RX-2026-9042',
    patientName: 'عبد الله بن فيصل الزهراني',
    mrn: 'MRN-88422',
    medicationName: 'Vancomycin 1g IV Q12H',
    issueCategory: 'renal_dose_clarification',
    issueDescription: 'المريض لديه قصور كلوي ملحوظ (eGFR 34 mL/min) والجرعة الموصوفة 1000 مجم كل 12 ساعة قد تؤدي إلى تراكم دوائي وتسمم كلوي حاد.',
    pharmacistRecommendation: 'يوصى بتعديل الفاصل الزمني للجرعة إلى 1000 مجم كل 24 ساعة، وسحب مستوى القاع (Trough) قبل الجرعة الثالثة بمستهدف 15-20 mcg/mL.',
    communicatedTo: 'د. فهد المريسي (طبيب مقيم جراحة)',
    communicationChannel: 'secure_clinical_chat',
    status: 'pending_prescriber',
    initiatedBy: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
    initiatedAt: 'منذ 25 دقيقة'
  },
  {
    id: 'INT-2026-302',
    orderId: 'RX-2026-9044',
    patientName: 'فاطمة أحمد العتيبي',
    mrn: 'MRN-88424',
    medicationName: 'Meropenem 1g IV Q8H',
    issueCategory: 'stock_shortage_substitution',
    issueDescription: 'المستحضر غير متوفر حالياً في مخزون الصيدلية الرئيسية لوجود تأخر عالمي في التوريد.',
    pharmacistRecommendation: 'اقتراح استبدال المستحضر بـ Ertapenem 1g IV Q24H أو Cefepime 2g Q8H + Metronidazole 500mg Q8H بحسب بروتوكول الصيدلة السريرية ومزرعة البكتيريا.',
    communicatedTo: 'د. كمال الشناوي (استشاري العناية المركزة)',
    communicationChannel: 'phone_direct',
    status: 'accepted_by_prescriber',
    prescriberResponseNote: 'تمت الموافقة هاتفياً على التحويل إلى Cefepime 2g + Metronidazole، وسيقوم الطبيب بتحديث طلب الدواء في EMR.',
    prescriberActionTaken: 'source_order_modified',
    initiatedBy: 'د. سامي الجوهر',
    initiatedAt: 'منذ 40 دقيقة',
    resolvedAt: 'منذ 10 دقائق'
  }
];

// ============================================================================
// MOCK COMPOUNDING WORKSHEETS (STERILE & NON-STERILE)
// ============================================================================
export const INITIAL_COMPOUNDING_WORKSHEETS: CompoundingWorksheet[] = [
  {
    id: 'CWS-2026-101',
    orderId: 'RX-2026-9045',
    patientName: 'خالد عبد الرحمن السبيعي',
    mrn: 'MRN-88425',
    preparationType: 'sterile_iv_admixture',
    primaryDrug: 'Piperacillin / Tazobactam 4.5g',
    doseOrdered: '4.5 g',
    diluentName: '0.9% Sodium Chloride (Normal Saline)',
    diluentVolume: '100 mL',
    finalConcentration: '45 mg/mL',
    finalVolume: '100 mL',
    beyondUseDate: '24 ساعة تبريد (2-8°م) أو 6 ساعات في حرارة الغرفة',
    storageConditions: 'refrigerated_2_8',
    instructions: 'حل فيال التازوسين 4.5 جم في 20 مل محلول ملحي، ثم سحبه وحقنه داخل كيس سالين 100 مل تحت كابينة التدفق الصفحي المعقمة (Cleanroom BSC II).',
    ingredients: [
      {
        name: 'Tazocin (Piperacillin/Tazobactam) 4.5g Vial',
        orderedAmount: '1 Vial (4.5g)',
        actualMeasuredAmount: '4.5 g',
        lotNumber: 'LT-TZ-881',
        expiryDate: '10/2027',
        verifiedBy: 'فني تحضير: ماجد الشريف'
      },
      {
        name: '0.9% Sodium Chloride Injection 100 mL Bag',
        orderedAmount: '100 mL',
        actualMeasuredAmount: '100 mL',
        lotNumber: 'LT-NS-994',
        expiryDate: '03/2028',
        verifiedBy: 'فني تحضير: ماجد الشريف'
      }
    ],
    preparedByTechnician: 'ماجد الشريف (فني صيدلة معتمد للتحضير المعقم)',
    preparedAt: 'منذ 10 دقائق',
    verificationPolicy: 'independent_double_check',
    preparationState: 'prepared_awaiting_check',
    notes: 'تم فحص الشفافية وخلو المحلول من أي شوائب أو بلورات ترسب.'
  },
  {
    id: 'CWS-2026-102',
    orderId: 'RX-2026-9043',
    patientName: 'محمد سالم الدوسري',
    mrn: 'MRN-88423',
    preparationType: 'sterile_iv_infusion',
    primaryDrug: 'Heparin Sodium 25,000 Units',
    doseOrdered: '25,000 Units in 250 mL D5W',
    diluentName: '5% Dextrose in Water (D5W)',
    diluentVolume: '250 mL',
    finalConcentration: '100 Units/mL',
    finalVolume: '250 mL',
    beyondUseDate: '48 ساعة في حرارة الغرفة محمي من الضوء',
    storageConditions: 'room_temperature',
    instructions: 'سحب 5 مل من هيبارين 5000 وحدة/مل (إجمالي 25,000 وحدة) وحقنها في كيس D5W سعة 250 مل. يلزم تدقيق مستقل مزدوج قبل تحرير الكيس.',
    ingredients: [
      {
        name: 'Heparin Sodium Injection (5,000 Units/mL, 5 mL Vial)',
        orderedAmount: '5 mL (25,000 Units)',
        actualMeasuredAmount: '5.0 mL',
        lotNumber: 'HEP-LT-2026',
        expiryDate: '08/2027',
        verifiedBy: 'فني صيدلة: ريان المالكي'
      },
      {
        name: '5% Dextrose Injection 250 mL Bag',
        orderedAmount: '250 mL',
        actualMeasuredAmount: '250 mL',
        lotNumber: 'D5W-2026-12',
        expiryDate: '12/2027',
        verifiedBy: 'فني صيدلة: ريان المالكي'
      }
    ],
    preparedByTechnician: 'ريان المالكي',
    preparedAt: 'منذ 12 دقيقة',
    finalCheckedByPharmacist: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
    finalCheckedAt: 'منذ 5 دقائق',
    verificationPolicy: 'independent_double_check',
    preparationState: 'passed_final_check',
    notes: 'تم فحص الحجم المضاف ومطابقة الكود الدوائي المستقل.'
  }
];

// ============================================================================
// MOCK DISPENSE RECORDS
// ============================================================================
export const INITIAL_DISPENSE_RECORDS: DispenseRecord[] = [
  {
    id: 'DSP-2026-8811',
    orderId: 'RX-2026-9046',
    patientName: 'عائشة ناصر الشمري',
    mrn: 'MRN-88426',
    medicationName: 'Apixaban (Eliquis) 5mg Tablets',
    dosageForm: 'أقراص فموية',
    route: 'فموي Oral',
    orderedQuantity: 60,
    dispensedQuantity: 60,
    remainingQuantity: 0,
    isPartialDispense: false,
    batchLot: 'APX-2026-301',
    expiryDate: '04/2028',
    dispensedBy: 'د. منى الرويلي',
    dispensedAt: 'منذ 20 دقيقة',
    finalCheckBy: 'د. سامي الجوهر',
    destinationType: 'patient_counter_pickup',
    destinationLocation: 'نافذة تسليم أدوية التخريج 02',
    handoffStatus: 'awaiting_collection',
    barcodeScannedMock: true
  },
  {
    id: 'DSP-2026-8812',
    orderId: 'RX-2026-9048',
    patientName: 'هند إبراهيم الغامدي',
    mrn: 'MRN-88428',
    medicationName: 'Enoxaparin (Clexane) 40mg/0.4mL',
    dosageForm: 'حقن جاهزة تحت الجلد',
    route: 'تحت الجلد SC',
    orderedQuantity: 10,
    dispensedQuantity: 4,
    remainingQuantity: 6,
    isPartialDispense: true,
    partialDispenseReason: 'كمية محدودة في عهدة الجناح؛ تم صرف ما يكفي 4 أيام لحين وصول التوريد الداخلي.',
    nextSupplyDueTime: 'غداً 14:00',
    batchLot: 'CLX-2026-99',
    expiryDate: '06/2027',
    dispensedBy: 'د. ليلى عبد الحميد',
    dispensedAt: 'منذ 15 دقيقة',
    destinationType: 'inpatient_ward_cart',
    destinationLocation: 'عربة أدوية جناح النساء والولادة 3B',
    handoffStatus: 'collected_handoff_complete',
    collectedBy: 'ممرضة الجناح: مريم العلي',
    collectedAt: 'منذ 5 دقائق',
    barcodeScannedMock: true
  }
];

// ============================================================================
// MOCK OUTPATIENT PRESCRIPTION QUEUE
// ============================================================================
export const INITIAL_OUTPATIENT_PRESCRIPTIONS: OutpatientPrescriptionContext[] = [
  {
    prescriptionId: 'OPD-RX-104',
    orderId: 'RX-2026-9049',
    patientName: 'صالح عبد الله العيسى',
    mrn: 'MRN-88429',
    encounterId: 'ENC-2026-112',
    tokenNumber: 'P-104',
    medicationCount: 1,
    administrativeClearance: 'cleared_insurance_approved',
    counselingStatus: 'required_first_time',
    pickupWindow: 'نافذة الصرف 03 (استشارة الغدد)',
    isReadyForPickup: true
  }
];

// ============================================================================
// MOCK DISCHARGE SUPPLY QUEUE
// ============================================================================
export const INITIAL_DISCHARGE_SUPPLIES: DischargeMedicationSupply[] = [
  {
    dischargeOrderGroupRef: 'DISCH-GRP-88426',
    orderId: 'RX-2026-9046',
    patientName: 'عائشة ناصر الشمري',
    mrn: 'MRN-88426',
    wardLocation: 'جناح القلب 1A - سرير 08',
    medicationName: 'Eliquis (Apixaban) 5mg BID',
    supplyDays: 30,
    quantitySupplied: 60,
    medRecReconciledReference: 'REC-AXIS8-9046',
    adtDischargeReadinessLinked: true,
    counselingDone: false,
    handedToPatientOrFamily: false
  }
];

// ============================================================================
// MOCK RETURNS & CANCELLATION DISPOSITION
// ============================================================================
export const INITIAL_MEDICATION_RETURNS: MedicationReturnContext[] = [
  {
    id: 'RET-2026-041',
    orderId: 'RX-2026-8910',
    patientName: 'بدر سلطان الشريف',
    mrn: 'MRN-88410',
    locationWard: 'جناح الجراحة 2A',
    medicationName: 'Paracetamol 1g IV Infusion',
    quantityReturned: 2,
    returnReason: 'patient_discharged_early',
    packagingCondition: 'intact_sealed',
    dispositionAction: 'return_to_active_stock',
    processedBy: 'فني صيدلة: ماجد الشريف',
    processedAt: 'منذ ساعتين'
  },
  {
    id: 'RET-2026-042',
    orderId: 'RX-2026-8915',
    patientName: 'فهد عبد العزيز العتيبي',
    mrn: 'MRN-88415',
    locationWard: 'طوارئ الحوادث',
    medicationName: 'Morphine Sulfate 10mg Ampoule',
    quantityReturned: 1,
    returnReason: 'order_discontinued_by_doctor',
    packagingCondition: 'intact_sealed',
    dispositionAction: 'credit_reconciliation_only',
    processedBy: 'د. سامي الجوهر (مسؤول عهدة المخدرات)',
    processedAt: 'منذ 3 ساعات'
  }
];

export const INITIAL_CANCELLED_PREPARATIONS: CancelledAfterPreparationContext[] = [
  {
    orderId: 'RX-2026-9047',
    medicationName: 'Ceftriaxone 2g in 100 mL Normal Saline',
    preparedWorksheetId: 'CWS-STAT-09',
    preparedAt: 'منذ ساعتين',
    cancelledAt: 'منذ 80 دقيقة',
    prescriberCancellationReason: 'تم استبعاد الاشتباه المبدئي بالتهاب السحايا بناء على نتيجة البزل القطني السلبية.',
    productDisposition: 'quarantine_review',
    dispositionDocumentedBy: 'د. سامي الجوهر',
    notes: 'المحلول محفوظ في ثلاجة الحجر المؤقت؛ صلاحيته 24 ساعة تبريد ويمكن إعادة تخصيصه لمريض طوارئ آخر إن طابقت الشروط.'
  }
];

// ============================================================================
// INITIAL OPERATIONAL METRICS
// ============================================================================
export const INITIAL_PHARMACY_METRICS: PharmacyOperationalMetrics = {
  awaitingVerificationCount: 2,
  clarificationsPendingCount: 1,
  highAttentionOrdersCount: 3,
  verifiedAwaitingPrepCount: 1,
  inPreparationCount: 1,
  readyForDispensingCount: 2,
  awaitingHandoffCount: 1,
  delayedOrdersCount: 1,
  stockShortagesAttentionCount: 1,
  sterileIvCompoundingCount: 2,
  returnsPendingInspectionCount: 2,
  recentDispensedTodayCount: 48
};

// ============================================================================
// ISMP / FDA TALL-MAN LETTERING CATALOG REFERENCE
// Look-Alike / Sound-Alike (LASA) Drug Pairs
// ============================================================================
export interface LasaDrugPair {
  id: string;
  pairName: string;
  drugA: { name: string; tallMan: string; indication: string; route: string };
  drugB: { name: string; tallMan: string; indication: string; route: string };
  ismpRiskCategory: string;
  mitigationStrategy: string;
}

export const ISMP_TALLMAN_CATALOG_PAIRS: LasaDrugPair[] = [
  {
    id: 'LASA-01',
    pairName: 'predniSONE vs prednisoLONE',
    drugA: {
      name: 'Prednisone',
      tallMan: 'predniSONE',
      indication: 'كورتيكوستيرويد فموي (يتطلب تحول كبدي إلى بريدنيزولون)',
      route: 'فموي Oral'
    },
    drugB: {
      name: 'Prednisolone',
      tallMan: 'prednisoLONE',
      indication: 'كورتيكوستيرويد نشط مباشرة (مفضل في الاعتلال الكبدي والأطفال)',
      route: 'فموي / شراب Oral liquid'
    },
    ismpRiskCategory: 'كورتيكوستيرويد جهازي — اختلاف في التكافؤ الحيوي والشكل الصيدلاني',
    mitigationStrategy: 'تطبيق أحرف Tall-Man في شاشات الصرف، والتمييز اللوني على الرفوف والتنبيه التلقائي عند الاختيار.'
  },
  {
    id: 'LASA-02',
    pairName: 'DOPamine vs DOBUTamine',
    drugA: {
      name: 'Dopamine',
      tallMan: 'DOPamine',
      indication: 'رافع ضغط ومقبض وعائي (Inotropic & Vasopressor)',
      route: 'تسريب وريدي مركزي مستمر'
    },
    drugB: {
      name: 'Dobutamine',
      tallMan: 'DOBUTamine',
      indication: 'مقوٍ لعضلة القلب وموسع وعائي محيطي (Inotropic & Vasodilator)',
      route: 'تسريب وريدي مستمر'
    },
    ismpRiskCategory: 'أدوية العناية المركزة عالية الخطورة — خطأ التبديل قد يؤدي إلى هبوط حاد في الضغط أو اضطراب نظم قلبي مميت',
    mitigationStrategy: 'أحرف Tall-Man إلزامية على ملصقات أكياس التسريب وتدقيق مستقل مزدوج قبل تحرير الدواء.'
  },
  {
    id: 'LASA-03',
    pairName: 'hydrOXYzine vs hydrALAzine',
    drugA: {
      name: 'Hydroxyzine',
      tallMan: 'hydrOXYzine',
      indication: 'مضاد هيستامين ومهدئ للقلق والحكة',
      route: 'فموي Oral'
    },
    drugB: {
      name: 'Hydralazine',
      tallMan: 'hydrALAzine',
      indication: 'خافض لضغط الدم موسع للشرايين',
      route: 'فموي / حقن وريدي IV'
    },
    ismpRiskCategory: 'فئات علاجية متباعدة — تبديلهما يسبب انخفاضاً حاداً في ضغط الدم أو فرط التسكين',
    mitigationStrategy: 'فصل مواضع التخزين في الصيدلية وخزائن الأجنحة وتأكيد التشخيص السريري المرافق.'
  },
  {
    id: 'LASA-04',
    pairName: 'EPINEPHrine vs ePHEDrine',
    drugA: {
      name: 'Epinephrine',
      tallMan: 'EPINEPHrine',
      indication: 'إنعاش قلبي رئوي وحساسية مفرطة (Anaphylaxis)',
      route: 'حقن عضلي / تسريب وريدي'
    },
    drugB: {
      name: 'Ephedrine',
      tallMan: 'ePHEDrine',
      indication: 'هبوط الضغط المصاحب للتخدير النصفي',
      route: 'حقن وريدي بطيء IV'
    },
    ismpRiskCategory: 'أدوية طوارئ وتخدير — فارق الفاعلية 10 أضعاف بين العقارين',
    mitigationStrategy: 'فصل أدراج الطوارئ وتلوين الأمبولات واستخدام Tall-Man على شاشة الصرف والملصق.'
  },
  {
    id: 'LASA-05',
    pairName: 'vinBLAStine vs vinCRIStine',
    drugA: {
      name: 'Vinblastine',
      tallMan: 'vinBLAStine',
      indication: 'علاج كيميائي لأورام الغدد اللمفاوية (سمية نقي العظام)',
      route: 'تسريب وريدي بطيء فقط'
    },
    drugB: {
      name: 'Vincristine',
      tallMan: 'vinCRIStine',
      indication: 'علاج كيميائي لابيضاض الدم (سمية عصبية محيطية حادة)',
      route: 'تسريب وريدي بطيء فقط — قاتل لو أعطي داخل القناة الشوكية'
    },
    ismpRiskCategory: 'علاج كيميائي عالي الخطورة — الخطأ في الجرعة أو المسار مميت',
    mitigationStrategy: 'التسليم في أكياس صغيرة حصراً مع تحذير بارز، وحظر الحقن في القناة الشوكية نهائياً.'
  }
];

// ============================================================================
// MOCK EMERGENCY EXCEPTIONS / OVERRIDE WORKLIST (P03)
// ADC Overrides & Retrospective Pharmacist Review
// ============================================================================
export const INITIAL_EMERGENCY_EXCEPTIONS: EmergencyExceptionRecord[] = [
  {
    id: 'EMG-2026-001',
    exceptionReference: 'EMG-OVR-901',
    patientId: 'p3',
    patientName: 'محمد سالم الدوسري',
    mrn: 'MRN-88423',
    encounterId: 'ENC-2026-106',
    wardLocation: 'العناية القلبية المركزة CCU - سرير 02',
    medicationCode: 'MED-EPI-1MG',
    brandName: 'أدرينالين (Adrenaline)',
    genericName: 'EPINEPHrine 1 mg/mL Ampoule',
    dose: '1 mg IV STAT',
    route: 'حقن وريدي سريع IV Push',
    emergencyReason: 'توقف القلب المفاجئ (Cardiac Arrest - Asystole) أثناء مناورة إنعاش CCU',
    overrideType: 'adc_override_emergency',
    initiatingActor: 'د. طارق المنشاوي (طبيب العناية المركزة) + ممرض CCU: أنس الحربي',
    initiatedAt: 'منذ 45 دقيقة',
    retrospectiveStatus: 'pending_retrospective_review',
    accessSupplyLogged: true,
    administrationLoggedStatus: 'documented_in_emar',
    reviewNotes: 'تم سحب الدواء من خزانة التوزيع الآلي ADC بحالة تجاوز طارئ (Override Mode). مطلوب المراجعة الصيدلانية اللاحقة لمطابقة بروتوكول ACLS وسجل التمريض.'
  },
  {
    id: 'EMG-2026-002',
    exceptionReference: 'EMG-OVR-902',
    patientId: 'p7',
    patientName: 'ياسر فهد المطيري',
    mrn: 'MRN-88427',
    encounterId: 'ENC-2026-110',
    wardLocation: 'طوارئ الحوادث - سرير الملاحظة 07',
    medicationCode: 'MED-NALOX-0.4',
    brandName: 'ناركان (Narcan)',
    genericName: 'Naloxone HCl 0.4 mg/mL',
    dose: '0.4 mg IV STAT',
    route: 'حقن وريدي IV Push',
    emergencyReason: 'هبوط تنفسي حاد واشتباه سمية أفيونية في غرفة الإنعاش',
    overrideType: 'resuscitation_code_kit',
    initiatingActor: 'د. طلال السديري (أخصائي الطوارئ)',
    initiatedAt: 'منذ ساعتين',
    retrospectiveStatus: 'retrospectively_approved',
    retrospectiveReviewer: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
    reviewedAt: 'منذ 30 دقيقة',
    reviewNotes: 'تمت المراجعة الصيدلانية اللاحقة؛ الجرعة والداعي الإسعافي مطابقان تماماً لسياسة الإنعاش، وتأكد توثيق الإعطاء في eMAR للمريض.',
    accessSupplyLogged: true,
    administrationLoggedStatus: 'documented_in_emar'
  },
  {
    id: 'EMG-2026-003',
    exceptionReference: 'EMG-OVR-903',
    patientId: 'p2',
    patientName: 'عبد الله بن فيصل الزهراني',
    mrn: 'MRN-88422',
    encounterId: 'ENC-2026-105',
    wardLocation: 'جناح الجراحة 2B - سرير 04',
    medicationCode: 'MED-ATROP-0.5',
    brandName: 'أتروبين (Atropine Sulfate)',
    genericName: 'Atropine Sulfate 0.5 mg/mL Ampoule',
    dose: '0.5 mg IV STAT',
    route: 'حقن وريدي سريع IV',
    emergencyReason: 'تباطؤ قلبي حاد مع هبوط ضغط (Symptomatic Bradycardia HR 32 bpm)',
    overrideType: 'adc_override_emergency',
    initiatingActor: 'د. فهد المريسي (مقيم جراحة)',
    initiatedAt: 'منذ 3 ساعات',
    retrospectiveStatus: 'clarification_required',
    retrospectiveReviewer: 'د. سامي الجوهر (صيدلي أول)',
    reviewedAt: 'منذ ساعة',
    reviewNotes: 'تم سحب أمبولتين ولكن التوثيق في سجل التمريض يشير إلى إعطاء أمبولة واحدة فقط (0.5 مجم). يتطلب التحقق من إتلاف أو إعادة الأمبولة المتبقية وتوثيق التباين.',
    accessSupplyLogged: true,
    administrationLoggedStatus: 'documented_in_emar',
    varianceReportFiled: true
  }
];

// ============================================================================
// MOCK PHARMACY RECEIVING & STOCK CONTEXT (P14)
// Minimum Pharmacy-Facing Receiving Workflow
// ============================================================================
export const INITIAL_RECEIVING_RECORDS: PharmacyReceivingRecord[] = [
  {
    id: 'RCV-2026-081',
    receiptReference: 'RCV-PO-9921',
    poReference: 'PO-NUPCO-2026-778',
    supplierName: 'الشركة الوطنية للشراء الموحد (نوبكو NUPCO) - مستودع الرياض المركزي',
    medicationProduct: {
      brandName: 'تافانيك (Tavanic)',
      genericName: 'Levofloxacin 750mg/150mL Infusion Bag',
      strength: '750 mg / 150 mL',
      dosageForm: 'أكياس تسريب وريدي معقمة',
      isTallMan: false
    },
    quantityReceived: 500,
    packageUnit: 'Infusion Bags',
    lotNumber: 'LT-LV-2026-88',
    expiryDate: '2028-08-31',
    storageCondition: 'درجة حرارة الغرفة الخاضعة للمراقبة (15-25°م) محمي من الضوء',
    receivingLocation: 'رصيف استلام الصيدلية المركزية - منطقة التفتيش الأولي',
    receivedAt: 'اليوم 08:30 ص',
    receivingActor: 'فني صيدلة: ريان المالكي',
    inspectionStatus: 'accepted',
    acceptedQuantity: 500,
    quarantinedQuantity: 0,
    rejectedQuantity: 0,
    inspectionNotes: 'الحاويات الخارجية سليمة، أجهزة مراقبة الحرارة (TempTale) تؤكد عدم تجاوز حدود درجات الحرارة أثناء النقل، مطابقة لشهادة التحليل COA.',
    dispositionAction: 'نقل للمخزون الفعال - صيدلية التنويم المركزية رف D2',
    stockQuantities: {
      physical: 500,
      availableForDispense: 450,
      reserved: 50,
      quarantined: 0,
      expired: 0
    }
  },
  {
    id: 'RCV-2026-082',
    receiptReference: 'RCV-PO-9922',
    poReference: 'PO-LOC-2026-114',
    supplierName: 'سبيماكو الدوائية (SPIMACO Addwaeih) - الموزع المحلي المباشر',
    medicationProduct: {
      brandName: 'فانكوسين (Vancocin)',
      genericName: 'Vancomycin HCl 1g Lyophilized Vial',
      strength: '1 g / Vial',
      dosageForm: 'فيالات مجففة للحقن الوريدي',
      isTallMan: false
    },
    quantityReceived: 300,
    packageUnit: 'Vials',
    lotNumber: 'LT-VN-2026-04',
    expiryDate: '2027-11-30',
    storageCondition: 'ثلاجة الصيدلية (2-8°م)',
    receivingLocation: 'منطقة استلام الأدوية المبردة (Cold Chain Dock)',
    receivedAt: 'اليوم 10:15 ص',
    receivingActor: 'فني صيدلة: ماجد الشريف',
    inspectionStatus: 'pending_inspection',
    acceptedQuantity: 0,
    quarantinedQuantity: 300,
    rejectedQuantity: 0,
    inspectionNotes: 'تم الاستلام الفيزيائي؛ بانتظار استكمال قراءة مسجل الحرارة الإلكتروني المرفق بالشحنة للتأكد من استمرارية سلسلة التبريد قبل القبول.',
    dispositionAction: 'حجر مؤقت في ثلاجة الحجر والاستلام (Quarantine Cold Room) - غير متاح للصرف',
    stockQuantities: {
      physical: 300,
      availableForDispense: 0,
      reserved: 0,
      quarantined: 300,
      expired: 0
    }
  },
  {
    id: 'RCV-2026-083',
    receiptReference: 'RCV-PO-9923',
    poReference: 'PO-IMP-2026-552',
    supplierName: 'الوكيل الإقليمي للأدوية التخصصية - شحنة عاجلة',
    medicationProduct: {
      brandName: 'دوبوتامين (Dobutrex)',
      genericName: 'DOBUTamine 250mg/20mL Vial',
      strength: '250 mg / 20 mL',
      dosageForm: 'أمبولات حقن وريدي مركزة',
      isTallMan: true,
      tallManName: 'DOBUTamine'
    },
    quantityReceived: 100,
    packageUnit: 'Vials',
    lotNumber: 'LT-DOB-2026-91',
    expiryDate: '2026-05-31',
    storageCondition: 'حرارة الغرفة (15-25°م)',
    receivingLocation: 'صيدلية العناية المركزة - منطقة استلام الطوارئ',
    receivedAt: 'أمس 16:40',
    receivingActor: 'د. سامي الجوهر',
    inspectionStatus: 'quarantined',
    acceptedQuantity: 80,
    quarantinedQuantity: 20,
    rejectedQuantity: 0,
    inspectionNotes: 'صندوق واحد (20 فيال) تعرض لتهتك كرتوني أثناء الشحن الخارجي؛ تم قبول 80 فيال سليمة وحجر 20 فيال لفحص العبوة الداخلية والكسور الشعرية.',
    dispositionAction: 'حجر للتقييم الفني الداخلي والتواصل مع المورد لاستبدال الوحدات المتضررة',
    stockQuantities: {
      physical: 100,
      availableForDispense: 80,
      reserved: 0,
      quarantined: 20,
      expired: 0
    }
  },
  {
    id: 'RCV-2026-084',
    receiptReference: 'RCV-PO-9924',
    poReference: 'PO-COLD-2026-301',
    supplierName: 'مستودع المصل واللقاحات الوطني - سلسلة التبريد المباشرة',
    medicationProduct: {
      brandName: 'إنسولين غلارجين (Lantus)',
      genericName: 'Insulin Glargine 100 Units/mL SoloStar',
      strength: '100 Units / mL (3 mL)',
      dosageForm: 'أقلام حقن مسبقة التعبئة',
      isTallMan: false
    },
    quantityReceived: 200,
    packageUnit: 'Packs (5 Pens)',
    lotNumber: 'LT-INS-2026-11',
    expiryDate: '2027-09-30',
    storageCondition: 'سلسلة تبريد مشددة (2-8°م) مستمرة دون انقطاع',
    receivingLocation: 'رصيف استلام الأدوية المبردة والحيوية (Cold Chain Gate)',
    receivedAt: 'اليوم 11:45 ص',
    receivingActor: 'فني صيدلة: ماجد الشريف',
    inspectionStatus: 'quarantined',
    acceptedQuantity: 0,
    quarantinedQuantity: 200,
    rejectedQuantity: 0,
    inspectionNotes: 'تنبيه اختراق سلسلة التبريد: مسجل الحرارة الرقمي (Data Logger) كشف عن ارتفاع درجة الحرارة إلى +14.8°م لمدة 3 ساعات أثناء النقل. محجور بالكامل للتحقق الفني ويمنع إتاحته للصرف.',
    dispositionAction: 'حجر فني إلزامي في غرفة التبريد التحفظية - تواصل فوري مع المورد لتقرير الإتلاف أو التعويض',
    stockQuantities: {
      physical: 200,
      availableForDispense: 0,
      reserved: 0,
      quarantined: 200,
      expired: 0
    }
  }
];

// ============================================================================
// MOCK MEDICATION RECALL WORKFLOW (P16)
// Multi-Jurisdiction: SFDA & FDA Profiles, Location-Level Quarantine & Traceability
// ============================================================================
export const INITIAL_MEDICATION_RECALLS: MedicationRecallRecord[] = [
  {
    id: 'RCL-2026-014',
    recallReference: 'SFDA-RCL-2026-014 (Defect Class 1)',
    regulatoryAuthority: 'الهيئة العامة للغذاء والدواء (Saudi SFDA)',
    countryProfile: 'المملكة العربية السعودية (SFDA Profile)',
    sourceClassification: 'Class 1 (Urgent Defect - Life Threatening)',
    classificationStatus: 'determined',
    originalClassificationCode: 'SFDA-DEF-L1',
    localOperationalPriority: 'critical_emergency',
    recallClass: 'Class I (High Risk)',
    affectedMedication: 'Heparin Sodium Injection (5,000 Units/mL, 5 mL Vial)',
    affectedBrand: 'هيبارين الصوديوم (Heparin Sodium)',
    lotNumber: 'LT-HEP-412',
    manufacturer: 'الشركة المصنعة للأدوية البيولوجية العالمية',
    recallReason: 'إشعار عاجل من الهيئة العامة للغذاء والدواء SFDA: اشتباه وجود شوائب جسيمية مجهرية (Subvisible Particulate Matter) في التشغيلة المحددة قد تسبب انسداداً وعائياً.',
    recallStatus: 'active_quarantine_in_progress',
    notificationDate: '2026-09-18 14:00',
    actionOwner: 'د. ليلى عبد الحميد (مسؤولة سلامة الدواء وإدارة السحب)',
    affectedLocations: [
      {
        locationName: 'صيدلية التنويم المركزية (Central Inpatient)',
        locationType: 'pharmacy_stock',
        initialStockCount: 45,
        quarantinedCount: 45,
        quarantineStatus: 'completed'
      },
      {
        locationName: 'صيدلية العناية المركزة (ICU Satellite)',
        locationType: 'pharmacy_stock',
        initialStockCount: 20,
        quarantinedCount: 20,
        quarantineStatus: 'completed'
      },
      {
        locationName: 'جناح الباطنة 4A - عهدة الجناح (Ward Stock)',
        locationType: 'ward_stock',
        initialStockCount: 10,
        quarantinedCount: 10,
        quarantineStatus: 'completed'
      },
      {
        locationName: 'خزانة التوزيع الآلي ADC - قسم الطوارئ (Emergency ADC Unit)',
        locationType: 'adc_stock',
        initialStockCount: 8,
        quarantinedCount: 8,
        quarantineStatus: 'completed'
      },
      {
        locationName: 'صيدلية العمليات الجراحية (OR Satellite - Surgical Pharmacy)',
        locationType: 'pharmacy_stock',
        initialStockCount: 15,
        quarantinedCount: 0,
        quarantineStatus: 'unresolved'
      },
      {
        locationName: 'شحنة توريد داخلية قيد النقل (Internal Transit to Satellite)',
        locationType: 'in_transit_stock',
        initialStockCount: 5,
        quarantinedCount: 0,
        quarantineStatus: 'pending_quarantine'
      }
    ],
    outstandingLocationsCount: 2,
    traceabilityStatus: 'بيانات التعرض الخاصة بالمرضى الفرديين: غير متوفرة / تتطلب ربط نظام التتبع الدوائي وسجل الإعطاء الإلكتروني (Traceability integration required)'
  },
  {
    id: 'RCL-2026-015',
    recallReference: 'SFDA-RCL-2026-009 (Defect Class 2)',
    regulatoryAuthority: 'الهيئة العامة للغذاء والدواء (Saudi SFDA)',
    countryProfile: 'المملكة العربية السعودية (SFDA Profile)',
    sourceClassification: 'Class 2 (Moderate Defect)',
    classificationStatus: 'determined',
    originalClassificationCode: 'SFDA-DEF-L2',
    localOperationalPriority: 'high_priority',
    recallClass: 'Class II (Moderate)',
    affectedMedication: 'Ceftriaxone Sodium 1g Vial for Injection',
    affectedBrand: 'روسيفين (Rocephin)',
    lotNumber: 'LT-ROC-993',
    manufacturer: 'روش فارماسيوتيكالز',
    recallReason: 'خلل في طباعة ملصق الكرتون الخارجي لا يؤثر على مأمونية المادة الفعالة أو العقامة.',
    recallStatus: 'quarantine_complete',
    notificationDate: '2026-09-10 09:00',
    actionOwner: 'د. سامي الجوهر (مدير التموين الدوائي)',
    affectedLocations: [
      {
        locationName: 'صيدلية الطوارئ المركزية (Emergency Pharmacy)',
        locationType: 'pharmacy_stock',
        initialStockCount: 120,
        quarantinedCount: 120,
        quarantineStatus: 'completed'
      },
      {
        locationName: 'مستودع الأدوية الرئيسي (Central Warehouse)',
        locationType: 'pharmacy_stock',
        initialStockCount: 600,
        quarantinedCount: 600,
        quarantineStatus: 'completed'
      }
    ],
    outstandingLocationsCount: 0,
    traceabilityStatus: 'تم حجر كامل المخزون الفيزيائي بنجاح؛ لا توجد حالات تعرض حادة تتطلب استدعاء سريرياً.'
  },
  {
    id: 'RCL-2026-016',
    recallReference: 'FDA-RCL-2026-908 (Enforcement Report Profile)',
    regulatoryAuthority: 'US Food and Drug Administration (FDA)',
    countryProfile: 'United States (FDA Profile)',
    sourceClassification: 'Not Yet Classified',
    classificationStatus: 'not_yet_classified',
    originalClassificationCode: 'FDA-NYC-2026-PENDING',
    localOperationalPriority: 'high_priority',
    recallClass: 'Class II (Moderate)',
    affectedMedication: 'Methotrexate 2.5mg Oral Tablets (Lot: MTX-2026-09)',
    affectedBrand: 'تريكسان (Trexan)',
    lotNumber: 'LT-MTX-2026-09',
    manufacturer: 'Pfizer Inc. / Global Injectables',
    recallReason: 'إشعار سحب صادر عن US FDA: قيد التقييم المخبري للشوائب المحتملة (Pending Classification). الأولوية التشغيلية تظل مرتفعة احترازياً لحين صدور التقرير النهائي ولا تعتبر منخفضة المخاطر.',
    recallStatus: 'active_quarantine_in_progress',
    notificationDate: '2026-09-19 07:30',
    actionOwner: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
    affectedLocations: [
      {
        locationName: 'صيدلية العيادات الخارجية (Ambulatory Pharmacy)',
        locationType: 'pharmacy_stock',
        initialStockCount: 80,
        quarantinedCount: 80,
        quarantineStatus: 'completed'
      },
      {
        locationName: 'جناح الروماتيزم والمناعة 2C - عهدة الجناح',
        locationType: 'ward_stock',
        initialStockCount: 25,
        quarantinedCount: 0,
        quarantineStatus: 'unresolved'
      }
    ],
    outstandingLocationsCount: 1,
    traceabilityStatus: 'حالة تقييم التعرض: التصنيف قيد التقييم من الهيئة الأمريكية (Not Yet Classified)؛ جرى حجر الصيدلية احترازياً مع إبقاء الأولوية التشغيلية مرتفعة.'
  }
];

// ============================================================================
// MOCK PHARMACY ORGANIZATIONAL CONTEXT (P26 & P27)
// Multi-branch, multi-department, multi-role switching (Simulated Context)
// ============================================================================
export const INITIAL_PHARMACY_ORG_CONTEXT: PharmacyOrgContext = {
  hospitalName: 'مستشفى الملك فهد التخصصي (KFSH)',
  branchName: 'الفرع الرئيسي - المدينة الطبية بالرياض',
  departmentName: 'إدارة الخدمات الصيدلانية والرعاية الصيدلية',
  activePharmacyLocation: 'صيدلية التنويم المركزية (Central Inpatient Pharmacy)',
  activePharmacyLocationId: 'loc-central-inpatient',
  activePharmacyLocationName: 'صيدلية التنويم المركزية (Central Inpatient Pharmacy)',
  availableLocations: [
    { id: 'loc-central-inpatient', name: 'صيدلية التنويم المركزية', type: 'Central Inpatient' },
    { id: 'loc-icu-satellite', name: 'صيدلية العناية المركزة CCU/ICU', type: 'ICU Satellite' },
    { id: 'loc-cleanroom', name: 'وحدة التحضير المعقم الوريدي IV Cleanroom', type: 'IV Admixture Hood' },
    { id: 'loc-opd-pharmacy', name: 'صيدلية العيادات الخارجية', type: 'Outpatient Clinic' },
    { id: 'loc-emergency', name: 'صيدلية الطوارئ والاستقبال الإسعافي', type: 'Emergency' }
  ],
  availableBranches: [
    { id: 'br-main', name: 'الفرع الرئيسي - المدينة الطبية بالرياض', isMainBranch: true },
    { id: 'br-west', name: 'فرع غرب الرياض التخصصي', isMainBranch: false },
    { id: 'br-jeddah', name: 'فرع مدينة الملك عبد الله الطبية - جدة', isMainBranch: false }
  ],
  availableDepartments: [
    { id: 'dept-inpatient', name: 'إدارة الخدمات الصيدلانية والرعاية الصيدلية' },
    { id: 'dept-ambulatory', name: 'صيدليات الرعاية التخصصية والعيادات الخارجية' },
    { id: 'dept-sterile', name: 'شعبة التحضير المعقم والتغذية الوريدية TPN' }
  ],
  activeBranchId: 'br-main',
  activeDepartmentId: 'dept-inpatient',
  currentStaffName: 'د. ليلى عبد الحميد',
  currentStaffRole: 'صيدلي إكلينيكي (Clinical Pharmacist)',
  staffName: 'د. ليلى عبد الحميد',
  staffRole: 'clinical_pharmacist',
  actingAssignment: 'صيدلي إكلينيكي مناوب - تغطية أجنحة الباطنة والجراحة والعنايات',
  isSimulatedData: true
};
