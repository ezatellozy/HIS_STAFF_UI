import React, { useState } from 'react';
import {
  X,
  UserCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Receipt,
  Printer,
  Sparkles,
  DollarSign,
  UserX
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Appointment, Patient, Clinic, BillingTransaction } from '../../types/his';

interface CheckInTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string | null;
  onSuccessTransaction?: (txn: BillingTransaction) => void;
}

export const CheckInTransactionModal: React.FC<CheckInTransactionModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  onSuccessTransaction
}) => {
  const {
    appointments,
    patients,
    clinics,
    processCheckInTransaction,
    markPatientArrived,
    markPatientNoShow
  } = useHis();

  const appointment = appointments.find(a => a.id === appointmentId);
  const patient = appointment ? patients.find(p => p.id === appointment.patientId) : null;
  const clinic = appointment ? clinics.find(c => c.id === appointment.clinicId) : null;

  // Local form state
  const isCashPatient = patient?.insuranceClass === 'Cash' || patient?.insuranceProvider === 'نقدي (Cash)';
  const defaultFee = appointment?.consultationFee || 450;
  const coveragePercent = patient && !isCashPatient ? patient.insuranceCoveragePercent : 0;
  const calculatedCoPay = Math.round(defaultFee * (1 - coveragePercent / 100));

  const [paymentMethod, setPaymentMethod] = useState<BillingTransaction['paymentMethod']>(
    isCashPatient ? 'mada' : coveragePercent === 100 ? 'insurance_direct' : 'mada'
  );
  const [coPayAmount, setCoPayAmount] = useState<number>(calculatedCoPay);
  const [isWaived, setIsWaived] = useState<boolean>(false);
  const [paymentRef, setPaymentRef] = useState<string>(`AUTH-${Math.floor(10000 + Math.random() * 90000)}`);
  const [eligibilityVerified, setEligibilityVerified] = useState<boolean>(true);
  const [isVerifyingEligibility, setIsVerifyingEligibility] = useState<boolean>(false);
  const [cashierNotes, setCashierNotes] = useState<string>('');

  if (!isOpen || !appointment || !patient || !clinic) return null;

  const handleVerifyEligibility = () => {
    setIsVerifyingEligibility(true);
    setTimeout(() => {
      setIsVerifyingEligibility(false);
      setEligibilityVerified(true);
    }, 600);
  };

  const handleMarkArrivalOnly = () => {
    markPatientArrived(appointment.id);
    onClose();
  };

  const handleMarkNoShow = () => {
    markPatientNoShow(appointment.id);
    onClose();
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const txn = processCheckInTransaction(appointment.id, {
      paymentMethod: isWaived ? 'insurance_direct' : paymentMethod,
      paidAmount: isWaived ? 0 : coPayAmount,
      paymentReference: paymentRef,
      cashierName: 'أحمد نبيل (كاونتر 1)',
      waived: isWaived
    });

    if (onSuccessTransaction) {
      onSuccessTransaction(txn);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white p-5 px-6 flex items-center justify-between border-b border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">تسجيل وصول المريض وإجراء المعاملة المالية (Check-in & Billing)</h3>
              <p className="text-xs text-teal-200/80">التحقق من الحضور والأهلية التأمينية وسداد الرسوم لإصدار تذكرة الكشف</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmitTransaction} className="p-6 space-y-5 text-xs">
          {/* Patient Card & Status */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                  {patient.gender === 'male' ? '👨' : '👩'}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{patient.fullNameAr}</div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span>{patient.mrn}</span>
                    <span>•</span>
                    <span>الهوية: {patient.nationalId}</span>
                    <span>•</span>
                    <span>{patient.age} سنة</span>
                  </div>
                </div>
              </div>

              {/* Arrival Status Indicator */}
              <div className="flex items-center gap-2">
                {appointment.status === 'arrived' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>تم تأكيد الوصول بالاستقبال</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>مجدول • لم تؤكد معاملته بعد</span>
                  </span>
                )}
              </div>
            </div>

            {/* Clinic & Target Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">العيادة المستهدفة:</span>
                <strong className="text-slate-900">{clinic.nameAr}</strong>
                <div className="text-[10px] text-teal-700 font-mono mt-0.5">{clinic.roomNo}</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">الطبيب المعالج:</span>
                <strong className="text-slate-900">{clinic.doctorName}</strong>
                <div className="text-[10px] text-slate-500 mt-0.5">{clinic.specialty}</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-0.5">توقيت الحجز ونوعه:</span>
                <strong className="font-mono text-slate-900">{appointment.appointmentTime}</strong>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  {appointment.type === 'routine' && 'كشف مجدول روتيني'}
                  {appointment.type === 'walkin' && 'كشف مباشر'}
                  {appointment.type === 'followup' && 'متابعة وإعادة كشف'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Insurance & Eligibility (NPHIES) */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-xs">الأهلية والتغطية التأمينية (NPHIES Eligibility)</h4>
              </div>

              <button
                type="button"
                onClick={handleVerifyEligibility}
                disabled={isVerifyingEligibility}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>{isVerifyingEligibility ? 'جارِ التحقق من نفيس...' : 'فحص الأهلية الفوري'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">جهة التغطية</span>
                <strong className="text-slate-900 text-xs">{patient.insuranceProvider}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">فئة البوليصة ورقمها</span>
                <strong className="text-slate-900 text-xs font-mono">{patient.insurancePolicyNo || 'CASH-ONLY'}</strong>
                <span className="text-[10px] text-teal-700 font-bold mr-1">({patient.insuranceClass})</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block">نسبة التغطية التأمينية</span>
                <strong className="text-emerald-900 text-sm font-mono font-bold">{coveragePercent}%</strong>
                <span className="text-[10px] text-emerald-600 mr-1 font-sans">
                  {coveragePercent > 0 ? 'مساهمة معتمدة' : 'سداد نقدي كامل'}
                </span>
              </div>
            </div>

            {eligibilityVerified && (
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    تم التحقق من الأهلية بنجاح عبر منصة نفيس (NPHIES) • المعاملة مطابقة لمعايير HL7 FHIR Claim.
                  </span>
                </div>
                <span className="font-mono font-bold text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded">
                  AUTH-ACTIVE
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Financial Transaction Breakdown & Payment */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-xs">تفاصيل المعاملة المالية وسداد نسبة التحمل (Co-Pay)</h4>
              </div>

              <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={isWaived}
                  onChange={e => setIsWaived(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>إعفاء مالي كامل / موافقة استثنائية (Waive Fee)</span>
              </label>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">قيمة الكشف الإجمالية</span>
                <strong className="text-sm font-mono text-slate-900 block mt-0.5">{defaultFee} ج.م</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-blue-700 block">تحمل شركة التأمين</span>
                <strong className="text-sm font-mono text-blue-800 block mt-0.5">
                  {defaultFee - (isWaived ? 0 : coPayAmount)} ج.م
                </strong>
              </div>
              <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 ring-2 ring-teal-500/20">
                <span className="text-[10px] text-teal-800 block font-bold">المطلوب سداده من المريض</span>
                <strong className="text-lg font-mono text-teal-950 block mt-0.5 font-black">
                  {isWaived ? 0 : coPayAmount} ج.م
                </strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            {!isWaived && (
              <div className="space-y-2">
                <label className="text-slate-700 font-bold block">اختر وسيلة الدفع بالخزينة:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mada')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      paymentMethod === 'mada'
                        ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    💳 مدى (Mada)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('visa')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      paymentMethod === 'visa'
                        ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    💳 بطاقة ائتمان (Visa)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    💵 نقداً (Cash)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      paymentMethod === 'apple_pay'
                        ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    📱 Apple Pay
                  </button>
                </div>
              </div>
            )}

            {/* Payment Ref and Custom Co-pay if needed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-600 font-medium block mb-1">الرقم المرجعي للإيصال / العملية:</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-teal-500 bg-white"
                  placeholder="رقم مرجع الإيصال"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">المبلغ المحصل الفعلي (ج.م):</label>
                <input
                  type="number"
                  disabled={isWaived}
                  value={isWaived ? 0 : coPayAmount}
                  onChange={e => setCoPayAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-teal-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Quick Alternative Actions Bar (Arrival Only / No Show) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 text-slate-500 text-[11px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkArrivalOnly}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
                title="تأكيد حضور المريض بالاستقبال فقط وتأجيل المعاملة لاحقاً"
              >
                تأكيد الوصول فقط بدون سداد (Mark Arrived)
              </button>

              <button
                type="button"
                onClick={handleMarkNoShow}
                className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="تسجيل غياب المريض عن الموعد"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>لم يحضر (No-Show)</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-400">إجراء المعاملة المالية يتيح فحص المريض ودخوله للطابور فوراً</span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <Receipt className="w-4 h-4" />
              <span>إتمام المعاملة المالية وإصدار تذكرة الكشف (Process & Start)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
