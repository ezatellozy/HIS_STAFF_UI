import React, { useState, useMemo } from 'react';
import {
  Activity,
  HeartPulse,
  Wind,
  Droplets,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Gauge,
  Sliders,
  CheckCircle2,
  FileCode,
  ArrowRightLeft,
  Plus,
  RefreshCw,
  Search,
  Bed,
  Eye,
  ExternalLink,
  Sparkles,
  ClockAlert,
  Layers,
  Wrench,
  Ban,
  Sparkle
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { IcuBed, IcuBedOperationalState } from '../../types/his';
import { SharedPatientQuickPreview, QuickPreviewPatientData } from '../Shared/SharedPatientQuickPreview';
import {
  BoardSkeletonLoading,
  BoardEmptyState,
  BoardErrorState,
  BoardStaleNotice
} from '../Shared/SharedBoardStateFeedback';

export const IcuDashboard: React.FC = () => {
  const {
    icuBeds,
    updateIcuVentilator,
    updateIcuInfusion,
    openStandardsModal,
    openLifecycleModal,
    stepDownFromIcu,
    playChime,
    openPatientWorkspace,
    workspaceOrigin
  } = useHis();

  // Origin restoration
  const defaultFilter = (workspaceOrigin?.boardType === 'icu' && workspaceOrigin.activeFilter) || 'all';
  const defaultSearch = (workspaceOrigin?.boardType === 'icu' && workspaceOrigin.searchQuery) || '';

  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter);
  const [searchQuery, setSearchQuery] = useState<string>(defaultSearch);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(
    (workspaceOrigin?.boardType === 'icu' && workspaceOrigin.selectedPatientId) || null
  );

  // Quick Preview state
  const [previewData, setPreviewData] = useState<QuickPreviewPatientData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Simulated Mock States
  const [isLoadingMock, setIsLoadingMock] = useState<boolean>(false);
  const [isErrorMock, setIsErrorMock] = useState<boolean>(false);
  const [hasStaleNotice, setHasStaleNotice] = useState<boolean>(false);

  // Titration & Vent Modals
  const [selectedBedForVent, setSelectedBedForVent] = useState<IcuBed | null>(null);
  const [ventMode, setVentMode] = useState<any>('PRVC');
  const [fio2, setFio2] = useState<number>(60);
  const [peep, setPeep] = useState<number>(10);
  const [tv, setTv] = useState<number>(450);

  const [titrationModal, setTitrationModal] = useState<{
    isOpen: boolean;
    bed: IcuBed | null;
    drugIndex: number;
    currentRate: string;
    drugName: string;
  }>({
    isOpen: false,
    bed: null,
    drugIndex: 0,
    currentRate: '',
    drugName: ''
  });
  const [newTitrationRate, setNewTitrationRate] = useState('');

  // Counters
  const totalBeds = icuBeds.length;
  const occupiedCount = icuBeds.filter(b => (b.bedStatus || (b.patientId ? 'occupied' : 'available')) === 'occupied').length;
  const availableCount = icuBeds.filter(b => (b.bedStatus || (b.patientId ? 'occupied' : 'available')) === 'available').length;
  const reservedCount = icuBeds.filter(b => b.bedStatus === 'reserved').length;
  const cleaningCount = icuBeds.filter(b => b.bedStatus === 'cleaning').length;
  const ventilatedCount = icuBeds.filter(b => b.ventilator.isVentilated).length;
  const isolationCount = icuBeds.filter(b => b.isolationPrecaution && b.isolationPrecaution !== 'none').length;

  const handleSaveVentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedForVent) return;
    updateIcuVentilator(selectedBedForVent.id, {
      isVentilated: true,
      mode: ventMode,
      fio2: Number(fio2),
      peep: Number(peep),
      tidalVolume: Number(tv)
    });
    setSelectedBedForVent(null);
    playChime('success');
  };

  const handleSaveTitration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titrationModal.bed || !newTitrationRate) return;
    updateIcuInfusion(titrationModal.bed.id, titrationModal.drugIndex, newTitrationRate);
    setTitrationModal({ isOpen: false, bed: null, drugIndex: 0, currentRate: '', drugName: '' });
    playChime('call');
  };

  // Filtered beds
  const filteredBeds = useMemo(() => {
    return icuBeds.filter(b => {
      const status = b.bedStatus || (b.patientId ? 'occupied' : 'available');

      if (activeFilter === 'occupied' && status !== 'occupied') return false;
      if (activeFilter === 'available' && status !== 'available') return false;
      if (activeFilter === 'reserved' && status !== 'reserved') return false;
      if (activeFilter === 'cleaning' && status !== 'cleaning') return false;
      if (activeFilter === 'isolation' && (!b.isolationPrecaution || b.isolationPrecaution === 'none')) return false;
      if (activeFilter === 'ventilated' && !b.ventilator.isVentilated) return false;
      if (activeFilter === 'attention') {
        const needsAttn = (b.hemodynamics.map > 0 && b.hemodynamics.map < 65) || (b.sofaScore >= 10) || (b.alerts && b.alerts.length > 0);
        if (!needsAttn) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBed = b.bedNo.toLowerCase().includes(q);
        const matchName = b.patientName.toLowerCase().includes(q);
        const matchMrn = b.mrn.toLowerCase().includes(q);
        const matchDiag = b.diagnosis.toLowerCase().includes(q);
        if (!matchBed && !matchName && !matchMrn && !matchDiag) return false;
      }

      return true;
    });
  }, [icuBeds, activeFilter, searchQuery]);

  const handleOpenQuickPreview = (bed: IcuBed) => {
    if (!bed.patientId) return;
    setSelectedBedId(bed.id);

    const data: QuickPreviewPatientData = {
      patientId: bed.patientId,
      patientName: bed.patientName,
      mrn: bed.mrn,
      age: bed.age,
      gender: bed.gender,
      encounterId: `ICU-ENC-${bed.mrn.replace('MRN-', '')}`,
      encounterType: 'عناية مركزة ورعاية حثيثة (ICU Encounter)',
      currentLocation: `${bed.bedNo}`,
      boardState: {
        label: bed.sofaScore >= 10 ? 'حالة حرجة غير مستقرة' : 'حالة حرجة مستقرة',
        variant: bed.sofaScore >= 10 ? 'urgent' : 'warning'
      },
      responsibleTeam: {
        primaryDoctor: bed.attendingIntensivist,
        primaryNurse: bed.primaryNurse,
        specialty: 'طب الحالات الحرجة والعناية المركزة'
      },
      isolationPrecaution: bed.isolationPrecaution ? (
        bed.isolationPrecaution === 'airborne' ? 'عزل هوائي عالي الخطورة (Airborne Isolation)' :
        bed.isolationPrecaution === 'contact' ? 'عزل تلامسي (Contact Precautions)' : 'عزل رذاذي'
      ) : undefined,
      alerts: bed.alerts || [],
      timestamps: [
        { label: 'أيام التنويم بالعناية', value: `${bed.admitDays} أيام`, elapsed: `${bed.admitDays * 24} ساعة` }
      ],
      respiratoryOrDeviceSummary: bed.ventilator.isVentilated
        ? `تنفس صناعي نمط ${bed.ventilator.mode} • FiO2: ${bed.ventilator.fio2}% • PEEP: ${bed.ventilator.peep} • TV: ${bed.ventilator.tidalVolume}ml`
        : 'تنفس تلقائي بدون جهاز',
      infusionSummary: bed.infusions.length > 0
        ? bed.infusions.map(i => `${i.drug}: ${i.rate}`).join(' • ')
        : 'لا توجد محاليل مقوية لعضلة القلب حالياً',
      linesDrainsSummary: bed.linesAndDrains && bed.linesAndDrains.length > 0
        ? bed.linesAndDrains.join(' | ')
        : 'شريان راجع وخط وريدي مركزي',
      dispositionContext: bed.expectedTransition || 'استمرار الرعاية الحثيثة بالعناية المركزة',
      originBoardType: 'icu',
      originContext: {
        activeFilter,
        searchQuery
      }
    };

    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleOpenWorkspaceDirectly = (bed: IcuBed) => {
    if (!bed.patientId) return;
    openPatientWorkspace(bed.patientId, {
      originWorkArea: 'icu',
      originType: 'unit_board',
      boardType: 'icu',
      activeFilter,
      searchQuery,
      selectedPatientId: bed.patientId,
      defaultActivity: 'vitals'
    });
  };

  const getBedStatusBadge = (status: IcuBedOperationalState) => {
    switch (status) {
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800">مشغول Occupied</span>;
      case 'available':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">شاغر Available</span>;
      case 'reserved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800">محجوز Reserved</span>;
      case 'cleaning':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-950 text-sky-300 border border-sky-800">تعقيم وتطهير Cleaning</span>;
      case 'maintenance':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-950 text-orange-300 border border-orange-800">صيانة Maintenance</span>;
      case 'blocked':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700">مغلق Blocked</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Top ICU Critical Situational Header */}
      <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                  محطة إدارة أسرة العناية المركزة (ICU Unit & Bed Board)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  مراقبة تليميتري ومكافحة عدوى حية
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توزيع الأسرة التشغيلية • دعم الأجهزة الحيوية ومضخات التروية • عزل ومكافحة العدوى • خطط الانتقال والتخفيض
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mock Control Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => {
                  setIsLoadingMock(true);
                  setTimeout(() => setIsLoadingMock(false), 1200);
                }}
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                title="محاكاة التحميل السريع (Skeleton Loading)"
              >
                محاكاة تحميل
              </button>
              <button
                onClick={() => setIsErrorMock(!isErrorMock)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isErrorMock ? 'bg-rose-900 text-rose-200' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="محاكاة خطأ مزامنة بيانات تليميتري"
              >
                {isErrorMock ? 'إلغاء الخطأ' : 'محاكاة خطأ'}
              </button>
              <button
                onClick={() => setHasStaleNotice(!hasStaleNotice)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  hasStaleNotice ? 'bg-amber-900 text-amber-200' : 'hover:bg-slate-800 text-slate-300'
                }`}
                title="محاكاة إشعار نقل وتحديث سرير"
              >
                {hasStaleNotice ? 'إخفاء الإشعار' : 'إشعار تحديث'}
              </button>
            </div>

            <button
              onClick={() => openStandardsModal(undefined, undefined, 'cbahi')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 text-xs font-bold transition-all shadow-xs"
              title="معايير سباهي للأمان في العناية المركزة"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>معايير أمان CBAHI</span>
            </button>
          </div>
        </div>

        {/* ICU Bed Status & KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">إجمالي أسرة القسم</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-white font-mono">{totalBeds}</span>
              <Bed className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl">
            <span className="text-rose-300 block text-[10px]">الأسرة المشغولة</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-rose-400 font-mono">{occupiedCount}</span>
              <span className="text-[10px] text-rose-300/80 font-bold">{Math.round((occupiedCount / totalBeds) * 100)}%</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-xl">
            <span className="text-emerald-300 block text-[10px]">الأسرة الشاغرة فوراً</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-emerald-400 font-mono">{availableCount}</span>
              <span className="text-[10px] text-emerald-300/80 font-bold">جاهزة</span>
            </div>
          </div>

          <div className="bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-xl">
            <span className="text-amber-300 block text-[10px]">أسرة محجوزة للعمليات</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-amber-400 font-mono">{reservedCount}</span>
              <span className="text-[10px] text-amber-300/80 font-bold">OR-1</span>
            </div>
          </div>

          <div className="bg-cyan-950/40 border border-cyan-900/60 p-2.5 rounded-xl">
            <span className="text-cyan-300 block text-[10px]">أجهزة تنفس صناعي</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-cyan-400 font-mono">{ventilatedCount}</span>
              <Wind className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-900/60 p-2.5 rounded-xl">
            <span className="text-indigo-300 block text-[10px]">حالات عزل عدوى</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-indigo-400 font-mono">{isolationCount}</span>
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Stale Notice if triggered */}
      {hasStaleNotice && (
        <BoardStaleNotice
          message="تم الانتهاء من تعقيم السرير ICU-Bed-06 وهو متاح الآن للاستقبال • اضغط للتحديث"
          onRefresh={() => setHasStaleNotice(false)}
        />
      )}

      {/* Simulated Error State if triggered */}
      {isErrorMock && (
        <BoardErrorState
          message="تعذر قراءة بيانات التليميتري المباشرة من شبكة المراقبة المركزية"
          onRetry={() => setIsErrorMock(false)}
        />
      )}

      {/* 2. Filter Bar & Search */}
      {!isErrorMock && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              كافة الأسرة ({totalBeds})
            </button>
            <button
              onClick={() => setActiveFilter('occupied')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'occupied'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              مشغولة ({occupiedCount})
            </button>
            <button
              onClick={() => setActiveFilter('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'available'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              شاغرة ({availableCount})
            </button>
            <button
              onClick={() => setActiveFilter('reserved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'reserved'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              محجوزة ({reservedCount})
            </button>
            <button
              onClick={() => setActiveFilter('isolation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'isolation'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              عزل عدوى ({isolationCount})
            </button>
            <button
              onClick={() => setActiveFilter('ventilated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'ventilated'
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-cyan-700 hover:bg-cyan-50'
              }`}
            >
              تنفس صناعي ({ventilatedCount})
            </button>
            <button
              onClick={() => setActiveFilter('attention')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'attention'
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-800 hover:bg-rose-50'
              }`}
            >
              تتطلب انتباهاً ⚠️
            </button>
          </div>

          {/* Search Box */}
          <div className="relative md:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالسرير، المريض، MRN، التشخيص..."
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
        </div>
      )}

      {/* 3. ICU Bed Cards Grid */}
      {!isErrorMock && (
        isLoadingMock ? (
          <BoardSkeletonLoading type="bed_grid" count={6} />
        ) : filteredBeds.length === 0 ? (
          <BoardEmptyState
            reason={searchQuery || activeFilter !== 'all' ? 'filter_mismatch' : 'unit_empty'}
            onResetFilters={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBeds.map(bed => {
              const bedStatus = bed.bedStatus || (bed.patientId ? 'occupied' : 'available');
              const isOccupied = bedStatus === 'occupied';
              const isMapLow = bed.hemodynamics.map > 0 && bed.hemodynamics.map < 65;
              const hasIsolation = !!bed.isolationPrecaution && bed.isolationPrecaution !== 'none';

              // Unoccupied / Reserved / Cleaning Bed View
              if (!isOccupied) {
                return (
                  <div
                    key={bed.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all shadow-xs ${
                      bedStatus === 'reserved'
                        ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
                        : bedStatus === 'cleaning'
                        ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {bed.bedNo}
                          </span>
                          {getBedStatusBadge(bedStatus)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {bedStatus === 'reserved' ? 'محجوز' : bedStatus === 'cleaning' ? 'تعقيم' : 'شاغر'}
                        </span>
                      </div>

                      <div className="py-6 text-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-slate-600 bg-slate-100">
                          {bedStatus === 'reserved' ? (
                            <ClockAlert className="w-6 h-6 text-amber-600" />
                          ) : bedStatus === 'cleaning' ? (
                            <Sparkle className="w-6 h-6 text-sky-600" />
                          ) : (
                            <Bed className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{bed.patientName}</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                          {bed.reservedFor || bed.diagnosis}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>التمريض: {bed.primaryNurse}</span>
                      <span className="font-semibold text-teal-700">وضع الاستعداد</span>
                    </div>
                  </div>
                );
              }

              // Occupied Bed View (Situational Awareness Card)
              return (
                <div
                  key={bed.id}
                  className={`bg-white rounded-2xl border p-4 space-y-3.5 shadow-xs transition-all hover:shadow-md cursor-pointer ${
                    isMapLow
                      ? 'border-rose-400 ring-2 ring-rose-200/70 bg-rose-50/15'
                      : hasIsolation
                      ? 'border-indigo-300 ring-1 ring-indigo-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => handleOpenQuickPreview(bed)}
                >
                  {/* Card Header: Bed No, Status & Demographics */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {bed.bedNo}
                        </span>
                        {getBedStatusBadge(bedStatus)}
                        {hasIsolation && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3" />
                            {bed.isolationPrecaution === 'airborne' ? 'عزل هوائي' : 'عزل تلامسي'}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          يوم {bed.admitDays} بالعناية
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 mt-1.5 flex items-center gap-1.5">
                        <span className="hover:text-teal-700 transition-colors">{bed.patientName}</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          ({bed.age} سنة • {bed.gender === 'male' ? 'ذكر' : 'أنثى'})
                        </span>
                      </h3>
                      <div className="text-[10px] font-mono text-teal-700 font-bold mt-0.5">
                        {bed.mrn} • {bed.diagnosis}
                      </div>
                    </div>

                    {/* Acuity Indicators: GCS & SOFA Score Profile */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center w-12">
                        <span className="text-[9px] text-slate-400 block font-bold">GCS</span>
                        <strong className={`font-mono text-xs font-black ${bed.gcsScore < 10 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {bed.gcsScore}/15
                        </strong>
                      </div>
                      <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center w-12">
                        <span className="text-[9px] text-slate-400 block font-bold">SOFA</span>
                        <strong className={`font-mono text-xs font-black ${bed.sofaScore >= 10 ? 'text-rose-600' : 'text-amber-600'}`}>
                          {bed.sofaScore}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Strip: Hemodynamics Live Snapshot */}
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-900 text-white p-2.5 rounded-xl text-center font-mono">
                    <div className="border-l border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">ضغط الشريان Art</span>
                      <span className="text-xs font-bold text-teal-300">{bed.hemodynamics.artLineBp}</span>
                    </div>
                    <div className="border-l border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">متوسط MAP</span>
                      <span className={`text-xs font-black ${isMapLow ? 'text-rose-400 animate-pulse' : 'text-emerald-300'}`}>
                        {bed.hemodynamics.map}
                      </span>
                    </div>
                    <div className="border-l border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">النبض HR</span>
                      <span className="text-xs font-bold text-white">{bed.hemodynamics.hr}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">الأكسجين SpO2</span>
                      <span className={`text-xs font-bold ${bed.hemodynamics.spo2 < 93 ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {bed.hemodynamics.spo2}%
                      </span>
                    </div>
                  </div>

                  {/* Ventilator & Respiratory Status */}
                  <div className="bg-cyan-50/50 border border-cyan-200/70 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-950 flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-cyan-700" />
                        {bed.ventilator.isVentilated ? `جهاز تنفس (${bed.ventilator.mode})` : 'تنفس تلقائي'}
                      </span>
                      {bed.ventilator.isVentilated && (
                        <span className="font-mono text-[10px] text-cyan-800 font-bold">
                          FiO2: {bed.ventilator.fio2}% | PEEP: {bed.ventilator.peep} | TV: {bed.ventilator.tidalVolume}ml
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Infusions & Active Vasoactive Drugs */}
                  {bed.infusions && bed.infusions.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        المضخات الوريدية الفعالة (Active Infusions):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {bed.infusions.map((inf, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              inf.category === 'vasopressor' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              inf.category === 'sedative' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {inf.drug.split(' ')[0]}: {inf.rate}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lines, Drains & Disposition Plan */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                    {bed.linesAndDrains && bed.linesAndDrains.length > 0 && (
                      <div className="text-slate-600 truncate" title={bed.linesAndDrains.join(' • ')}>
                        <span className="font-bold text-slate-700">القساطر والأنابيب:</span> {bed.linesAndDrains.slice(0, 2).join(' • ')}...
                      </div>
                    )}
                    {bed.expectedTransition && (
                      <div className="text-emerald-800 font-medium truncate">
                        <span className="font-bold">المسار:</span> {bed.expectedTransition}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Responsible Team & Quick Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs" onClick={e => e.stopPropagation()}>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700 block">{bed.attendingIntensivist.replace('د. ', '')}</span>
                      <span className="text-[10px] text-slate-400">{bed.primaryNurse}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenQuickPreview(bed)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors cursor-pointer"
                        title="معاينة سريعة تشغيلية (Quick Preview)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenWorkspaceDirectly(bed)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                        title="فتح الملف السريري الكامل (Patient Workspace)"
                      >
                        <span>الملف</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
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
