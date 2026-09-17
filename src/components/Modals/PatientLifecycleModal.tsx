import React, { useState } from 'react';
import {
  GitFork,
  X,
  User,
  ShieldCheck,
  Activity,
  Stethoscope,
  FlaskConical,
  Pill,
  Bed,
  Scissors,
  HeartPulse,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  ChevronLeft,
  Printer,
  Calendar,
  Building,
  Phone,
  FileText,
  BadgeCheck,
  ChevronDown,
  Sparkles,
  Zap,
  Plus
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { LifecycleStageKey, SurgeryCase, WardBed } from '../../types/his';

export const PatientLifecycleModal: React.FC = () => {
  const {
    isLifecycleModalOpen,
    closeLifecycleModal,
    selectedLifecyclePatientId,
    patients,
    getPatientLifecycleState,
    wardBeds,
    admitPatientToWard,
    scheduleSurgery,
    admitToIcu,
    dischargePatientFullCycle,
    openStandardsModal,
    playChime
  } = useHis();

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return selectedLifecyclePatientId || patients[0]?.id || '';
  });

  const [selectedStageDetail, setSelectedStageDetail] = useState<LifecycleStageKey | null>(null);

  // Quick Action Sub-modals inside the Lifecycle Modal
  const [activeAction, setActiveAction] = useState<'admit_ward' | 'book_surgery' | 'transfer_icu' | 'discharge' | null>(null);

  // Admission form state
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState<string>('');
  const [admissionDiet, setAdmissionDiet] = useState<WardBed['diet']>('Regular');

  // Surgery form state
  const [surgeryTheatre, setSurgeryTheatre] = useState<SurgeryCase['theatreCode']>('OR-3');
  const [surgeryProcedure, setSurgeryProcedure] = useState<string>('استئصال المرارة بالمنظار (Laparoscopic Cholecystectomy)');
  const [surgerySurgeon, setSurgerySurgeon] = useState<string>('د. كمال الشناوي (استشاري الجراحة العامة)');
  const [surgeryAnesthesia, setSurgeryAnesthesia] = useState<SurgeryCase['anesthesiaType']>('General Endotracheal');

  // ICU form state
  const [icuReason, setIcuReason] = useState<string>('ملاحظة هيموديناميكية حرجة ودعم التنفس');

  // Discharge notes state
  const [dischargeSummary, setDischargeSummary] = useState<string>('استقرار تام بالعلامات الحيوية، صرف الأدوية المنزلية ومراجعة العيادة بعد أسبوع');

  if (!isLifecycleModalOpen) return null;

  const currentPatient = patients.find(p => p.id === (activePatientId || selectedLifecyclePatientId)) || patients[0];
  if (!currentPatient) return null;

  const lifecycleState = getPatientLifecycleState(currentPatient.id);

  // Available beds for admission
  const availableWardBeds = wardBeds.filter(b => b.status === 'available');

  const handleExecuteAdmitWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId) {
      alert('الرجاء اختيار السرير الشاغر أولاً');
      return;
    }
    admitPatientToWard(currentPatient.id, selectedBedId, {
      diagnosis: admissionDiagnosis || 'تنويم داخلي جديد للمتابعة السريرية',
      diet: admissionDiet,
      attendingPhysician: 'د. هدى عبد العزيز (استشاري الباطنة)'
    });
    setActiveAction(null);
    setSelectedBedId('');
    setAdmissionDiagnosis('');
  };

  const handleExecuteScheduleSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleSurgery(currentPatient.id, {
      theatreCode: surgeryTheatre,
      procedureNameAr: surgeryProcedure,
      leadSurgeon: surgerySurgeon,
      anesthesiaType: surgeryAnesthesia,
      asaClassification: 'ASA II'
    });
    setActiveAction(null);
  };

  const handleExecuteTransferIcu = (e: React.FormEvent) => {
    e.preventDefault();
    admitToIcu(currentPatient.id, {
      diagnosis: icuReason,
      reason: icuReason,
      attendingIntensivist: 'د. شريف علام (استشاري الرعاية المركزة)'
    });
    setActiveAction(null);
  };

  const handleExecuteDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    dischargePatientFullCycle(currentPatient.id, {
      dischargeSummary,
      followUpDate: 'خلال 7 أيام'
    });
    setActiveAction(null);
  };

  const stageIcons: Record<LifecycleStageKey, any> = {
    reception: User,
    triage: Activity,
    consultation: Stethoscope,
    diagnostics: FlaskConical,
    pharmacy: Pill,
    ward_ipd: Bed,
    or_surgery: Scissors,
    icu_critical: HeartPulse,
    discharge_clearance: BadgeCheck
  };

  const handlePrintSummary = () => {
    playChime('call');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 border-b border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-inner">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    مسار ودورة المريض السريرية المتكاملة (Integrated Patient Lifecycle)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                    سايكل شاملة مترابطة
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  تتبع رحلة المريض لحظة بلحظة: الاستقبال • الفرز • الكشف • الفحوصات • الصيدلية • الأجنحة • العمليات • العناية • التخريج
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Patient Switcher Dropdown */}
              <div className="relative">
                <select
                  value={activePatientId}
                  onChange={e => {
                    setActivePatientId(e.target.value);
                    setSelectedStageDetail(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullNameAr} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handlePrintSummary}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-xs"
                title="طباعة ملخص دورة المريض الشاملة"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">طباعة المسار</span>
              </button>

              <button
                onClick={closeLifecycleModal}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Patient Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-slate-300">
                المريض: <strong className="text-white text-sm">{currentPatient.fullNameAr}</strong>
              </span>
              <span className="text-slate-400 font-mono">MRN: <strong className="text-teal-400">{currentPatient.mrn}</strong></span>
              <span className="text-slate-400">{currentPatient.age} سنة • {currentPatient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
              <span className="text-slate-400">فصيلة الدم: <strong className="text-rose-400">{currentPatient.bloodType}</strong></span>
              <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 font-medium text-[11px]">
                {currentPatient.insuranceProvider} ({currentPatient.insuranceClass}) - تغطية {currentPatient.insuranceCoveragePercent}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">الموقع السريري اللحظي:</span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                {lifecycleState.activeLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Quick Lifecycle Action Triggers Strip */}
          <div className="bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-50 border border-teal-200/80 p-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-700" />
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  إجراءات تحويل ونقل المريض المباشرة (Direct Lifecycle Transitions):
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                يمكنك نقل الحالة فورياً بين أجنحة التنويم، مسارح العمليات، والعناية المركزة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveAction(activeAction === 'admit_ward' ? null : 'admit_ward');
                  if (availableWardBeds[0]) setSelectedBedId(availableWardBeds[0].id);
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  activeAction === 'admit_ward'
                    ? 'bg-teal-700 text-white border-teal-700 ring-2 ring-teal-500/20'
                    : 'bg-white hover:bg-teal-50/70 text-teal-900 border-teal-300'
                }`}
              >
                <Bed className="w-4 h-4 text-teal-600" />
                <span>تنويم بالأجنحة (IPD)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'book_surgery' ? null : 'book_surgery')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  activeAction === 'book_surgery'
                    ? 'bg-blue-700 text-white border-blue-700 ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-blue-50/70 text-blue-900 border-blue-300'
                }`}
              >
                <Scissors className="w-4 h-4 text-blue-600" />
                <span>حجز مسرح العمليات (OR)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'transfer_icu' ? null : 'transfer_icu')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  activeAction === 'transfer_icu'
                    ? 'bg-red-700 text-white border-red-700 ring-2 ring-red-500/20'
                    : 'bg-white hover:bg-red-50/70 text-red-900 border-red-300'
                }`}
              >
                <HeartPulse className="w-4 h-4 text-red-600" />
                <span>تحويل للعناية المركزة (ICU)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAction(activeAction === 'discharge' ? null : 'discharge')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                  activeAction === 'discharge'
                    ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-white hover:bg-emerald-50/70 text-emerald-900 border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تخريج ومخالصة نفيس</span>
              </button>
            </div>

            {/* Sub-Action Drawer for Inpatient Admission */}
            {activeAction === 'admit_ward' && (
              <form onSubmit={handleExecuteAdmitWard} className="mt-3 p-4 bg-white rounded-xl border border-teal-300 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-teal-900 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-teal-600" /> تسكين وتنويم المريض {currentPatient.fullNameAr} بسرير داخلي
                  </span>
                  <span className="text-[11px] text-teal-700 font-medium">
                    الأسرّة الشاغرة المتاحة: {availableWardBeds.length} سرير
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      اختر السرير الشاغر *
                    </label>
                    <select
                      value={selectedBedId}
                      onChange={e => setSelectedBedId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-teal-500"
                      required
                    >
                      {availableWardBeds.map(bed => (
                        <option key={bed.id} value={bed.id}>
                          {bed.bedNumber} — {bed.wardNameAr}
                        </option>
                      ))}
                      {availableWardBeds.length === 0 && (
                        <option value="">لا توجد أسرّة شاغرة حالياً</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الحمية الغذائية الموصوفة
                    </label>
                    <select
                      value={admissionDiet}
                      onChange={e => setAdmissionDiet(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-teal-500"
                    >
                      <option value="Regular">حمية عادية (Regular Diet)</option>
                      <option value="Diabetic">حمية سكري (Diabetic Diet)</option>
                      <option value="NPO">صيام تام قبل العملية (NPO)</option>
                      <option value="Low Sodium">قليلة الصوديوم لمرضى الضغط</option>
                      <option value="Renal">حمية كلوية خاصة (Renal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      التشخيص وسبب التنويم
                    </label>
                    <input
                      type="text"
                      value={admissionDiagnosis}
                      onChange={e => setAdmissionDiagnosis(e.target.value)}
                      placeholder="مثال: التهاب رئوي حاد بحاجة لمضادات حيوية وريدية"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={availableWardBeds.length === 0}
                    className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    تأكيد التسكين ونقل السايكل للأجنحة
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Action Drawer for OR Surgery */}
            {activeAction === 'book_surgery' && (
              <form onSubmit={handleExecuteScheduleSurgery} className="mt-3 p-4 bg-white rounded-xl border border-blue-300 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-blue-600" /> جدولة عملية جراحية للمريض {currentPatient.fullNameAr}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      مسرح العمليات *
                    </label>
                    <select
                      value={surgeryTheatre}
                      onChange={e => setSurgeryTheatre(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-blue-500"
                    >
                      <option value="OR-1">OR-1 جراحة القلب والصدر</option>
                      <option value="OR-2">OR-2 جراحة العظام والعمود الفقري</option>
                      <option value="OR-3">OR-3 الجراحة العامة والمناظير</option>
                      <option value="OR-4">OR-4 طوارئ الحوادث والإصابات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نوع التخدير المقترح
                    </label>
                    <select
                      value={surgeryAnesthesia}
                      onChange={e => setSurgeryAnesthesia(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-blue-500"
                    >
                      <option value="General Endotracheal">تخدير كلي (General Endotracheal)</option>
                      <option value="Spinal Subarachnoid">تخدير نصفي شوكي (Spinal)</option>
                      <option value="Epidural">تخدير فوق الجافية (Epidural)</option>
                      <option value="MAC Sedation">مهدئ وموضعي (MAC Sedation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الجراح الرئيسي المسؤول
                    </label>
                    <input
                      type="text"
                      value={surgerySurgeon}
                      onChange={e => setSurgerySurgeon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      اسم الإجراء الجراحي
                    </label>
                    <input
                      type="text"
                      value={surgeryProcedure}
                      onChange={e => setSurgeryProcedure(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    تأكيد حجز المسرح وإرسال الحالة لـ OR
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Action Drawer for ICU Transfer */}
            {activeAction === 'transfer_icu' && (
              <form onSubmit={handleExecuteTransferIcu} className="mt-3 p-4 bg-white rounded-xl border border-red-300 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-red-600" /> تصعيد فوري للعناية المركزة (ICU Admission)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    سبب التحويل للعناية المركزة والملاحظات السريرية *
                  </label>
                  <input
                    type="text"
                    value={icuReason}
                    onChange={e => setIcuReason(e.target.value)}
                    placeholder="مثال: صدمة إنتانية بحاجة لمضخات رافعة للضغط وتنفس صناعي"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    تأكيد الإدخال الفوري لوحدة العناية المركزة
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Action Drawer for Discharge */}
            {activeAction === 'discharge' && (
              <form onSubmit={handleExecuteDischarge} className="mt-3 p-4 bg-white rounded-xl border border-emerald-300 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> تخريج المريض وإجراء المخالصة المالية ونفيس
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ملخص الخروج والتعليمات الطبية للمريض
                  </label>
                  <textarea
                    rows={2}
                    value={dischargeSummary}
                    onChange={e => setDischargeSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    إتمام التخريج وإغلاق السايكل الطبية
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 9-Stage Visual Stepper Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>المسار السريري للمراحل التسع (9-Stage Clinical Workflow)</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (انقر على أي مرحلة لاستعراض بياناتها التخصصية)
                </span>
              </h3>

              <button
                onClick={() => openStandardsModal(currentPatient.id, undefined, 'fhir')}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <span>استعراض ملف FHIR للمريض</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lifecycleState.steps.map((step, index) => {
                const IconComponent = stageIcons[step.key] || Activity;
                const isSelected = selectedStageDetail === step.key;
                const isCompleted = step.status === 'completed';
                const isInProgress = step.status === 'in_progress';
                const isPending = step.status === 'pending';
                const isNotReq = step.status === 'not_required';

                return (
                  <div
                    key={step.key}
                    onClick={() => setSelectedStageDetail(isSelected ? null : step.key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-md'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                        : isInProgress
                        ? 'border-blue-400 bg-blue-50/30 hover:border-blue-500 ring-1 ring-blue-400/30'
                        : isPending
                        ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                        : 'border-slate-200 bg-slate-50/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isInProgress
                              ? 'bg-blue-600 text-white animate-pulse'
                              : isPending
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-400 font-mono">
                              #{index + 1}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs">
                              {step.titleAr}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-400 block" dir="ltr">
                            {step.titleEn}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCompleted
                          ? 'مكتمل'
                          : isInProgress
                          ? 'جاري الآن'
                          : isPending
                          ? 'بانتظار الإجراء'
                          : 'غير مطلوب'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
                      {step.descriptionAr}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{step.timestamp || 'غير محدد'}</span>
                      {step.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                          {step.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Details Expanded Box */}
          {selectedStageDetail && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-700" />
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    تفاصيل وبيانات المحطة: {lifecycleState.steps.find(s => s.key === selectedStageDetail)?.titleAr}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedStageDetail(null)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  إغلاق التفاصيل
                </button>
              </div>

              {/* Specific Stage Content */}
              {selectedStageDetail === 'reception' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">رقم الهوية الوطنية</span>
                    <strong className="text-slate-900 font-mono">{currentPatient.nationalId}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">جهة التأمين</span>
                    <strong className="text-blue-700">{currentPatient.insuranceProvider}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">رقم البوليصة</span>
                    <strong className="text-slate-900 font-mono">{currentPatient.insurancePolicyNo}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">الحساسيات المعروفة</span>
                    <strong className="text-red-600">{(currentPatient.allergies || []).join('، ') || 'لا توجد'}</strong>
                  </div>
                </div>
              )}

              {selectedStageDetail === 'triage' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ضغط الدم</span>
                      <strong className="font-mono text-slate-900">
                        {lifecycleState.activeAppointment?.vitals?.bpSystolic || 120}/
                        {lifecycleState.activeAppointment?.vitals?.bpDiastolic || 80}
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">النبض</span>
                      <strong className="font-mono text-slate-900">
                        {lifecycleState.activeAppointment?.vitals?.pulseRate || 76} bpm
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">الأكسجين</span>
                      <strong className="font-mono text-emerald-700">
                        {lifecycleState.activeAppointment?.vitals?.spo2 || 98}%
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">الحرارة</span>
                      <strong className="font-mono text-slate-900">
                        {lifecycleState.activeAppointment?.vitals?.temp || 37.0}°C
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">الإنذار NEWS2</span>
                      <strong className="font-mono text-teal-700">
                        {lifecycleState.activeAppointment?.vitals?.news2Score || 0}
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">درجة الألم</span>
                      <strong className="font-mono text-slate-900">
                        {lifecycleState.activeAppointment?.vitals?.painScore || 2}/10
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {selectedStageDetail === 'consultation' && (
                <div className="space-y-2 text-xs">
                  {lifecycleState.latestConsultation ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">الشكوى والتاريخ المرضي (S)</span>
                        <p className="text-slate-800">{lifecycleState.latestConsultation.subjective}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">الفحص السريري (O)</span>
                        <p className="text-slate-800">{lifecycleState.latestConsultation.objective}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">التقييم والتشخيص (A)</span>
                        <p className="text-slate-800 font-semibold">{lifecycleState.latestConsultation.assessment}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">الخطة العلاجية والتصريف (P)</span>
                        <p className="text-slate-800">{lifecycleState.latestConsultation.plan}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">لا يوجد سجل كشف محفوظ بعد لهذا المريض.</p>
                  )}
                </div>
              )}

              {selectedStageDetail === 'ward_ipd' && (
                <div className="text-xs">
                  {lifecycleState.activeWardBed ? (
                    <div className="p-3 bg-white rounded-xl border border-teal-300 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong className="text-sm text-slate-900 block font-mono">
                          سرير {lifecycleState.activeWardBed.bedNumber} — {lifecycleState.activeWardBed.wardNameAr}
                        </strong>
                        <span className="text-slate-500 text-[11px]">
                          الطبيب المعالج: {lifecycleState.activeWardBed.attendingPhysician} • تاريخ الدخول: {lifecycleState.activeWardBed.admitDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold">
                          حمية: {lifecycleState.activeWardBed.diet || 'Regular'}
                        </span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold">
                          سقوط: {lifecycleState.activeWardBed.fallRisk || 'منخفض'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">المريض غير منوم حالياً في أجنحة المستشفى.</p>
                  )}
                </div>
              )}

              {selectedStageDetail === 'or_surgery' && (
                <div className="text-xs">
                  {lifecycleState.activeSurgeryCase ? (
                    <div className="p-3 bg-white rounded-xl border border-blue-300 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong className="text-sm text-slate-900 block">
                          {lifecycleState.activeSurgeryCase.procedureNameAr}
                        </strong>
                        <span className="text-slate-500 text-[11px]">
                          المسرح: {lifecycleState.activeSurgeryCase.theatreNo} • الجراح: {lifecycleState.activeSurgeryCase.leadSurgeon}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-[11px]">
                          الحالة: {lifecycleState.activeSurgeryCase.status}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[11px]">
                          تخدير: {lifecycleState.activeSurgeryCase.anesthesiaType}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">لا توجد جراحة مجدولة حالياً.</p>
                  )}
                </div>
              )}

              {selectedStageDetail === 'icu_critical' && (
                <div className="text-xs">
                  {lifecycleState.activeIcuBed ? (
                    <div className="p-3 bg-white rounded-xl border border-red-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-red-900 font-mono">
                          سرير العناية {lifecycleState.activeIcuBed.bedNo}
                        </strong>
                        <span className="text-red-700 font-bold text-[11px]">
                          SOFA: {lifecycleState.activeIcuBed.sofaScore} | GCS: {lifecycleState.activeIcuBed.gcsScore}/15
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        التشخيص: {lifecycleState.activeIcuBed.diagnosis} • الاستشاري: {lifecycleState.activeIcuBed.attendingIntensivist}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500">المريض لا يتواجد بالعناية المركزة حالياً.</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100/80 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <BadgeCheck className="w-4 h-4 text-teal-600" />
            <span>نظام السايكل المترابطة متوافق مع معايير CBAHI و HL7 FHIR R4 و NPHIES</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeLifecycleModal}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              إغلاق مسار المريض
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
