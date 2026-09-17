import React, { useState } from 'react';
import { X, Calendar, Ticket, User, Building2, CreditCard, CheckCircle } from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Patient, Clinic, Appointment } from '../../types/his';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatient?: Patient | null;
  onSuccess?: (appointment: Appointment) => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedPatient,
  onSuccess
}) => {
  const { patients, clinics, bookAppointment } = useHis();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient?.id || (patients.length > 0 ? patients[0].id : '')
  );
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    clinics.length > 0 ? clinics[0].id : ''
  );
  const [visitType, setVisitType] = useState<Appointment['type']>('walkin');
  const [priority, setPriority] = useState<Appointment['priority']>('normal');
  const [chiefComplaint, setChiefComplaint] = useState<string>('كشف واستشارة طبية جديدة بالعيادة');
  const [bookingMode, setBookingMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('12:00 م');

  if (!isOpen) return null;

  const currentPatient = patients.find(p => p.id === selectedPatientId) || preselectedPatient || patients[0];
  const currentClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];

  // Pricing calculation
  const baseFee = 450;
  const coverage = currentPatient ? currentPatient.insuranceCoveragePercent : 0;
  const patientCoPay = Math.round(baseFee * (1 - coverage / 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient || !currentClinic) return;

    const apt = bookAppointment({
      patientId: currentPatient.id,
      clinicId: currentClinic.id,
      doctorId: currentClinic.doctorId,
      priority,
      chiefComplaint,
      type: bookingMode === 'scheduled' ? 'routine' : visitType,
      consultationFee: baseFee,
      patientCoPay,
      status: bookingMode === 'immediate' ? 'checked_in' : 'scheduled',
      appointmentTime: bookingMode === 'immediate' 
        ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : selectedTimeSlot
    });

    if (onSuccess) {
      onSuccess(apt);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">حجز موعد بالعيادات الخارجية وإصدار تذكرة (OPD Ticket)</h3>
              <p className="text-xs text-slate-400">توجيه المريض إلى العيادة التخصصية وتحديد أولويات الفرز</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm text-slate-800">
          {/* Patient Selector or Selected Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              اختيار المريض (Select Patient)
            </label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullNameAr} ({p.mrn}) - {p.phone} - [{p.insuranceProvider}]
                </option>
              ))}
            </select>

            {currentPatient && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{currentPatient.fullNameAr}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="text-teal-700 font-mono font-bold">{currentPatient.mrn}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span>العمر: {currentPatient.age} سنة ({currentPatient.gender === 'male' ? 'ذكر' : 'أنثى'})</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  {currentPatient.insuranceClass} ({currentPatient.insuranceCoveragePercent}% تغطية)
                </span>
              </div>
            )}
          </div>

          {/* Clinic & Specialty */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              العيادة التخصصية المطلوبة (Target OPD Clinic)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {clinics.map(clinic => {
                const isSelected = clinic.id === selectedClinicId;
                return (
                  <button
                    type="button"
                    key={clinic.id}
                    onClick={() => setSelectedClinicId(clinic.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{clinic.nameAr}</div>
                      <div className="text-[11px] text-slate-500">{clinic.doctorName}</div>
                      <div className="text-[10px] text-teal-600 font-mono mt-0.5">{clinic.roomNo}</div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                      {clinic.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Mode: Immediate Queue vs Scheduled Slot */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <label className="block text-xs font-bold text-slate-800">طريقة إدراج الكشف:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setBookingMode('immediate')}
                className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  bookingMode === 'immediate'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs">حضور مباشر بالصالة (Check-in Now)</div>
                  <div className="text-[10px] text-slate-500 font-normal">إصدار تذكرة فورية وإدراج بطابور الانتظار</div>
                </div>
                <Ticket className="w-4 h-4 text-blue-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('scheduled')}
                className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  bookingMode === 'scheduled'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs">حجز موعد مجدول لليوم (Scheduled)</div>
                  <div className="text-[10px] text-slate-500 font-normal">إدراج بجدول الحجوزات لحين وصول المريض</div>
                </div>
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              </button>
            </div>

            {bookingMode === 'scheduled' && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">وقت الحجز اليوم:</label>
                <select
                  value={selectedTimeSlot}
                  onChange={e => setSelectedTimeSlot(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-teal-300 bg-white focus:ring-teal-500 text-teal-900"
                >
                  <option value="11:30 ص">11:30 ص (صباحاً)</option>
                  <option value="12:00 م">12:00 م (ظهراً)</option>
                  <option value="12:30 م">12:30 م (ظهراً)</option>
                  <option value="01:00 م">01:00 م (ظهراً)</option>
                  <option value="01:30 م">01:30 م (ظهراً)</option>
                  <option value="02:00 م">02:00 م (عصراً)</option>
                  <option value="02:30 م">02:30 م (عصراً)</option>
                  <option value="03:00 م">03:00 م (عصراً)</option>
                  <option value="03:30 م">03:30 م (عصراً)</option>
                  <option value="04:00 م">04:00 م (مساءً)</option>
                </select>
              </div>
            )}
          </div>

          {/* Priority & Visit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الزيارة</label>
              <select
                value={visitType}
                onChange={e => setVisitType(e.target.value as Appointment['type'])}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
              >
                <option value="walkin">كشف عاجل / مباشر (Walk-in)</option>
                <option value="routine">موعد مسبق روتيني (Scheduled)</option>
                <option value="followup">إعادة كشف / متابعة مجانية (Follow-up)</option>
                <option value="emergency">حالة طارئة محولة (Emergency / Stat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">فئة الأولوية (Priority Tier)</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Appointment['priority'])}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
              >
                <option value="normal">عادي (Normal Queue)</option>
                <option value="elderly">كبار السن وأصحاب الهمم (Senior Citizens)</option>
                <option value="child">أطفال رضع (Pediatric Priority)</option>
                <option value="emergency">أولوية قصوى / فرز أحمر (Emergency Tier)</option>
              </select>
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الشكوى المبدئية / سبب الزيارة</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              placeholder="مثال: ألم بالصدر، استشارة باطنة، صداع مستمر..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-teal-500"
            />
          </div>

          {/* Fee & Billing Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <div>
                  <span className="font-bold text-xs text-emerald-900">رسوم الكشف والتحصيل الفوري:</span>
                  <div className="text-[11px] text-emerald-700">
                    قيمة الكشف: {baseFee} ج.م • نسبة التغطية التأمينية: {coverage}%
                  </div>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs text-emerald-800 block">المبلغ المطلوب سداده:</span>
                <span className="text-lg font-extrabold text-emerald-950 font-mono">
                  {patientCoPay} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>إصدار التذكرة وتحويل المريض للفرز (Issue Ticket)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
