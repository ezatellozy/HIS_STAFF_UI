/**
 * Enterprise Procurement State Transition & Validation Engine
 * 
 * Pure functional handlers implementing mathematical and business integrity for:
 * - Purchase Requisition validation, multi-stage approval & revision resubmission
 * - Demand consolidation across multiple PRs with line-level traceability
 * - Sourcing event preparation & supplier qualification gatekeeping
 * - Quotation validation, packaging UOM normalization & currency conversion
 * - Technical evaluation compliance & documented award decision recording
 * - Purchase Order generation, approval, simulated transmission & acknowledgment
 * - PO Amendments with received quantity protection
 * - Inventory receipt handoff reconciliation & supplier claim generation
 * 
 * Date: 2026-09-21
 */

import {
  PurchaseRequisition,
  PurchaseRequisitionLine,
  PurchaseRequisitionStatus,
  RequisitionApprovalRecord,
  SourcingEvent,
  SourcingEventLine,
  SupplierMaster,
  SupplierQuotation,
  QuotationLine,
  BidEvaluationSheet,
  AwardDecisionRecord,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseOrderRevision,
  SupplierClaim,
  SupplierClaimStatus,
  InstitutionalProcurementPolicy,
  ProcurementMethod
} from '../types/procurementOps';
import { ItemMasterRecord } from '../types/supplyChainOps';

// ============================================================================
// 1. REQUISITION VALIDATION & APPROVAL LIFECYCLE
// ============================================================================

export interface CreateRequisitionParams {
  requisitionNumber: string;
  branchId: 'main_hospital' | 'suburban_clinic_branch';
  requestingDepartmentId: string;
  requestingDepartmentNameAr: string;
  requestingDepartmentNameEn: string;
  requesterStaffId: string;
  requesterNameAr: string;
  requesterNameEn: string;
  requesterRoleTitle: string;
  costCenterCode: string;
  budgetStatus: 'funds_available' | 'budget_exhausted' | 'pending_finance_review' | 'not_tracked';
  priority: 'routine' | 'urgent' | 'stat_emergency';
  requiredDate: string;
  businessJustificationAr: string;
  businessJustificationEn: string;
  lines: Omit<PurchaseRequisitionLine, 'id' | 'lineNumber' | 'approvedQuantity' | 'sourcedQuantity' | 'remainingUnsourcedQuantity' | 'sourcingStatus'>[];
  notes?: string;
}

export function validateAndCreatePurchaseRequisition(
  params: CreateRequisitionParams,
  catalogItems: ItemMasterRecord[]
): { success: boolean; requisition?: PurchaseRequisition; error?: string } {
  if (!params.requisitionNumber || !params.requestingDepartmentId || !params.requesterStaffId) {
    return { success: false, error: 'بيانات الطلب الأساسية غير مكتملة (رقم الطلب، القسم، والموظف مطلوبة).' };
  }

  if (!params.lines || params.lines.length === 0) {
    return { success: false, error: 'لا يمكن إنشاء طلب شراء بدون بنود ومستلزمات محددة.' };
  }

  const processedLines: PurchaseRequisitionLine[] = [];
  let totalEstimatedValue = 0;

  for (let idx = 0; idx < params.lines.length; idx++) {
    const rawLine = params.lines[idx];
    if (rawLine.requestedQuantity <= 0) {
      return { success: false, error: `الكمية للبند ${idx + 1} (${rawLine.itemDescriptionAr}) يجب أن تكون أكبر من الصفر.` };
    }

    // Check catalog reference if catalog item
    let internalStockAvailable = 0;
    if (rawLine.itemType === 'catalog_stock' && rawLine.catalogItemId) {
      const matchedCatalog = catalogItems.find(c => c.id === rawLine.catalogItemId);
      if (!matchedCatalog) {
        return { success: false, error: `الصنف المختار للبند ${idx + 1} غير موجود في دليل الأصناف الطبي.` };
      }
    }

    const estimatedTotal = rawLine.requestedQuantity * (rawLine.estimatedUnitPriceSar || 0);
    totalEstimatedValue += estimatedTotal;

    processedLines.push({
      id: `PRL-${params.requisitionNumber}-${idx + 1}`,
      lineNumber: idx + 1,
      itemType: rawLine.itemType,
      catalogItemId: rawLine.catalogItemId,
      itemCode: rawLine.itemCode || 'NON-CATALOG',
      itemDescriptionAr: rawLine.itemDescriptionAr,
      itemDescriptionEn: rawLine.itemDescriptionEn,
      requestedUom: rawLine.requestedUom,
      requestedQuantity: rawLine.requestedQuantity,
      estimatedUnitPriceSar: rawLine.estimatedUnitPriceSar,
      estimatedTotalSar: estimatedTotal,
      requiredDeliveryDate: rawLine.requiredDeliveryDate,
      deliveryLocationId: rawLine.deliveryLocationId,
      suggestedSupplierId: rawLine.suggestedSupplierId,
      costCenterCode: rawLine.costCenterCode || params.costCenterCode,
      notes: rawLine.notes,
      approvedQuantity: 0,
      sourcedQuantity: 0,
      remainingUnsourcedQuantity: 0,
      sourcingStatus: 'unsourced',
      internalStockAvailable: rawLine.internalStockAvailable || 0
    });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const initialApprovalRecord: RequisitionApprovalRecord = {
    id: `APPR-${params.requisitionNumber}-1`,
    stageNameAr: 'مراجعة واعتماد رئيس القسم',
    stageNameEn: 'Department Head Review',
    reviewerRoleId: 'department_head',
    decision: 'pending'
  };

  const newPr: PurchaseRequisition = {
    id: `PR-${params.requisitionNumber}`,
    requisitionNumber: params.requisitionNumber,
    branchId: params.branchId,
    requestingDepartmentId: params.requestingDepartmentId,
    requestingDepartmentNameAr: params.requestingDepartmentNameAr,
    requestingDepartmentNameEn: params.requestingDepartmentNameEn,
    requesterStaffId: params.requesterStaffId,
    requesterNameAr: params.requesterNameAr,
    requesterNameEn: params.requesterNameEn,
    requesterRoleTitle: params.requesterRoleTitle,
    costCenterCode: params.costCenterCode,
    budgetStatus: params.budgetStatus,
    priority: params.priority,
    requiredDate: params.requiredDate,
    businessJustificationAr: params.businessJustificationAr,
    businessJustificationEn: params.businessJustificationEn,
    status: 'submitted_pending_approval',
    lines: processedLines,
    estimatedTotalValueSar: totalEstimatedValue,
    approvalHistory: [initialApprovalRecord],
    createdAt: now,
    updatedAt: now,
    notes: params.notes
  };

  return { success: true, requisition: newPr };
}

export function executeRequisitionApproval(
  requisition: PurchaseRequisition,
  decision: 'approved' | 'rejected' | 'returned_for_revision',
  reviewerStaffNameAr: string,
  comments?: string
): { success: boolean; requisition?: PurchaseRequisition; error?: string } {
  if (requisition.status !== 'submitted_pending_approval') {
    return { success: false, error: `لا يمكن اتخاذ قرار اعتماد على طلب بحالة '${requisition.status}'.` };
  }

  if (decision === 'rejected' && (!comments || comments.trim().length === 0)) {
    return { success: false, error: 'رفض طلب الشراء يتطلب تدوين سبب الرفض بوضوح في الملاحظات.' };
  }

  if (decision === 'returned_for_revision' && (!comments || comments.trim().length === 0)) {
    return { success: false, error: 'إعادة الطلب للتعديل تتطلب توضيح النقاط والملاحظات المطلوب تعديلها.' };
  }

  if (decision === 'approved') {
    if (
      requisition.budgetStatus === 'pending_finance_review' ||
      requisition.budgetStatus === 'budget_exhausted' ||
      (requisition as any).budgetStatus === 'unknown' ||
      !requisition.budgetStatus
    ) {
      return {
        success: false,
        error: `لا يمكن اعتماد طلب الشراء: الموقف المالي للميزانية (${requisition.budgetStatus || 'غير محدد'}) غير مؤكد أو بانتظار إفادة الإدارة المالية (PROC28).`
      };
    }
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const updatedApprovalHistory = requisition.approvalHistory.map(rec => {
    if (rec.decision === 'pending') {
      return {
        ...rec,
        decision,
        decisionTimestamp: now,
        reviewerStaffNameAr,
        comments: comments || rec.comments
      };
    }
    return rec;
  });

  let newStatus: PurchaseRequisitionStatus = requisition.status;
  const updatedLines = requisition.lines.map(line => {
    if (decision === 'approved') {
      return {
        ...line,
        approvedQuantity: line.requestedQuantity,
        remainingUnsourcedQuantity: line.requestedQuantity,
        sourcingStatus: 'unsourced' as const
      };
    }
    return line;
  });

  if (decision === 'approved') {
    newStatus = 'approved';
  } else if (decision === 'rejected') {
    newStatus = 'rejected';
  } else if (decision === 'returned_for_revision') {
    newStatus = 'returned_for_revision';
  }

  return {
    success: true,
    requisition: {
      ...requisition,
      status: newStatus,
      lines: updatedLines,
      approvalHistory: updatedApprovalHistory,
      updatedAt: now
    }
  };
}

export function executeRequisitionRevisionResubmit(
  requisition: PurchaseRequisition,
  modifiedLines: PurchaseRequisitionLine[],
  resubmitterStaffNameAr: string
): { success: boolean; requisition?: PurchaseRequisition; error?: string } {
  if (requisition.status !== 'returned_for_revision') {
    return { success: false, error: 'لا يمكن إعادة تقديم إلا الطلبات المعادة للتعديل.' };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  let newTotal = 0;
  for (const line of modifiedLines) {
    newTotal += line.requestedQuantity * line.estimatedUnitPriceSar;
  }

  const newApprovalStage: RequisitionApprovalRecord = {
    id: `APPR-${requisition.requisitionNumber}-${requisition.approvalHistory.length + 1}`,
    stageNameAr: 'إعادة مراجعة بعد التعديل',
    stageNameEn: 'Review After Revision',
    reviewerRoleId: 'department_head',
    decision: 'pending'
  };

  return {
    success: true,
    requisition: {
      ...requisition,
      status: 'submitted_pending_approval',
      lines: modifiedLines.map(l => ({ ...l, estimatedTotalSar: l.requestedQuantity * l.estimatedUnitPriceSar })),
      estimatedTotalValueSar: newTotal,
      approvalHistory: [...requisition.approvalHistory, newApprovalStage],
      updatedAt: now
    }
  };
}

// ============================================================================
// 2. SOURCING CONSOLIDATION & SOURCING EVENTS
// ============================================================================

export interface SourcingCandidateLine {
  sourceRequisitionId: string;
  sourceRequisitionLineId: string;
  allocateQuantity: number;
}

export function validateAndConsolidateDemand(
  requisitions: PurchaseRequisition[],
  selectedLines: SourcingCandidateLine[],
  sourcingTitleAr: string,
  sourcingTitleEn: string,
  method: ProcurementMethod,
  category: any,
  submissionDeadline: string,
  responsibleBuyerStaffId: string,
  responsibleBuyerNameAr: string,
  isEmergency?: boolean,
  emergencyJustification?: string
): {
  success: boolean;
  updatedRequisitions?: PurchaseRequisition[];
  sourcingEvent?: SourcingEvent;
  error?: string;
  errorMessageAr?: string;
} {
  if (!selectedLines || selectedLines.length === 0) {
    return { success: false, error: 'يجب اختيار بند أو أكثر من الطلبات المعتمدة لتجميع الاحتياج.', errorMessageAr: 'يجب اختيار بند أو أكثر من الطلبات المعتمدة لتجميع الاحتياج.' };
  }

  // Pre-validate all allocations against current available unsourced quantity
  for (const item of selectedLines) {
    const pr = requisitions.find(r => r.id === item.sourceRequisitionId);
    if (!pr) {
      return { success: false, error: `طلب الشراء رقم ${item.sourceRequisitionId} غير موجود.` };
    }
    if (pr.status !== 'approved' && pr.status !== 'partially_sourced') {
      return { success: false, error: `الطلب ${pr.requisitionNumber} بحالة '${pr.status}' وغير معتمد للطرح في منافسة.` };
    }
    const line = pr.lines.find(l => l.id === item.sourceRequisitionLineId);
    if (!line) {
      return { success: false, error: `بند الطلب ${item.sourceRequisitionLineId} غير موجود.` };
    }
    if (item.allocateQuantity <= 0) {
      return { success: false, error: `الكمية المخصصة للبند ${line.itemDescriptionAr} يجب أن تكون أكبر من الصفر.` };
    }
    if (item.allocateQuantity > line.remainingUnsourcedQuantity) {
      return {
        success: false,
        error: `الكمية المطلوبة (${item.allocateQuantity}) للبند ${line.itemDescriptionAr} تتجاوز الرصيد المعتمد المتاح للطرح (${line.remainingUnsourcedQuantity}).`
      };
    }
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const sourcingEventId = `SRC-${Date.now().toString().slice(-6)}`;
  const sourcingNumber = `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`;

  const sourcingLines: SourcingEventLine[] = [];
  const updatedRequisitions = requisitions.map(pr => {
    const matchingAllocations = selectedLines.filter(s => s.sourceRequisitionId === pr.id);
    if (matchingAllocations.length === 0) return pr;

    const newLines = pr.lines.map(line => {
      const alloc = matchingAllocations.find(a => a.sourceRequisitionLineId === line.id);
      if (!alloc) return line;

      const newSourced = line.sourcedQuantity + alloc.allocateQuantity;
      const newRemaining = line.approvedQuantity - newSourced;
      const newStatus = newRemaining === 0 ? ('fully_sourced' as const) : ('partially_sourced' as const);

      sourcingLines.push({
        id: `SRCL-${sourcingNumber}-${sourcingLines.length + 1}`,
        sourcingEventId,
        sourceRequisitionId: pr.id,
        sourceRequisitionLineId: line.id,
        itemType: line.itemType,
        catalogItemId: line.catalogItemId,
        itemCode: line.itemCode,
        descriptionAr: line.itemDescriptionAr,
        descriptionEn: line.itemDescriptionEn,
        targetQuantity: alloc.allocateQuantity,
        targetUom: line.requestedUom,
        deliveryLocationId: line.deliveryLocationId,
        targetDeliveryDate: line.requiredDeliveryDate,
        technicalSpecificationsAr: `مستلزم معتمد مطابق لمعايير المستشفى - قسم ${pr.requestingDepartmentNameAr}`,
        technicalSpecificationsEn: `Approved medical supply per hospital standards - Dept: ${pr.requestingDepartmentNameEn}`
      });

      return {
        ...line,
        sourcedQuantity: newSourced,
        remainingUnsourcedQuantity: newRemaining,
        sourcingStatus: newStatus
      };
    });

    const allSourced = newLines.every(l => l.sourcingStatus === 'fully_sourced');
    const prStatus = allSourced ? ('fully_sourced' as const) : ('partially_sourced' as const);

    return {
      ...pr,
      status: prStatus,
      lines: newLines,
      updatedAt: now
    };
  });

  const newSourcingEvent: SourcingEvent = {
    id: sourcingEventId,
    sourcingNumber,
    titleAr: sourcingTitleAr,
    titleEn: sourcingTitleEn,
    method,
    status: 'draft',
    branchId: 'main_hospital',
    category,
    responsibleBuyerStaffId,
    responsibleBuyerNameAr,
    submissionDeadline,
    invitedSuppliers: [],
    lines: sourcingLines,
    evaluationCriteria: [
      { id: 'CRIT-1', nameAr: 'المطابقة الفنية والمواصفات السريرية', nameEn: 'Technical & Clinical Compliance', weightPercent: 50, category: 'technical' },
      { id: 'CRIT-2', nameAr: 'التكلفة الإجمالية والأسعار التنافسية', nameEn: 'Total Evaluated Cost & Price', weightPercent: 40, category: 'commercial' },
      { id: 'CRIT-3', nameAr: 'الالتزام بمدة وسرعة التوريد', nameEn: 'Lead Time & Delivery Commitment', weightPercent: 10, category: 'delivery_compliance' }
    ],
    createdAt: now,
    updatedAt: now
  };

  return {
    success: true,
    updatedRequisitions,
    sourcingEvent: newSourcingEvent
  };
}

// ============================================================================
// 3. QUOTATION VALIDATION & UOM NORMALIZATION
// ============================================================================

export function validateQuotationIntake(
  quotation: SupplierQuotation,
  catalogItems: ItemMasterRecord[]
): { success: boolean; validatedQuotation?: SupplierQuotation; error?: string } {
  if (!quotation.supplierId || !quotation.quotationReferenceNumber) {
    return { success: false, error: 'بيانات المورد ورقم عرض السعر الرسمي مطلوبة.' };
  }

  if (!quotation.lines || quotation.lines.length === 0) {
    return { success: false, error: 'عرض السعر لا يحتوي على أي بنود أسعار.' };
  }

  // Multi-currency check:
  if (quotation.currency !== 'SAR' && (!quotation.exchangeRateToSar || quotation.exchangeRateToSar <= 0)) {
    return {
      success: false,
      error: `العملة '${quotation.currency}' تتطلب تحديد سعر صرف صالح مقابل الريال السعودي (SAR) للمقارنة المالية.`
    };
  }

  const exchangeRate = quotation.currency === 'SAR' ? 1.0 : quotation.exchangeRateToSar;
  const incompletenessReasons: string[] = [];
  let totalNative = 0;
  let totalSar = 0;

  const processedLines: QuotationLine[] = [];

  for (let idx = 0; idx < quotation.lines.length; idx++) {
    const line = quotation.lines[idx];

    if (line.quotedUnitPrice <= 0) {
      incompletenessReasons.push(`البند ${idx + 1}: سعر الوحدة غير محدد أو صفر.`);
    }
    if (line.leadTimeDays === undefined || line.leadTimeDays < 0) {
      incompletenessReasons.push(`البند ${idx + 1}: مدة التوريد بالأيام غير محددة.`);
    }

    const lineSubtotal = line.quotedQuantity * line.quotedUnitPrice;
    const taxAmount = lineSubtotal * ((line.applicableTaxPercent || 0) / 100);
    const lineTotal = lineSubtotal + taxAmount;

    totalNative += lineTotal;
    totalSar += lineTotal * exchangeRate;

    // UOM Normalization
    let normalizedBaseQuantity = line.quotedQuantity;
    let normalizedUnitPriceSar = line.quotedUnitPrice * exchangeRate;
    let uomConversionFactor = 1;
    let uomVerified = true;

    // If UOM is Box or Case, look up conversion factor
    if (line.quotedUom === 'box' || line.quotedUom === 'case') {
      uomConversionFactor = line.uomConversionFactor || (line.quotedUom === 'box' ? 10 : 50);
      normalizedBaseQuantity = line.quotedQuantity * uomConversionFactor;
      normalizedUnitPriceSar = (line.quotedUnitPrice * exchangeRate) / uomConversionFactor;
    }

    processedLines.push({
      ...line,
      quotedLineSubtotal: lineSubtotal,
      quotedLineTotal: lineTotal,
      normalizedBaseQuantity,
      normalizedUnitPriceSar,
      uomConversionFactor,
      uomConversionVerified: uomVerified
    });
  }

  const isComplete = incompletenessReasons.length === 0;

  return {
    success: true,
    validatedQuotation: {
      ...quotation,
      lines: processedLines,
      totalQuotedAmountNative: totalNative,
      totalQuotedAmountSar: totalSar,
      completenessStatus: isComplete ? 'complete' : 'incomplete_missing_data',
      incompletenessReasons: isComplete ? undefined : incompletenessReasons
    }
  };
}

// ============================================================================
// 4. SUPPLIER QUALIFICATION GATE & AWARD DECISION
// ============================================================================

export function validateAwardDecision(
  sourcingEvent: SourcingEvent,
  winningQuotation: SupplierQuotation,
  supplier: SupplierMaster,
  evaluationSheet: BidEvaluationSheet,
  authorizedByStaffId: string,
  authorizedByStaffNameAr: string,
  awardJustificationAr: string,
  policy: InstitutionalProcurementPolicy
): { success: boolean; awardRecord?: AwardDecisionRecord; error?: string } {
  // 1. Supplier qualification check
  if (supplier.qualificationStatus !== 'qualified' && supplier.qualificationStatus !== 'conditionally_qualified') {
    return {
      success: false,
      error: `لا يمكن ترسية التوريد على المورد '${supplier.legalNameAr}' لأن حالة تأهيله هي '${supplier.qualificationStatus}'. يتطلب النظام مورداً مؤهلاً نظامياً.`
    };
  }

  // Check missing/stale supplier finance/tax data (PROC28)
  if (!supplier.taxRegistrationNumber || supplier.taxRegistrationNumber.trim() === '') {
    return {
      success: false,
      error: `لا يمكن ترسية التوريد: بيانات المورد الضريبية مفقودة أو غير مكتملة (الرقم الضريبي مفقود) (PROC28).`
    };
  }

  // 2. Technical compliance check (PROC16)
  if (evaluationSheet.technicalEvaluationStatus !== 'compliant') {
    return {
      success: false,
      error: `لا يمكن الترسية: العرض الفني للمورد غير مطابق للمواصفات السريرية المعتمدة أو بانتظار استكمال التقييم الفني الإلزامي (الحالة: ${evaluationSheet.technicalEvaluationStatus}) (PROC16).`
    };
  }

  // 3. Justification requirement
  if (!awardJustificationAr || awardJustificationAr.trim().length === 0) {
    return { success: false, error: 'يجب تدوين مسوغات ومبررات قرار الترسية المعتمد في السجل.' };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const awardId = `AWD-${Date.now().toString().slice(-6)}`;

  const awardedLines = winningQuotation.lines.map(line => ({
    sourcingLineId: line.sourcingLineId,
    quotationLineId: line.id,
    awardedQuantity: line.quotedQuantity,
    awardedUnitPriceSar: line.quotedUnitPrice * (winningQuotation.currency === 'SAR' ? 1.0 : winningQuotation.exchangeRateToSar),
    awardedTotalSar: line.quotedLineTotal * (winningQuotation.currency === 'SAR' ? 1.0 : winningQuotation.exchangeRateToSar)
  }));

  const totalAwardValue = awardedLines.reduce((acc, l) => acc + l.awardedTotalSar, 0);

  const awardRecord: AwardDecisionRecord = {
    id: awardId,
    sourcingEventId: sourcingEvent.id,
    winningSupplierId: supplier.id,
    winningQuotationId: winningQuotation.id,
    awardedLines,
    totalAwardValueSar: totalAwardValue,
    authorizedByStaffId,
    authorizedByStaffNameAr,
    decisionDate: now,
    awardJustificationAr,
    awardJustificationEn: 'Formally awarded based on technical compliance and best evaluated commercial cost.',
    status: 'formally_awarded'
  };

  return { success: true, awardRecord };
}

// ============================================================================
// 5. PURCHASE ORDER CREATION & LIFECYCLE
// ============================================================================

export function generatePurchaseOrderFromAward(
  sourcingEvent: SourcingEvent,
  arg2: any,
  arg3?: any,
  arg4?: any,
  arg5?: any,
  arg6?: any
): { success: boolean; purchaseOrder?: PurchaseOrder; error?: string } {
  let awardRecord: AwardDecisionRecord;
  let supplier: Partial<SupplierMaster>;
  let quotation: SupplierQuotation;
  let destinationLocationId = 'LOC-WH-MAIN-DOCK';

  if (arg2 && 'winningQuotationId' in arg2) {
    awardRecord = arg2;
    supplier = arg3;
    quotation = arg4;
    destinationLocationId = arg5 || 'LOC-WH-MAIN-DOCK';
  } else {
    quotation = arg2;
    destinationLocationId = arg3 || 'LOC-WH-MAIN-DOCK';
    supplier = {
      id: quotation.supplierId,
      legalNameAr: 'المورد المعتمد',
      legalNameEn: 'Awarded Supplier',
      taxRegistrationNumber: '300000000000003',
      addressAr: 'المملكة العربية السعودية'
    };
    awardRecord = {
      id: `AWD-${Date.now()}`,
      sourcingEventId: sourcingEvent.id,
      winningSupplierId: quotation.supplierId,
      winningQuotationId: quotation.id,
      awardedLines: quotation.lines.map(l => ({
        sourcingLineId: l.sourcingLineId,
        quotationLineId: l.id,
        awardedQuantity: l.quotedQuantity,
        awardedUnitPriceSar: l.quotedUnitPrice,
        awardedTotalSar: l.quotedLineTotal
      })),
      totalAwardValueSar: quotation.totalQuotedAmountSar,
      authorizedByStaffId: arg5 || 'STF-BUYER-01',
      authorizedByStaffNameAr: arg6 || 'مدير المشتريات',
      decisionDate: new Date().toISOString().substring(0, 10),
      awardJustificationAr: (sourcingEvent as any).awardJustificationAr || 'تمت الترسية بموجب القرار المعتمد للمنافسة.',
      awardJustificationEn: 'Awarded as per evaluation',
      status: 'formally_awarded'
    };
  }

  if (awardRecord.status !== 'formally_awarded') {
    return { success: false, error: 'لا يمكن إصدار أمر شراء إلا بعد اعتماد قرار الترسية رسمياً.' };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const poNumber = `PO-2026-MED-${Math.floor(100 + Math.random() * 900)}`;
  const poId = `PO-${poNumber}`;

  const poLines: PurchaseOrderLine[] = [];
  let subtotal = 0;
  let totalVat = 0;

  for (let idx = 0; idx < awardRecord.awardedLines.length; idx++) {
    const awdLine = awardRecord.awardedLines[idx];
    const qLine = quotation.lines.find(l => l.id === awdLine.quotationLineId);
    const srcLine = sourcingEvent.lines.find(l => l.id === awdLine.sourcingLineId);

    const netAmount = awdLine.awardedQuantity * awdLine.awardedUnitPriceSar;
    const vatRate = qLine?.applicableTaxPercent || 15;
    const vatAmount = netAmount * (vatRate / 100);
    const lineTotal = netAmount + vatAmount;

    subtotal += netAmount;
    totalVat += vatAmount;

    poLines.push({
      id: `POL-${poNumber}-${idx + 1}`,
      poId,
      lineNumber: idx + 1,
      sourceRequisitionId: srcLine?.sourceRequisitionId,
      sourceRequisitionLineId: srcLine?.sourceRequisitionLineId,
      sourcingLineId: srcLine?.id,
      catalogItemId: srcLine?.catalogItemId,
      itemCode: srcLine?.itemCode || 'ITEM-CAT',
      itemDescriptionAr: srcLine?.descriptionAr || 'مستلزم طبي',
      itemDescriptionEn: srcLine?.descriptionEn || 'Medical Supply Item',
      orderedPackaging: qLine?.quotedPackaging || 'Box of 50 each',
      orderedUom: qLine?.quotedUom || 'box',
      originalOrderedQuantity: awdLine.awardedQuantity,
      revisedOrderedQuantity: awdLine.awardedQuantity,
      cancelledRemainingQuantity: 0,
      supplierAcknowledgedQuantity: 0,
      reportedShippedQuantity: 0,
      physicallyReceivedQuantity: 0,
      qaAcceptedQuantity: 0,
      qaRejectedQuantity: 0,
      unitPriceSar: awdLine.awardedUnitPriceSar,
      applicableVatRatePercent: vatRate,
      netAmountSar: netAmount,
      vatAmountSar: vatAmount,
      totalAmountSar: lineTotal,
      deliveryLocationId: destinationLocationId,
      requestedDeliveryDate: srcLine?.targetDeliveryDate || now.substring(0, 10),
      lineFulfillmentStatus: 'open'
    });
  }

  const newPo: PurchaseOrder = {
    id: poId,
    poNumber,
    revisionNumber: 0,
    branchId: 'main_hospital',
    supplierId: supplier.id,
    supplierNameAr: supplier.legalNameAr,
    supplierNameEn: supplier.legalNameEn,
    supplierTaxNumber: supplier.taxRegistrationNumber,
    supplierAddress: `${supplier.cityAr} - ${supplier.addressAr}`,
    sourceSourcingEventId: sourcingEvent.id,
    sourceAwardId: awardRecord.id,
    documentStatus: 'draft',
    communicationStatus: 'not_sent',
    fulfillmentStatus: 'not_started',
    orderDate: now.substring(0, 10),
    expectedDeliveryDate: poLines[0]?.requestedDeliveryDate || now.substring(0, 10),
    deliveryDestinationLocationId: destinationLocationId,
    paymentTerms: supplier.paymentTerms || 'Net 60 Days',
    deliveryTerms: 'DDP Hospital Main Warehouse Dock',
    currency: 'SAR',
    lines: poLines,
    subtotalAmountSar: subtotal,
    vatAmountSar: totalVat,
    totalAmountSar: subtotal + totalVat,
    revisions: [],
    notes: 'أمر شراء صادر آلياً بناء على محضر الترسية المعتمد.'
  };

  return { success: true, purchaseOrder: newPo };
}

// ============================================================================
// 6. PO AMENDMENT WITH RECEIVED QUANTITY PROTECTION
// ============================================================================

export function executePurchaseOrderAmendment(
  po: PurchaseOrder,
  amendedLineId: string,
  newQuantity: number,
  amendmentReasonAr: string,
  approvedByStaffName: string
): { success: boolean; amendedPo?: PurchaseOrder; error?: string } {
  const line = po.lines.find(l => l.id === amendedLineId);
  if (!line) {
    return { success: false, error: `بند أمر الشراء ${amendedLineId} غير موجود.` };
  }

  // CRITICAL INTEGRITY: Cannot reduce below physically received quantity
  if (newQuantity < line.physicallyReceivedQuantity) {
    return {
      success: false,
      error: `لا يمكن تقليص الكمية في أمر الشراء إلى (${newQuantity}) لأن المستودع استلم فعلياً (${line.physicallyReceivedQuantity}) وحدة مثبتة في محضر الاستلام. الكمية المعدلة لا يمكن أن تقل عن المستلم فعلياً.`
    };
  }

  if (!amendmentReasonAr || amendmentReasonAr.trim().length === 0) {
    return { success: false, error: 'يجب تدوين سبب تعديل أمر الشراء ومبرراته النظامية.' };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const oldQty = line.revisedOrderedQuantity;
  const oldPrice = line.unitPriceSar;
  const oldTotal = po.totalAmountSar;

  const newLines = po.lines.map(l => {
    if (l.id !== amendedLineId) return l;
    const net = newQuantity * l.unitPriceSar;
    const vat = net * (l.applicableVatRatePercent / 100);
    return {
      ...l,
      revisedOrderedQuantity: newQuantity,
      netAmountSar: net,
      vatAmountSar: vat,
      totalAmountSar: net + vat,
      lineFulfillmentStatus: newQuantity === l.physicallyReceivedQuantity ? ('fully_received' as const) : l.lineFulfillmentStatus
    };
  });

  const newSubtotal = newLines.reduce((acc, l) => acc + l.netAmountSar, 0);
  const newVat = newLines.reduce((acc, l) => acc + l.vatAmountSar, 0);
  const newTotal = newSubtotal + newVat;

  const revisionRecord: PurchaseOrderRevision = {
    revisionNumber: po.revisionNumber + 1,
    amendmentReasonAr,
    amendmentReasonEn: 'Authorized order amendment under institutional procurement policy.',
    requestedByStaffName: 'مشتريات المستشفى (Procurement Dept)',
    approvedByStaffName,
    amendmentDate: now,
    previousTotalSar: oldTotal,
    revisedTotalSar: newTotal,
    amendedLines: [
      {
        lineId: amendedLineId,
        oldQuantity: oldQty,
        newQuantity,
        oldPriceSar: oldPrice,
        newPriceSar: oldPrice
      }
    ]
  };

  const updatedPo: PurchaseOrder = {
    ...po,
    revisionNumber: po.revisionNumber + 1,
    lines: newLines,
    subtotalAmountSar: newSubtotal,
    vatAmountSar: newVat,
    totalAmountSar: newTotal,
    revisions: [...po.revisions, revisionRecord]
  };

  return { success: true, amendedPo: updatedPo };
}

// ============================================================================
// 7. INVENTORY RECEIPT RECONCILIATION & COMMERCIAL CLAIMS
// ============================================================================

export function reconcilePurchaseOrderReceipt(
  po: PurchaseOrder,
  poLineId: string,
  newReceiptQuantity: number,
  qaAcceptedQuantity: number,
  qaRejectedQuantity: number
): { success: boolean; updatedPo?: PurchaseOrder; error?: string } {
  const line = po.lines.find(l => l.id === poLineId);
  if (!line) {
    return { success: false, error: `بند أمر الشراء ${poLineId} غير موجود.` };
  }

  if (qaAcceptedQuantity + qaRejectedQuantity !== newReceiptQuantity) {
    return {
      success: false,
      error: `إجمالي الكمية المقبولة (${qaAcceptedQuantity}) والمرفوضة (${qaRejectedQuantity}) يجب أن يتطابق تماماً مع الكمية المستلمة في الرصيف (${newReceiptQuantity}).`
    };
  }

  const updatedReceivedQty = line.physicallyReceivedQuantity + newReceiptQuantity;
  const updatedAcceptedQty = line.qaAcceptedQuantity + qaAcceptedQuantity;
  const updatedRejectedQty = line.qaRejectedQuantity + qaRejectedQuantity;

  const outstanding = line.revisedOrderedQuantity - updatedReceivedQty;

  const newLines = po.lines.map(l => {
    if (l.id !== poLineId) return l;
    return {
      ...l,
      physicallyReceivedQuantity: updatedReceivedQty,
      qaAcceptedQuantity: updatedAcceptedQty,
      qaRejectedQuantity: updatedRejectedQty,
      lineFulfillmentStatus: outstanding <= 0 ? ('fully_received' as const) : ('partially_received' as const)
    };
  });

  const allLinesComplete = newLines.every(l => l.lineFulfillmentStatus === 'fully_received');
  const fulfillmentStatus = allLinesComplete ? ('fully_received' as const) : ('partially_received' as const);

  return {
    success: true,
    updatedPo: {
      ...po,
      lines: newLines,
      fulfillmentStatus
    }
  };
}

export function createSupplierClaimFromRejection(
  po: PurchaseOrder,
  poLineId: string,
  claimType: 'replacement_goods' | 'credit_note',
  discrepancyReasonAr: string,
  receiptRefId?: string
): { success: boolean; claim?: SupplierClaim; error?: string } {
  const line = po.lines.find(l => l.id === poLineId);
  if (!line) {
    return { success: false, error: 'بند أمر الشراء غير موجود لإنشاء مطالبة.' };
  }

  if (line.qaRejectedQuantity <= 0) {
    return { success: false, error: 'لا توجد كميات مرفوضة من الفحص النوعي على هذا البند لفتح مطالبة تجارية.' };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const claimNumber = `CLM-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newClaim: SupplierClaim = {
    id: `CLM-${claimNumber}`,
    claimNumber,
    poId: po.id,
    poNumber: po.poNumber,
    supplierId: po.supplierId,
    supplierNameAr: po.supplierNameAr,
    inventoryReceiptReferenceId: receiptRefId,
    claimType,
    status: 'submitted_to_supplier',
    claimDate: now.substring(0, 10),
    claimedLine: {
      itemCode: line.itemCode,
      itemDescriptionAr: line.itemDescriptionAr,
      claimedQuantity: line.qaRejectedQuantity,
      claimedUom: line.orderedUom,
      estimatedValueSar: line.qaRejectedQuantity * line.unitPriceSar
    },
    discrepancyReasonAr,
    discrepancyReasonEn: 'Goods rejected during warehouse dock inspection due to damage or non-compliance.'
  };

  return { success: true, claim: newClaim };
}

// ============================================================================
// COMPATIBILITY ALIASES & HELPERS
// ============================================================================

export function processRequisitionApproval(
  requisition: PurchaseRequisition,
  arg2: any,
  arg3?: any,
  arg4?: any,
  arg5?: any,
  arg6?: any
): PurchaseRequisition {
  let decision: 'approved' | 'rejected' | 'returned_for_revision' = 'approved';
  let reviewerName = 'المعتمد المالي';
  let comments: string | undefined = undefined;

  if (typeof arg2 === 'string' && (arg2 === 'approved' || arg2 === 'rejected' || arg2 === 'returned_for_revision')) {
    decision = arg2;
    reviewerName = typeof arg3 === 'string' ? arg3 : reviewerName;
    comments = typeof arg4 === 'string' ? arg4 : undefined;
  } else if (typeof arg5 === 'string' && (arg5 === 'approved' || arg5 === 'rejected' || arg5 === 'returned_for_revision')) {
    reviewerName = typeof arg3 === 'string' ? arg3 : reviewerName;
    decision = arg5;
    comments = typeof arg6 === 'string' ? arg6 : undefined;
  }

  const res = executeRequisitionApproval(requisition, decision, reviewerName, comments);
  return res.requisition || requisition;
}

export function resubmitRequisitionWithAmendments(
  requisition: PurchaseRequisition,
  modifiedLines: PurchaseRequisitionLine[],
  resubmitterStaffNameAr: string = 'مقدم الطلب'
): PurchaseRequisition {
  const res = executeRequisitionRevisionResubmit(requisition, modifiedLines, resubmitterStaffNameAr);
  return res.requisition || requisition;
}

export function advanceSupplierClaimStatus(
  claim: SupplierClaim,
  nextStatus: SupplierClaimStatus,
  resolutionNote?: string
): SupplierClaim {
  return {
    ...claim,
    status: nextStatus,
    discrepancyReasonAr: resolutionNote
      ? `${claim.discrepancyReasonAr} [تحديث التسوية: ${resolutionNote}]`
      : claim.discrepancyReasonAr
  };
}

export function recordAwardDecision(
  sourcingEvents: SourcingEvent[],
  quotations: any[],
  suppliers: SupplierMaster[],
  sourcingEventId: string,
  winningSupplierId: string,
  winningQuotationId: string,
  justificationAr: string,
  authorizedStaffId: string,
  authorizedStaffNameAr: string
): { success: boolean; updatedSourcingEvents: SourcingEvent[]; errorMessageAr?: string } {
  const sourcingEvent = sourcingEvents.find(s => s.id === sourcingEventId);
  if (!sourcingEvent) {
    return { success: false, updatedSourcingEvents: sourcingEvents, errorMessageAr: 'حدث المنافسة غير موجود.' };
  }

  const supplier = suppliers.find(s => s.id === winningSupplierId);
  if (!supplier) {
    return { success: false, updatedSourcingEvents: sourcingEvents, errorMessageAr: 'المورد غير موجود بالسجل.' };
  }

  // Check supplier qualification status
  if (supplier.qualificationStatus === 'expired') {
    return { 
      success: false, 
      updatedSourcingEvents: sourcingEvents, 
      errorMessageAr: `لا يمكن الترسية: وثائق وتراخيص تأهيل المورد '${supplier.legalNameAr}' منتهية الصلاحية (PROC10).` 
    };
  }
  if (supplier.qualificationStatus === 'restricted' || supplier.qualificationStatus === 'under_review' || supplier.qualificationStatus === 'suspended' || supplier.qualificationStatus === 'rejected') {
    return { 
      success: false, 
      updatedSourcingEvents: sourcingEvents, 
      errorMessageAr: `لا يمكن الترسية: المورد '${supplier.legalNameAr}' غير مؤهل نظامياً للشراء الطبي (الحالة: ${supplier.qualificationStatus}) (PROC09).` 
    };
  }

  // Check missing/stale supplier finance data (PROC28)
  if (!supplier.taxRegistrationNumber || supplier.taxRegistrationNumber.trim() === '') {
    return {
      success: false,
      updatedSourcingEvents: sourcingEvents,
      errorMessageAr: `لا يمكن الترسية: بيانات المورد الضريبية والمالية مفقودة أو غير مكتملة (الرقم الضريبي مفقود) (PROC28).`
    };
  }

  const quote = quotations.find(q => q.id === winningQuotationId);
  if (!quote) {
    return { success: false, updatedSourcingEvents: sourcingEvents, errorMessageAr: 'عرض السعر غير موجود.' };
  }

  // Check technical evaluation status (PROC16)
  if (quote.technicalComplianceStatus === 'pending_evaluation' || (quote as any).technicalEvaluationStatus === 'pending') {
    return {
      success: false,
      updatedSourcingEvents: sourcingEvents,
      errorMessageAr: 'لا يمكن الترسية: التقييم الفني السريري إلزامي وما زال قيد المراجعة ولم يُعتمد بعد (PROC16).'
    };
  }

  if (quote.technicalComplianceStatus === 'non_compliant' || (quote as any).technicalEvaluationStatus === 'non_compliant') {
    return {
      success: false,
      updatedSourcingEvents: sourcingEvents,
      errorMessageAr: 'لا يمكن الترسية: العرض الفني غير مطابق للمواصفات السريرية المعتمدة (PROC16).'
    };
  }

  if (!justificationAr || justificationAr.trim().length === 0) {
    return { success: false, updatedSourcingEvents: sourcingEvents, errorMessageAr: 'يجب تدوين مبررات ومسوغات قرار الترسية المعتمد.' };
  }

  const updatedEvents = sourcingEvents.map(evt => {
    if (evt.id !== sourcingEventId) return evt;
    return {
      ...evt,
      status: 'awarded' as const,
      awardedSupplierId: winningSupplierId,
      awardedQuotationId: winningQuotationId,
      awardJustificationAr: justificationAr,
      awardDate: new Date().toISOString().substring(0, 10)
    };
  });

  return {
    success: true,
    updatedSourcingEvents: updatedEvents
  };
}

export function simulateTransmitPurchaseOrder(po: PurchaseOrder): PurchaseOrder {
  const now = new Date().toISOString();
  return {
    ...po,
    communicationStatus: 'simulated_sent',
    simulatedSentTimestamp: now,
    notes: `${po.notes || ''} [تم إرسال أمر الشراء للمورد إلكترونياً بتاريخ ${now.substring(0, 10)}]`
  };
}

export function recordSupplierOrderAcknowledgment(
  po: PurchaseOrder,
  confirmedDeliveryDate?: string,
  note?: string
): PurchaseOrder {
  const now = new Date().toISOString();
  return {
    ...po,
    communicationStatus: 'acknowledged',
    supplierAcknowledgmentTimestamp: now,
    promisedDeliveryDate: confirmedDeliveryDate || po.expectedDeliveryDate,
    notes: `${po.notes || ''} [تأكيد استلام المورد: ${note || 'مؤكد'} - موعد التوريد: ${confirmedDeliveryDate || po.expectedDeliveryDate}]`
  };
}

export function amendPurchaseOrder(
  po: PurchaseOrder,
  updatedLines: { lineId: string; newQuantity: number; reason: string }[],
  amendmentReason: string,
  staffId: string,
  staffName: string
): { success: boolean; updatedPo?: PurchaseOrder; errorMessageAr?: string } {
  let currentPo = po;

  for (const lineUpdate of updatedLines) {
    const result = executePurchaseOrderAmendment(
      currentPo,
      lineUpdate.lineId,
      lineUpdate.newQuantity,
      amendmentReason,
      staffName
    );

    if (!result.success || !result.amendedPo) {
      return {
        success: false,
        errorMessageAr: result.error || 'تعذر تعديل أمر الشراء'
      };
    }

    currentPo = result.amendedPo;
  }

  return {
    success: true,
    updatedPo: currentPo
  };
}

// ============================================================================
// 10. MULTI-CURRENCY QUOTATION COMPARISON (PROC15)
// ============================================================================

export interface MultiCurrencyComparisonResult {
  canCompare: boolean;
  incompleteReasonAr?: string;
  quotationA?: {
    id: string;
    currency: string;
    originalAmountNative: number;
    exchangeRateToSar: number;
    normalizedAmountSar: number;
  };
  quotationB?: {
    id: string;
    currency: string;
    originalAmountNative: number;
    exchangeRateToSar: number;
    normalizedAmountSar: number;
  };
  cheaperQuotationId?: string;
  varianceSar?: number;
}

export function compareQuotationsMultiCurrency(
  quoteA: SupplierQuotation,
  quoteB: SupplierQuotation
): MultiCurrencyComparisonResult {
  const needsConversionA = quoteA.currency !== 'SAR';
  const needsConversionB = quoteB.currency !== 'SAR';

  const rateA = quoteA.currency === 'SAR' ? 1.0 : (quoteA.exchangeRateToSar ?? 0);
  const rateB = quoteB.currency === 'SAR' ? 1.0 : (quoteB.exchangeRateToSar ?? 0);

  if (needsConversionA && rateA <= 0) {
    return {
      canCompare: false,
      incompleteReasonAr: `عرض السعر (${quoteA.quotationReferenceNumber || quoteA.id}) مسعر بعملة أجنبية (${quoteA.currency}) دون إدخال سعر تحويل معتمد إلى الريال السعودي (PROC15).`
    };
  }

  if (needsConversionB && rateB <= 0) {
    return {
      canCompare: false,
      incompleteReasonAr: `عرض السعر (${quoteB.quotationReferenceNumber || quoteB.id}) مسعر بعملة أجنبية (${quoteB.currency}) دون إدخال سعر تحويل معتمد إلى الريال السعودي (PROC15).`
    };
  }

  const nativeA = quoteA.totalQuotedAmountNative ?? quoteA.lines.reduce((s, l) => s + l.quotedLineTotal, 0);
  const nativeB = quoteB.totalQuotedAmountNative ?? quoteB.lines.reduce((s, l) => s + l.quotedLineTotal, 0);

  const sarA = quoteA.currency === 'SAR' ? nativeA : (quoteA.totalQuotedAmountSar || nativeA * rateA);
  const sarB = quoteB.currency === 'SAR' ? nativeB : (quoteB.totalQuotedAmountSar || nativeB * rateB);

  return {
    canCompare: true,
    quotationA: {
      id: quoteA.id,
      currency: quoteA.currency,
      originalAmountNative: nativeA,
      exchangeRateToSar: rateA,
      normalizedAmountSar: sarA
    },
    quotationB: {
      id: quoteB.id,
      currency: quoteB.currency,
      originalAmountNative: nativeB,
      exchangeRateToSar: rateB,
      normalizedAmountSar: sarB
    },
    cheaperQuotationId: sarA < sarB ? quoteA.id : quoteB.id,
    varianceSar: Math.abs(sarA - sarB)
  };
}


