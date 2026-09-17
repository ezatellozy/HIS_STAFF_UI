import {
  DocumentationCategory,
  DocumentationTemplateDefinition,
  ClinicalNoteRecord
} from '../types/clinicalNotesDocumentation';

export const MOCK_NOTE_TEMPLATES: DocumentationTemplateDefinition[] = [
  {
    id: 'tpl-soap-standard',
    nameAr: 'ملاحظة تقدم سريري بنموذج (SOAP Note)',
    nameEn: 'Progress Note - SOAP Framework',
    category: 'progress_note',
    structureType: 'soap',
    defaultTitleAr: 'ملاحظة تقدم يومية - جولة الأطباء',
    defaultTitleEn: 'Daily Clinical Progress Note',
    applicableDepartments: ['emergency', 'inpatient_ward', 'inpatient_icu', 'outpatient_clinic'],
    applicableRoles: ['doctor', 'nurse'],
    descriptionAr: 'النموذج القياسي المعتمد لتوثيق الجولات السريرية اليومية وحالة المريض التطورية.',
    sections: [
      {
        key: 'subjective',
        labelAr: 'الأعراض والشكوى الذاتية (Subjective - S)',
        labelEn: 'Subjective / Patient Report',
        placeholderAr: 'شكوى المريض، تطور الألم، الأعراض الليلية، استجابة المريض للعلاج...'
      },
      {
        key: 'objective',
        labelAr: 'المشاهدات والفحص السريري والنتائج (Objective - O)',
        labelEn: 'Objective / Physical Exam & Findings',
        placeholderAr: 'العلامات الحيوية، فحص الأجهزة (القلب، الصدر، البطن)، نتائج الفحوصات المخبرية والأشعة الأخيرة...'
      },
      {
        key: 'assessment',
        labelAr: 'التقييم السريري والتشخيص (Assessment - A)',
        labelEn: 'Clinical Assessment & Trajectory',
        placeholderAr: 'التشخيص الحالي، استقرار الحالة السريرية، المضاعفات المحتملة...'
      },
      {
        key: 'plan',
        labelAr: 'خطة العلاج والمتابعة (Plan - P)',
        labelEn: 'Therapeutic Plan & Next Steps',
        placeholderAr: 'تعديلات الأدوية، الفحوصات المطلوبة، الاستشارات، معايير الخروج أو النقل...'
      }
    ]
  },
  {
    id: 'tpl-narrative-general',
    nameAr: 'توثيق سريري سردي عام (General Clinical Narrative)',
    nameEn: 'General Clinical Narrative',
    category: 'progress_note',
    structureType: 'narrative',
    defaultTitleAr: 'توثيق حالة سريرية عامة',
    defaultTitleEn: 'General Clinical Note',
    applicableDepartments: ['emergency', 'inpatient_ward', 'inpatient_icu', 'outpatient_clinic'],
    descriptionAr: 'توثيق سريري حر ومرن للحالات التي لا تتطلب نموذج SOAP الصارم.',
    sections: [
      {
        key: 'narrative_body',
        labelAr: 'نص التقرير والتقييم السريري',
        labelEn: 'Clinical Narrative & Summary',
        placeholderAr: 'اكتب التقييم والملاحظات السريرية هنا بحرية مع إمكانية إدراج البيانات الحيوية والمشكلات...'
      }
    ]
  },
  {
    id: 'tpl-admission-comprehensive',
    nameAr: 'ملاحظة التنويم ودخول المريض (Inpatient Admission Note)',
    nameEn: 'Inpatient Admission Note',
    category: 'admission_note',
    structureType: 'admission',
    defaultTitleAr: 'ملاحظة تنويم واستقبال سريري - الطب الباطني',
    defaultTitleEn: 'Internal Medicine Admission Note',
    applicableDepartments: ['emergency', 'inpatient_ward', 'inpatient_icu'],
    descriptionAr: 'توثيق شامل لسبب الدخول، السيرة المرضية، الفحص السريري الأولي وخطة التنويم المبدئية.',
    sections: [
      {
        key: 'chief_complaint',
        labelAr: 'سبب التنويم والشكوى الرئيسية',
        labelEn: 'Chief Complaint & Reason for Admission',
        placeholderAr: 'الأعراض المباشرة التي استدعت التنويم...'
      },
      {
        key: 'hpi',
        labelAr: 'تاريخ المرض الحالي (HPI)',
        labelEn: 'History of Present Illness',
        placeholderAr: 'تسلسل زمني لتطور الأعراض والعلاجات المسبقة...'
      },
      {
        key: 'admission_exam',
        labelAr: 'الفحص السريري عند التنويم',
        labelEn: 'Admission Physical Examination',
        placeholderAr: 'تقييم مفصل لكافة الأجهزة عند الوصول للقسم...'
      },
      {
        key: 'admission_plan',
        labelAr: 'خطة الرعاية والتنويم',
        labelEn: 'Initial Inpatient Management Plan',
        placeholderAr: 'العلاج الدوائي، الحركية، التغذية، الفحوصات الاستقصائية...'
      }
    ]
  },
  {
    id: 'tpl-consult-formal',
    nameAr: 'تقرير وملاحظة الاستشارة التخصصية (Consultation Note)',
    nameEn: 'Formal Specialty Consultation Note',
    category: 'consultation_note',
    structureType: 'specialty',
    defaultTitleAr: 'تقرير استشارة أمراض القلب والأوعية الدموية',
    defaultTitleEn: 'Cardiology Consultation Note',
    applicableDepartments: ['inpatient_ward', 'inpatient_icu', 'emergency'],
    descriptionAr: 'توثيق رد الاستشاري على السؤال السريري الموجه من الفريق المعالج مع التوصيات الملزمة.',
    sections: [
      {
        key: 'reason_for_consult',
        labelAr: 'السؤال السريري المطروح للاستشارة',
        labelEn: 'Clinical Question Addressed',
        placeholderAr: 'مثال: تقييم متلازمة الشريان التاجي الحادة والحاجة لقسطرة تداخلية...'
      },
      {
        key: 'consult_findings',
        labelAr: 'نتائج تقييم الاستشاري وفحصه',
        labelEn: 'Consultant Examination & Review',
        placeholderAr: 'مراجعة المخطط والتخطيط والإنزيمات والفحص القلبي الموجه...'
      },
      {
        key: 'consult_recommendations',
        labelAr: 'التوصيات والقرارات التخصصية',
        labelEn: 'Specific Specialty Recommendations',
        placeholderAr: '1. استمرار مضادات التخثر\n2. جدولة قسطرة شرايين عاجلة\n3. موازنة السوائل...'
      }
    ]
  },
  {
    id: 'tpl-operative-note',
    nameAr: 'تقرير الإجراء الجراحي والتداخلي (Operative / Procedure Note)',
    nameEn: 'Operative & Interventional Procedure Note',
    category: 'operative_procedure_note',
    structureType: 'operative',
    defaultTitleAr: 'تقرير إجراء قسطرة الشرايين التاجية التشخيصية والعلاجية',
    defaultTitleEn: 'Coronary Angiography & Stenting Note',
    applicableDepartments: ['operating_theatre', 'inpatient_icu'],
    descriptionAr: 'توثيق تفصيلي للعملية الجراحية، الجراحين، التخدير، الخطوات، والمضاعفات إن وجدت.',
    sections: [
      {
        key: 'pre_post_dx',
        labelAr: 'التشخيص قبل وبعد العملية',
        labelEn: 'Pre & Post-Operative Diagnoses',
        placeholderAr: 'التشخيص المعتمد المؤكد بعد إجراء التدخل...'
      },
      {
        key: 'surgical_findings',
        labelAr: 'المشاهدات والنتائج الجراحية داخل غرفة العمليات',
        labelEn: 'Operative Findings',
        placeholderAr: 'وصف الآفات، نسبة التضيق، مواضع وضع الدعامات...'
      },
      {
        key: 'procedure_steps',
        labelAr: 'خطوات العملية والتقنية المستخدمة',
        labelEn: 'Procedure Steps & Technique',
        placeholderAr: 'التعقيم، المدخل الشرياني، القساطر المستخدمة، التباين...'
      },
      {
        key: 'post_op_orders',
        labelAr: 'توصيات العناية الفورية بعد العملية',
        labelEn: 'Immediate Post-Procedure Instructions',
        placeholderAr: 'فترة الراحة، إزالة الغمد، مراقبة النبض الطرفي...'
      }
    ]
  },
  {
    id: 'tpl-sbar-handover',
    nameAr: 'ملاحظة التسليم والاستلام السريري (SBAR Handover Note)',
    nameEn: 'Interdisciplinary SBAR Handover Note',
    category: 'handover_note',
    structureType: 'sbar',
    defaultTitleAr: 'تسليم سريري بين المناوبات - تمريض ورعاية مركزة',
    defaultTitleEn: 'Nursing Shift Handoff Note',
    applicableDepartments: ['inpatient_ward', 'inpatient_icu', 'emergency'],
    descriptionAr: 'نموذج SBAR المعياري المعتمد للتسليم الآمن بين الفرق الطبية وتجنب ضياع المعلومات الحيوية.',
    sections: [
      { key: 'situation', labelAr: 'الحالة الآنية (Situation - S)', labelEn: 'Current Situation', placeholderAr: 'المريض، الموقع، المشكلة الحالية الحرجة...' },
      { key: 'background', labelAr: 'الخلفية المرضية (Background - B)', labelEn: 'Clinical Background', placeholderAr: 'تاريخ الدخول، السيرة الطبية السابقة، الأدوية المؤثرة...' },
      { key: 'assessment', labelAr: 'التقييم الحالي (Assessment - A)', labelEn: 'Clinical Assessment', placeholderAr: 'الوعي، العلامات الحيوية، استقرار مجرى التنفس والنزح...' },
      { key: 'recommendation', labelAr: 'التوصيات والمهام المعلقة (Recommendation - R)', labelEn: 'Recommendation & Pending Actions', placeholderAr: 'فحوصات منتظرة، مراقبة خاصة، إجراءات المناوبة القادمة...' }
    ]
  },
  {
    id: 'tpl-informed-consent',
    nameAr: 'إقرار وتفويض الإجراء الطبي والجراحي (Informed Consent Form)',
    nameEn: 'Procedural & Surgical Informed Consent Form',
    category: 'clinical_form',
    structureType: 'operative',
    defaultTitleAr: 'إقرار وتفويض قسطرة الشرايين التاجية التداخلية (PCI Consent)',
    defaultTitleEn: 'Informed Procedural Consent Form',
    applicableDepartments: ['operating_theatre', 'inpatient_icu', 'emergency', 'inpatient_ward'],
    descriptionAr: 'نموذج الإقرار الطبي المستنير لتوثيق موافقة المريض أو ممثله القانوني والمخاطر والمنافع المشروحة.',
    sections: [
      { key: 'procedure_explanation', labelAr: 'الإجراء المشروح والمنافع المرجوة', labelEn: 'Procedure Explained & Benefits', placeholderAr: 'شرح طبيعة الإجراء والغرض العلاجي منه...' },
      { key: 'material_risks', labelAr: 'المخاطر المحتملة والبدائل المتاحة', labelEn: 'Material Risks & Alternatives', placeholderAr: 'المخاطر السريرية، النزف، الحساسية، والخيارات البديلة...' },
      { key: 'patient_acknowledgement', labelAr: 'إقرار المريض / الوكيل القانوني', labelEn: 'Patient/Guardian Acknowledgement', placeholderAr: 'أقر بأنني اطلعت على كامل التفاصيل وأتيحت لي فرصة الاستفسار وأوافق طواعية...' }
    ]
  },
  {
    id: 'tpl-discharge-summary-formal',
    nameAr: 'ملخص الخروج الطبي المعتمد (Formal Discharge Summary)',
    nameEn: 'Inpatient Clinical Discharge Summary',
    category: 'discharge_summary',
    structureType: 'discharge',
    defaultTitleAr: 'تقرير وملخص الخروج السريري النهائي',
    defaultTitleEn: 'Inpatient Discharge Summary Note',
    applicableDepartments: ['inpatient_ward', 'inpatient_icu'],
    descriptionAr: 'الملخص النهائي الشامل للتنويم وخطة الأدوية المنزلية وتعليمات المتابعة بعد الخروج.',
    sections: [
      { key: 'hospital_course', labelAr: 'المسار السريري أثناء التنويم', labelEn: 'Hospital Course & Clinical Trajectory', placeholderAr: 'ملخص العلاجات والتدخلات التي تمت خلال فترة البقاء بالمستشفى...' },
      { key: 'discharge_meds', labelAr: 'خطة الأدوية بعد الخروج', labelEn: 'Post-Discharge Medication Reconciliation', placeholderAr: 'الأدوية المستمرة، الجرعات، التعديلات والإيقافات...' },
      { key: 'followup_instructions', labelAr: 'تعليمات المتابعة والإنذار المبكر', labelEn: 'Follow-Up Appointments & Red Flags', placeholderAr: 'مواعيد العيادات الخارجية، علامات الخطر التي تستدعي مراجعة الطوارئ فوراً...' }
    ]
  }
];

export const INITIAL_PATIENT_NOTES: ClinicalNoteRecord[] = [
  {
    id: 'NOTE-2026-081',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterType: 'emergency',
    category: 'physician_note',
    templateId: 'tpl-soap-standard',
    structureType: 'soap',
    titleAr: 'ملاحظة تقييم متلازمة الشريان التاجي الحادة (ACS)',
    titleEn: 'Emergency Cardiology Assessment Note',
    content: `[الشكوى الذاتية]:
ألم ضاغط حاد خلف القص بدأ قبل ساعتين من الوصول، ينتشر للكتف الأيسر والفك السفلي، مترافق مع تعرق بارد وغثيان. الألم مستمر بدرجة 8/10 على مقياس الألم، غير مرتبط بالتنفس، لم يستجب للراحة.

[المشاهدات والفحص السريري]:
- المريض متألم وواعٍ تماماً (GCS 15/15).
- العلامات الحيوية: الضغط 148/92 mmHg، النبض 98 bpm منتظم، التنفس 20/min، الأكسجين 96% على هواء الغرفة.
- القلب: أصوات القلب S1, S2 مسموعة طبيعية بدون لغط أو احتكاك تأموري.
- الصدر: تنفس حويصلي متناظر بدون خPhase أو أزيز.
- تخطيط القلب (ECG): انخفاض في القطعة ST بمقدار 1.5 ملم في المساري V4-V6 مع انقلاب موجة T.
- التروبونين الأولي: 0.18 ng/mL (مرتفع).

[التقييم السريري]:
High-Risk Non-ST Elevation Myocardial Infarction (NSTEMI) / GRACE Risk Score > 140.
استقرار الدورة الدموية حالياً بدون علامات هبوط قلب حاد (Killip Class I).

[خطة العلاج المعتمدة]:
1. تحميل الأسبرين 300 ملغ فموي + كلوبيدوغريل 300 ملغ.
2. حقن إينوكسابارين 60 ملغ تحت الجلد كل 12 ساعة.
3. طلب استشارة عاجلة لقسم أمراض القلب التداخلية لتقييم القسطرة الإسعافية.
4. إعادة سحب إنزيمات القلب (Serial Troponin) بعد 3 ساعات لمقارنة المنحنى.
5. نقل المريض إلى سرير مراقبة القلب المتقدم (Telemetry).`,
    state: 'final_signed',
    author: {
      id: 'DOC-881',
      name: 'د. طارق المنشاوي',
      role: 'Consultant Emergency Medicine',
      roleLabelAr: 'استشاري طب الطوارئ',
      specialty: 'طب الطوارئ والحالات الحرجة',
      department: 'قسم الطوارئ والحوادث'
    },
    createdAt: '2026-09-12 10:15 ص',
    documentedAt: '2026-09-12 10:35 ص',
    signedAt: '2026-09-12 10:40 ص',
    signedBy: 'د. طارق المنشاوي (ترخيص: 2026-EM-9921)',
    coSignRequirement: 'none',
    version: 1,
    versionHistory: [
      {
        versionNumber: 1,
        savedAt: '2026-09-12 10:40 ص',
        savedBy: 'د. طارق المنشاوي',
        title: 'ملاحظة تقييم متلازمة الشريان التاجي الحادة (ACS)',
        content: 'Initial signed emergency cardiology assessment note.',
        state: 'final_signed'
      }
    ],
    addenda: [
      {
        id: 'ADD-01',
        timestamp: '2026-09-12 11:20 ص',
        authorId: 'DOC-881',
        authorName: 'د. طارق المنشاوي',
        authorRole: 'استشاري طب الطوارئ',
        authorSpecialty: 'طب الطوارئ',
        content: 'إلحاق (Addendum): تم التواصل هاتفياً مع استشاري القلب المناوب د. خالد عبد العزيز وتم استلام الحالة والاتفاق على تحويل المريض لقسم قسطرة القلب (Cath Lab) كأولوية قصوى خلال 60 دقيقة.',
        signedAt: '2026-09-12 11:22 ص',
        reason: 'تحديث مسار الرعاية وقرار استشاري القلب'
      }
    ],
    referencedClinicalData: {
      vitalsIncluded: true,
      problemsIncluded: true,
      allergiesIncluded: true,
      labsIncluded: true
    },
    tags: ['NSTEMI', 'Emergency', 'Cardiology', 'High Risk']
  },
  {
    id: 'NOTE-2026-082',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterType: 'emergency',
    category: 'consultation_note',
    templateId: 'tpl-consult-formal',
    structureType: 'specialty',
    titleAr: 'تقرير وملاحظة الاستشارة التخصصية - أمراض القلب',
    titleEn: 'Cardiology Bedside Consultation Note',
    content: `[السؤال السريري المطروح]:
تقييم ألم الصدر الحاد NSTEMI وتحديد موعد القسطرة التاجية التداخلية.

[المشاهدات والفحص]:
المريض تم فحصه بجانب السرير. الفحص القلبي مستقر، نبضات الأطراف سليمة.
تمت مراجعة تخطيط القلب وتأكيد انخفاض ST في المساري الخلفية والسفلية.
إيكو القلب السريري بجانب السرير أظهر نقص حركية خفيف في الجدار السفلي، كفاءة العضلة 50%.

[التوصيات الملزمة]:
1. الحالة مقبولة لإجراء قسطرة شرايين تداخلية عاجلة (Urgent Coronary Angiogram) اليوم.
2. الحفاظ على المريض صائمًا NPO من الآن.
3. استمرار التمييع والوقاية الدوائية.
4. تحويل المريض فوراً لسرير التنويم بوحدة رعاية القلب المركزة (CCU) بانتظار استدعاء غرفة القسطرة.`,
    state: 'final_signed',
    author: {
      id: 'DOC-902',
      name: 'د. خالد عبد العزيز',
      role: 'Consultant Interventional Cardiologist',
      roleLabelAr: 'استشاري قسطرة وأمراض القلب',
      specialty: 'أمراض القلب التداخلية',
      department: 'مركز القلب والأوعية الدموية'
    },
    createdAt: '2026-09-12 11:45 ص',
    documentedAt: '2026-09-12 12:05 م',
    signedAt: '2026-09-12 12:10 م',
    signedBy: 'د. خالد عبد العزيز (ترخيص: 2026-CARD-4410)',
    coSignRequirement: 'none',
    version: 1,
    versionHistory: [
      {
        versionNumber: 1,
        savedAt: '2026-09-12 12:10 م',
        savedBy: 'د. خالد عبد العزيز',
        title: 'تقرير وملاحظة الاستشارة التخصصية - أمراض القلب',
        content: 'Original consultation report by Dr. Khaled.',
        state: 'final_signed'
      }
    ],
    addenda: [],
    referencedClinicalData: {
      vitalsIncluded: true,
      problemsIncluded: true
    },
    tags: ['Cardiology', 'Consultation', 'Cath Lab Referral']
  },
  {
    id: 'NOTE-2026-083',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterType: 'emergency',
    category: 'nursing_note',
    templateId: 'tpl-sbar-handover',
    structureType: 'sbar',
    titleAr: 'توثيق الملاحظة التمريضية والتسليم الداخلي (SBAR)',
    titleEn: 'Nursing Care & Handoff Note',
    content: `[الوضع الحالي (Situation)]:
مريض ذكر 58 سنة، يعاني من احتشاء قلبي حاد غير مرتفع ST، مستقر سريرياً بعد إعطاء الأدوية المسكنة والمميعة. درجة الألم انخفضت إلى 2/10.

[الخلفية (Background)]:
المريض لديه تاريخ ارتفاع ضغط الدم والسكري النوع الثاني. لا توجد حساسية دوائية معروفة (NKDA). مركب قسطرة وريدية محيطية قياس 18G في الذراع الأيمن ومحلول ملحي بطيء.

[التقييم (Assessment)]:
العلامات الحيوية: الضغط 132/84 mmHg، النبض 78 bpm، التشبع 98%، السكر 164 mg/dL.
المريض هادئ، واعي، لا يوجد ضيق تنفس أو تعرق، تخطيط القلب متصل بجهاز المراقبة المستمرة.

[التوصيات والمهام (Recommendation)]:
- الحفاظ على المريض صائمًا تماماً NPO للقسطرة.
- سحب عينة التروبونين الثانية الساعة 01:30 م.
- تجهيز المريض للنقل إلى وحدة العناية القلبية CCU فور توفر السرير.`,
    state: 'amended',
    author: {
      id: 'NUR-404',
      name: 'أحمد صلاح، RN',
      role: 'Staff Nurse BSN',
      roleLabelAr: 'أخصائي تمريض الحالات الحرجة',
      specialty: 'تمريض الطوارئ والعناية الفائقة',
      department: 'قسم الطوارئ'
    },
    createdAt: '2026-09-12 12:15 م',
    documentedAt: '2026-09-12 12:25 م',
    signedAt: '2026-09-12 12:28 م',
    signedBy: 'أحمد صلاح، RN',
    coSignRequirement: 'none',
    amendedBy: 'أحمد صلاح، RN',
    amendedAt: '2026-09-12 12:45 م',
    amendmentReason: 'تصحيح مقاس القسطرة الوريدية (Cannula) من 20G إلى 18G وإضافة قراءة السكر العشوائي.',
    version: 2,
    versionHistory: [
      {
        versionNumber: 1,
        savedAt: '2026-09-12 12:28 م',
        savedBy: 'أحمد صلاح، RN',
        title: 'توثيق الملاحظة التمريضية والتسليم الداخلي (SBAR)',
        content: 'النسخة الأصلية قبل تصحيح مقاس الكانيولا وإضافة فحص السكر.',
        state: 'final_signed'
      },
      {
        versionNumber: 2,
        savedAt: '2026-09-12 12:45 م',
        savedBy: 'أحمد صلاح، RN',
        title: 'توثيق الملاحظة التمريضية والتسليم الداخلي (SBAR)',
        content: 'النسخة المعدلة والمصححة.',
        state: 'amended',
        changeReason: 'تصحيح مقاس القسطرة الوريدية (Cannula) من 20G إلى 18G وإضافة قراءة السكر العشوائي.'
      }
    ],
    addenda: [],
    tags: ['Nursing', 'Handoff', 'SBAR']
  },
  {
    id: 'NOTE-2026-084',
    patientId: 'P-101',
    encounterId: 'ENC-2026-ER-091',
    encounterType: 'emergency',
    category: 'physician_note',
    templateId: 'tpl-narrative-general',
    structureType: 'narrative',
    titleAr: 'مسودة جولة متابعة وتحديث الخطة العلاجية',
    titleEn: 'Draft Clinical Follow-Up Note',
    content: `المريض في انتظار وصول فريق النقل الداخلي للرعاية القلبية.
الألم مسيطر عليه بالكامل حالياً. علامات حيوية مستقرة، لا توجد نوبات خوارج انقباضية جديدة على شاشة التخطيط.
بانتظار نتيجة العينة الثانية للتروبونين ومطابقة فصيلة الدم قبل الإجراء.`,
    state: 'draft',
    author: {
      id: 'DOC-882',
      name: 'د. سارة كمال',
      role: 'Resident Physician',
      roleLabelAr: 'طبيب مقيم طب الطوارئ',
      specialty: 'طب الطوارئ',
      department: 'قسم الطوارئ'
    },
    createdAt: '2026-09-12 01:10 م',
    documentedAt: '2026-09-12 01:15 م',
    coSignRequirement: 'required_pending',
    version: 1,
    versionHistory: [],
    addenda: [],
    tags: ['Draft', 'Resident Note', 'Co-sign Required']
  }
];
