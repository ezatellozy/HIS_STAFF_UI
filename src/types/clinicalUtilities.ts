// =============================================================
// CROSS-ROLE CLINICAL UTILITIES TYPES
// UI/UX INTERACTIVE PROTOTYPE ONLY
// Consults + Handover + Communication + Notifications
// =============================================================

import { ClinicalActivity } from './clinicalWorkspace';

export type UtilityTab = 'consults' | 'handovers' | 'messages' | 'notifications';

// -------------------------------------------------------------
// 1. CONSULTATION COORDINATION CENTER TYPES
// -------------------------------------------------------------
export type ConsultViewFilter =
  | 'incoming'
  | 'outgoing'
  | 'awaiting_response'
  | 'in_progress'
  | 'needs_info'
  | 'completed';

export interface ConsultCoordinationItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'male' | 'female';
  encounterId: string;
  encounterType: string;
  currentLocation: string;

  // Provenance & Targeting
  requestingDepartment: string;
  requestingDoctor: string;
  requestingDoctorRole: string;
  requestedSpecialty: string;
  targetConsultant?: string;

  // Clinical inquiry
  clinicalQuestion: string;
  priority: 'stat' | 'urgent' | 'routine';
  requestedAt: string;
  requestedResponseTimeframe: string; // e.g. "خلال ساعتين (Urgent)" or "فوري STAT (15 دقيقة)"
  lastUpdate: string;

  // Separation of Statuses
  requestStatus: 'submitted' | 'active' | 'cancelled' | 'closed';
  operationalWorkStatus: 'unassigned' | 'assigned' | 'claimed' | 'in_progress' | 'waiting_for_info' | 'completed';
  assignedClinician?: string;
  claimedByClinician?: string;

  // Safety & Source State
  isSourceActionable: boolean;
  sourceChangedWarning?: string; // e.g. "تم إلغاء الطلب الأصلي من قبل طبيب الطوارئ"

  // Resulting Clinical Documentation (Axis 5 link)
  resultingDocumentation?: {
    noteId: string;
    noteTitle: string;
    documentedBy: string;
    documentedAt: string;
    summaryPreview: string;
  };

  // Associated Links
  linkedWorkItemId?: string;
  linkedThreadId?: string;

  allowedActions: Array<
    | 'open_request'
    | 'open_patient'
    | 'open_work_item'
    | 'message_team'
    | 'add_coordination'
    | 'view_documentation'
    | 'request_info'
    | 'document_consultation'
  >;
}

// -------------------------------------------------------------
// 2. HANDOVER CENTER TYPES
// -------------------------------------------------------------
export type HandoverViewFilter =
  | 'incoming'
  | 'outgoing'
  | 'awaiting_receipt'
  | 'received'
  | 'shift_related'
  | 'transfer_related'
  | 'recent';

export interface HandoverSummarySection {
  key: string;
  label: string;
  content: string;
  displayOrder: number;
}

export interface HandoverSummaryProjection {
  templateId: 'SBAR' | 'ISBAR' | 'IPASS' | 'LOCAL_TEMPLATE' | string;
  templateName: string;
  sections: HandoverSummarySection[];
}

export interface HandoverCoordinationItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'male' | 'female';
  encounterId: string;
  currentLocation: string;

  sendingTeam: {
    service: string;
    clinician: string;
    role: string;
    unit: string;
    contactNumber?: string;
  };

  receivingTeam: {
    service: string;
    clinician?: string;
    role?: string;
    unit: string;
  };

  handoverType: 'shift_change' | 'unit_transfer' | 'inter_facility' | 'procedure_transit';
  handoverTime: string;
  handoverStatus: 'draft' | 'awaiting_receipt' | 'received' | 'superseded' | 'cancelled';
  criticalAttentionIndicator: boolean;
  criticalAlertNote?: string;
  outstandingContextCount: number; // e.g., pending labs/tasks

  // Configurable summary projection supporting SBAR, ISBAR, I-PASS, Local institutional templates
  summaryProjection?: HandoverSummaryProjection;

  // Preserved for backwards compatibility with legacy mock records
  sbarSummary?: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };

  isSourceSuperseded?: boolean;
  supersededReason?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;

  allowedActions: Array<'preview' | 'open_axis_10' | 'open_patient' | 'acknowledge_receipt' | 'contact_sender'>;
}

// -------------------------------------------------------------
// 3. CLINICAL COMMUNICATION / MESSAGING TYPES
// -------------------------------------------------------------
export type MessageUrgency = 'normal' | 'priority';
export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type StaffPresence = 'available' | 'busy' | 'in_procedure' | 'offline';

export interface ChatParticipant {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  unit?: string;
  presence: StaffPresence;
  isCurrentUser?: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  status: MessageDeliveryStatus;
  urgency?: MessageUrgency;
  quoteMessage?: {
    id: string;
    senderName: string;
    text: string;
  };
  linkedResource?: {
    type: 'order' | 'result' | 'work_item' | 'consult';
    label: string;
    id: string;
    targetAxis?: ClinicalActivity;
  };
  requiresAcknowledgement?: boolean;
  acknowledgedBy?: string[];
  attachmentPlaceholder?: {
    name: string;
    type: string;
    size: string;
  };
}

export interface MessageThread {
  id: string;
  threadType: 'patient_linked' | 'team_operational';
  title: string;

  // Explicit Patient Context for Patient-Linked Threads
  patientContext?: {
    patientId: string;
    patientName: string;
    mrn: string;
    encounterId: string;
    location: string;
    criticalAlert?: string;
  };

  participants: ChatParticipant[];
  lastMessage: {
    id: string;
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: string;
    status: MessageDeliveryStatus;
    urgency?: MessageUrgency;
  };
  unreadCount: number;
  priority: MessageUrgency;
  relatedContextType?: 'consult' | 'pharmacy_concern' | 'critical_lab' | 'transfer' | 'operational';
  linkedResourceId?: string;
  linkedWorkItemId?: string;
  isArchived?: boolean;
}

// -------------------------------------------------------------
// 4. NOTIFICATIONS & ATTENTION CENTER TYPES
// -------------------------------------------------------------
export type NotificationCategory = 'clinical' | 'work' | 'communication' | 'handover' | 'operational';
export type NotificationPriority = 'stat' | 'high' | 'medium' | 'info';

export interface AttentionNotification {
  id: string;
  category: NotificationCategory;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  priority: NotificationPriority;
  timestamp: string;

  // Separation of Read vs Actioned
  isRead: boolean;
  isActioned: boolean;
  actionedLabel?: string; // e.g. "تم اعتماد النتيجة السريرية" or "تم استلام الحالة"

  patientContext?: {
    patientId: string;
    patientName: string;
    mrn: string;
    location: string;
  };

  targetDeepLink: {
    destination:
      | 'patient_workspace'
      | 'my_work'
      | 'handover_center'
      | 'exact_conversation'
      | 'or_board'
      | 'er_board'
      | 'icu_board';
    targetPatientId?: string;
    targetAxis?: ClinicalActivity;
    targetTab?: string;
    targetItemId?: string;
    targetThreadId?: string;
  };

  sourceReference?: {
    type: string;
    id: string;
    status: string;
  };
}
