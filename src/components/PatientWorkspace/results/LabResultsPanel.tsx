import React, { useState } from 'react';
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  History,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldAlert,
  FileEdit,
  Send,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import {
  LabReportItem,
  LabObservationItem,
  CriticalResultPresentationPolicy
} from '../../../types/clinicalResults';

interface LabResultsPanelProps {
  reports: LabReportItem[];
  onOpenTrend: (analyteCode: string) => void;
  onAcknowledgeReport: (reportId: string) => void;
  onViewAmendments: (report: LabReportItem) => void;
  onOpenFollowUp?: (report: LabReportItem) => void;
  alertPresentationPolicy?: CriticalResultPresentationPolicy;
  userAuthorityRole?: 'consumer' | 'source';
}

export const LabResultsPanel: React.FC<LabResultsPanelProps> = ({
  reports,
  onOpenTrend,
  onAcknowledgeReport,
  onViewAmendments,
  onOpenFollowUp,
  alertPresentationPolicy,
  userAuthorityRole = 'consumer'
}) => {
  const [expandedReports, setExpandedReports] = useState<string[]>(
    reports.map(r => r.id)
  );

  const toggleExpand = (id: string) => {
    setExpandedReports(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {reports.map(report => {
        const isExpanded = expandedReports.includes(report.id);
        const hasCritical = report.observations.some(
          o => o.flag === 'critical_high' || o.flag === 'critical_low'
        );
        const hasAbnormal = report.observations.some(
          o => o.flag === 'high' || o.flag === 'low'
        );
        const isAcknowledged = report.reviewStatus === 'acknowledged';
        const isAmended = report.status === 'amended' || report.status === 'corrected';
        const followUpState = (report as any).followUpStatus as string | undefined;
        const isFollowUpDone = followUpState === 'followup_completed';

        const isMotionActive = alertPresentationPolicy?.enableOptionalMotion ?? false;
        const visualStyle = alertPresentationPolicy?.visualIndicatorStyle || 'standard';

        const criticalCardClasses = hasCritical
          ? visualStyle === 'prominent'
            ? 'border-rose-400 ring-2 ring-rose-300 shadow-sm'
            : visualStyle === 'subtle'
            ? 'border-rose-200 bg-white'
            : 'border-rose-300 ring-1 ring-rose-200'
          : hasAbnormal
          ? 'border-amber-200'
          : 'border-slate-200';

        return (
          <div
            key={report.id}
            id={`lab-report-card-${report.id}`}
            className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${criticalCardClasses}`}
          >
            {/* Report Header Bar */}
            <div
              className={`p-4 flex flex-wrap items-center justify-between gap-3 border-b ${
                hasCritical
                  ? visualStyle === 'prominent'
                    ? 'bg-rose-100/70 border-rose-200'
                    : 'bg-rose-50/70 border-rose-100'
                  : hasAbnormal
                  ? 'bg-amber-50/40 border-amber-100'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleExpand(report.id)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer shadow-2xs"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {report.panelNameAr}
                    </h4>

                    {/* Order Reference Badge */}
                    {report.orderReferenceId && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        طلب: {report.orderReferenceId}
                      </span>
                    )}

                    {/* Critical Status with optional motion policy */}
                    {hasCritical && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 ${
                          isMotionActive ? 'animate-pulse' : ''
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>قيمة حرجة CRITICAL</span>
                      </span>
                    )}

                    {/* Follow-up loop state badge */}
                    {followUpState && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          isFollowUpDone
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>
                          {isFollowUpDone
                            ? 'المتابعة مكتملة ✓'
                            : followUpState === 'communicated_readback_confirmed'
                            ? 'تم إبلاغ الطبيب (Read-Back)'
                            : followUpState === 'clinician_action_planned'
                            ? 'الإجراء جارٍ'
                            : 'بانتظار التواصل والمتابعة'}
                        </span>
                      </span>
                    )}

                    {/* Amended Badge */}
                    {isAmended && (
                      <button
                        onClick={() => onViewAmendments(report)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <History className="w-3 h-3 text-purple-600" />
                        <span>تقرير معدل (نسخة {report.amendments?.[0]?.version || 2})</span>
                      </button>
                    )}

                    {/* Lifecycle Status */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                    <span>العينة: <strong>{report.specimen}</strong></span>
                    <span>•</span>
                    <span>سحبت: <span className="font-mono">{report.collectedAt}</span></span>
                    <span>•</span>
                    <span>النتيجة: <span className="font-mono">{report.resultedAt}</span></span>
                    <span>•</span>
                    <span>{report.performingLab}</span>
                  </div>
                </div>
              </div>

              {/* Review / Acknowledgement & Authority Controls */}
              <div className="flex items-center gap-2">
                {/* Authorized Result Source Actions */}
                {userAuthorityRole === 'source' ? (
                  <button
                    onClick={() => onViewAmendments(report)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>تعديل / تصحيح (Amend/Correct)</span>
                  </button>
                ) : (
                  /* Result Consumer Actions */
                  <>
                    {/* Follow-up Loop Responsibility Trigger Button */}
                    {onOpenFollowUp && (
                      <button
                        onClick={() => onOpenFollowUp(report)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                          isFollowUpDone
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                        title="إسناد مسؤولية المتابعة أو توثيق التواصل السريري وإغلاق حلقة المتابعة"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>
                          {isFollowUpDone ? 'حلقة المتابعة مكتملة' : 'حلقة المتابعة السريرية'}
                        </span>
                      </button>
                    )}

                    {isAcknowledged ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تمت المراجعة: {report.reviewedBy}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAcknowledgeReport(report.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>
                          {report.requiresExplicitAcknowledgement
                            ? 'إقرار استلام النتيجة الحرجة (Formal Acknowledge)'
                            : 'تحديد كتمت المراجعة (Mark Reviewed)'}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => onViewAmendments(report)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="عرض سجل التدقيق أو طلب متابعة"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>سجل التدقيق</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Observations Table */}
            {isExpanded && (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">الفحص المخبري (Observation / Analyte)</th>
                      <th className="py-2.5 px-3 text-center">النتيجة الحالية</th>
                      <th className="py-2.5 px-3 text-center">الوحدة</th>
                      <th className="py-2.5 px-3 text-center">النطاق الطبيعي المرجعي</th>
                      <th className="py-2.5 px-3 text-center">الحالة السريرية</th>
                      <th className="py-2.5 px-3 text-center">التغير عن السابق (Delta)</th>
                      <th className="py-2.5 px-3 text-center">المسار الزمني</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.observations.map((obs, oIdx) => {
                      const isObsCrit = obs.flag === 'critical_high' || obs.flag === 'critical_low';
                      const isObsHigh = obs.flag === 'high';
                      const isObsLow = obs.flag === 'low';

                      return (
                        <tr
                          key={oIdx}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isObsCrit ? 'bg-rose-50/40 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-900 text-xs">{obs.name}</strong>
                                {obs.nameAr && (
                                  <span className="text-slate-500 text-[11px]">({obs.nameAr})</span>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                                {obs.code}
                              </span>
                              {obs.notes && (
                                <p className="text-[11px] text-slate-600 mt-1 max-w-md leading-relaxed">
                                  💡 {obs.notes}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Value */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                                isObsCrit
                                  ? 'bg-rose-600 text-white'
                                  : isObsHigh
                                  ? 'bg-amber-100 text-amber-900 font-bold'
                                  : isObsLow
                                  ? 'bg-blue-100 text-blue-900 font-bold'
                                  : 'text-slate-900'
                              }`}
                            >
                              {obs.value}
                            </span>
                          </td>

                          {/* Unit */}
                          <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                            {obs.unit}
                          </td>

                          {/* Reference Range */}
                          <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                            {obs.referenceRange}
                          </td>

                          {/* Flag Badge */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isObsCrit
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isObsHigh
                                  ? 'bg-amber-100 text-amber-800'
                                  : isObsLow
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isObsCrit ? 'حرج CRITICAL' : isObsHigh ? 'مرتفع HIGH' : isObsLow ? 'منخفض LOW' : 'طبيعي Normal'}
                            </span>
                          </td>

                          {/* Delta Change */}
                          <td className="py-3 px-3 text-center text-[11px]">
                            {obs.deltaCheck ? (
                              <div className="space-y-0.5" title={obs.deltaCheck.configuredInterpretation}>
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    obs.deltaCheck.deltaFlag === 'rapid_change' || obs.deltaCheck.deltaFlag === 'delta_fail'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}>
                                    Δ {obs.deltaCheck.delta}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  السابق: {obs.deltaCheck.previousValue}
                                </span>
                              </div>
                            ) : obs.deltaChange ? (
                              <div className="space-y-0.5">
                                <span className="font-mono font-bold text-rose-700 block">
                                  {obs.deltaChange}
                                </span>
                                {obs.previousValue && (
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    السابق: {obs.previousValue}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono text-[10px]">-</span>
                            )}
                          </td>

                          {/* Interactive Trend Button */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => onOpenTrend(obs.code)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="عرض المسار التراكمي التاريخي"
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                              <span>المسار</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
