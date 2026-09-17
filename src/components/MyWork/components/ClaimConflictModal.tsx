import React from 'react';
import {
  AlertTriangle,
  RefreshCw,
  User,
  X
} from 'lucide-react';
import { WorkItemRecord } from '../../../types/clinicalWorkItems';

interface ClaimConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WorkItemRecord | null;
  onResolve: () => void;
}

export const ClaimConflictModal: React.FC<ClaimConflictModalProps> = ({
  isOpen,
  onClose,
  item,
  onResolve
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo',sans-serif] animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-amber-300 overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
            <h3 className="text-sm font-black">تعارض في استلام الإجراء (Claim Conflict Detected)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-amber-100 hover:text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <p className="text-slate-700 leading-relaxed font-semibold">
            عذراً، أثناء محاولتك استلام هذا الإجراء، قام زميل سريري آخر في الفريق باستلامه من الطابور:
          </p>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <User className="w-4 h-4 text-amber-700" />
              <span>مستلم الإجراء الحالي: <strong>د. أحمد الشريف (استشاري الجراحة المناوب)</strong></span>
            </div>
            <div className="text-[11px] text-amber-800 font-mono">
              توقيت الاستلام: 10:48 AM (منذ لحظات)
            </div>
          </div>

          <div className="text-slate-500 text-[11px] leading-relaxed">
            تم تحديث حالة هذا الإجراء تلقائياً إلى <strong>قيد الإجراء (Claimed)</strong> لمنع تكرار أو تعارض العمل السريري على نفس المريض.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              إبقاء التفاصيل مفتوحة
            </button>
            <button
              type="button"
              onClick={onResolve}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث القائمة والعودة للطابور</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
