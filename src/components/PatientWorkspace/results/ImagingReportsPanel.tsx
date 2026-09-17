import React from 'react';
import {
  Camera,
  Radio,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Eye,
  Sliders,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ImagingReportItem } from '../../../types/clinicalResults';

interface ImagingReportsPanelProps {
  reports: ImagingReportItem[];
  onOpenDicomViewer: (report: ImagingReportItem) => void;
  onAcknowledgeReport: (reportId: string) => void;
}

export const ImagingReportsPanel: React.FC<ImagingReportsPanelProps> = ({
  reports,
  onOpenDicomViewer,
  onAcknowledgeReport
}) => {
  return (
    <div className="space-y-4">
      {reports.map(report => {
        const isAcknowledged = report.reviewStatus === 'acknowledged';

        return (
          <div
            key={report.id}
            className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
              report.hasCriticalFindings
                ? 'border-rose-300 ring-1 ring-rose-200'
                : 'border-slate-200'
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 flex flex-wrap items-center justify-between gap-3 border-b ${
                report.hasCriticalFindings
                  ? 'bg-rose-50/70 border-rose-100'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-mono font-black flex items-center justify-center text-xs">
                  {report.modality}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {report.studyTitleAr}
                    </h4>

                    {report.orderReferenceId && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        طلب: {report.orderReferenceId}
                      </span>
                    )}

                    {report.hasCriticalFindings && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>موجودات هامة Significant Findings</span>
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700 font-bold">
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                    <span>المنطقة: <strong>{report.bodyRegion}</strong></span>
                    <span>•</span>
                    <span>أجريت: <span className="font-mono">{report.performedAt}</span></span>
                    <span>•</span>
                    <span>اعتمدت: <span className="font-mono">{report.reportedAt}</span></span>
                    <span>•</span>
                    <span>أخصائي الأشعة: <strong>{report.radiologist}</strong> ({report.radiologistRole})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDicomViewer(report)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>فتح عارض الصور (DICOM Viewer)</span>
                  {report.mockDicomStudy && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-teal-300">
                      {report.mockDicomStudy.instanceCount} صور
                    </span>
                  )}
                </button>

                {isAcknowledged ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم الإقرار: {report.reviewedBy}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onAcknowledgeReport(report.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>إقرار النتيجة</span>
                  </button>
                )}
              </div>
            </div>

            {/* Study Content Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Clinical Indication & Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-bold block mb-1">دواعي الفحص (Clinical Indication):</span>
                  <p className="text-slate-700 leading-relaxed">{report.clinicalIndication}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-bold block mb-1">المقارنة مع الفحوصات السابقة:</span>
                  <p className="text-slate-700 leading-relaxed">{report.comparisonPriorStudy || 'لا توجد دراسات سابقة متاحة للمقارنة.'}</p>
                </div>
              </div>

              {/* Detailed Findings */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">الموجودات التفصيلية (Detailed Findings):</span>
                <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  {report.findings}
                </p>
              </div>

              {/* Impression (Diagnostic Summary) */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                <span className="text-xs font-bold text-teal-900 block">الخلاصة والتشخيص الشعاعي (Impression):</span>
                <p className="text-teal-950 font-bold text-xs leading-relaxed">
                  {report.impression}
                </p>
              </div>

              {/* Critical Findings Alert if applicable */}
              {report.hasCriticalFindings && report.criticalOrSignificantFindings && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-900 block text-xs">موجودات حادة تستدعي تدخلاً سريرياً عاجلاً:</strong>
                    <span className="text-rose-700 text-[11px] leading-relaxed block mt-0.5">
                      {report.criticalOrSignificantFindings}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
