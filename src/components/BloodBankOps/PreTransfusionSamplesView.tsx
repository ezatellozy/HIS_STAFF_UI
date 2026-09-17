import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  User,
  ExternalLink,
  ChevronRight,
  Droplet,
  Info
} from 'lucide-react';
import { PreTransfusionSample, SampleValidityStatus } from '../../types/bloodBankOps';

interface PreTransfusionSamplesViewProps {
  samples: PreTransfusionSample[];
  onSelectSample: (sample: PreTransfusionSample) => void;
  onOpenGroupingWorkspace: (sampleId: string) => void;
  onOpenAntibodyWorkspace: (sampleId: string) => void;
}

export const PreTransfusionSamplesView: React.FC<PreTransfusionSamplesViewProps> = ({
  samples,
  onSelectSample,
  onOpenGroupingWorkspace,
  onOpenAntibodyWorkspace
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [validityFilter, setValidityFilter] = useState<string>('all');

  const filteredSamples = samples.filter(s => {
    const matchesSearch =
      s.patientName.includes(searchTerm) ||
      s.mrn.includes(searchTerm) ||
      s.id.includes(searchTerm) ||
      s.barcode.includes(searchTerm);

    const matchesValidity = validityFilter === 'all' || s.validityStatus === validityFilter;

    return matchesSearch && matchesValidity;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls & Policy Context */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">سجل عينات ما قبل نقل الدم (Pre-Transfusion Samples Worklist)</h2>
              <p className="text-xs text-slate-500">
                التحقق الصارم من هوية العينة، مطابقة الأنبوبة، وسياسة مدة الصلاحية (Configured Sample Validity Model)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث برقم العينة، الباركود، المريض أو MRN..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-64 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={validityFilter}
              onChange={e => setValidityFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">جميع الحالات ({samples.length})</option>
              <option value="valid">عينات صالحة</option>
              <option value="expiring_soon">تنتهي قريباً</option>
              <option value="expired">منتهية الصلاحية</option>
              <option value="review_required">تتطلب تدقيق إضافي</option>
            </select>
          </div>
        </div>

        {/* Policy Callout Banner */}
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              قاعدة بنك الدم المعتمدة: كل عينة يجب أن تخضع للتحقق من الهوية الثنائية (معرفين مستقلين) عند السحب، وتكون صالحة وفق سياسة الـ 72 ساعة السريرية.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
            AABB / CBAHI Aligned Model
          </span>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">معرف العينة والباركود</th>
                <th className="p-3.5">المريض والملف الطبي</th>
                <th className="p-3.5">الموقع وقناة السحب</th>
                <th className="p-3.5">نوع الأنبوبة</th>
                <th className="p-3.5">ساعة السحب والاستلام</th>
                <th className="p-3.5">صلاحية العينة والسياسة</th>
                <th className="p-3.5 text-center">الإجراءات المخبرية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSamples.map(sample => (
                <tr
                  key={sample.id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectSample(sample)}
                >
                  {/* Sample ID & Barcode */}
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-blue-900 text-xs flex items-center gap-1.5">
                      <span>{sample.id}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                      Barcode: {sample.barcode}
                    </div>
                    {sample.identificationVerificationDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مؤكد بالهوية الثنائية</span>
                      </span>
                    )}
                  </td>

                  {/* Patient Info */}
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{sample.patientName}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">{sample.mrn}</div>
                    {sample.historicalGroupContext && (
                      <div className="text-[10px] text-red-700 font-medium mt-0.5">
                        فصيلة تاريخية: {sample.historicalGroupContext.displayAr}
                      </div>
                    )}
                  </td>

                  {/* Location & Collector */}
                  <td className="p-3.5">
                    <div className="text-slate-800 font-medium">{sample.collectionLocation}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      بواسطة: {sample.collectorName} ({sample.collectorRole})
                    </div>
                  </td>

                  {/* Tube Type */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]">
                      {sample.tubeType}
                    </span>
                  </td>

                  {/* Timestamps */}
                  <td className="p-3.5">
                    <div className="text-slate-700">سُحبت: {sample.collectedAt}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">استُلمت: {sample.receivedAt}</div>
                  </td>

                  {/* Validity */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sample.validityStatus === 'valid' ? 'bg-emerald-100 text-emerald-800' :
                        sample.validityStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sample.validityStatus === 'valid' ? 'صالحة للفحص' :
                         sample.validityStatus === 'expiring_soon' ? 'تنتهي قريباً' : 'منتهية'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 font-bold">{sample.validUntil}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate" title={sample.validityPolicyDescription}>
                      {sample.validityPolicyDescription}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenGroupingWorkspace(sample.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-[11px] transition-colors shadow-2xs"
                        title="إجراء أو استعراض فحص الفصيلة الأمامي والخلفي"
                      >
                        فحص الفصيلة (ABO/Rh)
                      </button>
                      <button
                        onClick={() => onOpenAntibodyWorkspace(sample.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[11px] transition-colors shadow-2xs"
                        title="إجراء أو استعراض مسح الأجسام المضادة"
                      >
                        مسح الأضداد (Screen)
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSamples.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    لا توجد عينات تطابق خيارات البحث الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
