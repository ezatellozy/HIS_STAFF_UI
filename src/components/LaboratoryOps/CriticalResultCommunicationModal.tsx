import React, { useState, useEffect } from 'react';
import {
  X,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  Clock,
  Send,
  Building2,
  AlertCircle,
  TrendingUp,
  XCircle,
  FileCheck,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import {
  LabAccession,
  CriticalResultCommunication,
  CriticalPolicyProfile,
  CriticalAttemptOutcome
} from '../../types/laboratoryOps';

interface CriticalResultCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accession: LabAccession;
  onSaveCommunication: (accessionId: string, comm: CriticalResultCommunication) => void;
}

export const CriticalResultCommunicationModal: React.FC<CriticalResultCommunicationModalProps> = ({
  isOpen,
  onClose,
  accession,
  onSaveCommunication
}) => {
  // Policy Profile
  const [policyProfile, setPolicyProfile] = useState<CriticalPolicyProfile>(
    accession.encounterType === 'opd'
      ? 'policy_outpatient_direct'
      : 'policy_inpatient_readback'
  );

  // Intended Target Context (Preserved separately from actual recipient reached)
  const [intendedRecipient, setIntendedRecipient] = useState(
    accession.encounterType === 'opd'
      ? accession.orderingDoctor
      : 'طبيب التنويم المعالج / ممرض القسم المسؤول'
  );
  const [intendedTeam, setIntendedTeam] = useState(
    accession.clinicalDepartment || 'Inpatient Acute Care Team'
  );

  // Communication Attempt
  const [callerName, setCallerName] = useState('أخصائي الكيمياء: م. عاصم النجار');
  const [attemptChannel, setAttemptChannel] = useState<'telephone' | 'secure_critical_messaging' | 'in_person_ward'>('telephone');
  const [attemptOutcome, setAttemptOutcome] = useState<CriticalAttemptOutcome>('delivered_successful');
  const [attemptTimestamp, setAttemptTimestamp] = useState('');

  // Failure tracking (Required for failed calls without inventing recipient)
  const [failureReason, setFailureReason] = useState<string>('no_answer');
  const [failureAttemptDetails, setFailureAttemptDetails] = useState<string>(
    'تم الاتصال 3 مرات متتالية بهاتف القسم دون رد؛ تم إرسال نداء فوري وبدء مسار التصعيد.'
  );

  // Actual Recipient Identity (When reached)
  const [communicatedTo, setCommunicatedTo] = useState(
    accession.encounterType === 'opd'
      ? accession.orderingDoctor
      : 'ممرض الطوارئ: رائد الفهد'
  );
  const [communicatedToRole, setCommunicatedToRole] = useState(
    accession.encounterType === 'opd'
      ? 'Attending / Ordering Physician'
      : 'Staff Nurse - ER Acute Care Team'
  );

  // Policy-driven Verification
  const [readBackConfirmed, setReadBackConfirmed] = useState(false);
  const [receiptTokenConfirmed, setReceiptTokenConfirmed] = useState(false);

  // Escalation Path
  const [escalationTarget, setEscalationTarget] = useState('مشرف التمريض العام / المدير الطبي المناوب (Clinical Supervisor)');
  const [escalationStatus, setEscalationStatus] = useState<'none' | 'initiated' | 'completed'>('none');
  const [communicationNote, setCommunicationNote] = useState('');

  // Reset/sync on modal open or accession change
  useEffect(() => {
    if (isOpen) {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      setAttemptTimestamp(now);
      const isOpd = accession.encounterType === 'opd';
      setPolicyProfile(isOpd ? 'policy_outpatient_direct' : 'policy_inpatient_readback');
      setIntendedRecipient(isOpd ? accession.orderingDoctor : 'طبيب التنويم المعالج / ممرض القسم المسؤول');
      setIntendedTeam(accession.clinicalDepartment || 'Inpatient Acute Care Team');
      setCommunicatedTo(isOpd ? accession.orderingDoctor : 'ممرض القسم المناوب');
      setCommunicatedToRole(isOpd ? 'Ordering Attending Clinician' : 'Staff Nurse / Charge Nurse');
      setAttemptOutcome('delivered_successful');
      setFailureReason('no_answer');
      setFailureAttemptDetails('تم الاتصال 3 مرات متتالية بهاتف القسم دون رد؛ تم إرسال نداء فوري وبدء مسار التصعيد.');
      setReadBackConfirmed(false);
      setReceiptTokenConfirmed(false);
      setEscalationStatus('none');
      setCommunicationNote(
        isOpd
          ? 'تم إجراء محاولة الاتصال بالعيادة لإبلاغ الطبيب بالقيمة الحرجة ومطابقة خطة المتابعة.'
          : 'تم إبلاغ القسم التمريضي بالقيمة الحرجة، ومطابقة هوية المريض والأرقام المرجعية.'
      );
    }
  }, [accession.id, isOpen]);

  if (!isOpen) return null;

  const criticalTests = accession.tests.filter(
    t => t.flag === 'critical_high' || t.flag === 'critical_low'
  );

  const isReadBackMandatory =
    policyProfile === 'policy_inpatient_readback' &&
    (attemptOutcome === 'delivered_successful' || attemptOutcome === 'alternate_recipient');

  const isReceiptMandatory =
    policyProfile === 'policy_outpatient_direct' &&
    attemptChannel === 'secure_critical_messaging' &&
    (attemptOutcome === 'delivered_successful' || attemptOutcome === 'alternate_recipient');

  // Strict Governance canSave check:
  // - Failed attempt recordable without receiver name, BUT requires documented failure reason and attempt details.
  // - Successful attempt requires actual receiver name AND policy fulfillment (read-back / receipt).
  // - Escalation requires escalation target and preserves initiated status without claiming delivery.
  const canSave = (() => {
    if (attemptOutcome === 'contact_failed') {
      return Boolean(failureReason && failureAttemptDetails.trim().length > 0);
    }
    if (attemptOutcome === 'escalated_in_progress') {
      return Boolean(escalationTarget.trim().length > 0);
    }
    if (attemptOutcome === 'delivered_successful' || attemptOutcome === 'alternate_recipient') {
      if (!communicatedTo.trim()) return false;
      if (isReadBackMandatory && !readBackConfirmed) return false;
      if (isReceiptMandatory && !receiptTokenConfirmed) return false;
      return true;
    }
    return true;
  })();

  const handleSave = () => {
    const comm: CriticalResultCommunication = {
      isCritical: true,
      requiredPolicy:
        policyProfile === 'policy_inpatient_readback'
          ? 'read_back_required'
          : policyProfile === 'policy_outpatient_direct'
          ? 'electronic_escalation'
          : 'verbal_acknowledgement',
      policyProfile,
      identifiedAt: attemptTimestamp,
      communicationAttemptTimestamp: attemptTimestamp,
      attemptOutcome,
      channel: attemptChannel,
      intendedRecipient,
      intendedTeam,
      failureReason: attemptOutcome === 'contact_failed' ? failureReason : undefined,
      failureAttemptDetails: attemptOutcome === 'contact_failed' ? failureAttemptDetails : undefined,
      communicatedTo: attemptOutcome === 'contact_failed' ? undefined : communicatedTo,
      communicatedToRole: attemptOutcome === 'contact_failed' ? undefined : communicatedToRole,
      communicatedAt: attemptOutcome === 'delivered_successful' || attemptOutcome === 'alternate_recipient' ? attemptTimestamp : undefined,
      callerStaffName: callerName,
      readBackConfirmed: isReadBackMandatory ? readBackConfirmed : false,
      acknowledgementStatus:
        attemptOutcome === 'delivered_successful' || attemptOutcome === 'alternate_recipient'
          ? 'acknowledged'
          : attemptOutcome === 'escalated_in_progress'
          ? 'escalated'
          : 'pending',
      escalationTarget:
        attemptOutcome === 'escalated_in_progress' || attemptOutcome === 'contact_failed'
          ? escalationTarget
          : undefined,
      escalationStatus:
        attemptOutcome === 'escalated_in_progress'
          ? 'initiated'
          : escalationStatus,
      clinicalFollowUpPending: true, // Lab notification != Bedside clinical follow-up
      communicationNote
    };

    onSaveCommunication(accession.id, comm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-red-600 shadow-2xl max-w-3xl w-full p-6 space-y-4 text-right font-['Cairo',sans-serif] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700 animate-pulse">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                توثيق إبلاغ القيمة المخبرية الحرجة (Critical Value Closed-Loop Communication)
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                إدارة محاولات الاتصال، ومسارات التصعيد، والتحقق المستقل وفق السياسة السريرية المعتمدة.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Policy Invariant Banner */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-950">
            <div className="flex items-center gap-2 font-bold text-red-800">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>محددات الحوكمة السريرية المستقلة:</span>
            </div>
            <p className="leading-relaxed">
              <strong>1. تعذر الاتصال يسجل كحدث مستقل:</strong> يجوز تسجيل محاولة الاتصال الفاشلة وبدء التصعيد دون تلفيق قراءة متبادلة غير حقيقية.<br />
              <strong>2. بدء التصعيد ≠ تسليم النتيجة:</strong> الإشعار بالتصعيد لا يعني وصول النتيجة للطبيب.<br />
              <strong>3. إشعار الاستلام ≠ الإجراء السريري:</strong> وصول البلاغ المخبري لا يثبت اتخاذ القرار العلاجي عند سرير المريض.
            </p>
          </div>

          {/* Policy Profile Selector */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              سياسة الإبلاغ المعتمدة وفق السياق (Applicable Critical Policy Profile):
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPolicyProfile('policy_inpatient_readback')}
                className={`p-2.5 rounded-xl border text-right font-bold transition-all cursor-pointer ${
                  policyProfile === 'policy_inpatient_readback'
                    ? 'bg-red-50 border-red-500 text-red-900 shadow-xs ring-1 ring-red-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">تنويم / عناية مركزة (Inpatient)</span>
                  {policyProfile === 'policy_inpatient_readback' && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-1">
                  اتصال هاتفي + قراءة متبادلة شفوية إلزامية (Oral Read-Back)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPolicyProfile('policy_outpatient_direct')}
                className={`p-2.5 rounded-xl border text-right font-bold transition-all cursor-pointer ${
                  policyProfile === 'policy_outpatient_direct'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">عيادات خارجية (Outpatient)</span>
                  {policyProfile === 'policy_outpatient_direct' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-1">
                  إبلاغ الطبيب المعالج / رمز استلام إلكتروني موثوق (Electronic Token)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPolicyProfile('policy_unconfigured')}
                className={`p-2.5 rounded-xl border text-right font-bold transition-all cursor-pointer ${
                  policyProfile === 'policy_unconfigured'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">سياسة عامة غير مخصصة</span>
                  {policyProfile === 'policy_unconfigured' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-1">
                  البروتوكول المؤسسي العام للمنشأة (Default Institutional)
                </div>
              </button>
            </div>
          </div>

          {/* Critical Values Summary */}
          <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-1.5">
              <span className="font-bold text-red-400">القيم الحرجة المكتشفة التي تتطلب الإبلاغ الفوري:</span>
              <span className="font-mono text-slate-400">{accession.accessionNumber} | {accession.patientName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {criticalTests.map(t => (
                <div key={t.id} className="p-2 bg-slate-800 rounded-lg border border-red-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{t.testNameAr}</div>
                    <span className="text-[10px] text-slate-400 font-mono">المرجع: {t.referenceRangeText}</span>
                  </div>
                  <span className="text-base font-mono font-black text-red-400">
                    {t.numericValue ?? t.textValue} {t.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Attempt Details */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-800 block">تفاصيل محاولة الاتصال والإبلاغ:</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">وقت المحاولة (Attempt Timestamp):</label>
                <input
                  type="text"
                  value={attemptTimestamp}
                  onChange={e => setAttemptTimestamp(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">المبلغ من المختبر (Reporting Staff):</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={e => setCallerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">قناة الإبلاغ (Channel):</label>
                <select
                  value={attemptChannel}
                  onChange={e => setAttemptChannel(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="telephone">اتصال هاتفي مباشر (Direct Phone)</option>
                  <option value="secure_critical_messaging">نظام التنبيهات السريري المعتمد (Secure EHR Alert)</option>
                  <option value="in_person_ward">تسليم شفهي مباشر بالقسم (In-person Handover)</option>
                </select>
              </div>
            </div>

            {/* Attempt Outcome Selector */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <label className="block font-bold text-slate-800">
                نتيجة محاولة الاتصال (Attempt Outcome):
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAttemptOutcome('delivered_successful');
                    setEscalationStatus('none');
                  }}
                  className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    attemptOutcome === 'delivered_successful'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  تسليم ناجح للمستهدف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttemptOutcome('contact_failed');
                    setReadBackConfirmed(false);
                    setReceiptTokenConfirmed(false);
                    setEscalationStatus('initiated');
                  }}
                  className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    attemptOutcome === 'contact_failed'
                      ? 'bg-red-100 border-red-500 text-red-900 ring-1 ring-red-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  تعذر الاتصال / عدم الرد
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttemptOutcome('alternate_recipient');
                    setEscalationStatus('none');
                  }}
                  className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    attemptOutcome === 'alternate_recipient'
                      ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  تسليم لمستلم بديل مفوض
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttemptOutcome('escalated_in_progress');
                    setReadBackConfirmed(false);
                    setReceiptTokenConfirmed(false);
                    setEscalationStatus('initiated');
                  }}
                  className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                    attemptOutcome === 'escalated_in_progress'
                      ? 'bg-purple-100 border-purple-500 text-purple-900 ring-1 ring-purple-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  تصعيد إداري قيد الإجراء
                </button>
              </div>
            </div>
          </div>

          {/* Intended Target Context (Preserved separately from actual reached person) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                المستهدف الأصلي بالإبلاغ (Intended Recipient):
              </label>
              <input
                type="text"
                value={intendedRecipient}
                onChange={e => setIntendedRecipient(e.target.value)}
                placeholder="اسم الطبيب أو الممرض المستهدف..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                يحفظ النظام المستهدف الأصلي مستقلاً عن الشخص الذي تم الوصول إليه فعلياً.
              </span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الفريق / القسم المستهدف (Intended Care Team):
              </label>
              <input
                type="text"
                value={intendedTeam}
                onChange={e => setIntendedTeam(e.target.value)}
                placeholder="القسم أو الفريق السريري..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                السياق السريري للطلب (مثال: عناية مركزة، طوارئ، عيادة).
              </span>
            </div>
          </div>

          {/* Recipient details when delivered */}
          {(attemptOutcome === 'delivered_successful' || attemptOutcome === 'alternate_recipient') && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المستلم الفعلي {attemptOutcome === 'alternate_recipient' ? 'البديل المفوض' : 'السريري'}:
                </label>
                <input
                  type="text"
                  value={communicatedTo}
                  onChange={e => setCommunicatedTo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الصفة السريرية للمستلم الفعلي:</label>
                <input
                  type="text"
                  value={communicatedToRole}
                  onChange={e => setCommunicatedToRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Documented Failure Reason & Details when contact failed */}
          {attemptOutcome === 'contact_failed' && (
            <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-200 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>توثيق تعذر الاتصال (Documented Failure Without Fabricated Recipient):</span>
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed">
                لا يُشترط اسم المستلم عند تعذر الاتصال لعدم الوصول لأي شخص؛ ولكن يُلزم النظام بتوثيق سبب التعذر وتفاصيل المحاولة إجبارياً قبل الحفظ.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-red-950 font-bold mb-1">
                    سبب تعذر الاتصال الموثق (Failure Reason):
                  </label>
                  <select
                    value={failureReason}
                    onChange={e => setFailureReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs text-red-950 font-bold"
                  >
                    <option value="no_answer">لم يتم الرد على الهاتف (No Answer / Rings without answer)</option>
                    <option value="line_busy">الخط مشغول باستمرار (Line Busy)</option>
                    <option value="clinician_unavailable">الطبيب في غرفة العمليات/غير متاح (In Procedure / Unavailable)</option>
                    <option value="paged_no_response">تم إرسال نداء (Pager) دون رد خلال المهلة (Paged - No Response)</option>
                    <option value="wrong_extension">رقم التحويلة غير صحيح / عطل هاتفي (Invalid Contact / Technical Issue)</option>
                    <option value="clinic_closed">العيادة الخارجية مغلقة (Outpatient Clinic Closed / Off-hours)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-red-950 font-bold mb-1">
                    تفاصيل المحاولة التوثيقية (Attempt Audit Details):
                  </label>
                  <input
                    type="text"
                    value={failureAttemptDetails}
                    onChange={e => setFailureAttemptDetails(e.target.value)}
                    placeholder="مثال: رن 5 مرات، محاولة أخرى بعد دقيقتين دون رد..."
                    className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs text-red-950"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Read-Back Verification when required */}
          {isReadBackMandatory && (
            <div className={`p-3 rounded-xl border text-xs ${
              readBackConfirmed ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
            }`}>
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={readBackConfirmed}
                  onChange={e => setReadBackConfirmed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    تمت القراءة المتبادلة الشفوية الكاملة (Oral Read-Back) ومطابقة اسم المريض والرقم الطبي وقيمة الفحص
                  </span>
                </span>
              </label>
              {!readBackConfirmed && (
                <p className="text-[11px] text-red-700 mt-1 mr-6">
                  * سياسة التنويم تلزم بالقراءة المتبادلة لتأكيد التسليم الناجح. في حال تعذر ذلك، اختر حالة (تعذر الاتصال) أو (تصعيد قيد الإجراء).
                </p>
              )}
            </div>
          )}

          {/* Electronic Receipt Confirmation Token when required */}
          {isReceiptMandatory && (
            <div className={`p-3 rounded-xl border text-xs ${
              receiptTokenConfirmed ? 'bg-blue-50 border-blue-300' : 'bg-amber-50 border-amber-300'
            }`}>
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={receiptTokenConfirmed}
                  onChange={e => setReceiptTokenConfirmed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-700" />
                  <span>
                    تم التحقق من استلام الإشعار الإلكتروني المعتمد عبر السجل الصحي مع التوقيع الرقمي
                  </span>
                </span>
              </label>
            </div>
          )}

          {/* Escalation Path Details (when contact failed or escalation in progress) */}
          {(attemptOutcome === 'contact_failed' || attemptOutcome === 'escalated_in_progress') && (
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-purple-900">
                <ArrowUpRight className="w-4 h-4 text-purple-700" />
                <span>إجراءات مسار التصعيد المؤسسي (Institutional Escalation Protocol):</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-800 font-bold mb-1">جهة / مسؤول التصعيد المستهدف:</label>
                  <input
                    type="text"
                    value={escalationTarget}
                    onChange={e => setEscalationTarget(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-purple-800 font-bold mb-1">حالة التصعيد الحالية:</label>
                  <select
                    value={escalationStatus}
                    onChange={e => setEscalationStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                  >
                    <option value="initiated">تم بدء التصعيد (Escalation Initiated - Result Not Yet Delivered)</option>
                    <option value="completed">اكتمل التصعيد وتسلم المشرف المسؤولية (Escalation Completed)</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-purple-700 mt-1">
                * يتم تسجيل هذا البلاغ في لوحة المتابعة المعلقة لحين إغلاق الدائرة والتأكد من سلامة المريض.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1 text-xs">
            <label className="block font-bold text-slate-700">ملاحظات التوثيق السريري:</label>
            <textarea
              rows={2}
              value={communicationNote}
              onChange={e => setCommunicationNote(e.target.value)}
              placeholder="اكتب أي ملاحظات إضافية حول المكالمة أو الاستجابة السريرية..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {attemptOutcome === 'contact_failed' || attemptOutcome === 'escalated_in_progress'
                ? 'توثيق تعذر الاتصال وبدء مسار التصعيد'
                : 'توثيق واكتمال إبلاغ القيمة الحرجة'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
