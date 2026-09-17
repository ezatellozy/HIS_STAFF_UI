import React from 'react';
import { X, Printer, CheckCircle2, Building2, CreditCard, Ticket, ShieldCheck, User } from 'lucide-react';
import { BillingTransaction, Patient, Appointment, Clinic } from '../../types/his';
import { EdinaLogo } from '../common/EdinaLogo';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BillingTransaction | null;
  appointment?: Appointment | null;
  patient?: Patient | null;
  clinic?: Clinic | null;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  appointment,
  patient,
  clinic
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabels: Record<BillingTransaction['paymentMethod'], string> = {
    mada: 'مدى (Mada Debit Card)',
    visa: 'بطاقة ائتمان (Visa / MasterCard)',
    cash: 'نقداً بالخزينة (Cash)',
    apple_pay: 'Apple Pay / المحفظة الرقمية',
    insurance_direct: 'تغطية تأمينية مباشرة 100% (Direct Approval)'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <EdinaLogo variant="mark-only" size="xs" theme="dark" />
            <h3 className="font-bold text-sm sm:text-base">إيصال المعاملة المالية وتذكرة الانتظار</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 space-y-5 bg-white text-slate-900 text-xs">
          {/* Hospital Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <div className="flex flex-col items-center justify-center mb-1">
              <EdinaLogo variant="full" size="md" theme="light" />
              <div className="text-xs font-bold text-slate-800 mt-1">مستشفيات إدينا التخصصية • منظومة الفوترة والقبول الموحدة</div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Edina Specialized Hospitals • Revenue Cycle & Admissions</p>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 mt-1 font-mono">
              <span>س.ت: 101089201</span>
              <span>•</span>
              <span>الرقم الضريبي: 300481920100003</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">معتمد CBAHI & NPHIES</span>
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">رقم سند القبض (Receipt No):</span>
              <strong className="font-mono text-slate-900 text-sm">{transaction.receiptNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">رقم المعاملة (Txn ID):</span>
              <strong className="font-mono text-teal-800 text-sm">{transaction.id}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">التاريخ والوقت:</span>
              <span className="font-mono text-slate-800">{transaction.timestamp}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">أمين الصندوق / الكاونتر:</span>
              <span className="text-slate-800 font-semibold">{transaction.cashierName}</span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
              <div>
                <span className="text-[10px] text-slate-500 block">اسم المريض</span>
                <strong className="text-sm text-slate-900">{transaction.patientName}</strong>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-500 block">رقم الملف (MRN)</span>
                <strong className="text-xs font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {transaction.mrn}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">العيادة المستهدفة:</span>{' '}
                <strong className="text-slate-800">{transaction.clinicName}</strong>
              </div>
              <div>
                <span className="text-slate-500">الطبيب المعالج:</span>{' '}
                <strong className="text-slate-800">{transaction.doctorName}</strong>
              </div>
              {patient && (
                <div>
                  <span className="text-slate-500">التأمين / الفئة:</span>{' '}
                  <span className="text-slate-800 font-medium">
                    {patient.insuranceProvider} ({patient.insuranceClass})
                  </span>
                </div>
              )}
              {transaction.nphiesClaimRef && (
                <div>
                  <span className="text-slate-500">مرجع نفيس (NPHIES):</span>{' '}
                  <span className="font-mono text-blue-700 font-bold">{transaction.nphiesClaimRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-right">البيان السريري / الخدمة</th>
                  <th className="p-2.5 text-center">القيمة الإجمالية</th>
                  <th className="p-2.5 text-center">تحمل التأمين</th>
                  <th className="p-2.5 text-left">المسدد من المريض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5">
                    <div className="font-bold text-slate-900">كشف واستشارة عيادة خارجية (OPD Consultation)</div>
                    <div className="text-[10px] text-slate-500">شامل الفرز الأولي والتسجيل بالنظام السريري</div>
                  </td>
                  <td className="p-2.5 text-center font-mono font-semibold">{transaction.consultationFee} ج.م</td>
                  <td className="p-2.5 text-center font-mono text-blue-700">-{transaction.insuranceDiscount} ج.م</td>
                  <td className="p-2.5 text-left font-mono font-bold text-emerald-700">
                    {transaction.patientCoPay} ج.م
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-teal-50/70 border-t border-teal-200 font-bold">
                <tr>
                  <td colSpan={3} className="p-2.5 text-slate-800 font-bold">
                    إجمالي المبلغ المحصل من المريض (المعاملة):
                  </td>
                  <td className="p-2.5 text-left font-mono font-extrabold text-teal-900 text-sm">
                    {transaction.patientCoPay} ج.م
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Method Details */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-700" />
              <span>
                طريقة السداد:{' '}
                <strong className="text-slate-900">{paymentMethodLabels[transaction.paymentMethod]}</strong>
              </span>
            </div>
            <div className="font-mono text-slate-600">
              المرجع: <strong className="text-slate-800">{transaction.paymentReference}</strong>
            </div>
          </div>

          {/* Live Queue Ticket Box */}
          <div className="border-2 border-dashed border-teal-500 bg-teal-50/50 p-4 rounded-2xl text-center space-y-1">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
              تذكرة صالة الانتظار وبدء الفرز
            </span>
            <div className="text-3xl font-black font-mono text-teal-900 tracking-wider">
              {appointment?.ticketNo || 'TICKET'}
            </div>
            <p className="text-[11px] text-slate-600">
              يرجى التوجه إلى <strong className="text-slate-900">{clinic?.roomNo || transaction.clinicName}</strong>
            </p>
            <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>تم تسجيل الوصول والسداد • جاهز للنداء والفرز التمريضي</span>
            </div>
          </div>

          {/* Legal / Security Footer */}
          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            فاتورة إلكترونية صادرة ومعتمدة آلياً طبقاً للمواصفات الصحية والضريبية. احتفظ بهذه القسيمة لحين استدعاء
            رقمك.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق ومتابعة الطابور
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الإيصال وتذكرة الطابور</span>
          </button>
        </div>
      </div>
    </div>
  );
};
