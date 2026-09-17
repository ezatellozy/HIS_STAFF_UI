import React from 'react';
import {
  X,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  HandMetal,
  RotateCcw,
  ArrowRightLeft,
  FileText,
  ShieldAlert,
  Info,
  Calendar,
  Send,
  Sparkles,
  Ban,
  Activity,
  CheckSquare,
  Users,
  UserCheck,
  Compass,
  Flame,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  WorkItemRecord,
  ClinicalPriority,
  SourceUrgency,
  WorkItemOwnershipPolicy
} from '../../../types/clinicalWorkItems';

interface WorkItemDetailPanelProps {
  item: WorkItemRecord | null;
  onClose: () => void;
  onOpenPatient: (item: WorkItemRecord) => void;
  onClaim: (item: WorkItemRecord) => void;
  onRelease: (item: WorkItemRecord) => void;
  onAccept: (item: WorkItemRecord) => void;
  onRequestInfo: (item: WorkItemRecord) => void;
  onComplete: (item: WorkItemRecord) => void;
  onAcknowledge: (item: WorkItemRecord) => void;
  currentStaffId: string;
}

export const WorkItemDetailPanel: React.FC<WorkItemDetailPanelProps> = ({
  item,
  onClose,
  onOpenPatient,
  onClaim,
  onRelease,
  onAccept,
  onRequestInfo,
  onComplete,
  onAcknowledge,
  currentStaffId
}) => {
  if (!item) return null;

  const isClaimedByMe = item.claimedBy?.id === currentStaffId || item.assignedTo?.id === currentStaffId;

  // Axis friendly translation
  const getAxisFriendlyName = (axis: string) => {
    switch (axis) {
      case 'results':
        return 'المحور السابع: النتائج والمختبر والأشعة (Axis 7 — Results)';
      case 'medications':
        return 'المحور الثامن: الأدوية والمطابقة وسجل eMAR (Axis 8 — Medications)';
      case 'notes':
        return 'المحور الخامس: التوثيق والملاحظات والاستشارات (Axis 5 — Notes)';
      case 'orders':
        return 'المحور السادس: الأوامر والطلبات السريرية (Axis 6 — Orders)';
      case 'care_plan':
        return 'المحور التاسع: خطة الرعاية والتثقيف الصحي (Axis 9 — Care Plan)';
      case 'timeline':
      case 'summary':
        return 'المحور العاشر: الانتقالات السريرية والتسليم SBAR (Axis 10 — Journey)';
      default:
        return `المحور السريري (${axis})`;
    }
  };

  const getUrgencyBadge = (urgency?: SourceUrgency) => {
    switch (urgency) {
      case 'stat':
        return { label: 'STAT (فوري حرج للمصدر)', color: 'bg-rose-900 text-rose-100 border-rose-700' };
      case 'urgent':
        return { label: 'Urgent (عاجل من المصدر)', color: 'bg-amber-800 text-amber-100 border-amber-600' };
      case 'routine':
      default:
        return { label: 'Routine (روتيني من المصدر)', color: 'bg-slate-200 text-slate-800 border-slate-300' };
    }
  };

  const getPriorityBadge = (priority: ClinicalPriority) => {
    switch (priority) {
      case 'critical':
        return { label: 'حرج (Critical Queue Priority)', color: 'bg-red-100 text-red-900 border-red-300' };
      case 'urgent':
        return { label: 'عاجل (Urgent Queue Priority)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'priority':
        return { label: 'أولوية (Priority)', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'routine':
      default:
        return { label: 'روتيني (Routine)', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const getOwnershipPolicyLabel = (policy?: WorkItemOwnershipPolicy) => {
    switch (policy) {
      case 'self_claim':
        return { title: 'استلام ذاتي (Self-Claim)', desc: 'متاح للاستلام المباشر من قبل أي كادر سريري مؤهل في القسم.' };
      case 'supervisor_triage':
        return { title: 'فرز وتوجيه إشرافي (Supervisor Triage)', desc: 'يتطلب مراجعة وفرز من قبل رئيس الطاقم أو الطبيب المشرف قبل الإسناد.' };
      case 'direct_assignment':
        return { title: 'إسناد مباشر (Direct Assignment)', desc: 'مسند تلقائياً أو إدارياً لشخص محدد وفق المناوبة أو الطبيب المعالج.' };
      case 'team_shared':
        return { title: 'عمل جماعي مشترك (Team-Shared)', desc: 'مسؤولية مشتركة لكافة أفراد الفريق المناوب في الوحدة.' };
      default:
        return { title: 'استلام قياسي', desc: 'إجراء تشغيلي قياسي.' };
    }
  };

  const urgencyInfo = getUrgencyBadge(item.sourceUrgency);
  const priorityInfo = getPriorityBadge(item.priority);
  const ownershipInfo = getOwnershipPolicyLabel(item.ownershipPolicy);

  return (
    <div className="fixed inset-y-0 left-0 w-full max-w-2xl bg-white shadow-2xl border-r border-slate-200 z-50 flex flex-col font-['Cairo',sans-serif] animate-in slide-in-from-left duration-200">
      {/* 1. Header Bar */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-teal-400 font-bold">{item.id}</span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-bold">{item.queueName}</span>
            </div>
            <h2 className="text-sm font-black text-white line-clamp-1">{item.title}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="إغلاق اللوحة الجانبية"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Patient Safety Banner (Context Anchor) */}
      {item.patient ? (
        <div className="bg-teal-950 text-teal-100 p-3.5 border-b border-teal-900/80 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-white">{item.patient.nameAr}</span>
                <span className="text-[11px] text-teal-300">({item.patient.nameEn})</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-900 text-teal-200 font-mono text-[10px] font-bold">
                  {item.patient.mrn}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {item.patient.encounterId}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-teal-200/90 flex-wrap">
                <span>الموقع: <strong>{item.patient.currentLocation}</strong></span>
                <span>•</span>
                <span>العمر: <strong>{item.patient.age} سنة</strong></span>
                <span>•</span>
                <span>الجنس: <strong>{item.patient.gender === 'M' ? 'ذكر' : 'أنثى'}</strong></span>
              </div>
            </div>

            {/* Deep link button right in header */}
            <button
              type="button"
              onClick={() => onOpenPatient(item)}
              className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              title="الانتقال المباشر لملف المريض السريري"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فتح ملف المريض</span>
            </button>
          </div>

          {/* Allergies & Critical Flags */}
          {(item.patient.allergies?.length || item.patient.criticalFlags?.length) && (
            <div className="mt-2 pt-2 border-t border-teal-900/60 flex items-center gap-2 flex-wrap text-[10px]">
              {item.patient.allergies?.map((all, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-red-950/80 text-red-200 border border-red-800 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  <span>حساسية: {all}</span>
                </span>
              ))}
              {item.patient.criticalFlags?.map((flag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-200 border border-amber-800 font-bold">
                  {flag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs text-slate-600 font-bold">
          إجراء تشغيلي غير مرتبط بمريض فردي (Department Administrative Work Item)
        </div>
      )}

      {/* 3. Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Cancelled / No Longer Actionable Warning Alert if applicable */}
        {(item.isCancelledSource || item.isNoLongerActionable) && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3.5 text-red-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-red-800">
              <Ban className="w-5 h-5 text-red-600" />
              <span>أُلغي المصدر الأصلي (Source Cancelled / No Longer Actionable)</span>
            </div>
            <p className="text-xs text-red-900 leading-relaxed">
              {item.sourceChangeNotice || item.cancellationReason || 'تم إلغاء الطلب الأصلي من قِبل الطبيب الطالب، وأصبح هذا الإجراء التشغيلي غير قابل للتنفيذ السريري.'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-900 font-bold text-[11px] border border-red-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة التحقق من المصدر (Refresh Source State)</span>
              </button>
              <span className="text-[10px] text-red-700">تم تعطيل إجراءات الإكمال لمنع تضارب العمل السريري.</span>
            </div>
          </div>
        )}

        {/* 1. SEPARATION OF THREE PRIORITY / TIME CONCEPTS (A, B, C) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>فصل مفاهيم الإلحاح والأولوية والزمن (Priority & Time Concepts)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Concept Separation A / B / C</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Concept A: Source / Clinical Urgency */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                A. إلحاح المصدر السريري
              </span>
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold border ${urgencyInfo.color}`}>
                {urgencyInfo.label}
              </div>
              <p className="text-[10px] text-slate-500 pt-0.5">
                قادم من الكيان الأصلي ({item.sourceModule})
              </p>
            </div>

            {/* Concept B: Operational Work Priority */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                B. أولوية الطابور التشغيلي
              </span>
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${priorityInfo.color}`}>
                {priorityInfo.label}
              </div>
              <p className="text-[10px] text-slate-500 pt-0.5">
                أولوية ترتيب المهمة في الطابور
              </p>
            </div>

            {/* Concept C: SLA / Due Time / Target */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                C. المستهدف والزمن (SLA)
              </span>
              <div className="font-bold text-slate-900 text-xs">
                {item.dueAt || 'غير مقيد بوقت محدد'}
              </div>
              <p className="text-[10px] text-slate-500 pt-0.5">
                {item.configuredDueTarget || `الانتظار: ${item.waitingDuration}`}
              </p>
            </div>
          </div>
        </div>

        {/* 2. OWNERSHIP & CLAIM UX */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>الملكية وسياسة الاستلام (Ownership & Claim Policy)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
              {ownershipInfo.title}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">المستلم الحالي (Claimed By):</span>
              <strong className="text-slate-800">
                {item.claimedBy ? `${item.claimedBy.name} (${item.claimedBy.role})` : 'متاح في الطابور (غير مستلم)'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">المسند إليه (Assigned To):</span>
              <strong className="text-slate-800">
                {item.assignedTo ? `${item.assignedTo.name} (${item.assignedTo.role})` : 'فريق الطابور العام'}
              </strong>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">
            * {ownershipInfo.desc}
          </p>
        </div>

        {/* 3. STEP-AWARE DEEP LINKING CONTEXT */}
        {item.targetStepContext && (
          <div className="bg-gradient-to-l from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-teal-950 text-xs flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-teal-700" />
                <span>الربط السريري الموجه للخطوة المحددة (Step-Aware Deep Linking)</span>
              </h3>
              <span className="text-[10px] font-mono text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded font-bold">
                {item.targetStepContext.targetAxis}
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-teal-900 text-xs">{item.targetStepContext.stepTitleAr}</div>
              <p className="text-[11px] text-slate-700">{item.targetStepContext.stepDescriptionAr}</p>
            </div>

            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] text-teal-800 font-bold">
                الوجهة: {item.targetStepContext.axisNameAr}
              </span>
              <button
                type="button"
                onClick={() => onOpenPatient(item)}
                className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{item.targetStepContext.recommendedActionAr}</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. CRITICAL RESULT POLICY (if applicable) */}
        {item.criticalResultPolicy && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-black text-rose-950 text-xs">
              <ShieldCheck className="w-4 h-4 text-rose-700" />
              <span>{item.criticalResultPolicy.policyName}</span>
            </div>
            <p className="text-[11px] text-rose-900 leading-relaxed">
              {item.criticalResultPolicy.policyDescriptionAr}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-rose-800 font-mono pt-1">
              <span>طريقة التوثيق: <strong>{item.criticalResultPolicy.communicationMethod}</strong></span>
              <span>•</span>
              <span>زمن التصعيد: <strong>خلال {item.criticalResultPolicy.escalationTimeMinutes} دقيقة</strong></span>
            </div>
          </div>
        )}

        {/* 5. SOURCE RESOURCE VS WORK ITEM SEPARATION BOX */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>فصل الكيان المصدر عن الإجراء التشغيلي (Source vs Work Separation)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Projection Architecture</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Source Resource Column */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                الكيان السريري الأصلي (Source Resource)
              </span>
              <div className="font-extrabold text-slate-800">{item.sourceResourceType}</div>
              <div className="text-slate-600 font-mono text-[11px]">ID: {item.sourceResourceId}</div>
              <div className="pt-1 text-[11px]">
                الحالة بالمصدر:{' '}
                <strong className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                  {item.sourceStatus}
                </strong>
              </div>
            </div>

            {/* Operational Work Item Column */}
            <div className="bg-white p-3 rounded-xl border border-teal-200 space-y-1">
              <span className="text-[10px] font-bold text-teal-600 block uppercase tracking-wider">
                الإجراء التشغيلي في مهامي (Work Item)
              </span>
              <div className="font-extrabold text-teal-900">{item.type}</div>
              <div className="text-slate-600 font-mono text-[11px]">WI: {item.id}</div>
              <div className="pt-1 text-[11px]">
                الحالة التشغيلية:{' '}
                <strong className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-mono">
                  {item.operationalStatus}
                </strong>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
            <div>• <strong>قبول الطلب (Accept Request) ≠ حجز سرير فعلي:</strong> قبول الإجراء التشغيلي يعني موافقة الفريق السريري على بدء التعامل، وليس حجزاً فعلياً للسرير.</div>
            <div>• <strong>إكمال المهمة (Complete Work Item) ≠ وثيقة القرار السريري الأصلية:</strong> إغلاق الإجراء التشغيلي يوثق إنجاز الخطوة الإدارية بينما توثق الاستشارة والقرارات بالكامل في السجل السريري الأساسي (Axis 1–10).</div>
          </div>
        </div>

        {/* 6. Source Request Details & Requester */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
          <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>بيانات الطلب والجهة الطالبة (Source Details)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
            <div>
              <span className="text-slate-400 block">الطبيب / الجهة الطالبة:</span>
              <strong className="text-slate-800">{item.sourceRequestedBy.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">القسم المصدر:</span>
              <strong className="text-slate-800">{item.sourceRequestedBy.department}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">وقت الطلب:</span>
              <strong className="text-slate-800 font-mono">{item.sourceRequestedBy.requestedAt}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">المسار السريري (Process):</span>
              <strong className="text-slate-800">{item.workflowProcess}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">المرحلة الحالية (Step):</span>
              <strong className="text-slate-800">{item.currentStep}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">توقيت الحدث الأصلي:</span>
              <strong className="text-slate-800 font-mono">{item.sourceEventTimestamp || item.createdAt}</strong>
            </div>
          </div>
        </div>

        {/* 7. Clinical Context Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
          <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>ملخص السياق السريري (Clinical Context Summary)</span>
          </h3>

          <div className="space-y-2 text-xs">
            {item.clinicalContextSummary.primaryDiagnosis && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">التشخيص المبدئي / الحالة:</span>
                <strong className="text-slate-900 text-xs">{item.clinicalContextSummary.primaryDiagnosis}</strong>
              </div>
            )}

            {item.clinicalContextSummary.clinicalQuestion && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">السؤال السريري المطلوب الإجابة عنه:</span>
                <p className="text-slate-800 text-xs font-semibold leading-relaxed">
                  {item.clinicalContextSummary.clinicalQuestion}
                </p>
              </div>
            )}

            {item.clinicalContextSummary.vitalSigns && (
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold text-[11px]">العلامات الحيوية:</span>
                <span className="font-mono text-xs text-slate-800 font-bold">
                  {item.clinicalContextSummary.vitalSigns}
                </span>
              </div>
            )}

            {item.clinicalContextSummary.relevantLab && (
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold text-[11px]">المخبريات المرتبطة:</span>
                <span className="font-mono text-xs text-slate-800 font-bold">
                  {item.clinicalContextSummary.relevantLab}
                </span>
              </div>
            )}

            {item.clinicalContextSummary.keyFindings && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                <span className="text-slate-400 text-[10px] block">أبرز الملاحظات السريرية:</span>
                {item.clinicalContextSummary.keyFindings}
              </div>
            )}

            {item.clinicalContextSummary.redFlags && item.clinicalContextSummary.redFlags.length > 0 && (
              <div className="bg-red-50 p-2.5 rounded-xl border border-red-200">
                <span className="text-red-700 text-[10px] font-bold block mb-1">
                  مؤشرات الخطر والإنذار (Red Flags):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.clinicalContextSummary.redFlags.map((flag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[10px]">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 8. Completion Outcome if already completed */}
        {item.completionOutcome && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-black text-teal-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>نتيجة الإنجاز والإغلاق السريري (Completion Record)</span>
            </div>
            <div className="text-[11px] text-teal-950 space-y-1">
              <div>بواسطة: <strong>{item.completionOutcome.completedBy}</strong> • في {item.completionOutcome.completedAt}</div>
              {item.completionOutcome.disposition && (
                <div>القرار: <strong className="text-teal-800">{item.completionOutcome.disposition}</strong></div>
              )}
              {item.completionOutcome.resultingDocTitle && (
                <div>الوثيقة السريرية المنجزة: <span className="font-mono font-bold">{item.completionOutcome.resultingDocTitle}</span></div>
              )}
              <p className="bg-white p-2 rounded-lg border border-teal-100 mt-1.5 text-slate-700">
                {item.completionOutcome.outcomeNote}
              </p>
            </div>
          </div>
        )}

        {/* 9. Mock Activity Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
          <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>سجل الإجراءات التشغيلية (Mock Activity Timeline)</span>
          </h3>

          <div className="relative pr-4 border-r-2 border-slate-200 space-y-3 mr-2 text-[11px]">
            {item.activityHistory.map((act) => (
              <div key={act.id} className="relative">
                <div className="absolute -right-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{act.timestamp}</span>
                  <span className="font-bold text-slate-800">{act.actorName}</span>
                  <span className="text-slate-400">({act.actorRole})</span>
                </div>
                <p className="text-slate-600 mt-0.5">{act.description}</p>
                {act.outcomeNotes && (
                  <p className="bg-slate-50 p-1.5 rounded text-slate-700 font-mono text-[10px] mt-1">
                    {act.outcomeNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Deep Link & Action Footer Bar */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-2.5">
        {/* Big Deep Link CTA */}
        {item.patient && (
          <button
            type="button"
            onClick={() => onOpenPatient(item)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-teal-400" />
            <span>فتح ملف المريض السريري الكامل مباشرة في: {getAxisFriendlyName(item.targetWorkspaceAxis)}</span>
          </button>
        )}

        {/* Operational Action Buttons driven by allowedActions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Claim Action */}
          {!item.claimedBy && item.allowedActions.includes('claim') && !item.isNoLongerActionable && (
            <button
              type="button"
              onClick={() => onClaim(item)}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <HandMetal className="w-3.5 h-3.5" />
              <span>استلام العمل (Claim)</span>
            </button>
          )}

          {/* Release Action */}
          {isClaimedByMe && item.allowedActions.includes('release') && item.operationalStatus !== 'completed' && (
            <button
              type="button"
              onClick={() => onRelease(item)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>إلغاء الاستلام وإعادة للطابور (Release)</span>
            </button>
          )}

          {/* Accept Action (for Admissions / Handovers) */}
          {item.allowedActions.includes('accept') && item.operationalStatus !== 'completed' && !item.isNoLongerActionable && (
            <button
              type="button"
              onClick={() => onAccept(item)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>قبول الطلب السريري (Accept Request)</span>
            </button>
          )}

          {/* Acknowledge Action (for Critical Results) */}
          {item.allowedActions.includes('acknowledge') && item.operationalStatus !== 'completed' && !item.isNoLongerActionable && (
            <button
              type="button"
              onClick={() => onAcknowledge(item)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>اعتماد النتيجة الحرجة (Acknowledge Critical Result)</span>
            </button>
          )}

          {/* Request More Information */}
          {item.allowedActions.includes('request_info') && item.operationalStatus !== 'completed' && !item.isNoLongerActionable && (
            <button
              type="button"
              onClick={() => onRequestInfo(item)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>طلب معلومات إضافية من المرسل</span>
            </button>
          )}

          {/* Complete Work Item Action */}
          {item.allowedActions.includes('complete') && item.operationalStatus !== 'completed' && !item.isNoLongerActionable && (
            <button
              type="button"
              onClick={() => onComplete(item)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>إغلاق الإجراء وإكمال المهمة (Complete)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
