import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit,
  XCircle,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { ClinicalNoteRecord, DocumentationCategory } from '../../../types/clinicalNotesDocumentation';

interface DocumentationFeedProps {
  notes: ClinicalNoteRecord[];
  onSelectNote: (note: ClinicalNoteRecord) => void;
  onAddAddendum: (note: ClinicalNoteRecord) => void;
  onAmendNote: (note: ClinicalNoteRecord) => void;
  onMarkError: (note: ClinicalNoteRecord) => void;
}

export const DocumentationFeed: React.FC<DocumentationFeedProps> = ({
  notes,
  onSelectNote,
  onAddAddendum,
  onAmendNote,
  onMarkError
}) => {
  const [roleFilter, setRoleFilter] = useState<'all' | 'physician' | 'nurse' | 'allied'>('all');
  const [categoryFilter, setCategoryFilter] = useState<DocumentationCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'amended' | 'draft' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Role filter
      if (roleFilter === 'physician' && !note.author.role.toLowerCase().includes('consultant') && !note.author.role.toLowerCase().includes('physician') && !note.author.role.toLowerCase().includes('doctor') && !note.author.roleLabelAr.includes('طبيب')) {
        return false;
      }
      if (roleFilter === 'nurse' && !note.author.role.toLowerCase().includes('nurse') && !note.author.roleLabelAr.includes('تمريض')) {
        return false;
      }
      if (roleFilter === 'allied' && (note.author.roleLabelAr.includes('طبيب') || note.author.roleLabelAr.includes('تمريض'))) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && note.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'signed' && note.state !== 'final_signed') return false;
      if (statusFilter === 'amended' && note.state !== 'amended') return false;
      if (statusFilter === 'draft' && note.state !== 'draft') return false;
      if (statusFilter === 'error' && note.state !== 'entered_in_error') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = note.titleAr.toLowerCase().includes(q) || note.titleEn.toLowerCase().includes(q);
        const matchAuthor = (note.author?.name || '').toLowerCase().includes(q) || (note.author?.specialty || '').toLowerCase().includes(q);
        const matchContent = note.content.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchContent) return false;
      }

      return true;
    });
  }, [notes, roleFilter, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Comprehensive Filters Rail */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Discipline Role Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كافة التخصصات ({notes.length})
            </button>
            <button
              onClick={() => setRoleFilter('physician')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'physician' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              توثيق الأطباء
            </button>
            <button
              onClick={() => setRoleFilter('nurse')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'nurse' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              توثيق التمريض
            </button>
            <button
              onClick={() => setRoleFilter('allied')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'allied' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المهن المساندة والصيدلة
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في الملاحظات، الكاتب، المحتوى..."
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Secondary Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
          <span className="font-bold text-slate-500">تصنيف الوثيقة:</span>
          
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as any)}
            className="p-1 px-2.5 rounded-lg border border-slate-200 font-bold bg-white text-slate-700"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="progress_note">ملاحظات تقدم يومية (Progress)</option>
            <option value="consultation_note">تقارير الاستشارات (Consult)</option>
            <option value="admission_note">ملاحظات التنويم (Admission)</option>
            <option value="operative_procedure_note">تقارير العمليات والإجراءات (Operative)</option>
            <option value="nursing_note">ملاحظات تمريضية (Nursing)</option>
            <option value="handover_note">تسليم واستلام SBAR</option>
          </select>

          <span className="font-bold text-slate-500 mr-2">الحالة السريرية:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="p-1 px-2.5 rounded-lg border border-slate-200 font-bold bg-white text-slate-700"
          >
            <option value="all">جميع الحالات</option>
            <option value="signed">معتمد وموقع (Signed)</option>
            <option value="amended">معدل ومصحح (Amended)</option>
            <option value="draft">مسودات (Drafts)</option>
            <option value="error">ملغى كخطأ إدخال (In Error)</option>
          </select>
        </div>
      </div>

      {/* Notes Feed Stream */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-sm text-slate-600">لا توجد ملاحظات مطابقة للتصفية الحالية.</p>
            <p className="text-xs text-slate-400">يمكنك تغيير معايير التصفية أو إنشاء ملاحظة جديدة من الشريط العلوي.</p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const isError = note.state === 'entered_in_error';

            return (
              <div
                key={note.id}
                className={`bg-white rounded-2xl border transition-all p-4 space-y-3 hover:shadow-sm ${
                  isError
                    ? 'border-red-200 bg-red-50/20 opacity-75'
                    : note.state === 'draft'
                    ? 'border-dashed border-slate-300 bg-slate-50/50'
                    : 'border-slate-200'
                }`}
              >
                {/* Note Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isError
                          ? 'bg-red-100 text-red-700'
                          : note.category === 'consultation_note'
                          ? 'bg-purple-100 text-purple-700'
                          : note.category === 'nursing_note' || note.category === 'handover_note'
                          ? 'bg-emerald-100 text-emerald-700'
                          : note.category === 'operative_procedure_note'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-extrabold text-sm ${
                            isError ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {note.titleAr}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{note.id}</span>
                        
                        {/* Status Badges */}
                        {note.state === 'final_signed' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            موقع رسمياً
                          </span>
                        )}
                        {note.state === 'amended' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            معدل v{note.version}
                          </span>
                        )}
                        {note.state === 'draft' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                            مسودة
                          </span>
                        )}
                        {isError && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            ملغى (خطأ إدخال)
                          </span>
                        )}

                        {/* Co-sign Badge */}
                        {note.coSignRequirement === 'required_pending' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>بانتظار اعتماد الاستشاري</span>
                          </span>
                        )}

                        {/* Addenda Counter Badge */}
                        {note.addenda.length > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                            <PlusCircle className="w-3 h-3 text-teal-600" />
                            <span>{note.addenda.length} ملحق إضافي</span>
                          </span>
                        )}
                      </div>

                      {/* Author Provenance Row */}
                      <div className="flex flex-wrap items-center gap-2 text-slate-500 text-xs mt-1">
                        <span className={note.author?.name ? 'font-bold text-slate-800' : 'text-slate-500 italic'}>
                          {note.author?.name || 'غير محدد'}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">{note.author?.roleLabelAr || 'بيانات الكاتب غير متاحة'}</span>
                        {note.author?.specialty && (
                          <>
                            <span>•</span>
                            <span>{note.author.specialty}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono text-slate-400">{note.documentedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & View Full Note Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectNote(note)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>عرض كامل الملاحظة</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Excerpt of Content */}
                <div
                  className={`text-xs leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans line-clamp-3 ${
                    isError ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {note.content}
                </div>

                {/* Card Footer: Metadata & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    {note.referencedClinicalData && (
                      <span className="inline-flex items-center gap-1 text-teal-700 font-medium">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>بيانات حيوية مدمجة</span>
                      </span>
                    )}

                    {note.carriedForwardInfo?.isCarriedForward && (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>منقول من ملاحظة سابقة</span>
                      </span>
                    )}
                  </div>

                  {/* Quick Action links */}
                  {!isError && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onAddAddendum(note)}
                        className="text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>إضافة ملحق</span>
                      </button>

                      <button
                        onClick={() => onAmendNote(note)}
                        className="text-slate-600 hover:text-slate-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => onMarkError(note)}
                        className="text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>وسم كخطأ</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
