import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  FileMinus,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import {
  PatientInvoice,
  ChargeEventReference,
  RevenueCycleState,
  InvoiceLifecycleStatus
} from '../../../types/revenueCycle';
import { createPatientInvoice, correctPatientInvoice } from '../../../utils/revenueCycleEngine';

interface InvoicesAccountsWorkspaceProps {
  state: RevenueCycleState;
  onUpdateInvoices: (updatedInvoices: PatientInvoice[]) => void;
  onUpdateCharges: (updatedCharges: ChargeEventReference[]) => void;
  onAddAuditLog: (action: string, entityId: string, desc: string) => void;
}

export const InvoicesAccountsWorkspace: React.FC<InvoicesAccountsWorkspaceProps> = ({
  state,
  onUpdateInvoices,
  onUpdateCharges,
  onAddAuditLog
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PatientInvoice | null>(null);

  // Modal States
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  // Generate Invoice Form State
  const [genPatientId, setGenPatientId] = useState('pat-1001');
  const [genRecipientType, setGenRecipientType] = useState<'patient' | 'insurance_payer'>('insurance_payer');
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Correction Form State
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionAmount, setCorrectionAmount] = useState<number>(0);

  const filteredInvoices = state.invoices.filter(inv => {
    if (state.selectedPatientContextId && inv.patientId !== state.selectedPatientContextId) return false;
    if (statusFilter !== 'all' && inv.lifecycleStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.patientNameAr.toLowerCase().includes(q) ||
        inv.patientMrn.toLowerCase().includes(q) ||
        inv.recipientNameAr.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Available unbilled charges for the selected patient
  const availableUnbilledCharges = state.charges.filter(
    c => c.patientId === genPatientId && c.billabilityStatus === 'billable' && !c.consumedInInvoiceId
  );

  const handleToggleChargeSelect = (chargeId: string) => {
    setSelectedChargeIds(prev =>
      prev.includes(chargeId) ? prev.filter(id => id !== chargeId) : [...prev, chargeId]
    );
  };

  const handleGenerateInvoice = () => {
    setGenerateError(null);
    if (selectedChargeIds.length === 0) {
      setGenerateError('يرجى تحديد بند رسوم واحد على الأقل لإصدار الفاتورة');
      return;
    }

    const chargesToBill = state.charges.filter(c => selectedChargeIds.includes(c.id));
    const patientCoverage = state.coverages.find(c => c.patientId === genPatientId);
    const firstCharge = chargesToBill[0];

    const recipientName =
      genRecipientType === 'patient'
        ? `${firstCharge.patientNameAr} (سداد مباشر)`
        : patientCoverage?.payerNameAr || 'شركة بوبا العربية للتأمين';

    const result = createPatientInvoice(
      chargesToBill,
      state.charges,
      genPatientId,
      firstCharge.patientMrn,
      firstCharge.patientNameAr,
      '27508120102914',
      true, // Saudi Citizen
      genRecipientType,
      recipientName,
      firstCharge.encounterId,
      firstCharge.departmentAr
    );

    if (!result.isValid || !result.invoice) {
      setGenerateError(result.errorMessageAr || 'تعذر إصدار الفاتورة');
      return;
    }

    onUpdateInvoices([result.invoice, ...state.invoices]);
    if (result.updatedCharges) {
      onUpdateCharges(result.updatedCharges);
    }

    onAddAuditLog('INVOICE_GENERATED', result.invoice.id, `تم إصدار الفاتورة ${result.invoice.invoiceNumber} بقيمة ${result.invoice.grandTotalSar} ر.س`);
    setShowGenerateModal(false);
    setSelectedChargeIds([]);
    setSelectedInvoice(result.invoice);
  };

  const handleCorrectInvoice = () => {
    if (!selectedInvoice) return;
    if (!correctionReason.trim()) {
      alert('يرجى إدخال سبب التصريح بالإشعار الدائن');
      return;
    }

    const { creditNote, updatedOriginalInvoice } = correctPatientInvoice(
      selectedInvoice,
      correctionReason,
      correctionAmount || selectedInvoice.grandTotalSar
    );

    const updatedList = state.invoices.map(inv =>
      inv.id === selectedInvoice.id ? updatedOriginalInvoice : inv
    );

    onUpdateInvoices([creditNote, ...updatedList]);
    onAddAuditLog('INVOICE_CORRECTED', selectedInvoice.id, `تم تصحيح الفاتورة بموجب الإشعار الدائن ${creditNote.invoiceNumber}`);
    setShowCorrectionModal(false);
    setSelectedInvoice(updatedOriginalInvoice);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>سجل فواتير المرضى والحسابات المالية (Patient Invoices & Accounts)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            نماذج تجريبية للفواتير الضريبية والمبسطة والإشعارات الدائنة — SYNTHETIC INVOICE PREVIEW — NOT LEGALLY ISSUED OR ZATCA VALIDATED
          </p>
        </div>

        <button
          onClick={() => {
            setGenerateError(null);
            setSelectedChargeIds([]);
            setShowGenerateModal(true);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إصدار فاتورة من الرسوم المعتمدة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="البحث برقم الفاتورة، اسم المريض، الملف الطبي أو المستلم..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">حالة الفاتورة:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 bg-slate-50 focus:outline-hidden"
          >
            <option value="all">كافة الفواتير والإشعارات</option>
            <option value="partially_paid">مسددة جزئياً (متبقي ذمة)</option>
            <option value="issued_simulation">مصدرة بانتظار السداد</option>
            <option value="paid_closed">مسددة ومقفلة بالكامل</option>
            <option value="corrected">مصححة بإشعار دائن</option>
            <option value="credited">إشعار دائن (Credit Note)</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">رقم الفاتورة / التاريخ</th>
                <th className="py-3 px-4">المريض / الملف</th>
                <th className="py-3 px-4">نوع الفاتورة والمستلم</th>
                <th className="py-3 px-4">الإجمالي الكلي</th>
                <th className="py-3 px-4">حصة المريض</th>
                <th className="py-3 px-4">حصة التأمين</th>
                <th className="py-3 px-4">المتبقي للتحصيل</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">معاينة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا توجد فواتير مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-blue-700">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400">{inv.invoiceDate} {inv.issueTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{inv.patientNameAr}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.patientMrn}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{inv.recipientNameAr}</div>
                      <span className="text-[10px] text-slate-400">
                        {inv.invoiceType === 'tax_invoice'
                          ? 'فاتورة ضريبية (B2B)'
                          : inv.invoiceType === 'simplified_tax_invoice'
                          ? 'فاتورة ضريبية مبسطة (B2C)'
                          : 'إشعار دائن (Credit Note)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.grandTotalSar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {inv.patientResponsibilitySar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-700 font-semibold">
                      {inv.payerResponsibilitySar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-red-600">
                      {inv.totalOutstandingBalanceSar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.lifecycleStatus === 'paid_closed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.lifecycleStatus === 'partially_paid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : inv.lifecycleStatus === 'corrected'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : inv.lifecycleStatus === 'credited'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {inv.lifecycleStatus === 'paid_closed'
                          ? 'مسددة بالكامل'
                          : inv.lifecycleStatus === 'partially_paid'
                          ? 'مسددة جزئياً'
                          : inv.lifecycleStatus === 'corrected'
                          ? 'مصححة بإشعار دائن'
                          : inv.lifecycleStatus === 'credited'
                          ? 'إشعار دائن'
                          : 'بانتظار السداد'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 cursor-pointer"
                        title="معاينة الفاتورة وتفاصيل البنود"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal with Persistent Synthetic Disclaimer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  معاينة الفاتورة: {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mandatory Synthetic Preview Banner */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{selectedInvoice.zatcaComplianceNotice}</span>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">المريض:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.patientNameAr}</span>
                <span className="font-mono text-slate-500 block text-[10px]">{selectedInvoice.patientMrn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">المستلم:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.recipientNameAr}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">تاريخ ووقت الإصدار:</span>
                <span className="font-mono text-slate-800">{selectedInvoice.invoiceDate} {selectedInvoice.issueTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">المتبقي للتحصيل:</span>
                <span className="font-mono font-black text-red-600 text-sm">{selectedInvoice.totalOutstandingBalanceSar.toLocaleString()} ر.س</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">الخدمة / الإجراء</th>
                    <th className="py-2 px-3">الكمية</th>
                    <th className="py-2 px-3">سعر الوحدة</th>
                    <th className="py-2 px-3">الخصم</th>
                    <th className="py-2 px-3">حصة المريض</th>
                    <th className="py-2 px-3">حصة التأمين</th>
                    <th className="py-2 px-3">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.lines.map(ln => (
                    <tr key={ln.id}>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">{ln.serviceNameAr}</div>
                        <div className="text-[10px] font-mono text-teal-700">{ln.serviceCode}</div>
                      </td>
                      <td className="py-2 px-3 font-mono">{ln.quantity}</td>
                      <td className="py-2 px-3 font-mono">{ln.unitPriceSar}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{ln.discountAmountSar}</td>
                      <td className="py-2 px-3 font-mono text-blue-700 font-bold">{ln.patientShareSar}</td>
                      <td className="py-2 px-3 font-mono text-teal-700 font-bold">{ln.payerShareSar}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{ln.lineTotalSar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs gap-3">
              <div className="space-y-1">
                <div>المدفوع من المريض (إيصالات كاشير): <strong className="font-mono text-emerald-700">{selectedInvoice.allocatedCashierReceiptSar} ر.س</strong></div>
                <div>المسدد من التأمين (تحويلات بنكية): <strong className="font-mono text-teal-700">{selectedInvoice.allocatedPayerRemittanceSar} ر.س</strong></div>
              </div>
              <div className="text-left space-y-1 sm:border-r sm:pr-6 sm:border-slate-200">
                <div className="text-slate-500">إجمالي الفاتورة: <strong className="font-mono text-slate-900 text-sm">{selectedInvoice.grandTotalSar.toLocaleString()} ر.س</strong></div>
                <div className="text-red-700 font-bold">الرصيد المتبقي: <strong className="font-mono text-red-600 text-base">{selectedInvoice.totalOutstandingBalanceSar.toLocaleString()} ر.س</strong></div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedInvoice.lifecycleStatus !== 'corrected' && selectedInvoice.invoiceType !== 'credit_note' && (
                <button
                  onClick={() => {
                    setCorrectionReason('');
                    setCorrectionAmount(selectedInvoice.grandTotalSar);
                    setShowCorrectionModal(true);
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileMinus className="w-3.5 h-3.5" />
                  <span>تصحيح الفاتورة بإشعار دائن (Credit Note)</span>
                </button>
              )}

              <div className="flex items-center gap-2 mr-auto">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice from Approved Charges Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>إصدار فاتورة جديدة من الرسوم السريرية المعتمدة</span>
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {generateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generateError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">المريض المستهدف:</label>
                <select
                  value={genPatientId}
                  onChange={e => {
                    setGenPatientId(e.target.value);
                    setSelectedChargeIds([]);
                    setGenRecipientType(e.target.value === 'pat-1005' ? 'patient' : 'insurance_payer');
                  }}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                >
                  <option value="pat-1001">محمود سعد الدين (MRN-2026-0814) — تأمين بوبا VIP</option>
                  <option value="pat-1002">نوران حسام الشافعي (MRN-2026-0820) — تأمين التعاونية A</option>
                  <option value="pat-1005">سميحة فتحي عبد الجواد (MRN-2026-0850) — سداد نقدي (Self-Pay)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">المستلم والنمط الضريبي:</label>
                <select
                  value={genRecipientType}
                  onChange={e => setGenRecipientType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                >
                  <option value="insurance_payer">شركة التأمين (فاتورة ضريبية قياسية B2B)</option>
                  <option value="patient">المريض مباشرة (فاتورة ضريبية مبسطة B2C)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  البنود السريرية المعتمدة غير المفوترة ({availableUnbilledCharges.length}):
                </label>
                {availableUnbilledCharges.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-400">
                    لا توجد بنود رسوم غير مفوترة لهذا المريض حالياً
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 p-2 rounded-lg">
                    {availableUnbilledCharges.map(chg => (
                      <label
                        key={chg.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 border border-slate-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedChargeIds.includes(chg.id)}
                            onChange={() => handleToggleChargeSelect(chg.id)}
                            className="rounded-sm text-blue-600"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">{chg.serviceNameAr}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{chg.serviceCode} • {chg.departmentAr}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{chg.totalWithTaxSar} ر.س</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerateInvoice}
                disabled={availableUnbilledCharges.length === 0}
                className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                تأكيد وإصدار الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Correction Modal */}
      {showCorrectionModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileMinus className="w-5 h-5 text-rose-600" />
                <span>إصدار إشعار دائن (Credit Note)</span>
              </h3>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">الفاتورة المستهدفة بالتصحيح:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.invoiceNumber} ({selectedInvoice.grandTotalSar} ر.س)</span>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">سبب التصحيح المالي:</label>
                <textarea
                  rows={2}
                  placeholder="مثال: تعديل خطأ في نسبة التحمل التأميني بعد مراجعة الوثيقة..."
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">مبلغ الإشعار الدائن (ر.س):</label>
                <input
                  type="number"
                  value={correctionAmount}
                  onChange={e => setCorrectionAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCorrectInvoice}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                تأكيد وإصدار الإشعار الدائن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
