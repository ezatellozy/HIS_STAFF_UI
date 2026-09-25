import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
  Send,
  Lock,
  Eye,
  Sliders,
  Settings2
} from 'lucide-react';
import {
  TreasuryState,
  PaymentAuthorization,
  TreasuryApprovalPolicyConfig,
  ILLUSTRATIVE_APPROVAL_POLICY
} from '../../types/treasury';
import {
  reviewPaymentAuthorization,
  generatePaymentInstruction
} from '../../utils/treasuryEngine';

interface PaymentAuthorizationsWorkspaceProps {
  state: TreasuryState;
  onStateUpdate: (newState: TreasuryState) => void;
  onNavigateToInstructions?: () => void;
}

export const PaymentAuthorizationsWorkspace: React.FC<PaymentAuthorizationsWorkspaceProps> = ({
  state,
  onStateUpdate,
  onNavigateToInstructions
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAuth, setSelectedAuth] = useState<PaymentAuthorization | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'return' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form for Generating Instruction
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [targetBankAccountId, setTargetBankAccountId] = useState('TREAS-ACC-SNB-01');
  const [executionRail, setExecutionRail] = useState<'sarie_instant' | 'sarie_ach_batch' | 'swift_wire'>('sarie_instant');

  // Configurable Illustrative Approval Threshold Policy (Synthetic Policy Data - Not Hardcoded Hospital Policy)
  const [approvalPolicy, setApprovalPolicy] = useState<TreasuryApprovalPolicyConfig>(ILLUSTRATIVE_APPROVAL_POLICY);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editThresholdSar, setEditThresholdSar] = useState<number>(approvalPolicy.cfoSecondaryApprovalThresholdSar);
  const [policyUpdatedMsg, setPolicyUpdatedMsg] = useState<string | null>(null);

  const filteredAuths = state.authorizations.filter(a => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return a.status === 'pending_review' || a.status === 'under_dual_review';
    if (filterStatus === 'approved') return a.status === 'approved';
    if (filterStatus === 'blocked') return a.status === 'blocked_by_policy';
    return a.status === filterStatus;
  });

  const handleOpenReview = (auth: PaymentAuthorization, action: 'approve' | 'return' | 'reject') => {
    setSelectedAuth(auth);
    setReviewAction(action);
    setReviewNotes('');
    setActionError(null);
    setSuccessMessage(null);
    setShowReviewModal(true);
  };

  const handleExecuteReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuth) return;

    // Checker actor determination
    const actor = state.activePersona === 'treasury_supervisor'
      ? 'سليمان القحطاني (مشرف الخزينة)'
      : state.activePersona === 'finance_controller'
      ? 'عبدالرحمن العتيبي (المدير المالي التنفيذي)'
      : 'طارق العمري (كاتب الخزينة)';

    const res = reviewPaymentAuthorization(
      state,
      selectedAuth.id,
      reviewAction,
      actor,
      reviewNotes || undefined
    );

    if (!res.success) {
      setActionError(res.error || 'فشل تنفيذ المراجعة الرقابية');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowReviewModal(false);
      setSuccessMessage(`تم تنفيذ الإجراء (${reviewAction === 'approve' ? 'اعتماد الدفع' : reviewAction === 'return' ? 'إعادة إلى الحسابات الدائنة' : 'رفض الطلب'}) بنجاح.`);
    }
  };

  const handleOpenGenerateInstruction = (auth: PaymentAuthorization) => {
    setSelectedAuth(auth);
    setActionError(null);
    setSuccessMessage(null);
    setShowInstructionModal(true);
  };

  const handleExecuteGenerateInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuth) return;

    const maker = state.activePersona === 'treasury_clerk'
      ? 'طارق العمري (كاتب الخزينة)'
      : 'سليمان القحطاني (مدير الخزينة)';

    const res = generatePaymentInstruction(
      state,
      selectedAuth.id,
      targetBankAccountId,
      executionRail,
      maker
    );

    if (!res.success) {
      setActionError(res.error || 'فشل إصدار أمر الدفع البنكي');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowInstructionModal(false);
      setSuccessMessage(`تم إنشاء أمر الدفع البنكي بنجاح برقم (${res.instructionId}). يمكنك الآن محاكاة الإرسال عبر سريع.`);
    }
  };

  return (
    <div id="payment-authorizations-workspace" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>تراخيص الصرف والرقابة الثنائية (Payment Authorizations & Maker-Checker)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            مراجعة مقترحات الصرف الواردة من الحسابات الدائنة (AP Proposals) والتأكد من أهلية المستفيد والرقابة الثنائية قبل تحرير أوامر الدفع.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              الكل ({state.authorizations.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              قيد المراجعة ({state.authorizations.filter(a => a.status === 'pending_review' || a.status === 'under_dual_review').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'approved'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              معتمد للصرف ({state.authorizations.filter(a => a.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilterStatus('blocked')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'blocked'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              محظور نظامياً ({state.authorizations.filter(a => a.status === 'blocked_by_policy').length})
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          {onNavigateToInstructions && (
            <button
              onClick={onNavigateToInstructions}
              className="font-bold underline text-xs text-emerald-700 dark:text-emerald-300"
            >
              الانتقال لأوامر الصرف
            </button>
          )}
        </div>
      )}

      {/* Illustrative Approval Policy Configuration Bar */}
      <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="font-bold">حد الرقابة الثنائية واعتماد الإدارة المالية: </span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 px-2 py-0.5 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700">
              {approvalPolicy.cfoSecondaryApprovalThresholdSar.toLocaleString()} ر.س
            </span>
            <span className="text-neutral-500 mr-2 text-[11px]">
              (بيانات سياسة توضيحية قابلة للتعديل - ليست سياسة ثابتة أو ملزمة للنظام)
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setEditThresholdSar(approvalPolicy.cfoSecondaryApprovalThresholdSar);
            setShowPolicyModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium transition-colors text-xs shrink-0"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>تعديل حد الاعتماد التوضيحي</span>
        </button>
      </div>

      {policyUpdatedMsg && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{policyUpdatedMsg}</span>
          </div>
          <button onClick={() => setPolicyUpdatedMsg(null)} className="text-neutral-400 hover:text-neutral-600">×</button>
        </div>
      )}

      {/* Authorizations Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                <th className="p-3">رقم الترخيص والباتش</th>
                <th className="p-3">المورد / المستفيد</th>
                <th className="p-3">حساب الآيبان (IBAN)</th>
                <th className="p-3">المبلغ المقترح (SAR)</th>
                <th className="p-3">تاريخ الاستحقاق</th>
                <th className="p-3">حالة توثيق المستفيد</th>
                <th className="p-3">حالة التفويض</th>
                <th className="p-3">الرقابة والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredAuths.map(auth => {
                const isBlocked = auth.status === 'blocked_by_policy' ||
                  auth.beneficiaryVerificationStatus === 'bank_change_pending_review' ||
                  auth.beneficiaryVerificationStatus === 'unverified_hold';

                const alreadyHasInstruction = state.instructions.some(i => i.authorizationId === auth.id);

                return (
                  <tr key={auth.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                    <td className="p-3">
                      <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{auth.id}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{auth.proposalBatchNumber}</div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400">
                        {auth.invoiceReferences.length} فواتير مرتبطة
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{auth.supplierNameAr}</div>
                      <div className="text-[11px] text-neutral-400">اسم الحساب: {auth.beneficiaryAccountName}</div>
                    </td>

                    <td className="p-3 font-mono text-neutral-700 dark:text-neutral-300">
                      {auth.beneficiaryIbanMasked}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-sm font-mono text-neutral-900 dark:text-neutral-100">
                        {auth.proposedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {auth.currency}
                      </div>
                      {auth.proposedAmount >= approvalPolicy.cfoSecondaryApprovalThresholdSar && (
                        <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>رقابة ثنائية (تجاوز {approvalPolicy.cfoSecondaryApprovalThresholdSar.toLocaleString()} ر.س)</span>
                        </div>
                      )}
                      {auth.authorizedAmount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          معتمد: {auth.authorizedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>

                    <td className="p-3 font-mono text-neutral-600 dark:text-neutral-400">
                      {auth.dueDate}
                    </td>

                    <td className="p-3">
                      {auth.beneficiaryVerificationStatus === 'verified_active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> موثق ونشط
                        </span>
                      ) : auth.beneficiaryVerificationStatus === 'bank_change_pending_review' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" /> تغيير آيبان قيد التحقق
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" /> محظور غير موثق
                        </span>
                      )}

                      {auth.apHoldReference && (
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 max-w-xs leading-tight">
                          حظر AP: {auth.apHoldReference}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          auth.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : auth.status === 'blocked_by_policy'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : auth.status === 'returned_to_ap'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {auth.status === 'approved'
                          ? 'معتمد للصرف'
                          : auth.status === 'blocked_by_policy'
                          ? 'محظور الصرف'
                          : auth.status === 'returned_to_ap'
                          ? 'مُعاد للدائنة'
                          : 'بانتظار التفويض'}
                      </span>

                      {auth.makerStaffName && (
                        <div className="text-[10px] text-neutral-400 mt-1">
                          المُعد: {auth.makerStaffName}
                        </div>
                      )}
                      {auth.checkerStaffName && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          المدقق: {auth.checkerStaffName}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-1.5">
                        {auth.status === 'approved' ? (
                          alreadyHasInstruction ? (
                            <span className="text-[11px] text-neutral-400 italic">
                              تم إصدار أمر سريع
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenGenerateInstruction(auth)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>إصدار أمر سريع</span>
                            </button>
                          )
                        ) : auth.status === 'blocked_by_policy' ? (
                          <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/30 p-1 rounded">
                            الصرف محظور نظامياً
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenReview(auth, 'approve')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-2 py-1 rounded transition-colors"
                            >
                              اعتماد
                            </button>
                            <button
                              onClick={() => handleOpenReview(auth, 'return')}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold px-2 py-1 rounded transition-colors"
                            >
                              إعادة
                            </button>
                            <button
                              onClick={() => handleOpenReview(auth, 'reject')}
                              className="bg-neutral-600 hover:bg-neutral-700 text-white text-[11px] font-semibold px-2 py-1 rounded transition-colors"
                            >
                              رفض
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: MAKER-CHECKER REVIEW DIALOG */}
      {showReviewModal && selectedAuth && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              مراجعة ترخيص الصرف (Dual Control Review)
            </h3>
            <p className="text-xs text-neutral-500 mb-4 font-mono">
              {selectedAuth.id} • {selectedAuth.supplierNameAr}
            </p>

            {actionError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {actionError}
              </div>
            )}

            <form onSubmit={handleExecuteReview} className="space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">المبلغ المطلوب اعتماده:</span>
                  <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">
                    {selectedAuth.proposedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedAuth.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">الآيبان المحول إليه:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">{selectedAuth.beneficiaryIbanMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">مُعد الطلب (Maker):</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedAuth.makerStaffName || 'طارق العمري'}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">الإجراء الرقابي المحدد</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approve')}
                    className={`py-2 rounded font-semibold text-center border transition-all ${
                      reviewAction === 'approve'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    اعتماد الصرف
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('return')}
                    className={`py-2 rounded font-semibold text-center border transition-all ${
                      reviewAction === 'return'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    إعادة إلى AP
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('reject')}
                    className={`py-2 rounded font-semibold text-center border transition-all ${
                      reviewAction === 'reject'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    رفض الطلب
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">ملاحظات التدقيق / سبب الرفض أو الإعادة</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="بيان مبررات الاعتماد أو أي ملاحظات رقابية..."
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                <Lock className="w-3.5 h-3.5 inline ml-1" />
                <span>ضابط الرقابة الثنائية: لن يسمح النظام باعتماد الطلب إذا كان المدقق هو نفس مُعد الطلب.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  تأكيد الإجراء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATE PAYMENT INSTRUCTION */}
      {showInstructionModal && selectedAuth && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              إصدار أمر تحويل بنكي (Payment Instruction Generation)
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              تحرير أمر الصرف الرسمي وربطه بالحساب البنكي للمستشفى وشبكة سريع.
            </p>

            {actionError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {actionError}
              </div>
            )}

            <form onSubmit={handleExecuteGenerateInstruction} className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded border border-neutral-200 dark:border-neutral-700">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedAuth.supplierNameAr}</div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">IBAN: {selectedAuth.beneficiaryIbanMasked}</div>
                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  المبلغ المعتمد: {selectedAuth.authorizedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedAuth.currency}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">حساب الخزينة المصدر (Source Account) *</label>
                <select
                  value={targetBankAccountId}
                  onChange={e => setTargetBankAccountId(e.target.value)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  {state.accounts
                    .filter(a => a.accountType !== 'main_cash_vault' && a.accountType !== 'petty_cash_float')
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayNameAr} ({acc.currency}) - {acc.internalAccountCode}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">مسار التنفيذ البنكي (Execution Rail) *</label>
                <select
                  value={executionRail}
                  onChange={e => setExecutionRail(e.target.value as any)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  <option value="sarie_instant">سريع فوري (SARIE Instant - IPS)</option>
                  <option value="sarie_ach_batch">سريع دفعة مجدولة (SARIE ACH Batch)</option>
                  <option value="swift_wire">حوالة دولية سويفت (SWIFT Wire)</option>
                </select>
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                يتحقق المحرك آلياً من تطابق عملة الحساب المصدر مع عملة الدفعة، وعدم وجود أمر صرف صادر مسبقاً لنفس الترخيص لمنع التكرار (Idempotency).
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowInstructionModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  إصدار أمر الصرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Configurable Illustrative Approval Threshold Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-right">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>إعداد سياسة حد التفويض التوضيحي (Synthetic Policy Data)</span>
            </h3>

            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              هذه القيمة هي <strong>بيانات سياسة توضيحية قابلة للتعديل (ILLUSTRATIVE_CONFIGURATION)</strong> لنمذجة تدفقات الرقابة الثنائية واعتماد الإدارة المالية وليست سياسة مستشفى ثابتة أو قيداً برمجياً جامداً.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                setApprovalPolicy(prev => ({
                  ...prev,
                  cfoSecondaryApprovalThresholdSar: Number(editThresholdSar) || 100000.0
                }));
                setShowPolicyModal(false);
                setPolicyUpdatedMsg(`تم تحديث حد الاعتماد التوضيحي للرقابة الثنائية إلى ${Number(editThresholdSar).toLocaleString()} ر.س.`);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                  حد الرقابة الثنائية الإلزامي (SAR Threshold) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={editThresholdSar}
                    onChange={e => setEditThresholdSar(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-sm pl-12"
                    required
                  />
                  <span className="absolute left-3 top-3 text-neutral-400 font-bold">SAR</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  المبالغ المقترحة التي تعادل أو تتجاوز هذا الحد تتطلب اعتماداً ثنائياً من الإدارة المالية.
                </p>
              </div>

              <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg text-neutral-600 dark:text-neutral-300 text-[11px] space-y-1">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">السياسة التوضيحية الحالية:</div>
                <div>• المسمى: {approvalPolicy.policyNameAr}</div>
                <div>• الحد الحالي: {approvalPolicy.cfoSecondaryApprovalThresholdSar.toLocaleString()} ر.س</div>
                <div>• تصنيف السياسة: نموذج استرشادي تجريبي (Synthetic Demo Configuration)</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  حفظ وتطبيق الحد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
