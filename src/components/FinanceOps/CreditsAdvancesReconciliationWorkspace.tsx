import React, { useState } from 'react';
import { 
  Scale, 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  ArrowRightLeft, 
  FileText,
  Building,
  RefreshCw,
  Plus
} from 'lucide-react';
import { 
  SupplierCreditNote, 
  PrepaymentRecord, 
  SupplierInvoice, 
  SupplierStatementReconciliationRecord 
} from '../../types/accountsPayable';
import { applyCreditNoteToInvoice, applyPrepaymentToInvoice } from '../../utils/accountsPayableEngine';

interface CreditsAdvancesReconciliationWorkspaceProps {
  creditNotes: SupplierCreditNote[];
  prepayments: PrepaymentRecord[];
  invoices: SupplierInvoice[];
  statements: SupplierStatementReconciliationRecord[];
  onUpdateCreditNote: (updatedCredit: SupplierCreditNote, updatedInvoice: SupplierInvoice) => void;
  onUpdatePrepayment: (updatedPrepayment: PrepaymentRecord, updatedInvoice: SupplierInvoice) => void;
  activePersona: string;
}

export const CreditsAdvancesReconciliationWorkspace: React.FC<CreditsAdvancesReconciliationWorkspaceProps> = ({
  creditNotes,
  prepayments,
  invoices,
  statements,
  onUpdateCreditNote,
  onUpdatePrepayment,
  activePersona
}) => {
  const [activeTab, setActiveTab] = useState<'credits' | 'advances' | 'statements'>('credits');

  // Application Modal States
  const [applyingCredit, setApplyingCredit] = useState<SupplierCreditNote | null>(null);
  const [targetInvoiceForCredit, setTargetInvoiceForCredit] = useState<string>('');
  const [creditAmountToApply, setCreditAmountToApply] = useState<number>(0);

  const [applyingAdvance, setApplyingAdvance] = useState<PrepaymentRecord | null>(null);
  const [targetInvoiceForAdvance, setTargetInvoiceForAdvance] = useState<string>('');
  const [advanceAmountToDeduct, setAdvanceAmountToDeduct] = useState<number>(0);

  const [actionError, setActionError] = useState<string | null>(null);

  // Handlers
  const handleConfirmApplyCredit = () => {
    setActionError(null);
    if (!applyingCredit || !targetInvoiceForCredit) return;

    const targetInv = invoices.find(i => i.id === targetInvoiceForCredit);
    if (!targetInv) return;

    const res = applyCreditNoteToInvoice(applyingCredit, targetInv, creditAmountToApply);
    if (!res.success) {
      setActionError(res.errorMessage || 'تعذر تطبيق الإشعار الدائن.');
      return;
    }

    onUpdateCreditNote(res.updatedCreditNote, res.updatedInvoice);
    setApplyingCredit(null);
  };

  const handleConfirmApplyAdvance = () => {
    setActionError(null);
    if (!applyingAdvance || !targetInvoiceForAdvance) return;

    const targetInv = invoices.find(i => i.id === targetInvoiceForAdvance);
    if (!targetInv) return;

    const res = applyPrepaymentToInvoice(applyingAdvance, targetInv, advanceAmountToDeduct);
    if (!res.success) {
      setActionError(res.errorMessage || 'تعذر خصم الدفعة المقدمة.');
      return;
    }

    onUpdatePrepayment(res.updatedPrepayment, res.updatedInvoice);
    setApplyingAdvance(null);
  };

  return (
    <div id="credits-advances-reconciliation-workspace" className="space-y-5">
      
      {/* Workspace Header & Subtabs */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">الإشعارات الدائنة، الدفعات المقدمة، ومطابقة كشوف الحساب</h3>
            <p className="text-xs text-slate-400">
              تسوية الإشعارات الدائنة للموردين، خصم الدفعات المقدمة، ومطابقة كشوف حسابات الموردين
            </p>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'credits' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            الإشعارات الدائنة ({creditNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('advances')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'advances' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            الدفعات المقدمة ({prepayments.length})
          </button>
          <button
            onClick={() => setActiveTab('statements')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
              activeTab === 'statements' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            كشوف حساب الموردين ({statements.length})
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* SUBTAB 1: CREDIT NOTES */}
      {activeTab === 'credits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>الإشعارات الدائنة المستلمة من الموردين (Supplier Credit Notes)</span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">رقم الإشعار الدائن</th>
                  <th className="py-2.5 px-4 font-semibold">المورد التجاري</th>
                  <th className="py-2.5 px-4 font-semibold">الفاتورة الأصلية المرتبطة</th>
                  <th className="py-2.5 px-4 font-semibold">مرجع مطالبة المشتريات</th>
                  <th className="py-2.5 px-4 font-semibold">إجمالي الإشعار (SAR)</th>
                  <th className="py-2.5 px-4 font-semibold">المطبق</th>
                  <th className="py-2.5 px-4 font-semibold">المتبقي للتسوية</th>
                  <th className="py-2.5 px-4 font-semibold">الحالة</th>
                  <th className="py-2.5 px-4 font-semibold text-center">إجراء التطبيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {creditNotes.map(cn => (
                  <tr key={cn.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200" dir="ltr">{cn.creditNoteNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{cn.supplierNameAr}</td>
                    <td className="py-3 px-4 font-mono text-slate-300" dir="ltr">{cn.originalInvoiceNumber}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{cn.sourceProcurementClaimId || '-'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{(cn.totalCreditAmountSar ?? 0).toLocaleString()} ريال</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{(cn.appliedAmountSar ?? 0).toLocaleString()} ريال</td>
                    <td className="py-3 px-4 font-mono font-bold text-yellow-400">{(cn.remainingUnappliedAmountSar ?? 0).toLocaleString()} ريال</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cn.status === 'fully_applied'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {cn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        disabled={cn.remainingUnappliedAmountSar <= 0}
                        onClick={() => {
                          setApplyingCredit(cn);
                          setTargetInvoiceForCredit(cn.originalInvoiceId);
                          setCreditAmountToApply(cn.remainingUnappliedAmountSar);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>تسوية / تطبيق</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PREPAYMENTS */}
      {activeTab === 'advances' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>الدفعات المقدمة وتسهيلات التوريد (Prepayments & Advances)</span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">المرجع</th>
                  <th className="py-2.5 px-4 font-semibold">المورد التجاري</th>
                  <th className="py-2.5 px-4 font-semibold">أمر الشراء المرتبط</th>
                  <th className="py-2.5 px-4 font-semibold">المبلغ المصروف المعتمد</th>
                  <th className="py-2.5 px-4 font-semibold">الرصيد المتاح للخصم</th>
                  <th className="py-2.5 px-4 font-semibold">الحالة</th>
                  <th className="py-2.5 px-4 font-semibold text-center">إجراء الخصم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {prepayments.map(pre => (
                  <tr key={pre.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">{pre.prepaymentReference}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{pre.supplierNameAr}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{pre.poNumber || '-'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{(pre.confirmedDisbursedAmountSar ?? 0).toLocaleString()} ريال</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{(pre.unappliedBalanceSar ?? 0).toLocaleString()} ريال</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pre.status === 'fully_applied'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {pre.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        disabled={pre.unappliedBalanceSar <= 0}
                        onClick={() => {
                          setApplyingAdvance(pre);
                          setTargetInvoiceForAdvance(invoices[0]?.id || '');
                          setAdvanceAmountToDeduct(pre.unappliedBalanceSar);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>خصم من فاتورة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SUPPLIER STATEMENTS */}
      {activeTab === 'statements' && (
        <div className="space-y-4">
          {statements.map(stmt => (
            <div key={stmt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span>مطابقة كشف حساب المورد: {stmt.supplierNameAr}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">فترة الكشف: {stmt.statementPeriod} ({stmt.statementDate})</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">رصيد كشف المورد:</span>
                    <span className="font-bold text-white">{(stmt.statementEndingBalanceSar ?? 0).toLocaleString()} ريال</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">رصيد سجلات المستشفى:</span>
                    <span className="font-bold text-emerald-400">{(stmt.hospitalApLedgerBalanceSar ?? 0).toLocaleString()} ريال</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الفارق غير المطابق:</span>
                    <span className="font-bold text-emerald-400">{(stmt.unreconciledVarianceSar ?? 0).toLocaleString()} ريال</span>
                  </div>
                </div>
              </div>

              {/* Statement lines table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[11px] border-b border-slate-800">
                      <th className="pb-2 font-medium">التاريخ</th>
                      <th className="pb-2 font-medium">النوع</th>
                      <th className="pb-2 font-medium">رقم المرجع بكشف المورد</th>
                      <th className="pb-2 font-medium">مدين (فواتير)</th>
                      <th className="pb-2 font-medium">دائن (سدادات وإشعارات)</th>
                      <th className="pb-2 font-medium">الرصيد التراكمي</th>
                      <th className="pb-2 font-medium">حالة المطابقة الداخلية</th>
                      <th className="pb-2 font-medium">ملاحظات التدقيق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {stmt.lines.map(line => (
                      <tr key={line.id}>
                        <td className="py-2.5 font-mono text-slate-300">{line.transactionDate}</td>
                        <td className="py-2.5 text-slate-400">{line.transactionType}</td>
                        <td className="py-2.5 font-mono text-slate-200" dir="ltr">{line.referenceNumber}</td>
                        <td className="py-2.5 font-mono text-white">{line.debitAmountSar > 0 ? `${(line.debitAmountSar ?? 0).toLocaleString()} ريال` : '-'}</td>
                        <td className="py-2.5 font-mono text-emerald-400">{line.creditAmountSar > 0 ? `${(line.creditAmountSar ?? 0).toLocaleString()} ريال` : '-'}</td>
                        <td className="py-2.5 font-mono font-bold text-white">{(line.closingBalanceSar ?? 0).toLocaleString()} ريال</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            line.reconciliationStatus === 'reconciled'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {line.reconciliationStatus}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400 text-[11px]">{line.investigationNotesAr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL: APPLY CREDIT NOTE */}
      {applyingCredit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>تطبيق الإشعار الدائن ({applyingCredit.creditNoteNumber})</span>
              </h3>
              <button onClick={() => setApplyingCredit(null)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر الفاتورة المستحقة المراد خصم الإشعار منها:</label>
                <select
                  value={targetInvoiceForCredit}
                  onChange={(e) => setTargetInvoiceForCredit(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  {invoices.filter(inv => (inv.remainingPayableBalanceSar ?? 0) > 0).map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - رصيد مستحق: {(inv.remainingPayableBalanceSar ?? 0).toLocaleString()} ريال ({inv.supplierNameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">المبلغ المراد تطبيقه (ريال سعودي):</label>
                <input
                  type="number"
                  min="1"
                  max={applyingCredit.remainingUnappliedAmountSar}
                  value={creditAmountToApply}
                  onChange={(e) => setCreditAmountToApply(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 text-emerald-400 font-mono font-bold p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  الرصيد المتاح من الإشعار: {(applyingCredit.remainingUnappliedAmountSar ?? 0).toLocaleString()} ريال
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setApplyingCredit(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={creditAmountToApply <= 0}
                onClick={handleConfirmApplyCredit}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
              >
                تأكيد التسوية والخصم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY PREPAYMENT */}
      {applyingAdvance && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>خصم الدفعة المقدمة ({applyingAdvance.prepaymentReference})</span>
              </h3>
              <button onClick={() => setApplyingAdvance(null)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر الفاتورة المستحقة المراد خصم الدفعة المقدمة منها:</label>
                <select
                  value={targetInvoiceForAdvance}
                  onChange={(e) => setTargetInvoiceForAdvance(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  {invoices.filter(inv => (inv.remainingPayableBalanceSar ?? 0) > 0).map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - رصيد مستحق: {(inv.remainingPayableBalanceSar ?? 0).toLocaleString()} ريال ({inv.supplierNameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">المبلغ المراد خصمه (ريال سعودي):</label>
                <input
                  type="number"
                  min="1"
                  max={applyingAdvance.unappliedBalanceSar}
                  value={advanceAmountToDeduct}
                  onChange={(e) => setAdvanceAmountToDeduct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 text-emerald-400 font-mono font-bold p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  الرصيد المتاح من الدفعة: {(applyingAdvance.unappliedBalanceSar ?? 0).toLocaleString()} ريال
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setApplyingAdvance(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={advanceAmountToDeduct <= 0}
                onClick={handleConfirmApplyAdvance}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
              >
                تأكيد خصم الدفعة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
