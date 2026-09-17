import React from 'react';
import {
  X,
  User,
  Activity,
  FileCheck,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Syringe,
  Bed,
  Layers,
  FileText
} from 'lucide-react';
import {
  IncomingImagingRequest,
  ImagingModality
} from '../../types/radiologyOps';

interface RadiologyQuickPreviewDrawerProps {
  request: IncomingImagingRequest | null;
  onClose: () => void;
  onOpenProtocoling: (req: IncomingImagingRequest) => void;
  onOpenScheduling: (req: IncomingImagingRequest) => void;
  onOpenSafetyReview: (patientId: string, modality: ImagingModality) => void;
  onDeepLinkAxis6: (patientId: string, orderId: string) => void;
}

export const RadiologyQuickPreviewDrawer: React.FC<RadiologyQuickPreviewDrawerProps> = ({
  request,
  onClose,
  onOpenProtocoling,
  onOpenScheduling,
  onOpenSafetyReview,
  onDeepLinkAxis6
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-r border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-teal-400 font-mono uppercase tracking-wider">
              المعاينة السريعة لطلب الأشعة (Quick Preview)
            </h3>
            <div className="text-sm font-bold text-white mt-0.5">
              {request.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Patient Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{request.patientName}</span>
              <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {request.mrn}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>{request.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
              <span>•</span>
              <span>{request.age} سنة</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{request.originLocation}</span>
            </div>
            <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 flex items-center justify-between">
              <span>الطبيب الطالب: {request.requestingClinician.name}</span>
              <button
                onClick={() => onDeepLinkAxis6(request.patientId, request.orderSourceId)}
                className="text-teal-700 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>أمر Axis 6</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Exam & Indication */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">الفحص المطلوب والموداليتي:</span>
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800">
                  {request.modality}
                </span>
                <span className="font-bold text-slate-900">{request.examNameAr}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{request.examNameEn}</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">المؤشر السريري:</span>
            <p className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs leading-relaxed">
              {request.clinicalIndication}
            </p>
          </div>

          {/* Operational Statuses */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 block">الأولوية:</span>
              <strong className={`font-bold ${request.priority === 'stat' ? 'text-rose-600' : 'text-slate-800'}`}>
                {request.priority.toUpperCase()}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 block">الصبغة المطلوبة:</span>
              <strong className="text-slate-800 font-bold">
                {request.contrastRequired !== 'none' ? 'نعم (صبغة)' : 'بدون صبغة'}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 block">حالة البروتوكول:</span>
              <strong className="text-slate-800 font-bold">
                {request.assignedProtocolName ? 'معتمد ومحدد' : 'بانتظار المراجعة'}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 block">حالة الجدولة:</span>
              <strong className="text-slate-800 font-bold">
                {request.schedulingStatus === 'scheduled' ? 'مجدول بموعد' :
                 request.schedulingStatus === 'walk_in_direct' ? 'دخول مباشر STAT' : 'غير مجدول'}
              </strong>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenProtocoling(request);
              }}
              className="py-2 bg-white border border-slate-200 hover:border-teal-500 rounded-xl text-xs font-bold text-slate-800 hover:text-teal-700 transition-colors cursor-pointer"
            >
              البروتوكول
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenScheduling(request);
              }}
              className="py-2 bg-white border border-slate-200 hover:border-teal-500 rounded-xl text-xs font-bold text-slate-800 hover:text-teal-700 transition-colors cursor-pointer"
            >
              الجدولة
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSafetyReview(request.patientId, request.modality);
              }}
              className="py-2 bg-white border border-slate-200 hover:border-teal-500 rounded-xl text-xs font-bold text-slate-800 hover:text-teal-700 transition-colors cursor-pointer"
            >
              ملف الأمان
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
