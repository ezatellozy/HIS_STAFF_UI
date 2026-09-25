import React, { useState } from 'react';
import { 
  Clock, 
  Download, 
  Calendar, 
  Filter, 
  Building2, 
  ArrowUpRight, 
  FileText,
  DollarSign
} from 'lucide-react';
import { SupplierInvoice } from '../../types/accountsPayable';
import { computeApAging } from '../../utils/accountsPayableEngine';

interface ApAgingReportsWorkspaceProps {
  invoices: SupplierInvoice[];
  effectiveDate: string;
  onOpenInvoiceDetail: (invoiceId: string) => void;
}

export const ApAgingReportsWorkspace: React.FC<ApAgingReportsWorkspaceProps> = ({
  invoices,
  effectiveDate,
  onOpenInvoiceDetail
}) => {
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const aging = computeApAging(invoices, effectiveDate);

  const buckets = [
    { id: 'unmatured', data: aging.currentUnmatured, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    { id: '1-30', data: aging.days1To30, color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/40' },
    { id: '31-60', data: aging.days31To60, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    { id: '61-90', data: aging.days61To90, color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40' },
    { id: 'over90', data: aging.over90Days, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/40' }
  ];

  // Filter invoices based on selected bucket
  const getFilteredInvoices = () => {
    const active = invoices.filter(i => i.remainingPayableBalanceSar > 0 && i.documentStatus !== 'voided' && i.documentStatus !== 'rejected');
    if (selectedBucket === 'all') return active;

    const refDateObj = new Date(effectiveDate);
    return active.filter(inv => {
      const dueDateObj = new Date(inv.dueDate);
      const diffDays = Math.floor((refDateObj.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));
      if (selectedBucket === 'unmatured') return diffDays <= 0;
      if (selectedBucket === '1-30') return diffDays > 0 && diffDays <= 30;
      if (selectedBucket === '31-60') return diffDays > 30 && diffDays <= 60;
      if (selectedBucket === '61-90') return diffDays > 60 && diffDays <= 90;
      if (selectedBucket === 'over90') return diffDays > 90;
      return true;
    });
  };

  const displayedInvoices = getFilteredInvoices();

  return (
    <div id="ap-aging-reports-workspace" className="space-y-5">
      
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">تقرير أعمار ذمم الموردين والالتزامات (AP Aging Schedule)</h3>
            <p className="text-xs text-slate-400">
              توزيع التزامات الموردين المستحقة وفق الفئات الزمنية المعيارية محسوبة بتاريخ المحاكاة ({effectiveDate})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('تم تصدير تقرير أعمار الذمم بصيغة CSV تجريبية.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير التقرير (Export CSV)</span>
          </button>
        </div>
      </div>

      {/* BUCKET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {buckets.map(b => (
          <div
            key={b.id}
            onClick={() => setSelectedBucket(selectedBucket === b.id ? 'all' : b.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${b.bg} ${
              selectedBucket === b.id ? 'ring-2 ring-emerald-500 shadow-md scale-102' : 'hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] text-slate-400 block font-medium">{b.data.labelAr}</span>
            <div className={`text-xl font-bold font-mono mt-1 ${b.color}`}>
              {(b.data?.totalPayableAmountSar ?? 0).toLocaleString()} ريال
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>{b.data.count} فاتورة</span>
              <span className="font-mono">
                {aging.totalOutstandingPayableSar > 0 
                  ? `${Math.round((b.data.totalPayableAmountSar / aging.totalOutstandingPayableSar) * 100)}%` 
                  : '0%'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED INVOICE TABLE FOR THE SELECTED AGING BUCKET */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>
              قائمة الفواتير المستحقة {selectedBucket !== 'all' ? `— الفئة: ${buckets.find(b => b.id === selectedBucket)?.data.labelAr}` : '— كافة الفئات'}
            </span>
          </h4>
          <span className="text-xs font-mono text-slate-400">
            {displayedInvoices.length} فاتورة معروضة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                <th className="py-2.5 px-4 font-semibold">رقم الفاتورة</th>
                <th className="py-2.5 px-4 font-semibold">المورد التجاري</th>
                <th className="py-2.5 px-4 font-semibold">تاريخ الاستحقاق</th>
                <th className="py-2.5 px-4 font-semibold">أيام التأخر / الاستحقاق</th>
                <th className="py-2.5 px-4 font-semibold">إجمالي الفاتورة</th>
                <th className="py-2.5 px-4 font-semibold">المتبقي المستحق</th>
                <th className="py-2.5 px-4 font-semibold">حالة السداد</th>
                <th className="py-2.5 px-4 font-semibold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {displayedInvoices.map(inv => {
                const diffTime = new Date(effectiveDate).getTime() - new Date(inv.dueDate).getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200" dir="ltr">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{inv.supplierNameAr}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{inv.dueDate}</td>
                    <td className="py-3 px-4 font-mono">
                      {diffDays <= 0 ? (
                        <span className="text-emerald-400 font-bold">غير مستحقة ({Math.abs(diffDays)} يوم متبقي)</span>
                      ) : (
                        <span className={diffDays > 60 ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                          متأخرة {diffDays} يوم
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{(inv.grossTotalAmount ?? 0).toLocaleString()} {inv.originalCurrency}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{(inv.remainingPayableBalanceSar ?? 0).toLocaleString()} ريال</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.settlementStatus === 'eligible'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {inv.settlementStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenInvoiceDetail(inv.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                      >
                        معاينة
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
