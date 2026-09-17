import React from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  User,
  Pill,
  Building2,
  Layers,
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { MedicationOrderContext } from '../../types/pharmacyOps';

interface PharmacyQuickPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: MedicationOrderContext | null;
  onOpenVerification: (order: MedicationOrderContext) => void;
  onOpenClarification: (order: MedicationOrderContext) => void;
  onViewLabelPreview: (order: MedicationOrderContext) => void;
  onNavigateToAxis6?: (patientId: string, orderId: string) => void;
  onNavigateToAxis8?: (patientId: string) => void;
}

export const PharmacyQuickPreviewDrawer: React.FC<PharmacyQuickPreviewDrawerProps> = ({
  isOpen,
  onClose,
  order,
  onOpenVerification,
  onOpenClarification,
  onViewLabelPreview,
  onNavigateToAxis6,
  onNavigateToAxis8
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">المعاينة السريعة للطلب الدوائي</span>
                <span className="font-mono text-[10px] text-teal-300 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                  {order.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">{order.locationWardBed}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Change Warning Banner if Stale/Cancelled */}
        {order.isSourceChanged && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">تنبيه تغيير في المصجر السريري (Source Changed / Cancelled):</span>
              <p className="text-[11px] mt-0.5 text-rose-800 leading-relaxed">
                {order.sourceChangeReason || 'تم تعديل أو إيقاف الطلب من قبل الطبيب المعالج.'}
              </p>
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Patient Clinical Context Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-900 text-sm">{order.patientName}</span>
              </div>
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                {order.mrn}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60 text-slate-600">
              <div>العمر / الجنس: <span className="font-medium text-slate-800">{order.patientAge} سنة • {order.patientGender === 'female' ? 'أنثى' : 'ذكر'}</span></div>
              <div>الوزن: <span className="font-medium text-slate-800">{order.patientWeightKg ? `${order.patientWeightKg} كجم` : 'غير مسجل'}</span></div>
              <div>وظائف الكلى: <span className="font-bold text-slate-800">{order.patientRenalStatus || 'طبيعي'}</span></div>
              <div>وظائف الكبد: <span className="font-medium text-slate-800">{order.patientHepaticStatus || 'طبيعي'}</span></div>
            </div>

            {/* Allergies Highlight */}
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">الحساسية الموثقة: </span>
                <span>{order.patientAllergies.join('، ') || 'لا توجد حساسية معروفة'}</span>
              </div>
            </div>

            {/* Cross-Link to Axis 8 MAR Context */}
            {onNavigateToAxis8 && (
              <button
                onClick={() => onNavigateToAxis8(order.patientId)}
                className="w-full text-right py-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center justify-between border-t border-slate-200 pt-2"
              >
                <span>الاطلاع على سجل إعطاء الدواء في ملف المريض (Axis 8 MAR Reference)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Medication Specifications Card */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-black text-sm text-slate-900">{order.brandName}</h4>
                <p className="text-[11px] text-slate-500 font-mono">{order.genericName}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                order.priority === 'stat'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : order.priority === 'urgent'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {order.priority.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500 block">الجرعة المقررة:</span>
                <span className="font-bold text-slate-900 text-xs">{order.orderedDose}</span>
              </div>
              <div>
                <span className="text-slate-500 block">التركيز والشكل:</span>
                <span className="font-medium text-slate-800">{order.strength} • {order.dosageForm}</span>
              </div>
              <div>
                <span className="text-slate-500 block">طريقة الإعطاء:</span>
                <span className="font-bold text-slate-900">{order.route}</span>
              </div>
              <div>
                <span className="text-slate-500 block">التكرار:</span>
                <span className="font-medium text-slate-800">{order.frequency}</span>
              </div>
            </div>

            <div className="text-[11px] space-y-1">
              <div><strong>دواعي الاستعمال:</strong> {order.clinicalIndication}</div>
              <div><strong>الطبيب الواصف:</strong> {order.prescriberName} ({order.prescriberDepartment})</div>
              <div><strong>وقت الطلب:</strong> {order.prescribedAt}</div>
            </div>
          </div>

          {/* CDSS Mock Clinical Alerts */}
          {order.alerts && order.alerts.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>تنبيهات الفحص السريري المعتمدة (Mock CDSS / Policy Outcomes):</span>
              </h5>
              {order.alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-xl border text-[11px] ${
                    alert.severity === 'high_attention'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{alert.titleAr}</span>
                    <span className="text-[10px] font-mono uppercase opacity-75">{alert.severity}</span>
                  </div>
                  <p className="mt-1 leading-relaxed opacity-90">{alert.detailAr}</p>
                </div>
              ))}
            </div>
          )}

          {/* Formulary & Stock Availability */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700">حالة الدليل الدوائي (Formulary):</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {order.formularyStatus === 'formulary' ? 'معتمد في الدليل (Formulary)' : 'غير معتمد'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700">توفر المخزون (Stock Context):</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                order.stockContext.availability === 'available'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.stockContext.availability === 'low_stock'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {order.stockContext.availability === 'available'
                  ? `متوفر (${order.stockContext.availableQuantity} ${order.stockContext.packageUnit})`
                  : order.stockContext.availability === 'low_stock'
                  ? `مخزون منخفض (${order.stockContext.availableQuantity} متبقي)`
                  : 'غير متوفر مؤقتاً (Out of Stock)'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              الموقع التخزيني: {order.stockContext.defaultLocation}
            </div>
          </div>
        </div>

        {/* Drawer Action Bar */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenVerification(order)}
              className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مساحة التدقيق السريري</span>
            </button>
            <button
              onClick={() => onOpenClarification(order)}
              className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>طلب استيضاح / تدخل</span>
            </button>
          </div>

          <button
            onClick={() => onViewLabelPreview(order)}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>معاينة ملصق الصرف (Label Preview)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
