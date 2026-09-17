import React, { useState } from 'react';
import {
  Send,
  Building,
  UserPlus,
  ArrowRightLeft,
  Scissors,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  ClinicalRequestItem,
  RequestType,
  RequestPriority,
  ConsultationRequestDetails,
  AdmissionRequestDetails,
  TransferRequestDetails,
  SurgeryRequestDetails
} from '../../../types/clinicalOrdersRequests';
import { useHis } from '../../../context/HisContext';

interface ClinicalRequestComposerProps {
  patient: Patient;
  onClose: () => void;
  onSaveRequest: (newRequest: ClinicalRequestItem) => void;
}

export const ClinicalRequestComposer: React.FC<ClinicalRequestComposerProps> = ({
  patient,
  onClose,
  onSaveRequest
}) => {
  const { currentStaff, playChime } = useHis();

  // Mode: consultation, admission, transfer, surgery
  const [requestType, setRequestType] = useState<RequestType>('consultation');
  const [priority, setPriority] = useState<RequestPriority>('urgent');

  // Consultation Details State
  const [targetSpecialty, setTargetSpecialty] = useState('طب وجراحة القلب التداخلية (Interventional Cardiology)');
  const [targetConsultant, setTargetConsultant] = useState('د. خالد عبد العزيز (استشاري قسطرة القلب)');
  const [focalQuestion, setFocalQuestion] = useState('تقييم خطورة NSTEMI وتحديد موعد القسطرة التاجية المستعجلة.');
  const [preferredResponseTime, setPreferredResponseTime] = useState('خلال 2 ساعة (عاجل)');

  // Admission Details State
  const [targetUnit, setTargetUnit] = useState('وحدة العناية القلبية المركزة (CCU)');
  const [bedLevel, setBedLevel] = useState<string>('ccu');
  const [admittingDiagnosis, setAdmittingDiagnosis] = useState('احتشاء حاد بعضلة القلب بدون ارتفاع ST (NSTEMI)');
  const [isolationRequired, setIsolationRequired] = useState(false);
  const [telemetryRequired, setTelemetryRequired] = useState(true);

  // Transfer Details State (Generic Concepts: Mock / Configured Policy Examples)
  const [transferType, setTransferType] = useState<'internal_transfer' | 'external_facility_transfer'>('internal_transfer');
  const [sourceLocation, setSourceLocation] = useState('قسم الطوارئ - سرير الإنعاش 02');
  const [internalDestination, setInternalDestination] = useState('وحدة العناية المركزة لأمراض القلب (CCU)');
  const [externalDestination, setExternalDestination] = useState('مركز الملك فيصل لأمراض وجراحة القلب التخصصي');
  const [transferReason, setTransferReason] = useState('حاجة المريض لمراقبة قلبية مكثفة وتيليمتري مستمر بعد استقرار الحالة');
  const [clinicalAcuity, setClinicalAcuity] = useState<'high_acuity' | 'intermediate_stable' | 'low_routine'>('high_acuity');
  
  // Generic Transport Requirements Profile
  const [transportModeExample, setTransportModeExample] = useState('إسعاف عناية مركزة متقدم (Mobile ICU / Critical Care Transport)');
  const [escortRequirement, setEscortRequirement] = useState('طبيب عناية مركزة وممرض رعاية حرجة (Physician & Critical Care Nurse)');
  const [monitoringRequirements, setMonitoringRequirements] = useState<string[]>([
    'مونيتور مراقبة العلامات الحيوية المتعدد (Multi-parameter Transport Monitor)',
    'مراقبة نظم القلب وتخطيط مستمر (Continuous ECG & SpO2)',
    'مضخة تسريب وريدي نشطة (Active Infusion Pump)'
  ]);
  const [receivingTeam, setReceivingTeam] = useState('طاقم تمريض واستلام العناية المركزة');
  const [acceptingPhysician, setAcceptingPhysician] = useState(''); // Optional when known

  // Surgery Details State
  const [procedurePlanned, setProcedurePlanned] = useState('قسطرة تشخيصية وعلاجية للشرايين التاجية (Coronary Angiography & PCI)');
  const [operatingRoomType, setOperatingRoomType] = useState('معمل القسطرة التداخلية (Cath Lab)');
  const [anesthesiaType, setAnesthesiaType] = useState('تخدير موضعي ومهدئ خفيف');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(90);
  const [requiresBloodCrossmatch, setRequiresBloodCrossmatch] = useState(false);

  // Common Clinical Summary
  const [clinicalSummary, setClinicalSummary] = useState(
    `مريض 54 سنة حضر للطوارئ بألم صدري حاد ضاغط، تخطيط القلب أظهر انخفاض ST في V4-V6، مع ارتفاع إنزيم التروبونين (0.18 ng/mL). تم إعطاء الأسبرين والكلوبيدوجريل والإينوكسابارين وتسريب النيتروجليسرين.`
  );

  const handleSubmit = () => {
    let titleAr = '';
    let titleEn = '';
    let consultDetails: ConsultationRequestDetails | undefined;
    let admitDetails: AdmissionRequestDetails | undefined;
    let transferDetails: TransferRequestDetails | undefined;
    let surgeryDetails: SurgeryRequestDetails | undefined;

    if (requestType === 'consultation') {
      titleAr = `طلب استشارة: ${targetSpecialty}`;
      titleEn = `Consultation Request: ${targetSpecialty}`;
      consultDetails = {
        targetSpecialty,
        targetConsultant: targetConsultant || undefined,
        focalClinicalQuestion: focalQuestion,
        clinicalSummary,
        preferredResponseTimeFrame: preferredResponseTime
      };
    } else if (requestType === 'admission') {
      titleAr = `طلب تنويم: ${targetUnit}`;
      titleEn = `Admission Request: ${targetUnit}`;
      admitDetails = {
        targetUnit,
        bedLevelOfCare: bedLevel as any,
        admittingDiagnosis,
        isolationRequired,
        telemetryRequired,
        specialEquipmentNeeded: telemetryRequired ? ['Continuous ECG Telemetry Monitor'] : []
      };
    } else if (requestType === 'transfer') {
      const genericTransportProfile = {
        profileNameAr: `ملف نقل سريري (${clinicalAcuity === 'high_acuity' ? 'عالي الخطورة' : clinicalAcuity === 'intermediate_stable' ? 'متوسط الخطورة' : 'اعتيادي'})`,
        profileNameEn: `Transport Requirements Profile (${clinicalAcuity})`,
        transportVehicleOrMode: transportModeExample,
        escortRequirements: escortRequirement,
        monitoringRequirements: monitoringRequirements,
        determinedByPolicyNote: 'تحدد المتطلبات ديناميكياً وفق: نوع التحويل + درجة الخطورة السريرية + سياق المريض + لوائح وسياسات المنشأة'
      };

      if (transferType === 'internal_transfer') {
        titleAr = `طلب نقل داخلي: من ${sourceLocation} إلى ${internalDestination}`;
        titleEn = `Internal Unit Transfer: ${sourceLocation} -> ${internalDestination}`;
        transferDetails = {
          transferType: 'internal_transfer',
          sourceLocationOrService: sourceLocation,
          requestedDestinationOrService: internalDestination,
          clinicalAcuity,
          transportRequirementsProfile: genericTransportProfile,
          escortRequirements: escortRequirement,
          monitoringRequirements: monitoringRequirements,
          transportRequirements: transportModeExample,
          transportEscort: escortRequirement,
          receivingTeamOrService: receivingTeam,
          sbarHandoverSummary: clinicalSummary
        };
      } else {
        titleAr = `طلب نقل وإحالة خارجية: ${externalDestination}`;
        titleEn = `Inter-Facility External Transfer: ${externalDestination}`;
        transferDetails = {
          transferType: 'external_facility_transfer',
          sourceLocationOrService: 'المستشفى الحالي',
          destinationFacility: externalDestination,
          clinicalAcuity,
          transportRequirementsProfile: genericTransportProfile,
          escortRequirements: escortRequirement,
          monitoringRequirements: monitoringRequirements,
          transportRequirements: transportModeExample,
          transportEscort: escortRequirement,
          transferReason,
          acceptingPhysicianName: acceptingPhysician || undefined,
          acceptingPhysicianPhone: acceptingPhysician ? '055-123-4567' : undefined
        };
      }
    } else if (requestType === 'surgery') {
      titleAr = `حجز عمليات: ${procedurePlanned}`;
      titleEn = `OR Booking: ${procedurePlanned}`;
      surgeryDetails = {
        procedurePlanned,
        operatingRoomType,
        anesthesiaType,
        estimatedDurationMinutes,
        bloodCrossmatchRequired: requiresBloodCrossmatch,
        specialSuppliesRequired: ['دعامات دوائية DES', 'قساطر توجيهية 6F']
      };
    }

    const newRequest: ClinicalRequestItem = {
      id: `REQ-${requestType.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      encounterId: 'ENC-2026-ER-091',
      requestType,
      titleAr,
      titleEn,
      priority,
      requestStatus: 'active',
      fulfillmentStatus: 'waiting_in_queue',
      requestedBy: {
        id: currentStaff.id,
        name: currentStaff.name,
        role: currentStaff.title || 'طبيب معالج',
        specialty: currentStaff.department || 'الطب السريري'
      },
      requestedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      consultationDetails: consultDetails,
      admissionDetails: admitDetails,
      transferDetails: transferDetails,
      surgeryDetails: surgeryDetails
    };

    onSaveRequest(newRequest);
    playChime('success');
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-sm text-white">
              محرر الطلبات السريرية والتحويلات المتقدم (Clinical Requests & Referrals Workspace)
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            توجيه طلبات الاستشارات والتنويم والنقل وجدولة العمليات للفرق السريرية المتخصصة
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Semantic Distinction Banner (Mandatory Requirement) */}
      <div className="p-3 bg-purple-50 border-b border-purple-200 text-purple-950 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <strong>محدد معماري سريري هام (Requests != Direct Orders):</strong> هذا الإجراء ينشئ تذكرة طلب خدمة أو استشارة في جدول عمل الفريق المطلوب، ولا يُعد أمراً دوائياً أو تنفيذاً مباشراً. يتم توثيق الرأي السريري النهائي لاحقاً من قبل الاستشاري أو القسم المستلم كـ (Clinical Note / Consult Note).
        </div>
      </div>

      {/* Request Type Switcher Tabs */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRequestType('consultation')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            requestType === 'consultation'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>طلب استشارة تخصصية (Consultation)</span>
        </button>

        <button
          type="button"
          onClick={() => setRequestType('admission')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            requestType === 'admission'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>طلب تنويم داخلي / عناية (Admission)</span>
        </button>

        <button
          type="button"
          onClick={() => setRequestType('surgery')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            requestType === 'surgery'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>حجز غرفة عمليات / قسطرة (OR Booking)</span>
        </button>

        <button
          type="button"
          onClick={() => setRequestType('transfer')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            requestType === 'transfer'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>طلب نقل خارجي (Transfer)</span>
        </button>
      </div>

      {/* Body Configuration Form */}
      <div className="p-5 space-y-4 text-xs">
        
        {/* Priority Selector */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <label className="font-bold text-slate-800">درجة الاستعجال وزمن الاستجابة المطلوب (Urgency):</label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPriority('routine')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                priority === 'routine' ? 'bg-slate-700 text-white' : 'bg-white text-slate-700 border border-slate-300'
              }`}
            >
              اعتيادي (خلال 24 ساعة)
            </button>
            <button
              type="button"
              onClick={() => setPriority('urgent')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                priority === 'urgent' ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border border-slate-300'
              }`}
            >
              عاجل (خلال 2 - 4 ساعات)
            </button>
            <button
              type="button"
              onClick={() => setPriority('stat')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                priority === 'stat' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
              }`}
            >
              طارئ وفوري STAT (خلال 30 دقيقة)
            </button>
          </div>
        </div>

        {/* Dynamic Mode Forms */}
        {requestType === 'consultation' && (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  التخصص المستهدف للاستشارة (Specialty): *
                </label>
                <select
                  value={targetSpecialty}
                  onChange={e => setTargetSpecialty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value="طب وجراحة القلب التداخلية (Interventional Cardiology)">طب وجراحة القلب التداخلية (Cardiology)</option>
                  <option value="العناية الحرجة والتنفسية (Critical Care / ICU)">العناية الحرجة والتنفسية (Critical Care)</option>
                  <option value="أمراض الكلى والغسيل (Nephrology)">أمراض الكلى والغسيل (Nephrology)</option>
                  <option value="الجراحة العامة وجراحة الأوعية (Vascular Surgery)">جراحة الأوعية الدموية (Vascular)</option>
                  <option value="طب الأعصاب والسكتات الدماغية (Neurology)">طب الأعصاب والسكتات (Neurology)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الاستشاري أو الفريق المناوب (Optional Named Consultant):
                </label>
                <input
                  type="text"
                  value={targetConsultant}
                  onChange={e => setTargetConsultant(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                السؤال السريري المركز للاستشارة (Focal Clinical Question): *
              </label>
              <input
                type="text"
                required
                value={focalQuestion}
                onChange={e => setFocalQuestion(e.target.value)}
                placeholder="ما المطلوب تحديداً من الاستشاري؟ (مثال: تقييم القسطرة العاجلة، تعديل أدوية الكلى...)"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
              />
            </div>
          </div>
        )}

        {requestType === 'admission' && (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">القسم المستهدف للتنويم (Target Unit): *</label>
                <select
                  value={targetUnit}
                  onChange={e => setTargetUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value="وحدة العناية القلبية المركزة (CCU)">وحدة العناية القلبية (CCU)</option>
                  <option value="وحدة المراقبة القلبية واللاسلكية (Telemetry Stepdown)">وحدة المراقبة اللاسلكية (Telemetry)</option>
                  <option value="جناح الباطنة العام (Internal Medicine Ward)">جناح الباطنة العام (Ward)</option>
                  <option value="العناية المركزة العامة (General ICU)">العناية المركزة العامة (ICU)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مستوى الرعاية المطلوب (Level of Care): *</label>
                <select
                  value={bedLevel}
                  onChange={e => setBedLevel(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value="icu_ccu">عناية حرجة 1:1 أو 1:2 (CCU/ICU)</option>
                  <option value="telemetry_stepdown">مراقبة تيليمتري متقدمة (Stepdown)</option>
                  <option value="general_ward">سرير تنويم اعتيادي (General Ward)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التشخيص المبرر للتنويم:</label>
                <input
                  type="text"
                  value={admittingDiagnosis}
                  onChange={e => setAdmittingDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="iso-toggle"
                checked={isolationRequired}
                onChange={e => setIsolationRequired(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="iso-toggle" className="font-bold text-slate-800">
                يتطلب عزل وقائي (Contact / Airborne Isolation)
              </label>
            </div>
          </div>
        )}

        {requestType === 'surgery' && (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">العملية أو التدخل المخطط له: *</label>
                <input
                  type="text"
                  required
                  value={procedurePlanned}
                  onChange={e => setProcedurePlanned(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مقر الإجراء (OR Suite / Lab): *</label>
                <select
                  value={operatingRoomType}
                  onChange={e => setOperatingRoomType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value="معمل القسطرة التداخلية (Cath Lab)">معمل القسطرة التداخلية (Cath Lab)</option>
                  <option value="غرفة العمليات الرئيسية (Main OR)">غرفة العمليات الرئيسية (Main OR)</option>
                  <option value="وحدة المناظير المتخصصة (Endoscopy Suite)">وحدة المناظير (Endoscopy)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {requestType === 'transfer' && (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            {/* Transfer Type Segmented Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">نوع النقل السريري (Transfer Scope): *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransferType('internal_transfer')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                    transferType === 'internal_transfer'
                      ? 'bg-purple-100 text-purple-900 border-purple-400 ring-1 ring-purple-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  نقل داخلي بين الأقسام (Internal Unit-to-Unit)
                </button>
                <button
                  type="button"
                  onClick={() => setTransferType('external_facility_transfer')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                    transferType === 'external_facility_transfer'
                      ? 'bg-purple-100 text-purple-900 border-purple-400 ring-1 ring-purple-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  إحالة ونقل لمنشأة خارجية (External Facility Transfer)
                </button>
              </div>
            </div>

            {/* Policy & Context Driven Notice Banner */}
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>محدد الأمان السريري للنقل (Transport Policy Framework):</strong> تحدد متطلبات النقل السريري والمرافقة والمراقبة ديناميكياً بناءً على:
                <span className="font-bold text-emerald-900"> نوع التحويل (Transfer Type) + درجة الخطورة السريرية (Clinical Acuity) + سياق المريض السريري (Patient Context) + سياسات ولوائح المنشأة (Hospital / Regulatory Policy)</span>. الخيارات أدناه تمثل أمثلة معدّة بالسياسة (Configured Examples) وليست قيماً إجبارية جامدة.
              </div>
            </div>

            {/* Internal Transfer Specific Fields */}
            {transferType === 'internal_transfer' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الموقع أو القسم الحالي (Source Location): *</label>
                    <input
                      type="text"
                      value={sourceLocation}
                      onChange={e => setSourceLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القسم أو السرير المستهدف (Target Unit): *</label>
                    <input
                      type="text"
                      value={internalDestination}
                      onChange={e => setInternalDestination(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">درجة الخطورة السريرية (Clinical Acuity): *</label>
                    <select
                      value={clinicalAcuity}
                      onChange={e => setClinicalAcuity(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                    >
                      <option value="high_acuity">عالية الخطورة / حرجة (High Acuity)</option>
                      <option value="intermediate_stable">متوسطة مستقرة (Intermediate)</option>
                      <option value="low_routine">اعتيادية مستقرة (Low / Routine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الفريق أو الممرض المستلم:</label>
                    <input
                      type="text"
                      value={receivingTeam}
                      onChange={e => setReceivingTeam(e.target.value)}
                      placeholder="اختياري - اسم الفريق أو مسؤول الاستلام"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Generic Transport Requirements Profile Section */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>ملف متطلبات النقل السريري (Transport Requirements Profile)</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      Configured Policy Examples
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[11px] text-slate-600 mb-1">
                        نمط ومركبة النقل (Transport Vehicle / Mode):
                      </label>
                      <select
                        value={transportModeExample}
                        onChange={e => setTransportModeExample(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-white"
                      >
                        <option value="نقالة مجهزة بمونيتور مراقبة ومضخات تسريب وريدي (Stretcher with Transport Monitor)">نقالة مجهزة بمونيتور ومضخات (Stretcher with Monitor)</option>
                        <option value="سرير العناية المركزة المباشر (Direct ICU Bed Transfer)">نقل على سرير العناية المركزة (ICU Bed)</option>
                        <option value="كرسي متحرك سريري مع مرافق (Clinical Wheelchair with Escort)">كرسي متحرك مع مرافق (Wheelchair)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[11px] text-slate-600 mb-1">
                        متطلبات المرافقة السريرية (Escort Requirements):
                      </label>
                      <select
                        value={escortRequirement}
                        onChange={e => setEscortRequirement(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-white"
                      >
                        <option value="طبيب عناية مركزة وممرض رعاية حرجة (Physician & Critical Care Nurse)">طبيب وممرض عناية مركزة (Physician & Nurse)</option>
                        <option value="ممرض رعاية حرجة فقط (Critical Care Nurse Only)">ممرض رعاية حرجة فقط (Nurse Only)</option>
                        <option value="مساعد نقل سريري وممرض قسم (Porter & Ward Nurse)">مساعد نقل وممرض قسم (Porter & Nurse)</option>
                        <option value="مساعد نقل سريري فقط (Clinical Porter Only)">مساعد نقل سريري فقط (Porter Only)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[11px] text-slate-600 mb-1.5">
                      متطلبات المراقبة والأجهزة (Monitoring Requirements):
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        'مونيتور مراقبة العلامات الحيوية المتعدد (Multi-parameter Transport Monitor)',
                        'مراقبة نظم القلب وتخطيط مستمر (Continuous ECG & SpO2)',
                        'مضخة تسريب وريدي نشطة (Active Infusion Pump)',
                        'أسطوانة أكسجين نقالة (Portable Oxygen Cylinder)',
                        'جهاز إزالة الرجفان القلبي المتنقل (Transport Defibrillator / Pacer)'
                      ].map(item => {
                        const isChecked = monitoringRequirements.includes(item);
                        return (
                          <label
                            key={item}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                if (e.target.checked) {
                                  setMonitoringRequirements(prev => [...prev, item]);
                                } else {
                                  setMonitoringRequirements(prev => prev.filter(i => i !== item));
                                }
                              }}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* External Facility Transfer Fields */
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المنشأة الطبية المستقبلة (Destination Facility): *</label>
                    <input
                      type="text"
                      required
                      value={externalDestination}
                      onChange={e => setExternalDestination(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      الطبيب أو الاستشاري المستقبل (Accepting Physician - Optional):
                    </label>
                    <input
                      type="text"
                      value={acceptingPhysician}
                      onChange={e => setAcceptingPhysician(e.target.value)}
                      placeholder="اختياري عند إنشاء الطلب الأولي"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">سبب التحويل الخارجي (Clinical Reason): *</label>
                    <input
                      type="text"
                      required
                      value={transferReason}
                      onChange={e => setTransferReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">درجة الخطورة السريرية (Clinical Acuity): *</label>
                    <select
                      value={clinicalAcuity}
                      onChange={e => setClinicalAcuity(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                    >
                      <option value="high_acuity">عالية الخطورة / حرجة (High Acuity)</option>
                      <option value="intermediate_stable">متوسطة مستقرة (Intermediate)</option>
                      <option value="low_routine">اعتيادية مستقرة (Low / Routine)</option>
                    </select>
                  </div>
                </div>

                {/* Generic Transport Requirements Profile Section for External */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>ملف متطلبات النقل الخارجي (External Transport Requirements Profile)</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      Configured Policy Examples
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[11px] text-slate-600 mb-1">
                        مركبة ووسيلة النقل الإسعافي (Transport Vehicle Mode):
                      </label>
                      <select
                        value={transportModeExample}
                        onChange={e => setTransportModeExample(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-white"
                      >
                        <option value="إسعاف عناية مركزة متقدم (Mobile ICU / Critical Care Ambulance)">إسعاف عناية مركزة متقدم (Mobile ICU / Critical Care)</option>
                        <option value="إسعاف دعم الحياة المتقدم (Advanced Life Support ALS)">إسعاف دعم الحياة المتقدم (ALS Ambulance)</option>
                        <option value="إسعاف دعم الحياة الأساسي (Basic Life Support BLS)">إسعاف عادي مجهز (Basic Life Support BLS)</option>
                        <option value="إخلاء طبي جوي مجهز (Aeromedical Evacuation / Medevac)">إخلاء طبي جوي مجهز (Aeromedical Medevac)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[11px] text-slate-600 mb-1">
                        متطلبات المرافقة السريرية (Escort Requirements):
                      </label>
                      <select
                        value={escortRequirement}
                        onChange={e => setEscortRequirement(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-white"
                      >
                        <option value="طبيب عناية مركزة وممرض رعاية حرجة (Physician & Critical Care Nurse)">طبيب عناية مركزة وممرض حرج (Physician & Nurse)</option>
                        <option value="ممرض رعاية متقدمة ومسعف (Flight / Transport Nurse & Paramedic)">ممرض نقل متقدم ومسعف (Transport Nurse & Paramedic)</option>
                        <option value="فريق إسعاف معتمد (Paramedic Team Only)">طاقم إسعاف معتمد (Paramedic Team)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[11px] text-slate-600 mb-1.5">
                      متطلبات المراقبة والأجهزة (Monitoring Requirements):
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        'مونيتور مراقبة العلامات الحيوية المتعدد (Multi-parameter Transport Monitor)',
                        'مراقبة نظم القلب وتخطيط مستمر (Continuous ECG & SpO2)',
                        'مراقبة ضغط الشريان الباضع (Invasive Arterial Line)',
                        'مضخة تسريب وريدي نشطة (Active Infusion Pump)',
                        'جهاز إزالة الرجفان القلبي المتنقل (Transport Defibrillator / Pacer)'
                      ].map(item => {
                        const isChecked = monitoringRequirements.includes(item);
                        return (
                          <label
                            key={item}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                if (e.target.checked) {
                                  setMonitoringRequirements(prev => [...prev, item]);
                                } else {
                                  setMonitoringRequirements(prev => prev.filter(i => i !== item));
                                }
                              }}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clinical Summary & Patient Handover Note */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            الملخص السريري المساند لطلب الخدمة (Clinical Summary & Handoff Context): *
          </label>
          <textarea
            rows={3}
            required
            value={clinicalSummary}
            onChange={e => setClinicalSummary(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>سيتم إرسال إشعار فوري للفريق المناوب وإدراج الطلب في قائمة الانتظار المركزية.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال وتثبيت طلب الخدمة (Submit Clinical Request)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
