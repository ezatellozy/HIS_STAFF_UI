import { HospitalDepartment, StaffRole } from '../types/his';

export interface HisSecurityGroup {
  id: string;
  nameAr: string;
  nameEn: string;
  shortCode: string;
  category: 'clinical' | 'nursing' | 'access' | 'critical' | 'surgical' | 'governance';
  descriptionAr: string;
  descriptionEn: string;
  defaultDepartment: HospitalDepartment;
  defaultRole: StaffRole;
  suggestedStaffId: string;
  badgeColor: string;
  iconType: string;
  keyWorkflowsAr: string[];
}

export const HIS_SECURITY_GROUPS: HisSecurityGroup[] = [
  {
    id: 'group_patient_access',
    nameAr: 'الاستقبال وقبول المرضى وإصدار التذاكر',
    nameEn: 'Patient Access & Admissions (ADT)',
    shortCode: 'ACCESS-ADT',
    category: 'access',
    descriptionAr: 'مسؤوليات تسجيل المرضى، إصدار تذاكر صالات الانتظار، التحقق من أهلية التأمين NPHIES، وتسجيل الحضور (Check-in).',
    descriptionEn: 'Registration, MPI search, appointment scheduling, insurance verification and arrival check-in.',
    defaultDepartment: 'opd',
    defaultRole: 'reception',
    suggestedStaffId: 'staff-rec-1',
    badgeColor: 'emerald',
    iconType: 'UserCheck',
    keyWorkflowsAr: [
      'البحث والتسجيل في السجل المركزي (MPI)',
      'تسجيل حضور المواعيد اليومية (Arrival Check-in)',
      'التحقق من أهلية وباقات التأمين عبر منصة نفيس (NPHIES)',
      'إصدار أرقام التذاكر والتحكم في شاشات الصالات (Queue Display)'
    ]
  },
  {
    id: 'group_medical_staff',
    nameAr: 'الكادر الطبي واستشاريو العيادات',
    nameEn: 'Medical Staff & Attending Physicians (OPD)',
    shortCode: 'MED-PHYSICIAN',
    category: 'clinical',
    descriptionAr: 'استدعاء المرضى من طابور العيادة، توثيق الكشف السريري (SOAP)، ترميز التشخيص ICD-10، وطلب الفحوصات والروشتة الإلكترونية.',
    descriptionEn: 'Clinic queue management, SOAP clinical charting, ICD-10 coding, CPOE lab orders, and e-prescriptions.',
    defaultDepartment: 'opd',
    defaultRole: 'doctor',
    suggestedStaffId: 'staff-doc-cardio',
    badgeColor: 'blue',
    iconType: 'Stethoscope',
    keyWorkflowsAr: [
      'نداء المريض من صالة الانتظار وبدء الاستشارة الطبية',
      'التوثيق الطبي السريري وفق منهجية (SOAP Note)',
      'الترميز الطبي المعتمد (ICD-10-CM)',
      'إصدار الروشتات الإلكترونية وطلبات التحاليل CPOE'
    ]
  },
  {
    id: 'group_clinical_nursing',
    nameAr: 'التمريض السريري والفرز وقياس العلامات',
    nameEn: 'Clinical Triage & Nursing Care (OPD/Wards)',
    shortCode: 'NURSE-TRIAGE',
    category: 'nursing',
    descriptionAr: 'فرز المرضى، تسجيل العلامات الحيوية وحساب مؤشر الإنذار المبكر (NEWS2)، إعطاء الأدوية (eMAR)، وتسليم النوبات (SBAR).',
    descriptionEn: 'Clinical triage, vital signs entry, NEWS2 scoring, eMAR medication administration, and SBAR handover.',
    defaultDepartment: 'opd',
    defaultRole: 'nurse',
    suggestedStaffId: 'staff-nurse-triage',
    badgeColor: 'teal',
    iconType: 'HeartPulse',
    keyWorkflowsAr: [
      'تسجيل العلامات الحيوية (BP, HR, RR, Temp, SpO2, Pain)',
      'حساب مقياس الإنذار المبكر البريطاني (NEWS2)',
      'توثيق إعطاء الجرعات الدوائية بسجل (eMAR)',
      'تسليم وتسلم النوبات التمريضية ببروتوكول (SBAR)'
    ]
  },
  {
    id: 'group_emergency_medicine',
    nameAr: 'طب الطوارئ والحوادث والإنعاش السريع',
    nameEn: 'Emergency Medicine & Resuscitation (ED/ER)',
    shortCode: 'EMERG-ER',
    category: 'critical',
    descriptionAr: 'الفرز الكندي السريع (CTAS Levels 1-5)، إدارة غرف الإنعاش والصدمات، طلبات التحاليل الفورية STAT، وقرارات التنويم.',
    descriptionEn: 'CTAS Canadian triage, resuscitation bays, STAT lab orders, and rapid emergency disposition.',
    defaultDepartment: 'er',
    defaultRole: 'doctor',
    suggestedStaffId: 'staff-doc-er',
    badgeColor: 'rose',
    iconType: 'Siren',
    keyWorkflowsAr: [
      'الفرز الكندي للطوارئ خماسي المستويات (CTAS 1-5)',
      'الإنعاش القلبي والرئوي بغرف الصدمات (Resus Bay)',
      'طلبات الفحوصات والأشعة الإسعافية العاجلة (STAT Orders)',
      'اتخاذ قرار التنويم الفوري أو التخريج السريع'
    ]
  },
  {
    id: 'group_inpatient_care',
    nameAr: 'أجنحة التنويم الداخلي وإدارة الأسرة',
    nameEn: 'Inpatient Care & Bed Management (IPD)',
    shortCode: 'INPAT-IPD',
    category: 'clinical',
    descriptionAr: 'متابعة نزلاء الأجنحة الداخلية، تسكين الأسرة الشاغرة، إدارة الحميات والوجبات الغذائية، ومتابعة خطر السقوط والتخريج.',
    descriptionEn: 'Ward census, bed assignment, clinical nutrition, fall risk assessment, and discharge planning.',
    defaultDepartment: 'ipd',
    defaultRole: 'doctor',
    suggestedStaffId: 'staff-doc-ward',
    badgeColor: 'indigo',
    iconType: 'Bed',
    keyWorkflowsAr: [
      'لوحة استيعاب وإشغال الأسرة بالأجنحة (Bed Census Board)',
      'تسكين المرضى المحولين من الطوارئ والعيادات بالسرير المناسب',
      'تقييم مخاطر السقوط ومتابعة السوائل الوريدية والوجبات',
      'توثيق تطور الحالة اليومي وخطة التخريج الطبي'
    ]
  },
  {
    id: 'group_critical_care_icu',
    nameAr: 'العناية المركزة والحالات الحرجة (ICU)',
    nameEn: 'Intensive Care Unit (ICU Intensivist)',
    shortCode: 'ICU-CRITICAL',
    category: 'critical',
    descriptionAr: 'متابعة المرضى الحرجين، أجهزة التنفس الصناعي (Ventilator)، مضخات المحاليل الدقيقة، ومؤشرات الخطورة (SOFA & APACHE II).',
    descriptionEn: 'Critical care telemetry, mechanical ventilation, precision infusions, and organ failure scoring.',
    defaultDepartment: 'icu',
    defaultRole: 'doctor',
    suggestedStaffId: 'staff-doc-icu',
    badgeColor: 'purple',
    iconType: 'Activity',
    keyWorkflowsAr: [
      'مراقبة المؤشرات الحيوية متعددة القنوات (Multi-parameter Telemetry)',
      'ضبط ومتابعة أجهزة التنفس الصناعي (Mechanical Ventilation)',
      'حساب مقياس فشل الأعضاء المتسلسل (SOFA Score)',
      'متابعة الخطوط الشريانية والوريدية المركزية (Central Lines)'
    ]
  },
  {
    id: 'group_surgical_services',
    nameAr: 'مسارح العمليات وجراحة اليوم الواحد',
    nameEn: 'Surgical Services & Operating Theatres (OR)',
    shortCode: 'SURG-OR',
    category: 'surgical',
    descriptionAr: 'قائمة منظمة الصحة العالمية لأمان الجراحة (Sign In, Time Out, Sign Out)، سجلات التخدير وتصنيف ASA، ومقياس الإفاقة Aldrete.',
    descriptionEn: 'WHO Surgical Safety Checklist, anaesthesia charting, ASA classification, and PACU Aldrete recovery scoring.',
    defaultDepartment: 'or',
    defaultRole: 'doctor',
    suggestedStaffId: 'staff-doc-or',
    badgeColor: 'amber',
    iconType: 'Scissors',
    keyWorkflowsAr: [
      'تطبيق قائمة منظمة الصحة العالمية لأمان الجراحة (WHO 3-Phases)',
      'التوثيق التخديري وتصنيف جمعية أطباء التخدير (ASA Class)',
      'إدارة أوقات مسارح العمليات وحالات الطوارئ الجراحية',
      'تقييم جهوزية الخروج من الإفاقة بمقياس (Aldrete Recovery Score)'
    ]
  },
  {
    id: 'group_health_informatics',
    nameAr: 'المعلوماتية الصحية وإدارة الجودة والمعايير',
    nameEn: 'Health Informatics & Standards Governance (HIM)',
    shortCode: 'HIM-STANDARDS',
    category: 'governance',
    descriptionAr: 'فحص وتصدير حزم معايير HL7 FHIR R4، إدارة مطالبات وموافقات منصة نفيس (NPHIES)، ومطابقة سباهي CBAHI وتسجيل تقارير OVR.',
    descriptionEn: 'HL7 FHIR R4 Bundle generation, NPHIES claims & pre-auth gateway, CBAHI quality indicators, and incident reporting.',
    defaultDepartment: 'standards',
    defaultRole: 'admin',
    suggestedStaffId: 'staff-admin',
    badgeColor: 'cyan',
    iconType: 'ShieldCheck',
    keyWorkflowsAr: [
      'توليد وفحص حزم التبادل الصحي الدولي (HL7 FHIR R4 Bundles)',
      'التحقق من الأهلية والموافقات المسبقة بمنصة نفيس (NPHIES)',
      'تسجيل ومتابعة تقارير حوادث السلامة والأخطاء الوشيكة (OVR Incident)',
      'تدقيق ومطابقة معايير الاعتماد الوطني للمستشفيات (CBAHI Standards)'
    ]
  }
];
