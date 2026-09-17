import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  Building2,
  Stethoscope,
  Volume2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Play,
  BadgeCheck,
  CheckCheck,
  FileCheck,
  ShieldCheck,
  Search,
  Sliders,
  Ticket,
  UserPlus
} from 'lucide-react';
import {
  AppointmentEntity,
  EncounterEntity,
  PatientAccessRecord,
  PatientFlowPolicyType
} from '../../types/patientAccessAdt';
import { announcePatientCallSpeech, getPatientCallTextPreview } from '../../utils/audioAnnouncement';

interface ArrivalOpdFlowViewProps {
  appointments: AppointmentEntity[];
  encounters: EncounterEntity[];
  patients: PatientAccessRecord[];
  onMarkArrival: (appointmentId: string) => void;
  onPerformCheckIn: (appointmentId: string) => void;
  onStartClinicalEncounter?: (encounterId: string) => void;
  onAddWalkIn: (patient: PatientAccessRecord, clinicName: string, doctorName: string) => void;
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
}

export const ArrivalOpdFlowView: React.FC<ArrivalOpdFlowViewProps> = ({
  appointments,
  encounters,
  patients,
  onMarkArrival,
  onPerformCheckIn,
  onStartClinicalEncounter,
  onAddWalkIn,
  onOpenPatientWorkspace
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flowPolicy, setFlowPolicy] = useState<PatientFlowPolicyType>('policy_a_sequential');
  const [queueTicketEnabled, setQueueTicketEnabled] = useState<boolean>(true);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [selectedWalkInPatientId, setSelectedWalkInPatientId] = useState(patients[0]?.id || '');
  const [walkInClinic, setWalkInClinic] = useState('عيادة الفرز العام والباطنية');
  const [walkInDoctor, setWalkInDoctor] = useState('د. أحمد السالم');
  const [selectedDialect, setSelectedDialect] = useState<'standard' | 'gulf' | 'egypt'>('standard');
  const [callingAptId, setCallingAptId] = useState<string | null>(null);
  const [previewCallApt, setPreviewCallApt] = useState<AppointmentEntity | null>(null);

  // Filtered Appointments
  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      apt.patientNameAr.includes(q) ||
      apt.mrn.toLowerCase().includes(q) ||
      apt.clinicNameAr.includes(q) ||
      apt.appointmentNumber.toLowerCase().includes(q)
    );
  });

  // Audio PA Call for OPD Ticket
  const handleAnnounceCall = (apt: AppointmentEntity) => {
    setCallingAptId(apt.id);
    announcePatientCallSpeech(
      {
        ticketNo: apt.appointmentNumber.replace('APT-2026-', 'A-'),
        patientName: apt.patientNameAr,
        clinicName: apt.clinicNameAr,
        roomNo: 'غرفة الفحص 1',
        dialect: selectedDialect
      },
      {
        onEnd: () => {
          setCallingAptId(null);
        }
      }
    );
  };

  const handleCreateWalkIn = () => {
    const pt = patients.find(p => p.id === selectedWalkInPatientId);
    if (!pt) return;
    onAddWalkIn(pt, walkInClinic, walkInDoctor);
    setIsWalkInModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Invariant Education & Separation */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>الفصل المعماري: الموعد (Appointment) ≠ الزيارة (Encounter) | الوصول ≠ الدخول</span>
          </div>
          <h2 className="text-xl font-black text-white">إدارة تدفق العيادات الخارجية: الوصول والدخول والنداء</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            <strong>تسجيل الوصول (Arrival):</strong> إثبات الوجود الفيزيائي للمراجع بالمنشأة (مستقل عن إصدار التذكرة).<br />
            <strong>تسجيل الدخول (Check-in):</strong> قبول إداري وتفعيل للزيارة السريرية (Encounter) حسب سياسة التدفق المعيّنة.<br />
            <strong>تعيين الطبيب/الفريق:</strong> مستقل عملياتياً عن Check-in (قد يتم مسبقاً، بعد الفرز، أو عبر سياسة القسم).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Dialect Selector for Hospital PA (Optional presentation feature) */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">لهجة النداء:</span>
            <select
              value={selectedDialect}
              onChange={e => setSelectedDialect(e.target.value as any)}
              className="bg-slate-900 text-emerald-300 font-bold border border-slate-600 rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value="standard">فصحى معتمدة (Standard)</option>
              <option value="gulf">صيغة خليجية (Gulf)</option>
              <option value="egypt">صيغة مصرية (Egypt)</option>
            </select>
          </div>

          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-emerald-400"
          >
            <PlusCircle className="w-4 h-4" />
            <span>مريض بدون موعد (Walk-in)</span>
          </button>
        </div>
      </div>

      {/* Configured Patient Flow Policy Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">سياسة تدفق المرضى المهيأة (Configured Patient Flow Policy):</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={queueTicketEnabled}
                onChange={e => setQueueTicketEnabled(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <Ticket className="w-3.5 h-3.5 text-blue-500" />
              <span>نظام التذاكر والطوابير مفعّل للمنطقة (Queue Ticket Optional)</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {[
            {
              id: 'policy_a_sequential' as PatientFlowPolicyType,
              title: 'السياسة (أ): تتابعية معيارية',
              desc: 'وصول فيزيائي (Arrival) ← دخول إداري (Check-in) ← تفعيل الزيارة السريرية (Encounter).'
            },
            {
              id: 'policy_b_combined' as PatientFlowPolicyType,
              title: 'السياسة (ب): دمج تشغيلي فوري',
              desc: 'دمج خطوة الوصول مع الدخول في نقطة واحدة (محطات الخدمة الذاتية أو العيادات السريعة).'
            },
            {
              id: 'policy_c_precreated_encounter' as PatientFlowPolicyType,
              title: 'السياسة (ج): الزيارة مُعدّة مسبقاً',
              desc: 'الزيارة (Encounter) مُنشأة ومخططة مسبقاً، وتسجيل الدخول يقوم بتفعيلها فقط.'
            },
            {
              id: 'policy_d_emergency_first' as PatientFlowPolicyType,
              title: 'السياسة (د): بدء الزيارة أولاً',
              desc: 'فتح الزيارة السريرية فوراً للإنقاذ، وتأجيل الدخول والبيانات الإدارية لاحقاً.'
            }
          ].map(pol => (
            <button
              key={pol.id}
              onClick={() => setFlowPolicy(pol.id)}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                flowPolicy === pol.id
                  ? 'bg-blue-50/70 border-blue-400 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <strong className="block text-[11px] font-black">{pol.title}</strong>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">{pol.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block">إجمالي مواعيد اليوم</span>
          <strong className="text-2xl font-black text-slate-900 mt-1 block">{appointments.length}</strong>
          <span className="text-[11px] text-slate-400">موزعة عبر عيادات الصباح</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-amber-600 font-bold block">وصلوا المركز (Arrived)</span>
          <strong className="text-2xl font-black text-amber-700 mt-1 block">
            {appointments.filter(a => a.status === 'arrived').length}
          </strong>
          <span className="text-[11px] text-slate-400">بانتظار إنهاء الدخول الإداري</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-emerald-600 font-bold block">تم الدخول (Checked-in)</span>
          <strong className="text-2xl font-black text-emerald-700 mt-1 block">
            {appointments.filter(a => a.status === 'checked_in').length}
          </strong>
          <span className="text-[11px] text-slate-400">زيارات Encounter نشطة حالياً</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-blue-600 font-bold block">مواعيد لم تحضر بعد</span>
          <strong className="text-2xl font-black text-blue-700 mt-1 block">
            {appointments.filter(a => a.status === 'booked' || a.status === 'confirmed').length}
          </strong>
          <span className="text-[11px] text-slate-400">مجدولة للفترات القادمة</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المريض، رقم الموعد أو العيادة..."
            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs shrink-0">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'booked', label: 'مجدول (Booked)' },
            { id: 'confirmed', label: 'مؤكد (Confirmed)' },
            { id: 'arrived', label: 'وصل المركز (Arrived)' },
            { id: 'checked_in', label: 'تم الدخول (Checked-in)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Flow Cards */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            لا توجد مواعيد تطابق الفلتر المحدد
          </div>
        ) : (
          filteredAppointments.map(apt => {
            const hasArrived = apt.status === 'arrived' || apt.status === 'checked_in';
            const isCheckedIn = apt.status === 'checked_in';
            const matchingEncounter = encounters.find(e => e.originatingAppointmentId === apt.id);
            const isCalling = callingAptId === apt.id;

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-sm ${
                  isCheckedIn
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : hasArrived
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Patient & Clinic Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-base font-black text-slate-900">{apt.patientNameAr}</h4>
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {apt.mrn}
                      </span>
                      <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {apt.appointmentNumber}
                      </span>
                      {isCheckedIn ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-300">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          تم الدخول الإداري (Encounter Active)
                        </span>
                      ) : hasArrived ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          وصل للمبنى (Arrived - Waiting Check-in)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          مجدول (Scheduled)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <strong className="text-slate-800">{apt.clinicNameAr}</strong>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-slate-400" />
                        <span>{apt.doctorNameAr}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>الوقت المجدول: <strong className="font-mono">{apt.scheduledTime}</strong></span>
                      </span>

                      {apt.arrivalRecordedAt && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                          سُجّل الوصول: {apt.arrivalRecordedAt}
                        </span>
                      )}

                      {apt.checkInRecordedAt && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                          سُجّل الدخول: {apt.checkInRecordedAt}
                        </span>
                      )}
                    </div>

                    {matchingEncounter && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg inline-flex items-center gap-2 mt-1 flex-wrap">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>معرف الزيارة الفعالة (Encounter): <strong className="font-mono">{matchingEncounter.encounterNumber}</strong></span>
                        <span>• الموقع: {matchingEncounter.currentLocation.room}</span>
                        {matchingEncounter.clinicalCareStartedAt ? (
                          <span className="text-indigo-900 bg-indigo-100/80 px-2 py-0.5 rounded font-bold">
                            • بدأ الفحص السريري: {matchingEncounter.clinicalCareStartedAt}
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
                            • بانتظار استدعاء الطبيب وبدء الفحص السريري
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Flow Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    {/* Call Patient (Voice PA) */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAnnounceCall(apt)}
                        disabled={isCalling}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
                        title="تشغيل النداء الصوتي (محاكاة متصفح تجريبية)"
                      >
                        <Volume2 className={`w-4 h-4 ${isCalling ? 'text-amber-600 animate-pulse' : 'text-slate-600'}`} />
                        <span>{isCalling ? 'جاري النداء...' : 'نداء صوتي'}</span>
                      </button>

                      <button
                        onClick={() => setPreviewCallApt(apt)}
                        className="px-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs cursor-pointer"
                        title="معاينة نص النداء ثنائي اللغة"
                      >
                        نص النداء
                      </button>
                    </div>

                    {/* Step 1: Record Physical Arrival */}
                    {!hasArrived && (
                      <button
                        onClick={() => onMarkArrival(apt.id)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>تسجيل الوصول (Arrival)</span>
                      </button>
                    )}

                    {/* Step 2: Administrative Check-in & Open Encounter */}
                    {!isCheckedIn && (
                      <button
                        onClick={() => onPerformCheckIn(apt.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <BadgeCheck className="w-4 h-4" />
                        <span>تسجيل الدخول الإداري (Check-in)</span>
                      </button>
                    )}

                    {/* Step 3: Clinical Encounter Start (Decoupled from Check-in) */}
                    {isCheckedIn && matchingEncounter && !matchingEncounter.clinicalCareStartedAt && onStartClinicalEncounter && (
                      <button
                        onClick={() => onStartClinicalEncounter(matchingEncounter.id)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="تسجيل بدء الفحص السريري الفعلي وتوثيق الطابع الزمني"
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>بدء الفحص السريري (Clinical Start)</span>
                      </button>
                    )}

                    {/* Open Patient Workspace directly */}
                    {isCheckedIn && (
                      <button
                        onClick={() => onOpenPatientWorkspace(apt.mrn, matchingEncounter?.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span>فتح السجل السريري للزيارة</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Walk-in Patient */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                إدراج مريض بدون موعد مسبق (Walk-in OPD Registration)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تفتح زيارة فورية مباشرة دون اشتراط وجود موعد سابق، مع مراعاة قدرة العيادة الاستيعابية.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر المريض المسجل بالملف المركزي *</label>
                <select
                  value={selectedWalkInPatientId}
                  onChange={e => setSelectedWalkInPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullNameAr} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العيادة المستهدفة *</label>
                <select
                  value={walkInClinic}
                  onChange={e => setWalkInClinic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="عيادة الفرز العام والباطنية">عيادة الفرز العام والباطنية</option>
                  <option value="عيادة أمراض القلب التخصصية">عيادة أمراض القلب التخصصية</option>
                  <option value="عيادة جراحة العظام">عيادة جراحة العظام</option>
                  <option value="عيادة المخ والأعصاب">عيادة المخ والأعصاب</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الطبيب المعالج *</label>
                <input
                  type="text"
                  value={walkInDoctor}
                  onChange={e => setWalkInDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateWalkIn}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                إنشاء الموعد وبدء الدخول الفوري
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Voice Announcement Preview */}
      {previewCallApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">معاينة النداء الصوتي لصالة الانتظار</h3>
              </div>
              <button
                onClick={() => setPreviewCallApt(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <strong>تنبيه توضيحي:</strong> النداء الصوتي هو بروفايل عرض تفاعلي اختياري لصالات الانتظار والعيادات،
              وليس مكوناً إلزامياً لهيكل بيانات ADT المركزي. النطق التلقائي يعتمد على محرك SpeechSynthesis بالمتصفح.
            </div>

            {(() => {
              const preview = getPatientCallTextPreview({
                ticketNo: previewCallApt.appointmentNumber.replace('APT-2026-', 'A-'),
                patientName: previewCallApt.patientNameAr,
                clinicName: previewCallApt.clinicNameAr,
                roomNo: 'غرفة الفحص 1',
                dialect: selectedDialect
              });

              return (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">صيغة النداء بالعربية ({selectedDialect}):</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm leading-relaxed">
                      {preview.arabicText}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">صيغة النداء بالإنجليزية (Secondary English Chime):</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 text-xs">
                      {preview.englishText}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                المريض: <strong>{previewCallApt.patientNameAr}</strong> | العيادة: <strong>{previewCallApt.clinicNameAr}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewCallApt(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    handleAnnounceCall(previewCallApt);
                    setPreviewCallApt(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>تشغيل النداء الآن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
