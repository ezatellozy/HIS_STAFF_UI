import React, { useState } from 'react';
import { HimOpsState } from '../../types/himOps';
import { runAllHimTests, HimTestResult } from '../../tests/himTestSuite';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  Check,
  FileCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';

interface HIMTestInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: HimOpsState;
}

export const HIMTestInspectorModal: React.FC<HIMTestInspectorModalProps> = ({
  isOpen,
  onClose,
  state
}) => {
  const [results, setResults] = useState<HimTestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [execTimeMs, setExecTimeMs] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRunTests = () => {
    const start = performance.now();
    const testResults = runAllHimTests(state);
    const end = performance.now();
    setResults(testResults);
    setHasRun(true);
    setExecTimeMs(Math.round(end - start));
  };

  const categories = Array.from(new Set(results.map(r => r.category)));

  const filteredResults = results.filter(r => {
    const matchesCategory =
      activeCategory === 'all' || r.category === activeCategory;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'passed'
        ? r.passed
        : !r.passed;
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden font-['Cairo',sans-serif]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  فاحص التحقق والتتبع لإدارة السجلات الطبية والترميز (HIM Verification Inspector)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800">
                  HIM01-HIM30 + NEGHIM01-NEGHIM30
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                فحص آلي وتنفيذي يختبر سلوك التطبيق والضوابط السريرية فقط (Application Behavior Only)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>تشغيل الاختبارات التنفيذية</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="px-5 py-2.5 bg-amber-950/40 border-b border-amber-800/40 text-[11px] text-amber-300/90 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            سير العمل مسترشد بمفاهيم سباهي وضوابط معالجة البيانات الصحية (Workflow informed by Saudi PDPL health-data processing and disclosure controls). متطلبات وسياسات المستشفى الداخلية تظل هي الحاكمة. الفاحص يختبر سلوك واجهة التطبيق البرمجية حصراً.
          </span>
        </div>

        {/* Controls & Summary */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الاختبار أو العنوان..."
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('passed')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'passed'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                الناجحة ({passedCount})
              </button>
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'failed'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                المتعثرة ({failedCount})
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          {hasRun && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{passedCount} ناجح</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>{failedCount} متعثر</span>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 flex items-center gap-1 font-sans">
                <Clock className="w-3.5 h-3.5" />
                <span>زمن التنفيذ: {execTimeMs} مللي ثانية</span>
              </span>
            </div>
          )}
        </div>

        {/* Categories Bar */}
        {hasRun && categories.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-semibold ${
                activeCategory === 'all'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              كافة المحاور ({results.length})
            </button>
            {categories.map(cat => {
              const count = results.filter(r => r.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-semibold ${
                    activeCategory === cat
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {!hasRun ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
              <div className="text-sm font-semibold text-slate-400">
                انقر على زر "تشغيل الاختبارات التنفيذية" لبدء فحص مصفوفة HIM البرمجية
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                يتحقق الفاحص من اكتمال التوثيق، سلاسل الإصدارات، سلامة الترميز المالي، وضوابط الإفراج وحماية البيانات الشخصية.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              لا توجد اختبارات تطابق معايير الفلترة المحددة
            </div>
          ) : (
            filteredResults.map(test => (
              <div
                key={test.id}
                className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                  test.passed
                    ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    : 'bg-rose-950/20 border-rose-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-teal-300 border border-slate-700">
                        {test.id}
                      </span>
                      <span className="font-bold text-white text-sm">{test.nameAr}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      {test.nameEn}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 flex items-center gap-1.5 ${
                      test.passed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {test.passed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>اجتاز الفحص</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>تعثر</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-semibold">المتوقع برمجياً (Expected):</span>
                    <span className="text-slate-300 font-mono">{test.expected}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-semibold">النتيجة الفعلية (Actual):</span>
                    <span className={test.passed ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                      {test.actual}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    المحور: {test.category}
                  </span>
                  {test.details && <span className="font-mono text-slate-400">{test.details}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>بوابة فحص السجلات الطبية والترميز — مصفوفة الاعتمادية 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
          >
            إغلاق الفاحص
          </button>
        </div>
      </div>
    </div>
  );
};
