import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Stethoscope,
  Pill,
  ArrowRightLeft,
  Filter,
  Search,
  CheckSquare,
  Flame,
  ShieldAlert,
  HelpCircle,
  Inbox,
  Users,
  PlayCircle,
  SlidersHorizontal,
  HandMetal,
  Layers,
  Sparkles,
  ExternalLink,
  Ban
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import {
  WorkItemRecord,
  MyWorkOperationalView,
  ClinicalPriority,
  WorkItemType
} from '../../types/clinicalWorkItems';
import {
  initialMockWorkItems,
  mockWorkQueues
} from '../../data/mockClinicalWorkItemsData';
import { MyWorkTopContextBar } from './components/MyWorkTopContextBar';
import { MyWorkSummaryStrip } from './components/MyWorkSummaryStrip';
import { MyWorkFiltersBar } from './components/MyWorkFiltersBar';
import { WorkItemRow } from './components/WorkItemRow';
import { WorkItemDetailPanel } from './components/WorkItemDetailPanel';
import { QuickOutcomeModal } from './components/QuickOutcomeModal';
import { ClaimConflictModal } from './components/ClaimConflictModal';
import { ClinicalWorkArea } from '../../types/clinicalWorkspace';

export const MyWorkDashboard: React.FC = () => {
  const {
    currentStaff,
    currentRole,
    workspaceOrigin,
    openPatientWorkspace,
    playChime
  } = useHis();

  // Local state for interactive prototype
  const [workItems, setWorkItems] = useState<WorkItemRecord[]>(initialMockWorkItems);
  const [activePersona, setActivePersona] = useState<'doctor' | 'nurse' | 'pharmacist' | 'supervisor'>(
    currentRole === 'nurse' ? 'nurse' : 'doctor'
  );
  const [selectedWorkArea, setSelectedWorkArea] = useState<ClinicalWorkArea | 'all'>('all');
  const [activeView, setActiveView] = useState<MyWorkOperationalView>('team_queue');
  const [selectedQueueId, setSelectedQueueId] = useState<string>('queue-all');
  const [selectedPriority, setSelectedPriority] = useState<ClinicalPriority | 'all'>('all');
  const [selectedType, setSelectedType] = useState<WorkItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'due_soon' | 'oldest' | 'newest' | 'patient'>('priority');
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [completingItem, setCompletingItem] = useState<WorkItemRecord | null>(null);
  const [conflictItem, setConflictItem] = useState<WorkItemRecord | null>(null);
  const [actionNotification, setActionNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Current staff identifier for mock ownership
  const currentStaffId = 'staff-doc-01'; // Matches current logged in physician persona

  // =========================================================================
  // WORKSPACE ORIGIN RESTORATION (Guideline #17)
  // When clinician returns from Patient Workspace, restore their exact view & selection!
  // =========================================================================
  useEffect(() => {
    if (workspaceOrigin && workspaceOrigin.workArea === 'my_work') {
      if (workspaceOrigin.tab) {
        setActiveView(workspaceOrigin.tab as MyWorkOperationalView);
      }
      if (workspaceOrigin.filter) {
        setSelectedQueueId(workspaceOrigin.filter);
      }
      if (workspaceOrigin.searchQuery !== undefined) {
        setSearchQuery(workspaceOrigin.searchQuery);
      }
      if (workspaceOrigin.selectedId) {
        setSelectedWorkItemId(workspaceOrigin.selectedId);
      }
    }
  }, [workspaceOrigin]);

  // Adjust default view when switching persona
  const handlePersonaChange = (persona: 'doctor' | 'nurse' | 'pharmacist' | 'supervisor') => {
    setActivePersona(persona);
    if (persona === 'pharmacist') {
      setSelectedQueueId('queue-pharmacy-verification');
    } else if (persona === 'nurse') {
      setSelectedQueueId('queue-nursing-care');
    } else if (persona === 'doctor') {
      setSelectedQueueId('queue-all');
    }
    showToastNotification(`تم التبديل إلى المنظور المهني: ${
      persona === 'doctor' ? 'طبيب معالج' : persona === 'nurse' ? 'طاقم تمريض' : persona === 'pharmacist' ? 'صيدلي إكلينيكي' : 'مشرف سريري'
    }`);
  };

  // Toast notification helper
  const showToastNotification = (msg: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setActionNotification({ message: msg, type });
    setTimeout(() => {
      setActionNotification(null);
    }, 4000);
  };

  // Refresh handler (simulates real-time poll)
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToastNotification('تم تحديث قائمة الإجراءات التشغيلية بنجاح.', 'success');
    }, 450);
  };

  // Operational metrics calculation
  const criticalCount = useMemo(
    () => workItems.filter(i => i.priority === 'critical' && i.operationalStatus !== 'completed' && !i.isCancelledSource).length,
    [workItems]
  );
  const dueSoonCount = useMemo(
    () => workItems.filter(i => i.dueState === 'due_soon' && i.operationalStatus !== 'completed' && !i.isCancelledSource).length,
    [workItems]
  );
  const overdueCount = useMemo(
    () => workItems.filter(i => i.dueState === 'overdue' && i.operationalStatus !== 'completed' && !i.isCancelledSource).length,
    [workItems]
  );
  const unassignedCount = useMemo(
    () => workItems.filter(i => i.operationalStatus === 'unassigned' && !i.isCancelledSource).length,
    [workItems]
  );
  const inProgressCount = useMemo(
    () => workItems.filter(i => (i.operationalStatus === 'in_progress' || i.operationalStatus === 'claimed') && !i.isCancelledSource).length,
    [workItems]
  );
  const myClaimedCount = useMemo(
    () => workItems.filter(i => (i.claimedBy?.id === currentStaffId || i.assignedTo?.id === currentStaffId) && i.operationalStatus !== 'completed').length,
    [workItems]
  );

  // Filtering Logic
  const filteredWorkItems = useMemo(() => {
    return workItems.filter(item => {
      // 1. Work Area Scope
      if (selectedWorkArea !== 'all' && item.workArea !== selectedWorkArea) {
        return false;
      }

      // 2. Queue selection
      if (selectedQueueId !== 'queue-all' && item.queueId !== selectedQueueId) {
        return false;
      }

      // 3. Operational View Tab
      switch (activeView) {
        case 'my_work':
          const isMine = item.claimedBy?.id === currentStaffId || item.assignedTo?.id === currentStaffId;
          if (!isMine || item.operationalStatus === 'completed') return false;
          break;
        case 'team_queue':
          if (item.operationalStatus === 'completed') return false;
          break;
        case 'unassigned':
          if (item.operationalStatus !== 'unassigned') return false;
          break;
        case 'in_progress':
          if (item.operationalStatus !== 'in_progress' && item.operationalStatus !== 'claimed') return false;
          break;
        case 'waiting':
          if (
            item.operationalStatus !== 'waiting_in_queue' &&
            item.operationalStatus !== 'waiting_for_info' &&
            item.operationalStatus !== 'waiting_for_patient' &&
            item.operationalStatus !== 'waiting_external'
          ) {
            return false;
          }
          break;
        case 'completed':
          if (item.operationalStatus !== 'completed') return false;
          break;
      }

      // 4. Priority Filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      // 5. Work Type Filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // 6. Search Query (Patient name, MRN, title, ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchSourceId = item.sourceResourceId.toLowerCase().includes(q);
        const matchPatient =
          item.patient?.nameAr.toLowerCase().includes(q) ||
          item.patient?.nameEn.toLowerCase().includes(q) ||
          item.patient?.mrn.toLowerCase().includes(q) ||
          item.patient?.currentLocation.toLowerCase().includes(q);

        if (!matchTitle && !matchId && !matchSourceId && !matchPatient) {
          return false;
        }
      }

      return true;
    });
  }, [
    workItems,
    selectedWorkArea,
    selectedQueueId,
    activeView,
    selectedPriority,
    selectedType,
    searchQuery,
    currentStaffId
  ]);

  // Sorting Logic
  const sortedWorkItems = useMemo(() => {
    const list = [...filteredWorkItems];
    return list.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityWeight: Record<ClinicalPriority, number> = {
            critical: 4,
            urgent: 3,
            priority: 2,
            routine: 1
          };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        case 'due_soon': {
          const dueA = a.dueTimestamp || Infinity;
          const dueB = b.dueTimestamp || Infinity;
          return dueA - dueB;
        }
        case 'oldest':
          return a.createdTimestamp - b.createdTimestamp;
        case 'newest':
          return b.createdTimestamp - a.createdTimestamp;
        case 'patient': {
          const nameA = a.patient?.nameAr || '';
          const nameB = b.patient?.nameAr || '';
          return nameA.localeCompare(nameB, 'ar');
        }
        default:
          return 0;
      }
    });
  }, [filteredWorkItems, sortBy]);

  // Selected item reference
  const selectedItem = useMemo(() => {
    return workItems.find(i => i.id === selectedWorkItemId) || null;
  }, [workItems, selectedWorkItemId]);

  // =========================================================================
  // INTERACTIVE WORKFLOW ACTIONS (MOCK ENGINE PROJECTION)
  // =========================================================================

  // Claim action with conflict simulation
  const handleClaim = (item: WorkItemRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Trigger Claim Conflict simulation for Scenario I (Requirement #35)
    if (item.id === 'WI-CONF-009') {
      setConflictItem(item);
      return;
    }

    setWorkItems(prev =>
      prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            operationalStatus: 'claimed',
            claimedBy: {
              id: currentStaffId,
              name: currentStaff.name,
              role: currentRole === 'doctor' ? 'طبيب معالج' : 'ممرض سريري',
              claimedAt: 'الآن'
            },
            activityHistory: [
              ...i.activityHistory,
              {
                id: `ACT-${Date.now()}`,
                timestamp: 'الآن',
                eventType: 'claimed',
                actorName: currentStaff.name,
                actorRole: currentRole,
                description: 'استلام الإجراء التشغيلي من الطابور لبدء المراجعة'
              }
            ]
          };
        }
        return i;
      })
    );

    if (playChime) playChime();
    showToastNotification(`تم استلام الإجراء "${item.title}" بنجاح ونقله إلى أعمالي.`, 'success');
  };

  // Release action (reverts claim)
  const handleRelease = (item: WorkItemRecord) => {
    setWorkItems(prev =>
      prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            operationalStatus: 'unassigned',
            claimedBy: null,
            activityHistory: [
              ...i.activityHistory,
              {
                id: `ACT-${Date.now()}`,
                timestamp: 'الآن',
                eventType: 'reassigned',
                actorName: currentStaff.name,
                actorRole: currentRole,
                description: 'إلغاء الاستلام وإعادة الإجراء إلى طابور الانتظار العام'
              }
            ]
          };
        }
        return i;
      })
    );
    showToastNotification(`تم إلغاء استلام الإجراء وإعادته للطابور.`, 'info');
  };

  // Accept action (e.g. ICU admission acceptance)
  const handleAccept = (item: WorkItemRecord) => {
    setWorkItems(prev =>
      prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            operationalStatus: 'accepted',
            claimedBy: {
              id: currentStaffId,
              name: currentStaff.name,
              role: 'استشاري العناية المركزة',
              claimedAt: 'الآن'
            },
            activityHistory: [
              ...i.activityHistory,
              {
                id: `ACT-${Date.now()}`,
                timestamp: 'الآن',
                eventType: 'started',
                actorName: currentStaff.name,
                actorRole: currentRole,
                description: 'تم قبول طلب التنويم بالعناية وتأكيد حجز السرير'
              }
            ]
          };
        }
        return i;
      })
    );
    showToastNotification(`تم قبول الطلب السريري "${item.title}".`, 'success');
  };

  // Acknowledge action (for Critical Results)
  const handleAcknowledge = (item: WorkItemRecord) => {
    setWorkItems(prev =>
      prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            operationalStatus: 'completed',
            completionOutcome: {
              completedAt: 'الآن',
              completedBy: currentStaff.name,
              outcomeNote: 'تم الاطلاع والاعتماد الفوري وإبلاغ الطبيب المعالج والتدخل السريري.',
              resultingDocTitle: 'سجل اعتماد نتيجة حرجة ملزمة (Critical Result Sign-Off)',
              disposition: 'معتمد ومبلغ'
            },
            activityHistory: [
              ...i.activityHistory,
              {
                id: `ACT-${Date.now()}`,
                timestamp: 'الآن',
                eventType: 'completed',
                actorName: currentStaff.name,
                actorRole: currentRole,
                description: 'اعتماد النتيجة الحرجة مع القراءة العكسية وتوثيق الإجراء السريري'
              }
            ]
          };
        }
        return i;
      })
    );
    showToastNotification(`تم اعتماد النتيجة الحرجة وإغلاق الإجراء التشغيلي بنجاح.`, 'success');
  };

  // Request info action
  const handleRequestInfo = (item: WorkItemRecord) => {
    setWorkItems(prev =>
      prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            operationalStatus: 'waiting_for_info',
            activityHistory: [
              ...i.activityHistory,
              {
                id: `ACT-${Date.now()}`,
                timestamp: 'الآن',
                eventType: 'waiting',
                actorName: currentStaff.name,
                actorRole: currentRole,
                description: 'تم إرسال طلب استيضاح معلومات إضافية للطبيب الطالب'
              }
            ]
          };
        }
        return i;
      })
    );
    showToastNotification(`تم إرسال طلب استيضاح، وحالة الإجراء الآن "بانتظار معلومات".`, 'info');
  };

  // Confirm Complete Work Item
  const handleConfirmComplete = (outcomeData: { disposition: string; outcomeNote: string; docTitle?: string }) => {
    if (!completingItem) return;

    setWorkItems(prev =>
      prev.map(i => {
        if (i.id === completingItem.id) {
          return {
            ...i,
            operationalStatus: 'completed',
            completionOutcome: {
              completedAt: 'الآن',
              completedBy: currentStaff.name,
              outcomeNote: outcomeData.outcomeNote,
              disposition: outcomeData.disposition,
              resultingDocTitle: outcomeData.docTitle
            },
            activityHistory: [
              ...i.activityHistory,
              {
                id: `ACT-${Date.now()}`,
                timestamp: 'الآن',
                eventType: 'completed',
                actorName: currentStaff.name,
                actorRole: currentRole,
                description: `إغلاق الإجراء التشغيلي: ${outcomeData.disposition}`,
                outcomeNotes: outcomeData.outcomeNote
              }
            ]
          };
        }
        return i;
      })
    );

    setCompletingItem(null);
    showToastNotification(`تم إغلاق وأرشفة الإجراء التشغيلي "${completingItem.title}".`, 'success');
  };

  // =========================================================================
  // DEEP LINK INTO PATIENT WORKSPACE (Guideline #16 & #17)
  // =========================================================================
  const handleOpenPatientWorkspace = (item: WorkItemRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item.patient) {
      showToastNotification('هذا الإجراء تشغيلي عام وغير مرتبط بملف مريض محدد.', 'warning');
      return;
    }

    // Save current operational context into workspaceOrigin for flawless return
    openPatientWorkspace(item.patient.id, {
      defaultActivity: item.targetWorkspaceAxis,
      originWorkArea: 'my_work',
      tab: activeView,
      filter: selectedQueueId,
      selectedId: item.id,
      searchQuery: searchQuery
    });
  };

  return (
    <div className="space-y-4 pb-12 font-['Cairo',sans-serif]">
      {/* Toast notification banner */}
      {actionNotification && (
        <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in duration-150 ${
          actionNotification.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : actionNotification.type === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-teal-50 border-teal-300 text-teal-950'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-mono text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. TOP CONTEXT BAR (Guideline #6) */}
      <MyWorkTopContextBar
        activePersona={activePersona}
        onChangePersona={handlePersonaChange}
        selectedWorkArea={selectedWorkArea}
        onChangeWorkArea={setSelectedWorkArea}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        activeStaffName={currentStaff.name}
      />

      {/* Demo Scenarios Quick Access Strip (Convenience for evaluation) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 shrink-0 font-bold text-slate-500 text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>سيناريوهات العمل السريري (Interactive Test Scenarios):</span>
        </div>
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            type="button"
            onClick={() => {
              setActiveView('team_queue');
              setSelectedWorkItemId('WI-CONS-001');
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold whitespace-nowrap border border-blue-200 transition-colors"
          >
            A. استشارة جراحة (ER ➔ Surgery)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('team_queue');
              setSelectedWorkItemId('WI-ADM-002');
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold whitespace-nowrap border border-purple-200 transition-colors"
          >
            B. قبول عناية مركزة (ICU Inbound)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('team_queue');
              setSelectedWorkItemId('WI-RES-003');
            }}
            className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 hover:bg-red-100 font-bold whitespace-nowrap border border-red-200 transition-colors"
          >
            C. نتيجة حرجة ملزمة (Troponin I)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('team_queue');
              setSelectedWorkItemId('WI-MED-004');
            }}
            className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold whitespace-nowrap border border-teal-200 transition-colors"
          >
            D. مطابقة دوائية (Med Rec)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('team_queue');
              setSelectedWorkItemId('WI-HAND-005');
            }}
            className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-bold whitespace-nowrap border border-cyan-200 transition-colors"
          >
            E. استلام مناوبة SBAR
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('team_queue');
              setSelectedWorkItemId('WI-CANC-008');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold whitespace-nowrap border border-slate-300 transition-colors"
          >
            H. إلغاء المصدر (Cancelled)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('team_queue');
              setSelectedWorkItemId('WI-CONF-009');
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold whitespace-nowrap border border-amber-300 transition-colors"
          >
            I. محاكاة تعارض الاستلام
          </button>
        </div>
      </div>

      {/* 2. SUMMARY STRIP (Guideline #6) */}
      <MyWorkSummaryStrip
        criticalCount={criticalCount}
        dueSoonCount={dueSoonCount}
        overdueCount={overdueCount}
        unassignedCount={unassignedCount}
        inProgressCount={inProgressCount}
        myClaimedCount={myClaimedCount}
        activeView={activeView}
        onSelectView={setActiveView}
        onFilterUrgentOnly={() => {
          setSelectedPriority('critical');
          setActiveView('team_queue');
        }}
      />

      {/* 3. FILTERS & SEARCH BAR (Guidelines #24, #25, #26) */}
      <MyWorkFiltersBar
        activeView={activeView}
        onChangeView={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedQueueId={selectedQueueId}
        onSelectQueue={setSelectedQueueId}
        availableQueues={mockWorkQueues}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={() => {
          setSelectedPriority('all');
          setSelectedType('all');
          setSelectedQueueId('queue-all');
          setSelectedWorkArea('all');
          setSearchQuery('');
        }}
        hasActiveFilters={
          selectedPriority !== 'all' ||
          selectedType !== 'all' ||
          selectedQueueId !== 'queue-all' ||
          selectedWorkArea !== 'all' ||
          searchQuery !== ''
        }
        totalFilteredCount={sortedWorkItems.length}
      />

      {/* 4. MAIN WORK ITEMS LIST (Guideline #14) */}
      <div className="space-y-2">
        {sortedWorkItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <h4 className="text-base font-bold text-slate-700">لا توجد إجراءات تشغيلية مطابقة</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              لا توجد مهام أو استشارات مطابقة للفلاتر المحددة حالياً. يمكنك تغيير المنظور أو ضبط الفلاتر لعرض الطوابير الأخرى.
            </p>
          </div>
        ) : (
          sortedWorkItems.map(item => (
            <WorkItemRow
              key={item.id}
              item={item}
              isSelected={item.id === selectedWorkItemId}
              onSelect={selected => setSelectedWorkItemId(selected.id)}
              onClaim={handleClaim}
              onOpenPatient={handleOpenPatientWorkspace}
              currentStaffId={currentStaffId}
            />
          ))
        )}
      </div>

      {/* 5. WORK ITEM DETAIL PREVIEW PANEL / SLIDE-IN (Guideline #15) */}
      {selectedItem && (
        <WorkItemDetailPanel
          item={selectedItem}
          onClose={() => setSelectedWorkItemId(null)}
          onOpenPatient={handleOpenPatientWorkspace}
          onClaim={handleClaim}
          onRelease={handleRelease}
          onAccept={handleAccept}
          onRequestInfo={handleRequestInfo}
          onComplete={itemToComplete => setCompletingItem(itemToComplete)}
          onAcknowledge={handleAcknowledge}
          currentStaffId={currentStaffId}
        />
      )}

      {/* 6. QUICK OUTCOME COMPLETION MODAL (Guideline #37) */}
      <QuickOutcomeModal
        isOpen={Boolean(completingItem)}
        onClose={() => setCompletingItem(null)}
        item={completingItem}
        onConfirm={handleConfirmComplete}
        onOpenPatient={handleOpenPatientWorkspace}
      />

      {/* 7. CLAIM CONFLICT SIMULATION MODAL (Guideline #35) */}
      <ClaimConflictModal
        isOpen={Boolean(conflictItem)}
        onClose={() => setConflictItem(null)}
        item={conflictItem}
        onResolve={() => {
          // Update item state to reflect already claimed
          if (conflictItem) {
            setWorkItems(prev =>
              prev.map(i => {
                if (i.id === conflictItem.id) {
                  return {
                    ...i,
                    operationalStatus: 'claimed',
                    claimedBy: {
                      id: 'staff-doc-ahmed',
                      name: 'د. أحمد الشريف',
                      role: 'استشاري الجراحة المناوب',
                      claimedAt: '10:48 AM'
                    }
                  };
                }
                return i;
              })
            );
          }
          setConflictItem(null);
          showToastNotification('تم تحديث الطابور وحالة الإجراء.', 'info');
        }}
      />
    </div>
  );
};
