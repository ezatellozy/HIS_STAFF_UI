import React, { useState } from 'react';
import {
  Pill,
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  MessageSquare,
  FlaskConical,
  PackageCheck,
  LogOut,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Building2,
  ArrowLeft,
  FileCheck,
  ShieldAlert,
  Package,
  AlertTriangle
} from 'lucide-react';
import {
  PharmacyServiceType,
  PharmacyRolePersona,
  PharmacyViewTab,
  PharmacyFilterState,
  MedicationOrderContext,
  PharmacyIntervention,
  CompoundingWorksheet,
  DispenseRecord,
  DischargeMedicationSupply,
  MedicationReturnContext,
  CancelledAfterPreparationContext,
  VerificationDecision,
  EmergencyExceptionRecord,
  PharmacyReceivingRecord,
  MedicationRecallRecord,
  PharmacyOrgContext
} from '../../types/pharmacyOps';
import {
  INITIAL_PHARMACY_ORDERS,
  INITIAL_PHARMACY_INTERVENTIONS,
  INITIAL_COMPOUNDING_WORKSHEETS,
  INITIAL_DISPENSE_RECORDS,
  INITIAL_DISCHARGE_SUPPLIES,
  INITIAL_MEDICATION_RETURNS,
  INITIAL_CANCELLED_PREPARATIONS,
  INITIAL_PHARMACY_METRICS,
  INITIAL_EMERGENCY_EXCEPTIONS,
  INITIAL_RECEIVING_RECORDS,
  INITIAL_MEDICATION_RECALLS,
  INITIAL_PHARMACY_ORG_CONTEXT
} from '../../data/mockPharmacyOpsData';

import { PharmacyOperationalHome } from './PharmacyOperationalHome';
import { IncomingOrdersView } from './IncomingOrdersView';
import { PreparationWorklistView } from './PreparationWorklistView';
import { DispensingQueueView } from './DispensingQueueView';
import { DischargeMedicationView } from './DischargeMedicationView';
import { ReturnsExceptionsView } from './ReturnsExceptionsView';
import { InterventionsListView } from './InterventionsListView';
import { EmergencyExceptionsView } from './EmergencyExceptionsView';
import { InventoryReceivingView } from './InventoryReceivingView';
import { MedicationRecallView } from './MedicationRecallView';
import { MedicationCatalogReferenceModal } from './MedicationCatalogReferenceModal';
import { MedicationVerificationModal } from './MedicationVerificationModal';
import { PharmacyInterventionModal } from './PharmacyInterventionModal';
import { StandardPreparationModal } from './StandardPreparationModal';
import { SterileIvPreparationModal } from './SterileIvPreparationModal';
import { LabelPreviewModal } from './LabelPreviewModal';
import { PharmacyQuickPreviewDrawer } from './PharmacyQuickPreviewDrawer';
import { PharmacyDemoScenariosModal } from './PharmacyDemoScenariosModal';

interface PharmacyOpsShellProps {
  onBackToOrigin?: () => void;
  onOpenPatientWorkspace?: (patientId: string, options?: { initialActivity?: string; initialTab?: string }) => void;
}

export const PharmacyOpsShell: React.FC<PharmacyOpsShellProps> = ({
  onBackToOrigin,
  onOpenPatientWorkspace
}) => {
  // Active Service & Persona
  const [activeService, setActiveService] = useState<PharmacyServiceType>('inpatient');
  const [activePersona, setActivePersona] = useState<PharmacyRolePersona>('clinical_pharmacist');
  const [activeTab, setActiveTab] = useState<PharmacyViewTab>('home');

  // Operational State
  const [orders, setOrders] = useState<MedicationOrderContext[]>(INITIAL_PHARMACY_ORDERS);
  const [interventions, setInterventions] = useState<PharmacyIntervention[]>(INITIAL_PHARMACY_INTERVENTIONS);
  const [worksheets, setWorksheets] = useState<CompoundingWorksheet[]>(INITIAL_COMPOUNDING_WORKSHEETS);
  const [dispenseRecords, setDispenseRecords] = useState<DispenseRecord[]>(INITIAL_DISPENSE_RECORDS);
  const [dischargeSupplies, setDischargeSupplies] = useState<DischargeMedicationSupply[]>(INITIAL_DISCHARGE_SUPPLIES);
  const [returns, setReturns] = useState<MedicationReturnContext[]>(INITIAL_MEDICATION_RETURNS);
  const [cancelledPreps, setCancelledPreps] = useState<CancelledAfterPreparationContext[]>(INITIAL_CANCELLED_PREPARATIONS);
  const [metrics, setMetrics] = useState(INITIAL_PHARMACY_METRICS);

  // Filter State
  const [filterState, setFilterState] = useState<PharmacyFilterState>({
    service: 'inpatient',
    tab: 'home',
    searchQuery: '',
    priorityFilter: 'all',
    statusFilter: 'all',
    formularyFilter: 'all',
    stockFilter: 'all',
    highAlertOnly: false,
    delayedOnly: false,
    preparationTypeFilter: 'all'
  });

  // Modal / Drawer Selection States
  const [quickPreviewOrder, setQuickPreviewOrder] = useState<MedicationOrderContext | null>(null);
  const [verificationModalOrder, setVerificationModalOrder] = useState<MedicationOrderContext | null>(null);
  const [clarificationModalOrder, setClarificationModalOrder] = useState<MedicationOrderContext | null>(null);
  const [standardPrepModalOrder, setStandardPrepModalOrder] = useState<MedicationOrderContext | null>(null);
  const [sterileWorksheetModal, setSterileWorksheetModal] = useState<CompoundingWorksheet | null>(null);
  const [labelPreviewOrder, setLabelPreviewOrder] = useState<MedicationOrderContext | null>(null);
  const [labelPreviewWorksheet, setLabelPreviewWorksheet] = useState<CompoundingWorksheet | null>(null);
  const [labelPreviewDispense, setLabelPreviewDispense] = useState<DispenseRecord | null>(null);
  const [isScenariosModalOpen, setIsScenariosModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // Extended Operational State: Emergency Exceptions, Receiving, Recalls, Org Context
  const [emergencyExceptions, setEmergencyExceptions] = useState<EmergencyExceptionRecord[]>(INITIAL_EMERGENCY_EXCEPTIONS);
  const [receivingRecords, setReceivingRecords] = useState<PharmacyReceivingRecord[]>(INITIAL_RECEIVING_RECORDS);
  const [recalls, setRecalls] = useState<MedicationRecallRecord[]>(INITIAL_MEDICATION_RECALLS);
  const [orgContext, setOrgContext] = useState<PharmacyOrgContext>(INITIAL_PHARMACY_ORG_CONTEXT);

  // Handlers for Operational Decisions
  const handleConfirmVerification = (orderId: string, decision: VerificationDecision, note?: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: 'verified',
            verificationStatus: 'verified',
            verifiedBy: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
            verifiedAt: 'الآن',
            verificationNote: note || ord.verificationNote
          };
        }
        return ord;
      })
    );
    setMetrics(prev => ({
      ...prev,
      awaitingVerificationCount: Math.max(0, prev.awaitingVerificationCount - 1),
      verifiedAwaitingPrepCount: prev.verifiedAwaitingPrepCount + 1
    }));
  };

  const handleSubmitIntervention = (newIntervention: Omit<PharmacyIntervention, 'id' | 'initiatedAt'>) => {
    const intervention: PharmacyIntervention = {
      ...newIntervention,
      id: `INT-2026-${Math.floor(100 + Math.random() * 900)}`,
      initiatedAt: 'الآن'
    };

    setInterventions(prev => [intervention, ...prev]);

    // Update order state to clarification needed
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === newIntervention.orderId) {
          return {
            ...ord,
            orderStatus: 'clarification_needed',
            verificationStatus: 'clarification',
            verificationNote: `طلب استيضاح: ${newIntervention.issueDescription}`
          };
        }
        return ord;
      })
    );

    setMetrics(prev => ({
      ...prev,
      clarificationsPendingCount: prev.clarificationsPendingCount + 1
    }));
  };

  const handleResolveIntervention = (
    id: string,
    responseNote: string,
    action: 'source_order_modified' | 'override_reconfirmed'
  ) => {
    setInterventions(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'accepted_by_prescriber',
            prescriberResponseNote: responseNote,
            prescriberActionTaken: action,
            resolvedAt: 'الآن'
          };
        }
        return item;
      })
    );
    setMetrics(prev => ({
      ...prev,
      clarificationsPendingCount: Math.max(0, prev.clarificationsPendingCount - 1)
    }));
  };

  const handleCompleteStandardPrep = (orderId: string, lot: string, expiry: string, preparedQty: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Create dispense record
    const newDispense: DispenseRecord = {
      id: `DSP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: order.id,
      patientName: order.patientName,
      mrn: order.mrn,
      medicationName: `${order.brandName} (${order.genericName})`,
      dosageForm: order.dosageForm,
      route: order.route,
      orderedQuantity: order.totalQuantityOrdered,
      dispensedQuantity: preparedQty,
      remainingQuantity: Math.max(0, order.totalQuantityOrdered - preparedQty),
      isPartialDispense: preparedQty < order.totalQuantityOrdered,
      partialDispenseReason: preparedQty < order.totalQuantityOrdered ? 'صرف جزئي مرحلي بحسب المتوفر' : undefined,
      batchLot: lot,
      expiryDate: expiry,
      dispensedBy: 'د. ليلى عبد الحميد',
      dispensedAt: 'الآن',
      destinationType: 'inpatient_ward_cart',
      destinationLocation: order.locationWardBed,
      handoffStatus: 'awaiting_collection',
      barcodeScannedMock: true
    };

    setDispenseRecords(prev => [newDispense, ...prev]);

    // Update order status
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            orderStatus: preparedQty < ord.totalQuantityOrdered ? 'partially_dispensed' : 'ready_for_dispense'
          };
        }
        return ord;
      })
    );

    setMetrics(prev => ({
      ...prev,
      readyForDispensingCount: prev.readyForDispensingCount + 1
    }));
  };

  const handleSignoffTechnician = (worksheetId: string) => {
    setWorksheets(prev =>
      prev.map(ws => {
        if (ws.id === worksheetId) {
          return {
            ...ws,
            preparedByTechnician: 'ماجد الشريف (فني تحضير معقم)',
            preparedAt: 'الآن',
            preparationState: 'prepared_awaiting_check'
          };
        }
        return ws;
      })
    );
  };

  const handleSignoffPharmacistCheck = (worksheetId: string) => {
    setWorksheets(prev =>
      prev.map(ws => {
        if (ws.id === worksheetId) {
          return {
            ...ws,
            finalCheckedByPharmacist: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
            finalCheckedAt: 'الآن',
            preparationState: 'passed_final_check'
          };
        }
        return ws;
      })
    );
  };

  const handleConfirmHandoff = (dispenseId: string, collectedBy: string) => {
    setDispenseRecords(prev =>
      prev.map(rec => {
        if (rec.id === dispenseId) {
          return {
            ...rec,
            handoffStatus: 'collected_handoff_complete',
            collectedBy,
            collectedAt: 'الآن'
          };
        }
        return rec;
      })
    );
  };

  const handleToggleCounseling = (orderId: string) => {
    setDischargeSupplies(prev =>
      prev.map(item => {
        if (item.orderId === orderId) {
          return { ...item, counselingDone: !item.counselingDone };
        }
        return item;
      })
    );
  };

  const handleToggleDischargeHandoff = (orderId: string) => {
    setDischargeSupplies(prev =>
      prev.map(item => {
        if (item.orderId === orderId) {
          return { ...item, handedToPatientOrFamily: !item.handedToPatientOrFamily };
        }
        return item;
      })
    );
  };

  const handleProcessReturn = (
    returnId: string,
    action: 'return_to_active_stock' | 'quarantine_for_destruction'
  ) => {
    setReturns(prev =>
      prev.map(ret => {
        if (ret.id === returnId) {
          return {
            ...ret,
            dispositionAction: action,
            processedAt: 'الآن'
          };
        }
        return ret;
      })
    );
  };

  const handleUpdateDisposition = (
    orderId: string,
    disposition: CancelledAfterPreparationContext['productDisposition']
  ) => {
    setCancelledPreps(prev =>
      prev.map(item => {
        if (item.orderId === orderId) {
          return {
            ...item,
            productDisposition: disposition,
            dispositionDocumentedBy: 'د. سامي الجوهر (مسؤول الجودة)'
          };
        }
        return item;
      })
    );
  };

  const handleApproveRetrospectiveReview = (id: string, notes: string) => {
    setEmergencyExceptions(prev =>
      prev.map(exc => {
        if (exc.id === id) {
          return {
            ...exc,
            retrospectiveStatus: 'approved',
            reviewedByPharmacist: 'د. ليلى عبد الحميد (صيدلي إكلينيكي)',
            reviewedAt: 'الآن',
            pharmacistNotes: notes || exc.pharmacistNotes
          };
        }
        return exc;
      })
    );
  };

  const handleRequestClarificationException = (id: string, notes: string) => {
    setEmergencyExceptions(prev =>
      prev.map(exc => {
        if (exc.id === id) {
          return {
            ...exc,
            retrospectiveStatus: 'clarification_requested',
            pharmacistNotes: notes
          };
        }
        return exc;
      })
    );
  };

  const handleUpdateInspectionStatus = (
    recordId: string,
    status: PharmacyReceivingRecord['inspectionStatus'],
    acceptedQty: number,
    quarantinedQty: number,
    notes: string
  ) => {
    setReceivingRecords(prev =>
      prev.map(rec => {
        if (rec.id === recordId) {
          return {
            ...rec,
            inspectionStatus: status,
            acceptedQuantity: acceptedQty,
            quarantinedQuantity: quarantinedQty,
            inspectionNotes: notes,
            inspectedBy: 'ماجد الشريف (فني صيدلة معتمد)',
            inspectedAt: 'الآن'
          };
        }
        return rec;
      })
    );
  };

  const handleQuarantineLocation = (recallId: string, locationName: string) => {
    setRecalls(prev =>
      prev.map(rec => {
        if (rec.id === recallId) {
          const updatedLocs = rec.affectedLocations.map(loc =>
            loc.locationName === locationName ? { ...loc, quarantineStatus: 'quarantined' as const } : loc
          );
          const allQuarantined = updatedLocs.every(loc => loc.quarantineStatus === 'quarantined');
          return {
            ...rec,
            affectedLocations: updatedLocs,
            recallStatus: allQuarantined ? 'quarantine_complete' : 'quarantine_in_progress'
          };
        }
        return rec;
      })
    );
  };

  // Scenario Launcher Handler
  const handleSelectScenario = (scenarioKey: string, targetTab: PharmacyViewTab, targetOrderId?: string) => {
    if ((targetTab as string) === 'catalog_reference') {
      setIsCatalogModalOpen(true);
      return;
    }
    setActiveTab(targetTab);
    if (targetOrderId) {
      const order = orders.find(o => o.id === targetOrderId);
      if (order) {
        if (targetTab === 'verification') {
          setVerificationModalOrder(order);
        } else {
          setQuickPreviewOrder(order);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Persistent Synthetic Design Preview Banner */}
      <div className="bg-amber-800 text-white px-4 py-1.5 text-center text-xs font-bold shadow-xs flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
          <span>معاينة تصميم محاكاة — لا توجد بيانات مرضى حقيقية (Synthetic Design Preview — No real patient data)</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-amber-200">
          <span>Verification ≠ Administration</span>
          <span>•</span>
          <span>Missing ≠ Zero</span>
          <span>•</span>
          <span>Overnight Sync ≠ Retrospective Clearance</span>
        </div>
      </div>

      {/* Top Header & Service Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-7 z-30 shadow-xs">
        {/* Service Line: Inpatient, STAT, OPD, Discharge, Cleanroom */}
        <div className="px-6 py-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {onBackToOrigin && (
              <button
                onClick={onBackToOrigin}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 font-bold text-xs"
                title="الرجوع إلى مساحة العمل السابقة"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>رجوع</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Pill className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide">صيدلية العمليات الإكلينيكية (Pharmacy Operations)</span>
            </div>

            {/* Service Profile Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveService('inpatient')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeService === 'inpatient'
                    ? 'bg-teal-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                التنويم الداخلي (Inpatient)
              </button>
              <button
                onClick={() => setActiveService('emergency_stat')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeService === 'emergency_stat'
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                الطوارئ و STAT
              </button>
              <button
                onClick={() => setActiveService('sterile_iv')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeService === 'sterile_iv'
                    ? 'bg-cyan-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                المحاليل المعقمة (Cleanroom)
              </button>
              <button
                onClick={() => setActiveService('discharge')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeService === 'discharge'
                    ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                أدوية التخريج (Discharge)
              </button>
              <button
                onClick={() => setActiveService('outpatient')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeService === 'outpatient'
                    ? 'bg-teal-500 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                العيادات الخارجية
              </button>
            </div>
          </div>

          {/* Persona Switcher & Scenario Launcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>الدور النشط:</span>
              <select
                value={activePersona}
                onChange={e => setActivePersona(e.target.value as PharmacyRolePersona)}
                className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
              >
                <option value="clinical_pharmacist">صيدلي إكلينيكي (Clinical Pharmacist)</option>
                <option value="inpatient_pharmacist">صيدلي التنويم الداخلي</option>
                <option value="pharmacy_technician">فني صيدلة (Pharmacy Tech)</option>
                <option value="sterile_technician">فني تحضير معقم (Cleanroom Tech)</option>
                <option value="outpatient_pharmacist">صيدلي العيادات والتخريج</option>
                <option value="pharmacy_supervisor">مشرف العمليات الصيدلانية</option>
              </select>
            </div>

            <button
              onClick={() => setIsScenariosModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>سيناريوهات A ➔ H</span>
            </button>
          </div>
        </div>

        {/* Organizational Context & Multi-Location Bar */}
        <div className="bg-slate-800 text-slate-200 px-6 py-1.5 border-b border-slate-700 flex flex-wrap items-center justify-between text-[11px] gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <strong className="text-white">{orgContext.hospitalName}</strong> ({orgContext.branchName})
            </span>
            <span className="text-slate-500">•</span>
            <span>القسم: <strong className="text-teal-300">{orgContext.departmentName}</strong></span>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">موقع الصيدلية النشط:</span>
              <select
                value={orgContext.activePharmacyLocationId}
                onChange={e => {
                  const loc = orgContext.availableLocations.find(l => l.id === e.target.value);
                  if (loc) {
                    setOrgContext(prev => ({
                      ...prev,
                      activePharmacyLocationId: loc.id,
                      activePharmacyLocationName: loc.name
                    }));
                  }
                }}
                className="bg-slate-900 text-teal-300 border border-slate-600 rounded px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer"
              >
                {orgContext.availableLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span>الممارس المعتمد: <strong className="text-white">{orgContext.currentStaffName}</strong> ({orgContext.currentStaffRole})</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-teal-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{orgContext.actingAssignment}</span>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="px-6 py-2 flex items-center justify-between border-t border-slate-100 bg-white">
          <nav className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>الرئيسية التشغيلية</span>
            </button>

            <button
              onClick={() => setActiveTab('incoming_orders')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'incoming_orders'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>طلبات الأدوية ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('interventions')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'interventions'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>الاستيضاحات والتدخلات ({interventions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency_exceptions')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'emergency_exceptions'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-600" />
              <span>استثناءات الطوارئ ({emergencyExceptions.filter(e => e.retrospectiveStatus === 'pending_retrospective_review').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('preparation')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'preparation'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>التحضير والمعقم ({worksheets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dispensing')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dispensing'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>طابور الصرف ({dispenseRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('discharge_supply')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'discharge_supply'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>أدوية التخريج ({dischargeSupplies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('returns_exceptions')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'returns_exceptions'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>المرتجع والإتلاف ({returns.length + cancelledPreps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('receiving')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'receiving'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>استلام وتفتيش المخزون ({receivingRecords.filter(r => r.inspectionStatus === 'pending_inspection').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('recalls')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'recalls'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>استدعاء وسحب الأدوية ({recalls.filter(r => r.recallStatus !== 'closed_reconciled').length})</span>
            </button>
          </nav>

          <button
            onClick={() => setIsCatalogModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-800 bg-white flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer"
            title="دليل المفاهيم والمصطلحات والـ Tall-Man"
          >
            <FileCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">قاموس المفاهيم & Tall-Man</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'home' && (
          <PharmacyOperationalHome
            metrics={metrics}
            orders={orders}
            interventions={interventions}
            onNavigateTab={tab => setActiveTab(tab)}
            onOpenQuickPreview={order => setQuickPreviewOrder(order)}
            onOpenVerification={order => setVerificationModalOrder(order)}
            onOpenScenariosModal={() => setIsScenariosModalOpen(true)}
          />
        )}

        {activeTab === 'incoming_orders' && (
          <IncomingOrdersView
            orders={orders}
            filterState={filterState}
            onUpdateFilter={updates => setFilterState(prev => ({ ...prev, ...updates }))}
            onOpenVerification={order => setVerificationModalOrder(order)}
            onOpenQuickPreview={order => setQuickPreviewOrder(order)}
            onOpenClarification={order => setClarificationModalOrder(order)}
            onOpenLabelPreview={order => setLabelPreviewOrder(order)}
          />
        )}

        {activeTab === 'interventions' && (
          <InterventionsListView
            interventions={interventions}
            onResolveIntervention={handleResolveIntervention}
          />
        )}

        {activeTab === 'preparation' && (
          <PreparationWorklistView
            worksheets={worksheets}
            ordersInPrep={orders.filter(o => o.orderStatus === 'verified' || o.orderStatus === 'preparing')}
            onOpenStandardPrep={order => setStandardPrepModalOrder(order)}
            onOpenSterileWorksheet={ws => setSterileWorksheetModal(ws)}
            onOpenLabelPreview={order => setLabelPreviewOrder(order)}
          />
        )}

        {activeTab === 'dispensing' && (
          <DispensingQueueView
            dispenseRecords={dispenseRecords}
            onConfirmHandoff={handleConfirmHandoff}
            onOpenLabelPreviewForDispense={record => setLabelPreviewDispense(record)}
          />
        )}

        {activeTab === 'discharge_supply' && (
          <DischargeMedicationView
            dischargeSupplies={dischargeSupplies}
            onToggleCounseling={handleToggleCounseling}
            onToggleHandoff={handleToggleDischargeHandoff}
            onOpenLabelPreview={orderId => {
              const ord = orders.find(o => o.id === orderId);
              if (ord) setLabelPreviewOrder(ord);
            }}
            onNavigateToAxis8={patientId => {
              if (onOpenPatientWorkspace) {
                onOpenPatientWorkspace(patientId, { initialActivity: 'medications', initialTab: 'reconciliation' });
              }
            }}
          />
        )}

        {activeTab === 'returns_exceptions' && (
          <ReturnsExceptionsView
            returns={returns}
            cancelledPreps={cancelledPreps}
            orders={orders}
            onProcessReturn={handleProcessReturn}
            onUpdateDisposition={handleUpdateDisposition}
          />
        )}

        {activeTab === 'emergency_exceptions' && (
          <EmergencyExceptionsView
            exceptions={emergencyExceptions}
            onApproveReview={handleApproveRetrospectiveReview}
            onRequestClarification={handleRequestClarificationException}
            onOpenPatientChart={patientId => {
              if (onOpenPatientWorkspace) {
                onOpenPatientWorkspace(patientId, { initialActivity: 'medications', initialTab: 'mar_grid' });
              }
            }}
          />
        )}

        {activeTab === 'receiving' && (
          <InventoryReceivingView
            records={receivingRecords}
            onUpdateInspectionStatus={handleUpdateInspectionStatus}
          />
        )}

        {activeTab === 'recalls' && (
          <MedicationRecallView
            recalls={recalls}
            onQuarantineLocation={handleQuarantineLocation}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <PharmacyQuickPreviewDrawer
        isOpen={!!quickPreviewOrder}
        onClose={() => setQuickPreviewOrder(null)}
        order={quickPreviewOrder}
        onOpenVerification={order => {
          setQuickPreviewOrder(null);
          setVerificationModalOrder(order);
        }}
        onOpenClarification={order => {
          setQuickPreviewOrder(null);
          setClarificationModalOrder(order);
        }}
        onViewLabelPreview={order => {
          setQuickPreviewOrder(null);
          setLabelPreviewOrder(order);
        }}
        onNavigateToAxis8={patientId => {
          if (onOpenPatientWorkspace) {
            onOpenPatientWorkspace(patientId, { initialActivity: 'medications', initialTab: 'mar_grid' });
          }
        }}
      />

      <MedicationVerificationModal
        isOpen={!!verificationModalOrder}
        onClose={() => setVerificationModalOrder(null)}
        order={verificationModalOrder}
        onConfirmVerification={handleConfirmVerification}
        onOpenClarification={order => {
          setVerificationModalOrder(null);
          setClarificationModalOrder(order);
        }}
        onNavigateToAxis8={patientId => {
          if (onOpenPatientWorkspace) {
            onOpenPatientWorkspace(patientId, { initialActivity: 'medications', initialTab: 'mar_grid' });
          }
        }}
      />

      <PharmacyInterventionModal
        isOpen={!!clarificationModalOrder}
        onClose={() => setClarificationModalOrder(null)}
        order={clarificationModalOrder}
        onSubmitIntervention={handleSubmitIntervention}
      />

      <StandardPreparationModal
        isOpen={!!standardPrepModalOrder}
        onClose={() => setStandardPrepModalOrder(null)}
        order={standardPrepModalOrder}
        onCompletePreparation={handleCompleteStandardPrep}
        onOpenLabelPreview={order => setLabelPreviewOrder(order)}
      />

      <SterileIvPreparationModal
        isOpen={!!sterileWorksheetModal}
        onClose={() => setSterileWorksheetModal(null)}
        worksheet={sterileWorksheetModal}
        onSignoffTechnician={handleSignoffTechnician}
        onSignoffPharmacistCheck={handleSignoffPharmacistCheck}
        onOpenLabelPreview={ws => setLabelPreviewWorksheet(ws)}
      />

      <LabelPreviewModal
        isOpen={!!labelPreviewOrder || !!labelPreviewWorksheet || !!labelPreviewDispense}
        onClose={() => {
          setLabelPreviewOrder(null);
          setLabelPreviewWorksheet(null);
          setLabelPreviewDispense(null);
        }}
        order={labelPreviewOrder}
        worksheet={labelPreviewWorksheet}
        dispense={labelPreviewDispense}
      />

      <PharmacyDemoScenariosModal
        isOpen={isScenariosModalOpen}
        onClose={() => setIsScenariosModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      <MedicationCatalogReferenceModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
      />
    </div>
  );
};
