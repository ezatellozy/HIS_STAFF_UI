import { Patient } from './his';

/**
 * Supported person-specific verification identifiers (organizational policy configured).
 * STRICT POLICY: Physical location (room, bed, ward, department) is NEVER an identifier.
 * Barcode is a carrier technology (VerificationMethod), not an independent identifier by itself.
 * Normal encounterNumber represents the visit/episode, NOT the person. Encounter ID is strictly separate from Patient ID.
 * An emergency department number qualifies ONLY when explicitly assigned and designated
 * as a temporary patient identifier under the configured ADT identity policy.
 */
export type VerificationIdentifierType =
  | 'fullName'
  | 'dob'
  | 'mrn'
  | 'nationalOrOfficialId'
  | 'designatedEmergencyTemporaryId';

export type VerificationMethod =
  | 'verbal_direct'      // Asking responsive patient / guardian to state name & DOB
  | 'barcode_scan'       // Scanning wristband barcode / 2D DataMatrix carrying person-specific identifiers (MRN / Designated Emergency Temp ID)
  | 'biometric_token'    // Configured biometric match / secure token
  | 'visual_credential'; // Checking government ID or formal hospital photo ID

export interface IdentityVerificationRuleConfig {
  minimumIdentifiersRequired: number; // 2
  allowedIdentifiers: VerificationIdentifierType[];
  allowLocationAsIdentifier: false; // Must ALWAYS be false
  emergencyOverridePermitted: boolean;
}

export const DEFAULT_IDENTITY_VERIFICATION_POLICY: IdentityVerificationRuleConfig = {
  minimumIdentifiersRequired: 2,
  allowedIdentifiers: ['fullName', 'dob', 'mrn', 'nationalOrOfficialId', 'designatedEmergencyTemporaryId'],
  allowLocationAsIdentifier: false,
  emergencyOverridePermitted: true
};

export interface VerificationAttemptRecord {
  id: string;
  patientId: string;
  contextActionTitle: string;
  timestamp: string;
  verifiedBy: string;
  verifiedByRole: string;
  method: VerificationMethod;
  matchedIdentifiers: VerificationIdentifierType[];
  result: 'matched' | 'mismatch' | 'emergency_override';
  mismatchDetails?: string;
  notes?: string;
  // Mock operational history flag (prototype simulation only)
  isMockOperationalHistory?: boolean;
}

/**
 * Allergy / Intolerance view-model states
 * Distinguishes "not yet recorded/unknown" from "confirmed negative (NKDA)"
 */
export type AllergyDocumentationStatus =
  | 'active_allergies_present' // Has documented verified allergies
  | 'no_known_allergies'       // NKDA / NKFA formally assessed & affirmed
  | 'unassessed_unavailable';  // No assessment done yet, emergency admission, etc.

export interface PatientAllergyViewModel {
  documentationStatus: AllergyDocumentationStatus;
  statusLabelAr: string;
  statusLabelEn: string;
  lastAssessedDate?: string;
  lastAssessedBy?: string;
  allergiesList: Array<{
    id: string;
    substanceNameAr: string;
    substanceNameEn: string;
    category: 'medication' | 'food' | 'environmental' | 'radiocontrast_agent' | 'other';
    // 4 Independently Represented Dimensions:
    criticality: 'low' | 'moderate' | 'high' | 'unable_to_assess';
    reactionSeverity: 'mild' | 'moderate' | 'severe_anaphylaxis' | 'unknown';
    clinicalStatus: 'active' | 'inactive' | 'resolved';
    verificationStatus: 'suspected' | 'confirmed' | 'refuted' | 'resolved';
    manifestationAr: string;
  }>;
}

/**
 * Result Follow-Up & Responsibility lifecycle states
 * Decoupled into independent dimensions:
 * 1. Communication status
 * 2. Read-back status (read-back does NOT complete follow-up)
 * 3. Clinical action / follow-up status
 * 4. Responsible clinician / team
 * (Result production status and Clinician review status remain independent on the result report)
 */
export type ResultCommunicationStatus =
  | 'uncommunicated'
  | 'communicated';

export type ResultReadBackStatus =
  | 'not_required'
  | 'pending_readback'
  | 'readback_confirmed';

export type ResultClinicalActionStatus =
  | 'action_pending'
  | 'action_planned'
  | 'action_completed'
  | 'no_action_needed';

export type FollowUpCommunicationStatus =
  | 'pending_communication'
  | 'communicated_readback_confirmed'
  | 'clinician_action_planned'
  | 'followup_completed'
  | 'no_followup_needed';

export interface ResultFollowUpMetadata {
  resultId: string;
  resultTitle: string;
  orderingClinician: string;
  attendingClinician: string;
  responsibleClinicianOrTeam?: string;
  assignedFollowUpRole: string;

  // Independent Dimensions:
  communicationStatus: ResultCommunicationStatus;
  readBackStatus: ResultReadBackStatus;
  actionFollowUpStatus: ResultClinicalActionStatus;

  // Aggregate status for backwards compatibility:
  followUpStatus: FollowUpCommunicationStatus;

  urgency: 'routine' | 'urgent' | 'critical_stat';
  communicationNote?: string;
  actionTakenNotes?: string;
  completedBy?: string;
  completedAt?: string;

  // Policy-Driven Escalation Context (Section 2 - No hardcoded Chair destination)
  escalationContext?: {
    isEscalationConfigured: boolean;
    primaryResponsibleRole: string; // e.g. "Attending Physician"
    alternateResponsibleRecipient?: string; // Configured alternate recipient e.g. "On-Call Specialty Fellow"
    alternateCommunicationMethod?: string; // e.g. "secure_paging" | "direct_call"
    escalationState: 'none' | 'due' | 'escalation_completed' | 'not_applicable';
    escalationTriggeredAt?: string;
    escalationCompletedAt?: string;
    escalationNotes?: string;
  };
}
