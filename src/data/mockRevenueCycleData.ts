// ============================================================================
// HEALTHCARE REVENUE CYCLE & PATIENT AR MOCK FIXTURES & DATA SEED
// Linked to Edina Hospital Core Patients, Encounters, Tariffs & Payers
// ============================================================================

import {
  TariffReference,
  CoverageReference,
  ChargeEventReference,
  PatientInvoice,
  PayerClaim,
  ClaimDenial,
  PayerRemittance,
  CreditBalanceRecord,
  WriteOffAdjustment,
  RevenueCycleState
} from '../types/revenueCycle';

// ----------------------------------------------------------------------------
// 1. HOSPITAL TARIFF MASTER (SBS / CPT / ACHI CODING)
// ----------------------------------------------------------------------------

export const MOCK_TARIFFS: TariffReference[] = [
  {
    id: 'TRF-001',
    serviceCode: 'SBS-99213',
    serviceNameAr: 'كشف استشاري عيادات خارجية (OPD Specialist Consultation)',
    serviceNameEn: 'Outpatient Specialist Consultation',
    listPriceSar: 450,
    standardTariffSar: 450,
    contractedPayerPriceSar: 400,
    vatCategory: 'zero_rated', // Saudi citizen healthcare exemption
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-002',
    serviceCode: 'SBS-99214',
    serviceNameAr: 'استشارة طبية مطولة - باطنة وسكر (Extended Consultation)',
    serviceNameEn: 'Extended Internal Medicine Consultation',
    listPriceSar: 550,
    standardTariffSar: 550,
    contractedPayerPriceSar: 480,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-003',
    serviceCode: 'SBS-99284',
    serviceNameAr: 'خدمة طوارئ وحوادث متقدمة المستوى 4 (ER Level 4)',
    serviceNameEn: 'Emergency Department Care Level 4',
    listPriceSar: 800,
    standardTariffSar: 800,
    contractedPayerPriceSar: 720,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-004',
    serviceCode: 'SBS-85025',
    serviceNameAr: 'فحص صورة دم كاملة (Complete Blood Count - CBC)',
    serviceNameEn: 'Complete Blood Count (CBC)',
    listPriceSar: 120,
    standardTariffSar: 120,
    contractedPayerPriceSar: 95,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-005',
    serviceCode: 'SBS-80061',
    serviceNameAr: 'فحص دهون الدم الشامل (Lipid Panel Profile)',
    serviceNameEn: 'Lipid Panel Profile',
    listPriceSar: 220,
    standardTariffSar: 220,
    contractedPayerPriceSar: 180,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-006',
    serviceCode: 'SBS-83036',
    serviceNameAr: 'فحص السكر التراكمي في الدم (HbA1c Glycated Hemoglobin)',
    serviceNameEn: 'Hemoglobin A1c (HbA1c)',
    listPriceSar: 150,
    standardTariffSar: 150,
    contractedPayerPriceSar: 120,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-007',
    serviceCode: 'SBS-93306',
    serviceNameAr: 'موجات صوتية دوبلر على القلب (Transthoracic Echocardiogram)',
    serviceNameEn: 'Echocardiography with Doppler',
    listPriceSar: 1100,
    standardTariffSar: 1100,
    contractedPayerPriceSar: 950,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-008',
    serviceCode: 'SBS-71020',
    serviceNameAr: 'أشعة سينية رقمية على الصدر (Chest X-Ray 2 Views)',
    serviceNameEn: 'Chest X-Ray 2 Views',
    listPriceSar: 280,
    standardTariffSar: 280,
    contractedPayerPriceSar: 230,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-009',
    serviceCode: 'SBS-73721',
    serviceNameAr: 'رنين مغناطيسي لمفصل الركبة (MRI Knee without Contrast)',
    serviceNameEn: 'MRI Knee Joint',
    listPriceSar: 1850,
    standardTariffSar: 1850,
    contractedPayerPriceSar: 1600,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-010',
    serviceCode: 'SBS-BED-IPD',
    serviceNameAr: 'إقامة يومية بجناح التنويم الداخلي غرفة مفردة (IPD Daily Room Rate)',
    serviceNameEn: 'Inpatient Single Room Daily Accommodation',
    listPriceSar: 1200,
    standardTariffSar: 1200,
    contractedPayerPriceSar: 1050,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-011',
    serviceCode: 'SBS-44950',
    serviceNameAr: 'عملية استئصال الزائدة الدودية بالمنظار (Laparoscopic Appendectomy)',
    serviceNameEn: 'Laparoscopic Appendectomy',
    listPriceSar: 8500,
    standardTariffSar: 8500,
    contractedPayerPriceSar: 7400,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  },
  {
    id: 'TRF-012',
    serviceCode: 'SBS-97110',
    serviceNameAr: 'جلسة علاج طبيعي وتأهيل حركي (Physical Therapy Exercise Session)',
    serviceNameEn: 'Therapeutic Physical Exercises',
    listPriceSar: 250,
    standardTariffSar: 250,
    contractedPayerPriceSar: 200,
    vatCategory: 'zero_rated',
    vatRatePercent: 15,
    effectiveFrom: '2026-01-01'
  }
];

// ----------------------------------------------------------------------------
// 2. PATIENT COVERAGE & INSURANCE POLICIES
// ----------------------------------------------------------------------------

export const MOCK_COVERAGES: CoverageReference[] = [
  {
    id: 'COV-1001',
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    payerId: 'PAYER-BUPA-01',
    payerNameAr: 'شركة بوبا العربية للتأمين التعاوني (Bupa Arabia)',
    payerNameEn: 'Bupa Arabia Cooperative Insurance',
    policyNumber: 'BUP-EG-998231',
    memberId: 'MBR-010442',
    planClass: 'VIP',
    eligibilityStatus: 'active',
    coPayPercent: 10,
    coPayMaxCapSar: 100, // Maximum 100 SAR copay per outpatient encounter
    maxAnnualBenefitSar: 500000,
    remainingBenefitSar: 450000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isPriorAuthRequired: true,
    priorAuthReference: 'NPH-PA-2026-90412',
    priorAuthStatus: 'approved',
    priorAuthApprovedAmountSar: 1100,
    verificationTimestamp: '2026-09-22 08:30'
  },
  {
    id: 'COV-1002',
    patientId: 'pat-1002',
    patientMrn: 'MRN-2026-0820',
    payerId: 'PAYER-TAW-01',
    payerNameAr: 'شركة التعاونية للتأمين (Tawuniya)',
    payerNameEn: 'Tawuniya Cooperative Insurance',
    policyNumber: 'TAW-445892',
    memberId: 'MBR-010884',
    planClass: 'Class A',
    eligibilityStatus: 'active',
    coPayPercent: 20,
    coPayMaxCapSar: 150,
    maxAnnualBenefitSar: 250000,
    remainingBenefitSar: 185000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isPriorAuthRequired: true,
    priorAuthStatus: 'pending_submission',
    verificationTimestamp: '2026-09-22 09:15'
  },
  {
    id: 'COV-1003',
    patientId: 'pat-1003',
    patientMrn: 'MRN-2026-0835',
    payerId: 'PAYER-MEDNET-01',
    payerNameAr: 'شركة ميدنت هيلث كير (MedNet TPA)',
    payerNameEn: 'MedNet Health Care TPA',
    policyNumber: 'MDN-773120',
    memberId: 'MBR-010091',
    planClass: 'Class B',
    eligibilityStatus: 'active',
    coPayPercent: 25,
    coPayMaxCapSar: 200,
    maxAnnualBenefitSar: 150000,
    remainingBenefitSar: 98000,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isPriorAuthRequired: true,
    priorAuthStatus: 'approved',
    verificationTimestamp: '2026-09-21 11:20'
  },
  {
    id: 'COV-1005',
    patientId: 'pat-1005',
    patientMrn: 'MRN-2026-0850',
    payerId: 'PAYER-CASH-SELF',
    payerNameAr: 'سداد نقدي مباشر / دفع ذاتي (Self-Pay)',
    payerNameEn: 'Self-Pay Direct Cash',
    policyNumber: 'CASH-ONLY',
    memberId: 'N/A',
    planClass: 'Cash',
    eligibilityStatus: 'active',
    coPayPercent: 100,
    maxAnnualBenefitSar: 0,
    remainingBenefitSar: 0,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isPriorAuthRequired: false,
    priorAuthStatus: 'not_required',
    verificationTimestamp: '2026-09-22 10:00'
  }
];

// ----------------------------------------------------------------------------
// 3. CHARGE EVENT REFERENCES (CLINICAL SOURCE EVENTS)
// ----------------------------------------------------------------------------

export const MOCK_CHARGES: ChargeEventReference[] = [
  // 1. pat-1001 (Mahmoud Saad - Cardio Insured Bupa)
  {
    id: 'CHG-2026-001',
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    patientNameAr: 'محمود سعد الدين إبراهيم',
    encounterId: 'ENC-2026-0814-OPD',
    appointmentId: 'apt-202',
    sourceCategory: 'opd_consultation',
    sourceReferenceId: 'APT-REC-202',
    clinicalOrderId: 'ORD-CARDIO-CONSULT-01',
    performedServiceRef: 'SRV-PERF-CARDIO-01',
    serviceCode: 'SBS-99213',
    serviceNameAr: 'كشف استشاري عيادات خارجية - قلب وأوعية',
    serviceNameEn: 'Cardiology Specialist Consultation',
    departmentAr: 'عيادة أمراض القلب والأوعية (OPD)',
    quantity: 1,
    unit: 'زيارة',
    serviceTimestamp: '2026-09-22 09:10',
    performedStatus: 'performed',
    billabilityStatus: 'already_billed',
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    unitPriceSar: 450,
    grossAmountSar: 450,
    discountAmountSar: 50,
    netAmountSar: 400,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 400,
    consumedInInvoiceId: 'INV-2026-RC-001',
    isSyntheticFixture: true
  },
  {
    id: 'CHG-2026-002',
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    patientNameAr: 'محمود سعد الدين إبراهيم',
    encounterId: 'ENC-2026-0814-OPD',
    appointmentId: 'apt-202',
    sourceCategory: 'radiology',
    sourceReferenceId: 'RAD-STUDY-ECHO-881',
    clinicalOrderId: 'ORD-RAD-ECHO-01',
    performedServiceRef: 'SRV-PERF-ECHO-881',
    serviceCode: 'SBS-93306',
    serviceNameAr: 'موجات صوتية دوبلر على القلب (Echocardiogram)',
    serviceNameEn: 'Transthoracic Echocardiogram',
    departmentAr: 'قسم الأشعة والتصوير التشخيصي',
    quantity: 1,
    unit: 'فحص',
    serviceTimestamp: '2026-09-22 09:30',
    performedStatus: 'performed',
    billabilityStatus: 'already_billed',
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    unitPriceSar: 1100,
    grossAmountSar: 1100,
    discountAmountSar: 150,
    netAmountSar: 950,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 950,
    consumedInInvoiceId: 'INV-2026-RC-001',
    isSyntheticFixture: true
  },
  {
    id: 'CHG-2026-003',
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    patientNameAr: 'محمود سعد الدين إبراهيم',
    encounterId: 'ENC-2026-0814-OPD',
    appointmentId: 'apt-202',
    sourceCategory: 'laboratory',
    sourceReferenceId: 'LAB-SPEC-LIPID-441',
    clinicalOrderId: 'ORD-LAB-LIPID-01',
    performedServiceRef: 'SRV-PERF-LAB-441',
    serviceCode: 'SBS-80061',
    serviceNameAr: 'فحص دهون الدم الشامل (Lipid Panel Profile)',
    serviceNameEn: 'Lipid Panel Profile',
    departmentAr: 'مختبر الكيمياء الحيوية السريرية',
    quantity: 1,
    unit: 'تحليل',
    serviceTimestamp: '2026-09-22 09:45',
    performedStatus: 'performed',
    billabilityStatus: 'billable', // Ready to invoice!
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    unitPriceSar: 220,
    grossAmountSar: 220,
    discountAmountSar: 40,
    netAmountSar: 180,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 180,
    isSyntheticFixture: true
  },

  // 2. pat-1005 (Samiha Fathi - Cash Self-Pay)
  {
    id: 'CHG-2026-004',
    patientId: 'pat-1005',
    patientMrn: 'MRN-2026-0850',
    patientNameAr: 'سميحة فتحي عبد الجواد',
    encounterId: 'ENC-2026-0850-OPD',
    appointmentId: 'apt-204',
    sourceCategory: 'opd_consultation',
    sourceReferenceId: 'APT-REC-204',
    clinicalOrderId: 'ORD-ORTHO-CONSULT-01',
    performedServiceRef: 'SRV-PERF-ORTHO-01',
    serviceCode: 'SBS-99213',
    serviceNameAr: 'كشف استشاري عظام ومفاصل (نقدي خاص)',
    serviceNameEn: 'Orthopedic Specialist Consultation',
    departmentAr: 'عيادة جراحة العظام والمفاصل (OPD)',
    quantity: 1,
    unit: 'زيارة',
    serviceTimestamp: '2026-09-22 10:05',
    performedStatus: 'performed',
    billabilityStatus: 'already_billed',
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    unitPriceSar: 450,
    grossAmountSar: 450,
    discountAmountSar: 0,
    netAmountSar: 450,
    taxRatePercent: 0, // Citizen medical exemption
    taxAmountSar: 0,
    totalWithTaxSar: 450,
    consumedInInvoiceId: 'INV-2026-RC-002',
    isSyntheticFixture: true
  },
  {
    id: 'CHG-2026-005',
    patientId: 'pat-1005',
    patientMrn: 'MRN-2026-0850',
    patientNameAr: 'سميحة فتحي عبد الجواد',
    encounterId: 'ENC-2026-0850-OPD',
    appointmentId: 'apt-204',
    sourceCategory: 'radiology',
    sourceReferenceId: 'RAD-STUDY-MRI-990',
    clinicalOrderId: 'ORD-RAD-MRI-01',
    performedServiceRef: 'SRV-PERF-MRI-990',
    serviceCode: 'SBS-73721',
    serviceNameAr: 'رنين مغناطيسي لمفصل الركبة اليمنى بدون صبغة',
    serviceNameEn: 'MRI Knee Joint',
    departmentAr: 'قسم الأشعة والتصوير التشخيصي',
    quantity: 1,
    unit: 'فحص',
    serviceTimestamp: '2026-09-22 10:30',
    performedStatus: 'performed',
    billabilityStatus: 'billable', // Unbilled!
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    unitPriceSar: 1850,
    grossAmountSar: 1850,
    discountAmountSar: 0,
    netAmountSar: 1850,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 1850,
    isSyntheticFixture: true
  },

  // 3. pat-1002 (Nouran Hossam - Internal Med Tawuniya)
  {
    id: 'CHG-2026-006',
    patientId: 'pat-1002',
    patientMrn: 'MRN-2026-0820',
    patientNameAr: 'نوران حسام الشافعي',
    encounterId: 'ENC-2026-0820-OPD',
    appointmentId: 'apt-203',
    sourceCategory: 'opd_consultation',
    sourceReferenceId: 'APT-REC-203',
    clinicalOrderId: 'ORD-INT-CONSULT-01',
    performedServiceRef: 'SRV-PERF-INT-01',
    serviceCode: 'SBS-99214',
    serviceNameAr: 'استشارة طبية مطولة - باطنة وسكر',
    serviceNameEn: 'Internal Medicine Extended Consultation',
    departmentAr: 'عيادة الباطنة العامة والسكر (OPD)',
    quantity: 1,
    unit: 'زيارة',
    serviceTimestamp: '2026-09-22 09:35',
    performedStatus: 'performed',
    billabilityStatus: 'already_billed',
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    unitPriceSar: 550,
    grossAmountSar: 550,
    discountAmountSar: 70,
    netAmountSar: 480,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 480,
    consumedInInvoiceId: 'INV-2026-RC-003',
    isSyntheticFixture: true
  },
  {
    id: 'CHG-2026-007',
    patientId: 'pat-1002',
    patientMrn: 'MRN-2026-0820',
    patientNameAr: 'نوران حسام الشافعي',
    encounterId: 'ENC-2026-0820-OPD',
    appointmentId: 'apt-203',
    sourceCategory: 'laboratory',
    sourceReferenceId: 'LAB-SPEC-HBA1C-311',
    clinicalOrderId: 'ORD-LAB-HBA1C-01',
    performedServiceRef: 'SRV-PERF-HBA1C-311',
    serviceCode: 'SBS-83036',
    serviceNameAr: 'فحص السكر التراكمي في الدم (HbA1c)',
    serviceNameEn: 'Hemoglobin A1c (HbA1c)',
    departmentAr: 'مختبر الكيمياء الحيوية السريرية',
    quantity: 1,
    unit: 'تحليل',
    serviceTimestamp: '2026-09-22 09:50',
    performedStatus: 'performed',
    billabilityStatus: 'already_billed',
    pricingStatus: 'priced',
    billingReviewStatus: 'approved_for_billing',
    unitPriceSar: 150,
    grossAmountSar: 150,
    discountAmountSar: 30,
    netAmountSar: 120,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 120,
    consumedInInvoiceId: 'INV-2026-RC-003',
    isSyntheticFixture: true
  },

  // 4. Inpatient / Unperformed service test case (Order != Performed Service RC02)
  {
    id: 'CHG-2026-008',
    patientId: 'pat-1003',
    patientMrn: 'MRN-2026-0835',
    patientNameAr: 'عبد الرحمن علي الجابري',
    encounterId: 'ENC-2026-0835-IPD',
    sourceCategory: 'laboratory',
    sourceReferenceId: 'LAB-ORDER-PLANNED-889',
    clinicalOrderId: 'ORD-LAB-TROP-99',
    serviceCode: 'SBS-85025',
    serviceNameAr: 'فحص صورة دم كاملة (مجدول سريرياً - لم يُسحب)',
    serviceNameEn: 'CBC Routine Inpatient Panel (Planned)',
    departmentAr: 'أجنحة التنويم الداخلي (IPD)',
    quantity: 1,
    unit: 'فحص',
    serviceTimestamp: '2026-09-22 11:00',
    performedStatus: 'planned', // Planned, NOT performed!
    billabilityStatus: 'unreviewed',
    pricingStatus: 'priced',
    billingReviewStatus: 'pending_review',
    exceptionReason: 'طلب سريري مجدول لم ينفذ بعد (Order != Performed Service)',
    unitPriceSar: 120,
    grossAmountSar: 120,
    discountAmountSar: 25,
    netAmountSar: 95,
    taxRatePercent: 0,
    taxAmountSar: 0,
    totalWithTaxSar: 95,
    isSyntheticFixture: true
  }
];

// ----------------------------------------------------------------------------
// 4. ISSUED PATIENT INVOICES (SYNTHETIC ZATCA PROFILE)
// ----------------------------------------------------------------------------

export const MOCK_INVOICES: PatientInvoice[] = [
  // Invoice 1: pat-1001 (Bupa Insurance Outpatient Invoice)
  {
    id: 'INV-2026-RC-001',
    invoiceNumber: 'TINV-2026-00814',
    invoiceDate: '2026-09-22',
    issueTime: '09:40',
    invoiceType: 'tax_invoice',
    lifecycleStatus: 'partially_paid',
    recipientType: 'insurance_payer',
    recipientId: 'PAYER-BUPA-01',
    recipientNameAr: 'شركة بوبا العربية للتأمين التعاوني',
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    patientNameAr: 'محمود سعد الدين إبراهيم',
    patientNationalId: '27508120102914',
    isSaudiCitizen: true,
    encounterId: 'ENC-2026-0814-OPD',
    clinicOrDepartmentAr: 'عيادة أمراض القلب والأوعية (OPD)',
    lines: [
      {
        id: 'INV-LN-101',
        invoiceId: 'INV-2026-RC-001',
        chargeId: 'CHG-2026-001',
        serviceCode: 'SBS-99213',
        serviceNameAr: 'كشف استشاري عيادات خارجية - قلب وأوعية',
        serviceNameEn: 'Cardiology Specialist Consultation',
        quantity: 1,
        unitPriceSar: 450,
        grossAmountSar: 450,
        discountAmountSar: 50,
        netAmountSar: 400,
        vatCategory: 'zero_rated',
        vatRatePercent: 0,
        vatAmountSar: 0,
        lineTotalSar: 400,
        patientShareSar: 40, // 10% copay
        payerShareSar: 360
      },
      {
        id: 'INV-LN-102',
        invoiceId: 'INV-2026-RC-001',
        chargeId: 'CHG-2026-002',
        serviceCode: 'SBS-93306',
        serviceNameAr: 'موجات صوتية دوبلر على القلب (Echocardiogram)',
        serviceNameEn: 'Transthoracic Echocardiogram',
        quantity: 1,
        unitPriceSar: 1100,
        grossAmountSar: 1100,
        discountAmountSar: 150,
        netAmountSar: 950,
        vatCategory: 'zero_rated',
        vatRatePercent: 0,
        vatAmountSar: 0,
        lineTotalSar: 950,
        patientShareSar: 60, // capped by 100 SAR daily copay policy
        payerShareSar: 890
      }
    ],
    subtotalGrossSar: 1550,
    discountTotalSar: 200,
    subtotalNetSar: 1350,
    vatTotalSar: 0,
    grandTotalSar: 1350,
    patientResponsibilitySar: 100,
    payerResponsibilitySar: 1250,
    allocatedCashierReceiptSar: 45, // Existing receipt TXN-2026-0812
    allocatedPayerRemittanceSar: 0,
    allocatedCreditAdjustmentSar: 0,
    outstandingPatientBalanceSar: 55, // Still 55 SAR due from patient
    outstandingPayerBalanceSar: 1250, // Full claim pending
    totalOutstandingBalanceSar: 1305,
    isSyntheticFixture: true,
    zatcaComplianceNotice: 'معاينة تجريبية لدورة الإيرادات — لا تمثل فاتورة ضريبية رسمية مصدرة عبر بوابة زاتكا (ZATCA)',
    associatedClaimId: 'CLM-2026-NPH-001',
    notes: 'فاتورة خدمات استشارية وتشخيصية للعيادات الخارجية مغطاة تأمينياً'
  },

  // Invoice 2: pat-1005 (Self-Pay Cash Patient)
  {
    id: 'INV-2026-RC-002',
    invoiceNumber: 'SINV-2026-00850',
    invoiceDate: '2026-09-22',
    issueTime: '10:10',
    invoiceType: 'simplified_tax_invoice',
    lifecycleStatus: 'paid_closed',
    recipientType: 'patient',
    recipientId: 'pat-1005',
    recipientNameAr: 'سميحة فتحي عبد الجواد (علاج نقدي خاص)',
    patientId: 'pat-1005',
    patientMrn: 'MRN-2026-0850',
    patientNameAr: 'سميحة فتحي عبد الجواد',
    patientNationalId: '28003150102753',
    isSaudiCitizen: true,
    encounterId: 'ENC-2026-0850-OPD',
    clinicOrDepartmentAr: 'عيادة جراحة العظام والمفاصل (OPD)',
    lines: [
      {
        id: 'INV-LN-201',
        invoiceId: 'INV-2026-RC-002',
        chargeId: 'CHG-2026-004',
        serviceCode: 'SBS-99213',
        serviceNameAr: 'كشف استشاري عظام ومفاصل (نقدي خاص)',
        serviceNameEn: 'Orthopedic Specialist Consultation',
        quantity: 1,
        unitPriceSar: 450,
        grossAmountSar: 450,
        discountAmountSar: 0,
        netAmountSar: 450,
        vatCategory: 'zero_rated',
        vatRatePercent: 0,
        vatAmountSar: 0,
        lineTotalSar: 450,
        patientShareSar: 450,
        payerShareSar: 0
      }
    ],
    subtotalGrossSar: 450,
    discountTotalSar: 0,
    subtotalNetSar: 450,
    vatTotalSar: 0,
    grandTotalSar: 450,
    patientResponsibilitySar: 450,
    payerResponsibilitySar: 0,
    allocatedCashierReceiptSar: 450, // Paid in full at cashier REC-99404
    allocatedPayerRemittanceSar: 0,
    allocatedCreditAdjustmentSar: 0,
    outstandingPatientBalanceSar: 0,
    outstandingPayerBalanceSar: 0,
    totalOutstandingBalanceSar: 0,
    isSyntheticFixture: true,
    zatcaComplianceNotice: 'معاينة تجريبية لدورة الإيرادات — لا تمثل فاتورة ضريبية رسمية مصدرة عبر بوابة زاتكا (ZATCA)',
    notes: 'فاتورة سداد نقدي مسددة بالكامل في كاونتر الاستقبال'
  },

  // Invoice 3: pat-1002 (Tawuniya Insured Outpatient Invoice)
  {
    id: 'INV-2026-RC-003',
    invoiceNumber: 'TINV-2026-00820',
    invoiceDate: '2026-09-22',
    issueTime: '09:55',
    invoiceType: 'tax_invoice',
    lifecycleStatus: 'partially_paid',
    recipientType: 'insurance_payer',
    recipientId: 'PAYER-TAW-01',
    recipientNameAr: 'شركة التعاونية للتأمين',
    patientId: 'pat-1002',
    patientMrn: 'MRN-2026-0820',
    patientNameAr: 'نوران حسام الشافعي',
    patientNationalId: '29304180104421',
    isSaudiCitizen: true,
    encounterId: 'ENC-2026-0820-OPD',
    clinicOrDepartmentAr: 'عيادة الباطنة العامة والسكر (OPD)',
    lines: [
      {
        id: 'INV-LN-301',
        invoiceId: 'INV-2026-RC-003',
        chargeId: 'CHG-2026-006',
        serviceCode: 'SBS-99214',
        serviceNameAr: 'استشارة طبية مطولة - باطنة وسكر',
        serviceNameEn: 'Internal Medicine Extended Consultation',
        quantity: 1,
        unitPriceSar: 550,
        grossAmountSar: 550,
        discountAmountSar: 70,
        netAmountSar: 480,
        vatCategory: 'zero_rated',
        vatRatePercent: 0,
        vatAmountSar: 0,
        lineTotalSar: 480,
        patientShareSar: 96, // 20% copay
        payerShareSar: 384
      },
      {
        id: 'INV-LN-302',
        invoiceId: 'INV-2026-RC-003',
        chargeId: 'CHG-2026-007',
        serviceCode: 'SBS-83036',
        serviceNameAr: 'فحص السكر التراكمي في الدم (HbA1c)',
        serviceNameEn: 'Hemoglobin A1c (HbA1c)',
        quantity: 1,
        unitPriceSar: 150,
        grossAmountSar: 150,
        discountAmountSar: 30,
        netAmountSar: 120,
        vatCategory: 'zero_rated',
        vatRatePercent: 0,
        vatAmountSar: 0,
        lineTotalSar: 120,
        patientShareSar: 24, // 20% copay
        payerShareSar: 96
      }
    ],
    subtotalGrossSar: 700,
    discountTotalSar: 100,
    subtotalNetSar: 600,
    vatTotalSar: 0,
    grandTotalSar: 600,
    patientResponsibilitySar: 120,
    payerResponsibilitySar: 480,
    allocatedCashierReceiptSar: 90, // Paid partial copay TXN-2026-0813
    allocatedPayerRemittanceSar: 0,
    allocatedCreditAdjustmentSar: 0,
    outstandingPatientBalanceSar: 30,
    outstandingPayerBalanceSar: 480,
    totalOutstandingBalanceSar: 510,
    isSyntheticFixture: true,
    zatcaComplianceNotice: 'معاينة تجريبية لدورة الإيرادات — لا تمثل فاتورة ضريبية رسمية مصدرة عبر بوابة زاتكا (ZATCA)',
    associatedClaimId: 'CLM-2026-NPH-002'
  }
];

// ----------------------------------------------------------------------------
// 5. INSURANCE CLAIMS & NPHIES SUBMISSIONS
// ----------------------------------------------------------------------------

export const MOCK_CLAIMS: PayerClaim[] = [
  // Claim 1: Bupa Claim for pat-1001 (Acknowledged Technical)
  {
    id: 'CLM-2026-NPH-001',
    claimNumber: 'NPH-CLM-2026-44820',
    invoiceId: 'INV-2026-RC-001',
    payerId: 'PAYER-BUPA-01',
    payerNameAr: 'شركة بوبا العربية للتأمين التعاوني',
    payerNameEn: 'Bupa Arabia Cooperative Insurance',
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    patientNameAr: 'محمود سعد الدين إبراهيم',
    encounterId: 'ENC-2026-0814-OPD',
    claimType: 'professional_opd',
    lifecycleStatus: 'adjudication_partial',
    nphiesMessageId: 'MSG-NPH-2026-904128',
    nphiesBundleReference: 'BUNDLE-NPH-77192',
    submissionTimestamp: '2026-09-22 09:42',
    acknowledgementTimestamp: '2026-09-22 09:43',
    adjudicationTimestamp: '2026-09-22 10:15',
    preAuthReference: 'NPH-PA-2026-90412',
    lines: [
      {
        id: 'CLM-LN-101',
        claimId: 'CLM-2026-NPH-001',
        chargeId: 'CHG-2026-001',
        invoiceLineId: 'INV-LN-101',
        serviceCode: 'SBS-99213',
        serviceNameAr: 'كشف استشاري عيادات خارجية - قلب وأوعية',
        quantity: 1,
        unitPriceSar: 450,
        claimedGrossSar: 450,
        contractualDiscountSar: 50,
        claimedNetSar: 400,
        vatAmountSar: 0,
        totalClaimedSar: 400,
        adjudicationOutcome: 'approved',
        allowedAmountSar: 400,
        deniedAmountSar: 0,
        patientCoPayDeterminedSar: 40,
        payerPayableDeterminedSar: 360
      },
      {
        id: 'CLM-LN-102',
        claimId: 'CLM-2026-NPH-001',
        chargeId: 'CHG-2026-002',
        invoiceLineId: 'INV-LN-102',
        serviceCode: 'SBS-93306',
        serviceNameAr: 'موجات صوتية دوبلر على القلب (Echocardiogram)',
        quantity: 1,
        unitPriceSar: 1100,
        claimedGrossSar: 1100,
        contractualDiscountSar: 150,
        claimedNetSar: 950,
        vatAmountSar: 0,
        totalClaimedSar: 950,
        adjudicationOutcome: 'denied',
        allowedAmountSar: 0,
        deniedAmountSar: 950,
        patientCoPayDeterminedSar: 0,
        payerPayableDeterminedSar: 0,
        denialReasonCode: 'NPH-DEN-04',
        denialDescriptionAr: 'الخدمة تتطلب موافقة مسبقة معتمدة ومرفقة قبل التنفيذ'
      }
    ],
    totalClaimedSar: 1350,
    totalAllowedSar: 400,
    totalDeniedSar: 950,
    totalPayerPayableSar: 360,
    totalPatientShareSar: 40,
    adjudicationNotes: 'تمت الموافقة على الكشف الاستشاري ورفض الإيكو لطلب استكمال مستندات الموافقة المسبقة',
    isSyntheticFixture: true,
    supportingDocumentsAttached: ['تقرير الاستشارة الطبية للقلب', 'تقرير تخطيط رسم القلب الكهربائي']
  },

  // Claim 2: Tawuniya Claim for pat-1002 (Ready for Submission)
  {
    id: 'CLM-2026-NPH-002',
    claimNumber: 'NPH-CLM-2026-44821',
    invoiceId: 'INV-2026-RC-003',
    payerId: 'PAYER-TAW-01',
    payerNameAr: 'شركة التعاونية للتأمين',
    payerNameEn: 'Tawuniya Cooperative Insurance',
    patientId: 'pat-1002',
    patientMrn: 'MRN-2026-0820',
    patientNameAr: 'نوران حسام الشافعي',
    encounterId: 'ENC-2026-0820-OPD',
    claimType: 'professional_opd',
    lifecycleStatus: 'ready_for_submission',
    nphiesMessageId: 'MSG-NPH-2026-904130',
    nphiesBundleReference: 'BUNDLE-NPH-77195',
    lines: [
      {
        id: 'CLM-LN-201',
        claimId: 'CLM-2026-NPH-002',
        chargeId: 'CHG-2026-006',
        invoiceLineId: 'INV-LN-301',
        serviceCode: 'SBS-99214',
        serviceNameAr: 'استشارة طبية مطولة - باطنة وسكر',
        quantity: 1,
        unitPriceSar: 550,
        claimedGrossSar: 550,
        contractualDiscountSar: 70,
        claimedNetSar: 480,
        vatAmountSar: 0,
        totalClaimedSar: 480,
        adjudicationOutcome: 'pending_review',
        allowedAmountSar: 0,
        deniedAmountSar: 0,
        patientCoPayDeterminedSar: 96,
        payerPayableDeterminedSar: 384
      },
      {
        id: 'CLM-LN-202',
        claimId: 'CLM-2026-NPH-002',
        chargeId: 'CHG-2026-007',
        invoiceLineId: 'INV-LN-302',
        serviceCode: 'SBS-83036',
        serviceNameAr: 'فحص السكر التراكمي في الدم (HbA1c)',
        quantity: 1,
        unitPriceSar: 150,
        claimedGrossSar: 150,
        contractualDiscountSar: 30,
        claimedNetSar: 120,
        vatAmountSar: 0,
        totalClaimedSar: 120,
        adjudicationOutcome: 'pending_review',
        allowedAmountSar: 0,
        deniedAmountSar: 0,
        patientCoPayDeterminedSar: 24,
        payerPayableDeterminedSar: 96
      }
    ],
    totalClaimedSar: 600,
    totalAllowedSar: 0,
    totalDeniedSar: 0,
    totalPayerPayableSar: 480,
    totalPatientShareSar: 120,
    isSyntheticFixture: true,
    supportingDocumentsAttached: ['تقرير فحص السكر', 'السجل الدوائي للمريض']
  }
];

// ----------------------------------------------------------------------------
// 6. CLAIM DENIALS & APPEALS WORKLIST
// ----------------------------------------------------------------------------

export const MOCK_DENIALS: ClaimDenial[] = [
  {
    id: 'DEN-2026-001',
    claimId: 'CLM-2026-NPH-001',
    claimNumber: 'NPH-CLM-2026-44820',
    claimLineId: 'CLM-LN-102',
    payerId: 'PAYER-BUPA-01',
    payerNameAr: 'شركة بوبا العربية للتأمين التعاوني',
    patientId: 'pat-1001',
    patientMrn: 'MRN-2026-0814',
    patientNameAr: 'محمود سعد الدين إبراهيم',
    serviceCode: 'SBS-93306',
    serviceNameAr: 'موجات صوتية دوبلر على القلب (Echocardiogram)',
    deniedAmountSar: 950,
    denialCategory: 'pre_auth_missing',
    denialCode: 'NPH-DEN-04',
    denialDescriptionAr: 'الخدمة تتطلب موافقة مسبقة معتمدة صادرة قبل تاريخ تقديم الخدمة (Missing Pre-Authorization)',
    denialDescriptionEn: 'Prior authorization required before service rendering',
    responsibleDepartment: 'قسم الموافقات الطبية والتأمين',
    isAppealEligible: true,
    appealStatus: 'supporting_docs_attached',
    actionOwner: 'فاطمة الزهراء (أخصائية المطالبات والاعتراضات)',
    appealDeadlineDate: '2026-10-22',
    notes: 'تم إرفاق الموافقة المسبقة الطارئة الصادرة رقم NPH-PA-2026-90412 وجاري تقديم طلب إعادة النظر',
    isPatientDebtTransferAuthorized: false // Strictly forbidden to turn into patient debt without contract authorization
  }
];

// ----------------------------------------------------------------------------
// 7. PAYER REMITTANCES & ELECTRONIC REMITTANCE ADVICE (ERA)
// ----------------------------------------------------------------------------

export const MOCK_REMITTANCES: PayerRemittance[] = [
  {
    id: 'REM-2026-BUP-01',
    remittanceRef: 'ERA-BUP-2026-88192',
    payerId: 'PAYER-BUPA-01',
    payerNameAr: 'شركة بوبا العربية للتأمين التعاوني',
    remittanceDate: '2026-09-21',
    paymentMethod: 'sarie_eft',
    paymentReference: 'SARIE-BUP-9021481',
    totalRemittedAmountSar: 24500,
    totalAllocatedAmountSar: 20000,
    unallocatedRemainderSar: 4500,
    bankSettlementStatus: 'receipt_independently_confirmed',
    treasuryConfirmationReference: 'TR-REC-2026-00412',
    items: [
      {
        id: 'REM-ITM-01',
        remittanceId: 'REM-2026-BUP-01',
        claimId: 'CLM-2026-NPH-001',
        claimNumber: 'NPH-CLM-2026-44820',
        claimLineId: 'CLM-LN-101',
        invoiceId: 'INV-2026-RC-001',
        patientMrn: 'MRN-2026-0814',
        patientNameAr: 'محمود سعد الدين إبراهيم',
        claimedAmountSar: 400,
        adjudicatedAmountSar: 360,
        paidAmountSar: 360,
        contractualAdjustmentSar: 40,
        allocatedAmountSar: 0, // Ready to allocate!
        isFullyAllocated: false
      }
    ],
    isSyntheticFixture: true,
    notes: 'تحويل إلكتروني معتمد من مصرف الراجحي لحساب المستشفى ومطابق مع الخزينة'
  },
  {
    id: 'REM-2026-TAW-01',
    remittanceRef: 'ERA-TAW-2026-44109',
    payerId: 'PAYER-TAW-01',
    payerNameAr: 'شركة التعاونية للتأمين',
    remittanceDate: '2026-09-20',
    paymentMethod: 'sarie_eft',
    paymentReference: 'SARIE-TAW-330198',
    totalRemittedAmountSar: 38200,
    totalAllocatedAmountSar: 38200,
    unallocatedRemainderSar: 0,
    bankSettlementStatus: 'receipt_independently_confirmed',
    treasuryConfirmationReference: 'TR-REC-2026-00398',
    items: [],
    isSyntheticFixture: true,
    notes: 'تم تخصيص وتسوية الدفعة بالكامل على مطالبات سابقة'
  }
];

// ----------------------------------------------------------------------------
// 8. CREDIT BALANCES & VERIFIED REFUNDS
// ----------------------------------------------------------------------------

export const MOCK_CREDIT_BALANCES: CreditBalanceRecord[] = [
  {
    id: 'CRD-2026-001',
    patientId: 'pat-1002',
    patientMrn: 'MRN-2026-0820',
    patientNameAr: 'نوران حسام الشافعي',
    sourceInvoiceId: 'INV-2026-RC-003',
    sourceReceiptId: 'REC-99403',
    creditOrigin: 'legitimate_overpayment',
    creditAmountSar: 60,
    remainingEligibleRefundSar: 60,
    detectedDate: '2026-09-21',
    workflowStatus: 'credit_verified',
    notes: 'فائض سداد ناتج عن تعديل نسبة التحمل التأميني بعد مراجعة الوثيقة'
  }
];

export const MOCK_WRITE_OFFS: WriteOffAdjustment[] = [
  {
    id: 'ADJ-2026-001',
    targetType: 'patient_invoice',
    targetId: 'INV-2026-RC-001',
    invoiceNumber: 'TINV-2026-00814',
    patientMrn: 'MRN-2026-0814',
    amountSar: 10,
    adjustmentType: 'small_balance_waiver',
    reasonAr: 'إعفاء فروق تقريب كسور حسابية للعيادات الخارجية بموجب الصلاحيات المالية',
    approvedBy: 'مدير العمليات المالية (Finance Controller)',
    approvedAt: '2026-09-22 09:45',
    isGlPostingSimulated: true
  }
];

// ----------------------------------------------------------------------------
// 9. INITIAL COMPREHENSIVE REVENUE CYCLE STATE
// ----------------------------------------------------------------------------

export const INITIAL_REVENUE_CYCLE_STATE: RevenueCycleState = {
  currentBranch: 'main_hospital',
  activePersona: 'billing_officer',
  selectedPatientContextId: undefined,
  charges: MOCK_CHARGES,
  tariffs: MOCK_TARIFFS,
  coverages: MOCK_COVERAGES,
  invoices: MOCK_INVOICES,
  claims: MOCK_CLAIMS,
  denials: MOCK_DENIALS,
  remittances: MOCK_REMITTANCES,
  receiptAllocations: [
    {
      id: 'ALLOC-REC-01',
      receiptId: 'REC-99404',
      receiptNumber: 'REC-99404',
      invoiceId: 'INV-2026-RC-002',
      invoiceNumber: 'SINV-2026-00850',
      allocatedAmountSar: 450,
      allocatedAt: '2026-09-22 10:10',
      allocatedBy: 'أحمد نبيل (كاونتر 1)'
    }
  ],
  remittanceAllocations: [],
  creditBalances: MOCK_CREDIT_BALANCES,
  refundRequests: [],
  writeOffs: MOCK_WRITE_OFFS,
  auditLogs: [
    {
      id: 'LOG-001',
      timestamp: '2026-09-22 09:10',
      actionType: 'CHARGE_VALIDATED',
      entityId: 'CHG-2026-001',
      actor: 'أحمد نبيل رضوان',
      descriptionAr: 'تم التحقق من تنفيذ كشف استشاري القلب واعتماد الرسوم'
    },
    {
      id: 'LOG-002',
      timestamp: '2026-09-22 09:40',
      actionType: 'INVOICE_ISSUED',
      entityId: 'INV-2026-RC-001',
      actor: 'مروة عبد الرحمن (أخصائية الفوترة)',
      descriptionAr: 'إصدار فاتورة ضريبية محاكاة لشركة بوبا العربية بقيمة 1,350 ر.س'
    },
    {
      id: 'LOG-003',
      timestamp: '2026-09-22 10:15',
      actionType: 'CLAIM_ADJUDICATED',
      entityId: 'CLM-2026-NPH-001',
      actor: 'منصة نفيس (NPHIES Adjudication Engine)',
      descriptionAr: 'استلام نتيجة البت في المطالبة: موافقة جزئية ورفض بند الإيكو'
    }
  ]
};
