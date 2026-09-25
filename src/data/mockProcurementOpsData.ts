/**
 * HIS Enterprise Procurement & Purchasing Synthetic Data Fixtures
 * 
 * Provides comprehensive, realistic bilingual mock state for hospital procurement:
 * - Institutional policies & Delegation of Authority (DoA)
 * - Vetted and provisional suppliers across 8 categories with compliance certificates
 * - Realistic purchase requisitions (Routine, Urgent, Non-Catalog, Capital)
 * - Sourcing events (RFQ, Formal Tender, Direct Emergency Exception)
 * - Supplier quotations in different currencies (SAR, USD) and UOMs (Box, Case, Each)
 * - Technical specialist evaluations and commercial bid comparisons
 * - Approved and active Purchase Orders matching existing Inventory dock receipts
 * - Framework agreements (NUPCO & Direct LTAs) and supplier commercial claims
 * 
 * Date: 2026-09-21
 */

import {
  InstitutionalProcurementPolicy,
  SupplierMaster,
  PurchaseRequisition,
  SourcingEvent,
  SupplierQuotation,
  BidEvaluationSheet,
  AwardDecisionRecord,
  PurchaseOrder,
  FrameworkAgreement,
  SupplierClaim
} from '../types/procurementOps';

// ============================================================================
// 1. INSTITUTIONAL POLICY & DELEGATION OF AUTHORITY
// ============================================================================

export const INITIAL_PROCUREMENT_POLICY: InstitutionalProcurementPolicy = {
  policyId: 'POL-MED-PROC-2026-V1',
  institutionNameAr: 'مستشفى الإدينا التخصصي والمراكز التابعة',
  institutionNameEn: 'Edina Specialized Hospital & Integrated Health Centers',
  currency: 'SAR',
  standardVatPercent: 15,
  quotationRules: {
    directPurchaseMaxSar: 15000,
    rfqMinQuotations: 3,
    formalTenderThresholdSar: 150000
  },
  delegationOfAuthority: [
    { tierName: 'اعتماد رئيس القسم الطبي/الإداري', maxAmountSar: 25000, requiredRole: 'department_head', requiresSecondaryReview: false },
    { tierName: 'اعتماد مدير سلاسل الإمداد والمشتريات', maxAmountSar: 100000, requiredRole: 'procurement_manager', requiresSecondaryReview: true },
    { tierName: 'اعتماد المدير المالي والتنفيذي (CFO/CEO)', maxAmountSar: 500000, requiredRole: 'cfo_executive', requiresSecondaryReview: true },
    { tierName: 'اعتماد لجنة الشراء والمنافسات العليا', maxAmountSar: 5000000, requiredRole: 'board_committee', requiresSecondaryReview: true }
  ],
  allowEmergencyBypassWithPostAudit: true,
  allowOverDeliveryTolerancePercent: 5
};

// ============================================================================
// 2. SUPPLIER MASTER REGISTRY
// ============================================================================

export const INITIAL_SUPPLIERS: SupplierMaster[] = [
  {
    id: 'VEND-SA-9021',
    vendorCode: 'VEND-SA-9021',
    legalNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    legalNameEn: 'Gulf Medical Supplies & Care Co.',
    tradeName: 'Gulf Medical',
    taxRegistrationNumber: '300192847500003',
    commercialRegistrationNumber: '1010294821',
    country: 'SA',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    addressAr: 'طريق الملك فهد، حي الصحافة، مبنى الأبراج الطبية',
    addressEn: 'King Fahd Road, Al-Sahafa District',
    approvedCategories: ['medical_surgical_consumables', 'cssd_sterilization', 'blood_bank_supplies'],
    qualificationStatus: 'qualified',
    qualificationExpiryDate: '2027-12-31',
    qualificationScopeSummaryAr: 'مورد معتمد للفئات الطبية الجراحية ومستلزمات التعقيم الوريدي',
    qualificationScopeSummaryEn: 'Fully vetted medical-surgical and sterilization distributor',
    paymentTerms: 'Net 60 Days',
    standardCurrency: 'SAR',
    contacts: [
      { id: 'CONT-1', fullNameAr: 'أحمد بن فهد السديري', fullNameEn: 'Ahmed Al-Sudairy', title: 'مدير الحسابات الطبية والمستشفيات', email: 'a.sudairy@gulfmed.sa', phone: '+966 11 482 9901', isPrimary: true }
    ],
    complianceDocuments: [
      { id: 'DOC-1', documentType: 'commercial_registration', documentNumber: 'CR-1010294821', issuingAuthority: 'وزارة التجارة', issueDate: '2022-01-10', expiryDate: '2027-01-09', isExpired: false, verificationStatus: 'verified' },
      { id: 'DOC-2', documentType: 'tax_vat_certificate', documentNumber: 'VAT-300192847500003', issuingAuthority: 'هيئة الزكاة والضريبة والجمارك ZATCA', issueDate: '2021-06-01', expiryDate: '2028-05-31', isExpired: false, verificationStatus: 'verified' },
      { id: 'DOC-3', documentType: 'sfda_establishment_license', documentNumber: 'SFDA-MD-88192', issuingAuthority: 'الهيئة العامة للغذاء والدواء', issueDate: '2023-03-15', expiryDate: '2027-03-14', isExpired: false, verificationStatus: 'verified' }
    ],
    performanceMetrics: {
      onTimeDeliveryRatePercent: 96.5,
      qaAcceptanceRatePercent: 98.8,
      completedOrdersCount: 142,
      activeClaimsCount: 1,
      averageLeadTimeDays: 4.2
    },
    notes: 'المورد الاستراتيجي للمستلزمات الوريدية والجراحية العامة بالمستشفى.'
  },
  {
    id: 'VEND-SA-8812',
    vendorCode: 'VEND-SA-8812',
    legalNameAr: 'باكستر للحلول الوريدية والتقنيات الصحية الشرق الأوسط',
    legalNameEn: 'Baxter Healthcare Middle East FZ',
    tradeName: 'Baxter ME',
    taxRegistrationNumber: '310482910400003',
    commercialRegistrationNumber: '1010992144',
    country: 'SA',
    cityAr: 'جدة',
    cityEn: 'Jeddah',
    addressAr: 'طريق المدينة المنورة، مجمع الأعمال الصحية',
    addressEn: 'Madinah Road, Healthcare Business Park',
    approvedCategories: ['pharmaceuticals', 'medical_surgical_consumables'],
    qualificationStatus: 'qualified',
    qualificationExpiryDate: '2027-06-30',
    qualificationScopeSummaryAr: 'مورد معتمد للمحاليل الوريدية الكبيرة وأجهزة الغسيل الكلوي',
    qualificationScopeSummaryEn: 'Accredited supplier for IV fluids and renal replacement therapy',
    paymentTerms: 'Net 90 Days',
    standardCurrency: 'SAR',
    contacts: [
      { id: 'CONT-2', fullNameAr: 'د. طارق المنصور', fullNameEn: 'Dr. Tareq Al-Mansoor', title: 'مدير القطاع الحكومي والمستشفيات', email: 't_mansoor@baxter.com', phone: '+966 12 650 4411', isPrimary: true }
    ],
    complianceDocuments: [
      { id: 'DOC-4', documentType: 'gmp_certificate', documentNumber: 'GMP-BAX-994', issuingAuthority: 'SFDA / EMA', issueDate: '2023-01-01', expiryDate: '2027-12-31', isExpired: false, verificationStatus: 'verified' }
    ],
    performanceMetrics: {
      onTimeDeliveryRatePercent: 98.0,
      qaAcceptanceRatePercent: 99.5,
      completedOrdersCount: 210,
      activeClaimsCount: 0,
      averageLeadTimeDays: 3.5
    },
    isNupcoAffiliated: true,
    notes: 'وكيل مباشر للمحاليل الوريدية المعتمدة ومطابق لمعايير الشراء الموحد نوبكو.'
  },
  {
    id: 'VEND-SA-7733',
    vendorCode: 'VEND-SA-7733',
    legalNameAr: 'الشركة الوطنية للشراء الموحد (نوبكو NUPCO)',
    legalNameEn: 'National Unified Procurement Company (NUPCO)',
    tradeName: 'NUPCO',
    taxRegistrationNumber: '300994821100003',
    commercialRegistrationNumber: '1010248819',
    country: 'SA',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    addressAr: 'مجمع نوبكو اللوجستي، طريق الخرج، الرياض',
    addressEn: 'NUPCO Logistics Park, Al-Kharj Road',
    approvedCategories: ['pharmaceuticals', 'medical_surgical_consumables', 'laboratory_diagnostics'],
    qualificationStatus: 'qualified',
    qualificationExpiryDate: '2030-12-31',
    qualificationScopeSummaryAr: 'جهة الشراء الموحد الرسمية للقطاع الصحي الوطني',
    qualificationScopeSummaryEn: 'Central national healthcare procurement entity',
    paymentTerms: 'Unified Government Terms',
    standardCurrency: 'SAR',
    contacts: [
      { id: 'CONT-3', fullNameAr: 'م. خالد الشهري', fullNameEn: 'Eng. Khalid Al-Shehri', title: 'مدير خدمات المستشفيات والطلبيات الموحدة', email: 'hospital_care@nupco.com', phone: '+966 11 200 8800', isPrimary: true }
    ],
    complianceDocuments: [
      { id: 'DOC-5', documentType: 'commercial_registration', documentNumber: 'CR-NUPCO-01', issuingAuthority: 'وزارة الاستثمار / وزارة التجارة', issueDate: '2020-01-01', expiryDate: '2030-12-31', isExpired: false, verificationStatus: 'verified' }
    ],
    performanceMetrics: {
      onTimeDeliveryRatePercent: 94.0,
      qaAcceptanceRatePercent: 99.9,
      completedOrdersCount: 540,
      activeClaimsCount: 2,
      averageLeadTimeDays: 7.0
    },
    isNupcoAffiliated: true
  },
  {
    id: 'VEND-SA-6644',
    vendorCode: 'VEND-SA-6644',
    legalNameAr: 'المعدات الطبية المتقدمة والحلول الجراحية (Advanced MedEquip)',
    legalNameEn: 'Advanced MedEquip & Surgical Systems Ltd',
    tradeName: 'Advanced MedEquip',
    taxRegistrationNumber: '301184920100003',
    commercialRegistrationNumber: '1010384912',
    country: 'SA',
    cityAr: 'الدمام',
    cityEn: 'Dammam',
    addressAr: 'حي الشاطئ، مبنى التقنية الطبية',
    addressEn: 'Al-Shati District, MedTech Plaza',
    approvedCategories: ['biomedical_capital_equipment', 'facilities_and_it'],
    qualificationStatus: 'conditionally_qualified',
    qualificationExpiryDate: '2026-11-30',
    qualificationScopeSummaryAr: 'تأهيل مشروط لأجهزة الليزر الجراحي والمناظير مع إلزامية تقرير صيانة دورية',
    qualificationScopeSummaryEn: 'Conditional qualification pending quarterly maintenance audit',
    paymentTerms: '50% Upon Delivery, 50% Post-Commissioning',
    standardCurrency: 'SAR',
    contacts: [
      { id: 'CONT-4', fullNameAr: 'م. حسام العتيبي', fullNameEn: 'Hussam Al-Otaibi', title: 'مدير المبيعات الهندسية الطبية', email: 'h.otaibi@advmedequip.com', phone: '+966 13 833 2200', isPrimary: true }
    ],
    complianceDocuments: [
      { id: 'DOC-6', documentType: 'iso_13485', documentNumber: 'ISO-MED-2024', issuingAuthority: 'TUV Rheinland', issueDate: '2024-01-10', expiryDate: '2027-01-09', isExpired: false, verificationStatus: 'verified' }
    ],
    performanceMetrics: {
      onTimeDeliveryRatePercent: 88.0,
      qaAcceptanceRatePercent: 94.0,
      completedOrdersCount: 28,
      activeClaimsCount: 1,
      averageLeadTimeDays: 14.0
    }
  },
  {
    id: 'VEND-SA-5511',
    vendorCode: 'VEND-SA-5511',
    legalNameAr: 'التقنية الطبية للتشخيص المخبري (LabTech Diagnostics)',
    legalNameEn: 'LabTech Diagnostics KSA',
    tradeName: 'LabTech',
    taxRegistrationNumber: '300881920400003',
    commercialRegistrationNumber: '1010492811',
    country: 'SA',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    addressAr: 'حي الملز، شارع الجامعة',
    addressEn: 'Al-Malaz District, University Street',
    approvedCategories: ['laboratory_diagnostics'],
    qualificationStatus: 'expired',
    qualificationExpiryDate: '2026-08-31',
    qualificationScopeSummaryAr: 'ترخيص الهيئة العامة للغذاء والدواء منتهي بتاريخ 31-08-2026، الشراء موقوف مؤقتاً',
    qualificationScopeSummaryEn: 'SFDA Medical Device establishment license expired. Purchasing blocked pending renewal.',
    paymentTerms: 'Net 30 Days',
    standardCurrency: 'SAR',
    contacts: [
      { id: 'CONT-5', fullNameAr: 'أنس المصري', fullNameEn: 'Anas Al-Masri', title: 'مسؤول الامتثال والتسجيل', email: 'compliance@labtech.sa', phone: '+966 11 477 3321', isPrimary: true }
    ],
    complianceDocuments: [
      { id: 'DOC-7', documentType: 'sfda_establishment_license', documentNumber: 'SFDA-IVD-7711', issuingAuthority: 'الهيئة العامة للغذاء والدواء', issueDate: '2023-09-01', expiryDate: '2026-08-31', isExpired: true, verificationStatus: 'verified' }
    ],
    performanceMetrics: {
      onTimeDeliveryRatePercent: 91.0,
      qaAcceptanceRatePercent: 97.0,
      completedOrdersCount: 65,
      activeClaimsCount: 0,
      averageLeadTimeDays: 6.0
    },
    notes: 'محظور من المشاركة في المنافسات الجديدة حتى تجديد ترخيص المنشأة من هيئة الغذاء والدواء (PROC10).'
  },
  {
    id: 'VEND-SA-4422',
    vendorCode: 'VEND-SA-4422',
    legalNameAr: 'شركة الأفق للخدمات العامة والمساندة (Horizon Facility)',
    legalNameEn: 'Horizon General & Facility Services',
    tradeName: 'Horizon Services',
    taxRegistrationNumber: '300441920100003',
    commercialRegistrationNumber: '1010192844',
    country: 'SA',
    cityAr: 'الرياض',
    cityEn: 'Riyadh',
    addressAr: 'حي العليا، برج الأفق',
    addressEn: 'Al-Olaya, Horizon Tower',
    approvedCategories: ['general_services'],
    qualificationStatus: 'under_review',
    qualificationScopeSummaryAr: 'مسجل في النظام وقيد تدقيق الوثائق - غير مؤهل بعد لتوريد المستلزمات الطبية أو الأجهزة',
    qualificationScopeSummaryEn: 'Registered vendor under review; not qualified for clinical items (PROC09)',
    paymentTerms: 'Net 30 Days',
    standardCurrency: 'SAR',
    contacts: [
      { id: 'CONT-6', fullNameAr: 'سلطان القحطاني', fullNameEn: 'Sultan Al-Qahtani', title: 'المدير التنفيذي', email: 'sultan@horizon.sa', phone: '+966 11 219 0044', isPrimary: true }
    ],
    complianceDocuments: [
      { id: 'DOC-8', documentType: 'commercial_registration', documentNumber: 'CR-1010192844', issuingAuthority: 'وزارة التجارة', issueDate: '2024-05-01', expiryDate: '2028-04-30', isExpired: false, verificationStatus: 'pending_verification' }
    ]
  }
];

// ============================================================================
// 3. PURCHASE REQUISITIONS (PR)
// ============================================================================

export const INITIAL_PURCHASE_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: 'PR-2026-00101',
    requisitionNumber: 'PR-2026-00101',
    branchId: 'main_hospital',
    requestingDepartmentId: 'ICU',
    requestingDepartmentNameAr: 'العناية المركزة (ICU)',
    requestingDepartmentNameEn: 'Intensive Care Unit (ICU)',
    requesterStaffId: 'STF-NUR-401',
    requesterNameAr: 'مريم الدوسري',
    requesterNameEn: 'Maryam Al-Dossary',
    requesterRoleTitle: 'مشرفة تمريض العناية المركزة',
    costCenterCode: 'CC-ICU-701',
    budgetAccountCode: 'GL-5100-MEDSUP',
    budgetStatus: 'funds_available',
    priority: 'routine',
    requiredDate: '2026-10-05',
    businessJustificationAr: 'تجديد مخزون القساطر الوريدية المركزية والقفازات المعقمة للجراحة لمواجهة ارتفاع الإشغال المتوقع.',
    businessJustificationEn: 'Restocking central venous line kits and sterile gloves for high projected ICU bed occupancy.',
    status: 'submitted_pending_approval',
    lines: [
      {
        id: 'PRL-00101-1',
        lineNumber: 1,
        itemType: 'catalog_stock',
        catalogItemId: 'ITEM-MS-001',
        itemCode: 'CAN-IV-20G',
        itemDescriptionAr: 'قسطرة وريدية محيطية مقاس 20G معقمة (IV Cannula 20G)',
        itemDescriptionEn: 'IV Peripheral Cannula 20G with injection port, sterile',
        requestedUom: 'box',
        requestedQuantity: 50,
        estimatedUnitPriceSar: 120.0,
        estimatedTotalSar: 6000.0,
        requiredDeliveryDate: '2026-10-05',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        costCenterCode: 'CC-ICU-701',
        approvedQuantity: 0,
        sourcedQuantity: 0,
        remainingUnsourcedQuantity: 0,
        sourcingStatus: 'unsourced',
        internalStockAvailable: 15
      },
      {
        id: 'PRL-00101-2',
        lineNumber: 2,
        itemType: 'catalog_stock',
        catalogItemId: 'ITEM-MS-002',
        itemCode: 'GLV-ST-75',
        itemDescriptionAr: 'قفازات جراحية معقمة خالية من اللاتكس مقاس 7.5 (Surgical Gloves 7.5)',
        itemDescriptionEn: 'Latex-free sterile surgical gloves size 7.5',
        requestedUom: 'box',
        requestedQuantity: 40,
        estimatedUnitPriceSar: 180.0,
        estimatedTotalSar: 7200.0,
        requiredDeliveryDate: '2026-10-05',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        costCenterCode: 'CC-ICU-701',
        approvedQuantity: 0,
        sourcedQuantity: 0,
        remainingUnsourcedQuantity: 0,
        sourcingStatus: 'unsourced',
        internalStockAvailable: 0
      }
    ],
    estimatedTotalValueSar: 13200.0,
    approvalHistory: [
      {
        id: 'APPR-101-1',
        stageNameAr: 'مراجعة واعتماد رئيس قسم العناية المركزة',
        stageNameEn: 'ICU Department Head Review',
        reviewerRoleId: 'department_head',
        decision: 'pending'
      }
    ],
    createdAt: '2026-09-20 09:30',
    updatedAt: '2026-09-20 09:30'
  },
  {
    id: 'PR-2026-00102',
    requisitionNumber: 'PR-2026-00102',
    branchId: 'main_hospital',
    requestingDepartmentId: 'ER',
    requestingDepartmentNameAr: 'طوارئ الحوادث والإصابات (ER)',
    requestingDepartmentNameEn: 'Emergency & Trauma Department (ER)',
    requesterStaffId: 'STF-DOC-102',
    requesterNameAr: 'د. فيصل الحربي',
    requesterNameEn: 'Dr. Faisal Al-Harbi',
    requesterRoleTitle: 'استشاري طب الطوارئ المناوب',
    costCenterCode: 'CC-ER-601',
    budgetAccountCode: 'GL-5100-MEDSUP',
    budgetStatus: 'funds_available',
    priority: 'urgent',
    requiredDate: '2026-09-23',
    businessJustificationAr: 'طلب عاجل لأنابيب تفريغ الصدر ومجموعات البزل الصدري بعد استقبال حوادث متعددة ونفاد المخزون.',
    businessJustificationEn: 'URGENT: Thoracostomy chest drain sets critically low following multiple trauma admissions (PROC02).',
    status: 'submitted_pending_approval',
    lines: [
      {
        id: 'PRL-00102-1',
        lineNumber: 1,
        itemType: 'catalog_stock',
        catalogItemId: 'ITEM-MS-004',
        itemCode: 'DRAIN-CHEST-28FR',
        itemDescriptionAr: 'أنبوب تفريغ الصدر الصدري 28FR معقم مع وصلة شفط ثلاثية',
        itemDescriptionEn: 'Chest Tube Thoracostomy Set 28FR with 3-chamber water seal',
        requestedUom: 'box',
        requestedQuantity: 20,
        estimatedUnitPriceSar: 450.0,
        estimatedTotalSar: 9000.0,
        requiredDeliveryDate: '2026-09-23',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        costCenterCode: 'CC-ER-601',
        approvedQuantity: 0,
        sourcedQuantity: 0,
        remainingUnsourcedQuantity: 0,
        sourcingStatus: 'unsourced',
        internalStockAvailable: 0
      }
    ],
    estimatedTotalValueSar: 9000.0,
    approvalHistory: [
      {
        id: 'APPR-102-1',
        stageNameAr: 'اعتماد مسار الطوارئ العاجل',
        stageNameEn: 'Urgent ER Fast-Track Approval',
        reviewerRoleId: 'department_head',
        decision: 'pending'
      }
    ],
    createdAt: '2026-09-21 01:15',
    updatedAt: '2026-09-21 01:15'
  },
  {
    id: 'PR-2026-00103',
    requisitionNumber: 'PR-2026-00103',
    branchId: 'main_hospital',
    requestingDepartmentId: 'BIOMEDICAL',
    requestingDepartmentNameAr: 'الهندسة الطبية الحيوية (Biomedical)',
    requestingDepartmentNameEn: 'Biomedical Engineering Dept',
    requesterStaffId: 'STF-ENG-204',
    requesterNameAr: 'م. عادل الغامدي',
    requesterNameEn: 'Eng. Adel Al-Ghamdi',
    requesterRoleTitle: 'مهندس أجهزة الليزر وغرف العمليات',
    costCenterCode: 'CC-ENG-802',
    budgetAccountCode: 'GL-5200-BIOMED-CAPEX',
    budgetStatus: 'pending_finance_review',
    priority: 'routine',
    requiredDate: '2026-10-15',
    businessJustificationAr: 'أداة معايرة كهروبصرية دقيقة لجهاز التفتيت بالليزر غير مسجلة في الدليل الطبي وتتطلب شراء خاصاً من الوكيل.',
    businessJustificationEn: 'Specialized electro-optical laser calibration probe for OR Holmium lithotripter (Non-catalog, PROC04).',
    status: 'approved',
    lines: [
      {
        id: 'PRL-00103-1',
        lineNumber: 1,
        itemType: 'non_catalog_special',
        itemCode: 'NON-CATALOG',
        itemDescriptionAr: 'مسبار معايرة الطاقة الضوئية لليزر المسالك البولية هولميوم 100W',
        itemDescriptionEn: 'Optical Energy Calibration Probe for Lumenis Holmium 100W Laser',
        requestedUom: 'each',
        requestedQuantity: 1,
        estimatedUnitPriceSar: 18500.0,
        estimatedTotalSar: 18500.0,
        requiredDeliveryDate: '2026-10-15',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        suggestedSupplierId: 'VEND-SA-6644',
        costCenterCode: 'CC-ENG-802',
        approvedQuantity: 1,
        sourcedQuantity: 0,
        remainingUnsourcedQuantity: 1,
        sourcingStatus: 'unsourced',
        internalStockAvailable: 0
      }
    ],
    estimatedTotalValueSar: 18500.0,
    approvalHistory: [
      {
        id: 'APPR-103-1',
        stageNameAr: 'اعتماد مدير الهندسة الطبية',
        stageNameEn: 'Biomedical Director Approval',
        reviewerRoleId: 'department_head',
        reviewerStaffNameAr: 'م. حسام الشريف',
        decision: 'approved',
        decisionTimestamp: '2026-09-19 14:20',
        comments: 'تم التحقق من ضرورة المسبار لإجراء الصيانة الوقائية السنوية لليزر العمليات.'
      }
    ],
    createdAt: '2026-09-18 10:00',
    updatedAt: '2026-09-19 14:20'
  },
  {
    id: 'PR-2026-00104',
    requisitionNumber: 'PR-2026-00104',
    branchId: 'main_hospital',
    requestingDepartmentId: 'WARDS',
    requestingDepartmentNameAr: 'أجنحة التنويم العامة (Inpatient Wards)',
    requestingDepartmentNameEn: 'Inpatient General Wards',
    requesterStaffId: 'STF-NUR-302',
    requesterNameAr: 'هدى القاسم',
    requesterNameEn: 'Huda Al-Qasim',
    requesterRoleTitle: 'رئيسة تمريض أجنحة التنويم الباطني',
    costCenterCode: 'CC-IPD-501',
    budgetAccountCode: 'GL-5100-MEDSUP',
    budgetStatus: 'funds_available',
    priority: 'routine',
    requiredDate: '2026-10-20',
    businessJustificationAr: 'كمامات طبية جراحية ثلاثية الطبقات لتوزيعها على المرضى والزوار والعاملين.',
    businessJustificationEn: '3-Ply Surgical Masks for infection control in inpatient units (Ready for consolidation, PROC07).',
    status: 'approved',
    lines: [
      {
        id: 'PRL-00104-1',
        lineNumber: 1,
        itemType: 'catalog_stock',
        catalogItemId: 'ITEM-MS-003',
        itemCode: 'MASK-SURG-3PLY',
        itemDescriptionAr: 'كمامة جراحية 3 طبقات مقاومة للسوائل (Surgical Mask 3-Ply)',
        itemDescriptionEn: '3-ply surgical mask fluid resistant Type IIR',
        requestedUom: 'box',
        requestedQuantity: 100,
        estimatedUnitPriceSar: 25.0,
        estimatedTotalSar: 2500.0,
        requiredDeliveryDate: '2026-10-20',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        costCenterCode: 'CC-IPD-501',
        approvedQuantity: 100,
        sourcedQuantity: 0,
        remainingUnsourcedQuantity: 100,
        sourcingStatus: 'unsourced',
        internalStockAvailable: 20
      }
    ],
    estimatedTotalValueSar: 2500.0,
    approvalHistory: [
      {
        id: 'APPR-104-1',
        stageNameAr: 'اعتماد إدارة التمريض العام',
        stageNameEn: 'General Nursing Approval',
        reviewerRoleId: 'department_head',
        reviewerStaffNameAr: 'أمل العلي',
        decision: 'approved',
        decisionTimestamp: '2026-09-19 16:00'
      }
    ],
    createdAt: '2026-09-19 11:30',
    updatedAt: '2026-09-19 16:00'
  },
  {
    id: 'PR-2026-00105',
    requisitionNumber: 'PR-2026-00105',
    branchId: 'main_hospital',
    requestingDepartmentId: 'OR',
    requestingDepartmentNameAr: 'غرف العمليات الجراحية (OR)',
    requestingDepartmentNameEn: 'Operating Rooms Complex (OR)',
    requesterStaffId: 'STF-NUR-501',
    requesterNameAr: 'خالد السالم',
    requesterNameEn: 'Khalid Al-Salem',
    requesterRoleTitle: 'مشرف تمريض العمليات',
    costCenterCode: 'CC-OR-401',
    budgetAccountCode: 'GL-5100-MEDSUP',
    budgetStatus: 'pending_finance_review',
    priority: 'routine',
    requiredDate: '2026-10-10',
    businessJustificationAr: 'طلب شراشف جراحية معقمة لجراحة العظام واستبدال المفاصل.',
    businessJustificationEn: 'Sterile surgical orthopedic drape packs for total knee and hip arthroplasty.',
    status: 'returned_for_revision',
    lines: [
      {
        id: 'PRL-00105-1',
        lineNumber: 1,
        itemType: 'catalog_stock',
        catalogItemId: 'ITEM-MS-005',
        itemCode: 'DRAPE-ORTHO-ST',
        itemDescriptionAr: 'طقم شراشف جراحية لعظام الركبة معقمة (Ortho Drape Pack)',
        itemDescriptionEn: 'Sterile heavy-duty orthopedic surgical drape pack',
        requestedUom: 'box',
        requestedQuantity: 80,
        estimatedUnitPriceSar: 650.0,
        estimatedTotalSar: 52000.0,
        requiredDeliveryDate: '2026-10-10',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        costCenterCode: 'CC-OR-401',
        approvedQuantity: 0,
        sourcedQuantity: 0,
        remainingUnsourcedQuantity: 0,
        sourcingStatus: 'unsourced',
        internalStockAvailable: 10
      }
    ],
    estimatedTotalValueSar: 52000.0,
    approvalHistory: [
      {
        id: 'APPR-105-1',
        stageNameAr: 'مراجعة المشتريات والمالية',
        stageNameEn: 'Procurement & Finance Review',
        reviewerRoleId: 'procurement_manager',
        reviewerStaffNameAr: 'سعد العريفي (مدير المشتريات)',
        decision: 'returned_for_revision',
        decisionTimestamp: '2026-09-20 15:45',
        comments: 'الكمية المطلوبة (80 علبة = 400 طقم) تتجاوز معدل الاستهلاك الفصلي لغرف العمليات بمرتين، ويوجد رصيد 10 علب بالمستودع. يرجى تعديل الكمية إلى 40 علبة وتحديد الحالات المجدولة بدقة (PROC06).'
      }
    ],
    createdAt: '2026-09-20 10:00',
    updatedAt: '2026-09-20 15:45'
  }
];

// ============================================================================
// 4. SOURCING EVENTS (RFQ, TENDER, DIRECT)
// ============================================================================

export const INITIAL_SOURCING_EVENTS: SourcingEvent[] = [
  {
    id: 'SRC-2026-RFQ-01',
    sourcingNumber: 'RFQ-2026-042',
    titleAr: 'منافسة توريد مستلزمات وريدية وقساطر محيطية للمستشفى المركزي',
    titleEn: 'Procurement of Peripheral IV Cannulas and Infusion Disposables',
    method: 'rfq',
    status: 'under_evaluation',
    branchId: 'main_hospital',
    category: 'medical_surgical_consumables',
    responsibleBuyerStaffId: 'STF-BUY-001',
    responsibleBuyerNameAr: 'سعد بن ناصر العريفي',
    publishDate: '2026-09-10',
    submissionDeadline: '2026-09-22',
    invitedSuppliers: [
      { supplierId: 'VEND-SA-9021', invitedAt: '2026-09-10 10:00', transmissionMethod: 'portal_invitation', invitationStatus: 'quotation_received' },
      { supplierId: 'VEND-SA-8812', invitedAt: '2026-09-10 10:00', transmissionMethod: 'portal_invitation', invitationStatus: 'quotation_received' },
      { supplierId: 'VEND-SA-4422', invitedAt: '2026-09-10 10:00', transmissionMethod: 'portal_invitation', invitationStatus: 'quotation_received' }
    ],
    lines: [
      {
        id: 'SRCL-042-1',
        sourcingEventId: 'SRC-2026-RFQ-01',
        sourceRequisitionId: 'PR-2026-00101',
        sourceRequisitionLineId: 'PRL-00101-1',
        itemType: 'catalog_stock',
        catalogItemId: 'ITEM-MS-001',
        itemCode: 'CAN-IV-20G',
        descriptionAr: 'قسطرة وريدية محيطية مقاس 20G معقمة خالية من اللاتكس مع صمام حقن جانبي',
        descriptionEn: 'IV Peripheral Cannula 20G sterile latex-free with injection port',
        targetQuantity: 50,
        targetUom: 'box',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        targetDeliveryDate: '2026-10-05',
        technicalSpecificationsAr: 'مطابق للمواصفة القياسية السعودية SFDA ومعايير ISO 10555-1، صمام أمان مغلق يمنع تسرب الدم.',
        technicalSpecificationsEn: 'SFDA and ISO 10555-1 compliant, passive safety needle with blood-leak prevention valve.'
      }
    ],
    evaluationCriteria: [
      { id: 'CRIT-1', nameAr: 'المطابقة الفنية والمواصفات السريرية', nameEn: 'Technical & Clinical Compliance', weightPercent: 50, category: 'technical' },
      { id: 'CRIT-2', nameAr: 'التكلفة الإجمالية والأسعار التنافسية', nameEn: 'Total Evaluated Cost & Price', weightPercent: 40, category: 'commercial' },
      { id: 'CRIT-3', nameAr: 'الالتزام بمدة وسرعة التوريد', nameEn: 'Lead Time & Delivery Commitment', weightPercent: 10, category: 'delivery_compliance' }
    ],
    createdAt: '2026-09-10 09:00',
    updatedAt: '2026-09-20 14:00'
  },
  {
    id: 'SRC-2026-TND-02',
    sourcingNumber: 'TND-2026-015',
    titleAr: 'منافسة عامة: توريد مستلزمات مكافحة العدوى والكمامات الطبية السنوية',
    titleEn: 'Annual Tender: Infection Control PPE & 3-Ply Surgical Masks',
    method: 'formal_tender',
    status: 'published_awaiting_bids',
    branchId: 'main_hospital',
    category: 'medical_surgical_consumables',
    responsibleBuyerStaffId: 'STF-BUY-002',
    responsibleBuyerNameAr: 'فهد السبيعي',
    publishDate: '2026-09-18',
    submissionDeadline: '2026-10-10',
    invitedSuppliers: [
      { supplierId: 'VEND-SA-9021', invitedAt: '2026-09-18 11:00', transmissionMethod: 'portal_invitation', invitationStatus: 'acknowledged' },
      { supplierId: 'VEND-SA-7733', invitedAt: '2026-09-18 11:00', transmissionMethod: 'portal_invitation', invitationStatus: 'simulated_sent' }
    ],
    lines: [
      {
        id: 'SRCL-015-1',
        sourcingEventId: 'SRC-2026-TND-02',
        sourceRequisitionId: 'PR-2026-00104',
        sourceRequisitionLineId: 'PRL-00104-1',
        itemType: 'catalog_stock',
        catalogItemId: 'ITEM-MS-003',
        itemCode: 'MASK-SURG-3PLY',
        descriptionAr: 'كمامة جراحية 3 طبقات مقاومة للسوائل Type IIR - توريد دوري',
        descriptionEn: '3-Ply surgical mask fluid resistant Type IIR for annual hospital supply',
        targetQuantity: 1000,
        targetUom: 'box',
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        targetDeliveryDate: '2026-11-01',
        technicalSpecificationsAr: 'كفاءة ترشيح بكتيري BFE >= 98%، مقاومة لرذاذ السوائل 120 mmHg وفق EN 14683.',
        technicalSpecificationsEn: 'Bacterial filtration efficiency BFE >= 98%, synthetic blood splash resistance 120 mmHg per EN 14683.'
      }
    ],
    evaluationCriteria: [
      { id: 'CRIT-T1', nameAr: 'معايير الجودة والشهادات المعتمدة', nameEn: 'Quality Certifications & Lab Test', weightPercent: 40, category: 'quality_assurance' },
      { id: 'CRIT-T2', nameAr: 'السعر المالي الإجمالي', nameEn: 'Evaluated Financial Price', weightPercent: 50, category: 'commercial' },
      { id: 'CRIT-T3', nameAr: 'جدول التوريدات الدورية', nameEn: 'Staggered Supply Schedule', weightPercent: 10, category: 'delivery_compliance' }
    ],
    createdAt: '2026-09-18 08:30',
    updatedAt: '2026-09-18 11:00'
  }
];

// ============================================================================
// 5. SUPPLIER QUOTATIONS
// ============================================================================

export const INITIAL_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'QUOTE-2026-042-A',
    sourcingEventId: 'SRC-2026-RFQ-01',
    supplierId: 'VEND-SA-9021',
    quotationReferenceNumber: 'GULF-Q-99418',
    quotationDate: '2026-09-14',
    validUntilDate: '2026-11-14',
    currency: 'SAR',
    exchangeRateToSar: 1.0,
    lines: [
      {
        id: 'QL-042-A1',
        quotationId: 'QUOTE-2026-042-A',
        sourcingLineId: 'SRCL-042-1',
        supplierItemCode: 'GULF-IV-20',
        quotedDescriptionAr: 'قسطرة وريدية محيطية 20G بي دي بروكسايد معقمة (علبة 50 حبة)',
        quotedDescriptionEn: 'BD Proxima IV Peripheral Cannula 20G, Sterile (Box of 50 each)',
        quotedPackaging: 'علبة تحتوي 50 حبة (Box of 50 each)',
        quotedUom: 'box',
        quotedQuantity: 50,
        quotedUnitPrice: 110.0,
        quotedLineSubtotal: 5500.0,
        applicableTaxPercent: 15,
        quotedLineTotal: 6325.0,
        normalizedBaseUom: 'each',
        normalizedBaseQuantity: 2500,
        normalizedUnitPriceSar: 2.2, // 110 / 50 each
        uomConversionVerified: true,
        uomConversionFactor: 50,
        leadTimeDays: 3,
        offeredDeliveryDate: '2026-09-28',
        brandOrManufacturer: 'Becton Dickinson (BD Medical)',
        countryOfOrigin: 'USA',
        warrantyPeriodMonths: 24,
        technicalComplianceNotes: 'مطابق 100% لمواصفات المستشفى مع تقديم عينات معتمدة سريرياً.'
      }
    ],
    totalQuotedAmountNative: 6325.0,
    totalQuotedAmountSar: 6325.0,
    paymentTerms: 'Net 60 Days',
    deliveryTerms: 'DDP Hospital Main Dock (الرياض)',
    completenessStatus: 'complete',
    submittedAt: '2026-09-14 11:30'
  },
  {
    id: 'QUOTE-2026-042-B',
    sourcingEventId: 'SRC-2026-RFQ-01',
    supplierId: 'VEND-SA-8812',
    quotationReferenceNumber: 'BAX-Q-2026-88',
    quotationDate: '2026-09-15',
    validUntilDate: '2026-11-15',
    currency: 'SAR',
    exchangeRateToSar: 1.0,
    lines: [
      {
        id: 'QL-042-B1',
        quotationId: 'QUOTE-2026-042-B',
        sourcingLineId: 'SRCL-042-1',
        supplierItemCode: 'BAX-CAN-20',
        quotedDescriptionAr: 'قسطرة وريدية محيطية 20G باكستر كلير-سيف (كرتون يحتوي 10 علب = 500 حبة)',
        quotedDescriptionEn: 'Baxter ClearSafe IV Catheter 20G (Case of 10 boxes = 500 each)',
        quotedPackaging: 'كرتون شحن يحتوي 10 علب (Case of 500 each)',
        quotedUom: 'case',
        quotedQuantity: 5, // 5 cases = 2500 each = 50 boxes
        quotedUnitPrice: 1150.0, // 1150 / 500 = 2.30 SAR/each
        quotedLineSubtotal: 5750.0,
        applicableTaxPercent: 15,
        quotedLineTotal: 6612.5,
        normalizedBaseUom: 'each',
        normalizedBaseQuantity: 2500,
        normalizedUnitPriceSar: 2.3,
        uomConversionVerified: true,
        uomConversionFactor: 500,
        leadTimeDays: 4,
        offeredDeliveryDate: '2026-09-29',
        brandOrManufacturer: 'Baxter Healthcare',
        countryOfOrigin: 'Ireland',
        warrantyPeriodMonths: 36,
        technicalComplianceNotes: 'مطابق للمواصفات السريرية ومعتمد من هيئة الغذاء والدواء.'
      }
    ],
    totalQuotedAmountNative: 6612.5,
    totalQuotedAmountSar: 6612.5,
    paymentTerms: 'Net 90 Days',
    deliveryTerms: 'DDP Hospital Warehouse',
    completenessStatus: 'complete',
    submittedAt: '2026-09-15 14:00'
  },
  {
    id: 'QUOTE-2026-042-C',
    sourcingEventId: 'SRC-2026-RFQ-01',
    supplierId: 'VEND-SA-4422',
    quotationReferenceNumber: 'HORIZ-Q-1102',
    quotationDate: '2026-09-16',
    validUntilDate: '2026-10-16',
    currency: 'SAR',
    exchangeRateToSar: 1.0,
    lines: [
      {
        id: 'QL-042-C1',
        quotationId: 'QUOTE-2026-042-C',
        sourcingLineId: 'SRCL-042-1',
        quotedDescriptionAr: 'قسطرة وريدية غير محددة العلامة التجارية',
        quotedDescriptionEn: 'Generic IV Cannula 20G',
        quotedPackaging: 'علبة',
        quotedUom: 'box',
        quotedQuantity: 50,
        quotedUnitPrice: 95.0,
        quotedLineSubtotal: 4750.0,
        applicableTaxPercent: 15,
        quotedLineTotal: 5462.5,
        normalizedBaseUom: 'each',
        normalizedBaseQuantity: 2500,
        normalizedUnitPriceSar: 1.9,
        uomConversionVerified: true,
        uomConversionFactor: 50,
        leadTimeDays: 14,
        offeredDeliveryDate: '2026-10-10',
        brandOrManufacturer: 'Generic Trade',
        technicalComplianceNotes: 'عرض غير مكتمل لعدم توفير شهادات الجودة أو عينات فحص مخبرية (PROC13).'
      }
    ],
    totalQuotedAmountNative: 5462.5,
    totalQuotedAmountSar: 5462.5,
    paymentTerms: 'Cash on Delivery',
    deliveryTerms: 'FOB Supplier Warehouse',
    completenessStatus: 'incomplete_missing_data',
    incompletenessReasons: [
      'المورد غير مؤهل لتوريد المستلزمات الطبية والجراحية (PROC09).',
      'العرض يفتقر إلى شهادة التسجيل بالهيئة العامة للغذاء والدواء وبيانات الشركة المصنعة.'
    ],
    submittedAt: '2026-09-16 16:30'
  }
];

// ============================================================================
// 6. BID EVALUATIONS & AWARDS
// ============================================================================

export const INITIAL_BID_EVALUATIONS: BidEvaluationSheet[] = [
  {
    id: 'EVAL-042-A',
    sourcingEventId: 'SRC-2026-RFQ-01',
    supplierId: 'VEND-SA-9021',
    quotationId: 'QUOTE-2026-042-A',
    technicalEvaluationStatus: 'compliant',
    technicalScore: 98,
    specialtyApprovalReference: 'CLIN-PHARM-NUR-APPR-2026-99',
    technicalFindings: [
      { criterionId: 'CRIT-1', scoreOutOf100: 98, isCompliant: true, specialistNotesAr: 'مطابق ممتاز، العينات تم اختبارها بغرفة الإنعاش وأثبتت أمان صمام الإغلاق.', specialistNotesEn: 'Fully compliant, evaluated in ICU resuscitation bay with zero leakage.', evaluatedByStaffName: 'د. سارة المنصور (استشارية تمريض سريري)' }
    ],
    commercialEvaluationStatus: 'evaluated',
    commercialScore: 95,
    totalEvaluatedCostSar: 6325.0,
    normalizedUnitCostSummary: '2.20 ريال سعودي لكل حبة مفردة (SAR 2.20 / Each)',
    weightedTotalScore: 96.5,
    ranking: 1,
    isRecommendedForAward: true,
    recommendationRationale: 'أعلى تقييم فني متكامل بأفضل سعر مقارن (2.20 ريال/حبة) مع شروط دفع Net 60 وتوريد خلال 3 أيام عمل.'
  },
  {
    id: 'EVAL-042-B',
    sourcingEventId: 'SRC-2026-RFQ-01',
    supplierId: 'VEND-SA-8812',
    quotationId: 'QUOTE-2026-042-B',
    technicalEvaluationStatus: 'compliant',
    technicalScore: 95,
    specialtyApprovalReference: 'CLIN-PHARM-NUR-APPR-2026-100',
    technicalFindings: [
      { criterionId: 'CRIT-1', scoreOutOf100: 95, isCompliant: true, specialistNotesAr: 'مطابق للمواصفات السريرية، التعبئة في كراتين كبيرة تتطلب حيزاً تخزينياً إضافياً.', specialistNotesEn: 'Compliant product, larger case packaging requires bulk staging space.', evaluatedByStaffName: 'د. سارة المنصور (استشارية تمريض سريري)' }
    ],
    commercialEvaluationStatus: 'evaluated',
    commercialScore: 90,
    totalEvaluatedCostSar: 6612.5,
    normalizedUnitCostSummary: '2.30 ريال سعودي لكل حبة مفردة (SAR 2.30 / Each)',
    weightedTotalScore: 92.5,
    ranking: 2,
    isRecommendedForAward: false,
    recommendationRationale: 'عرض مطابق فَنياً ولكن التكلفة الإجمالية أعلى بنسبة 4.5% من العرض الفائز.'
  },
  {
    id: 'EVAL-042-C',
    sourcingEventId: 'SRC-2026-RFQ-01',
    supplierId: 'VEND-SA-4422',
    quotationId: 'QUOTE-2026-042-C',
    technicalEvaluationStatus: 'non_compliant',
    technicalScore: 20,
    technicalFindings: [
      { criterionId: 'CRIT-1', scoreOutOf100: 20, isCompliant: false, specialistNotesAr: 'مستبعد فَنياً لعدم وجود ترخيص SFDA للمنتج وعدم تأهيل المورد للفئة الطبية الجراحية.', specialistNotesEn: 'Disqualified: No SFDA clearance, vendor not qualified for surgical consumables (PROC09/16).', evaluatedByStaffName: 'لجنة الفحص الفني والتقييم' }
    ],
    commercialEvaluationStatus: 'disqualified',
    commercialScore: 0,
    totalEvaluatedCostSar: 5462.5,
    normalizedUnitCostSummary: 'مستبعد من المقارنة المالية (Disqualified)',
    weightedTotalScore: 0,
    ranking: 3,
    isRecommendedForAward: false,
    recommendationRationale: 'مستبعد نظامياً وفنياً قبل التقييم المالي.'
  }
];

export const INITIAL_AWARDS: AwardDecisionRecord[] = [
  {
    id: 'AWD-2026-042-1',
    sourcingEventId: 'SRC-2026-RFQ-01',
    winningSupplierId: 'VEND-SA-9021',
    winningQuotationId: 'QUOTE-2026-042-A',
    awardedLines: [
      {
        sourcingLineId: 'SRCL-042-1',
        quotationLineId: 'QL-042-A1',
        awardedQuantity: 50,
        awardedUnitPriceSar: 110.0,
        awardedTotalSar: 6325.0
      }
    ],
    totalAwardValueSar: 6325.0,
    authorizedByStaffId: 'STF-MGR-002',
    authorizedByStaffNameAr: 'سعد العريفي (مدير المشتريات)',
    decisionDate: '2026-09-20 14:30',
    awardJustificationAr: 'تمت الترسية على شركة الخليج للرعاية الطبية لحصولها على المركز الأول بالتقييم الفني (98%) وأفضل تكلفة إجمالية للوحدة (2.20 ريال/حبة).',
    awardJustificationEn: 'Awarded to Gulf Medical Supplies based on technical score (98%) and lowest evaluated unit cost per each.',
    status: 'formally_awarded',
    purchaseOrderGeneratedId: 'PO-PO-2026-MED-101'
  }
];

// ============================================================================
// 7. PURCHASE ORDERS (PO)
// Matches existing synthetic PO fixtures in mockSupplyChainOpsData.ts
// ============================================================================

export const INITIAL_PURCHASE_ORDERS_PROC: PurchaseOrder[] = [
  {
    id: 'PO-PO-2026-MED-101',
    poNumber: 'PO-2026-MED-101',
    revisionNumber: 0,
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية (Gulf Medical Supplies)',
    supplierNameEn: 'Gulf Medical Supplies & Care Co.',
    supplierTaxNumber: '300192847500003',
    supplierAddress: 'الرياض - طريق الملك فهد - حي الصحافة',
    sourceSourcingEventId: 'SRC-2026-RFQ-01',
    sourceAwardId: 'AWD-2026-042-1',
    documentStatus: 'approved',
    communicationStatus: 'acknowledged',
    fulfillmentStatus: 'partially_received',
    orderDate: '2026-09-12',
    expectedDeliveryDate: '2026-09-28',
    supplierConfirmedDeliveryDate: '2026-09-26',
    deliveryDestinationLocationId: 'LOC-WH-MAIN-DOCK',
    paymentTerms: 'Net 60 Days',
    deliveryTerms: 'DDP Hospital Central Warehouse Dock',
    currency: 'SAR',
    lines: [
      {
        id: 'POL-101-1',
        poId: 'PO-PO-2026-MED-101',
        lineNumber: 1,
        sourceRequisitionId: 'PR-2026-00101',
        sourceRequisitionLineId: 'PRL-00101-1',
        sourcingLineId: 'SRCL-042-1',
        catalogItemId: 'ITEM-MS-001',
        itemCode: 'CAN-IV-20G',
        itemDescriptionAr: 'قسطرة وريدية محيطية مقاس 20G معقمة (IV Cannula 20G)',
        itemDescriptionEn: 'IV Peripheral Cannula 20G sterile',
        orderedPackaging: 'علبة تحتوي 50 حبة (Box of 50 each)',
        orderedUom: 'box',
        originalOrderedQuantity: 200,
        revisedOrderedQuantity: 200,
        cancelledRemainingQuantity: 0,
        supplierAcknowledgedQuantity: 200,
        reportedShippedQuantity: 100, // Shipped via DN-GULF-88219
        physicallyReceivedQuantity: 100, // Logged at warehouse dock via RCV-2026-001
        qaAcceptedQuantity: 100,
        qaRejectedQuantity: 0,
        unitPriceSar: 110.0,
        applicableVatRatePercent: 15,
        netAmountSar: 22000.0,
        vatAmountSar: 3300.0,
        totalAmountSar: 25300.0,
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        requestedDeliveryDate: '2026-09-28',
        supplierConfirmedDeliveryDate: '2026-09-26',
        lineFulfillmentStatus: 'partially_received'
      }
    ],
    subtotalAmountSar: 22000.0,
    vatAmountSar: 3300.0,
    totalAmountSar: 25300.0,
    revisions: [],
    approvalRecord: {
      approvedByStaffName: 'سعد العريفي (مدير المشتريات)',
      approvedAt: '2026-09-13 10:30',
      approvalComments: 'معتمد نظامياً استناداً إلى محضر الترسية RFQ-2026-042.'
    },
    transmissionRecord: {
      transmittedAt: '2026-09-13 11:00',
      transmissionMethod: 'portal',
      transmittedByStaffName: 'فهد السبيعي (أخصائي مشتريات)'
    },
    acknowledgmentRecord: {
      acknowledgedAt: '2026-09-14 09:15',
      supplierContactName: 'أحمد بن فهد السديري',
      confirmedDeliveryDate: '2026-09-26',
      acknowledgmentNotes: 'تم تأكيد استلام أمر الشراء وجدولة الشحنة الأولى بموجب بوليصة DN-GULF-88219.'
    },
    notes: 'أمر شراء نشط تم استلام 100 علبة منه في المستودع بموجب سند الاستلام RCV-2026-001، ومتبقي 100 علبة.'
  },
  {
    id: 'PO-PO-2026-MED-102',
    poNumber: 'PO-2026-MED-102',
    revisionNumber: 0,
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-8812',
    supplierNameAr: 'باكستر للحلول الوريدية والتقنيات الصحية (Baxter Healthcare ME)',
    supplierNameEn: 'Baxter Healthcare Middle East',
    supplierTaxNumber: '310482910400003',
    supplierAddress: 'جدة - مجمع الأعمال الصحية',
    documentStatus: 'approved',
    communicationStatus: 'not_sent', // PROC19: Approved but not sent
    fulfillmentStatus: 'not_started',
    orderDate: '2026-09-18',
    expectedDeliveryDate: '2026-10-08',
    deliveryDestinationLocationId: 'LOC-WH-MAIN-DOCK',
    paymentTerms: 'Net 90 Days',
    deliveryTerms: 'DDP Hospital Warehouse Dock',
    currency: 'SAR',
    lines: [
      {
        id: 'POL-102-1',
        poId: 'PO-PO-2026-MED-102',
        lineNumber: 1,
        catalogItemId: 'ITEM-MS-002',
        itemCode: 'GLV-ST-75',
        itemDescriptionAr: 'قفازات جراحية معقمة مقاس 7.5 خالية من اللاتكس (علبة 50 زوج)',
        itemDescriptionEn: 'Latex-free sterile surgical gloves size 7.5',
        orderedPackaging: 'علبة تحتوي 50 زوج',
        orderedUom: 'box',
        originalOrderedQuantity: 300,
        revisedOrderedQuantity: 300,
        cancelledRemainingQuantity: 0,
        supplierAcknowledgedQuantity: 0,
        reportedShippedQuantity: 0,
        physicallyReceivedQuantity: 0,
        qaAcceptedQuantity: 0,
        qaRejectedQuantity: 0,
        unitPriceSar: 180.0,
        applicableVatRatePercent: 15,
        netAmountSar: 54000.0,
        vatAmountSar: 8100.0,
        totalAmountSar: 62100.0,
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        requestedDeliveryDate: '2026-10-08',
        lineFulfillmentStatus: 'open'
      }
    ],
    subtotalAmountSar: 54000.0,
    vatAmountSar: 8100.0,
    totalAmountSar: 62100.0,
    revisions: [],
    approvalRecord: {
      approvedByStaffName: 'د. فيصل الشهري (المدير المالي التنفيذي)',
      approvedAt: '2026-09-19 16:00',
      approvalComments: 'معتمد مالياً ومطابق للميزانية المخصصة للعمليات الجراحية (PROC19).'
    },
    notes: 'أمر الشراء معتمد مالياً وبانتظار الإرسال الرسمي للمورد (Approved but Not Sent).'
  },
  {
    id: 'PO-PO-2026-MED-103',
    poNumber: 'PO-2026-MED-103',
    revisionNumber: 0,
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية (Gulf Medical Supplies)',
    supplierNameEn: 'Gulf Medical Supplies & Care Co.',
    supplierTaxNumber: '300192847500003',
    supplierAddress: 'الرياض - طريق الملك فهد',
    documentStatus: 'approved',
    communicationStatus: 'simulated_sent', // PROC20: Sent but supplier not acknowledged
    fulfillmentStatus: 'not_started',
    orderDate: '2026-09-19',
    expectedDeliveryDate: '2026-10-02',
    deliveryDestinationLocationId: 'LOC-WH-MAIN-DOCK',
    paymentTerms: 'Net 60 Days',
    deliveryTerms: 'DDP Hospital Warehouse Dock',
    currency: 'SAR',
    lines: [
      {
        id: 'POL-103-1',
        poId: 'PO-PO-2026-MED-103',
        lineNumber: 1,
        catalogItemId: 'ITEM-MS-003',
        itemCode: 'MASK-SURG-3PLY',
        itemDescriptionAr: 'كمامة جراحية 3 طبقات مقاومة للسوائل Type IIR (علبة 50 حبة)',
        itemDescriptionEn: '3-Ply surgical mask fluid resistant Type IIR',
        orderedPackaging: 'علبة 50 حبة',
        orderedUom: 'box',
        originalOrderedQuantity: 100,
        revisedOrderedQuantity: 100,
        cancelledRemainingQuantity: 0,
        supplierAcknowledgedQuantity: 0,
        reportedShippedQuantity: 0,
        physicallyReceivedQuantity: 0,
        qaAcceptedQuantity: 0,
        qaRejectedQuantity: 0,
        unitPriceSar: 25.0,
        applicableVatRatePercent: 15,
        netAmountSar: 2500.0,
        vatAmountSar: 375.0,
        totalAmountSar: 2875.0,
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        requestedDeliveryDate: '2026-10-02',
        lineFulfillmentStatus: 'open'
      }
    ],
    subtotalAmountSar: 2500.0,
    vatAmountSar: 375.0,
    totalAmountSar: 2875.0,
    revisions: [],
    approvalRecord: {
      approvedByStaffName: 'سعد العريفي (مدير المشتريات)',
      approvedAt: '2026-09-19 11:00'
    },
    transmissionRecord: {
      transmittedAt: '2026-09-19 11:30',
      transmissionMethod: 'synthetic_email',
      transmittedByStaffName: 'فهد السبيعي (أخصائي مشتريات)'
    },
    notes: 'تم إرسال أمر الشراء إلى المورد وبانتظار إشعار التأكيد الرسمي لجدول التوريد (PROC20).'
  },
  {
    id: 'PO-PO-2026-MED-104',
    poNumber: 'PO-2026-MED-104',
    revisionNumber: 1,
    branchId: 'main_hospital',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية (Gulf Medical Supplies)',
    supplierNameEn: 'Gulf Medical Supplies & Care Co.',
    supplierTaxNumber: '300192847500003',
    supplierAddress: 'الرياض - طريق الملك فهد',
    documentStatus: 'approved',
    communicationStatus: 'acknowledged',
    fulfillmentStatus: 'fully_received',
    orderDate: '2026-08-10',
    expectedDeliveryDate: '2026-09-01',
    deliveryDestinationLocationId: 'LOC-WH-MAIN-DOCK',
    paymentTerms: 'Net 60 Days',
    deliveryTerms: 'DDP Hospital Warehouse Dock',
    currency: 'SAR',
    lines: [
      {
        id: 'POL-104-1',
        poId: 'PO-PO-2026-MED-104',
        lineNumber: 1,
        catalogItemId: 'ITEM-MS-004',
        itemCode: 'DRAIN-CHEST-28FR',
        itemDescriptionAr: 'أنبوب تفريغ الصدر الصدري 28FR معقم (طقم جراحي)',
        itemDescriptionEn: 'Chest Tube Thoracostomy Set 28FR',
        orderedPackaging: 'طقم معقم مفرد',
        orderedUom: 'box',
        originalOrderedQuantity: 50,
        revisedOrderedQuantity: 40, // Reduced from 50 to 40 after partial receipt of 40 (PROC25)
        cancelledRemainingQuantity: 10,
        supplierAcknowledgedQuantity: 40,
        reportedShippedQuantity: 40,
        physicallyReceivedQuantity: 40,
        qaAcceptedQuantity: 40,
        qaRejectedQuantity: 0,
        unitPriceSar: 450.0,
        applicableVatRatePercent: 15,
        netAmountSar: 18000.0,
        vatAmountSar: 2700.0,
        totalAmountSar: 20700.0,
        deliveryLocationId: 'LOC-WH-MAIN-DOCK',
        requestedDeliveryDate: '2026-09-01',
        lineFulfillmentStatus: 'fully_received'
      }
    ],
    subtotalAmountSar: 18000.0,
    vatAmountSar: 2700.0,
    totalAmountSar: 20700.0,
    revisions: [
      {
        revisionNumber: 1,
        amendmentReasonAr: 'إلغاء المتبقي من البند (10 أطقم) بناء على إشعار المورد بنفاد المخزون واكتفاء قسم الطوارئ بالكمية المستلمة (40 طقماً) (PROC25).',
        amendmentReasonEn: 'Cancelled remaining 10 units after supplier backorder notice; 40 units received and accepted.',
        requestedByStaffName: 'فهد السبيعي (أخصائي مشتريات)',
        approvedByStaffName: 'سعد العريفي (مدير المشتريات)',
        amendmentDate: '2026-09-15 11:00',
        previousTotalSar: 25875.0,
        revisedTotalSar: 20700.0,
        amendedLines: [
          { lineId: 'POL-104-1', oldQuantity: 50, newQuantity: 40, oldPriceSar: 450.0, newPriceSar: 450.0 }
        ]
      }
    ],
    notes: 'تم تعديل أمر الشراء بنجاح مع حماية الكمية المستلمة فعلياً في المستودع (40 طقماً) وإغلاق البند.'
  }
];

// ============================================================================
// 8. FRAMEWORK AGREEMENTS & CONTRACTS
// ============================================================================

export const INITIAL_FRAMEWORK_AGREEMENTS: FrameworkAgreement[] = [
  {
    id: 'LTA-2026-NUPCO-01',
    contractNumber: 'CNT-NUPCO-2026-PHARM-09',
    titleAr: 'اتفاقية الشراء الموحد نوبكو: المحاليل الوريدية الكبيرة والمغذيات الأساسية',
    titleEn: 'NUPCO Unified Agreement: Large Volume IV Fluids & Parenteral Solutions',
    agreementType: 'nupco_unified_tender',
    supplierId: 'VEND-SA-8812',
    supplierNameAr: 'باكستر للحلول الوريدية والتقنيات الصحية (Baxter Healthcare ME)',
    supplierNameEn: 'Baxter Healthcare Middle East',
    effectiveDate: '2026-01-01',
    expiryDate: '2027-12-31',
    isExpired: false,
    contractCeilingValueSar: 1200000.0,
    utilizedValueSar: 485000.0,
    remainingCeilingSar: 715000.0,
    contractOwnerStaffName: 'د. سمير البقمي (مدير تموين الصيدلة)',
    status: 'active',
    contractedItems: [
      { catalogItemId: 'ITEM-IV-001', itemCode: 'IV-NS-09-1000', itemDescriptionAr: 'محلول كلوريد الصوديوم 0.9% زجاجة 1000 مل', itemDescriptionEn: 'Sodium Chloride 0.9% 1000ml Infusion', contractedPackaging: 'كرتون 12 زجاجة', contractedUom: 'case', agreedUnitPriceSar: 48.0, standardLeadTimeDays: 5, minimumOrderQuantity: 50 },
      { catalogItemId: 'ITEM-IV-002', itemCode: 'IV-D5-1000', itemDescriptionAr: 'محلول دكستروز 5% زجاجة 1000 مل', itemDescriptionEn: 'Dextrose 5% 1000ml Infusion', contractedPackaging: 'كرتون 12 زجاجة', contractedUom: 'case', agreedUnitPriceSar: 52.0, standardLeadTimeDays: 5, minimumOrderQuantity: 50 }
    ],
    callOffOrdersCount: 8,
    notes: 'اتفاقية مركزية ملزمة لتوريد المحاليل الوريدية بأسعار ثابتة مدعومة من الشراء الموحد نوبكو.'
  },
  {
    id: 'LTA-2026-GULF-02',
    contractNumber: 'CNT-HOSP-2025-SURG-04',
    titleAr: 'عقد توريد طويل الأجل: المستلزمات الجراحية العامة والقفازات المعقمة',
    titleEn: 'Hospital LTA: Surgical Consumables & Sterile Surgical Gloves',
    agreementType: 'hospital_direct_lta',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية (Gulf Medical Supplies)',
    supplierNameEn: 'Gulf Medical Supplies & Care Co.',
    effectiveDate: '2025-10-01',
    expiryDate: '2026-10-31',
    isExpired: false,
    contractCeilingValueSar: 650000.0,
    utilizedValueSar: 580000.0,
    remainingCeilingSar: 70000.0,
    contractOwnerStaffName: 'سعد العريفي (مدير المشتريات)',
    status: 'approaching_expiry',
    contractedItems: [
      { catalogItemId: 'ITEM-MS-001', itemCode: 'CAN-IV-20G', itemDescriptionAr: 'قسطرة وريدية محيطية 20G', itemDescriptionEn: 'IV Cannula 20G', contractedPackaging: 'علبة 50 حبة', contractedUom: 'box', agreedUnitPriceSar: 110.0, standardLeadTimeDays: 3 },
      { catalogItemId: 'ITEM-MS-002', itemCode: 'GLV-ST-75', itemDescriptionAr: 'قفازات جراحية معقمة 7.5', itemDescriptionEn: 'Surgical Gloves 7.5', contractedPackaging: 'علبة 50 زوج', contractedUom: 'box', agreedUnitPriceSar: 180.0, standardLeadTimeDays: 3 }
    ],
    callOffOrdersCount: 14,
    notes: 'العقد شارف على انتهاء صلاحيته ويتبقى 70,000 ريال من السقف المالي. تجري دراسة التجديد السنوي.'
  }
];

// ============================================================================
// 9. SUPPLIER COMMERCIAL CLAIMS & RETURN TO VENDOR
// ============================================================================

export const INITIAL_SUPPLIER_CLAIMS: SupplierClaim[] = [
  {
    id: 'CLM-2026-001',
    claimNumber: 'CLM-2026-001',
    poId: 'PO-PO-2026-MED-101',
    poNumber: 'PO-2026-MED-101',
    supplierId: 'VEND-SA-9021',
    supplierNameAr: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    inventoryReceiptReferenceId: 'RCV-2026-001',
    quarantineRecordReferenceId: 'QUAR-LOT-GULF-2026-A',
    claimType: 'replacement_goods',
    status: 'supplier_acknowledged',
    claimDate: '2026-09-16',
    claimedLine: {
      itemCode: 'CAN-IV-20G',
      itemDescriptionAr: 'قسطرة وريدية محيطية 20G معقمة',
      lotNumber: 'LOT-GULF-4491-DMG',
      claimedQuantity: 20,
      claimedUom: 'box',
      estimatedValueSar: 2200.0
    },
    discrepancyReasonAr: 'وصول 20 علبة بتغليف تالف وكسر في حواجز الصمامات عند تفريغ شحنة الرصيف، تم عزلها في حجر المستودع بموجب سند الحجر (PROC24/26).',
    discrepancyReasonEn: '20 boxes received crushed with compromised sterile barrier; held in warehouse quarantine per inspection record.',
    supplierResponseNotes: 'أقر المورد بالمسؤولية وتعهد بشحن 20 علبة بديلة مجاناً مع الشحنة القادمة بموجب بوليصة تعويضية.',
    resolvedAt: undefined
  }
];

export const mockSupplierMasters = INITIAL_SUPPLIERS;
export const mockProcurementRequisitions = INITIAL_PURCHASE_REQUISITIONS;
export const mockSourcingEvents = INITIAL_SOURCING_EVENTS;
export const mockQuotations = INITIAL_QUOTATIONS;
export const mockBidEvaluations = INITIAL_BID_EVALUATIONS;
export const mockAwardRecords = INITIAL_AWARDS;
export const mockPurchaseOrders = INITIAL_PURCHASE_ORDERS_PROC;
export const mockFrameworkAgreements = INITIAL_FRAMEWORK_AGREEMENTS;
export const mockSupplierClaims = INITIAL_SUPPLIER_CLAIMS;

