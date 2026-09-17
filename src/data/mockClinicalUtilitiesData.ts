// =============================================================
// MOCK DATA: CROSS-ROLE CLINICAL UTILITIES
// UI/UX INTERACTIVE PROTOTYPE ONLY
// =============================================================

import {
  ConsultCoordinationItem,
  HandoverCoordinationItem,
  MessageThread,
  ChatMessage,
  AttentionNotification,
  ChatParticipant
} from '../types/clinicalUtilities';

// -------------------------------------------------------------
// 1. MOCK CONSULTATION COORDINATION ITEMS
// -------------------------------------------------------------
export const INITIAL_MOCK_CONSULTS: ConsultCoordinationItem[] = [
  {
    id: 'consult-coord-101',
    patientId: 'pat-2',
    patientName: 'فاطمة محمود الجندي',
    mrn: 'MRN-72319',
    age: 42,
    gender: 'female',
    encounterId: 'ENC-ER-72319',
    encounterType: 'طوارئ ER (Cubicle-05)',
    currentLocation: 'قسم الطوارئ - كشك الفحص ER-05',
    requestingDepartment: 'قسم الطوارئ والحوادث (ER)',
    requestingDoctor: 'د. سامح بدر (طبيب عام طوارئ)',
    requestingDoctorRole: 'Emergency Medicine Specialist',
    requestedSpecialty: 'جراحة عامة ومناظير (General Surgery)',
    targetConsultant: 'د. وليد الصاوي (استشاري جراحة مناوب)',
    clinicalQuestion:
      'مريضة 42 سنة تعاني من ألم حاد بالربع السفلي الأيمن للبطن (RLQ) لمدة 8 ساعات، مصحوب بارتفاع حرارة 38.6 وتفاعل ارتدادي إيجابي (Rebound tenderness + McBurney sign). تحليل الدم أظهر WBC 16,400 مع Neutrophilia. نرجو التقييم الجراحي العاجل لاحتمال التهاب زائدة دودية حاد (Acute Appendicitis) وتحديد الحاجة للتدخل الجراحي بالمنظار.',
    priority: 'urgent',
    requestedAt: '13:55 (منذ 45 دقيقة)',
    requestedResponseTimeframe: 'خلال ساعتين (Urgent Response Target)',
    lastUpdate: '14:15 - تم قبول الطلب وبدء المراجعة',
    requestStatus: 'active',
    operationalWorkStatus: 'in_progress',
    assignedClinician: 'د. وليد الصاوي',
    claimedByClinician: 'د. وليد الصاوي',
    isSourceActionable: true,
    resultingDocumentation: {
      noteId: 'note-consult-surg-101',
      noteTitle: 'تقرير استشارة جراحية: اشتباه التهاب زائدة دودية حاد',
      documentedBy: 'د. وليد الصاوي (استشاري جراحة عامة)',
      documentedAt: '14:35',
      summaryPreview:
        'تمت المعاينة السريرية في الطوارئ. الفحص متوافق مع Acute Appendicitis. نوصي بالصيام التام NPO، بدء سوائل وريدية ومضادات حيوية واسعة، وتجهيز المريضة لاستئصال الزائدة بالمنظار في OR-3.'
    },
    linkedWorkItemId: 'work-item-consult-202',
    linkedThreadId: 'thread-consult-72319',
    allowedActions: [
      'open_request',
      'open_patient',
      'open_work_item',
      'message_team',
      'add_coordination',
      'view_documentation',
      'document_consultation'
    ]
  },
  {
    id: 'consult-coord-102',
    patientId: 'pat-1',
    patientName: 'محمد السيد عبد الرحمن',
    mrn: 'MRN-88421',
    age: 58,
    gender: 'male',
    encounterId: 'ENC-ER-88421',
    encounterType: 'طوارئ ER (Acute Resus)',
    currentLocation: 'طوارئ - سرير 02 (حالات القلب الحرجة)',
    requestingDepartment: 'قسم الطوارئ والحوادث (ER)',
    requestingDoctor: 'د. طارق المنشاوي (استشاري قلب مناوب)',
    requestingDoctorRole: 'Emergency Cardiology Consultant',
    requestedSpecialty: 'القسطرة التداخلية وأمراض القلب (Interventional Cardiology)',
    targetConsultant: 'فريق القسطرة المناوب Cath Lab On-Call',
    clinicalQuestion:
      'مريض 58 سنة مصاب بارتفاع قطاع ST (STEMI في المساري السفلية II, III, aVF) مع صدمة قلبية خفيفة. التروبونين الأولي مرتفع STAT. نطلب استدعاء فريق القسطرة التداخلية لإجراء قسطرة فورية Primary PCI خلال نافذة 90 دقيقة (Door-to-Balloon).',
    priority: 'stat',
    requestedAt: '14:12 (منذ 28 دقيقة)',
    requestedResponseTimeframe: 'فوري STAT (خلال 15 دقيقة)',
    lastUpdate: '14:20 - تفعيل فريق القسطرة وتجهيز المعمل',
    requestStatus: 'active',
    operationalWorkStatus: 'in_progress',
    assignedClinician: 'د. كريم الشناوي (استشاري قسطرة)',
    claimedByClinician: 'د. كريم الشناوي',
    isSourceActionable: true,
    linkedWorkItemId: 'work-item-stat-cardio-01',
    linkedThreadId: 'thread-cardio-pci-88421',
    allowedActions: [
      'open_request',
      'open_patient',
      'open_work_item',
      'message_team',
      'add_coordination',
      'document_consultation'
    ]
  },
  {
    id: 'consult-coord-103',
    patientId: 'pat-4',
    patientName: 'زياد محمود الخولي',
    mrn: 'MRN-91045',
    age: 19,
    gender: 'male',
    encounterId: 'ENC-ER-91045',
    encounterType: 'طوارئ إنعاش حوادث (Resus Bay 1)',
    currentLocation: 'غرفة الإنعاش Resuscitation Bay 1',
    requestingDepartment: 'طوارئ وحوادث الطوارئ (Trauma Team)',
    requestingDoctor: 'د. وليد الصاوي (جراحة طوارئ وحوادث)',
    requestingDoctorRole: 'Trauma Surgeon',
    requestedSpecialty: 'جراحة المخ والأعصاب (Neurosurgery)',
    targetConsultant: 'د. عاصم فودة (استشاري مخ وأعصاب)',
    clinicalQuestion:
      'شاب 19 سنة، حادث دراجة نارية مع إصابة رضية بالرأس GCS 9 واشتباه نزيف تحت الجافية (SDH). الأشعة المقطعية للرأس CT Brain قيد التنفيذ الآن. نرجو التقييم العصبي الفوري لاحتمال وضع حساس ضغط الدماغ ICP Monitor أو التفريغ الجراحي.',
    priority: 'stat',
    requestedAt: '14:26 (منذ 14 دقيقة)',
    requestedResponseTimeframe: 'فوري STAT (خلال 15 دقيقة)',
    lastUpdate: '14:30 - الاستشاري في طريقه لمعاينة المريض في الإنعاش',
    requestStatus: 'active',
    operationalWorkStatus: 'claimed',
    assignedClinician: 'د. عاصم فودة',
    claimedByClinician: 'د. عاصم فودة',
    isSourceActionable: true,
    linkedWorkItemId: 'work-item-neuro-91045',
    allowedActions: ['open_request', 'open_patient', 'open_work_item', 'message_team', 'document_consultation']
  },
  {
    id: 'consult-coord-104',
    patientId: 'pat-ward-2',
    patientName: 'إبراهيم حسن النجار',
    mrn: 'MRN-33019',
    age: 67,
    gender: 'male',
    encounterId: 'ENC-IPD-33019',
    encounterType: 'تنويم باطنة (Ward 4B - Bed 402)',
    currentLocation: 'جناح الباطنة 4B - سرير 402',
    requestingDepartment: 'جناح التنويم الباطني 4B',
    requestingDoctor: 'د. منى زكي (أخصائي باطنة)',
    requestingDoctorRole: 'Internal Medicine Specialist',
    requestedSpecialty: 'أمراض الكلى والغسيل الكلوي (Nephrology)',
    clinicalQuestion:
      'مريض 67 سنة منوم بجرثومة دموية مع ارتفاع مفاجئ في الكرياتينين من 1.2 إلى 3.4 mg/dL وهبوط إدرار البول (Acute Kidney Injury KDIGO Stage 3). نطلب استشارة لتعديل جرعات الأدوية وتقييم الحاجة لجلسة غسيل كلوي طارئة.',
    priority: 'urgent',
    requestedAt: '11:30 (منذ 3 ساعات)',
    requestedResponseTimeframe: 'خلال 4 ساعات',
    lastUpdate: '12:10 - طلب معلومات إضافية عن سونار الكلى',
    requestStatus: 'active',
    operationalWorkStatus: 'waiting_for_info',
    assignedClinician: 'د. حاتم رضوان (استشاري كلى)',
    isSourceActionable: true,
    linkedWorkItemId: 'work-item-nephro-33019',
    allowedActions: ['open_request', 'open_patient', 'open_work_item', 'message_team', 'add_coordination']
  },
  {
    id: 'consult-coord-105',
    patientId: 'pat-3',
    patientName: 'عبد الله صالح العمري',
    mrn: 'MRN-55102',
    age: 63,
    gender: 'male',
    encounterId: 'ENC-OPD-55102',
    encounterType: 'عيادة خارجية (OPD)',
    currentLocation: 'عيادة السكري والغدد الصماء',
    requestingDepartment: 'عيادات السكري والغدد الصماء',
    requestingDoctor: 'د. هاني عثمان (استشاري غدد صماء)',
    requestingDoctorRole: 'Endocrinologist',
    requestedSpecialty: 'طب وجراحة العيون (Ophthalmology)',
    clinicalQuestion:
      'فحص قاع العين السنوي الدوري لمريض سكري نوع ثاني منذ 14 عاماً، مع شكوى من زغللة حديثة بالعين اليمنى (اعتلال شبكية سكري Diabetic Retinopathy Screening).',
    priority: 'routine',
    requestedAt: 'أمس 16:00',
    requestedResponseTimeframe: 'خلال 24-48 ساعة (Routine)',
    lastUpdate: 'تم إلغاء الطلب وتحويله لموعد خارجي بناءً على رغبة المريض',
    requestStatus: 'cancelled',
    operationalWorkStatus: 'completed',
    isSourceActionable: false,
    sourceChangedWarning:
      '⚠️ تم إلغاء طلب الاستشارة الأصلي من قبل الطبيب المعالج وتحويله لعيادة خارجية خاصة. الطلب غير قابل للتنفيذ السريري حالياً.',
    allowedActions: ['open_request', 'open_patient']
  },
  {
    id: 'consult-coord-106',
    patientId: 'pat-ward-1',
    patientName: 'مريم عبد الله الشهري',
    mrn: 'MRN-60291',
    age: 51,
    gender: 'female',
    encounterId: 'ENC-IPD-60291',
    encounterType: 'تنويم جراحة (Ward 3A - Bed 305)',
    currentLocation: 'جناح الجراحة 3A - سرير 305',
    requestingDepartment: 'جناح الجراحة 3A',
    requestingDoctor: 'د. عادل منصور (أخصائي جراحة)',
    requestingDoctorRole: 'General Surgery Specialist',
    requestedSpecialty: 'التغذية العلاجية السريرية (Clinical Nutrition)',
    clinicalQuestion:
      'مريضة بعد استئصال قولون جزئي (Post-Colectomy Day 4) مع بطء في استعادة حركة الأمعاء. نرجو تقييم البدء في التغذية الوريدية الشاملة TPN مقابل التغذية المعوية التدريجية.',
    priority: 'routine',
    requestedAt: '12:00 (منذ ساعتين)',
    requestedResponseTimeframe: '', // No configured target in institutional policy (Neutral missing state)
    lastUpdate: '12:05 - تم استلام الطلب بقائمة الانتظار',
    requestStatus: 'active',
    operationalWorkStatus: 'unassigned',
    isSourceActionable: true,
    linkedWorkItemId: 'work-item-nutr-60291',
    allowedActions: ['open_request', 'open_patient', 'open_work_item', 'add_coordination']
  }
];

// -------------------------------------------------------------
// 2. MOCK HANDOVER CENTER ITEMS
// -------------------------------------------------------------
export const INITIAL_MOCK_HANDOVERS: HandoverCoordinationItem[] = [
  {
    id: 'handover-coord-201',
    patientId: 'pat-icu-1',
    patientName: 'سليمان خالد العتيبي',
    mrn: 'MRN-41902',
    age: 64,
    gender: 'male',
    encounterId: 'ENC-ICU-41902',
    currentLocation: 'العناية المركزة ICU - سرير 01 (Isolation)',
    sendingTeam: {
      service: 'طاقم العناية المركزة المناوبة الليلية (Night ICU Shift)',
      clinician: 'د. خالد عبد العزيز (استشاري عناية ليلية)',
      role: 'Night Intensivist',
      unit: 'Medical/Surgical ICU',
      contactNumber: 'Ext. 3401'
    },
    receivingTeam: {
      service: 'طاقم العناية المركزة المناوبة الصباحية (Day ICU Shift)',
      clinician: 'د. نادية الشربيني (استشاري العناية الصباحي)',
      role: 'Day Intensivist Lead',
      unit: 'Medical/Surgical ICU'
    },
    handoverType: 'shift_change',
    handoverTime: '14:00 (تسليم مناوبة الظهر)',
    handoverStatus: 'awaiting_receipt',
    criticalAttentionIndicator: true,
    criticalAlertNote: 'مريض على جهاز تنفس صناعي SIMV + تسريب نورايبنفرين مستمر 14 mcg/min وحموضة دم أيضية',
    outstandingContextCount: 3,
    summaryProjection: {
      templateId: 'SBAR',
      templateName: 'قالب SBAR الموحد (Standard SBAR Profile)',
      sections: [
        { key: 'situation', label: 'S — الوضع الحالي (Situation)', content: 'صدمة إنتانية رئوية مع متلازمة الضائقة التنفسية الحادة (Septic Shock + ARDS) بعد جراحة استكشاف بطن.', displayOrder: 1 },
        { key: 'background', label: 'B — الخلفية المرضية (Background)', content: 'اليوم الثالث في العناية، تاريخ سكري وارتفاع ضغط ومرض قصور قلبي مزمن (EF 35%).', displayOrder: 2 },
        { key: 'assessment', label: 'A — التقييم السريري (Assessment)', content: 'علامات حيوية مستقرة نسبياً على النورأدرينالين. الضغط الشرياني 118/68، غازات الدم PaO2/FiO2 = 180.', displayOrder: 3 },
        { key: 'recommendation', label: 'R — التوصيات والخطة (Recommendation)', content: 'متابعة معايرة الفازوبريسورات لخفض الجرعة تدريجياً، مراقبة وظائف الكلى وإدرار البول، وإجراء تقييم الفطام التنفسي (SBT) غداً صباحاً.', displayOrder: 4 }
      ]
    },
    sbarSummary: {
      situation: 'صدمة إنتانية رئوية مع متلازمة الضائقة التنفسية الحادة (Septic Shock + ARDS) بعد جراحة استكشاف بطن.',
      background: 'اليوم الثالث في العناية، تاريخ سكري وارتفاع ضغط ومرض قصور قلبي مزمن (EF 35%).',
      assessment: 'علامات حيوية مستقرة نسبياً على النورأدرينالين. الضغط الشرياني 118/68، غازات الدم PaO2/FiO2 = 180.',
      recommendation:
        'متابعة معايرة الفازوبريسورات لخفض الجرعة تدريجياً، مراقبة وظائف الكلى وإدرار البول، وإجراء تقييم الفطام التنفسي (SBT) غداً صباحاً.'
    },
    allowedActions: ['preview', 'open_axis_10', 'open_patient', 'acknowledge_receipt', 'contact_sender']
  },
  {
    id: 'handover-coord-202',
    patientId: 'pat-1',
    patientName: 'محمد السيد عبد الرحمن',
    mrn: 'MRN-88421',
    age: 58,
    gender: 'male',
    encounterId: 'ENC-ER-88421',
    currentLocation: 'طوارئ - سرير 02 ➔ معمل القسطرة Cath Lab',
    sendingTeam: {
      service: 'فريق طوارئ القلب والحالات الحادة (ER Acute Care)',
      clinician: 'د. طارق المنشاوي',
      role: 'Emergency Cardiologist',
      unit: 'ER Acute Bay',
      contactNumber: 'Ext. 2102'
    },
    receivingTeam: {
      service: 'فريق القسطرة التداخلية ومعمل القسطرة (Cath Lab Team)',
      clinician: 'د. كريم الشناوي',
      role: 'Interventional Cardiologist',
      unit: 'Cath Lab Suite 1'
    },
    handoverType: 'unit_transfer',
    handoverTime: '14:30',
    handoverStatus: 'received',
    acknowledgedBy: 'د. كريم الشناوي (استشاري قسطرة)',
    acknowledgedAt: '14:32',
    criticalAttentionIndicator: true,
    criticalAlertNote: 'STEMI سفلي حاد، تم إعطاء تحميل الأسبرين والبلافيكس، المريض ينقل مع مونيتور نقال وطبيب مرافق',
    outstandingContextCount: 1,
    sbarSummary: {
      situation: 'انتقال فوري من الطوارئ لمعمل القسطرة لإجراء Primary PCI لانسداد الشريان التاجي الأيمن RCA.',
      background: 'بدء الألم منذ 3 ساعات، لا يوجد موانع إعطاء مضادات التخثر.',
      assessment: 'ضغط الدم 160/98، تروبونين مرتفع، تم تركيب خطين وريديين واسعين 18G.',
      recommendation: 'تجهيز الشريان الكعبري الأيمن للبدء فور وصول المريض لطاولة القسطرة.'
    },
    allowedActions: ['preview', 'open_axis_10', 'open_patient', 'contact_sender']
  },
  {
    id: 'handover-coord-203',
    patientId: 'pat-ward-1',
    patientName: 'سارة عبد الله القحطاني',
    mrn: 'MRN-19402',
    age: 36,
    gender: 'female',
    encounterId: 'ENC-IPD-19402',
    currentLocation: 'جناح النساء والتوليد والجراحة 3A - سرير 301',
    sendingTeam: {
      service: 'تمريض جناح 3A (مناوبة الصباح)',
      clinician: 'إيمان حامد (RN Charge Nurse)',
      role: 'Staff Nurse',
      unit: 'Surgical Ward 3A'
    },
    receivingTeam: {
      service: 'تمريض جناح 3A (مناوبة المساء)',
      clinician: 'رنا زاهر (RN Evening Lead)',
      role: 'Evening Nurse',
      unit: 'Surgical Ward 3A'
    },
    handoverType: 'shift_change',
    handoverTime: '14:15',
    handoverStatus: 'awaiting_receipt',
    criticalAttentionIndicator: false,
    outstandingContextCount: 2,
    sbarSummary: {
      situation: 'اليوم الأول بعد عملية استئصال الغدة الدرقية الجزئي (Post-Thyroidectomy Day 1).',
      background: 'تاريخ تضخم الغدة الدرقية متعدد العقد الحميد.',
      assessment: 'جرح الرقبة نظيف بدون تجمع دموي، صوت المريضة سليم بدون بحة، لا توجد أعراض نقص كالسيوم.',
      recommendation: 'مراقبة مستوى الكالسيوم المصلي الساعة 18:00 وإعطاء المسكنات الفموية حسب الحاجة.'
    },
    allowedActions: ['preview', 'open_axis_10', 'open_patient', 'acknowledge_receipt', 'contact_sender']
  },
  {
    id: 'handover-coord-204',
    patientId: 'pat-or-2',
    patientName: 'منى خليل السعدي',
    mrn: 'MRN-50821',
    age: 42,
    gender: 'female',
    encounterId: 'ENC-OR-50821',
    currentLocation: 'غرفة إفاقة العمليات PACU ➔ جناح الجراحة 3B',
    sendingTeam: {
      service: 'طاقم إفاقة العمليات (PACU Nursing)',
      clinician: 'سناء يوسف (PACU Staff RN)',
      role: 'Recovery Nurse',
      unit: 'Post-Anesthesia Care Unit'
    },
    receivingTeam: {
      service: 'جناح الجراحة العامة 3B',
      unit: 'Surgical Ward 3B'
    },
    handoverType: 'procedure_transit',
    handoverTime: '13:45',
    handoverStatus: 'superseded',
    isSourceSuperseded: true,
    supersededReason:
      '⚠️ تم تعديل وجهة النقل إلى سرير العناية المتوسطة HDU-02 بدلاً من جناح 3B بسبب هبوط ضغط مؤقت بعد الإفاقة.',
    criticalAttentionIndicator: true,
    outstandingContextCount: 1,
    sbarSummary: {
      situation: 'استئصال زائدة بالمنظار انتهت الساعة 12:30.',
      background: 'مؤشر ألدرتي 8/10.',
      assessment: 'تم تحديث التسليم في مسار Axis 10 مع الفريق الجديد.',
      recommendation: 'مراجعة نموذج التسليم المحدث في وحدة HDU.'
    },
    allowedActions: ['preview', 'open_axis_10', 'open_patient']
  },
  {
    id: 'handover-coord-205',
    patientId: 'pat-ped-1',
    patientName: 'عمر ياسر الزهراني',
    mrn: 'MRN-77319',
    age: 7,
    gender: 'male',
    encounterId: 'ENC-PED-77319',
    currentLocation: 'جناح تنويم الأطفال 2B - سرير 204',
    sendingTeam: {
      service: 'فريق أطباء الأطفال المناوبين (Pediatric Residents Day)',
      clinician: 'د. يوسف التميمي (طبيب مقيم أطفال)',
      role: 'Day Pediatric Resident',
      unit: 'Pediatric Medical Ward 2B',
      contactNumber: 'Ext. 2480'
    },
    receivingTeam: {
      service: 'فريق مناوبة الأطفال المسائية (Pediatric On-Call Night)',
      clinician: 'د. لمياء الفهد (أخصائي أطفال مناوب)',
      role: 'Night Pediatric Registrar',
      unit: 'Pediatric Medical Ward 2B'
    },
    handoverType: 'shift_change',
    handoverTime: '15:00',
    handoverStatus: 'awaiting_receipt',
    criticalAttentionIndicator: true,
    criticalAlertNote: 'حماض كيتوني سكري (DKA) مع تسريب أنسولين وريدي مستمر وسوائل تعويضية',
    outstandingContextCount: 4,
    summaryProjection: {
      templateId: 'IPASS',
      templateName: 'قالب I-PASS لتسليم الأطباء (Pediatric I-PASS)',
      sections: [
        {
          key: 'illness_severity',
          label: 'I — شدة المرض (Illness Severity)',
          content: 'حالة غير مستقرة (Unstable) • مراقبة دقيقة ومستمرة لعلامات التدهور العصبي والحيوي.',
          displayOrder: 1
        },
        {
          key: 'patient_summary',
          label: 'P — ملخص المريض السريري (Patient Summary)',
          content: 'طفل 7 سنوات مشخص حديثاً بالسكري النوع الأول، دخل بحماض كيتوني DKA وجفاف متوسط (PH 7.15, HCO3 9, Glucose 480). يتلقى حالياً Regular Insulin 0.05 units/kg/hr ومحاليل 0.9% Saline مع إضافة بوتاسيوم.',
          displayOrder: 2
        },
        {
          key: 'action_list',
          label: 'A — قائمة الإجراءات المطلوبة (Action List)',
          content: '1. فحص غازات الدم الوريدي VBG والكهارل كل ساعتين (الفحص القادم الساعة 16:00).\n2. فحص السكر كل ساعة (الهدف بين 150-200 mg/dL).\n3. إضافة دكستروز 5% للمحاليل الوريدية فور نزول السكر دون 250 mg/dL لمنع هبوط السكر المفاجئ.',
          displayOrder: 3
        },
        {
          key: 'situation_awareness',
          label: 'S — الوعي بالموقف وخطط الطوارئ (Situation Awareness & Contingency)',
          content: 'في حال حدوث صداع مفاجئ، تباطؤ نبض، أو تدني درجة الوعي: اشتباه وذمة دماغية (Cerebral Edema) ➔ إيقاف الأنسولين فوراً، رفع رأس السرير 30 درجة، وإعطاء مانيتول 20% (0.5g/kg) واستدعاء الاستشاري فوراً.',
          displayOrder: 4
        },
        {
          key: 'synthesis',
          label: 'S — الإيجاز والتأكيد المتبادل (Synthesis by Receiver)',
          content: 'تمت مراجعة خطة السوائل والأنسولين والتأكد من توافر جرعة المانيتول في صيدلية الجناح للطوارئ.',
          displayOrder: 5
        }
      ]
    },
    allowedActions: ['preview', 'open_axis_10', 'open_patient', 'acknowledge_receipt', 'contact_sender']
  },
  {
    id: 'handover-coord-206',
    patientId: 'pat-onc-2',
    patientName: 'فاطمة أحمد السالم',
    mrn: 'MRN-90214',
    age: 49,
    gender: 'female',
    encounterId: 'ENC-ONC-90214',
    currentLocation: 'مركز الأورام - وحدة العلاج اليومي والكيماوي - كرسي 08',
    sendingTeam: {
      service: 'تمريض الأورام والجرعات الكيماوية (Chemotherapy Infusion Team)',
      clinician: 'نجلاء الشهري (RN Oncology Certified)',
      role: 'Chemo Infusion Nurse',
      unit: 'Day Care Oncology',
      contactNumber: 'Ext. 5110'
    },
    receivingTeam: {
      service: 'تمريض تنويم الأورام المسائي (Inpatient Oncology Ward)',
      clinician: 'أمل المطيري (RN Inpatient Charge)',
      role: 'Inpatient Oncology Lead',
      unit: 'Oncology Ward 5A'
    },
    handoverType: 'unit_transfer',
    handoverTime: '14:45',
    handoverStatus: 'awaiting_receipt',
    criticalAttentionIndicator: true,
    criticalAlertNote: 'بروتوكول علاج كيماوي عالي السمية AC مع احتياطات تسرب الدواء السام Cytotoxic Precautions',
    outstandingContextCount: 2,
    summaryProjection: {
      templateId: 'LOCAL_TEMPLATE',
      templateName: 'نموذج التسليم التمريضي التخصصي (Specialized Oncology Nursing Profile)',
      sections: [
        {
          key: 'primary_diagnosis',
          label: 'التشخيص والبروتوكول العلاجي (Diagnosis & Protocol)',
          content: 'سرطان الثدي الغازي المرحلة الثانية، تتلقى دورة العلاج الكيماوي الأولى AC (Doxorubicin + Cyclophosphamide).',
          displayOrder: 1
        },
        {
          key: 'access_and_lines',
          label: 'القسطرة الوريدية والتسريب (Access & Infusion Status)',
          content: 'منفذ وريدي مزروع سليم (Port-A-Cath) في الصدر الأيمن مع رجوع دموي إيجابي وبدون أي علامات تسرب extravasation. تم إكمال جرعة Doxorubicin بنجاح.',
          displayOrder: 2
        },
        {
          key: 'toxicities_and_precautions',
          label: 'السمية والاحتياطات الخاصة (Toxicities & Precautions)',
          content: 'تطبيق احتياطات التعامل مع الأدوية السامة للخلايا (Cytotoxic Precautions) لمدة 48 ساعة. إعطاء مضاد القيء Ondansetron + Dexamethasone حسب الجدول.',
          displayOrder: 3
        },
        {
          key: 'shift_targets',
          label: 'أهداف المتابعة للمناوبة (Shift Target & Monitoring)',
          content: 'مراقبة الصادر والوارد بدقة (Strict Intake/Output)، فحص الحرارة كل 4 ساعات، والتأكد من شرب السوائل الكافية لمنع التهاب المثانة النزفي.',
          displayOrder: 4
        }
      ]
    },
    allowedActions: ['preview', 'open_axis_10', 'open_patient', 'acknowledge_receipt', 'contact_sender']
  }
];

// -------------------------------------------------------------
// 3. MOCK DIRECTORY OF STAFF & TEAMS
// -------------------------------------------------------------
export const MOCK_STAFF_DIRECTORY: ChatParticipant[] = [
  {
    id: 'staff-doc-1',
    name: 'د. طارق المنشاوي',
    role: 'استشاري أمراض القلب والطوارئ',
    specialty: 'Cardiology & Emergency',
    unit: 'ER / CCU',
    presence: 'available',
    isCurrentUser: true
  },
  {
    id: 'staff-pharm-1',
    name: 'د. منى الدسوقي (PharmD)',
    role: 'صيدلي إكلينيكي - العناية الحرجة والطوارئ',
    specialty: 'Clinical Pharmacy',
    unit: 'Pharmacy / ICU / ER',
    presence: 'available'
  },
  {
    id: 'staff-surg-1',
    name: 'د. وليد الصاوي',
    role: 'استشاري جراحة عامة وحوادث',
    specialty: 'General Surgery & Trauma',
    unit: 'OR / Trauma Bay',
    presence: 'in_procedure'
  },
  {
    id: 'staff-intensivist-1',
    name: 'د. خالد عبد العزيز',
    role: 'استشاري العناية المركزة ورئيس القسم',
    specialty: 'Critical Care Medicine',
    unit: 'ICU',
    presence: 'busy'
  },
  {
    id: 'staff-nurse-1',
    name: 'سارة مصطفى (RN)',
    role: 'مسؤولة تمريض الفرز والإنعاش',
    specialty: 'Emergency Nursing',
    unit: 'ER Triage',
    presence: 'available'
  },
  {
    id: 'staff-rad-1',
    name: 'د. إيهاب سلامة',
    role: 'استشاري الأشعة التشخيصية والتداخلية',
    specialty: 'Radiology',
    unit: 'Radiology / CT',
    presence: 'available'
  },
  {
    id: 'team-cath-lab',
    name: 'فريق القسطرة القلبية التداخلية (Cath Lab Team)',
    role: 'Interventional Cardiology Team',
    specialty: 'Cardiology',
    unit: 'Cath Lab',
    presence: 'available'
  },
  {
    id: 'team-icu-shift',
    name: 'فريق العناية المركزة المناوب (ICU On-Call)',
    role: 'ICU Multidisciplinary Team',
    specialty: 'Critical Care',
    unit: 'ICU',
    presence: 'available'
  }
];

// -------------------------------------------------------------
// 4. MOCK CLINICAL COMMUNICATION THREADS & MESSAGES
// -------------------------------------------------------------
export const INITIAL_MOCK_THREADS: MessageThread[] = [
  {
    id: 'thread-pharm-pat1',
    threadType: 'patient_linked',
    title: 'تداخل دوائي حرج: خطة مضادات التجلط المزدوجة والهيبارين',
    patientContext: {
      patientId: 'pat-1',
      patientName: 'محمد السيد عبد الرحمن',
      mrn: 'MRN-88421',
      encounterId: 'ENC-ER-88421',
      location: 'طوارئ - سرير 02 (حالات القلب)',
      criticalAlert: '⚠️ تنبيه صيدلاني: خطر نزف مرتفع + هبوط وظائف كلى eGFR 48'
    },
    participants: [
      MOCK_STAFF_DIRECTORY[0], // Dr. Tarek (Current)
      MOCK_STAFF_DIRECTORY[1]  // PharmD Mona
    ],
    lastMessage: {
      id: 'msg-104',
      senderName: 'د. منى الدسوقي (PharmD)',
      senderRole: 'Clinical Pharmacist',
      text: 'دكتور طارق، مع جرعة التحميل Clopidogrel 600mg والأسبرين، أنصح بتخفيض جرعة الهيبارين الوريدي إلى 60 units/kg bolus بدون تجاوز 4000 units لتفادي خطر النزيف الرأسي.',
      timestamp: '14:24',
      status: 'read',
      urgency: 'priority'
    },
    unreadCount: 1,
    priority: 'priority',
    relatedContextType: 'pharmacy_concern',
    linkedResourceId: 'order-med-heparin-88421',
    linkedWorkItemId: 'work-item-med-review-01'
  },
  {
    id: 'thread-consult-72319',
    threadType: 'patient_linked',
    title: 'تنسيق استشارة جراحية: اشتباه التهاب زائدة دودية حاد',
    patientContext: {
      patientId: 'pat-2',
      patientName: 'فاطمة محمود الجندي',
      mrn: 'MRN-72319',
      encounterId: 'ENC-ER-72319',
      location: 'طوارئ - كشك 05'
    },
    participants: [
      MOCK_STAFF_DIRECTORY[0], // Dr. Tarek
      MOCK_STAFF_DIRECTORY[2]  // Dr. Walid (Surgeon)
    ],
    lastMessage: {
      id: 'msg-203',
      senderName: 'د. وليد الصاوي',
      senderRole: 'Surgeon',
      text: 'تمت معاينة المريضة، العلامات السريرية تؤكد التهاب الزائدة. وثقت الاستشارة في Axis 5 وأمرت بإدراجها في OR-3.',
      timestamp: '14:38',
      status: 'read',
      urgency: 'normal'
    },
    unreadCount: 0,
    priority: 'normal',
    relatedContextType: 'consult',
    linkedResourceId: 'consult-coord-101'
  },
  {
    id: 'thread-op-icu-bed',
    threadType: 'team_operational',
    title: 'جاهزية أسرة العناية المركزة وتحويل حالات الطوارئ',
    participants: [
      MOCK_STAFF_DIRECTORY[0],
      MOCK_STAFF_DIRECTORY[3], // Dr. Khaled (ICU lead)
      MOCK_STAFF_DIRECTORY[4]  // Sara (Nurse)
    ],
    lastMessage: {
      id: 'msg-302',
      senderName: 'د. خالد عبد العزيز',
      senderRole: 'ICU Head',
      text: 'سرير ICU-03 تم تعقيمه وهو متاح الآن لاستقبال حالة الصدمة الإنتانية من الطوارئ فور انتهاء التثبيت الأولي.',
      timestamp: '14:10',
      status: 'delivered',
      urgency: 'normal'
    },
    unreadCount: 0,
    priority: 'normal',
    relatedContextType: 'operational'
  },
  {
    id: 'thread-or-turnover-delay',
    threadType: 'team_operational',
    title: 'تنسيق جدول غرف العمليات OR-2 وتأخير التعقيم',
    participants: [
      MOCK_STAFF_DIRECTORY[0],
      MOCK_STAFF_DIRECTORY[2]
    ],
    lastMessage: {
      id: 'msg-401',
      senderName: 'فريق مكافحة العدوى والعمليات',
      senderRole: 'OR Infection Control',
      text: 'تم رصد تأخير 35 دقيقة في تطهير الغرفة OR-2 بعد حالة التبديل السابقة. بدء حالة الركبة الروبوتية سيكون في 14:45.',
      timestamp: '13:50',
      status: 'read',
      urgency: 'normal'
    },
    unreadCount: 0,
    priority: 'normal',
    relatedContextType: 'operational'
  }
];

export const INITIAL_MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'thread-pharm-pat1': [
    {
      id: 'msg-101',
      threadId: 'thread-pharm-pat1',
      senderId: 'staff-pharm-1',
      senderName: 'د. منى الدسوقي (PharmD)',
      senderRole: 'Clinical Pharmacist',
      text: 'مرحباً د. طارق، راجعت الأوامر الدوائية لمريض الجلطة محمد السيد عبد الرحمن (MRN-88421).',
      timestamp: '14:18',
      status: 'read',
      urgency: 'normal'
    },
    {
      id: 'msg-102',
      threadId: 'thread-pharm-pat1',
      senderId: 'staff-doc-1',
      senderName: 'د. طارق المنشاوي',
      senderRole: 'Cardiologist',
      text: 'أهلاً د. منى، هل هناك تعارض مع دواء التحميل المزدوج أو مانع التخثر؟',
      timestamp: '14:20',
      status: 'read',
      urgency: 'normal'
    },
    {
      id: 'msg-103',
      threadId: 'thread-pharm-pat1',
      senderId: 'staff-pharm-1',
      senderName: 'د. منى الدسوقي (PharmD)',
      senderRole: 'Clinical Pharmacist',
      text: 'نعم، المريض لديه كرياتينين 1.6 mg/dL مع eGFR 48 mL/min. مع خطة القسطرة الفورية واستخدام الصبغة، نوصي بهيدرة وريدية سالين 0.9% وحساب جرعة الهيبارين بدقة.',
      timestamp: '14:22',
      status: 'read',
      urgency: 'priority',
      linkedResource: {
        type: 'order',
        label: 'أمر دوائي: Unfractionated Heparin IV Infusion',
        id: 'order-med-heparin-88421',
        targetAxis: 'medications'
      }
    },
    {
      id: 'msg-104',
      threadId: 'thread-pharm-pat1',
      senderId: 'staff-pharm-1',
      senderName: 'د. منى الدسوقي (PharmD)',
      senderRole: 'Clinical Pharmacist',
      text: 'دكتور طارق، مع جرعة التحميل Clopidogrel 600mg والأسبرين، أنصح بتخفيض جرعة الهيبارين الوريدي إلى 60 units/kg bolus بدون تجاوز 4000 units لتفادي خطر النزيف الرأسي.',
      timestamp: '14:24',
      status: 'read',
      urgency: 'priority',
      requiresAcknowledgement: true,
      acknowledgedBy: ['staff-doc-1']
    }
  ],
  'thread-consult-72319': [
    {
      id: 'msg-201',
      threadId: 'thread-consult-72319',
      senderId: 'staff-doc-1',
      senderName: 'د. سامح بدر / د. طارق المنشاوي',
      senderRole: 'Emergency Medicine',
      text: 'د. وليد، أرسلنا طلب استشارة عاجلة للمريضة فاطمة الجندي في كشك 5 لاشتباه التهاب زائدة حاد، هل يمكنك معاينتها؟',
      timestamp: '14:02',
      status: 'read',
      urgency: 'normal'
    },
    {
      id: 'msg-202',
      threadId: 'thread-consult-72319',
      senderId: 'staff-surg-1',
      senderName: 'د. وليد الصاوي',
      senderRole: 'Surgeon',
      text: 'مرحباً، أنا في الطوارئ الآن، سأعاين المريضة فوراً ونفحص السونار والتحاليل.',
      timestamp: '14:14',
      status: 'read',
      urgency: 'normal'
    },
    {
      id: 'msg-203',
      threadId: 'thread-consult-72319',
      senderId: 'staff-surg-1',
      senderName: 'د. وليد الصاوي',
      senderRole: 'Surgeon',
      text: 'تمت معاينة المريضة، العلامات السريرية تؤكد التهاب الزائدة. وثقت الاستشارة في Axis 5 وأمرت بإدراجها في OR-3.',
      timestamp: '14:38',
      status: 'read',
      urgency: 'normal',
      linkedResource: {
        type: 'consult',
        label: 'تقرير الاستشارة الجراحية: Acute Appendicitis',
        id: 'note-consult-surg-101',
        targetAxis: 'notes'
      }
    }
  ]
};

// -------------------------------------------------------------
// 5. MOCK NOTIFICATIONS & ATTENTION CENTER ITEMS
// -------------------------------------------------------------
export const INITIAL_MOCK_NOTIFICATIONS: AttentionNotification[] = [
  {
    id: 'notif-crit-result-101',
    category: 'clinical',
    titleAr: 'نتيجة حرجة STAT: إنزيم تروبونين عالي الحساسية مرتفع جداً',
    titleEn: 'Critical Result: STAT High-Sensitivity Troponin I',
    descriptionAr:
      'تم صدور نتيجة فحص Troponin I للمريض محمد السيد عبد الرحمن (MRN-88421): القيمة 2.45 ng/mL (المعدل الطبيعي < 0.04) • تتطلب مراجعة واعتماداً سريرياً فورياً.',
    priority: 'stat',
    timestamp: '14:16 (منذ 24 دقيقة)',
    isRead: false,
    isActioned: false,
    actionedLabel: 'معلق: لم يتم اعتماد النتيجة السريرية بعد',
    patientContext: {
      patientId: 'pat-1',
      patientName: 'محمد السيد عبد الرحمن',
      mrn: 'MRN-88421',
      location: 'طوارئ - سرير 02 (حالات القلب)'
    },
    targetDeepLink: {
      destination: 'patient_workspace',
      targetPatientId: 'pat-1',
      targetAxis: 'results',
      targetItemId: 'res-troponin-88421'
    },
    sourceReference: {
      type: 'lab_result',
      id: 'lab-res-trop-01',
      status: 'resulted_critical'
    }
  },
  {
    id: 'notif-consult-assigned-102',
    category: 'work',
    titleAr: 'تكليف استشارة جراحية عاجلة: اشتباه التهاب زائدة دودية',
    titleEn: 'Consultation Assigned: Acute Appendicitis Evaluation',
    descriptionAr:
      'تم إسناد طلب استشارة عاجل من قسم الطوارئ للمريضة فاطمة محمود الجندي (MRN-72319) إلى فريق الجراحة العامة • الوقت المستهدف للاستجابة ساعتان.',
    priority: 'high',
    timestamp: '13:58 (منذ 42 دقيقة)',
    isRead: true,
    isActioned: true,
    actionedLabel: 'تم قبول الاستشارة ومباشرة المعاينة السريرية',
    patientContext: {
      patientId: 'pat-2',
      patientName: 'فاطمة محمود الجندي',
      mrn: 'MRN-72319',
      location: 'طوارئ - كشك 05'
    },
    targetDeepLink: {
      destination: 'my_work',
      targetItemId: 'work-item-consult-202'
    },
    sourceReference: {
      type: 'consultation_request',
      id: 'consult-coord-101',
      status: 'active'
    }
  },
  {
    id: 'notif-handover-pending-103',
    category: 'handover',
    titleAr: 'تسليم سريري بانتظار الاستلام: مريض عناية مركزة ICU',
    titleEn: 'Handover Awaiting Receipt: ICU Shift Handover',
    descriptionAr:
      'قام فريق العناية الليلية بإعداد تسليم SBAR للمريض سليمان خالد العتيبي (MRN-41902) • بانتظار مراجعة وتأكيد استلام الفريق الصباحي في Axis 10.',
    priority: 'high',
    timestamp: '14:02 (منذ 38 دقيقة)',
    isRead: false,
    isActioned: false,
    actionedLabel: 'معلق: لم يتم إتمام استلام الحالة رسمياً',
    patientContext: {
      patientId: 'pat-icu-1',
      patientName: 'سليمان خالد العتيبي',
      mrn: 'MRN-41902',
      location: 'العناية المركزة ICU - سرير 01'
    },
    targetDeepLink: {
      destination: 'patient_workspace',
      targetPatientId: 'pat-icu-1',
      targetAxis: 'timeline'
    },
    sourceReference: {
      type: 'handover_record',
      id: 'handover-coord-201',
      status: 'awaiting_receipt'
    }
  },
  {
    id: 'notif-msg-mention-104',
    category: 'communication',
    titleAr: 'إشارة وتنبيه صيدلاني: د. منى الدسوقي في محادثة دوائية',
    titleEn: 'Mention in Conversation: Anticoagulation Dosing Concern',
    descriptionAr:
      'تمت الإشارة إليك في محادثة سريرية بشأن تعديل جرعة الهيبارين الوريدي لمريض الجلطة (محمد السيد عبد الرحمن).',
    priority: 'medium',
    timestamp: '14:24 (منذ 16 دقيقة)',
    isRead: false,
    isActioned: false,
    patientContext: {
      patientId: 'pat-1',
      patientName: 'محمد السيد عبد الرحمن',
      mrn: 'MRN-88421',
      location: 'طوارئ - سرير 02'
    },
    targetDeepLink: {
      destination: 'exact_conversation',
      targetThreadId: 'thread-pharm-pat1'
    },
    sourceReference: {
      type: 'chat_thread',
      id: 'thread-pharm-pat1',
      status: 'active'
    }
  },
  {
    id: 'notif-or-delay-105',
    category: 'operational',
    titleAr: 'تأخير غرفة العمليات OR-2: تمديد وقت التعقيم والتطهير',
    titleEn: 'OR Delay: Theatre OR-2 Extended Turnover',
    descriptionAr:
      'تأخر بدء حالة تبديل مفصل الركبة الروبوتية للمريض منصور الشهري (MRN-61209) بمقدار 45 دقيقة بسبب استكمال إجراءات مكافحة العدوى والتعقيم.',
    priority: 'medium',
    timestamp: '13:48 (منذ 52 دقيقة)',
    isRead: true,
    isActioned: true,
    actionedLabel: 'تم تعديل الجدول في لوحة العمليات',
    patientContext: {
      patientId: 'pat-or-3',
      patientName: 'منصور عبد الله الشهري',
      mrn: 'MRN-61209',
      location: 'OR-2 جراحة العظام'
    },
    targetDeepLink: {
      destination: 'or_board'
    },
    sourceReference: {
      type: 'surgery_case',
      id: 'or-case-203',
      status: 'holding_preop'
    }
  }
];
