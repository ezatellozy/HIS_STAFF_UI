import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export type ClinicalDialogSeverity = 'warning' | 'error' | 'info' | 'critical';

export interface ClinicalActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  severity?: ClinicalDialogSeverity;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  technicalDetails?: string;
}

export const ClinicalActionDialog: React.FC<ClinicalActionDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  severity = 'warning',
  confirmLabel = 'فهمت ذلك (موافق)',
  cancelLabel,
  onConfirm,
  technicalDetails
}) => {
  if (!isOpen) return null;

  const getSeverityStyling = () => {
    switch (severity) {
      case 'critical':
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
          confirmBtnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
          borderClass: 'border-rose-200',
          bgHeader: 'bg-rose-50/70'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
          confirmBtnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          borderClass: 'border-amber-200',
          bgHeader: 'bg-amber-50/70'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-teal-600" />,
          badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
          confirmBtnClass: 'bg-teal-600 hover:bg-teal-700 text-white',
          borderClass: 'border-teal-200',
          bgHeader: 'bg-teal-50/70'
        };
    }
  };

  const style = getSeverityStyling();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`bg-white rounded-2xl max-w-md w-full shadow-2xl border ${style.borderClass} overflow-hidden animate-in zoom-in-95 duration-150`}>
        {/* Header */}
        <div className={`p-4 ${style.bgHeader} border-b border-slate-200/80 flex items-start justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-white shadow-xs">
              {style.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
              <span className="text-[10px] text-slate-500 font-mono">Clinical Policy & Safety Dialog</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-800">{message}</p>
          
          {technicalDetails && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600">
              {technicalDetails}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          {cancelLabel && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${style.confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
