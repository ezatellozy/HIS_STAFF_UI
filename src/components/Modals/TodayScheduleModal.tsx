import React from 'react';
import { X, Calendar, Ticket, CheckCircle, Clock } from 'lucide-react';
import { TodayBookingsView } from '../Shared/TodayBookingsView';
import { useHis } from '../../context/HisContext';

interface TodayScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookingModal?: () => void;
}

export const TodayScheduleModal: React.FC<TodayScheduleModalProps> = ({
  isOpen,
  onClose,
  onOpenBookingModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>جدول حجوزات ومواعيد اليوم الشامل (Master Daily Appointments)</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  ALL CLINICS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                استعراض ومتابعة حجوزات كافة العيادات التخصصية، تسجيل الحضور الفوري، ومراقبة تدفق المرضى
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <TodayBookingsView
            onOpenBookingModal={() => {
              onClose();
              if (onOpenBookingModal) onOpenBookingModal();
            }}
          />
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>تحديث حي للحجوزات وتذاكر الانتظار (Real-Time HIS Sync)</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
