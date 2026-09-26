import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  QrCode,
  HeartPulse,
  Bed,
  FileCode,
  UserCheck,
  Building2,
  Siren,
  Scissors,
  Activity,
  GitFork,
  Printer,
  ChevronDown,
  Info,
  Scan,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  Shield
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { Patient, Vitals } from '../../types/his';
import { CareTransitionModal } from '../CareTransitions/CareTransitionModal';
import { PatientIdentityVerificationModal } from './common/PatientIdentityVerificationModal';
import { AllergyStatusIndicator } from './common/AllergyStatusIndicator';
import { VerificationAttemptRecord } from '../../types/clinicalIdentityVerification';
import { MOCK_DETAILED_ALLERGIES } from '../../data/mockClinicalHistoryProblemsData';
import { MOCK_CODE_STATUS_PROVENANCE } from '../../data/mockClinicalWorkspaceData';

interface PatientSafetyBannerProps {
  patient: Patient;
}

export const PatientSafetyBanner: React.FC<PatientSafetyBannerProps> = ({ patient }) => {
  const {
    currentStaff,
    playChime,
    workspaceOrigin,
    closePatientWorkspace,
    openStandardsModal,
    openLifecycleModal,
    switchWorkspaceActivity,
    erPatients,
    icuBeds,
    wardBeds,
    appointments,
    surgeryCases,
    careTransitions
  } = useHis();

  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showCodeStatusModal, setShowCodeStatusModal] = useState(false);
  const [lastVerificationRecord, setLastVerificationRecord] = useState<VerificationAttemptRecord | null>(null);

  const codeStatusRecord = MOCK_CODE_STATUS_PROVENANCE[patient.id] || MOCK_CODE_STATUS_PROVENANCE['pat-1'];

  // Detect if patient identity is temporary / unresolved in ADT
  const isTemporaryIdentity =
    patient.mrn?.startsWith('TEMP-') ||
    patient.fullNameAr?.includes('مجهول') ||
    (patient as any).isTemporaryUnknown ||
    patient.nationalId?.includes('PENDING');

  // Find active departmental links for this patient
  const erCase = erPatients.find(e => e.patientId === patient.id && e.status !== 'discharged');
  const icuBed = icuBeds.find(b => b.patientId === patient.id);
  const wardBed = wardBeds.find(w => w.patientId === patient.id);
  const surgeryCase = surgeryCases.find(s => s.patientId === patient.id && s.status !== 'completed');
  const apt = appointments.find(a => a.patientId === patient.id && a.status !== 'completed');
  const activeTrans = careTransitions.find(t => t.patientId === patient.id && t.status !== 'transferred');

  // Determine current care location & team
  let careAreaLabel = 'العيادات الخارجية (OPD)';
  let bedRoomLabel = 'الانتظار العام';
  let attendingDoctor = 'د. طارق المنشاوي (استشاري قلب)';
  let primaryNurse = 'سارة مصطفى (RN)';
  let isolationPrecaution: string | null = null;
  let fallRisk: 'high' | 'moderate' | 'low' = 'low';
  let relevantVitals: Vitals | undefined = undefined;
  let news2Score: number | undefined = undefined;

  if (erCase) {
    careAreaLabel = 'قسم الطوارئ والحوادث (ER)';
    bedRoomLabel = `${erCase.bedNo} (${erCase.assignedArea === 'resus_bay' ? 'إنعاش فوري' : 'حالات حادة'})`;
    attendingDoctor = erCase.attendingDoctor;
    primaryNurse = erCase.primaryNurse;
    relevantVitals = erCase.vitals;
    news2Score = erCase.vitals.news2Score;
  } else if (icuBed) {
    careAreaLabel = 'العناية المركزة والرعاية الحثيثة (ICU)';
    bedRoomLabel = icuBed.bedNo || 'سرير العناية المركزة';
    attendingDoctor = icuBed.attendingIntensivist || 'د. خالد عبد العزيز (استشاري عناية مركزة)';
    primaryNurse = icuBed.primaryNurse || 'أحمد جلال (Critical Care RN)';
    fallRisk = 'high';
    const [sysStr, diaStr] = (icuBed.hemodynamics?.artLineBp || '118/68').split('/');
    const bpSys = parseInt(sysStr, 10) || 118;
    const bpDia = parseInt(diaStr, 10) || 68;
    const heartRate = icuBed.hemodynamics?.hr ?? 88;
    const oxygenSat = icuBed.hemodynamics?.spo2 ?? 96;
    relevantVitals = {
      bpSystolic: bpSys,
      bpDiastolic: bpDia,
      pulseRate: heartRate,
      temp: 37.1,
      spo2: oxygenSat,
      respiratoryRate: icuBed.ventilator?.respiratoryRateSet || (icuBed.ventilator?.isVentilated ? 16 : 18),
      recordedAt: 'الآن (Live Hemodynamics)',
      recordedBy: 'ICU Telemetry Monitor',
      painScore: 2,
      triageLevel: 'level_1_resuscitation',
      news2Score: heartRate > 110 || bpSys < 90 ? 5 : 2
    };
    news2Score = oxygenSat < 92 || bpSys < 90 ? 7 : 4;
  } else if (wardBed) {
    careAreaLabel = `أجنحة التنويم (${wardBed.wardNameAr})`;
    bedRoomLabel = `سرير ${wardBed.bedNumber} - ${wardBed.roomNumber}`;
    attendingDoctor = wardBed.attendingPhysician || 'د. سمر النجار (باطنة)';
    primaryNurse = wardBed.assignedNurse || 'مروة الشربيني (Staff RN)';
    fallRisk = wardBed.fallRisk || 'moderate';
    if (wardBed.isIsolation) {
      isolationPrecaution = wardBed.isolationType || 'عزل وقائي هوائي وتلامسي (Airborne & Contact)';
    }
  } else if (surgeryCase) {
    careAreaLabel = 'غرف العمليات وجراحة اليوم الواحد (OR)';
    bedRoomLabel = `${surgeryCase.theatreCode} (${surgeryCase.status})`;
    attendingDoctor = surgeryCase.leadSurgeon;
    primaryNurse = surgeryCase.circulatingNurse || 'فريق تمريض العمليات';
  }

  const isCriticalVitals = (news2Score !== undefined && news2Score >= 5) || (relevantVitals && relevantVitals.spo2 < 93);

  // Return back label based on origin
  const getOriginLabel = () => {
    switch (workspaceOrigin?.workArea) {
      case 'er':
        return 'العودة إلى بورد الطوارئ (ER Board)';
      case 'icu':
        return 'العودة إلى سنسس العناية (ICU Census)';
      case 'ipd':
        return 'العودة إلى أجنحة التنويم (Wards)';
      case 'or':
        return 'العودة إلى مسرح العمليات (OR)';
      case 'opd':
        return 'العودة إلى قائمة العيادات (OPD Queue)';
      case 'my_work':
        return 'العودة إلى مهامي السريرية (My Work)';
      default:
        return 'العودة إلى شاشة العمل';
    }
  };

  return (
    <>
      <div className="relative z-30 bg-slate-900 text-white rounded-2xl border border-slate-700/80 shadow-xl mb-4 overflow-hidden">
        {/* Urgent Alert Ticker if Critical Transfer or Alert */}
        {activeTrans && (
          <div className="bg-cyan-950/90 border-b border-cyan-800 text-cyan-200 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-2 font-bold min-w-0">
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              <span className="truncate">
                طلب انتقال سريري نشط: من <strong>{activeTrans.fromLocation}</strong> إلى <strong>{activeTrans.toLocation}</strong> • الحالة: {activeTrans.status}
              </span>
            </div>
            <button
              onClick={() => setShowTransitionModal(true)}
              className="text-[11px] underline font-bold hover:text-white cursor-pointer shrink-0"
            >
              متابعة مسار SBAR ➔
            </button>
          </div>
        )}

        {/* Temporary / Uncertain Identity Alert Banner (ADT Source of Truth) */}
        {isTemporaryIdentity && (
          <div
            id="temporary-identity-safety-banner"
            className="bg-amber-950/95 border-b border-amber-600 text-amber-100 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 font-bold min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span className="leading-snug">
                تنبيه ADT: هوية المريض مؤقتة / غير مكتملة المصادقة ({patient.mrn}) • لا يجوز استخدام رقم السرير أو الغرفة كمعرّف للشخص!
              </span>
            </div>
            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-[11px] shadow-xs cursor-pointer transition-colors shrink-0"
            >
              إجراء التحقق النشط من الهوية ➔
            </button>
          </div>
        )}

        {/* Main Banner Body */}
        <div className="p-3.5 sm:p-4 md:p-5 flex flex-col gap-3.5">
          {/* Top Tier: Patient Identity on Right, Action Buttons on Left */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 min-w-0">
            {/* Identity Block */}
            <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              {/* Back Button */}
              <button
                onClick={closePatientWorkspace}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                title={getOriginLabel()}
              >
                <ArrowRight className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="hidden md:inline">{getOriginLabel()}</span>
                <span className="md:hidden">رجوع</span>
              </button>

              {/* Patient Avatar & Initials */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-black text-base shadow-inner shrink-0">
                {patient.fullNameAr[0]}
              </div>

              {/* Patient Full Name & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight break-words"
                    title={patient.fullNameAr}
                  >
                    {patient.fullNameAr}
                  </h2>
                  {patient.fullNameEn && (
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline" dir="ltr">
                      ({patient.fullNameEn})
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 font-mono text-xs font-black border border-teal-800 shrink-0">
                    {patient.mrn}
                  </span>
                  {isTemporaryIdentity && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px] animate-pulse shrink-0">
                      هوية مؤقتة (Temp ID)
                    </span>
                  )}
                </div>

                {/* Sub-identifiers: Age, Gender, DOB, Configured National/Iqama ID, Encounter, Blood Group */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-300">
                  <span>العمر: <strong className="text-white">{patient.age} سنة</strong></span>
                  <span className="text-slate-600 hidden xs:inline">•</span>
                  <span>الجنس: <strong className="text-white">{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</strong></span>
                  <span className="text-slate-600 hidden xs:inline">•</span>
                  <span className="hidden sm:inline">الميلاد: <span className="font-mono text-slate-300">{patient.dob}</span></span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span title="المعرّف الرسمي المعتمد (الهوية الوطنية / الإقامة / وثيقة السفر)">
                    المعرّف المعتمد: <span className="font-mono text-slate-200">{patient.nationalId}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 font-mono text-[11px]" title="معرف الزيارة / التنويم السريري الحالي (Encounter)">
                    ENC-{(patient.id.replace('p', '')).padStart(4, '0')}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-teal-400 font-semibold">{patient.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Quick Safety Flags & Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 self-stretch sm:self-auto justify-end">
              {/* Patient Identity Verification Action Pattern */}
              <button
                id="trigger-identity-verification-btn"
                onClick={() => setShowVerificationModal(true)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                  lastVerificationRecord
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500'
                    : 'bg-teal-600 hover:bg-teal-500 text-white border border-teal-500'
                }`}
                title="التحقق الإيجابي من هوية المريض بمعرّفين اثنين قبل أي إجراء سريري"
              >
                {lastVerificationRecord ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    <span>تم التحقق ({lastVerificationRecord.timestamp})</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-3.5 h-3.5 text-teal-200 shrink-0" />
                    <span className="hidden sm:inline">التحقق من الهوية (Verify ID)</span>
                    <span className="sm:hidden">التحقق من الهوية</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowTransitionModal(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="إجراء أو استكمال انتقال سريري وتسليم SBAR بين الأقسام"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">انتقال سريري (Transition)</span>
                <span className="sm:hidden">انتقال سريري</span>
              </button>

              <button
                onClick={() => openLifecycleModal(patient.id)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="عرض دورة ومسار المريض الشاملة"
              >
                <GitFork className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">مسار المريض</span>
              </button>

              <button
                onClick={() => openStandardsModal(patient.id, undefined, 'fhir')}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="تصدير حزمة FHIR R4 للمريض"
              >
                <FileCode className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Context, Location & Care Team Responsive Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2.5 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 leading-tight" title="الموقع السريري الحالي (محدد موقع سريري وليس معرّفاً للمريض)">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Bed className="w-3 h-3 text-teal-400 shrink-0" />
                <span>الموقع السريري (Location Only):</span>
              </div>
              <strong className="text-teal-300 font-bold block mt-0.5 truncate">{careAreaLabel}</strong>
              <span className="text-[11px] text-slate-300 font-mono">{bedRoomLabel}</span>
            </div>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 leading-tight">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-blue-400 shrink-0" />
                <span>الفريق المعالج:</span>
              </div>
              <strong className="text-slate-100 font-bold block mt-0.5 truncate">{attendingDoctor}</strong>
              <span className="text-[11px] text-slate-300 truncate block">{primaryNurse}</span>
            </div>

            {/* Contextual Clinical Indicator: Only shown when critical or in ICU/ER to prevent crowding */}
            {isCriticalVitals && relevantVitals ? (
              <div className="bg-red-950/60 border border-red-700 px-3 py-1.5 rounded-xl leading-tight animate-pulse sm:col-span-2 lg:col-span-1">
                <div className="text-[10px] text-red-300 font-bold flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-red-400 shrink-0" />
                  <span>مؤشر سريري حرج (NEWS2: {news2Score})</span>
                </div>
                <div className="text-xs font-mono font-bold text-red-200 mt-0.5">
                  ضغط: {relevantVitals.bpSystolic}/{relevantVitals.bpDiastolic} • أكسجين: {relevantVitals.spo2}%
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/60 leading-tight hidden lg:block">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>حالة المتابعة السريرية:</span>
                </div>
                <strong className="text-emerald-400 font-bold block mt-0.5">نشطة ومستقرة</strong>
                <span className="text-[11px] text-slate-300">مستوى الخطورة العام: مستقر (Routine)</span>
              </div>
            )}
          </div>
        </div>

        {/* Safety Strip: Allergies (Dedicated View-Model), Isolation, Fall Risk */}
        <div className="bg-slate-950/90 border-t border-slate-800 px-3 sm:px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Dedicated Allergy Status View-Model Indicator */}
            <AllergyStatusIndicator
              allergies={patient.allergies && patient.allergies.length > 0 ? MOCK_DETAILED_ALLERGIES : []}
              allergiesList={patient.allergies}
              onOpenDetailedManagement={() => switchWorkspaceActivity('history_assessment')}
            />

            {/* Isolation Badge */}
            {isolationPrecaution && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-600 text-amber-200 font-bold text-xs animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>{isolationPrecaution}</span>
              </span>
            )}

            {/* Fall Risk Badge */}
            {fallRisk === 'high' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-950/70 border border-orange-700 text-orange-300 font-bold text-[11px]">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <span>خطر سقوط مرتفع (High Fall Risk)</span>
              </span>
            )}

            {/* Resuscitation / Code Status (Item 5: Source-Neutral Provenance) */}
            <button
              type="button"
              onClick={() => setShowCodeStatusModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-mono cursor-pointer transition-colors"
              title="عرض مصدر وموثوقية كود الإنعاش السريري"
            >
              <span>كود الإنعاش:</span>
              <strong className={codeStatusRecord.resuscitationCodeKey === 'DNR' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {codeStatusRecord.resuscitationCodeKey === 'DNR' ? 'DNR' : 'Full Code'}
              </strong>
              <span className="text-[9px] px-1.5 py-0.2 bg-slate-900 text-teal-300 rounded font-sans border border-slate-700">
                {codeStatusRecord.sourceTypeLabelAr.split('(')[0].trim()}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>التأمين الصحي: <strong className="text-slate-200">{patient.insuranceProvider} ({patient.policyNumber})</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">مفعل عبر نفيس NPHIES</span>
          </div>
        </div>
      </div>

      {/* Code Status Provenance Modal (Item 5) */}
      {showCodeStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <h4 className="font-bold text-sm">مصدر وموثوقية كود الإنعاش السريري (Code Status Provenance)</h4>
              </div>
              <button
                onClick={() => setShowCodeStatusModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">حالة الإنعاش المعتمدة:</span>
                  <strong className={`text-sm ${codeStatusRecord.resuscitationCodeKey === 'DNR' ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {codeStatusRecord.resuscitationStatus}
                  </strong>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-200 text-slate-700 font-bold">
                  {codeStatusRecord.resuscitationCodeKey}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">نوع المصدر السريري المعتمد:</span>
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {codeStatusRecord.sourceTypeLabelAr}
                  </span>
                </div>

                {codeStatusRecord.sourceReferenceId && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">المرجع المستندي / رقم الأمر:</span>
                    <span className="font-mono font-bold text-slate-700">{codeStatusRecord.sourceReferenceId}</span>
                  </div>
                )}

                {codeStatusRecord.orderingOrDocumentingClinician && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">الممارس الصحي الموثّق:</span>
                    <span className="font-bold text-slate-800">
                      {codeStatusRecord.orderingOrDocumentingClinician} ({codeStatusRecord.clinicianRole || 'ممارس مصرح'})
                    </span>
                  </div>
                )}

                {codeStatusRecord.documentedAt && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">تاريخ ووقت التوثيق:</span>
                    <span className="font-mono text-slate-600">{codeStatusRecord.documentedAt}</span>
                  </div>
                )}

                {codeStatusRecord.clinicalDiscussionNotes && (
                  <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-[10px] text-blue-900 font-bold block">ملاحظات المناقشة السريرية وخطة الرعاية:</span>
                    <p className="text-slate-700 leading-relaxed">{codeStatusRecord.clinicalDiscussionNotes}</p>
                  </div>
                )}

                {codeStatusRecord.governingPolicyLabel && (
                  <div className="text-[10px] text-slate-500 pt-1">
                    <strong>السياسة الحاكمة:</strong> {codeStatusRecord.governingPolicyLabel}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>نموذج توثيق سريري تجريبي (Mock Operational Provenance)</span>
                  <span>لا يمثل سجلاً قانونياً غير قابل للتعديل</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCodeStatusModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Identity Verification Modal */}
      <PatientIdentityVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        patient={patient}
        actionTitle="التحقق الروتيني الشامل من هوية المريض لملف الرعاية السريرية"
        actionDescription="مطابقة معرّفين اثنين مستقلين للشخص لحماية المريض من الخطأ الطبي"
        staffName={currentStaff.name}
        staffRole={currentStaff.role.toUpperCase()}
        onVerificationSuccess={(record) => {
          setLastVerificationRecord(record);
          setShowVerificationModal(false);
          playChime('success');
        }}
      />

      {/* Care Transition Modal */}
      <CareTransitionModal
        isOpen={showTransitionModal}
        onClose={() => setShowTransitionModal(false)}
        patient={patient}
        currentLocationLabel={`${careAreaLabel} - ${bedRoomLabel}`}
      />
    </>
  );
};
