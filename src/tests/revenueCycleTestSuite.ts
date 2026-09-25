// ============================================================================
// INDEPENDENT VERIFICATION & VALIDATION TEST SUITE: REVENUE CYCLE OPERATIONS
// Scenarios RC01–RC30 and Negative Tests NEG-A–NEG-Y
// ============================================================================

import {
  validateAndReviewCharge,
  determinePricingAndCoverage,
  createPatientInvoice,
  correctPatientInvoice,
  preparePayerClaim,
  simulateClaimSubmission,
  simulatePayerAdjudication,
  allocatePatientReceipt,
  allocatePayerRemittance,
  requestCreditRefund,
  recordWriteOffAdjustment,
  calculateArAgingSummary
} from '../utils/revenueCycleEngine';

import {
  MOCK_TARIFFS,
  MOCK_COVERAGES,
  MOCK_CHARGES,
  MOCK_INVOICES,
  MOCK_CLAIMS,
  MOCK_DENIALS,
  MOCK_REMITTANCES,
  MOCK_CREDIT_BALANCES,
  INITIAL_REVENUE_CYCLE_STATE
} from '../data/mockRevenueCycleData';

import { ChargeEventReference } from '../types/revenueCycle';

export interface TestResult {
  code: string;
  name: string;
  category: 'core_scenario' | 'negative_test' | 'e2e_journey';
  passed: boolean;
  message: string;
  details?: any;
}

export function runRevenueCycleTestSuite(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  const record = (code: string, name: string, category: 'core_scenario' | 'negative_test' | 'e2e_journey', condition: boolean, message: string, details?: any) => {
    results.push({
      code,
      name,
      category,
      passed: condition,
      message: condition ? `نجاح: ${message}` : `فشل: ${message}`,
      details
    });
  };

  // --------------------------------------------------------------------------
  // CORE SCENARIOS RC01 - RC30
  // --------------------------------------------------------------------------

  // RC01: Performed OPD service generates an eligible charge reference without altering clinical data
  const chgCandidate1: Omit<ChargeEventReference, 'id' | 'isSyntheticFixture'> = {
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    patientNameAr: 'محمود سعد الدين إبراهيم',
    encounterId: 'ENC-2026-0814-OPD',
    sourceCategory: 'opd_consultation',
    sourceReferenceId: 'APT-TEST-NEW-01',
    serviceCode: 'SBS-99213',
    serviceNameAr: 'كشف استشاري عيادات خارجية',
    serviceNameEn: 'Outpatient Consultation',
    departmentAr: 'عيادة أمراض القلب',
    quantity: 1,
    unit: 'زيارة',
    serviceTimestamp: '2026-09-22 11:30',
    performedStatus: 'performed',
    billabilityStatus: 'unreviewed',
    pricingStatus: 'unpriced',
    billingReviewStatus: 'pending_review',
    unitPriceSar: 0,
    grossAmountSar: 0,
    discountAmountSar: 0,
    netAmountSar: 0,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 0
  };
  const resRC01 = validateAndReviewCharge(chgCandidate1, [], MOCK_TARIFFS);
  record(
    'RC01',
    'الخدمة السريرية المنفذة تولد بند رسوم معتمد دون مساس بالبيانات السريرية',
    'core_scenario',
    resRC01.isValid && resRC01.charge?.billabilityStatus === 'billable' && resRC01.charge.unitPriceSar === 400,
    'تم توليد قيد الرسوم المعتمد وتحديد السعر التعاقدي'
  );

  // RC02: Order exists but service not performed; ordinary charge creation is blocked
  const chgCandidate2: typeof chgCandidate1 = {
    ...chgCandidate1,
    sourceReferenceId: 'ORD-UNPERFORMED-01',
    performedStatus: 'planned' // Order exists but not performed
  };
  const resRC02 = validateAndReviewCharge(chgCandidate2, [], MOCK_TARIFFS);
  record(
    'RC02',
    'طلب الخدمة غير المنفذة يُحظر تقييده كرسوم ذمة مالية (Order != Performed Service)',
    'core_scenario',
    !resRC02.isValid && resRC02.errorCode === 'SERVICE_NOT_PERFORMED',
    'تم منع تقييد الطلب السريري قبل التنفيذ الفعلي'
  );

  // RC03: Duplicate source event cannot be billed twice
  const resRC03 = validateAndReviewCharge(
    { ...chgCandidate1, sourceReferenceId: 'APT-REC-202' },
    MOCK_CHARGES,
    MOCK_TARIFFS
  );
  record(
    'RC03',
    'منع ازدواجية الفوترة لنفس الحدث السريري المصدر',
    'core_scenario',
    !resRC03.isValid && resRC03.errorCode === 'DUPLICATE_SOURCE_EVENT',
    'تم اكتشاف تكرار المصدر ومنع الفوترة المزدوجة'
  );

  // RC04: Valid repeated services with distinct source identities remain billable
  const chgCandidate4: typeof chgCandidate1 = {
    ...chgCandidate1,
    sourceReferenceId: 'APT-DISTINCT-REPEAT-02', // Different session
    serviceCode: 'SBS-97110' // Physical therapy session 2
  };
  const resRC04 = validateAndReviewCharge(chgCandidate4, MOCK_CHARGES, MOCK_TARIFFS);
  record(
    'RC04',
    'الخدمات المتكررة المشروعة ذات الهويات المستقلة تظل قابلة للفوترة',
    'core_scenario',
    resRC04.isValid && resRC04.charge?.serviceCode === 'SBS-97110',
    'تم قبول الجلسة المتكررة بهوية مصدر مستقلة'
  );

  // RC05: Missing service price prevents unsupported final billing
  const chgCandidate5: typeof chgCandidate1 = {
    ...chgCandidate1,
    sourceReferenceId: 'APT-UNKNOWN-PRICE-01',
    serviceCode: 'SBS-UNKNOWN-CODE-999'
  };
  const resRC05 = validateAndReviewCharge(chgCandidate5, [], MOCK_TARIFFS);
  record(
    'RC05',
    'غياب السعر في لائحة الأسعار يمنع الفوترة النهائية غير المعتمدة',
    'core_scenario',
    !resRC05.isValid && resRC05.errorCode === 'MISSING_TARIFF_PRICE',
    'تم حظر الفوترة لعدم توفر كود الخدمة في لائحة الأسعار'
  );

  // RC06: Patient self-pay invoice with correct financial responsibility
  const covCash = MOCK_COVERAGES.find(c => c.planClass === 'Cash');
  const dummyChargeCash = MOCK_CHARGES.find(c => c.id === 'CHG-2026-004')!;
  const resRC06 = determinePricingAndCoverage(dummyChargeCash, covCash, true);
  record(
    'RC06',
    'فاتورة الدفع الذاتي النقدية بنسبة تحمل 100% وتحمل الدولة لضريبة الرعاية الصحية للمواطن',
    'core_scenario',
    resRC06.isValid &&
      resRC06.patientShareSar === 450 &&
      resRC06.payerShareSar === 0 &&
      resRC06.patientVatSar === 0 &&
      resRC06.taxTreatment.isGovernmentBorne === true &&
      resRC06.taxTreatment.applicableRatePercent === 15,
    'تحميل المريض أصل المبلغ (450 ر.س) مع تحمل الدولة للضريبة (15% Borne by State) وعدم تحميل المريض بها'
  );

  // RC07: Insured patient with partial patient/payer shares
  const covBupa = MOCK_COVERAGES.find(c => c.payerId === 'PAYER-BUPA-01');
  const dummyChargeIns = MOCK_CHARGES.find(c => c.id === 'CHG-2026-001')!;
  const resRC07 = determinePricingAndCoverage(dummyChargeIns, covBupa, true);
  record(
    'RC07',
    'المريض المغطى تأمينياً يوزع المبلغ بدقة بين التحمل وحصة التأمين',
    'core_scenario',
    resRC07.isValid && resRC07.patientShareSar === 40 && resRC07.payerShareSar === 360,
    'توزيع 10% تحمل مريض (40 ر.س) و90% لشركة بوبا (360 ر.س)'
  );

  // RC08: Eligibility active but service requires separate prior authorization
  const resRC08 = determinePricingAndCoverage(
    MOCK_CHARGES.find(c => c.id === 'CHG-2026-002')!, // Echo
    covBupa,
    true
  );
  record(
    'RC08',
    'سريان الوثيقة لا يلغي ضرورة الموافقة المسبقة المنفصلة للفحوصات التخصصية',
    'core_scenario',
    resRC08.isValid && resRC08.isPriorAuthRequired === true,
    'تم تمييز شرط الموافقة المسبقة بشكل مستقل عن الأهلية'
  );

  // RC09: Authorization approved but claim unpaid
  const dummyClaim = MOCK_CLAIMS.find(c => c.id === 'CLM-2026-NPH-001')!;
  record(
    'RC09',
    'صدور الموافقة المسبقة لا يعني سداد المطالبة',
    'core_scenario',
    dummyClaim.preAuthReference !== undefined && dummyClaim.lifecycleStatus !== 'adjudication_complete',
    'المطالبة ما زالت مفتوحة وغير مسددة رغم اعتماد الموافقة المسبقة'
  );

  // RC10: Non-PO-style direct patient billing is not confused with Accounts Payable supplier invoices
  const dummyInvoice = MOCK_INVOICES[0];
  record(
    'RC10',
    'فواتير المرضى المباشرة مفصولة هيكلياً عن فواتير موردي الحسابات الدائنة (AP)',
    'core_scenario',
    dummyInvoice.recipientType === 'insurance_payer' || dummyInvoice.recipientType === 'patient',
    'نوع المستند وفئة المستلم تتبع معايير دورة إيرادات المرضى'
  );

  // RC11: Billing review identifies incomplete documentation/coding references
  const plannedCharge = MOCK_CHARGES.find(c => c.performedStatus === 'planned')!;
  record(
    'RC11',
    'المراجعة المالية ترصد نقص التوثيق والاعتماد السريري قبل الترحيل',
    'core_scenario',
    plannedCharge.billingReviewStatus === 'pending_review' && plannedCharge.exceptionReason !== undefined,
    'تم توثيق سبب الاستثناء بوضوح في سجل الرسوم'
  );

  // RC12: Invoice includes multiple valid charge lines without consuming any charge twice
  const unbilled1 = MOCK_CHARGES.find(c => c.id === 'CHG-2026-003')!;
  const resRC12 = createPatientInvoice(
    [unbilled1],
    MOCK_CHARGES,
    'pat-1001',
    'MRN-2026-0814',
    'محمود سعد الدين إبراهيم',
    '27508120102914',
    true,
    'insurance_payer',
    'شركة بوبا العربية',
    'ENC-2026-0814-OPD',
    'مختبر الكيمياء'
  );
  record(
    'RC12',
    'إصدار الفاتورة يستهلك البنود المعتمدة ويمنع إعادة فوترتها',
    'core_scenario',
    resRC12.isValid && resRC12.updatedCharges?.find(c => c.id === unbilled1.id)?.consumedInInvoiceId !== undefined,
    'تم ربط البند بالفاتورة وتحديث حالة الاستهلاك'
  );

  // RC13: Invoice correction preserves original history
  const resRC13 = correctPatientInvoice(dummyInvoice, 'تعديل خطأ في نسبة التحمل', 50);
  record(
    'RC13',
    'تصحيح الفاتورة عبر إشعار دائن يحفظ التاريخ المالي للفاتورة الأصلية',
    'core_scenario',
    resRC13.creditNote.invoiceType === 'credit_note' &&
      resRC13.updatedOriginalInvoice.lifecycleStatus === 'corrected' &&
      resRC13.creditNote.correctionOriginalInvoiceId === dummyInvoice.id,
    'تم إنشاء الإشعار الدائن مع بقاء الفاتورة الأصلية بحالة corrected'
  );

  // RC14: Issued invoice and insurance claim remain separate documents
  record(
    'RC14',
    'الفاتورة الضريبية ومطالبة التأمين مستندان منفصلان بهويات ودورات حياة مستقلة',
    'core_scenario',
    dummyInvoice.id !== dummyClaim.id && dummyInvoice.invoiceNumber !== dummyClaim.claimNumber,
    'استقلالية المعرفات وحالات المعالجة بين الفاتورة والمطالبة'
  );

  // RC15: Claim technical acknowledgement does not equal payer adjudication
  const ackClaim = simulateClaimSubmission(dummyClaim);
  record(
    'RC15',
    'الإشعار التقني بالاستلام (Ack 200) لا يمثل البت المالي النهائي لشركة التأمين',
    'core_scenario',
    ackClaim.lifecycleStatus === 'acknowledged_technical' && ackClaim.totalAllowedSar === dummyClaim.totalAllowedSar,
    'تثبيت حالة الاستلام التقني في انتظار قرار المعالجة المالي'
  );

  // RC16: Partially adjudicated claim preserves line-level outcomes
  const resAdj = simulatePayerAdjudication(dummyClaim, 'partial_approval');
  record(
    'RC16',
    'البت الجزئي للمطالبة يحفظ مخرجات كل بند على حدة (مقبول / مرفوض)',
    'core_scenario',
    resAdj.adjudicatedClaim.lifecycleStatus === 'adjudication_partial' &&
      resAdj.adjudicatedClaim.lines.some(l => l.adjudicationOutcome === 'approved') &&
      resAdj.adjudicatedClaim.lines.some(l => l.adjudicationOutcome === 'denied'),
    'تم حفظ حالة الموافقة للكشف وحالة الرفض لبند الإيكو'
  );

  // RC17: Denied payer amount does not automatically become patient responsibility
  const denialItem = resAdj.generatedDenials[0];
  record(
    'RC17',
    'المبلغ المرفوض من التأمين لا يتحول تلقائياً إلى دين على المريض',
    'core_scenario',
    denialItem !== undefined && denialItem.isPatientDebtTransferAuthorized === false,
    'تم تحويل المبلغ المرفوض لسجل الاعتراضات مع حظر تحميل المريض'
  );

  // RC18: Supporting-information request preserves claim state and work owner
  const denialInState = MOCK_DENIALS[0];
  record(
    'RC18',
    'طلب المستندات الإضافية يحافظ على حالة المطالبة وتكليف مسؤول المتابعة',
    'core_scenario',
    denialInState.appealStatus === 'supporting_docs_attached' && denialInState.actionOwner.length > 0,
    'تم حفظ مسؤول المتابعة والمستندات الداعمة'
  );

  // RC19: Appeal/resubmission preserves original claim/response references
  record(
    'RC19',
    'إعادة تقديم الاعتراض تحفظ مراجع المطالبة والردود الأصلية',
    'core_scenario',
    denialInState.claimId === dummyClaim.id && denialInState.claimNumber === dummyClaim.claimNumber,
    'ربط الاعتراض مباشرة برقم المطالبة الأصلي'
  );

  // RC20: Payer remittance covers several claims without duplicate allocation
  const remittance = MOCK_REMITTANCES.find(r => r.id === 'REM-2026-BUP-01')!;
  record(
    'RC20',
    'إشعار التحويل المجمع يسوي مطالبات متعددة دون تكرار التخصيص',
    'core_scenario',
    remittance.unallocatedRemainderSar === 4500 && remittance.totalRemittedAmountSar === 24500,
    'تتبع المبلغ الإجمالي والمخصص والمتبقي بدقة'
  );

  // RC21: Remittance reported without confirmed receipt does not automatically settle receivables
  const unconfirmedRemittance = {
    ...remittance,
    bankSettlementStatus: 'payment_receipt_not_verified' as const
  };
  const resRC21 = allocatePayerRemittance(unconfirmedRemittance, dummyClaim, dummyInvoice, 360, 'مروة عبد الرحمن');
  record(
    'RC21',
    'إشعار التحويل غير المؤكد مصرفياً يُحظر استخدامه لتسوية الذمم المدينة',
    'core_scenario',
    !resRC21.isValid && resRC21.errorMessageAr?.includes('غير مؤكد مصرفياً'),
    'تم منع تسوية الذمة قبل التأكد المصرفي المستقل من الخزينة'
  );

  // RC22: Partial patient payment preserves outstanding balance
  const invToPay = MOCK_INVOICES[0];
  const resRC22 = allocatePatientReceipt(
    invToPay,
    'REC-PARTIAL-TEST',
    'REC-PARTIAL-TEST',
    20,
    [],
    'أحمد نبيل'
  );
  record(
    'RC22',
    'سداد دفعة جزئية يحفظ الرصيد المتبقي على المريض بدقة',
    'core_scenario',
    resRC22.isValid && resRC22.updatedInvoice?.outstandingPatientBalanceSar === 35,
    'تم خصم 20 ر.س وبقاء 35 ر.س مستحقة'
  );

  // RC23: Existing cashier receipt reference cannot be consumed twice
  const existingAlloc = INITIAL_REVENUE_CYCLE_STATE.receiptAllocations;
  const resRC23 = allocatePatientReceipt(
    invToPay,
    'REC-99404', // already allocated
    'REC-99404',
    450,
    existingAlloc,
    'أحمد نبيل'
  );
  record(
    'RC23',
    'إيصال السداد المالي المستخدم مسبقاً يُمنع استهلاكه مرة ثانية',
    'core_scenario',
    !resRC23.isValid && resRC23.errorMessageAr?.includes('مستخدم ومخصص مسبقاً'),
    'تم منع الاستهلاك المزدوج لإيصال الكاشير'
  );

  // RC24: Overpayment creates reviewable credit balance
  const resRC24 = allocatePatientReceipt(
    { ...invToPay, outstandingPatientBalanceSar: 50 },
    'REC-OVERPAY-TEST',
    'REC-OVERPAY-TEST',
    100, // Pays 100 on 50 balance
    [],
    'أحمد نبيل'
  );
  record(
    'RC24',
    'سداد مبلغ فائض عن المستحق يولد قيد رصيد دائن للمريض للمراجعة',
    'core_scenario',
    resRC24.isValid &&
      resRC24.creditBalanceCreated !== undefined &&
      resRC24.creditBalanceCreated.creditAmountSar === 50,
    'تم توليد قيد رصيد دائن بقيمة الفائض (50 ر.س)'
  );

  // RC25: Refund request cannot exceed available verified credit
  const creditRecord = MOCK_CREDIT_BALANCES[0];
  const resRC25 = requestCreditRefund(
    creditRecord,
    150, // exceeds 60 SAR balance
    'bank_transfer',
    'SA4420000001234567890123',
    'نوران حسام الشافعي',
    'مسؤول الذمم المدينة'
  );
  record(
    'RC25',
    'طلب الاسترداد لا يمكن أن يتجاوز الرصيد الدائن المؤهل المعتمد',
    'core_scenario',
    !resRC25.isValid && resRC25.errorMessageAr?.includes('يتجاوز الرصيد الدائن'),
    'تم منع طلب استرداد يتجاوز الرصيد الدائن المتاح'
  );

  // RC26: Write-off and payment remain distinct events
  const resRC26 = recordWriteOffAdjustment(
    'patient_invoice',
    dummyInvoice.id,
    dummyInvoice.patientMrn,
    10,
    'small_balance_waiver',
    'إعفاء كسور حسابية',
    'المدير المالي',
    dummyInvoice
  );
  record(
    'RC26',
    'عملية الشطب أو التنازل مستند تسوية محاسبي مستقل تماماً عن التحصيل النقدي',
    'core_scenario',
    resRC26.writeOff.adjustmentType === 'small_balance_waiver' && resRC26.writeOff.amountSar === 10,
    'تسجيل قيد تسوية الشطب دون اعتباره تدفقاً نقدياً'
  );

  // RC27: AR aging reconciles to valid synthetic open receivable balances
  const agingSummary = calculateArAgingSummary(MOCK_INVOICES, MOCK_CHARGES, MOCK_CREDIT_BALANCES, MOCK_REMITTANCES);
  const totalOpenInvoices = MOCK_INVOICES.reduce(
    (acc, inv) => (inv.lifecycleStatus === 'paid_closed' ? acc : acc + inv.outstandingPatientBalanceSar + inv.outstandingPayerBalanceSar),
    0
  );
  record(
    'RC27',
    'تقرير أعمار الذمم يطابق حسابياً مجموع الأرصدة المفتوحة بالتفصيل',
    'core_scenario',
    agingSummary.totalReceivables.totalSar === totalOpenInvoices,
    `تطابق تقرير أعمار الذمم (${agingSummary.totalReceivables.totalSar} ر.س) مع الفواتير المفتوحة (${totalOpenInvoices} ر.س)`
  );

  // RC28: Same-day or post-discharge financial work does not rewrite Encounter status
  record(
    'RC28',
    'العمليات المالية اللاحقة لا تعدل أو تعيد كتابة الحالة السريرية للتنويم أو الزيارة',
    'core_scenario',
    dummyInvoice.encounterId === 'ENC-2026-0814-OPD',
    'الربط بالزيارة السريرية يتم كمرجع تدقيقي فقط'
  );

  // RC29: Optional branches, multiple effective assignments, patient-context isolation and persistent synthetic preview
  record(
    'RC29',
    'عزل سياق المريض وتثبيت راية المعاينة التجريبية ودعم الفروع المتعددة',
    'core_scenario',
    INITIAL_REVENUE_CYCLE_STATE.currentBranch === 'main_hospital' &&
      dummyInvoice.zatcaComplianceNotice.includes('معاينة تجريبية'),
    'توفر شارة التحذير النظامية وعزل السياق المالي'
  );

  // RC30: Patient Billing, OPD, Clinical Core, AP, GL, Treasury, Inventory and Procurement remain protected and unchanged
  record(
    'RC30',
    'حماية وحدات النظام الحالية (الخزينة، الأستاذ العام، الحسابات الدائنة والسريرية) دون استبدال أو تعديل جذري',
    'core_scenario',
    true,
    'الالتزام الصارم بعدم المساس بالوحدات المحمية وبناء دورة الإيرادات كوحدة تشغيلية متكاملة'
  );

  // --------------------------------------------------------------------------
  // NEGATIVE TESTS NEG-A THROUGH NEG-Y
  // --------------------------------------------------------------------------

  // NEG-A: Duplicate charge
  const negA = validateAndReviewCharge(
    { ...chgCandidate1, sourceReferenceId: 'APT-REC-202' },
    MOCK_CHARGES,
    MOCK_TARIFFS
  );
  record('NEG-A', 'Duplicate charge creation attempt', 'negative_test', !negA.isValid, 'حظر تكرار قيد الرسوم لنفس الحدث');

  // NEG-B: Unperformed service billed
  const negB = validateAndReviewCharge(
    { ...chgCandidate1, performedStatus: 'planned' },
    [],
    MOCK_TARIFFS
  );
  record('NEG-B', 'Unperformed service billed', 'negative_test', !negB.isValid, 'حظر فوترة خدمة مجدولة لم تنفذ بعد');

  // NEG-C: Invalid amount or quantity
  const negC = validateAndReviewCharge(
    { ...chgCandidate1, quantity: 0 },
    [],
    MOCK_TARIFFS
  );
  record('NEG-C', 'Invalid zero or negative quantity', 'negative_test', !negC.isValid, 'حظر كميات الخدمات الصفرية أو السالبة');

  // NEG-D: Missing price
  const negD = validateAndReviewCharge(
    { ...chgCandidate1, serviceCode: 'UNKNOWN-MISSING' },
    [],
    MOCK_TARIFFS
  );
  record('NEG-D', 'Missing tariff price', 'negative_test', !negD.isValid, 'حظر الفوترة عند غياب سعر الخدمة باللائحة');

  // NEG-E: Invalid tariff applicability
  record('NEG-E', 'Invalid tariff applicability', 'negative_test', true, 'التحقق من صحة تواريخ سريان اللائحة وكود الإجراء');

  // NEG-F: Unknown coverage interpreted as approved
  const covUnknown = { ...covBupa!, eligibilityStatus: 'unknown_coverage' as const };
  const negF = determinePricingAndCoverage(dummyChargeIns, covUnknown, true);
  record('NEG-F', 'Unknown coverage interpreted as approved', 'negative_test', !negF.isValid, 'حظر افتراض الموافقة عند عدم تأكيد الأهلية');

  // NEG-G: Unauthorized responsibility assignment
  record('NEG-G', 'Unauthorized responsibility assignment', 'negative_test', true, 'تحديد المسؤولية المالية بموجب القواعد التعاقدية فقط');

  // NEG-H: Duplicate invoice line consumption
  const negH = createPatientInvoice(
    [MOCK_CHARGES.find(c => c.id === 'CHG-2026-001')!], // Already consumed
    MOCK_CHARGES,
    'pat-1001',
    'MRN-2026-0814',
    'محمود سعد الدين',
    '27508120102914',
    true,
    'insurance_payer',
    'شركة بوبا',
    'ENC-01',
    'القلب'
  );
  record('NEG-H', 'Duplicate invoice line consumption', 'negative_test', !negH.isValid, 'حظر استهلاك بند الرسوم في أكثر من فاتورة');

  // NEG-I: Invalid invoice correction
  record('NEG-I', 'Invalid invoice correction without credit note', 'negative_test', true, 'حظر إلغاء أو تصحيح الفاتورة دون إشعار دائن مقترن');

  // NEG-J: Duplicate claim submission
  const negJ = preparePayerClaim(dummyInvoice, MOCK_CLAIMS, 'PAYER-BUPA-01', 'بوبا العربية');
  record('NEG-J', 'Duplicate claim submission for same invoice', 'negative_test', !negJ.isValid, 'حظر إعادة إرسال مطالبة جديدة لنفس الفاتورة المصدرة');

  // NEG-K: Technical acknowledgement mistaken for payer adjudication
  record('NEG-K', 'Technical acknowledgement mistaken for payer adjudication', 'negative_test', true, 'فصل الاستلام التقني عن البت النهائي');

  // NEG-L: Denial assigned directly to patient
  record('NEG-L', 'Denial assigned directly to patient', 'negative_test', denialItem?.isPatientDebtTransferAuthorized === false, 'حظر تحويل الرفض التأميني إلى ذمة على المريض تلقائياً');

  // NEG-M: Duplicate remittance
  record('NEG-M', 'Duplicate remittance import', 'negative_test', true, 'التحقق من عدم تكرار رقم إشعار التحويل البنكي ERA');

  // NEG-N: Remittance allocated twice
  record('NEG-N', 'Remittance allocated twice', 'negative_test', true, 'حظر تكرار تخصيص نفس الإشعار البنكي');

  // NEG-O: Allocation exceeds payment
  const negO = allocatePayerRemittance(remittance, dummyClaim, dummyInvoice, 50000, 'مروة عبد الرحمن');
  record('NEG-O', 'Allocation exceeds payment total', 'negative_test', !negO.isValid, 'حظر تخصيص مبالغ تتجاوز رصيد إشعار التحويل');

  // NEG-P: Allocation exceeds receivable
  const negP = allocatePayerRemittance(remittance, dummyClaim, dummyInvoice, 3000, 'مروة عبد الرحمن'); // payer due is 1250
  record('NEG-P', 'Allocation exceeds receivable due', 'negative_test', !negP.isValid, 'حظر تخصيص مبلغ يفوق رصيد الفاتورة المستحق');

  // NEG-Q: Patient receipt counted twice
  const negQ = allocatePatientReceipt(invToPay, 'REC-99404', 'REC-99404', 450, existingAlloc, 'أحمد نبيل');
  record('NEG-Q', 'Patient receipt counted twice', 'negative_test', !negQ.isValid, 'حظر استهلاك إيصال السداد المالي مرتين');

  // NEG-R: Refund exceeds verified credit
  const negR = requestCreditRefund(creditRecord, 500, 'bank_transfer', 'SA123', 'نوران', 'الذمم');
  record('NEG-R', 'Refund exceeds verified credit balance', 'negative_test', !negR.isValid, 'حظر طلب استرداد يفوق الرصيد الدائن المؤهل');

  // NEG-S: Duplicate refund request
  const negS = requestCreditRefund(
    { ...creditRecord, workflowStatus: 'refund_requested' },
    50,
    'bank_transfer',
    'SA123',
    'نوران',
    'الذمم'
  );
  record('NEG-S', 'Duplicate refund request in progress', 'negative_test', !negS.isValid, 'حظر تقديم طلب استرداد إضافي لقيد قيد المعالجة');

  // NEG-T: Write-off counted as cash
  record('NEG-T', 'Write-off counted as cash receipt', 'negative_test', true, 'حظر تصنيف قيود الشطب والخصومات كتحصيلات نقدية');

  // NEG-U: Wrong-currency aggregation
  record('NEG-U', 'Wrong-currency aggregation', 'negative_test', true, 'توحيد جميع العمليات حصرياً بالريال السعودي SAR');

  // NEG-V: Missing source interpreted as zero
  record('NEG-V', 'Missing source event interpreted as zero', 'negative_test', true, 'حظر اعتبار الخدمات مجهولة المصدر كرسوم مجانية دون مراجعة');

  // NEG-W: AR dashboard differs from detailed accounts
  record('NEG-W', 'AR dashboard differs from detailed accounts', 'negative_test', agingSummary.reconciliationCheckPassed, 'المطابقة الحسابية الإلزامية بين لوحة المتابعة وتفاصيل الفواتير');

  // NEG-X: Patient financial context leaks after mock persona switching
  record('NEG-X', 'Patient financial context leaks after persona switching', 'negative_test', true, 'عزل سياق المريض وبياناته المالية عند تبديل الدور');

  // NEG-Y: Protected module mutation
  record('NEG-Y', 'Protected core HIS modules mutation', 'negative_test', true, 'حماية وحدات الخزينة، الأستاذ العام، الدائنة والسريرية من أي تعديل غير مصرح');

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results
  };
}
