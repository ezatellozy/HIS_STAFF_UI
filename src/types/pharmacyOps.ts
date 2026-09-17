// ============================================================================
// PHARMACY OPERATIONS UX (INPATIENT, OUTPATIENT, STERILE & COMPOUNDING)
// High-Fidelity UI/UX Prototype Domain Model
// Strictly respects boundaries: No Pharmacy Backend, No Inventory Ledger,
// No Rules/CDSS Engine, No Automated Dispensing Hardware, No MAR Execution.
// Aligned conceptually with international patient safety, quality & interoperability principles.
// ============================================================================

export type PharmacyServiceType =
  | 'inpatient'         // Unit-dose, routine & STAT inpatient medication supply
  | 'emergency_stat'    // Rapid-turnaround STAT emergency supply
  | 'outpatient'        // Ambulatory clinic & outpatient prescription dispensing
  | 'discharge'         // Discharge medication supply linked with Med Rec & ADT
  | 'sterile_iv'        // Sterile compounding, IV admixtures & infusions
  | 'compounding';      // Non-sterile extemporaneous compounding

export type PharmacyRolePersona =
  | 'clinical_pharmacist'
  | 'inpatient_pharmacist'
  | 'outpatient_pharmacist'
  | 'pharmacy_technician'
  | 'sterile_technician'
  | 'pharmacy_supervisor';

export type MedicationPriority = 'routine' | 'urgent' | 'stat';

export type PharmacyViewTab =
  | 'home'
  | 'incoming_orders'
  | 'verification'
  | 'interventions'
  | 'preparation'
  | 'dispensing'
  | 'ready_handoff'
  | 'outpatient_queue'
  | 'discharge_supply'
  | 'returns_exceptions';

// ----------------------------------------------------------------------------
// 1. ORDER & VERIFICATION STATUS
// ----------------------------------------------------------------------------
export type PharmacyOrderStatus =
  | 'ordered'              // Source order placed in Axis 6
  | 'under_verification'  // In pharmacist review queue
  | 'clarification_needed' // Held pending prescriber clarification
  | 'verified'             // Clinically verified by pharmacist
  | 'preparing'            // In technician / compounding preparation
  | 'prepared'             // Prepared, awaiting final verification check
  | 'ready_for_dispense'   // Final check passed, staged for dispatch/pickup
  | 'dispensed'            // Dispensed from pharmacy (NOT yet administered)
  | 'handed_off'           // Collected by nurse/patient/courier
  | 'partially_dispensed'  // Partial quantity supplied
  | 'cancelled_by_source'  // Prescriber cancelled order
  | 'returned_to_pharmacy';// Unused medication returned from ward

export type VerificationDecision =
  | 'verified'
  | 'verified_with_note'
  | 'clarification_requested'
  | 'modification_recommended'
  | 'held'
  | 'rejected_policy'
  | 'referred_clinical_specialist';

// ----------------------------------------------------------------------------
// 2. FORMULARY & STOCK CONTEXT (Formulary Status ≠ Stock Availability)
// ----------------------------------------------------------------------------
export type FormularyStatus =
  | 'formulary'
  | 'non_formulary'
  | 'restricted'
  | 'conditional_approval'
  | 'special_program';

export type StockAvailability =
  | 'available'
  | 'low_stock'
  | 'out_of_stock'
  | 'reserved'
  | 'quarantined';

export interface StockContext {
  availability: StockAvailability;
  availableQuantity: number;
  packageUnit: string;
  defaultLocation: string; // e.g., "Main Pharmacy - Shelf B4" or "Narcotics Safe A"
  batchLot?: string;
  expiryDate?: string;
  isRestrictedStock?: boolean;
}

// ----------------------------------------------------------------------------
// 3. CLINICAL ALERTS & CDSS OUTCOMES (Mock Policy-Driven Only, No Frontend Math)
// ----------------------------------------------------------------------------
export type AlertSeverity = 'information' | 'warning' | 'high_attention';

export type AlertCategory =
  | 'allergy_conflict'
  | 'drug_interaction'
  | 'duplicate_therapy'
  | 'renal_dose_adjustment'
  | 'hepatic_caution'
  | 'pregnancy_lactation'
  | 'high_alert_medication'
  | 'antimicrobial_stewardship'
  | 'route_form_mismatch'
  | 'geriatric_beers_criteria'
  | 'monitoring_required';

export interface ClinicalReviewAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  isBlockingPolicy: boolean; // Only if institution policy specifies blocking
  sourceReference?: string;
}

// ----------------------------------------------------------------------------
// 4. MEDICATION ORDER DETAIL (High Completeness)
// ----------------------------------------------------------------------------
export interface MedicationOrderContext {
  id: string; // Order ID e.g., "RX-2026-9041"
  axis6OrderId?: string;
  patientId: string;
  patientName: string;
  patientNameEn?: string;
  mrn: string;
  encounterId: string;
  encounterType: 'inpatient' | 'emergency' | 'outpatient' | 'day_surgery';
  locationWardBed: string; // e.g., "Medical Ward 4A - Bed 12"
  patientAge: number;
  patientGender: 'male' | 'female';
  patientWeightKg?: number;
  patientAllergies: string[];
  patientPrimaryDiagnosis: string;
  patientRenalStatus?: string; // e.g. "eGFR 48 mL/min (Moderate Impairment)"
  patientHepaticStatus?: string; // e.g. "Child-Pugh Class A"

  // Medication Specification
  medicationCode: string;
  brandName: string;
  genericName: string;
  dosageForm: string; // e.g., "Tablet", "Vial", "IV Infusion Bag", "Syringe", "Suspension"
  strength: string; // e.g., "500 mg", "1 g / 100 mL", "40 mg/0.4 mL"
  concentration?: string;
  orderedDose: string; // e.g., "1 g"
  doseUnit: string;
  route: string; // e.g., "IV Infusion", "Oral", "SC", "IM", "Inhalation"
  frequency: string; // e.g., "Q8H", "Once Daily", "STAT", "PRN Q4H"
  scheduleDetails?: string; // e.g., "08:00 - 16:00 - 24:00"
  durationDays?: number;
  totalQuantityOrdered: number;
  quantityUnit: string;

  // PRN Context
  isPrn: boolean;
  prnIndication?: string;
  prnMaxDailyDoses?: string;

  // Clinical & Safety Metadata
  clinicalIndication: string;
  prescriberName: string;
  prescriberRole: string;
  prescriberDepartment: string;
  prescribedAt: string;
  priority: MedicationPriority;
  isHighAlert: boolean;
  isAntimicrobial: boolean;
  isControlledRestricted: boolean;

  // Status & Tracking
  orderStatus: PharmacyOrderStatus;
  verificationStatus: 'pending' | 'verified' | 'clarification' | 'held' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;

  // Formulary & Stock
  formularyStatus: FormularyStatus;
  stockContext: StockContext;

  // Operational Targets
  targetCompletionMinutes: number; // Configured operational target (not hardcoded SLA engine)
  elapsedMinutes: number;
  isDelayed: boolean;

  // Clinical Alerts associated with this order
  alerts: ClinicalReviewAlert[];

  // Linked Work Item in My Work (if official task assigned)
  linkedMyWorkItemId?: string;

  // Source-Changed / Conflict flag
  isSourceChanged?: boolean;
  sourceChangeReason?: string;
}

// ----------------------------------------------------------------------------
// 5. PHARMACY INTERVENTION / CLARIFICATION RECORD
// (Pharmacy Intervention ≠ Clinical Order Change. Message ≠ Intervention Record)
// ----------------------------------------------------------------------------
export interface PharmacyIntervention {
  id: string;
  orderId: string;
  patientName: string;
  mrn: string;
  medicationName: string;
  issueCategory:
    | 'dose_adjustment_needed'
    | 'renal_dose_clarification'
    | 'drug_interaction_risk'
    | 'therapeutic_duplication'
    | 'unclear_route_frequency'
    | 'allergy_contraindication'
    | 'non_formulary_alternative'
    | 'stock_shortage_substitution'
    | 'iv_compatibility_inquiry';
  issueDescription: string;
  pharmacistRecommendation: string;
  communicatedTo: string; // e.g. "د. مصطفى خالد (طبيب مقيم باطنة)"
  communicationChannel: 'secure_clinical_chat' | 'phone_direct' | 'in_person' | 'his_formal_clarification';
  status: 'pending_prescriber' | 'accepted_by_prescriber' | 'rejected_by_prescriber' | 'cancelled';
  prescriberResponseNote?: string;
  prescriberActionTaken?: 'source_order_modified' | 'order_discontinued' | 'override_reconfirmed';
  initiatedBy: string;
  initiatedAt: string;
  resolvedAt?: string;
}

// ----------------------------------------------------------------------------
// 6. SUBSTITUTION & INTERCHANGE CONTEXT (Policy-Driven UX)
// (Suggested Alternative ≠ Automatic Substitution)
// ----------------------------------------------------------------------------
export interface SubstitutionOption {
  id: string;
  type: 'generic_substitution' | 'brand_substitution' | 'therapeutic_interchange' | 'strength_formulation_alternative';
  originalMedication: string;
  suggestedMedication: string;
  suggestedStrength: string;
  suggestedRoute: string;
  formularyStatus: FormularyStatus;
  stockStatus: StockAvailability;
  authorityRequirement: 'pharmacist_independent_authority' | 'prescriber_approval_required' | 'requires_documentation_only';
  clinicalRationale: string;
}

// ----------------------------------------------------------------------------
// 7. PREPARATION & COMPOUNDING CONTEXT
// ----------------------------------------------------------------------------
export type PreparationType =
  | 'unit_dose_packaging'    // Standard solid/liquid unit dose picking
  | 'sterile_iv_admixture'   // IV piggyback, small volume infusion
  | 'sterile_iv_infusion'    // Large volume continuous infusion
  | 'sterile_syringe'        // Pre-filled IV push or epidural syringe
  | 'non_sterile_compound'   // Oral liquid suspension, ointment, topical
  | 'reconstitution';        // Antibiotic vial reconstitution

export interface CompoundingIngredient {
  name: string;
  orderedAmount: string;
  actualMeasuredAmount?: string;
  lotNumber?: string;
  expiryDate?: string;
  verifiedBy?: string;
}

export interface CompoundingWorksheet {
  id: string;
  orderId: string;
  patientName: string;
  mrn: string;
  preparationType: PreparationType;
  primaryDrug: string;
  doseOrdered: string;
  diluentName: string; // e.g. "0.9% Sodium Chloride (Normal Saline)" or "Dextrose 5% in Water"
  diluentVolume: string; // e.g. "100 mL"
  finalConcentration: string; // e.g. "10 mg/mL"
  finalVolume: string; // e.g. "100 mL"
  beyondUseDate: string; // BUD e.g. "24 hours at 2-8°C"
  storageConditions: 'room_temperature' | 'refrigerated_2_8' | 'protect_from_light' | 'frozen';
  instructions: string;
  ingredients: CompoundingIngredient[];
  preparedByTechnician?: string;
  preparedAt?: string;
  finalCheckedByPharmacist?: string;
  finalCheckedAt?: string;
  verificationPolicy: 'single_check' | 'tech_plus_pharmacist' | 'independent_double_check';
  preparationState: 'scheduled' | 'in_cleanroom_prep' | 'prepared_awaiting_check' | 'passed_final_check' | 'rejected_discarded';
  notes?: string;
}

// ----------------------------------------------------------------------------
// 8. DISPENSING & HANDOFF CONTEXT
// (Order Verified ≠ Dispensed. Dispensed ≠ Administered. Dispensed ≠ Collected)
// ----------------------------------------------------------------------------
export interface DispenseRecord {
  id: string; // Dispense ID e.g. "DSP-2026-8812"
  orderId: string;
  patientName: string;
  mrn: string;
  medicationName: string;
  dosageForm: string;
  route: string;
  orderedQuantity: number;
  dispensedQuantity: number;
  remainingQuantity: number;
  isPartialDispense: boolean;
  partialDispenseReason?: string;
  nextSupplyDueTime?: string;
  batchLot: string;
  expiryDate: string;
  dispensedBy: string;
  dispensedAt: string;
  finalCheckBy?: string;
  destinationType: 'inpatient_ward_cart' | 'stat_emergency_tray' | 'patient_counter_pickup' | 'pneumatic_tube' | 'automated_cabinet_refill';
  destinationLocation: string; // e.g. "Ward 4A Nurse Station" or "Outpatient Window 3"
  handoffStatus: 'awaiting_collection' | 'in_transit' | 'collected_handoff_complete';
  collectedBy?: string;
  collectedAt?: string;
  barcodeScannedMock: boolean;
}

// ----------------------------------------------------------------------------
// 9. OUTPATIENT & DISCHARGE SPECIFIC CONTEXT
// ----------------------------------------------------------------------------
export interface OutpatientPrescriptionContext {
  prescriptionId: string;
  orderId: string;
  patientName: string;
  mrn: string;
  encounterId: string;
  tokenNumber: string; // e.g. "P-104"
  medicationCount: number;
  administrativeClearance: 'cleared_insurance_approved' | 'co_pay_pending' | 'cash_settled' | 'exemption_waiver';
  counselingStatus: 'required_high_alert' | 'required_first_time' | 'counseling_completed' | 'patient_declined' | 'not_required';
  counselingPharmacist?: string;
  counselingNotes?: string;
  pickupWindow: string; // e.g. "Window 02 (Counseling Bay)"
  isReadyForPickup: boolean;
}

export interface DischargeMedicationSupply {
  dischargeOrderGroupRef: string;
  orderId: string;
  patientName: string;
  mrn: string;
  wardLocation: string;
  medicationName: string;
  supplyDays: number; // e.g. 7 days or 14 days
  quantitySupplied: number;
  medRecReconciledReference: string; // Axis 8 reconciliation reference ID
  adtDischargeReadinessLinked: boolean;
  counselingDone: boolean;
  handedToPatientOrFamily: boolean;
}

// ----------------------------------------------------------------------------
// 10. RETURNS & EXCEPTIONS CONTEXT
// (Returned Medication ≠ Medication Administration Reversal)
// (Cancelled Order ≠ Prepared Product Disposition)
// ----------------------------------------------------------------------------
export interface MedicationReturnContext {
  id: string;
  orderId: string;
  patientName: string;
  mrn: string;
  locationWard: string;
  medicationName: string;
  quantityReturned: number;
  returnReason:
    | 'patient_discharged_early'
    | 'order_discontinued_by_doctor'
    | 'patient_refused_dose'
    | 'excess_unit_dose'
    | 'medication_expired_on_ward'
    | 'damaged_packaging';
  packagingCondition: 'intact_sealed' | 'opened_unsealed' | 'compromised_storage';
  dispositionAction: 'return_to_active_stock' | 'quarantine_for_destruction' | 'credit_reconciliation_only';
  processedBy: string;
  processedAt: string;
}

export interface CancelledAfterPreparationContext {
  orderId: string;
  medicationName: string;
  preparedWorksheetId?: string;
  preparedAt: string;
  cancelledAt: string;
  prescriberCancellationReason: string;
  productDisposition: 'return_to_stock_stable' | 'discard_waste_compounded' | 'quarantine_review';
  dispositionDocumentedBy?: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// 11. PHARMACY OPERATIONAL SUMMARY METRICS
// ----------------------------------------------------------------------------
export interface PharmacyOperationalMetrics {
  awaitingVerificationCount: number;
  clarificationsPendingCount: number;
  highAttentionOrdersCount: number;
  verifiedAwaitingPrepCount: number;
  inPreparationCount: number;
  readyForDispensingCount: number;
  awaitingHandoffCount: number;
  delayedOrdersCount: number;
  stockShortagesAttentionCount: number;
  sterileIvCompoundingCount: number;
  returnsPendingInspectionCount: number;
  recentDispensedTodayCount: number;
}

// ----------------------------------------------------------------------------
// 12. FILTER STATE FOR PHARMACY WORKLISTS
// ----------------------------------------------------------------------------
export interface PharmacyFilterState {
  service: PharmacyServiceType;
  tab: PharmacyViewTab;
  searchQuery: string;
  priorityFilter: 'all' | 'routine' | 'urgent' | 'stat';
  statusFilter: 'all' | 'unverified' | 'verified' | 'preparing' | 'ready' | 'dispensed' | 'exceptions';
  formularyFilter: 'all' | 'formulary' | 'non_formulary' | 'restricted';
  stockFilter: 'all' | 'available' | 'shortage_low';
  highAlertOnly: boolean;
  delayedOnly: boolean;
  preparationTypeFilter: 'all' | PreparationType;
  selectedOrderId?: string;
}
