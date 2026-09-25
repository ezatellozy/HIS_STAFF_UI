import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Clock,
  Wrench,
  Zap,
  Building,
  ShieldAlert,
  Archive,
  Sparkles,
  ShieldCheck,
  History,
  User,
  X,
  Layers,
  HeartPulse
} from 'lucide-react';
import {
  BiomedicalOpsState,
  BiomedicalWorkspaceId,
  BiomedicalPersona,
  MedicalEquipmentAsset,
  BiomedicalWorkOrder,
  VendorServiceContract,
  SafetyAlertFsca
} from '../../types/biomedicalOps';
import { INITIAL_BIOMEDICAL_OPS_STATE } from '../../data/mockBiomedicalOpsData';

// Workspaces
import { BiomedicalOverviewWorkspace } from './workspaces/BiomedicalOverviewWorkspace';
import { EquipmentRegistryWorkspace } from './workspaces/EquipmentRegistryWorkspace';
import { PpmCalibrationWorkspace } from './workspaces/PpmCalibrationWorkspace';
import { WorkOrdersWorkspace } from './workspaces/WorkOrdersWorkspace';
import { SafetyTestingReleaseWorkspace } from './workspaces/SafetyTestingReleaseWorkspace';
import { VendorContractsWorkspace } from './workspaces/VendorContractsWorkspace';
import { RecallsFscaWorkspace } from './workspaces/RecallsFscaWorkspace';
import { DecommissioningWorkspace } from './workspaces/DecommissioningWorkspace';

// Verification Modal
import { BiomedicalTestInspectorModal } from './BiomedicalTestInspectorModal';

export const BiomedicalOpsShell: React.FC = () => {
  const [state, setState] = useState<BiomedicalOpsState>(INITIAL_BIOMEDICAL_OPS_STATE);
  const [activeWorkspace, setActiveWorkspace] = useState<BiomedicalWorkspaceId>('overview');
  const [showTestInspector, setShowTestInspector] = useState<boolean>(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState<boolean>(false);

  // Audit Log Appender
  const handleAddAuditLog = (action: string, entityId: string, description: string) => {
    const actorName =
      state.activePersona === 'biomed_manager'
        ? 'م. خالد السعدون (مدير إدارة الهندسة السريرية)'
        : state.activePersona === 'field_biomed_engineer'
        ? 'م. طارق الغامدي (مهندس أجهزة طبية)'
        : state.activePersona === 'safety_regulatory_officer'
        ? 'د. ليلى فهد (ضابط سلامة الأجهزة ومطابقة SFDA)'
        : state.activePersona === 'department_custodian'
        ? 'م. فهد الزهراني (مشرف تمريض القسم)'
        : 'المهندس الممثل للوكيل المصنّع';

    const newLog = {
      id: `LOG-BIO-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actionType: action,
      assetId: entityId.startsWith('asset') ? entityId : undefined,
      workOrderId: entityId.startsWith('wo') ? entityId : undefined,
      actor: actorName,
      role: state.activePersona,
      descriptionAr: description
    };

    setState(prev => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs]
    }));
  };

  // State Mutators
  const handleUpdateAsset = (asset: MedicalEquipmentAsset) => {
    setState(prev => ({
      ...prev,
      assets: prev.assets.map(a => (a.id === asset.id ? asset : a))
    }));
  };

  const handleUpdateWorkOrder = (wo: BiomedicalWorkOrder) => {
    setState(prev => ({
      ...prev,
      workOrders: prev.workOrders.map(w => (w.id === wo.id ? wo : w))
    }));
  };

  const handleAddWorkOrder = (wo: BiomedicalWorkOrder) => {
    setState(prev => ({
      ...prev,
      workOrders: [wo, ...prev.workOrders]
    }));
  };

  const handleAddContract = (contract: VendorServiceContract) => {
    setState(prev => ({
      ...prev,
      vendorContracts: [contract, ...prev.vendorContracts]
    }));
  };

  const handleUpdateAlert = (alert: SafetyAlertFsca) => {
    setState(prev => ({
      ...prev,
      safetyAlerts: prev.safetyAlerts.map(s => (s.id === alert.id ? alert : s))
    }));
  };

  const handleAddAlert = (alert: SafetyAlertFsca) => {
    setState(prev => ({
      ...prev,
      safetyAlerts: [alert, ...prev.safetyAlerts]
    }));
  };

  const personaConfig: { id: BiomedicalPersona; label: string; sub: string }[] = [
    { id: 'biomed_manager', label: 'مدير الهندسة السريرية والطبية', sub: 'سلطة الاعتماد والتحرير السريري' },
    { id: 'field_biomed_engineer', label: 'مهندس صيانة أجهزة طبية', sub: 'تنفيذ الصيانة وفحص IEC 62353' },
    { id: 'safety_regulatory_officer', label: 'ضابط سلامة الأجهزة (SFDA)', sub: 'متابعة بلاغات واستدعاءات NCMDR' },
    { id: 'department_custodian', label: 'مشرف عهدة القسم السريري', sub: 'طلب الصيانة واستلام العهدة' },
    { id: 'vendor_specialist', label: 'مهندس الوكيل المعتمد (OEM)', sub: 'خدمات الضمان وعقود الصيانة' }
  ];

  const workspacesList: { id: BiomedicalWorkspaceId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'غرفة القيادة والسيطرة', icon: <Sparkles className="w-4 h-4" /> },
    {
      id: 'equipment_registry',
      label: '1. سجل الأجهزة والتدشين',
      icon: <Cpu className="w-4 h-4 text-teal-400" />,
      badge: state.assets.filter(a => a.currentStatus === 'pending_commissioning').length
    },
    {
      id: 'ppm_calibration',
      label: '2. الصيانة الدورية والمعايرة',
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      badge: state.assets.filter(a => a.ppmSchedule.status === 'overdue').length
    },
    {
      id: 'work_orders',
      label: '3. أوامر الصيانة والأعطال',
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      badge: state.workOrders.filter(w => w.status !== 'completed_verified' && w.status !== 'cancelled').length
    },
    {
      id: 'safety_testing',
      label: '4. فحص الأمان والإفراج',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      badge: state.workOrders.filter(w => w.status === 'testing_pending').length
    },
    { id: 'vendor_contracts', label: '5. عقود الصيانة والوكلاء', icon: <Building className="w-4 h-4 text-indigo-400" /> },
    {
      id: 'recalls_fsca',
      label: '6. استدعاءات الهيئة (SFDA)',
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      badge: state.safetyAlerts.filter(s => s.status !== 'verified_closed').length
    },
    { id: 'decommissioning', label: '7. التكهين والإخراج الآمن', icon: <Archive className="w-4 h-4 text-slate-400" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-right" dir="rtl">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Identity & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black shadow-inner">
              <HeartPulse className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">
                  الهندسة السريرية وإدارة الأجهزة الطبية (Biomedical & Medical Equipment Ops)
                </h1>
                <span className="bg-red-950/80 border border-red-700/60 text-red-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  محاكاة اصطناعية صارمة • بدون تحكم فيزيائي بالأجهزة
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                منظومة دورة حياة الأصول الطبية — سير العمل مستنير بمفاهيم فحص IEC 62353 وإرشادات SFDA • تعليمات المصنّع والمتطلبات النظامية هي المرجع المعتمد
              </p>
            </div>
          </div>

          {/* Persona Switcher & Inspection Buttons */}
          <div className="flex items-center gap-2">
            {/* Persona Select */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <div className="text-[11px]">
                <span className="text-slate-400 block text-[9px]">الدور التشغيلي الاصطناعي:</span>
                <select
                  value={state.activePersona}
                  onChange={e =>
                    setState(prev => ({ ...prev, activePersona: e.target.value as BiomedicalPersona }))
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

            {/* Audit Log Drawer Toggle */}
            <button
              onClick={() => setShowAuditDrawer(!showAuditDrawer)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="سجل العمليات والتدقيق الفني"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">سجل العمليات</span>
              <span className="bg-slate-950 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {state.auditLogs.length}
              </span>
            </button>

            {/* Verification Test Inspector Modal Trigger */}
            <button
              id="biomed-test-inspector-button"
              onClick={() => setShowTestInspector(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>فحص معايير الأمان (50 فحصاً: BM01–BM30)</span>
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
                        isActive
                          ? 'bg-teal-800 text-white'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
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

      {/* Mandatory Persistent Banner Across All Workspaces */}
      <div className="bg-amber-950 border-b border-amber-800/70 text-amber-200 px-4 py-2 text-xs text-center font-bold">
        <span>⚠️ محاكاة اصطناعية لعمليات الهندسة الطبية — Synthetic Biomedical Operations Design Preview — No Real Device Control, Maintenance Release, Calibration or Regulatory Submission.</span>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeWorkspace === 'overview' && (
          <BiomedicalOverviewWorkspace
            state={state}
            onNavigateWorkspace={ws => setActiveWorkspace(ws)}
          />
        )}

        {activeWorkspace === 'equipment_registry' && (
          <EquipmentRegistryWorkspace
            state={state}
            onUpdateAsset={handleUpdateAsset}
            onAddAuditLog={handleAddAuditLog}
            onOpenWorkOrderForAsset={asset => {
              setActiveWorkspace('work_orders');
            }}
          />
        )}

        {activeWorkspace === 'ppm_calibration' && (
          <PpmCalibrationWorkspace
            state={state}
            onUpdateAsset={handleUpdateAsset}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'work_orders' && (
          <WorkOrdersWorkspace
            state={state}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onAddWorkOrder={handleAddWorkOrder}
            onUpdateAsset={handleUpdateAsset}
            onAddAuditLog={handleAddAuditLog}
            onNavigateToTesting={woId => {
              setActiveWorkspace('safety_testing');
            }}
          />
        )}

        {activeWorkspace === 'safety_testing' && (
          <SafetyTestingReleaseWorkspace
            state={state}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onUpdateAsset={handleUpdateAsset}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'vendor_contracts' && (
          <VendorContractsWorkspace
            state={state}
            onAddContract={handleAddContract}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'recalls_fsca' && (
          <RecallsFscaWorkspace
            state={state}
            onUpdateAsset={handleUpdateAsset}
            onUpdateAlert={handleUpdateAlert}
            onAddAlert={handleAddAlert}
            onAddAuditLog={handleAddAuditLog}
          />
        )}

        {activeWorkspace === 'decommissioning' && (
          <DecommissioningWorkspace
            state={state}
            onUpdateAsset={handleUpdateAsset}
            onAddAuditLog={handleAddAuditLog}
          />
        )}
      </main>

      {/* Audit Log Drawer */}
      {showAuditDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-start">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden text-right border-l border-slate-200" dir="rtl">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">سجل التدقيق والعمليات الفنية</h3>
              </div>
              <button
                onClick={() => setShowAuditDrawer(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 text-xs">
              {state.auditLogs.map(log => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{log.timestamp}</span>
                    <span className="text-teal-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.actionType}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800">{log.actor}</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.descriptionAr}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verification Inspector Modal */}
      <BiomedicalTestInspectorModal
        state={state}
        isOpen={showTestInspector}
        onClose={() => setShowTestInspector(false)}
      />
    </div>
  );
};
