import React, { useState } from 'react';
import {
  GitFork,
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

export const PatientLifecycleView: React.FC = () => {
  const {
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

  // Quick Action Sub-modals inside the Lifecycle View
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

  const currentPatient = patients.find(p => p.id === (activePatientId || selectedLifecyclePatientId)) || patients[0];
  if (!currentPatient) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <p className="text-slate-500">لا يوجد مرضى مسجلين حالياً لعرض دورة المريض.</p>
      </div>
    );
  }

  const lifecycleState = getPatientLifecycleState(currentPatient.id);
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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-inner">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  مسار ودورة المريض السريرية المتكاملة (Integrated Patient Lifecycle)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  سايكل شاملة مترابطة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                تتبع رحلة المريض لحظة بلحظة: الاستقبال • الفرز • الكشف • الفحوصات • الصيدلية • الأجنحة • العمليات • العناية • التخريج
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Patient Selector Dropdown */}
            <div className="relative">
              <select
                value={activePatientId}
                onChange={e => {
                  setActivePatientId(e.target.value);
                  setSelectedStageDetail(null);
                }}
                className="appearance-none bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold py-2.5 pl-9 pr-3.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-800 text-white">
                    {p.fullNameAr} ({p.mrn})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-teal-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handlePrintSummary}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>طباعة تقرير السايكل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Lifecycle Body */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Active Patient Identity & Status Banner */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              {currentPatient.fullNameAr.split(' ')[0][0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentPatient.fullNameAr}
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {currentPatient.mrn}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                  {currentPatient.gender === 'male' ? 'ذكر' : 'أنثى'} • {currentPatient.age} سنة
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <span>الهوية: <strong className="font-mono text-slate-700">{currentPatient.nationalId}</strong></span>
                <span>•</span>
                <span>فصيلة الدم: <strong className="font-mono text-red-600">{currentPatient.bloodType}</strong></span>
                <span>•</span>
                <span>التأمين: <strong className="text-slate-700">{currentPatient.insuranceProvider} ({currentPatient.insuranceClass})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right sm:pl-4 sm:border-l border-slate-200">
              <span className="text-[11px] text-slate-400 block font-semibold">الموقع والمرحلة الحالية:</span>
              <strong className="text-teal-700 text-sm font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                {lifecycleState.activeLocation}
              </strong>
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveAction(activeAction === 'admit_ward' ? null : 'admit_ward')}
                className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + تنويم بجناح
              </button>
              <button
                onClick={() => setActiveAction(activeAction === 'book_surgery' ? null : 'book_surgery')}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + حجز عملية
              </button>
              <button
                onClick={() => setActiveAction(activeAction === 'transfer_icu' ? null : 'transfer_icu')}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                + تصعيد عناية
              </button>
              <button
                onClick={() => setActiveAction(activeAction === 'discharge' ? null : 'discharge')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                مخالصة وتخريج
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Forms Drawer */}
        {activeAction && (
          <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/50 space-y-4 animate-in fade-in slide-in-from-top-2">
            {activeAction === 'admit_ward' && (
              <form onSubmit={handleExecuteAdmitWard} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                  <h4 className="font-bold text-sm text-teal-950 flex items-center gap-2">
                    <Bed className="w-4 h-4 text-teal-700" />
                    تنويم المريض في الأجنحة الداخلية (Inpatient Ward Admission)
                  </h4>
                  <button type="button" onClick={() => setActiveAction(null)} className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
                    إلغاء
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">السرير الشاغر:</label>
                    <select
                      value={selectedBedId}
                      onChange={e => setSelectedBedId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-teal-500"
                      required
                    >
                      <option value="">-- اختر السرير الشاغر --</option>
                      {availableWardBeds.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.wardNameAr} • سرير {b.bedNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تشخيص الدخول:</label>
                    <input
                      type="text"
                      placeholder="مثال: التهاب شعبي حاد، ذبحة صدرية غير مستقرة"
                      value={admissionDiagnosis}
                      onChange={e => setAdmissionDiagnosis(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">النظام الغذائي:</label>
                    <select
                      value={admissionDiet}
                      onChange={e => setAdmissionDiet(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-teal-500"
                    >
                      <option value="Regular">وجبة عادية (Regular)</option>
                      <option value="Diabetic">وجبة سكري (Diabetic)</option>
                      <option value="Low Sodium">قليلة الملح (Low Sodium)</option>
                      <option value="NPO">صيام تام (NPO)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  تأكيد التسكين ونقل المريض للجناح
                </button>
              </form>
            )}

            {activeAction === 'book_surgery' && (
              <form onSubmit={handleExecuteScheduleSurgery} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-blue-700" />
                    حجز وتسكين بمواعيد العمليات الجراحية (Operating Room Booking)
                  </h4>
                  <button type="button" onClick={() => setActiveAction(null)} className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
                    إلغاء
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المسرح الجراحي:</label>
                    <select
                      value={surgeryTheatre}
                      onChange={e => setSurgeryTheatre(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-blue-500"
                    >
                      <option value="OR-1">مسرح العمليات 1 (جراحة عامة ومناظير)</option>
                      <option value="OR-2">مسرح العمليات 2 (جراحة العظام والمفاصل)</option>
                      <option value="OR-3">مسرح العمليات 3 (جراحة القلب والصدر)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الإجراء الجراحي:</label>
                    <input
                      type="text"
                      value={surgeryProcedure}
                      onChange={e => setSurgeryProcedure(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نوع التخدير:</label>
                    <select
                      value={surgeryAnesthesia}
                      onChange={e => setSurgeryAnesthesia(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-blue-500"
                    >
                      <option value="General Endotracheal">تخدير عام كلي (General)</option>
                      <option value="Spinal">تخدير نصفي شوكي (Spinal)</option>
                      <option value="Local">تخدير موضعي (Local)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  تأكيد حجز العملية ونقل الحالة
                </button>
              </form>
            )}

            {activeAction === 'transfer_icu' && (
              <form onSubmit={handleExecuteTransferIcu} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-200">
                  <h4 className="font-bold text-sm text-red-950 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-red-700" />
                    تصعيد الحالة لقسم العناية المركزة (ICU Escalation)
                  </h4>
                  <button type="button" onClick={() => setActiveAction(null)} className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
                    إلغاء
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سبب التحويل الحرج والملاحظة:</label>
                  <input
                    type="text"
                    value={icuReason}
                    onChange={e => setIcuReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  تصعيد الحالة وتأمين سرير العناية
                </button>
              </form>
            )}

            {activeAction === 'discharge' && (
              <form onSubmit={handleExecuteDischarge} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    المخالصة الطبية والمالية والتخريج (Discharge & Clearance)
                  </h4>
                  <button type="button" onClick={() => setActiveAction(null)} className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
                    إلغاء
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملخص التخريج والتعليمات المنزلية:</label>
                  <textarea
                    rows={2}
                    value={dischargeSummary}
                    onChange={e => setDischargeSummary(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  إتمام التخريج واعتماد المخالصة
                </button>
              </form>
            )}
          </div>
        )}

        {/* 9-Stage Progress Timeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              المحطات التسع لدورة المريض السريرية (Clinical Lifecycle Stages)
            </h4>
            <span className="text-xs text-slate-500">اضغط على أي مرحلة لعرض التفاصيل السريرية</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
            {lifecycleState.steps.map((step, idx) => {
              const IconComponent = stageIcons[step.key] || Activity;
              const isSelected = selectedStageDetail === step.key;
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in_progress';

              return (
                <div
                  key={step.key}
                  onClick={() => setSelectedStageDetail(isSelected ? null : step.key)}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-500/20'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                      : isInProgress
                      ? 'border-teal-400 bg-teal-50/80 shadow-xs ring-1 ring-teal-400/40'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono">#{idx + 1}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isInProgress ? (
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                    <div className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center mb-1.5 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isInProgress
                        ? 'bg-teal-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-tight">
                      {step.titleAr.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {step.badge || step.titleAr.split(' ').slice(1).join(' ')}
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] font-mono">
                    {isCompleted ? (
                      <span className="text-emerald-700 font-bold">منجز</span>
                    ) : isInProgress ? (
                      <span className="text-teal-700 font-bold">نشط الآن</span>
                    ) : (
                      <span className="text-slate-400">قيد الانتظار</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Card */}
        {selectedStageDetail && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in">
            {(() => {
              const currentStep = lifecycleState.steps.find(s => s.key === selectedStageDetail);
              if (!currentStep) return null;

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{currentStep.titleAr}</strong>
                      <span className="text-xs text-slate-400 font-mono">({currentStep.titleEn})</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      currentStep.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentStep.status === 'in_progress'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {currentStep.status === 'completed' ? 'تم التنفيذ' : currentStep.status === 'in_progress' ? 'قيد التنفيذ حالياً' : 'بانتظار الإجراء'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{currentStep.descriptionAr}</p>
                  {currentStep.summaryText && (
                    <div className="text-xs font-semibold text-teal-800 bg-teal-50 p-2 rounded-xl border border-teal-200">
                      ملاحظات المرحلة: {currentStep.summaryText}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
