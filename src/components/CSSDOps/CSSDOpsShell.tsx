import React, { useState } from 'react';
import {
  Inbox,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
  PackageCheck,
  Search,
  AlertTriangle,
  History,
  ShieldCheck,
  RotateCcw,
  Building,
  User,
  X,
  Play
} from 'lucide-react';
import {
  CSSDOpsState,
  CSSDWorkspaceId,
  CSSDPersona,
  ContaminatedReturnRecord,
  CSSDReusableSetInstance,
  WasherDisinfectorCycleRecord,
  CSSDPackageRecord,
  SterilizerCycleRecord,
  SterileDistributionRequest,
  CSSDQualityException,
  CSSDRecallCase
} from '../../types/cssdOps';
import { INITIAL_CSSD_OPS_STATE } from '../../data/mockCssdOpsData';

// Workspaces
import { CSSDOverviewWorkspace } from './workspaces/CSSDOverviewWorkspace';
import { DirtyReceiptDeconWorkspace } from './workspaces/DirtyReceiptDeconWorkspace';
import { CleaningInspectionWorkspace } from './workspaces/CleaningInspectionWorkspace';
import { AssemblyPackagingWorkspace } from './workspaces/AssemblyPackagingWorkspace';
import { SterilizationLoadsWorkspace } from './workspaces/SterilizationLoadsWorkspace';
import { LoadReleaseQualityWorkspace } from './workspaces/LoadReleaseQualityWorkspace';
import { SterileStorageDistributionWorkspace } from './workspaces/SterileStorageDistributionWorkspace';
import { SetsTraceabilityWorkspace } from './workspaces/SetsTraceabilityWorkspace';
import { RecallExceptionsWorkspace } from './workspaces/RecallExceptionsWorkspace';

// Verification Inspector Modal
import { CSSDTestInspectorModal } from './CSSDTestInspectorModal';

export const CSSDOpsShell: React.FC = () => {
  const [state, setState] = useState<CSSDOpsState>(INITIAL_CSSD_OPS_STATE);
  const [activeWorkspace, setActiveWorkspace] = useState<CSSDWorkspaceId>('overview');
  const [showTestInspector, setShowTestInspector] = useState<boolean>(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState<boolean>(false);

  // Audit log appender helper
  const handleAddAuditLog = (action: string, entityId: string, description: string) => {
    const actorName =
      state.activePersona === 'receiving_tech'
        ? 'علي القحطاني (فني استلام التلوث)'
        : state.activePersona === 'decon_tech'
        ? 'خالد عبد الرحمن (فني التطهير)'
        : state.activePersona === 'assembly_tech'
        ? 'منيرة السبيعي (أخصائية التجهيز)'
        : state.activePersona === 'sterilization_operator'
        ? 'بندر الشمري (مشغل التعقيم)'
        : state.activePersona === 'release_reviewer'
        ? 'د. طارق المنشاوي (مقيّم الإفراج)'
        : state.activePersona === 'infection_prevention_reviewer'
        ? 'د. ليلى فهد (رئيسة مكافحة العدوى)'
        : 'أحمد نبيل (مشرف التعقيم المركزي)';

    const newLog = {
      id: `LOG-CSSD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      actionType: action,
      entityId,
      actor: actorName,
      descriptionAr: description
    };

    setState(prev => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs]
    }));
  };

  // State Mutators
  const handleUpdateReturnRecord = (record: ContaminatedReturnRecord) => {
    setState(prev => ({
      ...prev,
      contaminatedReturns: prev.contaminatedReturns.map(r => (r.id === record.id ? record : r))
    }));
  };

  const handleUpdateSetInstance = (set: CSSDReusableSetInstance) => {
    setState(prev => ({
      ...prev,
      setInstances: prev.setInstances.map(s => (s.id === set.id ? set : s))
    }));
  };

  const handleAddWasherCycle = (cycle: WasherDisinfectorCycleRecord) => {
    setState(prev => ({
      ...prev,
      washerCycles: [cycle, ...prev.washerCycles]
    }));
  };

  const handleAddPackage = (pkg: CSSDPackageRecord) => {
    setState(prev => ({
      ...prev,
      packages: [pkg, ...prev.packages]
    }));
  };

  const handleUpdatePackage = (pkg: CSSDPackageRecord) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p => (p.id === pkg.id ? pkg : p))
    }));
  };

  const handleAddSterilizerCycle = (cycle: SterilizerCycleRecord) => {
    setState(prev => ({
      ...prev,
      sterilizerCycles: [cycle, ...prev.sterilizerCycles]
    }));
  };

  const handleUpdateSterilizerCycle = (cycle: SterilizerCycleRecord) => {
    setState(prev => ({
      ...prev,
      sterilizerCycles: prev.sterilizerCycles.map(c => (c.id === cycle.id ? cycle : c))
    }));
  };

  const handleUpdateDistributionRequest = (req: SterileDistributionRequest) => {
    setState(prev => ({
      ...prev,
      distributionRequests: prev.distributionRequests.map(r => (r.id === req.id ? req : r))
    }));
  };

  const handleUpdateRecallCase = (recall: CSSDRecallCase) => {
    setState(prev => ({
      ...prev,
      recallCases: prev.recallCases.map(r => (r.id === recall.id ? recall : r))
    }));
  };

  const handleUpdateQualityException = (exc: CSSDQualityException) => {
    setState(prev => ({
      ...prev,
      qualityExceptions: prev.qualityExceptions.map(e => (e.id === exc.id ? exc : e))
    }));
  };

  const personaConfig: { id: CSSDPersona; label: string; sub: string }[] = [
    { id: 'cssd_supervisor', label: 'مشرف التعقيم المركزي', sub: 'صلاحيات إشرافية كاملة' },
    { id: 'receiving_tech', label: 'فني استلام التلوث', sub: 'منطقة الاستلام القذرة' },
    { id: 'decon_tech', label: 'فني التطهير والغسيل', sub: 'أجهزة الغسيل A0' },
    { id: 'assembly_tech', label: 'أخصائي الفحص والتجميع', sub: 'المنطقة النظيفة والتغليف' },
    { id: 'sterilization_operator', label: 'مشغل المعقمات', sub: 'المعقمات والشحنات' },
    { id: 'release_reviewer', label: 'مقيّم الإفراج السريري', sub: 'سلطة الإفراج الثلاثي' },
    { id: 'infection_prevention_reviewer', label: 'مكافحة العدوى (IPC)', sub: 'تدقيق الأمان والاستدعاء' }
  ];

  const workspacesList: { id: CSSDWorkspaceId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'نظرة عامة والرقابة', icon: <Sparkles className="w-4 h-4" /> },
    {
      id: 'dirty_receipt_decon',
      label: '1. الاستلام الملوث والتطهير',
      icon: <Inbox className="w-4 h-4 text-red-500" />,
      badge: state.contaminatedReturns.filter(r => r.receiptStatus !== 'received_complete').length
    },
    { id: 'cleaning_inspection', label: '2. الغسيل والفحص المجهري', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'assembly_packaging', label: '3. تجميع الأطقم والتغليف', icon: <Layers className="w-4 h-4 text-blue-500" /> },
    { id: 'sterilization_loads', label: '4. شحنات المعقمات', icon: <Flame className="w-4 h-4 text-indigo-500" /> },
    {
      id: 'load_release_quality',
      label: '5. الإفراج السريري والرقابة',
      icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
      badge: state.sterilizerCycles.filter(c => c.cycleStatus === 'monitoring_pending').length
    },
    {
      id: 'sterile_storage_distribution',
      label: '6. المستودع المعقم والتوزيع',
      icon: <PackageCheck className="w-4 h-4 text-emerald-500" />
    },
    { id: 'sets_traceability', label: '7. التتبع الشامل (Traceability)', icon: <Search className="w-4 h-4 text-teal-500" /> },
    {
      id: 'recall_exceptions',
      label: '8. الاستدعاء والاستثناءات',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      badge: state.qualityExceptions.filter(e => e.status === 'open_action_required').length
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-right" dir="rtl">
      {/* Top Header Bar: Department Identity, Synthetic Notice, Persona Switcher & Verification Trigger */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Identity & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black shadow-inner">
              <Flame className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">
                  التعقيم المركزي وإعادة معالجة الأجهزة الطبية (CSSD Operations)
                </h1>
                <span className="bg-red-950/80 border border-red-700/60 text-red-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  محاكاة اصطناعية صارمة • بدون أجهزة فيزيائية
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                منظومة موحدة لتعقيم الأجهزة الجراحية القابلة لإعادة الاستخدام وفق معايير SFDA • WHO • ISO 17664
              </p>
            </div>
          </div>

          {/* Persona Switcher & Inspector Buttons */}
          <div className="flex items-center gap-2">
            {/* Persona Select */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <div className="text-[11px]">
                <span className="text-slate-400 block text-[9px]">الدور والمسؤولية:</span>
                <select
                  value={state.activePersona}
                  onChange={e =>
                    setState(prev => ({ ...prev, activePersona: e.target.value as CSSDPersona }))
                  }
                  className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  {personaConfig.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audit Drawer Toggle */}
            <button
              onClick={() => setShowAuditDrawer(!showAuditDrawer)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="سجل التدقيق والرقابة"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">سجل العمليات</span>
              <span className="bg-slate-950 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {state.auditLogs.length}
              </span>
            </button>

            {/* Verification Test Inspector Modal Trigger */}
            <button
              id="cssd-test-inspector-button"
              onClick={() => setShowTestInspector(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>فحص معايير الأمان (14 فحصاً)</span>
            </button>
          </div>
        </div>

        {/* Workspaces Navigation Bar */}
        <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-1">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {workspacesList.map(ws => {
              const isActive = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {ws.icon}
                  <span>{ws.label}</span>
                  {ws.badge !== undefined && ws.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-teal-900 text-teal-100' : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {ws.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 py-5 flex-1 w-full">
        {activeWorkspace === 'overview' && (
          <CSSDOverviewWorkspace
            state={state}
            onNavigateWorkspace={wsId => setActiveWorkspace(wsId)}
          />
        )}

        {activeWorkspace === 'dirty_receipt_decon' && (
          <DirtyReceiptDeconWorkspace
            state={state}
            onUpdateReturnRecord={handleUpdateReturnRecord}
            onUpdateSetInstance={handleUpdateSetInstance}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'cleaning_inspection' && (
          <CleaningInspectionWorkspace
            state={state}
            onUpdateSetInstance={handleUpdateSetInstance}
            onAddWasherCycle={handleAddWasherCycle}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'assembly_packaging' && (
          <AssemblyPackagingWorkspace
            state={state}
            onUpdateSetInstance={handleUpdateSetInstance}
            onAddPackage={handleAddPackage}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'sterilization_loads' && (
          <SterilizationLoadsWorkspace
            state={state}
            onAddSterilizerCycle={handleAddSterilizerCycle}
            onUpdateSterilizerCycle={handleUpdateSterilizerCycle}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'load_release_quality' && (
          <LoadReleaseQualityWorkspace
            state={state}
            onUpdateSterilizerCycle={handleUpdateSterilizerCycle}
            onUpdatePackage={handleUpdatePackage}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'sterile_storage_distribution' && (
          <SterileStorageDistributionWorkspace
            state={state}
            onUpdatePackage={handleUpdatePackage}
            onUpdateDistributionRequest={handleUpdateDistributionRequest}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'sets_traceability' && (
          <SetsTraceabilityWorkspace state={state} />
        )}

        {activeWorkspace === 'recall_exceptions' && (
          <RecallExceptionsWorkspace
            state={state}
            onUpdateRecallCase={handleUpdateRecallCase}
            onUpdateQualityException={handleUpdateQualityException}
            onAddAuditLog={handleAddAuditLog}
          />
        )}
      </main>

      {/* Verification Test Inspector Modal */}
      <CSSDTestInspectorModal
        state={state}
        isOpen={showTestInspector}
        onClose={() => setShowTestInspector(false)}
      />

      {/* Audit Drawer */}
      {showAuditDrawer && (
        <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-2xl z-50 border-r border-slate-200 flex flex-col text-right">
          <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-xs">سجل تدقيق التعقيم الموثق (Audit Trail)</h3>
            </div>
            <button
              onClick={() => setShowAuditDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {state.auditLogs.map(log => (
              <div key={log.id} className="p-3 text-xs hover:bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-bold">
                    {log.actionType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
                <div className="font-bold text-slate-800 text-[11px] mb-1">{log.descriptionAr}</div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>المستخدم: {log.actor}</span>
                  <span className="font-mono text-slate-400">{log.entityId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
