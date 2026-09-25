import { HospitalDepartment, StaffRole } from './his';

export type ClinicalWorkArea = HospitalDepartment | 'my_work' | 'clinical_utilities' | 'patient_access_adt' | 'laboratory_ops' | 'radiology_ops' | 'pharmacy_ops' | 'blood_bank_ops' | 'supply_chain_ops' | 'procurement_ops' | 'finance_ap_ops' | 'general_ledger_ops' | 'treasury_ops' | 'revenue_cycle_ops' | 'cssd_ops' | 'biomedical_ops' | 'him_ops';

export interface WorkspaceOriginState {
  workArea: ClinicalWorkArea;
  filter?: string;
  selectedId?: string;
  searchQuery?: string;
  tab?: string;
  originType?: 'unit_board' | 'my_work' | 'clinical_utilities' | 'general';
  boardType?: 'er' | 'icu' | 'ward' | 'or';
  activeView?: string;
  activeFilter?: string;
  selectedWard?: string;
  selectedTheatre?: string;
  selectedPatientId?: string;
  scrollPosition?: number;
  utilityTab?: 'consults' | 'handovers' | 'messages' | 'notifications';
  utilitySelectedId?: string;
  utilityFilter?: string;
  utilitySearch?: string;
}

export type ClinicalActivity =
  | 'summary'
  | 'timeline'
  | 'notes'
  | 'vitals'
  | 'orders'
  | 'results'
  | 'medications'
  | 'history_assessment'
  | 'problems'
  | 'care_plan';

export type TransitionStatus =
  | 'requested'
  | 'pending_review'
  | 'accepted'
  | 'bed_assigned'
  | 'ready_for_transport'
  | 'transferred';

export interface CareTransitionRequest {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  fromLocation: string; // e.g., "ER - Bed 03 (Acute)"
  toLocation: string;   // e.g., "ICU - Bed 01" or "Medical Ward 3A"
  reason: string;
  priority: 'stat' | 'urgent' | 'routine';
  requestedBy: string;
  requestedAt: string;
  status: TransitionStatus;
  receivingPhysician?: string;
  assignedBedNumber?: string;
  sbarHandoff?: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  transportStaff?: string;
  updatedAt?: string;
}

export interface ClinicalTask {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  careArea: HospitalDepartment;
  locationLabel: string;
  title: string;
  description: string;
  taskType:
    | 'review_result'
    | 'sign_note'
    | 'pending_order'
    | 'consultation'
    | 'med_due'
    | 'handoff'
    | 'vital_check';
  severity: 'critical' | 'high' | 'moderate' | 'routine';
  assignedRole: 'doctor' | 'nurse' | 'all';
  dueDate: string;
  isOverdue: boolean;
  status: 'pending' | 'completed' | 'in_progress';
  actionTargetActivity?: ClinicalActivity;
}

export interface ClinicalFormDefinition {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'admission' | 'progress' | 'risk_assessment' | 'consent' | 'transition';
  specialty?: string;
  suggestedContexts: HospitalDepartment[];
  isCustom?: boolean;
  descriptionAr: string;
  lastUpdated?: string;
}

// -------------------------------------------------------------
// AXIS 1: CLINICAL OVERVIEW & SNAPSHOT TYPES
// -------------------------------------------------------------

export interface ActiveCareTeamMember {
  id: string;
  name: string;
  role: 'attending_physician' | 'primary_nurse' | 'consultant' | 'clinical_pharmacist' | 'case_manager' | 'anesthesiologist' | 'surgeon';
  roleLabelAr: string;
  roleLabelEn: string;
  department: string;
  contactExtension?: string;
  isPrimaryContact?: boolean;
}

export interface ActiveCareTeam {
  members: ActiveCareTeamMember[];
  shiftLabel: string;
  lastUpdated: string;
}

export interface TriageAcuityAssessment {
  acuityLevel: 1 | 2 | 3 | 4 | 5;
  acuityLabelAr: string;
  acuityLabelEn: string;
  triageProfile: string; // e.g. "Configured 5-Tier Acuity Profile (CTAS / ESI / MTS / ATS / Local Hospital Standard)"
  colorCode: string;
  chiefComplaint: string;
  onset: string;
  arrivalTime: string;
  timeToDoctorMinutes?: number;
  triageNurse: string;
  dispositionStatus: 'undecided' | 'admit_ward' | 'admit_icu' | 'transfer_or' | 'discharge_home' | 'observe';
}

export interface EarlyWarningDeteriorationScore {
  scoreSystemName: string; // Generic: "Early Warning / Clinical Deterioration Score"
  activeProfile: string;   // e.g. "Configured Profile: NEWS2" (Ready for PEWS, MEWS, or Hospital Custom)
  scoreValue: number;
  maxScore: number;
  riskCategory: 'low' | 'low_medium' | 'medium' | 'high';
  riskLabelAr: string;
  riskLabelEn: string;
  actionRecommendationAr: string;
  lastCalculatedAt: string;
  calculatedBy: string;
  calculationMethod: 'Auto-Derived from Clinical Observations' | 'Clinician Bedside Assessment';
}

export type CriticalResultCommunicationMethod =
  | 'telephone'
  | 'secure_messaging'
  | 'in_person'
  | 'ehr_critical_alert'
  | 'vocera_badge';

export type CriticalResultState =
  | 'unreviewed'
  | 'awaiting_acknowledgement'
  | 'acknowledged'
  | 'communication_documented'
  | 'read_back_documented'
  | 'escalated';

export interface ConfiguredCriticalResultPolicy {
  policyName: string; // e.g. "Configured Critical Result Communication Policy"
  qualifyingCriteria?: string; // What qualifies as a critical/significant result
  responsibleSenderRole?: string; // Responsible sender role
  responsibleRecipientRole?: string; // Responsible recipient/team
  reportingTargetMinutes?: number; // Mock Configured Policy Example (not a global rule)
  reportingTargetLabel?: string; // e.g. "مثال سياسة سريرية معدّة (Mock Configured Policy Example: 30 دقيقة)"
  escalationTargetMinutes?: number; // Mock Configured Policy Example
  escalationTargetRole?: string; // Configured alternate responsible recipient (NOT hardcoded Chair)
  allowedMethods: CriticalResultCommunicationMethod[];
  requiresAcknowledgement: boolean; // Acknowledgement requirement
  requiresReadBack: boolean; // Read-back requirement
  escalationBehavior?: string; // Configured escalation behavior
}

export interface CriticalResultAlert {
  id: string;
  testName: string;
  testTechnicalCode?: string; // LOINC metadata (e.g. "LOINC: 42757-5")
  category: 'lab' | 'radiology' | 'pathology';
  value: string;
  unit: string;
  referenceRange: string;
  state: CriticalResultState;
  escalationSlaPolicy: {
    targetMinutes: number; // Mock Configured Policy Example
    policyLabel: string;
    isMockConfiguredExample?: boolean;
  };
  communicationPolicy: ConfiguredCriticalResultPolicy;
  reportedAt: string;
  reportedBy: string;
  reporterRole?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  communicationMethod?: CriticalResultCommunicationMethod;
  recipientName?: string;
  recipientRole?: string;
  readBackConfirmed?: boolean;
  communicationTimestamp?: string;
  communicationNotes?: string;
  // Policy-driven Escalation fields (No hardcoded Chair destination)
  primaryResponsibleRecipient?: string;
  alternateResponsibleRecipient?: string;
  alternateCommunicationMethod?: CriticalResultCommunicationMethod;
  escalationState?: 'normal' | 'due' | 'escalated_completed' | 'not_applicable';
  escalationNotes?: string;
}

export interface ClinicalDiagnosisEntry {
  id: string;
  conditionName: string;
  clinicalTerminology: {
    system: string; // e.g. "Configured Clinical Terminology (SNOMED CT Example)"
    code: string;
    display: string;
  };
  classificationProfile: {
    profileName: string; // e.g. "Configured Classification Profile (ICD-10 Example / ICD-11 Ready)"
    code: string;
    category: string;
  };
  diagnosisType: 'encounter_principal' | 'encounter_secondary' | 'longitudinal_chronic';
  verificationStatus: 'confirmed' | 'provisional' | 'differential';
  notes?: string;
}

export type MedicationVerificationPolicyType =
  | 'no_additional_verification'
  | 'single_clinician_verification'
  | 'co_sign_required'
  | 'dual_independent_verification';

export interface MedicationVerificationPolicy {
  policyType: MedicationVerificationPolicyType;
  policyLabelAr: string;
  policyLabelEn: string;
  requiresDualSignOff: boolean;
  requiresWitnessForWaste: boolean;
  governingPolicy: string; // e.g. "Hospital Medication Verification Policy (Configurable by Drug Class)"
}

// -------------------------------------------------------------
// AXIS 2: VITALS & OBSERVATIONS FLOWSHEET TYPES
// -------------------------------------------------------------

export type ObservationValueState = 'normal' | 'abnormal' | 'critical' | 'amended';
export type ObservationTrend = 'up' | 'down' | 'stable';
export type VitalsCategoryTab =
  | 'all'
  | 'core'
  | 'anthropometrics'
  | 'hemodynamics'
  | 'respiratory'
  | 'neuro'
  | 'scores'
  | 'fluids';

export interface AnthropometricRecord {
  heightCm: number;
  weightKg: number;
  bmi: number;
  bsaM2?: number;
  measuredAt: string;
  measuredBy: string;
  measuredByRole: string;
  provenanceSource: 'Measured at Encounter Baseline' | 'Bedside Electronic Scale' | 'Self-Reported';
}

export type ObservationAbsenceReason =
  | 'not_recorded'
  | 'not_performed'
  | 'temporarily_unavailable'
  | 'unable_to_obtain'
  | 'patient_unavailable'
  | 'device_source_unavailable'
  | 'other_configured_reason';

export interface ObservationAbsenceContext {
  isAbsent: boolean;
  reasonCode: ObservationAbsenceReason;
  reasonLabelAr: string;
  reasonLabelEn: string;
  documentationNote?: string;
}

export interface ObservationReading<T = number | string> {
  value: T;
  unit: string;
  recordedAt: string;
  recordedBy: string;
  recordedByRole?: string; // Any authorized clinician (Doctor, Nurse, RRT, etc.)
  measuredBy?: string;
  measuredByRole?: string;
  verifiedBy?: string;
  verifiedByRole?: string;
  state: ObservationValueState;
  trend?: ObservationTrend;
  method?: string;
  derivationType?: 'measured' | 'calculated_derived' | 'device_synced';
  deviceSource?: string;
  amendedReason?: string;
  priorValue?: T;
  // Observation missing-data semantics (Missing != 0, Missing != Normal)
  absenceContext?: ObservationAbsenceContext;
}

// Code Status / Resuscitation Status Provenance Model (Item 5: Source-Neutral Provenance)
export type CodeStatusAuthoritativeSourceType =
  | 'clinical_physician_order'
  | 'advance_directive_living_will'
  | 'surrogate_decision'
  | 'resuscitation_registry'
  | 'institutional_default_policy'
  | 'emergency_clinician_determination'
  | 'documented_goals_of_care_record'
  | 'active_clinical_order'
  | 'advance_directive'
  | 'other_configured_authoritative_source'
  | 'source_unavailable';

export interface CodeStatusProvenance {
  patientId: string;
  resuscitationStatus: string; // e.g. "Full Code (إنعاش كامل)", "DNR (عدم الإنعاش)", "Modified Code"
  resuscitationCodeKey: 'FULL_CODE' | 'DNR' | 'MODIFIED_CODE' | 'DNI_ONLY';
  sourceType: CodeStatusAuthoritativeSourceType;
  sourceTypeLabelAr: string;
  sourceTypeLabelEn?: string;
  sourceReferenceId?: string; // e.g., "ORD-RESUS-2026-004" or "ADV-DIR-891"
  orderingOrDocumentingClinician?: string;
  clinicianRole?: string;
  documentedAt?: string;
  clinicalDiscussionNotes?: string;
  reviewDate?: string;
  governingPolicyLabel?: string;
  isMockOperationalProvenance?: boolean;
}

export interface CoreVitalsRecord {
  temperature: ObservationReading<number>;
  heartRate: ObservationReading<number>;
  respiratoryRate: ObservationReading<number>;
  bpSystolic: ObservationReading<number>;
  bpDiastolic: ObservationReading<number>;
  meanArterialPressure: ObservationReading<number>;
  oxygenSaturation: ObservationReading<number>;
  oxygenDeliveryMethod?: string; // Room Air, Nasal Prongs 2L/min, Venturi 40%, etc.
  heightCm?: ObservationReading<number>;
  weightKg?: ObservationReading<number>;
  bmi?: ObservationReading<number>;
  painScore?: ObservationReading<number>;
  painScaleType?: 'NRS_0_10' | 'WONG_BAKER' | 'CPOT_ICU' | 'FLACC';
  bloodGlucose?: ObservationReading<number>; // mg/dL
  bloodGlucoseContext?: 'fasting' | 'random' | 'post_prandial' | 'pre_meal';
}

export interface HemodynamicsRecord {
  meanArterialPressure: ObservationReading<number>;
  cvpMmHg?: ObservationReading<number>;
  arterialLineSys?: ObservationReading<number>;
  arterialLineDia?: ObservationReading<number>;
  cardiacOutput?: ObservationReading<number>; // L/min
  cardiacIndex?: ObservationReading<number>; // L/min/m2
  strokeVolumeVariation?: ObservationReading<number>; // %
  bloodLactate?: ObservationReading<number>; // mmol/L
}

export interface VentilatorObservationRecord {
  ventMode: ObservationReading<string>; // e.g. "SIMV", "Pressure Support (PSV)", "Volume Control (VCV)", "Weaning/CPAP"
  fio2Percent: ObservationReading<number>; // %
  peepCmH2O: ObservationReading<number>; // cmH2O
  tidalVolumeActualMl: ObservationReading<number>; // ml
  peakPressureCmH2O: ObservationReading<number>; // cmH2O
  minuteVentilationLMin?: ObservationReading<number>; // L/min
  endTidalCO2?: ObservationReading<number>; // mmHg
}

export interface NeuroObservationRecord {
  gcsTotal: ObservationReading<number>; // /15
  gcsEye: ObservationReading<number>; // /4
  gcsVerbal: ObservationReading<number>; // /5
  gcsMotor: ObservationReading<number>; // /6
  pupilRightSizeMm: ObservationReading<number>;
  pupilRightReaction: ObservationReading<string>; // "brisk", "sluggish", "fixed"
  pupilLeftSizeMm: ObservationReading<number>;
  pupilLeftReaction: ObservationReading<string>;
  motorPowerArms: ObservationReading<string>; // "5/5 bilaterally"
  motorPowerLegs: ObservationReading<string>;
  sedationRassScore?: ObservationReading<number>; // -5 to +4
}

export interface FluidIntakeItem {
  type: string; // "IV Crystalloid (0.9% NaCl)", "IV Antibiotic", "Enteral Feed", "Oral"
  volumeMl: number;
}

export interface FluidOutputItem {
  type: string; // "Urine (Catheter)", "NG Drainage", "Surgical Drain #1", "Emesis"
  volumeMl: number;
}

export interface FluidBalanceHourlySlot {
  slotTime: string;
  intakes: FluidIntakeItem[];
  outputs: FluidOutputItem[];
  totalIntakeMl: number;
  totalOutputMl: number;
  slotNetBalanceMl: number;
  running24hBalanceMl: number;
  urineMlPerKgPerHour?: number;
}

