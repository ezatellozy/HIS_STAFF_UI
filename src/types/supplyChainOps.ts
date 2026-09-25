// ============================================================================
// ENTERPRISE INVENTORY & SUPPLY CHAIN (MATERIALS MANAGEMENT) DOMAIN TYPES
// High-Fidelity UI/UX Prototype Domain Model
// Aligned with WHO TRS 1025 (Annex 7), TRS 1044 (Annex 8), HL7 FHIR R5, GS1 Gen Specs
// Strictly respects boundaries: Frontend simulation, no backend, no real hardware.
// ============================================================================

export type SupplyChainViewTab =
  | 'overview'
  | 'catalog'
  | 'stock_locations'
  | 'receiving'
  | 'requisitions'
  | 'picking_dispatch'
  | 'transfers'
  | 'returns_quality'
  | 'counts_reconciliation';

export type SupplyItemCategory =
  | 'medical_surgical_consumables'
  | 'wound_care_dressings'
  | 'ppe_infection_control'
  | 'catheters_tubing_iv'
  | 'diagnostic_disposables'
  | 'sterilization_wraps'
  | 'disinfectants_chemicals'
  | 'general_linen_hospitality'
  | 'specialty_reference'; // read-only external reference (e.g. pharmacy/blood)

export type StorageConditionProfile =
  | 'controlled_room_temp' // 15-25°C
  | 'cool_ambient'          // 8-15°C
  | 'cold_refrigerated'     // 2-8°C
  | 'frozen'                // -20°C
  | 'dry_ventilated'
  | 'flammable_cabinet'
  | 'hazardous_secure';

export type UomType =
  | 'each'
  | 'box'
  | 'pack'
  | 'case'
  | 'carton'
  | 'roll'
  | 'bottle'
  | 'vial'
  | 'kit'
  | 'meter';

export interface PackagingHierarchy {
  baseUom: UomType;           // e.g. 'each'
  purchasingUom: UomType;     // e.g. 'case'
  issueUom: UomType;          // e.g. 'box'
  conversionFactor: number;   // e.g. 50 (1 box = 50 each)
  caseMultiplier?: number;    // e.g. 10 (1 case = 10 boxes = 500 each)
  verifiedDefinitionText: string;
}

export interface ItemMasterRecord {
  id: string;                         // e.g. "ITEM-MS-101"
  code: string;                       // Hospital catalog code e.g. "CAN-IV-20G"
  nameAr: string;
  nameEn: string;
  category: SupplyItemCategory;
  descriptionAr: string;
  descriptionEn: string;
  manufacturer: string;
  manufacturerRefNumber?: string;
  gtin?: string;                      // GS1 Global Trade Item Number (01)
  packaging: PackagingHierarchy;
  isLotTracked: boolean;
  isSerialTracked: boolean;
  isExpiryTracked: boolean;
  isLatexFree: boolean;
  isSterile: boolean;
  isHazardous: boolean;
  storageProfile: StorageConditionProfile;
  owningModule: 'enterprise_inventory' | 'pharmacy_reference' | 'blood_bank_reference' | 'lab_reference';
  isActive: boolean;
  standardCostSar?: number;
  safetyStockDays?: number;
}

// ----------------------------------------------------------------------------
// 2. LOCATION & FACILITY ARCHITECTURE
// ----------------------------------------------------------------------------
export type BranchFacilityId = 'main_hospital' | 'suburban_clinic_branch' | 'trauma_center_branch';

export interface StorageLocation {
  id: string;                         // e.g. "LOC-WH-MAIN-A01"
  branchId: BranchFacilityId;
  facilityNameAr: string;
  facilityNameEn: string;
  warehouseCode: string;              // e.g. "CENTRAL-STORE"
  warehouseNameAr: string;
  zone: string;                       // e.g. "Zone A (Sterile Supplies)"
  rack: string;                       // e.g. "Rack 03"
  shelfBin: string;                   // e.g. "Bin B-12"
  isStagingArea?: boolean;
  isQuarantineArea?: boolean;
  isCleanUtility?: boolean;
  departmentRef?: string;             // e.g. "Ward 4A", "ER Resus", "OR-1"
  gln?: string;                       // GS1 Global Location Number (414) if applicable
}

// ----------------------------------------------------------------------------
// 3. PHYSICAL STOCK BUCKETS & COMMITMENTS (Mutually Exclusive)
// ----------------------------------------------------------------------------
export interface PhysicalStockBalance {
  id: string;
  itemId: string;
  locationId: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;                // YYYY-MM-DD
  receivedDate: string;
  
  // Mutually Exclusive Physical Buckets:
  physicalOnHand: number;             // Total physical units physically sitting in this bin
  pendingInspection: number;          // In intake/dock inspection, cannot be picked
  quarantined: number;                // Quality hold, failed inspection, or recall lock
  damaged: number;                    // Physically damaged, awaiting write-off
  expired: number;                    // Past expiry, non-distributable
  pickedStaged: number;               // Picked from bin, sitting in dispatch staging
  pendingDisposal: number;            // Awaiting physical destruction
  
  // Operational Commitments (Separate axis):
  reservedCommitted: number;          // Allocated to an approved requisition not yet picked
  
  // Computed / Effective Available:
  // Available = physicalOnHand - (pendingInspection + quarantined + damaged + expired + pickedStaged + reservedCommitted)
  availableForPicking: number;
  
  // In Transit tracking (Exclusive to transfer legs):
  inTransit: number;
  
  // Freshness & Telemetry Metadata (Scenario I28):
  quantityStatus: 'available' | 'unknown' | 'stale';
  lastUpdatedTimestamp: string;
  dataSource: 'warehouse_realtime_sim' | 'ward_par_sensor_sim' | 'stale_offline_snapshot';
}

// ----------------------------------------------------------------------------
// 4. GOODS RECEIVING & INSPECTION (Dock Intake)
// ----------------------------------------------------------------------------
export interface PurchaseOrderLineItem {
  lineId: string;
  itemId: string;
  orderedQty: number;
  uom: UomType;
  unitPriceSar: number;
  receivedQtyTotal: number;
  outstandingQty: number;
}

export interface SyntheticPurchaseOrder {
  poNumber: string;                   // e.g. "PO-2026-MED-101"
  vendorName: string;
  vendorCode: string;
  orderDate: string;
  status: 'open' | 'partially_received' | 'closed' | 'cancelled';
  expectedDeliveryDate: string;
  lines: PurchaseOrderLineItem[];
}

export interface GoodsReceiptRecord {
  id: string;                         // e.g. "RCV-2026-0041"
  receiptReference: string;
  poNumber: string;
  supplierDeliveryNote: string;       // Delivery note / packing slip #
  vendorName: string;
  receivingLocationId: string;
  receivedAt: string;
  receiverName: string;
  receiverAssignment: string;
  itemId: string;
  receivedQty: number;
  uom: UomType;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  packageCondition: 'intact_sealed' | 'minor_outer_crease' | 'crushed_compromised' | 'wet_leaking';
  temperatureIndicatorStatus?: 'normal_compliant' | 'cold_excursion_flagged' | 'not_applicable';
  inspectionStatus: 'received_uninspected' | 'pending_qa' | 'accepted' | 'quarantined' | 'rejected';
  acceptedQty: number;
  quarantinedQty: number;
  rejectedQty: number;
  inspectionNotes?: string;
  putAwayStatus: 'pending_putaway' | 'staged_dock' | 'putaway_completed';
  assignedBinLocationId?: string;
  isUnexpectedItem?: boolean;         // Scenario I06
}

// ----------------------------------------------------------------------------
// 5. INTERNAL REQUISITIONS & DEPARTMENTAL PAR REPLENISHMENT
// ----------------------------------------------------------------------------
export type RequisitionPriority = 'routine' | 'urgent' | 'stat';

export type RequisitionApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type RequisitionFulfillmentStatus =
  | 'not_started'
  | 'partially_allocated'
  | 'allocated'
  | 'picking'
  | 'partially_issued'
  | 'dispatched'
  | 'partially_delivered'
  | 'delivered'
  | 'backordered';

export interface RequisitionLineItem {
  lineId: string;
  itemId: string;
  sourceLocationId?: string;           // Optional explicit source location
  requestedQty: number;
  uom: UomType;
  allocatedQty: number;
  pickedQty: number;
  issuedQty: number;
  deliveredQty: number;
  outstandingQty: number;
  notes?: string;
}

export interface DepartmentalRequisition {
  id: string;                         // e.g. "REQ-2026-4401"
  requisitionNumber: string;
  requestingDepartment: string;       // e.g. "Ward 4A Inpatient", "ER Resuscitation", "OR-1"
  sourceLocationId?: string;          // Optional explicit source warehouse (e.g. "LOC-WH-MAIN-AISLE-A1")
  destinationLocationId: string;
  requestingActorName: string;
  requestingRole: string;
  priority: RequisitionPriority;
  priorityJustification?: string;
  clinicalPurpose: string;
  requestedDeliveryTime?: string;
  approvalStatus: RequisitionApprovalStatus;
  fulfillmentStatus: RequisitionFulfillmentStatus;
  approvedBy?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
  rejectionReason?: string;
  lines: RequisitionLineItem[];
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 5B. GRANULAR STOCK RESERVATIONS (OWNERSHIP & ALLOCATION TRACING)
// ----------------------------------------------------------------------------
export interface StockReservation {
  id: string;                         // e.g. "RES-REQ-2026-4401-REQL-01"
  requisitionId: string;
  requisitionLineId: string;
  itemId: string;
  sourceLocationId: string;           // Exact storage location (e.g. "LOC-WH-MAIN-AISLE-A1")
  lotNumber?: string;
  serialNumber?: string;
  reservedQty: number;                // In item's base UOM
  pickedQty: number;                  // Previously picked units (in base UOM)
  outstandingQty: number;             // Remaining to be picked (reservedQty - pickedQty)
  status: 'active' | 'partially_picked' | 'fully_picked' | 'cancelled';
  createdAt: string;
}

export interface DepartmentParLevel {
  id: string;
  departmentId: string;
  departmentNameAr: string;
  locationId: string;
  itemId: string;
  targetParQty: number;
  minParQty: number;
  maxParQty: number;
  uom: UomType;
  currentAvailableQty: number;
  suggestedReorderQty: number;
  reviewStatus: 'adequate' | 'below_min_reorder' | 'critical_stockout' | 'overstock';
  policyProfile: 'standard_weekly_replenish' | 'daily_automated_sweep' | 'or_custom_par';
}

// ----------------------------------------------------------------------------
// 6. PICKING, PACKING & DISPATCH (FEFO)
// ----------------------------------------------------------------------------
export interface PickTaskLine {
  id: string;
  requisitionId: string;
  requisitionLineId: string;
  itemId: string;
  sourceLocationId: string;
  lotNumber?: string;
  expiryDate?: string;
  isFefoRecommended: boolean;
  requestedQty: number;
  pickedQty: number;
  shortQty: number;
  uom: UomType;
  status: 'pending_pick' | 'picked' | 'short_picked' | 'skipped';
}

export interface DispatchPackage {
  id: string;                         // e.g. "DISP-2026-0081"
  packageReference: string;
  requisitionId: string;
  destinationDepartment: string;
  destinationLocationId: string;
  toteBarcodes: string[];
  pickedLines: PickTaskLine[];
  packedBy: string;
  packedAt: string;
  status: 'staged_in_store' | 'handed_to_courier' | 'in_transit' | 'delivered_to_ward' | 'acknowledged';
  courierName?: string;
  courierBadge?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  acknowledgmentNotes?: string;
}

// ----------------------------------------------------------------------------
// 7. INTER-LOCATION & INTER-BRANCH TRANSFERS
// ----------------------------------------------------------------------------
export type TransferStatus =
  | 'draft'
  | 'requested'
  | 'approved'
  | 'reserved'
  | 'dispatched'
  | 'in_transit'
  | 'partially_received'
  | 'fully_received'
  | 'discrepancy_reported'
  | 'cancelled';

export interface TransferOrderLine {
  lineId: string;
  itemId: string;
  requestedQty: number;
  dispatchedQty: number;
  receivedQty: number;
  damagedMissingQty: number;
  uom: UomType;
  lotNumber?: string;
}

export interface InterLocationTransfer {
  id: string;                         // e.g. "TRF-2026-012"
  transferNumber: string;
  sourceLocationId: string;
  sourceBranch: BranchFacilityId;
  destinationLocationId: string;
  destinationBranch: BranchFacilityId;
  status: TransferStatus;
  priority: 'routine' | 'urgent';
  lines: TransferOrderLine[];
  carrierReference?: string;
  driverName?: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  discrepancyReason?: string;
  unresolvedVarianceCount?: number;   // Scenario I19
  notes?: string;
}

// ----------------------------------------------------------------------------
// 8. RETURNS, QUALITY HOLDS, RECALLS & DISPOSAL
// ----------------------------------------------------------------------------
export type ReturnDisposition =
  | 'pending_inspection'
  | 'approved_return_to_stock'
  | 'quarantine_for_supplier_rma'
  | 'quarantine_for_waste_disposal'
  | 'rejected_ward_retention';

export interface GeneralSupplyReturnRecord {
  id: string;                         // e.g. "RET-2026-0033"
  returnNumber: string;
  originDepartment: string;
  destinationStoreId: string;
  itemId: string;
  quantityReturned: number;
  uom: UomType;
  lotNumber?: string;
  returnReason:
    | 'excess_ward_stock'
    | 'patient_order_cancelled'
    | 'damaged_on_ward'
    | 'packaging_compromised'
    | 'near_expiry_consolidation'
    | 'incorrect_item_received';
  packageIntegrity: 'intact_sealed' | 'opened_unusable' | 'seal_broken_clean';
  inspectionStatus: 'received_pending_qa' | 'passed_clean' | 'failed_compromised';
  disposition: ReturnDisposition;
  inspectedBy?: string;
  inspectedAt?: string;
  dispositionNotes?: string;
}

export interface SupplyRecallRecord {
  id: string;                         // e.g. "REC-2026-SFDA-04"
  recallReference: string;
  initiatingAgency: string;           // e.g. "Saudi SFDA", "Manufacturer Urgent Notice", "Hospital Safety Committee"
  alertDate: string;
  itemId: string;
  affectedLotNumbers: string[];
  recallReasonAr: string;
  recallReasonEn: string;
  severity: 'class_1_critical' | 'class_2_urgent' | 'class_3_precautionary';
  notificationStatus: 'broadcast_issued' | 'departments_notified' | 'quarantine_in_progress' | 'reconciliation_complete' | 'closed';
  totalUnitsLocated: number;
  totalUnitsQuarantined: number;
  affectedLocations: Array<{
    locationId: string;
    locationName: string;
    acknowledged: boolean;
    unitsFound: number;
    unitsQuarantined: number;
  }>;
  closureNotes?: string;
}

export interface WasteDisposalRecord {
  id: string;                         // e.g. "WST-2026-0091"
  itemId: string;
  lotNumber?: string;
  quantity: number;
  uom: UomType;
  disposalReason: 'expired_product' | 'damaged_during_transit' | 'packaging_breach' | 'recall_condemned';
  disposalMethod: 'general_municipal_waste' | 'hazardous_chemical_neutralization' | 'sharps_secure_containment' | 'supplier_return';
  requestedBy: string;
  approvedBy: string;
  witnessName?: string;
  disposedAt: string;
  wasteManifestRef: string;
}

// ----------------------------------------------------------------------------
// 9. PHYSICAL INVENTORY COUNTS & RECONCILIATION
// ----------------------------------------------------------------------------
export interface CycleCountItemLine {
  lineId: string;
  itemId: string;
  locationId: string;
  lotNumber?: string;
  bookQuantity: number;
  blindCountedQty?: number;
  countedQty?: number;
  varianceQty: number;
  varianceReason?: string;
  recountRequested: boolean;
  adjustmentStatus: 'pending_count' | 'variance_identified' | 'recount_in_progress' | 'approved_pending_action' | 'adjustment_applied';
  countedBy?: string;
  countedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface PhysicalCountPlan {
  id: string;                         // e.g. "COUNT-2026-Q3-01"
  planNameAr: string;
  planNameEn: string;
  countType: 'abc_high_value_cycle' | 'wall_to_wall_annual' | 'spot_check_variance';
  targetWarehouseId: string;
  status: 'planned' | 'in_progress' | 'reconciling_variances' | 'completed' | 'cancelled';
  lines: CycleCountItemLine[];
  createdAt: string;
  completedAt?: string;
}

// ----------------------------------------------------------------------------
// 10. SCENARIO RUNNER & PRESET TYPES (I01 - I30)
// ----------------------------------------------------------------------------
export type AuditScenarioId =
  | 'I01' | 'I02' | 'I03' | 'I04' | 'I05'
  | 'I06' | 'I07' | 'I08' | 'I09' | 'I10'
  | 'I11' | 'I12' | 'I13' | 'I14' | 'I15'
  | 'I16' | 'I17' | 'I18' | 'I19' | 'I20'
  | 'I21' | 'I22' | 'I23' | 'I24' | 'I25'
  | 'I26' | 'I27' | 'I28' | 'I29' | 'I30';

export interface AuditScenarioDefinition {
  id: AuditScenarioId;
  titleAr: string;
  titleEn: string;
  actor: string;
  startingTab: SupplyChainViewTab;
  category?: string;
  precondition: string;
  expectedBehavior: string;
  coverageStatus: 'FULLY_COVERED' | 'PARTIALLY_COVERED' | 'EXTERNAL_DEPENDENCY' | 'OPTIONAL_DEFERRED';
  executionCategory: 'OPERATIONAL_FLOW' | 'SAFETY_ASSERTION' | 'BOUNDARY_ISOLATION';
}

// Aliases for component convenience
export type SupplyChainSubTab = SupplyChainViewTab;
export type ProductRecallNotice = SupplyRecallRecord;
export type QuarantineEventRecord = GeneralSupplyReturnRecord;
export type CycleCountBatch = PhysicalCountPlan;
export type CycleCountLine = CycleCountItemLine;

