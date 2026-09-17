import {
  WorkItemRecord,
  WorkQueueDefinition
} from '../types/clinicalWorkItems';

export const mockWorkQueues: WorkQueueDefinition[] = [
  {
    id: 'queue-all',
    nameAr: 'جميع طوابير العمل المتاحة',
    nameEn: 'All Operational Queues',
    department: 'all',
    specialty: 'عام',
    description: 'عرض موحد لكافة المهام الواردة من جميع الطوابير والأقسام',
    defaultSort: 'priority',
    ownershipPolicy: 'self_claim',
    serviceTeamAr: 'كافة الأقسام السريرية',
    activeStaffCount: 14,
    workloadState: 'moderate'
  },
  {
    id: 'queue-surgery-consults',
    nameAr: 'طابور استشارات الجراحة العامة',
    nameEn: 'General Surgery Consultation Queue',
    department: 'ipd',
    specialty: 'الجراحة العامة',
    description: 'طلبات الاستشارات السريرية الواردة للجراحة العامة من الطوارئ وأجنحة التنويم',
    defaultSort: 'due_soon',
    ownershipPolicy: 'self_claim',
    serviceTeamAr: 'فريق الجراحة العامة المناوب',
    activeStaffCount: 3,
    workloadState: 'high'
  },
  {
    id: 'queue-icu-admissions',
    nameAr: 'طابور قبولات الرعاية المركزة (ICU Inbound)',
    nameEn: 'ICU Inbound Admission Requests',
    department: 'icu',
    specialty: 'العناية الحرجة',
    description: 'طلبات التنويم والنقل السريري إلى أسرة العناية المركزة من الطوارئ والأقسام الداخلية',
    defaultSort: 'priority',
    ownershipPolicy: 'supervisor_triage',
    serviceTeamAr: 'استشاري العناية وتنسيق الأسرة',
    activeStaffCount: 2,
    workloadState: 'high'
  },
  {
    id: 'queue-critical-results',
    nameAr: 'طابور تصعيد ومتابعة النتائج الحرجة',
    nameEn: 'Critical Results Escalation Queue',
    department: 'all',
    specialty: 'المختبر والأشعة والقلب',
    description: 'النتائج المخبرية والشعاعية المصنفة كإنذار حرج وتتطلب اعتماداً وتواصلاً فورياً',
    defaultSort: 'priority',
    ownershipPolicy: 'direct_assignment',
    serviceTeamAr: 'الأطباء المعالجون والمختبر المركزي',
    activeStaffCount: 6,
    workloadState: 'high'
  },
  {
    id: 'queue-pharmacy-verification',
    nameAr: 'طابور تدقيق ومطابقة الأدوية',
    nameEn: 'Pharmacy Verification & Reconciliation Queue',
    department: 'ipd',
    specialty: 'الصيدلة السريرية',
    description: 'مراجعة الأدوية عالية الخطورة ومطابقة أدوية التنويم والمغادرة',
    defaultSort: 'due_soon',
    ownershipPolicy: 'team_shared',
    serviceTeamAr: 'صيادلة الأجنحة والعناية السريرية',
    activeStaffCount: 4,
    workloadState: 'moderate'
  },
  {
    id: 'queue-nursing-care',
    nameAr: 'طابور مهام التمريض والاستلام والتسليم',
    nameEn: 'Nursing Care & Shift Handover Queue',
    department: 'ipd',
    specialty: 'التمريض السريري',
    description: 'استلام وتسليم المناوبات SBAR وإجراءات الرعاية التمريضية المستحقة',
    defaultSort: 'due_soon',
    ownershipPolicy: 'team_shared',
    serviceTeamAr: 'طاقم تمريض الأجنحة والعناية SICU',
    activeStaffCount: 8,
    workloadState: 'moderate'
  },
  {
    id: 'queue-or-planning',
    nameAr: 'طابور مراجعة الحالات الجراحية والعمليات',
    nameEn: 'OR Case Review & Clearance Queue',
    department: 'or',
    specialty: 'العمليات والتخدير',
    description: 'مراجعة التجهيز للعمليات الجراحية والفحوصات القبلية والإقرار المستنير',
    defaultSort: 'newest',
    ownershipPolicy: 'supervisor_triage',
    serviceTeamAr: 'فريق التخدير وتنسيق مسار العمليات',
    activeStaffCount: 3,
    workloadState: 'low'
  }
];

export const initialMockWorkItems: WorkItemRecord[] = [
  // =========================================================================
  // SCENARIO A: General Surgery Consultation Request (ER -> Surgery Queue)
  // =========================================================================
  {
    id: 'WI-CONS-001',
    type: 'consultation_review',
    title: 'طلب استشارة جراحة عامة عاجلة (اشتباه التهاب زائدة دودية)',
    description: 'مريض يعاني من ألم بطني حاد ومستمر بالربع السفلي الأيمن منذ 12 ساعة مع ارتفاع حرارة وارتفاع كريات الدم البيضاء.',
    patient: {
      id: 'p-101',
      mrn: 'MRN-2024-001',
      nameAr: 'عمر خالد المنصور',
      nameEn: 'Omar Khalid Al-Mansour',
      age: 32,
      gender: 'M',
      encounterId: 'ENC-ER-99120',
      encounterType: 'emergency',
      currentLocation: 'طوارئ: سرير ER-RESUS-01',
      department: 'er',
      bedCode: 'ER-RESUS-01',
      allergies: ['Penicillin (حساسية مفرطة)'],
      criticalFlags: ['Surgical Abdomen Alert', 'NPO since 04:00']
    },
    workArea: 'er',
    sourceModule: 'Clinical Consultations & Requests',
    sourceResourceType: 'consultation_request',
    sourceResourceId: 'REQ-CONS-9912',
    sourceStatus: 'submitted',
    sourceRequestedBy: {
      name: 'د. سامي القحطاني',
      role: 'طبيب طوارئ أول',
      department: 'قسم الطوارئ والحوادث',
      requestedAt: '10:15 صباحاً (منذ 45 دقيقة)'
    },
    workflowProcess: 'Emergency Inpatient Specialty Consult',
    currentStep: 'Specialty Triage & Bedside Assessment',
    sourceUrgency: 'urgent',
    priority: 'urgent',
    operationalStatus: 'unassigned',
    ownershipPolicy: 'self_claim',
    queueId: 'queue-surgery-consults',
    queueName: 'طابور استشارات الجراحة العامة',
    assignedTo: null,
    claimedBy: null,
    sourceEventTimestamp: '10:10 AM',
    createdAt: '10:15 AM',
    createdTimestamp: Date.now() - 45 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال 60 دقيقة من وقت استلام الطلب',
    dueAt: '11:15 AM (خلال 15 دقيقة)',
    dueTimestamp: Date.now() + 15 * 60 * 1000,
    dueState: 'due_soon',
    waitingDuration: '45 دقيقة',
    lastUpdatedAt: '10:16 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Acute Appendicitis Suspected (K35.80)',
      clinicalQuestion: 'يرجى المعاينة الجراحية العاجلة وتقييم الحاجة لاستئصال الزائدة الدودية بالمنظار (Laparoscopic Appendectomy).',
      vitalSigns: 'BP: 138/82 | HR: 104 bpm | Temp: 38.2°C | SpO2: 98%',
      relevantLab: 'WBC: 15.8 x10^3/uL (High) | CRP: 48 mg/L | Lipase: Normal',
      keyFindings: 'علامة McBurney موجبة مع علامة Blumberg (Rebound tenderness).',
      redFlags: ['Peritoneal Irritation Signs', 'Tachycardia']
    },
    allowedActions: ['claim', 'start_review', 'open_patient', 'request_info', 'reassign'],
    tags: ['Consultation', 'General Surgery', 'STAT-ER', 'Unassigned'],
    targetWorkspaceAxis: 'notes',
    targetWorkspaceOptions: {
      tab: 'consults',
      selectedId: 'REQ-CONS-9912'
    },
    targetStepContext: {
      targetAxis: 'notes',
      axisNameAr: 'المحور الخامس: التوثيق والملاحظات السريرية',
      stepTitleAr: 'توثيق تقرير الاستشارة الجراحية وقرار التدخل',
      stepDescriptionAr: 'الانتقال إلى محرر التوثيق لكتابة تقرير استشارة الجراحة وخطة المعاينة المباشرة',
      recommendedActionAr: 'بدء كتابة تقرير الاستشارة الجراحية (Axis 5 Notes Composer)',
      sourceResourceId: 'REQ-CONS-9912'
    },
    activityHistory: [
      {
        id: 'ACT-01-A',
        timestamp: '10:15 AM',
        eventType: 'created',
        actorName: 'د. سامي القحطاني',
        actorRole: 'طبيب طوارئ أول',
        description: 'إنشاء طلب الاستشارة وإرفاق الفحوصات الأولية للبطن'
      },
      {
        id: 'ACT-01-B',
        timestamp: '10:16 AM',
        eventType: 'routed',
        actorName: 'نظام التوجيه السريري',
        actorRole: 'Workflow Engine (Mock Projection)',
        description: 'توجيه الطلب آلياً إلى طابور استشارات الجراحة العامة'
      }
    ]
  },

  // =========================================================================
  // SCENARIO B: ICU Admission Request (ER/Wards -> ICU Queue)
  // =========================================================================
  {
    id: 'WI-ADM-002',
    type: 'admission_review',
    title: 'طلب تنويم عاجل بالعناية المركزة (صدمة إنتانية تنفسية)',
    description: 'مريضة تعاني من صدمة إنتانية حادة ثانوية لذات رئة مجتمعية، هبوط ضغط غير مستجيب للسوائل والحاجة لجرعات نورأدرينالين مستمرة.',
    patient: {
      id: 'p-102',
      mrn: 'MRN-2024-002',
      nameAr: 'سارة عبد الله الشمري',
      nameEn: 'Sarah Abdullah Al-Shammari',
      age: 67,
      gender: 'F',
      encounterId: 'ENC-ER-99125',
      encounterType: 'emergency',
      currentLocation: 'طوارئ: سرير الإنعاش ER-RESUS-02',
      department: 'er',
      bedCode: 'ER-RESUS-02',
      allergies: ['لا توجد حساسيات دوائية مسجلة'],
      criticalFlags: ['NEWS2: 9 (High Risk)', 'Norepinephrine Infusion', 'Central Line Inserted']
    },
    workArea: 'icu',
    sourceModule: 'Inpatient Bed Management & Transfers',
    sourceResourceType: 'admission_order',
    sourceResourceId: 'ORD-ADM-ICU-4401',
    sourceStatus: 'submitted',
    sourceRequestedBy: {
      name: 'د. فيصل الشهري',
      role: 'استشاري طب الطوارئ',
      department: 'قسم الطوارئ والحوادث',
      requestedAt: '10:30 صباحاً (منذ 30 دقيقة)'
    },
    workflowProcess: 'Critical Care Bed Allocation & Admission Acceptance',
    currentStep: 'Intensivist Bed Verification & Acceptance',
    sourceUrgency: 'stat',
    priority: 'critical',
    operationalStatus: 'waiting_in_queue',
    ownershipPolicy: 'supervisor_triage',
    queueId: 'queue-icu-admissions',
    queueName: 'طابور قبولات الرعاية المركزة (ICU Inbound)',
    assignedTo: null,
    claimedBy: null,
    sourceEventTimestamp: '10:28 AM',
    createdAt: '10:30 AM',
    createdTimestamp: Date.now() - 30 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال 30 دقيقة (قبول حرج فوري)',
    dueAt: '11:00 AM (مستحق فوراً)',
    dueTimestamp: Date.now() + 5 * 60 * 1000,
    dueState: 'due_soon',
    waitingDuration: '30 دقيقة',
    lastUpdatedAt: '10:31 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Septic Shock due to Severe CAP (A41.9 / J18.9)',
      clinicalQuestion: 'طلب قبول سريري فوري في العناية المركزة ICU لمواصلة المراقبة التداخلية ودعم الضغط وضبط التهوية.',
      vitalSigns: 'BP: 84/48 (on Noradrenaline 0.12 mcg/kg/min) | HR: 118 | RR: 28 | SpO2: 91% (NRBM) | Lactate: 4.2',
      relevantLab: 'Serum Lactate: 4.2 mmol/L | WBC: 22.1 x10^3/uL | Creatinine: 1.9 mg/dL',
      keyFindings: 'انخفاض في نضح الأطراف، انخفاض إدرار البول، تشبع أكسجين منخفض.',
      redFlags: ['Refractory Hypotension', 'Lactate > 4.0', 'High Organ Failure Risk']
    },
    allowedActions: ['claim', 'accept', 'open_patient', 'request_info', 'return'],
    tags: ['ICU Admission', 'Critical', 'Septic Shock', 'High Priority'],
    targetWorkspaceAxis: 'care_plan',
    targetWorkspaceOptions: {
      tab: 'transitions',
      selectedId: 'ORD-ADM-ICU-4401'
    },
    targetStepContext: {
      targetAxis: 'care_plan',
      axisNameAr: 'المحور التاسع: خطة الرعاية والانتقالات السريرية',
      stepTitleAr: 'مراجعة معايير قبول العناية وتسكين السرير (ICU Allocation)',
      stepDescriptionAr: 'الانتقال إلى شاشة الانتقالات لمراجعة خطة النقل وتأكيد الجاهزية السريرية للسرير',
      recommendedActionAr: 'مراجعة بيانات النقل والجاهزية السريرية (Axis 9 Care Plan)',
      sourceResourceId: 'ORD-ADM-ICU-4401'
    },
    activityHistory: [
      {
        id: 'ACT-02-A',
        timestamp: '10:30 AM',
        eventType: 'created',
        actorName: 'د. فيصل الشهري',
        actorRole: 'استشاري طب الطوارئ',
        description: 'إنشاء أمر التنويم العاجل في العناية المركزة'
      },
      {
        id: 'ACT-02-B',
        timestamp: '10:31 AM',
        eventType: 'routed',
        actorName: 'نظام إدارة الأسرة',
        actorRole: 'Bed Management System',
        description: 'إشعار استشاري العناية المناوب بوجود حالة حرجة بانتظار تأكيد السرير'
      }
    ]
  },

  // =========================================================================
  // SCENARIO C: Critical Lab Result Review (Biochemistry / Cardiac)
  // =========================================================================
  {
    id: 'WI-RES-003',
    type: 'critical_result_followup',
    title: 'مراجعة واعتماد نتيجة حرجة: High-Sensitivity Troponin I (0.85 ng/mL)',
    description: 'ارتفاع حاد في إنزيم التروبونين يتجاوز الحد الحرج (> 0.04 ng/mL) لدى مريضة منومة بجناح الباطنة تعاني من ألم صدري خفيف.',
    patient: {
      id: 'p-103',
      mrn: 'MRN-2024-003',
      nameAr: 'فاطمة أحمد السالم',
      nameEn: 'Fatima Ahmed Al-Salem',
      age: 59,
      gender: 'F',
      encounterId: 'ENC-IPD-88210',
      encounterType: 'inpatient',
      currentLocation: 'جناح الباطنة 3B: سرير 301-A',
      department: 'ipd',
      bedCode: '301-A',
      allergies: ['Sulfa Drugs (طفح جلدي)'],
      criticalFlags: ['CRITICAL LAB ALERT', 'Cardiac Telemetry Active']
    },
    workArea: 'ipd',
    sourceModule: 'Laboratory Information System (LIS)',
    sourceResourceType: 'lab_result',
    sourceResourceId: 'RES-TROP-8812',
    sourceStatus: 'resulted_critical',
    sourceRequestedBy: {
      name: 'د. منى الماجد (مختبر الكيمياء الحيوية)',
      role: 'اختصاصي الكيمياء السريرية',
      department: 'المختبر المركزي وبنك الدم',
      requestedAt: '09:40 صباحاً (تم التبليغ الهاتفي 09:45)'
    },
    workflowProcess: 'Critical Value Notification & Read-Back Protocol',
    currentStep: 'Attending Physician Clinical Acknowledgment & Action',
    sourceUrgency: 'stat',
    priority: 'critical',
    operationalStatus: 'assigned',
    ownershipPolicy: 'direct_assignment',
    queueId: 'queue-critical-results',
    queueName: 'طابور تصعيد ومتابعة النتائج الحرجة',
    assignedTo: {
      id: 'staff-doc-01',
      name: 'د. خالد العتيبي',
      role: 'طبيب باطنة معالج'
    },
    claimedBy: {
      id: 'staff-doc-01',
      name: 'د. خالد العتيبي',
      role: 'طبيب باطنة معالج',
      claimedAt: '09:50 AM'
    },
    sourceEventTimestamp: '09:40 AM',
    createdAt: '09:42 AM',
    createdTimestamp: Date.now() - 78 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال 30 دقيقة (معيار الإبلاغ الحرج CBAHI / JCI)',
    dueAt: '10:12 AM (متأخر 48 دقيقة - SLA Overdue)',
    dueTimestamp: Date.now() - 48 * 60 * 1000,
    dueState: 'overdue',
    waitingDuration: '78 دقيقة',
    lastUpdatedAt: '09:50 AM',
    criticalResultPolicy: {
      policyName: 'بروتوكول تصعيد النتائج المخبرية الحرجة (Cardiac Critical Biomarker Policy)',
      communicationMethod: 'readback_documented',
      escalationTimeMinutes: 30,
      policyDescriptionAr: 'سياسة المستشفى المعتمدة: إشعار فوري وتوثيق القراءة العكسية (Read-Back). في حال المريض منوم بقسم عناية أو تحت مراقبة الطبيب المعالج مباشرة، يكفي الاعتماد السريري الإلكتروني وتوثيق الخطة دون اشتراط اتصال هاتفي متكرر.'
    },
    clinicalContextSummary: {
      primaryDiagnosis: 'NSTEMI Suspected / Hypertensive Heart Disease',
      clinicalQuestion: 'اعتماد النتيجة الحرجة وتوثيق خطة إدارة متلازمة الشريان التاجي الحادة أو طلب تخطيط قلب متكرر واستشارة القلب.',
      vitalSigns: 'BP: 154/92 | HR: 88 | SpO2: 97% | RR: 18',
      relevantLab: 'hs-cTnI: 0.85 ng/mL (Ref: <0.04) | K+: 4.8 mmol/L | Creatinine: 1.1 mg/dL',
      keyFindings: 'ألم ضاغط خلف القص استمر 20 دقيقة، تخطيط القلب يظهر انقلاب موجة T في V4-V6.',
      redFlags: ['Critical Biomarker Elevation', 'Ischemic ECG Changes']
    },
    allowedActions: ['acknowledge', 'open_patient', 'start_review', 'complete'],
    tags: ['Critical Lab', 'Overdue Alert', 'Troponin', 'Action Required'],
    targetWorkspaceAxis: 'results',
    targetWorkspaceOptions: {
      tab: 'lab',
      selectedId: 'RES-TROP-8812'
    },
    targetStepContext: {
      targetAxis: 'results',
      axisNameAr: 'المحور السابع: النتائج والمختبر والتقارير',
      stepTitleAr: 'مراجعة واعتماد إنزيم التروبونين وتتبع المنحنى الزمني',
      stepDescriptionAr: 'الانتقال إلى قسم التحاليل المخبرية لفتح تفاصيل نتيجة التروبونين وتسجيل الملاحظة الطبية',
      recommendedActionAr: 'فتح فحص التروبونين وتوثيق المراجعة (Axis 7 Lab Review)',
      sourceResourceId: 'RES-TROP-8812'
    },
    activityHistory: [
      {
        id: 'ACT-03-A',
        timestamp: '09:42 AM',
        eventType: 'created',
        actorName: 'نظام المختبر الآلي',
        actorRole: 'Auto-Analyzer Engine',
        description: 'رصد نتيجة إنزيم التروبونين فوق الحد الحرج وتوليد تنبيه السلامة السريرية'
      },
      {
        id: 'ACT-03-B',
        timestamp: '09:45 AM',
        eventType: 'assigned',
        actorName: 'مختبر الكيمياء الحيوية',
        actorRole: 'Medical Laboratory Technologist',
        description: 'تبليغ التمريض هاتفياً مع القراءة العكسية (Read-Back) وإسناد المهمة للطبيب المعالج'
      },
      {
        id: 'ACT-03-C',
        timestamp: '09:50 AM',
        eventType: 'claimed',
        actorName: 'د. خالد العتيبي',
        actorRole: 'طبيب باطنة معالج',
        description: 'فتح الإشعار وبدء تقييم الحالة'
      }
    ]
  },

  // =========================================================================
  // SCENARIO D: Medication Reconciliation Required on Inpatient Admission
  // =========================================================================
  {
    id: 'WI-MED-004',
    type: 'medication_reconciliation',
    title: 'مطابقة الأدوية الإلزامية عند التنويم (Medication Reconciliation on Admission)',
    description: 'مريض مسن متعدد الأمراض المزمنة تم تنويمه حديثاً، يتناول 8 أدوية منزلية تتضمن مضادات تخثر وأنسولين، يحتاج لمطابقة سريرية مع أوامر التنويم.',
    patient: {
      id: 'p-104',
      mrn: 'MRN-2024-004',
      nameAr: 'محمد إبراهيم الحربي',
      nameEn: 'Mohammed Ibrahim Al-Harbi',
      age: 74,
      gender: 'M',
      encounterId: 'ENC-IPD-88219',
      encounterType: 'inpatient',
      currentLocation: 'وحدة الرعاية الإكليلية: سرير CCU-01',
      department: 'icu',
      bedCode: 'CCU-01',
      allergies: ['Aspirin (Bronchospasm)'],
      criticalFlags: ['High Fall Risk', 'Anticoagulated (Warfarin)', 'Insulin Dependent']
    },
    workArea: 'icu',
    sourceModule: 'Pharmacy & Medication Safety System',
    sourceResourceType: 'medication_order',
    sourceResourceId: 'MED-REC-102',
    sourceStatus: 'pending_verification',
    sourceRequestedBy: {
      name: 'نظام إدارة الدخول السريري',
      role: 'Admission Policy Engine',
      department: 'قسم القبول والتنويم',
      requestedAt: '08:30 صباحاً'
    },
    workflowProcess: 'Admission Medication Reconciliation Policy (CBAHI Standard)',
    currentStep: 'Clinical Pharmacist / Attending Physician Reconciliation',
    sourceUrgency: 'routine',
    priority: 'priority',
    operationalStatus: 'in_progress',
    ownershipPolicy: 'team_shared',
    queueId: 'queue-pharmacy-verification',
    queueName: 'طابور تدقيق ومطابقة الأدوية',
    assignedTo: {
      id: 'staff-pharm-01',
      name: 'د. هدى التميمي',
      role: 'صيدلي إكلينيكي أول'
    },
    claimedBy: {
      id: 'staff-pharm-01',
      name: 'د. هدى التميمي',
      role: 'صيدلي إكلينيكي أول',
      claimedAt: '09:15 AM'
    },
    sourceEventTimestamp: '08:25 AM',
    createdAt: '08:30 AM',
    createdTimestamp: Date.now() - 150 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال 24 ساعة من وقت التنويم السريري (معيار سباهي CBAHI)',
    dueAt: '12:30 PM (متبقي 1.5 ساعة)',
    dueTimestamp: Date.now() + 90 * 60 * 1000,
    dueState: 'normal',
    waitingDuration: '2.5 ساعة',
    lastUpdatedAt: '09:15 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Decompensated Heart Failure & Atrial Fibrillation',
      clinicalQuestion: 'التحقق من تداخلات الوارفارين مع المضادات الحيوية وضبط جرعات مدرات البول والأنسولين القاعدي.',
      vitalSigns: 'BP: 126/78 | HR: 76 (Irregular) | SpO2: 95% (2L NC)',
      relevantLab: 'INR: 2.8 (Target 2.0-3.0) | eGFR: 42 mL/min/1.73m2 | HbA1c: 8.4%',
      keyFindings: 'يوجد عدم تطابق بين جرعة ديجوكسين المنزلية وأمر التنويم.',
      redFlags: ['Polypharmacy (>5 meds)', 'Renal Impairment Dose Adjustment']
    },
    allowedActions: ['open_patient', 'release', 'complete', 'request_info'],
    tags: ['Med Rec', 'Clinical Pharmacy', 'CCU', 'In Progress'],
    targetWorkspaceAxis: 'medications',
    targetWorkspaceOptions: {
      tab: 'reconciliation',
      selectedId: 'MED-REC-102'
    },
    targetStepContext: {
      targetAxis: 'medications',
      axisNameAr: 'المحور الثامن: الأدوية والمطابقة وسجل eMAR',
      stepTitleAr: 'شاشة المطابقة الدوائية وسجل الأدوية المنزلية',
      stepDescriptionAr: 'الانتقال إلى واجهة المطابقة السريرية لمقارنة الأدوية المنزلية مع أوامر التنويم',
      recommendedActionAr: 'فتح واجهة المطابقة الدوائية (Axis 8 Med Rec)',
      sourceResourceId: 'MED-REC-102'
    },
    activityHistory: [
      {
        id: 'ACT-04-A',
        timestamp: '08:30 AM',
        eventType: 'created',
        actorName: 'النظام السريري',
        actorRole: 'Automated Admission Trigger',
        description: 'إنشاء مهمة مطابقة الأدوية الإلزامية خلال 24 ساعة من التنويم'
      },
      {
        id: 'ACT-04-B',
        timestamp: '09:15 AM',
        eventType: 'claimed',
        actorName: 'د. هدى التميمي',
        actorRole: 'صيدلي إكلينيكي أول',
        description: 'استلام المهمة للتدقيق ومقارنة السجل الصيدلي الخارجي'
      }
    ]
  },

  // =========================================================================
  // SCENARIO E: Handover Awaiting Receipt (Shift SBAR Transfer)
  // =========================================================================
  {
    id: 'WI-HAND-005',
    type: 'handover_receipt',
    title: 'استلام تسليم المناوبة التمريضية (Nursing Shift Handover SBAR)',
    description: 'تقرير التسليم والاستلام المنظم بين المناوبة الليلية والصباحية لمريض العناية المركزة ما بعد جراحة استئصال ورم دماغي مع مراقبة الضغط القحفي (ICP).',
    patient: {
      id: 'p-105',
      mrn: 'MRN-2024-005',
      nameAr: 'خالد عبد العزيز الدوسري',
      nameEn: 'Khalid Abdulaziz Al-Dawsari',
      age: 48,
      gender: 'M',
      encounterId: 'ENC-ICU-77192',
      encounterType: 'inpatient',
      currentLocation: 'العناية المركزة الجراحية: سرير SICU-04',
      department: 'icu',
      bedCode: 'SICU-04',
      allergies: ['لا توجد حساسيات مسجلة'],
      criticalFlags: ['EVD Drain in situ', 'Hourly Neuro Checks', 'ICP Target < 15']
    },
    workArea: 'icu',
    sourceModule: 'Clinical Handover & Transitions',
    sourceResourceType: 'handover_record',
    sourceResourceId: 'HANDOVER-SBAR-2026-09',
    sourceStatus: 'active',
    sourceRequestedBy: {
      name: 'ممرض مناوب: أحمد الزهراني',
      role: 'ممرض عناية مركزة (المناوبة الليلية)',
      department: 'العناية المركزة الجراحية SICU',
      requestedAt: '07:00 صباحاً'
    },
    workflowProcess: 'Structured SBAR Shift Handover & Patient Safety Transfer',
    currentStep: 'Bedside Joint Verification & Electronic Acceptance',
    sourceUrgency: 'urgent',
    priority: 'urgent',
    operationalStatus: 'waiting_in_queue',
    ownershipPolicy: 'team_shared',
    queueId: 'queue-nursing-care',
    queueName: 'طابور مهام التمريض والاستلام والتسليم',
    assignedTo: null,
    claimedBy: null,
    sourceEventTimestamp: '06:55 AM',
    createdAt: '07:00 AM',
    createdTimestamp: Date.now() - 260 * 60 * 1000,
    configuredDueTarget: 'المستهدف: قبل انتهاء الساعة الأولى من بدء الوردية (07:45 AM)',
    dueAt: '07:45 AM (متأخر)',
    dueTimestamp: Date.now() - 215 * 60 * 1000,
    dueState: 'overdue',
    waitingDuration: '4.3 ساعات',
    lastUpdatedAt: '07:05 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Post-Craniotomy for Meningioma Excision (Day 1)',
      clinicalQuestion: 'تأكيد استلام المريض بجانب السرير وفحص نزح EVD ومستوى الوعي واستلام مضخات التسكين والتنقيط.',
      vitalSigns: 'BP: 128/72 | HR: 68 | ICP: 11 mmHg | GCS: E4V4M6 (14/15)',
      relevantLab: 'Serum Sodium: 141 mmol/L | Osmolality: 295 mOsm/kg',
      keyFindings: 'تصريف النزح الدماغي 45 مل خلال الوردية، المحلول صافي مائل للوردي، الحدقة متناظرة ومتفاعلة.',
      redFlags: ['Sudden ICP Elevation > 18', 'Drop in GCS']
    },
    allowedActions: ['claim', 'accept', 'open_patient', 'complete'],
    tags: ['Handover', 'SBAR', 'SICU Nursing', 'Joint Bedside Check'],
    targetWorkspaceAxis: 'summary',
    targetWorkspaceOptions: {
      tab: 'transitions',
      selectedId: 'HANDOVER-SBAR-2026-09'
    },
    targetStepContext: {
      targetAxis: 'summary',
      axisNameAr: 'المحور العاشر: رحلة المريض والتسليم السريري SBAR',
      stepTitleAr: 'شاشة التسليم والاستلام التمريضي المشترك بجانب السرير',
      stepDescriptionAr: 'الانتقال إلى تقرير SBAR للتحقق من قراءات EVD ومضخات الأدوية وتأكيد الاستلام الإلكتروني',
      recommendedActionAr: 'فتح تقرير تسليم المناوبة (Axis 10 SBAR)',
      sourceResourceId: 'HANDOVER-SBAR-2026-09'
    },
    activityHistory: [
      {
        id: 'ACT-05-A',
        timestamp: '07:00 AM',
        eventType: 'created',
        actorName: 'أحمد الزهراني',
        actorRole: 'ممرض عناية مركزة (الوردية الليلية)',
        description: 'توثيق تقرير SBAR وإرساله لطاقم الوردية الصباحية'
      }
    ]
  },

  // =========================================================================
  // SCENARIO F: OR Surgery Pre-Op Clearance & Verification
  // =========================================================================
  {
    id: 'WI-OR-006',
    type: 'transfer_review',
    title: 'تدقيق الجاهزية الجراحية والتخدير (Pre-Operative Clearance Review)',
    description: 'مريض مجدول لجراحة استبدال مفصل الركبة الكلي غداً، بانتظار اعتماد فحص التخدير وتوفر وحدات الدم وتوقيع الإقرار المستنير.',
    patient: {
      id: 'p-106',
      mrn: 'MRN-2024-006',
      nameAr: 'عبد الرحمن ناصر العتيبي',
      nameEn: 'Abdulrahman Nasser Al-Otaibi',
      age: 63,
      gender: 'M',
      encounterId: 'ENC-IPD-88225',
      encounterType: 'inpatient',
      currentLocation: 'جناح جراحة العظام 4A: سرير 412',
      department: 'ipd',
      bedCode: '412',
      allergies: ['Iodine Contrast (حكة وشرى)'],
      criticalFlags: ['Type & Screen Valid', 'Consent Signed']
    },
    workArea: 'or',
    sourceModule: 'Operating Theatre Management',
    sourceResourceType: 'clinical_note',
    sourceResourceId: 'NOTE-PREOP-551',
    sourceStatus: 'active',
    sourceRequestedBy: {
      name: 'د. طارق السويدي',
      role: 'استشاري التخدير ومسرح العمليات',
      department: 'قسم التخدير والعمليات',
      requestedAt: '09:00 صباحاً'
    },
    workflowProcess: 'Surgical Safety Checklist (Sign-In Phase Readiness)',
    currentStep: 'Pre-Op Checklist & Anesthesia Clearance',
    sourceUrgency: 'routine',
    priority: 'routine',
    operationalStatus: 'in_progress',
    ownershipPolicy: 'supervisor_triage',
    queueId: 'queue-or-planning',
    queueName: 'طابور مراجعة الحالات الجراحية والعمليات',
    assignedTo: {
      id: 'staff-doc-02',
      name: 'د. طارق السويدي',
      role: 'استشاري التخدير'
    },
    claimedBy: {
      id: 'staff-doc-02',
      name: 'د. طارق السويدي',
      role: 'استشاري التخدير',
      claimedAt: '09:30 AM'
    },
    sourceEventTimestamp: '08:50 AM',
    createdAt: '09:00 AM',
    createdTimestamp: Date.now() - 120 * 60 * 1000,
    configuredDueTarget: 'المستهدف: قبل 6 ساعات من موعد العملية المجدولة',
    dueAt: '03:00 PM (متبقي 4 ساعات)',
    dueTimestamp: Date.now() + 240 * 60 * 1000,
    dueState: 'normal',
    waitingDuration: '2.0 ساعة',
    lastUpdatedAt: '09:30 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Severe Osteoarthritis Right Knee (M17.11)',
      clinicalQuestion: 'التحقق من تقرير صدى القلب Echo وتأكيد إيقاف مميعات الدم قبل 5 أيام وجاهزية المريض للتخدير النصفي.',
      vitalSigns: 'BP: 132/80 | HR: 72 | SpO2: 98%',
      relevantLab: 'Hb: 13.5 g/dL | Platelets: 240 x10^3/uL | PT/INR: 1.0',
      keyFindings: 'درجة الخطورة التخديرية ASA II، مجرى التنفس طبيعي Mallampati II.',
      redFlags: []
    },
    allowedActions: ['open_patient', 'complete', 'request_info'],
    tags: ['Pre-Op', 'Anesthesia', 'Ortho', 'Clearance'],
    targetWorkspaceAxis: 'orders',
    targetWorkspaceOptions: {
      tab: 'orders'
    },
    targetStepContext: {
      targetAxis: 'orders',
      axisNameAr: 'المحور السادس: الأوامر السريرية والفحوصات القبلية',
      stepTitleAr: 'قائمة الجاهزية الجراحية وفحوصات التخدير',
      stepDescriptionAr: 'الانتقال إلى شاشة الأوامر لمراجعة فحص التخدير ووحدات الدم المجهزة والإقرار',
      recommendedActionAr: 'فتح قائمة الأوامر والجاهزية (Axis 6 Orders)',
      sourceResourceId: 'NOTE-PREOP-551'
    },
    activityHistory: [
      {
        id: 'ACT-06-A',
        timestamp: '09:00 AM',
        eventType: 'created',
        actorName: 'نظام جدولة العمليات',
        actorRole: 'OR Scheduler Engine',
        description: 'توليد قائمة التحقق القبلية للعمليات المجدولة'
      },
      {
        id: 'ACT-06-B',
        timestamp: '09:30 AM',
        eventType: 'claimed',
        actorName: 'د. طارق السويدي',
        actorRole: 'استشاري التخدير',
        description: 'استلام الملف لمراجعة وظائف القلب والتخدير'
      }
    ]
  },

  // =========================================================================
  // SCENARIO G: Care Plan & Education Review (Discharge Readiness)
  // =========================================================================
  {
    id: 'WI-CARE-007',
    type: 'care_plan_review',
    title: 'مراجعة أهداف الخطة العلاجية والتثقيف الصحي (Discharge Readiness)',
    description: 'مريضة سكري من النوع الثاني خضعت لعلاج قرحة قدم سكرية، بانتظار استكمال جلسة التثقيف بالحقن الذاتي للأنسولين والعناية بالقدمين قبل الخروج.',
    patient: {
      id: 'p-107',
      mrn: 'MRN-2024-007',
      nameAr: 'نورة مسفر القحطاني',
      nameEn: 'Noura Mesfer Al-Qahtani',
      age: 56,
      gender: 'F',
      encounterId: 'ENC-IPD-88230',
      encounterType: 'inpatient',
      currentLocation: 'جناح الباطنة 3A: سرير 304',
      department: 'ipd',
      bedCode: '304',
      allergies: ['لا توجد حساسيات مسجلة'],
      criticalFlags: ['Diabetic Foot Care Protocol', 'Pending Discharge Plan']
    },
    workArea: 'ipd',
    sourceModule: 'Clinical Care Plans & Education',
    sourceResourceType: 'care_plan_goal',
    sourceResourceId: 'GOAL-EDU-881',
    sourceStatus: 'active',
    sourceRequestedBy: {
      name: 'د. أسماء عبد العزيز',
      role: 'طبيب باطنة وسكري',
      department: 'قسم الغدد الصماء والسكري',
      requestedAt: '10:00 صباحاً'
    },
    workflowProcess: 'Multidisciplinary Inpatient Care Plan & Discharge Readiness',
    currentStep: 'Patient Education & Goal Attainment Review',
    sourceUrgency: 'routine',
    priority: 'routine',
    operationalStatus: 'waiting_for_patient',
    ownershipPolicy: 'direct_assignment',
    queueId: 'queue-nursing-care',
    queueName: 'طابور مهام التمريض والاستلام والتسليم',
    assignedTo: {
      id: 'staff-nurse-02',
      name: 'مها العنزي',
      role: 'أخصائي تثقيف سكري'
    },
    claimedBy: {
      id: 'staff-nurse-02',
      name: 'مها العنزي',
      role: 'أخصائي تثقيف سكري',
      claimedAt: '10:15 AM'
    },
    sourceEventTimestamp: '09:55 AM',
    createdAt: '10:00 AM',
    createdTimestamp: Date.now() - 60 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال ساعات العمل الصباحية قبل إتمام إجراءات الخروج',
    dueAt: '02:00 PM (متبقي 3 ساعات)',
    dueTimestamp: Date.now() + 180 * 60 * 1000,
    dueState: 'normal',
    waitingDuration: '1.0 ساعة',
    lastUpdatedAt: '10:20 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Type 2 Diabetes with Neuropathic Foot Ulcer',
      clinicalQuestion: 'التأكد من استيعاب المريضة والمرافقة لخطوات حقن الأنسولين المنزلي والعناية بالجروح.',
      vitalSigns: 'BP: 122/74 | HR: 70 | Glucose: 142 mg/dL',
      relevantLab: 'Fasting Glucose: 130 mg/dL | HbA1c: 7.8%',
      keyFindings: 'التئام جزئي للقرحة مع رعاية تمريضية متقدمة، المريضة في جلسة علاج طبيعي حالياً.',
      redFlags: []
    },
    allowedActions: ['open_patient', 'complete', 'request_info'],
    tags: ['Care Plan', 'Discharge Readiness', 'Education'],
    targetWorkspaceAxis: 'care_plan',
    targetWorkspaceOptions: {
      tab: 'education'
    },
    targetStepContext: {
      targetAxis: 'care_plan',
      axisNameAr: 'المحور التاسع: خطة الرعاية والتثقيف الصحي',
      stepTitleAr: 'سجل التثقيف الصحي للأنسولين وجاهزية الخروج',
      stepDescriptionAr: 'الانتقال إلى خطة التثقيف لتوثيق استيعاب المريضة لجرعات الأنسولين والعناية بالقدم',
      recommendedActionAr: 'فتح سجل التثقيف الصحي (Axis 9 Education)',
      sourceResourceId: 'GOAL-EDU-881'
    },
    activityHistory: [
      {
        id: 'ACT-07-A',
        timestamp: '10:00 AM',
        eventType: 'created',
        actorName: 'د. أسماء عبد العزيز',
        actorRole: 'طبيب باطنة وسكري',
        description: 'إدراج هدف التثقيف الدوائي في خطة الرعاية'
      },
      {
        id: 'ACT-07-B',
        timestamp: '10:20 AM',
        eventType: 'waiting',
        actorName: 'مها العنزي',
        actorRole: 'أخصائي تثقيف سكري',
        description: 'المريضة في وحدة العلاج الطبيعي حالياً، بانتظار عودتها للسرير'
      }
    ]
  },

  // =========================================================================
  // SCENARIO H: Cancelled Source Request Edge Case (Source No Longer Actionable)
  // =========================================================================
  {
    id: 'WI-CANC-008',
    type: 'consultation_review',
    title: 'طلب استشارة عظام (ملغى من المصدر - لتحسن الأعراض وخروج المريض)',
    description: 'تم طلب استشارة عظام لألم ركبة حاد بعد سقوط بسيط، ثم تقرر إلغاء الطلب من قِبل طبيب الطوارئ بعد ثبوت سلامة الأشعة وزوال الألم.',
    patient: {
      id: 'p-108',
      mrn: 'MRN-2024-008',
      nameAr: 'يوسف فهد المطيري',
      nameEn: 'Yousef Fahad Al-Mutairi',
      age: 27,
      gender: 'M',
      encounterId: 'ENC-ER-99130',
      encounterType: 'emergency',
      currentLocation: 'طوارئ: مغادر بعد العلاج (Discharged)',
      department: 'er',
      allergies: ['لا توجد حساسيات مسجلة'],
      criticalFlags: ['Encounter Closed']
    },
    workArea: 'er',
    sourceModule: 'Emergency Clinical Consultations',
    sourceResourceType: 'consultation_request',
    sourceResourceId: 'REQ-CONS-9940',
    sourceStatus: 'cancelled',
    sourceRequestedBy: {
      name: 'د. ماجد الدوسري',
      role: 'طبيب طوارئ',
      department: 'قسم الطوارئ والحوادث',
      requestedAt: '08:15 صباحاً (أُلغي 09:30 صباحاً)'
    },
    workflowProcess: 'Specialty Consultation Workflow',
    currentStep: 'Cancelled / Superseded by Requester',
    sourceUrgency: 'routine',
    priority: 'routine',
    operationalStatus: 'cancelled_source',
    ownershipPolicy: 'self_claim',
    queueId: 'queue-all',
    queueName: 'جميع طوابير العمل المتاحة',
    assignedTo: null,
    claimedBy: null,
    sourceEventTimestamp: '08:10 AM',
    createdAt: '08:15 AM',
    createdTimestamp: Date.now() - 180 * 60 * 1000,
    configuredDueTarget: 'غير محدد (تم إلغاء أصل الطلب من المصدر)',
    dueAt: null,
    dueTimestamp: null,
    dueState: 'normal',
    waitingDuration: 'ملغى من المصدر',
    lastUpdatedAt: '09:30 AM',
    isCancelledSource: true,
    isNoLongerActionable: true,
    sourceChangeNotice: 'تنبيه سلامة سريري: تم إلغاء الطلب الأصلي من قِبل الطبيب الطالب في الطوارئ (د. ماجد الدوسري) بعد خروج المريض مستقراً. تم تعطيل إجراءات الإكمال والقبول لمنع ازدواجية أو خطأ العمل.',
    cancellationReason: 'تم إلغاء الطلب الأصلي من قِبل الطبيب الطالب في الطوارئ لتحسن الأعراض السريرية واستبعاد الإصابة الرباطية، وأصبح هذا الإجراء غير قابل للتنفيذ.',
    clinicalContextSummary: {
      primaryDiagnosis: 'Knee Contusion - Resolved',
      clinicalQuestion: 'طلب تقييم الرباط الصليبي (أُلغي لاحقاً لسلامة الفحص الحركي والأشعة).',
      vitalSigns: 'Stable',
      keyFindings: 'أشعة الركبة سليمة بدون كسور، المريض غادر الطوارئ مشياً بدون عرج.',
      redFlags: []
    },
    allowedActions: ['refresh_source', 'open_patient'],
    tags: ['Cancelled Source', 'No Longer Actionable', 'Closed Encounter'],
    targetWorkspaceAxis: 'notes',
    targetStepContext: {
      targetAxis: 'notes',
      axisNameAr: 'المحور الخامس: التوثيق السريري',
      stepTitleAr: 'سجل الطلبات الملغاة والملاحظات',
      stepDescriptionAr: 'عرض سجل المعاينة وحالة إلغاء الطلب من المصدر',
      recommendedActionAr: 'فتح تفاصيل السجل السريري (Axis 5 Notes)',
      sourceResourceId: 'REQ-CONS-9940'
    },
    activityHistory: [
      {
        id: 'ACT-08-A',
        timestamp: '08:15 AM',
        eventType: 'created',
        actorName: 'د. ماجد الدوسري',
        actorRole: 'طبيب طوارئ',
        description: 'إنشاء طلب الاستشارة المبدئي'
      },
      {
        id: 'ACT-08-B',
        timestamp: '09:30 AM',
        eventType: 'cancelled',
        actorName: 'د. ماجد الدوسري',
        actorRole: 'طبيب طوارئ',
        description: 'إلغاء الطلب الأصلي لتحسن الأعراض وخروج المريض'
      }
    ]
  },

  // =========================================================================
  // SCENARIO I: Simulated Claim Conflict Item (Triggers Conflict Simulation)
  // =========================================================================
  {
    id: 'WI-CONF-009',
    type: 'consultation_review',
    title: 'طلب استشارة أمراض كلى (تقييم قصور كلوي حاد في العناية)',
    description: 'ارتفاع مفاجئ في الكرياتينين وقلة البول لدى مريض العناية المركزة، يتطلب مراجعة استشاري الكلى لبدء الغسيل الكلوي المستمر (CRRT).',
    patient: {
      id: 'p-109',
      mrn: 'MRN-2024-009',
      nameAr: 'عبد الله صالح الغامدي',
      nameEn: 'Abdullah Saleh Al-Ghamdi',
      age: 71,
      gender: 'M',
      encounterId: 'ENC-ICU-77198',
      encounterType: 'inpatient',
      currentLocation: 'العناية المركزة: سرير ICU-07',
      department: 'icu',
      bedCode: 'ICU-07',
      allergies: ['NSAIDs (Acute Kidney Injury)'],
      criticalFlags: ['Oliguria < 0.3 ml/kg/h', 'Hyperkalemia Risk']
    },
    workArea: 'icu',
    sourceModule: 'Nephrology Consults',
    sourceResourceType: 'consultation_request',
    sourceResourceId: 'REQ-CONS-9955',
    sourceStatus: 'submitted',
    sourceRequestedBy: {
      name: 'د. ريان البلوي',
      role: 'أخصائي العناية الحرجة',
      department: 'قسم العناية المركزة ICU',
      requestedAt: '10:40 صباحاً (منذ 20 دقيقة)'
    },
    workflowProcess: 'Urgent Inpatient Nephrology Consult',
    currentStep: 'Queue Triage & Clinical Acceptance',
    sourceUrgency: 'urgent',
    priority: 'urgent',
    operationalStatus: 'unassigned',
    ownershipPolicy: 'self_claim',
    queueId: 'queue-all',
    queueName: 'طابور استشارات الباطنة والتخصصات الدقيقة',
    assignedTo: null,
    claimedBy: null,
    sourceEventTimestamp: '10:35 AM',
    createdAt: '10:40 AM',
    createdTimestamp: Date.now() - 20 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال 60 دقيقة من وقت الطلب',
    dueAt: '11:40 AM (متبقي 40 دقيقة)',
    dueTimestamp: Date.now() + 40 * 60 * 1000,
    dueState: 'due_soon',
    waitingDuration: '20 دقيقة',
    lastUpdatedAt: '10:48 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Acute Kidney Injury KDIGO Stage 3 (N17.9)',
      clinicalQuestion: 'تقييم الحاجة العاجلة لبدء القسطرة الوريدية وغسيل الكلى المستمر (CRRT) مع فرط بوتاسيوم الدم.',
      vitalSigns: 'BP: 142/86 | HR: 82 | SpO2: 96%',
      relevantLab: 'Serum Creatinine: 4.8 mg/dL (Baseline 1.2) | BUN: 78 mg/dL | K+: 5.7 mmol/L',
      keyFindings: 'احتباس سوائل وانخفاض ملحوظ في إنتاج البول خلال آخر 8 ساعات.',
      redFlags: ['Refractory Hyperkalemia', 'Volume Overload']
    },
    allowedActions: ['claim', 'open_patient', 'request_info'],
    tags: ['Nephrology', 'CRRT', 'Simulation Conflict Item'],
    targetWorkspaceAxis: 'notes',
    targetStepContext: {
      targetAxis: 'notes',
      axisNameAr: 'المحور الخامس: التوثيق السريري والملاحظات',
      stepTitleAr: 'استشارة أمراض الكلى وقرار الغسيل CRRT',
      stepDescriptionAr: 'الانتقال إلى شاشة التوثيق لفتح نموذج استشارة الكلى السريرية',
      recommendedActionAr: 'فتح نموذج استشارة الكلى (Axis 5 Notes)',
      sourceResourceId: 'REQ-CONS-9955'
    },
    activityHistory: [
      {
        id: 'ACT-09-A',
        timestamp: '10:40 AM',
        eventType: 'created',
        actorName: 'د. ريان البلوي',
        actorRole: 'أخصائي العناية الحرجة',
        description: 'إرسال طلب الاستشارة العاجل'
      }
    ]
  },

  // =========================================================================
  // SCENARIO J: Completed Recent Work Items (Completed View Verification)
  // =========================================================================
  {
    id: 'WI-COMP-010',
    type: 'consultation_review',
    title: 'استشارة أمراض القلب (متلازمة الشريان التاجي الحادة NSTEMI)',
    description: 'تمت معاينة المريض وإجراء الفحص السريري وقراءة تخطيط القلب والإنزيمات، وتوثيق تقرير الاستشارة والتوصية بجدولة قسطرة شرايين تاجية عاجلة.',
    patient: {
      id: 'p-101',
      mrn: 'MRN-2024-001',
      nameAr: 'عمر خالد المنصور',
      nameEn: 'Omar Khalid Al-Mansour',
      age: 32,
      gender: 'M',
      encounterId: 'ENC-ER-99120',
      encounterType: 'emergency',
      currentLocation: 'طوارئ: سرير ER-RESUS-01',
      department: 'er'
    },
    workArea: 'er',
    sourceModule: 'Cardiology Consultations',
    sourceResourceType: 'consultation_request',
    sourceResourceId: 'REQ-CONS-9901',
    sourceStatus: 'closed',
    sourceRequestedBy: {
      name: 'د. سامي القحطاني',
      role: 'طبيب طوارئ أول',
      department: 'قسم الطوارئ والحوادث',
      requestedAt: '08:00 صباحاً'
    },
    workflowProcess: 'Cardiology Consultation Protocol',
    currentStep: 'Consultation Completed & Documented',
    sourceUrgency: 'urgent',
    priority: 'urgent',
    operationalStatus: 'completed',
    ownershipPolicy: 'self_claim',
    queueId: 'queue-all',
    queueName: 'طابور استشارات القلب',
    assignedTo: {
      id: 'staff-doc-cardio',
      name: 'د. إبراهيم الزهراني',
      role: 'استشاري أمراض القلب والقسطرة'
    },
    claimedBy: {
      id: 'staff-doc-cardio',
      name: 'د. إبراهيم الزهراني',
      role: 'استشاري أمراض القلب والقسطرة',
      claimedAt: '08:15 AM'
    },
    sourceEventTimestamp: '07:55 AM',
    createdAt: '08:00 AM',
    createdTimestamp: Date.now() - 210 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال 60 دقيقة',
    dueAt: '09:00 AM',
    dueTimestamp: Date.now() - 150 * 60 * 1000,
    dueState: 'normal',
    waitingDuration: 'مكتمل بنجاح',
    lastUpdatedAt: '08:45 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'NSTEMI - Acute Coronary Syndrome',
      clinicalQuestion: 'تقييم الحاجة لقسطرة عاجلة',
      keyFindings: 'تمت كتابة التقرير في Axis 5 وتفعيل بروتوكول الهيبارين ونقل المريض لوحدة القسطرة.'
    },
    allowedActions: ['open_patient'],
    tags: ['Completed', 'Cardiology', 'Documented'],
    targetWorkspaceAxis: 'notes',
    targetStepContext: {
      targetAxis: 'notes',
      axisNameAr: 'المحور الخامس: التوثيق السريري والملاحظات',
      stepTitleAr: 'مذكرة استشارة أمراض القلب المعتمدة',
      stepDescriptionAr: 'تقرير الاستشارة الموثق في السجل السريري للمريض',
      recommendedActionAr: 'عرض التقرير السريري المعتمد (Axis 5 Notes)',
      sourceResourceId: 'REQ-CONS-9901'
    },
    activityHistory: [
      {
        id: 'ACT-10-A',
        timestamp: '08:00 AM',
        eventType: 'created',
        actorName: 'د. سامي القحطاني',
        actorRole: 'طبيب طوارئ',
        description: 'إنشاء طلب الاستشارة'
      },
      {
        id: 'ACT-10-B',
        timestamp: '08:15 AM',
        eventType: 'claimed',
        actorName: 'د. إبراهيم الزهراني',
        actorRole: 'استشاري القلب',
        description: 'استلام الطلب وإجراء المعاينة السريرية'
      },
      {
        id: 'ACT-10-C',
        timestamp: '08:45 AM',
        eventType: 'completed',
        actorName: 'د. إبراهيم الزهراني',
        actorRole: 'استشاري القلب',
        description: 'اعتماد مذكرة الاستشارة وإغلاق الإجراء السريري بنجاح',
        outcomeNotes: 'تم توثيق الاستشارة والتوصية بـ PCI خلال 24 ساعة، وإعطاء مضادات الصفائح المزدوجة.'
      }
    ],
    completionOutcome: {
      completedAt: '08:45 AM',
      completedBy: 'د. إبراهيم الزهراني (استشاري القلب)',
      outcomeNote: 'تمت كتابة تقرير الاستشارة الكامل في السجل السريري (Axis 5) والتوصية بـ PCI.',
      resultingDocTitle: 'مذكرة استشارة أمراض القلب (Cardiology Consultation Note)',
      disposition: 'مقبول للقسطرة التداخلية'
    }
  },

  {
    id: 'WI-COMP-011',
    type: 'critical_result_followup',
    title: 'اعتماد نتيجة حرجة: غازات الدم الشرياني ABG (Severe Acidosis pH 7.18)',
    description: 'تم اعتماد وقراءة نتيجة الحماض الأيضي الحاد هاتفياً وسريرياً وضبط إعدادات جهاز التنفس الاصطناعي مع إعطاء بيكربونات الصوديوم.',
    patient: {
      id: 'p-102',
      mrn: 'MRN-2024-002',
      nameAr: 'سارة عبد الله الشمري',
      nameEn: 'Sarah Abdullah Al-Shammari',
      age: 67,
      gender: 'F',
      encounterId: 'ENC-ER-99125',
      encounterType: 'emergency',
      currentLocation: 'طوارئ: سرير الإنعاش ER-RESUS-02',
      department: 'er'
    },
    workArea: 'er',
    sourceModule: 'Laboratory Information System (LIS)',
    sourceResourceType: 'lab_result',
    sourceResourceId: 'RES-ABG-1024',
    sourceStatus: 'closed',
    sourceRequestedBy: {
      name: 'مختبر الطوارئ المركزي',
      role: 'فني غازات الدم',
      department: 'قسم المختبرات',
      requestedAt: '07:15 صباحاً'
    },
    workflowProcess: 'Critical Alert Protocol',
    currentStep: 'Acknowledged & Managed',
    sourceUrgency: 'stat',
    priority: 'critical',
    operationalStatus: 'completed',
    ownershipPolicy: 'direct_assignment',
    queueId: 'queue-critical-results',
    queueName: 'طابور تصعيد ومتابعة النتائج الحرجة',
    assignedTo: {
      id: 'staff-doc-er',
      name: 'د. فيصل الشهري',
      role: 'استشاري طب الطوارئ'
    },
    claimedBy: {
      id: 'staff-doc-er',
      name: 'د. فيصل الشهري',
      role: 'استشاري طب الطوارئ',
      claimedAt: '07:20 AM'
    },
    sourceEventTimestamp: '07:10 AM',
    createdAt: '07:15 AM',
    createdTimestamp: Date.now() - 250 * 60 * 1000,
    configuredDueTarget: 'المستهدف: خلال 30 دقيقة',
    dueAt: '07:45 AM',
    dueTimestamp: Date.now() - 220 * 60 * 1000,
    dueState: 'normal',
    waitingDuration: 'مكتمل بنجاح',
    lastUpdatedAt: '07:25 AM',
    clinicalContextSummary: {
      primaryDiagnosis: 'Severe Metabolic Acidosis with Respiratory Compensation',
      keyFindings: 'pH: 7.18 | pCO2: 26 | HCO3: 9.8 | Base Excess: -16'
    },
    allowedActions: ['open_patient'],
    tags: ['Critical Lab', 'Acknowledged', 'ABG'],
    targetWorkspaceAxis: 'results',
    targetStepContext: {
      targetAxis: 'results',
      axisNameAr: 'المحور السابع: نتائج التحاليل والتقارير',
      stepTitleAr: 'فحص غازات الدم الشرياني ABG وسجل الاعتماد',
      stepDescriptionAr: 'النتيجة المعتمدة مع توثيق القراءة العكسية والتدخل السريري',
      recommendedActionAr: 'عرض تفاصيل الفحص المخبري (Axis 7 Lab)',
      sourceResourceId: 'RES-ABG-1024'
    },
    activityHistory: [
      {
        id: 'ACT-11-A',
        timestamp: '07:15 AM',
        eventType: 'created',
        actorName: 'مختبر الطوارئ',
        actorRole: 'Lab Technologist',
        description: 'رصد نتيجة حرجة'
      },
      {
        id: 'ACT-11-B',
        timestamp: '07:20 AM',
        eventType: 'completed',
        actorName: 'د. فيصل الشهري',
        actorRole: 'استشاري طب الطوارئ',
        description: 'اعتماد النتيجة وتوثيق الإجراء السريري الفوري'
      }
    ],
    completionOutcome: {
      completedAt: '07:25 AM',
      completedBy: 'د. فيصل الشهري (استشاري طب الطوارئ)',
      outcomeNote: 'تم الاطلاع والاعتماد الفوري وإعطاء بيكربونات الصوديوم ورفع حجم التهوية الدقيقة.',
      resultingDocTitle: 'سجل اعتماد النتيجة الحرجة (Critical Value Sign-Off)',
      disposition: 'تم التدخل والتثبيت'
    }
  }
];
