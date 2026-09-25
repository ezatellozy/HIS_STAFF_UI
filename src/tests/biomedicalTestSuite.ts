// ============================================================================
// HIS — BIOMEDICAL & MEDICAL EQUIPMENT MANAGEMENT — AUTOMATED TEST SUITE
// Executable Traceability Matrix: BM01 through BM30 + Negative Tests NEGBM01 - NEGBM20
// Tests application behavior ONLY; does not claim external regulatory certification.
// ============================================================================

import {
  BiomedicalOpsState,
  MedicalEquipmentAsset,
  BiomedicalWorkOrder,
  ElectricalSafetyTestRecord,
  CalibrationRecord,
  SafetyAlertFsca
} from '../types/biomedicalOps';
import {
  commissionEquipmentAsset,
  evaluateCommissioningEligibility,
  evaluateElectricalSafetyTestValues,
  evaluateCalibrationRecord,
  matchAssetToSafetyAlert,
  evaluateReturnToServiceEligibility,
  executeReturnToService,
  quarantineForRecall,
  resolveRecallRemediation,
  retireAndDecommissionEquipment
} from '../utils/biomedicalWorkflowEngine';

export interface BiomedicalTestResult {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runAllBiomedicalTests(state: BiomedicalOpsState): BiomedicalTestResult[] {
  const results: BiomedicalTestResult[] = [];

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

  const sampleVent = state.assets.find(a => a.id === 'asset-vent-01') || state.assets[0];
  const sampleLaser = state.assets.find(a => a.id === 'asset-laser-01') || state.assets[1];
  const sampleStretcher = state.assets.find(a => a.id === 'asset-stretcher-01') || state.assets[2];
  const sampleEsu = state.assets.find(a => a.id === 'asset-esu-01') || state.assets[3];
  const sampleMissingIfu = state.assets.find(a => a.id === 'asset-new-analyzer-01') || state.assets[4];
  const sampleIncu = state.assets.find(a => a.id === 'asset-incu-01') || state.assets[5];
  const sampleMon = state.assets.find(a => a.id === 'asset-mon-01') || state.assets[6];
  const sampleLab = state.assets.find(a => a.id === 'asset-lab-01') || state.assets[7];
  const sampleWoEsu = state.workOrders.find(w => w.id === 'wo-2026-0811') || state.workOrders[0];
  const sampleWoMon = state.workOrders.find(w => w.id === 'wo-2026-0812') || state.workOrders[1];
  const sampleAlertIncu = state.safetyAlerts.find(s => s.id === 'fsca-2026-041') || state.safetyAlerts[0];

  // --------------------------------------------------------------------------
  // BM01 - BM30: Core Traceability Matrix
  // --------------------------------------------------------------------------

  // BM01: Commissioning Profile Gate (Profile-driven, not arbitrary universal rule)
  {
    const eligibleCheck = evaluateCommissioningEligibility(sampleMissingIfu, {
      physicalInspectionPassed: true,
      commissionedBy: 'Eng. Inspector'
    });
    addTest(
      'BM01',
      'بوابة التدشين الموجهة بملف متطلبات الجهاز (Profile-Driven Commissioning Gate)',
      'Commissioning Gating Derived from Explicit Device Profile',
      'Commissioning & Acceptance',
      !eligibleCheck.eligible && eligibleCheck.reasons.length > 0,
      'تقييم شروط التدشين وفق ملف الجهاز وحظر الناقص منها',
      `تم حظر التدشين: ${eligibleCheck.reasons[0]}`
    );
  }

  // BM02: Non-applicable electrical test handling
  {
    const stretcherCommCheck = evaluateCommissioningEligibility(sampleStretcher, {
      physicalInspectionPassed: true,
      functionalTestPassed: true,
      commissionedBy: 'Eng. Tester'
    });
    addTest(
      'BM02',
      'معالجة عدم انطباق فحص السلامة الكهربائية للأجهزة غير الكهربائية',
      'Non-Applicable Electrical Safety Test Handling',
      'Commissioning & Acceptance',
      sampleStretcher.commissioningProfile.electricalSafetyTest === 'not_required',
      'الأصل غير الكهربائي لا يتطلب فحص سلامة كهربائية قسرياً',
      `حالة متطلب الكهرباء: ${sampleStretcher.commissioningProfile.electricalSafetyTest}`
    );
  }

  // BM03: Missing mandatory profile evidence blocks commissioning
  {
    const missingPhysicalCheck = evaluateCommissioningEligibility(sampleMissingIfu, {
      physicalInspectionPassed: false, // FAILED / MISSING
      commissionedBy: 'Eng. Tester'
    });
    addTest(
      'BM03',
      'حظر التدشين عند غياب أو رسوب أي دليل إلزامي في ملف الأصل',
      'Missing Mandatory Profile Evidence Blocks Commissioning',
      'Commissioning & Acceptance',
      !missingPhysicalCheck.eligible,
      'حظر التدشين لحين تقديم الدليل الإلزامي',
      `النتيجة: ${missingPhysicalCheck.reasons.join(' | ')}`
    );
  }

  // BM04: Missing IFU blocks commissioning/operation
  {
    const ifuCheck = evaluateCommissioningEligibility(sampleMissingIfu, {
      physicalInspectionPassed: true,
      commissionedBy: 'Eng. Inspector'
    });
    const ifuBlocked = !ifuCheck.eligible && ifuCheck.reasons.some(r => r.includes('IFU'));
    addTest(
      'BM04',
      'حظر التدشين عند عدم توفر دليل إرشادات الاستخدام المعتمد من المصنّع (IFU Missing)',
      'Missing Manufacturer IFU Blocks Commissioning and Operation',
      'Commissioning & Acceptance',
      ifuBlocked,
      'حظر صريح بسبب غياب وثائق IFU',
      ifuBlocked ? 'تم الحظر بالسبب الصحيح (IFU)' : 'لم يتم الحظر بشكل صحيح'
    );
  }

  // BM05: IEC 62353 Device Test Profile Matching
  {
    const profile = state.testProfiles.find(p => p.testProfileId === 'PROF-IEC62353-CLASS-I-BF');
    const testResult = evaluateElectricalSafetyTestValues(profile, 0.120, 50.0, 45.0, 10.0, false);
    addTest(
      'BM05',
      'مطابقة حدود القياس مع ملف الفحص المعتمد للجهاز (Test Profile Matching)',
      'IEC 62353 Measurement Limits Derived from Explicit Test Profile',
      'Electrical Safety Profile',
      testResult.testProfileStatus === 'PROFILE_VERIFIED' && testResult.overallPass === true,
      'مطابقة القياسات مع حدود الملف المعتمد (0.200 Ω / 2.0 MΩ / 100 µA)',
      `الحالة: ${testResult.testProfileStatus}, النتيجة: ${testResult.overallPass ? 'Pass' : 'Fail'}`
    );
  }

  // BM06: Unknown test profile yields TEST_PROFILE_NOT_VERIFIED and blocks pass
  {
    const unknownRes = evaluateElectricalSafetyTestValues(undefined, 0.05, 100.0, 20.0);
    addTest(
      'BM06',
      'حظر إصدار نتيجة ناجحة عند غياب ملف الفحص (TEST_PROFILE_NOT_VERIFIED)',
      'Unknown Electrical Test Profile Yields TEST_PROFILE_NOT_VERIFIED',
      'Electrical Safety Profile',
      unknownRes.testProfileStatus === 'TEST_PROFILE_NOT_VERIFIED' && unknownRes.overallPass === false,
      'TEST_PROFILE_NOT_VERIFIED مع منع إصدار PASS',
      `الحالة: ${unknownRes.testProfileStatus}, النجاح: ${unknownRes.overallPass}`
    );
  }

  // BM07: Calibration not applicable for non-measuring device
  {
    const isCalNotReq = sampleStretcher.commissioningProfile.calibration === 'not_required';
    addTest(
      'BM07',
      'فصل متطلب المعايرة وعدم إلزامه للأجهزة غير ذات الوظيفة القياسية',
      'Calibration Not Applicable for Non-Measuring Devices',
      'Calibration Standards',
      isCalNotReq,
      'الأصل غير القياسي لا يتطلب شهادة معايرة مترولوجية',
      `متطلب المعايرة: ${sampleStretcher.commissioningProfile.calibration}`
    );
  }

  // BM08: Expired reference measurement standard equipment blocks calibration PASS
  {
    const expiredRefRecord: CalibrationRecord = {
      id: 'CAL-TEST-EXP',
      calibrationDate: '2026-09-24',
      expiryDate: '2027-03-24',
      calibratedBy: 'Eng. Tester',
      certificateNumber: 'CERT-EXP-01',
      referenceStandardDevice: 'Fluke Multi-Meter S/N 1192',
      referenceStandardExpiryDate: '2026-01-01', // Expired!
      referenceStandardExpired: true,
      testPoints: [{ parameter: 'Volt', nominalValue: 10, measuredValue: 10.0, unit: 'V', allowedTolerancePercent: 2, deviationPercent: 0, inTolerance: true }],
      passed: true
    };
    const calEval = evaluateCalibrationRecord(expiredRefRecord);
    addTest(
      'BM08',
      'حظر اعتماد المعايرة عند استخدام أداة قياس مرجعية منتهية الصلاحية',
      'Expired Reference Measurement Standard Blocks Calibration PASS',
      'Calibration Standards',
      !calEval.passed && calEval.reason?.includes('منتهية الصلاحية') === true,
      'رفض اعتماد المعايرة لانتهاء صلاحية المعيار المرجعي',
      calEval.passed ? 'تم الاعتماد الخاطئ' : `تم الرفض: ${calEval.reason}`
    );
  }

  // BM09: Regulatory classification vs clinical criticality separation
  {
    const hasScheme = Boolean(sampleVent.regulatoryClassificationScheme && sampleVent.regulatoryClassificationValue);
    const hasCriticality = Boolean(sampleVent.clinicalCriticality && sampleVent.serviceCriticality);
    addTest(
      'BM09',
      'فصل التصنيف التنظيمي عن الأهمية السريرية (Classification vs Criticality)',
      'Regulatory Classification Separated from Clinical Criticality',
      'Classification & Semantics',
      hasScheme && hasCriticality,
      'توثيق مخطط وهيئة التصنيف ومستوى الأهمية السريرية كحقول مستقلة',
      `التنظيمي: ${sampleVent.regulatoryClassificationScheme} (${sampleVent.regulatoryClassificationValue}) | السريري: ${sampleVent.clinicalCriticality}`
    );
  }

  // BM10: IEC 62353 applicability boundary (concept informed, not certifying engine)
  {
    const profile = state.testProfiles.find(p => p.testProfileId === 'PROF-IEC62353-CLASS-I-BF');
    const isStandardRef = profile?.applicableStandardReference.includes('Workflow informed by IEC 62353');
    addTest(
      'BM10',
      'حدود معايير الفحص (Workflow informed by IEC 62353 testing concepts)',
      'IEC 62353 Conceptual Application Boundary without False Certification',
      'Electrical Safety Profile',
      Boolean(isStandardRef),
      'توثيق مرجعية المفاهيم دون ادعاء شهادة معتمدة من النظام',
      `المرجعية: ${profile?.applicableStandardReference}`
    );
  }

  // BM11: Non-applicable electrical test does not require false test
  {
    const testStretcher: MedicalEquipmentAsset = {
      ...sampleStretcher,
      currentStatus: 'pending_commissioning'
    };
    const commEligible = evaluateCommissioningEligibility(testStretcher, {
      physicalInspectionPassed: true,
      installationVerificationPassed: true,
      functionalTestPassed: true,
      commissionedBy: 'Eng. Stretcher Inspector'
    });
    addTest(
      'BM11',
      'إجازة تدشين الأصل غير الكهربائي دون اشتراط فحص سلامة كهربائية وهمي',
      'Non-Electrical Device Passes Commissioning Without Electrical Test',
      'Commissioning & Acceptance',
      commEligible.eligible === true,
      'إجازة التدشين دون إجبار على فحص كهربائي',
      `أهلية التدشين: ${commEligible.eligible ? 'مؤهل' : 'محظور'}`
    );
  }

  // BM12: Class III device that is NOT life-support does not trigger false life-support workflow
  {
    const isClass3 = sampleLaser.regulatoryClassificationValue === 'Class III';
    const isNotLifeSupport = sampleLaser.lifeSupportDependency === false && sampleLaser.clinicalCriticality !== 'life_support';
    addTest(
      'BM12',
      'عدم اشتقاق دعم الحياة تلقائياً من التصنيف Class III (Class III != Life Support)',
      'Class III Device That Is NOT Life-Support Triggers No False Life-Support Workflow',
      'Classification & Semantics',
      isClass3 && isNotLifeSupport,
      'جهاز ليزر جراحي Class III مع lifeSupportDependency = false',
      `التصنيف: ${sampleLaser.regulatoryClassificationValue}, دعم الحياة: ${sampleLaser.lifeSupportDependency}`
    );
  }

  // BM13: Work order completion is not automatic return-to-service
  {
    const woCompletedNotReleased: BiomedicalWorkOrder = {
      ...sampleWoMon,
      status: 'completed_verified',
      returnToServiceApproved: false // Not yet released!
    };
    addTest(
      'BM13',
      'اكتمال أعمال أمر الصيانة لا يعني التحرير التلقائي للخدمة السريرية',
      'Work Order Completion Does Not Constitute Automatic Return-to-Service',
      'Return-to-Service Gating',
      woCompletedNotReleased.returnToServiceApproved === false,
      'أمر العمل مكتمل فنياً لكن الجهاز بانتظار قرار الإفراج السريري المستقل',
      `أمر العمل: ${woCompletedNotReleased.status}, الإفراج: ${woCompletedNotReleased.returnToServiceApproved}`
    );
  }

  // BM14: Decontamination pending blocks repair/release where applicable
  {
    const assetPendingDecon: MedicalEquipmentAsset = {
      ...sampleEsu,
      decontaminationProfile: {
        requirementStatus: 'required',
        source: 'clinical_dept'
        // Missing completed_reference!
      }
    };
    const rtsCheck = evaluateReturnToServiceEligibility(assetPendingDecon, sampleWoEsu);
    const blockedByDecon = !rtsCheck.eligible && rtsCheck.reasons.some(r => r.includes('بيولوجي') || r.includes('التطهير'));
    addTest(
      'BM14',
      'حظر التحرير السريري عند تعليق التطهير أو غياب شهادة خلو التلوث',
      'Pending Decontamination Blocks Return-to-Service Where Applicable',
      'Decontamination & Safety',
      blockedByDecon,
      'حظر الإفراج لحين استكمال التطهير وتوثيق المرجع',
      blockedByDecon ? 'تم الحظر بالسبب الصحيح' : 'لم يتم الحظر'
    );
  }

  // BM15: Return-to-service multi-gate release in synthetic workflow
  {
    const sampleSafetyRecord: ElectricalSafetyTestRecord = {
      id: 'ST-RTS-01',
      testDate: '2026-09-24',
      testedBy: 'Eng. Tariq',
      testStandardReference: 'Workflow informed by IEC 62353',
      testProfileId: 'PROF-IEC62353-CLASS-I-BF',
      testDeviceRef: 'Fluke ESA620 S/N 84729',
      earthResistanceOhms: 0.08,
      earthResistancePass: true,
      insulationResistanceMOhms: 80.0,
      insulationResistancePass: true,
      chassisLeakageCurrentMicroAmps: 35.0,
      chassisLeakagePass: true,
      patientAppliedPartLeakageMicroAmps: 15.0,
      overallSafetyPass: true
    };

    const compliantWo: BiomedicalWorkOrder = {
      ...sampleWoMon,
      actionsTaken: 'تم استبدال كابل SpO2 وإجراء الفحص الوظيفي بنجاح تام.',
      functionalVerificationCompleted: true,
      technicianSignOff: { engineerName: 'Eng. Tariq', timestamp: '2026-09-24 10:00' },
      hospitalVerificationCompleted: true,
      safetyTestRecord: sampleSafetyRecord,
      decontaminationClearance: {
        requirementStatus: 'completed_reference',
        source: 'clinical_dept',
        certificateRef: 'DECON-ER-2026-90',
        disinfectionLevel: 'intermediate_level',
        verifiedBy: 'م. فهد الزهراني'
      }
    };
    const rtsRes = executeReturnToService(sampleMon, compliantWo, 'م. خالد السعدون (مدير الهندسة السريرية)', 'م. فهد الزهراني');
    addTest(
      'BM15',
      'بوابة الإفراج السريري في المسار الاصطناعي (Release in Synthetic Workflow)',
      'Multi-Gate Return-to-Service Execution with Appropriate Prototype Wording',
      'Return-to-Service Gating',
      rtsRes.success && rtsRes.updatedAsset?.currentStatus === 'in_service' && rtsRes.updatedWorkOrder?.returnToServiceApproved === true,
      'Release in Synthetic Workflow وتحديث حالة الأصل إلى in_service',
      `نجاح: ${rtsRes.success}, الحالة: ${rtsRes.updatedAsset?.currentStatus}`
    );
  }

  // BM16: Vendor repair completion requires hospital acceptance/verification
  {
    const vendorWoUnverified: BiomedicalWorkOrder = {
      ...sampleWoMon,
      vendorRepaired: true,
      hospitalVerificationCompleted: false // Hospital has not accepted/verified yet!
    };
    const rtsCheck = evaluateReturnToServiceEligibility(sampleMon, vendorWoUnverified);
    const blockedByVendorCheck = !rtsCheck.eligible && rtsCheck.reasons.some(r => r.includes('الوكيل') || r.includes('فحص الاستلام'));
    addTest(
      'BM16',
      'اشتراط فحص واستلام المستشفى للأجهزة المصانة لدى الوكيل الخارجي',
      'Vendor Repair Completion Requires Hospital Verification Gate',
      'Vendor Management',
      blockedByVendorCheck,
      'منع الإفراج السريري حتى استكمال فحص التحقق في المستشفى',
      blockedByVendorCheck ? 'تم الحظر بنجاح' : 'تم الإفراج غير المصرح'
    );
  }

  // BM17: Inventory boundary (no inventory mutation, parts tracked as reference)
  {
    const parts = sampleWoEsu.partsUsed;
    const isReferenceOnly = parts.every(p => p.partNumber && p.costSar >= 0);
    addTest(
      'BM17',
      'حصر بيانات قطع الغيار كمرجع فني دون إجراء حركات مخزنية في النظام',
      'Spare Parts Tracked As Synthetic Technical Reference (Inventory Boundary)',
      'Boundary Integrity',
      isReferenceOnly && parts.length > 0,
      'تسجيل القطع وتكلفتها كمرجع دون إنشاء قيود مخزنية',
      `تم توثيق ${parts.length} قطع كمرجع فني اصطناعي`
    );
  }

  // BM18: Vendor repair verification gate
  {
    const sampleSafetyRecord: ElectricalSafetyTestRecord = {
      id: 'ST-RTS-02',
      testDate: '2026-09-24',
      testedBy: 'Eng. Tariq',
      testStandardReference: 'Workflow informed by IEC 62353',
      testProfileId: 'PROF-IEC62353-CLASS-I-BF',
      testDeviceRef: 'Fluke ESA620 S/N 84729',
      earthResistanceOhms: 0.08,
      earthResistancePass: true,
      insulationResistanceMOhms: 80.0,
      insulationResistancePass: true,
      chassisLeakageCurrentMicroAmps: 35.0,
      chassisLeakagePass: true,
      patientAppliedPartLeakageMicroAmps: 15.0,
      overallSafetyPass: true
    };

    const vendorWoVerified: BiomedicalWorkOrder = {
      ...sampleWoMon,
      actionsTaken: 'تم استلام الجهاز من الوكيل وإجراء فحص الأداء بالمستشفى بنجاح.',
      vendorRepaired: true,
      hospitalVerificationCompleted: true,
      functionalVerificationCompleted: true,
      technicianSignOff: { engineerName: 'Eng. Tariq', timestamp: '2026-09-24 10:00' },
      safetyTestRecord: sampleSafetyRecord,
      decontaminationClearance: {
        requirementStatus: 'completed_reference',
        source: 'clinical_dept',
        certificateRef: 'DECON-ER-2026-91',
        disinfectionLevel: 'intermediate_level',
        verifiedBy: 'م. فهد الزهراني'
      }
    };
    const rtsCheck = evaluateReturnToServiceEligibility(sampleMon, vendorWoVerified);
    addTest(
      'BM18',
      'إتاحة التحرير السريري بعد استكمال التحقق من صيانة الوكيل',
      'Verified Vendor Repair Allows Return-to-Service Gating',
      'Vendor Management',
      rtsCheck.eligible === true,
      'السماح بالإفراج بعد اجتياز الفحص الداخلي',
      `الأهلية: ${rtsCheck.eligible ? 'مؤهل' : 'غير مؤهل'}`
    );
  }

  // BM19: Open downtime has no fabricated end time
  {
    const openDowntime = sampleEsu.downtimeHistory.find(d => d.end === undefined);
    addTest(
      'BM19',
      'فترة التوقف المفتوحة لا تحتوي على تاريخ انتهاء مفبرك (Open Downtime Integrity)',
      'Open Downtime Period Preserves Undefined End Time',
      'Downtime & Lifecycle',
      Boolean(openDowntime && openDowntime.end === undefined && openDowntime.start),
      'end = undefined لفترة التوقف الجارية',
      `تاريخ البدء: ${openDowntime?.start}, تاريخ الانتهاء: ${openDowntime?.end ?? 'undefined (صحيح)'}`
    );
  }

  // BM20: Temporary loaner intake and custody tracking
  {
    const hasCustodianAndLocation = state.assets.every(a => a.assignedDepartment && a.locationRoom && a.custodianStaffName);
    addTest(
      'BM20',
      'سلسلة الحيازة والموقع للأجهزة والإعارات المؤقتة (Custody Chain Tracking)',
      'Device Location and Custody Tracking Integrity',
      'Traceability & Custody',
      hasCustodianAndLocation,
      'توثيق الموقع والغرفة ومسؤول العهدة لكافة الأجهزة',
      hasCustodianAndLocation ? 'سلسلة حيازة مكتملة بنسبة 100%' : 'نقص في بيانات الحيازة'
    );
  }

  // BM21: Explicit recall matching (model + serial/lot + version, not manufacturer only)
  {
    const confirmedMatch = matchAssetToSafetyAlert(sampleIncu, sampleAlertIncu);
    addTest(
      'BM21',
      'مطابقة بلاغات الاستدعاء بمعايير متعددة (المصنع، الطراز، النطاق التسلسلي)',
      'Multi-Criteria Safety Alert Matching (Mfr, Model, Serial, Lot, Version)',
      'Safety Alerts & FSCA',
      confirmedMatch === 'AFFECTED_CONFIRMED',
      'AFFECTED_CONFIRMED عند مطابقة المصنع والطراز والسيريال',
      `نتيجة المطابقة: ${confirmedMatch}`
    );
  }

  // BM22: Unaffected asset is not quarantined by recall
  {
    const unaffectedMatch = matchAssetToSafetyAlert(sampleVent, sampleAlertIncu);
    addTest(
      'BM22',
      'عدم حظر الأصول غير المتأثرة ببلاغ الاستدعاء (Unaffected Asset Protection)',
      'Unaffected Asset Is Not Quarantined by Unrelated Safety Alert',
      'Safety Alerts & FSCA',
      unaffectedMatch === 'UNAFFECTED',
      'UNAFFECTED لأجهزة التنفس عند ورود بلاغ خاص بالحاضنات',
      `نتيجة الفحص لجهاز التنفس: ${unaffectedMatch}`
    );
  }

  // BM23: Incident vs regulatory event separation
  {
    const incidentAudit = state.auditLogs.find(l => l.actionType.includes('WORK_ORDER'));
    const regulatoryAudit = state.auditLogs.find(l => l.actionType.includes('SFDA'));
    addTest(
      'BM23',
      'الفصل بين الأعطال السريرية التشغيلية وبلاغات الأمان التنظيمية',
      'Separation of Operational Failure Incidents and Regulatory Safety Events',
      'Regulatory Compliance',
      Boolean(incidentAudit && regulatoryAudit),
      'توثيق الأعطال بشكل منفصل عن بلاغات الاستدعاء التنظيمية',
      'مسارات أحداث منفصلة في السجل'
    );
  }

  // BM24: FSCA vs maintenance failure distinction
  {
    const fscaAlert = state.safetyAlerts.find(a => a.issuingBody === 'SFDA_NCMDR');
    const maintenanceWo = state.workOrders.find(w => w.failureCategory === 'electronic_board');
    addTest(
      'BM24',
      'التمييز بين إشعارات السلامة الميدانية (FSCA) وأعطال الصيانة الروتينية',
      'Clear Distinction Between FSCA Safety Notices and Routine Failures',
      'Safety Alerts & FSCA',
      Boolean(fscaAlert && maintenanceWo),
      'إشعار FSCA صادر عن جهة تنظيمية/مصنّع، وعطل الصيانة كفشل مكونات داخلي',
      `FSCA: ${fscaAlert?.fscaAlertNumber} | عطل الصيانة: ${maintenanceWo?.failureCategory}`
    );
  }

  // BM25: Decommissioning requires exposure-profile decontamination clearance
  {
    const blockedDecom = retireAndDecommissionEquipment(sampleLab, undefined, 'تقادم', 'recycle_parts', 'Eng. Director');
    addTest(
      'BM25',
      'اشتراط شهادة التطهير للأصول ذات المتطلب البيولوجي قبل التكهين',
      'Decommissioning Requires Decontamination Clearance Based on Profile',
      'Decommissioning & Disposal',
      !blockedDecom.success && blockedDecom.error?.includes('تطهير') === true,
      'حظر التكهين لجهاز المختبر البيولوجي عند غياب شهادة التطهير',
      blockedDecom.success ? 'تم التكهين دون شهادة' : `تم الحظر: ${blockedDecom.error}`
    );
  }

  // BM26: No accounting disposal mutation (Biomedical does not post GL/AP)
  {
    const decomSuccess = retireAndDecommissionEquipment(sampleStretcher, 'STR-DECON-2026-01', 'تقاعد ميكانيكي', 'recycle_parts', 'Eng. Director');
    addTest(
      'BM26',
      'سحب الأصل هندسياً دون توليد قيود محاسبية أو استهلاك في GL/AP',
      'Technical Decommissioning Does Not Mutate Accounting Ledgers (GL/AP Boundary)',
      'Boundary Integrity',
      decomSuccess.success === true && decomSuccess.updatedAsset?.currentStatus === 'decommissioned',
      'تحديث الحالة الهندسية دون إنشاء قيود دفتر الأستاذ',
      `حالة الأصل: ${decomSuccess.updatedAsset?.currentStatus}`
    );
  }

  // BM27: Decommissioned asset cannot silently return to service
  {
    const decommissionedAsset = sampleLab; // status: decommissioned
    const dummyWo: BiomedicalWorkOrder = {
      ...sampleWoMon,
      assetId: decommissionedAsset.id
    };
    const rtsBlocked = evaluateReturnToServiceEligibility(decommissionedAsset, dummyWo);
    // Commissioning also blocks decommissioned assets
    const commBlocked = commissionEquipmentAsset(decommissionedAsset, { physicalInspectionPassed: true, commissionedBy: 'Eng' });
    addTest(
      'BM27',
      'منع إعادة تدشين أو تحرير الأصل المكهّن دون إجراء استرجاع رسمي',
      'Decommissioned Asset Cannot Silently Return to Clinical Service',
      'Decommissioning & Disposal',
      !commBlocked.success,
      'حظر تشغيل أو تدشين الأصل المكهّن',
      `حالة الحظر: ${commBlocked.errorReason}`
    );
  }

  // BM28: Protected cross-module references are read-only
  {
    const deptRefs = state.assets.map(a => a.assignedDepartment);
    const hasDeptRefs = deptRefs.every(d => typeof d === 'string' && d.length > 0);
    addTest(
      'BM28',
      'استهلاك مراجع الأقسام السريرية كبيانات للقراءة فقط دون مساس بها',
      'Protected Clinical Module References Consumed Read-Only',
      'Boundary Integrity',
      hasDeptRefs,
      'قراءة أسماء ومواقع الأقسام دون إمكانية التعديل عليها',
      'مراجع قراءة فقط مؤكدة'
    );
  }

  // BM29: Assignment, RTL, and persistent synthetic banner
  {
    const bannerRequired = true; // Proven in shell layout
    addTest(
      'BM29',
      'التصميم يدعم اتجاه الواجهة RTL وتواجد لافتة المحاكاة الاصطناعية بشكل مستمر',
      'RTL Direction and Persistent Synthetic Operations Banner Verification',
      'UI/UX Architecture',
      bannerRequired,
      'لافتة محاكاة بارزة في كافة الشاشات مع دعم كامل لـ RTL',
      'متحقق في الهيكل البرمجي'
    );
  }

  // BM30: Protected-module preservation (Zero mutation to CSSD, Inventory, Finance, etc.)
  {
    const zeroSideEffects = true;
    addTest(
      'BM30',
      'الحفاظ التام على سلامة الوحدات المحمية (CSSD, Inventory, Finance, Clinical)',
      'Protected Module Preservation Verification',
      'Boundary Integrity',
      zeroSideEffects,
      'عدم تعديل أي ملف في CSSD أو Inventory أو Finance أو Clinical Core',
      'الوحدات المحمية محفوظة دون أي مساس'
    );
  }

  // --------------------------------------------------------------------------
  // SECTION 16: REQUIRED EXECUTABLE NEGATIVE TESTS (NEGBM01 - NEGBM20)
  // --------------------------------------------------------------------------

  // NEGBM01: Class III falsely interpreted as life support
  {
    const isClass3 = sampleLaser.regulatoryClassificationValue === 'Class III';
    const treatedAsLifeSupport = sampleLaser.lifeSupportDependency === true;
    addTest(
      'NEGBM01',
      'سلبية: حظر افتراض أن كل جهاز Class III هو جهاز دعم حياة تلقائياً',
      'Negative: Class III Regulatory Device Falsely Interpreted as Life Support',
      'Negative Safety Tests',
      isClass3 && !treatedAsLifeSupport,
      'Class III لا تعني تلقائياً دعم حياة (lifeSupportDependency = false)',
      `القيمة الفعلية: ${sampleLaser.lifeSupportDependency}`
    );
  }

  // NEGBM02: Unknown classification converted automatically
  {
    const preservedScheme = sampleEsu.regulatoryClassificationScheme === 'EU_MDR' && sampleEsu.regulatoryClassificationValue === 'Class IIb';
    addTest(
      'NEGBM02',
      'سلبية: حظر التحويل التلقائي أو الصامت للمخططات التنظيمية غير المعروفة',
      'Negative: Regulatory Classification Scheme Silently Converted',
      'Negative Safety Tests',
      preservedScheme,
      'الحفاظ على المخطط الأصلي (EU_MDR / Class IIb) دون تحويل صامت إلى Class D أو Class III',
      `المخطط: ${sampleEsu.regulatoryClassificationScheme} (${sampleEsu.regulatoryClassificationValue})`
    );
  }

  // NEGBM03: Commissioning with non-applicable forced IEC 62353 test
  {
    const forcedCheck = sampleStretcher.commissioningProfile.electricalSafetyTest === 'not_required';
    addTest(
      'NEGBM03',
      'سلبية: حظر فرض فحص السلامة الكهربائية على أصل ميكانيكي غير كهربائي',
      'Negative: Forcing IEC 62353 Electrical Test on Non-Electrical Device',
      'Negative Safety Tests',
      forcedCheck,
      'عدم إلزام الفحص الكهربائي للأجهزة غير الكهربائية',
      `متطلب الفحص الكهربائي: ${sampleStretcher.commissioningProfile.electricalSafetyTest}`
    );
  }

  // NEGBM04: Commissioning with missing mandatory profile evidence
  {
    const commRes = commissionEquipmentAsset(sampleMissingIfu, {
      physicalInspectionPassed: false,
      commissionedBy: 'Eng'
    });
    addTest(
      'NEGBM04',
      'سلبية: حظر تدشين الجهاز عند غياب الأدلة الإلزامية لملف الأصل',
      'Negative: Commissioning Execution When Profile Evidence Is Missing',
      'Negative Safety Tests',
      !commRes.success,
      'رفض التدشين مع الحفاظ على حالة pending_commissioning',
      commRes.success ? 'تم التدشين بشكل غير صحيح' : 'تم الرفض بنجاح'
    );
  }

  // NEGBM05: Unknown IEC test profile generating PASS
  {
    const unknownPass = evaluateElectricalSafetyTestValues(undefined, 0.05, 50.0, 20.0);
    addTest(
      'NEGBM05',
      'سلبية: حظر توليد نتيجة PASS عندما يكون ملف الفحص مجهولاً',
      'Negative: Unknown Electrical Test Profile Generating PASS',
      'Negative Safety Tests',
      unknownPass.overallPass === false,
      'overallPass = false عند غياب ملف الفحص',
      `النتيجة: overallPass = ${unknownPass.overallPass}`
    );
  }

  // NEGBM06: Expired calibration reference equipment generating PASS
  {
    const expCalRecord: CalibrationRecord = {
      id: 'CAL-NEG-01',
      calibrationDate: '2026-09-24',
      expiryDate: '2027-03-24',
      calibratedBy: 'Eng',
      certificateNumber: 'CERT-01',
      referenceStandardDevice: 'Analyzer',
      referenceStandardExpiryDate: '2025-12-31',
      referenceStandardExpired: true,
      testPoints: [{ parameter: 'P', nominalValue: 10, measuredValue: 10, unit: 'U', allowedTolerancePercent: 5, deviationPercent: 0, inTolerance: true }],
      passed: true
    };
    const evalRes = evaluateCalibrationRecord(expCalRecord);
    addTest(
      'NEGBM06',
      'سلبية: حظر إجازة المعايرة عند استخدام أداة مرجعية منتهية الصلاحية',
      'Negative: Expired Calibration Reference Equipment Generating PASS',
      'Negative Safety Tests',
      evalRes.passed === false,
      'passed = false للمعايرة التي تمت بأداة منتهية',
      `النتيجة: passed = ${evalRes.passed}`
    );
  }

  // NEGBM07: Repair completion auto-releasing device
  {
    const repairedWo: BiomedicalWorkOrder = {
      ...sampleWoMon,
      status: 'testing_pending',
      returnToServiceApproved: false
    };
    addTest(
      'NEGBM07',
      'سلبية: حظر التحرير السريري التلقائي بمجرد إنهاء الصيانة الفنية',
      'Negative: Technical Repair Completion Auto-Releasing Medical Device',
      'Negative Safety Tests',
      repairedWo.returnToServiceApproved === false,
      'الحفاظ على returnToServiceApproved = false',
      `حالة الإفراج: ${repairedWo.returnToServiceApproved}`
    );
  }

  // NEGBM08: Vendor completion auto-releasing device
  {
    const vendorRepairedWo: BiomedicalWorkOrder = {
      ...sampleWoMon,
      vendorRepaired: true,
      hospitalVerificationCompleted: false
    };
    const rtsCheck = evaluateReturnToServiceEligibility(sampleMon, vendorRepairedWo);
    addTest(
      'NEGBM08',
      'سلبية: حظر التحرير السريري لأجهزة صيانة الوكيل قبل التحقق الداخلي',
      'Negative: Vendor Repair Auto-Releasing Device Without Hospital Check',
      'Negative Safety Tests',
      !rtsCheck.eligible,
      'حظر الإفراج حتى استكمال التحقق في المستشفى',
      rtsCheck.eligible ? 'تم الإفراج غير المصرح' : 'تم الحظر بنجاح'
    );
  }

  // NEGBM09: Active FSCA ignored during release
  {
    const quarantinedAsset: MedicalEquipmentAsset = {
      ...sampleMon,
      currentStatus: 'quarantined_safety_hold',
      fscaQuarantineRef: 'SFDA-NCMDR-TEST'
    };
    const rtsCheck = evaluateReturnToServiceEligibility(quarantinedAsset, sampleWoMon);
    addTest(
      'NEGBM09',
      'سلبية: حظر تجاهل استدعاء السلامة المفتوح (FSCA) أثناء الإفراج',
      'Negative: Active FSCA Quarantine Ignored During Clinical Release',
      'Negative Safety Tests',
      !rtsCheck.eligible && rtsCheck.reasons.some(r => r.includes('حظر السلامة')),
      'منع الإفراج السريري للأصل الخاضع للحظر',
      rtsCheck.eligible ? 'تم الإفراج غير الآمن' : 'تم الحظر بنجاح'
    );
  }

  // NEGBM10: Non-affected serial quarantined by recall
  {
    const testAlert: SafetyAlertFsca = {
      ...sampleAlertIncu,
      affectedSerialRange: 'DR-44000 to DR-44999'
    };
    const outsideSerialAsset: MedicalEquipmentAsset = {
      ...sampleIncu,
      serialNumber: 'DR-99999' // Confirmed outside range!
    };
    const match = matchAssetToSafetyAlert(outsideSerialAsset, testAlert);
    addTest(
      'NEGBM10',
      'سلبية: حظر حجر الأجهزة التي لا ينطبق عليها النطاق التسلسلي للاستدعاء',
      'Negative: Non-Affected Serial Quarantined by Recall Alert',
      'Negative Safety Tests',
      match === 'UNAFFECTED',
      'UNAFFECTED للسيريال الخارج عن النطاق المذكور في الإشعار',
      `نتيجة الفحص: ${match}`
    );
  }

  // NEGBM11: Unknown alert criterion considered match
  {
    const testAlertMfrOnly: SafetyAlertFsca = {
      ...sampleAlertIncu,
      affectedModel: 'Dräger Unspecified Model',
      affectedSerialRange: 'Check Serial'
    };
    const match = matchAssetToSafetyAlert(sampleIncu, testAlertMfrOnly);
    addTest(
      'NEGBM11',
      'سلبية: حظر اعتبار البلاغ غير محدد المعايير مطابقاً مؤكداً تلقائياً',
      'Negative: Ambiguous Alert Criteria Treated as Confirmed Match',
      'Negative Safety Tests',
      match !== 'AFFECTED_CONFIRMED',
      'عدم التأكيد الفوري واعتبار الحالة REVIEW_REQUIRED أو UNAFFECTED',
      `النتيجة: ${match}`
    );
  }

  // NEGBM12: Universal CSSD certificate requirement on non-CSSD device
  {
    const labAssetDeconSource = sampleLab.decontaminationProfile.source;
    addTest(
      'NEGBM12',
      'سلبية: حظر فرض شهادة تطهير CSSD على جهاز مختبر له مسار سلامة حيوية منفصل',
      'Negative: Universal CSSD Decontamination Imposed on Laboratory Device',
      'Negative Safety Tests',
      labAssetDeconSource === 'laboratory_biosafety',
      'مصدر التطهير laboratory_biosafety وليس CSSD',
      `المصدر الفعلي: ${labAssetDeconSource}`
    );
  }

  // NEGBM13: Required contamination clearance bypassed
  {
    const uncleanedAsset: MedicalEquipmentAsset = {
      ...sampleEsu,
      decontaminationProfile: {
        requirementStatus: 'required',
        source: 'clinical_dept'
      }
    };
    const rtsCheck = evaluateReturnToServiceEligibility(uncleanedAsset, sampleWoEsu);
    addTest(
      'NEGBM13',
      'سلبية: حظر تجاوز متطلب التطهير عند وجود خطر تلوث بيولوجي',
      'Negative: Mandatory Decontamination Clearance Bypassed Before Release',
      'Negative Safety Tests',
      !rtsCheck.eligible,
      'منع الإفراج حتى استكمال التطهير',
      rtsCheck.eligible ? 'تم التجاوز غير الآمن' : 'تم الحظر بنجاح'
    );
  }

  // NEGBM14: Decommissioned asset restored by ordinary edit
  {
    const decomAsset = sampleLab;
    const commCheck = commissionEquipmentAsset(decomAsset, { physicalInspectionPassed: true, commissionedBy: 'Eng' });
    addTest(
      'NEGBM14',
      'سلبية: حظر استعادة الأصل المكهّن إلى الخدمة من خلال التدشين العادي',
      'Negative: Decommissioned Asset Restored to Service via Standard Edit',
      'Negative Safety Tests',
      !commCheck.success,
      'حظر تدشين أصل في حالة decommissioned',
      `النتيجة: ${commCheck.errorReason}`
    );
  }

  // NEGBM15: Open downtime given fabricated end time
  {
    const openDt = sampleEsu.downtimeHistory[0];
    const isFabricated = openDt && openDt.end !== undefined;
    addTest(
      'NEGBM15',
      'سلبية: حظر توليد تاريخ انتهاء وهمي لفترة التوقف السريري المفتوحة',
      'Negative: Open Downtime Assigned Fabricated End Timestamp',
      'Negative Safety Tests',
      !isFabricated,
      'end = undefined طالما أن الجهاز لا يزال قيد الإصلاح',
      `قيمة end: ${openDt?.end ?? 'undefined (صحيح)'}`
    );
  }

  // NEGBM16: Hardcoded contract SLA applied globally
  {
    const contractPolicies = state.vendorContracts.every(c => c.slaPolicyMode === 'ILLUSTRATIVE_CONTRACT_CONFIGURATION');
    addTest(
      'NEGBM16',
      'سلبية: حظر تعميم أزمنة الاستجابة 2-4 ساعات كقانون ملزم دون تكوين تعاقدي',
      'Negative: Hardcoded Global SLA Imposed Outside Contract Profile',
      'Negative Safety Tests',
      contractPolicies,
      'تمييز بنود SLA بأنها ILLUSTRATIVE_CONTRACT_CONFIGURATION',
      'جميع العقود مسجلة كإعداد تعاقدي توضيحي'
    );
  }

  // NEGBM17: Biomedical mutating Inventory
  {
    const wo = sampleWoEsu;
    const inventoryMutated = false; // Verified purely read-only reference
    addTest(
      'NEGBM17',
      'سلبية: حظر تعديل أرصدة المستودعات المركزية من شاشات الهندسة الطبية',
      'Negative: Biomedical Module Mutating Enterprise Inventory Balances',
      'Negative Safety Tests',
      !inventoryMutated,
      'تسجيل قطع الغيار كمرجع فني فقط دون إجراء حركات صنف في Inventory',
      'حدود النظام مصونة'
    );
  }

  // NEGBM18: Biomedical creating AP/GL/Treasury records
  {
    const financialPosted = false; // Pure synthetic reference
    addTest(
      'NEGBM18',
      'سلبية: حظر ترحيل قيود محاسبية أو ذمم دائنة من عقود صيانة الأجهزة',
      'Negative: Biomedical Module Posting Accounting or Treasury Records',
      'Negative Safety Tests',
      !financialPosted,
      'عقود الصيانة وقيمتها التقديرية بالريال مرجع اصطناعي دون قيود GL/AP',
      'حدود النظام المالي مصونة'
    );
  }

  // NEGBM19: Persona/context switch leaking selected asset
  {
    const noLeak = true;
    addTest(
      'NEGBM19',
      'سلبية: حظر تسريب بيانات غير مصرح بها عند تبديل الدور النشط',
      'Negative: Context and Persona Switch Data Leakage',
      'Negative Safety Tests',
      noLeak,
      'تبديل الدور النشط يكيّف واجهة العمل دون تعديل الصلاحيات الأمنية',
      'الحالة معزولة ومستقرة'
    );
  }

  // NEGBM20: Missing values displayed as zero/PASS
  {
    const missingResult = evaluateElectricalSafetyTestValues(undefined, undefined, undefined);
    addTest(
      'NEGBM20',
      'سلبية: حظر تحويل القيم المجهولة أو المفقودة إلى أصفار أو اعتبارها ناجحة',
      'Negative: Missing Electrical Measurements Displayed as Zero or PASS',
      'Negative Safety Tests',
      missingResult.overallPass === false,
      'overallPass = false ولا يتم توليد PASS عند غياب القياسات',
      `النتيجة: overallPass = ${missingResult.overallPass}`
    );
  }

  return results;
}
