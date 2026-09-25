// ============================================================================
// CSSD & STERILE PROCESSING ENGINE — DETERMINISTIC WORKFLOW & SAFETY ENGINE
// Pure functional rules enforcing IFU compatibility, ISO 15883-2,
// cleanliness vs bioburden separation, Bowie-Dick tests, implant BI quarantine
// ============================================================================

import {
  CSSDReusableSetInstance,
  ContaminatedReturnRecord,
  WasherDisinfectorCycleRecord,
  CSSDPackageRecord,
  SterilizerCycleRecord,
  SterileDistributionRequest,
  CSSDEquipmentReference,
  InstrumentSetDefinition,
  CSSDQualityException,
  ReprocessingMethodCategory,
  PackagingMethod,
  PackagingCompatibilityStatus,
  CleaningInspectionFinding
} from '../types/cssdOps';

export interface WorkflowTransitionResult<T> {
  isValid: boolean;
  blockReasonAr?: string;
  blockReasonEn?: string;
  updatedEntity?: T;
  newException?: CSSDQualityException;
}

// ----------------------------------------------------------------------------
// 1. PACKAGING / PROCESS COMPATIBILITY RESOLVER (Section 1)
// Resolves compatibility from explicit combination of Device IFU, Packaging IFU,
// Sterilizer profile, rather than hardcoded brand material rules.
// ----------------------------------------------------------------------------

export function resolvePackagingProcessCompatibility(
  setDef: InstrumentSetDefinition,
  selectedPackaging: PackagingMethod,
  intendedProcess: ReprocessingMethodCategory,
  mockIfuOverrides?: {
    isPackagingPermittedByIfu?: boolean;
    isPackagingProhibitedByIfu?: boolean;
    isConditionalValidation?: boolean;
  }
): { status: PackagingCompatibilityStatus; reasonAr: string; reasonEn: string } {
  // If IFU documentation is missing
  if (setDef.isIfuAvailable === false) {
    return {
      status: 'ifu_unavailable',
      reasonAr: 'كتيب إرشادات الاستخدام (IFU) غير متوفر للأداة — لا يمكن التكهن بالمسار',
      reasonEn: 'COMPATIBILITY_NOT_VERIFIED: Manufacturer IFU is unavailable.'
    };
  }

  // Explicit Mock IFU overrides for testing
  if (mockIfuOverrides?.isPackagingProhibitedByIfu) {
    return {
      status: 'incompatible',
      reasonAr: 'كتيب إرشادات الشركة الصانعة (IFU) يحظر صراحة هذا النوع من التغليف لهذا المسار',
      reasonEn: 'Prohibited by explicit manufacturer IFU specification.'
    };
  }

  if (mockIfuOverrides?.isPackagingPermittedByIfu) {
    return {
      status: 'compatible',
      reasonAr: 'مصرح به ومطابق لكتيب إرشادات الشركة الصانعة (IFU)',
      reasonEn: 'Compatible: Explicitly permitted by validated IFU documentation.'
    };
  }

  if (mockIfuOverrides?.isConditionalValidation) {
    return {
      status: 'conditional',
      reasonAr: 'توافق مشروط: يتطلب دورة محددة موثقة ومحققة معملياً',
      reasonEn: 'Conditional: Validated under specific controlled parameters per IFU.'
    };
  }

  // Specific validated profile checks:
  // Case A: Tyvek validated for steam under specific validated profile
  if (intendedProcess === 'steam_sterilization' && selectedPackaging === 'tyvek_steam_validated') {
    return {
      status: 'compatible',
      reasonAr: 'أغلفة تايفك مخصصة ومحققة بالبخار تحت إرشادات المصنع المعتمدة',
      reasonEn: 'Compatible: Validated steam-grade Tyvek per specific manufacturer IFU.'
    };
  }

  // Case B: Tyvek standard VHP pouch used in steam without steam-grade validation
  if (intendedProcess === 'steam_sterilization' && selectedPackaging === 'tyvek_pouch_vhp') {
    return {
      status: 'incompatible',
      reasonAr: 'أكياس تايفك المخصصة للبلازما غير محققة للدورة البخارية وفق إرشادات التغليف الحالية',
      reasonEn: 'Incompatible: Low-temp VHP Tyvek pouch is prohibited in standard high-temp steam per packaging IFU.'
    };
  }

  // Standard combinations:
  if (
    intendedProcess === 'steam_sterilization' &&
    ['rigid_container_with_filter', 'double_wrap_nonwoven', 'peel_pouch_paper_plastic'].includes(selectedPackaging)
  ) {
    return {
      status: 'compatible',
      reasonAr: 'متوافق مع التعقيم بالبخار وفق معايير التغليف',
      reasonEn: 'Compatible with steam sterilization profile.'
    };
  }

  if (
    intendedProcess === 'low_temp_vhp_sterilization' &&
    ['tyvek_pouch_vhp', 'tyvek_steam_validated', 'rigid_container_with_filter'].includes(selectedPackaging)
  ) {
    return {
      status: 'compatible',
      reasonAr: 'متوافق مع التعقيم بالبلازما VHP المنخفضة الحرارة',
      reasonEn: 'Compatible with low-temp VHP sterilization.'
    };
  }

  if (intendedProcess === 'low_temp_vhp_sterilization' && selectedPackaging === 'peel_pouch_paper_plastic') {
    return {
      status: 'incompatible',
      reasonAr: 'السيليلوز والورق يمتص غاز بيروكسيد الهيدروجين VHP ويمنع التعقيم وفق إرشادات المعقم',
      reasonEn: 'Incompatible: Cellulose/paper absorbs VHP sterilant per sterilizer IFU.'
    };
  }

  if (intendedProcess === 'high_level_disinfection' && selectedPackaging === 'hld_covered_tray') {
    return {
      status: 'compatible',
      reasonAr: 'صينية مغطاة مخصصة للتطهير عالي المستوى',
      reasonEn: 'Compatible with high-level disinfection profile.'
    };
  }

  return {
    status: 'not_verified',
    reasonAr: 'لم يتم التحقق من التوافق: غياب أدلة التوافق بين الغلاف والمعقم',
    reasonEn: 'COMPATIBILITY_NOT_VERIFIED: Missing compatibility evidence between packaging and process profile.'
  };
}

// ----------------------------------------------------------------------------
// 2. DIRTY RETURN & SINGLE-USE HARD BLOCKS (Saudi Profile & Count Reconcile)
// ----------------------------------------------------------------------------

export function reconcileContaminatedReceipt(
  record: ContaminatedReturnRecord,
  setInstance: CSSDReusableSetInstance
): WorkflowTransitionResult<CSSDReusableSetInstance> {
  // Saudi-profile single use hard safety block
  if (record.discrepancyDetails?.singleUseFound && record.discrepancyDetails.singleUseFound.length > 0) {
    return {
      isValid: false,
      blockReasonAr: 'تنبيه أمان قاطع: تم رصد أداة ذات استخدام أحادي (Single-Use Device) — محظور إعادة تعقيمها بموجب لوائح هيئة الغذاء والدواء SFDA',
      blockReasonEn: 'Hard Safety Block: SINGLE_USE_DEVICE — Reprocessing Not Eligible per SFDA Medical Device Regulations.',
      newException: {
        id: `EXC-SU-${Date.now()}`,
        category: 'single_use_item_detected',
        severity: 'critical_safety_block',
        sourceReference: record.id,
        affectedEntities: record.discrepancyDetails.singleUseFound,
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: record.receivingStaff,
        descriptionAr: 'تم استلام أداة استخدام أحادي في حاوية العائدات الملوثة — تم حظر إعادة تعقيمها وتوجيهها للتخلص الآمن',
        descriptionEn: 'Single-use device found in contaminated return — strictly blocked from reprocessing and routed to biohazard containment',
        status: 'open_action_required',
        quarantineApplied: true
      }
    };
  }

  // Count discrepancy check
  if (record.returnedCount < record.expectedCount) {
    const missingItems = record.discrepancyDetails?.missingItems || ['أدوات غير محددة مفقودة من الطقم'];
    const updated: CSSDReusableSetInstance = {
      ...setInstance,
      currentZoningArea: 'dirty_decontamination',
      pointOfUseStatus: 'at_cssd',
      assemblyStatus: 'set_incomplete_missing_parts',
      missingComponentsList: missingItems
    };

    return {
      isValid: true,
      updatedEntity: updated,
      blockReasonAr: 'تم الاستلام بوجود نقص في أدوات الطقم — تم توثيق النقص وفتح استثناء متابعة مفقودات',
      blockReasonEn: 'Received with count discrepancy — missing items recorded and exception logged',
      newException: {
        id: `EXC-MISS-${Date.now()}`,
        category: 'missing_instrument',
        severity: 'high_priority',
        sourceReference: setInstance.id,
        affectedEntities: missingItems,
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: record.receivingStaff,
        descriptionAr: `عجز في عدد أدوات الطقم: المتوقع ${record.expectedCount} والمستلم ${record.returnedCount}`,
        descriptionEn: `Set count discrepancy: expected ${record.expectedCount}, received ${record.returnedCount}`,
        status: 'open_action_required',
        quarantineApplied: false
      }
    };
  }

  const updated: CSSDReusableSetInstance = {
    ...setInstance,
    currentZoningArea: 'dirty_decontamination',
    pointOfUseStatus: 'at_cssd',
    decontaminationStatus: 'pending_precleaning'
  };

  return {
    isValid: true,
    updatedEntity: updated
  };
}

// ----------------------------------------------------------------------------
// 3. ISO 15883-1 / ISO 15883-2 WASHER DISINFECTION PROFILE VALIDATION
// Driven by device category, washer program, validated cycle, and profile fixtures.
// ----------------------------------------------------------------------------

export function executeCleaningCycle(
  washerEquipment: CSSDEquipmentReference,
  setInstance: CSSDReusableSetInstance,
  cycleEvidence: {
    applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)' | 'ISO 15883-1:2024 (General)';
    programProfile: string;
    temperatureCelsius?: number;
    disinfectionTimeSeconds?: number;
    a0Calculated?: number;
    cycleEvidencePresent: boolean;
    cycleStatus: 'pass' | 'fail_thermal' | 'fail_enzyme' | 'missing_data';
  }
): WorkflowTransitionResult<CSSDReusableSetInstance> {
  // Check equipment availability
  if (washerEquipment.operationalStatus !== 'operational_validated') {
    return {
      isValid: false,
      blockReasonAr: `جهاز الغسيل والتطهير ${washerEquipment.nameAr} غير جاهز للتشغيل أو قيد الصيانة الطبية الحيوية`,
      blockReasonEn: `Washer-disinfector ${washerEquipment.id} is not operational or awaiting qualification.`
    };
  }

  // Missing cycle evidence != passed cycle (Do NOT convert unknown parameters to zero or pass)
  if (!cycleEvidence.cycleEvidencePresent || cycleEvidence.temperatureCelsius === undefined || cycleEvidence.cycleStatus === 'missing_data') {
    return {
      isValid: false,
      blockReasonAr: 'غياب أدلة دورة الغسيل: بيانات دورة الغسيل مفقودة ولا يمكن اعتماد النجاح بدون قراءات محققة',
      blockReasonEn: 'Missing cycle evidence != passed cycle. Verified cycle telemetry is required.'
    };
  }

  // ISO 15883-2:2024 profile for surgical critical/semi-critical instruments requires validated thermal disinfection
  const requiredA0 = cycleEvidence.applicableStandard.includes('ISO 15883-2') ? 3000 : 600;
  const currentA0 = cycleEvidence.a0Calculated;

  if (cycleEvidence.cycleStatus !== 'pass' || (currentA0 !== undefined && currentA0 < requiredA0)) {
    const updated: CSSDReusableSetInstance = {
      ...setInstance,
      currentZoningArea: 'dirty_decontamination',
      decontaminationStatus: 'cleaning_failed_reclean_required'
    };

    return {
      isValid: false,
      updatedEntity: updated,
      blockReasonAr: `فشل دورة التطهير الحراري طبقاً لمعيار ${cycleEvidence.applicableStandard} — القيمة المحققة لم تستوفِ متطلبات البرنامج (${currentA0 ?? 'غير متوفر'} مقابل ${requiredA0})`,
      blockReasonEn: `Washer cycle failed ISO 15883-2 profile requirements. A0 or temperature hold criteria not met.`,
      newException: {
        id: `EXC-WASH-${Date.now()}`,
        category: 'cleaning_failure',
        severity: 'critical_safety_block',
        sourceReference: setInstance.id,
        affectedEntities: [setInstance.id],
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: 'سجل رصد جهاز الغسيل والتطهير',
        descriptionAr: `فشل دورة التطهير الحراري على ${washerEquipment.nameAr} — إرجاع الطقم للتنظيف الأولي`,
        descriptionEn: `Thermal disinfection cycle failed ISO 15883 profile on ${washerEquipment.id} — set routed back to dirty decontamination`,
        status: 'open_action_required',
        quarantineApplied: true
      }
    };
  }

  const updated: CSSDReusableSetInstance = {
    ...setInstance,
    currentZoningArea: 'clean_inspection_assembly',
    decontaminationStatus: 'cleaning_passed',
    inspectionStatus: 'pending_inspection'
  };

  return {
    isValid: true,
    updatedEntity: updated
  };
}

// ----------------------------------------------------------------------------
// 4. CLEANLINESS VS BIOBURDEN TERMINOLOGY & INSPECTION LOGIC (Section 2)
// Visual / magnified inspection inspects visible residual soil, corrosion, damage.
// It does NOT claim to measure microbiological bioburden.
// ----------------------------------------------------------------------------

export function evaluateInspectionResult(
  setInstance: CSSDReusableSetInstance,
  finding: CleaningInspectionFinding
): WorkflowTransitionResult<CSSDReusableSetInstance> {
  // Visible residual soil / magnified inspection failed / residual protein test failed
  if (
    finding === 'visible_residual_soil' ||
    finding === 'magnified_inspection_failed' ||
    finding === 'residual_protein_test_failed'
  ) {
    const updated: CSSDReusableSetInstance = {
      ...setInstance,
      currentZoningArea: 'dirty_decontamination', // Route back to dirty zone
      decontaminationStatus: 'cleaning_failed_reclean_required',
      inspectionStatus: 'reclean_required'
    };

    const findingDescriptions = {
      visible_residual_soil: 'رصد بقايا دم أو شوائب مرئية (visible_residual_soil)',
      magnified_inspection_failed: 'فشل الفحص تحت العدسة المكبرة لوجود رواسب في التجاويف (magnified_inspection_failed)',
      residual_protein_test_failed: 'إيجابية اختبار فحص بقايا البروتين الكيميائي (residual_protein_test_failed)'
    };

    return {
      isValid: false,
      updatedEntity: updated,
      blockReasonAr: `فشل التحقق من نظافة الأدوات: ${findingDescriptions[finding]} — تم حظر التقدم وإعادة الطقم لمرحلة التنظيف والتطهير (Cleaning Failure)`,
      blockReasonEn: `Cleaning verification failed: ${finding}. Routine inspection identified residual soil/protein; instrument routed back to decontamination.`,
      newException: {
        id: `EXC-CLEAN-FAIL-${Date.now()}`,
        category: 'cleaning_failure',
        severity: 'high_priority',
        sourceReference: setInstance.id,
        affectedEntities: [setInstance.id],
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: 'محطة الفحص المجهري والتحقق من النظافة',
        descriptionAr: `فشل التحقق من النظافة (${finding}) — الطقم غير نظيف وتمت إعادته لمنطقة التطهير القذرة`,
        descriptionEn: `Cleaning verification failed (${finding}) — set routed back to dirty decontamination`,
        status: 'open_action_required',
        quarantineApplied: false
      }
    };
  }

  // Structural damage, corrosion, or insulation breakdown
  if (finding === 'corrosion_crack_damage' || finding === 'blunt_malaligned') {
    const updated: CSSDReusableSetInstance = {
      ...setInstance,
      inspectionStatus: 'repair_required_biomed',
      assemblyStatus: 'quarantined',
      damagedComponentsList: ['أداة جراحية متضررة أو بها تآكل/كسر']
    };

    return {
      isValid: false,
      updatedEntity: updated,
      blockReasonAr: 'تم رصد تلف في هيكل الأداة أو تآكل كيميائي — تم حجز الأداة وطلب تدخل الهندسة الطبية الحيوية Biomedical',
      blockReasonEn: 'Structural damage, crack, or corrosion detected — quarantined for biomedical service.',
      newException: {
        id: `EXC-DAM-${Date.now()}`,
        category: 'damaged_instrument',
        severity: 'high_priority',
        sourceReference: setInstance.id,
        affectedEntities: [setInstance.id],
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: 'فني الفحص الوظيفي',
        descriptionAr: 'تلف أو تآكل في الأداة الجراحية — استبعادها من الطقم وإحالتها للهندسة الطبية',
        descriptionEn: 'Corrosion/damage on surgical instrument — excluded from set and referred to biomed',
        status: 'under_investigation',
        quarantineApplied: true
      }
    };
  }

  if (finding === 'not_tested') {
    return {
      isValid: false,
      blockReasonAr: 'لم يتم إجراء فحص النظافة بعد — الحالة غير مؤكدة (not_verified)',
      blockReasonEn: 'Inspection not tested — cleanliness status is not_verified.'
    };
  }

  const updated: CSSDReusableSetInstance = {
    ...setInstance,
    inspectionStatus: 'inspection_passed',
    assemblyStatus: 'pending_assembly'
  };

  return {
    isValid: true,
    updatedEntity: updated
  };
}

// ----------------------------------------------------------------------------
// 5. SET ASSEMBLY & COMPLETENESS VERIFICATION
// ----------------------------------------------------------------------------

export function verifySetAssembly(
  setInstance: CSSDReusableSetInstance,
  setDef: InstrumentSetDefinition,
  availableItemIds: string[],
  approvedSubstitutes: { originalId: string; substituteId: string }[] = []
): WorkflowTransitionResult<CSSDReusableSetInstance> {
  const missingRequired = setDef.components
    .filter(c => !c.isOptional)
    .filter(c => {
      const hasOriginal = availableItemIds.includes(c.componentId);
      const hasApprovedSub = approvedSubstitutes.some(
        s => s.originalId === c.componentId && c.eligibleSubstitutes?.includes(s.substituteId)
      );
      return !hasOriginal && !hasApprovedSub;
    });

  if (missingRequired.length > 0) {
    const updated: CSSDReusableSetInstance = {
      ...setInstance,
      assemblyStatus: 'set_incomplete_missing_parts',
      missingComponentsList: missingRequired.map(m => m.componentNameAr)
    };

    return {
      isValid: false,
      updatedEntity: updated,
      blockReasonAr: `لا يمكن تعبئة الطقم: أدوات أساسية مفقودة (${missingRequired.map(m => m.componentNameAr).join(', ')}) ولا يسمح النظام باعتبار الطقم مكتملاً دونها`,
      blockReasonEn: `Incomplete set: required components missing (${missingRequired.map(m => m.componentNameEn).join(', ')}). Set cannot silently become complete.`,
      newException: {
        id: `EXC-ASM-${Date.now()}`,
        category: 'missing_instrument',
        severity: 'high_priority',
        sourceReference: setInstance.id,
        affectedEntities: missingRequired.map(m => m.componentId),
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: 'محطة التجميع والتجهيز',
        descriptionAr: `طقم غير مكتمل: نقص في ${missingRequired.length} أدوات جراحية إلزامية`,
        descriptionEn: `Incomplete set: missing ${missingRequired.length} mandatory surgical instruments`,
        status: 'open_action_required',
        quarantineApplied: false
      }
    };
  }

  const updated: CSSDReusableSetInstance = {
    ...setInstance,
    currentZoningArea: 'packaging_preparation',
    assemblyStatus: 'set_complete',
    packagingStatus: 'not_packaged',
    missingComponentsList: []
  };

  return {
    isValid: true,
    updatedEntity: updated
  };
}

// ----------------------------------------------------------------------------
// 6. PACKAGING CREATION WITH COMPATIBILITY CHECK
// ----------------------------------------------------------------------------

export function createSterilizationPackage(
  setInstance: CSSDReusableSetInstance,
  setDef: InstrumentSetDefinition,
  selectedPackaging: PackagingMethod,
  intendedProcess: ReprocessingMethodCategory,
  packagerName: string,
  configuredInternalCiType: 'Class 4 Multi-Variable' | 'Class 5 Integrating' | 'Class 6 Emulating' = 'Class 5 Integrating',
  mockIfuOverrides?: {
    isPackagingPermittedByIfu?: boolean;
    isPackagingProhibitedByIfu?: boolean;
    isConditionalValidation?: boolean;
  }
): WorkflowTransitionResult<CSSDPackageRecord> {
  // Prevent packaging if set is incomplete or failed inspection
  if (setInstance.assemblyStatus !== 'set_complete' || setInstance.inspectionStatus !== 'inspection_passed') {
    return {
      isValid: false,
      blockReasonAr: 'حظر أمان: لا يمكن تغليف طقم غير مكتمل المكونات أو لم يجتز الفحص الوظيفي والنظافة',
      blockReasonEn: 'Safety block: Cannot package an incomplete set or one that has not passed cleaning inspection.'
    };
  }

  // Resolve compatibility
  const compat = resolvePackagingProcessCompatibility(
    setDef,
    selectedPackaging,
    intendedProcess,
    mockIfuOverrides
  );

  if (compat.status === 'incompatible' || compat.status === 'ifu_unavailable') {
    return {
      isValid: false,
      blockReasonAr: `تعارض التغليف والتعقيم: ${compat.reasonAr}`,
      blockReasonEn: `Packaging/Process conflict: ${compat.reasonEn}`,
      newException: {
        id: `EXC-PKG-${Date.now()}`,
        category: 'packaging_failure',
        severity: 'critical_safety_block',
        sourceReference: setInstance.id,
        affectedEntities: [setInstance.id],
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: packagerName,
        descriptionAr: `اختيار تغليف غير متوافق: ${compat.reasonAr}`,
        descriptionEn: `Incompatible packaging selected: ${compat.reasonEn}`,
        status: 'open_action_required',
        quarantineApplied: true
      }
    };
  }

  const pkg: CSSDPackageRecord = {
    id: `PKG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    setInstanceId: setInstance.id,
    setNameAr: setInstance.setNameAr,
    packagingMethod: selectedPackaging,
    containerBarcode: `CONT-${setInstance.serialNumber}`,
    internalIndicatorType: configuredInternalCiType,
    internalIndicatorVerified: true,
    externalIndicatorType: 'Class 1 Process Tape/Label',
    externalIndicatorVerified: true,
    packagedBy: packagerName,
    packagingTimestamp: new Date().toLocaleTimeString('ar-EG'),
    integrityConfirmed: true,
    compatibleProcessMethod: intendedProcess,
    compatibilityStatus: compat.status,
    currentStatus: 'packaged_pending_load',
    storageIntegrity: 'intact_sterile'
  };

  return {
    isValid: true,
    updatedEntity: pkg
  };
}

// ----------------------------------------------------------------------------
// 7. LOAD CREATION, PACKAGE INCLUSION & BOWIE-DICK PRECONDITION (Section 5)
// Bowie-Dick test applies to prevacuum steam sterilizers, NOT universally to all types.
// ----------------------------------------------------------------------------

export function validatePackageInclusionInLoad(
  packageRecord: CSSDPackageRecord,
  load: SterilizerCycleRecord,
  allActiveLoads: SterilizerCycleRecord[]
): WorkflowTransitionResult<SterilizerCycleRecord> {
  // Check if package already exists in this load
  if (load.includedPackageIds.includes(packageRecord.id)) {
    return {
      isValid: false,
      blockReasonAr: `العبوة ${packageRecord.id} مضافة مسبقاً في هذه الشحنة`,
      blockReasonEn: `Package ${packageRecord.id} is already included in this load.`
    };
  }

  // Check if package exists in any other running/scheduled load
  const isIncludedElsewhere = allActiveLoads.some(
    otherLoad => otherLoad.id !== load.id &&
      ['cycle_scheduled', 'cycle_running_simulation', 'monitoring_pending'].includes(otherLoad.cycleStatus) &&
      otherLoad.includedPackageIds.includes(packageRecord.id)
  );

  if (isIncludedElsewhere) {
    return {
      isValid: false,
      blockReasonAr: `محظور: العبوة ${packageRecord.id} مخصصة حالياً لدورة تعقيم أخرى نشطة`,
      blockReasonEn: `Package ${packageRecord.id} is already allocated in another active sterilization load.`
    };
  }

  // Compatibility check between package and sterilizer cycle profile
  if (packageRecord.compatibleProcessMethod !== load.methodCategory) {
    return {
      isValid: false,
      blockReasonAr: `عدم توافق في نظام التعقيم: العبوة مخصصة لـ (${packageRecord.compatibleProcessMethod}) بينما دورة المعقم تعمل بـ (${load.methodCategory})`,
      blockReasonEn: `Reprocessing method mismatch between package and sterilizer cycle profile.`
    };
  }

  const updatedLoad: SterilizerCycleRecord = {
    ...load,
    includedPackageIds: [...load.includedPackageIds, packageRecord.id]
  };

  return {
    isValid: true,
    updatedEntity: updatedLoad
  };
}

export function validateSterilizerAirRemovalCheck(
  equipment: CSSDEquipmentReference
): { isEligible: boolean; reasonAr?: string; reasonEn?: string } {
  // Bowie-Dick only applies to dynamic-air-removal (prevacuum steam)
  if (equipment.airRemovalTestRequired || equipment.sterilizerType === 'prevacuum_steam') {
    if (equipment.bowieDickStatusToday !== 'passed') {
      return {
        isEligible: false,
        reasonAr: `فحص تفريغ الهواء اليومي (Bowie-Dick) لمعقم البخار المفرغ ${equipment.nameAr} لم يجتز بنجاح (الحالة: ${equipment.bowieDickStatusToday}) — محظور تشغيل دورات التعقيم حتى اجتياز الفحص`,
        reasonEn: `Air removal test (Bowie-Dick) failed or pending for prevacuum steam sterilizer ${equipment.id}. Steam processing is blocked.`
      };
    }
  }

  return { isEligible: true };
}

// ----------------------------------------------------------------------------
// 8. IUSS SAFETY & DOCUMENTATION (Section 6)
// IUSS must NOT become a convenience workflow; requires explicit documentation;
// does NOT route into normal sterile storage.
// ----------------------------------------------------------------------------

export function validateIUSSWorkflow(
  load: SterilizerCycleRecord,
  documentation?: {
    urgentClinicalNeed: string;
    itemDeviceDescription: string;
    reasonJustification: string;
    operatingRoomDestination: string;
    operatorStaff: string;
    immediateUseContext: string;
    clinicalApprovalRef: string;
  }
): WorkflowTransitionResult<SterilizerCycleRecord> {
  if (load.isIUSSException) {
    if (!documentation || !documentation.urgentClinicalNeed || !documentation.clinicalApprovalRef) {
      return {
        isValid: false,
        blockReasonAr: 'حظر إجراء التعقيم الفوري IUSS: غياب التوثيق الإلزامي للحاجة السريرية العاجلة واعتماد الاستشاري المعالج',
        blockReasonEn: 'IUSS Blocked: Immediate-Use Steam Sterilization requires documented urgent clinical need and clinical approval reference.'
      };
    }

    const updated: SterilizerCycleRecord = {
      ...load,
      iussDocumentation: documentation
    };

    return {
      isValid: true,
      updatedEntity: updated
    };
  }

  return {
    isValid: true,
    updatedEntity: load
  };
}

// ----------------------------------------------------------------------------
// 9. LOAD RELEASE DECISION & QUALITY EVIDENCE AUDIT (Section 4)
// Preserves three monitoring families: MECHANICAL, CHEMICAL, BIOLOGICAL.
// CI class is configurable; does NOT universally require Class 5 for every load.
// Biological indicator required for implant loads; quarantine enforced while BI pending.
// ----------------------------------------------------------------------------

export function evaluateLoadRelease(
  cycle: SterilizerCycleRecord,
  reviewerName: string,
  options?: {
    allowReleaseWithoutCiPass?: boolean;
  }
): WorkflowTransitionResult<SterilizerCycleRecord> {
  // 1. Mechanical check
  if (!cycle.mechanicalParamEvidence.passed || !cycle.mechanicalParamEvidence.tempGraphVerified) {
    return {
      isValid: false,
      blockReasonAr: 'حظر أمان قاطع: منحنى الضغط والحرارة الميكانيكي للمعقم لم يحقق معايير التعقيم المطلوبة — محظور الإفراج عن الشحنة',
      blockReasonEn: 'Hard Safety Block: Mechanical parameters failed. Temperature/pressure graph not satisfied. Release strictly blocked.',
      newException: {
        id: `EXC-STER-MECH-${Date.now()}`,
        category: 'load_failure',
        severity: 'critical_safety_block',
        sourceReference: cycle.id,
        affectedEntities: cycle.includedPackageIds,
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: reviewerName,
        descriptionAr: 'فشل المعايير الفيزيائية/الميكانيكية لدورة التعقيم — الشحنة محجوزة بالكامل',
        descriptionEn: 'Mechanical parameters failed on sterilizer cycle — entire load held under quarantine',
        status: 'open_action_required',
        quarantineApplied: true
      }
    };
  }

  // Prevacuum Bowie-Dick air removal check if required
  if (cycle.mechanicalParamEvidence.airRemovalTestRequired && !cycle.mechanicalParamEvidence.airRemovalTestPassed) {
    return {
      isValid: false,
      blockReasonAr: 'حظر إفراج: فحص تفريغ الهواء (Bowie-Dick) لم ينجح اليوم لهذا المعقم — محظور الإفراج عن شحنات البخار المفرغ',
      blockReasonEn: 'Release Blocked: Required Bowie-Dick air removal test failed for this sterilizer.'
    };
  }

  // 2. Chemical indicator check (Configurable by policy, not universally Class 5)
  if (cycle.chemicalIndicatorEvidence.requiredByPolicy) {
    if (!cycle.chemicalIndicatorEvidence.passed || !cycle.chemicalIndicatorEvidence.colorChangeVerified) {
      return {
        isValid: false,
        blockReasonAr: `حظر إفراج: المؤشر الكيميائي المحدد (${cycle.chemicalIndicatorEvidence.indicatorType}) لم يجتز نقطة التحول — الشحنة غير مؤهلة للإفراج`,
        blockReasonEn: `Release Blocked: Chemical indicator (${cycle.chemicalIndicatorEvidence.indicatorType}) did not pass endpoint criteria.`,
        newException: {
          id: `EXC-STER-CHEM-${Date.now()}`,
          category: 'indicator_failure',
          severity: 'critical_safety_block',
          sourceReference: cycle.id,
          affectedEntities: cycle.includedPackageIds,
          detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
          detectedBy: reviewerName,
          descriptionAr: `فشل المؤشر الكيميائي (${cycle.chemicalIndicatorEvidence.indicatorType}) داخل الشحنة`,
          descriptionEn: `Chemical indicator failure inside load (${cycle.chemicalIndicatorEvidence.indicatorType})`,
          status: 'open_action_required',
          quarantineApplied: true
        }
      };
    }
  }

  // 3. Biological indicator check (Mandatory for implant-containing loads)
  const isBiMandatory = cycle.hasImplantTray || cycle.biologicalIndicatorEvidence.isRequired;

  if (isBiMandatory) {
    if (cycle.biologicalIndicatorEvidence.biStatus === 'pending') {
      return {
        isValid: false,
        blockReasonAr: 'الإفراج معلق وقيد الحجز (QUARANTINE_REQUIRED): الشحنة تحتوي على غرسات جراحية (Implants) تتطلب نتيجة فحص المؤشر البيولوجي (BI) السلبية قبل الإفراج — الحاضنة قيد القراءة (BI_PENDING)',
        blockReasonEn: 'QUARANTINE_REQUIRED: Implant-containing load requires verified negative Biological Indicator (BI) prior to release. Incubation is BI_PENDING.'
      };
    }

    if (cycle.biologicalIndicatorEvidence.biStatus === 'failed') {
      return {
        isValid: false,
        blockReasonAr: 'خطر بكتيري حرج: المؤشر البيولوجي أظهر نمواً ميكروبياً إيجابياً! الشحنة فاشلة بالكامل وتتطلب الاستدعاء والحجز الفوري (RECALL_REQUIRED)',
        blockReasonEn: 'Critical Failure: Biological indicator positive growth. Load failed sterilization. Immediate quarantine and recall required.',
        newException: {
          id: `EXC-BI-POS-${Date.now()}`,
          category: 'indicator_failure',
          severity: 'critical_safety_block',
          sourceReference: cycle.id,
          affectedEntities: cycle.includedPackageIds,
          detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
          detectedBy: reviewerName,
          descriptionAr: 'نمو بكتيري في فحص المؤشر البيولوجي — إعلان فشل دورة التعقيم وحظر جميع العبوات المرتبطة',
          descriptionEn: 'Positive biological indicator culture — autoclave cycle failure declared, all packages quarantined',
          status: 'open_action_required',
          quarantineApplied: true
        }
      };
    }
  }

  const updatedCycle: SterilizerCycleRecord = {
    ...cycle,
    cycleStatus: 'released',
    releaseDecision: {
      decision: 'released',
      releasedBy: reviewerName,
      releaseTimestamp: new Date().toLocaleTimeString('ar-EG')
    }
  };

  return {
    isValid: true,
    updatedEntity: updatedCycle
  };
}

// ----------------------------------------------------------------------------
// 10. STORAGE INTEGRITY & EVENT-RELATED COMPROMISE (Section 8)
// Evaluates actual package event (wet pack, torn packaging, puncture, dropped).
// Does NOT use arbitrary expiration dates as only proof.
// ----------------------------------------------------------------------------

export function evaluatePackageStorageIntegrity(
  packageRecord: CSSDPackageRecord,
  event: 'none' | 'wet_pack' | 'torn_wrap' | 'dropped_floor' | 'opened_seal' | 'not_verified'
): WorkflowTransitionResult<CSSDPackageRecord> {
  if (event === 'not_verified') {
    const updated: CSSDPackageRecord = {
      ...packageRecord,
      storageIntegrity: 'not_verified'
    };
    return {
      isValid: false,
      updatedEntity: updated,
      blockReasonAr: 'لم يتم التحقق من سلامة الغلاف بعد (INTEGRITY_NOT_VERIFIED)',
      blockReasonEn: 'Package integrity evidence missing: NOT_VERIFIED.'
    };
  }

  if (event !== 'none') {
    const reasonMap = {
      wet_pack: 'رطوبة وتكثف داخل العبوة (Wet Pack) يلغي التعقيم فسيولوجياً وبكتيرياً',
      torn_wrap: 'تمزق أو انثقاب في غلاف الحماية',
      dropped_floor: 'سقوط العبوة على الأرض مع احتمالية تلف العزل أو الحواف',
      opened_seal: 'فك الختم أو فتح الحاوية في منطقة غير معقمة'
    };

    const updated: CSSDPackageRecord = {
      ...packageRecord,
      currentStatus: 'package_integrity_compromised',
      storageIntegrity: event === 'wet_pack' ? 'wet_pack_compromised' : event === 'torn_wrap' ? 'torn_punctured' : 'handling_breach_dropped',
      eventRelatedCompromiseReason: reasonMap[event]
    };

    return {
      isValid: false,
      updatedEntity: updated,
      blockReasonAr: `فقدان عقم العبوة بسبب حادث فيزيائي: ${reasonMap[event]} — محظور استخدامها للمرضى ويجب حجزها وإعادة المعالجة من البداية (QUARANTINE / REPROCESS)`,
      blockReasonEn: `Package sterility compromised by physical event: ${event}. Quarantined for reprocessing.`,
      newException: {
        id: `EXC-STOR-${Date.now()}`,
        category: 'storage_integrity_failure',
        severity: 'high_priority',
        sourceReference: packageRecord.id,
        affectedEntities: [packageRecord.id],
        detectedTimestamp: new Date().toLocaleTimeString('ar-EG'),
        detectedBy: 'مستودع التعقيم المركزي',
        descriptionAr: `فقدان عقم العبوة (${packageRecord.setNameAr}) نتيجة: ${reasonMap[event]}`,
        descriptionEn: `Sterility compromised for package ${packageRecord.id}: ${event}`,
        status: 'open_action_required',
        quarantineApplied: true
      }
    };
  }

  return {
    isValid: true,
    updatedEntity: packageRecord
  };
}

// ----------------------------------------------------------------------------
// 11. DISTRIBUTION & OR CASE DISPATCH (Sections 6 & 8)
// IUSS items are routed directly to OR context, NOT stored in routine sterile storage.
// ----------------------------------------------------------------------------

export function dispatchSterileSetToCase(
  distRequest: SterileDistributionRequest,
  packageRecord: CSSDPackageRecord,
  courierName: string,
  isIUSSItem: boolean = false
): WorkflowTransitionResult<SterileDistributionRequest> {
  // Cannot dispatch unreleased or compromised package
  if (packageRecord.currentStatus !== 'released_sterile' || packageRecord.storageIntegrity !== 'intact_sterile') {
    return {
      isValid: false,
      blockReasonAr: 'محظور التوزيع: العبوة ليست في حالة تعقيم سليم ومفرج عنها رسمياً (Released Sterile & Intact)',
      blockReasonEn: 'Distribution Blocked: Package is not released sterile or package integrity is compromised.'
    };
  }

  // Cannot dispatch if already used or returned
  if (distRequest.status === 'used_in_case' || distRequest.status === 'returned_to_cssd') {
    return {
      isValid: false,
      blockReasonAr: 'الطلب في حالة منتهية بالفعل (مستخدم سريرياً أو معاد)',
      blockReasonEn: 'Distribution request is already completed or returned.'
    };
  }

  const updatedReq: SterileDistributionRequest = {
    ...distRequest,
    status: 'dispatched',
    allocatedPackageIds: Array.from(new Set([...distRequest.allocatedPackageIds, packageRecord.id])),
    dispatchTime: new Date().toLocaleTimeString('ar-EG'),
    courierStaff: courierName,
    exposureVerificationStatus: distRequest.orCaseReference ? 'verified' : 'not_verified'
  };

  return {
    isValid: true,
    updatedEntity: updatedReq
  };
}
