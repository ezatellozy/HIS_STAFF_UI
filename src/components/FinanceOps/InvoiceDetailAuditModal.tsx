import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Scale, 
  RotateCcw, 
  Lock, 
  Unlock, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Printer,
  X
} from 'lucide-react';
import { SupplierInvoice, InvoiceHoldRecord } from '../../types/accountsPayable';
import { mockPurchaseOrders } from '../../data/mockProcurementOpsData';
import { initialGoodsReceipts } from '../../data/mockSupplyChainOpsData';

interface InvoiceDetailAuditModalProps {
  invoice: SupplierInvoice | null;
  onClose: () => void;
  onOpenMatching: (invoiceId: string) => void;
}

export const InvoiceDetailAuditModal: React.FC<InvoiceDetailAuditModalProps> = ({
  invoice,
  onClose,
  onOpenMatching
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'lines' | 'matching' | 'tax' | 'holds' | 'posting' | 'payments'>('summary');

  if (!invoice) return null;

  const matchedPo = invoice.primaryPoNumber
    ? mockPurchaseOrders.find(p => p.poNumber === invoice.primaryPoNumber)
    : undefined;

  const matchedGrns = invoice.primaryPoNumber
    ? initialGoodsReceipts.filter(r => r.poNumber === invoice.primaryPoNumber)
    : [];

  return (
    <div id="invoice-detail-audit-modal" className="fixed inset-0 bg-black/80 flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-lg font-bold text-white" dir="ltr">{invoice.invoiceNumber}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                invoice.matchingStatus === 'matched_exact'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {invoice.matchingStatus}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {invoice.documentType}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>المورد: <strong className="text-slate-200">{invoice.supplierNameAr}</strong></span>
              <span>•</span>
              <span>الرقم الضريبي: <strong className="font-mono text-slate-300">{invoice.supplierTaxNumber}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenMatching(invoice.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>منصة المطابقة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-AXIS ORTHOGONAL STATUS BAR (MANDATORY AP ARCHITECTURE) */}
        <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">1. المستند (Doc):</span>
            <span className="font-bold text-slate-300">{invoice.documentStatus}</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">2. المطابقة (Match):</span>
            <span className="font-bold text-emerald-400">{invoice.matchingStatus}</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">3. الاعتماد (Approval):</span>
            <span className="font-bold text-indigo-400">{invoice.approvalStatus}</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">4. الترحيل (Posting):</span>
            <span className="font-bold text-amber-400">{invoice.postingStatus}</span>
          </div>
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-slate-500 block text-[10px]">5. التسوية (Settlement):</span>
            <span className="font-bold text-emerald-400">{invoice.settlementStatus}</span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'summary' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ملخص الفاتورة
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'lines' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            بنود الفاتورة ({invoice.lines.length})
          </button>
          <button
            onClick={() => setActiveTab('matching')}
            className={`py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'matching' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المطابقة والربط
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'tax' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المعاملة الضريبية
          </button>
          <button
            onClick={() => setActiveTab('holds')}
            className={`py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'holds' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الحجوزات ({invoice.activeHolds.length})
          </button>
          <button
            onClick={() => setActiveTab('posting')}
            className={`py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'posting' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            سند القيد المحاسبي
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'payments' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            السدادات والتسوية
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-slate-400 font-bold block text-[11px]">التواريخ وشروط الدفع</span>
                  <div className="flex justify-between text-slate-300">
                    <span>تاريخ الفاتورة:</span>
                    <span className="font-mono">{invoice.invoiceDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>تاريخ الاستلام:</span>
                    <span className="font-mono">{invoice.receivedDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>تاريخ الاستحقاق:</span>
                    <span className="font-mono text-emerald-400 font-bold">{invoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>شروط السداد:</span>
                    <span className="font-mono text-indigo-300">{invoice.paymentTermsCode}</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-slate-400 font-bold block text-[11px]">العملة والمبالغ المالية</span>
                  <div className="flex justify-between text-slate-300">
                    <span>عملة الفاتورة:</span>
                    <span className="font-mono font-bold text-white">{invoice.originalCurrency}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>سعر الصرف (FX):</span>
                    <span className="font-mono">{invoice.fxExchangeRate ?? '1.0 (وظيفية)'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>المبلغ الصافي:</span>
                    <span className="font-mono">{(invoice.subtotalAmount ?? 0).toLocaleString()} {invoice.originalCurrency}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>إجمالي الضريبة:</span>
                    <span className="font-mono text-yellow-400">{(invoice.taxAmount ?? 0).toLocaleString()} {invoice.originalCurrency}</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-slate-400 font-bold block text-[11px]">أرصدة التسوية والسداد</span>
                  <div className="flex justify-between text-slate-300">
                    <span>الإجمالي الكلي (SAR):</span>
                    <span className="font-mono font-bold text-white">{(invoice.convertedGrossTotalSar ?? 0).toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>المخصوم (إشعارات/دفعات):</span>
                    <span className="font-mono text-indigo-400">
                      {((invoice.appliedCreditNotesSar || 0) + (invoice.appliedPrepaymentsSar || 0)).toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>المسدد عبر الخزينة:</span>
                    <span className="font-mono text-emerald-400">{(invoice.settledPaymentsSar ?? 0).toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-700">
                    <span className="font-bold">المتبقي المستحق:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{(invoice.remainingPayableBalanceSar ?? 0).toLocaleString()} ريال</span>
                  </div>
                </div>

              </div>

              {invoice.notes && (
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 font-bold block mb-1">ملاحظات الفاتورة:</span>
                  <p className="text-slate-300 leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LINE ITEMS */}
          {activeTab === 'lines' && (
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">الوصف / الصنف</th>
                    <th className="py-2.5 px-3">الكمية</th>
                    <th className="py-2.5 px-3">سعر الوحدة</th>
                    <th className="py-2.5 px-3">المبلغ الصافي</th>
                    <th className="py-2.5 px-3">الضريبة</th>
                    <th className="py-2.5 px-3">الإجمالي</th>
                    <th className="py-2.5 px-3">مركز التكلفة</th>
                    <th className="py-2.5 px-3">حساب الأستاذ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {invoice.lines.map(line => (
                    <tr key={line.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{line.lineNumber}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-200">{line.itemDescriptionAr}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{line.itemCode}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{line.invoicedQuantity} {line.invoicedUom}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{line.unitPrice}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{(line.netLineAmount ?? 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-yellow-400">
                        {(line.taxAmount ?? 0).toLocaleString()} ({line.taxRatePercent}%)
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{(line.totalLineAmount ?? 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">{line.costCenterCode}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">{line.glAccountCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: MATCHING & UPSTREAM REFS */}
          {activeTab === 'matching' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* PO Reference */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-indigo-400 font-bold block">أمر الشراء المرتبط (Purchase Order)</span>
                  {matchedPo ? (
                    <div className="space-y-1.5 text-slate-300">
                      <div className="flex justify-between">
                        <span>رقم الأمر:</span>
                        <span className="font-mono text-white font-bold">{matchedPo.poNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تاريخ الأمر:</span>
                        <span className="font-mono">{matchedPo.orderDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الأمر:</span>
                        <span className="font-mono text-indigo-300 font-bold">{(matchedPo.totalAmountSar ?? 0).toLocaleString()} ريال</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">
                      {invoice.documentType === 'non_po_service_invoice' ? 'فاتورة خدمات مصرح بها بدون أمر شراء مستندي.' : 'لا يوجد أمر شراء مرتبط.'}
                    </p>
                  )}
                </div>

                {/* GRN Reference */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-amber-400 font-bold block">سندات الاستلام المخزني (Goods Receipts)</span>
                  {matchedGrns.length > 0 ? (
                    <div className="space-y-2">
                      {matchedGrns.map(g => (
                        <div key={g.id} className="bg-slate-900/60 p-2 rounded border border-slate-700/60 text-[11px] flex justify-between items-center">
                          <span className="font-mono text-amber-300 font-bold" dir="ltr">{g.receiptReference}</span>
                          <span className="font-mono text-slate-300">{g.receivedAt}</span>
                          <span className="font-mono text-emerald-400 font-bold">مقبول QA: {g.acceptedQty}</span>
                        </div>
                      ))}
                    </div>
                  ) : invoice.serviceAcceptanceRef ? (
                    <div className="text-slate-300 space-y-1">
                      <div className="font-bold text-emerald-400">محضر قبول فني معتمد</div>
                      <div className="text-slate-400 text-[11px]">المعتمد: {invoice.serviceAcceptanceRef.acceptingStaffName}</div>
                      <p className="text-slate-400 text-[11px]">{invoice.serviceAcceptanceRef.confirmationNotesAr}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400">لا توجد سندات استلام مسجلة حتى الآن.</p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: TAX TREATMENT */}
          {activeTab === 'tax' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <span className="text-yellow-400 font-bold block">تفاصيل المعاملة الضريبية للفاتورة</span>
              <p className="text-slate-300 leading-relaxed">
                تتضمن الفاتورة تصنيفاً ضريبياً على مستوى البنود (معاملات قياسية 15% وتوريدات معفاة/صفرية للأدوية التخصصية المؤهلة).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">الرقم الضريبي للمورد:</span>
                  <span className="font-mono font-bold text-white">{invoice.supplierTaxNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">إجمالي الوعاء الخاضع:</span>
                  <span className="font-mono font-bold text-white">{(invoice.subtotalAmount ?? 0).toLocaleString()} {invoice.originalCurrency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">مبلغ الضريبة المحسوب:</span>
                  <span className="font-mono font-bold text-yellow-400">{(invoice.taxAmount ?? 0).toLocaleString()} {invoice.originalCurrency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">المطابقة الضريبية:</span>
                  <span className="font-bold text-emerald-400">محققة وفق كود الضريبة</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HOLDS */}
          {activeTab === 'holds' && (
            <div className="space-y-3">
              {invoice.activeHolds.length > 0 ? (
                invoice.activeHolds.map(hold => (
                  <div key={hold.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">{hold.holdType}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hold.isResolved ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {hold.isResolved ? 'تم فك الحجز' : 'حجز رقابي نشط'}
                      </span>
                    </div>
                    <p className="text-slate-300">{hold.reasonAr}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      فرض بواسطة: {hold.placedBy} بتاريخ {hold.placedAt}
                    </div>
                    {hold.isResolved && (
                      <div className="mt-2 pt-1 border-t border-slate-700 text-[11px] text-emerald-300">
                        <strong>مبرر الفك: </strong>{hold.resolutionJustificationAr} ({hold.resolvedBy})
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  لا توجد أي حجوزات رقابية على هذه الفاتورة.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: POSTING RECORD */}
          {activeTab === 'posting' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <span className="text-indigo-400 font-bold block">سند القيد المحاسبي لدفتر الأستاذ (GL Voucher)</span>
              {invoice.syntheticVoucherRecord ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">رقم سند القيد:</span>
                    <span className="font-mono font-bold text-emerald-400">{invoice.syntheticVoucherRecord.voucherNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحساب المدين (Debit Expense):</span>
                    <span className="font-mono text-white">{invoice.syntheticVoucherRecord.debitAccountCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الحساب الدائن (Credit AP):</span>
                    <span className="font-mono text-white">{invoice.syntheticVoucherRecord.creditAccountCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ الترحيل:</span>
                    <span className="font-mono text-slate-300">{invoice.syntheticVoucherRecord.postedAt}</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-slate-400">
                  لم يتم ترحيل سند القيد لهذه الفاتورة بعد (الحالة: {invoice.postingStatus}). اعتماد الفاتورة لا يرحل القيد تلقائياً.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PAYMENTS & SETTLEMENT */}
          {activeTab === 'payments' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <span className="text-emerald-400 font-bold block">سجل حركات السداد والتسوية</span>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">المبلغ المسدد فعلياً عبر الخزينة:</span>
                  <span className="font-mono font-bold text-white">{(invoice.settledPaymentsSar ?? 0).toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الإشعارات الدائنة المخصومة:</span>
                  <span className="font-mono text-indigo-300">{(invoice.appliedCreditNotesSar ?? 0).toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الدفعات المقدمة المخصومة:</span>
                  <span className="font-mono text-indigo-300">{(invoice.appliedPrepaymentsSar ?? 0).toLocaleString()} ريال</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="font-bold text-slate-300">الرصيد المتبقي الواجب سداده:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{(invoice.remainingPayableBalanceSar ?? 0).toLocaleString()} ريال</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">ID: {invoice.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
          >
            إغلاق المعاينة
          </button>
        </div>

      </div>
    </div>
  );
};
