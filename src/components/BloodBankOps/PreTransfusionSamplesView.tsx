import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  User,
  ExternalLink,
  ChevronRight,
  Droplet,
  Info,
  XCircle,
  FileWarning,
  RefreshCw,
  BellRing,
  HelpCircle
} from 'lucide-react';
import {
  PreTransfusionSample,
  SampleValidityStatus,
  SampleRejectionReasonCode,
  SampleRejectionDetails
} from '../../types/bloodBankOps';

interface PreTransfusionSamplesViewProps {
  samples: PreTransfusionSample[];
  onSelectSample: (sample: PreTransfusionSample) => void;
  onOpenGroupingWorkspace: (sampleId: string) => void;
  onOpenAntibodyWorkspace: (sampleId: string) => void;
  onUpdateSample?: (updatedSample: PreTransfusionSample) => void;
}

export const PreTransfusionSamplesView: React.FC<PreTransfusionSamplesViewProps> = ({
  samples,
  onSelectSample,
  onOpenGroupingWorkspace,
  onOpenAntibodyWorkspace,
  onUpdateSample
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [validityFilter, setValidityFilter] = useState<string>('all');
  const [rejectingSample, setRejectingSample] = useState<PreTransfusionSample | null>(null);
  const [selectedReasonCode, setSelectedReasonCode] = useState<SampleRejectionReasonCode>('hemolyzed_specimen');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isRecollectionRequired, setIsRecollectionRequired] = useState(true);

  const REJECTION_REASONS: { code: SampleRejectionReasonCode; labelAr: string; labelEn: string; isWbit?: boolean }[] = [
    { code: 'hemolyzed_specimen', labelAr: 'عينة متحللة دموياً (Gross Hemolysis)', labelEn: 'Hemolyzed Specimen' },
    { code: 'mislabeled_wristband_mismatch', labelAr: 'خطأ في ملصق الأنبوبة وعدم تطابق مع سوار المريض', labelEn: 'Mislabeled / Wristband Mismatch' },
    { code: 'unlabeled_tube', labelAr: 'أنبوبة خالية من أي ملصق تعريفي (Unlabeled Tube)', labelEn: 'Unlabeled Tube' },
    { code: 'suspected_wbit_wrong_blood_in_tube', labelAr: 'اشتباه سحب دم المريض الخطأ (Wrong Blood In Tube - WBIT)', labelEn: 'Suspected WBIT', isWbit: true },
    { code: 'clotted_edta_sample', labelAr: 'تجلط العينة في أنبوبة مانع التخثر EDTA', labelEn: 'Clotted EDTA Sample' },
    { code: 'insufficient_volume_qns', labelAr: 'كمية دم غير كافية لإتمام كافة الفحوصات (QNS)', labelEn: 'Quantity Not Sufficient' },
    { code: 'wrong_tube_type_anticoagulant', labelAr: 'نوع الأنبوبة غير مناسب لبنك الدم', labelEn: 'Wrong Tube Type' },
    { code: 'collection_time_absent', labelAr: 'غياب وقت وتاريخ وساعة السحب أو توقيع الساحب', labelEn: 'Missing Collection Time' }
  ];

  const handleConfirmRejection = () => {
    if (!rejectingSample) return;

    const matchedReason = REJECTION_REASONS.find(r => r.code === selectedReasonCode);
    const rejectionDetails: SampleRejectionDetails = {
      rejectedAt: 'اليوم ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      rejectedByTechnologist: 'أخصائي مختبر بدر العتيبي',
      reasonCode: selectedReasonCode,
      reasonAr: matchedReason ? matchedReason.labelAr : 'عينة غير مطابقة للمواصفات',
      reasonEn: matchedReason ? matchedReason.labelEn : 'Sample Rejected',
      recollectionRequired: isRecollectionRequired,
      recollectionOrderRef: isRecollectionRequired ? `ORD-RECOLLECT-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      investigationMandated: selectedReasonCode === 'suspected_wbit_wrong_blood_in_tube' || selectedReasonCode === 'mislabeled_wristband_mismatch',
      clinicalNotificationStatus: 'urgent_alert_sent'
    };

    const updatedSample: PreTransfusionSample = {
      ...rejectingSample,
      validityStatus: selectedReasonCode === 'hemolyzed_specimen' ? 'rejected_hemolyzed' : 'rejected_mislabeled',
      rejectionDetails,
      notes: rejectionNotes ? `${rejectingSample.notes ? rejectingSample.notes + ' | ' : ''}ملاحظات الرفض: ${rejectionNotes}` : rejectingSample.notes
    };

    if (onUpdateSample) {
      onUpdateSample(updatedSample);
    }

    setRejectingSample(null);
    setRejectionNotes('');
  };

  const filteredSamples = samples.filter(s => {
    const matchesSearch =
      s.patientName.includes(searchTerm) ||
      s.mrn.includes(searchTerm) ||
      s.id.includes(searchTerm) ||
      s.barcode.includes(searchTerm);

    const matchesValidity =
      validityFilter === 'all' ||
      s.validityStatus === validityFilter ||
      (validityFilter === 'rejected' && (s.validityStatus === 'rejected_hemolyzed' || s.validityStatus === 'rejected_mislabeled'));

    return matchesSearch && matchesValidity;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls & Policy Context */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">سجل عينات ما قبل نقل الدم (Pre-Transfusion Samples Worklist)</h2>
              <p className="text-xs text-slate-500">
                التحقق الصارم من هوية العينة، مطابقة الأنبوبة، وسياسة الصلاحية السريرية (Configured Sample Validity Model)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث برقم العينة، الباركود، المريض أو MRN..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-64 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={validityFilter}
              onChange={e => setValidityFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">جميع الحالات ({samples.length})</option>
              <option value="valid">عينات صالحة</option>
              <option value="expiring_soon">تنتهي قريباً</option>
              <option value="expired">منتهية الصلاحية</option>
              <option value="rejected">عينة مرفوضة / إعادة سحب</option>
              <option value="review_required">تتطلب تدقيق إضافي</option>
            </select>
          </div>
        </div>

        {/* Policy Callout Banner */}
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              سياسة صلاحية العينات والمطابقة المؤسسية: يتم التحقق الإلزامي من الهوية الثنائية عند السحب. فترات الصلاحية (مثلاً 72 ساعة لمن خضع لنقل دم أو حمل خلال 3 أشهر، أو مدة أطول لمرضى ما قبل التنويم) تخضع لسياسة المؤسسة المعتمدة. أي اشتباه في تحلل الدم أو خطأ بالهوية يوجب الرفض الفوري وتوليد طلب إعادة سحب عاجل.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-blue-200 shrink-0">
            سياسة معتمدة ومطابقة الهوية
          </span>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">معرف العينة والباركود</th>
                <th className="p-3.5">المريض والملف الطبي</th>
                <th className="p-3.5">الموقع وقناة السحب</th>
                <th className="p-3.5">نوع الأنبوبة</th>
                <th className="p-3.5">ساعة السحب والاستلام</th>
                <th className="p-3.5">صلاحية العينة والسياسة السريرية</th>
                <th className="p-3.5 text-center">الإجراءات المخبرية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSamples.map(sample => {
                const isRejected = sample.validityStatus === 'rejected_hemolyzed' || sample.validityStatus === 'rejected_mislabeled';
                const hasUncertainValidity = sample.validityProfile?.validityDecision === 'validity_uncertain';

                return (
                  <tr
                    key={sample.id}
                    className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${
                      isRejected ? 'bg-red-50/20' : ''
                    }`}
                    onClick={() => onSelectSample(sample)}
                  >
                    {/* Sample ID & Barcode */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-blue-900 text-xs flex items-center gap-1.5">
                        <span>{sample.id}</span>
                        {isRejected && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            مرفوضة
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                        Barcode: {sample.barcode}
                      </div>
                      {sample.identificationVerificationDone && !isRejected && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مؤكد بالهوية الثنائية</span>
                        </span>
                      )}
                    </td>

                    {/* Patient Info & Trauma Caution */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{sample.patientName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{sample.mrn}</div>
                      {sample.temporaryTraumaIdentityCaution && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>تنبيه: هوية طوارئ مؤقتة - يلزم مطابقة ملف الـ MRN الدائم</span>
                        </div>
                      )}
                      {sample.historicalGroupContext && (
                        <div className="text-[10px] text-red-700 font-medium mt-0.5">
                          فصيلة تاريخية: {sample.historicalGroupContext.displayAr}
                        </div>
                      )}
                    </td>

                    {/* Location & Collector */}
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">{sample.collectionLocation}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        بواسطة: {sample.collectorName} ({sample.collectorRole})
                      </div>
                    </td>

                    {/* Tube Type */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]">
                        {sample.tubeType}
                      </span>
                    </td>

                    {/* Timestamps */}
                    <td className="p-3.5">
                      <div className="text-slate-700">سُحبت: {sample.collectedAt}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">استُلمت: {sample.receivedAt}</div>
                    </td>

                    {/* Validity & Rejection Details */}
                    <td className="p-3.5">
                      {isRejected ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3 h-3" />
                            <span>مرفوضة: {sample.rejectionDetails?.reasonAr || 'عينة غير مقبولة'}</span>
                          </span>
                          {sample.rejectionDetails?.recollectionOrderRef && (
                            <div className="text-[10px] text-red-700 font-mono flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" />
                              <span>طلب إعادة سحب: {sample.rejectionDetails.recollectionOrderRef}</span>
                            </div>
                          )}
                          {sample.rejectionDetails?.investigationMandated && (
                            <span className="text-[10px] text-amber-800 font-bold block">
                              مطلوب تحقيق سلامة WBIT
                            </span>
                          )}
                        </div>
                      ) : hasUncertainValidity ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <HelpCircle className="w-3 h-3" />
                            <span>لا يمكن تحديد مدة الصلاحية</span>
                          </span>
                          <p className="text-[10px] text-amber-700">
                            بيانات النقل والحمل السابقة غير متوفرة بالسجل الطبي - يلزم استيفاء التاريخ السريري
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sample.validityStatus === 'valid' ? 'bg-emerald-100 text-emerald-800' :
                              sample.validityStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {sample.validityStatus === 'valid' ? 'صالحة للفحص' :
                               sample.validityStatus === 'expiring_soon' ? 'تنتهي قريباً' : 'منتهية'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-600 font-bold">{sample.validUntil}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[220px] truncate" title={sample.validityPolicyDescription}>
                            {sample.validityPolicyDescription}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {!isRejected && (
                          <>
                            <button
                              onClick={() => onOpenGroupingWorkspace(sample.id)}
                              className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-[11px] transition-colors shadow-2xs"
                              title="إجراء أو استعراض فحص الفصيلة الأمامي والخلفي"
                            >
                              الفصيلة (ABO)
                            </button>
                            <button
                              onClick={() => onOpenAntibodyWorkspace(sample.id)}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[11px] transition-colors shadow-2xs"
                              title="إجراء أو استعراض مسح الأجسام المضادة"
                            >
                              مسح الأضداد
                            </button>
                            <button
                              onClick={() => setRejectingSample(sample)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 font-bold text-[10px] transition-colors"
                              title="رفض العينة وتوثيق السبب مع طلب إعادة السحب (GAP-01)"
                            >
                              رفض العينة
                            </button>
                          </>
                        )}
                        {isRejected && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <BellRing className="w-3.5 h-3.5 text-amber-600" />
                            <span>أُشعِر التمريض بإعادة السحب</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSamples.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    لا توجد عينات تطابق خيارات البحث الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GAP-01: SAMPLE REJECTION MODAL */}
      {rejectingSample && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-red-900">
                  رفض عينة ما قبل النقل وتوثيق السبب (Sample Rejection - GAP-01)
                </h3>
              </div>
              <button
                onClick={() => setRejectingSample(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{rejectingSample.patientName}</div>
                <div className="text-slate-500 font-mono mt-0.5">
                  العينة: {rejectingSample.id} | MRN: {rejectingSample.mrn} | الباركود: {rejectingSample.barcode}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  سبب الرفض المعتمد نظامياً (Rejection Reason):
                </label>
                <select
                  value={selectedReasonCode}
                  onChange={e => setSelectedReasonCode(e.target.value as SampleRejectionReasonCode)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-red-500 bg-white"
                >
                  {REJECTION_REASONS.map(r => (
                    <option key={r.code} value={r.code}>
                      {r.labelAr} ({r.labelEn})
                    </option>
                  ))}
                </select>
              </div>

              {selectedReasonCode === 'suspected_wbit_wrong_blood_in_tube' && (
                <div className="p-3 bg-red-100/70 border border-red-300 rounded-xl text-red-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">تحذير سلامة مريض عالي الخطورة (WBIT Protocol):</span>
                    <span>
                      اشتباه سحب دم المريض الخطأ يفرض إيقاف كافة طلبات النقل فوراً، وإشعار فريق الجودة وسلامة المرضى، وإجراء سحب عينة جديدة بحضور شاهدين مستقلين.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">ملاحظات إضافية من فني بنك الدم:</label>
                <textarea
                  value={rejectionNotes}
                  onChange={e => setRejectionNotes(e.target.value)}
                  placeholder="اكتب أي ملاحظات تتعلق بظروف الاستلام أو حالة الأنبوبة..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                  rows={2}
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-900 block">إصدار طلب إعادة سحب عاجل تلقائياً</span>
                  <span className="text-blue-700 text-[11px]">
                    يتم إرسال إشعار فوري للتمريض في {rejectingSample.collectionLocation} لإعادة السحب برقم طلب مرتبط.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isRecollectionRequired}
                  onChange={e => setIsRecollectionRequired(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingSample(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors text-xs shadow-xs"
              >
                تأكيد رفض العينة وإصدار إشعار إعادة السحب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
