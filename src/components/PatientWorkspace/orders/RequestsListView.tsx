import React, { useState } from 'react';
import {
  Send,
  UserPlus,
  Building,
  ArrowRightLeft,
  Scissors,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  ClinicalRequestItem,
  RequestType,
  RequestFulfillmentStatus,
  RequestStatus,
  getRequesterDisplayInfo
} from '../../../types/clinicalOrdersRequests';
import { useHis } from '../../../context/HisContext';

interface RequestsListViewProps {
  requests: ClinicalRequestItem[];
  onUpdateFulfillment: (requestId: string, newFulfillment: RequestFulfillmentStatus, newRequestStatus?: RequestStatus) => void;
  onCancelRequest: (requestId: string, reason: string) => void;
  onOpenNewRequest: () => void;
}

export const RequestsListView: React.FC<RequestsListViewProps> = ({
  requests,
  onUpdateFulfillment,
  onCancelRequest,
  onOpenNewRequest
}) => {
  const { playChime } = useHis();
  const [filterType, setFilterType] = useState<RequestType | 'all'>('all');

  const filtered = requests.filter(r => (filterType === 'all' ? true : r.requestType === filterType));

  const getTypeIcon = (type: RequestType) => {
    switch (type) {
      case 'consultation':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'admission':
        return <Building className="w-5 h-5 text-blue-600" />;
      case 'surgery':
        return <Scissors className="w-5 h-5 text-amber-600" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getFulfillmentBadge = (status: RequestFulfillmentStatus) => {
    switch (status) {
      case 'waiting_in_queue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>في قائمة انتظار الفريق (Waiting in Queue)</span>
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <span>تم التعيين للاستشاري (Assigned)</span>
          </span>
        );
      case 'claimed_accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
            <span>تم القبول من الفريق (Accepted)</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
            <span>قيد المعاينة السريرية (In Progress)</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>تم إنجاز وتوثيق الاستشارة (Completed)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Bar with Semantic Clarification Banner */}
      <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 text-xs text-purple-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 max-w-2xl">
          <Info className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sm block text-purple-900">
              سجل الطلبات والتحويلات السريرية (Interdisciplinary Requests & Referrals)
            </strong>
            <p className="text-purple-900 mt-0.5 leading-relaxed">
              تختلف الطلبات السريرية (Requests) جوهرياً عن الأوامر العلاجية المباشرة (Orders). الطلب هو التماس لتقديم خدمة أو رأي تخصصي أو تحويل مكاني يتطلب متابعة حالتين متوازيتين: حالة الطلب الأساسية (Request Status) وحالة إنجاز الفريق المعني في الميدان (Fulfillment Status).
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewRequest}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>طلب خدمة / استشارة جديدة (New Request)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'all' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          كافة الطلبات ({requests.length})
        </button>
        <button
          onClick={() => setFilterType('consultation')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'consultation' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الاستشارات التخصصية
        </button>
        <button
          onClick={() => setFilterType('admission')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'admission' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          طلبات التنويم
        </button>
        <button
          onClick={() => setFilterType('surgery')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'surgery' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          حجوزات العمليات والقسطرة
        </button>
        <button
          onClick={() => setFilterType('transfer')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            filterType === 'transfer' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          طلبات النقل الخارجي
        </button>
      </div>

      {/* Request Cards Stream */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <Send className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-sm text-slate-600">لا توجد طلبات سريرية مطابقة للتصفية الحالية.</p>
          </div>
        ) : (
          filtered.map(req => {
            const isCompleted = req.requestStatus === 'completed' || req.fulfillmentStatus === 'completed';
            const isCancelled = req.requestStatus === 'cancelled';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all p-4 space-y-3 hover:shadow-sm ${
                  isCancelled
                    ? 'border-red-200 bg-red-50/20 opacity-70'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                      {getTypeIcon(req.requestType)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-extrabold text-sm ${
                            isCancelled ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {req.titleAr}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{req.id}</span>
                        
                        {/* Priority */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.priority === 'stat'
                              ? 'bg-red-600 text-white'
                              : req.priority === 'urgent'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.priority.toUpperCase()}
                        </span>

                        {/* Dual Status Badges */}
                        {getFulfillmentBadge(req.fulfillmentStatus)}
                      </div>

                      {(() => {
                        const requesterInfo = getRequesterDisplayInfo(req);
                        return (
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                            <span>
                              الجهة الطالبة:{' '}
                              <strong className={requesterInfo.isMissing ? 'text-slate-500 font-normal italic' : 'text-slate-800'}>
                                {requesterInfo.name}
                              </strong>{' '}
                              <span className="text-slate-500">({requesterInfo.roleOrSpecialty})</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{req.requestedAt}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Fulfillment Simulation Dropdown & Actions */}
                  {!isCancelled && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                        <span className="text-[10px] text-slate-500 font-bold">محاكاة حالة الإنجاز:</span>
                        <select
                          value={req.fulfillmentStatus}
                          onChange={e => {
                            const newFulfillment = e.target.value as RequestFulfillmentStatus;
                            onUpdateFulfillment(
                              req.id,
                              newFulfillment,
                              newFulfillment === 'completed' ? 'completed' : 'active'
                            );
                            playChime('chime');
                          }}
                          className="font-bold text-[11px] bg-white border border-slate-300 rounded-lg p-1 text-slate-800"
                        >
                          <option value="waiting_in_queue">في الانتظار (Waiting)</option>
                          <option value="assigned">تم التعيين (Assigned)</option>
                          <option value="claimed_accepted">تم القبول (Accepted)</option>
                          <option value="in_progress">قيد المعاينة (In Progress)</option>
                          <option value="completed">مكتمل وموثق (Completed)</option>
                        </select>
                      </div>

                      {req.requestStatus === 'active' && (
                        <button
                          onClick={() => {
                            const r = prompt('أدخل سبب إلغاء طلب الخدمة:');
                            if (r) onCancelRequest(req.id, r);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          إلغاء الطلب
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Specific Details Box */}
                {req.consultationDetails && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">السؤال السريري المحدد:</span>
                      <span className="text-purple-700 font-bold">{req.consultationDetails.preferredResponseTimeFrame}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{req.consultationDetails.focalClinicalQuestion}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      الاستشاري المسمى: {req.consultationDetails.targetConsultant || 'طبيب الاستشارات المناوب'}
                    </div>
                  </div>
                )}

                {req.admissionDetails && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">الوحدة ومستوى الرعاية:</span>
                      <span className="font-bold text-blue-800">{req.admissionDetails.targetUnit} ({req.admissionDetails.bedLevelOfCare})</span>
                    </div>
                    <div className="text-slate-700">التشخيص: {req.admissionDetails.admittingDiagnosis}</div>
                  </div>
                )}

                {req.surgeryDetails && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">الإجراء المخطط والمقر:</span>
                      <span className="font-bold text-amber-800">{req.surgeryDetails.operatingRoomType}</span>
                    </div>
                    <div className="text-slate-700">التخدير: {req.surgeryDetails.anesthesiaType} • المدة المقدرة: {req.surgeryDetails.estimatedDurationMinutes} دقيقة</div>
                  </div>
                )}

                {req.transferDetails && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">المنشأة المستقبلة والطبيب:</span>
                      <span className="font-bold text-emerald-800">{req.transferDetails.destinationFacility}</span>
                    </div>
                    <div className="text-slate-700">الطبيب المستقبل: {req.transferDetails.acceptingPhysicianName} • سبب النقل: {req.transferDetails.transferReason}</div>
                  </div>
                )}

                {/* Linked Note if Completed */}
                {req.resultingNoteId && (
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        <strong>تم توثيق التقرير السريري النهائي:</strong> راجع تقرير الاستشارة في سجل الملاحظات السريرية ({req.resultingNoteId}).
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 font-bold">
                      مكتمل سريرياً
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
