// ============================================================================
// RADIOLOGY & IMAGING OPERATIONS (RIS / PACS MOCK) UX TYPES
// High-Fidelity UI/UX Prototype Domain Model
// Design informed by / aligned conceptually with relevant quality, safety
// and interoperability principles (e.g. CBAHI, JCI, HL7/FHIR, DICOM reference concepts).
// UI/UX Prototype Only - No real RIS/PACS backend, no real DICOM server,
// no certification or regulatory claims.
// ============================================================================

export type ImagingModality =
  | 'XR'       // General Radiography / X-ray
  | 'CT'       // Computed Tomography
  | 'MRI'      // Magnetic Resonance Imaging
  | 'US'       // Ultrasound
  | 'FL'       // Fluoroscopy
  | 'MAMMO'    // Mammography
  | 'IR'       // Interventional Radiology
  | 'NM';      // Nuclear Medicine

export type ImagingPriority = 'stat' | 'urgent' | 'routine';

export type TransportMobility = 'ambulatory' | 'wheelchair' | 'stretcher' | 'bed_portable';

export type IsolationType = 'none' | 'contact' | 'droplet' | 'airborne' | 'protective';

export type ContrastRequirement = 'none' | 'oral' | 'iv_iodinated' | 'iv_gadolinium' | 'rectal' | 'double_contrast';

export type SchedulingWorkflowType = 'scheduled' | 'walk_in' | 'immediate_emergency' | 'portable_bedside' | 'intraoperative';

export type ImagingRequestStatus =
  | 'requested'             // Newly placed in Axis 6
  | 'protocoling_pending'   // Awaiting protocol review
  | 'protocoled'            // Protocol established
  | 'scheduled'             // Slot/appointment booked
  | 'arrived'               // Patient in radiology department / waiting area
  | 'in_preparation'        // IV access, gowning, screening in progress
  | 'ready_for_scan'        // All safety & prep checks cleared
  | 'in_acquisition'        // Active on scanner table
  | 'acquired'              // Raw scan done, awaiting tech QC
  | 'technically_complete'  // Verified by technologist, sent to reading queue
  | 'in_interpretation'     // Radiologist opened study
  | 'preliminary_reported'  // Preliminary reading released (if configured by policy)
  | 'final_reported'        // Final signed diagnostic report released
  | 'cancelled'             // Request or study cancelled
  | 'incomplete_aborted';   // Patient refused or motion artifact unrecoverable

// ----------------------------------------------------------------------------
// 1. IMAGING EXAM CATALOG ITEM (Configured Imaging Service / Modality Catalog)
// ----------------------------------------------------------------------------
export interface ImagingCatalogItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  modality: ImagingModality;
  bodyRegion: string;
  laterality?: 'left' | 'right' | 'bilateral' | 'unilateral_not_specified';
  defaultDurationMinutes: number;
  contrastPossibility: ContrastRequirement;
  preparationRequirementsAr: string[];
  safetyQuestionnaireRequired: ('mri_safety' | 'contrast_safety' | 'pregnancy_safety' | 'sedation_assessment')[];
  defaultProtocolFamily: string;
  requiresRadiologistProtocoling: boolean;
}

// ----------------------------------------------------------------------------
// 2. INCOMING IMAGING REQUEST (Placer Order from Axis 6)
// ----------------------------------------------------------------------------
export interface IncomingImagingRequest {
  id: string;                      // Req-ID e.g. "RAD-REQ-2026-001"
  orderSourceId: string;           // Placer Order ID in Axis 6 e.g. "ord-rad-101"
  patientId: string;
  patientName: string;
  patientNameEn: string;
  mrn: string;
  age: number;
  gender: 'male' | 'female';
  encounterId: string;
  encounterType: 'er' | 'ipd' | 'icu' | 'opd' | 'or';
  originLocation: string;          // e.g. "ER - Acute Trauma Bay 2"
  requestingClinician: {
    name: string;
    role: string;
    department: string;
    phoneExt?: string;
  };
  examCatalogId: string;
  examNameAr: string;
  examNameEn: string;
  modality: ImagingModality;
  bodyRegion: string;
  clinicalIndication: string;
  priority: ImagingPriority;
  requestedDateTime: string;
  mobilityContext: TransportMobility;
  isolationContext: IsolationType;
  contrastRequired: ContrastRequirement;
  workflowType: SchedulingWorkflowType;
  status: ImagingRequestStatus;
  protocolStatus: 'auto_selected' | 'tech_assigned' | 'radiologist_approved' | 'pending_review' | 'not_required';
  assignedProtocolId?: string;
  assignedProtocolName?: string;
  schedulingStatus: 'unscheduled' | 'proposed' | 'scheduled' | 'confirmed' | 'walk_in_direct' | 'cancelled';
  appointmentId?: string;
  hasPreviousStudies: boolean;
  notes?: string;
}

// ----------------------------------------------------------------------------
// 3. SCHEDULING & APPOINTMENT
// ----------------------------------------------------------------------------
export interface ImagingAppointment {
  id: string;
  requestId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  examName: string;
  modality: ImagingModality;
  roomId: string;
  roomName: string;
  scheduledDate: string;           // YYYY-MM-DD
  startTime: string;               // HH:mm
  endTime: string;                 // HH:mm
  durationMinutes: number;
  workflowType: SchedulingWorkflowType;
  status: 'proposed' | 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'no_show';
  preparationInstructionsSent: boolean;
  transportBooked?: boolean;
}

// ----------------------------------------------------------------------------
// 4. PROTOCOLING
// ----------------------------------------------------------------------------
export interface ImagingProtocol {
  id: string;
  requestId: string;
  modality: ImagingModality;
  protocolNameAr: string;
  protocolNameEn: string;
  bodyRegion: string;
  contrastProtocol: {
    type: ContrastRequirement;
    agentName?: string;
    volumeMl?: number;
    flowRateMlSec?: number;
    delaySeconds?: number;
  };
  sequencesOrPhases: string[];     // e.g. ["Pre-contrast", "Arterial phase (25s)", "Portal venous phase (70s)", "Delayed (5m)"]
  specialInstructionsAr?: string;
  sedationRequired: boolean;
  comparisonStudiesSelected?: string[];
  protocolPolicy: 'auto_catalog' | 'technologist_selected' | 'radiologist_approved';
  approvedBy?: string;
  approvedAt?: string;
}

// ----------------------------------------------------------------------------
// 5. SAFETY SCREENING CONTEXT (MRI, CONTRAST, PREGNANCY, SEDATION)
// ----------------------------------------------------------------------------
export interface MriSafetyScreening {
  hasCardiacPacemaker: boolean;
  hasCochlearImplant: boolean;
  hasCerebralAneurysmClip: boolean;
  hasMetallicForeignBodyEye: boolean;
  hasOrthopedicImplants: boolean;
  hasNeurostimulator: boolean;
  isClaustrophobic: boolean;
  weightKg: number;
  mriConditionalReviewed: boolean;
  screenerName: string;
  screenedAt: string;
  safetyStatus: 'cleared' | 'caution_conditional' | 'contraindicated' | 'pending_screening';
  notes?: string;
}

export interface ContrastSafetyContext {
  priorReactionHistory: 'none' | 'mild_urticaria' | 'moderate_bronchospasm' | 'severe_anaphylaxis' | 'unknown';
  allergiesSummary: string;
  renalStatusPolicyOutcome: 'cleared_adequate_function' | 'borderline_hydration_recommended' | 'review_required' | 'not_applicable';
  recentCreatinine?: string;
  recentEgfr?: string;
  labDate?: string;
  hydrationPremedicationDone: boolean;
  consentFormStatus: 'not_required' | 'pending' | 'signed_completed' | 'declined';
  clearedByClinician?: string;
  clearedAt?: string;
  safetyStatus: 'cleared' | 'premedication_required' | 'consult_radiologist' | 'pending_review';
}

export interface PregnancySafetyContext {
  policyOutcome: 'not_applicable' | 'cleared_by_policy' | 'status_unknown_review_required' | 'risk_benefit_counseling_required';
  lastMenstrualPeriodDate?: string;
  clinicalNote?: string;
  counselorName?: string;
}

// ----------------------------------------------------------------------------
// 6. ARRIVAL & PREPARATION QUEUE ITEM
// ----------------------------------------------------------------------------
export interface ArrivalPreparationItem {
  id: string;
  requestId: string;
  patientId: string;
  patientName: string;
  patientNameEn: string;
  mrn: string;
  examName: string;
  modality: ImagingModality;
  arrivedAt: string;
  waitingDurationMinutes: number;
  identityVerificationStatus: 'verified_dual_id' | 'wristband_scanned' | 'verbal_confirmed' | 'pending_verification';
  safetyScreeningStatus: 'cleared' | 'attention_required' | 'in_progress' | 'pending';
  contrastReadiness: 'ready_iv_placed' | 'oral_ingestion_in_progress' | 'not_applicable' | 'iv_pending';
  ivAccessGauge?: string;
  mobilityContext: TransportMobility;
  isolationContext: IsolationType;
  consentStatus: 'signed' | 'pending' | 'not_required';
  destinationRoomId: string;
  destinationRoomName: string;
  isReadyForScan: boolean;
}

// ----------------------------------------------------------------------------
// 7. MODALITY EQUIPMENT / ROOM STATE
// ----------------------------------------------------------------------------
export interface ModalityDeviceRoom {
  id: string;
  modality: ImagingModality;
  code: string;
  nameAr: string;
  nameEn: string;
  location: string;
  status: 'available' | 'in_use' | 'cleaning_turnover' | 'calibration_maintenance' | 'offline' | 'restricted';
  currentPatientName?: string;
  currentExamName?: string;
  currentAcquisitionStartedAt?: string;
  estimatedRemainingMinutes?: number;
  maintenanceNote?: string;
}

// ----------------------------------------------------------------------------
// 8. STUDY, SERIES & INSTANCE (DICOM Hierarchy Mock)
// ----------------------------------------------------------------------------
export interface MockDicomInstance {
  id: string;
  instanceNumber: number;
  imageUrl: string;
  windowLevel?: string;
  sliceLocationMm?: number;
  acquisitionTime?: string;
  sopInstanceUid: string;
}

export interface MockDicomSeries {
  id: string;
  seriesNumber: number;
  seriesDescriptionAr: string;
  seriesDescriptionEn: string;
  modality: ImagingModality;
  instancesCount: number;
  instances: MockDicomInstance[];
  sliceThicknessMm?: number;
  seriesInstanceUid: string;
}

export interface ImagingStudy {
  id: string;                      // Study ID e.g. "STUDY-2026-904"
  accessionNumber: string;         // e.g. "ACC-RAD-88219"
  requestId: string;
  patientId: string;
  patientName: string;
  patientNameEn: string;
  mrn: string;
  studyDate: string;
  studyTime: string;
  modality: ImagingModality;
  bodyRegion: string;
  studyDescriptionAr: string;
  studyDescriptionEn: string;
  performingTechnologist: string;
  roomId: string;
  roomName: string;
  seriesCount: number;
  totalInstancesCount: number;
  series: MockDicomSeries[];
  radiationDoseMetadata?: {
    reported: boolean;
    ctdiVolMgy?: number;
    dlpMgyCm?: number;
    dapGyCm2?: number;
    referenceProtocolName?: string;
  };
  technicalQc: {
    status: 'satisfactory' | 'suboptimal_accepted' | 'repeat_required' | 'additional_view_required';
    reviewedBy: string;
    reviewedAt: string;
    motionArtifact: boolean;
    technicalComments?: string;
    repeatSequenceReason?: string;
  };
  studyInstanceUid: string;
}

// ----------------------------------------------------------------------------
// 9. RADIOLOGIST WORKLIST ITEM (Departmental Reading Worklist - Configured Target)
// ----------------------------------------------------------------------------
export interface RadiologistWorklistItem {
  id: string;
  studyId: string;
  accessionNumber: string;
  requestId: string;
  patientId: string;
  patientName: string;
  patientNameEn: string;
  mrn: string;
  age: number;
  gender: 'male' | 'female';
  modality: ImagingModality;
  bodyRegion: string;
  studyDescription: string;
  studyCompletedAt: string;
  priority: ImagingPriority;
  requestingService: string;
  clinicalIndication: string;
  comparisonStudiesCount: number;
  comparisonStudies: {
    studyDate: string;
    modality: ImagingModality;
    description: string;
    reportSummary: string;
  }[];
  reportingState: 'unassigned' | 'assigned_in_reading' | 'preliminary_signed' | 'final_signed' | 'addendum_required';
  assignedRadiologist?: string;
  targetTurnaroundTimeMinutes: number; // Configured reporting target (policy-defined, not a real-time SLA engine)
  elapsedMinutes: number;
  isDelayed: boolean;
  linkedMyWorkItemId?: string;
}

// ----------------------------------------------------------------------------
// 10. RADIOLOGY REPORT & VERSIONING / AMENDMENT
// ----------------------------------------------------------------------------
export interface ReportAddendum {
  id: string;
  versionNumber: number;
  amendedAt: string;
  authorName: string;
  authorRole: string;
  reasonForAmendment: string;
  addendumText: string;
}

export interface RadiologyReport {
  id: string;                      // Report-ID e.g. "RAD-REP-2026-550"
  studyId: string;
  accessionNumber: string;
  requestId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  modality: ImagingModality;
  examTitleAr: string;
  examTitleEn: string;
  clinicalIndication: string;
  comparisonStudyContext: string;
  techniqueNarrative: string;
  findingsNarrative: string;
  impressionNarrative: string;
  recommendations?: string;
  hasSignificantRecommendation: boolean;
  criticalFindingAlert: boolean;
  reportStatus: 'draft' | 'preliminary' | 'final' | 'amended' | 'corrected';
  signedBy: string;
  signedRole: string;
  signedAt: string;
  preliminarySignedBy?: string;
  preliminarySignedAt?: string;
  versionNumber: number;
  addenda: ReportAddendum[];
  orderingClinicianReviewed: boolean; // Note: Final Report ≠ Ordering Clinician Reviewed ≠ Clinician Acknowledged
  orderingClinicianReviewedAt?: string;
}

// ----------------------------------------------------------------------------
// 11. CRITICAL & SIGNIFICANT FINDINGS NOTIFICATION CONTEXT
// Configured Communication Policy (Channels, Recipient types, Read-back)
// Notice: Notification Sent/Read ≠ Report Reviewed ≠ Finding Acknowledged ≠ Communication Completed
// ----------------------------------------------------------------------------
export interface CriticalFindingCommunication {
  id: string;
  reportId: string;
  accessionNumber: string;
  patientName: string;
  mrn: string;
  findingSeverity: 'critical_panic' | 'urgent_action_required' | 'unexpected_significant';
  findingDescription: string;
  recipientType: 'responsible_clinician' | 'receiving_clinician' | 'receiving_team' | 'configured_recipient';
  communicatedToClinicianName: string;
  communicatedToClinicianRole: string;
  clinicianDepartment: string;
  communicationChannel: 'direct_phone' | 'secure_his_chat' | 'in_person_direct' | 'escalation_paging' | 'direct_clinician' | 'team_communication';
  readBackVerified: boolean;
  readBackStatement?: string;
  communicatedAt: string;
  communicatedByRadiologist: string;
  acknowledgementStatus: 'acknowledged' | 'escalation_in_progress' | 'documented_closed';
}

// ----------------------------------------------------------------------------
// 12. PORTABLE & INTERVENTIONAL RADIOLOGY (IR) SPECIAL CONTEXTS
// Mock Operational Device Context & Configured Procedure Requirement Profiles
// ----------------------------------------------------------------------------
export interface PortableImagingContext {
  id: string;
  requestId: string;
  patientName: string;
  mrn: string;
  locationWardBed: string;         // e.g. "ICU Bed 04"
  modalityMachineId: string;       // e.g. "Mobile-XR-01" (Mock operational device context)
  isolationType: IsolationType;    // Contextual from patient source, not frontend derived
  batteryLevelPercent: number;     // Simulated device context
  dispatchStatus: 'requested' | 'technologist_dispatched' | 'at_bedside' | 'acquired' | 'returned_to_base';
  notes?: string;
}

export interface InterventionalRadiologyContext {
  id: string;
  requestId: string;
  procedureNameAr: string;
  procedureNameEn: string;
  patientName: string;
  mrn: string;
  requirementProfile?: {
    coagulationReviewRequired: boolean;
    consentRequired: boolean;
    sedationRequired: boolean;
    recoveryBedRequired: boolean;
    specimenHandlingRequired: boolean;
  };
  consentSigned: boolean;
  anticoagulationLabStatus: 'inr_cleared' | 'platelets_adequate' | 'review_required' | 'not_applicable';
  sedationPlanned: 'none' | 'sedation_anesthesia_context' | 'conscious_sedation' | 'mac' | 'general_anesthesia_support';
  irSuiteId: string;
  procedureStage: 'pre_procedure_prep' | 'in_suite' | 'procedure_completed' | 'recovery_monitoring' | 'discharged_to_ward';
  recoveryBedAssigned?: string;
  specimensCollectedCount?: number;
  specimenContext?: {
    collected: boolean;
    containerId?: string;
    downstreamPathologyWorkflowLinked: boolean;
    specimenType?: string;
  };
}

// ----------------------------------------------------------------------------
// 13. EXTERNAL IMAGING CONTEXT (Mock External Import State Only)
// ----------------------------------------------------------------------------
export interface ExternalImagingStudy {
  id: string;
  patientName: string;
  mrn: string;
  sourceFacilityName: string;
  studyDate: string;
  modality: ImagingModality;
  studyDescription: string;
  mediaFormat: 'cd_dvd' | 'usb' | 'cloud_transfer' | 'paper_films';
  importStatus: 'received_media' | 'dicom_pre_indexed' | 'ready_for_comparison' | 'archived';
  externalReportSummary?: string;
  secondaryInterpretationRequested: boolean;
}

// ----------------------------------------------------------------------------
// 14. OPERATIONAL HOME INDICATORS / METRICS (High Information Density)
// ----------------------------------------------------------------------------
export interface RadiologyOperationalIndicators {
  incomingRequestsCount: number;
  unscheduledCount: number;
  scheduledTodayCount: number;
  arrivedWaitingCount: number;
  preparationIncompleteCount: number;
  readyForModalityCount: number;
  acquisitionInProgressCount: number;
  awaitingTechnicalQcCount: number;
  awaitingInterpretationCount: number;
  preliminaryCount: number;
  awaitingFinalSignoffCount: number;
  delayedNeedsAttentionCount: number;
  addendumCorrectionCount: number;
  activeRoomsCount: number;
  totalRoomsCount: number;
  recentCompletedCount: number;
}
