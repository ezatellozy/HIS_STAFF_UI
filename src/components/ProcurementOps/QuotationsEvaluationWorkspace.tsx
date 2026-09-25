import React, { useState } from 'react';
import { 
  FileCheck, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  Building, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { 
  SourcingEvent, 
  Quotation, 
  SupplierMaster 
} from '../../types/procurementOps';

interface QuotationsEvaluationWorkspaceProps {
  sourcingEvents: SourcingEvent[];
  quotations: Quotation[];
  suppliers: SupplierMaster[];
  activeRole: string;
  selectedEventId?: string;
  onRecordAward: (sourcingEventId: string, winningSupplierId: string, winningQuotationId: string, justificationAr: string) => void;
  onGeneratePoFromAward: (sourcingEventId: string) => void;
}

export const QuotationsEvaluationWorkspace: React.FC<QuotationsEvaluationWorkspaceProps> = ({
  sourcingEvents,
  quotations,
  suppliers,
  activeRole,
  selectedEventId: propSelectedEventId,
  onRecordAward,
  onGeneratePoFromAward
}) => {
  const [currentEventId, setCurrentEventId] = useState<string>(propSelectedEventId || sourcingEvents[0]?.id || '');
  const [awardJustification, setAwardJustification] = useState<string>('');
  const [isAwardModalOpen, setIsAwardModalOpen] = useState<boolean>(false);
  const [selectedWinningQuoteId, setSelectedWinningQuoteId] = useState<string>('');
  const [awardError, setAwardError] = useState<string>('');

  const currentEvent = sourcingEvents.find(s => s.id === currentEventId);
  const eventQuotations = quotations.filter(q => q.sourcingEventId === currentEventId);

  const handleOpenAwardModal = (quoteId: string) => {
    setSelectedWinningQuoteId(quoteId);
    setAwardJustification('');
    setAwardError('');
    setIsAwardModalOpen(true);
  };

  const handleExecuteAward = () => {
    if (!currentEvent || !selectedWinningQuoteId) return;
    const quote = eventQuotations.find(q => q.id === selectedWinningQuoteId);
    if (!quote) return;

    const supplier = suppliers.find(s => s.id === quote.supplierId);
    if (supplier && (supplier.qualificationStatus === 'expired' || supplier.qualificationStatus === 'restricted')) {
      setAwardError(`لا يمكن ترسية المنافسة على هذا المورد لأن حالته التأهيلية (${supplier.qualificationStatus}) منتهية أو محظورة (PROC09/10).`);
      return;
    }

    if (supplier && (!supplier.taxRegistrationNumber || supplier.taxRegistrationNumber.trim() === '')) {
      setAwardError('لا يمكن ترسية المنافسة: بيانات المورد الضريبية مفقودة أو غير مكتملة (PROC28).');
      return;
    }

    if (quote.technicalComplianceStatus === 'pending_evaluation' || (quote as any).technicalEvaluationStatus === 'pending') {
      setAwardError('لا يمكن الترسية: التقييم الفني السريري إلزامي وما زال قيد المراجعة ولم يُعتمد بعد (PROC16).');
      return;
    }

    if (quote.technicalComplianceStatus === 'non_compliant' || (quote as any).technicalEvaluationStatus === 'non_compliant') {
      setAwardError('لا يمكن الترسية: العرض الفني غير مطابق للمواصفات السريرية المعتمدة (PROC16).');
      return;
    }

    if (!awardJustification.trim()) {
      setAwardError('يجب تدوين مسوغات ومبررات قرار الترسية المعتمد وفق اللائحة.');
      return;
    }

    onRecordAward(currentEvent.id, quote.supplierId, quote.id, awardJustification);
    setIsAwardModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <span>العروض والتقييم الفني ومحاضر الترسية (Quotations & Evaluation)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            مقارنة العروض المالية والتحويل المعياري للوحدات والعملات، التحقق من المطابقة الفنية، وتوثيق قرارات الترسية.
          </p>
        </div>

        {/* Sourcing Event Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">المنافسة:</span>
          <select
            value={currentEventId}
            onChange={(e) => setCurrentEventId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-xs"
          >
            {sourcingEvents.map(evt => (
              <option key={evt.id} value={evt.id}>
                {evt.sourcingNumber} - {evt.titleAr} ({evt.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentEvent ? (
        <div className="space-y-6">
          
          {/* Event Status & Award Summary Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">{currentEvent.sourcingNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    currentEvent.status === 'awarded' ? 'bg-emerald-100 text-emerald-800' :
                    currentEvent.status === 'under_evaluation' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {currentEvent.status === 'awarded' ? 'تمت الترسية رسمياً' :
                     currentEvent.status === 'under_evaluation' ? 'قيد دراسة وتقييم العروض' :
                     'بانتظار استلام العروض'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{currentEvent.titleAr}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  إجمالي العروض المقدمة: <strong className="text-slate-800">{eventQuotations.length} عروض</strong> | الموعد النهائي: {currentEvent.submissionDeadline}
                </p>
              </div>

              {currentEvent.status === 'awarded' && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 text-left">
                    <span className="text-[10px] text-emerald-700 block font-semibold">المورد الفائز بالترسية:</span>
                    <strong className="font-bold block">
                      {suppliers.find(s => s.id === currentEvent.awardedSupplierId)?.legalNameAr}
                    </strong>
                    <span className="font-mono text-[11px]">
                      {(currentEvent.awardedTotalSar ?? 0).toLocaleString()} SAR
                    </span>
                  </div>

                  <button
                    onClick={() => onGeneratePoFromAward(currentEvent.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>إصدار أمر الشراء (Generate PO)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Award Justification Notes if Already Awarded (PROC17) */}
            {currentEvent.awardJustificationAr && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-bold text-slate-800 block mb-1">
                  محضر ومسوغات قرار الترسية المعتمد:
                </span>
                <p className="text-slate-600">{currentEvent.awardJustificationAr}</p>
                <div className="text-[11px] text-slate-400 mt-1">
                  تاريخ الاعتماد: {currentEvent.awardedAt}
                </div>
              </div>
            )}
          </div>

          {/* Quotations Comparison Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  مصفوفة المقارنة الفنية والمالية للعروض (Quotation Comparison Matrix)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  معايرة الأسعار وفق وحدات القياس الأساسية (Base UOM) وتحويل العملات الأجنبية للريال السعودي.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">المورد والسجل</th>
                    <th className="p-3">حالة التأهيل</th>
                    <th className="p-3">اكتمال العرض</th>
                    <th className="p-3">التقييم الفني السريري</th>
                    <th className="p-3">التسعير الأصلي والعملة</th>
                    <th className="p-3">سعر الوحدة المعاير</th>
                    <th className="p-3">الإجمالي شامل الضريبة</th>
                    <th className="p-3 text-center">الترسية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventQuotations.map(quote => {
                    const sup = suppliers.find(s => s.id === quote.supplierId);
                    const isQualified = sup?.qualificationStatus === 'qualified';
                    const isConditionallyQualified = sup?.qualificationStatus === 'conditionally_qualified';
                    const isExpiredOrRestricted = sup?.qualificationStatus === 'expired' || sup?.qualificationStatus === 'restricted';

                    return (
                      <tr key={quote.id} className="hover:bg-slate-50/50">
                        
                        {/* Supplier Info */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{quote.supplierNameAr}</div>
                          <div className="font-mono text-[10px] text-slate-400">{quote.quotationReferenceNumber}</div>
                        </td>

                        {/* Qualification Status */}
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isQualified ? 'bg-emerald-100 text-emerald-800' :
                            isConditionallyQualified ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {isQualified ? 'مؤهل معتمد' :
                             isConditionallyQualified ? 'مؤهل مشروط' :
                             'منتهي التأهيل/محظور'}
                          </span>
                        </td>

                        {/* Completeness (PROC13) */}
                        <td className="p-3">
                          {quote.completenessStatus === 'complete' ? (
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مكتمل الشروط</span>
                            </span>
                          ) : (
                            <div className="text-amber-700 font-semibold text-[11px]">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>ناقص بيانات</span>
                              </div>
                              <span className="text-[10px] text-amber-600 block line-clamp-1">
                                {quote.missingItemsNoteAr}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Technical Evaluation (PROC16) */}
                        <td className="p-3">
                          {quote.technicalComplianceStatus === 'compliant' ? (
                            <div className="text-emerald-800 font-bold">
                              <span>مطابق سريرياً ({quote.technicalScore}%)</span>
                              <span className="text-[10px] text-slate-500 block font-normal">
                                فحص {quote.technicalSpecialtyReviewer}
                              </span>
                            </div>
                          ) : quote.technicalComplianceStatus === 'pending_evaluation' ? (
                            <div className="text-amber-700 font-bold flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>بانتظار الفحص الفني</span>
                            </div>
                          ) : (
                            <div className="text-red-700 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>غير مطابق للمواصفات</span>
                            </div>
                          )}
                        </td>

                        {/* Original Currency & Packaging (PROC14 & PROC15) */}
                        <td className="p-3 font-mono">
                          <div className="text-slate-900 font-semibold">
                            {quote.currencyCode !== 'SAR' && (
                              <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-[10px] ml-1 font-bold">
                                {quote.currencyCode} @ {quote.exchangeRateToSar}
                              </span>
                            )}
                            <span>{(quote.totalOfferedPriceCurrency ?? 0).toLocaleString()} {quote.currencyCode}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            شروط التسليم: {quote.paymentTerms}
                          </span>
                        </td>

                        {/* Normalized Base Price */}
                        <td className="p-3 font-mono">
                          {quote.lines[0] && (
                            <div>
                              <strong className="text-slate-900 font-bold">
                                {quote.lines[0].normalizedBaseUnitPriceSar.toFixed(2)} SAR
                              </strong>
                              <span className="text-[10px] text-slate-500 block font-sans">
                                / {quote.lines[0].normalizedBaseUom} (عبوة {quote.lines[0].packQuantity})
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Total in SAR with 15% VAT */}
                        <td className="p-3 font-mono">
                          <div className="text-sm font-bold text-slate-900">
                            {(quote.totalAmountWithVatSar ?? 0).toLocaleString()} SAR
                          </div>
                          <div className="text-[10px] text-slate-400">
                            الضريبة: {(quote.vatAmountSar ?? 0).toLocaleString()} SAR
                          </div>
                        </td>

                        {/* Award Button */}
                        <td className="p-3 text-center">
                          {currentEvent.status !== 'awarded' ? (
                            <button
                              onClick={() => handleOpenAwardModal(quote.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isExpiredOrRestricted
                                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                              }`}
                            >
                              ترسية العرض
                            </button>
                          ) : (
                            quote.id === currentEvent.awardedQuotationId ? (
                              <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                العرض الفائز ★
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">مستبعد</span>
                            )
                          )}
                        </td>

                      </tr>
                    );
                  })}

                  {eventQuotations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                        لم يتم تسجيل أي عروض أسعار مستلمة لهذه المنافسة بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          اختر منافسة لعرض وتحليل عروض الأسعار المقدمة.
        </div>
      )}

      {/* AWARD JUSTIFICATION MODAL (PROC17) */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>اعتماد الترسية وتوثيق المحضر (Formal Award Decision)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق قرار لجنة الترسية ومسوغات اختيار العرض الفائز وفق اللائحة الشرائية.
              </p>
            </div>

            {awardError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{awardError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  مسوغات ومبررات الترسية (Award Justification) <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={awardJustification}
                  onChange={(e) => setAwardJustification(e.target.value)}
                  placeholder="بيان أفضلية العرض (أفضل سعر مطابق فنياً، توفر الضمان، سرعة التوريد)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 text-[11px] leading-relaxed">
                سيتم تحديث حالة المنافسة إلى <strong>تمت الترسية (Awarded)</strong>، وحفظ مسوغات القرار في سجل التدقيق المؤسسي، وإتاحة زر توليد أمر الشراء المعتمد.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAwardModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteAward}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                تأكيد واعتماد الترسية
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
