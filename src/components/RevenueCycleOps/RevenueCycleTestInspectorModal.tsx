import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  Play,
  RotateCcw
} from 'lucide-react';
import { runRevenueCycleTestSuite, TestResult } from '../../tests/revenueCycleTestSuite';

interface RevenueCycleTestInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevenueCycleTestInspectorModal: React.FC<RevenueCycleTestInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [suiteResult, setSuiteResult] = useState(() => runRevenueCycleTestSuite());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core_scenario' | 'negative_test'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleReRun = () => {
    setSuiteResult(runRevenueCycleTestSuite());
  };

  const filteredTests = suiteResult.results.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                فاحص التحقق المستقل من دورة الإيرادات (Independent Verification & Test Inspector)
              </h3>
              <p className="text-xs text-slate-500">
                فحص آلي مباشر للسيناريوهات RC01–RC30 والاختبارات السلبية NEG-A–NEG-Y
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReRun}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الفحص الآن</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي حالات الفحص</span>
            <span className="text-xl font-black text-slate-800 font-mono mt-1 block">{suiteResult.total}</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-emerald-800 block">الحالات الناجحة (Passed)</span>
            <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">{suiteResult.passed}</span>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-red-800 block">الحالات المتعثرة (Failed)</span>
            <span className="text-xl font-black text-red-600 font-mono mt-1 block">{suiteResult.failed}</span>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="البحث بكود الفحص، اسم السيناريو، أو الملاحظة..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs rounded-lg font-bold cursor-pointer ${
                selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              الكل ({suiteResult.total})
            </button>
            <button
              onClick={() => setSelectedCategory('core_scenario')}
              className={`px-3 py-1 text-xs rounded-lg font-bold cursor-pointer ${
                selectedCategory === 'core_scenario' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              السيناريوهات الأساسية RC01–RC30
            </button>
            <button
              onClick={() => setSelectedCategory('negative_test')}
              className={`px-3 py-1 text-xs rounded-lg font-bold cursor-pointer ${
                selectedCategory === 'negative_test' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              الاختبارات السلبية NEG-A–NEG-Y
            </button>
          </div>
        </div>

        {/* Test List */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
          {filteredTests.map(t => (
            <div key={t.code} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                {t.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 px-1.5 py-0.5 bg-slate-100 rounded text-[11px]">
                      {t.code}
                    </span>
                    <span className="font-bold text-slate-800">{t.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{t.message}</div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  t.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {t.passed ? 'تم الاجتياز 100%' : 'فشل الفحص'}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-3">
          <div className="text-xs text-slate-500 font-semibold">
            مطابقة تامة لمتطلبات دورة الإيرادات في المستشفيات وفق معايير نفيس وهيئة الزكاة والضريبة والجمارك (ZATCA)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            إغلاق الفاحص
          </button>
        </div>
      </div>
    </div>
  );
};
