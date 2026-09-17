import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Check,
  Search,
  ArrowUpRight,
  ShieldCheck,
  History,
  Tag,
  Star,
  Activity,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
  Award,
  Link2,
  GitCommit,
  HelpCircle,
  XCircle,
  Sliders,
  Shield,
  CheckCheck,
  Filter,
  RefreshCw,
  Unlink
} from 'lucide-react';
import { useHis } from '../../../context/HisContext';
import { Patient } from '../../../types/his';
import { ClinicalActionDialog } from '../common/ClinicalActionDialog';
import {
  ProblemListItem,
  EncounterDiagnosisItem,
  DiagnosisRole,
  DiagnosisUse,
  DiagnosisRank,
  DiagnosticVerificationStatus,
  PastMedicalHistoryItem
} from '../../../types/clinicalHistoryProblems';
import {
  MOCK_LONGITUDINAL_PROBLEM_LIST,
  MOCK_ENCOUNTER_DIAGNOSES,
  MOCK_PAST_MEDICAL_HISTORY
} from '../../../data/mockClinicalHistoryProblemsData';

interface ProblemsActivityProps {
  patient: Patient;
}

export const ProblemsActivity: React.FC<ProblemsActivityProps> = ({ patient }) => {
  const { currentStaff, playChime } = useHis();

  // Navigation Tab State
  const [activeMainTab, setActiveMainTab] = useState<'encounter_diagnoses' | 'longitudinal_problems' | 'pmhx_reconciliation'>('encounter_diagnoses');

  // Longitudinal Problem List State (Single Source of Truth)
  const [problemList, setProblemList] = useState<ProblemListItem[]>(MOCK_LONGITUDINAL_PROBLEM_LIST);
  const [problemFilter, setProblemFilter] = useState<'all' | 'active' | 'inactive' | 'resolved'>('active');

  // Encounter Diagnoses State
  const [encounterDiagnoses, setEncounterDiagnoses] = useState<EncounterDiagnosisItem[]>(MOCK_ENCOUNTER_DIAGNOSES);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  // Past Medical History State (Reconciliation with Problem List)
  const [pastMedicalHistory, setPastMedicalHistory] = useState<PastMedicalHistoryItem[]>(MOCK_PAST_MEDICAL_HISTORY);

  // Modals
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [showAddDiagnosisModal, setShowAddDiagnosisModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<ProblemListItem | null>(null);

  // Add Problem Form
  const [probNameAr, setProbNameAr] = useState('');
  const [probNameEn, setProbNameEn] = useState('');
  const [probIcdCode, setProbIcdCode] = useState('I10');
  const [probSnomedCode, setProbSnomedCode] = useState('38341003');
  const [probOnsetDate, setProbOnsetDate] = useState('2024-01-01');
  const [probStatus, setProbStatus] = useState<'active' | 'inactive' | 'resolved'>('active');
  const [probClinicalStatus, setProbClinicalStatus] = useState<'well_controlled' | 'poorly_controlled' | 'in_remission' | 'relapsed' | 'stable'>('well_controlled');

  // Add Encounter Diagnosis Form (with Generic Abstractions)
  const [diagNameAr, setDiagNameAr] = useState('');
  const [diagNameEn, setDiagNameEn] = useState('');
  const [diagIcdCode, setDiagIcdCode] = useState('I21.4');
  const [diagRole, setDiagRole] = useState<DiagnosisRole>('primary');
  const [diagUse, setDiagUse] = useState<DiagnosisUse>('clinical');
  const [diagRank, setDiagRank] = useState<DiagnosisRank>(1);
  const [diagVerificationStatus, setDiagVerificationStatus] = useState<DiagnosticVerificationStatus>('working_provisional');

  // Resolve Notes
  const [resolutionDate, setResolutionDate] = useState(new Date().toISOString().split('T')[0]);
  const [resolutionNote, setResolutionNote] = useState('تحسن تام واستقرار سريري كامل');

  // Controlled Safety Dialog State
  const [safetyDialog, setSafetyDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Filtered Problems
  const filteredProblems = problemList.filter(p => {
    if (problemFilter === 'all') return true;
    return p.status === problemFilter;
  });

  // Filtered Diagnoses
  const filteredDiagnoses = encounterDiagnoses.filter(d => {
    if (roleFilter !== 'all' && d.diagnosisRole !== roleFilter) return false;
    if (verificationFilter !== 'all' && d.diagnosticStage !== verificationFilter) return false;
    return true;
  });

  // Promote Longitudinal Problem to Encounter Diagnosis
  const handlePromoteToEncounter = (problem: ProblemListItem) => {
    const alreadyExists = encounterDiagnoses.some(d => d.linkedProblemId === problem.id);
    if (alreadyExists) {
      setSafetyDialog({
        isOpen: true,
        title: 'تنبيه ازدواجية التشخيص السريري',
        message: `المشكلة السريرية "${problem.clinicalTermAr}" مدرجة بالفعل ضمن تشخيصات الزيارة السريرية الحالية.`
      });
      return;
    }

    const nextRank = encounterDiagnoses.length + 1;
    const newDiagnosis: EncounterDiagnosisItem = {
      id: `ED-${Date.now()}`,
      ranking: 'secondary_additional',
      diagnosticStage: 'confirmed_final',
      clinicalTermAr: problem.clinicalTermAr,
      clinicalTermEn: problem.clinicalTermEn,
      classificationProfile: problem.classificationProfile,
      clinicalTerminology: problem.clinicalTerminology,
      diagnosisRole: 'secondary',
      diagnosisUse: 'clinical',
      diagnosisRank: nextRank,
      encounterRelationship: 'co_existing_managed_condition',
      provenance: {
        diagnosedBy: currentStaff.name,
        diagnosedByRole: currentStaff.role || 'Authorized Clinician',
        department: 'وحدة الرعاية التاجية (CCU)',
        timestamp: 'اليوم (تمت الترقية من السجل التراكمي)'
      },
      linkedProblemId: problem.id
    };

    setEncounterDiagnoses([...encounterDiagnoses, newDiagnosis]);
    playChime('success');
  };

  // Update Verification Status (Working / Provisional -> Confirmed / Differential / Refuted / Suspected)
  const handleUpdateVerificationStatus = (
    diagnosisId: string,
    nextStatus: DiagnosticVerificationStatus
  ) => {
    setEncounterDiagnoses(prev =>
      prev.map(d => (d.id === diagnosisId ? { ...d, diagnosticStage: nextStatus } : d))
    );
    playChime('success');
  };

  // Update Diagnosis Role
  const handleUpdateDiagnosisRole = (diagnosisId: string, nextRole: DiagnosisRole) => {
    setEncounterDiagnoses(prev =>
      prev.map(d => (d.id === diagnosisId ? { ...d, diagnosisRole: nextRole } : d))
    );
    playChime('success');
  };

  // Update Diagnosis Rank
  const handleUpdateDiagnosisRank = (diagnosisId: string, nextRank: DiagnosisRank) => {
    setEncounterDiagnoses(prev =>
      prev.map(d => (d.id === diagnosisId ? { ...d, diagnosisRank: nextRank } : d))
    );
    playChime('success');
  };

  // Link/Unlink Past Medical History Item to Problem List
  const handleTogglePmhxLink = (pmhxId: string, problemId: string) => {
    setPastMedicalHistory(prev =>
      prev.map(item => {
        if (item.id === pmhxId) {
          const isCurrentlyLinked = item.isLinkedToProblemList;
          return {
            ...item,
            isLinkedToProblemList: !isCurrentlyLinked,
            linkedProblemId: !isCurrentlyLinked ? problemId : undefined
          };
        }
        return item;
      })
    );
    playChime('success');
  };

  // Submit Add Problem
  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!probNameAr) return;

    const newProblem: ProblemListItem = {
      id: `PRB-${Date.now()}`,
      clinicalTermAr: probNameAr,
      clinicalTermEn: probNameEn || 'Chronic Medical Condition',
      status: probStatus,
      clinicalStatus: probClinicalStatus,
      verificationStatus: 'confirmed',
      onsetDate: probOnsetDate,
      classificationProfile: {
        profileName: 'ICD-10-AM Classification Profile',
        code: probIcdCode,
        display: probNameAr
      },
      clinicalTerminology: {
        system: 'SNOMED CT',
        conceptId: probSnomedCode,
        preferredTerm: probNameEn || probNameAr
      },
      provenance: {
        recordedBy: currentStaff.name,
        recordedByRole: currentStaff.role || 'Authorized Clinician',
        timestamp: new Date().toISOString().split('T')[0],
        facilityOrClinic: 'مستشفى الشفاء التخصصي'
      },
      auditTrail: [
        {
          timestamp: new Date().toISOString().split('T')[0],
          actionAr: 'تسجيل مبدئي للمشكلة في السجل التراكمي',
          performedBy: currentStaff.name
        }
      ]
    };

    setProblemList([newProblem, ...problemList]);
    setShowAddProblemModal(false);
    setProbNameAr('');
    setProbNameEn('');
    playChime('success');
  };

  // Submit Add Encounter Diagnosis
  const handleSaveDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagNameAr) return;

    const newDiagnosis: EncounterDiagnosisItem = {
      id: `ED-${Date.now()}`,
      ranking: diagRank === 1 || diagRank === 'primary' ? 'principal_primary' : 'secondary_additional',
      diagnosticStage: diagVerificationStatus,
      clinicalTermAr: diagNameAr,
      clinicalTermEn: diagNameEn || 'Clinical Diagnosis',
      classificationProfile: {
        profileName: 'ICD-10-AM Classification Profile',
        code: diagIcdCode,
        display: diagNameAr
      },
      clinicalTerminology: {
        system: 'SNOMED CT',
        conceptId: '38341003',
        preferredTerm: diagNameEn || diagNameAr
      },
      diagnosisRole: diagRole,
      diagnosisUse: diagUse,
      diagnosisRank: diagRank,
      encounterRelationship: diagRank === 1 || diagRank === 'primary' ? 'reason_for_admission' : 'co_existing_managed_condition',
      provenance: {
        diagnosedBy: currentStaff.name,
        diagnosedByRole: currentStaff.role || 'Authorized Clinician',
        department: 'وحدة القلب والقسطرة التداخلية',
        timestamp: 'اليوم'
      }
    };

    setEncounterDiagnoses([newDiagnosis, ...encounterDiagnoses]);
    setShowAddDiagnosisModal(false);
    setDiagNameAr('');
    setDiagNameEn('');
    playChime('success');
  };

  // Submit Resolve Problem
  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResolveModal) return;

    setProblemList(prev =>
      prev.map(p =>
        p.id === showResolveModal.id
          ? {
              ...p,
              status: 'resolved',
              resolvedDate: resolutionDate,
              notes: resolutionNote
            }
          : p
      )
    );
    setShowResolveModal(null);
    playChime('success');
  };

  // Helper Labels
  const getRoleBadge = (role?: DiagnosisRole) => {
    switch (role) {
      case 'principal':
        return { label: 'تشخيص رئيسي (Principal)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'primary':
        return { label: 'تشخيص أولي (Primary)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'secondary':
        return { label: 'تشخيص ثانوي (Secondary)', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'admission':
        return { label: 'تشخيص عند الدخول (Admission)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'discharge':
        return { label: 'تشخيص عند الخروج (Discharge)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'complication':
        return { label: 'مضاعفة سريرية (Complication)', color: 'bg-red-50 text-red-800 border-red-200' };
      case 'co_existing':
        return { label: 'مرض متزامن (Co-existing)', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: role || 'تشخيص سريري', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getVerificationBadge = (stage?: DiagnosticVerificationStatus) => {
    switch (stage) {
      case 'confirmed_final':
        return { label: 'مؤكد نهائي (Confirmed)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'working_provisional':
        return { label: 'عملي مبدئي (Working)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'differential':
        return { label: 'تفريقي (Differential)', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'suspected':
        return { label: 'مشتبه به (Suspected)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'refuted':
        return { label: 'مستبعد سريرياً (Refuted)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: stage || 'قيد التحقق', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* HEADER BANNER: ARCHITECTURAL SEPARATION OF AXIS 4             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm sm:text-base text-slate-900">
                المشكلات والتشخيصات السريرية (Problems & Diagnoses Architecture)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Axis 4 Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              فصل كامل بين السجل التراكمي الممتد عبر الزمن (Longitudinal Problem List) والتشخيصات المحددة للزيارة الحالية (Encounter Diagnoses) مع ربط التاريخ المرضي السابق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowAddProblemModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>إضافة مشكلة للسجل التراكمي</span>
          </button>
          <button
            onClick={() => setShowAddDiagnosisModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تشخيص للزيارة الحالية</span>
          </button>
        </div>
      </div>

      {/* Architectural Guidance Banner */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span>محددات الحوكمة السريرية لمحور المشكلات والتشخيصات:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-teal-800 border border-teal-300">
              Generic Role, Use, Rank & Single Source of Truth
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            • <strong>Encounter Diagnoses:</strong> لا توجد قاعدة تفترض إجبارياً وجود تشخيص رئيسي وحيد عالمياً (Not strictly 'Exactly One Principal Diagnosis'). النظام يدعم أدوارًا مرنة (Diagnosis Role)، تصنيفات استخدام (Diagnosis Use كـ Admitting, Clinical, Discharge, Billing)، ورتبًا تشخيصية (Diagnosis Rank).
            <br />
            • <strong>Verification Status:</strong> حالات (Working / Provisional / Confirmed / Refuted) هي إمكانية تحقق ومطابقة سريرية ديناميكية وليست مسارًا خطيًا إجباريًا وحيدًا.
            <br />
            • <strong>Single Source of Truth:</strong> السجل التراكمي (Longitudinal Problem List) هو المرجع المعتمد للحالات المزمنة والسابقة، والتاريخ المرضي السابق (Past Medical History) يشير إليه مباشرة عبر المعرفات (linkedProblemId) تجنبًا للازدواجية.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN NAVIGATION TABS                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('encounter_diagnoses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === 'encounter_diagnoses' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>تشخيصات الزيارة والتنويم الحالي (Encounter Diagnoses)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {encounterDiagnoses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('longitudinal_problems')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === 'longitudinal_problems' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>السجل التراكمي للمشكلات المزمنة (Longitudinal Problem List)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {problemList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('pmhx_reconciliation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === 'pmhx_reconciliation' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>ربط التاريخ المرضي السابق بالسجل التراكمي (PMHx & Problem Linkage)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {pastMedicalHistory.filter(p => p.isLinkedToProblemList).length}/{pastMedicalHistory.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ENCOUNTER DIAGNOSES (VISIT-BOUND)                      */}
      {/* ------------------------------------------------------------- */}
      {activeMainTab === 'encounter_diagnoses' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                تشخيصات الزيارة والتنويم الحالي (Encounter Diagnoses)
              </h3>
              <p className="text-[11px] text-slate-500">
                تشخيصات محددة بالزيارة الحالية • مصنفة حسب الدور التشخيصي (Role)، الرتبة (Rank)، والاستخدام (Use)
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500">الدور:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 text-[11px] focus:outline-hidden"
                >
                  <option value="all">كافة الأدوار (All Roles)</option>
                  <option value="principal">تشخيص رئيسي (Principal)</option>
                  <option value="primary">تشخيص أولي (Primary)</option>
                  <option value="secondary">تشخيص ثانوي (Secondary)</option>
                  <option value="admission">تشخيص عند الدخول (Admission)</option>
                  <option value="discharge">تشخيص عند الخروج (Discharge)</option>
                  <option value="complication">مضاعفة (Complication)</option>
                  <option value="co_existing">مرض متزامن (Co-existing)</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500">التحقق:</span>
                <select
                  value={verificationFilter}
                  onChange={e => setVerificationFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 text-[11px] focus:outline-hidden"
                >
                  <option value="all">كافة حالات التحقق (All)</option>
                  <option value="confirmed_final">مؤكد نهائي (Confirmed)</option>
                  <option value="working_provisional">عملي مبدئي (Working)</option>
                  <option value="differential">تفريقي (Differential)</option>
                  <option value="suspected">مشتبه به (Suspected)</option>
                  <option value="refuted">مستبعد (Refuted)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diagnoses Cards List */}
          <div className="space-y-3">
            {filteredDiagnoses.map((diag, index) => {
              const roleInfo = getRoleBadge(diag.diagnosisRole);
              const verifInfo = getVerificationBadge(diag.diagnosticStage);
              const isPrimary = diag.diagnosisRank === 1 || diag.diagnosisRank === 'primary' || diag.ranking === 'principal_primary';

              return (
                <div
                  key={diag.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isPrimary
                      ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-400/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Rank Badge */}
                        <span className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                          isPrimary ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          رتبة #{diag.diagnosisRank ?? index + 1}
                        </span>

                        <strong className="text-slate-900 text-sm font-bold">{diag.clinicalTermAr}</strong>
                        <span className="text-slate-500 font-mono text-xs" dir="ltr">({diag.clinicalTermEn})</span>

                        {/* ICD Code */}
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          ICD-10: {diag.classificationProfile.code}
                        </span>

                        {/* Role Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>

                        {/* Verification Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${verifInfo.color}`}>
                          {verifInfo.label}
                        </span>
                      </div>

                      {/* Details row: Diagnosis Use & Origin Link */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>
                          تصنيف الاستخدام: <strong className="text-slate-800 font-semibold">{diag.diagnosisUse || 'clinical_active'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          العلاقة بالتنويم: <strong className="text-slate-800 font-semibold">
                            {diag.encounterRelationship === 'reason_for_admission'
                              ? 'سبب الدخول والتنويم'
                              : diag.encounterRelationship === 'complication_arose_in_stay'
                              ? 'مضاعفة نشأت أثناء الإقامة'
                              : 'حالة متزامنة خضعت للإدارة السريرية'}
                          </strong>
                        </span>

                        {/* Linked Problem Indicator */}
                        {diag.linkedProblemId && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              <span>منبثق من السجل التراكمي ({diag.linkedProblemId})</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Verification Capability Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {/* Verification Status Dropdown */}
                      <div className="relative inline-block text-left">
                        <select
                          value={diag.diagnosticStage || 'working_provisional'}
                          onChange={e => handleUpdateVerificationStatus(diag.id, e.target.value as DiagnosticVerificationStatus)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <option value="working_provisional">تعديل: عملي مبدئي (Working)</option>
                          <option value="confirmed_final">تعديل: مؤكد نهائي (Confirmed)</option>
                          <option value="differential">تعديل: تفريقي (Differential)</option>
                          <option value="suspected">تعديل: مشتبه به (Suspected)</option>
                          <option value="refuted">تعديل: مستبعد (Refuted)</option>
                        </select>
                      </div>

                      {/* Rank Changer */}
                      <button
                        type="button"
                        onClick={() => handleUpdateDiagnosisRank(diag.id, isPrimary ? 2 : 1)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          isPrimary
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="تبديل الرتبة التشخيصية"
                      >
                        <Star className={`w-3 h-3 ${isPrimary ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                        <span>{isPrimary ? 'رئيسي (Rank 1)' : 'تعيين رتبة 1'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>المشخص المعتمد: <strong>{diag.provenance.diagnosedBy}</strong> ({diag.provenance.diagnosedByRole})</span>
                      <span>•</span>
                      <span>{diag.provenance.department}</span>
                    </div>
                    <span className="font-mono">{diag.provenance.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {filteredDiagnoses.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد تشخيصات تطابق الفلتر المحدد.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: LONGITUDINAL PROBLEM LIST (ENDURING)                   */}
      {/* ------------------------------------------------------------- */}
      {activeMainTab === 'longitudinal_problems' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  قائمة المشكلات المزمنة التراكمية (Longitudinal Problem List)
                </h3>
                <span className="text-[11px] text-slate-400">
                  سجل مستمر للمريض عبر كافة الزيارات والتنويمات السابقة والمستقبلية (Enduring Across Encounters) • مصدر الحقيقة الموحد
                </span>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['all', 'active', 'inactive', 'resolved'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setProblemFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    problemFilter === tab ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' && 'الكل (All)'}
                  {tab === 'active' && 'نشط (Active)'}
                  {tab === 'inactive' && 'خامل (Inactive)'}
                  {tab === 'resolved' && 'تم شفاؤه (Resolved)'}
                </button>
              ))}
            </div>
          </div>

          {/* Problem List Items */}
          <div className="divide-y divide-slate-100 text-xs">
            {filteredProblems.map(prob => {
              const isAlreadyInEncounter = encounterDiagnoses.some(d => d.linkedProblemId === prob.id);
              return (
                <div
                  key={prob.id}
                  className="py-4 hover:bg-slate-50/80 transition-colors p-3 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-slate-900 text-sm font-bold">{prob.clinicalTermAr}</strong>
                      <span className="text-slate-500 font-mono text-xs" dir="ltr">({prob.clinicalTermEn})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prob.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : prob.status === 'resolved'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {prob.status === 'active' ? 'نشط (Active)' : prob.status === 'resolved' ? 'تم الشفاء (Resolved)' : 'خامل'}
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {prob.classificationProfile.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                        الحالة: {prob.clinicalStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span>
                        المعرف التراكمي: <strong className="font-mono text-slate-700">{prob.id}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        تاريخ البدء: <strong className="text-slate-800">{prob.onsetDate}</strong>
                      </span>
                      {prob.resolvedDate && (
                        <span className="text-emerald-700 font-bold">
                          تاريخ الشفاء: {prob.resolvedDate}
                        </span>
                      )}
                    </div>

                    {prob.notes && (
                      <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-200">
                        {prob.notes}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>الموثق: <strong>{prob.provenance.recordedBy}</strong> ({prob.provenance.recordedByRole})</span>
                      <span>•</span>
                      <span>{prob.provenance.facilityOrClinic}</span>
                    </div>
                  </div>

                  {/* Actions on Longitudinal Problem */}
                  <div className="flex items-center gap-2 shrink-0">
                    {prob.status === 'active' && !isAlreadyInEncounter && (
                      <button
                        onClick={() => handlePromoteToEncounter(prob)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs transition-colors cursor-pointer"
                        title="ربط المشكلة المزمنة بالزيارة الحالية لتوثيق علاجها أو مضاعفاتها"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>ترقية إلى تشخيص في التنويم الحالي</span>
                      </button>
                    )}

                    {isAlreadyInEncounter && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مدرج بالزيارة الحالية</span>
                      </span>
                    )}

                    {prob.status === 'active' && (
                      <button
                        onClick={() => setShowResolveModal(prob)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        تحديث الحالة / إغلاق
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PMHX & PROBLEM LIST RECONCILIATION                      */}
      {/* ------------------------------------------------------------- */}
      {activeMainTab === 'pmhx_reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  مطابقة التاريخ المرضي السابق وسجل المشكلات (PMHx & Problem List Reconciliation)
                </h3>
                <span className="text-[11px] text-slate-400">
                  تجنب تكرار وازدواجية السجلات السريرية: السجل التراكمي هو مصدر الحقيقة الوحيد (Single Source of Truth)
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              نسبة الربط: {Math.round((pastMedicalHistory.filter(p => p.isLinkedToProblemList).length / pastMedicalHistory.length) * 100)}%
            </span>
          </div>

          <div className="space-y-3">
            {pastMedicalHistory.map(pmhx => {
              const matchedProblem = problemList.find(p => p.id === pmhx.linkedProblemId);
              return (
                <div
                  key={pmhx.id}
                  className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                    pmhx.isLinkedToProblemList
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-amber-300 bg-amber-50/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{pmhx.conditionNameAr}</strong>
                        <span className="text-slate-500 font-mono text-xs" dir="ltr">({pmhx.conditionNameEn})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {matchedProblem ? matchedProblem.classificationProfile.code : 'ICD-10'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          بدء: {pmhx.onsetYear}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        الحالة السريرية في التاريخ المرضي: <strong className="text-slate-800 font-semibold">{pmhx.controlLevel || pmhx.status}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pmhx.isLinkedToProblemList ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>مرتبط بالمشكلة التراكمية ({pmhx.linkedProblemId})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePmhxLink(pmhx.id, '')}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="فك الارتباط للتجربة"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePmhxLink(pmhx.id, 'PRB-101')}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>ربط بالسجل التراكمي الآن</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Matched Longitudinal Problem Card */}
                  {pmhx.isLinkedToProblemList && matchedProblem && (
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-[11px] flex flex-wrap items-center justify-between gap-2 text-slate-600">
                      <div>
                        <span className="text-emerald-800 font-bold">المشكلة المطابقة في السجل التراكمي: </span>
                        <strong>{matchedProblem.clinicalTermAr}</strong> ({matchedProblem.clinicalTermEn}) • الحالة: <strong className="text-slate-900">{matchedProblem.status}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Source of Truth ID: {matchedProblem.id}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD LONGITUDINAL PROBLEM                               */}
      {/* ------------------------------------------------------------- */}
      {showAddProblemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                إضافة مشكلة صحية إلى السجل التراكمي (Add to Longitudinal Problem List)
              </h3>
              <button onClick={() => setShowAddProblemModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المصطلح السريري المفضل (Arabic):</label>
                <input
                  type="text"
                  value={probNameAr}
                  onChange={e => setProbNameAr(e.target.value)}
                  placeholder="مثال: ارتفاع ضغط الدم الشرياني، قصور عضلة القلب الاحتقاني"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المصطلح بالإنجليزية (Preferred English Concept):</label>
                <input
                  type="text"
                  value={probNameEn}
                  onChange={e => setProbNameEn(e.target.value)}
                  placeholder="e.g. Essential (primary) hypertension"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز التصنيف (ICD-10-AM):</label>
                  <input
                    type="text"
                    value={probIcdCode}
                    onChange={e => setProbIcdCode(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">معرف المصطلح (SNOMED CT):</label>
                  <input
                    type="text"
                    value={probSnomedCode}
                    onChange={e => setProbSnomedCode(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ البدء التقريبي:</label>
                  <input
                    type="date"
                    value={probOnsetDate}
                    onChange={e => setProbOnsetDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحالة السريرية:</label>
                  <select
                    value={probStatus}
                    onChange={e => setProbStatus(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="active">نشط ومستمر (Active)</option>
                    <option value="inactive">خامل (Inactive)</option>
                    <option value="resolved">تم الشفاء (Resolved)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProblemModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
                >
                  حفظ في السجل التراكمي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD ENCOUNTER DIAGNOSIS                                */}
      {/* ------------------------------------------------------------- */}
      {showAddDiagnosisModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                إضافة تشخيص للتنويم الحالي (Add Encounter Diagnosis)
              </h3>
              <button onClick={() => setShowAddDiagnosisModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDiagnosis} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم التشخيص السريري بالعربية:</label>
                <input
                  type="text"
                  value={diagNameAr}
                  onChange={e => setDiagNameAr(e.target.value)}
                  placeholder="مثال: جلطة قلبية حادة غير مصحوبة بارتفاع ST"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التشخيص بالإنجليزية:</label>
                <input
                  type="text"
                  value={diagNameEn}
                  onChange={e => setDiagNameEn(e.target.value)}
                  placeholder="e.g. Non-ST elevation myocardial infarction"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الدور التشخيصي (Diagnosis Role):</label>
                  <select
                    value={diagRole}
                    onChange={e => setDiagRole(e.target.value as DiagnosisRole)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="principal">تشخيص رئيسي (Principal)</option>
                    <option value="primary">تشخيص أولي (Primary)</option>
                    <option value="secondary">تشخيص ثانوي (Secondary)</option>
                    <option value="admission">تشخيص عند الدخول (Admission)</option>
                    <option value="discharge">تشخيص عند الخروج (Discharge)</option>
                    <option value="complication">مضاعفة سريرية (Complication)</option>
                    <option value="co_existing">مرض متزامن (Co-existing)</option>
                    <option value="other">آخر (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة التحقق (Verification Status):</label>
                  <select
                    value={diagVerificationStatus}
                    onChange={e => setDiagVerificationStatus(e.target.value as DiagnosticVerificationStatus)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="working_provisional">عملي مبدئي (Working / Provisional)</option>
                    <option value="confirmed_final">مؤكد ونهائي (Confirmed / Final)</option>
                    <option value="differential">تفريقي مقترح (Differential)</option>
                    <option value="suspected">مشتبه به (Suspected)</option>
                    <option value="refuted">مستبعد سريرياً (Refuted)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تصنيف الاستخدام (Diagnosis Use):</label>
                  <select
                    value={diagUse}
                    onChange={e => setDiagUse(e.target.value as DiagnosisUse)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="clinical">سريري نشط (Clinical)</option>
                    <option value="admission">دخول (Admission)</option>
                    <option value="discharge">خروج (Discharge)</option>
                    <option value="billing">فوترة مالية (Billing)</option>
                    <option value="coding">ترميز إحصائي (Coding)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرتبة (Rank):</label>
                  <select
                    value={diagRank}
                    onChange={e => setDiagRank(Number(e.target.value) as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value={1}>رتبة 1 (Primary)</option>
                    <option value={2}>رتبة 2 (Secondary)</option>
                    <option value={3}>رتبة 3 (Tertiary)</option>
                    <option value={4}>رتبة 4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز ICD-10:</label>
                  <input
                    type="text"
                    value={diagIcdCode}
                    onChange={e => setDiagIcdCode(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDiagnosisModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
                >
                  حفظ تشخيص الزيارة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RESOLVE PROBLEM                                        */}
      {/* ------------------------------------------------------------- */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                تحديث حالة المشكلة وإغلاقها كـ تم الشفاء (Resolve Problem)
              </h3>
              <button onClick={() => setShowResolveModal(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="block text-slate-900 font-bold">{showResolveModal.clinicalTermAr}</strong>
                <span className="text-slate-500 font-mono text-[11px]" dir="ltr">({showResolveModal.clinicalTermEn})</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الشفاء أو إغلاق المشكلة:</label>
                <input
                  type="date"
                  value={resolutionDate}
                  onChange={e => setResolutionDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات الإغلاق والشفاء:</label>
                <textarea
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(null)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  تأكيد الشفاء وحفظ التحديث
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Controlled Application Safety Dialog */}
      <ClinicalActionDialog
        isOpen={safetyDialog.isOpen}
        onClose={() => setSafetyDialog(prev => ({ ...prev, isOpen: false }))}
        title={safetyDialog.title}
        message={safetyDialog.message}
        severity="warning"
      />
    </div>
  );
};
