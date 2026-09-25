import React from 'react';
import {
  DollarSign,
  FileCheck2,
  AlertTriangle,
  Receipt,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Landmark,
  Scale,
  RefreshCw,
  Users
} from 'lucide-react';
import { RevenueCycleState, RevenueCycleWorkspaceId } from '../../../types/revenueCycle';
import { calculateArAgingSummary } from '../../../utils/revenueCycleEngine';

interface RevenueOverviewWorkspaceProps {
  state: RevenueCycleState;
  onNavigateWorkspace: (ws: RevenueCycleWorkspaceId) => void;
  onFilterPatient: (patientId?: string) => void;
}

export const RevenueOverviewWorkspace: React.FC<RevenueOverviewWorkspaceProps> = ({
  state,
  onNavigateWorkspace,
  onFilterPatient
}) => {
  const agingSummary = calculateArAgingSummary(
    state.invoices,
    state.charges,
    state.creditBalances,
    state.remittances
  );

  const unbilledCharges = state.charges.filter(c => c.billabilityStatus === 'billable' && !c.consumedInInvoiceId);
  const pendingReviewCharges = state.charges.filter(c => c.billingReviewStatus === 'pending_review');
  const openDenials = state.denials.filter(d => d.appealStatus !== 'closed_with_loss');
  const unallocatedRemittances = state.remittances.filter(r => r.unallocatedRemainderSar > 0);
  const activeCreditBalances = state.creditBalances.filter(c => c.workflowStatus !== 'refund_completed_evidence');

  return (
    <div className="space-y-6">
      {/* SYNTHETIC LIVE PREVIEW BADGE */}
      <div className="flex items-center justify-between bg-slate-100/80 border border-slate-200 px-4 py-2 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>مؤشرات دورة الإيرادات (SYNTHETIC LIVE PREVIEW — مشتقة من حالة النموذج التجريبي)</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          نموذج تفاعلي متزامن مع بيانات العرض (Front-end Shared State)
        </span>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receivables */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الذمم المدينة القائمة</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {agingSummary.totalReceivables.totalSar.toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>مرضى: <strong className="font-mono text-slate-700">{agingSummary.patientAr.totalSar.toLocaleString()}</strong></span>
              <span>تأمين: <strong className="font-mono text-slate-700">{agingSummary.insurancePayerAr.totalSar.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Unbilled Eligible Charges */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-teal-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">رسوم معتمدة جاهزة للفوترة</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-700 font-mono">
              {agingSummary.unbilledEligibleChargesSar.toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>عدد البنود: <strong className="font-mono text-slate-700">{unbilledCharges.length}</strong></span>
              <button
                onClick={() => onNavigateWorkspace('charge_capture_review')}
                className="text-teal-600 hover:text-teal-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>مراجعة</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Open Insurance Denials */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-red-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">رفوضات التأمين قيد الاعتراض</span>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-600 font-mono">
              {openDenials.reduce((acc, d) => acc + d.deniedAmountSar, 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span className="text-red-700 font-semibold">{openDenials.length} مطالبات معترضة</span>
              <button
                onClick={() => onNavigateWorkspace('denials_appeals')}
                className="text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>متابعة</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Unallocated Remittances */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">تحويلات بنكية بانتظار التخصيص</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-700 font-mono">
              {agingSummary.unallocatedRemittancesSar.toLocaleString()} <span className="text-sm font-normal text-slate-500">ر.س</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>{unallocatedRemittances.length} إشعار تحويل ERA</span>
              <button
                onClick={() => onNavigateWorkspace('remittance_allocation')}
                className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>تخصيص</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Worklists & Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Charge Approvals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">مراجعة واعتماد الرسوم غير المفوترة (Charge Capture Review)</h3>
            </div>
            <button
              onClick={() => onNavigateWorkspace('charge_capture_review')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              عرض الكل ({state.charges.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {state.charges.slice(0, 4).map(chg => (
              <div key={chg.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{chg.serviceNameAr}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-slate-600">{chg.serviceCode}</span>
                    <span>•</span>
                    <span>{chg.patientNameAr}</span>
                    <span>•</span>
                    <span>{chg.departmentAr}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-mono font-bold text-slate-900">{chg.totalWithTaxSar.toLocaleString()} ر.س</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      chg.billabilityStatus === 'already_billed'
                        ? 'bg-slate-100 text-slate-700'
                        : chg.billabilityStatus === 'billable'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {chg.billabilityStatus === 'already_billed'
                      ? 'مفوتر مسبقاً'
                      : chg.billabilityStatus === 'billable'
                      ? 'معتمد للفوترة'
                      : 'قيد التدقيق السريري'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Insurance Claims */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-slate-800 text-sm">مطالبات التأمين النشطة ومنصة نفيس (Active Claims Worklist)</h3>
            </div>
            <button
              onClick={() => onNavigateWorkspace('claims_payer')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              عرض الكل ({state.claims.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {state.claims.map(clm => (
              <div key={clm.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{clm.payerNameAr}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-blue-600 font-bold">{clm.claimNumber}</span>
                    <span>•</span>
                    <span>{clm.patientNameAr}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-mono font-bold text-slate-900">{clm.totalClaimedSar.toLocaleString()} ر.س</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      clm.lifecycleStatus === 'adjudication_complete'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : clm.lifecycleStatus === 'adjudication_partial'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {clm.lifecycleStatus === 'adjudication_complete'
                      ? 'مكتمل البت المالي'
                      : clm.lifecycleStatus === 'adjudication_partial'
                      ? 'موافقة جزئية (معترضة)'
                      : clm.lifecycleStatus === 'acknowledged_technical'
                      ? 'إشعار تقني (Ack 200)'
                      : 'جاهز للإرسال'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AR Aging Quick Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-sm">توزيع أعمار الذمم المدينة الحالية (AR Aging Distribution)</h3>
          </div>
          <button
            onClick={() => onNavigateWorkspace('ar_aging_reporting')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
          >
            تقرير الذمم التفصيلي
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="text-[11px] font-bold text-emerald-800">حالية (0 - 30 يوماً)</div>
            <div className="text-lg font-black text-emerald-900 font-mono mt-1">
              {agingSummary.totalReceivables.currentSar.toLocaleString()} ر.س
            </div>
            <div className="text-[10px] text-emerald-700 mt-1">استحقاق طبيعي</div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-[11px] font-bold text-blue-800">31 - 60 يوماً</div>
            <div className="text-lg font-black text-blue-900 font-mono mt-1">
              {agingSummary.totalReceivables.days31To60Sar.toLocaleString()} ر.س
            </div>
            <div className="text-[10px] text-blue-700 mt-1">متابعة الدفعات</div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-[11px] font-bold text-amber-800">61 - 90 يوماً</div>
            <div className="text-lg font-black text-amber-900 font-mono mt-1">
              {agingSummary.totalReceivables.days61To90Sar.toLocaleString()} ر.س
            </div>
            <div className="text-[10px] text-amber-700 mt-1">إنذار تحصيل أول</div>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-[11px] font-bold text-red-800">أكثر من 90 يوماً</div>
            <div className="text-lg font-black text-red-900 font-mono mt-1">
              {agingSummary.totalReceivables.days91PlusSar.toLocaleString()} ر.س
            </div>
            <div className="text-[10px] text-red-700 mt-1">متأخرات حرجة</div>
          </div>
        </div>
      </div>
    </div>
  );
};
