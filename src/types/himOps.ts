// ============================================================================
// HIS — HEALTH INFORMATION MANAGEMENT (HIM) OPERATIONS (TYPES)
// Standards: HL7 FHIR R5 (Composition, DocumentReference, Provenance),
// Saudi CBAHI Medical Records Standards, Saudi PDPL Health Data Regulations,
// WHO ICD-11 & NPHIES Financial Classification Profile (ICD-10-AM)
// Boundary: Synthetic Operations & Clinical Workflow Preview — UI/UX Only
// ============================================================================

export type HimWorkspaceId =
  | 'overview'
  | 'record_completion'
  | 'document_registry'
  | 'coding_queue'
  | 'coding_queries'
  | 'release_of_information'
  | 'disclosure_packages'
  | 'retention_disposition'
  | 'reports_exceptions';

export type HimPersona =
  | 'him_officer'
  | 'medical_records_clerk'
  | 'clinical_coder'
  | 'senior_coding_reviewer'
  | 'roi_specialist'
  | 'him_supervisor'
  | 'privacy_data_reviewer'
  | 'clinical_author_ref';

// ============================================================================
// 8. RECORD STATUS DIMENSIONS (Strictly Separated)
// ============================================================================

// Dimension A: Encounter Record Completion State
export type EncounterRecordCompletionStatus =
  | 'open'
  | 'completion_review_pending'
  | 'deficient'
  | 'provider_action_pending'
  | 'coding_pending'
  | 'coding_complete'
  | 'record_complete'
  | 'reopened_for_valid_reason'
  | 'not_verified';

// Dimension B: Document Clinical Lifecycle State
export type DocumentClinicalLifecycleState =
  | 'draft'
  | 'preliminary'
  | 'final'
  | 'signed'
  | 'amended'
  | 'corrected'
  | 'appended'
  | 'entered_in_error';

// Dimension C: Document Reference State
export type DocumentReferenceState =
  | 'current'
  | 'superseded'
  | 'entered_in_error';

// Dimension D: Coding Work State
export type CodingWorkStatus =
  | 'not_ready'
  | 'ready_for_coding'
  | 'assigned'
  | 'in_progress'
  | 'query_pending'
  | 'review_pending'
  | 'coded'
  | 'quality_review'
  | 'complete'
  | 'returned_for_clarification';

// Dimension E: ROI (Release of Information) State
export type RoiRequestStatus =
  | 'received'
  | 'identity_verification_pending'
  | 'authorization_review'
  | 'scope_review'
  | 'redaction_review'
  | 'ready_for_release'
  | 'released_in_simulation'
  | 'denied'
  | 'cancelled'
  | 'expired'
  | 'legal_hold_review';

// ============================================================================
// DOCUMENTATION DEFICIENCY MODEL
// ============================================================================

export type DeficiencyCategory =
  | 'missing_required_document'
  | 'missing_signature'
  | 'missing_cosignature'
  | 'incomplete_required_section'
  | 'missing_discharge_summary'
  | 'missing_operative_note'
  | 'missing_required_authentication'
  | 'missing_datetime'
  | 'document_still_preliminary'
  | 'unresolved_documentation_query'
  | 'other_configurable_deficiency';

export type DeficiencySeverity = 'blocking_completion' | 'urgent_clinical' | 'routine';
export type DeficiencyStatus = 'open' | 'assigned_to_provider' | 'provider_action_taken' | 'resolved' | 'waived_by_policy';

export interface DocumentationDeficiency {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  careSetting: 'outpatient' | 'emergency' | 'inpatient' | 'operating_room' | 'icu';
  departmentId: string;
  departmentName: string;
  documentId?: string;
  documentTitle: string;
  category: DeficiencyCategory;
  descriptionAr: string;
  descriptionEn: string;
  responsibleAuthorId: string;
  responsibleAuthorName: string;
  responsibleAuthorRole: string;
  detectedDate: string;
  targetCompletionDate?: string;
  daysOutstanding: number;
  severity: DeficiencySeverity;
  status: DeficiencyStatus;
  blockingEffect: boolean;
  escalationLevel: 'none' | 'reminder_1' | 'reminder_2' | 'department_head_escalated';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// ============================================================================
// DOCUMENT VERSION INTEGRITY & REGISTRY
// ============================================================================

export interface HospitalConfigurableCompletionPolicy {
  policyId: string;
  careSetting: 'inpatient' | 'outpatient' | 'emergency' | 'operating_room' | 'icu';
  internalTargetDays: number;
  reminderThresholdDays: number;
  escalationThresholdDays: number;
  regulatoryCompletionBoundaryDays: number; // 30 days for applicable discharged inpatient
  policySource: 'ILLUSTRATIVE_LOCAL_POLICY' | 'CBAHI_VERIFIED_BOUNDARY' | 'HOSPITAL_CONFIGURABLE_COMPLETION_POLICY';
  effectiveDate: string;
  notesAr: string;
  notesEn: string;
}

export interface DocumentVersionReference {
  versionNumber: number;
  savedAt: string;
  savedBy: string;
  savedByRole: string;
  title: string;
  contentSnippet: string;
  lifecycleState: DocumentClinicalLifecycleState;
  changeType: 'original_created' | 'signed' | 'amendment' | 'correction' | 'addendum' | 'entered_in_error' | 'superseded';
  changeReason?: string;
  relationshipToPrior: string;
  coSignerName?: string;
}

export interface RecordDocumentReference {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  documentType: string;
  titleAr: string;
  titleEn: string;
  authorName: string;
  authorRole: string;
  authorDepartment: string;
  clinicalDate: string;
  createdDate: string;
  finalizedDate?: string;
  lifecycleState: DocumentClinicalLifecycleState;
  referenceState: DocumentReferenceState;
  currentVersionNumber: number;
  versions: DocumentVersionReference[];
  isOriginalPreserved: boolean;
  isQuarantined: boolean;
  integrityExceptionRef?: string;
  confidentialityLevel: 'normal' | 'sensitive' | 'highly_restricted';
  contentSnippet?: string;
}

// ============================================================================
// CLASSIFICATION & TERMINOLOGY SEPARATION
// ============================================================================

export interface ClassificationProfileReference {
  profileId: string;
  nameAr: string;
  nameEn: string;
  codeSystem: string; // e.g., 'ICD-10-AM', 'ICD-11-MMS', 'ICD-10-WHO', 'ACHI'
  versionRelease: string;
  jurisdiction: 'SAUDI_NPHIES' | 'WHO_GLOBAL' | 'MOH_SAUDI' | 'CUSTOM_INSTITUTIONAL';
  purpose: 'financial_claim_profile' | 'clinical_statistics' | 'mortality_reporting' | 'epidemiology';
  effectivePeriod: string;
  status: 'active' | 'superseded' | 'pilot';
  isPayerMandated: boolean;
}

export interface CodingEntry {
  id: string;
  type: 'principal_diagnosis' | 'secondary_diagnosis' | 'procedure_service' | 'external_cause';
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  classificationProfileId: string;
  sourceDiagnosisText: string;
  documentedInNoteId: string;
  clinicalTerminologyRef?: string; // e.g., SNOMED CT reference
  poaIndicator?: 'Y' | 'N' | 'U' | 'W'; // Present on Admission
  assignedByCoder: string;
  assignedAt: string;
  isReviewed: boolean;
}

export type CodingQueryTopic =
  | 'conflicting_diagnoses'
  | 'missing_specificity'
  | 'unclear_principal_diagnosis'
  | 'unclear_condition_relationship'
  | 'procedure_clarification'
  | 'missing_laterality_site'
  | 'other_documentation_ambiguity';

export type CodingQueryStatus =
  | 'draft'
  | 'sent_in_simulation'
  | 'provider_review'
  | 'answered'
  | 'clarification_insufficient'
  | 'closed'
  | 'cancelled';

export interface CodingQuery {
  id: string;
  queryNumber: string;
  caseId: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  topic: CodingQueryTopic;
  coderId: string;
  coderName: string;
  targetProviderId: string;
  targetProviderName: string;
  targetProviderDepartment: string;
  referencedDocumentId: string;
  referencedDocumentTitle: string;
  documentedClinicalSnippet: string;
  queryInquiryText: string; // Non-leading clinical question!
  neutralOptionsProvided: string[]; // Strictly neutral, non-leading
  providerResponseText?: string;
  providerRespondedAt?: string;
  status: CodingQueryStatus;
  createdAt: string;
  updatedAt: string;
  isNonLeadingVerified: boolean;
}

export interface CodingReviewRecord {
  id: string;
  caseId: string;
  reviewerName: string;
  reviewDate: string;
  originalCoderName: string;
  findingsAr: string;
  findingsEn: string;
  modificationsCount: number;
  changesMade: {
    previousCode: string;
    newCode: string;
    reason: string;
  }[];
  finalApprovalStatus: 'approved' | 'returned_for_correction' | 'pending';
}

export type CodingBillingHandoffStatus =
  | 'coding_not_ready'
  | 'coding_in_progress'
  | 'coding_complete'
  | 'coding_review_required'
  | 'financial_profile_ready'
  | 'claim_reference_pending'
  | 'handed_off_in_simulation';

export interface CodingRevisionRecord {
  revisionNumber: number;
  reopenedAt: string;
  reopenedBy: string;
  reason: string;
  priorCodingEntriesSnapshot: CodingEntry[];
  priorHandoffReferenceCode?: string;
  priorCodingVersion: number;
}

export interface CodingCase {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  careSetting: 'outpatient' | 'emergency' | 'inpatient' | 'day_surgery' | 'icu';
  admissionDate: string;
  dischargeDate?: string;
  documentationReadiness: 'not_ready' | 'documentation_complete' | 'deficiencies_pending';
  codingReadiness: 'blocked_by_documentation' | 'ready_for_coding' | 'coded';
  status: CodingWorkStatus;
  assignedCoder?: string;
  priority: 'urgent_high_value' | 'routine' | 'claim_cutoff_priority';
  activeProfileId: string; // References ClassificationProfileReference
  principalDiagnosisCandidate?: {
    rawDiagnosis: string;
    proposedCode?: string;
    selectionRationale: string;
  };
  codingEntries: CodingEntry[];
  openQueriesCount: number;
  codingQualityStatus: 'not_audited' | 'audit_passed' | 'audit_discrepancy_resolved';
  billingHandoffStatus: CodingBillingHandoffStatus;
  billingHandoffTimestamp?: string;
  handoffReferenceCode?: string;
  isFinancialLocked?: boolean;
  codingVersion?: number;
  codingRevisions?: CodingRevisionRecord[];
  isReopenedForRevision?: boolean;
  reopenReason?: string;
  handoffType?: 'SYNTHETIC_CODING_HANDOFF_REFERENCE';
}

// ============================================================================
// RELEASE OF INFORMATION (ROI) & PDPL PRIVACY SAFEGUARDS
// ============================================================================

export type RoiRequesterType =
  | 'patient'
  | 'authorized_representative'
  | 'healthcare_provider'
  | 'insurer'
  | 'government_authority'
  | 'court_judicial'
  | 'other_permitted_party';

export type RoiPurpose =
  | 'treatment_continuation'
  | 'insurance_claim_dispute'
  | 'legal_proceeding'
  | 'personal_record'
  | 'regulatory_audit'
  | 'statutory_requirement';

export type RoiLegalBasis =
  | 'patient_consent'
  | 'statutory_obligation'
  | 'judicial_subpoena'
  | 'public_health_emergency'
  | 'vital_interest';

export interface DisclosureItem {
  documentId: string;
  documentTitle: string;
  documentDate: string;
  encounterId: string;
  authorName: string;
  confidentialityLevel: 'normal' | 'sensitive' | 'highly_restricted';
  inclusionStatus: 'included' | 'excluded' | 'redacted_in_simulation' | 'held_for_review';
  redactionNotes?: string;
}

export interface DisclosurePackage {
  id: string;
  requestId: string;
  patientId: string;
  items: DisclosureItem[];
  preparedAt: string;
  preparedBy: string;
}

export interface ReleaseOfInformationRequest {
  id: string;
  requestNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  requesterType: RoiRequesterType;
  requesterName: string;
  requesterIdNumber: string;
  requesterContact: string;
  isRequesterIdentityVerified: boolean;
  purpose: RoiPurpose;
  legalBasis: RoiLegalBasis;
  isLegalBasisVerified: boolean;
  requestedDate: string;
  requestedScope: 'minimum_necessary_encounter' | 'date_range' | 'specific_categories' | 'entire_chart_exception';
  scopeDateRangeStart?: string;
  scopeDateRangeEnd?: string;
  requestedCategories: string[];
  status: RoiRequestStatus;
  sensitiveDataFlags: {
    containsPsychiatricNotes: boolean;
    containsSubstanceUseHistory: boolean;
    containsInfectiousDiseaseDisclosures: boolean;
    requiresSpecialLegalAuthorization: boolean;
  };
  activeLegalHoldPresent: boolean;
  legalHoldReferenceId?: string;
  assignedRoiSpecialist: string;
  disclosureItems: DisclosureItem[];
  denialOrRestrictionReason?: string;
  releasedAt?: string;
  releasedBy?: string;
  releaseMethod?: 'secure_portal_simulation' | 'counter_pickup' | 'encrypted_pdf_preview';
  disclosureLogRef?: string;
}

export interface DisclosureLogEntry {
  id: string;
  timestamp: string;
  requestId: string;
  requestNumber: string;
  patientId: string;
  patientMrn: string;
  recipientName: string;
  recipientType: RoiRequesterType;
  purpose: RoiPurpose;
  legalBasis: RoiLegalBasis;
  itemsDisclosedCount: number;
  authorizedBy: string;
  channel: string;
  pdplProcessingStage: 'request_intake' | 'verification' | 'minimum_necessary_review' | 'simulated_disclosure';
}

// ============================================================================
// RETENTION, LEGAL HOLD & DISPOSITION
// ============================================================================

export type LegalHoldStatus = 'none' | 'under_review' | 'active' | 'released' | 'not_verified';
export type DispositionStatus = 'not_eligible' | 'eligible_for_review' | 'hold_active' | 'approval_pending' | 'disposition_approved_in_simulation' | 'cancelled';

export type RetentionVerificationState =
  | 'verified_source'
  | 'hospital_policy'
  | 'illustrative_configuration'
  | 'not_verified';

export interface RetentionPolicyReference {
  policyId: string;
  category: 'adult_inpatient' | 'pediatric_record' | 'emergency_record' | 'operative_records' | 'diagnostic_images' | 'consent_forms' | 'vital_records';
  recordCategory: string;
  policyTitleAr: string;
  policyTitleEn: string;
  retentionTrigger: 'discharge_date' | 'age_of_majority' | 'last_encounter' | 'death_date';
  retentionDurationYears?: number;
  durationRule?: number; // Configurable duration in years; undefined if rule not verified
  jurisdiction: string;
  sourceAuthority: string;
  sourceReference: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'active' | 'under_review' | 'deprecated';
  verificationState: RetentionVerificationState;
  ruleStatus: 'VERIFIED' | 'RETENTION_RULE_NOT_VERIFIED';
  notes: string;
}

export interface LegalHoldRecord {
  id: string;
  holdReferenceNumber: string;
  titleAr: string;
  titleEn: string;
  reason: string;
  authorizedSource: string; // e.g. "Saudi Ministry of Justice Court Order", "Hospital Legal Affairs"
  startDate: string;
  reviewDate: string;
  status: LegalHoldStatus;
  affectedPatientIds: string[];
  affectedEncounterIds: string[];
  scopeDescription: string;
  authorizedBy: string;
  caseNumber?: string;
  issuingAuthority?: string;
  patientId?: string;
  patientName?: string;
  mrn?: string;
  encounterId?: string;
  issuedAt?: string;
  placedByName?: string;
  releasedAt?: string;
  releasedByName?: string;
  destructionLocked?: boolean;
  expungementLocked?: boolean;
  disclosureLocked?: boolean;
}

export interface MedicalRecordCase {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  careSetting: 'outpatient' | 'emergency' | 'inpatient' | 'operating_room' | 'icu';
  admissionDate: string;
  dischargeDate?: string;
  attendingPhysicianName: string;
  departmentName: string;
  completionStatus: EncounterRecordCompletionStatus;
  completionReviewDate?: string;
  completionReviewedBy?: string;
  documentIds: string[];
  deficiencyIds: string[];
  codingCaseId?: string;
  retentionPolicyId?: string;
  retentionCalculatedExpiryDate?: string;
  retentionStatus: 'active_retention' | 'eligible_for_review' | 'hold_active';
  activeLegalHoldId?: string;
  dispositionStatus: DispositionStatus;
}

// ============================================================================
// RECORD INTEGRITY EXCEPTIONS & SCANNED DOCUMENTS
// ============================================================================

export type IntegrityExceptionType =
  | 'possible_wrong_patient'
  | 'duplicate_document'
  | 'misfiled_external'
  | 'conflicting_identifiers'
  | 'missing_document_source'
  | 'unreadable_attachment'
  | 'wrong_encounter_linkage'
  | 'document_entered_in_error'
  | 'potential_duplicate_patient';

export type IntegrityExceptionStatus =
  | 'quarantine_from_routine_use'
  | 'record_integrity_review'
  | 'resolved_reference'
  | 'dismissed';

export interface RecordIntegrityException {
  id: string;
  type: IntegrityExceptionType;
  patientId: string;
  mrn: string;
  patientName: string;
  documentId?: string;
  documentTitle: string;
  encounterId?: string;
  detectedAt: string;
  detectedBy: string;
  severity: 'critical_patient_safety' | 'high_record_integrity' | 'medium';
  status: IntegrityExceptionStatus;
  descriptionAr: string;
  descriptionEn: string;
  investigationNotes?: string;
  resolutionAction?: 'quarantine_confirmed' | 'reindexed_to_correct_encounter' | 'entered_in_error_marked' | 'identity_desk_referred';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ScannedExternalDocument {
  id: string;
  batchNumber: string;
  patientId: string;
  mrn: string;
  patientName: string;
  encounterId?: string;
  documentType: string;
  sourceOrganization: string;
  serviceDate: string;
  receivedDate: string;
  pageCount: number;
  confidentialityCategory: 'normal' | 'sensitive';
  indexingStatus: 'pending_indexing' | 'indexed_verified' | 'indexing_error';
  qualityReadability: 'good_readable' | 'acceptable' | 'unreadable_quality_review';
  duplicateCheckStatus: 'passed_unique' | 'suspected_duplicate';
  scannedFileName: string;
  indexedBy?: string;
  indexedAt?: string;
}

// ============================================================================
// HIM STATE
// ============================================================================

export interface HimAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  persona: HimPersona;
  action: string;
  targetId: string;
  targetType: 'record' | 'document' | 'deficiency' | 'coding' | 'query' | 'roi' | 'legal_hold' | 'retention';
  reason?: string;
  previousState?: string;
  newState?: string;
  descriptionAr: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  actionType?: string;
  patientId?: string;
  mrn?: string;
  details?: string;
  classificationProfileId?: string;
}

export type HimActivityHistoryEntry = HimAuditLogEntry;

export interface HimOpsState {
  recordCases: MedicalRecordCase[];
  documents: RecordDocumentReference[];
  deficiencies: DocumentationDeficiency[];
  codingCases: CodingCase[];
  classificationProfiles: ClassificationProfileReference[];
  codingQueries: CodingQuery[];
  codingReviews: CodingReviewRecord[];
  roiRequests: ReleaseOfInformationRequest[];
  disclosureLogs: DisclosureLogEntry[];
  retentionPolicies: RetentionPolicyReference[];
  completionPolicies?: HospitalConfigurableCompletionPolicy[];
  legalHolds: LegalHoldRecord[];
  integrityExceptions: RecordIntegrityException[];
  scannedDocuments: ScannedExternalDocument[];
  auditLogs: HimAuditLogEntry[];
  activePersona: HimPersona;
  selectedPatientId?: string;
  selectedEncounterId?: string;
}
