import React from 'react';
import { AlertTriangle, Info, XCircle, RefreshCw } from 'lucide-react';

interface SourceChangedAlertProps {
  titleAr?: string;
  messageAr: string;
  type?: 'warning' | 'cancelled' | 'superseded' | 'info';
  onRefresh?: () => void;
}

export const SourceChangedAlert: React.FC<SourceChangedAlertProps> = ({
  titleAr = 'تنبيه سريري: تغيرت حالة المصدر الأصلي',
  messageAr,
  type = 'warning',
  onRefresh
}) => {
  const getColors = () => {
    switch (type) {
      case 'cancelled':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'superseded':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'warning':
      default:
        return 'bg-amber-50 border-amber-300 text-amber-900';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
      case 'superseded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed ${getColors()}`}>
      <div className="flex items-start gap-2.5">
        {getIcon()}
        <div>
          <h4 className="font-bold text-xs mb-0.5">{titleAr}</h4>
          <p className="opacity-90">{messageAr}</p>
        </div>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 font-bold border border-slate-200 text-[11px] shrink-0 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>تحديث</span>
        </button>
      )}
    </div>
  );
};
