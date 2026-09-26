import React, { useState } from 'react';
import {
  SafetyIncidentCase,
  IncidentType,
  HarmSeverity,
  SeverityAssessmentCode,
  IncidentStatus,
  IncidentCategory,
  QpsPersona,
  QpsActivityLog,
  SentinelWorkflowStatus
} from '../../../types/qualitySafetyOps';
import {
  calculateSacScore,
  transitionIncidentStatus,
  reviewSentinelCriteria,
  prepareSyntheticSpscReportingReference,
  simulateRegulatoryEscalation,
  getSpscPolicyDeadlines
} from '../../../utils/qualitySafetyEngine';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  User,
  MapPin,
  Sparkles,
  GitBranch,
  Layers,
  ChevronLeft,
  X,
  Building,
  Activity,
  ArrowRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { SPSC_SENTINEL_CRITERIA_PROFILE_2025 } from '../../../data/mockQualitySafetyData';

interface Props {
  incidents: SafetyIncidentCase[];
  setIncidents: React.Dispatch<React.SetStateAction<SafetyIncidentCase[]>>;
  activePersona: QpsPersona;
  onAddActivityLog: (log: QpsActivityLog) => void;
}

export const IncidentReportingLearningWorkspace: React.FC<Props> = ({
  incidents,
  setIncidents,
  activePersona,
  onAddActivityLog
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sacFilter, setSacFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [showRcaModal, setShowRcaModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closureNotes, setClosureNotes] = useState('');

  // New report form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('أجنحة التنويم الداخلي');
  const [newDepartment, setNewDepartment] = useState('التنويم الباطني (IPD)');
  const [newCategory, setNewCategory] = useState<IncidentCategory>('medication_error');
  const [newType, setNewType] = useState<IncidentType>('incident');
  const [newHarm, setNewHarm] = useState<HarmSeverity>('minor');
  const [newImmediateAction, setNewImmediateAction] = useState('');
  const [newPatientMrn, setNewPatientMrn] = useState('MRN-88421');
  const [newPatientName, setNewPatientName] = useState('سعود بن فهد الدوسري');

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Filtering
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.patientName && inc.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.patientMrn && inc.patientMrn.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || inc.incidentType === typeFilter;
    const matchesSac = sacFilter === 'all' || inc.sacScore === sacFilter;
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;

    return matchesSearch && matchesType && matchesSac && matchesStatus;
  });

  // SAC badge styles
  const getSacBadge = (sac: SeverityAssessmentCode) => {
    switch (sac) {
      case 'SAC-1':
        return 'bg-red-600 text-white border-red-700 animate-pulse';
      case 'SAC-2':
        return 'bg-amber-600 text-white border-amber-700';
      case 'SAC-3':
        return 'bg-yellow-500 text-slate-900 border-yellow-600 font-bold';
      case 'SAC-4':
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'reported':
        return { label: 'تم الإبلاغ', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'triaged':
        return { label: 'تم الفرز', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'under_investigation':
        return { label: 'قيد التحقيق', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'rca_in_progress':
        return { label: 'تحليل جذري RCA2', color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' };
      case 'capa_pending':
        return { label: 'بانتظار إجراء CAPA', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'effectiveness_review':
        return { label: 'مراجعة الأثر', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'closed':
        return { label: 'مغلق ومكتمل', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  // Status transitions
  const handleTransition = (newStatus: IncidentStatus, notes?: string) => {
    if (!selectedIncident) return;
    const { updatedIncident, activityLog } = transitionIncidentStatus(
      selectedIncident,
      newStatus,
      activePersona,
      notes
    );
    setIncidents(prev => prev.map(i => (i.id === updatedIncident.id ? updatedIncident : i)));
    onAddActivityLog(activityLog);
  };

  // Simulated escalation
  const handleSimulatedEscalation = (recipients: Array<'SPSC' | 'CBAHI_SENTINEL' | 'MOH_GDIPC' | 'INTERNAL_EXECUTIVE'>) => {
    if (!selectedIncident) return;
    const { updatedIncident, activityLog } = simulateRegulatoryEscalation(
      selectedIncident,
      recipients,
      activePersona
    );
    setIncidents(prev => prev.map(i => (i.id === updatedIncident.id ? updatedIncident : i)));
    onAddActivityLog(activityLog);
    setShowEscalateModal(false);
  };

  // Sentinel Review Modal states (SPSC Policy V1 - 2025)
  const [showSentinelReviewModal, setShowSentinelReviewModal] = useState(false);
  const [sentinelCriterionCode, setSentinelCriterionCode] = useState('SEC-04');
  const [sentinelDecision, setSentinelDecision] = useState<SentinelWorkflowStatus>('criteria_met');
  const [sentinelReviewNotes, setSentinelReviewNotes] = useState('');

  // Handle Sentinel Review Submission
  const handleConfirmSentinelReview = () => {
    if (!selectedIncident) return;
    const selectedCrit = sentinelCriterionCode === 'SEC-GENERAL'
      ? SPSC_SENTINEL_CRITERIA_PROFILE_2025.generalDefinitionCriterion
      : SPSC_SENTINEL_CRITERIA_PROFILE_2025.enumeratedCriteria.find(c => c.code === sentinelCriterionCode);

    const criterionTitle = selectedCrit ? selectedCrit.titleAr : sentinelCriterionCode;
    const result = reviewSentinelCriteria(
      selectedIncident,
      activePersona,
      sentinelDecision,
      criterionTitle,
      sentinelReviewNotes,
      sentinelCriterionCode,
      SPSC_SENTINEL_CRITERIA_PROFILE_2025.version
    );
    if (!result.success || !result.updatedIncident) {
      alert(result.error || 'فشل في مراجعة معايير الحدث الجسيم');
      return;
    }
    setIncidents(prev => prev.map(i => i.id === result.updatedIncident!.id ? result.updatedIncident! : i));
    if (result.activityLog) onAddActivityLog(result.activityLog);
    setShowSentinelReviewModal(false);
  };

  // Handle Synthetic SPSC Reporting Reference Preparation
  const handlePrepareSpscReference = () => {
    if (!selectedIncident) return;
    const { updatedIncident, activityLog } = prepareSyntheticSpscReportingReference(selectedIncident, activePersona);
    setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i));
    onAddActivityLog(activityLog);
  };

  // Submit new incident
  const handleCreateNewReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const sac = calculateSacScore(newHarm, newType);
    const isCandidate = newType === 'sentinel_event' || sac === 'SAC-1';

    const newInc: SafetyIncidentCase = {
      id: `inc-${Date.now()}`,
      referenceNumber: `OVR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentType: isCandidate ? 'incident' : newType, // Reporter cannot self-confirm sentinel
      title: newTitle,
      titleAr: newTitle,
      description: newDescription,
      reportedBy: `${activePersona.name} (${activePersona.roleTitleAr})`,
      reporterRole: activePersona.roleTitle,
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      occurredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventDiscoveryDate: new Date().toISOString().split('T')[0],
      location: newLocation,
      department: newDepartment,
      patientId: 'p-new',
      patientMrn: newPatientMrn,
      patientName: newPatientName,
      category: newCategory,
      harmLevel: newHarm,
      sacScore: sac,
      nccMerp: newHarm === 'none' ? 'B' : newHarm === 'minor' ? 'D' : newHarm === 'moderate' ? 'E' : 'G',
      immediateContainment: newImmediateAction || 'تم تطبيق الإجراءات الاحترازية الأولية فور وقوع الحدث.',
      contributingFactors: [],
      rcaRequired: isCandidate,
      sentinelWorkflowStatus: isCandidate ? 'sentinel_candidate' : 'reported_event',
      linkedCapaIds: [],
      status: 'reported'
    };

    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncidentId(newInc.id);

    onAddActivityLog({
      id: `ACT-NEW-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: activePersona.name,
      actorRole: activePersona.roleTitleAr,
      action: `تسجيل بلاغ سلامة جديد: ${newInc.referenceNumber}`,
      domain: 'incident',
      referenceId: newInc.referenceNumber,
      details: `${newInc.title} • تقييم الخطورة: ${newInc.sacScore}`
    });

    setShowNewReportModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewImmediateAction('');
  };

  return (
    <div className="space-y-4">
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">إجمالي البلاغات النشطة</div>
          <div className="text-xl font-black text-slate-800 mt-1">{incidents.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">سجل OVR الموحد</div>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-3 shadow-2xs bg-red-50/20">
          <div className="text-[11px] font-bold text-red-600 flex items-center justify-between">
            <span>أحداث جسيمة (SAC-1)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-black text-red-700 mt-1">
            {incidents.filter(i => i.sacScore === 'SAC-1').length}
          </div>
          <div className="text-[10px] text-red-500 mt-0.5">تحليل جذري RCA إلزامي</div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-3 shadow-2xs bg-amber-50/20">
          <div className="text-[11px] font-bold text-amber-600 flex items-center justify-between">
            <span>قيد التحقيق والتحليل</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 mt-1">
            {incidents.filter(i => i.status === 'under_investigation' || i.status === 'rca_in_progress').length}
          </div>
          <div className="text-[10px] text-amber-500 mt-0.5">جاري استكمال الأسباب</div>
        </div>
        <div className="bg-white rounded-2xl border border-indigo-200 p-3 shadow-2xs bg-indigo-50/20">
          <div className="text-[11px] font-bold text-indigo-600 flex items-center justify-between">
            <span>بانتظار إجراءات CAPA</span>
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-700 mt-1">
            {incidents.filter(i => i.status === 'capa_pending').length}
          </div>
          <div className="text-[10px] text-indigo-500 mt-0.5">خطة التحسين والتصحيح</div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-3 shadow-2xs bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-between">
            <span>بلاغات مكتملة ومغلقة</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {incidents.filter(i => i.status === 'closed').length}
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5">تم توثيق التعلم</div>
        </div>
      </div>

      {/* 2. Main Content Split: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Incident List & Filter */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-3xl border border-slate-200 p-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث برقم البلاغ، العنوان، اسم المريض..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => setShowNewReportModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إبلاغ جديد (OVR)</span>
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px] pb-2 border-b border-slate-100">
              <button
                onClick={() => setSacFilter('all')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  sacFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSacFilter('SAC-1')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  sacFilter === 'SAC-1' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                SAC-1 (جسيم)
              </button>
              <button
                onClick={() => setSacFilter('SAC-2')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  sacFilter === 'SAC-2' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                SAC-2 (مرتفع)
              </button>
              <button
                onClick={() => setSacFilter('SAC-3')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  sacFilter === 'SAC-3' ? 'bg-yellow-500 text-slate-900' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                }`}
              >
                SAC-3 (متوسط)
              </button>
              <button
                onClick={() => setSacFilter('SAC-4')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                  sacFilter === 'SAC-4' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                SAC-4 (منخفض/وشيك)
              </button>
            </div>

            {/* List Items */}
            <div className="space-y-2 mt-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  لا توجد بلاغات مطابقة لمعايير البحث الحالية
                </div>
              ) : (
                filteredIncidents.map(inc => {
                  const isSelected = inc.id === selectedIncident?.id;
                  const statusInfo = getStatusBadge(inc.status);

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getSacBadge(inc.sacScore)}`}>
                            {inc.sacScore}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {inc.referenceNumber}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                        {inc.titleAr || inc.title}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{inc.location}</span>
                        <span>{inc.reportedAt.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Selected Incident Details */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${getSacBadge(selectedIncident.sacScore)}`}>
                      {selectedIncident.sacScore}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 font-mono">
                      {selectedIncident.referenceNumber}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedIncident.status).color}`}>
                      {getStatusBadge(selectedIncident.status).label}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {selectedIncident.titleAr || selectedIncident.title}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Sentinel Criteria Review by Quality Director / Safety Officer */}
                  {(activePersona.roleKey === 'quality_director' || activePersona.roleKey === 'safety_officer') && (
                    <button
                      onClick={() => setShowSentinelReviewModal(true)}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="مراجعة معايير الحدث الجسيم وفق سياسة المركز السعودي لسلامة المرضى 2025"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>مراجعة معايير SPSC</span>
                    </button>
                  )}

                  {selectedIncident.sentinelWorkflowStatus === 'criteria_met' && (
                    <button
                      onClick={handlePrepareSpscReference}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="تجهيز مرجع إبلاغ اصطناعي للمركز السعودي لسلامة المرضى"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>تجهيز مرجع إبلاغ SPSC</span>
                    </button>
                  )}

                  {selectedIncident.status === 'reported' && (
                    <button
                      onClick={() => handleTransition('under_investigation')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      بدء التحقيق السريري
                    </button>
                  )}
                  {selectedIncident.rcaRequired && !selectedIncident.rcaDetails && (
                    <button
                      onClick={() => handleTransition('rca_in_progress')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      تشكيل فريق RCA2
                    </button>
                  )}
                  {selectedIncident.status !== 'closed' && (
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      اعتماد الإغلاق والتعلم
                    </button>
                  )}
                </div>
              </div>

              {/* Just Culture Principles Notice */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-2.5 text-[11px] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Scale className="w-4 h-4 shrink-0" />
                  <span>مبادئ ثقافة الإنصاف والاستجابة العادلة (Just Culture / Fair Response):</span>
                </div>
                <span className="text-slate-300">
                  التركيز على مسببات النظام والتعلم المستمر والمساءلة المهنية الموضوعية ودعم الكادر الصحي دون أي إجراءات عقابية تلقائية.
                </span>
              </div>

              {/* SPSC Policy 2025 Deadlines Card (if sentinel event or candidate) */}
              {(selectedIncident.sentinelWorkflowStatus === 'criteria_met' || selectedIncident.sentinelWorkflowStatus === 'sentinel_candidate' || selectedIncident.sacScore === 'SAC-1') && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-purple-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>المحددات الزمنية لسياسة الأحداث الجسيمة SPSC (نسخة v2.0 - سارية من 1 يناير 2025):</span>
                    </div>
                    <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                      الحالة: {selectedIncident.sentinelWorkflowStatus === 'criteria_met' ? 'معايير مستوفاة ومؤكدة' : 'مرشح قيد مراجعة المعايير'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-white border border-purple-200">
                      <div className="text-slate-400 font-bold">1. الإبلاغ الداخلي:</div>
                      <div className="font-bold text-emerald-700 mt-0.5">فوري عبر OVR</div>
                      <div className="text-slate-400">تاريخ الاكتشاف: {selectedIncident.eventDiscoveryDate}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-purple-200">
                      <div className="text-slate-400 font-bold">2. إشعار الرئيس التنفيذي:</div>
                      <div className="font-bold text-purple-900 mt-0.5 font-mono">خلال 24 ساعة</div>
                      <div className="text-slate-400">إشعار داخلي إداري</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-purple-200">
                      <div className="text-slate-400 font-bold">3. تقرير منصة SPSC:</div>
                      <div className="font-bold text-amber-700 mt-0.5 font-mono">خلال 48 ساعة</div>
                      <div className="text-slate-400">من تاريخ اكتشاف الحدث</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-purple-200">
                      <div className="text-slate-400 font-bold">4. تقرير RCA + CAP:</div>
                      <div className="font-bold text-rose-700 mt-0.5 font-mono">خلال 30 يوم عمل</div>
                      <div className="text-slate-400">التحليل الجذري وخطة العمل</div>
                    </div>
                  </div>

                  {selectedIncident.syntheticReportingReference && (
                    <div className="bg-white p-2 rounded-xl border border-purple-200 text-[11px] text-purple-950 font-mono">
                      {selectedIncident.syntheticReportingReference.noticeText}
                    </div>
                  )}
                </div>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">الموقع والوحدة:</div>
                  <div className="font-semibold text-slate-800">{selectedIncident.location}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">المريض المرتبط:</div>
                  <div className="font-semibold text-slate-800">
                    {selectedIncident.patientName ? `${selectedIncident.patientName} (${selectedIncident.patientMrn})` : 'بلاغ بيئي عام'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">مستوى الضرر الفعلي:</div>
                  <div className="font-semibold text-slate-800">
                    {selectedIncident.harmLevel === 'death'
                      ? 'وفاة (كارثي)'
                      : selectedIncident.harmLevel === 'severe'
                      ? 'ضرر دائم جسيم'
                      : selectedIncident.harmLevel === 'moderate'
                      ? 'ضرر متوسط مؤقت'
                      : selectedIncident.harmLevel === 'minor'
                      ? 'ضرر بسيط عابر'
                      : 'لا يوجد ضرر (خطأ وشيك)'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">المبلّغ:</div>
                  <div className="font-semibold text-slate-800">{selectedIncident.reportedBy}</div>
                </div>
              </div>

              {/* Immediate Containment Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>إجراءات الاحتواء الفوري المتخذة (Immediate Containment):</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  {selectedIncident.immediateContainment}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-600">وصف الواقعة وتفاصيل الحدث:</div>
                <div className="text-xs text-slate-700 bg-slate-50/60 p-3 rounded-2xl border border-slate-200 leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              {/* Contributing Factors (London Protocol) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>العوامل المساهمة (بروتوكول لندن للتحليل المنهجي):</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedIncident.contributingFactors.length} عوامل موثقة
                  </span>
                </div>

                {selectedIncident.contributingFactors.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                    جاري توثيق العوامل المساهمة من قبل فريق التحقيق
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedIncident.contributingFactors.map(cf => (
                      <div key={cf.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center justify-between text-[10px] font-bold text-teal-700 mb-1">
                          <span>
                            {cf.category === 'task_technology'
                              ? 'المهام والتكنولوجيا'
                              : cf.category === 'work_environment'
                              ? 'بيئة العمل والضغط'
                              : cf.category === 'individual_staff'
                              ? 'العوامل الفردية'
                              : cf.category === 'team_factors'
                              ? 'التواصل بين الفريق'
                              : cf.category === 'organizational_management'
                              ? 'الإدارة والتنظيم'
                              : 'عوامل المريض'}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded ${cf.impactWeight === 'primary' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                            {cf.impactWeight === 'primary' ? 'عامل أولي' : 'عامل ثانوي'}
                          </span>
                        </div>
                        <div className="text-slate-800 text-[11px] leading-snug">{cf.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RCA Details Preview if available */}
              {selectedIncident.rcaDetails && (
                <div className="border border-purple-200 bg-purple-50/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>تقرير التحليل الجذري المعتمد (RCA2 Investigation): {selectedIncident.rcaDetails.rcaId}</span>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                      قائد الفريق: {selectedIncident.rcaDetails.teamLeader}
                    </span>
                  </div>

                  <p className="text-xs text-purple-950 font-medium">
                    {selectedIncident.rcaDetails.problemStatement}
                  </p>

                  {/* 5-Whys summary */}
                  <div className="bg-white rounded-xl p-2.5 border border-purple-200/80 space-y-1 text-xs">
                    <div className="font-bold text-[11px] text-slate-700">سلسلة الأسئلة الخمسة (5-Whys):</div>
                    {selectedIncident.rcaDetails.fiveWhys.slice(0, 3).map(w => (
                      <div key={w.level} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <span className="font-bold text-purple-700 font-mono shrink-0">L{w.level}:</span>
                        <span>{w.answer}</span>
                      </div>
                    ))}
                  </div>

                  {/* Root causes */}
                  <div className="text-xs font-bold text-slate-800 pt-1">
                    الأسباب الجذرية المستخلصة:
                    <ul className="list-disc list-inside font-normal text-slate-700 text-[11px] mt-1 space-y-0.5">
                      {selectedIncident.rcaDetails.rootCauses.map((rc, idx) => (
                        <li key={idx}>{rc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Regulatory Escalation Status */}
              {selectedIncident.regulatoryEscalationSimulated.isEscalated && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-700" />
                    <span>محاكاة الإشعار الرقابي والتصعيدي (Simulated Preview):</span>
                  </div>
                  <div className="text-amber-800 text-[11px]">
                    {selectedIncident.regulatoryEscalationSimulated.noticeText}
                  </div>
                  <div className="text-[10px] text-amber-700/80 font-mono">
                    التوقيت: {selectedIncident.regulatoryEscalationSimulated.escalationTimestamp} • القنوات: {selectedIncident.regulatoryEscalationSimulated.escalatedTo.join(', ')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              يرجى اختيار بلاغ من القائمة للاطلاع على تفاصيل التحليل
            </div>
          )}
        </div>
      </div>

      {/* 3. Modal: New Incident Form */}
      {showNewReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-5 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <Plus className="w-4 h-4 text-teal-600" />
                <span>تسجيل بلاغ سلامة جديد (OVR Incident Report)</span>
              </div>
              <button
                onClick={() => setShowNewReportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewReport} className="space-y-3.5 mt-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان البلاغ الموجز:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خطأ في جرعة الأنسولين أو عدم تطابق عد الإبر الجراحية..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع البلاغ:</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as IncidentType)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="incident">حادث عارض (Adverse Event)</option>
                    <option value="near_miss">خطأ وشيك تم تداركه (Near Miss)</option>
                    <option value="unsafe_condition">ظرف أو بيئة غير آمنة (Hazard)</option>
                    <option value="sentinel_event">حدث جسيم (Sentinel Event)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مستوى الضرر الملاحظ:</label>
                  <select
                    value={newHarm}
                    onChange={e => setNewHarm(e.target.value as HarmSeverity)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="none">لا يوجد ضرر (None)</option>
                    <option value="minor">ضرر بسيط عابر (Minor)</option>
                    <option value="moderate">ضرر متوسط يستلزم علاجا (Moderate)</option>
                    <option value="severe">ضرر دائم جسيم (Severe)</option>
                    <option value="death">وفاة (Death)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic SAC Preview Banner */}
              <div className="bg-slate-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">تقييم مصفوفة SAC التلقائي:</span>
                <span className={`px-2.5 py-0.5 rounded-md font-black text-xs border ${getSacBadge(calculateSacScore(newHarm, newType))}`}>
                  {calculateSacScore(newHarm, newType)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">موقع الواقعة:</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تصنيف الحدث:</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as IncidentCategory)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="medication_error">أخطاء دوائية وعلاجية</option>
                    <option value="patient_fall">سقوط المرضى</option>
                    <option value="surgical_procedural">جراحة وإجراءات تداخلية</option>
                    <option value="clinical_delayed_diagnosis">تأخر تشخيص أو نتائج حرجة</option>
                    <option value="equipment_device">أجهزة ومعدات طبية</option>
                    <option value="blood_transfusion">نقل الدم ومكوناته</option>
                    <option value="hai_infection">مكافحة العدوى وخمج المستشفيات</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الملف الطبي MRN (اختياري):</label>
                  <input
                    type="text"
                    value={newPatientMrn}
                    onChange={e => setNewPatientMrn(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم المريض:</label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={e => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شرح وتفاصيل الواقعة:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="صف ما حدث بدقة وتسلسل زمني..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الإجراءات الاحترازية الفورية المتخذة:</label>
                <input
                  type="text"
                  placeholder="مثال: إيقاف الدواء فوراً، فحص العلامات، كمادات باردة..."
                  value={newImmediateAction}
                  onChange={e => setNewImmediateAction(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ وتسجيل البلاغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Simulated Escalation */}
      {showEscalateModal && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 shadow-2xl text-right">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>إشعار المدير التنفيذي وتجهيز مرجع SPSC (سياسة 2025)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              وفق سياسة المركز السعودي لسلامة المرضى (SPSC) للتبليغ عن الأحداث الجسيمة (المحدثة والنافذة من 1 يناير 2025م):
            </p>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 text-[11px] text-indigo-950 space-y-1.5 mb-3 leading-relaxed">
              <div className="flex items-center justify-between">
                <span className="font-bold">• إشعار المدير التنفيذي / المفوّض:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-indigo-200 font-bold text-indigo-800">خلال 24 ساعة داخلياً</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">• منصة SPSC الإلكترونية:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-indigo-200 font-bold text-amber-800">خلال 48 ساعة من الاكتشاف</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">• تقرير RCA2 وخطة CAP:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-indigo-200 font-bold text-rose-800">خلال 30 يوم عمل</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1.5 border-t border-indigo-100">
                تنبيه نظامي: مهلة الـ 24 ساعة مخصصة لإشعار الإدارة التنفيذية للمنشأة، وليست موعداً للإرسال الخارجي. هذا الإجراء اصطناعي للمعاينة والتوثيق الداخلي دون أي إرسال خارجي فعلي.
              </div>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-indigo-600" />
                <span className="font-bold text-slate-800">إشعار المدير التنفيذي واللجنة الطبية العليا (خلال 24 ساعة)</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-indigo-600" />
                <span className="font-bold text-slate-800">تجهيز ملف البلاغ لمنصة SPSC (المهلة: خلال 48 ساعة من تاريخ الاكتشاف)</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-indigo-600" />
                <span className="font-bold text-slate-800">تكليف فريق التحليل الجذري RCA2 وخطة CAP (المهلة: 30 يوم عمل)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleSimulatedEscalation(['INTERNAL_EXECUTIVE', 'SPSC', 'CBAHI_SENTINEL'])}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                تجهيز مرجع الإشعار الداخلي والمحاكاة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4b. Modal: SPSC Sentinel Criteria Review (Quality Director / Safety Officer only) */}
      {showSentinelReviewModal && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-5 shadow-2xl text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-sm mb-1 pb-2 border-b border-slate-100">
              <Scale className="w-4 h-4 text-purple-700" />
              <span>مراجعة معايير الحدث الجسيم (SPSC Sentinel Policy V1 - 2025)</span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              مراجعة رسمية للبلاغ رقم <span className="font-mono font-bold">{selectedIncident.referenceNumber}</span> لتحديد انطباق معايير الحدث الجسيم وفق سياسة المركز السعودي لسلامة المرضى المحدثة (27 فئة محددة أو معيار التعريف العام).
            </p>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">المعيار المطبق من سياسة SPSC:</label>
                <select
                  value={sentinelCriterionCode}
                  onChange={e => setSentinelCriterionCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                >
                  <optgroup label="معيار التعريف العام (General Definition Criterion)">
                    <option value="SEC-GENERAL">
                      {SPSC_SENTINEL_CRITERIA_PROFILE_2025.generalDefinitionCriterion.titleAr}
                    </option>
                  </optgroup>
                  <optgroup label="الفئات المحددة بالقائمة (27 فئة معتمدة في السياسة)">
                    {SPSC_SENTINEL_CRITERIA_PROFILE_2025.enumeratedCriteria.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.titleAr}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">قرار مراجعة المعايير:</label>
                <select
                  value={sentinelDecision}
                  onChange={e => setSentinelDecision(e.target.value as SentinelWorkflowStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                >
                  <option value="criteria_met">استيفاء المعايير - تأكيد الحدث الجسيم (Criteria Met - Confirmed Sentinel)</option>
                  <option value="criteria_not_met">عدم استيفاء المعايير (Criteria Not Met - Standard Adverse Event)</option>
                  <option value="criteria_review_pending">قيد استكمال مراجعة المعايير (Review Pending)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">مبررات القرار وملاحظات المراجعة:</label>
                <textarea
                  rows={3}
                  placeholder="توثيق حيثيات انطباق أو عدم انطباق المعيار بناءً على الوقائع السريرية..."
                  value={sentinelReviewNotes}
                  onChange={e => setSentinelReviewNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 leading-relaxed">
                <strong>المراجع:</strong> {activePersona.name} ({activePersona.roleTitleAr}) • السياسة: SPSC Sentinel Policy V1 (Effective 1 Jan 2025)
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSentinelReviewModal(false)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmSentinelReview}
                className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                اعتماد نتيجة مراجعة المعايير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Close Incident */}
      {showCloseModal && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 shadow-2xl text-right">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>اعتماد إغلاق البلاغ وتوثيق الدروس المستفادة</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              سيتم إغلاق البلاغ رقم <span className="font-mono font-bold">{selectedIncident.referenceNumber}</span> وتوثيق اسم المعتمد وتاريخ الإغلاق.
            </p>

            <div className="mb-3">
              <label className="font-bold text-slate-700 block mb-1 text-xs">الدروس المستفادة وخلاصة التحسين:</label>
              <textarea
                rows={3}
                placeholder="اكتب خلاصة الإجراءات والضوابط التي تم تفعيلها لمنع تكرار الحدث..."
                value={closureNotes}
                onChange={e => setClosureNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  handleTransition('closed', closureNotes);
                  setShowCloseModal(false);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                تأكيد الإغلاق النهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
