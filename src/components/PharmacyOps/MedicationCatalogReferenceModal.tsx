import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Layers,
  ShieldAlert,
  FileText,
  Package,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ISMP_TALLMAN_CATALOG_PAIRS } from '../../data/mockPharmacyOpsData';

interface MedicationCatalogReferenceModalProps {
  onClose: () => void;
}

export const MedicationCatalogReferenceModal: React.FC<MedicationCatalogReferenceModalProps> = ({
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'tallman' | 'formulary_governance'>('hierarchy');

  const hierarchyLevels = [
    {
      level: 1,
      concept: 'المادة الفعالة (Ingredient / Molecule)',
      english: 'Active Pharmaceutical Ingredient (API)',
      description: 'الكيان الكيميائي أو الحيوي المجرد للمادة الفعالة دون شكل صيدلاني أو عيار.',
      example: 'Vancomycin, Levofloxacin, Heparin Sodium',
      owner: 'الدليل الدوائي الموحد (Master Formulary Database)'
    },
    {
      level: 2,
      concept: 'المستحضر السريري العام (Clinical Drug Concept)',
      english: 'Generic Clinical Drug (Generic + Strength + Form)',
      description: 'المفهوم الطبي القياسي المعتمد في الوصف السريري العام بالمستشفى.',
      example: 'Vancomycin 1g Lyophilized Powder for Injection',
      owner: 'نظام إدخال الأوامر الطبية الإلكترونية CPOE (Axis 6)'
    },
    {
      level: 3,
      concept: 'بند الوصف الطبي القابل للطلب (Orderable Medication)',
      english: 'Orderable Item (EMR Catalog Orderable)',
      description: 'البند السريري المعرف في قوائم الأطباء شامل طريقة الإعطاء المبدئية.',
      example: 'Vancomycin IV Infusion Orderable with Renal Protocol',
      owner: 'سجل أوامر الطبيب في Axis 6'
    },
    {
      level: 4,
      concept: 'الاسم التجاري والمنتج المرخص (Brand / Trade Product)',
      english: 'Trade / Proprietary Brand',
      description: 'الاسم التجاري الصادر عن الشركة المصنعة المعتمدة والمرخصة محلياً.',
      example: 'Vancocin 1g (Eli Lilly / Spimaco)',
      owner: 'سجل التراخيص بهيئة الغذاء والدواء SFDA'
    },
    {
      level: 5,
      concept: 'المنتج الصيدلاني القابل للصرف (Dispensable Product)',
      english: 'Dispensable Package Unit',
      description: 'الوحدة الصيدلانية الفعلية التي يتم إعدادها وصرفها للمريض أو الجناح.',
      example: 'Vancocin 1g Vial (Single Unit Package)',
      owner: 'سجل الصرف الصيدلاني (Pharmacy Ops)'
    },
    {
      level: 6,
      concept: 'بند المخزون والمستودع (Inventory SKU / Item)',
      english: 'Warehouse Inventory Item',
      description: 'وحدة الشراء والتخزين المحاسبية في المستودعات المركزية والصيدلية.',
      example: 'Box of 10 Vancocin 1g Vials (SKU-MED-VN-1G-B10)',
      owner: 'نظام إدارة المستودعات وسلسلة الإمداد (ERP / Supply Chain)'
    },
    {
      level: 7,
      concept: 'رقم التشغيلة وتاريخ الانتهاء (Lot / Batch & Expiry)',
      english: 'Manufacturing Batch Lot & Shelf-Life',
      description: 'رقم دورة التصنيع الصادر عن المصنع لضبط الجودة والاستدعاء.',
      example: 'Lot: LT-VN-2026-04, Expiry: 11/2027',
      owner: 'شهادة التحليل المخبرية وسجل الاستلام الصيدلاني'
    },
    {
      level: 8,
      concept: 'العبوة المسلسلة ذات الباركود الثنائي (Serialized Package GS1 DataMatrix)',
      english: 'GS1 2D DataMatrix (GTIN + Serial + Lot + Expiry)',
      description: 'رمز الباركود الذكي على كل عبوة فردية للتحقق من المصدر والتتبع والتسليم الآمن.',
      example: '(01)06281001234567(21)SN998822(17)271130(10)LTVN202604',
      owner: 'نظام التتبع الوطني (رصد / Wasfaty) والتحقق بجانب السرير'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">قاموس المفاهيم والمصطلحات الدوائية (Medication Clinical Concepts & LASA)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700">
                  Architectural Boundary
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                الفصل المعماري بين المفاهيم الطبية وبنود الصرف، وقائمة أدوية شبيهة اللفظ والرسم المعتمدة من ISMP / FDA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'hierarchy'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تدرج المفاهيم الدوائية (8 Levels)
          </button>
          <button
            onClick={() => setActiveTab('tallman')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'tallman'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            أزواج Tall-Man المتشابهة (LASA Pairs)
          </button>
          <button
            onClick={() => setActiveTab('formulary_governance')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'formulary_governance'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            حوكمة الدليل والتقييد (Formulary Governance)
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'hierarchy' && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-teal-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">المبدأ المعماري لسلامة الربط الدوائي:</strong>
                  <p className="text-[11px] text-teal-900 leading-relaxed mt-0.5">
                    لا تقوم وحدة عمليات الصيدلية بإعادة ابتكار دليل الأدوية المركزي أو احتكار مفاهيم الوصف السريري، بل ترتبط بنظام Axis 6 للأوامر الطبية، مع الحفاظ على التمييز الصارم بين بند الطلب (Orderable Item) وبند الصرف (Dispensable Product) وبيانات التشغيلة والباركود المسلسل.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {hierarchyLevels.map(level => (
                  <div key={level.level} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 transition-colors shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-xs">
                          {level.level}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{level.concept}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{level.english}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {level.owner}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2">{level.description}</p>
                    <div className="mt-1.5 p-2 rounded bg-slate-50 border border-slate-100 text-[11px] font-mono text-teal-800">
                      <strong>مثال تطبيقي:</strong> {level.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tallman' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">معايير أحرف Tall-Man المعتمدة من ISMP / FDA:</strong>
                  <p className="text-[11px] text-amber-900 leading-relaxed mt-0.5">
                    تُستخدم الأحرف الإنجليزية الكبيرة في المقاطع المميزة للأسماء المتشابهة لتنبيه الأطباء والصيادلة والتمريض بصرياً ومنع أخطاء التبديل الكارثية بين الأدوية شبيهة اللفظ والرسم (Look-Alike / Sound-Alike).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {ISMP_TALLMAN_CATALOG_PAIRS.map(pair => (
                  <div key={pair.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs font-mono">{pair.pairName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        عالي الخطورة LASA
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-bold font-mono text-teal-900 text-xs">{pair.drugA.tallMan}</span>
                        <div className="text-[11px] text-slate-700 mt-1">{pair.drugA.indication}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">مسار الإعطاء: {pair.drugA.route}</div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-bold font-mono text-teal-900 text-xs">{pair.drugB.tallMan}</span>
                        <div className="text-[11px] text-slate-700 mt-1">{pair.drugB.indication}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">مسار الإعطاء: {pair.drugB.route}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900">
                      <strong>استراتيجية الوقاية التشغيلية:</strong> {pair.mitigationStrategy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'formulary_governance' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">مستويات الحوكمة والتقييد الدوائي (Formulary Restriction Tiers)</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                    <span className="font-bold text-emerald-950 block text-xs">1. أدوية الدليل المفتوح (General Formulary):</span>
                    <p className="text-[11px] text-emerald-900 mt-0.5">
                      متاحة لجميع الأطباء المرخصين بالمنشأة دون اشتراط موافقة مسبقة أو تخصص دقيق.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60">
                    <span className="font-bold text-amber-950 block text-xs">2. أدوية مقيدة بتخصص محدد (Restricted by Specialty):</span>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      تتطلب أن يكون الطبيب الواصف استشارياً أو أخصائياً في قسم معين (مثل المضادات المقيدة للكاربينيم لمرضى العناية المركزة أو الأمراض المعدية).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60">
                    <span className="font-bold text-rose-950 block text-xs">3. أدوية خارج الدليل بموافقة خاصة (Non-Formulary Special Approval):</span>
                    <p className="text-[11px] text-rose-900 mt-0.5">
                      تتطلب تعبئة نموذج تبرير سريري وموافقة رئيس قسم الصيدلة السريرية والمدير الطبي قبل الصرف.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق المرجع
          </button>
        </div>
      </div>
    </div>
  );
};
