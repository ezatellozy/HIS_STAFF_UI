import React, { useState } from 'react';
import {
  Stethoscope,
  BellRing,
  User,
  HeartPulse,
  ShieldAlert,
  FileText,
  Pill,
  FlaskConical,
  CheckCircle,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileCode,
  GitFork,
  Clock,
  Ticket,
  UserCheck,
  Activity,
  ExternalLink,
  Maximize2,
  Minimize2,
  Users
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import {
  Appointment,
  Patient,
  PrescriptionItem,
  LabOrder,
  ConsultationRecord
} from '../../types/his';
import {
  ICD10_DICTIONARY,
  COMMON_MEDICATIONS,
  STANDARD_INVESTIGATIONS
} from '../../data/mockHisData';
import { ProgressNotesManager } from '../ClinicalNotes/ProgressNotesManager';

export const DoctorDashboard: React.FC = () => {
  const {
    currentStaff,
    clinics,
    activeClinicId,
    setActiveClinicId,
    activeClinic,
    appointments,
    patients,
    callPatient,
    completeAppointment,
    saveConsultation,
    orderLab,
    consultations,
    setPrintPrescriptionData,
    setViewPatientModalId,
    activeConsultationAppointmentId,
    setActiveConsultationAppointmentId,
    playChime,
    openStandardsModal,
    openLifecycleModal,
    progressNotes,
    openProgressNotesModal,
    openPatientWorkspace
  } = useHis();

  // Active clinic queue & bookings
  const clinicAppointments = appointments.filter(a => a.clinicId === activeClinicId);
  const scheduledInClinic = clinicAppointments.filter(a => a.status === 'scheduled');
  const waitingInQueue = clinicAppointments.filter(
    a => a.status === 'checked_in' || a.status === 'triage_pending' || a.status === 'triage_completed'
  );
  const completedInClinic = clinicAppointments.filter(a => a.status === 'completed');

  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'scheduled' | 'completed'>('all');

  // Collapsible Waiting Queue state with persistent preference
  const [isQueueCollapsed, setIsQueueCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('his_doctor_queue_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleQueueCollapse = () => {
    setIsQueueCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('his_doctor_queue_collapsed', String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const nextInLine = waitingInQueue[0];
  const nextPatientObj = nextInLine ? patients.find(p => p.id === nextInLine.patientId) : null;

  // Currently served appointment
  const currentApt = appointments.find(a => a.id === activeConsultationAppointmentId) ||
    clinicAppointments.find(a => a.status === 'with_doctor') ||
    clinicAppointments[0];

  const currentPatient = currentApt ? patients.find(p => p.id === currentApt.patientId) : null;

  // Active tab within Doctor workstation
  const [activeTab, setActiveTab] = useState<'soap' | 'rx' | 'labs' | 'disposition' | 'progress_notes'>('soap');

  // Clinical Consultation Local State
  const existingConsultation = currentApt ? consultations[currentApt.id] : null;

  const [subjective, setSubjective] = useState<string>(
    existingConsultation?.subjective || currentApt?.chiefComplaint || ''
  );
  const [objective, setObjective] = useState<string>(
    existingConsultation?.objective || 'فحص الصدر والقلب: أصوات القلب طبيعية S1 S2، لا توجد لغط أو خرخرة رئوية.'
  );
  const [assessment, setAssessment] = useState<string>(
    existingConsultation?.assessment || 'اشتباه ذبحة صدرية غير مستقرة مع ارتفاع ضغط دم غير منضبط.'
  );
  const [plan, setPlan] = useState<string>(
    existingConsultation?.plan || 'الراحة التامة، عمل إنزيمات قلب ورسم قلب، تقليل الملح، والمتابعة بعد 3 أيام.'
  );

  const [selectedIcd10, setSelectedIcd10] = useState<Array<{ code: string; titleAr: string; titleEn: string }>>(
    existingConsultation?.icd10Codes || [ICD10_DICTIONARY[0], ICD10_DICTIONARY[1]]
  );

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(
    existingConsultation?.prescriptions || [
      {
        id: 'rx-1',
        drugName: 'Amlodipine (Norvasc)',
        genericName: 'Amlodipine Besylate',
        dose: '5 mg',
        form: 'قرص (Tablet)',
        route: 'Oral',
        frequency: 'مرة واحدة يومياً صباحاً',
        duration: '30 يوماً',
        instructions: 'يؤخذ مع أو بدون الطعام'
      },
      {
        id: 'rx-2',
        drugName: 'Bisoprolol (Concor)',
        genericName: 'Bisoprolol Fumarate',
        dose: '2.5 mg',
        form: 'قرص (Tablet)',
        route: 'Oral',
        frequency: 'مرة واحدة يومياً صباحاً',
        duration: '30 يوماً',
        instructions: 'لتنظيم ضربات القلب'
      }
    ]
  );

  const [selectedDisposition, setSelectedDisposition] = useState<'discharge' | 'admit_inpatient' | 'refer_specialty'>(
    existingConsultation?.disposition || 'discharge'
  );

  // New Rx form state
  const [selectedMedIndex, setSelectedMedIndex] = useState<number>(0);
  const [customDrugName, setCustomDrugName] = useState<string>('');
  const [allergyAlertWarning, setAllergyAlertWarning] = useState<string | null>(null);

  // Search ICD-10
  const [icdSearch, setIcdSearch] = useState('');

  // Call Next Patient in Queue
  const handleCallNext = () => {
    const nextInLine = waitingInQueue[0];
    if (nextInLine) {
      callPatient(nextInLine.id);
      setActiveConsultationAppointmentId(nextInLine.id);
      // Reset form fields with new complaint
      setSubjective(nextInLine.chiefComplaint || '');
    } else {
      alert('لا يوجد مرضى بانتظار الكشف في طابور هذه العيادة حالياً');
    }
  };

  // Add prescription item with Allergy checking
  const handleAddMedication = () => {
    const med = COMMON_MEDICATIONS[selectedMedIndex];
    if (!med) return;

    // Check allergy safety!
    const isPenicillinMed = med.name.toLowerCase().includes('augmentin') || med.name.toLowerCase().includes('amoxicillin');
    const patientHasPenicillinAllergy = (currentPatient?.allergies || []).some(a => a.toLowerCase().includes('بنسلين') || a.toLowerCase().includes('penicillin'));

    if (isPenicillinMed && patientHasPenicillinAllergy) {
      setAllergyAlertWarning(`تحذير سلامة سريري حرج: المريض يعاني من حساسية البنسلين (${(currentPatient?.allergies || []).join('، ')})! الدواء المختار (${med.name}) يحتوي على مشتقات البنسلين وقد يسبب صدمة حساسية مفرطة.`);
      playChime('alert');
      return;
    }

    const newRx: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      drugName: med.name,
      genericName: med.generic,
      dose: med.dose,
      form: med.form,
      route: med.route,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions
    };

    setPrescriptions(prev => [...prev, newRx]);
    setAllergyAlertWarning(null);
    playChime('success');
  };

  // Save current consultation
  const handleSaveConsultation = () => {
    if (!currentApt || !currentPatient) return;

    const record: ConsultationRecord = {
      id: `con-${currentApt.id}`,
      appointmentId: currentApt.id,
      patientId: currentPatient.id,
      doctorId: currentStaff.id,
      clinicId: activeClinicId,
      createdAt: new Date().toISOString(),
      subjective,
      objective,
      assessment,
      plan,
      icd10Codes: selectedIcd10,
      prescriptions,
      labOrders: [],
      disposition: selectedDisposition
    };

    saveConsultation(record);
    alert('تم حفظ السجل الطبي والكشف السريري بنجاح');
  };

  // Complete and Close Consultation
  const handleCompleteVisit = () => {
    if (!currentApt || !currentPatient) return;
    handleSaveConsultation();
    completeAppointment(currentApt.id);
    alert(`تم إنهاء كشف المريض ${currentPatient.fullNameAr} وإغلاق الزيارة بنجاح.`);
  };

  // Open Prescription Print Preview
  const handleOpenPrintRx = () => {
    if (!currentApt || !currentPatient) return;
    const record: ConsultationRecord = {
      id: `con-${currentApt.id}`,
      appointmentId: currentApt.id,
      patientId: currentPatient.id,
      doctorId: currentStaff.id,
      clinicId: activeClinicId,
      createdAt: new Date().toISOString(),
      subjective,
      objective,
      assessment,
      plan,
      icd10Codes: selectedIcd10,
      prescriptions,
      labOrders: [],
      disposition: selectedDisposition
    };

    setPrintPrescriptionData({
      patient: currentPatient,
      consultation: record,
      doctor: currentStaff
    });
  };

  return (
    <div className="space-y-6">
      {/* Doctor Clinic Top Header & Call Next Button */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold">{activeClinic.nameAr}</h2>
              <span className="px-2 py-0.5 rounded bg-teal-900 text-teal-300 text-xs font-mono font-bold">
                {activeClinic.roomNo}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              الطبيب المعالج: <strong className="text-slate-200">{currentStaff.name}</strong> • {currentStaff.title}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Collapsible Queue Mode Toggle */}
          <button
            onClick={toggleQueueCollapse}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isQueueCollapsed
                ? 'bg-teal-600 hover:bg-teal-500 text-white border-teal-500 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isQueueCollapsed ? 'إظهار طابور وقائمة الانتظار الجانبي' : 'طي قائمة الانتظار لتوسيع مساحة الكشف السريري بالكامل'}
          >
            {isQueueCollapsed ? (
              <>
                <Users className="w-4 h-4 text-teal-200" />
                <span>طابور الانتظار</span>
                <span className="px-1.5 py-0.2 rounded-full bg-teal-950 text-teal-200 text-[10px] font-mono font-black">
                  {waitingInQueue.length}
                </span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-teal-400" />
                <span>وضع الكشف الواسع</span>
              </>
            )}
          </button>

          {/* Clinic Today's Bookings Filter Pill */}
          <button
            onClick={() => setQueueFilter(queueFilter === 'scheduled' ? 'all' : 'scheduled')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              queueFilter === 'scheduled'
                ? 'bg-teal-700 text-white border-teal-600'
                : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border-slate-700'
            }`}
            title="تصفية الحجوزات القادمة اليوم في طابور العيادة"
          >
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>حجوزات اليوم ({clinicAppointments.length})</span>
            {scheduledInClinic.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-amber-900 text-amber-300 text-[10px] font-mono">
                {scheduledInClinic.length} قادمة
              </span>
            )}
          </button>

          <div className="text-left pl-3 border-l border-slate-800 text-xs text-slate-400 hidden sm:block">
            <span>بالانتظار:</span>
            <strong className="block text-white text-base font-mono">{waitingInQueue.length} مرضى</strong>
          </div>

          <button
            onClick={handleCallNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-teal-500/20 transition-all cursor-pointer"
          >
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>نداء القادم</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Clinic Queue / Right Patient EMR */}
      <div className={`grid gap-6 ${isQueueCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* Left Col: Clinic Patient Queue & Today's Bookings (4 cols - Hidden when collapsed) */}
        {!isQueueCollapsed && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    طابور وحجوزات العيادة ({clinicAppointments.length})
                  </h3>
                  <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {activeClinic.code}
                  </span>
                </div>

                <button
                  onClick={toggleQueueCollapse}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  title="طي القائمة لتوفير أوسع مساحة للكشف السريري"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>طي</span>
                </button>
              </div>

            {/* Sub-filter tabs for Doctor */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-3 text-[11px] font-bold">
              <button
                onClick={() => setQueueFilter('all')}
                className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  queueFilter === 'all'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({clinicAppointments.length})
              </button>

              <button
                onClick={() => setQueueFilter('waiting')}
                className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  queueFilter === 'waiting'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                بالصالة ({waitingInQueue.length})
              </button>

              <button
                onClick={() => setQueueFilter('scheduled')}
                className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  queueFilter === 'scheduled'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                قادمة ({scheduledInClinic.length})
              </button>

              <button
                onClick={() => setQueueFilter('completed')}
                className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  queueFilter === 'completed'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تم ({completedInClinic.length})
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {(() => {
                const filtered = clinicAppointments.filter(apt => {
                  if (queueFilter === 'waiting') {
                    return apt.status === 'checked_in' || apt.status === 'triage_pending' || apt.status === 'triage_completed';
                  }
                  if (queueFilter === 'scheduled') return apt.status === 'scheduled';
                  if (queueFilter === 'completed') return apt.status === 'completed';
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-400">
                      لا توجد مواعيد في هذا القسم حالياً
                    </div>
                  );
                }

                return filtered.map(apt => {
                  const pat = patients.find(p => p.id === apt.patientId);
                  const isCurrent = currentApt?.id === apt.id;

                  return (
                    <div
                      key={apt.id}
                      onClick={() => {
                        setActiveConsultationAppointmentId(apt.id);
                        if (apt.chiefComplaint) setSubjective(apt.chiefComplaint);
                      }}
                      className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                          : apt.status === 'scheduled'
                          ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-teal-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {apt.ticketNo}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-teal-600" />
                            <span>{apt.appointmentTime}</span>
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'with_doctor'
                            ? 'bg-teal-600 text-white animate-pulse'
                            : apt.status === 'triage_completed'
                            ? 'bg-purple-100 text-purple-800'
                            : apt.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'scheduled'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status === 'with_doctor'
                            ? 'الآن بالغرفة'
                            : apt.status === 'triage_completed'
                            ? 'تم الفرز'
                            : apt.status === 'completed'
                            ? 'مكتمل'
                            : apt.status === 'scheduled'
                            ? 'موعد قادم'
                            : 'بالانتظار'}
                        </span>
                      </div>

                      <div className="font-bold text-xs text-slate-900">{pat?.fullNameAr}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{apt.chiefComplaint}</div>

                      {/* Vitals summary if recorded */}
                      {apt.vitals && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                          <span>BP: {apt.vitals.bpSystolic}/{apt.vitals.bpDiastolic}</span>
                          <span>HR: {apt.vitals.pulseRate} bpm</span>
                          <span>SpO2: {apt.vitals.spo2}%</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        )}

        {/* Right Col: Active Patient EMR Workstation (Full width when collapsed, 8 cols when expanded) */}
        <div className={`${isQueueCollapsed ? 'col-span-1' : 'lg:col-span-8'} space-y-4`}>
          {/* Smart Queue Mini-Bar when in Focused Full-Width Mode */}
          {isQueueCollapsed && (
            <div className="bg-white rounded-2xl border border-teal-200/80 p-3 sm:px-4 sm:py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-teal-50/60 via-white to-slate-50">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={toggleQueueCollapse}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="إظهار قائمة وحجوزات العيادة الجانبية"
                >
                  <Users className="w-4 h-4" />
                  <span>إظهار طابور الانتظار</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-950 text-teal-200 text-[10px] font-mono font-black">
                    {waitingInQueue.length}
                  </span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-slate-500">التالي بالانتظار:</span>
                  {nextPatientObj && nextInLine ? (
                    <span className="font-bold text-teal-900 bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200">
                      {nextPatientObj.fullNameAr} ({nextInLine.ticketNo} - {nextInLine.appointmentTime})
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">لا يوجد مرضى بانتظار الكشف حالياً</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCallNext}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="نداء المريض القادم مباشرة دون الحاجة لفتح القائمة"
                >
                  <BellRing className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
                  <span>نداء المريض التالي</span>
                </button>
              </div>
            </div>
          )}
          {currentPatient && currentApt ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Patient Demographics & Clinical Safety Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white">
                {/* Top Row: Patient Identification & Clean Action Toolbar (Zero Crowding) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3.5 border-b border-slate-800/80">
                  {/* Patient Identity */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/60 flex items-center justify-center text-teal-400 font-black text-xl shrink-0 shadow-inner">
                      {currentPatient.fullNameAr[0]}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-lg text-white">
                          {currentPatient.fullNameAr}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-lg bg-teal-950 text-teal-300 border border-teal-700/60 font-mono text-xs font-bold">
                          {currentPatient.mrn}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-700/60 font-mono text-xs font-black">
                          {currentPatient.bloodType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                        <span>السن: <strong className="text-white">{currentPatient.age} سنة</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>النوع: {currentPatient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                        <span className="text-slate-600">•</span>
                        <span>التأمين: <strong className="text-teal-200">{currentPatient.insuranceProvider}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>الهوية: <span className="font-mono text-slate-300">{currentPatient.nationalId}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Quick Actions (No Duplicate Buttons) */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end shrink-0">
                    <button
                      onClick={() => openPatientWorkspace(currentPatient.id, 'summary', { department: 'opd', label: activeClinic.nameAr })}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer"
                      title="فتح مساحة العمل السريرية الموحدة للمريض (10 محاور سريرية)"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>المساحة السريرية الكاملة</span>
                    </button>

                    <button
                      onClick={() => setViewPatientModalId(currentPatient.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      title="عرض الملف الطبي وتاريخ الزيارات السابقة"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>الملف الطبي</span>
                    </button>

                    <button
                      onClick={() => openLifecycleModal(currentPatient.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      title="مسار ودورة المريض السريرية الشاملة"
                    >
                      <GitFork className="w-3.5 h-3.5 text-teal-400" />
                      <span>مسار السايكل</span>
                    </button>

                    <button
                      onClick={() => openStandardsModal(currentPatient.id, currentApt.id, 'fhir')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      title="فحص حزمة HL7 FHIR R4 و NPHIES Pre-Auth"
                    >
                      <FileCode className="w-3.5 h-3.5 text-teal-400" />
                      <span>FHIR • نفيس</span>
                    </button>
                  </div>
                </div>

                {/* HIGH-PRIORITY CLINICAL SAFETY ALERTS (تنبيهات السلامة والحساسية الصارمة) */}
                {currentPatient.allergies &&
                currentPatient.allergies.length > 0 &&
                !currentPatient.allergies.includes('لا توجد حساسية معروفة (NKDA)') ? (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-rose-950/95 to-red-950/90 border-2 border-rose-500 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-600 border border-rose-400 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs text-rose-200 tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                            ⚠️ تحذير سلامة دوائية حرج (Drug Allergy Alert):
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {currentPatient.allergies.map((allergy, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs shadow-xs border border-rose-300"
                              >
                                {allergy}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-rose-100 font-semibold mt-1">
                          يُمنع منعاً باتاً وصف مركبات البيتا لاكتام (بنسلين ومشتقاته) ومضادات السلفوناميد لتفادي صدمة الحساسية المفرطة (Anaphylaxis).
                        </p>
                      </div>
                    </div>

                    {currentApt.vitals && (currentApt.vitals.bpSystolic >= 140 || currentApt.vitals.pulseRate >= 100) && (
                      <div className="px-2.5 py-1 rounded-lg bg-rose-900/90 border border-rose-600 text-[11px] font-bold text-rose-100 shrink-0 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>مؤشرات حيوية غير مستقرة</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold">الحساسية الدوائية:</span>
                      <span>لا توجد حساسية معروفة مسجلة للمريض (NKDA)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700/50">SAFE</span>
                  </div>
                )}

                {/* Chronic Conditions Strip */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold shrink-0">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    <span>الأمراض المزمنة المسجلة:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentPatient.chronicConditions.map((cond, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 text-teal-300 border border-slate-700 text-[11px] font-medium"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cohesive Single Horizontal Vitals Ribbon (الخلية الأولى الأنيقة والواضحة) */}
                {currentApt.vitals ? (
                  <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse sm:divide-slate-800/80">
                    {/* BP */}
                    <div className="py-1 flex flex-col justify-center items-center">
                      <span className="text-slate-400 text-[10px] block">الضغط (BP)</span>
                      <div className="mt-0.5 flex items-center gap-1">
                        <strong className={`font-mono text-sm sm:text-base font-black ${
                          currentApt.vitals.bpSystolic >= 140 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {currentApt.vitals.bpSystolic}/{currentApt.vitals.bpDiastolic}
                        </strong>
                        {currentApt.vitals.bpSystolic >= 140 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                      </div>
                      {currentApt.vitals.bpSystolic >= 140 ? (
                        <span className="text-[9px] text-rose-400 font-bold">مرتفع (St.2)</span>
                      ) : (
                        <span className="text-[9px] text-emerald-400 font-medium">طبيعي</span>
                      )}
                    </div>

                    {/* HR */}
                    <div className="py-1 flex flex-col justify-center items-center">
                      <span className="text-slate-400 text-[10px] block">النبض (HR)</span>
                      <div className="mt-0.5 flex items-center gap-1">
                        <strong className={`font-mono text-sm sm:text-base font-black ${
                          currentApt.vitals.pulseRate >= 100 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {currentApt.vitals.pulseRate}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-sans">bpm</span>
                        {currentApt.vitals.pulseRate >= 100 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                      </div>
                      {currentApt.vitals.pulseRate >= 100 ? (
                        <span className="text-[9px] text-rose-400 font-bold">تسارع</span>
                      ) : (
                        <span className="text-[9px] text-emerald-400 font-medium">طبيعي</span>
                      )}
                    </div>

                    {/* Temp */}
                    <div className="py-1 flex flex-col justify-center items-center">
                      <span className="text-slate-400 text-[10px] block">الحرارة (Temp)</span>
                      <div className="mt-0.5">
                        <strong className={`font-mono text-sm sm:text-base font-black ${
                          currentApt.vitals.temp >= 38 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {currentApt.vitals.temp}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-sans"> °C</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-medium">طبيعي</span>
                    </div>

                    {/* SpO2 */}
                    <div className="py-1 flex flex-col justify-center items-center">
                      <span className="text-slate-400 text-[10px] block">الأكسجين (SpO2)</span>
                      <div className="mt-0.5">
                        <strong className="font-mono text-sm sm:text-base font-black text-emerald-400">
                          % {currentApt.vitals.spo2}
                        </strong>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-medium">طبيعي</span>
                    </div>

                    {/* RBS */}
                    <div className="py-1 flex flex-col justify-center items-center">
                      <span className="text-slate-400 text-[10px] block">السكر (RBS)</span>
                      <div className="mt-0.5">
                        <strong className="font-mono text-sm sm:text-base font-black text-amber-300">
                          {currentApt.vitals.bloodGlucose || '--'}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-sans"> mg/dL</span>
                      </div>
                      <span className="text-[9px] text-amber-400 font-medium">عشوائي</span>
                    </div>

                    {/* NEWS2 Score */}
                    <div className="py-1 flex flex-col justify-center items-center">
                      <span className="text-slate-400 text-[10px] block mb-0.5">إنذار NEWS2</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        currentApt.vitals.news2Score >= 5
                          ? 'bg-rose-600 text-white animate-pulse'
                          : currentApt.vitals.news2Score >= 1
                          ? 'bg-purple-900 text-purple-200 border border-purple-700'
                          : 'bg-emerald-900 text-emerald-200'
                      }`}>
                        {currentApt.vitals.news2Score} نقاط
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 text-center text-xs text-amber-300 bg-amber-950/40 rounded-xl border border-amber-800/80 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>تنبيه: لم يتم تسجيل العلامات الحيوية من محطة التمريض لهذا المريض بعد</span>
                  </div>
                )}
              </div>

              {/* Workstation Tab Bar (Classic Hospital EMR Tabs with Clear Spacing) */}
              <div className="flex border-b border-slate-200 px-4 pt-2 gap-6 bg-slate-50 text-xs font-bold overflow-x-auto">
                <button
                  onClick={() => setActiveTab('soap')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'soap'
                      ? 'border-teal-600 text-teal-800 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Stethoscope className={`w-4 h-4 ${activeTab === 'soap' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>الملاحظات والتشخيص (SOAP & ICD-10)</span>
                </button>

                <button
                  onClick={() => setActiveTab('rx')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'rx'
                      ? 'border-teal-600 text-teal-800 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Pill className={`w-4 h-4 ${activeTab === 'rx' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>الروشتة الإلكترونية ({prescriptions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('labs')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'labs'
                      ? 'border-teal-600 text-teal-800 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FlaskConical className={`w-4 h-4 ${activeTab === 'labs' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>طلب تحاليل وأشعة</span>
                </button>

                <button
                  onClick={() => setActiveTab('disposition')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'disposition'
                      ? 'border-teal-600 text-teal-800 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${activeTab === 'disposition' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>القرار الطبي وموعد المتابعة</span>
                </button>

                <button
                  onClick={() => setActiveTab('progress_notes')}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'progress_notes'
                      ? 'border-teal-600 text-teal-800 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'progress_notes' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>سجل الملاحظات والقوالب ({currentPatient ? progressNotes.filter(n => n.patientId === currentPatient.id).length : 0})</span>
                </button>
              </div>

              {/* Workstation Tab Content */}
              <div className="p-5 text-sm text-slate-800 space-y-4">
                {/* TAB 1: SOAP & ICD-10 */}
                {activeTab === 'soap' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Subjective */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          الشكوى وتاريخ المرض الحالي (Subjective - HPI)
                        </label>
                        <textarea
                          rows={3}
                          value={subjective}
                          onChange={e => setSubjective(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-teal-500"
                          placeholder="سجل شكوى المريض بالتفصيل، مدة الأعراض، العوامل المسببة..."
                        />
                      </div>

                      {/* Objective */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          الفحص السريري الإكلينيكي (Objective - Physical Exam)
                        </label>
                        <textarea
                          rows={3}
                          value={objective}
                          onChange={e => setObjective(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-teal-500"
                          placeholder="فحص الصدر، البطن، النبض المحيطي، الوذمات، الجهاز العصبي..."
                        />
                      </div>
                    </div>

                    {/* ICD-10 Code Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        التشخيص الطبي وتصنيف الأمراض الدولي (ICD-10 Diagnoses):
                      </label>

                      {/* Selected ICD-10 Pills */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedIcd10.map(diag => (
                          <span
                            key={diag.code}
                            className="text-xs px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-medium flex items-center gap-2"
                          >
                            <strong className="font-mono">{diag.code}</strong>: {diag.titleAr}
                            <button
                              type="button"
                              onClick={() => setSelectedIcd10(prev => prev.filter(d => d.code !== diag.code))}
                              className="text-slate-400 hover:text-red-600 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Quick Add ICD-10 */}
                      <div className="flex items-center gap-2">
                        <select
                          onChange={e => {
                            const code = e.target.value;
                            const match = ICD10_DICTIONARY.find(d => d.code === code);
                            if (match && !selectedIcd10.some(s => s.code === code)) {
                              setSelectedIcd10(prev => [...prev, match]);
                            }
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-teal-500"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            + إضافة تشخيص طبي من قائمة ICD-10 المعتمدة...
                          </option>
                          {ICD10_DICTIONARY.map(item => (
                            <option key={item.code} value={item.code}>
                              [{item.code}] {item.titleAr} — {item.titleEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Assessment & Plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          التقييم السريري (Assessment / Impression)
                        </label>
                        <textarea
                          rows={2}
                          value={assessment}
                          onChange={e => setAssessment(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          الخطة العلاجية والتوصيات (Treatment Plan)
                        </label>
                        <textarea
                          rows={2}
                          value={plan}
                          onChange={e => setPlan(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ELECTRONIC PRESCRIPTIONS (E-Rx) */}
                {activeTab === 'rx' && (
                  <div className="space-y-4">
                    {/* Allergy Alert Warning if triggered */}
                    {allergyAlertWarning && (
                      <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs flex items-center gap-2 animate-bounce">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <div>{allergyAlertWarning}</div>
                      </div>
                    )}

                    {/* Add Drug Strip */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-2">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          اختر الدواء من الدليل الدوائي (Formulary)
                        </label>
                        <select
                          value={selectedMedIndex}
                          onChange={e => setSelectedMedIndex(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-teal-500"
                        >
                          {COMMON_MEDICATIONS.map((med, idx) => (
                            <option key={idx} value={idx}>
                              {med.name} ({med.dose}) — {med.frequency}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleAddMedication}
                          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة للروشتة</span>
                        </button>
                      </div>
                    </div>

                    {/* Prescriptions List */}
                    <div className="space-y-2">
                      {prescriptions.map((rx, idx) => (
                        <div
                          key={rx.id || idx}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{rx.drugName}</span>
                              <span className="text-xs font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-bold">
                                {rx.dose}
                              </span>
                              <span className="text-[11px] text-slate-500">[{rx.form} • {rx.route}]</span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              <strong>الجرعة:</strong> {rx.frequency} — <strong>المدة:</strong> {rx.duration}
                              {rx.instructions && <span> — ({rx.instructions})</span>}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPrescriptions(prev => prev.filter(p => p.id !== rx.id))}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="حذف من الروشتة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Prescription Print Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleOpenPrintRx}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <Printer className="w-4 h-4 text-teal-400" />
                        <span>معاينة وطباعة الروشتة الرسمية بختم المستشفى</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: DIAGNOSTIC ORDERS (LAB & RADIOLOGY) */}
                {activeTab === 'labs' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs font-bold text-slate-800 block mb-2">
                        طلب تحاليل وفحوصات عاجلة (Order Diagnostic Tests):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STANDARD_INVESTIGATIONS.map(test => (
                          <button
                            key={test.code}
                            type="button"
                            onClick={() => {
                              orderLab({
                                patientId: currentPatient.id,
                                appointmentId: currentApt.id,
                                testCode: test.code,
                                testNameAr: test.nameAr,
                                testNameEn: test.nameEn,
                                category: test.category,
                                priority: 'stat'
                              });
                              alert(`تم إرسال طلب ${test.nameAr} إلى المختبر/قسم الأشعة`);
                            }}
                            className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-right text-xs transition-all flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{test.nameAr}</div>
                              <div className="text-[10px] text-slate-500 font-mono" dir="ltr">{test.code}</div>
                            </div>
                            <Plus className="w-4 h-4 text-teal-600" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: DISPOSITION */}
                {activeTab === 'disposition' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        القرار الطبي النهائي لتصريف المريض (Patient Disposition):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDisposition('discharge')}
                          className={`p-3 rounded-xl border text-right transition-all ${
                            selectedDisposition === 'discharge'
                              ? 'border-teal-600 bg-teal-50 font-bold ring-2 ring-teal-500/20'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs text-slate-900">خروج مع علاج منزلي (Discharge)</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">استقرار الحالة وصرف الروشتة</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDisposition('admit_inpatient')}
                          className={`p-3 rounded-xl border text-right transition-all ${
                            selectedDisposition === 'admit_inpatient'
                              ? 'border-red-600 bg-red-50 font-bold ring-2 ring-red-500/20'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs text-red-900">طلب حجز داخلي / عناية (Admit)</div>
                          <div className="text-[11px] text-red-600 mt-0.5">تحويل للأقسام الداخلية بالمستشفى</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDisposition('refer_specialty')}
                          className={`p-3 rounded-xl border text-right transition-all ${
                            selectedDisposition === 'refer_specialty'
                              ? 'border-blue-600 bg-blue-50 font-bold ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs text-blue-900">تحويل لعيادة تخصصية أخرى</div>
                          <div className="text-[11px] text-blue-600 mt-0.5">استشارة جراحة / باطنة متقدمة</div>
                        </button>
                      </div>

                      {selectedDisposition === 'admit_inpatient' && (
                        <div className="mt-3 p-3.5 bg-teal-50 border border-teal-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                          <div>
                            <span className="text-xs font-bold text-teal-900 block">
                              جاهز للتسكين ونقل السايكل السريرية (Admit & Bed Allocation):
                            </span>
                            <span className="text-[11px] text-teal-700">
                              يمكنك فورياً اختيار سرير التنويم في Ward 3A/3B أو حجز مسرح العمليات أو العناية المركزة
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openLifecycleModal(currentPatient.id)}
                            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                          >
                            فتح نافذة التسكين واختيار السرير
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: PROGRESS NOTES & TEMPLATES */}
                {activeTab === 'progress_notes' && currentPatient && (
                  <div className="pt-2">
                    <ProgressNotesManager patientId={currentPatient.id} defaultRoleFilter="doctor" />
                  </div>
                )}
              </div>

              {/* Consultation Bottom Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveConsultation}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  حفظ مسودة الملاحظات (Save EMR)
                </button>

                <button
                  type="button"
                  onClick={handleCompleteVisit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>إنهاء الكشف الطبي واعتماد الزيارة (Complete Visit)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs text-slate-500">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">لا يوجد مريض محدد حالياً داخل غرفة الكشف</h4>
              <p className="text-xs text-slate-400 mt-1">
                اضغط على زر "نداء المريض القادم" أو اختر مريضاً من قائمة طابور العيادة لبدء الفحص السريري.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
