import React, { useState } from 'react';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Info,
  Beaker,
  Sliders,
  HelpCircle,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  MicrobiologyReportItem,
  InterpretationStandardType,
  AntimicrobialSusceptibilityInterpretationProfile
} from '../../../types/clinicalResults';

interface MicrobiologyPanelProps {
  reports: MicrobiologyReportItem[];
  onAcknowledgeReport: (reportId: string) => void;
}

export const MicrobiologyPanel: React.FC<MicrobiologyPanelProps> = ({
  reports,
  onAcknowledgeReport
}) => {
  // Configurable Interpretation Standard profile switcher for interactive demonstration
  const [activeStandard, setActiveStandard] = useState<InterpretationStandardType>('EUCAST');

  return (
    <div className="space-y-5" id="microbiology-reports-container">
      {/* Profile Explanation Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border border-teal-200 text-xs text-teal-950 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Beaker className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="font-extrabold text-sm text-teal-950">
                ملف تفسير حساسية مضادات الميكروبات (Antimicrobial Susceptibility Interpretation Profile)
              </strong>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-200 text-teal-900">
                Policy-Driven Profile
              </span>
            </div>
            <p className="text-[11px] text-teal-800 mt-0.5">
              التفسير السريري لمقاومة الميكروبات غير مبني على تصنيفات جامدة، بل يستند لمعايير الملف المعتمد (EUCAST / CLSI / Configured Profile).
            </p>
          </div>
        </div>

        {/* Profile Standard Selector */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs p-1 rounded-xl border border-teal-200">
          <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-teal-600" />
            <span>معيار التفسير المعروض:</span>
          </span>
          <button
            onClick={() => setActiveStandard('EUCAST')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStandard === 'EUCAST'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            EUCAST v13.1
          </button>
          <button
            onClick={() => setActiveStandard('CLSI')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStandard === 'CLSI'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            CLSI M100-Ed33
          </button>
          <button
            onClick={() => setActiveStandard('configured')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeStandard === 'configured'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            الملف المؤسسي المخصص
          </button>
        </div>
      </div>

      {reports.map(report => {
        const isAcknowledged = report.reviewStatus === 'acknowledged';
        const profile = report.interpretationProfile;

        // Determine meaning of 'I' based on the selected standard
        const isEucast = activeStandard === 'EUCAST';
        const isClsi = activeStandard === 'CLSI';

        const iMeaningAr = isEucast
          ? 'حساس عند زيادة التعرض / الجرعة (Susceptible, Increased Exposure)'
          : isClsi
          ? 'متوسط الحساسية (Intermediate)'
          : 'حساس بنظام مخصص (Configured Profile Susceptibility)';

        const iDescriptionAr = isEucast
          ? 'وفق معيار EUCAST: احتمالية نجاح سريري مرتفعة عند رفع تركيز المضاد بالجرعة أو موضع الإصابة.'
          : isClsi
          ? 'وفق معيار CLSI: يقع في المنطقة العازلة السريرية أو استجابة غير مؤكدة بالجرعة العادية.'
          : 'وفق سياسة لجنة المضادات الحيوية بالمنشأة.';

        return (
          <div
            key={report.id}
            id={`microbiology-report-${report.id}`}
            className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
              report.isCriticalAlert
                ? 'border-rose-300 ring-1 ring-rose-200'
                : 'border-slate-200'
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 flex flex-wrap items-center justify-between gap-3 border-b ${
                report.isCriticalAlert
                  ? 'bg-rose-50/70 border-rose-100'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
                  <Bug className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {report.titleAr}
                    </h4>

                    {report.orderReferenceId && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        طلب: {report.orderReferenceId}
                      </span>
                    )}

                    {report.isCriticalAlert && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>مزرعة إيجابية حرجة (Positive Blood Culture)</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700 font-bold">
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                    <span>نوع العينة: <strong>{report.specimenType}</strong></span>
                    <span>•</span>
                    <span>سحبت: <span className="font-mono">{report.collectedAt}</span></span>
                    <span>•</span>
                    <span>النتيجة: <span className="font-mono">{report.resultedAt}</span></span>
                    <span>•</span>
                    <span>المختبر: {report.performingLab}</span>
                  </div>
                </div>
              </div>

              {/* Review / Acknowledge Authority */}
              <div className="flex items-center gap-2">
                {isAcknowledged ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم إقرار النتيجة السريرية: {report.reviewedBy}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onAcknowledgeReport(report.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>إقرار مراجعة المزرعة (Clinician Review)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Organism & Gram Stain Card */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1">
                  <span className="text-[10px] text-rose-700 font-bold block uppercase tracking-wider">
                    الكائن الحي المعزول (Target Organism)
                  </span>
                  <strong className="text-sm font-black text-rose-950 font-serif italic block">
                    {report.organismIdentified}
                  </strong>
                  <span className="text-[11px] text-rose-800 block">
                    {report.colonyCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    صبغة الجرام وموقع السحب
                  </span>
                  <strong className="text-xs font-bold text-slate-900 block font-mono">
                    {report.gramStain}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    موقع السحب: {report.collectionSite}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 space-y-1">
                  <span className="text-[10px] text-teal-800 font-bold block uppercase tracking-wider">
                    الأهمية والتفسير السريري
                  </span>
                  <p className="text-[11px] text-teal-950 leading-relaxed font-medium">
                    {report.clinicalSignificance}
                  </p>
                </div>
              </div>

              {/* Interpretation Profile Legend & Meaning Bar */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-slate-800">
                    ملف التفسير النشط: {activeStandard === 'EUCAST' ? 'EUCAST v13.1 (2023)' : activeStandard === 'CLSI' ? 'CLSI M100-Ed33' : 'Configured Institution Profile'}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600 text-[11px]">الكائن المطبق عليه المعايير: <em>{report.organismIdentified}</em></span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold flex-wrap">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    S = {isEucast ? 'حساس بالجرعة القياسية' : 'حساس (Susceptible)'}
                  </span>
                  <span
                    title={iDescriptionAr}
                    className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1 cursor-help"
                  >
                    <span>I = {isEucast ? 'حساس مع زيادة التعرض (EUCAST)' : 'متوسط الحساسية (CLSI)'}</span>
                    <HelpCircle className="w-3 h-3 text-amber-700" />
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                    R = مقاوم سريرياً (Resistant)
                  </span>
                </div>
              </div>

              {/* Susceptibility Antibiogram Grid with MIC and Zone Diameter */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-slate-900 font-bold">
                      جدول اختبار الحساسية الدوائية ومقاومة الميكروبات (Antibiogram Matrix)
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      MIC Breakpoints & Zone Diameters
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">
                    {report.susceptibilities.length} مضادات حيوية مفحوصة
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">المضاد الحيوي (Antimicrobial Agent)</th>
                        <th className="py-2.5 px-3 text-center">أدنى تركيز مثبط (MIC)</th>
                        <th className="py-2.5 px-3 text-center">قطر التثبيط (Zone Diameter)</th>
                        <th className="py-2.5 px-4 text-center">الرمز (Code)</th>
                        <th className="py-2.5 px-4">التفسير السريري المعتمد (Human-readable Interpretation)</th>
                        <th className="py-2.5 px-3 text-center">طريقة الفحص (Test Method)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.susceptibilities.map((susc, sIdx) => {
                        const code = susc.interpretationCode;
                        const isS = code === 'S';
                        const isI = code === 'I';
                        const isR = code === 'R';

                        // Dynamic human-readable interpretation derived from active profile
                        let displayInterpretation = susc.humanReadableInterpretation;
                        if (isI) {
                          displayInterpretation = iMeaningAr;
                        } else if (isS) {
                          displayInterpretation = isEucast
                            ? 'حساس بالجرعة القياسية (Susceptible, standard dose)'
                            : 'حساس للعلاج (Susceptible)';
                        }

                        return (
                          <tr key={sIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              <div>{susc.antibiotic}</div>
                              {susc.interpretationNotes && (
                                <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                                  {susc.interpretationNotes}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                              {susc.mic || '—'}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600">
                              {susc.zoneDiameter || '—'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                  isS
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : isI
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {code}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <span>{displayInterpretation}</span>
                                {isI && (
                                  <span className="text-[10px] text-amber-700 font-normal">
                                    ({isEucast ? 'EUCAST: زيادة الجرعة' : 'CLSI: متوسط'})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-400 font-mono text-[10px]">
                              {susc.testMethod || 'Broth Microdilution'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lab Comments */}
              {report.labComments && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <strong className="text-slate-800 block font-bold">ملاحظات أخصائي الميكروبيولوجيا والتحكم في العدوى:</strong>
                  <p className="leading-relaxed">{report.labComments}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
