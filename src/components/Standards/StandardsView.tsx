import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  FileCode,
  CreditCard,
  Copy,
  Check,
  AlertTriangle,
  HeartPulse,
  Send,
  Building2,
  FileCheck2,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { generateFhirR4Bundle } from '../../utils/fhirGenerator';
import { verifyNphiesEligibility, submitNphiesPreAuthRequest } from '../../utils/nphiesEngine';

export const StandardsView: React.FC = () => {
  const { patients, appointments, consultations, labOrders, playChime } = useHis();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => patients[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'fhir' | 'nphies' | 'cbahi'>('fhir');
  const [copied, setCopied] = useState(false);

  // NPHIES Pre-Auth state
  const [preAuthServiceCode, setPreAuthServiceCode] = useState('SBS-93306');
  const [preAuthServiceName, setPreAuthServiceName] = useState('أشعة تليفزيونية متقدمة على القلب (Echocardiography)');
  const [preAuthAmount, setPreAuthAmount] = useState(750);
  const [preAuthJustification, setPreAuthJustification] = useState('اشتباه قصور بالشريان التاجي واعتلال عضلة القلب بناء على فحص الـ ECG');
  const [preAuthResult, setPreAuthResult] = useState<any>(null);

  // CBAHI OVR modal state
  const [showOvrForm, setShowOvrForm] = useState(false);
  const [ovrType, setOvrType] = useState('near_miss');
  const [ovrDesc, setOvrDesc] = useState('');
  const [ovrSuccess, setOvrSuccess] = useState(false);

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <p className="text-slate-500">لا يوجد مرضى مسجلين حالياً لعرض معايير الربط.</p>
      </div>
    );
  }

  const appointment = appointments.find(a => a.patientId === patient.id);
  const consultation = appointment ? consultations[appointment.id] : undefined;

  // Generate FHIR bundle
  const fhirBundle = generateFhirR4Bundle(patient, appointment, consultation, labOrders);
  const fhirJsonString = JSON.stringify(fhirBundle, null, 2);

  // NPHIES Eligibility
  const nphiesElig = verifyNphiesEligibility(patient);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(fhirJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPreAuth = () => {
    const result = submitNphiesPreAuthRequest({
      patient,
      appointmentId: appointment?.id || 'apt-walkin',
      serviceCode: preAuthServiceCode,
      serviceName: preAuthServiceName,
      category: 'radiology',
      amount: preAuthAmount,
      justification: preAuthJustification
    });
    setPreAuthResult(result);
    playChime('success');
  };

  const handleSubmitOvr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ovrDesc.trim()) return;
    setOvrSuccess(true);
    playChime('alert');
    setTimeout(() => {
      setOvrSuccess(false);
      setShowOvrForm(false);
      setOvrDesc('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  معايير الربط الرقمي والاعتماد الصحي (Health Interoperability & Standards)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-900/80 text-teal-300 border border-teal-600/60">
                  FHIR R4 • NPHIES • CBAHI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                منظومة المعايير السعودية والعالمية: ملف HL7 FHIR الموحد • بوابة منصة نفيس للتأمين • متطلبات الاعتماد والجودة سباهي
              </p>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap">عرض بيانات المريض:</span>
            <div className="relative">
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="appearance-none bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold py-2.5 pl-9 pr-3.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-800 text-white">
                    {p.fullNameAr} ({p.mrn})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-teal-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('fhir')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'fhir'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>HL7 FHIR R4 (حزم البيانات السريرية الموحدة)</span>
          </button>

          <button
            onClick={() => setActiveTab('nphies')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'nphies'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>منصة نفيس للتأمين الصحي (NPHIES Gateway)</span>
          </button>

          <button
            onClick={() => setActiveTab('cbahi')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'cbahi'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>معايير سباهي واعتماد الجودة وسلامة المرضى (CBAHI / JCI)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs">
          {/* TAB 1: HL7 FHIR R4 */}
          {activeTab === 'fhir' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-teal-950">
                <div className="space-y-1">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-teal-700" />
                    <span>HL7 FHIR Release 4 (Interoperability Standard)</span>
                  </div>
                  <p className="text-teal-800 text-xs">
                    حزمة بيانات سريرية رقمية موحدة متوافقة مع المتطلبات الوطنية والربط مع منظومة الصحة والسجلات الوطنية.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-teal-900 border border-teal-300 rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ بنجاح' : 'نسخ ملف الـ JSON'}</span>
                  </button>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-xs max-h-96 overflow-y-auto ltr text-left">
                <pre>{fhirJsonString}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: NPHIES Gateway */}
          {activeTab === 'nphies' && (
            <div className="space-y-6">
              {/* Eligibility Section */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    التحقق الفوري من أهلية العلاج والتأمين (NPHIES Eligibility Verification)
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    nphiesElig.status === 'eligible' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {nphiesElig.status === 'eligible' ? 'مؤهل ومغطى تأمينياً (Active Coverage)' : 'غير مؤهل'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-600 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">شركة التأمين:</span>
                    <strong className="text-slate-800">{patient.insuranceProvider}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">رقم الوثيقة:</span>
                    <strong className="font-mono text-slate-800">{patient.insurancePolicyNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">فئة التغطية:</span>
                    <strong className="text-slate-800">Class {patient.insuranceClass} ({patient.insuranceCoveragePercent}%)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">معرف استعلام نفيس:</span>
                    <strong className="font-mono text-xs text-teal-700">{nphiesElig.inquiryId}</strong>
                  </div>
                </div>
              </div>

              {/* Pre-Authorization Form & Simulator */}
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-teal-700" />
                    طلب موافقة تأمينية مسبقة عبر منصة نفيس (NPHIES Prior-Authorization Request)
                  </h4>
                  <span className="text-xs text-teal-800 font-mono">SBS Code standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رمز الخدمة (SBS Code):</label>
                    <input
                      type="text"
                      value={preAuthServiceCode}
                      onChange={e => setPreAuthServiceCode(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الخدمة السريرية:</label>
                    <input
                      type="text"
                      value={preAuthServiceName}
                      onChange={e => setPreAuthServiceName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المبلغ التقديري (ر.س):</label>
                    <input
                      type="number"
                      value={preAuthAmount}
                      onChange={e => setPreAuthAmount(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التبرير الطبي والسريري (Clinical Justification):</label>
                  <input
                    type="text"
                    value={preAuthJustification}
                    onChange={e => setPreAuthJustification(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleSendPreAuth}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال طلب الموافقة لمنصة نفيس الموحدة</span>
                  </button>
                </div>

                {preAuthResult && (
                  <div className="p-3 bg-white rounded-xl border border-teal-300 mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">نتيجة رد نفيس:</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        {preAuthResult.status === 'approved' ? 'موافقة معتمدة (Approved)' : preAuthResult.status}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      رقم الموافقة المرجعي: <strong className="font-mono text-teal-800">{preAuthResult.preAuthNumber}</strong> • نسبة التحمل: {preAuthResult.copayPercent}% • المبلغ المغطى: {preAuthResult.coveredAmount} ر.س
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CBAHI Quality & Safety */}
          {activeTab === 'cbahi' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-purple-950 text-sm">
                    المركز السعودي لاعتماد المنشآت الصحية (CBAHI National Standards)
                  </h4>
                  <p className="text-purple-800 text-xs mt-0.5">
                    الالتزام بالأهداف الستة لسلامة المرضى (IPSG) وتسجيل تقارير الحوادث العارضة (OVR).
                  </p>
                </div>
                <button
                  onClick={() => setShowOvrForm(!showOvrForm)}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  + تسجيل تقرير حادث عارض (OVR)
                </button>
              </div>

              {showOvrForm && (
                <form onSubmit={handleSubmitOvr} className="p-4 bg-white rounded-xl border border-purple-300 space-y-3">
                  <h5 className="font-bold text-slate-900">تسجيل نموذج حادث عارض / خطأ وشيك (Incident / Near Miss)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">نوع الحادث:</label>
                      <select
                        value={ovrType}
                        onChange={e => setOvrType(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="near_miss">حادث وشيك تم تداركه (Near Miss - No Harm)</option>
                        <option value="medication_error">خطأ دوائي (Medication Variance)</option>
                        <option value="patient_fall">سقوط مريض (Patient Fall)</option>
                        <option value="id_mismatch">عدم تطابق في الهوية (Patient ID Mismatch)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الموقع:</label>
                      <input
                        type="text"
                        defaultValue="عيادة أمراض القلب والباطنة - غرفة 204"
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تفاصيل الواقعة والإجراء التصحيحي المتخذ فوراً:</label>
                    <textarea
                      rows={2}
                      value={ovrDesc}
                      onChange={e => setOvrDesc(e.target.value)}
                      placeholder="صف ما حدث بدقة والإجراء المتخذ لمنع تكراره..."
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      إرسال التقرير لمكتب الجودة وسلامة المرضى
                    </button>
                    {ovrSuccess && (
                      <span className="text-emerald-700 font-bold">تم حفظ وتوثيق التقرير وإرساله لإدارة الجودة بنجاح!</span>
                    )}
                  </div>
                </form>
              )}

              {/* 6 International Patient Safety Goals (IPSG) checklist */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900">الأهداف الدولية لسلامة المرضى (IPSG Compliance Status):</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'IPSG-1', title: 'التحقق الدقيق من هوية المريض بمعرفين', status: 'مستوفى 100%' },
                    { id: 'IPSG-2', title: 'تحسين التواصل الفعال (Read-Back للنتائج الحرجة)', status: 'مستوفى 100%' },
                    { id: 'IPSG-3', title: 'تحسين سلامة الأدوية عالية الخطورة (High-Alert Meds)', status: 'مستوفى 100%' },
                    { id: 'IPSG-4', title: 'ضمان الجراحة في الموقع الصحيح والإجراء الصحيح (Time-Out)', status: 'مستوفى 100%' },
                    { id: 'IPSG-5', title: 'تقليل مخاطر العدوى المرتبطة بالرعاية (Hand Hygiene)', status: 'مستوفى 100%' },
                    { id: 'IPSG-6', title: 'تقليل مخاطر أذى المريض الناجم عن السقوط (Morse Scale)', status: 'مستوفى 100%' }
                  ].map(goal => (
                    <div key={goal.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-purple-700 font-mono font-bold text-[10px] block">{goal.id}</span>
                        <span className="font-bold text-slate-800 text-xs">{goal.title}</span>
                      </div>
                      <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                        {goal.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
