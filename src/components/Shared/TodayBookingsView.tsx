import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Ticket,
  User,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  CreditCard,
  HeartPulse,
  Stethoscope,
  ChevronRight,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  UserCheck,
  Receipt,
  UserX,
  Printer
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Appointment, Patient, Clinic, StaffRole } from '../../types/his';
import { CheckInTransactionModal } from '../Modals/CheckInTransactionModal';
import { TransactionReceiptModal } from '../Modals/TransactionReceiptModal';

interface TodayBookingsViewProps {
  initialClinicId?: string;
  hideClinicSelector?: boolean;
  roleContext?: StaffRole;
  onOpenBookingModal?: () => void;
  onSelectPatientForVitals?: (apt: Appointment) => void;
}

export const TodayBookingsView: React.FC<TodayBookingsViewProps> = ({
  initialClinicId,
  hideClinicSelector = false,
  roleContext,
  onOpenBookingModal,
  onSelectPatientForVitals
}) => {
  const {
    appointments,
    patients,
    clinics,
    currentRole,
    checkInAppointment,
    markPatientArrived,
    transactions,
    activeTransactionModalAppointmentId,
    setActiveTransactionModalAppointmentId,
    selectedReceiptTransaction,
    setSelectedReceiptTransaction,
    callPatient,
    setActiveConsultationAppointmentId,
    setViewPatientModalId,
    openStandardsModal,
    playChime
  } = useHis();

  const role = roleContext || currentRole;

  const [selectedClinic, setSelectedClinic] = useState<string>(initialClinicId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'queue' | 'with_doctor' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Parse chronological time for sorting
  const parseTimeWeight = (timeStr: string) => {
    // Expected format e.g. "11:45 ص" or "01:30 م"
    const isPM = timeStr.includes('م') || timeStr.toLowerCase().includes('pm');
    const clean = timeStr.replace(/[^0-9:]/g, '');
    const parts = clean.split(':');
    let hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Base list filtered by clinic
  const clinicFilteredAppointments = useMemo(() => {
    if (selectedClinic === 'all') return appointments;
    return appointments.filter(a => a.clinicId === selectedClinic);
  }, [appointments, selectedClinic]);

  // Overall KPIs for today
  const totalBookings = clinicFilteredAppointments.length;
  const scheduledCount = clinicFilteredAppointments.filter(a => a.status === 'scheduled').length;
  const inQueueCount = clinicFilteredAppointments.filter(
    a => a.status === 'checked_in' || a.status === 'triage_pending' || a.status === 'triage_completed'
  ).length;
  const withDoctorCount = clinicFilteredAppointments.filter(a => a.status === 'with_doctor').length;
  const completedCount = clinicFilteredAppointments.filter(a => a.status === 'completed').length;

  // Filtered and sorted appointments
  const displayedAppointments = useMemo(() => {
    return clinicFilteredAppointments
      .filter(apt => {
        // Status filter
        if (statusFilter === 'scheduled' && apt.status !== 'scheduled') return false;
        if (
          statusFilter === 'queue' &&
          !['checked_in', 'triage_pending', 'triage_completed'].includes(apt.status)
        )
          return false;
        if (statusFilter === 'with_doctor' && apt.status !== 'with_doctor') return false;
        if (statusFilter === 'completed' && apt.status !== 'completed') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const patient = patients.find(p => p.id === apt.patientId);
          const clinic = clinics.find(c => c.id === apt.clinicId);
          const matchName =
            patient?.fullNameAr.toLowerCase().includes(q) ||
            patient?.fullNameEn.toLowerCase().includes(q);
          const matchMrn = patient?.mrn.toLowerCase().includes(q);
          const matchPhone = patient?.phone.includes(q);
          const matchTicket = apt.ticketNo.toLowerCase().includes(q);
          const matchClinic = clinic?.nameAr.toLowerCase().includes(q);
          const matchDoctor = clinic?.doctorName.toLowerCase().includes(q);
          return matchName || matchMrn || matchPhone || matchTicket || matchClinic || matchDoctor;
        }

        return true;
      })
      .sort((a, b) => parseTimeWeight(a.appointmentTime) - parseTimeWeight(b.appointmentTime));
  }, [clinicFilteredAppointments, statusFilter, searchQuery, patients, clinics]);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>موعد مجدول • لم يصل</span>
          </span>
        );
      case 'arrived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 animate-pulse">
            <UserCheck className="w-3 h-3 text-blue-700" />
            <span>وصل للاستقبال • بانتظار المعاملة</span>
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تمت المعاملة • بصالة الانتظار</span>
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <UserX className="w-3 h-3 text-red-600" />
            <span>لم يحضر (No-Show)</span>
          </span>
        );
      case 'triage_pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <HeartPulse className="w-3 h-3 text-amber-700" />
            <span>بانتظار الفرز والقياس</span>
          </span>
        );
      case 'triage_completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <CheckCircle2 className="w-3 h-3 text-purple-600" />
            <span>تم الفرز • جاهز لغرفة الكشف</span>
          </span>
        );
      case 'with_doctor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300 animate-pulse">
            <Stethoscope className="w-3 h-3 text-teal-700" />
            <span>داخل غرفة الكشف مع الطبيب</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تم إنهاء الكشف بنجاح</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Appointment['priority']) => {
    switch (priority) {
      case 'emergency':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            طارئ عاجل
          </span>
        );
      case 'elderly':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            كبار السن
          </span>
        );
      case 'child':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
            أطفال رضع
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
            عادي
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">جدول حجوزات ومواعيد العيادات اليوم (Today's Bookings)</h2>
              <span className="px-2 py-0.5 rounded bg-teal-900 text-teal-300 text-xs font-mono font-bold border border-teal-700">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة مواعيد الكشوفات المجدولة، المرضى الحاضرين في صالة الانتظار، وحالات الدخول للأطباء
            </p>
          </div>
        </div>

        {onOpenBookingModal && (
          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>حجز كشف جديد لليوم</span>
          </button>
        )}
      </div>

      {/* 4 Interactive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Bookings */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-teal-500/50'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              إجمالي مواعيد اليوم
            </span>
            <Calendar className={`w-4 h-4 ${statusFilter === 'all' ? 'text-teal-400' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono">{totalBookings}</span>
            <span className={`text-[11px] ${statusFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>
              كشف مجدول
            </span>
          </div>
        </div>

        {/* Scheduled / Upcoming */}
        <div
          onClick={() => setStatusFilter('scheduled')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'scheduled'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/50'
              : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${statusFilter === 'scheduled' ? 'text-amber-100' : 'text-amber-700'}`}>
              بانتظار حضور المريض
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'scheduled' ? 'text-amber-200' : 'text-amber-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${statusFilter === 'scheduled' ? 'text-white' : 'text-amber-700'}`}>
              {scheduledCount}
            </span>
            <span className={`text-[11px] ${statusFilter === 'scheduled' ? 'text-amber-100' : 'text-amber-600'}`}>
              لم يصلوا بعد
            </span>
          </div>
        </div>

        {/* In Waiting Queue */}
        <div
          onClick={() => setStatusFilter('queue')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'queue'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/50'
              : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${statusFilter === 'queue' ? 'text-blue-100' : 'text-blue-700'}`}>
              في صالة الانتظار
            </span>
            <Ticket className={`w-4 h-4 ${statusFilter === 'queue' ? 'text-blue-200' : 'text-blue-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${statusFilter === 'queue' ? 'text-white' : 'text-blue-700'}`}>
              {inQueueCount}
            </span>
            <span className={`text-[11px] ${statusFilter === 'queue' ? 'text-blue-100' : 'text-blue-600'}`}>
              سجلوا الحضور
            </span>
          </div>
        </div>

        {/* With Doctor */}
        <div
          onClick={() => setStatusFilter('with_doctor')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'with_doctor'
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-400/50'
              : 'bg-white border-slate-200 text-slate-800 hover:border-teal-300 hover:bg-teal-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${statusFilter === 'with_doctor' ? 'text-teal-100' : 'text-teal-700'}`}>
              داخل غرف الأطباء
            </span>
            <Stethoscope className={`w-4 h-4 ${statusFilter === 'with_doctor' ? 'text-teal-200' : 'text-teal-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${statusFilter === 'with_doctor' ? 'text-white' : 'text-teal-700'}`}>
              {withDoctorCount}
            </span>
            <span className={`text-[11px] ${statusFilter === 'with_doctor' ? 'text-teal-100' : 'text-teal-600'}`}>
              قيد الكشف
            </span>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400/50'
              : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${statusFilter === 'completed' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              كشوفات مكتملة
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'completed' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${statusFilter === 'completed' ? 'text-white' : 'text-emerald-700'}`}>
              {completedCount}
            </span>
            <span className={`text-[11px] ${statusFilter === 'completed' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              تم إنهاؤها
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Clinic Selector (if not hidden) */}
          {!hideClinicSelector && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">العيادة:</span>
              <select
                value={selectedClinic}
                onChange={e => setSelectedClinic(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 focus:ring-teal-500 bg-slate-50 focus:bg-white"
              >
                <option value="all">جميع العيادات التخصصية ({appointments.length})</option>
                {clinics.map(c => {
                  const count = appointments.filter(a => a.clinicId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.nameAr} ({c.code}) - {count} مواعيد
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">الحالة:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            >
              <option value="all">جميع الحالات ({totalBookings})</option>
              <option value="scheduled">بانتظار الحضور فقط ({scheduledCount})</option>
              <option value="queue">في صالة الانتظار ({inQueueCount})</option>
              <option value="with_doctor">داخل غرفة الكشف ({withDoctorCount})</option>
              <option value="completed">كشوفات مكتملة ({completedCount})</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عرض الجدول
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                viewMode === 'cards' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عرض المواعيد الزمنية
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] max-w-xs flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث بالمريض، رقم الملف، الهاتف، التذكرة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:bg-white bg-slate-50 text-xs"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 text-center">وقت الموعد</th>
                  <th className="p-3.5">رقم التذكرة</th>
                  <th className="p-3.5">المريض ورقم الملف (MRN)</th>
                  <th className="p-3.5">العيادة والطبيب المعالج</th>
                  <th className="p-3.5">نوع الكشف والأولوية</th>
                  <th className="p-3.5">الشكوى المبدئية</th>
                  <th className="p-3.5">التأمين والتحصيل</th>
                  <th className="p-3.5">الحالة الحالية</th>
                  <th className="p-3.5 text-center">إجراءات الموعد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedAppointments.length > 0 ? (
                  displayedAppointments.map(apt => {
                    const patient = patients.find(p => p.id === apt.patientId);
                    const clinic = clinics.find(c => c.id === apt.clinicId);
                    if (!patient || !clinic) return null;

                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Appointment Time */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-xs">
                            <Clock className="w-3 h-3 text-teal-600" />
                            <span>{apt.appointmentTime}</span>
                          </span>
                        </td>

                        {/* Ticket Number */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-mono font-extrabold text-xs text-teal-900 bg-teal-50 border border-teal-200 px-2 py-1 rounded-lg">
                            {apt.ticketNo}
                          </span>
                        </td>

                        {/* Patient & MRN */}
                        <td className="p-3.5">
                          <button
                            onClick={() => setViewPatientModalId(patient.id)}
                            className="font-bold text-slate-900 hover:text-teal-700 text-right transition-colors"
                          >
                            {patient.fullNameAr}
                          </button>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{patient.mrn}</span>
                            <span>•</span>
                            <span>{patient.age} سنة</span>
                            <span>•</span>
                            <span>{patient.phone}</span>
                          </div>
                        </td>

                        {/* Clinic & Doctor */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{clinic.nameAr}</div>
                          <div className="text-[11px] text-teal-700">{clinic.doctorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{clinic.roomNo}</div>
                        </td>

                        {/* Visit Type & Priority */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-700 text-[11px] mb-1">
                            {apt.type === 'routine' && 'موعد مجدول روتيني'}
                            {apt.type === 'followup' && 'متابعة وإعادة كشف'}
                            {apt.type === 'walkin' && 'كشف عاجل مباشر'}
                            {apt.type === 'emergency' && 'حالة طوارئ'}
                          </div>
                          {getPriorityBadge(apt.priority)}
                        </td>

                        {/* Chief Complaint */}
                        <td className="p-3.5 max-w-[200px]">
                          <div className="text-slate-800 font-medium truncate" title={apt.chiefComplaint}>
                            {apt.chiefComplaint}
                          </div>
                        </td>

                        {/* Insurance & Payment */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900 font-mono">{apt.patientCoPay} ج.م</div>
                          <div className="text-[10px] text-slate-500">{patient.insuranceProvider}</div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block ${
                              apt.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {apt.paymentStatus === 'paid' ? 'مسدد بالكامل' : 'معلق بالخزينة'}
                          </span>
                        </td>

                        {/* Current Status */}
                        <td className="p-3.5 whitespace-nowrap">{getStatusBadge(apt.status)}</td>

                        {/* Actions */}
                        <td className="p-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Action based on status */}
                            {apt.status === 'scheduled' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setActiveTransactionModalAppointmentId(apt.id)}
                                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                  title="المريض وصل الآن - تسجيل الوصول وإجراء المعاملة المالية وإصدار التذكرة"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>وصول ومعاملة</span>
                                </button>
                                <button
                                  onClick={() => markPatientArrived(apt.id)}
                                  className="px-2 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer"
                                  title="تأكيد وصول المريض بالاستقبال فقط"
                                >
                                  وصل
                                </button>
                              </div>
                            )}

                            {apt.status === 'arrived' && (
                              <button
                                onClick={() => setActiveTransactionModalAppointmentId(apt.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                                title="المريض حاضر بالاستقبال - إتمام المعاملة وسداد الكشف"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>سداد المعاملة</span>
                              </button>
                            )}

                            {/* If in queue, Nurse action */}
                            {(apt.status === 'checked_in' || apt.status === 'triage_pending') && onSelectPatientForVitals && (
                              <button
                                onClick={() => onSelectPatientForVitals(apt)}
                                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="أخذ العلامات الحيوية والفرز التمريضي"
                              >
                                <HeartPulse className="w-3.5 h-3.5" />
                                <span>فرز وتمريض</span>
                              </button>
                            )}

                            {/* Doctor action */}
                            {(apt.status === 'checked_in' || apt.status === 'triage_completed') && role === 'doctor' && (
                              <button
                                onClick={() => {
                                  callPatient(apt.id);
                                  setActiveConsultationAppointmentId(apt.id);
                                }}
                                className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="استدعاء المريض لغرفة الكشف"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>استدعاء للطبيب</span>
                              </button>
                            )}

                            {/* Receipt Button for checked-in or completed */}
                            {(apt.status === 'checked_in' || apt.status === 'triage_pending' || apt.status === 'triage_completed' || apt.status === 'with_doctor' || apt.status === 'completed') && (
                              <button
                                onClick={() => {
                                  const txn = transactions.find(t => t.appointmentId === apt.id) || apt.transaction;
                                  if (txn) {
                                    setSelectedReceiptTransaction(txn);
                                  } else {
                                    setSelectedReceiptTransaction({
                                      id: apt.transactionId || `TXN-2026-${apt.ticketNo}`,
                                      appointmentId: apt.id,
                                      patientId: patient.id,
                                      patientName: patient.fullNameAr,
                                      mrn: patient.mrn,
                                      clinicId: clinic.id,
                                      clinicName: clinic.nameAr,
                                      doctorName: clinic.doctorName,
                                      receiptNo: `REC-99${apt.ticketNo.replace(/\D/g, '') || '01'}`,
                                      timestamp: apt.appointmentTime,
                                      consultationFee: apt.consultationFee,
                                      insuranceDiscount: apt.consultationFee - apt.patientCoPay,
                                      patientCoPay: apt.patientCoPay,
                                      paymentMethod: 'mada',
                                      paymentReference: 'AUTH-PAID',
                                      cashierName: 'أحمد نبيل (كاونتر 1)',
                                      status: 'completed',
                                      invoiceType: 'opd_consultation'
                                    });
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="عرض وطباعة سند القبض وتذكرة الطابور"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-600" />
                              </button>
                            )}

                            {/* Standard NPHIES verification button */}
                            <button
                              onClick={() => openStandardsModal(patient.id, apt.id, 'nphies')}
                              className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                              title="التحقق من أهلية التأمين NPHIES ومطابقة FHIR"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>

                            {/* View Full Patient File */}
                            <button
                              onClick={() => setViewPatientModalId(patient.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              title="عرض ملف المريض الإلكتروني الكامل"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto mb-2 flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-600">لا توجد حجوزات مطابقة لخيارات التصفية الحالية</p>
                      <p className="text-xs text-slate-400 mt-1">
                        يمكنك تغيير العيادة أو إزالة الفلاتر لعرض كافة مواعيد اليوم
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline / Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedAppointments.length > 0 ? (
            displayedAppointments.map(apt => {
              const patient = patients.find(p => p.id === apt.patientId);
              const clinic = clinics.find(c => c.id === apt.clinicId);
              if (!patient || !clinic) return null;

              return (
                <div
                  key={apt.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
                    apt.status === 'scheduled'
                      ? 'border-amber-200 hover:border-amber-400 bg-amber-50/20'
                      : apt.status === 'with_doctor'
                      ? 'border-teal-400 ring-2 ring-teal-400/20 bg-teal-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header: Time & Ticket */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>{apt.appointmentTime}</span>
                    </span>

                    <span className="font-mono font-extrabold text-xs text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                      {apt.ticketNo}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-3">
                    <button
                      onClick={() => setViewPatientModalId(patient.id)}
                      className="font-bold text-sm text-slate-900 hover:text-teal-700 text-right block"
                    >
                      {patient.fullNameAr}
                    </button>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                      <span>{patient.mrn}</span>
                      <span>•</span>
                      <span>{patient.age} سنة</span>
                      <span>•</span>
                      <span>{patient.phone}</span>
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>{clinic.nameAr}</span>
                      <span className="font-mono text-[10px] text-teal-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {clinic.roomNo}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{clinic.doctorName}</div>
                  </div>

                  {/* Complaint */}
                  <div className="text-xs text-slate-700 mb-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-500 text-[10px] block">سبب الزيارة:</span>
                    <span className="font-medium truncate block">{apt.chiefComplaint}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>{getStatusBadge(apt.status)}</div>
                    {getPriorityBadge(apt.priority)}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {apt.status === 'scheduled' ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveTransactionModalAppointmentId(apt.id)}
                          className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>وصول ومعاملة</span>
                        </button>
                        <button
                          onClick={() => markPatientArrived(apt.id)}
                          className="px-2.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                          title="تأكيد وصول المريض بالاستقبال"
                        >
                          وصل
                        </button>
                      </div>
                    ) : apt.status === 'arrived' ? (
                      <button
                        onClick={() => setActiveTransactionModalAppointmentId(apt.id)}
                        className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>سداد المعاملة</span>
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center gap-1.5">
                        <button
                          onClick={() => setViewPatientModalId(patient.id)}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الملف</span>
                        </button>
                        {(apt.status === 'checked_in' || apt.status === 'triage_pending' || apt.status === 'triage_completed' || apt.status === 'with_doctor' || apt.status === 'completed') && (
                          <button
                            onClick={() => {
                              const txn = transactions.find(t => t.appointmentId === apt.id) || apt.transaction;
                              if (txn) {
                                setSelectedReceiptTransaction(txn);
                              } else {
                                setSelectedReceiptTransaction({
                                  id: apt.transactionId || `TXN-2026-${apt.ticketNo}`,
                                  appointmentId: apt.id,
                                  patientId: patient.id,
                                  patientName: patient.fullNameAr,
                                  mrn: patient.mrn,
                                  clinicId: clinic.id,
                                  clinicName: clinic.nameAr,
                                  doctorName: clinic.doctorName,
                                  receiptNo: `REC-99${apt.ticketNo.replace(/\D/g, '') || '01'}`,
                                  timestamp: apt.appointmentTime,
                                  consultationFee: apt.consultationFee,
                                  insuranceDiscount: apt.consultationFee - apt.patientCoPay,
                                  patientCoPay: apt.patientCoPay,
                                  paymentMethod: 'mada',
                                  paymentReference: 'AUTH-PAID',
                                  cashierName: 'أحمد نبيل (كاونتر 1)',
                                  status: 'completed',
                                  invoiceType: 'opd_consultation'
                                });
                              }
                            }}
                            className="p-2 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="عرض سند القبض وتذكرة الكشف"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => openStandardsModal(patient.id, apt.id, 'nphies')}
                      className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                      title="فحص أهلية التأمين NPHIES"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-10 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
              لا توجد مواعيد مطابقة لخيارات التصفية
            </div>
          )}
        </div>
      )}

      {/* CheckIn Transaction Modal */}
      <CheckInTransactionModal
        isOpen={!!activeTransactionModalAppointmentId}
        appointmentId={activeTransactionModalAppointmentId}
        onClose={() => setActiveTransactionModalAppointmentId(null)}
        onSuccessTransaction={txn => {
          setSelectedReceiptTransaction(txn);
        }}
      />

      {/* Transaction Receipt & Queue Ticket Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedReceiptTransaction}
        transaction={selectedReceiptTransaction}
        onClose={() => setSelectedReceiptTransaction(null)}
      />
    </div>
  );
};
