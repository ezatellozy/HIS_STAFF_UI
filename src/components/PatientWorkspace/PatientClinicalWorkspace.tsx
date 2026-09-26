import React from 'react';
import {
  FileText,
  HeartPulse,
  FlaskConical,
  Pill,
  AlertTriangle,
  FileCheck,
  HeartHandshake,
  GitFork,
  Activity,
  Layers,
  Printer,
  ChevronRight,
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { ClinicalActivity } from '../../types/clinicalWorkspace';
import { PatientSafetyBanner } from './PatientSafetyBanner';
import { SummaryActivity } from './activities/SummaryActivity';
import { JourneyTimelineActivity } from './activities/JourneyTimelineActivity';
import { NotesActivity } from './activities/NotesActivity';
import { VitalsFlowsheetActivity } from './activities/VitalsFlowsheetActivity';
import { OrdersActivity } from './activities/OrdersActivity';
import { ResultsActivity } from './activities/ResultsActivity';
import { MedicationsActivity } from './activities/MedicationsActivity';
import { HistoryAssessmentActivity } from './activities/HistoryAssessmentActivity';
import { ProblemsActivity } from './activities/ProblemsActivity';
import { CarePlanActivity } from './activities/CarePlanActivity';
import { MOCK_SPECIMENS } from '../../data/mockLaboratoryOpsData';
import { MOCK_PATIENTS } from '../../data/mockHisData';
import {
  INITIAL_PATIENT_ACCESS_RECORDS,
  INITIAL_ADMISSION_REQUESTS,
  INITIAL_BED_LOCATIONS
} from '../../data/mockPatientAccessAdtData';
import { INITIAL_MEDICAL_RECORD_CASES } from '../../data/mockHimOpsData';

export const PatientClinicalWorkspace: React.FC = () => {
  const {
    activeWorkspacePatientId,
    activeWorkspaceActivity,
    switchWorkspaceActivity,
    patients,
    closePatientWorkspace,
    careTransitions,
    clinicalTasks,
    erPatients,
    wardBeds,
    icuBeds,
    surgeryCases,
    openPatientWorkspace
  } = useHis();

  if (!activeWorkspacePatientId) {
    return null;
  }

  const targetIdClean = activeWorkspacePatientId.trim().toLowerCase();

  // 1. Direct match by ID or MRN in context patients
  let patient = patients.find(
    p => p.id.toLowerCase() === targetIdClean || p.mrn.toLowerCase() === targetIdClean || p.nationalId === activeWorkspacePatientId.trim()
  );

  // 2. Match in MOCK_PATIENTS
  if (!patient && MOCK_PATIENTS) {
    patient = MOCK_PATIENTS.find(
      p =>
        p.id.toLowerCase() === targetIdClean ||
        p.mrn.toLowerCase() === targetIdClean ||
        p.nationalId === activeWorkspacePatientId.trim()
    );
  }

  // 3. Match from Patient Access / ADT Records (e.g. MRN-2026-1042 / سارة عبد الله العتيبي)
  if (!patient && INITIAL_PATIENT_ACCESS_RECORDS) {
    const accessRec = INITIAL_PATIENT_ACCESS_RECORDS.find(
      r =>
        r.id.toLowerCase() === targetIdClean ||
        r.mrn.toLowerCase() === targetIdClean ||
        (r.nationalId && r.nationalId === activeWorkspacePatientId.trim()) ||
        (r.activeEncounterId && r.activeEncounterId.toLowerCase() === targetIdClean)
    );
    if (accessRec) {
      let age = 34;
      if (accessRec.dob) {
        const birthYear = parseInt(accessRec.dob.split('-')[0], 10);
        if (!isNaN(birthYear)) {
          age = Math.max(0, 2026 - birthYear);
        }
      }
      const admReq = INITIAL_ADMISSION_REQUESTS.find(
        a => a.patientId === accessRec.id || a.mrn.toLowerCase() === accessRec.mrn.toLowerCase()
      );
      patient = {
        id: accessRec.id,
        mrn: accessRec.mrn,
        name: accessRec.fullNameAr,
        fullNameAr: accessRec.fullNameAr,
        fullNameEn: accessRec.fullNameEn,
        gender: accessRec.gender as 'male' | 'female',
        dob: accessRec.dob || '1992-09-22',
        age,
        nationalId: accessRec.nationalId || (accessRec as any).passportNo || '1048291048',
        bloodType: accessRec.gender === 'female' ? 'B+' : 'O+',
        bloodGroup: accessRec.gender === 'female' ? 'B+' : 'O+',
        phone: accessRec.mobile || '+966 54 321 9876',
        email: accessRec.email || `${accessRec.mrn.toLowerCase()}@hospital.org`,
        address: typeof accessRec.address === 'string' ? accessRec.address : `${accessRec.address?.city || 'الرياض'} - ${accessRec.address?.district || 'حي الملقا'}`,
        insuranceProvider: 'التعاونية للتأمين الطبي (Tawuniya)',
        insurancePolicyNo: `TAW-${accessRec.mrn.replace('MRN-', '')}`,
        policyNumber: `TAW-${accessRec.mrn.replace('MRN-', '')}`,
        insuranceClass: 'VIP',
        insuranceCoveragePercent: 90,
        emergencyContact: {
          name: accessRec.emergencyContact?.name || 'المرافق المعتمد',
          relation: accessRec.emergencyContact?.relationship || 'مرافق',
          phone: accessRec.emergencyContact?.mobile || accessRec.mobile || '+966 50 888 7766'
        },
        chronicConditions: admReq ? [admReq.clinicalSummaryRef] : ['حماض كيتوني سكري (DKA) تحت المعالجة مع استجابة للأنسولين الوريدي'],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: accessRec.registeredAt || '2026-02-01'
      };
    }
  }

  // 4. Match from Admission Requests (ADT Admissions)
  if (!patient && INITIAL_ADMISSION_REQUESTS) {
    const admReq = INITIAL_ADMISSION_REQUESTS.find(
      a =>
        a.id.toLowerCase() === targetIdClean ||
        a.requestNumber.toLowerCase() === targetIdClean ||
        a.mrn.toLowerCase() === targetIdClean ||
        (a.patientId && a.patientId.toLowerCase() === targetIdClean)
    );
    if (admReq) {
      patient = {
        id: admReq.patientId || admReq.id,
        mrn: admReq.mrn,
        name: admReq.patientNameAr,
        fullNameAr: admReq.patientNameAr,
        fullNameEn: admReq.patientNameAr,
        gender: (admReq.patientGender as any) || 'female',
        dob: `${2026 - (admReq.patientAge || 32)}-01-01`,
        age: admReq.patientAge || 32,
        nationalId: '1048291048',
        bloodType: 'B+',
        bloodGroup: 'B+',
        phone: '+966 54 321 9876',
        email: `${admReq.mrn.toLowerCase()}@hospital.org`,
        address: 'الرياض، المملكة العربية السعودية',
        insuranceProvider: 'التعاونية للتأمين الطبي (Tawuniya)',
        insurancePolicyNo: `POL-${admReq.mrn.replace('MRN-', '')}`,
        policyNumber: `POL-${admReq.mrn.replace('MRN-', '')}`,
        insuranceClass: 'VIP',
        insuranceCoveragePercent: 90,
        emergencyContact: {
          name: 'المرافق المعتمد',
          relation: 'مرافق',
          phone: '+966 50 888 7766'
        },
        chronicConditions: [admReq.clinicalSummaryRef || 'متابعة سريرية نشطة'],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: admReq.submittedAt || '2026-09-13'
      };
    }
  }

  // 5. Match from Bed Locations
  if (!patient && INITIAL_BED_LOCATIONS) {
    const bedLoc = INITIAL_BED_LOCATIONS.find(
      b =>
        (b.currentPatientId && b.currentPatientId.toLowerCase() === targetIdClean) ||
        (b.currentMrn && b.currentMrn.toLowerCase() === targetIdClean) ||
        (b.plannedMrn && b.plannedMrn.toLowerCase() === targetIdClean) ||
        (b.plannedPatientId && b.plannedPatientId.toLowerCase() === targetIdClean)
    );
    if (bedLoc && (bedLoc.currentPatientName || bedLoc.plannedPatientName)) {
      const pName = bedLoc.currentPatientName || bedLoc.plannedPatientName || 'مريض منوم';
      const pMrn = bedLoc.currentMrn || bedLoc.plannedMrn || activeWorkspacePatientId;
      patient = {
        id: bedLoc.currentPatientId || bedLoc.plannedPatientId || activeWorkspacePatientId,
        mrn: pMrn,
        name: pName,
        fullNameAr: pName,
        fullNameEn: pName,
        gender: bedLoc.genderSuitability === 'female' ? 'female' : 'male',
        dob: '1982-01-01',
        age: 44,
        nationalId: '1092837465',
        bloodType: 'O+',
        bloodGroup: 'O+',
        phone: '+966 50 123 4567',
        email: 'patient@hospital.org',
        address: 'الرياض، المملكة العربية السعودية',
        insuranceProvider: 'التأمين الطبي للتنويم',
        insurancePolicyNo: `POL-${pMrn.replace('MRN-', '')}`,
        policyNumber: `POL-${pMrn.replace('MRN-', '')}`,
        insuranceClass: 'A',
        insuranceCoveragePercent: 85,
        emergencyContact: {
          name: 'المرافق المعتمد',
          relation: 'مرافق',
          phone: '+966 55 987 6543'
        },
        chronicConditions: [`تنويم في ${bedLoc.unitName} - سرير ${bedLoc.bedNumber}`],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: '2026-09-10'
      };
    }
  }

  // 6. Match from Medical Records Cases (HIM)
  if (!patient && INITIAL_MEDICAL_RECORD_CASES) {
    const himCase = INITIAL_MEDICAL_RECORD_CASES.find(
      c =>
        c.patientId.toLowerCase() === targetIdClean ||
        c.mrn.toLowerCase() === targetIdClean
    );
    if (himCase) {
      patient = {
        id: himCase.patientId || himCase.id,
        mrn: himCase.mrn,
        name: himCase.patientName,
        fullNameAr: himCase.patientName,
        fullNameEn: himCase.patientName,
        gender: 'male',
        dob: '1980-01-01',
        age: 46,
        nationalId: '1092837465',
        bloodType: 'O+',
        bloodGroup: 'O+',
        phone: '+966 50 123 4567',
        email: 'patient@hospital.org',
        address: 'الرياض، المملكة العربية السعودية',
        insuranceProvider: 'التأمين الطبي العام',
        insurancePolicyNo: `POL-${himCase.mrn.replace('MRN-', '')}`,
        policyNumber: `POL-${himCase.mrn.replace('MRN-', '')}`,
        insuranceClass: 'A',
        insuranceCoveragePercent: 80,
        emergencyContact: {
          name: 'المرافق',
          relation: 'مرافق',
          phone: '+966 50 123 4568'
        },
        chronicConditions: [`سجل طبي بقسم ${himCase.departmentName}`],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: himCase.admissionDate || '2026-09-01'
      };
    }
  }

  // 3. Match from ER cases
  if (!patient && erPatients) {
    const erCase = erPatients.find(
      e => e.patientId === activeWorkspacePatientId || e.id === activeWorkspacePatientId || e.mrn === activeWorkspacePatientId
    );
    if (erCase) {
      patient = patients.find(p => p.id === erCase.patientId || p.mrn === erCase.mrn) || {
        id: erCase.patientId || erCase.id,
        mrn: erCase.mrn,
        name: erCase.patientName,
        fullNameAr: erCase.patientName,
        fullNameEn: erCase.patientName,
        gender: erCase.gender,
        dob: `${2026 - erCase.age}-01-01`,
        age: erCase.age,
        bloodType: 'O+',
        phone: '+20 101 555 3321',
        email: 'patient@hospital.org',
        address: 'القاهرة، مصر',
        insuranceProvider: 'التأمين الطبي للطوارئ',
        insurancePolicyNo: erCase.mrn,
        insuranceClass: 'VIP',
        insuranceCoveragePercent: 90,
        emergencyContact: {
          name: 'المرافق الطبي',
          relation: 'مرافق',
          phone: '+20 101 555 3322'
        },
        chronicConditions: [erCase.chiefComplaint],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: '2026-09-08'
      };
    }
  }

  // 4. Match from Ward Beds
  if (!patient && wardBeds) {
    const wardBed = wardBeds.find(
      b => b.patientId === activeWorkspacePatientId || b.id === activeWorkspacePatientId || b.mrn === activeWorkspacePatientId
    );
    if (wardBed && wardBed.patientName) {
      patient = patients.find(p => p.id === wardBed.patientId || p.mrn === wardBed.mrn) || {
        id: wardBed.patientId || wardBed.id,
        mrn: wardBed.mrn || `MRN-${wardBed.bedNumber}`,
        name: wardBed.patientName,
        fullNameAr: wardBed.patientName,
        fullNameEn: wardBed.patientName,
        gender: wardBed.gender || 'male',
        dob: `${2026 - (wardBed.age || 45)}-01-01`,
        age: wardBed.age || 45,
        bloodType: 'B+',
        phone: '+20 109 444 3322',
        email: 'patient@hospital.org',
        address: 'القاهرة، مصر',
        insuranceProvider: 'تأمين التنويم الداخلي',
        insurancePolicyNo: wardBed.mrn || 'IPD-POL',
        insuranceClass: 'A',
        insuranceCoveragePercent: 85,
        emergencyContact: {
          name: 'المرافق',
          relation: 'مرافق',
          phone: '+20 109 444 3311'
        },
        chronicConditions: wardBed.diagnosis ? [wardBed.diagnosis] : [],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: wardBed.admitDate || '2026-09-06'
      };
    }
  }

  // 5. Match from ICU Beds
  if (!patient && icuBeds) {
    const icuBed = icuBeds.find(
      i => i.patientId === activeWorkspacePatientId || i.id === activeWorkspacePatientId || i.mrn === activeWorkspacePatientId
    );
    if (icuBed && icuBed.patientName) {
      patient = patients.find(p => p.id === icuBed.patientId || p.mrn === icuBed.mrn) || {
        id: icuBed.patientId || icuBed.id,
        mrn: icuBed.mrn,
        name: icuBed.patientName,
        fullNameAr: icuBed.patientName,
        fullNameEn: icuBed.patientName,
        gender: icuBed.gender,
        dob: `${2026 - icuBed.age}-01-01`,
        age: icuBed.age,
        bloodType: 'A+',
        phone: '+20 100 888 1122',
        email: 'patient@hospital.org',
        address: 'الدقي، الجيزة',
        insuranceProvider: 'تأمين الرعاية المركزة',
        insurancePolicyNo: icuBed.mrn,
        insuranceClass: 'VIP',
        insuranceCoveragePercent: 100,
        emergencyContact: {
          name: 'المرافق',
          relation: 'مرافق',
          phone: '+20 100 888 1133'
        },
        chronicConditions: [icuBed.diagnosis],
        allergies: ['سلفا (Sulfonamides)'],
        registeredAt: '2026-09-05'
      };
    }
  }

  // 6. Match from Surgery Cases
  if (!patient && surgeryCases) {
    const surgeryCase = surgeryCases.find(
      s => s.patientId === activeWorkspacePatientId || s.id === activeWorkspacePatientId || s.mrn === activeWorkspacePatientId
    );
    if (surgeryCase && surgeryCase.patientName) {
      patient = patients.find(p => p.id === surgeryCase.patientId || p.mrn === surgeryCase.mrn) || {
        id: surgeryCase.patientId || surgeryCase.id,
        mrn: surgeryCase.mrn,
        name: surgeryCase.patientName,
        fullNameAr: surgeryCase.patientName,
        fullNameEn: surgeryCase.patientName,
        gender: 'male',
        dob: `${2026 - surgeryCase.age}-01-01`,
        age: surgeryCase.age,
        bloodType: 'O+',
        phone: '+20 100 444 5566',
        email: 'patient@hospital.org',
        address: 'القاهرة، مصر',
        insuranceProvider: 'تأمين جراحي',
        insurancePolicyNo: surgeryCase.mrn,
        insuranceClass: 'VIP',
        insuranceCoveragePercent: 95,
        emergencyContact: {
          name: 'المرافق',
          relation: 'مرافق',
          phone: '+20 100 444 5577'
        },
        chronicConditions: [surgeryCase.procedureNameAr],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: '2026-09-07'
      };
    }
  }

  // 7. Mock Prototype Adapter Only (e.g. p-1 ... p-5)
  // ARCHITECTURAL NOTE: In production HIS, this cross-module resolution uses canonical
  // patient/encounter/source identifiers (e.g. Master Patient Index / Enterprise MPI & Encounter ID),
  // not manual mock prototype mappings.
  if (!patient && MOCK_SPECIMENS) {
    const specimen = MOCK_SPECIMENS.find(
      s => s.patientId === activeWorkspacePatientId || s.mrn.toLowerCase() === activeWorkspacePatientId.toLowerCase()
    );
    if (specimen) {
      patient = patients.find(p => p.id === specimen.patientId || p.mrn.toLowerCase() === specimen.mrn.toLowerCase()) || {
        id: specimen.patientId,
        mrn: specimen.mrn,
        name: specimen.patientName,
        fullNameAr: specimen.patientName,
        fullNameEn: specimen.patientName,
        gender: 'male',
        dob: '1984-06-15',
        age: 42,
        bloodType: 'O+',
        bloodGroup: 'O+',
        nationalId: '1099482711',
        phone: '+20 102 333 4455',
        email: 'patient@hospital.org',
        address: 'الرياض / القاهرة',
        insuranceProvider: 'بوبا العربية (Bupa Global)',
        insurancePolicyNo: specimen.mrn,
        insuranceClass: 'VIP',
        insuranceCoveragePercent: 90,
        emergencyContact: {
          name: 'المرافق الطبي',
          relation: 'مرافق',
          phone: '+20 102 333 4456'
        },
        chronicConditions: ['متابعة مخبرية سريرية'],
        allergies: ['لا توجد حساسية معروفة (NKDA)'],
        registeredAt: '2026-09-01'
      };
    }
  }

  // 12. Universal Master Patient Index (MPI) Dynamic Synthesizer:
  // Guarantees that any MRN or patient identifier from any department/sub-system opens a complete clinical workspace
  if (!patient && activeWorkspacePatientId) {
    const cleanId = activeWorkspacePatientId.trim();
    const formattedMrn = cleanId.toUpperCase().startsWith('MRN-') || cleanId.toUpperCase().startsWith('TEMP-') ? cleanId.toUpperCase() : `MRN-${cleanId.toUpperCase()}`;
    patient = {
      id: cleanId,
      mrn: formattedMrn,
      name: `مريض مسجل (${formattedMrn})`,
      fullNameAr: `مريض مسجل (${formattedMrn})`,
      fullNameEn: `Registered Patient (${formattedMrn})`,
      gender: 'male',
      dob: '1988-06-15',
      age: 38,
      nationalId: '1099482711',
      bloodType: 'O+',
      bloodGroup: 'O+',
      phone: '+966 50 123 4567',
      email: `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}@hospital.org`,
      address: 'المملكة العربية السعودية',
      insuranceProvider: 'التعاونية للتأمين (Tawuniya)',
      insurancePolicyNo: `POL-${cleanId}`,
      policyNumber: `POL-${cleanId}`,
      insuranceClass: 'VIP',
      insuranceCoveragePercent: 90,
      emergencyContact: {
        name: 'المرافق الطبي المعتمد',
        relation: 'مرافق',
        phone: '+966 50 123 4568'
      },
      chronicConditions: ['متابعة سريرية نشطة'],
      allergies: ['لا توجد حساسية معروفة (NKDA)'],
      registeredAt: '2026-09-01'
    };
  }

  if (!patient) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-6 shadow-xs max-w-xl mx-auto my-8">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">تعذر العثور على ملف المريض المحدد</h3>
          <p className="text-slate-500 text-sm mt-1">
            لم يتم العثور على سجل بالمعرف: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{activeWorkspacePatientId}</span>
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={closePatientWorkspace}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-sm text-sm"
          >
            العودة لشاشة العمل السريري
          </button>
        </div>

        {patients.length > 0 && (
          <div className="pt-4 border-t border-slate-100 text-right">
            <div className="text-xs font-bold text-slate-500 mb-2">أو اختر أحد المرضى النشطين حالياً للمتابعة السريرية:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patients.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => openPatientWorkspace(p.id, 'summary')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-right transition-colors cursor-pointer text-xs"
                >
                  <div className="font-bold text-slate-800">{p.fullNameAr || p.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{p.mrn} • {p.gender === 'male' ? 'ذكر' : 'أنثى'} • {p.age} سنة</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const pendingTasksCount = clinicalTasks.filter(
    t => t.patientId === patient.id && t.status === 'pending'
  ).length;

  const activeTransitionsCount = careTransitions.filter(
    t => t.patientId === patient.id && t.status !== 'transferred'
  ).length;

  const activities: {
    id: ClinicalActivity;
    axisNumber: number;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[] = [
    {
      id: 'summary',
      axisNumber: 1,
      labelAr: 'الملخص السريري',
      labelEn: 'Axis 1 — Overview',
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: 'vitals',
      axisNumber: 2,
      labelAr: 'العلامات والملاحظات',
      labelEn: 'Axis 2 — Vitals & Observations',
      icon: <HeartPulse className="w-4 h-4" />
    },
    {
      id: 'history_assessment',
      axisNumber: 3,
      labelAr: 'السيرة والفحص السريري',
      labelEn: 'Axis 3 — History & Assessments',
      icon: <Stethoscope className="w-4 h-4" />
    },
    {
      id: 'problems',
      axisNumber: 4,
      labelAr: 'المشكلات والتشخيصات',
      labelEn: 'Axis 4 — Problems & Diagnoses',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      id: 'notes',
      axisNumber: 5,
      labelAr: 'الملاحظات والتوثيق',
      labelEn: 'Axis 5 — Notes & Documentation',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'orders',
      axisNumber: 6,
      labelAr: 'الأوامر والطلبات',
      labelEn: 'Axis 6 — Orders & Requests',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'results',
      axisNumber: 7,
      labelAr: 'النتائج والتقارير',
      labelEn: 'Axis 7 — Results',
      icon: <FlaskConical className="w-4 h-4" />
    },
    {
      id: 'medications',
      axisNumber: 8,
      labelAr: 'الأدوية و eMAR',
      labelEn: 'Axis 8 — Medications / MAR',
      icon: <Pill className="w-4 h-4" />
    },
    {
      id: 'care_plan',
      axisNumber: 9,
      labelAr: 'خطة الرعاية والتثقيف',
      labelEn: 'Axis 9 — Care Plan & Education',
      icon: <HeartHandshake className="w-4 h-4" />
    },
    {
      id: 'timeline',
      axisNumber: 10,
      labelAr: 'مسار المريض والتسليم',
      labelEn: 'Axis 10 — Journey & Handover',
      icon: <GitFork className="w-4 h-4" />,
      badge: activeTransitionsCount > 0 ? `${activeTransitionsCount} انتقال` : undefined
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Universal Patient Safety Banner */}
      <PatientSafetyBanner patient={patient} />

      {/* 2. Clinical Activity Tabs Navigation Rail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs mb-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {activities.map(act => {
            const isActive = activeWorkspaceActivity === act.id;
            return (
              <button
                key={act.id}
                onClick={() => switchWorkspaceActivity(act.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={act.labelEn}
              >
                <span className={isActive ? 'text-white' : 'text-teal-600'}>
                  {act.icon}
                </span>
                <span>{act.labelAr}</span>
                <span className={`text-[10px] font-mono hidden xl:inline opacity-75`}>
                  ({act.labelEn})
                </span>
                {act.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-teal-800'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {act.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Clinical Activity View */}
      <div className="pt-1">
        {activeWorkspaceActivity === 'summary' && (
          <SummaryActivity patient={patient} onNavigateTab={switchWorkspaceActivity} />
        )}
        {activeWorkspaceActivity === 'timeline' && (
          <JourneyTimelineActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'notes' && (
          <NotesActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'vitals' && (
          <VitalsFlowsheetActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'orders' && (
          <OrdersActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'results' && (
          <ResultsActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'medications' && (
          <MedicationsActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'history_assessment' && (
          <HistoryAssessmentActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'problems' && (
          <ProblemsActivity patient={patient} />
        )}
        {activeWorkspaceActivity === 'care_plan' && (
          <CarePlanActivity patient={patient} />
        )}
      </div>
    </div>
  );
};
