import {
  ChiefComplaintEncounter,
  HistoryOfPresentIllness,
  PastMedicalHistoryItem,
  PastSurgicalHistoryItem,
  FamilyHistoryItem,
  SocialHistoryRecord,
  DetailedAllergyRecord,
  FunctionalAssessmentRecord,
  NutritionalAssessmentRecord,
  ReviewOfSystemsItem,
  PhysicalExamSystemItem,
  SpecialtyContextAssessment,
  ProblemListItem,
  EncounterDiagnosisItem,
  ClinicalContextMode,
  ConfigurableAssessmentProfileMeta,
  HpiTemplateOption
} from '../types/clinicalHistoryProblems';

// -------------------------------------------------------------
// CONFIGURABLE ASSESSMENT PROFILES METADATA
// Concrete screening tools (e.g. MUST, Katz, ESI, ASA, Killip/TIMI)
// are registered as profiles rather than global rigid fixtures.
// -------------------------------------------------------------

export const CONFIGURABLE_ASSESSMENT_PROFILES_META: ConfigurableAssessmentProfileMeta[] = [
  {
    profileId: 'prof-triage',
    profileType: 'triage_profile',
    profileNameAr: 'الملف التقييمي لفرز الطوارئ وحدّة الحالات',
    profileNameEn: 'Emergency Triage & Acuity Profile',
    applicableContexts: ['er'],
    isMandatoryInContext: true,
    exampleClinicalToolMock: 'Emergency Severity Index (ESI Level Mock)',
    governanceAttributionNotice:
      'أداة الفرز معروضة كنموذج (Profile Mock) لاختبار واجهة المستخدم. التحقق من الاعتماد والترخيص يتم في مرحلة الحوكمة المؤسسية.'
  },
  {
    profileId: 'prof-nutrition',
    profileType: 'nutrition_screening_profile',
    profileNameAr: 'الملف التقييمي للفحص التغذوي الشامل',
    profileNameEn: 'Nutrition Screening Profile',
    applicableContexts: ['wards', 'icu'],
    isMandatoryInContext: false,
    exampleClinicalToolMock: 'Malnutrition Universal Screening Tool (MUST Mock)',
    governanceAttributionNotice:
      'استمارة MUST معروضة لأغراض النمذجة السريرية والتصميم، وتخضع للتحقق من حقوق النشر والترخيص مع BAPEN في مرحلة الحوكمة.'
  },
  {
    profileId: 'prof-functional',
    profileType: 'functional_assessment_profile',
    profileNameAr: 'الملف التقييمي للقدرة الوظيفية والاعتمادية',
    profileNameEn: 'Functional Independence Profile',
    applicableContexts: ['wards', 'opd'],
    isMandatoryInContext: false,
    exampleClinicalToolMock: 'Katz Index of Independence in ADL (Mock)',
    governanceAttributionNotice:
      'مقياس Katz ADL معروض كأحد ملفات التقييم الوظيفي المعتمدة سريرياً لأغراض واجهة المستخدم.'
  },
  {
    profileId: 'prof-cardiac-risk',
    profileType: 'specialty_risk_profile',
    profileNameAr: 'الملف التقييمي التخصصي لطب القلب والعناية الحرجة',
    profileNameEn: 'Cardiology Critical Care Risk Stratification Profile',
    applicableContexts: ['icu'],
    isMandatoryInContext: true,
    exampleClinicalToolMock: 'Killip Classification & TIMI Risk Score (Mock)',
    governanceAttributionNotice:
      'مقاييس Killip وTIMI معروضة كأدوات تخصصية مهيأة لسياق العناية المركزة القلبية CCU.'
  },
  {
    profileId: 'prof-perioperative',
    profileType: 'perioperative_assessment_profile',
    profileNameAr: 'الملف التقييمي للجراحة والتخدير قبل العمليات',
    profileNameEn: 'Perioperative & Anesthetic Risk Profile',
    applicableContexts: ['or'],
    isMandatoryInContext: true,
    exampleClinicalToolMock: 'ASA Physical Status Classification & Mallampati (Mock)',
    governanceAttributionNotice:
      'تصنيف ASA معروض كملف تقييم تخديري مهيأ لبيئة العمليات الجراحية والتخدير.'
  }
];

// -------------------------------------------------------------
// HPI DOCUMENTATION TEMPLATES CATALOG
// -------------------------------------------------------------

export const HPI_DOCUMENTATION_TEMPLATES: HpiTemplateOption[] = [
  {
    id: 'general_narrative',
    labelAr: 'السرد الزمني العام (General Narrative HPI)',
    labelEn: 'General Narrative',
    description: 'توثيق وصفي حر وزمني لشكوى المريض وتطورها السريري دون إلزام بنموذج جامد.'
  },
  {
    id: 'pain_opqrst',
    labelAr: 'نموذج تقييم الألم المركز (Pain-Focused OPQRST)',
    labelEn: 'OPQRST Pain Template',
    description: 'توثيق منهجي لآلام الصدر والبطن: البداية، المحفزات، الطبيعة، الانتشار، الشدة، والزمن.'
  },
  {
    id: 'socrates',
    labelAr: 'نموذج توصيف الألم التخصصي (SOCRATES Framework)',
    labelEn: 'SOCRATES Framework',
    description: 'الموقع، البداية، الصفة، الانتشار، الأعراض المتزامنة، المسار الزمني، عوامل الراحة/التفاقم، الشدة.'
  },
  {
    id: 'specialty_dyspnea_cardiac',
    labelAr: 'نموذج أمراض القلب وضيق التنفس (Cardiopulmonary Focused)',
    labelEn: 'Cardiopulmonary Template',
    description: 'تقييم فئات NYHA، وضيق التنفس الاضطجاعي، والتورم المحيطي، والخفقان.'
  },
  {
    id: 'free_structured',
    labelAr: 'التوثيق الهيكلي المرن (Structured Clinical Notes)',
    labelEn: 'Flexible Structured Notes',
    description: 'نقاط سريرية تفصيلية محددة حسب تفضيل الطبيب الاستشاري أو سياق التخصص.'
  }
];

// -------------------------------------------------------------
// AXIS 3: ENCOUNTER DOCUMENTATION (Chief Complaint & HPI)
// -------------------------------------------------------------

export const MOCK_CHIEF_COMPLAINT_ENCOUNTER: ChiefComplaintEncounter = {
  complaintAr: 'ألم ضاغط حاد خلف القص مع انتشار للذراع الأيسر وضيق تنفس جهدي',
  complaintEn: 'Acute crushing retrosternal chest pain radiating to left arm and exertional dyspnea',
  onset: 'منذ ساعتين ونصف (قبل التنويم)',
  duration: 'مستمر متصاعد (Ongoing progressive)',
  severityGrade: 'severe',
  triggerContext: 'بدأ أثناء صعود الدرج، لم يستجب للراحة ولا للقرص تحت اللسان',
  associatedSymptoms: ['تعرق بارد غزير (Diaphoresis)', 'غثيان دون قيء', 'شعور بالدوار والخفقان'],
  recordedBy: 'د. طارق المنشاوي',
  recordedByRole: 'Authorized Clinician (Consultant Cardiologist)',
  recordedAt: 'اليوم، 10:30 صباحاً'
};

export const MOCK_HPI: HistoryOfPresentIllness = {
  activeTemplateId: 'pain_opqrst',
  narrativeText:
    'مريض يبلغ من العمر 58 عاماً، معروف بإصابته بداء السكري النوع الثاني وارتفاع ضغط الدم الشرياني منذ 8 سنوات. حضر لقسم الطوارئ يشكو من ألم صدري انضغاطي شديد (Crushing retrosternal pain) بدأ فجأة قبل ساعتين ونصف. يصف المريض الألم بأنه كأن ثقلاً شديداً يضغط على منتصف الصدر (درجة الشدة 8/10)، مع انتشار محدد إلى الكتف والذراع الأيسر والفك السفلي. ترافق الألم مع تعرق بارد غزير وغثيان وخفقان ملحوظ. لم يزُل الألم عند الجلوس والراحة. عند الوصول، تم عمل تخطيط قلب أظهر هبوطاً في قطعة ST بمقدار 2 مم في المساري الصدرية V4-V6 مع ارتفاع تروبونين القلبي عالي الحساسية.',
  onsetTimeline: 'بداية حادة مفاجئة (Sudden onset 2.5 hours prior to admission)',
  anatomicalLocation: 'خلف عظم القص مع انتشار للطرف العلوي الأيسر والفك (Retrosternal radiating to left arm & jaw)',
  painQuality: 'انضغاطي، عاصر، ثقيل (Crushing, squeezing, heavy sensation)',
  radiationPattern: 'ينتشر إلى حافة الذراع الأيسر الإنسية والكتف الأيسر وزاوية الفك السفلي',
  aggravatingFactors: ['المجهود البدني الأدنى', 'الاستلقاء التام'],
  relievingFactors: ['استجابة جزئية لمسكن المورفين الوريدي ونترات الأيزوسوربيد'],
  associatedSymptomsSummary: 'تعرق بارد (Diaphoresis)، غثيان، نهجان عند أدنى حركة (NYHA Class III/IV)',
  opqrst: {
    onset: 'مفاجئ وحاد منذ ساعتين ونصف أثناء صعود الدرج',
    provocation: 'يزداد بالمجهود والاستلقاء، لا يزول بقرص النتروجليسرين',
    quality: 'ضاغط عاصر وثقيل خلف عظمة القص',
    radiation: 'ينتشر إلى الذراع والكتف الأيسر والفك السفلي',
    severity: '8 من 10 على المقياس الرقمي للألم (NRS 8/10)',
    timing: 'مستمر متصاعد دون فترات هجوع'
  },
  socrates: {
    site: 'منتصف الصدر خلف عظمة القص (Retrosternal)',
    onset: 'مفاجئ أثناء المجهود',
    character: 'انضغاطي ثقيل كالصخرة (Heavy crushing)',
    radiation: 'الطرف العلوي الأيسر والفك السفلي',
    associations: 'تعرق بارد، غثيان خفيف، ضيق نفس جهدي',
    timeCourse: 'متواصل ومتفاقم منذ 150 دقيقة',
    exacerbatingRelieving: 'لا يخف بالراحة، خف جزئياً مع مسكن الأفيون الوريدي',
    severity: 'شديد جداً (8/10)'
  },
  specialtyFocus: {
    nyhaClass: 'NYHA Class III/IV أثناء النوبة الحادة',
    orthopneaPnd: 'ضيق تنفس اضطجاعي خفيف (Orthopnea with 2 pillows)',
    edemaStatus: 'لا توجد وذمات بالأطراف السفلية حالياً',
    syncopePalpitation: 'خفقان سريع دون فقدان للوعي'
  }
};

// -------------------------------------------------------------
// AXIS 3: LONGITUDINAL PATIENT HISTORY
// (Persists across all encounters and admissions for the patient)
// -------------------------------------------------------------

export const MOCK_PAST_MEDICAL_HISTORY: PastMedicalHistoryItem[] = [
  {
    id: 'PMH-01',
    conditionNameAr: 'داء السكري من النوع الثاني (T2DM)',
    conditionNameEn: 'Type 2 Diabetes Mellitus without acute complications',
    onsetYear: '2016 (منذ 10 سنوات)',
    status: 'active',
    controlLevel: 'under_treatment',
    treatingPhysicianOrFacility: 'عيادة الغدد الصماء والسكري - مجمع الملك فهد',
    clinicalNotes: 'يتناول Metformin 1000mg BID مع إضافة حديثة لمثبط SGLT2 (Empagliflozin). آخر HbA1c: 7.6%.',
    recordedAt: '2024-01-10',
    recordedBy: 'د. منى الكردي (استشاري سكري)',
    isLongitudinal: true,
    linkedProblemId: 'PRB-LONG-01',
    isLinkedToProblemList: true
  },
  {
    id: 'PMH-02',
    conditionNameAr: 'ارتفاع ضغط الدم الأساسي (Essential Hypertension)',
    conditionNameEn: 'Primary Essential Hypertension',
    onsetYear: '2018 (منذ 8 سنوات)',
    status: 'active',
    controlLevel: 'well_controlled',
    treatingPhysicianOrFacility: 'العيادات الخارجية الباطنية',
    clinicalNotes: 'منضبط عموماً على Amlodipine 5mg + Perindopril 5mg. لا توجد قراءات قصوى مؤخراً.',
    recordedAt: '2024-01-10',
    recordedBy: 'د. طارق المنشاوي',
    isLongitudinal: true,
    linkedProblemId: 'PRB-LONG-02',
    isLinkedToProblemList: true
  },
  {
    id: 'PMH-03',
    conditionNameAr: 'فرط دهنيات الدم المختلط (Mixed Dyslipidemia)',
    conditionNameEn: 'Mixed Hyperlipidemia with elevated LDL-C',
    onsetYear: '2019 (منذ 7 سنوات)',
    status: 'active',
    controlLevel: 'under_treatment',
    treatingPhysicianOrFacility: 'عيادة القلب التخصصية',
    clinicalNotes: 'يتناول Atorvastatin 40mg ليلاً. آخر قيمة كوليسترول ضار LDL: 125 mg/dL قبل الحادثة الحالية.',
    recordedAt: '2024-03-15',
    recordedBy: 'د. وليد الصاوي',
    isLongitudinal: true,
    linkedProblemId: 'PRB-LONG-03',
    isLinkedToProblemList: true
  },
  {
    id: 'PMH-04',
    conditionNameAr: 'ارتجاع مريئي معدي مزمن (GERD)',
    conditionNameEn: 'Gastroesophageal Reflux Disease without esophagitis',
    onsetYear: '2021 (منذ 5 سنوات)',
    status: 'inactive',
    controlLevel: 'well_controlled',
    treatingPhysicianOrFacility: 'عيادة الجهاز الهضمي',
    clinicalNotes: 'أعراض متقطعة مع المأكولات الحارة، يتناول Pantoprazole 40mg عند اللزوم PRN.',
    recordedAt: '2024-05-20',
    recordedBy: 'د. سامح عبد الفتاح',
    isLongitudinal: true,
    linkedProblemId: undefined,
    isLinkedToProblemList: false
  }
];

export const MOCK_PAST_SURGICAL_HISTORY: PastSurgicalHistoryItem[] = [
  {
    id: 'PSH-01',
    procedureNameAr: 'استئصال الزائدة الدودية بالمنظار (Laparoscopic Appendectomy)',
    procedureNameEn: 'Laparoscopic Appendectomy for acute non-perforated appendicitis',
    yearOrDate: '2012',
    hospitalFacility: 'مستشفى السلام الدولي',
    surgeonName: 'د. عصام النجار (استشاري جراحة عامة)',
    complications: 'لا توجد مضاعفات جراحية، الشفاء تام والندبات طبيعية',
    recordedAt: '2024-01-10',
    isLongitudinal: true
  },
  {
    id: 'PSH-02',
    procedureNameAr: 'إصلاح فتق إربي أيمن شبكي (Right Inguinal Hernioplasty - Mesh)',
    procedureNameEn: 'Open Right Inguinal Herniorrhaphy with Polypropylene Mesh repair',
    yearOrDate: '2019',
    hospitalFacility: 'المركز الطبي التخصصي',
    implantOrProsthesis: 'شبكة بولي بروبيلين قياس 8×12 سم',
    complications: 'تعافي سليم دون نكس أو ألم مزمن',
    recordedAt: '2024-01-10',
    isLongitudinal: true
  }
];

export const MOCK_FAMILY_HISTORY: FamilyHistoryItem[] = [
  {
    id: 'FH-01',
    relationship: 'father',
    relationshipAr: 'الأب (Father)',
    conditionNameAr: 'احتشاء عضلة القلب مبكر ووفاة قلبية مفاجئة',
    conditionNameEn: 'Premature Coronary Artery Disease & Acute Myocardial Infarction',
    ageAtOnset: 'أصيب بالجلطة في سن 52 عاماً',
    deceasedStatus: 'deceased',
    clinicalRelevance: 'high_genetic_risk',
    notes: 'توفي الوالد في سن 56 عاماً نتيجة أزمة قلبية حادة مفاجئة (تاريخ عائلي قوي للداء الإكليلي المبكر).',
    isLongitudinal: true
  },
  {
    id: 'FH-02',
    relationship: 'mother',
    relationshipAr: 'الأم (Mother)',
    conditionNameAr: 'داء السكري النوع الثاني وارتفاع الضغط والاعتلال الكلوي',
    conditionNameEn: 'Type 2 Diabetes Mellitus, Hypertension, Diabetic Kidney Disease',
    ageAtOnset: 'تم التشخيص في سن 50 عاماً',
    deceasedStatus: 'alive',
    clinicalRelevance: 'high_genetic_risk',
    notes: 'الأم على قيد الحياة (82 عاماً)، تتلقى الإنسولين، متابعة دورية لوظائف الكلى.',
    isLongitudinal: true
  },
  {
    id: 'FH-03',
    relationship: 'brother',
    relationshipAr: 'الأخ الأكبر (Brother)',
    conditionNameAr: 'قسطرة قلبية وتركيب دعامتين دوائيتين في سن 54',
    conditionNameEn: 'Coronary Artery Disease post-PCI with Drug-Eluting Stents',
    ageAtOnset: 'سن 54 عاماً',
    deceasedStatus: 'alive',
    clinicalRelevance: 'high_genetic_risk',
    notes: 'مستقر على الأدوية الوقائية ومضادات التخثر.',
    isLongitudinal: true
  }
];

export const MOCK_SOCIAL_HISTORY: SocialHistoryRecord = {
  smokingStatus: 'former_smoker',
  smokingDetails: 'تدخين سجائر سابق: 20 سيجارة يومياً لمدة 28 سنة (28 Pack-Years). أقلع تماماً منذ 3 أشهر.',
  alcoholStatus: 'non_drinker',
  substanceUse: 'negative',
  occupation: 'مهندس استشاري مدني ومدير مشروعات',
  occupationalHazards: 'عمل مكتبي وميداني، ضغوط نفسية وذهنية مرتفعة بحكم المسؤوليات الإدارية',
  livingArrangement: 'يقيم في شقة سكنية مع الزوجة واثنين من الأبناء البالغين',
  caregiverSupport: 'family_supported',
  physicalActivityLevel: 'sedentary',
  isLongitudinal: true
};

export const MOCK_DETAILED_ALLERGIES: DetailedAllergyRecord[] = [
  {
    id: 'ALL-01',
    substanceNameAr: 'بنسلين ومشتقاته (Penicillin & Beta-lactams)',
    substanceNameEn: 'Penicillin G / Amoxicillin',
    category: 'medication',
    reactionManifestationAr: 'شرى جلدي حاد مع وذمة وعائية خفيفة بالشفاه وضيق تنفس طفيف',
    reactionManifestationEn: 'Acute urticaria with angioedema and mild bronchospasm',
    criticality: 'high',
    severity: 'severe_anaphylaxis',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    identifiedDate: '2017-06-12',
    recordedBy: 'د. خالد العمري (استشاري باطنة)',
    isLongitudinal: true
  },
  {
    id: 'ALL-02',
    substanceNameAr: 'صبغات الأشعة الميودنة (Iodinated Radiocontrast Media)',
    substanceNameEn: 'Iodinated Contrast Media (High Osmolar)',
    category: 'radiocontrast_agent',
    reactionManifestationAr: 'طفح جلدي حمامي حاك وغثيان فوري بعد حقن الصبغة الوريدية في أشعة سابقة',
    reactionManifestationEn: 'Diffuse erythematous pruritic rash with acute nausea',
    criticality: 'moderate',
    severity: 'moderate',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    identifiedDate: '2022-09-18',
    recordedBy: 'د. ريهام العسال (استشاري أشعة)',
    isLongitudinal: true
  }
];

// -------------------------------------------------------------
// AXIS 3: FUNCTIONAL & NUTRITIONAL ASSESSMENTS
// Modeled as Configurable Profiles with Mock Implementations
// -------------------------------------------------------------

export const MOCK_FUNCTIONAL_ASSESSMENT: FunctionalAssessmentRecord = {
  assessmentDate: 'اليوم، 11:00 صباحاً',
  assessedBy: 'أ. مروة الشاذلي',
  assessedByRole: 'Authorized Clinician (Clinical Nurse Specialist)',
  profileName: 'Functional Assessment Profile (Mock Example: Katz ADL Index)',
  katzAdlIndex: {
    bathing: 1,      // يستحم مستقلاً قبل التنويم
    dressing: 1,     // يرتدي ملابسه
    toileting: 1,    // استخدام الحمام
    transferring: 1, // الانتقال من والى السرير
    continence: 1,   // تحكم كامل بالإخراج
    feeding: 1       // تناول الطعام مستقلاً
  },
  totalKatzScore: 6, // 6/6 Fully independent at baseline
  mobilityLevel: 'minimal_assistance', // حالياً مقيد بالراحة بالسرير بسبب ألم الصدر والقسطرة
  assistiveDevices: ['لا يستخدم أدوات مساعدة قبل الدخول (No baseline mobility aid)'],
  fallRiskScoreMorse: 35,
  fallRiskCategory: 'moderate' // Moderate due to acute chest pain, IV infusion, bed rest order
};

export const MOCK_NUTRITIONAL_ASSESSMENT: NutritionalAssessmentRecord = {
  assessmentDate: 'اليوم، 11:15 صباحاً',
  assessedBy: 'أ. دينا الشربيني (أخصائي تغذية علاجية)',
  profileName: 'Nutrition Screening Profile (Mock Example: MUST Tool)',
  screeningToolName: 'MUST (Malnutrition Universal Screening Tool - Mock Profile)',
  bmiScore: 28.1, // Overweight, Score 0
  unplannedWeightLossPercent: 'ثابت (لا يوجد فقدان غير مقصود للوزن خلال 6 أشهر)، النسبة 0%',
  acuteDiseaseEffect: false, // لا يوجد تأثير حاد يمنع التغذية لأكثر من 5 أيام
  overallRiskCategory: 'low_risk', // MUST Score = 0 (Low Risk)
  recommendedDiet: 'حمية قلبية وسكرية منخفضة الصوديوم والدهون المشبعة (Cardiac Diabetic Diet)',
  dietaryRestrictions: [
    'تقييد الصوديوم (< 2000 mg/day)',
    'تقليل الدهون المشبعة والكوليسترول',
    'ضبط النشويات المعقدة لمرضى السكري'
  ],
  enteralParenteralSupport: 'تغذية فموية عادية مع تجنب الأطعمة الدسمة (Oral Intake Adequate)'
};

// -------------------------------------------------------------
// AXIS 3: CONTEXT-AWARE REVIEW OF SYSTEMS (ROS)
// Structured by encounter setting: OPD / ER / ICU / Wards / OR
// -------------------------------------------------------------

export const MOCK_ROS_DATA: Record<ClinicalContextMode, ReviewOfSystemsItem[]> = {
  er: [
    {
      systemKey: 'cv',
      systemNameAr: 'الجهاز القلبي الوعائي (Cardiovascular)',
      systemNameEn: 'Cardiovascular System',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'ألم ضاغط خلف القص مع انتشار للذراع الأيسر، خفقان، لا يوجد إغماء كامل.'
    },
    {
      systemKey: 'resp',
      systemNameAr: 'الجهاز التنفسي (Respiratory)',
      systemNameEn: 'Respiratory System',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'ضيق تنفس جهدي خفيف مترافق مع ألم الصدر، ينفي وجود سعال أو نفث دم.'
    },
    {
      systemKey: 'general',
      systemNameAr: 'الأعراض العامة والدستورية (General / Constitutional)',
      systemNameEn: 'General / Constitutional',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'تعرق بارد غزير، إرهاق حاد، لا توجد حرارة أو قشعريرة.'
    },
    {
      systemKey: 'gi',
      systemNameAr: 'الجهاز الهضمي (Gastrointestinal)',
      systemNameEn: 'Gastrointestinal System',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'غثيان بدون قيء، ينفي وجود ألم بطني شرسوفي حارق أو تجشؤ.'
    },
    {
      systemKey: 'neuro',
      systemNameAr: 'الجهاز العصبي (Neurological)',
      systemNameEn: 'Neurological System',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'وعي كامل، لا يوجد خدر أو ثقل حركي بالأطراف أو اضطراب بالرؤية أو النطق.'
    }
  ],
  icu: [
    {
      systemKey: 'neuro',
      systemNameAr: 'الجهاز العصبي والوعي (Neuro / Cognition)',
      systemNameEn: 'Neurological & Sedation',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'يقظ تماماً، منتبه، GCS 15/15، حدقتان متساويتان ومتفاعلتان.'
    },
    {
      systemKey: 'cv',
      systemNameAr: 'الجهاز القلبي الوعائي ومجرى الدم (Cardiovascular & Perfusion)',
      systemNameEn: 'Cardiovascular & Hemodynamics',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'ألم الصدر خف إلى 2/10 بعد العلاج، نبض منتظم، إعادة امتلاء شعيري < 2 ثانية.'
    },
    {
      systemKey: 'resp',
      systemNameAr: 'الجهاز التنفسي والتهوية (Respiratory / Gas Exchange)',
      systemNameEn: 'Respiratory & Ventilation',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'أصوات التنفس حويصلية متساوية، لا توجد خراخر رطبة بقاعدتي الرئتين.'
    },
    {
      systemKey: 'renal',
      systemNameAr: 'الجهاز البولي وتوازن السوائل (Renal & Fluid Balance)',
      systemNameEn: 'Renal & Fluid Output',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'إدرار بول سليم > 0.8 mL/kg/h، لا وذمات انطباعية بالأطراف السفلية.'
    },
    {
      systemKey: 'gi',
      systemNameAr: 'الجهاز الهضمي والامتصاص (GI & Abdomen)',
      systemNameEn: 'Gastrointestinal & Nutrition',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'بطن رخو، أصوات معوية إيجابية، لا غثيان حالياً.'
    },
    {
      systemKey: 'skin',
      systemNameAr: 'الجلد ومواقع القساطر (Skin & Line Sites)',
      systemNameEn: 'Integumentary & Vascular Access',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'موقع القسطرة الشريانية الكعبرية اليمنى سليم وجاف دون ورم دموي أو نزف.'
    }
  ],
  opd: [
    {
      systemKey: 'cv',
      systemNameAr: 'الجهاز القلبي الوعائي (Cardiovascular)',
      systemNameEn: 'Cardiovascular System',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'تاريخ ذبحة صدرية متكررة عند صعود الدرج، انتظام النبض.'
    },
    {
      systemKey: 'endocrine',
      systemNameAr: 'الغدد والسكري (Endocrine / Metabolism)',
      systemNameEn: 'Endocrine & Glycemia',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'مستويات سكر الصباح بين 130-160 mg/dL، لا توجد نوبات هبوط سكر حادة.'
    },
    {
      systemKey: 'general',
      systemNameAr: 'الأعراض العامة (Constitutional)',
      systemNameEn: 'Constitutional',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'وزن مستقر، طاقة جيدة عموماً، لا توجد حمى.'
    },
    {
      systemKey: 'msk',
      systemNameAr: 'الجهاز العضلي الهيكلي (Musculoskeletal)',
      systemNameEn: 'Musculoskeletal',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'لا آلام مفاصل حادة، حركة طبيعية.'
    }
  ],
  wards: [
    {
      systemKey: 'general',
      systemNameAr: 'العام والدستوري (Constitutional)',
      systemNameEn: 'Constitutional',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'المريض مرتاح، لا شكاوى عامة.'
    },
    {
      systemKey: 'cv',
      systemNameAr: 'القلبي الوعائي (Cardiovascular)',
      systemNameEn: 'Cardiovascular',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'لا ألم بالصدر اليوم، لا خفقان.'
    },
    {
      systemKey: 'resp',
      systemNameAr: 'التنفسي (Respiratory)',
      systemNameEn: 'Respiratory',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'تنفس هادئ مريح على هواء الغرفة.'
    },
    {
      systemKey: 'gi',
      systemNameAr: 'الهضمي (GI)',
      systemNameEn: 'Gastrointestinal',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'تناول وجبة الإفطار كاملة، خروج طبيعي.'
    },
    {
      systemKey: 'gu',
      systemNameAr: 'البولي التناسلي (Genitourinary)',
      systemNameEn: 'Genitourinary',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'تبول طبيعي دون عسرة أو حرقان.'
    }
  ],
  or: [
    {
      systemKey: 'airway',
      systemNameAr: 'مجرى الهواء والتنفس (Airway & Pulmonary)',
      systemNameEn: 'Airway & Pulmonary Assessment',
      reviewed: true,
      status: 'normal_negative',
      pertinentFindings: 'تصنيف Mallampati فئة II، فتحة فم واسعة، حركة عنق مرنة وكاملة.'
    },
    {
      systemKey: 'cv',
      systemNameAr: 'القلبي الوعائي قبل التخدير (Pre-op Cardiovascular)',
      systemNameEn: 'Cardiovascular Risk',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'تاريخ متلازمة شريان تاجي حادة، يحتاج حذر hemodynamic وعناية مشددة.'
    },
    {
      systemKey: 'coag',
      systemNameAr: 'التخثر ومميعات الدم (Coagulation / Hemostasis)',
      systemNameEn: 'Hemostasis & Antiplatelets',
      reviewed: true,
      status: 'positive_pertinent',
      pertinentFindings: 'المريض يتناول Ticagrelor وAspirin معاً، تم التنسيق مع فريق التخدير.'
    }
  ]
};

// -------------------------------------------------------------
// AXIS 3: CONTEXT-AWARE PHYSICAL EXAMINATION
// Focused vs. Systematic Comprehensive
// -------------------------------------------------------------

export const MOCK_PHYSICAL_EXAM_DATA: Record<'focused' | 'comprehensive', PhysicalExamSystemItem[]> = {
  focused: [
    {
      systemKey: 'general',
      systemNameAr: 'المظهر العام (General Appearance)',
      systemNameEn: 'General Appearance',
      examined: true,
      status: 'abnormal',
      findings: 'مريض متوسط البنية، يبدو عليه الانزعاج والألم (Mildly distressed)، متيقظ، شاحب قليلاً مع تعرق جبهي.'
    },
    {
      systemKey: 'cv',
      systemNameAr: 'فحص القلب والأوعية (Cardiovascular Examination)',
      systemNameEn: 'Cardiovascular Exam',
      examined: true,
      status: 'normal',
      findings: 'صوتا القلب S1 وS2 مسموعان بوضوح ومنتظمان دون لغط (No murmurs, gallops, or friction rubs). النبض المحيطي الكعبري متناظر.'
    },
    {
      systemKey: 'chest',
      systemNameAr: 'فحص الصدر والرئتين (Chest & Lungs)',
      systemNameEn: 'Chest & Respiratory Exam',
      examined: true,
      status: 'normal',
      findings: 'حركات القفص الصدري متناظرة، لا يوجد إيلام بجدار الصدر بالجس (No chest wall tenderness). حقول الرئة نقية ثنائياً دون خراخر.'
    },
    {
      systemKey: 'neck',
      systemNameAr: 'العنق والأوردة الوداجية (Neck & JVP)',
      systemNameEn: 'Neck & Jugular Venous Pulse',
      examined: true,
      status: 'normal',
      findings: 'ضغط الوريد الوداجي غير مرتفع (JVP not elevated < 3 cm above sternal angle)، لا يوجد لغط سباتي.'
    },
    {
      systemKey: 'extremities',
      systemNameAr: 'الأطراف والدوران المحيطي (Extremities & Perfusion)',
      systemNameEn: 'Extremities & Perfusion',
      examined: true,
      status: 'normal',
      findings: 'الأطراف دافئة، لا وذمات انطباعية بالكاحلين أو الساقين (No pedal edema)، النبض الشرياني الظنبوبي والقدمي سليم.'
    }
  ],
  comprehensive: [
    {
      systemKey: 'general',
      systemNameAr: 'المظهر العام والدستوري (General Appearance)',
      systemNameEn: 'General Constitutional Appearance',
      examined: true,
      status: 'abnormal',
      findings: 'مريض واعي ومتوجه للزمان والمكان والأشخاص، متجاوب، في وضعية نصف استلقاء مريحة، علامات تعرق خفيفة بالبداية تراجعت.'
    },
    {
      systemKey: 'heent',
      systemNameAr: 'الرأس والعينان والأذنان والأنف والحنجرة (HEENT)',
      systemNameEn: 'Head, Eyes, Ears, Nose, Throat',
      examined: true,
      status: 'normal',
      findings: 'الرأس سليم، الحدقتان متساويتان ومتفاعلتان للضوء، الأغشية المخاطية للفم رطبة وردية دون زراق، قاع العين سليم دون نزوف سكرية حادة.'
    },
    {
      systemKey: 'neck',
      systemNameAr: 'العنق والغدة الدرقية والأوردة (Neck & Thyroid)',
      systemNameEn: 'Neck & Thyroid',
      examined: true,
      status: 'normal',
      findings: 'الغدة الدرقية غير متضخمة، لا كتل أو ضخامات عقد لمفاوية، JVP طبيعي، النبض السباتي سليم ثنائياً.'
    },
    {
      systemKey: 'chest',
      systemNameAr: 'الجهاز التنفسي وجدار الصدر (Respiratory & Lungs)',
      systemNameEn: 'Respiratory & Thorax',
      examined: true,
      status: 'normal',
      findings: 'التنفس حويصلي نقي في كافة الساحات الرئوية، لا توجد وزيز أو خراخر كريبية، رنين صدري متناظر بالتناوب.'
    },
    {
      systemKey: 'cv',
      systemNameAr: 'الجهاز القلبي الوعائي (Cardiovascular)',
      systemNameEn: 'Cardiovascular System',
      examined: true,
      status: 'normal',
      findings: 'صدمة القمة بمكانها التشريحي الطبيعي (الورب الخامس الأيسر على خط منتصف الترقوة)، أصوات S1/S2 واضحة، لا صوت ثالث S3 ولا صوت رابع S4.'
    },
    {
      systemKey: 'abdomen',
      systemNameAr: 'البطن والأحشاء (Abdomen & Viscera)',
      systemNameEn: 'Abdomen & Gastrointestinal',
      examined: true,
      status: 'normal',
      findings: 'البطن رخو وغير مؤلم بالجس السطحي والعميق، لا يوجد تضخم بالكبد أو الطحال، أصوات الأمعاء مسموعة وطبيعية، ندبة استئصال الزائدة قديمة وسليمة.'
    },
    {
      systemKey: 'extremities',
      systemNameAr: 'الأطراف والدوران المحيطي (Extremities & Peripheral Pulses)',
      systemNameEn: 'Extremities & Peripheral Circulation',
      examined: true,
      status: 'normal',
      findings: 'النبض النبضي متناظر في كافة الشرايين الرئيسية (Radials, Femorals, Posterior Tibials, Dorsalis Pedis)، لا توجد وذمات، لا علامات ركودة وريدية.'
    },
    {
      systemKey: 'neuro',
      systemNameAr: 'الجهاز العصبي والمنعكسات (Neurological & Reflexes)',
      systemNameEn: 'Neurological System',
      examined: true,
      status: 'normal',
      findings: 'الأعصاب القحفية II-XII سليمة، القوة العضلية 5/5 في الأطراف الأربعة، الإحساس السطحي والعميق سليم مع نقص طفيف جداً بالاهتزاز بأطراف أصابع القدمين (متوافق مع السكري).'
    },
    {
      systemKey: 'skin',
      systemNameAr: 'الجلد والأنسجة تحت الجلد (Integumentary & Skin)',
      systemNameEn: 'Skin & Turgor',
      examined: true,
      status: 'normal',
      findings: 'مرونة الجلد طبيعية، لا توجد آفات جلدية مشبوهة أو تقرحات ضغط، مواقع الوصول الوعائي نظيفة وجافة.'
    }
  ]
};

// -------------------------------------------------------------
// AXIS 3: SPECIALTY / CONTEXT-SPECIFIC ASSESSMENTS
// Modeled as Configurable Profiles with Mock Implementations
// -------------------------------------------------------------

export const MOCK_SPECIALTY_ASSESSMENTS: SpecialtyContextAssessment[] = [
  {
    context: 'icu',
    profileType: 'specialty_risk_profile',
    profileNameAr: 'الملف التقييمي لخطورة طب القلب الحاد والعناية المركزة',
    profileNameEn: 'Cardiology Critical Care Risk Stratification Profile',
    isMandatoryInContext: true,
    exampleMockBasis: 'Killip Classification & TIMI Risk Score (Mock Profile Representation)',
    scores: [
      {
        labelAr: 'تصنيف كيليب لقصور القلب الحاد (Killip Class Mock)',
        labelEn: 'Killip Classification for Acute MI',
        value: 'Class I',
        interpretation: 'لا توجد علامات سريرية لفشل القلب أو احتقان رئوي (معدل خطورة أدنى < 6%)',
        provenance: 'د. طارق المنشاوي - استشاري أمراض القلب'
      },
      {
        labelAr: 'المقياس الوظيفي لجمعية القلب بنيويورك (NYHA Class Mock)',
        labelEn: 'NYHA Functional Class',
        value: 'Class II',
        interpretation: 'تحدد طفيف في النشاط البدني المعتاد، راحة تامة أثناء الاسترخاء',
        provenance: 'سجل وحدة الرعاية القلبية CCU'
      },
      {
        labelAr: 'درجة خطورة جلطات الشرايين التاجية (TIMI Risk Score Mock)',
        labelEn: 'TIMI Risk Score for NSTEMI',
        value: '4 / 7 (Intermediate-High Risk)',
        interpretation: 'عمر ≥ 65؟ (لا)، ≥3 عوامل خطورة CAD (نعم)، تضيق تاجي مثبت (نعم)، استخدام أسبرين (نعم)، ألم صدر حاد (نعم)، دلالات تروبونين (نعم)',
        provenance: 'بروتوكول الفرز القلبي المهيأ لوحدة العناية التاجية'
      }
    ]
  },
  {
    context: 'er',
    profileType: 'triage_profile',
    profileNameAr: 'الملف التقييمي لفرز الطوارئ المعتمد ومؤشر حدة الحالات',
    profileNameEn: 'Emergency Triage & Acuity Profile',
    isMandatoryInContext: true,
    exampleMockBasis: 'Emergency Severity Index ESI & NRS Pain Scale (Mock Profile Representation)',
    scores: [
      {
        labelAr: 'مؤشر فرز الطوارئ (ESI Level Mock)',
        labelEn: 'Emergency Severity Index',
        value: 'Level 2 (High Risk / Emergent)',
        interpretation: 'ألم صدري تاجي محتمل عالي الخطورة يستوجب دخولاً وتدخلاً فورياً دون تأخير',
        provenance: 'ممرض فرز الطوارئ المعتمد - مسار الفرز السريع'
      },
      {
        labelAr: 'مقياس الألم المعتمد (NRS Pain Score Mock)',
        labelEn: 'Numeric Rating Scale (0-10)',
        value: '8 / 10',
        interpretation: 'ألم شديد جداً استوجب تداخلاً مسكناً ومتابعة استجابة',
        provenance: 'التقييم التمريضي الأولي بالطوارئ'
      }
    ]
  },
  {
    context: 'or',
    profileType: 'perioperative_assessment_profile',
    profileNameAr: 'الملف التقييمي للياقة التخديرية والجراحية قبل العمليات',
    profileNameEn: 'Perioperative & Anesthetic Assessment Profile',
    isMandatoryInContext: true,
    exampleMockBasis: 'ASA Physical Status Classification & Mallampati Score (Mock Profile Representation)',
    scores: [
      {
        labelAr: 'تصنيف الجمعية الأمريكية لأطباء التخدير (ASA Score Mock)',
        labelEn: 'ASA Physical Status Classification',
        value: 'ASA Class III',
        interpretation: 'مريض يعاني من مرض جهازي شديد غير مهدد للحياة فوراً (مرض تاجي مستقر، سكري، ضغط)',
        provenance: 'د. أشرف فوزي - استشاري التخدير'
      },
      {
        labelAr: 'درجة تقييم مجرى الهواء (Mallampati Score Mock)',
        labelEn: 'Mallampati Airway Classification',
        value: 'Class II',
        interpretation: 'رؤية اللهاة والبلعوم واضحة، تنبيب متوقع بسهولة قياسية',
        provenance: 'عيادة التقييم قبل التخدير'
      }
    ]
  }
];

// -------------------------------------------------------------
// AXIS 4: LONGITUDINAL PROBLEM LIST
// (Active, Inactive, Resolved with Clinical Terminology & Classification Profile)
// -------------------------------------------------------------

export const MOCK_LONGITUDINAL_PROBLEM_LIST: ProblemListItem[] = [
  {
    id: 'PRB-LONG-01',
    clinicalTermAr: 'داء السكري من النوع الثاني غير المعتمد على الإنسولين',
    clinicalTermEn: 'Type 2 Diabetes Mellitus without acute complications',
    status: 'active',
    clinicalStatus: 'under_treatment' as any,
    verificationStatus: 'confirmed',
    onsetDate: '2016-04-10',
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10-AM / WHO ICD-10)',
      code: 'E11.9',
      display: 'Type 2 diabetes mellitus without complications'
    },
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT Concept Mock)',
      conceptId: '44054006',
      preferredTerm: 'Type 2 diabetes mellitus (disorder)'
    },
    provenance: {
      recordedBy: 'د. منى الكردي',
      recordedByRole: 'Authorized Clinician (Endocrinology Consultant)',
      timestamp: '2016-04-10 11:30',
      facilityOrClinic: 'عيادة الغدد الصماء التخصصية'
    },
    notes: 'متابع بانتظام، آخر قياس للسكر التراكمي HbA1c هو 7.6%. يوصى بضبط الوجبات وإضافة مثبط SGLT2.',
    auditTrail: [
      {
        timestamp: '2016-04-10 11:30',
        actionAr: 'إنشاء المشكلة لأول مرة وتأكيد التشخيص',
        performedBy: 'د. منى الكردي (استشاري سكري)',
        notes: 'تشخيص مثبت بناء على قياس سكر الصائم > 140 mg/dL مرتين'
      },
      {
        timestamp: '2024-01-10 09:15',
        actionAr: 'مراجعة سريرية سنوية وتحديث الخطة الدوائية',
        performedBy: 'د. سامح عبد الفتاح',
        notes: 'إضافة Empagliflozin لحماية القلب والكلى'
      }
    ]
  },
  {
    id: 'PRB-LONG-02',
    clinicalTermAr: 'ارتفاع ضغط الدم الشرياني الأساسي',
    clinicalTermEn: 'Essential (primary) Hypertension',
    status: 'active',
    clinicalStatus: 'well_controlled',
    verificationStatus: 'confirmed',
    onsetDate: '2018-09-22',
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10-AM / WHO ICD-10)',
      code: 'I10',
      display: 'Essential (primary) hypertension'
    },
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT Concept Mock)',
      conceptId: '38341003',
      preferredTerm: 'Hypertensive disorder, systemic arterial (disorder)'
    },
    provenance: {
      recordedBy: 'د. طارق المنشاوي',
      recordedByRole: 'Authorized Clinician (Cardiology Consultant)',
      timestamp: '2018-09-22 14:00',
      facilityOrClinic: 'عيادة القلب التخصصية'
    },
    notes: 'منضبط تحت العلاج الدوائي المزدوج (Amlodipine + Perindopril).',
    auditTrail: [
      {
        timestamp: '2018-09-22 14:00',
        actionAr: 'توثيق التشخيص الأولي ودمجه بالقائمة المزمنة',
        performedBy: 'د. طارق المنشاوي'
      }
    ]
  },
  {
    id: 'PRB-LONG-03',
    clinicalTermAr: 'فرط كوليسترول ودهنيات الدم المختلط',
    clinicalTermEn: 'Mixed Hyperlipidemia with elevated LDL-C',
    status: 'active',
    clinicalStatus: 'poorly_controlled',
    verificationStatus: 'confirmed',
    onsetDate: '2019-11-05',
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10-AM / WHO ICD-10)',
      code: 'E78.2',
      display: 'Mixed hyperlipidemia'
    },
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT Concept Mock)',
      conceptId: '267432004',
      preferredTerm: 'Mixed hyperlipidemia (disorder)'
    },
    provenance: {
      recordedBy: 'د. وليد الصاوي',
      recordedByRole: 'Authorized Clinician (Clinical Fellow)',
      timestamp: '2019-11-05 10:20',
      facilityOrClinic: 'عيادة أمراض القلب الوقائية'
    },
    notes: 'يحتاج رفع جرعة Atorvastatin إلى 80mg يومياً بعد الخروج من النوبة التاجية الحالية.',
    auditTrail: [
      {
        timestamp: '2019-11-05 10:20',
        actionAr: 'تسجيل التشخيص المخبري للدهنيات',
        performedBy: 'د. وليد الصاوي'
      }
    ]
  },
  {
    id: 'PRB-LONG-04',
    clinicalTermAr: 'التهاب الزائدة الدودية الحاد مع استئصال تام',
    clinicalTermEn: 'Acute Appendicitis status post laparoscopic appendectomy',
    status: 'resolved',
    clinicalStatus: 'in_remission',
    verificationStatus: 'confirmed',
    onsetDate: '2012-05-14',
    resolvedDate: '2012-05-20',
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10-AM / WHO ICD-10)',
      code: 'K35.8',
      display: 'Acute appendicitis, other and unspecified'
    },
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT Concept Mock)',
      conceptId: '85189001',
      preferredTerm: 'Acute appendicitis (disorder)'
    },
    provenance: {
      recordedBy: 'د. عصام النجار',
      recordedByRole: 'Authorized Clinician (General Surgery Consultant)',
      timestamp: '2012-05-20 12:00',
      facilityOrClinic: 'مستشفى السلام الدولي'
    },
    notes: 'تمت الجراحة بالمنظار بنجاح، تماثل للشفاء التام وأُغلقت المشكلة مع وسمها كـ Resolved.',
    auditTrail: [
      {
        timestamp: '2012-05-14 20:00',
        actionAr: 'تسجيل كحالة حادة في الطوارئ',
        performedBy: 'د. عصام النجار'
      },
      {
        timestamp: '2012-05-20 12:00',
        actionAr: 'تحديث الحالة إلى تم الشفاء (Resolved)',
        performedBy: 'د. عصام النجار',
        notes: 'فحص ما بعد الجراحة طبيعي والندبات ملتئمة'
      }
    ]
  }
];

// -------------------------------------------------------------
// AXIS 4: ENCOUNTER DIAGNOSES
// (Established for and addressed during the current encounter)
// Supports configurable Diagnosis Roles, Diagnosis Uses, and Ranks
// -------------------------------------------------------------

export const MOCK_ENCOUNTER_DIAGNOSES: EncounterDiagnosisItem[] = [
  {
    id: 'ENC-DX-01',
    clinicalTermAr: 'متلازمة الشريان التاجي الحادة - احتشاء عضلة القلب غير المترافق بارتفاع ST (NSTEMI)',
    clinicalTermEn: 'Non-ST-segment elevation myocardial infarction (NSTEMI) - Acute Coronary Syndrome',
    diagnosisRole: 'principal',
    diagnosisUse: 'admission',
    diagnosisRank: 1,
    ranking: 'principal_primary',
    diagnosticStage: 'confirmed_final',
    encounterRelationship: 'reason_for_admission',
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10-AM / WHO ICD-10)',
      code: 'I21.4',
      display: 'Non-ST elevation (NSTE) myocardial infarction'
    },
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT Concept Mock)',
      conceptId: '401303003',
      preferredTerm: 'Acute non-ST segment elevation myocardial infarction (disorder)'
    },
    provenance: {
      diagnosedBy: 'د. طارق المنشاوي',
      diagnosedByRole: 'Authorized Clinician (Consultant Cardiologist)',
      department: 'وحدة الرعاية التاجية المركزة (CCU)',
      timestamp: 'اليوم، 10:45 صباحاً'
    },
    linkedProblemId: undefined, // Could be linked or converted
    notes: 'التشخيص الرئيسي المقبول للتنويم الحالي. مؤكد بواسطة ارتفاع Troponin I النوعي (3.85 ng/mL) وتغيرات ECG الديناميكية.'
  },
  {
    id: 'ENC-DX-02',
    clinicalTermAr: 'داء السكري من النوع الثاني مع مراقبة سكر الدم الحادة أثناء التنويم',
    clinicalTermEn: 'Type 2 Diabetes Mellitus managed with inpatient subcutaneous insulin sliding scale',
    diagnosisRole: 'secondary',
    diagnosisUse: 'clinical',
    diagnosisRank: 2,
    ranking: 'secondary_additional',
    diagnosticStage: 'confirmed_final',
    encounterRelationship: 'co_existing_managed_condition',
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10-AM / WHO ICD-10)',
      code: 'E11.9',
      display: 'Type 2 diabetes mellitus without complication'
    },
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT Concept Mock)',
      conceptId: '44054006',
      preferredTerm: 'Type 2 diabetes mellitus (disorder)'
    },
    provenance: {
      diagnosedBy: 'د. وليد الصاوي',
      diagnosedByRole: 'Authorized Clinician (Clinical Fellow)',
      department: 'الرعاية القلبية المركزة',
      timestamp: 'اليوم، 11:10 صباحاً'
    },
    linkedProblemId: 'PRB-LONG-01',
    notes: 'تم ربطه بالمشكلة المزمنة للمريض (PRB-LONG-01). تم إيقاف Metformin مؤقتاً قبل القسطرة والتحويل لجدول الإنسولين السريع التصحيحي.'
  },
  {
    id: 'ENC-DX-03',
    clinicalTermAr: 'ارتفاع ضغط الدم الشرياني المرافق تحت المراقبة الهيموديناميكية',
    clinicalTermEn: 'Essential Hypertension under continuous hemodynamic monitoring',
    diagnosisRole: 'secondary',
    diagnosisUse: 'clinical',
    diagnosisRank: 3,
    ranking: 'secondary_additional',
    diagnosticStage: 'confirmed_final',
    encounterRelationship: 'co_existing_managed_condition',
    classificationProfile: {
      profileName: 'Configured Classification Profile (ICD-10-AM / WHO ICD-10)',
      code: 'I10',
      display: 'Essential (primary) hypertension'
    },
    clinicalTerminology: {
      system: 'Configured Clinical Terminology (SNOMED CT Concept Mock)',
      conceptId: '38341003',
      preferredTerm: 'Hypertensive disorder, systemic arterial (disorder)'
    },
    provenance: {
      diagnosedBy: 'د. وليد الصاوي',
      diagnosedByRole: 'Authorized Clinician (Clinical Fellow)',
      department: 'الرعاية القلبية المركزة',
      timestamp: 'اليوم، 11:15 صباحاً'
    },
    linkedProblemId: 'PRB-LONG-02',
    notes: 'الضغط مستقر على 125/78 mmHg، تتم مراقبته عبر القسطرة الشريانية ومونيتور المريض.'
  }
];
