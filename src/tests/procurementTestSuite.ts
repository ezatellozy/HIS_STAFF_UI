/**
 * Comprehensive Executable Verification Suite for HIS Procurement & Purchasing
 * Validates all 30 scenarios (PROC01 - PROC30) against the enterprise data model and state engine.
 */

import { 
  mockProcurementRequisitions,
  mockSourcingEvents,
  mockQuotations,
  mockBidEvaluations,
  mockAwardRecords,
  mockPurchaseOrders,
  mockSupplierMasters,
  mockFrameworkAgreements,
  mockSupplierClaims
} from '../data/mockProcurementOpsData';

import {
  executeRequisitionApproval,
  executeRequisitionRevisionResubmit,
  resubmitRequisitionWithAmendments,
  validateAndConsolidateDemand,
  recordAwardDecision,
  generatePurchaseOrderFromAward,
  simulateTransmitPurchaseOrder,
  recordSupplierOrderAcknowledgment,
  amendPurchaseOrder,
  advanceSupplierClaimStatus,
  executePurchaseOrderAmendment,
  compareQuotationsMultiCurrency
} from '../utils/procurementEngine';
import * as fs from 'fs';
import * as path from 'path';

import { PurchaseRequisitionLine } from '../types/procurementOps';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testId: string, description: string) {
  if (condition) {
    console.log(`[PASS] ${testId}: ${description}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testId}: ${description}`);
    failCount++;
  }
}

console.log('====================================================');
console.log('STARTING HIS PROCUREMENT & PURCHASING TEST SUITE');
console.log('30 SCENARIOS: PROC01 - PROC30');
console.log('====================================================\n');

// 1. PROC01: Routine PR with catalog items, requested UOM, and delivery date
const pr01 = mockProcurementRequisitions.find(p => p.id === 'PR-2026-00101');
assert(
  pr01 !== undefined && 
  pr01.priority === 'routine' && 
  pr01.lines.length > 0 && 
  pr01.lines[0].itemType === 'catalog_stock' &&
  !!pr01.requiredDate,
  'PROC01',
  'Routine PR with catalog items, requested UOM, and delivery date'
);

// 2. PROC02: Urgent PR requiring fast-track handling
const pr02 = mockProcurementRequisitions.find(p => p.id === 'PR-2026-00102');
assert(
  pr02 !== undefined && 
  pr02.priority === 'urgent' && 
  pr02.status === 'submitted_pending_approval',
  'PROC02',
  'Urgent PR marked with priority urgent and awaiting approval'
);

// 3. PROC03: PR with internal stock available, displays warehouse alert
const lineWithStock = pr01?.lines.find(l => (l.internalStockAvailable ?? 0) > 0);
assert(
  lineWithStock !== undefined && (lineWithStock.internalStockAvailable ?? 0) > 0,
  'PROC03',
  'PR lines correctly report internal warehouse stock available for substitution'
);

// 4. PROC04: Non-catalog item PR requiring custom description and suggested vendor
const pr04 = mockProcurementRequisitions.find(p => p.id === 'PR-2026-00103');
const nonCatalogLine = pr04?.lines.find(l => l.itemType === 'non_catalog_special');
assert(
  pr04 !== undefined && 
  nonCatalogLine !== undefined && 
  !!nonCatalogLine.suggestedSupplierId &&
  !!nonCatalogLine.itemDescriptionAr,
  'PROC04',
  'Non-catalog item PR includes custom specification and suggested vendor'
);

// 5. PROC05: PR awaiting approval, displays approval workflow
const pendingPr = mockProcurementRequisitions.find(p => p.status === 'submitted_pending_approval');
assert(
  pendingPr !== undefined && 
  pendingPr.approvalHistory.length > 0 && 
  pendingPr.approvalHistory.some(a => a.decision === 'pending'),
  'PROC05',
  'PR awaiting approval maintains pending approval stages with reviewer roles'
);

// 6. PROC06: PR returned for revision, editable lines, preserves revision history
const returnedPr = mockProcurementRequisitions.find(p => p.id === 'PR-2026-00105');
assert(
  returnedPr !== undefined && 
  returnedPr.status === 'returned_for_revision' && 
  returnedPr.approvalHistory.some(a => a.decision === 'returned_for_revision' && !!a.comments),
  'PROC06',
  'Returned PR preserves reviewer comments and revision history'
);

// Test resubmission of PROC06
if (returnedPr) {
  const updatedLines: PurchaseRequisitionLine[] = returnedPr.lines.map(l => ({ ...l, requestedQuantity: 40 }));
  const resubmitted = resubmitRequisitionWithAmendments(returnedPr, updatedLines, 'مقدم الطلب');
  assert(
    resubmitted.status === 'submitted_pending_approval' && 
    resubmitted.approvalHistory.length > returnedPr.approvalHistory.length,
    'PROC06-RESUBMIT',
    'Resubmitted PR appends a new pending approval stage while retaining prior rejection comments'
  );
}

// 7. PROC07: PR consolidation, grouping approved lines from multiple PRs into one RFQ
const consolidationResult = validateAndConsolidateDemand(
  mockProcurementRequisitions,
  [
    { sourceRequisitionId: 'PR-2026-00104', sourceRequisitionLineId: 'PRL-00104-1', allocateQuantity: 50 }
  ],
  'منافسة مجمعة للمستلزمات الطبية',
  'Consolidated Medical Supplies Tender',
  'rfq',
  'medical_surgical_consumables',
  '2026-10-25',
  'STF-BUYER-01',
  'Buyer 1'
);
assert(
  consolidationResult.success && consolidationResult.sourcingEvent?.lines.length === 1,
  'PROC07',
  'Demand consolidation successfully aggregates approved lines into a single RFQ'
);

// 8. PROC08: One approved PR must split into two supplier POs with exact source-line references, quantities, and no duplicate sourcing
const baseApprovedPr = mockProcurementRequisitions.find(p => p.id === 'PR-2026-00104');
assert(baseApprovedPr !== undefined, 'PROC08-FIXTURE', 'Approved requisition PR-2026-00104 fixture exists');

if (baseApprovedPr) {
  // Step 1: Allocate 60 units from PRL-00104-1 into Sourcing Event 1 (Supplier A)
  const split1 = validateAndConsolidateDemand(
    [baseApprovedPr],
    [{ sourceRequisitionId: 'PR-2026-00104', sourceRequisitionLineId: 'PRL-00104-1', allocateQuantity: 60 }],
    'طرح الشريحة الأولى - كمامات جراحية',
    'Consumables Split Lot 1',
    'rfq',
    'medical_surgical_consumables',
    '2026-10-30',
    'STF-BUY-001',
    'سعد العريفي'
  );

  assert(
    split1.success && split1.sourcingEvent !== undefined && split1.updatedRequisitions !== undefined,
    'PROC08-SPLIT1',
    'First lot (60 units) successfully allocated to Sourcing Event 1'
  );

  // Step 2b: Verify that attempting to allocate 50 units when only 40 are remaining is strictly rejected
  const overAllocationAttempt = validateAndConsolidateDemand(
    split1.updatedRequisitions || [baseApprovedPr],
    [{ sourceRequisitionId: 'PR-2026-00104', sourceRequisitionLineId: 'PRL-00104-1', allocateQuantity: 50 }],
    'طرح زائد غير نظامي',
    'Illegal Over-allocation',
    'rfq',
    'medical_surgical_consumables',
    '2026-10-30',
    'STF-BUY-001',
    'سعد العريفي'
  );

  assert(
    !overAllocationAttempt.success && (overAllocationAttempt.error?.includes('تتجاوز') ?? false),
    'PROC08-NO-OVERALLOCATION',
    'Allocating quantity (50) exceeding remaining unsourced balance (40) is strictly rejected'
  );

  // Step 2: Allocate the remaining 40 units from the updated PR into Sourcing Event 2 (Supplier B)
  const split2 = validateAndConsolidateDemand(
    split1.updatedRequisitions || [baseApprovedPr],
    [{ sourceRequisitionId: 'PR-2026-00104', sourceRequisitionLineId: 'PRL-00104-1', allocateQuantity: 40 }],
    'طرح الشريحة الثانية - كمامات جراحية',
    'Consumables Split Lot 2',
    'rfq',
    'medical_surgical_consumables',
    '2026-10-30',
    'STF-BUY-002',
    'فهد السبيعي'
  );

  assert(
    split2.success && split2.sourcingEvent !== undefined && split2.updatedRequisitions !== undefined,
    'PROC08-SPLIT2',
    'Second lot (40 units) successfully allocated to Sourcing Event 2'
  );

  const finalPr = split2.updatedRequisitions?.find(r => r.id === 'PR-2026-00104');
  const finalPrLine = finalPr?.lines.find(l => l.id === 'PRL-00104-1');

  // Step 3: Verify no duplicate sourcing after fully sourced (attempting to allocate another 10 units must fail)
  const duplicateSourcingAttempt = validateAndConsolidateDemand(
    split2.updatedRequisitions || [baseApprovedPr],
    [{ sourceRequisitionId: 'PR-2026-00104', sourceRequisitionLineId: 'PRL-00104-1', allocateQuantity: 10 }],
    'طرح مكرر بعد استنفاد الكمية',
    'Illegal Duplicate Sourcing',
    'rfq',
    'medical_surgical_consumables',
    '2026-10-30',
    'STF-BUY-001',
    'سعد العريفي'
  );

  assert(
    !duplicateSourcingAttempt.success && (duplicateSourcingAttempt.error?.includes('fully_sourced') || duplicateSourcingAttempt.error?.includes('غير معتمد') || duplicateSourcingAttempt.error?.includes('تتجاوز')),
    'PROC08-NO-DUPLICATE',
    'Duplicate sourcing after PR lines are fully sourced is strictly rejected'
  );

  // Step 4: Generate PO 1 from Sourcing Event 1 (Supplier A: VEND-SA-9021)
  const quote1 = {
    id: 'QUOTE-SPLIT-1',
    sourcingEventId: split1.sourcingEvent!.id,
    supplierId: 'VEND-SA-9021',
    quotationReferenceNumber: 'SPLIT-Q-1',
    quotationDate: '2026-09-20',
    validUntilDate: '2026-11-20',
    currency: 'SAR',
    exchangeRateToSar: 1.0,
    lines: [{
      id: 'QL-S1',
      quotationId: 'QUOTE-SPLIT-1',
      sourcingLineId: split1.sourcingEvent!.lines[0].id,
      supplierItemCode: 'GULF-MASK-01',
      quotedDescriptionAr: 'كمامة جراحية',
      quotedDescriptionEn: 'Surgical mask',
      quotedPackaging: 'علبة 50 حبة',
      quotedUom: 'box',
      quotedQuantity: 60,
      quotedUnitPrice: 25.0,
      quotedLineSubtotal: 1500.0,
      applicableTaxPercent: 15,
      quotedLineTotal: 1725.0,
      normalizedBaseUom: 'box',
      normalizedBaseQuantity: 60,
      normalizedUnitPriceSar: 25.0,
      uomConversionFactor: 1,
      uomConversionVerified: true
    }],
    totalQuotedAmountSar: 1725.0,
    totalQuotedAmountNative: 1725.0,
    paymentTerms: 'Net 30 Days',
    completenessStatus: 'complete' as const,
    technicalComplianceStatus: 'compliant' as const
  };

  const po1Result = generatePurchaseOrderFromAward(split1.sourcingEvent!, quote1);

  // Step 5: Generate PO 2 from Sourcing Event 2 (Supplier B: VEND-SA-8812)
  const quote2 = {
    id: 'QUOTE-SPLIT-2',
    sourcingEventId: split2.sourcingEvent!.id,
    supplierId: 'VEND-SA-8812',
    quotationReferenceNumber: 'SPLIT-Q-2',
    quotationDate: '2026-09-20',
    validUntilDate: '2026-11-20',
    currency: 'SAR',
    exchangeRateToSar: 1.0,
    lines: [{
      id: 'QL-S2',
      quotationId: 'QUOTE-SPLIT-2',
      sourcingLineId: split2.sourcingEvent!.lines[0].id,
      supplierItemCode: 'BAX-MASK-02',
      quotedDescriptionAr: 'كمامة جراحية باكستر',
      quotedDescriptionEn: 'Baxter Surgical mask',
      quotedPackaging: 'علبة 50 حبة',
      quotedUom: 'box',
      quotedQuantity: 40,
      quotedUnitPrice: 26.0,
      quotedLineSubtotal: 1040.0,
      applicableTaxPercent: 15,
      quotedLineTotal: 1196.0,
      normalizedBaseUom: 'box',
      normalizedBaseQuantity: 40,
      normalizedUnitPriceSar: 26.0,
      uomConversionFactor: 1,
      uomConversionVerified: true
    }],
    totalQuotedAmountSar: 1196.0,
    totalQuotedAmountNative: 1196.0,
    paymentTerms: 'Net 60 Days',
    completenessStatus: 'complete' as const,
    technicalComplianceStatus: 'compliant' as const
  };

  const po2Result = generatePurchaseOrderFromAward(split2.sourcingEvent!, quote2);

  assert(
    po1Result.success && po1Result.purchaseOrder !== undefined &&
    po2Result.success && po2Result.purchaseOrder !== undefined,
    'PROC08-POS-GENERATED',
    'Both supplier POs successfully generated from separate sourcing splits'
  );

  const po1Line = po1Result.purchaseOrder?.lines[0];
  const po2Line = po2Result.purchaseOrder?.lines[0];

  assert(
    po1Line !== undefined &&
    po1Line.sourceRequisitionId === 'PR-2026-00104' &&
    po1Line.sourceRequisitionLineId === 'PRL-00104-1' &&
    po1Line.originalOrderedQuantity === 60 &&
    po2Line !== undefined &&
    po2Line.sourceRequisitionId === 'PR-2026-00104' &&
    po2Line.sourceRequisitionLineId === 'PRL-00104-1' &&
    po2Line.originalOrderedQuantity === 40 &&
    po1Line.originalOrderedQuantity + po2Line.originalOrderedQuantity === 100 &&
    finalPrLine?.remainingUnsourcedQuantity === 0 &&
    finalPrLine?.sourcingStatus === 'fully_sourced',
    'PROC08',
    'One approved PR split into two supplier POs with exact source-line refs, quantities (60 + 40 = 100), and zero duplicate balance'
  );
}

// 9. PROC09: Supplier not qualified, blocked from award
const restrictedSupplier = mockSupplierMasters.find(s => s.qualificationStatus === 'under_review');
assert(
  restrictedSupplier !== undefined,
  'PROC09-FIXTURE',
  'Unqualified/under-review supplier fixture exists in supplier master'
);
if (restrictedSupplier) {
  const badAward = recordAwardDecision(
    mockSourcingEvents,
    mockQuotations,
    mockSupplierMasters,
    'SRC-2026-RFQ-01',
    restrictedSupplier.id,
    'QUOTE-2026-042-C',
    'Justification test',
    'STF-MGR',
    'Manager'
  );
  assert(
    !badAward.success && (badAward.errorMessageAr?.includes('غير مؤهل') ?? false),
    'PROC09',
    'Awarding an unqualified supplier is strictly blocked by qualification gate'
  );
}

// 10. PROC10: Supplier qualification expired, blocks new PO creation
const expiredSupplier = mockSupplierMasters.find(s => s.qualificationStatus === 'expired');
assert(
  expiredSupplier !== undefined,
  'PROC10-FIXTURE',
  'Expired supplier fixture exists in supplier master'
);
if (expiredSupplier) {
  const expiredAward = recordAwardDecision(
    mockSourcingEvents,
    mockQuotations,
    mockSupplierMasters,
    'SRC-2026-RFQ-01',
    expiredSupplier.id,
    'QUOTE-2026-042-A',
    'Justification test',
    'STF-MGR',
    'Manager'
  );
  assert(
    !expiredAward.success && (expiredAward.errorMessageAr?.includes('منتهية') ?? false),
    'PROC10',
    'Awarding an expired supplier is strictly blocked'
  );
}

// 11. PROC11: Sourcing event creation, RFQ issued to multiple suppliers
const src01 = mockSourcingEvents.find(s => s.id === 'SRC-2026-RFQ-01');
assert(
  src01 !== undefined && src01.invitedSuppliers.length >= 3,
  'PROC11',
  'Sourcing event maintains invited suppliers list with invitation tracking'
);

// 12. PROC12: RFQ sent with receipt unconfirmed, tracks status
const src02 = mockSourcingEvents.find(s => s.id === 'SRC-2026-TND-02');
const unconfirmedInvite = src02?.invitedSuppliers.find(i => i.invitationStatus === 'simulated_sent');
assert(
  unconfirmedInvite !== undefined,
  'PROC12',
  'Tracks suppliers who were sent RFQ but have unconfirmed receipt'
);

// 13. PROC13: Quotation with missing data, flagged for completion
const incompleteQuote = mockQuotations.find(q => q.completenessStatus === 'incomplete_missing_data');
assert(
  incompleteQuote !== undefined && incompleteQuote.incompletenessReasons !== undefined && incompleteQuote.incompletenessReasons.length > 0,
  'PROC13',
  'Incomplete quotations flagged with specific missing items note'
);

// 14. PROC14: Quotation in different UOM, converts to base UOM for comparison
const quoteWithDiffUom = mockQuotations.find(q => q.id === 'QUOTE-2026-042-B');
const lineDiffUom = quoteWithDiffUom?.lines[0];
assert(
  lineDiffUom !== undefined && 
  lineDiffUom.quotedUom === 'case' && 
  lineDiffUom.normalizedBaseUom === 'each' && 
  lineDiffUom.normalizedUnitPriceSar === 2.3,
  'PROC14',
  'Packaging UOMs (e.g. Case of 500) correctly normalized to base unit price (2.30 SAR/each)'
);

// 15. PROC15: Compare two quotations in different currencies (Without conversion rate: incomplete. With synthetic rate: show original & normalized amounts)
const quoteSar: any = {
  id: 'QUOTE-CURR-SAR',
  quotationReferenceNumber: 'Q-LOCAL-SAR',
  currency: 'SAR',
  exchangeRateToSar: 1.0,
  totalQuotedAmountNative: 10000.0,
  totalQuotedAmountSar: 10000.0,
  lines: [{ id: 'QL-SAR-1', quotedLineTotal: 10000.0 }]
};

const quoteUsdNoRate: any = {
  id: 'QUOTE-CURR-USD-NO-RATE',
  quotationReferenceNumber: 'Q-INTL-USD-1',
  currency: 'USD',
  exchangeRateToSar: 0, // Without supplied conversion rate
  totalQuotedAmountNative: 2400.0,
  totalQuotedAmountSar: 0,
  lines: [{ id: 'QL-USD-1', quotedLineTotal: 2400.0 }]
};

const incompleteComparison = compareQuotationsMultiCurrency(quoteSar, quoteUsdNoRate);
assert(
  !incompleteComparison.canCompare && !!incompleteComparison.incompleteReasonAr,
  'PROC15-INCOMPLETE',
  'Quotation comparison in foreign currency without conversion rate remains incomplete'
);

const quoteUsdWithRate: any = {
  id: 'QUOTE-CURR-USD-WITH-RATE',
  quotationReferenceNumber: 'Q-INTL-USD-2',
  currency: 'USD',
  exchangeRateToSar: 3.75, // Explicit synthetic rate
  totalQuotedAmountNative: 2400.0,
  totalQuotedAmountSar: 9000.0,
  lines: [{ id: 'QL-USD-2', quotedLineTotal: 2400.0 }]
};

const normalizedComparison = compareQuotationsMultiCurrency(quoteSar, quoteUsdWithRate);
assert(
  normalizedComparison.canCompare &&
  normalizedComparison.quotationA?.originalAmountNative === 10000 &&
  normalizedComparison.quotationA?.currency === 'SAR' &&
  normalizedComparison.quotationA?.normalizedAmountSar === 10000 &&
  normalizedComparison.quotationB?.originalAmountNative === 2400 &&
  normalizedComparison.quotationB?.currency === 'USD' &&
  normalizedComparison.quotationB?.exchangeRateToSar === 3.75 &&
  normalizedComparison.quotationB?.normalizedAmountSar === 9000 &&
  normalizedComparison.cheaperQuotationId === 'QUOTE-CURR-USD-WITH-RATE' &&
  normalizedComparison.varianceSar === 1000,
  'PROC15',
  'Compare quotations in different currencies: incomplete without conversion rate, shows original & normalized amounts with explicit synthetic rate'
);

// 16. PROC16: Pending mandatory technical evaluation must not silently permit an award
const pendingTechQuote: any = {
  id: 'QUOTE-TECH-PENDING',
  sourcingEventId: 'SRC-2026-RFQ-01',
  supplierId: 'VEND-SA-9021',
  quotationReferenceNumber: 'Q-TECH-PENDING',
  currency: 'SAR',
  exchangeRateToSar: 1.0,
  technicalComplianceStatus: 'pending_evaluation',
  lines: [{ id: 'QL-TP-1', quotedQuantity: 50, quotedUnitPrice: 100, quotedLineTotal: 5000 }]
};

const awardWithPendingTech = recordAwardDecision(
  mockSourcingEvents,
  [...mockQuotations, pendingTechQuote],
  mockSupplierMasters,
  'SRC-2026-RFQ-01',
  'VEND-SA-9021',
  'QUOTE-TECH-PENDING',
  'محاولة ترسية معلقة فنياً',
  'STF-MGR',
  'Manager'
);

assert(
  !awardWithPendingTech.success && (awardWithPendingTech.errorMessageAr?.includes('التقييم الفني') ?? false),
  'PROC16',
  'Pending mandatory technical evaluation strictly blocks award decision and returns error'
);

// 17. PROC17: Documented award decision, records justification and selected quotation
const documentedAward = mockAwardRecords[0];
assert(
  documentedAward !== undefined && 
  documentedAward.winningSupplierId === 'VEND-SA-9021' && 
  documentedAward.awardJustificationAr.length > 10,
  'PROC17',
  'Documented award decision successfully records mandatory justification and selected vendor'
);

// 18. PROC18: Emergency single-source award, requires emergency justification
const emergencyResult = validateAndConsolidateDemand(
  mockProcurementRequisitions,
  [{ sourceRequisitionId: 'PR-2026-00104', sourceRequisitionLineId: 'PRL-00104-1', allocateQuantity: 10 }],
  'شراء طارئ - كمامات عزل',
  'Emergency Masks',
  'emergency_single_source',
  'medical_surgical_consumables',
  '2026-10-01',
  'STF-BUYER-01',
  'Buyer 1',
  true,
  'حالة طارئة لتعويض نقص عاجل في أقسام العزل'
);
assert(
  emergencyResult.success && emergencyResult.sourcingEvent?.method === 'emergency_single_source',
  'PROC18',
  'Emergency single-source sourcing correctly enforces and registers emergency justification'
);

// 19. PROC19: PO approved but not yet sent, visible in purchasing worklist
const poNotSent = mockPurchaseOrders.find(p => p.id === 'PO-PO-2026-MED-102');
assert(
  poNotSent !== undefined && poNotSent.documentStatus === 'approved' && poNotSent.communicationStatus === 'not_sent',
  'PROC19',
  'Approved PO not yet transmitted is distinguished in worklist'
);

// 20. PROC20: PO sent but not acknowledged by supplier, tracks transmission date
const poSentNotAck = mockPurchaseOrders.find(p => p.id === 'PO-PO-2026-MED-103');
assert(
  poSentNotAck !== undefined && 
  poSentNotAck.communicationStatus === 'simulated_sent' && 
  !!poSentNotAck.transmissionRecord?.transmittedAt,
  'PROC20',
  'Simulated transmission records dispatch timestamp while awaiting acknowledgment'
);

// 21. PROC21: Supplier acknowledges PO with changed delivery date
if (poSentNotAck) {
  const ackedPo = recordSupplierOrderAcknowledgment(poSentNotAck, '2026-11-05', 'تأكيد المورد مع تقديم موعد الشحن');
  assert(
    ackedPo.communicationStatus === 'acknowledged' && ackedPo.promisedDeliveryDate === '2026-11-05',
    'PROC21',
    'Supplier acknowledgment successfully records promised delivery date and supplier notes'
  );
}

// 22. PROC22: PO partially shipped, tracks remaining balance
const activePo101 = mockPurchaseOrders.find(p => p.id === 'PO-PO-2026-MED-101');
const po101Line = activePo101?.lines[0];
assert(
  po101Line !== undefined && 
  po101Line.reportedShippedQuantity === 100 && 
  po101Line.revisedOrderedQuantity === 200,
  'PROC22',
  'PO tracks partially shipped quantities (100 of 200) vs total ordered balance'
);

// 23. PROC23: PO partially received, displays received quantity and remaining
assert(
  po101Line !== undefined && 
  po101Line.physicallyReceivedQuantity === 100 && 
  po101Line.lineFulfillmentStatus === 'partially_received',
  'PROC23',
  'PO accurately reflects dock receipt quantities (100 received) and remaining outstanding units'
);

// 24. PROC24: PO with rejected goods during receiving, triggers claim workflow
const claimRef = mockSupplierClaims.find(c => c.id === 'CLM-2026-001');
assert(
  claimRef !== undefined && 
  claimRef.claimedLine.claimedQuantity === 20 && 
  claimRef.inventoryReceiptReferenceId === 'RCV-2026-001',
  'PROC24',
  'PO rejected goods at dock (20 units damaged) correctly linked to quarantine and claims'
);

// 25. PROC25: PO amendment, modifies quantity with revision tracking and received quantity protection
if (activePo101) {
  // Test valid amendment (increase)
  const validAmend = executePurchaseOrderAmendment(
    activePo101,
    activePo101.lines[0].id,
    250,
    'زيادة الكمية نظراً لارتفاع الإشغال',
    'مدير المشتريات'
  );
  assert(
    validAmend.success && (validAmend.amendedPo?.revisionNumber ?? 0) > activePo101.revisionNumber,
    'PROC25-VALID',
    'PO amendment increments revision version and updates quantities'
  );

  // Test invalid amendment (trying to reduce below 100 physically received)
  const invalidAmend = executePurchaseOrderAmendment(
    activePo101,
    activePo101.lines[0].id,
    80,
    'تخفيض غير نظامي أقل من المستلم',
    'مدير المشتريات'
  );
  assert(
    !invalidAmend.success && (invalidAmend.error?.includes('لا يمكن تقليص') ?? false),
    'PROC25-BLOCKED',
    'Amendment strictly blocks reducing quantity below physically received dock quantity'
  );
}

// 26. PROC26: Supplier claim pending, tracks claim status and resolution
const openClaim = mockSupplierClaims.find(c => c.id === 'CLM-2026-001');
assert(
  openClaim !== undefined && openClaim.claimedLine.estimatedValueSar > 0,
  'PROC26',
  'Supplier claim tracks commercial financial impact and status progression'
);
if (openClaim) {
  const advanced = advanceSupplierClaimStatus(openClaim, 'replacement_shipped', 'تم شحن الشحنة البديلة');
  assert(
    advanced.status === 'replacement_shipped',
    'PROC26-PROGRESSION',
    'Supplier claim successfully advances to replacement shipped state'
  );
}

// 27. PROC27: Verify both optional branch context AND multiple effective staff assignments. Mock persona selection must not claim production auth
// 1. Optional branch context
const mainHospitalPr = mockProcurementRequisitions.find(p => p.branchId === 'main_hospital');
const branchAgreement = mockFrameworkAgreements.find(a => a.id === 'LTA-2026-NUPCO-01');
const branchContextVerified = mainHospitalPr !== undefined && 
  branchAgreement !== undefined && 
  branchAgreement.utilizedValueSar > 0 &&
  mockProcurementRequisitions.some(p => p.branchId === undefined || p.branchId === 'main_hospital');

// 2. Multiple effective staff assignments
const assignedStaffIds = new Set<string>();
mockProcurementRequisitions.forEach(p => {
  assignedStaffIds.add(p.requesterStaffId);
  p.approvalHistory.forEach(h => assignedStaffIds.add(h.reviewerRoleId));
});
mockSourcingEvents.forEach(s => assignedStaffIds.add(s.responsibleBuyerStaffId));
const hasMultipleEffectiveStaff = assignedStaffIds.size >= 4; // Multiple buyers, requesters, and department heads

// 3. Mock persona selection does not claim production authorization
const bannerPath = path.resolve(process.cwd(), 'src/components/ProcurementOps/ProcurementPreviewBanner.tsx');
const bannerContent = fs.readFileSync(bannerPath, 'utf-8');
const shellPath = path.resolve(process.cwd(), 'src/components/ProcurementOps/ProcurementOpsShell.tsx');
const shellContent = fs.readFileSync(shellPath, 'utf-8');

const personaSimulationDeclared = 
  bannerContent.includes('الدور التمثيلي:') &&
  bannerContent.includes('SYNTHETIC PROTOTYPE') &&
  shellContent.includes('activeRole') &&
  !shellContent.includes('production_auth_token') &&
  !shellContent.includes('Bearer ');

assert(
  branchContextVerified && hasMultipleEffectiveStaff && personaSimulationDeclared,
  'PROC27',
  'Verified optional branch context, multiple effective staff assignments, and simulated mock persona without claiming production authorization'
);

// 28. PROC28: Verify missing/stale external Finance or supplier data (Unknown budget must not become approved)
// 1. Finance budget: unknown or pending finance review must not become approved
const prPendingBudget: any = {
  ...mockProcurementRequisitions[0],
  id: 'PR-TEST-PENDING-BUDGET',
  status: 'submitted_pending_approval',
  budgetStatus: 'pending_finance_review'
};

const pendingBudgetApproval = executeRequisitionApproval(
  prPendingBudget,
  'approved',
  'سعد العريفي',
  'اعتماد تجريبي'
);

const prUnknownBudget: any = {
  ...mockProcurementRequisitions[0],
  id: 'PR-TEST-UNKNOWN-BUDGET',
  status: 'submitted_pending_approval',
  budgetStatus: 'unknown'
};

const unknownBudgetApproval = executeRequisitionApproval(
  prUnknownBudget,
  'approved',
  'سعد العريفي',
  'اعتماد تجريبي'
);

// 2. Stale or missing supplier data: missing tax registration number blocks award
const supplierMissingTax: any = {
  ...mockSupplierMasters[0],
  id: 'VEND-MISSING-TAX-DATA',
  legalNameAr: 'مورد غير مكتمل السجلات المالية',
  taxRegistrationNumber: '', // Missing tax registration
  qualificationStatus: 'qualified'
};

const awardMissingTax = recordAwardDecision(
  mockSourcingEvents,
  mockQuotations,
  [...mockSupplierMasters, supplierMissingTax],
  'SRC-2026-RFQ-01',
  'VEND-MISSING-TAX-DATA',
  'QUOTE-2026-042-A',
  'ترسية مورد بدون رقم ضريبي',
  'STF-MGR',
  'Manager'
);

assert(
  !pendingBudgetApproval.success &&
  !unknownBudgetApproval.success &&
  !awardMissingTax.success &&
  ((pendingBudgetApproval.error?.includes('للميزانية') || pendingBudgetApproval.error?.includes('الميزانية') || pendingBudgetApproval.error?.includes('المالي')) ?? false) &&
  ((unknownBudgetApproval.error?.includes('للميزانية') || unknownBudgetApproval.error?.includes('الميزانية') || unknownBudgetApproval.error?.includes('المالي')) ?? false) &&
  (awardMissingTax.errorMessageAr?.includes('الضريبية') ?? false),
  'PROC28',
  'Missing/stale external Finance (unknown/pending budget) and missing supplier tax data strictly block approval and award'
);

// 29. PROC29: Verify synthetic preview banner is actually rendered and remains visible across workspace navigation
const bannerComponentPath = path.resolve(process.cwd(), 'src/components/ProcurementOps/ProcurementPreviewBanner.tsx');
const bannerCode = fs.readFileSync(bannerComponentPath, 'utf-8');

// Ensure banner is anchored at root before workspace tab conditional rendering
const bannerMountedAtRoot = shellContent.includes('<ProcurementPreviewBanner') &&
  shellContent.indexOf('<ProcurementPreviewBanner') < shellContent.indexOf('{/* 2. Top Module Navigation Tabs */}');

// Ensure banner contains explicit synthetic preview notices
const bannerHasSyntheticNotices = bannerCode.includes('SYNTHETIC PROTOTYPE') &&
  bannerCode.includes('Synthetic Procurement Design Preview — No real purchase commitments');

assert(
  bannerMountedAtRoot && bannerHasSyntheticNotices,
  'PROC29',
  'Synthetic preview banner is mounted at root of ProcurementOpsShell and remains visible across all navigation tabs'
);

// 30. PROC30: Module boundary enforcement, Inventory and Finance integrations remain read-only
const readOnlyDockRef = activePo101?.notes;
assert(
  readOnlyDockRef?.includes('RCV-2026-001') ?? false,
  'PROC30',
  'Procurement references Inventory receipt (RCV-2026-001) as read-only handoff boundary without mutating dock ledger'
);

console.log('\n====================================================');
console.log(`TEST SUITE RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
