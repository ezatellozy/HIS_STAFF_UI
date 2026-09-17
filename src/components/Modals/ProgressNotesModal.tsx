import React from 'react';
import { X, FileText, User, Heart, ShieldAlert, GitFork } from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { ProgressNotesManager } from '../ClinicalNotes/ProgressNotesManager';

interface ProgressNotesModalProps {
  isOpen: boolean;
  patientId: string | null;
  onClose: () => void;
}

export const ProgressNotesModal: React.FC<ProgressNotesModalProps> = ({
  isOpen,
  patientId,
  onClose
}) => {
  const { patients, openLifecycleModal } = useHis();

  if (!isOpen || !patientId) return null;

  const patient = patients.find(p => p.id === patientId);
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">سجل الملاحظات السريرية (Clinical Progress Notes)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-900 text-teal-300 font-mono text-xs font-bold">
                  {patient.mrn}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span className="text-white font-semibold">{patient.fullNameAr}</span>
                <span>•</span>
                <span>{patient.age} سنة / {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                <span>•</span>
                <span>فصيلة: <strong className="text-red-400">{patient.bloodType}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                openLifecycleModal(patient.id);
              }}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="عرض مسار ودورة المريض السريرية الشاملة"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>دورة المريض</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <ProgressNotesManager patientId={patient.id} />
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span>نظام التوثيق السريري الموحد EMR</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">متوافق مع معايير CBAHI و JCI</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
