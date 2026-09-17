import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Plus,
  Play,
  Pause,
  AlertCircle,
  UserCheck,
  Eye,
  Check,
  Sparkles,
  Info,
  Sliders,
  QrCode,
  Scan,
  Package,
  X
} from 'lucide-react';
import {
  ActiveMedicationItem,
  AdministrationSlot,
  AdministrationStatus
} from '../../../types/clinicalMedicationsMar';

interface EmarGridViewProps {
  medications: ActiveMedicationItem[];
  onOpenSlotAction: (med: ActiveMedicationItem, slot: AdministrationSlot) => void;
  onAdministerPrn: (med: ActiveMedicationItem) => void;
}

export const EmarGridView: React.FC<EmarGridViewProps> = ({
  medications,
  onOpenSlotAction,
  onAdministerPrn
}) => {
  const [selectedDate, setSelectedDate] = useState('اليوم (Today)');
  const [showBcmaSimModal, setShowBcmaSimModal] = useState(false);
  const [bcmaStep, setBcmaStep] = useState<'scan_patient' | 'scan_med' | 'verified'>('scan_patient');

  // Split into Scheduled vs PRN vs Continuous
  const scheduledMeds = medications.filter(m => !m.isPrn && !m.isContinuousInfusion);
  const prnMeds = medications.filter(m => m.isPrn);

  // Dynamic MAR Schedule: Order-Schedule Driven (Point 8)
  // Derive all unique scheduled slot times across current active orders
  const dynamicTimeColumns = React.useMemo(() => {
    const times = new Set<string>();
    scheduledMeds.forEach(m => {
      m.scheduleSlots?.forEach(s => {
        if (s.scheduledTime) times.add(s.scheduledTime);
      });
    });
    const sorted = Array.from(times).sort((a, b) => a.localeCompare(b));
    return sorted.length > 0 ? sorted : ['06:00', '10:00', '14:00', '18:00', '22:00'];
  }, [scheduledMeds]);

  const renderSlotCell = (med: ActiveMedicationItem, timeStr: string) => {
    const slot = med.scheduleSlots?.find(s => s.scheduledTime === timeStr);

    if (!slot) {
      return (
        <td key={timeStr} className="p-2 text-center text-slate-300 font-mono text-xs border-r border-slate-100">
          -
        </td>
      );
    }

    const isAdm = slot.status === 'administered';
    const isDue = slot.status === 'due';
    const isOverdue = slot.status === 'overdue';
    const isHeld = slot.status === 'held';
    const isRefused = slot.status === 'refused';
    const isMissed = slot.status === 'missed' || slot.status === 'missed_omitted';
    const isPartial = slot.status === 'partial_dose';
    const isOmitted = slot.status === 'omitted_not_done';
    const isRescheduled = slot.status === 'rescheduled';

    return (
      <td
        key={timeStr}
        className="p-1.5 text-center align-middle border-r border-slate-100"
      >
        <button
          onClick={() => onOpenSlotAction(med, slot)}
          className={`w-full p-2 rounded-xl text-right transition-all cursor-pointer select-none text-xs border relative group ${
            isAdm
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
              : isDue
              ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400/30 hover:bg-blue-100'
              : isOverdue
              ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/40 hover:bg-rose-100'
              : isHeld
              ? 'bg-purple-50 border-purple-300 text-purple-950 hover:bg-purple-100'
              : isRefused
              ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
              : isPartial
              ? 'bg-orange-50 border-orange-300 text-orange-950 hover:bg-orange-100'
              : isMissed || isOmitted
              ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              : isRescheduled
              ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Status Icon & Time */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-mono font-bold text-[11px]">
              {slot.scheduledTime}
            </span>

            {isAdm && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            {isDue && <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-pulse" />}
            {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
            {isHeld && <Pause className="w-3 h-3 text-purple-600 shrink-0" />}
            {isRefused && <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />}
            {isPartial && <Sliders className="w-3 h-3 text-orange-600 shrink-0" />}
          </div>

          {/* Status Label & Details */}
          {isAdm && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-800 block truncate">
                تم: {slot.administeredBy?.split(' ')[0]}
              </span>
              <span className="text-[9px] text-emerald-700 font-mono block">
                {slot.administeredDose}
              </span>
              {slot.isDualVerified && (
                <span className="text-[9px] text-purple-700 font-bold block">
                  ✓✓ تدقيق سريري
                </span>
              )}
            </div>
          )}

          {isDue && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-blue-700 block">
                مستحق الآن (Due)
              </span>
              <span className="text-[9px] text-blue-600 block">انقر للتوثيق</span>
            </div>
          )}

          {isOverdue && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-rose-700 block">
                متأخر OVERDUE
              </span>
              <span className="text-[9px] text-rose-600 block">توثيق فوري</span>
            </div>
          )}

          {isHeld && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-purple-800 block truncate">
                معلق: {slot.nonAdminReason === 'sbp_low' ? 'انخفاض الضغط' : 'أمر طبي'}
              </span>
              <span className="text-[9px] text-purple-600 block truncate">
                {slot.nonAdminComment || 'مراجعة المعايير'}
              </span>
            </div>
          )}

          {isRefused && (
            <span className="text-[10px] font-bold text-amber-800 block">
              رفض المريض
            </span>
          )}

          {isPartial && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-orange-800 block">
                جرعة جزئية
              </span>
              <span className="text-[9px] text-orange-700 font-mono block">
                {slot.administeredDose}
              </span>
            </div>
          )}

          {(isMissed || isOmitted) && (
            <span className="text-[10px] font-bold text-slate-600 block">
              جرعة فائتة / ملغاة
            </span>
          )}

          {isRescheduled && (
            <span className="text-[10px] font-bold text-indigo-700 block">
              أعيدت جدولتها
            </span>
          )}
        </button>
      </td>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. eMAR Schedule Status Legend & Quick Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">مفتاح الحالات السريرية في eMAR:</span>
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>تم الإعطاء (Administered)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>مستحق الآن (Due)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>متأخر (Overdue)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Pause className="w-3 h-3 text-purple-600" />
              <span>معلق (Held)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-orange-600" />
              <span>جرعة جزئية (Partial)</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>رفض المريض (Refused)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setBcmaStep('scan_patient');
              setShowBcmaSimModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5 text-teal-400" />
            <span>محاكاة مسح الباركود (Mock BCMA)</span>
          </button>

          <span className="px-3 py-1 bg-slate-100 rounded-xl text-slate-800 font-mono text-xs font-bold border border-slate-200">
            {selectedDate} • جدول مواعيد الأوامر (Order-Driven)
          </span>
        </div>
      </div>

      {/* 2. Main 24-Hour Scheduled Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-700" />
            <h4 className="font-extrabold text-sm text-slate-900">
              الأدوية المجدولة بانتظام (Scheduled Inpatient Medications)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            {scheduledMeds.length} أدوية مجدولة • {dynamicTimeColumns.length} فترات زمنية
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-4 min-w-64">بيانات الدواء والجرعة (Medication & Order)</th>
                {dynamicTimeColumns.map(t => (
                  <th key={t} className="py-3 px-3 text-center min-w-28 font-mono border-r border-slate-200">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledMeds.map(med => {
                return (
                  <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Medication info column */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-slate-900 text-xs font-black">
                            {med.genericName}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            ({med.brandName})
                          </span>
                          {med.isHighAlert && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              High-Alert
                            </span>
                          )}
                          {med.pharmacySupplyContext && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                              <Package className="w-2.5 h-2.5 text-slate-500" />
                              <span>{med.pharmacySupplyContext.locationLabelAr}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1 font-mono">
                          <strong className="text-slate-800">{med.orderedDose}</strong>
                          <span>•</span>
                          <span>{med.route}</span>
                          <span>•</span>
                          <span>{med.frequency}</span>
                        </div>

                        {med.holdParameters && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                            ⚠️ {med.holdParameters}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Time slots */}
                    {dynamicTimeColumns.map(t => renderSlotCell(med, t))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PRN (As Needed) Medications Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-700" />
            <h4 className="font-extrabold text-sm text-slate-900">
              أدوية اللزوم والمسكنات (PRN Medications & Pain Protocols)
            </h4>
          </div>
          <span className="text-xs text-blue-800 font-bold">
            مراقبة فترات الإعطاء الدنيا وإعادة التقييم
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {prnMeds.map(med => {
            const lastSlot = med.scheduleSlots?.filter(s => s.status === 'administered').slice(-1)[0];

            return (
              <div
                key={med.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-extrabold text-slate-900">
                        {med.genericName}
                      </strong>
                      <span className="text-xs text-slate-500">({med.brandName})</span>
                    </div>
                    {med.isHighAlert && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        High-Alert
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 font-mono space-x-2 space-x-reverse mb-2">
                    <span className="font-bold text-slate-900">{med.orderedDose}</span>
                    <span>•</span>
                    <span>{med.route}</span>
                    <span>•</span>
                    <span>{med.frequency}</span>
                  </div>

                  <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    <strong>الداعي السريري:</strong> {med.indication}
                  </p>

                  {/* Last administration & Eligibility */}
                  <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">آخر إعطاء مسجل:</span>
                      <strong className="text-slate-800 font-mono">
                        {lastSlot ? `${lastSlot.scheduledTime} (${lastSlot.administeredDose})` : 'لم يعط اليوم'}
                      </strong>
                    </div>

                    {lastSlot?.responseAssessment && (
                      <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-950">
                        <span className="font-bold block">تقييم الفاعلية والألم:</span>
                        <div className="flex items-center gap-3 mt-1 font-mono">
                          <span>قبل: <strong>{lastSlot.responseAssessment.painScorePre}/10</strong></span>
                          <span>→</span>
                          <span>بعد: <strong className="text-emerald-700">{lastSlot.responseAssessment.painScorePost}/10</strong></span>
                        </div>
                        <span className="text-[10px] text-teal-800 block mt-1">
                          {lastSlot.responseAssessment.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متاح للإعطاء السريري الآن</span>
                  </span>

                  <button
                    onClick={() => onAdministerPrn(med)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>إعطاء جرعة PRN الآن</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock BCMA Modal */}
      {showBcmaSimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-sm">محاكاة التحقق من الباركود (Mock BCMA Capability)</h4>
              </div>
              <button
                onClick={() => setShowBcmaSimModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <strong>تنويه محاكاة سريرية (Mock Simulation):</strong> هذه الواجهة توضح تدفق التحقق الثنائي عبر الباركود لحقوق الإعطاء الخمسة، بدون ادعاء وجود ماسح أجهزة فعلي أو بروتوكول جهاز حقيقي.
              </div>

              {/* Steps Progress */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className={`flex items-center gap-1.5 font-bold ${bcmaStep === 'scan_patient' ? 'text-teal-700' : 'text-slate-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">1</span>
                  <span>إسوارة المريض</span>
                </div>
                <div className={`flex items-center gap-1.5 font-bold ${bcmaStep === 'scan_med' ? 'text-teal-700' : 'text-slate-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">2</span>
                  <span>باركود الدواء</span>
                </div>
                <div className={`flex items-center gap-1.5 font-bold ${bcmaStep === 'verified' ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">3</span>
                  <span>مطابقة الحقوق الخمسة</span>
                </div>
              </div>

              {bcmaStep === 'scan_patient' && (
                <div className="space-y-4 py-2 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900">مسح باركود إسوارة معصم المريض</h5>
                    <p className="text-slate-500 text-[11px] mt-1">التحقق من الهوية (Patient ID Verification): أحمد محمود الشريف (MRN-902441)</p>
                  </div>
                  <button
                    onClick={() => setBcmaStep('scan_med')}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    محاكاة مسح الإسوارة بنجاح (Simulate Wristband Scan)
                  </button>
                </div>
              )}

              {bcmaStep === 'scan_med' && (
                <div className="space-y-4 py-2 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mx-auto">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900">مسح باركود جرعة الدواء الفردية (Unit-Dose)</h5>
                    <p className="text-slate-500 text-[11px] mt-1">التحقق من الدواء والتركيز وصلاحية التشغيلة (Lot/Expiry Verification)</p>
                  </div>
                  <button
                    onClick={() => setBcmaStep('verified')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    محاكاة مسح الدواء بنجاح (Simulate Medication Barcode Scan)
                  </button>
                </div>
              )}

              {bcmaStep === 'verified' && (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>تم التحقق الإيجابي التام من الحقوق الخمسة (5-Rights Verified)</span>
                    </div>
                    <ul className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 font-medium">
                      <li>✓ المريض الصحيح (Right Patient)</li>
                      <li>✓ الدواء الصحيح (Right Medication)</li>
                      <li>✓ الجرعة الصحيحة (Right Dose)</li>
                      <li>✓ المسار الصحيح (Right Route)</li>
                      <li>✓ التوقيت الصحيح (Right Time)</li>
                      <li>✓ التوثيق المسبق (Right Documentation)</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowBcmaSimModal(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
                  >
                    إغلاق والعودة لـ eMAR
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
