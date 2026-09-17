import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  HeartPulse,
  AlertTriangle,
  FlaskConical,
  ShieldCheck,
  Copy,
  Save,
  CheckCircle2,
  X,
  Layers,
  ChevronDown,
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Patient } from '../../../types/his';
import {
  DocumentationCategory,
  ClinicalNoteRecord,
  DocumentationTemplateDefinition
} from '../../../types/clinicalNotesDocumentation';
import { MOCK_NOTE_TEMPLATES } from '../../../data/mockDocumentationData';
import { useHis } from '../../../context/HisContext';

interface NoteComposerWorkspaceProps {
  patient: Patient;
  existingNotes: ClinicalNoteRecord[];
  onClose: () => void;
  onSaveNote: (newNote: ClinicalNoteRecord) => void;
  onOpenForms?: () => void;
}

export const NoteComposerWorkspace: React.FC<NoteComposerWorkspaceProps> = ({
  patient,
  existingNotes,
  onClose,
  onSaveNote,
  onOpenForms
}) => {
  const { currentStaff, playChime } = useHis();

  // Selected Category & Template
  const [selectedCategory, setSelectedCategory] = useState<DocumentationCategory>('progress_note');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-soap-standard');
  const [noteTitleAr, setNoteTitleAr] = useState('ملاحظة تقدم سريري يومية');
  const [noteTitleEn, setNoteTitleEn] = useState('Daily Clinical Progress Note');

  // Fields state for structured templates
  const [sectionValues, setSectionValues] = useState<Record<string, string>>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Narrative single field if narrative mode
  const [narrativeContent, setNarrativeContent] = useState('');

  // Provenance & Safety states
  const [isCarriedForward, setIsCarriedForward] = useState(false);
  const [carriedForwardOrigin, setCarriedForwardOrigin] = useState<string | null>(null);
  const [coSignRequired, setCoSignRequired] = useState(
    currentStaff.role === 'doctor' && currentStaff.title?.includes('مقيم')
  );
  const [selectedCoSigner, setSelectedCoSigner] = useState('د. طارق المنشاوي (استشاري طب الطوارئ)');
  const [referencedDataIncluded, setReferencedDataIncluded] = useState<{
    vitals?: boolean;
    problems?: boolean;
    allergies?: boolean;
    labs?: boolean;
  }>({});

  const [dirty, setDirty] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState('تم الحفظ كمسودة');

  // Get active template
  const currentTemplate = MOCK_NOTE_TEMPLATES.find(t => t.id === selectedTemplateId) || MOCK_NOTE_TEMPLATES[0];

  // Handle template change
  const handleTemplateChange = (tplId: string) => {
    const tpl = MOCK_NOTE_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;

    setSelectedTemplateId(tplId);
    setSelectedCategory(tpl.category);
    setNoteTitleAr(tpl.defaultTitleAr);
    setNoteTitleEn(tpl.defaultTitleEn);

    // Initialize section values
    const initialSections: Record<string, string> = {};
    tpl.sections.forEach(s => {
      initialSections[s.key] = s.defaultValue || '';
    });
    setSectionValues(initialSections);
    setIsCarriedForward(false);
    setDirty(true);
  };

  // 1-Click Reference Insert Handlers
  const insertVitalsReference = () => {
    const vitalsText = `\n[العلامات الحيوية المرجعية - 10:30 ص]:\nالضغط: 148/92 mmHg | النبض: 98 bpm | التنفس: 20/min | التشبع SpO2: 96% | الحرارة: 37.1 °C | الألم: 8/10`;
    if (currentTemplate.structureType === 'soap') {
      setSectionValues(prev => ({
        ...prev,
        objective: (prev.objective || '') + vitalsText
      }));
    } else {
      setNarrativeContent(prev => prev + vitalsText);
    }
    setReferencedDataIncluded(prev => ({ ...prev, vitals: true }));
    setDirty(true);
    playChime('chime');
  };

  const insertProblemsReference = () => {
    const problemsText = `\n[المشكلات والتشخيصات النشطة المرجعية]:\n- احتشاء حاد بعضلة القلب بدون ارتفاع ST (Acute NSTEMI) - نشط\n- ارتفاع ضغط الدم الشرياني الأساسي (Essential Hypertension) - مزمن\n- داء السكري النوع الثاني (Type 2 Diabetes Mellitus) - مزمن`;
    if (currentTemplate.structureType === 'soap') {
      setSectionValues(prev => ({
        ...prev,
        assessment: (prev.assessment || '') + problemsText
      }));
    } else {
      setNarrativeContent(prev => prev + problemsText);
    }
    setReferencedDataIncluded(prev => ({ ...prev, problems: true }));
    setDirty(true);
    playChime('chime');
  };

  const insertAllergiesReference = () => {
    const allergiesText = `\n[الحساسيات المسجلة]: لا توجد حساسية دوائية معروفة (NKDA)`;
    if (currentTemplate.structureType === 'soap') {
      setSectionValues(prev => ({
        ...prev,
        subjective: (prev.subjective || '') + allergiesText
      }));
    } else {
      setNarrativeContent(prev => prev + allergiesText);
    }
    setReferencedDataIncluded(prev => ({ ...prev, allergies: true }));
    setDirty(true);
    playChime('chime');
  };

  const insertLabsReference = () => {
    const labsText = `\n[نتائج الفحوصات المخبرية المستوردة]:\n- إنزيم التروبونين عالي الحساسية (Hs-Troponin I): 0.18 ng/mL [مرتفع]\n- الكرياتينين المصلي: 1.1 mg/dL (eGFR 72 mL/min)\n- خضاب الدم (Hb): 13.8 g/dL`;
    if (currentTemplate.structureType === 'soap') {
      setSectionValues(prev => ({
        ...prev,
        objective: (prev.objective || '') + labsText
      }));
    } else {
      setNarrativeContent(prev => prev + labsText);
    }
    setReferencedDataIncluded(prev => ({ ...prev, labs: true }));
    setDirty(true);
    playChime('chime');
  };

  // Copy Previous Note (Carry Forward) with explicit provenance
  const handleCarryForward = () => {
    const lastNote = existingNotes[0];
    if (!lastNote) return;

    if (currentTemplate.structureType === 'soap') {
      setSectionValues({
        subjective: `[منقول من ملاحظة سابقة بواسطة ${lastNote.author.name}]:\n` + lastNote.content.slice(0, 300),
        objective: `[مستورد من الفحص السابق]:\nالعلامات مستقرة، استمرار مراقبة النبض.`,
        assessment: `متابعة حالة ${patient.fullNameAr} السابقة.`,
        plan: `تحديث الخطة وتأكيد الفحوصات.`
      });
    } else {
      setNarrativeContent(`[منقول ومستنسخ من الملاحظة السابقة ${lastNote.id} للكاتب ${lastNote.author.name} في ${lastNote.documentedAt}]:\n\n${lastNote.content}`);
    }

    setIsCarriedForward(true);
    setCarriedForwardOrigin(`${lastNote.id} - ${lastNote.author.name}`);
    setDirty(true);
    playChime('alert');
  };

  // Compile Final Note Content
  const compileFullContent = (): string => {
    if (currentTemplate.structureType === 'soap') {
      return `[الشكوى والأعراض الذاتية (S)]:
${sectionValues.subjective || 'لم تسجل شكوى جديدة.'}

[المشاهدات والفحص والنتائج (O)]:
${sectionValues.objective || 'الفحص السريري معتمد ومستقر.'}

[التقييم السريري (A)]:
${sectionValues.assessment || 'التقييم مستمر.'}

[خطة العلاج والمتابعة (P)]:
${sectionValues.plan || 'استمرار الخطة العلاجية المعتمدة.'}`;
    }

    if (currentTemplate.structureType === 'sbar') {
      return `[الحالة الآنية (Situation)]:
${sectionValues.situation || ''}

[الخلفية المرضية (Background)]:
${sectionValues.background || ''}

[التقييم السريري (Assessment)]:
${sectionValues.assessment || ''}

[التوصيات والمهام (Recommendation)]:
${sectionValues.recommendation || ''}`;
    }

    if (currentTemplate.sections.length > 1) {
      return currentTemplate.sections
        .map(sec => `[${sec.labelAr}]:\n${sectionValues[sec.key] || ''}`)
        .join('\n\n');
    }

    return narrativeContent || sectionValues.narrative_body || '';
  };

  // Submit & Sign Note
  const handleSave = (state: 'draft' | 'final_signed') => {
    const fullContent = compileFullContent();
    if (!fullContent.trim()) return;

    const newNote: ClinicalNoteRecord = {
      id: `NOTE-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patient.id,
      encounterId: 'ENC-2026-ER-091',
      encounterType: 'emergency',
      category: selectedCategory,
      templateId: selectedTemplateId,
      structureType: currentTemplate.structureType,
      titleAr: noteTitleAr,
      titleEn: noteTitleEn,
      content: fullContent,
      state: state,
      author: {
        id: currentStaff.id,
        name: currentStaff.name,
        role: currentStaff.title || 'طبيب سريري معالج',
        roleLabelAr: currentStaff.title || 'طبيب معالج',
        specialty: currentStaff.department || 'الطب السريري',
        department: currentStaff.department || 'قسم الطوارئ والحالات الحرجة'
      },
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      documentedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      signedAt: state === 'final_signed' ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : undefined,
      signedBy: state === 'final_signed' ? `${currentStaff.name} (${currentStaff.licenseNo || '2026-REG-991'})` : undefined,
      coSignRequirement: coSignRequired ? (state === 'final_signed' ? 'required_pending' : 'none') : 'none',
      version: 1,
      versionHistory: [
        {
          versionNumber: 1,
          savedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          savedBy: currentStaff.name,
          title: noteTitleAr,
          content: fullContent,
          state: state
        }
      ],
      addenda: [],
      carriedForwardInfo: isCarriedForward
        ? {
            isCarriedForward: true,
            originalNoteId: carriedForwardOrigin || undefined
          }
        : undefined,
      referencedClinicalData: referencedDataIncluded,
      tags: [selectedCategory, currentTemplate.structureType]
    };

    onSaveNote(newNote);
    playChime('success');
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">
                محرر التوثيق السريري المتقدم (Clinical Documentation Workspace)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                بيئة محررة متكاملة
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>المريض: <strong className="text-white">{patient.fullNameAr}</strong> ({patient.mrn})</span>
              <span>•</span>
              <span>الكاتب: <strong className="text-slate-200">{currentStaff.name}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {autoSavedTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenForms && (
            <button
              onClick={onOpenForms}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>فتح النماذج والتقييمات المخصصة (Forms)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Template & Category Config Rail */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          {/* Template Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              قالب التوثيق السريري المعتمد (Clinical Template):
            </label>
            <select
              value={selectedTemplateId}
              onChange={e => handleTemplateChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-teal-500"
            >
              {MOCK_NOTE_TEMPLATES.map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.nameAr} ({tpl.structureType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Note Title Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              عنوان المستند والتقرير:
            </label>
            <input
              type="text"
              value={noteTitleAr}
              onChange={e => {
                setNoteTitleAr(e.target.value);
                setDirty(true);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 shadow-xs"
            />
          </div>

          {/* Co-signature Policy */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>سياسة الاعتماد المشترك (Co-sign):</span>
              <span className="text-[10px] text-teal-700 font-mono">
                {coSignRequired ? 'مطلوب إشراف' : 'توقيع مباشر'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cosign-toggle"
                checked={coSignRequired}
                onChange={e => setCoSignRequired(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="cosign-toggle" className="text-xs text-slate-700 font-medium">
                يتطلب توقيع استشاري مشرف
              </label>
            </div>
            {coSignRequired && (
              <select
                value={selectedCoSigner}
                onChange={e => setSelectedCoSigner(e.target.value)}
                className="w-full mt-1.5 p-1.5 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-800 bg-white"
              >
                <option value="د. طارق المنشاوي (استشاري طب الطوارئ)">د. طارق المنشاوي (استشاري طب الطوارئ)</option>
                <option value="د. خالد عبد العزيز (استشاري قسطرة القلب)">د. خالد عبد العزيز (استشاري قسطرة القلب)</option>
                <option value="د. محمود سمير (استشاري العناية المركزة)">د. محمود سمير (استشاري العناية المركزة)</option>
              </select>
            )}
          </div>
        </div>

        {/* 1-Click Clinical Data Reference Integration Strip */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>إدراج بيانات حية مرجعية بنقرة واحدة (1-Click Reference):</span>
            </span>

            <button
              type="button"
              onClick={insertVitalsReference}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              title="إدراج أحدث العلامات الحيوية المقاسة للمريض"
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span>العلامات الحيوية</span>
            </button>

            <button
              type="button"
              onClick={insertProblemsReference}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              title="إدراج قائمة المشكلات والتشخيصات النشطة"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>المشكلات والتشخيصات</span>
            </button>

            <button
              type="button"
              onClick={insertLabsReference}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              title="إدراج نتائج المختبر والإنزيمات الحديثة"
            >
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span>النتائج المخبرية</span>
            </button>

            <button
              type="button"
              onClick={insertAllergiesReference}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              title="إدراج الحساسيات المعروفة"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>الحساسيات (NKDA)</span>
            </button>
          </div>

          {/* Copy Previous Note / Carry Forward Tool */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCarryForward}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
              title="نسخ محتوى الملاحظة السابقة مع توثيق المصدر لمنع أخطاء النسخ الأعمى"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>نسخ من الملاحظة السابقة (Carry Forward)</span>
            </button>
          </div>
        </div>

        {/* Carry Forward Safety Banner if active */}
        {isCarriedForward && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>تنبيه الأمان والمساءلة (Carried Forward Notice):</strong> تم نسخ هذا النص جزئياً من ملاحظة سابقة ({carriedForwardOrigin}). يرجى مراجعة وتحديث الفحص والحالة الآنية لتجنب تكرار بيانات غير دقيقة.
              </span>
            </div>
            <button
              onClick={() => setIsCarriedForward(false)}
              className="text-amber-800 hover:underline font-bold text-[11px] cursor-pointer"
            >
              إلغاء التنبيه
            </button>
          </div>
        )}
      </div>

      {/* Editor Body */}
      <div className="p-5 overflow-y-auto max-h-[500px] space-y-4">
        
        {/* Dynamic Template Fields */}
        {currentTemplate.structureType === 'soap' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Subjective */}
            <div className="space-y-1.5">
              <label className="block font-extrabold text-teal-900 text-xs flex items-center justify-between">
                <span>الشكوى والأعراض الذاتية (Subjective - S):</span>
                <span className="text-[10px] text-slate-400 font-normal">شكوى المريض، تطور الألم</span>
              </label>
              <textarea
                rows={5}
                value={sectionValues.subjective || ''}
                onChange={e => {
                  setSectionValues({ ...sectionValues, subjective: e.target.value });
                  setDirty(true);
                }}
                placeholder="شكوى المريض، الأعراض الذاتية، الاستجابة للعلاج المسكن..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 font-sans"
              />
            </div>

            {/* Objective */}
            <div className="space-y-1.5">
              <label className="block font-extrabold text-blue-900 text-xs flex items-center justify-between">
                <span>المشاهدات والفحص والنتائج (Objective - O):</span>
                <span className="text-[10px] text-slate-400 font-normal">العلامات الحيوية، الفحص السريري</span>
              </label>
              <textarea
                rows={5}
                value={sectionValues.objective || ''}
                onChange={e => {
                  setSectionValues({ ...sectionValues, objective: e.target.value });
                  setDirty(true);
                }}
                placeholder="العلامات الحيوية، فحص الصدر والقلب، نتائج التحاليل والتخطيط..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Assessment */}
            <div className="space-y-1.5">
              <label className="block font-extrabold text-purple-900 text-xs flex items-center justify-between">
                <span>التقييم السريري والتشخيص (Assessment - A):</span>
                <span className="text-[10px] text-slate-400 font-normal">التشخيص الحالي ودرجة الخطورة</span>
              </label>
              <textarea
                rows={4}
                value={sectionValues.assessment || ''}
                onChange={e => {
                  setSectionValues({ ...sectionValues, assessment: e.target.value });
                  setDirty(true);
                }}
                placeholder="التشخيص المعتمد، استقرار الحالة، المؤشرات التنبؤية..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 font-sans"
              />
            </div>

            {/* Plan */}
            <div className="space-y-1.5">
              <label className="block font-extrabold text-emerald-900 text-xs flex items-center justify-between">
                <span>خطة العلاج والمتابعة (Plan - P):</span>
                <span className="text-[10px] text-slate-400 font-normal">الأوامر، الاستشارات، الخطوات</span>
              </label>
              <textarea
                rows={4}
                value={sectionValues.plan || ''}
                onChange={e => {
                  setSectionValues({ ...sectionValues, plan: e.target.value });
                  setDirty(true);
                }}
                placeholder="تعديلات الأدوية، الفحوصات الإضافية، الاستشارات، تعليمات التمريض..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTemplate.sections.map(section => (
              <div key={section.key} className="space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs">
                  {section.labelAr} ({section.labelEn}):
                </label>
                <textarea
                  rows={currentTemplate.sections.length === 1 ? 10 : 4}
                  value={sectionValues[section.key] || ''}
                  onChange={e => {
                    setSectionValues({ ...sectionValues, [section.key]: e.target.value });
                    setDirty(true);
                  }}
                  placeholder={section.placeholderAr}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 font-sans"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>التوقيع المعتمد ملزم قانونياً ويخضع لمعايير الرقابة والتدقيق السريري (CBAHI / JCI).</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
          >
            إلغاء التحرير
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-300 text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span>حفظ كمسودة (Save Draft)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('final_signed')}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعتماد وتوقيع التوثيق (Sign & Finalize)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
