import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Building,
  Layers,
  FileWarning,
  ArrowRight,
  UserCheck,
  CheckSquare,
  Info,
  Lock,
  Globe2,
  FileText,
  Truck,
  Box
} from 'lucide-react';
import { MedicationRecallRecord } from '../../types/pharmacyOps';

interface MedicationRecallViewProps {
  recalls: MedicationRecallRecord[];
  onQuarantineLocation: (recallId: string, locationName: string) => void;
}

export const MedicationRecallView: React.FC<MedicationRecallViewProps> = ({
  recalls,
  onQuarantineLocation
}) => {
  const [selectedRecall, setSelectedRecall] = useState<MedicationRecallRecord | null>(
    recalls[0] || null
  );

  const getLocationTypeBadge = (type?: string) => {
    switch (type) {
      case 'pharmacy_stock':
        return <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">صيدلية (Pharmacy)</span>;
      case 'ward_stock':
        return <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-bold">جناح تنويم (Ward)</span>;
      case 'adc_stock':
        return <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-900 text-[10px] font-bold">خزانة آلية (ADC)</span>;
      case 'in_transit_stock':
        return <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">قيد النقل (In-Transit)</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">موقع داخلي</span>;
    }
  };

  const getOperationalPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical_emergency':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">أولوية عاجلة قصوى (Critical)</span>;
      case 'high_priority':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">أولوية مرتفعة (High)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-600 text-white">أولوية اعتيادية (Routine)</span>;
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-rose-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">إدارة استدعاء وسحب الأدوية متعددة الأنظمة (Medication Recall & Stock Quarantine)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700">
                P16 Recall Workflow
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              تنفيذ إشعارات الهيئات الرقابية (SFDA / US FDA)، حجر التشغيلات بالمواقع (صيدليات، أجنحة، خزائن ADC، شحنات قيد النقل)، وتوثيق حالة التعرض
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-rose-300">
          إشعارات السحب النشطة: {recalls.filter(r => r.recallStatus !== 'closed_reconciled').length}
        </div>
      </div>

      {/* Regulatory Schema & Traceability Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-950 flex items-start gap-2.5">
          <Globe2 className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sky-900">
              حوكمة التصنيفات الرقابية (Regulatory Authority & Classification Framework):
            </p>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              تصنيفات Class I / II / III تمثل النظام التنظيمي الأمريكي (US FDA Enforcement Reports). يدعم النظام توثيق الهيئة المصدرة (مثل الهيئة العامة للغذاء والدواء SFDA أو FDA)، والتصنيف الأصلي، وحالة البت (Determined vs Not Yet Classified). الإشعارات غير المصنفة نهائياً لا يتم افتراض انخفاض خطورتها بل تحتفظ بأولوية تشغيلية مرتفعة.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">
              حدود تتبع المرضى الأفراد (Individual Patient Traceability Boundary):
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              حصر المخزون في مواقع الصيدليات والأجنحة متاح وموثق. أما بيانات التعرض الفردي للمرضى الذين تم صرف أو إعطاء الدواء لهم تاريخياً فتعرض صراحة: <em>"غير متوفرة / تتطلب ربط نظام التتبع الدوائي وسجل الإعطاء الإلكتروني (Traceability integration required)"</em> لمنع تقديم استنتاجات أمان زائفة.
            </p>
          </div>
        </div>
      </div>

      {/* Recalls Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recalls List */}
        <div className="lg:col-span-6 space-y-3">
          {recalls.map(recall => (
            <div
              key={recall.id}
              onClick={() => setSelectedRecall(recall)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedRecall?.id === recall.id
                  ? 'bg-white border-rose-500 shadow-sm ring-1 ring-rose-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs">{recall.recallReference}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      recall.classificationStatus === 'not_yet_classified'
                        ? 'bg-amber-100 text-amber-950 border border-amber-300 font-mono'
                        : recall.sourceClassification.includes('Class 1') || recall.sourceClassification.includes('Class I')
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {recall.sourceClassification}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    recall.recallStatus === 'active_quarantine_in_progress'
                      ? 'bg-amber-100 text-amber-900 animate-pulse'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {recall.recallStatus === 'active_quarantine_in_progress'
                    ? 'الحجر قيد التنفيذ'
                    : 'اكتمل الحجر والتسوية'}
                </span>
              </div>

              {/* Regulatory Authority Line */}
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="font-bold text-slate-700">{recall.regulatoryAuthority}</span>
                <span>•</span>
                <span>{recall.countryProfile}</span>
              </div>

              <div className="mt-2">
                <div className="font-bold text-slate-900 text-xs">{recall.affectedBrand}</div>
                <div className="text-[11px] text-slate-600 font-mono">{recall.affectedMedication}</div>
                <div className="text-[10px] text-teal-800 font-bold mt-1">
                  رقم التشغيلة المتأثرة: <span className="font-mono">{recall.lotNumber}</span> • الشركة: {recall.manufacturer}
                </div>
              </div>

              <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                <span className="font-bold text-slate-800 block text-[10px]">سبب الاستدعاء:</span>
                <p className="line-clamp-2">{recall.recallReason}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span>الأولوية التشغيلية:</span>
                  {getOperationalPriorityBadge(recall.localOperationalPriority)}
                </div>
                <span className={`font-bold ${recall.outstandingLocationsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {recall.outstandingLocationsCount > 0
                    ? `مواقع معلقة: ${recall.outstandingLocationsCount}`
                    : 'تم حجر كافة المواقع'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Recall Detailed Audit & Quarantine Tracking */}
        <div className="lg:col-span-6">
          {selectedRecall ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4 sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">متابعة حجر المخزون وتوثيق الإشعار</h4>
                  <div className="text-[11px] font-mono text-slate-500">{selectedRecall.recallReference}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span className="font-mono font-bold text-xs text-rose-700">Lot: {selectedRecall.lotNumber}</span>
                </div>
              </div>

              {/* Three-Tier Distinction: Regulatory vs Local Priority vs Workflow Status */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">التصنيف التنظيمي بالمصدر</span>
                  <strong className="text-slate-900 block font-mono text-[11px] mt-0.5">
                    {selectedRecall.sourceClassification}
                  </strong>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    ({selectedRecall.originalClassificationCode})
                  </span>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">الأولوية التشغيلية المحلية</span>
                  <div className="mt-1">
                    {getOperationalPriorityBadge(selectedRecall.localOperationalPriority)}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">سير عمل الحجر</span>
                  <strong className={`block text-[11px] mt-1 font-bold ${selectedRecall.recallStatus === 'active_quarantine_in_progress' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {selectedRecall.recallStatus === 'active_quarantine_in_progress' ? 'قيد التنفيذ' : 'مكتمل'}
                  </strong>
                </div>
              </div>

              {/* Regulatory Source Details */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الهيئة التنظيمية المصدرة:</span>
                  <span className="font-bold text-slate-900">{selectedRecall.regulatoryAuthority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">النظام الرقابي / الدولة:</span>
                  <span className="text-slate-800">{selectedRecall.countryProfile}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">حالة البت بالتصنيف:</span>
                  <span className="font-mono text-slate-800">
                    {selectedRecall.classificationStatus === 'not_yet_classified'
                      ? 'قيد التقييم المخبري (Not Yet Classified - Non-trivial priority retained)'
                      : 'معتمد ومحدد رسمياً (Determined)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">مسؤول السلامة والمتابعة:</span>
                  <span className="text-slate-800 font-medium">{selectedRecall.actionOwner}</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">حالة تقدم الحجر الفيزيائي بالمواقع:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedRecall.affectedLocations.filter(l => l.quarantineStatus === 'completed').length} من {selectedRecall.affectedLocations.length} مواقع مكتملة
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-rose-600 transition-all"
                    style={{
                      width: `${
                        (selectedRecall.affectedLocations.filter(l => l.quarantineStatus === 'completed').length /
                          selectedRecall.affectedLocations.length) *
                        100
                      }%`
                    }}
                  />
                </div>
              </div>

              {/* Affected Locations List (Distinguishing Pharmacy, Ward, ADC, In-Transit) */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs block">
                  المواقع التابعة (صيدليات، أجنحة، خزائن ADC، وشحنات النقل):
                </span>
                <div className="space-y-2">
                  {selectedRecall.affectedLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        loc.quarantineStatus === 'completed'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-rose-50/50 border-rose-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {loc.quarantineStatus === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span>{loc.locationName}</span>
                          {getLocationTypeBadge(loc.locationType)}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          المخزون المسجل: <strong>{loc.initialStockCount}</strong> عبوة • المحجور فعلياً:{' '}
                          <strong className={loc.quarantineStatus === 'completed' ? 'text-emerald-700' : 'text-rose-700'}>
                            {loc.quarantinedCount}
                          </strong>{' '}
                          عبوة
                        </div>
                      </div>

                      <div>
                        {loc.quarantineStatus === 'completed' ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            مكتمل ومحجور
                          </span>
                        ) : (
                          <button
                            onClick={() => onQuarantineLocation(selectedRecall.id, loc.locationName)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <Lock className="w-3 h-3" />
                            <span>تأكيد الحجر الفوري</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traceability & Patient Exposure Panel */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-800 block text-[11px]">
                  حالة تتبع المرضى الأفراد (Patient Exposure Traceability):
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                  {selectedRecall.traceabilityStatus}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              اختر إشعار سحب لاستعراض المواقع المتأثرة وتنفيذ الحجر الفني.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
