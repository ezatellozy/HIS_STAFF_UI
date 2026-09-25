// ============================================================================
// BLOOD BANK & TRANSFUSION MEDICINE OPERATIONS UX - DATA TYPES & SCHEMAS
// High-Fidelity Interactive UI/UX Prototype Only (Departmental Operational Model)
// ============================================================================

export type BloodBankViewTab =
  | 'operational_home'
  | 'incoming_requests'
  | 'samples'
  | 'grouping_typing'
  | 'antibody_screen'
  | 'compatibility'
  | 'inventory_context'
  | 'ready_issue'
  | 'returns_disposition'
  | 'reactions_investigation'
  | 'exceptions_attention'
  | 'completed_recent';

export type BloodBankPersona =
  | 'blood_bank_technologist'
  | 'transfusion_medicine_specialist'
  | 'blood_bank_supervisor'
  | 'clinical_transfusion_coordinator';

// ----------------------------------------------------------------------------
// MULTI-BRANCH INVENTORY & LOCATION
// ----------------------------------------------------------------------------

export type BloodBankBranchId = 'main_hospital' | 'satellite_clinic_north' | 'trauma_center_east';

export interface BloodBankBranch {
  id: BloodBankBranchId;
  nameAr: string;
  nameEn: string;
  code: string;
  isCentralHub: boolean;
}

export type UnitStockAvailabilityType = 'local_available' | 'remote_available' | 'in_transit';

// ----------------------------------------------------------------------------
// BLOOD PRODUCTS & COMPONENTS
// ----------------------------------------------------------------------------

export type BloodComponentType =
  | 'packed_red_blood_cells'   // PRBCs
  | 'platelets_apheresis'      // Single donor platelets
  | 'platelets_pooled'         // Random donor pooled platelets
  | 'fresh_frozen_plasma'      // FFP
  | 'cryoprecipitate'          // Cryo
  | 'whole_blood';             // Whole blood (emergency/trauma)

export type BloodGroupABO = 'A' | 'B' | 'AB' | 'O';
export type RhStatus = 'positive' | 'negative';

export interface BloodGroup {
  abo: BloodGroupABO;
  rh: RhStatus;
  displayAr: string; // e.g., 'A موجب (+)'
  displayEn: string; // e.g., 'A Positive (A+)'
}

export type SpecialProductAttribute =
  | 'irradiated'
  | 'leukocyte_reduced'
  | 'washed'
  | 'cmv_negative'
  | 'antigen_negative'
  | 'phenotype_matched'
  | 'pediatric_split'
  | 'volume_reduced'
  | 'pooled';

export type ProductUnitStatus =
  | 'available'
  | 'reserved'
  | 'allocated'
  | 'in_preparation'
  | 'ready_for_issue'
  | 'issued'
  | 'returned_in_inspection'
  | 'quarantined'
  | 'expired'
  | 'discarded'
  | 'transfused_referenced';

export type ExpiryVerificationStatus =
  | 'verified'
  | 'pending_verification'
  | 'unverified_missing_date'
  | 'discrepant';

export type ProcessingLifecycleStatus =
  | 'requested'
  | 'in_progress'
  | 'processing_recorded'
  | 'quality_verification_pending'
  | 'verified'
  | 'rejected_quarantined'
  | 'eligible_for_next_step';

export type ProductProcessingMethod =
  | 'irradiation'
  | 'thawing'
  | 'cryo_pooling'
  | 'washing'
  | 'pediatric_splitting';

export interface ProductProcessingRecord {
  id: string;
  sourceUnitIds: string[];
  sourceProductIdentity: string;
  processingMethod: ProductProcessingMethod;
  processingMethodAr: string;
  status: ProcessingLifecycleStatus;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  responsibleSimulatedActor: string;
  deviceIdentifier: string;
  resultingProductIdentity: string;
  resultingVolumeMl?: number;
  // Source-to-child relationships for splitting
  childUnits?: Array<{
    childUnitId: string;
    childUnitNumber: string;
    volumeMl: number;
    aliquotLabel: string;
    status: ProductUnitStatus;
  }>;
  // Contributing units for pooling
  contributingUnits?: Array<{
    unitId: string;
    unitNumber: string;
    bloodGroup: string;
    originalVolumeMl: number;
  }>;
  poolIdentifier?: string;
  // Expiry & Standards Citation
  expirySource: string; // e.g. 'JPAC Red Book Section 7.5.1 v8'
  expiryVerificationStatus: ExpiryVerificationStatus;
  calculatedExpiryDate?: string;
  qualityReviewer?: string;
  qualityVerifiedAt?: string;
  quarantineOrRejectionReason?: string;
  notes?: string;
  isOptionalHospitalCapability: boolean;
}

export interface BloodProductUnit {
  id: string; // Unit / DIN identifier, e.g. 'DIN-W2026-0941-RBC'
  unitNumber: string; // ISBT-128 style: =W0422 26 123456 00
  componentType: BloodComponentType;
  componentNameAr: string;
  componentNameEn: string;
  bloodGroup: BloodGroup;
  volumeMl: number;
  collectionDate: string;
  expiryDate: string; // Source of truth. Can be empty string if missing from source
  originalExpiryDate?: string; // Preserved original un-modified supplier/collection expiry date
  postProcessingVerifiedExpiry?: string; // Post-modification verified expiry date
  expiryVerificationStatus?: ExpiryVerificationStatus;
  isNearExpiry: boolean; // Computed based on configurable institutional threshold
  nearExpiryThresholdHours?: number; // Configurable institutional example
  branchId?: BloodBankBranchId; // Multi-branch support
  branchNameAr?: string;
  storageLocation: string; // e.g. 'ثلاجة بنك الدم 1 - الرف B2'
  storageTemperatureC: string; // e.g. '2°C - 6°C' or '-20°C'
  specialAttributes: SpecialProductAttribute[];
  antigenProfile?: string[]; // e.g. ['K-', 'E-', 'C-']
  status: ProductUnitStatus;
  allocatedToRequestId?: string;
  allocatedToPatientName?: string;
  allocatedToPatientMrn?: string;
  allocatedAt?: string;
  issuedAt?: string;
  issuedToLocation?: string;
  // Hierarchy & Traceability
  parentUnitId?: string;
  childUnitIds?: string[];
  contributingUnitIds?: string[];
  poolIdentifier?: string;
  isEligibleForNextStep?: boolean;
  notes?: string;
  processingHistory?: ProductProcessingRecord[];
  modificationExpiryDetails?: {
    newExpiryDate: string;
    regulatorySource: string;
    standardVersion: string;
    specificConditionAr: string;
    verificationStatus: ExpiryVerificationStatus;
    verifiedBy?: string;
  };
  preparationState?: {
    isIrradiated?: boolean;
    irradiatedAt?: string;
    isWashed?: boolean;
    isThawed?: boolean;
    thawedAt?: string;
    thawExpiry?: string;
    isSplit?: boolean;
    splitSubId?: string;
    isPooled?: boolean;
  };
}

// ----------------------------------------------------------------------------
// BLOOD PRODUCT REQUEST (INTAKE)
// ----------------------------------------------------------------------------

export type RequestPriority = 'stat_emergency' | 'urgent' | 'routine' | 'elective_surgery';

export type RequestStatus =
  | 'received'
  | 'sample_pending'
  | 'sample_received'
  | 'testing_in_progress'
  | 'compatibility_complete'
  | 'partially_allocated'
  | 'fully_allocated'
  | 'ready_for_issue'
  | 'partially_issued'
  | 'completed'
  | 'cancelled';

export interface RequestComponentLineItem {
  id: string;
  componentType: BloodComponentType;
  componentNameAr: string;
  requestedQuantity: number;
  reservedQuantity: number;
  allocatedQuantity: number;
  issuedQuantity: number;
  outstandingQuantity: number;
  specialRequirements: SpecialProductAttribute[];
  status: 'pending' | 'partially_allocated' | 'allocated' | 'partially_issued' | 'issued';
}

export interface BloodProductRequest {
  id: string; // e.g. 'BPR-2026-801'
  axis6OrderId?: string;
  patientId: string;
  patientName: string;
  patientNameEn: string;
  mrn: string;
  encounterId: string;
  encounterType: 'inpatient' | 'emergency' | 'icu' | 'or' | 'opd';
  locationWardBed: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  patientWeightKg: number;
  patientPrimaryDiagnosis: string;
  patientHistoricalBloodGroup?: BloodGroup;
  patientKnownAntibodies?: string[];
  transfusionHistorySummary: string; // e.g. 'نقل دم سابق قبل 4 أشهر - دون تفاعلات'
  pregnancyHistory?: string; // e.g. 'حمل سابق G2P1'

  // Request particulars
  requestedComponent: BloodComponentType;
  componentNameAr: string;
  componentNameEn: string;
  requestedQuantity: number;
  reservedQuantity?: number;
  allocatedQuantity?: number;
  issuedQuantity?: number;
  outstandingQuantity?: number;
  quantityUnit: string; // 'أكياس (Units)'
  clinicalIndication: string;
  hemoglobinBaseline?: string; // e.g. '6.8 g/dL'
  plateletBaseline?: string;  // e.g. '22,000 /uL'
  inrBaseline?: string;       // e.g. '2.4'
  priority: RequestPriority;
  urgencyLevel?: string;
  requiredByTime: string;     // e.g. 'خلال ساعتين' or 'فوري - طوارئ'
  specialRequirements: SpecialProductAttribute[];
  specialInstructions?: string;
  componentLineItems?: RequestComponentLineItem[]; // Multi-component support

  // Ordering Clinician / Service
  requestingClinician: string;
  requestingRole: string;
  requestingDepartment: string;
  requestedAt: string;

  // Operational linkages
  linkedSampleId?: string;
  sampleStatus: 'none' | 'collected_in_transit' | 'received_valid' | 'expiring_soon' | 'expired' | 'rejected';
  compatibilityStatus: 'not_started' | 'testing' | 'compatible' | 'incompatible' | 'emergency_override_pending' | 'emergency_released';
  allocatedUnitIds: string[];
  issuedUnitIds: string[];
  requestStatus: RequestStatus;

  // Emergency / MTP Context
  isEmergencyReleaseRequested?: boolean;
  emergencyAuthorizationReason?: string;
  isMassiveTransfusionProtocol?: boolean;
  mtpRoundNumber?: number;
}

// ----------------------------------------------------------------------------
// PRE-TRANSFUSION SAMPLES
// ----------------------------------------------------------------------------

export type SampleValidityStatus =
  | 'valid'
  | 'expiring_soon'
  | 'expired'
  | 'rejected_hemolyzed'
  | 'rejected_mislabeled'
  | 'review_required';

export type SampleValidityDecision =
  | 'valid'
  | 'expiring_soon'
  | 'expired'
  | 'validity_uncertain'
  | 'clinical_history_unavailable'
  | 'requires_new_sample';

export interface SampleValidityProfile {
  profileName: string; // e.g. 'Recent Transfusion / Pregnancy (72h Policy)'
  clinicalHistoryStatus: 'transfused_last_3_months' | 'pregnant_last_3_months' | 'no_recent_sensitizing_event' | 'unknown_history';
  validityDecision: SampleValidityDecision;
  validUntil?: string; // undefined if validity cannot be determined!
  determinationSource: string; // e.g. 'Institutional Transfusion Policy v4.2'
  requiresReview: boolean;
  reviewReason?: string;
}

export type SampleRejectionReasonCode =
  | 'hemolyzed_specimen'
  | 'mislabeled_wristband_mismatch'
  | 'unlabeled_tube'
  | 'wrong_patient_specimen'
  | 'suspected_wbit_wrong_blood_in_tube'
  | 'clotted_edta_sample'
  | 'insufficient_volume_qns'
  | 'wrong_tube_type_anticoagulant'
  | 'collection_time_absent';

export interface SampleRejectionDetails {
  rejectedAt: string;
  rejectedByTechnologist: string;
  reasonCode: SampleRejectionReasonCode;
  reasonAr: string;
  reasonEn: string;
  recollectionRequired: boolean;
  recollectionOrderRef?: string;
  investigationMandated: boolean;
  clinicalNotificationStatus: 'notified_phone' | 'urgent_alert_sent' | 'pending_notification';
}

export interface PreTransfusionSample {
  id: string; // e.g. 'SMP-BT-9041'
  barcode: string; // '9041-88421-B'
  patientId: string;
  patientName: string;
  patientNameEn: string;
  mrn: string;
  encounterId: string;
  collectionLocation: string;
  collectedAt: string;
  collectorName: string;
  collectorRole: string;
  receivedAt: string;
  receiverTechnologist: string;
  tubeType: 'EDTA Pink Top (6 mL)' | 'EDTA Lavender Top (4 mL)' | 'Serum Red Top';
  validityStatus: SampleValidityStatus;
  validUntil: string; // policy-driven validity timestamp
  validityPolicyDescription: string; // e.g. 'صالحة لمدة 72 ساعة لمرضى التنويم المنقول لهم دم حديثاً'
  validityProfile?: SampleValidityProfile;
  rejectionDetails?: SampleRejectionDetails;
  temporaryTraumaIdentityCaution?: boolean;
  historicalGroupContext?: BloodGroup;
  previousAntibodiesContext?: string[];
  identificationVerificationDone: boolean;
  identificationMethod: string; // 'Two Identifiers Verified (Name + MRN) + Barcode'
  notes?: string;
}

// ----------------------------------------------------------------------------
// BLOOD GROUP & TYPE TESTING
// ----------------------------------------------------------------------------

export interface BloodGroupTestResult {
  id: string;
  sampleId: string;
  patientId: string;
  patientMrn: string;
  testDate: string;
  technologistName: string;
  verifierName?: string;

  // Forward Typing (Front / Cell)
  antiA: '0' | '1+' | '2+' | '3+' | '4+';
  antiB: '0' | '1+' | '2+' | '3+' | '4+';
  antiAB?: '0' | '1+' | '2+' | '3+' | '4+';
  antiD: '0' | '1+' | '2+' | '3+' | '4+';
  rhControl: '0' | '1+';

  // Reverse Typing (Back / Serum)
  a1Cells: '0' | '1+' | '2+' | '3+' | '4+';
  bCells: '0' | '1+' | '2+' | '3+' | '4+';

  // Current Interpretation
  interpretedAbo: BloodGroupABO;
  interpretedRh: RhStatus;
  historicalAbo?: BloodGroupABO;
  historicalRh?: RhStatus;
  discrepancyStatus: 'none_matched' | 'historical_mismatch' | 'forward_reverse_discrepancy' | 'first_time_type';
  discrepancyNote?: string;
  technicalVerificationStatus: 'verified' | 'requires_second_sample' | 'under_investigation';
}

// ----------------------------------------------------------------------------
// ANTIBODY SCREENING & IDENTIFICATION
// ----------------------------------------------------------------------------

export interface IdentifiedAntibody {
  specificity: string; // e.g. 'Anti-Kell (K)', 'Anti-E', 'Anti-D', 'Anti-Fya'
  clinicalSignificance: 'clinically_significant' | 'unlikely_significant' | 'cold_agglutinin';
  transfusionRequirement: string; // e.g. 'يتطلب وحدات دم سالبة لمستضد Kell (K-negative) مع اختبار توافق AHG'
  historicalDate?: string;
}

export interface AntibodyScreenResult {
  id: string;
  sampleId: string;
  patientId: string;
  patientMrn: string;
  testedAt: string;
  technologistName: string;
  screenMethod: 'Column Agglutination (Gel Card)' | 'Tube Indirect Antiglobulin Test (IAT)';
  screen1Cell: 'Negative' | '1+' | '2+' | '3+' | '4+';
  screen2Cell: 'Negative' | '1+' | '2+' | '3+' | '4+';
  screen3Cell: 'Negative' | '1+' | '2+' | '3+' | '4+';
  overallScreenResult: 'negative' | 'positive' | 'inconclusive';
  investigationRequired: boolean;
  identifiedAntibodies: IdentifiedAntibody[];
  antigenNegativeSearchNeeded: boolean;
  searchCriteria?: string;
}

// ----------------------------------------------------------------------------
// COMPATIBILITY & CROSSMATCH
// ----------------------------------------------------------------------------

export type CrossmatchMethod =
  | 'electronic_compatibility' // For Ab-negative with 2 verified blood types
  | 'serologic_immediate_spin' // To confirm ABO match
  | 'antiglobulin_crossmatch_ahg' // For patients with current/historic antibodies
  | 'emergency_uncrossmatched'; // Issued prior to testing completion

export type CompatibilityResultStatus =
  | 'compatible'
  | 'incompatible'
  | 'emergency_uncrossmatched_released'
  | 'testing_in_progress';

export type ElectronicCrossmatchEligibilityStatus =
  | 'eligible'
  | 'not_eligible'
  | 'pending_assessment'
  | 'unknown';

export interface ElectronicCrossmatchAssessment {
  status?: ElectronicCrossmatchEligibilityStatus;
  assessmentReference?: string;
  reasonAr?: string;
  reasonEn?: string;
  patientMrn?: string;
  patientName?: string;
  twoIndependentGroupingsConfirmed?: boolean;
  twoIndependentTypingsOnRecord?: boolean;
  historicalGroupConcordant?: boolean;
  currentAntibodyScreenNegative?: boolean;
  historicalAntibodiesAbsent?: boolean;
  validatedSystemLogicConfirmed?: boolean;
  donorUnitAbConfirmed?: boolean;
  isEligibleForElectronicCrossmatch?: boolean;
  fallbackMethodRequired?: string;
  disqualificationReasonAr?: string;
  rationaleAr?: string;
  noHistoricalAntibodiesRecorded?: boolean;
  noAboRhDiscrepancy?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  outstandingRequirements?: string[];
  prerequisitesList?: { id: string; titleAr: string; met: boolean; notes?: string }[];
}

export type EmergencyReleasePolicyOption =
  | 'o_negative_universal'
  | 'o_positive_conserved_protocol'
  | 'type_specific_uncrossmatched';

export interface EmergencyReleasePolicyProfile {
  id: EmergencyReleasePolicyOption;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  clinicalCriteriaAr: string;
  requiresConsultantSignoff: boolean;
}

export type RetrospectiveTestingStatus =
  | 'pending'
  | 'completed_compatible'
  | 'completed_incompatible_urgent_alert'
  | 'sample_recollection_required';

export interface RetrospectiveTestingRecord {
  id: string;
  emergencyReleaseId: string;
  requestId: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  releasedUnitIds: string[];
  status: RetrospectiveTestingStatus;
  startedAt: string;
  completedAt?: string;
  technologistName: string;
  incompatibilityFindings?: string;
  urgentAlertBroadcasted: boolean;
  alertAcknowledgedBy?: string;
}

export interface CompatibilityRecord {
  id: string;
  requestId: string;
  sampleId: string;
  patientId: string;
  patientMrn: string;
  patientName: string;
  patientGroup: BloodGroup;
  unitId: string;
  unitNumber: string;
  unitGroup: BloodGroup;
  componentType: BloodComponentType;
  method: CrossmatchMethod;
  methodDisplayAr: string;
  result: CompatibilityResultStatus;
  testedAt: string;
  technologistName: string;
  verifierName?: string;
  isSpecialRequirementSatisfied: boolean;
  satisfiedRequirementsList: string[];
  electronicCrossmatchAssessment?: ElectronicCrossmatchAssessment;
  retrospectiveTestingStatus?: RetrospectiveTestingStatus;
  notes?: string;
}

// ----------------------------------------------------------------------------
// ALLOCATION & RESERVATION
// ----------------------------------------------------------------------------

export interface ProductAllocationRecord {
  id: string;
  requestId: string;
  patientId: string;
  patientMrn: string;
  unitId: string;
  unitNumber: string;
  componentType: BloodComponentType;
  allocatedAt: string;
  allocatedBy: string;
  reservationExpiresAt: string; // e.g. Holds for 24-48 hours
  allocationStatus: 'active' | 'cancelled' | 'issued' | 'expired_release';
}

// ----------------------------------------------------------------------------
// ISSUE / RELEASE WORKSPACE
// ----------------------------------------------------------------------------

export interface ProductIssueRecord {
  id: string; // e.g. 'ISS-2026-501'
  requestId: string;
  unitId: string;
  unitNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  destinationLocation: string; // e.g. 'غرفة العمليات OR-3' or 'العناية المركزة ICU-Bed 02'
  issuedAt: string;
  issuingTechnologist: string;
  receivingStaffName: string;
  receivingStaffRole: string;
  handoffMethod: 'clinical_nurse_pickup' | 'dedicated_porter_transport' | 'emergency_transfusion_runner';
  transportCarrierId: string; // e.g. 'صندوق تبريد مخصص #B04'
  coldChainIndicatorConfirmed: boolean;
  returnWindowNotice: string; // e.g. 'يجب إرجاع الوحدة خلال 30 دقيقة إذا تأجل النقل ولم يتم فتح الكيس'
  issueStatus: 'issued_in_transit' | 'acknowledged_at_unit' | 'returned_unused' | 'transfusion_referenced';
}

// ----------------------------------------------------------------------------
// PRODUCT RETURNS & DISPOSITION
// ----------------------------------------------------------------------------

export type ReturnReason =
  | 'transfusion_delayed_procedure'
  | 'patient_condition_stabilized'
  | 'transfusion_cancelled'
  | 'excess_unit_not_needed'
  | 'suspected_adverse_reaction'
  | 'storage_temp_concern';

export type ProductDispositionOutcome =
  | 'returned_to_available_inventory'
  | 'quarantined_for_inspection'
  | 'discarded_biohazard_waste'
  | 'retained_for_reaction_investigation';

export interface ProductReturnPolicy {
  componentType?: BloodComponentType;
  productType?: BloodComponentType | string;
  productTypeAr?: string;
  maxMinutesOutsideControlledStorage: number;
  acceptableTempRange: string;
  temperatureRangeDescriptionAr?: string;
  storageConditionRequired: string;
  policyReference: string;
  inspectionCriteriaAr?: string[];
  canReturnToAvailableInventoryCriteriaAr?: string;
}

export interface ProductReturnRecord {
  id: string;
  unitId: string;
  unitNumber: string;
  patientId: string;
  patientMrn: string;
  issuedAt: string;
  returnedAt: string;
  elapsedMinutesOutsideFridge: number;
  returnedByStaff: string;
  receivedByTechnologist: string;
  reason: ReturnReason;
  bagIntegrityChecked: boolean;
  portNotPunctured: boolean;
  temperatureIndicatorOk: boolean;
  dispositionOutcome: ProductDispositionOutcome;
  dispositionNotes: string;
  dispositionAuthorizer: string;
}

// ----------------------------------------------------------------------------
// BIOHAZARD DESTRUCTION & WASTE TRACKING
// ----------------------------------------------------------------------------

export interface UnitDestructionRecord {
  id: string;
  unitId?: string;
  unitNumber: string;
  componentType?: BloodComponentType;
  productTypeAr?: string;
  bloodGroupDisplay?: string;
  bloodGroupDisplayAr?: string;
  reason?: 'expired' | 'damaged_container' | 'clot_fibrin_detected' | 'severe_cold_chain_excursion' | 'hemolyzed_unit' | 'other';
  reasonAr?: string;
  reasonDetails?: string;
  dispositionOutcome?: string;
  productCondition?: string;
  authorizedBy?: string;
  technologistName?: string;
  witnessName: string;
  witnessRole?: string;
  destroyedAt: string;
  methodOfDisposal?: 'biohazard_incineration' | 'autoclave_waste' | 'chemical_neutralization';
  destructionMethod?: string;
  biohazardManifestId?: string;
  regulatoryComplianceNoteAr?: string;
}

// ----------------------------------------------------------------------------
// TRANSFUSION REACTION INVESTIGATION & HAEMOVIGILANCE
// ----------------------------------------------------------------------------

export type ReactionSeverity = 'mild' | 'moderate' | 'severe_life_threatening';

export type ReactionTypeSuspected =
  | 'acute_hemolytic'
  | 'febrile_non_hemolytic'
  | 'allergic_anaphylactic'
  | 'trali_acute_lung_injury'
  | 'taco_circulatory_overload'
  | 'bacterial_contamination'
  | 'unspecified_adverse_event';

export type HaemovigilanceImputabilityScore =
  | 'not_assessed'
  | 'under_investigation'
  | 'definite'
  | 'probable'
  | 'possible'
  | 'unlikely'
  | 'excluded'
  | 'indeterminate_unassessable';

export type CommunicationDeliveryStatus =
  | 'intended'
  | 'attempted'
  | 'failed'
  | 'delivered'
  | 'acknowledged';

export interface ReactionCommunicationLog {
  id: string;
  channel: 'phone_call' | 'in_app_urgent_alert' | 'vocera_overhead' | 'direct_clinical_handoff';
  recipientName: string;
  recipientRole: string;
  status: CommunicationDeliveryStatus;
  timestamp: string;
  notes?: string;
}

export interface TransfusionReactionCase {
  id: string; // e.g. 'RXN-2026-012'
  patientId: string;
  patientName: string;
  patientNameEn?: string;
  patientMrn: string;
  locationWardBed: string;
  transfusionEventRef: string;
  unitId: string;
  unitNumber: string;
  componentType: BloodComponentType;
  reportedAt: string;
  reportedByClinician: string;
  reportedRole: string;
  severity: ReactionSeverity;
  suspectedType: ReactionTypeSuspected;
  clinicalSymptoms: string[]; // e.g. ['ارتفاع حرارة > 1.5°C', 'قشعريرة', 'ضيق تنفس', 'انخفاض ضغط الدم']
  transfusionActionTaken: 'transfusion_stopped_immediately' | 'paused' | 'completed_before_symptoms';
  investigationStatus: 'reported_received' | 'testing_underway' | 'specialist_review' | 'closed_concluded';

  // Blood Bank Investigation Steps
  clericalCheckConfirmed: boolean; // Patient, Unit, Blood Group match records
  clericalCheckNotes?: string;
  postReactionSampleReceived: boolean;
  postReactionSampleId?: string;
  returnedUnitBagReceived: boolean;

  // Laboratory Investigation Findings
  repeatPatientGroupMatch: boolean;
  repeatUnitGroupMatch: boolean;
  directAntiglobulinTestDAT: 'negative' | 'positive_igg' | 'positive_c3d' | 'pending';
  freeHemoglobinInSerumUrine: 'none_detected' | 'present_hemolysis' | 'pending';
  bloodCultureFromUnit: 'no_growth' | 'pending' | 'organism_isolated';

  // Haemovigilance & Imputability
  imputabilityScore?: HaemovigilanceImputabilityScore;
  imputabilityRationale?: string;
  communicationLogs?: ReactionCommunicationLog[];

  // Transfusion Medicine Conclusion
  conclusionSummary?: string;
  specialistConsultant?: string;
  concludedAt?: string;
}

// ----------------------------------------------------------------------------
// LOOKBACK & RECALL TRACEABILITY
// ----------------------------------------------------------------------------

export interface LookbackInvestigationRecord {
  id: string; // e.g. 'LK-2026-003'
  donationId: string; // e.g. 'W0422 25 881920'
  triggerSource: 'regional_blood_center_notification' | 'post_donation_illness_report' | 'recipient_infection_report' | 'transfusion_transmitted_viral_screen';
  triggerDate: string;
  donorTestFinding: string; // e.g. 'Confirmed HCV-RNA Positive on repeat donation'
  affectedUnitIds: string[];
  investigationOwner: string;
  status: 'lookback_initiated' | 'units_located' | 'recipients_traced' | 'clinicians_notified' | 'testing_and_counseling' | 'closed';
  recipientsIdentifiedCount: number;
  unitsInStorageQuarantinedCount: number;
  unitsAlreadyTransfusedCount: number;
  notificationsAttemptedCount: number;
  notificationsDeliveredCount: number;
  notes: string;
}

// ----------------------------------------------------------------------------
// PRODUCT TRACEABILITY TIMELINE
// ----------------------------------------------------------------------------

export interface ProductTraceabilityEvent {
  id: string;
  unitId: string;
  timestamp: string;
  eventType:
    | 'received_into_inventory'
    | 'placed_in_storage'
    | 'reserved'
    | 'allocated_to_patient'
    | 'prepared_modified'
    | 'compatibility_verified'
    | 'issued_to_clinical_ward'
    | 'returned_to_blood_bank'
    | 'transfusion_recorded_in_workspace'
    | 'quarantined'
    | 'discarded';
  eventTitleAr: string;
  eventTitleEn: string;
  actorName: string;
  actorRole: string;
  location: string;
  details: string;
}

// ----------------------------------------------------------------------------
// DASHBOARD METRICS & SUMMARY
// ----------------------------------------------------------------------------

export interface BloodBankMetrics {
  incomingRequestsCount: number;
  statEmergencyRequestsCount: number;
  pendingTestingCount: number;
  crossmatchCompletedCount: number;
  readyForIssueCount: number;
  activeAllocationsCount: number;
  activeEmergencyReleasesCount: number;
  activeReactionInvestigationsCount: number;
  returnedUnitsPendingDispositionCount: number;
  unitsNearExpiryCount: number;
  totalAvailableRbcUnits: number;
  totalAvailablePlateletUnits: number;
  totalAvailableFfpUnits: number;
  totalAvailableCryoUnits: number;
}

export type BloodBankOperationalTab =
  | 'overview'
  | 'requests'
  | 'samples'
  | 'grouping'
  | 'antibody'
  | 'crossmatch'
  | 'inventory'
  | 'issue_queue'
  | 'returns'
  | 'reactions';

export type BloodGroupTypingResult = BloodGroupTestResult;

export interface BloodBankOperationalMetrics {
  pendingRequestsCount: number;
  statRequestsCount: number;
  pendingSamplesCount: number;
  crossmatchInProgressCount: number;
  readyForIssueCount: number;
  availableUnitsCount: number;
  activeReactionsUnderInvestigation: number;
}

export type MtpProtocolProfileType = 'adult_trauma_balanced' | 'obstetric_hemorrhage' | 'pediatric_massive';

export interface MtpProtocolProfile {
  id: MtpProtocolProfileType;
  nameAr: string;
  nameEn: string;
  packRatioDescription: string;
  prbcPackRatio: number;
  ffpPackRatio: number;
  pltPackRatio: number;
  cryoRequirement: string;
}

export interface MassiveTransfusionProtocolSession {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  location: string;
  activatedAt: string;
  activatedByClinician: string;
  clinicalIndication: string;
  protocolType?: MtpProtocolProfileType;
  currentPackNumber: number;
  status: 'active' | 'deactivated';
  prbcUnitsIssued: number;
  ffpUnitsIssued: number;
  plateletUnitsIssued: number;
  cryoUnitsIssued: number;
  recoveredUnusedUnitsCount?: number;
  deactivatedAt?: string;
  deactivationReason?: string;
}

export interface BloodBankDemoScenario {
  id: string;
  scenarioCode: string;
  titleAr: string;
  titleEn: string;
  patientMrn: string;
  patientName: string;
  clinicalContext: string;
  bloodBankCategory: string;
  keyEducationalConcept: string;
  recommendedTab: BloodBankOperationalTab;
  targetRequestId?: string;
  targetSampleId?: string;
  targetUnitId?: string;
}

