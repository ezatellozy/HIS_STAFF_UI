import {
  PatientAccessRecord,
  DuplicateCheckMatch,
  AppointmentEntity,
  EncounterEntity,
  AdmissionRequestEntity,
  BedLocationEntity,
  CapacityOverviewMetrics,
  InternalTransferEntity,
  DischargeEntity,
  TemporaryLeaveEntity,
  TemporaryDiagnosticMovement,
  PatientMovementEvent,
  UnknownErPatientRecord
} from '../types/patientAccessAdt';

export const INITIAL_PATIENT_ACCESS_RECORDS: PatientAccessRecord[] = [
  {
    id: 'p-access-01',
    mrn: 'MRN-2026-0891',
    nationalId: '1092837465',
    fullNameAr: 'عبد الرحمن خالد الشمري',
    fullNameEn: 'Abdulrahman Khalid Al-Shammari',
    dob: '1984-05-14',
    gender: 'male',
    mobile: '0501234567',
    email: 'a.shammari@example.com',
    address: { city: 'الرياض', district: 'حي النخيل', street: 'شارع الأمير تركي' },
    emergencyContact: { name: 'فاطمة الشمري', relationship: 'الزوجة', mobile: '0559876543' },
    communicationPreference: 'sms',
    status: 'active',
    registeredAt: '2025-11-10 09:30',
    previousEncountersCount: 4,
    activeEncounterId: 'enc-2026-0101',
    administrativeAlerts: [
      {
        id: 'adm-alt-01',
        type: 'confidentiality_vip',
        title: 'تنبيه خصوصية إدارية (VIP)',
        message: 'يمنع مشاركة أو إفصاح بيانات الحضور أو التنويم هاتفياً دون إذن خطي معتمد من مكتب الإدارة.',
        severity: 'medium',
        createdAt: '2026-01-15',
        isAdministrative: true
      }
    ]
  },
  {
    id: 'p-access-02',
    mrn: 'MRN-2026-1042',
    nationalId: '1048291048',
    fullNameAr: 'سارة عبد الله العتيبي',
    fullNameEn: 'Sarah Abdullah Al-Otaibi',
    dob: '1992-09-22',
    gender: 'female',
    mobile: '0543219876',
    email: 's.otaibi@example.com',
    address: { city: 'الرياض', district: 'حي الملقا', street: 'طريق أنس بن مالك' },
    emergencyContact: { name: 'عبد الله العتيبي', relationship: 'الأب', mobile: '0508887766' },
    communicationPreference: 'whatsapp',
    status: 'active',
    registeredAt: '2026-02-01 11:20',
    previousEncountersCount: 2,
    activeEncounterId: 'enc-2026-0102',
    administrativeAlerts: []
  },
  {
    id: 'p-access-03',
    mrn: 'MRN-2026-0419',
    nationalId: '2049182736',
    fullNameAr: 'محمد أحمد علي السعيد',
    fullNameEn: 'Mohammed Ahmed Ali Al-Saeed',
    dob: '1976-11-03',
    gender: 'male',
    mobile: '0567788990',
    address: { city: 'الرياض', district: 'حي الياسمين', street: 'شارع القادسية' },
    emergencyContact: { name: 'أحمد السعيد', relationship: 'الابن', mobile: '0561122334' },
    communicationPreference: 'sms',
    status: 'active',
    registeredAt: '2024-08-19 14:00',
    previousEncountersCount: 8,
    activeEncounterId: 'enc-2026-0103',
    administrativeAlerts: [
      {
        id: 'adm-alt-02',
        type: 'duplicate_risk',
        title: 'تنبيه احتمالية تكرار ملف سابق',
        message: 'يوجد تشابه بالاسم الثلاثي مع ملف قديم (MRN-2021-0094)، تم التحقق وتأكيد استقلالية الهوية.',
        severity: 'low',
        createdAt: '2026-02-10',
        isAdministrative: true
      }
    ]
  },
  {
    id: 'p-access-04',
    mrn: 'MRN-2026-1550',
    passportNo: 'P89201948',
    fullNameAr: 'جون دو (زائر)',
    fullNameEn: 'John Doe (Visitor)',
    dob: '1988-03-12',
    gender: 'male',
    mobile: '0599900112',
    address: { city: 'الرياض', district: 'فندق الفيصلية', street: 'طريق الملك فهد' },
    emergencyContact: { name: 'السفارة / شركة التأمين الدولي', relationship: 'ضامن معتمد', mobile: '0112345678' },
    communicationPreference: 'email',
    status: 'active',
    registeredAt: '2026-03-01 08:15',
    previousEncountersCount: 1,
    activeEncounterId: 'enc-2026-0104',
    administrativeAlerts: [
      {
        id: 'adm-alt-03',
        type: 'payer_restriction',
        title: 'متطلبات تفويض مالي وتأمين دولي',
        message: 'مطلوب موافقة شركة التأمين المسبقة لأي إجراء تنويم أو تدخل جراحي مخطط.',
        severity: 'high',
        createdAt: '2026-03-01',
        isAdministrative: true
      }
    ]
  },
  {
    id: 'p-access-05',
    mrn: 'TEMP-ER-2026-09-082',
    fullNameAr: 'مجهول الهوية - حادث طريق الملك سلمان',
    fullNameEn: 'Unidentified Male - Trauma ER',
    dob: '1995-01-01', // Estimated
    gender: 'male',
    mobile: '0000000000',
    address: { city: 'الرياض', district: 'موقع الحادث' },
    emergencyContact: { name: 'الهلال الأحمر السعودي / طاقم الإسعاف', relationship: 'المسعف المنقول عبره', mobile: '997' },
    communicationPreference: 'sms',
    status: 'temporary_unidentified',
    isTemporaryUnknown: true,
    temporaryTag: 'TRAUMA-RED-04',
    registeredAt: '2026-09-13 08:45',
    previousEncountersCount: 0,
    activeEncounterId: 'enc-2026-0105',
    administrativeAlerts: [
      {
        id: 'adm-alt-04',
        type: 'identity_warning',
        title: 'ملف طوارئ مؤقت لمجهول الهوية',
        message: 'تم إنشاء الملف برقم مؤقت للإنقاذ الفوري. يلزم مطابقة البصمة أو الهوية الوطنية لاحقاً عند استقرار الحالة.',
        severity: 'high',
        createdAt: '2026-09-13',
        isAdministrative: true
      }
    ]
  },
  {
    id: 'p-access-06',
    mrn: 'MRN-2026-3301',
    nationalId: '1083920194',
    fullNameAr: 'نورة عبد العزيز السالم',
    fullNameEn: 'Noura Abdulaziz Al-Salem',
    dob: '1996-03-15',
    gender: 'female',
    mobile: '0551122334',
    email: 'n.salem@example.com',
    address: { city: 'الرياض', district: 'حي الغدير', street: 'شارع السيل الكبير' },
    emergencyContact: { name: 'فهد السالم', relationship: 'الزوج', mobile: '0559988776' },
    communicationPreference: 'sms',
    status: 'active',
    registeredAt: '2026-09-15 10:00',
    previousEncountersCount: 1,
    activeEncounterId: 'enc-2026-0106',
    administrativeAlerts: []
  },
  {
    id: 'p-newborn-01',
    mrn: 'MRN-2026-9011',
    fullNameAr: 'وليد نورة السالم (1)',
    fullNameEn: 'Newborn 1 of Noura Al-Salem',
    dob: '2026-09-17 04:15',
    gender: 'male',
    mobile: '0551122334', // Mother's contact
    address: { city: 'الرياض', district: 'حي الغدير' },
    emergencyContact: { name: 'نورة عبد العزيز السالم', relationship: 'الأم', mobile: '0551122334' },
    communicationPreference: 'sms',
    status: 'active',
    isNewborn: true,
    motherPatientId: 'p-access-06',
    motherMrn: 'MRN-2026-3301',
    motherNameAr: 'نورة عبد العزيز السالم',
    multipleBirthIndicator: true,
    birthOrder: 1,
    temporaryNewbornNamingContext: 'وليد نورة السالم - 1',
    identityAmbiguityWarning: 'تنبيه تشابه الهوية (توأم أ): يجب التحقق من سوار التعريف الثنائي وبصمة القدم ورقم الملف المستقل (MRN-2026-9011)',
    identificationVerificationContext: 'تمت مطابقة سوار الوليد مع سوار الأم وبصمة القدم في جناح الولادة (L&D)',
    registeredAt: '2026-09-17 04:20',
    previousEncountersCount: 0,
    activeEncounterId: 'enc-2026-0107',
    administrativeAlerts: [
      {
        id: 'adm-nb-01',
        type: 'identity_warning',
        title: 'ملف وليد مستقل - ولادة متعددة (توأم أ)',
        message: 'ملف طبي منفصل برقم مستقل تماماً عن رقم الأم. الاسم الرسمي ورقم الهوية الوطنية يصدران لاحقاً عبر الأحوال المدنية.',
        severity: 'medium',
        createdAt: '2026-09-17',
        isAdministrative: true
      }
    ]
  },
  {
    id: 'p-newborn-02',
    mrn: 'MRN-2026-9012',
    fullNameAr: 'وليد نورة السالم (2)',
    fullNameEn: 'Newborn 2 of Noura Al-Salem',
    dob: '2026-09-17 04:22',
    gender: 'female',
    mobile: '0551122334', // Mother's contact
    address: { city: 'الرياض', district: 'حي الغدير' },
    emergencyContact: { name: 'نورة عبد العزيز السالم', relationship: 'الأم', mobile: '0551122334' },
    communicationPreference: 'sms',
    status: 'active',
    isNewborn: true,
    motherPatientId: 'p-access-06',
    motherMrn: 'MRN-2026-3301',
    motherNameAr: 'نورة عبد العزيز السالم',
    multipleBirthIndicator: true,
    birthOrder: 2,
    temporaryNewbornNamingContext: 'وليد نورة السالم - 2',
    identityAmbiguityWarning: 'تنبيه تشابه الهوية (توأم ب): يجب التحقق من سوار التعريف الثنائي وبصمة القدم ورقم الملف المستقل (MRN-2026-9012)',
    identificationVerificationContext: 'تمت مطابقة سوار الوليد مع سوار الأم وبصمة القدم في جناح الولادة (L&D)',
    registeredAt: '2026-09-17 04:25',
    previousEncountersCount: 0,
    activeEncounterId: 'enc-2026-0108',
    administrativeAlerts: [
      {
        id: 'adm-nb-02',
        type: 'identity_warning',
        title: 'ملف وليد مستقل - ولادة متعددة (توأم ب)',
        message: 'ملف طبي منفصل برقم مستقل تماماً عن رقم الأم. الاسم الرسمي ورقم الهوية الوطنية يصدران لاحقاً عبر الأحوال المدنية.',
        severity: 'medium',
        createdAt: '2026-09-17',
        isAdministrative: true
      }
    ]
  }
];

export const MOCK_DUPLICATE_CHECK_CANDIDATE: DuplicateCheckMatch = {
  existingPatient: INITIAL_PATIENT_ACCESS_RECORDS[2], // محمد أحمد علي السعيد
  similarityScore: 88,
  matchingFields: [
    {
      field: 'fullNameAr',
      labelAr: 'الاسم الكامل باللغة العربية',
      existingVal: 'محمد أحمد علي السعيد',
      candidateVal: 'محمد أحمد علي السعيد',
      isExact: true
    },
    {
      field: 'dob',
      labelAr: 'تاريخ الميلاد',
      existingVal: '1976-11-03',
      candidateVal: '1976-11-03',
      isExact: true
    },
    {
      field: 'mobile',
      labelAr: 'رقم الجوال المسجل',
      existingVal: '0567788990',
      candidateVal: '0567788995',
      isExact: false
    },
    {
      field: 'nationalId',
      labelAr: 'رقم الهوية الوطنية',
      existingVal: '2049182736',
      candidateVal: '2049182736',
      isExact: true
    }
  ],
  reviewStatus: 'pending'
};

export const INITIAL_APPOINTMENTS: AppointmentEntity[] = [
  {
    id: 'apt-01',
    appointmentNumber: 'APT-2026-4401',
    patientId: 'p-access-01',
    mrn: 'MRN-2026-0891',
    patientNameAr: 'عبد الرحمن خالد الشمري',
    clinicId: 'c-cardio',
    clinicNameAr: 'عيادة أمراض القلب التخصصية',
    doctorId: 'doc-01',
    doctorNameAr: 'د. فيصل العتيبي',
    scheduledTime: '2026-09-13 09:30',
    durationMinutes: 30,
    status: 'checked_in',
    bookingSource: 'patient_portal',
    reason: 'متابعة ألم بالصدر واختبار إجهاد',
    notes: 'مريض محول من الرعاية الأولية',
    arrivalRecordedAt: '2026-09-13 09:12',
    checkInRecordedAt: '2026-09-13 09:16'
  },
  {
    id: 'apt-02',
    appointmentNumber: 'APT-2026-4402',
    patientId: 'p-access-02',
    mrn: 'MRN-2026-1042',
    patientNameAr: 'سارة عبد الله العتيبي',
    clinicId: 'c-im',
    clinicNameAr: 'عيادة الباطنية العامة',
    doctorId: 'doc-02',
    doctorNameAr: 'د. سارة المنصور',
    scheduledTime: '2026-09-13 10:00',
    durationMinutes: 20,
    status: 'arrived',
    bookingSource: 'call_center',
    reason: 'ارتفاع في سكر الدم واضطراب هضمي',
    arrivalRecordedAt: '2026-09-13 09:48'
  },
  {
    id: 'apt-03',
    appointmentNumber: 'APT-2026-4403',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    clinicId: 'c-ortho',
    clinicNameAr: 'عيادة جراحة العظام',
    doctorId: 'doc-03',
    doctorNameAr: 'د. خالد القحطاني',
    scheduledTime: '2026-09-13 10:30',
    durationMinutes: 30,
    status: 'confirmed',
    bookingSource: 'reception_desk',
    reason: 'فحص ما بعد جراحة الركبة'
  },
  {
    id: 'apt-04',
    appointmentNumber: 'APT-2026-4404',
    patientId: 'p-access-04',
    mrn: 'MRN-2026-1550',
    patientNameAr: 'جون دو (زائر)',
    clinicId: 'c-neuro',
    clinicNameAr: 'عيادة المخ والأعصاب',
    doctorId: 'doc-04',
    doctorNameAr: 'د. ماجد السبيعي',
    scheduledTime: '2026-09-13 11:00',
    durationMinutes: 30,
    status: 'booked',
    bookingSource: 'referral',
    reason: 'صداع نصفي مستمر'
  }
];

export const INITIAL_ENCOUNTERS: EncounterEntity[] = [
  {
    id: 'enc-2026-0101',
    encounterNumber: 'ENC-OPD-9921',
    type: 'opd',
    status: 'in_progress',
    patientId: 'p-access-01',
    mrn: 'MRN-2026-0891',
    patientNameAr: 'عبد الرحمن خالد الشمري',
    startedAt: '2026-09-13 09:16',
    serviceName: 'طب القلب التداخلي',
    department: 'opd',
    currentLocation: {
      facility: 'مستشفى إدينا الرئيسي',
      building: 'مبنى العيادات التخصصية',
      floor: 'الدور الثاني',
      unit: 'عيادات القلب',
      room: 'غرفة استشارة 204'
    },
    responsibleTeam: 'فريق أمراض القلب التخصصي',
    attendingPhysician: 'د. فيصل العتيبي',
    originatingAppointmentId: 'apt-01'
  },
  {
    id: 'enc-2026-0102',
    encounterNumber: 'ENC-ER-4109',
    type: 'er',
    status: 'in_progress',
    patientId: 'p-access-02',
    mrn: 'MRN-2026-1042',
    patientNameAr: 'سارة عبد الله العتيبي',
    startedAt: '2026-09-13 08:30',
    serviceName: 'طب الطوارئ والحوادث',
    department: 'er',
    currentLocation: {
      facility: 'مستشفى إدينا الرئيسي',
      building: 'المبنى الرئيسي',
      floor: 'الدور الأرضي',
      unit: 'طوارئ الباطنية الحادة',
      room: 'منطقة الملاحظة',
      bed: 'سرير ER-06'
    },
    responsibleTeam: 'طاقم طوارئ الفترة الصباحية',
    attendingPhysician: 'د. عمر الفاروق'
  },
  {
    id: 'enc-2026-0103',
    encounterNumber: 'ENC-IPD-3042',
    type: 'inpatient',
    status: 'in_progress',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    startedAt: '2026-09-10 14:00',
    serviceName: 'الجراحة العامة والمناظير',
    department: 'ipd',
    currentLocation: {
      facility: 'مستشفى إدينا الرئيسي',
      building: 'برج التنويم الطبي',
      floor: 'الدور الرابع',
      unit: 'جناح الجراحة العامة (رجال)',
      room: 'غرفة 412',
      bed: 'سرير 412-A'
    },
    responsibleTeam: 'فريق الجراحة العامة 2',
    attendingPhysician: 'د. خالد القحطاني'
  },
  {
    id: 'enc-2026-0105',
    encounterNumber: 'ENC-ER-TRAUMA-004',
    type: 'er',
    status: 'in_progress',
    patientId: 'p-access-05',
    mrn: 'TEMP-ER-2026-09-082',
    patientNameAr: 'مجهول الهوية - حادث طريق الملك سلمان',
    startedAt: '2026-09-13 08:45',
    serviceName: 'إنعاش الإصابات والحوادث',
    department: 'er',
    currentLocation: {
      facility: 'مستشفى إدينا الرئيسي',
      building: 'المبنى الرئيسي',
      floor: 'الدور الأرضي',
      unit: 'غرفة الإنعاش الرضحي (Resuscitation Bay)',
      room: 'Bay 1',
      bed: 'Resus-01'
    },
    responsibleTeam: 'فريق كود الإصابات الرضحية (Trauma Code Team)',
    attendingPhysician: 'د. ريان النجدي'
  }
];

export const INITIAL_ADMISSION_REQUESTS: AdmissionRequestEntity[] = [
  {
    id: 'adm-req-01',
    requestNumber: 'ADMR-2026-0182',
    patientId: 'p-access-02',
    mrn: 'MRN-2026-1042',
    patientNameAr: 'سارة عبد الله العتيبي',
    patientGender: 'female',
    patientAge: 32,
    sourceDepartment: 'er',
    requestedService: 'الباطنية الحادة (Internal Medicine)',
    requestedCareLevel: 'step_down',
    urgency: 'urgent',
    requestStatus: 'under_review',
    placementStatus: 'unassigned',
    isolationRequired: false,
    equipmentRequirements: ['مضخة تسريب وريدي', 'جهاز قياس سكر مستمر'],
    clinicalSummaryRef: 'حماض كيتوني سكري (DKA) تحت المعالجة مع استجابة تدريجية للأنسولين الوريدي.',
    encounterId: 'enc-2026-0102',
    submittedAt: '2026-09-13 09:20',
    expectedArrival: '2026-09-13 11:30',
    coordinationTeam: 'مكتب تنسيق القبول والتنويم المركزي'
  },
  {
    id: 'adm-req-02',
    requestNumber: 'ADMR-2026-0183',
    patientId: 'p-access-05',
    mrn: 'TEMP-ER-2026-09-082',
    patientNameAr: 'مجهول الهوية - حادث طريق الملك سلمان',
    patientGender: 'male',
    patientAge: 30,
    sourceDepartment: 'er',
    requestedService: 'العناية المركزة الجراحية (SICU)',
    requestedCareLevel: 'icu',
    urgency: 'stat',
    requestStatus: 'accepted',
    placementStatus: 'bed_reserved',
    plannedUnitId: 'unit-icu-01',
    plannedUnitName: 'العناية المركزة الجراحية (SICU)',
    plannedBedId: 'bed-icu-04',
    plannedBedNumber: 'ICU-Bed-04',
    isolationRequired: true,
    isolationType: 'protective',
    equipmentRequirements: ['جهاز تنفس اصطناعي (Mechanical Ventilator)', 'مراقبة ضغط دم شرياني مستمر'],
    clinicalSummaryRef: 'إصابة دماغية رضية وصدمة نزفية غير مستقرة تستلزم إنعاشاً مكثفاً ومراقبة شريانية.',
    encounterId: 'enc-2026-0105',
    submittedAt: '2026-09-13 09:05',
    expectedArrival: '2026-09-13 10:15',
    coordinationTeam: 'طاقم التنسيق الطبي العاجل'
  },
  {
    id: 'adm-req-03',
    requestNumber: 'ADMR-2026-0184',
    patientId: 'p-access-04',
    mrn: 'MRN-2026-1550',
    patientNameAr: 'جون دو (زائر)',
    patientGender: 'male',
    patientAge: 38,
    sourceDepartment: 'opd',
    requestedService: 'المخ والأعصاب (Neurology)',
    requestedCareLevel: 'general_ward',
    urgency: 'routine',
    requestStatus: 'submitted',
    placementStatus: 'unassigned',
    isolationRequired: false,
    equipmentRequirements: ['تخطيط دماغ مستمر EEG'],
    clinicalSummaryRef: 'تنويم مبرمج لإجراء فحوصات وتصوير رنين مغناطيسي وتخطيط دماغ مطول.',
    encounterId: 'enc-2026-0104',
    submittedAt: '2026-09-13 08:30',
    expectedArrival: '2026-09-13 13:00',
    coordinationTeam: 'مكتب تنسيق القبول والتنويم'
  }
];

export const INITIAL_BED_LOCATIONS: BedLocationEntity[] = [
  // Ward 4 - Surgery
  {
    id: 'bed-w4-01',
    bedNumber: '401-A',
    roomNumber: '401',
    unitId: 'unit-ward-4',
    unitName: 'جناح الجراحة العامة (الدور 4)',
    floor: 'الدور 4',
    building: 'برج التنويم الطبي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'available',
    bedType: 'standard',
    genderSuitability: 'male',
    housekeepingStatus: 'clean',
    equipment: ['مأخذ أكسجين جداري', 'جرس استدعاء تمريض']
  },
  {
    id: 'bed-w4-02',
    bedNumber: '401-B',
    roomNumber: '401',
    unitId: 'unit-ward-4',
    unitName: 'جناح الجراحة العامة (الدور 4)',
    floor: 'الدور 4',
    building: 'برج التنويم الطبي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'cleaning',
    bedType: 'standard',
    genderSuitability: 'male',
    housekeepingStatus: 'cleaning_in_progress',
    housekeepingEstimatedDone: 'خلال 20 دقيقة',
    equipment: ['مأخذ أكسجين جداري']
  },
  {
    id: 'bed-w4-03',
    bedNumber: '412-A',
    roomNumber: '412',
    unitId: 'unit-ward-4',
    unitName: 'جناح الجراحة العامة (الدور 4)',
    floor: 'الدور 4',
    building: 'برج التنويم الطبي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'occupied',
    bedType: 'standard',
    genderSuitability: 'male',
    currentPatientId: 'p-access-03',
    currentPatientName: 'محمد أحمد علي السعيد',
    currentMrn: 'MRN-2026-0419',
    currentEncounterId: 'enc-2026-0103',
    housekeepingStatus: 'clean',
    equipment: ['مضخة تسريب وريدي']
  },
  {
    id: 'bed-w4-04',
    bedNumber: '412-B',
    roomNumber: '412',
    unitId: 'unit-ward-4',
    unitName: 'جناح الجراحة العامة (الدور 4)',
    floor: 'الدور 4',
    building: 'برج التنويم الطبي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'blocked',
    bedType: 'standard',
    genderSuitability: 'male',
    housekeepingStatus: 'delayed',
    equipment: [],
    housekeepingEstimatedDone: 'صيانة قفل الباب وضغط الهواء'
  },
  // Ward 3 - Internal Medicine (Female)
  {
    id: 'bed-w3-01',
    bedNumber: '305-A',
    roomNumber: '305',
    unitId: 'unit-ward-3',
    unitName: 'جناح الباطنية (نساء - الدور 3)',
    floor: 'الدور 3',
    building: 'برج التنويم الطبي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'available',
    bedType: 'telemetry',
    genderSuitability: 'female',
    housekeepingStatus: 'clean',
    equipment: ['شاشة مراقبة علامات حيوية عن بعد', 'مضخة تسريب']
  },
  {
    id: 'bed-w3-02',
    bedNumber: '305-B',
    roomNumber: '305',
    unitId: 'unit-ward-3',
    unitName: 'جناح الباطنية (نساء - الدور 3)',
    floor: 'الدور 3',
    building: 'برج التنويم الطبي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'reserved',
    bedType: 'standard',
    genderSuitability: 'female',
    plannedPatientId: 'p-access-02',
    plannedPatientName: 'سارة عبد الله العتيبي',
    plannedMrn: 'MRN-2026-1042',
    housekeepingStatus: 'clean',
    equipment: ['مأخذ أكسجين']
  },
  // ICU Beds
  {
    id: 'bed-icu-01',
    bedNumber: 'ICU-Bed-01',
    roomNumber: 'Room-01',
    unitId: 'unit-icu-01',
    unitName: 'العناية المركزة الجراحية (SICU)',
    floor: 'الدور 2',
    building: 'المبنى الرئيسي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'occupied',
    bedType: 'icu_ventilator',
    genderSuitability: 'any',
    housekeepingStatus: 'clean',
    equipment: ['جهاز تنفس اصطناعي متقدم', 'مضخات حقن سيرنج عدد 4', 'شاشة مراقبة شريانية']
  },
  {
    id: 'bed-icu-02',
    bedNumber: 'ICU-Bed-02',
    roomNumber: 'Room-02',
    unitId: 'unit-icu-01',
    unitName: 'العناية المركزة الجراحية (SICU)',
    floor: 'الدور 2',
    building: 'المبنى الرئيسي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'occupied',
    bedType: 'icu_ventilator',
    genderSuitability: 'any',
    housekeepingStatus: 'clean',
    equipment: ['جهاز تنفس اصطناعي', 'غسيل كلى مستمر CRRT']
  },
  {
    id: 'bed-icu-04',
    bedNumber: 'ICU-Bed-04',
    roomNumber: 'Room-04',
    unitId: 'unit-icu-01',
    unitName: 'العناية المركزة الجراحية (SICU)',
    floor: 'الدور 2',
    building: 'المبنى الرئيسي',
    facility: 'مستشفى إدينا الرئيسي',
    state: 'assigned',
    bedType: 'icu_ventilator',
    genderSuitability: 'any',
    plannedPatientId: 'p-access-05',
    plannedPatientName: 'مجهول الهوية - حادث طريق الملك سلمان',
    plannedMrn: 'TEMP-ER-2026-09-082',
    housekeepingStatus: 'clean',
    equipment: ['جهاز تنفس اصطناعي جاهز ومعاير', 'شاشة مؤشرات حيوية مركزية'],
    isNegativePressure: true
  }
];

export const INITIAL_CAPACITY_METRICS: CapacityOverviewMetrics = {
  totalOperationalBeds: 120,
  occupiedBeds: 98,
  availableBeds: 12,
  reservedBeds: 4,
  assignedBeds: 3,
  cleaningTurnoverBeds: 2,
  blockedMaintenanceBeds: 1,
  incomingExpectedAdmissions: 7,
  expectedDischargesToday: 9,
  occupancyPercent: 81.6
};

export const INITIAL_INTERNAL_TRANSFERS: InternalTransferEntity[] = [
  {
    id: 'trf-01',
    transferNumber: 'TRF-2026-0041',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    currentEncounterId: 'enc-2026-0103',
    sourceUnit: 'جناح الجراحة العامة (الدور 4)',
    sourceBed: 'سرير 412-A',
    destinationUnit: 'العناية المركزة الجراحية (SICU)',
    destinationBed: 'ICU-Bed-03',
    urgency: 'urgent',
    reason: 'تدهور تشبع الأكسجين وارتفاع مؤشرات الالتهاب مع اشتباه انصمام رئوي جزئي.',
    status: 'ready_for_transport',
    transportStatus: 'requested',
    handoverRefId: 'handover-sbar-trf-01',
    handoverStatus: 'drafted',
    requestedAt: '2026-09-13 09:35',
    transportTeamNotes: 'يلزم نقالة مجهزة باسطوانة أكسجين ومرافق تمريضي.'
  },
  {
    id: 'trf-02',
    transferNumber: 'TRF-2026-0042',
    patientId: 'p-access-02',
    mrn: 'MRN-2026-1042',
    patientNameAr: 'سارة عبد الله العتيبي',
    currentEncounterId: 'enc-2026-0102',
    sourceUnit: 'طوارئ الباطنية الحادة (ER)',
    sourceBed: 'سرير ER-06',
    destinationUnit: 'جناح الباطنية (نساء - الدور 3)',
    destinationBed: 'سرير 305-B',
    urgency: 'urgent',
    reason: 'استكمال علاج السكري والمتابعة التنويمية بعد استقرار مؤشرات الطوارئ.',
    status: 'accepted',
    transportStatus: 'planned',
    handoverRefId: 'handover-sbar-trf-02',
    handoverStatus: 'received_acknowledged',
    requestedAt: '2026-09-13 09:10'
  },
  {
    id: 'trf-03',
    transferNumber: 'TRF-2026-0039',
    patientId: 'p-access-01',
    mrn: 'MRN-2026-0891',
    patientNameAr: 'عبد الرحمن خالد الشمري',
    currentEncounterId: 'enc-2026-0101',
    sourceUnit: 'طوارئ الباطنية (ER)',
    sourceBed: 'سرير ER-02',
    destinationUnit: 'جناح الباطنية العام (رجال)',
    destinationBed: 'سرير 310-B',
    urgency: 'urgent',
    reason: 'استقرار المؤشرات الحيوية بعد النزيف الهضمي والتنويم بالقسم الداخلي',
    status: 'completed',
    transportStatus: 'arrived',
    handoverRefId: 'handover-sbar-trf-03',
    handoverStatus: 'received_acknowledged',
    requestedAt: '2026-09-12 11:20',
    completedAt: '2026-09-12 12:45',
    transportTeamNotes: 'تم الوصول واستلام السرير التنويمي'
  }
];

export const INITIAL_DIAGNOSTIC_MOVEMENTS: import('../types/patientAccessAdt').TemporaryDiagnosticMovement[] = [
  {
    id: 'diag-mov-01',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    currentEncounterId: 'enc-2026-0103',
    inpatientUnit: 'جناح الجراحة العامة (الدور 4)',
    inpatientBed: '412-A',
    diagnosticDestination: 'قسم الأشعة التشخيصية - الرنين المغناطيسي (MRI)',
    reason: 'تصوير رنين مغناطيسي للبطن والقنوات الصفراوية (MRCP)',
    status: 'departed',
    bedRetentionPolicy: 'retain_bed',
    departedAt: '2026-09-17 08:30',
    arrivedAt: '2026-09-17 08:45',
    expectedReturnAt: '2026-09-17 10:15'
  }
];

export const INITIAL_DISCHARGES: DischargeEntity[] = [
  {
    id: 'dis-01',
    encounterId: 'enc-2026-0088',
    patientId: 'p-access-01',
    mrn: 'MRN-2026-0891',
    patientNameAr: 'عبد الرحمن خالد الشمري',
    unitName: 'جناح الباطنية العام (رجال)',
    bedNumber: '310-B',
    expectedDischargeDate: '2026-09-13',
    status: 'ready',
    readiness: {
      medicationReconciliationDone: true,
      dischargeNoteApproved: true,
      dischargeSummaryNoteRef: 'NOTE-DIS-2026-091',
      nursingDischargeChecklistDone: true,
      patientEducationCompleted: true,
      followUpAppointmentBooked: true,
      transportArranged: true,
      equipmentArranged: false,
      pendingConsultsOrResults: 0,
      financialAdministrativeClearance: true
    },
    disposition: 'home',
    destinationDetails: 'المنزل مع موعد مراجعة بعد أسبوعين في عيادة الباطنية'
  },
  {
    id: 'dis-02',
    encounterId: 'enc-2026-0089',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    unitName: 'جناح الجراحة العامة (الدور 4)',
    bedNumber: '412-A',
    expectedDischargeDate: '2026-09-13',
    status: 'delayed',
    readiness: {
      medicationReconciliationDone: false, // Pending med rec!
      dischargeNoteApproved: false,
      nursingDischargeChecklistDone: false,
      patientEducationCompleted: false,
      followUpAppointmentBooked: false,
      transportArranged: false,
      equipmentArranged: false,
      pendingConsultsOrResults: 2,
      financialAdministrativeClearance: false
    },
    closureNotes: 'تأخر الخروج بسبب طلب استشارة قلبية طارئة قبل مغادرة المستشفى.'
  }
];

export const INITIAL_TEMPORARY_LEAVE: TemporaryLeaveEntity[] = [
  {
    id: 'leave-01',
    encounterId: 'enc-2026-0092',
    patientId: 'p-access-04',
    mrn: 'MRN-2026-1550',
    patientNameAr: 'جون دو (زائر)',
    leaveType: 'compassionate',
    approvedBy: 'د. ماجد السبيعي (استشاري المخ والأعصاب)',
    startDateTime: '2026-09-13 14:00',
    expectedReturnDateTime: '2026-09-13 19:00',
    status: 'approved',
    notes: 'إذن مغادرة مؤقتة لمدة 5 ساعات لحضور موعد قانوني بالسفارة مع تعهد الالتزام بالأدوية والعودة قبل 7 مساءً.'
  }
];

export const INITIAL_TEMPORARY_DIAGNOSTIC_MOVEMENTS: TemporaryDiagnosticMovement[] = [
  {
    id: 'diag-mov-01',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    currentEncounterId: 'enc-2026-0103',
    inpatientUnit: 'جناح الجراحة العامة',
    inpatientBed: 'سرير 412-A',
    diagnosticDestination: 'قسم الأشعة التشخيصية - الرنين المغناطيسي MRI',
    reason: 'فحص رنين مغناطيسي للقنوات الصفراوية (MRCP) بعد العملية',
    status: 'scheduled',
    bedRetentionPolicy: 'retain_bed',
    expectedReturnAt: '2026-09-13 16:30'
  }
];

export const INITIAL_MOVEMENT_EVENTS: PatientMovementEvent[] = [
  {
    id: 'mov-01',
    encounterId: 'enc-2026-0103',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    timestamp: '2026-09-10 14:00',
    eventType: 'registration',
    actorName: 'سعود المالكي',
    actorRole: 'موظف استقبال وتسجيل',
    note: 'تسجيل دخول وتأكيد بيانات الهوية الوطنية والتأمين الطبي.'
  },
  {
    id: 'mov-02',
    encounterId: 'enc-2026-0103',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    timestamp: '2026-09-10 14:25',
    eventType: 'admission',
    fromLocation: 'مكتب الدخول والتنويم',
    toLocation: 'جناح الجراحة العامة - غرفة 412 - سرير 412-A',
    actorName: 'منى العسيري',
    actorRole: 'منسق القبول وتوزيع الأسرّة',
    reason: 'تنويم مبرمج لجراحة استئصال المرارة بالمنظار'
  },
  {
    id: 'mov-03',
    encounterId: 'enc-2026-0103',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    timestamp: '2026-09-11 08:30',
    eventType: 'internal_transfer',
    fromLocation: 'جناح الجراحة 412-A',
    toLocation: 'غرفة العمليات OR-3',
    actorName: 'طاقم نقل المرضى',
    actorRole: 'فريق النقل الداخلي',
    reason: 'نقل للعمليات لإجراء الجراحة المجدولة'
  },
  {
    id: 'mov-04',
    encounterId: 'enc-2026-0103',
    patientId: 'p-access-03',
    mrn: 'MRN-2026-0419',
    patientNameAr: 'محمد أحمد علي السعيد',
    timestamp: '2026-09-11 11:45',
    eventType: 'internal_transfer',
    fromLocation: 'غرفة الإفاقة PACU',
    toLocation: 'جناح الجراحة 412-A',
    actorName: 'تمريض الإفاقة',
    actorRole: 'طاقم تمريضي',
    reason: 'استقرار الحالة بعد الجراحة والعودة للسرير التنويمي'
  }
];

export const INITIAL_UNKNOWN_ER_PATIENTS: UnknownErPatientRecord[] = [
  {
    temporaryId: 'TEMP-ER-2026-09-082',
    temporaryNameAr: 'مجهول الهوية - حادث طريق الملك سلمان',
    estimatedAge: 30,
    estimatedGender: 'male',
    traumaTagNumber: 'TRAUMA-RED-04',
    arrivalTime: '2026-09-13 08:45',
    incidentLocation: 'طريق الملك سلمان مخرج 7',
    status: 'unidentified_active'
  }
];
