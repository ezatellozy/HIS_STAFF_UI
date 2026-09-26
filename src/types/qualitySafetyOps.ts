/**
 * HIS — QUALITY, PATIENT SAFETY, ENTERPRISE RISK & INFECTION PREVENTION/CONTROL (QPS & IPC)
 * Operational Types & Domain Definitions
 * Strictly Synthetic Design Preview — No Real Regulatory Reporting or Automated Safety Orders
 * Informed by: SPSC Sentinel Event Policy 2025 (effective 1 Jan 2025), Just Culture principles,
 * Configurable Risk Matrix Profiles, CDC/NHSN & GDIPC Surveillance Profiles.
 */

export type QpsTabKey =
  | 'incidents'
  | 'risks'
  | 'capa_qi'
  | 'ipc_surveillance'
  | 'audits_bundles';

// -----------------------------------------------------------------------------
// 1. PERSONAS & ROLES
// -----------------------------------------------------------------------------
export type QpsRoleKey =
  | 'quality_director'
  | 'safety_officer'
  | 'risk_manager'
  | 'ipc_practitioner'
  | 'unit_champion';

export interface QpsPersona {
  id: string;
  name: string;
  roleTitle: string;
  roleTitleAr: string;
  roleKey: QpsRoleKey;
  department: string;
  licenseOrBadge: string;
  avatarColor: string;
  permissions: string[];
}

// -----------------------------------------------------------------------------
// 2. SPSC SENTINEL EVENT POLICY (Effective 1 Jan 2025) & TIMELINES
// -----------------------------------------------------------------------------
export interface SpscPolicyDeadline {
  policySource: string; // "SPSC Sentinel Event Reporting and Management Policy"
  policyVersion: string; // "v2.0 / 2025"
  effectiveDate: string; // "2025-01-01"
  deadlineType:
    | 'internal_immediate'
    | 'ceo_designee_notification_24h'
    | 'spsc_platform_report_48h'
    | 'rca_cap_submission_30_working_days';
  deadlineValue: number;
  deadlineUnit: 'hours' | 'days' | 'immediate';
  triggerEvent: string; // "Event Discovery Date"
  descriptionAr: string;
  verificationState: 'verified_source' | 'hospital_policy' | 'illustrative_configuration' | 'not_verified';
}

export type SentinelWorkflowStatus =
  | 'reported_event'
  | 'sentinel_candidate'
  | 'criteria_review_pending'
  | 'criteria_met'
  | 'criteria_not_met'
  | 'external_reporting_required'
  | 'external_reporting_not_required'
  | 'policy_not_verified';

export interface SentinelEnumeratedCriterion {
  code: string; // e.g. "SEC-01" to "SEC-27"
  number: number; // 1 to 27
  titleEn: string;
  titleAr: string;
  category: string;
}

export interface SentinelCriteriaProfile {
  profileId: string;
  authority: 'SPSC' | 'HOSPITAL_LOCAL';
  policyName: string; // "SPSC Sentinel Event Reporting and Management Policy"
  version: string; // "V1"
  effectiveDate: string; // "2025-01-01"
  enumeratedCriteria: SentinelEnumeratedCriterion[]; // 27 numbered categories
  generalDefinitionCriterion: {
    code: string; // "SEC-GENERAL"
    titleEn: string;
    titleAr: string;
    definition: string;
  };
  verificationState: 'verified_source' | 'hospital_policy' | 'illustrative_configuration';
}

export interface SentinelCriteriaReview {
  reviewId: string;
  status: SentinelWorkflowStatus;
  reviewedByPersonaId: string;
  reviewedByName: string;
  reviewedAt: string;
  criterionCodeApplied?: string; // e.g. "SEC-04" or "SEC-GENERAL"
  criterionApplied: string;
  policySource: string;
  policyVersion: string;
  decisionNotes: string;
  eventDiscoveryDate: string;
  internalReportingCompleted: boolean;
  ceoNotificationDeadline: string; // 24h from discovery
  ceoNotificationCompleted?: boolean;
  spscPlatformDeadline: string; // 48h from discovery
  spscPlatformStatus: 'not_applicable' | 'prepared_for_review' | 'synthetic_reference_generated';
  rcaCapSubmissionDeadline: string; // 30 working days from discovery
}

// -----------------------------------------------------------------------------
// 3. SAFETY SEVERITY ASSESSMENT PROFILE (Configurable SAC)
// -----------------------------------------------------------------------------
export type SeverityAssessmentCode = 'SAC-1' | 'SAC-2' | 'SAC-3' | 'SAC-4';

export interface SafetySeverityAssessmentProfile {
  profileId: string;
  name: string;
  source: string;
  version: string;
  harmCategories: string[];
  probabilityCategories: string[];
  interpretation: string;
  effectivePeriod: string;
  verificationState: 'verified_source' | 'illustrative_safety_profile';
}

// -----------------------------------------------------------------------------
// 4. PATIENT SAFETY INCIDENT REPORTING & LEARNING (OVR)
// -----------------------------------------------------------------------------
export type IncidentType =
  | 'incident'         // Adverse Event with harm
  | 'near_miss'        // Good catch, caught before reaching patient
  | 'unsafe_condition' // Hazard / Latent condition
  | 'sentinel_event';  // Candidate / confirmed sentinel event

export type IncidentCategory =
  | 'medication_error'
  | 'patient_fall'
  | 'surgical_procedural'
  | 'clinical_delayed_diagnosis'
  | 'equipment_device'
  | 'blood_transfusion'
  | 'hai_infection'
  | 'security_violence'
  | 'documentation_identity';

export type HarmSeverity =
  | 'none'      // No harm
  | 'minor'     // Temporary minor harm, basic first aid, transient
  | 'moderate'  // Temporary harm requiring therapeutic intervention, extended stay
  | 'severe'    // Permanent injury, loss of function, organ damage
  | 'death';    // Catastrophic / Fatal event

export type NccMerpCategory =
  | 'A' // Capacity to cause error
  | 'B' // Error did not reach patient
  | 'C' // Error reached patient, no harm
  | 'D' // Reached patient, required monitoring/intervention to confirm no harm
  | 'E' // Temporary harm requiring intervention
  | 'F' // Temporary harm, initial or prolonged hospitalization
  | 'G' // Permanent patient harm
  | 'H' // Intervention required to sustain life
  | 'I';// Patient death

export type IncidentStatus =
  | 'reported'
  | 'triaged'
  | 'under_investigation'
  | 'rca_in_progress'
  | 'capa_pending'
  | 'effectiveness_review'
  | 'closed';

export type ContributingFactorCategory =
  | 'patient_factors'
  | 'task_technology'
  | 'individual_staff'
  | 'team_factors'
  | 'work_environment'
  | 'organizational_management';

export interface ContributingFactor {
  id: string;
  category: ContributingFactorCategory;
  description: string;
  impactWeight: 'primary' | 'secondary' | 'latent';
}

export interface CausalFactor {
  id: string;
  type: 'system_process' | 'task_technology' | 'team_communication' | 'environmental' | 'organizational';
  statement: string;
  isIndividualBlame: false; // Invariant: system-level accountability, not person-blame
}

export interface RcaInvestigation {
  rcaId: string;
  incidentId: string;
  teamLeader: string;
  teamMembers: string[];
  charteredDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  problemStatement: string;
  eventChronology: Array<{
    time: string;
    event: string;
    actor: string;
  }>;
  fiveWhys: Array<{
    level: number;
    question: string;
    answer: string;
  }>;
  fishboneCategories: {
    people: string[];
    process: string[];
    equipment: string[];
    environment: string[];
    management: string[];
    materials: string[];
  };
  causalFactors: CausalFactor[];
  rootCauses: string[]; // Multiple root causes / system factors
  status: 'chartered' | 'investigating' | 'root_causes_identified' | 'approved';
}

export interface SafetyIncidentCase {
  id: string;
  referenceNumber: string; // e.g. OVR-2025-0101
  incidentType: IncidentType;
  title: string;
  titleAr: string;
  description: string;
  reportedBy: string;
  reporterRole: string;
  reportedAt: string;
  occurredAt: string;
  eventDiscoveryDate: string;
  location: string;
  department: string;
  patientId?: string;
  patientMrn?: string;
  patientName?: string;
  category: IncidentCategory;
  harmLevel: HarmSeverity;
  sacScore: SeverityAssessmentCode;
  nccMerp: NccMerpCategory;
  immediateContainment: string;
  contributingFactors: ContributingFactor[];
  rcaRequired: boolean;
  rcaDetails?: RcaInvestigation;

  // Sentinel Review & SPSC Timeline Governance
  sentinelWorkflowStatus: SentinelWorkflowStatus;
  sentinelReviewDetails?: SentinelCriteriaReview;

  // Synthetic Reporting Reference
  syntheticReportingReference?: {
    referenceStatus: 'external_submission_not_performed' | 'synthetic_external_reporting_reference' | 'prepared_for_review';
    referenceId?: string;
    generatedAt?: string;
    reviewTarget: 'SPSC_PORTAL_SIMULATION' | 'INTERNAL_EXECUTIVE_SIMULATION';
    noticeText: string;
  };

  // Synthetic Regulatory Escalation Reference (No real network submissions)
  regulatoryEscalationSimulated?: {
    isEscalated: boolean;
    escalatedTo: string[];
    escalationTimestamp: string;
    noticeText: string;
  };

  linkedCapaIds: string[];
  status: IncidentStatus;
  lessonsLearned?: string;
  closedAt?: string;
  closedBy?: string;
}

// -----------------------------------------------------------------------------
// 5. CONFIGURABLE RISK MATRIX PROFILES (3x3, 4x4, 5x5)
// -----------------------------------------------------------------------------
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type RiskLikelihood = 1 | 2 | 3 | 4 | 5;
export type RiskConsequence = 1 | 2 | 3 | 4 | 5;

export type RiskDomain =
  | 'clinical'
  | 'operational'
  | 'infection_control'
  | 'medication_safety'
  | 'information_cyber'
  | 'facilities_biomedical'
  | 'governance_regulatory';

export type RiskTreatmentStrategy = 'avoid' | 'mitigate' | 'transfer' | 'accept';

export interface RiskBandDefinition {
  minScore: number;
  maxScore: number;
  level: RiskLevel;
  labelAr: string;
  labelEn: string;
  colorHex: string;
}

export interface RiskMatrixProfile {
  matrixId: string;
  name: string;
  nameAr: string;
  likelihoodLevels: number; // 3, 4, 5
  impactLevels: number;     // 3, 4, 5
  calculationMethod: 'multiplication' | 'matrix_lookup';
  riskBands: RiskBandDefinition[];
  effectiveDate: string;
  policySource: string;
  status: 'active' | 'illustrative_hospital_risk_profile' | 'retired';
}

export interface KeyRiskIndicator {
  name: string;
  nameAr: string;
  threshold: string;
  currentValue: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface RiskRegisterItem {
  id: string;
  riskCode: string; // e.g. RISK-CLIN-001
  title: string;
  titleAr: string;
  description: string;
  domain: RiskDomain;
  identifiedBy: string;
  identifiedDate: string;
  activeMatrixProfileId: string;

  // Inherent Risk
  inherentLikelihood: RiskLikelihood;
  inherentConsequence: RiskConsequence;
  inherentScore: number;
  inherentLevel: RiskLevel;

  existingControls: string[];
  proposedMitigations: string[];

  // Residual Risk
  residualLikelihood: RiskLikelihood;
  residualConsequence: RiskConsequence;
  residualScore: number;
  residualLevel: RiskLevel;

  // Target Risk
  targetLikelihood?: RiskLikelihood;
  targetConsequence?: RiskConsequence;
  targetScore?: number;
  targetLevel?: RiskLevel;

  treatmentStrategy: RiskTreatmentStrategy;
  riskOwner: string;
  targetResolutionDate: string;
  status: 'active' | 'under_review' | 'mitigated' | 'closed';
  keyRiskIndicators: KeyRiskIndicator[];
  lastReviewDate: string;
}

// -----------------------------------------------------------------------------
// 6. ACTION HIERARCHY & CAPA EFFECTIVENESS
// -----------------------------------------------------------------------------
export type CapaType = 'corrective' | 'preventive' | 'quality_improvement';

export type ControlHierarchyType =
  | 'strong_forcing_function'              // Engineering hard-stop / physical lock
  | 'intermediate_standardized_process'   // Dual verification / standardized checklist
  | 'weak_training_policy';                // Lecture / memorandum / policy read

export interface ActionHierarchyProfile {
  profileId: string;
  name: string;
  rules: Array<{
    mechanism: string;
    hierarchyType: ControlHierarchyType;
    sourceAuthority: string;
  }>;
  source: string;
  version: string;
}

export type CapaEffectivenessStatus =
  | 'effectiveness_pending'
  | 'effective'
  | 'partially_effective'
  | 'ineffective'
  | 'reopened';

export interface CapaItem {
  id: string;
  capaCode: string; // e.g. CAPA-2025-001
  title: string;
  titleAr: string;
  type: CapaType;
  sourceOrigin: 'incident_rca' | 'risk_assessment' | 'ipc_audit' | 'clinical_tracer' | 'cbahi_survey';
  sourceReferenceId: string;
  controlHierarchy: ControlHierarchyType;
  hierarchyProfileId: string;
  description: string;
  actionSteps: string[];
  actionOwner: string;
  ownerDepartment: string;
  dueDate: string;
  implementationDate?: string;
  isCompleted: boolean;

  // Effectiveness Verification (completed != effective)
  effectivenessReviewDate: string;
  effectivenessStatus: CapaEffectivenessStatus;
  effectivenessEvidenceReference?: string;
  effectivenessAuditNotes?: string;

  status: 'draft' | 'approved' | 'in_progress' | 'implemented' | 'effectiveness_verified' | 'closed';
}

// -----------------------------------------------------------------------------
// 7. QUALITY INDICATORS & SOURCE INTEGRITY
// -----------------------------------------------------------------------------
export interface QualityIndicatorKpi {
  indicatorId: string;
  code: string; // e.g. KPI-QI-01
  name: string;
  nameAr: string;
  category: 'clinical_effectiveness' | 'patient_safety' | 'infection_prevention' | 'efficiency' | 'patient_experience';
  numerator: string;
  denominator: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  dataSource: string;
  frequency: string;
  unit: '%' | 'per_1000_days' | 'days' | 'ratio' | 'score';
  target: number;
  targetSource: string;
  benchmarkSource: string;
  currentPeriodValue: number;
  previousPeriodValue: number;
  trendDirection: 'improving' | 'deteriorating' | 'stable';
  effectivePeriod: string;
  verificationState: 'verified_source' | 'hospital_configured_indicator' | 'illustrative_indicator';
  status: 'target_met' | 'variance_warning' | 'critical_breach';
  historicalData: Array<{ month: string; value: number }>;
}

export interface FocusPdcaProject {
  id: string;
  code: string;
  title: string;
  titleAr: string;
  teamLeader: string;
  department: string;
  stage: 'find' | 'organize' | 'clarify' | 'understand' | 'select' | 'plan' | 'do' | 'check' | 'act';
  targetMetric: string;
  baselineValue: string;
  targetValue: string;
  currentProgressPercent: number;
  updatedDate: string;
}

// -----------------------------------------------------------------------------
// 8. VERSIONED SURVEILLANCE DEFINITION PROFILES (CDC/NHSN, WHO, GDIPC)
// -----------------------------------------------------------------------------
export type HaiType =
  | 'clabsi'
  | 'cauti'
  | 'ssi'
  | 'vap'
  | 'vae'
  | 'ped_vae'
  | 'mdro_colonization_infection';

export interface SurveillanceDefinitionProfile {
  profileId: string;
  authority: 'WHO_HAI_2024' | 'NHSN_2025' | 'SAUDI_GDIPC_2024' | 'HOSPITAL_LOCAL';
  protocolName: string;
  protocolVersion: string;
  effectiveFrom: string;
  effectiveTo?: string;
  patientPopulation: 'adult' | 'pediatric' | 'neonatal' | 'all';
  careSetting: 'icu' | 'inpatient_ward' | 'or' | 'all';
  surveillanceCategory: HaiType;
  criteria: string[];
  denominatorDefinition: string;
  status: 'active' | 'retired' | 'draft';
}

export type IsolationPrecautionType =
  | 'standard'
  | 'contact'
  | 'droplet'
  | 'airborne'
  | 'protective';

export interface Microorganism {
  name: string;
  category: 'gram_negative' | 'gram_positive' | 'fungal' | 'viral';
  mdroClassification: 'MRSA' | 'CRE' | 'VRE' | 'CR-Acinetobacter' | 'ESBL' | 'C_difficile' | 'None';
  resistancePhenotype: string;
}

export interface HaiSurveillanceCase {
  id: string;
  caseNumber: string; // e.g. HAI-2025-001
  patientId: string;
  patientMrn: string;
  patientName: string;
  patientAge: number;
  patientPopulation: 'adult' | 'pediatric' | 'neonatal';
  wardDepartment: string;
  bedNumber: string;
  haiType: HaiType;
  surveillanceProfileId: string; // Attached profile
  surveillanceProfileVersion: string;

  devicePresent: boolean;
  deviceType?: 'central_line' | 'foley_catheter' | 'mechanical_ventilator' | 'surgical_implant';
  deviceInsertionDate?: string;
  deviceDaysAtEvent?: number;
  eventDate: string;
  organism: Microorganism;
  specimenSource: string;
  nhsnCriteriaMet: boolean;
  nhsnCriteriaSummary: string;

  // IPC Isolation Advisory (does not mutate clinical physician orders)
  assignedIsolation: IsolationPrecautionType;
  precautionReviewRequired: boolean;
  isolationStatus: 'active' | 'discontinued';
  isolationRoom: string;

  antiMicrobialTherapy: string;
  sourceInvestigationNotes: string;
  status: 'suspected' | 'confirmed_hai' | 'colonization_only' | 'ruled_out_community_acquired' | 'resolved';
  confirmedBy: string;
  confirmedDate: string;
}

export interface OutbreakClusterRecord {
  id: string;
  clusterCode: string; // e.g. CLUSTER-2025-01
  title: string;
  titleAr: string;
  organismName: string;
  locationUnit: string;
  detectedDate: string;
  totalCasesLinked: number;
  attackRatePercent: number;
  primaryTransmissionRoute: 'contact_cross_transmission' | 'airborne_droplet' | 'environmental_reservoir';
  epidemicCurve: Array<{ date: string; newCases: number; cumulativeCases: number }>;
  lineListingPatientIds: string[];
  containmentActions: string[];
  status: 'possible_cluster' | 'review_required' | 'criteria_incomplete' | 'contained_monitoring' | 'outbreak_not_verified' | 'declared_resolved';
  resolvedDate?: string;
}

export interface DeviceSurveillanceDenominator {
  unitId: string;
  unitName: string;
  period: string;
  profileId: string;
  centralLineDays: number;
  clabsiCount: number;
  clabsiRatePer1000: number | 'RATE_NOT_CALCULABLE' | 'DENOMINATOR_NOT_VERIFIED';
  urinaryCatheterDays: number;
  cautiCount: number;
  cautiRatePer1000: number | 'RATE_NOT_CALCULABLE' | 'DENOMINATOR_NOT_VERIFIED';
  ventilatorDays: number;
  vapCount: number;
  vapRatePer1000: number | 'RATE_NOT_CALCULABLE' | 'DENOMINATOR_NOT_VERIFIED';
  patientDaysTotal: number;
}

// -----------------------------------------------------------------------------
// 9. HAND HYGIENE & BUNDLE MEASUREMENT PROFILES
// -----------------------------------------------------------------------------
export type HandHygieneMoment =
  | 'moment_1_before_patient'
  | 'moment_2_before_aseptic'
  | 'moment_3_after_body_fluid'
  | 'moment_4_after_patient'
  | 'moment_5_after_surroundings';

export type HandHygieneAction =
  | 'handrub_alcohol'
  | 'handwash_soap_water'
  | 'missed_opportunity'
  | 'gloves_without_hygiene';

export interface HandHygieneAuditSession {
  id: string;
  auditDate: string;
  auditorName: string;
  department: string;
  professionalCategory: 'physician' | 'nurse' | 'allied_health' | 'housekeeping' | 'student';
  moment: HandHygieneMoment;
  actionTaken: HandHygieneAction;
  isCompliant: boolean;
  notes?: string;
}

export interface BundleMeasurementProfile {
  profileId: string;
  bundleType: string;
  eligibleElements: string[];
  applicableElements: string[];
  scoringMethod: 'all_or_nothing' | 'percentage_composite' | 'weighted';
  notApplicableBehavior: 'exclude' | 'count_as_pass' | 'count_as_fail';
  notObservedBehavior: 'exclude' | 'count_as_fail';
  source: string;
  version: string;
}

export type BundleElementStatus = 'compliant' | 'non_compliant' | 'not_applicable' | 'not_observed';

export interface CareBundleAuditItem {
  id: string;
  bundleType: 'clabsi_insertion' | 'clabsi_maintenance' | 'cauti_insertion' | 'cauti_maintenance' | 'vap_prevention' | 'ssi_prevention';
  measurementProfileId: string;
  patientId: string;
  patientMrn: string;
  unit: string;
  auditDate: string;
  auditor: string;
  checklistElements: Array<{
    elementKey: string;
    elementTextAr: string;
    status: BundleElementStatus;
  }>;
  allElementsCompliant: boolean;
  compliancePercent: number;
}

export interface ClinicalSafetyTracer {
  id: string;
  tracerType: 'medication_management' | 'infection_control_environment' | 'patient_identification' | 'surgical_safety';
  unit: string;
  tracerDate: string;
  surveyor: string;
  findingsSummary: string;
  nonCompliantPoints: string[];
  immediateRemediation: string;
  scorePercent: number;
}

// -----------------------------------------------------------------------------
// 10. QPS SHELL STATE & HISTORY
// -----------------------------------------------------------------------------
export interface QpsActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  domain: 'incident' | 'risk' | 'capa' | 'ipc' | 'audit';
  referenceId: string;
  details: string;
}

export interface QualitySafetyOpsState {
  activePersona: QpsPersona;
  activeRiskMatrixProfile: RiskMatrixProfile;
  availableRiskMatrixProfiles: RiskMatrixProfile[];
  sentinelCriteriaProfile?: SentinelCriteriaProfile;
  surveillanceProfiles: SurveillanceDefinitionProfile[];
  incidents: SafetyIncidentCase[];
  risks: RiskRegisterItem[];
  capas: CapaItem[];
  kpis: QualityIndicatorKpi[];
  pdcaProjects: FocusPdcaProject[];
  haiCases: HaiSurveillanceCase[];
  clusters: OutbreakClusterRecord[];
  deviceDenominators: DeviceSurveillanceDenominator[];
  handHygieneAudits: HandHygieneAuditSession[];
  bundleAudits: CareBundleAuditItem[];
  tracers: ClinicalSafetyTracer[];
  activityLogs: QpsActivityLog[];
}
