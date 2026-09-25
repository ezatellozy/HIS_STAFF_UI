import React, { useState } from 'react';
import {
  Droplet,
  FlaskConical,
  ShieldCheck,
  Layers,
  Box,
  RotateCcw,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Info
} from 'lucide-react';
import {
  BloodBankOperationalTab,
  BloodProductRequest,
  PreTransfusionSample,
  BloodGroupTypingResult,
  AntibodyScreenResult,
  CompatibilityRecord,
  BloodProductUnit,
  ProductProcessingRecord,
  ProductReturnRecord,
  TransfusionReactionCase,
  MassiveTransfusionProtocolSession,
  ProductIssueRecord,
  BloodBankOperationalMetrics,
  BloodBankDemoScenario
} from '../../types/bloodBankOps';
import {
  mockBloodProductRequests,
  mockPreTransfusionSamples,
  mockBloodGroupTypingResults,
  mockAntibodyScreenResults,
  mockCompatibilityRecords,
  mockBloodProductUnits,
  mockProductReturnRecords,
  mockTransfusionReactionCases,
  mockMtpSessions,
  mockProductIssueRecords,
  mockBloodBankOperationalMetrics,
  mockBloodBankScenarios,
  mockTraceabilityEvents
} from '../../data/mockBloodBankOpsData';

// Modals & Views
import { BloodBankDemoScenariosModal } from './BloodBankDemoScenariosModal';
import { BloodBankQuickPreviewDrawer } from './BloodBankQuickPreviewDrawer';
import { BloodRequestDetailModal } from './BloodRequestDetailModal';
import { PreTransfusionSamplesView } from './PreTransfusionSamplesView';
import { BloodGroupTypingWorkspace } from './BloodGroupTypingWorkspace';
import { AntibodyScreenWorkspace } from './AntibodyScreenWorkspace';
import { CompatibilityWorkspace } from './CompatibilityWorkspace';
import { ProductInventoryContextView } from './ProductInventoryContextView';
import { ProductUnitDetailModal } from './ProductUnitDetailModal';
import { ProductSelectionAllocationModal } from './ProductSelectionAllocationModal';
import { ProductPreparationModal } from './ProductPreparationModal';
import { ProductIssueModal } from './ProductIssueModal';
import { ReadyAndIssueQueueView } from './ReadyAndIssueQueueView';
import { ProductReturnsView } from './ProductReturnsView';
import { TransfusionReactionsView } from './TransfusionReactionsView';
import { MassiveTransfusionProtocolModal } from './MassiveTransfusionProtocolModal';
import { EmergencyReleaseModal } from './EmergencyReleaseModal';
import { BloodBankOperationalHome } from './BloodBankOperationalHome';

interface BloodBankOpsShellProps {
  onNavigateDepartment?: (deptId: string) => void;
}

export const BloodBankOpsShell: React.FC<BloodBankOpsShellProps> = ({ onNavigateDepartment }) => {
  // State for tabs
  const [activeTab, setActiveTab] = useState<BloodBankOperationalTab>('overview');

  // Operational Data State
  const [requests, setRequests] = useState<BloodProductRequest[]>(mockBloodProductRequests);
  const [samples, setSamples] = useState<PreTransfusionSample[]>(mockPreTransfusionSamples);
  const [typingResults, setTypingResults] = useState<BloodGroupTypingResult[]>(mockBloodGroupTypingResults);
  const [antibodyScreens, setAntibodyScreens] = useState<AntibodyScreenResult[]>(mockAntibodyScreenResults);
  const [compatibilities, setCompatibilities] = useState<CompatibilityRecord[]>(mockCompatibilityRecords);
  const [units, setUnits] = useState<BloodProductUnit[]>(mockBloodProductUnits);
  const [returns, setReturns] = useState<ProductReturnRecord[]>(mockProductReturnRecords);
  const [reactions, setReactions] = useState<TransfusionReactionCase[]>(mockTransfusionReactionCases);
  const [mtpSessions, setMtpSessions] = useState<MassiveTransfusionProtocolSession[]>(mockMtpSessions);
  const [issues, setIssues] = useState<ProductIssueRecord[]>(mockProductIssueRecords);
  const [metrics, setMetrics] = useState<BloodBankOperationalMetrics>(mockBloodBankOperationalMetrics);

  // Active Personas
  const [activePersona, setActivePersona] = useState<string>('أخصائي بنك الدم (Blood Bank Tech)');

  // Modal / Drawer Selection States
  const [isScenariosModalOpen, setIsScenariosModalOpen] = useState(false);
  const [currentScenarioId, setCurrentScenarioId] = useState<string>('scenario-a');

  // Preview Drawer
  const [previewDrawerData, setPreviewDrawerData] = useState<{
    isOpen: boolean;
    type: 'request' | 'sample' | 'unit' | 'reaction';
    data: any;
  }>({
    isOpen: false,
    type: 'request',
    data: null
  });

  // Modals
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<BloodProductRequest | null>(null);
  const [selectedRequestForAllocation, setSelectedRequestForAllocation] = useState<BloodProductRequest | null>(null);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<BloodProductUnit | null>(null);
  const [selectedUnitForPrep, setSelectedUnitForPrep] = useState<BloodProductUnit | null>(null);
  const [selectedIssueContext, setSelectedIssueContext] = useState<{
    request: BloodProductRequest;
    unit: BloodProductUnit;
  } | null>(null);
  const [isEmergencyReleaseOpen, setIsEmergencyReleaseOpen] = useState(false);
  const [isMtpModalOpen, setIsMtpModalOpen] = useState(false);

  // Filters for requests table
  const [requestSearch, setRequestSearch] = useState('');
  const [requestUrgencyFilter, setRequestUrgencyFilter] = useState('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');

  // Filtered requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      r.patientName.includes(requestSearch) ||
      r.mrn.includes(requestSearch) ||
      r.id.includes(requestSearch) ||
      r.locationWardBed.includes(requestSearch);

    const matchesUrgency = requestUrgencyFilter === 'all' || r.urgencyLevel === requestUrgencyFilter;
    const matchesStatus = requestStatusFilter === 'all' || r.requestStatus === requestStatusFilter;

    return matchesSearch && matchesUrgency && matchesStatus;
  });

  // Handlers
  const handleSelectScenario = (scenario: BloodBankDemoScenario) => {
    setCurrentScenarioId(scenario.id);
    // Switch to corresponding operational tab
    setActiveTab(scenario.recommendedTab as BloodBankOperationalTab);

    // Auto-select item if provided
    if (scenario.targetRequestId) {
      const found = requests.find(r => r.id === scenario.targetRequestId);
      if (found) {
        setSelectedRequestForDetail(found);
      }
    }
  };

  const handleOpenAllocation = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (req) {
      setSelectedRequestForAllocation(req);
    }
  };

  const handleConfirmAllocation = (requestId: string, selectedUnitIds: string[]) => {
    // Update request
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            allocatedUnitIds: [...r.allocatedUnitIds, ...selectedUnitIds],
            requestStatus: 'ready_for_issue'
          };
        }
        return r;
      })
    );

    // Update units
    setUnits(prev =>
      prev.map(u => {
        if (selectedUnitIds.includes(u.id)) {
          const req = requests.find(r => r.id === requestId);
          return {
            ...u,
            status: 'ready_for_issue',
            allocatedToRequestId: requestId,
            allocatedToPatientName: req?.patientName,
            allocatedToPatientMrn: req?.mrn,
            allocatedAt: 'الآن'
          };
        }
        return u;
      })
    );
  };

  const handleSavePreparation = (prepData: {
    sourceUnitId: string;
    method: any;
    lifecycleStatus: any;
    responsibleActor: string;
    deviceIdentifier: string;
    resultingIdentity: string;
    resultingVolumeMl: number;
    expirySourceCitation: string;
    postModExpiryDate: string;
    expiryVerificationStatus: any;
    quarantineReason?: string;
    childUnitsData?: Array<{ id: string; unitNumber: string; volumeMl: number; label: string }>;
    contributingUnitIds?: string[];
    poolIdentifier?: string;
    newAttributes: any[];
  }) => {
    const processingRecord: ProductProcessingRecord = {
      id: `PROC-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceUnitIds: [prepData.sourceUnitId],
      sourceProductIdentity: prepData.resultingIdentity,
      processingMethod: prepData.method,
      processingMethodAr:
        prepData.method === 'irradiation' ? 'تشعيع المشتق (Irradiation)' :
        prepData.method === 'thawing' ? 'إذابة المشتق (Thawing)' :
        prepData.method === 'cryo_pooling' ? 'دمج الراسب البرودي (Cryo Pooling)' :
        prepData.method === 'washing' ? 'غسيل الكريات (Washing)' : 'تجزئة وحدات الأطفال (Splitting)',
      status: prepData.lifecycleStatus,
      requestedAt: 'اليوم 09:00 ص',
      completedAt: 'الآن',
      responsibleSimulatedActor: prepData.responsibleActor,
      deviceIdentifier: prepData.deviceIdentifier,
      resultingProductIdentity: prepData.resultingIdentity,
      resultingVolumeMl: prepData.resultingVolumeMl,
      poolIdentifier: prepData.poolIdentifier,
      expirySource: prepData.expirySourceCitation,
      expiryVerificationStatus: prepData.expiryVerificationStatus,
      calculatedExpiryDate: prepData.postModExpiryDate,
      quarantineOrRejectionReason: prepData.quarantineReason,
      isOptionalHospitalCapability: true
    };

    setUnits(prev => {
      let updated = prev.map(u => {
        if (u.id === prepData.sourceUnitId) {
          // Safety Rule: Preexisting quarantine status MUST be preserved. Processing does not lift quarantine.
          const isPreExistingQuarantine = u.status === 'quarantined';
          const isQuarantined = isPreExistingQuarantine || prepData.lifecycleStatus === 'rejected_quarantined';
          const isVerified = prepData.lifecycleStatus === 'verified';

          return {
            ...u,
            specialAttributes: prepData.newAttributes,
            // Preserve original supplier/collection expiry vs verified post-processing expiry
            originalExpiryDate: u.originalExpiryDate || u.expiryDate,
            postProcessingVerifiedExpiry: prepData.postModExpiryDate,
            // Do NOT set ready_for_issue or in_preparation if already quarantined!
            status: isQuarantined ? ('quarantined' as const) : ('in_preparation' as const),
            isEligibleForNextStep: isVerified,
            expiryVerificationStatus: prepData.expiryVerificationStatus,
            childUnitIds: prepData.childUnitsData?.map(c => c.id) || u.childUnitIds,
            contributingUnitIds: prepData.contributingUnitIds || u.contributingUnitIds,
            poolIdentifier: prepData.poolIdentifier || u.poolIdentifier,
            processingHistory: [...(u.processingHistory || []), processingRecord],
            modificationExpiryDetails: {
              newExpiryDate: prepData.postModExpiryDate,
              regulatorySource: prepData.expirySourceCitation,
              standardVersion: 'v8 / 35th Ed',
              specificConditionAr: 'وفق المعيار السريري المعتمد',
              verificationStatus: prepData.expiryVerificationStatus,
              verifiedBy: prepData.responsibleActor
            },
            preparationState: {
              isIrradiated: prepData.method === 'irradiation' || u.preparationState?.isIrradiated,
              irradiatedAt: prepData.method === 'irradiation' ? 'الآن' : u.preparationState?.irradiatedAt,
              isThawed: prepData.method === 'thawing' || prepData.method === 'cryo_pooling' || u.preparationState?.isThawed,
              thawedAt: prepData.method === 'thawing' || prepData.method === 'cryo_pooling' ? 'الآن' : u.preparationState?.thawedAt,
              thawExpiry: prepData.postModExpiryDate,
              isWashed: prepData.method === 'washing' || u.preparationState?.isWashed,
              isPooled: prepData.method === 'cryo_pooling' || u.preparationState?.isPooled,
              isSplit: prepData.method === 'pediatric_splitting' || u.preparationState?.isSplit
            }
          };
        }
        return u;
      });

      // If pediatric splitting was performed, add child aliquot units without deleting parent unit history
      if (prepData.childUnitsData && prepData.childUnitsData.length > 0) {
        const parent = prev.find(u => u.id === prepData.sourceUnitId);
        if (parent) {
          const childUnits: BloodProductUnit[] = prepData.childUnitsData.map((child, idx) => ({
            id: child.id,
            unitNumber: child.unitNumber,
            componentType: parent.componentType,
            componentNameAr: `${parent.componentNameAr} - حصة أطفال ${idx + 1}`,
            componentNameEn: `${parent.componentNameEn} Pediatric Aliquot ${idx + 1}`,
            bloodGroup: parent.bloodGroup,
            volumeMl: child.volumeMl,
            collectionDate: parent.collectionDate,
            originalExpiryDate: parent.originalExpiryDate || parent.expiryDate,
            postProcessingVerifiedExpiry: prepData.postModExpiryDate,
            expiryDate: prepData.postModExpiryDate || parent.expiryDate,
            expiryVerificationStatus: prepData.expiryVerificationStatus,
            isNearExpiry: parent.isNearExpiry,
            storageLocation: 'ثلاجة دم الأطفال وحديثي الولادة - الرف P1',
            storageTemperatureC: parent.storageTemperatureC,
            specialAttributes: [...parent.specialAttributes, 'pediatric_split'],
            status: (parent.status === 'quarantined' || prepData.lifecycleStatus === 'rejected_quarantined') ? 'quarantined' : 'in_preparation',
            parentUnitId: parent.id,
            isEligibleForNextStep: prepData.lifecycleStatus === 'verified',
            processingHistory: [processingRecord]
          }));

          updated = [...updated, ...childUnits];
        }
      }

      return updated;
    });
  };

  const handleConfirmIssue = (issueData: any) => {
    const newIssue: ProductIssueRecord = {
      id: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: issueData.requestId,
      unitId: issueData.unitId,
      unitNumber: units.find(u => u.id === issueData.unitId)?.unitNumber || '',
      patientId: 'p-active',
      patientName: requests.find(r => r.id === issueData.requestId)?.patientName || '',
      patientMrn: requests.find(r => r.id === issueData.requestId)?.mrn || '',
      destinationLocation: issueData.destinationLocation,
      issuedAt: 'الآن (مباشر)',
      issuingTechnologist: 'أخصائي بنك الدم بدر العتيبي',
      receivingStaffName: issueData.receivingStaffName,
      receivingStaffRole: issueData.receivingStaffRole,
      handoffMethod: issueData.handoffMethod,
      transportCarrierId: issueData.transportCarrierId,
      coldChainIndicatorConfirmed: Boolean(issueData.coldChainConfirmed),
      returnWindowNotice: 'يجب إرجاع الوحدة خلال 30 دقيقة إذا تأجل النقل ولم يتم فتح الكيس',
      issueStatus: 'issued_in_transit'
    };

    setIssues(prev => [newIssue, ...prev]);

    // Update unit status to issued
    setUnits(prev =>
      prev.map(u => {
        if (u.id === issueData.unitId) {
          return {
            ...u,
            status: 'issued',
            issuedAt: 'الآن',
            issuedToLocation: issueData.destinationLocation
          };
        }
        return u;
      })
    );

    // Update request status to issued
    setRequests(prev =>
      prev.map(r => {
        if (r.id === issueData.requestId) {
          return {
            ...r,
            issuedUnitIds: [...r.issuedUnitIds, issueData.unitId],
            requestStatus: 'issued'
          };
        }
        return r;
      })
    );
  };

  const handleConfirmEmergencyRelease = (details: any) => {
    // Mark units as emergency released
    setUnits(prev =>
      prev.map(u => {
        if (details.selectedUnitIds.includes(u.id)) {
          return {
            ...u,
            status: 'issued',
            allocatedToPatientName: details.patientIdentifier,
            issuedToLocation: details.destinationLocation,
            issuedAt: 'صرف طارئ الآن'
          };
        }
        return u;
      })
    );

    // Add compatibility record with emergency status
    const emergencyComp: CompatibilityRecord = {
      id: `COMP-EMERG-${Math.floor(100 + Math.random() * 900)}`,
      requestId: 'REQ-EMERGENCY',
      sampleId: 'SAMP-STAT-EMERG',
      patientId: 'p-emerg',
      patientMrn: 'MRN-EMERG-991',
      patientName: details.patientIdentifier,
      patientGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (O-)', displayEn: 'O Negative (O-)' },
      unitId: details.selectedUnitIds[0] || 'DIN-EMERG',
      unitNumber: units.find(u => u.id === details.selectedUnitIds[0])?.unitNumber || '=W0422 26 10941 00',
      unitGroup: { abo: 'O', rh: 'negative', displayAr: 'O سالب (O-)', displayEn: 'O Negative (O-)' },
      componentType: 'packed_red_blood_cells',
      method: 'emergency_uncrossmatched',
      methodDisplayAr: 'صرف طارئ غير متوافق (Emergency Release)',
      result: 'emergency_uncrossmatched_released',
      isSpecialRequirementSatisfied: true,
      satisfiedRequirementsList: ['تفويض استشاري مباشر', 'سحب عينة ما قبل النقل بالتوازي'],
      technologistName: 'أخصائي طوارئ بنك الدم',
      verifierName: details.authorizingConsultant,
      testedAt: 'الآن (فوري)'
    };
    setCompatibilities(prev => [emergencyComp, ...prev]);
  };

  const handleIssueMtpPack = (sessionId: string, packNumber: number) => {
    setMtpSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            currentPackNumber: packNumber + 1,
            prbcUnitsIssued: s.prbcUnitsIssued + 4,
            ffpUnitsIssued: s.ffpUnitsIssued + 4,
            plateletUnitsIssued: s.plateletUnitsIssued + 1
          };
        }
        return s;
      })
    );
  };

  const handleDeactivateMtp = (sessionId: string, reason: string) => {
    setMtpSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: 'deactivated',
            deactivatedAt: 'الآن',
            deactivationReason: reason
          };
        }
        return s;
      })
    );
  };

  const handleNewReturn = (newRet: ProductReturnRecord) => {
    setReturns(prev => [newRet, ...prev]);
  };

  const handleUpdateReactionCase = (updated: TransfusionReactionCase) => {
    setReactions(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const readyUnits = units.filter(u => u.status === 'ready_for_issue');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800" dir="rtl">
      {/* Top Department & Persona Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Department Branding & Switcher */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-2xs">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wide">
                  عمليات بنك الدم وطب نقل الدم (Blood Bank & Transfusion Medicine Operations)
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-800">
                  UX PROTOTYPE ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                فصل صارم بين الطلب والعينة والتوافق والتخصيص والصرف دون دمج بالصرف السريري
              </p>
            </div>
          </div>

          {/* Department Switcher & Scenario Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Scenario Button */}
            <button
              onClick={() => setIsScenariosModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>سيناريوهات المحاكاة السريرية (A-H)</span>
            </button>

            {/* Persona Switcher */}
            <select
              value={activePersona}
              onChange={e => setActivePersona(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 focus:outline-none"
            >
              <option value="أخصائي بنك الدم (Blood Bank Tech)">أخصائي بنك الدم (Immunohematology Tech)</option>
              <option value="استشاري طب نقل الدم (Transfusion Specialist)">استشاري طب نقل الدم (Consultant)</option>
              <option value="مشرف الجودة واليقظة الدموية (Hemovigilance Lead)">مشرف الجودة واليقظة الدموية (Hemovigilance)</option>
            </select>

            {/* Department Navigation Shortcut */}
            {onNavigateDepartment && (
              <select
                onChange={e => {
                  if (e.target.value) {
                    onNavigateDepartment(e.target.value);
                  }
                }}
                defaultValue="blood_bank_ops"
                className="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
              >
                <option value="blood_bank_ops">بنك الدم (Blood Bank)</option>
                <option value="pharmacy_ops">الصيدلية والعمليات (Pharmacy)</option>
                <option value="radiology_ops">الأشعة والتصوير (Radiology)</option>
                <option value="laboratory_ops">المختبر وعلم الأمراض (Lab)</option>
                <option value="patient_access">دخول وتنويم المرضى (ADT)</option>
                <option value="staff_clinical">التمريض والسريري (Clinical)</option>
              </select>
            )}
          </div>
        </div>

        {/* Subnav Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <nav className="flex items-center space-x-reverse space-x-1 border-t border-slate-800 py-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>لوحة العمليات</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>طلبات المشتقات</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 font-mono text-[10px]">
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('samples')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'samples'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>عينات ما قبل النقل</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                {samples.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('grouping')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'grouping'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>فحص الفصائل الأمامية والخلفية</span>
            </button>

            <button
              onClick={() => setActiveTab('screen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'screen'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>مسح الأجسام المضادة</span>
            </button>

            <button
              onClick={() => setActiveTab('crossmatch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'crossmatch'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>التوافق والمطابقة</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>المخزون والثلاجات</span>
            </button>

            <button
              onClick={() => setActiveTab('issue_queue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'issue_queue'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>طابور الصرف والتسليم</span>
              {readyUnits.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-teal-500 text-white font-mono text-[10px] font-bold">
                  {readyUnits.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'returns'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استلام العائدات</span>
            </button>

            <button
              onClick={() => setActiveTab('reactions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reactions'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>تفاعلات نقل الدم</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 font-mono text-[10px]">
                {reactions.length}
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-4">
        {/* Tab 1: Operational Home Overview */}
        {activeTab === 'overview' && (
          <BloodBankOperationalHome
            metrics={metrics}
            mtpSessions={mtpSessions}
            pendingRequests={requests}
            pendingSamples={samples}
            readyUnits={readyUnits}
            onNavigateTab={tabKey => setActiveTab(tabKey)}
            onOpenMtpModal={() => setIsMtpModalOpen(true)}
            onOpenEmergencyRelease={() => setIsEmergencyReleaseOpen(true)}
            onSelectRequest={req => setSelectedRequestForDetail(req)}
          />
        )}

        {/* Tab 2: Incoming Requests Worklist */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">قائمة طلبات مشتقات الدم الواردة (Blood Product Requests)</h2>
                    <p className="text-xs text-slate-500">
                      متابعة أوامر الصرف الصادرة من الأطباء المصرحين وفرزها حسب الأولوية وحالة التوافق
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={e => setRequestSearch(e.target.value)}
                      placeholder="بحث برقم الطلب، المريض، الجناح..."
                      className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <select
                    value={requestUrgencyFilter}
                    onChange={e => setRequestUrgencyFilter(e.target.value)}
                    className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="all">كافة الأولويات</option>
                    <option value="stat_emergency">STAT طوارئ قصوى</option>
                    <option value="urgent">عاجل (Urgent)</option>
                    <option value="routine">روتيني (Routine)</option>
                  </select>

                  <select
                    value={requestStatusFilter}
                    onChange={e => setRequestStatusFilter(e.target.value)}
                    className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="all">كافة الحالات</option>
                    <option value="received_pending_sample">بانتظار وصول العينة</option>
                    <option value="testing_in_progress">الفحص جاري</option>
                    <option value="ready_for_allocation">جاهز للتخصيص</option>
                    <option value="ready_for_issue">جاهز للتسليم</option>
                    <option value="issued">تم الصرف</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">كود الطلب والأولوية</th>
                      <th className="p-3.5">المريض والملف</th>
                      <th className="p-3.5">الموقع السريري</th>
                      <th className="p-3.5">المشتق والكمية</th>
                      <th className="p-3.5">المتطلبات الخاصة</th>
                      <th className="p-3.5">حالة التوافق والطلب</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-slate-900">{req.id}</div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                            req.urgencyLevel === 'stat_emergency' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            req.urgencyLevel === 'urgent' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {req.urgencyLevel === 'stat_emergency' ? 'STAT طوارئ' : req.urgencyLevel === 'urgent' ? 'عاجل' : 'روتيني'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{req.patientName}</div>
                          <div className="font-mono text-[11px] text-slate-500 mt-0.5">MRN: {req.mrn}</div>
                          {req.patientHistoricalBloodGroup && (
                            <span className="text-[10px] font-mono font-bold text-red-700">
                              فصيلة سابقة: {req.patientHistoricalBloodGroup.displayAr}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 font-medium text-slate-800">
                          {req.locationWardBed}
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{req.componentNameAr}</div>
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            المطلوب: <strong>{req.requestedQuantity}</strong> وحدات
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {req.specialRequirements.map(sr => (
                              <span key={sr} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                                {sr === 'irradiated' ? 'مشعع' : sr === 'leukocyte_reduced' ? 'مفلتر' : sr === 'antigen_negative' ? 'سالب مستضد' : sr}
                              </span>
                            ))}
                            {req.specialRequirements.length === 0 && (
                              <span className="text-slate-400 text-[11px]">معياري (Standard)</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.requestStatus === 'issued' ? 'bg-slate-200 text-slate-700' :
                            req.requestStatus === 'ready_for_issue' ? 'bg-teal-100 text-teal-800' :
                            req.requestStatus === 'ready_for_allocation' ? 'bg-blue-100 text-blue-800' :
                            req.requestStatus === 'testing_in_progress' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {req.requestStatus === 'issued' ? 'تم الصرف والتسليم' :
                             req.requestStatus === 'ready_for_issue' ? 'جاهز للصرف والتسليم' :
                             req.requestStatus === 'ready_for_allocation' ? 'جاهز للتخصيص' :
                             req.requestStatus === 'testing_in_progress' ? 'الفحص جاري' :
                             'بانتظار العينة'}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedRequestForDetail(req)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                            >
                              تفاصيل
                            </button>

                            {req.requestStatus === 'ready_for_allocation' && (
                              <button
                                onClick={() => handleOpenAllocation(req.id)}
                                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                              >
                                تخصيص وحدات
                              </button>
                            )}

                            <button
                              onClick={() => setPreviewDrawerData({ isOpen: true, type: 'request', data: req })}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="معاينة سريعة"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pre-Transfusion Samples */}
        {activeTab === 'samples' && (
          <PreTransfusionSamplesView
            samples={samples}
            onSelectSample={sample => {
              setPreviewDrawerData({ isOpen: true, type: 'sample', data: sample });
            }}
            onOpenGroupingWorkspace={sampleId => {
              setActiveTab('grouping');
            }}
            onOpenAntibodyWorkspace={sampleId => {
              setActiveTab('screen');
            }}
            onUpdateSample={updatedSample => {
              setSamples(prev => prev.map(s => (s.id === updatedSample.id ? updatedSample : s)));
            }}
          />
        )}

        {/* Tab 4: ABO / Rh Typing & Discrepancies */}
        {activeTab === 'grouping' && (
          <BloodGroupTypingWorkspace
            results={typingResults}
            samples={samples}
            onConfirmVerification={(resultId, verifierName) => {
              setTypingResults(prev =>
                prev.map(r =>
                  r.id === resultId
                    ? {
                        ...r,
                        historicalVerificationStatus: 'verified_with_historical_match',
                        secondVerifierName: verifierName
                      }
                    : r
                )
              );
            }}
            onNavigateToAntibodyScreen={sampleId => {
              setActiveTab('screen');
            }}
          />
        )}

        {/* Tab 5: Antibody Screen & Investigation */}
        {activeTab === 'screen' && (
          <AntibodyScreenWorkspace
            screens={antibodyScreens}
            samples={samples}
            onNavigateToCrossmatch={() => setActiveTab('crossmatch')}
            onSearchAntigenNegativeUnits={criteria => {
              setActiveTab('inventory');
            }}
          />
        )}

        {/* Tab 6: Compatibility & Crossmatch */}
        {activeTab === 'crossmatch' && (
          <CompatibilityWorkspace
            records={compatibilities}
            onOpenAllocation={handleOpenAllocation}
            onOpenEmergencyReleaseModal={() => setIsEmergencyReleaseOpen(true)}
          />
        )}

        {/* Tab 7: Product Inventory Context */}
        {activeTab === 'inventory' && (
          <ProductInventoryContextView
            units={units}
            onSelectUnit={unit => setSelectedUnitForDetail(unit)}
            onOpenPreparationModal={unit => setSelectedUnitForPrep(unit)}
          />
        )}

        {/* Tab 8: Ready / Issue Queue */}
        {activeTab === 'issue_queue' && (
          <ReadyAndIssueQueueView
            readyUnits={readyUnits}
            requests={requests}
            recentIssues={issues}
            onOpenIssueModal={(req, unit) => setSelectedIssueContext({ request: req, unit })}
          />
        )}

        {/* Tab 9: Product Returns & Cold Chain Disposition */}
        {activeTab === 'returns' && (
          <ProductReturnsView
            returns={returns}
            onConfirmNewDisposition={handleNewReturn}
          />
        )}

        {/* Tab 10: Transfusion Reactions & Hemovigilance */}
        {activeTab === 'reactions' && (
          <TransfusionReactionsView
            cases={reactions}
            onUpdateCase={handleUpdateReactionCase}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <BloodBankDemoScenariosModal
        isOpen={isScenariosModalOpen}
        onClose={() => setIsScenariosModalOpen(false)}
        scenarios={mockBloodBankScenarios}
        activeScenarioId={currentScenarioId}
        onSelectScenario={handleSelectScenario}
      />

      <BloodBankQuickPreviewDrawer
        isOpen={previewDrawerData.isOpen}
        onClose={() => setPreviewDrawerData(prev => ({ ...prev, isOpen: false }))}
        type={previewDrawerData.type}
        data={previewDrawerData.data}
      />

      <BloodRequestDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
        allUnits={units}
        onOpenSampleWorkspace={sampleId => {
          setSelectedRequestForDetail(null);
          setActiveTab('samples');
        }}
        onOpenCompatibilityWorkspace={reqId => {
          setSelectedRequestForDetail(null);
          setActiveTab('crossmatch');
        }}
        onOpenAllocationModal={req => {
          setSelectedRequestForDetail(null);
          handleOpenAllocation(req.id);
        }}
        onOpenIssueModal={req => {
          setSelectedRequestForDetail(null);
          const firstAllocated = units.find(u => req.allocatedUnitIds.includes(u.id));
          if (firstAllocated) {
            setSelectedIssueContext({ request: req, unit: firstAllocated });
          }
        }}
      />

      <ProductSelectionAllocationModal
        isOpen={!!selectedRequestForAllocation}
        onClose={() => setSelectedRequestForAllocation(null)}
        request={selectedRequestForAllocation}
        availableUnits={units}
        onConfirmAllocation={handleConfirmAllocation}
      />

      <ProductPreparationModal
        isOpen={!!selectedUnitForPrep}
        onClose={() => setSelectedUnitForPrep(null)}
        unit={selectedUnitForPrep}
        allUnits={units}
        onSavePreparation={handleSavePreparation}
      />

      <ProductIssueModal
        isOpen={!!selectedIssueContext}
        onClose={() => setSelectedIssueContext(null)}
        request={selectedIssueContext?.request || null}
        unit={selectedIssueContext?.unit || null}
        onConfirmIssue={handleConfirmIssue}
      />

      <ProductUnitDetailModal
        isOpen={!!selectedUnitForDetail}
        onClose={() => setSelectedUnitForDetail(null)}
        unit={selectedUnitForDetail}
        traceabilityEvents={mockTraceabilityEvents}
      />

      <EmergencyReleaseModal
        isOpen={isEmergencyReleaseOpen}
        onClose={() => setIsEmergencyReleaseOpen(false)}
        availableEmergencyUnits={units.filter(u => u.bloodGroup.abo === 'O' && u.bloodGroup.rh === 'negative')}
        onConfirmEmergencyRelease={handleConfirmEmergencyRelease}
      />

      <MassiveTransfusionProtocolModal
        isOpen={isMtpModalOpen}
        onClose={() => setIsMtpModalOpen(false)}
        session={mtpSessions.find(s => s.status === 'active') || mtpSessions[0]}
        onIssueMtpPack={handleIssueMtpPack}
        onDeactivateMtp={handleDeactivateMtp}
      />
    </div>
  );
};
