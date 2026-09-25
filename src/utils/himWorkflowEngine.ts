// ============================================================================
// HIS — HEALTH INFORMATION MANAGEMENT (HIM) WORKFLOW & INTEGRITY ENGINE
// Pure, deterministic business logic & safety interlocks
// Standards: HL7 FHIR R5 (Composition, Provenance, DocumentReference),
// Saudi CBAHI Records Management, Saudi PDPL Health Data Processing Safeguards
// Boundary: Synthetic Operations Preview — UI/UX Only
// ============================================================================

import {
  MedicalRecordCase,
  RecordDocumentReference,
  DocumentVersionReference,
  DocumentationDeficiency,
  CodingCase,
  CodingEntry,
  CodingQuery,
  ClassificationProfileReference,
  ReleaseOfInformationRequest,
  DisclosurePackage,
  DisclosureItem,
  DisclosureLogEntry,
  RetentionPolicyReference,
  LegalHoldRecord,
  RecordIntegrityException,
  EncounterRecordCompletionStatus,
  CodingWorkStatus,
  RoiRequestStatus,
  HospitalConfigurableCompletionPolicy,
  CodingRevisionRecord
} from '../types/himOps';

// ============================================================================
// 1. RECORD COMPLETION & DEFICIENCY EVALUATION
// ============================================================================

export function evaluateRecordCompletion(
  recordCase: MedicalRecordCase,
  encounterDeficiencies: DocumentationDeficiency[],
  policy?: HospitalConfigurableCompletionPolicy
): {
  isEligibleForCompletion: boolean;
  isComplete: boolean;
  blockingDeficienciesCount: number;
  openDeficienciesCount: number;
  reasons: string[];
  blockingReasons: string[];
  unresolvedDeficiencies: DocumentationDeficiency[];
  isDelinquentInternalTarget: boolean;
  isCbahiDelinquentBoundary: boolean;
  completionBoundaryDays: number;
  internalTargetDays: number;
  delinquencyNotice?: string;
  policySource: string;
} {
  const reasons: string[] = [];
  const openDeficiencies = encounterDeficiencies.filter(
    d => d.status !== 'resolved' && d.status !== 'waived_by_policy'
  );
  const blockingDeficiencies = openDeficiencies.filter(d => d.blockingEffect);

  if (blockingDeficiencies.length > 0) {
    reasons.push(
      `يوجد ${blockingDeficiencies.length} نواقص توثيقية مانعة لإغلاق السجل الطبي (مثل: تقرير الخروج، التوقيع الطبي، أو تقرير العمليات).`
    );
  }

  // Check if clinical care setting specific requirements are fulfilled
  if (recordCase.careSetting === 'inpatient' && !recordCase.dischargeDate) {
    // Open inpatient encounters can never have a completed medical record
    reasons.push('التنويم السريري للمريض لا يزال جارياً؛ لا يمكن اكتمال السجل الطبي حتى تقييد الخروج السريري.');
  }

  // Timers & delinquency evaluation:
  // Universal CBAHI verified requirement: 30 days for applicable discharged inpatient.
  // Intermediate targets (e.g. 14 days) are HOSPITAL_CONFIGURABLE_COMPLETION_POLICY / ILLUSTRATIVE_LOCAL_POLICY.
  const regulatoryBoundary = policy?.regulatoryCompletionBoundaryDays ?? 30;
  const internalTarget = policy?.internalTargetDays ?? 14;
  const policySource = policy?.policySource ?? 'ILLUSTRATIVE_LOCAL_POLICY';

  let isCbahiDelinquentBoundary = false;
  let isDelinquentInternalTarget = false;
  let delinquencyNotice: string | undefined;

  // Inpatient timers only apply to discharged patients and NEVER automatically to OPD encounters
  if (recordCase.careSetting === 'inpatient' && recordCase.dischargeDate) {
    const dischargeTime = new Date(recordCase.dischargeDate).getTime();
    const nowTime = new Date().getTime();
    const daysSinceDischarge = Math.floor((nowTime - dischargeTime) / (1000 * 60 * 60 * 24));

    if (daysSinceDischarge > regulatoryBoundary) {
      isCbahiDelinquentBoundary = true;
      delinquencyNotice = `تجاوز الحد النظامي المعتمد لسباهي (CBAHI Regulatory Completion Boundary: ${regulatoryBoundary} يوماً)`;
    } else if (daysSinceDischarge > internalTarget) {
      isDelinquentInternalTarget = true;
      delinquencyNotice = `تجاوز الهدف التشغيلي الداخلي للمستشفى (${policySource}: ${internalTarget} يوماً) — ضمن الحد النظامي العام`;
    }
  }

  const isComplete = reasons.length === 0;
  return {
    isEligibleForCompletion: isComplete,
    isComplete,
    blockingDeficienciesCount: blockingDeficiencies.length,
    openDeficienciesCount: openDeficiencies.length,
    reasons,
    blockingReasons: reasons,
    unresolvedDeficiencies: openDeficiencies,
    isDelinquentInternalTarget,
    isCbahiDelinquentBoundary,
    completionBoundaryDays: regulatoryBoundary,
    internalTargetDays: internalTarget,
    delinquencyNotice,
    policySource
  };
}

export function resolveDeficiency(
  deficiency: DocumentationDeficiency,
  resolutionNotes: string,
  resolvedBy: string
): { success: boolean; updatedDeficiency?: DocumentationDeficiency; error?: string } {
  if (!resolutionNotes || resolutionNotes.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم توثيق سبب وإجراء تسوية النقص السريري بتفصيل كافٍ.'
    };
  }

  const updated: DocumentationDeficiency = {
    ...deficiency,
    status: 'resolved',
    resolutionNotes,
    resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    resolvedBy
  };

  return { success: true, updatedDeficiency: updated };
}

// ============================================================================
// 2. CODING READINESS & ENTRY ASSIGNMENT
// ============================================================================

export function evaluateCodingReadiness(
  codingCase: CodingCase,
  hasDischargeSummaryOrFinalNote: boolean,
  blockingDeficienciesExist: boolean
): {
  isReadyForCoding: boolean;
  readinessReason: string;
  isReadyForHandoff: boolean;
  blockingReasons: string[];
} {
  // HIM13: Coding cannot begin when required clinical documentation is not ready
  if (blockingDeficienciesExist) {
    return {
      isReadyForCoding: false,
      isReadyForHandoff: false,
      readinessReason: 'حظر الترميز: توجد نواقص توثيقية جوهرية معلقة (Documentation Deficiencies Pending).',
      blockingReasons: ['توجد نواقص توثيقية جوهرية معلقة تحظر إغلاق وتسليم الترميز']
    };
  }

  if (codingCase.careSetting === 'inpatient' && !hasDischargeSummaryOrFinalNote) {
    return {
      isReadyForCoding: false,
      isReadyForHandoff: false,
      readinessReason: 'حظر الترميز: يلزم توفر تقرير الخروج الطبي المعتمد أو التقييم النهائي قبل بدء الترميز السريري.',
      blockingReasons: ['يلزم توفر تقرير الخروج الطبي المعتمد أو التقييم النهائي']
    };
  }

  const hasPrincipal = codingCase.codingEntries.some(e => e.type === 'principal_diagnosis');
  const isReady = hasPrincipal && codingCase.codingEntries.length > 0;

  return {
    isReadyForCoding: true,
    isReadyForHandoff: isReady,
    readinessReason: 'الملف السريري مستوفٍ لوثائق الترميز وجاهز لمباشرة التعيين التشخيصي والإجرائي.',
    blockingReasons: isReady ? [] : ['يلزم تعيين تشخيص رئيسي معتمد واحد على الأقل قبل الإغلاق المالي']
  };
}

export function assignCodingEntry(
  codingCase: CodingCase,
  entry: Omit<CodingEntry, 'id' | 'assignedAt'>,
  availableProfiles: ClassificationProfileReference[]
): {
  success: boolean;
  updatedCase?: CodingCase;
  error?: string;
} {
  // Validate classification profile
  const profile = availableProfiles.find(p => p.profileId === entry.classificationProfileId);
  if (!profile) {
    return {
      success: false,
      error: 'CLASSIFICATION_PROFILE_NOT_VERIFIED: ملف التصنيف والترميز المطلوب غير موجود أو غير معتمد في النظام.'
    };
  }

  // Prevent duplicate code in same case
  const isDuplicate = codingCase.codingEntries.some(
    e => e.code.trim().toUpperCase() === entry.code.trim().toUpperCase() && e.type === entry.type
  );
  if (isDuplicate) {
    return {
      success: false,
      error: `الرمز الطبي (${entry.code}) مسجل مسبقاً في هذه الحالة تحت فئة (${entry.type}). يمنع تكرار الرمز التشخيصي في نفس المسار.`
    };
  }

  const newEntry: CodingEntry = {
    ...entry,
    id: `code-ent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    assignedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  const updatedEntries = [...codingCase.codingEntries, newEntry];

  // If assigning principal diagnosis, update candidate indicator
  let updatedPrincipal = codingCase.principalDiagnosisCandidate;
  if (entry.type === 'principal_diagnosis') {
    updatedPrincipal = {
      rawDiagnosis: entry.sourceDiagnosisText,
      proposedCode: entry.code,
      selectionRationale: `تم تعيين التشخيص الرئيسي وفق الدليل الموثق في الملف الطبي (${entry.documentedInNoteId}) بواسطة المرمز.`
    };
  }

  const updatedCase: CodingCase = {
    ...codingCase,
    status: 'in_progress',
    codingEntries: updatedEntries,
    principalDiagnosisCandidate: updatedPrincipal
  };

  return {
    success: true,
    updatedCase
  };
}

// ============================================================================
// 3. CODING QUERY WORKFLOW (Strictly Non-Leading)
// ============================================================================

export function createCodingQuery(
  input: {
    caseId: string;
    encounterId: string;
    patientId: string;
    patientName: string;
    mrn: string;
    topic: CodingQuery['topic'];
    coderId: string;
    coderName: string;
    targetProviderId: string;
    targetProviderName: string;
    targetProviderDepartment: string;
    referencedDocumentId: string;
    referencedDocumentTitle: string;
    documentedClinicalSnippet: string;
    queryInquiryText: string;
    neutralOptionsProvided: string[];
  }
): {
  success: boolean;
  query?: CodingQuery;
  error?: string;
} {
  if (!input.queryInquiryText || input.queryInquiryText.trim().length < 15) {
    return {
      success: false,
      error: 'يلزم صياغة الاستفسار السريري بوضوح ومهنية لا تقل عن 15 حرفاً.'
    };
  }

  // Safety check: coding query must be strictly non-leading (cannot specify mandatory codes)
  const isLeadingCheck = input.queryInquiryText.toLowerCase().includes('please code as') ||
                         input.queryInquiryText.includes('الرجاء اختيار الرمز') ||
                         input.queryInquiryText.includes('لغايات الفوترة فقط');

  if (isLeadingCheck) {
    return {
      success: false,
      error: 'حظر استفسار موجه: يمنع توجيه الطبيب لاختيار تشخيص محدد أو فرض رموز مالية. يجب أن يكون الاستفسار محايداً ومبنياً على توضيح التوثيق السريري فقط.'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const queryNumber = `CQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const query: CodingQuery = {
    ...input,
    id: `cq-${Date.now()}`,
    queryNumber,
    status: 'sent_in_simulation',
    createdAt: nowStr,
    updatedAt: nowStr,
    isNonLeadingVerified: true
  };

  return { success: true, query };
}

export function answerCodingQuery(
  query: CodingQuery,
  providerResponseText: string,
  providerName: string
): {
  success: boolean;
  updatedQuery?: CodingQuery;
  error?: string;
} {
  if (!providerResponseText || providerResponseText.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم تدوين التوضيح السريري من الطبيب المعالج لإغلاق الاستفسار.'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const updated: CodingQuery = {
    ...query,
    providerResponseText: `[إجابة ${providerName}]: ${providerResponseText}`,
    providerRespondedAt: nowStr,
    status: 'answered',
    updatedAt: nowStr
  };

  return { success: true, updatedQuery: updated };
}

// ============================================================================
// 4. CODING BILLING HANDOFF (Read-Only Reference)
// ============================================================================

export function executeCodingBillingHandoff(
  codingCase: CodingCase
): {
  success: boolean;
  updatedCase?: CodingCase;
  error?: string;
} {
  if (codingCase.codingEntries.length === 0) {
    return {
      success: false,
      error: 'حظر تسليم: لا توجد رموز تشخيصية أو إجرائية معتمدة في هذه الحالة.'
    };
  }

  const hasPrincipal = codingCase.codingEntries.some(e => e.type === 'principal_diagnosis');
  if (!hasPrincipal && codingCase.careSetting === 'inpatient') {
    return {
      success: false,
      error: 'حظر تسليم: يتطلب التنويم تحديد تشخيص رئيسي (Principal Diagnosis) معتمد قبل التسليم المالي.'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const handoffRef = `HIM-FIN-REF-${Date.now().toString().slice(-6)}`;
  const currentVersion = codingCase.codingVersion || 1;

  const updatedCase: CodingCase = {
    ...codingCase,
    status: 'complete',
    billingHandoffStatus: 'handed_off_in_simulation',
    billingHandoffTimestamp: nowStr,
    handoffReferenceCode: handoffRef,
    isFinancialLocked: true,
    codingVersion: currentVersion,
    handoffType: 'SYNTHETIC_CODING_HANDOFF_REFERENCE'
  };

  return {
    success: true,
    updatedCase
  };
}

export function reopenCodingCaseForRevision(
  codingCase: CodingCase,
  reopenReason: string,
  reopenedBy: string
): {
  success: boolean;
  updatedCase?: CodingCase;
  error?: string;
} {
  if (!reopenReason || reopenReason.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم توثيق سبب نظامي معتمد لإعادة فتح الحالة الترميزية بعد إغلاقها المالي.'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const currentVersion = codingCase.codingVersion || 1;
  const nextVersion = currentVersion + 1;

  const priorRevision: CodingRevisionRecord = {
    revisionNumber: currentVersion,
    reopenedAt: nowStr,
    reopenedBy,
    reason: reopenReason,
    priorCodingEntriesSnapshot: [...codingCase.codingEntries],
    priorHandoffReferenceCode: codingCase.handoffReferenceCode,
    priorCodingVersion: currentVersion
  };

  const updatedCase: CodingCase = {
    ...codingCase,
    status: 'in_progress',
    billingHandoffStatus: 'coding_review_required',
    isFinancialLocked: false,
    isReopenedForRevision: true,
    reopenReason,
    codingVersion: nextVersion,
    codingRevisions: [...(codingCase.codingRevisions || []), priorRevision]
  };

  return {
    success: true,
    updatedCase
  };
}

export function createCodingCorrection(
  codingCase: CodingCase,
  entryId: string,
  newCode: string,
  newDescriptionAr: string,
  correctionReason: string,
  coder: string,
  availableProfiles: ClassificationProfileReference[]
): {
  success: boolean;
  updatedCase?: CodingCase;
  error?: string;
} {
  if (!correctionReason || correctionReason.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم تدوين سبب التصحيح التشخيصي / الإجرائي بوضوح.'
    };
  }

  const targetEntryIndex = codingCase.codingEntries.findIndex(e => e.id === entryId);
  if (targetEntryIndex === -1) {
    return {
      success: false,
      error: 'الرمز الطبي المراد تصحيحه غير موجود في الحالة.'
    };
  }

  const oldEntry = codingCase.codingEntries[targetEntryIndex];
  const profile = availableProfiles.find(p => p.profileId === oldEntry.classificationProfileId);
  if (!profile) {
    return {
      success: false,
      error: 'CLASSIFICATION_PROFILE_NOT_VERIFIED: ملف التصنيف غير معتمد.'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const currentVersion = codingCase.codingVersion || 1;
  const nextVersion = currentVersion + 1;

  // Preserve prior snapshot in revisions
  const revisionSnapshot: CodingRevisionRecord = {
    revisionNumber: currentVersion,
    reopenedAt: nowStr,
    reopenedBy: coder,
    reason: `تصحيح الرمز (${oldEntry.code} -> ${newCode}): ${correctionReason}`,
    priorCodingEntriesSnapshot: [...codingCase.codingEntries],
    priorHandoffReferenceCode: codingCase.handoffReferenceCode,
    priorCodingVersion: currentVersion
  };

  const updatedEntries = [...codingCase.codingEntries];
  updatedEntries[targetEntryIndex] = {
    ...oldEntry,
    code: newCode,
    descriptionAr: newDescriptionAr,
    assignedAt: nowStr,
    assignedByCoder: coder
  };

  const updatedCase: CodingCase = {
    ...codingCase,
    codingVersion: nextVersion,
    codingEntries: updatedEntries,
    codingRevisions: [...(codingCase.codingRevisions || []), revisionSnapshot],
    billingHandoffStatus: 'coding_review_required'
  };

  return {
    success: true,
    updatedCase
  };
}

export function triggerCodingReviewRequired(
  codingCase: CodingCase,
  clinicalAmendmentReason: string,
  triggeredBy: string
): {
  success: boolean;
  updatedCase?: CodingCase;
} {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const currentVersion = codingCase.codingVersion || 1;

  const updatedCase: CodingCase = {
    ...codingCase,
    billingHandoffStatus: 'coding_review_required',
    reopenReason: `تنبيه مراجعة الترميز (CODING_REVIEW_REQUIRED): طرأ تعديل سريري على مستندات التنويم (${clinicalAmendmentReason}) بواسطة (${triggeredBy}) في ${nowStr}. لا يعدل التقرير السريري الأصلي.`
  };

  return {
    success: true,
    updatedCase
  };
}

// ============================================================================
// 5. RELEASE OF INFORMATION (ROI) & PDPL PRIVACY SAFEGUARDS
// ============================================================================

export function evaluateRoiEligibility(
  request: ReleaseOfInformationRequest,
  activeLegalHoldPresent: boolean
): {
  isEligible: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check 1: Identity verification
  if (!request.isRequesterIdentityVerified) {
    reasons.push('حظر إفراج: لم يتم التحقق رسمياً من هوية مقدم الطلب أو تفويضه القانوني (Identity Verification Required).');
  }

  // Check 2: Legal basis validation
  if (!request.isLegalBasisVerified) {
    reasons.push('LEGAL_BASIS_REVIEW_REQUIRED: السند النظامي للإفراج غير محقق أو غير مكتمل المستندات الثبوتية.');
  }

  // Check 3: Active Legal Hold
  if (activeLegalHoldPresent || request.activeLegalHoldPresent) {
    reasons.push('حظر إفراج: السجل الطبي خاضع لحجز قضائي / نظامي نشط (Active Legal Hold)؛ يمنع إفراجه إلا بأمر قضائي مخصص.');
  }

  // Check 4: Whole chart exception validation
  if (request.requestedScope === 'entire_chart_exception') {
    if (request.requesterType !== 'court_judicial' && request.requesterType !== 'patient') {
      reasons.push('حظر نطاق: وفق نظام حماية البيانات الشخصية (PDPL)، يمنع إفراج كامل السجل الطبي لجهات غير قضائية بدون موافقة صريحة مفصلة.');
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
}

export function prepareDisclosurePackage(
  request: ReleaseOfInformationRequest,
  candidateDocuments: RecordDocumentReference[]
): {
  success: boolean;
  packageItems?: DisclosureItem[];
  error?: string;
} {
  // HIM25: Disclosure package cannot include another patient's document!
  const wrongPatientDoc = candidateDocuments.find(d => d.patientId !== request.patientId);
  if (wrongPatientDoc) {
    return {
      success: false,
      error: `حظر أمان خصوصية حرج: تم اكتشاف وثيقة تعود لمريض آخر (MRN: ${wrongPatientDoc.mrn}) ضمن النطاق المقترح! تم إيقاف إنشاء حزمة الإفراج فوراً.`
    };
  }

  // HIM24: Scope defaults to minimum necessary, not entire chart
  const items: DisclosureItem[] = candidateDocuments.map(doc => {
    let status: DisclosureItem['inclusionStatus'] = 'included';
    let redactionNotes: string | undefined = undefined;

    if (doc.confidentialityLevel === 'highly_restricted') {
      status = 'held_for_review';
      redactionNotes = 'وثيقة ذات سرية عالية تتطلب مراجعة مسؤول الخصوصية قبل الإفراج.';
    } else if (doc.confidentialityLevel === 'sensitive') {
      status = 'redacted_in_simulation';
      redactionNotes = 'تطبيق حجب اصطناعي للمعلومات الحساسة وفق مبدأ الحد الأدنى الضروري.';
    }

    return {
      documentId: doc.id,
      documentTitle: doc.titleAr,
      documentDate: doc.clinicalDate,
      encounterId: doc.encounterId,
      authorName: doc.authorName,
      confidentialityLevel: doc.confidentialityLevel,
      inclusionStatus: status,
      redactionNotes
    };
  });

  return {
    success: true,
    packageItems: items
  };
}

export function executeSyntheticRelease(
  request: ReleaseOfInformationRequest,
  executorName: string
): {
  success: boolean;
  updatedRequest?: ReleaseOfInformationRequest;
  disclosureLog?: DisclosureLogEntry;
  error?: string;
} {
  const evalResult = evaluateRoiEligibility(request, request.activeLegalHoldPresent);
  if (!evalResult.isEligible) {
    return {
      success: false,
      error: `لا يمكن تنفيذ الإفراج: ${evalResult.reasons.join(' | ')}`
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logId = `DISC-LOG-${Date.now()}`;

  const disclosureLog: DisclosureLogEntry = {
    id: logId,
    timestamp: nowStr,
    requestId: request.id,
    requestNumber: request.requestNumber,
    patientId: request.patientId,
    patientMrn: request.mrn,
    recipientName: request.requesterName,
    recipientType: request.requesterType,
    purpose: request.purpose,
    legalBasis: request.legalBasis,
    itemsDisclosedCount: request.disclosureItems.filter(i => i.inclusionStatus === 'included').length,
    authorizedBy: executorName,
    channel: request.releaseMethod || 'secure_portal_simulation',
    pdplProcessingStage: 'simulated_disclosure'
  };

  const updatedRequest: ReleaseOfInformationRequest = {
    ...request,
    status: 'released_in_simulation',
    releasedAt: nowStr,
    releasedBy: executorName,
    disclosureLogRef: logId
  };

  return {
    success: true,
    updatedRequest,
    disclosureLog
  };
}

// ============================================================================
// 6. RETENTION & LEGAL HOLD EVALUATION
// ============================================================================

export function evaluateRetentionEligibility(
  recordCase: MedicalRecordCase,
  policy: RetentionPolicyReference | undefined,
  activeHolds: LegalHoldRecord[]
): {
  retentionRuleStatus: 'VERIFIED' | 'RETENTION_RULE_NOT_VERIFIED';
  isHoldActive: boolean;
  dispositionEligible: boolean;
  statusText: string;
} {
  // Check legal hold first - Legal hold must override synthetic disposition eligibility regardless of calculated retention age
  const hasActiveHold = activeHolds.some(
    h => h.status === 'active' &&
         (h.affectedPatientIds?.includes(recordCase.patientId) || h.affectedEncounterIds?.includes(recordCase.encounterId) || h.patientId === recordCase.patientId)
  );

  if (hasActiveHold) {
    return {
      retentionRuleStatus: 'VERIFIED',
      isHoldActive: true,
      dispositionEligible: false,
      statusText: 'حظر إتلاف/تكهين: السجل خاضع لحجز قضائي أو نظامي نشط (Active Legal Hold).'
    };
  }

  const duration = policy?.durationRule ?? policy?.retentionDurationYears;

  // Check policy rule: Missing verified rule must be RETENTION_RULE_NOT_VERIFIED; never invent duration or auto-delete
  if (!policy || policy.ruleStatus === 'RETENTION_RULE_NOT_VERIFIED' || policy.verificationState === 'not_verified' || duration === undefined) {
    return {
      retentionRuleStatus: 'RETENTION_RULE_NOT_VERIFIED',
      isHoldActive: false,
      dispositionEligible: false,
      statusText: 'RETENTION_RULE_NOT_VERIFIED: لم يتم التحقق من السياسة النظامية المعتمدة لمدة حفظ هذا النوع من السجلات (يحظر الإتلاف التلقائي).'
    };
  }

  // Calculate expiration against dischargeDate or admissionDate
  const refDateStr = recordCase.dischargeDate || recordCase.admissionDate;
  const refYear = parseInt(refDateStr.split('-')[0], 10);
  const currentYear = new Date().getFullYear();
  const yearsPassed = currentYear - refYear;

  const isExpired = yearsPassed >= duration;

  return {
    retentionRuleStatus: 'VERIFIED',
    isHoldActive: false,
    dispositionEligible: isExpired,
    statusText: isExpired
      ? `مؤهل للمراجعة الاصطناعية لانتهاء مدة الحفظ التوضيحية (${duration} سنة).`
      : `قيد الحفظ الإلزامي النشط (تبقى ${duration - yearsPassed} سنة على انتهاء المدة).`
  };
}

// ============================================================================
// 7. DOCUMENT VERSION INTEGRITY (Amend, Correct, Addendum, Entered-In-Error)
// ============================================================================

export function createDocumentAmendment(
  doc: RecordDocumentReference,
  amendedSnippet: string,
  amendmentReason: string,
  amendedBy: string,
  role: string
): {
  success: boolean;
  updatedDocument?: RecordDocumentReference;
  error?: string;
} {
  if (!amendmentReason || amendmentReason.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم توثيق سبب التعديل السريري (Amendment Reason) قبل اعتماد النسخة الجديدة.'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const nextVer = doc.currentVersionNumber + 1;

  const versionSnapshot: DocumentVersionReference = {
    versionNumber: nextVer,
    savedAt: nowStr,
    savedBy: amendedBy,
    savedByRole: role,
    title: `${doc.titleAr} (نسخة معدلة ${nextVer})`,
    contentSnippet: amendedSnippet,
    lifecycleState: 'amended',
    changeType: 'amendment',
    changeReason: amendmentReason,
    relationshipToPrior: `تعديل استكمالي للنسخة السابقة رقم ${doc.currentVersionNumber}`
  };

  const updated: RecordDocumentReference = {
    ...doc,
    lifecycleState: 'amended',
    currentVersionNumber: nextVer,
    versions: [versionSnapshot, ...doc.versions]
  };

  return { success: true, updatedDocument: updated };
}

export function createDocumentCorrection(
  doc: RecordDocumentReference,
  correctedSnippet: string,
  correctionReason: string,
  correctedBy: string,
  role: string
): {
  success: boolean;
  updatedDocument?: RecordDocumentReference;
  error?: string;
} {
  if (!correctionReason || correctionReason.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم توثيق سبب التصحيح المادي (Correction Reason) قبل اعتماد النسخة المصححة.'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const nextVer = doc.currentVersionNumber + 1;

  const versionSnapshot: DocumentVersionReference = {
    versionNumber: nextVer,
    savedAt: nowStr,
    savedBy: correctedBy,
    savedByRole: role,
    title: `${doc.titleAr} (نسخة مصححة ${nextVer})`,
    contentSnippet: correctedSnippet,
    lifecycleState: 'corrected',
    changeType: 'correction',
    changeReason: correctionReason,
    relationshipToPrior: `تصحيح خطأ كتابي/مادي في النسخة السابقة رقم ${doc.currentVersionNumber}`
  };

  const updated: RecordDocumentReference = {
    ...doc,
    lifecycleState: 'corrected',
    currentVersionNumber: nextVer,
    versions: [versionSnapshot, ...doc.versions]
  };

  return { success: true, updatedDocument: updated };
}

export function markDocumentEnteredInError(
  doc: RecordDocumentReference,
  errorReason: string,
  markedBy: string,
  role: string
): {
  success: boolean;
  updatedDocument?: RecordDocumentReference;
  error?: string;
} {
  if (!errorReason || errorReason.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم توثيق مبرر وضع علامة "أدخل خطأً" (Entered in Error).'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const nextVer = doc.currentVersionNumber + 1;

  const versionSnapshot: DocumentVersionReference = {
    versionNumber: nextVer,
    savedAt: nowStr,
    savedBy: markedBy,
    savedByRole: role,
    title: `${doc.titleAr} [أدخل خطأً - ملغى]`,
    contentSnippet: `[تم إلغاء الوثيقة واعتبارها غير صالحة سريرياً: ${errorReason}]`,
    lifecycleState: 'entered_in_error',
    changeType: 'entered_in_error',
    changeReason: errorReason,
    relationshipToPrior: 'إلغاء أهليّة الوثيقة بالكامل وحجبها عن الاستخدام السريري الروتيني'
  };

  const updated: RecordDocumentReference = {
    ...doc,
    lifecycleState: 'entered_in_error',
    referenceState: 'entered_in_error',
    currentVersionNumber: nextVer,
    versions: [versionSnapshot, ...doc.versions]
  };

  return { success: true, updatedDocument: updated };
}

export function createDocumentAddendum(
  doc: RecordDocumentReference,
  addendumSnippet: string,
  addendumReason: string,
  author: string,
  role: string
): {
  success: boolean;
  updatedDocument?: RecordDocumentReference;
  error?: string;
} {
  if (!addendumSnippet || addendumSnippet.trim().length < 5) {
    return {
      success: false,
      error: 'يلزم إدخال نص الملحق التوثيقي الإضافي (Addendum Content).'
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const nextVer = doc.currentVersionNumber + 1;

  // Addendum preserves original content, appends new text
  const currentSnippet = doc.contentSnippet || (doc.versions[0]?.contentSnippet ?? '');
  const combinedSnippet = `${currentSnippet}\n\n[ملحق توثيقي - Addendum (${nowStr})]: ${addendumSnippet}`;

  const versionSnapshot: DocumentVersionReference = {
    versionNumber: nextVer,
    savedAt: nowStr,
    savedBy: author,
    savedByRole: role,
    title: `${doc.titleAr} (ملحق إضافي ${nextVer})`,
    contentSnippet: combinedSnippet,
    lifecycleState: 'appended',
    changeType: 'addendum',
    changeReason: addendumReason || 'إضافة معلومات تكميلية دون المساس بالأصل',
    relationshipToPrior: `إلحاق محتوى تكميلي للنسخة السابقة رقم ${doc.currentVersionNumber} دون تعديل النص الأصلي`
  };

  const updated: RecordDocumentReference = {
    ...doc,
    lifecycleState: 'appended',
    currentVersionNumber: nextVer,
    contentSnippet: combinedSnippet,
    versions: [versionSnapshot, ...doc.versions]
  };

  return { success: true, updatedDocument: updated };
}

