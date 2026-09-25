// ============================================================================
// HIS — BIOMEDICAL WORKFLOW & SAFETY INTERLOCK ENGINE
// Pure, deterministic business logic for medical equipment lifecycle
// Workflow informed by applicable IEC 62353 testing concepts & SFDA guidelines
// Synthetic Operations Preview — UI/UX Only
// ============================================================================

import {
  MedicalEquipmentAsset,
  BiomedicalWorkOrder,
  ElectricalSafetyTestRecord,
  ElectricalSafetyTestProfile,
  CalibrationRecord,
  SafetyAlertFsca,
  AlertMatchStatus,
  EquipmentLifecycleEvent,
  DowntimePeriod
} from '../types/biomedicalOps';

export interface CommissioningInput {
  physicalInspectionPassed?: boolean;
  installationVerificationPassed?: boolean;
  functionalTestPassed?: boolean;
  performanceVerificationPassed?: boolean;
  electricalSafetyTest?: ElectricalSafetyTestRecord;
  initialCalibration?: CalibrationRecord;
  trainingEvidenceProvided?: boolean;
  manufacturerInstallationEvidenceProvided?: boolean;
  commissionedBy: string;
}

export function evaluateCommissioningEligibility(
  asset: MedicalEquipmentAsset,
  input: CommissioningInput
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const profile = asset.commissioningProfile;

  if (asset.currentStatus !== 'pending_commissioning') {
    reasons.push(`الجهاز ليس في حالة انتظار التدشين (الحالة الحالية: ${asset.currentStatus})`);
    return { eligible: false, reasons };
  }

  // BM04: Manufacturer IFU availability check
  if (!profile.manufacturerIfuAvailable) {
    reasons.push('حظر تدشين: دليل إرشادات الاستخدام المعتمد من الشركة المصنعة (IFU) غير متوفر.');
  }

  // Physical inspection
  if (profile.physicalInspection === 'not_verified') {
    reasons.push('حظر تدشين: حالة الفحص الفيزيائي غير محققة (not_verified).');
  } else if (profile.physicalInspection === 'required' && !input.physicalInspectionPassed) {
    reasons.push('حظر تدشين: لم يتم إثبات اجتياز الفحص الفيزيائي والميكانيكي للأصل.');
  }

  // Installation verification
  if (profile.installationVerification === 'not_verified') {
    reasons.push('حظر تدشين: محضر التحقق من التثبيت غير محقق (not_verified).');
  } else if (profile.installationVerification === 'required' && !input.installationVerificationPassed) {
    reasons.push('حظر تدشين: لم يتم توثيق محضر التحقق من التثبيت والتركيب الأولي.');
  }

  // Functional test
  if (profile.functionalTest === 'not_verified') {
    reasons.push('حظر تدشين: اختبار التشغيل الوظيفي غير محقق (not_verified).');
  } else if (profile.functionalTest === 'required' && !input.functionalTestPassed) {
    reasons.push('حظر تدشين: لم يتم اجتياز اختبار التشغيل الوظيفي الأولي.');
  }

  // Performance verification
  if (profile.performanceVerification === 'not_verified') {
    reasons.push('حظر تدشين: التحقق من الأداء الفني غير محقق (not_verified).');
  } else if (profile.performanceVerification === 'required' && !input.performanceVerificationPassed) {
    reasons.push('حظر تدشين: لم يتم إثبات اجتياز التحقق من الأداء الفني (Performance Verification).');
  }

  // Electrical Safety Test (Profile-driven: only checked if required!)
  if (profile.electricalSafetyTest === 'not_verified') {
    reasons.push('حظر تدشين: حالة فحص السلامة الكهربائية غير محققة (not_verified).');
  } else if (profile.electricalSafetyTest === 'required') {
    if (!input.electricalSafetyTest) {
      reasons.push('حظر تدشين: يلزم تقديم فحص سلامة كهربائية مطابق لملف الفحص المعتمد للجهاز.');
    } else if (!input.electricalSafetyTest.overallSafetyPass) {
      reasons.push('فشل تدشين: فحص السلامة الكهربائية لم يستوفِ الحدود المحددة في ملف الفحص.');
    }
  }

  // Calibration (Profile-driven: only checked if required by device profile!)
  if (profile.calibration === 'not_verified') {
    reasons.push('حظر تدشين: حالة المعايرة المترولوجية غير محققة (not_verified).');
  } else if (profile.calibration === 'required') {
    if (!input.initialCalibration) {
      reasons.push('حظر تدشين: يتطلب هذا الجهاز شهادة معايرة مترولوجية أساسية قبل التدشين.');
    } else if (!input.initialCalibration.passed) {
      reasons.push('فشل تدشين: شهادة المعايرة غير مجازة أو مسجلة خروج قياسات عن نسبة التسامح.');
    } else if (input.initialCalibration.referenceStandardExpired) {
      reasons.push('حظر أمان: جهاز القياس المرجعي المستخدم في المعايرة منتهي شهادة المعايرة.');
    }
  }

  // Training evidence
  if (profile.trainingEvidence === 'not_verified') {
    reasons.push('حظر تدشين: توثيق التدريب غير محقق (not_verified).');
  } else if (profile.trainingEvidence === 'required' && !input.trainingEvidenceProvided) {
    reasons.push('حظر تدشين: لم يتم توثيق تدريب الكادر السريري على تشغيل الجهاز وفق IFU.');
  }

  // Manufacturer installation evidence
  if (profile.manufacturerInstallationEvidence === 'not_verified') {
    reasons.push('حظر تدشين: محضر تركيب المصنّع غير محقق (not_verified).');
  } else if (profile.manufacturerInstallationEvidence === 'required' && !input.manufacturerInstallationEvidenceProvided) {
    reasons.push('حظر تدشين: لم يتم توثيق محضر التركيب المعتمد من الشركة المصنعة/الوكيل.');
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}

export function commissionEquipmentAsset(
  asset: MedicalEquipmentAsset,
  input: CommissioningInput
): { success: boolean; updatedAsset?: MedicalEquipmentAsset; errorReason?: string } {
  const evalResult = evaluateCommissioningEligibility(asset, input);

  if (!evalResult.eligible) {
    return {
      success: false,
      errorReason: evalResult.reasons.join(' | ')
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newEvent: EquipmentLifecycleEvent = {
    id: `EVT-COMM-${Date.now()}`,
    timestamp: nowStr,
    eventType: 'commissioning',
    descriptionAr: `اكتمال إجراءات التدشين والقبول الفني للأصل ونقله إلى الخدمة السريرية في ${asset.assignedDepartment}.`,
    descriptionEn: `Commissioning and technical acceptance completed. Asset transitioned to in_service in ${asset.assignedDepartment}.`,
    actor: input.commissionedBy
  };

  const updatedAsset: MedicalEquipmentAsset = {
    ...asset,
    currentStatus: 'in_service',
    commissioningDate: nowStr.split(' ')[0],
    latestSafetyTest: input.electricalSafetyTest || asset.latestSafetyTest,
    latestCalibration: input.initialCalibration || asset.latestCalibration,
    lifecycleHistory: [newEvent, ...asset.lifecycleHistory]
  };

  return { success: true, updatedAsset };
}

export function evaluateElectricalSafetyTestValues(
  profile: ElectricalSafetyTestProfile | undefined,
  earthResistanceOhms?: number,
  insulationResistanceMOhms?: number,
  chassisLeakageCurrentMicroAmps?: number,
  patientLeakageMicroAmps?: number,
  hasDetachablePowerCord: boolean = false
): {
  testProfileStatus: 'PROFILE_VERIFIED' | 'TEST_PROFILE_NOT_VERIFIED';
  earthResistancePass: boolean;
  insulationResistancePass: boolean;
  chassisLeakagePass: boolean;
  patientLeakagePass: boolean;
  overallPass: boolean;
  details: string;
} {
  // BM06: If test profile is missing or unknown, do not guess or generate PASS!
  if (!profile) {
    return {
      testProfileStatus: 'TEST_PROFILE_NOT_VERIFIED',
      earthResistancePass: false,
      insulationResistancePass: false,
      chassisLeakagePass: false,
      patientLeakagePass: false,
      overallPass: false,
      details: 'TEST_PROFILE_NOT_VERIFIED: لا يوجد ملف فحص سلامة كهربائية محدد لهذا الأصل.'
    };
  }

  let earthPass = true;
  if (profile.earthResistanceLimitOhms !== undefined) {
    if (earthResistanceOhms === undefined || isNaN(earthResistanceOhms)) {
      earthPass = false;
    } else {
      const limit = hasDetachablePowerCord
        ? (profile.detachableCordAllowanceOhms || profile.earthResistanceLimitOhms + 0.1)
        : profile.earthResistanceLimitOhms;
      earthPass = earthResistanceOhms > 0 && earthResistanceOhms <= limit;
    }
  }

  let insPass = true;
  if (profile.insulationResistanceLimitMOhms !== undefined) {
    if (insulationResistanceMOhms === undefined || isNaN(insulationResistanceMOhms)) {
      insPass = false;
    } else {
      insPass = insulationResistanceMOhms >= profile.insulationResistanceLimitMOhms;
    }
  }

  let chassisPass = true;
  if (profile.chassisLeakageLimitMicroAmps !== undefined) {
    if (chassisLeakageCurrentMicroAmps === undefined || isNaN(chassisLeakageCurrentMicroAmps)) {
      chassisPass = false;
    } else {
      chassisPass = chassisLeakageCurrentMicroAmps >= 0 && chassisLeakageCurrentMicroAmps <= profile.chassisLeakageLimitMicroAmps;
    }
  }

  let patientPass = true;
  if (profile.appliedPartType && profile.appliedPartType !== 'None' && profile.patientLeakageLimitMicroAmps !== undefined) {
    if (patientLeakageMicroAmps === undefined || isNaN(patientLeakageMicroAmps)) {
      patientPass = false;
    } else {
      patientPass = patientLeakageMicroAmps >= 0 && patientLeakageMicroAmps <= profile.patientLeakageLimitMicroAmps;
    }
  }

  const overallPass = earthPass && insPass && chassisPass && patientPass;

  return {
    testProfileStatus: 'PROFILE_VERIFIED',
    earthResistancePass: earthPass,
    insulationResistancePass: insPass,
    chassisLeakagePass: chassisPass,
    patientLeakagePass: patientPass,
    overallPass,
    details: `فحص بناءً على الملف ${profile.testProfileId} (${profile.applicableStandardReference})`
  };
}

export function evaluateCalibrationRecord(
  calRecord: CalibrationRecord
): { passed: boolean; reason?: string } {
  // BM08: Check expired reference measurement standard
  if (calRecord.referenceStandardExpired) {
    return {
      passed: false,
      reason: 'أداة المعايرة المرجعية منتهية الصلاحية؛ لا يمكن اعتماد نتائج المعايرة بدون معيار مرجعي ساري.'
    };
  }

  const allPointsInTolerance = calRecord.testPoints.every(tp => tp.inTolerance);
  if (!allPointsInTolerance) {
    return {
      passed: false,
      reason: 'وجود نقاط قياس خارج نطاق التسامح المسموح به.'
    };
  }

  return { passed: true };
}

export function matchAssetToSafetyAlert(
  asset: MedicalEquipmentAsset,
  alert: SafetyAlertFsca
): AlertMatchStatus {
  // BM21: Match using explicit applicable criteria, not manufacturer alone!
  const mfrMatch = asset.manufacturer.toLowerCase().includes(alert.affectedManufacturer.toLowerCase()) ||
                   alert.affectedManufacturer.toLowerCase().includes(asset.manufacturer.toLowerCase());

  if (!mfrMatch) {
    return 'UNAFFECTED';
  }

  const modelMatch = asset.model.toLowerCase().includes(alert.affectedModel.toLowerCase()) ||
                     alert.affectedModel.toLowerCase().includes(asset.model.toLowerCase());

  if (!modelMatch) {
    return 'UNAFFECTED';
  }

  // If manufacturer and model match, inspect serial range
  if (alert.affectedSerialRange && alert.affectedSerialRange.toLowerCase() !== 'all') {
    // Check if serial fits range
    const cleanSerial = asset.serialNumber.replace(/\D/g, '');
    const cleanRange = alert.affectedSerialRange.replace(/\D/g, ' ').split(/\s+/).filter(Boolean);

    if (cleanRange.length >= 2) {
      const min = parseInt(cleanRange[0], 10);
      const max = parseInt(cleanRange[1], 10);
      const sn = parseInt(cleanSerial, 10);

      if (!isNaN(min) && !isNaN(max) && !isNaN(sn)) {
        if (sn >= min && sn <= max) {
          return 'AFFECTED_CONFIRMED';
        } else {
          return 'UNAFFECTED'; // Confirmed outside affected serial batch
        }
      }
    }
    // Ambiguous serial range requires engineering review
    return 'REVIEW_REQUIRED';
  }

  return 'AFFECTED_CONFIRMED';
}

export function evaluateReturnToServiceEligibility(
  asset: MedicalEquipmentAsset,
  workOrder: BiomedicalWorkOrder
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Gate 1: Check active SFDA recall quarantine
  if (asset.currentStatus === 'quarantined_safety_hold' || asset.fscaQuarantineRef) {
    reasons.push(`الجهاز خاضع لحظر السلامة والاستدعاء (${asset.fscaQuarantineRef || 'SFDA-FSCA'})؛ لا يمكن تحريره حتى إغلاق البلاغ.`);
  }

  // Gate 2: Decontamination Clearance (BM14)
  if (asset.decontaminationProfile.requirementStatus === 'required') {
    const isCleared = workOrder.decontaminationClearance?.requirementStatus === 'completed_reference' ||
                      Boolean(asset.decontaminationProfile.certificateRef);
    if (!isCleared) {
      reasons.push('حظر بيولوجي: لم يتم توثيق إنهاء التطهير أو شهادة خلو التلوث للأصل قبل الإفراج السريري.');
    }
  }

  // Gate 3: Detailed technical actions
  if (!workOrder.actionsTaken || workOrder.actionsTaken.trim().length < 10) {
    reasons.push('يجب تدوين الإجراءات الفنية المنفذة بشكل تفصيلي في أمر العمل.');
  }

  // Gate 4: Functional Verification
  if (!workOrder.functionalVerificationCompleted) {
    reasons.push('يلزم استكمال وتوثيق التحقق الوظيفي (Functional Verification) بعد الصيانة.');
  }

  // Gate 5: Electrical Safety Test (Profile-driven: only if required by work order/asset profile)
  if (workOrder.electricalSafetyTestRequired) {
    if (!workOrder.safetyTestRecord) {
      reasons.push('يلزم تسجيل فحص السلامة الكهربائية ما بعد الإصلاح وفق ملف الفحص المعتمد.');
    } else if (!workOrder.safetyTestRecord.overallSafetyPass) {
      reasons.push('فشل فحص السلامة الكهربائية ما بعد الإصلاح.');
    }
  }

  // Gate 6: Calibration Verification (only if required by work order/profile)
  if (workOrder.calibrationRequired) {
    if (!workOrder.calibrationRecord) {
      reasons.push('يلزم تسجيل شهادة معايرة مترولوجية بعد إجراء الإصلاح.');
    } else if (!workOrder.calibrationRecord.passed || workOrder.calibrationRecord.referenceStandardExpired) {
      reasons.push('شهادة المعايرة غير مجازة أو أن أداة المعايرة المرجعية منتهية الصلاحية.');
    }
  }

  // Gate 7: Vendor Repair Verification (BM18)
  if (workOrder.vendorRepaired && !workOrder.hospitalVerificationCompleted) {
    reasons.push('الأصل خضع لصيانة خارجية لدى الوكيل؛ يلزم إجراء فحص الاستلام والتحقق الفني في المستشفى قبل الإفراج.');
  }

  // Gate 8: Technician Sign-off
  if (!workOrder.technicianSignOff || !workOrder.technicianSignOff.engineerName) {
    reasons.push('يلزم توقيع واعتماد مهندس الأجهزة الطبية المنفذ للصيانة.');
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}

export function executeReturnToService(
  asset: MedicalEquipmentAsset,
  workOrder: BiomedicalWorkOrder,
  approverName: string,
  custodianName?: string
): {
  success: boolean;
  updatedAsset?: MedicalEquipmentAsset;
  updatedWorkOrder?: BiomedicalWorkOrder;
  error?: string;
} {
  const evaluation = evaluateReturnToServiceEligibility(asset, workOrder);

  if (!evaluation.eligible) {
    return {
      success: false,
      error: `لا يمكن تحرير الجهاز للخدمة السريرية: ${evaluation.reasons.join(' | ')}`
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Close open downtime if applicable
  let closedDowntime: DowntimePeriod | undefined;
  if (workOrder.downtimeRecord && !workOrder.downtimeRecord.end) {
    const startMs = new Date(workOrder.downtimeRecord.start).getTime();
    const endMs = new Date().getTime();
    const duration = Math.max(0.1, parseFloat(((endMs - startMs) / (1000 * 60 * 60)).toFixed(1)));
    closedDowntime = {
      ...workOrder.downtimeRecord,
      end: nowStr,
      durationHours: duration
    };
  }

  const updatedWorkOrder: BiomedicalWorkOrder = {
    ...workOrder,
    status: 'completed_verified',
    downtimeRecord: closedDowntime || workOrder.downtimeRecord,
    returnToServiceApproved: true,
    returnToServiceApprovedBy: approverName,
    returnToServiceTimestamp: nowStr,
    clinicalCustodianSignOff: custodianName
      ? {
          custodianName,
          timestamp: nowStr
        }
      : workOrder.clinicalCustodianSignOff
  };

  const newLifecycleEvent: EquipmentLifecycleEvent = {
    id: `EVT-RTS-${Date.now()}`,
    timestamp: nowStr,
    eventType: 'return_to_service',
    descriptionAr: `اعتماد الإفراج السريري في مسار العمل الاصطناعي (Release in Synthetic Workflow) وتوقيع الاستلام بواسطة ${custodianName || 'مسؤول القسم'}.`,
    descriptionEn: `Clinical release approved in synthetic workflow by ${approverName}. Handover signed.`,
    actor: approverName
  };

  const updatedDowntimes = closedDowntime
    ? asset.downtimeHistory.map(d => (d.id === closedDowntime!.id ? closedDowntime! : d))
    : asset.downtimeHistory;

  const updatedAsset: MedicalEquipmentAsset = {
    ...asset,
    currentStatus: 'in_service',
    activeWorkOrderId: undefined,
    latestSafetyTest: workOrder.safetyTestRecord || asset.latestSafetyTest,
    latestCalibration: workOrder.calibrationRecord || asset.latestCalibration,
    lifecycleHistory: [newLifecycleEvent, ...asset.lifecycleHistory],
    downtimeHistory: updatedDowntimes
  };

  return {
    success: true,
    updatedAsset,
    updatedWorkOrder
  };
}

export function quarantineForRecall(
  asset: MedicalEquipmentAsset,
  alert: SafetyAlertFsca
): MedicalEquipmentAsset {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const event: EquipmentLifecycleEvent = {
    id: `EVT-QUAR-${Date.now()}`,
    timestamp: nowStr,
    eventType: 'safety_alert_quarantine',
    descriptionAr: `تطبيق حظر السلامة والحجر الاحترازي استجابة لإشعار ${alert.fscaAlertNumber}.`,
    descriptionEn: `Safety quarantine applied responding to alert ${alert.fscaAlertNumber}.`,
    actor: 'ضابط سلامة الأجهزة الطبية'
  };

  return {
    ...asset,
    currentStatus: 'quarantined_safety_hold',
    fscaQuarantineRef: alert.fscaAlertNumber,
    lifecycleHistory: [event, ...asset.lifecycleHistory]
  };
}

export function resolveRecallRemediation(
  asset: MedicalEquipmentAsset,
  alert: SafetyAlertFsca
): MedicalEquipmentAsset {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const event: EquipmentLifecycleEvent = {
    id: `EVT-REL-${Date.now()}`,
    timestamp: nowStr,
    eventType: 'safety_alert_release',
    descriptionAr: `اكتمال تنفيذ الإجراء التصحيحي ورفع حظر السلامة للإشعار ${alert.fscaAlertNumber}.`,
    descriptionEn: `Corrective action verified. Safety quarantine lifted for ${alert.fscaAlertNumber}.`,
    actor: 'ضابط سلامة الأجهزة الطبية'
  };

  return {
    ...asset,
    currentStatus: 'in_service',
    fscaQuarantineRef: undefined,
    lifecycleHistory: [event, ...asset.lifecycleHistory]
  };
}

export function retireAndDecommissionEquipment(
  asset: MedicalEquipmentAsset,
  decontaminationCertRef: string | undefined,
  reason: string,
  disposalMethod: 'recycle_parts' | 'destruction_hazardous' | 'oem_trade_in' | 'donation',
  authorizedBy: string
): { success: boolean; updatedAsset?: MedicalEquipmentAsset; error?: string } {
  // BM25: Decontamination clearance required ONLY where applicable
  if (asset.decontaminationProfile.requirementStatus === 'required') {
    if (!decontaminationCertRef || decontaminationCertRef.trim().length === 0) {
      return {
        success: false,
        error: `حظر أمان بيولوجي: يتطلب هذا الأصل (${asset.nameAr}) شهادة تطهير وخلو تلوث معتمدة من ${asset.decontaminationProfile.source} قبل التكهين النهائي.`
      };
    }
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const event: EquipmentLifecycleEvent = {
    id: `EVT-DECOM-${Date.now()}`,
    timestamp: nowStr,
    eventType: 'decommissioning',
    descriptionAr: `تكهين وسحب الأصل الطبي نهائياً. طريقة التخلص: ${disposalMethod}. المعتمد: ${authorizedBy}.`,
    descriptionEn: `Decommissioned and retired. Disposal method: ${disposalMethod}. Authorized by: ${authorizedBy}.`,
    actor: authorizedBy
  };

  const updatedAsset: MedicalEquipmentAsset = {
    ...asset,
    currentStatus: 'decommissioned',
    activeWorkOrderId: undefined,
    decommissioningRecord: {
      date: nowStr.split(' ')[0],
      reason,
      decontaminationCertRef,
      decontaminationStatus: asset.decontaminationProfile.requirementStatus === 'required' ? 'completed_reference' : 'not_required',
      disposalMethod,
      authorizedBy
    },
    lifecycleHistory: [event, ...asset.lifecycleHistory]
  };

  return {
    success: true,
    updatedAsset
  };
}
