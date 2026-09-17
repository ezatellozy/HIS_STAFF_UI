import React, { useState } from 'react';
import {
  Radio,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Syringe,
  Eye,
  Layers,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import {
  IncomingImagingRequest,
  ImagingModality,
  ImagingStudy
} from '../../types/radiologyOps';

interface ModalityWorklistViewProps {
  requests: IncomingImagingRequest[];
  studies: ImagingStudy[];
  selectedModality: ImagingModality | 'ALL';
  onSelectModality: (modality: ImagingModality | 'ALL') => void;
  onStartAcquisition: (req: IncomingImagingRequest) => void;
  onOpenTechnicalQc: (study: ImagingStudy) => void;
  onOpenQuickPreview: (req: IncomingImagingRequest) => void;
  onOpenSafetyReview: (patientId: string, modality: ImagingModality) => void;
}

export const ModalityWorklistView: React.FC<ModalityWorklistViewProps> = ({
  requests,
  studies,
  selectedModality,
  onSelectModality,
  onStartAcquisition,
  onOpenTechnicalQc,
  onOpenQuickPreview,
  onOpenSafetyReview
}) => {
  const modalities: (ImagingModality | 'ALL')[] = ['ALL', 'XR', 'CT', 'MRI', 'US', 'IR'];

  const filteredRequests = requests.filter(req => {
    if (selectedModality !== 'ALL' && req.modality !== selectedModality) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Filter Tabs by Modality */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {modalities.map(m => (
            <button
              key={m}
              onClick={() => onSelectModality(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedModality === m
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m === 'ALL' ? 'كافة الأجهزة (All Modalities)' : m}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          يتم تصفية قائمة العمل للأخصائي الفني مباشرة على شاشة جهاز الفحص (Modality Worklist)
        </div>
      </div>

      {/* Worklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-600" />
            <span>قائمة عمل أجهزة الأشعة (Modality Execution Worklist)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {filteredRequests.length} حالة مسجلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">المريض / الملف</th>
                <th className="p-3">الجهاز والموداليتي</th>
                <th className="p-3">الفحص والبروتوكول</th>
                <th className="p-3">الأولوية والوقت</th>
                <th className="p-3">الصبغة والأمان</th>
                <th className="p-3">حالة المسح الحالية</th>
                <th className="p-3 text-center">الإجراء الفني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => {
                const linkedStudy = studies.find(s => s.requestId === req.id);
                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Patient */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{req.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {req.mrn} • {req.age} سنة
                      </div>
                    </td>

                    {/* Modality */}
                    <td className="p-3">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {req.modality}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        {req.bodyRegion}
                      </span>
                    </td>

                    {/* Exam & Protocol */}
                    <td className="p-3">
                      <div className="font-medium text-slate-900 line-clamp-1 max-w-[220px]" title={req.examNameAr}>
                        {req.examNameAr}
                      </div>
                      <div className="text-[10px] text-teal-700 flex items-center gap-1 mt-0.5">
                        <FileCheck className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{req.assignedProtocolName || 'بروتوكول تلقائي معتمد'}</span>
                      </div>
                    </td>

                    {/* Priority & Time */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.priority === 'stat'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.priority.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {req.requestedDateTime.split(' ')[1]}
                      </div>
                    </td>

                    {/* Contrast & Safety */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          req.contrastRequired !== 'none' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {req.contrastRequired !== 'none' ? 'صبغة مطلوبة' : 'بدون صبغة'}
                        </span>
                        <button
                          onClick={() => onOpenSafetyReview(req.patientId, req.modality)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-teal-700 cursor-pointer"
                          title="مراجعة الأمان"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Acquisition Status */}
                    <td className="p-3">
                      {req.status === 'in_acquisition' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 w-fit animate-pulse">
                          <Radio className="w-3 h-3" />
                          <span>قيد المسح على الطاولة</span>
                        </span>
                      )}
                      {req.status === 'ready_for_scan' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>جاهز للدخول فوراً</span>
                        </span>
                      )}
                      {req.status === 'arrived' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          وصل / بالتحضير
                        </span>
                      )}
                      {req.status === 'scheduled' && (
                        <span className="text-[11px] text-slate-500">مجدول بموعد مسبق</span>
                      )}
                      {req.status === 'technically_complete' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          مكتمل ومحول للقراءة
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {req.status !== 'technically_complete' ? (
                          <button
                            onClick={() => onStartAcquisition(req)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            <span>بدء الفحص (Acquire)</span>
                          </button>
                        ) : linkedStudy ? (
                          <button
                            onClick={() => onOpenTechnicalQc(linkedStudy)}
                            className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>مراجعة الجودة QC</span>
                          </button>
                        ) : null}

                        <button
                          onClick={() => onOpenQuickPreview(req)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="معاينة تفاصيل الحالة"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
