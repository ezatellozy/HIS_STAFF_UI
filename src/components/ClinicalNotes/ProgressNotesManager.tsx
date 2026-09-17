import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Filter,
  Search,
  User,
  Clock,
  Building2,
  Stethoscope,
  HeartPulse,
  Pill,
  Sparkles,
  BookmarkPlus,
  Check,
  X,
  ChevronDown,
  Trash2,
  Copy,
  Printer,
  Edit3,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { ProgressNote, ProgressNoteTemplate, ClinicalNoteRole, ProgressNoteType } from '../../types/his';

interface ProgressNotesManagerProps {
  patientId: string;
  defaultRoleFilter?: ClinicalNoteRole | 'all';
  compactMode?: boolean;
}

export const ProgressNotesManager: React.FC<ProgressNotesManagerProps> = ({
  patientId,
  defaultRoleFilter = 'all',
  compactMode = false
}) => {
  const {
    currentStaff,
    patients,
    progressNotes,
    noteTemplates,
    addProgressNote,
    saveNoteTemplate,
    deleteNoteTemplate
  } = useHis();

  const patient = patients.find(p => p.id === patientId);

  // Filter States
  const [roleFilter, setRoleFilter] = useState<ClinicalNoteRole | 'all'>(defaultRoleFilter);
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteTypeFilter, setSelectedNoteTypeFilter] = useState<string>('all');

  // Writing Mode States
  const [isWritingNote, setIsWritingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState<ProgressNoteType>('soap');
  const [noteContent, setNoteContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Save as Template Modal State
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [newTemplateTitleAr, setNewTemplateTitleAr] = useState('');
  const [newTemplateTitleEn, setNewTemplateTitleEn] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<ClinicalNoteRole | 'general'>('doctor');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [templateSavedSuccess, setTemplateSavedSuccess] = useState(false);

  // All notes for this patient
  const patientNotes = useMemo(() => {
    return progressNotes.filter(n => n.patientId === patientId);
  }, [progressNotes, patientId]);

  // Unique authors for filter
  const uniqueAuthors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; roleTitle: string }>();
    patientNotes.forEach(n => {
      if (!map.has(n.authorId)) {
        map.set(n.authorId, {
          id: n.authorId,
          name: n.authorName,
          roleTitle: n.authorRoleTitleAr
        });
      }
    });
    return Array.from(map.values());
  }, [patientNotes]);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return patientNotes.filter(note => {
      // Role filter
      if (roleFilter !== 'all' && note.authorRole !== roleFilter) {
        return false;
      }
      // Author filter
      if (selectedAuthorFilter !== 'all' && note.authorId !== selectedAuthorFilter) {
        return false;
      }
      // Type filter
      if (selectedNoteTypeFilter !== 'all' && note.noteType !== selectedNoteTypeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesAuthor = note.authorName.toLowerCase().includes(q);
        const matchesDept = note.department.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesDept) {
          return false;
        }
      }
      return true;
    });
  }, [patientNotes, roleFilter, selectedAuthorFilter, selectedNoteTypeFilter, searchQuery]);

  // Role Counts for Tabs
  const doctorNotesCount = patientNotes.filter(n => n.authorRole === 'doctor').length;
  const nurseNotesCount = patientNotes.filter(n => n.authorRole === 'nurse').length;
  const pharmacyNotesCount = patientNotes.filter(n => n.authorRole === 'pharmacy' || n.authorRole === 'allied').length;

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    if (!templateId) {
      setSelectedTemplateId('');
      return;
    }
    const tpl = noteTemplates.find(t => t.id === templateId);
    if (tpl) {
      setSelectedTemplateId(templateId);
      setNoteTitle(tpl.titleAr);
      setNoteType(tpl.defaultNoteType);
      setNoteContent(tpl.content);
    }
  };

  // Handle clear to write from scratch
  const handleWriteFromScratch = () => {
    setSelectedTemplateId('');
    setNoteTitle('ملاحظة سريرية عامة');
    setNoteType('general');
    setNoteContent('');
    setIsWritingNote(true);
  };

  // Submit new progress note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !patientId) return;

    // Determine author role based on current logged in staff
    const authorRole: ClinicalNoteRole =
      currentStaff.role === 'doctor'
        ? 'doctor'
        : currentStaff.role === 'nurse'
        ? 'nurse'
        : currentStaff.role === 'pharmacy'
        ? 'pharmacy'
        : 'doctor';

    addProgressNote({
      patientId,
      authorId: currentStaff.id,
      authorName: currentStaff.name,
      authorRole,
      authorRoleTitleAr: currentStaff.title || (authorRole === 'doctor' ? 'طبيب معالج' : 'أخصائي تمريض'),
      department: currentStaff.department || 'العيادات الخارجية',
      title: noteTitle.trim() || 'ملاحظة سريرية',
      noteType,
      content: noteContent.trim()
    });

    // Reset writing state
    setIsWritingNote(false);
    setNoteTitle('');
    setNoteContent('');
    setSelectedTemplateId('');
  };

  // Handle save current text as custom template
  const handleSaveAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitleAr.trim() || !noteContent.trim()) return;

    saveNoteTemplate({
      titleAr: newTemplateTitleAr.trim(),
      titleEn: newTemplateTitleEn.trim() || newTemplateTitleAr.trim(),
      category: newTemplateCategory,
      defaultNoteType: noteType,
      descriptionAr: newTemplateDesc.trim() || 'قالب سريري مخصص محفوظ بواسطة الكادر الطبي',
      content: noteContent.trim(),
      createdBy: currentStaff.name
    });

    setTemplateSavedSuccess(true);
    setTimeout(() => {
      setTemplateSavedSuccess(false);
      setIsSaveTemplateOpen(false);
      setNewTemplateTitleAr('');
      setNewTemplateTitleEn('');
      setNewTemplateDesc('');
    }, 1200);
  };

  const copyNoteToClipboard = (note: ProgressNote) => {
    const text = `[${note.title}]\nالكاتب: ${note.authorName} (${note.authorRoleTitleAr})\nالتاريخ: ${note.timestamp}\nالقسم: ${note.department}\n\n${note.content}`;
    navigator.clipboard.writeText(text);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 1800);
  };

  const getRoleBadge = (role: ClinicalNoteRole) => {
    switch (role) {
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <Stethoscope className="w-3 h-3 text-teal-600" />
            <span>طبيب (Doctor)</span>
          </span>
        );
      case 'nurse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <HeartPulse className="w-3 h-3 text-blue-600" />
            <span>تمريض (Nurse)</span>
          </span>
        );
      case 'pharmacy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Pill className="w-3 h-3 text-purple-600" />
            <span>صيدلة سريرية (Pharmacy)</span>
          </span>
        );
      case 'allied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Layers className="w-3 h-3 text-amber-600" />
            <span>علاج طبيعي وتأهيل</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Top Header & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>الملاحظات السريرية وسير الحالة (Progress Notes)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            توثيق متكامل متعدد التخصصات (أطباء، تمريض، صيدلة سريرية) مع قوالب جاهزة وإمكانية حفظ قوالب مخصصة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isWritingNote ? (
            <button
              onClick={() => {
                setIsWritingNote(true);
                handleSelectTemplate(noteTemplates[0]?.id || '');
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>كتابة ملاحظة جديدة</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWritingNote(false)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>إلغاء التحرير</span>
            </button>
          )}
        </div>
      </div>

      {/* Writing / Editing Form */}
      {isWritingNote && (
        <form onSubmit={handleSaveNote} className="bg-slate-50 border-2 border-teal-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
              <span className="font-bold text-sm text-slate-900">تحرير ملاحظة سريرية جديدة:</span>
              <span className="text-xs text-slate-500">الكاتب الحالي: <strong>{currentStaff.name}</strong> ({currentStaff.title})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWriteFromScratch}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                title="مسح الحقول للبدء من صفحة بيضاء"
              >
                صفحة بيضاء (من الصفر)
              </button>
            </div>
          </div>

          {/* Template Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>اختر قالباً جاهزاً لتعبئة الملاحظة (Clinical Template):</span>
                </span>
                {selectedTemplateId && (
                  <span className="text-[11px] text-teal-700 font-semibold">
                    تم تطبيق القالب بنجاح
                  </span>
                )}
              </label>
              <select
                value={selectedTemplateId}
                onChange={e => handleSelectTemplate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">-- اختيار قالب سريري جاهز --</option>
                {noteTemplates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.isCustom ? '⭐ [قالب مخصص] ' : '📋 '}
                    {tpl.titleAr} ({tpl.category === 'doctor' ? 'طبيب' : tpl.category === 'nurse' ? 'تمريض' : tpl.category === 'pharmacy' ? 'صيدلة' : 'عام'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع الملاحظة (Classification):
              </label>
              <select
                value={noteType}
                onChange={e => setNoteType(e.target.value as ProgressNoteType)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800"
              >
                <option value="soap">SOAP Clinical Note</option>
                <option value="ward_round">Ward Round Note (مرور)</option>
                <option value="sbar">Nursing SBAR (تسليم وردية)</option>
                <option value="procedure">Post-Procedure (إجراء/عملية)</option>
                <option value="pharmacy">Clinical Pharmacy (صيدلة)</option>
                <option value="discharge">Discharge Summary (خروج)</option>
                <option value="general">ملاحظة عامة (General)</option>
              </select>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان أو موضوع الملاحظة السريرية:
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={e => setNoteTitle(e.target.value)}
              placeholder="مثال: تقييم سريري واستشارة قلبية، مرور الصباح، تسليم وردية..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Note Editor Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                محتوى الملاحظة السريرية (Progress Note Content):
              </label>
              <button
                type="button"
                onClick={() => setIsSaveTemplateOpen(true)}
                disabled={!noteContent.trim()}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                title="حفظ هذا النص كقالب جديد للاستخدام المستقبلي"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>حفظ النص الحالي كقالب جديد (Save as Template)</span>
              </button>
            </div>
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              rows={8}
              dir="auto"
              placeholder="اكتب التقييم والملاحظات السريرية وخطة العلاج هنا..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              سيتم تسجيل الملاحظة تلقائياً مع ختم الوقت، اسم المحرر ({currentStaff.name}) والقسم الطبي.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWritingNote(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!noteContent.trim()}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ الملاحظة في ملف المريض</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Save as Template Inline Modal Dialog */}
      {isSaveTemplateOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-900">حفظ النص كقالب سريري جديد (Save as Template)</h4>
              </div>
              <button
                onClick={() => setIsSaveTemplateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {templateSavedSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-emerald-900 text-sm">تم حفظ القالب بنجاح!</div>
                <p className="text-xs text-emerald-700">القالب متاح الآن لك ولكافة زملائك في قائمة القوالب السريرية.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveAsTemplate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم القالب بالعربية (Template Title): *
                  </label>
                  <input
                    type="text"
                    value={newTemplateTitleAr}
                    onChange={e => setNewTemplateTitleAr(e.target.value)}
                    placeholder="مثال: فحص دوري لمريض سكر وقدم سكري، متابعة أطفال..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      الفئة والتخصص (Category):
                    </label>
                    <select
                      value={newTemplateCategory}
                      onChange={e => setNewTemplateCategory(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-slate-300 font-semibold"
                    >
                      <option value="doctor">الأطباء (Doctor)</option>
                      <option value="nurse">التمريض (Nurse)</option>
                      <option value="pharmacy">الصيدلة (Pharmacy)</option>
                      <option value="allied">العلاج الطبيعي (Allied Health)</option>
                      <option value="general">عام للجميع (General)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      اسم القالب بالإنجليزية (اختياري):
                    </label>
                    <input
                      type="text"
                      value={newTemplateTitleEn}
                      onChange={e => setNewTemplateTitleEn(e.target.value)}
                      placeholder="e.g. Diabetic Foot Protocol"
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    وصف مختصر متى يُستخدم هذا القالب:
                  </label>
                  <input
                    type="text"
                    value={newTemplateDesc}
                    onChange={e => setNewTemplateDesc(e.target.value)}
                    placeholder="مثال: يطبق في عيادة السكر عند الكشف عن الاعتلال العصبي المحيطي"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">معاينة النص المحفوظ:</span>
                  <div className="font-mono text-[11px] text-slate-700 line-clamp-3 bg-white p-2 rounded border border-slate-200">
                    {noteContent}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSaveTemplateOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>تأكيد وحفظ القالب</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FILTER TABS & SEARCH BAR (Crucial for User Request) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3">
        {/* Role Tabs: All, Doctors, Nurses, Pharmacy */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>الكل (All Notes)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${roleFilter === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>
                {patientNotes.length}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter('doctor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                roleFilter === 'doctor'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>ملاحظات الأطباء فقط</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${roleFilter === 'doctor' ? 'bg-teal-800 text-teal-100' : 'bg-teal-100 text-teal-700'}`}>
                {doctorNotesCount}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter('nurse')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                roleFilter === 'nurse'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>ملاحظات التمريض فقط</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${roleFilter === 'nurse' ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-700'}`}>
                {nurseNotesCount}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter('pharmacy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                roleFilter === 'pharmacy'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>الصيدلة والعلاج الطبيعي</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${roleFilter === 'pharmacy' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'}`}>
                {pharmacyNotesCount}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            عرض {filteredNotes.length} من أصل {patientNotes.length} ملاحظة
          </div>
        </div>

        {/* Secondary Filter: By Specific Author & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Author Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-500" />
              <span>تصفية حسب كاتب الملاحظة (Author):</span>
            </label>
            <select
              value={selectedAuthorFilter}
              onChange={e => setSelectedAuthorFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800"
            >
              <option value="all">جميع الكُتّاب (All Authors)</option>
              {uniqueAuthors.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.roleTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Note Type Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-500" />
              <span>نوع الملاحظة (Note Type):</span>
            </label>
            <select
              value={selectedNoteTypeFilter}
              onChange={e => setSelectedNoteTypeFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800"
            >
              <option value="all">جميع الأنواع</option>
              <option value="soap">SOAP Clinical Note</option>
              <option value="ward_round">Daily Ward Round</option>
              <option value="sbar">Nursing SBAR</option>
              <option value="pharmacy">Clinical Pharmacy</option>
              <option value="procedure">Post-Procedure</option>
              <option value="discharge">Discharge Summary</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-500" />
              <span>بحث بالنص أو المحتوى:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث في الأعراض، التشخيص، الأدوية..."
                className="w-full p-2 pr-2 pl-8 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NOTES TIMELINE LIST */}
      <div className="space-y-3">
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow overflow-hidden"
            >
              {/* Note Header */}
              <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    note.authorRole === 'doctor'
                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                      : note.authorRole === 'nurse'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {note.authorRole === 'doctor' ? <Stethoscope className="w-4 h-4" /> : note.authorRole === 'nurse' ? <HeartPulse className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900">{note.title}</h4>
                      {getRoleBadge(note.authorRole)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 text-slate-700">
                        {note.noteType.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-700">{note.authorName}</span>
                      <span>•</span>
                      <span>{note.authorRoleTitleAr}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {note.department}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right text-xs text-slate-500 font-mono flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{note.timestamp}</span>
                  </div>

                  <button
                    onClick={() => copyNoteToClipboard(note)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                    title="نسخ الملاحظة إلى الحافظة"
                  >
                    {copiedNoteId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Note Content Body with Smart Highlighting */}
              <div className="p-4 sm:p-5 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-white select-text">
                {note.content}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-700 text-sm">لا توجد ملاحظات تطابق معايير التصفية الحالية</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              يمكنك تغيير دور المحرر (الكل / طبيب / تمريض) أو مسح كلمة البحث، أو كتابة ملاحظة سريرية جديدة للمريض.
            </p>
            <button
              onClick={() => {
                setRoleFilter('all');
                setSelectedAuthorFilter('all');
                setSelectedNoteTypeFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Available Templates Drawer / Gallery */}
      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>القوالب السريرية المتاحة في النظام ({noteTemplates.length} قوالب):</span>
          </span>
          <span className="text-[11px] text-slate-500">
            يمكنك استخدام أي قالب أو كتابة قالب جديد وحفظه
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {noteTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-400 transition-colors flex flex-col justify-between text-xs space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <strong className="text-slate-900 font-bold text-xs line-clamp-1">{tpl.titleAr}</strong>
                  {tpl.isCustom && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                      مخصص
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {tpl.descriptionAr}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono">
                  {tpl.category === 'doctor' ? '🩺 طبيب' : tpl.category === 'nurse' ? '💉 تمريض' : tpl.category === 'pharmacy' ? '💊 صيدلة' : '🌐 عام'}
                </span>
                <div className="flex items-center gap-1.5">
                  {tpl.isCustom && (
                    <button
                      onClick={() => deleteNoteTemplate(tpl.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="حذف القالب المخصص"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsWritingNote(true);
                      handleSelectTemplate(tpl.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[10px] rounded transition-colors"
                  >
                    استخدام القالب
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
