import React, { useState } from 'react';
import {
  HeartHandshake,
  HeartPulse,
  Pill,
  FlaskConical,
  FileCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  ShieldCheck,
  Activity,
  ClipboardList,
  Sparkles,
  Calendar,
  Ticket,
  UserCheck
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Appointment, MARItem, LabOrder } from '../../types/his';
import { RecordVitalsModal } from '../Modals/RecordVitalsModal';
import { TodayBookingsView } from '../Shared/TodayBookingsView';

export const NursingDashboard: React.FC = () => {
  const {
    currentStaff,
    appointments,
    patients,
    clinics,
    activeClinicId,
    setActiveClinicId,
    marItems,
    labOrders,
    administerMed,
    collectSample,
    setViewPatientModalId,
    openStandardsModal
  } = useHis();

  const [activeTab, setActiveTab] = useState<'bookings' | 'triage' | 'mar' | 'phlebotomy' | 'sbar'>('bookings');
  const [selectedAptForVitals, setSelectedAptForVitals] = useState<Appointment | null>(null);

  // SBAR form state
  const [sbarSituation, setSbarSituation] = useState(
    'نوبة الصباح بالعيادات الخارجية: إجمالي 18 مريضاً، تم فرز 14 مريضاً، وحالتان طوارئ تم إبلاغ طبيب القلب بهما.'
  );
  const [sbarBackground, setSbarBackground] = useState(
    'مريض التذكرة CARD-102 ضغط مرتفع 168/102، تم إعطاء نورفاسك 5 مجم تحت إشراف الطبيب.'
  );
  const [sbarAssessment, setSbarAssessment] = useState(
    'جميع أجهزة القياس ومونيتور العلامات الحيوية تعمل بكفاءة. لا توجد نواقص في أدوات سحب الدم.'
  );
  const [sbarRecommendation, setSbarRecommendation] = useState(
    'إعادة قياس الضغط للمريض CARD-102 قبل مغادرة العيادة والتأكد من نتائج إنزيمات القلب.'
  );
  const [isHandoverGenerated, setIsHandoverGenerated] = useState(false);

  // Filtered lists
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const triageWaiting = appointments.filter(a => a.status === 'checked_in' || a.status === 'triage_pending');
  const triageCompleted = appointments.filter(a => a.status === 'triage_completed' || a.status === 'with_doctor');

  return (
    <div className="space-y-6">
      {/* Nursing Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">محطة تمريض وفرز العيادات الخارجية (Triage Station)</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-800">
                NURSE STATION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              الممرضة المسؤولة: <strong className="text-slate-200">{currentStaff.name}</strong> • {currentStaff.title}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-emerald-700 text-white border border-emerald-600'
                : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700'
            }`}
            title="استعراض جدول حجوزات ومواعيد العيادات لليوم"
          >
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>حجوزات اليوم ({appointments.length})</span>
            {scheduledCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-amber-900 text-amber-300 text-[10px] font-mono">
                {scheduledCount} قادمة
              </span>
            )}
          </button>

          <button
            onClick={() => openStandardsModal(undefined, undefined, 'cbahi')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="سجل بلاغات السلامة وحوادث السقوط CBAHI OVR"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>معايير أمان المرضى (CBAHI / OVR)</span>
          </button>

          <div className="text-right text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 block">بانتظار الفرز والقياس:</span>
            <strong className="text-amber-400 font-mono text-base">{triageWaiting.length} حالات</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جدول حجوزات اليوم واستقبال الحالات ({appointments.length})</span>
            {scheduledCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono font-bold">
                {scheduledCount} قادمة
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'triage'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>قائمة الفرز والعلامات الحيوية ({triageWaiting.length} بالانتظار)</span>
          </button>

          <button
            onClick={() => setActiveTab('mar')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mar'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>سجل إعطاء الأدوية (MAR) ({marItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('phlebotomy')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'phlebotomy'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>سحب العينات والفحوصات ({labOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sbar')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sbar'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>تسليم النوبة السريري (SBAR Handover)</span>
          </button>
        </div>

        {/* Tab 0: Today's Bookings View for Nursing */}
        {activeTab === 'bookings' && (
          <div className="p-6">
            <TodayBookingsView
              roleContext="nurse"
              onSelectPatientForVitals={apt => setSelectedAptForVitals(apt)}
            />
          </div>
        )}

        {/* Tab 1: Triage Vitals */}
        {activeTab === 'triage' && (
          <div className="p-6 space-y-6">
            {/* Urgent Awaiting Vitals */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                مرضى بانتظار أخذ العلامات الحيوية قبل الدخول للطبيب ({triageWaiting.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {triageWaiting.length > 0 ? (
                  triageWaiting.map(apt => {
                    const patient = patients.find(p => p.id === apt.patientId);
                    const clinic = clinics.find(c => c.id === apt.clinicId);
                    if (!patient) return null;

                    return (
                      <div
                        key={apt.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                              {apt.ticketNo}
                            </span>
                            <span className="text-[11px] text-slate-500">{clinic?.nameAr}</span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm">{patient.fullNameAr}</h4>
                          <div className="text-xs text-slate-500 mt-0.5">
                            السن: {patient.age} سنة • فصيلة الدم: {patient.bloodType}
                          </div>

                          <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <strong>الشكوى:</strong> {apt.chiefComplaint}
                          </div>

                          {/* Allergy Warning if exists */}
                          {patient.allergies && !patient.allergies.includes('لا توجد حساسية معروفة (NKDA)') && (
                            <div className="mt-2 text-[11px] text-red-700 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                              <span>حساسية: {patient.allergies.join('، ')}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setViewPatientModalId(patient.id)}
                            className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                          >
                            الملف الطبي
                          </button>

                          <button
                            onClick={() => setSelectedAptForVitals(apt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            <HeartPulse className="w-3.5 h-3.5" />
                            <span>قياس المؤشرات والفرز</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    تم قياس وفرز جميع المرضى الواصلين بالعيادات الخارجية
                  </div>
                )}
              </div>
            </div>

            {/* Completed Triage Section */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                سجل الفرز السريري المكتمل اليوم ({triageCompleted.length})
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم التذكرة</th>
                      <th className="p-3">المريض</th>
                      <th className="p-3">الضغط (BP)</th>
                      <th className="p-3">النبض (HR)</th>
                      <th className="p-3">الحرارة</th>
                      <th className="p-3">SpO2</th>
                      <th className="p-3">إنذار NEWS2</th>
                      <th className="p-3">مستوى الفرز</th>
                      <th className="p-3">تعديل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {triageCompleted.map(apt => {
                      const patient = patients.find(p => p.id === apt.patientId);
                      if (!apt.vitals || !patient) return null;

                      return (
                        <tr key={apt.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-teal-800">{apt.ticketNo}</td>
                          <td className="p-3 font-bold">{patient.fullNameAr}</td>
                          <td className="p-3 font-mono">
                            <span className={apt.vitals.bpSystolic >= 140 ? 'text-red-600 font-bold' : ''}>
                              {apt.vitals.bpSystolic}/{apt.vitals.bpDiastolic}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <span className={apt.vitals.pulseRate >= 100 ? 'text-red-600 font-bold' : ''}>
                              {apt.vitals.pulseRate} bpm
                            </span>
                          </td>
                          <td className="p-3 font-mono">{apt.vitals.temp} °C</td>
                          <td className="p-3 font-mono">{apt.vitals.spo2} %</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              apt.vitals.news2Score >= 4 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {apt.vitals.news2Score}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {apt.vitals.triageLevel.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedAptForVitals(apt)}
                              className="text-teal-700 hover:text-teal-900 font-bold text-xs"
                            >
                              إعادة قياس
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: MAR (Medication Administration Record) */}
        {activeTab === 'mar' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">
                قائمة الأدوية المطلوبة سريرياً من الأطباء للتمريض لإعطائها للمرضى بالعيادات
              </span>
            </div>

            <div className="space-y-3">
              {marItems.map(item => {
                const patient = patients.find(p => p.id === item.patientId);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.medicationName}</span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded font-bold">
                          {item.dose} • طريق: {item.route}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        المريض: <strong className="text-slate-900">{patient?.fullNameAr}</strong> ({patient?.mrn})
                        <span className="mx-2">•</span>
                        وقت الجدولة: <span className="font-mono">{item.scheduledTime}</span>
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-teal-700 mt-1 font-medium bg-teal-50 px-2 py-0.5 rounded inline-block">
                          ملاحظات: {item.notes}
                        </div>
                      )}
                      {item.administeredTime && (
                        <div className="text-[11px] text-emerald-700 mt-1 font-mono">
                          ✓ تم الإعطاء في {item.administeredTime} بواسطة: {item.administeredBy}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'pending' ? (
                        <button
                          onClick={() => administerMed(item.id, 'administered')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>إعطاء الجرعة وتوثيق الوقت (Sign & Administer)</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          تم الإعطاء بنجاح
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Phlebotomy & Lab Orders */}
        {activeTab === 'phlebotomy' && (
          <div className="p-6 space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">كود الفحص</th>
                    <th className="p-3">اسم التحليل / الأشعة</th>
                    <th className="p-3">المريض</th>
                    <th className="p-3">الطبيب الطالب</th>
                    <th className="p-3">وقت الطلب</th>
                    <th className="p-3">الحالة الحالية</th>
                    <th className="p-3 text-center">إجراء التمريض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labOrders.map(lab => {
                    const patient = patients.find(p => p.id === lab.patientId);

                    return (
                      <tr key={lab.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-indigo-700">{lab.testCode}</td>
                        <td className="p-3 font-semibold text-slate-900">{lab.testNameAr}</td>
                        <td className="p-3 font-bold">{patient?.fullNameAr}</td>
                        <td className="p-3 text-slate-600">{lab.orderedBy}</td>
                        <td className="p-3 font-mono">{lab.orderedAt}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lab.status === 'result_ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lab.status === 'sample_collected'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lab.status === 'result_ready'
                              ? 'النتيجة جاهزة'
                              : lab.status === 'sample_collected'
                              ? 'تم سحب العينة'
                              : 'بانتظار السحب'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {lab.status === 'ordered' ? (
                            <button
                              onClick={() => collectSample(lab.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              تأكيد سحب العينة
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {lab.sampleCollectedAt ? `سحبت في ${lab.sampleCollectedAt}` : 'معتمدة'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: SBAR Clinical Handover */}
        {activeTab === 'sbar' && (
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                نموذج تسليم النوبة التمريضية القياسي السريري (SBAR Handover Tool)
              </h3>
              <p className="text-xs text-slate-500">
                تسليم الحالات والمهام بين أطقم التمريض لضمان سلامة المرضى ومنع الأخطاء الطبية
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  1. Situation (الموقف الحالي وحالة العيادات)
                </label>
                <textarea
                  rows={2}
                  value={sbarSituation}
                  onChange={e => setSbarSituation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  2. Background (خلفية الحالات والتاريخ المرضي للنزلاء بالعيادة)
                </label>
                <textarea
                  rows={2}
                  value={sbarBackground}
                  onChange={e => setSbarBackground(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  3. Assessment (التقييم التمريضي وملاحظات السلامة)
                </label>
                <textarea
                  rows={2}
                  value={sbarAssessment}
                  onChange={e => setSbarAssessment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  4. Recommendation (التوصيات والمهام المطلوبة من طاقم النوبة القادمة)
                </label>
                <textarea
                  rows={2}
                  value={sbarRecommendation}
                  onChange={e => setSbarRecommendation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                المسؤولة: {currentStaff.name} • {new Date().toLocaleTimeString('ar-EG')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsHandoverGenerated(true);
                  alert('تم اعتماد وحفظ تقرير تسليم النوبة التمريضية بنجاح.');
                }}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>اعتماد وتوقيع تقرير التسليم</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Vitals Modal */}
      <RecordVitalsModal
        isOpen={Boolean(selectedAptForVitals)}
        onClose={() => setSelectedAptForVitals(null)}
        appointment={selectedAptForVitals}
      />
    </div>
  );
};
