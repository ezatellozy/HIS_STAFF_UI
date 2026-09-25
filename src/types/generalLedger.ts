// ============================================================================
// HEALTHCARE FINANCE CORE: GENERAL LEDGER & CHART OF ACCOUNTS (SYNTHETIC UI/UX)
// ============================================================================

export type AccountingFramework = 
  | 'IFRS_SOCPA_ILLUSTRATIVE'
  | 'CUSTOM_HOSPITAL_POLICY'
  | 'NOT_SPECIFIED';

export type AccountCategory = 
  | 'asset' 
  | 'liability' 
  | 'equity' 
  | 'revenue' 
  | 'expense';

export type AccountType = 
  | 'group'      // Parent/Header account - Non-postable roll-up
  | 'posting';   // Leaf account - Direct journal posting eligible

export type NormalBalance = 'debit' | 'credit';

export type AccountLifecycleState = 
  | 'draft' 
  | 'under_review' 
  | 'active' 
  | 'inactive';

// ----------------------------------------------------------------------------
// 1. LEDGER PROFILE & ORGANIZATIONAL ENTITY CONFIGURATION
// ----------------------------------------------------------------------------

export interface AccountingEntityConfig {
  entityId: string;
  legalNameAr: string;
  legalNameEn: string;
  registrationNumber?: string;
  taxRegistrationNumber?: string;
  organizationType: 'single_hospital_with_branches' | 'healthcare_group' | 'standalone_clinic';
  isSyntheticDemo: boolean;
}

export interface CurrencyConfig {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  decimalPlaces: number;
  isFunctional: boolean;
  isPresentation: boolean;
}

export interface LedgerProfile {
  ledgerId: string;
  ledgerNameAr: string;
  ledgerNameEn: string;
  accountingEntity: AccountingEntityConfig;
  applicableFramework: AccountingFramework;
  functionalCurrency: CurrencyConfig;
  presentationCurrency: CurrencyConfig;
  fiscalCalendarId: string;
  status: 'active_simulation' | 'configuration_draft';
  effectiveDate: string;
  provenanceNote: string;
}

// ----------------------------------------------------------------------------
// 2. CHART OF ACCOUNTS HIERARCHY & DEFINITIONS
// ----------------------------------------------------------------------------

export interface AccountRestrictions {
  requiresCostCenter: boolean;
  requiresDepartment: boolean;
  requiresBranch: boolean;
  requiresProject: boolean;
  disallowManualJournal: boolean;
  reconciliationKey?: 'accounts_payable' | 'inventory_clearing' | 'patient_receivable' | 'bank_clearing' | 'none';
}

export interface AccountNode {
  id: string;
  accountCode: string;             // e.g. "1000", "1110", "2010"
  nameAr: string;
  nameEn: string;
  category: AccountCategory;
  accountType: AccountType;        // 'group' vs 'posting'
  normalBalance: NormalBalance;    // 'debit' vs 'credit'
  parentAccountCode?: string | null;
  level: number;                   // 1 = Class, 2 = Group, 3 = Sub-group, 4 = Leaf
  state: AccountLifecycleState;
  effectiveFrom: string;
  effectiveTo?: string | null;
  descriptionAr?: string;
  restrictions: AccountRestrictions;
  historicalEntryCount?: number;
  isSyntheticSample: boolean;
}

// ----------------------------------------------------------------------------
// 3. FINANCIAL DIMENSIONS
// ----------------------------------------------------------------------------

export type FinancialDimensionType = 
  | 'branch' 
  | 'department' 
  | 'cost_center' 
  | 'project';

export interface FinancialDimensionValue {
  code: string;
  nameAr: string;
  nameEn: string;
  dimensionType: FinancialDimensionType;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface DimensionCombinationRule {
  id: string;
  nameAr: string;
  accountPattern: string;         // e.g. "5*" (all expenses)
  mandatoryDimensions: FinancialDimensionType[];
  prohibitedDimensions: FinancialDimensionType[];
  isActive: boolean;
}

export interface JournalLineDimensions {
  branchId?: string;
  departmentId?: string;
  costCenterCode?: string;
  projectId?: string;
}

// ----------------------------------------------------------------------------
// 4. FISCAL CALENDARS & ACCOUNTING PERIODS
// ----------------------------------------------------------------------------

export type PeriodType = 'standard' | 'adjustment' | 'year_end_preview';

export type PeriodStatus = 
  | 'open' 
  | 'on_hold' 
  | 'close_requested' 
  | 'closed_simulated' 
  | 'reopen_requested' 
  | 'reopened_simulated';

export interface AccountingPeriod {
  id: string;                      // e.g. "FY2026-P01"
  calendarId: string;
  fiscalYear: string;              // e.g. "2026" or "2026-2027"
  periodNumber: number;            // 1..12 or 13 for adjustment
  periodNameAr: string;
  periodNameEn: string;
  startDate: string;               // ISO YYYY-MM-DD
  endDate: string;                 // ISO YYYY-MM-DD
  periodType: PeriodType;
  status: PeriodStatus;
  isPostingEligible: boolean;      // True if 'open' or 'reopened_simulated'
  closeChecklistSummary?: string;
  reopenReason?: string;
}

export interface FiscalCalendar {
  id: string;
  nameAr: string;
  nameEn: string;
  fiscalYearName: string;
  calendarType: 'calendar_year_standard' | 'non_calendar_fiscal_year';
  startDate: string;
  endDate: string;
  hasAdjustmentPeriod: boolean;
  periods: AccountingPeriod[];
  isSyntheticSample: boolean;
}

// ----------------------------------------------------------------------------
// 5. JOURNAL ENTRIES & VOUCHERS
// ----------------------------------------------------------------------------

export type JournalCategory = 
  | 'manual_adjustment' 
  | 'accrual' 
  | 'reversal' 
  | 'correction' 
  | 'opening_balance' 
  | 'source_integration';

export type JournalStatus = 
  | 'draft' 
  | 'validated' 
  | 'under_approval' 
  | 'approved' 
  | 'posted_simulated' 
  | 'rejected' 
  | 'cancelled' 
  | 'reversed';

export interface JournalLine {
  id: string;
  lineNumber: number;
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  dimensions: JournalLineDimensions;
  descriptionAr: string;
  debit: number;
  credit: number;
  transactionCurrency: string;     // e.g. "SAR", "USD"
  exchangeRate: number;            // e.g. 1.0 or 3.75
  baseDebit: number;               // in functional currency
  baseCredit: number;              // in functional currency
  supportingReference?: string;
}

export interface JournalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  currency: string;
}

export interface JournalHeader {
  id: string;                      // e.g. "JRN-2026-001"
  voucherNumber?: string;          // e.g. "VCH-2026-001" assigned on simulated post
  category: JournalCategory;
  descriptionAr: string;
  accountingDate: string;          // YYYY-MM-DD
  periodId: string;
  currency: string;
  origin: 'manual_ui' | 'source_event_import' | 'reversal_engine' | 'correction_engine';
  supportingReference?: string;
  preparedByPersona: string;       // Synthetic persona name e.g. "Amal Al-Sharif (GL Accountant)"
  approvedByPersona?: string;
  status: JournalStatus;
  lines: JournalLine[];
  validationSnapshot?: JournalValidationResult;
  simulatedPostingTimestamp?: string;
  reversalRefJournalId?: string;   // Reference to reversing journal
  originalJournalId?: string;      // If this is a reversal or correction
  correctionReason?: string;
}

// ----------------------------------------------------------------------------
// 6. POSTED VOUCHER AUDIT SNAPSHOT (MOCK IMMUTABILITY)
// ----------------------------------------------------------------------------

export interface GeneralLedgerVoucherEntry {
  voucherId: string;
  journalId: string;
  voucherNumber: string;
  accountingDate: string;
  periodId: string;
  category: JournalCategory;
  descriptionAr: string;
  totalDebitSar: number;
  totalCreditSar: number;
  postedByPersona: string;
  postedAt: string;
  isReversed: boolean;
  reversedByVoucherId?: string;
  reversalReason?: string;
  correctedByVoucherId?: string;
  lines: JournalLine[];
  sourceReference?: string;
}

// ----------------------------------------------------------------------------
// 7. REVERSAL & CORRECTION WORKFLOWS
// ----------------------------------------------------------------------------

export interface ReversalRequest {
  originalJournalId: string;
  reversalDate: string;
  periodId: string;
  reasonAr: string;
  approvedByPersona: string;
}

export interface CorrectionRequest {
  originalJournalId: string;
  reversalDate: string;
  correctionDate: string;
  periodId: string;
  reasonAr: string;
  approvedByPersona: string;
}

// ----------------------------------------------------------------------------
// 8. OPENING BALANCES & PROVENANCE
// ----------------------------------------------------------------------------

export interface OpeningBalanceRecord {
  id: string;
  openingDate: string;
  fiscalYear: string;
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  dimensions: JournalLineDimensions;
  debitBalance: number;
  creditBalance: number;
  currency: string;
  sourceType: 'prior_period_closing_reference' | 'legacy_migration_extract' | 'manual_initialization';
  sourceDocumentRef: string;
  provenanceNote: string;
  status: 'verified' | 'unverified' | 'opening_balance_unavailable';
  isSyntheticSample: boolean;
}

// ----------------------------------------------------------------------------
// 9. READ-ONLY UPSTREAM SOURCE ACCOUNTING EVENTS
// ----------------------------------------------------------------------------

export type SourceModule = 
  | 'accounts_payable' 
  | 'procurement' 
  | 'patient_billing' 
  | 'inventory_materials' 
  | 'treasury';

export type SourceEventMappingStatus = 
  | 'SOURCE_AVAILABLE' 
  | 'SOURCE_UNAVAILABLE' 
  | 'SOURCE_STALE' 
  | 'UNMAPPED_ACCOUNT' 
  | 'NOT_VERIFIED' 
  | 'READY_FOR_SIMULATION' 
  | 'SYNTHETIC_POSTED';

export interface SourceAccountingEvent {
  id: string;                      // Composite key: sourceModule + documentId + eventType + version
  sourceModule: SourceModule;
  sourceDocumentId: string;        // e.g. "INV-2026-0891" or "PO-2026-00401"
  businessEventType: string;       // e.g. "SUPPLIER_INVOICE_RECOGNITION" or "SUPPLIER_PAYMENT_DISBURSEMENT"
  eventVersion: number;
  lineAllocationId?: string;
  accountingDate: string;
  originalAmount: number;
  currency: string;
  mappingStatus: SourceEventMappingStatus;
  targetDebitAccountCode?: string;
  targetCreditAccountCode?: string;
  requiredCostCenterCode?: string;
  intendedTreatmentNoteAr: string;
  simulatedVoucherId?: string;
  freshnessTimestamp: string;
}

export interface PostingProfileRule {
  id: string;
  sourceModule: SourceModule;
  businessEventType: string;
  descriptionAr: string;
  targetDebitAccountCode: string;
  targetCreditAccountCode: string;
  mandatoryDimensions: FinancialDimensionType[];
  isActive: boolean;
}

// ----------------------------------------------------------------------------
// 10. TRIAL BALANCE & ACCOUNT ACTIVITY
// ----------------------------------------------------------------------------

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  accountNameEn: string;
  category: AccountCategory;
  accountType: AccountType;
  normalBalance?: NormalBalance;
  level: number;
  parentAccountCode?: string | null;
  openingDebitSar: number;
  openingCreditSar: number;
  periodDebitSar: number;
  periodDebitMovementSar?: number;
  periodCreditSar: number;
  periodCreditMovementSar?: number;
  closingDebitSar: number;
  closingCreditSar: number;
  isBalanced: boolean;
}

export interface TrialBalanceSummary {
  periodId?: string;
  fiscalYear: string;
  currency: string;
  totalOpeningDebitSar: number;
  totalOpeningCreditSar: number;
  totalPeriodDebitSar: number;
  totalPeriodDebitMovementSar?: number;
  totalPeriodCreditSar: number;
  totalPeriodCreditMovementSar?: number;
  totalClosingDebitSar: number;
  totalClosingCreditSar: number;
  netDebitCreditDifferenceSar: number;
  isMathematicallyBalanced: boolean;
  status: 'VERIFIED_BALANCED' | 'UNBALANCED_EXCEPTION' | 'NOT_VERIFIED_INCOMPLETE_DATA';
  rows: TrialBalanceRow[];
  timestamp: string;
}

export interface AccountActivitySummary {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  openingBalanceSar: number;
  totalPeriodDebitSar: number;
  totalDebitSar?: number;
  totalPeriodCreditSar: number;
  totalCreditSar?: number;
  closingBalanceSar: number;
  entries: Array<{
    voucherNumber: string;
    accountingDate: string;
    periodId: string;
    journalCategory: JournalCategory;
    descriptionAr: string;
    debitSar: number;
    debit?: number;
    creditSar: number;
    credit?: number;
    runningBalanceSar: number;
    dimensions: JournalLineDimensions;
    supportingReference?: string;
    isReversed?: boolean;
  }>;
  lines?: AccountActivitySummary['entries'];
}

// ----------------------------------------------------------------------------
// 11. FINANCIAL RECONCILIATION
// ----------------------------------------------------------------------------

export interface GlReconciliationRecord {
  id: string;
  glAccountCode: string;
  glControlAccountCode?: string;
  glAccountNameAr: string;
  glControlAccountNameAr?: string;
  glBalanceSar: number;
  subledgerModule: SourceModule;
  subledgerType?: string;
  subledgerNameAr: string;
  subledgerReferenceAmountSar?: number;
  subledgerBalanceSar?: number;
  discrepancyAmountSar?: number;
  varianceSar?: number;
  status: 'reconciled' | 'discrepancy' | 'subledger_unsupported' | 'missing_valuation';
  investigationStatusAr: string;
  notesAr: string;
  lastCheckedDate: string;
}

// ----------------------------------------------------------------------------
// 12. PERIOD CLOSE READINESS & OPERATIONAL CHECKLIST
// ----------------------------------------------------------------------------

export interface PeriodCloseChecklist {
  periodId: string;
  periodNameAr: string;
  fiscalYear: string;
  unpostedDraftJournalsCount: number;
  unapprovedJournalsCount: number;
  failedValidationCount: number;
  unmappedSourceEventsCount: number;
  unresolvedReconciliationsCount: number;
  subledgerReconciliationDiscrepanciesCount?: number;
  trialBalanceBalanced: boolean;
  missingOpeningBalancesCount: number;
  overallReadiness: 'ready_for_simulated_close' | 'blocked_by_exceptions' | 'partially_ready';
  blockingIssuesListAr: string[];
  advisoryWarningsListAr: string[];
}

// ----------------------------------------------------------------------------
// 13. COMBINED GENERAL LEDGER ROOT STATE
// ----------------------------------------------------------------------------

export interface GeneralLedgerState {
  ledgerProfile: LedgerProfile;
  accounts: AccountNode[];
  dimensions: {
    branches: FinancialDimensionValue[];
    departments: FinancialDimensionValue[];
    costCenters: FinancialDimensionValue[];
    projects: FinancialDimensionValue[];
    combinationRules: DimensionCombinationRule[];
  };
  calendars: FiscalCalendar[];
  activeCalendarId: string;
  activePeriodId: string;
  journals: JournalHeader[];
  postedVouchers: GeneralLedgerVoucherEntry[];
  openingBalances: OpeningBalanceRecord[];
  sourceEvents: SourceAccountingEvent[];
  postingProfiles: PostingProfileRule[];
  reconciliationRecords: GlReconciliationRecord[];
  activePersona: {
    id: string;
    nameAr: string;
    roleTitleAr: string;
    permissionLevel: 'clerk' | 'senior_accountant' | 'controller' | 'auditor';
  };
}
