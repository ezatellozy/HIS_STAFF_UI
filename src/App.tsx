import React from 'react';
import { HisProvider, useHis } from './context/HisContext';
import { Header } from './components/Header';
import { ReceptionDashboard } from './components/Reception/ReceptionDashboard';
import { DoctorDashboard } from './components/Doctor/DoctorDashboard';
import { NursingDashboard } from './components/Nursing/NursingDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ErDashboard } from './components/ER/ErDashboard';
import { WardsDashboard } from './components/Wards/WardsDashboard';
import { IcuDashboard } from './components/ICU/IcuDashboard';
import { OrDashboard } from './components/OR/OrDashboard';
import { PatientLifecycleView } from './components/Lifecycle/PatientLifecycleView';
import { StandardsView } from './components/Standards/StandardsView';
import { PrintPrescriptionModal } from './components/Modals/PrintPrescriptionModal';
import { PatientDetailModal } from './components/Modals/PatientDetailModal';
import { PublicQueueDisplayModal } from './components/Modals/PublicQueueDisplayModal';
import { StandardsViewerModal } from './components/Modals/StandardsViewerModal';
import { PatientLifecycleModal } from './components/Modals/PatientLifecycleModal';
import { SwitchGroupModal } from './components/Modals/SwitchGroupModal';
import { ProgressNotesModal } from './components/Modals/ProgressNotesModal';
import { EnterpriseLoginView } from './components/Auth/EnterpriseLoginView';
import { MyWorkDashboard } from './components/MyWork/MyWorkDashboard';
import { ClinicalUtilitiesShell } from './components/ClinicalUtilities/ClinicalUtilitiesShell';
import { PatientClinicalWorkspace } from './components/PatientWorkspace/PatientClinicalWorkspace';
import { PatientAccessAdtDashboard } from './components/PatientAccessAdt/PatientAccessAdtDashboard';
import { LaboratoryOpsShell } from './components/LaboratoryOps/LaboratoryOpsShell';
import { RadiologyOpsShell } from './components/RadiologyOps/RadiologyOpsShell';
import { PharmacyOpsShell } from './components/PharmacyOps/PharmacyOpsShell';
import { BloodBankOpsShell } from './components/BloodBankOps/BloodBankOpsShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShieldCheck, Activity, HeartHandshake } from 'lucide-react';
import { EdinaLogo } from './components/common/EdinaLogo';

const MainLayout: React.FC = () => {
  const {
    isAuthenticated,
    currentDepartment,
    currentRole,
    activeWorkArea,
    setActiveWorkArea,
    activeWorkspacePatientId,
    openPatientWorkspace,
    standardsModalState,
    closeStandardsModal,
    patients,
    appointments,
    consultations,
    activeProgressNotesPatientId,
    setActiveProgressNotesPatientId
  } = useHis();

  if (!isAuthenticated) {
    return <EnterpriseLoginView />;
  }

  const activePatient = patients.find(p => p.id === standardsModalState.patientId) || patients[0] || null;
  const activeAppointment = appointments.find(a => a.id === standardsModalState.appointmentId);
  const activeConsultation = activeAppointment ? consultations[activeAppointment.id] : undefined;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Cairo',sans-serif] overflow-x-hidden w-full">
      {/* Hospital Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Layer 3: Universal Patient Clinical Workspace (When patient is actively opened) */}
        {activeWorkspacePatientId ? (
          <ErrorBoundary fallbackTitle="حدث تنبيه أثناء عرض ملف المريض السريري">
            <PatientClinicalWorkspace />
          </ErrorBoundary>
        ) : activeWorkArea === 'laboratory_ops' ? (
          /* Laboratory, Microbiology & Pathology Operations UX */
          <LaboratoryOpsShell />
        ) : activeWorkArea === 'radiology_ops' ? (
          /* Radiology & Imaging Operations UX */
          <RadiologyOpsShell
            onBackToClinicalWorkspace={() => setActiveWorkArea('my_work')}
            onNavigateToAxis6={(patientId, orderId) => {
              openPatientWorkspace(patientId, 'orders', {
                department: 'er',
                label: 'طلب الأشعة من قسم الأشعة'
              });
            }}
            onNavigateToAxis7={(patientId, studyId) => {
              openPatientWorkspace(patientId, 'results', {
                department: 'er',
                label: 'تقرير الأشعة التشخيصي'
              });
            }}
          />
        ) : activeWorkArea === 'pharmacy_ops' ? (
          /* Pharmacy Operations UX */
          <PharmacyOpsShell
            onBackToOrigin={() => setActiveWorkArea('my_work')}
            onOpenPatientWorkspace={(patientId, options) => {
              openPatientWorkspace(patientId, (options?.initialActivity as any) || 'medications', {
                department: 'ipd',
                label: 'ملف المريض من قسم العمليات الصيدلانية'
              });
            }}
          />
        ) : activeWorkArea === 'blood_bank_ops' ? (
          /* Blood Bank & Transfusion Medicine Operations UX */
          <BloodBankOpsShell
            onNavigateDepartment={(dept) => {
              if (
                dept === 'blood_bank_ops' ||
                dept === 'pharmacy_ops' ||
                dept === 'radiology_ops' ||
                dept === 'laboratory_ops' ||
                dept === 'patient_access_adt' ||
                dept === 'my_work'
              ) {
                setActiveWorkArea(dept as any);
              }
            }}
          />
        ) : activeWorkArea === 'patient_access_adt' ? (
          /* Patient Access, ADT & Patient Flow Operations UX */
          <PatientAccessAdtDashboard
            onOpenPatientWorkspace={(mrn, encounterId) => {
              openPatientWorkspace(mrn, 'summary', {
                department: 'ipd',
                label: 'ملف المريض من إدارة الدخول والأسرّة'
              });
            }}
            onReturnToClinicalWorkspace={() => setActiveWorkArea('my_work')}
          />
        ) : activeWorkArea === 'clinical_utilities' ? (
          /* Cross-Role Clinical Utilities UX */
          <ClinicalUtilitiesShell />
        ) : activeWorkArea === 'my_work' ? (
          /* Layer 1: My Work / Clinical Home */
          <MyWorkDashboard />
        ) : (
          /* Layer 2: Department / Care Area Workboards */
          <>
            {currentDepartment === 'er' && <ErDashboard />}
            {currentDepartment === 'ipd' && <WardsDashboard />}
            {currentDepartment === 'icu' && <IcuDashboard />}
            {currentDepartment === 'or' && <OrDashboard />}
            {currentDepartment === 'lifecycle' && <PatientLifecycleView />}
            {currentDepartment === 'standards' && <StandardsView />}
            {currentDepartment === 'opd' && (
              <>
                {currentRole === 'reception' && <ReceptionDashboard />}
                {currentRole === 'doctor' && <DoctorDashboard />}
                {currentRole === 'nurse' && <NursingDashboard />}
                {currentRole === 'admin' && <AdminDashboard />}
              </>
            )}
          </>
        )}
      </main>

      {/* Hospital System Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <EdinaLogo size="sm" theme="light" />
            <div>
              <div className="font-bold text-slate-800">
                منظومة إدينا لمعلومات المستشفيات والرعاية الصحية المتكاملة (Edina HIS)
              </div>
              <div className="text-[11px] text-slate-400">
                العيادات الخارجية OPD • الطوارئ والحوادث ER • أجنحة التنويم Wards • العناية المركزة ICU • غرف العمليات OR
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>معايير سباهي والأمان الصحي CBAHI & JCI</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-500">HL7 FHIR R4</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-blue-600 font-bold">NPHIES Gateway</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-semibold">● نظام متصل ومحدث لحظياً</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <PrintPrescriptionModal />
      <PatientDetailModal />
      <PublicQueueDisplayModal />
      <PatientLifecycleModal />
      <SwitchGroupModal />
      <ProgressNotesModal
        isOpen={!!activeProgressNotesPatientId}
        patientId={activeProgressNotesPatientId}
        onClose={() => setActiveProgressNotesPatientId(null)}
      />
      <StandardsViewerModal
        isOpen={standardsModalState.isOpen}
        onClose={closeStandardsModal}
        patient={activePatient}
        appointment={activeAppointment}
        consultation={activeConsultation}
        initialTab={standardsModalState.initialTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <HisProvider>
      <MainLayout />
    </HisProvider>
  );
}
