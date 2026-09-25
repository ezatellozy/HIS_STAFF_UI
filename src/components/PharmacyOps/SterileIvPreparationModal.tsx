import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  FlaskConical,
  Clock,
  Printer,
  FileText,
  UserCheck,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { CompoundingWorksheet, MedicationOrderContext } from '../../types/pharmacyOps';

interface SterileIvPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksheet: CompoundingWorksheet | null;
  order?: MedicationOrderContext | null;
  onSignoffTechnician: (worksheetId: string) => void;
  onSignoffPharmacistCheck: (worksheetId: string) => void;
  onOpenLabelPreview: (worksheet: CompoundingWorksheet) => void;
}

export const SterileIvPreparationModal: React.FC<SterileIvPreparationModalProps> = ({
  isOpen,
  onClose,
  worksheet,
  order,
  onSignoffTechnician,
  onSignoffPharmacistCheck,
  onOpenLabelPreview
}) => {
  const [techSigned, setTechSigned] = useState(!!worksheet?.preparedByTechnician);
  const [pharmacistSigned, setPharmacistSigned] = useState(!!worksheet?.finalCheckedByPharmacist);

  if (!isOpen || !worksheet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">ورقة تحضير المحاليل المعقمة (Sterile IV Compounding Worksheet)</h3>
                <span className="font-mono text-xs text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  {worksheet.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  كابينة التدفق الصفحي Cleanroom Hood 02
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                توثيق المعايير المعقمة، المكونات، الحجم النهائي، وفترة الصلاحية بعد التحضير (BUD)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Policy Notice */}
        <div className="bg-teal-50 border-b border-teal-200 px-6 py-2 text-xs text-teal-950 flex items-center justify-between">
          <span>تحضير معقم وفق سياسة التدقيق المعتمدة للمنتج والمنشأة (Configured Sterile Preparation Verification Model).</span>
          <span className="font-mono text-[11px] font-bold text-teal-800">Cleanroom ISO Class 5 / 7</span>
        </div>

        {/* Scrollable Worksheet Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Patient & Drug Target Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">{worksheet.patientName}</span>
                <span className="font-mono text-xs text-teal-700 bg-teal-100 px-2 py-0.5 rounded mr-2 font-bold">{worksheet.mrn}</span>
              </div>
              <span className="font-mono text-xs text-slate-500">Order Ref: {worksheet.orderId}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80 text-[11px]">
              <div>
                <span className="text-slate-500 block">المستحضر الأساسي:</span>
                <span className="font-bold text-slate-900 text-xs">{worksheet.primaryDrug}</span>
              </div>
              <div>
                <span className="text-slate-500 block">المحلول المخفف (Diluent):</span>
                <span className="font-bold text-slate-900 text-xs">{worksheet.diluentName} ({worksheet.diluentVolume})</span>
              </div>
              <div>
                <span className="text-slate-500 block">التركيز والحجم النهائي:</span>
                <span className="font-bold text-slate-900 text-xs">{worksheet.finalConcentration} • {worksheet.finalVolume}</span>
              </div>
              <div>
                <span className="text-slate-500 block">صلاحية ما بعد التحضير (Mock Illustrative BUD):</span>
                <span className="font-bold text-rose-700 text-xs">{worksheet.beyondUseDate}</span>
                <span className="block text-[9px] text-slate-500">مثال استرشادي توضيحي محاكى</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-700 bg-amber-50/90 p-2.5 rounded-lg border border-amber-200 space-y-1">
              <strong className="text-amber-950 block">محددات صلاحية ما بعد التحضير (USP &lt;797&gt; Mock Reference Limitations):</strong>
              <p className="leading-relaxed text-amber-900">
                1. القيمة المعروضة أعلاه (24 ساعة) هي <strong>مثال توضيحي استرشادي محاكى فقط (Illustrative Example Only)</strong> وليست ناتج محرك احتساب معتمد.<br />
                2. <strong>التبريد بمفرده (Refrigeration alone)</strong> لا يؤسس صلاحية نظامية سارية المفعول.<br />
                3. يتطلب الاعتماد الفعلي للصلاحية التحقق المتخصص من <strong>الثبات الكيميائي والميكروبيولوجي الخاص بتركيبة المستحضر وظروف التعقيم (Formulation-specific chemical and microbiological stability verification)</strong>.<br />
                4. لا يقدم النموذج الأولي هذا الحقل كحساب معياري شامل متوافق مع USP &lt;797&gt;.
              </p>
            </div>
          </div>

          {/* Compounding Ingredients Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>المكونات والمقادير الفعلية (Formula Ingredients & Lots)</span>
              </span>
              <span className="text-[11px] text-slate-500">تم وزن ومعايرة المحلول تحت التدفق الصفحي</span>
            </div>
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <th className="py-2 px-3">المكون (Drug / Vehicle)</th>
                  <th className="py-2 px-3">الكمية المقررة</th>
                  <th className="py-2 px-3">الكمية المقاسة</th>
                  <th className="py-2 px-3">رقم التشغيلة (Lot)</th>
                  <th className="py-2 px-3">الصلاحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {worksheet.ingredients.map((ing, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{ing.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{ing.orderedAmount}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{ing.actualMeasuredAmount || ing.orderedAmount}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{ing.lotNumber || 'LT-2026-X'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{ing.expiryDate || '12/2027'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cleanroom Compounding Instructions & Storage */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-[11px] text-amber-950">
            <span className="font-bold block">تعليمات التحضير المعقم وشروط الحفظ:</span>
            <p className="leading-relaxed">{worksheet.instructions}</p>
            <div className="pt-1 text-[10px] text-amber-900 font-medium">
              شروط التخزين: {worksheet.storageConditions === 'refrigerated_2_8' ? 'حفظ في الثلاجة (2 إلى 8 درجات مئوية)' : 'درجة حرارة الغرفة (15-25 مئوية)'} • تجنب التعرض المباشر للضوء.
            </div>
          </div>

          {/* Double Check Verification Sign-off Section (ISMP Best Practice 19) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>التوثيق المزدوج المستقل وفق ممارسات الأمان (ISMP Best Practice 19):</span>
              </h4>
              <span className="text-[10px] text-slate-600 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                تفاعل تجريبي للنموذج الأولي — لا يمثل توثيقاً بيومترياً أو كلمة مرور (Prototype interaction only)
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              وفق توصيات معهد ممارسات الدواء الآمن (ISMP Best Practice 19)، يقتضي التوثيق المزدوج المستقل قيام ممارسين اثنين بفحص مستقل للمقادير والعمليات الحسابية ومطابقة الملصق والمكونات، دون أن يؤثر أحدهما مسبقاً على حكم الآخر. النقر هنا يمثل محاكاة لأدوار النظام ولا يدعي تنفيذ هوية رقمية أو توقيع إلكتروني حقيقي.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Technician Signoff */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">1. اكتمال التحضير والفحص التقني (Preparation Completed):</span>
                  {techSigned ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>اكتمال التحضير المعقم</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      بانتظار توثيق الفني
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  الموثق: {worksheet.preparedByTechnician || 'ماجد الشريف (فني تحضير معقم)'}
                </div>
                {!techSigned && (
                  <button
                    onClick={() => {
                      setTechSigned(true);
                      onSignoffTechnician(worksheet.id);
                    }}
                    className="w-full py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    محاكاة توثيق التحضير الفني (Sign Preparation Completed)
                  </button>
                )}
              </div>

              {/* Pharmacist Check Signoff */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">2. التدقيق الصيدلاني المستقل (Independent Pharmacist Check):</span>
                  {pharmacistSigned ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>مكتمل ومعتمد نهائياً</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      بانتظار تدقيق الصيدلي
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  الموثق: {worksheet.finalCheckedByPharmacist || 'د. ليلى عبد الحميد (صيدلي إكلينيكي فاحص)'}
                </div>
                {!pharmacistSigned && (
                  <button
                    disabled={!techSigned}
                    onClick={() => {
                      setPharmacistSigned(true);
                      onSignoffPharmacistCheck(worksheet.id);
                    }}
                    className={`w-full py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                      techSigned
                        ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    محاكاة تدقيق الصيدلي المزدوج (Sign Independent Check)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onOpenLabelPreview(worksheet)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 border border-teal-300 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>معاينة ملصق المحلول المعقم (IV Bag Label)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            إغلاق ورقة التحضير
          </button>
        </div>
      </div>
    </div>
  );
};
