// =============================================================
// AXIS 8 — MEDICATIONS & eMAR DOMAIN TYPES
// FHIR-ready Conceptual Mapping: MedicationRequest, MedicationAdministration, MedicationStatement
// Explicit separation: Orders != Active Meds != Administrations != Reconciliation != History
// =============================================================

export type MedicationWorkspaceView =
  | 'active_orders'
  | 'mar_grid'
  | 'infusions_titration'
  | 'reconciliation'
  | 'history';

// Configurable Administration Status Capability
export type AdministrationStatus =
  | 'due'
  | 'administered'
  | 'overdue'
  | 'held'
  | 'refused'
  | 'missed'
  | 'missed_omitted'
  | 'omitted_not_done'
  | 'rescheduled'
  | 'partial_dose'
  | 'not_available';

export type NonAdministrationReason =
  | 'sbp_low'
  | 'hr_bradycardia'
  | 'npo_for_procedure'
  | 'patient_refused'
  | 'vomiting_intolerance'
  | 'patient_sleeping'
  | 'central_supply_delayed'
  | 'physician_verbal_hold'
  | 'other';

// Configured Non-Administration Reason Profile
export interface ConfiguredNonAdminReasonItem {
  code: NonAdministrationReason;
  labelAr: string;
  labelEn: string;
  requiresPhysicianNotification: boolean;
}

export interface AdministrationSlot {
  slotId: string;
  // Time Provenance: Scheduled vs Actual vs Recorded / Documented Time
  scheduledTime: string; // Time slot determined by order frequency & schedule
  scheduledAdministrationTime?: string; // Explicit alias
  actualAdministrationTime?: string; // Actual time medication was ingested / injected / infused
  recordedAt?: string; // System documentation timestamp (Audit log in eMAR)
  recordedDocumentedTime?: string; // Explicit alias

  status: AdministrationStatus;

  // Dose Provenance & Differentiation
  doseAdministeredType?: 'full_ordered_dose' | 'partial_dose' | 'different_actual_dose';
  orderedDose?: string;
  administeredDose?: string;
  administeredUnit?: string;
  doseChangeReason?: string;

  administeredRoute?: string;
  administeredSite?: string;

  // Performer: Authorized Clinician / Performer (not hardcoded to nursing)
  administeredBy?: string;
  administeredByRole?: string;
  verifiedBy?: string;
  verifiedByRole?: string;
  isDualVerified?: boolean;

  deliveryDeviceOrPump?: string;
  linkedOrderId?: string;
  comments?: string;

  nonAdminReason?: NonAdministrationReason;
  nonAdminComment?: string;

  // Context-Driven Pre & Post Assessments (Only present when Medication + Route + Indication indicates appropriateness)
  preAssessment?: {
    applicable: boolean;
    type: 'pain' | 'sedation' | 'respiratory' | 'bp' | 'hr' | 'blood_glucose' | 'none';
    labelAr: string;
    value?: string | number;
    assessedAt?: string;
  };

  postAssessment?: {
    required: boolean;
    reassessmentWindowMinutes: number; // e.g. 30, 60 minutes
    type: 'pain' | 'sedation' | 'respiratory' | 'effectiveness';
    labelAr: string;
    value?: string | number;
    assessedAt?: string;
    notes?: string;
  };

  // Backwards compatibility
  administeredAt?: string;
  responseAssessment?: {
    painScorePre?: number;
    painScorePost?: number;
    sedationScore?: string;
    evaluatedAt?: string;
    notes?: string;
  };
}

// Order-Specific Hold and Administration Parameter (Point 7)
export interface MedicationHoldParameter {
  parameterName: string; // e.g., "Systolic Blood Pressure (SBP)", "Heart Rate (HR)", "Blood Glucose"
  thresholdCondition: string; // e.g., "< 100 mmHg", "< 55 bpm", "< 70 mg/dL"
  action: 'hold' | 'notify_physician' | 'adjust_rate';
  source: 'medication_order' | 'administration_instructions' | 'configured_policy';
  sourceDescription: string;
}

// Medication Verification Policy (Point 8)
export interface MedicationVerificationPolicy {
  policyType: 'no_additional_verification' | 'single_clinician' | 'dual_independent_verification' | 'cosign_required';
  policyName: string;
  isHighAlert: boolean;
  requiresSecondClinician: boolean;
  authorizedVerifierRoles: string[]; // e.g. ['Authorized Clinician', 'Registered Nurse (RN)', 'Clinical Pharmacist', 'Physician']
  descriptionAr: string;
}

export interface ActiveMedicationItem {
  id: string;
  orderId: string; // Provenance link to Axis 6 Order
  genericName: string;
  brandName: string;
  dosageForm: string;
  strength: string;
  orderedDose: string;
  doseUnit: string;
  route: string;
  frequency: string;
  timingDescription: string;
  startDate: string;
  plannedDuration?: string;
  indication: string;
  therapeuticClass?: string;
  orderingClinician: {
    name: string;
    role: string;
    department: string;
  };
  orderStatus: 'active' | 'on_hold' | 'discontinued' | 'completed';
  isHighAlert: boolean;
  verificationPolicy: MedicationVerificationPolicy;
  orderHoldParameters?: MedicationHoldParameter[];
  isPrn: boolean;
  prnDetails?: {
    indication: string;
    minIntervalHours: number;
    lastAdministeredAt?: string;
    nextAllowedAt?: string;
    isCurrentlyAllowed: boolean;
    effectivenessRequired?: boolean;
  };
  isContinuousInfusion: boolean;
  dispensingStatus: 'pending' | 'floor_stock' | 'dispensed' | 'not_available';
  pharmacySupplyContext?: {
    supplyStatus: 'dispensed_from_pharmacy' | 'ward_floor_stock' | 'dispense_pending' | 'supply_unavailable';
    supplyStatusLabelAr: string;
    locationDetails?: string;
    dispensedAt?: string;
  };
  scheduleSlots: AdministrationSlot[];
  cdssSafetyWarnings?: {
    type: 'interaction' | 'allergy' | 'dose' | 'renal';
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'high';
  }[];
}

// Continuous Infusion & Titration Step
export interface TitrationStep {
  id: string;
  timestamp: string;
  previousRate: string;
  newRate: string;
  rateUnit: string;
  targetParameter: string; // e.g. "Maintain MAP >= 65 mmHg"
  patientResponseValue?: string; // e.g. "MAP 68 mmHg"
  reason: string;
  changedBy: string;
  verifiedBy?: string;
}

export interface ContinuousInfusionRecord {
  id: string;
  orderId: string;
  medicationName: string;
  genericName: string;
  concentration: string;
  lineLocation: string; // e.g. "Right Internal Jugular CVC - Lumen #1"
  baseRate: string;
  currentRate: string;
  rateUnit: string;
  titrationGoal: string;
  infusionStatus: 'running' | 'paused' | 'titrating' | 'stopped';
  startedAt: string;
  lastTitratedAt: string;
  administeredBy: string;
  verifiedBy: string;
  requiresDualVerification: boolean;
  titrationHistory: TitrationStep[];
}

// Medication Reconciliation (Dedicated Transition Surface)
export type ReconciliationTransitionType =
  | 'admission'
  | 'internal_transfer'
  | 'discharge';

export type ReconciliationDecision =
  | 'continue'
  | 'modify'
  | 'hold'
  | 'discontinue'
  | 'needs_clarification';

export interface ReconciliationItem {
  id: string;
  sourceMedicationName: string;
  sourceDose: string;
  sourceRoute: string;
  sourceFrequency: string;
  sourceIndication: string;
  sourceOrigin: 'patient_reported' | 'pharmacy_dispense_history' | 'prior_discharge_summary';
  decision: ReconciliationDecision;
  encounterMedicationEquivalent?: string;
  clinicalRationale: string;
  reviewedBy: string;
  reviewedAt: string;
}

// Medication Reconciliation Policy (Point 11)
export interface MedicationReconciliationPolicy {
  policyId: string;
  policyName: string;
  transitionType: ReconciliationTransitionType; // 'admission' | 'internal_transfer' | 'discharge'
  documentationRoles: string[]; // e.g. ['Clinical Pharmacist', 'Physician', 'Authorized Clinician']
  approvalModel: 'single_authorized_clinician' | 'dual_physician_pharmacist' | 'attending_physician_only' | 'clinical_pharmacist_with_cosign';
  approvalModelLabelAr: string;
  requiredApprovalRoles: string[];
  transitionSpecificChecklist: {
    checkHomeMedVerification: boolean;
    checkPostDischargeMedPlan: boolean;
    checkTransferOrderDiscontinuation: boolean;
    checkInteractionCheck: boolean;
  };
  policyDescriptionAr: string;
}

export interface MedicationReconciliationRecord {
  id: string;
  encounterId: string;
  transitionType: ReconciliationTransitionType;
  policy: MedicationReconciliationPolicy;
  policyName: string;
  status: 'in_progress' | 'completed' | 'verified';
  documentedBy?: string;
  documentedAt?: string;
  completedBy?: string;
  completedAt?: string;
  items: ReconciliationItem[];
}

// Longitudinal Medication History
export interface MedicationHistoryItem {
  id: string;
  medicationName: string;
  genericName: string;
  dose: string;
  route: string;
  frequency: string;
  status: 'active' | 'completed' | 'discontinued' | 'held';
  period: string;
  indication: string;
  prescribedBy: string;
  discontinueReason?: string;
  sourceEncounter: string;
}
