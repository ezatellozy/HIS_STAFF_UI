import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRightLeft, 
  FileCheck, 
  XCircle, 
  Eye, 
  Trash2, 
  Send, 
  RotateCcw, 
  Wrench,
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { 
  JournalHeader, 
  JournalLine, 
  GeneralLedgerVoucherEntry, 
  AccountNode, 
  FiscalCalendar, 
  AccountingPeriod,
  FinancialDimensionValue,
  GeneralLedgerState,
  JournalCategory,
  JournalStatus
} from '../../types/generalLedger';
import { 
  validateJournalDraft, 
  submitJournalForApproval, 
  approveJournal, 
  simulatePostJournal, 
  createReversalJournal, 
  createCorrectedJournal 
} from '../../utils/generalLedgerEngine';

interface JournalEntriesWorkspaceProps {
  glState: GeneralLedgerState;
  onUpdateState: (newState: GeneralLedgerState) => void;
  activeCalendar: FiscalCalendar;
  activePeriod: AccountingPeriod;
  activePersona: {
    id: string;
    nameAr: string;
    roleTitleAr: string;
    permissionLevel: string;
  };
  initialOpenCreate?: boolean;
  onCloseInitialCreate?: () => void;
  inspectedVoucherId?: string | null;
  onCloseInspectedVoucher?: () => void;
}

export const JournalEntriesWorkspace: React.FC<JournalEntriesWorkspaceProps> = ({
  glState,
  onUpdateState,
  activeCalendar,
  activePeriod,
  activePersona,
  initialOpenCreate = false,
  onCloseInitialCreate,
  inspectedVoucherId,
  onCloseInspectedVoucher
}) => {
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialOpenCreate);
  const [selectedJournalForDetail, setSelectedJournalForDetail] = useState<JournalHeader | null>(null);
  const [selectedVoucherForDetail, setSelectedVoucherForDetail] = useState<GeneralLedgerVoucherEntry | null>(
    inspectedVoucherId ? glState.postedVouchers.find(v => v.voucherId === inspectedVoucherId) || null : null
  );

  // Reversal Modal
  const [reversalTarget, setReversalTarget] = useState<JournalHeader | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversalPeriodId, setReversalPeriodId] = useState(activePeriod.id);
  const [reversalDate, setReversalDate] = useState('2026-09-22');
  const [reversalError, setReversalError] = useState<string | null>(null);

  // Correction Modal
  const [correctionTarget, setCorrectionTarget] = useState<JournalHeader | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionPeriodId, setCorrectionPeriodId] = useState(activePeriod.id);
  const [correctionDate, setCorrectionDate] = useState('2026-09-22');
  const [correctionLines, setCorrectionLines] = useState<JournalLine[]>([]);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  // New Journal Draft Form State
  const [draftCategory, setDraftCategory] = useState<JournalCategory>('manual_adjustment');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftAccountingDate, setDraftAccountingDate] = useState('2026-09-22');
  const [draftPeriodId, setDraftPeriodId] = useState(activePeriod.id);
  const [draftCurrency, setDraftCurrency] = useState('SAR');
  const [draftExchangeRate, setDraftExchangeRate] = useState<number>(1.0);
  const [draftSupportingRef, setDraftSupportingRef] = useState('');
  const [draftLines, setDraftLines] = useState<JournalLine[]>([
    {
      id: 'L-1',
      lineNumber: 1,
      accountId: 'ACC-5100',
      accountCode: '5100',
      accountNameAr: 'مستلزمات طبية وجراحية',
      dimensions: { branchId: 'main_hospital', departmentId: 'icu', costCenterCode: 'CC-ICU-701' },
      descriptionAr: 'قيد تسوية مستلزمات العناية المركزة',
      debit: 5000,
      credit: 0,
      transactionCurrency: 'SAR',
      exchangeRate: 1,
      baseDebit: 5000,
      baseCredit: 0
    },
    {
      id: 'L-2',
      lineNumber: 2,
      accountId: 'ACC-1130',
      accountCode: '1130',
      accountNameAr: 'مخزون المستودع الطبي والمستلزمات',
      dimensions: { branchId: 'main_hospital' },
      descriptionAr: 'منصرف المخزون للعناية المركزة',
      debit: 0,
      credit: 5000,
      transactionCurrency: 'SAR',
      exchangeRate: 1,
      baseDebit: 0,
      baseCredit: 5000
    }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Posting leaf accounts list for dropdowns
  const leafAccounts = glState.accounts.filter(a => a.accountType === 'posting' && a.state === 'active');

  // Real-time draft validation check
  const dummyDraftForValidation: JournalHeader = {
    id: 'DRAFT-TEMP',
    category: draftCategory,
    descriptionAr: draftDescription || 'مسودة قيد',
    accountingDate: draftAccountingDate,
    periodId: draftPeriodId,
    currency: draftCurrency,
    origin: 'manual_ui',
    preparedByPersona: activePersona.nameAr,
    status: 'draft',
    lines: draftLines
  };
  const liveValidation = validateJournalDraft(glState, dummyDraftForValidation);

  // Filter journals
  const filteredJournals = glState.journals.filter(j => {
    if (activeFilterTab === 'draft' && j.status !== 'draft' && j.status !== 'validated') return false;
    if (activeFilterTab === 'under_approval' && j.status !== 'under_approval') return false;
    if (activeFilterTab === 'approved' && j.status !== 'approved') return false;
    if (activeFilterTab === 'posted' && j.status !== 'posted_simulated') return false;
    if (activeFilterTab === 'reversed' && j.status !== 'reversed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = j.id.toLowerCase().includes(q);
      const voucherMatch = (j.voucherNumber || '').toLowerCase().includes(q);
      const descMatch = j.descriptionAr.toLowerCase().includes(q);
      if (!idMatch && !voucherMatch && !descMatch) return false;
    }
    return true;
  });

  // Handle Add Line
  const handleAddLine = () => {
    const nextNum = draftLines.length + 1;
    const defaultAcc = leafAccounts[0] || glState.accounts[0];
    const newLine: JournalLine = {
      id: `L-${Date.now()}-${nextNum}`,
      lineNumber: nextNum,
      accountId: defaultAcc.id,
      accountCode: defaultAcc.accountCode,
      accountNameAr: defaultAcc.nameAr,
      dimensions: {
        branchId: 'main_hospital',
        departmentId: defaultAcc.restrictions.requiresDepartment ? 'icu' : undefined,
        costCenterCode: defaultAcc.restrictions.requiresCostCenter ? 'CC-ICU-701' : undefined
      },
      descriptionAr: draftDescription || 'طرف القيد',
      debit: 0,
      credit: 0,
      transactionCurrency: draftCurrency,
      exchangeRate: draftExchangeRate,
      baseDebit: 0,
      baseCredit: 0
    };
    setDraftLines([...draftLines, newLine]);
  };

  // Handle Remove Line
  const handleRemoveLine = (idx: number) => {
    if (draftLines.length <= 2) {
      setFormError('قيد اليومية يجب أن يحتوي على سطرين على الأقل (مدين ودائن)');
      return;
    }
    const updated = draftLines.filter((_, i) => i !== idx).map((l, i) => ({ ...l, lineNumber: i + 1 }));
    setDraftLines(updated);
  };

  // Handle Line Change
  const handleLineChange = (idx: number, field: string, val: any) => {
    const updated = [...draftLines];
    const target = { ...updated[idx] };

    if (field === 'accountCode') {
      const acc = glState.accounts.find(a => a.accountCode === val);
      if (acc) {
        target.accountId = acc.id;
        target.accountCode = acc.accountCode;
        target.accountNameAr = acc.nameAr;
        if (acc.restrictions.requiresCostCenter && !target.dimensions.costCenterCode) {
          target.dimensions = { ...target.dimensions, costCenterCode: 'CC-ICU-701' };
        }
        if (acc.restrictions.requiresDepartment && !target.dimensions.departmentId) {
          target.dimensions = { ...target.dimensions, departmentId: 'icu' };
        }
      }
    } else if (field === 'debit') {
      const num = parseFloat(val) || 0;
      target.debit = num;
      target.baseDebit = Math.round(num * draftExchangeRate * 100) / 100;
      if (num > 0) {
        target.credit = 0;
        target.baseCredit = 0;
      }
    } else if (field === 'credit') {
      const num = parseFloat(val) || 0;
      target.credit = num;
      target.baseCredit = Math.round(num * draftExchangeRate * 100) / 100;
      if (num > 0) {
        target.debit = 0;
        target.baseDebit = 0;
      }
    } else if (field === 'costCenterCode') {
      target.dimensions = { ...target.dimensions, costCenterCode: val };
    } else if (field === 'departmentId') {
      target.dimensions = { ...target.dimensions, departmentId: val };
    } else if (field === 'branchId') {
      target.dimensions = { ...target.dimensions, branchId: val };
    } else if (field === 'descriptionAr') {
      target.descriptionAr = val;
    }

    updated[idx] = target;
    setDraftLines(updated);
  };

  // Handle Save / Submit New Journal
  const handleSaveDraft = (submitToApproval = false) => {
    setFormError(null);

    if (!draftDescription.trim()) {
      setFormError('الرجاء إدخال البيان المحاسبي للقيد');
      return;
    }

    const validation = validateJournalDraft(glState, {
      ...dummyDraftForValidation,
      descriptionAr: draftDescription
    });

    if (!validation.isValid && submitToApproval) {
      setFormError(`لا يمكن تقديم قيد غير صالح للاعتماد: ${validation.errors.join(' • ')}`);
      return;
    }

    const newId = `JRN-2026-${String(glState.journals.length + 1).padStart(3, '0')}`;
    const newJournal: JournalHeader = {
      id: newId,
      category: draftCategory,
      descriptionAr: draftDescription,
      accountingDate: draftAccountingDate,
      periodId: draftPeriodId,
      currency: draftCurrency,
      origin: 'manual_ui',
      supportingReference: draftSupportingRef || undefined,
      preparedByPersona: activePersona.nameAr,
      status: submitToApproval ? 'under_approval' : 'draft',
      lines: draftLines.map(l => ({
        ...l,
        transactionCurrency: draftCurrency,
        exchangeRate: draftExchangeRate,
        baseDebit: Math.round(l.debit * draftExchangeRate * 100) / 100,
        baseCredit: Math.round(l.credit * draftExchangeRate * 100) / 100
      })),
      validationSnapshot: validation
    };

    onUpdateState({
      ...glState,
      journals: [newJournal, ...glState.journals]
    });

    setIsCreateModalOpen(false);
    if (onCloseInitialCreate) onCloseInitialCreate();
    setSelectedJournalForDetail(newJournal);
  };

  // Handle Submit for Approval
  const handleSubmitForApprovalAction = (journalId: string) => {
    const res = submitJournalForApproval(glState, journalId, activePersona.nameAr);
    if (!res.success) {
      alert(res.error);
      return;
    }
    if (res.newState) onUpdateState(res.newState);
    if (selectedJournalForDetail && selectedJournalForDetail.id === journalId) {
      setSelectedJournalForDetail({ ...selectedJournalForDetail, status: 'under_approval' });
    }
  };

  // Handle Approve Journal
  const handleApproveAction = (journalId: string) => {
    const res = approveJournal(glState, journalId, activePersona.nameAr);
    if (!res.success) {
      alert(res.error);
      return;
    }
    if (res.newState) onUpdateState(res.newState);
    if (selectedJournalForDetail && selectedJournalForDetail.id === journalId) {
      setSelectedJournalForDetail({
        ...selectedJournalForDetail,
        status: 'approved',
        approvedByPersona: activePersona.nameAr
      });
    }
  };

  // Handle Simulate Post Journal
  const handleSimulatePostAction = (journalId: string) => {
    const res = simulatePostJournal(glState, journalId, activePersona.nameAr);
    if (!res.success) {
      alert(res.error);
      return;
    }
    if (res.newState) onUpdateState(res.newState);
    if (res.voucher) setSelectedVoucherForDetail(res.voucher);
    if (selectedJournalForDetail && selectedJournalForDetail.id === journalId) {
      setSelectedJournalForDetail({
        ...selectedJournalForDetail,
        status: 'posted_simulated',
        voucherNumber: res.voucher?.voucherNumber
      });
    }
  };

  // Open Reversal Modal
  const handleOpenReversal = (journal: JournalHeader) => {
    setReversalTarget(journal);
    setReversalReason(`عكس القيد المحاسبي ${journal.id} لأغراض التسوية الدفترية`);
    setReversalPeriodId(journal.periodId);
    setReversalDate('2026-09-22');
    setReversalError(null);
  };

  // Submit Reversal
  const handleConfirmReversal = () => {
    if (!reversalTarget) return;
    setReversalError(null);

    const res = createReversalJournal(
      glState,
      {
        originalJournalId: reversalTarget.id,
        reversalDate: reversalDate,
        periodId: reversalPeriodId,
        reasonAr: reversalReason,
        approvedByPersona: activePersona.nameAr
      },
      activePersona.nameAr
    );

    if (!res.success) {
      setReversalError(res.error || 'تعذر عكس القيد');
      return;
    }

    if (res.newState) onUpdateState(res.newState);
    setReversalTarget(null);
    if (res.reversalJournal) setSelectedJournalForDetail(res.reversalJournal);
  };

  // Open Correction Modal
  const handleOpenCorrection = (journal: JournalHeader) => {
    setCorrectionTarget(journal);
    setCorrectionReason(`تصحيح التوجيه المحاسبي للقيد ${journal.id}`);
    setCorrectionPeriodId(journal.periodId);
    setCorrectionDate('2026-09-22');
    setCorrectionLines(JSON.parse(JSON.stringify(journal.lines)));
    setCorrectionError(null);
  };

  // Submit Correction
  const handleConfirmCorrection = () => {
    if (!correctionTarget) return;
    setCorrectionError(null);

    const res = createCorrectedJournal(
      glState,
      {
        originalJournalId: correctionTarget.id,
        reversalDate: correctionDate,
        correctionDate: correctionDate,
        periodId: correctionPeriodId,
        reasonAr: correctionReason,
        approvedByPersona: activePersona.nameAr
      },
      correctionLines,
      activePersona.nameAr
    );

    if (!res.success) {
      setCorrectionError(res.error || 'تعذر تصحيح القيد');
      return;
    }

    if (res.newState) onUpdateState(res.newState);
    setCorrectionTarget(null);
    if (res.correctedJournal) setSelectedJournalForDetail(res.correctedJournal);
  };

  return (
    <div id="journal-entries-workspace" className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              قيود اليومية العامة وسندات القيد (Journal Entries & Vouchers)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {glState.journals.length} قيد • {glState.postedVouchers.length} سند مرحل
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            دورة مستندية متكاملة: إعداد مسودة القيد، التحقق الحسابي الفوري، الاعتماد المالي ثنائي الضوابط، الترحيل المحاكى، والعكس والتصحيح الموثق.
          </p>
        </div>

        <button
          id="btn-open-create-journal"
          onClick={() => {
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قيد يومية جديد (New Journal Draft)</span>
        </button>
      </div>

      {/* Tabs Bar & Search */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'الكل', count: glState.journals.length },
            { id: 'draft', label: 'مسودات', count: glState.journals.filter(j => j.status === 'draft' || j.status === 'validated').length },
            { id: 'under_approval', label: 'تحت الاعتماد', count: glState.journals.filter(j => j.status === 'under_approval').length },
            { id: 'approved', label: 'معتمدة جاهزة للترحيل', count: glState.journals.filter(j => j.status === 'approved').length },
            { id: 'posted', label: 'مرحلة نهائياً', count: glState.journals.filter(j => j.status === 'posted_simulated').length },
            { id: 'reversed', label: 'معكوسة', count: glState.journals.filter(j => j.status === 'reversed').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilterTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilterTab === tab.id ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم القيد، السند، أو البيان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pr-8 pl-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {/* Journals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">رقم القيد</th>
                <th className="py-3 px-4 font-semibold">رقم السند المرحل</th>
                <th className="py-3 px-4 font-semibold">التاريخ المحاسبي</th>
                <th className="py-3 px-4 font-semibold">الفترة</th>
                <th className="py-3 px-4 font-semibold">النوع / التصنيف</th>
                <th className="py-3 px-4 font-semibold">البيان المحاسبي</th>
                <th className="py-3 px-4 font-semibold">إجمالي القيد (SAR)</th>
                <th className="py-3 px-4 font-semibold">الحالة</th>
                <th className="py-3 px-4 font-semibold text-left">إجراءات الدورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredJournals.map(journal => {
                const totalDebit = journal.lines.reduce((s, l) => s + (l.baseDebit || 0), 0);
                const isUnderApproval = journal.status === 'under_approval';
                const isApproved = journal.status === 'approved';
                const isPosted = journal.status === 'posted_simulated';
                const isReversed = journal.status === 'reversed';
                const isDraft = journal.status === 'draft' || journal.status === 'validated';

                return (
                  <tr key={journal.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Journal ID */}
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {journal.id}
                    </td>

                    {/* Voucher Number */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {journal.voucherNumber ? (
                        <button
                          onClick={() => {
                            const v = glState.postedVouchers.find(item => item.voucherNumber === journal.voucherNumber);
                            if (v) setSelectedVoucherForDetail(v);
                          }}
                          className="font-bold text-emerald-400 hover:underline cursor-pointer"
                        >
                          {journal.voucherNumber}
                        </button>
                      ) : (
                        <span className="text-slate-600 font-sans text-[11px]">- غير مرحل -</span>
                      )}
                    </td>

                    {/* Accounting Date */}
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {journal.accountingDate}
                    </td>

                    {/* Period */}
                    <td className="py-3 px-4 text-blue-300 whitespace-nowrap">
                      {journal.periodId}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {journal.category === 'manual_adjustment' ? 'تسوية يدوية' :
                         journal.category === 'source_integration' ? 'تكامل مصدر' :
                         journal.category === 'reversal' ? 'قيد عكسي' :
                         journal.category === 'correction' ? 'قيد تصحيحي' :
                         journal.category === 'accrual' ? 'استحقاق' : 'رصيد افتتاح'}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 font-sans text-slate-200 max-w-[220px] truncate">
                      {journal.descriptionAr}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {totalDebit.toLocaleString()} ر.س
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      {isDraft && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          مسودة
                        </span>
                      )}
                      {isUnderApproval && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                          تحت الاعتماد
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                          معتمد (جاهز للترحيل)
                        </span>
                      )}
                      {isPosted && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          مرحل نهائي
                        </span>
                      )}
                      {isReversed && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                          معكوس
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 font-sans text-left whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedJournalForDetail(journal)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
                        >
                          معاينة
                        </button>

                        {/* Submit for Approval (Draft -> Under Approval) */}
                        {isDraft && (
                          <button
                            onClick={() => handleSubmitForApprovalAction(journal.id)}
                            className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                            title="تقديم للاعتماد المالي"
                          >
                            <Send className="w-3 h-3" />
                            <span>تقديم للاعتماد</span>
                          </button>
                        )}

                        {/* Approve (Under Approval -> Approved) */}
                        {isUnderApproval && (
                          <button
                            onClick={() => handleApproveAction(journal.id)}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                            title="اعتماد القيد المالي"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>اعتماد</span>
                          </button>
                        )}

                        {/* Simulate Post (Approved -> Posted) */}
                        {isApproved && (
                          <button
                            onClick={() => handleSimulatePostAction(journal.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shadow-sm"
                            title="ترحيل القيد وتوليد سند القيد المحاسبي"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>ترحيل محاكى (Post)</span>
                          </button>
                        )}

                        {/* Reversal / Correction Actions for Posted Journals */}
                        {isPosted && !journal.reversalRefJournalId && (
                          <>
                            <button
                              onClick={() => handleOpenReversal(journal)}
                              className="px-2 py-1 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                              title="عكس القيد المحاسبي"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>عكس</span>
                            </button>
                            <button
                              onClick={() => handleOpenCorrection(journal)}
                              className="px-2 py-1 rounded bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                              title="تصحيح القيد (عكس + قيد بديل)"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>تصحيح</span>
                            </button>
                          </>
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

      {/* NEW JOURNAL ENTRY CREATOR MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl text-xs my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  إنشاء قيد يومية محاسبي جديد (Create Journal Entry Draft)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  if (onCloseInitialCreate) onCloseInitialCreate();
                }}
                className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Header Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1 font-bold">البيان المحاسبي العام للقيد:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قيد تسوية أدوية ومستهلكات العناية المركزة لشهر سبتمبر..."
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">تاريخ القيد المحاسبي:</label>
                <input
                  type="date"
                  value={draftAccountingDate}
                  onChange={(e) => setDraftAccountingDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">الفترة المالية المستهدفة:</label>
                <select
                  value={draftPeriodId}
                  onChange={(e) => setDraftPeriodId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  {activeCalendar.periods.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.periodNameAr} ({p.status === 'open' ? 'مفتوحة' : 'مغلقة'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">تصنيف القيد:</label>
                <select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value as JournalCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="manual_adjustment">تسوية يدوية (Manual Adjustment)</option>
                  <option value="accrual">استحقاق دوري (Accrual)</option>
                  <option value="reversal">عكس قيد (Reversal)</option>
                  <option value="correction">تصحيح خطأ محاسبي (Correction)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">عملة المعاملة وسعر الصرف:</label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={draftCurrency}
                    onChange={(e) => {
                      const cur = e.target.value;
                      setDraftCurrency(cur);
                      const rate = cur === 'SAR' ? 1.0 : cur === 'USD' ? 3.75 : cur === 'EUR' ? 4.10 : 1.0;
                      setDraftExchangeRate(rate);
                    }}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    step="0.0001"
                    value={draftExchangeRate}
                    onChange={(e) => setDraftExchangeRate(parseFloat(e.target.value) || 0)}
                    placeholder="سعر الصرف"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                    title="سعر التحويل للريال السعودي"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1">المرجع المستندي الداعم (Supporting Ref):</label>
                <input
                  type="text"
                  placeholder="مثال: مذكرة تسوية المخزون رقم DOC-2026-081..."
                  value={draftSupportingRef}
                  onChange={(e) => setDraftSupportingRef(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none"
                />
              </div>

            </div>

            {/* Lines Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">أطراف القيد المحاسبي (Journal Lines):</span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة طرف للقيد</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0">
                    <tr>
                      <th className="py-2 px-2.5">#</th>
                      <th className="py-2 px-2.5">الحساب المالي</th>
                      <th className="py-2 px-2.5">مركز التكلفة / القسم</th>
                      <th className="py-2 px-2.5">البيان التفصيلي</th>
                      <th className="py-2 px-2.5 w-24">مدين ({draftCurrency})</th>
                      <th className="py-2 px-2.5 w-24">دائن ({draftCurrency})</th>
                      {draftCurrency !== 'SAR' && <th className="py-2 px-2.5">المعادل بالريال</th>}
                      <th className="py-2 px-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {draftLines.map((line, idx) => (
                      <tr key={line.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-2.5 text-slate-500">{line.lineNumber}</td>
                        
                        {/* Account Selector */}
                        <td className="py-2 px-2.5">
                          <select
                            value={line.accountCode}
                            onChange={(e) => handleLineChange(idx, 'accountCode', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs font-sans max-w-[200px] cursor-pointer"
                          >
                            {leafAccounts.map(a => (
                              <option key={a.id} value={a.accountCode}>
                                {a.accountCode} - {a.nameAr}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Dimensions */}
                        <td className="py-2 px-2.5">
                          <div className="flex items-center gap-1 font-sans">
                            <select
                              value={line.dimensions.costCenterCode || ''}
                              onChange={(e) => handleLineChange(idx, 'costCenterCode', e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-300 cursor-pointer"
                            >
                              <option value="">بدون مركز تكلفة</option>
                              {glState.dimensions.costCenters.map(cc => (
                                <option key={cc.code} value={cc.code}>{cc.code} - {cc.nameAr}</option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-2 px-2.5">
                          <input
                            type="text"
                            value={line.descriptionAr}
                            onChange={(e) => handleLineChange(idx, 'descriptionAr', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-sans w-full"
                          />
                        </td>

                        {/* Debit */}
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={line.debit || ''}
                            onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                            placeholder="0.00"
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold text-xs w-24 text-right"
                          />
                        </td>

                        {/* Credit */}
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={line.credit || ''}
                            onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                            placeholder="0.00"
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-400 font-bold text-xs w-24 text-right"
                          />
                        </td>

                        {/* Base Eq */}
                        {draftCurrency !== 'SAR' && (
                          <td className="py-2 px-2.5 text-slate-400 text-right">
                            {line.debit > 0 ? (line.debit * draftExchangeRate).toFixed(2) : (line.credit * draftExchangeRate).toFixed(2)} ر.س
                          </td>
                        )}

                        {/* Delete Line */}
                        <td className="py-2 px-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                            title="حذف هذا السطر"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Balance & Validation Summary Footer */}
            <div className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              liveValidation.isValid
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {liveValidation.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold">
                    {liveValidation.isValid ? 'القيد متوازن وصالح للترحيل والاعتماد' : 'تنبيه: القيد غير متوازن أو يحتوي أخطاء'}
                  </div>
                  {!liveValidation.isValid && (
                    <div className="text-[11px] text-rose-300 mt-0.5">
                      {liveValidation.errors.join(' • ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs">
                <div>
                  <span className="opacity-75">إجمالي المدين:</span>{' '}
                  <span className="font-bold text-white">{liveValidation.totalDebit.toLocaleString()} {draftCurrency}</span>
                </div>
                <div>
                  <span className="opacity-75">إجمالي الدائن:</span>{' '}
                  <span className="font-bold text-white">{liveValidation.totalCredit.toLocaleString()} {draftCurrency}</span>
                </div>
                <div>
                  <span className="opacity-75">الفرق (Diff):</span>{' '}
                  <span className={`font-bold ${liveValidation.difference === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {liveValidation.difference.toLocaleString()} {draftCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  if (onCloseInitialCreate) onCloseInitialCreate();
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-save-journal-draft"
                  type="button"
                  onClick={() => handleSaveDraft(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  حفظ كمسودة (Draft)
                </button>
                <button
                  id="btn-submit-journal-approval"
                  type="button"
                  onClick={() => handleSaveDraft(true)}
                  disabled={!liveValidation.isValid}
                  className={`px-4 py-2 rounded-lg text-white font-bold cursor-pointer flex items-center gap-1.5 ${
                    liveValidation.isValid ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>حفظ وتقديم للاعتماد</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* JOURNAL DETAIL AUDIT MODAL */}
      {selectedJournalForDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  تفاصيل القيد المحاسبي: {selectedJournalForDetail.id}
                </h3>
                <span className="text-slate-400 font-mono text-[11px]">
                  التاريخ: {selectedJournalForDetail.accountingDate} • الفترة: {selectedJournalForDetail.periodId}
                </span>
              </div>
              <button
                onClick={() => setSelectedJournalForDetail(null)}
                className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-xs">البيان المحاسبي:</div>
              <div className="font-bold text-white text-sm mt-0.5">{selectedJournalForDetail.descriptionAr}</div>
              <div className="flex items-center gap-4 text-slate-400 text-[11px] mt-2">
                <span>المُعد: <b className="text-slate-200">{selectedJournalForDetail.preparedByPersona}</b></span>
                {selectedJournalForDetail.approvedByPersona && (
                  <span>المُعتمِد: <b className="text-emerald-400">{selectedJournalForDetail.approvedByPersona}</b></span>
                )}
                {selectedJournalForDetail.voucherNumber && (
                  <span>رقم السند: <b className="text-blue-400 font-mono">{selectedJournalForDetail.voucherNumber}</b></span>
                )}
              </div>
            </div>

            {/* Lines */}
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">رمز واسم الحساب</th>
                    <th className="py-2.5 px-3">مركز التكلفة</th>
                    <th className="py-2.5 px-3">البيان</th>
                    <th className="py-2.5 px-3">مدين (SAR)</th>
                    <th className="py-2.5 px-3">دائن (SAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {selectedJournalForDetail.lines.map(line => (
                    <tr key={line.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-500">{line.lineNumber}</td>
                      <td className="py-2 px-3 font-sans">
                        <span className="font-mono font-bold text-white">{line.accountCode}</span> - {line.accountNameAr}
                      </td>
                      <td className="py-2 px-3 text-slate-400">{line.dimensions.costCenterCode || '-'}</td>
                      <td className="py-2 px-3 font-sans text-slate-300">{line.descriptionAr}</td>
                      <td className="py-2 px-3 font-bold text-emerald-400">{line.baseDebit > 0 ? line.baseDebit.toLocaleString() : '-'}</td>
                      <td className="py-2 px-3 font-bold text-amber-400">{line.baseCredit > 0 ? line.baseCredit.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedJournalForDetail(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POSTED VOUCHER AUDIT SNAPSHOT MODAL */}
      {selectedVoucherForDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    سند قيد محاسبي مرحل (General Ledger Voucher Snapshot)
                  </h3>
                  <span className="text-emerald-400 font-mono text-xs font-bold">
                    {selectedVoucherForDetail.voucherNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedVoucherForDetail(null);
                  if (onCloseInspectedVoucher) onCloseInspectedVoucher();
                }}
                className="text-slate-400 hover:text-white text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800 text-emerald-200 text-xs">
              🔒 <b>سجل قيد مالي محصن:</b> تم ترحيل هذا السند نهائياً في دفتر الأستاذ العام، وهو غير قابل للتعديل أو الحذف المباشر التزاماً بالضوابط الرقابية المحاسبية.
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
              <div>
                <span className="text-slate-500">تاريخ القيد:</span>
                <div className="font-mono font-bold text-white">{selectedVoucherForDetail.accountingDate}</div>
              </div>
              <div>
                <span className="text-slate-500">الفترة المالية:</span>
                <div className="font-mono font-bold text-blue-400">{selectedVoucherForDetail.periodId}</div>
              </div>
              <div>
                <span className="text-slate-500">المُرحِل:</span>
                <div className="font-bold text-white">{selectedVoucherForDetail.postedByPersona}</div>
              </div>
              <div>
                <span className="text-slate-500">إجمالي السند:</span>
                <div className="font-mono font-bold text-emerald-400">{selectedVoucherForDetail.totalDebitSar.toLocaleString()} ر.س</div>
              </div>
            </div>

            {/* Voucher Lines */}
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">الحساب المالي</th>
                    <th className="py-2.5 px-3">مركز التكلفة</th>
                    <th className="py-2.5 px-3">مدين (SAR)</th>
                    <th className="py-2.5 px-3">دائن (SAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {selectedVoucherForDetail.lines.map(line => (
                    <tr key={line.id}>
                      <td className="py-2 px-3 text-slate-500">{line.lineNumber}</td>
                      <td className="py-2 px-3 font-sans">
                        <span className="font-mono font-bold text-white">{line.accountCode}</span> - {line.accountNameAr}
                      </td>
                      <td className="py-2 px-3 text-slate-400">{line.dimensions.costCenterCode || '-'}</td>
                      <td className="py-2 px-3 font-bold text-emerald-400">{line.baseDebit > 0 ? line.baseDebit.toLocaleString() : '-'}</td>
                      <td className="py-2 px-3 font-bold text-amber-400">{line.baseCredit > 0 ? line.baseCredit.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setSelectedVoucherForDetail(null);
                  if (onCloseInspectedVoucher) onCloseInspectedVoucher();
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVERSAL MODAL */}
      {reversalTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-white text-sm">
                عكس قيد محاسبي (Create Reversal Journal)
              </h3>
            </div>

            <p className="text-slate-300 leading-relaxed">
              سيتم إنشاء قيد عكسي مطابق تماماً للقيد <span className="font-bold font-mono text-white">{reversalTarget.id}</span> بأطراف محاسبية متعاكسة (تبديل المدين بالدائن) مع ربط القيد بالأصل لحفظ تاريخ التدقيق.
            </p>

            {reversalError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-200">
                {reversalError}
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-bold">سبب العكس المحاسبي (إلزامي):</label>
              <textarea
                rows={2}
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">تاريخ العكس:</label>
                <input
                  type="date"
                  value={reversalDate}
                  onChange={(e) => setReversalDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">الفترة المالية:</label>
                <select
                  value={reversalPeriodId}
                  onChange={(e) => setReversalPeriodId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  {activeCalendar.periods.map(p => (
                    <option key={p.id} value={p.id}>{p.periodNameAr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReversalTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="btn-confirm-reversal"
                type="button"
                onClick={handleConfirmReversal}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
              >
                تأكيد العكس المحاسبي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORRECTION MODAL */}
      {correctionTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-xs my-8">
            <div className="flex items-center gap-2 text-purple-400 border-b border-slate-800 pb-3">
              <Wrench className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-white text-sm">
                تصحيح خطأ محاسبي (Correction Workflow)
              </h3>
            </div>

            <p className="text-slate-300 leading-relaxed">
              وفقاً للمعايير المحاسبية، يتم التصحيح عبر خطوتين: (1) عكس القيد الخاطئ بالكامل تلقائياً، و (2) إنشاء قيد اليومية المصحح بالبنود الصحيحة.
            </p>

            {correctionError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-200">
                {correctionError}
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-bold">سبب التصحيح والمذكرة التوضيحية:</label>
              <input
                type="text"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white">الأطراف المصححة (Corrected Lines):</span>
              <div className="border border-slate-800 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="py-2 px-2.5">#</th>
                      <th className="py-2 px-2.5">الحساب المالي</th>
                      <th className="py-2 px-2.5">مدين (SAR)</th>
                      <th className="py-2 px-2.5">دائن (SAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {correctionLines.map((line, idx) => (
                      <tr key={line.id}>
                        <td className="py-2 px-2.5 text-slate-500">{line.lineNumber}</td>
                        <td className="py-2 px-2.5">
                          <select
                            value={line.accountCode}
                            onChange={(e) => {
                              const acc = glState.accounts.find(a => a.accountCode === e.target.value);
                              if (acc) {
                                const upd = [...correctionLines];
                                upd[idx] = {
                                  ...upd[idx],
                                  accountId: acc.id,
                                  accountCode: acc.accountCode,
                                  accountNameAr: acc.nameAr,
                                  dimensions: {
                                    ...upd[idx].dimensions,
                                    departmentId: acc.restrictions.requiresDepartment ? (acc.accountCode === '5120' ? 'pharmacy' : 'icu') : undefined,
                                    costCenterCode: acc.restrictions.requiresCostCenter ? (acc.accountCode === '5120' ? 'CC-PHARM-201' : 'CC-ICU-701') : undefined
                                  }
                                };
                                setCorrectionLines(upd);
                              }
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs font-sans"
                          >
                            {leafAccounts.map(a => (
                              <option key={a.id} value={a.accountCode}>{a.accountCode} - {a.nameAr}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            value={line.debit}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const upd = [...correctionLines];
                              upd[idx] = { ...upd[idx], debit: val, baseDebit: val, credit: val > 0 ? 0 : upd[idx].credit, baseCredit: val > 0 ? 0 : upd[idx].credit };
                              setCorrectionLines(upd);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold text-xs w-24 text-right"
                          />
                        </td>
                        <td className="py-2 px-2.5">
                          <input
                            type="number"
                            value={line.credit}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const upd = [...correctionLines];
                              upd[idx] = { ...upd[idx], credit: val, baseCredit: val, debit: val > 0 ? 0 : upd[idx].debit, baseDebit: val > 0 ? 0 : upd[idx].debit };
                              setCorrectionLines(upd);
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-400 font-bold text-xs w-24 text-right"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCorrectionTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="btn-confirm-correction"
                type="button"
                onClick={handleConfirmCorrection}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
              >
                تنفيذ التصحيح (عكس + قيد بديل)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
