import React, { useState } from 'react';
import { Layers, CheckCircle2, ShieldCheck, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { Patient } from '../../../types/his';
import { ClinicalOrderItem } from '../../../types/clinicalOrdersRequests';
import { MOCK_CLINICAL_ORDER_SETS } from '../../../data/mockOrdersRequestsData';
import { useHis } from '../../../context/HisContext';

interface OrderSetReviewerProps {
  patient: Patient;
  onClose: () => void;
  onApplyBatchOrders: (orders: ClinicalOrderItem[]) => void;
}

export const OrderSetReviewer: React.FC<OrderSetReviewerProps> = ({
  patient,
  onClose,
  onApplyBatchOrders
}) => {
  const { currentStaff, playChime } = useHis();

  const [selectedBundleId, setSelectedBundleId] = useState<string>(MOCK_CLINICAL_ORDER_SETS[0].id);
  const activeBundle = MOCK_CLINICAL_ORDER_SETS.find(b => b.id === selectedBundleId) || MOCK_CLINICAL_ORDER_SETS[0];

  // Selection state for individual items in the bundle
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    activeBundle.items.map(item => item.id)
  );

  const handleBundleChange = (id: string) => {
    const bundle = MOCK_CLINICAL_ORDER_SETS.find(b => b.id === id);
    if (!bundle) return;
    setSelectedBundleId(id);
    setSelectedItemIds(bundle.items.map(item => item.id));
  };

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleApply = () => {
    const itemsToCreate = activeBundle.items.filter(item => selectedItemIds.includes(item.id));
    if (itemsToCreate.length === 0) return;

    const generatedOrders: ClinicalOrderItem[] = itemsToCreate.map((item, index) => ({
      id: `ORD-SET-${Date.now().toString().slice(-4)}-${index + 1}`,
      patientId: patient.id,
      encounterId: 'ENC-2026-ER-091',
      encounterLocation: 'قسم الطوارئ والحالات الحرجة',
      category: item.category as any,
      orderTitleAr: item.titleAr,
      orderTitleEn: item.titleEn,
      priority: item.priority as any,
      clinicalIndication: `${activeBundle.nameAr} (${activeBundle.evidenceSource})`,
      orderedBy: {
        id: currentStaff.id,
        name: currentStaff.name,
        role: currentStaff.title || 'طبيب معالج',
        specialty: currentStaff.department || 'الطب السريري'
      },
      orderedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      statusHistory: [
        {
          status: 'active',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          changedBy: currentStaff.name,
          reason: `تفعيل بروتوكول وحزمة: ${activeBundle.nameAr}`
        }
      ],
      resultPipelineStage: item.category !== 'medication' ? 'ordered' : undefined,
      medicationDetails: item.category === 'medication'
        ? {
            catalogId: item.id,
            genericName: item.titleAr,
            brandName: item.titleEn,
            dosageForm: 'قرص / تسريب',
            strength: 'حسب البروتوكول',
            doseAmount: 1,
            doseUnit: 'جرعة',
            route: 'فموي / وريدي',
            frequency: 'حسب البروتوكول',
            startDate: new Date().toISOString().split('T')[0],
            isPrn: false
          }
        : undefined
    }));

    onApplyBatchOrders(generatedOrders);
    playChime('success');
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              حزم وبروتوكولات الأوامر السريرية المعتمدة (Clinical Order Sets & Protocols)
            </h3>
            <p className="text-[11px] text-slate-400">
              حزم موحدة معتمدة من الإرشادات الطبية العالمية والمحلية (Evidence-based Care Bundles)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Protocol Switcher Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
        {MOCK_CLINICAL_ORDER_SETS.map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => handleBundleChange(b.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedBundleId === b.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{b.nameAr}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/15 font-mono">
              {b.items.length} أوامر
            </span>
          </button>
        ))}
      </div>

      {/* Bundle Info Banner */}
      <div className="p-4 bg-teal-50/50 border-b border-teal-100 flex items-start gap-3 text-xs">
        <BookOpen className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-teal-950 font-bold block">{activeBundle.nameAr} ({activeBundle.nameEn})</strong>
          <p className="text-teal-900 mt-1">{activeBundle.clinicalContextAr}</p>
          <div className="text-[11px] text-teal-700 mt-1 font-mono">
            الدليل الاسترشادي: {activeBundle.evidenceSource}
          </div>
        </div>
      </div>

      {/* Items Checklist */}
      <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
          <span>بنود الحزمة المحددة للتطبيق ({selectedItemIds.length} من {activeBundle.items.length}):</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedItemIds(activeBundle.items.map(i => i.id))}
              className="text-teal-700 hover:underline cursor-pointer"
            >
              تحديد الكل
            </button>
            <span>•</span>
            <button
              onClick={() => setSelectedItemIds([])}
              className="text-slate-500 hover:underline cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {activeBundle.items.map(item => {
            const isChecked = selectedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isChecked
                    ? 'bg-white border-teal-500 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by container
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{item.titleAr}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{item.titleEn}</div>
                    {item.rationaleAr && (
                      <div className="text-[10px] text-teal-800 mt-0.5">{item.rationaleAr}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      item.priority === 'stat'
                        ? 'bg-red-100 text-red-700'
                        : item.priority === 'urgent'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>تطبيق الحزمة ينشئ أوامر سريرية مجمعة دفعة واحدة مع الاحتفاظ بمسار التدقيق الفردي.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={selectedItemIds.length === 0}
            onClick={handleApply}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اعتماد وتوقيع الحزمة ({selectedItemIds.length} أمر)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
