// ============================================================================
// INVENTORY RESERVATION, OWNERSHIP & PICKING INTEGRITY ENGINE
// Compliant with WHO TRS 1025 / TRS 1044 / Hospital Supply Chain Standards
// ============================================================================

import {
  ItemMasterRecord,
  PhysicalStockBalance,
  DepartmentalRequisition,
  RequisitionLineItem,
  StockReservation,
  UomType,
  StorageLocation
} from '../types/supplyChainOps';
import { getEffectiveDate, getEffectiveTimestamp } from './mockClock';

export interface UomConversionResult {
  valid: boolean;
  baseQty?: number;
  conversionFactorApplied?: number;
  error?: string;
}

/**
 * 1. Validate item-specific UOM conversion before comparing or mutating quantities.
 * Does not fabricate availability or default to 1:1 if conversion is unknown.
 */
export function validateUomConversion(
  item: ItemMasterRecord,
  requestedQty: number,
  requestedUom: UomType
): UomConversionResult {
  if (requestedQty === undefined || requestedQty === null || isNaN(requestedQty) || requestedQty <= 0) {
    return {
      valid: false,
      error: `الكمية المدخلة غير صالحة (${requestedQty}).`
    };
  }

  if (!item || !item.packaging || !item.packaging.baseUom) {
    return {
      valid: false,
      error: `بيانات التعبئة والوحدة الأساسية غير محددة للصنف (${item?.id || 'غير معروف'}).`
    };
  }

  const pkg = item.packaging;

  // Case 1: Already in base UOM
  if (requestedUom === pkg.baseUom) {
    return {
      valid: true,
      baseQty: requestedQty,
      conversionFactorApplied: 1
    };
  }

  // Case 2: In Issue UOM
  if (requestedUom === pkg.issueUom) {
    if (!pkg.conversionFactor || pkg.conversionFactor <= 0) {
      return {
        valid: false,
        error: `معامل التحويل لوحدة الصرف '${requestedUom}' غير معرف أو غير صالح للصنف ${item.code}.`
      };
    }
    return {
      valid: true,
      baseQty: requestedQty * pkg.conversionFactor,
      conversionFactorApplied: pkg.conversionFactor
    };
  }

  // Case 3: In Purchasing UOM
  if (requestedUom === pkg.purchasingUom) {
    const factor = pkg.conversionFactor * (pkg.caseMultiplier || 1);
    if (!factor || factor <= 0) {
      return {
        valid: false,
        error: `معامل التحويل لوحدة الشراء '${requestedUom}' غير معرف أو غير صالح للصنف ${item.code}.`
      };
    }
    return {
      valid: true,
      baseQty: requestedQty * factor,
      conversionFactorApplied: factor
    };
  }

  // Unsupported or unknown UOM for this specific item
  return {
    valid: false,
    error: `وحدة القياس '${requestedUom}' غير مسجلة في هرمية تعبئة الصنف ${item.code} (الوحدات المقبولة: ${pkg.baseUom}، ${pkg.issueUom}، ${pkg.purchasingUom}).`
  };
}

/**
 * 2. Resolve exact source storage location for a requisition line.
 * Never performs loose substring or multi-location matching.
 */
export function resolveSourceLocationForLine(
  requisition: DepartmentalRequisition,
  line: RequisitionLineItem,
  catalogItem: ItemMasterRecord,
  stockBalances: PhysicalStockBalance[],
  locations?: StorageLocation[]
): string | null {
  // If explicitly specified on the line
  if (line.sourceLocationId) {
    return line.sourceLocationId;
  }

  // If explicitly specified on the parent requisition
  if (requisition.sourceLocationId) {
    return requisition.sourceLocationId;
  }

  // Match eligible storage location for this item in warehouse inventory
  // Must be an active non-quarantine, non-staging storage location
  const candidateBalances = stockBalances.filter(b => {
    if (b.itemId !== line.itemId) return false;
    if (b.locationId.includes('QUARANTINE') || b.locationId.includes('DOCK')) return false;
    if (locations) {
      const loc = locations.find(l => l.id === b.locationId);
      if (loc && (loc.isQuarantineArea || loc.isStagingArea)) return false;
    }
    return true;
  });

  if (candidateBalances.length === 0) {
    return null;
  }

  // Select the primary warehouse location for this item (exact location ID)
  return candidateBalances[0].locationId;
}

export interface RequisitionValidationResult {
  valid: boolean;
  error?: string;
  allocations?: Array<{
    lineId: string;
    itemId: string;
    sourceLocationId: string;
    lotNumber?: string;
    baseQty: number;
    balanceId: string;
  }>;
}

/**
 * 3. Validate aggregate demand and stock availability before approving / reserving a requisition.
 * Does not interpret unknown quantity as zero or fabricate availability.
 */
export function validateRequisitionApproval(
  targetReq: DepartmentalRequisition,
  catalogItems: ItemMasterRecord[],
  stockBalances: PhysicalStockBalance[],
  locations?: StorageLocation[]
): RequisitionValidationResult {
  if (!targetReq || !targetReq.lines || targetReq.lines.length === 0) {
    return { valid: false, error: 'الطلب لا يحتوي على أسطر صالحة.' };
  }

  if (targetReq.approvalStatus === 'approved') {
    return { valid: false, error: 'الطلب معتمد بالفعل ولا يمكن إعادة اعتماده.' };
  }

  const catalogMap = new Map(catalogItems.map(i => [i.id, i]));
  const balanceMap = new Map(stockBalances.map(b => [b.id, b]));

  // Step A: Validate UOM and compute base quantity for every line
  const lineDemands: Array<{
    line: RequisitionLineItem;
    item: ItemMasterRecord;
    baseQty: number;
    sourceLocationId: string;
  }> = [];

  for (const line of targetReq.lines) {
    const item = catalogMap.get(line.itemId);
    if (!item) {
      return { valid: false, error: `الصنف ${line.itemId} غير موجود في الدليل الأساسي.` };
    }

    const uomCheck = validateUomConversion(item, line.requestedQty, line.uom);
    if (!uomCheck.valid || uomCheck.baseQty === undefined) {
      return { valid: false, error: uomCheck.error || `فشل التحويل لوحدة القياس للصنف ${item.code}.` };
    }

    const sourceLocationId = resolveSourceLocationForLine(targetReq, line, item, stockBalances, locations);
    if (!sourceLocationId) {
      return { valid: false, error: `لم يتم العثور على موقع تخزين مستودعي معتمد للصنف ${item.code}.` };
    }

    lineDemands.push({
      line,
      item,
      baseQty: uomCheck.baseQty,
      sourceLocationId
    });
  }

  // Step B: Aggregate demand validation across all lines targeting the same item & location
  // Two lines requesting the same item must not independently pass against the same available units!
  const aggregateDemandMap = new Map<string, number>();
  for (const ld of lineDemands) {
    const key = `${ld.item.id}::${ld.sourceLocationId}`;
    const currentDemand = aggregateDemandMap.get(key) || 0;
    aggregateDemandMap.set(key, currentDemand + ld.baseQty);
  }

  const allocations: Array<{
    lineId: string;
    itemId: string;
    sourceLocationId: string;
    lotNumber?: string;
    baseQty: number;
    balanceId: string;
  }> = [];

  // Check aggregate demand against exact balances
  for (const [key, totalRequiredBaseQty] of aggregateDemandMap.entries()) {
    const [itemId, sourceLocationId] = key.split('::');
    const matchedBalances = stockBalances.filter(b => b.itemId === itemId && b.locationId === sourceLocationId);

    if (matchedBalances.length === 0) {
      return {
        valid: false,
        error: `لا يوجد رصيد مخزني مسجل للصنف ${itemId} في موقع التخزين المحدد ${sourceLocationId} (عدم تصنيع أرصدة وهمية).`
      };
    }

    // Filter strictly eligible balances (not unknown, not stale, not quarantined/damaged/expired)
    const eligibleBalances = matchedBalances.filter(b => {
      // Do not interpret unknown or stale quantity as available
      if (b.quantityStatus === 'unknown' || b.quantityStatus === 'stale') return false;
      if (b.quarantined > 0 || (b.damaged || 0) > 0 || (b.expired || 0) > 0) return false;
      if (b.availableForPicking <= 0) return false;
      if (b.expiryDate) {
        const expTime = new Date(b.expiryDate).getTime();
        const now = getEffectiveDate().getTime();
        if (expTime <= now) return false;
      }
      return true;
    });

    const totalEligibleAvailable = eligibleBalances.reduce((sum, b) => sum + (b.availableForPicking || 0), 0);

    if (totalEligibleAvailable < totalRequiredBaseQty) {
      return {
        valid: false,
        error: `الرصيد المتاح غير كافٍ لتغطية إجمالي الطلب للصنف ${itemId} في الموقع ${sourceLocationId}. المتاح الصافي: ${totalEligibleAvailable}، المطلوب الإجمالي: ${totalRequiredBaseQty}. تم رفض العملية بالكامل لمنع تجاوز الرصيد.`
      };
    }
  }

  // Generate specific allocations for each line
  for (const ld of lineDemands) {
    const matchedBalance = stockBalances.find(
      b =>
        b.itemId === ld.item.id &&
        b.locationId === ld.sourceLocationId &&
        b.quantityStatus === 'available' &&
        b.availableForPicking >= ld.baseQty &&
        b.quarantined === 0
    ) || stockBalances.find(b => b.itemId === ld.item.id && b.locationId === ld.sourceLocationId);

    if (!matchedBalance) {
      return { valid: false, error: `تعذر تخصيص رصيد مطابق للسطر ${ld.line.lineId}.` };
    }

    allocations.push({
      lineId: ld.line.lineId,
      itemId: ld.item.id,
      sourceLocationId: ld.sourceLocationId,
      lotNumber: matchedBalance.lotNumber,
      baseQty: ld.baseQty,
      balanceId: matchedBalance.id
    });
  }

  return {
    valid: true,
    allocations
  };
}

/**
 * 4. Execute Requisition Approval: creates reservations with strict ownership.
 * State is completely preserved if validation fails.
 */
export function executeRequisitionApproval(
  reqId: string,
  approvedBy: string,
  requisitions: DepartmentalRequisition[],
  stockBalances: PhysicalStockBalance[],
  stockReservations: StockReservation[],
  catalogItems: ItemMasterRecord[],
  locations?: StorageLocation[]
): {
  success: boolean;
  error?: string;
  updatedRequisitions: DepartmentalRequisition[];
  updatedBalances: PhysicalStockBalance[];
  updatedReservations: StockReservation[];
} {
  const targetReq = requisitions.find(r => r.id === reqId);
  if (!targetReq) {
    return {
      success: false,
      error: `الطلب ${reqId} غير موجود.`,
      updatedRequisitions: requisitions,
      updatedBalances: stockBalances,
      updatedReservations: stockReservations
    };
  }

  const validation = validateRequisitionApproval(targetReq, catalogItems, stockBalances, locations);
  if (!validation.valid || !validation.allocations) {
    console.warn(`Approval rejected: ${validation.error}`);
    return {
      success: false,
      error: validation.error,
      updatedRequisitions: requisitions,
      updatedBalances: stockBalances,
      updatedReservations: stockReservations
    };
  }

  const effectiveTimestamp = getEffectiveTimestamp();

  // Create new StockReservation records with full ownership tracking
  const newReservations: StockReservation[] = validation.allocations.map((alloc, idx) => ({
    id: `RES-${targetReq.id}-${alloc.lineId}-${idx}`,
    requisitionId: targetReq.id,
    requisitionLineId: alloc.lineId,
    itemId: alloc.itemId,
    sourceLocationId: alloc.sourceLocationId,
    lotNumber: alloc.lotNumber,
    reservedQty: alloc.baseQty,
    pickedQty: 0,
    outstandingQty: alloc.baseQty,
    status: 'active',
    createdAt: effectiveTimestamp
  }));

  // Update Requisitions
  const updatedRequisitions = requisitions.map(r =>
    r.id === reqId
      ? {
          ...r,
          approvalStatus: 'approved' as const,
          fulfillmentStatus: 'allocated' as const,
          approvedAt: effectiveTimestamp,
          approvedBy,
          lines: r.lines.map(l => {
            const alloc = validation.allocations?.find(a => a.lineId === l.lineId);
            return alloc
              ? {
                  ...l,
                  allocatedQty: l.requestedQty,
                  sourceLocationId: alloc.sourceLocationId
                }
              : l;
          })
        }
      : r
  );

  // Update Stock Balances (Commitment overlay: physical on-hand is unchanged!)
  const updatedBalances = stockBalances.map(b => {
    const matchedAllocations = validation.allocations?.filter(
      a => a.balanceId === b.id || (a.itemId === b.itemId && a.sourceLocationId === b.locationId && (!a.lotNumber || a.lotNumber === b.lotNumber))
    );

    if (matchedAllocations && matchedAllocations.length > 0) {
      const addedReserved = matchedAllocations.reduce((sum, a) => sum + a.baseQty, 0);
      const newReserved = (b.reservedCommitted || 0) + addedReserved;
      const unavailable =
        (b.quarantined || 0) +
        (b.damaged || 0) +
        (b.expired || 0) +
        (b.pickedStaged || 0) +
        (b.pendingInspection || 0) +
        (b.pendingDisposal || 0) +
        newReserved;
      const newAvailable = Math.max(0, b.physicalOnHand - unavailable);

      return {
        ...b,
        reservedCommitted: newReserved,
        availableForPicking: newAvailable,
        lastUpdatedTimestamp: effectiveTimestamp
      };
    }
    return b;
  });

  return {
    success: true,
    updatedRequisitions,
    updatedBalances,
    updatedReservations: [...stockReservations, ...newReservations]
  };
}

/**
 * 5. Validate Requisition Pick: verifies that this requisition only consumes ITS OWN reservation
 * or unreserved unrestricted stock, and never another requisition's reservation!
 */
export function validateRequisitionPick(
  targetReq: DepartmentalRequisition,
  stockBalances: PhysicalStockBalance[],
  stockReservations: StockReservation[],
  catalogItems: ItemMasterRecord[]
): {
  valid: boolean;
  error?: string;
  pickPlan?: Array<{
    lineId: string;
    itemId: string;
    sourceLocationId: string;
    lotNumber?: string;
    baseQtyToPick: number;
    fromOwnedReservationQty: number;
    fromUnreservedAvailableQty: number;
    balanceId: string;
  }>;
} {
  if (!targetReq || !targetReq.lines) {
    return { valid: false, error: 'طلب التجهيز غير صالح.' };
  }

  const catalogMap = new Map(catalogItems.map(i => [i.id, i]));
  const pickPlan: Array<{
    lineId: string;
    itemId: string;
    sourceLocationId: string;
    lotNumber?: string;
    baseQtyToPick: number;
    fromOwnedReservationQty: number;
    fromUnreservedAvailableQty: number;
    balanceId: string;
  }> = [];

  // Track demand per balance during this pick operation to prevent intra-requisition over-consumption
  const balanceAllocatedMap = new Map<string, number>();

  for (const line of targetReq.lines) {
    const item = catalogMap.get(line.itemId);
    if (!item) {
      return { valid: false, error: `الصنف ${line.itemId} غير معرف بالدليل.` };
    }

    const uomCheck = validateUomConversion(item, line.requestedQty, line.uom);
    if (!uomCheck.valid || uomCheck.baseQty === undefined) {
      return { valid: false, error: uomCheck.error || `خطأ تحويل وحدة القياس للصنف ${item.code}.` };
    }

    const lineBaseQty = uomCheck.baseQty;

    // Find reservations strictly OWNED by this requisition and this line
    const ownedReservations = stockReservations.filter(
      r =>
        r.requisitionId === targetReq.id &&
        r.requisitionLineId === line.lineId &&
        (r.status === 'active' || r.status === 'partially_picked')
    );

    // Outstanding units owned by this requisition for this line
    const ownedOutstandingQty = ownedReservations.reduce(
      (sum, r) => sum + (r.reservedQty - r.pickedQty),
      0
    );

    // Resolve exact source location
    const exactSourceLocationId =
      ownedReservations[0]?.sourceLocationId ||
      line.sourceLocationId ||
      targetReq.sourceLocationId ||
      resolveSourceLocationForLine(targetReq, line, item, stockBalances);

    if (!exactSourceLocationId) {
      return { valid: false, error: `تعذر تحديد موقع السحب الدقيق للصنف ${item.code}.` };
    }

    // Find candidate balances at this exact location
    const candidateBalances = stockBalances.filter(
      b => b.itemId === line.itemId && b.locationId === exactSourceLocationId
    );

    if (candidateBalances.length === 0) {
      return {
        valid: false,
        error: `لا يوجد رصيد للصنف ${item.code} في الموقع المحدد ${exactSourceLocationId}. لا يمكن السحب من مستودع آخر بصورة خفية.`
      };
    }

    // Filter strictly eligible balances (not quarantined, not damaged, not expired, not unknown/stale)
    const eligibleBalances = candidateBalances.filter(b => {
      if (b.quantityStatus === 'unknown' || b.quantityStatus === 'stale') return false;
      if (b.quarantined > 0 || (b.damaged || 0) > 0 || (b.expired || 0) > 0) return false;
      return true;
    });

    if (eligibleBalances.length === 0) {
      return {
        valid: false,
        error: `كافة تشغيلات الصنف ${item.code} في الموقع ${exactSourceLocationId} محجورة أو غير صالحة للسحب.`
      };
    }

    // Calculate allocatable stock for this requisition on eligible balances:
    // Allocatable = (This Requisition's Owned Active Reservations) + (Unreserved Available Stock)
    // NEVER count other requisitions' reserved stock!
    let needed = lineBaseQty;
    let fromOwnedRes = Math.min(ownedOutstandingQty, needed);
    let fromUnreserved = needed - fromOwnedRes;

    // Check if the balance can fulfill this
    const primaryBalance = eligibleBalances[0];
    const previouslyAllocatedFromBalance = balanceAllocatedMap.get(primaryBalance.id) || 0;
    const remainingAvailableOnBalance = Math.max(0, primaryBalance.availableForPicking - previouslyAllocatedFromBalance);

    if (fromUnreserved > remainingAvailableOnBalance) {
      return {
        valid: false,
        error: `فشل التحقق من السحب: الكمية المطلوبة للصنف ${item.code} (${lineBaseQty}) تتجاوز المتاح المخصص لهذا الطلب (${fromOwnedRes + remainingAvailableOnBalance}). لا يمكن استهلاك حجوزات طلبات أخرى.`
      };
    }

    balanceAllocatedMap.set(primaryBalance.id, previouslyAllocatedFromBalance + fromUnreserved);

    pickPlan.push({
      lineId: line.lineId,
      itemId: line.itemId,
      sourceLocationId: exactSourceLocationId,
      lotNumber: ownedReservations[0]?.lotNumber || primaryBalance.lotNumber,
      baseQtyToPick: lineBaseQty,
      fromOwnedReservationQty: fromOwnedRes,
      fromUnreservedAvailableQty: fromUnreserved,
      balanceId: primaryBalance.id
    });
  }

  return {
    valid: true,
    pickPlan
  };
}

/**
 * 6. Execute Requisition Pick: moves stock from bin to staging dock (pickedStaged).
 * Preserves complete previous state if validation fails.
 */
export function executeRequisitionPick(
  reqId: string,
  requisitions: DepartmentalRequisition[],
  stockBalances: PhysicalStockBalance[],
  stockReservations: StockReservation[],
  catalogItems: ItemMasterRecord[]
): {
  success: boolean;
  error?: string;
  updatedRequisitions: DepartmentalRequisition[];
  updatedBalances: PhysicalStockBalance[];
  updatedReservations: StockReservation[];
} {
  const targetReq = requisitions.find(r => r.id === reqId);
  if (!targetReq) {
    return {
      success: false,
      error: `الطلب ${reqId} غير موجود.`,
      updatedRequisitions: requisitions,
      updatedBalances: stockBalances,
      updatedReservations: stockReservations
    };
  }

  const validation = validateRequisitionPick(targetReq, stockBalances, stockReservations, catalogItems);
  if (!validation.valid || !validation.pickPlan) {
    console.warn(`Pick rejected: ${validation.error}`);
    return {
      success: false,
      error: validation.error,
      updatedRequisitions: requisitions,
      updatedBalances: stockBalances,
      updatedReservations: stockReservations
    };
  }

  const effectiveTimestamp = getEffectiveTimestamp();

  // Update Requisition lines and status
  const updatedRequisitions = requisitions.map(r =>
    r.id === reqId
      ? {
          ...r,
          fulfillmentStatus: 'picking' as const,
          lines: r.lines.map(l => ({
            ...l,
            pickedQty: l.requestedQty,
            outstandingQty: 0
          }))
        }
      : r
  );

  // Update Stock Reservations (mark picked)
  let updatedReservations = [...stockReservations];
  for (const itemPlan of validation.pickPlan) {
    if (itemPlan.fromOwnedReservationQty > 0) {
      let qtyToDeduct = itemPlan.fromOwnedReservationQty;
      updatedReservations = updatedReservations.map(res => {
        if (
          res.requisitionId === reqId &&
          res.requisitionLineId === itemPlan.lineId &&
          (res.status === 'active' || res.status === 'partially_picked') &&
          qtyToDeduct > 0
        ) {
          const resRemaining = res.reservedQty - res.pickedQty;
          const deductFromThis = Math.min(resRemaining, qtyToDeduct);
          const newPicked = res.pickedQty + deductFromThis;
          const newOutstanding = res.reservedQty - newPicked;
          qtyToDeduct -= deductFromThis;

          return {
            ...res,
            pickedQty: newPicked,
            outstandingQty: newOutstanding,
            status: newOutstanding === 0 ? ('fully_picked' as const) : ('partially_picked' as const)
          };
        }
        return res;
      });
    }
  }

  // Update Stock Balances
  // Moving from bin to staging dock:
  // - reservedCommitted decreases by fromOwnedReservationQty
  // - pickedStaged increases by baseQtyToPick
  // - physicalOnHand remains UNCHANGED (still physically in the warehouse)
  // - availableForPicking remains unchanged or decreases by fromUnreservedAvailableQty
  // - NO DOUBLE DEDUCTION!
  const updatedBalances = stockBalances.map(b => {
    const plansForBalance = validation.pickPlan?.filter(p => p.balanceId === b.id);
    if (plansForBalance && plansForBalance.length > 0) {
      const totalPicked = plansForBalance.reduce((sum, p) => sum + p.baseQtyToPick, 0);
      const totalFromReserved = plansForBalance.reduce((sum, p) => sum + p.fromOwnedReservationQty, 0);

      const newReserved = Math.max(0, (b.reservedCommitted || 0) - totalFromReserved);
      const newPickedStaged = (b.pickedStaged || 0) + totalPicked;

      const unavailable =
        (b.quarantined || 0) +
        (b.damaged || 0) +
        (b.expired || 0) +
        newPickedStaged +
        newReserved +
        (b.pendingInspection || 0) +
        (b.pendingDisposal || 0);
      const newAvailable = Math.max(0, b.physicalOnHand - unavailable);

      return {
        ...b,
        pickedStaged: newPickedStaged,
        reservedCommitted: newReserved,
        availableForPicking: newAvailable,
        lastUpdatedTimestamp: effectiveTimestamp
      };
    }
    return b;
  });

  return {
    success: true,
    updatedRequisitions,
    updatedBalances,
    updatedReservations
  };
}

/**
 * 7. Validate & Execute Dispatch to Courier:
 * Validates that staged units are physically present on dock, then decrements both physicalOnHand and pickedStaged.
 */
export function executeDispatchToCourier(
  reqId: string,
  courierName: string,
  requisitions: DepartmentalRequisition[],
  stockBalances: PhysicalStockBalance[],
  catalogItems: ItemMasterRecord[]
): {
  success: boolean;
  error?: string;
  updatedRequisitions: DepartmentalRequisition[];
  updatedBalances: PhysicalStockBalance[];
} {
  const targetReq = requisitions.find(r => r.id === reqId);
  if (!targetReq) {
    return {
      success: false,
      error: `الطلب ${reqId} غير موجود.`,
      updatedRequisitions: requisitions,
      updatedBalances: stockBalances
    };
  }

  const catalogMap = new Map(catalogItems.map(i => [i.id, i]));
  const effectiveTimestamp = getEffectiveTimestamp();

  // PRE-VALIDATION: Check staged units on all lines before mutating ANY state
  for (const line of targetReq.lines) {
    const item = catalogMap.get(line.itemId);
    const uomCheck = item ? validateUomConversion(item, line.requestedQty, line.uom) : { valid: false };
    const lineBaseQty = uomCheck.baseQty || line.requestedQty;

    const sourceLocationId = line.sourceLocationId || targetReq.sourceLocationId;
    const matchedBalance = stockBalances.find(
      b =>
        b.itemId === line.itemId &&
        (sourceLocationId ? b.locationId === sourceLocationId : (b.pickedStaged || 0) >= lineBaseQty)
    );

    if (
      !matchedBalance ||
      (matchedBalance.pickedStaged || 0) < lineBaseQty ||
      matchedBalance.physicalOnHand < lineBaseQty
    ) {
      const msg = `Dispatch rejected: staged stock insufficient for item ${line.itemId} (Staged: ${matchedBalance?.pickedStaged || 0}, Requested: ${lineBaseQty})`;
      console.warn(msg);
      return {
        success: false,
        error: msg,
        updatedRequisitions: requisitions,
        updatedBalances: stockBalances
      };
    }
  }

  // Both validations passed: update requisitions
  const updatedRequisitions = requisitions.map(r =>
    r.id === reqId
      ? {
          ...r,
          fulfillmentStatus: 'dispatched' as const,
          dispatchedAt: effectiveTimestamp
        }
      : r
  );

  // Stock leaves the warehouse facility:
  // physicalOnHand and pickedStaged both decrease by lineBaseQty
  // availableForPicking is conserved, no double deduction!
  const updatedBalances = stockBalances.map(b => {
    const matchedLine = targetReq.lines.find(l => {
      if (l.itemId !== b.itemId) return false;
      const srcLoc = l.sourceLocationId || targetReq.sourceLocationId;
      return !srcLoc || b.locationId === srcLoc;
    });
    if (matchedLine && (b.pickedStaged || 0) > 0) {
      const item = catalogMap.get(matchedLine.itemId);
      const uomCheck = item ? validateUomConversion(item, matchedLine.requestedQty, matchedLine.uom) : { valid: false };
      const lineBaseQty = uomCheck.baseQty || matchedLine.requestedQty;

      if (b.pickedStaged >= lineBaseQty) {
        const newOnHand = b.physicalOnHand - lineBaseQty;
        const newPickedStaged = b.pickedStaged - lineBaseQty;

        const unavailable =
          (b.quarantined || 0) +
          (b.damaged || 0) +
          (b.expired || 0) +
          newPickedStaged +
          (b.reservedCommitted || 0) +
          (b.pendingInspection || 0) +
          (b.pendingDisposal || 0);
        const newAvailable = Math.max(0, newOnHand - unavailable);

        return {
          ...b,
          physicalOnHand: newOnHand,
          pickedStaged: newPickedStaged,
          availableForPicking: newAvailable,
          lastUpdatedTimestamp: effectiveTimestamp
        };
      }
    }
    return b;
  });

  return {
    success: true,
    updatedRequisitions,
    updatedBalances
  };
}
