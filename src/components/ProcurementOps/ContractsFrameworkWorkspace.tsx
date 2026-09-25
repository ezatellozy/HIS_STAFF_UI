import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Layers, 
  Tag, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { FrameworkAgreement } from '../../types/procurementOps';

interface ContractsFrameworkWorkspaceProps {
  agreements: FrameworkAgreement[];
  activeRole: string;
}

export const ContractsFrameworkWorkspace: React.FC<ContractsFrameworkWorkspaceProps> = ({
  agreements,
  activeRole
}) => {
  const [selectedAgrId, setSelectedAgrId] = useState<string>(agreements[0]?.id || '');
  const selectedAgr = agreements.find(a => a.id === selectedAgrId);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>العقود والاتفاقيات الإطارية (Contracts & Framework Agreements)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة اتفاقيات الشراء الموحد (نوبكو)، متابعة سقف العقد والمبالغ المستهلكة، وقوائم الأسعار المعتمدة مسبقاً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            الاتفاقيات النشطة: <strong className="text-indigo-700">{agreements.length} عقود</strong>
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {agreements.map(agr => {
            const isSelected = agr.id === selectedAgrId;
            const percent = Math.min(100, Math.round((agr.utilizedValueSar / agr.contractCeilingValueSar) * 100));

            return (
              <div
                key={agr.id}
                onClick={() => setSelectedAgrId(agr.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-900">{agr.contractNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    agr.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {agr.status === 'active' ? 'عقد ساري' : 'قارب على الانتهاء'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 mt-1.5">{agr.titleAr}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">المورد: {agr.supplierNameAr}</p>

                {/* Progress */}
                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>نسبة استهلاك السقف:</span>
                    <span className="font-mono font-bold">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percent > 85 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail (7 cols) */}
        <div className="lg:col-span-7">
          {selectedAgr ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">{selectedAgr.contractNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedAgr.agreementType === 'nupco_unified' ? 'عقد نوبكو موحد (NUPCO)' : 'اتفاقية إطارية مباشرة'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAgr.titleAr}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">المورد الشريك: <strong className="text-slate-800">{selectedAgr.supplierNameAr}</strong></p>
                </div>

                <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-100 shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block">سقف الالتزام المالي</span>
                  <span className="font-mono text-lg font-bold text-indigo-700">
                    {(selectedAgr.contractCeilingValueSar ?? 0).toLocaleString()} SAR
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    المتبقي: {(selectedAgr.remainingCeilingSar ?? 0).toLocaleString()} SAR
                  </span>
                </div>
              </div>

              {/* Term Dates & Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">تاريخ بدء العقد:</span>
                  <strong className="font-mono font-bold text-slate-800">{selectedAgr.startDate}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">تاريخ نهاية السريان:</span>
                  <strong className="font-mono font-bold text-slate-800">{selectedAgr.endDate}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">قيمة المسحوبات المعتمدة:</span>
                  <strong className="font-mono font-bold text-teal-700">{(selectedAgr.utilizedValueSar ?? 0).toLocaleString()} SAR</strong>
                </div>
              </div>

              {/* Price List Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  قائمة الأسعار التعاقدية الملزمة ({selectedAgr.priceList.length} صنف)
                </h4>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">رمز الصنف</th>
                        <th className="p-2.5">الوصف والمواصفات</th>
                        <th className="p-2.5">الوحدة</th>
                        <th className="p-2.5">السعر التعاقدي المعتمد</th>
                        <th className="p-2.5">حد السحب الأقصى</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedAgr.priceList.map(item => (
                        <tr key={item.itemCode}>
                          <td className="p-2.5 font-mono font-bold text-indigo-900">{item.itemCode}</td>
                          <td className="p-2.5 font-bold text-slate-900">{item.descriptionAr}</td>
                          <td className="p-2.5 text-slate-600">{item.contractedUom}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">
                            {item.contractedUnitPriceSar.toFixed(2)} SAR
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{item.maxQuantityAllowed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Associated Call-off Orders */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  أوامر السحب والتوريد التابعة (Call-off POs)
                </h4>
                <div className="space-y-2">
                  {selectedAgr.associatedPurchaseOrderIds.map(poId => (
                    <div key={poId} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">أمر شراء مسحوب: {poId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        معتمد سارٍ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              اختر اتفاقية إطارية لعرض تفاصيلها وقائمة الأسعار.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
