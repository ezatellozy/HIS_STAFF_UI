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
import { CSSDOpsState } from '../../types/cssdOps';
import { runAllCssdTests, CSSDTestResult } from '../../tests/cssdTestSuite';

interface CSSDTestInspectorModalProps {
  state: CSSDOpsState;
  isOpen: boolean;
  onClose: () => void;
}

export const CSSDTestInspectorModal: React.FC<CSSDTestInspectorModalProps> = ({
  state,
  isOpen,
  onClose
}) => {
  const [testResults, setTestResults] = useState<CSSDTestResult[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const handleRunTests = () => {
    const res = runAllCssdTests(state);
    setTestResults(res);
    setHasRun(true);
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;

  const categories = Array.from(new Set(testResults.map(t => t.category)));

  const filteredTests = testResults.filter(t =>
    filterCategory === 'all' ? true : t.category === filterCategory
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm">
                مدقق اختبارات الجودة والسلامة للتعقيم المركزي (CSSD Verification Inspector)
              </h3>
              <p className="text-[11px] text-slate-300">
                فحص آلي لـ 30 سيناريو ومحدد أمان تنفيذي (CSSD01-CSSD30 + الاختبارات السلبية وفق معايير SFDA / WHO / ISO 15883-2 / ISO 17665)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <button
            onClick={handleRunTests}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>تشغيل جميع اختبارات التحقق ({hasRun ? 'إعادة الفحص' : 'ابدأ الفحص'})</span>
          </button>

          {hasRun && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الناجحة: {passedCount}</span>
              </span>
              {failedCount > 0 ? (
                <span className="flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>الفاشلة: {failedCount}</span>
                </span>
              ) : (
                <span className="text-slate-500 font-bold">100% نسبة النجاح</span>
              )}
            </div>
          )}

          {hasRun && categories.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="border border-slate-300 rounded-lg p-1 text-xs bg-white text-slate-700 font-bold"
              >
                <option value="all">جميع التصنيفات</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
          {!hasRun ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">
                اضغط على &quot;تشغيل جميع اختبارات التحقق&quot; للبدء
              </p>
              <p className="text-xs text-slate-400">
                يتحقق الفاحص من موانع الأمان، التطهير A0، توافق الأغلفة، المؤشرات الثلاثية، وتتبع المرضى.
              </p>
            </div>
          ) : (
            filteredTests.map(test => (
              <div
                key={test.id}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  test.passed
                    ? 'bg-white border-emerald-200 shadow-2xs'
                    : 'bg-red-50 border-red-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900">{test.id}</span>
                        <span className="font-bold text-slate-900 text-xs">{test.nameAr}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({test.nameEn})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        التصنيف: <strong className="text-teal-700">{test.category}</strong>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {test.passed ? 'اجتياز (PASS)' : 'فشل (FAIL)'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">المتوقع:</span>
                    <span>{test.expected}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الفعلي:</span>
                    <span className={test.passed ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                      {test.actual}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>لوائح هيئة الغذاء والدواء SFDA • معايير سباهي CBAHI • معايير منظمة الصحة العالمية WHO</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold cursor-pointer transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
