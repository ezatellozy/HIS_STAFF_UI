import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  FlaskConical,
  Droplet,
  User,
  FileText,
  Activity,
  Check,
  Info
} from 'lucide-react';
import { TransfusionReactionCase, ReactionSeverity, ReactionTypeSuspected } from '../../types/bloodBankOps';

interface TransfusionReactionsViewProps {
  cases: TransfusionReactionCase[];
  onUpdateCase: (updatedCase: TransfusionReactionCase) => void;
}

export const TransfusionReactionsView: React.FC<TransfusionReactionsViewProps> = ({
  cases,
  onUpdateCase
}) => {
  const [activeCaseId, setActiveCaseId] = useState<string>(cases[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const currentCase = cases.find(c => c.id === activeCaseId) || cases[0];

  const handleUpdateInvestigation = (key: keyof TransfusionReactionCase, value: any) => {
    if (!currentCase) return;
    const updated = { ...currentCase, [key]: value };
    onUpdateCase(updated);
  };

  if (!currentCase) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 font-bold">لا توجد حالات اشتباه تفاعل نقل دم مسجلة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">سجل والتحقيق في تفاعلات نقل الدم (Transfusion Reaction Investigation)</h2>
              <p className="text-xs text-slate-500">
                بروتوكول اليقظة الدموية (Hemovigilance): التدقيق الكتابي، فحص DAT، الكشف عن انحلال الدم، وتقييم الاستشاري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cases.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCaseId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCaseId === c.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{c.id}</span>
                <span className="mr-1 text-[10px] opacity-85">({c.patientName.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Protocol Guidance */}
        <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/70 flex items-center justify-between text-xs text-rose-950">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
            <span>
              قاعدة اليقظة الدموية: التفاعل مشتبه به سريرياً (Suspected) حتى يثبت التحقيق المخبري النتيجة النهائية (Confirmed vs Excluded).
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
            Hemovigilance Protocol
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Clinical Report & Lab Steps */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clinical Alert Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-xs">{currentCase.id}</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                  {currentCase.suspectedType === 'acute_hemolytic' ? 'اشتباه تفاعل انحلالي حاد (Acute Hemolytic)' :
                   currentCase.suspectedType === 'febrile_non_hemolytic' ? 'تفاعل حموي غير انحلالي' : 'تفاعل تحسسي'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">ساعة البلاغ: {currentCase.reportedAt}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">المريض والموقع:</span>
                <span className="font-bold text-slate-900">{currentCase.patientName}</span>
                <div className="font-mono text-slate-600">MRN: {currentCase.patientMrn} • {currentCase.locationWardBed}</div>
              </div>

              <div>
                <span className="text-slate-500 block">الوحدة محل التفاعل:</span>
                <span className="font-mono font-bold text-red-700">{currentCase.unitNumber}</span>
                <div className="text-slate-600 font-medium">كريات دم حمراء مكدسة (PRBCs)</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-bold text-xs block mb-1">الأعراض السريرية المبلغة من الجناح/العناية:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                {currentCase.clinicalSymptoms.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
              <div className="mt-2 text-[11px] text-rose-800 font-bold flex items-center gap-1.5 pt-2 border-t border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                <span>الإجراء السريري الفوري المتخذ: تم إيقاف نقل الدم فوراً وإبقاء الوريد مفتوحاً بمحلول ملحي.</span>
              </div>
            </div>
          </div>

          {/* Investigation Step 1: Clerical Check */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">1. التدقيق الكتابي الإلزامي (Clerical Check)</h3>
              <span className="text-[11px] text-slate-500">فحص مطابقة بيانات المريض والوحدة وكافة السجلات</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 text-xs">
                  مطابقة الاسم، الرقم الطبي، كود الوحدة، والفصيلة بين طلب الصرف وملف المريض:
                </div>
                <p className="text-[11px] text-slate-500">{currentCase.clericalCheckNotes}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                متطابق وسليم
              </span>
            </div>
          </div>

          {/* Investigation Step 2: Laboratory Findings (DAT, Hemolysis, Group) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">2. الفحوصات المخبرية للتفاعل (Laboratory Testing Findings)</h3>
              <span className="text-[11px] text-slate-500">عينة ما بعد النقل ومخلفات الكيس المعادة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* DAT */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">فحص كومبس المباشر (DAT):</span>
                <div className={`font-mono font-bold text-sm ${
                  currentCase.directAntiglobulinTestDAT === 'positive_igg' ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {currentCase.directAntiglobulinTestDAT === 'positive_igg' ? 'Positive (IgG 2+)' : 'Negative'}
                </div>
                <span className="text-[10px] text-slate-500 block">ارتباط أضداد على كريات المريض</span>
              </div>

              {/* Free Hemoglobin */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">الهيموجلوبين الحر (مصل/بول):</span>
                <div className={`font-mono font-bold text-sm ${
                  currentCase.freeHemoglobinInSerumUrine === 'present_hemolysis' ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {currentCase.freeHemoglobinInSerumUrine === 'present_hemolysis' ? 'Present (Hemolysis)' : 'None Detected'}
                </div>
                <span className="text-[10px] text-slate-500 block">دليل انحلال داخل الأوعية</span>
              </div>

              {/* Repeat Grouping */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">إعادة فحص الفصيلة:</span>
                <div className="font-mono font-bold text-emerald-700 text-sm">Matched (B+)</div>
                <span className="text-[10px] text-slate-500 block">لا يوجد خطأ في فصيلة ABO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Specialist Conclusion & Actions */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">خلاصة استشاري طب نقل الدم (Conclusion)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">التقييم التشخيصي النهائي والتوصيات السريرية</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="font-bold text-rose-950 text-xs block">خلاصة التحقيق:</span>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                {currentCase.conclusionSummary}
              </p>
              <div className="pt-2 border-t border-rose-200 text-[11px] text-rose-800">
                الاستشاري المسؤول: <strong>{currentCase.specialistConsultant}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 font-bold text-xs">حالة ملف التحقيق:</label>
              <select
                value={currentCase.investigationStatus}
                onChange={e => handleUpdateInvestigation('investigationStatus', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
              >
                <option value="reported_received">تم استلام البلاغ</option>
                <option value="testing_underway">الفحوصات المخبرية جارية</option>
                <option value="specialist_review">قيد مراجعة الاستشاري</option>
                <option value="closed_concluded">مغلق وموثوق باليقظة الدموية</option>
              </select>
            </div>

            <button
              onClick={() => handleUpdateInvestigation('investigationStatus', 'closed_concluded')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>إغلاق وتوثيق تقرير التحقيق النهائي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
