import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  FileCheck, 
  ShoppingCart, 
  Building, 
  Building2, 
  AlertTriangle, 
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react';
import { 
  ProcurementBranchId, 
  PurchaseRequisition, 
  PurchaseRequisitionLine,
  SourcingEvent, 
  Quotation, 
  PurchaseOrder, 
  SupplierMaster, 
  FrameworkAgreement, 
  SupplierClaim,
  ProcurementMethod,
  SupplierCategory,
  ClaimStatus
} from '../../types/procurementOps';
import { 
  mockProcurementRequisitions, 
  mockSourcingEvents, 
  mockQuotations, 
  mockPurchaseOrders, 
  mockSupplierMasters, 
  mockFrameworkAgreements, 
  mockSupplierClaims 
} from '../../data/mockProcurementOpsData';
import { mockItemMasterCatalog } from '../../data/mockSupplyChainOpsData';
import { 
  processRequisitionApproval, 
  resubmitRequisitionWithAmendments, 
  validateAndConsolidateDemand, 
  recordAwardDecision,
  generatePurchaseOrderFromAward,
  simulateTransmitPurchaseOrder,
  recordSupplierOrderAcknowledgment,
  amendPurchaseOrder,
  advanceSupplierClaimStatus
} from '../../utils/procurementEngine';

import { ProcurementPreviewBanner } from './ProcurementPreviewBanner';
import { ProcurementOverviewPlanningView } from './ProcurementOverviewPlanningView';
import { PurchaseRequisitionWorkspace } from './PurchaseRequisitionWorkspace';
import { ProcurementIntakeSourcingView } from './ProcurementIntakeSourcingView';
import { QuotationsEvaluationWorkspace } from './QuotationsEvaluationWorkspace';
import { PurchaseOrderManagementWorkspace } from './PurchaseOrderManagementWorkspace';
import { SupplierMasterWorkspace } from './SupplierMasterWorkspace';
import { ContractsFrameworkWorkspace } from './ContractsFrameworkWorkspace';
import { SupplierClaimsWorkspace } from './SupplierClaimsWorkspace';

export const ProcurementOpsShell: React.FC = () => {
  // Master Synthetic Procurement State
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(mockProcurementRequisitions);
  const [sourcingEvents, setSourcingEvents] = useState<SourcingEvent[]>(mockSourcingEvents);
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [suppliers, setSuppliers] = useState<SupplierMaster[]>(mockSupplierMasters);
  const [agreements, setAgreements] = useState<FrameworkAgreement[]>(mockFrameworkAgreements);
  const [claims, setClaims] = useState<SupplierClaim[]>(mockSupplierClaims);

  // Active Contexts
  const [currentBranch, setCurrentBranch] = useState<ProcurementBranchId>('main_hospital');
  const [activeRole, setActiveRole] = useState<string>('procurement_specialist');
  const [activeTab, setActiveTab] = useState<string>('overview_planning');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [targetSourcingEventId, setTargetSourcingEventId] = useState<string>('');

  // Scenario Quick-Launcher Handler (PROC01 - PROC30)
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    if (!scenarioId) return;

    switch (scenarioId) {
      case 'PROC01':
      case 'PROC02':
      case 'PROC03':
      case 'PROC04':
      case 'PROC05':
      case 'PROC06':
        setActiveTab('requisitions');
        break;
      case 'PROC07':
      case 'PROC08':
      case 'PROC11':
      case 'PROC12':
      case 'PROC18':
        setActiveTab('intake_sourcing');
        break;
      case 'PROC09':
      case 'PROC10':
        setActiveTab('suppliers');
        break;
      case 'PROC13':
      case 'PROC14':
      case 'PROC15':
      case 'PROC16':
      case 'PROC17':
        setActiveTab('quotations_eval');
        break;
      case 'PROC19':
      case 'PROC20':
      case 'PROC21':
      case 'PROC22':
      case 'PROC23':
      case 'PROC24':
      case 'PROC25':
        setActiveTab('purchase_orders');
        break;
      case 'PROC26':
        setActiveTab('claims_exceptions');
        break;
      case 'PROC27':
        setCurrentBranch('suburban_clinic_branch');
        setActiveTab('overview_planning');
        break;
      case 'PROC28':
      case 'PROC29':
      case 'PROC30':
        setActiveTab('overview_planning');
        break;
      default:
        break;
    }
  };

  // Requisitions Handlers
  const handleCreateRequisition = (newPrData: any) => {
    const fullPr: PurchaseRequisition = {
      ...newPrData,
      id: `PR-${Date.now()}`,
      status: 'submitted_pending_approval',
      createdAt: new Date().toISOString().substring(0, 10),
      estimatedTotalValueSar: newPrData.lines.reduce((acc: number, l: any) => acc + (l.requestedQuantity * l.estimatedUnitPriceSar), 0),
      approvalHistory: [
        {
          id: `APP-STAGE-1-${Date.now()}`,
          stageSequence: 1,
          stageNameAr: 'اعتماد رئيس القسم السريري المباشر',
          stageNameEn: 'Department Head Approval',
          requiredRoleTitle: 'رئيس قسم معتمد',
          decision: 'pending_review'
        }
      ],
      lines: newPrData.lines.map((l: any, idx: number) => ({
        ...l,
        id: `PRL-${Date.now()}-${idx}`,
        lineSequence: idx + 1,
        approvedQuantity: 0,
        allocatedToSourcingQuantity: 0,
        remainingUnsourcedQuantity: l.requestedQuantity,
        sourcingFulfillmentStatus: 'unsourced',
        estimatedTotalSar: l.requestedQuantity * l.estimatedUnitPriceSar
      }))
    };
    setRequisitions(prev => [fullPr, ...prev]);
  };

  const handleApproveRequisition = (prId: string, decision: 'approved' | 'rejected' | 'returned_for_revision', comments?: string) => {
    const updated = requisitions.map(pr => {
      if (pr.id !== prId) return pr;
      return processRequisitionApproval(pr, 'STF-CURRENT-USER', 'د. فيصل الحربي', 'رئيس قسم / معتمد مالي', decision, comments);
    });
    setRequisitions(updated);
  };

  const handleResubmitRequisition = (prId: string, updatedLines: PurchaseRequisitionLine[]) => {
    const updated = requisitions.map(pr => {
      if (pr.id !== prId) return pr;
      return resubmitRequisitionWithAmendments(pr, updatedLines);
    });
    setRequisitions(updated);
  };

  // Sourcing Handlers
  const handleConsolidateSourcing = (
    selectedLines: { sourceRequisitionId: string; sourceRequisitionLineId: string; allocateQuantity: number }[],
    sourcingTitleAr: string,
    sourcingTitleEn: string,
    method: ProcurementMethod,
    category: SupplierCategory,
    submissionDeadline: string,
    isEmergency?: boolean,
    emergencyJustification?: string
  ) => {
    const result = validateAndConsolidateDemand(
      requisitions,
      selectedLines,
      sourcingTitleAr,
      sourcingTitleEn,
      method,
      category,
      submissionDeadline,
      'STF-BUYER-01',
      'أ. خالد الشمري',
      isEmergency,
      emergencyJustification
    );

    if (!result.success || !result.sourcingEvent) {
      alert(`تعذر تجميع المنافسة: ${result.errorMessageAr}`);
      return;
    }

    setRequisitions(result.updatedRequisitions);
    setSourcingEvents(prev => [result.sourcingEvent!, ...prev]);
    setTargetSourcingEventId(result.sourcingEvent.id);
  };

  const handleInviteSupplier = (sourcingEventId: string, supplierId: string) => {
    setSourcingEvents(prev => prev.map(evt => {
      if (evt.id !== sourcingEventId) return evt;
      if (evt.invitedSuppliers.some(i => i.supplierId === supplierId)) return evt;
      return {
        ...evt,
        invitedSuppliers: [
          ...evt.invitedSuppliers,
          {
            supplierId,
            invitedAt: new Date().toISOString().substring(0, 10),
            invitationStatus: 'prepared',
            transmissionMethod: 'procurement_portal'
          }
        ]
      };
    }));
  };

  const handleSimulateSendInvitation = (sourcingEventId: string, supplierId: string) => {
    setSourcingEvents(prev => prev.map(evt => {
      if (evt.id !== sourcingEventId) return evt;
      return {
        ...evt,
        invitedSuppliers: evt.invitedSuppliers.map(inv => {
          if (inv.supplierId !== supplierId) return inv;
          return {
            ...inv,
            invitationStatus: 'simulated_sent',
            simulatedSentTimestamp: new Date().toISOString()
          };
        })
      };
    }));
  };

  // Award & Quotations Handlers
  const handleRecordAward = (
    sourcingEventId: string,
    winningSupplierId: string,
    winningQuotationId: string,
    justificationAr: string
  ) => {
    const result = recordAwardDecision(
      sourcingEvents,
      quotations,
      suppliers,
      sourcingEventId,
      winningSupplierId,
      winningQuotationId,
      justificationAr,
      'STF-MGR-01',
      'أ. ماجد القحطاني'
    );

    if (!result.success) {
      alert(result.errorMessageAr);
      return;
    }

    setSourcingEvents(result.updatedSourcingEvents);
  };

  const handleGeneratePoFromAward = (sourcingEventId: string) => {
    const evt = sourcingEvents.find(s => s.id === sourcingEventId);
    if (!evt || !evt.awardedQuotationId) return;
    const quote = quotations.find(q => q.id === evt.awardedQuotationId);
    if (!quote) return;

    const poResult = generatePurchaseOrderFromAward(
      evt,
      quote,
      'LOC-WH-MAIN-DOCK',
      'مستودع التموين الطبي المركزي - رصيف الاستلام والتفريغ',
      'STF-BUYER-01',
      'أ. خالد الشمري'
    );

    if (poResult.success && poResult.purchaseOrder) {
      setPurchaseOrders(prev => [poResult.purchaseOrder!, ...prev]);
      setActiveTab('purchase_orders');
    }
    setActiveTab('purchase_orders');
  };

  // Purchase Order Operations Handlers
  const handleApprovePo = (poId: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== poId) return po;
      return {
        ...po,
        documentStatus: 'approved',
        approvedAt: new Date().toISOString()
      };
    }));
  };

  const handleSimulateSendPo = (poId: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== poId) return po;
      return simulateTransmitPurchaseOrder(po);
    }));
  };

  const handleRecordSupplierAck = (poId: string, confirmedDeliveryDate?: string, note?: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== poId) return po;
      return recordSupplierOrderAcknowledgment(po, confirmedDeliveryDate, note);
    }));
  };

  const handleAmendPo = (
    poId: string,
    updatedLines: { lineId: string; newQuantity: number; reason: string }[],
    amendmentReason: string
  ) => {
    const targetPo = purchaseOrders.find(p => p.id === poId);
    if (!targetPo) return;

    const result = amendPurchaseOrder(
      targetPo,
      updatedLines,
      amendmentReason,
      'STF-MGR-01',
      'أ. ماجد القحطاني'
    );

    if (!result.success || !result.updatedPo) {
      alert(result.errorMessageAr);
      return;
    }

    setPurchaseOrders(prev => prev.map(po => po.id === poId ? result.updatedPo! : po));
  };

  // Claims Handlers
  const handleUpdateClaimStatus = (claimId: string, nextStatus: ClaimStatus, resolutionNote?: string) => {
    setClaims(prev => prev.map(c => {
      if (c.id !== claimId) return c;
      return advanceSupplierClaimStatus(c, nextStatus, resolutionNote);
    }));
  };

  const handleCreateNewClaim = (claimData: any) => {
    const fullClaim: SupplierClaim = {
      ...claimData,
      id: `CLM-${Date.now()}`
    };
    setClaims(prev => [fullClaim, ...prev]);
  };

  const handleCreateClaimForPo = (poId: string, lineId: string, rejectedQty: number) => {
    setActiveTab('claims_exceptions');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased" dir="rtl">
      
      {/* 1. Persistent Synthetic Banner with Branch & Scenario Switcher */}
      <ProcurementPreviewBanner
        currentBranch={currentBranch}
        onChangeBranch={setCurrentBranch}
        activeRole={activeRole}
        onChangeRole={setActiveRole}
        onSelectScenario={handleSelectScenario}
        selectedScenarioId={selectedScenarioId}
      />

      {/* 2. Top Module Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2">
            
            <div className="flex items-center space-x-1 space-x-reverse min-w-max">
              
              {/* Tab 1: Overview */}
              <button
                onClick={() => setActiveTab('overview_planning')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'overview_planning'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>نظرة عامة وخطة المشتريات</span>
              </button>

              {/* Tab 2: Requisitions */}
              <button
                onClick={() => setActiveTab('requisitions')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'requisitions'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>طلبات الشراء والاعتمادات</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                  {requisitions.length}
                </span>
              </button>

              {/* Tab 3: Intake & Sourcing */}
              <button
                onClick={() => setActiveTab('intake_sourcing')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'intake_sourcing'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>تجميع الاحتياج والمنافسات</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                  {sourcingEvents.length}
                </span>
              </button>

              {/* Tab 4: Quotations & Evaluation */}
              <button
                onClick={() => setActiveTab('quotations_eval')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'quotations_eval'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>العروض والتقييم والترسية</span>
              </button>

              {/* Tab 5: Purchase Orders */}
              <button
                onClick={() => setActiveTab('purchase_orders')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'purchase_orders'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>أوامر الشراء ومتابعة التوريد</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                  {purchaseOrders.length}
                </span>
              </button>

              {/* Tab 6: Suppliers */}
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'suppliers'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>سجل الموردين والتأهيل</span>
              </button>

              {/* Tab 7: Contracts */}
              <button
                onClick={() => setActiveTab('contracts')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'contracts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>العقود والاتفاقيات الإطارية</span>
              </button>

              {/* Tab 8: Claims & Exceptions */}
              <button
                onClick={() => setActiveTab('claims_exceptions')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'claims_exceptions'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>المطالبات ومردودات الموردين</span>
                {claims.filter(c => c.status !== 'commercially_resolved').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                    {claims.filter(c => c.status !== 'commercially_resolved').length}
                  </span>
                )}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Dynamic Content Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview_planning' && (
          <ProcurementOverviewPlanningView
            requisitions={requisitions}
            sourcingEvents={sourcingEvents}
            purchaseOrders={purchaseOrders}
            supplierClaims={claims}
            agreements={agreements}
            currentBranch={currentBranch}
            onNavigateTab={setActiveTab}
            onOpenNewPr={() => setActiveTab('requisitions')}
          />
        )}

        {activeTab === 'requisitions' && (
          <PurchaseRequisitionWorkspace
            requisitions={requisitions}
            catalogItems={mockItemMasterCatalog}
            currentBranch={currentBranch}
            activeRole={activeRole}
            onCreateRequisition={handleCreateRequisition}
            onApproveRequisition={handleApproveRequisition}
            onResubmitRequisition={handleResubmitRequisition}
            onNavigateToSourcing={(lineIds) => {
              setActiveTab('intake_sourcing');
            }}
          />
        )}

        {activeTab === 'intake_sourcing' && (
          <ProcurementIntakeSourcingView
            requisitions={requisitions}
            sourcingEvents={sourcingEvents}
            suppliers={suppliers}
            onConsolidateSourcing={handleConsolidateSourcing}
            onInviteSupplier={handleInviteSupplier}
            onSimulateSendInvitation={handleSimulateSendInvitation}
            onNavigateToEvaluation={(eventId) => {
              setTargetSourcingEventId(eventId);
              setActiveTab('quotations_eval');
            }}
          />
        )}

        {activeTab === 'quotations_eval' && (
          <QuotationsEvaluationWorkspace
            sourcingEvents={sourcingEvents}
            quotations={quotations}
            suppliers={suppliers}
            activeRole={activeRole}
            selectedEventId={targetSourcingEventId}
            onRecordAward={handleRecordAward}
            onGeneratePoFromAward={handleGeneratePoFromAward}
          />
        )}

        {activeTab === 'purchase_orders' && (
          <PurchaseOrderManagementWorkspace
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            currentBranch={currentBranch}
            activeRole={activeRole}
            onApprovePo={handleApprovePo}
            onSimulateSendPo={handleSimulateSendPo}
            onRecordSupplierAck={handleRecordSupplierAck}
            onAmendPo={handleAmendPo}
            onCreateClaimForPo={handleCreateClaimForPo}
          />
        )}

        {activeTab === 'suppliers' && (
          <SupplierMasterWorkspace
            suppliers={suppliers}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsFrameworkWorkspace
            agreements={agreements}
            activeRole={activeRole}
          />
        )}

        {activeTab === 'claims_exceptions' && (
          <SupplierClaimsWorkspace
            claims={claims}
            activeRole={activeRole}
            onUpdateClaimStatus={handleUpdateClaimStatus}
            onCreateNewClaim={handleCreateNewClaim}
          />
        )}
      </main>

    </div>
  );
};
