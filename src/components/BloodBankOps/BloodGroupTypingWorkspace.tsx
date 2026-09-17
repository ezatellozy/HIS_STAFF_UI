import React, { useState } from 'react';
import {
  Droplets,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  User,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Check
} from 'lucide-react';
import { BloodGroupTestResult, PreTransfusionSample } from '../../types/bloodBankOps';

interface BloodGroupTypingWorkspaceProps {
  tests: BloodGroupTestResult[];
  samples: PreTransfusionSample[];
  selectedSampleId?: string;
  onVerifyTest: (testId: string) => void;
}

export const BloodGroupTypingWorkspace: React.FC<BloodGroupTypingWorkspaceProps> = ({
  tests,
  samples,
  selectedSampleId,
  onVerifyTest
}) => {
  const [activeTestId, setActiveTestId] = useState<string>(() => {
    if (selectedSampleId) {
      const match = tests.find(t => t.sampleId === selectedSampleId);
      if (match) return match.id;
    }
    return tests[0]?.id || '';
  });

  const currentTest = tests.find(t => t.id === activeTestId) || tests[0];
  const linkedSample = currentTest ? samples.find(s => s.id === currentTest.sampleId) : null;

  if (!currentTest) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <FlaskConical className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 font-bold">لا توجد فحوصات فصائل مسجلة حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">مختبر فحص وتأكيد فصائل الدم (Blood Group & Type Workspace)</h2>
            <p className="text-xs text-slate-500">
              التطابق بين الفحص الأمامي (Forward / Front Typing) والفحص الخلفي (Reverse / Back Typing) والمطابقة التاريخية
            </p>
          </div>
        </div>

        {/* Test Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {tests.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTestId(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTestId === t.id
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{t.sampleId}</span>
              <span className="mr-1 text-[10px] opacity-80">({t.interpretedAbo}{t.interpretedRh === 'positive' ? '+' : '-'})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Testing Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient Context Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 text-sm">
                ID
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {linkedSample?.patientName || `المريض برقم ملف ${currentTest.patientMrn}`}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  MRN: {currentTest.patientMrn} • Sample: {currentTest.sampleId} • فُحص: {currentTest.testDate}
                </div>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-500 block">الفني المختص:</span>
              <span className="font-bold text-slate-800 text-xs">{currentTest.technologistName}</span>
            </div>
          </div>

          {/* Forward Typing (Cell Testing) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <h3 className="font-bold text-slate-900 text-xs">1. الفحص الأمامي لكريات الدم (Forward / Front Typing)</h3>
              </div>
              <span className="text-[11px] text-slate-500">كشف المستضدات على سطح كريات الدم الحمراء</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-slate-600">Anti-A</div>
                <div className="text-lg font-bold font-mono text-red-700 mt-1">{currentTest.antiA}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">تفاعل التراص</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-slate-600">Anti-B</div>
                <div className="text-lg font-bold font-mono text-red-700 mt-1">{currentTest.antiB}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">تفاعل التراص</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-slate-600">Anti-AB</div>
                <div className="text-lg font-bold font-mono text-red-700 mt-1">{currentTest.antiAB || '4+'}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">تفاعل التراص</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-slate-600">Anti-D (Rh)</div>
                <div className="text-lg font-bold font-mono text-red-700 mt-1">{currentTest.antiD}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">عامل ريسوس</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-slate-600">Rh Control</div>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-1">{currentTest.rhControl}</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">سالب (سليم)</div>
              </div>
            </div>
          </div>

          {/* Reverse Typing (Serum/Plasma Testing) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <h3 className="font-bold text-slate-900 text-xs">2. الفحص الخلفي للمصل (Reverse / Back Typing)</h3>
              </div>
              <span className="text-[11px] text-slate-500">كشف الأجسام المضادة الطبيعية في المصل/البلازما</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700 text-xs">A1 Reagent Red Cells</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">كاشف خلايا A1 المعيارية</div>
                </div>
                <div className="text-xl font-bold font-mono text-blue-800">{currentTest.a1Cells}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700 text-xs">B Reagent Red Cells</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">كاشف خلايا B المعيارية</div>
                </div>
                <div className="text-xl font-bold font-mono text-blue-800">{currentTest.bCells}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Technical Interpretation & Verification */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">3. التفسير والمطابقة التاريخية (Interpretation)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">القرار الفني لفصيلة المريض المعتمدة</p>
            </div>

            {/* Interpreted Result Box */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-1">
              <span className="text-[11px] text-red-800 font-medium">الفصيلة المفسرة من الفحص الحالي:</span>
              <div className="text-2xl font-bold text-red-700 font-mono">
                {currentTest.interpretedAbo} {currentTest.interpretedRh === 'positive' ? 'موجب (+)' : 'سالب (-)'}
              </div>
              <span className="text-[10px] font-mono text-red-600 block">
                {currentTest.interpretedAbo} {currentTest.interpretedRh === 'positive' ? 'Positive' : 'Negative'}
              </span>
            </div>

            {/* Historical Matching Section */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-xs block">سجل الفصائل التاريخي:</span>
              {currentTest.historicalAbo ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">الفصيلة السابقة بالملف:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currentTest.historicalAbo} {currentTest.historicalRh === 'positive' ? '+' : '-'}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-amber-700 font-medium">
                  لا يوجد فحص فصيلة تاريخي مسجل سابقاً (أول مرة)
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                {currentTest.discrepancyStatus === 'none_matched' ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تطابق تام (Forward = Reverse = Historical)</span>
                  </div>
                ) : currentTest.discrepancyStatus === 'first_time_type' ? (
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>فحص لأول مرة - يتطلب تأكيد بعينة ثانية وفق السياسة</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>يوجد تباين (Discrepancy) يتطلب تحقيق مخبري فوري</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Sign-Off */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">حالة الاعتماد الفني:</span>
                <span className={`font-bold ${
                  currentTest.technicalVerificationStatus === 'verified' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {currentTest.technicalVerificationStatus === 'verified' ? 'معتمد ومصدق' : 'بانتظار العينة التأكيدية'}
                </span>
              </div>

              {currentTest.verifierName && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  تم التصديق بواسطة: <strong>{currentTest.verifierName}</strong>
                </div>
              )}

              {currentTest.technicalVerificationStatus !== 'verified' && (
                <button
                  onClick={() => onVerifyTest(currentTest.id)}
                  className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد الفصيلة فنياً (Technical Sign-off)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
