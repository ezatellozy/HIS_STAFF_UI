import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Building,
  Info,
  Scale,
  Search
} from 'lucide-react';
import {
  ClaimDenial,
  RevenueCycleState,
  WriteOffAdjustment
} from '../../../types/revenueCycle';
import { recordWriteOffAdjustment } from '../../../utils/revenueCycleEngine';

interface DenialsAppealsWorkspaceProps {
  state: RevenueCycleState;
  onUpdateDenials: (updatedDenials: ClaimDenial[]) => void;
  onAddWriteOff: (writeOff: WriteOffAdjustment) => void;
  onAddAuditLog: (action: string, entityId: string, desc: string) => void;
}

export const DenialsAppealsWorkspace: React.FC<DenialsAppealsWorkspaceProps> = ({
  state,
  onUpdateDenials,
  onAddWriteOff,
  onAddAuditLog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDenial, setSelectedDenial] = useState<ClaimDenial | null>(null);

  // Appeal Modal State
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealNotes, setAppealNotes] = useState('');
  const [supportingDocs, setSupportingDocs] = useState('');

  // Write-Off Modal State
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const [writeOffReason, setWriteOffReason] = useState('contractual_dispute');
  const [writeOffNotes, setWriteOffNotes] = useState('');

  const filteredDenials = state.denials.filter(d => {
    if (state.selectedPatientContextId && d.patientId !== state.selectedPatientContextId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.claimNumber.toLowerCase().includes(q) ||
        d.denialReasonAr.toLowerCase().includes(q) ||
        d.denialCode.toLowerCase().includes(q) ||
        d.actionOwner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAttachDocsAndAppeal = () => {
    if (!selectedDenial) return;
    if (!appealNotes.trim()) {
      alert('يرجى تدوين حيثيات الاعتراض الطبي والمالي');
      return;
    }

    const updated = state.denials.map(d =>
      d.id === selectedDenial.id
        ? {
            ...d,
            appealStatus: 'appeal_submitted' as const,
            supportingDocsAttached: supportingDocs ? [supportingDocs] : ['تقرير الاستشاري السريري المرفق'],
            appealNotes: appealNotes,
            appealDeadlineDate: '2026-10-15'
          }
        : d
    );

    onUpdateDenials(updated);
    onAddAuditLog(
      'DENIAL_APPEAL_SUBMITTED',
      selectedDenial.id,
      `تم إرسال الاعتراض الرسمي للمطالبة ${selectedDenial.claimNumber} بحجم ${selectedDenial.deniedAmountSar} ر.س`
    );

    setShowAppealModal(false);
    setSelectedDenial(null);
  };

  const handleConfirmWriteOff = () => {
    if (!selectedDenial) return;

    const claim = state.claims.find(c => c.id === selectedDenial.claimId);
    const invoice = state.invoices.find(i => i.id === claim?.invoiceId);

    const { writeOff } = recordWriteOffAdjustment(
      'payer_claim_denial',
      selectedDenial.id,
      selectedDenial.patientMrn,
      selectedDenial.deniedAmountSar,
      writeOffReason as any,
      writeOffNotes || 'شطب إداري لعدم جدوى الاعتراض بعد انتهاء المهل النظامية',
      'مشرف إدارة دورة الإيرادات',
      invoice
    );

    const updatedDenials = state.denials.map(d =>
      d.id === selectedDenial.id ? { ...d, appealStatus: 'closed_with_loss' as const } : d
    );

    onUpdateDenials(updatedDenials);
    onAddWriteOff(writeOff);
    onAddAuditLog(
      'DENIAL_WRITTEN_OFF',
      selectedDenial.id,
      `تم تسجيل قيد تسوية وشطب تسوية غير قابلة للتحصيل بقيمة ${selectedDenial.deniedAmountSar} ر.س`
    );

    setShowWriteOffModal(false);
    setSelectedDenial(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>منظومة إدارة الرفوض التأمينية والاعتراضات (Denials & Appeals Workbench)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          تحليل أسباب الرفض الجذرية، إعداد ملفات الاعتراض، وتطبيق ضوابط حظر تحويل الدين للمريض تلقائياً (RC17 / NEG-L)
        </p>
      </div>

      {/* Critical Rule Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-950 font-bold">
            حظر تحويل مبالغ الرفض التأميني إلى ذمة على المريض (RC17):
          </strong>
          <span>
            أي مبلغ ترفضه شركة التأمين لا يُحول تلقائياً إلى ذمة أو فاتورة على المريض، بل يتم تسجيله كبند اعتراض لمتابعة إثبات الضرورة الطبية أو معالجة الخطأ الترميزي.
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="البحث برقم المطالبة، كود الرفض، اسم مسؤول المتابعة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-bold">
          إجمالي الرفوضات المفتوحة: <span className="font-mono text-red-600">{filteredDenials.length}</span>
        </div>
      </div>

      {/* Denials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">رقم القيد / المطالبة</th>
                <th className="py-3 px-4">كود وسبب الرفض</th>
                <th className="py-3 px-4">تصنيف السبب الجذري</th>
                <th className="py-3 px-4">المبلغ المرفوض</th>
                <th className="py-3 px-4">مهلة الاعتراض</th>
                <th className="py-3 px-4">مسؤول المتابعة</th>
                <th className="py-3 px-4">حالة الاعتراض</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDenials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    لا توجد رفوضات نشطة مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredDenials.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">{d.id}</div>
                      <div className="text-[11px] text-blue-600">{d.claimNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-red-700">{d.denialCode}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-mono">
                          {d.codeSystem === 'X12_CARC' ? 'X12 CARC' : 'NPHIES Code'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{d.denialDescriptionAr || d.denialReasonAr}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {d.rootCauseCategory === 'prior_authorization_missing'
                          ? 'نقص موافقة مسبقة'
                          : d.rootCauseCategory === 'medical_necessity'
                          ? 'ضرورة طبية'
                          : d.rootCauseCategory === 'coding_mismatch'
                          ? 'خطأ ترميز سريري'
                          : 'أخرى'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-red-600">
                      {d.deniedAmountSar.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{d.appealDeadlineDate}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{d.actionOwner}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.appealStatus === 'appeal_submitted'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : d.appealStatus === 'closed_with_loss'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {d.appealStatus === 'appeal_submitted'
                          ? 'تم تقديم الاعتراض'
                          : d.appealStatus === 'closed_with_loss'
                          ? 'مغلق بشطب'
                          : 'بانتظار المستندات'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {d.appealStatus !== 'closed_with_loss' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDenial(d);
                                setAppealNotes('');
                                setSupportingDocs('');
                                setShowAppealModal(true);
                              }}
                              className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-[11px] font-bold cursor-pointer"
                              title="تقديم اعتراض وإرفاق مستندات داعمة"
                            >
                              اعتراض
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDenial(d);
                                setWriteOffReason('contractual_dispute');
                                setWriteOffNotes('');
                                setShowWriteOffModal(true);
                              }}
                              className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-md text-[11px] font-bold cursor-pointer"
                              title="شطب تسوية إداري"
                            >
                              شطب
                            </button>
                          </>
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

      {/* Appeal Submission Modal */}
      {showAppealModal && selectedDenial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <span>إعداد وتقديم اعتراض على الرفض التأميني</span>
              </h3>
              <button
                onClick={() => setShowAppealModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div>المطالبة: <strong className="font-mono text-blue-700">{selectedDenial.claimNumber}</strong></div>
              <div>كود الرفض: <strong className="font-mono text-red-700">{selectedDenial.denialCode}</strong> ({selectedDenial.denialReasonAr})</div>
              <div>المبلغ المرفوض: <strong className="font-mono text-slate-900">{selectedDenial.deniedAmountSar} ر.س</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">المستندات والتقارير الداعمة المرفقة:</label>
                <input
                  type="text"
                  placeholder="مثال: تقرير استشاري أمراض القلب المؤرخ في 2026-09-22 متضمناً تخطيط صدى القلب..."
                  value={supportingDocs}
                  onChange={e => setSupportingDocs(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">حيثيات الاعتراض السريري والمالي:</label>
                <textarea
                  rows={3}
                  placeholder="تدوين المبررات السريرية لإثبات الضرورة الطبية ومطابقة التغطية..."
                  value={appealNotes}
                  onChange={e => setAppealNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAppealModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAttachDocsAndAppeal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                إرسال الاعتراض عبر بوابة نفيس
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write-Off Modal */}
      {showWriteOffModal && selectedDenial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-600" />
                <span>تسجيل قيد تسوية وشطب إداري (Write-Off)</span>
              </h3>
              <button
                onClick={() => setShowWriteOffModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <div>المبلغ المراد شطبه: <strong className="font-mono text-rose-700">{selectedDenial.deniedAmountSar} ر.س</strong></div>
              <div className="text-[11px] text-rose-700">تنويه محاسبي (RC26): قيد الشطب مستند تسوية غير نقدي ولا يُحسب كتحصيل في تقارير الخزينة.</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">سبب الشطب:</label>
                <select
                  value={writeOffReason}
                  onChange={e => setWriteOffReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden"
                >
                  <option value="contractual_dispute">خلاف تعاقدي مع شركة التأمين</option>
                  <option value="timely_filing_expired">انقضاء المهلة النظامية للاعتراض</option>
                  <option value="administrative_write_off">تسوية إدارية معتمدة</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ملاحظات الاعتماد المالي:</label>
                <textarea
                  rows={2}
                  placeholder="موافقة المدير المالي بموجب المحضر..."
                  value={writeOffNotes}
                  onChange={e => setWriteOffNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowWriteOffModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmWriteOff}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                تأكيد الشطب والتسوية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
