import React, { useState } from 'react';
import {
  FileText,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  PlusCircle,
  Edit,
  XCircle,
  Copy,
  Printer,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ClinicalNoteRecord } from '../../../types/clinicalNotesDocumentation';

interface NoteDetailDrawerProps {
  note: ClinicalNoteRecord | null;
  onClose: () => void;
  onAddAddendum: (note: ClinicalNoteRecord) => void;
  onAmend: (note: ClinicalNoteRecord) => void;
  onMarkError: (note: ClinicalNoteRecord) => void;
}

export const NoteDetailDrawer: React.FC<NoteDetailDrawerProps> = ({
  note,
  onClose,
  onAddAddendum,
  onAmend,
  onMarkError
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleCopy = () => {
    const text = `[${note.titleAr}]\nالمريض: ${note.patientId}\nالكاتب: ${note.author.name} (${note.author.roleLabelAr})\nالتاريخ: ${note.documentedAt}\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'final_signed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>معتمد وموقع رسمياً (Final / Signed)</span>
          </span>
        );
      case 'amended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Edit className="w-3.5 h-3.5 text-amber-600" />
            <span>معدل ومصحح رسمياً (Amended / Version {note.version})</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>مسودة قيد التحرير (Draft)</span>
          </span>
        );
      case 'entered_in_error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>ملغى وموسوم كخطأ إدخال (Entered in Error)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col border-r border-slate-200 overflow-hidden animate-in slide-in-from-left duration-300">
        
        {/* Top Action Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">{note.titleAr}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                  {note.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">{note.titleEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="نسخ نص الملاحظة"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Note Provenance & Metadata Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {getStatusBadge(note.state)}

            {note.coSignRequirement === 'required_pending' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>يتطلب اعتماد وتوقيع الاستشاري المشرف (Co-sign Pending)</span>
              </span>
            )}

            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span className="font-mono">النسخة v{note.version}</span>
              {note.versionHistory.length > 1 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>سجل التعديلات ({note.versionHistory.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Detailed Provenance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block">الموثق والكاتب:</span>
              <span className="font-bold text-slate-900">{note.author.name}</span>
              <span className="text-[10px] text-slate-600 block">{note.author.roleLabelAr}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">التخصص والقسم:</span>
              <span className="font-bold text-slate-800">{note.author.specialty}</span>
              <span className="text-[10px] text-slate-600 block">{note.author.department}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">وقت التوثيق والتسجيل:</span>
              <span className="font-bold text-slate-800 font-mono">{note.documentedAt}</span>
              <span className="text-[10px] text-slate-500 block">لقاء: {note.encounterId}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">حالة التوقيع الرقمي:</span>
              {note.signedAt ? (
                <span className="font-bold text-emerald-700 block">
                  موقع في {note.signedAt}
                </span>
              ) : (
                <span className="font-bold text-slate-500">غير موقع بعد</span>
              )}
              {note.signedBy && (
                <span className="text-[10px] text-slate-600 block truncate" title={note.signedBy}>
                  بواسطة: {note.signedBy}
                </span>
              )}
            </div>
          </div>

          {/* Amendment Reason Banner if amended */}
          {note.state === 'amended' && note.amendmentReason && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>سبب التعديل والتصحيح السريري:</strong> {note.amendmentReason}
                <div className="text-[10px] text-amber-800 mt-0.5">
                  تم التعديل بواسطة: {note.amendedBy} في {note.amendedAt}
                </div>
              </div>
            </div>
          )}

          {/* Entered in error reason if marked in error */}
          {note.state === 'entered_in_error' && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-[11px] flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>تم وسم هذا المستند كخطأ إدخال (Entered in Error):</strong> {note.errorReason || 'تم الإلغاء بواسطة الطبيب المعالج.'}
                <div className="text-[10px] text-red-700 mt-0.5">
                  أُلغي في: {note.enteredInErrorAt} بواسطة: {note.enteredInErrorBy}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Version History Collapsible Box */}
          {showHistory && (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <History className="w-4 h-4 text-teal-700" />
                  <span>سجل النسخ والتعديلات الزمنية للمستند</span>
                </h4>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {note.versionHistory.map(v => (
                  <div key={v.versionNumber} className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1">
                      <span>النسخة v{v.versionNumber} ({v.state})</span>
                      <span className="font-mono text-slate-500">{v.savedAt}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      حفظ بواسطة: <strong className="text-slate-700">{v.savedBy}</strong>
                      {v.changeReason && (
                        <div className="mt-1 text-amber-800 bg-amber-50 p-1.5 rounded">
                          السبب: {v.changeReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note Main Content */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              نص التوثيق والتقرير السريري
            </h4>

            <div
              className={`p-4 rounded-2xl border text-slate-900 text-sm leading-relaxed whitespace-pre-line font-sans ${
                note.state === 'entered_in_error'
                  ? 'bg-red-50/50 border-red-200 line-through text-slate-500'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {note.content}
            </div>
          </div>

          {/* Referenced Data Provenance Tags */}
          {note.referencedClinicalData && (
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>بيانات سريرية مرجعية مدمجة:</strong> يحتوي هذا المستند على قراءات مستوردة من علامات المريض الحيوية أو قائمة مشكلاته.
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-200/70 font-bold text-teal-950">
                مرجع حي (Active Reference)
              </span>
            </div>
          )}

          {/* Addenda Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-teal-600" />
                <span>الملحقات التوثيقية المضافة لاحقاً (Addenda - {note.addenda.length})</span>
              </h4>

              {note.state !== 'entered_in_error' && (
                <button
                  onClick={() => onAddAddendum(note)}
                  className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>إضافة ملحق رسمي (Add Addendum)</span>
                </button>
              )}
            </div>

            {note.addenda.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                لم يتم إرفاق أي ملحقات إضافية بهذا التقرير.
              </p>
            ) : (
              <div className="space-y-3">
                {note.addenda.map(add => (
                  <div
                    key={add.id}
                    className="p-4 rounded-xl bg-teal-50/30 border border-teal-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-teal-100 pb-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <strong className="text-teal-900">{add.authorName}</strong>
                        <span className="text-teal-700">({add.authorRole} - {add.authorSpecialty})</span>
                      </div>
                      <span className="font-mono text-slate-500">{add.timestamp}</span>
                    </div>

                    <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line">
                      {add.content}
                    </p>

                    {add.reason && (
                      <div className="text-[10px] text-teal-800 font-medium pt-1">
                        سبب الإلحاق: {add.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {note.state !== 'entered_in_error' && (
              <>
                <button
                  onClick={() => onAmend(note)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>تعديل الملاحظة (Amend Note)</span>
                </button>

                <button
                  onClick={() => onMarkError(note)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>وسم كخطأ إدخال (Mark in Error)</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق العرض
          </button>
        </div>
      </div>
    </div>
  );
};
