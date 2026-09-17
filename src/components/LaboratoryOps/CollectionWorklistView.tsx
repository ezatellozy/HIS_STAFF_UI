import React, { useState } from 'react';
import {
  FlaskConical,
  Barcode,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  AlertTriangle,
  MapPin,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { LabSpecimen, LabOrderPriority } from '../../types/laboratoryOps';

interface CollectionWorklistViewProps {
  specimens: LabSpecimen[];
  onOpenCollectionModal: (specimen: LabSpecimen) => void;
  onPreviewSpecimen: (specimen: LabSpecimen) => void;
  onPrintLabels: (specimen: LabSpecimen) => void;
}

export const CollectionWorklistView: React.FC<CollectionWorklistViewProps> = ({
  specimens,
  onOpenCollectionModal,
  onPreviewSpecimen,
  onPrintLabels
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSpecimens = specimens.filter(s => {
    const matchesSearch =
      s.patientName.includes(searchTerm) ||
      s.mrn.includes(searchTerm) ||
      s.specimenBarcode.includes(searchTerm) ||
      s.collectionLocation.includes(searchTerm);

    const matchesPriority = priorityFilter === 'all' || s.collectionPriority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-black text-slate-900">
              قائمة عمل سحب العينات (Phlebotomy & Specimen Collection Worklist)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة مهام سحب الدم والمسحات الميدانية • مطابقة الإسورة بالباركود • توثيق موقع وزمن السحب.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="بحث بالمريض أو الموقع أو الباركود..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-52 text-right focus:ring-2 focus:ring-teal-500"
          />

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الأولويات</option>
            <option value="stat">STAT (طارئ فوري)</option>
            <option value="urgent">Urgent (مستعجل)</option>
            <option value="routine">Routine (روتيني)</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الحالات</option>
            <option value="pending_collection">بانتظار السحب (Pending)</option>
            <option value="collected">تم السحب (Collected)</option>
            <option value="rejected">مرفوضة (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Specimens Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">باركود العينة والمريض</th>
              <th className="p-3">الموقع والسرير</th>
              <th className="p-3">نوع الأنبوب والوعاء</th>
              <th className="p-3">الأولوية والوقت</th>
              <th className="p-3">تعليمات خاصة</th>
              <th className="p-3">حالة السحب</th>
              <th className="p-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredSpecimens.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  لا توجد عينات مطابقة للمعايير المحددة
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
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{specimen.collectionLocation}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      زيارة: {specimen.encounterId}
                    </span>
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
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mb-1 ${
                        specimen.collectionPriority === 'stat'
                          ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                          : specimen.collectionPriority === 'urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {specimen.collectionPriority.toUpperCase()}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      مجدول: {specimen.scheduledCollectionTime}
                    </div>
                  </td>

                  <td className="p-3 text-[11px] text-slate-600 max-w-xs">
                    {specimen.specialInstructions ? (
                      <span className="bg-amber-50 text-amber-900 border border-amber-200/60 p-1.5 rounded-lg block text-[10px] font-medium leading-tight">
                        {specimen.specialInstructions}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">بروتوكول قياسي</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-block ${
                        specimen.status === 'collected'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : specimen.status === 'pending_collection'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : specimen.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {specimen.status === 'collected'
                        ? 'تم السحب'
                        : specimen.status === 'pending_collection'
                        ? 'بانتظار السحب'
                        : specimen.status === 'rejected'
                        ? 'عينة مرفوضة'
                        : specimen.status}
                    </span>
                    {specimen.collectedDateTime && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        {specimen.collectedDateTime}
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

                      <button
                        onClick={() => onPrintLabels(specimen)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="طباعة ملصق الباركود (Barcode Print Simulation)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {specimen.status === 'pending_collection' ? (
                        <button
                          onClick={() => onOpenCollectionModal(specimen)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>توثيق السحب</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                          تم التوثيق
                        </span>
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
