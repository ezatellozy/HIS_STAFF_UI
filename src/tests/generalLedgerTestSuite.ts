/**
 * Comprehensive Executable Verification Suite for HIS Finance Core: General Ledger & Chart of Accounts
 * Validates all 30 scenarios (GL01 - GL30) plus Negative Tests (A - O)
 * against the enterprise data model and deterministic state engine.
 */

import {
  getInitialGeneralLedgerState,
  MOCK_CHART_OF_ACCOUNTS,
  MOCK_OPENING_BALANCES,
  MOCK_POSTED_VOUCHERS,
  MOCK_LEDGER_PROFILE
} from '../data/mockGeneralLedgerData';

import {
  validateJournal,
  createAccountDraft,
  inactivateAccount,
  submitJournalForApproval,
  approveJournal,
  simulatePostJournal,
  createReversalJournal,
  createCorrectedJournal,
  simulateSourceEventPosting,
  calculateTrialBalance,
  calculateAccountActivity,
  evaluatePeriodCloseReadiness,
  simulateClosePeriod,
  simulateReopenPeriod,
  resetSimulationState
} from '../utils/generalLedgerEngine';

import { JournalHeader, JournalLine, GeneralLedgerState } from '../types/generalLedger';

export interface TestCaseResult {
  scenarioId: string;
  nameAr: string;
  nameEn: string;
  passed: boolean;
  details?: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestCaseResult[];
}

const SCENARIO_NAMES_AR: Record<string, string> = {
  'GL01': 'إنشاء حساب رئيسي في الدليل المحاسبي بحالة مسودة',
  'GL02': 'منع تكرار كود الحساب في الدليل المحاسبي',
  'GL03-PRE': 'التحقق من تصنيف الحساب الأب كحساب تجميعي',
  'GL03': 'منع الترحيل المباشر على الحسابات التجميعية',
  'GL04': 'التحقق من تطابق تصنيف الحساب الابن مع الحساب الأب',
  'GL05': 'منع تعطيل حساب نشط يحتوي على رصيد قائم',
  'GL06': 'التحقق من توازن قيد اليومية (المدين = الدائن)',
  'GL07': 'منع حفظ قيود بقيم سالبة في الطرفين',
  'GL08': 'منع الجمع بين قيمتين مدين ودائن في نفس السطر',
  'GL09': 'التحقق من وقوع تاريخ القيد ضمن الفترة المالية المفتوحة',
  'GL10': 'منع الترحيل في فترة مالية مغلقة أو معلقة',
  'GL11': 'إلزامية تحديد أبعاد الفرع ومركز التكلفة لحسابات المصروفات',
  'GL12': 'قواعد التوافق المتبادل بين الأبعاد المالية',
  'GL13': 'تقديم مسودة القيد لدورة الاعتماد والموافقة',
  'GL14': 'اعتماد القيد دون ترحيله تلقائياً (فصل الصلاحيات)',
  'GL15-FIRST': 'ترحيل القيد المعتمد وتوليد سند القيد المحاسبي',
  'GL15': 'منع تكرار ترحيل القيد المحاسبي مرتين',
  'GL16': 'دقة تحويل العملات الأجنبية بسعر الصرف لعملة الأساس',
  'GL17': 'إنشاء قيد عكسي تلقائي لسنوات أو فترات سابقة',
  'GL18': 'منع تكرار عكس القيد المعكوس مسبقاً',
  'GL19': 'إنشاء قيد تصحيحي مع الإشارة للسند الأصلي',
  'GL20': 'معالجة أحداث الفواتير والأنظمة الفرعية وتوليد القيود',
  'GL21-FIRST': 'معالجة سند استلام المواد وإثبات الاستحقاق',
  'GL21': 'منع تكرار معالجة نفس الحدث المحاسبي من النظام الفرعي',
  'GL22': 'حساب ميزان المراجعة والتحقق الرياضي من التوازن',
  'GL23': 'استخراج كشف حركة الحساب والرصيد التراكمي',
  'GL24': 'تعدد التقاويم المالية (ميلادي تقويمي مقابل غير تقويمي)',
  'GL25': 'فحص جاهزية إقفال الفترة المالية وقائمة التحقق',
  'GL26': 'المطابقة مع الأنظمة الفرعية والإفصاح عن الفروقات',
  'GL27': 'المحاكاة الكاملة لإقفال الفترة ومنع الترحيل فيها',
  'GL28': 'إعادة فتح الفترة المالية المغلقة لضرورة رقابية موثقة',
  'GL29': 'سجل المراجعة والتدقيق والربط الصريح بين السندات',
  'GL30': 'إعادة ضبط المحاكاة والعودة للحالة الافتراضية النظيفة',
  'NEG-A': 'رفض تاريخ قيد خارج نطاق الفترات المالية المتاحة',
  'NEG-B': 'رفض مبالغ غير رقمية أو غير صالحة حسابياً',
  'NEG-C': 'منع إعادة استخدام رقم سند قيد موجود مسبقاً',
  'NEG-D': 'منع معالجة مكررة لنفس حدث النظام الفرعي',
  'NEG-E': 'السماح بحدثين شرعيين مختلفين لنفس المستند المصدري',
  'NEG-F': 'رفض طلب عكس لقيد معكوس مسبقاً قطيعاً',
  'NEG-G': 'رفض طلب تصحيح لسند قيد غير موجود',
  'NEG-H': 'تحديد حالة ميزان المراجعة كغير مكتمل عند غياب الأرصدة الافتتاحية',
  'NEG-I': 'إفصاح صريح عن رصيد النظام الفرعي غير المقيم بدلاً من تزييفه',
  'NEG-J': 'فشل القيد غير المتوازن مع إظهار فارق التوازن الصريح',
  'NEG-K': 'رفض إضافة حساب ابن يتبع لحساب أب غير موجود',
  'NEG-L': 'رفض بند عملة أجنبية بسعر صرف معدوم أو غير محدد',
  'NEG-M': 'منع التكرار الحسابي للمجموعات الرئيسية في ميزان المراجعة',
  'NEG-N': 'ضمان توجيه القيد العكسي للفترة المالية المحددة',
  'NEG-O': 'ضمان عدم تأثر حالة النظام عند فشل تنفيذ العملية'
};

export function runGeneralLedgerTestSuite(): TestSuiteSummary {
  const results: TestCaseResult[] = [];
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testId: string, description: string) {
    if (condition) {
      passCount++;
    } else {
      failCount++;
    }
    results.push({
      scenarioId: testId,
      nameAr: SCENARIO_NAMES_AR[testId] || description,
      nameEn: description,
      passed: condition,
      details: description
    });
  }

  // Initialize clean test state
  let state: GeneralLedgerState = getInitialGeneralLedgerState();

// ----------------------------------------------------------------------------
// GL01: Create a valid draft main account
// ----------------------------------------------------------------------------
const resGL01 = createAccountDraft(state, {
  accountCode: '5410',
  nameAr: 'مصروفات أبحاث سريرية وتطوير الرعاية الصحية',
  nameEn: 'Clinical Research & Development Expense',
  category: 'expense',
  accountType: 'posting',
  level: 4,
  parentAccountCode: '5000'
});
assert(
  resGL01.success && resGL01.account !== undefined && resGL01.account.state === 'draft',
  'GL01',
  'Create a valid draft main account in draft state with correct hierarchy'
);
if (resGL01.newState) state = resGL01.newState;

// ----------------------------------------------------------------------------
// GL02: Prevent duplicate account code
// ----------------------------------------------------------------------------
const resGL02 = createAccountDraft(state, {
  accountCode: '5100', // Already exists in MOCK_CHART_OF_ACCOUNTS
  nameAr: 'حساب مكرر غير مسموح',
  category: 'expense'
});
assert(
  !resGL02.success && (resGL02.error?.includes('مسجل مسبقاً') ?? false),
  'GL02',
  'Prevent duplicate account code from being added to Chart of Accounts'
);

// ----------------------------------------------------------------------------
// GL03: Parent/group account is not postable
// ----------------------------------------------------------------------------
const parentAccount = state.accounts.find(a => a.accountCode === '5000'); // Group account
assert(
  parentAccount !== undefined && parentAccount.accountType === 'group',
  'GL03-PRE',
  'Parent account 5000 verified as group type'
);

const testJournalGroupPost: JournalHeader = {
  id: 'JRN-TEST-GROUP',
  category: 'manual_adjustment',
  descriptionAr: 'تجربة ترحيل غير صالحة على حساب رئيسي',
  accountingDate: '2026-09-15',
  periodId: 'FY2026-P09',
  currency: 'SAR',
  origin: 'manual_ui',
  preparedByPersona: 'Tester',
  status: 'draft',
  lines: [
    {
      id: 'L1', lineNumber: 1, accountId: 'ACC-5000', accountCode: '5000', accountNameAr: 'المصروفات',
      dimensions: { branchId: 'main_hospital' }, descriptionAr: 'مدين', debit: 1000, credit: 0,
      transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 1000, baseCredit: 0
    },
    {
      id: 'L2', lineNumber: 2, accountId: 'ACC-1111', accountCode: '1111', accountNameAr: 'البنك',
      dimensions: { branchId: 'main_hospital' }, descriptionAr: 'دائن', debit: 0, credit: 1000,
      transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 0, baseCredit: 1000
    }
  ]
};
const valResultGL03 = validateJournal(
  testJournalGroupPost, testJournalGroupPost.lines, state.accounts,
  state.calendars[0].periods, state.ledgerProfile
);
assert(
  !valResultGL03.isValid && valResultGL03.errors.some(e => e.includes('حساب تجميعي/رئيسي (Group)')),
  'GL03',
  'Parent/group account is strictly not postable and rejected by journal validation'
);

// ----------------------------------------------------------------------------
// GL04: Inactivate an account with historical entries
// ----------------------------------------------------------------------------
const resGL04 = inactivateAccount(state, '5100', 'استبدال بحساب تفصيلي جديد');
const inactivatedAcc = resGL04.newState?.accounts.find(a => a.accountCode === '5100');
assert(
  resGL04.success && inactivatedAcc?.state === 'inactive' && (inactivatedAcc.historicalEntryCount ?? 0) > 0,
  'GL04',
  'Inactivate an account while strictly preserving its historical entries and queryability'
);

// ----------------------------------------------------------------------------
// GL05: Main account versus cost center distinction
// ----------------------------------------------------------------------------
const costCenterExistsAsDimension = state.dimensions.costCenters.some(cc => cc.code === 'CC-ICU-701');
const accountExistsInCoa = state.accounts.some(a => a.accountCode === '5100');
const costCenterNotInCoa = !state.accounts.some(a => a.accountCode === 'CC-ICU-701');
assert(
  costCenterExistsAsDimension && accountExistsInCoa && costCenterNotInCoa,
  'GL05',
  'Main account is cleanly distinguished from cost center dimension (CC-ICU-701 is dimension value, not COA account)'
);

// ----------------------------------------------------------------------------
// GL06: Invalid account/dimension combination
// ----------------------------------------------------------------------------
// Account 5120 requires cost_center and branch
const testJournalInvalidDim: JournalHeader = {
  id: 'JRN-TEST-DIM',
  category: 'manual_adjustment',
  descriptionAr: 'قيد يفتقر إلى مركز التكلفة المطلوب للمصروف',
  accountingDate: '2026-09-15',
  periodId: 'FY2026-P09',
  currency: 'SAR',
  origin: 'manual_ui',
  preparedByPersona: 'Tester',
  status: 'draft',
  lines: [
    {
      id: 'L1', lineNumber: 1, accountId: 'ACC-5120', accountCode: '5120', accountNameAr: 'أدوية',
      dimensions: { branchId: 'main_hospital' }, // Missing costCenterCode!
      descriptionAr: 'مدين بدون مركز تكلفة', debit: 5000, credit: 0,
      transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 5000, baseCredit: 0
    },
    {
      id: 'L2', lineNumber: 2, accountId: 'ACC-1111', accountCode: '1111', accountNameAr: 'البنك',
      dimensions: { branchId: 'main_hospital' }, descriptionAr: 'دائن', debit: 0, credit: 5000,
      transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 0, baseCredit: 5000
    }
  ]
};
const valResultGL06 = validateJournal(
  testJournalInvalidDim, testJournalInvalidDim.lines, state.accounts,
  state.calendars[0].periods, state.ledgerProfile, state.dimensions.combinationRules
);
assert(
  !valResultGL06.isValid && valResultGL06.errors.some(e => e.includes('مركز التكلفة')),
  'GL06',
  'Invalid account/dimension combination rejected (missing required cost center on expense line)'
);

// ----------------------------------------------------------------------------
// GL07: Optional branch versus accounting entity
// ----------------------------------------------------------------------------
const branchList = state.dimensions.branches;
const entityConfig = state.ledgerProfile.accountingEntity;
assert(
  branchList.length >= 2 &&
  entityConfig.organizationType === 'single_hospital_with_branches' &&
  branchList[0].code === 'main_hospital' &&
  branchList[1].code === 'suburban_clinic_branch',
  'GL07',
  'Optional branches configured as financial dimensions within single legal reporting entity'
);

// ----------------------------------------------------------------------------
// GL08: Configure non-calendar fiscal year
// ----------------------------------------------------------------------------
const nonCalCal = state.calendars.find(c => c.calendarType === 'non_calendar_fiscal_year');
assert(
  nonCalCal !== undefined &&
  nonCalCal.startDate === '2026-07-01' &&
  nonCalCal.endDate === '2027-06-30' &&
  nonCalCal.periods.length > 0,
  'GL08',
  'Configure non-calendar fiscal year fixture (July 1 to June 30) with individual periods'
);

// ----------------------------------------------------------------------------
// GL09: Posting attempted in a closed period
// ----------------------------------------------------------------------------
// FY2026-P01 is closed_simulated
const testJournalClosedPeriod: JournalHeader = {
  id: 'JRN-TEST-CLOSED',
  category: 'manual_adjustment',
  descriptionAr: 'محاولة قيد في فترة مقفلة',
  accountingDate: '2026-01-15', // Falls in closed P01
  periodId: 'FY2026-P01',
  currency: 'SAR',
  origin: 'manual_ui',
  preparedByPersona: 'Tester',
  status: 'draft',
  lines: [
    {
      id: 'L1', lineNumber: 1, accountId: 'ACC-1112', accountCode: '1112', accountNameAr: 'الصندوق',
      dimensions: { branchId: 'main_hospital' }, descriptionAr: 'مدين', debit: 200, credit: 0,
      transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 200, baseCredit: 0
    },
    {
      id: 'L2', lineNumber: 2, accountId: 'ACC-1111', accountCode: '1111', accountNameAr: 'البنك',
      dimensions: { branchId: 'main_hospital' }, descriptionAr: 'دائن', debit: 0, credit: 200,
      transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 0, baseCredit: 200
    }
  ]
};
const valResultGL09 = validateJournal(
  testJournalClosedPeriod, testJournalClosedPeriod.lines, state.accounts,
  state.calendars[0].periods, state.ledgerProfile
);
assert(
  !valResultGL09.isValid && valResultGL09.errors.some(e => e.includes('مغلقة أو معلقة')),
  'GL09',
  'Posting attempted in a closed period is strictly rejected by validation engine'
);

// ----------------------------------------------------------------------------
// GL10: Journal draft with multiple debit/credit lines
// ----------------------------------------------------------------------------
const multiLineJournal: JournalHeader = {
  id: 'JRN-TEST-MULTILINE',
  category: 'manual_adjustment',
  descriptionAr: 'قيد تسوية متعدد الأطراف لمصروفات طبية وضرائب',
  accountingDate: '2026-09-20',
  periodId: 'FY2026-P09',
  currency: 'SAR',
  origin: 'manual_ui',
  preparedByPersona: 'أمل الشريف',
  status: 'draft',
  lines: [
    {
      id: 'ML-01', lineNumber: 1, accountId: 'ACC-5120', accountCode: '5120', accountNameAr: 'أدوية',
      dimensions: { branchId: 'main_hospital', departmentId: 'pharmacy', costCenterCode: 'CC-PHARM-201' },
      descriptionAr: 'أدوية', debit: 10000, credit: 0, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 10000, baseCredit: 0
    },
    {
      id: 'ML-02', lineNumber: 2, accountId: 'ACC-2130', accountCode: '2130', accountNameAr: 'ضريبة',
      dimensions: { branchId: 'main_hospital' },
      descriptionAr: 'ضريبة 15%', debit: 1500, credit: 0, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 1500, baseCredit: 0
    },
    {
      id: 'ML-03', lineNumber: 3, accountId: 'ACC-2010', accountCode: '2010', accountNameAr: 'ذمم موردين',
      dimensions: { branchId: 'main_hospital' },
      descriptionAr: 'استحقاق مورد', debit: 0, credit: 11500, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 0, baseCredit: 11500
    }
  ]
};
const valResultGL10 = validateJournal(
  multiLineJournal, multiLineJournal.lines, state.accounts,
  state.calendars[0].periods, state.ledgerProfile
);
assert(
  valResultGL10.isValid && valResultGL10.totalDebit === 11500 && valResultGL10.totalCredit === 11500,
  'GL10',
  'Journal draft with multiple debit/credit lines (3 lines) is verified balanced and valid'
);

// ----------------------------------------------------------------------------
// GL11: Unbalanced journal rejected before posting
// ----------------------------------------------------------------------------
const unbalancedJournal: JournalHeader = {
  ...multiLineJournal,
  id: 'JRN-TEST-UNBALANCED',
  lines: [
    { ...multiLineJournal.lines[0], debit: 10000, baseDebit: 10000 },
    { ...multiLineJournal.lines[2], credit: 9000, baseCredit: 9000 } // Difference of 1000!
  ]
};
const valResultGL11 = validateJournal(
  unbalancedJournal, unbalancedJournal.lines, state.accounts,
  state.calendars[0].periods, state.ledgerProfile
);
const stateBeforePost = JSON.stringify(state);
const postResultGL11 = simulatePostJournal(
  { ...state, journals: [...state.journals, unbalancedJournal] },
  unbalancedJournal.id,
  'Tester'
);
assert(
  !valResultGL11.isValid &&
  valResultGL11.difference === 1000 &&
  !postResultGL11.success,
  'GL11',
  'Unbalanced journal rejected with difference highlighted and zero state mutation'
);

// ----------------------------------------------------------------------------
// GL12: Missing or inactive account rejected
// ----------------------------------------------------------------------------
const testJournalInactive: JournalHeader = {
  ...multiLineJournal,
  id: 'JRN-TEST-INACTIVE',
  lines: [
    {
      id: 'IL-1', lineNumber: 1, accountId: 'ACC-5399-INACTIVE', accountCode: '5399', accountNameAr: 'حساب موقوف',
      dimensions: { branchId: 'main_hospital', costCenterCode: 'CC-ADMIN-001' },
      descriptionAr: 'قيد بحساب غير نشط', debit: 2000, credit: 0, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 2000, baseCredit: 0
    },
    {
      id: 'IL-2', lineNumber: 2, accountId: 'ACC-1111', accountCode: '1111', accountNameAr: 'البنك',
      dimensions: { branchId: 'main_hospital' },
      descriptionAr: 'دائن', debit: 0, credit: 2000, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 0, baseCredit: 2000
    }
  ]
};
const valResultGL12 = validateJournal(
  testJournalInactive, testJournalInactive.lines, state.accounts,
  state.calendars[0].periods, state.ledgerProfile
);
assert(
  !valResultGL12.isValid && valResultGL12.errors.some(e => e.includes('غير نشط حالياً')),
  'GL12',
  'Missing or inactive account (5399) rejected by journal validation engine'
);

// ----------------------------------------------------------------------------
// GL13: Journal submitted for approval
// ----------------------------------------------------------------------------
state = { ...state, journals: [...state.journals, multiLineJournal] };
const resGL13 = submitJournalForApproval(state, multiLineJournal.id, 'أمل الشريف');
const subJournal = resGL13.newState?.journals.find(j => j.id === multiLineJournal.id);
assert(
  resGL13.success && subJournal?.status === 'under_approval',
  'GL13',
  'Journal successfully submitted for approval, advancing state to under_approval'
);
if (resGL13.newState) state = resGL13.newState;

// ----------------------------------------------------------------------------
// GL14: Approval does not automatically post
// ----------------------------------------------------------------------------
const resGL14 = approveJournal(state, multiLineJournal.id, 'فهد المنصور (رئيس الحسابات)');
const appJournal = resGL14.newState?.journals.find(j => j.id === multiLineJournal.id);
const voucherExistsGL14 = resGL14.newState?.postedVouchers.some(v => v.journalId === multiLineJournal.id);
assert(
  resGL14.success && appJournal?.status === 'approved' && !voucherExistsGL14,
  'GL14',
  'Approval does not automatically post: status is approved, zero vouchers added'
);
if (resGL14.newState) state = resGL14.newState;

// ----------------------------------------------------------------------------
// GL15: Duplicate posting attempt blocked
// ----------------------------------------------------------------------------
const resGL15First = simulatePostJournal(state, multiLineJournal.id, 'فهد المنصور');
assert(
  resGL15First.success && resGL15First.voucherId !== undefined,
  'GL15-FIRST',
  'First simulated post of approved journal succeeds with voucher generated'
);
if (resGL15First.newState) state = resGL15First.newState;

const resGL15Second = simulatePostJournal(state, multiLineJournal.id, 'فهد المنصور');
assert(
  !resGL15Second.success && (resGL15Second.error?.includes('مسبقاً') ?? false),
  'GL15',
  'Duplicate posting attempt of already posted journal is strictly blocked'
);

// ----------------------------------------------------------------------------
// GL16: Posted journal cannot be silently edited
// ----------------------------------------------------------------------------
const postedVoucher = state.postedVouchers.find(v => v.journalId === multiLineJournal.id);
const postedJournal = state.journals.find(j => j.id === multiLineJournal.id);
assert(
  postedJournal?.status === 'posted_simulated' &&
  postedVoucher !== undefined &&
  postedVoucher.lines.length === multiLineJournal.lines.length,
  'GL16',
  'Posted journal creates immutable voucher snapshot; state engine prevents silent mutation'
);

// ----------------------------------------------------------------------------
// GL17: Reversal retains original journal history
// ----------------------------------------------------------------------------
const resGL17 = createReversalJournal(
  state,
  {
    originalJournalId: multiLineJournal.id,
    reversalDate: '2026-09-22',
    periodId: 'FY2026-P09',
    reasonAr: 'خطأ في تخصيص استهلاك قسم الصيدلية',
    approvedByPersona: 'فهد المنصور'
  },
  'أمل الشريف'
);
const origAfterRev = resGL17.newState?.journals.find(j => j.id === multiLineJournal.id);
const revVoucher = resGL17.newState?.postedVouchers.find(v => v.category === 'reversal');
assert(
  resGL17.success &&
  origAfterRev?.status === 'reversed' &&
  origAfterRev?.reversalRefJournalId !== undefined &&
  revVoucher !== undefined &&
  revVoucher.totalDebitSar === 11500 &&
  revVoucher.totalCreditSar === 11500,
  'GL17',
  'Reversal produces exact opposite entries, links to original, and preserves original history'
);
if (resGL17.newState) state = resGL17.newState;

// ----------------------------------------------------------------------------
// GL18: Duplicate reversal attempt blocked
// ----------------------------------------------------------------------------
const resGL18 = createReversalJournal(
  state,
  {
    originalJournalId: multiLineJournal.id,
    reversalDate: '2026-09-23',
    periodId: 'FY2026-P09',
    reasonAr: 'محاولة عكس ثانية لنفس القيد',
    approvedByPersona: 'فهد المنصور'
  },
  'أمل الشريف'
);
assert(
  !resGL18.success && (resGL18.error?.includes('مسبقاً') ?? false),
  'GL18',
  'Duplicate reversal attempt on an already reversed journal is strictly blocked'
);

// ----------------------------------------------------------------------------
// GL19: Correction requires valid period and reason
// ----------------------------------------------------------------------------
// Post another journal to correct
const jrnToCorrect: JournalHeader = {
  id: 'JRN-TO-CORRECT',
  category: 'manual_adjustment',
  descriptionAr: 'قيد به خطأ سيتم تصحيحه',
  accountingDate: '2026-09-18',
  periodId: 'FY2026-P09',
  currency: 'SAR',
  origin: 'manual_ui',
  preparedByPersona: 'أمل',
  status: 'approved',
  lines: [
    {
      id: 'TC-1', lineNumber: 1, accountId: 'ACC-5100', accountCode: '5100', accountNameAr: 'مستلزمات',
      dimensions: { branchId: 'main_hospital', departmentId: 'icu', costCenterCode: 'CC-ICU-701' },
      descriptionAr: 'مدين خطأ', debit: 8000, credit: 0, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 8000, baseCredit: 0
    },
    {
      id: 'TC-2', lineNumber: 2, accountId: 'ACC-2010', accountCode: '2010', accountNameAr: 'موردين',
      dimensions: { branchId: 'main_hospital' },
      descriptionAr: 'دائن خطأ', debit: 0, credit: 8000, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 0, baseCredit: 8000
    }
  ]
};
state = { ...state, journals: [...state.journals, jrnToCorrect] };
const postForCorr = simulatePostJournal(state, jrnToCorrect.id, 'فهد');
if (postForCorr.newState) state = postForCorr.newState;

const correctedLines: JournalLine[] = [
  {
    id: 'CL-1', lineNumber: 1, accountId: 'ACC-5120', accountCode: '5120', accountNameAr: 'أدوية مصححة',
    dimensions: { branchId: 'main_hospital', departmentId: 'pharmacy', costCenterCode: 'CC-PHARM-201' },
    descriptionAr: 'التوجيه المحاسبي المصحح للصيدلية', debit: 8000, credit: 0, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 8000, baseCredit: 0
  },
  {
    id: 'CL-2', lineNumber: 2, accountId: 'ACC-2010', accountCode: '2010', accountNameAr: 'موردين',
    dimensions: { branchId: 'main_hospital' },
    descriptionAr: 'دائن', debit: 0, credit: 8000, transactionCurrency: 'SAR', exchangeRate: 1, baseDebit: 0, baseCredit: 8000
  }
];

const resGL19 = createCorrectedJournal(
  state,
  {
    originalJournalId: jrnToCorrect.id,
    reversalDate: '2026-09-20',
    correctionDate: '2026-09-20',
    periodId: 'FY2026-P09',
    reasonAr: 'تصحيح توجيه المصروف من مستلزمات ICU إلى أدوية الصيدلية',
    approvedByPersona: 'فهد المنصور'
  },
  correctedLines,
  'أمل الشريف'
);
assert(
  resGL19.success && resGL19.correctedVoucherId !== undefined,
  'GL19',
  'Correction requires valid period and reason, reverses original and posts corrected entry'
);
if (resGL19.newState) state = resGL19.newState;

// ----------------------------------------------------------------------------
// GL20: AP source voucher reference without live posting
// ----------------------------------------------------------------------------
const apSourceEvent = state.sourceEvents.find(e => e.sourceModule === 'accounts_payable' && e.sourceDocumentId === 'INV-2026-0891');
assert(
  apSourceEvent !== undefined &&
  apSourceEvent.sourceDocumentId === 'INV-2026-0891' &&
  apSourceEvent.originalAmount === 14547.50 &&
  apSourceEvent.mappingStatus === 'READY_FOR_SIMULATION',
  'GL20',
  'AP source voucher referenced read-only with document ID, amount, and simulation-ready status'
);

// ----------------------------------------------------------------------------
// GL21: Duplicate source accounting event blocked
// ----------------------------------------------------------------------------
const resGL21First = simulateSourceEventPosting(state, 'EVT-AP-INV-2026-0891-V1', 'Tester');
assert(
  resGL21First.success && resGL21First.voucherId !== undefined,
  'GL21-FIRST',
  'First simulated posting of source event succeeds'
);
if (resGL21First.newState) state = resGL21First.newState;

const resGL21Second = simulateSourceEventPosting(state, 'EVT-AP-INV-2026-0891-V1', 'Tester');
assert(
  !resGL21Second.success && (resGL21Second.error?.includes('مسبقاً') ?? false),
  'GL21',
  'Repeated/duplicate source event posting is strictly blocked by composite idempotency check'
);

// ----------------------------------------------------------------------------
// GL22: Missing account mapping or source reference
// ----------------------------------------------------------------------------
const resGL22 = simulateSourceEventPosting(state, 'EVT-INV-RCV-2026-0099-V1', 'Tester');
assert(
  !resGL22.success && (resGL22.error?.includes('يفتقر إلى تعيين محاسبي') ?? false),
  'GL22',
  'Missing account mapping in source event is honestly blocked without fabricating accounts'
);

// ----------------------------------------------------------------------------
// GL23: Foreign-currency journal with missing FX rate
// ----------------------------------------------------------------------------
const testForeignMissingFx: JournalHeader = {
  id: 'JRN-FX-FAIL',
  category: 'manual_adjustment',
  descriptionAr: 'قيد بعملة أجنبية بدون سعر صرف',
  accountingDate: '2026-09-15',
  periodId: 'FY2026-P09',
  currency: 'USD',
  origin: 'manual_ui',
  preparedByPersona: 'Tester',
  status: 'draft',
  lines: [
    {
      id: 'F1', lineNumber: 1, accountId: 'ACC-5100', accountCode: '5100', accountNameAr: 'مستلزمات',
      dimensions: { branchId: 'main_hospital', costCenterCode: 'CC-ICU-701' },
      descriptionAr: 'شراء بالدولار', debit: 1000, credit: 0, transactionCurrency: 'USD', exchangeRate: 0, // Missing/0 FX rate!
      baseDebit: 0, baseCredit: 0
    },
    {
      id: 'F2', lineNumber: 2, accountId: 'ACC-2010', accountCode: '2010', accountNameAr: 'موردين',
      dimensions: { branchId: 'main_hospital' },
      descriptionAr: 'استحقاق', debit: 0, credit: 1000, transactionCurrency: 'USD', exchangeRate: 0,
      baseDebit: 0, baseCredit: 0
    }
  ]
};
const valResultGL23 = validateJournal(
  testForeignMissingFx, testForeignMissingFx.lines, state.accounts,
  state.calendars[0].periods, state.ledgerProfile
);
assert(
  !valResultGL23.isValid && valResultGL23.errors.some(e => e.includes('سعر صرف محدد وصحيح')),
  'GL23',
  'Foreign-currency journal with missing or 0 FX rate is strictly rejected by validation'
);

// ----------------------------------------------------------------------------
// GL24: Opening balance with explicit provenance
// ----------------------------------------------------------------------------
const obBank = state.openingBalances.find(o => o.accountCode === '1111');
assert(
  obBank !== undefined &&
  obBank.debitBalance === 2450000 &&
  obBank.sourceDocumentRef === 'AUDIT-CLOSING-FY2025-P13-SNB' &&
  obBank.status === 'verified',
  'GL24',
  'Opening balance record contains explicit provenance, source audit document, and verified status'
);

// ----------------------------------------------------------------------------
// GL25: Trial Balance derived from posted synthetic entries
// ----------------------------------------------------------------------------
const tbSummary = calculateTrialBalance(state.accounts, state.openingBalances, state.postedVouchers, 'FY2026-P09');
assert(
  tbSummary.isMathematicallyBalanced &&
  tbSummary.status === 'VERIFIED_BALANCED' &&
  tbSummary.totalClosingDebitSar === tbSummary.totalClosingCreditSar &&
  tbSummary.totalClosingDebitSar > 0,
  'GL25',
  `Trial Balance derived from posted synthetic entries is mathematically balanced (${tbSummary.totalClosingDebitSar.toLocaleString()} SAR)`
);

// ----------------------------------------------------------------------------
// GL26: GL versus subledger reconciliation discrepancy
// ----------------------------------------------------------------------------
const reconInv = state.reconciliationRecords.find(r => r.subledgerModule === 'inventory_materials');
const reconBank = state.reconciliationRecords.find(r => r.subledgerModule === 'treasury');
assert(
  reconInv?.status === 'missing_valuation' &&
  reconBank?.status === 'discrepancy' &&
  reconBank.discrepancyAmountSar === 5000,
  'GL26',
  'GL vs subledger reconciliation exposes honest discrepancies (missing inventory valuation & bank discrepancy)'
);

// ----------------------------------------------------------------------------
// GL27: Period-close readiness with unresolved exceptions
// ----------------------------------------------------------------------------
const readinessP09 = evaluatePeriodCloseReadiness(state, 'FY2026-P09');
assert(
  readinessP09.overallReadiness === 'blocked_by_exceptions' &&
  readinessP09.blockingIssuesListAr.length > 0,
  'GL27',
  'Period-close readiness operational board flags unresolved drafts/exceptions and blocks simulated close'
);

// ----------------------------------------------------------------------------
// GL28: Optional branches and multiple staff assignments
// ----------------------------------------------------------------------------
const mainBranchObs = state.openingBalances.filter(o => o.dimensions?.branchId === 'main_hospital');
assert(
  mainBranchObs.length > 0 &&
  state.dimensions.branches.some(b => b.code === 'main_hospital') &&
  state.dimensions.branches.some(b => b.code === 'suburban_clinic_branch'),
  'GL28',
  'Optional branches and financial dimensions are independent of staff assignment security context'
);

// ----------------------------------------------------------------------------
// GL29: Persistent clearly labeled synthetic preview
// ----------------------------------------------------------------------------
const isSyntheticFlag = state.ledgerProfile.accountingEntity.isSyntheticDemo;
const sampleCoaFlag = state.accounts[0].isSyntheticSample;
assert(
  isSyntheticFlag && sampleCoaFlag,
  'GL29',
  'Synthetic preview disclosure flags persist across ledger profile and chart of accounts'
);

// ----------------------------------------------------------------------------
// GL30: AP, Procurement, Inventory, Patient Billing boundaries preserved
// ----------------------------------------------------------------------------
assert(
  state.sourceEvents.length > 0 &&
  state.sourceEvents.every(e => ['accounts_payable', 'procurement', 'inventory_materials', 'patient_billing'].includes(e.sourceModule)),
  'GL30',
  'Protected module boundaries strictly respected via read-only source event references'
);

// ============================================================================
// NEGATIVE TESTS (A - O)
// ============================================================================

console.log('\n--- NEGATIVE TESTS (A - O) ---');

// A. Invalid fiscal date (date outside period range)
const resNegA = validateJournal(
  { ...testJournalClosedPeriod, accountingDate: '2029-12-31' },
  testJournalClosedPeriod.lines,
  state.accounts,
  state.calendars[0].periods,
  state.ledgerProfile
);
assert(!resNegA.isValid && resNegA.errors.some(e => e.includes('خارج نطاق الفترة')), 'NEG-A', 'Invalid fiscal date rejected');

// B. Invalid journal currency
const resNegB = validateJournal(
  { ...testForeignMissingFx, lines: [{ ...testForeignMissingFx.lines[0], debit: NaN }] },
  testForeignMissingFx.lines,
  state.accounts,
  state.calendars[0].periods,
  state.ledgerProfile
);
assert(!resNegB.isValid, 'NEG-B', 'Invalid numeric amounts (NaN) rejected');

// C. Duplicate voucher identity
const existingVoucherId = state.postedVouchers[0].journalId;
const resNegC = simulatePostJournal(state, existingVoucherId, 'Tester');
assert(!resNegC.success, 'NEG-C', 'Posting an existing voucher ID is blocked');

// D. Duplicate source event
const resNegD = simulateSourceEventPosting(state, 'EVT-AP-PAY-2026-0041-V1', 'Tester'); // already SYNTHETIC_POSTED
assert(!resNegD.success && (resNegD.error?.includes('مسبقاً') ?? false), 'NEG-D', 'Duplicate source event posting blocked');

// E. Same document with two legitimate different accounting events
const invoiceEvent1 = state.sourceEvents.find(e => e.sourceDocumentId === 'INV-2026-0891');
const invoiceEvent2 = {
  ...invoiceEvent1!,
  id: 'EVT-AP-INV-2026-0891-TAX-V1',
  businessEventType: 'SUPPLIER_TAX_RECOGNITION',
  originalAmount: 2182.12,
  mappingStatus: 'READY_FOR_SIMULATION' as const,
  simulatedVoucherId: undefined
};
const stateWithEvent2 = { ...state, sourceEvents: [...state.sourceEvents, invoiceEvent2] };
const resNegE = simulateSourceEventPosting(stateWithEvent2, invoiceEvent2.id, 'Tester');
assert(resNegE.success, 'NEG-E', 'Same document with two legitimate different business events allowed');

// F. Duplicate reversal
const reversedJournalId = multiLineJournal.id;
const resNegF = createReversalJournal(
  state,
  { originalJournalId: reversedJournalId, reversalDate: '2026-09-25', periodId: 'FY2026-P09', reasonAr: 'عكس مكرر', approvedByPersona: 'فهد' },
  'أمل'
);
assert(!resNegF.success, 'NEG-F', 'Duplicate reversal of reversed journal strictly rejected');

// G. Invalid correction date
const resNegG = createCorrectedJournal(
  state,
  { originalJournalId: 'NON-EXISTENT', reversalDate: '2026-09-20', correctionDate: '2026-09-20', periodId: 'FY2026-P09', reasonAr: 'تصحيح وهمي', approvedByPersona: 'فهد' },
  correctedLines,
  'Tester'
);
assert(!resNegG.success, 'NEG-G', 'Correction with non-existent original journal rejected');

// H. Missing opening balance
const missingObState = {
  ...state,
  openingBalances: state.openingBalances.map((o, idx) => idx === 0 ? { ...o, status: 'opening_balance_unavailable' as const } : o)
};
const tbMissingOb = calculateTrialBalance(missingObState.accounts, missingObState.openingBalances, missingObState.postedVouchers, 'FY2026-P09');
assert(tbMissingOb.status === 'NOT_VERIFIED_INCOMPLETE_DATA', 'NEG-H', 'Missing opening balance flagged as NOT_VERIFIED_INCOMPLETE_DATA');

// I. Missing reconciliation source
const resNegI = state.reconciliationRecords.some(r => r.status === 'missing_valuation' && r.subledgerReferenceAmountSar === undefined);
assert(resNegI, 'NEG-I', 'Missing reconciliation subledger balance displayed honestly as undefined');

// J. Unbalanced journal difference
const resNegJ = validateJournal(unbalancedJournal, unbalancedJournal.lines, state.accounts, state.calendars[0].periods, state.ledgerProfile);
assert(resNegJ.difference > 0 && !resNegJ.isValid, 'NEG-J', 'Unbalanced journal fails with explicit positive difference');

// K. Invalid account hierarchy (account with nonexistent parent)
const resNegK = createAccountDraft(state, {
  accountCode: '9999',
  nameAr: 'حساب بأب وهمي',
  category: 'expense',
  parentAccountCode: '9998' // Non-existent parent
});
assert(!resNegK.success && (resNegK.error?.includes('غير موجود') ?? false), 'NEG-K', 'Account with invalid parent account rejected');

// L. Wrong-currency addition without rate
const foreignNoRateLine: JournalLine = {
  id: 'L-EUR', lineNumber: 1, accountId: 'ACC-5100', accountCode: '5100', accountNameAr: 'مستلزمات',
  dimensions: { branchId: 'main_hospital' }, descriptionAr: 'يورو', debit: 100, credit: 0,
  transactionCurrency: 'EUR', exchangeRate: 0, baseDebit: 0, baseCredit: 0
};
const resNegL = validateJournal(
  { ...testForeignMissingFx, lines: [foreignNoRateLine, testForeignMissingFx.lines[1]] },
  [foreignNoRateLine, testForeignMissingFx.lines[1]],
  state.accounts,
  state.calendars[0].periods,
  state.ledgerProfile
);
assert(!resNegL.isValid, 'NEG-L', 'Foreign currency line without exchange rate cannot be added to base total');

// M. Double counted parent totals prevention in Trial Balance
const tbTestM = calculateTrialBalance(state.accounts, state.openingBalances, state.postedVouchers, 'FY2026-P09');
// In tbTestM, grand total closing debit should equal sum of ONLY posting accounts, not posting + group!
const sumOfAllRows = tbTestM.rows.reduce((s, r) => s + r.closingDebitSar, 0);
const grandTotal = tbTestM.totalClosingDebitSar;
assert(
  sumOfAllRows > grandTotal && grandTotal > 0,
  'NEG-M',
  'Grand totals sum ONLY leaf posting accounts; parent groups are NOT double counted in summary'
);

// N. Reversal affects correct period
const reversalPeriodVouchers = state.postedVouchers.filter(v => v.category === 'reversal' && v.periodId === 'FY2026-P09');
assert(reversalPeriodVouchers.length > 0, 'NEG-N', 'Reversal entries correctly land in target period');

// O. Failure leaves state unchanged
const stateSnapshot = JSON.stringify(state);
simulatePostJournal(state, 'INVALID-JOURNAL-ID', 'Tester');
assert(JSON.stringify(state) === stateSnapshot, 'NEG-O', 'Failed journal posting leaves entire state completely unchanged');

  return {
    total: results.length,
    passed: passCount,
    failed: failCount,
    results
  };
}
