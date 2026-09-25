import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Unlock, 
  RotateCcw, 
  Clock, 
  FileText,
  UserCheck,
  Building2,
  X
} from 'lucide-react';
import { SupplierInvoice, InvoiceHoldRecord } from '../../types/accountsPayable';
import { releaseInvoiceHold, returnInvoiceForCorrection } from '../../utils/accountsPayableEngine';

interface ExceptionsAndHoldsWorkspaceProps {
  invoices: SupplierInvoice[];
  onUpdateInvoice: (updatedInvoice: SupplierInvoice) => void;
  activePersona: string;
}

export const ExceptionsAndHoldsWorkspace: React.FC<ExceptionsAndHoldsWorkspaceProps> = ({
  invoices,
  onUpdateInvoice,
  activePersona
}) => {
  const [selectedHold, setSelectedHold] = useState<{ invoice: SupplierInvoice; hold: InvoiceHoldRecord } | null>(null);
  const [releaseJustification, setReleaseJustification] = useState('');
  
  // Return for Correction Modal State
  const [returnInvoiceTarget, setReturnInvoiceTarget] = useState<SupplierInvoice | null>(null);
  const [returnReason, setReturnReason] = useState('');

  // Collect all active and resolved holds across invoices
  const allHolds: { invoice: SupplierInvoice; hold: InvoiceHoldRecord }[] = [];
  invoices.forEach(inv => {
    inv.activeHolds.forEach(h => {
      allHolds.push({ invoice: inv, hold: h });
    });
  });

  const activeHolds = allHolds.filter(item => !item.hold.isResolved);
  const resolvedHolds = allHolds.filter(item => item.hold.isResolved);

  const handleConfirmReleaseHold = () => {
    if (!selectedHold || !releaseJustification.trim()) return;

    const updated = releaseInvoiceHold(
      selectedHold.invoice,
      selectedHold.hold.id,
      releaseJustification.trim(),
      activePersona === 'financial_controller' ? 'المدير المالي (Financial Controller)' : 'رئيس الحسابات الدائنة (AP Lead)'
    );

    onUpdateInvoice(updated);
    setSelectedHold(null);
    setReleaseJustification('');
  };

  const handleConfirmReturnForCorrection = () => {
    if (!returnInvoiceTarget || !returnReason.trim()) return;

    const updated = returnInvoiceForCorrection(
      returnInvoiceTarget,
      returnReason.trim(),
      activePersona === 'ap_lead' ? 'رئيس قسم الحسابات الدائنة' : 'محاسب الحسابات الدائنة'
    );

    onUpdateInvoice(updated);
    setReturnInvoiceTarget(null);
    setReturnReason('');
  };

  return (
    <div id="exceptions-and-holds-workspace" className="space-y-5">
      
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">إدارة الحجوزات والفروقات الرقابية (Exceptions & AP Holds)</h3>
            <p className="text-xs text-slate-400">
              متابعة فروقات التسعير، زيادة الكميات، غياب سندات الاستلام، وتغيير الحسابات البنكية للموردين
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">الحجوزات النشطة:</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-mono font-bold">
            {activeHolds.length} حجز نشط
          </span>
        </div>
      </div>

      {/* ACTIVE HOLDS WORKLIST */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>الحجوزات الرقابية النشطة المعلقة (Active AP Holds)</span>
          </h4>
        </div>

        {activeHolds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">رقم الفاتورة</th>
                  <th className="py-2.5 px-4 font-semibold">المورد التجاري</th>
                  <th className="py-2.5 px-4 font-semibold">نوع الحجز</th>
                  <th className="py-2.5 px-4 font-semibold">سبب الحجز وتفاصيل الفارق</th>
                  <th className="py-2.5 px-4 font-semibold">تاريخ الفرض</th>
                  <th className="py-2.5 px-4 font-semibold">المسؤول / النظام</th>
                  <th className="py-2.5 px-4 font-semibold text-center">الإجراءات المتاحة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {activeHolds.map(({ invoice, hold }) => (
                  <tr key={hold.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      <span dir="ltr">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{invoice.supplierNameAr}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        {hold.holdType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">{hold.reasonAr}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{hold.placedAt}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{hold.placedBy}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedHold({ invoice, hold });
                            setReleaseJustification('');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>فك الحجز</span>
                        </button>
                        <button
                          onClick={() => {
                            setReturnInvoiceTarget(invoice);
                            setReturnReason(hold.reasonAr);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                          title="إعادة الفاتورة للمورد للتصحيح"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة للتصحيح</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            لا توجد حجوزات رقابية نشطة حالياً، كافة الفواتير مستوفية للشروط النظامية.
          </div>
        )}
      </div>

      {/* MODAL: RELEASE HOLD JUSTIFICATION */}
      {selectedHold && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>فك الحجز الرقابي عن الفاتورة ({selectedHold.invoice.invoiceNumber})</span>
              </h3>
              <button onClick={() => setSelectedHold(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
              <div className="text-slate-400 font-medium">سبب الحجز الأصلي:</div>
              <p className="text-amber-300">{selectedHold.hold.reasonAr}</p>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                مبررات وتفويض فك الحجز الرقابي (إلزامي للرقابة المالية):
              </label>
              <textarea
                rows={3}
                placeholder="أدخل مبرر التجاوز المعتمد (مثال: اعتماد المدير المالي للمطابقة استناداً إلى خطاب تعديل الأسعار...)"
                value={releaseJustification}
                onChange={(e) => setReleaseJustification(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedHold(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={!releaseJustification.trim()}
                onClick={handleConfirmReleaseHold}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer"
              >
                تأكيد فك الحجز وإتاحة الاعتماد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RETURN INVOICE FOR CORRECTION (AP06) */}
      {returnInvoiceTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>إعادة الفاتورة للمورد للتصحيح ({returnInvoiceTarget.invoiceNumber})</span>
              </h3>
              <button onClick={() => setReturnInvoiceTarget(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              سيتم حفظ كامل بيانات الفاتورة الأصلية وسجل المراجعة وتوثيق سبب الإعادة مع تغيير حالتها إلى (Returned for Correction).
            </p>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                سبب إعادة الفاتورة للمورد (موضحاً التعديلات المطلوبة):
              </label>
              <textarea
                rows={3}
                placeholder="أدخل ملاحظات التوجيه للمورد..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-xs p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReturnInvoiceTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={!returnReason.trim()}
                onClick={handleConfirmReturnForCorrection}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer"
              >
                تأكيد إعادة الفاتورة للتصحيح
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVED / AUDIT HISTORY */}
      {resolvedHolds.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>سجل الحجوزات السابقة التي تم تسويتها (Resolved Holds Audit Trail)</span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-4 font-medium">رقم الفاتورة</th>
                  <th className="py-2.5 px-4 font-medium">نوع الحجز</th>
                  <th className="py-2.5 px-4 font-medium">مبررات فك الحجز المعتمدة</th>
                  <th className="py-2.5 px-4 font-medium">تاريخ التسوية</th>
                  <th className="py-2.5 px-4 font-medium">معتمد التسوية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {resolvedHolds.map(({ invoice, hold }) => (
                  <tr key={hold.id} className="text-slate-400">
                    <td className="py-2.5 px-4 font-mono">{invoice.invoiceNumber}</td>
                    <td className="py-2.5 px-4 font-mono">{hold.holdType}</td>
                    <td className="py-2.5 px-4 text-slate-300">{hold.resolutionJustificationAr}</td>
                    <td className="py-2.5 px-4 font-mono">{hold.resolvedAt}</td>
                    <td className="py-2.5 px-4">{hold.resolvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
