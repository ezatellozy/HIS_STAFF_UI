import React from 'react';
import { 
  Building2, 
  BookOpen, 
  FileText, 
  Scale, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Calendar, 
  Layers,
  ArrowRightLeft,
  Clock,
  Sparkles,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { 
  GeneralLedgerState, 
  TrialBalanceSummary, 
  PeriodCloseChecklist,
  AccountCategory
} from '../../types/generalLedger';

interface GlOverviewDashboardProps {
  glState: GeneralLedgerState;
  trialBalance: TrialBalanceSummary;
  closeChecklist: PeriodCloseChecklist;
  onNavigateToTab: (tabId: string) => void;
  onOpenCreateJournal: () => void;
  onOpenCreateAccount: () => void;
  onSelectVoucher: (voucherId: string) => void;
}

export const GlOverviewDashboard: React.FC<GlOverviewDashboardProps> = ({
  glState,
  trialBalance,
  closeChecklist,
  onNavigateToTab,
  onOpenCreateJournal,
  onOpenCreateAccount,
  onSelectVoucher
}) => {
  const leafAccounts = glState.accounts.filter(a => a.accountType === 'posting');
  const activeLeafAccounts = leafAccounts.filter(a => a.state === 'active');
  const draftJournals = glState.journals.filter(j => j.status === 'draft' || j.status === 'validated');
  const underApprovalJournals = glState.journals.filter(j => j.status === 'under_approval');
  const postedVouchers = glState.postedVouchers;
  const pendingSourceEvents = glState.sourceEvents.filter(e => e.mappingStatus === 'READY_FOR_SIMULATION');
  const unmappedSourceEvents = glState.sourceEvents.filter(e => e.mappingStatus === 'UNMAPPED_ACCOUNT');
  const discrepancies = glState.reconciliationRecords.filter(r => r.status === 'discrepancy' || r.status === 'missing_valuation');

  const categories: { key: AccountCategory; nameAr: string; normal: string; color: string }[] = [
    { key: 'asset', nameAr: 'الأصول (Assets)', normal: 'مدين (Debit)', color: 'text-blue-400 border-blue-800/40 bg-blue-950/20' },
    { key: 'liability', nameAr: 'الالتزامات (Liabilities)', normal: 'دائن (Credit)', color: 'text-amber-400 border-amber-800/40 bg-amber-950/20' },
    { key: 'equity', nameAr: 'حقوق الملكية (Equity)', normal: 'دائن (Credit)', color: 'text-purple-400 border-purple-800/40 bg-purple-950/20' },
    { key: 'revenue', nameAr: 'الإيرادات (Revenues)', normal: 'دائن (Credit)', color: 'text-emerald-400 border-emerald-800/40 bg-emerald-950/20' },
    { key: 'expense', nameAr: 'المصروفات (Expenses)', normal: 'مدين (Debit)', color: 'text-rose-400 border-rose-800/40 bg-rose-950/20' },
  ];

  return (
    <div id="gl-overview-dashboard" className="space-y-6">
      
      {/* Top Welcome & Entity Identity Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {glState.ledgerProfile.accountingEntity.legalNameAr}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                {glState.ledgerProfile.applicableFramework}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              العملة الوظيفية وعملة العرض: <span className="font-bold text-slate-200">ريال سعودي (SAR)</span> • السنة المالية النشطة: <span className="font-bold text-slate-200">2026</span> • الفترة الحالية: <span className="font-bold text-blue-400">{glState.activePeriodId}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="gl-action-create-journal"
              onClick={onOpenCreateJournal}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>إنشاء قيد يومية جديد</span>
            </button>
            <button
              id="gl-action-create-account"
              onClick={onOpenCreateAccount}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>إضافة حساب بالدليل</span>
            </button>
            <button
              id="gl-action-view-tb"
              onClick={() => onNavigateToTab('trial_balance')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>فحص ميزان المراجعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trial Balance Health Highlight */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        trialBalance.status === 'VERIFIED_BALANCED'
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          : trialBalance.status === 'UNBALANCED_EXCEPTION'
          ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          {trialBalance.status === 'VERIFIED_BALANCED' ? (
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="font-bold text-sm">
              حالة ميزان المراجعة المحاسبي (Trial Balance Verification)
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {trialBalance.status === 'VERIFIED_BALANCED' && 'متوازن حسابياً بصورة تامة (إجمالي المدين = إجمالي الدائن).'}
              {trialBalance.status === 'UNBALANCED_EXCEPTION' && `يوجد عدم توازن حسابي بمقدار ${trialBalance.netDebitCreditDifferenceSar.toLocaleString()} ر.س.`}
              {trialBalance.status === 'NOT_VERIFIED_INCOMPLETE_DATA' && 'لم يتم التحقق بسبب عدم اكتمال أرصدة أول المدة.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="opacity-75">إجمالي المدين:</span>{' '}
            <span className="font-bold">{trialBalance.totalClosingDebitSar.toLocaleString()} ر.س</span>
          </div>
          <div>
            <span className="opacity-75">إجمالي الدائن:</span>{' '}
            <span className="font-bold">{trialBalance.totalClosingCreditSar.toLocaleString()} ر.س</span>
          </div>
          <button
            onClick={() => onNavigateToTab('trial_balance')}
            className="px-3 py-1 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-700 text-xs font-sans font-bold cursor-pointer transition-colors"
          >
            استعراض التفاصيل &larr;
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Leaf Accounts */}
        <div 
          onClick={() => onNavigateToTab('coa')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>حسابات القيد النشطة (Posting)</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {activeLeafAccounts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            من أصل {glState.accounts.length} حساب بالدليل (بما فيها المجموعات)
          </div>
        </div>

        {/* Draft & Pending Journals */}
        <div 
          onClick={() => onNavigateToTab('journals')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>قيود بانتظار الاعتماد والترحيل</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {draftJournals.length + underApprovalJournals.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {underApprovalJournals.length} قيد تحت الاعتماد • {draftJournals.length} مسودة
          </div>
        </div>

        {/* Posted Vouchers */}
        <div 
          onClick={() => onNavigateToTab('journals')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>سندات القيد المرحلة (Vouchers)</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {postedVouchers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            سندات قيد تاريخية محصنة غير قابلة للتعديل
          </div>
        </div>

        {/* Period Close Readiness */}
        <div 
          onClick={() => onNavigateToTab('calendars')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>جاهزية إقفال الفترة {glState.activePeriodId}</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold mt-2 flex items-center gap-1.5">
            {closeChecklist.overallReadiness === 'ready_for_simulated_close' ? (
              <span className="text-emerald-400">جاهزة للإقفال</span>
            ) : (
              <span className="text-rose-400">معلقة بسبب استثناءات ({closeChecklist.blockingIssuesListAr.length})</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            فحص قائمة التحقق المالي والرقابي &larr;
          </div>
        </div>

      </div>

      {/* Account Categories Distribution Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">تصنيفات الدليل المحاسبي الرئيسية (COA Categories)</h3>
            <p className="text-xs text-slate-400">توزيع الحسابات والأرصدة الطبيعية وقواعد القيد المزدوج</p>
          </div>
          <button
            onClick={() => onNavigateToTab('coa')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض شجرة الحسابات الكاملة</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categories.map(cat => {
            const count = glState.accounts.filter(a => a.category === cat.key).length;
            const leafCount = glState.accounts.filter(a => a.category === cat.key && a.accountType === 'posting').length;

            return (
              <div key={cat.key} className={`border rounded-lg p-3.5 ${cat.color}`}>
                <div className="text-xs font-bold">{cat.nameAr}</div>
                <div className="text-[11px] text-slate-300 mt-1">
                  طبيعة الحساب: <span className="font-bold">{cat.normal}</span>
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-xl font-bold font-mono text-white">{leafCount}</span>
                  <span className="text-[10px] text-slate-400">{count} إجمالي</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Vouchers & Operational Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Vouchers (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">سندات القيد المرحلة حديثاً (Recent General Ledger Vouchers)</h3>
              <p className="text-xs text-slate-400">سجل القيود المحاسبية المرحلة بدفتر اليومية العامة</p>
            </div>
            <button
              onClick={() => onNavigateToTab('journals')}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
            >
              عرض الكل ({postedVouchers.length}) &larr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">رقم السند</th>
                  <th className="pb-2 font-medium">تاريخ القيد</th>
                  <th className="pb-2 font-medium">الفترة</th>
                  <th className="pb-2 font-medium">البيان المحاسبي</th>
                  <th className="pb-2 font-medium">إجمالي القيد (SAR)</th>
                  <th className="pb-2 font-medium">الحالة</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {postedVouchers.slice(0, 5).map(v => (
                  <tr key={v.voucherId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-bold text-emerald-400">{v.voucherNumber}</td>
                    <td className="py-2.5 text-slate-300">{v.accountingDate}</td>
                    <td className="py-2.5 text-blue-300">{v.periodId}</td>
                    <td className="py-2.5 font-sans text-slate-200 truncate max-w-[200px]">{v.descriptionAr}</td>
                    <td className="py-2.5 font-bold text-white">{v.totalDebitSar.toLocaleString()}</td>
                    <td className="py-2.5">
                      {v.isReversed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-sans">
                          معكوس
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-sans">
                          مرحل نهائي
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-left">
                      <button
                        onClick={() => onSelectVoucher(v.voucherId)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-[11px] cursor-pointer"
                      >
                        معاينة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Attention & Reconciliations (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">تنبيهات المطابقة والأنظمة المصدرية</h3>
            <p className="text-xs text-slate-400">حالة الربط مع المشتريات، الحسابات الدائنة، والمخزون</p>
          </div>

          {/* Pending Source Events */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">أحداث مصدرية جاهزة للمحاكاة:</span>
              <span className="font-mono font-bold text-emerald-400">{pendingSourceEvents.length}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              فواتير AP وسندات استلام بانتظار توليد القيود بدفتر الأستاذ.
            </p>
            <button
              onClick={() => onNavigateToTab('source_events')}
              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-bold block cursor-pointer"
            >
              استعراض أحداث المصادر &larr;
            </button>
          </div>

          {/* Unmapped Source Events */}
          {unmappedSourceEvents.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">أحداث بدون توجيه محاسبي:</span>
                <span className="font-mono font-bold text-amber-400">{unmappedSourceEvents.length}</span>
              </div>
              <p className="text-[11px] text-amber-200/80 mt-1">
                تتطلب ربط الحساب المستهدف قبل السماح بالترحيل المحاكى.
              </p>
            </div>
          )}

          {/* Reconciliation Discrepancies */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">فروقات مطابقة الأستاذ الفرعي:</span>
              <span className="font-mono font-bold text-rose-400">{discrepancies.length}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              إفصاح أمين عن فروقات تقييم المخزون وتسوية البنك.
            </p>
            <button
              onClick={() => onNavigateToTab('reconciliations')}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-bold block cursor-pointer"
            >
              مطابقة الحسابات الرقابية &larr;
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
