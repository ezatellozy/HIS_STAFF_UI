import React, { useState } from 'react';
import {
  HeartPulse,
  Pill,
  FlaskConical,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Stethoscope,
  Activity,
  Bed,
  ArrowRightLeft,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Users,
  AlertCircle,
  PhoneCall,
  CheckSquare,
  Sparkles,
  GitFork,
  ArrowUpRight,
  Flame,
  FileCheck,
  Building2,
  Info,
  Scale,
  Ruler,
  MessageSquare,
  ShieldCheck,
  Send,
  Radio,
  HelpCircle
} from 'lucide-react';
import { useHis } from '../../../context/HisContext';
import { Patient, Vitals } from '../../../types/his';
import {
  ClinicalActivity,
  CriticalResultAlert,
  CriticalResultState,
  ClinicalDiagnosisEntry,
  MedicationVerificationPolicy,
  AnthropometricRecord
} from '../../../types/clinicalWorkspace';
import {
  MOCK_ACTIVE_CARE_TEAMS,
  MOCK_TRIAGE_ASSESSMENTS,
  MOCK_DETERIORATION_SCORES,
  MOCK_CRITICAL_RESULTS,
  MOCK_PATIENT_DIAGNOSES,
  MOCK_MEDICATION_VERIFICATION_POLICIES,
  MOCK_ANTHROPOMETRICS
} from '../../../data/mockClinicalWorkspaceData';

interface SummaryActivityProps {
  patient: Patient;
  onNavigateTab: (activity: ClinicalActivity) => void;
}

export const SummaryActivity: React.FC<SummaryActivityProps> = ({ patient, onNavigateTab }) => {
  const {
    erPatients,
    icuBeds,
    wardBeds,
    surgeryCases,
    progressNotes,
    careTransitions,
    clinicalTasks,
    activeWorkArea,
    playChime
  } = useHis();

  // Departmental context
  const erCase = erPatients.find(e => e.patientId === patient.id && e.status !== 'discharged');
  const icuBed = icuBeds.find(b => b.patientId === patient.id);
  const wardBed = wardBeds.find(w => w.patientId === patient.id);
  const surgeryCase = surgeryCases.find(s => s.patientId === patient.id && s.status !== 'completed');
  const patientNotes = progressNotes.filter(n => n.patientId === patient.id);
  const activeTrans = careTransitions.find(t => t.patientId === patient.id && t.status !== 'transferred');

  // Care Team & Assessments
  const careTeam = MOCK_ACTIVE_CARE_TEAMS[patient.id] || MOCK_ACTIVE_CARE_TEAMS['pat-1'];
  const triageAssessment = MOCK_TRIAGE_ASSESSMENTS[patient.id] || (erCase ? MOCK_TRIAGE_ASSESSMENTS['pat-1'] : undefined);
  const deteriorationScore = MOCK_DETERIORATION_SCORES[patient.id] || MOCK_DETERIORATION_SCORES['pat-1'];
  const anthropometrics: AnthropometricRecord = MOCK_ANTHROPOMETRICS[patient.id] || MOCK_ANTHROPOMETRICS['pat-1'];
  const patientDiagnoses: ClinicalDiagnosisEntry[] = MOCK_PATIENT_DIAGNOSES;

  // Critical Results State (Mock Interaction for Acknowledgment, Communication, and Read-Back)
  const [criticalResults, setCriticalResults] = useState<CriticalResultAlert[]>(MOCK_CRITICAL_RESULTS);
  const [selectedCommunicationResult, setSelectedCommunicationResult] = useState<CriticalResultAlert | null>(null);
  const [commActionType, setCommActionType] = useState<'acknowledge' | 'document_communication' | 'read_back'>('acknowledge');
  const [commMethod, setCommMethod] = useState<'telephone' | 'secure_messaging' | 'in_person' | 'ehr_critical_alert'>('telephone');
  const [commRecipient, setCommRecipient] = useState('سارة مصطفى');
  const [commRecipientRole, setCommRecipientRole] = useState('RN - تمريض سريري متقدم');
  const [commReporter, setCommReporter] = useState('أخصائي المختبر رامي كمال');
  const [commNotes, setCommNotes] = useState('تم إبلاغ الفريق الطبي بالنتيجة الحرجة واتخاذ الإجراء السريري العاجل وفق السياسة.');
  const [commReadBackConfirmed, setCommReadBackConfirmed] = useState(false);

  // UI Expandable sections
  const [isCareTeamExpanded, setIsCareTeamExpanded] = useState(false);
  const [showTechnicalCodes, setShowTechnicalCodes] = useState(false);

  // Active encounter determination
  const encounterId = erCase
    ? `ENC-ER-${erCase.id.slice(-4).toUpperCase()}`
    : icuBed
    ? `ENC-ICU-${icuBed.id.slice(-4).toUpperCase()}`
    : wardBed
    ? `ENC-IPD-${wardBed.id.slice(-4).toUpperCase()}`
    : surgeryCase
    ? `ENC-OR-${surgeryCase.id.slice(-4).toUpperCase()}`
    : `ENC-OPD-9942`;

  const locationLabel = erCase
    ? `طوارئ: ${erCase.bedNo}`
    : icuBed
    ? `العناية المركزة: ${icuBed.bedNo}`
    : wardBed
    ? `جناح ${wardBed.wardNameAr}: سرير ${wardBed.bedNumber}`
    : surgeryCase
    ? `العمليات: مسرح ${surgeryCase.theatreCode}`
    : 'العيادات الخارجية: عيادة القلب 101';

  // Representative vitals
  const [icuSysStr, icuDiaStr] = (icuBed?.hemodynamics?.artLineBp || '118/68').split('/');
  const icuSys = parseInt(icuSysStr, 10) || 118;
  const icuDia = parseInt(icuDiaStr, 10) || 68;

  const currentVitals: Vitals = erCase?.vitals || (icuBed ? {
    bpSystolic: icuSys,
    bpDiastolic: icuDia,
    pulseRate: icuBed.hemodynamics?.hr ?? 85,
    temp: 37.1,
    spo2: icuBed.hemodynamics?.spo2 ?? 96,
    respiratoryRate: icuBed.ventilator?.respiratoryRateSet || (icuBed.ventilator?.isVentilated ? 16 : 18),
    recordedAt: 'الآن (مباشر Hemodynamics)',
    recordedBy: 'مراقبة العناية المركزة'
  } : {
    bpSystolic: 125,
    bpDiastolic: 82,
    pulseRate: 78,
    temp: 36.9,
    spo2: 98,
    respiratoryRate: 18,
    recordedAt: '14:00',
    recordedBy: 'أحمد جلال (RN - ممرض مرخص)'
  });

  // Handle direct critical result acknowledge
  const handleAcknowledgeResult = (resultId: string) => {
    setCriticalResults(prev =>
      prev.map(r =>
        r.id === resultId
          ? {
              ...r,
              state: 'acknowledged',
              acknowledgedBy: 'د. طارق المنشاوي (استشاري معالج)',
              acknowledgedAt: 'الآن'
            }
          : r
      )
    );
    playChime('success');
  };

  // Open Communication Dialog
  const openCommunicationModal = (result: CriticalResultAlert, defaultAction: 'acknowledge' | 'document_communication' | 'read_back') => {
    setSelectedCommunicationResult(result);
    setCommActionType(defaultAction);
    setCommReadBackConfirmed(defaultAction === 'read_back' || result.communicationPolicy.requiresReadBack);
    setCommMethod(result.communicationMethod || 'telephone');
    setCommNotes(result.communicationNotes || (defaultAction === 'read_back' ? 'تمت القراءة التأكيدية للنتيجة هاتفياً ومطابقة بيانات المريض.' : 'تم توثيق التواصل السريري وإبلاغ الطبيب المعالج.'));
  };

  // Handle communication documentation save
  const handleSaveCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunicationResult) return;

    const newState: CriticalResultState =
      commActionType === 'read_back' || (commReadBackConfirmed && selectedCommunicationResult.communicationPolicy.requiresReadBack)
        ? 'read_back_documented'
        : commActionType === 'document_communication'
        ? 'communication_documented'
        : 'acknowledged';

    setCriticalResults(prev =>
      prev.map(r =>
        r.id === selectedCommunicationResult.id
          ? {
              ...r,
              state: newState,
              acknowledgedBy: r.acknowledgedBy || 'د. طارق المنشاوي (استشاري)',
              acknowledgedAt: r.acknowledgedAt || 'الآن',
              communicationMethod: commMethod,
              recipientName: commRecipient,
              recipientRole: commRecipientRole,
              readBackConfirmed: commReadBackConfirmed,
              communicationTimestamp: 'الآن',
              communicationNotes: commNotes
            }
          : r
      )
    );
    setSelectedCommunicationResult(null);
    playChime('success');
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* TOP CLINICAL SNAPSHOT STRIP (CONTEXT-AWARE HEADER)             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                الملخص السريري التنفيذي (Clinical Snapshot)
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {encounterId}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                📍 الموقع السريري: <strong className="text-slate-800">{locationLabel}</strong>
                <span className="text-[10px] text-slate-400 mr-1">(Location Only - ليس معرّفاً للمريض)</span>
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>سبب الرعاية الرئيسي:</span>
              <span className="text-teal-900 font-extrabold">
                {erCase?.chiefComplaint ||
                  wardBed?.diagnosis ||
                  icuBed?.diagnosis ||
                  'احتشاء حاد بعضلة القلب مع مراقبة ما بعد القسطرة (Post-PCI Acute Coronary Syndrome)'}
              </span>
            </h2>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('vitals')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              <span>مصفوفة العلامات والـ NEWS2</span>
            </button>
            <button
              onClick={() => onNavigateTab('notes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>تدوين مرور طبي (SOAP)</span>
            </button>
            <button
              onClick={() => onNavigateTab('orders')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>أوامر CPOE وطلبات</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Panel (ER vs ICU vs Wards vs OPD vs OR) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Tile 1: Acuity & Clinical Deterioration Score */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>نظام تقييم التدهور السريري المبكر</span>
              </span>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                الملف النشط: {deteriorationScore.activeProfile}
              </span>
            </div>

            {triageAssessment ? (
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      triageAssessment.acuityLevel === 1
                        ? 'bg-red-600 animate-pulse'
                        : triageAssessment.acuityLevel === 2
                        ? 'bg-amber-600'
                        : 'bg-emerald-600'
                    }`}
                  />
                  <strong className="text-xs font-black text-slate-900">
                    {triageAssessment.acuityLabelAr}
                  </strong>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  المعيار: {triageAssessment.triageProfile}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  وقت الوصول: <span className="font-mono font-bold">{triageAssessment.arrivalTime}</span> • زمن الرؤية الطبية: <span className="font-mono font-bold">{triageAssessment.timeToDoctorMinutes} دقيقة</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {deteriorationScore.scoreSystemName}
                  </span>
                  <span className="font-mono font-black text-sm text-teal-800">
                    {deteriorationScore.scoreValue} / {deteriorationScore.maxScore}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-amber-700 mt-0.5">
                  {deteriorationScore.riskLabelAr}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  التوصية: {deteriorationScore.actionRecommendationAr}
                </div>
              </div>
            )}
          </div>

          {/* Tile 2: Latest Vitals & Anthropometrics Snapshot */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                <span>العلامات والقياسات الجسمانية (Anthropometrics)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentVitals.recordedAt}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">BP</span>
                <span className="text-xs font-bold text-slate-900">
                  {currentVitals.bpSystolic}/{currentVitals.bpDiastolic}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">HR</span>
                <span className={`text-xs font-bold ${currentVitals.pulseRate > 100 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentVitals.pulseRate}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">SpO2</span>
                <span className="text-xs font-bold text-emerald-700">
                  {currentVitals.spo2}%
                </span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-sans">الألم Pain</span>
                <span className="text-xs font-bold text-amber-700">
                  {patient.painLevel || 3}/10
                </span>
              </div>
            </div>

            {/* Anthropometric inline bar */}
            <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center justify-between text-[10px] text-slate-700 font-sans">
              <div className="flex items-center gap-1">
                <Scale className="w-3 h-3 text-teal-600 shrink-0" />
                <span>الوزن والطول:</span>
                <span className="font-mono font-bold text-slate-900">{anthropometrics.weightKg} kg</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono font-bold text-slate-900">{anthropometrics.heightCm} cm</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span className="text-slate-500">BMI:</span>
                <span className="font-bold text-teal-800">{anthropometrics.bmi}</span>
                <span className="text-slate-400 text-[9px]">(BSA: {anthropometrics.bsaM2} m²)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>مسجّل بواسطة: {currentVitals.recordedBy}</span>
              <span className="text-teal-700 font-bold cursor-pointer hover:underline" onClick={() => onNavigateTab('vitals')}>
                عرض التدفق الكامل ←
              </span>
            </div>
          </div>

          {/* Tile 3: Active Care Team Snapshot (Capability) */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>فريق الرعاية النشط (Active Care Team)</span>
              </span>
              <button
                onClick={() => setIsCareTeamExpanded(!isCareTeamExpanded)}
                className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
              >
                {isCareTeamExpanded ? 'طي التفاصيل' : 'عرض الفريق (4)'}
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">الطبيب المعالج:</span>
                <span className={careTeam?.members?.[0]?.name ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-normal italic'}>
                  {careTeam?.members?.[0]?.name || 'غير محدد'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">ممرض الحالة:</span>
                <span className={careTeam?.members?.[1]?.name ? 'text-slate-900' : 'text-slate-500 font-normal italic'}>
                  {careTeam?.members?.[1]?.name || 'غير محدد'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between">
                <span>{careTeam?.shiftLabel || 'الوردية غير محددة'}</span>
                {careTeam?.members?.[0]?.contactExtension && (
                  <span className="font-mono">تحويلة: {careTeam.members[0].contactExtension}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Care Team Drawer */}
        {isCareTeamExpanded && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2 text-xs animate-in fade-in duration-200">
            <div className="font-bold text-blue-950 flex items-center justify-between">
              <span>أعضاء فريق الرعاية السريرية المباشر لهذا المريض:</span>
              <span className="text-[10px] text-blue-700 font-mono">آخر تحديث: {careTeam?.lastUpdated || 'اليوم'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {(careTeam?.members || []).map(member => (
                <div key={member.id} className="p-2.5 rounded-lg bg-white border border-blue-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {member.roleLabelAr}
                    </span>
                    {member.isPrimaryContact && (
                      <span className="text-[10px] text-emerald-700 font-bold">جهة الاتصال الأولى</span>
                    )}
                  </div>
                  <strong className="text-slate-900 block">{member.name}</strong>
                  <div className="text-[10px] text-slate-500">{member.department}</div>
                  {member.contactExtension && (
                    <div className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-slate-400" />
                      <span>Ext: {member.contactExtension}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CRITICAL ALERTS & ACTIONABLE PENDING REQUESTS STRIP           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRITICAL RESULTS & ESCALATION SLA CARD */}
        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>النتائج المخبرية والشعاعية الحرجة (Critical Results Alert)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                    {criticalResults.filter(r => r.state === 'awaiting_acknowledgement').length} بحاجة لإجراء
                  </span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  نظام توثيق التواصل السريري والإقرار وفق سياسات القيم الحرجة المعتمدة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTechnicalCodes(!showTechnicalCodes)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>{showTechnicalCodes ? 'إخفاء الرموز التقنية' : 'عرض الرموز (LOINC)'}</span>
              </button>
              <button
                onClick={() => onNavigateTab('results')}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>سجل النتائج</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {criticalResults.map(res => {
              const isReadBackDone = res.state === 'read_back_documented';
              const isCommDone = res.state === 'communication_documented';
              const isAcknowledged = res.state === 'acknowledged';
              const isAwaiting = res.state === 'awaiting_acknowledgement';

              return (
                <div
                  key={res.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isReadBackDone
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isCommDone
                      ? 'bg-blue-50/50 border-blue-200'
                      : isAcknowledged
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-rose-50 border-rose-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-slate-900 text-xs font-extrabold">{res.testName}</strong>
                        {showTechnicalCodes && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700">
                            {res.testTechnicalCode}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isReadBackDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCommDone
                              ? 'bg-blue-100 text-blue-800'
                              : isAcknowledged
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-600 text-white animate-pulse'
                          }`}
                        >
                          {isReadBackDone
                            ? 'تمت القراءة التأكيدية والإقرار'
                            : isCommDone
                            ? 'تم توثيق التواصل السريري'
                            : isAcknowledged
                            ? 'تم الإقرار من الطبيب'
                            : 'نتيجة حرجة بانتظار التواصل'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        القيمة الحرجة:{' '}
                        <span className="font-mono font-black text-rose-700 text-sm">
                          {res.value} {res.unit}
                        </span>{' '}
                        • المعدل المرجعي: <span className="font-mono">{res.referenceRange}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        سياسة الإبلاغ: <span className="text-slate-700 font-medium">{res.communicationPolicy.policyName}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono text-[10px] text-slate-500">
                      <div>وقت التبليغ: {res.reportedAt}</div>
                      <div className="text-rose-700 font-bold">
                        المهلة المستهدفة: {res.escalationSlaPolicy.targetMinutes} دقيقة (SLA)
                      </div>
                    </div>
                  </div>

                  {/* Documented Communication details if present */}
                  {(res.communicationNotes || res.acknowledgedBy) && (
                    <div className="mt-2.5 p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-[10px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>وسيلة التواصل: {res.communicationMethod === 'telephone' ? 'هاتفياً (Telephone)' : res.communicationMethod === 'secure_messaging' ? 'تراسل سريري مشفر' : res.communicationMethod === 'in_person' ? 'مباشرة بالقسم (In-Person)' : 'تنبيه الملف الإلكتروني (EHR Alert)'}</span>
                        </span>
                        <span>الوقت: {res.communicationTimestamp || res.acknowledgedAt}</span>
                      </div>
                      {res.communicationNotes && (
                        <p className="text-slate-700 text-[11px] pt-0.5">{res.communicationNotes}</p>
                      )}
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                        <span>المبلّغ: {res.reportedBy} ({res.reporterRole})</span>
                        <span>المستلم/المعتمد: {res.recipientName || res.acknowledgedBy}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/60">
                    <div className="text-[10px] text-slate-500">
                      {res.communicationPolicy.requiresReadBack ? (
                        <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          السياسة تشترط القراءة التأكيدية (Read-Back Mandatory)
                        </span>
                      ) : (
                        <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          السياسة: توثيق التواصل السريري والإقرار
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isAwaiting && (
                        <button
                          onClick={() => handleAcknowledgeResult(res.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                        >
                          إقرار استلام (Acknowledge)
                        </button>
                      )}
                      {!isReadBackDone && (
                        <button
                          onClick={() => openCommunicationModal(res, res.communicationPolicy.requiresReadBack ? 'read_back' : 'document_communication')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                        >
                          {res.communicationPolicy.requiresReadBack ? 'توثيق Read-Back' : 'توثيق التواصل / الإبلاغ'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIONABLE REQUESTS & CLINICAL ORDERS (REQUEST ≠ NOTE / REQUEST ≠ ADMISSION) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4 text-indigo-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>الأوامر والطلبات المعلقة (Orders & Requests Awaiting Action)</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  فصل صارم بين الطلب الإجرائي (Request) والتوثيق المكتمل (Note / Procedure)
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>مركز الأوامر CPOE</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Consultation Request (Request ≠ Consultation Note) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    طلب استشارة سريرية (Consultation Request)
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">#REQ-CNS-4091</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  بانتظار رد الاستشاري
                </span>
              </div>
              <strong className="text-slate-900 block">
                طلب استشارة قلبية تداخلية عاجلة (Urgent Cardiology Consult)
              </strong>
              <p className="text-slate-600 text-[11px]">
                المطلوب: تقييم الشريان التاجي الأيمن بعد القسطرة وتحديد جرعة الـ Ticagrelor المناسبة.
              </p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span>الطالب: د. وليد الصاوي (طوارئ)</span>
                <span className="text-indigo-700 font-bold cursor-pointer hover:underline" onClick={() => onNavigateTab('orders')}>
                  تفاصيل الطلب ومسار التنسيق ←
                </span>
              </div>
            </div>

            {/* Inpatient Admission Request (Request ≠ Actual Admission) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    طلب تنويم داخلي (Admission Request)
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">#REQ-ADM-8821</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  تم تخصيص السرير CCU-01
                </span>
              </div>
              <strong className="text-slate-900 block">
                طلب تنويم في وحدة الرعاية التاجية الفائقة (CCU / Cardiac ICU)
              </strong>
              <p className="text-slate-600 text-[11px]">
                الحالة تتطلب سريراً مزوداً بمراقبة شريانية ومضخة تسريب ثنائية، الطلب لا يعد تنويماً حتى يتم النقل الفعلي.
              </p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span>السرير المقترح: CCU-Bed-01 • منسق التنويم: ريهام كمال</span>
                <span className="text-indigo-700 font-bold cursor-pointer hover:underline" onClick={() => onNavigateTab('timeline')}>
                  لوحة الانتقال SBAR ←
                </span>
              </div>
            </div>

            {/* Surgical / OR Request (Surgery Request ≠ Performed Procedure) */}
            {surgeryCase && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      طلب حجز عمليات (Surgical Booking Request)
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">#REQ-OR-301</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    قيد التجهيز الجراحي STAT
                  </span>
                </div>
                <strong className="text-slate-900 block">
                  طلب استكشاف جراحي طارئ (Exploratory Laparotomy & Hemostasis)
                </strong>
                <p className="text-slate-700 text-[11px]">
                  الجراح: {surgeryCase.leadSurgeon} • غرفة العمليات المستهدفة: مسرح {surgeryCase.theatreCode}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2-COLUMN CLINICAL COCKPIT: PROBLEMS, MEDS & NOTES             */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMN 1: PROBLEMS & HIGH-ALERT MEDICATIONS */}
        <div className="space-y-6">
          {/* Active Problems (Encounter vs Longitudinal) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    التشخيص الراهن وقائمة المشاكل الطولية (Diagnoses & Problems)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    فصل سريري بين تشخيص الزيارة الحالية والمشاكل المزمنة وفق المصطلحات المعيارية
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('problems')}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة المشاكل</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Encounter Principal Diagnosis */}
              {patientDiagnoses
                .filter(d => d.diagnosisType === 'encounter_principal')
                .map(dx => (
                  <div key={dx.id} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                        التشخيص الرئيسي للزيارة الراهنة (Principal Encounter Diagnosis)
                      </span>
                      <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        مؤكد Confirmed
                      </span>
                    </div>

                    <strong className="text-rose-950 font-black block text-sm">
                      {dx.conditionName}
                    </strong>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div className="p-2 rounded bg-white border border-rose-200">
                        <span className="text-slate-500 block">المصطلحات السريرية (Configured Terminology):</span>
                        <strong className="text-slate-800 font-mono block mt-0.5">
                          {dx.clinicalTerminology.code} • {dx.clinicalTerminology.display}
                        </strong>
                        <span className="text-[9px] text-slate-400">نظام المصطلحات: {dx.clinicalTerminology.system}</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-rose-200">
                        <span className="text-slate-500 block">التصنيف الإحصائي (Classification Profile):</span>
                        <strong className="text-slate-800 font-mono block mt-0.5">
                          {dx.classificationProfile.code} • {dx.classificationProfile.category}
                        </strong>
                        <span className="text-[9px] text-slate-400">ملف التصنيف: {dx.classificationProfile.profileName}</span>
                      </div>
                    </div>

                    {dx.notes && (
                      <p className="text-rose-800 text-[11px] pt-1">
                        {dx.notes}
                      </p>
                    )}
                  </div>
                ))}

              {/* Longitudinal Problems List */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  قائمة المشاكل الطولية المزمنة (Longitudinal Problem List):
                </span>
                <div className="space-y-2">
                  {patientDiagnoses
                    .filter(d => d.diagnosisType === 'longitudinal_chronic')
                    .map(prob => (
                      <div
                        key={prob.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <strong className="text-slate-800 text-xs">{prob.conditionName}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              {prob.clinicalTerminology.code}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                              {prob.classificationProfile.code}
                            </span>
                          </div>
                        </div>
                        {prob.notes && (
                          <p className="text-[10px] text-slate-500 pr-4">{prob.notes}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Medications & Medication Verification Policy */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Pill className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    الأدوية النشطة وسياسات التحقق السريري (eMAR & Verification Policies)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    التحقق والتوثيق محكوم بسياسات سلامة الأدوية لكل فئة علاجية (Configured Policies)
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('medications')}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>سجل eMAR الكامل</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Norepinephrine with Dual Independent Verification Policy */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                      دواء عالي الخطورة HIGH-ALERT
                    </span>
                    <strong className="text-slate-900 font-extrabold text-xs">
                      Norepinephrine (Noradrenaline) Infusion
                    </strong>
                  </div>
                  <span className="font-mono text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                    0.08 mcg/kg/min
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  مضخة تسريب ذكية عبر القسطرة المركزية • المستهدف: الحفاظ على ضغط الدم الشرياني MAP ≥ 65 mmHg.
                </div>
                <div className="bg-white p-2 rounded-lg border border-rose-200 space-y-1 text-[10px]">
                  <div className="flex items-center justify-between text-rose-900 font-bold">
                    <span>السياسة المعتمدة: {MOCK_MEDICATION_VERIFICATION_POLICIES['norepinephrine']?.governingPolicy}</span>
                    <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                      {MOCK_MEDICATION_VERIFICATION_POLICIES['norepinephrine']?.policyLabelAr}
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-center justify-between">
                    <span>✓ تم التحقق المزدوج المستقل بواسطة: أحمد جلال (RN) & سارة مصطفى (RN)</span>
                    <span className="font-mono">14:00</span>
                  </div>
                </div>
              </div>

              {/* Enoxaparin with Single Clinician Verification Policy */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-bold">Enoxaparin (Clexane) 60mg SC Q12H</strong>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      High-Alert Anticoagulant
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded font-mono text-[10px] bg-blue-100 text-blue-800 font-bold">
                    مجدول في eMAR
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  السياسة المعتمدة: {MOCK_MEDICATION_VERIFICATION_POLICIES['enoxaparin']?.governingPolicy}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
                  <span>الجرعة القادمة: 18:00 • يتطلب فحص موضع الحقن ومسح الباركود</span>
                  <span className="text-amber-800 font-semibold">{MOCK_MEDICATION_VERIFICATION_POLICIES['enoxaparin']?.policyLabelEn}</span>
                </div>
              </div>

              {/* Ticagrelor PO with Standard BCMA Policy */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 font-bold block">Ticagrelor (Brilinta) 90mg PO BID</strong>
                    <span className="text-[10px] text-slate-500">مضاد تجمع صفائح دموي بعد القسطرة التاجية</span>
                  </div>
                  <span className="px-2 py-1 rounded font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                    أعطي 14:00 (Given)
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  السياسة: {MOCK_MEDICATION_VERIFICATION_POLICIES['ticagrelor']?.governingPolicy}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: RECENT NOTES, CLINICAL EVENTS & CARE PLAN */}
        <div className="space-y-6">
          {/* Latest Clinical Documentation & Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    أحدث الملاحظات والتقارير السريرية (Recent Notes & Rounds)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    توثيق متعدد التخصصات: طبي، تمريضي، استشاري
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('notes')}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>جميع الملاحظات ({patientNotes.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {patientNotes.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                  لا توجد ملاحظات سريرية مدونة حتى الآن لهذا المريض.
                </div>
              ) : (
                patientNotes.slice(0, 2).map(note => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>{note.title}</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">{note.timestamp}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">{note.content}</p>
                    <div className="text-[10px] text-teal-800 font-semibold pt-1 flex items-center justify-between">
                      <span>الكاتب: {note.authorName} ({note.authorRole})</span>
                      <span className="text-slate-400 font-mono">موقعة سريرياً Signed</span>
                    </div>
                  </div>
                ))
              )}

              {/* Sample Operative or Procedure Note */}
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-teal-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>تقرير القسطرة التداخلية (Primary PCI Cath Lab Report)</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">13:40</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  تم عمل قسطرة تاجية عاجلة عبر الشريان الكعبري الأيمن. إظهار انسداد كامل للشريان التاجي الأيمن RCA، تم توسيعه وتركيب دعامة دوائية Onyx 3.5x24mm بنجاح وتدفق TIMI-3 ممتاز.
                </p>
                <div className="text-[10px] text-teal-800 font-bold pt-1">
                  المشغل: د. طارق المنشاوي (استشاري قسطرة قلب)
                </div>
              </div>
            </div>
          </div>

          {/* Current Care Plan & Discharge Readiness Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    ملخص خطة الرعاية وجاهزية الخروج (Care Plan & Discharge Goals)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    أهداف الـ 24 ساعة، معايير الانتقال، والتثقيف الصحي
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('care_plan')}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>خطة الرعاية الكاملة</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-teal-600 font-bold">●</span>
                <div>
                  <strong className="text-slate-800 block">الهدف السريري الحالي:</strong>
                  <span className="text-slate-600 text-[11px]">
                    الحفاظ على الاستقرار الهيموديناميكي وفطام النورأدرينالين خلال 12 ساعة القادمة.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-teal-600 font-bold">●</span>
                <div>
                  <strong className="text-slate-800 block">معايير الانتقال إلى جناح التنويم العادي:</strong>
                  <span className="text-slate-600 text-[11px]">
                    استقرار ضغط الدم دون الحاجة لرافعات ضغط، غياب نوبات ألم الصدر لـ 24 ساعة، وتحليل Troponin في مسار نزولي.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-teal-600 font-bold">●</span>
                <div>
                  <strong className="text-slate-800 block">تثقيف المريض والأسرة:</strong>
                  <span className="text-slate-600 text-[11px]">
                    شرح أهمية الالتزام بمميعات الدم الثنائية (DAPT) وعدم إيقافها مطلقاً، وتثقيف حول علامات الإنذار القلبي.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CRITICAL RESULT COMMUNICATION / ACKNOWLEDGEMENT        */}
      {/* ------------------------------------------------------------- */}
      {selectedCommunicationResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span>إدارة وإبلاغ النتيجة الحرجة (Critical Result Communication)</span>
                  <span className="text-[11px] text-slate-500 block font-normal">
                    {selectedCommunicationResult.communicationPolicy.policyName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCommunicationResult(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-rose-950 font-black">{selectedCommunicationResult.testName}</strong>
                <span className="font-mono text-rose-800 font-bold text-sm">
                  {selectedCommunicationResult.value} {selectedCommunicationResult.unit}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>المعدل المرجعي: <span className="font-mono">{selectedCommunicationResult.referenceRange}</span></span>
                <span>المبلّغ الأصلي: {selectedCommunicationResult.reportedBy} ({selectedCommunicationResult.reportedAt})</span>
              </div>
            </div>

            <form onSubmit={handleSaveCommunication} className="space-y-3.5 text-xs">
              {/* Communication Action Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">نوع الإجراء السريري المتخذ:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCommActionType('acknowledge');
                      setCommReadBackConfirmed(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      commActionType === 'acknowledge'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    إقرار مباشر
                    <span className="block text-[10px] font-normal text-slate-500">Acknowledge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCommActionType('document_communication');
                      setCommReadBackConfirmed(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      commActionType === 'document_communication'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    توثيق تواصل سريري
                    <span className="block text-[10px] font-normal text-slate-500">Communication</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCommActionType('read_back');
                      setCommReadBackConfirmed(true);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      commActionType === 'read_back'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    قراءة تأكيدية
                    <span className="block text-[10px] font-normal text-slate-500">Read-Back</span>
                  </button>
                </div>
              </div>

              {/* Communication Channel */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">وسيلة / قناة التواصل السريري:</label>
                <select
                  value={commMethod}
                  onChange={e => setCommMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                >
                  <option value="telephone">اتصال هاتفي مباشر (Telephone Call)</option>
                  <option value="secure_messaging">تراسل سريري مشفر ومسجل (Secure Clinical Messaging)</option>
                  <option value="in_person">إبلاغ مباشر داخل القسم السريري (In-Person)</option>
                  <option value="ehr_critical_alert">إشعار إلكتروني معتمد بالملف (EHR Critical Alert)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الطرف المستلم / المعتمد:</label>
                  <input
                    type="text"
                    value={commRecipient}
                    onChange={e => setCommRecipient(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصفة / الدور السريري:</label>
                  <input
                    type="text"
                    value={commRecipientRole}
                    onChange={e => setCommRecipientRole(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Adaptation to Communication Method: Verbal Read-Back vs Secure Electronic Acknowledgement */}
              {commMethod === 'telephone' || commMethod === 'in_person' ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commReadBackConfirmed}
                      onChange={e => setCommReadBackConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>تمت القراءة التأكيدية الشفهية ومطابقة هوية المريض كاملة (Verbal Read-Back Confirmed)</span>
                  </label>
                  <div className="text-[10px] text-slate-500 pr-6">
                    {selectedCommunicationResult.communicationPolicy.requiresReadBack ? (
                      <span className="text-amber-800 font-bold">إلزام سريري: تواصل هاتفي/شفهي يتطلب قراءة تأكيدية كاملة (Read-Back) بحسب السياسة المعتمدة.</span>
                    ) : (
                      <span>تواصل شفهي/هاتفي: القراءة التأكيدية موصى بها سريرياً.</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>إقرار استلام وتوثيق إلكتروني مؤمن (Secure Electronic Acknowledgement)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 pr-6">
                    نظام التواصل المعتمد هو قناة إلكترونية مشفرة داخل الـ EHR. يتم تسجيل الاستلام بختم زمني وتوقيع رقمي موثق دون الحاجة إلى Read-Back شفهي.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان الإجراء السريري وملاحظات التواصل:</label>
                <textarea
                  rows={2}
                  value={commNotes}
                  onChange={e => setCommNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCommunicationResult(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  حفظ وتأكيد الإجراء السريري
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
