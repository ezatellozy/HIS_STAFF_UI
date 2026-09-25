// ============================================================================
// HEALTHCARE FINANCE & ACCOUNTS PAYABLE (AP) SYNTHETIC FIXTURES
// ============================================================================

import { 
  SupplierInvoice, 
  SupplierCreditNote, 
  HospitalDebitNote,
  PrepaymentRecord, 
  PaymentProposalBatch, 
  SupplierFinancialOverlay,
  MatchingPolicy,
  AccountCodeReference,
  CostCenterReference,
  SyntheticFxRate,
  TaxCategoryProfile,
  SupplierStatementReconciliationRecord
} from '../types/accountsPayable';

// ----------------------------------------------------------------------------
// 1. MINIMUM FINANCE FOUNDATIONS
// ----------------------------------------------------------------------------

export const MOCK_AP_CHART_OF_ACCOUNTS: AccountCodeReference[] = [
  { accountCode: 'GL-2010-AP-TRADE', accountNameAr: 'ذمم الموردين التجارية (AP Trade)', accountNameEn: 'Accounts Payable Trade', accountType: 'liability', isMonitoredBudget: false },
  { accountCode: 'GL-2015-AP-ACCRUALS', accountNameAr: 'استحقاقات فواتير المشتريات غير المستلمة', accountNameEn: 'Accrued AP Liabilities (GRNI)', accountType: 'liability', isMonitoredBudget: false },
  { accountCode: 'GL-5100-MEDSUP', accountNameAr: 'مصروفات مستلزمات طبية وجراحية', accountNameEn: 'Medical & Surgical Supplies Expense', accountType: 'expense', isMonitoredBudget: true },
  { accountCode: 'GL-5120-PHARMA', accountNameAr: 'مصروفات أدوية ومحاليل وريدية', accountNameEn: 'Pharmaceuticals & IV Fluids Expense', accountType: 'expense', isMonitoredBudget: true },
  { accountCode: 'GL-5300-MAINT', accountNameAr: 'مصروفات صيانة أجهزة طبية ومعايرة', accountNameEn: 'Biomedical Maintenance & Calibration', accountType: 'expense', isMonitoredBudget: true },
  { accountCode: 'GL-1110-CASH-SNB', accountNameAr: 'حساب بنكي جاري - البنك الأهلي السعودي (محاكاة)', accountNameEn: 'Operating Bank Account - SNB (Simulated)', accountType: 'asset', isMonitoredBudget: false }
];

export const MOCK_AP_COST_CENTERS: CostCenterReference[] = [
  { costCenterCode: 'CC-ICU-701', costCenterNameAr: 'العناية المركزة للبالغين (ICU)', costCenterNameEn: 'Adult Intensive Care Unit', departmentId: 'icu' },
  { costCenterCode: 'CC-OR-801', costCenterNameAr: 'غرف العمليات الجراحية (OR)', costCenterNameEn: 'Operating Rooms Complex', departmentId: 'or' },
  { costCenterCode: 'CC-ER-101', costCenterNameAr: 'طوارئ وإصابات الحوادث (ER)', costCenterNameEn: 'Emergency Department', departmentId: 'er' },
  { costCenterCode: 'CC-BIOMED-301', costCenterNameAr: 'الهندسة الطبية الحيوية', costCenterNameEn: 'Biomedical Engineering', departmentId: 'biomed' },
  { costCenterCode: 'CC-PHARM-201', costCenterNameAr: 'الصيدلية المركزية ومستودع الأدوية', costCenterNameEn: 'Central Pharmacy & Drug Store', departmentId: 'pharmacy' }
];

export const MOCK_AP_FX_RATES: SyntheticFxRate[] = [
  { pair: 'USD/SAR', baseCurrency: 'USD', quoteCurrency: 'SAR', rate: 3.75, rateDate: '2026-09-20', source: 'SAMA Synthetic Daily Rate' },
  { pair: 'EUR/SAR', baseCurrency: 'EUR', quoteCurrency: 'SAR', rate: 4.05, rateDate: '2026-09-20', source: 'SAMA Synthetic Daily Rate' }
];

export const MOCK_AP_TAX_CATEGORIES: TaxCategoryProfile[] = [
  { taxCode: 'VAT-STD-15', nameAr: 'ضريبة القيمة المضافة بالنسبة الأساسية (15%)', nameEn: 'Standard Rated VAT (15%)', ratePercent: 15, recoveryStatusDefault: 'recoverable' },
  { taxCode: 'VAT-ZERO-0', nameAr: 'خاضع لنسبة الصفر للأدوية والمؤهلات المؤهلة', nameEn: 'Zero Rated VAT (0%)', ratePercent: 0, recoveryStatusDefault: 'recoverable' },
  { taxCode: 'VAT-EXEMPT', nameAr: 'معفى من ضريبة القيمة المضافة', nameEn: 'Exempt Supplies', ratePercent: 0, recoveryStatusDefault: 'non_recoverable' },
  { taxCode: 'VAT-PENDING-REVIEW', nameAr: 'معاملة ضريبية قيد المراجعة الفنية', nameEn: 'Tax Treatment Pending Review', ratePercent: 0, recoveryStatusDefault: 'pending_tax_review' }
];

// ----------------------------------------------------------------------------
// 2. SUPPLIER FINANCIAL OVERLAYS
// ----------------------------------------------------------------------------

export const INITIAL_SUPPLIER_FINANCIAL_OVERLAYS: SupplierFinancialOverlay[] = [
  {
    supplierId: 'VEND-SA-9021', // Matches Gulf Medical in Procurement
    paymentTermsCode: 'NET_30',
    paymentMethodPreference: 'bank_transfer_sarie',
    syntheticIbanMasked: 'SA94****8812',
    beneficiaryAccountName: 'الشركة الخليجية للرعاية والتجهيزات الطبية ذ.م.م',
    beneficiaryVerificationStatus: 'verified_active',
    apPaymentHoldActive: false,
    withholdingTaxApplicable: false
  },
  {
    supplierId: 'VEND-SA-9022', // Matches Riyadh Pharma in Procurement
    paymentTermsCode: 'NET_60',
    paymentMethodPreference: 'bank_transfer_sarie',
    syntheticIbanMasked: 'SA12****3341',
    beneficiaryAccountName: 'مؤسسة الرياض الدوائية لتجارة الأدوية',
    beneficiaryVerificationStatus: 'verified_active',
    apPaymentHoldActive: false,
    withholdingTaxApplicable: false
  },
  {
    supplierId: 'VEND-SA-9023', // Matches Al-Amal Bio in Procurement
    paymentTermsCode: 'NET_30',
    paymentMethodPreference: 'bank_transfer_sarie',
    syntheticIbanMasked: 'SA77****9900',
    beneficiaryAccountName: 'شركة الأمل للتجهيزات والخدمات الحيوية',
    beneficiaryVerificationStatus: 'bank_change_pending_review',
    pendingBankChangeDetails: {
      requestedIbanMasked: 'SA55****1122',
      requestedAt: '2026-09-18 14:20',
      requestedBy: 'طارق العمري (محاسب المورد)',
      changeReasonAr: 'تغيير الحساب التشغيلي الرئيسي لدى بنك البلاد بناء على خطاب تفويض رسمي بانتظار تصديق الخزينة.',
      verificationNotes: 'تم إيقاف الصرف تلقائياً حتى استكمال التحقق الثنائي من الحساب الجديد.'
    },
    apPaymentHoldActive: true,
    paymentHoldReason: 'تغيير غير مكتمل لبيانات الحساب البنكي للمستفيد (Bank Verification Pending)',
    withholdingTaxApplicable: false
  },
  {
    supplierId: 'VEND-NON-PO-01',
    paymentTermsCode: 'IMMEDIATE',
    paymentMethodPreference: 'bank_transfer_sarie',
    syntheticIbanMasked: 'SA33****4455',
    beneficiaryAccountName: 'مؤسسة إنجاز للصيانة ومعايرة الأجهزة الطبية',
    beneficiaryVerificationStatus: 'verified_active',
    apPaymentHoldActive: false,
    withholdingTaxApplicable: false
  }
];

// ----------------------------------------------------------------------------
// 3. DEFAULT MATCHING POLICIES
// ----------------------------------------------------------------------------

export const DEFAULT_MATCHING_POLICIES: Record<string, MatchingPolicy> = {
  standard_3way: {
    policyProfile: 'three_way_po_grn',
    priceTolerancePercent: 2.0,
    priceToleranceAmountCapSar: 100.0,
    quantityTolerancePercent: 0,
    requiresQaAcceptance: false,
    policySource: 'Hospital AP Policy Doc 2026 / Rule 3W-Standard'
  },
  high_risk_qa_3way: {
    policyProfile: 'three_way_po_grn_qa_accepted',
    priceTolerancePercent: 0.0,
    priceToleranceAmountCapSar: 0.0,
    quantityTolerancePercent: 0,
    requiresQaAcceptance: true,
    policySource: 'Hospital Clinical Quality & Finance Accord / Rule 3W-QA-Sterile'
  },
  service_acceptance: {
    policyProfile: 'service_acceptance_signoff',
    priceTolerancePercent: 0.0,
    priceToleranceAmountCapSar: 0.0,
    quantityTolerancePercent: 0,
    requiresQaAcceptance: false,
    policySource: 'Service Contracts & Biomedical Standards 2026'
  }
};

// ----------------------------------------------------------------------------
// 4. SEED SUPPLIER INVOICES (COVERING AP01 - AP30)
// ----------------------------------------------------------------------------

export const INITIAL_SUPPLIER_INVOICES: SupplierInvoice[] = [
  // 1. AP01 & AP10: Standard PO Invoiced against Partial GRN
  // PO: PO-2026-MED-101 (Ordered 200, GRN-2026-09-101 Received 100, Accepted 100)
  // Invoiced 100 at 110 SAR = 11,000 + 1,650 VAT = 12,650 SAR
  {
    id: 'INV-AP-2026-001',
    invoiceNumber: 'GULF-INV-2026-881',
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    supplierNameEn: 'Gulf Healthcare & Medical Supplies LLC',
    supplierTaxNumber: '300981245000003',
    documentType: 'standard_po_invoice',
    invoiceDate: '2026-09-20',
    receivedDate: '2026-09-21',
    accountingDate: '2026-09-21',
    paymentTermsCode: 'NET_30',
    dueDate: '2026-10-20',
    originalCurrency: 'SAR',
    functionalCurrency: 'SAR',
    primaryPoId: 'PO-PO-2026-MED-101',
    primaryPoNumber: 'PO-2026-MED-101',
    lines: [
      {
        id: 'INVL-001-1',
        invoiceId: 'INV-AP-2026-001',
        lineNumber: 1,
        itemCode: 'CAN-IV-20G',
        itemDescriptionAr: 'قسطرة وريدية محيطية مقاس 20G معقمة (IV Cannula 20G)',
        itemDescriptionEn: 'IV Peripheral Cannula 20G sterile',
        poId: 'PO-PO-2026-MED-101',
        poNumber: 'PO-2026-MED-101',
        poLineId: 'POL-101-1',
        grnId: 'RCV-2026-0041',
        grnReceiptReference: 'GRN-2026-09-101',
        invoicedQuantity: 100,
        invoicedUom: 'box',
        baseUomQuantity: 100,
        unitPrice: 110.0,
        lineDiscountAmount: 0,
        netLineAmount: 11000.0,
        taxCode: 'VAT-STD-15',
        taxRatePercent: 15,
        taxAmount: 1650.0,
        totalLineAmount: 12650.0,
        costCenterCode: 'CC-ICU-701',
        glAccountCode: 'GL-5100-MEDSUP',
        matchedPoOrderedQty: 200,
        matchedPoUnitPrice: 110.0,
        matchedGrnReceivedQty: 100,
        matchedGrnAcceptedQty: 100,
        matchedGrnQuarantinedQty: 0,
        matchedGrnRejectedQty: 0,
        alreadyConsumedReceiptQty: 0,
        availableMatchableReceiptQty: 100,
        priceVariancePercent: 0.0,
        lineMatchingResult: 'exact_match'
      }
    ],
    subtotalAmount: 11000.0,
    headerDiscountAmount: 0,
    freightAndChargesAmount: 0,
    taxAmount: 1650.0,
    grossTotalAmount: 12650.0,
    convertedGrossTotalSar: 12650.0,
    appliedCreditNotesSar: 0,
    appliedPrepaymentsSar: 0,
    settledPaymentsSar: 0,
    remainingPayableBalanceSar: 12650.0,
    documentStatus: 'validated',
    matchingStatus: 'matched_exact',
    approvalStatus: 'approved',
    postingStatus: 'simulated_posted',
    settlementStatus: 'eligible',
    appliedMatchingPolicy: DEFAULT_MATCHING_POLICIES.standard_3way,
    activeHolds: [],
    approvalRecord: {
      approvedByStaffId: 'STAFF-FIN-01',
      approvedByStaffName: 'عبدالرحمن الشهري (رئيس الحسابات الدائنة)',
      approvedAt: '2026-09-21 10:15',
      comments: 'مطابقة تامة ثلاثية الأطراف مع أمر الشراء وسند الاستلام GRN-2026-09-101.'
    },
    syntheticVoucherRecord: {
      voucherNumber: 'VCHR-2026-09-001',
      postedAt: '2026-09-21 10:30',
      debitAccountCode: 'GL-5100-MEDSUP',
      creditAccountCode: 'GL-2010-AP-TRADE',
      simulatedBy: 'AP Posting Subsystem (Simulated)'
    },
    notes: 'فاتورة توريد مطابقة جاهزة لإدراجها في مسودة مقترح الدفع الأسبوعي.',
    createdAt: '2026-09-21 09:00',
    updatedAt: '2026-09-21 10:30'
  },

  // 2. AP02 & AP13: Valid Non-PO Service Invoice with Confirmed Acceptance
  {
    id: 'INV-AP-2026-002',
    invoiceNumber: 'INJAZ-SRV-2026-402',
    branchId: 'main_hospital',
    supplierId: 'VEND-NON-PO-01',
    supplierNameAr: 'مؤسسة إنجاز للصيانة ومعايرة الأجهزة الطبية',
    supplierNameEn: 'Injaz Biomedical Maintenance Services',
    supplierTaxNumber: '310245678900003',
    documentType: 'non_po_service_invoice',
    invoiceDate: '2026-09-19',
    receivedDate: '2026-09-20',
    accountingDate: '2026-09-21',
    paymentTermsCode: 'IMMEDIATE',
    dueDate: '2026-09-25',
    originalCurrency: 'SAR',
    functionalCurrency: 'SAR',
    serviceAcceptanceRef: {
      servicePeriodStart: '2026-09-01',
      servicePeriodEnd: '2026-09-15',
      acceptingDepartmentId: 'biomed',
      acceptingStaffName: 'م. حسام التميمي (مدير الهندسة الطبية)',
      servicePerformanceConfirmed: true,
      confirmationNotesAr: 'تم إنجاز أعمال المعايرة الدورية الوقائية لأجهزة الصدمات الكهربائية وأجهزة مراقبة المرضى في غرف العمليات بنجاح وتسليم شهادات المعايرة.'
    },
    lines: [
      {
        id: 'INVL-002-1',
        invoiceId: 'INV-AP-2026-002',
        lineNumber: 1,
        itemCode: 'SRV-BIOMED-CALIB',
        itemDescriptionAr: 'خدمة معايرة دورية معتمدة لأجهزة مراقبة المرضى والصدمات',
        itemDescriptionEn: 'Preventive Calibration Service for Patient Monitors',
        invoicedQuantity: 1,
        invoicedUom: 'service',
        baseUomQuantity: 1,
        unitPrice: 8500.0,
        lineDiscountAmount: 0,
        netLineAmount: 8500.0,
        taxCode: 'VAT-STD-15',
        taxRatePercent: 15,
        taxAmount: 1275.0,
        totalLineAmount: 9775.0,
        costCenterCode: 'CC-BIOMED-301',
        glAccountCode: 'GL-5300-MAINT',
        lineMatchingResult: 'exact_match'
      }
    ],
    subtotalAmount: 8500.0,
    headerDiscountAmount: 0,
    freightAndChargesAmount: 0,
    taxAmount: 1275.0,
    grossTotalAmount: 9775.0,
    convertedGrossTotalSar: 9775.0,
    appliedCreditNotesSar: 0,
    appliedPrepaymentsSar: 0,
    settledPaymentsSar: 0,
    remainingPayableBalanceSar: 9775.0,
    documentStatus: 'validated',
    matchingStatus: 'matched_exact',
    approvalStatus: 'approved',
    postingStatus: 'simulated_posted',
    settlementStatus: 'eligible',
    appliedMatchingPolicy: DEFAULT_MATCHING_POLICIES.service_acceptance,
    activeHolds: [],
    approvalRecord: {
      approvedByStaffId: 'STAFF-FIN-01',
      approvedByStaffName: 'عبدالرحمن الشهري (رئيس الحسابات الدائنة)',
      approvedAt: '2026-09-21 11:00',
      comments: 'فاتورة خدمات طبية حيوية معتمدة استناداً إلى محضر إنجاز الخدمة الفني.'
    },
    syntheticVoucherRecord: {
      voucherNumber: 'VCHR-2026-09-002',
      postedAt: '2026-09-21 11:15',
      debitAccountCode: 'GL-5300-MAINT',
      creditAccountCode: 'GL-2010-AP-TRADE',
      simulatedBy: 'AP Posting Subsystem (Simulated)'
    },
    notes: 'فاتورة خدمات بدون أمر شراء مستندي مع توفر محضر قبول فني معتمد.',
    createdAt: '2026-09-20 14:00',
    updatedAt: '2026-09-21 11:15'
  },

  // 3. AP11 & AP12: Invoice with Price and Quantity Variance (Holds Placed)
  {
    id: 'INV-AP-2026-003',
    invoiceNumber: 'GULF-INV-2026-904',
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    supplierNameEn: 'Gulf Healthcare & Medical Supplies LLC',
    supplierTaxNumber: '300981245000003',
    documentType: 'standard_po_invoice',
    invoiceDate: '2026-09-21',
    receivedDate: '2026-09-21',
    accountingDate: '2026-09-21',
    paymentTermsCode: 'NET_30',
    dueDate: '2026-10-21',
    originalCurrency: 'SAR',
    functionalCurrency: 'SAR',
    primaryPoId: 'PO-PO-2026-MED-101',
    primaryPoNumber: 'PO-2026-MED-101',
    lines: [
      {
        id: 'INVL-003-1',
        invoiceId: 'INV-AP-2026-003',
        lineNumber: 1,
        itemCode: 'CAN-IV-20G',
        itemDescriptionAr: 'قسطرة وريدية محيطية مقاس 20G معقمة',
        itemDescriptionEn: 'IV Peripheral Cannula 20G sterile',
        poId: 'PO-PO-2026-MED-101',
        poNumber: 'PO-2026-MED-101',
        poLineId: 'POL-101-1',
        invoicedQuantity: 120, // Overbilled: GRN only received 100
        invoicedUom: 'box',
        baseUomQuantity: 120,
        unitPrice: 125.0, // Variance: PO was 110.0 (+13.6% exceeds 2% tolerance)
        lineDiscountAmount: 0,
        netLineAmount: 15000.0,
        taxCode: 'VAT-STD-15',
        taxRatePercent: 15,
        taxAmount: 2250.0,
        totalLineAmount: 17250.0,
        costCenterCode: 'CC-ICU-701',
        glAccountCode: 'GL-5100-MEDSUP',
        matchedPoOrderedQty: 200,
        matchedPoUnitPrice: 110.0,
        matchedGrnReceivedQty: 100,
        matchedGrnAcceptedQty: 100,
        priceVariancePercent: 13.64,
        lineMatchingResult: 'price_variance',
        lineDiscrepancyNotes: 'سعر الوحدة المفوتر (125 ريال) يتجاوز سعر أمر الشراء المعتمد (110 ريال) بنسبة 13.64% متجاوزاً هامش التسامح 2%.'
      }
    ],
    subtotalAmount: 15000.0,
    headerDiscountAmount: 0,
    freightAndChargesAmount: 0,
    taxAmount: 2250.0,
    grossTotalAmount: 17250.0,
    convertedGrossTotalSar: 17250.0,
    appliedCreditNotesSar: 0,
    appliedPrepaymentsSar: 0,
    settledPaymentsSar: 0,
    remainingPayableBalanceSar: 17250.0,
    documentStatus: 'validated',
    matchingStatus: 'price_variance_hold',
    approvalStatus: 'not_submitted',
    postingStatus: 'unposted',
    settlementStatus: 'on_hold',
    appliedMatchingPolicy: DEFAULT_MATCHING_POLICIES.standard_3way,
    activeHolds: [
      {
        id: 'HOLD-003-1',
        holdType: 'price_variance',
        reasonAr: 'فروقات سعرية تتجاوز نسبة التسامح المسموح بها (13.64% مقابل 2.0% سقف التسامح).',
        reasonEn: 'Price variance exceeds configured 2% policy threshold.',
        placedAt: '2026-09-21 11:30',
        placedBy: 'AP Matching Engine',
        isResolved: false
      },
      {
        id: 'HOLD-003-2',
        holdType: 'quantity_overbilling',
        reasonAr: 'الكمية المفوترة (120 علبة) تتجاوز الرصيد المستلم والمتاح للمطابقة بسند الاستلام (100 علبة).',
        reasonEn: 'Invoiced quantity 120 exceeds available receipt quantity 100.',
        placedAt: '2026-09-21 11:30',
        placedBy: 'AP Matching Engine',
        isResolved: false
      }
    ],
    notes: 'فاتورة محجوزة لوجود فروقات سعرية وكمية؛ تتطلب مراجعة أو إشعار دائن من المورد.',
    createdAt: '2026-09-21 11:25',
    updatedAt: '2026-09-21 11:30'
  },

  // 4. AP20: Foreign Currency Invoice with Missing FX Rate
  {
    id: 'INV-AP-2026-004',
    invoiceNumber: 'EURO-MED-7719',
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية (شريك استيراد دولي)',
    supplierNameEn: 'Gulf Healthcare / International Import Partner',
    supplierTaxNumber: '300981245000003',
    documentType: 'standard_po_invoice',
    invoiceDate: '2026-09-18',
    receivedDate: '2026-09-21',
    accountingDate: '2026-09-21',
    paymentTermsCode: 'NET_60',
    dueDate: '2026-11-18',
    originalCurrency: 'EUR',
    functionalCurrency: 'SAR',
    fxExchangeRate: undefined, // Missing FX!
    primaryPoId: 'PO-PO-2026-MED-101',
    primaryPoNumber: 'PO-2026-MED-101',
    lines: [
      {
        id: 'INVL-004-1',
        invoiceId: 'INV-AP-2026-004',
        lineNumber: 1,
        itemCode: 'IMP-STENT-SPEC',
        itemDescriptionAr: 'دعامات وعائية أوروبية تخصصية',
        itemDescriptionEn: 'Specialized Vascular Stent Units',
        invoicedQuantity: 10,
        invoicedUom: 'unit',
        baseUomQuantity: 10,
        unitPrice: 500.0, // In EUR
        lineDiscountAmount: 0,
        netLineAmount: 5000.0,
        taxCode: 'VAT-ZERO-0',
        taxRatePercent: 0,
        taxAmount: 0,
        totalLineAmount: 5000.0,
        costCenterCode: 'CC-OR-801',
        glAccountCode: 'GL-5100-MEDSUP',
        lineMatchingResult: 'exact_match'
      }
    ],
    subtotalAmount: 5000.0,
    headerDiscountAmount: 0,
    freightAndChargesAmount: 0,
    taxAmount: 0,
    grossTotalAmount: 5000.0,
    convertedGrossTotalSar: 0, // Unvalued
    appliedCreditNotesSar: 0,
    appliedPrepaymentsSar: 0,
    settledPaymentsSar: 0,
    remainingPayableBalanceSar: 0,
    documentStatus: 'validated',
    matchingStatus: 'matched_exact',
    approvalStatus: 'not_submitted',
    postingStatus: 'unposted',
    settlementStatus: 'on_hold',
    appliedMatchingPolicy: DEFAULT_MATCHING_POLICIES.standard_3way,
    activeHolds: [
      {
        id: 'HOLD-004-1',
        holdType: 'missing_fx_rate',
        reasonAr: 'سعر صرف اليورو (EUR/SAR) مفقود؛ يتعذر تقييم الالتزام بالعملة الوظيفية (ريال سعودي) وترحيله.',
        reasonEn: 'Foreign currency FX rate for EUR is missing; functional currency valuation unavailable.',
        placedAt: '2026-09-21 11:45',
        placedBy: 'AP Currency Guard',
        isResolved: false
      }
    ],
    notes: 'فاتورة باليورو بانتظار إدخال أو تأكيد سعر صرف ساما الرسمي لتقييم الالتزام بالريال.',
    createdAt: '2026-09-21 11:40',
    updatedAt: '2026-09-21 11:45'
  },

  // 5. AP14: Physical Goods Received but 20 units Rejected by QA
  {
    id: 'INV-AP-2026-005',
    invoiceNumber: 'GULF-INV-2026-990',
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    supplierNameEn: 'Gulf Healthcare & Medical Supplies LLC',
    supplierTaxNumber: '300981245000003',
    documentType: 'standard_po_invoice',
    invoiceDate: '2026-09-21',
    receivedDate: '2026-09-21',
    accountingDate: '2026-09-21',
    paymentTermsCode: 'NET_30',
    dueDate: '2026-10-21',
    originalCurrency: 'SAR',
    functionalCurrency: 'SAR',
    primaryPoId: 'PO-PO-2026-MED-101',
    primaryPoNumber: 'PO-2026-MED-101',
    lines: [
      {
        id: 'INVL-005-1',
        invoiceId: 'INV-AP-2026-005',
        lineNumber: 1,
        itemCode: 'CAN-IV-20G',
        itemDescriptionAr: 'قسطرة وريدية محيطية مقاس 20G معقمة',
        itemDescriptionEn: 'IV Peripheral Cannula 20G sterile',
        poId: 'PO-PO-2026-MED-101',
        poNumber: 'PO-2026-MED-101',
        poLineId: 'POL-101-1',
        invoicedQuantity: 100, // Invoicing all 100 received
        invoicedUom: 'box',
        baseUomQuantity: 100,
        unitPrice: 110.0,
        lineDiscountAmount: 0,
        netLineAmount: 11000.0,
        taxCode: 'VAT-STD-15',
        taxRatePercent: 15,
        taxAmount: 1650.0,
        totalLineAmount: 12650.0,
        costCenterCode: 'CC-ICU-701',
        glAccountCode: 'GL-5100-MEDSUP',
        matchedPoOrderedQty: 200,
        matchedPoUnitPrice: 110.0,
        matchedGrnReceivedQty: 100,
        matchedGrnAcceptedQty: 80, // ONLY 80 ACCEPTED!
        matchedGrnRejectedQty: 20, // 20 REJECTED BY QA
        priceVariancePercent: 0,
        lineMatchingResult: 'qty_variance',
        lineDiscrepancyNotes: 'تم فحص الشحنة في المستودع: المقبول طبياً 80 علبة فقط، و20 علبة مرفوضة ومعزولة بالحجر بموجب سند الحجر QUAR-LOT-GULF-2026-A؛ لا يجوز اعتماد سداد الأصناف المرفوضة.'
      }
    ],
    subtotalAmount: 11000.0,
    headerDiscountAmount: 0,
    freightAndChargesAmount: 0,
    taxAmount: 1650.0,
    grossTotalAmount: 12650.0,
    convertedGrossTotalSar: 12650.0,
    appliedCreditNotesSar: 0,
    appliedPrepaymentsSar: 0,
    settledPaymentsSar: 0,
    remainingPayableBalanceSar: 12650.0,
    documentStatus: 'validated',
    matchingStatus: 'exception_hold',
    approvalStatus: 'not_submitted',
    postingStatus: 'unposted',
    settlementStatus: 'on_hold',
    appliedMatchingPolicy: DEFAULT_MATCHING_POLICIES.high_risk_qa_3way,
    activeHolds: [
      {
        id: 'HOLD-005-1',
        holdType: 'qa_inspection_pending',
        reasonAr: 'تم رفض 20 علبة بواسطة رقابة الجودة (QA Rejected)؛ تتطلب الفاتورة تخفيضاً أو إصدار إشعار دائن بقيمة 2,530 ريال قبل إتاحة السداد.',
        reasonEn: '20 units rejected by QA inspection; requires credit note or reduction before approval.',
        placedAt: '2026-09-21 11:55',
        placedBy: 'QA Inspection Policy Gate',
        isResolved: false
      }
    ],
    notes: 'فاتورة معلقة لاحتوائها على أصناف مرفوضة من الفحص الفني بانتظار إشعار دائن من المورد.',
    createdAt: '2026-09-21 11:50',
    updatedAt: '2026-09-21 11:55'
  }
];

// ----------------------------------------------------------------------------
// 5. SUPPLIER CREDIT NOTES & DEBIT NOTES
// ----------------------------------------------------------------------------

export const INITIAL_SUPPLIER_CREDIT_NOTES: SupplierCreditNote[] = [
  {
    id: 'CRN-AP-2026-001',
    creditNoteNumber: 'CN-GULF-2026-091',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    supplierTaxNumber: '300981245000003',
    originalInvoiceId: 'INV-AP-2026-005',
    originalInvoiceNumber: 'GULF-INV-2026-990',
    sourceProcurementClaimId: 'CLM-2026-001',
    sourcePoNumber: 'PO-2026-MED-101',
    creditDate: '2026-09-21',
    currency: 'SAR',
    totalCreditAmountSar: 2530.0, // 20 units * 110 + 15% VAT = 2,530 SAR
    appliedAmountSar: 0,
    remainingUnappliedAmountSar: 2530.0,
    reasonAr: 'إشعار دائن صادر عن المورد لتسوية قيمة 20 علبة قساطر تالفة ومعزولة بالحجر الصحي بالمستودع بموجب مطالبة المشتريات CLM-2026-001.',
    reasonEn: 'Credit note issued by supplier settling 20 damaged cannula boxes quarantined per claim CLM-2026-001.',
    status: 'approved_available',
    appliedToInvoices: [],
    createdAt: '2026-09-21 12:00'
  }
];

export const INITIAL_HOSPITAL_DEBIT_NOTES: HospitalDebitNote[] = [
  {
    id: 'DBN-HOSP-2026-001',
    debitNoteNumber: 'DBN-2026-004',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    targetInvoiceId: 'INV-AP-2026-003',
    debitAmountSar: 2587.5,
    reasonAr: 'إشعار مدين صادر عن إدارة الحسابات الدائنة بالمستشفى لتعديل فارق التسعير غير المتفق عليه في الفاتورة رقم GULF-INV-2026-904.',
    status: 'under_review',
    createdAt: '2026-09-21 12:15'
  }
];

// ----------------------------------------------------------------------------
// 6. PREPAYMENTS & MOBILIZATION ADVANCES
// ----------------------------------------------------------------------------

export const INITIAL_PREPAYMENTS: PrepaymentRecord[] = [
  {
    id: 'PRE-2026-001',
    prepaymentReference: 'ADV-MOBILIZE-2026-101',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    poId: 'PO-PO-2026-MED-101',
    poNumber: 'PO-2026-MED-101',
    authorizedAdvanceAmountSar: 5000.0,
    confirmedDisbursedAmountSar: 5000.0, // Confirmed paid by synthetic treasury
    unappliedBalanceSar: 5000.0,
    status: 'disbursed_available',
    applicationHistory: [],
    notes: 'دفعة مقدمة تشغيلية لتأمين إمدادات جراحية حرجة تم صرفها بموجب شروط العقد، متاحة للخصم من مستحقات التوريد.'
  }
];

// ----------------------------------------------------------------------------
// 7. PAYMENT PROPOSALS & BATCHES
// ----------------------------------------------------------------------------

export const INITIAL_PAYMENT_BATCHES: PaymentProposalBatch[] = [
  {
    id: 'PAY-BATCH-2026-001',
    batchNumber: 'BATCH-2026-W38-01',
    branchId: 'main_hospital',
    batchDescriptionAr: 'دفعة سداد الموردين الأسبوعية - التجهيزات الطبية والخدمات الحيوية العاجلة',
    creationDate: '2026-09-21',
    scheduledDisbursementDate: '2026-09-23',
    disbursingBankAccountId: 'BANK-SNB-SAR-01',
    disbursingBankAccountNameAr: 'حساب المدفوعات التشغيلي - البنك الأهلي السعودي (محاكاة)',
    currency: 'SAR',
    totalProposedAmountSar: 12650.0,
    invoicesCount: 1,
    suppliersCount: 1,
    status: 'approved_for_payment',
    items: [
      {
        invoiceId: 'INV-AP-2026-001',
        invoiceNumber: 'GULF-INV-2026-881',
        supplierId: 'VEND-SA-9021',
        supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
        invoiceGrossAmountSar: 12650.0,
        previouslyPaidAmountSar: 0,
        currentPayableBalanceSar: 12650.0,
        proposedPaymentAmountSar: 12650.0,
        beneficiaryIbanMasked: 'SA94****8812',
        isBeneficiaryVerified: true,
        dueDate: '2026-10-20',
        daysOverdue: 0
      }
    ],
    treasuryApprovalRecord: {
      approvedByStaffName: 'سليمان القحطاني (مدير الخزينة)',
      approvedAt: '2026-09-21 13:00',
      approvalNotesAr: 'تم التحقق من تطابق المستفيد مع السجل المعتمد وتوفر الرصيد التقديري في الحساب التشغيلي.'
    },
    syntheticBankTransmission: {
      instructionReference: 'SARIE-INST-2026-90412',
      submittedAt: '2026-09-21 13:10',
      mockBankStatus: 'pending',
      disclaimer: 'Synthetic bank response fixture - no actual money movement'
    }
  }
];

// ----------------------------------------------------------------------------
// 8. SUPPLIER STATEMENT RECONCILIATION SEED
// ----------------------------------------------------------------------------

export const INITIAL_SUPPLIER_STATEMENTS: SupplierStatementReconciliationRecord[] = [
  {
    id: 'STMT-REC-2026-001',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    statementDate: '2026-09-21',
    statementPeriod: 'سبتمبر 2026',
    statementEndingBalanceSar: 27370.0,
    hospitalApLedgerBalanceSar: 27370.0,
    reconciledBalanceSar: 27370.0,
    unreconciledVarianceSar: 0,
    status: 'fully_balanced',
    lines: [
      {
        id: 'STMT-L-01',
        transactionDate: '2026-09-20',
        transactionType: 'invoice',
        referenceNumber: 'GULF-INV-2026-881',
        debitAmountSar: 12650.0,
        creditAmountSar: 0,
        closingBalanceSar: 12650.0,
        reconciliationStatus: 'reconciled',
        matchedInternalDocId: 'INV-AP-2026-001',
        investigationNotesAr: 'مطابقة تامة مع الفاتورة المسجلة والمعتمدة بالسجلات.'
      },
      {
        id: 'STMT-L-02',
        transactionDate: '2026-09-21',
        transactionType: 'invoice',
        referenceNumber: 'GULF-INV-2026-904',
        debitAmountSar: 17250.0,
        creditAmountSar: 0,
        closingBalanceSar: 29900.0,
        reconciliationStatus: 'disputed_amount',
        matchedInternalDocId: 'INV-AP-2026-003',
        investigationNotesAr: 'محل نزاع ومحجوزة لوجود فارق تسعير وكمية زائدة عن الاستلام الفعلي.'
      },
      {
        id: 'STMT-L-03',
        transactionDate: '2026-09-21',
        transactionType: 'credit_note',
        referenceNumber: 'CN-GULF-2026-091',
        debitAmountSar: 0,
        creditAmountSar: 2530.0,
        closingBalanceSar: 27370.0,
        reconciliationStatus: 'reconciled',
        matchedInternalDocId: 'CRN-AP-2026-001',
        investigationNotesAr: 'مطابقة مع إشعار الدائن المستلم للدفعة التالفة.'
      }
    ]
  }
];
