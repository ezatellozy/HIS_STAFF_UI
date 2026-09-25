// ============================================================================
// HEALTHCARE TREASURY & CASH/BANK OPERATIONS SYNTHETIC FIXTURES
// Consistent, deterministic initial state for hospital Treasury operations
// ============================================================================

import {
  TreasuryAccountReference,
  BankAccountChangeRequest,
  PaymentAuthorization,
  PaymentInstruction,
  CashCustodyRecord,
  DepositBatch,
  BankStatement,
  BankReconciliation,
  InterAccountTransfer,
  TreasuryException,
  TreasuryState
} from '../types/treasury';

// ----------------------------------------------------------------------------
// 1. HOSPITAL BANK & CASH ACCOUNT DIRECTORY
// ----------------------------------------------------------------------------

export const MOCK_TREASURY_ACCOUNTS: TreasuryAccountReference[] = [
  {
    id: 'TREAS-ACC-SNB-01',
    internalAccountCode: 'BANK-SNB-SAR-01',
    displayNameAr: 'حساب المدفوعات والعمليات التشغيلية - البنك الأهلي السعودي (محاكاة)',
    displayNameEn: 'Operating & AP Disbursements - SNB (Simulated)',
    institutionReference: 'البنك الأهلي السعودي (SNB - محاكاة)',
    accountType: 'operating_bank',
    currency: 'SAR',
    maskedAccountNumber: 'SA94****8812',
    purposeDescriptionAr: 'الحساب الرئيسي لمصروفات وسداد فواتير الموردين والعمليات التشغيلية اليومية',
    ownershipReference: 'منشأة المستشفى التخصصي للرعاية الصحية (LEGAL-ORG-001)',
    branchId: 'main_hospital',
    applicableGlAccountCode: '1111', // Maps to GL-1111 Operating Bank
    operationalStatus: 'active',
    effectiveDate: '2026-01-01',
    lastStatementDate: '2026-09-21',
    lastReconciliationDate: '2026-09-20',
    isSyntheticReference: true
  },
  {
    id: 'TREAS-ACC-RIYAD-02',
    internalAccountCode: 'BANK-RIYAD-SAR-02',
    displayNameAr: 'حساب الرواتب ومستحقات الكادر الطبي - بنك الرياض (محاكاة)',
    displayNameEn: 'Medical Payroll & Compensations - Riyad Bank (Simulated)',
    institutionReference: 'بنك الرياض (Riyad Bank - محاكاة)',
    accountType: 'disbursement_bank',
    currency: 'SAR',
    maskedAccountNumber: 'SA20****4419',
    purposeDescriptionAr: 'حساب مخصص لمسيرات الرواتب الشهرية والبدلات الطبية المعتمدة عبر نظام سريع',
    ownershipReference: 'منشأة المستشفى التخصصي للرعاية الصحية (LEGAL-ORG-001)',
    branchId: 'all',
    applicableGlAccountCode: '1111',
    operationalStatus: 'active',
    effectiveDate: '2026-01-01',
    lastStatementDate: '2026-09-20',
    lastReconciliationDate: '2026-09-20',
    isSyntheticReference: true
  },
  {
    id: 'TREAS-ACC-ALINMA-USD',
    internalAccountCode: 'BANK-ALINMA-USD-01',
    displayNameAr: 'حساب النقد الأجنبي للاستيراد الطبي - مصرف الإنماء (محاكاة)',
    displayNameEn: 'Foreign Currency Procurement Account - Alinma (Simulated)',
    institutionReference: 'مصرف الإنماء (Alinma Bank - محاكاة)',
    accountType: 'foreign_currency_bank',
    currency: 'USD',
    maskedAccountNumber: 'SA55****9012',
    purposeDescriptionAr: 'حساب بالنقد الأجنبي مخصص للاعتمادات المستندية واستيراد الأجهزة والكيماويات الدولية',
    ownershipReference: 'منشأة المستشفى التخصصي للرعاية الصحية (LEGAL-ORG-001)',
    branchId: 'main_hospital',
    applicableGlAccountCode: '1111',
    operationalStatus: 'active',
    effectiveDate: '2026-02-01',
    lastStatementDate: '2026-09-15',
    lastReconciliationDate: '2026-08-31',
    isSyntheticReference: true
  },
  {
    id: 'TREAS-ACC-PETTY-VAULT',
    internalAccountCode: 'CASH-VAULT-01',
    displayNameAr: 'خزينة العهدة النقدية المركزية بالمستشفى (محاكاة)',
    displayNameEn: 'Hospital Central Petty Cash Vault (Simulated)',
    institutionReference: 'خزينة الإدارة المالية المركزية - قسم النقد',
    accountType: 'petty_cash_vault',
    currency: 'SAR',
    maskedAccountNumber: 'CASH-VAULT-MAIN',
    purposeDescriptionAr: 'صندوق العهدة التشغيلية المعتمدة للمصروفات النثرية والطارئة ذات المبالغ المقيدة',
    ownershipReference: 'منشأة المستشفى التخصصي للرعاية الصحية (LEGAL-ORG-001)',
    branchId: 'main_hospital',
    applicableGlAccountCode: '1112', // Maps to GL-1112 Petty Cash
    operationalStatus: 'active',
    effectiveDate: '2026-01-01',
    lastStatementDate: '2026-09-21',
    lastReconciliationDate: '2026-09-21',
    isSyntheticReference: true
  },
  {
    id: 'TREAS-ACC-FLOAT-ER',
    internalAccountCode: 'CASH-FLOAT-ER-01',
    displayNameAr: 'صندوق عهدة كاونتر كاشير الطوارئ ER (محاكاة)',
    displayNameEn: 'ER Cashier Counter Float & Register (Simulated)',
    institutionReference: 'مكتب التحصيل والاستقبال - قسم الطوارئ والحوادث',
    accountType: 'cashier_float',
    currency: 'SAR',
    maskedAccountNumber: 'FLOAT-ER-001',
    purposeDescriptionAr: 'عهدة الصرف المباشر وتسيير الفكة لمقبوضات المرضى النقدية على مدار 24 ساعة',
    ownershipReference: 'منشأة المستشفى التخصصي للرعاية الصحية (LEGAL-ORG-001)',
    branchId: 'main_hospital',
    applicableGlAccountCode: '1112',
    operationalStatus: 'active',
    effectiveDate: '2026-01-01',
    lastStatementDate: '2026-09-22',
    lastReconciliationDate: '2026-09-21',
    isSyntheticReference: true
  }
];

// ----------------------------------------------------------------------------
// 2. BANK ACCOUNT CHANGE REQUESTS (GOVERNANCE WORKFLOW)
// ----------------------------------------------------------------------------

export const MOCK_BANK_ACCOUNT_CHANGES: BankAccountChangeRequest[] = [
  {
    id: 'BACR-2026-001',
    accountId: 'TREAS-ACC-SNB-01',
    requestedBy: 'طارق العمري (محاسب أول الخزينة)',
    requestedAt: '2026-09-21 09:30',
    changeType: 'credit_limit',
    currentValues: { dailyDisbursementLimitSar: 500000, authorizedSignersCount: 2 },
    proposedValues: { dailyDisbursementLimitSar: 1000000, authorizedSignersCount: 2 },
    justificationAr: 'رفع سقف التحويل اليومي المؤقت لتغطية دفعة سداد الأجهزة الطبية الحرجة لقسم العمليات الجراحية',
    status: 'pending_review',
    impactsPendingInstructionsCount: 1
  },
  {
    id: 'BACR-2026-002',
    accountId: 'TREAS-ACC-ALINMA-USD',
    requestedBy: 'سليمان القحطاني (مدير الخزينة)',
    requestedAt: '2026-09-18 11:15',
    changeType: 'signers_update',
    currentValues: { authorizedSignerA: 'د. خالد التميمي', authorizedSignerB: 'أ. فهد الدوسري' },
    proposedValues: { authorizedSignerA: 'د. خالد التميمي', authorizedSignerB: 'أ. سامي المنصور' },
    justificationAr: 'تحديث المفوضين بالتوقيع بعد إعادة الهيكلة الإدارية لقطاع الشؤون المالية',
    status: 'approved',
    reviewedBy: 'عبدالرحمن العتيبي (المدير المالي التنفيذي CFO)',
    reviewedAt: '2026-09-19 14:00',
    reviewNotesAr: 'تمت الموافقة بموجب قرار مجلس الإدارة رقم 88/2026',
    impactsPendingInstructionsCount: 0
  }
];

// ----------------------------------------------------------------------------
// 3. AP PROPOSALS & PAYMENT AUTHORIZATIONS (READ-ONLY CONSUMPTION)
// ----------------------------------------------------------------------------

export const MOCK_PAYMENT_AUTHORIZATIONS: PaymentAuthorization[] = [
  {
    id: 'PAY-AUTH-2026-001',
    proposalBatchId: 'PAY-BATCH-2026-001',
    proposalBatchNumber: 'BATCH-2026-W38-01',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية ذ.م.م',
    invoiceReferences: ['GULF-INV-2026-881'],
    currency: 'SAR',
    proposedAmount: 12650.0,
    creditsAndAdvancesReflectedSar: 0,
    dueDate: '2026-10-20',
    beneficiaryAccountName: 'الشركة الخليجية للرعاية والتجهيزات الطبية ذ.م.م',
    beneficiaryIbanMasked: 'SA94****8812',
    beneficiaryVerificationStatus: 'verified_active',
    glPostingEligibilityReference: 'eligible',
    treasuryOwnerStaffName: 'سليمان القحطاني (مدير الخزينة)',
    status: 'approved',
    authorizedAmount: 12650.0,
    makerStaffName: 'طارق العمري (كاتب الخزينة)',
    checkerStaffName: 'سليمان القحطاني (مشرف الخزينة)',
    authorizedAt: '2026-09-21 13:00',
    reviewNotesAr: 'تمت مراجعة الفاتورة والمطابقة الثلاثية، والتحقق من حساب الآيبان المعتمد، وجاهزة للصرف.'
  },
  {
    id: 'PAY-AUTH-2026-002',
    proposalBatchId: 'PAY-BATCH-2026-002',
    proposalBatchNumber: 'BATCH-2026-W38-02',
    supplierId: 'VEND-SA-9023',
    supplierNameAr: 'شركة الأمل للتجهيزات والخدمات الحيوية',
    invoiceReferences: ['AMAL-INV-2026-701'],
    currency: 'SAR',
    proposedAmount: 48300.0,
    creditsAndAdvancesReflectedSar: 0,
    dueDate: '2026-09-25',
    beneficiaryAccountName: 'شركة الأمل للتجهيزات والخدمات الحيوية',
    beneficiaryIbanMasked: 'SA55****1122',
    beneficiaryVerificationStatus: 'bank_change_pending_review',
    apHoldReference: 'تغيير غير مكتمل لبيانات الحساب البنكي للمستفيد (Bank Verification Pending)',
    glPostingEligibilityReference: 'eligible',
    treasuryOwnerStaffName: 'سليمان القحطاني (مدير الخزينة)',
    status: 'blocked_by_policy',
    authorizedAmount: 0,
    makerStaffName: 'طارق العمري (كاتب الخزينة)',
    reviewNotesAr: 'محظور الصرف مؤقتاً لوجود طلب تغيير آيبان قيد التحقق الثنائي من إدارة الحسابات الدائنة.'
  },
  {
    id: 'PAY-AUTH-2026-003',
    proposalBatchId: 'PAY-BATCH-2026-003',
    proposalBatchNumber: 'BATCH-2026-W38-03',
    supplierId: 'VEND-SA-9022',
    supplierNameAr: 'مؤسسة الرياض الدوائية لتجارة الأدوية والمستلزمات',
    invoiceReferences: ['RYD-INV-2026-552'],
    currency: 'SAR',
    proposedAmount: 28500.0,
    creditsAndAdvancesReflectedSar: 0,
    dueDate: '2026-09-28',
    beneficiaryAccountName: 'مؤسسة الرياض الدوائية',
    beneficiaryIbanMasked: 'SA12****3341',
    beneficiaryVerificationStatus: 'verified_active',
    glPostingEligibilityReference: 'eligible',
    treasuryOwnerStaffName: 'سليمان القحطاني (مدير الخزينة)',
    status: 'pending_review',
    authorizedAmount: 0,
    makerStaffName: 'طارق العمري (كاتب الخزينة)',
    reviewNotesAr: 'مقترح سداد جديد وارد من الحسابات الدائنة بانتظار مراجعة المدقق المالي للخزينة.'
  }
];

// ----------------------------------------------------------------------------
// 4. PAYMENT INSTRUCTIONS & SIMULATED BANK RESPONSES
// ----------------------------------------------------------------------------

export const MOCK_PAYMENT_INSTRUCTIONS: PaymentInstruction[] = [
  {
    id: 'PI-2026-SARIE-001',
    proposalBatchReference: 'BATCH-2026-W38-01',
    authorizationId: 'PAY-AUTH-2026-001',
    beneficiaryName: 'الشركة الخليجية للرعاية والتجهيزات الطبية ذ.م.م',
    beneficiaryIbanMasked: 'SA94****8812',
    sourceAccountId: 'TREAS-ACC-SNB-01',
    currency: 'SAR',
    amount: 12650.0,
    scheduledDate: '2026-09-21',
    executionRail: 'sarie_instant',
    makerStaffName: 'طارق العمري (كاتب الخزينة)',
    checkerStaffName: 'سليمان القحطاني (مشرف الخزينة)',
    version: 1,
    status: 'bank_confirmed',
    lines: [
      {
        id: 'PIL-001-1',
        authorizationId: 'PAY-AUTH-2026-001',
        invoiceReference: 'GULF-INV-2026-881',
        supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية ذ.م.م',
        beneficiaryIbanMasked: 'SA94****8812',
        amount: 12650.0,
        currency: 'SAR',
        status: 'settled'
      }
    ],
    submissionTimestamp: '2026-09-21 13:10',
    bankResponses: [
      {
        id: 'RESP-BANK-001-A',
        instructionId: 'PI-2026-SARIE-001',
        responseTimestamp: '2026-09-21 13:10:15',
        messageType: 'pain.002',
        isoStatusCode: 'ACTC',
        status: 'bank_accepted_for_processing',
        bankTransactionRef: 'SARIE-ACK-90412',
        confirmedAmount: 0,
        rejectedAmount: 0,
        returnedAmount: 0,
        feeDeductedAmount: 0,
        bankResponseCode: 'ACTC',
        bankMessageAr: 'تم استلام وتوجيه أمر السداد لغرفة المقاصة الآلية (سريع) بنجاح - قبول التحقق الفني (ACTC) - بانتظار إشعار التسوية النهائي.',
        isSyntheticFixture: true
      },
      {
        id: 'RESP-BANK-001-B',
        instructionId: 'PI-2026-SARIE-001',
        responseTimestamp: '2026-09-21 13:10:45',
        messageType: 'pain.002',
        isoStatusCode: 'ACSC',
        status: 'confirmed',
        bankTransactionRef: 'SARIE-SETTLE-88124',
        confirmedAmount: 12650.0,
        rejectedAmount: 0,
        returnedAmount: 0,
        feeDeductedAmount: 0,
        bankResponseCode: 'ACSC',
        bankMessageAr: 'تمت التسوية البنكية على حساب المدين (ACSC) وتأكيد خصم الحساب بنجاح لصالح المستفيد.',
        isSyntheticFixture: true
      }
    ],
    confirmedAmount: 12650.0,
    rejectedAmount: 0,
    allocationStatus: 'acknowledged_by_ap',
    apAcknowledgedAmount: 12650.0,
    reconciledBankAmount: 12650.0
  },
  {
    id: 'PI-2026-SARIE-002',
    proposalBatchReference: 'BATCH-2026-W37-99',
    authorizationId: 'PAY-AUTH-2026-OLD',
    beneficiaryName: 'مؤسسة التجهيزات التقنية (محاكاة)',
    beneficiaryIbanMasked: 'SA03****7712',
    sourceAccountId: 'TREAS-ACC-SNB-01',
    currency: 'SAR',
    amount: 5400.0,
    scheduledDate: '2026-09-19',
    executionRail: 'sarie_instant',
    makerStaffName: 'طارق العمري (كاتب الخزينة)',
    checkerStaffName: 'سليمان القحطاني (مشرف الخزينة)',
    version: 1,
    status: 'bank_rejected',
    lines: [
      {
        id: 'PIL-002-1',
        authorizationId: 'PAY-AUTH-2026-OLD',
        invoiceReference: 'TECH-INV-2026-104',
        supplierNameAr: 'مؤسسة التجهيزات التقنية',
        beneficiaryIbanMasked: 'SA03****7712',
        amount: 5400.0,
        currency: 'SAR',
        status: 'rejected'
      }
    ],
    submissionTimestamp: '2026-09-19 15:40',
    bankResponses: [
      {
        id: 'RESP-BANK-002',
        instructionId: 'PI-2026-SARIE-002',
        responseTimestamp: '2026-09-19 15:41',
        messageType: 'pain.002',
        isoStatusCode: 'RJCT',
        statusReasonCode: 'AC04',
        status: 'rejected',
        bankTransactionRef: 'SARIE-RJCT-00192',
        confirmedAmount: 0,
        rejectedAmount: 5400.0,
        returnedAmount: 0,
        feeDeductedAmount: 0,
        bankResponseCode: 'RJCT',
        bankMessageAr: 'تم رفض أمر التحويل (RJCT) - سبب الرفض: رقم الحساب مغلق لدى البنك المستفيد (AC04 - Closed Account Number).',
        isSyntheticFixture: true
      }
    ],
    confirmedAmount: 0,
    rejectedAmount: 5400.0,
    allocationStatus: 'awaiting_bank_confirmation',
    apAcknowledgedAmount: 0,
    reconciledBankAmount: 0
  }
];

// ----------------------------------------------------------------------------
// 5. CASH CUSTODY, CASHIER HANDOVERS & DEPOSIT BATCHES
// ----------------------------------------------------------------------------

export const MOCK_CASH_CUSTODY_RECORDS: CashCustodyRecord[] = [
  {
    id: 'CUST-2026-W38-01',
    custodianStaffName: 'أحمد الغامدي (كاشير الطوارئ ER)',
    locationContext: 'كاونتر تحصيل الطوارئ - الفترة الصباحية (ورديّة 1)',
    branchId: 'main_hospital',
    custodyType: 'patient_cashier_handover',
    handoverTimestamp: '2026-09-21 16:00',
    sourceReceiptCount: 14,
    expectedAmountSar: 4200.0,
    countedAmountSar: 4200.0,
    varianceSar: 0,
    stage: 'cash_deposited',
    acknowledgedByTreasuryStaffName: 'طارق العمري (أمين صندوق الخزينة)',
    acknowledgedAt: '2026-09-21 16:15',
    depositBatchId: 'DEP-BATCH-2026-001'
  },
  {
    id: 'CUST-2026-W38-02',
    custodianStaffName: 'منى الشهري (كاشير العيادات الخارجية OPD)',
    locationContext: 'كاونتر تحصيل العيادات الخارجية - البهو الرئيسي',
    branchId: 'main_hospital',
    custodyType: 'patient_cashier_handover',
    handoverTimestamp: '2026-09-21 17:30',
    sourceReceiptCount: 22,
    expectedAmountSar: 6850.0,
    countedAmountSar: 6850.0,
    varianceSar: 0,
    stage: 'cash_deposited',
    acknowledgedByTreasuryStaffName: 'طارق العمري (أمين صندوق الخزينة)',
    acknowledgedAt: '2026-09-21 17:45',
    depositBatchId: 'DEP-BATCH-2026-001'
  },
  {
    id: 'CUST-2026-W38-03',
    custodianStaffName: 'خالد السالم (كاشير الطوارئ ER - الفترة المسائية)',
    locationContext: 'كاونتر تحصيل الطوارئ - الفترة المسائية (ورديّة 2)',
    branchId: 'main_hospital',
    custodyType: 'patient_cashier_handover',
    handoverTimestamp: '2026-09-22 00:30',
    sourceReceiptCount: 9,
    expectedAmountSar: 2750.0,
    countedAmountSar: 2730.0,
    varianceSar: -20.0, // Shortage 20 SAR
    varianceReasonAr: 'عجز طفيف في عهدة الفكة المعدنية جارٍ تسويته وتوثيقه بموجب إقرار استقطاع من الكاشير',
    stage: 'cash_handed_over',
    acknowledgedByTreasuryStaffName: 'سليمان القحطاني (مشرف الخزينة)',
    acknowledgedAt: '2026-09-22 01:00'
  }
];

export const MOCK_DEPOSIT_BATCHES: DepositBatch[] = [
  {
    id: 'DEP-BATCH-2026-001',
    batchNumber: 'DEP-2026-0921-01',
    custodyRecordIds: ['CUST-2026-W38-01', 'CUST-2026-W38-02'],
    targetBankAccountId: 'TREAS-ACC-SNB-01',
    branchId: 'main_hospital',
    cashBagSealNumber: 'SEAL-SNB-882190',
    carrierReference: 'شركة تحصيل ونقل الأموال الأمنية (محاكاة)',
    expectedDepositAmountSar: 11050.0,
    bankAcknowledgedAmountSar: 11050.0,
    varianceSar: 0,
    submissionDate: '2026-09-21',
    bankDepositReceiptNumber: 'DEP-RCPT-SNB-9941',
    status: 'reconciled_with_statement',
    statementLineId: 'STMT-L-SNB-002'
  }
];

// ----------------------------------------------------------------------------
// 6. BANK STATEMENTS & VALIDATION DATA
// ----------------------------------------------------------------------------

export const MOCK_BANK_STATEMENTS: BankStatement[] = [
  {
    id: 'STMT-SNB-2026-M09',
    statementReferenceNumber: 'CAMT053-SNB-20260921',
    bankAccountId: 'TREAS-ACC-SNB-01',
    currency: 'SAR',
    periodStart: '2026-09-21',
    periodEnd: '2026-09-21',
    openingBalance: 1540000.0,
    closingBalance: 1538350.0,
    calculatedMovementTotal: -1650.0, // -12650 (payment) + 11050 (deposit) - 50 (fee) = -1650
    importTimestamp: '2026-09-21 23:59',
    importFormat: 'camt_053',
    validationStatus: 'continuity_verified',
    continuityWithPreviousStatement: 'verified',
    lines: [
      {
        id: 'STMT-L-SNB-001',
        statementId: 'STMT-SNB-2026-M09',
        bookingDate: '2026-09-21',
        valueDate: '2026-09-21',
        amount: 12650.0,
        direction: 'debit', // Outflow from bank perspective
        descriptionAr: 'حوالة سداد مورد عبر سريع - الشركة الخليجية للرعاية والتجهيزات',
        bankReference: 'TXN-SNB-88124',
        counterpartyReference: 'الشركة الخليجية SA94****8812',
        transactionType: 'wire_transfer',
        matchStatus: 'matched_single',
        matchedInternalDocId: 'PI-2026-SARIE-001'
      },
      {
        id: 'STMT-L-SNB-002',
        statementId: 'STMT-SNB-2026-M09',
        bookingDate: '2026-09-21',
        valueDate: '2026-09-21',
        amount: 11050.0,
        direction: 'credit', // Inflow
        descriptionAr: 'إيداع نقدي كاشير مستشفى - حقيبة تحصيل نقد رقم SEAL-SNB-882190',
        bankReference: 'DEP-SNB-9941',
        counterpartyReference: 'خزينة المستشفى التخصصي',
        transactionType: 'cash_deposit',
        matchStatus: 'matched_single',
        matchedInternalDocId: 'DEP-BATCH-2026-001'
      },
      {
        id: 'STMT-L-SNB-003',
        statementId: 'STMT-SNB-2026-M09',
        bookingDate: '2026-09-21',
        valueDate: '2026-09-21',
        amount: 50.0,
        direction: 'debit', // Outflow bank fee
        descriptionAr: 'رسوم خدمات مصرفية ومقاصة إلكترونية فورية سريعة لشهر سبتمبر 2026',
        bankReference: 'FEE-SNB-2026-90',
        counterpartyReference: 'البنك الأهلي السعودي',
        transactionType: 'bank_charge',
        matchStatus: 'unmatched'
      }
    ],
    validationErrorsAr: []
  },
  {
    id: 'STMT-RIYAD-2026-M09',
    statementReferenceNumber: 'MT940-RIYAD-20260920',
    bankAccountId: 'TREAS-ACC-RIYAD-02',
    currency: 'SAR',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-20',
    openingBalance: 820000.0,
    closingBalance: 820000.0,
    calculatedMovementTotal: 0,
    importTimestamp: '2026-09-20 18:00',
    importFormat: 'mt940',
    validationStatus: 'continuity_verified',
    continuityWithPreviousStatement: 'verified',
    lines: [],
    validationErrorsAr: []
  }
];

// ----------------------------------------------------------------------------
// 7. BANK RECONCILIATIONS
// ----------------------------------------------------------------------------

export const MOCK_BANK_RECONCILIATIONS: BankReconciliation[] = [
  {
    id: 'REC-SESS-SNB-2026-09',
    statementId: 'STMT-SNB-2026-M09',
    bankAccountId: 'TREAS-ACC-SNB-01',
    sessionDate: '2026-09-21',
    status: 'exceptions_pending',
    totalBankLinesCount: 3,
    matchedBankLinesCount: 2,
    unmatchedBankLinesCount: 1,
    totalStatementClosingBalance: 1538350.0,
    totalInternalBookBalance: 1538400.0,
    adjustedBankBalance: 1538350.0,
    adjustedBookBalance: 1538350.0,
    unresolvedVariance: 50.0, // 50 SAR bank fee discovered on statement, pending GL clearing
    matches: [
      {
        id: 'REC-MATCH-001',
        reconciliationSessionId: 'REC-SESS-SNB-2026-09',
        bankStatementLineIds: ['STMT-L-SNB-001'],
        internalTransactionReferences: ['PI-2026-SARIE-001'],
        matchNature: 'one_to_one',
        matchedAmount: 12650.0,
        differenceAmount: 0,
        confidenceScore: 100,
        confidenceExplanationAr: 'تطابق تام للمبلغ (12,650 ر.س)، التاريخ، ورقم الحوالة البنكية ومستند أمر الصرف الداخلي.',
        matchedByStaffName: 'طارق العمري (مراجع التسويات البنكية)',
        matchedAt: '2026-09-22 02:00'
      },
      {
        id: 'REC-MATCH-002',
        reconciliationSessionId: 'REC-SESS-SNB-2026-09',
        bankStatementLineIds: ['STMT-L-SNB-002'],
        internalTransactionReferences: ['DEP-BATCH-2026-001'],
        matchNature: 'one_to_one',
        matchedAmount: 11050.0,
        differenceAmount: 0,
        confidenceScore: 100,
        confidenceExplanationAr: 'تطابق تام لقيمة إيداع المقبوضات النقدية مع إشعار البنك ورقم قفل الحقيبة.',
        matchedByStaffName: 'طارق العمري (مراجع التسويات البنكية)',
        matchedAt: '2026-09-22 02:05'
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 8. INTER-ACCOUNT TRANSFERS
// ----------------------------------------------------------------------------

export const MOCK_INTER_ACCOUNT_TRANSFERS: InterAccountTransfer[] = [
  {
    id: 'TRF-2026-001',
    transferNumber: 'TRF-HOSP-2026-0920',
    sourceAccountId: 'TREAS-ACC-SNB-01',
    destinationAccountId: 'TREAS-ACC-RIYAD-02',
    currency: 'SAR',
    amount: 150000.0,
    requestedDate: '2026-09-20',
    authorizedByStaffName: 'سليمان القحطاني (مدير الخزينة)',
    instructionReference: 'SARIE-TRF-99014',
    externalStatusEvidence: 'تم تنفيذ التحويل البنكي بين الحسابات الداخلية للمستشفى بنجاح',
    status: 'completed',
    notesAr: 'تحويل سيولة داخلية لتغطية مدفوعات مسير رواتب الكادر التمريضي لشهر سبتمبر دون أي تغيير في صافي سيولة المنشأة.'
  }
];

// ----------------------------------------------------------------------------
// 9. TREASURY EXCEPTIONS & GL CONTROLS
// ----------------------------------------------------------------------------

export const MOCK_TREASURY_EXCEPTIONS: TreasuryException[] = [
  {
    id: 'EXC-TR-2026-001',
    exceptionType: 'bank_charge_discovered',
    relatedAccountId: 'TREAS-ACC-SNB-01',
    relatedEntityId: 'STMT-L-SNB-003',
    titleAr: 'رسوم بنكية غير مسجلة في الدفاتر (50.00 ر.س)',
    descriptionAr: 'اكتشاف قيد مدين بمبلغ 50 ريال كرسوم خدمات مصرفية سريعة في كشف حساب البنك الأهلي غير مقيد دفترياً.',
    amountSar: 50.0,
    detectedAt: '2026-09-22 02:00',
    status: 'action_proposed',
    proposedAccountingReference: {
      suggestedGlAccountCode: '5300', // Bank fees / general admin
      debitCredit: 'debit',
      notesAr: 'اقتراح إصدار قيد يومية عامة مدين لمصروفات البنك ودائن للبنك الجاري (GL-1111) لتسوية فارق المطابقة.'
    }
  },
  {
    id: 'EXC-TR-2026-002',
    exceptionType: 'cash_count_shortage',
    relatedAccountId: 'TREAS-ACC-FLOAT-ER',
    relatedEntityId: 'CUST-2026-W38-03',
    titleAr: 'عجز نقدي في تسليم عهدة كاشير الطوارئ (-20.00 ر.س)',
    descriptionAr: 'فرق عجز بمقدار 20 ريال بين إجمالي فواتير المرضى المسددة نقداً والمبلغ المستلم فعلياً من الكاشير.',
    amountSar: 20.0,
    detectedAt: '2026-09-22 01:00',
    status: 'open_investigation',
    resolutionNotesAr: 'قيد مراجعة وتوقيع إقرار استقطاع عجز العهدة مع المشرف الإداري.'
  }
];

// ----------------------------------------------------------------------------
// 10. INITIAL COMPREHENSIVE TREASURY STATE
// ----------------------------------------------------------------------------

export const INITIAL_TREASURY_STATE: TreasuryState = {
  accounts: MOCK_TREASURY_ACCOUNTS,
  accountChangeRequests: MOCK_BANK_ACCOUNT_CHANGES,
  authorizations: MOCK_PAYMENT_AUTHORIZATIONS,
  instructions: MOCK_PAYMENT_INSTRUCTIONS,
  custodyRecords: MOCK_CASH_CUSTODY_RECORDS,
  depositBatches: MOCK_DEPOSIT_BATCHES,
  statements: MOCK_BANK_STATEMENTS,
  reconciliations: MOCK_BANK_RECONCILIATIONS,
  transfers: MOCK_INTER_ACCOUNT_TRANSFERS,
  exceptions: MOCK_TREASURY_EXCEPTIONS,
  activePersona: 'treasury_supervisor',
  selectedBranchId: 'all',
  selectedAccountId: 'TREAS-ACC-SNB-01'
};

export function getInitialTreasuryState(): TreasuryState {
  return JSON.parse(JSON.stringify(INITIAL_TREASURY_STATE));
}
