import React, { useState } from 'react';
import {
  HimOpsState,
  CodingCase,
  CodingEntry,
  CodingQuery
} from '../../../types/himOps';
import {
  evaluateCodingReadiness,
  assignCodingEntry,
  createCodingQuery,
  answerCodingQuery,
  executeCodingBillingHandoff,
  reopenCodingCaseForRevision,
  createCodingCorrection
} from '../../../utils/himWorkflowEngine';
import { getPersonaProfile } from '../../../data/mockHimOpsData';
import {
  FileCode,
  Tag,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock,
  Unlock,
  History,
  ArrowRight,
  Plus,
  Send,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Building,
  User,
  ShieldCheck,
  XCircle,
  FileCheck2,
  Receipt
} from 'lucide-react';

interface ClinicalCodingWorkspaceProps {
  state: HimOpsState;
  onUpdateState: (updater: (prev: HimOpsState) => HimOpsState) => void;
}

export const ClinicalCodingWorkspace: React.FC<ClinicalCodingWorkspaceProps> = ({
  state,
  onUpdateState
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    state.codingCases[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'unassigned' | 'in_progress' | 'queried' | 'coded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReasonText, setReopenReasonText] = useState('');
  const [selectedQueryForAnswer, setSelectedQueryForAnswer] = useState<CodingQuery | null>(null);

  // New Code Form
  const [newCodeType, setNewCodeType] = useState<CodingEntry['type']>('principal_diagnosis');
  const [newCodeVal, setNewCodeVal] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newSourceText, setNewSourceText] = useState('');

  // Query Form
  const [queryTopic, setQueryTopic] = useState('');
  const [queryInquiry, setQueryInquiry] = useState('');
  const [clinicianAnswer, setClinicianAnswer] = useState('');

  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const selectedCase = state.codingCases.find(c => c.id === selectedCaseId) || state.codingCases[0];

  const caseQueries = selectedCase
    ? state.codingQueries.filter(q => q.encounterId === selectedCase.encounterId)
    : [];

  const caseDeficiencies = selectedCase
    ? state.deficiencies.filter(d => d.encounterId === selectedCase.encounterId)
    : [];

  const hasBlockingDeficiencies = caseDeficiencies.some(
    d => d.blockingEffect && d.status !== 'resolved'
  );

  const readinessEval = selectedCase
    ? evaluateCodingReadiness(
        selectedCase,
        Boolean(selectedCase.dischargeDate || selectedCase.codingEntries.length > 0),
        hasBlockingDeficiencies
      )
    : null;

  const filteredCases = state.codingCases.filter(c => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.encounterNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : c.codingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action: Add new coding entry
  const handleAddCode = () => {
    if (!selectedCase || !newCodeVal.trim() || !newDescAr.trim()) return;

    const actorProfile = getPersonaProfile(state.activePersona);
    const res = assignCodingEntry(
      selectedCase,
      {
        type: newCodeType,
        code: newCodeVal.trim().toUpperCase(),
        descriptionAr: newDescAr.trim(),
        descriptionEn: newDescEn.trim() || newDescAr.trim(),
        classificationProfileId: selectedCase.classificationProfileId,
        sourceDiagnosisText: newSourceText.trim() || 'توثيق سريري من كشف الطبيب',
        documentedInNoteId: 'DOC-REC-01',
        assignedByCoder: actorProfile.name,
        isReviewed: true
      },
      state.classificationProfiles
    );

    if (res.success && res.updatedCase) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        return {
          ...prev,
          codingCases: prev.codingCases.map(c =>
            c.id === selectedCase.id ? res.updatedCase! : c
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'code_assigned',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'code_assigned',
              targetType: 'coding_case',
              targetId: selectedCase.id,
              descriptionAr: `إدراج رمز ترميز سريري جديد (${newCodeVal}) نوع ${newCodeType}`,
              patientId: selectedCase.patientId,
              mrn: selectedCase.mrn,
              details: `إدراج رمز ترميز سريري جديد (${newCodeVal}) نوع ${newCodeType}`,
              classificationProfileId: selectedCase.classificationProfileId
            },
            ...prev.auditLogs
          ]
        };
      });

      setBannerNotice(`تم إضافة الرمز (${newCodeVal}) إلى ملف ترميز المريض بنجاح`);
      setShowAddCodeModal(false);
      setNewCodeVal('');
      setNewDescAr('');
      setNewDescEn('');
      setNewSourceText('');
      setTimeout(() => setBannerNotice(null), 4500);
    }
  };

  // Action: Create non-leading coding query to clinician
  const handleCreateQuery = () => {
    if (!selectedCase || !queryTopic.trim() || !queryInquiry.trim()) return;

    const actorProfile = getPersonaProfile(state.activePersona);
    const res = createCodingQuery({
      caseId: selectedCase.id,
      encounterId: selectedCase.encounterId,
      patientId: selectedCase.patientId,
      mrn: selectedCase.mrn,
      patientName: selectedCase.patientName,
      topic: 'missing_specificity',
      coderId: actorProfile.id,
      coderName: actorProfile.name,
      targetProviderId: 'PRV-001',
      targetProviderName: selectedCase.attendingPhysician,
      targetProviderDepartment: 'قسم الباطنية والجراحة',
      referencedDocumentId: 'DOC-REC-01',
      referencedDocumentTitle: 'تقرير الحالة والتقييم السريري',
      documentedClinicalSnippet: selectedCase.diagnosisSnippet || 'سجل المريض السريري',
      queryInquiryText: queryInquiry,
      neutralOptionsProvided: [queryTopic, 'موقع تشريحي بديل', 'غير محدد سريرياً']
    });

    if (res.success && res.query) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        return {
          ...prev,
          codingQueries: [res.query!, ...prev.codingQueries],
          codingCases: prev.codingCases.map(c =>
            c.id === selectedCase.id
              ? { ...c, codingStatus: 'queried' as const }
              : c
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'coding_query_issued',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'coding_query_issued',
              targetType: 'coding_query',
              targetId: res.query!.id,
              descriptionAr: `توجيه استفسار سريري محايد للطبيب: ${selectedCase.attendingPhysician} - موضوع: ${queryTopic}`,
              patientId: selectedCase.patientId,
              mrn: selectedCase.mrn,
              details: `توجيه استفسار سريري محايد للطبيب: ${selectedCase.attendingPhysician} - موضوع: ${queryTopic}`,
              classificationProfileId: selectedCase.classificationProfileId
            },
            ...prev.auditLogs
          ]
        };
      });

      setBannerNotice(`تم إرسال الاستفسار السريري المحايد للطبيب (${selectedCase.attendingPhysician}) بنجاح`);
      setShowQueryModal(false);
      setQueryTopic('');
      setQueryInquiry('');
      setTimeout(() => setBannerNotice(null), 4500);
    }
  };

  // Action: Clinician answers query
  const handleAnswerQuery = () => {
    if (!selectedQueryForAnswer || !clinicianAnswer.trim()) return;

    const res = answerCodingQuery(
      selectedQueryForAnswer,
      clinicianAnswer,
      selectedCase.attendingPhysician
    );

    if (res.success && res.updatedQuery) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        const newQueries = prev.codingQueries.map(q =>
          q.id === selectedQueryForAnswer.id ? res.updatedQuery! : q
        );

        // Check if all queries resolved for this case
        const caseRemainingQueries = newQueries.filter(
          q => q.encounterId === selectedQueryForAnswer.encounterId && q.queryStatus !== 'answered'
        );

        const updatedCases = prev.codingCases.map(c =>
          c.encounterId === selectedQueryForAnswer.encounterId
            ? {
                ...c,
                codingStatus: caseRemainingQueries.length === 0 ? ('in_progress' as const) : c.codingStatus
              }
            : c
        );

        return {
          ...prev,
          codingQueries: newQueries,
          codingCases: updatedCases,
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'coding_query_answered',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'coding_query_answered',
              targetType: 'coding_query',
              targetId: selectedQueryForAnswer.id,
              descriptionAr: `توثيق إجابة الطبيب المعالج على الاستفسار السريري: ${selectedQueryForAnswer.topic}`,
              patientId: selectedQueryForAnswer.patientId,
              mrn: selectedQueryForAnswer.mrn,
              details: `توثيق إجابة الطبيب المعالج على الاستفسار السريري: ${selectedQueryForAnswer.topic}`,
              classificationProfileId: 'HIM_QUERY_ENGINE'
            },
            ...prev.auditLogs
          ]
        };
      });

      setBannerNotice('تم توثيق رد الطبيب المعالج والاحتفاظ بكامل نص الاستفسار والإجابة');
      setShowAnswerModal(false);
      setSelectedQueryForAnswer(null);
      setClinicianAnswer('');
      setTimeout(() => setBannerNotice(null), 4500);
    }
  };

  // Action: Execute synthetic coding handoff reference
  const handleBillingHandoff = () => {
    if (!selectedCase) return;

    const res = executeCodingBillingHandoff(selectedCase);

    if (res.success && res.updatedCase) {
      onUpdateState(prev => {
        const prevActor = getPersonaProfile(prev.activePersona);
        return {
          ...prev,
          codingCases: prev.codingCases.map(c =>
            c.id === selectedCase.id ? res.updatedCase! : c
          ),
          auditLogs: [
            {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
              actor: prevActor.name,
              persona: prev.activePersona,
              action: 'billing_handoff_executed',
              actorId: prevActor.id,
              actorName: prevActor.name,
              actorRole: prevActor.roleTitle,
              actionType: 'billing_handoff_executed',
              targetType: 'coding_case',
              targetId: selectedCase.id,
              descriptionAr: `اعتماد حزمة الترميز وتوليد مرجع التسليم الاصطناعي (SYNTHETIC_CODING_HANDOFF_REFERENCE: ${res.updatedCase!.handoffReferenceCode}) — دورة الإيرادات محمية`,
              patientId: selectedCase.patientId,
              mrn: selectedCase.mrn,
              details: `Coding package approved (SYNTHETIC_CODING_HANDOFF_REFERENCE: ${res.updatedCase!.handoffReferenceCode}). No claims submitted; Revenue cycle untouched.`,
              classificationProfileId: selectedCase.classificationProfileId
            },
            ...prev.auditLogs
          ]
        };
      });

      setBannerNotice(`تم اعتماد نسخة الترميز وتوليد المرجع الاصطناعي (SYNTHETIC_CODING_HANDOFF_REFERENCE: ${res.updatedCase.handoffReferenceCode}) — اكتمل الترميز ولم يتم إنشاء مطالبة أو تعديل أرصدة دورة الإيرادات.`);
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  // Action: Controlled reopen for revision
  const handleReopenCase = () => {
    if (!selectedCase || !reopenReasonText.trim()) return;
    const actor = getPersonaProfile(state.activePersona);
    const res = reopenCodingCaseForRevision(selectedCase, reopenReasonText, actor.name);
    if (res.success && res.updatedCase) {
      onUpdateState(prev => ({
        ...prev,
        codingCases: prev.codingCases.map(c => c.id === selectedCase.id ? res.updatedCase! : c),
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
            actor: actor.name,
            persona: prev.activePersona,
            action: 'coding_case_reopened_for_revision',
            targetType: 'coding_case',
            targetId: selectedCase.id,
            descriptionAr: `إعادة فتح الحالة الترميزية للمراجعة والتصحيح: ${reopenReasonText}`,
            patientId: selectedCase.patientId,
            mrn: selectedCase.mrn,
            details: `Reopened coding case: ${reopenReasonText}. Previous version preserved in revisions.`
          },
          ...prev.auditLogs
        ]
      }));
      setShowReopenModal(false);
      setReopenReasonText('');
      setBannerNotice('تمت إعادة فتح الحالة الترميزية للمراجعة بنجاح مع حفظ النسخة السابقة وسجل التعديلات (Coding Revisions).');
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {bannerNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">بانتظار البدء بالترميز</span>
            <FileCode className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {state.codingCases.filter(c => c.codingStatus === 'unassigned').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">حالات جاهزة للفرز</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">قيد الترميز الفعلي</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {state.codingCases.filter(c => c.codingStatus === 'in_progress').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">يعمل عليها المرمز السريري</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-indigo-200 bg-indigo-50/30 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-xs font-bold">استفسارات أطباء نشطة</span>
            <HelpCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {state.codingQueries.filter(q => q.queryStatus !== 'answered').length}
          </div>
          <div className="text-[11px] text-indigo-800 mt-1">استفسارات سريرية غير موجهة</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold">معتمد ومقفل مالياً</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {state.codingCases.filter(c => c.isFinancialLocked).length}
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">تم تسليمه لدورة الإيرادات</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث برقم الملف، الاسم، أو رقم التنويم..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('unassigned')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'unassigned'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              غير معين
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'in_progress'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              قيد الترميز
            </button>
            <button
              onClick={() => setStatusFilter('queried')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'queried'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:text-indigo-800'
              }`}
            >
              بانتظار استفسار الطبيب
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>منظومة الترميز المالي والمطالبات المعتمدة (NPHIES ICD-10-AM / ACHI)</span>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Coding Cases Work Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold">قائمة مهام الترميز السريري ({filteredCases.length})</span>
            <span>اختر حالة لمراجعة وإسناد الرموز</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredCases.map(c => {
              const isSelected = c.id === selectedCase?.id;
              const hasActiveQuery = state.codingQueries.some(
                q => q.encounterId === c.encounterId && q.queryStatus !== 'answered'
              );

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{c.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {c.mrn} • {c.encounterNumber}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isFinancialLocked
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1'
                            : hasActiveQuery
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1'
                            : c.codingStatus === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {c.isFinancialLocked ? (
                          <>
                            <Lock className="w-3 h-3" />
                            مقفل مالياً
                          </>
                        ) : hasActiveQuery ? (
                          <>
                            <HelpCircle className="w-3 h-3" />
                            استفسار معلق
                          </>
                        ) : c.codingStatus === 'in_progress' ? (
                          'قيد الترميز'
                        ) : (
                          'غير معين'
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c.codingEntries.length} رموز مسجلة
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="truncate">المرمز: {c.assignedCoderName || 'غير مسند'}</span>
                    <span className="text-teal-700 font-semibold">{c.classificationProfileId.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Coding Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Header Banner */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedCase.patientName}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                      {selectedCase.mrn}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>التنويم: {selectedCase.encounterNumber}</span>
                    <span>•</span>
                    <span>الطبيب: {selectedCase.attendingPhysician}</span>
                    <span>•</span>
                    <span>ملف التصنيف: {selectedCase.classificationProfileId}</span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2">
                  {!selectedCase.isFinancialLocked ? (
                    <>
                      <button
                        onClick={() => setShowAddCodeModal(true)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة رمز (ICD/ACHI)</span>
                      </button>
                      <button
                        onClick={() => setShowQueryModal(true)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-indigo-200 transition-all"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>استفسار طبيب (Query)</span>
                      </button>
                      <button
                        onClick={handleBillingHandoff}
                        disabled={!readinessEval?.isReadyForHandoff}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                        title={readinessEval?.isReadyForHandoff ? 'تسليم مرجع الترميز الاصطناعي (SYNTHETIC_CODING_HANDOFF_REFERENCE) — لا يولد مطالبة تأمينية' : 'لا يمكن التسليم قبل استيفاء التشخيص الرئيسي والإغلاق السريري'}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>تسليم مرجع اصطناعي (v{selectedCase.codingVersion || 1})</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>نسخة معتمدة v{selectedCase.codingVersion || 1} (SYNTHETIC_CODING_HANDOFF_REFERENCE)</span>
                      </div>
                      <button
                        onClick={() => setShowReopenModal(true)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-300 transition-all shadow-xs"
                        title="إعادة فتح الحالة الترميزية للمراجعة والتصحيح لسبب نظامي معتمد"
                      >
                        <Unlock className="w-3.5 h-3.5 text-amber-600" />
                        <span>إعادة فتح للمراجعة (Reopen)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Readiness Evaluation Alert */}
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                readinessEval?.isReadyForHandoff
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    محرك التحقق من جاهزية الترميز والمطالبات المالية
                  </span>
                  <span className={readinessEval?.isReadyForHandoff ? 'text-emerald-700' : 'text-slate-500'}>
                    {readinessEval?.isReadyForHandoff ? 'جاهز للإقفال المالي' : 'بانتظار استيفاء الضوابط'}
                  </span>
                </div>

                {readinessEval?.blockingReasons && readinessEval.blockingReasons.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {readinessEval.blockingReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-rose-700 text-[11px] bg-rose-50 p-2 rounded-lg border border-rose-200/50">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coding Entries Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    قائمة الرموز التشخيصية والإجرائية المسندة ({selectedCase.codingEntries.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    الرمز الرئيسي يحدد مجموعة التشخيص المالي (DRG/NPHIES)
                  </span>
                </div>

                {selectedCase.codingEntries.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    لم يتم تسجيل أي رموز تشخيصية أو إجرائية بعد
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {selectedCase.codingEntries.map(entry => (
                      <div key={entry.id} className="p-3.5 text-xs bg-white space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-200">
                              {entry.code}
                            </span>
                            <span
                              className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                                entry.type === 'principal_diagnosis'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : entry.type === 'secondary_diagnosis'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {entry.type === 'principal_diagnosis'
                                ? 'تشخيص رئيسي (Principal)'
                                : entry.type === 'secondary_diagnosis'
                                ? 'تشخيص ثانوي (Secondary)'
                                : 'إجراء جراحي/طبي (Procedure)'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono">
                            {entry.assignedAt}
                          </div>
                        </div>

                        <div className="font-bold text-slate-800">{entry.descriptionAr}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{entry.descriptionEn}</div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                          <span className="truncate">المصدر السريري: {entry.sourceDiagnosisText}</span>
                          <span>المرمز: {entry.assignedByCoder}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coding Queries Thread */}
              {caseQueries.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      استفسارات الطبيب المعالج والردود السريرية ({caseQueries.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">سجل استفسارات موثق وتاريخي</span>
                  </div>

                  <div className="space-y-2.5">
                    {caseQueries.map(q => (
                      <div key={q.id} className="p-3.5 bg-indigo-50/40 border border-indigo-200/80 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900">{q.topic}</span>
                          <span
                            className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                              q.queryStatus === 'answered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {q.queryStatus === 'answered' ? 'تمت إجابة الطبيب' : 'بانتظار الرد'}
                          </span>
                        </div>

                        <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-700 block mb-0.5">نص الاستفسار المحايد:</span>
                          {q.queryInquiryText}
                        </div>

                        {q.providerResponseText ? (
                          <div className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">إجابة الطبيب المعالج ({q.respondedAt}):</span>
                            {q.providerResponseText}
                          </div>
                        ) : (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setSelectedQueryForAnswer(q);
                                setShowAnswerModal(true);
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                            >
                              تسجيل إجابة الطبيب السريرية
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coding Revisions History */}
              {selectedCase.codingRevisions && selectedCase.codingRevisions.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-amber-600" />
                      سجل مراجعات وإعادة فتح النسخ السابقة ({selectedCase.codingRevisions.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">حفظ النسخ السابقة ومنع التعديل غير الموثق</span>
                  </div>
                  <div className="space-y-2">
                    {selectedCase.codingRevisions.map((rev, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span>النسخة v{rev.priorCodingVersion} (أعيد فتحها في: {rev.reopenedAt})</span>
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">بواسطة: {rev.reopenedBy}</span>
                        </div>
                        <div className="text-slate-700 text-[11px]">
                          <strong>سبب المراجعة والتصحيح:</strong> {rev.reason}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          الرموز المحفوظة في النسخة السابقة: {rev.priorCodingEntriesSnapshot.length} | المرجع السابق: {rev.priorHandoffReferenceCode || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              اختر حالة من قائمة المهام لمعاينة وإسناد الرموز
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Code */}
      {showAddCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-600" />
                إضافة رمز تشخيصي / إجرائي جديد
              </h3>
              <button onClick={() => setShowAddCodeModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع الرمز السريري:</label>
                <select
                  value={newCodeType}
                  onChange={e => setNewCodeType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="principal_diagnosis">تشخيص رئيسي (Principal Diagnosis)</option>
                  <option value="secondary_diagnosis">تشخيص ثانوي / مرافق (Secondary / Comorbidity)</option>
                  <option value="procedure">إجراء طبي / جراحي (ACHI Procedure)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الرمز (ICD-10-AM / ACHI Code):</label>
                <input
                  type="text"
                  value={newCodeVal}
                  onChange={e => setNewCodeVal(e.target.value)}
                  placeholder="مثال: I21.4 أو E11.9 أو 30443-00"
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الوصف الطبي بالعربية:</label>
                <input
                  type="text"
                  value={newDescAr}
                  onChange={e => setNewDescAr(e.target.value)}
                  placeholder="مثال: احتشاء حاد بعضلة القلب أو داء السكري النوع الثاني..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الوصف الطبي بالإنجليزية (اختياري):</label>
                <input
                  type="text"
                  value={newDescEn}
                  onChange={e => setNewDescEn(e.target.value)}
                  placeholder="e.g. Acute Subendocardial Myocardial Infarction..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المصدر السريري من تقرير الطبيب:</label>
                <input
                  type="text"
                  value={newSourceText}
                  onChange={e => setNewSourceText(e.target.value)}
                  placeholder="مثال: موثق في ملخص الخروج أو ملاحظة الطوارئ ص1..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddCodeModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddCode}
                disabled={!newCodeVal.trim() || !newDescAr.trim()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                تسجيل الرمز في الكشف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Non-Leading Query */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                استفسار سريري محايد (Non-Leading Clinical Query)
              </h3>
              <button onClick={() => setShowQueryModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 leading-relaxed">
              ضابط نزاهة الترميز: يجب أن يكون الاستفسار محايداً ولا يوجه الطبيب نحو تشخيص معين أو يملي رمزاً محدداً، بل يطلب توضيح الالتباس أو تحديد الموقع التشريحي بدقة.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">موضوع الاستفسار:</label>
                <input
                  type="text"
                  value={queryTopic}
                  onChange={e => setQueryTopic(e.target.value)}
                  placeholder="مثال: توضيح نوع أو حدة القصور الكلوي أو الموقع التشريحي..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نص الاستفسار المحايد للطبيب:</label>
                <textarea
                  rows={4}
                  value={queryInquiry}
                  onChange={e => setQueryInquiry(e.target.value)}
                  placeholder="يرجى من سعادة الاستشاري توضيح التشخيص السريري الدقيق بناءً على نتائج التحاليل المرفقة..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowQueryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateQuery}
                disabled={!queryTopic.trim() || !queryInquiry.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                إرسال الاستفسار للطبيب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Clinician Answer Query */}
      {showAnswerModal && selectedQueryForAnswer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                توثيق رد الطبيب المعالج
              </h3>
              <button onClick={() => setShowAnswerModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">موضوع الاستفسار: {selectedQueryForAnswer.topic}</div>
              <div className="text-[11px] text-slate-600">{selectedQueryForAnswer.queryInquiryText}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">إجابة الطبيب السريرية وتوضيحه التشخيصي:</label>
                <textarea
                  rows={4}
                  value={clinicianAnswer}
                  onChange={e => setClinicianAnswer(e.target.value)}
                  placeholder="أدخل نص إفادة الطبيب المعالج لتحديث كشف الرموز..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAnswerModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAnswerQuery}
                disabled={!clinicianAnswer.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                حفظ رد الطبيب واعتماده
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Controlled Reopen for Revision */}
      {showReopenModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Unlock className="w-4 h-4 text-amber-600" />
                إعادة فتح الحالة الترميزية للمراجعة والتصحيح
              </h3>
              <button onClick={() => setShowReopenModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <div className="font-bold">ضابط نزاهة الترميز:</div>
              <div className="text-[11px] leading-relaxed">
                إعادة فتح الحالة لا يحذف النسخة المعتمدة السابقة v{selectedCase.codingVersion || 1}، بل يوثقها في سجل المراجعات (Coding Revisions) وينشئ نسخة جديدة خاضعة للتدقيق.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب ومبرر إعادة فتح الترميز (Reopen Reason):</label>
                <textarea
                  rows={4}
                  value={reopenReasonText}
                  onChange={e => setReopenReasonText(e.target.value)}
                  placeholder="أدخل مبرر التعديل (مثل: استلام ملحق سريري جديد، تصحيح رمز بناءً على مراجعة تدقيقية، إلخ)..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleReopenCase}
                disabled={!reopenReasonText.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs"
              >
                تأكيد إعادة الفتح للمراجعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
