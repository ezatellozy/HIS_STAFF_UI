import React from 'react';
import {
  AlertTriangle,
  Clock,
  Radio,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  IncomingImagingRequest,
  RadiologistWorklistItem,
  ModalityDeviceRoom
} from '../../types/radiologyOps';

interface ExceptionsAttentionViewProps {
  requests: IncomingImagingRequest[];
  readingQueue: RadiologistWorklistItem[];
  rooms: ModalityDeviceRoom[];
  onOpenReportComposer: (studyId: string) => void;
  onOpenSafetyReview: (patientId: string, modality: any) => void;
  onNavigateTab: (tab: string) => void;
}

export const ExceptionsAttentionView: React.FC<ExceptionsAttentionViewProps> = ({
  requests,
  readingQueue,
  rooms,
  onOpenReportComposer,
  onOpenSafetyReview,
  onNavigateTab
}) => {
  const delayedReports = readingQueue.filter(r => r.isDelayed);
  const roomsCleaning = rooms.filter(r => r.status === 'cleaning_turnover' || r.status === 'calibration_maintenance');
  const statRequests = requests.filter(r => r.priority === 'stat');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>لوحة إدارة الاستثناءات وتنبيهات التشغيل (Exceptions & Bottlenecks)</span>
          </h3>
          <p className="text-xs text-rose-800 mt-0.5">
            متابعة الحالات المتأخرة عن مستهدفات الإنجاز، أجهزة المعايرة والتطهير، وحالات الطوارئ العاجلة التي تتطلب تدخلاً فورياً.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-rose-100 text-rose-900 border border-rose-300">
            {delayedReports.length + roomsCleaning.length} بنود تتطلب المتابعة
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Delayed Radiologist Reports */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>تقارير تجاوزت مستهدف الوقت TAT (Overdue Reports):</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {delayedReports.length} حالات
            </span>
          </div>

          <div className="space-y-2.5">
            {delayedReports.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                لا توجد تقارير متأخرة حالياً.
              </div>
            ) : (
              delayedReports.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.patientName}</span>
                    <span className="font-mono text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">
                      تأخر {item.elapsedMinutes - item.targetTurnaroundTimeMinutes} دقيقة
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700">{item.studyDescription}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[10px]">
                    <span className="text-slate-500">الطبيب المسؤول: {item.assignedRadiologist || 'غير مسند'}</span>
                    <button
                      onClick={() => onOpenReportComposer(item.studyId)}
                      className="font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                    >
                      فتح محرر التقرير فورا
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Equipment Turnover & Cleaning */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-600" />
              <span>أجهزة وغرف تحت التعقيم أو المعايرة (Turnover & Cleaning):</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
              {roomsCleaning.length} أجهزة
            </span>
          </div>

          <div className="space-y-2.5">
            {roomsCleaning.map(room => (
              <div
                key={room.id}
                className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{room.nameAr}</span>
                  <span className="font-mono text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded">
                    {room.code}
                  </span>
                </div>
                <div className="text-[11px] text-purple-900">
                  {room.maintenanceNote || 'تطهير شامل وتبديل أغطية الطاولة المعقمة بعد حالة عزل مسبقة'}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-purple-200/60 text-[10px]">
                  <span className="text-slate-500">{room.location}</span>
                  <button
                    onClick={() => onNavigateTab('modality_worklist')}
                    className="font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    تأكيد الجاهزية وإعادة التشغيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
