import React from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  ArrowUpRight, 
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Scale
} from 'lucide-react';
import { SupplierInvoice, PaymentProposalBatch, SupplierCreditNote, PrepaymentRecord } from '../../types/accountsPayable';
import { computeApAging } from '../../utils/accountsPayableEngine';

interface ApOverviewDashboardProps {
  invoices: SupplierInvoice[];
  batches: PaymentProposalBatch[];
  creditNotes: SupplierCreditNote[];
  prepayments: PrepaymentRecord[];
  effectiveDate: string;
  onNavigateToTab: (tabId: string) => void;
  onOpenInvoiceDetail: (invoiceId: string) => void;
}

export const ApOverviewDashboard: React.FC<ApOverviewDashboardProps> = ({
  invoices,
  batches,
  creditNotes,
  prepayments,
  effectiveDate,
  onNavigateToTab,
  onOpenInvoiceDetail
}) => {
  const aging = computeApAging(invoices, effectiveDate);

  const activeHoldsCount = invoices.reduce((acc, inv) => acc + inv.activeHolds.filter(h => !h.isResolved).length, 0);
  const unpostedInvoicesCount = invoices.filter(inv => inv.approvalStatus === 'approved' && inv.postingStatus === 'unposted').length;
  const readyForPaymentCount = invoices.filter(inv => inv.settlementStatus === 'eligible').length;
  const readyForPaymentTotalSar = invoices
    .filter(inv => inv.settlementStatus === 'eligible')
    .reduce((acc, inv) => acc + inv.remainingPayableBalanceSar, 0);

  const pendingBatchesCount = batches.filter(b => b.status === 'draft_proposal' || b.status === 'submitted_for_treasury_approval').length;
  const unappliedCreditsTotalSar = creditNotes.reduce((acc, c) => acc + c.remainingUnappliedAmountSar, 0);
  const unappliedAdvancesTotalSar = prepayments.reduce((acc, p) => acc + p.unappliedBalanceSar, 0);

  return (
    <div id="ap-overview-dashboard" className="space-y-6">
      
      {/* Top Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Outstanding AP */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">إجمالي التزامات الموردين المستحقة</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {(aging.totalOutstandingPayableSar ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-medium">ريال سعودي</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>عبر</span>
            <span className="font-bold text-slate-300 font-mono">{aging.totalInvoicesCount}</span>
            <span>فاتورة مسجلة بالسجلات التشغيلية</span>
          </div>
        </div>

        {/* Metric 2: Ready for Payment Proposal */}
        <div 
          onClick={() => onNavigateToTab('payments')}
          className="bg-slate-900/90 border border-emerald-800/40 rounded-xl p-4 shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-medium">جاهزة لمقترحات السداد (Eligible)</span>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-200">
              {(readyForPaymentTotalSar ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-medium">ريال سعودي</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80 flex items-center justify-between">
            <span>{readyForPaymentCount} فواتير معتمدة ومطابقة</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 3: Active Exceptions & Holds */}
        <div 
          onClick={() => onNavigateToTab('exceptions')}
          className="bg-slate-900/90 border border-amber-800/40 rounded-xl p-4 shadow-sm hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-medium">حجوزات وفروقات معلقة (Holds)</span>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-200">
              {activeHoldsCount}
            </span>
            <span className="text-xs text-amber-400 font-medium">حجز رقابي نشط</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400/80 flex items-center justify-between">
            <span>تتطلب مراجعة أو تسوية</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 4: Unapplied Credits & Advances */}
        <div 
          onClick={() => onNavigateToTab('credits')}
          className="bg-slate-900/90 border border-indigo-800/40 rounded-xl p-4 shadow-sm hover:border-indigo-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-300 font-medium">إشعارات دائنة ودفعات مقدمة متاحة</span>
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-200">
              {((unappliedCreditsTotalSar || 0) + (unappliedAdvancesTotalSar || 0)).toLocaleString()}
            </span>
            <span className="text-xs text-indigo-400 font-medium">ريال سعودي</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-400/80 flex items-center justify-between">
            <span>متاحة للخصم من المستحقات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* AP Aging Breakdown (Derived Coherently from Real Invoices) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>تحليل أعمار ذمم الموردين (AP Aging Analysis)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              محسوب استناداً إلى تواريخ الاستحقاق الفعلية وتاريخ المحاكاة ({effectiveDate})
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('aging')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>عرض التقرير التفصيلي الكامل</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">{aging.currentUnmatured.labelAr}</span>
            <span className="text-lg font-bold font-mono text-emerald-400 block mt-1">
              {(aging.currentUnmatured?.totalPayableAmountSar ?? 0).toLocaleString()} ريال
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{aging.currentUnmatured?.count ?? 0} فاتورة</span>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">{aging.days1To30.labelAr}</span>
            <span className="text-lg font-bold font-mono text-yellow-400 block mt-1">
              {(aging.days1To30?.totalPayableAmountSar ?? 0).toLocaleString()} ريال
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{aging.days1To30?.count ?? 0} فاتورة</span>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">{aging.days31To60.labelAr}</span>
            <span className="text-lg font-bold font-mono text-amber-400 block mt-1">
              {(aging.days31To60?.totalPayableAmountSar ?? 0).toLocaleString()} ريال
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{aging.days31To60?.count ?? 0} فاتورة</span>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block">{aging.days61To90.labelAr}</span>
            <span className="text-lg font-bold font-mono text-orange-400 block mt-1">
              {(aging.days61To90?.totalPayableAmountSar ?? 0).toLocaleString()} ريال
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{aging.days61To90?.count ?? 0} فاتورة</span>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 block">{aging.over90Days.labelAr}</span>
            <span className="text-lg font-bold font-mono text-rose-400 block mt-1">
              {(aging.over90Days?.totalPayableAmountSar ?? 0).toLocaleString()} ريال
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{aging.over90Days?.count ?? 0} فاتورة</span>
          </div>

        </div>
      </div>

      {/* Recent Invoices Worklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>أحدث فواتير الموردين المسجلة (Recent Supplier Invoices)</span>
          </h3>
          <button
            onClick={() => onNavigateToTab('invoices')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>عرض كل الفواتير</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2.5 font-medium">رقم الفاتورة</th>
                <th className="pb-2.5 font-medium">المورد التجاري</th>
                <th className="pb-2.5 font-medium">أمر الشراء / المرجع</th>
                <th className="pb-2.5 font-medium">تاريخ الاستحقاق</th>
                <th className="pb-2.5 font-medium">إجمالي الفاتورة</th>
                <th className="pb-2.5 font-medium">حالة المطابقة</th>
                <th className="pb-2.5 font-medium">حالة السداد</th>
                <th className="pb-2.5 font-medium text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {invoices.slice(0, 5).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-200">
                    <span dir="ltr">{inv.invoiceNumber}</span>
                  </td>
                  <td className="py-3 text-slate-300 font-medium">{inv.supplierNameAr}</td>
                  <td className="py-3 font-mono text-slate-400">
                    {inv.primaryPoNumber ? <span dir="ltr">{inv.primaryPoNumber}</span> : <span className="text-indigo-400">خدمات Non-PO</span>}
                  </td>
                  <td className="py-3 font-mono text-slate-400">{inv.dueDate}</td>
                  <td className="py-3 font-mono font-bold text-emerald-400">
                    {(inv.grossTotalAmount ?? 0).toLocaleString()} {inv.originalCurrency}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      inv.matchingStatus === 'matched_exact'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : inv.matchingStatus === 'price_variance_hold' || inv.matchingStatus === 'qty_variance_hold'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : inv.matchingStatus === 'exception_hold'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inv.matchingStatus === 'matched_exact' ? 'مطابقة تامة' :
                       inv.matchingStatus === 'price_variance_hold' ? 'فارق سعر' :
                       inv.matchingStatus === 'qty_variance_hold' ? 'فارق كمية' :
                       inv.matchingStatus === 'exception_hold' ? 'حجز رقابي' : inv.matchingStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      inv.settlementStatus === 'eligible'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : inv.settlementStatus === 'on_hold'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : inv.settlementStatus === 'fully_settled'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inv.settlementStatus === 'eligible' ? 'مؤهل للسداد' :
                       inv.settlementStatus === 'on_hold' ? 'معلق بحجز' :
                       inv.settlementStatus === 'fully_settled' ? 'مسدد بالكامل' :
                       inv.settlementStatus === 'in_proposal' ? 'ضمن مقترح دفع' : inv.settlementStatus}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onOpenInvoiceDetail(inv.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
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

    </div>
  );
};
