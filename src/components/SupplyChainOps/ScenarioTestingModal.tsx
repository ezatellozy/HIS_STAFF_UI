import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  X,
  AlertTriangle,
  Play,
  ShieldAlert,
  Boxes,
  Truck,
  ClipboardList,
  FileSpreadsheet,
  Warehouse,
  PackageCheck
} from 'lucide-react';
import { AuditScenarioDefinition, SupplyChainSubTab } from '../../types/supplyChainOps';
import { AUDIT_SCENARIO_CATALOG } from '../../data/mockSupplyChainOpsData';

interface ScenarioTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: AuditScenarioDefinition) => void;
  onNavigateTab: (tab: SupplyChainSubTab) => void;
}

export const ScenarioTestingModal: React.FC<ScenarioTestingModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testedScenarioIds, setTestedScenarioIds] = useState<Set<string>>(new Set());
  const [activeScenarioDetail, setActiveScenarioDetail] = useState<AuditScenarioDefinition | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', labelAr: 'كافة السيناريوهات (30)' },
    { id: 'requisitions', labelAr: 'الطلبات والأولويات (I01-I03)' },
    { id: 'uom_packaging', labelAr: 'التعبئة ووحدات القياس (I04)' },
    { id: 'receiving_inspection', labelAr: 'الاستلام والفحص (I05-I10)' },
    { id: 'putaway_storage', labelAr: 'التخزين بالرف (I11)' },
    { id: 'stock_buckets', labelAr: 'الأوعية الفيزيائية (I12-I15)' },
    { id: 'dispatch_logistics', labelAr: 'الصرف والناقل (I16-I20)' },
    { id: 'fefo_expiry', labelAr: 'قاعدة FEFO والصلاحية (I21)' },
    { id: 'recalls_quarantine', labelAr: 'الاستدعاء والحجر (I22-I23)' },
    { id: 'cycle_count', labelAr: 'الجرد والتسويات (I24-I25)' },
    { id: 'consignment', labelAr: 'الأمانات والمستودعات (I26-I27)' },
    { id: 'telemetry_audit', labelAr: 'حداثة البيانات والتتبع (I28-I30)' }
  ];

  const getCategoryForScenario = (id: string): string => {
    const num = parseInt(id.replace('I', ''), 10);
    if (num <= 3) return 'requisitions';
    if (num === 4) return 'uom_packaging';
    if (num <= 10) return 'receiving_inspection';
    if (num === 11) return 'putaway_storage';
    if (num <= 15) return 'stock_buckets';
    if (num <= 20) return 'dispatch_logistics';
    if (num === 21) return 'fefo_expiry';
    if (num <= 23) return 'recalls_quarantine';
    if (num <= 25) return 'cycle_count';
    if (num <= 27) return 'consignment';
    return 'telemetry_audit';
  };

  const filteredScenarios = AUDIT_SCENARIO_CATALOG.filter(s => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.precondition && s.precondition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.expectedBehavior.toLowerCase().includes(searchQuery.toLowerCase());

    const cat = s.category || getCategoryForScenario(s.id);
    const matchesCategory =
      selectedCategory === 'all' || cat === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExecuteScenario = (scenario: AuditScenarioDefinition) => {
    setTestedScenarioIds(prev => new Set(prev).add(scenario.id));
    onSelectScenario(scenario);

    const category = scenario.category || getCategoryForScenario(scenario.id);

    // Auto-navigate to appropriate sub-tab
    switch (category) {
      case 'requisitions':
        onNavigateTab('requisitions');
        break;
      case 'uom_packaging':
        onNavigateTab('catalog');
        break;
      case 'receiving_inspection':
      case 'putaway_storage':
        onNavigateTab('receiving');
        break;
      case 'stock_buckets':
        onNavigateTab('stock_ledger');
        break;
      case 'dispatch_logistics':
        if (scenario.id === 'I18' || scenario.id === 'I19' || scenario.id === 'I20') {
          onNavigateTab('transfers');
        } else {
          onNavigateTab('picking');
        }
        break;
      case 'fefo_expiry':
        onNavigateTab('picking');
        break;
      case 'recalls_quarantine':
        onNavigateTab('recalls');
        break;
      case 'cycle_count':
        onNavigateTab('cycle_count');
        break;
      case 'consignment':
        onNavigateTab('catalog');
        break;
      case 'telemetry_audit':
        onNavigateTab('stock_ledger');
        break;
      default:
        onNavigateTab('overview');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>سجل تدقيق واختبار سيناريوهات سلاسل الإمداد الطبية (I01 – I30)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  {testedScenarioIds.size} / {AUDIT_SCENARIO_CATALOG.length} تم اختباره
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                قائمة السيناريوهات التشغيلية والسريرية المعتمدة في تقرير التدقيق، مع إمكانية المحاكاة المباشرة بالواجهة.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث برقم السيناريو (مثل I07, I22)، العنوان، السياق السريري أو النتيجة المتوقعة..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {cat.labelAr}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Cards List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filteredScenarios.map(scenario => {
            const isTested = testedScenarioIds.has(scenario.id);

            return (
              <div
                key={scenario.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isTested
                    ? 'bg-slate-900/90 border-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {scenario.id}
                    </span>
                    <h4 className="text-sm font-bold text-white">{scenario.titleAr}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {isTested && (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تمت المحاكاة بنجاح</span>
                      </span>
                    )}
                    <button
                      onClick={() => handleExecuteScenario(scenario)}
                      className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>تشغيل بالواجهة</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {scenario.titleEn}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2.5 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">السياق التشغيلي / الشرط المسبق:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{scenario.precondition}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-teal-400 font-bold block mb-1">السلوك المعتمد وتدقيق السلامة:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{scenario.expectedBehavior}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            معايير التحقق: <strong className="text-white">WHO TRS 1025 / GS1 GTIN / FEFO / HL7 FHIR R5</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
