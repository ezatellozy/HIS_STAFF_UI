import React, { useState } from 'react';
import {
  Boxes,
  LayoutDashboard,
  Warehouse,
  Truck,
  ClipboardList,
  PackageCheck,
  ArrowRightLeft,
  ShieldAlert,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import {
  SupplyChainSubTab,
  AuditScenarioDefinition,
  GoodsReceiptRecord,
  DepartmentalRequisition,
  InterLocationTransfer,
  PhysicalStockBalance,
  StockReservation
} from '../../types/supplyChainOps';
import {
  INITIAL_ITEM_MASTER,
  INITIAL_STORAGE_LOCATIONS,
  INITIAL_STOCK_BALANCES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GOODS_RECEIPTS,
  INITIAL_REQUISITIONS,
  INITIAL_TRANSFERS,
  INITIAL_RECALLS,
  INITIAL_CYCLE_COUNT_BATCHES,
  INITIAL_DEPARTMENT_PAR_LEVELS,
  INITIAL_STOCK_RESERVATIONS
} from '../../data/mockSupplyChainOpsData';
import { getEffectiveTimestamp, getEffectiveDateString } from '../../utils/mockClock';
import {
  executeRequisitionApproval,
  executeRequisitionPick,
  executeDispatchToCourier
} from '../../utils/inventoryReservationEngine';
import { SupplyChainBanner } from './SupplyChainBanner';
import { MaterialsManagementDashboard } from './MaterialsManagementDashboard';
import { ItemMasterCatalogView } from './ItemMasterCatalogView';
import { StockVisibilityLedgerView } from './StockVisibilityLedgerView';
import { CentralGoodsReceivingView } from './CentralGoodsReceivingView';
import { InternalRequisitionsWorkspace } from './InternalRequisitionsWorkspace';
import { PickingDispatchWorkspace } from './PickingDispatchWorkspace';
import { InterLocationTransfersView } from './InterLocationTransfersView';
import { RecallsQuarantineView } from './RecallsQuarantineView';
import { PhysicalCycleCountAuditView } from './PhysicalCycleCountAuditView';
import { ScenarioTestingModal } from './ScenarioTestingModal';

export const SupplyChainOpsShell: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SupplyChainSubTab>('overview');
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [selectedScenarioForBanner, setSelectedScenarioForBanner] = useState<AuditScenarioDefinition | null>(null);

  // Live Module State (Synthetic UI/UX Prototype)
  const [catalogItems] = useState(INITIAL_ITEM_MASTER);
  const [locations] = useState(INITIAL_STORAGE_LOCATIONS);
  const [stockBalances, setStockBalances] = useState<PhysicalStockBalance[]>(INITIAL_STOCK_BALANCES);
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptRecord[]>(INITIAL_GOODS_RECEIPTS);
  const [requisitions, setRequisitions] = useState<DepartmentalRequisition[]>(INITIAL_REQUISITIONS);
  const [transfers, setTransfers] = useState<InterLocationTransfer[]>(INITIAL_TRANSFERS);
  const [recalls, setRecalls] = useState(INITIAL_RECALLS);
  const [cycleCountBatches, setCycleCountBatches] = useState(INITIAL_CYCLE_COUNT_BATCHES);
  const [parLevels] = useState(INITIAL_DEPARTMENT_PAR_LEVELS);
  const [stockReservations, setStockReservations] = useState<StockReservation[]>(INITIAL_STOCK_RESERVATIONS);

  // --- Handlers for Operational State Updates ---

  // 1. Goods Intake & QA (Scenario I05, I06, I07, I08, I09)
  const handleAddGoodsReceipt = (record: GoodsReceiptRecord) => {
    setGoodsReceipts(prev => [record, ...prev]);

    // If accepted and lot exists, add balance or update
    if (record.inspectionStatus === 'accepted') {
      setStockBalances(prev => {
        const existing = prev.find(
          b => b.itemId === record.itemId && b.lotNumber === record.lotNumber && b.locationId === record.receivingLocationId
        );
        if (existing) {
          return prev.map(b =>
            b.id === existing.id
              ? {
                  ...b,
                  physicalOnHand: b.physicalOnHand + record.acceptedQty,
                  availableForPicking: b.availableForPicking + record.acceptedQty,
                  lastUpdatedTimestamp: '2026-09-20 10:30'
                }
              : b
          );
        } else {
          const newBal: PhysicalStockBalance = {
            id: `BAL-NEW-${Date.now()}`,
            itemId: record.itemId,
            locationId: record.receivingLocationId,
            lotNumber: record.lotNumber,
            expiryDate: record.expiryDate,
            receivedDate: '2026-09-20',
            physicalOnHand: record.acceptedQty,
            quarantined: 0,
            pendingInspection: 0,
            damaged: 0,
            expired: 0,
            pickedStaged: 0,
            pendingDisposal: 0,
            reservedCommitted: 0,
            availableForPicking: record.acceptedQty,
            inTransit: 0,
            lastUpdatedTimestamp: '2026-09-20 10:30',
            quantityStatus: 'available',
            dataSource: 'warehouse_realtime_sim'
          };
          return [newBal, ...prev];
        }
      });
    } else if (record.inspectionStatus === 'quarantined') {
      // Add as quarantined stock balance
      const newQuarantineBal: PhysicalStockBalance = {
        id: `BAL-QUAR-${Date.now()}`,
        itemId: record.itemId,
        locationId: 'LOC-WH-MAIN-QUARANTINE',
        lotNumber: record.lotNumber,
        expiryDate: record.expiryDate,
        receivedDate: '2026-09-20',
        physicalOnHand: record.quarantinedQty,
        quarantined: record.quarantinedQty,
        pendingInspection: 0,
        damaged: record.packageCondition === 'crushed_compromised' ? record.quarantinedQty : 0,
        expired: 0,
        pickedStaged: 0,
        pendingDisposal: 0,
        reservedCommitted: 0,
        availableForPicking: 0, // Strictly unavailable
        inTransit: 0,
        lastUpdatedTimestamp: '2026-09-20 10:30',
        quantityStatus: 'available',
        dataSource: 'warehouse_realtime_sim'
      };
      setStockBalances(prev => [newQuarantineBal, ...prev]);
    }
  };

  // 2. Put-away to shelf bin confirmation (Scenario I11)
  const handleUpdatePutaway = (receiptId: string, targetBinLocationId: string) => {
    const targetReceipt = goodsReceipts.find(r => r.id === receiptId);
    setGoodsReceipts(prev =>
      prev.map(r =>
        r.id === receiptId
          ? {
              ...r,
              putAwayStatus: 'putaway_completed',
              assignedBinLocationId: targetBinLocationId
            }
          : r
      )
    );

    if (targetReceipt) {
      setStockBalances(prev =>
        prev.map(b => {
          if (
            b.itemId === targetReceipt.itemId &&
            b.locationId === targetReceipt.receivingLocationId &&
            (!targetReceipt.lotNumber || b.lotNumber === targetReceipt.lotNumber)
          ) {
            return {
              ...b,
              locationId: targetBinLocationId,
              lastUpdatedTimestamp: '2026-09-20 10:30'
            };
          }
          return b;
        })
      );
    }
  };

  // 3. Departmental Requisitions (Scenario I01, I02) - Granular Reservation & Ownership Tracing
  const handleAddRequisition = (newReq: DepartmentalRequisition) => {
    setRequisitions(prev => [newReq, ...prev]);
  };

  const handleApproveRequisition = (reqId: string, approvedBy: string) => {
    const result = executeRequisitionApproval(
      reqId,
      approvedBy,
      requisitions,
      stockBalances,
      stockReservations,
      catalogItems,
      locations
    );
    if (result.success) {
      setRequisitions(result.updatedRequisitions);
      setStockBalances(result.updatedBalances);
      setStockReservations(result.updatedReservations);
    } else {
      console.warn(`Approval rejected: ${result.error}`);
    }
  };

  // 4. Warehouse Picking (Scenario I15) - Strict pre-validation: reject if insufficient BEFORE mutation
  // Enforces reservation ownership: cannot consume another requisition's reservation
  const handleCompletePick = (reqId: string) => {
    const result = executeRequisitionPick(
      reqId,
      requisitions,
      stockBalances,
      stockReservations,
      catalogItems
    );
    if (result.success) {
      setRequisitions(result.updatedRequisitions);
      setStockBalances(result.updatedBalances);
      setStockReservations(result.updatedReservations);
    } else {
      console.warn(`Pick rejected: ${result.error}`);
    }
  };

  // 5. Dispatch to Courier (Scenario I16) - Pre-validate staged units before mutation
  const handleDispatchToCourier = (reqId: string, courierName: string) => {
    const result = executeDispatchToCourier(
      reqId,
      courierName,
      requisitions,
      stockBalances,
      catalogItems
    );
    if (result.success) {
      setRequisitions(result.updatedRequisitions);
      setStockBalances(result.updatedBalances);
    } else {
      console.warn(`Dispatch rejected: ${result.error}`);
    }
  };

  // 6. Ward Delivery Acknowledgment
  const handleAcknowledgeWardDelivery = (reqId: string, acknowledgedBy: string) => {
    setRequisitions(prev =>
      prev.map(r =>
        r.id === reqId
          ? {
              ...r,
              fulfillmentStatus: 'delivered',
              deliveredAt: '2026-09-20 11:30'
            }
          : r
      )
    );
  };

  // 7. Inter-Location Transfers (Scenario I17, I18, I19)
  const handleAddTransfer = (newTrf: InterLocationTransfer) => {
    setTransfers(prev => [newTrf, ...prev]);
  };

  const handleDispatchTransfer = (transferId: string, carrierRef: string, driver: string) => {
    const targetTrf = transfers.find(t => t.id === transferId);
    if (!targetTrf) return;

    // PRE-VALIDATION: verify source stock before mutation
    for (const line of targetTrf.lines) {
      const sourceBal = stockBalances.find(
        b => b.itemId === line.itemId && b.locationId === targetTrf.sourceLocationId
      );
      if (!sourceBal || sourceBal.availableForPicking < line.requestedQty || sourceBal.physicalOnHand < line.requestedQty) {
        console.warn(`Transfer dispatch rejected: insufficient stock at source location ${targetTrf.sourceLocationId}`);
        return;
      }
    }

    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'in_transit',
              carrierReference: carrierRef,
              driverName: driver,
              dispatchedAt: getEffectiveTimestamp(),
              lines: t.lines.map(l => ({ ...l, dispatchedQty: l.requestedQty }))
            }
          : t
      )
    );

    // Dispatched stock is marked inTransit and unavailable for local picking at both source and destination
    setStockBalances(prev => {
      return prev.map(b => {
        const matchedLine = targetTrf.lines.find(l => l.itemId === b.itemId);
        if (matchedLine && b.locationId === targetTrf.sourceLocationId) {
          const transferQty = matchedLine.requestedQty;
          const newOnHand = b.physicalOnHand - transferQty;
          const unavailable =
            b.quarantined +
            (b.damaged || 0) +
            (b.expired || 0) +
            (b.pickedStaged || 0) +
            (b.reservedCommitted || 0) +
            (b.pendingInspection || 0) +
            (b.pendingDisposal || 0);
          const newAvailable = Math.max(0, newOnHand - unavailable);
          return {
            ...b,
            physicalOnHand: newOnHand,
            availableForPicking: newAvailable,
            inTransit: (b.inTransit || 0) + transferQty,
            lastUpdatedTimestamp: getEffectiveTimestamp()
          };
        }
        return b;
      });
    });
  };

  const handleReceiveTransfer = (
    transferId: string,
    receivedQty: number,
    damagedMissingQty: number,
    notes: string
  ) => {
    const targetTrf = transfers.find(t => t.id === transferId);
    if (!targetTrf) return;

    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: damagedMissingQty > 0 ? 'partially_received' : 'fully_received',
              receivedAt: getEffectiveTimestamp(),
              unresolvedVarianceCount: damagedMissingQty > 0 ? damagedMissingQty : undefined,
              discrepancyReportNotes: notes,
              lines: t.lines.map(l => ({
                ...l,
                receivedQty,
                damagedMissingQty
              }))
            }
          : t
      )
    );

    // Update destination location stock: received intact quantity becomes available, damaged units quarantined
    // AND clear inTransit on source location balance!
    const line = targetTrf.lines[0];
    if (line) {
      const totalMoved = receivedQty + (damagedMissingQty > 0 ? damagedMissingQty : 0);
      setStockBalances(prev => {
        // First, clear inTransit on source location
        const step1 = prev.map(b => {
          if (b.itemId === line.itemId && b.locationId === targetTrf.sourceLocationId) {
            return {
              ...b,
              inTransit: Math.max(0, (b.inTransit || 0) - totalMoved),
              lastUpdatedTimestamp: getEffectiveTimestamp()
            };
          }
          return b;
        });

        const existingDest = step1.find(
          b => b.itemId === line.itemId && b.locationId === targetTrf.destinationLocationId
        );
        if (existingDest) {
          return step1.map(b =>
            b.id === existingDest.id
              ? {
                  ...b,
                  physicalOnHand: b.physicalOnHand + totalMoved,
                  availableForPicking: b.availableForPicking + receivedQty,
                  damaged: (b.damaged || 0) + (damagedMissingQty > 0 ? damagedMissingQty : 0),
                  lastUpdatedTimestamp: getEffectiveTimestamp()
                }
              : b
          );
        } else {
          const newDestBal: PhysicalStockBalance = {
            id: `BAL-DEST-${Date.now()}`,
            itemId: line.itemId,
            locationId: targetTrf.destinationLocationId,
            lotNumber: line.lotNumber || 'LOT-TRF-RCV',
            expiryDate: '2027-12-31',
            receivedDate: getEffectiveDateString(),
            physicalOnHand: totalMoved,
            pendingInspection: 0,
            quarantined: 0,
            damaged: damagedMissingQty > 0 ? damagedMissingQty : 0,
            expired: 0,
            pickedStaged: 0,
            pendingDisposal: 0,
            reservedCommitted: 0,
            availableForPicking: receivedQty,
            inTransit: 0,
            quantityStatus: 'available',
            lastUpdatedTimestamp: getEffectiveTimestamp(),
            dataSource: 'warehouse_realtime_sim'
          };
          return [newDestBal, ...step1];
        }
      });
    }
  };

  // 8. Recall Sweep & Quarantine Enforcement (Scenario I22)
  const handleTriggerRecallSweep = (recallId: string) => {
    const targetRecall = recalls.find(r => r.id === recallId);
    if (!targetRecall) return;

    const affectedLots: string[] =
      (targetRecall as any).affectedLotNumbers || (targetRecall as any).affectedLots || [];

    // 1. Mark recall restriction as enforced.
    // Warehouse locations are immediately locked; remote wards remain unconfirmed (unresolved destinations)
    // until recorded mock confirmation is received.
    setRecalls(prev =>
      prev.map(r => {
        if (r.id === recallId) {
          const updatedLocations = (r.affectedLocations || []).map((loc: any) => {
            const locRecord = locations.find(l => l.id === loc.locationId);
            const isWarehouse = locRecord
              ? (locRecord.warehouseCode === 'CENTRAL-WH' || locRecord.isQuarantineArea || locRecord.isStagingArea)
              : (loc.locationId.startsWith('LOC-WH-') || loc.locationId.includes('QUARANTINE'));
            if (isWarehouse) {
              return {
                ...loc,
                acknowledged: true,
                unitsQuarantined: loc.unitsFound
              };
            }
            return {
              ...loc,
              acknowledged: false,
              unitsQuarantined: 0
            };
          });

          const initialQuarantined = updatedLocations.reduce(
            (sum: number, loc: any) => sum + (loc.unitsQuarantined || 0),
            0
          );

          return {
            ...r,
            status: 'quarantine_enforced',
            notificationStatus: 'quarantine_in_progress', // Unresolved destinations exist
            totalUnitsQuarantined: initialQuarantined,
            affectedLocations: updatedLocations
          };
        }
        return r;
      })
    );

    // 2. Quarantine matching lot units without destroying existing bucket separation or double counting
    setStockBalances(prev =>
      prev.map(b => {
        if (b.lotNumber && affectedLots.includes(b.lotNumber)) {
          // Transfer available, reserved, and staged units to quarantine; preserve already quarantined and damaged units
          const unitsToMove = b.availableForPicking + (b.reservedCommitted || 0) + (b.pickedStaged || 0);
          const newQuarantined = b.quarantined + unitsToMove;
          const newReserved = 0;
          const newPickedStaged = 0;
          const newAvailable = 0;

          // Physical on-hand remains the conservative physical sum of all mutually exclusive buckets
          const newOnHand =
            newQuarantined +
            (b.damaged || 0) +
            (b.expired || 0) +
            newPickedStaged +
            (b.pendingInspection || 0) +
            (b.pendingDisposal || 0);

          return {
            ...b,
            physicalOnHand: newOnHand,
            quarantined: newQuarantined,
            pickedStaged: newPickedStaged,
            reservedCommitted: newReserved,
            availableForPicking: newAvailable, // Strictly locked from picking
            lastUpdatedTimestamp: getEffectiveTimestamp()
          };
        }
        return b;
      })
    );
  };

  // Location-level recall acknowledgment & quarantine confirmation
  const handleAcknowledgeLocationRecall = (recallId: string, locationId: string) => {
    setRecalls(prev =>
      prev.map(r => {
        if (r.id === recallId) {
          const updatedLocations = (r.affectedLocations || []).map((loc: any) =>
            loc.locationId === locationId
              ? { ...loc, acknowledged: true, unitsQuarantined: loc.unitsFound }
              : loc
          );
          const allQuarantined = updatedLocations.reduce(
            (acc: number, curr: any) => acc + (curr.unitsQuarantined || 0),
            0
          );
          const allConfirmed = updatedLocations.every(
            (l: any) => l.acknowledged && l.unitsQuarantined >= l.unitsFound
          );
          return {
            ...r,
            totalUnitsQuarantined: allQuarantined,
            notificationStatus: allConfirmed ? 'reconciliation_complete' : 'quarantine_in_progress',
            affectedLocations: updatedLocations
          };
        }
        return r;
      })
    );
  };

  // 9. Quarantine Release Protocol (Scenario I23)
  const handleReleaseQuarantine = (balanceId: string, authorizedBy: string, rationale: string) => {
    setStockBalances(prev =>
      prev.map(b => {
        if (b.id === balanceId) {
          const releasedQty = b.quarantined;
          return {
            ...b,
            quarantined: 0,
            availableForPicking: releasedQty,
            lastUpdatedTimestamp: getEffectiveTimestamp()
          };
        }
        return b;
      })
    );
  };

  // 10. Cycle Count Variance Approval (Approval ONLY - does NOT mutate inventory - Section 7)
  const handleApproveCycleCountVariance = (
    batchId: string,
    lineId: string,
    approvedBy: string,
    reason: string
  ) => {
    setCycleCountBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            status: 'reconciliation_pending',
            lines: b.lines.map(l =>
              l.lineId === lineId
                ? {
                    ...l,
                    reconciliationStatus: 'approved_pending_action',
                    approvedBy,
                    adjustmentReason: reason,
                    approvedAt: getEffectiveTimestamp()
                  }
                : l
            )
          };
        }
        return b;
      })
    );
    // Strict contract: Approval NEVER mutates stock balances!
  };

  // 11. Cycle Count Variance Application (Explicit Stock Modification - Section 7)
  const handleApplyCycleCountAdjustment = (
    batchId: string,
    lineId: string,
    appliedBy: string
  ) => {
    const targetBatch = cycleCountBatches.find(b => b.id === batchId);
    const targetLine = targetBatch?.lines.find(l => l.lineId === lineId);
    if (!targetLine) return;

    // Rule 1: Approval != Application. Must be approved first!
    if (targetLine.reconciliationStatus !== 'approved_pending_action') {
      console.warn('Cannot apply cycle count adjustment: line has not been approved yet');
      return;
    }

    // Rule 2: Second application rejected!
    if (targetLine.reconciliationStatus === 'adjusted') {
      console.warn('Cannot apply cycle count adjustment: already adjusted');
      return;
    }

    // Rule 3: Stale count rejected without overwriting stock
    const currentBalance = stockBalances.find(
      b => b.itemId === targetLine.itemId && b.locationId === targetLine.locationId
    );

    if (currentBalance && currentBalance.physicalOnHand !== targetLine.systemRecordedQty) {
      console.warn('Stale count rejected: system balance changed since count was taken');
      setCycleCountBatches(prev =>
        prev.map(b => {
          if (b.id === batchId) {
            return {
              ...b,
              lines: b.lines.map(l =>
                l.lineId === lineId
                  ? {
                      ...l,
                      reconciliationStatus: 'stale_rejected',
                      adjustmentReason: `تم رفض التسوية: الرصيد الفعلي الحالي (${currentBalance.physicalOnHand}) يختلف عن الرصيد المسجل وقت الجرد (${l.systemRecordedQty}). يلزم إعادة الجرد (Recount).`
                    }
                  : l
              )
            };
          }
          return b;
        })
      );
      // Stock balance remains UNTOUCHED!
      return;
    }

    // Rule 4: One valid application
    // Update batch line status
    setCycleCountBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            lines: b.lines.map(l =>
              l.lineId === lineId
                ? {
                    ...l,
                    reconciliationStatus: 'adjusted',
                    appliedBy,
                    appliedAt: getEffectiveTimestamp(),
                    beforeOnHand: currentBalance?.physicalOnHand || l.systemRecordedQty,
                    afterOnHand: l.physicalCountedQty
                  }
                : l
            )
          };
        }
        return b;
      })
    );

    // Update actual physical balance while preserving all other buckets
    setStockBalances(prev =>
      prev.map(b => {
        if (b.itemId === targetLine.itemId && b.locationId === targetLine.locationId) {
          const newOnHand = targetLine.physicalCountedQty;
          const unavailableBuckets =
            (b.quarantined || 0) +
            (b.damaged || 0) +
            (b.expired || 0) +
            (b.pickedStaged || 0) +
            (b.reservedCommitted || 0) +
            (b.pendingInspection || 0) +
            (b.pendingDisposal || 0);
          const newAvailable = Math.max(0, newOnHand - unavailableBuckets);

          return {
            ...b,
            physicalOnHand: newOnHand,
            availableForPicking: newAvailable,
            lastUpdatedTimestamp: getEffectiveTimestamp()
          };
        }
        return b;
      })
    );
  };

  // 12. Request Recount (Section 7) - Does not silently adjust balance
  const handleRequestRecount = (batchId: string, lineId: string, requestedBy: string) => {
    setCycleCountBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            lines: b.lines.map(l =>
              l.lineId === lineId
                ? {
                    ...l,
                    recountRequested: true,
                    reconciliationStatus: 'recount_in_progress',
                    recountRequestedBy: requestedBy
                  }
                : l
            )
          };
        }
        return b;
      })
    );
    // Recount does NOT touch stockBalances!
  };

  // 13. Record Blind Field Count (Section 7)
  const handleRecordBlindCount = (batchId: string, lineId: string, countedQty: number, countedBy: string) => {
    setCycleCountBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            lines: b.lines.map(l => {
              if (l.lineId === lineId) {
                const variance = countedQty - l.systemRecordedQty;
                return {
                  ...l,
                  physicalCountedQty: countedQty,
                  varianceQty: variance,
                  countedBy,
                  reconciliationStatus: variance === 0 ? 'reconciled_match' : 'pending_approval'
                };
              }
              return l;
            })
          };
        }
        return b;
      })
    );
  };

  // Sub-tab definitions
  const subTabs = [
    { id: 'overview' as const, labelAr: 'لوحة العمليات والسيناريوهات', icon: LayoutDashboard },
    { id: 'catalog' as const, labelAr: 'دليل المواد (Item Master)', icon: Boxes },
    { id: 'stock_ledger' as const, labelAr: 'سجل الأرصدة والمواقع', icon: Warehouse },
    { id: 'receiving' as const, labelAr: 'الاستلام والفحص (Dock QA)', icon: Truck },
    { id: 'requisitions' as const, labelAr: 'طلبات الإمداد والبار (PAR)', icon: ClipboardList },
    { id: 'picking' as const, labelAr: 'التجهيز والصرف (FEFO)', icon: PackageCheck },
    { id: 'transfers' as const, labelAr: 'التحويل بين الفروع', icon: ArrowRightLeft },
    { id: 'recalls' as const, labelAr: 'الاستدعاءات والحجر', icon: ShieldAlert },
    { id: 'cycle_count' as const, labelAr: 'الجرد الدوري والتدقيق', icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* 1. Prototype Disclaimer Banner */}
      <SupplyChainBanner
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        selectedScenario={selectedScenarioForBanner}
      />

      {/* 2. Sub-Navigation Tabs Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 sticky top-14 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2.5">
            {subTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.labelAr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Dynamic Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeSubTab === 'overview' && (
          <MaterialsManagementDashboard
            onNavigateTab={setActiveSubTab}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'catalog' && (
          <ItemMasterCatalogView
            items={catalogItems}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'stock_ledger' && (
          <StockVisibilityLedgerView
            stockBalances={stockBalances}
            locations={locations}
            catalogItems={catalogItems}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'receiving' && (
          <CentralGoodsReceivingView
            purchaseOrders={purchaseOrders}
            goodsReceipts={goodsReceipts}
            catalogItems={catalogItems}
            locations={locations}
            onAddGoodsReceipt={handleAddGoodsReceipt}
            onUpdatePutaway={handleUpdatePutaway}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'requisitions' && (
          <InternalRequisitionsWorkspace
            requisitions={requisitions}
            catalogItems={catalogItems}
            parLevels={parLevels}
            locations={locations}
            onAddRequisition={handleAddRequisition}
            onApproveRequisition={handleApproveRequisition}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'picking' && (
          <PickingDispatchWorkspace
            requisitions={requisitions}
            stockBalances={stockBalances}
            catalogItems={catalogItems}
            locations={locations}
            stockReservations={stockReservations}
            onCompletePick={handleCompletePick}
            onDispatchToCourier={handleDispatchToCourier}
            onAcknowledgeWardDelivery={handleAcknowledgeWardDelivery}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'transfers' && (
          <InterLocationTransfersView
            transfers={transfers}
            catalogItems={catalogItems}
            locations={locations}
            onAddTransfer={handleAddTransfer}
            onDispatchTransfer={handleDispatchTransfer}
            onReceiveTransfer={handleReceiveTransfer}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'recalls' && (
          <RecallsQuarantineView
            recalls={recalls}
            stockBalances={stockBalances}
            catalogItems={catalogItems}
            locations={locations}
            onTriggerRecallSweep={handleTriggerRecallSweep}
            onReleaseQuarantine={handleReleaseQuarantine}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeSubTab === 'cycle_count' && (
          <PhysicalCycleCountAuditView
            cycleCountBatches={cycleCountBatches}
            stockBalances={stockBalances}
            catalogItems={catalogItems}
            locations={locations}
            onApproveCycleCountVariance={handleApproveCycleCountVariance}
            onApplyCycleCountAdjustment={handleApplyCycleCountAdjustment}
            onRequestRecount={handleRequestRecount}
            onRecordBlindCount={handleRecordBlindCount}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}
      </main>

      {/* 4. Interactive 30-Scenario Runner Modal */}
      <ScenarioTestingModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onSelectScenario={sc => setSelectedScenarioForBanner(sc)}
        onNavigateTab={setActiveSubTab}
      />
    </div>
  );
};
