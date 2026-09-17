import React, { useState } from 'react';
import {
  Pill,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Eye,
  ShieldAlert,
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';
import {
  MedicationOrderContext,
  PharmacyFilterState,
  MedicationPriority
} from '../../types/pharmacyOps';

interface IncomingOrdersViewProps {
  orders: MedicationOrderContext[];
  filterState: PharmacyFilterState;
  onUpdateFilter: (updates: Partial<PharmacyFilterState>) => void;
  onOpenVerification: (order: MedicationOrderContext) => void;
  onOpenQuickPreview: (order: MedicationOrderContext) => void;
  onOpenClarification: (order: MedicationOrderContext) => void;
  onOpenLabelPreview: (order: MedicationOrderContext) => void;
}

export const IncomingOrdersView: React.FC<IncomingOrdersViewProps> = ({
  orders,
  filterState,
  onUpdateFilter,
  onOpenVerification,
  onOpenQuickPreview,
  onOpenClarification,
  onOpenLabelPreview
}) => {
  // Local filtered orders
  const filteredOrders = orders.filter(order => {
    // Search query
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      const match =
        order.patientName.toLowerCase().includes(q) ||
        order.mrn.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q) ||
        order.genericName.toLowerCase().includes(q) ||
        order.brandName.toLowerCase().includes(q) ||
        order.locationWardBed.toLowerCase().includes(q) ||
        order.prescriberName.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Priority filter
    if (filterState.priorityFilter !== 'all' && order.priority !== filterState.priorityFilter) {
      return false;
    }

    // High alert only
    if (filterState.highAlertOnly && !order.isHighAlert) {
      return false;
    }

    // Delayed only
    if (filterState.delayedOnly && !order.isDelayed) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم، رقم الملف MRN، كود الطلب RX، اسم الدواء، أو الطبيب..."
              value={filterState.searchQuery}
              onChange={e => onUpdateFilter({ searchQuery: e.target.value })}
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onUpdateFilter({ priorityFilter: filterState.priorityFilter === 'stat' ? 'all' : 'stat' })}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                filterState.priorityFilter === 'stat'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>STAT طارئ</span>
            </button>

            <button
              onClick={() => onUpdateFilter({ highAlertOnly: !filterState.highAlertOnly })}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                filterState.highAlertOnly
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>أدوية عالية الخطورة فقط</span>
            </button>

            <button
              onClick={() => onUpdateFilter({ delayedOnly: !filterState.delayedOnly })}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                filterState.delayedOnly
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>متأخر عن الوقت المحدد</span>
            </button>
          </div>
        </div>

        {/* Filter Summary & Total Count */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            إجمالي الطلبات في قائمة الانتظار: <strong className="text-slate-900">{filteredOrders.length}</strong> طلبات
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>STAT / عالي الخطورة</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>استيضاح مطلوب</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>جاهز للتدقيق</span>
            </span>
          </div>
        </div>
      </div>

      {/* Orders High-Density Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <th className="py-3 px-3.5">كود الطلب / الأولوية</th>
                <th className="py-3 px-3.5">المريض والموقع السريري</th>
                <th className="py-3 px-3.5">المستحضر الدوائي والجرعة</th>
                <th className="py-3 px-3.5">طريقة الإعطاء والتكرار</th>
                <th className="py-3 px-3.5">الطبيب الواصف / الوقت</th>
                <th className="py-3 px-3.5">تنبيهات الفحص السريري</th>
                <th className="py-3 px-3.5">الحالة التشغيلية</th>
                <th className="py-3 px-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className={`hover:bg-teal-50/30 transition-colors ${
                    order.isHighAlert ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Order ID & Priority */}
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-bold text-slate-900 text-[11px]">{order.id}</div>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          order.priority === 'stat'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : order.priority === 'urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.priority}
                      </span>
                    </div>
                  </td>

                  {/* Patient & Location */}
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{order.patientName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{order.mrn}</div>
                    <div className="text-[10px] text-teal-800 font-medium mt-0.5">{order.locationWardBed}</div>
                  </td>

                  {/* Medication, Dose, Form */}
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900 text-xs">{order.brandName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{order.genericName}</div>
                    <div className="text-[10px] font-bold text-teal-700 mt-0.5">
                      {order.orderedDose} • {order.strength}
                    </div>
                  </td>

                  {/* Route & Frequency */}
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-slate-800">{order.route}</div>
                    <div className="text-[11px] text-slate-500">{order.frequency}</div>
                    <div className="text-[10px] text-slate-400">
                      {order.totalQuantityOrdered} {order.quantityUnit}
                    </div>
                  </td>

                  {/* Prescriber & Time */}
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-slate-800">{order.prescriberName}</div>
                    <div className="text-[10px] text-slate-500">{order.prescriberDepartment}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{order.prescribedAt}</span>
                    </div>
                  </td>

                  {/* Clinical Alerts */}
                  <td className="py-3 px-3.5">
                    {order.alerts && order.alerts.length > 0 ? (
                      <div className="space-y-1 max-w-[200px]">
                        {order.alerts.slice(0, 2).map(alert => (
                          <div
                            key={alert.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                              alert.severity === 'high_attention'
                                ? 'bg-rose-100 text-rose-900 font-bold'
                                : alert.severity === 'warning'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                            title={alert.detailAr}
                          >
                            {alert.titleAr}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        لا توجد تعارضات حرجة
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'clarification_needed'
                          ? 'bg-amber-100 text-amber-800'
                          : order.orderStatus === 'verified'
                          ? 'bg-teal-100 text-teal-800'
                          : order.orderStatus === 'preparing'
                          ? 'bg-cyan-100 text-cyan-800'
                          : order.orderStatus === 'ready_for_dispense'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'partially_dispensed'
                          ? 'bg-purple-100 text-purple-800'
                          : order.orderStatus === 'cancelled_by_source'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.orderStatus === 'clarification_needed'
                        ? 'استيضاح معلق'
                        : order.orderStatus === 'verified'
                        ? 'معتمد سريرياً'
                        : order.orderStatus === 'preparing'
                        ? 'قيد التحضير'
                        : order.orderStatus === 'ready_for_dispense'
                        ? 'جاهز للصرف'
                        : order.orderStatus === 'partially_dispensed'
                        ? 'صرف جزئي'
                        : order.orderStatus === 'cancelled_by_source'
                        ? 'أُلغي بالمصدر'
                        : 'بانتظار التدقيق'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenQuickPreview(order)}
                        title="معاينة سريعة"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenVerification(order)}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تدقيق</span>
                      </button>

                      <button
                        onClick={() => onOpenLabelPreview(order)}
                        title="معاينة ملصق الصيدلية"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
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
  );
};
