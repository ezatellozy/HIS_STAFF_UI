// ============================================================================
// CSSD & STERILE PROCESSING OPERATIONS MOCK DATA
// Realistic high-fidelity fixtures for all 9 workspaces, equipment, sets,
// contaminated returns, washer cycles, packages, sterilizer loads, distribution
// ============================================================================

import {
  CSSDOpsState,
  InstrumentSetDefinition,
  CSSDReusableSetInstance,
  ContaminatedReturnRecord,
  WasherDisinfectorCycleRecord,
  CSSDPackageRecord,
  SterilizerCycleRecord,
  SterileDistributionRequest,
  CSSDEquipmentReference,
  CSSDQualityException,
  CSSDRecallCase
} from '../types/cssdOps';

export const MOCK_INSTRUMENT_SET_DEFINITIONS: InstrumentSetDefinition[] = [
  {
    id: 'SET-DEF-CABG-01',
    code: 'SET-CABG-CORE',
    nameAr: 'طقم جراحة القلب والصدر والشرايين التاجية (CABG Core Set)',
    nameEn: 'Cardiovascular Open Heart CABG Instrument Set',
    serviceCategory: 'جراحة القلب والصدر (OR-1)',
    version: 'v3.2',
    spauldingClass: 'critical',
    compatibleProcessMethod: 'steam_sterilization',
    compatiblePackaging: 'rigid_container_with_filter',
    isImplantRelated: true,
    totalInstrumentCount: 48,
    isIfuAvailable: true,
    manufacturerIfuRef: 'IFU-AESCULAP-CABG-REV8',
    components: [
      { componentId: 'INST-CABG-01', componentNameAr: 'مباعد القص الصدري فينوشيتو (Finochietto Retractor)', componentNameEn: 'Finochietto Sternal Retractor', requiredQuantity: 1, isOptional: false },
      { componentId: 'INST-CABG-02', componentNameAr: 'مقص شريان تاجي بوتس فوتس (Potts-Smith Scissors 45°)', componentNameEn: 'Potts-Smith Micro Scissors 45°', requiredQuantity: 2, isOptional: false },
      { componentId: 'INST-CABG-03', componentNameAr: 'حامل إبر جراحة دقيقة كاستروفيجو (Castroviejo Needle Holder)', componentNameEn: 'Castroviejo Micro Needle Holder', requiredQuantity: 2, isOptional: false },
      { componentId: 'INST-CABG-04', componentNameAr: 'ملقط أنسجة ديبيكي جراحي (DeBakey Atraumatic Forceps 2.0mm)', componentNameEn: 'DeBakey Forceps 2.0mm', requiredQuantity: 4, isOptional: false },
      { componentId: 'INST-CABG-05', componentNameAr: 'ملاقط أوعية دموية بولدوج (Glover Bulldog Vascular Clamps)', componentNameEn: 'Bulldog Clamps', requiredQuantity: 6, isOptional: false, eligibleSubstitutes: ['INST-CABG-SUB-01'] }
    ]
  },
  {
    id: 'SET-DEF-ORTHO-TKR',
    code: 'SET-TKR-BASIC',
    nameAr: 'طقم استبدال مفصل الركبة الأساسي (Total Knee Arthroplasty Set)',
    nameEn: 'Total Knee Replacement Basic Instrument Tray',
    serviceCategory: 'جراحة العظام والمفاصل (OR-2)',
    version: 'v4.0',
    spauldingClass: 'critical',
    compatibleProcessMethod: 'steam_sterilization',
    compatiblePackaging: 'rigid_container_with_filter',
    isImplantRelated: true,
    totalInstrumentCount: 36,
    isIfuAvailable: true,
    manufacturerIfuRef: 'IFU-ZIMMER-TKR-V5',
    components: [
      { componentId: 'INST-TKR-01', componentNameAr: 'مباعد هومان العظمي العريض (Hohmann Retractor Broad)', componentNameEn: 'Hohmann Retractor Broad', requiredQuantity: 3, isOptional: false },
      { componentId: 'INST-TKR-02', componentNameAr: 'أزميل عظمي ستيلي متدرج (Stille Osteotome 15mm)', componentNameEn: 'Stille Osteotome 15mm', requiredQuantity: 2, isOptional: false },
      { componentId: 'INST-TKR-03', componentNameAr: 'مطرقة عظام ثقيلة من الفولاذ (Mallet 500g Surgical)', componentNameEn: 'Surgical Mallet 500g', requiredQuantity: 1, isOptional: false },
      { componentId: 'INST-TKR-04', componentNameAr: 'ملقط ليرول قوي لقضم العظام (Luer-Stille Bone Rongeur)', componentNameEn: 'Luer-Stille Bone Rongeur', requiredQuantity: 1, isOptional: false }
    ]
  },
  {
    id: 'SET-DEF-LAP-GEN',
    code: 'SET-LAP-BASIC',
    nameAr: 'طقم جراحة المناظير المتقدمة للبطن (Advanced Laparoscopy Set)',
    nameEn: 'Advanced Laparoscopic Surgical Instrument Set',
    serviceCategory: 'جراحة المناظير العامة (OR-3)',
    version: 'v2.8',
    spauldingClass: 'critical',
    compatibleProcessMethod: 'steam_sterilization',
    compatiblePackaging: 'double_wrap_nonwoven',
    isImplantRelated: false,
    totalInstrumentCount: 22,
    isIfuAvailable: true,
    manufacturerIfuRef: 'IFU-STORZ-LAP-2025',
    components: [
      { componentId: 'INST-LAP-01', componentNameAr: 'منظار بصري 10 ملم زاوية 30° (Hopkins Laparoscope 10mm 30°)', componentNameEn: 'Hopkins Laparoscope 10mm 30°', requiredQuantity: 1, isOptional: false },
      { componentId: 'INST-LAP-02', componentNameAr: 'ملقط ماري لاند للتشريح المنظاري (Maryland Dissector 5mm)', componentNameEn: 'Maryland Laparoscopic Dissector 5mm', requiredQuantity: 2, isOptional: false },
      { componentId: 'INST-LAP-03', componentNameAr: 'مقص ميتزنباوم للمناظير (Metzenbaum Laparoscopic Scissors 5mm)', componentNameEn: 'Metzenbaum Scissors 5mm', requiredQuantity: 1, isOptional: false },
      { componentId: 'INST-LAP-04', componentNameAr: 'إبرة فيريس لإحداث استرواح البطن (Veress Needle 120mm)', componentNameEn: 'Veress Needle 120mm', requiredQuantity: 1, isOptional: false }
    ]
  },
  {
    id: 'SET-DEF-VHP-OPHTHALMIC',
    code: 'SET-EYE-MICRO',
    nameAr: 'طقم جراحة العيون الدقيقة بالبلازما (Ophthalmic Micro Set - VHP Low Temp)',
    nameEn: 'Ophthalmic Micro Surgical Set (Low-Temp VHP)',
    serviceCategory: 'جراحة العيون والليزر',
    version: 'v1.5',
    spauldingClass: 'critical',
    compatibleProcessMethod: 'low_temp_vhp_sterilization',
    compatiblePackaging: 'tyvek_pouch_vhp',
    isImplantRelated: false,
    totalInstrumentCount: 14,
    isIfuAvailable: true,
    manufacturerIfuRef: 'IFU-ALCON-EYE-MICRO',
    components: [
      { componentId: 'INST-EYE-01', componentNameAr: 'مقص فينوس المجهري للقزحية (Vannas Micro Scissors)', componentNameEn: 'Vannas Micro Scissors', requiredQuantity: 1, isOptional: false },
      { componentId: 'INST-EYE-02', componentNameAr: 'ملقط ميكرو تيينغ دقيق (Tying Micro Forceps)', componentNameEn: 'Tying Micro Forceps', requiredQuantity: 2, isOptional: false }
    ]
  },
  {
    id: 'SET-DEF-NO-IFU-DEVICE',
    code: 'SET-LEGACY-UNVERIFIED',
    nameAr: 'أداة تخصصية قديمة بدون كتيب إرشادات الشركة الصانعة (Unverified Legacy Device)',
    nameEn: 'Legacy Specialty Device Without IFU',
    serviceCategory: 'العيادات التخصصية',
    version: 'v1.0',
    spauldingClass: 'semicritical',
    compatibleProcessMethod: 'processing_profile_not_verified',
    compatiblePackaging: 'incompatible_profile',
    isImplantRelated: false,
    totalInstrumentCount: 1,
    isIfuAvailable: false, // Explicit fixture for missing IFU testing
    components: [
      { componentId: 'INST-LEGACY-01', componentNameAr: 'أداة قديمة مجهولة الشركة المصنعة', componentNameEn: 'Legacy Unverified Tool', requiredQuantity: 1, isOptional: false }
    ]
  }
];

export const MOCK_EQUIPMENT_LIST: CSSDEquipmentReference[] = [
  {
    id: 'EQ-AUTOCLAVE-01',
    nameAr: 'معقم البخار الجراحي المركزي رقم 1 (Pre-Vac Steam Autoclave 1)',
    nameEn: 'Central Pre-Vacuum Steam Sterilizer #1',
    category: 'autoclave_steam',
    sterilizerType: 'prevacuum_steam',
    operationalStatus: 'operational_validated',
    validationExpiryDate: '2026-12-31',
    lastBiomedCheck: '2026-09-01',
    airRemovalTestRequired: true,
    bowieDickStatusToday: 'passed',
    locationZone: 'sterilization_processing'
  },
  {
    id: 'EQ-AUTOCLAVE-02',
    nameAr: 'معقم البخار الجراحي المركزي رقم 2 (Pre-Vac Steam Autoclave 2)',
    nameEn: 'Central Pre-Vacuum Steam Sterilizer #2',
    category: 'autoclave_steam',
    sterilizerType: 'prevacuum_steam',
    operationalStatus: 'operational_validated',
    validationExpiryDate: '2026-11-15',
    lastBiomedCheck: '2026-08-20',
    airRemovalTestRequired: true,
    bowieDickStatusToday: 'passed',
    locationZone: 'sterilization_processing'
  },
  {
    id: 'EQ-AUTOCLAVE-BD-FAIL',
    nameAr: 'معقم البخار المفرغ رقم 3 (Bowie-Dick Test Failed)',
    nameEn: 'Pre-Vac Steam Autoclave #3 (Failed Air Removal)',
    category: 'autoclave_steam',
    sterilizerType: 'prevacuum_steam',
    operationalStatus: 'operational_validated',
    validationExpiryDate: '2026-12-31',
    lastBiomedCheck: '2026-09-15',
    airRemovalTestRequired: true,
    bowieDickStatusToday: 'failed', // Failed Bowie-Dick fixture
    locationZone: 'sterilization_processing'
  },
  {
    id: 'EQ-VHP-STER-01',
    nameAr: 'معقم البلازما المنخفض الحرارة VHP (Vaporized Hydrogen Peroxide)',
    nameEn: 'Low-Temperature VHP Plasma Sterilizer',
    category: 'vhp_sterilizer',
    sterilizerType: 'vhp_plasma',
    operationalStatus: 'operational_validated',
    validationExpiryDate: '2026-10-30',
    lastBiomedCheck: '2026-09-10',
    airRemovalTestRequired: false, // Bowie-Dick not applicable for VHP
    bowieDickStatusToday: 'not_applicable',
    locationZone: 'sterilization_processing'
  },
  {
    id: 'EQ-WASHER-01',
    nameAr: 'جهاز الغسيل والتطهير الآلي المزدوج (ISO 15883-2 Surgical Pass-Through 1)',
    nameEn: 'Automatic Washer-Disinfector Pass-Through #1 (ISO 15883-2)',
    category: 'washer_disinfector',
    operationalStatus: 'operational_validated',
    validationExpiryDate: '2026-12-01',
    lastBiomedCheck: '2026-09-05',
    airRemovalTestRequired: false,
    bowieDickStatusToday: 'not_applicable',
    locationZone: 'dirty_decontamination'
  },
  {
    id: 'EQ-WASHER-02',
    nameAr: 'جهاز الغسيل والتطهير رقم 2 (Under Biomed Repair)',
    nameEn: 'Automatic Washer-Disinfector #2',
    category: 'washer_disinfector',
    operationalStatus: 'under_maintenance',
    validationExpiryDate: '2026-08-15',
    lastBiomedCheck: '2026-09-22',
    airRemovalTestRequired: false,
    bowieDickStatusToday: 'not_applicable',
    locationZone: 'dirty_decontamination'
  }
];

export const MOCK_SET_INSTANCES: CSSDReusableSetInstance[] = [
  {
    id: 'SET-INST-701',
    setDefinitionId: 'SET-DEF-CABG-01',
    setNameAr: 'طقم جراحة القلب والصدر رقم (1) - حاوية معدنية معتمدة',
    setNameEn: 'CABG Open Heart Core Set Tray #1',
    serialNumber: 'SN-CABG-701',
    currentZoningArea: 'sterile_storage_distribution',
    pointOfUseStatus: 'at_cssd',
    decontaminationStatus: 'cleaning_passed',
    inspectionStatus: 'inspection_passed',
    assemblyStatus: 'set_complete',
    packagingStatus: 'released_sterile',
    currentPackageId: 'PKG-2026-8801',
    lastSterilizerCycleId: 'STER-2026-CYC-401',
    missingComponentsList: [],
    damagedComponentsList: [],
    substitutedComponentsList: []
  },
  {
    id: 'SET-INST-702',
    setDefinitionId: 'SET-DEF-ORTHO-TKR',
    setNameAr: 'طقم استبدال الركبة الأساسي رقم (2)',
    setNameEn: 'TKR Basic Knee Set Tray #2',
    serialNumber: 'SN-TKR-702',
    currentZoningArea: 'sterilization_processing',
    pointOfUseStatus: 'at_cssd',
    decontaminationStatus: 'cleaning_passed',
    inspectionStatus: 'inspection_passed',
    assemblyStatus: 'set_complete',
    packagingStatus: 'in_sterilization_load',
    currentPackageId: 'PKG-2026-8802',
    lastSterilizerCycleId: 'STER-2026-CYC-402',
    missingComponentsList: [],
    damagedComponentsList: [],
    substitutedComponentsList: []
  },
  {
    id: 'SET-INST-703',
    setDefinitionId: 'SET-DEF-LAP-GEN',
    setNameAr: 'طقم مناظير البطن المتقدمة رقم (3)',
    setNameEn: 'Laparoscopic Surgical Set #3',
    serialNumber: 'SN-LAP-703',
    currentZoningArea: 'dirty_decontamination',
    pointOfUseStatus: 'at_cssd',
    decontaminationStatus: 'pending_precleaning',
    inspectionStatus: 'pending_inspection',
    assemblyStatus: 'pending_assembly',
    packagingStatus: 'not_packaged',
    missingComponentsList: [],
    damagedComponentsList: [],
    substitutedComponentsList: []
  },
  {
    id: 'SET-INST-704',
    setDefinitionId: 'SET-DEF-ORTHO-TKR',
    setNameAr: 'طقم جراحة العظام رقم (4) - طقم غير مكتمل به نقص',
    setNameEn: 'Ortho Knee Tray #4 (Incomplete)',
    serialNumber: 'SN-TKR-704',
    currentZoningArea: 'clean_inspection_assembly',
    pointOfUseStatus: 'at_cssd',
    decontaminationStatus: 'cleaning_passed',
    inspectionStatus: 'inspection_passed',
    assemblyStatus: 'set_incomplete_missing_parts',
    packagingStatus: 'not_packaged',
    missingComponentsList: ['أزميل عظمي ستيلي متدرج (Stille Osteotome 15mm)'],
    damagedComponentsList: [],
    substitutedComponentsList: []
  },
  {
    id: 'SET-INST-705',
    setDefinitionId: 'SET-DEF-VHP-OPHTHALMIC',
    setNameAr: 'طقم جراحة العيون الدقيقة بالبلازما (Ophthalmic Eye Micro)',
    setNameEn: 'Ophthalmic Micro Set Tyvek',
    serialNumber: 'SN-EYE-705',
    currentZoningArea: 'packaging_preparation',
    pointOfUseStatus: 'at_cssd',
    decontaminationStatus: 'cleaning_passed',
    inspectionStatus: 'inspection_passed',
    assemblyStatus: 'set_complete',
    packagingStatus: 'packaged_pending_load',
    currentPackageId: 'PKG-2026-8805',
    missingComponentsList: [],
    damagedComponentsList: [],
    substitutedComponentsList: []
  }
];

export const MOCK_CONTAMINATED_RETURNS: ContaminatedReturnRecord[] = [
  {
    id: 'RET-2026-001',
    returnTimestamp: '2026-09-23 08:30',
    originDepartment: 'OR-1 جراحة القلب والصدر',
    orCaseReference: 'or-case-201',
    patientMrnReference: 'MRN-77412',
    patientNameSynthetic: 'سليمان خالد العتيبي',
    setInstanceIds: ['SET-INST-701'],
    expectedCount: 48,
    returnedCount: 48,
    hasSharpsHazard: false,
    pointOfUsePretreatment: 'enzymatic_foam_applied',
    transportContainerId: 'CART-BIO-OR1-01',
    transportCondition: 'closed_biohazard_cart',
    receiptStatus: 'received_complete',
    receivingStaff: 'علي القحطاني (فني استلام التلوث)',
    exceptionNotes: 'تم تطبيق رغوة الإنزيم عند نقطة الاستخدام بالعمليات، العبوات مغلقة بإحكام'
  },
  {
    id: 'RET-2026-002',
    returnTimestamp: '2026-09-23 09:15',
    originDepartment: 'OR-2 جراحة العظام',
    orCaseReference: 'or-case-203',
    patientMrnReference: 'MRN-61209',
    patientNameSynthetic: 'منصور عبد الله الشهري',
    setInstanceIds: ['SET-INST-704'],
    expectedCount: 36,
    returnedCount: 35,
    hasSharpsHazard: false,
    pointOfUsePretreatment: 'enzymatic_foam_applied',
    transportContainerId: 'CART-BIO-OR2-02',
    transportCondition: 'closed_biohazard_cart',
    receiptStatus: 'received_with_discrepancy',
    receivingStaff: 'علي القحطاني (فني استلام التلوث)',
    exceptionNotes: 'نقص أداة واحدة (أزميل عظمي 15mm) — تم التواصل مع ممرضة العمليات للبحث عنها في المسرح',
    discrepancyDetails: {
      missingItems: ['أزميل عظمي ستيلي متدرج (Stille Osteotome 15mm)'],
      unexpectedItems: [],
      damagedItems: [],
      singleUseFound: []
    }
  },
  {
    id: 'RET-2026-003',
    returnTimestamp: '2026-09-23 09:45',
    originDepartment: 'طوارئ الجراحة والحوادث (ER)',
    orCaseReference: 'er-case-102',
    patientMrnReference: 'MRN-91045',
    patientNameSynthetic: 'زياد محمود الخولي',
    setInstanceIds: ['SET-INST-UNKNOWN-01'],
    expectedCount: 10,
    returnedCount: 10,
    hasSharpsHazard: true,
    pointOfUsePretreatment: 'dry_untreated',
    transportContainerId: 'TRAY-ER-OPEN-03',
    transportCondition: 'closed_biohazard_cart',
    receiptStatus: 'rejected_quarantine',
    receivingStaff: 'سامي الدوسري (مشرف الاستلام)',
    exceptionNotes: 'تنبيه أمان: تم العثور على مشرط جراحي ذو استخدام أحادي (Single-Use Disposable Scalpel) داخل الحاوية',
    discrepancyDetails: {
      missingItems: [],
      unexpectedItems: [],
      damagedItems: [],
      singleUseFound: ['مشرط جراحي أحادي الاستخدام مع مقبض بلاستيكي (Single-Use Blade #11)']
    }
  }
];

export const MOCK_WASHER_CYCLES: WasherDisinfectorCycleRecord[] = [
  {
    id: 'WASH-CYC-101',
    equipmentId: 'EQ-WASHER-01',
    equipmentName: 'جهاز الغسيل والتطهير الآلي المزدوج Pass-Through 1',
    applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)',
    cycleProfile: 'Surgical Instruments Thermal Disinfection A0>=3000',
    targetA0Profile: 3000,
    startTime: '2026-09-23 09:30',
    endTime: '2026-09-23 10:15',
    operatorId: 'USR-DECON-01',
    operatorName: 'خالد عبد الرحمن (فني التطهير)',
    status: 'completed_pass',
    maxTempReachedCelsius: 93.2,
    disinfectionHoldTimeSeconds: 300,
    a0CalculatedValue: 3120,
    detergentLotNumber: 'LOT-ENZY-4412',
    enzymeWashVerified: true,
    thermalDisinfectionVerified: true,
    cycleEvidencePresent: true,
    includedSetInstanceIds: ['SET-INST-701', 'SET-INST-703'],
    notes: 'الدورة استوفت الشروط والمعايير القياسية بنجاح طبقاً لـ ISO 15883-2:2024 (A0 > 3000)'
  }
];

export const MOCK_PACKAGES: CSSDPackageRecord[] = [
  {
    id: 'PKG-2026-8801',
    setInstanceId: 'SET-INST-701',
    setNameAr: 'طقم جراحة القلب والصدر رقم (1) - حاوية معدنية معتمدة',
    packagingMethod: 'rigid_container_with_filter',
    containerBarcode: 'CONT-CABG-701',
    internalIndicatorType: 'Class 5 Integrating',
    internalIndicatorVerified: true,
    externalIndicatorType: 'Class 1 Process Tape/Label',
    externalIndicatorVerified: true,
    packagedBy: 'منيرة السبيعي (أخصائية التجهيز والتعقيم)',
    packagingTimestamp: '2026-09-23 10:30',
    integrityConfirmed: true,
    compatibleProcessMethod: 'steam_sterilization',
    compatibilityStatus: 'compatible',
    currentStatus: 'released_sterile',
    loadId: 'STER-2026-CYC-401',
    storageIntegrity: 'intact_sterile',
    storageLocation: 'Zone S-Rack-A1'
  },
  {
    id: 'PKG-2026-8802',
    setInstanceId: 'SET-INST-702',
    setNameAr: 'طقم استبدال الركبة الأساسي رقم (2)',
    packagingMethod: 'rigid_container_with_filter',
    containerBarcode: 'CONT-TKR-702',
    internalIndicatorType: 'Class 5 Integrating',
    internalIndicatorVerified: true,
    externalIndicatorType: 'Class 1 Process Tape/Label',
    externalIndicatorVerified: true,
    packagedBy: 'منيرة السبيعي (أخصائية التجهيز)',
    packagingTimestamp: '2026-09-23 11:00',
    integrityConfirmed: true,
    compatibleProcessMethod: 'steam_sterilization',
    compatibilityStatus: 'compatible',
    currentStatus: 'in_sterilization_load',
    loadId: 'STER-2026-CYC-402',
    storageIntegrity: 'intact_sterile',
    storageLocation: 'معقم البخار 2'
  },
  {
    id: 'PKG-2026-8805',
    setInstanceId: 'SET-INST-705',
    setNameAr: 'طقم جراحة العيون الدقيقة بالبلازما (Ophthalmic Eye Micro)',
    packagingMethod: 'tyvek_pouch_vhp',
    containerBarcode: 'CONT-EYE-705',
    internalIndicatorType: 'Class 4 Multi-Variable',
    internalIndicatorVerified: true,
    externalIndicatorType: 'Class 1 Process Tape/Label',
    externalIndicatorVerified: true,
    packagedBy: 'سارة رضوان (فنية التغليف)',
    packagingTimestamp: '2026-09-23 11:15',
    integrityConfirmed: true,
    compatibleProcessMethod: 'low_temp_vhp_sterilization',
    compatibilityStatus: 'compatible',
    currentStatus: 'packaged_pending_load',
    storageIntegrity: 'intact_sterile'
  }
];

export const MOCK_STERILIZER_CYCLES: SterilizerCycleRecord[] = [
  {
    id: 'STER-2026-CYC-401',
    sterilizerEquipmentId: 'EQ-AUTOCLAVE-01',
    sterilizerName: 'معقم البخار الجراحي المركزي رقم 1',
    sterilizerType: 'prevacuum_steam',
    methodCategory: 'steam_sterilization',
    cycleProfileName: '134°C Pre-Vacuum 4 min Steam (ISO 17665)',
    targetTempCelsius: 134.5,
    targetPressureBar: 2.15,
    exposureTimeMinutes: 4.0,
    operatorId: 'USR-STER-01',
    operatorName: 'بندر الشمري (مشغل التعقيم)',
    startTime: '2026-09-23 10:45',
    endTime: '2026-09-23 11:35',
    cycleStatus: 'released',
    isIUSSException: false,
    hasImplantTray: true,
    mechanicalParamEvidence: {
      passed: true,
      tempGraphVerified: true,
      pressureGraphVerified: true,
      vacuumLeakRateVerified: true,
      airRemovalTestRequired: true,
      airRemovalTestPassed: true
    },
    chemicalIndicatorEvidence: {
      passed: true,
      indicatorType: 'Class 5 Integrating',
      colorChangeVerified: true,
      requiredByPolicy: true
    },
    biologicalIndicatorEvidence: {
      isRequired: true,
      biVialLot: 'BI-LOT-9014',
      biStatus: 'passed',
      biReadTimestamp: '2026-09-23 11:30',
      controlVialPositiveVerified: true,
      incubatorId: 'INC-AUTO-01',
      quarantinePendingResult: true
    },
    releaseDecision: {
      decision: 'released',
      releasedBy: 'د. طارق المنشاوي (مقيّم الإفراج السريري)',
      releaseTimestamp: '2026-09-23 11:40'
    },
    includedPackageIds: ['PKG-2026-8801']
  },
  {
    id: 'STER-2026-CYC-402',
    sterilizerEquipmentId: 'EQ-AUTOCLAVE-02',
    sterilizerName: 'معقم البخار الجراحي المركزي رقم 2',
    sterilizerType: 'prevacuum_steam',
    methodCategory: 'steam_sterilization',
    cycleProfileName: '134°C Pre-Vacuum 4 min Steam with Implants',
    targetTempCelsius: 134.4,
    targetPressureBar: 2.14,
    exposureTimeMinutes: 4.0,
    operatorId: 'USR-STER-01',
    operatorName: 'بندر الشمري',
    startTime: '2026-09-23 11:45',
    cycleStatus: 'monitoring_pending', // Waiting for BI incubation!
    isIUSSException: false,
    hasImplantTray: true,
    mechanicalParamEvidence: {
      passed: true,
      tempGraphVerified: true,
      pressureGraphVerified: true,
      vacuumLeakRateVerified: true,
      airRemovalTestRequired: true,
      airRemovalTestPassed: true
    },
    chemicalIndicatorEvidence: {
      passed: true,
      indicatorType: 'Class 5 Integrating',
      colorChangeVerified: true,
      requiredByPolicy: true
    },
    biologicalIndicatorEvidence: {
      isRequired: true,
      biVialLot: 'BI-LOT-9015',
      biStatus: 'pending',
      controlVialPositiveVerified: true,
      incubatorId: 'INC-AUTO-01',
      quarantinePendingResult: true
    },
    releaseDecision: {
      decision: 'pending_review',
      holdReason: 'حجز إلزامي (QUARANTINE_REQUIRED): بانتظار قراءة فحص المؤشر البيولوجي السريع في الحاضنة لشحنة الغرسات'
    },
    includedPackageIds: ['PKG-2026-8802']
  }
];

export const MOCK_DISTRIBUTION_REQUESTS: SterileDistributionRequest[] = [
  {
    id: 'DIST-REQ-501',
    destinationDepartment: 'OR-1 جراحة القلب والصدر',
    orCaseReference: 'or-case-201',
    requiredByTime: '2026-09-23 13:00',
    urgency: 'routine',
    requestedSetDefinitionIds: ['SET-DEF-CABG-01'],
    allocatedPackageIds: ['PKG-2026-8801'],
    dispatchTime: '2026-09-23 12:15',
    courierStaff: 'سعد العجمي (فني التوزيع المعقم)',
    acknowledgedByDestination: 'منار شكري (Lead Scrub Nurse OR-1)',
    acknowledgementTimestamp: '2026-09-23 12:25',
    status: 'received_at_unit',
    clinicalUseConfirmed: false,
    exposureVerificationStatus: 'verified',
    notes: 'تم تسليم الحاوية وفحص مؤشرات الأمان الخارجية عند باب مسرح العمليات 1'
  },
  {
    id: 'DIST-REQ-502',
    destinationDepartment: 'OR-2 جراحة العظام',
    orCaseReference: 'or-case-203',
    requiredByTime: '2026-09-23 13:45',
    urgency: 'routine',
    requestedSetDefinitionIds: ['SET-DEF-ORTHO-TKR'],
    allocatedPackageIds: [],
    status: 'requested',
    clinicalUseConfirmed: false,
    exposureVerificationStatus: 'not_verified',
    notes: 'تنبيه نقص في الجاهزية: الطقم لا يزال قيد انتظار قراءة المؤشر البيولوجي في معقم 2'
  }
];

export const MOCK_QUALITY_EXCEPTIONS: CSSDQualityException[] = [
  {
    id: 'EXC-2026-01',
    category: 'missing_instrument',
    severity: 'high_priority',
    sourceReference: 'SET-INST-704',
    affectedEntities: ['SET-INST-704', 'INST-TKR-02'],
    detectedTimestamp: '2026-09-23 09:20',
    detectedBy: 'علي القحطاني (فني الاستلام)',
    descriptionAr: 'عجز أداة: أزميل عظمي ستيلي 15mm مفقود من طقم الركبة العائد من OR-2',
    descriptionEn: 'Missing instrument: Stille Osteotome 15mm not found in return container from OR-2',
    status: 'open_action_required',
    quarantineApplied: false
  },
  {
    id: 'EXC-2026-02',
    category: 'single_use_item_detected',
    severity: 'critical_safety_block',
    sourceReference: 'RET-2026-003',
    affectedEntities: ['مشرط جراحي أحادي الاستخدام (Single-Use Scalpel #11)'],
    detectedTimestamp: '2026-09-23 09:48',
    detectedBy: 'سامي الدوسري (مشرف الاستلام)',
    descriptionAr: 'أداة أحادية الاستخدام مرسلة في حاوية التعقيم — حظر فوري وإرسال لقسم النفايات الطبية وفق لوائح SFDA',
    descriptionEn: 'Single-use device found in contaminated return — strictly blocked from reprocessing per SFDA',
    status: 'open_action_required',
    quarantineApplied: true
  }
];

export const MOCK_RECALL_CASES: CSSDRecallCase[] = [
  {
    id: 'RECALL-2026-001',
    titleAr: 'تحقيق استدعاء احترازي لشحنة البخار رقم (STER-HIST-399)',
    triggerReason: 'عطل في حساس تفريغ الهواء بالمعقم ظهر أثناء قراءة تقرير نهاية اليوم',
    suspectSterilizerCycleId: 'STER-HIST-399',
    openedTimestamp: '2026-09-22 17:00',
    openedBy: 'د. ليلى فهد (رئيسة مكافحة العدوى والتعقيم)',
    status: 'active_investigation',
    affectedPackageIds: ['PKG-HIST-9901', 'PKG-HIST-9902', 'PKG-HIST-9903'],
    locatedInStorageCount: 2,
    distributedToOrCount: 1,
    usedInPatientCount: 0,
    exposureVerificationStatus: 'exposure_reference_not_verified',
    returnedReprocessedCount: 2,
    ipcNotificationSent: true,
    biomedReviewRequested: true,
    reprocessingPlanAr: 'حجز العبوتين في المستودع فوراً وإعادة إدخالهما في دورة غسيل وتعقيم كاملة جديدة بعد معايرة المعقم',
    notes: 'تم التأكد من عدم استخدام العبوة الموزعة على أي مريض وسحبها من مسرح العمليات 4 بنجاح'
  }
];

export const INITIAL_CSSD_OPS_STATE: CSSDOpsState = {
  activePersona: 'cssd_supervisor',
  selectedBranchId: 'main_hospital_campus',
  setDefinitions: MOCK_INSTRUMENT_SET_DEFINITIONS,
  setInstances: MOCK_SET_INSTANCES,
  contaminatedReturns: MOCK_CONTAMINATED_RETURNS,
  washerCycles: MOCK_WASHER_CYCLES,
  packages: MOCK_PACKAGES,
  sterilizerCycles: MOCK_STERILIZER_CYCLES,
  distributionRequests: MOCK_DISTRIBUTION_REQUESTS,
  equipmentList: MOCK_EQUIPMENT_LIST,
  qualityExceptions: MOCK_QUALITY_EXCEPTIONS,
  recallCases: MOCK_RECALL_CASES,
  auditLogs: [
    {
      id: 'LOG-CSSD-001',
      timestamp: '2026-09-23 08:35',
      actionType: 'CONTAMINATED_RETURN_RECEIVED',
      entityId: 'RET-2026-001',
      actor: 'علي القحطاني (فني استلام التلوث)',
      descriptionAr: 'استلام طقم جراحة القلب المفتوح من مسرح OR-1 مطابقة كاملة للعدد (48/48)'
    },
    {
      id: 'LOG-CSSD-002',
      timestamp: '2026-09-23 10:20',
      actionType: 'WASHER_CYCLE_PASSED',
      entityId: 'WASH-CYC-101',
      actor: 'خالد عبد الرحمن (فني التطهير)',
      descriptionAr: 'اكتمال دورة الغسيل والتطهير الحراري بنجاح بمعيار ISO 15883-2:2024 بمعامل A0 = 3120 على جهاز Pass-Through 1'
    },
    {
      id: 'LOG-CSSD-003',
      timestamp: '2026-09-23 11:40',
      actionType: 'STERILE_LOAD_RELEASED',
      entityId: 'STER-2026-CYC-401',
      actor: 'د. طارق المنشاوي (مقيّم الإفراج)',
      descriptionAr: 'الإفراج السريري النهائي عن شحنة معقم 1 بعد مطابقة المعايير الفيزيائية والكيميائية والبيولوجية'
    }
  ]
};
