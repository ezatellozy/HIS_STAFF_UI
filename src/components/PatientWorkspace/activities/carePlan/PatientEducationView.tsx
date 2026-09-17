import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  MessageSquare,
  Languages,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Calendar,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import { Patient } from '../../../../types/his';
import {
  EducationRecord,
  EducationAudience,
  EducationMethod,
  TeachBackComprehensionStatus
} from '../../../../types/clinicalCarePlanJourney';

interface PatientEducationViewProps {
  patient: Patient;
  educationRecords: EducationRecord[];
  onAddRecord: (record: EducationRecord) => void;
}

export const PatientEducationView: React.FC<PatientEducationViewProps> = ({
  patient,
  educationRecords,
  onAddRecord
}) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer Form State
  const [topicCategory, setTopicCategory] = useState<EducationRecord['topicCategory']>('medication');
  const [topicTitleAr, setTopicTitleAr] = useState('شرح وتثقيف حول أدوية السيولة ومضادات التخثر');
  const [specificContentSummary, setSpecificContentSummary] = useState(
    'تم توضيح أهمية الالتزام بمواعيد جرعات الوارفارين/الهيبارين، ومراقبة علامات النزيف (نزيف اللثة، الكدمات، البول المدمم)، وتجنب الأطعمة الغنية بفيتامين ك بشكل مفاجئ.'
  );
  const [audience, setAudience] = useState<EducationAudience>('patient_and_caregiver');
  const [audienceName, setAudienceName] = useState(`${patient.fullNameAr} والمرافق (الزوجة)`);
  const [method, setMethod] = useState<EducationMethod>('verbal_discussion');
  const [languageUsed, setLanguageUsed] = useState('العربية (Arabic)');
  const [interpreterUsed, setInterpreterUsed] = useState(false);
  const [interpreterDetails, setInterpreterDetails] = useState('');
  const [enableTeachBack, setEnableTeachBack] = useState(true);
  const [comprehension, setComprehension] = useState<TeachBackComprehensionStatus>('demonstrated_understanding');
  const [teachBackNotes, setTeachBackNotes] = useState('قام المريض والمرافق بإعادة ذكر أهم ثلاث علامات خطر للنزيف وموعد أخذ الجرعة بدقة.');
  const [materials, setMaterials] = useState<string>('كتيب إرشادات التخثر والسيولة الورقي، بطاقة تنبيه طبية باللغة العربية');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpFocus, setFollowUpFocus] = useState('');

  const filteredRecords = educationRecords.filter(rec => {
    const matchesCat = filterCategory === 'all' || rec.topicCategory === filterCategory;
    const matchesSearch =
      rec.topicTitleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.specificContentSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.educatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: EducationRecord = {
      id: `edu-${Date.now()}`,
      topicCategory,
      topicTitleAr,
      specificContentSummary,
      audience,
      audienceName,
      method,
      languageUsed,
      interpreterUsed,
      interpreterDetails: interpreterUsed ? interpreterDetails : undefined,
      materialsProvided: materials.split(',').map(m => m.trim()).filter(Boolean),
      educatorName: 'د. خالد عبد العزيز / ممرض CCU',
      educatorRole: 'Multidisciplinary Clinical Team',
      documentedAt: 'اليوم، الآن',
      teachBackAssessment: enableTeachBack ? {
        conducted: true,
        comprehension,
        notes: teachBackNotes
      } : undefined,
      patientQuestionsOrConcerns: 'استفسار عن إمكانية أخذ مسكنات الصداع مع مميعات الدم، وتمت التوصية بالباراسيتامول فقط وتجنب مضادات الالتهاب غير الستيرويدية.',
      followUpEducationNeeded: followUpNeeded,
      followUpEducationFocus: followUpNeeded ? followUpFocus : undefined
    };

    onAddRecord(newRec);
    setShowDrawer(false);
  };

  const getMethodBadge = (m: EducationMethod) => {
    switch (m) {
      case 'verbal_discussion':
        return 'شرح ومناقشة شفهية';
      case 'written_brochure':
        return 'كتيب ومواد مطبوعة';
      case 'audio_visual':
        return 'وسائط مرئية/شاشة';
      case 'practical_demonstration':
        return 'تدريب وعرض عملي';
      case 'interactive_app':
        return 'تطبيق تفاعلي';
    }
  };

  const getComprehensionBadge = (c: TeachBackComprehensionStatus) => {
    switch (c) {
      case 'demonstrated_understanding':
        return { label: 'استيعاب تام مثبت (Demonstrated)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'partial_understanding':
        return { label: 'استيعاب جزئي (Partial Understanding)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'needs_reinforcement':
        return { label: 'يحتاج تعزيز وتكرار (Needs Reinforcement)', color: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: 'غير محدد', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Metrics Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              سجل التثقيف السريري للمريض والأسرة (Patient & Family Education)
            </h4>
            <p className="text-xs text-slate-500">
              توثيق موجه متعدد التخصصات يشمل الأدوية، الإجراءات، العناية بالمنزل، وتقييم الاستيعاب (Teach-Back)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>توثيق جلسة تثقيف جديدة</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-bold text-[11px] ml-1">التصنيف:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'medication', label: 'الأدوية والمميعات' },
            { id: 'diet_nutrition', label: 'التغذية والحمية' },
            { id: 'procedure_surgery', label: 'القسطرة والجراحة' },
            { id: 'wound_care', label: 'العناية بالجروح' },
            { id: 'discharge_care', label: 'تعليمات الخروج' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في موضوع التثقيف، المحتوى..."
            className="w-full pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-teal-600"
          />
        </div>
      </div>

      {/* Education Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-600" />
            <p className="font-bold text-slate-700">لا توجد سجلات تثقيف مطابقة للبحث أو التصفية.</p>
            <p className="text-[11px] mt-1">اضغط على زر "توثيق جلسة تثقيف جديدة" لإضافة توعية جديدة للمريض أو الأسرة.</p>
          </div>
        ) : (
          filteredRecords.map(record => {
            const teachBack = record.teachBackAssessment;
            const compBadge = teachBack ? getComprehensionBadge(teachBack.comprehension) : null;

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all space-y-3 text-xs"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{record.topicTitleAr}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {record.topicCategory.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                    <span>{record.documentedAt}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-sans font-bold">{record.educatorName} ({record.educatorRole})</span>
                  </div>
                </div>

                {/* Content Summary */}
                <p className="text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  {record.specificContentSummary}
                </p>

                {/* Context Badges: Audience, Method, Language */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[9px]">الجمهور المتلقي:</span>
                      <strong className="text-slate-800">{record.audienceName || record.audience}</strong>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[9px]">أسلوب التثقيف والمواد:</span>
                      <strong className="text-slate-800">{getMethodBadge(record.method)}</strong>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[9px]">لغة الحوار والمترجم:</span>
                      <strong className="text-slate-800">
                        {record.languageUsed} {record.interpreterUsed && '(مع مترجم معتمد)'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Teach-Back Assessment Section */}
                {teachBack && compBadge && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <span>تقييم الاستيعاب بطريقة إعادة الشرح (Teach-Back Evaluation):</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${compBadge.color}`}>
                        {compBadge.label}
                      </span>
                    </div>
                    {teachBack.notes && (
                      <p className="text-[11px] text-emerald-900 font-medium pt-1">
                        <strong>ملاحظة الممارس:</strong> {teachBack.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Materials & Questions */}
                {record.materialsProvided && record.materialsProvided.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <span className="font-bold text-slate-700">المواد المسلّمة:</span>
                    {record.materialsProvided.map((mat, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px]">
                        {mat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Structured Education Documentation Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-sm">توثيق جلسة تثقيف سريري (Structured Education)</h4>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-800">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px]">
                <strong>المريض:</strong> {patient.fullNameAr} ({patient.mrn}) • العمر: {patient.age} سنة
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">محور وتصنيف موضوع التثقيف:</label>
                <select
                  value={topicCategory}
                  onChange={e => setTopicCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="medication">تثقيف دوائي (مضادات التخثر، الأنسولين، الضغط)</option>
                  <option value="diet_nutrition">حمية وتغذية علاجية (قليلة الملح، حمية السكري)</option>
                  <option value="procedure_surgery">تعليمات ما قبل/بعد القسطرة أو الجراحة</option>
                  <option value="wound_care">العناية بالجروح والقساطر الوريدية</option>
                  <option value="discharge_care">تعليمات الخروج الآمن وإشارات الخطر</option>
                  <option value="medical_equipment">الأجهزة والمعدات الطبية المنزلية</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الموضوع الدقيق:</label>
                <input
                  type="text"
                  value={topicTitleAr}
                  onChange={e => setTopicTitleAr(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملخص المحتوى التعليمي المشروح:</label>
                <textarea
                  rows={3}
                  value={specificContentSummary}
                  onChange={e => setSpecificContentSummary(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجمهور المتلقي:</label>
                  <select
                    value={audience}
                    onChange={e => setAudience(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="patient">المريض فقط</option>
                    <option value="patient_and_caregiver">المريض والأسرة/المرافق معاً</option>
                    <option value="family_caregiver">الأسرة / القائم على الرعاية فقط</option>
                    <option value="legal_guardian">الوصي القانوني</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">أسلوب التثقيف:</label>
                  <select
                    value={method}
                    onChange={e => setMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="verbal_discussion">مناقشة وشرح شفهي</option>
                    <option value="written_brochure">تسليم كتيب مطبوع وقراءته</option>
                    <option value="practical_demonstration">تطبيق وعرض عملي أمامه</option>
                    <option value="audio_visual">شاشات أو مقاطع مرئية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">لغة الحوار:</label>
                  <input
                    type="text"
                    value={languageUsed}
                    onChange={e => setLanguageUsed(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="interpreter"
                    checked={interpreterUsed}
                    onChange={e => setInterpreterUsed(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                  />
                  <label htmlFor="interpreter" className="font-bold text-slate-800 cursor-pointer">
                    الاستعانة بمترجم فوري معتمد
                  </label>
                </div>
              </div>

              {/* Teach-Back Feature Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTeachBack}
                      onChange={e => setEnableTeachBack(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                    />
                    <span>إجراء تقييم الاستيعاب (Teach-Back Evaluation)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Contextual Standard</span>
                </div>

                {enableTeachBack && (
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      نتيجة استيعاب المريض / المرافق:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'demonstrated_understanding', label: 'استيعاب تام' },
                        { id: 'partial_understanding', label: 'استيعاب جزئي' },
                        { id: 'needs_reinforcement', label: 'بحاجة لتكرار' }
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setComprehension(item.id as any)}
                          className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                            comprehension === item.id
                              ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={teachBackNotes}
                      onChange={e => setTeachBackNotes(e.target.value)}
                      placeholder="توثيق ما ذكره المريض للتأكد من فهمه..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المواد والمطويات المسلّمة (مفصولة بفاصلة):</label>
                <input
                  type="text"
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  اعتماد وحفظ جلسة التثقيف في السجل السريري
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
