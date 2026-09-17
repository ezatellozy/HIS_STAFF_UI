import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Syringe,
  Bed,
  ArrowRight,
  UserCheck,
  Radio,
  FileCheck
} from 'lucide-react';
import {
  ArrivalPreparationItem,
  ModalityDeviceRoom
} from '../../types/radiologyOps';

interface ArrivalPreparationQueueViewProps {
  arrivals: ArrivalPreparationItem[];
  rooms: ModalityDeviceRoom[];
  onToggleReadyForScan: (arrivalId: string) => void;
  onCallIntoRoom: (arrival: ArrivalPreparationItem) => void;
  onOpenSafetyReview: (patientId: string, modality: any) => void;
}

export const ArrivalPreparationQueueView: React.FC<ArrivalPreparationQueueViewProps> = ({
  arrivals,
  rooms,
  onToggleReadyForScan,
  onCallIntoRoom,
  onOpenSafetyReview
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Info Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>طابور وصول المرضى والتحضير السريري (Arrival & Preparation Queue)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            مبدأ السلامة: وصول المريض إلى القسم لا يعني جاهزيته فوراً للمسح دون استكمال التحقق والأمان والخط الوريدي.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
            {arrivals.length} مرضى بالانتظار
          </span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {arrivals.filter(a => a.isReadyForScan).length} جاهزون للمسح الفوري
          </span>
        </div>
      </div>

      {/* Queue Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {arrivals.map(item => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all space-y-3 bg-white ${
              item.isReadyForScan
                ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-400/30'
                : 'border-slate-200 hover:border-teal-300'
            }`}
          >
            {/* Top Row: Patient Info & Wait Time */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{item.patientName}</h4>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  MRN: {item.mrn} • <span className="font-bold text-teal-700">{item.modality}</span>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item.waitingDurationMinutes} دقيقة</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">وصل {item.arrivedAt.split(' ')[1]}</span>
              </div>
            </div>

            {/* Exam Details */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-800 block line-clamp-1">{item.examName}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                الغرفة المستهدفة: <strong className="text-slate-700">{item.destinationRoomName}</strong>
              </span>
            </div>

            {/* Preparation Checkpoints */}
            <div className="space-y-2 text-xs">
              {/* Checkpoint 1: Patient ID Verification */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>التحقق من الهوية:</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {item.identityVerificationStatus === 'verified_dual_id' ? 'تحقق ثنائي مؤكد' :
                   item.identityVerificationStatus === 'wristband_scanned' ? 'مسح الإسورة الرقمية' : 'تأكيد شفهي'}
                </span>
              </div>

              {/* Checkpoint 2: Safety Screening */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>استبيان الأمان:</span>
                </span>
                <button
                  onClick={() => onOpenSafetyReview(item.patientId, item.modality)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                >
                  معتمد ومطابق ✓
                </button>
              </div>

              {/* Checkpoint 3: Contrast / IV Line */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px] flex items-center gap-1.5">
                  <Syringe className="w-3.5 h-3.5 text-slate-400" />
                  <span>الصبغة والخط الوريدي:</span>
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  item.contrastReadiness === 'ready_iv_placed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.contrastReadiness === 'ready_iv_placed' ? `كانيولا (${item.ivAccessGauge?.split('-')[0] || 'جاهزة'})` : 'غير مطلوبة'}
                </span>
              </div>

              {/* Checkpoint 4: Consent */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px] flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>الموافقة المستنيرة:</span>
                </span>
                <span className="text-[10px] font-bold text-slate-700">
                  {item.consentStatus === 'signed' ? 'موقعة إلكترونياً' : 'غير مطلوبة'}
                </span>
              </div>
            </div>

            {/* Bottom Actions: Toggle Ready + Call into Room */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onToggleReadyForScan(item.id)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  item.isReadyForScan
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${item.isReadyForScan ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.isReadyForScan ? 'جاهز للمسح (Ready)' : 'تأكيد الجاهزية'}</span>
              </button>

              <button
                onClick={() => onCallIntoRoom(item)}
                className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>نداء للغرفة</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
