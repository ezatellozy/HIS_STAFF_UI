// LABORATORY, MICROBIOLOGY & PATHOLOGY OPERATIONS UX
// High-Fidelity UI/UX Data Contracts & Models

export type LabSection =
  | 'core_lab'
  | 'chemistry'
  | 'hematology'
  | 'coagulation'
  | 'urinalysis'
  | 'microbiology'
  | 'pathology'
  | 'cytology'
  | 'send_out';

export type LabOrderPriority = 'routine' | 'urgent' | 'stat';

export type LabOrderStatus =
  | 'ordered'
  | 'collection_pending'
  | 'collected'
  | 'received'
  | 'in_process'
  | 'completed'
  | 'clarification_required'
  | 'cancelled';

export type SpecimenStatus =
  | 'pending_collection'
  | 'collected'
  | 'in_transit'
  | 'received'
  | 'accepted'
  | 'rejected'
  | 'recollection_requested'
  | 'aliquoted'
  | 'archived';

export type AccessionStatus =
  | 'accessioned'
  | 'in_analysis'
  | 'awaiting_tech_val'
  | 'awaiting_clinical_val'
  | 'released'
  | 'amended'
  | 'exception';

export type TestResultStatus =
  | 'unverified'
  | 'technically_verified'
  | 'preliminary'
  | 'final'
  | 'corrected'
  | 'amended'
  | 'cancelled'
  | 'entered_in_error';

export type ResultFlag = 'normal' | 'abnormal_low' | 'abnormal_high' | 'critical_low' | 'critical_high';

export type SpecimenRejectionReasonCode =
  | 'hemolyzed'
  | 'clotted'
  | 'wrong_container'
  | 'insufficient_volume'
  | 'leaked'
  | 'unlabeled'
  | 'mislabeled'
  | 'delayed_transport'
  | 'inappropriate_temperature'
  | 'contamination_concern'
  | 'other';

export interface SpecimenRejectionPolicy {
  code: SpecimenRejectionReasonCode;
  labelAr: string;
  labelEn: string;
  description: string;
  recollectionRecommended: boolean;
  requiresClinicianNotice: boolean;
}

export type ASTInterpretationStandard = 'eucast' | 'clsi' | 'local_standard';

export type ASTInterpretation = 'S' | 'I' | 'R' | 'SDD' | 'NS' | 'ATU' | 'NO_BREAKPOINT';

export interface ASTResultRow {
  id: string;
  antimicrobial: string;
  method: 'automated_mic' | 'e_test' | 'disk_diffusion';
  measuredValue: string; // e.g. "<= 0.5 mcg/mL" or "18 mm"
  interpretation?: ASTInterpretation; // Optional when uninterpreted or no breakpoint
  interpretationMeaning?: string; // EUCAST: "Susceptible, increased exposure" / CLSI: "Intermediate"
  standardUsed: ASTInterpretationStandard;
  standardVersion: string; // e.g. "EUCAST v16.1 (2026)" or "CLSI M100 Ed36 (2026)"
  breakpointRange: string;
  comments?: string;
  technicalUncertainty?: boolean | string; // true or "ATU - Area of Technical Uncertainty"
  noBreakpoint?: boolean; // true if no clinical breakpoint is established
  selectiveReportingSuppressed?: boolean; // true if restricted by AMS stewardship policy
  intrinsicResistance?: boolean; // true if organism is intrinsically resistant
}

export interface OrganismIdentification {
  id: string;
  organismName: string;
  snomedCode: string;
  colonyCount?: string; // e.g. "> 100,000 CFU/mL"
  clinicalSignificance: 'significant' | 'probable_pathogen' | 'normal_flora' | 'contaminant';
  astRows: ASTResultRow[];
}

export type MicrobiologyCultureStatus =
  | 'inoculated'
  | 'incubating'
  | 'preliminary_growth'
  | 'no_growth_to_date'
  | 'final_no_growth'
  | 'organism_identified'
  | 'ast_pending'
  | 'ast_complete'
  | 'final_report';

export interface GramStainPreliminaryReport {
  reportedAt: string;
  reportedBy: string;
  findings: string; // e.g. "Gram-positive cocci in clusters (moderate count)"
  wbcObserved: string; // e.g. "Many polymorphonuclear leukocytes"
  status: 'preliminary_released' | 'amended';
  comments?: string;
}

export interface MicrobiologyCase {
  id: string;
  accessionNumber: string;
  orderId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  encounterId: string;
  encounterType: 'ipd' | 'opd' | 'er' | 'icu';
  bedLocation?: string;
  specimenId: string;
  specimenType: string; // e.g. "Blood (Aerobic)", "Clean Catch Urine", "Wound Swab"
  anatomicalSite: string;
  collectionDateTime: string;
  receivedDateTime: string;
  cultureType: string; // e.g. "Blood Culture x 2", "Urine Routine Culture"
  incubationStartedAt: string;
  incubationDurationHours: number;
  incubationTargetHours: number;
  isExtendedIncubation: boolean;
  status: MicrobiologyCultureStatus;
  gramStainPreliminary?: GramStainPreliminaryReport;
  organisms: OrganismIdentification[];
  preliminaryNote?: string;
  finalReportNote?: string;
  verifierName?: string;
  verifiedAt?: string;
  criticalFlag?: boolean;
}

// Pathology Models
export type PathologyCaseStatus =
  | 'accessioned'
  | 'grossing'
  | 'processing'
  | 'embedding'
  | 'sectioning'
  | 'staining'
  | 'ready_for_review'
  | 'under_pathologist_review'
  | 'report_drafted'
  | 'signed_out'
  | 'addendum_issued';

export interface PathologyBlockMapping {
  blockId: string; // e.g. "A1", "A2"
  cassetteColor: string;
  tissueDescription: string;
  numberOfPieces: number;
  specialInstructions?: string; // e.g. "Decalcification required", "Levels x 3"
  slidesCount: number;
  status: 'grossed' | 'processed' | 'embedded' | 'sectioned' | 'stained' | 'slide_ready';
}

export interface GrossExaminationData {
  performedBy: string;
  performedAt: string;
  specimenOrientation: string; // e.g. "Suture marks superior aspect"
  dimensions: string; // e.g. "4.5 x 3.2 x 1.8 cm"
  weightGrams?: number;
  inkColorsUsed: { color: string; marginSite: string }[];
  grossDescription: string;
  blocks: PathologyBlockMapping[];
  imagesMockCount: number;
}

export interface AncillaryTestItem {
  id: string;
  testName: string; // e.g. "IHC - ER/PR", "IHC - HER2", "Ki-67 Index", "BRAF Mutation"
  orderedAt: string;
  orderedBy: string;
  status: 'ordered' | 'in_staining' | 'evaluated';
  resultSummary?: string;
}

export interface SynopticStructuredElement {
  key: string;
  label: string;
  value: string;
  isRequired?: boolean;
}

export interface SynopticChecklistData {
  organization?: 'CAP' | 'ICCR' | 'Local';
  isCancerCase?: boolean; // false for non-cancer benign resections
  protocolIdentifier?: string; // e.g. "Thyroid.Carcinoma.Resection"
  protocolVersion?: string; // e.g. "v4.3.0.0 (June 2024)"
  tumorSite?: string; // e.g. "Thyroid Gland"
  procedureApplicability?: string; // e.g. "Hemithyroidectomy / Total Thyroidectomy"
  structuredElements?: SynopticStructuredElement[];
  histologicType?: string;
  histologicGrade?: string;
  tumorSize?: string;
  marginsStatus?: string;
  lymphovascularInvasion?: string;
  pathologicStaging?: string; // e.g. "pT2 pN0 (0/14) cM0"
}

export interface CytologyExaminationData {
  adequacyStatus: 'satisfactory' | 'unsatisfactory' | 'limited';
  adequacyComment: string;
  screeningFindings: string;
  classificationSystem: string; // e.g. "The Bethesda System for Reporting Thyroid Cytopathology (2023)"
  bethesdaCategory: string; // e.g. "Category II: Benign"
  riskOfMalignancy?: string;
}

export interface PathologyReportData {
  signoutPathologist: string;
  signedOutAt?: string;
  reportingProfile: 'cap_synoptic' | 'local_standard_synoptic' | 'narrative_standard' | 'narrative_benign' | 'cytology_adequacy';
  finalDiagnosis: string;
  microscopicDescription: string;
  grossDescriptionRef?: string;
  synopticChecklist?: SynopticChecklistData;
  ancillaryStudies: AncillaryTestItem[];
  pathologistComments?: string;
  addenda?: {
    id: string;
    author: string;
    timestamp: string;
    note: string;
  }[];
}

export interface PathologyCase {
  id: string;
  caseNumber: string; // e.g. "SURG-2026-0891"
  domain: 'surgical_pathology' | 'cytology' | 'cytopathology' | 'frozen_section';
  orderId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  encounterId: string;
  orderingClinician: string;
  clinicalDepartment: string;
  procedureName: string; // e.g. "Right Hemithyroidectomy", "Endoscopic Colon Biopsy"
  specimenDescription: string;
  clinicalHistory: string;
  lateralitySite: string;
  containerCount: number;
  containers: {
    containerNumber: number;
    containerLabel: string;
    fixative: string; // e.g. "10% Neutral Buffered Formalin"
    tissueSource: string;
  }[];
  procedureDateTime: string;
  receivedDateTime: string;
  priority: LabOrderPriority;
  status: PathologyCaseStatus;
  assignedPathologist: string;
  grossExamination?: GrossExaminationData;
  cytologyData?: CytologyExaminationData;
  report?: PathologyReportData;
}

// Core Lab Test & Result Models
export interface TestResultItem {
  id: string;
  testCode: string; // e.g. "K", "GLU", "WBC", "PLT", "INR", "CREAT"
  testNameAr: string;
  testNameEn: string;
  numericValue?: number;
  textValue?: string;
  unit: string; // e.g. "mmol/L", "mg/dL", "10^9/L", "sec"
  referenceRangeText: string; // e.g. "3.5 - 5.1 mmol/L"
  referenceLow?: number;
  referenceHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  flag?: ResultFlag; // Optional: pending/missing test does NOT have a flag
  previousValue?: string;
  previousDelta?: string; // e.g. "+ 1.8 (within 4h)"
  instrumentName: string; // e.g. "Roche Cobas 8000 - Unit A"
  instrumentFlag?: string; // e.g. "Rerun confirmed", "Dilution 1:2", "Hemolysis Index: 18 (Slight)"
  status: TestResultStatus;
  technicallyVerifiedBy?: string;
  technicallyVerifiedAt?: string;
  version: number;
  versionHistory?: ResultVersionAudit[];
  dispositionReason?: string; // e.g. "Hemolysis interference", "QNS for this test"
  dispositionClinicalNote?: string;
}

export interface ResultVersionAudit {
  version: number;
  value: string;
  flag?: ResultFlag;
  status: TestResultStatus;
  amendedBy: string;
  amendedAt: string;
  amendmentReason: string;
  clinicalNote?: string;
}

export type CriticalPolicyProfile =
  | 'policy_inpatient_readback'
  | 'policy_outpatient_direct'
  | 'policy_unconfigured';

export type CriticalAttemptOutcome =
  | 'delivered_successful'
  | 'contact_failed'
  | 'alternate_recipient'
  | 'escalated_in_progress';

export interface CriticalResultCommunication {
  isCritical: boolean;
  requiredPolicy: 'read_back_required' | 'verbal_acknowledgement' | 'electronic_escalation';
  policyProfile?: CriticalPolicyProfile;
  identifiedAt?: string;
  communicationAttemptTimestamp?: string;
  attemptOutcome?: CriticalAttemptOutcome;
  channel?: 'telephone' | 'secure_critical_messaging' | 'in_person_ward';
  intendedRecipient?: string;
  intendedTeam?: string;
  communicatedTo?: string;
  communicatedToRole?: string;
  communicatedAt?: string;
  callerStaffName?: string;
  readBackConfirmed: boolean;
  acknowledgementStatus: 'pending' | 'acknowledged' | 'escalated';
  escalationTarget?: string;
  escalationStatus?: 'none' | 'initiated' | 'completed';
  failureReason?: string;
  failureAttemptDetails?: string;
  clinicalFollowUpPending?: boolean;
  communicationNote?: string;
}

export interface LabAccession {
  id: string;
  accessionNumber: string; // e.g. "ACC-2026-0913-0042"
  orderId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  encounterId: string;
  encounterType: 'opd' | 'er' | 'ipd' | 'icu';
  orderingDoctor: string;
  orderingService: string;
  clinicalDiagnosis: string;
  priority: LabOrderPriority;
  section: LabSection;
  specimenIds: string[];
  testPanelName: string;
  tests: TestResultItem[];
  receivedDateTime: string;
  accessionedDateTime: string;
  tatTargetMinutes: number;
  status: AccessionStatus;
  criticalCommunication?: CriticalResultCommunication;
  instrumentContext: {
    analyzerId: string;
    analyzerName: string;
    qcStatus: 'acceptable' | 'warning' | 'review_required';
    isMaintenance: boolean;
  };
  aliquotsMock?: {
    aliquotId: string;
    label: string;
    targetSection: LabSection;
    splitTimestamp: string;
  }[];
}

export interface LabSpecimen {
  id: string;
  specimenBarcode: string; // e.g. "SPEC-8821940"
  orderId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  encounterId: string;
  specimenType: string; // e.g. "Venous Blood", "Arterial Blood", "Clean Urine", "Tissue Biopsy"
  containerType: string; // e.g. "SST Gel (Gold Top)", "K2-EDTA (Lavender)", "Sodium Citrate (Blue)"
  containerColorHex: string;
  collectionLocation: string; // e.g. "Phlebotomy Station 2", "ER - Bed 04", "Medical Ward 3A"
  collectionPriority: LabOrderPriority;
  scheduledCollectionTime: string;
  collectedDateTime?: string;
  collectorName?: string;
  receivedDateTime?: string;
  receiverName?: string;
  transportCondition: 'ambient' | 'refrigerated' | 'on_ice' | 'warm';
  temperatureAtReceipt?: string;
  status: SpecimenStatus;
  rejectionInfo?: {
    rejectedAt: string;
    rejectedBy: string;
    reasonCode: SpecimenRejectionReasonCode;
    reasonDescription: string;
    actionTaken: 'recollection_requested' | 'clinician_consulted' | 'test_cancelled';
  };
  recollectionLinkedId?: string;
  specialInstructions?: string; // e.g. "Protect from light", "Fasting confirmed", "Keep on ice"
}

export interface IncomingLabOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-LAB-2026-4412"
  patientId: string;
  patientName: string;
  mrn: string;
  encounterId: string;
  encounterDepartment: 'opd' | 'er' | 'ipd' | 'icu';
  bedLocation?: string;
  orderingDoctor: string;
  orderingService: string;
  clinicalIndication: string;
  orderDateTime: string;
  priority: LabOrderPriority;
  targetSection: LabSection;
  testPanelsRequested: string[]; // e.g. ["Comprehensive Metabolic Panel (CMP)", "Complete Blood Count (CBC)"]
  collectionRequirements: string; // e.g. "Venous blood - 1 SST Gold + 1 EDTA Lavender"
  status: LabOrderStatus;
  specimenIds: string[];
  clarificationNote?: string;
}

export interface SendOutShipment {
  id: string;
  shipmentNumber: string;
  referenceLabName: string; // e.g. "National Reference Laboratory (Riyadh)", "Mayo Medical Reference Lab"
  specimenId: string;
  accessionNumber: string;
  patientName: string;
  mrn: string;
  testName: string; // e.g. "Next-Gen Sequencing (NGS) Myeloid Panel", "Free Metanephrines (Fractionated)"
  preparedAt: string;
  dispatchedAt?: string;
  courierTrackingNumber?: string;
  receivedByRefLabAt?: string;
  status: 'prepared' | 'dispatched' | 'received_by_ref_lab' | 'processing' | 'result_returned';
  returnedResultSummary?: string;
  returnedResultDateTime?: string;
}

export interface InstrumentOperationalStatus {
  id: string;
  name: string;
  section: LabSection;
  status: 'operational' | 'processing' | 'maintenance' | 'offline';
  statusMessage: string;
  queueCount: number;
  qcStatus: 'acceptable' | 'warning' | 'review_required';
  lastMaintenanceDate: string;
}

export interface LaboratoryPersona {
  roleId: 'phlebotomist' | 'lab_technician' | 'microbiologist' | 'pathology_tech' | 'pathologist' | 'lab_supervisor';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
}
