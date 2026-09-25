// ============================================================================
// HEALTHCARE PATIENT ACCOUNTS RECEIVABLE & REVENUE CYCLE MANAGEMENT TYPES
// Edina Hospital Information System (HIS) — Revenue Operations Architecture
// Synthetic Interactive Prototype: Demonstrating Saudi NPHIES Financial Flow Patterns & Invoice Document Type Examples (Non-Production Simulation)
// ============================================================================

export type RevenueCycleBranchId = 'main_hospital' | 'suburban_clinic_branch' | 'all';

export type RevenueCyclePersona =
  | 'billing_officer'
  | 'cashier_viewer'
  | 'insurance_coordinator'
  | 'claims_specialist'
  | 'denial_specialist'
  | 'ar_officer'
  | 'revenue_cycle_supervisor'
  | 'finance_controller';

export type RevenueCycleWorkspaceId =
  | 'overview'
  | 'charge_capture_review'
  | 'pricing_coverage'
  | 'invoices_accounts'
  | 'claims_payer'
  | 'denials_appeals'
  | 'remittance_allocation'
  | 'credit_refunds'
  | 'ar_aging_reporting';

// ----------------------------------------------------------------------------
// 1. CHARGE CAPTURE & VALIDATION
// ----------------------------------------------------------------------------

export type ChargeSourceCategory =
  | 'opd_consultation'
  | 'emergency_service'
  | 'inpatient_stay'
  | 'laboratory'
  | 'radiology'
  | 'medication_fulfillment'
  | 'surgical_procedure'
  | 'physical_therapy'
  | 'miscellaneous';

export type ServiceFulfillmentStatus =
  | 'planned'
  | 'performed'
  | 'cancelled'
  | 'source_not_verified';

export type BillabilityStatus =
  | 'unreviewed'
  | 'billable'
  | 'non_billable'
  | 'already_billed'
  | 'disputed';

export type PricingStatus =
  | 'unpriced'
  | 'priced'
  | 'price_unavailable'
  | 'override_requested';

export type BillingReviewStatus =
  | 'pending_review'
  | 'approved_for_billing'
  | 'on_hold_documentation'
  | 'coding_dependency_pending'
  | 'rejected_from_billing';

export interface ChargeEventReference {
  id: string; // e.g. CHG-2026-001
  patientId: string;
  patientMrn: string;
  patientNameAr: string;
  encounterId: string;
  appointmentId?: string;
  sourceCategory: ChargeSourceCategory;
  sourceReferenceId: string; // Order ID or Clinical Event ID
  clinicalOrderId?: string;
  performedServiceRef?: string;
  serviceCode: string; // SBS / CPT / ACHI code
  serviceNameAr: string;
  serviceNameEn: string;
  departmentAr: string;
  quantity: number;
  unit: string;
  serviceTimestamp: string;
  performedStatus: ServiceFulfillmentStatus;
  billabilityStatus: BillabilityStatus;
  pricingStatus: PricingStatus;
  billingReviewStatus: BillingReviewStatus;
  exceptionReason?: string;
  unitPriceSar: number;
  grossAmountSar: number;
  discountAmountSar: number;
  netAmountSar: number;
  taxRatePercent: number; // 15% or 0%
  taxAmountSar: number;
  totalWithTaxSar: number;
  consumedInInvoiceId?: string;
  consumedInInvoiceLineId?: string;
  consumedInClaimId?: string;
  isSyntheticFixture: boolean;
}

// ----------------------------------------------------------------------------
// 2. PRICING, TARIFF & TAX PROFILE
// ----------------------------------------------------------------------------

export type SupplyTaxClassification =
  | 'standard_rated_15'   // Standard 15% VAT supply (e.g. general consultations, elective/cosmetic care, non-qualifying items)
  | 'zero_rated'          // 0% VAT supply (e.g. qualifying prescription medications, approved medical appliances)
  | 'exempt'              // Exempt healthcare services
  | 'out_of_scope'        // Out of scope
  | 'pending_tax_review'; // TAX_TREATMENT_PENDING_REVIEW: Tax evidence missing or unverified

export type GovernmentTaxBearingStatus =
  | 'citizen_government_borne' // State bears the VAT on behalf of Saudi citizens for qualifying healthcare
  | 'not_applicable'           // Not borne by government (non-citizen, elective/cosmetic service, or commercial payer)
  | 'pending_verification';    // Verification of citizen eligibility or qualifying supply pending

export interface SaudiTaxTreatmentProfile {
  supplyClassification: SupplyTaxClassification;
  applicableRatePercent: number; // 15, 0
  governmentBearingStatus: GovernmentTaxBearingStatus;
  isGovernmentBorne: boolean;
  taxTreatmentCode: 'TAX_STANDARD_15' | 'TAX_ZERO_RATED' | 'TAX_GOVT_BORNE' | 'TAX_EXEMPT' | 'TAX_TREATMENT_PENDING_REVIEW';
  taxTreatmentLabelAr: string;
  notesAr: string;
}

export type VatApplicabilityCategory = SupplyTaxClassification;

export interface TariffReference {
  id: string;
  serviceCode: string;
  serviceNameAr: string;
  serviceNameEn: string;
  listPriceSar: number;
  standardTariffSar: number;
  contractedPayerPriceSar?: number;
  vatCategory: SupplyTaxClassification;
  vatRatePercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isQualifyingMedicalSupply?: boolean; // Eligible for citizen government tax-bearing arrangement
}

export type EligibilityStatus =
  | 'active'
  | 'inactive'
  | 'pending_inquiry'
  | 'unknown_coverage';

export type PriorAuthStatus =
  | 'not_required'
  | 'pending_submission'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'expired';

export interface CoverageReference {
  id: string;
  patientId: string;
  patientMrn: string;
  payerId: string;
  payerNameAr: string;
  payerNameEn: string;
  policyNumber: string;
  memberId: string;
  planClass: 'VIP' | 'Class A' | 'Class B' | 'Standard' | 'Cash';
  eligibilityStatus: EligibilityStatus;
  coPayPercent: number; // e.g. 10%, 20%
  coPayMaxCapSar?: number; // e.g. 100 SAR max copay per visit
  maxAnnualBenefitSar: number;
  remainingBenefitSar: number;
  validFrom: string;
  validTo: string;
  isPriorAuthRequired: boolean;
  priorAuthReference?: string;
  priorAuthStatus: PriorAuthStatus;
  priorAuthApprovedAmountSar?: number;
  verificationTimestamp: string;
}

export interface ResponsibilitySplit {
  grossAmountSar: number;
  contractualDiscountSar: number;
  vatRatePercent: number;
  vatAmountSar: number;
  totalWithVatSar: number;
  patientShareSar: number;
  payerShareSar: number;
  secondaryPayerShareSar?: number;
  unassignedShareSar: number;
  status: 'fully_assigned' | 'responsibility_pending_review' | 'disputed';
  ruleExplanationAr: string;
}

// ----------------------------------------------------------------------------
// 3. PATIENT INVOICES & ZATCA E-INVOICING PROFILE
// ----------------------------------------------------------------------------

export type InvoiceDocumentType =
  | 'tax_invoice'            // B2B: to Insurance Payer or Corporate Sponsor
  | 'simplified_tax_invoice' // B2C: directly to Patient
  | 'credit_note'            // Correction reducing liability
  | 'debit_note';            // Correction increasing liability

export type InvoiceLifecycleStatus =
  | 'draft'
  | 'under_review'
  | 'ready_to_issue'
  | 'issued_simulation'
  | 'partially_paid'
  | 'paid_closed'
  | 'disputed'
  | 'cancelled'
  | 'corrected'
  | 'credited';

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  chargeId: string;
  serviceCode: string;
  serviceNameAr: string;
  serviceNameEn: string;
  quantity: number;
  unitPriceSar: number;
  grossAmountSar: number;
  discountAmountSar: number;
  netAmountSar: number;
  vatCategory: VatApplicabilityCategory;
  vatRatePercent: number;
  vatAmountSar: number;
  lineTotalSar: number;
  patientShareSar: number;
  payerShareSar: number;
}

export interface PatientInvoice {
  id: string; // e.g. INV-2026-RC-001
  invoiceNumber: string; // Human readable sequence e.g. SINV-2026-0814
  invoiceDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm
  invoiceType: InvoiceDocumentType;
  lifecycleStatus: InvoiceLifecycleStatus;
  recipientType: 'patient' | 'insurance_payer' | 'sponsor_employer';
  recipientId: string;
  recipientNameAr: string;
  patientId: string;
  patientMrn: string;
  patientNameAr: string;
  patientNationalId: string;
  isSaudiCitizen: boolean;
  encounterId: string;
  clinicOrDepartmentAr: string;
  lines: InvoiceLine[];
  subtotalGrossSar: number;
  discountTotalSar: number;
  subtotalNetSar: number;
  vatTotalSar: number;
  grandTotalSar: number;
  patientResponsibilitySar: number;
  payerResponsibilitySar: number;
  allocatedCashierReceiptSar: number;
  allocatedPayerRemittanceSar: number;
  allocatedCreditAdjustmentSar: number;
  outstandingPatientBalanceSar: number;
  outstandingPayerBalanceSar: number;
  totalOutstandingBalanceSar: number;
  isSyntheticFixture: boolean;
  zatcaComplianceNotice: string; // Persistent banner note
  correctionOriginalInvoiceId?: string; // If credit note or corrected invoice
  associatedClaimId?: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// 4. INSURANCE CLAIMS & NPHIES LIFECYCLE
// ----------------------------------------------------------------------------

export type ClaimType =
  | 'professional_opd'
  | 'institutional_inpatient'
  | 'emergency_encounter'
  | 'pharmacy_dispense'
  | 'diagnostic_imaging'
  | 'laboratory_panel';

export type ClaimLifecycleStatus =
  | 'draft'
  | 'validation_failed'
  | 'ready_for_submission'
  | 'submitted_simulation'
  | 'acknowledged_technical' // Ack received from gateway
  | 'queued_payer'           // Payer received message
  | 'adjudication_partial'   // Some lines decided
  | 'adjudication_complete'  // Final decision made
  | 'rejected_technical'     // Schema or routing error
  | 'cancelled'
  | 'superseded_corrected';

export type LineAdjudicationOutcome =
  | 'approved'
  | 'partially_approved'
  | 'denied'
  | 'pending_review'
  | 'information_requested'
  | 'technical_error';

export interface ClaimLine {
  id: string;
  claimId: string;
  chargeId: string;
  invoiceLineId?: string;
  serviceCode: string;
  serviceNameAr: string;
  quantity: number;
  unitPriceSar: number;
  claimedGrossSar: number;
  contractualDiscountSar: number;
  claimedNetSar: number;
  vatAmountSar: number;
  totalClaimedSar: number;
  adjudicationOutcome: LineAdjudicationOutcome;
  allowedAmountSar: number;
  deniedAmountSar: number;
  patientCoPayDeterminedSar: number;
  payerPayableDeterminedSar: number;
  denialReasonCode?: string; // e.g. NPH-DEN-04 (Saudi NPHIES code) or CARC-197 (US/X12 profile)
  codeSystem?: 'NPHIES_ADJUDICATION' | 'X12_CARC' | 'X12_RARC';
  payerProfileLabel?: string; // e.g. 'Saudi NPHIES Gateway' or 'US Commercial / X12 Profile'
  denialDescriptionAr?: string;
  denialDescriptionEn?: string;
}

export interface PayerClaim {
  id: string; // e.g. CLM-2026-NPH-001
  claimNumber: string;
  invoiceId: string;
  payerId: string;
  payerNameAr: string;
  payerNameEn: string;
  patientId: string;
  patientMrn: string;
  patientNameAr: string;
  encounterId: string;
  claimType: ClaimType;
  lifecycleStatus: ClaimLifecycleStatus;
  nphiesMessageId: string; // Synthetic NPHIES gateway tracking UUID
  nphiesBundleReference: string;
  submissionTimestamp?: string;
  acknowledgementTimestamp?: string;
  adjudicationTimestamp?: string;
  preAuthReference?: string;
  lines: ClaimLine[];
  totalClaimedSar: number;
  totalAllowedSar: number;
  totalDeniedSar: number;
  totalPayerPayableSar: number;
  totalPatientShareSar: number;
  adjudicationNotes?: string;
  isSyntheticFixture: boolean;
  supportingDocumentsAttached: string[];
}

// ----------------------------------------------------------------------------
// 5. DENIALS, APPEALS & DISPUTES
// ----------------------------------------------------------------------------

export type DenialCategory =
  | 'pre_auth_missing'
  | 'medical_necessity'
  | 'coding_error'
  | 'coverage_exhausted'
  | 'untimely_filing'
  | 'benefit_exclusion'
  | 'duplicate_claim'
  | 'information_requested';

export type AppealStatus =
  | 'open_investigation'
  | 'clarification_requested'
  | 'supporting_docs_attached'
  | 'appeal_submitted'
  | 'adjustment_accepted'
  | 'escalated_supervisor'
  | 'closed_with_loss';

export interface ClaimDenial {
  id: string; // e.g. DEN-2026-001
  claimId: string;
  claimNumber: string;
  claimLineId: string;
  payerId: string;
  payerNameAr: string;
  patientId: string;
  patientMrn: string;
  patientNameAr: string;
  serviceCode: string;
  serviceNameAr: string;
  deniedAmountSar: number;
  denialCategory: DenialCategory;
  denialCode: string; // e.g. NPH-DEN-04
  codeSystem?: 'NPHIES_ADJUDICATION' | 'X12_CARC' | 'X12_RARC';
  payerProfileLabel?: string; // e.g. 'Saudi NPHIES Gateway' or 'US Commercial / X12 Profile'
  denialDescriptionAr: string;
  denialDescriptionEn: string;
  responsibleDepartment: string;
  isAppealEligible: boolean;
  appealStatus: AppealStatus;
  actionOwner: string;
  appealSubmittedAt?: string;
  appealDeadlineDate?: string;
  notes?: string;
  isPatientDebtTransferAuthorized: boolean; // CRITICAL: denied payer amount is NOT patient debt unless explicitly authorized by contract
}

// ----------------------------------------------------------------------------
// 6. REMITTANCES & PAYMENT ALLOCATIONS
// ----------------------------------------------------------------------------

export type BankSettlementVerification =
  | 'receipt_independently_confirmed'
  | 'payment_receipt_not_verified'
  | 'reconciliation_pending';

export interface RemittanceItem {
  id: string;
  remittanceId: string;
  claimId: string;
  claimNumber: string;
  claimLineId?: string;
  invoiceId: string;
  patientMrn: string;
  patientNameAr: string;
  claimedAmountSar: number;
  adjudicatedAmountSar: number;
  paidAmountSar: number;
  contractualAdjustmentSar: number;
  allocatedAmountSar: number;
  isFullyAllocated: boolean;
}

export interface PayerRemittance {
  id: string; // e.g. REM-2026-TAW-01
  remittanceRef: string; // Electronic Remittance Advice (ERA) reference
  payerId: string;
  payerNameAr: string;
  remittanceDate: string;
  paymentMethod: 'sarie_eft' | 'bank_cheque' | 'direct_debit';
  paymentReference: string;
  totalRemittedAmountSar: number;
  totalAllocatedAmountSar: number;
  unallocatedRemainderSar: number;
  bankSettlementStatus: BankSettlementVerification;
  treasuryConfirmationReference?: string;
  items: RemittanceItem[];
  isSyntheticFixture: boolean;
  notes?: string;
}

export interface ReceiptAllocation {
  id: string;
  receiptId: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  allocatedAmountSar: number;
  allocatedAt: string;
  allocatedBy: string;
}

export interface RemittanceAllocation {
  id: string;
  remittanceId: string;
  remittanceRef: string;
  claimId: string;
  invoiceId: string;
  allocatedAmountSar: number;
  allocatedAt: string;
  allocatedBy: string;
}

// ----------------------------------------------------------------------------
// 7. CREDIT BALANCES, REFUNDS & WRITE-OFFS
// ----------------------------------------------------------------------------

export type CreditOrigin =
  | 'duplicate_payment'
  | 'legitimate_overpayment'
  | 'invoice_correction_credit'
  | 'approved_credit_adjustment'
  | 'advance_deposit_release';

export type RefundWorkflowStatus =
  | 'credit_detected'
  | 'credit_verified'
  | 'refund_requested'
  | 'refund_approved'
  | 'sent_to_treasury'
  | 'treasury_processing'
  | 'refund_completed_evidence'
  | 'refund_rejected_cancelled';

export interface CreditBalanceRecord {
  id: string; // e.g. CRD-2026-001
  patientId: string;
  patientMrn: string;
  patientNameAr: string;
  sourceInvoiceId?: string;
  sourceReceiptId?: string;
  creditOrigin: CreditOrigin;
  creditAmountSar: number;
  remainingEligibleRefundSar: number;
  detectedDate: string;
  workflowStatus: RefundWorkflowStatus;
  refundRequestId?: string;
  notes?: string;
}

export interface RefundRequest {
  id: string; // e.g. REF-REQ-2026-001
  creditBalanceId: string;
  patientId: string;
  patientMrn: string;
  patientNameAr: string;
  requestedAmountSar: number;
  refundMethod: 'bank_transfer' | 'original_card_reversal' | 'cash_vault';
  beneficiaryIban?: string;
  beneficiaryName?: string;
  requestDate: string;
  requestedBy: string;
  status: RefundWorkflowStatus;
  treasuryHandoverReference?: string; // Handoff to Treasury
  rejectionReason?: string;
}

export type WriteOffType =
  | 'contractual_allowance'
  | 'payer_denial_uncollectible'
  | 'charity_patient_assistance'
  | 'small_balance_waiver'
  | 'uncollectible_bad_debt';

export interface WriteOffAdjustment {
  id: string; // e.g. ADJ-2026-001
  targetType: 'patient_invoice' | 'payer_claim_denial';
  targetId: string;
  invoiceNumber?: string;
  claimNumber?: string;
  patientMrn: string;
  amountSar: number;
  adjustmentType: WriteOffType;
  reasonAr: string;
  approvedBy: string;
  approvedAt: string;
  isGlPostingSimulated: boolean;
}

// ----------------------------------------------------------------------------
// 8. ACCOUNTS RECEIVABLE AGING & REPORTING
// ----------------------------------------------------------------------------

export interface AgingBucket {
  currentSar: number;      // 0 - 30 days
  days31To60Sar: number;   // 31 - 60 days
  days61To90Sar: number;   // 61 - 90 days
  days91PlusSar: number;   // 91+ days
  totalSar: number;
}

export interface ArAgingSummary {
  patientAr: AgingBucket;
  insurancePayerAr: AgingBucket;
  sponsorCorporateAr: AgingBucket;
  totalReceivables: AgingBucket;
  unbilledEligibleChargesSar: number;
  unappliedReceiptsSar: number;
  unallocatedRemittancesSar: number;
  creditBalancesSar: number;
  reconciliationCheckPassed: boolean;
}

export interface PatientAccountStatement {
  patientId: string;
  mrn: string;
  patientNameAr: string;
  statementDate: string;
  totalInvoicedSar: number;
  totalPaidSar: number;
  totalAdjustmentsSar: number;
  creditBalanceSar: number;
  netDueSar: number;
  invoices: {
    invoiceId: string;
    invoiceNumber: string;
    date: string;
    totalAmountSar: number;
    patientShareSar: number;
    paidAmountSar: number;
    balanceDueSar: number;
    status: InvoiceLifecycleStatus;
  }[];
  receipts: {
    receiptId: string;
    receiptNumber: string;
    date: string;
    amountSar: number;
    paymentMethod: string;
    allocatedAmountSar: number;
  }[];
}

// ----------------------------------------------------------------------------
// 9. UNIFIED REVENUE CYCLE STATE
// ----------------------------------------------------------------------------

export interface RevenueCycleState {
  currentBranch: RevenueCycleBranchId;
  activePersona: RevenueCyclePersona;
  selectedPatientContextId?: string; // Filter context to patient without cross-leak
  charges: ChargeEventReference[];
  tariffs: TariffReference[];
  coverages: CoverageReference[];
  invoices: PatientInvoice[];
  claims: PayerClaim[];
  denials: ClaimDenial[];
  remittances: PayerRemittance[];
  receiptAllocations: ReceiptAllocation[];
  remittanceAllocations: RemittanceAllocation[];
  creditBalances: CreditBalanceRecord[];
  refundRequests: RefundRequest[];
  writeOffs: WriteOffAdjustment[];
  auditLogs: {
    id: string;
    timestamp: string;
    actionType: string;
    entityId: string;
    actor: string;
    descriptionAr: string;
  }[];
}
