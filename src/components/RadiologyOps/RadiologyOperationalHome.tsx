import React from 'react';
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Radio,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  RadiologyOperationalIndicators,
  ModalityDeviceRoom,
  IncomingImagingRequest,
  RadiologistWorklistItem,
  ImagingModality
} from '../../types/radiologyOps';

interface RadiologyOperationalHomeProps {
  indicators: RadiologyOperationalIndicators;
  rooms: ModalityDeviceRoom[];
  requests: IncomingImagingRequest[];
  readingQueue: RadiologistWorklistItem[];
  onNavigateTab: (tab: string) => void;
  onSelectModality: (modality: ImagingModality | 'ALL') => void;
  onOpenQuickPreview: (req: IncomingImagingRequest) => void;
  onOpenReportComposer: (studyId: string) => void;
  onOpenDemoScenarios: () => void;
}

export const RadiologyOperationalHome: React.FC<RadiologyOperationalHomeProps> = ({
  indicators,
  rooms,
  requests,
  readingQueue,
  onNavigateTab,
  onSelectModality,
  onOpenQuickPreview,
  onOpenReportComposer,
  onOpenDemoScenarios
}) => {
  const statRequests = requests.filter(r => r.priority === 'stat');
  const delayedReports = readingQueue.filter(r => r.isDelayed);

  const getStatusBadge = (status: ModalityDeviceRoom['status']) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">متاح وجاهز (Available)</span>;
      case 'in_use':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">قيد الفحص (In Use)</span>;
      case 'cleaning_turnover':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">تطهير وتعقيم (Turnover)</span>;
      case 'calibration_maintenance':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">معايرة وصيانة</span>;
      case 'offline':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">خارج الخدمة</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP OPERATIONAL HERO STATS (High Density Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Incoming Requests */}
        <div
          onClick={() => onNavigateTab('incoming')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>الطلبات الواردة</span>
            <Activity className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {indicators.incomingRequestsCount}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
            <span>{indicators.unscheduledCount} غير مجدول</span>
          </div>
        </div>

        {/* Scheduled Today */}
        <div
          onClick={() => onNavigateTab('scheduling')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>مجدول اليوم</span>
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {indicators.scheduledTodayCount}
          </div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">
            موزع على 8 غرف فحص
          </div>
        </div>

        {/* Arrived & In Prep */}
        <div
          onClick={() => onNavigateTab('arrivals')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>وصلوا / بالانتظار</span>
            <Clock className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono">
            {indicators.arrivedWaitingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-amber-600 font-bold">{indicators.preparationIncompleteCount}</span> قيد التحضير / الوريد
          </div>
        </div>

        {/* In Acquisition */}
        <div
          onClick={() => onNavigateTab('modality_worklist')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>قيد المسح الفعلي</span>
            <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {indicators.acquisitionInProgressCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {indicators.readyForModalityCount} بانتظار الإدخال
          </div>
        </div>

        {/* Radiologist Reading Queue */}
        <div
          onClick={() => onNavigateTab('radiologist_worklist')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>طابور القراءة والتشخيص</span>
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="text-2xl font-black text-purple-900 font-mono">
            {indicators.awaitingInterpretationCount}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            {indicators.preliminaryCount} تقرير مبدئي
          </div>
        </div>

        {/* Exceptions & Attention */}
        <div
          onClick={() => onNavigateTab('exceptions')}
          className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-700 text-xs mb-1">
            <span>تنبيهات وتأخير</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {indicators.delayedNeedsAttentionCount}
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">
            يتطلب تدخلاً تشغيلياً
          </div>
        </div>
      </div>

      {/* 2. DEMO SCENARIOS PROMINENT SHORTCUT BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
              Interactive Prototype Sandbox
            </span>
            <span className="text-xs text-slate-400 font-mono">Scenarios A → G Interactive Triggers</span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>محاكاة سيناريوهات دورة حياة الأشعة (X-Ray, Contrast CT, MRI Safety, Stroke Code, ICU, IR)</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            استعرض مسار الفحص كاملاً من الطلب بـ Axis 6 حتى التقرير النهائي بـ Axis 7 مع استبيانات الأمان وفحوصات الصبغة وفحص الرنين وإخطار الحالات الحرجة.
          </p>
        </div>
        <button
          onClick={onOpenDemoScenarios}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-sm hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          <span>فتح مشغل السيناريوهات (Scenarios Runner)</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* 3. TWO-COLUMN SPLIT: MODALITY ROOM STATUS COCKPIT & STAT/CRITICAL QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Modality Rooms & Device States Matrix */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>حالة غرف وأجهزة الأشعة التشخيصية (Mock Modality Status)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                نظرة عامة تشغيلية محاكاة (Simulated Operational Overview) • {rooms.filter(r => r.status === 'in_use').length} أجهزة قيد الفحص • {rooms.filter(r => r.status === 'available').length} أجهزة متاحة للاستقبال
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('modality_worklist')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>قوائم العمل للموداليتي</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rooms.map(room => (
              <div
                key={room.id}
                onClick={() => {
                  onSelectModality(room.modality);
                  onNavigateTab('modality_worklist');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 ml-1.5">
                      {room.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {room.nameAr.split('(')[0]}
                    </span>
                  </div>
                  {getStatusBadge(room.status)}
                </div>

                <div className="text-[11px] text-slate-500 truncate">
                  {room.location}
                </div>

                {room.status === 'in_use' && room.currentPatientName && (
                  <div className="bg-blue-50/80 p-2 rounded-lg border border-blue-200/80 text-[11px] space-y-0.5">
                    <div className="font-bold text-blue-900 truncate">
                      المريض: {room.currentPatientName}
                    </div>
                    <div className="text-blue-700 text-[10px] flex items-center justify-between">
                      <span className="truncate">{room.currentExamName}</span>
                      <span className="font-mono font-bold text-blue-900 shrink-0">~{room.estimatedRemainingMinutes} دقيقة</span>
                    </div>
                  </div>
                )}

                {room.status === 'cleaning_turnover' && (
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                    {room.maintenanceNote || 'تطهير الغرفة وتغيير الأغطية الواقية'}
                  </div>
                )}

                {room.status === 'available' && (
                  <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الغرفة معقمة ومستعدة لاستدعاء المريض القادم</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Urgent STAT Requests & Reading Queue Highlights */}
        <div className="lg:col-span-5 space-y-6">
          {/* STAT / Emergency Cases Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <h4 className="text-sm font-bold text-slate-900">
                  الحالات الطارئة العاجلة (STAT Cases)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                {statRequests.length} حالات STAT
              </span>
            </div>

            <div className="space-y-2.5">
              {statRequests.map(req => (
                <div
                  key={req.id}
                  onClick={() => onOpenQuickPreview(req)}
                  className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      {req.patientName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {req.mrn}
                    </span>
                  </div>
                  <div className="text-xs text-rose-900 font-medium">
                    {req.examNameAr}
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">
                    {req.clinicalIndication}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-rose-100 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">{req.originLocation}</span>
                    <span className="font-mono text-rose-700 font-bold">{req.requestedDateTime.split(' ')[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delayed Reports Attention */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>تقارير تجاوزت مستهدف الإنجاز المحدد (Configured Target Elapsed)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {delayedReports.length} دراسات
              </span>
            </div>

            {delayedReports.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">
                كافة التقارير ضمن الأطر الزمنية المحددة للخدمة.
              </div>
            ) : (
              <div className="space-y-2">
                {delayedReports.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.patientName}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        تجاوز بـ {item.elapsedMinutes - item.targetTurnaroundTimeMinutes} دقيقة
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">{item.studyDescription}</div>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-500">الطبيب: {item.assignedRadiologist || 'غير مسند'}</span>
                      <button
                        onClick={() => onOpenReportComposer(item.studyId)}
                        className="font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                      >
                        فتح وكتابة التقرير
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
