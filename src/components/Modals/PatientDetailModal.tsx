import React from 'react';
import { X, User, Phone, MapPin, ShieldAlert, Heart, Calendar, FileText, FlaskConical, Pill, GitFork } from 'lucide-react';
import { useHis } from '../../context/HisContext';

export const PatientDetailModal: React.FC = () => {
  const {
    viewPatientModalId,
    setViewPatientModalId,
    openLifecycleModal,
    openProgressNotesModal,
    progressNotes,
    patients,
    appointments,
    labOrders
  } = useHis();

  if (!viewPatientModalId) return null;

  const patient = patients.find(p => p.id === viewPatientModalId);
  if (!patient) return null;

  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
  const patientLabs = labOrders.filter(l => l.patientId === patient.id);
  const patientNotes = progressNotes.filter(n => n.patientId === patient.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-base">
              {patient.fullNameAr[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{patient.fullNameAr}</h3>
                <span className="px-2 py-0.5 rounded bg-teal-900 text-teal-300 font-mono text-xs font-bold">
                  {patient.mrn}
                </span>
              </div>
              <p className="text-xs text-slate-400" dir="ltr">
                {patient.fullNameEn} • National ID: {patient.nationalId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewPatientModalId(null);
                openProgressNotesModal(patient.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              title="عرض وتوثيق الملاحظات السريرية والقوالب"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>الملاحظات السريرية ({patientNotes.length})</span>
            </button>
            <button
              onClick={() => {
                setViewPatientModalId(null);
                openLifecycleModal(patient.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              title="عرض مسار ودورة المريض السريرية الشاملة"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>دورة المريض الشاملة</span>
            </button>
            <button
              onClick={() => setViewPatientModalId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">السن والنوع</span>
              <strong className="text-slate-900 text-sm">
                {patient.age} سنة / {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
              </strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">فصيلة الدم</span>
              <strong className="text-red-700 text-sm font-mono">{patient.bloodType}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">التغطية التأمينية</span>
              <strong className="text-teal-700 text-sm">
                {patient.insuranceProvider} ({patient.insuranceCoveragePercent}%)
              </strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">تاريخ فتح الملف</span>
              <strong className="text-slate-700 text-sm font-mono">{patient.registeredAt}</strong>
            </div>
          </div>

          {/* Contact & Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                بيانات الاتصال والعنوان:
              </span>
              <div className="space-y-1 text-slate-600">
                <div>الهاتف: <strong className="text-slate-900 font-mono" dir="ltr">{patient.phone}</strong></div>
                <div>البريد: <span className="font-mono">{patient.email || 'غير مسجل'}</span></div>
                <div>العنوان: <span>{patient.address}</span></div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-900 block mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-600" />
                بيانات التواصل في حالات الطوارئ:
              </span>
              <div className="space-y-1 text-slate-700">
                <div>الاسم: <strong>{patient.emergencyContact.name}</strong> ({patient.emergencyContact.relation})</div>
                <div>الهاتف: <strong className="font-mono text-emerald-800" dir="ltr">{patient.emergencyContact.phone}</strong></div>
              </div>
            </div>
          </div>

          {/* Allergies & Chronic Alert Banner */}
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-xs font-bold text-red-900 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                الحساسية الدوائية والغذائية المسجلة (Recorded Allergies):
              </span>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map(alg => (
                  <span
                    key={alg}
                    className="text-xs px-2.5 py-1 rounded-full bg-red-600 text-white font-bold"
                  >
                    {alg}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-xs font-bold text-blue-900 mb-1.5 block">
                الأمراض المزمنة (Chronic Conditions):
              </span>
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.map(cond => (
                  <span
                    key={cond}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-700 text-white font-semibold"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Visit History Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              سجل زيارات العيادات السابقة في المستشفى ({patientAppointments.length})
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">رقم التذكرة</th>
                    <th className="p-2.5">وقت الموعد</th>
                    <th className="p-2.5">العيادة</th>
                    <th className="p-2.5">الشكوى الرئيسية</th>
                    <th className="p-2.5">العلامات الحيوية</th>
                    <th className="p-2.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patientAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-teal-800">{apt.ticketNo}</td>
                      <td className="p-2.5 font-mono">{apt.appointmentTime}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{apt.clinicId}</td>
                      <td className="p-2.5 text-slate-600 max-w-[200px] truncate">{apt.chiefComplaint}</td>
                      <td className="p-2.5">
                        {apt.vitals ? (
                          <span className="text-[11px] font-mono text-slate-700">
                            BP: {apt.vitals.bpSystolic}/{apt.vitals.bpDiastolic} | HR: {apt.vitals.pulseRate}
                          </span>
                        ) : (
                          <span className="text-slate-400">لم تسجل</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Progress Notes History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>سجل الملاحظات السريرية والتطورات ({patientNotes.length})</span>
              </h4>
              <button
                onClick={() => {
                  setViewPatientModalId(null);
                  openProgressNotesModal(patient.id);
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <span>فتح السجل الشامل وإضافة ملاحظة جديدة ←</span>
              </button>
            </div>

            <div className="space-y-2">
              {patientNotes.length > 0 ? (
                patientNotes.slice(0, 3).map(note => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{note.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {note.authorRole === 'doctor' ? 'طبيب' : note.authorRole === 'nurse' ? 'تمريض' : 'صيدلة'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{note.authorName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{note.timestamp}</span>
                    </div>
                    <p className="text-slate-700 text-xs line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  لا توجد ملاحظات سريرية مدونة لهذا المريض بعد
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic Lab History */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              سجل التحاليل المخبرية والأشعة ({patientLabs.length})
            </h4>
            <div className="space-y-2">
              {patientLabs.length > 0 ? (
                patientLabs.map(lab => (
                  <div
                    key={lab.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{lab.testNameAr}</div>
                      <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                        [{lab.testCode}] • Ordered: {lab.orderedAt} by {lab.orderedBy}
                      </div>
                      {lab.resultValue && (
                        <div className="mt-1 p-1.5 bg-white rounded border border-slate-200 text-indigo-900 font-semibold font-mono">
                          النتيجة: {lab.resultValue}
                        </div>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      lab.status === 'result_ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lab.status === 'result_ready' ? 'النتيجة معتمدة' : 'قيد الفحص'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  لا توجد تحاليل مسجلة لهذا المريض بعد
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setViewPatientModalId(null)}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl shadow-xs transition-colors"
          >
            إغلاق الملف
          </button>
        </div>
      </div>
    </div>
  );
};
