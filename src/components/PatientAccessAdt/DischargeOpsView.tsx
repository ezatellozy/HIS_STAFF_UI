import React, { useState } from 'react';
import {
  LogOut,
  CheckCircle,
  Clock,
  FileText,
  Pill,
  Calendar,
  AlertTriangle,
  CheckCheck,
  UserCheck,
  Building,
  Sparkles,
  ShieldCheck,
  XCircle,
  ArrowRight,
  PlaneTakeoff,
  RotateCcw,
  Sliders,
  DollarSign,
  Package,
  GraduationCap,
  Lock
} from 'lucide-react';
import {
  DischargeEntity,
  TemporaryLeaveEntity,
  DischargePlanningStatus,
  DischargeReadinessPolicyProfile,
  BedReleasePolicyProfile,
  DischargeReadinessSummary
} from '../../types/patientAccessAdt';

interface DischargeOpsViewProps {
  discharges: DischargeEntity[];
  temporaryLeaves: TemporaryLeaveEntity[];
  onExecuteDischarge: (dischargeId: string) => void;
  onConfirmPhysicalDeparture: (dischargeId: string) => void;
  onAdministrativeClosure?: (dischargeId: string) => void;
  onUpdateReadiness?: (dischargeId: string, updatedReadiness: Partial<DischargeReadinessSummary>) => void;
  onApproveTemporaryLeave: (leave: TemporaryLeaveEntity) => void;
  onReturnTemporaryLeave: (leaveId: string) => void;
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
}

export const DischargeOpsView: React.FC<DischargeOpsViewProps> = ({
  discharges,
  temporaryLeaves,
  onExecuteDischarge,
  onConfirmPhysicalDeparture,
  onAdministrativeClosure,
  onUpdateReadiness,
  onApproveTemporaryLeave,
  onReturnTemporaryLeave,
  onOpenPatientWorkspace
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'discharges' | 'temporary_leaves'>('discharges');
  const [readinessPolicy, setReadinessPolicy] = useState<DischargeReadinessPolicyProfile>('standard_comprehensive');
  const [bedReleasePolicy, setBedReleasePolicy] = useState<BedReleasePolicyProfile>('immediate_turnover_departure');

  // Temporary Leave Modal State - Dynamic Context Binding
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedDischargeForLeave, setSelectedDischargeForLeave] = useState<DischargeEntity | null>(null);
  const [leaveHours, setLeaveHours] = useState(4);
  const [leaveReason, setLeaveReason] = useState('إذن خروج مؤقت لإنهاء معاملة عائلية خاصة مع الالتزام بتعليمات الفريق الطبي والعودة قبل المساء');
  const [leaveBedRetentionPolicy, setLeaveBedRetentionPolicy] = useState<'retain_bed' | 'release_bed'>('retain_bed');

  const openLeaveModal = (targetDischarge?: DischargeEntity) => {
    const defaultTarget = targetDischarge || discharges[0] || null;
    setSelectedDischargeForLeave(defaultTarget);
    setLeaveHours(4);
    setLeaveReason('إذن خروج مؤقت لإنهاء معاملة عائلية خاصة مع الالتزام بتعليمات الفريق الطبي والعودة قبل المساء');
    setLeaveBedRetentionPolicy('retain_bed');
    setIsLeaveModalOpen(true);
  };

  const closeLeaveModal = () => {
    setIsLeaveModalOpen(false);
    setSelectedDischargeForLeave(null);
  };

  const handleCreateLeave = () => {
    if (!selectedDischargeForLeave) return;

    const now = new Date();
    const startTimeStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const returnTime = new Date(now.getTime() + leaveHours * 3600000);
    const returnTimeStr = returnTime.toISOString().replace('T', ' ').substring(0, 16);

    const newLeave: TemporaryLeaveEntity = {
      id: `leave-${Date.now()}`,
      encounterId: selectedDischargeForLeave.encounterId,
      patientId: selectedDischargeForLeave.patientId,
      mrn: selectedDischargeForLeave.mrn,
      patientNameAr: selectedDischargeForLeave.patientNameAr,
      leaveType: 'compassionate',
      approvedBy: 'د. طارق المنشاوي (استشاري الرعاية التنويمية)',
      startDateTime: startTimeStr,
      expectedReturnDateTime: returnTimeStr,
      status: 'on_leave',
      notes: `${leaveReason} [السرير: ${selectedDischargeForLeave.unitName} (${selectedDischargeForLeave.bedNumber}) - سياسة السرير: ${
        leaveBedRetentionPolicy === 'retain_bed' ? 'حفظ السرير محجوزاً وثابتاً للمريض' : 'تحرير مؤقت'
      }]`
    };

    onApproveTemporaryLeave(newLeave);
    closeLeaveModal();
  };

  const handleToggleReadinessItem = (dischargeId: string, itemKey: keyof DischargeReadinessSummary, currentVal: boolean) => {
    if (onUpdateReadiness) {
      onUpdateReadiness(dischargeId, { [itemKey]: !currentVal });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Conceptual Invariant */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 border border-emerald-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>الفصل العملياتي: قرار الخروج ≠ جاهزية الخروج ≠ حدث الخروج بالنظام ≠ المغادرة الفيزيائية ≠ إغلاق الزيارة إدارياً</span>
          </div>
          <h2 className="text-xl font-black text-white">إدارة خروج المنومين وجاهزية الإخلاء ودورة السرير</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            <strong>أمر الخروج وجاهزيته (Readiness Checklist):</strong> استيفاء تسوية الأدوية والملخص الطبي وتخليص الحسابات.<br />
            <strong>حدث الخروج بالنظام (Discharge Encounter):</strong> إنهاء المسار السريري التنويمي للمريض.<br />
            <strong>المغادرة الفيزيائية (Physical Departure):</strong> خروج المريض الفعلي وبدء دورة تعقيم السرير.<br />
            <strong>إغلاق الزيارة إدارياً (Administrative Closure):</strong> قفل العمليات التشغيلية الروتينية للزيارة، مع بقاء التعديلات السريرية والملحقات (Addenda/Amendments) خاضعة لسياسات التوثيق السريري المعتمدة دون إعادة فتح الزيارة تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveSubTab('discharges')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
              activeSubTab === 'discharges'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            حالات الخروج المخططة ({discharges.length})
          </button>
          <button
            onClick={() => setActiveSubTab('temporary_leaves')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
              activeSubTab === 'temporary_leaves'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            الإجازات المؤقتة (Pass) ({temporaryLeaves.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'discharges' ? (
        <div className="space-y-4">
          {/* Policy Profile Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                سياسات الخروج وإخلاء الأسرة المهيأة للمنشأة (Configured Discharge & Turnover Policy):
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">
                  1. معايير الجاهزية السريرية المطلوبة قبل الخروج:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  تتطلب تسوية الأدوية (Med Rec)، ملخص الخروج موقعاً من الاستشاري، واستكمال تعليمات التمريض، والتخليص المالي.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">
                  2. سياسة تحرير السرير ونظافته:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  يتحول السرير فور تأكيد المغادرة الفيزيائية (Physical Departure) إلى دورة النظافة والتعقيم (Dirty ⟵ Cleaning ⟵ Available).
                </p>
              </div>
            </div>
          </div>

          {/* Discharge List */}
          <div className="space-y-4">
            {discharges.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                لا توجد حالات خروج مسجلة حالياً
              </div>
            ) : (
              discharges.map(dis => {
                const r = dis.readiness;
                const isFullyReady =
                  r.medicationReconciliationDone &&
                  r.dischargeNoteApproved &&
                  r.nursingDischargeChecklistDone &&
                  r.financialAdministrativeClearance;

                const isDischarged = dis.status === 'discharged' || dis.status === 'departed' || dis.status === 'completed';
                const isDeparted = dis.status === 'departed' || dis.status === 'completed';
                const isClosed = dis.status === 'completed' || !!dis.administrativeCompletionTimestamp;

                return (
                  <div
                    key={dis.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                      isClosed
                        ? 'border-slate-300 bg-slate-50/50'
                        : isDeparted
                        ? 'border-blue-200 bg-blue-50/15'
                        : isDischarged
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : isFullyReady
                        ? 'border-indigo-200 bg-indigo-50/10'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-base font-black text-slate-900">{dis.patientNameAr}</h4>
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {dis.mrn}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {dis.unitName} — سرير {dis.bedNumber}
                        </span>

                        {isClosed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                            الزيارة مغلقة إدارياً (Encounter Closed — العمليات مقفلة؛ والتعديلات السريرية تخضع لسياسة الملحقات)
                          </span>
                        ) : isDeparted ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300 flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                            غادر المستشفى فيزيائياً وأُخلي السرير
                          </span>
                        ) : isDischarged ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            تم الخروج بالنظام (بانتظار المغادرة الفيزيائية)
                          </span>
                        ) : isFullyReady ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            مكتمل متطلبات الخروج السريرية والإدارية
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            متطلبات خروج معلقة
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400">
                        التاريخ المستهدف للخروج: <strong className="font-mono text-slate-700">{dis.expectedDischargeDate}</strong>
                      </div>
                    </div>

                    {/* Readiness Checklist Grid - Interactive & Verifiable */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 block">
                        متطلبات واستحقاقات جاهزية الخروج (Discharge Readiness Domains):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleReadinessItem(dis.id, 'medicationReconciliationDone', r.medicationReconciliationDone)}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2 ${
                            r.medicationReconciliationDone
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50/70 border-amber-300 text-amber-950 hover:bg-amber-100/70'
                          }`}
                        >
                          {r.medicationReconciliationDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div>
                            <strong className="block text-[11px]">تسوية الأدوية (Med Rec)</strong>
                            <span className="text-[10px] text-slate-500">
                              {r.medicationReconciliationDone ? 'مكتملة ومعتمدة' : 'معلقة عند الصيدلة (انقر للتحديث)'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleReadinessItem(dis.id, 'dischargeNoteApproved', r.dischargeNoteApproved)}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2 ${
                            r.dischargeNoteApproved
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50/70 border-amber-300 text-amber-950 hover:bg-amber-100/70'
                          }`}
                        >
                          {r.dischargeNoteApproved ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div>
                            <strong className="block text-[11px]">ملخص الخروج الطبي</strong>
                            <span className="text-[10px] text-slate-500">
                              {r.dischargeNoteApproved ? 'موقع من الاستشاري' : 'بانتظار توقيع الطبيب (انقر للتحديث)'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleReadinessItem(dis.id, 'nursingDischargeChecklistDone', r.nursingDischargeChecklistDone)}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2 ${
                            r.nursingDischargeChecklistDone
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50/70 border-amber-300 text-amber-950 hover:bg-amber-100/70'
                          }`}
                        >
                          {r.nursingDischargeChecklistDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div>
                            <strong className="block text-[11px]">تعليمات التمريض</strong>
                            <span className="text-[10px] text-slate-500">
                              {r.nursingDischargeChecklistDone ? 'تم تسليم الإرشادات' : 'جاري إنهاء الإجراءات (انقر للتحديث)'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleReadinessItem(dis.id, 'financialAdministrativeClearance', r.financialAdministrativeClearance)}
                          className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2 ${
                            r.financialAdministrativeClearance
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50/70 border-amber-300 text-amber-950 hover:bg-amber-100/70'
                          }`}
                        >
                          {r.financialAdministrativeClearance ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div>
                            <strong className="block text-[11px]">التخليص المالي والإداري</strong>
                            <span className="text-[10px] text-slate-500">
                              {r.financialAdministrativeClearance ? 'مكتمل ومعتمد' : 'معلق بالمحاسبة (انقر للتحديث)'}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {dis.closureNotes && (
                      <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>ملاحظات التنسيق: {dis.closureNotes}</span>
                      </div>
                    )}

                    {/* Operational Milestones Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px]">1. الخروج السريري بالنظام:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {dis.actualDischargeTimestamp || 'لم يتم بعد'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">2. المغادرة الفيزيائية للسرير:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {dis.actualDepartureTimestamp || 'لم يغادر بعد'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">3. الإغلاق الإداري للزيارة:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {dis.administrativeCompletionTimestamp || 'بانتظار التسوية'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {/* Context-bound Temporary Pass affordance */}
                        {!isDischarged && (
                          <button
                            onClick={() => openLeaveModal(dis)}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            title="إصدار تصريح إجازة مؤقتة لهذا المريض"
                          >
                            <PlaneTakeoff className="w-3.5 h-3.5 text-emerald-600" />
                            <span>تصريح إجازة مؤقتة</span>
                          </button>
                        )}
                        <span className="text-xs text-slate-500">
                          الوجهة: <strong className="text-slate-800">{dis.destinationDetails || 'المنزل'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Milestone 1: Execute Encounter Discharge */}
                        {!isDischarged && (
                          <button
                            onClick={() => onExecuteDischarge(dis.id)}
                            disabled={!isFullyReady}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>إتمام الخروج بالنظام (Discharge)</span>
                          </button>
                        )}

                        {/* Milestone 2: Confirm Physical Departure */}
                        {isDischarged && !isDeparted && (
                          <button
                            onClick={() => onConfirmPhysicalDeparture(dis.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>تأكيد المغادرة الفيزيائية وتحرير السرير</span>
                          </button>
                        )}

                        {/* Milestone 3: Administrative Encounter Closure */}
                        {isDeparted && !isClosed && onAdministrativeClosure && (
                          <button
                            onClick={() => onAdministrativeClosure(dis.id)}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                          >
                            <Lock className="w-4 h-4 text-amber-400" />
                            <span>إغلاق الزيارة إدارياً (Close Encounter)</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenPatientWorkspace(dis.mrn, dis.encounterId)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          السجل السريري
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Subtab: Temporary Leave (Pass) */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">سجل الإجازات والمغادرات المؤقتة (Temporary Passes)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تصريح مغادرة مؤقتة للمريض المنوم بساعات محددة دون إغلاق الزيارة التنويمية ودون فقدان السرير.
              </p>
            </div>
            <button
              onClick={() => openLeaveModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <PlaneTakeoff className="w-4 h-4" />
              <span>إصدار تصريح إجازة مؤقتة جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {temporaryLeaves.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                لا توجد إجازات مؤقتة مسجلة حالياً
              </div>
            ) : (
              temporaryLeaves.map(leave => (
                <div key={leave.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-black text-slate-900">{leave.patientNameAr}</h4>
                      <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {leave.mrn}
                      </span>
                      {leave.status === 'on_leave' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 animate-pulse">
                          في إجازة مؤقتة حالياً
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                          عاد للقسم التنويمي واستقر بالسرير
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-500">
                      الموافقة الطبية: {leave.approvedBy}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">توقيت بدء المغادرة:</span>
                      <strong className="font-mono text-slate-800">{leave.startDateTime}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">موعد العودة المحدد:</span>
                      <strong className="font-mono text-slate-800">{leave.expectedReturnDateTime}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">نوع الإجازة:</span>
                      <strong className="text-slate-800">إنسانية / خاصة (Compassionate)</strong>
                    </div>
                  </div>

                  {leave.notes && (
                    <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {leave.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {leave.status === 'on_leave' && (
                      <button
                        onClick={() => onReturnTemporaryLeave(leave.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>تسجيل عودة المريض واستقراره بالسرير</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: New Temporary Leave (Context-Safe Binding) */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PlaneTakeoff className="w-5 h-5 text-emerald-600" />
                  إصدار تصريح إجازة مؤقتة (Temporary Inpatient Pass)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  لا تغلق الزيارة التنويمية ولا تلغي تخصيص السرير.
                </p>
              </div>
              <button
                onClick={closeLeaveModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Dynamic Context Binding Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المريض المنوم المستفيد من التصريح *
                </label>
                <select
                  value={selectedDischargeForLeave?.id || ''}
                  onChange={e => {
                    const found = discharges.find(d => d.id === e.target.value);
                    if (found) setSelectedDischargeForLeave(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                >
                  {discharges.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.patientNameAr} ({d.mrn}) — {d.unitName} (سرير {d.bedNumber})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDischargeForLeave && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-700 font-bold block">موقع السرير التنويمي المعتمد:</span>
                    <strong>{selectedDischargeForLeave.unitName} — سرير {selectedDischargeForLeave.bedNumber}</strong>
                  </div>
                  <div className="text-right font-mono text-[11px] text-emerald-800">
                    <div>معرف الزيارة: {selectedDischargeForLeave.encounterId}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">المدة المصرح بها (بالساعات) *</label>
                <input
                  type="number"
                  value={leaveHours}
                  onChange={e => setLeaveHours(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={24}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب الإجازة والشروط الطبية *</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  سياسة السرير أثناء الإجازة (Bed Retention Policy) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveBedRetentionPolicy('retain_bed')}
                    className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                      leaveBedRetentionPolicy === 'retain_bed'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="text-[11px] font-bold">حفظ السرير (Retain Bed)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      السرير يبقى محجوزاً للمريض طوال فترة الإجازة
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveBedRetentionPolicy('release_bed')}
                    className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                      leaveBedRetentionPolicy === 'release_bed'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="text-[11px] font-bold">تحرير مؤقت (Release Bed)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      إتاحة السرير لحالات الطوارئ مع إعادة التسكين عند العودة
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={closeLeaveModal}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateLeave}
                disabled={!selectedDischargeForLeave}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                اعتماد وتوقيع التصريح
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
