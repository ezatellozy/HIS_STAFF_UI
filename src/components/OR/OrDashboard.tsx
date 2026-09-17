import React, { useState, useMemo } from 'react';
import {
  Scissors,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Heart,
  Stethoscope,
  Activity,
  ArrowRightLeft,
  Plus,
  Play,
  Square,
  Sparkles,
  GitFork,
  HeartPulse,
  Eye,
  ExternalLink,
  Layers,
  Sparkle,
  Calendar,
  Filter,
  CheckCircle
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { SurgeryCase } from '../../types/his';
import { SharedPatientQuickPreview, QuickPreviewPatientData } from '../Shared/SharedPatientQuickPreview';
import {
  BoardSkeletonLoading,
  BoardEmptyState,
  BoardErrorState,
  BoardStaleNotice
} from '../Shared/SharedBoardStateFeedback';

export const OrDashboard: React.FC = () => {
  const {
    surgeryCases,
    updateSurgeryStatus,
    toggleWhoChecklist,
    updateAldreteScore,
    openStandardsModal,
    openLifecycleModal,
    transferFromOr,
    admitToIcu,
    playChime,
    openPatientWorkspace,
    workspaceOrigin
  } = useHis();

  // Origin restoration
  const defaultTheatre = (workspaceOrigin?.boardType === 'or' && (workspaceOrigin.selectedTheatre as any)) || 'all';
  const defaultView = (workspaceOrigin?.boardType === 'or' && (workspaceOrigin.activeView as any)) || 'timeline';
  const defaultSearch = (workspaceOrigin?.boardType === 'or' && workspaceOrigin.searchQuery) || '';

  const [activeTheatreFilter, setActiveTheatreFilter] = useState<'all' | 'OR-1' | 'OR-2' | 'OR-3' | 'OR-4'>(defaultTheatre);
  const [activeOrView, setActiveOrView] = useState<'timeline' | 'phases' | 'turnover'>(defaultView);
  const [searchQuery, setSearchQuery] = useState(defaultSearch);

  // Quick Preview state
  const [previewData, setPreviewData] = useState<QuickPreviewPatientData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Mock Feedback States
  const [isLoadingMock, setIsLoadingMock] = useState<boolean>(false);
  const [isErrorMock, setIsErrorMock] = useState<boolean>(false);
  const [hasStaleNotice, setHasStaleNotice] = useState<boolean>(false);

  // WHO Checklist Modal
  const [checklistModalCase, setChecklistModalCase] = useState<SurgeryCase | null>(null);

  // Room Turnover Data
  const theatreTurnoverStatus = useMemo(() => [
    {
      theatreCode: 'OR-1',
      theatreName: 'OR-1 جراحة القلب والصدر وزراعة الأوعية',
      state: 'in_surgery',
      label: 'جراحة جارية الآن',
      currentCase: 'سليمان خالد العتيبي',
      leadSurgeon: 'د. طارق المنشاوي',
      elapsed: 'ساعتان و15 دقيقة',
      remaining: 'ساعة و15 دقيقة',
      turnoverEta: 'غير متاح'
    },
    {
      theatreCode: 'OR-2',
      theatreName: 'OR-2 جراحة العظام والعمود الفقري والمفاصل',
      state: 'turnover',
      label: 'تطهير وتعقيم الغرفة (Turnover)',
      currentCase: 'انتهاء حالة كسر الفخذ',
      leadSurgeon: 'فريق مكافحة العدوى والتعقيم',
      elapsed: '10 دقائق',
      remaining: '15 دقيقة',
      turnoverEta: '14:00 (جاهزة للحالة التالية)'
    },
    {
      theatreCode: 'OR-3',
      theatreName: 'OR-3 جراحة المناظير العامة والمسالك',
      state: 'ready',
      label: 'معقمة وجاهزة للاستقبال (Ready)',
      currentCase: 'بانتظار وصول الحالة من Holding',
      leadSurgeon: 'طاقم التمريض الجراحي متواجد',
      elapsed: '-',
      remaining: '-',
      turnoverEta: 'جاهزة فوراً'
    },
    {
      theatreCode: 'OR-4',
      theatreName: 'OR-4 جراحة المخ والأعصاب والعيون',
      state: 'scheduled',
      label: 'حالة مجدولة قيد التحضير',
      currentCase: 'زياد محمود الخولي',
      leadSurgeon: 'د. عاصم فودة',
      elapsed: '-',
      remaining: 'تبدأ 15:00',
      turnoverEta: 'جاهزة للاستلام'
    }
  ], []);

  // Counts
  const inTheatreCount = surgeryCases.filter(c => c.status === 'in_theatre').length;
  const preOpCount = surgeryCases.filter(c => c.status === 'holding_preop').length;
  const pacuCount = surgeryCases.filter(c => c.status === 'pacu_recovery').length;
  const completedCount = surgeryCases.filter(c => c.status === 'completed').length;

  const filteredCases = useMemo(() => {
    return surgeryCases.filter(c => {
      if (activeTheatreFilter !== 'all' && c.theatreCode !== activeTheatreFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.patientName.toLowerCase().includes(q);
        const matchMrn = c.mrn.toLowerCase().includes(q);
        const matchProc = c.procedureNameAr.toLowerCase().includes(q);
        const matchSurgeon = c.leadSurgeon.toLowerCase().includes(q);
        if (!matchName && !matchMrn && !matchProc && !matchSurgeon) return false;
      }
      return true;
    });
  }, [surgeryCases, activeTheatreFilter, searchQuery]);

  const handleOpenQuickPreview = (c: SurgeryCase) => {
    const data: QuickPreviewPatientData = {
      patientId: c.patientId,
      patientName: c.patientName,
      mrn: c.mrn,
      age: c.age,
      encounterId: `OR-ENC-${c.mrn.replace('MRN-', '')}`,
      encounterType: `عملية جراحية (${c.theatreCode})`,
      currentLocation: `${c.theatreNo} • مرحلة ${
        c.status === 'in_theatre' ? 'داخل المسرح' :
        c.status === 'holding_preop' ? 'تحضير قبل الجراحة' :
        c.status === 'pacu_recovery' ? 'إفاقة PACU' : 'منتهية'
      }`,
      boardState: {
        label: c.status === 'in_theatre' ? 'جراحة جارية' : c.status === 'pacu_recovery' ? 'إفاقة PACU' : 'مجدولة',
        variant: c.status === 'in_theatre' ? 'urgent' : c.status === 'pacu_recovery' ? 'warning' : 'neutral'
      },
      responsibleTeam: {
        primaryDoctor: c.leadSurgeon,
        secondaryDoctor: c.anesthesiologist,
        primaryNurse: c.scrubNurse,
        specialty: 'جراحة عامة ومتخصصة'
      },
      timestamps: [
        { label: 'الوقت المجدول', value: c.scheduledTime }
      ],
      keyInvestigationsSummary: `نوع التخدير: ${c.anesthesiaType} • تصنيف المخاطر: ${c.asaClassification}`,
      respiratoryOrDeviceSummary: c.aldreteScore !== undefined ? `مؤشر إفاقة ألدرتي (Aldrete Score): ${c.aldreteScore}/10` : undefined,
      dispositionContext: `الوجهة المقررة بعد الجراحة: ${c.dispositionTarget || 'جناح الجراحة 3B'}`,
      alerts: !c.whoChecklist.timeOut && c.status === 'in_theatre' ? ['⚠️ لم يتم توثيق التوقف المؤقت Time-Out!'] : [],
      originBoardType: 'or',
      originContext: {
        activeView: activeOrView,
        selectedTheatre: activeTheatreFilter,
        searchQuery
      }
    };

    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleOpenWorkspaceDirectly = (c: SurgeryCase) => {
    openPatientWorkspace(c.patientId, {
      originWorkArea: 'or',
      originType: 'unit_board',
      boardType: 'or',
      activeView: activeOrView,
      selectedTheatre: activeTheatreFilter,
      searchQuery,
      selectedPatientId: c.patientId,
      defaultActivity: 'summary'
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Situational Perioperative Strip */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
              <Scissors className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                  لوحة غرف العمليات والمسار الجراحي (OR & Perioperative Board)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  قائمة WHO للأمان الجراحي • تعقيم وتدوير الغرف
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                الجدول الزمني للعمليات • مسار التحضير والإفاقة PACU • جاهزية الغرف وتطهيرها • معايير CBAHI/JCI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mock Control Buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-[11px]">
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
                title="محاكاة خطأ المزامنة"
              >
                {isErrorMock ? 'إلغاء الخطأ' : 'محاكاة خطأ'}
              </button>
              <button
                onClick={() => setHasStaleNotice(!hasStaleNotice)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  hasStaleNotice ? 'bg-amber-900 text-amber-200' : 'hover:bg-slate-700 text-slate-300'
                }`}
                title="محاكاة إشعار نقل وتحديث سرير"
              >
                {hasStaleNotice ? 'إخفاء الإشعار' : 'إشعار تحديث'}
              </button>
            </div>

            <button
              onClick={() => openStandardsModal(undefined, undefined, 'cbahi')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-700/50 text-xs font-bold transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>معايير أمان الجراحة WHO</span>
            </button>
          </div>
        </div>

        {/* Operating Suite KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">التحضير قبل الجراحة Holding</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-amber-400 font-mono">{preOpCount}</span>
              <span className="text-[10px] text-amber-300/80 font-bold">جاهزية التخدير</span>
            </div>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
            <span className="text-rose-300 block text-[10px]">جراحة جارية داخل المسارح</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-rose-400 font-mono">{inTheatreCount}</span>
              <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-800/60 p-2.5 rounded-xl">
            <span className="text-indigo-300 block text-[10px]">إفاقة ما بعد التخدير PACU</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-indigo-400 font-mono">{pacuCount}</span>
              <span className="text-[10px] text-indigo-300/80 font-bold">مؤشر ألدرتي</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
            <span className="text-emerald-300 block text-[10px]">عمليات مكتملة اليوم</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-emerald-400 font-mono">{completedCount}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Stale Notice */}
      {hasStaleNotice && (
        <BoardStaleNotice
          message="تم اكتمال تعقيم وتجهيز الغرفة OR-2 بنجاح • جاهزة لاستقبال الحالة التالية"
          onRefresh={() => setHasStaleNotice(false)}
        />
      )}

      {/* Simulated Error State */}
      {isErrorMock && (
        <BoardErrorState
          message="تعذر تحميل أحدث جدول لغرف العمليات من نظام إدارة المسارح الجراحية"
          onRetry={() => setIsErrorMock(false)}
        />
      )}

      {/* 2. View Switcher & Filter Controls */}
      {!isErrorMock && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* View switcher tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveOrView('timeline')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeOrView === 'timeline'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>1. الجدول الزمني لغرف العمليات (Timeline)</span>
              </button>
              <button
                onClick={() => setActiveOrView('phases')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeOrView === 'phases'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. مسار المراحل الجراحية (Holding → Theatre → PACU)</span>
              </button>
              <button
                onClick={() => setActiveOrView('turnover')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeOrView === 'turnover'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                <Sparkle className="w-3.5 h-3.5" />
                <span>3. حالة الغرف والتعقيم (Turnover & Cleaning)</span>
              </button>
            </div>

            {/* Theatre filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium shrink-0">الغرفة:</span>
              <select
                value={activeTheatreFilter}
                onChange={e => setActiveTheatreFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">كافة غرف العمليات (OR-1 إلى OR-4)</option>
                <option value="OR-1">OR-1 جراحة القلب والصدر</option>
                <option value="OR-2">OR-2 جراحة العظام والمفاصل</option>
                <option value="OR-3">OR-3 جراحة المناظير والمسالك</option>
                <option value="OR-4">OR-4 جراحة المخ والأعصاب</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="بحث باسم المريض، الرقم الطبي MRN، اسم الجراحة، أو الجراح الرئيسي..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
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
        </div>
      )}

      {/* 3. Main Views Content */}
      {!isErrorMock && (
        isLoadingMock ? (
          <BoardSkeletonLoading type="timeline" count={4} />
        ) : activeOrView === 'turnover' ? (
          // ================= TURNOVER & CLEANING VIEW =================
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theatreTurnoverStatus.map(room => (
              <div
                key={room.theatreCode}
                className={`p-4 rounded-2xl border transition-all ${
                  room.state === 'in_surgery' ? 'bg-rose-50/40 border-rose-200' :
                  room.state === 'turnover' ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200' :
                  room.state === 'ready' ? 'bg-emerald-50/40 border-emerald-300' :
                  'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-1 bg-slate-900 text-white rounded-lg">
                      {room.theatreCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      room.state === 'in_surgery' ? 'bg-rose-100 text-rose-800' :
                      room.state === 'turnover' ? 'bg-sky-100 text-sky-800' :
                      room.state === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {room.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-semibold">
                    {room.turnoverEta}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="font-extrabold text-slate-900">{room.theatreName}</div>
                  <div className="text-slate-600">
                    الحالة الحالية: <strong className="text-slate-800">{room.currentCase}</strong>
                  </div>
                  <div className="text-slate-500 flex items-center justify-between text-[11px] pt-1">
                    <span>المسؤول: {room.leadSurgeon}</span>
                    <span>الوقت المستغرق: {room.elapsed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeOrView === 'phases' ? (
          // ================= 4-PHASE PERIOPERATIVE VIEW =================
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Phase 1: Pre-Op Holding */}
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-300/50 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  1. التحضير Pre-Op
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono text-[10px] font-bold">
                  {preOpCount}
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredCases.filter(c => c.status === 'holding_preop').map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenQuickPreview(c)}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.theatreCode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{c.scheduledTime}</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">{c.patientName}</div>
                    <div className="text-[11px] text-slate-500 truncate" title={c.procedureNameAr}>
                      {c.procedureNameAr}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{c.leadSurgeon.split(' ')[1]}</span>
                      <span className="text-amber-700 font-bold">{c.asaClassification}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 2: In Theatre */}
            <div className="space-y-3">
              <div className="bg-rose-500/10 border border-rose-300/50 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                  2. داخل العمليات In Theatre
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-mono text-[10px] font-bold">
                  {inTheatreCount}
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredCases.filter(c => c.status === 'in_theatre').map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenQuickPreview(c)}
                    className="bg-white p-3 rounded-xl border-2 border-rose-300 shadow-2xs hover:border-rose-400 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded">
                        {c.theatreCode}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-rose-700 animate-pulse">جراحة جارية</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">{c.patientName}</div>
                    <div className="text-[11px] text-slate-600 leading-tight">
                      {c.procedureNameAr}
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg text-[10px] flex items-center justify-between">
                      <span>Time-Out: {c.whoChecklist.timeOut ? 'مُنجز ✓' : 'معلق ⚠️'}</span>
                      <span className="text-rose-700 font-bold">{c.dispositionTarget}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 3: PACU Recovery */}
            <div className="space-y-3">
              <div className="bg-indigo-500/10 border border-indigo-300/50 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-indigo-600" />
                  3. إفاقة PACU
                </span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-mono text-[10px] font-bold">
                  {pacuCount}
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredCases.filter(c => c.status === 'pacu_recovery').map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenQuickPreview(c)}
                    className="bg-white p-3 rounded-xl border border-indigo-200 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {c.theatreCode}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 font-mono">
                        ألدرتي: {c.aldreteScore || 9}/10
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">{c.patientName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{c.procedureNameAr}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      جاهز للانتقال إلى: {c.dispositionTarget}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 4: Post-Op Disposition */}
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-300/50 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  4. النقل والمغادرة
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold">
                  {completedCount}
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredCases.filter(c => c.status === 'completed').map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenQuickPreview(c)}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.theatreCode}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 font-mono">اكتمل النقل</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900">{c.patientName}</div>
                    <div className="text-[10px] text-slate-500">تم الاستلام في {c.dispositionTarget}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // ================= TIMELINE / SCHEDULE VIEW =================
          <div className="space-y-4">
            {/* Visual Theatre Timeline Rows */}
            {['OR-1', 'OR-2', 'OR-3', 'OR-4'].map(theatreCode => {
              if (activeTheatreFilter !== 'all' && activeTheatreFilter !== theatreCode) return null;
              const cases = filteredCases.filter(c => c.theatreCode === theatreCode);

              return (
                <div key={theatreCode} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {/* Theatre Header */}
                  <div className="bg-slate-50 p-3 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-white bg-slate-900 px-2 py-0.5 rounded-md">
                        {theatreCode}
                      </span>
                      <span className="font-bold text-xs text-slate-800">
                        {theatreCode === 'OR-1' ? 'جراحة القلب والصدر وزراعة الأوعية' :
                         theatreCode === 'OR-2' ? 'جراحة العظام والمفاصل والعمود الفقري' :
                         theatreCode === 'OR-3' ? 'جراحة المناظير العامة والمسالك' : 'جراحة المخ والأعصاب والعيون'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {cases.length} حالات مجدولة
                    </span>
                  </div>

                  {/* Case Cards inside this Theatre */}
                  <div className="divide-y divide-slate-100">
                    {cases.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        لا توجد عمليات مسجلة في هذا المسرح
                      </div>
                    ) : (
                      cases.map(c => {
                        const isInTheatre = c.status === 'in_theatre';
                        const isPacu = c.status === 'pacu_recovery';
                        const isPreop = c.status === 'holding_preop';

                        return (
                          <div
                            key={c.id}
                            className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/70 cursor-pointer ${
                              isInTheatre ? 'bg-rose-50/30' : isPacu ? 'bg-indigo-50/20' : ''
                            }`}
                            onClick={() => handleOpenQuickPreview(c)}
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                                  {c.scheduledTime}
                                </span>
                                <span className="font-extrabold text-slate-900 text-sm">{c.patientName}</span>
                                <span className="text-teal-700 font-mono font-bold text-xs">({c.mrn})</span>
                                <span className="text-slate-400 text-xs">• {c.age} سنة</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isInTheatre ? 'bg-rose-100 text-rose-800 animate-pulse' :
                                  isPacu ? 'bg-indigo-100 text-indigo-800' :
                                  isPreop ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {isInTheatre ? 'جراحة جارية داخل المسرح' :
                                   isPacu ? 'إفاقة PACU' :
                                   isPreop ? 'تحضير Pre-Op' : 'مكتملة'}
                                </span>
                              </div>

                              <div className="text-xs text-slate-700 font-medium">
                                <strong>الإجراء:</strong> {c.procedureNameAr} ({c.procedureNameEn})
                              </div>

                              <div className="text-[11px] text-slate-500 flex items-center gap-4 flex-wrap">
                                <span>الجراح: <strong className="text-slate-700">{c.leadSurgeon}</strong></span>
                                <span>استشاري التخدير: <strong className="text-slate-700">{c.anesthesiologist}</strong></span>
                                <span>تصنيف التخدير: <strong className="text-amber-800 font-mono">{c.asaClassification}</strong></span>
                                <span>الوجهة: <strong className="text-teal-700">{c.dispositionTarget}</strong></span>
                              </div>
                            </div>

                            {/* Actions & WHO status */}
                            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 pl-2">
                                <span className={c.whoChecklist.signIn ? 'text-emerald-700' : 'text-slate-400'}>Sign-In</span> •
                                <span className={c.whoChecklist.timeOut ? 'text-emerald-700' : 'text-rose-600 font-black'}>Time-Out</span> •
                                <span className={c.whoChecklist.signOut ? 'text-emerald-700' : 'text-slate-400'}>Sign-Out</span>
                              </div>

                              <button
                                onClick={() => handleOpenQuickPreview(c)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 transition-colors cursor-pointer"
                                title="معاينة سريعة تشغيلية"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenWorkspaceDirectly(c)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                                title="فتح الملف السريري الكامل"
                              >
                                <span>الملف</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* 4. Shared Patient Quick Preview Slide-over Drawer */}
      <SharedPatientQuickPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={previewData}
      />
    </div>
  );
};
