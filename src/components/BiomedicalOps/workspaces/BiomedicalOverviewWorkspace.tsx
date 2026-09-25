import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  HeartPulse,
  PenTool,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Zap,
  Building,
  ArrowUpRight
} from 'lucide-react';
import { BiomedicalOpsState, BiomedicalWorkspaceId } from '../../../types/biomedicalOps';

interface BiomedicalOverviewWorkspaceProps {
  state: BiomedicalOpsState;
  onNavigateWorkspace: (id: BiomedicalWorkspaceId) => void;
  onOpenNewWorkOrderModal?: () => void;
}

export const BiomedicalOverviewWorkspace: React.FC<BiomedicalOverviewWorkspaceProps> = ({
  state,
  onNavigateWorkspace
}) => {
  const totalAssets = state.assets.length;
  const inServiceAssets = state.assets.filter(a => a.currentStatus === 'in_service').length;
  const underRepairAssets = state.assets.filter(
    a => a.currentStatus === 'under_repair' || a.currentStatus === 'post_repair_testing'
  ).length;
  const quarantinedAssets = state.assets.filter(a => a.currentStatus === 'quarantined_safety_hold').length;
  const overduePpmAssets = state.assets.filter(a => a.ppmSchedule.status === 'overdue').length;
  const pendingCommissioning = state.assets.filter(a => a.currentStatus === 'pending_commissioning').length;

  const openWorkOrders = state.workOrders.filter(w => w.status !== 'completed_verified' && w.status !== 'cancelled');
  const statWorkOrders = openWorkOrders.filter(w => w.priority === 'stat_life_support');
  const lifeSupportAssets = state.assets.filter(a => a.lifeSupportDependency === true);
  const activeAlerts = state.safetyAlerts.filter(s => s.status !== 'verified_closed');

  return (
    <div className="space-y-6">
      {/* Top Welcome / Command Center Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                غرفة القيادة والسيطرة للأجهزة الطبية
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                سير العمل مستنير بمفاهيم IEC 62353 • إرشادات SFDA
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              مركز الرقابة السريرية والهندسة الطبية الحيوية (Biomedical Operations Command)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              متابعة الحالة التشغيلية الاصطناعية للأصول الطبية، خطط الصيانة الوقائية (PPM)، اختبارات الأمان الكهربائي، ومراجع استدعاءات هيئة الغذاء والدواء (SFDA NCMDR).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateWorkspace('work_orders')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>إدارة أوامر الصيانة ({openWorkOrders.length})</span>
            </button>
            <button
              onClick={() => onNavigateWorkspace('recalls_fsca')}
              className="bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>إنذارات الاستدعاء SFDA ({activeAlerts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateWorkspace('equipment_registry')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-500 shadow-xs cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>إجمالي الأصول الطبية</span>
            <Cpu className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalAssets}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {inServiceAssets} أجهزة في الخدمة السريرية
          </div>
        </div>

        <div
          onClick={() => onNavigateWorkspace('work_orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-500 shadow-xs cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>تحت الصيانة والإصلاح</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{underRepairAssets}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-1">
            {statWorkOrders.length} أعطال دعم حياة حرجة (STAT)
          </div>
        </div>

        <div
          onClick={() => onNavigateWorkspace('ppm_calibration')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 shadow-xs cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>الصيانة الدورية (PPM)</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalAssets > 0 ? Math.round(((totalAssets - overduePpmAssets) / totalAssets) * 100) : 0}%
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">
            {overduePpmAssets} أجهزة متأخرة عن موعدها
          </div>
        </div>

        <div
          onClick={() => onNavigateWorkspace('recalls_fsca')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-500 shadow-xs cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>الحجر واستدعاءات SFDA</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 font-mono">{quarantinedAssets}</div>
          <div className="text-[10px] text-red-500 font-semibold mt-1">
            {activeAlerts.length} بلاغات أمان معلقة
          </div>
        </div>

        <div
          onClick={() => onNavigateWorkspace('safety_testing')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-500 shadow-xs cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>فحص الأمان والتحرير</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {state.workOrders.filter(w => w.status === 'testing_pending').length}
          </div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">
            بانتظار فحص IEC 62353
          </div>
        </div>

        <div
          onClick={() => onNavigateWorkspace('equipment_registry')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-500 shadow-xs cursor-pointer transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>أجهزة قيد التدشين</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">{pendingCommissioning}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">
            فحص الاستلام والقبول الأولي
          </div>
        </div>
      </div>

      {/* Main Operational Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Work Orders & High Risk Devices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Work Orders Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  أوامر الصيانة المفتوحة والطارئة (Active Corrective Work Orders)
                </h3>
              </div>
              <button
                onClick={() => onNavigateWorkspace('work_orders')}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل ({openWorkOrders.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {openWorkOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد أوامر صيانة معلقة حالياً
                </div>
              ) : (
                openWorkOrders.map(wo => {
                  const isStat = wo.priority === 'stat_life_support';
                  return (
                    <div
                      key={wo.id}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {wo.workOrderNumber}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              isStat
                                ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isStat ? 'عاجل جداً — دعم حياة (STAT)' : 'عاجل سريرياً (Urgent)'}
                          </span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-600 font-semibold">{wo.departmentName}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{wo.assetName}</h4>
                        <p className="text-slate-500 text-[11px] line-clamp-1">{wo.problemDescription}</p>
                      </div>

                      <div className="text-left space-y-1">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono block">
                          المسؤول: {wo.assignedEngineer || 'غير مسند'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          زمن التوقف: {wo.downtimeHours} ساعة
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Life-Support Equipment Status Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-slate-800">
                  حالة الأجهزة المعتمدة على دعم الحياة (Life-Support Dependent Devices)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {lifeSupportAssets.filter(a => a.currentStatus === 'in_service').length} / {lifeSupportAssets.length} في الخدمة
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lifeSupportAssets.map(asset => {
                const isOnline = asset.currentStatus === 'in_service';
                return (
                  <div
                    key={asset.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs ${
                      isOnline
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-slate-500 font-bold block">
                          {asset.assetTag}
                        </span>
                        <h4 className="font-bold text-slate-900 mt-0.5">{asset.nameAr}</h4>
                        <p className="text-[10px] text-slate-500 font-sans">{asset.nameEn}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOnline
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {isOnline ? 'جاهز بالخدمة' : 'متوقف / صيانة'}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span>الموقع: {asset.locationRoom.split('-')[0]}</span>
                      <span>PPM: {asset.ppmSchedule.status === 'up_to_date' ? 'محدّث' : 'مستحق'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Safety Alerts & Audit Log Snippet */}
        <div className="space-y-6">
          {/* Active SFDA Safety Recalls Widget */}
          <div className="bg-white rounded-xl border border-red-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-red-50/80 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-sm text-red-900">
                  بلاغات استدعاء الهيئة (SFDA NCMDR)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full font-mono">
                {activeAlerts.length} نشط
              </span>
            </div>

            <div className="p-4 space-y-3">
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-800 text-[10px]">
                      {alert.fscaAlertNumber}
                    </span>
                    <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                      Class 1 Critical
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 leading-snug">{alert.titleAr}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{alert.hazardDescription}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-red-700 font-semibold">
                    <span>المطلوب: حظر فوري وحجر احترازي</span>
                    <span>الأجهزة المتأثرة: {alert.affectedAssetIds.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Biomedical Audit Events */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                <h3 className="font-bold text-sm text-slate-800">سجل الأحداث الفنية الأخير</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">سجل غير قابل للتعديل</span>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {state.auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{log.timestamp}</span>
                    <span className="text-teal-600 font-bold">{log.actor}</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{log.descriptionAr}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
