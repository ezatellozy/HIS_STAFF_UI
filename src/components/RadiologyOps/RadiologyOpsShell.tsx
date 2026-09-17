import React, { useState } from 'react';
import {
  Radio,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Search,
  Sparkles,
  Bed,
  Activity,
  Disc,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  ChevronLeft
} from 'lucide-react';
import {
  ImagingModality,
  IncomingImagingRequest,
  ImagingStudy,
  RadiologyReport,
  RadiologistWorklistItem,
  ModalityDeviceRoom,
  PortableImagingContext,
  InterventionalRadiologyContext,
  ExternalImagingStudy,
  CriticalFindingCommunication
} from '../../types/radiologyOps';
import {
  MOCK_INCOMING_IMAGING_REQUESTS,
  MOCK_IMAGING_STUDIES,
  MOCK_RADIOLOGY_REPORTS,
  MOCK_RADIOLOGIST_WORKLIST,
  MOCK_DEVICES_ROOMS,
  MOCK_PORTABLE_IMAGING_CASES,
  MOCK_IR_CASES,
  MOCK_EXTERNAL_STUDIES
} from '../../data/mockRadiologyOpsData';

// Views
import { RadiologyOperationalHome } from './RadiologyOperationalHome';
import { IncomingRequestsView } from './IncomingRequestsView';
import { ImagingSchedulingWorkspace } from './ImagingSchedulingWorkspace';
import { ArrivalPreparationQueueView } from './ArrivalPreparationQueueView';
import { ModalityWorklistView } from './ModalityWorklistView';
import { RadiologistWorklistView } from './RadiologistWorklistView';
import { PortableImagingView } from './PortableImagingView';
import { InterventionalRadiologyView } from './InterventionalRadiologyView';
import { ExternalStudiesView } from './ExternalStudiesView';
import { ExceptionsAttentionView } from './ExceptionsAttentionView';

// Modals & Drawers
import { ProtocolingWorkspaceModal } from './ProtocolingWorkspaceModal';
import { SafetyReviewModal } from './SafetyReviewModal';
import { AcquisitionWorkspaceModal } from './AcquisitionWorkspaceModal';
import { StudyTechnicalReviewModal } from './StudyTechnicalReviewModal';
import { RadiologyReportComposerModal } from './RadiologyReportComposerModal';
import { ReportViewModal } from './ReportViewModal';
import { CriticalFindingsModal } from './CriticalFindingsModal';
import { RadiologyQuickPreviewDrawer } from './RadiologyQuickPreviewDrawer';
import { RadiologyDemoScenariosModal, DEMO_SCENARIOS, DemoScenario } from './RadiologyDemoScenariosModal';

export type RadiologyTab =
  | 'home'
  | 'incoming'
  | 'scheduling'
  | 'arrival'
  | 'modality_worklist'
  | 'radiologist_worklist'
  | 'portable'
  | 'ir'
  | 'external'
  | 'exceptions';

interface RadiologyOpsShellProps {
  onBackToClinicalWorkspace?: () => void;
  onSelectPatientContext?: (patientId: string) => void;
  onNavigateToAxis6?: (patientId: string, orderId: string) => void;
  onNavigateToAxis7?: (patientId: string, studyId: string) => void;
}

export const RadiologyOpsShell: React.FC<RadiologyOpsShellProps> = ({
  onBackToClinicalWorkspace,
  onSelectPatientContext,
  onNavigateToAxis6,
  onNavigateToAxis7
}) => {
  // Master State
  const [activeTab, setActiveTab] = useState<RadiologyTab>('home');
  const [selectedModalityFilter, setSelectedModalityFilter] = useState<ImagingModality | 'ALL'>('ALL');

  const [requests, setRequests] = useState<IncomingImagingRequest[]>(MOCK_INCOMING_IMAGING_REQUESTS);
  const [studies, setStudies] = useState<ImagingStudy[]>(MOCK_IMAGING_STUDIES);
  const [reports, setReports] = useState<RadiologyReport[]>(MOCK_RADIOLOGY_REPORTS);
  const [readingQueue, setReadingQueue] = useState<RadiologistWorklistItem[]>(MOCK_RADIOLOGIST_WORKLIST);
  const [rooms, setRooms] = useState<ModalityDeviceRoom[]>(MOCK_DEVICES_ROOMS);
  const [portableCases, setPortableCases] = useState<PortableImagingContext[]>(MOCK_PORTABLE_IMAGING_CASES);
  const [irCases, setIrCases] = useState<InterventionalRadiologyContext[]>(MOCK_IR_CASES);
  const [externalStudies, setExternalStudies] = useState<ExternalImagingStudy[]>(MOCK_EXTERNAL_STUDIES);

  // Modal / Drawer States
  const [protocolingReq, setProtocolingReq] = useState<IncomingImagingRequest | null>(null);
  const [safetyReviewContext, setSafetyReviewContext] = useState<{ patientId: string; modality: ImagingModality } | null>(null);
  const [acquisitionReq, setAcquisitionReq] = useState<IncomingImagingRequest | null>(null);
  const [technicalQcStudy, setTechnicalQcStudy] = useState<ImagingStudy | null>(null);
  const [reportComposerStudy, setReportComposerStudy] = useState<ImagingStudy | null>(null);
  const [viewReport, setViewReport] = useState<RadiologyReport | null>(null);
  const [criticalFindingReport, setCriticalFindingReport] = useState<RadiologyReport | null>(null);
  const [quickPreviewReq, setQuickPreviewReq] = useState<IncomingImagingRequest | null>(null);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  // Handlers
  const handleApproveProtocol = (requestId: string, protocolId: string, notes?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'protocol_approved',
            assignedProtocolId: protocolId,
            assignedProtocolName: 'بروتوكول معتمد من استشاري الأشعة',
            protocolNotes: notes
          };
        }
        return r;
      })
    );
    setProtocolingReq(null);
  };

  const handleCompleteAcquisition = (newStudy: ImagingStudy) => {
    setStudies(prev => [newStudy, ...prev]);

    // Update request state
    setRequests(prev =>
      prev.map(r => (r.id === newStudy.requestId ? { ...r, status: 'technically_complete' } : r))
    );

    // Add to Radiologist Reading Queue
    const newWorklistItem: RadiologistWorklistItem = {
      id: `rwl-${Date.now()}`,
      studyId: newStudy.id,
      accessionNumber: newStudy.accessionNumber,
      requestId: newStudy.requestId,
      patientId: newStudy.patientId,
      patientName: newStudy.patientName,
      patientNameEn: newStudy.patientNameEn,
      mrn: newStudy.mrn,
      age: 58,
      gender: 'male',
      modality: newStudy.modality,
      bodyRegion: newStudy.bodyRegion,
      studyDescription: newStudy.studyDescriptionAr,
      priority: 'stat',
      studyCompletedAt: newStudy.studyTime,
      elapsedMinutes: 4,
      targetTurnaroundTimeMinutes: 30,
      isDelayed: false,
      requestingService: 'قسم الطوارئ والإصابات',
      clinicalIndication: 'اشتباه سكتة دماغية حادة - فحص أولي قبل العلاج',
      comparisonStudiesCount: 1,
      comparisonStudies: [
        {
          studyDate: '2025-11-20',
          modality: newStudy.modality,
          description: 'فحص مقطعي سابق للمخ',
          reportSummary: 'لا توجد تشوهات وعائية أو نزيف سابق'
        }
      ],
      reportingState: 'unassigned'
    };

    setReadingQueue(prev => [newWorklistItem, ...prev]);
    setAcquisitionReq(null);
  };

  const handleApproveTechnicalQc = (studyId: string, qcStatus: any, comments: string) => {
    setStudies(prev =>
      prev.map(s => {
        if (s.id === studyId) {
          return {
            ...s,
            technicalQc: {
              ...s.technicalQc,
              status: qcStatus,
              technicalComments: comments
            }
          };
        }
        return s;
      })
    );
    setTechnicalQcStudy(null);
  };

  const handleSaveReport = (newReport: RadiologyReport, isFinal: boolean) => {
    setReports(prev => {
      const idx = prev.findIndex(r => r.id === newReport.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newReport;
        return copy;
      }
      return [newReport, ...prev];
    });

    // Update reading queue item state
    setReadingQueue(prev =>
      prev.map(item => {
        if (item.studyId === newReport.studyId) {
          return {
            ...item,
            reportingState: isFinal ? 'final_signed' : 'preliminary_signed',
            assignedRadiologist: newReport.signedBy
          };
        }
        return item;
      })
    );

    setReportComposerStudy(null);
  };

  const handleAddReportAddendum = (reportId: string, reason: string, text: string) => {
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          const newAddendum = {
            id: `add-${Date.now()}`,
            amendedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            authorName: 'د. طلال السعيد',
            authorRole: 'استشاري الأشعة التشخيصية',
            reasonForAmendment: reason,
            addendumText: text
          };
          return {
            ...r,
            versionNumber: r.versionNumber + 1,
            addenda: [...r.addenda, newAddendum]
          };
        }
        return r;
      })
    );

    if (viewReport && viewReport.id === reportId) {
      setViewReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          versionNumber: prev.versionNumber + 1,
          addenda: [
            ...prev.addenda,
            {
              id: `add-${Date.now()}`,
              amendedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              authorName: 'د. طلال السعيد',
              authorRole: 'استشاري الأشعة التشخيصية',
              reasonForAmendment: reason,
              addendumText: text
            }
          ]
        };
      });
    }
  };

  const handleSelectScenario = (scen: DemoScenario) => {
    setActiveTab(scen.targetTab as RadiologyTab);
    setShowDemoModal(false);

    if (scen.code === 'A') {
      const targetReq = requests.find(r => r.modality === 'XR') || requests[0];
      setAcquisitionReq(targetReq);
    } else if (scen.code === 'B') {
      const targetReq = requests.find(r => r.modality === 'CT') || requests[0];
      setProtocolingReq(targetReq);
    } else if (scen.code === 'C') {
      setSafetyReviewContext({ patientId: 'pat-rad-03', modality: 'MRI' });
    } else if (scen.code === 'D') {
      const study = studies.find(s => s.modality === 'CT') || studies[0];
      setReportComposerStudy(study);
    } else if (scen.code === 'E') {
      const rep = reports[0];
      setViewReport(rep);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Top Banner Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left/Right Branding */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-xs">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight">
                    عمليات الأشعة والتصوير الطبي (Radiology & Imaging Operations)
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    High-Fidelity Operations Shell
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  إدارة شاملة لطلبات الأشعة، الفرز، البروتوكولات، فحص الأمان، تنفيذ الأجهزة، وكتابة تقارير التشخيص
                </p>
              </div>
            </div>

            {/* Quick Actions & Scenario Launcher */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <button
                onClick={() => setShowDemoModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>سيناريوهات المحاكاة A → G</span>
              </button>

              {onBackToClinicalWorkspace && (
                <button
                  onClick={onBackToClinicalWorkspace}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                  <span>العودة لملف المريض</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              الرئيسية التشغيلية (Home)
            </button>

            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'incoming'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>الطلبات الواردة (Requests)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-200 font-mono">
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scheduling')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'scheduling'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              الجدولة والمواعيد (Scheduling)
            </button>

            <button
              onClick={() => setActiveTab('arrival')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'arrival'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              الاستقبال والتحضير (Prep Queue)
            </button>

            <button
              onClick={() => setActiveTab('modality_worklist')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'modality_worklist'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>قائمة عمل الأجهزة (Modality Worklist)</span>
            </button>

            <button
              onClick={() => setActiveTab('radiologist_worklist')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'radiologist_worklist'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>طابور قراءة التقارير (Reading Queue)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {readingQueue.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('portable')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'portable'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              الأشعة المتنقلة بالسرير (Portable)
            </button>

            <button
              onClick={() => setActiveTab('ir')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'ir'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              الأشعة التداخلية (IR)
            </button>

            <button
              onClick={() => setActiveTab('external')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'external'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              فحوصات خارجية (External)
            </button>

            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'exceptions'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>الاستثناءات (Exceptions)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>
          </nav>
        </div>

        {/* Prototype Reference Concepts Notice Bar */}
        <div className="bg-slate-800/90 border-t border-slate-700/60 px-4 sm:px-6 py-1.5 text-[11px] text-slate-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-teal-300">Design Note:</span>
            <span className="truncate">
              Design informed by / aligned conceptually with relevant quality, safety & interoperability principles (CBAHI, JCI, FHIR, DICOM reference concepts). Prototype UI/UX only — no real RIS/PACS backend, no diagnostic-grade viewer certification.
            </span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 font-mono hidden md:inline">
            Configured Modality Catalog • Departmental Worklist
          </span>
        </div>
      </header>

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {activeTab === 'home' && (
          <RadiologyOperationalHome
            requests={requests}
            readingQueue={readingQueue}
            rooms={rooms}
            onNavigateTab={tab => setActiveTab(tab as RadiologyTab)}
            onOpenProtocoling={req => setProtocolingReq(req)}
            onOpenScheduling={req => setActiveTab('scheduling')}
            onOpenReportComposer={studyId => {
              const std = studies.find(s => s.id === studyId) || studies[0];
              setReportComposerStudy(std);
            }}
          />
        )}

        {activeTab === 'incoming' && (
          <IncomingRequestsView
            requests={requests}
            onOpenProtocoling={req => setProtocolingReq(req)}
            onOpenScheduling={req => setActiveTab('scheduling')}
            onOpenSafetyReview={(patientId, mod) => setSafetyReviewContext({ patientId, modality: mod })}
            onOpenQuickPreview={req => setQuickPreviewReq(req)}
            onDeepLinkAxis6={(patId, orderId) => {
              if (onNavigateToAxis6) onNavigateToAxis6(patId, orderId);
            }}
          />
        )}

        {activeTab === 'scheduling' && (
          <ImagingSchedulingWorkspace
            requests={requests}
            rooms={rooms}
            onScheduleRequest={(reqId, roomId, date, time) => {
              setRequests(prev =>
                prev.map(r => (r.id === reqId ? { ...r, schedulingStatus: 'scheduled' } : r))
              );
            }}
            onMarkWalkInDirect={reqId => {
              setRequests(prev =>
                prev.map(r => (r.id === reqId ? { ...r, schedulingStatus: 'walk_in_direct', status: 'ready_for_scan' } : r))
              );
            }}
            onOpenSafetyReview={(patientId, mod) => setSafetyReviewContext({ patientId, modality: mod })}
          />
        )}

        {activeTab === 'arrival' && (
          <ArrivalPreparationQueueView
            requests={requests}
            onUpdateArrivalStatus={(reqId, status) => {
              setRequests(prev => prev.map(r => (r.id === reqId ? { ...r, status } : r)));
            }}
            onOpenSafetyReview={(patientId, mod) => setSafetyReviewContext({ patientId, modality: mod })}
            onMoveToModalityTable={req => {
              setAcquisitionReq(req);
              setActiveTab('modality_worklist');
            }}
          />
        )}

        {activeTab === 'modality_worklist' && (
          <ModalityWorklistView
            requests={requests}
            studies={studies}
            selectedModality={selectedModalityFilter}
            onSelectModality={mod => setSelectedModalityFilter(mod)}
            onStartAcquisition={req => setAcquisitionReq(req)}
            onOpenTechnicalQc={study => setTechnicalQcStudy(study)}
            onOpenQuickPreview={req => setQuickPreviewReq(req)}
            onOpenSafetyReview={(patientId, mod) => setSafetyReviewContext({ patientId, modality: mod })}
          />
        )}

        {activeTab === 'radiologist_worklist' && (
          <RadiologistWorklistView
            readingQueue={readingQueue}
            onOpenReportComposer={studyId => {
              const std = studies.find(s => s.id === studyId) || studies[0];
              setReportComposerStudy(std);
            }}
            onOpenDicomViewer={studyId => {
              const std = studies.find(s => s.id === studyId) || studies[0];
              setTechnicalQcStudy(std);
            }}
            onOpenPriorComparison={studyId => {
              const rep = reports[0];
              if (rep) setViewReport(rep);
            }}
          />
        )}

        {activeTab === 'portable' && (
          <PortableImagingView
            cases={portableCases}
            onUpdateStatus={(id, status) => {
              setPortableCases(prev => prev.map(c => (c.id === id ? { ...c, dispatchStatus: status } : c)));
            }}
          />
        )}

        {activeTab === 'ir' && (
          <InterventionalRadiologyView
            cases={irCases}
            onUpdateStage={(id, stage) => {
              setIrCases(prev => prev.map(c => (c.id === id ? { ...c, procedureStage: stage } : c)));
            }}
          />
        )}

        {activeTab === 'external' && (
          <ExternalStudiesView
            studies={externalStudies}
            onImportMedia={id => {}}
          />
        )}

        {activeTab === 'exceptions' && (
          <ExceptionsAttentionView
            requests={requests}
            readingQueue={readingQueue}
            rooms={rooms}
            onOpenReportComposer={studyId => {
              const std = studies.find(s => s.id === studyId) || studies[0];
              setReportComposerStudy(std);
            }}
            onOpenSafetyReview={(patientId, mod) => setSafetyReviewContext({ patientId, modality: mod })}
            onNavigateTab={tab => setActiveTab(tab as RadiologyTab)}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Protocoling Modal */}
      {protocolingReq && (
        <ProtocolingWorkspaceModal
          request={protocolingReq}
          onApproveProtocol={handleApproveProtocol}
          onClose={() => setProtocolingReq(null)}
        />
      )}

      {/* 2. Safety Review Modal */}
      {safetyReviewContext && (
        <SafetyReviewModal
          patientId={safetyReviewContext.patientId}
          patientName="خالد عبد العزيز التميمي"
          mrn="MRN-104928"
          modality={safetyReviewContext.modality}
          onUpdateClearance={() => setSafetyReviewContext(null)}
          onClose={() => setSafetyReviewContext(null)}
        />
      )}

      {/* 3. Acquisition Workspace Modal */}
      {acquisitionReq && (
        <AcquisitionWorkspaceModal
          request={acquisitionReq}
          onCompleteAcquisition={handleCompleteAcquisition}
          onClose={() => setAcquisitionReq(null)}
        />
      )}

      {/* 4. Technical QC Modal */}
      {technicalQcStudy && (
        <StudyTechnicalReviewModal
          study={technicalQcStudy}
          onApproveQc={handleApproveTechnicalQc}
          onClose={() => setTechnicalQcStudy(null)}
        />
      )}

      {/* 5. Report Composer Modal */}
      {reportComposerStudy && (
        <RadiologyReportComposerModal
          study={reportComposerStudy}
          onSaveReport={handleSaveReport}
          onTriggerCriticalFinding={rep => setCriticalFindingReport(rep)}
          onClose={() => setReportComposerStudy(null)}
        />
      )}

      {/* 6. View Report Modal */}
      {viewReport && (
        <ReportViewModal
          report={viewReport}
          onAddAddendum={handleAddReportAddendum}
          onDeepLinkAxis7={(patId, stdId) => {
            if (onNavigateToAxis7) onNavigateToAxis7(patId, stdId);
          }}
          onClose={() => setViewReport(null)}
        />
      )}

      {/* 7. Critical Finding Modal */}
      {criticalFindingReport && (
        <CriticalFindingsModal
          report={criticalFindingReport}
          onSaveCommunication={comm => {
            setCriticalFindingReport(null);
          }}
          onClose={() => setCriticalFindingReport(null)}
        />
      )}

      {/* 8. Quick Preview Drawer */}
      <RadiologyQuickPreviewDrawer
        request={quickPreviewReq}
        onClose={() => setQuickPreviewReq(null)}
        onOpenProtocoling={req => setProtocolingReq(req)}
        onOpenScheduling={req => setActiveTab('scheduling')}
        onOpenSafetyReview={(patId, mod) => setSafetyReviewContext({ patientId: patId, modality: mod })}
        onDeepLinkAxis6={(patId, ordId) => {
          if (onNavigateToAxis6) onNavigateToAxis6(patId, ordId);
        }}
      />

      {/* 9. Demo Scenarios Launcher Modal */}
      {showDemoModal && (
        <RadiologyDemoScenariosModal
          onSelectScenario={handleSelectScenario}
          onClose={() => setShowDemoModal(false)}
        />
      )}
    </div>
  );
};
