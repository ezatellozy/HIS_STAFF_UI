import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Activity,
  Calendar,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Clock,
  Radio,
  FileCheck,
  CheckCircle2,
  Syringe,
  Bed,
  Layers
} from 'lucide-react';
import {
  IncomingImagingRequest,
  ImagingModality,
  ImagingPriority
} from '../../types/radiologyOps';

interface IncomingRequestsViewProps {
  requests: IncomingImagingRequest[];
  onOpenProtocoling: (req: IncomingImagingRequest) => void;
  onOpenScheduling: (req: IncomingImagingRequest) => void;
  onOpenSafetyReview: (patientId: string, modality: ImagingModality) => void;
  onOpenQuickPreview: (req: IncomingImagingRequest) => void;
  onDeepLinkAxis6: (patientId: string, orderId: string) => void;
}

export const IncomingRequestsView: React.FC<IncomingRequestsViewProps> = ({
  requests,
  onOpenProtocoling,
  onOpenScheduling,
  onOpenSafetyReview,
  onOpenQuickPreview,
  onDeepLinkAxis6
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<ImagingModality | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<ImagingPriority | 'ALL'>('ALL');
  const [selectedSchedulingFilter, setSelectedSchedulingFilter] = useState<'ALL' | 'unscheduled' | 'scheduled'>('ALL');

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch =
        req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.examNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.examNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.clinicalIndication.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModality = selectedModality === 'ALL' || req.modality === selectedModality;
      const matchesPriority = selectedPriority === 'ALL' || req.priority === selectedPriority;
      const matchesScheduling =
        selectedSchedulingFilter === 'ALL' ||
        (selectedSchedulingFilter === 'unscheduled' && req.schedulingStatus === 'unscheduled') ||
        (selectedSchedulingFilter === 'scheduled' && req.schedulingStatus !== 'unscheduled');

      return matchesSearch && matchesModality && matchesPriority && matchesScheduling;
    });
  }, [requests, searchQuery, selectedModality, selectedPriority, selectedSchedulingFilter]);

  const getPriorityBadge = (priority: ImagingPriority) => {
    switch (priority) {
      case 'stat':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            <span>STAT (عاجل فوري)</span>
          </span>
        );
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Urgent (أولوية)
          </span>
        );
      case 'routine':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Routine (اعتيادي)
          </span>
        );
    }
  };

  const getModalityBadge = (mod: ImagingModality) => {
    const colors: Record<ImagingModality, string> = {
      XR: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      CT: 'bg-blue-50 text-blue-800 border-blue-200',
      MRI: 'bg-purple-50 text-purple-800 border-purple-200',
      US: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      FL: 'bg-amber-50 text-amber-800 border-amber-200',
      MAMMO: 'bg-pink-50 text-pink-800 border-pink-200',
      IR: 'bg-rose-50 text-rose-800 border-rose-200',
      NM: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${colors[mod]}`}>
        {mod}
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث برقم الملف MRN، اسم المريض، رقم الطلب، الفحص، أو المؤشر السريري..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            {/* Modality Filter */}
            <select
              value={selectedModality}
              onChange={e => setSelectedModality(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="ALL">جميع الأجهزة (All Modalities)</option>
              <option value="XR">أشعة سينية (XR)</option>
              <option value="CT">أشعة مقطعية (CT)</option>
              <option value="MRI">رنين مغناطيسي (MRI)</option>
              <option value="US">موجات صوتية (US)</option>
              <option value="IR">أشعة تداخلية (IR)</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="ALL">كافة الأولويات</option>
              <option value="stat">STAT عاجل فوري</option>
              <option value="urgent">Urgent أولوية</option>
              <option value="routine">Routine اعتيادي</option>
            </select>

            {/* Scheduling Filter */}
            <select
              value={selectedSchedulingFilter}
              onChange={e => setSelectedSchedulingFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="ALL">كافة الحالات المجدولة</option>
              <option value="unscheduled">غير مجدول فقط</option>
              <option value="scheduled">مجدول / مباشر</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              قائمة طلبات الأشعة والتصوير الواردة (Incoming Imaging Orders)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {filteredRequests.length} طلب
            </span>
          </div>
          <div className="text-xs text-slate-500">
            المصدر الأصلي: محفظة أوامر الطبيب المعالج (Patient Workspace Axis 6)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">المريض / الملف MRN</th>
                <th className="p-3">رقم الطلب / المصدر</th>
                <th className="p-3">الجهاز / الفحص المطلوب</th>
                <th className="p-3">المؤشر السريري (Indication)</th>
                <th className="p-3">الأولوية والوقت</th>
                <th className="p-3">الموقع والحركة</th>
                <th className="p-3">الصبغة / الأمان</th>
                <th className="p-3">البروتوكول والجدولة</th>
                <th className="p-3 text-center">الإجراءات التشغيلية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    لا توجد طلبات تصوير مطابقة لمعايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr
                    key={req.id}
                    className="hover:bg-teal-50/30 transition-colors group"
                  >
                    {/* Patient & MRN */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {req.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{req.mrn}</span>
                        <span>•</span>
                        <span>{req.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                        <span>•</span>
                        <span>{req.age} سنة</span>
                      </div>
                    </td>

                    {/* Request ID & Axis 6 Bridge */}
                    <td className="p-3">
                      <div className="font-mono text-slate-800 font-semibold">
                        {req.id}
                      </div>
                      <button
                        onClick={() => onDeepLinkAxis6(req.patientId, req.orderSourceId)}
                        className="text-[11px] text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                        title="فتح أمر الخدمة الأصلي في محفظة المريض السريرية Axis 6"
                      >
                        <span>أمر Axis 6</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>

                    {/* Modality & Exam */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getModalityBadge(req.modality)}
                        <span className="text-[10px] text-slate-400 font-mono">({req.bodyRegion})</span>
                      </div>
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={req.examNameAr}>
                        {req.examNameAr}
                      </div>
                    </td>

                    {/* Indication */}
                    <td className="p-3">
                      <div className="text-slate-700 line-clamp-2 max-w-[220px] text-[11px] leading-relaxed" title={req.clinicalIndication}>
                        {req.clinicalIndication}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        الطالب: {req.requestingClinician.name}
                      </div>
                    </td>

                    {/* Priority & Time */}
                    <td className="p-3">
                      <div>{getPriorityBadge(req.priority)}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        {req.requestedDateTime.split(' ')[1]}
                      </div>
                    </td>

                    {/* Location & Mobility */}
                    <td className="p-3">
                      <div className="text-[11px] font-medium text-slate-800 truncate max-w-[130px]">
                        {req.originLocation.split('-')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Bed className="w-3 h-3 text-slate-400" />
                        <span>
                          {req.mobilityContext === 'stretcher' ? 'نقالة (Stretcher)' :
                           req.mobilityContext === 'wheelchair' ? 'كرسي متحرك' :
                           req.mobilityContext === 'bed_portable' ? 'متنقل بالسرير' : 'حركة مستقلة'}
                        </span>
                      </div>
                    </td>

                    {/* Contrast & Safety Context */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          req.contrastRequired !== 'none'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {req.contrastRequired !== 'none' ? 'يتطلب صبغة' : 'بدون صبغة'}
                        </span>
                        <button
                          onClick={() => onOpenSafetyReview(req.patientId, req.modality)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-teal-700 cursor-pointer"
                          title="مراجعة ملف أمان المريض والفحوصات المخبرية"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Protocol & Scheduling */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${
                          req.protocolStatus === 'radiologist_approved' ? 'bg-emerald-500' :
                          req.protocolStatus === 'auto_selected' ? 'bg-blue-500' : 'bg-amber-500'
                        }`} />
                        <span className="font-medium text-slate-700">
                          {req.assignedProtocolName ? 'بروتوكول معتمد' : 'بانتظار البروتوكول'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {req.schedulingStatus === 'scheduled' ? 'مجدول بموعد' :
                         req.schedulingStatus === 'walk_in_direct' ? 'دخول مباشر STAT' : 'غير مجدول'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenProtocoling(req)}
                          className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          title="تحديد أو اعتماد البروتوكول الشعاعي"
                        >
                          بروتوكول
                        </button>

                        <button
                          onClick={() => onOpenScheduling(req)}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                          title="جدولة الفحص أو تعيين الغرفة"
                        >
                          جدولة
                        </button>

                        <button
                          onClick={() => onOpenQuickPreview(req)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
                          title="المعاينة السريعة"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
