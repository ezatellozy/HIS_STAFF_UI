// =============================================================
// AXIS 6: CLINICAL ORDERS & REQUESTS WORKSPACE TYPES
// =============================================================
// Note: This is a FHIR-informed UI Mock Model (Target: HL7 FHIR R4/R5
// conceptual alignment with MedicationRequest, ServiceRequest, Task,
// and CarePlan resources). It provides conceptual mapping and UI/UX baseline,
// not a certified StructureDefinition profile conformance.
// =============================================================

export type OrderPriority = 'routine' | 'urgent' | 'asap' | 'stat';

// -------------------------------------------------------------
// 1. CLINICAL ORDERS (Actionable Clinical Instructions)
// -------------------------------------------------------------
export type OrderCategory =
  | 'medication'
  | 'laboratory'
  | 'imaging'
  | 'procedure'
  | 'nursing_care'
  | 'monitoring'
  | 'diet_nutrition'
  | 'respiratory_therapy';

export type OrderStatus =
  | 'draft'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'discontinued'
  | 'cancelled'
  | 'entered_in_error';

/**
 * Type-Specific Fulfillment Pipelines
 * Distinct visual progression stages per order modality
 */
export type LabFulfillmentStage =
  | 'ordered'
  | 'specimen_collected'
  | 'received_accessioned'
  | 'processing'
  | 'preliminary_result'
  | 'final_result';

export type ImagingFulfillmentStage =
  | 'ordered'
  | 'scheduled'
  | 'patient_arrived'
  | 'performed'
  | 'preliminary_report'
  | 'final_report';

export type ProcedureFulfillmentStage =
  | 'ordered'
  | 'scheduled_prepared'
  | 'in_progress'
  | 'completed'
  | 'procedure_documented';

export type ResultRelationshipStage =
  | LabFulfillmentStage
  | ImagingFulfillmentStage
  | ProcedureFulfillmentStage
  | 'collected_or_scheduled'
  | 'in_analysis'
  | 'resulted';

export interface CDSSMockAlert {
  id: string;
  type:
    | 'allergy_conflict'
    | 'drug_drug_interaction'
    | 'duplicate_order'
    | 'dose_range_warning'
    | 'renal_hepatic_concern'
    | 'contraindication'
    | 'duplicate_imaging'
    | 'missing_mandatory_data';
  severity: 'informational' | 'warning' | 'high_severity_blocking';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  recommendationAr?: string;
  canOverride: boolean;
  isOverridden?: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

/**
 * Policy defining whether an order action requires a reason, confirmation,
 * or secondary authorization, and by which authorized clinical roles.
 */
export interface OrderActionPolicy {
  action: 'discontinue' | 'hold' | 'resume' | 'cancel';
  isReasonRequired: boolean;
  isConfirmationRequired: boolean;
  additionalAuthorizationRequired: boolean;
  authorizedRoles: string[]; // e.g. ['Authorized Clinician', 'Attending Physician', 'Clinical Pharmacist']
}

export type OrderSourceType =
  | 'electronic_cpoe'
  | 'verbal_order'
  | 'telephone_order'
  | 'protocol_standing_order'
  | 'emergency_verbal';

export interface ConfiguredVerbalOrderProfile {
  profileId?: string; // e.g. "PROF-VO-EMERGENCY-READBACK" or "PROF-TO-STANDARD-NOREADBACK"
  profileNameAr?: string;
  orderSource: OrderSourceType;
  orderSourceLabelAr: string;

  // Where verbal orders are allowed / disabled state
  isPermittedInContext?: boolean; // e.g. true in sterile OR/Code Blue, false in routine ward
  permittedContextDescriptionAr?: string;

  // Authorized receiver
  receiver: {
    id: string;
    name: string;
    role: string;
  };
  authorizedReceiverRoles?: string[];
  receivedAt: string;

  orderingPractitioner: {
    id: string;
    name: string;
    role: string;
  };

  // Reason / justification requirements (configured by profile)
  isReasonRequired?: boolean;
  emergencyRationaleOrReason?: string;

  // Read-back requirements (configured by profile, not universal global mandate)
  isReadBackRequired?: boolean;
  readBackStatus?: 'completed' | 'not_required' | 'pending' | 'deferred_emergency';
  readBackConfirmed?: boolean;

  // Authentication requirements & targets
  isAuthenticationRequired?: boolean;
  authenticationStatus: 'authenticated' | 'pending_authentication' | 'not_applicable';
  authenticatedBy?: {
    id: string;
    name: string;
    role: string;
  };
  authenticatedAt?: string;
  configuredAuthenticationTarget?: {
    targetHours?: number; // Mock Configured Policy Example (e.g. 12h, 24h, 48h - NOT global universal rule)
    targetDescriptionAr: string; // e.g. "حسب السياسة المؤسسية للقسم (مثال: خلال 24 ساعة)"
    policyGoverningBody?: string;
    isOverdue?: boolean;
    escalationBehavior?: string; // e.g. "إشعار رئيس القسم الطبي عند تجاوز المهلة"
  };
  isMockPolicyExample?: boolean;
}

export interface SharedOrderShell {
  id: string;
  patientId: string;
  encounterId: string;
  encounterLocation: string;
  priority: OrderPriority;
  clinicalIndication: string;
  reasonForOrder?: string;
  orderingClinician?: {
    id: string;
    name: string;
    role: string;
    specialty: string;
  };
  orderedBy?: {
    id: string;
    name: string;
    role: string;
    specialty: string;
  };
  orderedAt: string;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    changedBy: string;
    reason?: string;
  }>;
  cdssAlerts?: CDSSMockAlert[];
  resultPipelineStage?: ResultRelationshipStage;
  resultPipelineStatus?: string;
  resultReferenceId?: string; // Links to Axis 7 Results
  // Configured Order Source Profile (Verbal / Telephone / CPOE context - Section 7)
  orderSourceProfile?: ConfiguredVerbalOrderProfile;
}

// Medication Order Specific Details
export interface MedicationOrderDetails {
  catalogId: string;
  genericName: string;
  brandName?: string;
  dosageForm: string; // Tablet, IV Infusion, SC Injection, etc.
  strength: string;   // e.g. 500mg, 1mg/ml
  doseAmount: number;
  doseUnit: string;   // mg, mcg, g, mL, units, mg/kg
  route: string;      // Oral, IV Push, SC, Inhalation
  frequency: string;  // Once, Q8H, Q12H, Twice daily, Bedtime, PRN
  administrationPattern?: 'standard_scheduled' | 'continuous_infusion' | 'titrated_infusion' | 'loading_and_maintenance' | 'tapering_regimen';
  durationDays?: number;
  durationText?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  isPrn: boolean;
  prnReason?: string;
  specialInstructions?: string;
  administrationInstructions?: string;
  
  // Continuous Infusion & Titration Details (when clinically applicable)
  continuousRate?: string; // e.g. "10 mcg/min"
  infusionDetails?: {
    concentration?: string;
    infusionRate?: string;
    doseRate?: string;
    weightBasedRate?: string;
    titrationParameters?: string;
    loadingDose?: string;
    maintenanceDose?: string;
    taperingSchedule?: string;
  };

  isHighAlert?: boolean;
  verificationPolicy?: 'single_clinician' | 'dual_nurse_signoff' | 'pharmacist_pre_review';
}

// Laboratory Order Specific Details
export interface LabOrderDetails {
  catalogId: string;
  testNameAr: string;
  testNameEn: string;
  loincCode?: string;
  specimenType: string; // Whole Blood, Serum, Urine, CSF, Sputum, Swab
  collectionTiming: 'immediate' | 'routine' | 'timed_post_dose' | 'fasting_morning';
  numberOfSets?: number; // e.g. 2 sets for Blood Cultures
  specialHandling?: string; // Ice pack, protect from light
  fastingStatus?: 'fasting_12h' | 'random' | 'not_required';
  collectionInstructions?: string;
}

// Imaging Order Specific Details (Context-specific safety requirements)
export interface ImagingOrderDetails {
  catalogId: string;
  studyNameAr: string;
  studyNameEn: string;
  modality: 'XR' | 'CT' | 'MRI' | 'US' | 'ECHO' | 'NM';
  bodyRegion: string;
  laterality?: 'left' | 'right' | 'bilateral' | 'not_applicable';
  contrastType: 'none' | 'oral_only' | 'iv_contrast' | 'oral_and_iv';
  clinicalQuestion: string; // Specific query for the radiologist
  
  // Safety checks (Appears only when Study + Modality + Protocol + Patient Context requires them)
  safetyRequirements?: {
    requiresRenalSafetyCheck?: boolean;
    requiresPregnancyScreen?: boolean;
    requiresSedationAssessment?: boolean;
    requiresSpecialPreparation?: boolean;
  };

  pregnancyCheckRequired?: boolean;
  pregnancyStatusConfirmed?: 'negative' | 'na_male_or_elderly' | 'not_pregnant' | 'not_applicable';
  pregnancyScreenedAt?: string;
  
  renalSafetyChecked?: boolean;
  recentEGFR?: string;
  transportMode?: 'walk' | 'wheelchair' | 'stretcher_with_monitor';
  specialPreparation?: string;
}

// Procedure Order Specific Details (Requirements profile driven)
export interface ProcedureOrderDetails {
  catalogId: string;
  procedureNameAr: string;
  procedureNameEn: string;
  anatomicalSite: string;
  laterality?: 'left' | 'right' | 'bilateral' | 'not_applicable';
  urgency: 'elective' | 'urgent' | 'emergent';
  sedationType: 'none' | 'local' | 'moderate_conscious' | 'deep_sedation' | 'general';
  
  // Requirements Profile from Catalog Item
  requirementsProfile?: {
    requiresConsent?: boolean;
    requiresInformedConsent?: boolean;
    requiresNpo: boolean;
    npoHoursRequired?: number;
    requiresSedationOrAnesthesia?: boolean;
    requiresSedation?: boolean;
    requiresBloodCrossmatch?: boolean;
    requiresBloodAvailability?: boolean;
    requiresCoagulationScreen?: boolean;
  };

  consentStatus?: 'not_required' | 'signed_verified' | 'pending' | 'emergency_waiver';
  npoStatus?: 'not_required' | 'confirmed_fasting' | 'pending';
  bloodStatus?: 'not_required' | 'reserved' | 'type_screen_only';

  prerequisitesMet?: string[]; // Log of confirmed prerequisites
  specialEquipmentNeeded?: string;
}

// Nursing / Care Order Specific Details
export interface CareOrderDetails {
  careType: 'monitoring' | 'wound_care' | 'drain_management' | 'diet_feeding' | 'mobility_activity' | 'respiratory';
  instructionsAr: string;
  instructionsEn: string;
  frequency: string;
  parameters?: Record<string, string>;
}

export type ClinicalOrderItem = SharedOrderShell & {
  category: OrderCategory;
  orderTitleAr: string;
  orderTitleEn: string;
  medicationDetails?: MedicationOrderDetails;
  labDetails?: LabOrderDetails;
  imagingDetails?: ImagingOrderDetails;
  procedureDetails?: ProcedureOrderDetails;
  careDetails?: CareOrderDetails;
};

// -------------------------------------------------------------
// 2. CLINICAL REQUESTS (Service / Team / Fulfillment Workflows)
// -------------------------------------------------------------
export type RequestType =
  | 'consultation_request'
  | 'admission_request'
  | 'transfer_request'
  | 'surgery_or_request'
  | 'specialty_referral'
  | 'consultation'
  | 'admission'
  | 'transfer'
  | 'surgery';

export type RequestLifecycleStatus =
  | 'draft'
  | 'submitted_active'
  | 'on_hold'
  | 'revoked_cancelled'
  | 'completed_closed'
  | 'active'
  | 'cancelled'
  | 'completed';

export type RequestStatus = RequestLifecycleStatus;

export type RequestFulfillmentWorkStatus =
  | 'waiting_in_queue'
  | 'unassigned'
  | 'assigned'
  | 'claimed'
  | 'accepted'
  | 'in_progress'
  | 'waiting_for_information'
  | 'completed'
  | 'declined_returned'
  | 'claimed_accepted';

export type RequestFulfillmentStatus = RequestFulfillmentWorkStatus;

export type RequestPriority = OrderPriority;

export interface ConsultationRequestDetails {
  specialtyRequired?: string;
  targetSpecialty?: string;
  urgencyLevel?: 'bedside_stat_15m' | 'urgent_2h' | 'same_day_routine';
  focalQuestion?: string;
  focalClinicalQuestion?: string;
  clinicalSummary?: string;
  targetConsultant?: string;
  preferredResponseTimeFrame?: string;
}

export interface AdmissionRequestDetails {
  targetLevelOfCare?: string; // e.g. Configured Levels of Care (ICU, CCU, Telemetry, General Ward)
  primaryAdmittingDiagnosis?: string;
  isolationRequired?: 'none' | 'contact' | 'airborne' | 'droplet';
  telemetryRequired?: boolean;
  targetUnit?: string;
  bedLevelOfCare?: string;
  admittingDiagnosis?: string;
  specialEquipmentNeeded?: string[];
}

export interface TransportRequirementsProfile {
  profileNameAr: string;
  profileNameEn: string;
  transportVehicleOrMode: string; // Configured / mock example e.g. Mobile ICU, ALS Ambulance, BLS, Aeromedical Evacuation, Bedside Stretcher
  escortRequirements: string;     // Configured / mock example e.g. Physician Escort, Critical Care Nurse Escort, Clinical Porter
  monitoringRequirements: string[]; // Configured / mock example e.g. Multi-parameter Monitor, Arterial Line, SpO2/ECG, Transport Defibrillator
  determinedByPolicyNote?: string; // Evaluated dynamically by: Transfer Type + Clinical Acuity + Patient Context + Hospital / Regulatory Policy
}

export interface TransferRequestDetails {
  transferType?: 'internal_transfer' | 'external_facility_transfer';
  sourceLocationOrService?: string;
  fromLocation?: string;
  requestedDestinationOrService?: string;
  toLocation?: string;
  destinationFacility?: string;
  transferReason?: string;
  clinicalAcuity?: 'critical_unstable' | 'high_acuity' | 'intermediate_stable' | 'routine_stable';
  // Generic Transfer Transport Concepts (Mock / Configured Policy Examples)
  transportRequirementsProfile?: TransportRequirementsProfile;
  escortRequirements?: string;
  transportLevelRequired?: string;
  transportRequirements?: string;
  transportEscort?: string;
  monitoringRequirements?: string[];
  sbarHandoverSummary?: string;
  acceptingPhysicianName?: string;
  acceptingPhysicianPhone?: string;
  receivingTeamOrService?: string;
}

export interface SurgeryRequestDetails {
  proposedProcedure?: string;
  procedurePlanned?: string;
  operatingRoomType?: string;
  anesthesiaType?: string;
  requiresAnesthesiaConsult?: boolean;
  anesthesiaConsultDone?: boolean;
  requiresBloodReservation?: boolean;
  bloodCrossmatchRequired?: boolean;
  bloodUnitsReserved?: string;
  preferredOrSuite?: string;
  estimatedDurationMinutes?: number;
  specialSuppliesRequired?: string[];
}

export interface ClinicalRequestItem {
  id: string;
  patientId: string;
  encounterId: string;
  requestType: RequestType;
  titleAr: string;
  titleEn: string;
  priority: OrderPriority;
  
  // Requested Target
  requestedDepartment?: string;
  requestedSpecialty?: string;
  targetServiceOrUnit?: string;
  
  // Clinical Context
  clinicalQuestionOrReason?: string;
  clinicalSummary?: string;
  relevantDiagnoses?: string[];
  relevantVitalsSnapshot?: string;
  relevantLabsSnapshot?: string;

  // Requesting provenance
  requestingClinician?: {
    id: string;
    name: string;
    role: string;
    department: string;
    contactNumber?: string;
    specialty?: string;
  };
  requestedBy?: {
    id: string;
    name: string;
    role: string;
    department?: string;
    specialty?: string;
    contactNumber?: string;
  };
  requestedAt: string;
  preferredTiming?: string;

  // SEPARATE STATUSES (Crucial Architectural Requirement)
  requestStatus: RequestLifecycleStatus;
  fulfillmentStatus: RequestFulfillmentWorkStatus;
  
  // Fulfillment / Assigned Team details (Preparation for My Work)
  assignedToTeam?: string;
  assignedToClinician?: string;
  claimedByClinician?: string;
  workStatusUpdatedAt?: string;
  workNotes?: string;

  // Visual distinction from actual clinical event
  actualEventDisclaimerAr?: string; // e.g., "طلب استشارة معتمد (لا يمثل تقرير الاستشارة النهائي حتى يوثقه الاستشاري)"
  actualEventOccurred?: boolean;
  resultingEventReference?: {
    type: 'consultation_note' | 'actual_admission_encounter' | 'actual_transfer_movement' | 'performed_surgery_case';
    referenceId: string;
    referenceLabelAr: string;
    timestamp: string;
  };
  resultingNoteId?: string;

  // Specific Payload per request type
  consultationDetails?: ConsultationRequestDetails;
  admissionDetails?: AdmissionRequestDetails;
  transferDetails?: TransferRequestDetails;
  surgeryRequestDetails?: SurgeryRequestDetails;
  surgeryDetails?: SurgeryRequestDetails;
}

// -------------------------------------------------------------
// 3. ORDER SETS / CLINICAL BUNDLES
// -------------------------------------------------------------
export interface OrderSetItemTemplate {
  id: string;
  category: OrderCategory;
  titleAr: string;
  titleEn: string;
  priority: OrderPriority;
  isPreselected: boolean;
  rationaleAr: string;
  orderPayload: Partial<ClinicalOrderItem>;
}

export interface ClinicalOrderSet {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  version: string;
  clinicalContextAr: string;
  targetDepartment: string[];
  evidenceSource: string;
  items: OrderSetItemTemplate[];
}

// -------------------------------------------------------------
// 4. REQUESTER VIEW-MODEL / CANONICAL DISPLAY HELPER
// -------------------------------------------------------------
export interface RequesterDisplayViewModel {
  name: string;
  roleOrSpecialty: string;
  department?: string;
  contactNumber?: string;
  isMissing: boolean;
}

/**
 * Unified helper to extract and format requester information from both
 * requestedBy and requestingClinician sources without fabricating clinician identities.
 * Missing data states return neutral descriptors ('غير محدد', 'بيانات مقدم الطلب غير متاحة').
 */
export function getRequesterDisplayInfo(
  request?: Partial<Pick<ClinicalRequestItem, 'requestedBy' | 'requestingClinician'>> | null
): RequesterDisplayViewModel {
  if (!request) {
    return {
      name: 'غير محدد',
      roleOrSpecialty: 'بيانات مقدم الطلب غير متاحة',
      isMissing: true
    };
  }

  const clinician = request.requestedBy || request.requestingClinician;

  if (!clinician || (!clinician.name && !clinician.role && !clinician.specialty)) {
    return {
      name: 'غير محدد',
      roleOrSpecialty: 'بيانات مقدم الطلب غير متاحة',
      isMissing: true
    };
  }

  const name = clinician.name?.trim() || 'غير محدد';
  const roleOrSpecialty = clinician.specialty || clinician.department || clinician.role || 'غير محدد';

  return {
    name,
    roleOrSpecialty,
    department: clinician.department,
    contactNumber: clinician.contactNumber,
    isMissing: false
  };
}
