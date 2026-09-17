import React from 'react';
import {
  Bed,
  BatteryCharging,
  Radio,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  PortableImagingContext
} from '../../types/radiologyOps';

interface PortableImagingViewProps {
  cases: PortableImagingContext[];
  onUpdateStatus: (caseId: string, status: PortableImagingContext['dispatchStatus']) => void;
}

export const PortableImagingView: React.FC<PortableImagingViewProps> = ({
  cases,
  onUpdateStatus
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bed className="w-4 h-4 text-teal-600" />
            <span>إدارة التصوير الشعاعي المتنقل بالسرير (Portable & Bedside Operations)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة طلبات الأشعة بالسرير للعنايات المركزة (ICU) وأقسام العزل والطوارئ الحرجة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
            {cases.length} حالات متنقلة مسجلة
          </span>
        </div>
      </div>

      {/* Grid of Portable Units & Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{item.patientName}</h4>
                <div className="text-[11px] text-slate-500 font-mono">
                  MRN: {item.mrn} • <strong className="text-teal-700">{item.locationWardBed}</strong>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.dispatchStatus === 'acquired' ? 'bg-emerald-100 text-emerald-800' :
                item.dispatchStatus === 'at_bedside' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.dispatchStatus === 'requested' ? 'بانتظار التحرك' :
                 item.dispatchStatus === 'technologist_dispatched' ? 'الفني في الطريق' :
                 item.dispatchStatus === 'at_bedside' ? 'عند سرير المريض' :
                 item.dispatchStatus === 'acquired' ? 'تم التصوير بنجاح' : 'عاد للجناح'}
              </span>
            </div>

            {/* Machine & Battery Info */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">الجهاز المخصص:</span>
                <strong className="font-mono text-slate-800">{item.modalityMachineId}</strong>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-emerald-700 font-bold">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                <span>{item.batteryLevelPercent}%</span>
              </div>
            </div>

            {/* Isolation Precautions */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">احتياطات مكافحة العدوى:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                {item.isolationType === 'droplet' ? 'عزل رذاذ (Droplet Precautions)' : 'معايير عامة'}
              </span>
            </div>

            {item.notes && (
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                {item.notes}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              {item.dispatchStatus === 'requested' && (
                <button
                  onClick={() => onUpdateStatus(item.id, 'technologist_dispatched')}
                  className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  انطلاق الفني إلى الجناح
                </button>
              )}
              {item.dispatchStatus === 'technologist_dispatched' && (
                <button
                  onClick={() => onUpdateStatus(item.id, 'at_bedside')}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  تأكيد الوصول لسرير المريض
                </button>
              )}
              {item.dispatchStatus === 'at_bedside' && (
                <button
                  onClick={() => onUpdateStatus(item.id, 'acquired')}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  إتمام التصوير ونقل الصورة لاسلكياً
                </button>
              )}
              {item.dispatchStatus === 'acquired' && (
                <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم التقاط الصورة وإرسالها للأرشيف بنجاح</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
