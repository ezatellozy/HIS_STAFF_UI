import React from 'react';
import {
  AlertTriangle,
  Clock,
  Flame,
  ChevronLeft,
  User,
  ExternalLink,
  ShieldAlert,
  HandMetal,
  FileCheck,
  Stethoscope,
  Activity,
  Pill,
  ArrowRightLeft,
  CalendarClock,
  Sparkles,
  Ban,
  Users,
  UserCheck,
  Compass
} from 'lucide-react';
import {
  WorkItemRecord,
  ClinicalPriority,
  WorkItemType,
  OperationalWorkStatus,
  SourceUrgency,
  WorkItemOwnershipPolicy
} from '../../../types/clinicalWorkItems';

interface WorkItemRowProps {
  item: WorkItemRecord;
  isSelected: boolean;
  onSelect: (item: WorkItemRecord) => void;
  onClaim: (item: WorkItemRecord, e: React.MouseEvent) => void;
  onOpenPatient: (item: WorkItemRecord, e: React.MouseEvent) => void;
  currentStaffId: string;
}

export const WorkItemRow: React.FC<WorkItemRowProps> = ({
  item,
  isSelected,
  onSelect,
  onClaim,
  onOpenPatient,
  currentStaffId
}) => {
  // 1. Operational Queue Priority Badge
  const renderPriorityBadge = (priority: ClinicalPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>حرج (Critical)</span>
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>عاجل (Urgent)</span>
          </span>
        );
      case 'priority':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>أولوية (Priority)</span>
          </span>
        );
      case 'routine':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>روتيني (Routine)</span>
          </span>
        );
    }
  };

  // 2. Source Clinical Urgency Badge (Distinct from Queue Priority)
  const renderSourceUrgencyBadge = (urgency?: SourceUrgency) => {
    if (!urgency) return null;
    switch (urgency) {
      case 'stat':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-900 text-rose-100 font-mono text-[10px] font-black tracking-wider uppercase border border-rose-700 shadow-xs">
            <Flame className="w-3 h-3 text-rose-300 animate-pulse" />
            <span>STAT</span>
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-800 text-amber-100 font-mono text-[10px] font-bold tracking-wider uppercase">
            <span>URGENT</span>
          </span>
        );
      case 'routine':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-medium tracking-wider uppercase">
            <span>ROUTINE</span>
          </span>
        );
    }
  };

  // 3. Ownership Policy Badge
  const renderOwnershipPolicyBadge = (policy?: WorkItemOwnershipPolicy) => {
    switch (policy) {
      case 'self_claim':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200" title="سياسة الاستلام: استلام حر من قِبل الكادر المؤهل">
            <HandMetal className="w-3 h-3 text-teal-600" />
            <span>استلام ذاتي (Self-Claim)</span>
          </span>
        );
      case 'supervisor_triage':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200" title="سياسة الاستلام: فرز وتوجيه إشرافي">
            <Users className="w-3 h-3 text-indigo-600" />
            <span>فرز إشرافي (Triage)</span>
          </span>
        );
      case 'direct_assignment':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200" title="سياسة الاستلام: إسناد مباشر لشخص محدد">
            <UserCheck className="w-3 h-3 text-blue-600" />
            <span>إسناد مباشر</span>
          </span>
        );
      case 'team_shared':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="سياسة الاستلام: عمل مشترك لكامل الفريق المناوب">
            <Users className="w-3 h-3 text-amber-600" />
            <span>مشترك للفريق</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Work Type Badge & Icon
  const getWorkTypeInfo = (type: WorkItemType) => {
    switch (type) {
      case 'consultation_review':
        return { label: 'استشارة سريرية', icon: <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> };
      case 'admission_review':
        return { label: 'طلب قبول / تنويم', icon: <Activity className="w-3.5 h-3.5 text-purple-600" /> };
      case 'critical_result_followup':
        return { label: 'نتيجة حرجة ملزمة', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> };
      case 'medication_reconciliation':
        return { label: 'مطابقة دوائية', icon: <Pill className="w-3.5 h-3.5 text-teal-600" /> };
      case 'handover_receipt':
        return { label: 'استلام تسليم SBAR', icon: <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-600" /> };
      case 'care_plan_review':
        return { label: 'مراجعة الخطة العلاجية', icon: <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> };
      case 'transfer_review':
        return { label: 'جاهزية جراحية / نقل', icon: <CalendarClock className="w-3.5 h-3.5 text-indigo-600" /> };
      default:
        return { label: 'إجراء تشغيلي', icon: <Activity className="w-3.5 h-3.5 text-slate-600" /> };
    }
  };

  const typeInfo = getWorkTypeInfo(item.type);

  // Operational Status Presentation
  const renderWorkStatusBadge = (status: OperationalWorkStatus) => {
    switch (status) {
      case 'unassigned':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-dashed border-slate-300">
            غير مسند (Unassigned)
          </span>
        );
      case 'claimed':
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            قيد الإجراء (In Progress)
          </span>
        );
      case 'waiting_in_queue':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            في الطابور (In Queue)
          </span>
        );
      case 'waiting_for_info':
      case 'waiting_for_patient':
      case 'waiting_external':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            بانتظار طرف خارجي
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            مكتمل (Completed)
          </span>
        );
      case 'cancelled_source':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <Ban className="w-3 h-3 text-red-500" />
            <span>أُلغي المصدر الأصلي</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  // Ownership badge
  const isClaimedByMe = item.claimedBy?.id === currentStaffId || item.assignedTo?.id === currentStaffId;

  return (
    <div
      onClick={() => onSelect(item)}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs relative ${
        isSelected
          ? 'bg-teal-50/50 border-teal-500 shadow-md ring-2 ring-teal-500/20'
          : item.isCancelledSource
          ? 'bg-red-50/20 border-red-200 hover:bg-red-50/30'
          : item.priority === 'critical' && item.operationalStatus !== 'completed'
          ? 'bg-red-50/20 border-red-200 hover:bg-red-50/40 hover:border-red-300'
          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left Column: Priority + Urgency + Type + Patient Context */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Priority & Urgency visual flags (Concept A vs Concept B Separation) */}
          <div className="shrink-0 flex flex-col gap-1 items-start pt-0.5">
            {renderPriorityBadge(item.priority)}
            {renderSourceUrgencyBadge(item.sourceUrgency)}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            {/* Title & Type Line */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-teal-700 transition-colors">
                {item.title}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                {typeInfo.icon}
                <span>{typeInfo.label}</span>
              </span>
              {renderWorkStatusBadge(item.operationalStatus)}
              {renderOwnershipPolicyBadge(item.ownershipPolicy)}
            </div>

            {/* Patient Context Line */}
            {item.patient ? (
              <div className="flex items-center gap-2 flex-wrap text-slate-600 text-[11px]">
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{item.patient.nameAr}</span>
                </span>
                <span className="font-mono text-slate-500">({item.patient.mrn})</span>
                <span>•</span>
                <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                  {item.patient.currentLocation}
                </span>
                <span>•</span>
                <span className="text-slate-500">{item.patient.age} سنة / {item.patient.gender === 'M' ? 'ذكر' : 'أنثى'}</span>
                {item.patient.allergies && item.patient.allergies.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                    حساسية: {item.patient.allergies[0]}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-[11px] font-bold">
                إجراء تشغيلي عام للقسم (Non-Patient Work Item)
              </div>
            )}

            {/* Target Step deep-linking hint if available */}
            {item.targetStepContext && (
              <div className="flex items-center gap-1.5 text-[10px] text-teal-800 bg-teal-50/70 px-2 py-0.5 rounded-md border border-teal-200/80 w-fit">
                <Compass className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="font-bold">المحور المستهدف:</span>
                <span className="font-medium text-slate-700">{item.targetStepContext.stepTitleAr}</span>
              </div>
            )}

            {/* Short Clinical Reason / Question */}
            <p className="text-slate-500 text-[11px] line-clamp-1">
              {item.clinicalContextSummary.clinicalQuestion || item.description}
            </p>

            {/* Source Resource vs Work Status Line */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-wrap pt-0.5">
              <span>المصدر: <strong className="text-slate-600">{item.sourceResourceId}</strong> ({item.sourceModule})</span>
              <span>•</span>
              <span>حالة المصدر: <strong className="text-slate-700 bg-slate-100 px-1 rounded">{item.sourceStatus}</strong></span>
              <span>•</span>
              <span>طالب الإجراء: <span className="text-slate-600">{item.sourceRequestedBy.name}</span></span>
            </div>
          </div>
        </div>

        {/* Right Column: Ownership + SLA / Due + Actions */}
        <div className="flex items-center gap-3 shrink-0 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
          {/* Ownership & Timing (Concept C) */}
          <div className="text-right space-y-1">
            {/* Ownership badge */}
            <div>
              {item.claimedBy ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  isClaimedByMe ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-blue-100 text-blue-800'
                }`}>
                  <User className="w-3 h-3" />
                  <span>{isClaimedByMe ? 'مستلم بواسطتي' : item.claimedBy.name}</span>
                </span>
              ) : item.assignedTo ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                  <span>مسند لـ: {item.assignedTo.name}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <HandMetal className="w-3 h-3 text-amber-600" />
                  <span>متاح للاستلام (Claimable)</span>
                </span>
              )}
            </div>

            {/* SLA / Due time indicator */}
            <div className="text-[11px] font-mono flex items-center justify-end gap-1">
              {item.dueState === 'overdue' ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                  <span>{item.dueAt}</span>
                </span>
              ) : item.dueState === 'due_soon' ? (
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{item.dueAt}</span>
                </span>
              ) : (
                <span className="text-slate-500">
                  الانتظار: {item.waitingDuration}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            {/* Claim button if unassigned and allowed */}
            {!item.claimedBy && item.allowedActions.includes('claim') && !item.isNoLongerActionable && (
              <button
                type="button"
                onClick={(e) => onClaim(item, e)}
                className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                title="استلام هذا الإجراء التشغيلي للعمل عليه"
              >
                <HandMetal className="w-3.5 h-3.5" />
                <span>استلام (Claim)</span>
              </button>
            )}

            {/* Deep link into patient workspace */}
            {item.patient && (
              <button
                type="button"
                onClick={(e) => onOpenPatient(item, e)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                title={`فتح ملف المريض مباشرة على: ${item.targetWorkspaceAxis}`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">فتح الملف</span>
              </button>
            )}

            {/* View Details arrow */}
            <div className="p-1 text-slate-400">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
