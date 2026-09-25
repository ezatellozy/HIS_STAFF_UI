import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Edit,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Lock,
  FileText,
  Clock,
  UserCheck
} from 'lucide-react';
import { TreasuryState, TreasuryAccountReference, BankAccountChangeRequest } from '../../types/treasury';
import {
  createBankAccountReference,
  requestBankAccountChange,
  reviewBankAccountChange
} from '../../utils/treasuryEngine';

interface BankCashAccountsWorkspaceProps {
  state: TreasuryState;
  onStateUpdate: (newState: TreasuryState) => void;
}

export const BankCashAccountsWorkspace: React.FC<BankCashAccountsWorkspaceProps> = ({
  state,
  onStateUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bank' | 'cash'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedAccountForChange, setSelectedAccountForChange] = useState<TreasuryAccountReference | null>(null);

  // Form states for New Account
  const [newAccountCode, setNewAccountCode] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newCurrency, setNewCurrency] = useState<'SAR' | 'USD' | 'EUR'>('SAR');
  const [newType, setNewType] = useState<TreasuryAccountReference['accountType']>('operating_bank');
  const [newGlControl, setNewGlControl] = useState('1111-SNB-MAIN');
  const [newBranch, setNewBranch] = useState<TreasuryAccountReference['branchId']>('main_hospital');
  const [newSignerA, setNewSignerA] = useState('');
  const [newSignerB, setNewSignerB] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form states for Change Request
  const [changeType, setChangeType] = useState<BankAccountChangeRequest['changeType']>('signers_update');
  const [changeJustification, setChangeJustification] = useState('');
  const [changePropSignerA, setChangePropSignerA] = useState('');
  const [changePropSignerB, setChangePropSignerB] = useState('');
  const [changeModalError, setChangeModalError] = useState<string | null>(null);

  const filteredAccounts = state.accounts.filter(a => {
    if (selectedCategory === 'bank') return a.accountType !== 'petty_cash_vault' && a.accountType !== 'cashier_float';
    if (selectedCategory === 'cash') return a.accountType === 'petty_cash_vault' || a.accountType === 'cashier_float';
    return true;
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const res = createBankAccountReference(state, {
      internalAccountCode: newAccountCode,
      displayNameAr: newAccountName,
      displayNameEn: newAccountName,
      institutionReference: newBankName || 'البنك الأهلي السعودي (محاكاة)',
      currency: newCurrency,
      accountType: newType,
      maskedAccountNumber: newIban ? (newIban.length > 8 ? `${newIban.substring(0, 4)}****${newIban.substring(newIban.length - 4)}` : newIban) : 'SA94****0000',
      purposeDescriptionAr: 'حساب تشغيلي للخزينة',
      ownershipReference: 'Specialized Hospital Legal Entity',
      branchId: newBranch,
      applicableGlAccountCode: newGlControl || '1111',
      operationalStatus: 'active',
      effectiveDate: new Date().toISOString().substring(0, 10)
    });

    if (!res.success) {
      setFormError(res.error || 'حدث خطأ أثناء إضافة الحساب');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowAddModal(false);
      setNewAccountCode('');
      setNewAccountName('');
      setNewBankName('');
      setNewIban('');
    }
  };

  const handleOpenChangeModal = (acc: TreasuryAccountReference) => {
    setSelectedAccountForChange(acc);
    setChangePropSignerA('أ.د. المدير المالي');
    setChangePropSignerB('أمين الخزينة');
    setChangeJustification('');
    setChangeModalError(null);
    setShowChangeModal(true);
  };

  const handleSubmitChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForChange) return;

    const proposedValues: any = {};
    if (changeType === 'signers_update') {
      proposedValues.authorizedSignerA = changePropSignerA;
      proposedValues.authorizedSignerB = changePropSignerB;
    } else if (changeType === 'status_freeze') {
      proposedValues.status = 'frozen';
    } else if (changeType === 'status_close') {
      proposedValues.status = 'closed';
    }

    const res = requestBankAccountChange(state, {
      accountId: selectedAccountForChange.id,
      requestedBy: state.activePersona === 'treasury_clerk' ? 'طارق العمري (كاتب الخزينة)' : 'سليمان القحطاني (مدير الخزينة)',
      changeType,
      proposedValues,
      justificationAr: changeJustification
    });

    if (!res.success) {
      setChangeModalError(res.error || 'فشل إرسال طلب التعديل');
      return;
    }

    if (res.newState) {
      onStateUpdate(res.newState);
      setShowChangeModal(false);
    }
  };

  const handleReviewChange = (requestId: string, decision: 'approve' | 'reject') => {
    const actor = state.activePersona === 'treasury_supervisor' ? 'سليمان القحطاني (مشرف الخزينة)' : 'عبدالرحمن العتيبي (المدير المالي التنفيذي CFO)';
    const res = reviewBankAccountChange(state, requestId, decision, actor, 'تمت المراجعة والتحقق من الصلاحيات النظامية.');
    if (res.success && res.newState) {
      onStateUpdate(res.newState);
    }
  };

  return (
    <div id="bank-cash-accounts-workspace" className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>دليل الحسابات المصرفية والصناديق النقدية</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            إدارة مراجع الحسابات البنكية للمستشفى، وتفويض التوقيع الثنائي، والربط الرقابي مع دفتر الأستاذ العام (GL Bridge).
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              الكل ({state.accounts.length})
            </button>
            <button
              onClick={() => setSelectedCategory('bank')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedCategory === 'bank'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              البنوك ({state.accounts.filter(a => a.accountType !== 'main_cash_vault' && a.accountType !== 'petty_cash_float').length})
            </button>
            <button
              onClick={() => setSelectedCategory('cash')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedCategory === 'cash'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              الصناديق والعهد ({state.accounts.filter(a => a.accountType === 'main_cash_vault' || a.accountType === 'petty_cash_float').length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مرجع حساب</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map(account => {
          const isCash = account.accountType === 'main_cash_vault' || account.accountType === 'petty_cash_float';
          const hasPendingChange = state.accountChangeRequests.some(
            r => r.accountId === account.id && r.status === 'pending_approval'
          );

          return (
            <div
              key={account.id}
              id={`account-card-${account.id}`}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isCash
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isCash ? <Building2 className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {account.displayNameAr}
                      </h3>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {account.internalAccountCode} • {account.bankNameAr}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        account.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : account.status === 'frozen'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {account.status === 'active' ? 'نشط' : account.status === 'frozen' ? 'مجمّد' : 'مغلق'}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                      {account.currency}
                    </span>
                  </div>
                </div>

                {/* Account Details */}
                <div className="mt-4 space-y-2 text-xs border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
                  {account.maskedIban && (
                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                      <span>الآيبان المقنع (IBAN):</span>
                      <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{account.maskedIban}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>حساب رقابة الأستاذ العام (GL):</span>
                    <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{account.glControlAccountMapping}</span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>الفرع التابع:</span>
                    <span>{account.branchId === 'main_hospital' ? 'المستشفى الرئيسي' : 'مجمع العيادات الفرعي'}</span>
                  </div>

                  {account.authorizedSignerA && (
                    <div className="text-[11px] text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <div className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 mb-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>المفوضون بالتوقيع (Dual Signers):</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>المفوض أ: {account.authorizedSignerA}</span>
                        {account.authorizedSignerB && <span>المفوض ب: {account.authorizedSignerB}</span>}
                      </div>
                    </div>
                  )}

                  {hasPendingChange && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>يوجد طلب تعديل حوكمة قيد المراجعة الثنائية</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                <span className="text-[10px] text-neutral-400">مرجع خزينة تركيبي</span>
                <button
                  onClick={() => handleOpenChangeModal(account)}
                  className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-medium"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>طلب تعديل حوكمة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: BANK ACCOUNT CHANGE REQUESTS (MAKER-CHECKER AUDIT) */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>سجل طلبات تعديل الحسابات البنكية والمفوضين (Maker-Checker Governance)</span>
          </h3>
          <span className="text-xs text-neutral-500">
            {state.accountChangeRequests.filter(r => r.status === 'pending_approval').length} طلبات معلقة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40">
                <th className="p-2.5">رقم الطلب</th>
                <th className="p-2.5">الحساب البنكي</th>
                <th className="p-2.5">نوع التعديل</th>
                <th className="p-2.5">مُعد الطلب (Maker)</th>
                <th className="p-2.5">المبرر الإداري</th>
                <th className="p-2.5">الحالة</th>
                <th className="p-2.5">الإجراء الرقابي (Checker)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {state.accountChangeRequests.map(req => {
                const acc = state.accounts.find(a => a.id === req.accountId);
                return (
                  <tr key={req.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                    <td className="p-2.5 font-mono text-neutral-800 dark:text-neutral-200">{req.id}</td>
                    <td className="p-2.5 font-semibold text-neutral-900 dark:text-neutral-100">
                      {acc?.displayNameAr || req.accountId}
                    </td>
                    <td className="p-2.5 text-neutral-600 dark:text-neutral-300">
                      {req.changeType === 'signers_update'
                        ? 'تحديث المفوضين بالتوقيع'
                        : req.changeType === 'status_freeze'
                        ? 'تجميد الحساب'
                        : 'تعديل تفاصيل'}
                    </td>
                    <td className="p-2.5 text-neutral-600 dark:text-neutral-400">
                      <div>{req.requestedBy}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{req.requestedAt}</div>
                    </td>
                    <td className="p-2.5 text-neutral-700 dark:text-neutral-300 max-w-xs">{req.justificationAr}</td>
                    <td className="p-2.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {req.status === 'approved'
                          ? 'معتمد ومطبق'
                          : req.status === 'rejected'
                          ? 'مرفوض'
                          : 'بانتظار الاعتماد'}
                      </span>
                    </td>
                    <td className="p-2.5">
                      {req.status === 'pending_approval' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReviewChange(req.id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition-colors"
                          >
                            اعتماد
                          </button>
                          <button
                            onClick={() => handleReviewChange(req.id, 'reject')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded transition-colors"
                          >
                            رفض
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-neutral-500">
                          {req.reviewedBy} • {req.reviewedAt?.substring(0, 10)}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW ACCOUNT REFERENCE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              إضافة مرجع حساب بنكي / صندوق نقد جديد
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              هذا الإجراء يضيف مرجع رقابي لحسابات الخزينة دون التأثير المباشر على الحركات الدفترية السابقة في دفتر الأستاذ.
            </p>

            {formError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">رمز الحساب الداخلي (Code) *</label>
                  <input
                    type="text"
                    required
                    value={newAccountCode}
                    onChange={e => setNewAccountCode(e.target.value)}
                    placeholder="مثال: TREAS-ACC-BSF-SAR"
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">العملة *</label>
                  <select
                    value={newCurrency}
                    onChange={e => setNewCurrency(e.target.value as any)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  >
                    <option value="SAR">SAR - ريال سعودي</option>
                    <option value="USD">USD - دولار أمريكي</option>
                    <option value="EUR">EUR - يورو</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">اسم الحساب بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  placeholder="مثال: البنك الفرنسي السعودي - الحساب الاستثماري"
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">اسم البنك / الصندوق *</label>
                  <input
                    type="text"
                    required
                    value={newBankName}
                    onChange={e => setNewBankName(e.target.value)}
                    placeholder="مثال: البنك السعودي الفرنسي"
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">نوع الحساب *</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  >
                    <option value="operating_current">حساب جاري تشغيلي</option>
                    <option value="payroll_disbursement">حساب صرف رواتب</option>
                    <option value="foreign_currency">حساب عملات أجنبية</option>
                    <option value="main_cash_vault">صندوق الخزينة المركزي</option>
                    <option value="petty_cash_float">عهدة نقدية فرعية (Float)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">رقم الآيبان البنكي (IBAN)</label>
                <input
                  type="text"
                  value={newIban}
                  onChange={e => setNewIban(e.target.value)}
                  placeholder="SA0000000000000000000000"
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">ربط حساب GL الرقابي *</label>
                  <input
                    type="text"
                    required
                    value={newGlControl}
                    onChange={e => setNewGlControl(e.target.value)}
                    placeholder="1111-SNB-MAIN"
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">الفرع *</label>
                  <select
                    value={newBranch}
                    onChange={e => setNewBranch(e.target.value as any)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  >
                    <option value="main_hospital">المستشفى الرئيسي</option>
                    <option value="suburban_clinic_branch">مجمع العيادات الفرعي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <label className="block font-medium mb-1">المفوض بالتوقيع أ</label>
                  <input
                    type="text"
                    value={newSignerA}
                    onChange={e => setNewSignerA(e.target.value)}
                    placeholder="د. خالد التميمي"
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">المفوض بالتوقيع ب</label>
                  <input
                    type="text"
                    value={newSignerB}
                    onChange={e => setNewSignerB(e.target.value)}
                    placeholder="أ. فهد الدوسري"
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  حفظ المرجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST ACCOUNT CHANGE (MAKER-CHECKER) */}
      {showChangeModal && selectedAccountForChange && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              طلب تعديل حوكمة الحساب البنكي
            </h3>
            <p className="text-xs text-neutral-500 mb-4 font-mono">
              {selectedAccountForChange.displayNameAr} ({selectedAccountForChange.internalAccountCode})
            </p>

            {changeModalError && (
              <div className="p-2.5 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded">
                {changeModalError}
              </div>
            )}

            <form onSubmit={handleSubmitChangeRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">نوع التعديل *</label>
                <select
                  value={changeType}
                  onChange={e => setChangeType(e.target.value as any)}
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  <option value="signers_update">تحديث المفوضين بالتوقيع (Signers Update)</option>
                  <option value="status_freeze">تجميد الحساب (Freeze Account)</option>
                  <option value="status_close">إغلاق الحساب البنكي (Close Account)</option>
                </select>
              </div>

              {changeType === 'signers_update' && (
                <div className="space-y-2 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded border border-neutral-200 dark:border-neutral-700">
                  <div>
                    <label className="block font-medium mb-1">المفوض الأول أ</label>
                    <input
                      type="text"
                      value={changePropSignerA}
                      onChange={e => setChangePropSignerA(e.target.value)}
                      className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">المفوض الثاني ب</label>
                    <input
                      type="text"
                      value={changePropSignerB}
                      onChange={e => setChangePropSignerB(e.target.value)}
                      className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium mb-1">المبرر الإداري / النظامي *</label>
                <textarea
                  required
                  rows={3}
                  value={changeJustification}
                  onChange={e => setChangeJustification(e.target.value)}
                  placeholder="بيان سبب التعديل وقرار الصلاحيات الصادر من إدارة المستشفى..."
                  className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                يخضع هذا الطلب للرقابة الثنائية ولا يتم تطبيقه حتى يقوم المسؤول المالي المفوض (Checker) بالموافقة عليه.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="px-4 py-2 rounded text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  تقديم الطلب للتدقيق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
