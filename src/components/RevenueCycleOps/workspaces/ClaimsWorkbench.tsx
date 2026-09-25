import React, { useState } from 'react';
import {
  FileCheck2,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  Search,
  Building,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  PayerClaim,
  RevenueCycleState,
  ClaimLifecycleStatus,
  ClaimDenial
} from '../../../types/revenueCycle';
import {
  preparePayerClaim,
  simulateClaimSubmission,
  simulatePayerAdjudication
} from '../../../utils/revenueCycleEngine';

interface ClaimsWorkbenchProps {
  state: RevenueCycleState;
  onUpdateClaims: (updatedClaims: PayerClaim[]) => void;
  onAddDenials: (newDenials: ClaimDenial[]) => void;
  onAddAuditLog: (action: string, entityId: string, desc: string) => void;
}

export const ClaimsWorkbench: React.FC<ClaimsWorkbenchProps> = ({
  state,
  onUpdateClaims,
  onAddDenials,
  onAddAuditLog
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<PayerClaim | null>(null);

  // Modal State for Generating Claim from Invoice
  const [showGenerateClaimModal, setShowGenerateClaimModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [generateError, setGenerateError] = useState<string | null>(null);

  const filteredClaims = state.claims.filter(clm => {
    if (state.selectedPatientContextId && clm.patientId !== state.selectedPatientContextId) return false;
    if (statusFilter !== 'all' && clm.lifecycleStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        clm.claimNumber.toLowerCase().includes(q) ||
        clm.patientNameAr.toLowerCase().includes(q) ||
        clm.payerNameAr.toLowerCase().includes(q) ||
        clm.invoiceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Eligible invoices for claim creation (tax invoices with insurance payer not already claimed)
  const eligibleInvoices = state.invoices.filter(inv => {
    if (inv.recipientType !== 'insurance_payer') return false;
    const alreadyHasClaim = state.claims.some(c => c.invoiceId === inv.id);
    return !alreadyHasClaim;
  });

  const handleSimulateSubmit = (claim: PayerClaim) => {
    const updated = simulateClaimSubmission(claim);
    const newList = state.claims.map(c => (c.id === claim.id ? updated : c));
    onUpdateClaims(newList);
    onAddAuditLog('CLAIM_SUBMITTED_NPHIES', claim.id, `تم إرسال المطالبة ${claim.claimNumber} لمنصة نفيس وتلقي إشعار استلام تقني (Ack 200)`);
    if (selectedClaim?.id === claim.id) setSelectedClaim(updated);
  };

  const handleSimulateAdjudication = (claim: PayerClaim, outcome: 'full_approval' | 'partial_approval') => {
    const { adjudicatedClaim, generatedDenials } = simulatePayerAdjudication(claim, outcome);
    const newList = state.claims.map(c => (c.id === claim.id ? adjudicatedClaim : c));
    onUpdateClaims(newList);

    if (generatedDenials.length > 0) {
      onAddDenials(generatedDenials);
    }

    onAddAuditLog(
      'CLAIM_ADJUDICATED',
      claim.id,
      outcome === 'full_approval'
        ? `تم البت المالي بالموافقة الكاملة على المطالبة ${claim.claimNumber} (${claim.totalClaimedSar} ر.س)`
        : `تم البت المالي بموافقة جزئية وتوليد قيد رفض ومتابعة (${generatedDenials[0]?.deniedAmountSar || 0} ر.س)`
    );

    if (selectedClaim?.id === claim.id) setSelectedClaim(adjudicatedClaim);
  };

  const handleCreateClaim = () => {
    setGenerateError(null);
    if (!selectedInvoiceId) {
      setGenerateError('يرجى اختيار الفاتورة الضريبية المستهدفة');
      return;
    }

    const inv = state.invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) return;

    const patientCoverage = state.coverages.find(c => c.patientId === inv.patientId);
    const payerId = patientCoverage?.payerId || 'PAYER-BUPA-01';
    const payerName = patientCoverage?.payerNameAr || 'شركة بوبا العربية للتأمين';

    const result = preparePayerClaim(inv, state.claims, payerId, payerName);

    if (!result.isValid || !result.claim) {
      setGenerateError(result.errorMessageAr || 'تعذر تجهيز المطالبة');
      return;
    }

    onUpdateClaims([result.claim, ...state.claims]);
    onAddAuditLog('CLAIM_CREATED', result.claim.id, `تم تجهيز المطالبة التأمينية ${result.claim.claimNumber} من الفاتورة ${inv.invoiceNumber}`);
    setShowGenerateClaimModal(false);
    setSelectedInvoiceId('');
    setSelectedClaim(result.claim);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <span>مطالبات التأمين الطبي ومنصة نفيس (Insurance Claims & NPHIES Worklist)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إعداد وإرسال ومتابعة دورة حياة المطالبات المالية والبت الآلي وفق معايير NPHIES Financial Services IG
          </p>
        </div>

        <button
          onClick={() => {
            setGenerateError(null);
            setSelectedInvoiceId(eligibleInvoices[0]?.id || '');
            setShowGenerateClaimModal(true);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>تجهيز مطالبة من فاتورة ضريبية</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="البحث برقم المطالبة، الفاتورة، شركة التأمين، أو اسم المريض..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">مرحلة المعالجة:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 bg-slate-50 focus:outline-hidden"
          >
            <option value="all">كافة المطالبات</option>
            <option value="ready_to_submit">جاهزة للإرسال</option>
            <option value="acknowledged_technical">إشعار تقني نفيس (Ack 200)</option>
            <option value="under_payer_review">قيد المراجعة لدى التأمين</option>
            <option value="adjudication_partial">موافقة جزئية (يوجد رفض)</option>
            <option value="adjudication_complete">مكتملة البت (موافقة كاملة)</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">رقم المطالبة / التاريخ</th>
                <th className="py-3 px-4">شركة التأمين</th>
                <th className="py-3 px-4">المريض / الملف</th>
                <th className="py-3 px-4">الفاتورة المقترنة</th>
                <th className="py-3 px-4">المبلغ المطالب</th>
                <th className="py-3 px-4">المبلغ المعتمد</th>
                <th className="py-3 px-4">المرفوض</th>
                <th className="py-3 px-4">حالة البت المالي</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    لا توجد مطالبات تأمين مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredClaims.map(clm => (
                  <tr key={clm.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-blue-700">{clm.claimNumber}</div>
                      <div className="text-[11px] text-slate-400">{clm.claimDate}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{clm.payerNameAr}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{clm.patientNameAr}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{clm.patientMrn}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{clm.invoiceNumber}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {clm.totalClaimedSar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {clm.totalAllowedSar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600">
                      {clm.totalDeniedSar > 0 ? `${clm.totalDeniedSar.toLocaleString()} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          clm.lifecycleStatus === 'adjudication_complete'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : clm.lifecycleStatus === 'adjudication_partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : clm.lifecycleStatus === 'acknowledged_technical'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {clm.lifecycleStatus === 'adjudication_complete'
                          ? 'معتمدة بالكامل'
                          : clm.lifecycleStatus === 'adjudication_partial'
                          ? 'موافقة جزئية (معترضة)'
                          : clm.lifecycleStatus === 'acknowledged_technical'
                          ? 'استلام تقني (Ack 200)'
                          : 'جاهزة للإرسال'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedClaim(clm)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="معاينة تفاصيل المطالبة وبنود البت"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {clm.lifecycleStatus === 'ready_to_submit' && (
                          <button
                            onClick={() => handleSimulateSubmit(clm)}
                            className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-[11px] font-bold cursor-pointer"
                          >
                            إرسال لنفيس
                          </button>
                        )}

                        {clm.lifecycleStatus === 'acknowledged_technical' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSimulateAdjudication(clm, 'full_approval')}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md text-[10px] font-bold cursor-pointer"
                              title="محاكاة موافقة كاملة"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleSimulateAdjudication(clm, 'partial_approval')}
                              className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-md text-[10px] font-bold cursor-pointer"
                              title="محاكاة موافقة جزئية وبند مرفوض"
                            >
                              جزئي/رفض
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  تفاصيل المطالبة التأمينية: {selectedClaim.claimNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mandatory Synthetic Gateway Simulation Banner */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                محاكاة برمجية لتفاعل منصة نفيس — كافة الإرساليات والإشعارات التقنية والقرارات تجريبية (Synthetic NPHIES Gateway Simulation — Not Connected to Production).
              </span>
            </div>

            {/* Critical Business Rules Reminder Strip */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-700" />
                <span>ضوابط NPHIES الأساسية لدورة حياة المطالبات:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-0.5">
                <li>الإشعار التقني بالاستلام (Ack 200) يثبت استلام الحزمة البرمجية فقط ولا يمثل البت المالي الفعلي أو الموافقة (RC15).</li>
                <li>المبالغ المرفوضة في البت لا تتحول تلقائياً إلى ذمة على المريض (RC17).</li>
                <li>الترميز المعتمد للرفض يتبع نظام قرارات نفيس (NPHIES Adjudication) ومفصول عن أكواد X12 CARC/RARC.</li>
              </ul>
            </div>

            {/* Claim Meta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">شركة التأمين:</span>
                <span className="font-bold text-slate-800">{selectedClaim.payerNameAr}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الفاتورة الأصلية المقترنة:</span>
                <span className="font-mono font-bold text-slate-800">{selectedClaim.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">رقم الموافقة المسبقة:</span>
                <span className="font-mono text-indigo-700 font-bold">{selectedClaim.preAuthReference || 'غير مطلوبة'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">حالة البت المالي:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {selectedClaim.lifecycleStatus === 'adjudication_complete'
                    ? 'معتمدة بالكامل'
                    : selectedClaim.lifecycleStatus === 'adjudication_partial'
                    ? 'موافقة جزئية'
                    : 'بانتظار البت'}
                </span>
              </div>
            </div>

            {/* Line items Adjudication Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">الخدمة / SBS</th>
                    <th className="py-2 px-3">المطالب به</th>
                    <th className="py-2 px-3">المعتمد</th>
                    <th className="py-2 px-3">المرفوض</th>
                    <th className="py-2 px-3">كود وسبب الرفض</th>
                    <th className="py-2 px-3">النتيجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedClaim.lines.map(ln => (
                    <tr key={ln.id}>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">{ln.serviceNameAr}</div>
                        <div className="text-[10px] font-mono text-slate-500">{ln.serviceCode}</div>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold">{ln.claimedAmountSar} ر.س</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">{ln.allowedAmountSar} ر.س</td>
                      <td className="py-2 px-3 font-mono font-bold text-red-600">
                        {ln.deniedAmountSar > 0 ? `${ln.deniedAmountSar} ر.س` : '0'}
                      </td>
                      <td className="py-2 px-3 text-[11px]">
                        {ln.denialReasonAr ? (
                          <div>
                            <span className="font-mono text-red-700 font-bold block">{ln.denialCode}</span>
                            <span className="text-slate-600">{ln.denialReasonAr}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ln.adjudicationOutcome === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ln.adjudicationOutcome === 'denied'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ln.adjudicationOutcome === 'approved'
                            ? 'معتمد'
                            : ln.adjudicationOutcome === 'denied'
                            ? 'مرفوض'
                            : 'قيد البت'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions in Modal */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {selectedClaim.lifecycleStatus === 'ready_to_submit' && (
                <button
                  onClick={() => handleSimulateSubmit(selectedClaim)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  إرسال المطالبة لمنصة نفيس الآن
                </button>
              )}

              {selectedClaim.lifecycleStatus === 'acknowledged_technical' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateAdjudication(selectedClaim, 'full_approval')}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    محاكاة موافقة كاملة (Full Approval)
                  </button>
                  <button
                    onClick={() => handleSimulateAdjudication(selectedClaim, 'partial_approval')}
                    className="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 cursor-pointer shadow-xs"
                  >
                    محاكاة موافقة جزئية ورفض (Partial Denial)
                  </button>
                </div>
              )}

              <button
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold mr-auto"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Claim from Tax Invoice Modal */}
      {showGenerateClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>تجهيز مطالبة تأمينية من فاتورة صادرة</span>
              </h3>
              <button
                onClick={() => setShowGenerateClaimModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {generateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{generateError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  اختر الفاتورة الضريبية الصادرة ({eligibleInvoices.length} متاحة):
                </label>
                {eligibleInvoices.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-400">
                    لا توجد فواتير تأمين ضريبية بانتظار تجهيز المطالبات
                  </div>
                ) : (
                  <select
                    value={selectedInvoiceId}
                    onChange={e => setSelectedInvoiceId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                  >
                    {eligibleInvoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.patientNameAr} ({inv.recipientNameAr}) — حصة التأمين: {inv.payerResponsibilitySar} ر.س
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 space-y-1 text-[11px]">
                <div>المعيار النظامي (RC14):</div>
                <div className="text-slate-500">
                  الفاتورة الضريبية ومطالبة التأمين مستندان منفصلان بهويات ودورات حياة مستقلة تماماً.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowGenerateClaimModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateClaim}
                disabled={eligibleInvoices.length === 0}
                className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                تجهيز المطالبة الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
