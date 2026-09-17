import { HospitalDepartment } from './his';
import { ClinicalActivity, ClinicalWorkArea } from './clinicalWorkspace';

export type WorkItemType =
  | 'consultation_review'
  | 'admission_review'
  | 'transfer_review'
  | 'result_review'
  | 'critical_result_followup'
  | 'medication_reconciliation'
  | 'medication_verification'
  | 'handover_receipt'
  | 'care_plan_review'
  | 'patient_education_followup'
  | 'discharge_readiness_review'
  | 'documentation_completion';

// Source / Clinical Urgency coming from original order/request (STAT / Urgent / Routine)
export type SourceUrgency = 'stat' | 'urgent' | 'routine' | 'asap' | 'timed';

// Operational Priority inside Queue (Critical / High / Medium / Low)
export type ClinicalPriority = 'critical' | 'urgent' | 'priority' | 'routine';
export type OperationalPriority = ClinicalPriority;

export type DueState = 'normal' | 'due_soon' | 'overdue' | 'no_target';

export type WorkItemOwnershipPolicy =
  | 'self_claim'
  | 'direct_assignment'
  | 'supervisor_triage'
  | 'auto_assignment'
  | 'team_shared'
  | 'no_claim_required';

export type OperationalWorkStatus =
  | 'new'
  | 'waiting_in_queue'
  | 'unassigned'
  | 'assigned'
  | 'claimed'
  | 'accepted'
  | 'in_progress'
  | 'waiting_for_info'
  | 'waiting_for_patient'
  | 'waiting_external'
  | 'completed'
  | 'returned'
  | 'cancelled_source';

export type SourceResourceType =
  | 'consultation_request'
  | 'admission_order'
  | 'transfer_order'
  | 'lab_result'
  | 'microbiology_result'
  | 'radiology_study'
  | 'medication_order'
  | 'handover_record'
  | 'clinical_note'
  | 'care_plan_goal';

export type SourceStatus =
  | 'submitted'
  | 'active'
  | 'pending_specimen'
  | 'resulted_critical'
  | 'resulted_abnormal'
  | 'pending_verification'
  | 'pending_transfer'
  | 'cancelled'
  | 'amended'
  | 'closed';

export type WorkItemAllowedAction =
  | 'claim'
  | 'release'
  | 'assign'
  | 'reassign'
  | 'accept'
  | 'start_review'
  | 'request_info'
  | 'open_patient'
  | 'complete'
  | 'return'
  | 'acknowledge'
  | 'refresh_source';

export interface WorkItemActivityEvent {
  id: string;
  timestamp: string;
  eventType: 'created' | 'routed' | 'claimed' | 'assigned' | 'started' | 'waiting' | 'reassigned' | 'completed' | 'cancelled';
  actorName: string;
  actorRole: string;
  description: string;
  outcomeNotes?: string;
}

export interface WorkItemPatientContext {
  id: string;
  mrn: string;
  nameAr: string;
  nameEn: string;
  age: number;
  gender: 'M' | 'F';
  encounterId: string;
  encounterType: 'emergency' | 'inpatient' | 'outpatient';
  currentLocation: string;
  department: HospitalDepartment;
  bedCode?: string;
  allergies?: string[];
  criticalFlags?: string[];
}

export interface TargetStepContext {
  targetAxis: ClinicalActivity;
  axisNameAr: string;
  stepTitleAr: string;
  stepDescriptionAr: string;
  recommendedActionAr: string;
  targetSubView?: string;
  sourceResourceId: string;
}

export interface CriticalResultPolicyConfig {
  policyName: string;
  communicationMethod: 'direct_acknowledgment' | 'readback_documented' | 'mandatory_escalation_call';
  escalationTimeMinutes: number;
  policyDescriptionAr: string;
}

export interface WorkItemRecord {
  id: string;
  type: WorkItemType;
  title: string;
  description: string;
  patient: WorkItemPatientContext | null; // Supports non-patient operational tasks when null
  workArea: ClinicalWorkArea;
  sourceModule: string;
  sourceResourceType: SourceResourceType;
  sourceResourceId: string;
  sourceStatus: SourceStatus;
  sourceRequestedBy: {
    name: string;
    role: string;
    department: string;
    requestedAt: string;
  };
  workflowProcess: string;
  currentStep: string;
  
  // Concept A: Clinical / Source Urgency
  sourceUrgency?: SourceUrgency;

  // Concept B: Operational Queue Work Priority
  priority: ClinicalPriority;

  // Concept C: Time Model & Due Target
  sourceEventTimestamp?: string;
  createdAt: string;
  createdTimestamp: number;
  configuredDueTarget?: string;
  dueAt: string | null;
  dueTimestamp: number | null;
  dueState: DueState;
  waitingDuration: string;
  lastUpdatedAt?: string;

  // Operational State & Ownership
  operationalStatus: OperationalWorkStatus;
  ownershipPolicy: WorkItemOwnershipPolicy;
  queueId: string;
  queueName: string;
  assignedTo: { id: string; name: string; role: string } | null;
  claimedBy: { id: string; name: string; role: string; claimedAt?: string } | null;

  // Minimal Clinical Context (Not a Mini-EHR)
  clinicalContextSummary: {
    primaryDiagnosis?: string;
    clinicalQuestion?: string;
    vitalSigns?: string;
    relevantLab?: string;
    keyFindings?: string;
    redFlags?: string[];
  };

  // Step-Aware Deep Linking
  targetWorkspaceAxis: ClinicalActivity;
  targetWorkspaceOptions?: {
    tab?: string;
    selectedId?: string;
    filter?: string;
  };
  targetStepContext?: TargetStepContext;

  // Policy-Driven Critical Result Config
  criticalResultPolicy?: CriticalResultPolicyConfig;

  // Source Change & Completion Safety
  isCancelledSource?: boolean;
  isNoLongerActionable?: boolean;
  sourceChangeNotice?: string;
  cancellationReason?: string;

  allowedActions: WorkItemAllowedAction[];
  tags: string[];
  activityHistory: WorkItemActivityEvent[];
  completionOutcome?: {
    completedAt: string;
    completedBy: string;
    outcomeNote: string;
    resultingDocTitle?: string;
    disposition?: string;
  };
}

export interface WorkQueueDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  department: HospitalDepartment | 'all';
  specialty: string;
  description: string;
  defaultSort: 'priority' | 'due_soon' | 'oldest' | 'newest';
  ownershipPolicy: WorkItemOwnershipPolicy;
  serviceTeamAr: string;
  activeStaffCount: number;
  workloadState: 'low' | 'moderate' | 'high';
}

export type MyWorkOperationalView =
  | 'my_work'
  | 'team_queue'
  | 'unassigned'
  | 'in_progress'
  | 'waiting'
  | 'completed';
