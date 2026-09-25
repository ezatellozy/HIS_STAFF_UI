import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Scale, 
  ShieldAlert, 
  FileCheck, 
  CreditCard, 
  ArrowRightLeft, 
  Clock, 
  Sparkles,
  Info,
  BookOpen
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { FinanceApPreviewBanner } from './FinanceApPreviewBanner';
import { ApOverviewDashboard } from './ApOverviewDashboard';
import { SupplierInvoicesWorkspace } from './SupplierInvoicesWorkspace';
import { InvoiceMatchingWorkbench } from './InvoiceMatchingWorkbench';
import { ExceptionsAndHoldsWorkspace } from './ExceptionsAndHoldsWorkspace';
import { InvoiceApprovalsPostingWorkspace } from './InvoiceApprovalsPostingWorkspace';
import { PaymentProposalsBatchesWorkspace } from './PaymentProposalsBatchesWorkspace';
import { CreditsAdvancesReconciliationWorkspace } from './CreditsAdvancesReconciliationWorkspace';
import { ApAgingReportsWorkspace } from './ApAgingReportsWorkspace';
import { SupplierFinancialDirectoryWorkspace } from './SupplierFinancialDirectoryWorkspace';
import { InvoiceDetailAuditModal } from './InvoiceDetailAuditModal';

import { 
  SupplierInvoice, 
  PaymentProposalBatch, 
  SupplierCreditNote, 
  PrepaymentRecord, 
  SupplierFinancialOverlay, 
  SupplierStatementReconciliationRecord,
  ApBranchId
} from '../../types/accountsPayable';

import {
  INITIAL_SUPPLIER_INVOICES,
  INITIAL_PAYMENT_BATCHES,
  INITIAL_SUPPLIER_CREDIT_NOTES,
  INITIAL_PREPAYMENTS,
  INITIAL_SUPPLIER_FINANCIAL_OVERLAYS,
  INITIAL_SUPPLIER_STATEMENTS
} from '../../data/mockAccountsPayableData';

export const FinanceApOpsShell: React.FC = () => {
  const { setActiveWorkArea } = useHis();
  // Global Shell State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentBranch, setCurrentBranch] = useState<ApBranchId>('main_hospital');
  const [activePersona, setActivePersona] = useState<string>('ap_clerk');
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-09-21');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

  // Primary Data State (Initialized with comprehensive synthetic fixtures)
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(INITIAL_SUPPLIER_INVOICES);
  const [batches, setBatches] = useState<PaymentProposalBatch[]>(INITIAL_PAYMENT_BATCHES);
  const [creditNotes, setCreditNotes] = useState<SupplierCreditNote[]>(INITIAL_SUPPLIER_CREDIT_NOTES);
  const [prepayments, setPrepayments] = useState<PrepaymentRecord[]>(INITIAL_PREPAYMENTS);
  const [overlays, setOverlays] = useState<SupplierFinancialOverlay[]>(INITIAL_SUPPLIER_FINANCIAL_OVERLAYS);
  const [statements, setStatements] = useState<SupplierStatementReconciliationRecord[]>(INITIAL_SUPPLIER_STATEMENTS);

  // Detail Modal & Interactive Target State
  const [inspectedInvoiceId, setInspectedInvoiceId] = useState<string | null>(null);
  const [selectedMatchingInvoiceId, setSelectedMatchingInvoiceId] = useState<string | undefined>(undefined);

  // Branch-Filtered Invoices & Records
  const branchFilteredInvoices = invoices.filter(inv => {
    if (currentBranch === 'all') return true;
    return inv.branchId === currentBranch;
  });

  // Navigation and Modal Helpers
  const handleOpenInvoiceDetail = (invoiceId: string) => {
    setInspectedInvoiceId(invoiceId);
  };

  const handleOpenMatchingWorkbench = (invoiceId: string) => {
    setSelectedMatchingInvoiceId(invoiceId);
    setActiveTab('matching');
    setInspectedInvoiceId(null);
  };

  // State Updates from Workspaces
  const handleAddNewInvoice = (newInv: SupplierInvoice) => {
    setInvoices([newInv, ...invoices]);
    setInspectedInvoiceId(newInv.id);
  };

  const handleUpdateInvoice = (updated: SupplierInvoice) => {
    setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
  };

  const handleAddNewBatch = (newBatch: PaymentProposalBatch) => {
    setBatches([newBatch, ...batches]);
  };

  const handleUpdateBatch = (updatedBatch: PaymentProposalBatch, updatedInvoices: SupplierInvoice[]) => {
    setBatches(batches.map(b => b.id === updatedBatch.id ? updatedBatch : b));
    setInvoices(updatedInvoices);
  };

  const handleUpdateCreditNote = (updatedCredit: SupplierCreditNote, updatedInvoice: SupplierInvoice) => {
    setCreditNotes(creditNotes.map(c => c.id === updatedCredit.id ? updatedCredit : c));
    setInvoices(invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
  };

  const handleUpdatePrepayment = (updatedPrepayment: PrepaymentRecord, updatedInvoice: SupplierInvoice) => {
    setPrepayments(prepayments.map(p => p.id === updatedPrepayment.id ? updatedPrepayment : p));
    setInvoices(invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
  };

  const handleUpdateOverlay = (updatedOverlay: SupplierFinancialOverlay) => {
    setOverlays(overlays.map(o => o.supplierId === updatedOverlay.supplierId ? updatedOverlay : o));
  };

  // Scenario Launcher Handler (Quick focus on AP01 - AP30)
  const handleSelectScenario = (scId: string) => {
    setSelectedScenarioId(scId);
    switch (scId) {
      case 'AP01':
      case 'AP07':
      case 'AP08':
        setActiveTab('invoices');
        setInspectedInvoiceId(invoices.find(i => i.primaryPoNumber)?.id || null);
        break;
      case 'AP02':
      case 'AP13':
        setActiveTab('invoices');
        const nonPo = invoices.find(i => i.documentType === 'non_po_service_invoice');
        if (nonPo) setInspectedInvoiceId(nonPo.id);
        break;
      case 'AP09':
      case 'AP10':
      case 'AP11':
      case 'AP12':
      case 'AP14':
      case 'AP18':
      case 'AP20':
        setActiveTab('matching');
        const targetInv = invoices.find(i => 
          scId === 'AP11' ? i.invoiceNumber === 'INV-2026-905' :
          scId === 'AP12' ? i.invoiceNumber === 'INV-2026-906' :
          scId === 'AP14' ? i.invoiceNumber === 'INV-2026-908' :
          i.primaryPoNumber
        );
        if (targetInv) setSelectedMatchingInvoiceId(targetInv.id);
        break;
      case 'AP03':
      case 'AP04':
      case 'AP05':
      case 'AP06':
        setActiveTab('exceptions');
        break;
      case 'AP15':
      case 'AP16':
      case 'AP17':
        setActiveTab('credits');
        break;
      case 'AP21':
        setActiveTab('approvals');
        break;
      case 'AP22':
      case 'AP23':
      case 'AP24':
      case 'AP26':
      case 'AP27':
        setActiveTab('payments');
        break;
      case 'AP25':
        setActiveTab('directory');
        break;
      default:
        setActiveTab('overview');
        break;
    }
  };

  // Workspace Tabs Definition
  const tabs = [
    { id: 'overview', labelAr: 'لوحة الحسابات الدائنة', icon: LayoutDashboard },
    { id: 'invoices', labelAr: 'فواتير الموردين', icon: FileText, count: branchFilteredInvoices.length },
    { id: 'matching', labelAr: 'منصة المطابقة الثلاثية', icon: Scale },
    { id: 'exceptions', labelAr: 'الحجوزات والفروقات', icon: ShieldAlert, count: branchFilteredInvoices.reduce((a, b) => a + b.activeHolds.filter(h => !h.isResolved).length, 0) },
    { id: 'approvals', labelAr: 'الاعتماد وسندات القيد', icon: FileCheck },
    { id: 'payments', labelAr: 'مقترحات الدفع والخزينة', icon: CreditCard, count: batches.length },
    { id: 'credits', labelAr: 'الإشعارات والدفعات المقدمة', icon: ArrowRightLeft },
    { id: 'aging', labelAr: 'تقرير أعمار الذمم', icon: Clock },
    { id: 'directory', labelAr: 'دليل الحسابات البنكية', icon: Building2 }
  ];

  return (
    <div id="finance-ap-ops-shell" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* SYNTHETIC AP PREVIEW BANNER (ALWAYS VISIBLE AT TOP) */}
      <FinanceApPreviewBanner
        currentBranch={currentBranch}
        onChangeBranch={setCurrentBranch}
        activePersona={activePersona}
        onChangePersona={setActivePersona}
        effectiveDate={effectiveDate}
        onChangeEffectiveDate={setEffectiveDate}
        onSelectScenario={handleSelectScenario}
        selectedScenarioId={selectedScenarioId}
      />

      {/* AP MODULE HEADER & SUB-NAVIGATION */}
      <header className="bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-wide">
                  إدارة الحسابات الدائنة والمالية التشغيلية
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (Accounts Payable & Hospital Finance Ops)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نظام إدارة فواتير الموردين، المطابقة الثلاثية المستندية، الحجوزات الرقابية، ومقترحات سداد الخزينة
              </p>
            </div>

            {/* Quick Status Pill & GL Navigation */}
            <div className="flex items-center gap-2 text-xs">
              <button
                id="btn-goto-general-ledger"
                onClick={() => setActiveWorkArea('general_ledger_ops')}
                className="bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold shadow-xs"
                title="الانتقال المباشر إلى دفتر الأستاذ العام والدليل المحاسبي"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>دفتر الأستاذ العام (GL)</span>
              </button>

              <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2">
                <span className="text-slate-400">إجمالي الالتزامات:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {branchFilteredInvoices.reduce((a, b) => a + (b.remainingPayableBalanceSar || 0), 0).toLocaleString()} ريال
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-slate-800/80">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`ap-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-t-lg text-xs font-medium cursor-pointer transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.labelAr}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>
      </header>

      {/* MAIN WORKSPACE CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {activeTab === 'overview' && (
          <ApOverviewDashboard
            invoices={branchFilteredInvoices}
            batches={batches}
            creditNotes={creditNotes}
            prepayments={prepayments}
            effectiveDate={effectiveDate}
            onNavigateToTab={setActiveTab}
            onOpenInvoiceDetail={handleOpenInvoiceDetail}
          />
        )}

        {activeTab === 'invoices' && (
          <SupplierInvoicesWorkspace
            invoices={branchFilteredInvoices}
            onAddNewInvoice={handleAddNewInvoice}
            onOpenInvoiceDetail={handleOpenInvoiceDetail}
            effectiveDate={effectiveDate}
          />
        )}

        {activeTab === 'matching' && (
          <InvoiceMatchingWorkbench
            invoices={branchFilteredInvoices}
            selectedInvoiceId={selectedMatchingInvoiceId}
            onSelectInvoice={setSelectedMatchingInvoiceId}
          />
        )}

        {activeTab === 'exceptions' && (
          <ExceptionsAndHoldsWorkspace
            invoices={branchFilteredInvoices}
            onUpdateInvoice={handleUpdateInvoice}
            activePersona={activePersona}
          />
        )}

        {activeTab === 'approvals' && (
          <InvoiceApprovalsPostingWorkspace
            invoices={branchFilteredInvoices}
            onUpdateInvoice={handleUpdateInvoice}
            activePersona={activePersona}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentProposalsBatchesWorkspace
            invoices={branchFilteredInvoices}
            batches={batches}
            supplierOverlays={overlays}
            onAddNewBatch={handleAddNewBatch}
            onUpdateBatch={handleUpdateBatch}
            activePersona={activePersona}
          />
        )}

        {activeTab === 'credits' && (
          <CreditsAdvancesReconciliationWorkspace
            creditNotes={creditNotes}
            prepayments={prepayments}
            invoices={branchFilteredInvoices}
            statements={statements}
            onUpdateCreditNote={handleUpdateCreditNote}
            onUpdatePrepayment={handleUpdatePrepayment}
            activePersona={activePersona}
          />
        )}

        {activeTab === 'aging' && (
          <ApAgingReportsWorkspace
            invoices={branchFilteredInvoices}
            effectiveDate={effectiveDate}
            onOpenInvoiceDetail={handleOpenInvoiceDetail}
          />
        )}

        {activeTab === 'directory' && (
          <SupplierFinancialDirectoryWorkspace
            overlays={overlays}
            onUpdateOverlay={handleUpdateOverlay}
            activePersona={activePersona}
          />
        )}

      </main>

      {/* INVOICE DETAIL AUDIT MODAL */}
      <InvoiceDetailAuditModal
        invoice={invoices.find(i => i.id === inspectedInvoiceId) || null}
        onClose={() => setInspectedInvoiceId(null)}
        onOpenMatching={handleOpenMatchingWorkbench}
      />

    </div>
  );
};
