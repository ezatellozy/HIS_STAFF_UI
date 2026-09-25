// ============================================================================
// HEALTHCARE FINANCE CORE: DETERMINISTIC GENERAL LEDGER STATE & CALCULATION ENGINE
// ============================================================================

import {
  GeneralLedgerState,
  AccountNode,
  JournalHeader,
  JournalLine,
  JournalValidationResult,
  GeneralLedgerVoucherEntry,
  ReversalRequest,
  CorrectionRequest,
  TrialBalanceSummary,
  TrialBalanceRow,
  AccountActivitySummary,
  PeriodCloseChecklist,
  OpeningBalanceRecord,
  AccountingPeriod,
  DimensionCombinationRule,
  LedgerProfile,
  GlReconciliationRecord
} from '../types/generalLedger';
import { getInitialGeneralLedgerState } from '../data/mockGeneralLedgerData';

// ----------------------------------------------------------------------------
// 1. DETERMINISTIC JOURNAL VALIDATION ENGINE
// ----------------------------------------------------------------------------

export function validateJournal(
  header: JournalHeader,
  lines: JournalLine[],
  accounts: AccountNode[],
  periods: AccountingPeriod[],
  _profile: LedgerProfile,
  combinationRules: DimensionCombinationRule[] = []
): JournalValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // A. Header Level Validation
  if (!header.accountingDate) {
    errors.push('تاريخ القيد المحاسبي إلزامي ولا يمكن تركه فارغاً.');
  }

  // Check period eligibility and date alignment
  const matchedPeriod = periods.find(p => p.id === header.periodId);
  if (!matchedPeriod) {
    errors.push(`الفترة المحاسبية المحددة (${header.periodId || 'غير محدد'}) غير موجودة بالنظام.`);
  } else {
    // Check if accounting date falls within the period
    if (header.accountingDate < matchedPeriod.startDate || header.accountingDate > matchedPeriod.endDate) {
      errors.push(`تاريخ القيد (${header.accountingDate}) يقع خارج نطاق الفترة المالية المحددة (${matchedPeriod.periodNameAr}: من ${matchedPeriod.startDate} إلى ${matchedPeriod.endDate}).`);
    }

    // Check if period is open for posting
    if (!matchedPeriod.isPostingEligible || matchedPeriod.status === 'closed_simulated' || matchedPeriod.status === 'on_hold') {
      errors.push(`الفترة المالية (${matchedPeriod.periodNameAr}) مغلقة أو معلقة حالياً (${matchedPeriod.status})، ولا يمكن إجراء ترحيل في فترة غير مفتوحة.`);
    }
  }

  // B. Lines Quantity & Structure
  if (!lines || lines.length < 2) {
    errors.push('يجب أن يحتوي القيد المحاسبي على بندين على الأقل (طرف مدين وطرف دائن).');
    return {
      isValid: false,
      errors,
      warnings,
      totalDebit: 0,
      totalCredit: 0,
      difference: 0,
      currency: header.currency || 'SAR'
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  // C. Line by Line Inspection
  lines.forEach((line, index) => {
    const lineNum = line.lineNumber || index + 1;

    // Line Amount Checks
    if (isNaN(line.debit) || isNaN(line.credit)) {
      errors.push(`السطر ${lineNum}: القيمة المدخلة للمدين أو الدائن غير صالحة حسابياً.`);
      return;
    }

    if (line.debit < 0 || line.credit < 0) {
      errors.push(`السطر ${lineNum}: المبالغ المالية يجب أن تكون موجبة. القيم السالبة غير مسموح بها في قيود اليومية.`);
    }

    if (line.debit === 0 && line.credit === 0) {
      errors.push(`السطر ${lineNum}: يجب تحديد مبلغ مدين أو دائن أكبر من الصفر.`);
    }

    if (line.debit > 0 && line.credit > 0) {
      errors.push(`السطر ${lineNum}: لا يمكن تسجيل مبلغ مدين ودائن معاً في نفس السطر المحاسبي.`);
    }

    // FX Validation: foreign currency must have positive rate
    if (line.transactionCurrency && line.transactionCurrency !== 'SAR') {
      if (!line.exchangeRate || line.exchangeRate <= 0) {
        errors.push(`السطر ${lineNum}: عملة المعاملة أجنبية (${line.transactionCurrency}) ولكن لم يتم توفير سعر صرف محدد وصحيح.`);
      }
    }

    // Accumulate in base accounting currency
    const rate = line.exchangeRate > 0 ? line.exchangeRate : 1.0;
    const baseDr = line.debit * rate;
    const baseCr = line.credit * rate;
    totalDebit += baseDr;
    totalCredit += baseCr;

    // Account Lookup & Rules
    const account = accounts.find(a => a.accountCode === line.accountCode || a.id === line.accountId);
    if (!account) {
      errors.push(`السطر ${lineNum}: الحساب المحاسبي المحدد (${line.accountCode}) غير موجود بدليل الحسابات.`);
      return;
    }

    // Rule: Leaf account only (cannot post to group/parent accounts)
    if (account.accountType === 'group') {
      errors.push(`السطر ${lineNum}: الحساب (${account.accountCode} - ${account.nameAr}) هو حساب تجميعي/رئيسي (Group)، ويحظر الترحيل المباشر عليه.`);
    }

    // Rule: Account must be active
    if (account.state !== 'active') {
      errors.push(`السطر ${lineNum}: الحساب (${account.accountCode} - ${account.nameAr}) غير نشط حالياً (حالة: ${account.state})، ولا يقبل حركات محاسبية جديدة.`);
    }

    // Dimension Requirements from Account Restrictions
    if (account.restrictions.requiresBranch && !line.dimensions?.branchId) {
      errors.push(`السطر ${lineNum}: الحساب (${account.accountCode}) يلزم تحديد بُعد الفرع.`);
    }

    if (account.restrictions.requiresCostCenter && !line.dimensions?.costCenterCode) {
      errors.push(`السطر ${lineNum}: الحساب (${account.accountCode}) يلزم تحديد مركز التكلفة.`);
    }

    if (account.restrictions.requiresDepartment && !line.dimensions?.departmentId) {
      errors.push(`السطر ${lineNum}: الحساب (${account.accountCode}) يلزم تحديد القسم التابع.`);
    }

    // Dimension Combination Rules check
    combinationRules.forEach(rule => {
      if (!rule.isActive) return;
      const prefix = rule.accountPattern.replace('*', '');
      if (account.accountCode.startsWith(prefix)) {
        if (rule.mandatoryDimensions.includes('cost_center') && !line.dimensions?.costCenterCode) {
          errors.push(`السطر ${lineNum}: قاعدة الأبعاد (${rule.nameAr}) تتطلب مركز تكلفة إلزامي.`);
        }
        if (rule.mandatoryDimensions.includes('branch') && !line.dimensions?.branchId) {
          errors.push(`السطر ${lineNum}: قاعدة الأبعاد (${rule.nameAr}) تتطلب تحديد الفرع إلزامي.`);
        }
      }
    });
  });

  // D. Debit == Credit Invariant Check
  // Rounded to 2 decimal places for currency accuracy
  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;
  const difference = Math.round(Math.abs(roundedDebit - roundedCredit) * 100) / 100;

  if (difference > 0.001) {
    errors.push(`القيد غير متوازن: إجمالي المدين (${roundedDebit.toLocaleString()} ${header.currency}) لا يتطابق مع إجمالي الدائن (${roundedCredit.toLocaleString()} ${header.currency}). الفارق: ${difference.toLocaleString()} ${header.currency}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalDebit: roundedDebit,
    totalCredit: roundedCredit,
    difference,
    currency: header.currency || 'SAR'
  };
}

export function validateJournalDraft(
  state: GeneralLedgerState,
  draft: JournalHeader & { lines?: JournalLine[] }
): JournalValidationResult {
  // Locate matching calendar for the period, or default to active calendar
  const activeCalendar = 
    state.calendars.find(c => c.periods.some(p => p.id === draft.periodId)) ||
    state.calendars.find(c => c.id === state.activeCalendarId) || 
    state.calendars[0];
  const periods = activeCalendar?.periods || [];

  return validateJournal(
    draft,
    draft.lines || [],
    state.accounts,
    periods,
    state.ledgerProfile,
    state.dimensions.combinationRules
  );
}

// ----------------------------------------------------------------------------
// 2. CHART OF ACCOUNTS ACTIONS
// ----------------------------------------------------------------------------

export function createAccountDraft(
  state: GeneralLedgerState,
  draft: Partial<AccountNode>,
  _actor?: string
): { success: boolean; newState?: GeneralLedgerState; error?: string; account?: AccountNode; createdAccount?: AccountNode } {
  if (!draft.accountCode || !draft.nameAr || !draft.category) {
    return { success: false, error: 'كود الحساب والاسم العربي والتصنيف حقول إلزامية.' };
  }

  // Prevent duplicate code (GL02)
  const codeExists = state.accounts.some(a => a.accountCode.trim() === draft.accountCode?.trim());
  if (codeExists) {
    return { success: false, error: `كود الحساب (${draft.accountCode}) مسجل مسبقاً بدليل الحسابات ولا يمكن تكراره.` };
  }

  // Check parent validity if provided
  if (draft.parentAccountCode) {
    const parent = state.accounts.find(a => a.accountCode === draft.parentAccountCode);
    if (!parent) {
      return { success: false, error: `الحساب الرئيسي المحدد (${draft.parentAccountCode}) غير موجود بدليل الحسابات.` };
    }
  }

  const newAccount: AccountNode = {
    id: `ACC-${draft.accountCode}`,
    accountCode: draft.accountCode.trim(),
    nameAr: draft.nameAr.trim(),
    nameEn: draft.nameEn?.trim() || draft.nameAr.trim(),
    category: draft.category,
    accountType: draft.accountType || 'posting',
    normalBalance: draft.normalBalance || (draft.category === 'asset' || draft.category === 'expense' ? 'debit' : 'credit'),
    parentAccountCode: draft.parentAccountCode || null,
    level: draft.level || 4,
    state: 'draft', // Created in draft state
    effectiveFrom: draft.effectiveFrom || new Date().toISOString().substring(0, 10),
    descriptionAr: draft.descriptionAr,
    restrictions: draft.restrictions || {
      requiresCostCenter: draft.category === 'expense' || draft.category === 'revenue',
      requiresDepartment: false,
      requiresBranch: true,
      requiresProject: false,
      disallowManualJournal: false
    },
    historicalEntryCount: 0,
    isSyntheticSample: true
  };

  return {
    success: true,
    account: newAccount,
    createdAccount: newAccount,
    newState: {
      ...state,
      accounts: [...state.accounts, newAccount]
    }
  };
}

export function inactivateAccount(
  state: GeneralLedgerState,
  accountCode: string,
  _reason: string
): { success: boolean; newState?: GeneralLedgerState; error?: string } {
  const account = state.accounts.find(a => a.accountCode === accountCode);
  if (!account) {
    return { success: false, error: `الحساب (${accountCode}) غير موجود بدليل الحسابات.` };
  }

  // Preserve history; merely update lifecycle state to inactive
  const updatedAccounts = state.accounts.map(a => {
    if (a.accountCode === accountCode) {
      return {
        ...a,
        state: 'inactive' as const,
        effectiveTo: new Date().toISOString().substring(0, 10)
      };
    }
    return a;
  });

  return {
    success: true,
    newState: {
      ...state,
      accounts: updatedAccounts
    }
  };
}

// ----------------------------------------------------------------------------
// 3. JOURNAL WORKFLOW: SUBMIT, APPROVE, SIMULATE POSTING
// ----------------------------------------------------------------------------

export function submitJournalForApproval(
  state: GeneralLedgerState,
  journalId: string,
  _actor: string
): { success: boolean; newState?: GeneralLedgerState; error?: string } {
  const journal = state.journals.find(j => j.id === journalId);
  if (!journal) {
    return { success: false, error: 'قيد اليومية غير موجود.' };
  }

  const activeCalendar = state.calendars.find(c => c.id === state.activeCalendarId);
  const periods = activeCalendar?.periods || [];

  const valResult = validateJournal(
    journal,
    journal.lines,
    state.accounts,
    periods,
    state.ledgerProfile,
    state.dimensions.combinationRules
  );

  if (!valResult.isValid) {
    return { success: false, error: `لا يمكن تقديم القيد للاعتماد نظراً لوجود أخطاء:\n${valResult.errors.join(' | ')}` };
  }

  const updatedJournals = state.journals.map(j => {
    if (j.id === journalId) {
      return {
        ...j,
        status: 'under_approval' as const,
        validationSnapshot: valResult
      };
    }
    return j;
  });

  return {
    success: true,
    newState: {
      ...state,
      journals: updatedJournals
    }
  };
}

export function approveJournal(
  state: GeneralLedgerState,
  journalId: string,
  approver: string
): { success: boolean; newState?: GeneralLedgerState; error?: string } {
  const journal = state.journals.find(j => j.id === journalId);
  if (!journal) {
    return { success: false, error: 'قيد اليومية غير موجود.' };
  }

  if (journal.status !== 'under_approval' && journal.status !== 'draft') {
    return { success: false, error: `القيد في حالة (${journal.status}) ولا يمكن اعتماده.` };
  }

  // Approval does NOT automatically post! (GL14)
  const updatedJournals = state.journals.map(j => {
    if (j.id === journalId) {
      return {
        ...j,
        status: 'approved' as const,
        approvedByPersona: approver
      };
    }
    return j;
  });

  return {
    success: true,
    newState: {
      ...state,
      journals: updatedJournals
    }
  };
}

export function simulatePostJournal(
  state: GeneralLedgerState,
  journalId: string,
  actor: string
): { success: boolean; newState?: GeneralLedgerState; error?: string; voucherId?: string; voucher?: GeneralLedgerVoucherEntry } {
  const journal = state.journals.find(j => j.id === journalId);
  if (!journal) {
    return { success: false, error: 'قيد اليومية غير موجود.' };
  }

  // Check if already posted (GL15: Duplicate posting attempt blocked)
  if (journal.status === 'posted_simulated') {
    return { success: false, error: 'تم ترحيل هذا القيد مسبقاً بنجاح. لا يمكن تكرار ترحيل نفس القيد مرتين.' };
  }

  const alreadyVouchered = state.postedVouchers.some(v => v.journalId === journalId);
  if (alreadyVouchered) {
    return { success: false, error: 'يوجد سند قيد مرحل مسبقاً مسجل لهذا القيد. تم حظر محاولة الترحيل المكررة.' };
  }

  // Validate state eligibility: must be approved or validated
  if (journal.status !== 'approved' && journal.status !== 'validated') {
    return { success: false, error: `القيد في حالة (${journal.status}). يجب اعتماد القيد أو التحقق منه أولاً قبل الترحيل المحاكى.` };
  }

  const activeCalendar = state.calendars.find(c => c.id === state.activeCalendarId);
  const periods = activeCalendar?.periods || [];

  // Deterministic validation
  const valResult = validateJournal(
    journal,
    journal.lines,
    state.accounts,
    periods,
    state.ledgerProfile,
    state.dimensions.combinationRules
  );

  if (!valResult.isValid) {
    return { success: false, error: `فشل الترحيل المحاكى بسبب أخطاء القيد المحاسبي:\n${valResult.errors.join(' | ')}` };
  }

  const voucherCount = state.postedVouchers.length + 1;
  const voucherNumber = `JV-2026-09-${String(voucherCount).padStart(3, '0')}`;
  const voucherId = `VCH-${journal.id}-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // Create immutable posted voucher entry snapshot (GL16)
  const newVoucher: GeneralLedgerVoucherEntry = {
    voucherId,
    journalId: journal.id,
    voucherNumber,
    accountingDate: journal.accountingDate,
    periodId: journal.periodId,
    category: journal.category,
    descriptionAr: journal.descriptionAr,
    totalDebitSar: valResult.totalDebit,
    totalCreditSar: valResult.totalCredit,
    postedByPersona: actor,
    postedAt: timestamp,
    isReversed: false,
    lines: JSON.parse(JSON.stringify(journal.lines)),
    sourceReference: journal.supportingReference
  };

  // Update journal header status
  const updatedJournals = state.journals.map(j => {
    if (j.id === journalId) {
      return {
        ...j,
        status: 'posted_simulated' as const,
        voucherNumber,
        simulatedPostingTimestamp: timestamp
      };
    }
    return j;
  });

  // Increment historical count on accounts
  const lineAccountCodes = new Set(journal.lines.map(l => l.accountCode));
  const updatedAccounts = state.accounts.map(a => {
    if (lineAccountCodes.has(a.accountCode)) {
      return {
        ...a,
        historicalEntryCount: (a.historicalEntryCount || 0) + 1
      };
    }
    return a;
  });

  return {
    success: true,
    voucherId,
    voucher: newVoucher,
    newState: {
      ...state,
      journals: updatedJournals,
      postedVouchers: [...state.postedVouchers, newVoucher],
      accounts: updatedAccounts
    }
  };
}

// ----------------------------------------------------------------------------
// 4. REVERSAL WORKFLOW (GL17, GL18)
// ----------------------------------------------------------------------------

export function createReversalJournal(
  state: GeneralLedgerState,
  request: ReversalRequest,
  actor: string
): { success: boolean; newState?: GeneralLedgerState; error?: string; reversalVoucherId?: string; reversalJournal?: JournalHeader; reversalVoucher?: GeneralLedgerVoucherEntry } {
  const originalJournal = state.journals.find(j => j.id === request.originalJournalId);
  if (!originalJournal) {
    return { success: false, error: 'القيد المحاسبي الأصلي المطلوب عكسه غير موجود.' };
  }

  if (originalJournal.status !== 'posted_simulated') {
    return { success: false, error: 'لا يمكن عكس قيد لم يتم ترحيله مسبقاً.' };
  }

  if (originalJournal.reversalRefJournalId) {
    return { success: false, error: `تم عكس هذا القيد مسبقاً بموجب القيد المعاكس (${originalJournal.reversalRefJournalId}). لا يمكن تكرار العكس مرتين.` };
  }

  // Check target period eligibility
  const activeCalendar = state.calendars.find(c => c.id === state.activeCalendarId);
  const targetPeriod = activeCalendar?.periods.find(p => p.id === request.periodId);
  if (!targetPeriod || !targetPeriod.isPostingEligible) {
    return { success: false, error: `الفترة المحاسبية المحددة لتاريخ العكس (${request.periodId}) غير مؤهلة للترحيل أو مغلقة.` };
  }

  if (!request.reasonAr || request.reasonAr.trim().length < 5) {
    return { success: false, error: 'سبب عكس القيد إلزامي ويجب توضيح المبرر المحاسبي بشكل كافٍ.' };
  }

  const reversalJournalId = `JRN-REV-${Date.now()}`;
  const reversalVoucherId = `VCH-REV-${Date.now()}`;
  const reversalVoucherNumber = `REV-${originalJournal.voucherNumber || originalJournal.id}`;

  // Opposite debit and credit lines (GL17)
  const oppositeLines: JournalLine[] = originalJournal.lines.map((line, idx) => ({
    ...line,
    id: `REV-LINE-${idx + 1}-${Date.now()}`,
    debit: line.credit, // Invert
    credit: line.debit, // Invert
    baseDebit: line.baseCredit,
    baseCredit: line.baseDebit,
    descriptionAr: `عكس قيد: ${line.descriptionAr} (مبرر: ${request.reasonAr})`
  }));

  const reversalJournal: JournalHeader = {
    id: reversalJournalId,
    voucherNumber: reversalVoucherNumber,
    category: 'reversal',
    descriptionAr: `قيد عكسي للقيد (${originalJournal.voucherNumber || originalJournal.id}): ${request.reasonAr}`,
    accountingDate: request.reversalDate,
    periodId: request.periodId,
    currency: originalJournal.currency,
    origin: 'reversal_engine',
    supportingReference: `ORIG-VCH:${originalJournal.voucherNumber || originalJournal.id}`,
    preparedByPersona: actor,
    approvedByPersona: request.approvedByPersona,
    status: 'posted_simulated',
    lines: oppositeLines,
    originalJournalId: originalJournal.id,
    simulatedPostingTimestamp: new Date().toISOString()
  };

  // Calculate totals
  const totalDebit = oppositeLines.reduce((sum, l) => sum + l.baseDebit, 0);
  const totalCredit = oppositeLines.reduce((sum, l) => sum + l.baseCredit, 0);

  const reversalVoucher: GeneralLedgerVoucherEntry = {
    voucherId: reversalVoucherId,
    journalId: reversalJournalId,
    voucherNumber: reversalVoucherNumber,
    accountingDate: request.reversalDate,
    periodId: request.periodId,
    category: 'reversal',
    descriptionAr: reversalJournal.descriptionAr,
    totalDebitSar: totalDebit,
    totalCreditSar: totalCredit,
    postedByPersona: actor,
    postedAt: new Date().toISOString(),
    isReversed: false,
    lines: oppositeLines,
    sourceReference: originalJournal.id
  };

  // Mark original journal as reversed and link it
  const updatedJournals = state.journals.map(j => {
    if (j.id === originalJournal.id) {
      return {
        ...j,
        status: 'reversed' as const,
        reversalRefJournalId: reversalJournalId
      };
    }
    return j;
  });

  // Mark original voucher as reversed
  const updatedVouchers = state.postedVouchers.map(v => {
    if (v.journalId === originalJournal.id) {
      return {
        ...v,
        isReversed: true,
        reversedByVoucherId: reversalVoucherId,
        reversalReason: request.reasonAr
      };
    }
    return v;
  });

  return {
    success: true,
    reversalVoucherId,
    reversalJournal,
    reversalVoucher,
    newState: {
      ...state,
      journals: [...updatedJournals, reversalJournal],
      postedVouchers: [...updatedVouchers, reversalVoucher]
    }
  };
}

// ----------------------------------------------------------------------------
// 5. CORRECTION WORKFLOW (GL19)
// ----------------------------------------------------------------------------

export function createCorrectedJournal(
  state: GeneralLedgerState,
  request: CorrectionRequest,
  correctedLines: JournalLine[],
  actor: string
): { success: boolean; newState?: GeneralLedgerState; error?: string; correctedVoucherId?: string; correctedJournal?: JournalHeader; correctedVoucher?: GeneralLedgerVoucherEntry } {
  // First, reverse the original journal
  const revResult = createReversalJournal(
    state,
    {
      originalJournalId: request.originalJournalId,
      reversalDate: request.reversalDate,
      periodId: request.periodId,
      reasonAr: `عكس تمهيدي لإجراء تصحيح محاسبي: ${request.reasonAr}`,
      approvedByPersona: request.approvedByPersona
    },
    actor
  );

  if (!revResult.success || !revResult.newState) {
    return { success: false, error: `فشل إجراء العكس التمهيدي للتصحيح: ${revResult.error}` };
  }

  const intermediateState = revResult.newState;
  const originalJournal = state.journals.find(j => j.id === request.originalJournalId);
  const activeCalendar = intermediateState.calendars.find(c => c.id === intermediateState.activeCalendarId);
  const periods = activeCalendar?.periods || [];

  const correctedJournalId = `JRN-CORR-${Date.now()}`;
  const correctedVoucherNumber = `CORR-${originalJournal?.voucherNumber || request.originalJournalId}`;

  const correctedJournal: JournalHeader = {
    id: correctedJournalId,
    voucherNumber: correctedVoucherNumber,
    category: 'correction',
    descriptionAr: `قيد تصحيحي معدل للقيد (${originalJournal?.voucherNumber || request.originalJournalId}): ${request.reasonAr}`,
    accountingDate: request.correctionDate,
    periodId: request.periodId,
    currency: originalJournal?.currency || 'SAR',
    origin: 'correction_engine',
    supportingReference: `CORR-FOR:${request.originalJournalId}`,
    preparedByPersona: actor,
    approvedByPersona: request.approvedByPersona,
    status: 'draft',
    lines: correctedLines,
    originalJournalId: request.originalJournalId,
    correctionReason: request.reasonAr
  };

  // Validate the corrected journal
  const valResult = validateJournal(
    correctedJournal,
    correctedLines,
    intermediateState.accounts,
    periods,
    intermediateState.ledgerProfile,
    intermediateState.dimensions.combinationRules
  );

  if (!valResult.isValid) {
    return { success: false, error: `البيانات المصححة غير صالحة حسابياً:\n${valResult.errors.join(' | ')}` };
  }

  correctedJournal.status = 'approved';
  const stateWithDraft: GeneralLedgerState = {
    ...intermediateState,
    journals: [...intermediateState.journals, correctedJournal]
  };

  // Simulate post the corrected journal
  const postResult = simulatePostJournal(stateWithDraft, correctedJournalId, actor);
  if (!postResult.success || !postResult.newState) {
    return { success: false, error: `فشل ترحيل القيد المصحح: ${postResult.error}` };
  }

  return {
    success: true,
    correctedVoucherId: postResult.voucherId,
    correctedJournal,
    correctedVoucher: postResult.voucher,
    newState: postResult.newState
  };
}

// ----------------------------------------------------------------------------
// 6. SOURCE EVENT POSTING IDEMPOTENCY (GL20, GL21, GL22)
// ----------------------------------------------------------------------------

export function simulateSourceEventPosting(
  state: GeneralLedgerState,
  eventId: string,
  actor: string
): { success: boolean; newState?: GeneralLedgerState; error?: string; voucherId?: string; voucher?: GeneralLedgerVoucherEntry } {
  const event = state.sourceEvents.find(e => e.id === eventId);
  if (!event) {
    return { success: false, error: 'الحدث المحاسبي من النظام المصدر غير موجود.' };
  }

  // Idempotency check: Cannot post same event twice (GL21)
  if (event.mappingStatus === 'SYNTHETIC_POSTED' || event.simulatedVoucherId) {
    return { success: false, error: `تم ترحيل هذا الحدث المصدر (${event.id}) مسبقاً بالسند (${event.simulatedVoucherId}). لا يمكن إعادة الترحيل المكرر لنفس الحدث.` };
  }

  // Mapping check: Missing mapping must block honestly (GL22)
  if (event.mappingStatus === 'UNMAPPED_ACCOUNT' || !event.targetDebitAccountCode || !event.targetCreditAccountCode) {
    return { success: false, error: `الحدث المصدر (${event.sourceDocumentId}) يفتقر إلى تعيين محاسبي مكتمل للحسابات المدينة/الدائنة. يمنع الترحيل بدون قواعد توجيه معتمدة.` };
  }

  const debitAccount = state.accounts.find(a => a.accountCode === event.targetDebitAccountCode);
  const creditAccount = state.accounts.find(a => a.accountCode === event.targetCreditAccountCode);

  if (!debitAccount || !creditAccount) {
    return { success: false, error: 'أحد الحسابات المستهدفة بالتعيين المحاسبي غير موجود بدليل الحسابات.' };
  }

  const journalId = `JRN-SRC-${event.id}-${Date.now()}`;
  const lines: JournalLine[] = [
    {
      id: `SRCLINE-01-${Date.now()}`,
      lineNumber: 1,
      accountId: debitAccount.id,
      accountCode: debitAccount.accountCode,
      accountNameAr: debitAccount.nameAr,
      dimensions: {
        branchId: 'main_hospital',
        departmentId: debitAccount.restrictions.requiresDepartment ? (debitAccount.accountCode === '5120' ? 'pharmacy' : 'icu') : undefined,
        costCenterCode: event.requiredCostCenterCode || (debitAccount.restrictions.requiresCostCenter ? 'CC-ICU-701' : undefined)
      },
      descriptionAr: `${event.intendedTreatmentNoteAr} - طرف مدين`,
      debit: event.originalAmount,
      credit: 0,
      transactionCurrency: event.currency,
      exchangeRate: 1.0,
      baseDebit: event.originalAmount,
      baseCredit: 0,
      supportingReference: event.sourceDocumentId
    },
    {
      id: `SRCLINE-02-${Date.now()}`,
      lineNumber: 2,
      accountId: creditAccount.id,
      accountCode: creditAccount.accountCode,
      accountNameAr: creditAccount.nameAr,
      dimensions: {
        branchId: 'main_hospital'
      },
      descriptionAr: `${event.intendedTreatmentNoteAr} - طرف دائن`,
      debit: 0,
      credit: event.originalAmount,
      transactionCurrency: event.currency,
      exchangeRate: 1.0,
      baseDebit: 0,
      baseCredit: event.originalAmount,
      supportingReference: event.sourceDocumentId
    }
  ];

  const sourceJournal: JournalHeader = {
    id: journalId,
    category: 'source_integration',
    descriptionAr: `ترحيل محاكى للحدث المصدر (${event.sourceModule}: ${event.sourceDocumentId})`,
    accountingDate: event.accountingDate,
    periodId: state.activePeriodId,
    currency: event.currency,
    origin: 'source_event_import',
    supportingReference: `${event.sourceModule}:${event.sourceDocumentId}`,
    preparedByPersona: actor,
    approvedByPersona: 'النظام المحاكى (توجيه آلي معتمد)',
    status: 'approved',
    lines
  };

  const stateWithJournal: GeneralLedgerState = {
    ...state,
    journals: [...state.journals, sourceJournal]
  };

  const postResult = simulatePostJournal(stateWithJournal, journalId, actor);
  if (!postResult.success || !postResult.newState) {
    return { success: false, error: postResult.error };
  }

  // Mark event as SYNTHETIC_POSTED
  const updatedEvents = postResult.newState.sourceEvents.map(e => {
    if (e.id === eventId) {
      return {
        ...e,
        mappingStatus: 'SYNTHETIC_POSTED' as const,
        simulatedVoucherId: postResult.voucherId
      };
    }
    return e;
  });

  return {
    success: true,
    voucherId: postResult.voucherId,
    voucher: postResult.voucher,
    newState: {
      ...postResult.newState,
      sourceEvents: updatedEvents
    }
  };
}

// ----------------------------------------------------------------------------
// 7. TRIAL BALANCE & GRAND TOTAL CALCULATION (GL24, GL25, Negative M)
// ----------------------------------------------------------------------------

export function calculateTrialBalance(
  accountsOrState: AccountNode[] | GeneralLedgerState,
  openingBalancesOrPeriodId?: OpeningBalanceRecord[] | string,
  postedVouchersOrCalendarId?: GeneralLedgerVoucherEntry[] | string,
  periodId?: string,
  dimensionFilter?: { branchId?: string; costCenterCode?: string }
): TrialBalanceSummary {
  let accounts: AccountNode[];
  let openingBalances: OpeningBalanceRecord[];
  let postedVouchers: GeneralLedgerVoucherEntry[];
  let targetPeriodId: string | undefined;
  let targetDimensionFilter = dimensionFilter;

  if (accountsOrState && 'accounts' in accountsOrState) {
    accounts = accountsOrState.accounts;
    openingBalances = accountsOrState.openingBalances;
    postedVouchers = accountsOrState.postedVouchers;
    targetPeriodId = typeof openingBalancesOrPeriodId === 'string' ? openingBalancesOrPeriodId : accountsOrState.activePeriodId;
  } else {
    accounts = accountsOrState as AccountNode[];
    openingBalances = (openingBalancesOrPeriodId as OpeningBalanceRecord[]) || [];
    postedVouchers = (postedVouchersOrCalendarId as GeneralLedgerVoucherEntry[]) || [];
    targetPeriodId = periodId;
  }

  // 1. Gather all leaf accounts and compute their movements
  const rows: TrialBalanceRow[] = accounts.map(account => {
    // Opening balance for this account
    const obs = openingBalances.filter(ob => {
      if (ob.accountId !== account.id && ob.accountCode !== account.accountCode) return false;
      if (targetDimensionFilter?.branchId && ob.dimensions?.branchId !== targetDimensionFilter.branchId) return false;
      if (targetDimensionFilter?.costCenterCode && ob.dimensions?.costCenterCode !== targetDimensionFilter.costCenterCode) return false;
      return true;
    });

    const openingDr = obs.reduce((sum, o) => sum + (o.debitBalance || 0), 0);
    const openingCr = obs.reduce((sum, o) => sum + (o.creditBalance || 0), 0);

    // Period movements from posted vouchers
    let periodDr = 0;
    let periodCr = 0;

    if (account.accountType === 'posting') {
      postedVouchers.forEach(v => {
        if (targetPeriodId && v.periodId !== targetPeriodId) return;
        v.lines.forEach(l => {
          if (l.accountCode === account.accountCode || l.accountId === account.id) {
            if (targetDimensionFilter?.branchId && l.dimensions?.branchId !== targetDimensionFilter.branchId) return;
            if (targetDimensionFilter?.costCenterCode && l.dimensions?.costCenterCode !== targetDimensionFilter.costCenterCode) return;
            periodDr += l.baseDebit || 0;
            periodCr += l.baseCredit || 0;
          }
        });
      });
    }

    // Normal Balance Logic:
    // Assets & Expenses: Net Dr = OpeningDr - OpeningCr + PeriodDr - PeriodCr
    // Liabilities, Equity, Revenue: Net Cr = OpeningCr - OpeningDr + PeriodCr - PeriodDr
    let closingDr = 0;
    let closingCr = 0;

    if (account.normalBalance === 'debit') {
      const net = (openingDr - openingCr) + (periodDr - periodCr);
      if (net >= 0) {
        closingDr = Math.round(net * 100) / 100;
        closingCr = 0;
      } else {
        closingDr = 0;
        closingCr = Math.round(Math.abs(net) * 100) / 100;
      }
    } else {
      const net = (openingCr - openingDr) + (periodCr - periodDr);
      if (net >= 0) {
        closingDr = 0;
        closingCr = Math.round(net * 100) / 100;
      } else {
        closingDr = Math.round(Math.abs(net) * 100) / 100;
        closingCr = 0;
      }
    }

    return {
      accountId: account.id,
      accountCode: account.accountCode,
      accountNameAr: account.nameAr,
      accountNameEn: account.nameEn,
      category: account.category,
      accountType: account.accountType,
      normalBalance: account.normalBalance,
      level: account.level,
      parentAccountCode: account.parentAccountCode,
      openingDebitSar: Math.round(openingDr * 100) / 100,
      openingCreditSar: Math.round(openingCr * 100) / 100,
      periodDebitSar: Math.round(periodDr * 100) / 100,
      periodDebitMovementSar: Math.round(periodDr * 100) / 100,
      periodCreditSar: Math.round(periodCr * 100) / 100,
      periodCreditMovementSar: Math.round(periodCr * 100) / 100,
      closingDebitSar: closingDr,
      closingCreditSar: closingCr,
      isBalanced: true
    };
  });

  // 2. Group roll-up: Compute roll-ups for parent accounts (level 1-3) based on child posting accounts
  const rowMap = new Map<string, TrialBalanceRow>();
  rows.forEach(r => rowMap.set(r.accountCode, r));

  // Roll up bottom-up (level 3 -> 2 -> 1)
  for (let lvl = 3; lvl >= 1; lvl--) {
    rows.filter(r => r.level === lvl && r.accountType === 'group').forEach(parent => {
      // Find all direct children
      const children = rows.filter(c => c.parentAccountCode === parent.accountCode);
      parent.openingDebitSar = children.reduce((s, c) => s + c.openingDebitSar, 0);
      parent.openingCreditSar = children.reduce((s, c) => s + c.openingCreditSar, 0);
      parent.periodDebitSar = children.reduce((s, c) => s + c.periodDebitSar, 0);
      parent.periodDebitMovementSar = parent.periodDebitSar;
      parent.periodCreditSar = children.reduce((s, c) => s + c.periodCreditSar, 0);
      parent.periodCreditMovementSar = parent.periodCreditSar;
      parent.closingDebitSar = children.reduce((s, c) => s + c.closingDebitSar, 0);
      parent.closingCreditSar = children.reduce((s, c) => s + c.closingCreditSar, 0);
    });
  }

  // 3. Grand Totals Invariant:
  // ONLY sum posting (leaf) accounts to avoid double-counting parents and children! (Negative Test M)
  const leafRows = rows.filter(r => r.accountType === 'posting');

  const totalOpeningDebitSar = Math.round(leafRows.reduce((sum, r) => sum + r.openingDebitSar, 0) * 100) / 100;
  const totalOpeningCreditSar = Math.round(leafRows.reduce((sum, r) => sum + r.openingCreditSar, 0) * 100) / 100;
  const totalPeriodDebitSar = Math.round(leafRows.reduce((sum, r) => sum + r.periodDebitSar, 0) * 100) / 100;
  const totalPeriodCreditSar = Math.round(leafRows.reduce((sum, r) => sum + r.periodCreditSar, 0) * 100) / 100;
  const totalClosingDebitSar = Math.round(leafRows.reduce((sum, r) => sum + r.closingDebitSar, 0) * 100) / 100;
  const totalClosingCreditSar = Math.round(leafRows.reduce((sum, r) => sum + r.closingCreditSar, 0) * 100) / 100;

  const netDiff = Math.round(Math.abs(totalClosingDebitSar - totalClosingCreditSar) * 100) / 100;
  const isMathematicallyBalanced = netDiff < 0.01 && Math.abs(totalPeriodDebitSar - totalPeriodCreditSar) < 0.01;

  let status: TrialBalanceSummary['status'] = 'VERIFIED_BALANCED';
  if (openingBalances.some(ob => ob.status === 'opening_balance_unavailable')) {
    status = 'NOT_VERIFIED_INCOMPLETE_DATA';
  } else if (!isMathematicallyBalanced) {
    status = 'UNBALANCED_EXCEPTION';
  }

  return {
    periodId: targetPeriodId,
    fiscalYear: '2026',
    currency: 'SAR',
    totalOpeningDebitSar,
    totalOpeningCreditSar,
    totalPeriodDebitSar,
    totalPeriodDebitMovementSar: totalPeriodDebitSar,
    totalPeriodCreditSar,
    totalPeriodCreditMovementSar: totalPeriodCreditSar,
    totalClosingDebitSar,
    totalClosingCreditSar,
    netDebitCreditDifferenceSar: netDiff,
    isMathematicallyBalanced,
    status,
    rows,
    timestamp: new Date().toISOString()
  };
}

// ----------------------------------------------------------------------------
// 8. ACCOUNT ACTIVITY SUMMARY (GL23)
// ----------------------------------------------------------------------------

export function calculateAccountActivity(
  accountCode: string,
  accounts: AccountNode[],
  openingBalances: OpeningBalanceRecord[],
  postedVouchers: GeneralLedgerVoucherEntry[],
  periodId?: string
): AccountActivitySummary | null {
  const account = accounts.find(a => a.accountCode === accountCode);
  if (!account) return null;

  // Opening balance
  const obs = openingBalances.filter(o => o.accountCode === accountCode);
  const openingDr = obs.reduce((sum, o) => sum + (o.debitBalance || 0), 0);
  const openingCr = obs.reduce((sum, o) => sum + (o.creditBalance || 0), 0);
  const initialNet = account.normalBalance === 'debit' ? (openingDr - openingCr) : (openingCr - openingDr);

  let runningBalance = initialNet;
  let totalPeriodDebit = 0;
  let totalPeriodCredit = 0;

  const entries: AccountActivitySummary['entries'] = [];

  // Scan vouchers sorted chronologically
  const sortedVouchers = [...postedVouchers]
    .filter(v => !periodId || v.periodId === periodId)
    .sort((a, b) => a.accountingDate.localeCompare(b.accountingDate));

  sortedVouchers.forEach(v => {
    v.lines.forEach(line => {
      if (line.accountCode === accountCode) {
        totalPeriodDebit += line.baseDebit;
        totalPeriodCredit += line.baseCredit;

        if (account.normalBalance === 'debit') {
          runningBalance += (line.baseDebit - line.baseCredit);
        } else {
          runningBalance += (line.baseCredit - line.baseDebit);
        }

        entries.push({
          voucherNumber: v.voucherNumber,
          accountingDate: v.accountingDate,
          periodId: v.periodId,
          journalCategory: v.category,
          descriptionAr: line.descriptionAr || v.descriptionAr,
          debitSar: line.baseDebit,
          creditSar: line.baseCredit,
          runningBalanceSar: Math.round(runningBalance * 100) / 100,
          dimensions: line.dimensions,
          supportingReference: line.supportingReference || v.sourceReference,
          isReversed: v.isReversed
        });
      }
    });
  });

  return {
    accountId: account.id,
    accountCode: account.accountCode,
    accountNameAr: account.nameAr,
    category: account.category,
    normalBalance: account.normalBalance,
    openingBalanceSar: Math.round(initialNet * 100) / 100,
    totalPeriodDebitSar: Math.round(totalPeriodDebit * 100) / 100,
    totalDebitSar: Math.round(totalPeriodDebit * 100) / 100,
    totalPeriodCreditSar: Math.round(totalPeriodCredit * 100) / 100,
    totalCreditSar: Math.round(totalPeriodCredit * 100) / 100,
    closingBalanceSar: Math.round(runningBalance * 100) / 100,
    entries,
    lines: entries
  };
}

export function getAccountActivitySummary(
  state: GeneralLedgerState,
  accountCode: string,
  periodId?: string
): AccountActivitySummary | null {
  return calculateAccountActivity(
    accountCode,
    state.accounts,
    state.openingBalances,
    state.postedVouchers,
    periodId
  );
}

// ----------------------------------------------------------------------------
// 9. PERIOD CLOSE READINESS & SIMULATED CLOSE (GL26, GL27)
// ----------------------------------------------------------------------------

export function evaluatePeriodCloseReadiness(
  state: GeneralLedgerState,
  periodId: string,
  _calendarId?: string
): PeriodCloseChecklist {
  const activeCalendar = _calendarId
    ? state.calendars.find(c => c.id === _calendarId) || state.calendars.find(c => c.id === state.activeCalendarId)
    : state.calendars.find(c => c.id === state.activeCalendarId);
  const period = activeCalendar?.periods.find(p => p.id === periodId);

  const blockingIssuesListAr: string[] = [];
  const advisoryWarningsListAr: string[] = [];

  // Check unposted drafts
  const unpostedDrafts = state.journals.filter(j => j.periodId === periodId && (j.status === 'draft' || j.status === 'validated'));
  if (unpostedDrafts.length > 0) {
    blockingIssuesListAr.push(`يوجد عدد (${unpostedDrafts.length}) مسودات قيود لم يتم اعتمادها أو ترحيلها في الفترة.`);
  }

  // Check unapproved journals
  const unapproved = state.journals.filter(j => j.periodId === periodId && j.status === 'under_approval');
  if (unapproved.length > 0) {
    blockingIssuesListAr.push(`يوجد عدد (${unapproved.length}) قيود قيد دورة الاعتماد ولم يتم اتخاذ قرار بشأنها.`);
  }

  // Check unmapped source events
  const unmappedSource = state.sourceEvents.filter(e => e.mappingStatus === 'UNMAPPED_ACCOUNT');
  if (unmappedSource.length > 0) {
    blockingIssuesListAr.push(`يوجد عدد (${unmappedSource.length}) أحداث محاسبية معلقة تفتقر إلى التوجيه المحاسبي المعتمد.`);
  }

  // Check trial balance balance
  const tb = calculateTrialBalance(state.accounts, state.openingBalances, state.postedVouchers, periodId);
  if (!tb.isMathematicallyBalanced) {
    blockingIssuesListAr.push(`ميزان المراجعة غير متوازن، يوجد فارق قدره (${tb.netDebitCreditDifferenceSar} ر.س).`);
  }

  // Check reconciliation discrepancies
  const unreconciled = state.reconciliationRecords.filter(r => r.status === 'discrepancy' || r.status === 'missing_valuation');
  if (unreconciled.length > 0) {
    advisoryWarningsListAr.push(`يوجد عدد (${unreconciled.length}) استثناءات تسوية مع الأنظمة الفرعية تتطلب فحصاً محاسبياً.`);
  }

  // Check missing opening balances
  const missingOpening = state.openingBalances.filter(o => o.status === 'opening_balance_unavailable');
  if (missingOpening.length > 0) {
    advisoryWarningsListAr.push(`توجد أرصدة افتتاحية غير مؤكدة المصدر أو مفقودة بعدد (${missingOpening.length}).`);
  }

  const overallReadiness = blockingIssuesListAr.length > 0
    ? 'blocked_by_exceptions'
    : (advisoryWarningsListAr.length > 0 ? 'partially_ready' : 'ready_for_simulated_close');

  return {
    periodId,
    periodNameAr: period?.periodNameAr || periodId,
    fiscalYear: period?.fiscalYear || '2026',
    unpostedDraftJournalsCount: unpostedDrafts.length,
    unapprovedJournalsCount: unapproved.length,
    failedValidationCount: 0,
    unmappedSourceEventsCount: unmappedSource.length,
    unresolvedReconciliationsCount: unreconciled.length,
    subledgerReconciliationDiscrepanciesCount: unreconciled.length,
    trialBalanceBalanced: tb.isMathematicallyBalanced,
    missingOpeningBalancesCount: missingOpening.length,
    overallReadiness,
    blockingIssuesListAr,
    advisoryWarningsListAr
  };
}

export function simulateClosePeriod(
  state: GeneralLedgerState,
  periodId: string,
  force: boolean = false
): { success: boolean; newState?: GeneralLedgerState; error?: string } {
  const readiness = evaluatePeriodCloseReadiness(state, periodId);

  if (!force && readiness.overallReadiness === 'blocked_by_exceptions') {
    return {
      success: false,
      error: `تم حظر الإقفال المحاكى للفترة لوجود استثناءات إلزامية معلقة:\n${readiness.blockingIssuesListAr.join(' | ')}`
    };
  }

  const updatedCalendars = state.calendars.map(cal => {
    if (cal.id === state.activeCalendarId) {
      const updatedPeriods = cal.periods.map(p => {
        if (p.id === periodId) {
          return {
            ...p,
            status: 'closed_simulated' as const,
            isPostingEligible: false,
            closeChecklistSummary: `تم الإقفال المحاكى بنجاح بتاريخ ${new Date().toISOString()}`
          };
        }
        return p;
      });
      return { ...cal, periods: updatedPeriods };
    }
    return cal;
  });

  return {
    success: true,
    newState: {
      ...state,
      calendars: updatedCalendars
    }
  };
}

export function simulateReopenPeriod(
  state: GeneralLedgerState,
  periodId: string,
  reason: string
): { success: boolean; newState?: GeneralLedgerState; error?: string } {
  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'سبب طلب إعادة فتح الفترة إلزامي ويوثق في سجل المراجعة.' };
  }

  const updatedCalendars = state.calendars.map(cal => {
    if (cal.id === state.activeCalendarId) {
      const updatedPeriods = cal.periods.map(p => {
        if (p.id === periodId) {
          return {
            ...p,
            status: 'reopened_simulated' as const,
            isPostingEligible: true,
            reopenReason: reason
          };
        }
        return p;
      });
      return { ...cal, periods: updatedPeriods };
    }
    return cal;
  });

  return {
    success: true,
    newState: {
      ...state,
      calendars: updatedCalendars
    }
  };
}

export function resetSimulationState(): GeneralLedgerState {
  return getInitialGeneralLedgerState();
}

// ----------------------------------------------------------------------------
// 10. SUBLEDGER RECONCILIATION ENGINE (GL26)
// ----------------------------------------------------------------------------

export function calculateReconciliationDiscrepancies(
  state: GeneralLedgerState,
  _periodId?: string
): GlReconciliationRecord[] {
  return state.reconciliationRecords.map(rec => {
    const glControlAccountCode = rec.glControlAccountCode || rec.glAccountCode;
    const glControlAccountNameAr = rec.glControlAccountNameAr || rec.glAccountNameAr;
    const subledgerBalanceSar = rec.subledgerBalanceSar ?? rec.subledgerReferenceAmountSar ?? 0;
    const varianceSar = rec.varianceSar !== undefined 
      ? rec.varianceSar 
      : rec.status === 'missing_valuation'
        ? 0
        : Math.round((rec.glBalanceSar - subledgerBalanceSar) * 100) / 100;
    const subledgerType = rec.subledgerType || rec.subledgerModule;

    return {
      ...rec,
      glControlAccountCode,
      glControlAccountNameAr,
      subledgerBalanceSar,
      varianceSar,
      subledgerType
    };
  });
}
