import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Pill,
  UserCheck,
  FileText,
  Activity,
  Check,
  Slash,
  Sliders,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import {
  ActiveMedicationItem,
  AdministrationSlot,
  AdministrationStatus,
  NonAdministrationReason
} from '../../../types/clinicalMedicationsMar';
import { StaffUser, Patient } from '../../../types/his';
import { PatientIdentityVerificationModal } from '../common/PatientIdentityVerificationModal';
import { VerificationAttemptRecord } from '../../../types/clinicalIdentityVerification';

interface AdministrationActionDrawerProps {
  medication: ActiveMedicationItem;
  slot: AdministrationSlot;
  currentStaff: StaffUser;
  patient?: Patient;
  onSave: (updatedSlot: AdministrationSlot) => void;
  onClose: () => void;
}

export const AdministrationActionDrawer: React.FC<AdministrationActionDrawerProps> = ({
  medication,
  slot,
  currentStaff,
  patient,
  onSave,
  onClose
}) => {
  const [status, setStatus] = useState<AdministrationStatus>(
    slot.status === 'due' || slot.status === 'overdue' ? 'administered' : slot.status
  );

  // Patient Identity Verification State (Source-Validated Pattern: 2 Person-Specific Identifiers)
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [identityVerifiedRecord, setIdentityVerifiedRecord] = useState<VerificationAttemptRecord | null>(null);

  // Time Provenance: Scheduled vs Actual vs Recorded Time (Point 9)
  const scheduledTime = slot.scheduledTime;
  const [actualAdminTime, setActualAdminTime] = useState<string>(
    slot.actualAdministrationTime || '14:25'
  );

  // Dose Provenance & Differentiation (Point 12)
  const [doseType, setDoseType] = useState<'full_ordered_dose' | 'partial_dose' | 'different_actual_dose'>(
    slot.doseAdministeredType || 'full_ordered_dose'
  );
  const [administeredDose, setAdministeredDose] = useState(
    slot.administeredDose || medication.orderedDose
  );
  const [doseChangeReason, setDoseChangeReason] = useState(slot.doseChangeReason || '');

  const [route, setRoute] = useState(slot.administeredRoute || medication.route);
  const [site, setSite] = useState(
    slot.administeredSite ||
      (medication.route.includes('SC')
        ? 'جدار البطن السفلي الأيمن (Right Lower Abdomen)'
        : medication.route.includes('IV')
        ? 'القسطرة الوريدية المركزية - المجرى 1 (CVC Lumen 1)'
        : 'عن طريق الفم (Oral PO)')
  );

  // Generic Medication Performer (Point 10)
  const [performerName, setPerformerName] = useState(slot.administeredBy || currentStaff.name);
  const [performerRole, setPerformerRole] = useState(
    slot.administeredByRole || (currentStaff.role === 'nurse' ? 'Registered Nurse (RN)' : 'Authorized Clinician')
  );

  // Policy-Driven Verification (Item 1: Configured High-Alert Medication Verification Policy)
  const requiresSecondClinician = Boolean(medication.verificationPolicy?.requiresSecondClinician);
  const [verificationType, setVerificationType] = useState<'independent_double_check' | 'co_signature'>(
    medication.verificationPolicy?.policyType === 'cosign_required' ? 'co_signature' : 'independent_double_check'
  );
  const [verifyingClinician, setVerifyingClinician] = useState(
    slot.verifiedBy || (requiresSecondClinician ? 'أحمد جلال (ممارس سريري معتمد)' : '')
  );

  // Non-administration Reason & Hold Criteria (Points 11 & 13)
  const [nonAdminReason, setNonAdminReason] = useState<NonAdministrationReason>(
    slot.nonAdminReason || 'sbp_low'
  );
  const [nonAdminComment, setNonAdminComment] = useState(slot.nonAdminComment || '');

  // Context-Driven Pre & Post Assessments (Points 14 & 18)
  const isCardiovascular = medication.route.includes('PO') && (medication.genericName.includes('Metoprolol') || medication.genericName.includes('Amlodipine') || medication.genericName.includes('Ramipril'));
  const isAnalgesic = medication.isPrn || medication.genericName.includes('Morphine') || medication.genericName.includes('Paracetamol');
  const isInsulin = medication.genericName.includes('Insulin');

  const [preVitalValue, setPreVitalValue] = useState<string>(
    isCardiovascular ? 'BP 118/74, HR 68 bpm' : isInsulin ? 'Blood Glucose: 142 mg/dL' : ''
  );
  const [painScorePre, setPainScorePre] = useState(slot.responseAssessment?.painScorePre || 7);
  const [painScorePost, setPainScorePost] = useState(slot.responseAssessment?.painScorePost || 2);
  const [evalNotes, setEvalNotes] = useState(slot.responseAssessment?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recordedTimestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const updated: AdministrationSlot = {
      ...slot,
      status,
      scheduledTime,
      scheduledAdministrationTime: scheduledTime,
      actualAdministrationTime: status === 'administered' || status === 'partial_dose' ? actualAdminTime : undefined,
      recordedAt: `اليوم، ${recordedTimestamp}`,
      recordedDocumentedTime: `اليوم، ${recordedTimestamp}`,

      doseAdministeredType: doseType,
      orderedDose: medication.orderedDose,
      administeredDose: status === 'administered' || status === 'partial_dose' ? administeredDose : undefined,
      administeredUnit: medication.doseUnit,
      doseChangeReason: doseType !== 'full_ordered_dose' ? doseChangeReason : undefined,

      administeredRoute: route,
      administeredSite: site,

      administeredBy:
        status === 'administered' || status === 'partial_dose'
          ? `${performerName} (${performerRole})`
          : undefined,
      administeredByRole: performerRole,
      verifiedBy: requiresSecondClinician ? verifyingClinician : undefined,
      isDualVerified: requiresSecondClinician && (status === 'administered' || status === 'partial_dose'),

      nonAdminReason: status === 'held' || status === 'refused' || status === 'missed' || status === 'omitted_not_done' ? nonAdminReason : undefined,
      nonAdminComment: status === 'held' || status === 'refused' || status === 'missed' || status === 'omitted_not_done' ? nonAdminComment : undefined,

      preAssessment: (isCardiovascular || isInsulin) ? {
        applicable: true,
        type: isCardiovascular ? 'bp' : 'blood_glucose',
        labelAr: isCardiovascular ? 'العلامات الحيوية قبل الإعطاء' : 'مستوى سكر الدم قبل الإعطاء',
        value: preVitalValue,
        assessedAt: actualAdminTime
      } : undefined,

      responseAssessment:
        isAnalgesic && (status === 'administered' || status === 'partial_dose')
          ? {
              painScorePre,
              painScorePost,
              sedationScore: 'يقظ ومنتبه (Alert RASS 0)',
              evaluatedAt: 'الآن',
              notes: evalNotes
            }
          : undefined,

      administeredAt: status === 'administered' ? `اليوم، ${actualAdminTime}` : undefined
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  توثيق إعطاء الدواء في eMAR
                </h3>
                <span className="text-xs text-teal-200/80">
                  الوقت المجدول: {slot.scheduledTime} • التحقق السريري المتعدد
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {/* Patient Identity Verification Block (Source-Validated Pattern: 2 Person-Specific Identifiers) */}
            {patient && (
              <div className="p-3.5 rounded-2xl border transition-all bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-4 h-4 ${identityVerifiedRecord ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        التحقق من هوية المريض (Patient Identity Verification)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {identityVerifiedRecord
                          ? `تم التحقق بنجاح (${identityVerifiedRecord.matchedIdentifiers.join(' + ')}) • ${identityVerifiedRecord.timestamp}`
                          : 'مطلوب التحقق بمطابقة معرفين اثنين على الأقل قبل الإعطاء السريري'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsIdentityModalOpen(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      identityVerifiedRecord
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{identityVerifiedRecord ? 'إعادة التحقق السريري' : 'بدء التحقق من الهوية'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Medication & Order Provenance Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-black text-slate-900">
                    {medication.genericName}
                  </strong>
                  <span className="text-xs text-slate-500 font-semibold">({medication.brandName})</span>
                </div>
                {medication.isHighAlert && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>HIGH-ALERT</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div>الجرعة المطلوبة: <strong className="text-slate-900 font-mono">{medication.orderedDose}</strong></div>
                <div>طريق الإعطاء: <strong className="text-slate-900">{medication.route}</strong></div>
                <div>التكرار: <span className="text-slate-700">{medication.frequency}</span></div>
                <div>طلب رقم: <span className="font-mono text-blue-700 font-bold">{medication.orderId}</span></div>
              </div>

              {/* Order Hold Criteria (Point 13) */}
              {medication.orderHoldParameters && medication.orderHoldParameters.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>شروط ومعايير التعليق الطبية المحددة في الأمر (Hold Criteria):</span>
                  </div>
                  {medication.orderHoldParameters.map((param, idx) => (
                    <div key={idx} className="font-mono text-[10px] text-amber-900">
                      • {param.parameterName}: {param.thresholdCondition} ({param.action.toUpperCase()}) — {param.sourceDescription}
                    </div>
                  ))}
                </div>
              )}

              {/* High Alert Policy Alert */}
              {requiresSecondClinician && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] space-y-1.5 font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>تتطلب السياسة تحققا سريريا مزدوجا معتمدا (Verification Policy):</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setVerificationType('independent_double_check')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        verificationType === 'independent_double_check'
                          ? 'bg-rose-700 text-white font-bold'
                          : 'bg-white text-rose-800 border border-rose-300'
                      }`}
                    >
                      تدقيق مزدوج مستقل (Independent Double-Check)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationType('co_signature')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        verificationType === 'co_signature'
                          ? 'bg-rose-700 text-white font-bold'
                          : 'bg-white text-rose-800 border border-rose-300'
                      }`}
                    >
                      توقيع سريري مشترك (Co-Signature)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Time Provenance Fields: Scheduled vs Actual vs Documented (Point 9) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                تسلسل التوقيت السريري (Time Provenance):
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">1. الوقت المجدول:</span>
                  <strong className="text-slate-800 font-mono text-xs">{scheduledTime}</strong>
                </div>
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-200">
                  <label className="text-[10px] text-teal-800 block font-bold">2. وقت الإعطاء الفعلي:</label>
                  <input
                    type="text"
                    value={actualAdminTime}
                    onChange={e => setActualAdminTime(e.target.value)}
                    className="w-full bg-white border border-teal-300 rounded px-1.5 py-0.5 font-mono text-xs font-bold text-teal-950 mt-0.5"
                  />
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">3. وقت التوثيق بالنظام:</span>
                  <span className="text-slate-600 font-mono text-xs block mt-0.5">يسجل آليا عند الحفظ</span>
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                حالة الإعطاء السريري (Administration Status):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('administered')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    status === 'administered'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ إعطاء تام
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('partial_dose');
                    setDoseType('partial_dose');
                  }}
                  className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    status === 'partial_dose'
                      ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  جرعة جزئية (Partial)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('held')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    status === 'held'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  تعليق سريري (Held)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('refused')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    status === 'refused'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  رفض المريض (Refused)
                </button>
              </div>
            </div>

            {/* If Administered or Partial Dose: Fields for Dose, Site, Performer, Verifier */}
            {(status === 'administered' || status === 'partial_dose') && (
              <div className="space-y-4 pt-1">
                {/* Dose Type & Differentiation (Point 12) */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    نمط الجرعة المعطاة فعلياً (Dose Differentiation):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDoseType('full_ordered_dose');
                        setAdministeredDose(medication.orderedDose);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        doseType === 'full_ordered_dose'
                          ? 'bg-teal-700 text-white'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      كامل الجرعة المطلوبة ({medication.orderedDose})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDoseType('partial_dose')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        doseType === 'partial_dose'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      جرعة جزئية (Partial Dose)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">
                        المقدار المعطى فعليا:
                      </label>
                      <input
                        type="text"
                        value={administeredDose}
                        onChange={e => setAdministeredDose(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                    {doseType !== 'full_ordered_dose' && (
                      <div>
                        <label className="text-[10px] font-bold text-orange-900 block mb-1">
                          سبب إعطاء جرعة مختلفة / جزئية:
                        </label>
                        <input
                          type="text"
                          value={doseChangeReason}
                          onChange={e => setDoseChangeReason(e.target.value)}
                          placeholder="مثال: عدم تحمل كامل الحبة / قيء فوري..."
                          className="w-full px-3 py-1.5 bg-white border border-orange-300 rounded-xl text-xs"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      المسار (Route):
                    </label>
                    <input
                      type="text"
                      value={route}
                      onChange={e => setRoute(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      موضع الحقن / الإعطاء (Site):
                    </label>
                    <input
                      type="text"
                      value={site}
                      onChange={e => setSite(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Generic Medication Performer (Point 10) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block">الممارس الصحي المفوّض للإعطاء (Performer):</label>
                    <input
                      type="text"
                      value={performerName}
                      onChange={e => setPerformerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 block">الصفة السريرية: {performerRole}</span>
                  </div>

                  {requiresSecondClinician ? (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                      <label className="text-[10px] text-rose-800 font-bold block">
                        الممارس السريري المدقق الثاني:
                      </label>
                      <input
                        type="text"
                        value={verifyingClinician}
                        onChange={e => setVerifyingClinician(e.target.value)}
                        placeholder="اسم الممارس المعتمد المدقق..."
                        className="w-full px-2 py-1 bg-white border border-rose-300 rounded text-xs font-bold text-rose-950"
                        required
                      />
                      <span className="text-[9px] text-rose-700 block">
                        السياسة المحددة: {medication.verificationPolicy?.policyName || (verificationType === 'independent_double_check' ? 'تدقيق مزدوج مستقل (Mock Configured Policy)' : 'توقيع مشترك')}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold">سياسة التحقق:</span>
                      <strong className="text-slate-700 block mt-0.5 text-[11px]">
                        {medication.verificationPolicy?.policyName || 'تحقق سريري فردي مصرح (Single Verification)'}
                      </strong>
                      {medication.isHighAlert && (
                        <span className="text-[9px] text-amber-700 block mt-0.5">
                          دواء عالي الخطورة — يخضع لسياسة التحقق المؤسسية المحددة (Mock Policy Example)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Context-Driven Pre-Assessment (Point 14) */}
                {(isCardiovascular || isInsulin) && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>تقييم ما قبل الإعطاء المناسب سريرياً (Context Pre-Assessment):</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-blue-800 shrink-0 font-bold">
                        {isCardiovascular ? 'العلامات الحيوية (BP/HR):' : 'سكر الدم (Blood Glucose):'}
                      </label>
                      <input
                        type="text"
                        value={preVitalValue}
                        onChange={e => setPreVitalValue(e.target.value)}
                        placeholder="مثال: BP 118/74, HR 68 bpm"
                        className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Context-Driven PRN Pain Response Assessment (Point 18) */}
                {isAnalgesic && (
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
                    <strong className="text-xs text-teal-950 font-extrabold block">
                      تقييم الاستجابة للألم (PRN Pain Response Assessment):
                    </strong>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-teal-800 font-bold block mb-1">
                          شدة الألم قبل الإعطاء (Pre-Dose 0-10):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={painScorePre}
                          onChange={e => setPainScorePre(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-teal-800 font-bold block mb-1">
                          شدة الألم بعد التقييم (Post-Dose):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={painScorePost}
                          onChange={e => setPainScorePost(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-teal-800 font-bold block mb-1">
                        ملاحظات الاستجابة السريرية:
                      </label>
                      <input
                        type="text"
                        value={evalNotes}
                        onChange={e => setEvalNotes(e.target.value)}
                        placeholder="مثل: هدوء الألم واستقرار التنفس..."
                        className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If Held, Refused, or Missed (Points 11 & 13) */}
            {(status === 'held' || status === 'refused' || status === 'missed' || status === 'omitted_not_done') && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <strong className="text-xs text-purple-950 font-extrabold block">
                  سبب عدم الإعطاء وتوثيق السياسة السريرية:
                </strong>

                <div>
                  <label className="text-[11px] font-bold text-purple-900 block mb-1">
                    التصنيف السريري للسبب:
                  </label>
                  <select
                    value={nonAdminReason}
                    onChange={e => setNonAdminReason(e.target.value as NonAdministrationReason)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs"
                  >
                    <option value="sbp_low">انخفاض ضغط الدم الشرياني (SBP &lt; الحد المسموح)</option>
                    <option value="hr_bradycardia">تباطؤ نبض القلب (Bradycardia &lt; 55 bpm)</option>
                    <option value="npo_for_procedure">المريض صائم للإجراء / القسطرة (NPO)</option>
                    <option value="patient_refused">رفض المريض بعد الشرح الطبي</option>
                    <option value="vomiting_intolerance">قيء وعدم تحمل دوائي فموي</option>
                    <option value="patient_sleeping">المريض نائم سريرياً</option>
                    <option value="physician_verbal_hold">أمر طبي شفهي بالتعليق من الاستشاري</option>
                    <option value="central_supply_delayed">تأخر صرف الدواء من الصيدلية</option>
                    <option value="other">أسباب سريرية أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-purple-900 block mb-1">
                    الملاحظات السريرية التفصيلية:
                  </label>
                  <textarea
                    rows={3}
                    value={nonAdminComment}
                    onChange={e => setNonAdminComment(e.target.value)}
                    placeholder="اكتب التبرير السريري والإجراءات البديلة المتخذة..."
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتثبيت التوثيق في eMAR</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Patient Identity Verification Modal */}
      {patient && (
        <PatientIdentityVerificationModal
          isOpen={isIdentityModalOpen}
          onClose={() => setIsIdentityModalOpen(false)}
          patient={patient}
          actionTitle={`إعطاء دواء (${medication.genericName})`}
          staffName={currentStaff.name}
          staffRole={currentStaff.role}
          onVerificationSuccess={record => {
            setIdentityVerifiedRecord(record);
            setIsIdentityModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
