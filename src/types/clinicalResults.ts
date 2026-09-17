// =============================================================
// AXIS 7 — CLINICAL RESULTS DOMAIN TYPES
// FHIR-ready Conceptual Mapping: Observation, DiagnosticReport, ImagingStudy
// Multi-domain architecture: Lab, Imaging, Micro, Pathology, Cardiology
// Separation of Result Lifecycle Status vs Review / Acknowledgement Status
// =============================================================

export type ResultDomainType =
  | 'laboratory'
  | 'imaging'
  | 'microbiology'
  | 'pathology'
  | 'diagnostic_cardiology'
  | 'other_diagnostic';

export interface ResultDomainConfig {
  id: ResultDomainType;
  nameAr: string;
  nameEn: string;
  iconName: string;
  descriptionAr: string;
}

// Result Lifecycle Status (What the laboratory / performing diagnostic department has done)
export type ResultLifecycleStatus =
  | 'pending'
  | 'preliminary'
  | 'partial'
  | 'final'
  | 'amended'
  | 'corrected'
  | 'appended'
  | 'entered_in_error'
  | 'cancelled';

// Clinician Review & Acknowledgement Decoupled States (FHIR-aligned Clinical Governance)
// Clinician Review State (Cognitive review of results by clinician)
export type ClinicianReviewState = 'unreviewed' | 'reviewed';

// Clinician Acknowledgement State (Formal sign-off / receipt of significant or critical findings)
export type ClinicianAcknowledgementState =
  | 'not_required'
  | 'acknowledgement_required'
  | 'acknowledged';

// Clinician Review Status (Unified summary status maintained for backward compatibility)
export type ResultReviewStatus =
  | 'unreviewed'
  | 'seen'
  | 'reviewed'
  | 'acknowledgement_required'
  | 'acknowledged'
  | 'followup_required'
  | 'followup_completed';

export type AbnormalFlag =
  | 'normal'
  | 'low'
  | 'high'
  | 'critical_low'
  | 'critical_high'
  | 'abnormal'
  | 'borderline';

// Result Authority & Allowed Actions Distinction: Result Consumer vs Authorized Result Source
export interface ResultAllowedActions {
  // Consumer Actions (Clinical care team consuming diagnostic information)
  canReview: boolean;
  canAcknowledge: boolean;
  canRequestFollowup: boolean;
  // Authorized Diagnostic Source Actions (Laboratory, Pathologist, Radiologist)
  canAmend: boolean;
  canCorrect: boolean;
  canAppendAddendum: boolean;
  canMarkEnteredInError: boolean;
}

// Critical Result Presentation Policy (Mitigating alert fatigue)
export interface CriticalResultPresentationPolicy {
  showVisualIndicator: boolean;
  visualIndicatorStyle: 'badge' | 'accent_border' | 'prominent';
  showBanner: boolean;
  enableOptionalSound: boolean;
  enableOptionalMotion: boolean;
  slaMinutesToAcknowledge: number;
}

// Versioning and Audit Log for Amended / Corrected Results
export interface ResultAmendment {
  id: string;
  version: number;
  amendedAt: string;
  amendedBy: string;
  reason: string;
  previousReportSummary: string;
  amendedReportSummary: string;
  changedFields: {
    fieldName: string;
    oldValue: string;
    newValue: string;
  }[];
}

// Lab Delta Indicator & Delta Check Information (from Laboratory Information System - not calculated as clinical truth on frontend)
export interface DeltaCheckInformation {
  deltaFlag: 'none' | 'delta_pass' | 'delta_warning' | 'delta_fail' | 'rapid_change';
  previousValue: string;
  delta: string;
  previousTimestamp?: string;
  configuredInterpretation?: string;
}

// Single Lab Observation (FHIR Observation Conceptual Mapping)
export interface LabObservationItem {
  code: string; // LOINC ready code
  name: string;
  nameAr?: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  flag: AbnormalFlag;
  previousValue?: string;
  deltaChange?: string;
  deltaCheck?: DeltaCheckInformation;
  isCritical?: boolean;
  notes?: string;
}

// Full Laboratory Panel / Report (FHIR DiagnosticReport Conceptual Mapping)
export interface LabReportItem {
  id: string;
  orderReferenceId?: string; // Link to Axis 6 Order (e.g. ORD-1091)
  panelNameAr: string;
  panelNameEn: string;
  category: string;
  specimen: string;
  collectedAt: string;
  receivedAt?: string;
  resultedAt: string;
  performingLab: string;
  status: ResultLifecycleStatus;
  reviewStatus: ResultReviewStatus;
  // Decoupled Review State & Provenance
  reviewState?: ClinicianReviewState;
  reviewedBy?: string;
  reviewedAt?: string;
  // Decoupled Acknowledgement State & Provenance
  acknowledgementState?: ClinicianAcknowledgementState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  requiresExplicitAcknowledgement?: boolean; // Explicit acknowledgement not mandatory for every routine result
  criticalAlertId?: string;
  observations: LabObservationItem[];
  amendments?: ResultAmendment[];
}

// Imaging Study & Report (FHIR ImagingStudy & DiagnosticReport Conceptual Mapping)
export interface MockDicomKeyImage {
  id: string;
  title: string;
  description: string;
  sliceNumber?: number;
  view: string;
  annotation?: string;
}

export interface ImagingReportItem {
  id: string;
  orderReferenceId?: string; // Link to Axis 6 Order (e.g. ORD-1092)
  studyTitleAr: string;
  studyTitleEn: string;
  modality: 'XR' | 'CT' | 'MRI' | 'US' | 'Echo' | 'NM' | 'ECG';
  bodyRegion: string;
  performedAt: string;
  reportedAt: string;
  radiologist: string;
  radiologistRole: string;
  status: ResultLifecycleStatus;
  reviewStatus: ResultReviewStatus;
  // Decoupled Review State & Provenance
  reviewState?: ClinicianReviewState;
  reviewedBy?: string;
  reviewedAt?: string;
  // Decoupled Acknowledgement State & Provenance
  acknowledgementState?: ClinicianAcknowledgementState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  clinicalIndication: string;
  technique: string;
  comparisonPriorStudy?: string;
  findings: string;
  impression: string;
  criticalOrSignificantFindings?: string;
  hasCriticalFindings: boolean;
  mockDicomStudy?: {
    accessionNumber: string;
    seriesCount: number;
    instanceCount: number;
    keyImages: MockDicomKeyImage[];
  };
  amendments?: ResultAmendment[];
}

// Interpretation Standards Supported: EUCAST / CLSI / Configured
export type InterpretationStandardType = 'EUCAST' | 'CLSI' | 'configured';

export interface AntimicrobialInterpretationCodeDefinition {
  code: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  badgeColor: string;
}

export interface AntimicrobialSusceptibilityInterpretationProfile {
  profileId: string;
  interpretationStandard: InterpretationStandardType;
  standardVersion: string; // e.g. "EUCAST v13.1 (2023)" or "CLSI M100-Ed33"
  organism: string; // e.g. "Staphylococcus aureus"
  profileDescription: string;
  codeDefinitions: Record<string, AntimicrobialInterpretationCodeDefinition>;
}

// Single Antimicrobial Susceptibility Item (supporting MIC / Zone and dynamic profile meaning)
export interface MicrobiologySusceptibility {
  antibiotic: string;
  mic?: string;
  zoneDiameter?: string; // Zone when available
  interpretationCode: 'S' | 'I' | 'R' | 'SDD' | string;
  humanReadableInterpretation: string; // Dynamic based on standard (e.g. EUCAST: Susceptible, increased exposure)
  interpretationStandard: InterpretationStandardType;
  standardVersion: string;
  testMethod?: string;
  interpretationNotes?: string;
}

export interface MicrobiologyReportItem {
  id: string;
  orderReferenceId?: string;
  titleAr: string;
  titleEn: string;
  specimenType: string;
  collectionSite: string;
  collectedAt: string;
  resultedAt: string;
  status: ResultLifecycleStatus;
  reviewStatus: ResultReviewStatus;
  // Decoupled Review State & Provenance
  reviewState?: ClinicianReviewState;
  reviewedBy?: string;
  reviewedAt?: string;
  // Decoupled Acknowledgement State & Provenance
  acknowledgementState?: ClinicianAcknowledgementState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  performingLab: string;
  gramStain?: string;
  growthStatus: 'growth' | 'no_growth' | 'pending';
  organismIdentified?: string;
  colonyCount?: string;
  clinicalSignificance?: string;
  interpretationProfile: AntimicrobialSusceptibilityInterpretationProfile;
  susceptibilities: MicrobiologySusceptibility[];
  labComments: string;
  isCriticalAlert: boolean;
}

// Configured Pathology Report Profile (General Histopathology, Cytology, Oncology / Synoptic, etc.)
export type PathologyProfileType = 'general_histopathology' | 'cytology' | 'oncology_synoptic' | 'configured';

export interface ConfiguredPathologyReportProfile {
  profileType: PathologyProfileType;
  profileNameAr: string;
  profileNameEn: string;
  hasMargins: boolean;
  hasTumorStaging: boolean;
  hasAncillaryStudies: boolean;
  hasSynopticReporting: boolean;
}

// Pathology Structured Report
export interface PathologyReportItem {
  id: string;
  orderReferenceId?: string;
  titleAr: string;
  titleEn: string;
  specimenDescription: string;
  procedureType: string;
  collectedAt: string;
  receivedAt: string;
  reportedAt: string;
  status: ResultLifecycleStatus;
  reviewStatus: ResultReviewStatus;
  // Decoupled Review State & Provenance
  reviewState?: ClinicianReviewState;
  reviewedBy?: string;
  reviewedAt?: string;
  // Decoupled Acknowledgement State & Provenance
  acknowledgementState?: ClinicianAcknowledgementState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  requiresExplicitAcknowledgement?: boolean;
  reportProfile: ConfiguredPathologyReportProfile;
  pathologist: string;
  clinicalHistory: string;
  grossDescription: string;
  microscopicDescription: string;
  ancillaryStudies?: string; // Only when appropriate for profile
  surgicalMargins?: {
    status: 'negative' | 'positive' | 'close' | 'not_applicable';
    statusLabelAr: string;
    distanceToClosestMargin?: string;
    details?: string;
  }; // Only when appropriate (e.g. oncology/excision)
  tumorStaging?: {
    system: string; // e.g. "pTNM (AJCC 8th Ed)"
    primaryTumor_pT?: string;
    regionalNodes_pN?: string;
    distantMetastasis_pM?: string;
    overallStage?: string;
    histologicGrade?: string;
  }; // Only when appropriate (e.g. oncology/synoptic)
  pathologicDiagnosis: string;
  summaryInterpretation: string;
  amendments?: ResultAmendment[];
}

// Cumulative Longitudinal Comparison Series (for Trend Visualizer)
export interface CumulativeTrendDataPoint {
  timestamp: string;
  timeLabel: string;
  value: number;
  displayValue: string;
  flag: AbnormalFlag;
  orderRef?: string;
  status: ResultLifecycleStatus;
}

export interface CumulativeTrendSeries {
  analyteCode: string;
  analyteName: string;
  analyteNameAr: string;
  unit: string;
  normalRangeLow: number;
  normalRangeHigh: number;
  criticalRangeLow?: number;
  criticalRangeHigh?: number;
  points: CumulativeTrendDataPoint[];
}
