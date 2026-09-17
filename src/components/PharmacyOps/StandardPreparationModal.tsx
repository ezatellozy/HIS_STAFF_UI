import React, { useState } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  Barcode,
  Printer,
  Calendar,
  Layers,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { MedicationOrderContext } from '../../types/pharmacyOps';

interface StandardPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: MedicationOrderContext | null;
  onCompletePreparation: (orderId: string, lot: string, expiry: string, preparedQty: number) => void;
  onOpenLabelPreview: (order: MedicationOrderContext) => void;
}

export const StandardPreparationModal: React.FC<StandardPreparationModalProps> = ({
  isOpen,
  onClose,
  order,
  onCompletePreparation,
  onOpenLabelPreview
}) => {
  const [lotNumber, setLotNumber] = useState(order?.stockContext.batchLot || 'LOT-2026-91');
  const [expiryDate, setExpiryDate] = useState(order?.stockContext.expiryDate || '12/2027');
  const [preparedQuantity, setPreparedQuantity] = useState(order?.totalQuantityOrdered || 1);
  const [barcodeVerified, setBarcodeVerified] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  if (!isOpen || !order) return null;

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      setBarcodeVerified(true);
    }, 600);
  };

  const handleFinish = () => {
    onCompletePreparation(order.id, lotNumber, expiryDate, preparedQuantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">تجهيز وتحضير الدواء القياسي (Standard Dispensing Preparation)</h3>
              <p className="text-[11px] text-slate-300">
                مطابقة العبوة، وتوثيق رقم التشغيلة وتاريخ الصلاحية، والتحقق من الباركود
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Order Snapshot */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{order.brandName}</span>
              <span className="text-slate-500 font-mono text-xs">{order.genericName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
              <div>الجرعة: <strong>{order.orderedDose}</strong></div>
              <div>الشكل: <strong>{order.dosageForm}</strong></div>
              <div>طريقة الإعطاء: <strong>{order.route}</strong></div>
            </div>
            <div className="text-[11px] text-slate-600">
              المريض: <strong>{order.patientName}</strong> ({order.mrn}) • الموقع: <strong>{order.locationWardBed}</strong>
            </div>
          </div>

          {/* Lot & Expiry Confirmation */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>بيانات التشغيلة والصلاحية للعبوة المنتقاة:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">رقم التشغيلة (Batch / Lot Number):</label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={e => setLotNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">تاريخ انتهاء الصلاحية (Expiry Date):</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">الكمية المجهزة للجرعات:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={order.totalQuantityOrdered}
                  value={preparedQuantity}
                  onChange={e => setPreparedQuantity(Number(e.target.value))}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <span className="text-slate-500 text-xs">{order.quantityUnit} من إجمالي {order.totalQuantityOrdered} المطلوبة</span>
              </div>
            </div>
          </div>

          {/* Barcode Verification Simulation */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-800 text-xs">التحقق من الباركود الدوائي (Barcode Verification Mock):</span>
              </div>
              {barcodeVerified ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>تمت المطابقة (Barcode Verified)</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  بانتظار المسح
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              مطابقة الكود الشريطي للعبوة الفعلية مع الكود المسجل في ملف الطلب لمنع أخطاء الصرف.
            </p>
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={isSimulatingScan || barcodeVerified}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                barcodeVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-xs cursor-pointer'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>{isSimulatingScan ? 'جارٍ فحص الباركود...' : barcodeVerified ? 'الباركود مطابق بنجاح (GTIN Match Confirmed)' : 'محاكاة مسح الباركود (Simulate Barcode Scan)'}</span>
            </button>
          </div>

          {/* Label Preview Shortcut */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-200">
            <div className="text-[11px] text-teal-900">
              <span className="font-bold block">ملصق الجرعة الدوائية جاهز:</span>
              <span>يمكنك معاينة الملصق والتعليمات قبل إنهاء التحضير.</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenLabelPreview(order)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>معاينة الملصق</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اكتمال التحضير والانتقال للتدقيق النهائي (Complete Prep)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
