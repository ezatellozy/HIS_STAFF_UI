import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  BookOpen, 
  Info, 
  Clock, 
  ShieldCheck,
  Send,
  Building,
  UserCheck
} from 'lucide-react';
import { SupplierInvoice } from '../../types/accountsPayable';
import { approveInvoice, recordSyntheticVoucherPosting } from '../../utils/accountsPayableEngine';

interface InvoiceApprovalsPostingWorkspaceProps {
  invoices: SupplierInvoice[];
  onUpdateInvoice: (updatedInvoice: SupplierInvoice) => void;
  activePersona: string;
}

export const InvoiceApprovalsPostingWorkspace: React.FC<InvoiceApprovalsPostingWorkspaceProps> = ({
  invoices,
  onUpdateInvoice,
  activePersona
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter invoices needing approval or posting
  const pendingApprovalInvoices = invoices.filter(inv => inv.approvalStatus !== 'approved' && inv.documentStatus !== 'voided' && inv.documentStatus !== 'rejected');
  const approvedUnpostedInvoices = invoices.filter(inv => inv.approvalStatus === 'approved' && inv.postingStatus !== 'simulated_posted');
  const postedInvoices = invoices.filter(inv => inv.postingStatus === 'simulated_posted');

  const handleApprove = (inv: SupplierInvoice) => {
    setActionError(null);
    const res = approveInvoice(
      inv,
      'STAFF-AP-LEAD-01',
      activePersona === 'financial_controller' ? 'المدير المالي (Financial Controller)' : 'رئيس الحسابات الدائنة (AP Lead)',
      approvalComments || 'تم التحقق من اكتمال المطابقة النظامية وصحة الحسابات والمرفقات.'
    );

    if (!res.success) {
      setActionError(res.errorMessage || 'تعذر اعتماد الفاتورة.');
      return;
    }

    onUpdateInvoice(res.updatedInvoice);
    setSelectedInvoice(null);
    setApprovalComments('');
  };

  const handleSimulatePosting = (inv: SupplierInvoice) => {
    const updated = recordSyntheticVoucherPosting(
      inv,
      inv.lines[0]?.glAccountCode || 'GL-5100-MEDSUP',
      'GL-2010-AP-TRADE',
      'Synthetic Posting Subsystem'
    );
    onUpdateInvoice(updated);
  };

  return (
    <div id="invoice-approvals-posting-workspace" className="space-y-5">
      
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">اعتماد الفواتير وتجهيز سندات القيد (Approvals & Posting Boundary)</h3>
            <p className="text-xs text-slate-400">
              فصل صارم بين اعتماد الفاتورة وبين ترحيل سند القيد المحاسبي لدفتر الأستاذ (GL Posting Boundary)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">فواتير بانتظار الاعتماد:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-bold">
            {pendingApprovalInvoices.length}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* SECTION 1: INVOICES PENDING AP APPROVAL */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>فواتير قيد مراجعة الاعتماد المالي (Invoices Pending Approval)</span>
          </h4>
        </div>

        {pendingApprovalInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">رقم الفاتورة</th>
                  <th className="py-2.5 px-4 font-semibold">المورد التجاري</th>
                  <th className="py-2.5 px-4 font-semibold">إجمالي الفاتورة</th>
                  <th className="py-2.5 px-4 font-semibold">حالة المطابقة</th>
                  <th className="py-2.5 px-4 font-semibold">الحجوزات النشطة</th>
                  <th className="py-2.5 px-4 font-semibold text-center">إجراء الاعتماد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {pendingApprovalInvoices.map(inv => {
                  const unresolvedCount = inv.activeHolds.filter(h => !h.isResolved).length;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        <span dir="ltr">{inv.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{inv.supplierNameAr}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {(inv.grossTotalAmount ?? 0).toLocaleString()} {inv.originalCurrency}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.matchingStatus === 'matched_exact'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {inv.matchingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {unresolvedCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                            {unresolvedCount} حجز مانع للاعتماد
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مستوفية وجاهزة للاعتماد</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          disabled={unresolvedCount > 0}
                          onClick={() => handleApprove(inv)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد الفاتورة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            لا توجد فواتير معلقة بانتظار الاعتماد المالي.
          </div>
        )}
      </div>

      {/* SECTION 2: APPROVED INVOICES AWAITING SYNTHETIC GL POSTING */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>فواتير معتمدة بانتظار ترحيل القيد لدفتر الأستاذ (Approved — Pending Posting)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              توضيح سيناريو AP21: اعتماد الفاتورة يثبت صحة المعاملة ولكن لا يمثل ترحيلاً محاسبياً حتى توليد سند القيد
            </p>
          </div>
        </div>

        {approvedUnpostedInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">رقم الفاتورة</th>
                  <th className="py-2.5 px-4 font-semibold">المورد التجاري</th>
                  <th className="py-2.5 px-4 font-semibold">مبلغ الالتزام (SAR)</th>
                  <th className="py-2.5 px-4 font-semibold">معتمد الفاتورة</th>
                  <th className="py-2.5 px-4 font-semibold">حالة الترحيل المحاسبي</th>
                  <th className="py-2.5 px-4 font-semibold text-center">إجراء الترحيل التجريبي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {approvedUnpostedInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      <span dir="ltr">{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{inv.supplierNameAr}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {(inv.convertedGrossTotalSar ?? 0).toLocaleString()} ريال
                    </td>
                    <td className="py-3 px-4 text-slate-300">{inv.approvalRecord?.approvedByStaffName || 'معتمد'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        {inv.postingStatus} (غير مرحل)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSimulatePosting(inv)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إنشاء وترحيل سند القيد (Simulate)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            كافة الفواتير المعتمدة تم إنشاء وترحيل سندات القيد المحاكية لها.
          </div>
        )}
      </div>

      {/* SECTION 3: SIMULATED POSTED VOUCHERS AUDIT */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>سجل سندات القيد المحاكية المرحلة (Simulated Posted Vouchers)</span>
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-4 font-medium">رقم سند القيد</th>
                <th className="py-2.5 px-4 font-medium">رقم الفاتورة</th>
                <th className="py-2.5 px-4 font-medium">المدين (Debit Expense)</th>
                <th className="py-2.5 px-4 font-medium">الدائن (Credit AP Trade)</th>
                <th className="py-2.5 px-4 font-medium">المبلغ المرحل</th>
                <th className="py-2.5 px-4 font-medium">تاريخ وساعة الترحيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {postedInvoices.map(inv => (
                <tr key={inv.id} className="text-slate-300">
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">
                    {inv.syntheticVoucherRecord?.voucherNumber || 'VCHR-SIM'}
                  </td>
                  <td className="py-2.5 px-4 font-mono">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{inv.syntheticVoucherRecord?.debitAccountCode}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{inv.syntheticVoucherRecord?.creditAccountCode}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">
                    {(inv.convertedGrossTotalSar ?? 0).toLocaleString()} ريال
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{inv.syntheticVoucherRecord?.postedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
