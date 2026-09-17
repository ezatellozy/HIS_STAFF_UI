import React, { useState } from 'react';
import {
  RotateCcw,
  Clock,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  User,
  Droplet,
  X
} from 'lucide-react';
import { ProductReturnRecord, ProductDispositionOutcome, ReturnReason } from '../../types/bloodBankOps';

interface ProductReturnsViewProps {
  returns: ProductReturnRecord[];
  onConfirmNewDisposition: (newReturn: ProductReturnRecord) => void;
}

export const ProductReturnsView: React.FC<ProductReturnsViewProps> = ({
  returns,
  onConfirmNewDisposition
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  // New return form state
  const [unitNumber, setUnitNumber] = useState('=W0422 26 10947 00');
  const [patientMrn, setPatientMrn] = useState('MRN-88425');
  const [returnedByStaff, setReturnedByStaff] = useState('ممرض العمليات تركي الدوسري');
  const [reason, setReason] = useState<ReturnReason>('transfusion_delayed_procedure');
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(20);
  const [bagIntegrityChecked, setBagIntegrityChecked] = useState(true);
  const [portNotPunctured, setPortNotPunctured] = useState(true);
  const [temperatureIndicatorOk, setTemperatureIndicatorOk] = useState(true);
  const [dispositionOutcome, setDispositionOutcome] = useState<ProductDispositionOutcome>('returned_to_available_inventory');
  const [dispositionNotes, setDispositionNotes] = useState('تم فحص سلامة كيس الدم وعدم فتح المنافذ وثبات درجة الحرارة أقل من 6°C ضمن فترة الـ 30 دقيقة المعتمدة.');

  const filteredReturns = returns.filter(r =>
    r.unitNumber.includes(searchTerm) ||
    r.patientMrn.includes(searchTerm) ||
    r.id.includes(searchTerm)
  );

  const handleSaveIntake = () => {
    const newRecord: ProductReturnRecord = {
      id: `RET-2026-${Math.floor(100 + Math.random() * 900)}`,
      unitId: 'DIN-RET-TEMP',
      unitNumber,
      patientId: 'p5',
      patientMrn,
      issuedAt: 'أمس 02:30 م',
      returnedAt: 'الآن',
      elapsedMinutesOutsideFridge: elapsedMinutes,
      returnedByStaff,
      receivedByTechnologist: 'أخصائي مختبر بدر العتيبي',
      reason,
      bagIntegrityChecked,
      portNotPunctured,
      temperatureIndicatorOk,
      dispositionOutcome,
      dispositionNotes,
      dispositionAuthorizer: 'د. سامية المهيدب (استشارية بنك الدم)'
    };
    onConfirmNewDisposition(newRecord);
    setShowIntakeModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">سجل استلام العائدات وتقرير المصير (Product Returns & Disposition)</h2>
              <p className="text-xs text-slate-500">
                تدقيق سلامة مؤشرات سلسلة التبريد وقاعدة الـ 30 دقيقة وقرار إعادة المخزون أو الإتلاف (Disposition Context)
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
                placeholder="بحث برقم الوحدة أو الملف..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-52 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowIntakeModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استلام وحدة معادة جديدة</span>
            </button>
          </div>
        </div>

        {/* Policy Guidance Notice */}
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/70 flex items-center justify-between text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              سياسة إرجاع مشتقات الدم: لا تُعاد الوحدة للمخزون الصالح إلا إذا لم تُفتح منافذ الكيس، وكان مؤشر التبريد سالماً، ولم تتجاوز 30 دقيقة خارج الثلاجة المعتمدة.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
            Cold Chain Policy
          </span>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">كود الإرجاع والوحدة</th>
                <th className="p-3.5">المريض المستهدف</th>
                <th className="p-3.5">سبب الإرجاع</th>
                <th className="p-3.5">الوقت خارج الثلاجة</th>
                <th className="p-3.5">فحص السلامة والمؤشرات</th>
                <th className="p-3.5">القرار النهائي للمصير (Disposition)</th>
                <th className="p-3.5">المعتمد وملاحظات التدقيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReturns.map(ret => (
                <tr key={ret.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-slate-900">{ret.id}</div>
                    <div className="font-mono text-[11px] text-red-700 font-bold mt-0.5">{ret.unitNumber}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-mono text-slate-700 font-bold">{ret.patientMrn}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">أعيد بواسطة: {ret.returnedByStaff}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium">
                      {ret.reason === 'transfusion_delayed_procedure' ? 'تأجيل العملية الجراحية' :
                       ret.reason === 'patient_condition_stabilized' ? 'استقرار حالة المريض' :
                       ret.reason === 'suspected_adverse_reaction' ? 'اشتباه تفاعل نقل دم' : ret.reason}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`font-mono font-bold ${
                        ret.elapsedMinutesOutsideFridge <= 30 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {ret.elapsedMinutesOutsideFridge} دقيقة
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {ret.elapsedMinutesOutsideFridge <= 30 ? 'ضمن الحد المسموح (≤30 min)' : 'تجاوزت الحد المسموح'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>الكيس سليم وغير مثقوب</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مؤشر التبريد سليم (&lt;6°C)</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      ret.dispositionOutcome === 'returned_to_available_inventory'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ret.dispositionOutcome === 'discarded_biohazard_waste'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {ret.dispositionOutcome === 'returned_to_available_inventory' ? 'مقبول: أعيد للمخزون الصالح' :
                       ret.dispositionOutcome === 'discarded_biohazard_waste' ? 'مرفوض: إتلاف نفايات طبية' :
                       'محجوز للتحقيق المخبري'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="text-[11px] text-slate-700 font-medium max-w-xs leading-relaxed">
                      {ret.dispositionNotes}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      المصادقة: <strong>{ret.dispositionAuthorizer}</strong>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold">نموذج استلام وفحص وحدة معادة (Returned Product Intake)</h3>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم الوحدة (DIN):</label>
                  <input
                    type="text"
                    value={unitNumber}
                    onChange={e => setUnitNumber(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرقم الطبي للمريض (MRN):</label>
                  <input
                    type="text"
                    value={patientMrn}
                    onChange={e => setPatientMrn(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الموظف المعيد وقسمه:</label>
                  <input
                    type="text"
                    value={returnedByStaff}
                    onChange={e => setReturnedByStaff(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سبب الإرجاع:</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="transfusion_delayed_procedure">تأجيل العملية الجراحية / الإجراء</option>
                    <option value="patient_condition_stabilized">استقرار حالة المريض وعدم الحاجة للوحدة</option>
                    <option value="transfusion_cancelled">إلغاء أمر نقل الدم سريرياً</option>
                    <option value="suspected_adverse_reaction">اشتباه تفاعل نقل دم أثناء البدء</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المدة المنقضية خارج الثلاجة (بالدقائق):</label>
                <input
                  type="number"
                  value={elapsedMinutes}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setElapsedMinutes(val);
                    if (val > 30) {
                      setDispositionOutcome('discarded_biohazard_waste');
                      setDispositionNotes('تجاوزت الوحدة فترة الـ 30 دقيقة خارج الثلاجة المراقبة؛ لا تجوز إعادتها للمخزون الصالح حسب السياسة ويجب إتلافها.');
                    } else {
                      setDispositionOutcome('returned_to_available_inventory');
                      setDispositionNotes('الوحدة ضمن فترة الـ 30 دقيقة والمؤشر سليم؛ صالحة للعودة للمخزون.');
                    }
                  }}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">سلامة الكيس وعدم وجود أي ثقوب أو تسريب:</span>
                  <input
                    type="checkbox"
                    checked={bagIntegrityChecked}
                    onChange={e => setBagIntegrityChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">منافذ الكيس (Ports) مغلقة ولم يتم ثقبها بإبرة نقل الدم:</span>
                  <input
                    type="checkbox"
                    checked={portNotPunctured}
                    onChange={e => setPortNotPunctured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">مؤشر الحرارة التراكمي (Safe-T-Vue) لم يتغير لونه (أقل من 6°C):</span>
                  <input
                    type="checkbox"
                    checked={temperatureIndicatorOk}
                    onChange={e => setTemperatureIndicatorOk(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">القرار الفني لمصير الوحدة (Disposition):</label>
                <select
                  value={dispositionOutcome}
                  onChange={e => setDispositionOutcome(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="returned_to_available_inventory">إعادة للمخزون الصالح للاستخدام</option>
                  <option value="discarded_biohazard_waste">إتلاف ونفايات طبية حيوية (Biohazard Waste)</option>
                  <option value="quarantined_for_inspection">عزل لفحص إضافي</option>
                  <option value="retained_for_reaction_investigation">حجز للتحقيق في تفاعل نقل الدم</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات ومبررات القرار:</label>
                <textarea
                  rows={2}
                  value={dispositionNotes}
                  onChange={e => setDispositionNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowIntakeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveIntake}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs"
              >
                حفظ واعتماد المصير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
