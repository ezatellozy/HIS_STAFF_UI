import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  History,
  ShieldCheck,
  RefreshCw,
  Landmark,
  ArrowRight,
  ExternalLink,
  Layers,
  FileCode2
} from 'lucide-react';
import {
  TreasuryState,
  PaymentInstruction,
  BankResponse,
  Iso20022StatusCode,
  Iso20022ReasonCode
} from '../../types/treasury';
import {
  simulateExternalSubmission,
  processBankResponse
} from '../../utils/treasuryEngine';

interface PaymentInstructionsWorkspaceProps {
  state: TreasuryState;
  onStateUpdate: (newState: TreasuryState) => void;
}

export const PaymentInstructionsWorkspace: React.FC<PaymentInstructionsWorkspaceProps> = ({
  state,
  onStateUpdate
}) => {
  const [selectedInstruction, setSelectedInstruction] = useState<PaymentInstruction | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showPain001Modal, setShowPain001Modal] = useState(false);

  // ISO 20022 response simulation state
  const [isoStatusCode, setIsoStatusCode] = useState<Iso20022StatusCode>('ACSC');
  const [statusReasonCode, setStatusReasonCode] = useState<Iso20022ReasonCode>('NONE');
  const [responseNarrative, setResponseNarrative] = useState('تمت التسوية البنكية على حساب المدين (ACSC) وتأكيد خصم الحساب بنجاح');
  const [responseRef, setResponseRef] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleSimulateSubmission = (instId: string) => {
    setActionError(null);
    setActionSuccess(null);
    const res = simulateExternalSubmission(state, instId);
    if (!res.success) {
      setActionError(res.error || 'فشل إرسال أمر الصرف للمحاكاة');
      return;
    }
    if (res.newState) {
      onStateUpdate(res.newState);
      setActionSuccess(`تم إرسال أمر الدفع بنجاح عبر شبكة سريع المحاكية (Status: simulated_external_submitted).`);
    }
  };

  const handleOpenResponseModal = (inst: PaymentInstruction) => {
    setSelectedInstruction(inst);
    setIsoStatusCode('ACSC');
    setStatusReasonCode('NONE');
    setResponseNarrative('تمت التسوية البنكية على حساب المدين (ACSC) وتأكيد خصم الحساب بنجاح لصالح المستفيد');
    setResponseRef(`SARIE-SETTLE-${Math.floor(100000 + Math.random() * 900000)}`);
    setActionError(null);
    setShowResponseModal(true);
  };

  const handleOpenAudit = (inst: PaymentInstruction) => {
    setSelectedInstruction(inst);
    setShowAuditModal(true);
  };

  const handleOpenPain001 = (inst: PaymentInstruction) => {
    setSelectedInstruction(inst);
    setShowPain001Modal(true);
  };

  const handleExecuteResponseSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstruction) return;

    let internalStatus: BankResponse['status'] = 'bank_accepted_for_processing';
    let confirmedAmount = 0;
    let rejectedAmount = 0;

    if (isoStatusCode === 'ACSC' || isoStatusCode === 'ACCC') {
      internalStatus = 'confirmed';
      confirmedAmount = selectedInstruction.amount;
    } else if (isoStatusCode === 'RJCT') {
      internalStatus = 'rejected';
      rejectedAmount = selectedInstruction.amount;
    } else {
      // ACTC, ACCP, ACSP are technical/profile validation - confirmedAmount remains 0.00
      internalStatus = 'bank_accepted_for_processing';
      confirmedAmount = 0;
    }

    const res = processBankResponse(state, selectedInstruction.id, {
      responseTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messageType: 'pain.002',
      isoStatusCode,
      statusReasonCode: isoStatusCode === 'RJCT' ? statusReasonCode : 'NONE',
      status: internalStatus,
      bankTransactionRef: responseRef || `TXN-${Date.now()}`,
      confirmedAmount,
      rejectedAmount,
      returnedAmount: 0,
      feeDeductedAmount: 0,
      bankResponseCode: isoStatusCode,
      bankMessageAr: responseNarrative
    });

    if (!res.success) {
      setActionError(res.error || 'فشل تسجيل استجابة البنك المحاكية');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowResponseModal(false);
      setActionSuccess(`تم تسجيل إشعار البنك (pain.002 - ${isoStatusCode}) بنجاح.`);
    }
  };

  return (
    <div id="payment-instructions-workspace" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>سجل أوامر الدفع البنكية واستجابات سريع (Payment Instructions & Bank Responses)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            إرسال أوامر الصرف المعتمدة، وتتبع الحالات، وتسجيل استجابات البنك المحاكية مع الاحتفاظ بالسجل التاريخي الكامل لجميع الإشعارات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
            إجمالي الأوامر: {state.instructions.length}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Instructions Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                <th className="p-3">رقم أمر الصرف</th>
                <th className="p-3">المستفيد والحساب</th>
                <th className="p-3">حساب الخزينة المصدر</th>
                <th className="p-3">المبلغ وقناة الصرف</th>
                <th className="p-3">حالة التنفيذ</th>
                <th className="p-3">إشعارات البنك المسجلة</th>
                <th className="p-3">إجراءات المحاكاة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {state.instructions.map(inst => {
                const sourceAcc = state.accounts.find(a => a.id === inst.sourceAccountId);
                const isConfirmed = inst.status === 'bank_confirmed';
                const isRejected = inst.status === 'bank_rejected';
                const isSubmitted = inst.status === 'simulated_external_submitted';
                const isPending = inst.status === 'authorized_pending_release';

                return (
                  <tr key={inst.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                    <td className="p-3">
                      <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{inst.id}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">المرجع: {inst.proposalBatchReference}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        التاريخ المجدول: {inst.scheduledDate}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{inst.beneficiaryName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{inst.beneficiaryIbanMasked}</div>
                      <div className="text-[10px] text-neutral-400">
                        {inst.lines.length} أسطر فواتير مرتبطة
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200">
                        {sourceAcc?.displayNameAr || inst.sourceAccountId}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {sourceAcc?.bankNameAr} ({sourceAcc?.currency})
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-sm font-mono text-neutral-900 dark:text-neutral-100">
                        {inst.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {inst.currency}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {inst.executionRail === 'sarie_instant'
                          ? 'سريع فوري (IPS)'
                          : inst.executionRail === 'sarie_ach_batch'
                          ? 'سريع مجدول (ACH)'
                          : 'حوالة دولية (SWIFT)'}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isConfirmed
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : isRejected
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : isSubmitted
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isConfirmed
                          ? 'مؤكد ومخصوم بنكياً'
                          : isRejected
                          ? 'مرفوض من البنك'
                          : isSubmitted
                          ? 'مرسل عبر سريع'
                          : 'معتمد بانتظار الإرسال'}
                      </span>

                      {inst.simulatedSubmissionTimestamp && (
                        <div className="text-[10px] text-neutral-400 mt-1 font-mono">
                          أرسل: {inst.simulatedSubmissionTimestamp.substring(11, 16)}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleOpenAudit(inst)}
                        className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 underline font-mono"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>{inst.bankResponses.length} إشعار بنكي</span>
                      </button>
                      {inst.bankResponses.length > 0 && (
                        <div className="text-[10px] text-neutral-500 truncate max-w-xs mt-0.5">
                          آخر إشعار: {inst.bankResponses[inst.bankResponses.length - 1].bankResponseCode} (
                          {inst.bankResponses[inst.bankResponses.length - 1].status})
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-1.5">
                        {isPending && (
                          <button
                            onClick={() => handleSimulateSubmission(inst.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>محاكاة الإرسال (pain.001)</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenResponseModal(inst)}
                            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-[11px] font-semibold px-2 py-1 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>إشعار pain.002</span>
                          </button>

                          <button
                            onClick={() => handleOpenPain001(inst)}
                            title="معاينة ملف pain.001 المحاكي"
                            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[11px] px-2 py-1 rounded transition-colors inline-flex items-center gap-1 font-mono"
                          >
                            <FileCode2 className="w-3 h-3" />
                            <span>XML</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: SIMULATE ISO 20022 BANK RESPONSE (pain.002) */}
      {showResponseModal && selectedInstruction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                تسجيل إشعار بنكي محاكى (ISO 20022 pain.002)
              </h3>
              <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
                SYNTHETIC SAMPLE
              </span>
            </div>
            <p className="text-xs text-neutral-500 mb-4 font-mono">
              {selectedInstruction.id} • {selectedInstruction.beneficiaryName}
            </p>

            {actionError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {actionError}
              </div>
            )}

            <form onSubmit={handleExecuteResponseSimulation} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">رمز حالة المعاملة البنكية (pain.002 &lt;TxSts&gt;) *</label>
                <select
                  value={isoStatusCode}
                  onChange={e => {
                    const st = e.target.value as Iso20022StatusCode;
                    setIsoStatusCode(st);
                    if (st === 'ACSC') {
                      setResponseNarrative('تمت التسوية البنكية على حساب المدين (ACSC) وتأكيد خصم الحساب بنجاح');
                      setStatusReasonCode('NONE');
                    } else if (st === 'ACCC') {
                      setResponseNarrative('تمت التسوية البنكية على حساب الدائن (ACCC) وتأكيد إيداع المبلغ');
                      setStatusReasonCode('NONE');
                    } else if (st === 'ACTC') {
                      setResponseNarrative('قبول التحقق الفني (ACTC) - قيد المعالجة (ليست تسوية نهائية للمبلغ)');
                      setStatusReasonCode('NONE');
                    } else if (st === 'ACCP') {
                      setResponseNarrative('قبول ملف العميل (ACCP) - قيد المعالجة (ليست تسوية نهائية للمبلغ)');
                      setStatusReasonCode('NONE');
                    } else if (st === 'ACSP') {
                      setResponseNarrative('التسوية قيد المعالجة (ACSP) - المعاملة مقبولة وتنتظر دورة المقاصة');
                      setStatusReasonCode('NONE');
                    } else if (st === 'RJCT') {
                      setResponseNarrative('تم رفض أمر التحويل (RJCT) من بنك المستفيد');
                      setStatusReasonCode('AC04');
                    }
                  }}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-sans"
                >
                  <option value="ACSC">ACSC — تسوية مكتملة لدى بنك المدين (Settlement Completed - Debtor Agent) [تسوية نهائية]</option>
                  <option value="ACCC">ACCC — تسوية مكتملة لدى بنك الدائن (Settlement Completed - Creditor Agent) [تسوية نهائية]</option>
                  <option value="ACTC">ACTC — قبول التحقق الفني (Accepted Technical Validation) [تحقق فني - لا تسوية]</option>
                  <option value="ACCP">ACCP — قبول ملف العميل (Accepted Customer Profile) [ملف عميل - لا تسوية]</option>
                  <option value="ACSP">ACSP — التسوية قيد المعالجة (Accepted Settlement in Process) [معالجة - لا تسوية]</option>
                  <option value="RJCT">RJCT — أمر دفع مرفوض من البنك (Rejected Payment Status) [رفض]</option>
                </select>
              </div>

              {isoStatusCode === 'RJCT' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-800 space-y-2">
                  <label className="block font-semibold text-rose-800 dark:text-rose-200">
                    رمز سبب الرفض البنكي (&lt;StsRsnInf&gt;/&lt;Rsn&gt;/&lt;Cd&gt;) *
                  </label>
                  <select
                    value={statusReasonCode}
                    onChange={e => {
                      const rc = e.target.value as Iso20022ReasonCode;
                      setStatusReasonCode(rc);
                      if (rc === 'AC04') {
                        setResponseNarrative('مرفوض: رقم حساب المستفيد مغلق أو غير موجود (AC04 - Closed Account Number)');
                      } else if (rc === 'AM04') {
                        setResponseNarrative('مرفوض: عدم كفاية الرصيد لتغطية التحويل (AM04 - Insufficient Funds)');
                      } else if (rc === 'AG01') {
                        setResponseNarrative('مرفوض: المعاملة محظورة بموجب السياسات المصرفية (AG01 - Transaction Forbidden)');
                      } else if (rc === 'RC01') {
                        setResponseNarrative('مرفوض: رمز البنك غير صحيح (RC01 - Bank Identifier Invalid)');
                      }
                    }}
                    className="w-full p-2 rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-neutral-800 font-mono"
                  >
                    <option value="AC04">AC04 — رقم الحساب مغلق أو غير موجود (Closed Account Number) [سبب وليس حالة]</option>
                    <option value="AM04">AM04 — عدم كفاية الرصيد (Insufficient Funds)</option>
                    <option value="AG01">AG01 — المعاملة محظورة نظامياً (Transaction Forbidden)</option>
                    <option value="RC01">RC01 — رمز البنك غير صحيح (Bank Identifier Invalid)</option>
                  </select>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400">
                    * تنبيه معياري: AC04 هو رمز سبب رفض (Reason Code) تابع لحالة RJCT، وليس رمز حالة دفع مستقل.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">رمز الاستجابة البنكي (Code)</label>
                  <input
                    type="text"
                    readOnly
                    value={isoStatusCode}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">مرجع العملية البنكي (Ref)</label>
                  <input
                    type="text"
                    required
                    value={responseRef}
                    onChange={e => setResponseRef(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">نص إشعار البنك (Narrative Ar)</label>
                <input
                  type="text"
                  required
                  value={responseNarrative}
                  onChange={e => setResponseNarrative(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                {isoStatusCode === 'ACTC' || isoStatusCode === 'ACCP' || isoStatusCode === 'ACSP' ? (
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">
                    تنبيه: قبول التحقق الفني (ACTC) أو ملف العميل (ACCP) لا يعتبر تسوية نهائية للمبلغ ولا يؤدي لاعتبار الفواتير مدفوعة. المبلغ المؤكد المسجل سيكون 0.00 ر.س.
                  </span>
                ) : isoStatusCode === 'RJCT' ? (
                  <span className="text-rose-700 dark:text-rose-400 font-semibold">
                    تنبيه: الرفض البنكي (RJCT) يثبت المبلغ المؤكد بصفر (0.00 ر.س) ويحول كامل القيمة إلى مبالغ مرفوضة لفتح تتبع التدقيق.
                  </span>
                ) : (
                  <span>
                    تأكيد البنك (ACSC / ACCC) هو السند الرقابي الوحيد الذي يسمح للحسابات الدائنة (AP) باعتبار الفواتير مؤهلة للتسوية الدفترية.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  تأكيد تسجيل الإشعار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUDIT LOG OF BANK RESPONSES */}
      {showAuditModal && selectedInstruction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              السجل التاريخي لإشعارات البنك (Audit History of Responses)
            </h3>
            <p className="text-xs text-neutral-500 mb-4 font-mono">
              أمر الدفع: {selectedInstruction.id}
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selectedInstruction.bankResponses.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-6">
                  لا توجد استجابات بنكية مسجلة بعد لهذا الأمر.
                </div>
              ) : (
                selectedInstruction.bankResponses.map((resp, idx) => (
                  <div
                    key={resp.id || idx}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      resp.isConflictingWithPriorResponse
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="flex items-center gap-1">
                        <span>{resp.bankResponseCode}</span>
                        {resp.statusReasonCode && resp.statusReasonCode !== 'NONE' && (
                          <span className="text-[10px] text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-1.5 py-0.5 rounded">
                            سبب: {resp.statusReasonCode}
                          </span>
                        )}
                        <span className="text-[10px] font-normal text-neutral-500">({resp.status})</span>
                      </span>
                      <span className="text-[10px] text-neutral-500">{resp.responseTimestamp}</span>
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-300">{resp.bankMessageAr}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      مرجع البنك: {resp.bankTransactionRef} • مؤكد: {resp.confirmedAmount.toLocaleString()} ر.س
                    </div>
                    {resp.isConflictingWithPriorResponse && (
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>إشعار متعارض مع حالة سابقة مسجلة - تم إحالة المعاملة للتحقيق الرقابي</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
              >
                إغلاق السجل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SYNTHETIC PAIN.001 INSPECTION MODAL */}
      {showPain001Modal && selectedInstruction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-blue-600" />
                  <span>معاينة رسالة أمر الصرف (ISO 20022 pain.001.001.03)</span>
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Instruction ID: {selectedInstruction.id}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold font-mono px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  SYNTHETIC SAMPLE — NOT BANK VALIDATED
                </span>
              </div>
            </div>

            <div className="bg-neutral-950 text-neutral-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
              <div className="text-amber-400 mb-2">
                &lt;!-- SYNTHETIC SAMPLE — NOT BANK VALIDATED --&gt;
              </div>
              <div className="text-neutral-400 mb-2">
                &lt;!-- Hospital Synthetic Treasury System | Illustrative Preview --&gt;
              </div>
              <div>&lt;Document xmlns=&quot;urn:iso:std:iso:20022:tech:xsd:pain.001.001.03&quot;&gt;</div>
              <div className="pl-4">&lt;CstmrCdtTrfInitn&gt;</div>
              <div className="pl-8">&lt;GrpHdr&gt;</div>
              <div className="pl-12">&lt;MsgId&gt;{selectedInstruction.id}&lt;/MsgId&gt;</div>
              <div className="pl-12">&lt;CreDtTm&gt;{selectedInstruction.scheduledDate}T10:00:00Z&lt;/CreDtTm&gt;</div>
              <div className="pl-12">&lt;NbOfTxs&gt;{selectedInstruction.lines.length}&lt;/NbOfTxs&gt;</div>
              <div className="pl-12">&lt;CtrlSum&gt;{selectedInstruction.amount.toFixed(2)}&lt;/CtrlSum&gt;</div>
              <div className="pl-12">&lt;InitgPty&gt;&lt;Nm&gt;Specialized Hospital Org (LEGAL-ORG-001)&lt;/Nm&gt;&lt;/InitgPty&gt;</div>
              <div className="pl-8">&lt;/GrpHdr&gt;</div>
              <div className="pl-8">&lt;PmtInf&gt;</div>
              <div className="pl-12">&lt;PmtInfId&gt;PMT-INF-{selectedInstruction.id}&lt;/PmtInfId&gt;</div>
              <div className="pl-12">&lt;PmtMtd&gt;TRF&lt;/PmtMtd&gt;</div>
              <div className="pl-12">&lt;ReqdExctnDt&gt;{selectedInstruction.scheduledDate}&lt;/ReqdExctnDt&gt;</div>
              <div className="pl-12">&lt;Dbtr&gt;&lt;Nm&gt;Specialized Hospital Org&lt;/Nm&gt;&lt;/Dbtr&gt;</div>
              <div className="pl-12">&lt;DbtrAcct&gt;&lt;Id&gt;&lt;Othr&gt;&lt;Id&gt;{selectedInstruction.sourceAccountId}&lt;/Id&gt;&lt;/Othr&gt;&lt;/Id&gt;&lt;/DbtrAcct&gt;</div>
              <div className="pl-12">&lt;CdtTrfTxInf&gt;</div>
              <div className="pl-16">&lt;PmtId&gt;&lt;EndToEndId&gt;E2E-{selectedInstruction.id}&lt;/EndToEndId&gt;&lt;/PmtId&gt;</div>
              <div className="pl-16">&lt;Amt&gt;&lt;InstdAmt Ccy=&quot;{selectedInstruction.currency}&quot;&gt;{selectedInstruction.amount.toFixed(2)}&lt;/InstdAmt&gt;&lt;/Amt&gt;</div>
              <div className="pl-16">&lt;Cdtr&gt;&lt;Nm&gt;{selectedInstruction.beneficiaryName}&lt;/Nm&gt;&lt;/Cdtr&gt;</div>
              <div className="pl-16">&lt;CdtrAcct&gt;&lt;Id&gt;&lt;IBAN&gt;{selectedInstruction.beneficiaryIbanMasked}&lt;/IBAN&gt;&lt;/Id&gt;&lt;/CdtrAcct&gt;</div>
              <div className="pl-16">&lt;RmtInf&gt;&lt;Ustrd&gt;Batch: {selectedInstruction.proposalBatchReference}&lt;/Ustrd&gt;&lt;/RmtInf&gt;</div>
              <div className="pl-12">&lt;/CdtTrfTxInf&gt;</div>
              <div className="pl-8">&lt;/PmtInf&gt;</div>
              <div className="pl-4">&lt;/CstmrCdtTrfInitn&gt;</div>
              <div>&lt;/Document&gt;</div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 mt-3 leading-relaxed">
              <strong>تنويه الرقابة المصرفية:</strong> ملف pain.001 أعلاه هو عينة توضيحية خاضعة لحدود المحاكاة؛ لا يتم إرسال أي معاملات لخوادم البنوك الحقيقية ولا يدعي النظام حصوله على اعتمادية مصرفية نهائية.
            </div>

            <div className="flex items-center justify-end pt-4 mt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowPain001Modal(false)}
                className="px-4 py-2 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
