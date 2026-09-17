import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Thermometer,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Barcode,
  Sparkles
} from 'lucide-react';
import { LabSpecimen } from '../../types/laboratoryOps';

interface SpecimenReceptionViewProps {
  specimens: LabSpecimen[];
  onAcceptSpecimen: (specimenId: string) => void;
  onOpenRejectionModal: (specimen: LabSpecimen) => void;
  onPreviewSpecimen: (specimen: LabSpecimen) => void;
  onQuickAccession: (specimen: LabSpecimen) => void;
}

export const SpecimenReceptionView: React.FC<SpecimenReceptionViewProps> = ({
  specimens,
  onAcceptSpecimen,
  onOpenRejectionModal,
  onPreviewSpecimen,
  onQuickAccession
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending_receipt' | 'accepted' | 'rejected'>('pending_receipt');

  const filteredSpecimens = specimens.filter(s => {
    const matchesSearch =
      s.patientName.includes(searchTerm) ||
      s.mrn.includes(searchTerm) ||
      s.specimenBarcode.includes(searchTerm);

    if (activeTab === 'pending_receipt') {
      return matchesSearch && (s.status === 'collected' || s.status === 'in_transit');
    }
    if (activeTab === 'accepted') {
      return matchesSearch && s.status === 'accepted';
    }
    if (activeTab === 'rejected') {
      return matchesSearch && s.status === 'rejected';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Header and Governance Rule Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-black text-slate-900">
              استقبال العينات وفرزها المركزي (Central Reception & Specimen Sorting Bench)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            <strong>قاعدة الحوكمة الصارمة:</strong> السحب (Collection) ≠ الاستلام (Receipt) ≠ الترقيم المخبري (Accessioning). وصول العينة للمختبر يتطلب فحصاً فيزيائياً ومطابقة قبل بدء التحليل.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="مسح أو بحث بالباركود..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-52 text-right focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Reception Workbench Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending_receipt')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending_receipt'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>عينات واصلة بانتظار الاستلام والفرز ({specimens.filter(s => s.status === 'collected' || s.status === 'in_transit').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'accepted'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>عينات مقبولة وجاهزة للترقيم ({specimens.filter(s => s.status === 'accepted').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'rejected'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>عينات مرفوضة وتتطلب إعادة سحب ({specimens.filter(s => s.status === 'rejected').length})</span>
        </button>
      </div>

      {/* Table of Specimens */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">باركود العينة والمريض</th>
              <th className="p-3">نوع الأنبوب والحاوية</th>
              <th className="p-3">وقت وتوثيق السحب</th>
              <th className="p-3">حالة النقل والحرارة</th>
              <th className="p-3">تقييم الجودة والقبول</th>
              <th className="p-3 text-center">الإجراء الفني</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredSpecimens.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  لا توجد عينات في هذا المسار حالياً
                </td>
              </tr>
            ) : (
              filteredSpecimens.map(specimen => (
                <tr key={specimen.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-sm">{specimen.patientName}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>{specimen.mrn}</span>
                      <span>•</span>
                      <span className="font-bold text-amber-700">{specimen.specimenBarcode}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs"
                        style={{ backgroundColor: specimen.containerColorHex }}
                      />
                      <div>
                        <div className="font-bold text-slate-800">{specimen.containerType}</div>
                        <div className="text-[10px] text-slate-500">{specimen.specimenType}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-slate-800 font-bold">{specimen.collectedDateTime || 'غير مسجل'}</div>
                    <div className="text-[10px] text-slate-500">{specimen.collectorName}</div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                      <span>{specimen.temperatureAtReceipt || '22.0°C (درجة حرارة الغرفة)'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      نقل: {specimen.transportCondition}
                    </span>
                  </td>

                  <td className="p-3">
                    {specimen.status === 'accepted' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مقبولة ومطابقة للمعايير</span>
                      </span>
                    ) : specimen.status === 'rejected' ? (
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px] inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>مرفوضة: {specimen.rejectionInfo?.reasonCode}</span>
                        </span>
                        <p className="text-[10px] text-red-700 leading-tight">
                          {specimen.rejectionInfo?.reasonDescription}
                        </p>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                        قيد الفحص البصري بالاستقبال
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPreviewSpecimen(specimen)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="معاينة تفاصيل العينة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {specimen.status !== 'accepted' && specimen.status !== 'rejected' && (
                        <>
                          <button
                            onClick={() => onAcceptSpecimen(specimen.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>قبول واستلام</span>
                          </button>

                          <button
                            onClick={() => onOpenRejectionModal(specimen)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>رفض العينة</span>
                          </button>
                        </>
                      )}

                      {specimen.status === 'accepted' && (
                        <button
                          onClick={() => onQuickAccession(specimen)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>ترقيم وإرسال للأجهزة (Accession)</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
