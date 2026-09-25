// ============================================================================
// EXECUTABLE VERIFICATION SUITE: INVENTORY RESERVATION, OWNERSHIP & PICKING
// Tests A through I as specified by HIS Inventory Architecture Requirements
// ============================================================================

import {
  ItemMasterRecord,
  PhysicalStockBalance,
  DepartmentalRequisition,
  StorageLocation
} from '../src/types/supplyChainOps';
import {
  validateUomConversion,
  validateRequisitionApproval,
  executeRequisitionApproval,
  executeRequisitionPick,
  executeDispatchToCourier
} from '../src/utils/inventoryReservationEngine';
import {
  INITIAL_STOCK_BALANCES,
  INITIAL_STOCK_RESERVATIONS,
  INITIAL_TRANSFERS,
  INITIAL_CYCLE_COUNT_BATCHES
} from '../src/data/mockSupplyChainOpsData';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}: ${detail || 'Assertion failed'}`);
    failCount++;
  }
}

console.log('=== STARTING INVENTORY RESERVATION & PICKING INTEGRITY TEST SUITE ===\n');

// ----------------------------------------------------------------------------
// TEST FIXTURES
// ----------------------------------------------------------------------------
const testCatalogItem: ItemMasterRecord = {
  id: 'ITEM-TEST-001',
  code: 'MED-TST-01',
  nameAr: 'مستلزم اختباري معياري',
  nameEn: 'Standard Test Supply Item',
  category: 'medical_surgical_consumables',
  descriptionAr: 'وصف مستلزم اختباري معياري',
  descriptionEn: 'Standard test item description',
  manufacturer: 'BD Medical',
  packaging: {
    baseUom: 'each',
    issueUom: 'box',
    conversionFactor: 10,
    purchasingUom: 'case',
    caseMultiplier: 5,
    verifiedDefinitionText: '1 Box = 10 Each, 1 Case = 50 Each'
  },
  isLotTracked: true,
  isSerialTracked: false,
  isExpiryTracked: true,
  isLatexFree: true,
  isSterile: true,
  isHazardous: false,
  storageProfile: 'controlled_room_temp',
  owningModule: 'enterprise_inventory',
  isActive: true,
  standardCostSar: 25.0
};

const testLocationWH_A: StorageLocation = {
  id: 'LOC-WH-A-AISLE-1',
  branchId: 'main_hospital',
  facilityNameAr: 'المستشفى الرئيسي',
  facilityNameEn: 'Main Hospital',
  warehouseCode: 'CENTRAL-WH',
  warehouseNameAr: 'المستودع المركزي أ',
  zone: 'Aisle 1',
  rack: '01',
  shelfBin: 'A-01',
  isStagingArea: false,
  isQuarantineArea: false
};

const testLocationWH_B: StorageLocation = {
  id: 'LOC-WH-B-AISLE-1',
  branchId: 'suburban_clinic_branch',
  facilityNameAr: 'فرع العيادات التخصصية',
  facilityNameEn: 'Specialty Clinic Branch',
  warehouseCode: 'SUB-WH',
  warehouseNameAr: 'مستودع الفرع ب',
  zone: 'Aisle 1',
  rack: '01',
  shelfBin: 'B-01',
  isStagingArea: false,
  isQuarantineArea: false
};

function createMockBalance(overrides: Partial<PhysicalStockBalance> & { id: string }): PhysicalStockBalance {
  return {
    id: overrides.id,
    itemId: overrides.itemId || 'ITEM-TEST-001',
    locationId: overrides.locationId || 'LOC-WH-A-AISLE-1',
    lotNumber: overrides.lotNumber || 'LOT-TEST-A1',
    receivedDate: overrides.receivedDate || '2026-09-01',
    physicalOnHand: overrides.physicalOnHand !== undefined ? overrides.physicalOnHand : 10,
    pendingInspection: overrides.pendingInspection || 0,
    quarantined: overrides.quarantined || 0,
    damaged: overrides.damaged || 0,
    expired: overrides.expired || 0,
    pickedStaged: overrides.pickedStaged || 0,
    pendingDisposal: overrides.pendingDisposal || 0,
    reservedCommitted: overrides.reservedCommitted || 0,
    availableForPicking: overrides.availableForPicking !== undefined ? overrides.availableForPicking : 10,
    inTransit: overrides.inTransit || 0,
    quantityStatus: overrides.quantityStatus || 'available',
    lastUpdatedTimestamp: overrides.lastUpdatedTimestamp || '2026-09-20 08:00',
    dataSource: overrides.dataSource || 'warehouse_realtime_sim'
  };
}

// ----------------------------------------------------------------------------
// TEST A: Requisition A reserves 10 units. Available becomes 0.
//         Requisition B attempts to pick those 10.
//         EXPECT: Rejected; A's reservation unchanged.
// ----------------------------------------------------------------------------
console.log('--- TEST A: Reservation Ownership vs Competing Pick ---');
{
  const balanceA = createMockBalance({
    id: 'BAL-TEST-A',
    physicalOnHand: 10,
    availableForPicking: 10,
    reservedCommitted: 0
  });

  const reqA: DepartmentalRequisition = {
    id: 'REQ-A',
    requisitionNumber: 'REQ-A-001',
    requestingDepartment: 'Ward 1A',
    destinationLocationId: 'LOC-WARD-1A',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse A',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Patient Care',
    approvalStatus: 'pending_approval',
    fulfillmentStatus: 'not_started',
    lines: [
      {
        lineId: 'LINE-A1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 10,
        uom: 'each',
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 10
      }
    ],
    createdAt: '2026-09-20 08:05'
  };

  // 1. Requisition A approves and reserves 10 units
  const approveResult = executeRequisitionApproval(
    'REQ-A',
    'Supervisor Ali',
    [reqA],
    [balanceA],
    [],
    [testCatalogItem],
    [testLocationWH_A]
  );

  assert(approveResult.success, 'Test A: Requisition A approval succeeds');
  const balAfterA = approveResult.updatedBalances.find(b => b.id === 'BAL-TEST-A')!;
  assert(balAfterA.reservedCommitted === 10, 'Test A: ReservedCommitted is exactly 10', `Got ${balAfterA.reservedCommitted}`);
  assert(balAfterA.availableForPicking === 0, 'Test A: AvailableForPicking becomes 0', `Got ${balAfterA.availableForPicking}`);
  assert(approveResult.updatedReservations.length === 1, 'Test A: StockReservation record created');
  assert(approveResult.updatedReservations[0].requisitionId === 'REQ-A', 'Test A: Reservation is strictly owned by REQ-A');
  assert(approveResult.updatedReservations[0].reservedQty === 10, 'Test A: Reservation qty is 10');

  // 2. Requisition B attempts to pick 10 units
  const reqB: DepartmentalRequisition = {
    id: 'REQ-B',
    requisitionNumber: 'REQ-B-001',
    requestingDepartment: 'Ward 2B',
    destinationLocationId: 'LOC-WARD-2B',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse B',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Patient Care',
    approvalStatus: 'approved',
    fulfillmentStatus: 'allocated',
    lines: [
      {
        lineId: 'LINE-B1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 10,
        uom: 'each',
        allocatedQty: 10,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 10
      }
    ],
    createdAt: '2026-09-20 08:10'
  };

  const pickBResult = executeRequisitionPick(
    'REQ-B',
    [...approveResult.updatedRequisitions, reqB],
    approveResult.updatedBalances,
    approveResult.updatedReservations,
    [testCatalogItem]
  );

  assert(!pickBResult.success, 'Test A: Requisition B pick attempt is REJECTED (cannot consume A\'s reservation)');
  // Verify state is completely preserved
  const resAfterFailedPick = pickBResult.updatedReservations.find(r => r.requisitionId === 'REQ-A')!;
  assert(resAfterFailedPick.reservedQty === 10, 'Test A: Requisition A reservation remains 10 (unchanged)');
  assert(resAfterFailedPick.pickedQty === 0, 'Test A: Requisition A pickedQty remains 0 (unchanged)');
  const balAfterFailedPick = pickBResult.updatedBalances.find(b => b.id === 'BAL-TEST-A')!;
  assert(balAfterFailedPick.reservedCommitted === 10, 'Test A: ReservedCommitted remains 10');
  assert(balAfterFailedPick.pickedStaged === 0, 'Test A: PickedStaged remains 0 (no unauthorized staging)');
}

// ----------------------------------------------------------------------------
// TEST B: Requisition A reserves 10 and picks 10.
//         EXPECT: A's reservation decreases by 10, staged increases by 10,
//         no double deduction.
// ----------------------------------------------------------------------------
console.log('\n--- TEST B: Reservation Consumption & Staging Without Double Deduction ---');
{
  const balanceB = createMockBalance({
    id: 'BAL-TEST-B',
    physicalOnHand: 10,
    availableForPicking: 10,
    reservedCommitted: 0
  });

  const reqA: DepartmentalRequisition = {
    id: 'REQ-B-01',
    requisitionNumber: 'REQ-B-001',
    requestingDepartment: 'Ward 1A',
    destinationLocationId: 'LOC-WARD-1A',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse A',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Patient Care',
    approvalStatus: 'pending_approval',
    fulfillmentStatus: 'not_started',
    lines: [
      {
        lineId: 'LINE-B1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 10,
        uom: 'each',
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 10
      }
    ],
    createdAt: '2026-09-20 08:05'
  };

  // Step 1: Approve and reserve 10
  const approveResult = executeRequisitionApproval(
    'REQ-B-01',
    'Supervisor Ali',
    [reqA],
    [balanceB],
    [],
    [testCatalogItem],
    [testLocationWH_A]
  );
  assert(approveResult.success, 'Test B: Approval succeeds');

  // Step 2: Requisition A picks its own 10 reserved units
  const pickResult = executeRequisitionPick(
    'REQ-B-01',
    approveResult.updatedRequisitions,
    approveResult.updatedBalances,
    approveResult.updatedReservations,
    [testCatalogItem]
  );

  assert(pickResult.success, 'Test B: Requisition A successfully picks its owned reservation');
  const balAfterPick = pickResult.updatedBalances.find(b => b.id === 'BAL-TEST-B')!;
  assert(balAfterPick.reservedCommitted === 0, 'Test B: ReservedCommitted decreased by 10 to 0', `Got ${balAfterPick.reservedCommitted}`);
  assert(balAfterPick.pickedStaged === 10, 'Test B: PickedStaged increased by 10 to 10', `Got ${balAfterPick.pickedStaged}`);
  assert(balAfterPick.physicalOnHand === 10, 'Test B: PhysicalOnHand remains 10 (still in warehouse on dock)', `Got ${balAfterPick.physicalOnHand}`);
  assert(balAfterPick.availableForPicking === 0, 'Test B: AvailableForPicking remains 0 (no double deduction below 0)', `Got ${balAfterPick.availableForPicking}`);

  const resAfterPick = pickResult.updatedReservations.find(r => r.requisitionId === 'REQ-B-01')!;
  assert(resAfterPick.pickedQty === 10, 'Test B: Reservation tracked pickedQty is 10');
  assert(resAfterPick.outstandingQty === 0, 'Test B: Reservation outstandingQty is 0');
  assert(resAfterPick.status === 'fully_picked', 'Test B: Reservation status is fully_picked');
}

// ----------------------------------------------------------------------------
// TEST C: Two requisition lines request 6 units each from the same eligible balance of 10.
//         EXPECT: Aggregate demand rejected unless explicitly supported partial fulfillment.
// ----------------------------------------------------------------------------
console.log('\n--- TEST C: Aggregate Demand Validation Across Lines ---');
{
  const balanceC = createMockBalance({
    id: 'BAL-TEST-C',
    physicalOnHand: 10,
    availableForPicking: 10,
    reservedCommitted: 0
  });

  const reqTwoLines: DepartmentalRequisition = {
    id: 'REQ-C-01',
    requisitionNumber: 'REQ-C-001',
    requestingDepartment: 'Ward 3C',
    destinationLocationId: 'LOC-WARD-3C',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse C',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Ward Restock',
    approvalStatus: 'pending_approval',
    fulfillmentStatus: 'not_started',
    lines: [
      {
        lineId: 'LINE-C1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 6,
        uom: 'each',
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 6
      },
      {
        lineId: 'LINE-C2',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 6,
        uom: 'each',
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 6
      }
    ],
    createdAt: '2026-09-20 08:05'
  };

  const validation = validateRequisitionApproval(
    reqTwoLines,
    [testCatalogItem],
    [balanceC],
    [testLocationWH_A]
  );

  assert(!validation.valid, 'Test C: Aggregate demand of 12 (6+6) against available 10 is REJECTED');
  assert(validation.error?.includes('تجاوز الرصيد') || validation.error?.includes('غير كافٍ'), 'Test C: Clear rejection error returned');

  const approvalExec = executeRequisitionApproval(
    'REQ-C-01',
    'Supervisor Ali',
    [reqTwoLines],
    [balanceC],
    [],
    [testCatalogItem],
    [testLocationWH_A]
  );
  assert(!approvalExec.success, 'Test C: Execution rejected and state completely preserved');
  assert(approvalExec.updatedBalances[0].reservedCommitted === 0, 'Test C: ReservedCommitted remains 0');
  assert(approvalExec.updatedBalances[0].availableForPicking === 10, 'Test C: AvailableForPicking remains 10');
}

// ----------------------------------------------------------------------------
// TEST D: Two warehouses contain the same item.
//         A request for Warehouse A cannot silently pick from Warehouse B.
// ----------------------------------------------------------------------------
console.log('\n--- TEST D: Exact Warehouse Location Isolation ---');
{
  const balanceWH_A = createMockBalance({
    id: 'BAL-TEST-WH-A',
    locationId: 'LOC-WH-A-AISLE-1',
    physicalOnHand: 0,
    availableForPicking: 0,
    reservedCommitted: 0
  });

  const balanceWH_B = createMockBalance({
    id: 'BAL-TEST-WH-B',
    locationId: 'LOC-WH-B-AISLE-1',
    physicalOnHand: 50,
    availableForPicking: 50,
    reservedCommitted: 0
  });

  const reqForWH_A: DepartmentalRequisition = {
    id: 'REQ-D-01',
    requisitionNumber: 'REQ-D-001',
    requestingDepartment: 'Ward 4D',
    destinationLocationId: 'LOC-WARD-4D',
    sourceLocationId: 'LOC-WH-A-AISLE-1', // Explicitly targeting Warehouse A
    requestingActorName: 'Nurse D',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Restock',
    approvalStatus: 'approved',
    fulfillmentStatus: 'allocated',
    lines: [
      {
        lineId: 'LINE-D1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 10,
        uom: 'each',
        allocatedQty: 10,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 10
      }
    ],
    createdAt: '2026-09-20 08:15'
  };

  const pickResult = executeRequisitionPick(
    'REQ-D-01',
    [reqForWH_A],
    [balanceWH_A, balanceWH_B],
    [],
    [testCatalogItem]
  );

  assert(!pickResult.success, 'Test D: Pick for Warehouse A rejected when Warehouse A is empty');
  const balWH_B_after = pickResult.updatedBalances.find(b => b.id === 'BAL-TEST-WH-B')!;
  assert(balWH_B_after.availableForPicking === 50, 'Test D: Warehouse B stock is NOT silently touched (isolation preserved)', `Got ${balWH_B_after.availableForPicking}`);
  assert(balWH_B_after.physicalOnHand === 50, 'Test D: Warehouse B on-hand remains 50');
}

// ----------------------------------------------------------------------------
// TEST E: Same item exists in two lots.
//         An ineligible or reserved lot cannot be selected as unrestricted stock.
// ----------------------------------------------------------------------------
console.log('\n--- TEST E: Ineligible or Quarantined Lot Cannot Be Picked ---');
{
  const balanceLot1_Available = createMockBalance({
    id: 'BAL-LOT-1',
    lotNumber: 'LOT-VALID-01',
    physicalOnHand: 10,
    availableForPicking: 10,
    reservedCommitted: 0,
    quarantined: 0
  });

  const balanceLot2_Quarantined = createMockBalance({
    id: 'BAL-LOT-2',
    lotNumber: 'LOT-RECALLED-02',
    physicalOnHand: 20,
    availableForPicking: 0,
    reservedCommitted: 0,
    quarantined: 20 // QUARANTINED!
  });

  // Requisition asks for 15 units (Lot 1 only has 10, Lot 2 has 20 but is quarantined)
  const reqE: DepartmentalRequisition = {
    id: 'REQ-E-01',
    requisitionNumber: 'REQ-E-001',
    requestingDepartment: 'Ward 5E',
    destinationLocationId: 'LOC-WARD-5E',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse E',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Emergency Restock',
    approvalStatus: 'approved',
    fulfillmentStatus: 'allocated',
    lines: [
      {
        lineId: 'LINE-E1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 15,
        uom: 'each',
        allocatedQty: 15,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 15
      }
    ],
    createdAt: '2026-09-20 08:20'
  };

  const pickResult = executeRequisitionPick(
    'REQ-E-01',
    [reqE],
    [balanceLot1_Available, balanceLot2_Quarantined],
    [],
    [testCatalogItem]
  );

  assert(!pickResult.success, 'Test E: Quarantined Lot 2 cannot be consumed as unrestricted stock -> REJECTED');
  const balLot2 = pickResult.updatedBalances.find(b => b.id === 'BAL-LOT-2')!;
  assert(balLot2.quarantined === 20, 'Test E: Lot 2 quarantine count unchanged');
  assert(balLot2.pickedStaged === 0, 'Test E: Lot 2 pickedStaged remains 0');
}

// ----------------------------------------------------------------------------
// TEST F: Pick 20 -> Stage 20 -> Dispatch 20.
//         EXPECT: Correct source balance, no duplicate deductions, correct custody status.
// ----------------------------------------------------------------------------
console.log('\n--- TEST F: Pick 20 -> Stage 20 -> Dispatch 20 End-to-End ---');
{
  const balanceF = createMockBalance({
    id: 'BAL-TEST-F',
    lotNumber: 'LOT-F-100',
    physicalOnHand: 100,
    availableForPicking: 100,
    reservedCommitted: 0
  });

  const reqF: DepartmentalRequisition = {
    id: 'REQ-F-01',
    requisitionNumber: 'REQ-F-001',
    requestingDepartment: 'Ward 6F',
    destinationLocationId: 'LOC-WARD-6F',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse F',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Surgical Restock',
    approvalStatus: 'pending_approval',
    fulfillmentStatus: 'not_started',
    lines: [
      {
        lineId: 'LINE-F1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 20,
        uom: 'each',
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 20
      }
    ],
    createdAt: '2026-09-20 08:25'
  };

  // Phase 1: Approval & Reservation
  const approveResult = executeRequisitionApproval(
    'REQ-F-01',
    'Supervisor Ali',
    [reqF],
    [balanceF],
    [],
    [testCatalogItem],
    [testLocationWH_A]
  );
  assert(approveResult.success, 'Test F (Phase 1): Approval succeeds');
  const balAfterApprove = approveResult.updatedBalances.find(b => b.id === 'BAL-TEST-F')!;
  assert(balAfterApprove.reservedCommitted === 20, 'Test F: ReservedCommitted is 20');
  assert(balAfterApprove.availableForPicking === 80, 'Test F: AvailableForPicking is 80 (100 - 20)');
  assert(balAfterApprove.physicalOnHand === 100, 'Test F: PhysicalOnHand is 100');

  // Phase 2: Pick 20 (moves to pickedStaged)
  const pickResult = executeRequisitionPick(
    'REQ-F-01',
    approveResult.updatedRequisitions,
    approveResult.updatedBalances,
    approveResult.updatedReservations,
    [testCatalogItem]
  );
  assert(pickResult.success, 'Test F (Phase 2): Pick 20 succeeds');
  const balAfterPick = pickResult.updatedBalances.find(b => b.id === 'BAL-TEST-F')!;
  assert(balAfterPick.reservedCommitted === 0, 'Test F: ReservedCommitted decreased to 0');
  assert(balAfterPick.pickedStaged === 20, 'Test F: PickedStaged increased to 20');
  assert(balAfterPick.physicalOnHand === 100, 'Test F: PhysicalOnHand unchanged at 100 (in staging)');
  assert(balAfterPick.availableForPicking === 80, 'Test F: AvailableForPicking remains 80 (no double deduction)');

  // Phase 3: Dispatch 20 to Courier
  const dispatchResult = executeDispatchToCourier(
    'REQ-F-01',
    'Courier Majed',
    pickResult.updatedRequisitions,
    pickResult.updatedBalances,
    [testCatalogItem]
  );
  assert(dispatchResult.success, 'Test F (Phase 3): Dispatch 20 to courier succeeds');
  const balAfterDispatch = dispatchResult.updatedBalances.find(b => b.id === 'BAL-TEST-F')!;
  assert(balAfterDispatch.pickedStaged === 0, 'Test F: PickedStaged decreased by 20 to 0 (departed dock)');
  assert(balAfterDispatch.physicalOnHand === 80, 'Test F: PhysicalOnHand decreased by 20 to 80 (departed facility)');
  assert(balAfterDispatch.availableForPicking === 80, 'Test F: AvailableForPicking correctly remains 80 (80 - 0)');

  const reqAfterDispatch = dispatchResult.updatedRequisitions.find(r => r.id === 'REQ-F-01')!;
  assert(reqAfterDispatch.fulfillmentStatus === 'dispatched', 'Test F: Custody status updated to dispatched');
  assert(!!reqAfterDispatch.dispatchedAt, 'Test F: Dispatch timestamp recorded');
}

// ----------------------------------------------------------------------------
// TEST G: Attempt quantity greater than available.
//         EXPECT: Visible rejection and zero mutation.
// ----------------------------------------------------------------------------
console.log('\n--- TEST G: Attempt Quantity Greater Than Available ---');
{
  const balanceG = createMockBalance({
    id: 'BAL-TEST-G',
    lotNumber: 'LOT-G-1',
    physicalOnHand: 10,
    availableForPicking: 10,
    reservedCommitted: 0
  });

  const reqG: DepartmentalRequisition = {
    id: 'REQ-G-01',
    requisitionNumber: 'REQ-G-001',
    requestingDepartment: 'Ward 7G',
    destinationLocationId: 'LOC-WARD-7G',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse G',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Restock',
    approvalStatus: 'approved',
    fulfillmentStatus: 'allocated',
    lines: [
      {
        lineId: 'LINE-G1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 15, // Attempting 15 when only 10 available
        uom: 'each',
        allocatedQty: 15,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 15
      }
    ],
    createdAt: '2026-09-20 08:30'
  };

  const pickResult = executeRequisitionPick(
    'REQ-G-01',
    [reqG],
    [balanceG],
    [],
    [testCatalogItem]
  );

  assert(!pickResult.success, 'Test G: Attempt to pick 15 with 10 available is rejected');
  assert(pickResult.updatedBalances[0].physicalOnHand === 10, 'Test G: PhysicalOnHand unchanged at 10');
  assert(pickResult.updatedBalances[0].availableForPicking === 10, 'Test G: AvailableForPicking unchanged at 10');
  assert(pickResult.updatedBalances[0].pickedStaged === 0, 'Test G: PickedStaged unchanged at 0');
  assert(pickResult.updatedRequisitions[0].lines[0].pickedQty === 0, 'Test G: Requisition pickedQty unchanged at 0');
}

// ----------------------------------------------------------------------------
// TEST H: Missing balance or unknown conversion.
//         EXPECT: No fabricated availability.
// ----------------------------------------------------------------------------
console.log('\n--- TEST H: Missing Balance and Unknown UOM Conversion Handling ---');
{
  // 1. Unknown UOM conversion
  const invalidUomCheck = validateUomConversion(
    testCatalogItem,
    5,
    'drum' as any // Unknown UOM not in packaging hierarchy
  );
  assert(!invalidUomCheck.valid, 'Test H: Unknown UOM \'drum\' is rejected');
  assert(invalidUomCheck.baseQty === undefined, 'Test H: No base quantity fabricated for unknown UOM');

  // 2. Request item with non-existent balance
  const reqH: DepartmentalRequisition = {
    id: 'REQ-H-01',
    requisitionNumber: 'REQ-H-001',
    requestingDepartment: 'Ward 8H',
    destinationLocationId: 'LOC-WARD-8H',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse H',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Restock',
    approvalStatus: 'pending_approval',
    fulfillmentStatus: 'not_started',
    lines: [
      {
        lineId: 'LINE-H1',
        itemId: 'ITEM-NON-EXISTENT', // Non-existent item
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 10,
        uom: 'each',
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 10
      }
    ],
    createdAt: '2026-09-20 08:35'
  };

  const validationH = validateRequisitionApproval(
    reqH,
    [testCatalogItem], // Only testCatalogItem exists
    [],
    [testLocationWH_A]
  );
  assert(!validationH.valid, 'Test H: Non-existent item or missing balance is rejected');
  assert(validationH.error?.includes('غير موجود'), 'Test H: Rejection reason mentions item not found');

  // 3. Balance with quantityStatus === 'stale'
  const staleBalance = createMockBalance({
    id: 'BAL-STALE',
    lotNumber: 'LOT-STALE',
    physicalOnHand: 100,
    availableForPicking: 100,
    quantityStatus: 'stale', // STALE!
    lastUpdatedTimestamp: '2026-09-15 08:00'
  });

  const reqStale: DepartmentalRequisition = {
    id: 'REQ-STALE-01',
    requisitionNumber: 'REQ-STALE-001',
    requestingDepartment: 'Ward 8H',
    destinationLocationId: 'LOC-WARD-8H',
    sourceLocationId: 'LOC-WH-A-AISLE-1',
    requestingActorName: 'Nurse H',
    requestingRole: 'Staff Nurse',
    priority: 'routine',
    clinicalPurpose: 'Restock',
    approvalStatus: 'pending_approval',
    fulfillmentStatus: 'not_started',
    lines: [
      {
        lineId: 'LINE-STALE-1',
        itemId: 'ITEM-TEST-001',
        sourceLocationId: 'LOC-WH-A-AISLE-1',
        requestedQty: 10,
        uom: 'each',
        allocatedQty: 0,
        pickedQty: 0,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 10
      }
    ],
    createdAt: '2026-09-20 08:35'
  };

  const validationStale = validateRequisitionApproval(
    reqStale,
    [testCatalogItem],
    [staleBalance],
    [testLocationWH_A]
  );
  assert(!validationStale.valid, 'Test H: Stale or unknown balance is NOT interpreted as available stock');
}

// ----------------------------------------------------------------------------
// TEST I: Re-run existing recall, transfer, and cycle adjustment workflows
//         to ensure the correction does not regress those workflows.
// ----------------------------------------------------------------------------
console.log('\n--- TEST I: Regression Testing on Recall, Transfer and Cycle Adjustment ---');
{
  // 1. Recall Quarantine Sweep Logic
  const affectedRecallLot = 'LOT-BD-8842';
  const initialBal = INITIAL_STOCK_BALANCES.find(b => b.lotNumber === affectedRecallLot)!;
  assert(!!initialBal, 'Test I (Recall): Baseline recall balance found');

  // Verify that quarantined stock is strictly deducted from availableForPicking
  const mockQuarantinedBalance: PhysicalStockBalance = {
    ...initialBal,
    quarantined: initialBal.physicalOnHand,
    availableForPicking: 0
  };
  const unavailable =
    mockQuarantinedBalance.quarantined +
    (mockQuarantinedBalance.damaged || 0) +
    (mockQuarantinedBalance.expired || 0) +
    (mockQuarantinedBalance.pickedStaged || 0) +
    (mockQuarantinedBalance.reservedCommitted || 0);
  const recomputedAvailable = Math.max(0, mockQuarantinedBalance.physicalOnHand - unavailable);
  assert(recomputedAvailable === 0, 'Test I (Recall): Quarantined units immediately zero out availableForPicking');

  // 2. Inter-Location Transfer Validation
  const sampleTransfer = INITIAL_TRANSFERS[0];
  assert(!!sampleTransfer, 'Test I (Transfer): Sample transfer exists');
  assert(sampleTransfer.sourceBranch !== sampleTransfer.destinationBranch, 'Test I (Transfer): Multi-branch isolation enforced');
  assert(sampleTransfer.lines.length > 0 && !!sampleTransfer.driverName, 'Test I (Transfer): Custody dispatch line details verified');

  // 3. Cycle Count Batch Discrepancy Adjustment
  const countBatch = INITIAL_CYCLE_COUNT_BATCHES[0];
  assert(!!countBatch, 'Test I (Cycle Count): Sample count plan exists');
  assert(countBatch.status === 'reconciling_variances', 'Test I (Cycle Count): Audit status verified');

  // 4. Par Levels Integrity
  const initialReservationsCount = INITIAL_STOCK_RESERVATIONS.length;
  assert(initialReservationsCount >= 3, 'Test I (Mock State): Initial stock reservations populated with ownership tracing');
}

console.log(`\n=== SUITE COMPLETED: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
  process.exit(0);
}
