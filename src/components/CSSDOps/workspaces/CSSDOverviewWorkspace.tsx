import React from 'react';
import {
  Inbox,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
  PackageCheck,
  Search,
  AlertTriangle,
  History,
  Activity,
  ArrowRight,
  ShieldAlert,
  Clock,
  Building,
  CheckSquare
} from 'lucide-react';
import { CSSDOpsState, CSSDWorkspaceId } from '../../../types/cssdOps';

interface CSSDOverviewWorkspaceProps {
  state: CSSDOpsState;
  onNavigateWorkspace: (wsId: CSSDWorkspaceId) => void;
}

export const CSSDOverviewWorkspace: React.FC<CSSDOverviewWorkspaceProps> = ({
  state,
  onNavigateWorkspace
}) => {
  // Real derived counts (no hardcoded fake KPIs)
  const pendingReceiptCount = state.contaminatedReturns.filter(
    r => r.receiptStatus === 'returned_pending_receipt' || r.receiptStatus === 'received_with_discrepancy'
  ).length;

  const inDeconCleaningCount = state.setInstances.filter(
    s => s.currentZoningArea === 'dirty_decontamination' && s.decontaminationStatus !== 'cleaning_passed'
  ).length;

  const inInspectionCount = state.setInstances.filter(
    s => s.currentZoningArea === 'clean_inspection_assembly' && s.inspectionStatus === 'pending_inspection'
  ).length;

  const incompleteSetsCount = state.setInstances.filter(
    s => s.assemblyStatus === 'set_incomplete_missing_parts'
  ).length;

  const awaitingSterilizationCount = state.packages.filter(
    p => p.currentStatus === 'packaged_pending_load'
  ).length;

  const cyclesRunningCount = state.sterilizerCycles.filter(
    c => c.cycleStatus === 'cycle_running_simulation'
  ).length;

  const loadsAwaitingReleaseCount = state.sterilizerCycles.filter(
    c => c.cycleStatus === 'monitoring_pending' || c.cycleStatus === 'release_review'
  ).length;

  const loadsOnHoldCount = state.sterilizerCycles.filter(
    c => c.cycleStatus === 'held' || c.cycleStatus === 'quarantined'
  ).length;

  const releasedSterileCount = state.packages.filter(
    p => p.currentStatus === 'released_sterile' && p.storageIntegrity === 'intact_sterile'
  ).length;

  const caseShortageCount = state.distributionRequests.filter(
    d => d.allocatedPackageIds.length === 0 && d.status === 'requested'
  ).length;

  const openExceptionsCount = state.qualityExceptions.filter(
    e => e.status === 'open_action_required'
  ).length;

  const activeRecallsCount = state.recallCases.filter(
    r => r.status === 'active_investigation' || r.status === 'quarantine_enforced'
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Live Derived Operational KPIs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateWorkspace('dirty_receipt_decon')}
          className="bg-white p-3.5 rounded-xl border border-red-200/80 hover:border-red-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-red-600 font-bold mb-1">
            <span>استلام عوادم ملوثة</span>
            <Inbox className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{pendingReceiptCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">بانتظار الفرز والعد والمطابقة</span>
        </div>

        <div
          onClick={() => onNavigateWorkspace('cleaning_inspection')}
          className="bg-white p-3.5 rounded-xl border border-amber-200/80 hover:border-amber-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold mb-1">
            <span>غسيل وفحص الأجهزة</span>
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {inDeconCleaningCount + inInspectionCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            غسيل: {inDeconCleaningCount} • فحص: {inInspectionCount}
          </span>
        </div>

        <div
          onClick={() => onNavigateWorkspace('assembly_packaging')}
          className="bg-white p-3.5 rounded-xl border border-blue-200/80 hover:border-blue-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold mb-1">
            <span>تجهيز وحزم الأطقم</span>
            <Layers className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{awaitingSterilizationCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {incompleteSetsCount > 0 ? (
              <strong className="text-red-600">نقص بأطقم: {incompleteSetsCount}</strong>
            ) : (
              'جاهز للتحميل بالمعقم'
            )}
          </span>
        </div>

        <div
          onClick={() => onNavigateWorkspace('sterilization_loads')}
          className="bg-white p-3.5 rounded-xl border border-indigo-200/80 hover:border-indigo-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1">
            <span>شحنات المعقمات</span>
            <Flame className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {state.sterilizerCycles.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            جارية: {cyclesRunningCount} • مراجعة: {loadsAwaitingReleaseCount}
          </span>
        </div>

        <div
          onClick={() => onNavigateWorkspace('load_release_quality')}
          className="bg-white p-3.5 rounded-xl border border-purple-200/80 hover:border-purple-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
            <span>الإفراج والرقابة الحيوية</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{loadsAwaitingReleaseCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {loadsOnHoldCount > 0 ? (
              <strong className="text-amber-600">شحنات محجوزة: {loadsOnHoldCount}</strong>
            ) : (
              'بانتظار قراءة الحواضن'
            )}
          </span>
        </div>

        <div
          onClick={() => onNavigateWorkspace('sterile_storage_distribution')}
          className="bg-white p-3.5 rounded-xl border border-emerald-200/80 hover:border-emerald-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
            <span>المستودع المعقم والتوزيع</span>
            <PackageCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{releasedSterileCount}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {caseShortageCount > 0 ? (
              <strong className="text-red-600">عجز طلبات: {caseShortageCount}</strong>
            ) : (
              'جاهزة للتسليم للعمليات'
            )}
          </span>
        </div>
      </div>

      {/* 2. Visual Operational Zoning Flow (Anti-Reverse Flow Banner) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              مسار تدفق التعقيم أحادي الاتجاه (Unidirectional CSSD Zoning Flow per WHO / SFDA)
            </h3>
          </div>
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">
            محظور التدفق العكسي دون رفض وإعادة تطهير
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
            <span className="text-[10px] font-black text-red-700 block">المنطقة الحمراء (1)</span>
            <div className="font-bold text-red-950 mt-1">الاستلام الملوث والتطهير</div>
            <span className="text-[10px] text-red-600 mt-1 block">ضغط سلبي • غسيل ميكانيكي</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <span className="text-[10px] font-black text-amber-700 block">المنطقة النظيفة (2)</span>
            <div className="font-bold text-amber-950 mt-1">الفحص المجهري والاختبار</div>
            <span className="text-[10px] text-amber-600 mt-1 block">فحص المفصلات والعزل والمجاري</span>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
            <span className="text-[10px] font-black text-blue-700 block">منطقة التجهيز (3)</span>
            <div className="font-bold text-blue-950 mt-1">تجميع الأطقم والتغليف</div>
            <span className="text-[10px] text-blue-600 mt-1 block">مؤشرات داخلية Class 5 • حاويات</span>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg">
            <span className="text-[10px] font-black text-indigo-700 block">منطقة المعقمات (4)</span>
            <div className="font-bold text-indigo-950 mt-1">التعقيم البخاري والبلازما</div>
            <span className="text-[10px] text-indigo-600 mt-1 block">تفريغ هواء 134°C • مراقبة حيوية</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-black text-emerald-700 block">المنطقة الخضراء (5)</span>
            <div className="font-bold text-emerald-950 mt-1">المستودع المعقم والتوزيع</div>
            <span className="text-[10px] text-emerald-600 mt-1 block">ضغط إيجابي • تسليم صواني العمليات</span>
          </div>
        </div>
      </div>

      {/* 3. Actionable Worklists Grid: Critical Exceptions & High Priority OR Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quality Exceptions Worklist */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h4 className="font-bold text-xs text-slate-800">
                سجل الاستثناءات وموانع الأمان المفتوحة ({openExceptionsCount})
              </h4>
            </div>
            <button
              onClick={() => onNavigateWorkspace('recall_exceptions')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              عرض الكل ←
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {state.qualityExceptions.map(exc => (
              <div key={exc.id} className="p-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                          exc.severity === 'critical_safety_block'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {exc.severity === 'critical_safety_block' ? 'حظر أمان قاطع' : 'أولوية تشغيلية'}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{exc.descriptionAr}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                      <span>المرجع: <strong className="font-mono text-slate-700">{exc.sourceReference}</strong></span>
                      <span>الكاشف: {exc.detectedBy}</span>
                      <span>الوقت: {exc.detectedTimestamp}</span>
                    </div>
                  </div>
                  {exc.quarantineApplied && (
                    <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-bold shrink-0">
                      قيد الحجز والعزل
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Surgical Case Set Readiness Radar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-xs text-slate-800">
                رادار جاهزية أطقم جراحات اليوم بمساحر العمليات (OR Case Sets)
              </h4>
            </div>
            <button
              onClick={() => onNavigateWorkspace('sterile_storage_distribution')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              إدارة التوزيع ←
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {state.distributionRequests.map(dist => (
              <div key={dist.id} className="p-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-800">{dist.id}</span>
                      <span className="font-bold text-xs text-slate-900">{dist.destinationDepartment}</span>
                      {dist.orCaseReference && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded text-[10px] font-mono">
                          {dist.orCaseReference}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      موعد الحاجة: <strong className="font-mono text-slate-700">{dist.requiredByTime}</strong>
                      {dist.notes && <span className="mr-2 text-slate-400">({dist.notes})</span>}
                    </div>
                  </div>

                  <div>
                    {dist.allocatedPackageIds.length > 0 ? (
                      <span className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg font-bold">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مخصص ومسلّم</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded-lg font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>عجز طقم جراحي</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
