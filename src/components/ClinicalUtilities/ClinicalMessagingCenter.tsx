import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  User,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Paperclip,
  AtSign,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
  CheckCheck,
  Plus,
  X,
  Building2,
  Lock,
  Stethoscope
} from 'lucide-react';
import {
  MessageThread,
  ChatMessage,
  ChatParticipant,
  MessageUrgency
} from '../../types/clinicalUtilities';
import { DirectoryPickerModal } from './DirectoryPickerModal';
import { SharedPatientQuickPreview } from '../Shared/SharedPatientQuickPreview';
import { useHis } from '../../context/HisContext';

interface ClinicalMessagingCenterProps {
  threads: MessageThread[];
  messages: Record<string, ChatMessage[]>;
  onSendMessage: (threadId: string, text: string, options?: { urgency?: MessageUrgency; requiresAck?: boolean }) => void;
  onCreateThread: (participant: ChatParticipant, patientContext?: MessageThread['patientContext']) => string;
  onNavigateToMyWork: (workItemId?: string) => void;
  initialThreadId?: string;
  initialPatientId?: string;
}

export const ClinicalMessagingCenter: React.FC<ClinicalMessagingCenterProps> = ({
  threads,
  messages,
  onSendMessage,
  onCreateThread,
  onNavigateToMyWork,
  initialThreadId,
  initialPatientId
}) => {
  const { openPatientWorkspace, patients } = useHis();

  // Selected thread
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    if (initialThreadId && threads.some(t => t.id === initialThreadId)) return initialThreadId;
    if (initialPatientId) {
      const match = threads.find(t => t.patientContext?.patientId === initialPatientId);
      if (match) return match.id;
    }
    return threads[0]?.id || '';
  });

  // Filter & Search states
  const [filterType, setFilterType] = useState<'all' | 'patient_linked' | 'team_operational' | 'priority'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Composer states
  const [messageInput, setMessageInput] = useState('');
  const [composerUrgency, setComposerUrgency] = useState<MessageUrgency>('normal');
  const [composerRequiresAck, setComposerRequiresAck] = useState(false);

  // Wrong-patient safeguard modal state
  const [wrongPatientPendingThreadId, setWrongPatientPendingThreadId] = useState<string | null>(null);

  // Directory picker modal
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  // Quick preview drawer
  const [previewPatientId, setPreviewPatientId] = useState<string | null>(null);

  const selectedThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const activeMessages = selectedThread ? messages[selectedThread.id] || [] : [];

  // Filtered threads list
  const filteredThreads = threads.filter(thread => {
    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thread.patientContext &&
        (thread.patientContext.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.patientContext.mrn.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      thread.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'patient_linked') return thread.threadType === 'patient_linked';
    if (filterType === 'team_operational') return thread.threadType === 'team_operational';
    if (filterType === 'priority') return thread.priority === 'priority' || thread.unreadCount > 0;

    return true;
  });

  // Handle clicking on a thread with wrong-patient safeguard
  const handleSelectThread = (targetThreadId: string) => {
    if (targetThreadId === activeThreadId) return;

    // Check if user has an unsent draft and both threads have different patient contexts
    const targetThread = threads.find(t => t.id === targetThreadId);
    if (
      messageInput.trim().length > 0 &&
      selectedThread?.patientContext &&
      targetThread?.patientContext &&
      selectedThread.patientContext.patientId !== targetThread.patientContext.patientId
    ) {
      setWrongPatientPendingThreadId(targetThreadId);
      return;
    }

    setActiveThreadId(targetThreadId);
  };

  const handleSend = () => {
    if (!messageInput.trim() || !selectedThread) return;
    onSendMessage(selectedThread.id, messageInput.trim(), {
      urgency: composerUrgency,
      requiresAck: composerRequiresAck
    });
    setMessageInput('');
    setComposerUrgency('normal');
    setComposerRequiresAck(false);
  };

  const handleOpenWorkspace = (patientId: string, activity: 'notes' | 'medications' | 'summary' | 'results') => {
    openPatientWorkspace(patientId, {
      defaultActivity: activity,
      originWorkArea: 'clinical_utilities',
      utilityTab: 'messages',
      utilitySelectedId: selectedThread?.id
    });
  };

  const getPresenceDot = (presence: ChatParticipant['presence']) => {
    switch (presence) {
      case 'available':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="متاح" />;
      case 'busy':
        return <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" title="مشغول" />;
      case 'in_procedure':
        return <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" title="في عملية جراحية" />;
      case 'offline':
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-400 ring-2 ring-white" title="غير متصل" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Semantic Distinction & Safety Banner */}
      <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-purple-950 text-xs flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-700 shrink-0" />
          <span>
            <strong>منظومة التواصل السريري الآمن (Clinical Communication):</strong> قنوات تواصل لحظية بين الفرق الطبية. الرسائل وسيلة تنسيق وتواصل وليست السجل الطبي القانوني. القرارات السريرية توثق في <strong>Axis 5 (الملاحظات والتوثيق)</strong>.
          </span>
        </div>
        <span className="text-[11px] font-bold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-md border border-purple-300 shrink-0">
          Message ≠ Clinical Documentation
        </span>
      </div>

      {/* Main Split Pane Layout (Dense Conversations List + Conversation Stream) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Dense Threads List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[820px]">
          {/* Header with New Chat CTA */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              <Users className="w-4 h-4 text-purple-600" />
              <span>المحادثات السريرية ({filteredThreads.length})</span>
            </div>
            <button
              onClick={() => setIsDirectoryOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>محادثة جديدة</span>
            </button>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="p-2.5 border-b border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('patient_linked')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  filterType === 'patient_linked'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                مرتبطة بمريض ({threads.filter(t => t.threadType === 'patient_linked').length})
              </button>
              <button
                onClick={() => setFilterType('team_operational')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  filterType === 'team_operational'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                تشغيلية / فرق
              </button>
              <button
                onClick={() => setFilterType('priority')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  filterType === 'priority'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                أولوية / غير مقروءة
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              <input
                type="text"
                placeholder="البحث بالاسم، المريض، أو نص الرسالة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="divide-y divide-slate-100 overflow-y-auto p-1.5 space-y-1">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد محادثات تطابق الفلترة المحددة
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = selectedThread?.id === thread.id;
                const otherParticipant = thread.participants.find(p => !p.isCurrentUser) || thread.participants[0];
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                        : 'hover:bg-slate-50/80 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-700 font-bold flex items-center justify-center text-xs">
                            {thread.threadType === 'patient_linked' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Users className="w-4 h-4" />
                            )}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5">
                            {otherParticipant && getPresenceDot(otherParticipant.presence)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{thread.title}</h4>
                          <div className="text-[10px] text-slate-500">
                            {otherParticipant ? `${otherParticipant.name} (${otherParticipant.role})` : 'فريق متعدد'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-slate-400">{thread.lastMessage.timestamp}</span>
                        {thread.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient Context Pill if linked */}
                    {thread.patientContext && (
                      <div className="flex items-center gap-1.5 my-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-bold">
                        <User className="w-3 h-3 text-teal-700" />
                        <span>{thread.patientContext.patientName}</span>
                        <span className="font-mono text-teal-700">({thread.patientContext.mrn})</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{thread.patientContext.location}</span>
                      </div>
                    )}

                    {/* Last message snippet */}
                    <p className="text-[11px] text-slate-600 line-clamp-1 leading-relaxed mt-1">
                      <strong className="text-slate-700">{thread.lastMessage.senderName}:</strong> {thread.lastMessage.text}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{thread.threadType === 'patient_linked' ? 'محادثة مريض' : 'محادثة تشغيلية'}</span>
                      {thread.priority === 'priority' && (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                          أولوية
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Stream & Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[720px]">
          {selectedThread ? (
            <>
              {/* Patient Context Banner for Patient-Linked Conversations */}
              {selectedThread.patientContext && (
                <div className="bg-slate-900 text-white p-3 sm:p-3.5 border-b border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 font-black text-xs flex items-center justify-center border border-teal-500/30">
                        {selectedThread.patientContext.patientName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-white">
                            {selectedThread.patientContext.patientName}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-mono text-[10px] border border-teal-800">
                            {selectedThread.patientContext.mrn}
                          </span>
                          <span className="text-[11px] text-slate-400">{selectedThread.patientContext.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setPreviewPatientId(selectedThread.patientContext!.patientId)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-teal-400" />
                        <span>معاينة</span>
                      </button>

                      <button
                        onClick={() => handleOpenWorkspace(selectedThread.patientContext!.patientId, 'notes')}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="توثيق ملخص التواصل في السجل السريري الرسمي"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="hidden sm:inline">توثيق في الملف الطبي</span>
                        <span className="sm:hidden">توثيق</span>
                      </button>
                    </div>
                  </div>

                  {/* Safety Warning & Disclaimer */}
                  <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-200 text-[10px] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong>تحذير أمان:</strong> الرسائل المتبادلة للتنسيق فقط وليست سجلاً سريرياً رسمياً. اعتمد الأوامر والتوثيق عبر الأقسام المختصة.
                      </span>
                    </div>
                    <span className="font-mono text-[9px] bg-amber-900 px-1 rounded text-amber-300">
                      HIPAA / Safe Messaging
                    </span>
                  </div>
                </div>
              )}

              {/* Thread Header for Team Operational / Top Bar */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{selectedThread.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span>المشاركون:</span>
                    {selectedThread.participants.map(p => (
                      <span key={p.id} className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {getPresenceDot(p.presence)}
                        <span>{p.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {selectedThread.linkedWorkItemId && (
                  <button
                    onClick={() => onNavigateToMyWork(selectedThread.linkedWorkItemId)}
                    className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-[11px] font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>مهمة My Work المرتبطة</span>
                  </button>
                )}
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {activeMessages.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    لا توجد رسائل سابقة في هذه المحادثة. ابدأ بكتابة رسالة تنسيق أدناه.
                  </div>
                ) : (
                  activeMessages.map(msg => {
                    const isSelf = msg.senderId === 'staff-doc-1';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                          <span className="font-bold text-slate-700">{msg.senderName}</span>
                          <span>({msg.senderRole})</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 shadow-2xs ${
                            isSelf
                              ? 'bg-purple-600 text-white rounded-tl-none'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-tr-none'
                          }`}
                        >
                          {/* Urgency Badge if priority */}
                          {msg.urgency === 'priority' && (
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isSelf ? 'bg-purple-800 text-purple-200' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span>ملاحظة ذات أولوية سريرية</span>
                            </div>
                          )}

                          {/* Message Body */}
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {/* Linked Clinical Resource Tag (if any) */}
                          {msg.linkedResource && (
                            <div
                              onClick={() => {
                                if (selectedThread.patientContext) {
                                  handleOpenWorkspace(
                                    selectedThread.patientContext.patientId,
                                    msg.linkedResource!.targetAxis || 'summary'
                                  );
                                }
                              }}
                              className={`p-2 rounded-xl flex items-center justify-between gap-2 text-[11px] font-bold cursor-pointer transition-colors ${
                                isSelf
                                  ? 'bg-purple-700/80 hover:bg-purple-700 text-purple-100'
                                  : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" />
                                <span>{msg.linkedResource.label}</span>
                              </div>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}

                          {/* Acknowledgement Tag */}
                          {msg.requiresAcknowledgement && (
                            <div
                              className={`p-2 rounded-lg text-[10px] flex items-center justify-between gap-2 ${
                                isSelf ? 'bg-purple-800/80 text-purple-200' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold">طلب تأكيد استلام الرسالة (Message Acknowledgement Requested)</span>
                                <span className="text-[9px] opacity-80">تأكيد وصول الرسالة فقط — لا يمثل اعتماداً سريرياً أو توثيقاً طبياً</span>
                              </div>
                              <span className="font-bold flex items-center gap-1 text-emerald-600 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                تم تأكيد الاستلام
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status marker */}
                        {isSelf && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                            {msg.status === 'read' ? (
                              <span className="flex items-center gap-0.5 text-purple-600 font-bold">
                                <CheckCheck className="w-3 h-3" />
                                <span>مقروءة</span>
                              </span>
                            ) : msg.status === 'delivered' ? (
                              <span className="flex items-center gap-0.5">
                                <CheckCheck className="w-3 h-3" />
                                <span>وصلت</span>
                              </span>
                            ) : (
                              <span>تم الإرسال</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                {/* Composer Quick Tools Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Urgency toggle */}
                    <button
                      onClick={() => setComposerUrgency(composerUrgency === 'normal' ? 'priority' : 'normal')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                        composerUrgency === 'priority'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{composerUrgency === 'priority' ? 'رسالة ذات أولوية' : 'أولوية عادية'}</span>
                    </button>

                    {/* Require acknowledgement toggle */}
                    <button
                      onClick={() => setComposerRequiresAck(!composerRequiresAck)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                        composerRequiresAck
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>طلب تأكيد استلام</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    أولوية الرسالة ≠ نداء الطوارئ الحرج STAT
                  </span>
                </div>

                {/* Input box and actions */}
                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    placeholder="اكتب رسالة التنسيق السريري... (اضغط Enter للإرسال)"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                    className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              حدد محادثة من القائمة لمعاينة الرسائل والتواصل مع الفريق
            </div>
          )}
        </div>
      </div>

      {/* Wrong-Patient Safeguard Modal */}
      {wrongPatientPendingThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl border-2 border-rose-400 shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  تحذير أمان سريري: مسودة رسالة مرتبطة بمريض آخر!
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  لديك مسودة غير مرسلة في محادثة المريض <strong>{selectedThread?.patientContext?.patientName}</strong>. الانتقال إلى محادثة مريض آخر قد يؤدي لخلط الرسائل والتعليمات الطبية.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
              المسودة الحالية: "{messageInput.slice(0, 80)}..."
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setWrongPatientPendingThreadId(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                البقاء وحفظ المسودة
              </button>
              <button
                onClick={() => {
                  setMessageInput('');
                  setActiveThreadId(wrongPatientPendingThreadId);
                  setWrongPatientPendingThreadId(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-2xs"
              >
                مسح المسودة والانتقال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Picker Modal */}
      <DirectoryPickerModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectParticipant={participant => {
          const newThreadId = onCreateThread(participant, selectedThread?.patientContext);
          setActiveThreadId(newThreadId);
        }}
      />

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
