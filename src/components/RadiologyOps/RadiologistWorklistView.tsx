import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Eye,
  Edit3,
  UserCheck,
  Search,
  Filter,
  CheckCheck,
  ExternalLink,
  Radio
} from 'lucide-react';
import {
  RadiologistWorklistItem,
  ImagingModality,
  ImagingPriority
} from '../../types/radiologyOps';

interface RadiologistWorklistViewProps {
  readingQueue: RadiologistWorklistItem[];
  onOpenReportComposer: (studyId: string) => void;
  onOpenDicomViewer: (studyId: string) => void;
  onOpenPriorComparison: (studyId: string) => void;
}

export const RadiologistWorklistView: React.FC<RadiologistWorklistViewProps> = ({
  readingQueue,
  onOpenReportComposer,
  onOpenDicomViewer,
  onOpenPriorComparison
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<ImagingModality | 'ALL'>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const filteredItems = useMemo(() => {
    return readingQueue.filter(item => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.accessionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studyDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clinicalIndication.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModality = selectedModality === 'ALL' || item.modality === selectedModality;
      const matchesState =
        selectedState === 'ALL' ||
        (selectedState === 'unassigned' && item.reportingState === 'unassigned') ||
        (selectedState === 'in_reading' && item.reportingState === 'assigned_in_reading') ||
        (selectedState === 'preliminary' && item.reportingState === 'preliminary_signed') ||
        (selectedState === 'delayed' && item.isDelayed);

      return matchesSearch && matchesModality && matchesState;
    });
  }, [readingQueue, searchQuery, selectedModality, selectedState]);

  const getStateBadge = (state: RadiologistWorklistItem['reportingState'], isDelayed: boolean) => {
    if (isDelayed) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>تأخر SLA (Delayed)</span>
        </span>
      );
    }
    switch (state) {
      case 'unassigned':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
            بانتظار الاستلام
          </span>
        );
      case 'assigned_in_reading':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            قيد القراءة الآن
          </span>
        );
      case 'preliminary_signed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            تقرير مبدئي معتمد
          </span>
        );
      case 'final_signed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            تقرير نهائي معتمد ✓
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث في طابور القراءة باسم المريض، رقم الملف، رقم الوصول، أو المؤشر التشخيصي..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            <select
              value={selectedModality}
              onChange={e => setSelectedModality(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="ALL">كافة الأجهزة (All Modalities)</option>
              <option value="CT">أشعة مقطعية (CT)</option>
              <option value="MRI">رنين مغناطيسي (MRI)</option>
              <option value="XR">أشعة عادية (XR)</option>
              <option value="US">موجات صوتية (US)</option>
            </select>

            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="ALL">كافة حالات التقارير</option>
              <option value="unassigned">غير مسند</option>
              <option value="in_reading">قيد القراءة</option>
              <option value="preliminary">تقرير مبدئي</option>
              <option value="delayed">متأخر عن وقت الإنجاز SLA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reading Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>طابور قراءة وكتابة تقارير الأشعة (Radiologist Reading Worklist)</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {filteredItems.length} دراسات
            </span>
          </div>
          <div className="text-xs text-slate-500">
            طابور العمل مخصص لأطباء الأشعة التشخيصية لكتابة واعتماد التقارير
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">المريض / الملف</th>
                <th className="p-3">الفحص ورقم الوصول</th>
                <th className="p-3">الأولوية والخدمة الطالبة</th>
                <th className="p-3">المؤشر السريري</th>
                <th className="p-3">فحوصات سابقة للمقارنة</th>
                <th className="p-3">الوقت المنقضي ومستهدف TAT</th>
                <th className="p-3">حالة التقرير والطبيب</th>
                <th className="p-3 text-center">كتابة التقرير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Patient */}
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.patientName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {item.mrn} • {item.gender === 'male' ? 'ذكر' : 'أنثى'} • {item.age} سنة
                    </div>
                  </td>

                  {/* Study & Accession */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {item.modality}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{item.accessionNumber}</span>
                    </div>
                    <div className="font-medium text-slate-900 line-clamp-1 max-w-[200px]" title={item.studyDescription}>
                      {item.studyDescription}
                    </div>
                  </td>

                  {/* Priority & Service */}
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.priority === 'stat'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                    <div className="text-[11px] text-slate-600 mt-1 truncate max-w-[130px]">
                      {item.requestingService}
                    </div>
                  </td>

                  {/* Indication */}
                  <td className="p-3">
                    <div className="text-slate-700 text-[11px] line-clamp-2 max-w-[210px] leading-relaxed" title={item.clinicalIndication}>
                      {item.clinicalIndication}
                    </div>
                  </td>

                  {/* Priors */}
                  <td className="p-3">
                    {item.comparisonStudiesCount > 0 ? (
                      <button
                        onClick={() => onOpenPriorComparison(item.studyId)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="عرض دراسات المقارنة السابقة"
                      >
                        <History className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.comparisonStudiesCount} فحص سابق</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">لا توجد مقارنات</span>
                    )}
                  </td>

                  {/* TAT Time */}
                  <td className="p-3">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={item.isDelayed ? 'font-bold text-rose-600' : 'text-slate-700'}>
                        {item.elapsedMinutes} دقيقة
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      المستهدف: {item.targetTurnaroundTimeMinutes} دقيقة
                    </div>
                  </td>

                  {/* Reporting State */}
                  <td className="p-3">
                    <div>{getStateBadge(item.reportingState, item.isDelayed)}</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {item.assignedRadiologist || 'طبيب الأشعة المناوب'}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenDicomViewer(item.studyId)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
                        title="فتح عارض الصور التشخيصية DICOM Viewer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenReportComposer(item.studyId)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="كتابة واعتماد تقرير الأشعة"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تحرير التقرير</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
