import React, { useState } from 'react';
import {
  HimOpsState,
  MedicalRecordCase,
  DocumentationDeficiency
} from '../../../types/himOps';
import {
  evaluateRecordCompletion,
  resolveDeficiency
} from '../../../utils/himWorkflowEngine';
import { getPersonaProfile } from '../../../data/mockHimOpsData';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  UserCheck,
  Search,
  Check,
  Calendar,
  Building,
  User,
  ShieldAlert,
  ChevronLeft,
  XCircle,
  FileCheck
} from 'lucide-react';

interface RecordCompletionWorkspaceProps {
  state: HimOpsState;
  onUpdateState: (updater: (prev: HimOpsState) => HimOpsState) => void;
}

export const RecordCompletionWorkspace: React.FC<RecordCompletionWorkspaceProps> = ({
  state,
  onUpdateState
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    state.recordCases[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'incomplete' | 'delinquent' | 'completed'>('all');
  const [careSettingFilter, setCareSettingFilter] = useState<'all' | 'ipd' | 'er' | 'opd' | 'day_surgery'>('all');
  const [notificationSuccessMsg, setNotificationSuccessMsg] = useState<string | null>(null);

  const selectedCase = state.recordCases.find(c => c.id === selectedCaseId) || state.recordCases[0];

  const caseDeficiencies = selectedCase
    ? state.deficiencies.filter(d => d.encounterId === selectedCase.encounterId)
    : [];

  const completionEvaluation = selectedCase
    ? evaluateRecordCompletion(selectedCase, caseDeficiencies)
    : null;

  // Filtered cases
  const filteredCases = state.recordCases.filter(c => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.encounterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.attendingPhysician.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? c.completionStatus === 'complete'
        : statusFilter === 'delinquent'
        ? c.completionStatus === 'delinquent' || c.completionStatus === 'severely_delinquent'
        : c.completionStatus === 'incomplete' || c.completionStatus === 'in_progress';

    const matchesCareSetting =
      careSettingFilter === 'all' ? true : c.careSetting === careSettingFilter;

    return matchesSearch && matchesStatus && matchesCareSetting;
  });

  // Action: Resolve deficiency
  const handleResolveDeficiency = (deficiencyId: string) => {
    onUpdateState(prev => {
      const def = prev.deficiencies.find(d => d.id === deficiencyId);
      if (!def) return prev;

      const actorProfile = getPersonaProfile(prev.activePersona);
      const res = resolveDeficiency(
        def,
        actorProfile.name,
        'استيفاء الوثيقة المطلوبة واعتمادها رقمياً في ملف المريض'
      );

      if (!res.success || !res.updatedDeficiency) return prev;

      const newDeficiencies = prev.deficiencies.map(d =>
        d.id === deficiencyId ? res.updatedDeficiency! : d
      );

      // Re-evaluate case completion
      const currentCase = prev.recordCases.find(c => c.encounterId === def.encounterId);
      let newRecordCases = prev.recordCases;
      if (currentCase) {
        const remainingCaseDefs = newDeficiencies.filter(d => d.encounterId === def.encounterId);
        const evalResult = evaluateRecordCompletion(currentCase, remainingCaseDefs);
        newRecordCases = prev.recordCases.map(c =>
          c.id === currentCase.id
            ? {
                ...c,
                completionStatus: evalResult.isComplete ? 'complete' : c.completionStatus,
                isCompleted: evalResult.isComplete,
                completedAt: evalResult.isComplete ? new Date().toISOString().substring(0, 16) : undefined,
                completedBy: evalResult.isComplete ? actorProfile.name : undefined
              }
            : c
        );
      }

      return {
        ...prev,
        deficiencies: newDeficiencies,
        recordCases: newRecordCases,
        auditLogs: [
          {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().substring(0, 19).replace('T', ' '),
            actor: actorProfile.name,
            persona: prev.activePersona,
            action: 'deficiency_resolved',
            actorId: actorProfile.id,
            actorName: actorProfile.name,
            actorRole: actorProfile.roleTitle,
            actionType: 'deficiency_resolved',
            targetType: 'deficiency',
            targetId: deficiencyId,
            descriptionAr: `تم استيفاء النقص التوثيقي: ${def.type} للطبيب ${def.assignedClinicianName}`,
            patientId: def.patientId,
            mrn: def.mrn,
            details: `تم استيفاء النقص التوثيقي: ${def.type} للطبيب ${def.assignedClinicianName}`,
            classificationProfileId: 'HIM_COMPLETION_ENGINE'
          },
          ...prev.auditLogs
        ]
      };
    });
  };

  // Action: Send deficiency reminder to clinician (Simulate Reminder / Synthetic Notification Record)
  const handleSendReminder = (clinicianName: string, docType: string) => {
    setNotificationSuccessMsg(`[سجل إشعار اصطناعي — Synthetic Notification Record] تم تسجيل محاكاة تذكير توثيقي للطبيب (${clinicianName}) لاستكمال (${docType}) دون إرسال اتصالات خارجية حقيقية.`);
    setTimeout(() => {
      setNotificationSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Notification Banner */}
      {notificationSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notificationSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">إجمالي الحالات المفتوحة</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{state.recordCases.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">حالات تحت المتابعة التوثيقية</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">ضمن الهدف الداخلي (&lt;14 يوم)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {state.recordCases.filter(c => c.completionStatus === 'incomplete' || c.completionStatus === 'in_progress').length}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">ضمن الهدف المحلي التوضيحي (ILLUSTRATIVE_LOCAL_POLICY)</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold">تجاوز الهدف الداخلي (&gt;14 يوم)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {state.recordCases.filter(c => c.completionStatus === 'delinquent').length}
          </div>
          <div className="text-[11px] text-amber-800 mt-1">مجاوزة الهدف المحلي — لا تزال ضمن الحد النظامي العام</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-50/30 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold">تجاوز حد سباهي (&gt;30 يوم)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {state.recordCases.filter(c => c.completionStatus === 'severely_delinquent').length}
          </div>
          <div className="text-[11px] text-rose-800 mt-1">تجاوزت الحد النظامي لسباهي (CBAHI 30-Day Boundary)</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold">ملفات مستوفاة ومغلقة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {state.recordCases.filter(c => c.completionStatus === 'complete' || c.completionStatus === 'record_complete').length}
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">جاهزة للأرشفة والترميز النهائي</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث برقم الملف، الاسم، أو رقم التنويم..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status filter */}
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
              onClick={() => setStatusFilter('incomplete')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'incomplete'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              غير مكتمل
            </button>
            <button
              onClick={() => setStatusFilter('delinquent')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'delinquent'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              متأخر (Delinquent)
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              مكتمل
            </button>
          </div>
        </div>

        {/* Care setting filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">القسم:</span>
          <select
            value={careSettingFilter}
            onChange={e => setCareSettingFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">جميع أقسام التنويم والرعاية</option>
            <option value="ipd">أجنحة التنويم (Inpatient)</option>
            <option value="er">قسم الطوارئ (Emergency)</option>
            <option value="day_surgery">جراحة اليوم الواحد (Day Surgery)</option>
            <option value="opd">العيادات الخارجية (Ambulatory)</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Cases List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold">قائمة سجلات التنويم والمراجعات ({filteredCases.length})</span>
            <span>انقر على السجل لمعاينة التدقيق</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredCases.map(c => {
              const isSelected = c.id === selectedCase?.id;
              const defCount = state.deficiencies.filter(
                d => d.encounterId === c.encounterId && d.status !== 'resolved'
              ).length;

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
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.completionStatus === 'complete'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : c.completionStatus === 'severely_delinquent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : c.completionStatus === 'delinquent'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {c.completionStatus === 'complete'
                        ? 'مكتمل ومغلق'
                        : c.completionStatus === 'severely_delinquent'
                        ? `تأخير حرج (${c.daysSinceDischarge} يوم)`
                        : c.completionStatus === 'delinquent'
                        ? `متأخر (${c.daysSinceDischarge} يوم)`
                        : 'قيد الاستيفاء'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.careSetting === 'ipd' ? 'تنويم باطني/جراحي' : c.careSetting === 'er' ? 'طوارئ' : 'جراحة اليوم الواحد'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.attendingPhysician}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>خروج: {c.dischargeDate || 'مستمر بالقسم'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {defCount > 0 ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {defCount} نواقص مطلوبة
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          مستوفى بالكامل
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Case Completion Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Header Profile */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedCase.patientName}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                      {selectedCase.mrn}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>رقم التنويم: {selectedCase.encounterNumber}</span>
                    <span>•</span>
                    <span>الطبيب المعالج: {selectedCase.attendingPhysician}</span>
                    <span>•</span>
                    <span>تاريخ الدخول: {selectedCase.admissionDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCase.completionStatus === 'complete' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      سجل مستوفى ومعتمد
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-600" />
                      بانتظار استكمال الوثائق ({caseDeficiencies.filter(d => d.status !== 'resolved').length} متبقي)
                    </span>
                  )}
                </div>
              </div>

              {/* Completion Rules Evaluator Box */}
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                completionEvaluation?.isComplete
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-slate-900">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    محرك التحقق من اكتمال السجل (CBAHI HIM Completion Engine)
                  </span>
                  <span className={completionEvaluation?.isComplete ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {completionEvaluation?.isComplete
                      ? 'مستوفى 100% — السجل مؤهل للإغلاق'
                      : `غير مستوفى — ${completionEvaluation?.unresolvedDeficiencies.length} أسباب مانعة`}
                  </span>
                </div>

                {completionEvaluation?.blockingReasons && completionEvaluation.blockingReasons.length > 0 ? (
                  <div className="space-y-1.5">
                    {completionEvaluation.blockingReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-rose-700 text-[11px] bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200/60">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-emerald-700 text-xs flex items-center gap-2 bg-emerald-100/50 p-2.5 rounded-lg font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    جميع متطلبات التوثيق السريري (ملخص الخروج، التقرير الجراحي، والتواقيع المعتمدة) مكتملة وموثقة إلكترونياً.
                  </div>
                )}
              </div>

              {/* Documentation Deficiencies Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    النواقص التوثيقية والمهام المطلوبة من الأطباء ({caseDeficiencies.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">تحديث دوري ومتابعة فورية</span>
                </div>

                {caseDeficiencies.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    لا توجد أي نواقص مسجلة على هذا السجل الطبي
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {caseDeficiencies.map(def => {
                      const isResolved = def.status === 'resolved';

                      return (
                        <div
                          key={def.id}
                          className={`p-3.5 text-xs flex flex-wrap items-center justify-between gap-3 ${
                            isResolved ? 'bg-slate-50/50 opacity-70' : 'bg-white'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{def.documentTypeTitle}</span>
                              <span
                                className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                                  def.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : def.status === 'delinquent' || def.status === 'severely_delinquent'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {def.status === 'resolved'
                                  ? 'تم الاستيفاء'
                                  : def.status === 'severely_delinquent'
                                  ? 'تأخير حرج (>30 يوم)'
                                  : def.status === 'delinquent'
                                  ? 'متأخر (>14 يوم)'
                                  : 'مفتوح'}
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-2">
                              <span>المكلف: {def.assignedClinicianName} ({def.assignedClinicianRole})</span>
                              <span>•</span>
                              <span>المهلة النظامية: {def.deadlineDate}</span>
                            </div>
                            {def.deficiencyNotes && (
                              <div className="text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded-md">
                                {def.deficiencyNotes}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {!isResolved && (
                              <>
                                <button
                                  onClick={() => handleSendReminder(def.assignedClinicianName, def.documentTypeTitle)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  title="تسجيل محاكاة إشعار توثيقي اصطناعي (Simulate Reminder - لا يرسل اتصالات فعلية)"
                                >
                                  <Send className="w-3.5 h-3.5 text-slate-600" />
                                  <span>محاكاة تذكير</span>
                                </button>
                                <button
                                  onClick={() => handleResolveDeficiency(def.id)}
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                                  title="تأكيد استيفاء الوثيقة وتوقيعها"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>استيفاء وتدقيق</span>
                                </button>
                              </>
                            )}
                            {isResolved && (
                              <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                استوفيت بواسطة: {def.resolvedByName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Standard HIM Guidelines Note */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  سياسة استكمال السجلات الطبية والحدود النظامية المعتمدة:
                </div>
                <div className="text-blue-800 leading-relaxed space-y-1">
                  <div>
                    • <strong>الحد النظامي النهائي لسباهي (CBAHI):</strong> استكمال السجل الطبي للمرضى المنومين في موعد أقصاه 30 يوماً من تاريخ الخروج السريري.
                  </div>
                  <div>
                    • <strong>الهدف التشغيلي الداخلي للمستشفى (ILLUSTRATIVE_LOCAL_POLICY):</strong> محدد بـ 14 يوماً للاكتمال المبكر ومحاكاة التذكير عند اليوم 7 و14، ولا يعد قاعدة سباهي عالمية مطلقة.
                  </div>
                  <div>
                    • <strong>سجلات العيادات الخارجية (OPD) والطوارئ:</strong> ترتبط بإنجاز التوثيق اليومي للزيارة ولا ترث تلقائياً مؤقت الـ 30 يوماً الخاص بخروج المنومين.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              اختر سجلاً من القائمة لمعاينة تفاصيل النواقص والاكتمال
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
