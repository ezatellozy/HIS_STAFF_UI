import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  ShieldAlert, 
  Eye, 
  Lock, 
  Tag, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  AccountNode, 
  AccountCategory, 
  AccountType, 
  NormalBalance,
  AccountLifecycleState
} from '../../types/generalLedger';
import { createAccountDraft, inactivateAccount } from '../../utils/generalLedgerEngine';

interface ChartOfAccountsWorkspaceProps {
  accounts: AccountNode[];
  onUpdateAccounts: (updatedAccounts: AccountNode[]) => void;
  activePersona: {
    nameAr: string;
    permissionLevel: string;
  };
}

export const ChartOfAccountsWorkspace: React.FC<ChartOfAccountsWorkspaceProps> = ({
  accounts,
  onUpdateAccounts,
  activePersona
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  // Selected Account for Detail Inspection
  const [inspectedAccount, setInspectedAccount] = useState<AccountNode | null>(null);

  // Create Draft Account Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{
    accountCode: string;
    nameAr: string;
    nameEn: string;
    category: AccountCategory;
    accountType: AccountType;
    normalBalance: NormalBalance;
    parentAccountCode: string;
    requiresCostCenter: boolean;
    requiresDepartment: boolean;
    requiresBranch: boolean;
    disallowManualJournal: boolean;
    descriptionAr: string;
  }>({
    accountCode: '',
    nameAr: '',
    nameEn: '',
    category: 'expense',
    accountType: 'posting',
    normalBalance: 'debit',
    parentAccountCode: '5100',
    requiresCostCenter: true,
    requiresDepartment: true,
    requiresBranch: false,
    disallowManualJournal: false,
    descriptionAr: ''
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Inactivate Modal State
  const [inactivateTarget, setInactivateTarget] = useState<AccountNode | null>(null);
  const [inactivateReason, setInactivateReason] = useState('');
  const [inactivateError, setInactivateError] = useState<string | null>(null);

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    if (selectedCategory !== 'all' && acc.category !== selectedCategory) return false;
    if (selectedType !== 'all' && acc.accountType !== selectedType) return false;
    if (selectedState !== 'all' && acc.state !== selectedState) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = acc.accountCode.toLowerCase().includes(q);
      const nameArMatch = acc.nameAr.toLowerCase().includes(q);
      const nameEnMatch = acc.nameEn.toLowerCase().includes(q);
      if (!codeMatch && !nameArMatch && !nameEnMatch) return false;
    }
    return true;
  });

  // Sort accounts naturally by code
  filteredAccounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }));

  // Handle Create Account Submission
  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const parent = accounts.find(a => a.accountCode === createForm.parentAccountCode);
    const parentLevel = parent ? parent.level : 1;

    const dummyState = { accounts } as any;
    const result = createAccountDraft(
      dummyState,
      {
        accountCode: createForm.accountCode.trim(),
        nameAr: createForm.nameAr.trim(),
        nameEn: createForm.nameEn.trim(),
        category: createForm.category,
        accountType: createForm.accountType,
        normalBalance: createForm.normalBalance,
        parentAccountCode: createForm.parentAccountCode || null,
        level: parentLevel + 1,
        descriptionAr: createForm.descriptionAr.trim(),
        restrictions: {
          requiresCostCenter: createForm.requiresCostCenter,
          requiresDepartment: createForm.requiresDepartment,
          requiresBranch: createForm.requiresBranch,
          requiresProject: false,
          disallowManualJournal: createForm.disallowManualJournal
        }
      },
      activePersona.nameAr
    );

    if (!result.success || !result.createdAccount) {
      setCreateError(result.error || 'تعذر إنشاء الحساب');
      return;
    }

    onUpdateAccounts([...accounts, result.createdAccount]);
    setIsCreateModalOpen(false);
    setInspectedAccount(result.createdAccount);
    // Reset form
    setCreateForm({
      accountCode: '',
      nameAr: '',
      nameEn: '',
      category: 'expense',
      accountType: 'posting',
      normalBalance: 'debit',
      parentAccountCode: '5100',
      requiresCostCenter: true,
      requiresDepartment: true,
      requiresBranch: false,
      disallowManualJournal: false,
      descriptionAr: ''
    });
  };

  // Handle Inactivate Submission
  const handleInactivateSubmit = () => {
    if (!inactivateTarget) return;
    setInactivateError(null);

    if (!inactivateReason.trim()) {
      setInactivateError('الرجاء كتابة سبب الإيقاف/التعطيل للتوثيق المالي.');
      return;
    }

    const dummyState = { accounts } as any;
    const result = inactivateAccount(dummyState, inactivateTarget.accountCode, inactivateReason);

    if (!result.success) {
      setInactivateError(result.error || 'تعذر تعطيل الحساب');
      return;
    }

    onUpdateAccounts(
      accounts.map(a => 
        a.accountCode === inactivateTarget.accountCode 
          ? { ...a, state: 'inactive', descriptionAr: `${a.descriptionAr || ''} [معطل: ${inactivateReason}]` } 
          : a
      )
    );
    setInactivateTarget(null);
    setInactivateReason('');
    if (inspectedAccount && inspectedAccount.accountCode === inactivateTarget.accountCode) {
      setInspectedAccount({ ...inspectedAccount, state: 'inactive' });
    }
  };

  return (
    <div id="chart-of-accounts-workspace" className="space-y-6">
      
      {/* Workspace Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              دليل الحسابات الموحد (Chart of Accounts)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {accounts.length} حساب
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            هيكل هرمي متعدد المستويات (فئات، مجموعات، حسابات قيد تفصيلية) مع تمييز الحسابات التجميعية غير القابلة للقيد وقواعد الأبعاد الإلزامية.
          </p>
        </div>

        <button
          id="btn-open-create-account"
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حساب جديد بالدليل (Draft)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
          <input
            id="coa-search-input"
            type="text"
            placeholder="بحث برمز الحساب، الاسم بالعربية أو الإنجليزية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pr-9 pl-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">التصنيف:</span>
          <select
            id="coa-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">جميع الفئات</option>
            <option value="asset">1 - الأصول (Assets)</option>
            <option value="liability">2 - الالتزامات (Liabilities)</option>
            <option value="equity">3 - حقوق الملكية (Equity)</option>
            <option value="revenue">4 - الإيرادات (Revenues)</option>
            <option value="expense">5 - المصروفات (Expenses)</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">نوع الحساب:</span>
          <select
            id="coa-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">الكل (تجميعي وقيد)</option>
            <option value="group">تجميعي / رئيسي (Group Roll-up)</option>
            <option value="posting">حساب قيد مباشر (Leaf Posting)</option>
          </select>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">الحالة:</span>
          <select
            id="coa-state-filter"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط (Active)</option>
            <option value="inactive">معطل (Inactive)</option>
            <option value="draft">مسودة (Draft)</option>
            <option value="under_review">تحت المراجعة (Under Review)</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(selectedCategory !== 'all' || selectedType !== 'all' || selectedState !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedState('all');
              setSearchQuery('');
            }}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
          >
            إعادة الضبط
          </button>
        )}

      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">رمز الحساب</th>
                <th className="py-3 px-4 font-semibold">اسم الحساب (عربي / إنجليزي)</th>
                <th className="py-3 px-4 font-semibold">الفئة</th>
                <th className="py-3 px-4 font-semibold">النوع</th>
                <th className="py-3 px-4 font-semibold">طبيعة الرصيد</th>
                <th className="py-3 px-4 font-semibold">المستوى</th>
                <th className="py-3 px-4 font-semibold">ضوابط الأبعاد</th>
                <th className="py-3 px-4 font-semibold">الحالة</th>
                <th className="py-3 px-4 font-semibold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccounts.map(account => {
                const isGroup = account.accountType === 'group';
                const paddingLeft = (account.level - 1) * 16;

                return (
                  <tr 
                    key={account.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isGroup ? 'bg-slate-950/30 font-semibold' : ''
                    }`}
                  >
                    {/* Account Code */}
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5" style={{ paddingRight: `${paddingLeft}px` }}>
                        {isGroup ? (
                          <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        )}
                        <span>{account.accountCode}</span>
                      </div>
                    </td>

                    {/* Names */}
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{account.nameAr}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{account.nameEn}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        account.category === 'asset' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        account.category === 'liability' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        account.category === 'equity' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        account.category === 'revenue' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {account.category === 'asset' ? 'أصول' :
                         account.category === 'liability' ? 'التزامات' :
                         account.category === 'equity' ? 'حقوق ملكية' :
                         account.category === 'revenue' ? 'إيرادات' : 'مصروفات'}
                      </span>
                    </td>

                    {/* Account Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isGroup ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          تجميعي (غير قابل للقيد)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          قيد مباشر (Posting)
                        </span>
                      )}
                    </td>

                    {/* Normal Balance */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono text-xs ${account.normalBalance === 'debit' ? 'text-blue-400' : 'text-amber-400'}`}>
                        {account.normalBalance === 'debit' ? 'مدين (Dr)' : 'دائن (Cr)'}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      مستوى {account.level}
                    </td>

                    {/* Restrictions Badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {account.restrictions.requiresCostCenter && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800" title="يتطلب مركز تكلفة إلزامي">
                            مركز تكلفة
                          </span>
                        )}
                        {account.restrictions.requiresDepartment && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800" title="يتطلب قسم إلزامي">
                            قسم
                          </span>
                        )}
                        {account.restrictions.disallowManualJournal && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800" title="ممنوع القيد اليدوي (قيد آلي فقط)">
                            قيد آلي فقط
                          </span>
                        )}
                        {account.restrictions.reconciliationKey && account.restrictions.reconciliationKey !== 'none' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800" title="حساب رقابي مرتبط بنظام فرعي">
                            رقابي
                          </span>
                        )}
                      </div>
                    </td>

                    {/* State */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {account.state === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>نشط</span>
                        </span>
                      )}
                      {account.state === 'inactive' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>معطل</span>
                        </span>
                      )}
                      {account.state === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                          <span>مسودة</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-left whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectedAccount(account)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer flex items-center gap-1"
                          title="استعراض التفاصيل والضوابط"
                        >
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span>تفاصيل</span>
                        </button>

                        {account.state === 'active' && (
                          <button
                            onClick={() => {
                              setInactivateTarget(account);
                              setInactivateReason('');
                              setInactivateError(null);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 text-xs cursor-pointer"
                            title="تعطيل الحساب مع الاحتفاظ بتاريخه"
                          >
                            إيقاف
                          </button>
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

      {/* Account Details Drawer / Modal */}
      {inspectedAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    تفاصيل الحساب: {inspectedAccount.accountCode} - {inspectedAccount.nameAr}
                  </h3>
                  <span className="text-slate-400 font-mono text-[11px]">{inspectedAccount.nameEn}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectedAccount(null)}
                className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">التصنيف المحاسبي:</div>
                <div className="font-bold text-white text-sm capitalize">{inspectedAccount.category}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">طبيعة الرصيد العادية:</div>
                <div className="font-bold text-white text-sm">
                  {inspectedAccount.normalBalance === 'debit' ? 'مدين (Debit)' : 'دائن (Credit)'}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">نوع الحساب:</div>
                <div className="font-bold text-white">
                  {inspectedAccount.accountType === 'group' ? 'تجميعي رئيسي (Group - لا يقبل قيود)' : 'حساب قيد تفصيلي (Posting Leaf)'}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">المستوى بالهرم / الحساب الأب:</div>
                <div className="font-bold text-white">
                  مستوى {inspectedAccount.level} • {inspectedAccount.parentAccountCode ? `الأب: ${inspectedAccount.parentAccountCode}` : 'جذر رئيسي'}
                </div>
              </div>
            </div>

            {/* Restrictions Box */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs">القيود الرقابية وضوابط إدخال القيود:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className={inspectedAccount.restrictions.requiresCostCenter ? 'text-emerald-400' : 'text-slate-500'}>●</span>
                  <span>إلزامية مركز التكلفة: {inspectedAccount.restrictions.requiresCostCenter ? 'نعم (مطلوب)' : 'لا'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={inspectedAccount.restrictions.requiresDepartment ? 'text-emerald-400' : 'text-slate-500'}>●</span>
                  <span>إلزامية القسم: {inspectedAccount.restrictions.requiresDepartment ? 'نعم (مطلوب)' : 'لا'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={inspectedAccount.restrictions.disallowManualJournal ? 'text-rose-400' : 'text-emerald-400'}>●</span>
                  <span>منع القيد اليدوي: {inspectedAccount.restrictions.disallowManualJournal ? 'ممنوع (آلي فقط)' : 'مسموح'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-400">●</span>
                  <span>مفتاح المطابقة: {inspectedAccount.restrictions.reconciliationKey || 'لا يوجد'}</span>
                </div>
              </div>
            </div>

            {inspectedAccount.descriptionAr && (
              <div className="text-slate-400 text-xs">
                <span className="font-bold text-slate-300">الوصف والإيضاح المحاسبي: </span>
                {inspectedAccount.descriptionAr}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedAccount(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Draft Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            id="form-create-account"
            onSubmit={handleCreateAccountSubmit}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">
                  إضافة حساب جديد بالدليل المحاسبي (Create Draft Account)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Account Code */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">رمز الحساب (فريد):</label>
                <input
                  id="new-account-code"
                  type="text"
                  required
                  placeholder="مثال: 5125 أو 1115"
                  value={createForm.accountCode}
                  onChange={(e) => setCreateForm({ ...createForm, accountCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">التصنيف المحاسبي:</label>
                <select
                  id="new-account-category"
                  value={createForm.category}
                  onChange={(e) => {
                    const cat = e.target.value as AccountCategory;
                    setCreateForm({
                      ...createForm,
                      category: cat,
                      normalBalance: cat === 'asset' || cat === 'expense' ? 'debit' : 'credit'
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="asset">1 - أصول (Asset)</option>
                  <option value="liability">2 - التزامات (Liability)</option>
                  <option value="equity">3 - حقوق ملكية (Equity)</option>
                  <option value="revenue">4 - إيرادات (Revenue)</option>
                  <option value="expense">5 - مصروفات (Expense)</option>
                </select>
              </div>

              {/* Arabic Name */}
              <div className="col-span-2">
                <label className="block text-slate-300 mb-1 font-bold">اسم الحساب بالعربية:</label>
                <input
                  id="new-account-name-ar"
                  type="text"
                  required
                  placeholder="مثال: مستلزمات قسطرة القلب التشخيصية"
                  value={createForm.nameAr}
                  onChange={(e) => setCreateForm({ ...createForm, nameAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* English Name */}
              <div className="col-span-2">
                <label className="block text-slate-300 mb-1 font-bold">اسم الحساب بالإنجليزية:</label>
                <input
                  id="new-account-name-en"
                  type="text"
                  required
                  placeholder="e.g. Diagnostic Cardiac Catheterization Supplies"
                  value={createForm.nameEn}
                  onChange={(e) => setCreateForm({ ...createForm, nameEn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Parent Account */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">الحساب الأب (Parent Group):</label>
                <select
                  id="new-account-parent"
                  value={createForm.parentAccountCode}
                  onChange={(e) => setCreateForm({ ...createForm, parentAccountCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="">-- بدون حساب أب (جذر) --</option>
                  {accounts.filter(a => a.accountType === 'group').map(g => (
                    <option key={g.id} value={g.accountCode}>
                      {g.accountCode} - {g.nameAr} (مستوى {g.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">نوع الحساب:</label>
                <select
                  id="new-account-type"
                  value={createForm.accountType}
                  onChange={(e) => setCreateForm({ ...createForm, accountType: e.target.value as AccountType })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="posting">حساب قيد مباشر (Posting Leaf)</option>
                  <option value="group">حساب تجميعي رئيسي (Group Roll-up)</option>
                </select>
              </div>

              {/* Normal Balance */}
              <div>
                <label className="block text-slate-300 mb-1 font-bold">طبيعة الرصيد:</label>
                <select
                  id="new-account-normal-balance"
                  value={createForm.normalBalance}
                  onChange={(e) => setCreateForm({ ...createForm, normalBalance: e.target.value as NormalBalance })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="debit">مدين (Debit)</option>
                  <option value="credit">دائن (Credit)</option>
                </select>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-slate-300 mb-1">وصف أو غرض الاستخدام:</label>
                <textarea
                  rows={2}
                  value={createForm.descriptionAr}
                  onChange={(e) => setCreateForm({ ...createForm, descriptionAr: e.target.value })}
                  placeholder="إيضاح مالي عن طبيعة المعاملات التي تقيد بهذا الحساب..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none"
                />
              </div>

            </div>

            {/* Dimension Restrictions */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200">الضوابط والأبعاد الإلزامية:</span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.requiresCostCenter}
                    onChange={(e) => setCreateForm({ ...createForm, requiresCostCenter: e.target.checked })}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span>يتطلب مركز تكلفة إلزامي</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.requiresDepartment}
                    onChange={(e) => setCreateForm({ ...createForm, requiresDepartment: e.target.checked })}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span>يتطلب قسم إلزامي</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.disallowManualJournal}
                    onChange={(e) => setCreateForm({ ...createForm, disallowManualJournal: e.target.checked })}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span>منع القيد اليدوي (قيد آلي فقط)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="btn-submit-create-account"
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
              >
                حفظ الحساب كمسودة (Save Draft)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inactivate Account Modal */}
      {inactivateTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-white text-sm">
                تعطيل حساب بالدليل المحاسبي
              </h3>
            </div>

            <p className="text-slate-300 leading-relaxed">
              أنت على وشك تعطيل الحساب <span className="font-bold font-mono text-white">({inactivateTarget.accountCode}) {inactivateTarget.nameAr}</span>.
              سيتم منع أي قيود جديدة على الحساب، مع الاحتفاظ الكامل ببياناته التاريخية وسجلاته في موازين المراجعة والدفاتر.
            </p>

            {inactivateError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-200">
                {inactivateError}
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-bold">سبب التعطيل / الإيقاف للتوثيق المالي:</label>
              <textarea
                rows={2}
                value={inactivateReason}
                onChange={(e) => setInactivateReason(e.target.value)}
                placeholder="مثال: دمج البند ضمن بند المستلزمات الطبية الموحدة لعام 2026..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setInactivateTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                تراجع
              </button>
              <button
                id="btn-confirm-inactivate-account"
                type="button"
                onClick={handleInactivateSubmit}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
              >
                تأكيد التعطيل (Inactivate)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
