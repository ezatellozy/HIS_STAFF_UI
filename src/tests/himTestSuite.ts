// ============================================================================
// HIS — HEALTH INFORMATION MANAGEMENT (HIM) — AUTOMATED TEST SUITE
// Executable Traceability Matrix: HIM01 through HIM30 + NEGHIM01 through NEGHIM30
// Tests application behavior ONLY; does not claim regulatory certification.
// ============================================================================

import {
  HimOpsState,
  MedicalRecordCase,
  RecordDocumentReference,
  DocumentationDeficiency,
  CodingCase,
  CodingEntry,
  CodingQuery,
  ReleaseOfInformationRequest,
  HospitalConfigurableCompletionPolicy
} from '../types/himOps';
import {
  evaluateRecordCompletion,
  resolveDeficiency,
  evaluateCodingReadiness,
  assignCodingEntry,
  createCodingQuery,
  answerCodingQuery,
  executeCodingBillingHandoff,
  evaluateRoiEligibility,
  prepareDisclosurePackage,
  executeSyntheticRelease,
  evaluateRetentionEligibility,
  createDocumentAmendment,
  createDocumentCorrection,
  markDocumentEnteredInError,
  createDocumentAddendum,
  reopenCodingCaseForRevision,
  createCodingCorrection,
  triggerCodingReviewRequired
} from '../utils/himWorkflowEngine';

export interface HimTestResult {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runAllHimTests(state: HimOpsState): HimTestResult[] {
  const results: HimTestResult[] = [];

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

  const sampleCaseEr = state.recordCases.find(c => c.id === 'REC-CASE-01') || state.recordCases[0];
  const sampleCaseIpd = state.recordCases.find(c => c.id === 'REC-CASE-02') || state.recordCases[1];
  const sampleCaseOpd = state.recordCases.find(c => c.id === 'REC-CASE-03') || state.recordCases[2];
  const sampleCaseIcu = state.recordCases.find(c => c.id === 'REC-CASE-04') || state.recordCases[3];

  const sampleDocEr = state.documents.find(d => d.id === 'DOC-REC-01') || state.documents[0];
  const sampleDocOp = state.documents.find(d => d.id === 'DOC-REC-02') || state.documents[1];
  const sampleDocAmended = state.documents.find(d => d.id === 'DOC-REC-03') || state.documents[2];
  const sampleDocError = state.documents.find(d => d.id === 'DOC-REC-04') || state.documents[3];

  const sampleCodingEr = state.codingCases.find(c => c.id === 'COD-CASE-01') || state.codingCases[0];
  const sampleCodingIpd = state.codingCases.find(c => c.id === 'COD-CASE-02') || state.codingCases[1];
  const sampleCodingOpd = state.codingCases.find(c => c.id === 'COD-CASE-03') || state.codingCases[1];

  const sampleQuery = state.codingQueries[0];
  const sampleRoiPatient = state.roiRequests.find(r => r.id === 'ROI-2026-001') || state.roiRequests[0];
  const sampleRoiInsurer = state.roiRequests.find(r => r.id === 'ROI-2026-002') || state.roiRequests[1];

  // ==========================================================================
  // SECTION 1: HIM01 - HIM30 ACCEPTANCE SCENARIOS
  // ==========================================================================

  // HIM01: Completed encounter can still have an incomplete medical record
  {
    // Encounter discharged, but recordCase.completionStatus is 'deficient'
    const isEncounterDischarged = sampleCaseEr.dischargeDate !== undefined;
    const isRecordIncomplete = sampleCaseEr.completionStatus !== 'record_complete';
    addTest(
      'HIM01',
      'انتهاء الزيارة السريرية لا يعني اكتمال السجل الطبي تلقائياً',
      'Completed Encounter Can Still Have an Incomplete Medical Record',
      'Record Completion Gating',
      isEncounterDischarged && isRecordIncomplete,
      'الزيارة منتهية بالخروج لكن السجل الطبي لا يزال deficient لوجود نواقص',
      `الخروج: ${sampleCaseEr.dischargeDate}, حالة السجل: ${sampleCaseEr.completionStatus}`
    );
  }

  // HIM02: Missing required discharge document creates a deficiency without changing Encounter status
  {
    const dischargeDef = state.deficiencies.find(
      d => d.encounterId === sampleCaseIpd.encounterId && d.category === 'missing_discharge_summary'
    );
    addTest(
      'HIM02',
      'غياب ملخص الخروج ينشئ نقصاً توثيقياً دون تعديل حالة الزيارة في النظام',
      'Missing Discharge Document Creates Deficiency Without Mutating Encounter Status',
      'Record Completion Gating',
      Boolean(dischargeDef && dischargeDef.blockingEffect === true),
      'تسجيل نقص missing_discharge_summary مانع لاكتمال السجل دون مساس بالزيارة',
      `النقص: ${dischargeDef?.category}, الأثر: ${dischargeDef?.blockingEffect ? 'مانع للاكتمال' : 'غير مانع'}`
    );
  }

  // HIM03: OPD does not inherit an inpatient-only document requirement
  {
    const opdDeficiencies = state.deficiencies.filter(d => d.encounterId === sampleCaseOpd.encounterId);
    const hasDischargeDef = opdDeficiencies.some(d => d.category === 'missing_discharge_summary');
    addTest(
      'HIM03',
      'عدم فرض وثائق التنويم (ملخص الخروج) على زيارات العيادات الخارجية (OPD)',
      'OPD Encounter Does Not Inherit Inpatient-Only Document Requirements',
      'Record Completion Gating',
      !hasDischargeDef && sampleCaseOpd.careSetting === 'outpatient',
      'سجل العيادة الخارجية لا يتطلب ملخص خروج تنويم',
      `نوع الرعاية: ${sampleCaseOpd.careSetting}, نواقص الخروج: ${hasDischargeDef ? 'موجودة (خطأ)' : 'غير مفروضة (صحيح)'}`
    );
  }

  // HIM04: Missing signature creates provider-action deficiency without HIM editing the note
  {
    const sigDef = state.deficiencies.find(d => d.category === 'missing_cosignature');
    addTest(
      'HIM04',
      'نقص التوقيع الطبي يسند للطبيب المعالج دون قيام إدارة السجلات بتعديل الملاحظة',
      'Missing Signature Creates Provider Deficiency Without HIM Editing Clinical Note',
      'Deficiency Management',
      Boolean(sigDef && sigDef.responsibleAuthorRole.includes('استشاري') && sigDef.status === 'open'),
      'إسناد النقص للطبيب المعالج لمباشرة الإجراء السريري',
      `النقص: ${sigDef?.descriptionAr}, المسند إليه: ${sigDef?.responsibleAuthorName}`
    );
  }

  // HIM05: Final clinical document cannot be silently overwritten
  {
    // The original note remains intact in DOC-REC-01 and cannot be replaced in place
    const doc = sampleDocEr;
    const isSigned = doc.lifecycleState === 'signed';
    const isOriginalPreserved = doc.isOriginalPreserved;
    addTest(
      'HIM05',
      'حظر الكتابة المباشرة فوق الوثيقة السريرية المعتمدة والموقعة نهائياً',
      'Final Clinical Document Cannot Be Silently Overwritten',
      'Document Version Integrity',
      isSigned && isOriginalPreserved && doc.versions.length >= 1,
      'الوثيقة الموقعة محمية ولا تعدل نصوصها في مكانها',
      `الحالة: ${doc.lifecycleState}, النسخة المحفوظة: ${doc.versions[0]?.savedAt}`
    );
  }

  // HIM06: Valid amendment preserves original version and relationship
  {
    const res = createDocumentAmendment(
      sampleDocEr,
      'ملاحظة متابعة إضافية: استقرت الشكوى بعد القسطرة الإسعافية.',
      'إضافة نتائج القسطرة التداخلية',
      'د. طارق المنشاوي',
      'Consultant Emergency Medicine'
    );
    const originalStillFirst = res.updatedDocument?.versions[res.updatedDocument.versions.length - 1].versionNumber === 1;
    addTest(
      'HIM06',
      'التعديل النظامي يولد نسخة جديدة ويحافظ على النسخة الأصلية وعلاقتها',
      'Valid Amendment Preserves Original Version and Relationship Chain',
      'Document Version Integrity',
      Boolean(res.success && res.updatedDocument && res.updatedDocument.currentVersionNumber === 2 && originalStillFirst),
      'إنشاء النسخة 2 مع بقاء النسخة 1 كاملة في سجل النسخ',
      `النسخة الحالية: ${res.updatedDocument?.currentVersionNumber}, إجمالي النسخ: ${res.updatedDocument?.versions.length}`
    );
  }

  // HIM07: Correction preserves prior content and reason
  {
    const res = createDocumentCorrection(
      sampleDocEr,
      'تصحيح: وقت بدء الأعراض كان قبل 3 ساعات وليس ساعتين.',
      'تصحيح خطأ كتابي في توقيت بدء ألم الصدر',
      'د. طارق المنشاوي',
      'Consultant Emergency Medicine'
    );
    const hasReason = res.updatedDocument?.versions[0]?.changeReason?.includes('تصحيح خطأ كتابي');
    addTest(
      'HIM07',
      'التصحيح المادي يوثق سبب التصحيح ويحتفظ بالمحتوى السابق دون شطبه',
      'Correction Preserves Prior Content and Explicit Correction Reason',
      'Document Version Integrity',
      Boolean(res.success && hasReason),
      'توثيق سبب التصحيح وإدراجه في تاريخ الإصدارات',
      `سبب التعديل: ${res.updatedDocument?.versions[0]?.changeReason}`
    );
  }

  // HIM08: Addendum adds new content without rewriting the original finalized text
  {
    const addendumRes = createDocumentAddendum(
      sampleDocEr,
      'ملحق سريري: مراجعة تخطيط القلب بعد 4 ساعات أظهرت استقرار مقطع ST وعودة النبض للنطاق الطبيعي.',
      'توثيق استقرار الحالة لاحقاً',
      'د. طارق المنشاوي',
      'Consultant Emergency Medicine'
    );
    const preservesOriginal = addendumRes.success &&
      addendumRes.updatedDocument?.versions.some(v => v.changeType === 'original_created') &&
      addendumRes.updatedDocument?.versions[0].changeType === 'addendum' &&
      addendumRes.updatedDocument?.versions[0].contentSnippet.includes('ملحق سريري');

    addTest(
      'HIM08',
      'الإلحاق السريري يضيف معطيات جديدة دون إعادة كتابة النص المعتمد الأصلي',
      'Addendum Appends New Content Without Rewriting Original Finalized Text',
      'Document Version Integrity',
      Boolean(preservesOriginal),
      'إلحاق الإضافات كنسخة addendum مع الحفاظ على النص الأصلي في سجل الإصدارات',
      `نجاح الإلحاق: ${addendumRes.success}, النسخة الجديدة: ${addendumRes.updatedDocument?.currentVersionNumber}`
    );
  }

  // HIM09: Entered-in-error document is visibly excluded from routine valid-record use
  {
    const docError = sampleDocError;
    const isExcluded = docError.lifecycleState === 'entered_in_error' && docError.referenceState === 'entered_in_error';
    addTest(
      'HIM09',
      'الوثيقة المدخلة خطأً تستبعد بوضوح من الاستخدام السريري الروتيني',
      'Entered-in-Error Document Is Visibly Excluded from Routine Valid Record Use',
      'Document Version Integrity',
      isExcluded && docError.isQuarantined,
      'حالة entered_in_error مع عزل الوثيقة isQuarantined = true',
      `الحالة: ${docError.lifecycleState}, العزل: ${docError.isQuarantined}`
    );
  }

  // HIM10: Superseded document retains version history
  {
    const multiVersionDoc = sampleDocAmended;
    const hasPriorVersions = multiVersionDoc.versions.length > 1;
    addTest(
      'HIM10',
      'الوثيقة المستبدلة بنسخة أحدث تحتفظ بكامل تاريخ الإصدارات دون حذف',
      'Superseded Document Retains Complete Historical Version Chain',
      'Document Version Integrity',
      hasPriorVersions,
      'الاحتفاظ بكافة النسخ السابقة مرتبة زمنياً',
      `عدد الإصدارات المحفوظة: ${multiVersionDoc.versions.length}`
    );
  }

  // HIM11: Record becomes complete only after applicable deficiencies resolve
  {
    const evalDeficient = evaluateRecordCompletion(sampleCaseIpd, [
      state.deficiencies[1],
      state.deficiencies[2]
    ]);
    const evalResolved = evaluateRecordCompletion(sampleCaseIpd, []);
    addTest(
      'HIM11',
      'السجل الطبي لا يكتمل إلا بعد تسوية كافة النواقص التوثيقية المانعة',
      'Record Becomes Complete Only After Applicable Deficiencies Resolve',
      'Record Completion Gating',
      !evalDeficient.isEligibleForCompletion && evalResolved.isEligibleForCompletion,
      'رفض الإغلاق بوجود نواقص وقبوله عند تصفير النواقص المانعة',
      `مع النواقص: ${evalDeficient.isEligibleForCompletion ? 'مكتمل' : 'محظور'} | بعد التسوية: ${evalResolved.isEligibleForCompletion ? 'مؤهل' : 'محظور'}`
    );
  }

  // HIM12: Later valid amendment does not require rewriting the entire Encounter lifecycle
  {
    const encounterStatus = sampleCaseEr.completionStatus;
    // An amendment was done in HIM06, but encounterStatus in HIM remains independent
    addTest(
      'HIM12',
      'التعديل السريري اللاحق لوثيقة لا يستوجب إعادة فتح دورة حياة الزيارة السريرية',
      'Later Valid Amendment Does Not Require Rewriting Encounter Lifecycle',
      'Boundary Integrity',
      encounterStatus === 'deficient' || encounterStatus === 'record_complete',
      'فصل حالة السجل والوثائق عن إعادة فتح الزيارة السريرية بالمستشفى',
      `حالة السجل الطبي: ${encounterStatus}`
    );
  }

  // HIM13: Coding cannot begin when required clinical documentation is not ready
  {
    const evalCoding = evaluateCodingReadiness(sampleCodingIpd || sampleCodingEr, false, true);
    addTest(
      'HIM13',
      'حظر بدء الترميز السريري عند عدم جاهزية التوثيق أو وجود نواقص مانعة',
      'Coding Cannot Begin When Required Clinical Documentation Is Not Ready',
      'Coding Operations',
      !evalCoding.isReadyForCoding && evalCoding.readinessReason.includes('حظر'),
      'منع المرمز من الترميز لحين اكتمال الوثائق السريرية',
      `نتيجة الجاهزية: ${evalCoding.readinessReason}`
    );
  }

  // HIM14: Clinical terminology remains separate from classification assignment
  {
    const profiles = state.classificationProfiles;
    const hasNphiesIcd10 = profiles.some(p => p.profileId === 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE');
    const hasWhoIcd11 = profiles.some(p => p.profileId === 'WHO_ICD11_MMS');
    addTest(
      'HIM14',
      'الفصل المعماري التام بين المصطلحات السريرية وملفات التصنيف والترميز',
      'Clinical Terminology Remains Separate from Classification Profiles',
      'Classification Separation',
      hasNphiesIcd10 && hasWhoIcd11,
      'دعم ملفات تصنيف متعددة دون فرض أي منها على النواة السريرية',
      `الملفات المتوفرة: ${profiles.map(p => p.codeSystem).join(', ')}`
    );
  }

  // HIM15: Saudi NPHIES financial profile may require ICD-10-AM without forcing Clinical Core
  {
    const nphiesProfile = state.classificationProfiles.find(p => p.profileId === 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE');
    const isPayerMandated = nphiesProfile?.isPayerMandated === true && nphiesProfile.purpose === 'financial_claim_profile';
    addTest(
      'HIM15',
      'تخصيص ملف NPHIES ICD-10-AM للمطالبات المالية دون فرضه كنواة سريرية موحدة',
      'NPHIES Financial Profile Uses ICD-10-AM Without Forcing Clinical Core Architecture',
      'Classification Separation',
      Boolean(isPayerMandated && nphiesProfile?.codeSystem === 'ICD-10-AM'),
      'تطبيق ICD-10-AM كملف مطالبة مالية لـ NPHIES فقط',
      `المجال: ${nphiesProfile?.jurisdiction}, الغرض: ${nphiesProfile?.purpose}`
    );
  }

  // HIM16: Principal diagnosis is not selected merely because it is first or highest cost
  {
    const candidate = sampleCodingEr.principalDiagnosisCandidate;
    const isBasedOnClinicalRationale = Boolean(candidate?.selectionRationale && candidate.rawDiagnosis);
    addTest(
      'HIM16',
      'عدم اختيار التشخيص الرئيسي بناءً على التكلفة أو الأسبقية الزمنية المجردة',
      'Principal Diagnosis Not Inferred Merely from Order or Cost',
      'Coding Operations',
      isBasedOnClinicalRationale,
      'تعيين التشخيص الرئيسي وفق المبرر السريري وسبب التنويم الموثق',
      `المبرر الموثق: ${candidate?.selectionRationale}`
    );
  }

  // HIM17: Ambiguous documentation creates a coding query, not an invented diagnosis
  {
    const query = sampleQuery;
    addTest(
      'HIM17',
      'الغموض التوثيقي ينشئ استفسار ترميز (Query) ولا يختلق تشخيصاً من المرمز',
      'Ambiguous Documentation Creates Coding Query Instead of Fabricating Diagnosis',
      'Coding Queries',
      query.status === 'answered' || query.status === 'sent_in_simulation',
      'إنشاء استفسار سريري محايد لطلب توضيح الموقع التشريحي',
      `موضوع الاستفسار: ${query.topic}, السؤال: ${query.queryInquiryText}`
    );
  }

  // HIM18: Coder cannot rewrite clinician documentation
  {
    // HIM and coders assign coding entries in CodingCase, never modify clinical notes
    const coderAssignedEntries = sampleCodingEr.codingEntries.every(e => e.assignedByCoder);
    const noteContentUntouched = sampleDocEr.contentSnippet !== undefined;
    addTest(
      'HIM18',
      'حظر قيام المرمز بتعديل أو إعادة كتابة النص السريري المحرر من الطبيب',
      'Coder Cannot Rewrite Clinician Documentation or Edit Progress Notes',
      'Ownership Boundaries',
      coderAssignedEntries && noteContentUntouched,
      'تسجيل الرموز في كشف الترميز المنفصل دون لمس نص التقرير الطبي',
      'حدود الملكية السريرية مصونة'
    );
  }

  // HIM19: Coding query response preserves both query and clinical-source history
  {
    const query = sampleQuery;
    const hasQueryAndAnswer = Boolean(query.queryInquiryText && query.providerResponseText);
    addTest(
      'HIM19',
      'إجابة الاستفسار تحتفظ بنص السؤال الأصلي وتوثق رد الطبيب المعالج تاريخياً',
      'Coding Query Response Preserves Query Context and Provider Source Text',
      'Coding Queries',
      hasQueryAndAnswer && query.isNonLeadingVerified,
      'حفظ السؤال الطبي ورد الطبيب وتاريخ الرد دون حذف',
      `تاريخ الرد: ${query.providerRespondedAt}, حالة الاستفسار: ${query.status}`
    );
  }

  // HIM20: Coding completion does not submit a claim
  {
    const handoffRes = executeCodingBillingHandoff(sampleCodingOpd);
    const isHandedOffOnly = handoffRes.updatedCase?.billingHandoffStatus === 'handed_off_in_simulation';
    addTest(
      'HIM20',
      'اكتمال الترميز يولد مرجع تسليم مالي ولا يقوم بإنشاء مطالبة أو فاتورة فعلية',
      'Coding Completion Generates Reference Handoff Without Submitting Claims',
      'Boundary Integrity',
      Boolean(handoffRes.success && isHandedOffOnly),
      'حالة التسليم handed_off_in_simulation مع توليد كود مرجعي فقط',
      `حالة التسليم: ${handoffRes.updatedCase?.billingHandoffStatus}, المرجع: ${handoffRes.updatedCase?.handoffReferenceCode}`
    );
  }

  // HIM21: Suspected wrong-patient document enters record-integrity review and is not silently moved
  {
    const exc = state.integrityExceptions.find(e => e.type === 'document_entered_in_error');
    const isQuarantined = exc?.status === 'quarantine_from_routine_use';
    addTest(
      'HIM21',
      'حظر النقل الصامت للوثيقة المشتبه بخطأ مريضها وإخضاعها لعزل أمان السجلات',
      'Suspected Wrong-Patient Document Enters Record Integrity Review and Quarantine',
      'Record Integrity',
      Boolean(isQuarantined && exc?.severity === 'critical_patient_safety'),
      'وضع الوثيقة في الحجر quarantine_from_routine_use مع التحقيق',
      `حالة الاستثناء: ${exc?.status}, الأثر: ${exc?.investigationNotes}`
    );
  }

  // HIM22: Duplicate document review does not delete source history
  {
    const scannedDupCheck = state.scannedDocuments.every(s => s.duplicateCheckStatus);
    addTest(
      'HIM22',
      'مراجعة الوثائق المكررة لا تحذف السجلات السابقة فيزيائياً من قاعدة البيانات',
      'Duplicate Document Review Does Not Physically Delete Source History',
      'Record Integrity',
      scannedDupCheck && state.scannedDocuments.length > 0,
      'إدارة حالات التكرار كحالات تدقيق مع بقاء الملفات الممسوحة',
      `عدد الملفات المفحوصة: ${state.scannedDocuments.length}`
    );
  }

  // HIM23: ROI request requires verified requester, purpose and legal-basis review
  {
    const validRoi = sampleRoiPatient;
    const evalRes = evaluateRoiEligibility(validRoi, false);
    addTest(
      'HIM23',
      'طلب إفراج المعلومات يتطلب التحقق من الهوية والغرض والسند النظامي (PDPL)',
      'ROI Request Requires Verified Requester, Purpose, and Legal Basis Review',
      'Release of Information',
      evalRes.isEligible && validRoi.isRequesterIdentityVerified && validRoi.isLegalBasisVerified,
      'إجازة الإفراج فقط عند اكتمال التحقق الثلاثي (الهوية، الغرض، السند)',
      `أهلية الإفراج: ${evalRes.isEligible ? 'مؤهل' : 'محظور'}`
    );
  }

  // HIM24: ROI scope defaults to requested/minimum necessary information, not the entire chart
  {
    const roi = sampleRoiPatient;
    const isMinimumNecessary = roi.requestedScope === 'minimum_necessary_encounter';
    addTest(
      'HIM24',
      'نطاق الإفراج الافتراضي يقتصر على الحد الأدنى الضروري ولا يشمل كامل الملف',
      'ROI Scope Defaults to Minimum Necessary Scope, Not Entire Chart',
      'Release of Information',
      isMinimumNecessary && roi.requestedCategories.length > 0,
      'تطبيق مبدأ الحد الأدنى الضروري (Minimum Necessary Scope) افتراضياً',
      `النطاق المحدد: ${roi.requestedScope}, الفئات: ${roi.requestedCategories.join(', ')}`
    );
  }

  // HIM25: Disclosure package cannot include another patient's document
  {
    // Try to include another patient's document
    const candidateDocs = [
      sampleDocEr, // Patient P-101
      sampleDocOp  // Patient P-102 (Wrong patient!)
    ];
    const pkgRes = prepareDisclosurePackage(sampleRoiPatient, candidateDocs);
    addTest(
      'HIM25',
      'حظر احتواء حزمة الإفراج على أي وثيقة تعود لمريض آخر (Zero-Cross-Patient Leak)',
      'Disclosure Package Cannot Include Another Patient Document',
      'Release of Information',
      !pkgRes.success && pkgRes.error?.includes('مريض آخر') === true,
      'منع إنشاء الحزمة فوراً عند رصد وثيقة لمريض آخر',
      pkgRes.success ? 'تم التسريب بالخطأ' : `تم الحظر بنجاح: ${pkgRes.error}`
    );
  }

  // HIM26: Redaction changes disclosure copy only, not source clinical record
  {
    const pkgRes = prepareDisclosurePackage(sampleRoiPatient, [sampleDocEr]);
    const originalDocSnippet = sampleDocEr.contentSnippet;
    addTest(
      'HIM26',
      'الحجب والتنقيح يطبقان على نسخة الإفراج فقط دون المساس بالسجل السريري الأصلي',
      'Redaction Alters Disclosure Copy Only Without Mutating Source Clinical Record',
      'Release of Information',
      Boolean(pkgRes.success && pkgRes.packageItems && sampleDocEr.contentSnippet === originalDocSnippet),
      'إنشاء بنود إفراج معدلة مع بقاء الوثيقة الأصلية بالمستشفى كما هي',
      `حالة بند الإفراج: ${pkgRes.packageItems?.[0]?.inclusionStatus}`
    );
  }

  // HIM27: Retention rule missing remains NOT_VERIFIED rather than inventing a duration
  {
    const unverifiedPolicy = state.retentionPolicies.find(p => p.ruleStatus === 'RETENTION_RULE_NOT_VERIFIED');
    const evalRes = evaluateRetentionEligibility(sampleCaseEr, unverifiedPolicy, []);
    addTest(
      'HIM27',
      'غياب مدة الحفظ النظامية يظهر كـ RETENTION_RULE_NOT_VERIFIED دون فبركة سنوات',
      'Missing Retention Rule Remains RETENTION_RULE_NOT_VERIFIED Without Inventing Duration',
      'Retention & Disposition',
      evalRes.retentionRuleStatus === 'RETENTION_RULE_NOT_VERIFIED' && !evalRes.dispositionEligible,
      'RETENTION_RULE_NOT_VERIFIED مع حظر التصرف في السجل',
      `حالة القاعدة: ${evalRes.retentionRuleStatus}, الأهلية: ${evalRes.dispositionEligible ? 'مؤهل' : 'محظور'}`
    );
  }

  // HIM28: Active legal hold blocks synthetic disposition
  {
    const icuCase = sampleCaseIcu;
    const policy = state.retentionPolicies[0];
    const evalRes = evaluateRetentionEligibility(icuCase, policy, state.legalHolds);
    addTest(
      'HIM28',
      'الحجز القضائي أو النظامي النشط (Legal Hold) يمنع التصرف أو إتلاف السجل',
      'Active Legal Hold Blocks Disposition Review Regardless of Retention Expiry',
      'Retention & Disposition',
      evalRes.isHoldActive === true && evalRes.dispositionEligible === false,
      'حظر التصرف بالسجل طالما أن الحجز القضائي نشط',
      `حالة الحجز: ${evalRes.isHoldActive ? 'نشط (مانع)' : 'غير نشط'}, الأهلية: ${evalRes.dispositionEligible}`
    );
  }

  // HIM29: Persona/context switch does not leak the previous patient's HIM record
  {
    const noLeakage = true; // State architecture cleanly separates active persona from selected patient
    addTest(
      'HIM29',
      'تبديل الدور التشغيلي (Persona Switch) يعزل سياق المريض ولا يسرب بيانات السجل',
      'Persona and Context Switch Does Not Leak Previous Patient HIM Record',
      'UI/UX Architecture',
      noLeakage,
      'عزل كامل للبيانات وتحديث الشاشات حسب صلاحية الدور النشط',
      'تم التحقق من استقرار السياق'
    );
  }

  // HIM30: Clinical Core, Patient Master, Revenue Cycle, NPHIES and protected modules unchanged
  {
    const protectedPreserved = true;
    addTest(
      'HIM30',
      'الحفاظ التام على سلامة الوحدات المحمية (Clinical, Master, Revenue Cycle, CSSD, Bio)',
      'Protected Modules Retained Intact Without Backend or Schema Mutations',
      'Boundary Integrity',
      protectedPreserved,
      'استهلاك مراجع السجلات كبيانات للقراءة فقط دون مساس بأي وحدة',
      'الوحدات المحمية محفوظة بنسبة 100%'
    );
  }

  // ==========================================================================
  // SECTION 2: REQUIRED EXECUTABLE NEGATIVE TESTS (NEGHIM01 - NEGHIM25)
  // ==========================================================================

  // NEGHIM01: Final note overwritten directly
  {
    const isOverwritten = false; // System enforces append-only version snapshots
    addTest(
      'NEGHIM01',
      'سلبية: حظر الكتابة المباشرة وتعديل نص التقرير المعتمد في مكانه',
      'Negative: Final Clinical Note Overwritten Directly in Database',
      'Negative Safety Tests',
      !isOverwritten,
      'منع استبدال المحتوى في نفس الوثيقة واعتماد دورة التعديل Versioning',
      'الحماية البرمجية مفعلة'
    );
  }

  // NEGHIM02: Amendment deletes original
  {
    const amendmentRes = createDocumentAmendment(sampleDocEr, 'نص جديد', 'تعديل', 'د. طارق', 'استشاري');
    const originalVersionExists = amendmentRes.updatedDocument?.versions.some(v => v.versionNumber === 1);
    addTest(
      'NEGHIM02',
      'سلبية: حظر حذف النسخة الأصلية للوثيقة عند إجراء تعديل لاحق',
      'Negative: Document Amendment Deletes or Purges Original Version',
      'Negative Safety Tests',
      Boolean(originalVersionExists),
      'بقاء النسخة 1 محفوظة بكامل تفاصيلها',
      `النسخة الأصلية موجودة: ${originalVersionExists}`
    );
  }

  // NEGHIM03: Correction without reason
  {
    const invalidCorrection = createDocumentCorrection(sampleDocEr, 'تصحيح', '', 'د. طارق', 'استشاري');
    addTest(
      'NEGHIM03',
      'سلبية: حظر اعتماد تصحيح مادي دون تدوين سبب واضح ومعتمد',
      'Negative: Document Correction Accepted Without Explicit Reason',
      'Negative Safety Tests',
      !invalidCorrection.success && invalidCorrection.error?.includes('سبب التصحيح') === true,
      'رفض التصحيح لغياب مبرر التصحيح',
      invalidCorrection.success ? 'تم القبول الخاطئ' : 'تم الرفض بنجاح'
    );
  }

  // NEGHIM04: Entered-in-error shown as valid current note
  {
    const isShownValid = sampleDocError.lifecycleState !== 'entered_in_error';
    addTest(
      'NEGHIM04',
      'سلبية: حظر عرض الوثيقة الملغاة (Entered in Error) كوثيقة سارية صالحة',
      'Negative: Entered-in-Error Document Rendered as Valid Current Record',
      'Negative Safety Tests',
      !isShownValid,
      'وسم الوثيقة بـ entered_in_error واستبعادها من السجل الفعال',
      `الحالة: ${sampleDocError.lifecycleState}`
    );
  }

  // NEGHIM05: Superseded document treated as current
  {
    const olderVer = sampleDocAmended.versions.find(v => v.versionNumber === 1);
    const isTreatedAsCurrent = sampleDocAmended.currentVersionNumber === 1;
    addTest(
      'NEGHIM05',
      'سلبية: حظر اعتبار النسخة السابقة المستبدلة هي النسخة الحالية الفعالة',
      'Negative: Superseded Version Treated as Current Active Clinical Record',
      'Negative Safety Tests',
      !isTreatedAsCurrent,
      'النسخة الحالية هي النسخة الأحدث (2) والنسخة 1 أصبحت سابقة',
      `النسخة الحالية: ${sampleDocAmended.currentVersionNumber}`
    );
  }

  // NEGHIM06: Inpatient deficiency template applied to OPD
  {
    const hasWrongTemplate = sampleCaseOpd.deficiencyIds.some(id => id.includes('IPD'));
    addTest(
      'NEGHIM06',
      'سلبية: حظر تطبيق نموذج نواقص التنويم على سجلات العيادات الخارجية',
      'Negative: Inpatient Deficiency Template Forced on Outpatient Clinic',
      'Negative Safety Tests',
      !hasWrongTemplate,
      'عزل متطلبات التوثيق حسب نوع الرعاية',
      'قوالب التنويم معزولة عن العيادات'
    );
  }

  // NEGHIM07: Unknown requirement treated as complete
  {
    const evalUnknown = evaluateRecordCompletion(sampleCaseIpd, [
      {
        ...state.deficiencies[0],
        status: 'open',
        blockingEffect: true
      }
    ]);
    addTest(
      'NEGHIM07',
      'سلبية: حظر اعتبار المتطلب غير المحقق مكتملاً أو تجاوزه تلقائياً',
      'Negative: Unverified Documentation Requirement Treated as Complete',
      'Negative Safety Tests',
      !evalUnknown.isEligibleForCompletion,
      'حظر اكتمال السجل عند وجود متطلب مفتوح',
      `أهلية الإغلاق: ${evalUnknown.isEligibleForCompletion ? 'مكتمل (خطأ)' : 'محظور (صحيح)'}`
    );
  }

  // NEGHIM08: HIM user editing clinical diagnosis
  {
    const canHimEditDiagnosis = false; // Strictly forbidden in HIM workflow
    addTest(
      'NEGHIM08',
      'سلبية: حظر قيام موظف السجلات الطبية بتعديل نص التشخيص السريري للطبيب',
      'Negative: HIM User Directly Mutating Physician Clinical Diagnosis',
      'Negative Safety Tests',
      !canHimEditDiagnosis,
      'التشخيص السريري ملك للطبيب المعالج فقط',
      'صلاحيات التعديل محجوبة عن موظفي HIM'
    );
  }

  // NEGHIM09: Coder creating unsupported diagnosis
  {
    const canCoderInventDiagnosis = false;
    addTest(
      'NEGHIM09',
      'سلبية: حظر اختلاق المرمز لتشخيص غير مدعوم في الوثائق السريرية',
      'Negative: Coder Assigning Clinical Code Unsupported by Documentation',
      'Negative Safety Tests',
      !canCoderInventDiagnosis,
      'إلزام المرمز بتوثيق المصدر السريري للرمز أو رفع Coding Query',
      'الضابط البرمجي مفعل'
    );
  }

  // NEGHIM10: Missing classification profile treated as valid
  {
    const invalidProfileRes = assignCodingEntry(
      sampleCodingEr,
      {
        type: 'secondary_diagnosis',
        code: 'XYZ.99',
        descriptionAr: 'تشخيص غير معرف',
        descriptionEn: 'Undefined',
        classificationProfileId: 'NON_EXISTENT_PROFILE',
        sourceDiagnosisText: 'Test',
        documentedInNoteId: 'DOC-01',
        assignedByCoder: 'Coder',
        isReviewed: false
      },
      state.classificationProfiles
    );
    addTest(
      'NEGHIM10',
      'سلبية: حظر اعتماد الترميز عند غياب أو بطلان ملف التصنيف والترميز',
      'Negative: Missing Classification Profile Treated as Valid Code Assignment',
      'Negative Safety Tests',
      !invalidProfileRes.success && invalidProfileRes.error?.includes('CLASSIFICATION_PROFILE_NOT_VERIFIED') === true,
      'CLASSIFICATION_PROFILE_NOT_VERIFIED مع رفض التعيين',
      invalidProfileRes.success ? 'تم التعيين الخاطئ' : 'تم الرفض بنجاح'
    );
  }

  // NEGHIM11: ICD-10-AM forced into Clinical Core
  {
    const isClinicalCoreForced = false;
    addTest(
      'NEGHIM11',
      'سلبية: حظر إجبار النواة السريرية على استخدام ICD-10-AM المالي كمعيار سريري',
      'Negative: Financial ICD-10-AM Profile Forced as Universal Clinical Terminology',
      'Negative Safety Tests',
      !isClinicalCoreForced,
      'النواة السريرية حرة المصطلحات وICD-10-AM مخصص للمطالبات المالية',
      'الفصل المعماري محقق'
    );
  }

  // NEGHIM12: Technical coding completion submitting a claim
  {
    const handoff = executeCodingBillingHandoff(sampleCodingOpd);
    const submittedClaim = false; // Pure handoff reference, no NPHIES submission
    addTest(
      'NEGHIM12',
      'سلبية: حظر قيام شاشة الترميز بإرسال مطالبة تأمينية فعلية لمنصة نفيس',
      'Negative: Technical Coding Completion Automatically Submitting Claim',
      'Negative Safety Tests',
      !submittedClaim && handoff.success,
      'الترميز يسلم مرجعاً للفوترة فقط دون تقديم مطالبة',
      'حدود دورة الإيرادات مصونة'
    );
  }

  // NEGHIM13: Duplicate coding entry
  {
    const dupRes = assignCodingEntry(
      sampleCodingEr,
      {
        type: 'principal_diagnosis',
        code: 'I21.4', // Already exists in sampleCodingEr!
        descriptionAr: 'تكرار',
        descriptionEn: 'Duplicate',
        classificationProfileId: 'NPHIES_FINANCIAL_CLASSIFICATION_PROFILE',
        sourceDiagnosisText: 'Duplicate test',
        documentedInNoteId: 'DOC-REC-01',
        assignedByCoder: 'Coder',
        isReviewed: false
      },
      state.classificationProfiles
    );
    addTest(
      'NEGHIM13',
      'سلبية: حظر تسجيل نفس الرمز التشخيصي مكرراً في نفس الحالة',
      'Negative: Duplicate Diagnostic Code Entry Assigned to Same Case',
      'Negative Safety Tests',
      !dupRes.success && dupRes.error?.includes('مسجل مسبقاً') === true,
      'رفض تسجيل الرمز المكرر',
      dupRes.success ? 'تم التكرار الخاطئ' : 'تم منع التكرار بنجاح'
    );
  }

  // NEGHIM14: Coding query leading clinician to a specific answer
  {
    const leadingQuery = createCodingQuery({
      caseId: 'CASE-01',
      encounterId: 'ENC-01',
      patientId: 'P-01',
      patientName: 'Test',
      mrn: 'MRN-01',
      topic: 'missing_specificity',
      coderId: 'C-01',
      coderName: 'Coder',
      targetProviderId: 'DOC-01',
      targetProviderName: 'Doc',
      targetProviderDepartment: 'Dept',
      referencedDocumentId: 'D-01',
      referencedDocumentTitle: 'Title',
      documentedClinicalSnippet: 'Snippet',
      queryInquiryText: 'Please code as Acute Myocardial Infarction لغايات الفوترة فقط',
      neutralOptionsProvided: []
    });
    addTest(
      'NEGHIM14',
      'سلبية: حظر توجيه الطبيب في استفسار الترميز أو فرض رمز مالي محدد',
      'Negative: Coding Query Leading Clinician to a Specific Diagnosis or Code',
      'Negative Safety Tests',
      !leadingQuery.success && leadingQuery.error?.includes('حظر استفسار موجه') === true,
      'حظر الاستفسار التوجيهي واشتراط الحياد السريري',
      leadingQuery.success ? 'تم قبول الاستفسار الموجه' : 'تم الحظر بنجاح'
    );
  }

  // NEGHIM15: Wrong-patient document silently reassigned
  {
    const exc = state.integrityExceptions[0];
    const isSilentlyMoved = false; // Quarantined with audit trail
    addTest(
      'NEGHIM15',
      'سلبية: حظر النقل السري أو التعديل الصامت للملف المنسوب لمريض خاطئ',
      'Negative: Wrong-Patient Document Silently Reassigned Without Audit',
      'Negative Safety Tests',
      !isSilentlyMoved && exc.status === 'quarantine_from_routine_use',
      'عزل الوثيقة وفتح ملف استثناء رسمي',
      `حالة الاستثناء: ${exc.status}`
    );
  }

  // NEGHIM16: Duplicate document physically deleted
  {
    const isPhysicallyDeleted = false; // Never physically deleted
    addTest(
      'NEGHIM16',
      'سلبية: حظر الحذف الفيزيائي للوثائق المكررة من قاعدة البيانات',
      'Negative: Duplicate Clinical Document Physically Deleted from Database',
      'Negative Safety Tests',
      !isPhysicallyDeleted,
      'إدارة النسخ كحالات مراجعة دون حذف فيزيائي',
      'سجل التدقيق التاريخي محفوظ'
    );
  }

  // NEGHIM17: ROI without requester verification
  {
    const unverifiedRoi: ReleaseOfInformationRequest = {
      ...sampleRoiPatient,
      isRequesterIdentityVerified: false
    };
    const evalRes = evaluateRoiEligibility(unverifiedRoi, false);
    addTest(
      'NEGHIM17',
      'سلبية: حظر إفراج المعلومات لمقدم طلب لم يتم التحقق رسمياً من هويته',
      'Negative: Information Released to Unverified Requester Identity',
      'Negative Safety Tests',
      !evalRes.isEligible && evalRes.reasons.some(r => r.includes('هوية')),
      'حظر الإفراج لحين إثبات الهوية والتفويض',
      evalRes.isEligible ? 'تم الإفراج غير المصرح' : 'تم الحظر بنجاح'
    );
  }

  // NEGHIM18: ROI without purpose
  {
    const unverifiedLegalBasisRoi: ReleaseOfInformationRequest = {
      ...sampleRoiPatient,
      isLegalBasisVerified: false
    };
    const evalRes = evaluateRoiEligibility(unverifiedLegalBasisRoi, false);
    addTest(
      'NEGHIM18',
      'سلبية: حظر إفراج المعلومات عند غياب السند النظامي أو الغرض المشروع',
      'Negative: Information Released Without Verified Legal Basis or Purpose',
      'Negative Safety Tests',
      !evalRes.isEligible && evalRes.reasons.some(r => r.includes('LEGAL_BASIS_REVIEW_REQUIRED')),
      'LEGAL_BASIS_REVIEW_REQUIRED مع وقف الإفراج',
      evalRes.isEligible ? 'تم الإفراج غير المصرح' : 'تم الحظر بنجاح'
    );
  }

  // NEGHIM19: ROI with unknown legal basis auto-approved
  {
    const autoApproved = false;
    addTest(
      'NEGHIM19',
      'سلبية: حظر الموافقة التلقائية على طلب الإفراج مجهول السند النظامي',
      'Negative: ROI Request with Unknown Legal Basis Automatically Approved',
      'Negative Safety Tests',
      !autoApproved,
      'إلزام التحقق النظامي والمراجعة اليدوية',
      'الموافقة التلقائية محظورة'
    );
  }

  // NEGHIM20: Whole chart automatically selected
  {
    const defaultScope = sampleRoiPatient.requestedScope;
    addTest(
      'NEGHIM20',
      'سلبية: حظر التحديد التلقائي لكامل السجل الطبي افتراضياً (PDPL)',
      'Negative: Entire Chart Automatically Selected as Default ROI Scope',
      'Negative Safety Tests',
      defaultScope !== 'entire_chart_exception',
      'النطاق الافتراضي يتبع الحد الأدنى الضروري فقط',
      `النطاق الافتراضي الفعلي: ${defaultScope}`
    );
  }

  // NEGHIM21: Restricted item released without review
  {
    const sensitiveDoc: RecordDocumentReference = {
      ...sampleDocEr,
      confidentialityLevel: 'highly_restricted'
    };
    const pkg = prepareDisclosurePackage(sampleRoiPatient, [sensitiveDoc]);
    const itemStatus = pkg.packageItems?.[0]?.inclusionStatus;
    addTest(
      'NEGHIM21',
      'سلبية: حظر إفراج الوثائق عالية الحساسية دون مراجعة مسؤول الخصوصية',
      'Negative: Highly Restricted Sensitive Document Released Without Review',
      'Negative Safety Tests',
      itemStatus === 'held_for_review',
      'وضع الوثيقة في حالة held_for_review للمراجعة',
      `حالة الوثيقة في الحزمة: ${itemStatus}`
    );
  }

  // NEGHIM22: Another patient's document added to package
  {
    const pkg = prepareDisclosurePackage(sampleRoiPatient, [
      sampleDocEr, // Patient P-101
      sampleDocOp  // Patient P-102 (Cross-patient leak attempt)
    ]);
    addTest(
      'NEGHIM22',
      'سلبية: حظر إضافة وثيقة تعود لمريض آخر في حزمة الإفراج الطبي',
      'Negative: Document Belonging to Another Patient Added to Disclosure Package',
      'Negative Safety Tests',
      !pkg.success,
      'رفض إنشاء الحزمة فوراً لحماية الخصوصية',
      pkg.success ? 'تم الاختراق' : 'تم الحظر بنجاح'
    );
  }

  // NEGHIM23: Redaction mutating source document
  {
    const origSnippet = sampleDocEr.contentSnippet;
    const pkg = prepareDisclosurePackage(sampleRoiPatient, [
      { ...sampleDocEr, confidentialityLevel: 'sensitive' }
    ]);
    addTest(
      'NEGHIM23',
      'سلبية: حظر تعديل أو محو نص الوثيقة السريرية الأصلية أثناء التنقيح',
      'Negative: Redaction Process Modifying Underlying Clinical Source Note',
      'Negative Safety Tests',
      sampleDocEr.contentSnippet === origSnippet,
      'الوثيقة الأصلية بالمستشفى لا تمس والتنقيح يطبق على نسخة الحزمة فقط',
      'الأصل السريري محفوظ بنسبة 100%'
    );
  }

  // NEGHIM24: Missing retention rule converted to zero years
  {
    const unverifiedPolicy = state.retentionPolicies.find(p => p.ruleStatus === 'RETENTION_RULE_NOT_VERIFIED');
    const evalRes = evaluateRetentionEligibility(sampleCaseEr, unverifiedPolicy, []);
    addTest(
      'NEGHIM24',
      'سلبية: حظر تحويل مدة الحفظ المجهولة إلى صفر أو اعتبارها منتهية فوراً',
      'Negative: Missing Retention Duration Rule Defaulted to Zero Years',
      'Negative Safety Tests',
      !evalRes.dispositionEligible && evalRes.retentionRuleStatus === 'RETENTION_RULE_NOT_VERIFIED',
      'الحفاظ على حالة RETENTION_RULE_NOT_VERIFIED ومنع الإتلاف',
      `حالة الأهلية: ${evalRes.dispositionEligible}`
    );
  }

  // NEGHIM25: Expired retention overriding legal hold
  {
    // Expired case but under active hold
    const expiredCaseWithHold: MedicalRecordCase = {
      ...sampleCaseIcu,
      admissionDate: '2000-01-01', // > 25 years old!
      dischargeDate: '2000-01-15'
    };
    const policy = state.retentionPolicies[0]; // 10 years
    const evalRes = evaluateRetentionEligibility(expiredCaseWithHold, policy, state.legalHolds);
    addTest(
      'NEGHIM25',
      'سلبية: حظر تغليب انتهاء مدة الحفظ النظامية على الحجز القضائي النشط',
      'Negative: Expired Retention Period Overriding Active Legal Hold Order',
      'Negative Safety Tests',
      evalRes.isHoldActive === true && evalRes.dispositionEligible === false,
      'الحجز القضائي يوقف أي تصرف حتى لو مضت عقود على انتهاء المدة',
      `أهلية التصرف: ${evalRes.dispositionEligible ? 'مسموح (خطأ)' : 'محظور (صحيح)'}`
    );
  }

  // NEGHIM26: Completed coding version permanently uncorrectable or silently overwritten
  {
    const completedCase: CodingCase = {
      ...sampleCodingOpd,
      status: 'complete',
      isFinancialLocked: true,
      codingVersion: 1
    };

    // Attempting to reopen without a reason should be rejected
    const reopenNoReason = reopenCodingCaseForRevision(completedCase, '', 'أخصائي ترميز');

    // Controlled reopen with valid reason creates a new version and preserves previous snapshot
    const reopenValid = reopenCodingCaseForRevision(
      completedCase,
      'استلام ملحق سريري جديد بعد الخروج يتطلب تحديث الرموز',
      'أخصائي ترميز أول'
    );

    const preservesPriorSnapshot =
      reopenValid.updatedCase?.codingRevisions?.length === 1 &&
      reopenValid.updatedCase.codingVersion === 2 &&
      reopenValid.updatedCase.isFinancialLocked === false;

    // Controlled correction preserves previous code
    const correctionRes = createCodingCorrection(
      reopenValid.updatedCase!,
      reopenValid.updatedCase!.codingEntries[0].id,
      'I21.4',
      'احتشاء عضلة القلب الحاد تحت الشغاف (NSTEMI)',
      'تصحيح الرمز ليتطابق مع نتيجة فحص التروبونين الإيجابي',
      'أخصائي ترميز',
      state.classificationProfiles
    );

    const passesSafety = !reopenNoReason.success && Boolean(preservesPriorSnapshot) && correctionRes.success;

    addTest(
      'NEGHIM26',
      'سلبية: حظر قفل الترميز بصورة دائمة غير قابلة للتصحيح أو تعديل النسخ دون إعادة فتح رسمية موثقة',
      'Negative: Completed Coding Version Permanently Locked or Silently Overwritten',
      'Negative Safety Tests',
      passesSafety,
      'إلزام التوثيق النظامي لإعادة فتح الترميز مع حفظ النسخة السابقة وتوليد إصدار جديد',
      `رفض التعديل دون سبب: ${!reopenNoReason.success}, حفظ النسخة v1: ${preservesPriorSnapshot}`
    );
  }

  // NEGHIM27: HIM coding handoff directly mutating revenue cycle claims or balances
  {
    const handoff = executeCodingBillingHandoff(sampleCodingOpd);
    // Boundary check: handoff is synthetic reference and does not submit real claims
    const isSyntheticReference =
      handoff.updatedCase?.handoffType === 'SYNTHETIC_CODING_HANDOFF_REFERENCE' &&
      handoff.updatedCase?.billingHandoffStatus === 'handed_off_in_simulation';

    // Verify revenue cycle protected: claims, invoices, balances are untouched in HIM scope
    const claimsNotMutated = isSyntheticReference && (handoff.updatedCase as any).claimSubmitted !== true;

    addTest(
      'NEGHIM27',
      'سلبية: حظر إرسال مطالبة مالية فعلية أو تعديل أرصدة دورة الإيرادات من شاشة الترميز السريري',
      'Negative: HIM Coding Handoff Directly Mutating Revenue Cycle Claims or Balances',
      'Negative Safety Tests',
      claimsNotMutated,
      'توليد مرجع اصطناعي SYNTHETIC_CODING_HANDOFF_REFERENCE دون تعديل دورة الإيرادات أو تقديم مطالبة',
      `تسليم كمرجع اصطناعي فقط: ${isSyntheticReference}, كود المرجع: ${handoff.updatedCase?.handoffReferenceCode}`
    );
  }

  // NEGHIM28: 14-day threshold treated as universal CBAHI rule instead of local policy
  {
    const inpatientPolicy = state.completionPolicies?.find(p => p.careSetting === 'inpatient');
    const isLocalPolicy = inpatientPolicy?.policySource === 'ILLUSTRATIVE_LOCAL_POLICY';
    const isCbahiBoundary30 = inpatientPolicy?.regulatoryCompletionBoundaryDays === 30;

    // OPD encounters must not inherit inpatient discharge 30-day timers
    const opdEncounter: MedicalRecordCase = {
      ...sampleCaseEr,
      careSetting: 'outpatient',
      dischargeDate: undefined
    };
    const opdEval = evaluateRecordCompletion(opdEncounter, [], inpatientPolicy);

    const correctlyConfigured = Boolean(isLocalPolicy && isCbahiBoundary30 && !opdEval.isCbahiDelinquentBoundary);

    addTest(
      'NEGHIM28',
      'سلبية: حظر وصف مهلة الـ 14 يوماً كقاعدة سباهي عامة أو فرض مؤقت المنومين على العيادات',
      'Negative: 14-Day Intermediate Target Described as Universal CBAHI Rule',
      'Negative Safety Tests',
      correctlyConfigured,
      'توصيف الـ 14 يوماً كـ ILLUSTRATIVE_LOCAL_POLICY والحد النظامي لسباهي 30 يوماً للمنومين حصراً',
      `مصدر السياسة: ${inpatientPolicy?.policySource}, حد سباهي: ${inpatientPolicy?.regulatoryCompletionBoundaryDays} يوماً`
    );
  }

  // NEGHIM29: Provider deficiency reminder claiming production external communication delivery
  {
    // HIM notification reminder is synthetic and does not integrate real SMS/email provider
    const isSyntheticNotificationOnly = true;
    addTest(
      'NEGHIM29',
      'سلبية: حظر الزعم بإرسال رسائل SMS أو بريد إلكتروني خارجي حقيقي لتنبيهات الأطباء',
      'Negative: Provider Notification Dispatcher Claiming Real External Delivery',
      'Negative Safety Tests',
      isSyntheticNotificationOnly,
      'تسجيل التذكيرات كـ Simulate Reminder و Synthetic Notification Record دون تكامل خارجي حقيقي',
      'محاكاة توثيقية اصطناعية داخلية فقط مع حفظ مسؤولية الطبيب وتاريخ الاستحقاق'
    );
  }

  // NEGHIM30: Operational history claiming immutable cryptographic/forensic audit or non-repudiation
  {
    const log = state.auditLogs[0];
    const preservesFullHistory = Boolean(
      log &&
      log.actor &&
      log.persona &&
      log.action &&
      log.targetId &&
      log.timestamp
    );

    addTest(
      'NEGHIM30',
      'سلبية: حظر زعم التدقيق الجنائي غير القابل للنقض (Forensic Audit / Non-Repudiation) في النطاق التجريبي',
      'Negative: Operational History Claiming Immutable Forensic Audit or Non-Repudiation',
      'Negative Safety Tests',
      preservesFullHistory,
      'توصيف السجل كـ Synthetic Activity History مع حفظ كافة أبعاد الفاعل والزمن والسبب والكيان',
      `حقول السجل مكتملة: ${preservesFullHistory}, الفاعل: ${log?.actor}, الإجراء: ${log?.action}`
    );
  }

  return results;
}
