import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StaffRole,
  StaffUser,
  Clinic,
  Patient,
  Appointment,
  Vitals,
  LabOrder,
  MARItem,
  ConsultationRecord,
  PrescriptionItem,
  HospitalDepartment,
  ErPatient,
  WardBed,
  IcuBed,
  SurgeryCase,
  PatientLifecycleState,
  LifecycleStageKey,
  LifecycleStageStep,
  BillingTransaction,
  ProgressNote,
  ProgressNoteTemplate,
  ClinicalNoteRole
} from '../types/his';
import {
  MOCK_STAFF,
  MOCK_CLINICS,
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  MOCK_LAB_ORDERS,
  MOCK_MAR_ITEMS,
  MOCK_TRANSACTIONS
} from '../data/mockHisData';
import {
  INITIAL_ER_PATIENTS,
  INITIAL_WARD_BEDS,
  INITIAL_ICU_BEDS,
  INITIAL_SURGERY_CASES
} from '../data/mockEnterpriseData';
import { DEFAULT_NOTE_TEMPLATES, INITIAL_PROGRESS_NOTES } from '../data/progressNoteData';
import { HIS_SECURITY_GROUPS, HisSecurityGroup } from '../data/securityGroups';
import {
  playHospitalTone,
  announceEmergencyCodeSpeech,
  announceClearEmergencySpeech,
  announcePatientCallSpeech,
  speakAnnouncement
} from '../utils/audioAnnouncement';
import { EMERGENCY_CODES, HospitalEmergencyCode } from '../utils/emergencyCodes';
import {
  ClinicalWorkArea,
  ClinicalActivity,
  CareTransitionRequest,
  ClinicalTask,
  TransitionStatus,
  WorkspaceOriginState
} from '../types/clinicalWorkspace';
import {
  INITIAL_CARE_TRANSITIONS,
  INITIAL_CLINICAL_TASKS
} from '../data/mockClinicalWorkspaceData';

interface HisContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  activeSecurityGroupId: string;
  setActiveSecurityGroupId: (id: string) => void;
  activeSecurityGroup: HisSecurityGroup;
  securityGroups: HisSecurityGroup[];
  loginAsSecurityGroup: (groupId: string, staffId?: string, targetDept?: HospitalDepartment) => void;
  logout: () => void;
  isSwitchGroupModalOpen: boolean;
  setIsSwitchGroupModalOpen: (open: boolean) => void;
  currentDepartment: HospitalDepartment;
  setCurrentDepartment: (dept: HospitalDepartment) => void;
  currentRole: StaffRole;
  setCurrentRole: (role: StaffRole) => void;
  userAvailableRoles: StaffRole[];
  currentStaff: StaffUser;
  setCurrentStaff: (staff: StaffUser) => void;
  allStaff: StaffUser[];
  clinics: Clinic[];
  activeClinicId: string;
  setActiveClinicId: (id: string) => void;
  activeClinic: Clinic;
  patients: Patient[];
  appointments: Appointment[];
  labOrders: LabOrder[];
  marItems: MARItem[];
  consultations: Record<string, ConsultationRecord>;
  emergencyCode: string | null;
  emergencyCodeLocation: string;
  setEmergencyCode: (code: string | null, customLocation?: string) => void;
  triggerEmergencyCode: (code: string | null, customLocation?: string) => void;
  replayEmergencyCodeVoice: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  voiceAnnouncementEnabled: boolean;
  setVoiceAnnouncementEnabled: (enabled: boolean) => void;
  isSpeakingAnnouncement: boolean;
  isPublicQueueModalOpen: boolean;
  setIsPublicQueueModalOpen: (open: boolean) => void;
  playChime: (type?: 'call' | 'alert' | 'success', announceCode?: string) => void;
  announceCustomVoice: (arabicText: string, englishText?: string, type?: 'call' | 'alert' | 'success') => void;
  registerPatient: (patientData: Omit<Patient, 'id' | 'mrn' | 'registeredAt'>) => Patient;
  bookAppointment: (data: {
    patientId: string;
    clinicId: string;
    doctorId: string;
    priority: Appointment['priority'];
    chiefComplaint: string;
    type: Appointment['type'];
    consultationFee: number;
    patientCoPay: number;
    status?: Appointment['status'];
    appointmentTime?: string;
  }) => Appointment;
  checkInAppointment: (appointmentId: string) => void;
  markPatientArrived: (appointmentId: string) => void;
  markPatientNoShow: (appointmentId: string) => void;
  processCheckInTransaction: (
    appointmentId: string,
    data: {
      paymentMethod: BillingTransaction['paymentMethod'];
      paidAmount: number;
      paymentReference?: string;
      cashierName?: string;
      nphiesClaimRef?: string;
      waived?: boolean;
    }
  ) => BillingTransaction;
  transactions: BillingTransaction[];
  activeTransactionModalAppointmentId: string | null;
  setActiveTransactionModalAppointmentId: (id: string | null) => void;
  selectedReceiptTransaction: BillingTransaction | null;
  setSelectedReceiptTransaction: (txn: BillingTransaction | null) => void;
  callPatient: (appointmentId: string) => void;
  startConsultation: (appointmentId: string) => void;
  saveVitals: (appointmentId: string, vitals: Vitals) => void;
  saveConsultation: (record: ConsultationRecord) => void;
  addPrescriptionToConsultation: (appointmentId: string, rx: PrescriptionItem) => void;
  removePrescriptionFromConsultation: (appointmentId: string, rxId: string) => void;
  orderLab: (orderData: Omit<LabOrder, 'id' | 'orderedAt' | 'status' | 'orderedBy'>) => void;
  collectSample: (orderId: string) => void;
  administerMed: (marId: string, status: MARItem['status'], notes?: string) => void;
  completeAppointment: (appointmentId: string) => void;
  activeConsultationAppointmentId: string | null;
  setActiveConsultationAppointmentId: (id: string | null) => void;
  printPrescriptionData: { patient: Patient; consultation: ConsultationRecord; doctor: StaffUser } | null;
  setPrintPrescriptionData: (data: { patient: Patient; consultation: ConsultationRecord; doctor: StaffUser } | null) => void;
  viewPatientModalId: string | null;
  setViewPatientModalId: (patientId: string | null) => void;
  standardsModalState: {
    isOpen: boolean;
    patientId?: string;
    appointmentId?: string;
    initialTab?: 'fhir' | 'nphies' | 'cbahi';
  };
  openStandardsModal: (patientId?: string, appointmentId?: string, initialTab?: 'fhir' | 'nphies' | 'cbahi') => void;
  closeStandardsModal: () => void;

  // Clinical Progress Notes & Templates
  progressNotes: ProgressNote[];
  noteTemplates: ProgressNoteTemplate[];
  addProgressNote: (note: Omit<ProgressNote, 'id' | 'timestamp'>) => ProgressNote;
  saveNoteTemplate: (template: Omit<ProgressNoteTemplate, 'id'>) => ProgressNoteTemplate;
  deleteNoteTemplate: (templateId: string) => void;
  activeProgressNotesPatientId: string | null;
  setActiveProgressNotesPatientId: (patientId: string | null) => void;
  openProgressNotesModal: (patientId: string) => void;

  // Enterprise Departmental States & Actions
  erPatients: ErPatient[];
  addErPatient: (patientData: Omit<ErPatient, 'id' | 'arrivalTime' | 'doorToDocMinutes'>) => void;
  updateErPatientStatus: (id: string, status: ErPatient['status']) => void;
  wardBeds: WardBed[];
  updateBedStatus: (bedId: string, status: WardBed['status'], patientData?: Partial<WardBed>) => void;
  transferBed: (sourceBedId: string, targetBedId: string) => void;
  dischargeBed: (bedId: string) => void;
  icuBeds: IcuBed[];
  updateIcuVentilator: (bedId: string, vent: Partial<IcuBed['ventilator']>) => void;
  updateIcuInfusion: (bedId: string, drugIndex: number, newRate: string) => void;
  surgeryCases: SurgeryCase[];
  updateSurgeryStatus: (caseId: string, status: SurgeryCase['status']) => void;
  toggleWhoChecklist: (caseId: string, phase: 'signIn' | 'timeOut' | 'signOut') => void;
  updateAldreteScore: (caseId: string, score: number) => void;

  // Integrated Full Lifecycle Linking Actions
  admitPatientToWard: (
    patientId: string,
    bedId: string,
    details?: {
      diagnosis?: string;
      diet?: WardBed['diet'];
      fallRisk?: WardBed['fallRisk'];
      ivFluids?: string;
      attendingPhysician?: string;
    }
  ) => void;
  scheduleSurgery: (
    patientId: string,
    data: {
      procedureNameAr: string;
      procedureNameEn?: string;
      theatreCode: SurgeryCase['theatreCode'];
      leadSurgeon: string;
      anesthesiologist?: string;
      anesthesiaType?: SurgeryCase['anesthesiaType'];
      asaClassification?: SurgeryCase['asaClassification'];
      scheduledTime?: string;
    }
  ) => void;
  admitToIcu: (
    patientId: string,
    details?: {
      bedId?: string;
      diagnosis?: string;
      reason?: string;
      attendingIntensivist?: string;
    }
  ) => void;
  transferFromOr: (caseId: string, destination: 'ward' | 'icu', targetBedId?: string) => void;
  stepDownFromIcu: (icuBedId: string, targetWardBedId: string) => void;
  dischargePatientFullCycle: (
    patientId: string,
    details?: {
      dischargeSummary?: string;
      followUpDate?: string;
      clearanceNotes?: string;
    }
  ) => void;
  getPatientLifecycleState: (patientId: string) => PatientLifecycleState;
  isLifecycleModalOpen: boolean;
  setIsLifecycleModalOpen: (open: boolean) => void;
  selectedLifecyclePatientId: string | null;
  openLifecycleModal: (patientId?: string) => void;
  closeLifecycleModal: () => void;

  // Staff Clinical Experience & Universal Patient Workspace
  activeWorkArea: ClinicalWorkArea;
  setActiveWorkArea: (workArea: ClinicalWorkArea) => void;
  activeWorkspacePatientId: string | null;
  activeWorkspaceActivity: ClinicalActivity;
  workspaceOrigin: WorkspaceOriginState | null;
  openPatientWorkspace: (
    patientId: string,
    optionsOrActivity?:
      | ClinicalActivity
      | (Partial<WorkspaceOriginState> & {
          defaultActivity?: ClinicalActivity;
          originWorkArea?: ClinicalWorkArea;
        }),
    legacyOrigin?: { department?: ClinicalWorkArea; label?: string }
  ) => void;
  closePatientWorkspace: () => void;
  switchWorkspaceActivity: (activity: ClinicalActivity) => void;
  careTransitions: CareTransitionRequest[];
  clinicalTasks: ClinicalTask[];
  addCareTransition: (transition: Omit<CareTransitionRequest, 'id' | 'requestedAt' | 'status'>) => void;
  updateTransitionStatus: (
    transitionId: string,
    status: TransitionStatus,
    extra?: Partial<CareTransitionRequest>
  ) => void;
  completeClinicalTask: (taskId: string) => void;
}

const HisContext = createContext<HisContextType | undefined>(undefined);

export const HisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('his_is_auth');
    return saved !== null ? saved === 'true' : true;
  });
  const [activeSecurityGroupId, setActiveSecurityGroupId] = useState<string>(() => {
    return localStorage.getItem('his_active_sec_group') || 'group_patient_access';
  });
  const [activeStaffId, setActiveStaffId] = useState<string>(() => {
    return localStorage.getItem('his_active_staff_id') || 'staff-rec-1';
  });
  const [isSwitchGroupModalOpen, setIsSwitchGroupModalOpen] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<StaffRole>('reception');
  const [activeClinicId, setActiveClinicId] = useState<string>('clinic-cardio');
  const [clinics, setClinics] = useState<Clinic[]>(() => {
    const saved = localStorage.getItem('his_clinics');
    return saved ? JSON.parse(saved) : MOCK_CLINICS;
  });
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('his_patients');
    if (!saved) return MOCK_PATIENTS;
    try {
      const parsed: Patient[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(p => p.id));
      const existingMrns = new Set(parsed.map(p => p.mrn.toLowerCase()));
      const missing = MOCK_PATIENTS.filter(p => !existingIds.has(p.id) && !existingMrns.has(p.mrn.toLowerCase()));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return MOCK_PATIENTS;
    }
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('his_appointments');
    if (!saved) return MOCK_APPOINTMENTS;
    try {
      const parsed: Appointment[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(a => a.id));
      const missing = MOCK_APPOINTMENTS.filter(a => !existingIds.has(a.id));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return MOCK_APPOINTMENTS;
    }
  });
  const [labOrders, setLabOrders] = useState<LabOrder[]>(() => {
    const saved = localStorage.getItem('his_lab_orders');
    return saved ? JSON.parse(saved) : MOCK_LAB_ORDERS;
  });
  const [marItems, setMarItems] = useState<MARItem[]>(() => {
    const saved = localStorage.getItem('his_mar_items');
    return saved ? JSON.parse(saved) : MOCK_MAR_ITEMS;
  });
  const [consultations, setConsultations] = useState<Record<string, ConsultationRecord>>(() => {
    const saved = localStorage.getItem('his_consultations');
    return saved ? JSON.parse(saved) : {};
  });

  const [emergencyCode, setEmergencyCodeState] = useState<string | null>(null);
  const [emergencyCodeLocation, setEmergencyCodeLocation] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceAnnouncementEnabled, setVoiceAnnouncementEnabled] = useState<boolean>(true);
  const [isSpeakingAnnouncement, setIsSpeakingAnnouncement] = useState<boolean>(false);
  const [isPublicQueueModalOpen, setIsPublicQueueModalOpen] = useState<boolean>(false);
  const [activeConsultationAppointmentId, setActiveConsultationAppointmentId] = useState<string | null>('apt-202');
  const [activeTransactionModalAppointmentId, setActiveTransactionModalAppointmentId] = useState<string | null>(null);
  const [selectedReceiptTransaction, setSelectedReceiptTransaction] = useState<BillingTransaction | null>(null);
  const [transactions, setTransactions] = useState<BillingTransaction[]>(() => {
    const saved = localStorage.getItem('his_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });
  const [printPrescriptionData, setPrintPrescriptionData] = useState<{
    patient: Patient;
    consultation: ConsultationRecord;
    doctor: StaffUser;
  } | null>(null);
  const [viewPatientModalId, setViewPatientModalId] = useState<string | null>(null);
  const [standardsModalState, setStandardsModalState] = useState<{
    isOpen: boolean;
    patientId?: string;
    appointmentId?: string;
    initialTab?: 'fhir' | 'nphies' | 'cbahi';
  }>({ isOpen: false });

  // Enterprise Department State (OPD, ER, IPD, ICU, OR)
  const [currentDepartment, setCurrentDepartmentState] = useState<HospitalDepartment>(() => {
    const saved = localStorage.getItem('his_current_dept');
    return (saved as HospitalDepartment) || 'opd';
  });

  // Enterprise Work Area & Universal Workspace State
  const [activeWorkArea, setActiveWorkAreaState] = useState<ClinicalWorkArea>(() => {
    const saved = localStorage.getItem('his_active_work_area');
    return (saved as ClinicalWorkArea) || 'my_work';
  });

  const setActiveWorkArea = (workArea: ClinicalWorkArea) => {
    setActiveWorkAreaState(workArea);
    localStorage.setItem('his_active_work_area', workArea);
    if (workArea !== 'my_work') {
      setCurrentDepartmentState(workArea as HospitalDepartment);
      localStorage.setItem('his_current_dept', workArea);
    }
  };

  const setCurrentDepartment = (dept: HospitalDepartment) => {
    setCurrentDepartmentState(dept);
    setActiveWorkAreaState(dept);
    localStorage.setItem('his_current_dept', dept);
    localStorage.setItem('his_active_work_area', dept);
  };

  const [activeWorkspacePatientId, setActiveWorkspacePatientId] = useState<string | null>(null);
  const [activeWorkspaceActivity, setActiveWorkspaceActivity] = useState<ClinicalActivity>('summary');
  const [workspaceOrigin, setWorkspaceOrigin] = useState<WorkspaceOriginState | null>(null);

  const [careTransitions, setCareTransitions] = useState<CareTransitionRequest[]>(() => {
    const saved = localStorage.getItem('his_care_transitions');
    return saved ? JSON.parse(saved) : INITIAL_CARE_TRANSITIONS;
  });

  const [clinicalTasks, setClinicalTasks] = useState<ClinicalTask[]>(() => {
    const saved = localStorage.getItem('his_clinical_tasks');
    return saved ? JSON.parse(saved) : INITIAL_CLINICAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('his_care_transitions', JSON.stringify(careTransitions));
  }, [careTransitions]);

  useEffect(() => {
    localStorage.setItem('his_clinical_tasks', JSON.stringify(clinicalTasks));
  }, [clinicalTasks]);

  const openPatientWorkspace = (
    patientId: string,
    optionsOrActivity?:
      | ClinicalActivity
      | (Partial<WorkspaceOriginState> & {
          defaultActivity?: ClinicalActivity;
          originWorkArea?: ClinicalWorkArea;
        }),
    legacyOrigin?: { department?: ClinicalWorkArea; label?: string }
  ) => {
    setActiveWorkspacePatientId(patientId);

    let defaultAct: ClinicalActivity | undefined;
    let matchedOrigin: ClinicalWorkArea = activeWorkArea;
    let newOrigin: WorkspaceOriginState = {
      workArea: activeWorkArea
    };

    if (typeof optionsOrActivity === 'string') {
      defaultAct = optionsOrActivity as ClinicalActivity;
      if (legacyOrigin?.department) {
        matchedOrigin = legacyOrigin.department;
      }
      newOrigin = {
        workArea: matchedOrigin
      };
    } else if (optionsOrActivity && typeof optionsOrActivity === 'object') {
      defaultAct = optionsOrActivity.defaultActivity;
      matchedOrigin = optionsOrActivity.originWorkArea || optionsOrActivity.workArea || activeWorkArea;
      newOrigin = {
        workArea: matchedOrigin,
        filter: optionsOrActivity.filter,
        selectedId: optionsOrActivity.selectedId,
        searchQuery: optionsOrActivity.searchQuery,
        tab: optionsOrActivity.tab,
        originType: optionsOrActivity.originType,
        boardType: optionsOrActivity.boardType,
        activeView: optionsOrActivity.activeView,
        activeFilter: optionsOrActivity.activeFilter,
        selectedWard: optionsOrActivity.selectedWard,
        selectedTheatre: optionsOrActivity.selectedTheatre,
        selectedPatientId: optionsOrActivity.selectedPatientId || patientId,
        scrollPosition: optionsOrActivity.scrollPosition
      };
    }

    setWorkspaceOrigin(newOrigin);

    if (defaultAct) {
      setActiveWorkspaceActivity(defaultAct);
    } else {
      // Role-aware & Context-aware clinical workspace entry
      switch (matchedOrigin) {
        case 'opd':
          setActiveWorkspaceActivity(currentRole === 'doctor' ? 'notes' : 'vitals');
          break;
        case 'er':
          setActiveWorkspaceActivity(currentRole === 'doctor' ? 'summary' : 'vitals');
          break;
        case 'icu':
          setActiveWorkspaceActivity('vitals');
          break;
        case 'ipd':
          setActiveWorkspaceActivity(currentRole === 'nurse' ? 'medications' : 'notes');
          break;
        case 'or':
          setActiveWorkspaceActivity('notes');
          break;
        case 'my_work':
        default:
          setActiveWorkspaceActivity('summary');
      }
    }
  };

  const closePatientWorkspace = () => {
    setActiveWorkspacePatientId(null);
    if (workspaceOrigin?.workArea) {
      setActiveWorkArea(workspaceOrigin.workArea);
      if (['opd', 'er', 'icu', 'ipd', 'or'].includes(workspaceOrigin.workArea)) {
        setCurrentDepartment(workspaceOrigin.workArea as any);
      }
    }
  };

  const switchWorkspaceActivity = (activity: ClinicalActivity) => {
    setActiveWorkspaceActivity(activity);
  };

  const addCareTransition = (
    transition: Omit<CareTransitionRequest, 'id' | 'requestedAt' | 'status'>
  ) => {
    const newTrans: CareTransitionRequest = {
      ...transition,
      id: `TRANS-${Date.now().toString().slice(-4)}`,
      requestedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'requested',
      updatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setCareTransitions(prev => [newTrans, ...prev]);
  };

  const updateTransitionStatus = (
    transitionId: string,
    status: TransitionStatus,
    extra?: Partial<CareTransitionRequest>
  ) => {
    setCareTransitions(prev =>
      prev.map(t =>
        t.id === transitionId
          ? {
              ...t,
              status,
              ...extra,
              updatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          : t
      )
    );
  };

  const completeClinicalTask = (taskId: string) => {
    setClinicalTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: 'completed' as const }
          : t
      )
    );
  };

  const [erPatients, setErPatients] = useState<ErPatient[]>(() => {
    const saved = localStorage.getItem('his_er_patients');
    return saved ? JSON.parse(saved) : INITIAL_ER_PATIENTS;
  });

  const [wardBeds, setWardBeds] = useState<WardBed[]>(() => {
    const saved = localStorage.getItem('his_ward_beds');
    return saved ? JSON.parse(saved) : INITIAL_WARD_BEDS;
  });

  const [icuBeds, setIcuBeds] = useState<IcuBed[]>(() => {
    const saved = localStorage.getItem('his_icu_beds');
    return saved ? JSON.parse(saved) : INITIAL_ICU_BEDS;
  });

  const [surgeryCases, setSurgeryCases] = useState<SurgeryCase[]>(() => {
    const saved = localStorage.getItem('his_surgery_cases');
    return saved ? JSON.parse(saved) : INITIAL_SURGERY_CASES;
  });

  const openStandardsModal = (patientId?: string, appointmentId?: string, initialTab: 'fhir' | 'nphies' | 'cbahi' = 'fhir') => {
    setStandardsModalState({
      isOpen: true,
      patientId: patientId || patients[0]?.id,
      appointmentId,
      initialTab
    });
  };

  const closeStandardsModal = () => {
    setStandardsModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Clinical Progress Notes & Templates State
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>(() => {
    const saved = localStorage.getItem('his_progress_notes');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_NOTES;
  });

  const [noteTemplates, setNoteTemplates] = useState<ProgressNoteTemplate[]>(() => {
    const saved = localStorage.getItem('his_note_templates');
    return saved ? JSON.parse(saved) : DEFAULT_NOTE_TEMPLATES;
  });

  const [activeProgressNotesPatientId, setActiveProgressNotesPatientId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('his_progress_notes', JSON.stringify(progressNotes));
  }, [progressNotes]);

  useEffect(() => {
    localStorage.setItem('his_note_templates', JSON.stringify(noteTemplates));
  }, [noteTemplates]);

  const addProgressNote = (noteData: Omit<ProgressNote, 'id' | 'timestamp'>): ProgressNote => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const newNote: ProgressNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      timestamp: `${dateStr} ${timeStr}`
    };
    setProgressNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const saveNoteTemplate = (templateData: Omit<ProgressNoteTemplate, 'id'>): ProgressNoteTemplate => {
    const newTpl: ProgressNoteTemplate = {
      ...templateData,
      id: `tpl-${Date.now()}`,
      isCustom: true
    };
    setNoteTemplates(prev => [newTpl, ...prev]);
    return newTpl;
  };

  const deleteNoteTemplate = (templateId: string) => {
    setNoteTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const openProgressNotesModal = (patientId: string) => {
    setActiveProgressNotesPatientId(patientId);
  };

  // Full Patient Lifecycle Modal State
  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState<boolean>(false);
  const [selectedLifecyclePatientId, setSelectedLifecyclePatientId] = useState<string | null>(null);

  const openLifecycleModal = (patientId?: string) => {
    setSelectedLifecyclePatientId(patientId || patients[0]?.id || null);
    setIsLifecycleModalOpen(true);
  };

  const closeLifecycleModal = () => {
    setIsLifecycleModalOpen(false);
  };

  // Sync enterprise states to local storage
  useEffect(() => {
    localStorage.setItem('his_current_dept', currentDepartment);
  }, [currentDepartment]);

  useEffect(() => {
    localStorage.setItem('his_er_patients', JSON.stringify(erPatients));
  }, [erPatients]);

  useEffect(() => {
    localStorage.setItem('his_ward_beds', JSON.stringify(wardBeds));
  }, [wardBeds]);

  useEffect(() => {
    localStorage.setItem('his_icu_beds', JSON.stringify(icuBeds));
  }, [icuBeds]);

  useEffect(() => {
    localStorage.setItem('his_surgery_cases', JSON.stringify(surgeryCases));
  }, [surgeryCases]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('his_clinics', JSON.stringify(clinics));
  }, [clinics]);

  useEffect(() => {
    localStorage.setItem('his_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('his_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('his_lab_orders', JSON.stringify(labOrders));
  }, [labOrders]);

  useEffect(() => {
    localStorage.setItem('his_mar_items', JSON.stringify(marItems));
  }, [marItems]);

  useEffect(() => {
    localStorage.setItem('his_consultations', JSON.stringify(consultations));
  }, [consultations]);

  useEffect(() => {
    localStorage.setItem('his_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const activeSecurityGroup =
    HIS_SECURITY_GROUPS.find(g => g.id === activeSecurityGroupId) || HIS_SECURITY_GROUPS[0];

  const resetSensitiveForegroundContext = () => {
    setActiveWorkspacePatientId(null);
    setActiveConsultationAppointmentId(null);
    setActiveTransactionModalAppointmentId(null);
    setSelectedReceiptTransaction(null);
    setViewPatientModalId(null);
    setActiveProgressNotesPatientId(null);
    setIsLifecycleModalOpen(false);
    setSelectedLifecyclePatientId(null);
    setStandardsModalState({ isOpen: false });
    setPrintPrescriptionData(null);
  };

  const loginAsSecurityGroup = (
    groupId: string,
    staffId?: string,
    targetDept?: HospitalDepartment
  ) => {
    // Shared Workstation Safeguard: Clear sensitive foreground patient/case state
    resetSensitiveForegroundContext();

    const group = HIS_SECURITY_GROUPS.find(g => g.id === groupId) || HIS_SECURITY_GROUPS[0];
    const staff =
      MOCK_STAFF.find(s => s.id === (staffId || group.suggestedStaffId)) ||
      MOCK_STAFF.find(s => s.role === group.defaultRole) ||
      MOCK_STAFF[0];

    setActiveSecurityGroupId(group.id);
    setActiveStaffId(staff.id);
    setCurrentRole(group.defaultRole);
    const resolvedDept = targetDept || group.defaultDepartment;
    setCurrentDepartment(resolvedDept);

    if (staff.activeClinicId) {
      setActiveClinicId(staff.activeClinicId);
    }

    setIsAuthenticated(true);
    localStorage.setItem('his_is_auth', 'true');
    localStorage.setItem('his_active_sec_group', group.id);
    localStorage.setItem('his_active_staff_id', staff.id);
    localStorage.setItem('his_current_dept', resolvedDept);
    playChime('success');
  };

  const logout = () => {
    // Shared Workstation Safeguard: Clear sensitive foreground patient/case state
    resetSensitiveForegroundContext();
    setIsAuthenticated(false);
    localStorage.setItem('his_is_auth', 'false');
  };

  // Current staff based on activeStaffId or fallback to currentRole
  const currentStaff =
    MOCK_STAFF.find(s => s.id === activeStaffId) ||
    MOCK_STAFF.find(s => s.role === currentRole) ||
    MOCK_STAFF[0];

  const userAvailableRoles: StaffRole[] =
    currentStaff.assignedRoles && currentStaff.assignedRoles.length > 0
      ? currentStaff.assignedRoles
      : [currentStaff.role];

  useEffect(() => {
    if (!userAvailableRoles.includes(currentRole)) {
      setCurrentRole(userAvailableRoles[0]);
    }
  }, [currentStaff.id, userAvailableRoles, currentRole]);

  const setCurrentStaff = (staff: StaffUser) => {
    // Shared Workstation Safeguard: Clear sensitive foreground patient/case state
    resetSensitiveForegroundContext();
    setActiveStaffId(staff.id);
    setCurrentRole(staff.role);
    localStorage.setItem('his_active_staff_id', staff.id);
    if (staff.activeClinicId) {
      setActiveClinicId(staff.activeClinicId);
    }
  };

  const activeClinic = clinics.find(c => c.id === activeClinicId) || clinics[0];

  // Emergency Code Trigger & Speech Announcement
  const triggerEmergencyCode = (code: string | null, customLocation?: string) => {
    setEmergencyCodeState(code);
    if (customLocation !== undefined) {
      setEmergencyCodeLocation(customLocation);
    }
    if (!soundEnabled) return;

    if (code) {
      if (voiceAnnouncementEnabled) {
        announceEmergencyCodeSpeech(code, customLocation || emergencyCodeLocation, {
          onStart: () => setIsSpeakingAnnouncement(true),
          onEnd: () => setIsSpeakingAnnouncement(false)
        });
      } else {
        playHospitalTone('alert');
      }
    } else {
      if (voiceAnnouncementEnabled) {
        announceClearEmergencySpeech({
          onStart: () => setIsSpeakingAnnouncement(true),
          onEnd: () => setIsSpeakingAnnouncement(false)
        });
      } else {
        playHospitalTone('success');
      }
    }
  };

  const setEmergencyCode = (code: string | null, customLocation?: string) => {
    triggerEmergencyCode(code, customLocation);
  };

  const replayEmergencyCodeVoice = () => {
    if (!emergencyCode) return;
    if (!soundEnabled) return;
    announceEmergencyCodeSpeech(emergencyCode, emergencyCodeLocation, {
      onStart: () => setIsSpeakingAnnouncement(true),
      onEnd: () => setIsSpeakingAnnouncement(false)
    });
  };

  const announceCustomVoice = (
    arabicText: string,
    englishText?: string,
    type: 'call' | 'alert' | 'success' = 'call'
  ) => {
    if (!soundEnabled) return;
    if (voiceAnnouncementEnabled) {
      speakAnnouncement(arabicText, englishText, {
        playTone: type,
        onStart: () => setIsSpeakingAnnouncement(true),
        onEnd: () => setIsSpeakingAnnouncement(false)
      });
    } else {
      playHospitalTone(type);
    }
  };

  // Sound synthesis & code voice announcement using Web Audio & Web Speech APIs
  const playChime = (type: 'call' | 'alert' | 'success' = 'call', announceCode?: string) => {
    if (!soundEnabled) return;
    if (announceCode && voiceAnnouncementEnabled) {
      if (type === 'alert') {
        announceEmergencyCodeSpeech(announceCode, emergencyCodeLocation, {
          onStart: () => setIsSpeakingAnnouncement(true),
          onEnd: () => setIsSpeakingAnnouncement(false)
        });
        return;
      }
    }
    playHospitalTone(type);
  };

  // Register new patient
  const registerPatient = (patientData: Omit<Patient, 'id' | 'mrn' | 'registeredAt'>): Patient => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      mrn: `MRN-2026-${randomNum}`,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [newPatient, ...prev]);
    playChime('success');
    return newPatient;
  };

  // Book OPD Appointment & Issue Queue Token
  const bookAppointment = (data: {
    patientId: string;
    clinicId: string;
    doctorId: string;
    priority: Appointment['priority'];
    chiefComplaint: string;
    type: Appointment['type'];
    consultationFee: number;
    patientCoPay: number;
    status?: Appointment['status'];
    appointmentTime?: string;
  }): Appointment => {
    const clinic = clinics.find(c => c.id === data.clinicId);
    const code = clinic ? clinic.code : 'OPD';
    const clinicAppointments = appointments.filter(a => a.clinicId === data.clinicId);
    const ticketSeq = clinicAppointments.length + 101;
    const ticketNo = `${code}-${ticketSeq}`;
    const status = data.status || 'checked_in';
    const appointmentTime = data.appointmentTime || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      ticketNo,
      patientId: data.patientId,
      clinicId: data.clinicId,
      doctorId: data.doctorId,
      appointmentTime,
      type: data.type,
      status,
      priority: data.priority,
      chiefComplaint: data.chiefComplaint,
      paymentStatus: 'paid',
      consultationFee: data.consultationFee,
      patientCoPay: data.patientCoPay
    };

    setAppointments(prev => [...prev, newApt]);

    // Only increment waiting count if checked in immediately
    if (status === 'checked_in') {
      setClinics(prev =>
        prev.map(c => (c.id === data.clinicId ? { ...c, totalWaiting: c.totalWaiting + 1 } : c))
      );
    }

    playChime('call');
    return newApt;
  };

  const checkInAppointment = (appointmentId: string) => {
    let clinicIdToIncrement: string | null = null;
    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setAppointments(prev =>
      prev.map(a => {
        if (a.id === appointmentId) {
          clinicIdToIncrement = a.clinicId;
          return { ...a, status: 'checked_in', arrivedAt: a.arrivedAt || timeNow };
        }
        return a;
      })
    );

    if (clinicIdToIncrement) {
      setClinics(prev =>
        prev.map(c => (c.id === clinicIdToIncrement ? { ...c, totalWaiting: c.totalWaiting + 1 } : c))
      );
    }
    playChime('success');
  };

  const markPatientArrived = (appointmentId: string) => {
    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, status: 'arrived', arrivedAt: timeNow } : a))
    );
    playChime('call');
  };

  const markPatientNoShow = (appointmentId: string) => {
    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, status: 'no_show' } : a))
    );
  };

  const processCheckInTransaction = (
    appointmentId: string,
    data: {
      paymentMethod: BillingTransaction['paymentMethod'];
      paidAmount: number;
      paymentReference?: string;
      cashierName?: string;
      nphiesClaimRef?: string;
      waived?: boolean;
    }
  ): BillingTransaction => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    const targetPatient = targetApt ? patients.find(p => p.id === targetApt.patientId) : null;
    const targetClinic = targetApt ? clinics.find(c => c.id === targetApt.clinicId) : null;

    const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const txnSeq = Math.floor(1000 + Math.random() * 9000);
    const recSeq = Math.floor(10000 + Math.random() * 90000);

    const fee = targetApt ? targetApt.consultationFee : 400;
    const coPay = data.waived ? 0 : data.paidAmount;
    const discount = Math.max(0, fee - coPay);

    const newTxn: BillingTransaction = {
      id: `TXN-${new Date().getFullYear()}-${txnSeq}`,
      appointmentId,
      patientId: targetPatient ? targetPatient.id : (targetApt?.patientId || ''),
      patientName: targetPatient?.fullNameAr || 'مريض مجهول',
      mrn: targetPatient?.mrn || '',
      clinicId: targetClinic?.id || (targetApt?.clinicId || ''),
      clinicName: targetClinic?.nameAr || 'العيادة التخصصية',
      doctorName: targetClinic?.doctorName || 'طبيب العيادة',
      receiptNo: `REC-${recSeq}`,
      timestamp: timeNow,
      consultationFee: fee,
      insuranceDiscount: discount,
      patientCoPay: coPay,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference || (data.paymentMethod === 'cash' ? `CSH-${txnSeq}` : `PAY-AUTH-${txnSeq}`),
      cashierName: data.cashierName || 'كاونتر الاستقبال (أحمد نبيل)',
      status: 'completed',
      invoiceType: 'opd_consultation',
      nphiesClaimRef: data.nphiesClaimRef || (targetPatient && targetPatient.insuranceProvider !== 'نقدي (Cash)' ? `NPHIES-CLM-${txnSeq}` : undefined)
    };

    // Store transaction in ledger
    setTransactions(prev => [newTxn, ...prev]);

    // Update appointment status to checked_in with transaction attached
    let clinicIdToIncrement: string | null = null;
    setAppointments(prev =>
      prev.map(a => {
        if (a.id === appointmentId) {
          clinicIdToIncrement = a.clinicId;
          return {
            ...a,
            status: 'checked_in',
            paymentStatus: data.waived ? 'exempt' : 'paid',
            patientCoPay: coPay,
            transactionId: newTxn.id,
            transaction: newTxn,
            arrivedAt: a.arrivedAt || timeNow
          };
        }
        return a;
      })
    );

    if (clinicIdToIncrement) {
      setClinics(prev =>
        prev.map(c => (c.id === clinicIdToIncrement ? { ...c, totalWaiting: c.totalWaiting + 1 } : c))
      );
    }

    setSelectedReceiptTransaction(newTxn);
    playChime('success');
    return newTxn;
  };

  const callPatient = (appointmentId: string) => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) return;

    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'with_doctor',
              calledAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          : a
      )
    );

    // Update clinic currentToken
    setClinics(prev =>
      prev.map(c =>
        c.id === targetApt.clinicId
          ? { ...c, currentToken: targetApt.ticketNo, totalWaiting: Math.max(0, c.totalWaiting - 1) }
          : c
      )
    );

    setActiveConsultationAppointmentId(appointmentId);

    if (soundEnabled) {
      if (voiceAnnouncementEnabled) {
        const patient = patients.find(p => p.id === targetApt.patientId);
        const clinic = clinics.find(c => c.id === targetApt.clinicId);
        announcePatientCallSpeech(
          {
            ticketNo: targetApt.ticketNo,
            patientName: patient?.fullNameAr,
            clinicName: clinic?.nameAr,
            roomNo: clinic?.roomNo
          },
          {
            onStart: () => setIsSpeakingAnnouncement(true),
            onEnd: () => setIsSpeakingAnnouncement(false)
          }
        );
      } else {
        playHospitalTone('call');
      }
    }
  };

  const startConsultation = (appointmentId: string) => {
    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'with_doctor',
              consultationStartedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          : a
      )
    );
    setActiveConsultationAppointmentId(appointmentId);
  };

  const saveVitals = (appointmentId: string, vitals: Vitals) => {
    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, vitals, status: 'triage_completed' } : a))
    );
    playChime('success');
  };

  const saveConsultation = (record: ConsultationRecord) => {
    setConsultations(prev => ({
      ...prev,
      [record.appointmentId]: record
    }));
    playChime('success');
  };

  const addPrescriptionToConsultation = (appointmentId: string, rx: PrescriptionItem) => {
    setConsultations(prev => {
      const existing = prev[appointmentId];
      if (!existing) return prev;
      return {
        ...prev,
        [appointmentId]: {
          ...existing,
          prescriptions: [...existing.prescriptions, rx]
        }
      };
    });
    playChime('success');
  };

  const removePrescriptionFromConsultation = (appointmentId: string, rxId: string) => {
    setConsultations(prev => {
      const existing = prev[appointmentId];
      if (!existing) return prev;
      return {
        ...prev,
        [appointmentId]: {
          ...existing,
          prescriptions: existing.prescriptions.filter(p => p.id !== rxId)
        }
      };
    });
  };

  const orderLab = (orderData: Omit<LabOrder, 'id' | 'orderedAt' | 'status' | 'orderedBy'>) => {
    const newOrder: LabOrder = {
      ...orderData,
      id: `lab-${Date.now()}`,
      orderedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'ordered',
      orderedBy: currentStaff.name
    };
    setLabOrders(prev => [newOrder, ...prev]);

    // Also link to consultation if exists
    setConsultations(prev => {
      const existing = prev[orderData.appointmentId];
      if (!existing) return prev;
      return {
        ...prev,
        [orderData.appointmentId]: {
          ...existing,
          labOrders: [newOrder, ...existing.labOrders]
        }
      };
    });

    playChime('success');
  };

  const collectSample = (orderId: string) => {
    setLabOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'sample_collected',
              sampleCollectedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
              collectedByNurse: currentStaff.name
            }
          : o
      )
    );
    playChime('success');
  };

  const administerMed = (marId: string, status: MARItem['status'], notes?: string) => {
    setMarItems(prev =>
      prev.map(m =>
        m.id === marId
          ? {
              ...m,
              status,
              administeredTime: status === 'administered' ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : undefined,
              administeredBy: status === 'administered' ? currentStaff.name : undefined,
              notes: notes || m.notes
            }
          : m
      )
    );
    playChime('success');
  };

  const completeAppointment = (appointmentId: string) => {
    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'completed',
              consultationEndedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          : a
      )
    );
    playChime('success');
  };

  // Enterprise ER actions
  const addErPatient = (patientData: Omit<ErPatient, 'id' | 'arrivalTime' | 'doorToDocMinutes'>) => {
    const newCase: ErPatient = {
      ...patientData,
      id: `er-case-${Date.now()}`,
      arrivalTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      doorToDocMinutes: 0
    };
    setErPatients(prev => [newCase, ...prev]);
    playChime(patientData.triageLevel <= 2 ? 'alert' : 'call');
  };

  const updateErPatientStatus = (id: string, status: ErPatient['status']) => {
    setErPatients(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    );
    playChime('success');
  };

  // Enterprise IPD & Ward actions
  const updateBedStatus = (bedId: string, status: WardBed['status'], patientData?: Partial<WardBed>) => {
    setWardBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? {
              ...b,
              status,
              ...(patientData || {})
            }
          : b
      )
    );
    playChime('success');
  };

  const transferBed = (sourceBedId: string, targetBedId: string) => {
    setWardBeds(prev => {
      const source = prev.find(b => b.id === sourceBedId);
      if (!source || !source.patientId) return prev;

      return prev.map(b => {
        if (b.id === sourceBedId) {
          return {
            ...b,
            status: 'cleaning',
            patientId: undefined,
            patientName: undefined,
            mrn: undefined,
            age: undefined,
            gender: undefined,
            admitDate: undefined,
            diagnosis: 'سرير بانتظار التطهير والتعقيم بعد نقل المريض',
            diet: undefined,
            fallRisk: undefined,
            ivFluids: undefined,
            admissionId: undefined
          };
        }
        if (b.id === targetBedId) {
          return {
            ...b,
            status: 'occupied',
            patientId: source.patientId,
            patientName: source.patientName,
            mrn: source.mrn,
            age: source.age,
            gender: source.gender,
            admitDate: source.admitDate,
            attendingPhysician: source.attendingPhysician,
            diagnosis: source.diagnosis,
            diet: source.diet,
            fallRisk: source.fallRisk,
            ivFluids: source.ivFluids,
            admissionId: source.admissionId
          };
        }
        return b;
      });
    });
    playChime('call');
  };

  const dischargeBed = (bedId: string) => {
    setWardBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? {
              ...b,
              status: 'cleaning',
              patientId: undefined,
              patientName: undefined,
              mrn: undefined,
              age: undefined,
              gender: undefined,
              admitDate: undefined,
              diagnosis: 'تم تخريج المريض - بانتظار دورة التطهير والتعقيم',
              diet: undefined,
              fallRisk: undefined,
              ivFluids: undefined,
              admissionId: undefined
            }
          : b
      )
    );
    playChime('success');
  };

  // Enterprise ICU actions
  const updateIcuVentilator = (bedId: string, vent: Partial<IcuBed['ventilator']>) => {
    setIcuBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? {
              ...b,
              ventilator: {
                ...b.ventilator,
                ...vent
              }
            }
          : b
      )
    );
    playChime('success');
  };

  const updateIcuInfusion = (bedId: string, drugIndex: number, newRate: string) => {
    setIcuBeds(prev =>
      prev.map(b => {
        if (b.id !== bedId) return b;
        const newInfusions = [...b.infusions];
        if (newInfusions[drugIndex]) {
          newInfusions[drugIndex] = { ...newInfusions[drugIndex], rate: newRate };
        }
        return { ...b, infusions: newInfusions };
      })
    );
    playChime('success');
  };

  // Enterprise OR actions
  const updateSurgeryStatus = (caseId: string, status: SurgeryCase['status']) => {
    setSurgeryCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, status } : c))
    );
    playChime('success');
  };

  const toggleWhoChecklist = (caseId: string, phase: 'signIn' | 'timeOut' | 'signOut') => {
    setSurgeryCases(prev =>
      prev.map(c =>
        c.id === caseId
          ? {
              ...c,
              whoChecklist: {
                ...c.whoChecklist,
                [phase]: !c.whoChecklist[phase]
              }
            }
          : c
      )
    );
    playChime('call');
  };

  const updateAldreteScore = (caseId: string, score: number) => {
    setSurgeryCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, aldreteScore: score } : c))
    );
    playChime('success');
  };

  // -------------------------------------------------------------
  // FULL PATIENT LIFECYCLE LINKING IMPLEMENTATIONS
  // -------------------------------------------------------------
  const admitPatientToWard = (
    patientId: string,
    bedId: string,
    details?: {
      diagnosis?: string;
      diet?: WardBed['diet'];
      fallRisk?: WardBed['fallRisk'];
      ivFluids?: string;
      attendingPhysician?: string;
    }
  ) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setWardBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? {
              ...b,
              status: 'occupied',
              patientId: patient.id,
              patientName: patient.fullNameAr,
              mrn: patient.mrn,
              age: patient.age,
              gender: patient.gender,
              admitDate: new Date().toISOString().split('T')[0],
              attendingPhysician: details?.attendingPhysician || currentStaff.name || 'د. هدى عبد العزيز',
              diagnosis: details?.diagnosis || 'تنويم داخلي جديد للمتابعة والعلاج السريري',
              diet: details?.diet || 'Regular',
              fallRisk: details?.fallRisk || 'low',
              ivFluids: details?.ivFluids || 'IV Normal Saline 500ml @ 80ml/hr'
            }
          : b
      )
    );

    // If patient had an active ER case, advance status to decision_admit
    setErPatients(prev =>
      prev.map(p =>
        p.patientId === patientId || p.mrn === patient.mrn
          ? { ...p, status: 'decision_admit' }
          : p
      )
    );

    // If patient has active consultation appointment, update disposition
    const apt = appointments.find(a => a.patientId === patientId);
    if (apt && consultations[apt.id]) {
      setConsultations(prev => ({
        ...prev,
        [apt.id]: {
          ...prev[apt.id],
          disposition: 'admit_inpatient',
          dispositionDetails: `تم التسكين الفعلي بالسرير ${bedId}`
        }
      }));
    }

    playChime('success');
  };

  const scheduleSurgery = (
    patientId: string,
    data: {
      procedureNameAr: string;
      procedureNameEn?: string;
      theatreCode: SurgeryCase['theatreCode'];
      leadSurgeon: string;
      anesthesiologist?: string;
      anesthesiaType?: SurgeryCase['anesthesiaType'];
      asaClassification?: SurgeryCase['asaClassification'];
      scheduledTime?: string;
    }
  ) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const theatreNames: Record<SurgeryCase['theatreCode'], string> = {
      'OR-1': 'OR-1 جراحة القلب والصدر',
      'OR-2': 'OR-2 جراحة العظام والعمود الفقري',
      'OR-3': 'OR-3 الجراحة العامة والمناظير',
      'OR-4': 'OR-4 طوارئ الحوادث والإصابات'
    };

    const newCase: SurgeryCase = {
      id: `surg-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullNameAr,
      mrn: patient.mrn,
      age: patient.age,
      theatreNo: theatreNames[data.theatreCode] || 'OR-3 الجراحة العامة',
      theatreCode: data.theatreCode,
      procedureNameAr: data.procedureNameAr,
      procedureNameEn: data.procedureNameEn || data.procedureNameAr,
      leadSurgeon: data.leadSurgeon,
      anesthesiologist: data.anesthesiologist || 'د. ماجد رضوان (استشاري التخدير)',
      scrubNurse: 'م. مروة كمال (تمريض عمليات)',
      scheduledTime: data.scheduledTime || 'اليوم - فوري',
      status: 'holding_preop',
      anesthesiaType: data.anesthesiaType || 'General Endotracheal',
      asaClassification: data.asaClassification || 'ASA II',
      whoChecklist: {
        signIn: false,
        timeOut: false,
        signOut: false
      },
      spongeNeedleCountVerified: false,
      aldreteScore: undefined,
      dispositionTarget: 'Surgical Ward 3B'
    };

    setSurgeryCases(prev => [newCase, ...prev]);

    // If patient came from ER, update ER case
    setErPatients(prev =>
      prev.map(p =>
        p.patientId === patientId || p.mrn === patient.mrn
          ? { ...p, status: 'transferred_or' }
          : p
      )
    );

    playChime('call');
  };

  const admitToIcu = (
    patientId: string,
    details?: {
      bedId?: string;
      diagnosis?: string;
      reason?: string;
      attendingIntensivist?: string;
    }
  ) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const targetBedId = details?.bedId || `icu-bed-0${icuBeds.length + 1}`;

    const existingBed = icuBeds.find(b => b.id === targetBedId);
    if (existingBed) {
      setIcuBeds(prev =>
        prev.map(b =>
          b.id === targetBedId
            ? {
                ...b,
                patientId: patient.id,
                patientName: patient.fullNameAr,
                mrn: patient.mrn,
                age: patient.age,
                gender: patient.gender,
                diagnosis: details?.diagnosis || 'حالة حرجة بحاجة لدعم مكثف',
                admitDays: 1,
                attendingIntensivist: details?.attendingIntensivist || 'د. شريف علام (استشاري العناية المركزة)'
              }
            : b
        )
      );
    } else {
      const newIcuBed: IcuBed = {
        id: targetBedId,
        bedNo: `ICU-Bed-0${icuBeds.length + 1}`,
        patientId: patient.id,
        patientName: patient.fullNameAr,
        mrn: patient.mrn,
        age: patient.age,
        gender: patient.gender,
        diagnosis: details?.diagnosis || 'حالة حرجة بحاجة لدعم هيموديناميكي وملاحظة مكثفة',
        admitDays: 1,
        attendingIntensivist: details?.attendingIntensivist || 'د. شريف علام (استشاري العناية المركزة)',
        primaryNurse: 'أخصائي تمريض رعاية حرجة',
        gcsScore: 14,
        sofaScore: 5,
        apacheScore: 16,
        hemodynamics: {
          map: 72,
          cvp: 7,
          hr: 96,
          spo2: 95,
          artLineBp: '112/68',
          rhythm: 'Sinus Tachycardia'
        },
        ventilator: {
          isVentilated: false,
          mode: 'High-Flow Nasal',
          fio2: 40
        },
        infusions: [
          { drug: 'Norepinephrine', rate: '0.08 mcg/kg/min', category: 'vasopressor' }
        ],
        alerts: ['تحويل فوري للعناية المركزة']
      };
      setIcuBeds(prev => [...prev, newIcuBed]);
    }

    // Free ward bed if patient was in a ward
    setWardBeds(prev =>
      prev.map(b =>
        b.patientId === patientId
          ? {
              ...b,
              status: 'cleaning',
              patientId: undefined,
              patientName: undefined,
              mrn: undefined,
              diagnosis: 'تم تصعيد المريض للعناية المركزة - السرير قيد التطهير'
            }
          : b
      )
    );

    // If patient in ER, update status
    setErPatients(prev =>
      prev.map(p =>
        p.patientId === patientId || p.mrn === patient.mrn
          ? { ...p, status: 'transferred_icu' }
          : p
      )
    );

    playChime('alert');
  };

  const transferFromOr = (caseId: string, destination: 'ward' | 'icu', targetBedId?: string) => {
    const surgeryCase = surgeryCases.find(c => c.id === caseId);
    if (!surgeryCase) return;

    setSurgeryCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, status: 'completed' } : c))
    );

    if (destination === 'ward') {
      const availableBed = targetBedId
        ? wardBeds.find(b => b.id === targetBedId)
        : wardBeds.find(b => b.wardId === 'ward_surgical_3b' && b.status === 'available') || wardBeds.find(b => b.status === 'available');

      if (availableBed) {
        admitPatientToWard(surgeryCase.patientId, availableBed.id, {
          diagnosis: `ما بعد جراحة (${surgeryCase.procedureNameAr}) - استقرار الإفاقة Aldrete ${surgeryCase.aldreteScore || 9}/10`,
          diet: 'NPO',
          fallRisk: 'high',
          ivFluids: 'IV Ringer Lactate 1000ml @ 100ml/hr',
          attendingPhysician: surgeryCase.leadSurgeon
        });
      }
    } else if (destination === 'icu') {
      admitToIcu(surgeryCase.patientId, {
        diagnosis: `ملاحظة حرجة ما بعد جراحة (${surgeryCase.procedureNameAr})`,
        reason: 'مراقبة هيموديناميكية حثيثة بعد العملية'
      });
    }

    playChime('success');
  };

  const stepDownFromIcu = (icuBedId: string, targetWardBedId: string) => {
    const icuBed = icuBeds.find(b => b.id === icuBedId);
    if (!icuBed) return;

    admitPatientToWard(icuBed.patientId, targetWardBedId, {
      diagnosis: `تحويل واستقرار من العناية المركزة (${icuBed.diagnosis})`,
      attendingPhysician: icuBed.attendingIntensivist,
      diet: 'Regular',
      fallRisk: 'moderate',
      ivFluids: 'IV Normal Saline @ 60ml/hr'
    });

    setIcuBeds(prev => prev.filter(b => b.id !== icuBedId));
    playChime('success');
  };

  const dischargePatientFullCycle = (
    patientId: string,
    details?: {
      dischargeSummary?: string;
      followUpDate?: string;
      clearanceNotes?: string;
    }
  ) => {
    const patient = patients.find(p => p.id === patientId);

    // Free Ward beds
    setWardBeds(prev =>
      prev.map(b =>
        b.patientId === patientId
          ? {
              ...b,
              status: 'cleaning',
              patientId: undefined,
              patientName: undefined,
              mrn: undefined,
              diagnosis: `تم تخريج المريض مع مخالصة مالية وتأمينية (${details?.dischargeSummary || 'استقرار تام'})`
            }
          : b
      )
    );

    // Free ICU beds
    setIcuBeds(prev => prev.filter(b => b.patientId !== patientId));

    // Complete active appointments
    setAppointments(prev =>
      prev.map(a =>
        a.patientId === patientId
          ? {
              ...a,
              status: 'completed',
              consultationEndedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          : a
      )
    );

    // If ER, mark discharged
    setErPatients(prev =>
      prev.map(p =>
        p.patientId === patientId || (patient && p.mrn === patient.mrn)
          ? { ...p, status: 'discharged' }
          : p
      )
    );

    playChime('success');
  };

  const getPatientLifecycleState = (patientId: string): PatientLifecycleState => {
    const patient = patients.find(p => p.id === patientId) || patients[0];
    const apt = appointments.find(a => a.patientId === patientId);
    const con = apt ? consultations[apt.id] : undefined;
    const erCase = erPatients.find(e => e.patientId === patientId || e.mrn === patient.mrn);
    const wardBed = wardBeds.find(b => b.patientId === patientId && b.status === 'occupied');
    const icuBed = icuBeds.find(b => b.patientId === patientId);
    const orCase = surgeryCases.find(c => c.patientId === patientId);
    const patientLabOrders = labOrders.filter(l => l.patientId === patientId);
    const patientMar = marItems.filter(m => m.patientId === patientId);

    let currentStage: LifecycleStageKey = 'reception';
    let activeLocation = 'قسم الاستقبال والتسجيل';
    let isAdmitted = false;

    if (icuBed) {
      currentStage = 'icu_critical';
      activeLocation = `العناية المركزة - سرير ${icuBed.bedNo}`;
      isAdmitted = true;
    } else if (orCase && (orCase.status === 'in_theatre' || orCase.status === 'holding_preop' || orCase.status === 'pacu_recovery')) {
      currentStage = 'or_surgery';
      activeLocation = `مسارح العمليات - ${orCase.theatreNo}`;
      isAdmitted = true;
    } else if (wardBed) {
      currentStage = 'ward_ipd';
      activeLocation = `${wardBed.wardNameAr} - سرير ${wardBed.bedNumber}`;
      isAdmitted = true;
    } else if (erCase && erCase.status !== 'discharged') {
      currentStage = 'triage';
      activeLocation = `طوارئ - منطقة ${erCase.assignedArea} (سرير ${erCase.bedNo})`;
    } else if (apt && apt.status === 'with_doctor') {
      currentStage = 'consultation';
      const cl = clinics.find(c => c.id === apt.clinicId);
      activeLocation = `عيادة ${cl?.nameAr || 'الطبيب'}`;
    } else if (apt && (apt.status === 'triage_pending' || apt.status === 'triage_completed')) {
      currentStage = 'triage';
      activeLocation = 'محطة التمريض والفرز';
    } else if (apt && apt.status === 'completed') {
      currentStage = 'discharge_clearance';
      activeLocation = 'مكتمل / تم التخريج والمخالصة';
    }

    const steps: LifecycleStageStep[] = [
      {
        key: 'reception',
        titleAr: 'الاستقبال وأهلية التأمين NPHIES',
        titleEn: 'Registration & NPHIES Eligibility',
        dept: 'opd',
        descriptionAr: `تسجيل الملف الطبي ${patient.mrn} وفحص الأهلية عبر منصة نفيس (${patient.insuranceProvider} - فئة ${patient.insuranceClass} - نسبة التغطية ${patient.insuranceCoveragePercent}%)`,
        status: 'completed',
        timestamp: apt?.appointmentTime || '09:00 ص',
        badge: patient.insuranceClass,
        summaryText: `تذكرة رقم ${apt?.ticketNo || 'TKT-01'} - ${patient.fullNameAr}`
      },
      {
        key: 'triage',
        titleAr: 'الفرز والتمريض والعلامات الحيوية',
        titleEn: 'Nursing Triage & Vitals',
        dept: erCase ? 'er' : 'opd',
        descriptionAr: erCase
          ? `فرز طوارئ مستوى ESI ${erCase.triageLevel} - وعي GCS: ${erCase.gcs}/15 - شكوى: ${erCase.chiefComplaint}`
          : apt?.vitals
          ? `ضغط: ${apt.vitals.bpSystolic}/${apt.vitals.bpDiastolic} mmHg - نبض: ${apt.vitals.pulseRate} bpm - أكسجين: ${apt.vitals.spo2}% - حرارة: ${apt.vitals.temp}°C`
          : 'بانتظار قياس وتوثيق العلامات الحيوية',
        status: (erCase || apt?.vitals) ? 'completed' : (apt?.status === 'triage_pending' ? 'in_progress' : 'pending'),
        timestamp: apt?.vitals?.recordedAt || erCase?.arrivalTime,
        badge: erCase ? `ESI L${erCase.triageLevel}` : (apt?.vitals ? `NEWS2: ${apt.vitals.news2Score}` : undefined),
        summaryText: erCase ? `فرز الطوارئ (${erCase.arrivalMode})` : 'فحص العلامات الحيوية وخطورة السقوط'
      },
      {
        key: 'consultation',
        titleAr: 'كشف ومعاينة الطبيب (SOAP)',
        titleEn: 'Physician Consultation',
        dept: erCase ? 'er' : 'opd',
        descriptionAr: con
          ? `التشخيص: ${(con.icd10Codes || []).map(c => c.titleAr).join('، ') || con.assessment} - القرار: ${con.disposition === 'admit_inpatient' ? 'تنويم داخلي' : 'خروج مع علاج'}`
          : (apt?.status === 'with_doctor' ? 'المريض حالياً داخل غرفة الكشف مع الطبيب' : 'بانتظار نداء الطبيب'),
        status: con ? 'completed' : (apt?.status === 'with_doctor' ? 'in_progress' : 'pending'),
        timestamp: con ? new Date(con.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : undefined,
        badge: con && con.icd10Codes?.length ? `${con.icd10Codes.length} تشخيصات` : undefined,
        summaryText: con?.assessment || (erCase ? erCase.attendingDoctor : 'معاينة العيادة التخصصية')
      },
      {
        key: 'diagnostics',
        titleAr: 'التحاليل الطبية والأشعة (Labs/Rad)',
        titleEn: 'Diagnostic Testing',
        dept: 'laboratory',
        descriptionAr: patientLabOrders.length > 0
          ? `${patientLabOrders.length} فحوصات مطلوبة (${patientLabOrders.map(o => o.testNameAr).join('، ')})`
          : 'لم تطلب تحاليل إضافية لهذه الزيارة',
        status: patientLabOrders.length === 0 ? 'not_required' : (patientLabOrders.every(o => o.status === 'result_ready') ? 'completed' : 'in_progress'),
        timestamp: patientLabOrders[0]?.orderedAt,
        badge: patientLabOrders.length > 0 ? `${patientLabOrders.length} طلبات` : undefined,
        summaryText: patientLabOrders.map(o => `${o.testNameAr}: ${o.resultValue || o.status}`).join(' | ')
      },
      {
        key: 'pharmacy',
        titleAr: 'الصيدلية وصرف الأدوية (E-Rx / MAR)',
        titleEn: 'Pharmacy & Medication Admin',
        dept: 'pharmacy',
        descriptionAr: ((con?.prescriptions && con.prescriptions.length > 0) || patientMar.length > 0)
          ? `روشتة إلكترونية معتمدة وإعطاء أدوية عبر سجل MAR مع فحص الحساسية الدوائية`
          : 'لا توجد أدوية إضافية مطلوبة',
        status: ((con?.prescriptions && con.prescriptions.length > 0) || patientMar.length > 0) ? 'completed' : 'not_required',
        badge: con?.prescriptions?.length ? `${con.prescriptions.length} أدوية` : undefined,
        summaryText: (con?.prescriptions || []).map(p => p.drugName).join('، ') || 'صرف الروشتة'
      },
      {
        key: 'ward_ipd',
        titleAr: 'التنويم بالأجنحة الداخلية (IPD Beds)',
        titleEn: 'Inpatient Ward Stay',
        dept: 'ipd',
        descriptionAr: wardBed
          ? `منوم حالياً في ${wardBed.wardNameAr} - سرير ${wardBed.bedNumber} - حمية: ${wardBed.diet} - خطورة السقوط: ${wardBed.fallRisk}`
          : 'غير منوم حالياً في الأجنحة الداخلية',
        status: wardBed ? 'in_progress' : (con?.disposition === 'admit_inpatient' || erCase?.status === 'decision_admit' ? 'pending' : 'not_required'),
        timestamp: wardBed?.admitDate,
        badge: wardBed ? wardBed.bedNumber : undefined,
        summaryText: wardBed ? `${wardBed.wardNameAr} (${wardBed.attendingPhysician})` : undefined
      },
      {
        key: 'or_surgery',
        titleAr: 'مسارح العمليات الجراحية (OR)',
        titleEn: 'Surgical Theatres',
        dept: 'or',
        descriptionAr: orCase
          ? `عملية ${orCase.procedureNameAr} في ${orCase.theatreNo} - الجراح: ${orCase.leadSurgeon} - التخدير: ${orCase.anesthesiaType}`
          : 'لا توجد جراحة مقررة',
        status: orCase
          ? (orCase.status === 'completed' ? 'completed' : 'in_progress')
          : 'not_required',
        timestamp: orCase?.scheduledTime,
        badge: orCase ? orCase.theatreCode : undefined,
        summaryText: orCase ? `${orCase.procedureNameAr} (${orCase.status})` : undefined
      },
      {
        key: 'icu_critical',
        titleAr: 'محطة العناية المركزة (ICU)',
        titleEn: 'Intensive Care Unit',
        dept: 'icu',
        descriptionAr: icuBed
          ? `سرير ${icuBed.bedNo} - تشخيص: ${icuBed.diagnosis} - MAP: ${icuBed.hemodynamics.map} - جهاز تنفس: ${icuBed.ventilator.isVentilated ? 'نعم (' + icuBed.ventilator.mode + ')' : 'لا'}`
          : 'لا تتطلب الحالة عناية مركزة حثيثة',
        status: icuBed ? 'in_progress' : 'not_required',
        badge: icuBed ? icuBed.bedNo : undefined,
        summaryText: icuBed ? `SOFA: ${icuBed.sofaScore} | GCS: ${icuBed.gcsScore}/15` : undefined
      },
      {
        key: 'discharge_clearance',
        titleAr: 'التخريج والمخالصة المالية ونفيس',
        titleEn: 'Discharge & Clearance',
        dept: 'billing',
        descriptionAr: (apt?.status === 'completed' && !wardBed && !icuBed && !orCase)
          ? 'تم إغلاق الزيارة واعتماد الفاتورة ومطالبة نفيس بنجاح وصرف التعليمات المنزلية'
          : 'المريض قيد المتابعة والعلاج السريري',
        status: (apt?.status === 'completed' && !wardBed && !icuBed && !orCase) ? 'completed' : 'pending',
        timestamp: apt?.consultationEndedAt,
        badge: 'مخالصة نفيس',
        summaryText: 'مخالصة تأمينية ومالية كاملة'
      }
    ];

    return {
      patient,
      currentStage,
      activeLocation,
      isAdmitted,
      steps,
      activeWardBed: wardBed,
      activeIcuBed: icuBed,
      activeSurgeryCase: orCase,
      activeErCase: erCase,
      activeAppointment: apt,
      latestConsultation: con,
      dischargedAt: apt?.consultationEndedAt,
      billingStatus: 'cleared'
    };
  };

  return (
    <HisContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        activeSecurityGroupId,
        setActiveSecurityGroupId,
        activeSecurityGroup,
        securityGroups: HIS_SECURITY_GROUPS,
        loginAsSecurityGroup,
        logout,
        isSwitchGroupModalOpen,
        setIsSwitchGroupModalOpen,
        currentDepartment,
        setCurrentDepartment,
        currentRole,
        setCurrentRole,
        userAvailableRoles,
        currentStaff,
        setCurrentStaff,
        allStaff: MOCK_STAFF,
        clinics,
        activeClinicId,
        setActiveClinicId,
        activeClinic,
        patients,
        appointments,
        labOrders,
        marItems,
        consultations,
        emergencyCode,
        emergencyCodeLocation,
        setEmergencyCode,
        triggerEmergencyCode,
        replayEmergencyCodeVoice,
        soundEnabled,
        setSoundEnabled,
        voiceAnnouncementEnabled,
        setVoiceAnnouncementEnabled,
        isSpeakingAnnouncement,
        announceCustomVoice,
        isPublicQueueModalOpen,
        setIsPublicQueueModalOpen,
        playChime,
        registerPatient,
        bookAppointment,
        checkInAppointment,
        markPatientArrived,
        markPatientNoShow,
        processCheckInTransaction,
        transactions,
        activeTransactionModalAppointmentId,
        setActiveTransactionModalAppointmentId,
        selectedReceiptTransaction,
        setSelectedReceiptTransaction,
        callPatient,
        startConsultation,
        saveVitals,
        saveConsultation,
        addPrescriptionToConsultation,
        removePrescriptionFromConsultation,
        orderLab,
        collectSample,
        administerMed,
        completeAppointment,
        activeConsultationAppointmentId,
        setActiveConsultationAppointmentId,
        printPrescriptionData,
        setPrintPrescriptionData,
        viewPatientModalId,
        setViewPatientModalId,
        standardsModalState,
        openStandardsModal,
        closeStandardsModal,

        // Clinical Progress Notes & Templates
        progressNotes,
        noteTemplates,
        addProgressNote,
        saveNoteTemplate,
        deleteNoteTemplate,
        activeProgressNotesPatientId,
        setActiveProgressNotesPatientId,
        openProgressNotesModal,

        erPatients,
        addErPatient,
        updateErPatientStatus,
        wardBeds,
        updateBedStatus,
        transferBed,
        dischargeBed,
        icuBeds,
        updateIcuVentilator,
        updateIcuInfusion,
        surgeryCases,
        updateSurgeryStatus,
        toggleWhoChecklist,
        updateAldreteScore,

        // Integrated Full Lifecycle Linking Actions
        admitPatientToWard,
        scheduleSurgery,
        admitToIcu,
        transferFromOr,
        stepDownFromIcu,
        dischargePatientFullCycle,
        getPatientLifecycleState,
        isLifecycleModalOpen,
        setIsLifecycleModalOpen,
        selectedLifecyclePatientId,
        openLifecycleModal,
        closeLifecycleModal,

        // Staff Clinical Experience & Universal Patient Workspace
        activeWorkArea,
        setActiveWorkArea,
        activeWorkspacePatientId,
        activeWorkspaceActivity,
        workspaceOrigin,
        openPatientWorkspace,
        closePatientWorkspace,
        switchWorkspaceActivity,
        careTransitions,
        clinicalTasks,
        addCareTransition,
        updateTransitionStatus,
        completeClinicalTask
      }}
    >
      {children}
    </HisContext.Provider>
  );
};


export const useHis = () => {
  const context = useContext(HisContext);
  if (!context) {
    throw new Error('useHis must be used within a HisProvider');
  }
  return context;
};
