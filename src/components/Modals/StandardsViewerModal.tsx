import React, { useState } from 'react';
import {
  X,
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
  ExternalLink,
  Lock
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Patient, Appointment, ConsultationRecord } from '../../types/his';
import { generateFhirR4Bundle } from '../../utils/fhirGenerator';
import { verifyNphiesEligibility, submitNphiesPreAuthRequest } from '../../utils/nphiesEngine';
import { EdinaLogo } from '../common/EdinaLogo';

interface StandardsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  appointment?: Appointment;
  consultation?: ConsultationRecord;
  initialTab?: 'fhir' | 'nphies' | 'cbahi';
}

export const StandardsViewerModal: React.FC<StandardsViewerModalProps> = ({
  isOpen,
  onClose,
  patient,
  appointment,
  consultation,
  initialTab = 'fhir'
}) => {
  const { currentStaff, clinics, labOrders, playChime } = useHis();

  const [activeTab, setActiveTab] = useState<'fhir' | 'nphies' | 'cbahi'>(initialTab);
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

  if (!isOpen || !patient) return null;

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
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <EdinaLogo variant="mark-only" size="sm" theme="dark" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  معايير الربط الرقمي والاعتماد الصحي العالمي
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-900/80 text-teal-300 border border-teal-600/60">
                  FHIR R4 • NPHIES • CBAHI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                المريض: <strong className="text-teal-300">{patient.fullNameAr}</strong> ({patient.mrn}) — الهوية: {patient.nationalId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('fhir')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'fhir'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>HL7 FHIR R4 (حزم البيانات الموحدة)</span>
          </button>

          <button
            onClick={() => setActiveTab('nphies')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'nphies'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>منصة نفيس للتأمين (NPHIES Gateway)</span>
          </button>

          <button
            onClick={() => setActiveTab('cbahi')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cbahi'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>معايير سباهي واعتماد الجودة (CBAHI / JCI)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: HL7 FHIR R4 */}
          {activeTab === 'fhir' && (
            <div className="space-y-4">
              {/* FHIR Spec Summary Banner */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-teal-950">
                <div className="space-y-1">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-teal-700" />
                    <span>HL7 FHIR Release 4 (Interoperability Standard)</span>
                    <span className="px-2 py-0.5 rounded bg-teal-600 text-white text-[10px] font-mono">
                      FHIR-INFORMED MOCK
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-800">
                    نموذج واجهات مسترشد بمعايير تبادل السجلات الطبية (FHIR-informed UI Mock Model / Conceptual Mapping)، متضمناً موارد FHIR Resources: Patient, Encounter (AMB), Observation (LOINC), Condition (ICD-10-CM), MedicationRequest, Coverage.
                  </p>
                </div>

                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ للحافظة!' : 'نسخ كود FHIR JSON'}</span>
                </button>
              </div>

              {/* Resource Counts Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <span className="text-slate-500 block text-[10px]">نوع المورد (Type)</span>
                  <strong className="font-mono text-xs text-slate-800">Bundle (document)</strong>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <span className="text-slate-500 block text-[10px]">إجمالي الموارد المضمنة</span>
                  <strong className="font-mono text-sm text-teal-700">{fhirBundle.total} Resources</strong>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <span className="text-slate-500 block text-[10px]">ترميز التشخيص</span>
                  <strong className="font-mono text-xs text-slate-800">ICD-10-CM</strong>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <span className="text-slate-500 block text-[10px]">ترميز المؤشرات الحيوية</span>
                  <strong className="font-mono text-xs text-slate-800">LOINC® Standard</strong>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-900 text-slate-100 font-mono text-[11px] p-4 max-h-96 overflow-y-auto" dir="ltr">
                <pre>{fhirJsonString}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: NPHIES ENGINE */}
          {activeTab === 'nphies' && (
            <div className="space-y-6">
              {/* NPHIES Real-Time Eligibility Card */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-sm text-blue-900">
                      نتيجة التحقق من الأهلية التأمينية عبر منصة نفيس (NPHIES Eligibility)
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                    {nphiesElig.inquiryId}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">حالة الوثيقة</span>
                    <strong className="font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      سارية ونشطة (Eligible)
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">شركة التأمين</span>
                    <strong className="text-slate-800">{nphiesElig.payerName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">رقم الوثيقة / العضوية</span>
                    <strong className="font-mono text-slate-800">{nphiesElig.policyNumber}</strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">نسبة تحمل المريض (Co-Pay)</span>
                    <strong className="font-mono text-teal-800 text-sm font-black">{nphiesElig.patientCoPayPercent}%</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200 flex items-center justify-between text-[11px] text-blue-900">
                  <span>الحد السنوي المتبقي للوثيقة: <strong>{(nphiesElig.remainingBenefit ?? 0).toLocaleString()} ريال / جنيه</strong></span>
                  <span className="text-amber-800 font-medium">يتطلب موافقة مسبقة (Pre-Auth) للإجراءات المتقدمة</span>
                </div>
              </div>

              {/* NPHIES Prior-Authorization (Pre-Auth) Module */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-teal-600" />
                    طلب الموافقة المسبقة إلكترونياً (NPHIES Pre-Authorization Request)
                  </h4>
                  <span className="text-[10px] text-slate-400">معايير الترميز الطبي SBS / CPT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">كود الخدمة / الإجراء الطبي (SBS/CPT)</label>
                    <input
                      type="text"
                      value={preAuthServiceCode}
                      onChange={e => setPreAuthServiceCode(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الإجراء / الفحص المطلوب</label>
                    <input
                      type="text"
                      value={preAuthServiceName}
                      onChange={e => setPreAuthServiceName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القيمة الإجمالية التقديرية (ج.م / ر.س)</label>
                    <input
                      type="number"
                      value={preAuthAmount}
                      onChange={e => setPreAuthAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المبرر السريري المرفق (Medical Justification)</label>
                    <input
                      type="text"
                      value={preAuthJustification}
                      onChange={e => setPreAuthJustification(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    يتم إرسال الطلب مشفراً مباشرة إلى بوابة التأمين الإلكترونية الموحدة
                  </span>
                  <button
                    onClick={handleSendPreAuth}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال طلب الموافقة عبر نفيس (Send Pre-Auth)</span>
                  </button>
                </div>

                {/* Pre-Auth Result Display */}
                {preAuthResult && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        تم استلام قرار الموافقة الفورية بنجاح!
                      </span>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        {preAuthResult.preAuthRefNumber}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700 pt-1 border-t border-emerald-200">
                      <div>المبلغ المعتمد: <strong className="font-mono">{preAuthResult.approvedAmount}</strong></div>
                      <div>تحمل المريض: <strong className="font-mono">{preAuthResult.patientShare}</strong></div>
                      <div>الحالة: <strong className="text-emerald-700">معتمد (Approved)</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CBAHI & PATIENT SAFETY ACCREDITATION */}
          {activeTab === 'cbahi' && (
            <div className="space-y-4">
              {/* CBAHI Standards Banner */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-purple-950">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    معايير المركز السعودي لاعتماد المنشآت الصحية (CBAHI / JCI)
                  </h4>
                  <p className="text-[11px] text-purple-800">
                    تطبيق أهداف السلامة الوطنية للمرضى (National Patient Safety Goals - NPSG) لضمان جودة الرعاية ومنع الأخطاء الطبية.
                  </p>
                </div>
              </div>

              {/* 5 Core Patient Safety Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Goal 1: Two Identifiers */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                        1
                      </span>
                      التحقق بمعرّفين للمريض (Two Identifiers)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      مطابق ومفعل
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    التحقق الإلزامي من <strong>الاسم الرباعي الكامل</strong> + <strong>رقم الملف الطبي MRN أو الهوية الوطنية</strong> قبل أي كشف أو فحص أو صرف دواء.
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded">
                    Identified: {patient.fullNameAr} • MRN: {patient.mrn} • ID: {patient.nationalId}
                  </div>
                </div>

                {/* Goal 2: High Alert Meds & Dual Nurse */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                        2
                      </span>
                      سلامة الأدوية عالية الخطورة (High-Alert Meds)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      مراقبة مزدوجة
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    إلزامية التحقق الثنائي المستقل (Independent Double-Check) بواسطة ممرضين اثنين لأدوية الأنسولين، مضادات التخثر، والمخدرات.
                  </p>
                </div>

                {/* Goal 3: Fall Risk (Morse Fall Scale) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                        3
                      </span>
                      تقييم خطر السقوط (Morse Fall Risk)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      خطر منخفض (Low Risk)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    تقييم القدرة على الحركة، التاريخ السابق للسقوط، والأدوية المسببة للدوخة لوضع سوار الحماية باللون الأصفر عند الحاجة.
                  </p>
                </div>

                {/* Goal 4: Critical Lab Values (15-Min Read-Back Rule) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                        4
                      </span>
                      إبلاغ النتائج الحرجة وقراءتها عكسياً
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      قاعدة 15 دقيقة
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    إبلاغ نتائج التحاليل الحرجة (كالتروبونين، البوتاسيوم الشديد، السكر الحرج) فوراً مع إلزام الطبيب أو الممرض بالقراءة العكسية وتوثيق التاريخ والاسم.
                  </p>
                </div>
              </div>

              {/* OVR (Occurrence Variance Reporting) Incident Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      التبليغ عن الحوادث العرضية وشبه الحوادث (OVR / Incident Reporting)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      نظام سري لحماية المرضى ودراسة الأسباب الجذرية (RCA) بدون لوم للموظفين
                    </p>
                  </div>

                  <button
                    onClick={() => setShowOvrForm(!showOvrForm)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showOvrForm ? 'إلغاء' : 'تسجيل تقرير حادث (OVR)'}</span>
                  </button>
                </div>

                {showOvrForm && (
                  <form onSubmit={handleSubmitOvr} className="mt-3 p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-3 animate-in fade-in">
                    {ovrSuccess && (
                      <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold">
                        ✓ تم تسجيل تقرير الـ OVR وإرساله إلى لجنة إدارة المخاطر والجودة بمستشفيات إدينا التخصصية (Edina HIS).
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">نوع الواقعة</label>
                        <select
                          value={ovrType}
                          onChange={e => setOvrType(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        >
                          <option value="near_miss">شبه حادث كاد أن يقع (Near-Miss - تم تداركه)</option>
                          <option value="medication_error">خطأ دوائي (جرعة / مريض غير مطابق)</option>
                          <option value="patient_fall">سقوط مريض بالعيادة أو الصالة</option>
                          <option value="clinical_delay">تأخر في استلام نتائج فحوصات حرجة</option>
                          <option value="equipment_defect">عطل مفاجئ في جهاز قياس طبي</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">المبلغ</label>
                        <input
                          type="text"
                          disabled
                          value={`${currentStaff.name} (${currentStaff.title})`}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">تفاصيل الواقعة والإجراء الفوري المتخذ</label>
                      <textarea
                        rows={2}
                        value={ovrDesc}
                        onChange={e => setOvrDesc(e.target.value)}
                        placeholder="سجل الوقائع بموضوعية ودقة وما تم اتخاذه فورياً لحماية المريض..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                      >
                        إرسال التقرير السري للجنة الجودة
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>نموذج مفاهيمي مسترشد بمعايير FHIR-informed UI Mock Model وبوابة منصة نفيس ومتطلبات CBAHI</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
