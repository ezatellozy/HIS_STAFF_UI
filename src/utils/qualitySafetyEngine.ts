/**
 * HIS — QUALITY, PATIENT SAFETY, ENTERPRISE RISK & INFECTION CONTROL
 * Deterministic Frontend Operational Engine & Calculation Utilities
 * Enhanced for: SPSC Sentinel Policy 2025, Configurable Risk Matrices,
 * HAI Surveillance Profiles, Hand Hygiene Observational Metrics, and Just Culture Principles.
 */

import {
  HarmSeverity,
  IncidentType,
  SeverityAssessmentCode,
  RiskLikelihood,
  RiskConsequence,
  RiskLevel,
  RiskMatrixProfile,
  SafetyIncidentCase,
  RiskRegisterItem,
  CapaItem,
  CapaEffectivenessStatus,
  HaiSurveillanceCase,
  HandHygieneAuditSession,
  CareBundleAuditItem,
  BundleMeasurementProfile,
  BundleElementStatus,
  QpsActivityLog,
  QpsPersona,
  SentinelWorkflowStatus,
  SentinelCriteriaReview,
  SpscPolicyDeadline
} from '../types/qualitySafetyOps';

/**
 * 1. SPSC SENTINEL EVENT POLICY DEADLINES (Effective 1 January 2025)
 * Distinguishes internal reporting, CEO notification (24h), SPSC platform report (48h),
 * and RCA + Corrective Action Plan (30 working days from Event Discovery Date).
 */
export function getSpscPolicyDeadlines(discoveryDateStr: string): {
  deadlines: SpscPolicyDeadline[];
  ceoNotificationTimestamp: string;
  spscPlatformTimestamp: string;
  rcaCapSubmissionDate: string;
} {
  const baseDate = new Date(discoveryDateStr || new Date().toISOString());

  // CEO Notification: +24 hours
  const ceoDate = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  const ceoNotificationTimestamp = ceoDate.toISOString().replace('T', ' ').substring(0, 16);

  // SPSC Platform Sentinel Report: +48 hours from discovery
  const spscDate = new Date(baseDate.getTime() + 48 * 60 * 60 * 1000);
  const spscPlatformTimestamp = spscDate.toISOString().replace('T', ' ').substring(0, 16);

  // RCA + Corrective Action Plan: 30 working days (~42 calendar days)
  const rcaDate = new Date(baseDate.getTime() + 42 * 24 * 60 * 60 * 1000);
  const rcaCapSubmissionDate = rcaDate.toISOString().split('T')[0];

  const deadlines: SpscPolicyDeadline[] = [
    {
      policySource: 'SPSC Sentinel Event Reporting and Management Policy',
      policyVersion: 'v2.0 / 2025',
      effectiveDate: '2025-01-01',
      deadlineType: 'internal_immediate',
      deadlineValue: 0,
      deadlineUnit: 'immediate',
      triggerEvent: 'Event Discovery Date',
      descriptionAr: 'الإبلاغ الداخلي الفوري عبر نظام OVR للمستشفى بمجرد اكتشاف الواقعة.',
      verificationState: 'verified_source'
    },
    {
      policySource: 'SPSC Sentinel Event Reporting and Management Policy',
      policyVersion: 'v2.0 / 2025',
      effectiveDate: '2025-01-01',
      deadlineType: 'ceo_designee_notification_24h',
      deadlineValue: 24,
      deadlineUnit: 'hours',
      triggerEvent: 'Event Discovery Date',
      descriptionAr: 'إشعار المدير التنفيذي / المفوّض رسمياً خلال 24 ساعة للتعامل مع الحدث الجسيم.',
      verificationState: 'verified_source'
    },
    {
      policySource: 'SPSC Sentinel Event Reporting and Management Policy',
      policyVersion: 'v2.0 / 2025',
      effectiveDate: '2025-01-01',
      deadlineType: 'spsc_platform_report_48h',
      deadlineValue: 48,
      deadlineUnit: 'hours',
      triggerEvent: 'Event Discovery Date',
      descriptionAr: 'رفع تقرير الحدث الجسيم على منصة المركز السعودي لسلامة المرضى SPSC خلال 48 ساعة من تاريخ الاكتشاف.',
      verificationState: 'verified_source'
    },
    {
      policySource: 'SPSC Sentinel Event Reporting and Management Policy',
      policyVersion: 'v2.0 / 2025',
      effectiveDate: '2025-01-01',
      deadlineType: 'rca_cap_submission_30_working_days',
      deadlineValue: 30,
      deadlineUnit: 'days',
      triggerEvent: 'Event Discovery Date',
      descriptionAr: 'تقديم التحليل الجذري الشامل RCA2 وخطة العمل التصحيحية CAP خلال 30 يوم عمل من تاريخ الاكتشاف.',
      verificationState: 'verified_source'
    }
  ];

  return {
    deadlines,
    ceoNotificationTimestamp,
    spscPlatformTimestamp,
    rcaCapSubmissionDate
  };
}

/**
 * 2. SAC Matrix (Severity Assessment Code) Calculation
 * Cross-references Harm Severity and Incident Probability/Type.
 * (Note: SAC alone does NOT decide sentinel event regulatory reportability).
 */
export function calculateSacScore(
  harmLevel: HarmSeverity,
  incidentType: IncidentType
): SeverityAssessmentCode {
  if (harmLevel === 'death') {
    return 'SAC-1'; // Catastrophic
  }
  if (harmLevel === 'severe') {
    return 'SAC-1';
  }
  if (harmLevel === 'moderate') {
    return incidentType === 'near_miss' ? 'SAC-3' : 'SAC-2';
  }
  if (harmLevel === 'minor') {
    return incidentType === 'near_miss' ? 'SAC-4' : 'SAC-3';
  }
  return 'SAC-4';
}

/**
 * 3. Sentinel Review & Criteria Assessment (Reporter CANNOT self-confirm)
 * Only Quality Director or Patient Safety Officer can verify criteria against SPSC 2025.
 */
export function reviewSentinelCriteria(
  incident: SafetyIncidentCase,
  reviewer: QpsPersona,
  decision: SentinelWorkflowStatus,
  criterionApplied: string,
  decisionNotes: string,
  criterionCodeApplied?: string,
  policyVersion?: string
): { success: boolean; updatedIncident?: SafetyIncidentCase; error?: string; activityLog?: QpsActivityLog } {
  // Guard: Reporter alone cannot self-confirm sentinel status
  if (reviewer.roleKey !== 'quality_director' && reviewer.roleKey !== 'safety_officer') {
    return {
      success: false,
      error: 'لا يحق لمحرر البلاغ تأكيد تصنيف الحدث الجسيم بمفرده؛ يجب مراجعة الحالة من مدير الجودة أو مسؤول سلامة المرضى المعتمد.'
    };
  }

  const { ceoNotificationTimestamp, spscPlatformTimestamp, rcaCapSubmissionDate } =
    getSpscPolicyDeadlines(incident.eventDiscoveryDate || incident.reportedAt);

  const sentinelReviewDetails: SentinelCriteriaReview = {
    reviewId: `REV-${Date.now()}`,
    status: decision,
    reviewedByPersonaId: reviewer.id,
    reviewedByName: `${reviewer.name} (${reviewer.roleTitleAr})`,
    reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    criterionCodeApplied: criterionCodeApplied || 'SEC-04',
    criterionApplied,
    policySource: 'SPSC Sentinel Event Reporting and Management Policy',
    policyVersion: policyVersion || 'V1 (Effective 1 Jan 2025)',
    decisionNotes,
    eventDiscoveryDate: incident.eventDiscoveryDate || incident.reportedAt,
    internalReportingCompleted: true,
    ceoNotificationDeadline: ceoNotificationTimestamp,
    ceoNotificationCompleted: true,
    spscPlatformDeadline: spscPlatformTimestamp,
    spscPlatformStatus: decision === 'criteria_met' ? 'prepared_for_review' : 'not_applicable',
    rcaCapSubmissionDeadline: rcaCapSubmissionDate
  };

  const isConfirmed = decision === 'criteria_met' || decision === 'external_reporting_required';

  const updatedIncident: SafetyIncidentCase = {
    ...incident,
    incidentType: isConfirmed ? 'sentinel_event' : incident.incidentType === 'sentinel_event' ? 'incident' : incident.incidentType,
    sentinelWorkflowStatus: decision,
    sentinelReviewDetails,
    rcaRequired: isConfirmed || incident.sacScore === 'SAC-1'
  };

  const activityLog: QpsActivityLog = {
    id: `ACT-REV-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    actorName: reviewer.name,
    actorRole: reviewer.roleTitleAr,
    action: `مراجعة معايير الحدث الجسيم SPSC: ${decision}`,
    domain: 'incident',
    referenceId: incident.referenceNumber,
    details: `المعيار المطبق: ${criterionCodeApplied || ''} - ${criterionApplied} • القرار: ${decision}`
  };

  return { success: true, updatedIncident, activityLog };
}

/**
 * 4. Configurable Risk Matrix Scoring (Supports 3x3, 4x4, 5x5)
 */
export function calculateProfileRiskScore(
  likelihood: number,
  consequence: number,
  profile: RiskMatrixProfile
): { score: number; level: RiskLevel; bandLabelAr: string; bandLabelEn: string } {
  // Clamped within profile dimensions
  const safeL = Math.max(1, Math.min(profile.likelihoodLevels, likelihood));
  const safeC = Math.max(1, Math.min(profile.impactLevels, consequence));
  const score = safeL * safeC;

  // Find matching band from profile
  const band = profile.riskBands.find(b => score >= b.minScore && score <= b.maxScore) || profile.riskBands[0];

  return {
    score,
    level: band.level,
    bandLabelAr: band.labelAr,
    bandLabelEn: band.labelEn
  };
}

/**
 * Backward compatibility helper for 5x5 default
 */
export function calculateRiskScore(
  likelihood: RiskLikelihood,
  consequence: RiskConsequence
): { score: number; level: RiskLevel } {
  const score = likelihood * consequence;
  let level: RiskLevel = 'low';

  if (score >= 15) {
    level = 'extreme';
  } else if (score >= 10) {
    level = 'high';
  } else if (score >= 4) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { score, level };
}

/**
 * 5. Hand Hygiene Compliance Rate (%)
 * Hand Hygiene Actions / Observed Opportunities
 * Glove use alone does NOT count as hand hygiene.
 * Zero opportunities => returns 'RATE_NOT_CALCULABLE'
 */
export function calculateHandHygieneRate(
  audits: HandHygieneAuditSession[],
  departmentFilter?: string
): {
  totalObserved: number;
  compliantCount: number;
  complianceRatePercent: number | 'RATE_NOT_CALCULABLE';
} {
  const filtered = departmentFilter && departmentFilter !== 'all'
    ? audits.filter(a => a.department === departmentFilter)
    : audits;

  if (filtered.length === 0) {
    return {
      totalObserved: 0,
      compliantCount: 0,
      complianceRatePercent: 'RATE_NOT_CALCULABLE'
    };
  }

  // Count compliant opportunities (gloves_without_hygiene and missed_opportunity are strictly false)
  const compliantCount = filtered.filter(a => a.isCompliant && a.actionTaken !== 'gloves_without_hygiene' && a.actionTaken !== 'missed_opportunity').length;
  const complianceRatePercent = Math.round((compliantCount / filtered.length) * 100);

  return {
    totalObserved: filtered.length,
    compliantCount,
    complianceRatePercent
  };
}

/**
 * 6. Device-Day Infection Incidence Rate (per 1,000 Device Days)
 * Denominator must be verified and > 0.
 * Zero denominator => 'RATE_NOT_CALCULABLE'.
 * Missing/negative denominator => 'DENOMINATOR_NOT_VERIFIED'.
 */
export function calculateDeviceAssociatedRate(
  infectionsCount: number,
  deviceDays?: number | null
): number | 'RATE_NOT_CALCULABLE' | 'DENOMINATOR_NOT_VERIFIED' {
  if (deviceDays === undefined || deviceDays === null || deviceDays < 0) {
    return 'DENOMINATOR_NOT_VERIFIED';
  }
  if (deviceDays === 0) {
    return 'RATE_NOT_CALCULABLE';
  }
  return Number(((infectionsCount / deviceDays) * 1000).toFixed(2));
}

/**
 * 7. Care Bundle Compliance with Configurable Scoring Profile
 * Invariant: NOT_OBSERVED is never counted as PASS.
 * NOT_APPLICABLE behavior is respected.
 */
export function evaluateBundleCompliance(
  elements: Array<{ elementKey: string; status: BundleElementStatus }>,
  profile?: BundleMeasurementProfile
): { allCompliant: boolean; compliancePercent: number; evaluatedCount: number } {
  if (elements.length === 0) {
    return { allCompliant: false, compliancePercent: 0, evaluatedCount: 0 };
  }

  const notApplicableBehavior = profile?.notApplicableBehavior || 'exclude';

  // Filter elements to evaluate
  const applicableElements = elements.filter(e => {
    if (e.status === 'not_applicable') {
      return notApplicableBehavior !== 'exclude';
    }
    return true;
  });

  if (applicableElements.length === 0) {
    return { allCompliant: false, compliancePercent: 0, evaluatedCount: 0 };
  }

  // Count compliant elements: NOT_OBSERVED must NEVER be treated as compliant!
  const compliantCount = applicableElements.filter(e => {
    if (e.status === 'compliant') return true;
    if (e.status === 'not_applicable' && notApplicableBehavior === 'count_as_pass') return true;
    return false;
  }).length;

  const allCompliant = compliantCount === applicableElements.length;
  const compliancePercent = Math.round((compliantCount / applicableElements.length) * 100);

  return { allCompliant, compliancePercent, evaluatedCount: applicableElements.length };
}

/**
 * 8. CAPA Effectiveness Verification (completed != effective)
 * Action completed moves to 'effectiveness_pending' until valid review evidence is submitted.
 */
export function reviewCapaEffectiveness(
  capa: CapaItem,
  outcome: CapaEffectivenessStatus,
  evidenceRef: string,
  actor: QpsPersona,
  notes?: string
): { success: boolean; updatedCapa?: CapaItem; error?: string; activityLog?: QpsActivityLog } {
  if (!evidenceRef || !evidenceRef.trim()) {
    return {
      success: false,
      error: 'يجب تقديم مرجع أو دليل موثق لتقييم فاعلية الإجراء التصحيحي (Evidence Reference Required).'
    };
  }

  const isVerified = outcome === 'effective';
  const updatedCapa: CapaItem = {
    ...capa,
    effectivenessStatus: outcome,
    effectivenessEvidenceReference: evidenceRef,
    effectivenessAuditNotes: notes || `تم تدقيق الأثر بواسطة ${actor.name} (${outcome})`,
    status: isVerified ? 'effectiveness_verified' : outcome === 'reopened' ? 'in_progress' : capa.status
  };

  const activityLog: QpsActivityLog = {
    id: `ACT-CAPA-EFF-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    actorName: actor.name,
    actorRole: actor.roleTitleAr,
    action: `تدقيق فاعلية إجراء CAPA: ${outcome}`,
    domain: 'capa',
    referenceId: capa.capaCode,
    details: `المرجع: ${evidenceRef} • النتيجة: ${outcome}`
  };

  return { success: true, updatedCapa, activityLog };
}

/**
 * 9. Prepare Synthetic SPSC Reporting Reference (NOT actual external submission)
 */
export function prepareSyntheticSpscReportingReference(
  incident: SafetyIncidentCase,
  actor: QpsPersona
): { updatedIncident: SafetyIncidentCase; activityLog: QpsActivityLog } {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const refCode = `SYN-SPSC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const updatedIncident: SafetyIncidentCase = {
    ...incident,
    syntheticReportingReference: {
      referenceStatus: 'synthetic_external_reporting_reference',
      referenceId: refCode,
      generatedAt: timestamp,
      reviewTarget: 'SPSC_PORTAL_SIMULATION',
      noticeText: `مرجع إبلاغ اصطناعي داخلي (${refCode}): تم تجهيز ملف البلاغ وفق متطلبات الإبلاغ للمركز السعودي لسلامة المرضى SPSC للمراجعة والاعتماد الداخلي.`
    }
  };

  const activityLog: QpsActivityLog = {
    id: `ACT-SPSC-REF-${Date.now()}`,
    timestamp,
    actorName: actor.name,
    actorRole: actor.roleTitleAr,
    action: 'تجهيز مرجع إبلاغ اصطناعي للمركز السعودي لسلامة المرضى (SPSC Reference)',
    domain: 'incident',
    referenceId: incident.referenceNumber,
    details: `الرمز الاصطناعي: ${refCode} • لم يتم إجراء أي إرسال خارجي فعلي.`
  };

  return { updatedIncident, activityLog };
}

/**
 * 9b. Synthetic Regulatory Escalation Reference (Strictly synthetic preview, no network/API calls)
 */
export function simulateRegulatoryEscalation(
  incident: SafetyIncidentCase,
  recipients: Array<'SPSC' | 'CBAHI_SENTINEL' | 'MOH_GDIPC' | 'INTERNAL_EXECUTIVE' | string>,
  actor: QpsPersona
): { updatedIncident: SafetyIncidentCase; activityLog: QpsActivityLog } {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const refCode = `SYN-REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const updatedIncident: SafetyIncidentCase = {
    ...incident,
    regulatoryEscalationSimulated: {
      isEscalated: true,
      escalatedTo: recipients,
      escalationTimestamp: timestamp,
      noticeText: `مرجع إشعار اصطناعي (${refCode}): تم توثيق إحالة البلاغ للمراجعة التنفيذية الداخلية والتحضير الاصطناعي للمنصات التنظيمية (${recipients.join(', ')}) دون إرسال شبكي خارجي فعلي.`
    },
    syntheticReportingReference: {
      referenceStatus: 'synthetic_external_reporting_reference',
      referenceId: refCode,
      generatedAt: timestamp,
      reviewTarget: 'SPSC_PORTAL_SIMULATION',
      noticeText: `مرجع إبلاغ اصطناعي داخلي (${refCode}): تم تجهيز ملف البلاغ وفق متطلبات المراجعة الداخلية لـ SPSC.`
    }
  };

  const activityLog: QpsActivityLog = {
    id: `ACT-ESC-${Date.now()}`,
    timestamp,
    actorName: actor.name,
    actorRole: actor.roleTitleAr,
    action: `محاكاة إشعار التصعيد الاصطناعي: ${recipients.join(', ')}`,
    domain: 'incident',
    referenceId: incident.referenceNumber,
    details: `الجهات: ${recipients.join(', ')} • الرمز المرجعي: ${refCode} (معاينة داخلية فقط)`
  };

  return { updatedIncident, activityLog };
}

/**
 * 10. Backward compatible helper for incident status transition
 */
export function transitionIncidentStatus(
  incident: SafetyIncidentCase,
  newStatus: SafetyIncidentCase['status'],
  actor: QpsPersona,
  notes?: string
): { updatedIncident: SafetyIncidentCase; activityLog: QpsActivityLog } {
  const updatedIncident: SafetyIncidentCase = {
    ...incident,
    status: newStatus,
    ...(newStatus === 'closed'
      ? {
          closedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          closedBy: `${actor.name} (${actor.roleTitleAr})`,
          lessonsLearned: notes || incident.lessonsLearned || 'تم توثيق الدروس المستفادة والضوابط النظامية وإغلاق البلاغ.'
        }
      : {})
  };

  const activityLog: QpsActivityLog = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    actorName: actor.name,
    actorRole: actor.roleTitleAr,
    action: `تغيير حالة بلاغ السلامة إلى: ${newStatus}`,
    domain: 'incident',
    referenceId: incident.referenceNumber,
    details: notes || `الانتقال من ${incident.status} إلى ${newStatus}`
  };

  return { updatedIncident, activityLog };
}

/**
 * 11. Helper for validating and creating CAPA with hierarchy profile
 */
export function validateAndCreateCapa(
  capaDraft: Partial<CapaItem>,
  actor: QpsPersona
): { success: boolean; error?: string; capa?: CapaItem; activityLog?: QpsActivityLog } {
  if (!capaDraft.title || !capaDraft.title.trim()) {
    return { success: false, error: 'عنوان الإجراء التصحيحي/الوقائي مطلوب' };
  }
  if (!capaDraft.actionOwner || !capaDraft.actionOwner.trim()) {
    return { success: false, error: 'يجب تحديد المسؤول عن تنفيذ الإجراء التصحيحي (Action Owner)' };
  }
  if (!capaDraft.dueDate) {
    return { success: false, error: 'تاريخ الاستحقاق والتنفيذ إلزامي لإجراءات CAPA' };
  }

  const capa: CapaItem = {
    id: capaDraft.id || `capa-${Date.now()}`,
    capaCode: capaDraft.capaCode || `CAPA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    title: capaDraft.title,
    titleAr: capaDraft.titleAr || capaDraft.title,
    type: capaDraft.type || 'corrective',
    sourceOrigin: capaDraft.sourceOrigin || 'incident_rca',
    sourceReferenceId: capaDraft.sourceReferenceId || 'OVR-GEN',
    controlHierarchy: capaDraft.controlHierarchy || 'intermediate_standardized_process',
    hierarchyProfileId: capaDraft.hierarchyProfileId || 'HIERARCHY-PROFILE-DEFAULT',
    description: capaDraft.description || '',
    actionSteps: capaDraft.actionSteps || [capaDraft.title],
    actionOwner: capaDraft.actionOwner,
    ownerDepartment: capaDraft.ownerDepartment || 'الجودة وسلامة المرضى',
    dueDate: capaDraft.dueDate,
    isCompleted: false,
    effectivenessReviewDate: capaDraft.effectivenessReviewDate || capaDraft.dueDate,
    effectivenessStatus: 'effectiveness_pending',
    status: capaDraft.status || 'in_progress'
  };

  const activityLog: QpsActivityLog = {
    id: `ACT-CAPA-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    actorName: actor.name,
    actorRole: actor.roleTitleAr,
    action: `إنشاء إجراء تصحيحي جديد: ${capa.capaCode}`,
    domain: 'capa',
    referenceId: capa.capaCode,
    details: `المسؤول: ${capa.actionOwner} • الاستحقاق: ${capa.dueDate}`
  };

  return { success: true, capa, activityLog };
}
