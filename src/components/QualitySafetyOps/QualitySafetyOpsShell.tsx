import React, { useState } from 'react';
import {
  QualitySafetyOpsState,
  QpsTabKey,
  QpsPersona
} from '../../types/qualitySafetyOps';
import {
  INITIAL_QUALITY_SAFETY_STATE,
  QPS_PERSONAS
} from '../../data/mockQualitySafetyData';
import { IncidentReportingLearningWorkspace } from './workspaces/IncidentReportingLearningWorkspace';
import { RiskRegisterManagementWorkspace } from './workspaces/RiskRegisterManagementWorkspace';
import { CapaQualityImprovementWorkspace } from './workspaces/CapaQualityImprovementWorkspace';
import { IpcSurveillanceOperationsWorkspace } from './workspaces/IpcSurveillanceOperationsWorkspace';
import { SafetyAuditBundleWorkspace } from './workspaces/SafetyAuditBundleWorkspace';
import { QPSTestInspectorModal } from './QPSTestInspectorModal';
import {
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  UserCheck,
  Building,
  CheckCircle2,
  Lock,
  Layers,
  FileText,
  AlertOctagon,
  GitBranch,
  Bug,
  ClipboardList,
  History
} from 'lucide-react';

export const QualitySafetyOpsShell: React.FC = () => {
  const [state, setState] = useState<QualitySafetyOpsState>(INITIAL_QUALITY_SAFETY_STATE);
  const [activeTab, setActiveTab] = useState<QpsTabKey>('incidents');
  const [showTestInspector, setShowTestInspector] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Switch persona
  const handleSelectPersona = (persona: QpsPersona) => {
    setState(prev => ({
      ...prev,
      activePersona: persona
    }));
  };

  // Reset to initial state
  const handleResetData = () => {
    if (window.confirm('هل تريد إعادة تعيين بيانات الجودة وسلامة المرضى ومكافحة العدوى إلى الحالة الافتراضية؟')) {
      setState(INITIAL_QUALITY_SAFETY_STATE);
    }
  };

  // Add activity log
  const handleAddActivityLog = (newLog: any) => {
    setState(prev => ({
      ...prev,
      activityLogs: [newLog, ...prev.activityLogs]
    }));
  };

  return (
    <div className="space-y-4 font-['Cairo',sans-serif]" dir="rtl">
      {/* 1. Persistent Synthetic Banner */}
      <div className="bg-amber-950 border border-amber-800 text-amber-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs shadow-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold">
            Synthetic Quality & Patient Safety Design Preview — No Real Regulatory Reporting, Incident Submission, Outbreak Declaration or Clinical Safety Decision.
          </span>
        </div>
        <span className="text-[11px] text-amber-400/80 font-mono hidden md:inline">
          معاينة تجريبية تشغيلية — لا يتم إرسال بلاغات فعلية أو اتخاذ قرارات سريرية نهائية
        </span>
      </div>

      {/* 2. Top Header & Persona Control */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900">
                إدارة الجودة وسلامة المرضى ومكافحة العدوى (Quality, Safety & IPC)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                CBAHI QM/IPC • SPSC Sentinel Workflow • GDIPC Surveillance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              الأحداث العارضة OVR • مصفوفة المخاطر 5x5 • التحليل الجذري RCA2 و CAPA • ترصد خمج المستشفيات HAI • تدقيق نظافة الأيدي والحزم
            </p>
          </div>
        </div>

        {/* Persona Switcher & Tool Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Persona selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <UserCheck className="w-4 h-4 text-slate-500 mr-1" />
            <span className="text-xs font-semibold text-slate-600">المستخدم النشط:</span>
            <select
              value={state.activePersona.id}
              onChange={e => {
                const found = QPS_PERSONAS.find(p => p.id === e.target.value);
                if (found) handleSelectPersona(found);
              }}
              className="bg-white text-slate-800 text-xs font-bold py-1 px-3 rounded-xl border border-slate-200 shadow-2xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {QPS_PERSONAS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.roleTitleAr})
                </option>
              ))}
            </select>
          </div>

          {/* Test Inspector Launcher */}
          <button
            onClick={() => setShowTestInspector(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="فتح فاحص التحقق والتتبع الشامل QPS01-QPS30 و NEGQPS01-NEGQPS30"
          >
            <ShieldAlert className="w-4 h-4 text-teal-400" />
            <span>فاحص التحقق (Test Inspector)</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          </button>

          {/* Activity Provenance Logs */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="سجل النشاط الاصطناعي والتتبع التاريخي"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetData}
            className="p-2 text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            title="إعادة تعيين البيانات للحالة الافتراضية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Navigation Tabs Across the 5 Workspaces */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {/* Tab 1: Incidents & Learning */}
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الأحداث العارضة وسلامة المرضى (Incidents & OVR)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/30 text-white font-mono">
              {state.incidents.length}
            </span>
          </button>

          {/* Tab 2: Risk Register 5x5 */}
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'risks'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>سجل ومصفوفة المخاطر 5x5 (Risk Register)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/30 text-white font-mono">
              {state.risks.length}
            </span>
          </button>

          {/* Tab 3: CAPA & Quality Improvement */}
          <button
            onClick={() => setActiveTab('capa_qi')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'capa_qi'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>الإجراءات التصحيحية والجودة (CAPA & CBAHI KPIs)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/30 text-white font-mono">
              {state.capas.length}
            </span>
          </button>

          {/* Tab 4: IPC Surveillance */}
          <button
            onClick={() => setActiveTab('ipc_surveillance')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'ipc_surveillance'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span>مكافحة العدوى والترصد (IPC & HAI Surveillance)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/30 text-white font-mono">
              {state.haiCases.length}
            </span>
          </button>

          {/* Tab 5: Audits & Bundles */}
          <button
            onClick={() => setActiveTab('audits_bundles')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'audits_bundles'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>التدقيق السريري وحزم الرعاية (Audits & Bundles)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/30 text-white font-mono">
              {state.bundleAudits.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Active Workspace Rendering */}
      <div>
        {activeTab === 'incidents' && (
          <IncidentReportingLearningWorkspace
            incidents={state.incidents}
            setIncidents={newIncs => setState(prev => ({ ...prev, incidents: typeof newIncs === 'function' ? newIncs(prev.incidents) : newIncs }))}
            activePersona={state.activePersona}
            onAddActivityLog={handleAddActivityLog}
          />
        )}

        {activeTab === 'risks' && (
          <RiskRegisterManagementWorkspace
            risks={state.risks}
            setRisks={newRisks => setState(prev => ({ ...prev, risks: typeof newRisks === 'function' ? newRisks(prev.risks) : newRisks }))}
            activePersona={state.activePersona}
            onAddActivityLog={handleAddActivityLog}
            activeProfile={state.activeRiskMatrixProfile}
            availableProfiles={state.availableRiskMatrixProfiles}
            onSelectProfile={prof => setState(prev => ({ ...prev, activeRiskMatrixProfile: prof }))}
          />
        )}

        {activeTab === 'capa_qi' && (
          <CapaQualityImprovementWorkspace
            capas={state.capas}
            setCapas={newCapas => setState(prev => ({ ...prev, capas: typeof newCapas === 'function' ? newCapas(prev.capas) : newCapas }))}
            kpis={state.kpis}
            pdcaProjects={state.pdcaProjects}
            activePersona={state.activePersona}
            onAddActivityLog={handleAddActivityLog}
          />
        )}

        {activeTab === 'ipc_surveillance' && (
          <IpcSurveillanceOperationsWorkspace
            haiCases={state.haiCases}
            setHaiCases={newHais => setState(prev => ({ ...prev, haiCases: typeof newHais === 'function' ? newHais(prev.haiCases) : newHais }))}
            clusters={state.clusters}
            deviceDenominators={state.deviceDenominators}
            activePersona={state.activePersona}
            onAddActivityLog={handleAddActivityLog}
          />
        )}

        {activeTab === 'audits_bundles' && (
          <SafetyAuditBundleWorkspace
            handHygieneAudits={state.handHygieneAudits}
            setHandHygieneAudits={newHh => setState(prev => ({ ...prev, handHygieneAudits: typeof newHh === 'function' ? newHh(prev.handHygieneAudits) : newHh }))}
            bundleAudits={state.bundleAudits}
            setBundleAudits={newBndl => setState(prev => ({ ...prev, bundleAudits: typeof newBndl === 'function' ? newBndl(prev.bundleAudits) : newBndl }))}
            tracers={state.tracers}
            activePersona={state.activePersona}
            onAddActivityLog={handleAddActivityLog}
          />
        )}
      </div>

      {/* 5. Activity History Provenance Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-5 shadow-2xl text-right max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <History className="w-4 h-4 text-teal-600" />
                <span>سجل النشاط الاصطناعي والتتبع التشغيلي (Synthetic Activity History)</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
              {state.activityLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">لا توجد سجلات نشاط حتى الآن</div>
              ) : (
                state.activityLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">{log.details}</div>
                    <div className="text-[10px] text-teal-700 font-medium">
                      المسؤول: {log.actorName} ({log.actorRole}) • المرجع: {log.referenceId}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Test Inspector Modal */}
      <QPSTestInspectorModal
        isOpen={showTestInspector}
        onClose={() => setShowTestInspector(false)}
      />
    </div>
  );
};
