import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  Filter,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  Briefcase,
  Layers,
  Send,
  Eye,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { ConsultCoordinationItem, ConsultViewFilter } from '../../types/clinicalUtilities';
import { SourceChangedAlert } from './SourceChangedAlert';
import { SharedPatientQuickPreview } from '../Shared/SharedPatientQuickPreview';
import { useHis } from '../../context/HisContext';

interface ConsultationCoordinationCenterProps {
  consults: ConsultCoordinationItem[];
  onUpdateConsult: (updated: ConsultCoordinationItem) => void;
  onNavigateToMessages: (threadId?: string, patientId?: string) => void;
  onNavigateToMyWork: (workItemId?: string) => void;
}

export const ConsultationCoordinationCenter: React.FC<ConsultationCoordinationCenterProps> = ({
  consults,
  onUpdateConsult,
  onNavigateToMessages,
  onNavigateToMyWork
}) => {
  const { openPatientWorkspace } = useHis();

  const [activeFilter, setActiveFilter] = useState<ConsultViewFilter>('incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'stat' | 'urgent' | 'routine'>('all');
  const [selectedConsultId, setSelectedConsultId] = useState<string>(consults[0]?.id || '');
  const [previewPatientId, setPreviewPatientId] = useState<string | null>(null);

  // Coordination chat mock message within preview
  const [coordinationNoteInput, setCoordinationNoteInput] = useState('');
  const [coordinationSuccessMsg, setCoordinationSuccessMsg] = useState<string | null>(null);

  // Filter logic
  const filteredConsults = consults.filter(item => {
    // Search query
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestedSpecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestingDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clinicalQuestion.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Priority filter
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

    // View filter
    switch (activeFilter) {
      case 'incoming':
        return item.requestStatus === 'active' && item.operationalWorkStatus !== 'completed';
      case 'outgoing':
        return item.requestingDepartment.includes('ER') || item.requestingDepartment.includes('طوارئ');
      case 'awaiting_response':
        return item.operationalWorkStatus === 'unassigned' || item.operationalWorkStatus === 'assigned';
      case 'in_progress':
        return item.operationalWorkStatus === 'in_progress' || item.operationalWorkStatus === 'claimed';
      case 'needs_info':
        return item.operationalWorkStatus === 'waiting_for_info';
      case 'completed':
        return item.operationalWorkStatus === 'completed' || item.requestStatus === 'closed' || item.requestStatus === 'cancelled';
      default:
        return true;
    }
  });

  const selectedConsult = consults.find(c => c.id === selectedConsultId) || filteredConsults[0];

  const handleOpenWorkspace = (patientId: string, activity: 'orders' | 'summary' | 'notes') => {
    openPatientWorkspace(patientId, {
      defaultActivity: activity,
      originWorkArea: 'clinical_utilities',
      utilityTab: 'consults',
      utilitySelectedId: selectedConsult?.id,
      utilityFilter: activeFilter,
      utilitySearch: searchQuery
    });
  };

  const handleRequestInfo = (consult: ConsultCoordinationItem) => {
    const updated: ConsultCoordinationItem = {
      ...consult,
      operationalWorkStatus: 'waiting_for_info',
      lastUpdate: 'الآن: تم طلب توضيح سريري من الفريق الطالب'
    };
    onUpdateConsult(updated);
    setCoordinationSuccessMsg('تم تحديث حالة الاستشارة إلى "بانتظار معلومات إضافية" وإشعار الفريق الطالب بنجاح.');
    setTimeout(() => setCoordinationSuccessMsg(null), 3500);
  };

  const handleSendCoordinationNote = () => {
    if (!coordinationNoteInput.trim() || !selectedConsult) return;
    const updated: ConsultCoordinationItem = {
      ...selectedConsult,
      lastUpdate: `الآن: ${coordinationNoteInput.trim()}`
    };
    onUpdateConsult(updated);
    setCoordinationNoteInput('');
    setCoordinationSuccessMsg('تمت إضافة رسالة التنسيق بنجاح وإشعار الفريق المعني.');
    setTimeout(() => setCoordinationSuccessMsg(null), 3500);
  };

  const getPriorityBadge = (priority: 'stat' | 'urgent' | 'routine') => {
    switch (priority) {
      case 'stat':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 font-black text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            فوري STAT
          </span>
        );
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            عاجل Urgent
          </span>
        );
      case 'routine':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[10px]">
            روتيني Routine
          </span>
        );
    }
  };

  const getOperationalStatusBadge = (status: ConsultCoordinationItem['operationalWorkStatus']) => {
    switch (status) {
      case 'unassigned':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">بانتظار التكليف</span>;
      case 'assigned':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">تم الإسناد</span>;
      case 'claimed':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">مستلمة بالمعاينة</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold">قيد الفحص السريري</span>;
      case 'waiting_for_info':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">بانتظار استيضاح</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">مكتملة وموثقة</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Semantic Distinction Banner */}
      <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 text-teal-900 text-xs flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong>مركز تنسيق الاستشارات السريرية:</strong> منصة التنسيق ومتابعة مسار الاستشارة بين الفرق. طلب الاستشارة يتم عبر <strong>Axis 6 (الأوامر)</strong>، وتوثيق الرأي الطبي المعتمد يتم عبر <strong>Axis 5 (الملاحظات)</strong>.
          </span>
        </div>
        <span className="text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md border border-teal-300 shrink-0">
          Request ≠ Work Item ≠ Note
        </span>
      </div>

      {/* Filter Tabs & Quick Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('incoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'incoming'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              الاستشارات الواردة للقسم ({consults.filter(c => c.requestStatus === 'active' && c.operationalWorkStatus !== 'completed').length})
            </button>
            <button
              onClick={() => setActiveFilter('outgoing')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'outgoing'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              الاستشارات الصادرة
            </button>
            <button
              onClick={() => setActiveFilter('awaiting_response')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'awaiting_response'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              بانتظار الرد / التكليف
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'in_progress'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              قيد المراجعة والمعاينة
            </button>
            <button
              onClick={() => setActiveFilter('needs_info')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'needs_info'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              بحاجة لمعلومات
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              المكتملة والسابقة
            </button>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium text-[11px] ml-1">الأولوية:</span>
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                priorityFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setPriorityFilter('stat')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                priorityFilter === 'stat' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              STAT
            </button>
            <button
              onClick={() => setPriorityFilter('urgent')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                priorityFilter === 'urgent' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              عاجل Urgent
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="البحث باسم المريض، الرقم الطبي MRN، التخصص المطلوب، أو السؤال السريري..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Main Split-Pane Layout (Dense List + Detail Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Dense Consults List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[780px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>قائمة طلبات الاستشارة ({filteredConsults.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">اضغط للمعاينة والتنسيق</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto p-1.5 space-y-1">
            {filteredConsults.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد طلبات استشارة مطابقة لمعايير الفلترة المحددة
              </div>
            ) : (
              filteredConsults.map(item => {
                const isSelected = selectedConsult?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedConsultId(item.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300 shadow-xs'
                        : 'hover:bg-slate-50/80 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0">
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
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {getPriorityBadge(item.priority)}
                        {item.requestedResponseTimeframe ? (
                          <span className="text-[9px] font-medium text-slate-500 bg-slate-50 px-1 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span>{item.requestedResponseTimeframe}</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">مستهدف غير محدد</span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>{item.requestedSpecialty}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      {item.clinicalQuestion}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.requestedAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getOperationalStatusBadge(item.operationalWorkStatus)}
                        {item.resultingDocumentation && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                            مُوثقة
                          </span>
                        )}
                        {!item.isSourceActionable && (
                          <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                            ملغاة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Consultation Detail / Coordination Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {selectedConsult ? (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Source Changed Banner if cancelled or superseded */}
              {!selectedConsult.isSourceActionable && (
                <SourceChangedAlert
                  titleAr="تنبيه: تغيرت حالة طلب الاستشارة الأصلي"
                  messageAr={
                    selectedConsult.sourceChangedWarning ||
                    'تم إلغاء هذا الطلب من قبل القسم الطالب، ولم يعد قابلاً للتنفيذ السريري.'
                  }
                  type="cancelled"
                />
              )}

              {coordinationSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{coordinationSuccessMsg}</span>
                </div>
              )}

              {/* Patient Identity & Encounter Header */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-black text-sm flex items-center justify-center">
                    {selectedConsult.patientName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-white">{selectedConsult.patientName}</h3>
                      <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 font-mono text-xs border border-teal-800">
                        {selectedConsult.mrn}
                      </span>
                      <span className="text-xs text-slate-300">
                        {selectedConsult.age} سنة • {selectedConsult.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>الموقع: {selectedConsult.currentLocation}</span>
                      <span>• التنويم/الزيارة: {selectedConsult.encounterType}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewPatientId(selectedConsult.patientId)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>معاينة سريعة</span>
                </button>
              </div>

              {/* Key Meta: Request Status vs Work Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">حالة الطلب الأصلي (Order Status)</div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        selectedConsult.requestStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedConsult.requestStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {selectedConsult.requestStatus === 'active'
                        ? 'طلب نشط ومعتمد'
                        : selectedConsult.requestStatus === 'cancelled'
                        ? 'طلب ملغى'
                        : 'مغلق'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">حالة إنجاز العمل (Fulfillment Work)</div>
                  <div>{getOperationalStatusBadge(selectedConsult.operationalWorkStatus)}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium mb-1">الأولوية السريرية والمستهدف</div>
                  <div className="mb-1.5">{getPriorityBadge(selectedConsult.priority)}</div>
                  <div className="text-[10px] text-slate-600 flex items-start gap-1 pt-1 border-t border-slate-200/60">
                    <Clock className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-[9px]">مستهدف الاستجابة (سياسة المنشأة):</span>
                      {selectedConsult.requestedResponseTimeframe ? (
                        <strong className="text-slate-800 font-semibold">{selectedConsult.requestedResponseTimeframe}</strong>
                      ) : (
                        <span className="text-slate-400 italic">مستهدف الاستجابة غير محدد بالسياسة (Response target not configured)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Provenance Details */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>
                      <strong>القسم الطالب:</strong> {selectedConsult.requestingDepartment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>
                      <strong>الطبيب الطالب:</strong> {selectedConsult.requestingDoctor}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <div className="text-slate-700">
                    <strong>التخصص المطلوب:</strong>{' '}
                    <span className="text-teal-800 font-bold">{selectedConsult.requestedSpecialty}</span>
                  </div>
                  {selectedConsult.assignedClinician && (
                    <div className="text-slate-700">
                      <strong>المكلف بالمعاينة:</strong>{' '}
                      <span className="font-bold text-slate-900">{selectedConsult.assignedClinician}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Clinical Question / Focal Inquiry */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  <span>السؤال السريري ومبرر الاستشارة (Clinical Focal Question):</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-200 text-xs text-slate-800 leading-relaxed font-medium">
                  {selectedConsult.clinicalQuestion}
                </div>
              </div>

              {/* Resulting Official Clinical Documentation (Axis 5 Note link if available) */}
              {selectedConsult.resultingDocumentation ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم توثيق الرأي الطبي الاستشاري رسميًا في السجل السريري (Axis 5)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {selectedConsult.resultingDocumentation.documentedAt}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {selectedConsult.resultingDocumentation.summaryPreview}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      بواسطة: {selectedConsult.resultingDocumentation.documentedBy}
                    </span>
                    <button
                      onClick={() => handleOpenWorkspace(selectedConsult.patientId, 'notes')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>عرض التقرير الطبي الكامل في Axis 5</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      لم يتم اعتماد تقرير الاستشارة النهائي بعد. يمكن للاستشاري توثيقه في <strong>Axis 5 (الملاحظات والتوثيق)</strong>.
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenWorkspace(selectedConsult.patientId, 'notes')}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-[11px] hover:bg-teal-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    توثيق الاستشارة الآن
                  </button>
                </div>
              )}

              {/* Linked Coordination Thread & Quick Message Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span>خيط التنسيق السريع مع الفريق الطبي (Coordination Thread)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    تنسيق سريع ≠ التوثيق القانوني
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب ملاحظة تنسيق سريعة أو استفسار للفريق الطالب..."
                    value={coordinationNoteInput}
                    onChange={e => setCoordinationNoteInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendCoordinationNote()}
                    className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
                  />
                  <button
                    onClick={handleSendCoordinationNote}
                    className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>آخر تحديث: {selectedConsult.lastUpdate}</span>
                  <button
                    onClick={() => onNavigateToMessages(selectedConsult.linkedThreadId, selectedConsult.patientId)}
                    className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>فتح المحادثة الكاملة في مركز التواصل</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comprehensive Action Buttons Bar */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenWorkspace(selectedConsult.patientId, 'summary')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح ملف المريض (Axis 1)</span>
                  </button>

                  <button
                    onClick={() => handleOpenWorkspace(selectedConsult.patientId, 'orders')}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>تفاصيل الطلب (Axis 6)</span>
                  </button>

                  {selectedConsult.linkedWorkItemId && (
                    <button
                      onClick={() => onNavigateToMyWork(selectedConsult.linkedWorkItemId)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>مهمتي في My Work</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedConsult.operationalWorkStatus !== 'waiting_for_info' && selectedConsult.isSourceActionable && (
                    <button
                      onClick={() => handleRequestInfo(selectedConsult)}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-colors cursor-pointer text-xs"
                    >
                      طلب استيضاح سريري
                    </button>
                  )}

                  <button
                    onClick={() => onNavigateToMessages(selectedConsult.linkedThreadId, selectedConsult.patientId)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مراسلة الفريق المعني</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              حدد طلب استشارة من القائمة لمعاينة التفاصيل والتنسيق السريري
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
