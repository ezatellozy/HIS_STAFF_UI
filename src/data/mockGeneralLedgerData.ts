// ============================================================================
// HEALTHCARE FINANCE CORE: MOCK GENERAL LEDGER FIXTURES & SYNTHETIC DATA
// ============================================================================

import {
  LedgerProfile,
  AccountNode,
  FinancialDimensionValue,
  DimensionCombinationRule,
  FiscalCalendar,
  JournalHeader,
  GeneralLedgerVoucherEntry,
  OpeningBalanceRecord,
  SourceAccountingEvent,
  PostingProfileRule,
  GlReconciliationRecord,
  GeneralLedgerState
} from '../types/generalLedger';

// ----------------------------------------------------------------------------
// 1. SYNTHETIC LEDGER PROFILE & INSTITUTIONAL CONFIGURATION
// ----------------------------------------------------------------------------

export const MOCK_LEDGER_PROFILE: LedgerProfile = {
  ledgerId: 'LEDGER-HOSP-01',
  ledgerNameAr: 'دفتر الأستاذ العام النموذجي للمستشفى (محاكاة)',
  ledgerNameEn: 'Hospital Primary General Ledger (Synthetic Demonstration)',
  accountingEntity: {
    entityId: 'LEGAL-ORG-001',
    legalNameAr: 'منشأة المستشفى التخصصي للرعاية الصحية (كيان نموذجي محاكى)',
    legalNameEn: 'Specialized Hospital Healthcare Facility (Illustrative Model)',
    registrationNumber: 'CR-1010-998822-SIM',
    taxRegistrationNumber: '300998877600003',
    organizationType: 'single_hospital_with_branches',
    isSyntheticDemo: true
  },
  applicableFramework: 'IFRS_SOCPA_ILLUSTRATIVE',
  functionalCurrency: {
    code: 'SAR',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    symbol: 'ر.س',
    decimalPlaces: 2,
    isFunctional: true,
    isPresentation: true
  },
  presentationCurrency: {
    code: 'SAR',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    symbol: 'ر.س',
    decimalPlaces: 2,
    isFunctional: true,
    isPresentation: true
  },
  fiscalCalendarId: 'CAL-2026-STANDARD',
  status: 'active_simulation',
  effectiveDate: '2026-01-01',
  provenanceNote: 'ملف تعريفي نموذجي محاكى مخصص للاختبارات التشغيلية وواجهات المستخدم دون أي أثر محاسبي قانوني فعلي.'
};

// ----------------------------------------------------------------------------
// 2. CHART OF ACCOUNTS (SMALL, INTERNALLY CONSISTENT SAMPLE COA)
// ----------------------------------------------------------------------------

export const MOCK_CHART_OF_ACCOUNTS: AccountNode[] = [
  // 1000 - ASSETS (الأصول)
  {
    id: 'ACC-1000',
    accountCode: '1000',
    nameAr: 'الأصول',
    nameEn: 'Assets',
    category: 'asset',
    accountType: 'group',
    normalBalance: 'debit',
    parentAccountCode: null,
    level: 1,
    state: 'active',
    effectiveFrom: '2026-01-01',
    descriptionAr: 'المجموعة الرئيسية لجميع أصول المستشفى المتداولة وغير المتداولة',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-1100',
    accountCode: '1100',
    nameAr: 'الأصول المتداولة',
    nameEn: 'Current Assets',
    category: 'asset',
    accountType: 'group',
    normalBalance: 'debit',
    parentAccountCode: '1000',
    level: 2,
    state: 'active',
    effectiveFrom: '2026-01-01',
    descriptionAr: 'الأصول المتوقع تحويلها لنقدية أو استهلاكها خلال الدورة التشغيلية',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-1110',
    accountCode: '1110',
    nameAr: 'النقد وما في حكمه',
    nameEn: 'Cash and Cash Equivalents',
    category: 'asset',
    accountType: 'group',
    normalBalance: 'debit',
    parentAccountCode: '1100',
    level: 3,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-1111',
    accountCode: '1111',
    nameAr: 'حساب البنك الجاري الرئيسي - بنك الرياض (محاكاة)',
    nameEn: 'Main Operating Bank Account - Riyad Bank (Simulated)',
    category: 'asset',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '1110',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: true, requiresProject: false, disallowManualJournal: false, reconciliationKey: 'bank_clearing' },
    historicalEntryCount: 14,
    isSyntheticSample: true
  },
  {
    id: 'ACC-1112',
    accountCode: '1112',
    nameAr: 'صندوق العهدة والنقدية الصغيرة بالمستشفى',
    nameEn: 'Hospital Petty Cash & Cashier Floats',
    category: 'asset',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '1110',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 5,
    isSyntheticSample: true
  },
  {
    id: 'ACC-1120',
    accountCode: '1120',
    nameAr: 'الذمم المدينة والعملاء',
    nameEn: 'Accounts Receivable',
    category: 'asset',
    accountType: 'group',
    normalBalance: 'debit',
    parentAccountCode: '1100',
    level: 3,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-1121',
    accountCode: '1121',
    nameAr: 'مطالبات شركات التأمين الصحي والجهات الضامنة',
    nameEn: 'Health Insurance & Corporate Receivables',
    category: 'asset',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '1120',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: true, requiresProject: false, disallowManualJournal: false, reconciliationKey: 'patient_receivable' },
    historicalEntryCount: 22,
    isSyntheticSample: true
  },
  {
    id: 'ACC-1130',
    accountCode: '1130',
    nameAr: 'المخزون والمهمات الطبية',
    nameEn: 'Medical Inventories & Supplies',
    category: 'asset',
    accountType: 'group',
    normalBalance: 'debit',
    parentAccountCode: '1100',
    level: 3,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-1131',
    accountCode: '1131',
    nameAr: 'وسيط مخزون المستلزمات الطبية والأدوية',
    nameEn: 'Medical Supplies & Drug Stock Clearing',
    category: 'asset',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '1130',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: true, requiresBranch: true, requiresProject: false, disallowManualJournal: false, reconciliationKey: 'inventory_clearing' },
    historicalEntryCount: 9,
    isSyntheticSample: true
  },

  // 2000 - LIABILITIES (الخصوم والالتزامات)
  {
    id: 'ACC-2000',
    accountCode: '2000',
    nameAr: 'الخصوم والالتزامات',
    nameEn: 'Liabilities',
    category: 'liability',
    accountType: 'group',
    normalBalance: 'credit',
    parentAccountCode: null,
    level: 1,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-2100',
    accountCode: '2100',
    nameAr: 'الالتزامات المتداولة',
    nameEn: 'Current Liabilities',
    category: 'liability',
    accountType: 'group',
    normalBalance: 'credit',
    parentAccountCode: '2000',
    level: 2,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-2010',
    accountCode: '2010',
    nameAr: 'ذمم الموردين التجارية (AP Trade Control)',
    nameEn: 'Accounts Payable Trade Control',
    category: 'liability',
    accountType: 'posting',
    normalBalance: 'credit',
    parentAccountCode: '2100',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    descriptionAr: 'الحساب الوسيط لمطابقة فواتير الموردين المسجلة ومقترحات السداد',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: true, requiresProject: false, disallowManualJournal: false, reconciliationKey: 'accounts_payable' },
    historicalEntryCount: 38,
    isSyntheticSample: true
  },
  {
    id: 'ACC-2015',
    accountCode: '2015',
    nameAr: 'استحقاقات فواتير المشتريات غير المستلمة (GRNI Accruals)',
    nameEn: 'Goods Received Not Invoiced (GRNI Accruals)',
    category: 'liability',
    accountType: 'posting',
    normalBalance: 'credit',
    parentAccountCode: '2100',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 11,
    isSyntheticSample: true
  },
  {
    id: 'ACC-2130',
    accountCode: '2130',
    nameAr: 'أمانات ضريبة القيمة المضافة المستحقة (VAT Clearing)',
    nameEn: 'Value Added Tax (VAT) Clearing Account',
    category: 'liability',
    accountType: 'posting',
    normalBalance: 'credit',
    parentAccountCode: '2100',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 16,
    isSyntheticSample: true
  },

  // 3000 - EQUITY (حقوق الملكية)
  {
    id: 'ACC-3000',
    accountCode: '3000',
    nameAr: 'حقوق الملكية ورأس المال',
    nameEn: 'Equity',
    category: 'equity',
    accountType: 'group',
    normalBalance: 'credit',
    parentAccountCode: null,
    level: 1,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-3110',
    accountCode: '3110',
    nameAr: 'رأس المال المؤسس المدفوع (محاكاة)',
    nameEn: 'Contributed Capital (Simulated)',
    category: 'equity',
    accountType: 'posting',
    normalBalance: 'credit',
    parentAccountCode: '3000',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 2,
    isSyntheticSample: true
  },
  {
    id: 'ACC-3120',
    accountCode: '3120',
    nameAr: 'الأرباح المبقاة المدورة من سنوات سابقة (مرجع)',
    nameEn: 'Retained Earnings Reference (Prior Periods)',
    category: 'equity',
    accountType: 'posting',
    normalBalance: 'credit',
    parentAccountCode: '3000',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 3,
    isSyntheticSample: true
  },

  // 4000 - REVENUES (الإيرادات التشغيلية)
  {
    id: 'ACC-4000',
    accountCode: '4000',
    nameAr: 'الإيرادات التشغيلية للرعاية الصحية',
    nameEn: 'Healthcare Operating Revenues',
    category: 'revenue',
    accountType: 'group',
    normalBalance: 'credit',
    parentAccountCode: null,
    level: 1,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-4110',
    accountCode: '4110',
    nameAr: 'إيرادات العيادات الخارجية واستشارات الأطباء (OPD)',
    nameEn: 'Outpatient Clinic & Consultation Revenues',
    category: 'revenue',
    accountType: 'posting',
    normalBalance: 'credit',
    parentAccountCode: '4000',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: true, requiresDepartment: true, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 41,
    isSyntheticSample: true
  },
  {
    id: 'ACC-4120',
    accountCode: '4120',
    nameAr: 'إيرادات التنويم والعمليات الجراحية (IPD & OR)',
    nameEn: 'Inpatient & Surgical Procedures Revenues',
    category: 'revenue',
    accountType: 'posting',
    normalBalance: 'credit',
    parentAccountCode: '4000',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: true, requiresDepartment: true, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 30,
    isSyntheticSample: true
  },

  // 5000 - EXPENSES (المصروفات التشغيلية)
  {
    id: 'ACC-5000',
    accountCode: '5000',
    nameAr: 'المصروفات التشغيلية والسريرية',
    nameEn: 'Operating & Clinical Expenses',
    category: 'expense',
    accountType: 'group',
    normalBalance: 'debit',
    parentAccountCode: null,
    level: 1,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: false, requiresDepartment: false, requiresBranch: false, requiresProject: false, disallowManualJournal: true },
    isSyntheticSample: true
  },
  {
    id: 'ACC-5100',
    accountCode: '5100',
    nameAr: 'مصروفات مستلزمات طبية وجراحية ومستهلكات',
    nameEn: 'Medical & Surgical Supplies Expense',
    category: 'expense',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '5000',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: true, requiresDepartment: true, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 52,
    isSyntheticSample: true
  },
  {
    id: 'ACC-5120',
    accountCode: '5120',
    nameAr: 'مصروفات أدوية ومحاليل وريدية صيدلانية',
    nameEn: 'Pharmaceuticals & IV Fluids Expense',
    category: 'expense',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '5000',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: true, requiresDepartment: true, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 47,
    isSyntheticSample: true
  },
  {
    id: 'ACC-5300',
    accountCode: '5300',
    nameAr: 'مصروفات صيانة ومعايرة الأجهزة الطبية الحيوية',
    nameEn: 'Biomedical Maintenance & Calibration Expense',
    category: 'expense',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '5000',
    level: 4,
    state: 'active',
    effectiveFrom: '2026-01-01',
    restrictions: { requiresCostCenter: true, requiresDepartment: true, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 18,
    isSyntheticSample: true
  },
  {
    id: 'ACC-5399-INACTIVE',
    accountCode: '5399',
    nameAr: 'مصروفات تشغيلية موقوفة (حساب غير نشط للأرشفة)',
    nameEn: 'Archived Obsolete Operating Expense (Inactive)',
    category: 'expense',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '5000',
    level: 4,
    state: 'inactive',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2025-12-31',
    descriptionAr: 'حساب تاريخي تم إيقافه بعد ترحيل عمليات سابقة، غير مؤهل للقيود الجديدة',
    restrictions: { requiresCostCenter: true, requiresDepartment: false, requiresBranch: true, requiresProject: false, disallowManualJournal: false },
    historicalEntryCount: 12,
    isSyntheticSample: true
  }
];

// ----------------------------------------------------------------------------
// 3. FINANCIAL DIMENSIONS (BRANCH, DEPT, COST CENTER, PROJECT)
// ----------------------------------------------------------------------------

export const MOCK_BRANCH_DIMENSIONS: FinancialDimensionValue[] = [
  {
    code: 'main_hospital',
    nameAr: 'المستشفى الرئيسي - الرياض (المركز الرئيسي)',
    nameEn: 'Main Hospital - Riyadh Central',
    dimensionType: 'branch',
    isActive: true,
    effectiveFrom: '2026-01-01'
  },
  {
    code: 'suburban_clinic_branch',
    nameAr: 'مجمع العيادات الخارجية التخصصية - فرع الشمال',
    nameEn: 'Specialized Outpatient Complex - North Branch',
    dimensionType: 'branch',
    isActive: true,
    effectiveFrom: '2026-01-01'
  }
];

export const MOCK_DEPARTMENT_DIMENSIONS: FinancialDimensionValue[] = [
  { code: 'opd', nameAr: 'العيادات الخارجية (OPD)', nameEn: 'Outpatient Department', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'er', nameAr: 'طوارئ وإصابات الحوادث (ER)', nameEn: 'Emergency Department', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'icu', nameAr: 'العناية المركزة للبالغين (ICU)', nameEn: 'Intensive Care Unit', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'or', nameAr: 'غرف العمليات الجراحية (OR)', nameEn: 'Operating Rooms Complex', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'ipd', nameAr: 'أجنحة التنويم الداخلي (Wards)', nameEn: 'Inpatient Wards', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'pharmacy', nameAr: 'الصيدلية والخدمات الدوائية', nameEn: 'Pharmacy Operations', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'laboratory', nameAr: 'المختبر وبنك الدم', nameEn: 'Laboratory & Pathology', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'admin', nameAr: 'الإدارة العامة والمالية', nameEn: 'General Administration & Finance', dimensionType: 'department', isActive: true, effectiveFrom: '2026-01-01' }
];

export const MOCK_COST_CENTER_DIMENSIONS: FinancialDimensionValue[] = [
  { code: 'CC-ICU-701', nameAr: 'مركز تكلفة العناية المركزة للبالغين', nameEn: 'Adult ICU Cost Center', dimensionType: 'cost_center', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'CC-OR-801', nameAr: 'مركز تكلفة مجمع العمليات الجراحية', nameEn: 'Operating Suites Cost Center', dimensionType: 'cost_center', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'CC-ER-101', nameAr: 'مركز تكلفة طوارئ وإصابات الحوادث', nameEn: 'Emergency Center Cost Center', dimensionType: 'cost_center', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'CC-BIOMED-301', nameAr: 'مركز تكلفة الهندسة الطبية الحيوية', nameEn: 'Biomedical Engineering Cost Center', dimensionType: 'cost_center', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'CC-PHARM-201', nameAr: 'مركز تكلفة الصيدلية المركزية ومخزن الأدوية', nameEn: 'Central Pharmacy Cost Center', dimensionType: 'cost_center', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'CC-LAB-501', nameAr: 'مركز تكلفة المختبر الطبي وبنك الدم', nameEn: 'Clinical Laboratory Cost Center', dimensionType: 'cost_center', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'CC-ADMIN-001', nameAr: 'مركز تكلفة الشؤون الإدارية والمالية', nameEn: 'Finance & Administration Cost Center', dimensionType: 'cost_center', isActive: true, effectiveFrom: '2026-01-01' }
];

export const MOCK_PROJECT_DIMENSIONS: FinancialDimensionValue[] = [
  { code: 'PRJ-EXP-2026', nameAr: 'مشروع توسعة الرعاية الحرجة وأجهزة التنفس', nameEn: 'Critical Care Expansion Project', dimensionType: 'project', isActive: true, effectiveFrom: '2026-01-01' },
  { code: 'PRJ-NPHIES-INT', nameAr: 'مشروع الربط الفني لبوابة نفيس الوطنية', nameEn: 'NPHIES Integration Program', dimensionType: 'project', isActive: true, effectiveFrom: '2026-01-01' }
];

export const MOCK_COMBINATION_RULES: DimensionCombinationRule[] = [
  {
    id: 'RULE-EXPENSES-MANDATORY',
    nameAr: 'إلزامية مركز التكلفة والفرع لجميع حسابات المصروفات (5*)',
    accountPattern: '5*',
    mandatoryDimensions: ['cost_center', 'branch'],
    prohibitedDimensions: [],
    isActive: true
  },
  {
    id: 'RULE-REVENUES-MANDATORY',
    nameAr: 'إلزامية مركز التكلفة والفرع لحسابات الإيرادات التشغيلية (4*)',
    accountPattern: '4*',
    mandatoryDimensions: ['cost_center', 'branch'],
    prohibitedDimensions: [],
    isActive: true
  }
];

// ----------------------------------------------------------------------------
// 4. FISCAL CALENDARS & PERIODS (STANDARD & NON-CALENDAR OPTIONS)
// ----------------------------------------------------------------------------

export const MOCK_STANDARD_CALENDAR: FiscalCalendar = {
  id: 'CAL-2026-STANDARD',
  nameAr: 'التقويم المالي القياسي 2026 (يناير - ديسمبر + فترة تسوية)',
  nameEn: 'Standard Fiscal Calendar 2026 (Jan - Dec + Adjustment Period)',
  fiscalYearName: '2026',
  calendarType: 'calendar_year_standard',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  hasAdjustmentPeriod: true,
  isSyntheticSample: true,
  periods: [
    { id: 'FY2026-P01', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 1, periodNameAr: 'فترة 01 - يناير 2026', periodNameEn: 'Period 01 - Jan 2026', startDate: '2026-01-01', endDate: '2026-01-31', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P02', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 2, periodNameAr: 'فترة 02 - فبراير 2026', periodNameEn: 'Period 02 - Feb 2026', startDate: '2026-02-01', endDate: '2026-02-28', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P03', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 3, periodNameAr: 'فترة 03 - مارس 2026', periodNameEn: 'Period 03 - Mar 2026', startDate: '2026-03-01', endDate: '2026-03-31', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P04', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 4, periodNameAr: 'فترة 04 - أبريل 2026', periodNameEn: 'Period 04 - Apr 2026', startDate: '2026-04-01', endDate: '2026-04-30', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P05', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 5, periodNameAr: 'فترة 05 - مايو 2026', periodNameEn: 'Period 05 - May 2026', startDate: '2026-05-01', endDate: '2026-05-31', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P06', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 6, periodNameAr: 'فترة 06 - يونيو 2026', periodNameEn: 'Period 06 - Jun 2026', startDate: '2026-06-01', endDate: '2026-06-30', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P07', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 7, periodNameAr: 'فترة 07 - يوليو 2026', periodNameEn: 'Period 07 - Jul 2026', startDate: '2026-07-01', endDate: '2026-07-31', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P08', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 8, periodNameAr: 'فترة 08 - أغسطس 2026', periodNameEn: 'Period 08 - Aug 2026', startDate: '2026-08-01', endDate: '2026-08-31', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY2026-P09', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 9, periodNameAr: 'فترة 09 - سبتمبر 2026 (الفترة الحالية)', periodNameEn: 'Period 09 - Sep 2026 (Active)', startDate: '2026-09-01', endDate: '2026-09-30', periodType: 'standard', status: 'open', isPostingEligible: true },
    { id: 'FY2026-P10', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 10, periodNameAr: 'فترة 10 - أكتوبر 2026', periodNameEn: 'Period 10 - Oct 2026', startDate: '2026-10-01', endDate: '2026-10-31', periodType: 'standard', status: 'on_hold', isPostingEligible: false },
    { id: 'FY2026-P11', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 11, periodNameAr: 'فترة 11 - نوفمبر 2026', periodNameEn: 'Period 11 - Nov 2026', startDate: '2026-11-01', endDate: '2026-11-30', periodType: 'standard', status: 'on_hold', isPostingEligible: false },
    { id: 'FY2026-P12', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 12, periodNameAr: 'فترة 12 - ديسمبر 2026', periodNameEn: 'Period 12 - Dec 2026', startDate: '2026-12-01', endDate: '2026-12-31', periodType: 'standard', status: 'on_hold', isPostingEligible: false },
    { id: 'FY2026-P13', calendarId: 'CAL-2026-STANDARD', fiscalYear: '2026', periodNumber: 13, periodNameAr: 'فترة 13 - تسويات نهاية السنة المالية 2026', periodNameEn: 'Period 13 - Year-End Adjustments 2026', startDate: '2026-12-31', endDate: '2026-12-31', periodType: 'adjustment', status: 'on_hold', isPostingEligible: false }
  ]
};

// Configurable non-calendar fiscal year scenario fixture (GL08 requirement)
export const MOCK_NON_CALENDAR_FISCAL_YEAR: FiscalCalendar = {
  id: 'CAL-2026-NON-CALENDAR',
  nameAr: 'التقويم المالي غير الميلادي (1 يوليو 2026 إلى 30 يونيو 2027)',
  nameEn: 'Non-Calendar Fiscal Year (July 1, 2026 to June 30, 2027)',
  fiscalYearName: '2026-2027',
  calendarType: 'non_calendar_fiscal_year',
  startDate: '2026-07-01',
  endDate: '2027-06-30',
  hasAdjustmentPeriod: true,
  isSyntheticSample: true,
  periods: [
    { id: 'FY27-P01', calendarId: 'CAL-2026-NON-CALENDAR', fiscalYear: '2026-2027', periodNumber: 1, periodNameAr: 'فترة 01 - يوليو 2026', periodNameEn: 'P01 - Jul 2026', startDate: '2026-07-01', endDate: '2026-07-31', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY27-P02', calendarId: 'CAL-2026-NON-CALENDAR', fiscalYear: '2026-2027', periodNumber: 2, periodNameAr: 'فترة 02 - أغسطس 2026', periodNameEn: 'P02 - Aug 2026', startDate: '2026-08-01', endDate: '2026-08-31', periodType: 'standard', status: 'closed_simulated', isPostingEligible: false },
    { id: 'FY27-P03', calendarId: 'CAL-2026-NON-CALENDAR', fiscalYear: '2026-2027', periodNumber: 3, periodNameAr: 'فترة 03 - سبتمبر 2026 (حالية)', periodNameEn: 'P03 - Sep 2026 (Active)', startDate: '2026-09-01', endDate: '2026-09-30', periodType: 'standard', status: 'open', isPostingEligible: true }
  ]
};

// ----------------------------------------------------------------------------
// 5. SYNTHETIC OPENING BALANCES (EXPLICIT PROVENANCE & BALANCE EVIDENCE)
// ----------------------------------------------------------------------------

export const MOCK_OPENING_BALANCES: OpeningBalanceRecord[] = [
  {
    id: 'OB-2026-001',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-1111',
    accountCode: '1111',
    accountNameAr: 'حساب البنك الجاري الرئيسي - بنك الرياض (محاكاة)',
    dimensions: { branchId: 'main_hospital' },
    debitBalance: 2450000.00,
    creditBalance: 0.00,
    currency: 'SAR',
    sourceType: 'prior_period_closing_reference',
    sourceDocumentRef: 'AUDIT-CLOSING-FY2025-P13-SNB',
    provenanceNote: 'رصيد مرحل ومطابق وفق تسوية الإقفال الختامي للسنة المالية المنتهية 2025.',
    status: 'verified',
    isSyntheticSample: true
  },
  {
    id: 'OB-2026-002',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-1112',
    accountCode: '1112',
    accountNameAr: 'صندوق العهدة والنقدية الصغيرة بالمستشفى',
    dimensions: { branchId: 'main_hospital' },
    debitBalance: 50000.00,
    creditBalance: 0.00,
    currency: 'SAR',
    sourceType: 'prior_period_closing_reference',
    sourceDocumentRef: 'AUDIT-CLOSING-FY2025-P13-CASH',
    provenanceNote: 'رصيد عهدة النقدية الثابتة للخزينة والمستودع.',
    status: 'verified',
    isSyntheticSample: true
  },
  {
    id: 'OB-2026-003',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-1121',
    accountCode: '1121',
    accountNameAr: 'مطالبات شركات التأمين الصحي والجهات الضامنة',
    dimensions: { branchId: 'main_hospital' },
    debitBalance: 1450000.00,
    creditBalance: 0.00,
    currency: 'SAR',
    sourceType: 'legacy_migration_extract',
    sourceDocumentRef: 'NPHIES-RECON-OB-2025-BATCH',
    provenanceNote: 'أرصدة مطالبات تأمينية معتمدة قيد التحصيل من مطالبات نفيس 2025.',
    status: 'verified',
    isSyntheticSample: true
  },
  {
    id: 'OB-2026-004',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-1131',
    accountCode: '1131',
    accountNameAr: 'وسيط مخزون المستلزمات الطبية والأدوية',
    dimensions: { branchId: 'main_hospital', departmentId: 'pharmacy' },
    debitBalance: 900000.00,
    creditBalance: 0.00,
    currency: 'SAR',
    sourceType: 'legacy_migration_extract',
    sourceDocumentRef: 'STOCK-COUNT-AUDIT-DEC2025',
    provenanceNote: 'رصيد الجرد السنوي الفعلي المعتمد للمستودع الطبي والصيدلية المركزية.',
    status: 'verified',
    isSyntheticSample: true
  },
  {
    id: 'OB-2026-005',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-2010',
    accountCode: '2010',
    accountNameAr: 'ذمم الموردين التجارية (AP Trade Control)',
    dimensions: { branchId: 'main_hospital' },
    debitBalance: 0.00,
    creditBalance: 650000.00,
    currency: 'SAR',
    sourceType: 'prior_period_closing_reference',
    sourceDocumentRef: 'AP-AGING-AUDIT-FY2025',
    provenanceNote: 'إجمالي التزامات فواتير الموردين المستحقة غير المسددة حتى 31 ديسمبر 2025.',
    status: 'verified',
    isSyntheticSample: true
  },
  {
    id: 'OB-2026-006',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-2130',
    accountCode: '2130',
    accountNameAr: 'أمانات ضريبة القيمة المضافة المستحقة (VAT Clearing)',
    dimensions: { branchId: 'main_hospital' },
    debitBalance: 0.00,
    creditBalance: 200000.00,
    currency: 'SAR',
    sourceType: 'prior_period_closing_reference',
    sourceDocumentRef: 'ZATCA-VAT-Q4-2025-CLEARING',
    provenanceNote: 'مستحقات إقرار الربع الرابع 2025 لهيئة الزكاة والضريبة والجمارك.',
    status: 'verified',
    isSyntheticSample: true
  },
  {
    id: 'OB-2026-007',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-3110',
    accountCode: '3110',
    accountNameAr: 'رأس المال المؤسس المدفوع (محاكاة)',
    dimensions: {},
    debitBalance: 0.00,
    creditBalance: 3000000.00,
    currency: 'SAR',
    sourceType: 'prior_period_closing_reference',
    sourceDocumentRef: 'ARTICLES-OF-ASSOCIATION-CAPITAL',
    provenanceNote: 'رأس مال المنشأة المدفوع بالكامل وفق عقد التأسيس.',
    status: 'verified',
    isSyntheticSample: true
  },
  {
    id: 'OB-2026-008',
    openingDate: '2026-01-01',
    fiscalYear: '2026',
    accountId: 'ACC-3120',
    accountCode: '3120',
    accountNameAr: 'الأرباح المبقاة المدورة من سنوات سابقة (مرجع)',
    dimensions: {},
    debitBalance: 0.00,
    creditBalance: 1000000.00,
    currency: 'SAR',
    sourceType: 'prior_period_closing_reference',
    sourceDocumentRef: 'RETAINED-EARNINGS-CERT-2025',
    provenanceNote: 'الأرباح المتراكمة المدورة بعد استقطاع الاحتياطيات حتى إقفال 2025.',
    status: 'verified',
    isSyntheticSample: true
  }
];

// ----------------------------------------------------------------------------
// 6. SYNTHETIC POSTED VOUCHERS (BALANCED GENERAL LEDGER ENTRIES)
// ----------------------------------------------------------------------------

export const MOCK_POSTED_VOUCHERS: GeneralLedgerVoucherEntry[] = [
  {
    voucherId: 'VCH-2026-00101',
    journalId: 'JRN-2026-00101',
    voucherNumber: 'JV-2026-09-001',
    accountingDate: '2026-09-05',
    periodId: 'FY2026-P09',
    category: 'manual_adjustment',
    descriptionAr: 'قيد تسوية أتعاب واستشارات استشارية لقسم العناية المركزة (ICU)',
    totalDebitSar: 45000.00,
    totalCreditSar: 45000.00,
    postedByPersona: 'أمل الشريف (محاسب عام GL)',
    postedAt: '2026-09-05T10:15:00Z',
    isReversed: false,
    lines: [
      {
        id: 'LINE-01-01',
        lineNumber: 1,
        accountId: 'ACC-5100',
        accountCode: '5100',
        accountNameAr: 'مصروفات مستلزمات طبية وجراحية ومستهلكات',
        dimensions: { branchId: 'main_hospital', departmentId: 'icu', costCenterCode: 'CC-ICU-701' },
        descriptionAr: 'تحميل مستهلكات وقساطر قسطرة حرجة على قسم ICU',
        debit: 45000.00,
        credit: 0.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 45000.00,
        baseCredit: 0.00,
        supportingReference: 'DOC-REQ-ICU-091'
      },
      {
        id: 'LINE-01-02',
        lineNumber: 2,
        accountId: 'ACC-1131',
        accountCode: '1131',
        accountNameAr: 'وسيط مخزون المستلزمات الطبية والأدوية',
        dimensions: { branchId: 'main_hospital', departmentId: 'pharmacy' },
        descriptionAr: 'صرف من المستودع الطبي الرئيسي لصالح ICU',
        debit: 0.00,
        credit: 45000.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 0.00,
        baseCredit: 45000.00,
        supportingReference: 'ISSUE-VCH-8812'
      }
    ]
  },
  {
    voucherId: 'VCH-2026-00102',
    journalId: 'JRN-2026-00102',
    voucherNumber: 'JV-2026-09-002',
    accountingDate: '2026-09-12',
    periodId: 'FY2026-P09',
    category: 'manual_adjustment',
    descriptionAr: 'إثبات مصروف صيانة وقائية لأجهزة التخدير بغرف العمليات (OR)',
    totalDebitSar: 28750.00,
    totalCreditSar: 28750.00,
    postedByPersona: 'فهد المنصور (رئيس الحسابات)',
    postedAt: '2026-09-12T14:30:00Z',
    isReversed: false,
    lines: [
      {
        id: 'LINE-02-01',
        lineNumber: 1,
        accountId: 'ACC-5300',
        accountCode: '5300',
        accountNameAr: 'مصروفات صيانة ومعايرة الأجهزة الطبية الحيوية',
        dimensions: { branchId: 'main_hospital', departmentId: 'or', costCenterCode: 'CC-BIOMED-301' },
        descriptionAr: 'صيانة ومعايرة دورية معتمدة لعربات التخدير',
        debit: 25000.00,
        credit: 0.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 25000.00,
        baseCredit: 0.00,
        supportingReference: 'WO-BIOMED-2026-441'
      },
      {
        id: 'LINE-02-02',
        lineNumber: 2,
        accountId: 'ACC-2130',
        accountCode: '2130',
        accountNameAr: 'أمانات ضريبة القيمة المضافة المستحقة (VAT Clearing)',
        dimensions: { branchId: 'main_hospital' },
        descriptionAr: 'ضريبة القيمة المضافة المدخلات (15%)',
        debit: 3750.00,
        credit: 0.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 3750.00,
        baseCredit: 0.00
      },
      {
        id: 'LINE-02-03',
        lineNumber: 3,
        accountId: 'ACC-2010',
        accountCode: '2010',
        accountNameAr: 'ذمم الموردين التجارية (AP Trade Control)',
        dimensions: { branchId: 'main_hospital' },
        descriptionAr: 'استحقاق شركة الصيانة الطبية المتخصصة',
        debit: 0.00,
        credit: 28750.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 0.00,
        baseCredit: 28750.00,
        supportingReference: 'INV-SUP-MAINT-9901'
      }
    ]
  },
  {
    voucherId: 'VCH-2026-00103',
    journalId: 'JRN-2026-00103',
    voucherNumber: 'JV-2026-09-003',
    accountingDate: '2026-09-18',
    periodId: 'FY2026-P09',
    category: 'source_integration',
    descriptionAr: 'إيرادات مجمعة لخدمات العيادات الخارجية والعيادات الاستشارية',
    totalDebitSar: 82000.00,
    totalCreditSar: 82000.00,
    postedByPersona: 'فهد المنصور (رئيس الحسابات)',
    postedAt: '2026-09-18T18:45:00Z',
    isReversed: false,
    sourceReference: 'OPD-BILL-DAY-BATCH-2026-0918',
    lines: [
      {
        id: 'LINE-03-01',
        lineNumber: 1,
        accountId: 'ACC-1111',
        accountCode: '1111',
        accountNameAr: 'حساب البنك الجاري الرئيسي - بنك الرياض (محاكاة)',
        dimensions: { branchId: 'main_hospital' },
        descriptionAr: 'متحصلات نقاط البيع (مدى / فيزا) لصندوق العيادات',
        debit: 32000.00,
        credit: 0.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 32000.00,
        baseCredit: 0.00
      },
      {
        id: 'LINE-03-02',
        lineNumber: 2,
        accountId: 'ACC-1121',
        accountCode: '1121',
        accountNameAr: 'مطالبات شركات التأمين الصحي والجهات الضامنة',
        dimensions: { branchId: 'main_hospital' },
        descriptionAr: 'حصة شركات التأمين المفوترة عبر نظام نفيس',
        debit: 50000.00,
        credit: 0.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 50000.00,
        baseCredit: 0.00
      },
      {
        id: 'LINE-03-03',
        lineNumber: 3,
        accountId: 'ACC-4110',
        accountCode: '4110',
        accountNameAr: 'إيرادات العيادات الخارجية واستشارات الأطباء (OPD)',
        dimensions: { branchId: 'main_hospital', departmentId: 'opd', costCenterCode: 'CC-ER-101' },
        descriptionAr: 'إجمالي إيراد الخدمات والعيادات الخارجية',
        debit: 0.00,
        credit: 82000.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 0.00,
        baseCredit: 82000.00
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 7. DRAFT & UNDER REVIEW JOURNALS FOR WORKBENCH
// ----------------------------------------------------------------------------

export const MOCK_JOURNAL_DRAFTS: JournalHeader[] = [
  {
    id: 'JRN-2026-DRAFT-01',
    category: 'manual_adjustment',
    descriptionAr: 'تسوية استهلاك أدوية قسم الطوارئ (ER) للأسبوع الثالث من سبتمبر',
    accountingDate: '2026-09-21',
    periodId: 'FY2026-P09',
    currency: 'SAR',
    origin: 'manual_ui',
    supportingReference: 'REQ-ER-DRUGS-2026-W3',
    preparedByPersona: 'أمل الشريف (محاسب عام GL)',
    status: 'draft',
    lines: [
      {
        id: 'DLINE-01-01',
        lineNumber: 1,
        accountId: 'ACC-5120',
        accountCode: '5120',
        accountNameAr: 'مصروفات أدوية ومحاليل وريدية صيدلانية',
        dimensions: { branchId: 'main_hospital', departmentId: 'er', costCenterCode: 'CC-ER-101' },
        descriptionAr: 'استهلاك مضادات حيوية ومحاليل وريدية بقسم الطوارئ',
        debit: 18500.00,
        credit: 0.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 18500.00,
        baseCredit: 0.00
      },
      {
        id: 'DLINE-01-02',
        lineNumber: 2,
        accountId: 'ACC-1131',
        accountCode: '1131',
        accountNameAr: 'وسيط مخزون المستلزمات الطبية والأدوية',
        dimensions: { branchId: 'main_hospital', departmentId: 'pharmacy' },
        descriptionAr: 'صرف من الصيدلية الرئيسية لقسم الطوارئ',
        debit: 0.00,
        credit: 18500.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 0.00,
        baseCredit: 18500.00
      }
    ]
  },
  {
    id: 'JRN-2026-DRAFT-02',
    category: 'accrual',
    descriptionAr: 'قيد استحقاق صيانة أجهزة تنفس اصطناعي قيد المراجعة والاعتماد',
    accountingDate: '2026-09-20',
    periodId: 'FY2026-P09',
    currency: 'SAR',
    origin: 'manual_ui',
    supportingReference: 'QUOT-VENT-MAINT-009',
    preparedByPersona: 'أمل الشريف (محاسب عام GL)',
    approvedByPersona: 'فهد المنصور (رئيس الحسابات)',
    status: 'approved',
    lines: [
      {
        id: 'DLINE-02-01',
        lineNumber: 1,
        accountId: 'ACC-5300',
        accountCode: '5300',
        accountNameAr: 'مصروفات صيانة ومعايرة الأجهزة الطبية الحيوية',
        dimensions: { branchId: 'main_hospital', departmentId: 'icu', costCenterCode: 'CC-BIOMED-301' },
        descriptionAr: 'استحقاق صيانة أجهزة تنفس الرعاية الحرجة',
        debit: 12000.00,
        credit: 0.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 12000.00,
        baseCredit: 0.00
      },
      {
        id: 'DLINE-02-02',
        lineNumber: 2,
        accountId: 'ACC-2015',
        accountCode: '2015',
        accountNameAr: 'استحقاقات فواتير المشتريات غير المستلمة (GRNI Accruals)',
        dimensions: { branchId: 'main_hospital' },
        descriptionAr: 'استحقاقات خدمات غير مفوترة حتى نهاية الشهر',
        debit: 0.00,
        credit: 12000.00,
        transactionCurrency: 'SAR',
        exchangeRate: 1.0,
        baseDebit: 0.00,
        baseCredit: 12000.00
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 8. READ-ONLY UPSTREAM SOURCE ACCOUNTING EVENTS
// ----------------------------------------------------------------------------

export const MOCK_SOURCE_ACCOUNTING_EVENTS: SourceAccountingEvent[] = [
  {
    id: 'EVT-AP-INV-2026-0891-V1',
    sourceModule: 'accounts_payable',
    sourceDocumentId: 'INV-2026-0891',
    businessEventType: 'SUPPLIER_INVOICE_RECOGNITION',
    eventVersion: 1,
    accountingDate: '2026-09-18',
    originalAmount: 14547.50,
    currency: 'SAR',
    mappingStatus: 'READY_FOR_SIMULATION',
    targetDebitAccountCode: '5100',
    targetCreditAccountCode: '2010',
    requiredCostCenterCode: 'CC-ICU-701',
    intendedTreatmentNoteAr: 'إثبات فاتورة مورد مستلزمات طبية معتمدة بالمطابقة الثلاثية لصالح قسم العناية المركزة.',
    freshnessTimestamp: '2026-09-18T11:20:00Z'
  },
  {
    id: 'EVT-AP-INV-2026-0892-V1',
    sourceModule: 'accounts_payable',
    sourceDocumentId: 'INV-2026-0892',
    businessEventType: 'SUPPLIER_INVOICE_RECOGNITION',
    eventVersion: 1,
    accountingDate: '2026-09-19',
    originalAmount: 11241.25,
    currency: 'SAR',
    mappingStatus: 'READY_FOR_SIMULATION',
    targetDebitAccountCode: '5120',
    targetCreditAccountCode: '2010',
    requiredCostCenterCode: 'CC-PHARM-201',
    intendedTreatmentNoteAr: 'إثبات فاتورة أدوية ومحاليل صيدلانية متطابقة ومقبولة بالرصيف.',
    freshnessTimestamp: '2026-09-19T14:10:00Z'
  },
  {
    id: 'EVT-AP-PAY-2026-0041-V1',
    sourceModule: 'accounts_payable',
    sourceDocumentId: 'PAY-BATCH-2026-091',
    businessEventType: 'SUPPLIER_PAYMENT_DISBURSEMENT',
    eventVersion: 1,
    accountingDate: '2026-09-15',
    originalAmount: 50000.00,
    currency: 'SAR',
    mappingStatus: 'SYNTHETIC_POSTED',
    targetDebitAccountCode: '2010',
    targetCreditAccountCode: '1111',
    simulatedVoucherId: 'VCH-2026-00102',
    intendedTreatmentNoteAr: 'تسوية دفعة سداد للموردين عبر الحساب البنكي الجاري بعد موافقة إدارة الخزينة.',
    freshnessTimestamp: '2026-09-15T09:00:00Z'
  },
  {
    id: 'EVT-INV-RCV-2026-0099-V1',
    sourceModule: 'inventory_materials',
    sourceDocumentId: 'RCV-2026-0099',
    businessEventType: 'WAREHOUSE_DOCK_RECEIPT_REFERENCE',
    eventVersion: 1,
    accountingDate: '2026-09-20',
    originalAmount: 32000.00,
    currency: 'SAR',
    mappingStatus: 'UNMAPPED_ACCOUNT',
    intendedTreatmentNoteAr: 'استلام بضائع برصيف المستودع - يتطلب تهيئة محددة لحساب استحقاق بضائع غير مفوترة لمجموعة المواد.',
    freshnessTimestamp: '2026-09-20T16:00:00Z'
  }
];

// ----------------------------------------------------------------------------
// 9. POSTING PROFILE RULES
// ----------------------------------------------------------------------------

export const MOCK_POSTING_PROFILES: PostingProfileRule[] = [
  {
    id: 'PROF-AP-INVOICE',
    sourceModule: 'accounts_payable',
    businessEventType: 'SUPPLIER_INVOICE_RECOGNITION',
    descriptionAr: 'قالب إثبات فواتير الموردين (من حـ/ المصروف أو الوسيط إلى حـ/ ذمم الموردين)',
    targetDebitAccountCode: '5100',
    targetCreditAccountCode: '2010',
    mandatoryDimensions: ['branch', 'cost_center'],
    isActive: true
  },
  {
    id: 'PROF-AP-PAYMENT',
    sourceModule: 'accounts_payable',
    businessEventType: 'SUPPLIER_PAYMENT_DISBURSEMENT',
    descriptionAr: 'قالب سداد دفعات الموردين (من حـ/ ذمم الموردين إلى حـ/ البنك الرئيسي)',
    targetDebitAccountCode: '2010',
    targetCreditAccountCode: '1111',
    mandatoryDimensions: ['branch'],
    isActive: true
  }
];

// ----------------------------------------------------------------------------
// 10. GL RECONCILIATION RECORDS (HONEST DISCREPANCIES & BOUNDARIES)
// ----------------------------------------------------------------------------

export const MOCK_RECONCILIATION_RECORDS: GlReconciliationRecord[] = [
  {
    id: 'REC-AP-01',
    glAccountCode: '2010',
    glAccountNameAr: 'ذمم الموردين التجارية (AP Trade Control)',
    glBalanceSar: 678750.00,
    subledgerModule: 'accounts_payable',
    subledgerNameAr: 'سجل فواتير وأعمار ذمم الموردين (AP Subledger)',
    subledgerReferenceAmountSar: 678750.00,
    discrepancyAmountSar: 0.00,
    status: 'reconciled',
    investigationStatusAr: 'مطابق بالكامل - لا توجد فروقات بين أستاذ الحسابات الدائنة والقيود المحاسبية المرحلة.',
    notesAr: 'تمت المطابقة مع رصيد الفواتير غير المسددة النشطة حتى 20 سبتمبر 2026.',
    lastCheckedDate: '2026-09-20'
  },
  {
    id: 'REC-INV-02',
    glAccountCode: '1131',
    glAccountNameAr: 'وسيط مخزون المستلزمات الطبية والأدوية',
    glBalanceSar: 855000.00,
    subledgerModule: 'inventory_materials',
    subledgerNameAr: 'نظام إدارة المواد وحركات المستودعات الطبية',
    subledgerReferenceAmountSar: undefined,
    discrepancyAmountSar: undefined,
    status: 'missing_valuation',
    investigationStatusAr: 'استثناء معلق: عدم توفر محرك تقييم محاسبي للمخزون بالوحدات النقدية في النظام الفرعي.',
    notesAr: 'النظام الفرعي للمستودعات يتتبع الكميات الفيزيائية فقط، وتحديد القيمة النقدية يخضع للسياسة المعتمدة لاحقاً.',
    lastCheckedDate: '2026-09-21'
  },
  {
    id: 'REC-BANK-03',
    glAccountCode: '1111',
    glAccountNameAr: 'حساب البنك الجاري الرئيسي - بنك الرياض (محاكاة)',
    glBalanceSar: 2482000.00,
    subledgerModule: 'treasury',
    subledgerNameAr: 'كشف الحساب البنكي المسجل بالخزينة',
    subledgerReferenceAmountSar: 2477000.00,
    discrepancyAmountSar: 5000.00,
    status: 'discrepancy',
    investigationStatusAr: 'فارق قيد المراجعة: شيكات مسحوبة لم تصرف بعد من المستفيد (Outstanding Cheques).',
    notesAr: 'المبلغ المعلق قيد التسوية مع كشف التسوية البنكية للشهر الحالي.',
    lastCheckedDate: '2026-09-21'
  }
];

// ----------------------------------------------------------------------------
// 11. SYNTHETIC PERSONAS FOR TESTING SEPARATION OF DUTIES
// ----------------------------------------------------------------------------

export const MOCK_GL_PERSONAS = [
  {
    id: 'PERSONA-CLERK',
    nameAr: 'أمل الشريف',
    roleTitleAr: 'محاسب عام (GL Accountant)',
    permissionLevel: 'clerk' as const,
    descriptionAr: 'صلاحيات إدخال قيود اليومية، التعديل على المسودات، والتحقق الحسابي'
  },
  {
    id: 'PERSONA-SENIOR',
    nameAr: 'فهد المنصور',
    roleTitleAr: 'رئيس قسم الحسابات العامة (Senior Accountant)',
    permissionLevel: 'senior_accountant' as const,
    descriptionAr: 'صلاحيات اعتماد مسودات القيود، الترحيل المحاكى، والتسويات المالية'
  },
  {
    id: 'PERSONA-CONTROLLER',
    nameAr: 'د. خالد الزهراني',
    roleTitleAr: 'المدير المالي للمستشفى (Financial Controller)',
    permissionLevel: 'controller' as const,
    descriptionAr: 'صلاحيات إدارة الفترات المالية، الإقفال التجريبي، واعتماد الحسابات'
  },
  {
    id: 'PERSONA-AUDITOR',
    nameAr: 'نورة العتيبي',
    roleTitleAr: 'مراجع داخلي وضوابط مالية (Internal Auditor)',
    permissionLevel: 'auditor' as const,
    descriptionAr: 'صلاحيات الاستعراض الرقابي، فحص ميزان المراجعة، ومطابقة الضوابط'
  }
];

// ----------------------------------------------------------------------------
// 12. INITIAL COMBINED GENERAL LEDGER ROOT STATE
// ----------------------------------------------------------------------------

export function getInitialGeneralLedgerState(): GeneralLedgerState {
  return {
    ledgerProfile: { ...MOCK_LEDGER_PROFILE },
    accounts: [...MOCK_CHART_OF_ACCOUNTS],
    dimensions: {
      branches: [...MOCK_BRANCH_DIMENSIONS],
      departments: [...MOCK_DEPARTMENT_DIMENSIONS],
      costCenters: [...MOCK_COST_CENTER_DIMENSIONS],
      projects: [...MOCK_PROJECT_DIMENSIONS],
      combinationRules: [...MOCK_COMBINATION_RULES]
    },
    calendars: [
      { ...MOCK_STANDARD_CALENDAR },
      { ...MOCK_NON_CALENDAR_FISCAL_YEAR }
    ],
    activeCalendarId: 'CAL-2026-STANDARD',
    activePeriodId: 'FY2026-P09',
    journals: [...MOCK_JOURNAL_DRAFTS],
    postedVouchers: [...MOCK_POSTED_VOUCHERS],
    openingBalances: [...MOCK_OPENING_BALANCES],
    sourceEvents: [...MOCK_SOURCE_ACCOUNTING_EVENTS],
    postingProfiles: [...MOCK_POSTING_PROFILES],
    reconciliationRecords: [...MOCK_RECONCILIATION_RECORDS],
    activePersona: { ...MOCK_GL_PERSONAS[0] }
  };
}
