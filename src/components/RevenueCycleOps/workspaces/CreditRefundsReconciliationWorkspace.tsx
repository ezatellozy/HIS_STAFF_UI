import React, { useState } from 'react';
import {
  Scale,
  Receipt,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  DollarSign,
  Plus
} from 'lucide-react';
import {
  CreditBalanceRecord,
  PatientInvoice,
  ReceiptAllocation,
  RevenueCycleState
} from '../../../types/revenueCycle';
import {
  requestCreditRefund,
  allocatePatientReceipt
} from '../../../utils/revenueCycleEngine';

interface CreditRefundsReconciliationWorkspaceProps {
  state: RevenueCycleState;
  onUpdateCreditBalances: (updatedCredits: CreditBalanceRecord[]) => void;
  onUpdateInvoices: (updatedInvoices: PatientInvoice[]) => void;
  onAddReceiptAllocation: (allocation: ReceiptAllocation) => void;
  onAddAuditLog: (action: string, entityId: string, desc: string) => void;
}

export const CreditRefundsReconciliationWorkspace: React.FC<CreditRefundsReconciliationWorkspaceProps> = ({
  state,
  onUpdateCreditBalances,
  onUpdateInvoices,
  onAddReceiptAllocation,
  onAddAuditLog
}) => {
  const [selectedCredit, setSelectedCredit] = useState<CreditBalanceRecord | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<'bank_transfer' | 'original_card_reversal'>('bank_transfer');
  const [iban, setIban] = useState('SA4420000001234567890123');
  const [refundError, setRefundError] = useState<string | null>(null);

  // Cashier Receipt Allocation Modal
  const [showReceiptAllocModal, setShowReceiptAllocModal] = useState(false);
  const [allocInvoiceId, setAllocInvoiceId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [allocAmount, setAllocAmount] = useState<number>(0);
  const [receiptAllocError, setReceiptAllocError] = useState<string | null>(null);

  const openInvoicesWithPatientDue = state.invoices.filter(
    inv => inv.outstandingPatientBalanceSar > 0
  );

  const handleOpenRefundModal = (credit: CreditBalanceRecord) => {
    setSelectedCredit(credit);
    setRefundAmount(credit.creditAmountSar);
    setRefundError(null);
    setShowRefundModal(true);
  };

  const handleConfirmRefund = () => {
    if (!selectedCredit) return;
    setRefundError(null);

    const result = requestCreditRefund(
      selectedCredit,
      refundAmount,
      refundMethod,
      iban,
      selectedCredit.patientNameAr,
      'أحمد نبيل (أخصائي الذمم المدينة)'
    );

    if (!result.isValid || !result.updatedCreditBalance) {
      setRefundError(result.errorMessageAr || 'تعذر تقديم طلب الاسترداد');
      return;
    }

    const updatedList = state.creditBalances.map(c =>
      c.id === selectedCredit.id ? result.updatedCreditBalance! : c
    );

    onUpdateCreditBalances(updatedList);
    onAddAuditLog(
      'REFUND_REQUESTED',
      selectedCredit.id,
      `تم رفع طلب استرداد رصيد دائن للمريض ${selectedCredit.patientNameAr} بقيمة ${refundAmount} ر.س`
    );

    setShowRefundModal(false);
    setSelectedCredit(null);
  };

  const handleConfirmReceiptAllocation = () => {
    setReceiptAllocError(null);
    if (!allocInvoiceId || !receiptNumber || allocAmount <= 0) {
      setReceiptAllocError('يرجى استيفاء جميع الحقول المطلوبة');
      return;
    }

    const invoice = state.invoices.find(i => i.id === allocInvoiceId);
    if (!invoice) return;

    const result = allocatePatientReceipt(
      invoice,
      receiptNumber,
      `Kiosk/Desk Receipt #${receiptNumber}`,
      allocAmount,
      state.receiptAllocations,
      'أحمد نبيل (أخصائي الذمم)'
    );

    if (!result.isValid || !result.updatedInvoice || !result.receiptAllocation) {
      setReceiptAllocError(result.errorMessageAr || 'تعذر تخصيص الإيصال');
      return;
    }

    const updatedInvoices = state.invoices.map(inv =>
      inv.id === invoice.id ? result.updatedInvoice! : inv
    );

    onUpdateInvoices(updatedInvoices);
    onAddReceiptAllocation(result.receiptAllocation);

    if (result.creditBalanceCreated) {
      onUpdateCreditBalances([result.creditBalanceCreated, ...state.creditBalances]);
    }

    onAddAuditLog(
      'PATIENT_RECEIPT_ALLOCATED',
      invoice.id,
      `تم تخصيص إيصال الكاشير ${receiptNumber} بقيمة ${allocAmount} ر.س للفاتورة ${invoice.invoiceNumber}`
    );

    setShowReceiptAllocModal(false);
    setReceiptNumber('');
    setAllocAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>الأرصدة الدائنة، الاسترداد ومطابقة المقبوضات (Credit Balances & Refunds)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة فروق التحصيل، تسوية الأرصدة الدائنة، وربط إيصالات الكاشير دون ازدواجية (RC22–RC25)
          </p>
        </div>

        <button
          onClick={() => {
            setReceiptAllocError(null);
            setAllocInvoiceId(openInvoicesWithPatientDue[0]?.id || '');
            setAllocAmount(openInvoicesWithPatientDue[0]?.outstandingPatientBalanceSar || 0);
            setShowReceiptAllocModal(true);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>تخصيص إيصال كاشير لفاتورة</span>
        </button>
      </div>

      {/* Credit Balances Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700">سجل الأرصدة الدائنة للمرضى (Patient Credit Balances)</h3>
          <span className="text-[11px] text-slate-500">حماية من تجاوز رصيد الاسترداد (RC25 / NEG-R)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">رقم القيد / التاريخ</th>
                <th className="py-2.5 px-4">المريض / الملف</th>
                <th className="py-2.5 px-4">سبب نشوء الرصيد الدائن</th>
                <th className="py-2.5 px-4">مبلغ الرصيد الدائن</th>
                <th className="py-2.5 px-4">حالة المعالجة والتسوية</th>
                <th className="py-2.5 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.creditBalances.map(credit => (
                <tr key={credit.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-emerald-800">{credit.id}</div>
                    <div className="text-[11px] text-slate-400">{credit.detectedDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{credit.patientNameAr}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{credit.patientMrn}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {credit.notes || 'رصيد دائن معتمد'}
                    {credit.sourceReceiptId && (
                      <span className="text-[10px] text-slate-400 block font-mono">مرجع الإيصال: {credit.sourceReceiptId}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-700">
                    {credit.creditAmountSar.toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        credit.workflowStatus === 'refund_requested' || credit.workflowStatus === 'sent_to_treasury'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : credit.workflowStatus === 'refund_completed_evidence'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {credit.workflowStatus === 'refund_requested' || credit.workflowStatus === 'sent_to_treasury'
                        ? 'طلب استرداد مرفوع للخزينة'
                        : credit.workflowStatus === 'refund_completed_evidence'
                        ? 'تم الاسترداد'
                        : 'رصيد دائن متاح'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(credit.workflowStatus === 'credit_detected' || credit.workflowStatus === 'credit_verified') && (
                      <button
                        onClick={() => handleOpenRefundModal(credit)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        طلب استرداد بنكي
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cashier Allocations History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700">سجل تخصيصات إيصالات الكاشير (Receipt Allocations)</h3>
          <span className="text-[11px] text-slate-500">حماية من الاستهلاك المزدوج للإيصالات (RC23 / NEG-Q)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">رقم القيد / التاريخ</th>
                <th className="py-2.5 px-4">رقم إيصال الكاشير</th>
                <th className="py-2.5 px-4">الفاتورة المستهدفة</th>
                <th className="py-2.5 px-4">المبلغ المخصص</th>
                <th className="py-2.5 px-4">المسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.receiptAllocations.map(alloc => (
                <tr key={alloc.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono text-slate-600">{alloc.id} ({alloc.allocatedAt})</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">{alloc.receiptNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-blue-700">{alloc.invoiceNumber}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{alloc.allocatedAmountSar.toLocaleString()} ر.س</td>
                  <td className="py-2.5 px-4 text-slate-600">{alloc.allocatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Refund Modal */}
      {showRefundModal && selectedCredit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span>رفع طلب استرداد رصيد دائن للمريض</span>
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {refundError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-bold">
                {refundError}
              </div>
            )}

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
              <div>المريض: <strong className="text-slate-900">{selectedCredit.patientNameAr} ({selectedCredit.patientMrn})</strong></div>
              <div>الرصيد الدائن المتاح: <strong className="font-mono text-emerald-800">{selectedCredit.creditAmountSar} ر.س</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">مبلغ الاسترداد المطلوب (ر.س):</label>
                <input
                  type="number"
                  max={selectedCredit.creditAmountSar}
                  value={refundAmount}
                  onChange={e => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">طريقة الإرجاع المعتمدة:</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                >
                  <option value="bank_transfer">تحويل بنكي رسمي إلى حساب المريض (IBAN)</option>
                  <option value="card_reversal">عكس عملية البطاقة البنكية (POS Reversal)</option>
                </select>
              </div>

              {refundMethod === 'bank_transfer' && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">رقم الآيبان البنكي للمستفيد (IBAN):</label>
                  <input
                    type="text"
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRefund}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                تأكيد ورفع الطلب للخزينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cashier Receipt Allocation Modal */}
      {showReceiptAllocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>تخصيص إيصال سداد نقدي/بطاقة لفاتورة</span>
              </h3>
              <button
                onClick={() => setShowReceiptAllocModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {receiptAllocError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-bold">
                {receiptAllocError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">اختر الفاتورة المستحقة:</label>
                {openInvoicesWithPatientDue.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-400">
                    لا توجد فواتير عليها ذمة مستحقة على المريض حالياً
                  </div>
                ) : (
                  <select
                    value={allocInvoiceId}
                    onChange={e => {
                      setAllocInvoiceId(e.target.value);
                      const inv = openInvoicesWithPatientDue.find(i => i.id === e.target.value);
                      if (inv) setAllocAmount(inv.outstandingPatientBalanceSar);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                  >
                    {openInvoicesWithPatientDue.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.patientNameAr} (المتبقي: {inv.outstandingPatientBalanceSar} ر.س)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">رقم إيصال الكاشير الصادر:</label>
                <input
                  type="text"
                  placeholder="مثال: REC-99405"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">المبلغ المسدد (ر.س):</label>
                <input
                  type="number"
                  value={allocAmount}
                  onChange={e => setAllocAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReceiptAllocModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReceiptAllocation}
                disabled={openInvoicesWithPatientDue.length === 0}
                className="px-4 py-2 bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                تأكيد التخصيص
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
