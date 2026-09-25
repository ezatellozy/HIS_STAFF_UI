import React, { useState } from 'react';
import {
  DollarSign,
  FileCheck2,
  Receipt,
  Scale,
  ShieldAlert,
  Landmark,
  Layers,
  RotateCcw,
  Building2,
  User,
  Users,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  History,
  X
} from 'lucide-react';
import {
  RevenueCycleState,
  RevenueCycleWorkspaceId,
  RevenueCyclePersona
} from '../../types/revenueCycle';
import { INITIAL_REVENUE_CYCLE_STATE } from '../../data/mockRevenueCycleData';

// Workspaces
import { RevenueOverviewWorkspace } from './workspaces/RevenueOverviewWorkspace';
import { ChargeCaptureReviewWorkspace } from './workspaces/ChargeCaptureReviewWorkspace';
import { PricingCoverageWorkbench } from './workspaces/PricingCoverageWorkbench';
import { InvoicesAccountsWorkspace } from './workspaces/InvoicesAccountsWorkspace';
import { ClaimsWorkbench } from './workspaces/ClaimsWorkbench';
import { DenialsAppealsWorkspace } from './workspaces/DenialsAppealsWorkspace';
import { RemittanceAllocationWorkspace } from './workspaces/RemittanceAllocationWorkspace';
import { CreditRefundsReconciliationWorkspace } from './workspaces/CreditRefundsReconciliationWorkspace';
import { ArAgingReportingWorkspace } from './workspaces/ArAgingReportingWorkspace';

// Verification Modal
import { RevenueCycleTestInspectorModal } from './RevenueCycleTestInspectorModal';

export const RevenueCycleOpsShell: React.FC = () => {
  const [state, setState] = useState<RevenueCycleState>(INITIAL_REVENUE_CYCLE_STATE);
  const [activeWorkspace, setActiveWorkspace] = useState<RevenueCycleWorkspaceId>('overview');
  const [showTestInspector, setShowTestInspector] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);

  // Helper to append audit log
  const handleAddAuditLog = (action: string, entityId: string, description: string) => {
    const newLog = {
      id: `LOG-RC-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionType: action,
      entityId,
      actor:
        state.activePersona === 'billing_officer'
          ? 'سارة عبد الله (أخصائية الفوترة)'
          : state.activePersona === 'claims_specialist'
          ? 'مها الصالح (أخصائية مطالبات نفيس)'
          : state.activePersona === 'denial_specialist'
          ? 'خالد المنصور (أخصائي الرفوض)'
          : state.activePersona === 'ar_officer'
          ? 'أحمد نبيل (مسؤول الذمم)'
          : state.activePersona === 'finance_controller'
          ? 'د. سليمان الراشد (المدير المالي)'
          : 'مروة عبد الرحمن (مشرفة دورة الإيرادات)',
      descriptionAr: description
    };

    setState(prev => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs]
    }));
  };

  const personas = [
    { id: 'billing_officer', titleAr: 'أخصائي الفوترة', descAr: 'مراجعة الرسوم وإصدار الفواتير' },
    { id: 'cashier_viewer', titleAr: 'مراجع الكاشير', descAr: 'مطابقة إيصالات السداد النقدي' },
    { id: 'insurance_coordinator', titleAr: 'منسق التأمين', descAr: 'الأهلية والموافقات المسبقة' },
    { id: 'claims_specialist', titleAr: 'أخصائي المطالبات', descAr: 'إرسال ومتابعة منصة نفيس' },
    { id: 'denial_specialist', titleAr: 'أخصائي الرفوض', descAr: 'معالجة الاعتراضات والاستئناف' },
    { id: 'ar_officer', titleAr: 'مسؤول الذمم', descAr: 'التحصيل وتخصيص الدفعات' },
    { id: 'revenue_cycle_supervisor', titleAr: 'مشرف الإيرادات', descAr: 'الرقابة وإدارة سير العمل' },
    { id: 'finance_controller', titleAr: 'المدير المالي', descAr: 'المطابقة واعتماد الشطب' }
  ];

  const workspaces = [
    { id: 'overview', titleAr: 'نظرة عامة', icon: Layers },
    { id: 'charge_capture_review', titleAr: 'حصر الرسوم ومراجعتها', icon: FileCheck2 },
    { id: 'pricing_coverage_workbench', titleAr: 'التسعير والتغطية', icon: Scale },
    { id: 'invoices_accounts', titleAr: 'فواتير المرضى والحسابات', icon: Receipt },
    { id: 'claims_payer', titleAr: 'مطالبات التأمين ونفيس', icon: ShieldCheck },
    { id: 'denials_appeals', titleAr: 'الرفوض والاعتراضات', icon: ShieldAlert },
    { id: 'remittance_allocation', titleAr: 'التحويلات وتخصيص الدفعات', icon: Landmark },
    { id: 'credit_refunds_reconciliation', titleAr: 'الأرصدة الدائنة والاسترداد', icon: RotateCcw },
    { id: 'ar_aging_reporting', titleAr: 'أعمار الذمم والمطابقة', icon: DollarSign }
  ];

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-16">
      {/* 1. PERSISTENT REGULATORY PREVIEW DISCLAIMER BANNER (MANDATORY) */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl border border-amber-600 shadow-sm flex items-center justify-between gap-3 text-xs font-bold">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
          <span>
            معاينة تجريبية لدورة إيرادات المرضى والذمم المدينة — لا تمثل فواتير ضريبية أو مطالبات أو مدفوعات حقيقية
            (Synthetic Revenue Cycle Design Preview — No Real Invoices, Claims or Payments)
          </span>
        </div>
        <span className="text-[10px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider shrink-0">
          PROTOTYPE ENVIRONMENT
        </span>
      </div>

      {/* 2. Top Control Panel: Persona Switcher, Branch, Patient Filter & Test Inspector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Module Title */}
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-mono">
                RC
              </div>
              <span>إدارة دورة الإيرادات والذمم المدينة للمرضى (Patient AR & Revenue Cycle Ops)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              نموذج تشغيلي وتجريبي تفاعلي لحوكمة الرسوم السريرية، الفواتير، دورة مطالبات نفيس، وتسوية الذمم المدينة
            </p>
          </div>

          {/* Quick Control Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Branch Switcher */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-bold">الفرع:</span>
              <select
                value={state.currentBranch}
                onChange={e => setState(prev => ({ ...prev, currentBranch: e.target.value as any }))}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="main_hospital">المستشفى الرئيسي (Main Hospital)</option>
                <option value="suburban_clinic_branch">فرع العيادات التخصصية (Suburban Clinic)</option>
              </select>
            </div>

            {/* Patient Context Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-bold">سياق المريض:</span>
              <select
                value={state.selectedPatientContextId || 'all'}
                onChange={e =>
                  setState(prev => ({
                    ...prev,
                    selectedPatientContextId: e.target.value === 'all' ? undefined : e.target.value
                  }))
                }
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">كافة المرضى (All Patients)</option>
                <option value="pat-1001">محمود سعد الدين (MRN-0814) — بوبا VIP</option>
                <option value="pat-1002">نوران الشافعي (MRN-0820) — التعاونية A</option>
                <option value="pat-1003">عبد الرحمن الجابري (MRN-0835) — تنويم داخلي</option>
                <option value="pat-1005">سميحة فتحي (MRN-0850) — سداد نقدي كاش</option>
              </select>
            </div>

            {/* Audit Log Drawer Trigger */}
            <button
              onClick={() => setShowAuditDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              title="سجل التدقيق المالي المحاسبي"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>التدقيق ({state.auditLogs.length})</span>
            </button>

            {/* Test Inspector Trigger Button */}
            <button
              onClick={() => setShowTestInspector(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>فاحص التحقق المستقل (55/55 ممرر)</span>
            </button>
          </div>
        </div>

        {/* Persona Switcher Strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>تبديل المنظور الوظيفي والصلاحيات (Operational Role Persona):</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              الدور الحالي: <strong className="text-teal-700 font-bold">{personas.find(p => p.id === state.activePersona)?.titleAr}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => setState(prev => ({ ...prev, activePersona: p.id as RevenueCyclePersona }))}
                className={`p-2 rounded-xl text-right transition-all cursor-pointer border ${
                  state.activePersona === p.id
                    ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs leading-tight">{p.titleAr}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.descAr}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Primary Workspaces Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs">
        {workspaces.map(ws => {
          const Icon = ws.icon;
          const isActive = activeWorkspace === ws.id;
          return (
            <button
              key={ws.id}
              onClick={() => setActiveWorkspace(ws.id as RevenueCycleWorkspaceId)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{ws.titleAr}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Workspace Content */}
      <div className="transition-all">
        {activeWorkspace === 'overview' && (
          <RevenueOverviewWorkspace
            state={state}
            onNavigateWorkspace={ws => setActiveWorkspace(ws)}
            onFilterPatient={pId => setState(prev => ({ ...prev, selectedPatientContextId: pId }))}
          />
        )}

        {activeWorkspace === 'charge_capture_review' && (
          <ChargeCaptureReviewWorkspace
            state={state}
            onUpdateCharges={updated => setState(prev => ({ ...prev, charges: updated }))}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'pricing_coverage_workbench' && (
          <PricingCoverageWorkbench state={state} />
        )}

        {activeWorkspace === 'invoices_accounts' && (
          <InvoicesAccountsWorkspace
            state={state}
            onUpdateInvoices={updatedInvoices => setState(prev => ({ ...prev, invoices: updatedInvoices }))}
            onUpdateCharges={updatedCharges => setState(prev => ({ ...prev, charges: updatedCharges }))}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'claims_payer' && (
          <ClaimsWorkbench
            state={state}
            onUpdateClaims={updatedClaims => setState(prev => ({ ...prev, claims: updatedClaims }))}
            onAddDenials={newDenials => setState(prev => ({ ...prev, denials: [...newDenials, ...prev.denials] }))}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'denials_appeals' && (
          <DenialsAppealsWorkspace
            state={state}
            onUpdateDenials={updatedDenials => setState(prev => ({ ...prev, denials: updatedDenials }))}
            onAddWriteOff={newWriteOff =>
              setState(prev => ({ ...prev, writeOffAdjustments: [newWriteOff, ...prev.writeOffAdjustments] }))
            }
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'remittance_allocation' && (
          <RemittanceAllocationWorkspace
            state={state}
            onUpdateRemittances={updatedRemittances =>
              setState(prev => ({ ...prev, remittances: updatedRemittances }))
            }
            onUpdateInvoices={updatedInvoices => setState(prev => ({ ...prev, invoices: updatedInvoices }))}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'credit_refunds_reconciliation' && (
          <CreditRefundsReconciliationWorkspace
            state={state}
            onUpdateCreditBalances={updatedCredits =>
              setState(prev => ({ ...prev, creditBalances: updatedCredits }))
            }
            onUpdateInvoices={updatedInvoices => setState(prev => ({ ...prev, invoices: updatedInvoices }))}
            onAddReceiptAllocation={alloc =>
              setState(prev => ({ ...prev, receiptAllocations: [alloc, ...prev.receiptAllocations] }))
            }
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'ar_aging_reporting' && (
          <ArAgingReportingWorkspace state={state} />
        )}
      </div>

      {/* 5. Independent Verification Inspector Modal */}
      <RevenueCycleTestInspectorModal
        isOpen={showTestInspector}
        onClose={() => setShowTestInspector(false)}
      />

      {/* 6. Financial Audit Trail Drawer */}
      {showAuditDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">سجل التدقيق التجريبي (Synthetic Audit Log Preview)</h3>
                </div>
                <button
                  onClick={() => setShowAuditDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[75vh] divide-y divide-slate-100">
                {state.auditLogs.map(log => (
                  <div key={log.id} className="pt-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-mono">{log.timestamp}</span>
                      <span className="font-semibold text-teal-700">{log.actionType}</span>
                    </div>
                    <div className="font-bold text-slate-800 mt-1">{log.descriptionAr}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                      <span>المسؤول: {log.actor}</span>
                      <span className="font-mono text-[10px] text-slate-400">{log.entityId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAuditDrawer(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                إغلاق سجل التدقيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
