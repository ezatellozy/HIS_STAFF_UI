import React from 'react';
import {
  Landmark,
  FileCheck2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Scale,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  Coins
} from 'lucide-react';
import { TreasuryState } from '../../types/treasury';
import { calculateTreasuryLiquidity } from '../../utils/treasuryEngine';

interface TreasuryOverviewDashboardProps {
  state: TreasuryState;
  onNavigate: (tabId: string) => void;
}

export const TreasuryOverviewDashboard: React.FC<TreasuryOverviewDashboardProps> = ({
  state,
  onNavigate
}) => {
  const liquidity = calculateTreasuryLiquidity(state);
  const sarLiquidity = liquidity.find(l => l.currency === 'SAR');
  const usdLiquidity = liquidity.find(l => l.currency === 'USD');

  // Counts & aggregations
  const pendingAuthsCount = state.authorizations.filter(
    a => a.status === 'pending_review' || a.status === 'under_dual_review'
  ).length;
  const pendingAuthsAmount = state.authorizations
    .filter(a => a.status === 'pending_review' || a.status === 'under_dual_review')
    .reduce((sum, a) => sum + a.proposedAmount, 0);

  const inFlightInstructionsCount = state.instructions.filter(
    i => i.status === 'simulated_external_submitted' || i.status === 'authorized_pending_release' || i.status === 'bank_accepted'
  ).length;

  const confirmedInstructionsCount = state.instructions.filter(
    i => i.status === 'bank_confirmed'
  ).length;
  const confirmedInstructionsAmount = state.instructions
    .filter(i => i.status === 'bank_confirmed')
    .reduce((sum, i) => sum + i.confirmedAmount, 0);

  const unreconciledLinesCount = state.statements.reduce(
    (sum, stmt) => sum + stmt.lines.filter(l => l.matchStatus === 'unmatched').length,
    0
  );

  const pendingDepositsCount = state.custodyRecords.filter(
    r => r.stage === 'cash_handed_over' || r.stage === 'cash_counted'
  ).length;

  const openExceptionsCount = state.exceptions.filter(
    e => e.status === 'open_investigation' || e.status === 'action_proposed'
  ).length;

  return (
    <div id="treasury-overview-dashboard" className="space-y-6">
      {/* SECTION 1: TOP EXECUTIVE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Authorizations */}
        <div
          id="kpi-pending-authorizations"
          onClick={() => onNavigate('authorizations')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">تراخيص الصرف المعلقة</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-baseline gap-2">
              <span>{pendingAuthsCount}</span>
              <span className="text-xs font-normal text-neutral-500">طلب قيد المراجعة</span>
            </div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
              إجمالي القيمة: {pendingAuthsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
            </div>
          </div>
        </div>

        {/* Card 2: In-Flight Payment Instructions */}
        <div
          id="kpi-inflight-instructions"
          onClick={() => onNavigate('instructions')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">أوامر دفع بانتظار إشعار البنك</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-baseline gap-2">
              <span>{inFlightInstructionsCount}</span>
              <span className="text-xs font-normal text-neutral-500">أمر صادر عبر سريع</span>
            </div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">
              {confirmedInstructionsCount} أمر مؤكد السداد بنجاح
            </div>
          </div>
        </div>

        {/* Card 3: Unreconciled Bank Lines */}
        <div
          id="kpi-unreconciled-lines"
          onClick={() => onNavigate('reconciliation')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">أسطر كشف الحساب غير المطابقة</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-baseline gap-2">
              <span>{unreconciledLinesCount}</span>
              <span className="text-xs font-normal text-neutral-500">حركة بنكية معلقة</span>
            </div>
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">
              تتضمن رسوم بنكية واكتشافات تحتاج قيد دفتري
            </div>
          </div>
        </div>

        {/* Card 4: Open Treasury Exceptions */}
        <div
          id="kpi-open-exceptions"
          onClick={() => onNavigate('reconciliation')}
          className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">الفروقات والاستثناءات النشطة</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 flex items-baseline gap-2">
              <span>{openExceptionsCount}</span>
              <span className="text-xs font-normal text-neutral-500">استثناء مفتوح</span>
            </div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              عجز عهدة نقدية + فروق بنكية
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MULTI-CURRENCY LIQUIDITY VISIBILITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SAR Liquidity Snapshot */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                SAR
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">سيولة الريال السعودي (SAR)</h3>
                <p className="text-xs text-neutral-500">حساب العمليات SNB + حساب الرواتب بنك الرياض + عهد النقد</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('liquidity_reports')}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>تفاصيل السيولة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-50 dark:border-neutral-800/60">
              <span className="text-neutral-600 dark:text-neutral-400">الرصيد الفعلي حسب كشوف الحسابات البنكية:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                {sarLiquidity?.bankReportedBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-50 dark:border-neutral-800/60">
              <span className="text-neutral-600 dark:text-neutral-400">مدفوعات قيد التنفيذ (معتمدة لم تُسحب بعد):</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                - {sarLiquidity?.pendingOutflowsSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-50 dark:border-neutral-800/60">
              <span className="text-neutral-600 dark:text-neutral-400">مقبوضات نقدية مستلمة (بانتظار وصول الحساب البنكي):</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                + {sarLiquidity?.expectedInflowsSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-50 dark:border-neutral-800/60">
              <span className="text-neutral-600 dark:text-neutral-400">عهدة نقدية مقيدة ومخصصة للفكة (Float Reserve):</span>
              <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                {sarLiquidity?.restrictedFloatBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">صافي النقد التشغيلي المتاح (المحاكى):</span>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400">Available Demo Operating Cash</span>
              </div>
              <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                {sarLiquidity?.demoAvailableCashSar.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* USD Foreign Currency Account */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                USD
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">حساب الدولار الأمريكي للاستيراد (USD)</h3>
                <p className="text-xs text-neutral-500">حساب مصرف الإنماء للاعتمادات المستندية والأجهزة الطبية</p>
              </div>
            </div>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              حساب نقد أجنبي منفصل
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200/70 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>سياسة حظر الدمج العشوائي للعملات</span>
              </div>
              وفق ضوابط حوكمة الخزينة الطبية، لا يتم جمع أرصدة الدولار الأمريكي مع الريال السعودي في مجموع موحد دون عقد صرف آجل أو اعتماد سعر إقفال نظامي رسمي معتمد (FX Rate).
            </div>

            <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-600 dark:text-neutral-400">الرصيد المتاح بالحساب البنكي:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                $ 125,400.00 USD
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-600 dark:text-neutral-400">حالة المطابقة مع دفتر الأستاذ العام:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> مطابق حتى آخر إقفال شهري
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT ACTIVITY & QUICK WORKSPACE LAUNCHERS */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span>مسار العمليات التشغيلية للخزينة (Operational Execution Pipeline)</span>
          </h3>
          <span className="text-xs text-neutral-500">مراحل التدفق اليومي</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Step 1: Bank Directory */}
          <button
            onClick={() => onNavigate('accounts')}
            className="text-right p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <div className="text-[11px] font-semibold text-neutral-400 mb-1">01. الحسابات</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">دليل البنوك والصناديق</div>
            <div className="text-[10px] text-neutral-500 mt-1">{state.accounts.length} حسابات نشطة</div>
          </button>

          {/* Step 2: Authorizations */}
          <button
            onClick={() => onNavigate('authorizations')}
            className="text-right p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <div className="text-[11px] font-semibold text-neutral-400 mb-1">02. التفويض</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">اعتماد مقترحات AP</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">{pendingAuthsCount} بانتظار التفويض</div>
          </button>

          {/* Step 3: Instructions */}
          <button
            onClick={() => onNavigate('instructions')}
            className="text-right p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <div className="text-[11px] font-semibold text-neutral-400 mb-1">03. أوامر الصرف</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">أوامر سريع SARIE</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{inFlightInstructionsCount} قيد الإرسال</div>
          </button>

          {/* Step 4: Deposits */}
          <button
            onClick={() => onNavigate('deposits')}
            className="text-right p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <div className="text-[11px] font-semibold text-neutral-400 mb-1">04. المقبوضات</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">الإيداعات والعهد</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">{pendingDepositsCount} تسليمات كاشير</div>
          </button>

          {/* Step 5: Statements */}
          <button
            onClick={() => onNavigate('statements')}
            className="text-right p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <div className="text-[11px] font-semibold text-neutral-400 mb-1">05. كشوف الحساب</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">camt.053 / MT940</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">{state.statements.length} كشوف مدققة</div>
          </button>

          {/* Step 6: Reconciliation */}
          <button
            onClick={() => onNavigate('reconciliation')}
            className="text-right p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <div className="text-[11px] font-semibold text-neutral-400 mb-1">06. التسويات</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">المطابقة والاستثناءات</div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">{openExceptionsCount} استثناءات</div>
          </button>
        </div>
      </div>
    </div>
  );
};
