import React, { useState } from 'react';
import { 
  CreditCard, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle, 
  ShieldAlert, 
  DollarSign, 
  Plus, 
  Building2,
  Lock,
  ArrowRightLeft
} from 'lucide-react';
import { SupplierInvoice, PaymentProposalBatch, SupplierFinancialOverlay } from '../../types/accountsPayable';
import { createPaymentBatch, authorizePaymentBatch, simulateBankExecution } from '../../utils/accountsPayableEngine';

interface PaymentProposalsBatchesWorkspaceProps {
  invoices: SupplierInvoice[];
  batches: PaymentProposalBatch[];
  supplierOverlays: SupplierFinancialOverlay[];
  onAddNewBatch: (batch: PaymentProposalBatch) => void;
  onUpdateBatch: (batch: PaymentProposalBatch, updatedInvoices: SupplierInvoice[]) => void;
  activePersona: string;
}

export const PaymentProposalsBatchesWorkspace: React.FC<PaymentProposalsBatchesWorkspaceProps> = ({
  invoices,
  batches,
  supplierOverlays,
  onAddNewBatch,
  onUpdateBatch,
  activePersona
}) => {
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [batchDescription, setBatchDescription] = useState('دفعة سداد الموردين الدورية للمستلزمات الطبية');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [customProposedAmounts, setCustomProposedAmounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  // Eligible invoices for payments: Must be approved, eligible, balance > 0
  const eligibleInvoices = invoices.filter(inv => 
    inv.approvalStatus === 'approved' && 
    inv.remainingPayableBalanceSar > 0 &&
    inv.settlementStatus !== 'on_hold'
  );

  const handleToggleSelectInvoice = (invId: string, defaultAmount: number) => {
    if (selectedInvoiceIds.includes(invId)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter(id => id !== invId));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, invId]);
      if (!customProposedAmounts[invId]) {
        setCustomProposedAmounts({ ...customProposedAmounts, [invId]: defaultAmount });
      }
    }
  };

  const handleCreateBatch = () => {
    setActionError(null);
    if (selectedInvoiceIds.length === 0) {
      setActionError('يجب اختيار فاتورة واحدة على الأقل لإعداد مقترح السداد.');
      return;
    }

    const itemsToInclude = selectedInvoiceIds.map(id => {
      const inv = invoices.find(i => i.id === id)!;
      const overlay = supplierOverlays.find(o => o.supplierId === inv.supplierId);
      const proposed = customProposedAmounts[id] ?? inv.remainingPayableBalanceSar;
      return { invoice: inv, proposedAmountSar: proposed, overlay };
    });

    const batchNum = `BATCH-${new Date().getFullYear()}-W${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 90) + 10}`;
    const res = createPaymentBatch(batchNum, batchDescription, itemsToInclude, 'BANK-SNB-SAR-01', batches);

    if (!res.success || !res.batch) {
      setActionError(res.errorMessage || 'تعذر إنشاء مقترح السداد.');
      return;
    }

    onAddNewBatch(res.batch);
    setIsCreatingBatch(false);
    setSelectedInvoiceIds([]);
    setCustomProposedAmounts({});
  };

  const handleAuthorizeBatch = (batch: PaymentProposalBatch) => {
    setActionError(null);
    const res = authorizePaymentBatch(
      batch,
      activePersona === 'treasury_officer' ? 'مسؤول الخزينة (Treasury Officer)' : 'المدير المالي (Financial Controller)',
      'تم اعتماد الدفعة والتحقق من حسابات المستفيدين.'
    );

    if (!res.success) {
      setActionError(res.errorMessage || 'تعذر اعتماد الدفعة.');
      return;
    }

    onUpdateBatch(res.updatedBatch, invoices);
  };

  const handleSimulateBank = (batch: PaymentProposalBatch, outcome: 'cleared_confirmed' | 'rejected_by_bank') => {
    const { updatedBatch, updatedInvoices } = simulateBankExecution(batch, invoices, outcome);
    onUpdateBatch(updatedBatch, updatedInvoices);
  };

  return (
    <div id="payment-proposals-batches-workspace" className="space-y-5">
      
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">مقترحات السداد ودفعات الخزينة (Payment Proposals & Treasury Gate)</h3>
            <p className="text-xs text-slate-400">
              إعداد مقترحات السداد بواسطة AP واعتمادها من الخزينة مع محاكاة إشعار البنك (Dual-Control Authorization)
            </p>
          </div>
        </div>

        <button
          id="open-create-batch-btn"
          onClick={() => {
            setIsCreatingBatch(true);
            setActionError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إعداد دفعة سداد جديدة</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* CREATE PAYMENT BATCH MODAL / DRAWER */}
      {isCreatingBatch && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>إعداد مقترح سداد جديد للموردين (Create Payment Proposal)</span>
            </h4>
            <button onClick={() => setIsCreatingBatch(false)} className="text-slate-400 hover:text-white p-1">
              ✕
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">وصف الدفعة / الغرض</label>
            <input
              type="text"
              value={batchDescription}
              onChange={(e) => setBatchDescription(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-bold mb-2">
              اختر الفواتير المؤهلة للسداد وحدد المبالغ المقترحة (Eligible Invoices):
            </label>

            {eligibleInvoices.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {eligibleInvoices.map(inv => {
                  const overlay = supplierOverlays.find(o => o.supplierId === inv.supplierId);
                  const isSelected = selectedInvoiceIds.includes(inv.id);
                  const isBeneficiaryBlocked = overlay?.apPaymentHoldActive || overlay?.beneficiaryVerificationStatus !== 'verified_active';

                  return (
                    <div 
                      key={inv.id}
                      className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected ? 'bg-slate-800 border-emerald-500/60' : 'bg-slate-800/40 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectInvoice(inv.id, inv.remainingPayableBalanceSar)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-200 font-mono" dir="ltr">{inv.invoiceNumber}</div>
                          <div className="text-slate-400 text-[11px]">{inv.supplierNameAr}</div>
                          {isBeneficiaryBlocked && (
                            <span className="text-[10px] text-rose-400 font-bold block mt-0.5">
                              ⚠️ الحساب البنكي للمستفيد معلق للتحقق (Bank Verification Pending)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-left sm:text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 block">الرصيد المستحق:</span>
                          <span className="font-mono font-bold text-white">{(inv.remainingPayableBalanceSar ?? 0).toLocaleString()} ريال</span>
                        </div>

                        {isSelected && (
                          <div>
                            <span className="text-[10px] text-emerald-400 block">المبلغ المقترح سداده:</span>
                            <input
                              type="number"
                              min="1"
                              max={inv.remainingPayableBalanceSar}
                              value={customProposedAmounts[inv.id] ?? inv.remainingPayableBalanceSar}
                              onChange={(e) => setCustomProposedAmounts({
                                ...customProposedAmounts,
                                [inv.id]: parseFloat(e.target.value) || 0
                              })}
                              className="w-28 bg-slate-900 text-emerald-400 font-mono font-bold text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-800/40 rounded-lg text-center text-xs text-slate-400">
                لا توجد فواتير مؤهلة للسداد حالياً (تأكد من اعتماد الفواتير وعدم وجود حجوزات).
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsCreatingBatch(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
            >
              إلغاء
            </button>
            <button
              disabled={selectedInvoiceIds.length === 0}
              onClick={handleCreateBatch}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              إنشاء مقترح السداد
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT BATCHES WORKLIST */}
      <div className="space-y-4">
        {batches.map(batch => (
          <div key={batch.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-emerald-400" dir="ltr">{batch.batchNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    batch.status === 'mock_bank_confirmed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : batch.status === 'mock_bank_rejected'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : batch.status === 'approved_for_payment'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {batch.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{batch.batchDescriptionAr}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">إجمالي الدفعة المقترحة:</span>
                <span className="text-lg font-mono font-bold text-white">
                  {(batch.totalProposedAmountSar ?? 0).toLocaleString()} {batch.currency}
                </span>
              </div>
            </div>

            {/* Invoices inside Batch */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-400 text-[11px] border-b border-slate-800">
                    <th className="pb-2 font-medium">رقم الفاتورة</th>
                    <th className="pb-2 font-medium">المورد التجاري</th>
                    <th className="pb-2 font-medium">رقم الآيبان (محاكاة)</th>
                    <th className="pb-2 font-medium">توثيق الحساب</th>
                    <th className="pb-2 font-medium">المبلغ المسدد بالدفعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {batch.items.map(item => (
                    <tr key={item.invoiceId}>
                      <td className="py-2.5 font-mono text-slate-200" dir="ltr">{item.invoiceNumber}</td>
                      <td className="py-2.5 text-slate-300">{item.supplierNameAr}</td>
                      <td className="py-2.5 font-mono text-slate-400" dir="ltr">{item.beneficiaryIbanMasked}</td>
                      <td className="py-2.5">
                        {item.isBeneficiaryVerified ? (
                          <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>موثق ونشط</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>تغيير بنكي معلق (Blocked)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-400">
                        {(item.proposedPaymentAmountSar ?? 0).toLocaleString()} ريال
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dual Control Actions & Synthetic Bank Simulation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              
              <div className="text-slate-400 text-[11px]">
                {batch.treasuryApprovalRecord ? (
                  <span className="text-indigo-300">
                    معتمد من الخزينة بواسطة: {batch.treasuryApprovalRecord.approvedByStaffName} ({batch.treasuryApprovalRecord.approvedAt})
                  </span>
                ) : (
                  <span>بانتظار اعتماد مسؤول الخزينة (Dual-Control Required)</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Treasury Authorization Button */}
                {batch.status === 'draft_proposal' && (
                  <button
                    onClick={() => handleAuthorizeBatch(batch)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>اعتماد الدفعة من الخزينة (Authorize)</span>
                  </button>
                )}

                {/* Synthetic Bank Simulation Buttons */}
                {batch.status === 'approved_for_payment' && (
                  <>
                    <button
                      onClick={() => handleSimulateBank(batch, 'cleared_confirmed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>محاكاة تأكيد البنك (Bank Cleared)</span>
                    </button>
                    <button
                      onClick={() => handleSimulateBank(batch, 'rejected_by_bank')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>محاكاة رفض البنك (Bank Reject)</span>
                    </button>
                  </>
                )}

                {batch.status === 'mock_bank_confirmed' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>تمت التسوية البنكية التجريبية (Settlement Complete)</span>
                  </span>
                )}

                {batch.status === 'mock_bank_rejected' && (
                  <span className="text-rose-400 font-bold flex items-center gap-1 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-800">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>أمر الدفع مرفوض من البنك - رصيد الفاتورة لم يتأثر</span>
                  </span>
                )}
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
