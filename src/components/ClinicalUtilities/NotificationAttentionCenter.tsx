import React, { useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  FileText,
  MessageSquare,
  ArrowRightLeft,
  Activity,
  Layers,
  CheckCheck,
  Eye,
  SlidersHorizontal,
  Info,
  Building2,
  Stethoscope
} from 'lucide-react';
import {
  AttentionNotification,
  NotificationCategory,
  NotificationPriority
} from '../../types/clinicalUtilities';
import { SharedPatientQuickPreview } from '../Shared/SharedPatientQuickPreview';
import { useHis } from '../../context/HisContext';

interface NotificationAttentionCenterProps {
  notifications: AttentionNotification[];
  onToggleRead: (id: string) => void;
  onToggleActioned: (id: string) => void;
  onNavigateToMessages: (threadId?: string) => void;
  onNavigateToMyWork: (workItemId?: string) => void;
  onNavigateToOrBoard: () => void;
}

export const NotificationAttentionCenter: React.FC<NotificationAttentionCenterProps> = ({
  notifications,
  onToggleRead,
  onToggleActioned,
  onNavigateToMessages,
  onNavigateToMyWork,
  onNavigateToOrBoard
}) => {
  const { openPatientWorkspace } = useHis();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifId, setSelectedNotifId] = useState<string>(notifications[0]?.id || '');
  const [previewPatientId, setPreviewPatientId] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(item => {
    const matchesSearch =
      item.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.patientContext &&
        (item.patientContext.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.patientContext.mrn.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

    return true;
  });

  const selectedNotif = notifications.find(n => n.id === selectedNotifId) || filteredNotifications[0];

  const handleDeepLink = (notif: AttentionNotification) => {
    const { destination, targetPatientId, targetAxis, targetItemId, targetThreadId } = notif.targetDeepLink;

    switch (destination) {
      case 'patient_workspace':
        if (targetPatientId) {
          openPatientWorkspace(targetPatientId, {
            defaultActivity: targetAxis || 'summary',
            originWorkArea: 'clinical_utilities',
            utilityTab: 'notifications',
            utilitySelectedId: notif.id
          });
        }
        break;
      case 'my_work':
        onNavigateToMyWork(targetItemId);
        break;
      case 'exact_conversation':
        onNavigateToMessages(targetThreadId);
        break;
      case 'or_board':
        onNavigateToOrBoard();
        break;
      default:
        break;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'stat':
        return (
          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 font-black text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            حرج فوري STAT
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            عالي الأهمية
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            متوسط
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
            معلوماتي
          </span>
        );
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'clinical':
        return <Activity className="w-4 h-4 text-rose-600" />;
      case 'work':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'communication':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'handover':
        return <ArrowRightLeft className="w-4 h-4 text-teal-600" />;
      case 'operational':
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Semantic Distinction Banner */}
      <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>مركز الإشعارات والانتباه (Notifications & Attention Center):</strong> الإشعار تنبيه للموظف، بينما مهمة العمل (Work Item) تتطلب إجراءً تشغيلياً. <strong>قراءة الإشعار (Read) لا تعني اعتماد النتيجة أو اتخاذ الإجراء السريري (Actioned).</strong>
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-300 shrink-0">
          Read ≠ Actioned
        </span>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setActiveCategory('clinical')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === 'clinical'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              سريرية حرجة ({notifications.filter(n => n.category === 'clinical').length})
            </button>
            <button
              onClick={() => setActiveCategory('work')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === 'work' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              مهام عمل واستشارات
            </button>
            <button
              onClick={() => setActiveCategory('handover')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === 'handover'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              تسليم وتسلم
            </button>
            <button
              onClick={() => setActiveCategory('communication')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === 'communication'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              رسائل وإشارات
            </button>
            <button
              onClick={() => setActiveCategory('operational')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === 'operational'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              تشغيلية وغرف عمليات
            </button>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium text-[11px] ml-1">الأهمية:</span>
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                priorityFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setPriorityFilter('stat')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                priorityFilter === 'stat' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
              }`}
            >
              STAT
            </button>
            <button
              onClick={() => setPriorityFilter('high')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                priorityFilter === 'high' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
              }`}
            >
              عالي
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="البحث في الإشعارات والتنبيهات، اسم المريض، أو نوع الإجراء..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Split Pane Layout (Dense List + Detail Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Dense Notifications List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[780px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>سجل الإشعارات والتنبيهات ({filteredNotifications.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">اضغط للمعاينة والتفاعل</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto p-1.5 space-y-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد إشعارات مطابقة لمعايير الفلترة المحددة
              </div>
            ) : (
              filteredNotifications.map(item => {
                const isSelected = selectedNotif?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNotifId(item.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : item.isRead
                        ? 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200 opacity-90'
                        : 'bg-slate-50/90 hover:bg-slate-100 border-amber-200 font-medium'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.titleAr}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
                        </div>
                      </div>
                      {getPriorityBadge(item.priority)}
                    </div>

                    {/* Patient Context Tag if applicable */}
                    {item.patientContext && (
                      <div className="flex items-center gap-1.5 my-1 text-[10px] text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                        <span className="font-bold text-slate-800">{item.patientContext.patientName}</span>
                        <span className="font-mono text-slate-500">({item.patientContext.mrn})</span>
                        <span>•</span>
                        <span>{item.patientContext.location}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      {item.descriptionAr}
                    </p>

                    {/* Separation of Read vs Actioned Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold ${
                            item.isRead
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.isRead ? 'مقروء (Read)' : 'جديد غير مقروء'}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold ${
                            item.isActioned
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.isActioned ? 'تم اتخاذ الإجراء (Actioned)' : 'معلق الإجراء'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Notification Detail & Deep-Link Action (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {selectedNotif ? (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                    {getCategoryIcon(selectedNotif.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityBadge(selectedNotif.priority)}
                      <span className="text-xs text-slate-400">{selectedNotif.timestamp}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{selectedNotif.titleAr}</h3>
                    <p className="text-[11px] text-slate-400" dir="ltr">
                      {selectedNotif.titleEn}
                    </p>
                  </div>
                </div>

                {/* Read / Unread toggle */}
                <button
                  onClick={() => onToggleRead(selectedNotif.id)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {selectedNotif.isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                </button>
              </div>

              {/* Patient Banner if present */}
              {selectedNotif.patientContext && (
                <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-black text-xs flex items-center justify-center">
                      {selectedNotif.patientContext.patientName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{selectedNotif.patientContext.patientName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-mono text-[10px] border border-teal-800">
                          {selectedNotif.patientContext.mrn}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{selectedNotif.patientContext.location}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewPatientId(selectedNotif.patientContext!.patientId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-teal-400" />
                    <span>معاينة</span>
                  </button>
                </div>
              )}

              {/* Notification Description Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                {selectedNotif.descriptionAr}
              </div>

              {/* Read vs Actioned Matrix Card */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>حالة الاعتماد والإجراء السريري (Action Status):</span>
                  </div>
                  <button
                    onClick={() => onToggleActioned(selectedNotif.id)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      selectedNotif.isActioned
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {selectedNotif.isActioned ? 'تغيير إلى: معلق الإجراء' : 'تأكيد اتخاذ الإجراء السريري'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-600">
                  {selectedNotif.actionedLabel ||
                    (selectedNotif.isActioned
                      ? 'تم اتخاذ الإجراء الطبي اللازم حيال هذا التنبيه.'
                      : 'التنبيه بانتظار استكمال الإجراء الطبي من الطبيب المعني.')}
                </div>
              </div>

              {/* Deep Link Action CTA Button (Opens exact axis/view) */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  انتقل مباشرة لموضع العمل المرتبط بهذا الإشعار:
                </span>

                <button
                  onClick={() => handleDeepLink(selectedNotif)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
                >
                  {selectedNotif.targetDeepLink.destination === 'patient_workspace' && (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>
                        فتح التفاصيل في{' '}
                        {selectedNotif.targetDeepLink.targetAxis === 'results'
                          ? 'Axis 7 (النتائج والتقارير)'
                          : selectedNotif.targetDeepLink.targetAxis === 'timeline'
                          ? 'Axis 10 (مسار المريض والتسليم)'
                          : 'الملف السريري للمريض'}
                      </span>
                    </>
                  )}
                  {selectedNotif.targetDeepLink.destination === 'my_work' && (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>فتح المهمة في قائمة مهامي (My Work)</span>
                    </>
                  )}
                  {selectedNotif.targetDeepLink.destination === 'exact_conversation' && (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>فتح المحادثة المعنية في مركز التواصل</span>
                    </>
                  )}
                  {selectedNotif.targetDeepLink.destination === 'or_board' && (
                    <>
                      <Activity className="w-4 h-4" />
                      <span>فتح جدول العمليات في لوحة OR Board</span>
                    </>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              حدد إشعاراً من القائمة لمعاينة التفاصيل والانتقال لموضع العمل
            </div>
          )}
        </div>
      </div>

      {/* Quick Preview Drawer */}
      {previewPatientId && (
        <SharedPatientQuickPreview
          patientId={previewPatientId}
          isOpen={true}
          onClose={() => setPreviewPatientId(null)}
          onOpenFullWorkspace={pid =>
            openPatientWorkspace(pid, {
              defaultActivity: 'summary',
              originWorkArea: 'clinical_utilities',
              utilityTab: 'notifications'
            })
          }
        />
      )}
    </div>
  );
};
