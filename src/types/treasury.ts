// ============================================================================
// HEALTHCARE TREASURY & CASH/BANK OPERATIONS SYSTEM TYPES
// HIS Financial Operations & Treasury Management Prototype
// ============================================================================

export type TreasuryBranchId = 'main_hospital' | 'suburban_clinic_branch' | 'all';

// ----------------------------------------------------------------------------
// 1. FUNDAMENTAL SEPARATED STATUS ENUMS
// ----------------------------------------------------------------------------

export type PaymentProposalStatus =
  | 'draft_proposal'
  | 'submitted_for_treasury_approval'
  | 'approved_for_payment'
  | 'rejected_by_treasury'
  | 'payment_instruction_generated'
  | 'cancelled';

export type TreasuryApprovalStatus =
  | 'pending_review'
  | 'under_dual_review'
  | 'approved'
  | 'returned_to_ap'
  | 'rejected'
  | 'blocked_by_policy';

export type PaymentInstructionStatus =
  | 'draft_instruction'
  | 'authorized_pending_release'
  | 'simulated_external_submitted'
  | 'bank_accepted'
  | 'bank_confirmed'
  | 'partially_confirmed'
  | 'bank_rejected'
  | 'bank_returned'
  | 'disputed'
  | 'cancelled';

export type BankResponseStatus =
  | 'awaiting_response'
  | 'bank_accepted_for_processing'
  | 'processing'
  | 'confirmed'
  | 'partially_confirmed'
  | 'rejected'
  | 'returned'
  | 'response_disputed'
  | 'unknown';

export type PaymentAllocationStatus =
  | 'awaiting_bank_confirmation'
  | 'eligible_for_ap_allocation'
  | 'allocation_not_verified'
  | 'acknowledged_by_ap'
  | 'allocated_in_ap'
  | 'unallocated_remainder';

export type BankReconciliationStatus =
  | 'unmatched'
  | 'suggested_match'
  | 'matched_single'
  | 'matched_split'
  | 'reconciliation_approved'
  | 'reconciliation_reversed'
  | 'excluded_with_reason';

export type GlPostingReferenceStatus =
  | 'accounting_mapping_available'
  | 'accounting_mapping_unavailable'
  | 'posting_pending'
  | 'synthetic_posted_reference'
  | 'reconciliation_difference';

export type CashFlowStage =
  | 'cash_received'
  | 'cash_counted'
  | 'cash_handed_over'
  | 'cash_deposited'
  | 'deposit_acknowledged_by_bank'
  | 'deposit_reconciled';

// ----------------------------------------------------------------------------
// 2. BANK & CASH ACCOUNT DIRECTORY & GOVERNANCE
// ----------------------------------------------------------------------------

export type TreasuryAccountCategory = 'operating_bank' | 'disbursement_bank' | 'foreign_currency_bank' | 'petty_cash_vault' | 'cashier_float';

export type TreasuryAccountOperationalStatus = 'active' | 'under_review' | 'suspended' | 'closed';

export interface TreasuryAccountReference {
  id: string;                                 // e.g. "TREAS-ACC-SNB-01"
  internalAccountCode: string;               // e.g. "BANK-SNB-SAR-01"
  displayNameAr: string;
  displayNameEn: string;
  institutionReference: string;              // Fictional Bank name e.g. "البنك الأهلي السعودي (محاكاة)"
  accountType: TreasuryAccountCategory;
  currency: 'SAR' | 'USD' | 'EUR';
  maskedAccountNumber: string;               // Masked fictional e.g. "SA94****8812"
  purposeDescriptionAr: string;
  ownershipReference: string;                // "Specialized Hospital Legal Entity"
  branchId: TreasuryBranchId;
  applicableGlAccountCode: string;           // Reuses GL account e.g. "1111" or "GL-1110-CASH-SNB"
  operationalStatus: TreasuryAccountOperationalStatus;
  effectiveDate: string;                     // YYYY-MM-DD
  lastStatementDate?: string;
  lastReconciliationDate?: string;
  isSyntheticReference: true;
}

export type BankAccountChangeRequestStatus = 'pending_review' | 'approved' | 'rejected' | 'applied';

export interface BankAccountChangeRequest {
  id: string;                                // e.g. "BACR-2026-001"
  accountId: string;
  requestedBy: string;
  requestedAt: string;
  changeType: 'signers_update' | 'credit_limit' | 'branch_reassignment' | 'status_change';
  currentValues: Record<string, any>;
  proposedValues: Record<string, any>;
  justificationAr: string;
  status: BankAccountChangeRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotesAr?: string;
  impactsPendingInstructionsCount: number;
}

// ----------------------------------------------------------------------------
// 3. AP PROPOSALS & PAYMENT AUTHORIZATIONS
// ----------------------------------------------------------------------------

export type BeneficiaryVerificationState =
  | 'verified_active'
  | 'bank_change_pending_review'
  | 'unverified_hold'
  | 'beneficiary_reference_unavailable';

export interface SourceTransactionReference {
  sourceModule: 'accounts_payable' | 'patient_cashiering' | 'general_ledger' | 'procurement' | 'treasury_internal';
  sourceId: string;
  sourceDocNumber: string;
  sourceDescriptionAr: string;
  sourceAmountSar: number;
  currency: string;
  isReadOnlyReference: true;
}

export interface PaymentAuthorization {
  id: string;                                // e.g. "PAY-AUTH-2026-001"
  proposalBatchId: string;                   // Linked to AP PaymentProposalBatch.id
  proposalBatchNumber: string;
  supplierId: string;
  supplierNameAr: string;
  invoiceReferences: string[];               // ["GULF-INV-2026-881"]
  currency: 'SAR' | 'USD' | 'EUR';
  proposedAmount: number;
  creditsAndAdvancesReflectedSar: number;
  dueDate: string;
  beneficiaryAccountName: string;
  beneficiaryIbanMasked: string;
  beneficiaryVerificationStatus: BeneficiaryVerificationState;
  apHoldReference?: string;
  glPostingEligibilityReference: 'eligible' | 'blocked_by_period' | 'mapping_missing';
  treasuryOwnerStaffName: string;
  status: TreasuryApprovalStatus;
  authorizedAmount: number;
  rejectionReasonAr?: string;
  makerStaffName?: string;
  checkerStaffName?: string;
  authorizedAt?: string;
  reviewNotesAr?: string;
}

// ----------------------------------------------------------------------------
// 4. PAYMENT INSTRUCTIONS & SIMULATED BANK RESPONSE
// ----------------------------------------------------------------------------

export interface PaymentInstructionLine {
  id: string;
  authorizationId: string;
  invoiceReference: string;
  supplierNameAr: string;
  beneficiaryIbanMasked: string;
  amount: number;
  currency: 'SAR' | 'USD' | 'EUR';
  status: 'pending' | 'settled' | 'rejected' | 'returned';
}

// ISO 20022 Standards Compliance Reference
// pain.001 = Customer Credit Transfer Initiation
// pain.002 = Customer Payment Status Report
export type Iso20022MessageType = 'pain.001' | 'pain.002' | 'camt.053' | 'camt.054';

// ISO 20022 Transaction Status Codes (pain.002 <TxSts>):
// ACTC: Accepted Technical Validation (Technical validation passed; NOT settlement)
// ACCP: Accepted Customer Profile (Debtor profile checks passed; NOT settlement)
// ACSP: Accepted Settlement In Process (Settlement is underway; NOT final settlement)
// ACSC: Accepted Settlement Completed Debtor Side (Debtor agent settlement completed)
// ACCC: Accepted Creditor Settlement Completed (Creditor agent settlement completed)
// RJCT: Rejected (Payment rejected)
// PDNG: Pending (Pending processing)
export type Iso20022StatusCode =
  | 'ACTC'
  | 'ACCP'
  | 'ACSP'
  | 'ACSC'
  | 'ACCC'
  | 'RJCT'
  | 'PDNG';

// ISO 20022 Status Reason Codes (pain.002 <StsRsnInf>/<Rsn>/<Cd>):
// AC04 is a REASON code (Closed Account), NOT a payment status code!
export type Iso20022ReasonCode =
  | 'AC04' // Closed Account Number
  | 'AM04' // Insufficient Funds
  | 'AG01' // Transaction Forbidden
  | 'RC01' // Bank Identifier Invalid
  | 'NARR' // Narrative / Other
  | 'NONE'; // None / Successful

// Illustrative approval policy configuration (NOT hardcoded hospital policy)
export interface TreasuryApprovalPolicyConfig {
  policyNameAr: string;
  isIllustrativeConfiguration: true;
  cfoSecondaryApprovalThresholdSar: number;
  requireDualSignOffAboveThreshold: boolean;
  notesAr: string;
}

export const ILLUSTRATIVE_APPROVAL_POLICY: TreasuryApprovalPolicyConfig = {
  policyNameAr: 'سياسة الاعتمادات المالية التوضيحية (ILLUSTRATIVE_CONFIGURATION)',
  isIllustrativeConfiguration: true,
  cfoSecondaryApprovalThresholdSar: 100000.0,
  requireDualSignOffAboveThreshold: true,
  notesAr: 'نموذج إعداد توضيحي (ILLUSTRATIVE_CONFIGURATION) لبيان تدفقات الرقابة الثنائية ولا يمثل سياسة عامة موحدة للمستشفى.'
};

export interface BankResponse {
  id: string;                                // Stable ID e.g. "RESP-BANK-001"
  instructionId: string;
  responseTimestamp: string;
  messageType?: Iso20022MessageType;         // e.g. "pain.002"
  isoStatusCode?: Iso20022StatusCode;        // Standard ISO 20022 Status Code: ACTC, ACCP, ACSP, ACSC, ACCC, RJCT
  statusReasonCode?: Iso20022ReasonCode;     // Reason code e.g. AC04 (Closed Account), AM04, etc.
  status: BankResponseStatus;                // Mapped Treasury internal status
  bankTransactionRef: string;               // e.g. "SARIE-REF-9988112"
  confirmedAmount: number;
  rejectedAmount: number;
  returnedAmount: number;
  feeDeductedAmount: number;
  bankResponseCode: string;                  // Raw bank code e.g. "ACSC", "ACTC", "RJCT"
  bankMessageAr: string;
  isConflictingWithPriorResponse?: boolean;
  isSyntheticFixture: true;
}

export interface PaymentInstruction {
  id: string;                                // e.g. "PI-2026-SARIE-001"
  proposalBatchReference: string;
  authorizationId: string;
  beneficiaryName: string;
  beneficiaryIbanMasked: string;
  sourceAccountId: string;                   // TreasuryAccountReference.id
  currency: 'SAR' | 'USD' | 'EUR';
  amount: number;
  scheduledDate: string;
  executionRail: 'sarie_instant' | 'sarie_rtgs' | 'internal_book_transfer' | 'cheque';
  makerStaffName: string;
  checkerStaffName: string;
  version: number;
  status: PaymentInstructionStatus;
  lines: PaymentInstructionLine[];
  submissionTimestamp?: string;
  bankResponses: BankResponse[];
  confirmedAmount: number;
  rejectedAmount: number;
  allocationStatus: PaymentAllocationStatus;
  apAcknowledgedAmount: number;
  reconciledBankAmount: number;
}

// ----------------------------------------------------------------------------
// 5. CASH OFFICE, CUSTODY, HANDOVERS & DEPOSITS
// ----------------------------------------------------------------------------

export interface CashCustodyRecord {
  id: string;                                // e.g. "CUST-2026-W38-01"
  custodianStaffName: string;
  locationContext: string;                   // e.g. "خزينة قسم الطوارئ - الكاونتر الرئيسي"
  branchId: TreasuryBranchId;
  custodyType: 'patient_cashier_handover' | 'petty_cash_float';
  handoverTimestamp: string;
  sourceReceiptCount: number;                // Receipts from Patient Cashiering
  expectedAmountSar: number;
  countedAmountSar: number;
  varianceSar: number;                       // counted - expected (shortage < 0, overage > 0)
  varianceReasonAr?: string;
  stage: CashFlowStage;
  acknowledgedByTreasuryStaffName?: string;
  acknowledgedAt?: string;
  depositBatchId?: string;
}

export type DepositBatchStatus =
  | 'draft_preparation'
  | 'bag_sealed_and_logged'
  | 'submitted_to_cash_carrier'
  | 'bank_received_and_counted'
  | 'reconciled_with_statement'
  | 'discrepancy_flagged';

export interface DepositBatch {
  id: string;                                // e.g. "DEP-BATCH-2026-001"
  batchNumber: string;                       // e.g. "DEP-2026-0922-01"
  custodyRecordIds: string[];
  targetBankAccountId: string;               // TreasuryAccountReference.id
  branchId: TreasuryBranchId;
  cashBagSealNumber: string;                 // e.g. "SEAL-SNB-99812"
  carrierReference: string;                  // e.g. "شركة تحصيل النقد والأمن (محاكاة)"
  expectedDepositAmountSar: number;
  bankAcknowledgedAmountSar: number;
  varianceSar: number;
  submissionDate: string;
  bankDepositReceiptNumber?: string;
  status: DepositBatchStatus;
  statementLineId?: string;                  // Matched BankStatementLine.id
}

// ----------------------------------------------------------------------------
// 6. BANK STATEMENTS & STATEMENT VALIDATION
// ----------------------------------------------------------------------------

export type StatementValidationStatus =
  | 'pending_validation'
  | 'arithmetic_validated'
  | 'continuity_verified'
  | 'validation_failed';

export interface BankStatementLine {
  id: string;                                // e.g. "STMT-L-SNB-001"
  statementId: string;
  bookingDate: string;                       // YYYY-MM-DD
  valueDate?: string;
  amount: number;                            // Positive number
  direction: 'debit' | 'credit';             // Bank perspective: debit = outflow, credit = inflow
  descriptionAr: string;
  bankReference: string;                     // e.g. "TXN-SNB-98711"
  counterpartyReference?: string;            // e.g. "الشركة الخليجية"
  transactionType: 'wire_transfer' | 'cheque_cleared' | 'cash_deposit' | 'pos_settlement' | 'bank_charge' | 'interest_credit' | 'return_reversal';
  isReturnOrReversal?: boolean;
  matchStatus: BankReconciliationStatus;
  matchedInternalDocId?: string;
}

export interface BankStatement {
  id: string;                                // e.g. "STMT-SNB-2026-M09"
  statementReferenceNumber: string;          // e.g. "CAMT053-SNB-20260921"
  bankAccountId: string;                     // TreasuryAccountReference.id
  currency: 'SAR' | 'USD' | 'EUR';
  periodStart: string;                       // YYYY-MM-DD
  periodEnd: string;                         // YYYY-MM-DD
  openingBalance: number;
  closingBalance: number;
  calculatedMovementTotal: number;           // Net of credits minus debits
  importTimestamp: string;
  importFormat: 'camt_053' | 'mt940' | 'bai2' | 'manual_simulation';
  validationStatus: StatementValidationStatus;
  continuityWithPreviousStatement: 'verified' | 'discrepancy' | 'previous_statement_unavailable';
  lines: BankStatementLine[];
  validationErrorsAr: string[];
}

// ----------------------------------------------------------------------------
// 7. RECONCILIATION WORKBENCH & REVERSALS
// ----------------------------------------------------------------------------

export type ReconciliationMatchNature =
  | 'one_to_one'
  | 'one_to_many'
  | 'many_to_one'
  | 'manual_exception_pairing'
  | 'system_rule_matched';

export interface BankReconciliationMatch {
  id: string;                                // e.g. "REC-MATCH-001"
  reconciliationSessionId: string;
  bankStatementLineIds: string[];
  internalTransactionReferences: string[];
  matchNature: ReconciliationMatchNature;
  matchedAmount: number;
  differenceAmount: number;
  confidenceScore: number;                   // 0 - 100%
  confidenceExplanationAr: string;
  matchedByStaffName: string;
  matchedAt: string;
  isReversed?: boolean;
  reversalReasonAr?: string;
}

export type BankReconciliationSessionStatus =
  | 'statement_validated'
  | 'draft_matching'
  | 'matching_in_progress'
  | 'exceptions_pending'
  | 'ready_for_approval'
  | 'approved_in_simulation'
  | 'reconciliation_reversed';

export interface BankReconciliation {
  id: string;                                // e.g. "REC-SESS-SNB-2026-09"
  statementId: string;
  bankAccountId: string;
  sessionDate: string;
  status: BankReconciliationSessionStatus;
  totalBankLinesCount: number;
  matchedBankLinesCount: number;
  unmatchedBankLinesCount: number;
  totalStatementClosingBalance: number;
  totalInternalBookBalance: number;
  adjustedBankBalance: number;
  adjustedBookBalance: number;
  unresolvedVariance: number;
  matches: BankReconciliationMatch[];
  reconciliationSignoffStaffName?: string;
  signoffAt?: string;
  reversalReasonAr?: string;
}

// ----------------------------------------------------------------------------
// 8. INTER-ACCOUNT TRANSFERS
// ----------------------------------------------------------------------------

export type InterAccountTransferStatus =
  | 'draft'
  | 'authorized'
  | 'instruction_released'
  | 'source_debited'
  | 'in_transit'
  | 'destination_credited'
  | 'completed'
  | 'failed';

export interface InterAccountTransfer {
  id: string;                                // e.g. "TRF-2026-001"
  transferNumber: string;                    // e.g. "INT-TRF-0922"
  sourceAccountId: string;                   // TreasuryAccountReference.id
  destinationAccountId: string;              // TreasuryAccountReference.id
  currency: 'SAR' | 'USD' | 'EUR';
  amount: number;
  fxConversionRate?: number;                 // e.g. 3.75 for USD to SAR
  convertedDestinationAmount?: number;
  requestedDate: string;
  authorizedByStaffName: string;
  instructionReference: string;
  externalStatusEvidence?: string;
  status: InterAccountTransferStatus;
  sourceStatementLineId?: string;
  destinationStatementLineId?: string;
  notesAr: string;
}

// ----------------------------------------------------------------------------
// 9. EXCEPTIONS, DISCREPANCIES & GL CLEARING BRIDGES
// ----------------------------------------------------------------------------

export type TreasuryExceptionType =
  | 'bank_charge_discovered'
  | 'interest_income_unrecorded'
  | 'conflicting_bank_response'
  | 'rejected_payment_investigation'
  | 'unmatched_cash_deposit'
  | 'cash_count_shortage'
  | 'cash_count_overage'
  | 'ambiguous_candidate_match'
  | 'statement_continuity_break'
  | 'missing_gl_account_mapping';

export interface TreasuryException {
  id: string;                                // e.g. "EXC-TR-2026-001"
  exceptionType: TreasuryExceptionType;
  relatedAccountId: string;
  relatedEntityId?: string;                  // statement line, instruction, custody record
  titleAr: string;
  descriptionAr: string;
  amountSar: number;
  detectedAt: string;
  status: 'open_investigation' | 'action_proposed' | 'resolved' | 'escalated_to_controller';
  proposedAccountingReference?: {
    suggestedGlAccountCode: string;
    debitCredit: 'debit' | 'credit';
    notesAr: string;
  };
  resolutionNotesAr?: string;
  resolvedByStaffName?: string;
  resolvedAt?: string;
}

// ----------------------------------------------------------------------------
// 10. LIQUIDITY VISIBILITY & TREASURY STATE CONTAINER
// ----------------------------------------------------------------------------

export interface CurrencyLiquidityView {
  currency: 'SAR' | 'USD' | 'EUR';
  bankReportedBalance: number;
  internalBookBalance: number;
  pendingOutflowsSar: number;
  expectedInflowsSar: number;
  restrictedFloatBalance: number;
  reconciliationDifferenceSar: number;
  demoAvailableCashSar: number;
  hasUnavailableDataWarning: boolean;
}

export interface LiquidityProjection {
  snapshotDate: string;
  currencies: CurrencyLiquidityView[];
  notesAr: string;
}

export type TreasuryPersona =
  | 'treasury_clerk'
  | 'treasury_supervisor'
  | 'finance_controller'
  | 'cash_custodian'
  | 'reconciliation_reviewer';

export interface TreasuryState {
  accounts: TreasuryAccountReference[];
  accountChangeRequests: BankAccountChangeRequest[];
  authorizations: PaymentAuthorization[];
  instructions: PaymentInstruction[];
  custodyRecords: CashCustodyRecord[];
  depositBatches: DepositBatch[];
  statements: BankStatement[];
  reconciliations: BankReconciliation[];
  transfers: InterAccountTransfer[];
  exceptions: TreasuryException[];
  activePersona: TreasuryPersona;
  selectedBranchId: TreasuryBranchId;
  selectedAccountId: string;
}
