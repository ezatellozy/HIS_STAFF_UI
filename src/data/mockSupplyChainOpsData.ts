import {
  ItemMasterRecord,
  StorageLocation,
  PhysicalStockBalance,
  SyntheticPurchaseOrder,
  GoodsReceiptRecord,
  DepartmentalRequisition,
  DepartmentParLevel,
  StockReservation,
  InterLocationTransfer,
  GeneralSupplyReturnRecord,
  SupplyRecallRecord,
  PhysicalCountPlan,
  AuditScenarioDefinition
} from '../types/supplyChainOps';

// ============================================================================
// 1. ENTERPRISE ITEM MASTER CATALOG (GENERAL MEDICAL / SURGICAL SUPPLIES)
// ============================================================================
export const initialCatalogItems: ItemMasterRecord[] = [
  {
    id: 'ITEM-MS-001',
    code: 'CAN-IV-20G',
    nameAr: 'قسطرة وريدية محيطية قياس 20G مع صمام حقن (IV Cannula Pink)',
    nameEn: 'Peripheral IV Catheter 20G with Injection Port (Pink)',
    category: 'catheters_tubing_iv',
    descriptionAr: 'قنية وريدية معقمة ومحمية ضد وخز الإبرة، للاستخدام الوريدي العام للبالغين.',
    descriptionEn: 'Safety peripheral IV catheter with blood control septum, single-use, sterile.',
    manufacturer: 'Becton Dickinson Medical',
    manufacturerRefNumber: 'BD-381434',
    gtin: '00382903814342',
    packaging: {
      baseUom: 'each',
      purchasingUom: 'case',
      issueUom: 'box',
      conversionFactor: 50,
      caseMultiplier: 10,
      verifiedDefinitionText: '1 صندوق = 50 حبة | 1 كرتون = 10 صناديق (500 حبة)'
    },
    isLotTracked: true,
    isSerialTracked: false,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: true,
    isHazardous: false,
    storageProfile: 'controlled_room_temp',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 4.5,
    safetyStockDays: 14
  },
  {
    id: 'ITEM-MS-002',
    code: 'CAN-IV-18G',
    nameAr: 'قسطرة وريدية محيطية سريعة قياس 18G خضراء (Green IV Cannula)',
    nameEn: 'Peripheral IV Catheter 18G High Flow (Green)',
    category: 'catheters_tubing_iv',
    descriptionAr: 'قنية وريدية عالية التدفق لحالات الطوارئ، الجراحة ونقل السوائل السريعة.',
    descriptionEn: '18G rapid flow IV catheter for trauma, emergency and surgical hydration.',
    manufacturer: 'Becton Dickinson Medical',
    manufacturerRefNumber: 'BD-381444',
    gtin: '00382903814441',
    packaging: {
      baseUom: 'each',
      purchasingUom: 'case',
      issueUom: 'box',
      conversionFactor: 50,
      caseMultiplier: 10,
      verifiedDefinitionText: '1 صندوق = 50 حبة | 1 كرتون = 10 صناديق (500 حبة)'
    },
    isLotTracked: true,
    isSerialTracked: false,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: true,
    isHazardous: false,
    storageProfile: 'controlled_room_temp',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 4.8,
    safetyStockDays: 14
  },
  {
    id: 'ITEM-MS-003',
    code: 'SOL-NS-500ML',
    nameAr: 'محلول ملحي نظامي كلوريد الصوديوم 0.9% 500 مل (Normal Saline Bags)',
    nameEn: 'Sodium Chloride 0.9% IV Infusion 500mL Flexible Bag',
    category: 'catheters_tubing_iv',
    descriptionAr: 'محلول كلوريد الصوديوم الفسيولوجي معقم غير مولد للحرارة في أكياس خالية من PVC.',
    descriptionEn: 'Sterile isotonic infusion solution in flexible PVC-free container.',
    manufacturer: 'Baxter Healthcare',
    manufacturerRefNumber: 'BAX-2B1323',
    gtin: '00308252213238',
    packaging: {
      baseUom: 'bottle',
      purchasingUom: 'carton',
      issueUom: 'carton',
      conversionFactor: 24,
      caseMultiplier: 1,
      verifiedDefinitionText: '1 كرتون = 24 كيس سعة 500 مل'
    },
    isLotTracked: true,
    isSerialTracked: false,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: true,
    isHazardous: false,
    storageProfile: 'controlled_room_temp',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 6.2,
    safetyStockDays: 21
  },
  {
    id: 'ITEM-MS-004',
    code: 'GLV-SURG-7.5',
    nameAr: 'قفازات جراحية معقمة خالية من البودرة قياس 7.5 (Surgical Gloves 7.5)',
    nameEn: 'Sterile Powder-Free Surgical Gloves Size 7.5',
    category: 'ppe_infection_control',
    descriptionAr: 'قفازات جراحية نسيجية عالية الحساسية للعمليات الجراحية المجهرية والدقيقة.',
    descriptionEn: 'Micro-textured synthetic polyisoprene surgical gloves, sterile pair.',
    manufacturer: 'Ansell Healthcare',
    manufacturerRefNumber: 'ANS-20275',
    gtin: '00764010202750',
    packaging: {
      baseUom: 'each',
      purchasingUom: 'case',
      issueUom: 'box',
      conversionFactor: 50,
      caseMultiplier: 4,
      verifiedDefinitionText: '1 صندوق = 50 زوج معقم | 1 كرتون = 200 زوج'
    },
    isLotTracked: true,
    isSerialTracked: false,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: true,
    isHazardous: false,
    storageProfile: 'controlled_room_temp',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 8.5,
    safetyStockDays: 30
  },
  {
    id: 'ITEM-MS-005',
    code: 'DRS-HYDRO-10X10',
    nameAr: 'ضماد غروي مائي معقم للجروح 10×10 سم (Hydrocolloid Dressing)',
    nameEn: 'Sterile Hydrocolloid Wound Dressing 10x10 cm',
    category: 'wound_care_dressings',
    descriptionAr: 'ضماد متقدم للجروح السطحية والقروح يحافظ على بيئة رطبة لالتئام الأنسجة.',
    descriptionEn: 'Adhesive hydrocolloid wound matrix for moderate exudate ulcer care.',
    manufacturer: 'Convatec Wound Care',
    manufacturerRefNumber: 'CON-187955',
    gtin: '00300451879552',
    packaging: {
      baseUom: 'each',
      purchasingUom: 'box',
      issueUom: 'box',
      conversionFactor: 10,
      caseMultiplier: 5,
      verifiedDefinitionText: '1 علبة = 10 ضمادات معقمة فردياً'
    },
    isLotTracked: true,
    isSerialTracked: false,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: true,
    isHazardous: false,
    storageProfile: 'controlled_room_temp',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 22.0,
    safetyStockDays: 20
  },
  {
    id: 'ITEM-MS-006',
    code: 'TUB-THOR-28FR',
    nameAr: 'أنبوب تفريغ صدري معقم قياس 28FR مع خط تباين شعاعي (Chest Tube)',
    nameEn: 'Thoracic Drainage Catheter 28FR with X-Ray Opaque Line',
    category: 'medical_surgical_consumables',
    descriptionAr: 'أنبوب صدري سيليكوني مع مؤشرات قياس للنزيف الصدري وحالات استرواح الصدر بالطوارئ.',
    descriptionEn: 'Straight thoracic drainage tube for pleural decompression and hemothorax.',
    manufacturer: 'Teleflex Medical',
    manufacturerRefNumber: 'TEL-12828',
    gtin: '00402241282801',
    packaging: {
      baseUom: 'each',
      purchasingUom: 'box',
      issueUom: 'each',
      conversionFactor: 10,
      caseMultiplier: 1,
      verifiedDefinitionText: '1 صندوق = 10 أنابيب معقمة فردياً'
    },
    isLotTracked: true,
    isSerialTracked: true,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: true,
    isHazardous: false,
    storageProfile: 'dry_ventilated',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 65.0,
    safetyStockDays: 10
  },
  {
    id: 'ITEM-MS-007',
    code: 'MSK-N95-RESP',
    nameAr: 'كمامة تنفسية عالية الكفاءة N95 معتمدة للرذاذ والعزل (N95 Particulate Respirator)',
    nameEn: 'N95 Particulate Surgical Respirator Healthcare Grade',
    category: 'ppe_infection_control',
    descriptionAr: 'كمامة حماية عزل للجهاز التنفسي مضادة للميكروبات متوافقة مع معايير NIOSH.',
    descriptionEn: 'Fluid-resistant healthcare respirator, NIOSH approved, cone style.',
    manufacturer: '3M Healthcare',
    manufacturerRefNumber: '3M-1860',
    gtin: '00511314971109',
    packaging: {
      baseUom: 'each',
      purchasingUom: 'case',
      issueUom: 'box',
      conversionFactor: 20,
      caseMultiplier: 6,
      verifiedDefinitionText: '1 علبة = 20 كمامة | 1 كرتون = 120 كمامة'
    },
    isLotTracked: true,
    isSerialTracked: false,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: false,
    isHazardous: false,
    storageProfile: 'controlled_room_temp',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 7.5,
    safetyStockDays: 45
  },
  {
    id: 'ITEM-MS-008',
    code: 'DIS-SURF-CAVIWIPES',
    nameAr: 'مناديل مطهرة للأسطح والمعدات الطبية واسعة الطيف (CaviWipes Canister)',
    nameEn: 'Hospital Surface Disinfectant Wipes Towelettes (160 ct)',
    category: 'disinfectants_chemicals',
    descriptionAr: 'مناديل مشبعة بمطهر واسع الطيف قاتل للبكتيريا والفيروسات المقاومة خلال 3 دقائق.',
    descriptionEn: 'Multi-purpose disinfectant cleaner towelettes for clinical non-porous surfaces.',
    manufacturer: 'Metrex Research',
    manufacturerRefNumber: 'MET-13-1100',
    gtin: '00044866011009',
    packaging: {
      baseUom: 'bottle',
      purchasingUom: 'case',
      issueUom: 'bottle',
      conversionFactor: 1,
      caseMultiplier: 12,
      verifiedDefinitionText: '1 عبوة اسطوانية = 160 منديل | 1 كرتون = 12 عبوة'
    },
    isLotTracked: true,
    isSerialTracked: false,
    isExpiryTracked: true,
    isLatexFree: true,
    isSterile: false,
    isHazardous: true,
    storageProfile: 'flammable_cabinet',
    owningModule: 'enterprise_inventory',
    isActive: true,
    standardCostSar: 38.0,
    safetyStockDays: 30
  }
];

// ============================================================================
// 2. STORAGE LOCATIONS ACROSS MAIN HOSPITAL & SATELLITE BRANCHES
// ============================================================================
export const initialStorageLocations: StorageLocation[] = [
  {
    id: 'LOC-WH-MAIN-DOCK',
    branchId: 'main_hospital',
    facilityNameAr: 'المستشفى الرئيسي التخصصي',
    facilityNameEn: 'Edina Main Tertiary Hospital',
    warehouseCode: 'CENTRAL-WH',
    warehouseNameAr: 'رصيف الاستلام والتفتيش المركزي',
    zone: 'Dock 01 Intake Bay',
    rack: 'Staging Floor',
    shelfBin: 'Bay A (Intake)',
    isStagingArea: true,
    gln: '6281000100018'
  },
  {
    id: 'LOC-WH-MAIN-AISLE-A1',
    branchId: 'main_hospital',
    facilityNameAr: 'المستشفى الرئيسي التخصصي',
    facilityNameEn: 'Edina Main Tertiary Hospital',
    warehouseCode: 'CENTRAL-WH',
    warehouseNameAr: 'المستودع العام الرئيسي',
    zone: 'Zone A - المستلزمات الوريدية والقساطر',
    rack: 'Rack 01',
    shelfBin: 'Bin A-12',
    gln: '6281000100025'
  },
  {
    id: 'LOC-WH-MAIN-AISLE-B3',
    branchId: 'main_hospital',
    facilityNameAr: 'المستشفى الرئيسي التخصصي',
    facilityNameEn: 'Edina Main Tertiary Hospital',
    warehouseCode: 'CENTRAL-WH',
    warehouseNameAr: 'المستودع العام الرئيسي',
    zone: 'Zone B - أدوات الوقاية ومكافحة العدوى',
    rack: 'Rack 03',
    shelfBin: 'Bin B-04',
    gln: '6281000100032'
  },
  {
    id: 'LOC-WH-MAIN-QUARANTINE',
    branchId: 'main_hospital',
    facilityNameAr: 'المستشفى الرئيسي التخصصي',
    facilityNameEn: 'Edina Main Tertiary Hospital',
    warehouseCode: 'CENTRAL-WH',
    warehouseNameAr: 'منطقة الحجر والتفتيش الفني',
    zone: 'Zone Q - حجر الجودة والاستدعاء',
    rack: 'Lock Cage 01',
    shelfBin: 'Bin Q-Locked',
    isQuarantineArea: true,
    gln: '6281000100049'
  },
  {
    id: 'LOC-WARD-4A-CLEAN',
    branchId: 'main_hospital',
    facilityNameAr: 'المستشفى الرئيسي التخصصي',
    facilityNameEn: 'Edina Main Tertiary Hospital',
    warehouseCode: 'WARD-STORES',
    warehouseNameAr: 'غرفة الإمداد النظيفة - تنويم باطنية رجال (Ward 4A)',
    zone: 'Floor 4 Inpatient Core',
    rack: 'Clean Utility Cart A',
    shelfBin: 'Shelf 02',
    isCleanUtility: true,
    departmentRef: 'Ward 4A'
  },
  {
    id: 'LOC-ER-RESUS-BAY',
    branchId: 'main_hospital',
    facilityNameAr: 'المستشفى الرئيسي التخصصي',
    facilityNameEn: 'Edina Main Tertiary Hospital',
    warehouseCode: 'ER-STORES',
    warehouseNameAr: 'كابينة مستلزمات طوارئ الإنعاش (ER Resuscitation Bay)',
    zone: 'Ground Floor Emergency Trauma',
    rack: 'Crash Supply Tower',
    shelfBin: 'Drawer 03',
    isCleanUtility: true,
    departmentRef: 'ER Emergency'
  },
  {
    id: 'LOC-BRANCH-SUBURBAN-STORE',
    branchId: 'suburban_clinic_branch',
    facilityNameAr: 'فرع مجمع عيادات الضواحي',
    facilityNameEn: 'Edina Suburban Outpatient Center',
    warehouseCode: 'BRANCH-WH',
    warehouseNameAr: 'مستودع فرع عيادات الضواحي',
    zone: 'Main Store Room',
    rack: 'Rack 01',
    shelfBin: 'Bin S-08',
    gln: '6281000200015'
  }
];

// ============================================================================
// 3. PHYSICAL STOCK BALANCES (MUTUALLY EXCLUSIVE PHYSICAL BUCKETS)
// ============================================================================
export const initialStockBalances: PhysicalStockBalance[] = [
  {
    id: 'BAL-001',
    itemId: 'ITEM-MS-001',
    locationId: 'LOC-WH-MAIN-AISLE-A1',
    lotNumber: 'LOT-BD-8842',
    expiryDate: '2027-08-31',
    receivedDate: '2026-03-10',
    physicalOnHand: 350,
    pendingInspection: 0,
    quarantined: 0,
    damaged: 0,
    expired: 0,
    pickedStaged: 50,
    pendingDisposal: 0,
    reservedCommitted: 60,
    availableForPicking: 240, // 350 - 50 (picked) - 60 (reserved) = 240
    inTransit: 0,
    quantityStatus: 'available',
    lastUpdatedTimestamp: '2026-09-20 09:30',
    dataSource: 'warehouse_realtime_sim'
  },
  {
    id: 'BAL-002',
    itemId: 'ITEM-MS-001',
    locationId: 'LOC-WH-MAIN-AISLE-A1',
    lotNumber: 'LOT-BD-8201-EXP',
    expiryDate: '2026-10-15', // Near expiry (less than 30 days)
    receivedDate: '2025-10-01',
    physicalOnHand: 80,
    pendingInspection: 0,
    quarantined: 0,
    damaged: 0,
    expired: 0,
    pickedStaged: 0,
    pendingDisposal: 0,
    reservedCommitted: 0,
    availableForPicking: 80, // Eligible for FEFO priority
    inTransit: 0,
    quantityStatus: 'available',
    lastUpdatedTimestamp: '2026-09-20 08:15',
    dataSource: 'warehouse_realtime_sim'
  },
  {
    id: 'BAL-003',
    itemId: 'ITEM-MS-001',
    locationId: 'LOC-WH-MAIN-QUARANTINE',
    lotNumber: 'LOT-BD-RECALL-99',
    expiryDate: '2027-01-31',
    receivedDate: '2026-07-15',
    physicalOnHand: 120,
    pendingInspection: 0,
    quarantined: 120, // Strict quarantine lock (Scenario I13 & I22)
    damaged: 0,
    expired: 0,
    pickedStaged: 0,
    pendingDisposal: 0,
    reservedCommitted: 0,
    availableForPicking: 0, // MUST BE ZERO
    inTransit: 0,
    quantityStatus: 'available',
    lastUpdatedTimestamp: '2026-09-20 07:00',
    dataSource: 'warehouse_realtime_sim'
  },
  {
    id: 'BAL-004',
    itemId: 'ITEM-MS-003',
    locationId: 'LOC-WH-MAIN-AISLE-A1',
    lotNumber: 'LOT-BAX-99410',
    expiryDate: '2027-12-31',
    receivedDate: '2026-04-12',
    physicalOnHand: 240, // 10 cartons of 24
    pendingInspection: 0,
    quarantined: 0,
    damaged: 0,
    expired: 0,
    pickedStaged: 0,
    pendingDisposal: 0,
    reservedCommitted: 48,
    availableForPicking: 192,
    inTransit: 0,
    quantityStatus: 'available',
    lastUpdatedTimestamp: '2026-09-20 09:10',
    dataSource: 'warehouse_realtime_sim'
  },
  {
    id: 'BAL-005',
    itemId: 'ITEM-MS-004',
    locationId: 'LOC-WH-MAIN-AISLE-B3',
    lotNumber: 'LOT-ANS-7731',
    expiryDate: '2028-05-30',
    receivedDate: '2026-06-01',
    physicalOnHand: 150,
    pendingInspection: 0,
    quarantined: 0,
    damaged: 0,
    expired: 0,
    pickedStaged: 0,
    pendingDisposal: 0,
    reservedCommitted: 0,
    availableForPicking: 150,
    inTransit: 0,
    quantityStatus: 'available',
    lastUpdatedTimestamp: '2026-09-20 06:45',
    dataSource: 'warehouse_realtime_sim'
  },
  {
    id: 'BAL-006',
    itemId: 'ITEM-MS-006',
    locationId: 'LOC-ER-RESUS-BAY',
    lotNumber: 'LOT-TEL-5501',
    serialNumber: 'SN-THOR-90412',
    expiryDate: '2028-02-28',
    receivedDate: '2026-08-10',
    physicalOnHand: 4,
    pendingInspection: 0,
    quarantined: 0,
    damaged: 0,
    expired: 0,
    pickedStaged: 0,
    pendingDisposal: 0,
    reservedCommitted: 0,
    availableForPicking: 4,
    inTransit: 0,
    quantityStatus: 'available',
    lastUpdatedTimestamp: '2026-09-20 08:00',
    dataSource: 'ward_par_sensor_sim'
  },
  {
    id: 'BAL-007',
    itemId: 'ITEM-MS-007',
    locationId: 'LOC-BRANCH-SUBURBAN-STORE',
    lotNumber: 'LOT-3M-44102',
    expiryDate: '2029-01-31',
    receivedDate: '2026-05-20',
    physicalOnHand: 180,
    pendingInspection: 0,
    quarantined: 0,
    damaged: 0,
    expired: 0,
    pickedStaged: 0,
    pendingDisposal: 0,
    reservedCommitted: 0,
    availableForPicking: 180, // Remote stock (Scenario I20)
    inTransit: 0,
    quantityStatus: 'available',
    lastUpdatedTimestamp: '2026-09-20 07:30',
    dataSource: 'warehouse_realtime_sim'
  },
  {
    id: 'BAL-008',
    itemId: 'ITEM-MS-005',
    locationId: 'LOC-WARD-4A-CLEAN',
    lotNumber: 'LOT-CON-3321',
    expiryDate: '2027-09-30',
    receivedDate: '2026-02-14',
    physicalOnHand: 12,
    pendingInspection: 0,
    quarantined: 0,
    damaged: 0,
    expired: 0,
    pickedStaged: 0,
    pendingDisposal: 0,
    reservedCommitted: 0,
    availableForPicking: 12,
    inTransit: 0,
    // Scenario I28: Stale data sensor drop simulation
    quantityStatus: 'stale',
    lastUpdatedTimestamp: '2026-09-18 14:00 (انقطع الاتصال بالحساس قبل 42 ساعة)',
    dataSource: 'stale_offline_snapshot'
  }
];

// ============================================================================
// 4. SYNTHETIC PURCHASE ORDERS & DOCK RECEIVING RECORDS
// ============================================================================
export const initialPurchaseOrders: SyntheticPurchaseOrder[] = [
  {
    poNumber: 'PO-2026-MED-101',
    vendorName: 'الشركة الخليجية للرعاية والتجهيزات الطبية (Gulf Medical Supplies)',
    vendorCode: 'VEND-SA-9021',
    orderDate: '2026-09-10',
    expectedDeliveryDate: '2026-09-20',
    status: 'partially_received',
    lines: [
      {
        lineId: 'POL-01',
        itemId: 'ITEM-MS-001',
        orderedQty: 200, // 4 boxes of 50
        uom: 'each',
        unitPriceSar: 4.5,
        receivedQtyTotal: 100, // 2 boxes received (Scenario I05)
        outstandingQty: 100
      },
      {
        lineId: 'POL-02',
        itemId: 'ITEM-MS-002',
        orderedQty: 150,
        uom: 'each',
        unitPriceSar: 4.8,
        receivedQtyTotal: 0,
        outstandingQty: 150
      },
      {
        lineId: 'POL-03',
        itemId: 'ITEM-MS-004',
        orderedQty: 100, // 2 boxes of 50 pairs
        uom: 'each',
        unitPriceSar: 8.5,
        receivedQtyTotal: 100,
        outstandingQty: 0
      }
    ]
  },
  {
    poNumber: 'PO-2026-MED-102',
    vendorName: 'باكستر للحلول الوريدية والتقنيات الصحية (Baxter Healthcare ME)',
    vendorCode: 'VEND-SA-8812',
    orderDate: '2026-09-12',
    expectedDeliveryDate: '2026-09-22',
    status: 'open',
    lines: [
      {
        lineId: 'POL-11',
        itemId: 'ITEM-MS-003',
        orderedQty: 120, // 5 cartons
        uom: 'bottle',
        unitPriceSar: 6.2,
        receivedQtyTotal: 0,
        outstandingQty: 120
      }
    ]
  }
];

export const initialGoodsReceipts: GoodsReceiptRecord[] = [
  {
    id: 'RCV-2026-0041',
    receiptReference: 'GRN-2026-09-101',
    poNumber: 'PO-2026-MED-101',
    supplierDeliveryNote: 'DN-GULF-88219',
    vendorName: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    receivingLocationId: 'LOC-WH-MAIN-DOCK',
    receivedAt: '2026-09-20 08:30',
    receiverName: 'فهد العتيبي (أمين مستودع الاستلام)',
    receiverAssignment: 'Warehouse Receiving Clerk',
    itemId: 'ITEM-MS-001',
    receivedQty: 100,
    uom: 'each',
    lotNumber: 'LOT-BD-90114',
    expiryDate: '2027-11-30',
    packageCondition: 'intact_sealed',
    inspectionStatus: 'accepted',
    acceptedQty: 100,
    quarantinedQty: 0,
    rejectedQty: 0,
    inspectionNotes: 'تم الفحص الظاهري، الأغلفة سليمة ومعقمة ومطابقة لشهادة التحليل الصادرة من المصنع.',
    putAwayStatus: 'staged_dock', // Scenario I11: Accepted but pending put-away
    assignedBinLocationId: 'LOC-WH-MAIN-AISLE-A1'
  },
  {
    id: 'RCV-2026-0042',
    receiptReference: 'GRN-2026-09-102',
    poNumber: 'PO-2026-MED-101',
    supplierDeliveryNote: 'DN-GULF-88220',
    vendorName: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    receivingLocationId: 'LOC-WH-MAIN-DOCK',
    receivedAt: '2026-09-20 09:00',
    receiverName: 'فهد العتيبي',
    receiverAssignment: 'Warehouse Receiving Clerk',
    itemId: 'ITEM-MS-002',
    receivedQty: 50,
    uom: 'each',
    lotNumber: 'LOT-BD-DAMAGED-1',
    expiryDate: '2027-10-31',
    packageCondition: 'crushed_compromised', // Scenario I08: Damaged packaging
    inspectionStatus: 'quarantined',
    acceptedQty: 0,
    quarantinedQty: 50,
    rejectedQty: 0,
    inspectionNotes: 'الصندوق الخارجي تعرض للبلل والدهس الجزئي أثناء الشحن؛ تم العزل الفوري بالحجر لمنع التلوث.',
    putAwayStatus: 'pending_putaway',
    assignedBinLocationId: 'LOC-WH-MAIN-QUARANTINE'
  },
  {
    id: 'RCV-2026-0043',
    receiptReference: 'GRN-2026-09-103',
    poNumber: 'PO-2026-MED-101',
    supplierDeliveryNote: 'DN-GULF-88221',
    vendorName: 'الشركة الخليجية للرعاية والتجهيزات الطبية',
    receivingLocationId: 'LOC-WH-MAIN-DOCK',
    receivedAt: '2026-09-20 09:15',
    receiverName: 'فهد العتيبي',
    receiverAssignment: 'Warehouse Receiving Clerk',
    itemId: 'ITEM-MS-004',
    receivedQty: 100,
    uom: 'each',
    lotNumber: '', // Scenario I07: Missing lot/expiry
    expiryDate: '',
    packageCondition: 'intact_sealed',
    inspectionStatus: 'received_uninspected', // Scenario I10: Pending inspection
    acceptedQty: 0,
    quarantinedQty: 0,
    rejectedQty: 0,
    inspectionNotes: 'تم الاستلام على الرصيف، بانتظار فحص ملصقات الدفعة والمطابقة الفنية.',
    putAwayStatus: 'pending_putaway'
  }
];

// ============================================================================
// 5. INTERNAL REQUISITIONS & DEPARTMENTAL PAR REPLENISHMENT
// ============================================================================
export const initialRequisitions: DepartmentalRequisition[] = [
  {
    id: 'REQ-2026-4401',
    requisitionNumber: 'REQ-W4A-0920-01',
    requestingDepartment: 'تنويم الباطنية والجراحة (Ward 4A)',
    destinationLocationId: 'LOC-WARD-4A-CLEAN',
    requestingActorName: 'سارة الدوسري (مشرفة تمريض الجناح)',
    requestingRole: 'Ward Charge Nurse',
    priority: 'routine', // Scenario I01
    clinicalPurpose: 'تجديد مخزون غرفة الإمداد النظيفة للجناح حسب معدل الاستهلاك الأسبوعي.',
    approvalStatus: 'approved',
    fulfillmentStatus: 'picking',
    approvedBy: 'د. خالد العمري (مدير الإمداد الطبي)',
    approvedAt: '2026-09-20 08:45',
    createdAt: '2026-09-20 08:00',
    lines: [
      {
        lineId: 'REQL-01',
        itemId: 'ITEM-MS-001',
        requestedQty: 50,
        uom: 'box', // UOM: Box (50 Each)
        allocatedQty: 50,
        pickedQty: 50,
        issuedQty: 0, // Scenario I15: Picked but not issued
        deliveredQty: 0,
        outstandingQty: 0
      },
      {
        lineId: 'REQL-02',
        itemId: 'ITEM-MS-003',
        requestedQty: 48,
        uom: 'bottle',
        allocatedQty: 24, // Scenario I14: Partial requisition fulfillment
        pickedQty: 24,
        issuedQty: 0,
        deliveredQty: 0,
        outstandingQty: 24,
        notes: 'المتوفر في المستودع حالياً تم تخصيصه، والمتبقي 24 عبوة مجدولة بأمر توريد وارد.'
      }
    ]
  },
  {
    id: 'REQ-2026-4402',
    requisitionNumber: 'REQ-ER-0920-STAT',
    requestingDepartment: 'قسم الحوادث والطوارئ والإنعاش (ER Resuscitation)',
    destinationLocationId: 'LOC-ER-RESUS-BAY',
    requestingActorName: 'تركي الحربي (منسق تمريض الطوارئ)',
    requestingRole: 'ER Nurse Coordinator',
    priority: 'urgent', // Scenario I02
    priorityJustification: 'حادث مروري جماعي متعدد الإصابات يستدعي إمداد فوري بأنابيب الصدر وقساطر الطوارئ.',
    clinicalPurpose: 'إمداد طارئ ومستعجل لغرفة الإنعاش بالحوادث.',
    approvalStatus: 'approved',
    fulfillmentStatus: 'dispatched', // Scenario I16: Issued & dispatched, awaiting ward receipt
    approvedBy: 'د. فيصل الشمري (المدير الطبي المناوب)',
    approvedAt: '2026-09-20 09:10',
    createdAt: '2026-09-20 09:05',
    lines: [
      {
        lineId: 'REQL-11',
        itemId: 'ITEM-MS-002',
        requestedQty: 40,
        uom: 'each',
        allocatedQty: 40,
        pickedQty: 40,
        issuedQty: 40,
        deliveredQty: 0,
        outstandingQty: 0
      },
      {
        lineId: 'REQL-12',
        itemId: 'ITEM-MS-006',
        requestedQty: 6,
        uom: 'each',
        allocatedQty: 6,
        pickedQty: 6,
        issuedQty: 6,
        deliveredQty: 0,
        outstandingQty: 0
      }
    ]
  }
];

export const initialStockReservations: StockReservation[] = [
  {
    id: 'RES-INIT-001',
    requisitionId: 'REQ-2026-4401',
    requisitionLineId: 'REQL-01',
    itemId: 'ITEM-MS-001',
    sourceLocationId: 'LOC-WH-MAIN-AISLE-A1',
    lotNumber: 'LOT-BD-8842',
    reservedQty: 50,
    pickedQty: 50,
    outstandingQty: 0,
    status: 'fully_picked',
    createdAt: '2026-09-20 08:45'
  },
  {
    id: 'RES-INIT-002',
    requisitionId: 'REQ-2026-4390-ICU',
    requisitionLineId: 'REQL-ICU-01',
    itemId: 'ITEM-MS-001',
    sourceLocationId: 'LOC-WH-MAIN-AISLE-A1',
    lotNumber: 'LOT-BD-8842',
    reservedQty: 60,
    pickedQty: 0,
    outstandingQty: 60,
    status: 'active',
    createdAt: '2026-09-20 08:30'
  },
  {
    id: 'RES-INIT-003',
    requisitionId: 'REQ-2026-4401',
    requisitionLineId: 'REQL-02',
    itemId: 'ITEM-MS-003',
    sourceLocationId: 'LOC-WH-MAIN-AISLE-A1',
    lotNumber: 'LOT-BX-9021',
    reservedQty: 24,
    pickedQty: 24,
    outstandingQty: 0,
    status: 'fully_picked',
    createdAt: '2026-09-20 08:45'
  }
];

export const initialParLevels: DepartmentParLevel[] = [
  {
    id: 'PAR-001',
    departmentId: 'DEPT-WARD-4A',
    departmentNameAr: 'تنويم باطنية رجال (Ward 4A)',
    locationId: 'LOC-WARD-4A-CLEAN',
    itemId: 'ITEM-MS-001',
    targetParQty: 100,
    minParQty: 40,
    maxParQty: 150,
    uom: 'each',
    currentAvailableQty: 25, // Below min!
    suggestedReorderQty: 75,
    reviewStatus: 'below_min_reorder',
    policyProfile: 'standard_weekly_replenish'
  },
  {
    id: 'PAR-002',
    departmentId: 'DEPT-WARD-4A',
    departmentNameAr: 'تنويم باطنية رجال (Ward 4A)',
    locationId: 'LOC-WARD-4A-CLEAN',
    itemId: 'ITEM-MS-003',
    targetParQty: 48,
    minParQty: 20,
    maxParQty: 72,
    uom: 'bottle',
    currentAvailableQty: 16, // Below min!
    suggestedReorderQty: 32,
    reviewStatus: 'below_min_reorder',
    policyProfile: 'standard_weekly_replenish'
  },
  {
    id: 'PAR-003',
    departmentId: 'DEPT-ER',
    departmentNameAr: 'طوارئ الإنعاش (ER Resuscitation)',
    locationId: 'LOC-ER-RESUS-BAY',
    itemId: 'ITEM-MS-006',
    targetParQty: 8,
    minParQty: 4,
    maxParQty: 12,
    uom: 'each',
    currentAvailableQty: 4,
    suggestedReorderQty: 4,
    reviewStatus: 'adequate',
    policyProfile: 'daily_automated_sweep'
  }
];

// ============================================================================
// 6. INTER-LOCATION TRANSFERS (MULTI-BRANCH ISOLATION)
// ============================================================================
export const initialTransfers: InterLocationTransfer[] = [
  {
    id: 'TRF-2026-0012',
    transferNumber: 'TRF-MAIN-TO-SUB-01',
    sourceLocationId: 'LOC-WH-MAIN-AISLE-B3',
    sourceBranch: 'main_hospital',
    destinationLocationId: 'LOC-BRANCH-SUBURBAN-STORE',
    destinationBranch: 'suburban_clinic_branch',
    status: 'in_transit', // Scenario I18: In transit, cannot be picked at either end
    priority: 'routine',
    carrierReference: 'MED-SHUTTLE-TRUCK-04',
    driverName: 'منصور الغامدي (سائق النقل الطبي المعتمد)',
    dispatchedAt: '2026-09-20 07:45',
    dispatchedBy: 'ماجد الشلهوب (مسؤول شحن المستودع)',
    notes: 'شحنة نقل مستلزمات وقاية دورية إلى مجمع عيادات الضواحي.',
    lines: [
      {
        lineId: 'TRFL-01',
        itemId: 'ITEM-MS-007',
        requestedQty: 60,
        dispatchedQty: 60,
        receivedQty: 0,
        damagedMissingQty: 0,
        uom: 'each',
        lotNumber: 'LOT-3M-44102'
      }
    ]
  },
  {
    id: 'TRF-2026-0013',
    transferNumber: 'TRF-MAIN-TO-SUB-02',
    sourceLocationId: 'LOC-WH-MAIN-AISLE-A1',
    sourceBranch: 'main_hospital',
    destinationLocationId: 'LOC-BRANCH-SUBURBAN-STORE',
    destinationBranch: 'suburban_clinic_branch',
    status: 'partially_received', // Scenario I19: 50 dispatched, 48 received, 2 damaged/missing
    priority: 'routine',
    carrierReference: 'MED-SHUTTLE-TRUCK-02',
    driverName: 'عبدالله الشهري',
    dispatchedAt: '2026-09-19 14:00',
    dispatchedBy: 'ماجد الشلهوب',
    receivedAt: '2026-09-19 16:30',
    receivedBy: 'ريم القحطاني (مستودع فرع الضواحي)',
    discrepancyReason: 'تم استلام 48 عبوة سليمة، وعبوتان تلفتا نتيجة سقوط الكرتون أثناء تفريغ الشاحنة.',
    unresolvedVarianceCount: 2,
    notes: 'تم توثيق محضر التلف للعبوتين لحين قرار التسوية المحاسبية.',
    lines: [
      {
        lineId: 'TRFL-11',
        itemId: 'ITEM-MS-001',
        requestedQty: 50,
        dispatchedQty: 50,
        receivedQty: 48,
        damagedMissingQty: 2,
        uom: 'each',
        lotNumber: 'LOT-BD-8842'
      }
    ]
  }
];

// ============================================================================
// 7. RETURNS, QUALITY HOLDS, RECALLS & DISPOSAL
// ============================================================================
export const initialReturns: GeneralSupplyReturnRecord[] = [
  {
    id: 'RET-2026-0033',
    returnNumber: 'RET-W4A-0920-A',
    originDepartment: 'تنويم الباطنية (Ward 4A)',
    destinationStoreId: 'LOC-WH-MAIN-DOCK',
    itemId: 'ITEM-MS-005',
    quantityReturned: 5,
    uom: 'box',
    lotNumber: 'LOT-CON-3321',
    returnReason: 'excess_ward_stock',
    packageIntegrity: 'intact_sealed',
    inspectionStatus: 'received_pending_qa', // Scenario I23: Return pending inspection
    disposition: 'pending_inspection',
    dispositionNotes: 'تم استلام الصناديق على طاولة المرتجعات، بانتظار فحص الختم المعقم قبل إعادتها للرف النشط.'
  }
];

export const initialRecalls: SupplyRecallRecord[] = [
  {
    id: 'REC-2026-SFDA-04',
    recallReference: 'SFDA-MDR-2026-0941',
    initiatingAgency: 'الهيئة العامة للغذاء والدواء (SFDA Safety Alert)',
    alertDate: '2026-09-18',
    itemId: 'ITEM-MS-001',
    affectedLotNumbers: ['LOT-BD-RECALL-99'],
    recallReasonAr: 'اشتباه بخلل في لحام صمام الحقن لدفعة تصنيع محددة قد يؤدي لتسريب أثناء الحقن الوريدي.',
    recallReasonEn: 'Suspected micro-leakage in injection port valve in specific production batch.',
    severity: 'class_2_urgent',
    notificationStatus: 'quarantine_in_progress', // Scenario I22
    totalUnitsLocated: 140,
    totalUnitsQuarantined: 120, // 120 in warehouse locked; 20 in Ward 4A undergoing sweep
    affectedLocations: [
      {
        locationId: 'LOC-WH-MAIN-QUARANTINE',
        locationName: 'المستودع الرئيسي - قفص الحجر Q-Locked',
        acknowledged: true,
        unitsFound: 120,
        unitsQuarantined: 120
      },
      {
        locationId: 'LOC-WARD-4A-CLEAN',
        locationName: 'جناح التنويم 4A - غرفة الإمداد',
        acknowledged: true,
        unitsFound: 20,
        unitsQuarantined: 0 // Sweep in progress
      }
    ],
    closureNotes: 'تم حجر مخزون المستودع، وجاري جمع الوحدات المتبقية في الأجنحة.'
  }
];

export const initialCountPlans: PhysicalCountPlan[] = [
  {
    id: 'COUNT-2026-Q3-01',
    planNameAr: 'الجرد الدوري للربع الثالث - المستلزمات الوريدية عالية الحركة',
    planNameEn: 'Q3 Cyclic Inventory Count - High Velocity IV Lines',
    countType: 'abc_high_value_cycle',
    targetWarehouseId: 'LOC-WH-MAIN-AISLE-A1',
    status: 'reconciling_variances',
    createdAt: '2026-09-19',
    lines: [
      {
        lineId: 'CL-01',
        itemId: 'ITEM-MS-001',
        locationId: 'LOC-WH-MAIN-AISLE-A1',
        lotNumber: 'LOT-BD-8842',
        bookQuantity: 350,
        blindCountedQty: 342, // Scenario I25: Physical count discrepancy (-8 units)
        varianceQty: -8,
        varianceReason: 'فارق 8 حبات؛ يُرجح صرفها لقسم الطوارئ دون تسجيل تذكرة الإمداد الفوري بالنظام.',
        recountRequested: true,
        adjustmentStatus: 'variance_identified',
        countedBy: 'سعد المنصور (مدقق الجرد الداخلي)',
        countedAt: '2026-09-20 08:10'
      },
      {
        lineId: 'CL-02',
        itemId: 'ITEM-MS-003',
        locationId: 'LOC-WH-MAIN-AISLE-A1',
        lotNumber: 'LOT-BAX-99410',
        bookQuantity: 240,
        blindCountedQty: 240,
        varianceQty: 0,
        recountRequested: false,
        adjustmentStatus: 'approved_pending_action',
        countedBy: 'سعد المنصور',
        countedAt: '2026-09-20 08:30'
      }
    ]
  }
];

// ============================================================================
// 8. CANONICAL AUDIT SCENARIOS CATALOG (I01 - I30)
// ============================================================================
export const AUDIT_SCENARIOS_CATALOG: AuditScenarioDefinition[] = [
  {
    id: 'I01',
    titleAr: 'طلب مخزون روتيني لجناح تنويم (Routine Departmental Stock Request)',
    titleEn: 'Routine departmental stock request',
    actor: 'مشرفة تمريض الجناح (Ward Charge Nurse)',
    startingTab: 'requisitions',
    precondition: 'مخزون القساطر والمحاليل في جناح 4A أقل من مستوى البار المحدد.',
    expectedBehavior: 'إنشاء طلب إمداد روتيني، مراجعة الرصيد المتاح، والتأكيد دون اشتراط تشخيص مرضي سريري للمريض.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I02',
    titleAr: 'طلب مخزون عاجل لقسم الطوارئ والإنعاش (Urgent Departmental Stock Request)',
    titleEn: 'Urgent departmental stock request',
    actor: 'منسق طوارئ الإنعاش (ER Resuscitation Coordinator)',
    startingTab: 'requisitions',
    precondition: 'استهلاك حاد لأنابيب الصدر 28FR وقساطر 18G نتيجة إصابات حرجة متعددة.',
    expectedBehavior: 'تمييز الطلب بوسم "عاجل"، إبراز تبرير الأولوية، وإرساله لأعلى طابور التجهيز السريع بالمستودع.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I03',
    titleAr: 'طلب صنف غير مدرج بدليل المواد العام (Item Absent from Catalog)',
    titleEn: 'Item absent from catalog',
    actor: 'مسؤول المشتريات والمستودع (Purchasing & Stores Officer)',
    startingTab: 'catalog',
    precondition: 'محاولة البحث عن مستلزم طبي أو غرسة غير مسجلة في دليل المواد العام.',
    expectedBehavior: 'إظهار رسالة واضحة "الصنف غير معتمد بدليل المواد العام" مع إرشاد لطلب التأهيل والتوصيف الفني.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'BOUNDARY_ISOLATION'
  },
  {
    id: 'I04',
    titleAr: 'عدم تطابق وحدات القياس والتعبئة (Product/Package/UOM Mismatch)',
    titleEn: 'Product/package/UOM mismatch',
    actor: 'أمين مستودع الاستلام (Receiving Clerk)',
    startingTab: 'receiving',
    precondition: 'أمر الشراء مسجل بـ "كرتون 500 حبة" بينما إشعار التوريد مسجل بـ "10 صناديق".',
    expectedBehavior: 'عرض معامل التحويل الدقيق والتحقق من التكافؤ (1 كرتون = 10 صناديق = 500 حبة) ومنع الخلط الحسابي.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I05',
    titleAr: 'استلام جزئي لسطور أمر الشراء (Purchase Order Partially Received)',
    titleEn: 'Purchase order partially received',
    actor: 'أمين مستودع الاستلام (Receiving Clerk)',
    startingTab: 'receiving',
    precondition: 'أمر الشراء PO-2026-MED-101 يطلب 200 قنية والمورد ورّد 100 فقط.',
    expectedBehavior: 'توثيق استلام 100، بقاء 100 ككمية معلقة (Outstanding)، وتحديث حالة أمر الشراء إلى "استلام جزئي".',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I06',
    titleAr: 'استلام شحنة تحوي صنفاً غير مدرج بأمر الشراء (Receipt with Unexpected Item)',
    titleEn: 'Receipt with unexpected item',
    actor: 'فاحص استلام الرصيف (Dock Inspector)',
    startingTab: 'receiving',
    precondition: 'وجود صناديق مستلزمات جراحية إضافية داخل الشاحنة غير مدرجة في بوليصة الشحن.',
    expectedBehavior: 'منع الإدخال التلقائي للمخزون النشط، وتوجيه الصنف إلى "حجر المواد غير المعنونة" لحين استيضاح المورد.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I07',
    titleAr: 'استلام مستلزم برقم تشغيلة أو تاريخ صلاحية مفقود (Missing Lot or Expiry)',
    titleEn: 'Receipt with missing lot or expiry',
    actor: 'مفتش الجودة بالمستودع (QA Inspector)',
    startingTab: 'receiving',
    precondition: 'توريد مستلزم معقم يفتقر إلى تاريخ الصلاحية ورقم التشغيلة على الغلاف.',
    expectedBehavior: 'حظر قبول الاستلام للأصناف المتطلبة للصلاحية، وقفل الإدخال، وعزل الشحنة تحت "حجر نقص البيانات".',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I08',
    titleAr: 'استلام طرد بغلاف خارجي تالف أو مبلل (Receipt with Damaged Packaging)',
    titleEn: 'Receipt with damaged packaging',
    actor: 'أمين مستودع الاستلام (Receiving Clerk)',
    startingTab: 'receiving',
    precondition: 'كرتون قساطر 18G مدهوس ومبلل جزئياً أثناء النقل.',
    expectedBehavior: 'توثيق حالة التلف، وتحويل الكمية المتأثرة فوراً إلى الحجر الفني لمنع إتاحتها للصرف.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I09',
    titleAr: 'انحراف حراري أثناء توريد صنف حساس للتبريد (Cold-Chain Excursion on Receipt)',
    titleEn: 'Cold-chain excursion on receipt',
    actor: 'مفتش الرصيف المبرد (Cold Storage Inspector)',
    startingTab: 'receiving',
    precondition: 'مؤشر الحرارة في صندوق المواد المعقمة الحساسة يشير لتجاوز النطاق المحدد.',
    expectedBehavior: 'وضع علامة تنبيه انحراف حراري، وحجز الشحنة بحجر الجودة دون إدخالها للثلاجة النشطة قبل تقييم الثبات.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I10',
    titleAr: 'بضاعة مستلمة على الرصيف بانتظار التفتيش (Receipt Pending Inspection)',
    titleEn: 'Receipt pending inspection',
    actor: 'أمين المستودع (Warehouse Clerk)',
    startingTab: 'receiving',
    precondition: 'وصول 100 قفاز جراحي وتفريغها على رصيف الشحن دون استكمال الفحص الفني.',
    expectedBehavior: 'ظهور الحالة "بانتظار الفحص"، وحجب الكمية تماماً من خوارزميات الصرف والتجهيز للأجنحة.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I11',
    titleAr: 'شحنة مقبولة فحصاً بانتظار النقل والتخزين على الرف (Accepted Pending Put-away)',
    titleEn: 'Accepted receipt pending put-away',
    actor: 'عامل التخزين الداخلي (Put-away Stager)',
    startingTab: 'receiving',
    precondition: 'اجتياز الفحص بنجاح ولكن الصناديق لا تزال في منطقة التجهيز بالرصيف.',
    expectedBehavior: 'ظهور الصنف كـ "مقبول في الرصيف"، وعدم ظهوره على الرف النهائي (Bin A-12) إلا بعد تأكيد مهمة التخزين.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I12',
    titleAr: 'الاستعلام عن الرصيد المتاح في موقع تخزين محدد (Available Stock at One Location)',
    titleEn: 'Available stock at one location',
    actor: 'منسق إمداد الأجنحة (Ward Supply Coordinator)',
    startingTab: 'stock_locations',
    precondition: 'البحث عن القسطرة 20G عبر كافة أقسام ومستودعات المستشفى.',
    expectedBehavior: 'عرض تفصيلي دقيق للأرصدة: المستودع العام (240)، جناح 4A (25)، وحجر الجودة (120 محجورة غير متاحة).',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I13',
    titleAr: 'عزل المخزون المحجور وعدم إتاحته للصرف (Stock Quarantined and Unavailable)',
    titleEn: 'Stock quarantined and unavailable',
    actor: 'مسؤول مراقبة المخزون (Inventory Controller)',
    startingTab: 'stock_locations',
    precondition: 'وجود 120 وحدة من التشغيلة LOT-BD-RECALL-99 في قفص الحجر.',
    expectedBehavior: 'ظهور الرصيد الفيزيائي = 120، بينما الرصيد المتاح للصرف = 0 تماماً وبشكل قاطع.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I14',
    titleAr: 'تلبية جزئية لطلب إمداد ونقل المتبقي لقائمة الانتظار (Partial Requisition Fulfillment)',
    titleEn: 'Partial requisition fulfillment',
    actor: 'أمين تجهيز الطلبات (Order Picker)',
    startingTab: 'requisitions',
    precondition: 'جناح 4A طلب 48 عبوة محلول ملحي، والمتوفر للتحضير 24 عبوة فقط.',
    expectedBehavior: 'صرف 24 عبوة، وتوثيق 24 عبوة متبقية كـ Backorder دون إغلاق الطلب كاملاً.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I15',
    titleAr: 'تجهيز الصنف على عربة النقل قبل اعتماده كصرف فعلي (Picked but Not Issued)',
    titleEn: 'Picked but not issued',
    actor: 'أمين التجهيز والتعبئة (Packing Lead)',
    startingTab: 'picking_dispatch',
    precondition: 'تم سحب 50 قسطرة من الرف ووضعها في صندوق التوزيع بانتظار سائق النقل الداخلي.',
    expectedBehavior: 'حالة الصنف "مجهز بانتظار الصرف"، وحظر صرفه أو إعادة سحبه لطلب آخر.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I16',
    titleAr: 'صرف الشحنة مع الناقل بانتظار استلام الجناح (Issued but Not Acknowledged)',
    titleEn: 'Issued but not acknowledged',
    actor: 'سائق التوصيل الداخلي (Hospital Courier)',
    startingTab: 'picking_dispatch',
    precondition: 'خروج عربة الإمدادات من المستودع باتجاه طوارئ الإنعاش.',
    expectedBehavior: 'تسجيل الحالة "تم الصرف - جاري التوصيل"، وعدم احتسابها كمخزون مستقر في رصيد الطوارئ حتى التوقيع.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I17',
    titleAr: 'طلب نقل مخزون بين الفروع بانتظار الشحن (Transfer Requested but Not Dispatched)',
    titleEn: 'Transfer requested but not dispatched',
    actor: 'منسق النقل والإمداد (Logistics Coordinator)',
    startingTab: 'transfers',
    precondition: 'فرع عيادات الضواحي يطلب كمامات N95 من المستشفى الرئيسي.',
    expectedBehavior: 'حجز الكمية في مستودع المصدر، وظهور أمر النقل كـ "معتمد بانتظار التجهيز والشحن".',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I18',
    titleAr: 'شحنة نقل بين الفروع على الطريق (Transfer in Transit)',
    titleEn: 'Transfer in transit',
    actor: 'سائق سيارة النقل الطبي (Medical Shuttle Driver)',
    startingTab: 'transfers',
    precondition: 'تحرك الشاحنة TRF-2026-0012 حاملة 60 كمامة على الطريق السريع.',
    expectedBehavior: 'تحديد الشحنة بوضوح كـ "في الطريق" وعدم ظهورها كرصيد محلي متاح في أي من الفرعين.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I19',
    titleAr: 'استلام جزئي لشحنة منقولة مع تلف وحدتين (Transfer Partially Received)',
    titleEn: 'Transfer partially received',
    actor: 'أمين مستودع الفرع المستلم (Branch Storekeeper)',
    startingTab: 'transfers',
    precondition: 'شحن 50 قسطرة، واستلام 48 سليمة وتلف عبوتين أثناء النقل.',
    expectedBehavior: 'استلام 48 في الرصيد المتاح، وبقاء الوحدتين التالفتين كفارق غير محلول موثق بالمحضر.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I20',
    titleAr: 'عدم توفر الصنف محلياً وتوفره بفرع آخر (Remote Branch Stock Unavailable Locally)',
    titleEn: 'Remote branch stock unavailable locally',
    actor: 'طبيب أو ممرض الطوارئ (Clinical Requester)',
    startingTab: 'stock_locations',
    precondition: 'رصيد الكمامات N95 صفر في عيادة معينة بينما يتوفر 180 في فرع الضواحي.',
    expectedBehavior: 'عرض رصيد الفرع البعيد مع إشارة واضحة تفيد بعدم إمكانية الصرف الفوري المباشر منه دون طلب نقل.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'BOUNDARY_ISOLATION'
  },
  {
    id: 'I21',
    titleAr: 'إدارة الصلاحيات وقاعدة الصرف الأقرب انتهاءً (Expiring Stock & FEFO Logic)',
    titleEn: 'Expiring stock and FEFO',
    actor: 'أمين تجهيز الطلبات (Warehouse Order Picker)',
    startingTab: 'picking_dispatch',
    precondition: 'وجود تشغيلتين على الرف: دفعة تنتهي بعد 25 يوماً ودفعة تنتهي بعد عامين.',
    expectedBehavior: 'توجيه النظام إجبارياً لسحب الدفعة الأقرب انتهاءً أولاً (FEFO) وإصدار تنبيه حال محاولة تجاوزها.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I22',
    titleAr: 'استدعاء وسحب منتج معيب عبر كافة المواقع (Product Recall Across Multiple Locations)',
    titleEn: 'Product recall across multiple locations',
    actor: 'مدير الجودة وسلاسل الإمداد (Quality & Supply Director)',
    startingTab: 'returns_quality',
    precondition: 'صدور تعميم من الهيئة العامة للغذاء والدواء بسحب دفعة LOT-BD-RECALL-99.',
    expectedBehavior: 'بث أمر حظر فوري، قفل الرصيد في المستودع الرئيسي والأجنحة، ومتابعة نسبة الحجر الميداني.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I23',
    titleAr: 'إرجاع مستلزم من الجناح بانتظار التفتيش (Return Pending Inspection)',
    titleEn: 'Return pending inspection',
    actor: 'فاحص المرتجعات بالمستودع (Returns QA Inspector)',
    startingTab: 'returns_quality',
    precondition: 'إرجاع 5 علب ضمادات مائية غير مستخدمة من جناح 4A.',
    expectedBehavior: 'استلام الصناديق بحالة "بانتظار الفحص"، وعدم إعادتها للرصيد المتاح إلا بعد التأكد من سلامة الغلاف المعقم.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I24',
    titleAr: 'إتلاف مستلزمات منتهية الصلاحية أو تالفة (Damaged/Expired Stock Disposal)',
    titleEn: 'Damaged/expired stock disposal',
    actor: 'مسؤول السلامة والبيئة والمستودع (EHS & Stores Lead)',
    startingTab: 'returns_quality',
    precondition: 'مستلزمات منتهية الصلاحية معزولة تقرر إتلافها نظامياً.',
    expectedBehavior: 'توثيق قرار الإتلاف، تحديد طريقة التخلص الآمن، وتوثيق توقيع الشاهد ورقم المحضر.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I25',
    titleAr: 'تسجيل فروقات الجرد الدوري الفعلي (Physical Count Discrepancy)',
    titleEn: 'Physical count discrepancy',
    actor: 'مدقق الجرد الداخلي (Internal Inventory Auditor)',
    startingTab: 'counts_reconciliation',
    precondition: 'الرصيد الدفتري 350 قسطرة والرصيد الفعلي المعدود على الرف 342 (عجز 8 وحدات).',
    expectedBehavior: 'تسجيل الفارق، طلب إعادة العد، وتجميد التعديل الدفتري لحين موافقة الإدارة دون تغيير عشوائي للرصيد.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I26',
    titleAr: 'مرجع أصناف الأمانة وغرسات العمليات (Consignment Item Ownership Reference)',
    titleEn: 'Consignment item ownership',
    actor: 'منسق مستلزمات العمليات (OR Materials Coordinator)',
    startingTab: 'catalog',
    precondition: 'الاستعلام عن غرسة صمام قلب أو مفصل جراحي مملوك للمورد كأمانة (Consignment).',
    expectedBehavior: 'عرض تصنيف الصنف كـ "مرجع أمانة - ملكية مورد"، مع بيان أن دورة الشراء والفوترة مؤجلة للمرحلة الثانية.',
    coverageStatus: 'OPTIONAL_DEFERRED',
    executionCategory: 'BOUNDARY_ISOLATION'
  },
  {
    id: 'I27',
    titleAr: 'التبديل بين أدوار ومسؤوليات موظفي الإمداد (Multiple Staff Roles & Assignments)',
    titleEn: 'Multiple staff roles and assignments',
    actor: 'مشرف الإمداد والمستودعات (Supply Chain Supervisor)',
    startingTab: 'overview',
    precondition: 'موظف يجمع بين مهام أمين المستودع وفاحص استلام الرصيف.',
    expectedBehavior: 'إتاحة تبديل الدور النشط بسلاسة لتكييف المهام وقوائم العمل دون الادعاء بمنح أذونات إنتاجية غير حقيقية.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'OPERATIONAL_FLOW'
  },
  {
    id: 'I28',
    titleAr: 'التعامل مع بيانات الأرصدة غير المكتملة أو غير المحدثة (Missing, Partial or Stale Stock Data)',
    titleEn: 'Missing, partial or stale stock data',
    actor: 'ممرض أو مسؤول إمداد (Supply User)',
    startingTab: 'stock_locations',
    precondition: 'انقطاع الاتصال بحساس خزانة الإمداد في جناح 4A لأكثر من 40 ساعة.',
    expectedBehavior: 'تمييز البيانات بوسم "بيانات غير محدثة - Stale Snapshot"، ومنع افتراض الرصيد صفراً أو آمناً.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'SAFETY_ASSERTION'
  },
  {
    id: 'I29',
    titleAr: 'إبراز شريط المعاينة التصميمية التوليدية بوضوح (Clearly Labeled Synthetic Design Preview)',
    titleEn: 'Clearly labeled synthetic Design Preview',
    actor: 'أي مستخدم للمنظومة (System User / Auditor)',
    startingTab: 'overview',
    precondition: 'فتح شاشات إدارة سلاسل الإمداد والمواد في أي وقت.',
    expectedBehavior: 'عرض شريط تنبيهي دائم وثابت: "معاينة تصميمية ونموذج محاكاة تجريبي - لا توجد بيانات مخزون حقيقية".',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'BOUNDARY_ISOLATION'
  },
  {
    id: 'I30',
    titleAr: 'حفظ واستقلالية حدود الصيدلية وبنك الدم والمختبر (Preserving Clinical Module Boundaries)',
    titleEn: 'Pharmacy, Blood Bank, Lab, CSSD and Clinical Core boundaries preserved',
    actor: 'الفريق الطبي والإداري المتكامل (Multidisciplinary Team)',
    startingTab: 'overview',
    precondition: 'صرف المستلزمات الطبية العامة من المستودع مقابل صرف الأدوية ووحدات الدم.',
    expectedBehavior: 'المستودع يتولى اللوجستيات العامة فقط، دون التدخل في صرف الأدوية بالصيدلية أو التوافق ببنك الدم أو إعطاء المريض.',
    coverageStatus: 'FULLY_COVERED',
    executionCategory: 'BOUNDARY_ISOLATION'
  }
];

// Uppercase aliases for component imports
export const INITIAL_ITEM_MASTER = initialCatalogItems;
export const mockItemMasterCatalog = initialCatalogItems;
export const INITIAL_STORAGE_LOCATIONS = initialStorageLocations;
export const INITIAL_STOCK_BALANCES = initialStockBalances;
export const INITIAL_PURCHASE_ORDERS = initialPurchaseOrders;
export const INITIAL_GOODS_RECEIPTS = initialGoodsReceipts;
export const INITIAL_REQUISITIONS = initialRequisitions;
export const INITIAL_TRANSFERS = initialTransfers;
export const INITIAL_RECALLS = initialRecalls;
export const INITIAL_CYCLE_COUNT_BATCHES = initialCountPlans;
export const INITIAL_DEPARTMENT_PAR_LEVELS = initialParLevels;
export const INITIAL_STOCK_RESERVATIONS = initialStockReservations;
export const AUDIT_SCENARIO_CATALOG = AUDIT_SCENARIOS_CATALOG;

