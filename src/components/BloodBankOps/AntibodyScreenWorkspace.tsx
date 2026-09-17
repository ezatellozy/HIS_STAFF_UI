import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight,
  Droplet
} from 'lucide-react';
import { AntibodyScreenResult, PreTransfusionSample } from '../../types/bloodBankOps';

interface AntibodyScreenWorkspaceProps {
  screens: AntibodyScreenResult[];
  samples: PreTransfusionSample[];
  selectedSampleId?: string;
  onNavigateToCrossmatch?: (sampleId: string) => void;
  onSearchAntigenNegativeUnits?: (criteria: string) => void;
}

export const AntibodyScreenWorkspace: React.FC<AntibodyScreenWorkspaceProps> = ({
  screens,
  samples,
  selectedSampleId,
  onNavigateToCrossmatch,
  onSearchAntigenNegativeUnits
}) => {
  const [activeScreenId, setActiveScreenId] = useState<string>(() => {
    if (selectedSampleId) {
      const match = screens.find(s => s.sampleId === selectedSampleId);
      if (match) return match.id;
    }
    return screens[0]?.id || '';
  });

  const currentScreen = screens.find(s => s.id === activeScreenId) || screens[0];
  const linkedSample = currentScreen ? samples.find(s => s.id === currentScreen.sampleId) : null;

  if (!currentScreen) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <FlaskConical className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 font-bold">لا توجد فحوصات مسح أضداد مسجلة حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">فحص ومسح الأجسام المضادة غير المتوقعة (Antibody Screen & Investigation)</h2>
            <p className="text-xs text-slate-500">
              كشف الأضداد غير المتوقعة لخلايا الدم الحمراء بواسطة بطاقات الهلام (Gel Cards) وتحديد المستضدات المستهدفة
            </p>
          </div>
        </div>

        {/* Screen Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {screens.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScreenId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeScreenId === s.id
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{s.sampleId}</span>
              <span className={`mr-1 text-[10px] px-1.5 py-0.2 rounded ${
                s.overallScreenResult === 'positive' ? 'bg-rose-500 text-white' : 'bg-emerald-700 text-white'
              }`}>
                {s.overallScreenResult === 'positive' ? 'إيجابي (+)' : 'سلبي (-)'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Screen Matrix & Method */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {linkedSample?.patientName || `المريض برقم ملف ${currentScreen.patientMrn}`}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                MRN: {currentScreen.patientMrn} • Sample: {currentScreen.sampleId} • التاريخ: {currentScreen.testedAt}
              </div>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-500 block">طريقة الفحص:</span>
              <span className="font-bold text-slate-800 text-xs">{currentScreen.screenMethod}</span>
            </div>
          </div>

          {/* 3-Cell Screen Results */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">نتائج فحص خلايا الكشف الثلاثية (3-Cell Screening Panel)</h3>
              <span className="text-[11px] text-slate-500">I, II, III Screening Reagent Cells</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-700">Cell I (خلايا الكشف 1)</div>
                <div className={`text-xl font-bold font-mono mt-2 ${
                  currentScreen.screen1Cell === 'Negative' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {currentScreen.screen1Cell}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">طور الجلوبيولين البشري (AHG)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-700">Cell II (خلايا الكشف 2)</div>
                <div className={`text-xl font-bold font-mono mt-2 ${
                  currentScreen.screen2Cell === 'Negative' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {currentScreen.screen2Cell}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">طور الجلوبيولين البشري (AHG)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-700">Cell III (خلايا الكشف 3)</div>
                <div className={`text-xl font-bold font-mono mt-2 ${
                  currentScreen.screen3Cell === 'Negative' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {currentScreen.screen3Cell}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">طور الجلوبيولين البشري (AHG)</div>
              </div>
            </div>
          </div>

          {/* Identified Antibodies & Investigation Panel if positive */}
          {currentScreen.overallScreenResult === 'positive' && (
            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-rose-950 text-xs">
                    الأجسام المضادة المحددة في لوحة التحقيق (Antibody Identification Panel)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[10px]">
                  Positive Workup
                </span>
              </div>

              <div className="space-y-3">
                {currentScreen.identifiedAntibodies.map((ab, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-rose-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-sm font-mono">{ab.specificity}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {ab.clinicalSignificance === 'clinically_significant' ? 'ذو أهمية سريرية حرجة' : 'غير مؤكد الأهمية'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      متطلبات السلامة لنقل الدم: {ab.transfusionRequirement}
                    </p>
                    {ab.historicalDate && (
                      <span className="text-[10px] text-slate-500 block">
                        السجل التاريخي: {ab.historicalDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Clinical Rules & Actions */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">نتيجة المسح والقرارات السريرية</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">تحديد متطلبات التوافق والمشتق المطلوب</p>
            </div>

            {/* Status Result Card */}
            <div className={`p-4 rounded-xl text-center space-y-1 ${
              currentScreen.overallScreenResult === 'positive'
                ? 'bg-rose-50 border border-rose-200'
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <div className="text-xs font-bold">
                {currentScreen.overallScreenResult === 'positive' ? (
                  <span className="text-rose-900">المسح إيجابي (+): يوجد جسم مضاد غير متوقع</span>
                ) : (
                  <span className="text-emerald-900">المسح سلبي (-): لم يتم كشف أضداد غير متوقعة</span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {currentScreen.overallScreenResult === 'positive'
                  ? 'يمنع الصرف الإلكتروني؛ يجب إجراء تطابق كامل بأضداد الجلوبيولين (AHG Crossmatch) واختيار وحدات سالبة للمستضد المعني.'
                  : 'مؤهل للتوافق المصلي الفوري (Immediate Spin) أو التوافق الإلكتروني وفق سياسة الفحص المعتمدة.'}
              </p>
            </div>

            {/* Search Antigen-Negative Units Action */}
            {currentScreen.antigenNegativeSearchNeeded && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                <span className="font-bold text-purple-950 text-xs block">البحث عن وحدات سالبة للمستضد:</span>
                <p className="text-[11px] text-purple-800">
                  معايير البحث: {currentScreen.searchCriteria}
                </p>
                {onSearchAntigenNegativeUnits && (
                  <button
                    onClick={() => onSearchAntigenNegativeUnits(currentScreen.searchCriteria || '')}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>البحث في المخزون (K-negative Units)</span>
                  </button>
                )}
              </div>
            )}

            {/* Navigate to Crossmatch */}
            {onNavigateToCrossmatch && (
              <button
                onClick={() => onNavigateToCrossmatch(currentScreen.sampleId)}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>الانتقال لمختبر التوافق والمطابقة (Crossmatch)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
