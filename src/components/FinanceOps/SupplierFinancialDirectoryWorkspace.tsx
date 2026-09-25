import React, { useState } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  CreditCard
} from 'lucide-react';
import { SupplierFinancialOverlay } from '../../types/accountsPayable';
import { mockSupplierMasters } from '../../data/mockProcurementOpsData';

interface SupplierFinancialDirectoryWorkspaceProps {
  overlays: SupplierFinancialOverlay[];
  onUpdateOverlay: (updated: SupplierFinancialOverlay) => void;
  activePersona: string;
}

export const SupplierFinancialDirectoryWorkspace: React.FC<SupplierFinancialDirectoryWorkspaceProps> = ({
  overlays,
  onUpdateOverlay,
  activePersona
}) => {
  const [selectedOverlay, setSelectedOverlay] = useState<SupplierFinancialOverlay | null>(null);
  const [isEditingIban, setIsEditingIban] = useState(false);
  const [newIban, setNewIban] = useState('');
  const [changeReason, setChangeReason] = useState('');

  const handleStartEditIban = (overlay: SupplierFinancialOverlay) => {
    setSelectedOverlay(overlay);
    setNewIban(overlay.syntheticIbanMasked);
    setChangeReason('');
    setIsEditingIban(true);
  };

  const handleSaveIban = () => {
    if (!selectedOverlay || !newIban.trim()) return;

    // SCENARIO AP25: Changing beneficiary bank details places an immediate AP PAYMENT HOLD
    const updated: SupplierFinancialOverlay = {
      ...selectedOverlay,
      syntheticIbanMasked: newIban.trim(),
      beneficiaryVerificationStatus: 'bank_change_pending_review',
      apPaymentHoldActive: true,
      paymentHoldReason: 'تغيير الحساب البنكي / الآيبان يتطلب إعادة توثيق ثنائي واعتماد الخزينة قبل استئناف الصرف المالي (AP25).',
      pendingBankChangeDetails: {
        requestedIbanMasked: newIban.trim(),
        requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        requestedBy: 'محاسب الحسابات الدائنة (AP Clerk)',
        changeReasonAr: changeReason.trim() || 'تحديث بيانات الحساب البنكي بناء على خطاب المورد الرسمي.'
      }
    };

    onUpdateOverlay(updated);
    setSelectedOverlay(updated);
    setIsEditingIban(false);
  };

  const handleVerifyBankDualControl = (overlay: SupplierFinancialOverlay) => {
    const updated: SupplierFinancialOverlay = {
      ...overlay,
      beneficiaryVerificationStatus: 'verified_active',
      apPaymentHoldActive: false,
      paymentHoldReason: undefined,
      pendingBankChangeDetails: undefined
    };

    onUpdateOverlay(updated);
    setSelectedOverlay(updated);
  };

  return (
    <div id="supplier-financial-directory-workspace" className="space-y-5">
      
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">دليل الحسابات المالية للموردين (Supplier Financial Directory)</h3>
            <p className="text-xs text-slate-400">
              إدارة الآيبان البنكي، التحقق الثنائي للمستفيدين، وضوابط حظر الصرف التلقائي عند تعديل الحسابات (AP25)
            </p>
          </div>
        </div>
      </div>

      {/* SUPPLIER FINANCIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {overlays.map(overlay => {
          const supplierMaster = mockSupplierMasters.find(s => s.id === overlay.supplierId);
          const isVerified = overlay.beneficiaryVerificationStatus === 'verified_active';

          return (
            <div key={overlay.supplierId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{supplierMaster?.legalNameAr || 'مورد مسجل'}</h4>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{supplierMaster?.legalNameEn}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isVerified
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {isVerified ? 'حساب موثق ونشط' : 'قيد التحقق الثنائي (محظور)'}
                </span>
              </div>

              {/* Financial Fields */}
              <div className="bg-slate-800/50 p-3.5 rounded-lg border border-slate-700/60 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>اسم المستفيد البنكي:</span>
                  <span className="text-slate-200 font-medium">{overlay.beneficiaryAccountName}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>رقم الآيبان (IBAN):</span>
                  <span className="font-mono text-slate-200 font-bold" dir="ltr">{overlay.syntheticIbanMasked}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>الرقم الضريبي للمورد:</span>
                  <span className="font-mono text-slate-300" dir="ltr">{supplierMaster?.taxRegistrationNumber || '300981245000003'}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>شروط الدفع المعتمدة:</span>
                  <span className="font-mono text-indigo-300 font-bold">{overlay.paymentTermsCode}</span>
                </div>

                {overlay.apPaymentHoldActive && (
                  <div className="mt-2 p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] flex items-start gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">حظر صرف مالي نشط:</strong>
                      <span>{overlay.paymentHoldReason}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions: Edit IBAN / Verify */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={() => handleStartEditIban(overlay)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  تعديل الحساب البنكي
                </button>

                {!isVerified && (
                  <button
                    onClick={() => handleVerifyBankDualControl(overlay)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>توثيق الحساب وفك الحظر (Dual Verify)</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* EDIT IBAN MODAL (SCENARIO AP25 TEST) */}
      {isEditingIban && selectedOverlay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>تعديل الحساب البنكي للمورد</span>
              </h3>
              <button onClick={() => setIsEditingIban(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                تنبيه نظامي (AP25): تعديل الآيبان أو البنك يفرض حظراً تلقائياً على صرف مدفوعات هذا المورد لحين استكمال التوثيق الثنائي.
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">رقم الآيبان الجديد (IBAN):</label>
                <input
                  type="text"
                  value={newIban}
                  onChange={(e) => setNewIban(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 font-mono font-bold p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سبب التعديل أو رقم الخطاب المرفق:</label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="مثال: خطاب تفويض المورد المؤرخ في 2026-09-21"
                  className="w-full bg-slate-800 text-slate-200 p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditingIban(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveIban}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                حفظ وفرض حظر الصرف (AP25)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
