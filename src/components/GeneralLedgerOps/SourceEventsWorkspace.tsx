import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  Info, 
  ShieldCheck, 
  SlidersHorizontal,
  Lock,
  FileCheck
} from 'lucide-react';
import { 
  GeneralLedgerState, 
  SourceAccountingEvent, 
  PostingProfileRule 
} from '../../types/generalLedger';
import { simulateSourceEventPosting } from '../../utils/generalLedgerEngine';

interface SourceEventsWorkspaceProps {
  glState: GeneralLedgerState;
  onUpdateState: (newState: GeneralLedgerState) => void;
  activePersona: {
    id: string;
    nameAr: string;
  };
  onViewVoucher: (voucherNumber: string) => void;
}

export const SourceEventsWorkspace: React.FC<SourceEventsWorkspaceProps> = ({
  glState,
  onUpdateState,
  activePersona,
  onViewVoucher
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'profiles'>('events');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [postSuccessNotice, setPostSuccessNotice] = useState<string | null>(null);

  // Filter events
  const filteredEvents = glState.sourceEvents.filter(ev => {
    if (filterModule !== 'all' && ev.sourceModule !== filterModule) return false;
    if (filterStatus !== 'all' && ev.mappingStatus !== filterStatus) return false;
    return true;
  });

  // Handle Simulate Post Single Source Event
  const handleSimulatePost = (eventId: string) => {
    const res = simulateSourceEventPosting(glState, eventId, activePersona.nameAr);
    if (!res.success) {
      alert(res.error || 'تعذر ترحيل حدث المصدر');
      return;
    }
    if (res.newState) onUpdateState(res.newState);
    setPostSuccessNotice(`تم ترحيل حدث المصدر وتوليد سند القيد المحاسبي ${res.voucher?.voucherNumber} بنجاح.`);
    setTimeout(() => setPostSuccessNotice(null), 6000);
  };

  return (
    <div id="source-events-workspace" className="space-y-6">
      
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            أحداث المصادر والملفات المحاسبية (Source Accounting Events & Posting Profiles)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          بوابة الربط المحاسبي مع الحسابات الدائنة (AP)، المشتريات، المخزون، وفواتير المرضى وفق قواعد المفتاح المركب لمنع التكرار (Idempotency).
        </p>

        {/* Read-Only Architecture Principle Banner */}
        <div className="mt-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">
              حدود الوحدات وسجلات القراءة فقط (GL20 & GL30):
            </span>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              أحداث المصادر تظل دائماً <b>سجلات غير قابلة للتعديل أو الحذف</b> من قبل دفتر الأستاذ العام؛ إذ يقتصر دور المحرك المالي على قراءة الحدث وتوليد قيود اليومية المطابقة له دون المساس ببيانات المصدر الأصلية.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>سجل أحداث المصادر الواردة</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
              {glState.sourceEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profiles' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ملفات التوجيه المحاسبي (Posting Profiles)</span>
          </button>
        </div>

        {activeTab === 'events' && (
          <div className="flex items-center gap-2">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">جميع الأنظمة المصدرية</option>
              <option value="accounts_payable">الحسابات الدائنة (AP)</option>
              <option value="procurement">المشتريات والتعاقدات</option>
              <option value="inventory">المستودعات والمخزون</option>
              <option value="patient_billing">فواتير المرضى</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="READY_FOR_SIMULATION">جاهز للترحيل</option>
              <option value="POSTED_SIMULATED">مرحل نهائياً</option>
              <option value="UNMAPPED_ACCOUNT">ينقصه توجيه محاسبي</option>
            </select>
          </div>
        )}
      </div>

      {postSuccessNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{postSuccessNotice}</span>
        </div>
      )}

      {/* 1. Source Events Feed */}
      {activeTab === 'events' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-semibold">المفتاح المركب (Idempotency Key)</th>
                  <th className="py-3 px-3 font-semibold">المصدر</th>
                  <th className="py-3 px-3 font-semibold">المرجع الأصلي</th>
                  <th className="py-3 px-3 font-semibold">تاريخ الحدث</th>
                  <th className="py-3 px-3 font-semibold">البيان الوارد</th>
                  <th className="py-3 px-3 font-semibold">المبلغ (SAR)</th>
                  <th className="py-3 px-3 font-semibold">حالة التوجيه والترحيل</th>
                  <th className="py-3 px-3 font-semibold text-left">إجراء المحاكاة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredEvents.map(ev => {
                  const isReady = ev.mappingStatus === 'READY_FOR_SIMULATION';
                  const isPosted = ev.mappingStatus === 'POSTED_SIMULATED';
                  const isUnmapped = ev.mappingStatus === 'UNMAPPED_ACCOUNT';

                  return (
                    <tr key={ev.eventId} className="hover:bg-slate-800/40">
                      
                      {/* Idempotency Key */}
                      <td className="py-3 px-3 font-bold text-slate-200 whitespace-nowrap">
                        <div className="text-[11px] text-indigo-300 font-mono truncate max-w-[200px]" title={ev.compositeIdempotencyKey}>
                          {ev.compositeIdempotencyKey}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {ev.eventId}
                        </div>
                      </td>

                      {/* Module */}
                      <td className="py-3 px-3 font-sans whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {ev.sourceModule === 'accounts_payable' ? 'الحسابات الدائنة (AP)' :
                           ev.sourceModule === 'procurement' ? 'المشتريات' :
                           ev.sourceModule === 'inventory' ? 'المخزون' : 'فواتير المرضى'}
                        </span>
                      </td>

                      {/* Source Ref */}
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {ev.sourceEntityNumber}
                      </td>

                      {/* Event Date */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {ev.eventDate}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3 font-sans text-slate-200 max-w-[220px] truncate">
                        {ev.descriptionAr}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {ev.totalAmountSar.toLocaleString()} ر.س
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 font-sans whitespace-nowrap">
                        {isReady && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                            جاهز للترحيل
                          </span>
                        )}
                        {isPosted && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-blue-400" />
                            <span>مرحل نهائي</span>
                          </span>
                        )}
                        {isUnmapped && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800" title="الحساب المالي غير محدد بالدليل">
                            ينقصه توجيه
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 font-sans text-left whitespace-nowrap">
                        {isReady && (
                          <button
                            id={`btn-post-event-${ev.eventId}`}
                            onClick={() => handleSimulatePost(ev.eventId)}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shadow-sm"
                            title="ترحيل الحدث وتوليد سند القيد بدفتر الأستاذ"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>ترحيل محاكى</span>
                          </button>
                        )}
                        {isPosted && ev.generatedVoucherNumber && (
                          <button
                            onClick={() => onViewVoucher(ev.generatedVoucherNumber!)}
                            className="text-xs text-blue-400 hover:underline font-mono font-bold cursor-pointer"
                          >
                            {ev.generatedVoucherNumber}
                          </button>
                        )}
                        {isUnmapped && (
                          <span className="text-[11px] text-slate-500 italic">
                            يتطلب ربط الحساب
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Posting Profiles Configuration */}
      {activeTab === 'profiles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">ملفات وقواعد التوجيه المحاسبي الآلي (Posting Profiles)</h3>
            <p className="text-xs text-slate-400">تحدد كيفية ترجمة الأحداث التشغيلية إلى أطراف قيود مدينة ودائنة بدفتر اليومية العامة</p>
          </div>

          <div className="space-y-3">
            {glState.postingProfiles.map(profile => (
              <div key={profile.profileId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{profile.nameAr}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {profile.profileId}
                    </span>
                  </div>
                  <p className="text-slate-300">{profile.descriptionAr}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-300 font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-sans block text-[11px]">الطرف المدين الافتراضي (Debit):</span>
                      <span className="font-bold text-white">{profile.defaultDebitAccountCode}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-amber-400 font-sans block text-[11px]">الطرف الدائن الافتراضي (Credit):</span>
                      <span className="font-bold text-white">{profile.defaultCreditAccountCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
