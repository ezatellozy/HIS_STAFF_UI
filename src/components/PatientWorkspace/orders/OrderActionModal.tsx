import React, { useState } from 'react';
import { AlertTriangle, PauseCircle, XCircle, PlayCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { ClinicalOrderItem } from '../../../types/clinicalOrdersRequests';
import { DEFAULT_ORDER_ACTION_POLICIES } from '../../../data/mockOrdersRequestsData';
import { useHis } from '../../../context/HisContext';
import { ClinicalActionDialog } from '../common/ClinicalActionDialog';

interface OrderActionModalProps {
  order: ClinicalOrderItem;
  action: 'discontinue' | 'hold' | 'resume';
  onClose: () => void;
  onConfirm: (orderId: string, action: 'discontinue' | 'hold' | 'resume', reason: string) => void;
}

export const OrderActionModal: React.FC<OrderActionModalProps> = ({
  order,
  action,
  onClose,
  onConfirm
}) => {
  const { currentStaff, playChime } = useHis();
  const [reason, setReason] = useState('');
  const [authorizedConfirmation, setAuthorizedConfirmation] = useState(false);
  const [safetyDialog, setSafetyDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const policy = DEFAULT_ORDER_ACTION_POLICIES[action] || {
    action,
    isReasonRequired: false,
    isConfirmationRequired: true,
    additionalAuthorizationRequired: false,
    authorizedRoles: ['authorized_clinician']
  };

  const getActionConfig = () => {
    switch (action) {
      case 'discontinue':
        return {
          title: 'إيقاف الأمر السريري (Discontinue Order)',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          buttonLabel: 'تأكيد الإيقاف',
          buttonClass: 'bg-red-600 hover:bg-red-700',
          placeholder: 'مثال: تحسن الأعراض، ظهور أثر جانبي، تغيير الخطة العلاجية...',
          color: 'red'
        };
      case 'hold':
        return {
          title: 'تعليق الأمر السريري مؤقتاً (Hold Order)',
          icon: <PauseCircle className="w-5 h-5 text-amber-600" />,
          buttonLabel: 'تأكيد التعليق المؤقت',
          buttonClass: 'bg-amber-600 hover:bg-amber-700',
          placeholder: 'مثال: انتظار نتيجة تحليل، صيام قبل إجراء، مراقبة ضغط...',
          color: 'amber'
        };
      case 'resume':
        return {
          title: 'استئناف الأمر السريري (Resume Order)',
          icon: <PlayCircle className="w-5 h-5 text-emerald-600" />,
          buttonLabel: 'تأكيد استئناف الأمر',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
          placeholder: 'مثال: انتهاء الإجراء وعودة المريض، استقرار القراءات (اختياري)...',
          color: 'emerald'
        };
    }
  };

  const config = getActionConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (policy.isReasonRequired && !reason.trim()) {
      setSafetyDialog({
        isOpen: true,
        title: 'متطلب توثيق سريري إلزامي',
        message: 'تتطلب سياسة المستشفى إدخال سبب سريري موثق لتنفيذ هذا الإجراء على أمر المريض.'
      });
      return;
    }

    if (policy.additionalAuthorizationRequired && !authorizedConfirmation) {
      setSafetyDialog({
        isOpen: true,
        title: 'متطلب تأكيد الصلاحية السريرية',
        message: 'يتطلب هذا الإجراء تأكيد الصلاحية السريرية الإشرافية المعتمدة قبل التنفيذ.'
      });
      return;
    }

    onConfirm(order.id, action, reason.trim() || 'تم الإجراء وفق البروتوكول السريري المعتمد');
    playChime(action === 'discontinue' ? 'alert' : 'chime');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {config.icon}
            <h3 className="font-extrabold text-slate-900 text-sm">{config.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer">
            ✕
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <strong>الأمر المستهدف:</strong> {order.orderTitleAr}
          <div className="text-[11px] text-slate-500 mt-0.5">
            رقم الأمر: {order.id} • الفئة: {order.category}
          </div>
        </div>

        {/* Action Policy & Authorization Context */}
        <div className="p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>سياسة الإجراء السريري (Action Policy):</span>
            </span>
            <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {policy.isReasonRequired ? 'Reason Required' : 'Reason Optional'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            الممارس المنفذ: <strong className="text-slate-700">{currentStaff.name}</strong> ({currentStaff.title || 'ممارس سريري مفوض Authorized Clinician'})
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              السبب السريري الموثق لاتخاذ الإجراء:
              {policy.isReasonRequired ? (
                <span className="text-red-500 mr-1">* (إلزامي حسب السياسة)</span>
              ) : (
                <span className="text-slate-400 mr-1 font-normal">(اختياري حسب سياسة الإجراء)</span>
              )}
            </label>
            <textarea
              rows={3}
              required={policy.isReasonRequired}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={config.placeholder}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
            />
          </div>

          {policy.additionalAuthorizationRequired && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="auth-check"
                checked={authorizedConfirmation}
                onChange={e => setAuthorizedConfirmation(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600"
              />
              <label htmlFor="auth-check" className="text-[11px] font-bold text-amber-900">
                أؤكد امتلاك الصلاحية السريرية المعتمدة لتنفيذ هذا التعديل.
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              تراجع
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs cursor-pointer ${config.buttonClass}`}
            >
              {config.buttonLabel}
            </button>
          </div>
        </form>
      </div>

      <ClinicalActionDialog
        isOpen={safetyDialog.isOpen}
        onClose={() => setSafetyDialog(prev => ({ ...prev, isOpen: false }))}
        title={safetyDialog.title}
        message={safetyDialog.message}
        severity="warning"
      />
    </div>
  );
};
