import React, { useState } from 'react';
import { 
  FilePlus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  ArrowUpDown, 
  Plus, 
  Trash2, 
  FileText,
  DollarSign,
  Building,
  Save,
  X
} from 'lucide-react';
import { SupplierInvoice, SupplierInvoiceLine } from '../../types/accountsPayable';
import { validateIncomingSupplierInvoice } from '../../utils/accountsPayableEngine';
import { mockSupplierMasters, mockPurchaseOrders } from '../../data/mockProcurementOpsData';

interface SupplierInvoicesWorkspaceProps {
  invoices: SupplierInvoice[];
  onAddNewInvoice: (invoice: SupplierInvoice) => void;
  onOpenInvoiceDetail: (invoiceId: string) => void;
  effectiveDate: string;
}

export const SupplierInvoicesWorkspace: React.FC<SupplierInvoicesWorkspaceProps> = ({
  invoices,
  onAddNewInvoice,
  onOpenInvoiceDetail,
  effectiveDate
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State for Long Intake Form
  const [draftDocType, setDraftDocType] = useState<SupplierInvoice['documentType']>('standard_po_invoice');
  const [draftSupplierId, setDraftSupplierId] = useState(mockSupplierMasters[0]?.id || '');
  const [draftInvoiceNumber, setDraftInvoiceNumber] = useState('');
  const [draftInvoiceDate, setDraftInvoiceDate] = useState(effectiveDate);
  const [draftDueDate, setDraftDueDate] = useState('');
  const [draftCurrency, setDraftCurrency] = useState<'SAR' | 'USD' | 'EUR'>('SAR');
  const [draftPoNumber, setDraftPoNumber] = useState(mockPurchaseOrders[0]?.poNumber || '');
  const [draftNotes, setDraftNotes] = useState('');
  
  // Non-PO Service Acceptance fields
  const [serviceDept, setServiceDept] = useState('biomed');
  const [serviceStaff, setServiceStaff] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  // Line items state
  const [draftLines, setDraftLines] = useState<Partial<SupplierInvoiceLine>[]>([
    {
      lineNumber: 1,
      itemCode: 'ITEM-MS-001',
      itemDescriptionAr: 'قسطرة وريدية محيطية مقاس 20G',
      invoicedQuantity: 50,
      invoicedUom: 'box',
      unitPrice: 110.0,
      taxCode: 'VAT-STD-15',
      taxRatePercent: 15,
      costCenterCode: 'CC-ICU-701',
      glAccountCode: 'GL-5100-MEDSUP'
    }
  ]);

  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Line helpers
  const handleAddLine = () => {
    setDraftLines([
      ...draftLines,
      {
        lineNumber: draftLines.length + 1,
        itemCode: '',
        itemDescriptionAr: '',
        invoicedQuantity: 1,
        invoicedUom: 'each',
        unitPrice: 0,
        taxCode: 'VAT-STD-15',
        taxRatePercent: 15,
        costCenterCode: 'CC-ICU-701',
        glAccountCode: 'GL-5100-MEDSUP'
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (draftLines.length <= 1) return;
    setDraftLines(draftLines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof SupplierInvoiceLine, value: any) => {
    const updated = [...draftLines];
    updated[index] = { ...updated[index], [field]: value };
    setDraftLines(updated);
  };

  // Calculations for Draft Form
  const subtotal = draftLines.reduce((acc, l) => acc + ((l.invoicedQuantity || 0) * (l.unitPrice || 0)), 0);
  const taxTotal = draftLines.reduce((acc, l) => {
    const net = (l.invoicedQuantity || 0) * (l.unitPrice || 0);
    const rate = l.taxRatePercent || 0;
    return acc + (net * rate / 100);
  }, 0);
  const grossTotal = subtotal + taxTotal;

  // Submit Handler
  const handleSaveInvoice = () => {
    const selectedSupplier = mockSupplierMasters.find(s => s.id === draftSupplierId);

    const testDraft: Partial<SupplierInvoice> = {
      supplierId: draftSupplierId,
      invoiceNumber: draftInvoiceNumber,
      invoiceDate: draftInvoiceDate,
      lines: draftLines as any
    };

    const val = validateIncomingSupplierInvoice(testDraft, invoices);
    if (!val.isValid) {
      setFormValidationErrors(val.errors);
      if (val.duplicateSuspected) {
        setDuplicateWarning(val.duplicateMessageAr || 'رقم الفاتورة مكرر!');
      }
      return;
    }

    const calculatedLines: SupplierInvoiceLine[] = draftLines.map((l, idx) => {
      const qty = l.invoicedQuantity || 1;
      const price = l.unitPrice || 0;
      const net = qty * price;
      const taxRate = l.taxRatePercent || 0;
      const taxAmt = net * taxRate / 100;

      return {
        id: `INVL-NEW-${Date.now()}-${idx + 1}`,
        invoiceId: `INV-AP-NEW-${Date.now()}`,
        lineNumber: idx + 1,
        itemCode: l.itemCode || 'ITEM-GENERIC',
        itemDescriptionAr: l.itemDescriptionAr || 'بند توريد عام',
        itemDescriptionEn: l.itemDescriptionEn || 'Supply item',
        poNumber: draftDocType === 'standard_po_invoice' ? draftPoNumber : undefined,
        invoicedQuantity: qty,
        invoicedUom: l.invoicedUom || 'unit',
        baseUomQuantity: qty,
        unitPrice: price,
        lineDiscountAmount: 0,
        netLineAmount: net,
        taxCode: l.taxCode as any || 'VAT-STD-15',
        taxRatePercent: taxRate,
        taxAmount: taxAmt,
        totalLineAmount: net + taxAmt,
        costCenterCode: l.costCenterCode || 'CC-ICU-701',
        glAccountCode: l.glAccountCode || 'GL-5100-MEDSUP',
        lineMatchingResult: 'exact_match'
      };
    });

    const newInvoice: SupplierInvoice = {
      id: `INV-AP-${Date.now()}`,
      invoiceNumber: draftInvoiceNumber.trim(),
      branchId: 'main_hospital',
      supplierId: draftSupplierId,
      supplierNameAr: selectedSupplier?.legalNameAr || 'مورد تجاري مسجل',
      supplierNameEn: selectedSupplier?.legalNameEn || 'Registered Supplier',
      supplierTaxNumber: selectedSupplier?.taxRegistrationNumber || '300981245000003',
      documentType: draftDocType,
      invoiceDate: draftInvoiceDate,
      receivedDate: effectiveDate,
      accountingDate: effectiveDate,
      paymentTermsCode: 'NET_30',
      dueDate: draftDueDate || '2026-10-30',
      originalCurrency: draftCurrency,
      functionalCurrency: 'SAR',
      fxExchangeRate: draftCurrency === 'SAR' ? 1.0 : undefined,
      primaryPoNumber: draftDocType === 'standard_po_invoice' ? draftPoNumber : undefined,
      serviceAcceptanceRef: draftDocType === 'non_po_service_invoice' && serviceStaff ? {
        servicePeriodStart: draftInvoiceDate,
        servicePeriodEnd: draftInvoiceDate,
        acceptingDepartmentId: serviceDept,
        acceptingStaffName: serviceStaff,
        servicePerformanceConfirmed: true,
        confirmationNotesAr: serviceNotes || 'تم التحقق من إنجاز الخدمة ومطابقتها للشروط الفنية.'
      } : undefined,
      lines: calculatedLines,
      subtotalAmount: subtotal,
      headerDiscountAmount: 0,
      freightAndChargesAmount: 0,
      taxAmount: taxTotal,
      grossTotalAmount: grossTotal,
      convertedGrossTotalSar: draftCurrency === 'SAR' ? grossTotal : 0,
      appliedCreditNotesSar: 0,
      appliedPrepaymentsSar: 0,
      settledPaymentsSar: 0,
      remainingPayableBalanceSar: draftCurrency === 'SAR' ? grossTotal : 0,
      documentStatus: 'validated',
      matchingStatus: draftDocType === 'non_po_service_invoice' ? (serviceStaff ? 'matched_exact' : 'awaiting_docs') : 'awaiting_docs',
      approvalStatus: 'not_submitted',
      postingStatus: 'unposted',
      settlementStatus: 'on_hold',
      appliedMatchingPolicy: {
        policyProfile: draftDocType === 'non_po_service_invoice' ? 'service_acceptance_signoff' : 'three_way_po_grn',
        priceTolerancePercent: 2.0,
        priceToleranceAmountCapSar: 100.0,
        quantityTolerancePercent: 0,
        requiresQaAcceptance: false,
        policySource: 'Hospital AP Intake Standard'
      },
      activeHolds: [],
      notes: draftNotes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onAddNewInvoice(newInvoice);
    setIsCreatingNew(false);
    setDraftInvoiceNumber('');
    setFormValidationErrors([]);
    setDuplicateWarning(null);
  };

  // Filtered List
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.supplierNameAr.includes(searchTerm) ||
                          (inv.primaryPoNumber && inv.primaryPoNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || inv.documentType === filterType;
    const matchesStatus = filterStatus === 'all' || inv.settlementStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div id="supplier-invoices-workspace" className="space-y-5">
      
      {/* Action Header & Filtering */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              id="invoice-search-input"
              type="text"
              placeholder="بحث برقم الفاتورة، اسم المورد، أو أمر الشراء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs pr-9 pl-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Doc Type Filter */}
          <select
            id="invoice-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">كافة أنواع الفواتير</option>
            <option value="standard_po_invoice">فواتير أوامر الشراء (PO Invoices)</option>
            <option value="non_po_service_invoice">فواتير الخدمات (Non-PO Services)</option>
          </select>

          {/* Settlement Status Filter */}
          <select
            id="invoice-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">كافة حالات السداد</option>
            <option value="eligible">مؤهل للسداد (Eligible)</option>
            <option value="on_hold">معلق بحجز (On Hold)</option>
            <option value="in_proposal">ضمن مقترح دفع (In Proposal)</option>
            <option value="fully_settled">مسدد بالكامل (Settled)</option>
          </select>

        </div>

        {/* Create Invoice Button */}
        <button
          id="open-create-invoice-button"
          onClick={() => {
            setIsCreatingNew(true);
            setFormValidationErrors([]);
            setDuplicateWarning(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>تسجيل فاتورة مورد جديدة</span>
        </button>
      </div>

      {/* MODAL / DRAWER: LONG INTAKE FORM (ANCHORED SECTIONS) */}
      {isCreatingNew && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-xl space-y-5 animate-in fade-in">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-emerald-400" />
                <span>تسجيل فاتورة مورد جديدة - نموذج الاستلام والإدخال الشامل</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                نموذج إدخال مفصل يغطي بيانات الفاتورة، أوامر الشراء، البنود، الضرائب ومحاضر القبول
              </p>
            </div>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Validation Warnings & Duplicates */}
          {formValidationErrors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>تعذر حفظ الفاتورة لوجود أخطاء تدقيق:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] pr-2">
                {formValidationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">تنبيه الاشتباه في تكرار الفاتورة: </span>
                <span>{duplicateWarning}</span>
              </div>
            </div>
          )}

          {/* Section 1: Header & Supplier Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-lg border border-slate-700/50 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">نوع المستند</label>
              <select
                id="draft-doc-type-select"
                value={draftDocType}
                onChange={(e) => setDraftDocType(e.target.value as any)}
                className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="standard_po_invoice">فاتورة أمر شراء مستندي (PO Backed)</option>
                <option value="non_po_service_invoice">فاتورة خدمات بدون أمر شراء (Non-PO Service)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">المورد التجاري المعتمد</label>
              <select
                id="draft-supplier-select"
                value={draftSupplierId}
                onChange={(e) => setDraftSupplierId(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
              >
                {mockSupplierMasters.map(s => (
                  <option key={s.id} value={s.id}>{s.legalNameAr || s.tradeName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">رقم فاتورة المورد</label>
              <input
                id="draft-invoice-number-input"
                type="text"
                placeholder="مثال: INV-2026-904"
                value={draftInvoiceNumber}
                onChange={(e) => setDraftInvoiceNumber(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">العملة</label>
              <select
                id="draft-currency-select"
                value={draftCurrency}
                onChange={(e) => setDraftCurrency(e.target.value as any)}
                className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو أوروبي (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">تاريخ إصدار الفاتورة</label>
              <input
                id="draft-invoice-date-input"
                type="date"
                value={draftInvoiceDate}
                onChange={(e) => setDraftInvoiceDate(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">تاريخ الاستحقاق المتوقع</label>
              <input
                id="draft-due-date-input"
                type="date"
                value={draftDueDate}
                onChange={(e) => setDraftDueDate(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {draftDocType === 'standard_po_invoice' ? (
              <div className="col-span-2">
                <label className="block text-slate-400 font-medium mb-1">رقم أمر الشراء المستندي المرجعي</label>
                <select
                  id="draft-po-select"
                  value={draftPoNumber}
                  onChange={(e) => setDraftPoNumber(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {mockPurchaseOrders.map(po => (
                    <option key={po.id} value={po.poNumber}>{po.poNumber} - {po.supplierNameAr}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="col-span-2">
                <label className="block text-slate-400 font-medium mb-1">مسؤول ومحضر إنجاز الخدمة الفني</label>
                <input
                  id="draft-service-staff-input"
                  type="text"
                  placeholder="اسم المهندس أو الطبيب المعتمد لمحضر الإنجاز..."
                  value={serviceStaff}
                  onChange={(e) => setServiceStaff(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Section 2: Invoice Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300">بنود الفاتورة والكميات المسعرة</h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة بند مالي</span>
              </button>
            </div>

            <div className="space-y-2">
              {draftLines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-xs items-center">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-0.5">وصف البند / الصنف</label>
                    <input
                      type="text"
                      placeholder="اسم المستلزم أو الخدمة..."
                      value={line.itemDescriptionAr || ''}
                      onChange={(e) => handleLineChange(idx, 'itemDescriptionAr', e.target.value)}
                      className="w-full bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">الكمية المفوترة</label>
                    <input
                      type="number"
                      min="1"
                      value={line.invoicedQuantity || ''}
                      onChange={(e) => handleLineChange(idx, 'invoicedQuantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">سعر الوحدة ({draftCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.unitPrice || ''}
                      onChange={(e) => handleLineChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">نسبة الضريبة</label>
                    <select
                      value={line.taxRatePercent || 15}
                      onChange={(e) => handleLineChange(idx, 'taxRatePercent', parseInt(e.target.value, 10))}
                      className="w-full bg-slate-900 text-slate-200 px-2 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs"
                    >
                      <option value="15">15% قياسية</option>
                      <option value="0">0% أدوية مؤهلة</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {((((line.invoicedQuantity || 0) * (line.unitPrice || 0)) * (1 + (line.taxRatePercent || 0)/100)) || 0).toLocaleString()} {draftCurrency}
                    </span>
                    {draftLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                        title="حذف البند"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Summary Totals & Footer Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">المبلغ الصافي:</span>
                <span className="font-mono font-bold text-white text-sm">{(subtotal || 0).toLocaleString()} {draftCurrency}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">إجمالي الضريبة:</span>
                <span className="font-mono font-bold text-yellow-400 text-sm">{(taxTotal || 0).toLocaleString()} {draftCurrency}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الإجمالي الكلي للفاتورة:</span>
                <span className="font-mono font-bold text-emerald-400 text-base">{(grossTotal || 0).toLocaleString()} {draftCurrency}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                id="submit-save-invoice-button"
                onClick={handleSaveInvoice}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ وتدقيق الفاتورة</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Invoices Master Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                <th className="py-3 px-4 font-semibold">رقم الفاتورة</th>
                <th className="py-3 px-4 font-semibold">المورد التجاري</th>
                <th className="py-3 px-4 font-semibold">النوع والارتباط</th>
                <th className="py-3 px-4 font-semibold">تاريخ الفاتورة</th>
                <th className="py-3 px-4 font-semibold">تاريخ الاستحقاق</th>
                <th className="py-3 px-4 font-semibold">إجمالي الفاتورة</th>
                <th className="py-3 px-4 font-semibold">المتبقي للسداد</th>
                <th className="py-3 px-4 font-semibold">حالة المطابقة</th>
                <th className="py-3 px-4 font-semibold">حالة السداد</th>
                <th className="py-3 px-4 font-semibold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    <span dir="ltr">{inv.invoiceNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200">{inv.supplierNameAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{inv.supplierTaxNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    {inv.documentType === 'standard_po_invoice' ? (
                      <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                        {inv.primaryPoNumber || 'أمر شراء'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        خدمات فنية Non-PO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{inv.invoiceDate}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{inv.dueDate}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    {(inv.grossTotalAmount ?? 0).toLocaleString()} {inv.originalCurrency}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {(inv.remainingPayableBalanceSar ?? 0).toLocaleString()} ريال
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      inv.matchingStatus === 'matched_exact'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : inv.matchingStatus === 'price_variance_hold' || inv.matchingStatus === 'qty_variance_hold'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : inv.matchingStatus === 'exception_hold'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inv.matchingStatus === 'matched_exact' ? 'مطابقة تامة' :
                       inv.matchingStatus === 'price_variance_hold' ? 'فارق سعر' :
                       inv.matchingStatus === 'qty_variance_hold' ? 'فارق كمية' :
                       inv.matchingStatus === 'exception_hold' ? 'حجز رقابي' : inv.matchingStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      inv.settlementStatus === 'eligible'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : inv.settlementStatus === 'on_hold'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : inv.settlementStatus === 'fully_settled'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inv.settlementStatus === 'eligible' ? 'مؤهل للسداد' :
                       inv.settlementStatus === 'on_hold' ? 'معلق بحجز' :
                       inv.settlementStatus === 'fully_settled' ? 'مسدد بالكامل' :
                       inv.settlementStatus === 'in_proposal' ? 'ضمن مقترح دفع' : inv.settlementStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onOpenInvoiceDetail(inv.id)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                    >
                      معاينة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
