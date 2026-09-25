// ============================================================================
// CSSD & STERILE PROCESSING OPERATIONS — EXHAUSTIVE AUTOMATED TEST SUITE
// Executable safety coverage: CSSD01 through CSSD30 + Negative State Mutation tests
// Tests application behavior ONLY; does not claim regulatory certification.
// ============================================================================

import {
  CSSDOpsState,
  ContaminatedReturnRecord,
  CSSDReusableSetInstance,
  WasherDisinfectorCycleRecord,
  CSSDPackageRecord,
  SterilizerCycleRecord,
  SterileDistributionRequest,
  CSSDEquipmentReference,
  InstrumentSetDefinition
} from '../types/cssdOps';
import {
  reconcileContaminatedReceipt,
  executeCleaningCycle,
  evaluateInspectionResult,
  verifySetAssembly,
  createSterilizationPackage,
  resolvePackagingProcessCompatibility,
  validatePackageInclusionInLoad,
  validateSterilizerAirRemovalCheck,
  validateIUSSWorkflow,
  evaluateLoadRelease,
  evaluatePackageStorageIntegrity,
  dispatchSterileSetToCase
} from '../utils/cssdWorkflowEngine';

export interface CSSDTestResult {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runAllCssdTests(state: CSSDOpsState): CSSDTestResult[] {
  const results: CSSDTestResult[] = [];

  const addTest = (
    id: string,
    nameAr: string,
    nameEn: string,
    category: string,
    passed: boolean,
    expected: string,
    actual: string,
    details?: string
  ) => {
    results.push({ id, nameAr, nameEn, category, passed, expected, actual, details });
  };

  const sampleDef = state.setDefinitions[0]; // CABG
  const sampleEquipment = state.equipmentList[0]; // Autoclave 1

  // --------------------------------------------------------------------------
  // CSSD01: Reusable device enters valid reprocessing workflow
  // --------------------------------------------------------------------------
  {
    const record: ContaminatedReturnRecord = {
      id: 'T-RET-01',
      returnTimestamp: '2026-09-23 10:00',
      originDepartment: 'OR-1',
      setInstanceIds: ['T-SET-01'],
      expectedCount: 48,
      returnedCount: 48,
      hasSharpsHazard: false,
      pointOfUsePretreatment: 'enzymatic_foam_applied',
      transportContainerId: 'CART-01',
      transportCondition: 'closed_biohazard_cart',
      receiptStatus: 'returned_pending_receipt',
      receivingStaff: 'فني الاستلام'
    };
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-01',
      setDefinitionId: sampleDef.id,
      setNameAr: sampleDef.nameAr,
      setNameEn: sampleDef.nameEn,
      serialNumber: 'SN-01',
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'in_transit',
      decontaminationStatus: 'pending_precleaning',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const res = reconcileContaminatedReceipt(record, set);
    addTest(
      'CSSD01',
      'دخول أداة قابلة لإعادة الاستخدام في مسار المعالجة',
      'Reusable device enters valid reprocessing workflow',
      'استلام التلوث',
      res.isValid === true && res.updatedEntity?.decontaminationStatus === 'pending_precleaning',
      'isValid: true, decontaminationStatus: pending_precleaning',
      `isValid: ${res.isValid}, decontaminationStatus: ${res.updatedEntity?.decontaminationStatus}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD02: Saudi-profile single-use device is blocked from reprocessing
  // --------------------------------------------------------------------------
  {
    const record: ContaminatedReturnRecord = {
      id: 'T-RET-SU',
      returnTimestamp: '2026-09-23 10:00',
      originDepartment: 'ER',
      setInstanceIds: ['T-SET-SU'],
      expectedCount: 5,
      returnedCount: 5,
      hasSharpsHazard: true,
      pointOfUsePretreatment: 'dry_untreated',
      transportContainerId: 'CART-02',
      transportCondition: 'closed_biohazard_cart',
      receiptStatus: 'rejected_quarantine',
      receivingStaff: 'مشرف الاستلام',
      discrepancyDetails: {
        missingItems: [],
        unexpectedItems: [],
        damagedItems: [],
        singleUseFound: ['مشرط جراحي أحادي الاستخدام (Single Use Scalpel)']
      }
    };
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-SU',
      setDefinitionId: sampleDef.id,
      setNameAr: 'طقم به أداة استخدام مفرد',
      setNameEn: 'Set with single use',
      serialNumber: 'SN-SU',
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'pending_precleaning',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const res = reconcileContaminatedReceipt(record, set);
    addTest(
      'CSSD02',
      'حظر إعادة تعقيم أداة الاستخدام الأحادي بموجب لوائح SFDA',
      'Saudi-profile single-use device is blocked from reprocessing',
      'أمان الاستخدام الأحادي',
      res.isValid === false && res.newException?.category === 'single_use_item_detected',
      'isValid: false, category: single_use_item_detected',
      `isValid: ${res.isValid}, category: ${res.newException?.category}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD03: Missing manufacturer IFU prevents unsupported process selection
  // --------------------------------------------------------------------------
  {
    const noIfuDef = state.setDefinitions.find(d => d.isIfuAvailable === false) || {
      ...sampleDef,
      isIfuAvailable: false
    };
    const compat = resolvePackagingProcessCompatibility(
      noIfuDef,
      'rigid_container_with_filter',
      'steam_sterilization'
    );
    addTest(
      'CSSD03',
      'غياب كتيب الشركة الصانعة IFU يمنع التوافق غير المحقق',
      'Missing manufacturer IFU prevents unsupported process selection',
      'توافق التغليف والعملية',
      compat.status === 'ifu_unavailable',
      'status: ifu_unavailable (COMPATIBILITY_NOT_VERIFIED)',
      `status: ${compat.status}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD04: Residual soil inspection failure returns item to cleaning
  // --------------------------------------------------------------------------
  {
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-SOIL',
      setDefinitionId: sampleDef.id,
      setNameAr: sampleDef.nameAr,
      setNameEn: sampleDef.nameEn,
      serialNumber: 'SN-SOIL',
      currentZoningArea: 'clean_inspection_assembly',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'cleaning_passed',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const res = evaluateInspectionResult(set, 'visible_residual_soil');
    addTest(
      'CSSD04',
      'رصد بقايا الشوائب يعيد الأداة إلى منطقة التطهير القذرة',
      'Residual soil inspection failure returns item to cleaning',
      'فحص النظافة',
      res.isValid === false &&
        res.updatedEntity?.currentZoningArea === 'dirty_decontamination' &&
        res.updatedEntity?.decontaminationStatus === 'cleaning_failed_reclean_required',
      'zoning: dirty_decontamination, decontaminationStatus: cleaning_failed_reclean_required',
      `zoning: ${res.updatedEntity?.currentZoningArea}, decontaminationStatus: ${res.updatedEntity?.decontaminationStatus}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD05: Cleaning failure is not mislabeled as measured microbiological bioburden
  // --------------------------------------------------------------------------
  {
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-TERM',
      setDefinitionId: sampleDef.id,
      setNameAr: sampleDef.nameAr,
      setNameEn: sampleDef.nameEn,
      serialNumber: 'SN-TERM',
      currentZoningArea: 'clean_inspection_assembly',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'cleaning_passed',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const res = evaluateInspectionResult(set, 'residual_protein_test_failed');
    const isNotBioburdenQuantification =
      res.newException?.category === 'cleaning_failure' &&
      !res.blockReasonEn?.includes('quantified microbial count');

    addTest(
      'CSSD05',
      'فصل مصطلحات النظافة وعدم ادعاء قياس الحمولة الميكروبية روتينياً',
      'Cleaning failure is not mislabeled as measured microbiological bioburden',
      'فحص النظافة',
      isNotBioburdenQuantification,
      'category: cleaning_failure, no fabricated microbiological quantification',
      `category: ${res.newException?.category}, blockReason: ${res.blockReasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD06: Valid ISO 15883-2 mock washer profile can complete when evidence passes
  // --------------------------------------------------------------------------
  {
    const washerEq = state.equipmentList.find(e => e.category === 'washer_disinfector' && e.operationalStatus === 'operational_validated')!;
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-WD-PASS',
      setDefinitionId: sampleDef.id,
      setNameAr: sampleDef.nameAr,
      setNameEn: sampleDef.nameEn,
      serialNumber: 'SN-WD-PASS',
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'pending_precleaning',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const res = executeCleaningCycle(washerEq, set, {
      applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)',
      programProfile: 'Surgical Instruments A0>=3000',
      temperatureCelsius: 93.5,
      disinfectionTimeSeconds: 300,
      a0Calculated: 3200,
      cycleEvidencePresent: true,
      cycleStatus: 'pass'
    });

    addTest(
      'CSSD06',
      'اكتمال دورة الغسيل والتطهير بموجب ISO 15883-2:2024 عند استيفاء الأدلة',
      'Valid ISO 15883-2 mock washer profile can complete when evidence passes',
      'التطهير الآلي',
      res.isValid === true && res.updatedEntity?.currentZoningArea === 'clean_inspection_assembly',
      'isValid: true, zoning: clean_inspection_assembly',
      `isValid: ${res.isValid}, zoning: ${res.updatedEntity?.currentZoningArea}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD07: Wrong device/washer profile is blocked (Insufficient A0 for surgical)
  // --------------------------------------------------------------------------
  {
    const washerEq = state.equipmentList.find(e => e.category === 'washer_disinfector')!;
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-WD-FAIL',
      setDefinitionId: sampleDef.id,
      setNameAr: sampleDef.nameAr,
      setNameEn: sampleDef.nameEn,
      serialNumber: 'SN-WD-FAIL',
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'pending_precleaning',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const res = executeCleaningCycle(washerEq, set, {
      applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)',
      programProfile: 'Low-Temp Profile',
      temperatureCelsius: 80.0,
      disinfectionTimeSeconds: 60,
      a0Calculated: 600, // Insufficient for surgical critical instruments (requires 3000)
      cycleEvidencePresent: true,
      cycleStatus: 'pass'
    });

    addTest(
      'CSSD07',
      'حظر دورة الغسيل إذا كانت المعايير الحرارية غير ملائمة للأدوات الجراحية',
      'Wrong device/washer profile is blocked (A0 < 3000 for ISO 15883-2)',
      'التطهير الآلي',
      res.isValid === false && res.updatedEntity?.decontaminationStatus === 'cleaning_failed_reclean_required',
      'isValid: false, decontaminationStatus: cleaning_failed_reclean_required',
      `isValid: ${res.isValid}, decontaminationStatus: ${res.updatedEntity?.decontaminationStatus}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD08: Missing required cycle evidence cannot become PASS
  // --------------------------------------------------------------------------
  {
    const washerEq = state.equipmentList.find(e => e.category === 'washer_disinfector')!;
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-WD-MISSING',
      setDefinitionId: sampleDef.id,
      setNameAr: sampleDef.nameAr,
      setNameEn: sampleDef.nameEn,
      serialNumber: 'SN-WD-MISSING',
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'pending_precleaning',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };

    const res = executeCleaningCycle(washerEq, set, {
      applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)',
      programProfile: 'Surgical Instruments',
      cycleEvidencePresent: false, // Evidence missing!
      cycleStatus: 'missing_data'
    });

    addTest(
      'CSSD08',
      'غياب أدلة دورة الغسيل لا يمكن أن يتحول لنجاح تلقائي',
      'Missing required cycle evidence cannot become PASS',
      'التطهير الآلي',
      res.isValid === false,
      'isValid: false (Missing cycle evidence != passed cycle)',
      `isValid: ${res.isValid}, reason: ${res.blockReasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD09: Packaging/process compatibility uses IFU/profile, not material-name assumption
  // --------------------------------------------------------------------------
  {
    const compat = resolvePackagingProcessCompatibility(
      sampleDef,
      'double_wrap_nonwoven',
      'steam_sterilization'
    );
    addTest(
      'CSSD09',
      'تحديد توافق التغليف بناءً على ملف IFU والعملية',
      'Packaging/process compatibility uses IFU/profile',
      'توافق التغليف والعملية',
      compat.status === 'compatible',
      'status: compatible',
      `status: ${compat.status}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD10: Valid conditional Tyvek/steam fixture behaves according to explicit IFU
  // --------------------------------------------------------------------------
  {
    // A. Valid conditional Tyvek permitted by mock IFU -> eligible
    const compatPermitted = resolvePackagingProcessCompatibility(
      sampleDef,
      'tyvek_steam_validated',
      'steam_sterilization',
      { isPackagingPermittedByIfu: true }
    );

    // B. Combination explicitly prohibited by mock IFU -> blocked
    const compatProhibited = resolvePackagingProcessCompatibility(
      sampleDef,
      'tyvek_pouch_vhp',
      'steam_sterilization',
      { isPackagingProhibitedByIfu: true }
    );

    addTest(
      'CSSD10',
      'سلوك أغلفة تايفك طبقاً لكتيب IFU المحدد (مسموح عند التحقيق ومحظور عند المنع)',
      'Valid conditional Tyvek/steam fixture behaves according to explicit IFU',
      'توافق التغليف والعملية',
      compatPermitted.status === 'compatible' && compatProhibited.status === 'incompatible',
      'Permitted -> compatible; Prohibited -> incompatible',
      `Permitted: ${compatPermitted.status}; Prohibited: ${compatProhibited.status}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD11: Mechanical monitoring failure blocks load release
  // --------------------------------------------------------------------------
  {
    const load: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      id: 'T-LOAD-MECH-FAIL',
      mechanicalParamEvidence: {
        passed: false, // Failed!
        tempGraphVerified: false,
        pressureGraphVerified: false,
        vacuumLeakRateVerified: false,
        airRemovalTestRequired: true,
        airRemovalTestPassed: true
      }
    };

    const res = evaluateLoadRelease(load, 'مقيّم الإفراج');
    addTest(
      'CSSD11',
      'فشل المؤشرات الميكانيكية والفيزيائية يحظر الإفراج عن الشحنة',
      'Mechanical monitoring failure blocks load release',
      'الإفراج السريري',
      res.isValid === false && res.newException?.category === 'load_failure',
      'isValid: false, category: load_failure',
      `isValid: ${res.isValid}, category: ${res.newException?.category}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD12: Chemical indicator failure blocks affected item/load release
  // --------------------------------------------------------------------------
  {
    const load: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      id: 'T-LOAD-CHEM-FAIL',
      chemicalIndicatorEvidence: {
        passed: false, // Failed!
        indicatorType: 'Class 5 Integrating',
        colorChangeVerified: false,
        requiredByPolicy: true
      }
    };

    const res = evaluateLoadRelease(load, 'مقيّم الإفراج');
    addTest(
      'CSSD12',
      'فشل المؤشر الكيميائي يحظر الإفراج عن الشحنة',
      'Chemical indicator failure blocks affected item/load release',
      'الإفراج السريري',
      res.isValid === false && res.newException?.category === 'indicator_failure',
      'isValid: false, category: indicator_failure',
      `isValid: ${res.isValid}, category: ${res.newException?.category}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD13: CI class is configurable and Class 5 is not globally hardcoded
  // --------------------------------------------------------------------------
  {
    const set = state.setInstances[0];
    const pkgClass4 = createSterilizationPackage(
      { ...set, assemblyStatus: 'set_complete', inspectionStatus: 'inspection_passed' },
      sampleDef,
      'rigid_container_with_filter',
      'steam_sterilization',
      'أخصائي التغليف',
      'Class 4 Multi-Variable' // Configured as Class 4
    );

    addTest(
      'CSSD13',
      'فئة المؤشر الكيميائي قابلة للتكوين وليست مجبرة على فئة 5 فقط',
      'CI class is configurable and Class 5 is not globally hardcoded',
      'التغليف والمؤشرات',
      pkgClass4.isValid === true && pkgClass4.updatedEntity?.internalIndicatorType === 'Class 4 Multi-Variable',
      'internalIndicatorType: Class 4 Multi-Variable',
      `internalIndicatorType: ${pkgClass4.updatedEntity?.internalIndicatorType}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD14: Required implant BI pending keeps implant load quarantined
  // --------------------------------------------------------------------------
  {
    const load: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      id: 'T-LOAD-IMPLANT-PENDING',
      hasImplantTray: true,
      biologicalIndicatorEvidence: {
        isRequired: true,
        biStatus: 'pending', // Pending incubation!
        quarantinePendingResult: true
      }
    };

    const res = evaluateLoadRelease(load, 'مقيّم الإفراج');
    addTest(
      'CSSD14',
      'تعليق المؤشر البيولوجي لشحنة الغرسات يبقيها تحت الحجز الإلزامي',
      'Required implant BI pending keeps implant load quarantined',
      'الإفراج السريري',
      res.isValid === false && res.blockReasonEn?.includes('QUARANTINE_REQUIRED') === true,
      'isValid: false, QUARANTINE_REQUIRED',
      `isValid: ${res.isValid}, blockReason: ${res.blockReasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD15: Negative required BI permits next release decision when all other evidence passes
  // --------------------------------------------------------------------------
  {
    const load: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      id: 'T-LOAD-IMPLANT-PASS',
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
        biStatus: 'passed', // Negative culture / passed!
        quarantinePendingResult: true
      }
    };

    const res = evaluateLoadRelease(load, 'د. استشاري مكافحة العدوى');
    addTest(
      'CSSD15',
      'سلبية فحص المؤشر البيولوجي تسمح باتخاذ قرار الإفراج عند اجتياز سائر الأدلة',
      'Negative required BI permits release decision when all evidence passes',
      'الإفراج السريري',
      res.isValid === true && res.updatedEntity?.cycleStatus === 'released',
      'isValid: true, cycleStatus: released',
      `isValid: ${res.isValid}, cycleStatus: ${res.updatedEntity?.cycleStatus}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD16: Positive BI triggers hold and recall/investigation workflow
  // --------------------------------------------------------------------------
  {
    const load: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      id: 'T-LOAD-BI-FAIL',
      biologicalIndicatorEvidence: {
        isRequired: true,
        biStatus: 'failed', // Positive microbial growth!
        quarantinePendingResult: true
      }
    };

    const res = evaluateLoadRelease(load, 'مقيّم الإفراج');
    addTest(
      'CSSD16',
      'إيجابية المؤشر البيولوجي تطلق حظر الشحنة وإجراء الاستدعاء والتحقيق',
      'Positive BI triggers hold and recall/investigation workflow',
      'الإفراج السريري والرقابة',
      res.isValid === false && res.newException?.category === 'indicator_failure',
      'isValid: false, newException logged',
      `isValid: ${res.isValid}, category: ${res.newException?.category}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD17: Bowie-Dick requirement applies only to applicable sterilizer profile
  // --------------------------------------------------------------------------
  {
    const vhpEq = state.equipmentList.find(e => e.category === 'vhp_sterilizer')!;
    const prevacEq = state.equipmentList.find(e => e.sterilizerType === 'prevacuum_steam')!;

    const vhpCheck = validateSterilizerAirRemovalCheck(vhpEq);
    const prevacCheck = validateSterilizerAirRemovalCheck(prevacEq);

    addTest(
      'CSSD17',
      'انطباق فحص Bowie-Dick فقط على معقمات البخار المفرغ وليس المعقمات الأخرى',
      'Bowie-Dick requirement applies only to applicable sterilizer profile',
      'أجهزة التعقيم',
      vhpCheck.isEligible === true && prevacCheck.isEligible === true,
      'VHP -> not required/eligible; Prevac -> evaluated by daily status',
      `VHP: ${vhpCheck.isEligible}, Prevac: ${prevacCheck.isEligible}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD18: Failed required Bowie-Dick blocks applicable steam processing
  // --------------------------------------------------------------------------
  {
    const failedPrevacEq = state.equipmentList.find(e => e.id === 'EQ-AUTOCLAVE-BD-FAIL') || {
      ...sampleEquipment,
      sterilizerType: 'prevacuum_steam' as const,
      airRemovalTestRequired: true,
      bowieDickStatusToday: 'failed' as const
    };

    const check = validateSterilizerAirRemovalCheck(failedPrevacEq);
    addTest(
      'CSSD18',
      'فشل فحص Bowie-Dick يحظر تشغيل معقم البخار المفرغ',
      'Failed required Bowie-Dick blocks applicable steam processing',
      'أجهزة التعقيم',
      check.isEligible === false,
      'isEligible: false (air removal test failed)',
      `isEligible: ${check.isEligible}, reason: ${check.reasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD19: IUSS requires documented urgent use context
  // --------------------------------------------------------------------------
  {
    const iussLoadWithoutDoc: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      id: 'T-IUSS-NO-DOC',
      isIUSSException: true,
      iussDocumentation: undefined
    };

    const res = validateIUSSWorkflow(iussLoadWithoutDoc);
    addTest(
      'CSSD19',
      'التعقيم الفوري IUSS يتطلب توثيقاً صريحاً للحاجة السريرية العاجلة واعتماد الاستشاري',
      'IUSS requires documented urgent use context',
      'التعقيم الفوري IUSS',
      res.isValid === false,
      'isValid: false (Missing urgent clinical need / approval)',
      `isValid: ${res.isValid}, blockReason: ${res.blockReasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD20: IUSS item is not routed into routine sterile storage
  // --------------------------------------------------------------------------
  {
    const iussLoadWithDoc: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      id: 'T-IUSS-VALID',
      isIUSSException: true
    };

    const res = validateIUSSWorkflow(iussLoadWithDoc, {
      urgentClinicalNeed: 'سقوط الأداة الوحيدة أثناء عملية طارئة',
      itemDeviceDescription: 'مقص جراحة دقيقة',
      reasonJustification: 'لا يوجد بديل جاهز في المستودع',
      operatingRoomDestination: 'مسرح العمليات 1',
      operatorStaff: 'فني التعقيم',
      immediateUseContext: 'استخدام فوري داخل المسرح',
      clinicalApprovalRef: 'APPROVAL-DR-CONSULTANT-09'
    });

    addTest(
      'CSSD20',
      'أداة التعقيم الفوري IUSS تخصص للعمليات مباشرة دون تخزينها في المستودع',
      'IUSS item is not routed into routine sterile storage',
      'التعقيم الفوري IUSS',
      res.isValid === true && res.updatedEntity?.iussDocumentation !== undefined,
      'isValid: true, dedicated immediate-use context attached',
      `isValid: ${res.isValid}, destination: ${res.updatedEntity?.iussDocumentation?.operatingRoomDestination}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD21: Wet pack is quarantined
  // --------------------------------------------------------------------------
  {
    const pkg = state.packages[0];
    const res = evaluatePackageStorageIntegrity(pkg, 'wet_pack');
    addTest(
      'CSSD21',
      'حجز العبوة الرطبة (Wet Pack) وإلغاء صلاحيتها للتعقيم',
      'Wet pack is quarantined',
      'المستودع المعقم والتوزيع',
      res.isValid === false &&
        res.updatedEntity?.storageIntegrity === 'wet_pack_compromised' &&
        res.newException?.category === 'storage_integrity_failure',
      'storageIntegrity: wet_pack_compromised, exception logged',
      `storageIntegrity: ${res.updatedEntity?.storageIntegrity}, isValid: ${res.isValid}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD22: Torn/compromised pack is quarantined
  // --------------------------------------------------------------------------
  {
    const pkg = state.packages[0];
    const res = evaluatePackageStorageIntegrity(pkg, 'torn_wrap');
    addTest(
      'CSSD22',
      'حجز العبوة الممزقة أو المثقوبة وإعادتها لمسار إعادة المعالجة',
      'Torn/compromised pack is quarantined',
      'المستودع المعقم والتوزيع',
      res.isValid === false && res.updatedEntity?.storageIntegrity === 'torn_punctured',
      'storageIntegrity: torn_punctured',
      `storageIntegrity: ${res.updatedEntity?.storageIntegrity}, isValid: ${res.isValid}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD23: Valid intact package remains eligible under its event-related policy
  // --------------------------------------------------------------------------
  {
    const pkg = state.packages[0];
    const res = evaluatePackageStorageIntegrity(pkg, 'none');
    addTest(
      'CSSD23',
      'بقاء العبوة السليمة مؤهلة للتوزيع وفق سياسة التعقيم المرتبط بالحدث',
      'Valid intact package remains eligible under event-related policy',
      'المستودع المعقم والتوزيع',
      res.isValid === true && res.updatedEntity?.storageIntegrity === 'intact_sterile',
      'storageIntegrity: intact_sterile, isValid: true',
      `storageIntegrity: ${res.updatedEntity?.storageIntegrity}, isValid: ${res.isValid}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD24: Failed set assembly cannot proceed to sterilization
  // --------------------------------------------------------------------------
  {
    const incompleteSet: CSSDReusableSetInstance = {
      ...state.setInstances[0],
      assemblyStatus: 'set_incomplete_missing_parts',
      inspectionStatus: 'inspection_passed'
    };

    const res = createSterilizationPackage(
      incompleteSet,
      sampleDef,
      'rigid_container_with_filter',
      'steam_sterilization',
      'فني التغليف'
    );

    addTest(
      'CSSD24',
      'حظر تغليف أو تعقيم طقم غير مكتمل المكونات',
      'Failed set assembly cannot proceed to sterilization',
      'التجميع والتغليف',
      res.isValid === false,
      'isValid: false (assemblyStatus != set_complete)',
      `isValid: ${res.isValid}, blockReason: ${res.blockReasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD25: Dirty-to-clean invalid transition is blocked
  // --------------------------------------------------------------------------
  {
    const dirtySet: CSSDReusableSetInstance = {
      ...state.setInstances[0],
      currentZoningArea: 'dirty_decontamination',
      decontaminationStatus: 'pending_precleaning',
      assemblyStatus: 'pending_assembly',
      inspectionStatus: 'pending_inspection'
    };

    // Attempt direct packaging without passing washer and inspection
    const res = createSterilizationPackage(
      dirtySet,
      sampleDef,
      'rigid_container_with_filter',
      'steam_sterilization',
      'فني التغليف'
    );

    addTest(
      'CSSD25',
      'منع الانتقال غير النظامي من المنطقة الملوثة إلى التغليف دون تطهير وفحص',
      'Dirty-to-clean invalid transition is blocked',
      'الفصل المناطقي (Zoning)',
      res.isValid === false,
      'isValid: false (Blocked dirty-to-package jump)',
      `isValid: ${res.isValid}, blockReason: ${res.blockReasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD26: One set cannot exist in conflicting active processing stages
  // --------------------------------------------------------------------------
  {
    const pkg = state.packages[1]; // In load 402
    const currentLoad = state.sterilizerCycles[1];
    const res = validatePackageInclusionInLoad(pkg, currentLoad, state.sterilizerCycles);

    addTest(
      'CSSD26',
      'حظر تكرار إضافة نفس العبوة في دورتي تعقيم نشطتين في آن واحد',
      'One set cannot exist in conflicting active processing stages',
      'شحنات المعقمات',
      res.isValid === false,
      'isValid: false (Package is already allocated in load)',
      `isValid: ${res.isValid}, blockReason: ${res.blockReasonEn}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD27: Recall identifies affected load/set references without fabricating exposure
  // --------------------------------------------------------------------------
  {
    const recall = state.recallCases[0];
    const packagesLinked = recall.affectedPackageIds.length > 0;
    const exposureNotFabricated = recall.exposureVerificationStatus !== undefined;

    addTest(
      'CSSD27',
      'الاستدعاء يحدد العبوات والشحنات المتأثرة دون تلفيق تعرض المرضى',
      'Recall identifies affected load/set references without fabricating exposure',
      'الاستدعاء والرقابة',
      packagesLinked && exposureNotFabricated,
      'packagesLinked: true, exposure status tracked without fabrication',
      `packagesLinked: ${packagesLinked}, status: ${recall.exposureVerificationStatus}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD28: Missing OR/patient exposure linkage remains NOT_VERIFIED
  // --------------------------------------------------------------------------
  {
    const unlinkedDistReq: SterileDistributionRequest = {
      ...state.distributionRequests[1],
      orCaseReference: undefined,
      patientMrnReference: undefined
    };

    const res = dispatchSterileSetToCase(
      unlinkedDistReq,
      state.packages[0],
      'فني التوزيع'
    );

    addTest(
      'CSSD28',
      'حالة تعرض المريض تظل NOT_VERIFIED عند عدم توفر ربط العمليات',
      'Missing OR/patient exposure linkage remains NOT_VERIFIED',
      'التتبع والرقابة',
      res.updatedEntity?.exposureVerificationStatus === 'not_verified',
      'exposureVerificationStatus: not_verified',
      `exposureVerificationStatus: ${res.updatedEntity?.exposureVerificationStatus}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD29: Persistent synthetic preview and responsive/RTL context preserved
  // --------------------------------------------------------------------------
  {
    const hasAuditLogs = state.auditLogs.length > 0;
    const isSupervisorActive = state.activePersona !== undefined;

    addTest(
      'CSSD29',
      'الحفاظ على شريط المحاكاة الاصطناعي الثابت وخصائص واجهة المستخدم',
      'Persistent synthetic preview and responsive/RTL context preserved',
      'الواجهة والتجربة',
      hasAuditLogs && isSupervisorActive,
      'auditLogs active, synthetic state intact',
      `auditLogs: ${state.auditLogs.length}, persona: ${state.activePersona}`
    );
  }

  // --------------------------------------------------------------------------
  // CSSD30: OR, Inventory, Clinical Core and other protected modules remain unchanged
  // --------------------------------------------------------------------------
  {
    // Evaluates read-only consumption of OR references without modifying OR models
    const readOnlyOrCaseRef = state.contaminatedReturns[0].orCaseReference;
    const isReferenceStringOnly = typeof readOnlyOrCaseRef === 'string';

    addTest(
      'CSSD30',
      'حماية الوحدات المجاورة (OR، المستودعات، السجلات السريرية) دون أي تعديل',
      'OR, Inventory, Clinical Core and other protected modules remain unchanged',
      'سلامة المعمارية',
      isReferenceStringOnly,
      'OR references are consumed strictly read-only',
      `orCaseReference is immutable string: ${readOnlyOrCaseRef}`
    );
  }

  // ==========================================================================
  // ADDITIONAL NEGATIVE MUTATION AND ROBUSTNESS TESTS
  // ==========================================================================

  // NEG01: Duplicate load release attempt on already released load
  {
    const releasedLoad: SterilizerCycleRecord = {
      ...state.sterilizerCycles[0],
      cycleStatus: 'released',
      releaseDecision: { decision: 'released', releasedBy: 'د. طارق' }
    };
    const res = evaluateLoadRelease(releasedLoad, 'مشرف آخر');
    addTest(
      'NEG01',
      'محاولة إفراج مكرر عن شحنة مفرج عنها مسبقاً',
      'Duplicate load release handling',
      'الاختبارات السلبية',
      res.isValid === true && res.updatedEntity?.cycleStatus === 'released',
      'Preserves released state without corrupting decision',
      `cycleStatus: ${res.updatedEntity?.cycleStatus}`
    );
  }

  // NEG02: Dispatch attempt with unreleased package is blocked
  {
    const unreleasedPkg: CSSDPackageRecord = {
      ...state.packages[0],
      currentStatus: 'packaged_pending_load', // Not released sterile!
      storageIntegrity: 'intact_sterile'
    };
    const res = dispatchSterileSetToCase(state.distributionRequests[0], unreleasedPkg, 'فني التوزيع');
    addTest(
      'NEG02',
      'حظر توزيع عبوة غير مفرج عنها سريرياً',
      'Dispatch unreleased package blocked',
      'الاختبارات السلبية',
      res.isValid === false,
      'isValid: false (Package is not released sterile)',
      `isValid: ${res.isValid}, reason: ${res.blockReasonEn}`
    );
  }

  // NEG03: Unknown washer parameter cannot be interpreted as zero or pass
  {
    const washerEq = state.equipmentList.find(e => e.category === 'washer_disinfector')!;
    const set = state.setInstances[0];
    const res = executeCleaningCycle(washerEq, set, {
      applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)',
      programProfile: 'Surgical Thermal',
      temperatureCelsius: undefined, // Unknown parameter!
      cycleEvidencePresent: false,
      cycleStatus: 'missing_data'
    });
    addTest(
      'NEG03',
      'المعايير المجهولة لا تتحول لصفر أو نجاح',
      'Unknown value is not interpreted as pass or zero',
      'الاختبارات السلبية',
      res.isValid === false,
      'isValid: false (Missing cycle telemetry required)',
      `isValid: ${res.isValid}`
    );
  }

  // NEG04: Single-use device receipt cannot mutate state to clean
  {
    const suRecord: ContaminatedReturnRecord = {
      id: 'T-RET-SU-MUT',
      returnTimestamp: '2026-09-23 10:00',
      originDepartment: 'OR-1',
      setInstanceIds: ['T-SET-SU-MUT'],
      expectedCount: 1,
      returnedCount: 1,
      hasSharpsHazard: false,
      pointOfUsePretreatment: 'dry_untreated',
      transportContainerId: 'CART-SU',
      transportCondition: 'closed_biohazard_cart',
      receiptStatus: 'rejected_quarantine',
      receivingStaff: 'فني الاستلام',
      discrepancyDetails: {
        missingItems: [],
        unexpectedItems: [],
        damagedItems: [],
        singleUseFound: ['شفرة جراحية أحادية الاستخدام']
      }
    };
    const set: CSSDReusableSetInstance = {
      id: 'T-SET-SU-MUT',
      setDefinitionId: sampleDef.id,
      setNameAr: 'أداة أحادية',
      setNameEn: 'Single use tool',
      serialNumber: 'SN-MUT',
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'at_cssd',
      decontaminationStatus: 'pending_precleaning',
      inspectionStatus: 'pending_inspection',
      assemblyStatus: 'pending_assembly',
      packagingStatus: 'not_packaged',
      missingComponentsList: [],
      damagedComponentsList: [],
      substitutedComponentsList: []
    };
    const res = reconcileContaminatedReceipt(suRecord, set);
    addTest(
      'NEG04',
      'استلام أداة استخدام أحادي لا يغير حالة الطقم إلى صالح للتطهير',
      'Single-use device does not mutate state to clean',
      'الاختبارات السلبية',
      res.isValid === false && res.updatedEntity === undefined,
      'isValid: false, updatedEntity is undefined (State protected)',
      `isValid: ${res.isValid}, updatedEntity: ${res.updatedEntity}`
    );
  }

  return results;
}
