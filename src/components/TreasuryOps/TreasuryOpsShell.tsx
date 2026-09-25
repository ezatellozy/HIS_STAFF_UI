import React, { useState } from 'react';
import {
  Landmark,
  LayoutDashboard,
  Building2,
  FileCheck2,
  Send,
  Coins,
  FileText,
  Scale,
  TrendingUp,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ShieldCheck,
  FileCode,
  Info,
  X,
  Check,
  Lock
} from 'lucide-react';
import {
  TreasuryState,
  TreasuryPersona,
  Iso20022StatusCode,
  Iso20022ReasonCode,
  BankResponseStatus
} from '../../types/treasury';
import { getInitialTreasuryState } from '../../data/mockTreasuryData';
import { runTreasuryTestSuite, TreasuryTestReport } from '../../tests/treasuryTestSuite';

import { TreasuryPreviewBanner } from './TreasuryPreviewBanner';
import { TreasuryOverviewDashboard } from './TreasuryOverviewDashboard';
import { BankCashAccountsWorkspace } from './BankCashAccountsWorkspace';
import { PaymentAuthorizationsWorkspace } from './PaymentAuthorizationsWorkspace';
import { PaymentInstructionsWorkspace } from './PaymentInstructionsWorkspace';
import { CashReceiptsDepositsWorkspace } from './CashReceiptsDepositsWorkspace';
import { BankStatementsWorkspace } from './BankStatementsWorkspace';
import { ReconciliationExceptionsWorkspace } from './ReconciliationExceptionsWorkspace';
import { LiquidityReportsWorkspace } from './LiquidityReportsWorkspace';

/**
 * Canonical ISO 20022 Payment Status and Status Reason Mapping Specification
 * Standards Reference:
 * - pain.001.001.09 / pain.001.001.03: Customer Credit Transfer Initiation
 * - pain.002.001.10 / pain.002.001.03: Customer Payment Status Report (<CstmrPmtStsRpt>)
 *
 * Strict Accounting & Treasury Governance Rules:
 * 1. Technical Validation (ACTC) is PRE-SETTLEMENT only. Syntax/schema validated at gateway. Confirmed amount = 0.00 SAR.
 * 2. Accepted Customer Profile (ACCP) is PRE-SETTLEMENT only. Debtor authorizations and account status approved. Confirmed amount = 0.00 SAR.
 * 3. Accepted Settlement In Process (ACSP / PDNG) is PRE-SETTLEMENT only. Queued for clearing cycle. Confirmed amount = 0.00 SAR.
 * 4. Settlement Completed (ACSC debtor side / ACCC creditor side) is FINAL SETTLEMENT. Debited/credited funds. Eligible for AP settlement recognition.
 * 5. AC04 (Closed Account Number) is an ISO 20022 Status REASON code (<StsRsnInf>/<Rsn>/<Cd>AC04</Cd>), NOT a status code.
 *    Any input providing AC04 is mapped to payment status RJCT (Rejected) with reason code AC04 and confirmed amount = 0.00 SAR.
 */
export interface Iso20022PaymentStatusMapping {
  messageType: 'pain.002';
  isoStatusCode: Iso20022StatusCode;
  statusReasonCode: Iso20022ReasonCode;
  internalStatus: BankResponseStatus;
  category: 'technical_validation' | 'customer_profile' | 'settlement_in_process' | 'settlement_completed' | 'rejection';
  isPreSettlement: boolean;
  isTechnicalValidationOnly: boolean;
  isCustomerProfileAccepted: boolean;
  isFinalSettlement: boolean;
  isRejection: boolean;
  affectsConfirmedAmount: boolean;
  statusLabelAr: string;
  statusLabelEn: string;
  reasonLabelAr?: string;
  reasonLabelEn?: string;
  accountingImpactAr: string;
  ruleExplanationAr: string;
}

export function mapIso20022PaymentStatus(
  inputStatusOrCode: string,
  inputReasonCode?: string
): Iso20022PaymentStatusMapping {
  const rawCode = (inputStatusOrCode || '').trim().toUpperCase();
  const rawReason = (inputReasonCode || '').trim().toUpperCase();

  // Rule A: Handle AC04 passed as code or reason -> strictly treated as rejection reason under RJCT
  if (rawCode === 'AC04' || rawReason === 'AC04') {
    return {
      messageType: 'pain.002',
      isoStatusCode: 'RJCT',
      statusReasonCode: 'AC04',
      internalStatus: 'rejected',
      category: 'rejection',
      isPreSettlement: false,
      isTechnicalValidationOnly: false,
      isCustomerProfileAccepted: false,
      isFinalSettlement: false,
      isRejection: true,
      affectsConfirmedAmount: false,
      statusLabelAr: 'أمر دفع مرفوض من البنك (RJCT)',
      statusLabelEn: 'Rejected Payment Status (RJCT)',
      reasonLabelAr: 'رقم الحساب مغلق أو غير موجود لدى البنك المستفيد (AC04 - Closed Account Number)',
      reasonLabelEn: 'Closed Account Number (AC04)',
      accountingImpactAr: 'لا يترتب أي قيد محاسبي أو خصم نقدية، الرصيد المؤكد = 0.00 ر.س، وتبقى التزامات الموردين قائمة دون براءة ذمة.',
      ruleExplanationAr: 'رمز AC04 مصنف معيارياً في ISO 20022 كرمز سبب رفض (<StsRsnInf>/<Rsn>/<Cd>AC04</Cd>) تابع لحالة RJCT، وليس رمز حالة دفع مستقل.'
    };
  }

  // Rule B: Technical Validation (ACTC)
  if (rawCode === 'ACTC') {
    return {
      messageType: 'pain.002',
      isoStatusCode: 'ACTC',
      statusReasonCode: (rawReason as Iso20022ReasonCode) || 'NONE',
      internalStatus: 'bank_accepted_for_processing',
      category: 'technical_validation',
      isPreSettlement: true,
      isTechnicalValidationOnly: true,
      isCustomerProfileAccepted: false,
      isFinalSettlement: false,
      isRejection: false,
      affectsConfirmedAmount: false,
      statusLabelAr: 'قبول التحقق الفني (ACTC) - قيد المعالجة',
      statusLabelEn: 'Accepted Technical Validation (ACTC)',
      accountingImpactAr: 'لا خصم للمال (الرصيد المؤكد = 0.00 ر.س)، لا تسوية دفترية لفواتير الموردين حتى ورود إشعار التسوية النهائي.',
      ruleExplanationAr: 'اجتياز الفحص التقني لهيكل الرسالة والتشفير عند بوابة سريع. حالة فنية مرحلية تسبق دورات المقاصة والخصم الفعلي.'
    };
  }

  // Rule C: Customer Profile Accepted (ACCP)
  if (rawCode === 'ACCP') {
    return {
      messageType: 'pain.002',
      isoStatusCode: 'ACCP',
      statusReasonCode: (rawReason as Iso20022ReasonCode) || 'NONE',
      internalStatus: 'bank_accepted_for_processing',
      category: 'customer_profile',
      isPreSettlement: true,
      isTechnicalValidationOnly: false,
      isCustomerProfileAccepted: true,
      isFinalSettlement: false,
      isRejection: false,
      affectsConfirmedAmount: false,
      statusLabelAr: 'قبول ملف العميل وحدود الصرف (ACCP) - قيد المعالجة',
      statusLabelEn: 'Accepted Customer Profile (ACCP)',
      accountingImpactAr: 'لا خصم للمال (الرصيد المؤكد = 0.00 ر.س). اجتياز التحقق من حساب المدين وحدود السقف اليومي ولا يشكل تسوية نهائية.',
      ruleExplanationAr: 'التحقق المصرفي من صلاحيات حساب المستشفى والحدود الائتمانية. يظل المبلغ في حالة انتظار التسوية البنكية.'
    };
  }

  // Rule D: Settlement in Process (ACSP / PDNG)
  if (rawCode === 'ACSP' || rawCode === 'PDNG') {
    return {
      messageType: 'pain.002',
      isoStatusCode: rawCode === 'PDNG' ? 'PDNG' : 'ACSP',
      statusReasonCode: (rawReason as Iso20022ReasonCode) || 'NONE',
      internalStatus: 'bank_accepted_for_processing',
      category: 'settlement_in_process',
      isPreSettlement: true,
      isTechnicalValidationOnly: false,
      isCustomerProfileAccepted: false,
      isFinalSettlement: false,
      isRejection: false,
      affectsConfirmedAmount: false,
      statusLabelAr: 'التسوية قيد التنفيذ (ACSP) - معلق بدورة سريع',
      statusLabelEn: 'Accepted Settlement in Process (ACSP)',
      accountingImpactAr: 'المعاملة بانتظار اكتمال دورة المقاصة الصافية، لا تعديل على الأرصدة المؤكدة (الرصيد المؤكد = 0.00 ر.س).',
      ruleExplanationAr: 'المعاملة قيد التنفيذ في المقاصة اللحظية أو بين البنوك وتنتظر تأكيد الخصم النهائي (ACSC).'
    };
  }

  // Rule E: Final Settlement Completed (ACSC / ACCC)
  if (rawCode === 'ACSC' || rawCode === 'ACCC' || rawCode === 'CONFIRMED' || rawCode === 'SETTLED') {
    const isCreditor = rawCode === 'ACCC';
    return {
      messageType: 'pain.002',
      isoStatusCode: isCreditor ? 'ACCC' : 'ACSC',
      statusReasonCode: 'NONE',
      internalStatus: 'confirmed',
      category: 'settlement_completed',
      isPreSettlement: false,
      isTechnicalValidationOnly: false,
      isCustomerProfileAccepted: false,
      isFinalSettlement: true,
      isRejection: false,
      affectsConfirmedAmount: true,
      statusLabelAr: isCreditor
        ? 'تسوية مكتملة لدى بنك المستفيد (ACCC) - تسوية نهائية'
        : 'تسوية مكتملة على حساب المدين (ACSC) - تسوية نهائية',
      statusLabelEn: isCreditor
        ? 'Settlement Completed - Creditor Agent (ACCC)'
        : 'Settlement Completed - Debtor Agent (ACSC)',
      accountingImpactAr: 'خصم بنكي حقيقي ومثبت، الرصيد المؤكد يساوي قيمة أمر التحويل، والمعاملة مؤهلة لاكتمال دورة سداد الحسابات الدائنة (AP).',
      ruleExplanationAr: 'اكتمال التسوية النهائية وتحرك الأموال الفعلي من حساب المستشفى لحساب المستفيد.'
    };
  }

  // Rule F: Rejection (RJCT)
  if (rawCode === 'RJCT' || rawCode === 'REJECTED') {
    const rCode = (rawReason as Iso20022ReasonCode) || 'NONE';
    let rDescAr = 'تم رفض أمر الدفع من النظام المصرفي';
    let rDescEn = 'Payment rejected by bank';
    if (rCode === 'AC04') {
      rDescAr = 'رقم الحساب مغلق أو غير موجود لدى البنك المستفيد (AC04 - Closed Account Number)';
      rDescEn = 'Closed Account Number (AC04)';
    } else if (rCode === 'AM04') {
      rDescAr = 'عدم كفاية الرصيد المصرفي لتنفيذ التحويل (AM04 - Insufficient Funds)';
      rDescEn = 'Insufficient Funds (AM04)';
    } else if (rCode === 'AG01') {
      rDescAr = 'المعاملة محظورة بموجب السياسات المصرفية (AG01 - Transaction Forbidden)';
      rDescEn = 'Transaction Forbidden (AG01)';
    } else if (rCode === 'RC01') {
      rDescAr = 'رمز البنك المستلم غير صحيح (RC01 - Bank Identifier Invalid)';
      rDescEn = 'Bank Identifier Invalid (RC01)';
    }

    return {
      messageType: 'pain.002',
      isoStatusCode: 'RJCT',
      statusReasonCode: rCode,
      internalStatus: 'rejected',
      category: 'rejection',
      isPreSettlement: false,
      isTechnicalValidationOnly: false,
      isCustomerProfileAccepted: false,
      isFinalSettlement: false,
      isRejection: true,
      affectsConfirmedAmount: false,
      statusLabelAr: 'أمر دفع مرفوض من البنك (RJCT)',
      statusLabelEn: 'Rejected Payment (RJCT)',
      reasonLabelAr: rDescAr,
      reasonLabelEn: rDescEn,
      accountingImpactAr: 'الرصيد المؤكد = 0.00 ر.س، الرصيد المرفوض = كامل مبلغ الأمر، ويتم حفظ إشعار الرفض ورمز السبب في سجل المعاملة.',
      ruleExplanationAr: 'رفض نهائي للأمر من البنك أو سريع مع تقييد رمز السبب. لا يتم خصم الحساب البنكي ولا تسوية فواتير المورد.'
    };
  }

  // Fallback default
  return {
    messageType: 'pain.002',
    isoStatusCode: 'ACTC',
    statusReasonCode: 'NONE',
    internalStatus: 'bank_accepted_for_processing',
    category: 'technical_validation',
    isPreSettlement: true,
    isTechnicalValidationOnly: true,
    isCustomerProfileAccepted: false,
    isFinalSettlement: false,
    isRejection: false,
    affectsConfirmedAmount: false,
    statusLabelAr: 'قبول التحقق الفني (ACTC) - حالة افتراضية',
    statusLabelEn: 'Technical Validation (ACTC)',
    accountingImpactAr: 'حالة غير مصنفة، تعامل افتراضياً كتحقق فني غير منجز للتسوية (الرصيد المؤكد = 0.00 ر.س).',
    ruleExplanationAr: 'رمز غير معتمد، تم تصنيفه احترازياً كفحص أولي غير منجز لحركة الأموال.'
  };
}

type TreasuryTab =
  | 'overview'
  | 'accounts'
  | 'authorizations'
  | 'instructions'
  | 'cash_office'
  | 'statements'
  | 'reconciliation'
  | 'liquidity'
  | 'test_suite';

export const TreasuryOpsShell: React.FC = () => {
  const [treasuryState, setTreasuryState] = useState<TreasuryState>(getInitialTreasuryState());
  const [activeTab, setActiveTab] = useState<TreasuryTab>('overview');
  const [testReport, setTestReport] = useState<TreasuryTestReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // ISO 20022 Governance & Mapping Inspector Modal State
  const [showIsoMappingModal, setShowIsoMappingModal] = useState(false);
  const [testStatusCode, setTestStatusCode] = useState<string>('ACTC');
  const [testReasonCode, setTestReasonCode] = useState<string>('NONE');

  const handlePersonaChange = (persona: TreasuryPersona) => {
    setTreasuryState(prev => ({
      ...prev,
      activePersona: persona
    }));
  };

  const handleResetState = () => {
    if (window.confirm('هل تريد إعادة تعيين بيانات الخزينة إلى حالتها الأولية؟')) {
      setTreasuryState(getInitialTreasuryState());
      setTestReport(null);
    }
  };

  const handleRunLiveTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const report = runTreasuryTestSuite();
      setTestReport(report);
      setIsRunningTests(false);
    }, 200);
  };

  const personaLabels: Record<TreasuryPersona, { title: string; name: string }> = {
    treasury_supervisor: { title: 'مشرف الخزينة والاعتمادات', name: 'سليمان القحطاني' },
    treasury_clerk: { title: 'كاتب الخزينة ومعد الأوامر (Maker)', name: 'طارق العمري' },
    finance_controller: { title: 'المدير المالي التنفيذي (CFO)', name: 'عبدالرحمن العتيبي' },
    reconciliation_reviewer: { title: 'مراجع التسويات البنكية', name: 'محمد الدوسري' },
    cash_custodian: { title: 'أمين الصندوق والعهدة النقدية', name: 'أحمد الغامدي' }
  };

  const currentMappingTest = mapIso20022PaymentStatus(testStatusCode, testReasonCode);

  return (
    <div id="treasury-ops-shell" className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans" dir="rtl">
      {/* 1. Synthetic Warning & Controls Banner */}
      <TreasuryPreviewBanner
        activePersona={treasuryState.activePersona}
        onPersonaChange={handlePersonaChange}
      />

      {/* 2. Sub-Header: Module Identity & Workspace Tabs */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  إدارة الخزينة والعمليات النقدية والبنكية (Treasury & Cash/Bank Operations)
                </h1>
                <p className="text-[11px] text-neutral-500">
                  مستشفى الأمل التخصصي • وحدة الخزينة المركزية وحوكمة السيولة المصرفية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-neutral-500">المستخدم الحالي:</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {personaLabels[treasuryState.activePersona].name}
                </span>
                <span className="text-[10px] text-neutral-400">
                  ({personaLabels[treasuryState.activePersona].title})
                </span>
              </div>

              <button
                onClick={() => setShowIsoMappingModal(true)}
                title="حوكمة ومطابقة معايير ISO 20022 (pain.002 Mapping)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors text-xs font-semibold shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">معايير وحوكمة ISO 20022</span>
              </button>

              <button
                onClick={handleResetState}
                title="إعادة ضبط البيانات الأولية"
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="flex space-x-reverse space-x-1 overflow-x-auto pb-1 text-xs border-t border-neutral-100 dark:border-neutral-800 pt-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>لوحة المؤشرات التنفيذية</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'accounts'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>الحسابات البنكية والصناديق</span>
              <span className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {treasuryState.accounts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('authorizations')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'authorizations'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>تراخيص الصرف والرقابة</span>
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {treasuryState.authorizations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'instructions'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>أوامر الدفع وسريع</span>
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {treasuryState.instructions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cash_office')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'cash_office'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>النقدية والإيداعات</span>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {treasuryState.custodyRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('statements')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'statements'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>كشوف الحسابات</span>
              <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {treasuryState.statements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'reconciliation'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>المطابقة والاستثناءات</span>
              {treasuryState.exceptions.length > 0 && (
                <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {treasuryState.exceptions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('liquidity')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'liquidity'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>السيولة والتنبؤ</span>
            </button>

            <button
              onClick={() => setActiveTab('test_suite')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === 'test_suite'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>فاحص السيناريوهات (53 Tests)</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 3. Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <TreasuryOverviewDashboard
            state={treasuryState}
            onNavigate={(target) => {
              if (target === 'authorizations') setActiveTab('authorizations');
              else if (target === 'instructions') setActiveTab('instructions');
              else if (target === 'reconciliation') setActiveTab('reconciliation');
              else if (target === 'exceptions') setActiveTab('reconciliation');
              else if (target === 'cash_office') setActiveTab('cash_office');
              else if (target === 'accounts') setActiveTab('accounts');
            }}
          />
        )}

        {activeTab === 'accounts' && (
          <BankCashAccountsWorkspace
            state={treasuryState}
            onStateUpdate={setTreasuryState}
          />
        )}

        {activeTab === 'authorizations' && (
          <PaymentAuthorizationsWorkspace
            state={treasuryState}
            onStateUpdate={setTreasuryState}
            onNavigateToInstructions={() => setActiveTab('instructions')}
          />
        )}

        {activeTab === 'instructions' && (
          <PaymentInstructionsWorkspace
            state={treasuryState}
            onStateUpdate={setTreasuryState}
          />
        )}

        {activeTab === 'cash_office' && (
          <CashReceiptsDepositsWorkspace
            state={treasuryState}
            onStateUpdate={setTreasuryState}
          />
        )}

        {activeTab === 'statements' && (
          <BankStatementsWorkspace
            state={treasuryState}
            onStateUpdate={setTreasuryState}
            onNavigateToReconciliation={() => setActiveTab('reconciliation')}
          />
        )}

        {activeTab === 'reconciliation' && (
          <ReconciliationExceptionsWorkspace
            state={treasuryState}
            onStateUpdate={setTreasuryState}
          />
        )}

        {activeTab === 'liquidity' && (
          <LiquidityReportsWorkspace
            state={treasuryState}
            onStateUpdate={setTreasuryState}
          />
        )}

        {activeTab === 'test_suite' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-purple-600" />
                  <span>مدقق السيناريوهات الآلي الشامل (Independent Verification Test Suite)</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  تشغيل 53 اختباراً آلياً يتحقق من السيناريوهات الـ 30، الرقابة الثنائية، الحظر، المطابقة، الاستثناءات، وعمليات الخزينة المستقلة.
                </p>
              </div>

              <button
                disabled={isRunningTests}
                onClick={handleRunLiveTests}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRunningTests ? (
                  <span>جاري تشغيل الفحص...</span>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>تشغيل جميع الاختبارات الآن (53/53)</span>
                  </>
                )}
              </button>
            </div>

            {testReport && (
              <div className="space-y-4">
                {/* Result KPI */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    testReport.allPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {testReport.allPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold">
                        {testReport.allPassed
                          ? 'نجحت جميع الاختبارات بنسبة 100% (All 53 Tests Passed)'
                          : `فشل ${testReport.failed} اختبار`}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                        إجمالي الاختبارات: {testReport.total} • الناجحة: {testReport.passed} • الفاشلة: {testReport.failed}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-sm font-bold">
                    {testReport.passed}/{testReport.total}
                  </span>
                </div>

                {/* Test Results Table */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-500">
                        <th className="p-3">معرّف الاختبار</th>
                        <th className="p-3">عنوان السيناريو وفحوى التحقق</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3">تفاصيل النتيجة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                      {testReport.results.map(r => (
                        <tr key={r.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                          <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100">
                            {r.id}
                          </td>
                          <td className="p-3 font-sans text-neutral-800 dark:text-neutral-200">
                            {r.title}
                          </td>
                          <td className="p-3">
                            {r.passed ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> ناجح
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3" /> فاشل
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-sans text-[11px] text-neutral-500">
                            {r.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-3 text-center text-xs text-neutral-500">
        نظام الخزينة والعمليات البنكية والنقدية • نموذج تصميمي ومحاكاة رقابية مستقلة للسيولة والمطابقة (HIS Treasury Architecture)
      </footer>

      {/* 5. ISO 20022 Governance & Mapping Inspector Modal */}
      {showIsoMappingModal && (
        <div
          id="iso20022-mapping-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      دليل وحوكمة مطابقة معايير ISO 20022 لإشعارات الدفع المصرفية
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                      pain.002.001.10
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    مستشفى الأمل التخصصي • قواعد تصنيف حالات التحقق الفني والتسوية النهائية ومعاملة رمز AC04
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIsoMappingModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Message Type Differentiation Banner */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <p className="font-bold text-amber-950 dark:text-amber-100">
                    التمييز المعياري بين رسائل الدفع ISO 20022:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                    <li><strong className="font-mono">pain.001</strong>: رسالة أمر التحويل الصادرة من العميل/المستشفى للبنك (Payment Initiation).</li>
                    <li><strong className="font-mono">pain.002</strong>: رسالة تقرير حالة المعاملة الواردة من البنك/سريع (Payment Status Report).</li>
                    <li><strong className="font-mono">camt.053 / camt.054</strong>: كشف الحساب البنكي وإشعار القيد والخصم الفعلي (Bank Statement / Debit Notification).</li>
                  </ul>
                </div>
              </div>

              {/* Three Core Governance Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 text-xs mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    1. التحقق الفني (Pre-Settlement)
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
                    يشمل <strong className="font-mono text-neutral-800 dark:text-neutral-200">ACTC</strong> (اجتياز الفحص التقني والتشفير) و <strong className="font-mono text-neutral-800 dark:text-neutral-200">ACCP</strong> (قبول صلاحيات العميل). 
                    <span className="text-rose-600 dark:text-rose-400 font-bold block mt-1">لا تحرك للمال • الرصيد المؤكد = 0.00 ر.س</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 text-xs mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    2. التسوية المكتملة (Final Settlement)
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
                    يشمل <strong className="font-mono text-neutral-800 dark:text-neutral-200">ACSC</strong> (خصم حساب المدين) و <strong className="font-mono text-neutral-800 dark:text-neutral-200">ACCC</strong> (قيد حساب الدائن). 
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold block mt-1">تسوية بنكية نهائية • مؤهل لإغلاق فواتير الموردين (AP)</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-200 text-xs mb-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    3. معالجة رمز AC04 (Rejection Reason)
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal">
                    رمز <strong className="font-mono text-rose-700 dark:text-rose-300">AC04</strong> هو رمز سبب رفض (Closed Account Number) وليس رمز حالة دفع.
                    <span className="text-rose-700 dark:text-rose-300 font-bold block mt-1">يُصنف تحت حالة RJCT • الرصيد المؤكد = 0.00 ر.س</span>
                  </p>
                </div>
              </div>

              {/* ISO 20022 Status Governance Matrix Table */}
              <div>
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  جدول مطابقة حالات ISO 20022 (pain.002) المعتمد في الخزينة
                </h3>
                <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300">
                      <tr>
                        <th className="p-2.5">رمز ISO</th>
                        <th className="p-2.5">المسمى المعياري</th>
                        <th className="p-2.5">طبيعة المعاملة</th>
                        <th className="p-2.5">أثر الرصيد المؤكد</th>
                        <th className="p-2.5">أثر الحسابات الدائنة (AP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-2.5 font-mono font-bold text-blue-700 dark:text-blue-400">ACTC</td>
                        <td className="p-2.5 font-medium">AcceptedTechnicalValidation</td>
                        <td className="p-2.5 text-neutral-600 dark:text-neutral-400">فحص فني وتشفير سليم لدى سريع</td>
                        <td className="p-2.5 font-bold text-neutral-500">0.00 ر.س (لا حركة مالية)</td>
                        <td className="p-2.5 text-neutral-500">معلق بانتظار التسوية</td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-2.5 font-mono font-bold text-blue-700 dark:text-blue-400">ACCP</td>
                        <td className="p-2.5 font-medium">AcceptedCustomerProfile</td>
                        <td className="p-2.5 text-neutral-600 dark:text-neutral-400">صلاحيات وسقف السحب اليومي للمدين مقبولة</td>
                        <td className="p-2.5 font-bold text-neutral-500">0.00 ر.س (لا حركة مالية)</td>
                        <td className="p-2.5 text-neutral-500">معلق بانتظار التسوية</td>
                      </tr>
                      <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-2.5 font-mono font-bold text-amber-700 dark:text-amber-400">ACSP</td>
                        <td className="p-2.5 font-medium">AcceptedSettlementInProcess</td>
                        <td className="p-2.5 text-neutral-600 dark:text-neutral-400">في طور المقاصة اللحظية/المجمعة</td>
                        <td className="p-2.5 font-bold text-neutral-500">0.00 ر.س (قيد المعالجة)</td>
                        <td className="p-2.5 text-neutral-500">معلق بانتظار إشعار الخصم</td>
                      </tr>
                      <tr className="bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30">
                        <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">ACSC</td>
                        <td className="p-2.5 font-medium text-emerald-900 dark:text-emerald-200">AcceptedSettlementCompleted (Debtor)</td>
                        <td className="p-2.5 text-emerald-800 dark:text-emerald-300">خصم بنكي نهائي ومثبت من حساب المستشفى</td>
                        <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-300">كامل قيمة الأمر</td>
                        <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-300">مؤهل لتسوية فواتير الموردين</td>
                      </tr>
                      <tr className="bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30">
                        <td className="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">ACCC</td>
                        <td className="p-2.5 font-medium text-emerald-900 dark:text-emerald-200">AcceptedSettlementCompleted (Creditor)</td>
                        <td className="p-2.5 text-emerald-800 dark:text-emerald-300">قيد نهائي في حساب المستفيد البنكي</td>
                        <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-300">كامل قيمة الأمر</td>
                        <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-300">إبراء ذمة المورد بالكامل</td>
                      </tr>
                      <tr className="bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50 dark:hover:bg-rose-950/30">
                        <td className="p-2.5 font-mono font-bold text-rose-700 dark:text-rose-400">RJCT</td>
                        <td className="p-2.5 font-medium text-rose-900 dark:text-rose-200">RejectedPaymentStatus</td>
                        <td className="p-2.5 text-rose-800 dark:text-rose-300">رفض العملية من النظام المصرفي (مع رمز السبب)</td>
                        <td className="p-2.5 font-bold text-rose-700 dark:text-rose-300">0.00 ر.س (رفض تام)</td>
                        <td className="p-2.5 font-bold text-rose-700 dark:text-rose-300">لا تسوية • تظل الذمة قائمة</td>
                      </tr>
                      <tr className="bg-rose-100/40 dark:bg-rose-950/40 hover:bg-rose-100/60 dark:hover:bg-rose-950/50">
                        <td className="p-2.5 font-mono font-bold text-rose-800 dark:text-rose-300">AC04</td>
                        <td className="p-2.5 font-medium text-rose-950 dark:text-rose-100">ClosedAccountNumber (Reason Code)</td>
                        <td className="p-2.5 text-rose-900 dark:text-rose-200 font-medium">رمز سبب رفض تحت RJCT (الحساب مغلق)</td>
                        <td className="p-2.5 font-bold text-rose-800 dark:text-rose-300">0.00 ر.س (RJCT)</td>
                        <td className="p-2.5 font-bold text-rose-800 dark:text-rose-300">مطالبة المورد بتحديث الآيبان</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Live Testing Sandbox */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    أداة الفحص التفاعلي لدالة المطابقة: <code className="font-mono text-indigo-600 dark:text-indigo-400">mapIso20022PaymentStatus()</code>
                  </h4>
                  <span className="text-[11px] text-neutral-500">اختبار استجابة المحرك اللحظية</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      رمز الحالة المدخل (ISO Status / Code):
                    </label>
                    <select
                      value={testStatusCode}
                      onChange={(e) => setTestStatusCode(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-mono"
                    >
                      <option value="ACTC">ACTC - AcceptedTechnicalValidation</option>
                      <option value="ACCP">ACCP - AcceptedCustomerProfile</option>
                      <option value="ACSP">ACSP - AcceptedSettlementInProcess</option>
                      <option value="ACSC">ACSC - AcceptedSettlementCompleted (Debtor)</option>
                      <option value="ACCC">ACCC - AcceptedSettlementCompleted (Creditor)</option>
                      <option value="RJCT">RJCT - RejectedPaymentStatus</option>
                      <option value="AC04">AC04 - (Inputted mistakenly as status)</option>
                      <option value="PDNG">PDNG - Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      رمز سبب الحالة (Status Reason Code):
                    </label>
                    <select
                      value={testReasonCode}
                      onChange={(e) => setTestReasonCode(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 font-mono"
                    >
                      <option value="NONE">NONE - لا يوجد سبب رفض (تسوية/معالجة ناجحة)</option>
                      <option value="AC04">AC04 - Closed Account Number (حساب مغلق)</option>
                      <option value="AM04">AM04 - Insufficient Funds (عدم كفاية الرصيد)</option>
                      <option value="AG01">AG01 - Transaction Forbidden (عملية محظورة)</option>
                      <option value="RC01">RC01 - Bank Identifier Invalid (رمز بنك خاطئ)</option>
                    </select>
                  </div>
                </div>

                {/* Test Output Card */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-500">حالة ISO الناتجة:</span>
                      <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {currentMappingTest.isoStatusCode}
                      </span>
                      {currentMappingTest.statusReasonCode !== 'NONE' && (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          سبب: {currentMappingTest.statusReasonCode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {currentMappingTest.isFinalSettlement ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                          تسوية نهائية (Final Settlement)
                        </span>
                      ) : currentMappingTest.isPreSettlement ? (
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                          تحقق أولي مرحلي (Pre-Settlement)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                          مرفوض بنكياً (Rejection)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">مسمى الحالة العربي:</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{currentMappingTest.statusLabelAr}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">الأثر المالي على الرصيد المؤكد:</span>
                      <span className={`font-bold ${currentMappingTest.affectsConfirmedAmount ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {currentMappingTest.affectsConfirmedAmount ? 'تأكيد خصم الرصيد البنكي' : '0.00 ر.س (لا تسوية مالية)'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
                    <p><strong className="text-neutral-800 dark:text-neutral-200">القاعدة المعيارية:</strong> {currentMappingTest.ruleExplanationAr}</p>
                    <p><strong className="text-neutral-800 dark:text-neutral-200">الأثر المحاسبي:</strong> {currentMappingTest.accountingImpactAr}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px]">
                نظام إدارة الخزينة المصرفية • متوافق مع لوائح البنك المركزي السعودي (SAMA / SARIE)
              </span>
              <button
                onClick={() => setShowIsoMappingModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 font-semibold hover:bg-neutral-900 dark:hover:bg-white transition-colors"
              >
                إغلاق الدليل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
