import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Package,
  ArrowRightLeft,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import {
  MedicationReturnContext,
  CancelledAfterPreparationContext,
  MedicationOrderContext
} from '../../types/pharmacyOps';

interface ReturnsExceptionsViewProps {
  returns: MedicationReturnContext[];
  cancelledPreps: CancelledAfterPreparationContext[];
  orders: MedicationOrderContext[];
  onProcessReturn: (returnId: string, action: 'return_to_active_stock' | 'quarantine_for_destruction') => void;
  onUpdateDisposition: (orderId: string, disposition: CancelledAfterPreparationContext['productDisposition']) => void;
}

export const ReturnsExceptionsView: React.FC<ReturnsExceptionsViewProps> = ({
  returns,
  cancelledPreps,
  orders,
  onProcessReturn,
  onUpdateDisposition
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'returns' | 'cancelled_prep' | 'shortages'>('returns');

  // Stock shortage orders
  const shortageOrders = orders.filter(o => o.stockContext.availability === 'out_of_stock' || o.stockContext.availability === 'low_stock');

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">إدارة المرتجعات والاستثناءات وإتلاف المحاليل (Returns & Exceptions)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                Quality & Safety Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              معالجة الأدوية المرتجعة من الأجنحة، والتصرف بالمنتجات المحضرة الملغاة، ونقص المخزون
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              activeSubTab === 'returns'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            المرتجعات ({returns.length})
          </button>
          <button
            onClick={() => setActiveSubTab('cancelled_prep')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              activeSubTab === 'cancelled_prep'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            أُلغي بعد التحضير ({cancelledPreps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('shortages')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              activeSubTab === 'shortages'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            نقص المخزون ({shortageOrders.length})
          </button>
        </div>
      </div>

      {/* Semantic Distinction Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 flex items-center justify-between">
        <span className="leading-relaxed">
          <strong>مبدأ سلامة التوثيق:</strong> إرجاع الدواء إلى الصيدلية (Returned Medication) يختلف جذرياً عن إلغاء أو عكس إعطاء الدواء في سجل التمريض (MAR Reversal)؛ كما أن إلغاء أمر الطبيب للمريض لا يعني إتلاف الدواء تلقائياً بل يمر بمسار توثيق التصرف بالمنتج (Product Disposition).
        </span>
      </div>

      {/* Subtab 1: Ward Returns */}
      {activeSubTab === 'returns' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <th className="py-3 px-3.5">كود الإرجاع / المريض</th>
                <th className="py-3 px-3.5">المستحضر والكمية</th>
                <th className="py-3 px-3.5">سبب الإرجاع من الجناح</th>
                <th className="py-3 px-3.5">حالة التغليف والعبوة</th>
                <th className="py-3 px-3.5">الإجراء المتخذ (Disposition)</th>
                <th className="py-3 px-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returns.map(ret => (
                <tr key={ret.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-bold text-slate-900 text-xs">{ret.id}</div>
                    <div className="text-[11px] text-slate-600">{ret.patientName} ({ret.locationWard})</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{ret.medicationName}</div>
                    <div className="text-[10px] text-slate-500">الكمية: {ret.quantityReturned} عبوة</div>
                  </td>

                  <td className="py-3 px-3.5 text-[11px] text-slate-700">
                    {ret.returnReason === 'patient_discharged_early'
                      ? 'خروج المريض قبل موعد الجرعة'
                      : ret.returnReason === 'order_discontinued_by_doctor'
                      ? 'إيقاف الدواء من قبل الطبيب'
                      : 'أسباب سريرية أخرى'}
                  </td>

                  <td className="py-3 px-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ret.packagingCondition === 'intact_sealed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {ret.packagingCondition === 'intact_sealed' ? 'سليمة ومغلقة تماماً' : 'مفتوحة / غير صالحة'}
                    </span>
                  </td>

                  <td className="py-3 px-3.5">
                    <span className="font-medium text-slate-800 text-[11px]">
                      {ret.dispositionAction === 'return_to_active_stock'
                        ? 'إعادة للمخزون الفعال'
                        : ret.dispositionAction === 'quarantine_for_destruction'
                        ? 'حجر للإتلاف الطبي'
                        : 'تسوية رصيد فقط'}
                    </span>
                    <div className="text-[10px] text-slate-400">بواسطة: {ret.processedBy}</div>
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onProcessReturn(ret.id, 'return_to_active_stock')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] transition-colors border border-emerald-200"
                      >
                        إعادة للمخزون
                      </button>
                      <button
                        onClick={() => onProcessReturn(ret.id, 'quarantine_for_destruction')}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] transition-colors border border-rose-200"
                      >
                        حجر للإتلاف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtab 2: Cancelled After Prep */}
      {activeSubTab === 'cancelled_prep' && (
        <div className="space-y-3">
          {cancelledPreps.map(item => (
            <div
              key={item.orderId}
              className="bg-white border border-slate-200 hover:border-amber-500 rounded-xl p-4 transition-all shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.medicationName}</span>
                    <span className="font-mono text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Ref: {item.orderId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    <strong>سبب الإلغاء من الطبيب:</strong> {item.prescriberCancellationReason}
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  item.productDisposition === 'discard_waste_compounded'
                    ? 'bg-rose-100 text-rose-800'
                    : item.productDisposition === 'return_to_stock_stable'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.productDisposition === 'discard_waste_compounded'
                    ? 'إتلاف المحلول وتوثيق الهدر'
                    : item.productDisposition === 'return_to_stock_stable'
                    ? 'إعادة للمخزون'
                    : 'حجر مؤقت للمراجعة'}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {item.notes || 'المحلول معقم وتم حله في كابينة التدفق الصفحي؛ يلزم تحديد الإجراء النهائي.'}
              </div>

              {/* Disposition Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  الموثق: {item.dispositionDocumentedBy || 'د. سامي الجوهر'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateDisposition(item.orderId, 'discard_waste_compounded')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>توثيق الإتلاف والهدر الطبي (Waste Disposition)</span>
                  </button>
                  <button
                    onClick={() => onUpdateDisposition(item.orderId, 'return_to_stock_stable')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>إعادة تخصيص لمريض آخر (Reassign If Valid)</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Stock Shortages */}
      {activeSubTab === 'shortages' && (
        <div className="space-y-3">
          {shortageOrders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{order.brandName} ({order.genericName})</span>
                  <span className="text-[11px] text-slate-500 mr-2 font-mono">Ref: {order.id}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  {order.stockContext.availability === 'out_of_stock' ? 'نفاد تام للمخزون' : 'مخزون حرج'}
                </span>
              </div>

              <div className="text-[11px] text-slate-600">
                المريض: <strong>{order.patientName}</strong> ({order.locationWardBed}) • الكمية المطلوبة: {order.totalQuantityOrdered} {order.quantityUnit}
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 text-[11px] flex items-center justify-between">
                <span>
                  <strong>البديل العلاجي المقترح في الدليل:</strong> Ertapenem 1g IV أو Cefepime 2g + Metronidazole (يتطلب موافقة الطبيب).
                </span>
                <span className="font-bold text-purple-700 text-[10px]">Therapeutic Alternative Available</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
