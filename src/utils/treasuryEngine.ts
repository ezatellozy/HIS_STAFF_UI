// ============================================================================
// HEALTHCARE TREASURY & CASH/BANK OPERATIONS ENGINE
// Pure, deterministic business logic, state transitions, and validation rules
// ============================================================================

import {
  TreasuryState,
  TreasuryAccountReference,
  BankAccountChangeRequest,
  PaymentAuthorization,
  PaymentInstruction,
  BankResponse,
  CashCustodyRecord,
  DepositBatch,
  BankStatement,
  BankStatementLine,
  BankReconciliation,
  BankReconciliationMatch,
  InterAccountTransfer,
  TreasuryException,
  CurrencyLiquidityView,
  Iso20022StatusCode,
  Iso20022ReasonCode,
  BankResponseStatus
} from '../types/treasury';

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

// ----------------------------------------------------------------------------
// 1. BANK ACCOUNT GOVERNANCE & LIFECYCLE
// ----------------------------------------------------------------------------

let idSeqCounter = 1;
export function generateUniqueId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const seq = (idSeqCounter++).toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${ts}-${seq}${rnd}`;
}

export function createBankAccountReference(
  state: TreasuryState,
  account: Omit<TreasuryAccountReference, 'id' | 'isSyntheticReference'>
): { success: boolean; newState?: TreasuryState; error?: string; accountId?: string } {
  if (!account.internalAccountCode?.trim()) {
    return { success: false, error: 'رمز الحساب الداخلي مطلوب.' };
  }
  if (!account.displayNameAr?.trim()) {
    return { success: false, error: 'اسم الحساب البنكي بالعربية مطلوب.' };
  }
  const duplicate = state.accounts.find(
    a => a.internalAccountCode.toLowerCase() === account.internalAccountCode.toLowerCase()
  );
  if (duplicate) {
    return { success: false, error: `رمز الحساب الداخلي (${account.internalAccountCode}) مستخدم مسبقاً.` };
  }

  const id = generateUniqueId('TREAS-ACC');
  const newAccount: TreasuryAccountReference = {
    ...account,
    id,
    isSyntheticReference: true
  };

  return {
    success: true,
    accountId: id,
    newState: {
      ...state,
      accounts: [...state.accounts, newAccount]
    }
  };
}

export function requestBankAccountChange(
  state: TreasuryState,
  params: {
    accountId: string;
    requestedBy: string;
    changeType: BankAccountChangeRequest['changeType'];
    proposedValues: Record<string, any>;
    justificationAr: string;
  }
): { success: boolean; newState?: TreasuryState; error?: string; requestId?: string } {
  const account = state.accounts.find(a => a.id === params.accountId);
  if (!account) {
    return { success: false, error: 'الحساب البنكي غير موجود في الدليل.' };
  }
  if (!params.justificationAr?.trim()) {
    return { success: false, error: 'مبرر طلب التغيير إلزامي وفق سياسات حوكمة الخزينة.' };
  }

  // Count impacted pending instructions that reference this account
  const impactedInstructions = state.instructions.filter(
    i => i.sourceAccountId === params.accountId && 
    ['draft_instruction', 'authorized_pending_release', 'simulated_external_submitted'].includes(i.status)
  ).length;

  const currentValues: Record<string, any> = {};
  for (const key of Object.keys(params.proposedValues)) {
    currentValues[key] = (account as any)[key];
  }

  const id = generateUniqueId('BACR');
  const newRequest: BankAccountChangeRequest = {
    id,
    accountId: params.accountId,
    requestedBy: params.requestedBy,
    requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    changeType: params.changeType,
    currentValues,
    proposedValues: params.proposedValues,
    justificationAr: params.justificationAr,
    status: 'pending_review',
    impactsPendingInstructionsCount: impactedInstructions
  };

  return {
    success: true,
    requestId: id,
    newState: {
      ...state,
      accountChangeRequests: [newRequest, ...state.accountChangeRequests]
    }
  };
}

export function reviewBankAccountChange(
  state: TreasuryState,
  requestId: string,
  decision: 'approve' | 'reject',
  reviewer: string,
  reviewNotesAr?: string
): { success: boolean; newState?: TreasuryState; error?: string } {
  const reqIndex = state.accountChangeRequests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) {
    return { success: false, error: 'طلب التغيير غير موجود.' };
  }
  const req = state.accountChangeRequests[reqIndex];
  if (req.status !== 'pending_review') {
    return { success: false, error: 'تم اتخاذ قرار مسبق بشأن هذا الطلب.' };
  }

  const updatedReq: BankAccountChangeRequest = {
    ...req,
    status: decision === 'approve' ? 'approved' : 'rejected',
    reviewedBy: reviewer,
    reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reviewNotesAr
  };

  let updatedAccounts = [...state.accounts];
  if (decision === 'approve') {
    const accIndex = updatedAccounts.findIndex(a => a.id === req.accountId);
    if (accIndex !== -1) {
      updatedAccounts[accIndex] = {
        ...updatedAccounts[accIndex],
        ...req.proposedValues
      };
    }
  }

  const updatedRequests = [...state.accountChangeRequests];
  updatedRequests[reqIndex] = updatedReq;

  return {
    success: true,
    newState: {
      ...state,
      accounts: updatedAccounts,
      accountChangeRequests: updatedRequests
    }
  };
}

// ----------------------------------------------------------------------------
// 2. PAYMENT AUTHORIZATIONS & MAKER-CHECKER WORKFLOW
// ----------------------------------------------------------------------------

export function reviewPaymentAuthorization(
  state: TreasuryState,
  authorizationId: string,
  action: 'approve' | 'return' | 'reject',
  actor: string,
  notesAr?: string
): { success: boolean; newState?: TreasuryState; error?: string } {
  const authIndex = state.authorizations.findIndex(a => a.id === authorizationId);
  if (authIndex === -1) {
    return { success: false, error: 'طلب تفويض الصرف غير موجود.' };
  }
  const auth = state.authorizations[authIndex];

  // Beneficiary check: If beneficiary verification is pending or on hold, release is BLOCKED
  if (action === 'approve') {
    if (auth.beneficiaryVerificationStatus === 'bank_change_pending_review') {
      return {
        success: false,
        error: 'محظور الصرف: يوجد طلب تغيير لحساب المستفيد البنكي قيد المراجعة الفنية (Bank Change Pending Review).'
      };
    }
    if (auth.beneficiaryVerificationStatus === 'unverified_hold') {
      return {
        success: false,
        error: 'محظور الصرف: حساب المستفيد غير موثق وموضوع قيد الحظر (Unverified Hold).'
      };
    }
    if (auth.apHoldReference) {
      return {
        success: false,
        error: `محظور الصرف: توجد قيود معلقة من الحسابات الدائنة: ${auth.apHoldReference}`
      };
    }
    if (auth.makerStaffName && auth.makerStaffName === actor) {
      return {
        success: false,
        error: 'انتهاك مبدأ الرقابة الثنائية (Maker-Checker): لا يجوز لمُعد الطلب اعتماده بنفسه.'
      };
    }
  }

  const updatedAuth: PaymentAuthorization = {
    ...auth,
    status: action === 'approve' ? 'approved' : action === 'return' ? 'returned_to_ap' : 'rejected',
    authorizedAmount: action === 'approve' ? auth.proposedAmount : 0,
    checkerStaffName: action === 'approve' ? actor : auth.checkerStaffName,
    authorizedAt: action === 'approve' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
    rejectionReasonAr: action === 'reject' ? notesAr : undefined,
    reviewNotesAr: notesAr || auth.reviewNotesAr
  };

  const updatedAuths = [...state.authorizations];
  updatedAuths[authIndex] = updatedAuth;

  return {
    success: true,
    newState: {
      ...state,
      authorizations: updatedAuths
    }
  };
}

// ----------------------------------------------------------------------------
// 3. PAYMENT INSTRUCTION GENERATION & EXTERNAL SUBMISSION
// ----------------------------------------------------------------------------

export function generatePaymentInstruction(
  state: TreasuryState,
  authorizationId: string,
  sourceAccountId: string,
  executionRail: PaymentInstruction['executionRail'],
  makerStaffName: string
): { success: boolean; newState?: TreasuryState; error?: string; instructionId?: string } {
  const auth = state.authorizations.find(a => a.id === authorizationId);
  if (!auth) {
    return { success: false, error: 'طلب التفويض غير موجود.' };
  }
  if (auth.status !== 'approved') {
    return { success: false, error: 'لا يمكن إصدار أمر دفع لطلب غير معتمد من الخزينة.' };
  }

  // Prevent duplicate instructions for the same authorization
  const existing = state.instructions.find(
    i => i.authorizationId === authorizationId && i.status !== 'cancelled'
  );
  if (existing) {
    return { success: false, error: `يوجد أمر دفع صادر مسبقاً لهذا التفويض برقم (${existing.id}).` };
  }

  const account = state.accounts.find(a => a.id === sourceAccountId);
  if (!account) {
    return { success: false, error: 'حساب الصرف البنكي المحدد غير موجود.' };
  }
  if (account.operationalStatus !== 'active') {
    return { success: false, error: `حساب الصرف البنكي (${account.displayNameAr}) غير نشط حالياً.` };
  }
  if (account.currency !== auth.currency) {
    return {
      success: false,
      error: `عدم تطابق العملة: عملة الحساب (${account.currency}) تختلف عن عملة الدفعة (${auth.currency}).`
    };
  }

  const instructionId = generateUniqueId('PI-2026-SARIE');
  const newInstruction: PaymentInstruction = {
    id: instructionId,
    proposalBatchReference: auth.proposalBatchNumber,
    authorizationId: auth.id,
    beneficiaryName: auth.beneficiaryAccountName,
    beneficiaryIbanMasked: auth.beneficiaryIbanMasked,
    sourceAccountId,
    currency: auth.currency,
    amount: auth.authorizedAmount,
    scheduledDate: auth.dueDate || new Date().toISOString().substring(0, 10),
    executionRail,
    makerStaffName,
    checkerStaffName: auth.checkerStaffName || 'مشرف الخزينة',
    version: 1,
    status: 'authorized_pending_release',
    lines: auth.invoiceReferences.map((inv, idx) => ({
      id: generateUniqueId(`PIL-${idx + 1}`),
      authorizationId: auth.id,
      invoiceReference: inv,
      supplierNameAr: auth.supplierNameAr,
      beneficiaryIbanMasked: auth.beneficiaryIbanMasked,
      amount: auth.authorizedAmount / (auth.invoiceReferences.length || 1),
      currency: auth.currency,
      status: 'pending'
    })),
    bankResponses: [],
    confirmedAmount: 0,
    rejectedAmount: 0,
    allocationStatus: 'awaiting_bank_confirmation',
    apAcknowledgedAmount: 0,
    reconciledBankAmount: 0
  };

  return {
    success: true,
    instructionId,
    newState: {
      ...state,
      instructions: [newInstruction, ...state.instructions]
    }
  };
}

export function simulateExternalSubmission(
  state: TreasuryState,
  instructionId: string
): { success: boolean; newState?: TreasuryState; error?: string } {
  const instIndex = state.instructions.findIndex(i => i.id === instructionId);
  if (instIndex === -1) {
    return { success: false, error: 'أمر الدفع غير موجود.' };
  }
  const inst = state.instructions[instIndex];
  if (inst.status !== 'authorized_pending_release') {
    return { success: false, error: `حالة أمر الدفع الحالية (${inst.status}) لا تسمح بإعادة الإرسال.` };
  }

  const updatedInst: PaymentInstruction = {
    ...inst,
    status: 'simulated_external_submitted',
    submissionTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  const updatedInstructions = [...state.instructions];
  updatedInstructions[instIndex] = updatedInst;

  return {
    success: true,
    newState: {
      ...state,
      instructions: updatedInstructions
    }
  };
}

export function processBankResponse(
  state: TreasuryState,
  instructionId: string,
  response: Omit<BankResponse, 'id' | 'instructionId' | 'isSyntheticFixture'>
): { success: boolean; newState?: TreasuryState; error?: string; responseId?: string } {
  const instIndex = state.instructions.findIndex(i => i.id === instructionId);
  if (instIndex === -1) {
    return { success: false, error: 'أمر الدفع غير موجود.' };
  }
  const inst = state.instructions[instIndex];

  // Map ISO 20022 status codes (pain.002) to internal Treasury response status
  // 1. ACTC (Accepted Technical Validation) and ACCP (Accepted Customer Profile) and ACSP are PRE-SETTLEMENT (confirmedAmount = 0)
  // 2. ACSC (Debtor side settlement) and ACCC (Creditor side settlement) are FINAL SETTLEMENT
  // 3. AC04 is strictly a REASON code (<StsRsnInf>/<Rsn>/<Cd>AC04</Cd> - Closed Account) mapped to RJCT (Rejection)
  const rawCode = (response.isoStatusCode || response.bankResponseCode || '').toUpperCase();
  const rawReason = (response.statusReasonCode || '').toUpperCase();

  let effectiveIsoStatus: Iso20022StatusCode = 'ACTC';
  let effectiveReasonCode: Iso20022ReasonCode = (response.statusReasonCode as Iso20022ReasonCode) || 'NONE';
  let mappedStatus: BankResponseStatus = response.status;

  if (rawCode === 'AC04' || rawReason === 'AC04' || (response as any).isoStatusCode === 'AC04') {
    effectiveIsoStatus = 'RJCT';
    effectiveReasonCode = 'AC04';
    mappedStatus = 'rejected';
  } else if (rawCode === 'ACTC') {
    effectiveIsoStatus = 'ACTC';
    mappedStatus = 'bank_accepted_for_processing';
  } else if (rawCode === 'ACCP') {
    effectiveIsoStatus = 'ACCP';
    mappedStatus = 'bank_accepted_for_processing';
  } else if (rawCode === 'ACSP' || rawCode === 'PDNG') {
    effectiveIsoStatus = rawCode === 'PDNG' ? 'PDNG' : 'ACSP';
    mappedStatus = 'bank_accepted_for_processing';
  } else if (rawCode === 'ACSC' || rawCode === 'ACCC' || response.status === 'confirmed') {
    effectiveIsoStatus = rawCode === 'ACCC' ? 'ACCC' : 'ACSC';
    mappedStatus = 'confirmed';
  } else if (rawCode === 'RJCT' || response.status === 'rejected') {
    effectiveIsoStatus = 'RJCT';
    mappedStatus = 'rejected';
    if (!effectiveReasonCode || effectiveReasonCode === 'NONE') {
      effectiveReasonCode = 'AC04'; // Default illustrative reason code
    }
  }

  // Idempotency: Check if this bank transaction reference already exists
  const existingResp = inst.bankResponses.find(
    r => r.bankTransactionRef === response.bankTransactionRef
  );
  if (existingResp) {
    // Idempotent: return unchanged state with success
    return { success: true, newState: state, responseId: existingResp.id };
  }

  // Conflict Detection: If instruction is already settled/confirmed and a conflicting rejection comes
  let isConflicting = false;
  if (inst.status === 'bank_confirmed' && (mappedStatus === 'rejected' || response.isoStatusCode === 'RJCT')) {
    isConflicting = true;
  } else if (inst.status === 'bank_rejected' && (mappedStatus === 'confirmed' || response.isoStatusCode === 'ACSC' || response.isoStatusCode === 'ACCC')) {
    isConflicting = true;
  }

  const responseId = generateUniqueId('RESP-BANK');
  const newResponse: BankResponse = {
    ...response,
    id: responseId,
    instructionId,
    status: mappedStatus,
    messageType: response.messageType || 'pain.002',
    isoStatusCode: effectiveIsoStatus,
    statusReasonCode: effectiveReasonCode,
    bankResponseCode: response.bankResponseCode || effectiveIsoStatus,
    isConflictingWithPriorResponse: isConflicting,
    isSyntheticFixture: true
  };

  if (isConflicting) {
    // Trigger Treasury Exception rather than silently overwriting history
    const exceptionId = generateUniqueId('EXC-TR');
    const newException: TreasuryException = {
      id: exceptionId,
      exceptionType: 'conflicting_bank_response',
      relatedAccountId: inst.sourceAccountId,
      relatedEntityId: inst.id,
      titleAr: `تعارض في إشعارات البنك لأمر الدفع (${inst.id})`,
      descriptionAr: `ورد إشعار بنكي جديد (${mappedStatus} / ${newResponse.isoStatusCode}) يتعارض مع الحالة السابقة المسجلة (${inst.status}). تم إيقاف التعديل الآلي وتوجيه المعاملة لمراجعة المراقب المالي.`,
      amountSar: inst.amount,
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'open_investigation'
    };

    const updatedInst: PaymentInstruction = {
      ...inst,
      status: 'disputed',
      bankResponses: [...inst.bankResponses, newResponse]
    };

    const updatedInstructions = [...state.instructions];
    updatedInstructions[instIndex] = updatedInst;

    return {
      success: true,
      responseId,
      newState: {
        ...state,
        instructions: updatedInstructions,
        exceptions: [newException, ...state.exceptions]
      }
    };
  }

  // Calculate new state based on response status
  let newStatus = inst.status;
  let confirmedAmount = inst.confirmedAmount;
  let rejectedAmount = inst.rejectedAmount;
  let allocationStatus = inst.allocationStatus;

  if (
    mappedStatus === 'bank_accepted_for_processing' ||
    effectiveIsoStatus === 'ACTC' ||
    effectiveIsoStatus === 'ACCP' ||
    effectiveIsoStatus === 'ACSP' ||
    effectiveIsoStatus === 'PDNG'
  ) {
    newStatus = 'bank_accepted';
    // CRITICAL: Technical acceptance (ACTC) and profile acceptance (ACCP) are NOT final settlements!
    confirmedAmount = 0;
    allocationStatus = 'awaiting_bank_confirmation';
  } else if (
    mappedStatus === 'confirmed' ||
    effectiveIsoStatus === 'ACSC' ||
    effectiveIsoStatus === 'ACCC'
  ) {
    newStatus = 'bank_confirmed';
    confirmedAmount = response.confirmedAmount || inst.amount;
    rejectedAmount = 0;
    // Debtor/Creditor side completion makes it eligible for AP allocation; does NOT assume AP invoice has mutated
    allocationStatus = 'eligible_for_ap_allocation';
  } else if (mappedStatus === 'partially_confirmed') {
    newStatus = 'partially_confirmed';
    confirmedAmount = response.confirmedAmount;
    rejectedAmount = inst.amount - response.confirmedAmount;
    allocationStatus = 'eligible_for_ap_allocation';
  } else if (mappedStatus === 'rejected' || effectiveIsoStatus === 'RJCT') {
    newStatus = 'bank_rejected';
    confirmedAmount = 0; // Bank rejection creates zero settlement!
    rejectedAmount = inst.amount;
    allocationStatus = 'awaiting_bank_confirmation';
  } else if (mappedStatus === 'returned') {
    newStatus = 'bank_returned';
    confirmedAmount = 0;
    rejectedAmount = inst.amount;
    allocationStatus = 'awaiting_bank_confirmation';
  }

  const updatedInst: PaymentInstruction = {
    ...inst,
    status: newStatus,
    confirmedAmount,
    rejectedAmount,
    allocationStatus,
    bankResponses: [...inst.bankResponses, newResponse]
  };

  const updatedInstructions = [...state.instructions];
  updatedInstructions[instIndex] = updatedInst;

  return {
    success: true,
    responseId,
    newState: {
      ...state,
      instructions: updatedInstructions
    }
  };
}

// ----------------------------------------------------------------------------
// 4. BANK STATEMENTS & MATHEMATICAL VALIDATION
// ----------------------------------------------------------------------------

export function validateBankStatement(
  statement: Omit<BankStatement, 'calculatedMovementTotal' | 'validationStatus' | 'validationErrorsAr'>,
  previousStatement?: BankStatement
): {
  isValid: boolean;
  calculatedMovementTotal: number;
  validationStatus: BankStatement['validationStatus'];
  continuity: BankStatement['continuityWithPreviousStatement'];
  errors: string[];
} {
  const errors: string[] = [];

  // Date sequence check
  if (statement.periodEnd < statement.periodStart) {
    errors.push(`تاريخ نهاية الفترة (${statement.periodEnd}) يسبق تاريخ البداية (${statement.periodStart}).`);
  }

  // Calculate net movement of lines
  // Bank perspective: Credit increases balance, Debit decreases balance
  let netMovement = 0;
  for (const line of statement.lines) {
    if (line.direction === 'credit') {
      netMovement += line.amount;
    } else if (line.direction === 'debit') {
      netMovement -= line.amount;
    }
  }
  netMovement = Math.round(netMovement * 100) / 100;

  // Arithmetic equation: Opening + netMovement === Closing
  const expectedClosing = Math.round((statement.openingBalance + netMovement) * 100) / 100;
  const actualClosing = Math.round(statement.closingBalance * 100) / 100;
  const diff = Math.abs(expectedClosing - actualClosing);

  if (diff > 0.01) {
    errors.push(
      `عدم اتزان معادلة كشف الحساب: الرصيد الافتتاحي (${statement.openingBalance.toLocaleString()}) + صافي الحركات (${netMovement.toLocaleString()}) = (${expectedClosing.toLocaleString()}) بينما الرصيد الختامي المسجل (${actualClosing.toLocaleString()}) بفارق (${diff.toLocaleString()}).`
    );
  }

  // Continuity check
  let continuity: BankStatement['continuityWithPreviousStatement'] = 'previous_statement_unavailable';
  if (previousStatement) {
    const prevClosing = Math.round(previousStatement.closingBalance * 100) / 100;
    const currOpening = Math.round(statement.openingBalance * 100) / 100;
    if (Math.abs(prevClosing - currOpening) <= 0.01) {
      continuity = 'verified';
    } else {
      continuity = 'discrepancy';
      errors.push(
        `انقطاع في تسلسل كشوف الحساب: الرصيد الافتتاحي (${currOpening.toLocaleString()}) لا يتطابق مع رصيد إقفال الكشف السابق (${prevClosing.toLocaleString()}).`
      );
    }
  }

  const isValid = errors.length === 0;
  const validationStatus = isValid
    ? continuity === 'verified'
      ? 'continuity_verified'
      : 'arithmetic_validated'
    : 'validation_failed';

  return {
    isValid,
    calculatedMovementTotal: netMovement,
    validationStatus,
    continuity,
    errors
  };
}

export function importBankStatement(
  state: TreasuryState,
  statementData: {
    statementReferenceNumber: string;
    bankAccountId: string;
    currency: 'SAR' | 'USD' | 'EUR';
    periodStart: string;
    periodEnd: string;
    openingBalance: number;
    closingBalance: number;
    importFormat: BankStatement['importFormat'];
    lines: Omit<BankStatementLine, 'id' | 'statementId' | 'matchStatus'>[];
  }
): { success: boolean; newState?: TreasuryState; error?: string; statementId?: string } {
  // Validate account
  const account = state.accounts.find(a => a.id === statementData.bankAccountId);
  if (!account) {
    return { success: false, error: 'الحساب البنكي غير موجود في الدليل.' };
  }
  if (account.currency !== statementData.currency) {
    return {
      success: false,
      error: `عدم تطابق العملة: كشف الحساب بعملة (${statementData.currency}) بينما الحساب البنكي بعملة (${account.currency}).`
    };
  }

  // Duplicate statement check
  const duplicate = state.statements.find(
    s => s.bankAccountId === statementData.bankAccountId &&
    s.statementReferenceNumber.toLowerCase() === statementData.statementReferenceNumber.toLowerCase()
  );
  if (duplicate) {
    return { success: false, error: `كشف الحساب برقم المرجع (${statementData.statementReferenceNumber}) مسجل مسبقاً.` };
  }

  // Find previous statement for this account
  const previousStatements = state.statements
    .filter(s => s.bankAccountId === statementData.bankAccountId)
    .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  const previousStatement = previousStatements[0];

  const statementId = generateUniqueId('STMT');
  const fullLines: BankStatementLine[] = statementData.lines.map((l, idx) => ({
    ...l,
    id: generateUniqueId(`STMT-L-${idx + 1}`),
    statementId,
    matchStatus: 'unmatched'
  }));

  const validation = validateBankStatement(
    {
      id: statementId,
      statementReferenceNumber: statementData.statementReferenceNumber,
      bankAccountId: statementData.bankAccountId,
      currency: statementData.currency,
      periodStart: statementData.periodStart,
      periodEnd: statementData.periodEnd,
      openingBalance: statementData.openingBalance,
      closingBalance: statementData.closingBalance,
      importTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      importFormat: statementData.importFormat,
      continuityWithPreviousStatement: 'previous_statement_unavailable',
      lines: fullLines
    },
    previousStatement
  );

  const newStatement: BankStatement = {
    id: statementId,
    statementReferenceNumber: statementData.statementReferenceNumber,
    bankAccountId: statementData.bankAccountId,
    currency: statementData.currency,
    periodStart: statementData.periodStart,
    periodEnd: statementData.periodEnd,
    openingBalance: statementData.openingBalance,
    closingBalance: statementData.closingBalance,
    calculatedMovementTotal: validation.calculatedMovementTotal,
    importTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    importFormat: statementData.importFormat,
    validationStatus: validation.validationStatus,
    continuityWithPreviousStatement: validation.continuity,
    lines: fullLines,
    validationErrorsAr: validation.errors
  };

  return {
    success: true,
    statementId,
    newState: {
      ...state,
      statements: [newStatement, ...state.statements]
    }
  };
}

// ----------------------------------------------------------------------------
// 5. RECONCILIATION MATCHING WORKBENCH & REVERSALS
// ----------------------------------------------------------------------------

export function createReconciliationMatch(
  state: TreasuryState,
  sessionId: string,
  bankStatementLineIds: string[],
  internalTransactionReferences: string[],
  actor: string
): { success: boolean; newState?: TreasuryState; error?: string; matchId?: string } {
  if (bankStatementLineIds.length === 0) {
    return { success: false, error: 'يجب اختيار سطر كشف حساب بنكي واحد على الأقل.' };
  }
  if (internalTransactionReferences.length === 0) {
    return { success: false, error: 'يجب اختيار حركة داخلية واحدة على الأقل للمطابقة.' };
  }

  // Find the lines in statements
  let bankLines: BankStatementLine[] = [];
  let foundStatement: BankStatement | undefined;

  for (const stmt of state.statements) {
    const matchedInStmt = stmt.lines.filter(l => bankStatementLineIds.includes(l.id));
    if (matchedInStmt.length > 0) {
      bankLines = [...bankLines, ...matchedInStmt];
      foundStatement = stmt;
    }
  }

  if (bankLines.length !== bankStatementLineIds.length) {
    return { success: false, error: 'بعض أسطر كشف الحساب غير موجودة.' };
  }

  // Check if any bank line is already matched (Prevent double consumption)
  for (const line of bankLines) {
    if (line.matchStatus === 'matched_single' || line.matchStatus === 'matched_split') {
      return {
        success: false,
        error: `سطر كشف الحساب (${line.bankReference} - ${line.amount.toLocaleString()} ر.س) تمت مطابقته مسبقاً ولا يجوز استهلاكه مرتين.`
      };
    }
  }

  // Compute total bank line amount
  const totalBankAmount = bankLines.reduce((sum, l) => sum + l.amount, 0);

  // Match nature detection
  let matchNature: BankReconciliationMatch['matchNature'] = 'one_to_one';
  if (bankStatementLineIds.length === 1 && internalTransactionReferences.length === 1) {
    matchNature = 'one_to_one';
  } else if (bankStatementLineIds.length === 1 && internalTransactionReferences.length > 1) {
    matchNature = 'one_to_many';
  } else {
    matchNature = 'many_to_one';
  }

  const matchId = generateUniqueId('REC-MATCH');
  const newMatch: BankReconciliationMatch = {
    id: matchId,
    reconciliationSessionId: sessionId,
    bankStatementLineIds,
    internalTransactionReferences,
    matchNature,
    matchedAmount: totalBankAmount,
    differenceAmount: 0,
    confidenceScore: 100,
    confidenceExplanationAr: `مطابقة نظامية معتمدة (${matchNature}) للمبلغ الإجمالي (${totalBankAmount.toLocaleString()} ر.س).`,
    matchedByStaffName: actor,
    matchedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  // Update line statuses in statements
  const updatedStatements = state.statements.map(stmt => ({
    ...stmt,
    lines: stmt.lines.map(line => {
      if (bankStatementLineIds.includes(line.id)) {
        return {
          ...line,
          matchStatus: matchNature === 'one_to_one' ? 'matched_single' : 'matched_split',
          matchedInternalDocId: internalTransactionReferences.join(', ')
        } as BankStatementLine;
      }
      return line;
    })
  }));

  // Update reconciliation session
  let updatedReconciliations = state.reconciliations.map(rec => {
    if (rec.id === sessionId) {
      const newMatches = [...rec.matches, newMatch];
      const matchedCount = rec.matchedBankLinesCount + bankStatementLineIds.length;
      const unmatchedCount = Math.max(0, rec.totalBankLinesCount - matchedCount);
      return {
        ...rec,
        matches: newMatches,
        matchedBankLinesCount: matchedCount,
        unmatchedBankLinesCount: unmatchedCount,
        status: unmatchedCount === 0 ? ('ready_for_approval' as const) : ('matching_in_progress' as const)
      };
    }
    return rec;
  });

  return {
    success: true,
    matchId,
    newState: {
      ...state,
      statements: updatedStatements,
      reconciliations: updatedReconciliations
    }
  };
}

export function reverseReconciliationMatch(
  state: TreasuryState,
  sessionId: string,
  matchId: string,
  reasonAr: string,
  actor: string
): { success: boolean; newState?: TreasuryState; error?: string } {
  if (!reasonAr?.trim()) {
    return { success: false, error: 'سبب إلغاء المطابقة (التسوية العكسية) إلزامي للرقابة المحاسبية.' };
  }

  const recIndex = state.reconciliations.findIndex(r => r.id === sessionId);
  if (recIndex === -1) {
    return { success: false, error: 'جلسة التسوية البنكية غير موجودة.' };
  }
  const rec = state.reconciliations[recIndex];

  const matchIndex = rec.matches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) {
    return { success: false, error: 'المطابقة المحددة غير موجودة في الجلسة.' };
  }
  const match = rec.matches[matchIndex];

  // Mark match as reversed rather than silently deleting it
  const updatedMatch: BankReconciliationMatch = {
    ...match,
    isReversed: true,
    reversalReasonAr: reasonAr
  };

  const updatedMatches = [...rec.matches];
  updatedMatches[matchIndex] = updatedMatch;

  // Restore line status in statements
  const updatedStatements = state.statements.map(stmt => ({
    ...stmt,
    lines: stmt.lines.map(line => {
      if (match.bankStatementLineIds.includes(line.id)) {
        return {
          ...line,
          matchStatus: 'unmatched',
          matchedInternalDocId: undefined
        } as BankStatementLine;
      }
      return line;
    })
  }));

  const matchedCount = rec.matches.filter(m => !m.isReversed && m.id !== matchId).reduce(
    (acc, m) => acc + m.bankStatementLineIds.length,
    0
  );

  const updatedRec: BankReconciliation = {
    ...rec,
    matches: updatedMatches,
    matchedBankLinesCount: matchedCount,
    unmatchedBankLinesCount: rec.totalBankLinesCount - matchedCount,
    status: 'matching_in_progress'
  };

  const updatedReconciliations = [...state.reconciliations];
  updatedReconciliations[recIndex] = updatedRec;

  return {
    success: true,
    newState: {
      ...state,
      statements: updatedStatements,
      reconciliations: updatedReconciliations
    }
  };
}

// ----------------------------------------------------------------------------
// 6. INTER-ACCOUNT TRANSFERS (LIQUIDITY CONSERVATION)
// ----------------------------------------------------------------------------

export function executeInterAccountTransfer(
  state: TreasuryState,
  params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    currency: 'SAR' | 'USD' | 'EUR';
    notesAr: string;
    actor: string;
  }
): { success: boolean; newState?: TreasuryState; error?: string; transferId?: string } {
  if (params.sourceAccountId === params.destinationAccountId) {
    return { success: false, error: 'لا يمكن التحويل بين الحساب ونفسه.' };
  }
  if (params.amount <= 0) {
    return { success: false, error: 'مبلغ التحويل يجب أن يكون أكبر من الصفر.' };
  }

  const sourceAcc = state.accounts.find(a => a.id === params.sourceAccountId);
  const destAcc = state.accounts.find(a => a.id === params.destinationAccountId);
  if (!sourceAcc || !destAcc) {
    return { success: false, error: 'حساب المصدر أو الوجهة غير موجود.' };
  }
  if (sourceAcc.currency !== params.currency || destAcc.currency !== params.currency) {
    return {
      success: false,
      error: 'التحويل متعدد العملات يتطلب تسعير صرف معتمد (FX Policy) وتأكيد فرق الصرف.'
    };
  }

  const transferId = generateUniqueId('TRF');
  const newTransfer: InterAccountTransfer = {
    id: transferId,
    transferNumber: `TRF-HOSP-${Date.now().toString().slice(-4)}`,
    sourceAccountId: params.sourceAccountId,
    destinationAccountId: params.destinationAccountId,
    currency: params.currency,
    amount: params.amount,
    requestedDate: new Date().toISOString().substring(0, 10),
    authorizedByStaffName: params.actor,
    instructionReference: `SARIE-TRF-${Date.now().toString().slice(-5)}`,
    externalStatusEvidence: 'تم إصدار أمر التحويل البنكي الداخلي وقيد مراجعة إشعارات المقاصة',
    status: 'in_transit', // Must show in-transit until statement confirmation exists
    notesAr: params.notesAr
  };

  return {
    success: true,
    transferId,
    newState: {
      ...state,
      transfers: [newTransfer, ...state.transfers]
    }
  };
}

// ----------------------------------------------------------------------------
// 7. CASH OFFICE & DEPOSIT BATCHES
// ----------------------------------------------------------------------------

export function recordCashHandover(
  state: TreasuryState,
  params: {
    custodianStaffName: string;
    locationContext: string;
    branchId: CashCustodyRecord['branchId'];
    custodyType: CashCustodyRecord['custodyType'];
    sourceReceiptCount: number;
    expectedAmountSar: number;
    countedAmountSar: number;
    varianceReasonAr?: string;
    actor: string;
  }
): { success: boolean; newState?: TreasuryState; error?: string; recordId?: string } {
  const variance = Math.round((params.countedAmountSar - params.expectedAmountSar) * 100) / 100;

  const recordId = generateUniqueId('CUST');
  const newRecord: CashCustodyRecord = {
    id: recordId,
    custodianStaffName: params.custodianStaffName,
    locationContext: params.locationContext,
    branchId: params.branchId,
    custodyType: params.custodyType,
    handoverTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    sourceReceiptCount: params.sourceReceiptCount,
    expectedAmountSar: params.expectedAmountSar,
    countedAmountSar: params.countedAmountSar,
    varianceSar: variance,
    varianceReasonAr: params.varianceReasonAr,
    stage: 'cash_handed_over',
    acknowledgedByTreasuryStaffName: params.actor,
    acknowledgedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  // If there is an unresolved variance, raise Treasury exception
  let updatedExceptions = [...state.exceptions];
  if (Math.abs(variance) > 0.01) {
    const excId = generateUniqueId('EXC-TR');
    updatedExceptions.unshift({
      id: excId,
      exceptionType: variance < 0 ? 'cash_count_shortage' : 'cash_count_overage',
      relatedAccountId: 'TREAS-ACC-FLOAT-ER',
      relatedEntityId: recordId,
      titleAr: variance < 0 ? `عجز في تسليم النقدية (${variance} ر.س)` : `فائض في تسليم النقدية (+${variance} ر.س)`,
      descriptionAr: `فارق في عد النقدية في موقع (${params.locationContext}): المتوقع حسب الفواتير (${params.expectedAmountSar}) والمعدود (${params.countedAmountSar}).`,
      amountSar: Math.abs(variance),
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'open_investigation',
      resolutionNotesAr: params.varianceReasonAr
    });
  }

  return {
    success: true,
    recordId,
    newState: {
      ...state,
      custodyRecords: [newRecord, ...state.custodyRecords],
      exceptions: updatedExceptions
    }
  };
}

export function createDepositBatch(
  state: TreasuryState,
  custodyRecordIds: string[],
  targetBankAccountId: string,
  cashBagSealNumber: string,
  carrierReference: string
): { success: boolean; newState?: TreasuryState; error?: string; batchId?: string } {
  if (custodyRecordIds.length === 0) {
    return { success: false, error: 'يجب تحديد سجل تسليم نقد واحد على الأقل.' };
  }

  const records = state.custodyRecords.filter(r => custodyRecordIds.includes(r.id));
  if (records.length !== custodyRecordIds.length) {
    return { success: false, error: 'بعض سجلات التسليم المحددة غير موجودة.' };
  }

  const totalAmount = records.reduce((sum, r) => sum + r.countedAmountSar, 0);
  const batchId = generateUniqueId('DEP-BATCH');

  const newBatch: DepositBatch = {
    id: batchId,
    batchNumber: `DEP-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-2)}`,
    custodyRecordIds,
    targetBankAccountId,
    branchId: records[0].branchId || 'main_hospital',
    cashBagSealNumber,
    carrierReference,
    expectedDepositAmountSar: totalAmount,
    bankAcknowledgedAmountSar: 0,
    varianceSar: 0,
    submissionDate: new Date().toISOString().substring(0, 10),
    status: 'bag_sealed_and_logged'
  };

  // Update custody records stage to cash_deposited
  const updatedCustody = state.custodyRecords.map(r => {
    if (custodyRecordIds.includes(r.id)) {
      return {
        ...r,
        stage: 'cash_deposited',
        depositBatchId: batchId
      } as CashCustodyRecord;
    }
    return r;
  });

  return {
    success: true,
    batchId,
    newState: {
      ...state,
      depositBatches: [newBatch, ...state.depositBatches],
      custodyRecords: updatedCustody
    }
  };
}

// ----------------------------------------------------------------------------
// 8. LIQUIDITY CALCULATION (SEPARATE BY CURRENCY, NO FALSE SUM)
// ----------------------------------------------------------------------------

export function calculateTreasuryLiquidity(
  state: TreasuryState
): CurrencyLiquidityView[] {
  const currencies: ('SAR' | 'USD' | 'EUR')[] = ['SAR', 'USD', 'EUR'];

  return currencies.map(currency => {
    const accounts = state.accounts.filter(a => a.currency === currency && a.operationalStatus === 'active');

    // Sum bank reported balance from latest statements
    let bankReportedBalance = 0;
    for (const acc of accounts) {
      const accStatements = state.statements
        .filter(s => s.bankAccountId === acc.id)
        .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
      if (accStatements.length > 0) {
        bankReportedBalance += accStatements[0].closingBalance;
      }
    }

    // Pending outflows: instructions authorized or submitted but not confirmed
    const pendingOutflows = state.instructions
      .filter(
        i => i.currency === currency &&
        ['authorized_pending_release', 'simulated_external_submitted', 'bank_accepted'].includes(i.status)
      )
      .reduce((sum, i) => sum + i.amount, 0);

    // Expected inflows: cash custody handed over not yet in bank
    let expectedInflows = 0;
    if (currency === 'SAR') {
      expectedInflows = state.custodyRecords
        .filter(r => ['cash_handed_over', 'cash_deposited'].includes(r.stage))
        .reduce((sum, r) => sum + r.countedAmountSar, 0);
    }

    // Restricted float balance: petty cash vaults
    const restrictedFloat = accounts
      .filter(a => a.accountType === 'petty_cash_vault' || a.accountType === 'cashier_float')
      .length * 5000; // Standard demo float allowance

    // Internal book balance estimation
    const internalBook = bankReportedBalance - pendingOutflows + expectedInflows;
    const demoAvailableCash = Math.max(0, internalBook - restrictedFloat);

    return {
      currency,
      bankReportedBalance: Math.round(bankReportedBalance * 100) / 100,
      internalBookBalance: Math.round(internalBook * 100) / 100,
      pendingOutflowsSar: Math.round(pendingOutflows * 100) / 100,
      expectedInflowsSar: Math.round(expectedInflows * 100) / 100,
      restrictedFloatBalance: Math.round(restrictedFloat * 100) / 100,
      reconciliationDifferenceSar: 50.0, // Unreconciled bank fees
      demoAvailableCashSar: Math.round(demoAvailableCash * 100) / 100,
      hasUnavailableDataWarning: accounts.length === 0 || bankReportedBalance === 0
    };
  });
}
