// ============================================================================
// HEALTHCARE FINANCE & ACCOUNTS PAYABLE (AP) SYSTEM TYPES
// ============================================================================

export type ApBranchId = 'main_hospital' | 'suburban_clinic_branch' | 'all';

// ----------------------------------------------------------------------------
// 1. MINIMUM FINANCE FOUNDATION REFERENCES (SYNTHETIC ONLY)
// ----------------------------------------------------------------------------

export interface AccountCodeReference {
  accountCode: string;             // e.g. "GL-2010-AP-TRADE"
  accountNameAr: string;
  accountNameEn: string;
  accountType: 'liability' | 'expense' | 'asset' | 'clearing';
  isMonitoredBudget: boolean;
}

export interface CostCenterReference {
  costCenterCode: string;          // e.g. "CC-ICU-701"
  costCenterNameAr: string;
  costCenterNameEn: string;
  departmentId: string;
}

export interface CurrencyProfile {
  currencyCode: 'SAR' | 'USD' | 'EUR';
  symbol: string;
  fractionDigits: number;
  isHospitalFunctionalCurrency: boolean;
}

export interface SyntheticFxRate {
  pair: string;                    // e.g. "USD/SAR"
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;                    // e.g. 3.75
  rateDate: string;
  source: string;                  // e.g. "SAMA Official Daily Fix (Synthetic)"
}

export interface TaxCategoryProfile {
  taxCode: 'VAT-STD-15' | 'VAT-ZERO-0' | 'VAT-EXEMPT' | 'VAT-OUT-OF-SCOPE' | 'VAT-PENDING-REVIEW';
  nameAr: string;
  nameEn: string;
  ratePercent: number;
  recoveryStatusDefault: 'recoverable' | 'non_recoverable' | 'pending_tax_review';
}

// ----------------------------------------------------------------------------
// 2. SUPPLIER FINANCIAL OVERLAY (REUSING PROCUREMENT SUPPLIER ID)
// ----------------------------------------------------------------------------

export type BeneficiaryVerificationStatus = 
  | 'verified_active' 
  | 'bank_change_pending_review' 
  | 'unverified_hold' 
  | 'rejected';

export interface SupplierFinancialOverlay {
  supplierId: string;              // Reuses Procurement SupplierMaster.id (e.g. "VEND-SA-9021")
  paymentTermsCode: string;        // e.g. "NET_30", "NET_60", "NET_90", "IMMEDIATE"
  paymentMethodPreference: 'bank_transfer_sarie' | 'cheque' | 'direct_debit';
  syntheticIbanMasked: string;     // Fictional masked IBAN for preview safety e.g. "SA94****8812"
  beneficiaryAccountName: string;
  beneficiaryVerificationStatus: BeneficiaryVerificationStatus;
  pendingBankChangeDetails?: {
    requestedIbanMasked: string;
    requestedAt: string;
    requestedBy: string;
    changeReasonAr: string;
    verificationNotes?: string;
  };
  apPaymentHoldActive: boolean;
  paymentHoldReason?: string;
  withholdingTaxApplicable: boolean;
  withholdingTaxRatePercent?: number;
}

// ----------------------------------------------------------------------------
// 3. INVOICE LIFECYCLE STATE AXES (ORTHOGONAL)
// ----------------------------------------------------------------------------

export type InvoiceDocumentStatus = 
  | 'draft'
  | 'received'
  | 'incomplete'
  | 'validated'
  | 'returned_for_correction'
  | 'rejected'
  | 'voided';

export type InvoiceMatchingStatus = 
  | 'not_applicable'              // e.g. For pure non-PO services before matching
  | 'awaiting_docs'               // Waiting for GRN or service sign-off
  | 'matched_exact'               // Zero discrepancy
  | 'matched_within_tolerance'    // Minor price variance within policy
  | 'price_variance_hold'         // Price exceeds tolerance
  | 'qty_variance_hold'           // Invoiced > Received / Overbilling
  | 'unmatched_receipt_missing'   // No GRN found
  | 'exception_hold'              // Inspection failed or dispute
  | 'resolved';                   // Exception formally overridden/resolved

export type InvoiceApprovalStatus = 
  | 'not_submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'returned_for_correction';

export type InvoicePostingStatus = 
  | 'unposted'
  | 'posting_pending'
  | 'simulated_posted'
  | 'posting_failed'
  | 'posting_rejected';

export type InvoiceSettlementStatus = 
  | 'not_eligible'                // Blocked by hold/approval
  | 'eligible'                    // Ready for payment proposal
  | 'in_proposal'                 // Reserved in active payment proposal
  | 'approved_for_payment'        // Treasury dual-authorized
  | 'payment_sent_pending_bank'   // Submitted in synthetic scenario
  | 'partially_settled'           // Partial payment or partial credit applied
  | 'fully_settled'               // Balance == 0
  | 'bank_rejected'               // Rejected by bank instruction
  | 'on_hold';                    // Payment blocked by AP hold

// ----------------------------------------------------------------------------
// 4. MATCHING POLICY CONFIGURATION
// ----------------------------------------------------------------------------

export type MatchingPolicyProfile = 
  | 'two_way_po_price'            // Direct costs, services with PO
  | 'three_way_po_grn'            // Standard stock consumables
  | 'three_way_po_grn_qa_accepted'// High-risk surgical implants, cold-chain
  | 'service_acceptance_signoff'  // Maintenance, bio-calibration
  | 'non_po_departmental_review'; // Utilities, leases

export interface MatchingPolicy {
  policyProfile: MatchingPolicyProfile;
  priceTolerancePercent: number;   // e.g. 2.0%
  priceToleranceAmountCapSar: number; // e.g. 100.0 SAR
  quantityTolerancePercent: number;// e.g. 0% (hard zero on physical stock)
  requiresQaAcceptance: boolean;
  policySource: string;            // e.g. "Hospital Financial Regulations 2026 / Article 14"
}

// ----------------------------------------------------------------------------
// 5. INVOICE LINE ITEM & ALLOCATION
// ----------------------------------------------------------------------------

export interface InvoiceLineAllocationRecord {
  id: string;
  invoiceId: string;
  invoiceLineId: string;
  poId?: string;
  poLineId?: string;
  grnId?: string;                  // e.g. "RCV-2026-0041"
  grnLineId?: string;
  allocatedQuantity: number;
  unitPriceAtAllocation: number;
  allocatedAt: string;
}

export interface SupplierInvoiceLine {
  id: string;                      // e.g. "INVL-2026-001"
  invoiceId: string;
  lineNumber: number;
  itemCode: string;
  itemDescriptionAr: string;
  itemDescriptionEn: string;
  
  // Upstream References
  poId?: string;                   // Reuses Procurement PurchaseOrder.id
  poNumber?: string;               // e.g. "PO-2026-MED-101"
  poLineId?: string;               // e.g. "POL-101-1"
  grnId?: string;                  // e.g. "RCV-2026-0041"
  grnReceiptReference?: string;    // e.g. "GRN-2026-09-101"
  
  // Quantities & UOM
  invoicedQuantity: number;
  invoicedUom: string;
  baseUomQuantity: number;
  
  // Pricing & Currency
  unitPrice: number;
  lineDiscountAmount: number;
  netLineAmount: number;           // (invoicedQty * unitPrice) - lineDiscount
  
  // Tax
  taxCode: TaxCategoryProfile['taxCode'];
  taxRatePercent: number;          // 15, 0, etc.
  taxAmount: number;
  totalLineAmount: number;         // netLineAmount + taxAmount
  
  // Cost Accounting Attribution
  costCenterCode: string;          // e.g. "CC-ICU-701"
  glAccountCode: string;           // e.g. "GL-5100-MEDSUP"
  
  // Matching Metrics (Line-Level)
  matchedPoOrderedQty?: number;
  matchedPoUnitPrice?: number;
  matchedGrnReceivedQty?: number;
  matchedGrnAcceptedQty?: number;
  matchedGrnQuarantinedQty?: number;
  matchedGrnRejectedQty?: number;
  alreadyConsumedReceiptQty?: number;
  availableMatchableReceiptQty?: number;
  priceVariancePercent?: number;
  lineMatchingResult: 'exact_match' | 'within_tolerance' | 'price_variance' | 'qty_variance' | 'unmatched';
  lineDiscrepancyNotes?: string;
}

// ----------------------------------------------------------------------------
// 6. SUPPLIER INVOICE HEADER
// ----------------------------------------------------------------------------

export interface InvoiceHoldRecord {
  id: string;
  holdType: 'price_variance' | 'quantity_overbilling' | 'missing_receipt' | 'qa_inspection_pending' | 'duplicate_suspected' | 'tax_id_invalid' | 'bank_verification_pending' | 'missing_fx_rate';
  reasonAr: string;
  reasonEn: string;
  placedAt: string;
  placedBy: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionJustificationAr?: string;
}

export interface SupplierInvoice {
  id: string;                      // Internal AP doc ID e.g. "INV-AP-2026-001"
  invoiceNumber: string;           // Vendor's invoice # e.g. "GULF-INV-88912"
  branchId: ApBranchId;
  supplierId: string;              // Reuses Procurement SupplierMaster.id (e.g. "VEND-SA-9021")
  supplierNameAr: string;
  supplierNameEn: string;
  supplierTaxNumber: string;       // 15-digit ZATCA VAT #
  
  // Invoice Document Metadata
  documentType: 'standard_po_invoice' | 'non_po_service_invoice' | 'recurring_contract_invoice' | 'prepayment_request';
  invoiceDate: string;             // YYYY-MM-DD
  receivedDate: string;            // YYYY-MM-DD
  accountingDate: string;          // YYYY-MM-DD
  paymentTermsCode: string;        // e.g. "NET_30"
  dueDate: string;                 // Calculated based on terms policy
  originalCurrency: 'SAR' | 'USD' | 'EUR';
  functionalCurrency: 'SAR';
  fxExchangeRate?: number;         // Required if originalCurrency !== 'SAR'
  fxRateSource?: string;
  
  // Primary Order References
  primaryPoId?: string;            // e.g. "PO-PO-2026-MED-101"
  primaryPoNumber?: string;
  contractReferenceId?: string;
  
  // Service Acceptance Reference (For Non-PO or Service POs)
  serviceAcceptanceRef?: {
    servicePeriodStart: string;
    servicePeriodEnd: string;
    acceptingDepartmentId: string;
    acceptingStaffName: string;
    servicePerformanceConfirmed: boolean;
    confirmationNotesAr?: string;
  };

  // Lines
  lines: SupplierInvoiceLine[];
  
  // Financial Summary (Amounts in Transaction Currency)
  subtotalAmount: number;
  headerDiscountAmount: number;
  freightAndChargesAmount: number;
  taxAmount: number;
  grossTotalAmount: number;
  
  // Settlement Balances (In Functional Currency SAR)
  convertedGrossTotalSar: number;
  appliedCreditNotesSar: number;
  appliedPrepaymentsSar: number;
  settledPaymentsSar: number;
  remainingPayableBalanceSar: number;

  // Orthogonal State Lifecycles
  documentStatus: InvoiceDocumentStatus;
  matchingStatus: InvoiceMatchingStatus;
  approvalStatus: InvoiceApprovalStatus;
  postingStatus: InvoicePostingStatus;
  settlementStatus: InvoiceSettlementStatus;
  
  // Configured Matching Policy for this invoice
  appliedMatchingPolicy: MatchingPolicy;
  
  // Exceptions & Holds
  activeHolds: InvoiceHoldRecord[];
  
  // Audit Trail & Revision Provenance
  previousCorrectionPredecessorId?: string;
  correctionNotesAr?: string;
  approvalRecord?: {
    approvedByStaffId: string;
    approvedByStaffName: string;
    approvedAt: string;
    comments?: string;
  };
  syntheticVoucherRecord?: {
    voucherNumber: string;         // e.g. "VCHR-2026-0041"
    postedAt: string;
    debitAccountCode: string;
    creditAccountCode: string;
    simulatedBy: string;
  };
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 7. CREDIT NOTES & DEBIT NOTES (SUPPLIER COMMERCIAL OFFSET)
// ----------------------------------------------------------------------------

export interface SupplierCreditNote {
  id: string;                      // e.g. "CRN-AP-2026-001"
  creditNoteNumber: string;        // Supplier's credit note # e.g. "CN-GULF-091"
  supplierId: string;
  supplierNameAr: string;
  supplierTaxNumber: string;
  originalInvoiceId: string;       // Linked SupplierInvoice.id
  originalInvoiceNumber: string;
  sourceProcurementClaimId?: string; // Reuses Procurement SupplierClaim.id (e.g. "CLM-2026-001")
  sourcePoNumber?: string;
  creditDate: string;
  currency: 'SAR' | 'USD' | 'EUR';
  totalCreditAmountSar: number;
  appliedAmountSar: number;
  remainingUnappliedAmountSar: number;
  reasonAr: string;
  reasonEn: string;
  status: 'draft' | 'validated' | 'approved_available' | 'partially_applied' | 'fully_applied' | 'voided';
  appliedToInvoices: {
    targetInvoiceId: string;
    targetInvoiceNumber: string;
    amountAppliedSar: number;
    appliedAt: string;
  }[];
  createdAt: string;
}

export interface HospitalDebitNote {
  id: string;                      // e.g. "DBN-HOSP-2026-001"
  debitNoteNumber: string;
  supplierId: string;
  supplierNameAr: string;
  targetInvoiceId: string;
  debitAmountSar: number;
  reasonAr: string;
  status: 'under_review' | 'authorized_for_deduction' | 'applied' | 'cancelled';
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 8. PREPAYMENTS & MOBILIZATION ADVANCES
// ----------------------------------------------------------------------------

export interface PrepaymentRecord {
  id: string;                      // e.g. "PRE-2026-001"
  prepaymentReference: string;
  supplierId: string;
  supplierNameAr: string;
  poId?: string;
  poNumber?: string;
  contractReference?: string;
  authorizedAdvanceAmountSar: number;
  confirmedDisbursedAmountSar: number; // Only confirmed amount is unapplied
  unappliedBalanceSar: number;
  status: 'authorized_pending_disbursement' | 'disbursed_available' | 'partially_applied' | 'fully_applied';
  applicationHistory: {
    appliedToInvoiceId: string;
    amountDeductedSar: number;
    appliedAt: string;
  }[];
  notes?: string;
}

// ----------------------------------------------------------------------------
// 9. PAYMENT PROPOSALS, BATCHES & SYNTHETIC BANK BOUNDARY
// ----------------------------------------------------------------------------

export type PaymentProposalBatchStatus = 
  | 'draft_proposal'
  | 'submitted_for_treasury_approval'
  | 'approved_for_payment'
  | 'rejected_by_treasury'
  | 'payment_instruction_generated'
  | 'transmitted_to_mock_bank'
  | 'mock_bank_rejected'
  | 'mock_bank_confirmed'
  | 'cancelled';

export interface PaymentBatchInvoiceItem {
  invoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierNameAr: string;
  invoiceGrossAmountSar: number;
  previouslyPaidAmountSar: number;
  currentPayableBalanceSar: number;
  proposedPaymentAmountSar: number;
  beneficiaryIbanMasked: string;
  isBeneficiaryVerified: boolean;
  dueDate: string;
  daysOverdue: number;
}

export interface PaymentProposalBatch {
  id: string;                      // e.g. "PAY-BATCH-2026-001"
  batchNumber: string;
  branchId: ApBranchId;
  batchDescriptionAr: string;
  creationDate: string;
  scheduledDisbursementDate: string;
  disbursingBankAccountId: string; // e.g. "BANK-SNB-SAR-01"
  disbursingBankAccountNameAr: string;
  currency: 'SAR';
  totalProposedAmountSar: number;
  invoicesCount: number;
  suppliersCount: number;
  status: PaymentProposalBatchStatus;
  
  items: PaymentBatchInvoiceItem[];
  
  // Dual-Control Authorization Record
  treasuryApprovalRecord?: {
    approvedByStaffName: string;
    approvedAt: string;
    approvalNotesAr?: string;
  };
  
  // Simulated Bank Instruction & Response Boundary
  syntheticBankTransmission?: {
    instructionReference: string;  // e.g. "SARIE-INST-2026-90412"
    submittedAt: string;
    mockBankStatus: 'pending' | 'accepted_by_bank' | 'cleared_confirmed' | 'rejected_by_bank';
    bankResponseCode?: string;     // e.g. "BANK-ERR-IBAN-INVALID" or "BANK-OK-SETTLED"
    bankResponseMessageAr?: string;
    confirmedDebitTimestamp?: string;
    disclaimer: string;            // "Synthetic bank response fixture - no actual money movement"
  };
}

// ----------------------------------------------------------------------------
// 10. SUPPLIER STATEMENT RECONCILIATION
// ----------------------------------------------------------------------------

export interface SupplierStatementLine {
  id: string;
  transactionDate: string;
  transactionType: 'invoice' | 'credit_note' | 'payment_received' | 'opening_balance';
  referenceNumber: string;
  debitAmountSar: number;
  creditAmountSar: number;
  closingBalanceSar: number;
  reconciliationStatus: 'reconciled' | 'internal_record_missing' | 'timing_difference_in_transit' | 'disputed_amount';
  matchedInternalDocId?: string;
  investigationNotesAr?: string;
}

export interface SupplierStatementReconciliationRecord {
  id: string;
  supplierId: string;
  supplierNameAr: string;
  statementDate: string;
  statementPeriod: string;
  statementEndingBalanceSar: number;
  hospitalApLedgerBalanceSar: number;
  reconciledBalanceSar: number;
  unreconciledVarianceSar: number;
  lines: SupplierStatementLine[];
  status: 'under_investigation' | 'reconciled_with_variances' | 'fully_balanced';
}
