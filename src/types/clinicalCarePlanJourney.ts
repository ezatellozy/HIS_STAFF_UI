/**
 * AXIS 9 & AXIS 10: CARE PLAN, EDUCATION, JOURNEY & HANDOVER
 * Pure UI/UX Mock Architecture Models (FHIR-informed conceptual mapping)
 * No backend engines, no workflow/task engines, no database/APIs.
 */

import { HospitalDepartment } from './his';

// ============================================================================
// AXIS 9: CARE PLAN & EDUCATION ARCHITECTURE
// ============================================================================

/**
 * Configurable Care Team Discipline / Role
 * Country-agnostic, not hardcoded.
 */
export type CarePlanDiscipline =
  | 'physician'
  | 'nursing'
  | 'clinical_pharmacy'
  | 'physiotherapy'
  | 'clinical_nutrition'
  | 'respiratory_therapy'
  | 'social_work'
  | 'occupational_therapy'
  | 'case_management'
  | 'other_discipline';

export interface ConfiguredDisciplineInfo {
  id: CarePlanDiscipline;
  labelAr: string;
  labelEn: string;
  colorBadge: string;
}

/**
 * Care Plan Goal Status (Configurable Policy)
 */
// Independent Care Plan Goal Dimensions (Section 8)
export type GoalLifecycleStatus =
  | 'proposed'
  | 'planned'
  | 'accepted'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'entered_in_error'
  | 'rejected';

export type GoalAchievementStatus =
  | 'in_progress'
  | 'improving'
  | 'worsening'
  | 'no_change'
  | 'achieved'
  | 'sustaining'
  | 'not_achieved'
  | 'no_progress'
  | 'not_attainable';

// Backwards compatibility alias
export type CarePlanGoalStatus = GoalLifecycleStatus | GoalAchievementStatus | 'partially_achieved' | 'achieved' | 'revised' | 'not_achieved' | 'discontinued';

/**
 * Care Plan Lifecycle Status (Configurable Policy)
 */
export type CarePlanLifecycleStatus =
  | 'draft'
  | 'active'
  | 'under_review'
  | 'on_hold'
  | 'completed'
  | 'discontinued';

/**
 * Care Plan Priority
 */
export type CarePlanPriority = 'high' | 'medium' | 'low';

/**
 * Care Plan Intervention Status
 */
export type CarePlanInterventionStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'discontinued';

/**
 * Linked Clinical Context Reference (Not duplicating source of truth)
 */
export interface LinkedClinicalReference {
  type: 'problem' | 'diagnosis' | 'observation' | 'result' | 'medication' | 'order' | 'assessment';
  id: string;
  label: string;
  detail?: string;
  category?: string;
}

/**
 * Structured Care Plan Intervention (Distinct from Order and Future Task)
 */
export interface CarePlanIntervention {
  id: string;
  actionTitleAr: string;
  actionTitleEn?: string;
  description?: string;
  discipline: CarePlanDiscipline;
  ownerName?: string;
  frequencyOrTiming?: string;
  status: CarePlanInterventionStatus;
  linkedOrderId?: string; // Optional reference if clinical order exists in Axis 6
  notes?: string;
}

/**
 * Structured Goal (Distinct from Intervention and Outcome)
 */
export interface CarePlanGoal {
  id: string;
  descriptionAr: string;
  descriptionEn?: string;
  targetMetric?: string; // e.g., "SpO2 > 94% on room air", "Pain score < 3/10", "Ambulate 20 meters"
  targetDate?: string;
  priority: CarePlanPriority;
  status: CarePlanGoalStatus; // for backwards compatibility
  // Independent Goal Dimensions (Section 8)
  lifecycleStatus?: GoalLifecycleStatus;
  achievementStatus?: GoalAchievementStatus;
  statusReason?: string;
  currentProgressPercent: number; // 0 to 100
  latestProgressSummary?: string;
  lastAssessedAt?: string;
  lastAssessedBy?: string;
  nextReviewDate?: string;
  interventions: CarePlanIntervention[];
}

/**
 * Care Plan Multidisciplinary Focus Item
 */
export interface MultidisciplinaryCarePlanItem {
  id: string;
  titleAr: string;
  titleEn?: string;
  category: 'medical' | 'nursing' | 'rehabilitation' | 'nutrition' | 'respiratory' | 'discharge_readiness';
  discipline: CarePlanDiscipline;
  ownerName: string;
  ownerRole: string;
  priority: CarePlanPriority;
  lifecycleStatus: CarePlanLifecycleStatus;
  linkedReferences: LinkedClinicalReference[];
  goals: CarePlanGoal[];
  createdAt: string;
  updatedAt: string;
  provenance: {
    createdBy: string;
    department: HospitalDepartment;
    encounterId?: string;
    reviewScheduledAt?: string;
  };
}

// ----------------------------------------------------------------------------
// PATIENT & FAMILY EDUCATION ARCHITECTURE
// ----------------------------------------------------------------------------

export type EducationAudience =
  | 'patient'
  | 'family_caregiver'
  | 'legal_guardian'
  | 'patient_and_caregiver';

export type EducationMethod =
  | 'verbal_discussion'
  | 'written_brochure'
  | 'audio_visual'
  | 'practical_demonstration'
  | 'interactive_app';

export type TeachBackComprehensionStatus =
  | 'demonstrated_understanding'
  | 'partial_understanding'
  | 'needs_reinforcement'
  | 'unable_to_assess'
  | 'refused';

export interface EducationRecord {
  id: string;
  topicCategory: 'medication' | 'procedure_surgery' | 'wound_care' | 'diet_nutrition' | 'disease_management' | 'discharge_care' | 'medical_equipment';
  topicTitleAr: string;
  topicTitleEn?: string;
  specificContentSummary: string;
  audience: EducationAudience;
  audienceName?: string;
  method: EducationMethod;
  languageUsed: string;
  interpreterUsed: boolean;
  interpreterDetails?: string;
  materialsProvided?: string[]; // Brochures, links, printed discharge leaflets
  educatorName: string;
  educatorRole: string;
  documentedAt: string;
  teachBackAssessment?: {
    conducted: boolean;
    comprehension: TeachBackComprehensionStatus;
    notes?: string;
    demonstratedSkills?: string;
  };
  patientQuestionsOrConcerns?: string;
  followUpEducationNeeded: boolean;
  followUpEducationFocus?: string;
}

// ----------------------------------------------------------------------------
// DISCHARGE READINESS & FOLLOW-UP PLANNING (Axis 9)
// ----------------------------------------------------------------------------

export type DischargeReadinessDomain =
  | 'clinical_stability'
  | 'medication_reconciliation'
  | 'patient_education'
  | 'follow_up_appointments'
  | 'home_equipment_supplies'
  | 'functional_mobility'
  | 'pending_results_orders'
  | 'transport_social_support';

export interface DischargeReadinessCheckItem {
  id: string;
  domain: DischargeReadinessDomain;
  labelAr: string;
  labelEn?: string;
  status: 'ready' | 'in_progress' | 'not_started' | 'not_applicable';
  criticalForDischarge: boolean;
  responsibleDiscipline: CarePlanDiscipline;
  notes?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface FollowUpPlanItem {
  id: string;
  specialtyOrClinic: string;
  recommendedTimeframe: string; // e.g. "في خلال أسبوع", "بعد 14 يوم", "عند الحاجة"
  reasonAr: string;
  prerequisites?: string[]; // e.g. "إعادة تحليل الكرياتينين قبل الموعد بيومين"
  contactOrInstructions?: string;
  status: 'planned' | 'communicated_to_patient' | 'booking_requested';
}

// ============================================================================
// AXIS 10: JOURNEY & STRUCTURED HANDOVER ARCHITECTURE
// ============================================================================

/**
 * Actual Clinical Journey Event Type (Distinct from Requests/Orders)
 */
export type JourneyEventType =
  | 'arrival_registration'
  | 'triage_assessment'
  | 'encounter_start'
  | 'clinical_location_move'
  | 'internal_ward_transfer'
  | 'icu_admission'
  | 'procedure_performed'
  | 'consultation_completed'
  | 'significant_milestone'
  | 'external_transfer_dispatched'
  | 'disposition_decided'
  | 'discharge_completed'
  | 'encounter_end';

export interface JourneyActualEvent {
  id: string;
  eventType: JourneyEventType;
  titleAr: string;
  titleEn?: string;
  category: 'encounter' | 'location' | 'procedure' | 'transfer' | 'milestone' | 'disposition';
  effectiveDateTime: string;
  encounterId: string;
  fromLocation?: string;
  toLocation?: string;
  responsibleTeamOrService: string;
  clinicianName: string;
  clinicianRole: string;
  clinicalSummary: string;
  isMilestone: boolean;
  relatedRequestId?: string; // Links back to Axis 6 request if one existed
  sourceContext: 'ER Care' | 'Inpatient CCU' | 'Cath Lab' | 'Ward' | 'Surgical Suite' | 'Outpatient';
}

/**
 * Structured Handover Profile / Template (Country-agnostic, configurable)
 */
export type HandoverTemplateType = 'SBAR' | 'ISBAR' | 'SOAP' | 'IPASS' | 'CUSTOM_PROFILE';

export type HandoverContextType =
  | 'shift_change'
  | 'internal_transfer'
  | 'icu_stepdown'
  | 'or_pacu_transfer'
  | 'external_transfer'
  | 'service_consultation';

export type HandoverStatus =
  | 'draft'
  | 'ready_to_present'
  | 'sent_presented'
  | 'received'
  | 'acknowledged'
  | 'completed';

export interface SbarHandoverContent {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export interface StructuredHandoverDocument {
  id: string;
  contextType: HandoverContextType;
  templateType: HandoverTemplateType;
  status: HandoverStatus;
  encounterId: string;
  createdAt: string;
  handoverTime: string;
  acknowledgedAt?: string;

  // Sending & Receiving Provenance (Generic Clinician/Team, not hardcoded doctor-to-doctor)
  sendingClinician: string;
  sendingClinicianRole: string;
  sendingTeamOrUnit: string;
  receivingClinician?: string;
  receivingClinicianRole?: string;
  receivingTeamOrUnit: string;

  // Patient Clinical Context at Handover (Referenced from existing data, not un-synced duplicates)
  referencedContext: {
    currentLocation: string;
    activeDiagnosis: string;
    allergies: string[];
    resuscitationStatus: string;
    activeInfusionsOrLines: string[];
    keyVitalSignSnapshot: string;
    pendingResultsOrRequests: string[];
    safetyPrecautions: string[];
  };

  // Structured Content (SBAR or configured breakdown)
  content: SbarHandoverContent;

  // Pending Actions & Escalation Watch (Readiness for future Work Items)
  actionItemsToFollowUp: {
    id: string;
    description: string;
    priority: 'stat' | 'urgent' | 'routine';
    assignedDiscipline: string;
  }[];

  escalationConcerns?: string;
  provenanceSource: string;

  // Receiver Opportunity for Questions & Clarifications (Item 3: Two-way communication)
  receiverDiscussion?: {
    questionsRaised?: string;
    clarificationsProvided?: string;
    discussionNotes?: string;
    outstandingConcerns?: string;
    documentedBy?: string;
    documentedAt?: string;
  };

  // Configured Handover Verification / Interaction Profile (Item 3 & Scenario H)
  handoverProfile?: {
    profileId: string;
    profileNameAr: string;
    requiresReadBack: boolean; // Documented read-back ONLY when required by selected profile
    readBackReasonAr?: string; // e.g., "تسليم شفوي هاتفي", "انتقال رعاية عالي الخطورة (OR to ICU)", "تسليم نتائج حرجة"
    readBackStatus?: 'documented_confirmed' | 'not_required_by_profile' | 'pending';
    readBackNotes?: string;
  };
}
