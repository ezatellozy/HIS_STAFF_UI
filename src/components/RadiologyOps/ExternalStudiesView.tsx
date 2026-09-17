import React from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  FileText,
  UploadCloud,
  Disc,
  ExternalLink,
  Eye
} from 'lucide-react';
import {
  ExternalImagingStudy
} from '../../types/radiologyOps';

interface ExternalStudiesViewProps {
  studies: ExternalImagingStudy[];
  onImportMedia: (studyId: string) => void;
}

export const ExternalStudiesView: React.FC<ExternalStudiesViewProps> = ({
  studies,
  onImportMedia
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Disc className="w-4 h-4 text-teal-600" />
            <span>أرشيف دراسات التصوير الخارجية (External Imaging Imports)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            إدخال ومراجعة أقراص الـ CD وملفات السحاب المستوردة من مستشفيات خارجية لأغراض المقارنة السريرية أو الرأي الطبي الثاني.
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
          {studies.length} دراسات خارجية مسجلة
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studies.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{item.patientName}</h4>
                <div className="text-[11px] text-slate-500 font-mono">
                  MRN: {item.mrn} • تاريخ الفحص الخارجي: {item.studyDate}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {item.importStatus === 'ready_for_comparison' ? 'مفهرس وجاهز للمقارنة' : 'تم استلام الوسائط'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800">{item.studyDescription}</div>
              <div className="text-[11px] text-teal-800">
                المنشأة المصدرة: <strong>{item.sourceFacilityName}</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                نوع الوسيط: {item.mediaFormat === 'cd_dvd' ? 'قرص مدمج (CD/DVD)' : 'نقل سحابي مباشر'}
              </div>
            </div>

            {item.externalReportSummary && (
              <div className="text-xs text-slate-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                <strong className="text-amber-900 block mb-0.5">ملخص التقرير الخارجي المرفق:</strong>
                {item.externalReportSummary}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                {item.secondaryInterpretationRequested ? 'مطلوب رأي طبي ثانٍ رسمي' : 'للمقارنة التشخيصية فقط'}
              </span>
              <button
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة المقاطع المستوردة</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
