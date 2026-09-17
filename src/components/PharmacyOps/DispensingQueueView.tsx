import React from 'react';
import {
  PackageCheck,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  Barcode,
  Truck,
  Building2,
  Layers
} from 'lucide-react';
import { DispenseRecord, MedicationOrderContext } from '../../types/pharmacyOps';

interface DispensingQueueViewProps {
  dispenseRecords: DispenseRecord[];
  onConfirmHandoff: (dispenseId: string, collectedBy: string) => void;
  onOpenLabelPreviewForDispense: (dispense: DispenseRecord) => void;
}

export const DispensingQueueView: React.FC<DispensingQueueViewProps> = ({
  dispenseRecords,
  onConfirmHandoff,
  onOpenLabelPreviewForDispense
}) => {
  return (
    <div className="space-y-4 text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">طابور الصرف والتحضير النهائي (Dispensing Queue & Workspace)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700">
                Dispensed ≠ Administered
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              متابعة صرف العبوات المفحوصة، التوريد الجزئي، وتوجيهها لوجهات التسليم بالأجنحة
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300">
          إجمالي السجلات المصروفة اليوم: <strong className="text-white font-mono text-sm">{dispenseRecords.length}</strong>
        </div>
      </div>

      {/* Semantic Distinction Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
        <span className="leading-relaxed">
          <strong>ملاحظة نموذج الصرف:</strong> صرف المستحضر من الصيدلية (Dispensed) يعني خروجه الفعلي من عهدة الصيدلية وتوجيهه نحو عربة الجناح أو نافذة الاستلام؛ تسجيل إعطاء الدواء للمريض (Administered) يظل مسؤولية التمريض حصراً في eMAR.
        </span>
      </div>

      {/* Dispense Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
              <th className="py-3 px-3.5">كود الصرف / الطلب</th>
              <th className="py-3 px-3.5">المريض والموقع</th>
              <th className="py-3 px-3.5">المستحضر والشكل الدوائي</th>
              <th className="py-3 px-3.5">الكمية المصروفة</th>
              <th className="py-3 px-3.5">بيانات التشغيلة / الصيدلي</th>
              <th className="py-3 px-3.5">وجهة التسليم</th>
              <th className="py-3 px-3.5">حالة التسليم (Handoff)</th>
              <th className="py-3 px-3.5 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dispenseRecords.map(record => (
              <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3.5">
                  <div className="font-mono font-bold text-slate-900 text-[11px]">{record.id}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Ref: {record.orderId}</div>
                </td>

                <td className="py-3 px-3.5">
                  <div className="font-bold text-slate-900">{record.patientName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{record.mrn}</div>
                </td>

                <td className="py-3 px-3.5">
                  <div className="font-bold text-slate-900 text-xs">{record.medicationName}</div>
                  <div className="text-[10px] text-slate-500">{record.dosageForm} • {record.route}</div>
                </td>

                <td className="py-3 px-3.5">
                  <div className="font-bold text-slate-900 text-xs">
                    {record.dispensedQuantity} من {record.orderedQuantity}
                  </div>
                  {record.isPartialDispense && (
                    <div className="mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        صرف جزئي (متبقي {record.remainingQuantity})
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        استكمال التوريد: {record.nextSupplyDueTime || 'غداً'}
                      </p>
                    </div>
                  )}
                </td>

                <td className="py-3 px-3.5 text-[11px]">
                  <div>تشغيلة: <span className="font-mono font-bold text-slate-700">{record.batchLot}</span></div>
                  <div>الصيدلي: <span className="text-slate-600">{record.dispensedBy}</span></div>
                  <div className="text-[10px] text-slate-400">{record.dispensedAt}</div>
                </td>

                <td className="py-3 px-3.5 text-[11px]">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" />
                    <span>{record.destinationLocation}</span>
                  </div>
                </td>

                <td className="py-3 px-3.5">
                  {record.handoffStatus === 'collected_handoff_complete' ? (
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>تم الاستلام بالكامل</span>
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        المستلم: {record.collectedBy}
                      </div>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                      بانتظار الاستلام بالجناح
                    </span>
                  )}
                </td>

                <td className="py-3 px-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onOpenLabelPreviewForDispense(record)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      title="معاينة ملصق الصرف"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {record.handoffStatus !== 'collected_handoff_complete' && (
                      <button
                        onClick={() => onConfirmHandoff(record.id, 'ممرضة الجناح المناوبة')}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>توثيق التسليم</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
