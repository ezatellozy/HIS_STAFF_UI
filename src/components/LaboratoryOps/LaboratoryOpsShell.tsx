import React, { useState } from 'react';
import {
  FlaskConical,
  Activity,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Microscope,
  Scissors,
  Truck,
  PhoneCall,
  RefreshCw,
  Sparkles,
  Users,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import {
  IncomingLabOrder,
  LabSpecimen,
  LabAccession,
  MicrobiologyCase,
  PathologyCase,
  SendOutShipment,
  InstrumentOperationalStatus,
  LaboratoryPersona,
  SpecimenRejectionReasonCode,
  CriticalResultCommunication
} from '../../types/laboratoryOps';
import {
  MOCK_INCOMING_ORDERS,
  MOCK_SPECIMENS,
  MOCK_CORE_LAB_ACCESSIONS,
  MOCK_MICROBIOLOGY_CASES,
  MOCK_PATHOLOGY_CASES,
  MOCK_SEND_OUT_SHIPMENTS,
  MOCK_INSTRUMENTS,
  MOCK_LAB_PERSONAS
} from '../../data/mockLaboratoryOpsData';

import { LaboratoryOpsHome } from './LaboratoryOpsHome';
import { IncomingOrdersView } from './IncomingOrdersView';
import { CollectionWorklistView } from './CollectionWorklistView';
import { SpecimenReceptionView } from './SpecimenReceptionView';
import { CoreLabWorklistView } from './CoreLabWorklistView';
import { MicrobiologyWorkspace } from './MicrobiologyWorkspace';
import { PathologyWorkspace } from './PathologyWorkspace';
import { SendOutLabView } from './SendOutLabView';
import { ExceptionsDelayedView } from './ExceptionsDelayedView';
import { LabDemoScenariosView } from './LabDemoScenariosView';
import { LabQuickPreviewDrawer } from './LabQuickPreviewDrawer';

import { SpecimenCollectionModal } from './SpecimenCollectionModal';
import { SpecimenRejectionModal } from './SpecimenRejectionModal';
import { ResultEntryReviewModal } from './ResultEntryReviewModal';
import { CriticalResultCommunicationModal } from './CriticalResultCommunicationModal';

export const LaboratoryOpsShell: React.FC = () => {
  const { openPatientWorkspace } = useHis();

  // Primary Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedPersona, setSelectedPersona] = useState<LaboratoryPersona>(MOCK_LAB_PERSONAS[0]);

  // Operational State Stores
  const [orders, setOrders] = useState<IncomingLabOrder[]>(MOCK_INCOMING_ORDERS);
  const [specimens, setSpecimens] = useState<LabSpecimen[]>(MOCK_SPECIMENS);
  const [accessions, setAccessions] = useState<LabAccession[]>(MOCK_CORE_LAB_ACCESSIONS);
  const [microCases, setMicroCases] = useState<MicrobiologyCase[]>(MOCK_MICROBIOLOGY_CASES);
  const [pathCases, setPathCases] = useState<PathologyCase[]>(MOCK_PATHOLOGY_CASES);
  const [sendOuts, setSendOuts] = useState<SendOutShipment[]>(MOCK_SEND_OUT_SHIPMENTS);
  const [instruments, setInstruments] = useState<InstrumentOperationalStatus[]>(MOCK_INSTRUMENTS);

  // Modals & Drawer State
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<IncomingLabOrder | null>(null);
  const [previewSpecimen, setPreviewSpecimen] = useState<LabSpecimen | null>(null);
  const [previewAccession, setPreviewAccession] = useState<LabAccession | null>(null);
  const [previewMicroCase, setPreviewMicroCase] = useState<MicrobiologyCase | null>(null);
  const [previewPathCase, setPreviewPathCase] = useState<PathologyCase | null>(null);

  // Interactive Modals
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [activeSpecimenForCollection, setActiveSpecimenForCollection] = useState<LabSpecimen | null>(null);

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [activeSpecimenForRejection, setActiveSpecimenForRejection] = useState<LabSpecimen | null>(null);

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [activeAccessionForResult, setActiveAccessionForResult] = useState<LabAccession | null>(null);

  const [criticalModalOpen, setCriticalModalOpen] = useState(false);
  const [activeAccessionForCritical, setActiveAccessionForCritical] = useState<LabAccession | null>(null);

  // Deep Link bridges to Patient Workspace
  const handleDeepLinkAxis6 = (patientId: string) => {
    openPatientWorkspace(patientId, {
      defaultActivity: 'orders',
      workArea: 'laboratory_ops',
      department: 'Laboratory Department',
      unitName: 'Central Diagnostic Lab',
      viewMode: 'department_board',
      selectedPatientId: patientId,
      filterState: {}
    });
  };

  const handleDeepLinkAxis7 = (patientId: string) => {
    openPatientWorkspace(patientId, {
      defaultActivity: 'results',
      workArea: 'laboratory_ops',
      department: 'Laboratory Department',
      unitName: 'Central Diagnostic Lab',
      viewMode: 'department_board',
      selectedPatientId: patientId,
      filterState: {}
    });
  };

  // Action Handlers
  const handleConfirmCollection = (updated: LabSpecimen) => {
    setSpecimens(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const handleMarkUnableToCollect = (specimenId: string, reason: string) => {
    setSpecimens(prev =>
      prev.map(s =>
        s.id === specimenId
          ? {
              ...s,
              specialInstructions: `تعذر السحب: ${reason}`
            }
          : s
      )
    );
  };

  const handleConfirmRejection = (
    specimenId: string,
    rejectionCode: SpecimenRejectionReasonCode,
    description: string,
    action: 'recollection_requested' | 'clinician_consulted' | 'test_cancelled'
  ) => {
    setSpecimens(prev =>
      prev.map(s => {
        if (s.id !== specimenId) return s;
        return {
          ...s,
          status: 'rejected',
          rejectionInfo: {
            rejectedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            rejectedBy: selectedPersona.titleAr,
            reasonCode: rejectionCode,
            reasonDescription: description,
            actionTaken: action
          }
        };
      })
    );

    // If recollection requested, automatically generate an associated recollection task linked to original order
    if (action === 'recollection_requested') {
      const targetSpec = specimens.find(s => s.id === specimenId);
      if (targetSpec) {
        const recollectionSpec: LabSpecimen = {
          ...targetSpec,
          id: `spec-recollect-${Date.now()}`,
          specimenBarcode: `SPEC-REC-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'pending_collection',
          collectedDateTime: undefined,
          collectorName: undefined,
          receivedDateTime: undefined,
          receiverName: undefined,
          rejectionInfo: undefined,
          specialInstructions: `إعادة سحب معتمدة لتعويض العينة المرفوضة (${targetSpec.specimenBarcode}) - سبب: ${rejectionCode}`
        };
        setSpecimens(prev => [recollectionSpec, ...prev]);
      }
    }
  };

  const handleAcceptSpecimen = (specimenId: string) => {
    setSpecimens(prev =>
      prev.map(s =>
        s.id === specimenId
          ? {
              ...s,
              status: 'accepted',
              receivedDateTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
              receiverName: selectedPersona.titleAr
            }
          : s
      )
    );
  };

  const handleQuickAccession = (specimen: LabSpecimen) => {
    // Generate an accession for this specimen
    const newAcc: LabAccession = {
      id: `acc-${Date.now()}`,
      accessionNumber: `ACC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: specimen.orderId,
      patientId: specimen.patientId,
      patientName: specimen.patientName,
      mrn: specimen.mrn,
      encounterId: specimen.encounterId,
      encounterType: 'er',
      orderingDoctor: 'طبيب معالج',
      orderingService: specimen.collectionLocation,
      clinicalDiagnosis: 'فحص سريري معتمد',
      priority: specimen.collectionPriority,
      section: 'chemistry',
      specimenIds: [specimen.id],
      testPanelName: 'باقة الفحص الآلي المستعجل',
      receivedDateTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      accessionedDateTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tatTargetMinutes: specimen.collectionPriority === 'stat' ? 30 : 60,
      status: 'in_analysis',
      instrumentContext: {
        analyzerId: 'inst-chem-1',
        analyzerName: 'Roche Cobas 8000',
        qcStatus: 'acceptable',
        isMaintenance: false
      },
      tests: [
        {
          id: `t-${Date.now()}-1`,
          testCode: 'GLU',
          testNameAr: 'السكر في الدم',
          testNameEn: 'Glucose',
          numericValue: 110,
          unit: 'mg/dL',
          referenceRangeText: '70 - 140 mg/dL',
          flag: 'normal',
          instrumentName: 'Roche Cobas 8000',
          status: 'technically_verified',
          version: 1
        }
      ]
    };

    setAccessions(prev => [newAcc, ...prev]);
    setActiveView('core_lab');
  };

  const handleSaveResults = (updatedAcc: LabAccession) => {
    setAccessions(prev => prev.map(a => (a.id === updatedAcc.id ? updatedAcc : a)));
  };

  const handleSaveCommunication = (accessionId: string, comm: CriticalResultCommunication) => {
    setAccessions(prev =>
      prev.map(a =>
        a.id === accessionId
          ? {
              ...a,
              criticalCommunication: comm
            }
          : a
      )
    );
  };

  const handleReleaseFinal = (accessionId: string) => {
    setAccessions(prev =>
      prev.map(a =>
        a.id === accessionId
          ? {
              ...a,
              status: 'released',
              tests: a.tests.map(t => ({ ...t, status: 'final' }))
            }
          : a
      )
    );
  };

  // Preview triggers
  const triggerPreviewOrder = (order: IncomingLabOrder) => {
    setPreviewOrder(order);
    setPreviewSpecimen(null);
    setPreviewAccession(null);
    setPreviewMicroCase(null);
    setPreviewPathCase(null);
    setPreviewDrawerOpen(true);
  };

  const triggerPreviewSpecimen = (spec: LabSpecimen) => {
    setPreviewSpecimen(spec);
    setPreviewOrder(null);
    setPreviewAccession(null);
    setPreviewMicroCase(null);
    setPreviewPathCase(null);
    setPreviewDrawerOpen(true);
  };

  const triggerPreviewAccession = (acc: LabAccession) => {
    setPreviewAccession(acc);
    setPreviewOrder(null);
    setPreviewSpecimen(null);
    setPreviewMicroCase(null);
    setPreviewPathCase(null);
    setPreviewDrawerOpen(true);
  };

  const triggerPreviewMicro = (c: MicrobiologyCase) => {
    setPreviewMicroCase(c);
    setPreviewOrder(null);
    setPreviewSpecimen(null);
    setPreviewAccession(null);
    setPreviewPathCase(null);
    setPreviewDrawerOpen(true);
  };

  const triggerPreviewPath = (c: PathologyCase) => {
    setPreviewPathCase(c);
    setPreviewOrder(null);
    setPreviewSpecimen(null);
    setPreviewAccession(null);
    setPreviewMicroCase(null);
    setPreviewDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Cairo',sans-serif] flex flex-col">
      {/* Sub-header Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand & Department Scope */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-950/40">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">إدارة المختبرات الطبية والتشخيصية</span>
                <span className="px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 text-[10px] font-bold border border-teal-700">
                  LIS Operational Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Central Labs • Hematology • Chemistry • Microbiology • Surgical Pathology • Send-Outs
              </p>
            </div>
          </div>

          {/* Persona Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <Users className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-slate-300 font-bold">الدور النشط:</span>
            <select
              value={selectedPersona.roleId}
              onChange={e => {
                const found = MOCK_LAB_PERSONAS.find(p => p.roleId === e.target.value);
                if (found) setSelectedPersona(found);
              }}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {MOCK_LAB_PERSONAS.map(p => (
                <option key={p.roleId} value={p.roleId}>
                  {p.titleAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Operational Views Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <nav className="flex items-center gap-1 py-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'home'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>الرئيسية والعمليات (Command Center)</span>
            </button>

            <button
              onClick={() => setActiveView('orders')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'orders'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>سجل الطلبات الواردة ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveView('collection_worklist')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'collection_worklist'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>سحب العينات الميداني</span>
            </button>

            <button
              onClick={() => setActiveView('reception')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'reception'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>استقبال العينات والفرز</span>
            </button>

            <button
              onClick={() => setActiveView('core_lab')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'core_lab'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>المختبر الأساسي والأجهزة الآلية ({accessions.length})</span>
            </button>

            <button
              onClick={() => setActiveView('microbiology')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'microbiology'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Microscope className="w-4 h-4" />
              <span>الأحياء الدقيقة والمزارع (AST)</span>
            </button>

            <button
              onClick={() => setActiveView('pathology')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'pathology'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>علم الأمراض والأنسجة (Pathology)</span>
            </button>

            <button
              onClick={() => setActiveView('send_out')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'send_out'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>المختبرات المرجعية (Send-Out)</span>
            </button>

            <button
              onClick={() => setActiveView('exceptions')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'exceptions'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>الاستثناءات والتنبيهات الحرجة</span>
            </button>

            <button
              onClick={() => setActiveView('demo_scenarios')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'demo_scenarios'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>سيناريوهات A - G</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Port Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeView === 'home' && (
          <LaboratoryOpsHome
            orders={orders}
            specimens={specimens}
            accessions={accessions}
            microCases={microCases}
            pathCases={pathCases}
            instruments={instruments}
            onSelectView={view => setActiveView(view)}
            onPreviewAccession={triggerPreviewAccession}
            onPreviewSpecimen={triggerPreviewSpecimen}
            onPreviewOrder={triggerPreviewOrder}
            onOpenCriticalModal={acc => {
              setActiveAccessionForCritical(acc);
              setCriticalModalOpen(true);
            }}
          />
        )}

        {activeView === 'orders' && (
          <IncomingOrdersView
            orders={orders}
            onPreviewOrder={triggerPreviewOrder}
            onDeepLinkAxis6={handleDeepLinkAxis6}
            onInitiateCollection={orderId => {
              const targetSpec = specimens.find(s => s.orderId === orderId);
              if (targetSpec) {
                setActiveSpecimenForCollection(targetSpec);
                setCollectionModalOpen(true);
              } else {
                setActiveView('collection_worklist');
              }
            }}
            onRequestClarification={(orderId, note) => {
              setOrders(prev =>
                prev.map(o =>
                  o.id === orderId
                    ? {
                        ...o,
                        status: 'clarification_required',
                        clarificationNote: note
                      }
                    : o
                )
              );
            }}
          />
        )}

        {activeView === 'collection_worklist' && (
          <CollectionWorklistView
            specimens={specimens}
            onOpenCollectionModal={spec => {
              setActiveSpecimenForCollection(spec);
              setCollectionModalOpen(true);
            }}
            onPreviewSpecimen={triggerPreviewSpecimen}
            onPrintLabels={spec => {
              alert(`محاكاة طباعة ملصق الباركود للعينة: ${spec.specimenBarcode} (${spec.patientName})`);
            }}
          />
        )}

        {activeView === 'reception' && (
          <SpecimenReceptionView
            specimens={specimens}
            onAcceptSpecimen={handleAcceptSpecimen}
            onOpenRejectionModal={spec => {
              setActiveSpecimenForRejection(spec);
              setRejectionModalOpen(true);
            }}
            onPreviewSpecimen={triggerPreviewSpecimen}
            onQuickAccession={handleQuickAccession}
          />
        )}

        {activeView === 'core_lab' && (
          <CoreLabWorklistView
            accessions={accessions}
            onOpenResultModal={acc => {
              setActiveAccessionForResult(acc);
              setResultModalOpen(true);
            }}
            onOpenCriticalModal={acc => {
              setActiveAccessionForCritical(acc);
              setCriticalModalOpen(true);
            }}
            onPreviewAccession={triggerPreviewAccession}
            onDeepLinkAxis7={handleDeepLinkAxis7}
            onReleaseFinal={handleReleaseFinal}
          />
        )}

        {activeView === 'microbiology' && (
          <MicrobiologyWorkspace
            cases={microCases}
            onUpdateCase={updated => {
              setMicroCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
            }}
            onPreviewCase={triggerPreviewMicro}
          />
        )}

        {activeView === 'pathology' && (
          <PathologyWorkspace
            cases={pathCases}
            onUpdateCase={updated => {
              setPathCases(prev => prev.map(c => (c.id === updated.id ? updated : c)));
            }}
            onPreviewCase={triggerPreviewPath}
          />
        )}

        {activeView === 'send_out' && <SendOutLabView shipments={sendOuts} />}

        {activeView === 'exceptions' && (
          <ExceptionsDelayedView
            specimens={specimens}
            accessions={accessions}
            orders={orders}
            instruments={instruments}
            onOpenRejectionModal={spec => {
              setActiveSpecimenForRejection(spec);
              setRejectionModalOpen(true);
            }}
            onOpenCriticalModal={acc => {
              setActiveAccessionForCritical(acc);
              setCriticalModalOpen(true);
            }}
            onPreviewAccession={triggerPreviewAccession}
            onPreviewSpecimen={triggerPreviewSpecimen}
          />
        )}

        {activeView === 'demo_scenarios' && (
          <LabDemoScenariosView
            orders={orders}
            specimens={specimens}
            accessions={accessions}
            microCases={microCases}
            pathCases={pathCases}
            onNavigateToView={view => setActiveView(view)}
            onPreviewAccession={triggerPreviewAccession}
            onPreviewSpecimen={triggerPreviewSpecimen}
            onOpenResultModal={acc => {
              setActiveAccessionForResult(acc);
              setResultModalOpen(true);
            }}
            onOpenCriticalModal={acc => {
              setActiveAccessionForCritical(acc);
              setCriticalModalOpen(true);
            }}
            onOpenRejectionModal={spec => {
              setActiveSpecimenForRejection(spec);
              setRejectionModalOpen(true);
            }}
            onDeepLinkAxis6={handleDeepLinkAxis6}
            onDeepLinkAxis7={handleDeepLinkAxis7}
          />
        )}
      </main>

      {/* Quick Preview Drawer */}
      <LabQuickPreviewDrawer
        isOpen={previewDrawerOpen}
        onClose={() => setPreviewDrawerOpen(false)}
        order={previewOrder}
        specimen={previewSpecimen}
        accession={previewAccession}
        microCase={previewMicroCase}
        pathCase={previewPathCase}
        onDeepLinkAxis6={patientId => {
          setPreviewDrawerOpen(false);
          handleDeepLinkAxis6(patientId);
        }}
        onDeepLinkAxis7={patientId => {
          setPreviewDrawerOpen(false);
          handleDeepLinkAxis7(patientId);
        }}
      />

      {/* Collection Modal */}
      {collectionModalOpen && activeSpecimenForCollection && (
        <SpecimenCollectionModal
          isOpen={collectionModalOpen}
          onClose={() => {
            setCollectionModalOpen(false);
            setActiveSpecimenForCollection(null);
          }}
          specimen={activeSpecimenForCollection}
          order={orders.find(o => o.id === activeSpecimenForCollection.orderId)}
          onConfirmCollection={handleConfirmCollection}
          onMarkUnableToCollect={handleMarkUnableToCollect}
        />
      )}

      {/* Rejection Modal */}
      {rejectionModalOpen && activeSpecimenForRejection && (
        <SpecimenRejectionModal
          isOpen={rejectionModalOpen}
          onClose={() => {
            setRejectionModalOpen(false);
            setActiveSpecimenForRejection(null);
          }}
          specimen={activeSpecimenForRejection}
          onConfirmRejection={handleConfirmRejection}
        />
      )}

      {/* Result Entry & Technical Verification Modal */}
      {resultModalOpen && activeAccessionForResult && (
        <ResultEntryReviewModal
          isOpen={resultModalOpen}
          onClose={() => {
            setResultModalOpen(false);
            setActiveAccessionForResult(null);
          }}
          accession={activeAccessionForResult}
          onSaveResults={handleSaveResults}
          onOpenCriticalModal={acc => {
            setActiveAccessionForCritical(acc);
            setCriticalModalOpen(true);
          }}
        />
      )}

      {/* Critical Result Communication Modal */}
      {criticalModalOpen && activeAccessionForCritical && (
        <CriticalResultCommunicationModal
          isOpen={criticalModalOpen}
          onClose={() => {
            setCriticalModalOpen(false);
            setActiveAccessionForCritical(null);
          }}
          accession={activeAccessionForCritical}
          onSaveCommunication={handleSaveCommunication}
        />
      )}
    </div>
  );
};
