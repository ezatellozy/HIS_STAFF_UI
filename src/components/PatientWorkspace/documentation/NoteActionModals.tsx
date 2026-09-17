import React, { useState } from 'react';
import { PlusCircle, Edit, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ClinicalNoteRecord, NoteAddendum } from '../../../types/clinicalNotesDocumentation';
import { useHis } from '../../../context/HisContext';

interface AddendumModalProps {
  note: ClinicalNoteRecord;
  onClose: () => void;
  onSave: (noteId: string, addendum: NoteAddendum) => void;
}

export const AddendumModal: React.FC<AddendumModalProps> = ({ note, onClose, onSave }) => {
  const { currentStaff, playChime } = useHis();
  const [content, setContent] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newAddendum: NoteAddendum = {
      id: `ADD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      authorId: currentStaff.id,
      authorName: currentStaff.name,
      authorRole: currentStaff.title || 'طبيب معالج',
      authorSpecialty: currentStaff.department || 'الطب السريري',
      content: content.trim(),
      signedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      reason: reason.trim() || 'تحديث سريري لاحق'
    };

    onSave(note.id, newAddendum);
    playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              إضافة ملحق توثيقي رسمي (Add Clinical Addendum)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
            ✕
          </button>
        </div>

        <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200 text-teal-900 text-xs">
          <strong>المستند المستهدف:</strong> {note.titleAr} ({note.id})
          <div className="text-[11px] text-teal-700 mt-0.5">
            الكاتب الأصلي: {note.author.name} • موقع في: {note.signedAt || note.documentedAt}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">سبب الإلحاق (Justification / Reason):</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثال: وصول نتائج الفحوصات الإضافية، تحديث قرار الفريق المعالج..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">نص الملحق التوثيقي (Addendum Text):</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب التحديث السريري المعتمد هنا..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>سيتم توقيع الملحق باسمك الحالي</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                اعتماد وتوقيع الملحق
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AmendNoteModalProps {
  note: ClinicalNoteRecord;
  onClose: () => void;
  onSave: (noteId: string, updatedContent: string, reason: string) => void;
}

export const AmendNoteModal: React.FC<AmendNoteModalProps> = ({ note, onClose, onSave }) => {
  const { playChime } = useHis();
  const [content, setContent] = useState(note.content);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !reason.trim()) return;

    onSave(note.id, content.trim(), reason.trim());
    playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              تعديل وتصحيح الملاحظة السريرية (Amend / Correct Note)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
            ✕
          </button>
        </div>

        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>تنبيه الأمان والمساءلة السريرية:</strong> لن يتم مسح النسخة الأصلية. سيتم حفظ النسخة الحالية كنسخة أرشيفية (v{note.version}) وإنشاء نسخة جديدة معدلة مع توثيق اسمك وتاريخ التعديل والسبب القانوني للتصحيح.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              السبب الإلزامي للتعديل أو التصحيح (Reason for Amendment): *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثال: تصحيح جرعة دوائية، استدراك نتيجة مختبر، توضيح فحص سريري..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">نص الملاحظة المعدل (Updated Content):</label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium leading-relaxed text-slate-900 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              اعتماد النسخة المعدلة (Save Amended Note)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MarkErrorModalProps {
  note: ClinicalNoteRecord;
  onClose: () => void;
  onConfirm: (noteId: string, errorReason: string) => void;
}

export const MarkErrorModal: React.FC<MarkErrorModalProps> = ({ note, onClose, onConfirm }) => {
  const { playChime } = useHis();
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onConfirm(note.id, reason.trim());
    playChime('alert');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              وسم التوثيق كخطأ إدخال (Mark Entered in Error)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
            ✕
          </button>
        </div>

        <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-red-900 text-xs space-y-1">
          <strong>إجراء حاسم:</strong> سيتم إيقاف الملاحظة ووضع خط شطب رسمي عليها وتظليلها باللون الأحمر مع الاحتفاظ بها في السجل للتدقيق الطبي القانوني.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              السبب الإلزامي لوسم المستند كخطأ (Mandatory Reason): *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثال: توثيق في ملف مريض خاطئ، تسجيل مكرر بالخطأ، إلخ..."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
            >
              تراجع
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              تأكيد وسم كخطأ إدخال
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
