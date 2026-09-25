import React, { useState } from 'react';
import { HimOpsState, HimPersona } from '../../types/himOps';
import { INITIAL_HIM_OPS_STATE, HIM_PERSONAS } from '../../data/mockHimOpsData';
import { RecordCompletionWorkspace } from './workspaces/RecordCompletionWorkspace';
import { DocumentIntegrityWorkspace } from './workspaces/DocumentIntegrityWorkspace';
import { ClinicalCodingWorkspace } from './workspaces/ClinicalCodingWorkspace';
import { ReleaseOfInformationWorkspace } from './workspaces/ReleaseOfInformationWorkspace';
import { RetentionLegalHoldWorkspace } from './workspaces/RetentionLegalHoldWorkspace';
import { HIMTestInspectorModal } from './HIMTestInspectorModal';
import {
  FileText,
  FileCheck,
  Tag,
  Share2,
  Archive,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  UserCheck,
  Building,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

export const HIMOpsShell: React.FC = () => {
  const [state, setState] = useState<HimOpsState>(INITIAL_HIM_OPS_STATE);
  const [activeTab, setActiveTab] = useState<'completion' | 'integrity' | 'coding' | 'roi' | 'retention'>('completion');
  const [showTestInspector, setShowTestInspector] = useState(false);

  // Switch persona
  const handleSelectPersona = (persona: HimPersona) => {
    setState(prev => ({
      ...prev,
      activePersona: persona,
      selectedPatientId: undefined,
      selectedEncounterId: undefined
    }));
  };

  // Reset to initial
  const handleResetData = () => {
    if (window.confirm('هل تريد إعادة تعيين بيانات إدارة السجلات الطبية والترميز إلى الحالة الافتراضية؟')) {
      setState(INITIAL_HIM_OPS_STATE);
    }
  };

  return (
    <div className="space-y-5 font-['Cairo',sans-serif]" dir="rtl">
      {/* 1. Persistent Synthetic Banner */}
      <div className="bg-amber-950 border border-amber-800 text-amber-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs shadow-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold">
            Synthetic HIM Design Preview — No Real Record Release, Coding Submission, Legal Hold or Production Audit.
          </span>
        </div>
        <span className="text-[11px] text-amber-400/80 font-mono hidden md:inline">
          معاينة تجريبية تشغيلية — لا يتم إرسال مطالبات أو إفصاح فعلي خارج النظام
        </span>
      </div>

      {/* 2. Top Header & Persona Control */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">
                إدارة السجلات الطبية والمعلومات الصحية (Health Information Management - HIM)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                CBAHI MR-03 & Saudi PDPL-oriented privacy safeguards
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              استكمال السجلات • نزاهة الوثائق وحوكمة الإصدارات • الترميز السريري (ICD-10-AM / ACHI) • إفراج المعلومات وحماية البيانات
            </p>
          </div>
        </div>

        {/* Persona Switcher & Tool Controls */}
        <div className="flex items-center gap-3">
          {/* Persona selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <UserCheck className="w-4 h-4 text-slate-500 mr-1" />
            <span className="text-xs font-semibold text-slate-600">المستخدم النشط:</span>
            <select
              value={state.activePersona}
              onChange={e => {
                const found = HIM_PERSONAS.find(p => p.id === e.target.value);
                if (found) handleSelectPersona(found.id);
              }}
              className="bg-white text-slate-800 text-xs font-bold py-1 px-3 rounded-xl border border-slate-200 shadow-2xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {HIM_PERSONAS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.roleTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Test Inspector Launcher */}
          <button
            onClick={() => setShowTestInspector(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="فتح فاحص التحقق والتتبع الشامل HIM01-HIM30"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>فاحص التحقق (Test Inspector)</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetData}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="إعادة تعيين البيانات"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Navigation Workspaces Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('completion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'completion'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>استكمال السجلات والنواقص التوثيقية</span>
          {state.deficiencies.filter(d => d.status !== 'resolved').length > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'completion' ? 'bg-teal-800 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {state.deficiencies.filter(d => d.status !== 'resolved').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('integrity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'integrity'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>نزاهة الوثائق وحوكمة الإصدارات</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'integrity' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {state.documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'coding'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>الترميز السريري والمالي (ICD-10-AM / ACHI)</span>
          {state.codingCases.filter(c => c.codingStatus === 'in_progress').length > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'coding' ? 'bg-teal-900 text-white' : 'bg-teal-100 text-teal-800'
            }`}>
              {state.codingCases.filter(c => c.codingStatus === 'in_progress').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('roi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roi'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>إفراج المعلومات وضوابط الخصوصية (ROI & Privacy Safeguards)</span>
          {state.roiRequests.filter(r => r.status === 'submitted').length > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'roi' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {state.roiRequests.filter(r => r.status === 'submitted').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('retention')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'retention'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>مدد الحفظ ومسار الحجز الاصطناعي (Retention & Legal Holds)</span>
          {state.legalHolds.filter(h => h.status === 'active').length > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'retention' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {state.legalHolds.filter(h => h.status === 'active').length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Active Workspace Component */}
      <div className="transition-all duration-200">
        {activeTab === 'completion' && (
          <RecordCompletionWorkspace state={state} onUpdateState={setState} />
        )}
        {activeTab === 'integrity' && (
          <DocumentIntegrityWorkspace state={state} onUpdateState={setState} />
        )}
        {activeTab === 'coding' && (
          <ClinicalCodingWorkspace state={state} onUpdateState={setState} />
        )}
        {activeTab === 'roi' && (
          <ReleaseOfInformationWorkspace state={state} onUpdateState={setState} />
        )}
        {activeTab === 'retention' && (
          <RetentionLegalHoldWorkspace state={state} onUpdateState={setState} />
        )}
      </div>

      {/* 5. Comprehensive Test Inspector Modal */}
      <HIMTestInspectorModal
        isOpen={showTestInspector}
        onClose={() => setShowTestInspector(false)}
        state={state}
      />
    </div>
  );
};
