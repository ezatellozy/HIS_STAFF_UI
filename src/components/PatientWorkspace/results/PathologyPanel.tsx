import React, { useState } from 'react';
import {
  FileSearch,
  History,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PathologyReportItem, ResultAmendment } from '../../../types/clinicalResults';

interface PathologyPanelProps {
  reports: PathologyReportItem[];
  onAcknowledgeReport: (reportId: string) => void;
}

export const PathologyPanel: React.FC<PathologyPanelProps> = ({
  reports,
  onAcknowledgeReport
}) => {
  const [selectedAmendment, setSelectedAmendment] = useState<ResultAmendment | null>(null);

  return (
    <div className="space-y-4">
      {reports.map(report => {
        const isAcknowledged = report.reviewStatus === 'acknowledged';
        const isAmended = report.status === 'amended' || report.status === 'corrected';

        return (
          <div
            key={report.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FileSearch className="w-5 h-5" />
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

                    {isAmended && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <History className="w-3 h-3 text-purple-600" />
                        <span>تقرير معدل (نسخة {report.amendments?.[0]?.version || 2})</span>
                      </span>
                    )}

                    {report.reportProfile && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {report.reportProfile.profileNameAr}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700 font-bold">
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                    <span>العينة: <strong>{report.specimenDescription}</strong></span>
                    <span>•</span>
                    <span>استلمت: <span className="font-mono">{report.receivedAt}</span></span>
                    <span>•</span>
                    <span>اعتمدت: <span className="font-mono">{report.reportedAt}</span></span>
                    <span>•</span>
                    <span>أخصائي الباثولوجيا: <strong>{report.pathologist}</strong></span>
                  </div>
                </div>
              </div>

              {/* Review / Acknowledge */}
              <div className="flex items-center gap-2">
                {isAcknowledged ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تمت المراجعة والإقرار: {report.reviewedBy}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onAcknowledgeReport(report.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>
                      {report.requiresExplicitAcknowledgement
                        ? 'إقرار استلام النتيجة (Acknowledgement Required)'
                        : 'تحديد كتمت المراجعة (Mark Reviewed)'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Pathology Report Body */}
            <div className="p-5 space-y-5 text-xs">
              {/* Surgical Margins & Tumor Staging (Only rendered when profile indicates) */}
              {report.surgicalMargins && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>حواف الاستئصال الجراحي (Surgical Margins):</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 font-mono">
                      {report.surgicalMargins.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-emerald-900 font-medium text-[11px]">{report.surgicalMargins.statusLabelAr}</p>
                  {report.surgicalMargins.distanceToClosestMargin && (
                    <p className="text-emerald-800 text-[10px]">المسافة: {report.surgicalMargins.distanceToClosestMargin}</p>
                  )}
                  {report.surgicalMargins.details && (
                    <p className="text-slate-600 text-[10px] font-mono">{report.surgicalMargins.details}</p>
                  )}
                </div>
              )}

              {report.tumorStaging && (
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>تصنيف ومرحلة الورم (Pathologic Staging):</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900 font-mono">
                      {report.tumorStaging.overallStage}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-white border border-blue-100">
                      <span className="text-slate-400 block text-[9px]">نظام التصنيف:</span>
                      <strong className="text-slate-800">{report.tumorStaging.system}</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-blue-100">
                      <span className="text-slate-400 block text-[9px]">الورم الأولي (pT):</span>
                      <strong className="text-slate-800">{report.tumorStaging.primaryTumor_pT}</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-blue-100">
                      <span className="text-slate-400 block text-[9px]">العقد اللمفاوية (pN):</span>
                      <strong className="text-slate-800">{report.tumorStaging.regionalNodes_pN}</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-blue-100">
                      <span className="text-slate-400 block text-[9px]">درجة التمايز (Grade):</span>
                      <strong className="text-slate-800">{report.tumorStaging.histologicGrade}</strong>
                    </div>
                  </div>
                </div>
              )}
              {/* Clinical History */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-800 block text-[11px]">التاريخ والبيانات السريرية الواردة مع العينة:</strong>
                <p className="text-slate-600 leading-relaxed">{report.clinicalHistory}</p>
              </div>

              {/* Gross Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">الوصف العياني الظاهري (Gross Description):</span>
                <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  {report.grossDescription}
                </p>
              </div>

              {/* Microscopic Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">الفحص المجهري النسيجي (Microscopic Examination):</span>
                <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  {report.microscopicDescription}
                </p>
              </div>

              {/* Ancillary Studies / Special Stains */}
              {report.ancillaryStudies && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">الدراسات التكميلية والصبغات المناعية (Ancillary Studies):</span>
                  <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                    {report.ancillaryStudies}
                  </p>
                </div>
              )}

              {/* Pathologic Diagnosis (Core Result Banner) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs uppercase tracking-wide">
                  <FileSearch className="w-4 h-4 text-amber-700" />
                  <span>التشخيص الباثولوجي النهائي (Pathologic Diagnosis):</span>
                </div>
                <p className="text-amber-950 font-black text-sm leading-relaxed font-serif">
                  {report.pathologicDiagnosis}
                </p>
                <p className="text-amber-800 text-[11px] leading-relaxed pt-1">
                  {report.summaryInterpretation}
                </p>
              </div>

              {/* Amendment History Audit Section if available */}
              {report.amendments && report.amendments.length > 0 && (
                <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-700" />
                      <strong className="text-xs text-purple-900 font-extrabold">
                        سجل تعديلات وإلحاقات التقرير (Amendment Audit Trail & Addenda)
                      </strong>
                    </div>
                    <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-mono font-bold">
                      شفافية الأرشيف النسيجي
                    </span>
                  </div>

                  {report.amendments.map(amd => (
                    <div key={amd.id} className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-slate-900">
                          الإلحاق رقم #{amd.version} • عُدّل بواسطة: {amd.amendedBy}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{amd.amendedAt}</span>
                      </div>

                      <div className="text-[11px] text-purple-800 font-medium">
                        سبب التعديل: {amd.reason}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block text-[10px] font-bold">النص السابق (Previous):</span>
                          <span className="text-slate-600 line-through">{amd.previousReportSummary}</span>
                        </div>
                        <div className="p-2 rounded bg-purple-50/60 border border-purple-200">
                          <span className="text-purple-700 block text-[10px] font-bold">النص المعتمد الجديد (Amended):</span>
                          <span className="text-purple-950 font-semibold">{amd.amendedReportSummary}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
