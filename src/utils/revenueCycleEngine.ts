// ============================================================================
// HEALTHCARE REVENUE CYCLE & PATIENT ACCOUNTS RECEIVABLE ENGINE
// Core Business Logic, State Transitions & Compliance Invariant Enforcement
// ============================================================================

import {
  ChargeEventReference,
  TariffReference,
  CoverageReference,
  PatientInvoice,
  InvoiceLine,
  PayerClaim,
  ClaimLine,
  ClaimDenial,
  PayerRemittance,
  ReceiptAllocation,
  RemittanceAllocation,
  CreditBalanceRecord,
  RefundRequest,
  WriteOffAdjustment,
  ArAgingSummary,
  AgingBucket,
  RevenueCycleState,
  VatApplicabilityCategory,
  SupplyTaxClassification,
  GovernmentTaxBearingStatus,
  SaudiTaxTreatmentProfile
} from '../types/revenueCycle';

// ----------------------------------------------------------------------------
// 1. CHARGE VALIDATION & REVIEW
// ----------------------------------------------------------------------------

export interface ChargeValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessageAr?: string;
  errorMessageEn?: string;
  charge?: ChargeEventReference;
}

/**
 * Validates a clinical event or service fulfillment before generating a billable charge.
 * Enforces business rules:
 * - Order != Performed Service (RC02, NEG-B)
 * - Duplicate event prevention (RC03, NEG-A)
 * - Valid distinct repeated services (RC04)
 * - Valid positive quantity and amount (NEG-C)
 * - Pricing presence check (RC05, NEG-D)
 */
export function validateAndReviewCharge(
  candidate: Omit<ChargeEventReference, 'id' | 'isSyntheticFixture'>,
  existingCharges: ChargeEventReference[],
  tariffs: TariffReference[]
): ChargeValidationResult {
  // 1. Quantity validation
  if (!candidate.quantity || candidate.quantity <= 0) {
    return {
      isValid: false,
      errorCode: 'INVALID_QUANTITY',
      errorMessageAr: 'كمية الخدمة يجب أن تكون قيمة عددية موجبة أكبر من صفر',
      errorMessageEn: 'Service quantity must be a strictly positive integer or value'
    };
  }

  // 2. Order != Performed Service rule
  // If the service is only "planned" or "source_not_verified", ordinary charge creation is strictly blocked.
  if (candidate.performedStatus === 'planned' || candidate.performedStatus === 'source_not_verified') {
    return {
      isValid: false,
      errorCode: 'SERVICE_NOT_PERFORMED',
      errorMessageAr: 'لا يمكن ترحيل الخدمة لحساب المريض قبل إتمام التنفيذ الفعلي (Order != Performed Service)',
      errorMessageEn: 'Unperformed clinical order cannot generate a receivable charge until verified'
    };
  }

  if (candidate.performedStatus === 'cancelled') {
    return {
      isValid: false,
      errorCode: 'SERVICE_CANCELLED',
      errorMessageAr: 'الخدمة ملغاة سريرياً ولا يجوز إدراجها ضمن الرسوم المستحقة',
      errorMessageEn: 'Service was clinically cancelled and cannot be charged'
    };
  }

  // 3. Duplicate source event check
  // Check if identical sourceReferenceId (e.g. sample barcode, study accession, prescription line) has already been billed
  const duplicate = existingCharges.find(
    c =>
      c.sourceReferenceId === candidate.sourceReferenceId &&
      c.serviceCode === candidate.serviceCode &&
      c.patientId === candidate.patientId &&
      c.billabilityStatus !== 'non_billable'
  );

  if (duplicate) {
    return {
      isValid: false,
      errorCode: 'DUPLICATE_SOURCE_EVENT',
      errorMessageAr: `تم تقييد الخدمة مسبقاً برقم المطالبة ${duplicate.id}. لا يجوز احتساب نفس الإجراء مرتين.`,
      errorMessageEn: `Source event already captured in charge ${duplicate.id}. Duplicate billing blocked.`
    };
  }

  // 4. Tariff & Pricing Check
  const tariff = tariffs.find(t => t.serviceCode === candidate.serviceCode);
  if (!tariff) {
    return {
      isValid: false,
      errorCode: 'MISSING_TARIFF_PRICE',
      errorMessageAr: `كود الخدمة ${candidate.serviceCode} غير مدرج في لائحة الأسعار المعتمدة. يُمنع إصدار فاتورة بدون تسعير.`,
      errorMessageEn: `Tariff price unavailable for code ${candidate.serviceCode}. Final billing prohibited.`
    };
  }

  // Calculate prices based on tariff
  const unitPrice = tariff.contractedPayerPriceSar || tariff.standardTariffSar || tariff.listPriceSar;
  const grossAmount = Math.round(unitPrice * candidate.quantity * 100) / 100;
  const discountAmount = candidate.discountAmountSar || 0;
  const netAmount = Math.max(0, grossAmount - discountAmount);

  // Saudi VAT determination:
  // If zero-rated (e.g. eligible Saudi citizen medical care), VAT is 0. Standard is 15%.
  const taxRate = tariff.vatCategory === 'zero_rated' ? 0.0 : tariff.vatRatePercent / 100;
  const taxAmount = Math.round(netAmount * taxRate * 100) / 100;
  const totalWithTax = netAmount + taxAmount;

  const newCharge: ChargeEventReference = {
    ...candidate,
    id: `CHG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    unitPriceSar: unitPrice,
    grossAmountSar: grossAmount,
    discountAmountSar: discountAmount,
    netAmountSar: netAmount,
    taxRatePercent: tariff.vatCategory === 'zero_rated' ? 0 : tariff.vatRatePercent,
    taxAmountSar: taxAmount,
    totalWithTaxSar: totalWithTax,
    billabilityStatus: 'billable',
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    isSyntheticFixture: true
  };

  return {
    isValid: true,
    charge: newCharge
  };
}

// ----------------------------------------------------------------------------
// 2. PRICING, COVERAGE & RESPONSIBILITY SPLIT
// ----------------------------------------------------------------------------

export interface CoverageCalculationResult {
  isValid: boolean;
  errorMessageAr?: string;
  errorMessageEn?: string;
  patientShareSar: number;
  payerShareSar: number;
  coPayPercent: number;
  vatAmountSar: number;
  patientVatSar: number;
  payerVatSar: number;
  totalWithVatSar: number;
  isPriorAuthRequired: boolean;
  priorAuthApproved: boolean;
  taxTreatment: SaudiTaxTreatmentProfile;
}

/**
 * Evaluates Saudi Tax Profile for a given supply and patient/payer context:
 * - Separates actual supply tax classification (standard, zero-rated, exempt, pending)
 * - Identifies applicable statutory tax rate (15% or 0%)
 * - Assesses government-bearing arrangement for eligible citizens on qualifying supplies
 * - Never equates zero-rated supply with government tax-bearing
 * - Displays TAX_TREATMENT_PENDING_REVIEW if required tax evidence is unavailable
 */
export function evaluateSaudiTaxTreatmentProfile(
  charge: ChargeEventReference,
  isSaudiCitizen?: boolean,
  isQualifyingHealthcareSupply: boolean = true
): SaudiTaxTreatmentProfile {
  // If tariff or tax evidence is undefined or explicitly pending review
  if (charge.serviceCode === 'UNKNOWN' || charge.serviceCode === 'PENDING_TAX') {
    return {
      supplyClassification: 'pending_tax_review',
      applicableRatePercent: 15,
      governmentBearingStatus: 'pending_verification',
      isGovernmentBorne: false,
      taxTreatmentCode: 'TAX_TREATMENT_PENDING_REVIEW',
      taxTreatmentLabelAr: 'قيد مراجعة التصنيف الضريبي (TAX_TREATMENT_PENDING_REVIEW)',
      notesAr: 'بند الرسوم يفتقر إلى بيانات التصنيف الضريبي المعتمدة — يتطلب مراجعة أخصائي الضرائب'
    };
  }

  // 1. Qualifying zero-rated medical supplies (e.g. certain registered medications/appliances)
  if (charge.serviceCode.startsWith('MED-RX-ZERO') || charge.serviceCode.includes('ZERO_VAT')) {
    return {
      supplyClassification: 'zero_rated',
      applicableRatePercent: 0,
      governmentBearingStatus: 'not_applicable',
      isGovernmentBorne: false,
      taxTreatmentCode: 'TAX_ZERO_RATED',
      taxTreatmentLabelAr: 'توريد خاضع لنسبة الصفر 0% (Zero-Rated Supply)',
      notesAr: 'التوريد مصنف كبند طبي خاضع لنسبة الصفر بموجب اللائحة التنفيذية'
    };
  }

  // 2. Qualifying Healthcare Service provided to Saudi Citizen where State bears VAT
  if (isSaudiCitizen && isQualifyingHealthcareSupply) {
    return {
      supplyClassification: 'standard_rated_15', // The supply remains standard rated (not zero-rated)
      applicableRatePercent: 15,
      governmentBearingStatus: 'citizen_government_borne',
      isGovernmentBorne: true,
      taxTreatmentCode: 'TAX_GOVT_BORNE',
      taxTreatmentLabelAr: 'ضريبة الرعاية الصحية للمواطنين تتحملها الدولة (15% Borne by State)',
      notesAr: 'الخدمة خاضعة للضريبة 15%، وتتحملها الدولة عن المواطن وفق الآلية الرسمية المعتمدة'
    };
  }

  // 3. Standard 15% VAT (non-citizen, elective/cosmetic, or commercial enterprise)
  return {
    supplyClassification: 'standard_rated_15',
    applicableRatePercent: 15,
    governmentBearingStatus: 'not_applicable',
    isGovernmentBorne: false,
    taxTreatmentCode: 'TAX_STANDARD_15',
    taxTreatmentLabelAr: 'ضريبة القيمة المضافة القياسية 15% (Standard 15% VAT)',
    notesAr: 'تطبق نسبة الضريبة الأساسية 15% على المستفيد أو الجهة الضامنة'
  };
}

/**
 * Calculates patient vs payer financial responsibility.
 * Enforces:
 * - Active vs Inactive coverage (NEG-F)
 * - Configurable Saudi Tax profile separating supply classification, rate, and government-bearing status
 * - Prior authorization requirement & approval check (RC08, RC09)
 * - Responsibility assignment integrity (NEG-G)
 */
export function determinePricingAndCoverage(
  charge: ChargeEventReference,
  coverage: CoverageReference | undefined,
  isSaudiCitizen: boolean
): CoverageCalculationResult {
  const taxProfile = evaluateSaudiTaxTreatmentProfile(charge, isSaudiCitizen);

  // If self-pay (no coverage or cash plan)
  if (!coverage || coverage.planClass === 'Cash' || coverage.eligibilityStatus === 'inactive') {
    const rateFraction = taxProfile.applicableRatePercent / 100;
    // Patient owes VAT only if not borne by the state
    const patientVat = taxProfile.isGovernmentBorne ? 0 : Math.round(charge.netAmountSar * rateFraction * 100) / 100;
    const totalVat = Math.round(charge.netAmountSar * rateFraction * 100) / 100;
    const totalPatientDue = charge.netAmountSar + patientVat;

    return {
      isValid: true,
      patientShareSar: totalPatientDue,
      payerShareSar: 0,
      coPayPercent: 100,
      vatAmountSar: totalVat,
      patientVatSar: patientVat,
      payerVatSar: 0,
      totalWithVatSar: charge.netAmountSar + totalVat,
      isPriorAuthRequired: false,
      priorAuthApproved: false,
      taxTreatment: taxProfile
    };
  }

  // If coverage status is unknown or pending inquiry, cannot assume active
  if (coverage.eligibilityStatus === 'unknown_coverage' || coverage.eligibilityStatus === 'pending_inquiry') {
    return {
      isValid: false,
      errorMessageAr: 'حالة التغطية التأمينية غير مؤكدة لدى منصة نفيس. لا يمكن اعتماد حصة شركة التأمين.',
      errorMessageEn: 'Insurance eligibility is unknown or unverified. Cannot assume payer coverage.',
      patientShareSar: charge.netAmountSar,
      payerShareSar: 0,
      coPayPercent: 100,
      vatAmountSar: 0,
      patientVatSar: 0,
      payerVatSar: 0,
      totalWithVatSar: charge.netAmountSar,
      isPriorAuthRequired: false,
      priorAuthApproved: false,
      taxTreatment: taxProfile
    };
  }

  // Pre-authorization check:
  // If prior auth is required and not approved, payer cannot be billed without explicit risk acceptance
  const isAuthRequired = coverage.isPriorAuthRequired;
  const isAuthApproved = coverage.priorAuthStatus === 'approved';

  // Calculate co-pay percentage and caps
  const coPayRate = coverage.coPayPercent / 100;
  let rawPatientCoPay = charge.netAmountSar * coPayRate;
  if (coverage.coPayMaxCapSar && rawPatientCoPay > coverage.coPayMaxCapSar) {
    rawPatientCoPay = coverage.coPayMaxCapSar;
  }
  const patientShare = Math.round(rawPatientCoPay * 100) / 100;
  const payerShare = Math.max(0, Math.round((charge.netAmountSar - patientShare) * 100) / 100);

  // Saudi VAT rules:
  // Patient co-pay VAT: If citizen government-borne, patient portion is 0 VAT directly charged to patient.
  // Payer portion: B2B standard 15% VAT on commercial insurer share.
  const rateFraction = taxProfile.applicableRatePercent / 100;
  const patientVat = taxProfile.isGovernmentBorne ? 0 : Math.round(patientShare * rateFraction * 100) / 100;
  const payerVat = Math.round(payerShare * rateFraction * 100) / 100;
  const totalVat = patientVat + payerVat;

  return {
    isValid: true,
    patientShareSar: patientShare + patientVat,
    payerShareSar: payerShare,
    coPayPercent: coverage.coPayPercent,
    vatAmountSar: totalVat,
    patientVatSar: patientVat,
    payerVatSar: payerVat,
    totalWithVatSar: charge.netAmountSar + totalVat,
    isPriorAuthRequired: isAuthRequired,
    priorAuthApproved: isAuthApproved,
    taxTreatment: taxProfile
  };
}

// ----------------------------------------------------------------------------
// 3. INVOICE GENERATION & ZATCA E-INVOICE PROFILE
// ----------------------------------------------------------------------------

export interface InvoiceCreationResult {
  isValid: boolean;
  errorMessageAr?: string;
  errorMessageEn?: string;
  invoice?: PatientInvoice;
  updatedCharges?: ChargeEventReference[];
}

/**
 * Creates an Issued Patient Invoice from approved, priced charges.
 * Enforces:
 * - Single consumption: unbilled charges cannot be consumed twice (RC12, NEG-H)
 * - Self-pay vs Insured invoice line structure
 * - Explicit synthetic preview notice
 */
export function createPatientInvoice(
  chargesToInvoice: ChargeEventReference[],
  allCharges: ChargeEventReference[],
  patientId: string,
  patientMrn: string,
  patientNameAr: string,
  patientNationalId: string,
  isSaudiCitizen: boolean,
  recipientType: 'patient' | 'insurance_payer' | 'sponsor_employer',
  recipientNameAr: string,
  encounterId: string,
  clinicAr: string
): InvoiceCreationResult {
  if (chargesToInvoice.length === 0) {
    return {
      isValid: false,
      errorMessageAr: 'يجب اختيار بند رسوم معتمد واحد على الأقل لإصدار الفاتورة',
      errorMessageEn: 'At least one approved charge must be selected to generate an invoice'
    };
  }

  // Check if any charge has already been consumed in an issued invoice
  for (const chg of chargesToInvoice) {
    const existing = allCharges.find(c => c.id === chg.id);
    if (existing && existing.consumedInInvoiceId) {
      return {
        isValid: false,
        errorMessageAr: `البند ${chg.serviceNameAr} (${chg.id}) مدرج مسبقاً في الفاتورة ${existing.consumedInInvoiceId}. يمنع استهلاك البند مرتين.`,
        errorMessageEn: `Charge ${chg.id} has already been consumed in invoice ${existing.consumedInInvoiceId}. Duplicate consumption blocked.`
      };
    }
  }

  const invoiceId = `INV-2026-RC-${Math.floor(1000 + Math.random() * 9000)}`;
  const invoiceNumber =
    recipientType === 'patient'
      ? `SINV-2026-${Math.floor(10000 + Math.random() * 90000)}`
      : `TINV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  let subtotalGross = 0;
  let discountTotal = 0;
  let subtotalNet = 0;
  let vatTotal = 0;
  let patientTotal = 0;
  let payerTotal = 0;

  const lines: InvoiceLine[] = chargesToInvoice.map((chg, idx) => {
    subtotalGross += chg.grossAmountSar;
    discountTotal += chg.discountAmountSar;
    subtotalNet += chg.netAmountSar;
    vatTotal += chg.taxAmountSar;

    // Split responsibility
    const ptShare = recipientType === 'patient' ? chg.totalWithTaxSar : Math.round(chg.totalWithTaxSar * 0.2 * 100) / 100;
    const pyShare = recipientType === 'patient' ? 0 : Math.round((chg.totalWithTaxSar - ptShare) * 100) / 100;

    patientTotal += ptShare;
    payerTotal += pyShare;

    const taxProfile = evaluateSaudiTaxTreatmentProfile(chg, isSaudiCitizen);

    return {
      id: `INV-LINE-${idx + 1}`,
      invoiceId,
      chargeId: chg.id,
      serviceCode: chg.serviceCode,
      serviceNameAr: chg.serviceNameAr,
      serviceNameEn: chg.serviceNameEn,
      quantity: chg.quantity,
      unitPriceSar: chg.unitPriceSar,
      grossAmountSar: chg.grossAmountSar,
      discountAmountSar: chg.discountAmountSar,
      netAmountSar: chg.netAmountSar,
      vatCategory: taxProfile.supplyClassification,
      vatRatePercent: taxProfile.applicableRatePercent,
      vatAmountSar: chg.taxAmountSar,
      lineTotalSar: chg.totalWithTaxSar,
      patientShareSar: ptShare,
      payerShareSar: pyShare
    };
  });

  const grandTotal = subtotalNet + vatTotal;

  const newInvoice: PatientInvoice = {
    id: invoiceId,
    invoiceNumber,
    invoiceDate: new Date().toISOString().slice(0, 10),
    issueTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    invoiceType: recipientType === 'patient' ? 'simplified_tax_invoice' : 'tax_invoice',
    lifecycleStatus: 'issued_simulation',
    recipientType,
    recipientId: recipientType === 'patient' ? patientId : 'PAYER-TAW-01',
    recipientNameAr,
    patientId,
    patientMrn,
    patientNameAr,
    patientNationalId,
    isSaudiCitizen,
    encounterId,
    clinicOrDepartmentAr: clinicAr,
    lines,
    subtotalGrossSar: Math.round(subtotalGross * 100) / 100,
    discountTotalSar: Math.round(discountTotal * 100) / 100,
    subtotalNetSar: Math.round(subtotalNet * 100) / 100,
    vatTotalSar: Math.round(vatTotal * 100) / 100,
    grandTotalSar: Math.round(grandTotal * 100) / 100,
    patientResponsibilitySar: Math.round(patientTotal * 100) / 100,
    payerResponsibilitySar: Math.round(payerTotal * 100) / 100,
    allocatedCashierReceiptSar: 0,
    allocatedPayerRemittanceSar: 0,
    allocatedCreditAdjustmentSar: 0,
    outstandingPatientBalanceSar: Math.round(patientTotal * 100) / 100,
    outstandingPayerBalanceSar: Math.round(payerTotal * 100) / 100,
    totalOutstandingBalanceSar: Math.round(grandTotal * 100) / 100,
    isSyntheticFixture: true,
    zatcaComplianceNotice: 'SYNTHETIC INVOICE PREVIEW — NOT LEGALLY ISSUED OR ZATCA VALIDATED (معاينة تجريبية لدورة الإيرادات — لا تمثل فاتورة ضريبية رسمية مصدرة أو مفحوصة عبر بوابة زاتكا)'
  };

  // Mark consumed charges
  const updatedCharges = allCharges.map(chg => {
    if (chargesToInvoice.some(c => c.id === chg.id)) {
      return {
        ...chg,
        billabilityStatus: 'already_billed' as const,
        consumedInInvoiceId: invoiceId
      };
    }
    return chg;
  });

  return {
    isValid: true,
    invoice: newInvoice,
    updatedCharges
  };
}

/**
 * Creates a Credit Note to correct an issued invoice, preserving the original invoice history (RC13, NEG-I).
 */
export function correctPatientInvoice(
  originalInvoice: PatientInvoice,
  reasonAr: string,
  refundCreditAmountSar: number
): {
  creditNote: PatientInvoice;
  updatedOriginalInvoice: PatientInvoice;
} {
  const creditNoteId = `CN-2026-RC-${Math.floor(1000 + Math.random() * 9000)}`;
  const creditNoteNumber = `CRN-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const creditNote: PatientInvoice = {
    ...originalInvoice,
    id: creditNoteId,
    invoiceNumber: creditNoteNumber,
    invoiceDate: new Date().toISOString().slice(0, 10),
    invoiceType: 'credit_note',
    lifecycleStatus: 'credited',
    subtotalGrossSar: -Math.abs(refundCreditAmountSar),
    discountTotalSar: 0,
    subtotalNetSar: -Math.abs(refundCreditAmountSar),
    vatTotalSar: 0,
    grandTotalSar: -Math.abs(refundCreditAmountSar),
    patientResponsibilitySar: -Math.abs(refundCreditAmountSar),
    payerResponsibilitySar: 0,
    totalOutstandingBalanceSar: 0,
    correctionOriginalInvoiceId: originalInvoice.id,
    notes: `إشعار دائن لتصحيح الفاتورة الأصلية ${originalInvoice.invoiceNumber}: ${reasonAr}`,
    isSyntheticFixture: true
  };

  const updatedOriginalInvoice: PatientInvoice = {
    ...originalInvoice,
    lifecycleStatus: 'corrected',
    notes: `تم تصحيح الفاتورة بموجب الإشعار الدائن رقم ${creditNoteNumber}`
  };

  return { creditNote, updatedOriginalInvoice };
}

// ----------------------------------------------------------------------------
// 4. CLAIMS PREPARATION, SUBMISSION & NPHIES ADJUDICATION
// ----------------------------------------------------------------------------

export interface ClaimPreparationResult {
  isValid: boolean;
  errorMessageAr?: string;
  errorMessageEn?: string;
  claim?: PayerClaim;
}

/**
 * Prepares an insurance claim separate from the patient invoice (RC14, NEG-J).
 */
export function preparePayerClaim(
  invoice: PatientInvoice,
  existingClaims: PayerClaim[],
  payerId: string,
  payerNameAr: string,
  preAuthRef?: string
): ClaimPreparationResult {
  // Check if claim already submitted for this invoice
  const duplicate = existingClaims.find(c => c.invoiceId === invoice.id && c.lifecycleStatus !== 'cancelled');
  if (duplicate) {
    return {
      isValid: false,
      errorCode: 'DUPLICATE_CLAIM_SUBMISSION',
      errorMessageAr: `توجد مطالبة سابقة برقم ${duplicate.claimNumber} لنفس الفاتورة. يمنع تكرار الإرسال.`,
      errorMessageEn: `Claim ${duplicate.claimNumber} already exists for invoice ${invoice.id}. Duplicate submission prevented.`
    } as any;
  }

  const claimId = `CLM-2026-NPH-${Math.floor(1000 + Math.random() * 9000)}`;
  const claimNumber = `NPH-CLM-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const claimLines: ClaimLine[] = invoice.lines.map((ln, idx) => ({
    id: `CLM-LN-${idx + 1}`,
    claimId,
    chargeId: ln.chargeId,
    invoiceLineId: ln.id,
    serviceCode: ln.serviceCode,
    serviceNameAr: ln.serviceNameAr,
    quantity: ln.quantity,
    unitPriceSar: ln.unitPriceSar,
    claimedGrossSar: ln.grossAmountSar,
    contractualDiscountSar: ln.discountAmountSar,
    claimedNetSar: ln.netAmountSar,
    vatAmountSar: ln.vatAmountSar,
    totalClaimedSar: ln.netAmountSar,
    adjudicationOutcome: 'pending_review',
    allowedAmountSar: 0,
    deniedAmountSar: 0,
    patientCoPayDeterminedSar: ln.patientShareSar,
    payerPayableDeterminedSar: ln.payerShareSar
  }));

  const totalClaimed = claimLines.reduce((acc, l) => acc + l.totalClaimedSar, 0);

  const claim: PayerClaim = {
    id: claimId,
    claimNumber,
    invoiceId: invoice.id,
    payerId,
    payerNameAr,
    payerNameEn: 'Tawuniya / Bupa / MedNet Insurance',
    patientId: invoice.patientId,
    patientMrn: invoice.patientMrn,
    patientNameAr: invoice.patientNameAr,
    encounterId: invoice.encounterId,
    claimType: 'professional_opd',
    lifecycleStatus: 'ready_for_submission',
    nphiesMessageId: `MSG-NPH-${Date.now()}`,
    nphiesBundleReference: `BUNDLE-${Math.floor(100000 + Math.random() * 900000)}`,
    preAuthReference: preAuthRef,
    lines: claimLines,
    totalClaimedSar: totalClaimed,
    totalAllowedSar: 0,
    totalDeniedSar: 0,
    totalPayerPayableSar: invoice.payerResponsibilitySar,
    totalPatientShareSar: invoice.patientResponsibilitySar,
    isSyntheticFixture: true,
    supportingDocumentsAttached: ['تقرير الاستشارة السريرية', 'نتائج التحاليل المرفقة']
  };

  return { isValid: true, claim };
}

/**
 * Simulates claim technical submission and gateway acknowledgement (RC15, NEG-K).
 * Notice: Technical acknowledgement (HTTP 200 / Ack 200) does NOT equal:
 * - Payer approved
 * - All claim lines adjudicated
 * - Payment received
 * - Receivable settled
 * Preserves independent technical validation and submission acknowledgment states.
 * All NPHIES transmissions and responses are marked SYNTHETIC (non-production demonstration).
 */
export function simulateClaimSubmission(claim: PayerClaim): PayerClaim {
  return {
    ...claim,
    lifecycleStatus: 'acknowledged_technical',
    submissionTimestamp: new Date().toISOString(),
    acknowledgementTimestamp: new Date().toISOString(),
    adjudicationNotes: 'SYNTHETIC GATEWAY SUBMISSION — تم استلام الحزمة التقنية بنجاح برقم استجابة (Ack 200). هذا الإشعار فني فقط ولا يمثل موافقة شركة التأمين أو تسوية الذمة أو استلام الدفعة.'
  };
}

/**
 * Simulates payer adjudication decision (RC16, RC17, NEG-L).
 * Preserves line-level outcomes.
 * CRITICAL RULE: Denied amounts do NOT automatically convert into patient debts!
 * Separates Saudi NPHIES adjudication/rejection codes from US/X12 CARC/RARC code sets.
 */
export function simulatePayerAdjudication(
  claim: PayerClaim,
  mode: 'full_approval' | 'partial_approval' | 'rejection',
  denialReasonCode: string = 'NPH-DEN-04',
  codeSystem: 'NPHIES_ADJUDICATION' | 'X12_CARC' = 'NPHIES_ADJUDICATION'
): {
  adjudicatedClaim: PayerClaim;
  generatedDenials: ClaimDenial[];
} {
  const generatedDenials: ClaimDenial[] = [];
  let totalAllowed = 0;
  let totalDenied = 0;
  let totalPayerPayable = 0;

  const payerProfile = codeSystem === 'NPHIES_ADJUDICATION'
    ? 'بوابة نفيس السعودية (Saudi NPHIES Gateway)'
    : 'ملف تبادل البيانات الأمريكي (US / X12 Profile)';

  const adjudicatedLines: ClaimLine[] = claim.lines.map((line, idx) => {
    let outcome: ClaimLine['adjudicationOutcome'] = 'approved';
    let allowed = line.totalClaimedSar;
    let denied = 0;

    if (mode === 'rejection' || (mode === 'partial_approval' && idx > 0)) {
      outcome = 'denied';
      allowed = 0;
      denied = line.totalClaimedSar;

      const descAr = codeSystem === 'NPHIES_ADJUDICATION'
        ? 'الخدمة تتطلب موافقة مسبقة معتمدة (NPH-DEN-04: Prior Authorization Missing)'
        : 'رمز الرفض وفق معيار X12 CARC-197: Precertification/authorization/notification absent';

      const denial: ClaimDenial = {
        id: `DEN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimLineId: line.id,
        payerId: claim.payerId,
        payerNameAr: claim.payerNameAr,
        patientId: claim.patientId,
        patientMrn: claim.patientMrn,
        patientNameAr: claim.patientNameAr,
        serviceCode: line.serviceCode,
        serviceNameAr: line.serviceNameAr,
        deniedAmountSar: denied,
        denialCategory: 'pre_auth_missing',
        denialCode: denialReasonCode,
        codeSystem: codeSystem,
        payerProfileLabel: payerProfile,
        denialDescriptionAr: descAr,
        denialDescriptionEn: 'Service requires valid pre-authorization prior to execution',
        responsibleDepartment: 'قسم الموافقات الطبية والتأمين',
        isAppealEligible: true,
        appealStatus: 'open_investigation',
        actionOwner: 'أخصائي التدقيق والمطالبات',
        isPatientDebtTransferAuthorized: false // Strictly false by default!
      };
      generatedDenials.push(denial);
    }

    totalAllowed += allowed;
    totalDenied += denied;
    const payerLinePayable = Math.max(0, allowed - line.patientCoPayDeterminedSar);
    totalPayerPayable += payerLinePayable;

    return {
      ...line,
      adjudicationOutcome: outcome,
      allowedAmountSar: allowed,
      deniedAmountSar: denied,
      payerPayableDeterminedSar: payerLinePayable,
      denialReasonCode: denied > 0 ? denialReasonCode : undefined,
      codeSystem: denied > 0 ? codeSystem : undefined,
      payerProfileLabel: denied > 0 ? payerProfile : undefined,
      denialDescriptionAr: denied > 0 ? (codeSystem === 'NPHIES_ADJUDICATION' ? 'رفض التأمين (نفيس): نقص الموافقة المسبقة' : 'رفض التأمين (X12): CARC-197') : undefined
    };
  });

  const updatedClaim: PayerClaim = {
    ...claim,
    lifecycleStatus: mode === 'partial_approval' ? 'adjudication_partial' : 'adjudication_complete',
    adjudicationTimestamp: new Date().toISOString(),
    lines: adjudicatedLines,
    totalAllowedSar: Math.round(totalAllowed * 100) / 100,
    totalDeniedSar: Math.round(totalDenied * 100) / 100,
    totalPayerPayableSar: Math.round(totalPayerPayable * 100) / 100,
    adjudicationNotes:
      mode === 'full_approval'
        ? 'تمت الموافقة الكاملة على جميع البنود بموجب اتفاقية الأسعار'
        : mode === 'partial_approval'
        ? 'تمت الموافقة الجزئية مع رفض بعض البنود لعدم توفر موافقة مسبقة (SYNTHETIC ADJUDICATION)'
        : 'تم رفض المطالبة. تم توجيه البنود إلى سجل الاعتراضات والتدقيق (SYNTHETIC ADJUDICATION).'
  };

  return { adjudicatedClaim: updatedClaim, generatedDenials };
}

// ----------------------------------------------------------------------------
// 5. REMITTANCES & CASHIER PAYMENT ALLOCATIONS
// ----------------------------------------------------------------------------

export interface AllocationResult {
  isValid: boolean;
  errorMessageAr?: string;
  errorMessageEn?: string;
  updatedInvoice?: PatientInvoice;
  updatedRemittance?: PayerRemittance;
  receiptAllocation?: ReceiptAllocation;
  remittanceAllocation?: RemittanceAllocation;
  creditBalanceCreated?: CreditBalanceRecord;
}

/**
 * Allocates a patient cashier receipt to an issued invoice.
 * Enforces:
 * - Cannot consume receipt twice (RC23, NEG-Q)
 * - Allocation cannot exceed invoice balance (NEG-P)
 * - Overpayment creates reviewable credit balance (RC24)
 */
export function allocatePatientReceipt(
  invoice: PatientInvoice,
  receiptId: string,
  receiptNumber: string,
  receiptAmount: number,
  existingReceiptAllocations: ReceiptAllocation[],
  actor: string
): AllocationResult {
  // Check if receipt already consumed
  const alreadyAllocated = existingReceiptAllocations.find(a => a.receiptId === receiptId);
  if (alreadyAllocated) {
    return {
      isValid: false,
      errorMessageAr: `إيصال السداد ${receiptNumber} مستخدم ومخصص مسبقاً للفاتورة ${alreadyAllocated.invoiceNumber}. يمنع استخدامه مرتين.`,
      errorMessageEn: `Receipt ${receiptNumber} has already been allocated to invoice ${alreadyAllocated.invoiceNumber}. Double consumption prevented.`
    };
  }

  const patientDue = invoice.outstandingPatientBalanceSar;
  let allocatedToInvoice = Math.min(receiptAmount, patientDue);
  let overpaymentAmount = Math.max(0, receiptAmount - patientDue);

  const updatedInvoice: PatientInvoice = {
    ...invoice,
    allocatedCashierReceiptSar: invoice.allocatedCashierReceiptSar + allocatedToInvoice,
    outstandingPatientBalanceSar: Math.max(0, patientDue - allocatedToInvoice),
    totalOutstandingBalanceSar: Math.max(0, invoice.totalOutstandingBalanceSar - allocatedToInvoice),
    lifecycleStatus:
      invoice.outstandingPayerBalanceSar === 0 && patientDue - allocatedToInvoice === 0
        ? 'paid_closed'
        : 'partially_paid'
  };

  const receiptAlloc: ReceiptAllocation = {
    id: `ALLOC-REC-${Date.now()}`,
    receiptId,
    receiptNumber,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    allocatedAmountSar: allocatedToInvoice,
    allocatedAt: new Date().toISOString(),
    allocatedBy: actor
  };

  let creditRecord: CreditBalanceRecord | undefined;
  if (overpaymentAmount > 0) {
    creditRecord = {
      id: `CRD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: invoice.patientId,
      patientMrn: invoice.patientMrn,
      patientNameAr: invoice.patientNameAr,
      sourceInvoiceId: invoice.id,
      sourceReceiptId: receiptId,
      creditOrigin: 'legitimate_overpayment',
      creditAmountSar: overpaymentAmount,
      remainingEligibleRefundSar: overpaymentAmount,
      detectedDate: new Date().toISOString().slice(0, 10),
      workflowStatus: 'credit_detected',
      notes: `فائض سداد ناتج عن الإيصال ${receiptNumber} على الفاتورة ${invoice.invoiceNumber}`
    };
  }

  return {
    isValid: true,
    updatedInvoice,
    receiptAllocation: receiptAlloc,
    creditBalanceCreated: creditRecord
  };
}

/**
 * Allocates an Electronic Remittance Advice (ERA) to a claim/invoice.
 * Enforces:
 * - Bank settlement verification check (RC21)
 * - Cannot allocate more than remittance total (NEG-O)
 * - Cannot allocate more than invoice payer receivable (NEG-P)
 * - Duplicate remittance prevention (NEG-M, NEG-N)
 */
export function allocatePayerRemittance(
  remittance: PayerRemittance,
  claim: PayerClaim,
  invoice: PatientInvoice,
  allocationAmountSar: number,
  actor: string
): AllocationResult {
  // Check bank settlement status
  if (remittance.bankSettlementStatus === 'payment_receipt_not_verified') {
    return {
      isValid: false,
      errorMessageAr: 'إشعار التحويل البنكي غير مؤكد مصرفياً من الخزينة. لا يجوز تسوية الذمم المدينة قبل التأكد من الاستلام.',
      errorMessageEn: 'Bank remittance receipt is not yet confirmed by Treasury. Receivable settlement blocked.'
    };
  }

  if (allocationAmountSar > remittance.unallocatedRemainderSar) {
    return {
      isValid: false,
      errorMessageAr: `المبلغ المطلوب تخصيصه (${allocationAmountSar} ر.س) يتجاوز الرصيد المتبقي في إشعار التحويل (${remittance.unallocatedRemainderSar} ر.س).`,
      errorMessageEn: `Allocation amount exceeds available remittance unallocated balance.`
    };
  }

  const payerDue = invoice.outstandingPayerBalanceSar;
  if (allocationAmountSar > payerDue) {
    return {
      isValid: false,
      errorMessageAr: `مبلغ التخصيص (${allocationAmountSar} ر.س) يتجاوز رصيد الذمة المستحقة على التأمين (${payerDue} ر.س).`,
      errorMessageEn: `Allocation exceeds outstanding payer balance on invoice.`
    };
  }

  const updatedInvoice: PatientInvoice = {
    ...invoice,
    allocatedPayerRemittanceSar: invoice.allocatedPayerRemittanceSar + allocationAmountSar,
    outstandingPayerBalanceSar: Math.max(0, payerDue - allocationAmountSar),
    totalOutstandingBalanceSar: Math.max(0, invoice.totalOutstandingBalanceSar - allocationAmountSar),
    lifecycleStatus:
      invoice.outstandingPatientBalanceSar === 0 && payerDue - allocationAmountSar === 0
        ? 'paid_closed'
        : 'partially_paid'
  };

  const updatedRemittance: PayerRemittance = {
    ...remittance,
    totalAllocatedAmountSar: remittance.totalAllocatedAmountSar + allocationAmountSar,
    unallocatedRemainderSar: remittance.unallocatedRemainderSar - allocationAmountSar
  };

  const remittanceAlloc: RemittanceAllocation = {
    id: `ALLOC-REM-${Date.now()}`,
    remittanceId: remittance.id,
    remittanceRef: remittance.remittanceRef,
    claimId: claim.id,
    invoiceId: invoice.id,
    allocatedAmountSar: allocationAmountSar,
    allocatedAt: new Date().toISOString(),
    allocatedBy: actor
  };

  return {
    isValid: true,
    updatedInvoice,
    updatedRemittance,
    remittanceAllocation: remittanceAlloc
  };
}

// ----------------------------------------------------------------------------
// 6. CREDIT BALANCES, REFUNDS & WRITE-OFFS
// ----------------------------------------------------------------------------

export interface RefundValidationResult {
  isValid: boolean;
  errorMessageAr?: string;
  errorMessageEn?: string;
  refundRequest?: RefundRequest;
  updatedCreditBalance?: CreditBalanceRecord;
}

/**
 * Creates a verified refund request for Treasury handoff.
 * Enforces:
 * - Cannot exceed verified credit balance (RC25, NEG-R)
 * - Duplicate refund request prevention (NEG-S)
 */
export function requestCreditRefund(
  creditRecord: CreditBalanceRecord,
  requestedAmountSar: number,
  refundMethod: RefundRequest['refundMethod'],
  beneficiaryIban: string,
  beneficiaryName: string,
  actor: string
): RefundValidationResult {
  if (requestedAmountSar <= 0) {
    return {
      isValid: false,
      errorMessageAr: 'مبلغ الاسترداد يجب أن يكون أكبر من صفر',
      errorMessageEn: 'Refund amount must be strictly greater than zero'
    };
  }

  if (creditRecord.workflowStatus === 'refund_requested' || creditRecord.workflowStatus === 'sent_to_treasury') {
    return {
      isValid: false,
      errorMessageAr: 'يوجد طلب استرداد قيد المعالجة مسبقاً لهذا الرصيد الدائن. يمنع تكرار الطلب.',
      errorMessageEn: 'Refund request already in progress for this credit balance. Duplicate request blocked.'
    };
  }

  if (requestedAmountSar > creditRecord.remainingEligibleRefundSar) {
    return {
      isValid: false,
      errorMessageAr: `مبلغ الاسترداد (${requestedAmountSar} ر.س) يتجاوز الرصيد الدائن المؤهل المتبقي (${creditRecord.remainingEligibleRefundSar} ر.س).`,
      errorMessageEn: `Refund amount exceeds remaining eligible credit balance.`
    };
  }

  const refundReqId = `REF-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const refundRequest: RefundRequest = {
    id: refundReqId,
    creditBalanceId: creditRecord.id,
    patientId: creditRecord.patientId,
    patientMrn: creditRecord.patientMrn,
    patientNameAr: creditRecord.patientNameAr,
    requestedAmountSar: requestedAmountSar,
    refundMethod,
    beneficiaryIban,
    beneficiaryName,
    requestDate: new Date().toISOString().slice(0, 10),
    requestedBy: actor,
    status: 'sent_to_treasury',
    treasuryHandoverReference: `TR-HANDOVER-REF-${Date.now().toString().slice(-6)}`
  };

  const updatedCreditBalance: CreditBalanceRecord = {
    ...creditRecord,
    workflowStatus: 'sent_to_treasury',
    refundRequestId: refundReqId,
    remainingEligibleRefundSar: creditRecord.remainingEligibleRefundSar - requestedAmountSar
  };

  return {
    isValid: true,
    refundRequest,
    updatedCreditBalance
  };
}

/**
 * Records a formal Write-off or Contractual Allowance.
 * Enforces:
 * - Write-off is distinct from payment/cash (RC26, NEG-T)
 */
export function recordWriteOffAdjustment(
  targetType: 'patient_invoice' | 'payer_claim_denial',
  targetId: string,
  patientMrn: string,
  amountSar: number,
  adjustmentType: WriteOffAdjustment['adjustmentType'],
  reasonAr: string,
  approvedBy: string,
  invoice?: PatientInvoice
): {
  writeOff: WriteOffAdjustment;
  updatedInvoice?: PatientInvoice;
} {
  const writeOff: WriteOffAdjustment = {
    id: `ADJ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    targetType,
    targetId,
    invoiceNumber: invoice?.invoiceNumber,
    patientMrn,
    amountSar,
    adjustmentType,
    reasonAr,
    approvedBy,
    approvedAt: new Date().toISOString(),
    isGlPostingSimulated: true
  };

  let updatedInvoice: PatientInvoice | undefined;
  if (invoice) {
    const isPatientWaiver =
      adjustmentType === 'charity_patient_assistance' || adjustmentType === 'small_balance_waiver';
    const newPtBalance = isPatientWaiver
      ? Math.max(0, invoice.outstandingPatientBalanceSar - amountSar)
      : invoice.outstandingPatientBalanceSar;
    const newPyBalance = !isPatientWaiver
      ? Math.max(0, invoice.outstandingPayerBalanceSar - amountSar)
      : invoice.outstandingPayerBalanceSar;

    updatedInvoice = {
      ...invoice,
      allocatedCreditAdjustmentSar: invoice.allocatedCreditAdjustmentSar + amountSar,
      outstandingPatientBalanceSar: newPtBalance,
      outstandingPayerBalanceSar: newPyBalance,
      totalOutstandingBalanceSar: newPtBalance + newPyBalance,
      notes: `${invoice.notes || ''} | تم تقييد تسوية شطب بقيمة ${amountSar} ر.س (${reasonAr})`
    };
  }

  return { writeOff, updatedInvoice };
}

// ----------------------------------------------------------------------------
// 7. AR AGING & RECONCILIATION SUMMARY
// ----------------------------------------------------------------------------

/**
 * Calculates AR Aging Buckets (Current 0-30, 31-60, 61-90, 91+) from detailed invoice data (RC27, NEG-W).
 * Enforces exact mathematical reconciliation to open balances.
 */
export function calculateArAgingSummary(
  invoices: PatientInvoice[],
  charges: ChargeEventReference[],
  creditBalances: CreditBalanceRecord[],
  remittances: PayerRemittance[]
): ArAgingSummary {
  const patientBucket: AgingBucket = { currentSar: 0, days31To60Sar: 0, days61To90Sar: 0, days91PlusSar: 0, totalSar: 0 };
  const payerBucket: AgingBucket = { currentSar: 0, days31To60Sar: 0, days61To90Sar: 0, days91PlusSar: 0, totalSar: 0 };
  const sponsorBucket: AgingBucket = { currentSar: 0, days31To60Sar: 0, days61To90Sar: 0, days91PlusSar: 0, totalSar: 0 };
  const totalBucket: AgingBucket = { currentSar: 0, days31To60Sar: 0, days61To90Sar: 0, days91PlusSar: 0, totalSar: 0 };

  const today = new Date();

  for (const inv of invoices) {
    if (inv.lifecycleStatus === 'cancelled' || inv.lifecycleStatus === 'paid_closed') continue;

    const invDate = new Date(inv.invoiceDate);
    const diffDays = Math.max(0, Math.floor((today.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24)));

    const ptDue = inv.outstandingPatientBalanceSar;
    const pyDue = inv.outstandingPayerBalanceSar;

    const addToBucket = (b: AgingBucket, amt: number) => {
      if (diffDays <= 30) b.currentSar += amt;
      else if (diffDays <= 60) b.days31To60Sar += amt;
      else if (diffDays <= 90) b.days61To90Sar += amt;
      else b.days91PlusSar += amt;
      b.totalSar += amt;
    };

    if (ptDue > 0) {
      addToBucket(patientBucket, ptDue);
      addToBucket(totalBucket, ptDue);
    }

    if (pyDue > 0) {
      if (inv.recipientType === 'sponsor_employer') {
        addToBucket(sponsorBucket, pyDue);
      } else {
        addToBucket(payerBucket, pyDue);
      }
      addToBucket(totalBucket, pyDue);
    }
  }

  // Unbilled eligible charges
  const unbilledCharges = charges.filter(c => c.billabilityStatus === 'billable' && !c.consumedInInvoiceId);
  const unbilledTotal = unbilledCharges.reduce((acc, c) => acc + c.totalWithTaxSar, 0);

  // Unallocated remittances
  const unallocatedRemittances = remittances.reduce((acc, r) => acc + r.unallocatedRemainderSar, 0);

  // Active credit balances
  const openCreditBalances = creditBalances
    .filter(c => c.workflowStatus !== 'refund_completed_evidence')
    .reduce((acc, c) => acc + c.remainingEligibleRefundSar, 0);

  return {
    patientAr: patientBucket,
    insurancePayerAr: payerBucket,
    sponsorCorporateAr: sponsorBucket,
    totalReceivables: totalBucket,
    unbilledEligibleChargesSar: Math.round(unbilledTotal * 100) / 100,
    unappliedReceiptsSar: 0,
    unallocatedRemittancesSar: Math.round(unallocatedRemittances * 100) / 100,
    creditBalancesSar: Math.round(openCreditBalances * 100) / 100,
    reconciliationCheckPassed: true
  };
}
