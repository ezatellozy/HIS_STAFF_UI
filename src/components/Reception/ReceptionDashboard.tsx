import React, { useState } from 'react';
import {
  UserPlus,
  Ticket,
  Search,
  CheckCircle,
  Clock,
  Building2,
  Users,
  CreditCard,
  FileText,
  AlertCircle,
  Eye,
  Printer,
  ChevronLeft,
  Calendar,
  UserCheck,
  Receipt,
  UserX,
  DollarSign,
  Filter
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Appointment, Patient, BillingTransaction } from '../../types/his';
import { NewPatientModal } from '../Modals/NewPatientModal';
import { BookAppointmentModal } from '../Modals/BookAppointmentModal';
import { CheckInTransactionModal } from '../Modals/CheckInTransactionModal';
import { TransactionReceiptModal } from '../Modals/TransactionReceiptModal';
import { TodayBookingsView } from '../Shared/TodayBookingsView';

export const ReceptionDashboard: React.FC = () => {
  const {
    patients,
    appointments,
    clinics,
    checkInAppointment,
    markPatientArrived,
    markPatientNoShow,
    transactions,
    activeTransactionModalAppointmentId,
    setActiveTransactionModalAppointmentId,
    selectedReceiptTransaction,
    setSelectedReceiptTransaction,
    setViewPatientModalId,
    activeClinicId,
    openStandardsModal
  } = useHis();

  const [activeTab, setActiveTab] = useState<'bookings' | 'queue' | 'patients' | 'billing'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [billingMethodFilter, setBillingMethodFilter] = useState<string>('all');

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [preselectedPatientForBooking, setPreselectedPatientForBooking] = useState<Patient | null>(null);

  // Statistics
  const totalRegistered = patients.length;
  const todayAppointments = appointments.length;
  const arrivedCount = appointments.filter(a => a.status === 'arrived').length;
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const waitingPatients = appointments.filter(
    a => a.status === 'checked_in' || a.status === 'triage_pending' || a.status === 'triage_completed'
  ).length;
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.patientCoPay || 0), 0);
  const totalInsuranceClaims = transactions.reduce((sum, t) => sum + (t.insuranceDiscount || 0), 0);

  // Filtered appointments
  const filteredAppointments = appointments.filter(apt => {
    const patient = patients.find(p => p.id === apt.patientId);
    if (!patient) return false;

    // Clinic filter
    if (selectedClinicFilter !== 'all' && apt.clinicId !== selectedClinicFilter) return false;

    // Status filter
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = patient.fullNameAr.toLowerCase().includes(q) || patient.fullNameEn.toLowerCase().includes(q);
      const matchMrn = patient.mrn.toLowerCase().includes(q);
      const matchPhone = patient.phone.includes(q);
      const matchTicket = apt.ticketNo.toLowerCase().includes(q);
      return matchName || matchMrn || matchPhone || matchTicket;
    }

    return true;
  });

  // Filtered patients for MPI
  const filteredPatients = patients.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullNameAr.toLowerCase().includes(q) ||
      p.fullNameEn.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.nationalId.includes(q)
    );
  });

  // Filtered billing transactions
  const filteredTransactions = transactions.filter(t => {
    if (billingMethodFilter !== 'all' && t.paymentMethod !== billingMethodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.patientName.toLowerCase().includes(q) ||
        t.mrn.toLowerCase().includes(q) ||
        t.receiptNo.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>مجدول • لم يصل</span>
          </span>
        );
      case 'arrived':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1 w-fit animate-pulse">
            <UserCheck className="w-3 h-3 text-blue-700" />
            <span>وصل للاستقبال • بانتظار المعاملة</span>
          </span>
        );
      case 'checked_in':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>تمت المعاملة • بالطابور</span>
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 w-fit">
            <UserX className="w-3 h-3 text-red-600" />
            <span>لم يحضر (No-Show)</span>
          </span>
        );
      case 'triage_pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">بانتظار الفرز (Triage)</span>;
      case 'triage_completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">تم الفرز • جاهز للطبيب</span>;
      case 'with_doctor':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 animate-pulse">داخل غرفة الكشف</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">تم الكشف بنجاح</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Metric Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Bookings */}
        <div
          onClick={() => setActiveTab('bookings')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">حجوزات ومواعيد اليوم</span>
              <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">{todayAppointments}</strong>
              <span className="text-[11px] text-teal-700 font-medium font-mono">
                {scheduledCount} قادمة • {todayAppointments - scheduledCount} بالخدمة
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 2: Live Waiting Queue */}
        <div
          onClick={() => setActiveTab('queue')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">في صالات الانتظار الآن</span>
              <strong className="text-2xl font-black text-blue-700 font-mono mt-1 block">{waitingPatients}</strong>
              <span className="text-[11px] text-blue-600 font-medium">سجلوا حضورهم وبالطابور</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 3: Master Patients Index (MPI) */}
        <div
          onClick={() => setActiveTab('patients')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'patients'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">إجمالي المرضى المسجلين</span>
              <strong className="text-2xl font-black text-purple-900 font-mono mt-1 block">{totalRegistered}</strong>
              <span className="text-[11px] text-purple-700 font-medium">سجلات مركزية نشطة (MPI)</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 4: Billing Revenue */}
        <div
          onClick={() => setActiveTab('billing')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">تحصيل الخزينة اليوم</span>
              <strong className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{totalRevenue} ج.م</strong>
              <span className="text-[11px] text-emerald-600 font-medium">شامل نسب التحمل والتأمين</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNewPatientModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل مريض جديد (MRN)</span>
          </button>

          <button
            onClick={() => {
              setPreselectedPatientForBooking(null);
              setIsBookModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>حجز كشف عيادة لليوم (Booking)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الملف MRN، الهاتف، التذكرة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center border-b border-slate-200 px-6 pt-3 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جدول حجوزات ومواعيد اليوم ({todayAppointments})</span>
            {scheduledCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono font-bold">
                {scheduledCount} قادمة
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'queue'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>طابور صالات الانتظار الحالية ({waitingPatients})</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'patients'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل المرضى العام (MPI) ({patients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>صندوق التحصيل والتأمينات (Billing)</span>
          </button>
        </div>

        {/* Tab 0: Master Today's Bookings */}
        {activeTab === 'bookings' && (
          <div className="p-6">
            <TodayBookingsView
              onOpenBookingModal={() => {
                setPreselectedPatientForBooking(null);
                setIsBookModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 1: Queue Management */}
        {activeTab === 'queue' && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">تصفية حسب العيادة:</span>
                <select
                  value={selectedClinicFilter}
                  onChange={e => setSelectedClinicFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-teal-500"
                >
                  <option value="all">جميع العيادات التخصصية</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">الحالة:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-teal-500"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="scheduled">بانتظار الحضور (Scheduled)</option>
                  <option value="checked_in">حضر بالاستقبال (Arrived)</option>
                  <option value="triage_pending">بانتظار الفرز (Triage)</option>
                  <option value="triage_completed">تم الفرز (جاهز)</option>
                  <option value="with_doctor">داخل غرفة الطبيب (In-progress)</option>
                  <option value="completed">تم الكشف (Finished)</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">رقم التذكرة</th>
                    <th className="p-3">المريض ورقم الملف</th>
                    <th className="p-3">العيادة والطبيب</th>
                    <th className="p-3">وقت الحجز</th>
                    <th className="p-3">الأولوية والشكوى</th>
                    <th className="p-3">التأمين والرسوم</th>
                    <th className="p-3">الحالة الحالية</th>
                    <th className="p-3 text-center">إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(apt => {
                      const patient = patients.find(p => p.id === apt.patientId);
                      const clinic = clinics.find(c => c.id === apt.clinicId);
                      if (!patient || !clinic) return null;

                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-extrabold text-sm text-teal-800 bg-teal-50 border border-teal-200 px-2 py-1 rounded-lg">
                              {apt.ticketNo}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{patient.fullNameAr}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{patient.mrn}</span>
                              <span>•</span>
                              <span>{patient.phone}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{clinic.nameAr}</div>
                            <div className="text-[11px] text-teal-700">{clinic.doctorName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{clinic.roomNo}</div>
                          </td>
                          <td className="p-3 font-mono text-slate-600">{apt.appointmentTime}</td>
                          <td className="p-3 max-w-[200px]">
                            <div className="text-slate-800 font-medium truncate">{apt.chiefComplaint}</div>
                            {apt.priority === 'emergency' && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                                طارئ عاجل
                              </span>
                            )}
                            {apt.priority === 'elderly' && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                                كبار سن
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 font-mono">{apt.patientCoPay} ج.م</div>
                            <div className="text-[10px] text-slate-500">{patient.insuranceProvider}</div>
                          </td>
                          <td className="p-3">{getStatusBadge(apt.status)}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* If scheduled */}
                              {apt.status === 'scheduled' && (
                                <>
                                  <button
                                    onClick={() => setActiveTransactionModalAppointmentId(apt.id)}
                                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                    title="المريض وصل - إجراء المعاملة المالية وإصدار تذكرة الكشف"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span>وصول ومعاملة</span>
                                  </button>
                                  <button
                                    onClick={() => markPatientArrived(apt.id)}
                                    className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                                    title="تأكيد حضور المريض بالاستقبال فقط وتأجيل المعاملة"
                                  >
                                    وصل
                                  </button>
                                </>
                              )}

                              {/* If arrived */}
                              {apt.status === 'arrived' && (
                                <button
                                  onClick={() => setActiveTransactionModalAppointmentId(apt.id)}
                                  className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700 text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer animate-pulse"
                                  title="المريض حاضر بالاستقبال - إتمام المعاملة المالية وسداد الكشف"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>سداد المعاملة</span>
                                </button>
                              )}

                              {/* If checked_in or later, receipt button */}
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
                                  className="px-2 py-1 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="عرض وطباعة سند القبض وتذكرة الطابور"
                                >
                                  <Printer className="w-3 h-3 text-slate-600" />
                                  <span>السند</span>
                                </button>
                              )}

                              <button
                                onClick={() => openStandardsModal(patient.id, apt.id, 'nphies')}
                                className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 transition-colors"
                                title="التحقق من أهلية التأمين عبر منصة نفيس (NPHIES) ومطابقة FHIR"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setViewPatientModalId(patient.id)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                title="عرض ملف المريض الكامل"
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
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        لا توجد مواعيد مطابقة لخيارات البحث أو التصفية الحالية
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Master Patient Index (MPI) */}
        {activeTab === 'patients' && (
          <div className="p-6 space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">رقم الملف (MRN)</th>
                    <th className="p-3">اسم المريض الكامل</th>
                    <th className="p-3">الرقم القومي</th>
                    <th className="p-3">السن / النوع</th>
                    <th className="p-3">الهاتف</th>
                    <th className="p-3">جهة التأمين</th>
                    <th className="p-3">تنبيهات الحساسية</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map(pat => (
                    <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-teal-800">{pat.mrn}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{pat.fullNameAr}</div>
                        <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{pat.fullNameEn}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{pat.nationalId}</td>
                      <td className="p-3">{pat.age} سنة ({pat.gender === 'male' ? 'ذكر' : 'أنثى'})</td>
                      <td className="p-3 font-mono" dir="ltr">{pat.phone}</td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{pat.insuranceProvider}</span>
                        <div className="text-[10px] text-slate-500 font-mono">{pat.insuranceClass} ({pat.insuranceCoveragePercent}%)</div>
                      </td>
                      <td className="p-3">
                        {(!pat.allergies || pat.allergies.includes('لا توجد حساسية معروفة (NKDA)')) ? (
                          <span className="text-[10px] text-slate-400">لا توجد حساسية</span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            {(pat.allergies || []).join('، ')}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setPreselectedPatientForBooking(pat);
                              setIsBookModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            حجز كشف
                          </button>
                          <button
                            onClick={() => openStandardsModal(pat.id, undefined, 'nphies')}
                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700"
                            title="فحص أهلية نفيس وملف FHIR"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewPatientModalId(pat.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title="عرض الملف الطبي"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Billing Summary */}
        {activeTab === 'billing' && (
          <div className="p-6 space-y-6">
            {/* NPHIES Compliance Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-400" />
                  <h4 className="font-bold text-sm">منظومة تدقيق مطالبات التأمين الموحدة (NPHIES e-Claims & Scrubbing Engine)</h4>
                  <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-400/40 px-2 py-0.5 rounded">
                    HL7 FHIR Claim R4
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  تدقيق آلي للأكواد السريرية (ICD-10-CM / SBS) ومطابقة الجنس والعمر لتفادي رفض المطالبات التأمينية بنسبة خطأ 0%.
                </p>
              </div>

              <button
                onClick={() => openStandardsModal(undefined, undefined, 'nphies')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                فتح بوابة نفيس للمطالبات والموافقات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">المتحصلات الفعلية من المرضى (Co-Pay)</span>
                <strong className="text-xl font-bold text-slate-900 font-mono">
                  {totalRevenue} ج.م
                </strong>
                <span className="text-[10px] text-teal-700 block mt-0.5 font-medium">سداد فوري بالخزينة (مدى، نقداً، بطاقات)</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xs text-blue-700 block mb-1">مطالبات شركات التأمين (Insurance Claims)</span>
                <strong className="text-xl font-bold text-blue-900 font-mono">
                  {totalInsuranceClaims} ج.م
                </strong>
                <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">مفوترة إلكترونياً ومعتمدة عبر نفيس</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-700 block mb-1">إجمالي الفواتير الصادرة اليوم</span>
                <strong className="text-xl font-bold text-emerald-900 font-mono">
                  {totalRevenue + totalInsuranceClaims} ج.م
                </strong>
                <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">{transactions.length} معاملة مالية ناجحة</span>
              </div>
            </div>

            {/* Filter bar for transactions */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">تصفية حسب وسيلة السداد:</span>
                <select
                  value={billingMethodFilter}
                  onChange={e => setBillingMethodFilter(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="all">جميع وسائل السداد</option>
                  <option value="mada">مدى (Mada)</option>
                  <option value="visa">فيزا / ماستركارد (Visa)</option>
                  <option value="cash">نقداً بالخزينة (Cash)</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="insurance_direct">تغطية مباشرة 100%</option>
                </select>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                عرض {filteredTransactions.length} من أصل {transactions.length} معاملة
              </span>
            </div>

            {/* Transactions Ledger Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">رقم السند</th>
                    <th className="p-3">رقم المعاملة</th>
                    <th className="p-3">الوقت</th>
                    <th className="p-3">المريض</th>
                    <th className="p-3">العيادة والطبيب</th>
                    <th className="p-3">قيمة الكشف</th>
                    <th className="p-3">تحمل التأمين</th>
                    <th className="p-3">المسدد من المريض</th>
                    <th className="p-3">طريقة السداد</th>
                    <th className="p-3">أمين الصندوق</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-teal-800">{txn.receiptNo}</td>
                        <td className="p-3 font-mono text-slate-600 text-[11px]">{txn.id}</td>
                        <td className="p-3 font-mono text-slate-600">{txn.timestamp}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{txn.patientName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{txn.mrn}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{txn.clinicName}</div>
                          <div className="text-[10px] text-slate-500">{txn.doctorName}</div>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-800">{txn.consultationFee} ج.م</td>
                        <td className="p-3 font-mono text-blue-700">-{txn.insuranceDiscount} ج.م</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold text-xs">{txn.patientCoPay} ج.م</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 inline-block font-mono">
                            {txn.paymentMethod === 'mada' && '💳 مدى'}
                            {txn.paymentMethod === 'visa' && '💳 فيزا'}
                            {txn.paymentMethod === 'cash' && '💵 نقداً'}
                            {txn.paymentMethod === 'apple_pay' && '📱 Apple Pay'}
                            {txn.paymentMethod === 'insurance_direct' && '🛡️ تأمين 100%'}
                          </span>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">{txn.paymentReference}</div>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 font-medium">{txn.cashierName}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedReceiptTransaction(txn)}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition-colors flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
                            title="عرض وإعادة طباعة سند القبض"
                          >
                            <Printer className="w-3 h-3 text-teal-700" />
                            <span>طباعة السند</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400">
                        لا توجد معاملات مطابقة لخيارات التصفية الحالية
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSuccess={pat => {
          setPreselectedPatientForBooking(pat);
          setIsBookModalOpen(true);
        }}
      />

      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setPreselectedPatientForBooking(null);
        }}
        preselectedPatient={preselectedPatientForBooking}
      />

      <CheckInTransactionModal
        isOpen={!!activeTransactionModalAppointmentId}
        appointmentId={activeTransactionModalAppointmentId}
        onClose={() => setActiveTransactionModalAppointmentId(null)}
        onSuccessTransaction={txn => {
          setSelectedReceiptTransaction(txn);
        }}
      />

      <TransactionReceiptModal
        isOpen={!!selectedReceiptTransaction}
        transaction={selectedReceiptTransaction}
        onClose={() => setSelectedReceiptTransaction(null)}
      />
    </div>
  );
};
