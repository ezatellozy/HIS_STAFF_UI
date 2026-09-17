/**
 * Patient Access, ADT & Patient Flow Operations Types
 *
 * Architectural Invariants & Separation of Concerns:
 * 1. Patient Identity ≠ Encounter ≠ Appointment ≠ Physical Location
 * 2. Appointment (Scheduling) ≠ Visit / Encounter (Clinical Episode of Care)
 * 3. Arrival (Physical Presence) ≠ Check-in (Administrative Acceptance) ≠ Encounter Start (Clinical Visit Initiation)
 * 4. Check-in ≠ Provider Assignment (Provider/team assignment is contextual)
 * 5. Admission Request ≠ Admission Order ≠ Bed Assignment ≠ Admission Event
 * 6. Transfer Request ≠ Transfer Acceptance ≠ Handover ≠ Transport ≠ Actual Transfer
 * 7. Bed Matching = Assistive UX Only (Not an automated decision engine)
 * 8. Transport = Operational Dependency Context (Not a porter dispatch module)
 * 9. Financial Clearance = Future Administrative Dependency Context (Mock only)
 * 10. Discharge ≠ Encounter End ≠ Physical Departure ≠ Bed Release (Turnover)
 * 11. Inpatient Leave (Pass) = Optional policy capability; bed retention is policy-dependent
 * 12. Movement History = Operational Movement Timeline (Mock data; not a regulatory audit trail)
 * 13. ADT Operational Attention State ≠ Clinical Alert ≠ Notification ≠ Work Item
 */

export type AdtTab =
  | 'registration_search'
  | 'arrival_opd_flow'
  | 'admission_ops'
  | 'bed_management'
  | 'transfer_ops'
  | 'discharge_ops'
  | 'movement_history'
  | 'demo_scenarios';

/**
 * Configured Patient Flow Policy Models
 */
export type PatientFlowPolicyType =
  | 'policy_a_sequential' // Arrival -> Check-in -> Encounter activated
  | 'policy_b_combined' // Arrival + Check-in combined operationally
  | 'policy_c_precreated_encounter' // Encounter planned before arrival; check-in activates it
  | 'policy_d_emergency_first'; // Emergency encounter opened before formal registration/check-in

/**
 * Configured Transfer Policy Profiles
 */
export type TransferPolicyProfile =
  | 'icu_step_down' // Strict ICU/Step-Down: Acceptance + Bed Assignment + SBAR Handover + Escort
  | 'same_unit_bed_move' // Direct bed reassignment within unit (No formal SBAR or transport needed)
  | 'clinical_escort'; // Clinical team direct transfer without dedicated porter dispatch

/**
 * Configured Discharge Readiness Policy Profiles
 */
export type DischargeReadinessPolicyProfile =
  | 'standard_comprehensive' // Clinical + Med Rec + Summary Note + Education + Admin Clearance
  | 'day_surgery_fast_track'; // Accelerated ambulatory discharge checklist

/**
 * Configured Bed Release / Vacancy Policies
 */
export type BedReleasePolicyProfile =
  | 'immediate_turnover_departure' // Physical departure immediately triggers dirty turnover state
  | 'post_inspection_turnover' // Nurse/Housekeeper confirmation releases the bed
  | 'holding_bed_reserved'; // Bed temporarily retained for pending outcome

/**
 * Operational Conflict States (Resilience Mock UX)
 */
export interface OperationalConflictState {
  id: string;
  type:
    | 'bed_unavailable'
    | 'admission_cancelled'
    | 'transfer_redirected'
    | 'patient_moved'
    | 'encounter_ended'
    | 'identity_discrepancy'
    | 'discharge_context_changed'
    | 'source_superseded'
    | 'reservation_invalidated';
  titleAr: string;
  descriptionAr: string;
  suggestedActionAr: string;
  timestamp: string;
  resolved: boolean;
  sourceEntityId?: string;
  sourceEntityType?: 'admission_request' | 'transfer' | 'appointment' | 'bed';
  blockedActionNameAr?: string;
}

export interface AdministrativeAlert {
  id: string;
  type: 'identity_warning' | 'duplicate_risk' | 'confidentiality_vip' | 'administrative_hold' | 'payer_restriction';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  isAdministrative: true; // Explicitly distinguishes from clinical alerts/allergies
}

export interface PatientAccessRecord {
  id: string;
  mrn: string; // Server-generated system identifier in real HIS
  nationalId?: string;
  iqamaNo?: string;
  passportNo?: string;
  fullNameAr: string;
  fullNameEn: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  mobile: string;
  email?: string;
  address: {
    city: string;
    district: string;
    street?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    mobile: string;
  };
  communicationPreference: 'sms' | 'call' | 'whatsapp' | 'email';
  status: 'active' | 'inactive' | 'deceased' | 'temporary_unidentified';
  administrativeAlerts: AdministrativeAlert[];
  isTemporaryUnknown?: boolean;
  temporaryTag?: string;
  registeredAt: string;
  activeEncounterId?: string;
  previousEncountersCount: number;
  // Newborn & Multiple-Birth Profile Support
  isNewborn?: boolean;
  motherPatientId?: string;
  motherMrn?: string;
  motherNameAr?: string;
  multipleBirthIndicator?: boolean;
  birthOrder?: number; // 1, 2, 3...
  temporaryNewbornNamingContext?: string;
  identityAmbiguityWarning?: string;
  identificationVerificationContext?: string;
  // FHIR-inspired Patient.link semantics (Identity Reconciliation: replaced-by / replaces / refer)
  linkedPatientId?: string;
  linkedMrn?: string;
  linkType?: 'replaced-by' | 'replaces' | 'refer';
}

export interface DuplicateCheckMatch {
  existingPatient: PatientAccessRecord;
  similarityScore: number;
  matchingFields: Array<{
    field: string;
    labelAr: string;
    existingVal: string;
    candidateVal: string;
    isExact: boolean;
  }>;
  reviewStatus: 'pending' | 'dismissed_distinct' | 'flagged_potential_duplicate';
}

export type ConfiguredAppointmentStatus =
  | 'booked'
  | 'confirmed'
  | 'arrived'
  | 'checked_in'
  | 'fulfilled'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export interface AppointmentEntity {
  id: string;
  appointmentNumber: string;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  clinicId: string;
  clinicNameAr: string;
  doctorId: string;
  doctorNameAr: string;
  scheduledTime: string;
  durationMinutes: number;
  status: ConfiguredAppointmentStatus;
  bookingSource: 'call_center' | 'patient_portal' | 'reception_desk' | 'referral';
  reason: string;
  notes?: string;
  arrivalRecordedAt?: string;
  checkInRecordedAt?: string;
}

export type ConfiguredEncounterType =
  | 'opd'
  | 'er'
  | 'inpatient'
  | 'day_case'
  | 'observation'
  | 'telehealth';

export type ConfiguredEncounterStatus =
  | 'planned'
  | 'in_progress'
  | 'on_leave'
  | 'discharged'
  | 'completed'
  | 'cancelled';

export interface LocationCoordinates {
  facility: string;
  building: string;
  floor: string;
  unit: string;
  room?: string;
  bed?: string;
}

export interface EncounterEntity {
  id: string;
  encounterNumber: string;
  type: ConfiguredEncounterType;
  status: ConfiguredEncounterStatus;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  startedAt: string;
  endedAt?: string;
  clinicalCareStartedAt?: string;
  administrativeClosedAt?: string;
  serviceName: string;
  department: 'opd' | 'er' | 'ipd' | 'icu' | 'or';
  currentLocation: LocationCoordinates;
  responsibleTeam: string;
  attendingPhysician: string;
  originatingAppointmentId?: string;
}

export type AdmissionRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'on_hold'
  | 'declined'
  | 'cancelled';

export type AdmissionPlacementStatus =
  | 'unassigned'
  | 'bed_reserved'
  | 'bed_assigned'
  | 'ready_for_admission'
  | 'admitted';

export interface AdmissionRequestEntity {
  id: string;
  requestNumber: string;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  patientGender: 'male' | 'female';
  patientAge: number;
  sourceDepartment: 'er' | 'opd' | 'icu' | 'or' | 'external';
  requestedService: string;
  requestedCareLevel: 'general_ward' | 'step_down' | 'icu' | 'isolation' | 'peds';
  urgency: 'stat' | 'urgent' | 'routine';
  requestStatus: AdmissionRequestStatus;
  placementStatus: AdmissionPlacementStatus;
  isolationRequired: boolean;
  isolationType?: 'contact' | 'droplet' | 'airborne' | 'protective';
  equipmentRequirements: string[];
  plannedUnitId?: string;
  plannedUnitName?: string;
  plannedBedId?: string;
  plannedBedNumber?: string;
  clinicalSummaryRef: string;
  encounterId: string;
  submittedAt: string;
  expectedArrival: string;
  coordinationTeam: string;
  specialInstructions?: string;
}

export type BedOperationalState =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'assigned'
  | 'cleaning'
  | 'maintenance'
  | 'blocked'
  | 'isolation_restricted'
  | 'out_of_service';

export interface BedLocationEntity {
  id: string;
  bedNumber: string;
  roomNumber: string;
  unitId: string;
  unitName: string;
  floor: string;
  building: string;
  facility: string;
  state: BedOperationalState;
  bedType: 'standard' | 'bariatric' | 'telemetry' | 'icu_ventilator' | 'isolation_negative_pressure';
  genderSuitability: 'male' | 'female' | 'any';
  currentPatientId?: string;
  currentPatientName?: string;
  currentMrn?: string;
  currentEncounterId?: string;
  plannedPatientId?: string;
  plannedPatientName?: string;
  plannedMrn?: string;
  housekeepingStatus: 'clean' | 'cleaning_in_progress' | 'dirty_turnover' | 'delayed';
  housekeepingEstimatedDone?: string;
  equipment: string[];
  isNegativePressure?: boolean;
}

export interface CapacityOverviewMetrics {
  totalOperationalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  assignedBeds: number;
  cleaningTurnoverBeds: number;
  blockedMaintenanceBeds: number;
  incomingExpectedAdmissions: number;
  expectedDischargesToday: number;
  occupancyPercent: number;
}

export interface PlacementAssistanceCheck {
  bedId: string;
  bedNumber: string;
  unitName: string;
  status: 'eligible' | 'not_ideal' | 'restricted';
  reasons: string[];
}

export type InternalTransferStatus =
  | 'requested'
  | 'accepted'
  | 'bed_assigned'
  | 'ready_for_transport'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

export type TransportContextStatus =
  | 'not_required'
  | 'requested'
  | 'planned'
  | 'ready'
  | 'in_transit'
  | 'arrived';

export interface InternalTransferEntity {
  id: string;
  transferNumber: string;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  currentEncounterId: string;
  sourceUnit: string;
  sourceBed: string;
  destinationUnit: string;
  destinationBed?: string;
  urgency: 'stat' | 'urgent' | 'routine';
  reason: string;
  status: InternalTransferStatus;
  transportStatus: TransportContextStatus;
  handoverRefId?: string;
  handoverStatus: 'pending' | 'drafted' | 'received_acknowledged';
  requestedAt: string;
  completedAt?: string;
  transportTeamNotes?: string;
  // Distinct Pending Cancellation vs Erroneous Completed Movement
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  isEnteredInError?: boolean;
  correctionReason?: string;
  correctedAt?: string;
  correctedBy?: string;
  requiresPhysicalReconciliation?: boolean;
}

export type DischargePlanningStatus =
  | 'planning'
  | 'ready'
  | 'delayed'
  | 'discharged'
  | 'departed'
  | 'completed';

export interface DischargeReadinessSummary {
  medicationReconciliationDone: boolean;
  dischargeNoteApproved: boolean;
  dischargeSummaryNoteRef?: string;
  nursingDischargeChecklistDone: boolean;
  patientEducationCompleted: boolean;
  followUpAppointmentBooked: boolean;
  transportArranged: boolean;
  equipmentArranged: boolean;
  pendingConsultsOrResults: number;
  financialAdministrativeClearance: boolean;
}

export interface DischargeEntity {
  id: string;
  encounterId: string;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  unitName: string;
  bedNumber: string;
  expectedDischargeDate: string;
  status: DischargePlanningStatus;
  readiness: DischargeReadinessSummary;
  actualDischargeTimestamp?: string;
  actualDepartureTimestamp?: string;
  administrativeCompletionTimestamp?: string;
  disposition?: 'home' | 'transfer_other_facility' | 'rehabilitation' | 'home_health' | 'ama_against_medical_advice' | 'deceased';
  destinationDetails?: string;
  closureNotes?: string;
}

export interface TemporaryLeaveEntity {
  id: string;
  encounterId: string;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  leaveType: 'compassionate' | 'diagnostic_external' | 'personal';
  approvedBy: string;
  startDateTime: string;
  expectedReturnDateTime: string;
  actualReturnDateTime?: string;
  status: 'approved' | 'on_leave' | 'returned' | 'overdue_return';
  notes?: string;
}

export interface TemporaryDiagnosticMovement {
  id: string;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  currentEncounterId: string;
  inpatientUnit: string;
  inpatientBed: string;
  diagnosticDestination: string; // e.g. قسم الأشعة التشخيصية - الرنين المغناطيسي MRI
  reason: string;
  status: 'scheduled' | 'departed' | 'arrived_at_destination' | 'returned';
  bedRetentionPolicy: 'retain_bed';
  departedAt?: string;
  arrivedAt?: string;
  expectedReturnAt?: string;
  returnedAt?: string;
}

export interface PatientMovementEvent {
  id: string;
  encounterId: string;
  patientId: string;
  mrn: string;
  patientNameAr: string;
  timestamp: string;
  eventType:
    | 'registration'
    | 'arrival'
    | 'check_in'
    | 'admission_request'
    | 'admission'
    | 'bed_assignment'
    | 'internal_transfer'
    | 'transfer_cancelled'
    | 'movement_correction'
    | 'temporary_leave_start'
    | 'temporary_leave_return'
    | 'diagnostic_movement_departure'
    | 'diagnostic_movement_return'
    | 'actual_discharge'
    | 'physical_departure'
    | 'administrative_closure';
  fromLocation?: string;
  toLocation?: string;
  actorName: string;
  actorRole: string;
  reason?: string;
  note?: string;
  correctedEventId?: string;
  correctionReason?: string;
}

export interface UnknownErPatientRecord {
  temporaryId: string; // e.g. TEMP-ER-20260913-01
  temporaryNameAr: string;
  estimatedAge: number;
  estimatedGender: 'male' | 'female' | 'unknown';
  traumaTagNumber: string;
  arrivalTime: string;
  incidentLocation?: string;
  status: 'unidentified_active' | 'reconciliation_pending' | 'reconciled_with_known_patient';
  reconciledKnownMrn?: string;
  reconciledKnownName?: string;
}
