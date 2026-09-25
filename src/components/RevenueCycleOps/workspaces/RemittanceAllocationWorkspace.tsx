import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Building,
  Info,
  Layers,
  DollarSign
} from 'lucide-react';
import {
  PayerRemittance,
  PatientInvoice,
  PayerClaim,
  RevenueCycleState
} from '../../../types/revenueCycle';
import { allocatePayerRemittance } from '../../../utils/revenueCycleEngine';

interface RemittanceAllocationWorkspaceProps {
  state: RevenueCycleState;
  onUpdateRemittances: (updatedRemittances: PayerRemittance[]) => void;
  onUpdateInvoices: (updatedInvoices: PatientInvoice[]) => void;
  onAddAuditLog: (action: string, entityId: string, desc: string) => void;
}

export const RemittanceAllocationWorkspace: React.FC<RemittanceAllocationWorkspaceProps> = ({
  state,
  onUpdateRemittances,
  onUpdateInvoices,
  onAddAuditLog
}) => {
  const [selectedRemittance, setSelectedRemittance] = useState<PayerRemittance | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [allocationAmount, setAllocationAmount] = useState<number>(0);
  const [allocationError, setAllocationError] = useState<string | null>(null);

  // Eligible claims for the selected remittance payer
  const eligibleClaims = state.claims.filter(
    c => c.payerId === selectedRemittance?.payerId && c.lifecycleStatus !== 'ready_to_submit'
  );

  const handleOpenAllocateModal = (rem: PayerRemittance) => {
    setSelectedRemittance(rem);
    setAllocationError(null);
    const firstEligible = state.claims.find(c => c.payerId === rem.payerId);
    setSelectedClaimId(firstEligible?.id || '');
    setAllocationAmount(firstEligible ? Math.min(firstEligible.totalAllowedSar, rem.unallocatedRemainderSar) : 0);
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = () => {
    if (!selectedRemittance) return;
    setAllocationError(null);

    const claim = state.claims.find(c => c.id === selectedClaimId);
    if (!claim) {
      setAllocationError('يرجى اختيار المطالبة المستهدفة');
      return;
    }

    const invoice = state.invoices.find(i => i.id === claim.invoiceId);
    if (!invoice) {
      setAllocationError('لم يتم العثور على الفاتورة المقترنة بالمطالبة');
      return;
    }

    const result = allocatePayerRemittance(
      selectedRemittance,
      claim,
      invoice,
      allocationAmount,
      'مروة عبد الرحمن (مسؤول التسويات والتحصيلات)'
    );

    if (!result.isValid || !result.updatedRemittance || !result.updatedInvoice) {
      setAllocationError(result.errorMessageAr || 'تعذر استكمال التخصيص');
      return;
    }

    const updatedRemittances = state.remittances.map(r =>
      r.id === selectedRemittance.id ? result.updatedRemittance! : r
    );

    const updatedInvoices = state.invoices.map(i =>
      i.id === invoice.id ? result.updatedInvoice! : i
    );

    onUpdateRemittances(updatedRemittances);
    onUpdateInvoices(updatedInvoices);

    onAddAuditLog(
      'REMITTANCE_ALLOCATED',
      selectedRemittance.id,
      `تم تخصيص مبلغ ${allocationAmount} ر.س من الإشعار ${selectedRemittance.remittanceNumber} للفاتورة ${invoice.invoiceNumber}`
    );

    setShowAllocateModal(false);
    setSelectedRemittance(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-purple-600" />
          <span>إشعارات التحويل البنكي وتخصيص الدفعات (Remittance & Payment Allocation)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          معالجة إشعارات الدفع الإلكترونية (ERA / 835)، التحقق من التسوية المصرفية، وتخصيص المبالغ على المطالبات المفتوحة (RC20 / RC21)
        </p>
      </div>

      {/* Critical Settlement Check Alert */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-purple-950 font-bold">
            ضابط التأكيد المصرفي المستقل (RC21):
          </strong>
          <span>
            أي إشعار تحويل وارد من شركة التأمين غير مؤكد الإيداع في الحساب البنكي من قبل الخزينة العامة يُحظر استخدامه لإقفال أو تسوية الذمم المدينة لتجنب التسويات الوهمية.
          </span>
        </div>
      </div>

      {/* Remittances Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">رقم إشعار التحويل / التاريخ</th>
                <th className="py-3 px-4">شركة التأمين</th>
                <th className="py-3 px-4">البنك والحساب المودع فيه</th>
                <th className="py-3 px-4">إجمالي مبلغ التحويل</th>
                <th className="py-3 px-4">المبلغ المخصص</th>
                <th className="py-3 px-4">المتبقي غير المخصص</th>
                <th className="py-3 px-4">حالة التأكيد البنكي</th>
                <th className="py-3 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.remittances.map(rem => (
                <tr key={rem.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-purple-800">{rem.remittanceNumber}</div>
                    <div className="text-[11px] text-slate-400">{rem.remittanceDate}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{rem.payerNameAr}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800">{rem.bankNameAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{rem.bankAccountIban}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {rem.totalRemittedAmountSar.toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {rem.allocatedAmountSar.toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-purple-700">
                    {rem.unallocatedRemainderSar.toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rem.bankSettlementStatus === 'confirmed_in_bank'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rem.bankSettlementStatus === 'confirmed_in_bank' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>مؤكد ومودع بالبنك</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>غير مؤكد بنكياً (محظور التخصيص)</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleOpenAllocateModal(rem)}
                      disabled={rem.unallocatedRemainderSar === 0 || rem.bankSettlementStatus !== 'confirmed_in_bank'}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-40 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      تخصيص لمطالبة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Modal */}
      {showAllocateModal && selectedRemittance && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Landmark className="w-5 h-5 text-purple-600" />
                <span>تخصيص دفعة تحويل بنكي على مطالبة وفاتورة</span>
              </h3>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {allocationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-bold">
                {allocationError}
              </div>
            )}

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1 text-xs">
              <div>إشعار التحويل: <strong className="font-mono text-purple-900">{selectedRemittance.remittanceNumber}</strong></div>
              <div>المبلغ المتاح للتخصيص: <strong className="font-mono text-purple-700">{selectedRemittance.unallocatedRemainderSar.toLocaleString()} ر.س</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">المطالبة المستهدفة للتسوية:</label>
                {eligibleClaims.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-center">
                    لا توجد مطالبات مفتوحة لهذه الشركة
                  </div>
                ) : (
                  <select
                    value={selectedClaimId}
                    onChange={e => {
                      setSelectedClaimId(e.target.value);
                      const clm = eligibleClaims.find(c => c.id === e.target.value);
                      if (clm) {
                        setAllocationAmount(Math.min(clm.totalAllowedSar, selectedRemittance.unallocatedRemainderSar));
                      }
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                  >
                    {eligibleClaims.map(clm => (
                      <option key={clm.id} value={clm.id}>
                        {clm.claimNumber} — {clm.patientNameAr} (المعتمد: {clm.totalAllowedSar} ر.س)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">المبلغ المراد تخصيصه وتسويته (ر.س):</label>
                <input
                  type="number"
                  max={selectedRemittance.unallocatedRemainderSar}
                  value={allocationAmount}
                  onChange={e => setAllocationAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAllocateModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmAllocation}
                disabled={eligibleClaims.length === 0 || allocationAmount <= 0}
                className="px-4 py-2 bg-purple-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-xs"
              >
                تأكيد التخصيص المحاسبي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
