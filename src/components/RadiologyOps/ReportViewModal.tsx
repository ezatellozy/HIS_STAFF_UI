import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Plus,
  ExternalLink,
  Printer,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  RadiologyReport,
  ReportAddendum
} from '../../types/radiologyOps';

interface ReportViewModalProps {
  report: RadiologyReport;
  onAddAddendum: (reportId: string, reason: string, addendumText: string) => void;
  onDeepLinkAxis7?: (patientId: string, studyId: string) => void;
  onClose: () => void;
}

export const ReportViewModal: React.FC<ReportViewModalProps> = ({
  report,
  onAddAddendum,
  onDeepLinkAxis7,
  onClose
}) => {
  const [showAddendumForm, setShowAddendumForm] = useState(false);
  const [reason, setReason] = useState('');
  const [addendumText, setAddendumText] = useState('');

  const handleSaveAddendum = () => {
    if (!reason.trim() || !addendumText.trim()) return;
    onAddAddendum(report.id, reason.trim(), addendumText.trim());
    setShowAddendumForm(false);
    setReason('');
    setAddendumText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>تقرير الفحص الشعاعي التشخيصي (Diagnostic Radiology Report)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  report.reportStatus === 'final'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {report.reportStatus === 'final' ? 'تقرير نهائي معتمد (Final)' : 'تقرير أولي مبدئي (Preliminary)'}
                </span>
                {report.addenda.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    معدل بملحق (Amended v{report.versionNumber})
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-300">
                {report.patientName} • MRN: {report.mrn} • رقم التقرير: {report.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provenance Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 text-[11px] block">الموداليتي والفحص:</span>
            <strong className="text-slate-900 font-bold">{report.examTitleAr}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">طبيب الأشعة المفسر:</span>
            <strong className="text-slate-900">{report.signedBy}</strong>
            <span className="text-[10px] text-slate-500 block">{report.signedRole}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">تاريخ ووقت الاعتماد:</span>
            <strong className="text-slate-900 font-mono">{report.signedAt}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">إصدار التقرير (Version):</span>
            <strong className="text-slate-900 font-mono">الإصدار {report.versionNumber}</strong>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto text-xs leading-relaxed">
          {/* Section: Indication & Technique */}
          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-xs block">المؤشر السريري (Clinical Indication):</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              {report.clinicalIndication}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-xs block">الفحوصات السابقة (Comparison):</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              {report.comparisonStudyContext}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-xs block">التقنية الفنية (Technique):</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              {report.techniqueNarrative}
            </p>
          </div>

          {/* Section: Findings */}
          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-xs block">الموجودات الشعاعية (Findings):</span>
            <div className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 whitespace-pre-line font-sans">
              {report.findingsNarrative}
            </div>
          </div>

          {/* Section: Impression */}
          <div className="space-y-1">
            <span className="font-bold text-teal-950 text-xs block">الخلاصة والتشخيص (Impression):</span>
            <div className="text-teal-950 bg-teal-50/50 p-3.5 rounded-xl border border-teal-200 whitespace-pre-line font-semibold">
              {report.impressionNarrative}
            </div>
          </div>

          {/* Section: Recommendations */}
          {report.recommendations && (
            <div className="space-y-1">
              <span className="font-bold text-slate-900 text-xs block">التوصيات (Recommendations):</span>
              <p className="text-slate-800 bg-amber-50/40 p-2.5 rounded-xl border border-amber-200 font-medium">
                {report.recommendations}
              </p>
            </div>
          )}

          {/* Addenda List (Amendments Provenance) */}
          {report.addenda.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" />
                <span>سجل الملاحق والتعديلات الموثقة (Amendments & Addenda Provenance):</span>
              </h4>
              <div className="space-y-2">
                {report.addenda.map(add => (
                  <div
                    key={add.id}
                    className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-purple-900 font-bold">
                      <span>إضافة ملحق بواسطة: {add.authorName} ({add.authorRole})</span>
                      <span className="font-mono">{add.amendedAt}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>سبب التعديل: </strong>{add.reasonForAmendment}
                    </div>
                    <div className="text-slate-800 font-medium pt-1 border-t border-purple-200/60">
                      {add.addendumText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addendum Form */}
          {showAddendumForm && (
            <div className="p-4 rounded-xl border border-purple-300 bg-purple-50/40 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-purple-950">إضافة ملحق أو تصحيح سريري رسمي (Add Report Addendum):</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-700 font-medium block mb-1">سبب الملحق / التصحيح:</label>
                  <input
                    type="text"
                    placeholder="مثال: إضافة توضيح لموقع القسطرة استجابة لاستفسار الطبيب المعالج..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-700 font-medium block mb-1">نص الملحق الإضافي:</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب التوضيح أو التصحيح الإضافي هنا..."
                    value={addendumText}
                    onChange={e => setAddendumText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddendumForm(false)}
                    className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddendum}
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    حفظ ونشر الملحق رسميًا
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {!showAddendumForm && (
              <button
                onClick={() => setShowAddendumForm(true)}
                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة ملحق للتقرير (Add Addendum)</span>
              </button>
            )}

            {onDeepLinkAxis7 && (
              <button
                onClick={() => onDeepLinkAxis7(report.patientId, report.studyId)}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-teal-200"
              >
                <span>عرض في نتائج المريض Axis 7</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
