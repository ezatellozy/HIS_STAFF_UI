import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ArrowRightLeft,
  MessageSquare,
  Bell,
  Search,
  Sparkles,
  ShieldAlert,
  Users,
  Building2,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import {
  UtilityTab,
  ConsultCoordinationItem,
  HandoverCoordinationItem,
  MessageThread,
  ChatMessage,
  AttentionNotification,
  ChatParticipant,
  MessageUrgency
} from '../../types/clinicalUtilities';
import {
  INITIAL_MOCK_CONSULTS,
  INITIAL_MOCK_HANDOVERS,
  INITIAL_MOCK_THREADS,
  INITIAL_MOCK_MESSAGES,
  INITIAL_MOCK_NOTIFICATIONS
} from '../../data/mockClinicalUtilitiesData';
import { ConsultationCoordinationCenter } from './ConsultationCoordinationCenter';
import { HandoverCenter } from './HandoverCenter';
import { ClinicalMessagingCenter } from './ClinicalMessagingCenter';
import { NotificationAttentionCenter } from './NotificationAttentionCenter';

export const ClinicalUtilitiesShell: React.FC = () => {
  const {
    activeWorkArea,
    setActiveWorkArea,
    workspaceOrigin,
    openPatientWorkspace
  } = useHis();

  // Active Top-Level Navigation Tab
  const [activeTab, setActiveTab] = useState<UtilityTab>(() => {
    if (workspaceOrigin?.originType === 'clinical_utilities' && workspaceOrigin.utilityTab) {
      return workspaceOrigin.utilityTab;
    }
    return 'consults';
  });

  // State collections (Mock in-memory with local state for interactive prototype)
  const [consults, setConsults] = useState<ConsultCoordinationItem[]>(INITIAL_MOCK_CONSULTS);
  const [handovers, setHandovers] = useState<HandoverCoordinationItem[]>(INITIAL_MOCK_HANDOVERS);
  const [threads, setThreads] = useState<MessageThread[]>(INITIAL_MOCK_THREADS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MOCK_MESSAGES);
  const [notifications, setNotifications] = useState<AttentionNotification[]>(INITIAL_MOCK_NOTIFICATIONS);

  // Cross-navigation target params
  const [initialThreadId, setInitialThreadId] = useState<string | undefined>(undefined);
  const [initialPatientId, setInitialPatientId] = useState<string | undefined>(undefined);

  // Restore origin state if coming back from patient workspace
  useEffect(() => {
    if (workspaceOrigin?.originType === 'clinical_utilities') {
      if (workspaceOrigin.utilityTab) {
        setActiveTab(workspaceOrigin.utilityTab);
      }
    }
  }, [workspaceOrigin]);

  // Handlers for consult updates
  const handleUpdateConsult = (updated: ConsultCoordinationItem) => {
    setConsults(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  // Handlers for handover updates
  const handleUpdateHandover = (updated: HandoverCoordinationItem) => {
    setHandovers(prev => prev.map(h => (h.id === updated.id ? updated : h)));
  };

  // Handlers for message sending
  const handleSendMessage = (
    threadId: string,
    text: string,
    options?: { urgency?: MessageUrgency; requiresAck?: boolean }
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: 'staff-doc-1',
      senderName: 'د. طارق المنشاوي',
      senderRole: 'Cardiologist',
      text,
      timestamp: 'الآن',
      status: 'sent',
      urgency: options?.urgency || 'normal',
      requiresAcknowledgement: options?.requiresAck,
      acknowledgedBy: options?.requiresAck ? ['staff-doc-1'] : undefined
    };

    setMessages(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg]
    }));

    setThreads(prev =>
      prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: {
              id: newMsg.id,
              senderName: newMsg.senderName,
              senderRole: newMsg.senderRole,
              text: newMsg.text,
              timestamp: 'الآن',
              status: 'sent',
              urgency: newMsg.urgency
            }
          };
        }
        return t;
      })
    );
  };

  // Handler for creating a new thread from directory picker
  const handleCreateThread = (
    participant: ChatParticipant,
    patientContext?: MessageThread['patientContext']
  ): string => {
    const newThreadId = `thread-custom-${Date.now()}`;
    const newThread: MessageThread = {
      id: newThreadId,
      threadType: patientContext ? 'patient_linked' : 'team_operational',
      title: patientContext
        ? `تنسيق سريري: ${patientContext.patientName}`
        : `محادثة مباشرة: ${participant.name}`,
      patientContext,
      participants: [
        {
          id: 'staff-doc-1',
          name: 'د. طارق المنشاوي',
          role: 'استشاري قلب',
          presence: 'available',
          isCurrentUser: true
        },
        participant
      ],
      lastMessage: {
        id: `msg-init-${Date.now()}`,
        senderName: 'د. طارق المنشاوي',
        senderRole: 'Cardiologist',
        text: 'تم بدء محادثة التنسيق السريري.',
        timestamp: 'الآن',
        status: 'delivered',
        urgency: 'normal'
      },
      unreadCount: 0,
      priority: 'normal'
    };

    setThreads(prev => [newThread, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newThreadId]: [
        {
          id: `msg-init-${Date.now()}`,
          threadId: newThreadId,
          senderId: 'staff-doc-1',
          senderName: 'د. طارق المنشاوي',
          senderRole: 'Cardiologist',
          text: 'تم بدء محادثة التنسيق السريري.',
          timestamp: 'الآن',
          status: 'delivered',
          urgency: 'normal'
        }
      ]
    }));

    return newThreadId;
  };

  // Notification toggles
  const handleToggleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleToggleNotificationActioned = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              isActioned: !n.isActioned,
              actionedLabel: !n.isActioned ? 'تم اتخاذ الإجراء السريري بنجاح' : 'معلق الإجراء'
            }
          : n
      )
    );
  };

  // Cross-Utility Navigation helper
  const navigateToMessages = (threadId?: string, patientId?: string) => {
    if (threadId) setInitialThreadId(threadId);
    if (patientId) setInitialPatientId(patientId);
    setActiveTab('messages');
  };

  const navigateToMyWork = (workItemId?: string) => {
    setActiveWorkArea('my_work');
  };

  const navigateToOrBoard = () => {
    setActiveWorkArea('or');
  };

  // Calculate attention counts
  const activeConsultsCount = consults.filter(
    c => c.requestStatus === 'active' && c.operationalWorkStatus !== 'completed'
  ).length;
  const pendingHandoversCount = handovers.filter(h => h.handoverStatus === 'awaiting_receipt').length;
  const unreadMessagesCount = threads.reduce((acc, t) => acc + t.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Master Cross-Role Utilities Context Bar */}
      <div className="bg-slate-900 text-white rounded-2xl border-2 border-slate-800 shadow-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-500/40">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>منظومة التنسيق السريري المشترك</span>
                  <span className="text-xs text-teal-400 font-mono font-normal">
                    (Cross-Role Clinical Utilities)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  مساحة موحدة لربط الفرق الطبية عبر الاستشارات، تسليم الحالات، المحادثات الآمنة، ومركز التنبيهات
                </p>
              </div>
            </div>
          </div>

          {/* Current Staff Persona Strip & Demo Scenario Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>الكادر الحالي:</span>
              <strong className="text-white">د. طارق المنشاوي (استشاري قلب)</strong>
            </div>

            {/* Quick Demo Scenarios Dropdown / Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <span className="text-[11px] text-teal-300 font-bold px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                سيناريوهات العرض:
              </span>
              <button
                onClick={() => setActiveTab('consults')}
                className="px-2 py-1 rounded-lg text-[11px] hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="سيناريو A: استشارة جراحة الطوارئ"
              >
                A. الاستشارات
              </button>
              <button
                onClick={() => setActiveTab('handovers')}
                className="px-2 py-1 rounded-lg text-[11px] hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="سيناريو B: تسليم العناية المركزة"
              >
                B. التسليم
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className="px-2 py-1 rounded-lg text-[11px] hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="سيناريو C: نتيجة حرجة STAT"
              >
                C. النتيجة الحرجة
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className="px-2 py-1 rounded-lg text-[11px] hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="سيناريو D: تواصل صيدلاني دوائي"
              >
                D. المحادثة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs Rail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs sticky top-[72px] z-20 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {/* Tab 1: Consults */}
          <button
            onClick={() => setActiveTab('consults')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'consults'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>مركز تنسيق الاستشارات (Consults Center)</span>
            {activeConsultsCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'consults' ? 'bg-white text-teal-800 font-black' : 'bg-teal-100 text-teal-800'
                }`}
              >
                {activeConsultsCount}
              </span>
            )}
          </button>

          {/* Tab 2: Handovers */}
          <button
            onClick={() => setActiveTab('handovers')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'handovers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>مركز تسليم واستلام الحالات (Handover Center)</span>
            {pendingHandoversCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'handovers' ? 'bg-white text-blue-800 font-black' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {pendingHandoversCount}
              </span>
            )}
          </button>

          {/* Tab 3: Clinical Messaging */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>التواصل السريري الآمن (Clinical Messaging)</span>
            {unreadMessagesCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'messages' ? 'bg-white text-purple-800 font-black' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Tab 4: Notifications & Attention */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>مركز الإشعارات والانتباه (Notifications)</span>
            {unreadNotificationsCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'notifications' ? 'bg-white text-amber-900 font-black' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Render Active Utility Surface */}
      <div className="transition-all duration-150">
        {activeTab === 'consults' && (
          <ConsultationCoordinationCenter
            consults={consults}
            onUpdateConsult={handleUpdateConsult}
            onNavigateToMessages={navigateToMessages}
            onNavigateToMyWork={navigateToMyWork}
          />
        )}

        {activeTab === 'handovers' && (
          <HandoverCenter
            handovers={handovers}
            onUpdateHandover={handleUpdateHandover}
            onNavigateToMessages={navigateToMessages}
          />
        )}

        {activeTab === 'messages' && (
          <ClinicalMessagingCenter
            threads={threads}
            messages={messages}
            onSendMessage={handleSendMessage}
            onCreateThread={handleCreateThread}
            onNavigateToMyWork={navigateToMyWork}
            initialThreadId={initialThreadId}
            initialPatientId={initialPatientId}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationAttentionCenter
            notifications={notifications}
            onToggleRead={handleToggleNotificationRead}
            onToggleActioned={handleToggleNotificationActioned}
            onNavigateToMessages={navigateToMessages}
            onNavigateToMyWork={navigateToMyWork}
            onNavigateToOrBoard={navigateToOrBoard}
          />
        )}
      </div>
    </div>
  );
};
