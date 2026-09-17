import React from 'react';
import {
  X,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  User,
  Clock,
  MapPin,
  Stethoscope,
  Activity,
  CheckCircle2,
  FileText,
  HeartPulse,
  ListTodo,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useHis } from '../../context/HisContext';

export interface QuickPreviewPatientData {
  patientId: string;
  patientName: string;
  mrn: string;
  age?: number;
  gender?: 'male' | 'female' | string;
  encounterId?: string;
  encounterType?: string; // e.g. "طوارئ حوادث (ER)", "عناية مركزة (ICU)", "تنويم باطنة (IPD)", "جراحة مسرح OR-1"
  currentLocation: string; // e.g. "سرير ER-03", "ICU Bed 02", "غرفة 302-A"
  boardState: {
    label: string;
    variant?: 'urgent' | 'warning' | 'info' | 'success' | 'neutral';
  };
  responsibleTeam: {
    primaryDoctor?: string;
    secondaryDoctor?: string;
    anesthesiologist?: string;
    primaryNurse?: string;
    specialty?: string;
  };
  criticalAllergies?: string[];
  alerts?: string[];
  isolationPrecaution?: string;
  fallRisk?: 'high' | 'moderate' | 'low';
  timestamps?: {
    label: string;
    value: string;
    elapsed?: string;
  }[];
  openWorkItemsCount?: number;
  pendingConsults?: {
    specialty: string;
    status: 'pending' | 'accepted' | 'completed';
    time?: string;
  }[];
  keyInvestigationsSummary?: string;
  dispositionContext?: string;
  respiratoryOrDeviceSummary?: string;
  infusionSummary?: string;
  linesDrainsSummary?: string;
  dischargeReadinessSummary?: string;
  originBoardType: 'er' | 'icu' | 'ward' | 'or';
  originContext?: Record<string, any>;
}

interface SharedPatientQuickPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuickPreviewPatientData | null;
}

export const SharedPatientQuickPreview: React.FC<SharedPatientQuickPreviewProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { openPatientWorkspace, setActiveWorkArea } = useHis();

  if (!isOpen || !data) return null;

  const handleOpenWorkspace = () => {
    openPatientWorkspace(data.patientId, {
      originWorkArea: data.originBoardType === 'ward' ? 'ipd' : data.originBoardType,
      originType: 'unit_board',
      boardType: data.originBoardType,
      selectedPatientId: data.patientId,
      ...(data.originContext || {})
    });
    onClose();
  };

  const handleGoToMyWork = () => {
    setActiveWorkArea('my_work');
    onClose();
  };

  const getBadgeClass = (variant?: 'urgent' | 'warning' | 'info' | 'success' | 'neutral') => {
    switch (variant) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'info':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 pl-0 sm:pl-10 max-w-full flex">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl border-r border-slate-200 flex flex-col transform transition-transform animate-in slide-in-from-left duration-250">
          
          {/* Drawer Header: Patient Safety Context */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-xs font-bold border border-teal-500/30">
                  MRN: {data.mrn}
                </span>
                {data.encounterId && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                    {data.encounterId}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getBadgeClass(data.boardState.variant)}`}>
                  {data.boardState.label}
                </span>
              </div>

              <h2 id="slide-over-title" className="text-lg sm:text-xl font-black text-white truncate">
                {data.patientName}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                {data.gender && <span>{data.gender === 'male' ? 'ذكر' : data.gender === 'female' ? 'أنثى' : data.gender}</span>}
                {data.age && <span>• {data.age} سنة</span>}
                <span className="flex items-center gap-1 text-teal-300 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.currentLocation}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Critical Alerts & Safety Precautions Bar */}
          {((data.criticalAllergies && data.criticalAllergies.length > 0) ||
            data.isolationPrecaution ||
            (data.alerts && data.alerts.length > 0) ||
            data.fallRisk === 'high') && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 space-y-1.5 shrink-0">
              {data.isolationPrecaution && (
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>احتياطات عزل: {data.isolationPrecaution}</span>
                </div>
              )}
              {data.criticalAllergies && data.criticalAllergies.length > 0 && (
                <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>حساسية حرجة: {data.criticalAllergies.join('، ')}</span>
                </div>
              )}
              {data.alerts && data.alerts.map((al, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{al}</span>
                </div>
              ))}
              {data.fallRisk === 'high' && (
                <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-[11px]">
                  <span>⚠️ خطورة سقوط مرتفعة (Morse Fall Risk High)</span>
                </div>
              )}
            </div>
          )}

          {/* Drawer Body: Operational Context */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-sm">
            
            {/* Context Note banner: Quick Preview != mini-EHR */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
              <span className="font-medium text-[11px]">
                معاينة تشغيلية سريعة • التفاصيل الكاملة داخل الملف السريري
              </span>
              <button
                onClick={handleOpenWorkspace}
                className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
              >
                فتح الملف السريري
                <ArrowRight className="w-3 h-3 rotate-180" />
              </button>
            </div>

            {/* Responsible Team Block */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                الفريق الطبي المسؤول
              </h3>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الطبيب المعالج / الجراح:</span>
                  <span className="font-bold text-slate-800">{data.responsibleTeam.primaryDoctor || 'غير محدد'}</span>
                </div>
                {data.responsibleTeam.secondaryDoctor && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">الطبيب المشارك / التخدير:</span>
                    <span className="font-medium text-slate-700">{data.responsibleTeam.secondaryDoctor}</span>
                  </div>
                )}
                {data.responsibleTeam.anesthesiologist && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">استشاري التخدير:</span>
                    <span className="font-medium text-slate-700">{data.responsibleTeam.anesthesiologist}</span>
                  </div>
                )}
                {data.responsibleTeam.primaryNurse && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">التمريض المسؤول:</span>
                    <span className="font-medium text-slate-700">{data.responsibleTeam.primaryNurse}</span>
                  </div>
                )}
                {data.responsibleTeam.specialty && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">التخصص:</span>
                    <span className="text-slate-700">{data.responsibleTeam.specialty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps & Elapsed Operational Flow */}
            {data.timestamps && data.timestamps.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  أزمنة التدفق التشغيلي
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {data.timestamps.map((ts, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500">{ts.label}</div>
                      <div className="font-bold text-slate-800 mt-0.5">{ts.value}</div>
                      {ts.elapsed && (
                        <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          منذ: {ts.elapsed}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Consultations Indicator (Not duplicate tasks) */}
            {data.pendingConsults && data.pendingConsults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    الاستشارات المعلقة
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                    {data.pendingConsults.length}
                  </span>
                </h3>
                <div className="space-y-1.5">
                  {data.pendingConsults.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs">
                      <span className="font-bold text-slate-800">{c.specialty}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        c.status === 'accepted' ? 'bg-sky-100 text-sky-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.status === 'pending' ? 'قيد الانتظار' : c.status === 'accepted' ? 'تم القبول' : 'مكتملة'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Investigation Status */}
            {data.keyInvestigationsSummary && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  حالة الفحوصات والتشخيص
                </h3>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                  {data.keyInvestigationsSummary}
                </div>
              </div>
            )}

            {/* Department Specific Operational Summaries (ICU / Wards / OR) */}
            {(data.respiratoryOrDeviceSummary || data.infusionSummary || data.linesDrainsSummary) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  أجهزة ودعم الرعاية الحرجة
                </h3>
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  {data.respiratoryOrDeviceSummary && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">التنفس والدعم التنفسي:</span>
                      <span className="font-bold text-slate-800">{data.respiratoryOrDeviceSummary}</span>
                    </div>
                  )}
                  {data.infusionSummary && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">المضخات الوريدية الفعالة:</span>
                      <span className="font-medium text-slate-700">{data.infusionSummary}</span>
                    </div>
                  )}
                  {data.linesDrainsSummary && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">القساطر والأنابيب (Lines/Drains):</span>
                      <span className="text-slate-700 font-mono text-[11px]">{data.linesDrainsSummary}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ward Discharge Readiness / OR Turnover / Disposition Context */}
            {(data.dispositionContext || data.dischargeReadinessSummary) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  مسار الانتقال والتخريج
                </h3>
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  {data.dispositionContext && (
                    <div className="font-semibold">{data.dispositionContext}</div>
                  )}
                  {data.dischargeReadinessSummary && (
                    <div className="text-[11px] text-emerald-800">{data.dischargeReadinessSummary}</div>
                  )}
                </div>
              </div>
            )}

            {/* Open Work Items Indicator (Attention indicator ≠ work item duplicate) */}
            {data.openWorkItemsCount !== undefined && data.openWorkItemsCount > 0 && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <ListTodo className="w-4 h-4 text-amber-600" />
                  <span>يوجد {data.openWorkItemsCount} مهام سريرية بحاجة لإجراء</span>
                </div>
                <button
                  onClick={handleGoToMyWork}
                  className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  فتح My Work ➔
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleOpenWorkspace}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>فتح الملف السريري الكامل (Patient Workspace)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
