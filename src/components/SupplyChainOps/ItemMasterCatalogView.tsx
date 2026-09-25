import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Package,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Barcode
} from 'lucide-react';
import { ItemMasterRecord, SupplyItemCategory } from '../../types/supplyChainOps';

interface ItemMasterCatalogViewProps {
  items: ItemMasterRecord[];
  onOpenScenarioModal?: () => void;
}

export const ItemMasterCatalogView: React.FC<ItemMasterCatalogViewProps> = ({
  items,
  onOpenScenarioModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ItemMasterRecord | null>(null);
  const [showAbsentItemSimulation, setShowAbsentItemSimulation] = useState(false);

  const categories: Array<{ id: string; labelAr: string }> = [
    { id: 'all', labelAr: 'كافة التصنيفات' },
    { id: 'catheters_tubing_iv', labelAr: 'القساطر والخطوط الوريدية' },
    { id: 'wound_care_dressings', labelAr: 'الضمادات والعناية بالجروح' },
    { id: 'ppe_infection_control', labelAr: 'أدوات الوقاية ومكافحة العدوى' },
    { id: 'medical_surgical_consumables', labelAr: 'المستهلكات الجراحية العامة' },
    { id: 'disinfectants_chemicals', labelAr: 'المطهرات والكيماويات' }
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.gtin && item.gtin.includes(searchQuery));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Catalog Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>دليل المواد والتجهيزات الطبية العام (Item Master Catalog)</span>
          </h2>
          <p className="text-xs text-slate-400">
            الدليل المركزي الموحد للأصناف المستهلكة، مواصفات التعبئة والتغليف، ومعاملات التحويل (UOM Hierarchy).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAbsentItemSimulation(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="اختبار السيناريو I03: محاولة طلب صنف غير مسجل بالدليل"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>اختبار صنف غير مسجل (سيناريو I03)</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث برمز الصنف، الاسم بالعربية أو الإنجليزية، أو رمز GS1 GTIN..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.labelAr}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Scenario I03 Alert (If triggered) */}
      {showAbsentItemSimulation && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-600/60 text-amber-200 animate-in fade-in text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>نتيجة تدقيق السيناريو I03: محاولة طلب صنف غير مدرج بدليل المواد العام</span>
            </div>
            <button
              onClick={() => setShowAbsentItemSimulation(false)}
              className="text-amber-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-amber-100 leading-relaxed">
            تم الاستعلام عن الصنف: <span className="font-mono font-bold text-white">"BIO-STENT-RAPID-CORONARY"</span>.
            النظام لا يتيح إضافة أصناف عشوائية غير معتمدة إلى أوامر الشراء أو طلبات الأجنحة.
          </p>
          <div className="p-3 bg-black/40 rounded-xl border border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white">توجيه الحوكمة السريرية واللوجستية:</div>
              <div className="text-slate-300 text-[11px]">
                يلزم رفع طلب توصيف وتأهيل فني لصنف جديد عبر لجنة التوصيف والمستلزمات الطبية بالمستشفى.
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs shrink-0">
              حظر الطلب العشوائي (Blocked)
            </span>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">رمز الصنف (Code)</th>
                <th className="p-3.5">اسم الصنف والمواصفات</th>
                <th className="p-3.5">التصنيف اللوجستي</th>
                <th className="p-3.5">التعبئة ومعامل التحويل (UOM)</th>
                <th className="p-3.5">الخصائص السريرية</th>
                <th className="p-3.5">تتبع الصلاحية والتشغيلة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="p-3.5 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {item.code}
                    {item.gtin && (
                      <div className="text-[10px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                        <Barcode className="w-3 h-3 text-slate-400" />
                        <span>(01) {item.gtin}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.nameAr}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      {item.nameEn}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      المصنع: {item.manufacturer} {item.manufacturerRefNumber ? `(${item.manufacturerRefNumber})` : ''}
                    </div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category === 'catheters_tubing_iv' && 'قساطر وخطوط وريدية'}
                      {item.category === 'wound_care_dressings' && 'ضمادات وعناية جروح'}
                      {item.category === 'ppe_infection_control' && 'وقاية ومكافحة عدوى'}
                      {item.category === 'medical_surgical_consumables' && 'مستهلكات جراحية'}
                      {item.category === 'disinfectants_chemicals' && 'مطهرات وبيئة صحية'}
                    </span>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-mono text-slate-200 font-bold">
                      {item.packaging.verifiedDefinitionText}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      أساسي: {item.packaging.baseUom} | صرف: {item.packaging.issueUom}
                    </div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {item.isSterile && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                          معقم
                        </span>
                      )}
                      {item.isLatexFree && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                          خالٍ من اللاتكس
                        </span>
                      )}
                      {item.isHazardous && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                          خطر / قابل للاشتعال
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <div className="space-y-0.5 text-[11px] font-mono">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">التشغيلة:</span>
                        <span className={item.isLotTracked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {item.isLotTracked ? 'مطلوبة إجبارياً' : 'غير مطلوبة'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">الصلاحية:</span>
                        <span className={item.isExpiryTracked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {item.isExpiryTracked ? 'مطلوبة إجبارياً' : 'غير مطلوبة'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail Modal / Slide-over Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {selectedItem.code}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{selectedItem.nameAr}</h3>
                  <div className="text-xs text-slate-400 font-mono">{selectedItem.nameEn}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="text-slate-400">الشركة المصنعة والرقم المرجعي:</div>
                <div className="text-white font-bold">{selectedItem.manufacturer}</div>
                <div className="text-slate-400 font-mono">{selectedItem.manufacturerRefNumber || 'غير متوفر'}</div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="text-slate-400">معيار GS1 GTIN العالمي (01):</div>
                <div className="font-mono text-amber-300 font-bold">{selectedItem.gtin || 'غير مسجل'}</div>
                <div className="text-[10px] text-slate-400">الباركود الخطي المعياري للاستلام والتجهيز</div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="text-slate-400">اشتراطات التخزين ودرجة الحرارة:</div>
                <div className="text-teal-300 font-bold">
                  {selectedItem.storageProfile === 'controlled_room_temp' && 'درجة حرارة الغرفة المتحكم بها (15-25°C)'}
                  {selectedItem.storageProfile === 'dry_ventilated' && 'مكان جاف وجيد التهوية'}
                  {selectedItem.storageProfile === 'flammable_cabinet' && 'كابينة آمنة للمواد القابلة للاشتعال'}
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="text-slate-400">نظام الوحدة المالكة للملف:</div>
                <div className="text-white font-bold">إدارة سلاسل الإمداد والمواد العامة</div>
                <div className="text-[10px] text-teal-400">مستقل عن ملفات أدوية الصيدلية ووحدات بنك الدم</div>
              </div>
            </div>

            {/* Packaging Hierarchy Box (Scenario I04) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>هرمية التعبئة والتغليف والتحويل الدقيق (Packaging Hierarchy):</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {selectedItem.packaging.verifiedDefinitionText}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-center">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400">وحدة الأساس (Base)</div>
                  <div className="font-bold text-white uppercase">{selectedItem.packaging.baseUom}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400">وحدة الصرف للأقسام</div>
                  <div className="font-bold text-amber-400 uppercase">
                    {selectedItem.packaging.issueUom} (= {selectedItem.packaging.conversionFactor} {selectedItem.packaging.baseUom})
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400">وحدة الشراء والتوريد</div>
                  <div className="font-bold text-blue-400 uppercase">
                    {selectedItem.packaging.purchasingUom}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
