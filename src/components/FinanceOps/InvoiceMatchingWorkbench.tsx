import React, { useState } from 'react';
import { 
  Scale, 
  FileText, 
  PackageCheck, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Info, 
  ChevronRight,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { SupplierInvoice, SupplierInvoiceLine } from '../../types/accountsPayable';
import { mockPurchaseOrders } from '../../data/mockProcurementOpsData';
import { initialGoodsReceipts } from '../../data/mockSupplyChainOpsData';

interface InvoiceMatchingWorkbenchProps {
  invoices: SupplierInvoice[];
  onSelectInvoice: (invoiceId: string) => void;
  selectedInvoiceId?: string;
  onOpenHoldModal?: (invoiceId: string) => void;
}

export const InvoiceMatchingWorkbench: React.FC<InvoiceMatchingWorkbenchProps> = ({
  invoices,
  onSelectInvoice,
  selectedInvoiceId
}) => {
  const activeInvoiceId = selectedInvoiceId || invoices[0]?.id;
  const currentInvoice = invoices.find(inv => inv.id === activeInvoiceId) || invoices[0];

  // Upstream Data Lookups (Read-Only references from Procurement & Supply Chain)
  const matchedPo = currentInvoice?.primaryPoNumber 
    ? mockPurchaseOrders.find(po => po.poNumber === currentInvoice.primaryPoNumber)
    : undefined;

  const matchedGrns = currentInvoice?.primaryPoNumber
    ? initialGoodsReceipts.filter(rcv => rcv.poNumber === currentInvoice.primaryPoNumber)
    : [];

  return (
    <div id="invoice-matching-workbench" className="space-y-5">
      
      {/* Invoice Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">منصة مطابقة فواتير الموردين (3-Way Invoice Matching Workbench)</h3>
            <p className="text-xs text-slate-400">
              مطابقة ثلاثية الأطراف بين فاتورة المورد، أمر الشراء المعتمد، ومحاضر الاستلام والفحص المخزني
            </p>
          </div>
        </div>

        {/* Invoice Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">اختر الفاتورة:</span>
          <select
            id="matching-invoice-selector"
            value={currentInvoice?.id || ''}
            onChange={(e) => onSelectInvoice(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono font-bold cursor-pointer"
          >
            {invoices.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} - {inv.supplierNameAr} ({inv.matchingStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentInvoice && (
        <div className="space-y-4">
          
          {/* Policy Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400">سياسة المطابقة المطبقة:</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {currentInvoice.appliedMatchingPolicy.policyProfile}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">تسامح السعر:</span>
              <span className="font-mono text-emerald-400 font-bold">{currentInvoice.appliedMatchingPolicy.priceTolerancePercent}%</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">فحص الجودة إلزامي:</span>
              <span className={`font-bold ${currentInvoice.appliedMatchingPolicy.requiresQaAcceptance ? 'text-amber-400' : 'text-slate-400'}`}>
                {currentInvoice.appliedMatchingPolicy.requiresQaAcceptance ? 'نعم (QA Mandatory)' : 'لا'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              <span className="text-slate-500">المرجع التنظيمي: </span>
              <span>{currentInvoice.appliedMatchingPolicy.policySource}</span>
            </div>
          </div>

          {/* SIDE-BY-SIDE COMPARISON: INVOICE vs PO vs GRN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* COLUMN 1: SUPPLIER INVOICE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>فاتورة المورد (Supplier Invoice)</span>
                </span>
                <span className="font-mono text-xs text-slate-300 font-bold" dir="ltr">
                  {currentInvoice.invoiceNumber}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>المورد:</span>
                  <span className="text-slate-200 font-medium">{currentInvoice.supplierNameAr}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>تاريخ الفاتورة:</span>
                  <span className="font-mono text-slate-200">{currentInvoice.invoiceDate}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>إجمالي المبلغ:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {(currentInvoice.grossTotalAmount ?? 0).toLocaleString()} {currentInvoice.originalCurrency}
                  </span>
                </div>
              </div>

              {/* Line Items on Invoice */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">بنود الفاتورة:</span>
                {currentInvoice.lines.map(l => (
                  <div key={l.id} className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 text-xs space-y-1">
                    <div className="font-medium text-slate-200">{l.itemDescriptionAr}</div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>الكمية: <strong className="text-white">{l.invoicedQuantity}</strong> {l.invoicedUom}</span>
                      <span>السعر: <strong className="text-white">{l.unitPrice}</strong> {currentInvoice.originalCurrency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: PURCHASE ORDER (READ-ONLY PROCUREMENT REFERENCE) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4" />
                  <span>أمر الشراء المعتمد (Purchase Order)</span>
                </span>
                <span className="font-mono text-xs text-slate-300 font-bold" dir="ltr">
                  {matchedPo?.poNumber || (currentInvoice.documentType === 'non_po_service_invoice' ? 'خدمة فنية بدون أمر شراء' : 'غير متوفر')}
                </span>
              </div>

              {matchedPo ? (
                <>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>رقم أمر الشراء:</span>
                      <span className="font-mono text-indigo-300 font-bold">{matchedPo.poNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>تاريخ الإصدار:</span>
                      <span className="font-mono text-slate-200">{matchedPo.orderDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>إجمالي الأمر:</span>
                      <span className="font-mono text-indigo-300 font-bold">{(matchedPo.totalAmountSar ?? 0).toLocaleString()} ريال</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block">بنود أمر الشراء المعتمدة:</span>
                    {matchedPo.lines.map(pol => (
                      <div key={pol.id} className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60 text-xs space-y-1">
                        <div className="font-medium text-slate-200">{pol.itemDescriptionAr}</div>
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span>الكمية المطلوبة: <strong className="text-white">{pol.originalOrderedQuantity}</strong> {pol.orderedUom}</span>
                          <span>السعر المتفق عليه: <strong className="text-white">{pol.unitPriceSar}</strong> ريال</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  {currentInvoice.documentType === 'non_po_service_invoice' 
                    ? 'فاتورة خدمات طبية مصرح بها بدون أمر شراء مستندي استناداً إلى محضر إنجاز الخدمة.'
                    : 'لم يتم العثور على أمر شراء مستندي مطابق في سجلات المشتريات.'}
                </div>
              )}
            </div>

            {/* COLUMN 3: GOODS RECEIPT & QA INSPECTION (READ-ONLY INVENTORY REFERENCE) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>محاضر الاستلام والفحص (GRN & QA)</span>
                </span>
                <span className="font-mono text-xs text-slate-300 font-bold">
                  {matchedGrns.length > 0 ? `${matchedGrns.length} سند استلام` : (currentInvoice.serviceAcceptanceRef ? 'محضر قبول فني' : 'غير متوفر')}
                </span>
              </div>

              {matchedGrns.length > 0 ? (
                <div className="space-y-3">
                  {matchedGrns.map(grn => (
                    <div key={grn.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-xs space-y-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-amber-300" dir="ltr">{grn.receiptReference}</span>
                        <span className="text-[10px] text-slate-400">{grn.receivedAt}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-2 rounded text-center font-mono text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-500 block">المستلم:</span>
                          <span className="font-bold text-white">{grn.receivedQty}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-500 block">المقبول QA:</span>
                          <span className="font-bold text-emerald-400">{grn.acceptedQty}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 block">المرفوض/حجر:</span>
                          <span className="font-bold text-rose-400">{grn.quarantinedQty + grn.rejectedQty}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">ملاحظات الفحص: </strong>
                        {grn.inspectionNotes}
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentInvoice.serviceAcceptanceRef ? (
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-xs space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-emerald-400">إنجاز خدمة فنية معتمد</span>
                    <span className="text-[10px] text-slate-400">{currentInvoice.serviceAcceptanceRef.servicePeriodEnd}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">المسؤول المعتمد: </span>
                    <strong>{currentInvoice.serviceAcceptanceRef.acceptingStaffName}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {currentInvoice.serviceAcceptanceRef.confirmationNotesAr}
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  لا توجد سندات استلام مسجلة بالمستودع لهذا الأمر حتى الآن (Awaiting GRN).
                </div>
              )}
            </div>

          </div>

          {/* DETAILED LINE-BY-LINE MATCHING TABLE & VARIANCE ANALYSIS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>جدول المطابقة التفصيلي على مستوى البنود (Line-Level Matching & Variance Analysis)</span>
              </h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentInvoice.matchingStatus === 'matched_exact'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : currentInvoice.matchingStatus === 'price_variance_hold' || currentInvoice.matchingStatus === 'qty_variance_hold'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                حالة المطابقة: {currentInvoice.matchingStatus}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    <th className="py-2.5 px-3 font-semibold">الصنف / الوصف</th>
                    <th className="py-2.5 px-3 font-semibold">كمية الفاتورة</th>
                    <th className="py-2.5 px-3 font-semibold">كمية أمر الشراء</th>
                    <th className="py-2.5 px-3 font-semibold">المستلم الفعلي</th>
                    <th className="py-2.5 px-3 font-semibold">المقبول رقابياً</th>
                    <th className="py-2.5 px-3 font-semibold">سعر الفاتورة</th>
                    <th className="py-2.5 px-3 font-semibold">سعر أمر الشراء</th>
                    <th className="py-2.5 px-3 font-semibold">فارق السعر</th>
                    <th className="py-2.5 px-3 font-semibold">نتيجة المطابقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {currentInvoice.lines.map(line => (
                    <tr key={line.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{line.lineNumber}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-200">{line.itemDescriptionAr}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{line.itemCode}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{line.invoicedQuantity} {line.invoicedUom}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{line.matchedPoOrderedQty ?? '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{line.matchedGrnReceivedQty ?? '-'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{line.matchedGrnAcceptedQty ?? '-'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{line.unitPrice}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{line.matchedPoUnitPrice ?? '-'}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {line.priceVariancePercent !== undefined && line.priceVariancePercent !== 0 ? (
                          <span className={line.priceVariancePercent > 2 ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                            +{line.priceVariancePercent}%
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">0.0%</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          line.lineMatchingResult === 'exact_match'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : line.lineMatchingResult === 'price_variance'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {line.lineMatchingResult === 'exact_match' ? 'مطابقة تامة' :
                           line.lineMatchingResult === 'price_variance' ? 'فارق سعر' :
                           line.lineMatchingResult === 'qty_variance' ? 'فارق كمية' : line.lineMatchingResult}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
