import React, { useState, useMemo } from 'react';
import {
  Bed,
  Building,
  UserCheck,
  Sparkles,
  ArrowRightLeft,
  LogOut,
  FileText,
  AlertTriangle,
  Heart,
  Droplets,
  Utensils,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  Clock,
  GitFork,
  Scissors,
  HeartPulse,
  Activity,
  Eye,
  ExternalLink,
  Layers,
  CalendarCheck,
  UserPlus,
  ShieldAlert,
  ClockAlert
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { WardBed, WardId } from '../../types/his';
import { SharedPatientQuickPreview, QuickPreviewPatientData } from '../Shared/SharedPatientQuickPreview';
import {
  BoardSkeletonLoading,
  BoardEmptyState,
  BoardErrorState,
  BoardStaleNotice
} from '../Shared/SharedBoardStateFeedback';

export const WardsDashboard: React.FC = () => {
  const {
    wardBeds,
    updateBedStatus,
    transferBed,
    dischargeBed,
    openStandardsModal,
    openLifecycleModal,
    admitPatientToWard,
    admitToIcu,
    dischargePatientFullCycle,
    playChime,
    patients,
    openPatientWorkspace,
    workspaceOrigin
  } = useHis();

  // Restore origin state if returning from workspace
  const defaultWard = (workspaceOrigin?.boardType === 'ward' && (workspaceOrigin.selectedWard as WardId | 'all')) || 'all';
  const defaultView = (workspaceOrigin?.boardType === 'ward' && workspaceOrigin.activeView) || 'census';
  const defaultSearch = (workspaceOrigin?.boardType === 'ward' && workspaceOrigin.searchQuery) || '';

  const [selectedWard, setSelectedWard] = useState<WardId | 'all'>(defaultWard);
  const [activeOperationalView, setActiveOperationalView] = useState<'census' | 'incoming' | 'discharges' | 'attention'>(
    defaultView as any
  );
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [selectedBedRowId, setSelectedBedRowId] = useState<string | null>(
    (workspaceOrigin?.boardType === 'ward' && workspaceOrigin.selectedPatientId) || null
  );

  // Quick Preview state
  const [previewData, setPreviewData] = useState<QuickPreviewPatientData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Simulated Mock States
  const [isLoadingMock, setIsLoadingMock] = useState<boolean>(false);
  const [isErrorMock, setIsErrorMock] = useState<boolean>(false);
  const [hasStaleNotice, setHasStaleNotice] = useState<boolean>(false);

  // Transfer Bed Modal
  const [transferModalState, setTransferModalState] = useState<{ isOpen: boolean; sourceBed: WardBed | null }>({
    isOpen: false,
    sourceBed: null
  });
  const [selectedTargetBedId, setSelectedTargetBedId] = useState('');

  // Bed Census calculations
  const totalBeds = wardBeds.length;
  const occupiedBeds = wardBeds.filter(b => b.status === 'occupied').length;
  const availableBeds = wardBeds.filter(b => b.status === 'available').length;
  const cleaningBeds = wardBeds.filter(b => b.status === 'cleaning').length;
  const isolationBeds = wardBeds.filter(b => b.status === 'isolation_contact' || b.status === 'isolation_airborne').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Mock Incoming Patients (from ER and ICU/OR)
  const incomingPatients = useMemo(() => [
    {
      id: 'inc-01',
      patientName: 'سارة خالد المريخي',
      mrn: 'MRN-77291',
      age: 38,
      gender: 'female',
      sourceLocation: 'طوارئ الحوادث (ER Resus Bay)',
      sourceType: 'er',
      targetWard: 'ward_surgical_3b',
      targetWardName: 'جناح الجراحة التخصصي (3B)',
      targetBedNumber: '302-A',
      diagnosis: 'استئصال زائدة دودية عاجل (Post-Appy)',
      attendingPhysician: 'د. وليد الصاوي (جراحة عامة)',
      eta: 'خلال 20 دقيقة',
      admissionStatus: 'approved_bed_assigned'
    },
    {
      id: 'inc-02',
      patientName: 'كمال عبد الله الزيات',
      mrn: 'MRN-88192',
      age: 57,
      gender: 'male',
      sourceLocation: 'العناية المركزة (ICU Bed 02)',
      sourceType: 'icu',
      targetWard: 'ward_medical_3a',
      targetWardName: 'جناح الباطنة التخصصي (3A)',
      targetBedNumber: '301-B',
      diagnosis: 'تخفيض رعاية ما بعد قسطرة الشرايين التاجية',
      attendingPhysician: 'د. طارق المنشاوي (استشاري قلب)',
      eta: 'الساعة 14:30',
      admissionStatus: 'stepdown_scheduled'
    }
  ], []);

  // Mock Expected Discharges
  const expectedDischarges = useMemo(() => [
    {
      bedId: 'bed-301a',
      patientName: 'محمد السيد عبد الرحمن',
      mrn: 'MRN-88421',
      bedNumber: '301-A',
      wardNameAr: 'جناح الباطنة التخصصي (3A)',
      plannedDischargeDate: 'اليوم (14:00)',
      attendingPhysician: 'د. هدى عبد العزيز',
      readiness: {
        summarySigned: true,
        medsReconciled: true,
        patientEducated: true,
        transportReady: false
      },
      status: 'pending_transport'
    },
    {
      bedId: 'bed-302a',
      patientName: 'عمر ياسين الحسين',
      mrn: 'MRN-99302',
      bedNumber: '302-A',
      wardNameAr: 'جناح الجراحة التخصصي (3B)',
      plannedDischargeDate: 'اليوم (16:00)',
      attendingPhysician: 'د. وليد الصاوي',
      readiness: {
        summarySigned: true,
        medsReconciled: false,
        patientEducated: false,
        transportReady: false
      },
      status: 'in_progress'
    }
  ], []);

  // Filtered Beds
  const filteredBeds = useMemo(() => {
    return wardBeds.filter(bed => {
      if (selectedWard !== 'all' && bed.wardId !== selectedWard) return false;

      if (activeOperationalView === 'attention') {
        const hasAttn = bed.fallRisk === 'high' ||
                        bed.status === 'isolation_contact' ||
                        bed.status === 'isolation_airborne';
        if (!hasAttn) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBed = bed.bedNumber.toLowerCase().includes(q);
        const matchPatient = bed.patientName?.toLowerCase().includes(q);
        const matchMrn = bed.mrn?.toLowerCase().includes(q);
        const matchDoctor = bed.attendingPhysician?.toLowerCase().includes(q);
        const matchDiag = bed.diagnosis?.toLowerCase().includes(q);
        if (!matchBed && !matchPatient && !matchMrn && !matchDoctor && !matchDiag) return false;
      }
      return true;
    });
  }, [wardBeds, selectedWard, activeOperationalView, searchQuery]);

  const formatAdmitDateElapsed = (admitDate?: string): { value: string; elapsed: string } => {
    if (!admitDate || !admitDate.trim()) {
      return { value: 'غير مسجل', elapsed: 'غير مسجل / غير متاح' };
    }
    const parsed = new Date(admitDate);
    if (isNaN(parsed.getTime())) {
      return { value: admitDate, elapsed: 'غير متاح' };
    }
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
    let elapsedStr = 'غير مسجل';
    if (diffDays > 0) {
      elapsedStr = `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : diffDays === 2 ? 'يومين' : diffDays <= 10 ? 'أيام' : 'يوماً'}`;
    } else if (diffDays === 0) {
      elapsedStr = 'اليوم';
    } else {
      const refAnchor = new Date('2026-09-09T14:00:00');
      const mockDiffDays = Math.floor((refAnchor.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
      if (mockDiffDays >= 0) {
        elapsedStr = `منذ ${mockDiffDays} أيام`;
      }
    }
    return { value: admitDate, elapsed: elapsedStr };
  };

  const handleOpenQuickPreview = (bed: WardBed) => {
    if (!bed.patientId) return;
    setSelectedBedRowId(bed.patientId);

    const isIsolation = bed.status === 'isolation_contact' || bed.status === 'isolation_airborne';
    const admitInfo = formatAdmitDateElapsed(bed.admitDate);

    const data: QuickPreviewPatientData = {
      patientId: bed.patientId,
      patientName: bed.patientName || 'مريض مجهول',
      mrn: bed.mrn || 'MRN-000',
      age: bed.age,
      gender: bed.gender,
      encounterId: `IPD-ENC-${(bed.mrn || '000').replace('MRN-', '')}`,
      encounterType: `تنويم داخلي (${bed.wardNameAr})`,
      currentLocation: `سرير ${bed.bedNumber} - ${bed.wardNameAr}`,
      boardState: {
        label: isIsolation ? 'عزل وقائي' : bed.fallRisk === 'high' ? 'خطورة سقوط مرتفعة' : 'تنويم مستقر',
        variant: isIsolation || bed.fallRisk === 'high' ? 'warning' : 'neutral'
      },
      responsibleTeam: {
        primaryDoctor: bed.attendingPhysician,
        specialty: bed.wardNameEn
      },
      fallRisk: bed.fallRisk,
      isolationPrecaution: isIsolation ? (
        bed.status === 'isolation_airborne' ? 'عزل هوائي (Airborne Precautions)' : 'عزل تلامسي (Contact Precautions)'
      ) : undefined,
      timestamps: [
        { label: 'تاريخ الدخول', value: admitInfo.value, elapsed: admitInfo.elapsed }
      ],
      keyInvestigationsSummary: `الحمية الغذائية: ${bed.diet || 'عادية'} • السوائل الوريدية: ${bed.ivFluids || 'غير مقررة'}`,
      dischargeReadinessSummary: expectedDischarges.some(d => d.bedId === bed.id)
        ? 'مجدول للخروج اليوم • إخلاء طرف قيد الاستكمال'
        : 'مستمر في خطة الاستشفاء السريري',
      originBoardType: 'ward',
      originContext: {
        selectedWard,
        activeView: activeOperationalView,
        searchQuery
      }
    };

    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleOpenWorkspaceDirectly = (bed: WardBed) => {
    if (!bed.patientId) return;
    openPatientWorkspace(bed.patientId, {
      originWorkArea: 'ipd',
      originType: 'unit_board',
      boardType: 'ward',
      activeView: activeOperationalView,
      selectedWard,
      searchQuery,
      selectedPatientId: bed.patientId,
      defaultActivity: 'summary'
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Situational Ward Census Strip */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-inner">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                  لوحة سنسس أجنحة التنويم الداخلي (Inpatient Census & Flow Board)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">
                  سنسس تشغيلي وتدفق مرضى
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توزيع الأسرة الحية • الحالات القادمة من الطوارئ والعناية • مسار التخريج اليومي • معايير أمان السقوط والعزل
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all shadow-xs"
              title="معايير سلامة المنومين"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>معايير الأمان CBAHI</span>
            </button>
          </div>
        </div>

        {/* Census KPIs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">إجمالي الأسرة</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-white font-mono">{totalBeds}</span>
              <Bed className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-teal-950/40 border border-teal-800/60 p-2.5 rounded-xl">
            <span className="text-teal-300 block text-[10px]">الأسرة المشغولة (Census)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-teal-400 font-mono">{occupiedBeds}</span>
              <span className="text-[10px] text-teal-300/80 font-bold">{occupancyRate}% إشغال</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
            <span className="text-emerald-300 block text-[10px]">الأسرة الشاغرة فوراً</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-emerald-400 font-mono">{availableBeds}</span>
              <span className="text-[10px] text-emerald-300/80 font-bold">جاهزة للتسكين</span>
            </div>
          </div>

          <div className="bg-sky-950/40 border border-sky-800/60 p-2.5 rounded-xl">
            <span className="text-sky-300 block text-[10px]">حالات قادمة (Incoming)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-sky-400 font-mono">{incomingPatients.length}</span>
              <UserPlus className="w-4 h-4 text-sky-400" />
            </div>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl">
            <span className="text-amber-300 block text-[10px]">تخريج اليوم المتوقع</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-black text-amber-400 font-mono">{expectedDischarges.length}</span>
              <CalendarCheck className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Stale Notice */}
      {hasStaleNotice && (
        <BoardStaleNotice
          message="تمت الموافقة على تحويل مريض من العناية المركزة وتخصيص سرير 301-B له • اضغط للتحديث"
          onRefresh={() => setHasStaleNotice(false)}
        />
      )}

      {/* Simulated Error State */}
      {isErrorMock && (
        <BoardErrorState
          message="تعذر تحميل أحدث بيانات سنسس الأجنحة من نظام إدارة الأسرة ADT"
          onRetry={() => setIsErrorMock(false)}
        />
      )}

      {/* 2. Operational Views Tabs & Ward Selector */}
      {!isErrorMock && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          {/* Top Row: Operational Flow Views */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveOperationalView('census')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeOperationalView === 'census'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                1. سنسس المنومين الحالي (Current Census)
              </button>
              <button
                onClick={() => setActiveOperationalView('incoming')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeOperationalView === 'incoming'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                <span>2. حالات قادمة متوقعة (Incoming)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-mono">
                  {incomingPatients.length}
                </span>
              </button>
              <button
                onClick={() => setActiveOperationalView('discharges')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeOperationalView === 'discharges'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span>3. تخريج اليوم المتوقع (Discharges)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-mono">
                  {expectedDischarges.length}
                </span>
              </button>
              <button
                onClick={() => setActiveOperationalView('attention')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeOperationalView === 'attention'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                }`}
              >
                تتطلب انتباهاً / عزل ⚠️
              </button>
            </div>

            {/* Ward Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium shrink-0">الجناح:</span>
              <select
                value={selectedWard}
                onChange={e => setSelectedWard(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="all">كافة أجنحة المستشفى</option>
                <option value="ward_medical_3a">جناح الباطنة التخصصي (3A)</option>
                <option value="ward_surgical_3b">جناح الجراحة العامة (3B)</option>
                <option value="ward_pediatric_2c">جناح الأطفال وحديثي الولادة (2C)</option>
                <option value="ward_vip_4a">أجنحة الاستشفاء الفاخرة (VIP 4A)</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم السرير، المريض، الرقم الطبي MRN، الطبيب المعالج، أو التشخيص..."
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

      {/* 3. Main Views Content */}
      {!isErrorMock && (
        isLoadingMock ? (
          <BoardSkeletonLoading type="table" count={5} />
        ) : activeOperationalView === 'incoming' ? (
          // ================= INCOMING VIEW =================
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-sky-50/50 border-b border-sky-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-sky-950 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-sky-600" />
                  <span>الحالات القادمة المتوقعة إلى أجنحة التنويم (Incoming Admissions & Transfers)</span>
                </h3>
                <p className="text-[11px] text-sky-800 mt-0.5">
                  حالات طوارئ معتمدة للدخول أو تحويلات من العناية المركزة والعمليات بانتظار استلام السرير
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 text-xs font-bold font-mono">
                {incomingPatients.length} حالات معتمدة
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {incomingPatients.map(inc => (
                <div key={inc.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{inc.patientName}</span>
                      <span className="text-teal-700 font-mono font-bold text-xs">({inc.mrn})</span>
                      <span className="text-slate-400 text-xs">• {inc.age} سنة • {inc.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {inc.sourceType === 'er' ? 'قادم من الطوارئ' : 'تحويل من العناية'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>التشخيص المبدئي:</strong> {inc.diagnosis}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-4">
                      <span>الجهة المرسلة: <strong>{inc.sourceLocation}</strong></span>
                      <span>الجناح المستهدف: <strong>{inc.targetWardName}</strong> (سرير: {inc.targetBedNumber})</span>
                      <span>الطبيب المعالج: <strong>{inc.attendingPhysician}</strong></span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-xs font-bold text-amber-700 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      الوصول المتوقع: {inc.eta}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      السرير جاهز ومعقم للاستقبال
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeOperationalView === 'discharges' ? (
          // ================= DISCHARGES VIEW =================
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>تخريج اليوم المتوقع (Expected Discharges Flow)</span>
                </h3>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  متابعة استكمال متطلبات إخلاء الطرف، ملخص الخروج، المصالحة الدوائية، والنقل
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold font-mono">
                {expectedDischarges.length} حالات مجدولة
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {expectedDischarges.map(d => (
                <div key={d.bedId} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{d.patientName}</span>
                      <span className="text-teal-700 font-mono font-bold text-xs">({d.mrn})</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs font-bold">
                        سرير {d.bedNumber}
                      </span>
                      <span className="text-xs text-slate-500">• {d.wardNameAr}</span>
                    </div>

                    <div className="text-xs text-slate-600">
                      الطبيب المسؤول عن التخريج: <strong>{d.attendingPhysician}</strong> • موعد الخروج: <strong className="text-emerald-700">{d.plannedDischargeDate}</strong>
                    </div>

                    {/* Readiness Checklist items */}
                    <div className="flex items-center gap-3 text-[11px] pt-1">
                      <span className={`flex items-center gap-1 ${d.readiness.summarySigned ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> تقرير الخروج مُوقع
                      </span>
                      <span className={`flex items-center gap-1 ${d.readiness.medsReconciled ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> المصالحة الدوائية
                      </span>
                      <span className={`flex items-center gap-1 ${d.readiness.patientEducated ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> تثقيف المريض
                      </span>
                      <span className={`flex items-center gap-1 ${d.readiness.transportReady ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}`}>
                        <Clock className="w-3.5 h-3.5" /> {d.readiness.transportReady ? 'النقل جاهز' : 'بانتظار وسيلة النقل'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      d.status === 'pending_transport' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.status === 'pending_transport' ? 'بانتظار استلام النقل' : 'إجراءات جارية'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // ================= CENSUS TABLE VIEW =================
          filteredBeds.length === 0 ? (
            <BoardEmptyState
              reason={searchQuery || selectedWard !== 'all' ? 'filter_mismatch' : 'unit_empty'}
              onResetFilters={() => {
                setSelectedWard('all');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-bold">
                      <th className="py-3 px-3">السرير والغرفة</th>
                      <th className="py-3 px-3">بيانات المريض والمعرف</th>
                      <th className="py-3 px-3">الجناح وتاريخ الدخول LOS</th>
                      <th className="py-3 px-3">الطبيب المعالج</th>
                      <th className="py-3 px-3">خطر السقوط (Morse)</th>
                      <th className="py-3 px-3">الحمية والسوائل</th>
                      <th className="py-3 px-3">احتياطات العزل</th>
                      <th className="py-3 px-3">جاهزية الخروج</th>
                      <th className="py-3 px-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBeds.map(bed => {
                      const isOccupied = bed.status === 'occupied';
                      const isIsolation = bed.status === 'isolation_contact' || bed.status === 'isolation_airborne';
                      const isDischargeToday = expectedDischarges.some(d => d.bedId === bed.id);
                      const isSelected = selectedBedRowId === bed.patientId;

                      if (!isOccupied) {
                        return (
                          <tr key={bed.id} className="bg-slate-50/40 text-slate-400">
                            <td className="py-3 px-3 font-mono font-bold text-slate-700">
                              {bed.bedNumber}
                            </td>
                            <td colSpan={7} className="py-3 px-3 text-slate-500">
                              {bed.status === 'available' ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  سرير شاغر جاهز للتسكين الفوري ({bed.wardNameAr})
                                </span>
                              ) : bed.status === 'cleaning' ? (
                                <span className="inline-flex items-center gap-1.5 text-sky-700 font-bold">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  سرير قيد التنظيف والتعقيم الدوري
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-slate-600">
                                  سرير تحت الصيانة
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="text-[10px] text-slate-400">متاح</span>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={bed.id}
                          className={`transition-colors hover:bg-teal-50/40 cursor-pointer ${
                            isSelected ? 'bg-teal-50/80 ring-1 ring-teal-500/40' :
                            isIsolation ? 'bg-indigo-50/20' : ''
                          }`}
                          onClick={() => handleOpenQuickPreview(bed)}
                        >
                          {/* Bed */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-center inline-block">
                              {bed.bedNumber}
                            </div>
                          </td>

                          {/* Patient */}
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900 hover:text-teal-700 transition-colors">
                              {bed.patientName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <span className="text-teal-700 font-bold">{bed.mrn}</span>
                              <span>• {bed.age} سنة • {bed.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 truncate max-w-xs mt-0.5" title={bed.diagnosis}>
                              {bed.diagnosis}
                            </div>
                          </td>

                          {/* Ward & LOS */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="text-slate-800 font-medium">{bed.wardNameAr}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              دخول: {bed.admitDate || '2026-09-06'} • <strong className="text-slate-700">3 أيام (LOS)</strong>
                            </div>
                          </td>

                          {/* Attending */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-medium text-slate-800">
                              {bed.attendingPhysician || 'غير محدد'}
                            </div>
                          </td>

                          {/* Fall Risk */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              bed.fallRisk === 'high' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              bed.fallRisk === 'moderate' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {bed.fallRisk === 'high' ? '⚠️ مرتفع (High)' :
                               bed.fallRisk === 'moderate' ? 'متوسط (Moderate)' : 'منخفض (Low)'}
                            </span>
                          </td>

                          {/* Diet & IV */}
                          <td className="py-3 px-3">
                            <div className="text-slate-700 font-medium">{bed.diet || 'عادية'}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={bed.ivFluids}>
                              {bed.ivFluids || 'لا توجد محاليل'}
                            </div>
                          </td>

                          {/* Isolation */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isIsolation ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                <ShieldAlert className="w-3 h-3 text-indigo-600" />
                                {bed.status === 'isolation_airborne' ? 'عزل هوائي' : 'عزل تلامسي'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">بدون عزل</span>
                            )}
                          </td>

                          {/* Discharge Readiness */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isDischargeToday ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                خروج اليوم
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">قيد العلاج</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenQuickPreview(bed)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors cursor-pointer"
                                title="معاينة سريعة تشغيلية"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenWorkspaceDirectly(bed)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                                title="فتح الملف السريري الكامل"
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

              {/* Table Footer Summary */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  إجمالي الأسرة المعروضة: <strong>{filteredBeds.length}</strong> • المشغولة: <strong>{filteredBeds.filter(b => b.status === 'occupied').length}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  اضغط على أي مريض لفتح المعاينة السريعة • ملف المريض متاح عبر زر "الملف"
                </div>
              </div>
            </div>
          )
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
