// ============================================================================
// HEALTHCARE FINANCE & ACCOUNTS PAYABLE (AP) BUSINESS STATE ENGINE
// PURE DETERMINISTIC STATE TRANSITIONS - NO EXTERNAL MUTATION
// ============================================================================

import { 
  SupplierInvoice, 
  SupplierCreditNote, 
  HospitalDebitNote,
  PrepaymentRecord, 
  PaymentProposalBatch, 
  SupplierFinancialOverlay,
  MatchingPolicy,
  SyntheticFxRate,
  InvoiceHoldRecord
} from '../types/accountsPayable';

export interface ApMasterState {
  invoices: SupplierInvoice[];
  creditNotes: SupplierCreditNote[];
  debitNotes: HospitalDebitNote[];
  prepayments: PrepaymentRecord[];
  paymentBatches: PaymentProposalBatch[];
  supplierOverlays: SupplierFinancialOverlay[];
  fxRates: SyntheticFxRate[];
  matchingPolicies: Record<string, MatchingPolicy>;
  effectiveClockDate: string; // e.g. "2026-09-21"
}

// ----------------------------------------------------------------------------
// 1. INVOICE INTAKE & DUPLICATE VALIDATION ENGINE
// ----------------------------------------------------------------------------

export interface InvoiceValidationResult {
  isValid: boolean;
  errors: string[];
  duplicateSuspected: boolean;
  duplicateMessageAr?: string;
}

export function validateIncomingSupplierInvoice(
  draft: Partial<SupplierInvoice>,
  existingInvoices: SupplierInvoice[]
): InvoiceValidationResult {
  const errors: string[] = [];

  if (!draft.supplierId) {
    errors.push('يجب اختيار المورد التجاري المعتمد.');
  }
  if (!draft.invoiceNumber || !draft.invoiceNumber.trim()) {
    errors.push('رقم فاتورة المورد إلزامي.');
  }
  if (!draft.invoiceDate) {
    errors.push('تاريخ إصدار الفاتورة إلزامي.');
  }
  if (!draft.lines || draft.lines.length === 0) {
    errors.push('يجب إدراج بند مالي واحد على الأقل في الفاتورة.');
  }

  // Duplicate Check: Same Supplier + Same Normalized Invoice Number
  const normalizedNumber = (draft.invoiceNumber || '').trim().toLowerCase();
  const existingDup = existingInvoices.find(
    inv => inv.supplierId === draft.supplierId &&
           inv.invoiceNumber.trim().toLowerCase() === normalizedNumber &&
           inv.id !== draft.id &&
           inv.documentStatus !== 'voided'
  );

  let duplicateSuspected = false;
  let duplicateMessageAr: string | undefined;

  if (existingDup) {
    duplicateSuspected = true;
    duplicateMessageAr = `تم رصد فاتورة مسجلة مسبقاً لنفس المورد بالرقم (${existingDup.invoiceNumber}) وتاريخ (${existingDup.invoiceDate}) بمبلغ (${Number(existingDup.grossTotalAmount || 0).toLocaleString()} ${existingDup.originalCurrency || 'SAR'}).`;
    errors.push(duplicateMessageAr);
  }

  return {
    isValid: errors.length === 0,
    errors,
    duplicateSuspected,
    duplicateMessageAr
  };
}

// ----------------------------------------------------------------------------
// 2. MATCHING & VARIANCE EVALUATION (2-WAY / 3-WAY / QA / SERVICE)
// ----------------------------------------------------------------------------

export interface LineMatchingEvaluation {
  lineMatchingResult: 'exact_match' | 'within_tolerance' | 'price_variance' | 'qty_variance' | 'unmatched';
  priceVariancePercent: number;
  holdsToPlace: InvoiceHoldRecord[];
  notesAr: string;
}

export function evaluateLineMatching(
  invoicedQty: number,
  invoicedPrice: number,
  poOrderedQty?: number,
  poPrice?: number,
  grnReceivedQty?: number,
  grnAcceptedQty?: number,
  alreadyConsumedReceiptQty = 0,
  policy: MatchingPolicy = {
    policyProfile: 'three_way_po_grn',
    priceTolerancePercent: 2.0,
    priceToleranceAmountCapSar: 100.0,
    quantityTolerancePercent: 0,
    requiresQaAcceptance: false,
    policySource: 'Default Standard'
  }
): LineMatchingEvaluation {
  const holds: InvoiceHoldRecord[] = [];
  let result: 'exact_match' | 'within_tolerance' | 'price_variance' | 'qty_variance' | 'unmatched' = 'exact_match';
  let priceVariancePercent = 0;
  const notes: string[] = [];

  // 1. Price Matching against PO
  if (poPrice !== undefined && poPrice > 0) {
    const diff = invoicedPrice - poPrice;
    priceVariancePercent = (diff / poPrice) * 100;

    if (diff > 0) {
      const allowedCapExceeded = diff * invoicedQty > policy.priceToleranceAmountCapSar;
      if (priceVariancePercent > policy.priceTolerancePercent || (policy.priceToleranceAmountCapSar > 0 && allowedCapExceeded)) {
        result = 'price_variance';
        holds.push({
          id: `HOLD-PRC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          holdType: 'price_variance',
          reasonAr: `فارق سعر الوحدة (${priceVariancePercent.toFixed(2)}%) يتجاوز سقف التسامح المعتمد (${policy.priceTolerancePercent}%).`,
          reasonEn: `Unit price variance ${priceVariancePercent.toFixed(2)}% exceeds tolerance ${policy.priceTolerancePercent}%.`,
          placedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          placedBy: 'AP Matching Engine',
          isResolved: false
        });
        notes.push(`فارق سعر (+${priceVariancePercent.toFixed(2)}%)`);
      } else {
        result = 'within_tolerance';
        notes.push(`فارق سعر مقبول ضمن التسامح (+${priceVariancePercent.toFixed(2)}%)`);
      }
    }
  } else if ((policy.policyProfile === 'two_way_po_price' || policy.policyProfile === 'three_way_po_grn' || policy.policyProfile === 'three_way_po_grn_qa_accepted') && poPrice === undefined) {
    // Missing PO Price - do not coerce to zero!
    result = 'unmatched';
    notes.push('سعر أمر الشراء غير متوفر (PO Price Missing)');
  }

  // 2. Quantity Matching against GRN
  if (policy.policyProfile === 'three_way_po_grn' || policy.policyProfile === 'three_way_po_grn_qa_accepted') {
    if (grnReceivedQty === undefined) {
      // Receipt has not arrived yet - do not coerce to zero!
      result = 'unmatched';
      holds.push({
        id: `HOLD-GRN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        holdType: 'missing_receipt',
        reasonAr: 'سند استلام البضاعة بالمستودع (GRN) غير متوفر؛ لا يمكن مطابقة الفاتورة الثلاثية قبل استلام الشحنة وتفريغها (AP09).',
        reasonEn: 'Goods receipt note (GRN) is missing; 3-way matching cannot proceed prior to warehouse receipt.',
        placedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        placedBy: 'AP Matching Engine',
        isResolved: false
      });
      notes.push('سند الاستلام غير متوفر (Missing GRN)');
    } else {
      const baseAvailable = policy.requiresQaAcceptance 
        ? (grnAcceptedQty ?? 0)
        : grnReceivedQty;

      const matchableAvailable = Math.max(0, baseAvailable - alreadyConsumedReceiptQty);

      if (invoicedQty > matchableAvailable) {
        result = 'qty_variance';
        holds.push({
          id: `HOLD-QTY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          holdType: 'quantity_overbilling',
          reasonAr: `الكمية المفوترة (${invoicedQty}) تتجاوز الرصيد المستلم والمتاح للمطابقة (${matchableAvailable}).`,
          reasonEn: `Invoiced qty ${invoicedQty} exceeds available matchable receipt qty ${matchableAvailable}.`,
          placedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          placedBy: 'AP Matching Engine',
          isResolved: false
        });
        notes.push(`كمية مفوترة زائدة (${invoicedQty} > ${matchableAvailable})`);
      }

      if (policy.requiresQaAcceptance && grnReceivedQty > (grnAcceptedQty ?? 0)) {
        const rejected = grnReceivedQty - (grnAcceptedQty ?? 0);
        holds.push({
          id: `HOLD-QA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          holdType: 'qa_inspection_pending',
          reasonAr: `توجد أصناف مرفوضة أو معزولة بالحجر رقابياً (${rejected} وحدة)؛ لا يجوز اعتماد السداد للبضائع غير المقبولة.`,
          reasonEn: `QA rejected/quarantined units (${rejected}) detected; rejected goods cannot be cleared for payment.`,
          placedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          placedBy: 'AP Matching Engine',
          isResolved: false
        });
        notes.push(`أصناف مرفوضة من الجودة (${rejected})`);
      }
    }
  }

  return {
    lineMatchingResult: result,
    priceVariancePercent: Math.round(priceVariancePercent * 100) / 100,
    holdsToPlace: holds,
    notesAr: notes.join(' | ') || 'مطابقة نظامية كاملة'
  };
}

// ----------------------------------------------------------------------------
// 3. INVOICE LIFECYCLE TRANSITIONS
// ----------------------------------------------------------------------------

export function returnInvoiceForCorrection(
  invoice: SupplierInvoice,
  reasonAr: string,
  staffName: string
): SupplierInvoice {
  return {
    ...invoice,
    documentStatus: 'returned_for_correction',
    approvalStatus: 'returned_for_correction',
    settlementStatus: 'on_hold',
    correctionNotesAr: reasonAr,
    notes: `${invoice.notes || ''}\n[إعادة للتصحيح بواسطة ${staffName} في ${new Date().toISOString().replace('T', ' ').substring(0, 16)}]: ${reasonAr}`,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
}

export function releaseInvoiceHold(
  invoice: SupplierInvoice,
  holdId: string,
  justificationAr: string,
  staffName: string
): SupplierInvoice {
  const updatedHolds = invoice.activeHolds.map(h => {
    if (h.id === holdId) {
      return {
        ...h,
        isResolved: true,
        resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        resolvedBy: staffName,
        resolutionJustificationAr: justificationAr
      };
    }
    return h;
  });

  const remainingActiveHolds = updatedHolds.filter(h => !h.isResolved);
  const isNowEligibleForApproval = remainingActiveHolds.length === 0;

  return {
    ...invoice,
    activeHolds: updatedHolds,
    matchingStatus: isNowEligibleForApproval ? 'resolved' : invoice.matchingStatus,
    settlementStatus: isNowEligibleForApproval && invoice.approvalStatus === 'approved' ? 'eligible' : invoice.settlementStatus,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
}

export function approveInvoice(
  invoice: SupplierInvoice,
  staffId: string,
  staffName: string,
  comments?: string
): { success: boolean; updatedInvoice: SupplierInvoice; errorMessage?: string } {
  // Guard: Cannot approve if unresolved mandatory holds exist
  const unresolvedHolds = invoice.activeHolds.filter(h => !h.isResolved);
  if (unresolvedHolds.length > 0) {
    return {
      success: false,
      updatedInvoice: invoice,
      errorMessage: `لا يمكن اعتماد الفاتورة لوجود (${unresolvedHolds.length}) حجوزات رقابية معلقة تتطلب التسوية أولاً.`
    };
  }

  // Guard: If foreign currency, FX must be populated
  if (invoice.originalCurrency !== 'SAR' && (!invoice.fxExchangeRate || invoice.fxExchangeRate <= 0)) {
    return {
      success: false,
      updatedInvoice: invoice,
      errorMessage: 'لا يمكن اعتماد الفاتورة قبل تحديد سعر الصرف الرسمي وتقييم الالتزام بالريال السعودي.'
    };
  }

  const updated: SupplierInvoice = {
    ...invoice,
    approvalStatus: 'approved',
    settlementStatus: invoice.postingStatus === 'simulated_posted' ? 'eligible' : 'not_eligible',
    approvalRecord: {
      approvedByStaffId: staffId,
      approvedByStaffName: staffName,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      comments
    },
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  return { success: true, updatedInvoice: updated };
}

export function recordSyntheticVoucherPosting(
  invoice: SupplierInvoice,
  debitAccountCode: string,
  creditAccountCode: string,
  staffName: string
): SupplierInvoice {
  const voucherNum = `VCHR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    ...invoice,
    postingStatus: 'simulated_posted',
    settlementStatus: invoice.approvalStatus === 'approved' ? 'eligible' : invoice.settlementStatus,
    syntheticVoucherRecord: {
      voucherNumber: voucherNum,
      postedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      debitAccountCode,
      creditAccountCode,
      simulatedBy: staffName
    },
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
}

// ----------------------------------------------------------------------------
// 4. CREDIT NOTE & PREPAYMENT APPLICATION ENGINE
// ----------------------------------------------------------------------------

export function applyCreditNoteToInvoice(
  creditNote: SupplierCreditNote,
  invoice: SupplierInvoice,
  amountToApplySar: number
): { success: boolean; updatedCreditNote: SupplierCreditNote; updatedInvoice: SupplierInvoice; errorMessage?: string } {
  if (amountToApplySar <= 0) {
    return { success: false, updatedCreditNote: creditNote, updatedInvoice: invoice, errorMessage: 'يجب أن يكون مبلغ الإشعار الدائن المراد تسويته أكبر من الصفر.' };
  }

  if (amountToApplySar > creditNote.remainingUnappliedAmountSar) {
    return { 
      success: false, 
      updatedCreditNote: creditNote, 
      updatedInvoice: invoice, 
      errorMessage: `المبلغ المطلوب تطبيقه (${amountToApplySar} ريال) يتجاوز الرصيد المتاح من الإشعار الدائن (${creditNote.remainingUnappliedAmountSar} ريال).` 
    };
  }

  if (amountToApplySar > invoice.remainingPayableBalanceSar) {
    return {
      success: false,
      updatedCreditNote: creditNote,
      updatedInvoice: invoice,
      errorMessage: `المبلغ المطلوب تطبيقه (${amountToApplySar} ريال) يتجاوز صافي رصيد الفاتورة المستحق (${invoice.remainingPayableBalanceSar} ريال).`
    };
  }

  // Update Credit Note
  const newCreditApplied = creditNote.appliedAmountSar + amountToApplySar;
  const newCreditRemaining = creditNote.totalCreditAmountSar - newCreditApplied;
  const updatedCredit: SupplierCreditNote = {
    ...creditNote,
    appliedAmountSar: newCreditApplied,
    remainingUnappliedAmountSar: newCreditRemaining,
    status: newCreditRemaining === 0 ? 'fully_applied' : 'partially_applied',
    appliedToInvoices: [
      ...creditNote.appliedToInvoices,
      {
        targetInvoiceId: invoice.id,
        targetInvoiceNumber: invoice.invoiceNumber,
        amountAppliedSar: amountToApplySar,
        appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    ]
  };

  // Update Invoice
  const newInvoiceCredits = invoice.appliedCreditNotesSar + amountToApplySar;
  const newInvoiceRemaining = Math.max(0, invoice.convertedGrossTotalSar - (newInvoiceCredits + invoice.appliedPrepaymentsSar + invoice.settledPaymentsSar));
  const updatedInv: SupplierInvoice = {
    ...invoice,
    appliedCreditNotesSar: newInvoiceCredits,
    remainingPayableBalanceSar: newInvoiceRemaining,
    settlementStatus: newInvoiceRemaining === 0 ? 'fully_settled' : 'partially_settled',
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  return { success: true, updatedCreditNote: updatedCredit, updatedInvoice: updatedInv };
}

export function applyPrepaymentToInvoice(
  prepayment: PrepaymentRecord,
  invoice: SupplierInvoice,
  amountToDeductSar: number
): { success: boolean; updatedPrepayment: PrepaymentRecord; updatedInvoice: SupplierInvoice; errorMessage?: string } {
  if (prepayment.status === 'authorized_pending_disbursement') {
    return { success: false, updatedPrepayment: prepayment, updatedInvoice: invoice, errorMessage: 'لا يمكن خصم دفعة مقدمة قبل تأكيد صرفها الفعلي من الخزينة.' };
  }

  if (amountToDeductSar <= 0 || amountToDeductSar > prepayment.unappliedBalanceSar) {
    return { success: false, updatedPrepayment: prepayment, updatedInvoice: invoice, errorMessage: `مبلغ الخصم المطلوب (${amountToDeductSar}) غير متاح في رصيد الدفعة المقدمة (${prepayment.unappliedBalanceSar}).` };
  }

  if (amountToDeductSar > invoice.remainingPayableBalanceSar) {
    return { success: false, updatedPrepayment: prepayment, updatedInvoice: invoice, errorMessage: `مبلغ الخصم المطلوب (${amountToDeductSar}) يتجاوز صافي رصيد الفاتورة المستحق (${invoice.remainingPayableBalanceSar}).` };
  }

  // Update Prepayment
  const newPreRemaining = prepayment.unappliedBalanceSar - amountToDeductSar;
  const updatedPre: PrepaymentRecord = {
    ...prepayment,
    unappliedBalanceSar: newPreRemaining,
    status: newPreRemaining === 0 ? 'fully_applied' : 'partially_applied',
    applicationHistory: [
      ...prepayment.applicationHistory,
      {
        appliedToInvoiceId: invoice.id,
        amountDeductedSar: amountToDeductSar,
        appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    ]
  };

  // Update Invoice
  const newInvoicePrepayments = invoice.appliedPrepaymentsSar + amountToDeductSar;
  const newInvoiceRemaining = Math.max(0, invoice.convertedGrossTotalSar - (invoice.appliedCreditNotesSar + newInvoicePrepayments + invoice.settledPaymentsSar));
  const updatedInv: SupplierInvoice = {
    ...invoice,
    appliedPrepaymentsSar: newInvoicePrepayments,
    remainingPayableBalanceSar: newInvoiceRemaining,
    settlementStatus: newInvoiceRemaining === 0 ? 'fully_settled' : 'partially_settled',
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  return { success: true, updatedPrepayment: updatedPre, updatedInvoice: updatedInv };
}

// ----------------------------------------------------------------------------
// 5. PAYMENT PROPOSAL, TREASURY APPROVAL & SYNTHETIC BANK ENGINE
// ----------------------------------------------------------------------------

export function createPaymentBatch(
  batchNumber: string,
  descriptionAr: string,
  selectedInvoices: { invoice: SupplierInvoice; proposedAmountSar: number; overlay?: SupplierFinancialOverlay }[],
  disbursingBankAccountId = 'BANK-SNB-SAR-01',
  existingBatches?: PaymentProposalBatch[]
): { success: boolean; batch?: PaymentProposalBatch; errorMessage?: string } {
  if (selectedInvoices.length === 0) {
    return { success: false, errorMessage: 'يجب اختيار فاتورة واحدة على الأقل لإعداد مقترح السداد.' };
  }

  // Active open batches that hold committed funds (AP24 Dual-Allocation Guard)
  const activeOpenBatches = existingBatches 
    ? existingBatches.filter(b => b.status === 'draft_proposal' || b.status === 'submitted_for_treasury_approval' || b.status === 'approved_for_payment')
    : [];

  // Check invoice eligibility and amounts
  for (const item of selectedInvoices) {
    if (item.proposedAmountSar <= 0) {
      return { success: false, errorMessage: `مبلغ السداد المقترح للفاتورة (${item.invoice.invoiceNumber}) يجب أن يكون أكبر من الصفر.` };
    }

    if (item.proposedAmountSar > item.invoice.remainingPayableBalanceSar) {
      return { success: false, errorMessage: `مبلغ السداد المقترح للفاتورة (${item.invoice.invoiceNumber}) يتجاوز رصيدها المتبقي.` };
    }

    if (item.invoice.originalCurrency !== 'SAR' && (!item.invoice.convertedGrossTotalSar || item.invoice.convertedGrossTotalSar <= 0)) {
      return { success: false, errorMessage: `لا يمكن إدراج فاتورة بالعملة الأجنبية (${item.invoice.originalCurrency}) قبل تقييم رصيدها بالريال السعودي.` };
    }

    // AP24: Prevent double-allocating the same invoice in multiple active batches
    const alreadyCommittedInBatches = activeOpenBatches.reduce((acc, b) => {
      const bItem = b.items.find(bi => bi.invoiceId === item.invoice.id);
      return acc + (bItem ? bItem.proposedPaymentAmountSar : 0);
    }, 0);

    const availableUncommitted = Math.max(0, item.invoice.remainingPayableBalanceSar - alreadyCommittedInBatches);
    if (item.proposedAmountSar > availableUncommitted) {
      const conflictingBatch = activeOpenBatches.find(b => b.items.some(bi => bi.invoiceId === item.invoice.id));
      return {
        success: false,
        errorMessage: `لا يمكن تخصيص الفاتورة (${item.invoice.invoiceNumber}) بمبلغ (${item.proposedAmountSar} ريال)؛ رصيدها مخصص مسبقاً في مقترح سداد نشط (${conflictingBatch?.batchNumber || 'دفعة جارية'}) لمنع الصرف المزدوج (AP24).`
      };
    }
  }

  const items = selectedInvoices.map(({ invoice, proposedAmountSar, overlay }) => ({
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    supplierId: invoice.supplierId,
    supplierNameAr: invoice.supplierNameAr,
    invoiceGrossAmountSar: invoice.convertedGrossTotalSar,
    previouslyPaidAmountSar: invoice.settledPaymentsSar,
    currentPayableBalanceSar: invoice.remainingPayableBalanceSar,
    proposedPaymentAmountSar: proposedAmountSar,
    beneficiaryIbanMasked: overlay?.syntheticIbanMasked || 'SA**-UNVERIFIED',
    isBeneficiaryVerified: overlay?.beneficiaryVerificationStatus === 'verified_active',
    dueDate: invoice.dueDate,
    daysOverdue: 0
  }));

  const totalAmount = items.reduce((acc, curr) => acc + curr.proposedPaymentAmountSar, 0);

  const batch: PaymentProposalBatch = {
    id: `PAY-BATCH-${Date.now()}`,
    batchNumber,
    branchId: 'main_hospital',
    batchDescriptionAr: descriptionAr,
    creationDate: new Date().toISOString().replace('T', ' ').substring(0, 10),
    scheduledDisbursementDate: new Date().toISOString().replace('T', ' ').substring(0, 10),
    disbursingBankAccountId,
    disbursingBankAccountNameAr: 'حساب المدفوعات التشغيلي - البنك الأهلي السعودي (محاكاة)',
    currency: 'SAR',
    totalProposedAmountSar: totalAmount,
    invoicesCount: items.length,
    suppliersCount: new Set(items.map(i => i.supplierId)).size,
    status: 'draft_proposal',
    items
  };

  return { success: true, batch };
}

export function authorizePaymentBatch(
  batch: PaymentProposalBatch,
  treasuryStaffName: string,
  approvalNotesAr?: string
): { success: boolean; updatedBatch: PaymentProposalBatch; errorMessage?: string } {
  // Guard: Cannot authorize if any invoice has unverified beneficiary
  const unverified = batch.items.find(i => !i.isBeneficiaryVerified);
  if (unverified) {
    return {
      success: false,
      updatedBatch: batch,
      errorMessage: `لا يمكن اعتماد الدفعة لوجود مستفيد بحساب بنكي غير موثق: المورد (${unverified.supplierNameAr}).`
    };
  }

  const updated: PaymentProposalBatch = {
    ...batch,
    status: 'approved_for_payment',
    treasuryApprovalRecord: {
      approvedByStaffName: treasuryStaffName,
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      approvalNotesAr
    }
  };

  return { success: true, updatedBatch: updated };
}

export function simulateBankExecution(
  batch: PaymentProposalBatch,
  invoices: SupplierInvoice[],
  outcome: 'cleared_confirmed' | 'rejected_by_bank'
): { updatedBatch: PaymentProposalBatch; updatedInvoices: SupplierInvoice[] } {
  // Guard: Duplicate execution prevention (Duplicate bank confirmation does not pay twice)
  if (batch.status === 'mock_bank_confirmed' || batch.status === 'mock_bank_rejected') {
    return { updatedBatch: batch, updatedInvoices: invoices };
  }

  const isConfirmed = outcome === 'cleared_confirmed';

  const updatedBatch: PaymentProposalBatch = {
    ...batch,
    status: isConfirmed ? 'mock_bank_confirmed' : 'mock_bank_rejected',
    syntheticBankTransmission: {
      instructionReference: `SARIE-${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      mockBankStatus: isConfirmed ? 'cleared_confirmed' : 'rejected_by_bank',
      bankResponseCode: isConfirmed ? 'BANK-OK-SETTLED' : 'BANK-ERR-IBAN-REJECTED',
      bankResponseMessageAr: isConfirmed 
        ? 'تمت التسوية البنكية لمحاكاة صرف الحوالة بنجاح.' 
        : 'تم رفض أمر الدفع من البنك: الحساب البنكي للمستفيد موقوف أو غير مطابق.',
      confirmedDebitTimestamp: isConfirmed ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
      disclaimer: 'Synthetic bank response fixture - no actual money movement'
    }
  };

  // If confirmed, allocate settled amounts to invoices!
  const updatedInvoices = invoices.map(inv => {
    const itemInBatch = batch.items.find(i => i.invoiceId === inv.id);
    if (!itemInBatch) return inv;

    if (!isConfirmed) {
      // On rejection, no money settles!
      return {
        ...inv,
        settlementStatus: 'bank_rejected' as const,
        notes: `${inv.notes || ''}\n[رفض بنكي في ${new Date().toISOString().replace('T', ' ').substring(0, 16)}]: تم رفض التحويل بموجب دفعة ${batch.batchNumber}`
      };
    }

    const newSettled = inv.settledPaymentsSar + itemInBatch.proposedPaymentAmountSar;
    const newRemaining = Math.max(0, inv.convertedGrossTotalSar - (inv.appliedCreditNotesSar + inv.appliedPrepaymentsSar + newSettled));

    return {
      ...inv,
      settledPaymentsSar: newSettled,
      remainingPayableBalanceSar: newRemaining,
      settlementStatus: (newRemaining === 0 ? 'fully_settled' : 'partially_settled') as any,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
  });

  return { updatedBatch, updatedInvoices };
}

// ----------------------------------------------------------------------------
// 6. AP AGING CALCULATIONS (DERIVED COHERENTLY FROM REAL INVOICES)
// ----------------------------------------------------------------------------

export interface ApAgingBucket {
  labelAr: string;
  count: number;
  totalPayableAmountSar: number;
}

export interface ApAgingAnalysis {
  currentUnmatured: ApAgingBucket;
  days1To30: ApAgingBucket;
  days31To60: ApAgingBucket;
  days61To90: ApAgingBucket;
  over90Days: ApAgingBucket;
  totalOutstandingPayableSar: number;
  totalInvoicesCount: number;
}

export function computeApAging(invoices: SupplierInvoice[], referenceDate: string): ApAgingAnalysis {
  const refDateObj = new Date(referenceDate);

  const buckets: ApAgingAnalysis = {
    currentUnmatured: { labelAr: 'فواتير جارية غير مستحقة', count: 0, totalPayableAmountSar: 0 },
    days1To30: { labelAr: 'مستحقة 1 - 30 يوماً', count: 0, totalPayableAmountSar: 0 },
    days31To60: { labelAr: 'مستحقة 31 - 60 يوماً', count: 0, totalPayableAmountSar: 0 },
    days61To90: { labelAr: 'مستحقة 61 - 90 يوماً', count: 0, totalPayableAmountSar: 0 },
    over90Days: { labelAr: 'متأخرة أكثر من 90 يوماً', count: 0, totalPayableAmountSar: 0 },
    totalOutstandingPayableSar: 0,
    totalInvoicesCount: 0
  };

  for (const inv of invoices) {
    if (inv.remainingPayableBalanceSar <= 0 || inv.documentStatus === 'voided' || inv.documentStatus === 'rejected') {
      continue;
    }

    const dueDateObj = new Date(inv.dueDate);
    const diffTime = refDateObj.getTime() - dueDateObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    buckets.totalOutstandingPayableSar += inv.remainingPayableBalanceSar;
    buckets.totalInvoicesCount += 1;

    if (diffDays <= 0) {
      buckets.currentUnmatured.count += 1;
      buckets.currentUnmatured.totalPayableAmountSar += inv.remainingPayableBalanceSar;
    } else if (diffDays <= 30) {
      buckets.days1To30.count += 1;
      buckets.days1To30.totalPayableAmountSar += inv.remainingPayableBalanceSar;
    } else if (diffDays <= 60) {
      buckets.days31To60.count += 1;
      buckets.days31To60.totalPayableAmountSar += inv.remainingPayableBalanceSar;
    } else if (diffDays <= 90) {
      buckets.days61To90.count += 1;
      buckets.days61To90.totalPayableAmountSar += inv.remainingPayableBalanceSar;
    } else {
      buckets.over90Days.count += 1;
      buckets.over90Days.totalPayableAmountSar += inv.remainingPayableBalanceSar;
    }
  }

  return buckets;
}
