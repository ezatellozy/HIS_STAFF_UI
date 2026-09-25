import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Filter,
  Search,
  X
} from 'lucide-react';
import { BiomedicalOpsState } from '../../types/biomedicalOps';
import { runAllBiomedicalTests, BiomedicalTestResult } from '../../tests/biomedicalTestSuite';

interface BiomedicalTestInspectorModalProps {
  state: BiomedicalOpsState;
  isOpen: boolean;
  onClose: () => void;
}

export const BiomedicalTestInspectorModal: React.FC<BiomedicalTestInspectorModalProps> = ({
  state,
  isOpen,
  onClose
}) => {
  const [testResults, setTestResults] = useState<BiomedicalTestResult[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const handleRunTests = () => {
    const res = runAllBiomedicalTests(state);
    setTestResults(res);
    setHasRun(true);
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;

  const categories = Array.from(new Set(testResults.map(t => t.category)));

  const filteredTests = testResults.filter(t => {
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesSearch =
      !searchQuery ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nameAr.includes(searchQuery) ||
      t.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-right" dir="rtl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                مدقق سيناريوهات الأمان والتحقق للواجهة الاصطناعية (Biomedical Safety & Quality Inspector)
              </h3>
              <p className="text-[11px] text-slate-300">
                فحص آلي تنفيذي لـ 50 سيناريو (BM01–BM30 + 20 فحصاً سلبياً) — يفحص سلوك الواجهة البرمجية فقط
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Actions */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              {hasRun ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{hasRun ? 'إعادة تشغيل الفحوصات الـ 50' : 'تشغيل الاختبارات التلقائية (50 فحصاً: BM01–BM30 + سلبي)'}</span>
            </button>

            {hasRun && (
              <div className="flex items-center gap-2 mr-3 text-xs">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} ناجح
                </span>
                {failedCount > 0 && (
                  <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-red-200">
                    <XCircle className="w-3.5 h-3.5" /> {failedCount} راسب
                  </span>
                )}
              </div>
            )}
          </div>

          {hasRun && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في الاختبارات..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500 w-44"
                />
              </div>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">كافة الفئات (All Categories)</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Test List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {!hasRun ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">
                اضغط على زر تشغيل الاختبارات للتحقق من سلوك التطبيق والضوابط السريرية
              </p>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                يتحقق الفاحص من سلوك التطبيق البرمجي فقط (Application Behavior Only)؛ سير العمل مستنير بمفاهيم فحص IEC 62353 واشتراطات التدشين وحجر استدعاءات SFDA والتطهير البيولوجي. تعليمات المصنّع والجهات التنظيمية هي المرجع المعتمد دون ادعاء شهادة مطابقة تنظيمية من التطبيق.
              </p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              لا توجد فحوصات تطابق معايير التصفية الحالية
            </div>
          ) : (
            filteredTests.map(t => (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  t.passed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-red-50/50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {t.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{t.id}</span>
                        <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          {t.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-1">{t.nameAr}</h4>
                      <p className="text-[11px] text-slate-500 font-sans" dir="ltr">
                        {t.nameEn}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${
                      t.passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {t.passed ? 'ناجح (PASSED)' : 'راسب (FAILED)'}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold block">المتوقع (Expected):</span>
                    <span className="text-slate-800 font-mono">{t.expected}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">الفعلي (Actual):</span>
                    <span className="text-slate-800 font-mono">{t.actual}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>اختبارات اصطناعية داخل بيئة الواجهة — لا تدعي اعتماداً تنظيمياً خارجياً</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
