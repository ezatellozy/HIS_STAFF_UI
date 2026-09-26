/**
 * HIS — QUALITY, PATIENT SAFETY, ENTERPRISE RISK & INFECTION CONTROL
 * Synthetic Mock Datasets & Clinical Fixtures
 * Policy Aligned: SPSC Sentinel Policy (Effective 1 Jan 2025), Configurable 3x3/4x4/5x5 Risk Profiles,
 * Versioned HAI Surveillance Profiles (NHSN 2025, WHO 2024, GDIPC 2024), and Just Culture Standards.
 */

import {
  QpsPersona,
  SafetyIncidentCase,
  RiskRegisterItem,
  RiskMatrixProfile,
  CapaItem,
  QualityIndicatorKpi,
  FocusPdcaProject,
  HaiSurveillanceCase,
  SurveillanceDefinitionProfile,
  OutbreakClusterRecord,
  DeviceSurveillanceDenominator,
  HandHygieneAuditSession,
  CareBundleAuditItem,
  ClinicalSafetyTracer,
  QualitySafetyOpsState,
  QpsActivityLog,
  SentinelCriteriaProfile
} from '../types/qualitySafetyOps';

// -----------------------------------------------------------------------------
// 1. PERSONAS
// -----------------------------------------------------------------------------
export const QPS_PERSONAS: QpsPersona[] = [
  {
    id: 'persona-quality-director',
    name: 'د. حنان الغامدي',
    roleTitle: 'مدير إدارة الجودة وسلامة المرضى',
    roleTitleAr: 'مدير الجودة وسلامة المرضى (CPHQ)',
    roleKey: 'quality_director',
    department: 'إدارة الجودة الشاملة والاعتماد',
    licenseOrBadge: 'CPHQ-SA-8821',
    avatarColor: 'bg-teal-600',
    permissions: ['all_approve', 'rca_charter', 'close_incident', 'sentinel_confirm', 'risk_accept']
  },
  {
    id: 'persona-safety-officer',
    name: 'أ. سارة العتيبي',
    roleTitle: 'أخصائي سلامة المرضى ونظام OVR',
    roleTitleAr: 'مسؤول سلامة المرضى والأحداث العارضة (CPPS)',
    roleKey: 'safety_officer',
    department: 'إدارة سلامة المرضى',
    licenseOrBadge: 'CPPS-SA-4319',
    avatarColor: 'bg-blue-600',
    permissions: ['triage_ovr', 'conduct_rca', 'create_capa', 'sentinel_candidate_review']
  },
  {
    id: 'persona-risk-manager',
    name: 'م. طارق الشهري',
    roleTitle: 'مدير إدارة المخاطر المؤسسية والسريرية',
    roleTitleAr: 'مدير المخاطر المؤسسية والسريرية (CRMP)',
    roleKey: 'risk_manager',
    department: 'إدارة المخاطر والامتثال',
    licenseOrBadge: 'CRMP-SA-1209',
    avatarColor: 'bg-amber-600',
    permissions: ['assess_risk', 'update_matrix', 'propose_mitigation', 'kri_monitoring']
  },
  {
    id: 'persona-ipc-practitioner',
    name: 'د. زياد الحربي',
    roleTitle: 'استشاري مكافحة العدوى والوبائيات المستشفوية',
    roleTitleAr: 'استشاري مكافحة العدوى والترصد (CIC)',
    roleKey: 'ipc_practitioner',
    department: 'إدارة مكافحة العدوى والوبائيات',
    licenseOrBadge: 'CIC-GDIPC-7714',
    avatarColor: 'bg-rose-600',
    permissions: ['hai_surveillance', 'isolation_recommend', 'cluster_investigate', 'bundle_audit']
  },
  {
    id: 'persona-unit-champion',
    name: 'مها الزهراني',
    roleTitle: 'مشرفة التمريض وسفيرة السلامة بالعناية المركزة',
    roleTitleAr: 'منسقة جودة التمريض وسفيرة سلامة المرضى',
    roleKey: 'unit_champion',
    department: 'العناية المركزة (ICU)',
    licenseOrBadge: 'RN-ICU-6520',
    avatarColor: 'bg-purple-600',
    permissions: ['report_ovr', 'audit_hand_hygiene', 'fill_bundle_check', 'local_containment']
  }
];

// -----------------------------------------------------------------------------
// 1b. SPSC SENTINEL EVENT CRITERIA PROFILE (Policy V1 - Effective 1 Jan 2025)
// Contains 27 numbered enumerated criteria + general definition criterion
// -----------------------------------------------------------------------------
export const SPSC_SENTINEL_CRITERIA_PROFILE_2025: SentinelCriteriaProfile = {
  profileId: 'SPSC-SEP-2025-V1',
  authority: 'SPSC',
  policyName: 'SPSC Sentinel Event Reporting and Management Policy',
  version: 'V1',
  effectiveDate: '2025-01-01',
  enumeratedCriteria: [
    { code: 'SEC-01', number: 1, titleEn: 'Surgery or invasive procedure on wrong patient', titleAr: '1. إجراء جراحة أو تدخل جراحي للمريض الخطأ', category: 'surgical_procedural' },
    { code: 'SEC-02', number: 2, titleEn: 'Surgery or invasive procedure on wrong site / side', titleAr: '2. إجراء جراحة أو تدخل جراحي في الموضع أو الجانب الخطأ', category: 'surgical_procedural' },
    { code: 'SEC-03', number: 3, titleEn: 'Wrong surgical or invasive procedure performed on patient', titleAr: '3. إجراء عملية جراحية أو تداخلية خاطئة للمريض', category: 'surgical_procedural' },
    { code: 'SEC-04', number: 4, titleEn: 'Unintended retention of foreign object after surgery/procedure', titleAr: '4. بقاء غير مقصود لجسم غريب داخل المريض بعد الجراحة أو الإجراء', category: 'surgical_procedural' },
    { code: 'SEC-05', number: 5, titleEn: 'Intraoperative or immediate post-op death in ASA Class 1 patient', titleAr: '5. وفاة أثناء أو فور العملية الجراحية لمريض مصنف تخديرياً ASA-1', category: 'surgical_procedural' },
    { code: 'SEC-06', number: 6, titleEn: 'Death or serious disability associated with contaminated drugs/devices/biologics', titleAr: '6. وفاة أو إعاقة جسيمة مرتبطة بأدوية أو أجهزة أو مستحضرات ملوثة', category: 'medication_device' },
    { code: 'SEC-07', number: 7, titleEn: 'Death or serious disability associated with device use/function error', titleAr: '7. وفاة أو إعاقة جسيمة ناتجة عن خلل أو استخدام جهاز طبي في رعاية المريض', category: 'equipment_device' },
    { code: 'SEC-08', number: 8, titleEn: 'Death or serious disability associated with intravascular air embolism', titleAr: '8. وفاة أو إعاقة جسيمة مرتبطة بحدوث انصمام هوائي داخل الأوعية الدموية', category: 'clinical' },
    { code: 'SEC-09', number: 9, titleEn: 'Infant discharged to wrong person or infant abduction', titleAr: '9. تسليم رضيع لشخص خاطئ أو اختطاف طفل من المنشأة الصحية', category: 'security_patient_safety' },
    { code: 'SEC-10', number: 10, titleEn: 'Patient elopement / disappearance resulting in death or serious disability', titleAr: '10. هروب أو اختفاء مريض أدى إلى وفاة أو إعاقة جسيمة', category: 'security_patient_safety' },
    { code: 'SEC-11', number: 11, titleEn: 'Patient suicide, attempted suicide, or self-harm resulting in death or serious disability', titleAr: '11. انتحار أو محاولة انتحار أو إيذاء ذاتي أدى لوفاة أو إعاقة داخل المنشأة', category: 'clinical_mental_health' },
    { code: 'SEC-12', number: 12, titleEn: 'Death or serious disability associated with medication error', titleAr: '12. وفاة أو إعاقة جسيمة ناتجة عن خطأ دوائي أو تفاعل دوائي حرج', category: 'medication_error' },
    { code: 'SEC-13', number: 13, titleEn: 'Death or serious disability associated with unsafe blood transfusion / ABO incompatibility', titleAr: '13. وفاة أو إعاقة ناتجة عن نقل دم غير آمن أو عدم تطابق فصائل الدم ABO', category: 'blood_transfusion' },
    { code: 'SEC-14', number: 14, titleEn: 'Maternal death or serious morbidity associated with labor/delivery in low-risk pregnancy', titleAr: '14. وفاة أمومية أو اعتلال حاد جسيم مرتبط بالمخاض/الولادة لحمل قليل الخطورة', category: 'maternal_neonatal' },
    { code: 'SEC-15', number: 15, titleEn: 'Death or serious disability associated with healthcare-associated infection (HAI)', titleAr: '15. وفاة أو إعاقة جسيمة مرتبطة بعدوى مكتسبة من المنشأة الصحية', category: 'infection_control' },
    { code: 'SEC-16', number: 16, titleEn: 'Death or serious disability associated with patient fall in healthcare facility', titleAr: '16. وفاة أو إعاقة جسيمة ناتجة عن سقوط مريض داخل المنشأة الصحية', category: 'patient_fall' },
    { code: 'SEC-17', number: 17, titleEn: 'Stage 3, Stage 4, or unstageable pressure injury acquired after admission', titleAr: '17. إصابة قرحة ضغط (درجة 3 أو 4 أو غير قابلة للتقييم) مكتسبة بعد التنويم', category: 'nursing_care' },
    { code: 'SEC-18', number: 18, titleEn: 'Death or serious disability from delayed response to critical test results/deterioration', titleAr: '18. وفاة أو إعاقة جسيمة بسبب التأخر في الاستجابة لنتائج مخبرية/إشعاعية حرجة أو تدهور سريري', category: 'clinical_diagnostic' },
    { code: 'SEC-19', number: 19, titleEn: 'Artificial insemination with wrong donor sperm or wrong egg/embryo', titleAr: '19. تلقيح اصطناعي بنطاف أو بويضات/أجنة لمتبرع غير معني أو خطأ بالهوية', category: 'procedural' },
    { code: 'SEC-20', number: 20, titleEn: 'Inappropriate or premature patient discharge resulting in death or serious disability', titleAr: '20. خروج غير ملائم أو مبكر لمريض من المنشأة أدى إلى الوفاة أو إعاقة جسيمة', category: 'clinical_discharge' },
    { code: 'SEC-21', number: 21, titleEn: 'Physical assault, homicide, or sexual assault within healthcare facility grounds', titleAr: '21. اعتداء جسدي أو جنائي أو اعتداء جنسي داخل أسوار ومرافق المنشأة', category: 'security_violence' },
    { code: 'SEC-22', number: 22, titleEn: 'Death or serious disability associated with electric shock, burns, or fire in facility', titleAr: '22. وفاة أو إعاقة جسيمة مرتبطة بصعق كهربائي أو حروق أو حريق داخل المنشأة', category: 'safety_environment' },
    { code: 'SEC-23', number: 23, titleEn: 'Death or serious disability associated with physical or chemical restraints', titleAr: '23. وفاة أو إعاقة جسيمة مرتبطة باستخدام وسائل التقييد الجسدي أو الكيميائي', category: 'clinical_restraints' },
    { code: 'SEC-24', number: 24, titleEn: 'Death or serious disability associated with medical gas delivery error or cross-connection', titleAr: '24. وفاة أو إعاقة جسيمة مرتبطة بخطأ في إمداد الغازات الطبية أو تداخل توصيلاتها', category: 'facilities_biomedical' },
    { code: 'SEC-25', number: 25, titleEn: 'Radiation overdose or wrong-field radiation delivery leading to severe harm', titleAr: '25. جرعة إشعاعية علاجية مفرطة أو إشعاع في موضع غير صحيح نتج عنه ضرر جسيم', category: 'radiology_radiation' },
    { code: 'SEC-26', number: 26, titleEn: 'Death or permanent harm resulting from healthcare provider impersonation', titleAr: '26. وفاة أو ضرر دائم ناتج عن انتحال صفة ممارس صحي مرخص', category: 'governance_regulatory' },
    { code: 'SEC-27', number: 27, titleEn: 'Organ or tissue transplantation error or transmission of serious disease via transplant', titleAr: '27. خطأ في مطابقة وزراعة عضو/نسيج أو نقل مرض وبائي جسيم عبر العضو المزروع', category: 'transplantation' }
  ],
  generalDefinitionCriterion: {
    code: 'SEC-GENERAL',
    titleEn: 'General Definition: Unanticipated event outside enumerated list reaching patient with death or severe harm',
    titleAr: 'التعريف العام: أي حدث غير متوقع خارج القائمة يصل للمريض وينتج عنه وفاة أو ضرر جسيم دائم أو مؤقت',
    definition: 'Any unexpected incident outside the 27 enumerated categories that reaches the patient and results in death, severe temporary harm, or permanent loss of bodily/psychological function.'
  },
  verificationState: 'verified_source'
};

// -----------------------------------------------------------------------------
// 2. CONFIGURABLE RISK MATRIX PROFILES (3x3, 4x4, 5x5)
// -----------------------------------------------------------------------------
export const DEFAULT_RISK_MATRIX_PROFILES: RiskMatrixProfile[] = [
  {
    matrixId: 'MATRIX-5X5-DEFAULT',
    name: 'Illustrative Hospital 5x5 Risk Matrix Profile',
    nameAr: 'مصفوفة المخاطر الاسترشادية الخماسية للمستشفى (5x5 Matrix)',
    likelihoodLevels: 5,
    impactLevels: 5,
    calculationMethod: 'multiplication',
    riskBands: [
      { minScore: 15, maxScore: 25, level: 'extreme', labelAr: 'خطر حرج (Extreme)', labelEn: 'Extreme Risk', colorHex: '#ef4444' },
      { minScore: 10, maxScore: 14, level: 'high', labelAr: 'خطر مرتفع (High)', labelEn: 'High Risk', colorHex: '#f97316' },
      { minScore: 4, maxScore: 9, level: 'medium', labelAr: 'خطر متوسط (Medium)', labelEn: 'Medium Risk', colorHex: '#eab308' },
      { minScore: 1, maxScore: 3, level: 'low', labelAr: 'خطر منخفض (Low)', labelEn: 'Low Risk', colorHex: '#10b981' }
    ],
    effectiveDate: '2025-01-01',
    policySource: 'Hospital Enterprise Risk Policy (Configurable Profile)',
    status: 'illustrative_hospital_risk_profile'
  },
  {
    matrixId: 'MATRIX-4X4-CLINICAL',
    name: 'Clinical Acuity 4x4 Risk Matrix Profile',
    nameAr: 'مصفوفة المخاطر السريرية الرباعية (4x4 Clinical Matrix)',
    likelihoodLevels: 4,
    impactLevels: 4,
    calculationMethod: 'multiplication',
    riskBands: [
      { minScore: 12, maxScore: 16, level: 'extreme', labelAr: 'خطر حرج سريري', labelEn: 'Critical Clinical Risk', colorHex: '#ef4444' },
      { minScore: 8, maxScore: 11, level: 'high', labelAr: 'خطر مرتفع', labelEn: 'High Risk', colorHex: '#f97316' },
      { minScore: 4, maxScore: 7, level: 'medium', labelAr: 'خطر متوسط', labelEn: 'Medium Risk', colorHex: '#eab308' },
      { minScore: 1, maxScore: 3, level: 'low', labelAr: 'خطر منخفض', labelEn: 'Low Risk', colorHex: '#10b981' }
    ],
    effectiveDate: '2025-01-01',
    policySource: 'Hospital Clinical Governance Board',
    status: 'active'
  },
  {
    matrixId: 'MATRIX-3X3-RAPID',
    name: 'Rapid Screening 3x3 Risk Matrix Profile',
    nameAr: 'مصفوفة الفرز السريع الثلاثية (3x3 Rapid Triage Matrix)',
    likelihoodLevels: 3,
    impactLevels: 3,
    calculationMethod: 'multiplication',
    riskBands: [
      { minScore: 6, maxScore: 9, level: 'high', labelAr: 'أولوية قصوى', labelEn: 'High Priority', colorHex: '#ef4444' },
      { minScore: 3, maxScore: 5, level: 'medium', labelAr: 'أولوية متوسطة', labelEn: 'Medium Priority', colorHex: '#eab308' },
      { minScore: 1, maxScore: 2, level: 'low', labelAr: 'أولوية اعتيادية', labelEn: 'Routine Priority', colorHex: '#10b981' }
    ],
    effectiveDate: '2025-01-01',
    policySource: 'Hospital Operational Procedures',
    status: 'active'
  }
];

// -----------------------------------------------------------------------------
// 3. VERSIONED SURVEILLANCE DEFINITION PROFILES
// -----------------------------------------------------------------------------
export const DEFAULT_SURVEILLANCE_PROFILES: SurveillanceDefinitionProfile[] = [
  {
    profileId: 'SURV-NHSN-CLABSI-2025',
    authority: 'NHSN_2025',
    protocolName: 'CDC/NHSN Central Line-Associated Bloodstream Infection Protocol',
    protocolVersion: 'January 2025 Release',
    effectiveFrom: '2025-01-01',
    patientPopulation: 'adult',
    careSetting: 'icu',
    surveillanceCategory: 'clabsi',
    criteria: [
      'خط وريدي مركزي مركب لأكثر من يومين تقويميين',
      'مزرعة دم إيجابية بميكروب ممرض معترف به',
      'لا يوجد مصدر بديل أو ثانوي للعدوى الجرثومية في موضع آخر'
    ],
    denominatorDefinition: 'Central line-days counted at same time daily in selected ICU',
    status: 'active'
  },
  {
    profileId: 'SURV-NHSN-CAUTI-2025',
    authority: 'NHSN_2025',
    protocolName: 'CDC/NHSN Catheter-Associated Urinary Tract Infection Protocol',
    protocolVersion: 'January 2025 Release',
    effectiveFrom: '2025-01-01',
    patientPopulation: 'adult',
    careSetting: 'inpatient_ward',
    surveillanceCategory: 'cauti',
    criteria: [
      'قسطرة بولية مستمرة مركبة لأكثر من يومين تقويميين',
      'حرارة > 38°C أو ألم فوق العانة أو إيلام زاوي فقري',
      'مزرعة بول معقمة > 100,000 مستعمرة/مل بميكروب بكتيري لا يزيد عن نوعين'
    ],
    denominatorDefinition: 'Urinary catheter-days in applicable wards',
    status: 'active'
  },
  {
    profileId: 'SURV-NHSN-VAE-ADULT-2025',
    authority: 'NHSN_2025',
    protocolName: 'CDC/NHSN Adult Ventilator-Associated Event (VAE) Protocol',
    protocolVersion: 'January 2025 Release',
    effectiveFrom: '2025-01-01',
    patientPopulation: 'adult',
    careSetting: 'icu',
    surveillanceCategory: 'vae',
    criteria: [
      'مريض بالغ على جهاز تنفس صناعي لأكثر من يومين تقويميين',
      'تدهور مستقر في مؤشرات الأكسجة (VAC: زيادة FiO2 بـ 0.2 أو PEEP بـ 3 سم ماء لمدة يومين)',
      'علامات عدوى حيوية (IVAC: حرارة أو كريات دم بيضاء مع بدء مضاد حيوي جديد)'
    ],
    denominatorDefinition: 'Adult ventilator-days in ICU',
    status: 'active'
  },
  {
    profileId: 'SURV-GDIPC-PEDVAE-2024',
    authority: 'SAUDI_GDIPC_2024',
    protocolName: 'Saudi MoH GDIPC Pediatric & Neonatal VAE Protocol',
    protocolVersion: 'GDIPC Guideline v4.2',
    effectiveFrom: '2024-06-01',
    patientPopulation: 'pediatric',
    careSetting: 'icu',
    surveillanceCategory: 'ped_vae',
    criteria: [
      'مريض أطفال أو خديج على جهاز تنفس صناعي لأكثر من يومين تقويميين',
      'تدهور مستمر في مؤشرات ضغط التنفس الوسطي MAP أو FiO2',
      'فحص سريري متوافق وفق معايير طب الأطفال المعتمدة من GDIPC'
    ],
    denominatorDefinition: 'Pediatric/Neonatal ventilator-days',
    status: 'active'
  },
  {
    profileId: 'SURV-GDIPC-SSI-2024',
    authority: 'SAUDI_GDIPC_2024',
    protocolName: 'Saudi MoH GDIPC Surgical Site Infection Surveillance',
    protocolVersion: 'GDIPC Guideline v3.8',
    effectiveFrom: '2024-01-01',
    patientPopulation: 'all',
    careSetting: 'or',
    surveillanceCategory: 'ssi',
    criteria: [
      'حدوث الخمج الجراحي خلال 30 يوماً من الجراحة (أو 90 يوماً عند وجود غرسة)',
      'تصريف صديدي من الشق الجراحي السطحي أو العميق',
      'تأكيد استشاري الجراحة أو استقصاء مكافحة العدوى المعياري'
    ],
    denominatorDefinition: 'Total operative procedures for surveyed surgical category',
    status: 'active'
  }
];

// -----------------------------------------------------------------------------
// 4. SAFETY INCIDENTS (OVR) — Enhanced for SPSC Policy & Just Culture
// -----------------------------------------------------------------------------
export const INITIAL_INCIDENTS: SafetyIncidentCase[] = [
  {
    id: 'inc-001',
    referenceNumber: 'OVR-2025-0101',
    incidentType: 'sentinel_event',
    title: 'عدم تطابق عد الإبر الجراحية بنهاية عملية استئصال المرارة - تم اكتشافه قبل إغلاق الجرح',
    titleAr: 'عدم تطابق عد الإبر الجراحية بنهاية عملية استئصال المرارة (OR-1) مع فحص إشعاعي فوري',
    description: 'عند إجراء التدقيق الثالث لعد الأدوات والإبر (Sign Out) قبل خياطة الصفاق، أبلغت ممرضة التعقيم عن فقدان إبرة خياطة دائرية 3-0. تم التوقف الفوري وطلب جهاز الأشعة المتنقل C-Arm، حيث تم تحديد موقع الإبرة في الشاش الجراحي واستخراجها بالكامل دون بقاء أي جسم غريب داخل المريض.',
    reportedBy: 'مها الزهراني (RN)',
    reporterRole: 'ممرضة العمليات الميدانية',
    reportedAt: '2025-09-20 11:30',
    occurredAt: '2025-09-20 11:15',
    eventDiscoveryDate: '2025-09-20',
    location: 'مسارح العمليات (OR-1 جراحة المناظير)',
    department: 'العمليات الجراحية',
    patientId: 'p-001',
    patientMrn: 'MRN-88421',
    patientName: 'سعود بن فهد الدوسري',
    category: 'surgical_procedural',
    harmLevel: 'minor',
    sacScore: 'SAC-1',
    nccMerp: 'D',
    immediateContainment: 'إيقاف فوري للخياطة وإجراء أشعة تأكيدية داخل غرفة العمليات واستخراج الإبرة المفقودة مع توثيق التطابق النهائي.',
    contributingFactors: [
      {
        id: 'cf-1',
        category: 'task_technology',
        description: 'تغيير غير مجدول لأحد أفراد طاقم التمريض الجراحي أثناء مرحلة العد الوسطى.',
        impactWeight: 'primary'
      },
      {
        id: 'cf-2',
        category: 'work_environment',
        description: 'ضيق الوقت بين حالتين متتاليتين في جدول المسرح رقم 1.',
        impactWeight: 'secondary'
      }
    ],
    rcaRequired: true,
    rcaDetails: {
      rcaId: 'RCA-2025-001',
      incidentId: 'inc-001',
      teamLeader: 'د. حنان الغامدي',
      teamMembers: ['د. فهد الجراح', 'أ. سارة العتيبي', 'مها الزهراني', 'د. زياد الحربي'],
      charteredDate: '2025-09-21 09:00',
      targetCompletionDate: '2025-10-31 16:00', // 30 working days from 20 Sep 2025
      actualCompletionDate: '2025-09-24 14:00',
      problemStatement: 'وجود تشتت أثناء التبديل البيني لطاقم التمريض أدى لخطأ مبدئي في العد اليدوي للإبر الجراحية الدقيقة.',
      eventChronology: [
        { time: '10:45', event: 'بدء تسليم النوبة التمريضية الجراحية', actor: 'ممرضة أ' },
        { time: '11:10', event: 'بدء إجراء عد الأدوات النهائي قبل الإغلاق', actor: 'ممرضة ب' },
        { time: '11:15', event: 'اكتشاف عدم تطابق إبرة خياطة مقاس 3-0 وتنبيه الجراح فوراً', actor: 'طاقم التعقيم' },
        { time: '11:20', event: 'إجراء تصوير C-Arm داخل المسرح وتحديد الإبرة بين الشاش المهمل', actor: 'أخصائي الأشعة' }
      ],
      fiveWhys: [
        { level: 1, question: 'لماذا حدث عدم تطابق في سجل العد؟', answer: 'لأنه لم يُسجل استهلاك خيط جراحي إضافي فتحه الجراح أثناء السيطرة على نزف بسيط.' },
        { level: 2, question: 'لماذا لم يُسجل الخيط فور فتحه؟', answer: 'لانشغال ممرضة الطاولة بالمساعدة الجراحية أثناء تبديل الممرضة الدوارة.' },
        { level: 3, question: 'لماذا تم تبديل الممرضة الدوارة في تلك اللحظة؟', answer: 'لانتهاء ساعات النوبة دون تجميد مهام العد الحرجة.' },
        { level: 4, question: 'لماذا لم يتم حظر التبديل أثناء مراحل العد الحرجة؟', answer: 'عدم وجود قاعدة (No-Interruption Zone) صريحة في سياسة التبديل.' },
        { level: 5, question: 'ما السبب الجذري النظمي؟', answer: 'غياب سياسة الحظر الإلزامي لتبديل الطاقم أثناء مراحل العد الجراحي الحساسة وتعدد عوامل النظام.' }
      ],
      fishboneCategories: {
        people: ['تغيير الممرضة الدوارة أثناء العملية', 'ضغط وتعب نهاية النوبة'],
        process: ['غياب منطقة حظر المقاطعة أثناء العد', 'عدم توثيق فتح العبوة الإضافية لحظياً'],
        equipment: ['لوحة العد المغناطيسية لم تكن مجهزة بعدد إبر 3-0'],
        environment: ['مستوى ضجيج مرتفع أثناء إنهاء الحالة'],
        management: ['جدولة متقاربة للحالات الجراحية'],
        materials: ['تنوع موردين في خيوط الجراحة الصغيرة']
      },
      causalFactors: [
        { id: 'caus-1', type: 'system_process', statement: 'غياب سياسة الحظر الصارم لتبادل النوبات أثناء عد الشاش والأدوات.', isIndividualBlame: false },
        { id: 'caus-2', type: 'environmental', statement: 'ازدحام جدول العمليات وضيق الفواصل الزمنية بين الحالات.', isIndividualBlame: false }
      ],
      rootCauses: [
        'غياب سياسة الحظر الصارم لتبادل النوبات التمريضية أثناء مراحل فتح وعد الأدوات الجراحية.',
        'الحاجة إلى لوحات عد مغناطيسية بيضاء موحدة مرئية لجميع الفريق الجراحي.'
      ],
      status: 'approved'
    },

    // Sentinel Review Details (SPSC Policy 2025)
    sentinelWorkflowStatus: 'criteria_met',
    sentinelReviewDetails: {
      reviewId: 'REV-2025-001',
      status: 'criteria_met',
      reviewedByPersonaId: 'persona-quality-director',
      reviewedByName: 'د. حنان الغامدي (مدير الجودة وسلامة المرضى)',
      reviewedAt: '2025-09-20 13:00',
      criterionCodeApplied: 'SEC-04',
      criterionApplied: 'SPSC Criterion #4: بقاء غير مقصود لجسم غريب داخل المريض بعد الجراحة أو الإجراء (Unintended retention of foreign object after surgery/procedure)',
      policySource: 'SPSC Sentinel Event Reporting and Management Policy',
      policyVersion: 'V1 (Effective 1 Jan 2025)',
      decisionNotes: 'تم اعتماد تصنيف الواقعة كحدث جسيم خاضع للمراجعة والتحليل الجذري، وتفعيل متطلبات الإشعار الداخلي خلال 24 ساعة.',
      eventDiscoveryDate: '2025-09-20',
      internalReportingCompleted: true,
      ceoNotificationDeadline: '2025-09-21 11:15', // 24h
      ceoNotificationCompleted: true,
      spscPlatformDeadline: '2025-09-22 11:15', // 48h from discovery
      spscPlatformStatus: 'prepared_for_review',
      rcaCapSubmissionDeadline: '2025-10-31' // 30 working days
    },

    syntheticReportingReference: {
      referenceStatus: 'synthetic_external_reporting_reference',
      referenceId: 'SYN-SPSC-2025-0101',
      generatedAt: '2025-09-20 14:00',
      reviewTarget: 'SPSC_PORTAL_SIMULATION',
      noticeText: 'مرجع إبلاغ اصطناعي داخلي: تم تجهيز ملف البلاغ وفق سياسة SPSC (نسخة 2025) للمراجعة الداخلية، دون تنفيذ أي إرسال خارجي فعلي.'
    },

    linkedCapaIds: ['capa-001'],
    status: 'capa_pending',
    lessonsLearned: 'تطبيق مبادئ ثقافة الإنصاف (Just Culture): التركيز على عوامل النظام وتعزيز منطقة العد المحمية (Sterile Cockpit) بدلاً من اللوم الفردي.'
  },
  {
    id: 'inc-002',
    referenceNumber: 'OVR-2025-0102',
    incidentType: 'incident',
    title: 'تباين في برمجة مضخة ضخ الأنسولين الوريدي بالعناية المركزة أدى لهبوط سكر الدم المؤقت',
    titleAr: 'خطأ برمجة مضخة التسريب الوريدي للأنسولين (ICU-02) مع حدوث هبوط مؤقت في مستوى السكر',
    description: 'تمت برمجة مضخة التسريب لمريض السكري بمعدل 6 وحدات/ساعة بدلاً من 0.6 وحدة/ساعة وفق البروتوكول. انخفض سكر الدم إلى 54 مجم/دل بعد 45 دقيقة. تم إيقاف المضخة فوراً وإعطاء 50 مل جلوكوز 50% وريدياً واستعاد المريض توازنه الطبيعي (110 مجم/دل) دون أي مضاعفات دائمة.',
    reportedBy: 'سارة العتيبي (CPPS)',
    reporterRole: 'مسؤول سلامة المرضى',
    reportedAt: '2025-09-21 16:40',
    occurredAt: '2025-09-21 15:30',
    eventDiscoveryDate: '2025-09-21',
    location: 'العناية المركزة (ICU - سرير 02)',
    department: 'العناية المركزة',
    patientId: 'p-002',
    patientMrn: 'MRN-99120',
    patientName: 'عائشة ناصر القحطاني',
    category: 'medication_error',
    harmLevel: 'moderate',
    sacScore: 'SAC-2',
    nccMerp: 'E',
    immediateContainment: 'إيقاف ضخ الأنسولين، قياس فوري لسكر الدم، إعطاء Dextrose 50% وريدياً، وإشعار استشاري العناية وتكثيف القياس كل 15 دقيقة.',
    contributingFactors: [
      {
        id: 'cf-3',
        category: 'individual_staff',
        description: 'عدم تفعيل التحقق المزدوج المستقل (Independent Double Check) بين ممرضتين قبل تشغيل المضخة.',
        impactWeight: 'primary'
      },
      {
        id: 'cf-4',
        category: 'task_technology',
        description: 'واجهة برمجة المضخة القديمة لا تحتوي على مكتبة الجرعات الذكية (DERS).',
        impactWeight: 'primary'
      }
    ],
    rcaRequired: true,
    sentinelWorkflowStatus: 'criteria_not_met',
    linkedCapaIds: ['capa-002'],
    status: 'under_investigation'
  },
  {
    id: 'inc-003',
    referenceNumber: 'OVR-2025-0103',
    incidentType: 'near_miss',
    title: 'نظام مسح الباركود الصيدلاني يمنع صرف مضاد سيفيبيم لمريض لديه حساسية مفرطة للبنسلينات',
    titleAr: 'التقاط خطأ وشيك (Good Catch): الباركود الإلكتروني منع صرف سيفالوسبورين لمريض يعاني حساسية شديدة',
    description: 'قام الطبيب بكتابة وصفة سيفيبيم لمريض بقسم الباطنة ووافق عليها مبدئياً. عند تحضير العلاج بصيدلية التنويم، أطلق الماسح الباركودي تحذيراً أحمر لوجود حساسية بنسلينات مفرطة موثقة بملف المريض. تم التواصل مع الطبيب واستبدال الدواء بسيبروفلوكساسين دون أن يصل أي خطر للمريض.',
    reportedBy: 'صيدلي التنويم أحمد الشمري',
    reporterRole: 'صيدلي سريري',
    reportedAt: '2025-09-22 08:30',
    occurredAt: '2025-09-22 08:15',
    eventDiscoveryDate: '2025-09-22',
    location: 'الصيدلية الداخلية - قسم التنويم',
    department: 'العمليات الصيدلانية',
    patientId: 'p-003',
    patientMrn: 'MRN-77341',
    patientName: 'عبدالرحمن إبراهيم المطيري',
    category: 'medication_error',
    harmLevel: 'none',
    sacScore: 'SAC-4',
    nccMerp: 'B',
    immediateContainment: 'رفض الصرف بالصيدلية والاتصال الفوري بالطبيب المعالج واستبدال الصنف العلاجي.',
    contributingFactors: [
      {
        id: 'cf-5',
        category: 'task_technology',
        description: 'تخطي الطبيب لتنبيه الحساسية التلقائي على شاشة CPOE بسبب كثرة التنبيهات المعتادة (Alert Fatigue).',
        impactWeight: 'primary'
      }
    ],
    rcaRequired: false,
    sentinelWorkflowStatus: 'criteria_not_met',
    linkedCapaIds: [],
    status: 'closed',
    lessonsLearned: 'ثقافة الإبلاغ الإيجابي عن الأخطاء الوشيكة (Good Catch) ودعم الكوادر الصحية للإشادة بدورهم في حماية المرضى.'
  },
  {
    id: 'inc-004',
    referenceNumber: 'OVR-2025-0104',
    incidentType: 'incident',
    title: 'سقوط مريض بدون مساعدة في دورة مياه جناح التنويم 3A مع حدوث كدمة خفيفة بالركبة',
    titleAr: 'سقوط مريض بدون مساعدة في دورة المياه (جناح التنويم 3A) - كدمة بسيطة وفحص إشعاعي سليم',
    description: 'قام مريض مسن (73 عاماً) بمحاولة الذهاب إلى دورة المياه بمفرده ليلاً رغم تصنيفه بدرجة خطورة سقوط مرتفعة (Morse Score 65). انزلق المريض في الحمام، وتم إسعافه فوراً وفحصه سريرياً وإشعاعياً، وتبين عدم وجود أي كسور مع وجود كدمة سطحية فقط.',
    reportedBy: 'ممرضة الجناح فاطمة علي',
    reporterRole: 'ممرضة مسجلة',
    reportedAt: '2025-09-22 02:40',
    occurredAt: '2025-09-22 02:25',
    eventDiscoveryDate: '2025-09-22',
    location: 'جناح التنويم 3A - غرفة 304',
    department: 'التنويم الباطني (IPD)',
    patientId: 'p-004',
    patientMrn: 'MRN-66219',
    patientName: 'منصور صالح الخالدي',
    category: 'patient_fall',
    harmLevel: 'minor',
    sacScore: 'SAC-3',
    nccMerp: 'D',
    immediateContainment: 'رفع المريض بكرسي نقال، قياس المؤشرات الحيوية، فحص طبي شامل، كمادات باردة، وإشعار العائلة وتثبيت حزام الأمان.',
    contributingFactors: [
      {
        id: 'cf-6',
        category: 'work_environment',
        description: 'إنذار السرير (Bed Alarm) كان موقوفاً بعد قياس علامات منتصف الليل ولم يُعد تفعيله.',
        impactWeight: 'primary'
      }
    ],
    rcaRequired: false,
    sentinelWorkflowStatus: 'criteria_not_met',
    linkedCapaIds: ['capa-003'],
    status: 'capa_pending',
    lessonsLearned: 'إلزامية تفعيل إنذارات الأسرّة الذكية للمرضى ذوي الخطورة العالية بعد كل إجراء تمريضي ليلي وفق مبادئ ثقافة الإنصاف.'
  }
];

// -----------------------------------------------------------------------------
// 5. ENTERPRISE & CLINICAL RISKS (Configurable Profiles)
// -----------------------------------------------------------------------------
export const INITIAL_RISKS: RiskRegisterItem[] = [
  {
    id: 'risk-001',
    riskCode: 'RISK-CLIN-001',
    title: 'أخطاء إعطاء الأدوية عالية الخطورة أثناء تسليم النوبات التمريضية بالمناطق الحرجة',
    titleAr: 'مخاطر تباين تسليم الأدوية عالية الخطورة (High-Alert Medications) في العناية والطوارئ',
    description: 'احتمال حدوث أخطاء في تركيزات أو جرعات المحاليل الوريدية الحساسة كالأنسولين والهيبارين ومضادات اضطراب النظم أثناء فترات تسليم وتسلم المناوبات التمريضية المزدحمة.',
    domain: 'medication_safety',
    identifiedBy: 'د. حنان الغامدي',
    identifiedDate: '2025-08-10',
    activeMatrixProfileId: 'MATRIX-5X5-DEFAULT',
    inherentLikelihood: 4,
    inherentConsequence: 4,
    inherentScore: 16,
    inherentLevel: 'extreme',
    existingControls: [
      'سياسة الأدوية عالية الخطورة بالمستشفى',
      'بطاقات تعريف حمراء على أكياس الأدوية المركزة',
      'فحص العلامات الحيوية قبل الإعطاء'
    ],
    proposedMitigations: [
      'تطبيق التحقق المزدوج المستقل عبر باركود eMAR الإلزامي',
      'استبدال مضخات التسريب القديمة بمضخات ذكية تدعم مكتبة الجرعات الآمنة DERS',
      'تدريب مكثف للتمريض على بروتوكول SBAR الدوائي'
    ],
    residualLikelihood: 2,
    residualConsequence: 3,
    residualScore: 6,
    residualLevel: 'medium',
    targetLikelihood: 1,
    targetConsequence: 3,
    targetScore: 3,
    targetLevel: 'low',
    treatmentStrategy: 'mitigate',
    riskOwner: 'د. رئيس قسم الصيدلة السريرية ومشرفة التمريض العام',
    targetResolutionDate: '2025-11-30',
    status: 'active',
    keyRiskIndicators: [
      {
        name: 'نسبة الالتزام بالتحقق المزدوج للأدوية الحرجة',
        nameAr: 'مؤشر التحقق المزدوج (Dual Nurse Check %)',
        threshold: '>= 95%',
        currentValue: '91%',
        status: 'warning'
      }
    ],
    lastReviewDate: '2025-09-15'
  },
  {
    id: 'risk-002',
    riskCode: 'RISK-IPC-002',
    title: 'تفشي بكتيريا مقاومة متعددة للمضادات (CRE / CR-Acinetobacter) في العناية المركزة',
    titleAr: 'مخاطر تفشي وانتقال الميكروبات شديدة المقاومة للمضادات الحيوية (MDROs) بوحدة ICU',
    description: 'خطر انتقال سلالات البكتيريا المعوية المقاومة للكاربابينيم بين المرضى المنومين لفترات طويلة على أجهزة التنفس الصناعي بسبب تراجع الالتزام بنظافة الأيدي أو عزل التلامس.',
    domain: 'infection_control',
    identifiedBy: 'د. زياد الحربي (CIC)',
    identifiedDate: '2025-07-05',
    activeMatrixProfileId: 'MATRIX-5X5-DEFAULT',
    inherentLikelihood: 4,
    inherentConsequence: 5,
    inherentScore: 20,
    inherentLevel: 'extreme',
    existingControls: [
      'مسحات الاستقصاء النشط لدخول العناية (Active Surveillance Cultures)',
      'تخصيص غرف عزل التلامس الفردية',
      'توفير معقمات الأيدي الكحولية عند كل مدخل وسرير'
    ],
    proposedMitigations: [
      'تطبيق حزم التطهير الطرفي بالأشعة فوق البنفسجية UV-C بعد خروج المرضى المصابين',
      'حملة توعية مكثفة وتدقيق سري لـ لحظات نظافة الأيدي الخمس لمنظمة الصحة العالمية',
      'حصر صرف الكاربابينيمات بموافقة استشاري الأمراض المعدية حصراً'
    ],
    residualLikelihood: 2,
    residualConsequence: 4,
    residualScore: 8,
    residualLevel: 'medium',
    targetLikelihood: 1,
    targetConsequence: 3,
    targetScore: 3,
    targetLevel: 'low',
    treatmentStrategy: 'mitigate',
    riskOwner: 'رئيس قسم مكافحة العدوى والوبائيات ومدير العناية المركزة',
    targetResolutionDate: '2025-10-31',
    status: 'under_review',
    keyRiskIndicators: [
      {
        name: 'نسبة مطابقة نظافة اليدين بالعناية المركزة',
        nameAr: 'امتثال نظافة الأيدي بالعناية (Hand Hygiene %)',
        threshold: '>= 90%',
        currentValue: '87%',
        status: 'warning'
      }
    ],
    lastReviewDate: '2025-09-18'
  }
];

// -----------------------------------------------------------------------------
// 6. CAPA ITEMS (Completed != Effective)
// -----------------------------------------------------------------------------
export const INITIAL_CAPAS: CapaItem[] = [
  {
    id: 'capa-001',
    capaCode: 'CAPA-2025-001',
    title: 'تطبيق لوحة العد المغناطيسية المقيدة وإلزامية منطقة حظر المقاطعة (Sterile Cockpit) بالعمليات',
    titleAr: 'إلزامية منطقة حظر المقاطعة أثناء عد الأدوات الجراحية واستخدام ألواح العد المغناطيسية',
    type: 'corrective',
    sourceOrigin: 'incident_rca',
    sourceReferenceId: 'OVR-2025-0101',
    controlHierarchy: 'strong_forcing_function',
    hierarchyProfileId: 'HIERARCHY-PROFILE-DEFAULT',
    description: 'وضع ضابط إلزامي يمنع تبادل النوبات أو التحدث الجانبي أثناء مرحلة عد الأدوات بالعمليات، مع تزويد كافة المسارح بألواح عد مغناطيسية بيضاء معيارية مرئية لكامل الفريق.',
    actionSteps: [
      'تعديل سياسة عد الأدوات الجراحية وإدراج بند حظر تبديل الممرضات أثناء العد',
      'توريد وتركيب 8 ألواح مغناطيسية بيضاء موحدة لمسارح العمليات',
      'إجراء ورشة تدريبية لجميع طواقم التمريض الجراحي وأطباء الجراحة والتخدير'
    ],
    actionOwner: 'مها الزهراني (RN - مشرفة العمليات)',
    ownerDepartment: 'إدارة التمريض والخدمات الجراحية',
    dueDate: '2025-10-15',
    implementationDate: '2025-09-23',
    isCompleted: true,
    effectivenessReviewDate: '2025-11-15',
    effectivenessStatus: 'effectiveness_pending', // Invariant: completed != effective
    effectivenessAuditNotes: 'الإجراء مكتمل تشغيلياً، بانتظار استكمال دورة تدقيق عشوائية لـ 20 عملية متتالية لقياس الفاعلية.',
    status: 'implemented'
  },
  {
    id: 'capa-002',
    capaCode: 'CAPA-2025-002',
    title: 'تفعيل الإيقاف البرمجي الإلزامي للتحقق المزدوج المستقل للأنسولين والمحاليل المركزة',
    titleAr: 'التحقق المزدوج المستقل الإلزامي عبر الباركود لمضخات الأنسولين الوريدي بالعنايات والأجنحة',
    type: 'corrective',
    sourceOrigin: 'incident_rca',
    sourceReferenceId: 'OVR-2025-0102',
    controlHierarchy: 'strong_forcing_function',
    hierarchyProfileId: 'HIERARCHY-PROFILE-DEFAULT',
    description: 'تعديل برمجي بنظام HIS يمنع تأكيد بدء ضخ الأنسولين أو الهيبارين الوريدي إلا بعد مسح هوية ممرضتين مستقلتين عبر شاشة eMAR مع تنبيه عند إدخال جرعات تفوق 2 وحدة/ساعة.',
    actionSteps: [
      'تفعيل ميزة Dual Independent Nurse Scan بنظام السجل الطبي eMAR للأدوية الحساسة',
      'معايرة وضبط حدود الجرعات القصوى بمضخات المحاليل الذكية DERS'
    ],
    actionOwner: 'أ. سارة العتيبي (أخصائي سلامة المرضى)',
    ownerDepartment: 'لجنة سلامة الدواء وإدارة التمريض',
    dueDate: '2025-10-10',
    implementationDate: '2025-09-24',
    isCompleted: true,
    effectivenessReviewDate: '2025-11-10',
    effectivenessStatus: 'effective',
    effectivenessEvidenceReference: 'AUDIT-REF-EMAR-2025-W38',
    effectivenessAuditNotes: 'أظهر التدقيق الأسبوعي الأول ارتفاع نسبة الالتزام بالتحقق المزدوج إلى 98.2% وانعدام الأخطاء.',
    status: 'effectiveness_verified'
  },
  {
    id: 'capa-003',
    capaCode: 'CAPA-2025-003',
    title: 'تثبيت إنذارات الأسرّة الذكية المرتبطة بنداء التمريض للمرضى المصنفين بخطر سقوط مرتفع',
    titleAr: 'ربط إنذارات حركة الأسرّة الذكية للمرضى ذوي خطورة السقوط المرتفعة بجهاز نداء التمريض',
    type: 'preventive',
    sourceOrigin: 'incident_rca',
    sourceReferenceId: 'OVR-2025-0104',
    controlHierarchy: 'intermediate_standardized_process',
    hierarchyProfileId: 'HIERARCHY-PROFILE-DEFAULT',
    description: 'إلزامية تفعيل إنذار السرير (Bed Exit Alarm) لجميع المرضى الحاصلين على Morse Score > 50 وربط التنبيه بضوء نداء التمريض بمحطة الممرضين الرئيسية.',
    actionSteps: [
      'فحص وتحديث حساسات أسرّة أجنحة الباطنة والجراحة 3A و 3B',
      'تثبيت لوحة إرشادية للمريض وعائلته بأهمية طلب المساعدة للذهاب للحمام'
    ],
    actionOwner: 'مشرفة تمريض جناح 3A فاطمة علي',
    ownerDepartment: 'إدارة التمريض السريري',
    dueDate: '2025-10-25',
    isCompleted: false,
    effectivenessReviewDate: '2025-12-01',
    effectivenessStatus: 'effectiveness_pending',
    status: 'in_progress'
  }
];

// -----------------------------------------------------------------------------
// 7. QUALITY INDICATORS (Explicit Source Mapping & Incident-Rate Integrity)
// -----------------------------------------------------------------------------
export const INITIAL_KPIS: QualityIndicatorKpi[] = [
  {
    indicatorId: 'KPI-IND-01',
    code: 'KPI-QI-01',
    name: 'Recorded Observational Hand Hygiene Compliance',
    nameAr: 'نسبة الامتثال لنظافة اليدين بالملاحظة الميدانية المستمرة',
    category: 'infection_prevention',
    numerator: 'عدد فرص نظافة الأيدي الممتثلة (Handrub or Handwash)',
    denominator: 'إجمالي فرص نظافة الأيدي الملاحظة ميدانياً (WHO 5 Moments)',
    inclusionCriteria: 'كافة الكوادر الصحية المرصودة بالأجنحة والعناية أثناء الرعاية المباشرة',
    exclusionCriteria: 'الملاحظات غير المكتملة أو خارج نطاق لحظات منظمة الصحة العالمية',
    dataSource: 'IPC Observational Audit Tool (Synthetic Registry)',
    frequency: 'شهري',
    unit: '%',
    target: 90,
    targetSource: 'Hospital Quality Board / CBAHI Target Guideline',
    benchmarkSource: 'WHO & National IPC Reference',
    currentPeriodValue: 88,
    previousPeriodValue: 84,
    trendDirection: 'improving',
    effectivePeriod: '2025',
    verificationState: 'hospital_configured_indicator',
    status: 'variance_warning',
    historicalData: [
      { month: 'مايو', value: 81 },
      { month: 'يونيو', value: 83 },
      { month: 'يوليو', value: 85 },
      { month: 'أغسطس', value: 84 },
      { month: 'سبتمبر', value: 88 }
    ]
  },
  {
    indicatorId: 'KPI-IND-02',
    code: 'KPI-QI-02',
    name: 'Reported Medication Safety Concerns per 1,000 Inpatient Days',
    nameAr: 'معدل بلاغات أحداث السلامة الدوائية المسجلة بنظام OVR لكل ألف يوم تنويم',
    category: 'patient_safety',
    numerator: 'عدد بلاغات الأحداث الدوائية الطوعية الموثقة بنظام OVR',
    denominator: 'إجمالي أيام مكوث المرضى المنومين بالمستشفى (Patient-Days)',
    inclusionCriteria: 'كافة بلاغات الأخطاء الدوائية والأخطاء الوشيكة (Near Misses) المسجلة طوعياً',
    exclusionCriteria: 'البلاغات المكررة لنفس الواقعة أو غير المكتملة البيانات',
    dataSource: 'OVR Incident Reporting Registry (Reported events only; not actual harm rate)',
    frequency: 'شهري',
    unit: 'per_1000_days',
    target: 2.0,
    targetSource: 'Hospital Patient Safety Policy',
    benchmarkSource: 'Internal Historical Baseline',
    currentPeriodValue: 1.6,
    previousPeriodValue: 1.8,
    trendDirection: 'improving',
    effectivePeriod: '2025',
    verificationState: 'hospital_configured_indicator',
    status: 'target_met',
    historicalData: [
      { month: 'مايو', value: 2.2 },
      { month: 'يونيو', value: 2.0 },
      { month: 'يوليو', value: 1.9 },
      { month: 'أغسطس', value: 1.8 },
      { month: 'سبتمبر', value: 1.6 }
    ]
  },
  {
    indicatorId: 'KPI-IND-03',
    code: 'KPI-QI-03',
    name: 'Reported Inpatient Fall Events per 1,000 Bed Days',
    nameAr: 'معدل بلاغات حوادث سقوط المرضى المسجلة لكل ألف يوم سرير',
    category: 'patient_safety',
    numerator: 'عدد بلاغات السقوط المسجلة بالأجنحة بنظام OVR',
    denominator: 'إجمالي أيام الأسرة المشغولة (Occupied Bed Days)',
    inclusionCriteria: 'حالات السقوط المسجلة سواء بمساعدة أو دون مساعدة',
    exclusionCriteria: 'السقوط خارج مبنى المستشفى أو في مواقف السيارات',
    dataSource: 'Nursing OVR Documentation',
    frequency: 'شهري',
    unit: 'per_1000_days',
    target: 1.5,
    targetSource: 'Hospital Nursing & Safety Policy',
    benchmarkSource: 'Hospital Quality Committee',
    currentPeriodValue: 1.2,
    previousPeriodValue: 1.3,
    trendDirection: 'improving',
    effectivePeriod: '2025',
    verificationState: 'hospital_configured_indicator',
    status: 'target_met',
    historicalData: [
      { month: 'مايو', value: 1.6 },
      { month: 'يونيو', value: 1.4 },
      { month: 'يوليو', value: 1.5 },
      { month: 'أغسطس', value: 1.3 },
      { month: 'سبتمبر', value: 1.2 }
    ]
  },
  {
    indicatorId: 'KPI-IND-04',
    code: 'KPI-QI-04',
    name: 'Surgical Site Infection Rate in Class-I Clean Surgeries',
    nameAr: 'معدل خمج الموضع الجراحي في العمليات النظيفة (SSI Class-I)',
    category: 'clinical_effectiveness',
    numerator: 'عدد حالات خمج الموضع الجراحي المؤكدة في العمليات النظيفة',
    denominator: 'إجمالي العمليات الجراحية النظيفة المجراة بمسارح العمليات',
    inclusionCriteria: 'العمليات المصنفة Class-I النظيفة بدون فتح للتجاويف الملتهبة',
    exclusionCriteria: 'الجروح الملوثة أو العمليات الطارئة غير المجدولة',
    dataSource: 'OR Surgical Logbook & IPC Surveillance Registry',
    frequency: 'شهري',
    unit: '%',
    target: 1.0,
    targetSource: 'National SPSC & CBAHI Quality Benchmark',
    benchmarkSource: 'GDIPC National Benchmark',
    currentPeriodValue: 0.8,
    previousPeriodValue: 0.9,
    trendDirection: 'improving',
    effectivePeriod: '2025',
    verificationState: 'hospital_configured_indicator',
    status: 'target_met',
    historicalData: [
      { month: 'مايو', value: 1.1 },
      { month: 'يونيو', value: 1.0 },
      { month: 'يوليو', value: 0.9 },
      { month: 'أغسطس', value: 0.8 },
      { month: 'سبتمبر', value: 0.8 }
    ]
  },
  {
    indicatorId: 'KPI-IND-05',
    code: 'KPI-QI-05',
    name: 'CLABSI Rate per 1,000 Central Line Days in Intensive Care',
    nameAr: 'معدل خمج مجرى الدم المرتبط بالقثطار الوريدي المركزي بالعناية المركزة',
    category: 'infection_prevention',
    numerator: 'عدد إصابات CLABSI المؤكدة وفق معايير CDC/NHSN',
    denominator: 'إجمالي أيام القثاطر الوريدية المركزية (Central Line-Days)',
    inclusionCriteria: 'مرضى العناية المركزة البالغين مع قثطار وريدي مركزي > 2 يوم تقويمي',
    exclusionCriteria: 'الخمج الثانوي لمصدر بؤري آخر معروف',
    dataSource: 'ICU Device Surveillance Records',
    frequency: 'شهري',
    unit: 'per_1000_days',
    target: 2.5,
    targetSource: 'Saudi GDIPC Reference Target',
    benchmarkSource: 'GDIPC & CDC/NHSN Reference',
    currentPeriodValue: 2.38,
    previousPeriodValue: 2.8,
    trendDirection: 'improving',
    effectivePeriod: '2025',
    verificationState: 'hospital_configured_indicator',
    status: 'target_met',
    historicalData: [
      { month: 'مايو', value: 3.1 },
      { month: 'يونيو', value: 2.9 },
      { month: 'يوليو', value: 2.6 },
      { month: 'أغسطس', value: 2.5 },
      { month: 'سبتمبر', value: 2.38 }
    ]
  }
];

// -----------------------------------------------------------------------------
// 8. FOCUS-PDCA QUALITY IMPROVEMENT PROJECTS
// -----------------------------------------------------------------------------
export const INITIAL_PDCA_PROJECTS: FocusPdcaProject[] = [
  {
    id: 'pdca-001',
    code: 'QI-FOCUS-2025-01',
    title: 'مشروع خفض معدلات عدوى القساطر البولية (CAUTI) في أجنحة الجراحة والتنويم الباطني',
    titleAr: 'مشروع FOCUS-PDCA للحد من استدامة القساطر البولية وتطبيق حزم الصيانة اليومية',
    teamLeader: 'د. زياد الحربي (CIC)',
    department: 'أجنحة التنويم الجراحي والباطني',
    stage: 'do',
    targetMetric: 'CAUTI Rate per 1000 catheter-days',
    baselineValue: '1.45',
    targetValue: '< 0.90',
    currentProgressPercent: 70,
    updatedDate: '2025-09-20'
  }
];

// -----------------------------------------------------------------------------
// 9. INFECTION SURVEILLANCE CASES (Versioned Profiles)
// -----------------------------------------------------------------------------
export const INITIAL_HAI_CASES: HaiSurveillanceCase[] = [
  {
    id: 'hai-001',
    caseNumber: 'HAI-2025-001',
    patientId: 'p-002',
    patientMrn: 'MRN-99120',
    patientName: 'عائشة ناصر القحطاني',
    patientAge: 58,
    patientPopulation: 'adult',
    wardDepartment: 'العناية المركزة (ICU)',
    bedNumber: 'ICU-Bed-02',
    haiType: 'clabsi',
    surveillanceProfileId: 'SURV-NHSN-CLABSI-2025',
    surveillanceProfileVersion: 'January 2025 Release',
    devicePresent: true,
    deviceType: 'central_line',
    deviceInsertionDate: '2025-09-12',
    deviceDaysAtEvent: 7,
    eventDate: '2025-09-19',
    organism: {
      name: 'Klebsiella pneumoniae (ESBL+)',
      category: 'gram_negative',
      mdroClassification: 'ESBL',
      resistancePhenotype: 'مقاومة للبنسلينات والسيفالوسبورينات، حساسة للميروبينيم والأميكاسين'
    },
    specimenSource: 'مزرعة دم وريدية محيطية ومن قسطرة وريد الوداجي الداخلي',
    nhsnCriteriaMet: true,
    nhsnCriteriaSummary: 'توافق معايير CDC/NHSN: خط مركزي > 2 أيام، حرارة > 38°C، ومزرعة دم إيجابية بميكروب معوي بدون مصدر ثانوي ظاهر.',
    assignedIsolation: 'contact',
    precautionReviewRequired: true,
    isolationStatus: 'active',
    isolationRoom: 'غرفة عزل تلامس - سرير 2',
    antiMicrobialTherapy: 'Meropenem 1g IV q8h وفق ترشيد المضادات الحيوية',
    sourceInvestigationNotes: 'تمت إزالة القسطرة المركزية وإرسال الطرف للمزرعة الجرثومية. توصية عزل التلامس استشارية لمكافحة العدوى دون المساس بالأوامر العلاجية للطبيب.',
    status: 'confirmed_hai',
    confirmedBy: 'د. زياد الحربي (استشاري مكافحة العدوى)',
    confirmedDate: '2025-09-20'
  },
  {
    id: 'hai-002',
    caseNumber: 'HAI-2025-002',
    patientId: 'p-003',
    patientMrn: 'MRN-77341',
    patientName: 'عبدالرحمن إبراهيم المطيري',
    patientAge: 64,
    patientPopulation: 'adult',
    wardDepartment: 'جناح التنويم الباطني 3A',
    bedNumber: '305-B',
    haiType: 'cauti',
    surveillanceProfileId: 'SURV-NHSN-CAUTI-2025',
    surveillanceProfileVersion: 'January 2025 Release',
    devicePresent: true,
    deviceType: 'foley_catheter',
    deviceInsertionDate: '2025-09-10',
    deviceDaysAtEvent: 9,
    eventDate: '2025-09-19',
    organism: {
      name: 'Pseudomonas aeruginosa',
      category: 'gram_negative',
      mdroClassification: 'None',
      resistancePhenotype: 'حساسة للبيبراسيلين/تازوباكتام والسيفتارولين'
    },
    specimenSource: 'مزرعة بول معقمة من منفذ القسطرة',
    nhsnCriteriaMet: true,
    nhsnCriteriaSummary: 'قسطرة بولية مستمرة > 2 أيام، حرارة 38.3°C مع ألم فوق العانة وتعداد بكتيري > 100,000 CFU/mL.',
    assignedIsolation: 'standard',
    precautionReviewRequired: false,
    isolationStatus: 'active',
    isolationRoom: 'غرفة 305 - إجراءات قياسية',
    antiMicrobialTherapy: 'Piperacillin/Tazobactam 4.5g IV q8h',
    sourceInvestigationNotes: 'تم إيقاف القسطرة البولية بناءً على مراجعة الضرورة اليومية واستخدام التبول الطبيعي بدعم تمريضي.',
    status: 'confirmed_hai',
    confirmedBy: 'د. زياد الحربي',
    confirmedDate: '2025-09-21'
  },
  {
    id: 'hai-004',
    caseNumber: 'HAI-2025-004',
    patientId: 'p-006',
    patientMrn: 'MRN-44229',
    patientName: 'حمد ناصر الدوسري',
    patientAge: 71,
    patientPopulation: 'adult',
    wardDepartment: 'العناية المركزة (ICU)',
    bedNumber: 'ICU-Bed-04',
    haiType: 'vae', // Adult setting uses VAE protocol
    surveillanceProfileId: 'SURV-NHSN-VAE-ADULT-2025',
    surveillanceProfileVersion: 'January 2025 Release',
    devicePresent: true,
    deviceType: 'mechanical_ventilator',
    deviceInsertionDate: '2025-09-15',
    deviceDaysAtEvent: 6,
    eventDate: '2025-09-21',
    organism: {
      name: 'Acinetobacter baumannii (MDR)',
      category: 'gram_negative',
      mdroClassification: 'CR-Acinetobacter',
      resistancePhenotype: 'مقاوم للكاربابينيمات والأمينوغليكوزيدات، حساس للكولستين'
    },
    specimenSource: 'شفط إفرازات القصبة الهوائية العميق (Endotracheal Aspirate)',
    nhsnCriteriaMet: true,
    nhsnCriteriaSummary: 'تنفس صناعي لأكثر من يومين، تدهور مؤشرات FiO2/PEEP، وحرارة مع مزرعة قصبية إيجابية بأسينتوباكتر.',
    assignedIsolation: 'contact',
    precautionReviewRequired: true,
    isolationStatus: 'active',
    isolationRoom: 'غرفة عزل هوائي/تلامس مدمج - سرير 4',
    antiMicrobialTherapy: 'Colistin IV + Tigecycline IV بالتنسيق مع الصيدلة السريرية',
    sourceInvestigationNotes: 'ترصد وبائي استشاري. فصل التشخيص السريري عن تصنيف الترصد الوبائي VAE.',
    status: 'confirmed_hai',
    confirmedBy: 'د. زياد الحربي',
    confirmedDate: '2025-09-22'
  },
  {
    id: 'hai-003',
    caseNumber: 'HAI-2025-003',
    patientId: 'p-005',
    patientMrn: 'MRN-55118',
    patientName: 'سلطان ممدوح الشمري',
    patientAge: 49,
    patientPopulation: 'adult',
    wardDepartment: 'جناح التنويم الباطني 3A',
    bedNumber: '312-A',
    haiType: 'mdro_colonization_infection',
    surveillanceProfileId: 'SURV-NHSN-CLABSI-2025',
    surveillanceProfileVersion: 'January 2025 Release',
    devicePresent: false,
    eventDate: '2025-09-17',
    organism: {
      name: 'Methicillin-Resistant Staphylococcus aureus (MRSA)',
      category: 'gram_positive',
      mdroClassification: 'MRSA',
      resistancePhenotype: 'مقاوم للأوكساسيلين، إيجابي لمسحة الأنف السطحية فقط دون أعراض سريرية'
    },
    specimenSource: 'مسحة أنفية للمسح الاستقصائي للدخول (Nasal Surveillance Swab)',
    nhsnCriteriaMet: false,
    nhsnCriteriaSummary: 'استعمار جرثومي سطحي فقط دون وجود علامات سريرية أو خمج جهازي فعال (Colonization Only).',
    assignedIsolation: 'contact',
    precautionReviewRequired: true,
    isolationStatus: 'active',
    isolationRoom: 'غرفة 312 - عزل تلامس وقائي',
    antiMicrobialTherapy: 'لا يتطلب علاج جهازي بالمضادات، غسول أنفي وفق بروتوكول مكافحة العدوى',
    sourceInvestigationNotes: 'استعمار جرثومي لا يُحتسب ضمن إصابات العدوى المكتسبة (HAI) وفق ضوابط الترصد الوطنية والدولية.',
    status: 'colonization_only',
    confirmedBy: 'د. زياد الحربي',
    confirmedDate: '2025-09-18'
  }
];

// -----------------------------------------------------------------------------
// 10. OUTBREAK CLUSTERS (Not automatically declared outbreak)
// -----------------------------------------------------------------------------
export const INITIAL_OUTBREAK_CLUSTERS: OutbreakClusterRecord[] = [
  {
    id: 'cluster-001',
    clusterCode: 'CLUSTER-2025-01',
    title: 'ترصد عنقودي واستقصاء وبائي لحالات أسينتوباكتر المقاومة (CR-Acinetobacter) بالعناية المركزة',
    titleAr: 'استقصاء وبائي لعنقود حالات أسينتوباكتر بوماني المقاومة للكاربابينيم (ICU)',
    organismName: 'Acinetobacter baumannii (CRAB)',
    locationUnit: 'العناية المركزة (ICU - الأسرة 2، 4، 5)',
    detectedDate: '2025-09-18',
    totalCasesLinked: 3,
    attackRatePercent: 18.7,
    primaryTransmissionRoute: 'contact_cross_transmission',
    epidemicCurve: [
      { date: '2025-09-14', newCases: 1, cumulativeCases: 1 },
      { date: '2025-09-17', newCases: 0, cumulativeCases: 1 },
      { date: '2025-09-18', newCases: 1, cumulativeCases: 2 },
      { date: '2025-09-21', newCases: 1, cumulativeCases: 3 },
      { date: '2025-09-23', newCases: 0, cumulativeCases: 3 }
    ],
    lineListingPatientIds: ['p-002', 'p-006', 'p-008'],
    containmentActions: [
      'فصل وعزل الحالات الثلاث في منطقة محددة (Cohort Isolation) مع تمريض مخصص استشارياً',
      'تطهير بيئي مكثف بالبخار وبتقنية الأشعة فوق البنفسجية UV-C لجميع أسطح وأجهزة التنفس',
      'إجراء مسحات بيئية استقصائية وتكثيف تدقيق نظافة الأيدي'
    ],
    status: 'contained_monitoring'
  }
];

// -----------------------------------------------------------------------------
// 11. DEVICE SURVEILLANCE DENOMINATORS (Denominator Safety)
// -----------------------------------------------------------------------------
export const INITIAL_DEVICE_DENOMINATORS: DeviceSurveillanceDenominator[] = [
  {
    unitId: 'unit-icu',
    unitName: 'العناية المركزة للكبار (ICU)',
    period: 'سبتمبر 2025',
    profileId: 'SURV-NHSN-CLABSI-2025',
    centralLineDays: 420,
    clabsiCount: 1,
    clabsiRatePer1000: 2.38,
    urinaryCatheterDays: 380,
    cautiCount: 1,
    cautiRatePer1000: 2.63,
    ventilatorDays: 290,
    vapCount: 1,
    vapRatePer1000: 3.45,
    patientDaysTotal: 490
  },
  {
    unitId: 'unit-ward-3a',
    unitName: 'جناح التنويم الباطني (Ward 3A)',
    period: 'سبتمبر 2025',
    profileId: 'SURV-NHSN-CAUTI-2025',
    centralLineDays: 85,
    clabsiCount: 0,
    clabsiRatePer1000: 0.0,
    urinaryCatheterDays: 310,
    cautiCount: 1,
    cautiRatePer1000: 3.23,
    ventilatorDays: 0,
    vapCount: 0,
    vapRatePer1000: 'RATE_NOT_CALCULABLE', // Invariant: Zero vent days => RATE_NOT_CALCULABLE, not 0.00
    patientDaysTotal: 720
  }
];

// -----------------------------------------------------------------------------
// 12. HAND HYGIENE AUDIT SESSIONS (Recorded Observation Compliance)
// -----------------------------------------------------------------------------
export const INITIAL_HAND_HYGIENE_AUDITS: HandHygieneAuditSession[] = [
  {
    id: 'hha-001',
    auditDate: '2025-09-22 09:15',
    auditorName: 'د. زياد الحربي (CIC)',
    department: 'العناية المركزة (ICU)',
    professionalCategory: 'physician',
    moment: 'moment_1_before_patient',
    actionTaken: 'handrub_alcohol',
    isCompliant: true,
    notes: 'تعقيم كامل لليدين لمدة 25 ثانية قبل فحص المريض'
  },
  {
    id: 'hha-002',
    auditDate: '2025-09-22 09:20',
    auditorName: 'د. زياد الحربي (CIC)',
    department: 'العناية المركزة (ICU)',
    professionalCategory: 'nurse',
    moment: 'moment_2_before_aseptic',
    actionTaken: 'handwash_soap_water',
    isCompliant: true,
    notes: 'غسيل بالماء والصابون وارتداء قفازات معقمة قبل سحب عينة من الخط الشرياني'
  },
  {
    id: 'hha-003',
    auditDate: '2025-09-22 09:40',
    auditorName: 'د. زياد الحربي (CIC)',
    department: 'العناية المركزة (ICU)',
    professionalCategory: 'allied_health',
    moment: 'moment_3_after_body_fluid',
    actionTaken: 'gloves_without_hygiene',
    isCompliant: false, // Glove use alone does NOT count as hand hygiene!
    notes: 'نزع القفازات بعد تفريغ كيس البول دون تطهير اليدين بالكحول بعد النزع'
  },
  {
    id: 'hha-004',
    auditDate: '2025-09-22 10:10',
    auditorName: 'د. زياد الحربي (CIC)',
    department: 'جناح التنويم الباطني 3A',
    professionalCategory: 'physician',
    moment: 'moment_1_before_patient',
    actionTaken: 'missed_opportunity',
    isCompliant: false,
    notes: 'ملامسة المريض والسماعة الطبية دون استخدام المعقم الموجود عند الباب'
  },
  {
    id: 'hha-005',
    auditDate: '2025-09-22 10:25',
    auditorName: 'د. زياد الحربي (CIC)',
    department: 'جناح التنويم الباطني 3A',
    professionalCategory: 'nurse',
    moment: 'moment_4_after_patient',
    actionTaken: 'handrub_alcohol',
    isCompliant: true,
    notes: 'تطهير اليدين بالكحول فور الخروج من سرير المريض'
  }
];

// -----------------------------------------------------------------------------
// 13. CARE BUNDLE AUDITS (Configurable Measurement Profiles)
// -----------------------------------------------------------------------------
export const INITIAL_BUNDLE_AUDITS: CareBundleAuditItem[] = [
  {
    id: 'bndl-001',
    bundleType: 'clabsi_insertion',
    measurementProfileId: 'BUNDLE-CLABSI-ALL-OR-NOTHING',
    patientId: 'p-001',
    patientMrn: 'MRN-88421',
    unit: 'العناية المركزة (ICU)',
    auditDate: '2025-09-21',
    auditor: 'مها الزهراني (RN)',
    checklistElements: [
      { elementKey: 'hand_hygiene', elementTextAr: 'نظافة اليدين الدقيقة قبل وأثناء الإجراء', status: 'compliant' },
      { elementKey: 'max_barrier', elementTextAr: 'استخدام أقصى موانع التعقيم (جاون، قناع، قفازات معقمة)', status: 'compliant' },
      { elementKey: 'chlorhexidine', elementTextAr: 'تطهير الجلد بمحلول الكلورهيكسيدين مع الكحول', status: 'compliant' },
      { elementKey: 'site_selection', elementTextAr: 'اختيار الموقع التشريحي الأنسب (تجنب الفخذي)', status: 'compliant' },
      { elementKey: 'daily_review', elementTextAr: 'توثيق خطة المراجعة اليومية لضرورة بقاء القسطرة بالملف', status: 'compliant' }
    ],
    allElementsCompliant: true,
    compliancePercent: 100
  },
  {
    id: 'bndl-002',
    bundleType: 'cauti_maintenance',
    measurementProfileId: 'BUNDLE-CAUTI-ALL-OR-NOTHING',
    patientId: 'p-004',
    patientMrn: 'MRN-66219',
    unit: 'جناح التنويم الباطني 3A',
    auditDate: '2025-09-22',
    auditor: 'د. زياد الحربي (CIC)',
    checklistElements: [
      { elementKey: 'secure_tubing', elementTextAr: 'تثبيت أنبوب القسطرة على فخذ المريض', status: 'compliant' },
      { elementKey: 'unobstructed_flow', elementTextAr: 'انسيابية تدفق البول وعدم وجود التواءات بالأنبوب', status: 'compliant' },
      { elementKey: 'below_bladder', elementTextAr: 'إبقاء كيس جمع البول دائماً تحت مستوى المثانة', status: 'compliant' },
      { elementKey: 'closed_system', elementTextAr: 'الحفاظ على نظام التصريف مغلقاً معقم دون فصل الأنبوب', status: 'compliant' },
      { elementKey: 'daily_assessment', elementTextAr: 'التقييم اليومي لضرورة استمرار القسطرة', status: 'non_compliant' }
    ],
    allElementsCompliant: false,
    compliancePercent: 80
  }
];

// -----------------------------------------------------------------------------
// 14. CLINICAL SAFETY TRACERS
// -----------------------------------------------------------------------------
export const INITIAL_TRACERS: ClinicalSafetyTracer[] = [
  {
    id: 'trc-001',
    tracerType: 'medication_management',
    unit: 'طوارئ الكبار (ER)',
    tracerDate: '2025-09-18',
    surveyor: 'د. حنان الغامدي وأ. سارة العتيبي',
    findingsSummary: 'تتبع مسار دواء عالي الخطورة (Morphine Injection) من أمر الطبيب إلى الصرف والتخزين في خزانة المواد المقيدة وإعطاء المريض.',
    nonCompliantPoints: [
      'سجل المواد المقيدة ورقي ولا يتطابق توقيت تسجيل إتلاف الجرعة المتبقية مع eMAR.',
      'وجود أمبولة كلوريد بوتاسيوم مركز في صينية الطوارئ غير مميزة بملصق أحمر واضح.'
    ],
    immediateRemediation: 'إعادة أمبولة البوتاسيوم إلى الصيدلية المركزية وحظر تواجدها في صواني الطوارئ المفتوحة.',
    scorePercent: 88
  }
];

// -----------------------------------------------------------------------------
// 15. ACTIVITY LOGS (Synthetic Provenance Preview)
// -----------------------------------------------------------------------------
export const INITIAL_ACTIVITY_LOGS: QpsActivityLog[] = [
  {
    id: 'act-001',
    timestamp: '2025-09-20 14:00',
    actorName: 'د. حنان الغامدي',
    actorRole: 'مدير الجودة وسلامة المرضى (CPHQ)',
    action: 'تجهيز مرجع إبلاغ اصطناعي للمركز السعودي لسلامة المرضى (SPSC Reference)',
    domain: 'incident',
    referenceId: 'OVR-2025-0101',
    details: 'تم تجهيز ملف البلاغ وفق سياسة SPSC (نسخة 2025) للمراجعة الداخلية، دون تنفيذ أي إرسال خارجي فعلي.'
  },
  {
    id: 'act-002',
    timestamp: '2025-09-21 10:00',
    actorName: 'د. زياد الحربي',
    actorRole: 'استشاري مكافحة العدوى والترصد (CIC)',
    action: 'مراجعة معايير ترصد خمج دم القسطرة (NHSN CLABSI 2025)',
    domain: 'ipc',
    referenceId: 'HAI-2025-001',
    details: 'تأكيد المعايير لـ مريض العناية المركزة سرير 2 وتوصية عزل تلامس استشارية.'
  }
];

// -----------------------------------------------------------------------------
// 16. COMPREHENSIVE INITIAL STATE
// -----------------------------------------------------------------------------
export const INITIAL_QUALITY_SAFETY_STATE: QualitySafetyOpsState = {
  activePersona: QPS_PERSONAS[0],
  activeRiskMatrixProfile: DEFAULT_RISK_MATRIX_PROFILES[0],
  availableRiskMatrixProfiles: DEFAULT_RISK_MATRIX_PROFILES,
  sentinelCriteriaProfile: SPSC_SENTINEL_CRITERIA_PROFILE_2025,
  surveillanceProfiles: DEFAULT_SURVEILLANCE_PROFILES,
  incidents: INITIAL_INCIDENTS,
  risks: INITIAL_RISKS,
  capas: INITIAL_CAPAS,
  kpis: INITIAL_KPIS,
  pdcaProjects: INITIAL_PDCA_PROJECTS,
  haiCases: INITIAL_HAI_CASES,
  clusters: INITIAL_OUTBREAK_CLUSTERS,
  deviceDenominators: INITIAL_DEVICE_DENOMINATORS,
  handHygieneAudits: INITIAL_HAND_HYGIENE_AUDITS,
  bundleAudits: INITIAL_BUNDLE_AUDITS,
  tracers: INITIAL_TRACERS,
  activityLogs: INITIAL_ACTIVITY_LOGS
};
