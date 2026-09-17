import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  GitFork,
  ExternalLink,
  ChevronRight,
  User,
  Building2,
  Eye,
  MessageSquare,
  ShieldAlert,
  AlertCircle,
  FileCheck,
  Activity,
  Layers,
  PhoneCall
} from 'lucide-react';
import { HandoverCoordinationItem, HandoverViewFilter } from '../../types/clinicalUtilities';
import { SourceChangedAlert } from './SourceChangedAlert';
import { SharedPatientQuickPreview } from '../Shared/SharedPatientQuickPreview';
import { useHis } from '../../context/HisContext';

interface HandoverCenterProps {
  handovers: HandoverCoordinationItem[];
  onUpdateHandover: (updated: HandoverCoordinationItem) => void;
  onNavigateToMessages: (threadId?: string, patientId?: string) => void;
}

export const HandoverCenter: React.FC<HandoverCenterProps> = ({
  handovers,
  onUpdateHandover,
  onNavigateToMessages
}) => {
  const { openPatientWorkspace } = useHis();

  const [activeFilter, setActiveFilter] = useState<HandoverViewFilter>('awaiting_receipt');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHandoverId, setSelectedHandoverId] = useState<string>(handovers[0]?.id || '');
  const [previewPatientId, setPreviewPatientId] = useState<string | null>(null);
  const [isShiftReviewMode, setIsShiftReviewMode] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const filteredHandovers = handovers.filter(item => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sendingTeam.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.receivingTeam.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.currentLocation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'incoming':
        return item.handoverStatus !== 'received' && item.handoverStatus !== 'superseded';
      case 'outgoing':
        return item.sendingTeam.unit.includes('ER') || item.sendingTeam.unit.includes('Night');
      case 'awaiting_receipt':
        return item.handoverStatus === 'awaiting_receipt';
      case 'received':
        return item.handoverStatus === 'received';
      case 'shift_related':
        return item.handoverType === 'shift_change';
      case 'transfer_related':
        return item.handoverType === 'unit_transfer' || item.handoverType === 'procedure_transit';
      case 'recent':
      default:
        return true;
    }
  });

  const selectedHandover = handovers.find(h => h.id === selectedHandoverId) || filteredHandovers[0];

  const handleOpenWorkspace = (patientId: string, activity: 'timeline' | 'summary') => {
    openPatientWorkspace(patientId, {
      defaultActivity: activity,
      originWorkArea: 'clinical_utilities',
      utilityTab: 'handovers',
      utilitySelectedId: selectedHandover?.id,
      utilityFilter: activeFilter,
      utilitySearch: searchQuery
    });
  };

  const handleAcknowledgeReceipt = (handover: HandoverCoordinationItem) => {
    const updated: HandoverCoordinationItem = {
      ...handover,
      handoverStatus: 'received',
      acknowledgedBy: 'د. طارق المنشاوي (الفريق الصباحي المستلم)',
      acknowledgedAt: 'الآن'
    };
    onUpdateHandover(updated);
    setActionSuccessMsg('تم تأكيد استلام الحالة السريرية بنجاح وتحديث السجل في مسار المريض (Axis 10).');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const getTypeBadge = (type: HandoverCoordinationItem['handoverType']) => {
    switch (type) {
      case 'shift_change':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            تسليم مناوبة (Shift)
          </span>
        );
      case 'unit_transfer':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
            نقل بين الأقسام (Transfer)
          </span>
        );
      case 'procedure_transit':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
            عمليات وإفاقة (OR / PACU)
          </span>
        );
      case 'inter_facility':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
            نقل خارجي
          </span>
        );
    }
  };

  const getStatusBadge = (status: HandoverCoordinationItem['handoverStatus']) => {
    switch (status) {
      case 'awaiting_receipt':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            بانتظار الاستلام
          </span>
        );
      case 'received':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            تم الاستلام
          </span>
        );
      case 'superseded':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
            مُعدّل / تم استبداله
          </span>
        );
      case 'draft':
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">مسودة</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Semantic Distinction Banner */}
      <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-950 text-xs flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>مركز تسليم واستلام الحالات (Handover Center):</strong> تنسيق التسليم عبر الأقسام والمناوبات. التفاصيل الطبية الدقيقة ونموذج SBAR الكامل موثقة في <strong>Axis 10 (مسار المريض والتسليم)</strong>.
          </span>
        </div>
        <span className="text-[11px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-300 shrink-0">
          Handover Coordination ≠ Axis 10 Legal Record
        </span>
      </div>

      {/* Filter Tabs & Shift Review Mode Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('awaiting_receipt')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'awaiting_receipt'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              بانتظار الاستلام ({handovers.filter(h => h.handoverStatus === 'awaiting_receipt').length})
            </button>
            <button
              onClick={() => setActiveFilter('incoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'incoming' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              الواردة للقسم
            </button>
            <button
              onClick={() => setActiveFilter('outgoing')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'outgoing' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              الصادرة من القسم
            </button>
            <button
              onClick={() => setActiveFilter('shift_related')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'shift_related'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              تسليم المناوبات
            </button>
            <button
              onClick={() => setActiveFilter('transfer_related')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'transfer_related'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              النقل بين الوحدات
            </button>
            <button
              onClick={() => setActiveFilter('received')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'received' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              المستلمة والمؤكدة
            </button>
          </div>

          {/* Shift Review Mode Button */}
          <button
            onClick={() => setIsShiftReviewMode(!isShiftReviewMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isShiftReviewMode
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isShiftReviewMode ? 'الخروج من وضع مراجعة المناوبة' : 'وضع مراجعة تسليم المناوبة (Shift Review)'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="البحث باسم المريض، الرقم الطبي MRN، الفريق المسلّم، أو موقع التنويم..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Split-Pane Layout (Dense List + Detail Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Dense List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[780px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>قائمة تسليم الحالات ({filteredHandovers.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">اضغط للمعاينة والتأكيد</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto p-1.5 space-y-1">
            {filteredHandovers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد حالات تسليم مطابقة لمعايير البحث الحالية
              </div>
            ) : (
              filteredHandovers.map(item => {
                const isSelected = selectedHandover?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedHandoverId(item.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                        : 'hover:bg-slate-50/80 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {item.patientName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-xs">{item.patientName}</h4>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1 rounded">
                              {item.mrn}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">{item.currentLocation}</p>
                        </div>
                      </div>
                      {getStatusBadge(item.handoverStatus)}
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      {getTypeBadge(item.handoverType)}
                      {item.criticalAttentionIndicator && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-black text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          انتباه حرج
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      <strong>المسلّم:</strong> {item.sendingTeam.service} ➔ <strong>المستلم:</strong> {item.receivingTeam.service}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.handoverTime}</span>
                      </div>
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {item.outstandingContextCount} مهام ومتابعات معلقة
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Handover Preview / Coordination Pane (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {selectedHandover ? (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Superseded Warning Banner if applicable */}
              {selectedHandover.isSourceSuperseded && (
                <SourceChangedAlert
                  titleAr="تنبيه: تم تعديل أو استبدال نموذج التسليم الأصلي"
                  messageAr={
                    selectedHandover.supersededReason ||
                    'تم تعديل بيانات التسليم أو وجهة النقل. يرجى الرجوع لنموذج التسليم الأحدث في Axis 10.'
                  }
                  type="superseded"
                />
              )}

              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Patient Identity & Location Header */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-black text-sm flex items-center justify-center">
                    {selectedHandover.patientName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-white">{selectedHandover.patientName}</h3>
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-xs border border-blue-800">
                        {selectedHandover.mrn}
                      </span>
                      <span className="text-xs text-slate-300">
                        {selectedHandover.age} سنة • {selectedHandover.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      الموقع الحالي: <strong>{selectedHandover.currentLocation}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewPatientId(selectedHandover.patientId)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>معاينة سريعة</span>
                </button>
              </div>

              {/* Status & Timing Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">نوع التسليم السريري</div>
                  <div>{getTypeBadge(selectedHandover.handoverType)}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">حالة الاستلام والتأكيد</div>
                  <div>{getStatusBadge(selectedHandover.handoverStatus)}</div>
                  {selectedHandover.acknowledgedBy && (
                    <div className="text-[10px] text-emerald-700 font-medium mt-1">
                      {selectedHandover.acknowledgedBy}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">وقت التسليم المسجل</div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedHandover.handoverTime}</span>
                  </div>
                </div>
              </div>

              {/* Critical Attention Callout if flagged */}
              {selectedHandover.criticalAttentionIndicator && selectedHandover.criticalAlertNote && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs mb-0.5">تنبيه انتباه حرج (Critical Attention):</h5>
                    <p className="text-[11px] leading-relaxed">{selectedHandover.criticalAlertNote}</p>
                  </div>
                </div>
              )}

              {/* Sending vs Receiving Teams Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1 text-xs">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الفريق المسلّم (Sending Team)</div>
                  <div className="font-bold text-slate-900">{selectedHandover.sendingTeam.service}</div>
                  <div className="text-slate-600">{selectedHandover.sendingTeam.clinician} ({selectedHandover.sendingTeam.role})</div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>الوحدة: {selectedHandover.sendingTeam.unit}</span>
                    {selectedHandover.sendingTeam.contactNumber && (
                      <span className="flex items-center gap-1 font-mono text-teal-700">
                        <PhoneCall className="w-3 h-3" />
                        {selectedHandover.sendingTeam.contactNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1 text-xs">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الفريق المستلم (Receiving Team)</div>
                  <div className="font-bold text-slate-900">{selectedHandover.receivingTeam.service}</div>
                  <div className="text-slate-600">
                    {selectedHandover.receivingTeam.clinician
                      ? `${selectedHandover.receivingTeam.clinician} (${selectedHandover.receivingTeam.role})`
                      : 'بانتظار تخصيص الطبيب المستلم'}
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">الوحدة: {selectedHandover.receivingTeam.unit}</div>
                </div>
              </div>

              {/* Configured Handover Template Summary Cards */}
              <div className="space-y-2">
                {(() => {
                  const projection = selectedHandover.summaryProjection;
                  const templateName = projection?.templateName || 'قالب SBAR الموحد (Default Profile)';
                  const sections = projection?.sections && projection.sections.length > 0
                    ? [...projection.sections].sort((a, b) => a.displayOrder - b.displayOrder)
                    : selectedHandover.sbarSummary
                    ? [
                        { key: 'situation', label: 'S — الوضع الحالي (Situation)', content: selectedHandover.sbarSummary.situation, displayOrder: 1 },
                        { key: 'background', label: 'B — الخلفية المرضية (Background)', content: selectedHandover.sbarSummary.background, displayOrder: 2 },
                        { key: 'assessment', label: 'A — التقييم السريري (Assessment)', content: selectedHandover.sbarSummary.assessment, displayOrder: 3 },
                        { key: 'recommendation', label: 'R — التوصيات والخطة (Recommendation)', content: selectedHandover.sbarSummary.recommendation, displayOrder: 4 }
                      ]
                    : [];

                  return (
                    <>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <span>ملخص قالب التسليم السريري المهيأ:</span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-bold text-[10px]">
                            {templateName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">المصدر: سجل التسليم السريري الرسمي في Axis 10 (Formal Handover Record)</span>
                      </h4>

                      <div className={`grid grid-cols-1 ${sections.length > 1 ? 'sm:grid-cols-2' : ''} gap-2 text-xs`}>
                        {sections.map(sec => (
                          <div key={sec.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="font-bold text-slate-900 text-[11px] mb-1">
                              {sec.label}:
                            </div>
                            <p className="text-slate-700 text-[11px] leading-relaxed whitespace-pre-line">
                              {sec.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Outstanding Context & Tasks Count */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>
                    المهام والمتابعات السريرية المعلقة لهذا المريض: <strong>{selectedHandover.outstandingContextCount} عناصر</strong> (نتائج مخبرية، أوامر دوائية، تقييمات تمريض)
                  </span>
                </div>
                <button
                  onClick={() => handleOpenWorkspace(selectedHandover.patientId, 'timeline')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                >
                  فحص التفاصيل
                </button>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenWorkspace(selectedHandover.patientId, 'timeline')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>فتح التسليم في مسار المريض (Axis 10)</span>
                  </button>

                  <button
                    onClick={() => handleOpenWorkspace(selectedHandover.patientId, 'summary')}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح الملف السريري (Axis 1)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToMessages(undefined, selectedHandover.patientId)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>مراسلة الفريق المسلّم</span>
                  </button>

                  {selectedHandover.handoverStatus === 'awaiting_receipt' && !selectedHandover.isSourceSuperseded && (
                    <button
                      onClick={() => handleAcknowledgeReceipt(selectedHandover)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تأكيد واستلام الحالة رسميًا</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              حدد حالة تسليم من القائمة لمعاينة ملخص SBAR وإتمام إجراءات الاستلام
            </div>
          )}
        </div>
      </div>

      {/* Quick Preview Slide-Over Drawer */}
      {previewPatientId && (
        <SharedPatientQuickPreview
          patientId={previewPatientId}
          isOpen={true}
          onClose={() => setPreviewPatientId(null)}
          onOpenFullWorkspace={pid => handleOpenWorkspace(pid, 'summary')}
        />
      )}
    </div>
  );
};
