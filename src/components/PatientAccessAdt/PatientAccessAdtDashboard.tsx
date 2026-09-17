import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  Bed,
  Layers,
  ArrowRightLeft,
  LogOut,
  History,
  Sparkles,
  Volume2,
  Bell,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  RefreshCw,
  Home
} from 'lucide-react';
import {
  AdtTab,
  PatientAccessRecord,
  AppointmentEntity,
  EncounterEntity,
  AdmissionRequestEntity,
  BedLocationEntity,
  CapacityOverviewMetrics,
  InternalTransferEntity,
  DischargeEntity,
  TemporaryLeaveEntity,
  TemporaryDiagnosticMovement,
  DischargeReadinessSummary,
  PatientMovementEvent,
  BedOperationalState
} from '../../types/patientAccessAdt';
import {
  INITIAL_PATIENT_ACCESS_RECORDS,
  INITIAL_APPOINTMENTS,
  INITIAL_ENCOUNTERS,
  INITIAL_ADMISSION_REQUESTS,
  INITIAL_BED_LOCATIONS,
  INITIAL_CAPACITY_METRICS,
  INITIAL_INTERNAL_TRANSFERS,
  INITIAL_DISCHARGES,
  INITIAL_TEMPORARY_LEAVE,
  INITIAL_TEMPORARY_DIAGNOSTIC_MOVEMENTS,
  INITIAL_MOVEMENT_EVENTS
} from '../../data/mockPatientAccessAdtData';
import { PatientAccessRegistrationView } from './PatientAccessRegistrationView';
import { ArrivalOpdFlowView } from './ArrivalOpdFlowView';
import { AdmissionOpsView } from './AdmissionOpsView';
import { BedManagementView } from './BedManagementView';
import { TransferOpsView } from './TransferOpsView';
import { DischargeOpsView } from './DischargeOpsView';
import { MovementHistoryView } from './MovementHistoryView';
import { AdtScenariosView } from './AdtScenariosView';
import { announcePatientCallSpeech } from '../../utils/audioAnnouncement';

interface PatientAccessAdtDashboardProps {
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
  onReturnToClinicalWorkspace?: () => void;
}

export const PatientAccessAdtDashboard: React.FC<PatientAccessAdtDashboardProps> = ({
  onOpenPatientWorkspace,
  onReturnToClinicalWorkspace
}) => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdtTab>('registration_search');

  // Core Mock Datasets in State for Real-Time Interactive Flow
  const [patients, setPatients] = useState<PatientAccessRecord[]>(INITIAL_PATIENT_ACCESS_RECORDS);
  const [appointments, setAppointments] = useState<AppointmentEntity[]>(INITIAL_APPOINTMENTS);
  const [encounters, setEncounters] = useState<EncounterEntity[]>(INITIAL_ENCOUNTERS);
  const [admissionRequests, setAdmissionRequests] = useState<AdmissionRequestEntity[]>(INITIAL_ADMISSION_REQUESTS);
  const [beds, setBeds] = useState<BedLocationEntity[]>(INITIAL_BED_LOCATIONS);
  const [capacity, setCapacity] = useState<CapacityOverviewMetrics>(INITIAL_CAPACITY_METRICS);
  const [transfers, setTransfers] = useState<InternalTransferEntity[]>(INITIAL_INTERNAL_TRANSFERS);
  const [discharges, setDischarges] = useState<DischargeEntity[]>(INITIAL_DISCHARGES);
  const [temporaryLeaves, setTemporaryLeaves] = useState<TemporaryLeaveEntity[]>(INITIAL_TEMPORARY_LEAVE);
  const [diagnosticMovements, setDiagnosticMovements] = useState<TemporaryDiagnosticMovement[]>(INITIAL_TEMPORARY_DIAGNOSTIC_MOVEMENTS);
  const [movementEvents, setMovementEvents] = useState<PatientMovementEvent[]>(INITIAL_MOVEMENT_EVENTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // System Toast / Banner Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRefreshLiveSnapshot = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showNotification('تم تحديث البيانات اللحظية ومزامنة الحالة وتأكيد عدم وجود تضارب (Snapshot Reconciled).');
    }, 500);
  };

  // 1. Patient Registration
  const handleRegisterNewPatient = (newPatient: PatientAccessRecord) => {
    setPatients(prev => [newPatient, ...prev]);
    // Add movement event
    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: 'None',
      patientId: newPatient.id,
      mrn: newPatient.mrn,
      patientNameAr: newPatient.fullNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'registration',
      actorName: 'سعود المالكي',
      actorRole: 'موظف القبول والتسجيل المركزي',
      note: 'فتح ملف جديد بالهوية الرسمية وتدقيق عدم التكرار.'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`تم تسجيل ملف المريض بنجاح برقم طبي آلي: ${newPatient.mrn}`);
  };

  // 2. Mark Arrival
  const handleMarkArrival = (appointmentId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(11, 16);
    let targetApt: AppointmentEntity | undefined;

    setAppointments(prev =>
      prev.map(a => {
        if (a.id === appointmentId) {
          targetApt = {
            ...a,
            status: 'arrived',
            arrivalRecordedAt: `اليوم ${nowStr}`
          };
          return targetApt;
        }
        return a;
      })
    );

    if (targetApt) {
      const newEvent: PatientMovementEvent = {
        id: `mov-${Date.now()}`,
        encounterId: 'Pending Check-in',
        patientId: targetApt.patientId,
        mrn: targetApt.mrn,
        patientNameAr: targetApt.patientNameAr,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        eventType: 'arrival',
        toLocation: `${targetApt.clinicNameAr} - بهو الانتظار`,
        actorName: 'بوابة استقبال العيادات',
        actorRole: 'الاستقبال المكتبي',
        note: 'تسجيل وصول المريض الفيزيائي للمبنى واستلام تذكرة الطابور.'
      };
      setMovementEvents(prev => [newEvent, ...prev]);
      showNotification(`تم تسجيل وصول المريض: ${targetApt.patientNameAr} (Physical Arrival Recorded)`);
    }
  };

  // 3. Administrative Check-in & Open OPD Encounter
  const handlePerformCheckIn = (appointmentId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(11, 16);
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    // Update appointment
    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'checked_in',
              checkInRecordedAt: `اليوم ${nowStr}`
            }
          : a
      )
    );

    // Create active OPD Encounter
    const newEncId = `enc-${Date.now()}`;
    const newEncounter: EncounterEntity = {
      id: newEncId,
      encounterNumber: `ENC-OPD-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'opd',
      status: 'in_progress',
      patientId: apt.patientId,
      mrn: apt.mrn,
      patientNameAr: apt.patientNameAr,
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      serviceName: apt.clinicNameAr,
      department: 'opd',
      currentLocation: {
        facility: 'مستشفى إدينا الرئيسي',
        building: 'برج العيادات التخصصية',
        floor: 'الدور الثاني',
        unit: apt.clinicNameAr,
        room: 'غرفة الفحص 1'
      },
      responsibleTeam: 'طاقم العيادات الصباحية',
      attendingPhysician: apt.doctorNameAr,
      originatingAppointmentId: apt.id
    };

    setEncounters(prev => [newEncounter, ...prev]);

    // Update patient active encounter
    setPatients(prev =>
      prev.map(p => (p.id === apt.patientId ? { ...p, activeEncounterId: newEncId } : p))
    );

    // Audit Event
    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: newEncounter.encounterNumber,
      patientId: apt.patientId,
      mrn: apt.mrn,
      patientNameAr: apt.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'check_in',
      toLocation: `${apt.clinicNameAr} - غرفة الفحص`,
      actorName: 'سعود المالكي',
      actorRole: 'موظف الاستقبال والتسجيل',
      note: 'تسجيل دخول إداري رسمي وفتح زيارة العيادة الخارجية (Encounter).'
    };
    setMovementEvents(prev => [newEvent, ...prev]);

    showNotification(`تم تسجيل الدخول الإداري وفتح الزيارة السريرية: ${newEncounter.encounterNumber}`);
  };

  // 4. Add Walk-In
  const handleAddWalkIn = (patient: PatientAccessRecord, clinicName: string, doctorName: string) => {
    const newAptId = `apt-${Date.now()}`;
    const nowTime = new Date().toISOString().replace('T', ' ').substring(11, 16);
    const newApt: AppointmentEntity = {
      id: newAptId,
      appointmentNumber: `APT-WALK-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patient.id,
      mrn: patient.mrn,
      patientNameAr: patient.fullNameAr,
      clinicId: 'c-walkin',
      clinicNameAr: clinicName,
      doctorId: 'doc-walkin',
      doctorNameAr: doctorName,
      scheduledTime: `اليوم ${nowTime}`,
      durationMinutes: 20,
      status: 'checked_in',
      bookingSource: 'reception_desk',
      reason: 'حالة غير مجدولة (Walk-in)',
      arrivalRecordedAt: `اليوم ${nowTime}`,
      checkInRecordedAt: `اليوم ${nowTime}`
    };

    setAppointments(prev => [newApt, ...prev]);

    // Open Encounter directly
    const newEncId = `enc-${Date.now()}`;
    const newEncounter: EncounterEntity = {
      id: newEncId,
      encounterNumber: `ENC-WALK-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'opd',
      status: 'in_progress',
      patientId: patient.id,
      mrn: patient.mrn,
      patientNameAr: patient.fullNameAr,
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      serviceName: clinicName,
      department: 'opd',
      currentLocation: {
        facility: 'مستشفى إدينا الرئيسي',
        building: 'برج العيادات التخصصية',
        floor: 'الدور الأرضي',
        unit: clinicName,
        room: 'غرفة الفرز والملاحظة'
      },
      responsibleTeam: 'طاقم العيادات غير المجدولة',
      attendingPhysician: doctorName,
      originatingAppointmentId: newAptId
    };

    setEncounters(prev => [newEncounter, ...prev]);
    showNotification(`تم إدراج المريض ${patient.fullNameAr} بدون موعد وفتح الزيارة بنجاح.`);
  };

  // 5. Admission Requests: Accept
  const handleAcceptAdmissionRequest = (requestId: string) => {
    setAdmissionRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, requestStatus: 'accepted' } : r))
    );
    showNotification('تم قبول واعتماد طلب التنويم من مكتب التنسيق المركزي.');
  };

  // 6. Assign Bed to Admission Request
  const handleAssignBedToRequest = (
    requestId: string,
    bedId: string,
    bedNumber: string,
    unitName: string
  ) => {
    const req = admissionRequests.find(r => r.id === requestId);
    if (!req) return;

    // Update request
    setAdmissionRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              placementStatus: 'bed_assigned',
              plannedBedId: bedId,
              plannedBedNumber: bedNumber,
              plannedUnitName: unitName
            }
          : r
      )
    );

    // Update Bed state to assigned
    setBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? {
              ...b,
              state: 'assigned',
              plannedPatientId: req.patientId,
              plannedPatientName: req.patientNameAr,
              plannedMrn: req.mrn
            }
          : b
      )
    );

    // Update capacity metrics
    setCapacity(prev => ({
      ...prev,
      availableBeds: Math.max(0, prev.availableBeds - 1),
      assignedBeds: prev.assignedBeds + 1
    }));

    showNotification(`تم تخصيص السرير ${bedNumber} بالقسم (${unitName}) للمريض: ${req.patientNameAr}`);
  };

  // 7. Finalize Admission (Patient Admitted to Bed)
  const handleFinalizeAdmission = (requestId: string) => {
    const req = admissionRequests.find(r => r.id === requestId);
    if (!req || !req.plannedBedId) return;

    // Update request
    setAdmissionRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, placementStatus: 'admitted' } : r))
    );

    // Update bed to occupied
    setBeds(prev =>
      prev.map(b =>
        b.id === req.plannedBedId
          ? {
              ...b,
              state: 'occupied',
              currentPatientId: req.patientId,
              currentPatientName: req.patientNameAr,
              currentMrn: req.mrn,
              currentEncounterId: req.encounterId,
              plannedPatientId: undefined,
              plannedPatientName: undefined,
              plannedMrn: undefined
            }
          : b
      )
    );

    // Update encounter location
    setEncounters(prev =>
      prev.map(e =>
        e.id === req.encounterId
          ? {
              ...e,
              department: 'ipd',
              currentLocation: {
                ...e.currentLocation,
                unit: req.plannedUnitName || 'جناح التنويم',
                bed: req.plannedBedNumber
              }
            }
          : e
      )
    );

    // Audit Event
    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: req.encounterId,
      patientId: req.patientId,
      mrn: req.mrn,
      patientNameAr: req.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'admission',
      fromLocation: req.sourceDepartment.toUpperCase(),
      toLocation: `${req.plannedUnitName} - سرير ${req.plannedBedNumber}`,
      actorName: 'منى العسيري',
      actorRole: 'منسق القبول والتنويم',
      reason: req.clinicalSummaryRef
    };
    setMovementEvents(prev => [newEvent, ...prev]);

    // Capacity update
    setCapacity(prev => ({
      ...prev,
      assignedBeds: Math.max(0, prev.assignedBeds - 1),
      occupiedBeds: prev.occupiedBeds + 1
    }));

    showNotification(`تم إتمام التنويم الفعلي للمريض ${req.patientNameAr} في سرير ${req.plannedBedNumber}`);
  };

  // 8. Update Bed State / Housekeeping Turnover
  const handleUpdateBedState = (bedId: string, newState: BedOperationalState) => {
    setBeds(prev => prev.map(b => (b.id === bedId ? { ...b, state: newState } : b)));
    showNotification(`تم تحديث حالة السرير التشغيلية إلى: ${newState}`);
  };

  const handleUpdateHousekeeping = (
    bedId: string,
    status: 'clean' | 'cleaning_in_progress' | 'dirty_turnover'
  ) => {
    setBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? {
              ...b,
              housekeepingStatus: status,
              state: status === 'clean' ? 'available' : 'cleaning'
            }
          : b
      )
    );
    showNotification(
      status === 'clean' ? 'تم اعتماد السرير كنظيف ومتاح فوراً للمرضى' : 'تم بدء دورة التعقيم والتنظيف'
    );
  };

  // 9. Internal Transfer: Accept, Dispatch, Complete
  const handleAcceptTransfer = (transferId: string) => {
    setTransfers(prev =>
      prev.map(t => (t.id === transferId ? { ...t, status: 'accepted' } : t))
    );
    showNotification('تم قبول طلب النقل الداخلي من قبل رئيس تمريض القسم المستهدف.');
  };

  const handleDispatchTransport = (transferId: string) => {
    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'in_transit',
              transportStatus: 'in_transit'
            }
          : t
      )
    );
    showNotification('تحرك فريق النقالين الداخلي وبدأ نقل المريض (In Transit).');
  };

  const handleCompleteTransfer = (transferId: string) => {
    const trf = transfers.find(t => t.id === transferId);
    if (!trf) return;

    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'completed',
              transportStatus: 'arrived',
              completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : t
      )
    );

    // Audit Event
    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: trf.currentEncounterId,
      patientId: trf.patientId,
      mrn: trf.mrn,
      patientNameAr: trf.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'internal_transfer',
      fromLocation: `${trf.sourceUnit} (${trf.sourceBed})`,
      toLocation: `${trf.destinationUnit} (${trf.destinationBed || 'سرير معتمد'})`,
      actorName: 'فريق النقل الداخلي والتمريض',
      actorRole: 'طاقم النقل',
      reason: trf.reason
    };
    setMovementEvents(prev => [newEvent, ...prev]);

    showNotification(`اكتمل نقل المريض ${trf.patientNameAr} بنجاح إلى ${trf.destinationUnit}.`);
  };

  // 10. Discharge: Execute Encounter Discharge
  const handleExecuteDischarge = (dischargeId: string) => {
    const dis = discharges.find(d => d.id === dischargeId);
    if (!dis) return;

    setDischarges(prev =>
      prev.map(d =>
        d.id === dischargeId
          ? {
              ...d,
              status: 'discharged',
              actualDischargeTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : d
      )
    );

    // Update encounter to discharged
    setEncounters(prev =>
      prev.map(e => (e.id === dis.encounterId ? { ...e, status: 'discharged' } : e))
    );

    // Audit Event
    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: dis.encounterId,
      patientId: dis.patientId,
      mrn: dis.mrn,
      patientNameAr: dis.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'actual_discharge',
      actorName: 'د. خالد القحطاني',
      actorRole: 'الاستشاري المعالج',
      note: 'إتمام الخروج الطبي والنظامي وإغلاق الزيارة التنويمية.'
    };
    setMovementEvents(prev => [newEvent, ...prev]);

    showNotification(`تم إتمام الخروج بالنظام للمريض ${dis.patientNameAr}. بانتظار المغادرة الفيزيائية.`);
  };

  // 11. Confirm Physical Departure (Vacate Bed & Trigger Turnover)
  const handleConfirmPhysicalDeparture = (dischargeId: string) => {
    const dis = discharges.find(d => d.id === dischargeId);
    if (!dis) return;

    setDischarges(prev =>
      prev.map(d =>
        d.id === dischargeId
          ? {
              ...d,
              status: 'departed',
              actualDepartureTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : d
      )
    );

    // Find bed and mark cleaning/dirty turnover
    setBeds(prev =>
      prev.map(b =>
        b.bedNumber === dis.bedNumber
          ? {
              ...b,
              state: 'cleaning',
              currentPatientId: undefined,
              currentPatientName: undefined,
              currentMrn: undefined,
              currentEncounterId: undefined,
              housekeepingStatus: 'dirty_turnover'
            }
          : b
      )
    );

    // Audit Event
    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: dis.encounterId,
      patientId: dis.patientId,
      mrn: dis.mrn,
      patientNameAr: dis.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'physical_departure',
      fromLocation: `${dis.unitName} - سرير ${dis.bedNumber}`,
      toLocation: 'المغادرة لخارج المستشفى',
      actorName: 'تمريض القسم',
      actorRole: 'تمريض الجناح',
      note: 'المغادرة الفيزيائية وإخلاء السرير وإحالته للتعقيم والتنظيف.'
    };
    setMovementEvents(prev => [newEvent, ...prev]);

    // Update capacity
    setCapacity(prev => ({
      ...prev,
      occupiedBeds: Math.max(0, prev.occupiedBeds - 1),
      cleaningTurnoverBeds: prev.cleaningTurnoverBeds + 1
    }));

    showNotification(`غادر المريض سرير ${dis.bedNumber}، وأُحيل السرير فوراً لدورة التعقيم.`);
  };

  // 12. Temporary Leave (Pass)
  const handleApproveTemporaryLeave = (leave: TemporaryLeaveEntity) => {
    setTemporaryLeaves(prev => [leave, ...prev]);
    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: leave.encounterId,
      patientId: leave.patientId,
      mrn: leave.mrn,
      patientNameAr: leave.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'temporary_leave_start',
      actorName: leave.approvedBy,
      actorRole: 'الاستشاري المعتمد',
      reason: leave.notes
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`تم اعتماد تصريح الإجازة المؤقتة للمريض: ${leave.patientNameAr}`);
  };

  const handleReturnTemporaryLeave = (leaveId: string) => {
    const leave = temporaryLeaves.find(l => l.id === leaveId);
    if (!leave) return;

    setTemporaryLeaves(prev =>
      prev.map(l =>
        l.id === leaveId
          ? {
              ...l,
              status: 'returned',
              actualReturnDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : l
      )
    );

    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: leave.encounterId,
      patientId: leave.patientId,
      mrn: leave.mrn,
      patientNameAr: leave.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'temporary_leave_return',
      actorName: 'تمريض الجناح',
      actorRole: 'طاقم تمريضي',
      note: 'عودة المريض التنويمي من الإجازة المؤقتة واستقراره بسريره.'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`تم تسجيل عودة المريض واستقراره بالسرير بنجاح.`);
  };

  // 9b. Cancel Pending Transfer (Pre-Movement Clinical Cancellation)
  const handleCancelPendingTransfer = (transferId: string, reason: string) => {
    const trf = transfers.find(t => t.id === transferId);
    if (!trf) return;
    if (trf.status === 'completed' || trf.status === 'cancelled') {
      showNotification('تعذر الإلغاء: طلب النقل تم تنفيذه بالفعل أو ملغى مسبقاً (Obsolete Action Prevented).');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'cancelled',
              cancellationReason: reason,
              cancelledAt: nowStr,
              cancelledBy: 'المنسق الطبي للقسم'
            }
          : t
      )
    );

    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: trf.currentEncounterId,
      patientId: trf.patientId,
      mrn: trf.mrn,
      patientNameAr: trf.patientNameAr,
      timestamp: nowStr,
      eventType: 'transfer_cancelled',
      fromLocation: `${trf.sourceUnit} (${trf.sourceBed})`,
      toLocation: `${trf.sourceUnit} (${trf.sourceBed})`,
      actorName: 'المنسق السريري',
      actorRole: 'منسق التمريض',
      reason: reason,
      note: 'تم إلغاء طلب النقل قبل بدء الحركة، وبقي المريض في سريره الأصلي دون إنشاء حركة خاطئة.'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`تم إلغاء طلب النقل الداخلي للمريض ${trf.patientNameAr} قبل التحرك.`);
  };

  // 9c. Correct Completed Transfer (Erroneous Movement Reversal / IHE PAM)
  const handleCorrectCompletedTransfer = (transferId: string, correctionReason: string, revertBed: boolean) => {
    const trf = transfers.find(t => t.id === transferId);
    if (!trf) return;
    if (trf.isEnteredInError) {
      showNotification('تنبيه: تم تصحيح هذه الحركة سابقاً بالفعل.');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId
          ? {
              ...t,
              isEnteredInError: true,
              isCorrected: true,
              correctionReason,
              correctedAt: nowStr,
              correctedBy: 'رئيس السجلات الطبية (HIM)'
            }
          : t
      )
    );

    if (revertBed) {
      // Revert encounter location
      setEncounters(prev =>
        prev.map(e =>
          e.id === trf.currentEncounterId
            ? {
                ...e,
                currentLocation: {
                  ...e.currentLocation,
                  unit: trf.sourceUnit,
                  bed: trf.sourceBed
                }
              }
            : e
        )
      );

      // Revert beds
      setBeds(prev =>
        prev.map(b => {
          if (b.bedNumber === trf.destinationBed) {
            return {
              ...b,
              state: 'available',
              currentPatientId: undefined,
              currentPatientName: undefined,
              currentMrn: undefined,
              currentEncounterId: undefined,
              housekeepingStatus: 'clean'
            };
          }
          if (b.bedNumber === trf.sourceBed) {
            return {
              ...b,
              state: 'occupied',
              currentPatientId: trf.patientId,
              currentPatientName: trf.patientNameAr,
              currentMrn: trf.mrn,
              currentEncounterId: trf.currentEncounterId
            };
          }
          return b;
        })
      );
    }

    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: trf.currentEncounterId,
      patientId: trf.patientId,
      mrn: trf.mrn,
      patientNameAr: trf.patientNameAr,
      timestamp: nowStr,
      eventType: 'movement_correction',
      fromLocation: `${trf.destinationUnit} (${trf.destinationBed || ''})`,
      toLocation: `${trf.sourceUnit} (${trf.sourceBed})`,
      actorName: 'رئيس السجلات الطبية (HIM)',
      actorRole: 'مراجع جودة السجلات الطبية',
      reason: correctionReason,
      note: 'تصحيح حركة مسجلة بالخطأ واسترجاع تخصيص السرير الأصلي وفق معايير IHE PAM.'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`تم اعتماد تصريح تصحيح الحركة واسترجاع السرير الأصلي بنجاح.`);
  };

  // 9d. Temporary Diagnostic Movement Handlers (Bed Retention Invariant)
  const handleStartDiagnosticMovement = (movementId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(11, 16);
    const diag = diagnosticMovements.find(d => d.id === movementId);
    if (!diag) return;

    setDiagnosticMovements(prev =>
      prev.map(d =>
        d.id === movementId
          ? {
              ...d,
              status: 'departed',
              departedAt: `اليوم ${nowStr}`
            }
          : d
      )
    );

    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: diag.currentEncounterId,
      patientId: diag.patientId,
      mrn: diag.mrn,
      patientNameAr: diag.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'diagnostic_movement_departure',
      fromLocation: `${diag.inpatientUnit} (${diag.inpatientBed})`,
      toLocation: diag.diagnosticDestination,
      actorName: 'طاقم النقل التمريضي',
      actorRole: 'نقل المرضى الداخلي',
      reason: diag.reason,
      note: 'انتقال مؤقت للأشعة مع حفظ السرير التنويمي محجوزاً (Bed Retention: Retain Bed Invariant).'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`غادر المريض ${diag.patientNameAr} إلى ${diag.diagnosticDestination} مع استمرار حجز سريره.`);
  };

  const handleReturnDiagnosticMovement = (movementId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(11, 16);
    const diag = diagnosticMovements.find(d => d.id === movementId);
    if (!diag) return;

    setDiagnosticMovements(prev =>
      prev.map(d =>
        d.id === movementId
          ? {
              ...d,
              status: 'returned',
              returnedAt: `اليوم ${nowStr}`
            }
          : d
      )
    );

    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: diag.currentEncounterId,
      patientId: diag.patientId,
      mrn: diag.mrn,
      patientNameAr: diag.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'diagnostic_movement_return',
      fromLocation: diag.diagnosticDestination,
      toLocation: `${diag.inpatientUnit} (${diag.inpatientBed})`,
      actorName: 'تمريض القسم',
      actorRole: 'طاقم تمريضي',
      note: 'عودة المريض التنويمي من الفحص التشخيصي واستقراره بسريره التنويمي.'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`عادت الحالة واستقرت بسريرها التنويمي: ${diag.inpatientBed}`);
  };

  // 9e. Decoupled Clinical Encounter Start
  const handleStartClinicalEncounter = (encounterId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(11, 16);
    const enc = encounters.find(e => e.id === encounterId);
    if (!enc) return;

    setEncounters(prev =>
      prev.map(e =>
        e.id === encounterId
          ? {
              ...e,
              status: 'in_progress',
              clinicalCareStartedAt: `اليوم ${nowStr}`
            }
          : e
      )
    );

    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: enc.encounterNumber,
      patientId: enc.patientId,
      mrn: enc.mrn,
      patientNameAr: enc.patientNameAr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      eventType: 'check_in',
      toLocation: enc.currentLocation.room,
      actorName: enc.attendingPhysician || 'الطبيب المعالج',
      actorRole: 'طبيب العيادة',
      note: 'بدء الفحص السريري الفعلي مع الطبيب وتوثيق بدء الرعاية الطبية (Decoupled Clinical Start).'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`تم تسجيل بدء الفحص السريري للزيارة: ${enc.encounterNumber}`);
  };

  // 9f. Administrative Encounter Closure
  const handleAdministrativeClosure = (dischargeId: string) => {
    const dis = discharges.find(d => d.id === dischargeId);
    if (!dis) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setDischarges(prev =>
      prev.map(d =>
        d.id === dischargeId
          ? {
              ...d,
              status: 'completed',
              administrativeCompletionTimestamp: nowStr
            }
          : d
      )
    );

    setEncounters(prev =>
      prev.map(e =>
        e.id === dis.encounterId
          ? {
              ...e,
              status: 'completed',
              completedAt: nowStr
            }
          : e
      )
    );

    const newEvent: PatientMovementEvent = {
      id: `mov-${Date.now()}`,
      encounterId: dis.encounterId,
      patientId: dis.patientId,
      mrn: dis.mrn,
      patientNameAr: dis.patientNameAr,
      timestamp: nowStr,
      eventType: 'actual_discharge',
      actorName: 'سارة الدوسري',
      actorRole: 'مدقق السجلات الطبية والمحاسبة',
      note: 'الإغلاق الإداري والمالي النهائي للزيارة التنويمية (Administrative Encounter Closure).'
    };
    setMovementEvents(prev => [newEvent, ...prev]);
    showNotification(`تم الإغلاق الإداري النهائي للزيارة ${dis.encounterId} واعتماد السجلات.`);
  };

  // 9g. Update Readiness Checklist
  const handleUpdateReadiness = (dischargeId: string, updatedReadiness: Partial<DischargeReadinessSummary>) => {
    setDischarges(prev =>
      prev.map(d =>
        d.id === dischargeId
          ? {
              ...d,
              readiness: {
                ...d.readiness,
                ...updatedReadiness
              }
            }
          : d
      )
    );
    showNotification('تم تحديث قائمة جاهزية واستحقاقات الخروج للمريض.');
  };

  // 13. Audio Announcement Test
  const handleTriggerVoiceTest = () => {
    announcePatientCallSpeech({
      ticketNo: 'A-102',
      patientName: 'عبد الرحمن الشمري',
      clinicName: 'عيادة أمراض القلب التخصصية',
      roomNo: 'غرفة استشارة 204',
      dialect: 'standard'
    });
    showNotification('جاري تشغيل النداء الصوتي العربي عبر مكبرات المستشفى...');
  };

  const navTabs = [
    { id: 'registration_search', label: 'تسجيل وهوية المرضى', icon: Users, badge: `${patients.length}` },
    { id: 'arrival_opd_flow', label: 'تدفق العيادات والنداء', icon: CalendarCheck, badge: `${appointments.length}` },
    { id: 'admission_ops', label: 'تنسيق طلبات التنويم', icon: Bed, badge: `${admissionRequests.filter(r => r.placementStatus !== 'admitted').length}` },
    { id: 'bed_management', label: 'إدارة الأسرّة والسعة', icon: Layers, badge: `${beds.length}` },
    { id: 'transfer_ops', label: 'النقل الداخلي والنقالين', icon: ArrowRightLeft, badge: `${transfers.filter(t => t.status !== 'completed').length}` },
    { id: 'discharge_ops', label: 'الخروج والمغادرة المؤقتة', icon: LogOut, badge: `${discharges.filter(d => d.status !== 'departed').length}` },
    { id: 'movement_history', label: 'سجل مسار تحركات المريض', icon: History, badge: `${movementEvents.length}` },
    { id: 'demo_scenarios', label: 'دليل السيناريوهات التفاعلي', icon: Sparkles, badge: '7' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Module Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-900">
                    نظام تسجيل المرضى وإدارة تدفق الأسرّة (ADT & Patient Flow)
                  </h1>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    UI/UX Prototype
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Patient Access • Central Registration • Bed Coordination • Internal Transport • Discharge Operations
                </p>
              </div>
            </div>

            {/* Quick Global Action Header */}
            <div className="flex items-center gap-2">
              {/* Refresh Live Snapshot & Conflict Safeguards */}
              <button
                onClick={handleRefreshLiveSnapshot}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                title="تحديث البيانات اللحظية ومزامنة الحالة السريرية وتفادي العمليات المتقادمة (Refresh Data & Conflict Safeguards)"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث البيانات اللحظية</span>
              </button>

              {/* Quick PA Test */}
              <button
                onClick={handleTriggerVoiceTest}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                title="تشغيل نداء صوتي تجريبي بنطق عربي سليم"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">تجربة النداء الصوتي</span>
              </button>

              {/* Return to Clinical Workspace Baseline button */}
              {onReturnToClinicalWorkspace && (
                <button
                  onClick={onReturnToClinicalWorkspace}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">العودة للبيئة السريرية المعتمدة</span>
                </button>
              )}
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdtTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'registration_search' && (
          <PatientAccessRegistrationView
            patients={patients}
            onSelectPatient={p => {}}
            onRegisterNewPatient={handleRegisterNewPatient}
            onOpenPatientWorkspace={onOpenPatientWorkspace}
          />
        )}

        {activeTab === 'arrival_opd_flow' && (
          <ArrivalOpdFlowView
            appointments={appointments}
            encounters={encounters}
            patients={patients}
            onMarkArrival={handleMarkArrival}
            onPerformCheckIn={handlePerformCheckIn}
            onStartClinicalEncounter={handleStartClinicalEncounter}
            onAddWalkIn={handleAddWalkIn}
            onOpenPatientWorkspace={onOpenPatientWorkspace}
          />
        )}

        {activeTab === 'admission_ops' && (
          <AdmissionOpsView
            admissionRequests={admissionRequests}
            beds={beds}
            onAcceptRequest={handleAcceptAdmissionRequest}
            onAssignBedToRequest={handleAssignBedToRequest}
            onFinalizeAdmission={handleFinalizeAdmission}
            onOpenPatientWorkspace={onOpenPatientWorkspace}
          />
        )}

        {activeTab === 'bed_management' && (
          <BedManagementView
            beds={beds}
            capacity={capacity}
            onUpdateBedState={handleUpdateBedState}
            onUpdateHousekeeping={handleUpdateHousekeeping}
            onOpenPatientWorkspace={onOpenPatientWorkspace}
          />
        )}

        {activeTab === 'transfer_ops' && (
          <TransferOpsView
            transfers={transfers}
            diagnosticMovements={diagnosticMovements}
            onAcceptTransfer={handleAcceptTransfer}
            onDispatchTransport={handleDispatchTransport}
            onCompleteTransfer={handleCompleteTransfer}
            onCancelPendingTransfer={handleCancelPendingTransfer}
            onCorrectCompletedTransfer={handleCorrectCompletedTransfer}
            onStartDiagnosticMovement={handleStartDiagnosticMovement}
            onReturnDiagnosticMovement={handleReturnDiagnosticMovement}
            onOpenPatientWorkspace={onOpenPatientWorkspace}
          />
        )}

        {activeTab === 'discharge_ops' && (
          <DischargeOpsView
            discharges={discharges}
            temporaryLeaves={temporaryLeaves}
            onExecuteDischarge={handleExecuteDischarge}
            onConfirmPhysicalDeparture={handleConfirmPhysicalDeparture}
            onAdministrativeClosure={handleAdministrativeClosure}
            onUpdateReadiness={handleUpdateReadiness}
            onApproveTemporaryLeave={handleApproveTemporaryLeave}
            onReturnTemporaryLeave={handleReturnTemporaryLeave}
            onOpenPatientWorkspace={onOpenPatientWorkspace}
          />
        )}

        {activeTab === 'movement_history' && (
          <MovementHistoryView
            events={movementEvents}
            onOpenPatientWorkspace={onOpenPatientWorkspace}
          />
        )}

        {activeTab === 'demo_scenarios' && (
          <AdtScenariosView
            onSwitchTab={tab => setActiveTab(tab)}
            onTriggerVoiceTest={handleTriggerVoiceTest}
          />
        )}
      </main>
    </div>
  );
};
