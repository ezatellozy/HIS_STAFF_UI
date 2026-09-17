// =============================================================
// AXIS 5: CLINICAL NOTES & DOCUMENTATION WORKSPACE TYPES
// =============================================================

export type NoteLifecycleState =
  | 'draft'
  | 'preliminary'
  | 'final_signed'
  | 'amended'
  | 'corrected'
  | 'addendum_appended'
  | 'entered_in_error';

export type NoteCoSignRequirement =
  | 'none'
  | 'required_pending'
  | 'co_signed';

export type DocumentationCategory =
  | 'progress_note'
  | 'physician_note'
  | 'nursing_note'
  | 'admission_note'
  | 'consultation_note'
  | 'operative_procedure_note'
  | 'anesthesia_note'
  | 'post_procedure_note'
  | 'discharge_summary'
  | 'handover_note'
  | 'specialty_note'
  | 'respiratory_therapy_note'
  | 'nutrition_note'
  | 'physiotherapy_note'
  | 'clinical_form';

/**
 * Generic Clinical Provenance & Authorship
 * Replaces physician-only rank assumptions. Supports any authorized clinical professional
 * (Physician, Nurse, Respiratory Therapist, Dietitian, Physiotherapist, Clinical Pharmacist, etc.)
 */
export interface GenericClinicalAuthor {
  id: string;
  name: string;
  profession?: string; // e.g., 'طبيب' | 'أخصائي تمريض' | 'أخصائي علاج تنفسي' | 'أخصائي تغذية علاجية' | 'أخصائي علاج طبيعي' | 'صيدلي سريري'
  role: string; // e.g., 'طبيب استشاري' | 'طبيب مقيم' | 'ممرض عناية مركزة' | 'أخصائي أول'
  roleLabelAr: string;
  specialty?: string; // e.g., 'طب الطوارئ' | 'أمراض القلب' | 'العناية الحرجة' | 'التغذية الوريدية'
  discipline?: string;
  credentials?: string; // e.g., 'MD, FACC' | 'BSN, RN' | 'RRT' | 'RD, CNSC' | 'PharmD'
  department: string;
}

/**
 * Configurable Documentation Policy
 * Determines which lifecycle states, signoff rules, and amendment rules apply per documentation category
 */
export interface DocumentationPolicy {
  policyId: string;
  category: DocumentationCategory;
  nameAr: string;
  nameEn: string;
  supportedStates: NoteLifecycleState[];
  allowPreliminary: boolean;
  requiresCoSignByDefault: boolean;
  allowAmendment: boolean;
  allowCorrection: boolean;
  correctionTimeWindowHours?: number; // e.g., minor correction allowed within 24h
  reasonRequiredForAmendment: boolean;
  reasonRequiredForCorrection: boolean;
  reasonRequiredForErrorMark: boolean;
}

export interface DocumentationTemplateDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  category: DocumentationCategory;
  structureType: 'soap' | 'narrative' | 'sbar' | 'operative' | 'admission' | 'discharge' | 'specialty';
  defaultTitleAr: string;
  defaultTitleEn: string;
  applicableDepartments?: string[];
  applicableRoles?: string[];
  descriptionAr: string;
  sections: Array<{
    key: string;
    labelAr: string;
    labelEn: string;
    placeholderAr: string;
    isRequired?: boolean;
    defaultValue?: string;
  }>;
}

export interface NoteAddendum {
  id: string;
  timestamp: string;
  authorId: string;
  authorName: string;
  authorProfession?: string;
  authorRole: string;
  authorSpecialty: string;
  content: string;
  signedAt: string;
  reason?: string;
}

export interface NoteVersionSnapshot {
  versionNumber: number;
  savedAt: string;
  savedBy: string | GenericClinicalAuthor;
  title: string;
  content: string;
  state: NoteLifecycleState;
  changeType?: 'created' | 'signed' | 'amended' | 'corrected' | 'appended' | 'entered_in_error';
  changeReason?: string;
  previousContent?: string;
  changedFields?: string[];
}

export interface ClinicalNoteRecord {
  id: string;
  patientId: string;
  encounterId: string;
  encounterType: 'emergency' | 'inpatient_icu' | 'inpatient_ward' | 'outpatient_clinic' | 'operating_theatre';
  category: DocumentationCategory;
  templateId?: string;
  structureType: 'soap' | 'narrative' | 'sbar' | 'operative' | 'admission' | 'discharge' | 'specialty';
  titleAr: string;
  titleEn: string;
  
  // Content
  content: string;
  structuredData?: Record<string, string>;
  
  // Lifecycle
  state: NoteLifecycleState;
  
  // Generic Provenance & Authorship
  author: GenericClinicalAuthor;
  createdAt: string;
  documentedAt: string;
  signedAt?: string;
  signedBy?: string | GenericClinicalAuthor;
  
  // Co-sign
  coSignRequirement: NoteCoSignRequirement;
  coSignedBy?: {
    id: string;
    name: string;
    role: string;
    profession?: string;
    signedAt: string;
  };

  // Amendments & Corrections
  amendedBy?: string | GenericClinicalAuthor;
  amendedAt?: string;
  amendmentReason?: string;

  correctedBy?: string | GenericClinicalAuthor;
  correctedAt?: string;
  correctionReason?: string;

  addenda: NoteAddendum[];
  
  // Error handling
  errorReason?: string;
  enteredInErrorAt?: string;
  enteredInErrorBy?: string | GenericClinicalAuthor;
  
  // Audit & Versions
  version: number;
  originalVersionContent?: string;
  versionHistory: NoteVersionSnapshot[];

  // Documentation Policy
  documentationPolicyId?: string;
  // Configured Documentation Timeliness Context (Section 5: Policy-driven, no hardcoded universal 24h deadline)
  timelinessContext?: ConfiguredDocumentationTimelinessContext;

  // Safety & Provenance
  carriedForwardInfo?: {
    isCarriedForward: boolean;
    originalNoteId?: string;
    originalAuthor?: string;
    originalTimestamp?: string;
    carriedForwardSections?: string[];
  };

  referencedClinicalData?: {
    vitalsIncluded?: boolean;
    problemsIncluded?: boolean;
    allergiesIncluded?: boolean;
    labsIncluded?: boolean;
  };

  tags?: string[];
}

export interface ContextualDataReference {
  type: 'vitals' | 'problems' | 'allergies' | 'labs' | 'diagnoses';
  titleAr: string;
  titleEn: string;
  summaryText: string;
  dataPayload: any;
}

// Configured Documentation Timeliness Context (Section 5)
export type DocumentationTimelinessStatus =
  | 'due'
  | 'approaching_configured_target'
  | 'overdue'
  | 'completed_within_target'
  | 'target_not_applicable';

export interface ConfiguredDocumentationTimelinessContext {
  status: DocumentationTimelinessStatus;
  policyName: string; // e.g. "Hospital Inpatient Documentation Policy (Mock Example)"
  configuredTargetHours?: number; // e.g., 24h, 4h, immediate, or undefined
  targetDescriptionAr: string;
  evaluatedAt?: string;
  notes?: string;
}
