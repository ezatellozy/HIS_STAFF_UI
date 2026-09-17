import React, { useState, useMemo } from 'react';
import {
  Pill,
  FlaskConical,
  Camera,
  Stethoscope,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  Mic
} from 'lucide-react';
import { ClinicalOrderItem, OrderCategory, OrderStatus } from '../../../types/clinicalOrdersRequests';

interface OrdersListViewProps {
  orders: ClinicalOrderItem[];
  onOpenOrderAction: (order: ClinicalOrderItem, action: 'discontinue' | 'hold' | 'resume') => void;
  onViewOrderDetails: (order: ClinicalOrderItem) => void;
}

export const OrdersListView: React.FC<OrdersListViewProps> = ({
  orders,
  onOpenOrderAction,
  onViewOrderDetails
}) => {
  const [categoryFilter, setCategoryFilter] = useState<OrderCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (categoryFilter !== 'all' && order.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = order.orderTitleAr.toLowerCase().includes(q) || order.orderTitleEn.toLowerCase().includes(q);
        const matchDoctor = (order.orderedBy?.name || '').toLowerCase().includes(q);
        const matchIndication = order.clinicalIndication.toLowerCase().includes(q);
        if (!matchTitle && !matchDoctor && !matchIndication) return false;
      }
      return true;
    });
  }, [orders, categoryFilter, statusFilter, searchQuery]);

  const getCategoryIcon = (category: OrderCategory) => {
    switch (category) {
      case 'medication':
        return <Pill className="w-5 h-5 text-teal-600" />;
      case 'laboratory':
        return <FlaskConical className="w-5 h-5 text-blue-600" />;
      case 'imaging':
        return <Camera className="w-5 h-5 text-purple-600" />;
      case 'procedure':
        return <Stethoscope className="w-5 h-5 text-emerald-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>نشط وجارٍ تنفيذه (Active)</span>
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>معلق مؤقتاً (On Hold)</span>
          </span>
        );
      case 'discontinued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>ملغى وموقوف (Discontinued)</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>مكتمل التنفيذ (Completed)</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderResultPipeline = (order: ClinicalOrderItem) => {
    // Type-specific fulfillment timelines (Independent mock timelines per category, no unified workflow engine)
    const stageKey = order.resultPipelineStatus || order.resultPipelineStage;

    if (order.category === 'laboratory') {
      const labStages = [
        { key: 'ordered', labelAr: 'تم الطلب', labelEn: 'Ordered' },
        { key: 'specimen_collected', labelAr: 'سحب العينة', labelEn: 'Specimen Collection' },
        { key: 'received_accessioned', labelAr: 'استلام وقيد', labelEn: 'Received / Accessioned' },
        { key: 'processing', labelAr: 'المعالجة والتحليل', labelEn: 'Processing' },
        { key: 'preliminary_result', labelAr: 'نتيجة أولية', labelEn: 'Preliminary Result*' },
        { key: 'final_result', labelAr: 'النتيجة المعتمدة', labelEn: 'Final Result' }
      ];

      // Mapping aliases or current key
      let currentIdx = labStages.findIndex(s => s.key === stageKey);
      if (currentIdx === -1) {
        if (stageKey === 'in_analysis') currentIdx = 3;
        else if (stageKey === 'resulted' || order.status === 'completed') currentIdx = 5;
        else currentIdx = 0;
      }

      return (
        <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span className="flex items-center gap-1.5 text-blue-900">
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span>مسار تنفيذ الفحص المخبري (Laboratory Fulfillment Timeline):</span>
            </span>
            <span className="font-mono text-blue-800 font-bold bg-blue-100/80 px-2 py-0.5 rounded text-[10px]">
              {labStages[currentIdx]?.labelAr} ({labStages[currentIdx]?.labelEn})
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {labStages.map((stage, idx) => {
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={stage.key} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-blue-600 ring-2 ring-blue-300'
                        : isPassed
                        ? 'bg-blue-500'
                        : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`block text-[8.5px] text-center truncate ${
                      isPassed ? 'text-blue-950 font-bold' : 'text-slate-400'
                    }`}
                    title={`${stage.labelAr} - ${stage.labelEn}`}
                  >
                    {stage.labelAr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (order.category === 'imaging') {
      const imagingStages = [
        { key: 'ordered', labelAr: 'تم الطلب', labelEn: 'Ordered' },
        { key: 'scheduled', labelAr: 'جدولة الموعد', labelEn: 'Scheduled*' },
        { key: 'patient_arrived', labelAr: 'وصول المريض', labelEn: 'Patient Arrived' },
        { key: 'performed', labelAr: 'تم التصوير', labelEn: 'Performed' },
        { key: 'preliminary_report', labelAr: 'تقرير أولي', labelEn: 'Preliminary Report*' },
        { key: 'final_report', labelAr: 'التقرير النهائي', labelEn: 'Final Report' }
      ];

      let currentIdx = imagingStages.findIndex(s => s.key === stageKey);
      if (currentIdx === -1) {
        if (stageKey === 'resulted' || order.status === 'completed') currentIdx = 5;
        else currentIdx = 0;
      }

      return (
        <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span className="flex items-center gap-1.5 text-purple-900">
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>مسار تنفيذ الأشعة والتصوير (Imaging Fulfillment Timeline):</span>
            </span>
            <span className="font-mono text-purple-800 font-bold bg-purple-100/80 px-2 py-0.5 rounded text-[10px]">
              {imagingStages[currentIdx]?.labelAr} ({imagingStages[currentIdx]?.labelEn})
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {imagingStages.map((stage, idx) => {
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={stage.key} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-purple-600 ring-2 ring-purple-300'
                        : isPassed
                        ? 'bg-purple-500'
                        : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`block text-[8.5px] text-center truncate ${
                      isPassed ? 'text-purple-950 font-bold' : 'text-slate-400'
                    }`}
                    title={`${stage.labelAr} - ${stage.labelEn}`}
                  >
                    {stage.labelAr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (order.category === 'procedure') {
      const procedureStages = [
        { key: 'ordered', labelAr: 'تم الطلب', labelEn: 'Ordered' },
        { key: 'scheduled_prepared', labelAr: 'التحضير والجدولة', labelEn: 'Prepared / Scheduled' },
        { key: 'in_progress', labelAr: 'قيد الإجراء', labelEn: 'In Progress' },
        { key: 'completed', labelAr: 'اكتمال الإجراء', labelEn: 'Completed' },
        { key: 'procedure_documented', labelAr: 'توثيق تقرير العملية', labelEn: 'Procedure Documentation' }
      ];

      let currentIdx = procedureStages.findIndex(s => s.key === stageKey);
      if (currentIdx === -1) {
        if (order.status === 'completed') currentIdx = 3;
        else currentIdx = 1;
      }

      return (
        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span className="flex items-center gap-1.5 text-emerald-900">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>مسار الإجراء والتدخل الجراحي (Procedure Fulfillment Timeline):</span>
            </span>
            <span className="font-mono text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
              {procedureStages[currentIdx]?.labelAr} ({procedureStages[currentIdx]?.labelEn})
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {procedureStages.map((stage, idx) => {
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={stage.key} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 ring-2 ring-emerald-300'
                        : isPassed
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`block text-[9px] text-center truncate ${
                      isPassed ? 'text-emerald-950 font-bold' : 'text-slate-400'
                    }`}
                    title={`${stage.labelAr} - ${stage.labelEn}`}
                  >
                    {stage.labelAr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (order.category === 'medication') {
      return (
        <div className="bg-teal-50/40 p-2 rounded-xl border border-teal-100 text-[10.5px] flex items-center justify-between text-teal-900">
          <span className="flex items-center gap-1.5 font-medium">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>مسار إدارة وصرف الدواء: مسجل في الصيدلية وeMAR (تفاصيل الإعطاء والجرعات في Axis 8 — Medications / MAR).</span>
          </span>
          <span className="font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">
            eMAR Verified
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                categoryFilter === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كافة الأوامر ({orders.length})
            </button>
            <button
              onClick={() => setCategoryFilter('medication')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                categoryFilter === 'medication' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الأدوية والعلاجات
            </button>
            <button
              onClick={() => setCategoryFilter('laboratory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                categoryFilter === 'laboratory' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المختبر والتحاليل
            </button>
            <button
              onClick={() => setCategoryFilter('imaging')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                categoryFilter === 'imaging' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الأشعة والتصوير
            </button>
            <button
              onClick={() => setCategoryFilter('procedure')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                categoryFilter === 'procedure' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الإجراءات والتدخلات
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في الأوامر، الطبيب، الداعي السريري..."
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
          <span className="font-bold text-slate-500">حالة الأمر:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="p-1 px-2.5 rounded-lg border border-slate-200 font-bold bg-white text-slate-700"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط وجارٍ (Active)</option>
            <option value="on_hold">معلق مؤقتاً (On Hold)</option>
            <option value="discontinued">ملغى وموقوف (Discontinued)</option>
            <option value="completed">مكتمل (Completed)</option>
          </select>
        </div>
      </div>

      {/* Orders List Stream */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <Layers className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-sm text-slate-600">لا توجد أوامر سريرية مطابقة للتصفية المحددة.</p>
            <p className="text-xs text-slate-400">يمكنك إنشاء أمر جديد عبر المحررات التخصصية في الشريط العلوي.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isDiscontinued = order.status === 'discontinued';
            const isOnHold = order.status === 'on_hold';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all p-4 space-y-3 hover:shadow-sm ${
                  isDiscontinued
                    ? 'border-red-200 bg-red-50/20 opacity-70'
                    : isOnHold
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(order.category)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-extrabold text-sm ${
                            isDiscontinued ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {order.orderTitleAr}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{order.id}</span>
                        
                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.priority === 'stat'
                              ? 'bg-red-600 text-white'
                              : order.priority === 'urgent'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.priority.toUpperCase()}
                        </span>

                        {getStatusBadge(order.status)}

                        {/* High Alert Badge if medication */}
                        {order.medicationDetails?.isHighAlert && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>دواء عالي الخطورة</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-sans font-medium text-slate-600">{order.orderTitleEn}</span>
                        <span>•</span>
                        <span>بواسطة: <strong className={order.orderedBy?.name ? 'text-slate-800' : 'text-slate-500 font-normal italic'}>{order.orderedBy?.name || 'غير محدد'}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{order.orderedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2">
                    {order.status === 'active' && (
                      <>
                        <button
                          onClick={() => onOpenOrderAction(order, 'hold')}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors cursor-pointer"
                        >
                          تعليق مؤقت (Hold)
                        </button>

                        <button
                          onClick={() => onOpenOrderAction(order, 'discontinue')}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors cursor-pointer"
                        >
                          إيقاف الأمر (Discontinue)
                        </button>
                      </>
                    )}

                    {order.status === 'on_hold' && (
                      <button
                        onClick={() => onOpenOrderAction(order, 'resume')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                      >
                        استئناف الأمر (Resume)
                      </button>
                    )}
                  </div>
                </div>

                {/* Clinical Indication Row */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between text-slate-700">
                  <div>
                    <span className="text-slate-500 font-bold ml-1">الداعي السريري والتشخيص:</span>
                    <span>{order.clinicalIndication}</span>
                  </div>

                  {/* Medication specifics */}
                  {order.medicationDetails && (
                    <div className="font-mono text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                      {order.medicationDetails.doseAmount} {order.medicationDetails.doseUnit} • {order.medicationDetails.route} • {order.medicationDetails.frequency}
                    </div>
                  )}
                </div>

                {/* Result Pipeline Progress Indicator if active */}
                {renderResultPipeline(order)}

                {/* Configured Verbal / Telephone Order Profile (Item 2 & Scenarios B, C) */}
                {order.orderSourceProfile && (
                  <div className="p-3 bg-violet-50/50 border border-violet-200/80 rounded-xl space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-violet-950">
                        {order.orderSourceProfile.orderSource === 'emergency_verbal' ? (
                          <Mic className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <PhoneCall className="w-3.5 h-3.5 text-violet-600" />
                        )}
                        <span>{order.orderSourceProfile.orderSourceLabelAr}</span>
                        {order.orderSourceProfile.profileNameAr && (
                          <span className="text-[10px] text-violet-700 font-normal">
                            ({order.orderSourceProfile.profileNameAr})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        {order.orderSourceProfile.isReadBackRequired ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>التأكيد الشفوي (Read-Back): موثّق ومطابق ✓</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-medium">
                            التأكيد الشفوي: غير مطلوب وفق سياسة البروفايل
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-violet-100">
                      <div>
                        <span className="text-slate-500 font-semibold">المستلم المصرّح:</span>{' '}
                        <strong className="text-slate-800">{order.orderSourceProfile.receiver.name}</strong> ({order.orderSourceProfile.receiver.role}) • {order.orderSourceProfile.receivedAt}
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold">المصادقة والاعتماد:</span>{' '}
                        {order.orderSourceProfile.authenticationStatus === 'authenticated' ? (
                          <span className="text-emerald-700 font-bold">
                            معتمد إلكترونياً ({order.orderSourceProfile.authenticatedBy?.name} - {order.orderSourceProfile.authenticatedAt})
                          </span>
                        ) : (
                          <span className="text-amber-800 font-bold">
                            بانتظار التوقيع ({order.orderSourceProfile.configuredAuthenticationTarget?.targetDescriptionAr || 'خلال 24 ساعة'})
                          </span>
                        )}
                      </div>
                    </div>

                    {order.orderSourceProfile.emergencyRationaleOrReason && (
                      <div className="text-[11px] text-slate-700 bg-white/70 p-2 rounded-lg border border-violet-100">
                        <strong className="text-violet-900 ml-1">مبرر الأمر الشفوي / الاستعجال:</strong>
                        <span>{order.orderSourceProfile.emergencyRationaleOrReason}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CDSS Alerts preview if any */}
                {order.cdssAlerts && order.cdssAlerts.length > 0 && (
                  <div className="text-[11px] bg-amber-50/70 p-2 rounded-lg border border-amber-200 text-amber-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        تنبيهات الأمان السريري: {order.cdssAlerts.map(a => a.titleAr).join(' | ')}
                      </span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 rounded font-bold">
                      تم التجاوز بمبرر طبي
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
