export type StaffRole = 'reception' | 'doctor' | 'nurse' | 'admin';

export interface StaffUser {
  id: string;
  name: string;
  nameEn: string;
  role: StaffRole;
  assignedRoles?: StaffRole[];
  title: string;
  department: string;
  avatar: string;
  licenseNo: string;
  activeClinicId?: string;
}

export interface Clinic {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  roomNo: string;
  doctorId: string;
  doctorName: string;
  doctorNameEn: string;
  specialty: string;
  specialtyEn: string;
  icon: string;
  currentToken?: string;
  totalWaiting: number;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. MRN-88421
  name?: string; // Optional alias for fullNameAr
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  gender: 'male' | 'female';
  dob: string;
  age: number;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  bloodGroup?: string; // Optional alias for bloodType
  phone: string;
  email: string;
  address: string;
  insuranceProvider: string;
  insurancePolicyNo: string;
  policyNumber?: string; // Optional alias for insurancePolicyNo
  insuranceClass: 'A' | 'B' | 'VIP' | 'Cash';
  insuranceCoveragePercent: number; // e.g. 80 for 80% coverage
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  chronicConditions: string[];
  chronicDiseases?: string[];
  allergies: string[];
  registeredAt: string;
}

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number; // bpm
  temp: number; // Celsius
  respiratoryRate: number; // bpm
  spo2: number; // %
  bloodGlucose?: number; // mg/dL
  painScore: number; // 0-10
  recordedAt: string;
  recordedBy: string;
  triageLevel: 'level_1_resuscitation' | 'level_2_emergent' | 'level_3_urgent' | 'level_4_less_urgent' | 'level_5_non_urgent';
  news2Score: number; // National Early Warning Score
  triageNotes?: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'arrived'
  | 'checked_in'
  | 'no_show'
  | 'triage_pending'
  | 'triage_completed'
  | 'with_doctor'
  | 'lab_pending'
  | 'completed'
  | 'cancelled';

export interface BillingTransaction {
  id: string; // e.g. TXN-2026-9041
  appointmentId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  clinicId: string;
  clinicName: string;
  doctorName: string;
  receiptNo: string; // e.g. REC-8812
  timestamp: string;
  consultationFee: number;
  insuranceDiscount: number;
  patientCoPay: number;
  paymentMethod: 'mada' | 'visa' | 'cash' | 'apple_pay' | 'insurance_direct';
  paymentReference: string;
  cashierName: string;
  status: 'completed' | 'refunded' | 'pending';
  invoiceType: 'opd_consultation' | 'er_admission' | 'procedure';
  nphiesClaimRef?: string;
}

export interface Appointment {
  id: string;
  ticketNo: string; // e.g. CARD-102
  patientId: string;
  clinicId: string;
  doctorId: string;
  appointmentTime: string;
  type: 'routine' | 'walkin' | 'emergency' | 'followup';
  status: AppointmentStatus;
  priority: 'normal' | 'elderly' | 'child' | 'emergency';
  chiefComplaint: string;
  paymentStatus: 'paid' | 'pending' | 'exempt';
  consultationFee: number;
  patientCoPay: number;
  vitals?: Vitals;
  calledAt?: string;
  arrivedAt?: string;
  transactionId?: string;
  transaction?: BillingTransaction;
  consultationStartedAt?: string;
  consultationEndedAt?: string;
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  genericName: string;
  dose: string;
  form: 'قرص (Tablet)' | 'كبسولة (Capsule)' | 'شراب (Syrup)' | 'حقن (Injection)' | 'بخاخ (Inhaler)' | 'مرهم (Ointment)';
  route: 'Oral' | 'IV' | 'IM' | 'SC' | 'Inhalation' | 'Topical';
  frequency: string;
  duration: string;
  instructions: string;
  hasAllergyAlert?: boolean;
}

export interface LabOrder {
  id: string;
  patientId: string;
  appointmentId: string;
  testCode: string;
  testNameAr: string;
  testNameEn: string;
  category: 'hematology' | 'biochemistry' | 'radiology' | 'microbiology' | 'cardiology';
  priority: 'routine' | 'stat';
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'result_ready';
  orderedAt: string;
  orderedBy: string;
  sampleCollectedAt?: string;
  collectedByNurse?: string;
  resultValue?: string;
  referenceRange?: string;
  unit?: string;
  interpretation?: 'normal' | 'high' | 'low' | 'critical';
}

export interface ConsultationRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  createdAt: string;
  // SOAP Framework
  subjective: string; // Chief complaint & HPI
  objective: string; // Physical exam findings
  assessment: string; // Clinical diagnosis
  plan: string; // Treatment plan
  icd10Codes: Array<{ code: string; titleAr: string; titleEn: string }>;
  prescriptions: PrescriptionItem[];
  labOrders: LabOrder[];
  disposition: 'discharge' | 'admit_inpatient' | 'refer_specialty' | 'follow_up_needed';
  dispositionDetails?: string;
  followUpDate?: string;
}

export interface NursingRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  nurseName: string;
  timestamp: string;
  // SBAR
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  completedProcedures: string[];
}

export interface MARItem {
  id: string;
  patientId: string;
  appointmentId: string;
  medicationName: string;
  dose: string;
  route: string;
  scheduledTime: string;
  administeredTime?: string;
  administeredBy?: string;
  status: 'pending' | 'administered' | 'held' | 'refused';
  notes?: string;
  // CBAHI High-Alert & Dual Nurse Check
  isHighAlert?: boolean;
  highAlertCategory?: 'Insulin' | 'Anticoagulant' | 'Opioid' | 'Electrolyte' | 'Chemo';
  dualNurseVerified?: boolean;
  secondNurseName?: string;
}

// -------------------------------------------------------------
// HL7 FHIR R4 STANDARDS INTEROPERABILITY TYPES
// -------------------------------------------------------------
export interface FhirResourceMetadata {
  resourceType: 'Patient' | 'Encounter' | 'Observation' | 'Condition' | 'MedicationRequest' | 'ServiceRequest' | 'Bundle' | 'Coverage';
  id: string;
  meta: {
    versionId: string;
    lastUpdated: string;
    profile?: string[];
  };
}

// -------------------------------------------------------------
// NPHIES (National Platform for Health Information Exchange Services)
// -------------------------------------------------------------
export interface NphiesEligibility {
  status: 'eligible' | 'ineligible' | 'pending' | 'restricted';
  inquiryId: string;
  verificationTimestamp: string;
  payerName: string;
  tpaName?: string; // Third Party Administrator
  policyNumber: string;
  memberId: string;
  coveragePlan: string;
  class: 'VIP' | 'Class A' | 'Class B' | 'Standard';
  patientCoPayPercent: number;
  maxAnnualBenefit: number;
  remainingBenefit: number;
  isPreAuthRequired: boolean;
  limitations?: string[];
}

export interface NphiesPreAuth {
  id: string;
  preAuthRefNumber: string; // e.g. NPH-PA-2026-90412
  patientId: string;
  appointmentId: string;
  serviceCode: string; // SBS / CPT / ACHI code e.g. SBS-93306 (Echocardiogram)
  serviceName: string;
  category: 'radiology' | 'laboratory' | 'procedure' | 'specialized_rx';
  status: 'approved' | 'pending_payer' | 'rejected' | 'auto_approved';
  requestedAmount: number;
  approvedAmount: number;
  patientShare: number;
  requestedAt: string;
  decisionAt?: string;
  payerResponseNotes?: string;
  medicalJustification: string;
}

export interface NphiesClaim {
  id: string;
  claimRefNumber: string; // e.g. NPH-CLM-2026-00481
  appointmentId: string;
  patientId: string;
  submissionDate: string;
  totalClaimAmount: number;
  payerNetShare: number;
  patientNetShare: number;
  scrubbingStatus: 'passed' | 'warning' | 'rejected_by_rules';
  nphiesTransmissionStatus: 'queued' | 'transmitted' | 'adjudicated' | 'paid';
  adjudicationNotes?: string;
}

// -------------------------------------------------------------
// CBAHI & JCI ACCREDITATION & PATIENT SAFETY STANDARDS
// -------------------------------------------------------------
export interface CbahiPatientSafety {
  // Goal 1: Two Patient Identifiers
  twoIdentifiersChecked: boolean; // Name + MRN / National ID
  identifierCheckedAt?: string;
  identifierCheckedBy?: string;
  // Goal 2: Fall Risk Screening (Morse Fall Scale)
  fallRiskScore: number; // 0-125
  fallRiskCategory: 'low' | 'moderate' | 'high';
  fallRiskInterventions?: string[];
  // Goal 3: Critical Lab Result Communication (15-Minute Read-Back Rule)
  criticalValueReported?: boolean;
  criticalValueReadBackConfirmed?: boolean;
  readBackConfirmedAt?: string;
  // Goal 4: Pain Assessment
  painScore: number; // 0-10
  painLocation?: string;
}

export interface OvrReport {
  id: string;
  reportNumber: string; // OVR-2026-104
  incidentDate: string;
  incidentType: 'medication_error' | 'patient_fall' | 'id_mismatch' | 'clinical_delay' | 'equipment_defect' | 'near_miss';
  severity: 'near_miss_no_harm' | 'minor_harm' | 'major_harm' | 'sentinel_event';
  patientId?: string;
  location: string;
  description: string;
  immediateActionTaken: string;
  reportedByStaff: string;
  staffRole: StaffRole;
  status: 'under_investigation' | 'closed_corrective_action' | 'reviewed_by_safety_board';
}

// -------------------------------------------------------------
// ENTERPRISE CLINICAL DEPARTMENTS (ER, IPD/WARDS, ICU, OR)
// -------------------------------------------------------------
export type HospitalDepartment = 'opd' | 'er' | 'ipd' | 'icu' | 'or' | 'lifecycle' | 'standards';

export type ErTriageLevel = 1 | 2 | 3 | 4 | 5;

export interface ErPatient {
  id: string;
  patientId: string;
  mrn: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female';
  triageLevel: ErTriageLevel; // 1=Resuscitation, 2=Emergent, 3=Urgent, 4=Less Urgent, 5=Non-Urgent
  triageColor: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  arrivalTime: string;
  arrivalMode: 'ambulance' | 'walk_in' | 'wheelchair' | 'police_escort';
  chiefComplaint: string;
  assignedArea: 'resus_bay' | 'acute_trauma' | 'cubicle' | 'fast_track';
  bedNo: string;
  attendingDoctor: string;
  primaryNurse: string;
  vitals: Vitals;
  doorToDocMinutes: number;
  status: 'triaged' | 'in_treatment' | 'awaiting_labs' | 'decision_admit' | 'discharged' | 'transferred_icu' | 'transferred_or';
  statOrders: string[];
  gcs: number;
}

export type WardId = 'ward_medical_3a' | 'ward_surgical_3b' | 'ward_pediatric_2c' | 'ward_vip_4a';

export interface WardBed {
  id: string;
  wardId: WardId;
  wardNameAr: string;
  wardNameEn: string;
  bedNumber: string; // e.g. '301-A', '302-B', 'VIP-401'
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'isolation_contact' | 'isolation_airborne';
  patientId?: string;
  patientName?: string;
  mrn?: string;
  age?: number;
  gender?: 'male' | 'female';
  admitDate?: string;
  attendingPhysician?: string;
  diagnosis?: string;
  diet?: 'Regular' | 'Diabetic' | 'NPO' | 'Low Sodium' | 'Renal';
  fallRisk?: 'low' | 'moderate' | 'high';
  ivFluids?: string;
  admissionId?: string;
}

export interface InpatientAdmission {
  id: string;
  patientId: string;
  bedId: string;
  admitDate: string;
  admittingDoctor: string;
  wardNameAr: string;
  diagnosisAr: string;
  diet: string;
  progressNotes: Array<{
    id: string;
    timestamp: string;
    doctorName: string;
    note: string;
  }>;
}

export type IcuBedOperationalState = 'occupied' | 'available' | 'reserved' | 'cleaning' | 'maintenance' | 'blocked';

export interface IcuBed {
  id: string;
  bedNo: string; // 'ICU-Bed-01'
  bedStatus?: IcuBedOperationalState; // 'occupied' | 'available' | 'reserved' | 'cleaning' | 'maintenance' | 'blocked'
  reservedFor?: string; // e.g. "حالة جراحة قلب مفتوح OR-1"
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'male' | 'female';
  diagnosis: string;
  admitDays: number;
  attendingIntensivist: string;
  primaryNurse: string;
  gcsScore: number; // 3-15
  sofaScore: number; // 0-24
  apacheScore: number;
  isolationPrecaution?: 'airborne' | 'contact' | 'droplet' | 'protective' | null;
  linesAndDrains?: string[]; // e.g. ["Arterial Line (Rt Radial)", "Central Line (Rt IJ)", "Chest Tube", "Foley"]
  expectedTransition?: string; // e.g. "تخفيض إلى باطنة 3A"
  hemodynamics: {
    map: number; // Mean Arterial Pressure mmHg (Normal 70-100)
    cvp: number; // Central Venous Pressure mmHg (Normal 2-8)
    hr: number; // Heart Rate
    spo2: number; // %
    artLineBp: string; // e.g. "118/68"
    rhythm: string; // e.g. "Sinus Rhythm", "Sinus Tachycardia", "Atrial Fib"
  };
  ventilator: {
    isVentilated: boolean;
    mode?: 'SIMV' | 'PRVC' | 'CPAP/PS' | 'BiPAP' | 'High-Flow Nasal';
    fio2?: number; // % (21-100)
    peep?: number; // cmH2O (5-15)
    tidalVolume?: number; // mL (350-550)
    respiratoryRateSet?: number;
  };
  infusions: Array<{
    drug: string;
    rate: string;
    category: 'vasopressor' | 'sedative' | 'analgesic' | 'inotrope';
  }>;
  alerts: string[];
}

export interface SurgeryCase {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  theatreNo: string; // e.g. 'OR-1 جراحة القلب والصدر'
  theatreCode: 'OR-1' | 'OR-2' | 'OR-3' | 'OR-4';
  procedureNameAr: string;
  procedureNameEn: string;
  leadSurgeon: string;
  anesthesiologist: string;
  scrubNurse: string;
  scheduledTime: string;
  status: 'scheduled' | 'holding_preop' | 'in_theatre' | 'pacu_recovery' | 'completed';
  anesthesiaType: 'General Endotracheal' | 'Spinal Subarachnoid' | 'Epidural' | 'Regional Block' | 'MAC Sedation';
  asaClassification: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA E (Emergency)';
  whoChecklist: {
    signIn: boolean; // Before induction of anesthesia
    timeOut: boolean; // Before skin incision
    signOut: boolean; // Before leaving operating room
  };
  spongeNeedleCountVerified: boolean;
  aldreteScore?: number; // Post-Anesthesia Recovery (0-10)
  dispositionTarget?: 'Surgical Ward 3B' | 'ICU' | 'Day Surgery Discharge';
}

// -------------------------------------------------------------
// PATIENT FULL LIFECYCLE & INTEGRATED CLINICAL PATHWAY (END-TO-END CYCLE)
// -------------------------------------------------------------
export type LifecycleStageKey =
  | 'reception'
  | 'triage'
  | 'consultation'
  | 'diagnostics'
  | 'pharmacy'
  | 'ward_ipd'
  | 'or_surgery'
  | 'icu_critical'
  | 'discharge_clearance';

export interface LifecycleStageStep {
  key: LifecycleStageKey;
  titleAr: string;
  titleEn: string;
  dept: HospitalDepartment | 'pharmacy' | 'laboratory' | 'billing';
  descriptionAr: string;
  status: 'completed' | 'in_progress' | 'pending' | 'not_required';
  timestamp?: string;
  summaryText?: string;
  badge?: string;
}

export interface PatientLifecycleState {
  patient: Patient;
  currentStage: LifecycleStageKey;
  activeLocation: string;
  isAdmitted: boolean;
  steps: LifecycleStageStep[];
  activeWardBed?: WardBed;
  activeIcuBed?: IcuBed;
  activeSurgeryCase?: SurgeryCase;
  activeErCase?: ErPatient;
  activeAppointment?: Appointment;
  latestConsultation?: ConsultationRecord;
  dischargedAt?: string;
  billingStatus: 'pending' | 'cleared' | 'insurance_adjudicated';
}

// -------------------------------------------------------------
// CLINICAL PROGRESS NOTES & TEMPLATES (MULTIDISCIPLINARY EMR)
// -------------------------------------------------------------
export type ClinicalNoteRole = 'doctor' | 'nurse' | 'allied' | 'pharmacy';

export type ProgressNoteType =
  | 'soap'
  | 'sbar'
  | 'ward_round'
  | 'general'
  | 'procedure'
  | 'discharge'
  | 'pharmacy'
  | 'multidisciplinary';

export interface ProgressNote {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorRole: ClinicalNoteRole;
  authorRoleTitleAr: string;
  department: string;
  timestamp: string;
  title: string;
  noteType: ProgressNoteType;
  content: string;
  isAddendum?: boolean;
  tags?: string[];
}

export interface ProgressNoteTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  category: ClinicalNoteRole | 'general';
  defaultNoteType: ProgressNoteType;
  content: string;
  descriptionAr: string;
  isCustom?: boolean;
  createdBy?: string;
}

