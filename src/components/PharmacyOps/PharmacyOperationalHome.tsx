import React from 'react';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  Package,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Users,
  Send,
  Building2,
  ExternalLink
} from 'lucide-react';
import {
  PharmacyOperationalMetrics,
  MedicationOrderContext,
  PharmacyIntervention,
  PharmacyViewTab
} from '../../types/pharmacyOps';

interface PharmacyOperationalHomeProps {
  metrics: PharmacyOperationalMetrics;
  orders: MedicationOrderContext[];
  interventions: PharmacyIntervention[];
  onNavigateTab: (tab: PharmacyViewTab) => void;
  onOpenQuickPreview: (order: MedicationOrderContext) => void;
  onOpenVerification: (order: MedicationOrderContext) => void;
  onOpenScenariosModal: () => void;
}

export const PharmacyOperationalHome: React.FC<PharmacyOperationalHomeProps> = ({
  metrics,
  orders,
  interventions,
  onNavigateTab,
  onOpenQuickPreview,
  onOpenVerification,
  onOpenScenariosModal
}) => {
  // Urgent attention orders (High-alert, delayed, or clarification needed)
  const attentionOrders = orders.filter(
    o => o.isHighAlert || o.isDelayed || o.orderStatus === 'clarification_needed' || o.alerts.some(a => a.severity === 'high_attention')
  );

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner: Operational Context & Interactive Demo Launcher */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 border border-slate-700 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Departmental Pharmacy Operations
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-300 text-xs">لوحة التحكم والعمليات الصيدلانية المركزية</span>
          </div>
          <h2 className="text-base font-bold tracking-wide">
            مركز العمليات الصيدلانية: استقبال الطلبات، التدقيق السريري، التحضير المعقم، والصرف الآمن
          </h2>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            منظومة متكاملة تضمن الفصل الصريح بين التحقق السريري (Verification)، التحضير المعقم (Cleanroom Compounding)، والصرف (Dispensing)، مع ربط سياقي كامل دون تكرار سجل إعطاء التمريض (MAR).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenScenariosModal}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-teal-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>تشغيل سيناريوهات الاختبار (Scenarios A ➔ H)</span>
          </button>
        </div>
      </div>

      {/* High-Density Departmental Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Awaiting Verification */}
        <div
          onClick={() => onNavigateTab('incoming_orders')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 shadow-2xs cursor-pointer transition-all hover:translate-y-[-1px]"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">بانتظار التدقيق</span>
            <Pill className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.awaitingVerificationCount}
          </div>
          <div className="text-[10px] text-teal-700 font-medium mt-0.5">
            طلبات جديدة من الأطباء
          </div>
        </div>

        {/* Metric 2: Clarification / Interventions */}
        <div
          onClick={() => onNavigateTab('interventions')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 shadow-2xs cursor-pointer transition-all hover:translate-y-[-1px]"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">تدخلات واستيضاحات</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {metrics.clarificationsPendingCount}
          </div>
          <div className="text-[10px] text-amber-700 font-medium mt-0.5">
            معلقة برد الطبيب المعالج
          </div>
        </div>

        {/* Metric 3: High Alert Attention */}
        <div
          onClick={() => onNavigateTab('incoming_orders')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-rose-500 shadow-2xs cursor-pointer transition-all hover:translate-y-[-1px]"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">أدوية عالية الخطورة</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1">
            {metrics.highAttentionOrdersCount}
          </div>
          <div className="text-[10px] text-rose-700 font-medium mt-0.5">
            وفق سياسة التحقق المعتمدة
          </div>
        </div>

        {/* Metric 4: In Preparation & Cleanroom */}
        <div
          onClick={() => onNavigateTab('preparation')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-cyan-500 shadow-2xs cursor-pointer transition-all hover:translate-y-[-1px]"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">قيد التحضير المعقم</span>
            <FlaskConical className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.sterileIvCompoundingCount}
          </div>
          <div className="text-[10px] text-cyan-700 font-medium mt-0.5">
            محاليل وريدية وكابينة معقمة
          </div>
        </div>

        {/* Metric 5: Ready for Dispense */}
        <div
          onClick={() => onNavigateTab('dispensing')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 shadow-2xs cursor-pointer transition-all hover:translate-y-[-1px]"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">جاهز للصرف والتسليم</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {metrics.readyForDispensingCount}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
            اجتاز نموذج التدقيق النهائي المعتمد
          </div>
        </div>

        {/* Metric 6: Returns & Exceptions */}
        <div
          onClick={() => onNavigateTab('returns_exceptions')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 shadow-2xs cursor-pointer transition-all hover:translate-y-[-1px]"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">مرتجع واستثناءات</span>
            <RotateCcw className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics.returnsPendingInspectionCount}
          </div>
          <div className="text-[10px] text-indigo-700 font-medium mt-0.5">
            مرتجعات أجنحة أو إلغاءات
          </div>
        </div>
      </div>

      {/* Two-Column Section: High Priority Attention Items & Service Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attention Worklist */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                قائمة الانتباه والتدخلات الحرجة (Critical Attention & Interventions Queue)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('incoming_orders')}
              className="text-teal-700 hover:text-teal-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <span>عرض كافة الطلبات</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {attentionOrders.map(order => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-3.5 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{order.brandName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">({order.genericName})</span>
                    <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded text-[10px]">
                      {order.orderedDose} • {order.route}
                    </span>
                    {order.isHighAlert && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        High Alert
                      </span>
                    )}
                    {order.isDelayed && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>متأخر</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-2">
                    <span>المريض: <strong>{order.patientName}</strong> ({order.mrn})</span>
                    <span>•</span>
                    <span>الموقع: {order.locationWardBed}</span>
                    <span>•</span>
                    <span className="text-slate-500">الطبيب: {order.prescriberName}</span>
                  </div>

                  {order.alerts && order.alerts[0] && (
                    <div className="text-[11px] text-rose-900 bg-rose-50/80 px-2 py-1 rounded border border-rose-100 mt-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span className="font-medium">{order.alerts[0].detailAr}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenQuickPreview(order)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    معاينة
                  </button>
                  <button
                    onClick={() => onOpenVerification(order)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تدقيق سريري</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Operational Links & Service Status */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>جاهزية أقسام الصيدلية (Pharmacy Service Status)</span>
            </h4>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">صيدلية التنويم المركزية (Inpatient)</div>
                  <div className="text-slate-500">العربات الدورية وجرعات الجناح</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  نشط • 98% في الوقت
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">غرفة المحاليل المعقمة (Cleanroom Hood)</div>
                  <div className="text-slate-500">كابينة التدفق الصفحي BSC-02</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                  معقم ISO-5
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">صيدلية التخريج والعيادات (Discharge/OPD)</div>
                  <div className="text-slate-500">نوافذ الصرف والإرشاد الدوائي</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  جاهز للصرف
                </span>
              </div>
            </div>
          </div>

          {/* Quick Guidance Note on MAR Boundary */}
          <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-4 text-[11px] text-teal-950 space-y-1.5">
            <span className="font-bold text-xs block text-teal-900">
              حدود المنتج السريري (Core Product Boundary):
            </span>
            <p className="leading-relaxed">
              عمليات الصيدلية مسؤولة عن: الاستقبال، التدقيق السريري، الاستيضاح والتدخل، التحضير، والصرف. توثيق إعطاء الجرعة للمريض (Administration) يتم في سجل التمريض (Axis 8 eMAR)، ولا تقوم الصيدلية بتسجيل إعطاء الجرعة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
