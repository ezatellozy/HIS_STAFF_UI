import React from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  CreditCard,
  Cpu,
  Server,
  RefreshCw,
  Clock,
  FileCode,
  CheckCircle2,
  Volume2,
  VolumeX,
  Siren,
  Radio
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { EMERGENCY_CODES, HospitalEmergencyCode, EMERGENCY_CODE_LIST } from '../../utils/emergencyCodes';
import { EdinaLogo } from '../common/EdinaLogo';

export const AdminDashboard: React.FC = () => {
  const {
    clinics,
    patients,
    appointments,
    labOrders,
    marItems,
    emergencyCode,
    emergencyCodeLocation,
    setEmergencyCode,
    triggerEmergencyCode,
    replayEmergencyCodeVoice,
    soundEnabled,
    setSoundEnabled,
    voiceAnnouncementEnabled,
    setVoiceAnnouncementEnabled,
    isSpeakingAnnouncement,
    playChime,
    openStandardsModal
  } = useHis();

  const handleResetData = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط بيانات المستشفى إلى القيم الافتراضية؟')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <EdinaLogo variant="mark-only" size="lg" theme="dark" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">لوحة تحكم إدارة منظومة إدينا لمعلومات المستشفيات (Edina HIS Master Control)</h2>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-xs font-mono font-bold border border-blue-800">
                ENTERPRISE DIRECTOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              مراقبة مؤشرات الأداء الطبي (KPIs)، حالة الخوادم، أمن السجلات السريرية، والتكامل بين الأقسام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة ضبط البيانات الأولية</span>
          </button>
        </div>
      </div>

      {/* Edina Enterprise Hospital KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">إجمالي العيادات التخصصية</span>
          <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">{clinics.length} عيادات</strong>
          <span className="text-[11px] text-teal-600">جاهزية تشغيل 100%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">الملفات الطبية النشطة (EHR)</span>
          <strong className="text-2xl font-black text-blue-700 font-mono mt-1 block">{patients.length} ملفاً</strong>
          <span className="text-[11px] text-blue-600">جاهزية FHIR-ready Conceptual Mapping</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">الفحوصات المخبرية المحررة</span>
          <strong className="text-2xl font-black text-indigo-700 font-mono mt-1 block">{labOrders.length} فحصاً</strong>
          <span className="text-[11px] text-indigo-600">LIS / RIS Integration</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">عمليات إعطاء الدواء الموثقة</span>
          <strong className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{marItems.length} جرعة</strong>
          <span className="text-[11px] text-emerald-600">توثيق تمريضي معتمد</span>
        </div>
      </div>

      {/* Hospital Clinic Capacity Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-600" />
          مصفوفة تشغيل العيادات الخارجية ومعدلات التردد (OPD Operational Grid)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinics.map(c => {
            const clinicApts = appointments.filter(a => a.clinicId === c.id);
            const inServing = clinicApts.find(a => a.status === 'with_doctor');
            const completedCount = clinicApts.filter(a => a.status === 'completed').length;

            return (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{c.nameAr}</span>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">{c.doctorName}</div>
                <div className="text-[10px] text-slate-400 font-mono">{c.roomNo}</div>

                <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between text-slate-600">
                  <span>المراجع الحالي:</span>
                  <strong className="text-teal-700 font-mono font-bold">{inServing ? inServing.ticketNo : 'لا يوجد'}</strong>
                </div>

                <div className="text-[11px] flex items-center justify-between text-slate-500">
                  <span>تم إنجاز الكشف: {completedCount}</span>
                  <span>في الانتظار: {c.totalWaiting}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* International Standards & Health Interoperability (FHIR • NPHIES • CBAHI) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCode className="w-5 h-5 text-teal-600" />
              <span>منظومة المعايير الصحية العالمية والربط الموحد (HL7 FHIR • NPHIES • CBAHI)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              مراقبة الامتثال للمعايير الرقمية الدولية، بوابات التأمين الصحي الموحدة، ومعايير الجودة وسلامة المرضى
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openStandardsModal(undefined, undefined, 'fhir')}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
            >
              استعراض حزم FHIR
            </button>
            <button
              onClick={() => openStandardsModal(undefined, undefined, 'nphies')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
            >
              بوابة نفيس NPHIES
            </button>
            <button
              onClick={() => openStandardsModal(undefined, undefined, 'cbahi')}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors"
            >
              سجل سباهي CBAHI OVR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FHIR Status Card */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-teal-900">HL7® FHIR® Release 4</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> متوافق 100%
              </span>
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              توليد آلي لموارد Patient, Encounter, Observation, Condition, MedicationRequest بصيغة JSON REST API موحدة دولياً.
            </p>
            <div className="text-[10px] text-teal-600 font-mono pt-1 border-t border-teal-100">
              Endpoint: /api/fhir/r4/Bundle
            </div>
          </div>

          {/* NPHIES Status Card */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-900">منظومة نفيس NPHIES Gateway</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> بوابة متصلة
              </span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              تحقق لحظي من الأهلية (Eligibility)، وتمرير طلبات الموافقة المسبقة (Prior-Auth)، والفلترة الآلية للمطالبات.
            </p>
            <div className="text-[10px] text-blue-600 font-mono pt-1 border-t border-blue-100">
              Protocol: HTTPS Mutual-TLS 1.3
            </div>
          </div>

          {/* CBAHI Status Card */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-purple-900">المركز السعودي لاعتماد المنشآت CBAHI</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> معايير NPSG فعّالة
              </span>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              تطبيق معيار معرّفَي المريض، تقييم مخاطر السقوط Morse، الرقابة المزدوجة للأدوية عالية الخطورة، ونظام OVR للحوادث العارضة.
            </p>
            <div className="text-[10px] text-purple-600 font-mono pt-1 border-t border-purple-100">
              Accreditation: Hospital OPD Standards 3rd Ed.
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Hospital Emergency Systems with Voice Announcements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-600" />
              <span>منظومة نداء أكواد الطوارئ والسلامة بالمستشفى (Hospital Emergency Codes)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              إذاعة فورية لصفارات الإنذار ونطق الكود الصوتي عبر مكبرات الصوت (Voice PA System) باللغتين العربية والإنجليزية
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceAnnouncementEnabled(!voiceAnnouncementEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                voiceAnnouncementEnabled
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${voiceAnnouncementEnabled ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>نطق الكود صوتياً: {voiceAnnouncementEnabled ? 'مفعل 🔊' : 'معطل (صفارة فقط)'}</span>
            </button>

            {emergencyCode && (
              <button
                onClick={() => replayEmergencyCodeVoice()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="إعادة نطق الكود الصوتي النشط الآن"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>إعادة نداء الكود صوتياً</span>
              </button>
            )}

            {emergencyCode && (
              <button
                onClick={() => {
                  triggerEmergencyCode(null);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                إلغاء وتصفير الطوارئ (All Clear)
              </button>
            )}
          </div>
        </div>

        {/* Active Emergency Status Banner if active */}
        {emergencyCode && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-red-600 text-white animate-bounce">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <div className="font-extrabold text-red-900 text-sm flex items-center gap-2">
                  <span>كود نشط الآن: {EMERGENCY_CODES[emergencyCode as HospitalEmergencyCode]?.nameAr || emergencyCode}</span>
                  {isSpeakingAnnouncement && (
                    <span className="text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      جاري البث الصوتي بالمستشفى...
                    </span>
                  )}
                </div>
                <div className="text-xs text-red-700">
                  {EMERGENCY_CODES[emergencyCode as HospitalEmergencyCode]?.descriptionAr}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-red-800 bg-red-100 px-2.5 py-1 rounded-lg">
              📍 {emergencyCodeLocation || EMERGENCY_CODES[emergencyCode as HospitalEmergencyCode]?.locationDefault}
            </div>
          </div>
        )}

        {/* Grid of Hospital Codes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMERGENCY_CODE_LIST.map(codeItem => {
            const isCurrent = emergencyCode === codeItem.code;
            return (
              <div
                key={codeItem.code}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-red-500 shadow-md ring-2 ring-red-500/20'
                    : 'bg-slate-50/60 hover:bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: codeItem.colorHex }}
                    >
                      {codeItem.shortLabel}
                    </span>
                    <span className={`text-[10px] font-mono ${isCurrent ? 'text-slate-400' : 'text-slate-500'}`}>
                      {codeItem.nameEn}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                    {codeItem.nameAr}
                  </h4>
                  <p className={`text-[11px] mt-1 leading-relaxed ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                    {codeItem.categoryAr}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => {
                      triggerEmergencyCode(codeItem.code);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                      isCurrent
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>{isCurrent ? 'إعادة الإذاعة' : 'إعلان الكود'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
