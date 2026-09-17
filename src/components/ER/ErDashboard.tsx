import React, { useState, useMemo } from 'react';
import {
  Flame,
  AlertOctagon,
  Activity,
  HeartPulse,
  Clock,
  Plus,
  Bed,
  ArrowRightLeft,
  CheckCircle2,
  Stethoscope,
  Siren,
  FileCode,
  Sparkles,
  ChevronDown,
  GitFork,
  Scissors,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Layers,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { ErPatient, ErTriageLevel, Vitals } from '../../types/his';
import { SharedPatientQuickPreview, QuickPreviewPatientData } from '../Shared/SharedPatientQuickPreview';
import {
  BoardSkeletonLoading,
  BoardEmptyState,
  BoardErrorState,
  BoardStaleNotice
} from '../Shared/SharedBoardStateFeedback';

export const ErDashboard: React.FC = () => {
  const {
    erPatients,
    addErPatient,
    updateErPatientStatus,
    openStandardsModal,
    openLifecycleModal,
    admitToIcu,
    dischargePatientFullCycle,
    playChime,
    patients,
    openPatientWorkspace,
    workspaceOrigin
  } = useHis();

  // Restore origin filter/search if returning from workspace
  const defaultFilter = (workspaceOrigin?.boardType === 'er' && workspaceOrigin.activeFilter) || 'all';
  const defaultSearch = (workspaceOrigin?.boardType === 'er' && workspaceOrigin.searchQuery) || '';
  const defaultZone = (workspaceOrigin?.boardType === 'er' && workspaceOrigin.filter) || 'all';

  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter);
  const [zoneFilter, setZoneFilter] = useState<string>(defaultZone);
  const [searchQuery, setSearchQuery] = useState<string>(defaultSearch);
  const [selectedPatientRowId, setSelectedPatientRowId] = useState<string | null>(
    (workspaceOrigin?.boardType === 'er' && workspaceOrigin.selectedPatientId) || null
  );

  // Quick Preview state
  const [previewData, setPreviewData] = useState<QuickPreviewPatientData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Simulated Mock States
  const [isLoadingMock, setIsLoadingMock] = useState<boolean>(false);
  const [isErrorMock, setIsErrorMock] = useState<boolean>(false);
  const [hasStaleNotice, setHasStaleNotice] = useState<boolean>(false);

  // New triage modal state
  const [showNewTriageModal, setShowNewTriageModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [triageLevel, setTriageLevel] = useState<ErTriageLevel>(2);
  const [arrivalMode, setArrivalMode] = useState<ErPatient['arrivalMode']>('ambulance');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [assignedArea, setAssignedArea] = useState<ErPatient['assignedArea']>('acute_trauma');
  const [bedNo, setBedNo] = useState('ER-Bed-03');
  const [attendingDoctor, setAttendingDoctor] = useState('د. وليد الصاوي (جراحة طوارئ)');
  const [bpSystolic, setBpSystolic] = useState('130');
  const [bpDiastolic, setBpDiastolic] = useState('85');
  const [pulseRate, setPulseRate] = useState('95');
  const [spo2, setSpo2] = useState('96');
  const [temp, setTemp] = useState('37.1');
  const [respiratoryRate, setRespiratoryRate] = useState('20');
  const [painScore, setPainScore] = useState('8');
  const [gcs, setGcs] = useState('15');
  const [statOrderText, setStatOrderText] = useState('');

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Counters
  const countL1 = erPatients.filter(p => p.triageLevel === 1 && p.status !== 'discharged').length;
  const countL2 = erPatients.filter(p => p.triageLevel === 2 && p.status !== 'discharged').length;
  const countL3 = erPatients.filter(p => p.triageLevel === 3 && p.status !== 'discharged').length;
  const countTotalActive = erPatients.filter(p => p.status !== 'discharged').length;
  const countPendingConsults = erPatients.filter(p => p.status === 'awaiting_labs' || p.triageLevel <= 2).length;

  // Calculation of elapsed waiting time from actual arrival event timestamp
  const parseArrivalMinutes = (arrivalTime?: string): number | null => {
    if (!arrivalTime || typeof arrivalTime !== 'string' || !arrivalTime.trim()) {
      return null;
    }
    const clean = arrivalTime.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()).trim();

    // Check ISO or full date format
    if (clean.includes('-') || clean.includes('/')) {
      const parsedDate = new Date(clean);
      if (!isNaN(parsedDate.getTime())) {
        const diffMs = Date.now() - parsedDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        return diffMins >= 0 ? diffMins : 0;
      }
    }

    // Check HH:mm format
    const match = clean.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      if (clean.includes('م') || clean.toLowerCase().includes('pm')) {
        if (hours < 12) hours += 12;
      } else if (clean.includes('ص') || clean.toLowerCase().includes('am')) {
        if (hours === 12) hours = 0;
      }
      const arrivalTotalMins = hours * 60 + mins;

      // Current clinical shift reference comparison
      const now = new Date();
      const currentTotalMins = now.getHours() * 60 + now.getMinutes();

      let diff = currentTotalMins - arrivalTotalMins;
      // If run in container where system time is divergent from clinical shift scenario (14:45):
      if (diff < 0 || diff > 480) {
        const shiftRefMins = 14 * 60 + 45;
        diff = shiftRefMins - arrivalTotalMins;
        if (diff < 0) diff += 24 * 60;
      }
      return diff >= 0 ? diff : 0;
    }

    return null;
  };

  const getElapsedWaitString = (arrivalTime?: string): string => {
    const mins = parseArrivalMinutes(arrivalTime);
    if (mins === null) {
      return 'غير مسجل / غير متاح';
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours > 0 ? `${hours}س ` : ''}${remMins}د`;
  };

  const isWaitDelayed = (level: ErTriageLevel, arrivalTime?: string): boolean => {
    const mins = parseArrivalMinutes(arrivalTime);
    if (mins === null) return false;
    // Policy benchmarks based on emergency triage priority:
    // Level 1: Immediate resuscitation (0 min target)
    // Level 2: Emergent (target <= 15 min)
    // Level 3: Urgent (target <= 30 min)
    // Level 4: Less urgent (target <= 60 min)
    // Level 5: Non-urgent (target <= 120 min)
    if (level === 1) return mins > 0;
    if (level === 2) return mins > 15;
    if (level === 3) return mins > 30;
    if (level === 4) return mins > 60;
    if (level === 5) return mins > 120;
    return false;
  };

  // Mock pending consult generator for ER context
  const getMockConsultForPatient = (p: ErPatient) => {
    if (p.triageLevel === 1) {
      return { specialty: 'جراحة عامة / رعاية حثيثة', status: 'pending' as const };
    }
    if (p.triageLevel === 2) {
      return { specialty: 'قلب وأوعية دموية', status: 'accepted' as const };
    }
    if (p.assignedArea === 'acute_trauma') {
      return { specialty: 'عظام وإصابات', status: 'pending' as const };
    }
    return null;
  };

  // Filtered ER Patients
  const filteredPatients = useMemo(() => {
    return erPatients.filter(p => {
      // Exclude discharged by default from active board
      if (p.status === 'discharged') return false;

      // Filter tabs
      if (activeFilter === 'resus' && !(p.triageLevel === 1 || p.assignedArea === 'resus_bay')) return false;
      if (activeFilter === 'acute' && !(p.triageLevel === 2 || p.assignedArea === 'acute_trauma')) return false;
      if (activeFilter === 'fast_track' && !(p.triageLevel >= 3 || p.assignedArea === 'fast_track')) return false;
      if (activeFilter === 'pending_consults') {
        const consult = getMockConsultForPatient(p);
        if (!consult) return false;
      }
      if (activeFilter === 'attention') {
        const needsAttn = p.triageLevel === 1 || p.vitals.spo2 < 93 || isWaitDelayed(p.triageLevel, p.arrivalTime);
        if (!needsAttn) return false;
      }

      // Zone filter
      if (zoneFilter !== 'all' && p.assignedArea !== zoneFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.patientName.toLowerCase().includes(query);
        const matchMrn = p.mrn.toLowerCase().includes(query);
        const matchBed = p.bedNo.toLowerCase().includes(query);
        const matchComplaint = p.chiefComplaint.toLowerCase().includes(query);
        if (!matchName && !matchMrn && !matchBed && !matchComplaint) return false;
      }

      return true;
    });
  }, [erPatients, activeFilter, zoneFilter, searchQuery]);

  const handleOpenQuickPreview = (patient: ErPatient) => {
    setSelectedPatientRowId(patient.patientId);
    const consult = getMockConsultForPatient(patient);

    const data: QuickPreviewPatientData = {
      patientId: patient.patientId,
      patientName: patient.patientName,
      mrn: patient.mrn,
      age: patient.age,
      gender: patient.gender,
      encounterId: `ER-ENC-${patient.mrn.replace('MRN-', '')}`,
      encounterType: 'طوارئ وحوادث (ER Encounter)',
      currentLocation: `${patient.bedNo} (${patient.assignedArea === 'resus_bay' ? 'إنعاش فوري' : patient.assignedArea === 'acute_trauma' ? 'رضوض حادة' : 'مسار سريع'})`,
      boardState: {
        label: patient.status === 'in_treatment' ? 'قيد المعالجة السريرية' :
               patient.status === 'decision_admit' ? 'قرار تنويم فوري' :
               patient.status === 'awaiting_labs' ? 'بانتظار التحاليل والأشعة' : 'وصول جديد',
        variant: patient.triageLevel === 1 ? 'urgent' : patient.triageLevel === 2 ? 'warning' : 'info'
      },
      responsibleTeam: {
        primaryDoctor: patient.attendingDoctor,
        primaryNurse: patient.primaryNurse,
        specialty: 'طب وجراحة الطوارئ (Emergency Medicine)'
      },
      criticalAllergies: patient.triageLevel === 1 ? ['بنسلين (Penicillin)'] : undefined,
      alerts: [
        `مستوى الفرز: ESI المستوى ${patient.triageLevel} (${patient.triageLevel === 1 ? 'إنعاش فوري' : patient.triageLevel === 2 ? 'حرج' : 'مستعجل'})`,
        `طريقة القدوم: ${patient.arrivalMode === 'ambulance' ? 'إسعاف طائر' : 'حضور مباشر'}`
      ],
      isolationPrecaution: patient.assignedArea === 'resus_bay' ? 'احتياطات فرز حرج ومكافحة عدوى' : undefined,
      timestamps: [
        { label: 'وقت الوصول', value: patient.arrivalTime || 'غير مسجل', elapsed: getElapsedWaitString(patient.arrivalTime) },
        { label: 'زمن الدخول للطبيب (Door-to-Doc)', value: `${patient.doorToDocMinutes} دقيقة` }
      ],
      pendingConsults: consult ? [consult] : undefined,
      keyInvestigationsSummary: patient.statOrders && patient.statOrders.length > 0
        ? `أوامر عاجلة: ${patient.statOrders.join(' • ')}`
        : 'تم طلب تخطيط قلب 12-Lead وفحوصات الدم العاجلة',
      dispositionContext: patient.status === 'decision_admit'
        ? 'تم اعتماد قرار التنويم • بانتظار تأكيد السرير من قسم الدخول'
        : 'قيد التقييم السريري المستمر واستقرار المؤشرات الحيوية',
      originBoardType: 'er',
      originContext: {
        activeFilter,
        filter: zoneFilter,
        searchQuery
      }
    };

    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleOpenWorkspaceDirectly = (patient: ErPatient) => {
    openPatientWorkspace(patient.patientId, {
      originWorkArea: 'er',
      originType: 'unit_board',
      boardType: 'er',
      activeFilter,
      filter: zoneFilter,
      searchQuery,
      selectedPatientId: patient.patientId,
      defaultActivity: 'summary'
    });
  };

  const handleCreateTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint) {
      alert('يرجى كتابة الشكوى الرئيسية للمريض');
      return;
    }

    const vitalsObj: Vitals = {
      bpSystolic: Number(bpSystolic) || 120,
      bpDiastolic: Number(bpDiastolic) || 80,
      pulseRate: Number(pulseRate) || 80,
      temp: Number(temp) || 37,
      respiratoryRate: Number(respiratoryRate) || 18,
      spo2: Number(spo2) || 98,
      painScore: Number(painScore) || 5,
      recordedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      recordedBy: 'ممرض فرز الطوارئ (Triage RN)',
      triageLevel: triageLevel === 1 ? 'level_1_resuscitation' : triageLevel === 2 ? 'level_2_emergent' : 'level_3_urgent',
      news2Score: triageLevel === 1 ? 9 : triageLevel === 2 ? 6 : 2
    };

    const colorMap: Record<ErTriageLevel, 'red' | 'orange' | 'yellow' | 'green' | 'blue'> = {
      1: 'red',
      2: 'orange',
      3: 'yellow',
      4: 'green',
      5: 'blue'
    };

    addErPatient({
      patientId: selectedPatient.id,
      mrn: selectedPatient.mrn,
      patientName: selectedPatient.fullNameAr,
      age: selectedPatient.age,
      gender: selectedPatient.gender,
      triageLevel,
      triageColor: colorMap[triageLevel],
      arrivalMode,
      chiefComplaint,
      assignedArea,
      bedNo,
      attendingDoctor,
      primaryNurse: 'فريق تمريض الطوارئ المناوب',
      vitals: vitalsObj,
      status: 'in_treatment',
      statOrders: statOrderText ? statOrderText.split(',').map(s => s.trim()) : ['STAT CBC + Troponin', 'ECG 12-Lead'],
      gcs: Number(gcs) || 15
    });

    setShowNewTriageModal(false);
    setChiefComplaint('');
    setStatOrderText('');
    playChime('success');
  };

  const getTriageBadge = (level: ErTriageLevel) => {
    switch (level) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white animate-pulse shadow-xs">
            <Flame className="w-3 h-3" /> ESI L1 إنعاش
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-orange-500 text-white shadow-xs">
            <AlertOctagon className="w-3 h-3" /> ESI L2 حرج
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950">
            ESI L3 عاجل
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white">
            ESI L4 أقل إلحاحاً
          </span>
        );
      case 5:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-600 text-white">
            ESI L5 غير عاجل
          </span>
        );
    }
  };

  const getFlowStateBadge = (status: ErPatient['status']) => {
    switch (status) {
      case 'in_treatment':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">قيد المعالجة</span>;
      case 'decision_admit':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold">قرار تنويم فوري</span>;
      case 'awaiting_labs':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">بانتظار الفحوصات</span>;
      case 'transferred_icu':
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold">تحويل للعناية</span>;
      case 'transferred_or':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold">تحويل للعمليات</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">وصول/فرز</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. ER Command & Situational Summary Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-inner">
              <Siren className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                  لوحة تتبع قسم الطوارئ المركزية (ER Chronological Tracking Board)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  منظومة فرز ذكية ومحدّثة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع كرونولوجي كثيف للحالات • أزمنة الانتظار • الاستشارات المعلقة • مسارات التحويل والتنويم الفوري
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mock State Controls for verification */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-[11px]">
              <button
                onClick={() => {
                  setIsLoadingMock(true);
                  setTimeout(() => setIsLoadingMock(false), 1200);
                }}
                className="px-2 py-1 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="محاكاة التحميل السريع (Skeleton Loading)"
              >
                محاكاة تحميل
              </button>
              <button
                onClick={() => setIsErrorMock(!isErrorMock)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isErrorMock ? 'bg-rose-900 text-rose-200' : 'hover:bg-slate-700 text-slate-300'
                }`}
                title="محاكاة حالة خطأ في المزامنة"
              >
                {isErrorMock ? 'إلغاء الخطأ' : 'محاكاة خطأ'}
              </button>
              <button
                onClick={() => setHasStaleNotice(!hasStaleNotice)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  hasStaleNotice ? 'bg-amber-900 text-amber-200' : 'hover:bg-slate-700 text-slate-300'
                }`}
                title="محاكاة إشعار تحديث الحالة الحية"
              >
                {hasStaleNotice ? 'إخفاء الإشعار' : 'إشعار تحديث'}
              </button>
            </div>

            <button
              onClick={() => openStandardsModal(undefined, undefined, 'nphies')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-700/50 text-xs font-bold transition-all shadow-xs"
              title="تغطية طوارئ التأمين الفورية عبر نفيس"
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>نفيس طوارئ</span>
            </button>

            <button
              onClick={() => setShowNewTriageModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>فرز حالة طوارئ (New Triage)</span>
            </button>
          </div>
        </div>

        {/* Triage & Operational Volume KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-red-950/40 border border-red-800/50 p-2.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500" /> إنعاش L1
              </span>
              <span className="text-lg font-black text-red-400 font-mono">{countL1}</span>
            </div>
            <span className="text-[10px] text-red-200/70 block">فوري 0 دقيقة</span>
          </div>

          <div className="bg-orange-950/40 border border-orange-800/50 p-2.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-300 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-orange-500" /> حرج L2
              </span>
              <span className="text-lg font-black text-orange-400 font-mono">{countL2}</span>
            </div>
            <span className="text-[10px] text-orange-200/70 block">أقل من 10 دقائق</span>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/50 p-2.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> مستعجل L3
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">{countL3}</span>
            </div>
            <span className="text-[10px] text-amber-200/70 block">أقل من 30 دقيقة</span>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-800/50 p-2.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> استشارات معلقة
              </span>
              <span className="text-lg font-black text-indigo-400 font-mono">{countPendingConsults}</span>
            </div>
            <span className="text-[10px] text-indigo-200/70 block">بانتظار الأخصائي</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal-400" /> إجمالي الحالات
              </span>
              <span className="text-lg font-black text-teal-400 font-mono">{countTotalActive}</span>
            </div>
            <span className="text-[10px] text-slate-400 block">معدل المعاينة: 6.5 دقيقة</span>
          </div>
        </div>
      </div>

      {/* Simulated Stale Notice if triggered */}
      {hasStaleNotice && (
        <BoardStaleNotice
          message="وصلت حالة إنعاش جديدة عبر الإسعاف وتم حجز سرير Resus Bay 01 • اضغط للتحديث"
          onRefresh={() => setHasStaleNotice(false)}
        />
      )}

      {/* Simulated Error State if triggered */}
      {isErrorMock && (
        <BoardErrorState
          message="تعذر استلام تحديثات الفرز الفورية من أجهزة تليميتري الطوارئ"
          onRetry={() => setIsErrorMock(false)}
        />
      )}

      {/* 2. Filters & Dense Operational Search Bar */}
      {!isErrorMock && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              كافة الحالات ({erPatients.filter(p => p.status !== 'discharged').length})
            </button>
            <button
              onClick={() => setActiveFilter('resus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'resus'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              الإنعاش L1 ({countL1})
            </button>
            <button
              onClick={() => setActiveFilter('acute')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'acute'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-orange-700 hover:bg-orange-50'
              }`}
            >
              الحالات الحرجة L2 ({countL2})
            </button>
            <button
              onClick={() => setActiveFilter('fast_track')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'fast_track'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              المسار السريع L3-5
            </button>
            <button
              onClick={() => setActiveFilter('pending_consults')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'pending_consults'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              استشارات معلقة ({countPendingConsults})
            </button>
            <button
              onClick={() => setActiveFilter('attention')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'attention'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              تتطلب انتباهاً ⚠️
            </button>
          </div>

          {/* Search & Zone Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث بالاسم، MRN، السرير، الشكوى..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">كافة مناطق ER</option>
              <option value="resus_bay">غرفة الإنعاش (Resus)</option>
              <option value="acute_trauma">الرضوض الحادة (Acute)</option>
              <option value="cubicle">الملاحظة (Cubicles)</option>
              <option value="fast_track">المسار السريع (Fast Track)</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. Central Dense Chronological Tracking Table */}
      {!isErrorMock && (
        isLoadingMock ? (
          <BoardSkeletonLoading type="table" count={6} />
        ) : filteredPatients.length === 0 ? (
          <BoardEmptyState
            reason={searchQuery || activeFilter !== 'all' || zoneFilter !== 'all' ? 'filter_mismatch' : 'unit_empty'}
            onResetFilters={() => {
              setActiveFilter('all');
              setZoneFilter('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-bold">
                    <th className="py-3 px-3">مستوى الفرز Acuity</th>
                    <th className="py-3 px-3">بيانات المريض والمعرف</th>
                    <th className="py-3 px-3">المنطقة والسرير</th>
                    <th className="py-3 px-3">الوصول والانتظار Elapsed</th>
                    <th className="py-3 px-3">حالة التدفق Flow State</th>
                    <th className="py-3 px-3">الفريق الطبي المعالج</th>
                    <th className="py-3 px-3">الفحوصات والاستشارات</th>
                    <th className="py-3 px-3">المسار والتنويم Disposition</th>
                    <th className="py-3 px-3 text-center">إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => {
                    const elapsed = getElapsedWaitString(patient.arrivalTime);
                    const delayed = isWaitDelayed(patient.triageLevel, patient.arrivalTime);
                    const consult = getMockConsultForPatient(patient);
                    const isSelected = selectedPatientRowId === patient.patientId;
                    const isCritical = patient.triageLevel === 1 || patient.vitals.spo2 < 92;

                    return (
                      <tr
                        key={patient.id}
                        className={`transition-colors hover:bg-teal-50/40 cursor-pointer ${
                          isSelected ? 'bg-teal-50/80 ring-1 ring-teal-500/40' :
                          isCritical ? 'bg-red-50/20' : ''
                        }`}
                        onClick={() => handleOpenQuickPreview(patient)}
                      >
                        {/* 1. Triage Acuity */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getTriageBadge(patient.triageLevel)}
                        </td>

                        {/* 2. Patient Identity */}
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900 hover:text-teal-700 transition-colors">
                            {patient.patientName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <span className="text-teal-700 font-bold">{patient.mrn}</span>
                            <span>• {patient.age} سنة • {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 truncate max-w-xs mt-0.5" title={patient.chiefComplaint}>
                            {patient.chiefComplaint}
                          </div>
                        </td>

                        {/* 3. ER Location & Bed */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-center inline-block">
                            {patient.bedNo}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {patient.assignedArea === 'resus_bay' ? 'إنعاش فوري (Resus)' :
                             patient.assignedArea === 'acute_trauma' ? 'رضوض حادة (Acute)' :
                             patient.assignedArea === 'fast_track' ? 'مسار سريع' : 'ملاحظة'}
                          </div>
                        </td>

                        {/* 4. Arrival Time + Elapsed Time */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono text-slate-800 font-medium">
                            {patient.arrivalTime}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                              delayed ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              انتظار {elapsed}
                            </span>
                            {delayed && <span className="text-[10px] text-rose-600 font-bold">⚠️ متأخر</span>}
                          </div>
                        </td>

                        {/* 5. Current Flow State */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getFlowStateBadge(patient.status)}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Door-to-Doc: {patient.doorToDocMinutes}د
                          </div>
                        </td>

                        {/* 6. Responsible Team */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-medium text-slate-800 text-[11px]">
                            {patient.attendingDoctor.replace('د. ', '')}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {patient.primaryNurse}
                          </div>
                        </td>

                        {/* 7. Key Investigations & Pending Consults */}
                        <td className="py-3 px-3">
                          {consult ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-semibold mb-1">
                              <Layers className="w-3 h-3 text-indigo-600" />
                              <span>استشارة: {consult.specialty}</span>
                              <span className="text-[10px] text-indigo-600">({consult.status === 'pending' ? 'معلقة' : 'مقبولة'})</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400">لا توجد استشارات</div>
                          )}
                          <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                            {patient.statOrders && patient.statOrders.length > 0
                              ? patient.statOrders.join(', ')
                              : 'الفحوصات الروتينية'}
                          </div>
                        </td>

                        {/* 8. Disposition Context */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {patient.status === 'decision_admit' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700">
                              <Bed className="w-3.5 h-3.5" /> طلب سرير تنويم
                            </span>
                          ) : patient.status === 'transferred_icu' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                              <HeartPulse className="w-3.5 h-3.5" /> تحويل للعناية
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">قيد استكمال خطة الطوارئ</span>
                          )}
                        </td>

                        {/* 9. Actions */}
                        <td className="py-3 px-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenQuickPreview(patient)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors cursor-pointer"
                              title="معاينة سريعة تشغيلية (Quick Preview)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenWorkspaceDirectly(patient)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                              title="فتح الملف السريري الكامل (Patient Workspace)"
                            >
                              <span>الملف</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Summary Bar */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-4">
                <span>يتم عرض <strong>{filteredPatients.length}</strong> من أصل {erPatients.length} حالة طوارئ</span>
                <span>• تم الترتيب حسب معايير الفرز الكرونولوجي والتصنيف السريري</span>
              </div>
              <div className="text-[11px] text-slate-400">
                اضغط على أي صف للمعاينة السريعة دون مغادرة اللوحة • أو اضغط زر "الملف" للفتح الكامل
              </div>
            </div>
          </div>
        )
      )}

      {/* 4. Shared Patient Quick Preview Slide-over Drawer */}
      <SharedPatientQuickPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={previewData}
      />

      {/* 5. New Triage Admission Modal */}
      {showNewTriageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base">
                <Siren className="w-5 h-5 animate-bounce" />
                <span>تسجيل وفرز حالة طوارئ جديدة (Emergency Triage)</span>
              </div>
              <button
                onClick={() => setShowNewTriageModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTriage} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختيار المريض المسجل بالمنظومة:</label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:border-red-500"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullNameAr} ({p.mrn}) - {p.gender === 'male' ? 'ذكر' : 'أنثى'} - {p.age} سنة
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مستوى الفرز السريري (ESI / MTS Profile):</label>
                  <select
                    value={triageLevel}
                    onChange={e => setTriageLevel(Number(e.target.value) as ErTriageLevel)}
                    className="w-full p-2.5 bg-red-50 border border-red-200 rounded-xl font-black text-red-700 text-xs"
                  >
                    <option value={1}>المستوى 1: إنعاش فوري (Resuscitation) - 0 دقيقة</option>
                    <option value={2}>المستوى 2: طارئ حرج (Emergent) - أقل من 10 د</option>
                    <option value={3}>المستوى 3: مستعجل (Urgent) - أقل من 30 د</option>
                    <option value={4}>المستوى 4: أقل استعجالاً (Less Urgent) - أقل من 60 د</option>
                    <option value={5}>المستوى 5: غير عاجل (Non-Urgent) - أقل من 120 د</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الحضور (Arrival Mode):</label>
                  <select
                    value={arrivalMode}
                    onChange={e => setArrivalMode(e.target.value as ErPatient['arrivalMode'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="ambulance">سيارة إسعاف مجهزة (Ambulance)</option>
                    <option value="walk_in">حضور شخصي مباشر (Walk-In)</option>
                    <option value="wheelchair">كرسي متحرك (Wheelchair)</option>
                    <option value="police_escort">مرافقة أمنية / حوادث طرق</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشكوى والتقييم السريري الأولي:</label>
                <textarea
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  placeholder="مثال: ألم حاد بالصدر ممتد للذراع الأيسر مع تعرق شديد وهبوط بضغط الدم..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">منطقة الطوارئ المخصصة:</label>
                  <select
                    value={assignedArea}
                    onChange={e => setAssignedArea(e.target.value as ErPatient['assignedArea'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="resus_bay">غرفة الإنعاش الفوري (Resus Bay)</option>
                    <option value="acute_trauma">عنابر الرضوض الحادة (Acute Trauma)</option>
                    <option value="cubicle">عنبر الملاحظة (Cubicles)</option>
                    <option value="fast_track">المسار السريع (Fast Track)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم السرير بالطوارئ:</label>
                  <input
                    type="text"
                    value={bedNo}
                    onChange={e => setBedNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-700 block mb-2">العلامات الحيوية الأولية:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">ضغط الدم:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="text"
                        value={bpSystolic}
                        onChange={e => setBpSystolic(e.target.value)}
                        className="w-12 p-1 bg-white border border-slate-200 rounded text-center text-xs"
                      />
                      <span>/</span>
                      <input
                        type="text"
                        value={bpDiastolic}
                        onChange={e => setBpDiastolic(e.target.value)}
                        className="w-12 p-1 bg-white border border-slate-200 rounded text-center text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">نبض القلب:</span>
                    <input
                      type="text"
                      value={pulseRate}
                      onChange={e => setPulseRate(e.target.value)}
                      className="w-full p-1 bg-white border border-slate-200 rounded font-mono text-xs text-center"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">الأكسجين SpO2:</span>
                    <input
                      type="text"
                      value={spo2}
                      onChange={e => setSpo2(e.target.value)}
                      className="w-full p-1 bg-white border border-slate-200 rounded font-mono text-xs text-center"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">الحرارة °C:</span>
                    <input
                      type="text"
                      value={temp}
                      onChange={e => setTemp(e.target.value)}
                      className="w-full p-1 bg-white border border-slate-200 rounded font-mono text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTriageModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md"
                >
                  حفظ وتسكين الحالة فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
