// ============================================================================
// HIS — BIOMEDICAL & MEDICAL EQUIPMENT MANAGEMENT (MOCK DATA FIXTURES)
// Architectural boundary: Synthetic Operations & Clinical Workflow Preview
// Informed by applicable IEC 62353 testing concepts & Saudi SFDA MDS-REQ references
// Synthetic Operations Preview — UI/UX Only
// ============================================================================

import {
  BiomedicalOpsState,
  MedicalEquipmentAsset,
  BiomedicalWorkOrder,
  VendorServiceContract,
  SafetyAlertFsca,
  BiomedicalAuditLog,
  ElectricalSafetyTestProfile
} from '../types/biomedicalOps';

export const INITIAL_SAFETY_TEST_PROFILES: ElectricalSafetyTestProfile[] = [
  {
    testProfileId: 'PROF-IEC62353-CLASS-I-BF',
    applicableStandardReference: 'Workflow informed by IEC 62353 Direct Method (Class I, Type BF)',
    equipmentClass: 'Class_I',
    appliedPartType: 'Type_BF',
    measurementType: 'Direct Equipment Leakage & Protective Earth',
    testMethod: 'Direct',
    earthResistanceLimitOhms: 0.200,
    detachableCordAllowanceOhms: 0.300,
    insulationResistanceLimitMOhms: 2.0,
    chassisLeakageLimitMicroAmps: 100.0,
    patientLeakageLimitMicroAmps: 5000.0,
    unit: 'Ohms / MOhms / uA',
    profileVersion: 'v2024.1'
  },
  {
    testProfileId: 'PROF-IEC62353-CLASS-I-CF',
    applicableStandardReference: 'Workflow informed by IEC 62353 Direct Method (Class I, Type CF Cardiac Floating)',
    equipmentClass: 'Class_I',
    appliedPartType: 'Type_CF',
    measurementType: 'Direct Equipment & Patient Leakage',
    testMethod: 'Direct',
    earthResistanceLimitOhms: 0.200,
    detachableCordAllowanceOhms: 0.300,
    insulationResistanceLimitMOhms: 2.0,
    chassisLeakageLimitMicroAmps: 100.0,
    patientLeakageLimitMicroAmps: 50.0, // Strict CF cardiac limit
    unit: 'Ohms / MOhms / uA',
    profileVersion: 'v2024.1'
  },
  {
    testProfileId: 'PROF-IEC62353-CLASS-II',
    applicableStandardReference: 'Workflow informed by IEC 62353 Differential Method (Class II Double Insulated)',
    equipmentClass: 'Class_II',
    appliedPartType: 'Type_B',
    measurementType: 'Touch Leakage Current',
    testMethod: 'Differential',
    insulationResistanceLimitMOhms: 7.0,
    chassisLeakageLimitMicroAmps: 100.0,
    unit: 'MOhms / uA',
    profileVersion: 'v2024.1'
  },
  {
    testProfileId: 'PROF-NON-ELECTRICAL',
    applicableStandardReference: 'Non-electrical or manual mechanical device — Electrical safety test not applicable',
    equipmentClass: 'Non_Electrical',
    appliedPartType: 'None',
    measurementType: 'None',
    testMethod: 'Direct',
    insulationResistanceLimitMOhms: 0,
    chassisLeakageLimitMicroAmps: 0,
    unit: 'N/A',
    profileVersion: 'v1.0'
  }
];

export const INITIAL_BIOMEDICAL_ASSETS: MedicalEquipmentAsset[] = [
  {
    id: 'asset-vent-01',
    assetTag: 'BIO-ICU-VENT-01',
    nameAr: 'جهاز تنفس صناعي للعناية المركزة',
    nameEn: 'Hamilton G5 Intensive Care Ventilator',
    category: 'life_support',

    // Classification vs Criticality
    regulatoryClassificationScheme: 'SFDA_MDS_REQ',
    regulatoryClassificationValue: 'Class III',
    regulatoryClassificationSource: 'Saudi FDA Medical Device National Registry (MDNR)',
    clinicalCriticality: 'life_support',
    lifeSupportDependency: true,
    serviceCriticality: 'vital',

    manufacturer: 'Hamilton Medical AG',
    model: 'G5 Modular',
    serialNumber: 'HM-8839201',
    udiCode: '(01)07612345678901(21)HM8839201',
    sfdaRegistrationNumber: 'SFDA-MDNR-2023-V-991',
    assignedDepartment: 'العناية المركزة (ICU)',
    locationRoom: 'ICU - سرير رقم 01 (سرير عزل حرج)',
    custodianStaffName: 'م. سارة الشهري (رئيسة تمريض ICU)',
    commissioningDate: '2024-03-15',
    warrantyExpiryDate: '2027-03-15',
    oemVendorName: 'شركة الرعاية الطبية المتقدمة (وكيل هاملتون)',
    currentStatus: 'in_service',

    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'required',
      electricalSafetyTest: 'required',
      calibration: 'required',
      networkIntegration: 'conditional',
      trainingEvidence: 'required',
      manufacturerInstallationEvidence: 'required',
      manufacturerIfuAvailable: true
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'cssd',
      certificateRef: 'CSSD-DECON-2026-041',
      disinfectionLevel: 'high_level',
      verifiedBy: 'أحمد نبيل (مشرف التعقيم المركزي)'
    },
    safetyTestProfileId: 'PROF-IEC62353-CLASS-I-BF',
    calibrationProfile: {
      calibrationRequired: true,
      frequencyMonths: 6,
      parametersList: ['Tidal Volume', 'PEEP Pressure', 'FiO2 Concentration']
    },

    ppmSchedule: {
      frequencyMonths: 6,
      lastPpmDate: '2026-04-10',
      nextPpmDueDate: '2026-10-10',
      ppmProtocolCode: 'PPM-VENT-HAMILTON-6M',
      status: 'up_to_date',
      checklistItems: [
        { step: 'فحص كابل الطاقة والتأريض الوقائي', completed: true },
        { step: 'اختبار محبس الزفير وخلية الأكسجين O2 Cell', completed: true },
        { step: 'معايرة تدفق الشهيق والضغط Ppeak', completed: true },
        { step: 'فحص إنذارات انقطاع الكهرباء والغاز', completed: true },
        { step: 'فحص سعة البطارية الاحتياطية (> 85%)', completed: true }
      ]
    },
    latestSafetyTest: {
      id: 'ST-2026-0410',
      testDate: '2026-04-10',
      testedBy: 'م. طارق الغامدي (مهندس أجهزة طبية)',
      testStandardReference: 'Workflow informed by IEC 62353',
      testProfileId: 'PROF-IEC62353-CLASS-I-BF',
      testDeviceRef: 'Fluke ESA620 S/N 847291',
      earthResistanceOhms: 0.085,
      earthResistancePass: true,
      insulationResistanceMOhms: 98.5,
      insulationResistancePass: true,
      chassisLeakageCurrentMicroAmps: 42.1,
      chassisLeakagePass: true,
      patientAppliedPartLeakageMicroAmps: 18.4,
      overallSafetyPass: true,
      notes: 'فحص مطابق لملف PROF-IEC62353-CLASS-I-BF'
    },
    latestCalibration: {
      id: 'CAL-2026-0410',
      calibrationDate: '2026-04-10',
      expiryDate: '2026-10-10',
      calibratedBy: 'مختبر المعايرة الحيوي المعتمد',
      certificateNumber: 'CAL-CERT-HAM-8839-26',
      referenceStandardDevice: 'TSI Certifier Pro Flow Analyzer S/N 99201',
      referenceStandardExpiryDate: '2027-04-01',
      referenceStandardExpired: false,
      testPoints: [
        { parameter: 'Tidal Volume (500 mL)', nominalValue: 500, measuredValue: 498, unit: 'mL', allowedTolerancePercent: 5, deviationPercent: 0.4, inTolerance: true },
        { parameter: 'PEEP Pressure (10 cmH2O)', nominalValue: 10, measuredValue: 9.9, unit: 'cmH2O', allowedTolerancePercent: 5, deviationPercent: 1.0, inTolerance: true },
        { parameter: 'FiO2 Concentration (60%)', nominalValue: 60, measuredValue: 60.5, unit: '%', allowedTolerancePercent: 3, deviationPercent: 0.8, inTolerance: true }
      ],
      passed: true
    },
    lifecycleHistory: [
      {
        id: 'EVT-001',
        timestamp: '2026-04-10 11:30',
        eventType: 'ppm_execution',
        descriptionAr: 'اكتمال أعمال الصيانة الوقائية الدورية نصف السنوية واختبار السلامة الكهربائية.',
        descriptionEn: 'Biannual PPM and electrical safety testing executed successfully.',
        actor: 'م. طارق الغامدي'
      },
      {
        id: 'EVT-002',
        timestamp: '2024-03-15 09:00',
        eventType: 'commissioning',
        descriptionAr: 'تدشين الجهاز واعتماده للخدمة السريرية في العناية المركزة.',
        descriptionEn: 'Initial commissioning and clinical acceptance in ICU.',
        actor: 'م. خالد السعدون'
      }
    ],
    downtimeHistory: []
  },
  {
    id: 'asset-laser-01',
    assetTag: 'BIO-OR-LASER-01',
    nameAr: 'جهاز ليزر جراحي هولميوم لتفتيت الحصوات',
    nameEn: 'Lumenis Pulse 120H Holmium Surgical Laser',
    category: 'surgical_or',

    // Key semantic test case: Class III device that is NOT life support!
    regulatoryClassificationScheme: 'SFDA_MDS_REQ',
    regulatoryClassificationValue: 'Class III',
    regulatoryClassificationSource: 'Saudi FDA Medical Device National Registry',
    clinicalCriticality: 'critical',
    lifeSupportDependency: false, // NOT a life-support device!
    serviceCriticality: 'high',

    manufacturer: 'Lumenis Ltd.',
    model: 'Pulse 120H',
    serialNumber: 'LM-44019',
    udiCode: '(01)07290012345678(21)LM44019',
    sfdaRegistrationNumber: 'SFDA-MDNR-2023-L-109',
    assignedDepartment: 'العمليات الجراحية (OR)',
    locationRoom: 'غرفة العمليات رقم 4 (Urology OR 04)',
    custodianStaffName: 'د. سامي القحطاني (استشاري جراحة المسالك)',
    commissioningDate: '2024-05-10',
    warrantyExpiryDate: '2027-05-10',
    oemVendorName: 'شركة التقنيات الجراحية المتطورة',
    currentStatus: 'in_service',

    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'required',
      electricalSafetyTest: 'required',
      calibration: 'required',
      networkIntegration: 'not_required',
      trainingEvidence: 'required',
      manufacturerInstallationEvidence: 'required',
      manufacturerIfuAvailable: true
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'clinical_dept',
      disinfectionLevel: 'intermediate_level'
    },
    safetyTestProfileId: 'PROF-IEC62353-CLASS-I-BF',
    calibrationProfile: {
      calibrationRequired: true,
      frequencyMonths: 12,
      parametersList: ['Laser Energy Joules', 'Pulse Repetition Rate Hz']
    },

    ppmSchedule: {
      frequencyMonths: 6,
      lastPpmDate: '2026-05-10',
      nextPpmDueDate: '2026-11-10',
      ppmProtocolCode: 'PPM-LASER-LUMENIS-6M',
      status: 'up_to_date',
      checklistItems: [
        { step: 'فحص مبرد الماء الداخلي والحرارة', completed: true },
        { step: 'اختبار قفل الأمان الليزري (Door Interlock Check)', completed: true },
        { step: 'معايرة طاقة الشعاع مع مقياس الطاقة الخارجي', completed: true }
      ]
    },
    lifecycleHistory: [
      {
        id: 'EVT-L01',
        timestamp: '2026-05-10 14:00',
        eventType: 'ppm_execution',
        descriptionAr: 'إجراء الصيانة الدورية واختبار أمان الشعاع وقفل الباب التداخلي.',
        descriptionEn: 'PPM and laser safety interlock check completed.',
        actor: 'م. طارق الغامدي'
      }
    ],
    downtimeHistory: []
  },
  {
    id: 'asset-stretcher-01',
    assetTag: 'BIO-ER-STR-01',
    nameAr: 'نقالة طوارئ ميكانيكية هيدروليكية',
    nameEn: 'Stryker Prime Series Hydraulic Transport Stretcher',
    category: 'general_care',

    // Non-electrical device: Electrical test not applicable!
    regulatoryClassificationScheme: 'SFDA_MDS_REQ',
    regulatoryClassificationValue: 'Class I',
    regulatoryClassificationSource: 'Saudi FDA Medical Device National Registry',
    clinicalCriticality: 'routine',
    lifeSupportDependency: false,
    serviceCriticality: 'medium',

    manufacturer: 'Stryker Medical',
    model: 'Prime 1115',
    serialNumber: 'STR-99120',
    udiCode: '(01)00761234567890(21)STR99120',
    sfdaRegistrationNumber: 'SFDA-MDNR-2022-G-441',
    assignedDepartment: 'طوارئ الكبار (ER)',
    locationRoom: 'طوارئ - منطقة الاستقبال والفرز',
    custodianStaffName: 'م. فهد الزهراني (مشرف تمريض الطوارئ)',
    commissioningDate: '2023-01-10',
    warrantyExpiryDate: '2026-01-10',
    oemVendorName: 'المؤسسة الطبية للتجهيزات',
    currentStatus: 'in_service',

    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'not_required',
      electricalSafetyTest: 'not_required', // Non-electrical!
      calibration: 'not_required',          // Non-measuring!
      networkIntegration: 'not_required',
      trainingEvidence: 'not_required',
      manufacturerInstallationEvidence: 'not_required',
      manufacturerIfuAvailable: true
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'clinical_dept',
      disinfectionLevel: 'low_level'
    },
    safetyTestProfileId: 'PROF-NON-ELECTRICAL',

    ppmSchedule: {
      frequencyMonths: 12,
      lastPpmDate: '2026-01-10',
      nextPpmDueDate: '2027-01-10',
      ppmProtocolCode: 'PPM-STRETCHER-STRYKER-12M',
      status: 'up_to_date',
      checklistItems: [
        { step: 'فحص مضخة الهيدروليك ورفع الرأس Trendelenburg', completed: true },
        { step: 'فحص فرامل العجلات والمصدات الجانبية', completed: true }
      ]
    },
    lifecycleHistory: [],
    downtimeHistory: []
  },
  {
    id: 'asset-esu-01',
    assetTag: 'BIO-OR-ESU-01',
    nameAr: 'وحدة جراحة كهربائية واستئصال كهربي',
    nameEn: 'Covidien ForceTriad Electrosurgical Generator',
    category: 'surgical_or',

    regulatoryClassificationScheme: 'EU_MDR',
    regulatoryClassificationValue: 'Class IIb',
    regulatoryClassificationSource: 'EU MDR Notified Body Conformity Record',
    clinicalCriticality: 'critical',
    lifeSupportDependency: false,
    serviceCriticality: 'high',

    manufacturer: 'Medtronic / Covidien',
    model: 'ForceTriad Energy Platform',
    serialNumber: 'FT-55321',
    udiCode: '(01)00884567890123(21)FT55321',
    sfdaRegistrationNumber: 'SFDA-MDNR-2021-E-772',
    assignedDepartment: 'العمليات الجراحية (OR)',
    locationRoom: 'غرفة العمليات رقم 2 (OR Suite 02)',
    custodianStaffName: 'م. عبد الله العمري (مشرف تمريض العمليات)',
    commissioningDate: '2022-11-10',
    warrantyExpiryDate: '2024-11-10',
    oemVendorName: 'مدترونيك السعودية',
    currentStatus: 'under_repair',
    activeWorkOrderId: 'WO-2026-0811',

    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'required',
      electricalSafetyTest: 'required',
      calibration: 'required',
      networkIntegration: 'not_required',
      trainingEvidence: 'required',
      manufacturerInstallationEvidence: 'required',
      manufacturerIfuAvailable: true
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'clinical_dept',
      disinfectionLevel: 'intermediate_level'
    },
    safetyTestProfileId: 'PROF-IEC62353-CLASS-I-CF',

    ppmSchedule: {
      frequencyMonths: 6,
      lastPpmDate: '2026-02-14',
      nextPpmDueDate: '2026-08-14',
      ppmProtocolCode: 'PPM-ESU-COVIDIEN-6M',
      status: 'overdue',
      checklistItems: [
        { step: 'فحص مخرجات الطاقة أحادية القطب Monopolar (Cut/Coag)', completed: false },
        { step: 'فحص مخرجات الطاقة ثنائية القطب Bipolar & LigaSure', completed: false }
      ]
    },
    lifecycleHistory: [
      {
        id: 'EVT-ESU-01',
        timestamp: '2026-09-23 14:15',
        eventType: 'downtime_start',
        descriptionAr: 'بدء فترة التوقف عن العمل السريري إثر عطل في دائرة التغذية الكهربائية.',
        descriptionEn: 'Clinical downtime started following RF output inverter board fault.',
        actor: 'م. عبد الله العمري'
      }
    ],
    // Open downtime: start date present, NO fabricated end date!
    downtimeHistory: [
      {
        id: 'DT-2026-ESU-01',
        start: '2026-09-23 14:15',
        end: undefined, // OPEN DOWNTIME!
        reason: 'عطل لوحة توليد التردد العالي أثناء الجراحة',
        workOrderId: 'wo-2026-0811'
      }
    ]
  },
  {
    id: 'asset-new-analyzer-01',
    assetTag: 'BIO-NEW-ANA-01',
    nameAr: 'محلل كيمياء حيوية نقطي (حديث الاستلام - تفتقر وثائق IFU)',
    nameEn: 'Radiometer ABL90 FLEX Blood Gas Analyzer',
    category: 'laboratory_analyzer',

    regulatoryClassificationScheme: 'SFDA_MDS_REQ',
    regulatoryClassificationValue: 'Class IIa',
    regulatoryClassificationSource: 'Saudi FDA Medical Device National Registry',
    clinicalCriticality: 'important',
    lifeSupportDependency: false,
    serviceCriticality: 'high',

    manufacturer: 'Radiometer Medical ApS',
    model: 'ABL90 FLEX',
    serialNumber: 'RM-99412',
    udiCode: '(01)05701234567890(21)RM99412',
    sfdaRegistrationNumber: 'SFDA-MDNR-2024-B-881',
    assignedDepartment: 'المختبر المركزي (LIS)',
    locationRoom: 'مختبر غازات الدم السريع',
    custodianStaffName: 'د. منى العبدلي (أخصائية المختبر)',
    commissioningDate: '2026-09-24',
    warrantyExpiryDate: '2028-09-24',
    oemVendorName: 'راديوميتر الشرق الأوسط',
    currentStatus: 'pending_commissioning',

    // Test case BM04: missing IFU
    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'required',
      electricalSafetyTest: 'required',
      calibration: 'required',
      networkIntegration: 'required',
      trainingEvidence: 'required',
      manufacturerInstallationEvidence: 'required',
      manufacturerIfuAvailable: false // MISSING IFU!
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'laboratory_biosafety',
      disinfectionLevel: 'intermediate_level'
    },
    safetyTestProfileId: 'PROF-IEC62353-CLASS-I-BF',

    ppmSchedule: {
      frequencyMonths: 6,
      lastPpmDate: '2026-09-24',
      nextPpmDueDate: '2027-03-24',
      ppmProtocolCode: 'PPM-ANALYZER-RADIOMETER-6M',
      status: 'in_progress',
      checklistItems: []
    },
    lifecycleHistory: [],
    downtimeHistory: []
  },
  {
    id: 'asset-incu-01',
    assetTag: 'BIO-NICU-INC-01',
    nameAr: 'حاضنة رعاية حديثي الولادة فائقة الحماية',
    nameEn: 'Dräger Isolette 8000 Infant Incubator',
    category: 'therapeutic',

    regulatoryClassificationScheme: 'SFDA_MDS_REQ',
    regulatoryClassificationValue: 'Class IIb',
    regulatoryClassificationSource: 'Saudi FDA Medical Device National Registry',
    clinicalCriticality: 'critical',
    lifeSupportDependency: false,
    serviceCriticality: 'high',

    manufacturer: 'Dräger Medical GmbH',
    model: 'Isolette 8000',
    serialNumber: 'DR-44319',
    udiCode: '(01)04023456789123(21)DR44319',
    sfdaRegistrationNumber: 'SFDA-MDNR-2023-I-552',
    assignedDepartment: 'عناية حديثي الولادة (NICU)',
    locationRoom: 'NICU - وحدة العزل رقم 2',
    custodianStaffName: 'د. لمياء البلوشي (استشارية حديثي الولادة)',
    commissioningDate: '2023-05-12',
    warrantyExpiryDate: '2026-05-12',
    oemVendorName: 'دريجر السعودية',
    currentStatus: 'quarantined_safety_hold',
    fscaQuarantineRef: 'SFDA-NCMDR-2026-041',

    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'required',
      electricalSafetyTest: 'required',
      calibration: 'required',
      networkIntegration: 'not_required',
      trainingEvidence: 'required',
      manufacturerInstallationEvidence: 'required',
      manufacturerIfuAvailable: true
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'ipc',
      certificateRef: 'IPC-DECON-2026-99',
      disinfectionLevel: 'high_level'
    },
    safetyTestProfileId: 'PROF-IEC62353-CLASS-I-BF',

    ppmSchedule: {
      frequencyMonths: 6,
      lastPpmDate: '2026-01-20',
      nextPpmDueDate: '2026-07-20',
      ppmProtocolCode: 'PPM-NICU-DRAGER-6M',
      status: 'overdue',
      checklistItems: [
        { step: 'فحص استقرار درجات الحرارة وسرعة تدفق الهواء', completed: true },
        { step: 'فحص مستشعر حرارة جلد الرضيع (Skin Probe)', completed: false, remarks: 'معلق بسبب استدعاء هيئة الغذاء والدواء SFDA' }
      ]
    },
    lifecycleHistory: [
      {
        id: 'EVT-INC-01',
        timestamp: '2026-09-18 11:20',
        eventType: 'safety_alert_quarantine',
        descriptionAr: 'تطبيق حظر السلامة الفوري استجابة للبلاغ SFDA-NCMDR-2026-041.',
        descriptionEn: 'Safety alert quarantine applied for SFDA-NCMDR-2026-041.',
        actor: 'د. ليلى فهد'
      }
    ],
    downtimeHistory: []
  },
  {
    id: 'asset-mon-01',
    assetTag: 'BIO-ER-MON-01',
    nameAr: 'شاشة مراقبة حيوية متعددة المعاملات',
    nameEn: 'Mindray BeneVision N17 Patient Monitor',
    category: 'monitoring',

    regulatoryClassificationScheme: 'SFDA_MDS_REQ',
    regulatoryClassificationValue: 'Class IIb',
    regulatoryClassificationSource: 'Saudi FDA Medical Device National Registry',
    clinicalCriticality: 'important',
    lifeSupportDependency: false,
    serviceCriticality: 'high',

    manufacturer: 'Mindray Medical International',
    model: 'BeneVision N17',
    serialNumber: 'MN-66120',
    udiCode: '(01)06912345678901(21)MN66120',
    sfdaRegistrationNumber: 'SFDA-MDNR-2023-M-112',
    assignedDepartment: 'طوارئ الكبار (ER)',
    locationRoom: 'طوارئ - سرير الإنعاش الحرج رقم 03',
    custodianStaffName: 'م. فهد الزهراني (مشرف تمريض الطوارئ)',
    commissioningDate: '2024-02-18',
    warrantyExpiryDate: '2027-02-18',
    oemVendorName: 'ميندراي الشرق الأوسط',
    currentStatus: 'post_repair_testing',
    activeWorkOrderId: 'wo-2026-0812',

    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'required',
      electricalSafetyTest: 'required',
      calibration: 'not_required',
      networkIntegration: 'conditional',
      trainingEvidence: 'not_required',
      manufacturerInstallationEvidence: 'not_required',
      manufacturerIfuAvailable: true
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'clinical_dept',
      disinfectionLevel: 'intermediate_level'
    },
    safetyTestProfileId: 'PROF-IEC62353-CLASS-I-BF',

    ppmSchedule: {
      frequencyMonths: 6,
      lastPpmDate: '2026-03-01',
      nextPpmDueDate: '2026-09-01',
      ppmProtocolCode: 'PPM-MON-MINDRAY-6M',
      status: 'due_soon',
      checklistItems: [
        { step: 'فحص دقة ضغط الدم غير التداخلي NIBP', completed: true },
        { step: 'معايرة نسبة تشبع الأكسجين SpO2', completed: true }
      ]
    },
    lifecycleHistory: [],
    downtimeHistory: []
  },
  {
    id: 'asset-lab-01',
    assetTag: 'BIO-LAB-CENT-01',
    nameAr: 'جهاز طرد مركزي مبرد للمختبر (متقاعد)',
    nameEn: 'Beckman Coulter Allegra X-30R Centrifuge',
    category: 'laboratory_analyzer',

    regulatoryClassificationScheme: 'SFDA_MDS_REQ',
    regulatoryClassificationValue: 'Class I',
    regulatoryClassificationSource: 'Saudi FDA Medical Device National Registry',
    clinicalCriticality: 'routine',
    lifeSupportDependency: false,
    serviceCriticality: 'low',

    manufacturer: 'Beckman Coulter',
    model: 'Allegra X-30R',
    serialNumber: 'BC-33109',
    udiCode: '(01)00881234567890(21)BC33109',
    sfdaRegistrationNumber: 'SFDA-MDNR-2018-L-091',
    assignedDepartment: 'المختبر المركزي (LIS)',
    locationRoom: 'مستودع الأصول المتقاعدة - قبو المستشفى',
    custodianStaffName: 'م. طارق الغامدي',
    commissioningDate: '2018-02-10',
    warrantyExpiryDate: '2021-02-10',
    oemVendorName: 'بيكمان كولتر السعودية',
    currentStatus: 'decommissioned',

    commissioningProfile: {
      physicalInspection: 'required',
      installationVerification: 'required',
      functionalTest: 'required',
      performanceVerification: 'not_required',
      electricalSafetyTest: 'required',
      calibration: 'not_required',
      networkIntegration: 'not_required',
      trainingEvidence: 'not_required',
      manufacturerInstallationEvidence: 'not_required',
      manufacturerIfuAvailable: true
    },
    decontaminationProfile: {
      requirementStatus: 'required',
      source: 'laboratory_biosafety',
      certificateRef: 'LAB-BIO-DECON-2026-081',
      disinfectionLevel: 'high_level',
      verifiedBy: 'د. منى العبدلي (مسؤول السلامة الحيوية بالمختبر)'
    },
    safetyTestProfileId: 'PROF-IEC62353-CLASS-I-BF',

    ppmSchedule: {
      frequencyMonths: 12,
      lastPpmDate: '2025-01-10',
      nextPpmDueDate: '2026-01-10',
      ppmProtocolCode: 'PPM-CENT-BECKMAN-12M',
      status: 'overdue',
      checklistItems: []
    },
    decommissioningRecord: {
      date: '2026-02-01',
      reason: 'تقادم دورة الحياة التشغيلية (End of Life) وتوقف المصنع عن توريد قطع الغيار.',
      decontaminationCertRef: 'LAB-BIO-DECON-2026-081',
      decontaminationStatus: 'completed_reference',
      disposalMethod: 'recycle_parts',
      authorizedBy: 'م. خالد السعدون (مدير إدارة الهندسة السريرية)'
    },
    lifecycleHistory: [
      {
        id: 'EVT-DEC-01',
        timestamp: '2026-02-01 10:00',
        eventType: 'decommissioning',
        descriptionAr: 'تكهين الجهاز نهائياً بعد إرفاق شهادة التطهير البيولوجي من مختبر السلامة الحيوية.',
        descriptionEn: 'Asset retired with verified laboratory decontamination clearance.',
        actor: 'م. خالد السعدون'
      }
    ],
    downtimeHistory: []
  }
];

export const INITIAL_BIOMEDICAL_WORK_ORDERS: BiomedicalWorkOrder[] = [
  {
    id: 'wo-2026-0811',
    workOrderNumber: 'WO-2026-0811',
    assetId: 'asset-esu-01',
    assetTag: 'BIO-OR-ESU-01',
    assetName: 'Covidien ForceTriad Electrosurgical Generator',
    departmentId: 'or',
    departmentName: 'العمليات الجراحية (OR Suite 02)',
    reportedBy: 'م. عبد الله العمري (مشرف تمريض العمليات)',
    reportedDate: '2026-09-23 14:15',
    priority: 'urgent_clinical',
    status: 'in_progress',
    assignedEngineer: 'م. طارق الغامدي (مهندس أجهزة طبية أول)',
    problemDescription: 'ظهور كود الخطأ ERR-198 أثناء جراحة استئصال المرارة بالمنظار مع توقف التخثر ثنائي القطب LigaSure.',
    failureCategory: 'electronic_board',
    actionsTaken: 'تم فحص لوحة الإشارة RF Generator Board، وتبين احتراق مكثف ترشيح في دائرة التغذية ثنائية القطب. تم طلب بطاقة بديلة.',
    rootCauseAnalysis: 'تذبذب في خط التغذية الكهربائي الداخلي المؤدي إلى تلف مكثف تنعيم التردد.',
    partsUsed: [
      {
        partNumber: 'MED-FT-PCB-449',
        description: 'RF Output Inverter Board for ForceTriad',
        quantity: 1,
        costSar: 8400,
        lotOrSerialNumber: 'SN-PCB-2026-991',
        inventorySource: 'hospital_central_store'
      }
    ],
    downtimeRecord: {
      id: 'DT-2026-ESU-01',
      start: '2026-09-23 14:15',
      end: undefined, // OPEN DOWNTIME!
      reason: 'عطل لوحة توليد التردد العالي أثناء الجراحة',
      workOrderId: 'wo-2026-0811'
    },
    electricalSafetyTestRequired: true,
    calibrationRequired: true,
    functionalVerificationCompleted: false,
    vendorRepaired: false,
    hospitalVerificationCompleted: false,
    returnToServiceApproved: false
  },
  {
    id: 'wo-2026-0812',
    workOrderNumber: 'WO-2026-0812',
    assetId: 'asset-mon-01',
    assetTag: 'BIO-ER-MON-01',
    assetName: 'Mindray BeneVision N17 Patient Monitor',
    departmentId: 'er',
    departmentName: 'طوارئ الكبار (ER Resuscitation 03)',
    reportedBy: 'م. فهد الزهراني',
    reportedDate: '2026-09-24 07:30',
    priority: 'urgent_clinical',
    status: 'testing_pending',
    assignedEngineer: 'م. حسام العتيبي',
    problemDescription: 'توقف شاشة اللمس عن الاستجابة لضغطات الأطباء وانقطاع قراءة كابل SpO2 المتصل.',
    failureCategory: 'sensor_probe',
    actionsTaken: 'تم استبدال كابل محول SpO2 Interface Cable ومعايرة طبقة اللمس Capacitive Digitizer بنجاح.',
    partsUsed: [
      {
        partNumber: 'MN-SPO2-CAB-12',
        description: 'Mindray SpO2 Patient Extension Cable',
        quantity: 1,
        costSar: 650,
        lotOrSerialNumber: 'LOT-2026-SP44',
        inventorySource: 'hospital_central_store'
      }
    ],
    downtimeRecord: {
      id: 'DT-2026-MON-01',
      start: '2026-09-24 07:30',
      end: '2026-09-24 10:45',
      durationHours: 3.25,
      reason: 'عطل شاشة اللمس وكابل الحساس',
      workOrderId: 'wo-2026-0812'
    },
    electricalSafetyTestRequired: true,
    safetyTestRecord: {
      id: 'ST-WO-0812',
      testDate: '2026-09-24',
      testedBy: 'م. حسام العتيبي',
      testStandardReference: 'Workflow informed by IEC 62353',
      testProfileId: 'PROF-IEC62353-CLASS-I-BF',
      testDeviceRef: 'Rigel 288+ S/N 49102',
      earthResistanceOhms: 0.092,
      earthResistancePass: true,
      insulationResistanceMOhms: 110.0,
      insulationResistancePass: true,
      chassisLeakageCurrentMicroAmps: 39.5,
      chassisLeakagePass: true,
      overallSafetyPass: true,
      notes: 'فحص ما بعد الإصلاح مجاز وفق ملف PROF-IEC62353-CLASS-I-BF'
    },
    calibrationRequired: false,
    functionalVerificationCompleted: true,
    vendorRepaired: false,
    hospitalVerificationCompleted: true,
    technicianSignOff: {
      engineerName: 'م. حسام العتيبي',
      timestamp: '2026-09-24 10:45'
    },
    returnToServiceApproved: false
  }
];

export const INITIAL_VENDOR_CONTRACTS: VendorServiceContract[] = [
  {
    id: 'cnt-drager-01',
    contractNumber: 'SLA-2025-DRAGER-001',
    vendorName: 'دريجر الطبية السعودية المحدودة (Dräger Saudi)',
    vendorContactEmail: 'service-sa@draeger.com',
    vendorPhone: '+966-11-482-9900',
    contractType: 'comprehensive_parts_labor',
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    annualValueSar: 420000, // Synthetic reference value
    slaResponseHours: 2,    // Configured target
    slaPolicyMode: 'ILLUSTRATIVE_CONTRACT_CONFIGURATION',
    coveredAssetIds: ['asset-incu-01'],
    status: 'active'
  },
  {
    id: 'cnt-getinge-01',
    contractNumber: 'SLA-2025-GETINGE-044',
    vendorName: 'جيتنجي الشرق الأوسط للتعقيم والتنفس (Getinge ME)',
    vendorContactEmail: 'service.saudi@getinge.com',
    vendorPhone: '+966-11-460-1200',
    contractType: 'comprehensive_parts_labor',
    startDate: '2025-03-01',
    endDate: '2027-02-28',
    annualValueSar: 350000,
    slaResponseHours: 4,
    slaPolicyMode: 'ILLUSTRATIVE_CONTRACT_CONFIGURATION',
    coveredAssetIds: ['asset-vent-01'],
    status: 'active'
  }
];

export const INITIAL_SAFETY_ALERTS_FSCA: SafetyAlertFsca[] = [
  {
    id: 'fsca-2026-041',
    fscaAlertNumber: 'SFDA-NCMDR-2026-041',
    issuingBody: 'SFDA_NCMDR',
    titleAr: 'إشعار سلامة ميداني اصطناعي — حساسات درجات حرارة الحاضنات دريجر Isolette 8000',
    titleEn: 'Synthetic Field Safety Corrective Action Reference — Dräger Isolette 8000 Skin Temperature Probes Drift',
    severity: 'class_1_critical_recall',
    affectedManufacturer: 'Dräger Medical GmbH',
    affectedModel: 'Isolette 8000',
    affectedSerialRange: 'DR-44000 to DR-44999',
    hazardDescription: 'رصد هيئة الغذاء والدواء لاحتمالية انحراف قراءة حساس حرارة جلد الرضيع مما قد يتسبب في تغير درجات الحرارة.',
    actionRequired: 'immediate_quarantine',
    affectedAssetIds: ['asset-incu-01'],
    status: 'open_action_pending',
    dateIssued: '2026-09-18'
  },
  {
    id: 'fsca-2026-052',
    fscaAlertNumber: 'SFDA-NCMDR-2026-052',
    issuingBody: 'SFDA_NCMDR',
    titleAr: 'تحديث برمجي إلزامي — أجهزة التنفس الصناعي هاملتون G5 (Firmware Update v2.2)',
    titleEn: 'Mandatory Firmware Patch Reference — Hamilton G5 Screen Freeze Mitigation',
    severity: 'class_2_urgent_fsca',
    affectedManufacturer: 'Hamilton Medical AG',
    affectedModel: 'G5 Modular',
    affectedSerialRange: 'All',
    affectedSoftwareFirmware: 'v2.1',
    hazardDescription: 'تحديث برنامج التشغيل لمنع تجمد نادر لشاشة الضبط عند التبديل السريع بين أوضاع التهوية.',
    actionRequired: 'software_upgrade',
    affectedAssetIds: ['asset-vent-01'],
    status: 'under_remediation',
    dateIssued: '2026-09-10'
  }
];

export const INITIAL_BIOMEDICAL_AUDIT_LOGS: BiomedicalAuditLog[] = [
  {
    id: 'LOG-BIO-101',
    timestamp: '2026-09-24 10:45:12',
    actionType: 'POST_REPAIR_TESTING_COMPLETED',
    assetId: 'asset-mon-01',
    workOrderId: 'wo-2026-0812',
    actor: 'م. حسام العتيبي',
    role: 'field_biomed_engineer',
    descriptionAr: 'اكتمال فحص السلامة الكهربائية بعد الإصلاح لجهاز مراقبة الطوارئ BIO-ER-MON-01 وفق ملف الفحص المعتمد.'
  },
  {
    id: 'LOG-BIO-102',
    timestamp: '2026-09-23 14:15:00',
    actionType: 'WORK_ORDER_CREATED_STAT',
    assetId: 'asset-esu-01',
    workOrderId: 'wo-2026-0811',
    actor: 'م. عبد الله العمري',
    role: 'department_custodian',
    descriptionAr: 'تسجيل بلاغ عطل فني وبدء احتساب فترة التوقف السريري لجهاز الجراحة الكهربائية BIO-OR-ESU-01.'
  },
  {
    id: 'LOG-BIO-103',
    timestamp: '2026-09-18 11:20:00',
    actionType: 'SFDA_FSCA_QUARANTINE_APPLIED',
    assetId: 'asset-incu-01',
    actor: 'د. ليلى فهد',
    role: 'safety_regulatory_officer',
    descriptionAr: 'تطبيق حظر السلامة والحجر الاحترازي على حاضنة الأطفال BIO-NICU-INC-01 بناءً على إشعار SFDA-NCMDR-2026-041.'
  }
];

export const INITIAL_BIOMEDICAL_OPS_STATE: BiomedicalOpsState = {
  assets: INITIAL_BIOMEDICAL_ASSETS,
  workOrders: INITIAL_BIOMEDICAL_WORK_ORDERS,
  vendorContracts: INITIAL_VENDOR_CONTRACTS,
  safetyAlerts: INITIAL_SAFETY_ALERTS_FSCA,
  auditLogs: INITIAL_BIOMEDICAL_AUDIT_LOGS,
  activePersona: 'biomed_manager',
  testProfiles: INITIAL_SAFETY_TEST_PROFILES
};
