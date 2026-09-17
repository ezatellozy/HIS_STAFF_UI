import React from 'react';
import { ShieldCheck, AlertTriangle, User, HeartPulse, Stethoscope } from 'lucide-react';
import { Patient } from '../../../types/his';
import { OrderPriority, CDSSMockAlert } from '../../../types/clinicalOrdersRequests';
import { useHis } from '../../../context/HisContext';

interface SharedOrderShellProps {
  patient: Patient;
  titleAr: string;
  titleEn: string;
  priority: OrderPriority;
  onPriorityChange: (p: OrderPriority) => void;
  clinicalIndication: string;
  onClinicalIndicationChange: (val: string) => void;
  cdssAlerts?: CDSSMockAlert[];
  onOverrideAlert?: (alertId: string, reason: string) => void;
  children: React.ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmittingDisabled?: boolean;
}

export const SharedOrderShell: React.FC<SharedOrderShellProps> = ({
  patient,
  titleAr,
  titleEn,
  priority,
  onPriorityChange,
  clinicalIndication,
  onClinicalIndicationChange,
  cdssAlerts = [],
  onOverrideAlert,
  children,
  onCancel,
  onSubmit,
  submitLabel = 'اعتماد وتوقيع الأمر (Sign Order)',
  isSubmittingDisabled = false
}) => {
  const { currentStaff } = useHis();

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-white">{titleAr}</h3>
            <span className="text-xs text-teal-400 font-mono">({titleEn})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            نظام إصدار الأوامر السريرية الإلكتروني الموحد (Shared CPOE Order Shell)
          </p>
        </div>

        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Patient Safety Context Bar (Allergies, eGFR, Weight, Location) */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-slate-500 block text-[10px]">المريض:</span>
            <strong className="text-slate-900">{patient.fullNameAr}</strong> ({patient.gender === 'male' ? 'ذكر' : 'أنثى'}، {patient.age} سنة)
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">الملف الطبي (MRN):</span>
            <span className="font-mono font-bold text-slate-800">{patient.mrn}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">الحساسيات الدوائية:</span>
            <span className="px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800 text-[11px]">
              {patient.allergies?.join(', ') || 'لا توجد حساسية معروفة (NKDA)'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">الوزن ووظائف الكلى:</span>
            <span className="font-bold text-slate-800">
              76 كغ • eGFR: 72 mL/min (آمن)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <User className="w-3.5 h-3.5 text-teal-600" />
          <span>الطبيب المصدر: <strong className="text-slate-800">{currentStaff.name}</strong></span>
        </div>
      </div>

      {/* Shared Order Controls (Priority + Clinical Indication) */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        {/* Priority Selector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            أولوية التنفيذ السريري (Priority): *
          </label>
          <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => onPriorityChange('routine')}
              className={`py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                priority === 'routine'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              اعتيادي
            </button>
            <button
              type="button"
              onClick={() => onPriorityChange('urgent')}
              className={`py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                priority === 'urgent'
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              عاجل
            </button>
            <button
              type="button"
              onClick={() => onPriorityChange('asap')}
              className={`py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                priority === 'asap'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              بأسرع وقت
            </button>
            <button
              type="button"
              onClick={() => onPriorityChange('stat')}
              className={`py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                priority === 'stat'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              فوري STAT
            </button>
          </div>
        </div>

        {/* Clinical Indication */}
        <div className="sm:col-span-2">
          <label className="block font-bold text-slate-700 mb-1">
            الداعي السريري والتشخيص المبرر للأمر (Clinical Indication): *
          </label>
          <input
            type="text"
            required
            value={clinicalIndication}
            onChange={e => onClinicalIndicationChange(e.target.value)}
            placeholder="مثال: متلازمة الشريان التاجي الحادة، ارتفاع إنزيمات القلب، استبعاد الانصمام الرئوي..."
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* CDSS Alerts Notification if active */}
      {cdssAlerts.length > 0 && (
        <div className="p-3 bg-amber-50 border-b border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>تنبيهات نظام دعم القرار السريري (Clinical Decision Support - CDSS Alerts):</span>
          </div>

          <div className="space-y-2">
            {cdssAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  alert.severity === 'high_severity_blocking'
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : 'bg-white border-amber-200 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{alert.titleAr}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        alert.severity === 'high_severity_blocking'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {alert.severity === 'high_severity_blocking' ? 'شديد الخطورة' : 'تنبيه تحذيري'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{alert.messageAr}</p>
                </div>

                {alert.canOverride && (
                  <div className="shrink-0 flex items-center gap-2">
                    {alert.isOverridden ? (
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        تم التجاوز بمبرر سريري: {alert.overrideReason}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const r = prompt('أدخل المبرر السريري الإلزامي لتجاوز هذا التنبيه (Clinical Override Reason):');
                          if (r && onOverrideAlert) {
                            onOverrideAlert(alert.id, r);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        تجاوز التنبيه بمبرر (Override)
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type-Specific Composer Injected Body */}
      <div className="p-5">{children}</div>

      {/* Shared Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>التوقيع الإلكتروني للأمر يحفظ في سجل المريض ويُرسل فوراً لقسم التنفيذ المعني.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
          >
            إلغاء الأمر
          </button>

          <button
            type="button"
            disabled={isSubmittingDisabled}
            onClick={onSubmit}
            className={`px-6 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              isSubmittingDisabled
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            <span>{submitLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
