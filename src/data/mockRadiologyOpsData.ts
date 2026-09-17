// ============================================================================
// MOCK DATA FOR RADIOLOGY & IMAGING OPERATIONS UX (PROTOTYPE ONLY)
// Adheres strictly to boundaries: Mock Data, Mock Devices, Mock Studies
// ============================================================================

import {
  ImagingCatalogItem,
  IncomingImagingRequest,
  ImagingAppointment,
  ImagingProtocol,
  MriSafetyScreening,
  ContrastSafetyContext,
  PregnancySafetyContext,
  ArrivalPreparationItem,
  ModalityDeviceRoom,
  ImagingStudy,
  RadiologistWorklistItem,
  RadiologyReport,
  CriticalFindingCommunication,
  PortableImagingContext,
  InterventionalRadiologyContext,
  ExternalImagingStudy,
  RadiologyOperationalIndicators
} from '../types/radiologyOps';

// ----------------------------------------------------------------------------
// 1. EXAM CATALOG ITEMS
// ----------------------------------------------------------------------------
export const MOCK_IMAGING_CATALOG: ImagingCatalogItem[] = [
  {
    id: 'cat-xr-01',
    code: 'XR-CHEST-PA',
    nameAr: 'أشعة سينية عادية على الصدر (منظر أمامي خلفي)',
    nameEn: 'Chest X-Ray (PA View Standard)',
    modality: 'XR',
    bodyRegion: 'الصدر (Chest / Thorax)',
    defaultDurationMinutes: 10,
    contrastPossibility: 'none',
    preparationRequirementsAr: ['إزالة المعادن والحلي المعدنية من منطقة الصدر', 'ارتداء زي الفحص الطبي'],
    safetyQuestionnaireRequired: ['pregnancy_safety'],
    defaultProtocolFamily: 'Standard PA/Lateral Chest',
    requiresRadiologistProtocoling: false
  },
  {
    id: 'cat-ct-01',
    code: 'CT-BRAIN-NC',
    nameAr: 'أشعة مقطعية على المخ بدون صبغة (CT Brain Non-Contrast)',
    nameEn: 'CT Brain Non-Contrast (Emergency / Stroke Protocol)',
    modality: 'CT',
    bodyRegion: 'الرأس والمخ (Brain / Head)',
    defaultDurationMinutes: 15,
    contrastPossibility: 'none',
    preparationRequirementsAr: ['إزالة أطقم الأسنان ودبابيس الشعر والحلي', 'التثبيت المناسب للرأس'],
    safetyQuestionnaireRequired: ['pregnancy_safety'],
    defaultProtocolFamily: 'Head Standard 5mm + 1.25mm Thin Recons',
    requiresRadiologistProtocoling: false
  },
  {
    id: 'cat-ct-02',
    code: 'CT-CHEST-ABDO-PELVIS-C',
    nameAr: 'أشعة مقطعية على الصدر والبطن والحوض بالصبغة الوريدية والفموية',
    nameEn: 'CT Chest, Abdomen & Pelvis with IV & Oral Contrast (Staging)',
    modality: 'CT',
    bodyRegion: 'الصدر والبطن والحوض (Torso)',
    defaultDurationMinutes: 30,
    contrastPossibility: 'iv_iodinated',
    preparationRequirementsAr: [
      'صيام عن الطعام والشراب لمدة 4 ساعات قبل الفحص',
      'فحص وظائف الكلى المعتمد خلال 30 يومًا',
      'شرب الصبغة الفموية المخففة (1000 مل) قبل الفحص بساعة',
      'تركيب كانيولا وريدية قياس 18G أو 20G في الذراع'
    ],
    safetyQuestionnaireRequired: ['contrast_safety', 'pregnancy_safety'],
    defaultProtocolFamily: 'Torso Triphasic Staging Protocol',
    requiresRadiologistProtocoling: true
  },
  {
    id: 'cat-mri-01',
    code: 'MRI-BRAIN-DWI',
    nameAr: 'رنين مغناطيسي على المخ وبروتوكول السكتة الدماغية والانتشار (DWI)',
    nameEn: 'MRI Brain with Diffusion (Stroke & Ischemia Protocol)',
    modality: 'MRI',
    bodyRegion: 'المخ والجهاز العصبي (Brain / Neuro)',
    defaultDurationMinutes: 40,
    contrastPossibility: 'none',
    preparationRequirementsAr: [
      'إكمال استبيان أمان الرنين المغناطيسي الإلزامي',
      'خلع كافة الأجسام الممغنطة والبطاقات والهواتف',
      'استخدام سدادات الأذن الواقية من الصوت العالي'
    ],
    safetyQuestionnaireRequired: ['mri_safety', 'pregnancy_safety'],
    defaultProtocolFamily: 'Neuro Brain Routine + DWI/ADC + FLAIR',
    requiresRadiologistProtocoling: true
  },
  {
    id: 'cat-mri-02',
    code: 'MRI-LUMBAR-SPINE',
    nameAr: 'رنين مغناطيسي على الفقرات القطنية والعجزية',
    nameEn: 'MRI Lumbar Spine (Degenerative & Radiculopathy Protocol)',
    modality: 'MRI',
    bodyRegion: 'العمود الفقري القطني (Spine / Lumbar)',
    defaultDurationMinutes: 35,
    contrastPossibility: 'none',
    preparationRequirementsAr: [
      'إكمال استبيان أمان الرنين المغناطيسي',
      'إزالة المشدات والأحزمة المحتوية على معادن'
    ],
    safetyQuestionnaireRequired: ['mri_safety', 'pregnancy_safety'],
    defaultProtocolFamily: 'Spine Sagittal T1/T2 + Axial T2',
    requiresRadiologistProtocoling: false
  },
  {
    id: 'cat-us-01',
    code: 'US-ABDOMEN-PELVIS',
    nameAr: 'موجات فوق صوتية (سونار) على البطن والحوض كاملاً',
    nameEn: 'Ultrasound Abdomen & Pelvis Complete',
    modality: 'US',
    bodyRegion: 'البطن والحوض (Abdominal / Pelvic)',
    defaultDurationMinutes: 25,
    contrastPossibility: 'none',
    preparationRequirementsAr: [
      'صيام 6 ساعات لفحص المرارة والبنكرياس',
      'شرب 1 لتر ماء والاحتفاظ بالبول لامتلاء المثانة'
    ],
    safetyQuestionnaireRequired: [],
    defaultProtocolFamily: 'Abdominal Organs + Pelvic Survey',
    requiresRadiologistProtocoling: false
  },
  {
    id: 'cat-ir-01',
    code: 'IR-LIVER-BIOPSY-CT',
    nameAr: 'أخذ عينة كبدية موجهة بالأشعة المقطعية (IR CT-Guided Liver Biopsy)',
    nameEn: 'IR CT-Guided Core Liver Biopsy',
    modality: 'IR',
    bodyRegion: 'الكبد / البطن (Hepatobiliary)',
    defaultDurationMinutes: 60,
    contrastPossibility: 'none',
    preparationRequirementsAr: [
      'صيام 6 ساعات',
      'توقيع الموافقة المستنيرة الإجرائية المسبقة',
      'مراجعة فحص التجلط (INR / Platelets) والتوقف عن مميعات الدم حسب السياسة',
      'تركيب خط وريدي مراقب'
    ],
    safetyQuestionnaireRequired: ['contrast_safety', 'sedation_assessment', 'pregnancy_safety'],
    defaultProtocolFamily: 'Percutaneous Core Biopsy with Coaxial Guidance',
    requiresRadiologistProtocoling: true
  }
];

// ----------------------------------------------------------------------------
// 2. MODALITY EQUIPMENT & ROOMS
// ----------------------------------------------------------------------------
export const MOCK_DEVICES_ROOMS: ModalityDeviceRoom[] = [
  {
    id: 'room-ct-1',
    modality: 'CT',
    code: 'CT-01',
    nameAr: 'غرفة الأشعة المقطعية 1 (Somatom Definition Edge - 128 Slice)',
    nameEn: 'CT Suite 1 - Somatom 128 Slice (Siemens Healthineers)',
    location: 'الدور الأرضي - قسم الطوارئ والتصوير السريع',
    status: 'in_use',
    currentPatientName: 'محمود سعد الدين إبراهيم',
    currentExamName: 'CT Brain Non-Contrast STAT',
    currentAcquisitionStartedAt: '2026-09-13 14:10',
    estimatedRemainingMinutes: 6
  },
  {
    id: 'room-ct-2',
    modality: 'CT',
    code: 'CT-02',
    nameAr: 'غرفة الأشعة المقطعية 2 (Revolution CT - 256 Slice Cardiac)',
    nameEn: 'CT Suite 2 - Revolution 256 Slice (GE Healthcare)',
    location: 'الدور الأول - مركز التصوير التخصصي للأورام والقلب',
    status: 'available'
  },
  {
    id: 'room-mri-1',
    modality: 'MRI',
    code: 'MRI-01',
    nameAr: 'رنين مغناطيسي 1 (Magnetom Vida 3.0T High-Field)',
    nameEn: 'MRI Suite 1 - Magnetom Vida 3.0T Wide-Bore',
    location: 'الدور الأرضي - جناح الرنين المغناطيسي المعزول',
    status: 'in_use',
    currentPatientName: 'فاطمة حسن العمري',
    currentExamName: 'MRI Brain with DWI Protocol',
    currentAcquisitionStartedAt: '2026-09-13 13:55',
    estimatedRemainingMinutes: 12
  },
  {
    id: 'room-mri-2',
    modality: 'MRI',
    code: 'MRI-02',
    nameAr: 'رنين مغناطيسي 2 (Ingenia Ambition 1.5T Helium-Free)',
    nameEn: 'MRI Suite 2 - Ingenia 1.5T (Philips Healthcare)',
    location: 'الدور الأرضي - جناح الرنين المغناطيسي',
    status: 'cleaning_turnover',
    maintenanceNote: 'تطهير شامل وتبديل ملحقات التعقيم بعد حالة عزل مسبقة'
  },
  {
    id: 'room-xr-1',
    modality: 'XR',
    code: 'XR-01',
    nameAr: 'غرفة الأشعة السينية الرقمية العامة 1 (Digital Radiography Ceiling)',
    nameEn: 'Digital X-Ray Room 1 (Carestream DRX)',
    location: 'الدور الأرضي - العيادات الخارجية',
    status: 'available'
  },
  {
    id: 'room-xr-portable-1',
    modality: 'XR',
    code: 'PORT-XR-01',
    nameAr: 'جهاز الأشعة السينية المتنقل 1 (Mobile DR Wireless Detector)',
    nameEn: 'Mobile Portable DR Unit 01 (Fuji FDR Nano)',
    location: 'متنقل - العناية المركزة والطوارئ (ICU / ER Bedsides)',
    status: 'in_use',
    currentPatientName: 'خالد عبد الرحمن العتيبي',
    currentExamName: 'Portable Chest X-Ray Bedside',
    currentAcquisitionStartedAt: '2026-09-13 14:12',
    estimatedRemainingMinutes: 4
  },
  {
    id: 'room-us-1',
    modality: 'US',
    code: 'US-01',
    nameAr: 'غرفة الموجات الصوتية 1 (EPIQ Elite Ultrasound)',
    nameEn: 'Ultrasound Suite 1 (Philips EPIQ Elite)',
    location: 'الدور الأول - قسم التصوير بالموجات الصوتية',
    status: 'available'
  },
  {
    id: 'room-ir-1',
    modality: 'IR',
    code: 'IR-01',
    nameAr: 'جناح القسطرة والأشعة التداخلية A (Biplane Angio Suite)',
    nameEn: 'Interventional Radiology Angio Suite A (Artis Q Biplane)',
    location: 'الدور الثاني - الجناح التداخلي المعقم',
    status: 'available'
  }
];

// ----------------------------------------------------------------------------
// 3. INCOMING IMAGING REQUESTS (From Axis 6 Orders)
// ----------------------------------------------------------------------------
export const MOCK_INCOMING_IMAGING_REQUESTS: IncomingImagingRequest[] = [
  {
    id: 'RAD-REQ-2026-101',
    orderSourceId: 'ord-rad-501',
    patientId: 'pat-1001',
    patientName: 'محمود سعد الدين إبراهيم',
    patientNameEn: 'Mahmoud Saad Eldin Ibrahim',
    mrn: 'MRN-2026-0814',
    age: 52,
    gender: 'male',
    encounterId: 'enc-er-901',
    encounterType: 'er',
    originLocation: 'طوارئ الحوادث - سرير الحالات الحرجة 03 (ER Acute 03)',
    requestingClinician: {
      name: 'د. سامح عبد الرازق',
      role: 'استشاري طب الطوارئ',
      department: 'Emergency Medicine',
      phoneExt: '2119'
    },
    examCatalogId: 'cat-ct-01',
    examNameAr: 'أشعة مقطعية على المخ بدون صبغة (CT Brain Non-Contrast)',
    examNameEn: 'CT Brain Non-Contrast (Emergency Stroke)',
    modality: 'CT',
    bodyRegion: 'الرأس والمخ',
    clinicalIndication: 'اشتباه سكتة دماغية حادة - ضعف مفاجئ بالجانب الأيمن وصعوبة نطق منذ 45 دقيقة (Window Stroke Protocol)',
    priority: 'stat',
    requestedDateTime: '2026-09-13 13:45',
    mobilityContext: 'stretcher',
    isolationContext: 'none',
    contrastRequired: 'none',
    workflowType: 'immediate_emergency',
    status: 'in_acquisition',
    protocolStatus: 'auto_selected',
    assignedProtocolId: 'prot-001',
    assignedProtocolName: 'Stroke Code Acute Non-Contrast Head',
    schedulingStatus: 'walk_in_direct',
    hasPreviousStudies: true,
    notes: 'حالة كود سكتة دماغية STAT - وصول فوري من قسم الطوارئ'
  },
  {
    id: 'RAD-REQ-2026-102',
    orderSourceId: 'ord-rad-502',
    patientId: 'pat-1002',
    patientName: 'نوران حسام الشافعي',
    patientNameEn: 'Nouran Hossam El-Shafei',
    mrn: 'MRN-2026-0820',
    age: 33,
    gender: 'female',
    encounterId: 'enc-opd-441',
    encounterType: 'opd',
    originLocation: 'عيادة الأورام والباطنة العامة (OPD Clinic 05)',
    requestingClinician: {
      name: 'د. منى سراج الدين',
      role: 'استشاري أورام باطنية',
      department: 'Medical Oncology',
      phoneExt: '3410'
    },
    examCatalogId: 'cat-ct-02',
    examNameAr: 'أشعة مقطعية على الصدر والبطن والحوض بالصبغة الوريدية والفموية',
    examNameEn: 'CT Chest Abdomen Pelvis with IV & Oral Contrast',
    modality: 'CT',
    bodyRegion: 'الصدر والبطن والحوض',
    clinicalIndication: 'متابعة تقييم استجابة الورم للعلاج الكيماوي وتحديد مرحلة المرض (Restaging Protocol)',
    priority: 'urgent',
    requestedDateTime: '2026-09-13 11:30',
    mobilityContext: 'ambulatory',
    isolationContext: 'none',
    contrastRequired: 'iv_iodinated',
    workflowType: 'scheduled',
    status: 'in_preparation',
    protocolStatus: 'radiologist_approved',
    assignedProtocolId: 'prot-002',
    assignedProtocolName: 'Triphasic Torso Contrast with Oral Hydration',
    schedulingStatus: 'scheduled',
    appointmentId: 'apt-rad-301',
    hasPreviousStudies: true,
    notes: 'وظائف الكلى سليمة (eGFR > 85). الكانيولا الوريدية 20G في الذراع الأيسر.'
  },
  {
    id: 'RAD-REQ-2026-103',
    orderSourceId: 'ord-rad-503',
    patientId: 'pat-1003',
    patientName: 'فاطمة حسن العمري',
    patientNameEn: 'Fatima Hassan Al-Omari',
    mrn: 'MRN-2026-0512',
    age: 46,
    gender: 'female',
    encounterId: 'enc-opd-209',
    encounterType: 'opd',
    originLocation: 'عيادة المخ والأعصاب (Neurology Clinic 02)',
    requestingClinician: {
      name: 'د. وليد الباز',
      role: 'استشاري جراحة المخ والأعصاب',
      department: 'Neurosurgery',
      phoneExt: '4102'
    },
    examCatalogId: 'cat-mri-01',
    examNameAr: 'رنين مغناطيسي على المخ وبروتوكول السكتة والانتشار (DWI)',
    examNameEn: 'MRI Brain with DWI & FLAIR Sequences',
    modality: 'MRI',
    bodyRegion: 'المخ والجهاز العصبي',
    clinicalIndication: 'صداع مزمن نوبي مع تنميل بالطرف الأيسر واستبعاد آفة تشغل حيزاً أو تصلب لويحي (Rule out Demyelination / SOL)',
    priority: 'urgent',
    requestedDateTime: '2026-09-13 10:15',
    mobilityContext: 'ambulatory',
    isolationContext: 'none',
    contrastRequired: 'none',
    workflowType: 'scheduled',
    status: 'in_acquisition',
    protocolStatus: 'radiologist_approved',
    assignedProtocolId: 'prot-003',
    assignedProtocolName: 'MRI Brain Neuro Comprehensive + DWI/ADC',
    schedulingStatus: 'scheduled',
    appointmentId: 'apt-rad-302',
    hasPreviousStudies: false,
    notes: 'تم فحص السلامة وتأكيد خلو المريضة من أي منظمات ضربات قلب أو رقاقات معدنية'
  },
  {
    id: 'RAD-REQ-2026-104',
    orderSourceId: 'ord-rad-504',
    patientId: 'pat-1004',
    patientName: 'خالد عبد الرحمن العتيبي',
    patientNameEn: 'Khaled Abdelrahman Al-Otaibi',
    mrn: 'MRN-2026-0902',
    age: 63,
    gender: 'male',
    encounterId: 'enc-icu-701',
    encounterType: 'icu',
    originLocation: 'العناية المركزة للصدرية - سرير 04 (ICU Bed 04)',
    requestingClinician: {
      name: 'د. حازم القاضي',
      role: 'استشاري العناية المركزة',
      department: 'Critical Care Medicine',
      phoneExt: '5110'
    },
    examCatalogId: 'cat-xr-01',
    examNameAr: 'أشعة سينية عادية على الصدر متنقلة بالسرير (Portable CXR Bedside)',
    examNameEn: 'Portable Chest X-Ray (AP Bedside ICU)',
    modality: 'XR',
    bodyRegion: 'الصدر',
    clinicalIndication: 'مريض على جهاز التنفس الصناعي - التأكد من موقع الأنبوب الحنجري والقسطرة الوريدية المركزية (ET Tube & CVC Line Check)',
    priority: 'stat',
    requestedDateTime: '2026-09-13 13:50',
    mobilityContext: 'bed_portable',
    isolationContext: 'droplet',
    contrastRequired: 'none',
    workflowType: 'portable_bedside',
    status: 'in_acquisition',
    protocolStatus: 'not_required',
    schedulingStatus: 'walk_in_direct',
    hasPreviousStudies: true,
    notes: 'المريض في عزلة رذاذ (Droplet Isolation). مطلوب ارتداء الواقيات الكاملة للجهاز المتنقل.'
  },
  {
    id: 'RAD-REQ-2026-105',
    orderSourceId: 'ord-rad-505',
    patientId: 'pat-1005',
    patientName: 'عبد الله إبراهيم الدوسري',
    patientNameEn: 'Abdullah Ibrahim Al-Dossari',
    mrn: 'MRN-2026-0681',
    age: 58,
    gender: 'male',
    encounterId: 'enc-ipd-312',
    encounterType: 'ipd',
    originLocation: 'جناح التنويم الباطني - غرفة 312 سرير B',
    requestingClinician: {
      name: 'د. شريف الجندي',
      role: 'استشاري الجهاز الهضمي والكبد',
      department: 'Gastroenterology',
      phoneExt: '3205'
    },
    examCatalogId: 'cat-ir-01',
    examNameAr: 'أخذ عينة كبدية موجهة بالأشعة المقطعية (IR CT-Guided Liver Biopsy)',
    examNameEn: 'IR CT-Guided Core Liver Biopsy',
    modality: 'IR',
    bodyRegion: 'الكبد / البطن',
    clinicalIndication: 'كتلة كبدية مجهولة السبب بالفص الأيمن (4.2 سم) مطلوب عينة نسيجية موجهة لتشخيص النسيج والباثولوجي',
    priority: 'urgent',
    requestedDateTime: '2026-09-13 09:00',
    mobilityContext: 'wheelchair',
    isolationContext: 'none',
    contrastRequired: 'none',
    workflowType: 'scheduled',
    status: 'ready_for_scan',
    protocolStatus: 'radiologist_approved',
    assignedProtocolId: 'prot-004',
    assignedProtocolName: 'IR Percutaneous Core Needle Biopsy Protocol',
    schedulingStatus: 'confirmed',
    appointmentId: 'apt-rad-303',
    hasPreviousStudies: true,
    notes: 'تحليل السيولة معتمد: INR 1.1، صفائح دموية 195,000. الموافقة المستنيرة موقعة.'
  },
  {
    id: 'RAD-REQ-2026-106',
    orderSourceId: 'ord-rad-506',
    patientId: 'pat-1006',
    patientName: 'مريم علي الرشيد',
    patientNameEn: 'Maryam Ali Al-Rasheed',
    mrn: 'MRN-2026-0744',
    age: 29,
    gender: 'female',
    encounterId: 'enc-er-920',
    encounterType: 'er',
    originLocation: 'طوارئ الجراحة - سرير الملاحظة 07',
    requestingClinician: {
      name: 'د. ياسمين عزب',
      role: 'أخصائي جراحة عامة',
      department: 'General Surgery',
      phoneExt: '2140'
    },
    examCatalogId: 'cat-us-01',
    examNameAr: 'موجات فوق صوتية (سونار) على البطن والحوض كاملاً',
    examNameEn: 'Ultrasound Abdomen & Pelvis (Acute Appendicitis Rule-out)',
    modality: 'US',
    bodyRegion: 'البطن والحوض',
    clinicalIndication: 'ألم حاد بالربع السفلي الأيمن للبطن وحرارة خفيفة - اشتباه التهاب الزائدة الدودية الحاد (Rule out Acute Appendicitis)',
    priority: 'urgent',
    requestedDateTime: '2026-09-13 13:20',
    mobilityContext: 'wheelchair',
    isolationContext: 'none',
    contrastRequired: 'none',
    workflowType: 'walk_in',
    status: 'arrived',
    protocolStatus: 'tech_assigned',
    schedulingStatus: 'walk_in_direct',
    hasPreviousStudies: false,
    notes: 'المريضة صائمة ومثانتها ممتلئة. جاهزة للنداء إلى غرفة السونار 1.'
  },
  {
    id: 'RAD-REQ-2026-107',
    orderSourceId: 'ord-rad-507',
    patientId: 'pat-1007',
    patientName: 'طارق عبد المحسن الخالد',
    patientNameEn: 'Tarek Abdelmohsen Al-Khaled',
    mrn: 'MRN-2026-0991',
    age: 48,
    gender: 'male',
    encounterId: 'enc-opd-512',
    encounterType: 'opd',
    originLocation: 'عيادة العظام وجراحة العمود الفقري (Orthopedics Clinic 01)',
    requestingClinician: {
      name: 'د. أيمن النجار',
      role: 'استشاري جراحة العظام',
      department: 'Orthopedic Surgery',
      phoneExt: '4301'
    },
    examCatalogId: 'cat-mri-02',
    examNameAr: 'رنين مغناطيسي على الفقرات القطنية والعجزية',
    examNameEn: 'MRI Lumbar Spine Routine',
    modality: 'MRI',
    bodyRegion: 'العمود الفقري',
    clinicalIndication: 'ألم أسفل الظهر مع انتشار للطرف السفلي الأيمن وضعف انعكاس الركبة (L4-L5 Radiculopathy)',
    priority: 'routine',
    requestedDateTime: '2026-09-13 08:30',
    mobilityContext: 'ambulatory',
    isolationContext: 'none',
    contrastRequired: 'none',
    workflowType: 'scheduled',
    status: 'scheduled',
    protocolStatus: 'auto_selected',
    assignedProtocolId: 'prot-005',
    assignedProtocolName: 'Lumbar Spine Standard Non-Contrast',
    schedulingStatus: 'scheduled',
    appointmentId: 'apt-rad-304',
    hasPreviousStudies: false
  }
];

// ----------------------------------------------------------------------------
// 4. PROTOCOLS
// ----------------------------------------------------------------------------
export const MOCK_IMAGING_PROTOCOLS: ImagingProtocol[] = [
  {
    id: 'prot-001',
    requestId: 'RAD-REQ-2026-101',
    modality: 'CT',
    protocolNameAr: 'بروتوكول السكتة الدماغية المقطعية العاجلة (Stroke Code Head)',
    protocolNameEn: 'CT Brain Acute Stroke Non-Contrast Routine',
    bodyRegion: 'الرأس والمخ',
    contrastProtocol: {
      type: 'none'
    },
    sequencesOrPhases: [
      'Topogram Scout (256mm)',
      'Axial 5mm Brain Window (Posterior Fossa / Cerebrum)',
      'Axial 1.25mm Thin Slices Submillimeter Recons',
      'Bone Window (Cranial Base & Calvarium)'
    ],
    specialInstructionsAr: 'تقييم فوري لمؤشر ASPECTS واستبعاد النزيف الحاد داخل القحف (Intracranial Hemorrhage)',
    sedationRequired: false,
    protocolPolicy: 'auto_catalog'
  },
  {
    id: 'prot-002',
    requestId: 'RAD-REQ-2026-102',
    modality: 'CT',
    protocolNameAr: 'بروتوكول التصوير المقطعي ثلاثي المراحل للجذع مع الصبغة',
    protocolNameEn: 'Torso Triphasic Staging with Oral & IV Contrast',
    bodyRegion: 'الصدر والبطن والحوض',
    contrastProtocol: {
      type: 'iv_iodinated',
      agentName: 'Omnipaque 350 mgI/mL',
      volumeMl: 95,
      flowRateMlSec: 3.5,
      delaySeconds: 70
    },
    sequencesOrPhases: [
      'Chest Arterial Phase (Start 25s post-injection)',
      'Abdomen & Pelvis Portal Venous Phase (70s delay)',
      'Delayed Excretory Bladder Survey (300s) if indicated'
    ],
    specialInstructionsAr: 'مقارنة دقيقة مع الفحص السابق لتاريخ 2026-03-10 لحجم العقد الليمفاوية والآفات',
    sedationRequired: false,
    comparisonStudiesSelected: ['STUDY-2026-PRIOR-01'],
    protocolPolicy: 'radiologist_approved',
    approvedBy: 'د. طلال السعيد (استشاري الأشعة التشخيصية)',
    approvedAt: '2026-09-13 12:05'
  },
  {
    id: 'prot-003',
    requestId: 'RAD-REQ-2026-103',
    modality: 'MRI',
    protocolNameAr: 'بروتوكول الرنين المغناطيسي للمخ مع متتاليات الانتشار والفلير',
    protocolNameEn: 'MRI Brain Comprehensive Neuro + DWI + FLAIR',
    bodyRegion: 'المخ والجهاز العصبي',
    contrastProtocol: {
      type: 'none'
    },
    sequencesOrPhases: [
      'Sagittal T1-FLAIR (3D Volume)',
      'Axial T2-TSE High-Resolution',
      'Axial T2-FLAIR (Periventricular white matter evaluation)',
      'Axial DWI / ADC Map (b-value: 0, 1000)',
      'Coronal T2 High-Res Hippocampus',
      'Axial GRE / SWI (Micro-hemorrhages & Calcification)'
    ],
    specialInstructionsAr: 'استخدام سدادات أذن مزدوجة، وضبط زمن التكرار (TR) لتقليل زمن الفحص الإجمالي',
    sedationRequired: false,
    protocolPolicy: 'radiologist_approved',
    approvedBy: 'د. ليلى الشريف (استشاري أشعة الجهاز العصبي)',
    approvedAt: '2026-09-13 10:45'
  }
];

// ----------------------------------------------------------------------------
// 5. SAFETY SCREENING CONTEXTS
// ----------------------------------------------------------------------------
export const MOCK_MRI_SAFETY_RECORDS: Record<string, MriSafetyScreening> = {
  'pat-1003': {
    hasCardiacPacemaker: false,
    hasCochlearImplant: false,
    hasCerebralAneurysmClip: false,
    hasMetallicForeignBodyEye: false,
    hasOrthopedicImplants: false,
    hasNeurostimulator: false,
    isClaustrophobic: false,
    weightKg: 68,
    mriConditionalReviewed: true,
    screenerName: 'أخصائي الرنين: م. عصام عبد الرحمن',
    screenedAt: '2026-09-13 13:30',
    safetyStatus: 'cleared',
    notes: 'تم فحص المريضة بجهاز الكشف عن المعادن اليدوي والتحقق المباشر - الحالة آمنة 100% للرنين المغناطيسي 3T'
  },
  'pat-1007': {
    hasCardiacPacemaker: false,
    hasCochlearImplant: false,
    hasCerebralAneurysmClip: false,
    hasMetallicForeignBodyEye: false,
    hasOrthopedicImplants: true, // Dental implant non-ferromagnetic
    hasNeurostimulator: false,
    isClaustrophobic: true, // Mild
    weightKg: 84,
    mriConditionalReviewed: true,
    screenerName: 'ممرض الأشعة: أحمد شكري',
    screenedAt: '2026-09-13 11:15',
    safetyStatus: 'caution_conditional',
    notes: 'زراعة أسنان تيتانيوم مثبتة 2022 غير مغناطيسية. رهاب خفيف من الأماكن المغلقة (تم توفير مرآة رؤية وموسيقى هادئة)'
  }
};

export const MOCK_CONTRAST_SAFETY_RECORDS: Record<string, ContrastSafetyContext> = {
  'pat-1002': {
    priorReactionHistory: 'none',
    allergiesSummary: 'لا توجد حساسية معروفة لصبغات اليود أو المأكولات البحرية (NKDA)',
    renalStatusPolicyOutcome: 'cleared_adequate_function',
    recentCreatinine: '0.82 mg/dL',
    recentEgfr: '94 mL/min/1.73m²',
    labDate: '2026-09-10',
    hydrationPremedicationDone: true,
    consentFormStatus: 'signed_completed',
    clearedByClinician: 'د. طلال السعيد (استشاري الأشعة)',
    clearedAt: '2026-09-13 12:10',
    safetyStatus: 'cleared'
  }
};

export const MOCK_PREGNANCY_SAFETY_RECORDS: Record<string, PregnancySafetyContext> = {
  'pat-1002': {
    policyOutcome: 'cleared_by_policy',
    lastMenstrualPeriodDate: '2026-09-02 (منذ 11 يوماً)',
    clinicalNote: 'تم تطبيق سياسة الـ 10 أيام المعتمدة لمراجعة الحمل وتأكيد النتيجة السلبية لفحص HCG البولي بالمختبر قبل الحقن.',
    counselorName: 'د. منى سراج الدين'
  },
  'pat-1006': {
    policyOutcome: 'not_applicable',
    clinicalNote: 'فحص سونار بالموجات الصوتية - لا يتضمن إشعاعاً مؤيناً ولا يتطلب قيود فحص حمل شعاعية.'
  }
};

// ----------------------------------------------------------------------------
// 6. ARRIVAL & PREPARATION QUEUE ITEMS
// ----------------------------------------------------------------------------
export const MOCK_ARRIVAL_PREPARATION_QUEUE: ArrivalPreparationItem[] = [
  {
    id: 'arr-001',
    requestId: 'RAD-REQ-2026-101',
    patientId: 'pat-1001',
    patientName: 'محمود سعد الدين إبراهيم',
    patientNameEn: 'Mahmoud Saad Eldin Ibrahim',
    mrn: 'MRN-2026-0814',
    examName: 'CT Brain Non-Contrast STAT',
    modality: 'CT',
    arrivedAt: '2026-09-13 14:02',
    waitingDurationMinutes: 8,
    identityVerificationStatus: 'verified_dual_id',
    safetyScreeningStatus: 'cleared',
    contrastReadiness: 'not_applicable',
    mobilityContext: 'stretcher',
    isolationContext: 'none',
    consentStatus: 'not_required',
    destinationRoomId: 'room-ct-1',
    destinationRoomName: 'CT Suite 1 (Emergency)',
    isReadyForScan: true
  },
  {
    id: 'arr-002',
    requestId: 'RAD-REQ-2026-102',
    patientId: 'pat-1002',
    patientName: 'نوران حسام الشافعي',
    patientNameEn: 'Nouran Hossam El-Shafei',
    mrn: 'MRN-2026-0820',
    examName: 'CT Chest, Abdomen & Pelvis with Contrast',
    modality: 'CT',
    arrivedAt: '2026-09-13 13:40',
    waitingDurationMinutes: 30,
    identityVerificationStatus: 'wristband_scanned',
    safetyScreeningStatus: 'cleared',
    contrastReadiness: 'ready_iv_placed',
    ivAccessGauge: '20G Green - Left Antecubital Fossa',
    mobilityContext: 'ambulatory',
    isolationContext: 'none',
    consentStatus: 'signed',
    destinationRoomId: 'room-ct-2',
    destinationRoomName: 'CT Suite 2 (Oncology / Torso)',
    isReadyForScan: true
  },
  {
    id: 'arr-003',
    requestId: 'RAD-REQ-2026-106',
    patientId: 'pat-1006',
    patientName: 'مريم علي الرشيد',
    patientNameEn: 'Maryam Ali Al-Rasheed',
    mrn: 'MRN-2026-0744',
    examName: 'Ultrasound Abdomen & Pelvis',
    modality: 'US',
    arrivedAt: '2026-09-13 13:55',
    waitingDurationMinutes: 15,
    identityVerificationStatus: 'verbal_confirmed',
    safetyScreeningStatus: 'cleared',
    contrastReadiness: 'not_applicable',
    mobilityContext: 'wheelchair',
    isolationContext: 'none',
    consentStatus: 'not_required',
    destinationRoomId: 'room-us-1',
    destinationRoomName: 'Ultrasound Room 1',
    isReadyForScan: true
  }
];

// ----------------------------------------------------------------------------
// 7. IMAGING STUDIES (DICOM Hierarchy Mock)
// ----------------------------------------------------------------------------
export const MOCK_IMAGING_STUDIES: ImagingStudy[] = [
  {
    id: 'STUDY-2026-901',
    accessionNumber: 'ACC-RAD-8821901',
    requestId: 'RAD-REQ-2026-101',
    patientId: 'pat-1001',
    patientName: 'محمود سعد الدين إبراهيم',
    patientNameEn: 'Mahmoud Saad Eldin Ibrahim',
    mrn: 'MRN-2026-0814',
    studyDate: '2026-09-13',
    studyTime: '14:15',
    modality: 'CT',
    bodyRegion: 'الرأس والمخ',
    studyDescriptionAr: 'أشعة مقطعية على المخ بدون صبغة (CT Head Stroke Protocol)',
    studyDescriptionEn: 'CT Head Non-Contrast Stroke Protocol',
    performingTechnologist: 'أخصائي الأشعة: حسام الدين كامل',
    roomId: 'room-ct-1',
    roomName: 'CT Suite 1 (Somatom 128)',
    seriesCount: 3,
    totalInstancesCount: 94,
    series: [
      {
        id: 'ser-01',
        seriesNumber: 1,
        seriesDescriptionAr: 'مسح توجيهي علوي (Scout / Topogram)',
        seriesDescriptionEn: 'Topogram 256mm Lateral',
        modality: 'CT',
        instancesCount: 2,
        instances: [
          {
            id: 'inst-01',
            instanceNumber: 1,
            imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
            windowLevel: 'W:150 L:40',
            sopInstanceUid: '1.2.840.10008.5.1.4.1.1.2.901.1'
          }
        ],
        seriesInstanceUid: '1.2.840.10008.5.1.4.1.1.2.901'
      },
      {
        id: 'ser-02',
        seriesNumber: 2,
        seriesDescriptionAr: 'مقاطع محوريه للمخ 5 مم (Axial Brain Window 5mm)',
        seriesDescriptionEn: 'Head Brain Window 5mm Slices',
        modality: 'CT',
        instancesCount: 48,
        instances: [
          {
            id: 'inst-02',
            instanceNumber: 18,
            imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
            windowLevel: 'W:80 L:40 (Brain Tissue)',
            sliceLocationMm: -25.5,
            sopInstanceUid: '1.2.840.10008.5.1.4.1.1.2.901.18'
          },
          {
            id: 'inst-03',
            instanceNumber: 24,
            imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80',
            windowLevel: 'W:80 L:40 (Basal Ganglia & MCA Territory)',
            sliceLocationMm: 12.0,
            sopInstanceUid: '1.2.840.10008.5.1.4.1.1.2.901.24'
          }
        ],
        sliceThicknessMm: 5.0,
        seriesInstanceUid: '1.2.840.10008.5.1.4.1.1.2.902'
      },
      {
        id: 'ser-03',
        seriesNumber: 3,
        seriesDescriptionAr: 'نافذة العظام وقاع الجمجمة (Bone Window)',
        seriesDescriptionEn: 'Head Bone Window 1.25mm',
        modality: 'CT',
        instancesCount: 44,
        instances: [
          {
            id: 'inst-04',
            instanceNumber: 10,
            imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
            windowLevel: 'W:2500 L:500 (Bone)',
            sopInstanceUid: '1.2.840.10008.5.1.4.1.1.2.901.50'
          }
        ],
        sliceThicknessMm: 1.25,
        seriesInstanceUid: '1.2.840.10008.5.1.4.1.1.2.903'
      }
    ],
    radiationDoseMetadata: {
      reported: true,
      ctdiVolMgy: 46.2,
      dlpMgyCm: 720,
      referenceProtocolName: 'Adult Routine Head 120kV'
    },
    technicalQc: {
      status: 'satisfactory',
      reviewedBy: 'أخصائي الأشعة: حسام الدين كامل',
      reviewedAt: '2026-09-13 14:18',
      motionArtifact: false,
      technicalComments: 'الفحص مكتمل ومطابق لمعايير الجودة التشخيصية. تم تحويل المقاطع لمحطة عمل قراءة طبيب الأشعة.'
    },
    studyInstanceUid: '1.2.840.10008.5.1.4.1.1.2.901'
  },
  {
    id: 'STUDY-2026-902',
    accessionNumber: 'ACC-RAD-8821902',
    requestId: 'RAD-REQ-2026-104',
    patientId: 'pat-1004',
    patientName: 'خالد عبد الرحمن العتيبي',
    patientNameEn: 'Khaled Abdelrahman Al-Otaibi',
    mrn: 'MRN-2026-0902',
    studyDate: '2026-09-13',
    studyTime: '14:14',
    modality: 'XR',
    bodyRegion: 'الصدر',
    studyDescriptionAr: 'أشعة سينية عادية متنقلة على الصدر (Portable Chest AP Bedside)',
    studyDescriptionEn: 'Portable Chest AP View (ICU)',
    performingTechnologist: 'فني الأشعة المتنقلة: رائد منصور',
    roomId: 'room-xr-portable-1',
    roomName: 'Mobile DR Unit 01 (ICU)',
    seriesCount: 1,
    totalInstancesCount: 1,
    series: [
      {
        id: 'ser-p-01',
        seriesNumber: 1,
        seriesDescriptionAr: 'صدر متنقل أمامي خلفي بالسرير (AP Supine Chest)',
        seriesDescriptionEn: 'Chest AP Bedside Portable',
        modality: 'XR',
        instancesCount: 1,
        instances: [
          {
            id: 'inst-p-01',
            instanceNumber: 1,
            imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
            windowLevel: 'W:350 L:80',
            sopInstanceUid: '1.2.840.10008.5.1.4.1.1.1.902.1'
          }
        ],
        seriesInstanceUid: '1.2.840.10008.5.1.4.1.1.1.902'
      }
    ],
    radiationDoseMetadata: {
      reported: true,
      dapGyCm2: 0.12,
      referenceProtocolName: 'Portable Chest AP 85kV 2.5mAs'
    },
    technicalQc: {
      status: 'satisfactory',
      reviewedBy: 'فني الأشعة المتنقلة: رائد منصور',
      reviewedAt: '2026-09-13 14:16',
      motionArtifact: false,
      technicalComments: 'التنبيب والخط الوريدي في مجال الرؤية الواضح. تم التقاط الصورة وقت الشهيق الأقصى الممكن تحت جهاز التنفس.'
    },
    studyInstanceUid: '1.2.840.10008.5.1.4.1.1.1.902'
  }
];

// ----------------------------------------------------------------------------
// 8. RADIOLOGIST WORKLIST ITEMS (Reading Queue)
// ----------------------------------------------------------------------------
export const MOCK_RADIOLOGIST_WORKLIST: RadiologistWorklistItem[] = [
  {
    id: 'rwl-001',
    studyId: 'STUDY-2026-901',
    accessionNumber: 'ACC-RAD-8821901',
    requestId: 'RAD-REQ-2026-101',
    patientId: 'pat-1001',
    patientName: 'محمود سعد الدين إبراهيم',
    patientNameEn: 'Mahmoud Saad Eldin Ibrahim',
    mrn: 'MRN-2026-0814',
    age: 52,
    gender: 'male',
    modality: 'CT',
    bodyRegion: 'الرأس والمخ',
    studyDescription: 'CT Head Non-Contrast Stroke Protocol',
    studyCompletedAt: '2026-09-13 14:18',
    priority: 'stat',
    requestingService: 'Emergency Medicine (ER Trauma 03)',
    clinicalIndication: 'اشتباه سكتة دماغية حادة - ضعف شقي أيمن مفاجئ وصعوبة نطق (Window Stroke Protocol)',
    comparisonStudiesCount: 1,
    comparisonStudies: [
      {
        studyDate: '2025-11-20',
        modality: 'CT',
        description: 'CT Brain Non-Contrast',
        reportSummary: 'لا توجد سكتة دماغية قديمة أو نزيف داخل القحف. ضمور دماغي طفيف متوافق مع العمر.'
      }
    ],
    reportingState: 'assigned_in_reading',
    assignedRadiologist: 'د. طلال السعيد (استشاري الأشعة)',
    targetTurnaroundTimeMinutes: 30,
    elapsedMinutes: 12,
    isDelayed: false,
    linkedMyWorkItemId: 'task-rad-rad-01'
  },
  {
    id: 'rwl-002',
    studyId: 'STUDY-2026-902',
    accessionNumber: 'ACC-RAD-8821902',
    requestId: 'RAD-REQ-2026-104',
    patientId: 'pat-1004',
    patientName: 'خالد عبد الرحمن العتيبي',
    patientNameEn: 'Khaled Abdelrahman Al-Otaibi',
    mrn: 'MRN-2026-0902',
    age: 63,
    gender: 'male',
    modality: 'XR',
    bodyRegion: 'الصدر',
    studyDescription: 'Portable Chest AP Bedside (ICU Bed 04)',
    studyCompletedAt: '2026-09-13 14:16',
    priority: 'stat',
    requestingService: 'Intensive Care Unit (ICU Bed 04)',
    clinicalIndication: 'مريض على جهاز التنفس الصناعي - التأكد من موقع أنبوب الرغامي والقسطرة الوريدية المركزية',
    comparisonStudiesCount: 2,
    comparisonStudies: [
      {
        studyDate: '2026-09-12',
        modality: 'XR',
        description: 'Portable Chest AP',
        reportSummary: 'احتقان رئوي خفيف ثنائي الجانب مع ارتشاح قاعدي أيسر.'
      }
    ],
    reportingState: 'unassigned',
    targetTurnaroundTimeMinutes: 45,
    elapsedMinutes: 14,
    isDelayed: false
  },
  {
    id: 'rwl-003',
    studyId: 'STUDY-2026-PRIOR-01',
    accessionNumber: 'ACC-RAD-8819003',
    requestId: 'RAD-REQ-2026-OLD-01',
    patientId: 'pat-1002',
    patientName: 'نوران حسام الشافعي',
    patientNameEn: 'Nouran Hossam El-Shafei',
    mrn: 'MRN-2026-0820',
    age: 33,
    gender: 'female',
    modality: 'CT',
    bodyRegion: 'الصدر والبطن والحوض',
    studyDescription: 'CT Chest Abdomen Pelvis with Contrast Staging',
    studyCompletedAt: '2026-09-13 11:50',
    priority: 'urgent',
    requestingService: 'Medical Oncology (Clinic 05)',
    clinicalIndication: 'تقييم استجابة الورم للعلاج الكيماوي',
    comparisonStudiesCount: 1,
    comparisonStudies: [
      {
        studyDate: '2026-03-10',
        modality: 'CT',
        description: 'CT Chest Abdomen Pelvis Baseline',
        reportSummary: 'عقدة ليمفاوية خلف صفاقية مقاس 2.8 × 1.9 سم.'
      }
    ],
    reportingState: 'preliminary_signed',
    assignedRadiologist: 'د. ليلى الشريف',
    targetTurnaroundTimeMinutes: 120,
    elapsedMinutes: 155,
    isDelayed: true,
    linkedMyWorkItemId: 'task-rad-rad-03'
  }
];

// ----------------------------------------------------------------------------
// 9. RADIOLOGY REPORTS & VERSIONING (Preliminary, Final, Amended)
// ----------------------------------------------------------------------------
export const MOCK_RADIOLOGY_REPORTS: Record<string, RadiologyReport> = {
  'RAD-REP-2026-550': {
    id: 'RAD-REP-2026-550',
    studyId: 'STUDY-2026-901',
    accessionNumber: 'ACC-RAD-8821901',
    requestId: 'RAD-REQ-2026-101',
    patientId: 'pat-1001',
    patientName: 'محمود سعد الدين إبراهيم',
    mrn: 'MRN-2026-0814',
    modality: 'CT',
    examTitleAr: 'تقرير أشعة مقطعية عاجلة على المخ بدون صبغة (كود السكتة الدماغية)',
    examTitleEn: 'CT Brain Non-Contrast (Emergency Stroke Code Protocol)',
    clinicalIndication: 'ضعف نصفي أيمن مفاجئ وصعوبة نطق منذ 45 دقيقة - استبعاد النزيف الدماغي قبل إعطاء مذيب الجلطة (Thrombolysis Screening)',
    comparisonStudyContext: 'تمت المقارنة مع فحص الأشعة المقطعية السابق للمخ المؤرخ في 2025-11-20.',
    techniqueNarrative: 'تم إجراء فحص مقطعي حلزوني محوري متعدد المقاطع للجمجمة وقاعدتها والمخ بدون حقن مادة تباين وريدية، بسماكة مقاطع 5 مم ومقاطع فرعية دقيقة 1.25 مم وفق بروتوكول السكتة الدماغية القياسي.',
    findingsNarrative: `1. النسيج الدماغي والمخيخي:
- لا يوجد أي دليل على نزيف حاد داخل القحف (No Acute Intracranial Hemorrhage) سواء داخل النسيج أو تحت العنكبوتية.
- هناك فقدان طفيف في التمايز بين المادة البيضاء والرمادية في القشرة الجزيرية اليسرى (Early Insular Ribbon Sign) وتفلطح تلافيف الفص الجداري الصدغي الأيسر في نطاق الشريان المخي الأوسط (Left MCA territory).
- مؤشر ASPECTS يقدر بـ 8 من 10 (نقص في الجزيرة وشريط القشرة الصدغية M2).
- لا يوجد انحراف في خط المنتصف أو ضغط كتلي على البطينات المخية (No Midline Shift).

2. الجهاز البطيني وقاع الجمجمة:
- البطينات الثالث والرابع والبطينان الجانبيان في موقع وحجم طبيعيين دون استسقاء دماغي.
- التراكيب العظمية للجمجمة وقاعدتها سليمة وخالية من الكسور العظمية الحادة.`,
    impressionNarrative: `1. لا يوجد نزيف حاد داخل المخ أو تحت العنكبوتية (No Hemorrhage - Thrombolysis Candidate Safe).
2. علامات مبكرة جداً لنقص تروية حاد في نطاق الشريان المخي الأوسط الأيسر (Early acute ischemic changes in left MCA territory) بمؤشر ASPECTS = 8.
3. التوصية: فحص عاجل بواسطة قسطرة الشرايين المخية المقطعية (CT Angiography Head & Neck) لتقييم انسداد الأوعية الكبيرة (LVO) وسرعة اتخاذ قرار التدخل السريري.`,
    recommendations: 'إجراء قسطرة شرايين المخ المقطعية العاجلة (CTA Brain & Neck) لاستكمال تقييم الانسداد الشرياني الكبير، ومتابعة بروتوكول مذيب الجلطات بالطوارئ فورياً.',
    hasSignificantRecommendation: true,
    criticalFindingAlert: true,
    reportStatus: 'preliminary',
    signedBy: 'د. طلال السعيد',
    signedRole: 'استشاري الأشعة التشخيصية ورئيس قسم الطوارئ الشعاعية',
    signedAt: '2026-09-13 14:24',
    preliminarySignedBy: 'د. طلال السعيد',
    preliminarySignedAt: '2026-09-13 14:24',
    versionNumber: 1,
    addenda: [],
    orderingClinicianReviewed: false
  },
  'RAD-REP-2026-542': {
    id: 'RAD-REP-2026-542',
    studyId: 'STUDY-2026-902',
    accessionNumber: 'ACC-RAD-8821902',
    requestId: 'RAD-REQ-2026-104',
    patientId: 'pat-1004',
    patientName: 'خالد عبد الرحمن العتيبي',
    mrn: 'MRN-2026-0902',
    modality: 'XR',
    examTitleAr: 'تقرير أشعة سينية متنقلة على الصدر بالسرير (وحدة العناية المركزة)',
    examTitleEn: 'Portable Chest X-Ray AP Bedside (ICU Monitoring)',
    clinicalIndication: 'مريض على جهاز التنفس الصناعي - التأكد من موقع أنبوب الرغامي والقسطرة الوريدية المركزية',
    comparisonStudyContext: 'تمت المقارنة مع صورة الصدر السابقة بتاريخ 2026-09-12.',
    techniqueNarrative: 'صورة شعاعية رقمية مفردة للصدر بالسرير وضعية أمامية خلفية بجهاز الأشعة المتنقل الرقمي.',
    findingsNarrative: `- طرف أنبوب التنفس الرغامي (Endotracheal Tube) يقع على بعد 3.8 سم أعلى انقسام القصبة الهوائية (Carina)، وهو في موقع تشريحي سليم.
- قسطرة الخط الوريدي المركزي الأيمن (Right Internal Jugular CVC) ينتهي طرفها عند ملتقى الوريد الأجوف العلوي بالأذين الأيمن (Cavoatrial Junction) في موقع سليم.
- احتقان رئوي شبكي ثنائي الجانب مع عتامة ارتشاحية قاعدية بالرئة اليسرى متوافقة مع انخماص رئوي خفيف إلى متوسط.
- لا يوجد استرواح هوائي بالصدر (No Pneumothorax) ولا ارتشاح بلوري واضح.`,
    impressionNarrative: `1. أنبوب التنفس والقسطرة الوريدية المركزية في مواقع تشريحية صحيحة وسليمة.
2. ارتشاح وانخماص قاعدي أيسر طفيف إلى متوسط دون استرواح صدري.`,
    hasSignificantRecommendation: false,
    criticalFindingAlert: false,
    reportStatus: 'final',
    signedBy: 'د. شادي المهدي',
    signedRole: 'استشاري الأشعة الصدرية',
    signedAt: '2026-09-13 14:28',
    versionNumber: 2,
    addenda: [
      {
        id: 'add-01',
        versionNumber: 2,
        amendedAt: '2026-09-13 14:35',
        authorName: 'د. شادي المهدي',
        authorRole: 'استشاري الأشعة الصدرية',
        reasonForAmendment: 'إضافة توضيح حول أنبوب التغذية المعدي (Nasogastric Tube) استجابة لاستفسار طبيب العناية المركزة',
        addendumText: 'ملحق رقم 1: تمت إعادة مراجعة الصورة لتحديد موقع أنبوب التغذية الأنفي المعدي (NG Tube): يظهر طرف الأنبوب في تجويف المعدة أسفل الحجاب الحاجز الأيسر بمسافة مناسبة وهو آمن لبدء التغذية المعوية.'
      }
    ],
    orderingClinicianReviewed: true,
    orderingClinicianReviewedAt: '2026-09-13 14:40'
  }
};

// ----------------------------------------------------------------------------
// 10. CRITICAL FINDINGS COMMUNICATIONS LOG (Configured Communication Policy)
// ----------------------------------------------------------------------------
export const MOCK_CRITICAL_COMMUNICATIONS: CriticalFindingCommunication[] = [
  {
    id: 'crit-comm-001',
    reportId: 'RAD-REP-2026-550',
    accessionNumber: 'ACC-RAD-8821901',
    patientName: 'محمود سعد الدين إبراهيم',
    mrn: 'MRN-2026-0814',
    findingSeverity: 'critical_panic',
    findingDescription: 'علامات مبكرة لنقص تروية حاد في نطاق الشريان المخي الأوسط الأيسر (MCA Early Ischemia - ASPECTS 8) دون وجود نزيف دماغي حاد.',
    recipientType: 'receiving_clinician',
    communicatedToClinicianName: 'د. سامح عبد الرازق',
    communicatedToClinicianRole: 'استشاري طب الطوارئ المعالج',
    clinicianDepartment: 'Emergency Medicine (Trauma Bay 03)',
    communicationChannel: 'direct_phone',
    readBackVerified: true,
    readBackStatement: 'أكد د. سامح عبد الرازق استلام النتيجة نصياً: عدم وجود نزيف دماغي، ASPECTS = 8، والبدء الفوري في بروتوكول إذابة الجلطة ونقل المريض لغرفة القسطرة الدماغية.',
    communicatedAt: '2026-09-13 14:26',
    communicatedByRadiologist: 'د. طلال السعيد (استشاري الأشعة)',
    acknowledgementStatus: 'acknowledged'
  }
];

// ----------------------------------------------------------------------------
// 11. PORTABLE & IR CONTEXTS (Configured Procedure Profile & Mock Device Context)
// ----------------------------------------------------------------------------
export const MOCK_PORTABLE_IMAGING_CASES: PortableImagingContext[] = [
  {
    id: 'port-001',
    requestId: 'RAD-REQ-2026-104',
    patientName: 'خالد عبد الرحمن العتيبي',
    mrn: 'MRN-2026-0902',
    locationWardBed: 'العناية المركزة للصدرية - سرير 04',
    modalityMachineId: 'Mobile-XR-01',
    isolationType: 'droplet',
    batteryLevelPercent: 88,
    dispatchStatus: 'acquired',
    notes: 'تمت العملية بارتداء الواقيات الكاملة وفق احتياطات العزل للمريض، ونقلت الصورة لاسلكياً بنجاح.'
  }
];

export const MOCK_IR_CASES: InterventionalRadiologyContext[] = [
  {
    id: 'ir-case-001',
    requestId: 'RAD-REQ-2026-105',
    procedureNameAr: 'أخذ عينة كبدية موجهة بالأشعة المقطعية (CT-Guided Core Biopsy)',
    procedureNameEn: 'Percutaneous CT-Guided Liver Biopsy',
    patientName: 'عبد الله إبراهيم الدوسري',
    mrn: 'MRN-2026-0681',
    requirementProfile: {
      coagulationReviewRequired: true,
      consentRequired: true,
      sedationRequired: true,
      recoveryBedRequired: true,
      specimenHandlingRequired: true
    },
    consentSigned: true,
    anticoagulationLabStatus: 'inr_cleared',
    sedationPlanned: 'sedation_anesthesia_context',
    irSuiteId: 'room-ir-1',
    procedureStage: 'pre_procedure_prep',
    recoveryBedAssigned: 'IR Recovery Bay 02',
    specimensCollectedCount: 0,
    specimenContext: {
      collected: false,
      containerId: 'CONT-LIV-091',
      downstreamPathologyWorkflowLinked: true,
      specimenType: 'خزعة كبدية إبرية (Liver Core)'
    }
  }
];

export const MOCK_EXTERNAL_STUDIES: ExternalImagingStudy[] = [
  {
    id: 'ext-001',
    patientName: 'نوران حسام الشافعي',
    mrn: 'MRN-2026-0820',
    sourceFacilityName: 'مستشفى الملك فيصل التخصصي ومركز الأبحاث (KFSH&RC)',
    studyDate: '2026-01-15',
    modality: 'CT',
    studyDescription: 'CT Chest, Abdomen & Pelvis with IV Contrast',
    mediaFormat: 'cd_dvd',
    importStatus: 'ready_for_comparison',
    externalReportSummary: 'التقرير الخارجي يوضح وجود كتلة أولية بالمستقيم مع ورم ثانوي وحيد بالفص الكبدي الأيسر مقاس 2.1 سم.',
    secondaryInterpretationRequested: false
  }
];

// ----------------------------------------------------------------------------
// 12. OPERATIONAL HOME METRICS (High Information Density)
// ----------------------------------------------------------------------------
export const MOCK_RADIOLOGY_OPERATIONAL_INDICATORS: RadiologyOperationalIndicators = {
  incomingRequestsCount: 14,
  unscheduledCount: 5,
  scheduledTodayCount: 22,
  arrivedWaitingCount: 6,
  preparationIncompleteCount: 3,
  readyForModalityCount: 4,
  acquisitionInProgressCount: 3,
  awaitingTechnicalQcCount: 2,
  awaitingInterpretationCount: 7,
  preliminaryCount: 2,
  awaitingFinalSignoffCount: 3,
  delayedNeedsAttentionCount: 2,
  addendumCorrectionCount: 1,
  activeRoomsCount: 6,
  totalRoomsCount: 8,
  recentCompletedCount: 38
};
