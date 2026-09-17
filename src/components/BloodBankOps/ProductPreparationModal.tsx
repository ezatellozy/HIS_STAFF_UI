import React, { useState } from 'react';
import {
  X,
  Flame,
  Droplet,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { BloodProductUnit } from '../../types/bloodBankOps';

interface ProductPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: BloodProductUnit | null;
  onCompletePreparation: (unitId: string, prepType: 'irradiation' | 'thawing' | 'washing' | 'splitting') => void;
}

export const ProductPreparationModal: React.FC<ProductPreparationModalProps> = ({
  isOpen,
  onClose,
  unit,
  onCompletePreparation
}) => {
  if (!isOpen || !unit) return null;

  const [selectedTask, setSelectedTask] = useState<'irradiation' | 'thawing' | 'washing' | 'splitting'>(() => {
    if (unit.componentType === 'fresh_frozen_plasma' || unit.componentType === 'cryoprecipitate') {
      return 'thawing';
    }
    return 'irradiation';
  });

  const [technologistName, setTechnologistName] = useState('أخصائي مختبر بدر العتيبي');
  const [deviceIdentifier, setDeviceIdentifier] = useState('جهاز تشعيع الدم الراديولوجي IRRAD-01');

  const handleConfirm = () => {
    onCompletePreparation(unit.id, selectedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">تجهيز ومعالجة مشتق الدم (Product Preparation & Modification)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                التشعيع، الإذابة، الغسيل، وتجزئة الوحدات للأطفال وفق المعايير السريرية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Unit Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</div>
              <div className="text-xs text-slate-700 font-bold mt-0.5">{unit.componentNameAr}</div>
              <div className="text-[11px] text-slate-500">
                فصيلة: {unit.bloodGroup.displayAr} • حجم: {unit.volumeMl} mL
              </div>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-white border border-slate-200 font-bold text-slate-700">
              {unit.id}
            </span>
          </div>

          {/* Task Type Selector */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">نوع المعالجة المطلوبة:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTask('irradiation');
                  setDeviceIdentifier('جهاز تشعيع الدم IRRAD-01 (جرعة 25 Gy)');
                }}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedTask === 'irradiation'
                    ? 'border-amber-600 bg-amber-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>تشعيع المشتق (Irradiation)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  تعطيل الخلايا اللمفاوية لمنع مرض الطعم ضد المضيف (TA-GvHD) لمرضى الأورام والزراعة
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTask('thawing');
                  setDeviceIdentifier('حمام إذابة البلازما المائي THAW-02 عند 37°C');
                }}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedTask === 'thawing'
                    ? 'border-amber-600 bg-amber-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-600" />
                  <span>إذابة البلازما / الراسب (Thawing)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  إذابة سريعة عند 37°C وحساب فترة الصلاحية بعد الإذابة (24 ساعة عند 2-6°C)
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTask('washing');
                  setDeviceIdentifier('جهاز غسيل الكريات الآلي COBE 2991');
                }}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedTask === 'washing'
                    ? 'border-amber-600 bg-amber-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span>غسيل الكريات (Washing)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  إزالة بقايا البلازما وبروتينات المصل لمنع التحسس المفرط الشديد
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTask('splitting');
                  setDeviceIdentifier('جهاز الربط الأنبوبي المعقم TSCD-II');
                }}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  selectedTask === 'splitting'
                    ? 'border-amber-600 bg-amber-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>تجزئة وحدات الأطفال (Splitting)</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  توزيع الوحدة في نظام ربط معقم إلى حصص صغيرة مخصصة للخُدّج والأطفال
                </p>
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">الفني القائم بالمعالجة:</label>
              <input
                type="text"
                value={technologistName}
                onChange={e => setTechnologistName(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">الجهاز المعياري المستخدم:</label>
              <input
                type="text"
                value={deviceIdentifier}
                onChange={e => setDeviceIdentifier(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            سيتم تحديث ملصق الوحدة وسجل التتبع بحالة التجهيز الجديدة فوراً.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>إتمام وتوثيق المعالجة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
