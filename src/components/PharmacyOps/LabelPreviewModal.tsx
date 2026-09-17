import React from 'react';
import { X, Printer, ShieldAlert, CheckCircle2, QrCode, AlertTriangle } from 'lucide-react';
import { MedicationOrderContext, CompoundingWorksheet, DispenseRecord } from '../../types/pharmacyOps';

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: MedicationOrderContext | null;
  worksheet?: CompoundingWorksheet | null;
  dispense?: DispenseRecord | null;
}

export const LabelPreviewModal: React.FC<LabelPreviewModalProps> = ({
  isOpen,
  onClose,
  order,
  worksheet,
  dispense
}) => {
  if (!isOpen) return null;

  const patientName = order?.patientName || worksheet?.patientName || dispense?.patientName || 'المريض';
  const mrn = order?.mrn || worksheet?.mrn || dispense?.mrn || 'MRN-00000';
  const location = order?.locationWardBed || 'جناح التنويم';
  const medName = worksheet?.primaryDrug || order?.brandName ? `${order?.brandName} (${order?.genericName})` : dispense?.medicationName || 'دواء طبي';
  const strength = worksheet?.finalConcentration || order?.strength || 'حسب الوصفة';
  const dose = worksheet?.doseOrdered || order?.orderedDose || 'جرعة محددة';
  const route = order?.route || dispense?.route || 'وريدي / فموي';
  const frequency = order?.frequency || 'حسب تعليمات الطبيب';
  const instructions = worksheet?.instructions || order?.scheduleDetails || 'تناول العلاج وفق التوجيهات الطبية بدقة.';
  const quantity = dispense?.dispensedQuantity || order?.totalQuantityOrdered || 1;
  const quantityUnit = order?.quantityUnit || 'وحدة';
  const lotNumber = worksheet?.ingredients[0]?.lotNumber || dispense?.batchLot || order?.stockContext.batchLot || 'LOT-2026-X1';
  const expiryDate = worksheet?.beyondUseDate || dispense?.expiryDate || order?.stockContext.expiryDate || '12/2027';
  const isHighAlert = order?.isHighAlert || medName.toLowerCase().includes('heparin') || medName.toLowerCase().includes('apixaban');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">معاينة ملصق الصرف الدوائي (Medication Dispensing Label Preview)</h3>
              <p className="text-[11px] text-slate-300">
                محاكاة تصميم ملصق الصيدلية الرسمي • لا توجد واجهة طابعة حقيقية (Mock Preview Only)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Policy Notice */}
        <div className="bg-teal-50 border-b border-teal-200 px-4 py-2 text-[11px] text-teal-900 flex items-center justify-between">
          <span>معايير الملصق الدوائي المعتمد: وضوح الهوية الثنائية، والجرعة المحددة، والتركيز، وتحذيرات الأمان.</span>
          <span className="font-mono font-bold text-teal-700 text-[10px]">CBAHI / ISMP Aligned</span>
        </div>

        {/* The Actual Label Simulation */}
        <div className="p-6 bg-slate-100 flex items-center justify-center flex-1 overflow-y-auto">
          <div className="bg-white border-2 border-dashed border-slate-400 rounded-xl p-5 w-full max-w-md shadow-md text-slate-900 space-y-3 relative font-sans text-xs">
            {/* Pharmacy Branding */}
            <div className="flex items-center justify-between border-b pb-2 border-slate-200">
              <div>
                <div className="font-bold text-xs text-slate-900">مستشفى إدينا التخصصي • صيدلية العمليات</div>
                <div className="text-[10px] text-slate-500">Edina Specialized Hospital • Departmental Pharmacy</div>
              </div>
              <div className="text-right text-[10px] font-mono text-slate-400">
                RX #{order?.id || 'RX-2026'}
              </div>
            </div>

            {/* High Alert Warning Banner if Applicable */}
            {isHighAlert && (
              <div className="bg-rose-600 text-white font-black text-center py-1 px-2 rounded text-[11px] tracking-wide flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>⚠️ دواء عالي الخطورة — يتطلب تدقيقاً مزدوجاً (HIGH-ALERT MEDICATION)</span>
              </div>
            )}

            {/* Patient Context */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{patientName}</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded text-[11px]">{mrn}</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>الموقع: {location}</span>
                {order?.encounterId && <span className="font-mono text-[10px]">Enc: {order.encounterId}</span>}
              </div>
            </div>

            {/* Drug Details */}
            <div className="space-y-1.5 pt-1">
              <div className="text-sm font-black text-slate-900 flex items-center justify-between">
                <span>{medName}</span>
                <span className="text-teal-700 text-xs font-mono">{strength}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2 rounded border border-slate-100">
                <div>
                  <span className="text-slate-500 block">الجرعة المقررة:</span>
                  <span className="font-bold text-slate-800">{dose}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">طريقة الإعطاء:</span>
                  <span className="font-bold text-slate-800">{route}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">التكرار والجدول:</span>
                  <span className="font-bold text-slate-800">{frequency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الكمية المصروفة:</span>
                  <span className="font-bold text-slate-800">{quantity} {quantityUnit}</span>
                </div>
              </div>

              {/* Directions & Instructions */}
              <div className="p-2 rounded bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900">
                <span className="font-bold block mb-0.5">تعليمات الاستخدام:</span>
                <p className="leading-tight">{instructions}</p>
              </div>
            </div>

            {/* Lot, BUD & Barcode Area */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <div className="space-y-0.5 text-[10px] text-slate-600">
                <div>تشغيلة (Lot): <span className="font-mono font-bold">{lotNumber}</span></div>
                <div>صلاحية / BUD: <span className="font-mono font-bold text-rose-700">{expiryDate}</span></div>
                <div>صُرف بواسطة: <span className="font-medium">{dispense?.dispensedBy || 'الصيدلي المناوب'}</span></div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center">
                <div className="bg-slate-900 text-white p-1.5 rounded inline-block">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                  *{order?.id || 'RX-000'}*
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>مطابق لمعايير التوثيق المعتمدة لسلامة الأدوية</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              إغلاق المعاينة
            </button>
            <button
              onClick={() => {
                alert('محاكاة: تم إرسال أمر الطباعة إلى طابعة ملصقات الصيدلية (Mock Printer Command).');
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الملصق (Simulated Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
